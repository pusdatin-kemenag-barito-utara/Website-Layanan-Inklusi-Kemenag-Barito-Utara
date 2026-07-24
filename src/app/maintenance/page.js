import MaintenanceClient from './MaintenanceClient';

export const metadata = {
  title: "Sistem Sedang Pemeliharaan",
  description: "Aplikasi Pusat Layanan Inklusi saat ini sedang dalam mode perbaikan.",
};

export default function MaintenancePage() {
  return <MaintenanceClient />;
}
