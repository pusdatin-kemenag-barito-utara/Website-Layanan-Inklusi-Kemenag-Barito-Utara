# Panduan pengembangan

Monorepo Layanan Inklusi Kemenag Barito Utara: Go Fiber API (BE) + situs publik & panel admin terpadu dalam Astro V7 / React (FE).

## Memulai

- Jalankan `npm install` di root; semua dependensi FE di-manage dari root. Ada script `npm run install:all` yang sekalian men-download modul Go backend.
- Semua secret/env di-inject dari Infisical Cloud path `/inklusi-kemenag` (`npm run dev` otomatis menjalankan `infisical run --env=dev --path=/inklusi-kemenag`); **jangan buat file `.env`** dan jangan commit secret. `.gitignore` mem-blokir semua `.env*`. Port FE utama adalah **3000**, port BE API adalah **8080**.
- Build & cek:
  - Frontend (Web Publik + Admin): `npm run build:frontend`
  - Backend: `cd backend && go build ./... && go vet ./...`
- **File Test**: File pengujian (`*_test.go`, `*.test.ts`, dll.) hanya untuk pengujian lokal sementara dan **wajib dihapus setelah selesai**; jangan di-commit ke git.


## Aturan backend (Go)

- Modul `github.com/kemenag/inklusi-backend`.
- **Fiber v3** (`github.com/gofiber/fiber/v3`), pool pgx. Perbedaan v2→v3: handler `func(c fiber.Ctx) error` (interface, bukan pointer), `c.Bind().Body(&x)` menggantikan `BodyParser`, `c.Context()` = `context.Context` (bukan fasthttp), dan CORS memakai `[]string`.
- Semua tabel dikunci schema `kemenag_inklusi`; RBAC baca tabel `kemenag_pusdatin.app_permissions`.
- Rute publik konten tidak boleh langsung akses Supabase — harus lewat API Fiber.
- Whitelist tabel admin ada di `backend/internal/content/content.go` (`allowedTables`); tambahkan tabel baru di sana bila perlu dikelola admin.
- Migrasi SQL taruh di `backend/migrations/` (diurutkan `NNNN_*.sql`) dan jalankan manual di Supabase.
- Dev memakai **Air** (`backend/.air.toml`): build output wajib `.exe` di Windows (`tmp/server.exe`). Jangan hardcode credential; baca semua dari env lewat `internal/config`.

## Aturan frontend (Astro + React)

- Halaman publik di `frontend/apps/web/src/pages/**` menggunakan Layout/Navbar/Footer.
- **Import path**: halaman di `src/pages/<subdir>/` wajib `../../` untuk memanggil `layouts`, `components`, `lib`; halaman level atas cukup `../`. Kedalaman salah = `[UNRESOLVED_IMPORT]` saat build.
- Fetch API lewat helper `src/lib/api.ts` (`publicFetch`, `cache: "no-store"`). Komponen interaktif yang butuh state wajib `client:load`.
- Admin memakai komponen generik `EntityPage.tsx` (config `fields` + `columns`); buat halaman baru dengan mendefinisikan `EntityConfig`, daftarkan di `App.tsx`, tambah menu di `components/Layout.tsx`.
- Admin auth via HttpOnly cookie `inklusi-auth`; `RequireAuth` memanggil `/api/auth/me`. Jangan simpan token di localStorage.

## Perangkap umum (Windows + Node 24)

- Saat build Astro gagal, muncul crash libuv (`src\win\async.c line 94`) — itu efek samping; perbaiki error build sebenarnya (umumnya import path).
- Peringatan deprecation esbuild dari vite:react-babel saat build Astro bisa diabaikan.

## Referensi

- Rute API: `backend/internal/api/*.go`.
- Struktur lama Next.js sudah dihapus total; jangan menambah dependensi `next`/`@supabase/ssr`/`pg` di root atau FE.