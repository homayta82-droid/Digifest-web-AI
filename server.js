import 'dotenv/config';
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import zlib from 'node:zlib';

const port = Number(process.env.PORT || 4173);
const root = process.cwd();
const apiKey = process.env.GEMINI_API_KEY;
const trustProxy = process.env.TRUST_PROXY === 'true';

// Model utama dari GEMINI_MODEL; bila ditolak API (404/400), coba cadangan berikut.
const fallbackModels = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];
const modelChain = [...new Set([(process.env.GEMINI_MODEL || '').trim(), ...fallbackModels].filter(Boolean))];
let activeModel = modelChain[0];
const modelName = activeModel;

const adminUser = process.env.ADMIN_USER || '';
const adminPass = process.env.ADMIN_PASSWORD || '';

async function getOfficialSchoolInfo() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Konfigurasi Supabase belum tersedia.');
  }

  const endpoint = new URL('/rest/v1/school_ai_info', supabaseUrl);
  endpoint.search = new URLSearchParams({ select: 'content', id: 'eq.true', limit: '1' }).toString();
  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: 'application/json'
    },
    signal: AbortSignal.timeout(8_000)
  });
  if (!response.ok) {
    throw new Error(`Supabase gagal memuat info Asisten AI (HTTP ${response.status}).`);
  }

  const records = await response.json();
  const content = Array.isArray(records) ? records[0]?.content : '';
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Info Asisten AI belum tersedia di Supabase.');
  }
  return content.trim().slice(0, 30_000);
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const compressibleTypes = new Set([
  'text/html; charset=utf-8',
  'text/css; charset=utf-8',
  'text/javascript; charset=utf-8',
  'application/json; charset=utf-8',
  'image/svg+xml'
]);

// Hanya path berikut yang boleh disajikan ke publik (server.js, package.json, data/ tidak ikut).
const publicRoots = ['assets', 'css', 'js', 'komponen', 'pages', 'admin'];
function isPublicPath(relativePath) {
  const clean = relativePath.replace(/\\/g, '/');
  if (clean === 'index.html') return true;
  const top = clean.split('/')[0];
  return publicRoots.includes(top);
}

// Cache hasil kompresi (kunci: path + mtime + encoding) agar tidak mengompres ulang tiap request.
const compressCache = new Map();
function compress(filePath, mtimeMs, encoding, raw) {
  const key = `${filePath}|${mtimeMs}|${encoding}`;
  let out = compressCache.get(key);
  if (!out) {
    out = encoding === 'br'
      ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })
      : zlib.gzipSync(raw, { level: 6 });
    if (compressCache.size > 300) compressCache.clear();
    compressCache.set(key, out);
  }
  return out;
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

const sendJson = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache'
  });
  res.end(JSON.stringify(body));
};

async function readJson(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  if (body.length > 10_000) throw new Error('Pesan terlalu panjang (maksimal 10 KB)');
  return JSON.parse(body || '{}');
}

// In-memory rate limiting: 10 requests / menit per IP
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 10;

  const record = rateLimitMap.get(ip) || [];
  const recent = record.filter((t) => now - t < windowMs);

  if (recent.length >= maxRequests) {
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Periodic cleanup if map grows
  if (rateLimitMap.size > 2000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (!v.some((t) => now - t < windowMs)) rateLimitMap.delete(k);
    }
  }

  return false;
}

