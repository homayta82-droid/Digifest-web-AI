const TABLES = [
  { name: 'announcements', label: 'Pengumuman', route: 'pengumuman' },
  { name: 'news', label: 'Berita', route: 'berita' },
  { name: 'career_openings', label: 'Beasiswa', route: 'beasiswa' },
  { name: 'achievements', label: 'Prestasi', route: 'prestasi' },
  { name: 'teachers', label: 'Guru, Staf & Wakil Kepala Sekolah', route: 'guru' },
  { name: 'facilities', label: 'Fasilitas', route: 'fasilitas' },
  { name: 'galleries', label: 'Galeri', route: 'galeri' },
  { name: 'scs_contents', label: 'SCS - Karya & Kegiatan', route: 'scs' },
  { name: 'extracurriculars', label: 'Ekstrakurikuler', route: 'ekstrakurikuler' },
  { name: 'alumni', label: 'Alumni Inspiratif', route: 'alumni' }
];
const FORM_FIELDS = {
  announcements: [
    { name: 'title', label: 'Judul pengumuman', type: 'text', required: true },
    { name: 'category', label: 'Kategori', type: 'text', value: 'Umum' },
    { name: 'content', label: 'Subjudul dan detail pengumuman', type: 'textarea', required: true, wide: true, help: 'Baris pertama menjadi subjudul. Tulis detail mulai di baris berikutnya.' },
    { name: 'priority', label: 'Prioritas', type: 'select', value: 'high', options: [['low', 'Rendah'], ['medium', 'Sedang'], ['high', 'Tinggi']] },
    { name: 'start_date', label: 'Mulai ditampilkan', type: 'date', required: true, today: true },
    { name: 'end_date', label: 'Akhir ditampilkan', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', value: 'published', options: [['draft', 'Draft'], ['published', 'Terbit']] }
  ],
  news: [
    { name: 'title', label: 'Judul berita', type: 'text', required: true },
    { name: 'excerpt', label: 'Ringkasan', type: 'textarea', wide: true },
    { name: 'content', label: 'Isi berita', type: 'textarea', required: true, wide: true },
    { name: 'thumbnail_url', label: 'Gambar utama', type: 'image', wide: true },
    { name: 'status', label: 'Status', type: 'select', value: 'draft', options: [['draft', 'Draft'], ['published', 'Terbit']] },
    { name: 'published_at', label: 'Tanggal terbit', type: 'datetime-local' }
  ],
  achievements: [
    { name: 'title', label: 'Judul prestasi', type: 'text', required: true },
    { name: 'competition_name', label: 'Nama lomba / kegiatan', type: 'text' },
    { name: 'student_name', label: 'Nama siswa / tim', type: 'text' },
    { name: 'achievement_level', label: 'Peringkat / penghargaan', type: 'text' },
    { name: 'category', label: 'Tingkat prestasi', type: 'text' },
    { name: 'achievement_date', label: 'Tanggal prestasi', type: 'date', required: true },
    { name: 'image_url', label: 'Foto prestasi', type: 'image', wide: true }
  ],
  career_openings: [
    { name: 'title', label: 'Nama beasiswa', type: 'text', required: true },
    { name: 'category', label: 'Kategori beasiswa', type: 'select', required: true, value: 'prestasi', options: [['prestasi', 'Beasiswa Prestasi'], ['luar_negeri', 'Beasiswa Luar Negeri'], ['pemerintah', 'Beasiswa Pemerintah'], ['swasta', 'Beasiswa Institusi Swasta']] },
    { name: 'description', label: 'Keterangan beasiswa', type: 'textarea', wide: true },
    { name: 'organizer', label: 'Penyelenggara', type: 'text', required: true },
    { name: 'image_url', label: 'Foto beasiswa', type: 'image', wide: true },
    { name: 'deadline', label: 'Tenggat pendaftaran', type: 'date' },
    { name: 'counseling_schedule', label: 'Jadwal konseling (opsional)', type: 'textarea', wide: true },
    { name: 'status', label: 'Status', type: 'select', value: 'published', options: [['draft', 'Draft'], ['published', 'Terbit']] },
    { name: 'sort_order', label: 'Urutan tampil', type: 'number', value: '0' }
  ],
  teachers: [
    { name: 'name', label: 'Nama lengkap', type: 'text', required: true },
    { name: 'subject', label: 'Mata pelajaran', type: 'text' },
    { name: 'position', label: 'Jabatan', type: 'select', required: true, options: [['', 'Pilih jabatan'], ['Guru', 'Guru'], ['Staf', 'Staf'], ['Pegawai', 'Pegawai'], ['Wakil Kepala Bidang Humas', 'Wakil Kepala Bidang Humas'], ['Wakil Kepala Bidang Sarana dan Prasarana', 'Wakil Kepala Bidang Sarana dan Prasarana'], ['Wakil Kepala Bidang Kesiswaan', 'Wakil Kepala Bidang Kesiswaan'], ['Wakil Kepala Bidang Kurikulum', 'Wakil Kepala Bidang Kurikulum']] },
    { name: 'photo_url', label: 'Foto guru / wakil kepala', type: 'image', wide: true },
    { name: 'sort_order', label: 'Urutan tampil', type: 'number', value: '0', help: 'Angka lebih kecil ditampilkan lebih dahulu.' }
  ],
  facilities: [
    { name: 'name', label: 'Nama fasilitas', type: 'text', required: true },
    { name: 'description', label: 'Deskripsi', type: 'textarea', wide: true },
    { name: 'image_url', label: 'Foto fasilitas', type: 'image', wide: true },
    { name: 'sort_order', label: 'Urutan tampil', type: 'number', value: '0' }
  ],
  galleries: [
    { name: 'title', label: 'Judul foto', type: 'text', required: true },
    { name: 'event_date', label: 'Tanggal kegiatan', type: 'date' },
    { name: 'description', label: 'Keterangan', type: 'textarea', wide: true },
    { name: 'image_url', label: 'Foto galeri', type: 'image', wide: true }
  ],
  scs_contents: [
    { name: 'title', label: 'Judul konten', type: 'text', required: true },
    { name: 'section', label: 'Bagian SCS', type: 'select', required: true, value: 'project', options: [['hero', 'Carousel utama'], ['project', 'Proyek unggulan'], ['information', 'Informasi terbaru'], ['spotlight', 'Sorotan Smansa']] },
    { name: 'category', label: 'Kategori', type: 'text', value: 'Kegiatan' },
    { name: 'description', label: 'Deskripsi', type: 'textarea', wide: true },
    { name: 'image_url', label: 'Foto konten', type: 'image', wide: true },
    { name: 'event_date', label: 'Tanggal kegiatan', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', value: 'draft', options: [['draft', 'Draft'], ['published', 'Terbit']] },
    { name: 'sort_order', label: 'Urutan tampil', type: 'number', value: '0' }
  ],
  extracurriculars: [
    { name: 'name', label: 'Nama ekstrakurikuler', type: 'text', required: true },
    { name: 'category', label: 'Kategori', type: 'text', value: 'Nonakademik' },
    { name: 'description', label: 'Deskripsi', type: 'textarea', wide: true },
    { name: 'image_url', label: 'Foto kegiatan', type: 'image', wide: true }
  ],
  alumni: [
    { name: 'name', label: 'Nama alumni', type: 'text', required: true },
    { name: 'graduation_year', label: 'Tahun lulus', type: 'number', required: true },
    { name: 'field', label: 'Bidang', type: 'text' },
    { name: 'current_occupation', label: 'Profesi saat ini', type: 'text' },
    { name: 'summary', label: 'Ringkasan profil', type: 'textarea', wide: true },
    { name: 'story', label: 'Cerita alumni', type: 'textarea', wide: true },
    { name: 'achievements', label: 'Prestasi (satu per baris)', type: 'list', wide: true },
    { name: 'message', label: 'Pesan untuk siswa', type: 'textarea', wide: true },
    { name: 'photo_url', label: 'Foto alumni', type: 'image', wide: true },
    { name: 'is_featured', label: 'Alumni inspiratif', type: 'checkbox' }
  ]
};
const STORAGE_BUCKET = 'smansa-media';
const SESSION_KEY = 'smansa-admin-session';
const AI_INFO_TABLE = 'school_ai_info';
const AI_INFO_ROUTE = 'info-asisten-ai';
const app = document.querySelector('#admin-app');
const loginScreen = document.querySelector('#admin-login');
const state = { config: null, session: null, user: null, table: null, rows: [], counts: {}, aiInfo: null, error: '' };

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function labelFor(name) {
  return TABLES.find((table) => table.name === name)?.label || name;
}

function savedSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

function storeSession(session, user) {
  state.session = session;
  state.user = user;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  state.session = null;
  state.user = null;
  state.table = null;
  state.rows = [];
  state.aiInfo = null;
}

function authHeaders(token) {
  return {
    apikey: state.config.key,
    Authorization: `Bearer ${token || state.config.key}`,
    'Content-Type': 'application/json'
  };
}

async function responseJson(response) {
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { message: text }; }
  if (!response.ok) throw new Error(body.msg || body.message || body.error_description || body.error || `Permintaan gagal (HTTP ${response.status})`);
  return body;
}

async function authRequest(path, body) {
  const response = await fetch(`${state.config.url}/auth/v1/${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  return responseJson(response);
}

function isAdmin(user) {
  return user?.app_metadata?.role === 'admin';
}

async function refreshSession(session) {
  if (!session?.refresh_token) return null;
  const refreshed = await authRequest('token?grant_type=refresh_token', { refresh_token: session.refresh_token });
  if (!isAdmin(refreshed.user)) throw new Error('Akun ini tidak memiliki akses admin.');
  const nextSession = {
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + Number(refreshed.expires_in || 3600)
  };
  storeSession(nextSession, refreshed.user);
  return nextSession;
}

async function ensureFreshSession() {
  let session = state.session;
  if (!session) throw new Error('Sesi berakhir. Silakan masuk kembali.');
  if (Number(session.expires_at || 0) <= Math.floor(Date.now() / 1000) + 60) {
    session = await refreshSession(session);
    if (!session) throw new Error('Sesi berakhir. Silakan masuk kembali.');
  }
  return session;
}

async function verifySession(session) {
  try {
    const response = await fetch(`${state.config.url}/auth/v1/user`, { headers: authHeaders(session.access_token) });
    const user = await responseJson(response);
    if (!isAdmin(user)) return false;
    storeSession(session, user);
    return true;
  } catch {
    try { return Boolean(await refreshSession(session)); }
    catch { return false; }
  }
}

function renderLogin(message = '') {
  loginScreen.hidden = false;
  app.hidden = true;
  document.querySelector('#login-form').reset();
  document.querySelector('#login-message').textContent = message;
  const button = document.querySelector('#login-form button[type="submit"]');
  button.disabled = false;
  button.textContent = 'Masuk';
}

async function login(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const message = document.querySelector('#login-message');
  button.disabled = true;
  button.textContent = 'Memeriksa akun...';
  message.textContent = '';
  try {
    const result = await authRequest('token?grant_type=password', {
      email: form.email.value.trim(),
      password: form.password.value
    });
    if (!isAdmin(result.user)) throw new Error('Login berhasil, tetapi akun belum memiliki role admin. Minta pengelola sistem menetapkan app_metadata.role = admin.');
    storeSession({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + Number(result.expires_in || 3600)
    }, result.user);
    renderShell();
    await routeFromLocation();
  } catch (error) {
    message.textContent = error.message || 'Tidak dapat masuk. Periksa koneksi dan akun.';
    button.disabled = false;
    button.textContent = 'Masuk';
  }
}

document.querySelector('#login-form').addEventListener('submit', login);

function renderShell() {
  const activeTable = state.table || '';
  loginScreen.hidden = true;
  app.hidden = false;
  app.innerHTML = `
    <div class="admin-shell">
      <aside class="sidebar">
        <div class="sidebar-brand">SMANSA <small>Admin Website</small></div>
        <div class="nav-label">Konten website</div>
        <nav class="admin-nav" aria-label="Kelola konten">
          <button class="nav-item ${activeTable ? '' : 'is-active'}" data-overview type="button">Ringkasan</button>
          ${TABLES.map((table) => `<button class="nav-item ${table.name === activeTable ? 'is-active' : ''}" data-table="${table.name}" type="button">${escapeHtml(table.label)}</button>`).join('')}
          <button class="nav-item ${activeTable === AI_INFO_TABLE ? 'is-active' : ''}" data-ai-info type="button">Info Asisten AI</button>
        </nav>
        <div class="sidebar-bottom"><div class="admin-user">${escapeHtml(state.user?.email || 'Pengelola')}</div><button class="nav-item" id="sign-out" type="button">Keluar</button></div>
      </aside>
      <section class="admin-main">
        <header class="topbar"><span class="topbar-title">Panel pengelolaan</span><a class="topbar-link" href="/">Lihat website</a></header>
        <main class="content" id="admin-content"></main>
      </section>
    </div>`;
  app.querySelectorAll('[data-table]').forEach((button) => button.addEventListener('click', () => selectTable(button.dataset.table)));
  app.querySelector('[data-ai-info]').addEventListener('click', () => selectAiInfo());
  app.querySelector('[data-overview]').addEventListener('click', () => navigateToOverview());
  document.querySelector('#sign-out').addEventListener('click', signOut);
  renderContent();
}

function renderContent() {
  if (!state.table) {
    const counts = Object.values(state.counts);
    const total = counts.some((count) => count === null) ? '—' : counts.reduce((sum, count) => sum + count, 0);
    document.querySelector('#admin-content').innerHTML = `
      <div class="page-heading"><div><h1>Ringkasan</h1><p>Ikhtisar konten yang tersimpan.</p></div></div>
      <div class="stat-row">
        <div class="stat"><span>Total data terhitung</span><strong>${total}</strong></div>
        <div class="stat"><span>Jenis konten</span><strong>${TABLES.length + 1}</strong></div>
        <div class="stat"><span>Status akses</span><strong>Admin</strong></div>
      </div>
      <section class="panel"><div class="panel-heading"><div><h2>Kelola konten</h2><p>Pilih jenis konten untuk melihat dan mengubah datanya.</p></div></div>
        <div class="table-shortcuts">${TABLES.map((table) => `<button class="shortcut" data-table="${table.name}" type="button"><span>${escapeHtml(table.label)}</span><strong>${state.counts[table.name] ?? '—'}</strong></button>`).join('')}<button class="shortcut" data-ai-info type="button"><span>Info Asisten AI</span><strong>${state.counts[AI_INFO_TABLE] ?? '—'}</strong></button></div>
      </section>`;
    document.querySelectorAll('#admin-content [data-table]').forEach((button) => button.addEventListener('click', () => selectTable(button.dataset.table)));
    document.querySelector('#admin-content [data-ai-info]').addEventListener('click', () => selectAiInfo());
    return;
  }
  if (state.table === AI_INFO_TABLE) {
    renderAiInfoContent();
    return;
  }
  const rows = state.rows;
  document.querySelector('#admin-content').innerHTML = `
    <div class="page-heading">
      <div><h1>${escapeHtml(labelFor(state.table))}</h1><p>Kelola data ${escapeHtml(labelFor(state.table).toLowerCase())} website.</p></div>
      <button class="button button-primary" id="add-record" type="button">Tambah data</button>
    </div>
    ${state.error ? `<div class="notice" role="alert">${escapeHtml(state.error)}</div>` : ''}
    <div class="stat-row">
      <div class="stat"><span>Data pada halaman ini</span><strong>${rows.length}</strong></div>
      <div class="stat"><span>Tabel aktif</span><strong>${escapeHtml(state.table)}</strong></div>
      <div class="stat"><span>Status akses</span><strong>Admin</strong></div>
    </div>
    <section class="panel">
      <div class="panel-heading"><div><h2>Daftar data</h2><p>Maksimal 100 data terbaru berdasarkan urutan</p></div><button class="button button-secondary" id="refresh-records" type="button">Muat ulang</button></div>
      <div class="table-wrap">
        ${rows.length ? `<table class="records"><thead><tr><th>ID</th><th>Ringkasan</th><th>Tindakan</th></tr></thead><tbody>${rows.map((row) => {
          const summary = state.table === 'teachers'
            ? [row.name || row.nama || 'Guru', row.position || row.subject].filter(Boolean).join(' · ')
            : row.title || row.name || row.nama || row.judul || row.email || JSON.stringify(row);
          const canEdit = row.id !== undefined && row.id !== null;
          return `<tr><td class="record-id" title="${escapeHtml(row.id ?? 'ID tidak ditemukan')}">${escapeHtml(row.id ?? 'Tanpa ID')}</td><td class="record-summary" title="${escapeHtml(summary)}">${escapeHtml(summary)}</td><td><div class="row-actions"><button class="button button-secondary" data-edit="${escapeHtml(row.id ?? '')}" type="button" ${canEdit ? '' : 'disabled'}>Edit</button><button class="button button-danger" data-delete="${escapeHtml(row.id ?? '')}" type="button" ${canEdit ? '' : 'disabled'}>Hapus</button></div></td></tr>`;
        }).join('')}</tbody></table>` : '<div class="empty-state">Belum ada data yang dapat ditampilkan. Tambahkan data baru.</div>'}
      </div>
    </section>`;
  document.querySelector('#add-record').addEventListener('click', () => openEditor(null));
  document.querySelector('#refresh-records').addEventListener('click', () => selectTable(state.table));
  document.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => {
    const row = rows.find((item) => String(item.id) === button.dataset.edit);
    if (row) openEditor(row);
  }));
  document.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => deleteRecord(button.dataset.delete)));
}

function renderAiInfoContent() {
  const content = document.querySelector('#admin-content');
  const isLoading = state.aiInfo === null && !state.error;
  const isReady = state.aiInfo !== null;
  content.innerHTML = `
    <div class="page-heading"><div><h1>Info Asisten AI</h1><p>Perbarui informasi sekolah yang digunakan Asisten AI saat menjawab pertanyaan.</p></div></div>
    ${state.error ? `<div class="notice" role="alert">${escapeHtml(state.error)}</div>` : ''}
    <section class="panel ai-info-panel">
      <div class="panel-heading"><div><h2>Sumber informasi sekolah</h2><p>Perubahan tersimpan akan digunakan pada pertanyaan berikutnya.</p></div></div>
      <form id="ai-info-form" class="ai-info-form">
        <label for="ai-info-content">Informasi untuk Asisten AI</label>
        <p class="field-help">Gunakan judul dan bagian yang jelas. Masukkan hanya informasi yang sudah dipastikan benar, serta perbarui informasi yang berubah seperti jadwal SPMB.</p>
        <textarea id="ai-info-content" class="form-control form-textarea ai-info-textarea" maxlength="30000" rows="24" ${isReady ? '' : 'disabled'} required>${escapeHtml(state.aiInfo?.content || '')}</textarea>
        <div class="ai-info-footer"><span id="ai-info-count">${(state.aiInfo?.content || '').length.toLocaleString('id-ID')} / 30.000 karakter</span><div class="ai-info-actions"><span id="ai-info-status" role="status" aria-live="polite"></span><button class="button button-primary" id="save-ai-info" type="submit" ${isReady ? '' : 'disabled'}>${isLoading ? 'Memuat...' : 'Simpan informasi'}</button></div></div>
      </form>
    </section>`;

  const textarea = content.querySelector('#ai-info-content');
  textarea.addEventListener('input', () => {
    content.querySelector('#ai-info-count').textContent = `${textarea.value.length.toLocaleString('id-ID')} / 30.000 karakter`;
  });
  content.querySelector('#ai-info-form').addEventListener('submit', saveAiInfo);
}

async function selectTable(table, { updateUrl = true } = {}) {
  if (!TABLES.some((item) => item.name === table)) return;
  if (updateUrl) history.pushState({}, '', `/admin/${TABLES.find((item) => item.name === table).route}`);
  state.table = table;
  state.error = '';
  if (state.session) renderShell();
  else renderContent();
  try {
    const session = await ensureFreshSession();
    const query = new URLSearchParams({ select: '*', limit: '100' });
    const response = await fetch(`${state.config.url}/rest/v1/${encodeURIComponent(table)}?${query}`, {
      headers: authHeaders(session.access_token), cache: 'no-store'
    });
    state.rows = await responseJson(response);
    if (!Array.isArray(state.rows)) state.rows = [];
  } catch (error) {
    state.rows = [];
    state.error = error.message || 'Gagal memuat data.';
    if (/JWT|token|sesi berakhir|401/i.test(state.error)) {
      clearSession();
      renderLogin('Sesi berakhir. Silakan masuk kembali.');
      return;
    }
  }
  renderShell();
}

async function selectAiInfo({ updateUrl = true } = {}) {
  if (updateUrl) history.pushState({}, '', `/admin/${AI_INFO_ROUTE}`);
  state.table = AI_INFO_TABLE;
  state.rows = [];
  state.aiInfo = null;
  state.error = '';
  renderShell();

  try {
    const session = await ensureFreshSession();
    const query = new URLSearchParams({ select: 'content,updated_at', id: 'eq.true', limit: '1' });
    const response = await fetch(`${state.config.url}/rest/v1/${AI_INFO_TABLE}?${query}`, {
      headers: authHeaders(session.access_token), cache: 'no-store'
    });
    const records = await responseJson(response);
    if (!Array.isArray(records) || !records[0]) {
      throw new Error('Data awal belum tersedia. Jalankan data/school-ai-info-schema.sql di Supabase SQL Editor.');
    }
    state.aiInfo = records[0];
  } catch (error) {
    state.error = error.message || 'Gagal memuat informasi Asisten AI.';
    if (/JWT|token|sesi berakhir|401/i.test(state.error)) {
      clearSession();
      renderLogin('Sesi berakhir. Silakan masuk kembali.');
      return;
    }
  }
  renderShell();
}

async function saveAiInfo(event) {
  event.preventDefault();
  const content = document.querySelector('#ai-info-content');
  const button = document.querySelector('#save-ai-info');
  const status = document.querySelector('#ai-info-status');
  const value = content.value.trim();
  if (!value) {
    status.textContent = 'Informasi tidak boleh kosong.';
    content.focus();
    return;
  }

  button.disabled = true;
  button.textContent = 'Menyimpan...';
  status.textContent = '';
  try {
    const session = await ensureFreshSession();
    const query = new URLSearchParams({ id: 'eq.true', select: 'content,updated_at' });
    const response = await fetch(`${state.config.url}/rest/v1/${AI_INFO_TABLE}?${query}`, {
      method: 'PATCH',
      headers: { ...authHeaders(session.access_token), Prefer: 'return=representation' },
      body: JSON.stringify({ content: value, updated_at: new Date().toISOString() })
    });
    const records = await responseJson(response);
    if (!Array.isArray(records) || !records[0]) {
      throw new Error('Informasi tidak tersimpan karena data awal tidak ditemukan. Jalankan skrip SQL inisialisasi di Supabase.');
    }
    state.aiInfo = records[0];
    status.textContent = 'Informasi berhasil disimpan.';
  } catch (error) {
    status.textContent = error.message || 'Informasi gagal disimpan. Periksa koneksi dan kebijakan RLS.';
  } finally {
    button.disabled = false;
    button.textContent = 'Simpan informasi';
  }
}

function navigateToOverview() {
  history.pushState({}, '', '/admin');
  state.table = null;
  state.error = '';
  state.counts = {};
  renderShell();
  loadOverview();
}

async function loadOverview() {
  try {
    const session = await ensureFreshSession();
    await Promise.all(TABLES.map(async (table) => {
      try {
        const query = new URLSearchParams({ select: '*', limit: '0' });
        const response = await fetch(`${state.config.url}/rest/v1/${encodeURIComponent(table.name)}?${query}`, {
          headers: { ...authHeaders(session.access_token), Prefer: 'count=exact' }, cache: 'no-store'
        });
        await responseJson(response);
        const count = response.headers.get('content-range')?.split('/').pop();
        state.counts[table.name] = count && count !== '*' ? Number(count) : null;
      } catch {
        state.counts[table.name] = null;
      }
    }));
    try {
      const query = new URLSearchParams({ select: '*', limit: '0' });
      const response = await fetch(`${state.config.url}/rest/v1/${AI_INFO_TABLE}?${query}`, {
        headers: { ...authHeaders(session.access_token), Prefer: 'count=exact' }, cache: 'no-store'
      });
      await responseJson(response);
      const count = response.headers.get('content-range')?.split('/').pop();
      state.counts[AI_INFO_TABLE] = count && count !== '*' ? Number(count) : null;
    } catch {
      state.counts[AI_INFO_TABLE] = null;
    }
  } catch (error) {
    if (/JWT|token|sesi berakhir|401/i.test(error.message || '')) {
      clearSession();
      renderLogin('Sesi berakhir. Silakan masuk kembali.');
      return;
    }
  }
  renderShell();
}

async function routeFromLocation() {
  const route = window.location.pathname.replace(/^\/admin\/?/, '');
  if (route === AI_INFO_ROUTE) return selectAiInfo({ updateUrl: false });
  const table = TABLES.find((item) => item.route === route);
  if (table) return selectTable(table.name, { updateUrl: false });
  if (route) history.replaceState({}, '', '/admin');
  state.table = null;
  state.counts = {};
  renderShell();
  return loadOverview();
}

function displayFieldValue(field, record) {
  const value = record?.[field.name] ?? field.value ?? (field.today ? new Date().toISOString().slice(0, 10) : '');
  if (field.type === 'list' && Array.isArray(value)) return value.join('\n');
  if (field.type === 'datetime-local' && value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
      return localDate.toISOString().slice(0, 16);
    }
  }
  if (field.type === 'date' && value) return String(value).slice(0, 10);
  return value;
}

function renderField(field, record) {
  const id = `record-${field.name}`;
  const value = displayFieldValue(field, record);
  const required = field.required ? 'required' : '';
  const wrapperClass = `form-field${field.wide ? ' form-field-wide' : ''}`;
  if (field.type === 'image') {
    const preview = value
      ? `<img src="${escapeHtml(value)}" alt="Pratinjau gambar" data-image-preview-image><span data-image-preview-empty hidden>Pratinjau gambar</span>`
      : '<img alt="Pratinjau gambar" data-image-preview-image hidden><span data-image-preview-empty>Pratinjau gambar</span>';
    return `<div class="${wrapperClass}"><label>${escapeHtml(field.label)}</label><div class="image-upload"><div class="image-preview" data-image-preview>${preview}</div><div class="image-upload-controls"><input type="hidden" name="${field.name}" value="${escapeHtml(value)}"><label class="upload-button" for="${id}"><input id="${id}" type="file" accept="image/jpeg,image/png,image/webp" data-image-field="${field.name}">Pilih gambar</label><span class="field-help">JPG, PNG, atau WebP, maksimal 8 MB.</span><span class="upload-status" data-upload-status="${field.name}" role="status"></span></div></div></div>`;
  }
  if (field.type === 'checkbox') {
    return `<div class="${wrapperClass} form-field-checkbox"><label class="checkbox-label" for="${id}"><input id="${id}" type="checkbox" name="${field.name}" ${value ? 'checked' : ''}><span>${escapeHtml(field.label)}</span></label></div>`;
  }
  if (field.type === 'textarea') {
    return `<div class="${wrapperClass}"><label for="${id}">${escapeHtml(field.label)}${field.required ? ' <span aria-hidden="true">*</span>' : ''}</label><textarea class="form-control form-textarea" id="${id}" name="${field.name}" rows="5" ${required}>${escapeHtml(value)}</textarea>${field.help ? `<span class="field-help">${escapeHtml(field.help)}</span>` : ''}</div>`;
  }
  if (field.type === 'list') {
    return `<div class="${wrapperClass}"><label for="${id}">${escapeHtml(field.label)}</label><textarea class="form-control form-textarea" id="${id}" name="${field.name}" rows="4" placeholder="Contoh: Juara 1 Olimpiade Sains">${escapeHtml(value)}</textarea><span class="field-help">Setiap baris akan disimpan sebagai satu butir prestasi.</span></div>`;
  }
  if (field.type === 'select') {
    const options = field.options.some(([optionValue]) => String(optionValue) === String(value))
      ? field.options
      : [[value, `${value} (tersimpan)`], ...field.options];
    return `<div class="${wrapperClass}"><label for="${id}">${escapeHtml(field.label)}${field.required ? ' <span aria-hidden="true">*</span>' : ''}</label><select class="form-control form-select" id="${id}" name="${field.name}" ${required}>${options.map(([optionValue, optionLabel]) => `<option value="${escapeHtml(optionValue)}" ${String(value) === String(optionValue) ? 'selected' : ''}>${escapeHtml(optionLabel)}</option>`).join('')}</select></div>`;
  }
  return `<div class="${wrapperClass}"><label for="${id}">${escapeHtml(field.label)}${field.required ? ' <span aria-hidden="true">*</span>' : ''}</label><input class="form-control" id="${id}" name="${field.name}" type="${field.type}" value="${escapeHtml(value)}" ${field.type === 'number' ? 'step="1"' : ''} ${required}>${field.help ? `<span class="field-help">${escapeHtml(field.help)}</span>` : ''}</div>`;
}

function openEditor(row) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <div class="modal-heading"><div><h2 id="editor-title">${row ? 'Edit' : 'Tambah'} ${escapeHtml(labelFor(state.table).toLowerCase())}</h2><p>Isi kolom berikut. Tanda * wajib diisi.</p></div><button class="icon-close" id="close-editor" type="button" aria-label="Tutup">×</button></div>
      <form id="record-form" novalidate><div class="form-grid">${FORM_FIELDS[state.table].map((field) => renderField(field, row)).join('')}</div>
        <div class="message" id="editor-message" role="alert"></div>
        <div class="modal-actions"><button class="button button-secondary" id="cancel-editor" type="button">Batal</button><button class="button button-primary" id="save-record" type="submit">${row ? 'Simpan perubahan' : 'Tambah data'}</button></div>
      </form>
    </section>`;
  document.body.append(backdrop);
  const close = () => backdrop.remove();
  backdrop.querySelector('#cancel-editor').addEventListener('click', close);
  backdrop.querySelector('#close-editor').addEventListener('click', close);
  backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
  backdrop.querySelector('#record-form').addEventListener('submit', (event) => {
    event.preventDefault();
    saveRecord(row, backdrop);
  });
  backdrop.querySelectorAll('[data-image-field]').forEach((input) => input.addEventListener('change', () => uploadImage(input, backdrop)));
}

function openImageCropper(file) {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const cropper = document.createElement('div');
    cropper.className = 'cropper-backdrop';
    cropper.innerHTML = `
      <section class="cropper-dialog" role="dialog" aria-modal="true" aria-labelledby="cropper-title">
        <div class="modal-heading"><h2 id="cropper-title">Sesuaikan foto</h2><button class="icon-close" type="button" data-crop-cancel aria-label="Tutup">×</button></div>
        <div class="cropper-stage" data-crop-stage><img alt="" draggable="false"></div>
        <label class="cropper-zoom">Zoom<input type="range" min="1" max="3" step="0.01" value="1" data-crop-zoom></label>
        <div class="modal-actions"><button class="button button-secondary" type="button" data-crop-cancel>Batal</button><button class="button button-primary" type="button" data-crop-confirm>Gunakan foto</button></div>
      </section>`;
    document.body.append(cropper);

    const stage = cropper.querySelector('[data-crop-stage]');
    const image = cropper.querySelector('img');
    const zoomControl = cropper.querySelector('[data-crop-zoom]');
    let stageWidth = 0;
    let stageHeight = 0;
    let baseScale = 1;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let dragStart = null;
    let settled = false;

    const cleanup = (result, error) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(sourceUrl);
      cropper.remove();
      if (error) reject(error);
      else resolve(result);
    };
    const clampOffsets = () => {
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      offsetX = Math.min(0, Math.max(stageWidth - width, offsetX));
      offsetY = Math.min(0, Math.max(stageHeight - height, offsetY));
      image.style.left = `${offsetX}px`;
      image.style.top = `${offsetY}px`;
    };
    const updateScale = (preserveCenter = false) => {
      const centerX = preserveCenter ? (stageWidth / 2 - offsetX) / scale : image.naturalWidth / 2;
      const centerY = preserveCenter ? (stageHeight / 2 - offsetY) / scale : image.naturalHeight / 2;
      scale = baseScale * Number(zoomControl.value);
      image.style.width = `${image.naturalWidth * scale}px`;
      image.style.height = `${image.naturalHeight * scale}px`;
      offsetX = stageWidth / 2 - centerX * scale;
      offsetY = stageHeight / 2 - centerY * scale;
      clampOffsets();
    };

    image.onload = () => {
      const bounds = stage.getBoundingClientRect();
      stageWidth = bounds.width;
      stageHeight = bounds.height;
      baseScale = Math.max(stageWidth / image.naturalWidth, stageHeight / image.naturalHeight);
      updateScale();
    };
    image.onerror = () => cleanup(null, new Error('Foto tidak dapat dibuka. Pilih file gambar lain.'));
    image.src = sourceUrl;
    zoomControl.addEventListener('input', () => updateScale(true));
    stage.addEventListener('pointerdown', (event) => {
      dragStart = { x: event.clientX, y: event.clientY, offsetX, offsetY };
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener('pointermove', (event) => {
      if (!dragStart) return;
      offsetX = dragStart.offsetX + event.clientX - dragStart.x;
      offsetY = dragStart.offsetY + event.clientY - dragStart.y;
      clampOffsets();
    });
    stage.addEventListener('pointerup', () => { dragStart = null; });
    stage.addEventListener('pointercancel', () => { dragStart = null; });
    cropper.querySelectorAll('[data-crop-cancel]').forEach((button) => button.addEventListener('click', () => cleanup(null)));
    cropper.addEventListener('click', (event) => { if (event.target === cropper) cleanup(null); });
    cropper.addEventListener('keydown', (event) => { if (event.key === 'Escape') cleanup(null); });
    cropper.querySelector('[data-crop-confirm]').addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 900;
      const context = canvas.getContext('2d');
      const sourceX = -offsetX / scale;
      const sourceY = -offsetY / scale;
      const sourceWidth = stageWidth / scale;
      const sourceHeight = stageHeight / scale;
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) cleanup(blob);
        else cleanup(null, new Error('Foto gagal diproses. Coba file gambar lain.'));
      }, file.type, file.type === 'image/jpeg' ? 0.92 : undefined);
    });
  });
}

