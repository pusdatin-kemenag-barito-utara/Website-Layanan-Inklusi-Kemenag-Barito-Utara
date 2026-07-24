'use client';

import { useEffect } from 'react';

export default function MaintenanceClient() {
  const pusdatinUrl = process.env.NEXT_PUBLIC_PUSDATIN_URL || "https://pusdatin.kemenag-baritoutara.go.id";

  useEffect(() => {
    // 1. Ganti history state agar tombol Back tidak mengembalikan ke halaman sebelumnya yang ter-cache
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Paksa halaman tetap stay di /maintenance saat tombol back ditekan
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
      <iframe
        src={`${pusdatinUrl}/maintenance?app=Pusat+Layanan+Inklusi`}
        title="Sistem Sedang Pemeliharaan"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}