// Basic Authentication helper for /admin
function checkAdminAuth(req) {
  if (!adminUser || !adminPass) return false;
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Basic ')) return false;
  try {
    const creds = Buffer.from(authHeader.slice(6), 'base64').toString('utf8');
    const idx = creds.indexOf(':');
    if (idx < 0) return false;
    const user = creds.slice(0, idx);
    const pass = creds.slice(idx + 1);
    return safeEqual(user, adminUser) && safeEqual(pass, adminPass);
  } catch {
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp = trustProxy && typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim() || req.socket.remoteAddress || 'unknown'
      : req.socket.remoteAddress || 'unknown';

    // 1. Config endpoint
    if (req.method === 'GET' && req.url === '/api/config') {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300' // cache 5 menit
      });
      return res.end(JSON.stringify({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
      }));
    }

    // 2. Chatbot AI endpoint
    if (req.method === 'POST' && req.url === '/api/chat') {
      if (isRateLimited(clientIp)) {
        return sendJson(res, 429, {
          error: 'Terlalu banyak pertanyaan dalam waktu singkat. Mohon tunggu 1 menit sebelum bertanya kembali.'
        });
      }

      if (!apiKey || apiKey.includes('your_gemini_api_key')) {
        return sendJson(res, 500, {
          error: 'Layanan AI saat ini belum dikonfigurasi oleh administrator sekolah.'
        });
      }

      const { message, history = [] } = await readJson(req);
      if (typeof message !== 'string' || !message.trim()) {
        return sendJson(res, 400, { error: 'Pertanyaan tidak boleh kosong.' });
      }

      const trimmedMessage = message.trim();
      if (trimmedMessage.length > 500) {
        return sendJson(res, 400, { error: 'Pertanyaan terlalu panjang. Gunakan maksimal 500 karakter.' });
      }
      let officialSchoolInfo;
      try {
        officialSchoolInfo = await getOfficialSchoolInfo();
      } catch (error) {
        console.error('Gagal memuat info resmi Asisten AI:', error?.message || error);
        return sendJson(res, 503, {
          error: 'Informasi Asisten AI belum tersedia. Hubungi administrator sekolah.'
        });
      }

      const systemPrompt = `Anda adalah asisten virtual resmi SMA Negeri 1 Singaraja (SMANSA Singaraja).
Tugas Anda memberikan jawaban yang singkat, ramah, akurat, dan sopan dalam Bahasa Indonesia.
Gunakan data resmi sekolah berikut sebagai rujukan utama:
${officialSchoolInfo}

Pedoman jawaban:
1. Jawab secara padat (1-3 paragraf singkat atau poin ringkas).
2. Format yang diperbolehkan: teks tebal (**kata**), daftar bernomor (1., 2.), atau daftar poin (- ).
3. Jika informasi yang ditanyakan belum tercantum atau tidak pasti, jangan mengarang. Katakan dengan jujur dan sarankan pengunjung menghubungi pihak sekolah melalui halaman Kontak: [Halaman Kontak](/pages/kontak/kontak.html) atau telepon (0362) 22144.`;

      const contents = Array.isArray(history)
        ? history.slice(-8).map((item) => ({
            role: item?.role === 'model' ? 'model' : 'user',
            // Hanya teks; abaikan field lain dari klien (mis. inlineData) dan batasi panjangnya.
            parts: [{ text: String(item?.parts?.[0]?.text ?? item?.text ?? '').slice(0, 1500) }]
          })).filter((item) => item.parts[0].text)
        : [];
      contents.push({ role: 'user', parts: [{ text: trimmedMessage }] });

      const payload = JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.35, // 0.3 - 0.4 agar konsisten dan tidak berhalusinasi
          maxOutputTokens: 600
        }
      });

      let response;
      let result;
      let networkFailure;
      const tryOrder = [activeModel, ...modelChain.filter((m) => m !== activeModel)];
      for (const candidate of tryOrder) {
        try {
          response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
              body: payload,
              signal: AbortSignal.timeout(12_000)
            }
          );
        } catch (networkError) {
          networkFailure = networkError;
          console.error(`Gemini connection error (${candidate}):`, networkError?.message || networkError);
          continue;
        }
        result = await response.json().catch(() => ({}));
        if (response.ok) { activeModel = candidate; break; }
        console.error(`Gemini API Error (${candidate}):`, response.status, result?.error?.message || result);
        // Continue to another configured model for model, quota, and upstream failures.
        if (![400, 404, 429].includes(response.status) && response.status < 500) break;
      }

      if (!response?.ok && !response && networkFailure) {
        return sendJson(res, 503, {
          error: 'Koneksi ke layanan AI sedang terganggu. Silakan coba kembali sebentar lagi.'
        });
      }

      if (response && !response.ok) {
        if (response.status === 429) {
          return sendJson(res, 503, {
            error: 'Layanan AI sedang sibuk. Silakan tunggu sebentar lalu coba kembali.'
          });
        }
        return sendJson(res, 502, {
          error: 'Layanan asisten AI sedang mengalami kendala. Silakan coba kembali beberapa saat lagi.'
        });
      }

      const rawReply = result.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
      if (!rawReply) {
        return sendJson(res, 502, {
          error: 'Asisten AI tidak dapat memproses jawaban untuk pertanyaan tersebut.'
        });
      }

      return sendJson(res, 200, { reply: rawReply });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return sendJson(res, 405, { error: 'Method tidak diizinkan' });
    }

    // 3. Static File Serving with Security, Compression & Caching
    const requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    let relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');

    // Proteksi /admin dengan Basic Auth
    const isAdminPath = requestPath === '/admin' || requestPath.startsWith('/admin/');
    if (isAdminPath) {
      if (Boolean(adminUser) !== Boolean(adminPass)) {
        res.writeHead(503, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store'
        });
        return res.end('Konfigurasi Basic Auth tidak lengkap. Isi ADMIN_USER dan ADMIN_PASSWORD, atau kosongkan keduanya untuk memakai login Supabase.');
      }
      if (adminUser && adminPass && !checkAdminAuth(req)) {
        res.writeHead(401, {
          'WWW-Authenticate': 'Basic realm="Admin SMANSA Singaraja"',
          'Content-Type': 'text/plain; charset=utf-8'
        });
        return res.end('Akses ditolak: Autentikasi diperlukan untuk membuka panel admin.');
      }
      if (requestPath === '/admin' || requestPath === '/admin/' || (requestPath.startsWith('/admin/') && !extname(requestPath))) {
        relativePath = 'admin/index.html';
      }
    }

    const filePath = normalize(join(root, relativePath));
    if (!filePath.startsWith(root + sep) || !isPublicPath(filePath.slice(root.length + 1))) {
      return sendJson(res, 403, { error: 'Akses ditolak' });
    }

    // Jangan sajikan file rahasia (.env, server.js internal files)
    const baseName = filePath.split(/[\\/]/).pop() || '';
    if (baseName.startsWith('.env') || baseName.endsWith('.log')) {
      return sendJson(res, 403, { error: 'Akses ditolak' });
    }

    let fileStat;
    try {
      fileStat = await stat(filePath);
    } catch {
      return sendJson(res, 404, { error: 'Halaman tidak ditemukan' });
    }

    if (fileStat.isDirectory()) {
      return sendJson(res, 404, { error: 'Halaman tidak ditemukan' });
    }

    const ext = extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Set Cache-Control header yang presisi
    let cacheControl = 'no-cache';
    if (['.webp', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff2'].includes(ext)) {
      cacheControl = 'public, max-age=31536000, immutable'; // 1 tahun untuk gambar/font
    } else if (['.css', '.js'].includes(ext)) {
      cacheControl = 'public, max-age=86400, stale-while-revalidate=604800'; // 1 hari + SWR 7 hari
    }

    const rawContent = await readFile(filePath);

    // Kompresi gzip/brotli untuk file teks/HTML/CSS/JS/SVG
    const acceptEncoding = req.headers['accept-encoding'] || '';
    let finalContent = rawContent;
    const responseHeaders = {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Vary': 'Accept-Encoding'
    };
    if (isAdminPath) responseHeaders['Cache-Control'] = 'private, no-store';

    if (compressibleTypes.has(contentType) && rawContent.length > 512) {
      if (acceptEncoding.includes('br')) {
        responseHeaders['Content-Encoding'] = 'br';
        finalContent = compress(filePath, fileStat.mtimeMs, 'br', rawContent);
      } else if (acceptEncoding.includes('gzip')) {
        responseHeaders['Content-Encoding'] = 'gzip';
        finalContent = compress(filePath, fileStat.mtimeMs, 'gzip', rawContent);
      }
    }

    responseHeaders['Content-Length'] = finalContent.length;
    res.writeHead(200, responseHeaders);
    res.end(req.method === 'HEAD' ? undefined : finalContent);
  } catch (error) {
    console.error('Request error:', error?.message || error);
    const status = error instanceof SyntaxError ? 400 : 500;
    sendJson(res, status, { error: status === 400 ? 'Format permintaan tidak valid' : 'Layanan sedang bermasalah' });
  }
});

server.listen(port, () => {
  console.log(`Website SMANSA aktif di: http://localhost:${port}`);
  console.log(`Model AI: ${modelName} (cadangan: ${modelChain.slice(1).join(', ') || '-'})`);
});
