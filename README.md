# Website SMA Negeri 1 Singaraja

Website resmi SMA Negeri 1 Singaraja (SMANSA) untuk menyajikan informasi sekolah, program, berita, pengumuman, prestasi, dan layanan bagi siswa, orang tua, alumni, serta masyarakat.

## Fitur

- Halaman profil sekolah, fasilitas, manajemen dan tenaga pendidik.
- Informasi program akademik, ekstrakurikuler, Smansa Creative Space (SCS), dan SPMB.
- Berita, pengumuman, prestasi, beasiswa, informasi alumni, serta kontak sekolah.
- Tampilan responsif untuk desktop dan perangkat mobile.
- Terjemahan halaman melalui GTranslate. Bahasa awal Indonesia; pilihan lainnya Inggris, Mandarin, dan Jepang.
- Asisten AI yang menjawab pertanyaan tentang sekolah menggunakan Google Gemini dan sumber informasi yang dikelola melalui panel admin.
- Panel admin untuk mengelola konten website dan mengunggah media ke Supabase Storage.

## Teknologi

- HTML, CSS, dan JavaScript tanpa framework frontend.
- Server HTTP Node.js bawaan untuk menyajikan website dan menyediakan API.
- Supabase untuk data, autentikasi admin, dan penyimpanan media.
- Google Gemini untuk layanan Asisten AI.

## Menjalankan secara lokal

Persyaratan: Node.js dan npm.

1. Pasang dependensi:

   ```sh
   npm install
   ```

2. Buat berkas `.env` di folder utama proyek dan isi konfigurasi yang diperlukan. Jangan membagikan atau meng-commit berkas ini.

   ```dotenv
   PORT=4173
   GEMINI_API_KEY=
   GEMINI_MODEL=
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ADMIN_USER=
   ADMIN_PASSWORD=
   TRUST_PROXY=false
   ```

   Keterangan:

   | Variabel | Keterangan |
   | --- | --- |
   | `PORT` | Port server lokal. Default `4173`. |
   | `GEMINI_API_KEY` | Kunci API Gemini untuk mengaktifkan Asisten AI. Tanpa kunci ini, fitur chat tidak tersedia. |
   | `GEMINI_MODEL` | Model Gemini pilihan (opsional). Jika kosong, server menggunakan daftar model cadangan yang tersedia di `server.js`. |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase. |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Kunci Supabase publishable/anon, bukan `service_role` atau secret key. |
   | `ADMIN_USER`, `ADMIN_PASSWORD` | Opsional, harus diisi berpasangan untuk menambahkan HTTP Basic Auth di depan panel admin. Kosongkan keduanya untuk menggunakan login Supabase saja. |
   | `TRUST_PROXY` | Atur `true` hanya jika server berada di belakang reverse proxy tepercaya yang mengatur `X-Forwarded-For`. |

3. Jalankan server:

   ```sh
   npm start
   ```

   Buka [http://localhost:4173](http://localhost:4173) (atau port yang ditentukan di `PORT`). `npm run dev` menjalankan server yang sama.

> Buka website melalui server lokal, bukan dengan membuka `index.html` langsung. API, modul JavaScript, dan data Supabase memerlukan origin HTTP.

## Menyiapkan Supabase

Website publik membaca data dari tabel Supabase. Panel admin menggunakan autentikasi Supabase dan memerlukan akun yang memiliki `app_metadata.role` bernilai `admin`. Atur kebijakan Row Level Security (RLS) sesuai kebutuhan: data publik hanya boleh dibaca sesuai kebijakan, sedangkan perubahan konten dan pengelolaan media harus dibatasi untuk admin.

Setelah mengisi konfigurasi Supabase di `.env`, jalankan [`data/school-ai-info-schema.sql`](./data/school-ai-info-schema.sql) satu kali melalui Supabase SQL Editor. Skrip ini membuat tabel `school_ai_info`, mengaktifkan RLS, dan mengisi data awal Asisten AI yang sebelumnya berada di `data/school-info.txt`. Jika baris informasi sudah ada, menjalankan ulang skrip tidak menimpa isi yang telah diperbarui melalui admin.

Tabel yang digunakan meliputi:

- `announcements`, `news`, `achievements`, dan `career_openings`
- `teachers`, `facilities`, `galleries`, dan `extracurriculars`
- `alumni`, `programs`, `scs_contents`, dan `school_ai_info`

`school_ai_info` dapat dibaca oleh layanan AI dan pengunjung, tetapi hanya akun terautentikasi dengan `app_metadata.role = admin` yang dapat mengubahnya. Panel admin mengunggah gambar ke bucket Supabase Storage bernama `smansa-media`; siapkan bucket dan kebijakan aksesnya di proyek Supabase. Skema tabel konten lainnya juga dikelola di proyek Supabase.

## Panel admin

- Buka `/admin` pada server yang berjalan.
- Masuk menggunakan akun Supabase yang memiliki `app_metadata.role = admin`.
- Jika `ADMIN_USER` dan `ADMIN_PASSWORD` diatur, browser juga akan meminta HTTP Basic Auth sebelum panel admin dimuat.
- Pilih **Info Asisten AI** untuk memperbarui sumber informasi yang dipakai AI. Perubahan berlaku untuk pertanyaan berikutnya.
- Panel juga dapat mengelola pengumuman, berita, beasiswa, prestasi, tenaga pendidik, fasilitas, galeri, konten SCS, ekstrakurikuler, dan alumni.

## API server

- `GET /api/config` menyediakan konfigurasi Supabase publishable untuk frontend.
- `POST /api/chat` meneruskan pertanyaan ke Gemini. Batas permintaan adalah 10 pertanyaan per menit per alamat IP; pertanyaan dibatasi maksimal 500 karakter.
- `GET /admin` menyajikan panel admin.

Kunci Gemini tetap berada di server dan tidak boleh dimasukkan ke kode frontend. Jangan pernah menggunakan kunci Supabase `service_role` sebagai publishable key. Jika memasang server di belakang proxy, aktifkan `TRUST_PROXY` hanya bila header IP diteruskan oleh proxy yang tepercaya.

## Struktur proyek

```text
.
├── admin/                 # Antarmuka dan logika panel admin
├── assets/                # Logo, ikon, dan gambar
├── css/                   # Gaya halaman utama
├── data/                  # Skrip SQL untuk menyiapkan sumber informasi AI
├── js/                    # Skrip utama dan akses data Supabase
├── komponen/              # Komponen bersama: navbar, footer, AI, dan lainnya
├── pages/                 # Halaman website berdasarkan kategori
├── index.html             # Beranda
├── package.json           # Dependensi dan perintah npm
└── server.js              # Server lokal, API, dan penyajian berkas website
```

## Catatan pengembangan

- Tidak ada proses build frontend khusus; server menyajikan berkas HTML, CSS, dan JavaScript langsung.
- Data AI yang menjadi rujukan utama diperbarui di `/admin` → **Info Asisten AI** dan disimpan di Supabase.
- GTranslate dan Google Fonts memerlukan koneksi internet pada browser.