async function uploadImage(input, modal) {
  const file = input.files?.[0];
  if (!file) return;
  const status = modal.querySelector(`[data-upload-status="${input.dataset.imageField}"]`);
  const hidden = modal.querySelector(`[name="${input.dataset.imageField}"]`);
  const preview = input.closest('.image-upload').querySelector('[data-image-preview]');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
    status.textContent = 'Pilih gambar JPG, PNG, atau WebP maksimal 8 MB.';
    input.value = '';
    return;
  }
  status.textContent = 'Menyiapkan foto...';
  input.disabled = true;
  try {
    const croppedImage = await openImageCropper(file);
    if (!croppedImage) {
      status.textContent = 'Pemotongan foto dibatalkan.';
      return;
    }
    status.textContent = 'Mengunggah gambar...';
    const session = await ensureFreshSession();
    const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[croppedImage.type];
    const path = `${state.table}/${crypto.randomUUID()}.${extension}`;
    const objectPath = path.split('/').map(encodeURIComponent).join('/');
    const response = await fetch(`${state.config.url}/storage/v1/object/${STORAGE_BUCKET}/${objectPath}`, {
      method: 'POST',
      headers: { apikey: state.config.key, Authorization: `Bearer ${session.access_token}`, 'Content-Type': croppedImage.type, 'x-upsert': 'false' },
      body: croppedImage
    });
    await responseJson(response);
    const publicUrl = `${state.config.url}/storage/v1/object/public/${STORAGE_BUCKET}/${objectPath}`;
    hidden.value = publicUrl;
    preview.innerHTML = `<img src="${escapeHtml(publicUrl)}" alt="Pratinjau gambar">`;
    status.textContent = 'Gambar berhasil diunggah.';
  } catch (error) {
    status.textContent = error.message || 'Gambar gagal diunggah. Periksa bucket dan policy Storage.';
  } finally {
    input.disabled = false;
    input.value = '';
  }
}

