-- Seed demo untuk tracking berkas (opsional, untuk uji coba).
-- Mode langkah: [{"title":"...","time":"...","done":true}]

INSERT INTO kemenag_inklusi.berkas_tracking (resi, layanan, pemohon, status, langkah) VALUES
('TRK-2026-0001', 'Pengawasan Berkala Madrasah', 'SDN Contoh 1', 'Diproses',
 '[{"title":"Berkas diterima di PTSP","time":"2026-09-01 08:30","done":true},{"title":"Verifikasi kelengkapan dokumen","time":"2026-09-02 10:15","done":true},{"title":"Pengolahan oleh bidang teknis","time":"2026-09-04 13:00","done":false}]'),
('TRK-2026-0002', 'Izin Operasional Madrasah', 'MTS Harapan Baru', 'Selesai',
 '[{"title":"Berkas diterima di PTSP","time":"2026-08-20 09:00","done":true},{"title":"Verifikasi kelengkapan dokumen","time":"2026-08-21 11:00","done":true},{"title":"Pengolahan oleh bidang teknis","time":"2026-08-25 14:20","done":true},{"title":"Berkas selesai & ditandatangani","time":"2026-08-29 09:45","done":true}]')
ON CONFLICT (resi) DO NOTHING;