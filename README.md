# Layanan Inklusi Kemenag Barito Utara

Website layanan inklusi untuk penyandang disabilitas, lansia, ibu hamil, dan ibu menyusui di lingkungan Kementerian Agama Kabupaten Barito Utara.

## Arsitektur

Monorepo dengan npm workspaces.

```
backend/                 Go Fiber API (publik + admin + auth) — Port 8080
frontend/
  apps/web/              Astro V7 + React — Situs Publik & Panel Admin SPA — Port 3000
  packages/ui/           Komponen UI bersama (Navbar, Footer, widget)
```

Semua data disajikan lewat API Fiber (`backend`) yang terhubung transparan via SSR proxy `/api` pada frontend Astro. Autentikasi admin memakai `Supabase Auth` + RBAC `kemenag_pusdatin` + JWT cookie `inklusi-auth` (HTTPOnly). Anti-bot memakai Cloudflare Turnstile. Secret dikelola secara terpusat lewat Infisical Cloud.

## Skema Database

- `kemenag_inklusi` — tabel konten & pelayanan (berita, pengumuman, agenda, galeri, dokumen, booking_prioritas, pengaduan, formulir_identifikasi, berkas_tracking).
- `kemenag_pusdatin` — pengguna dan `app_permissions` untuk RBAC lintas aplikasi.

## Persyaratan

- Go 1.27+
- Node.js 24+
- npm (pakai `npm`, bukan pnpm/yarn)

## Menjalankan

```bash
npm run install:all           # install semua workspace FE + Go modules backend

# Semua env di-inject dari Infisical Cloud path /inklusi-kemenag (jangan pakai file .env).
# Menjalankan dev server langsung menginjeksi env dev dari Infisical:
npm run dev

# Melihat variabel yang aktif di Infisical Cloud:
npm run secrets:dev          # inspeksi secret environment dev
npm run secrets:prod         # inspeksi secret environment prod
```

`npm run dev` menjalankan 2 proses terkoordinasi:

- **Frontend (Astro V7)**: `http://localhost:3000`
  - Situs Publik: `http://localhost:3000/`
  - Panel Admin: `http://localhost:3000/admin/` (Login: `http://localhost:3000/admin/login`)
  - API Proxy SSR: `http://localhost:3000/api` -> Forward ke Backend :8080
- **Backend API (Go Fiber v3)**: `http://localhost:8080` (API Health: `http://localhost:8080/api/health`)

Variabel environment dikelola terpusat di Infisical Cloud project `Kemenag Barito Utara` folder `/inklusi-kemenag` (lingkungan `dev` dan `prod`):
- **Backend**: `PORT` (3000), `BACKEND_PORT` (8080), `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `PUSDATIN_URL`, `APP_ID`, `SESSION_SECRET`, `SESSION_COOKIE_NAME`, `SESSION_COOKIE_SECURE`, `CORS_ORIGINS`.
- **Frontend (Publik & Admin)**: `PUBLIC_API_URL`, `PUBLIC_PUSDATIN_URL`, `PUBLIC_TURNSTILE_SITE_KEY`, `VITE_TURNSTILE_SITE_KEY`.

## Build & Cek

```bash
npm run build:web
npm run build:admin
npm run build:backend     # go build ./backend/cmd/server
npm run lint:backend      # go vet ./...
```

Migrasi SQL: jalankan file di `backend/migrations/` pada Supabase (schema `kemenag_inklusi`).

## Rute API Utama

| Metode | Rute | Keterangan |
|--------|------|------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login (Turnstile + Supabase Auth) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Sesi admin saat ini |
| GET | `/api/public/{berita,galeri,pengumuman,dokumen,agenda}` | Konten publik |
| POST | `/api/public/booking` | Antrean prioritas |
| POST | `/api/public/pengaduan` | Pengaduan |
| POST | `/api/public/formulir` | Formulir identifikasi |
| GET | `/api/public/tracking/:resi` | Lacak berkas |
| POST | `/api/public/upload` | Unggah lampiran ke Supabase Storage |
| GET/POST/PUT/DELETE | `/api/admin/:table` | CRUD admin (whitelist tabel) |