async function saveRecord(existing, modal) {
  const form = modal.querySelector('#record-form');
  const button = modal.querySelector('#save-record');
  const message = modal.querySelector('#editor-message');
  if (!form.reportValidity()) return;
  const record = {};
  for (const field of FORM_FIELDS[state.table]) {
    const input = form.elements.namedItem(field.name);
    if (field.type === 'checkbox') {
      record[field.name] = input.checked;
      continue;
    }
    let value = input.value.trim();
    if (field.type === 'list') {
      const entries = value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
      if (entries.length || existing) record[field.name] = entries;
      continue;
    }
    if (!value) {
      if (existing) record[field.name] = null;
      continue;
    }
    if (field.type === 'number') value = Number(value);
    if (field.type === 'datetime-local') value = new Date(value).toISOString();
    record[field.name] = value;
  }
  if (state.table === 'news' && record.status === 'published' && !record.published_at) record.published_at = new Date().toISOString();
  button.disabled = true;
  button.textContent = 'Menyimpan...';
  message.textContent = '';
  try {
    const session = await ensureFreshSession();
    const endpoint = `${state.config.url}/rest/v1/${encodeURIComponent(state.table)}`;
    const url = existing ? `${endpoint}?id=eq.${encodeURIComponent(existing.id)}` : endpoint;
    const response = await fetch(url, {
      method: existing ? 'PATCH' : 'POST',
      headers: { ...authHeaders(session.access_token), Prefer: 'return=representation' },
      body: JSON.stringify(record)
    });
    await responseJson(response);
    modal.remove();
    await selectTable(state.table);
  } catch (error) {
    message.textContent = error.message || 'Data gagal disimpan. Periksa skema dan kebijakan RLS.';
    button.disabled = false;
    button.textContent = existing ? 'Simpan perubahan' : 'Tambah data';
  }
}

