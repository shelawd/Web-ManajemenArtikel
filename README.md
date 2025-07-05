# Manajemen Artikel

Aplikasi manajemen artikel berbasis Next.js, React, dan shadcn/ui. Mendukung fitur admin & user, pengelolaan artikel & kategori, autentikasi, serta UI responsif.

## Fitur Utama
- **Autentikasi**: Login, register, logout dengan validasi form.
- **Manajemen Artikel**: CRUD artikel, upload gambar, preview, filter & search, pagination.
- **Manajemen Kategori**: CRUD kategori, filter, pagination.
- **Halaman User**: List artikel, detail artikel, related articles, search & filter dengan debounce.
- **Halaman Admin**: Dashboard admin, kelola artikel & kategori, profile admin.
- **Responsif**: Tampilan optimal di mobile, tablet, dan desktop.

## Struktur Folder Utama
```
manajemen-artikel/
├── src/
│   ├── app/
│   │   ├── (auth)/         # Halaman login & register
│   │   ├── (main)/        # Halaman utama user
│   │   ├── (user)/        # Halaman detail artikel user
│   │   └── admin/         # Halaman admin (artikel, kategori, profile)
│   ├── components/        # Komponen UI & fitur
│   ├── lib/               # Helper, axios, hooks
│   └── ...
├── public/                # Asset publik
├── package.json
└── ...
```

## Instalasi & Menjalankan Lokal
1. **Clone repo:**
   ```bash
   git clone https://github.com/username/manajemen-artikel.git
   cd manajemen-artikel
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Buat file environment:**
   - Copy `.env.example` ke `.env.local` (jika ada) dan sesuaikan variabelnya.
4. **Jalankan lokal:**
   ```bash
   npm run dev
   ```
   Akses di [http://localhost:3000](http://localhost:3000)

## Build & Deploy
- **Build production:**
  ```bash
  npm run build
  npm start
  ```
- **Deploy ke Vercel:**
  - Push ke GitHub, lalu connect repo ke Vercel dan deploy.

## Kontributor
- [Nama Anda](mailto:shelawdya44@gmail.com)

---

> Aplikasi ini dikembangkan untuk kebutuhan manajemen artikel dan kategori dengan pengalaman admin & user yang modern dan responsif.
