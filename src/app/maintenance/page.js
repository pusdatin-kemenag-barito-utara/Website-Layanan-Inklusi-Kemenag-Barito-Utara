export const metadata = {
  title: "Sistem Sedang Pemeliharaan",
  description: "Aplikasi Pusat Layanan Inklusi saat ini sedang dalam mode perbaikan.",
};

export default function MaintenancePage() {
  const pusdatinUrl = process.env.NEXT_PUBLIC_PUSDATIN_URL || "https://pusdatin.kemenag-baritoutara.go.id";

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
