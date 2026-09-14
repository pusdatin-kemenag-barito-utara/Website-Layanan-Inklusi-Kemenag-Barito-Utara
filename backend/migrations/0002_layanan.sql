-- Fase 3: tabel layanan publik (booking, pengaduan, formulir identifikasi, tracking berkas)
-- Jalankan di Supabase SQL Editor pada schema kemenag_inklusi.

CREATE TABLE IF NOT EXISTS kemenag_inklusi.booking_prioritas (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kode        text NOT NULL UNIQUE,
    nama        text NOT NULL,
    kategori    text NOT NULL,
    layanan     text NOT NULL,
    tanggal     text NOT NULL,
    waktu       text NOT NULL,
    keterangan  text,
    status      text NOT NULL DEFAULT 'Menunggu',
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kemenag_inklusi.pengaduan (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama        text,
    kategori    text NOT NULL,
    detail      text NOT NULL,
    lampiran    text,
    status      text NOT NULL DEFAULT 'Baru',
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kemenag_inklusi.formulir_identifikasi (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama        text NOT NULL,
    nik         text NOT NULL,
    telepon     text,
    kategori    text NOT NULL,
    layanan     text,
    kebutuhan   text,
    lampiran    text,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kemenag_inklusi.berkas_tracking (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    resi        text NOT NULL UNIQUE,
    layanan     text NOT NULL,
    pemohon     text NOT NULL,
    status      text NOT NULL DEFAULT 'Diproses',
    langkah     jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);