async function deleteRecord(id) {
  const row = state.rows.find((item) => String(item.id) === String(id));
  if (!row || !window.confirm(`Hapus data "${row.title || row.name || row.nama || id}"? Tindakan ini tidak dapat dibatalkan.`)) return;
  try {
    const session = await ensureFreshSession();
    const url = `${state.config.url}/rest/v1/${encodeURIComponent(state.table)}?id=eq.${encodeURIComponent(id)}`;
    const response = await fetch(url, { method: 'DELETE', headers: authHeaders(session.access_token) });
    await responseJson(response);
    await selectTable(state.table);
  } catch (error) {
    state.error = error.message || 'Data gagal dihapus. Periksa kebijakan RLS.';
    renderShell();
  }
}

function signOut() {
  const token = state.session?.access_token;
  clearSession();
  if (token) fetch(`${state.config.url}/auth/v1/logout`, { method: 'POST', headers: authHeaders(token) }).catch(() => {});
  renderLogin();
}

async function initialize() {
  renderLogin();
  try {
    const response = await fetch('/api/config', { cache: 'no-store' });
    state.config = await responseJson(response);
    if (!state.config.url || !state.config.key) throw new Error('Konfigurasi belum tersedia di server.');
    const session = savedSession();
    if (session && await verifySession(session)) {
      await routeFromLocation();
    } else if (session) {
      clearSession();
      renderLogin('Sesi tidak valid atau akun belum memiliki role admin.');
    }
  } catch (error) {
    renderLogin(error.message || 'Tidak dapat menghubungi server.');
  }
}

window.addEventListener('popstate', () => {
  if (state.session) routeFromLocation();
});

initialize();
