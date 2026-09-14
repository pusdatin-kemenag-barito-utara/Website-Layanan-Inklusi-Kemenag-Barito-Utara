import EntityPage from "../components/EntityPage";
import type { EntityConfig } from "../components/EntityPage";
import { Clock } from "lucide-react";

const kategoriMap: Record<string, string> = {
  disabilitas_fisik: "Disabilitas Fisik",
  disabilitas_sensorik: "Disabilitas Sensorik",
  lansia: "Lansia",
  ibu_hamil: "Ibu Hamil / Menyusui",
  lainnya: "Lainnya",
};

const layananMap: Record<string, string> = {
  haji: "Haji / Umrah",
  nikah: "KUA / Pernikahan",
  madrasah: "Pendidikan Madrasah",
  agama: "Konsultasi Keagamaan",
  lainnya: "Lainnya",
};

const label = (map: Record<string, string>, v: unknown) => map[String(v ?? "")] ?? String(v ?? "-");

const config: EntityConfig = {
  title: "Antrean Prioritas",
  addLabel: "Tambah Booking",
  table: "booking_prioritas",
  fields: [
    { name: "kode", label: "Kode Antrean", type: "text" },
    { name: "nama", label: "Nama Lengkap", type: "text", required: true },
    { name: "kategori", label: "Kategori", type: "select", options: Object.keys(kategoriMap), required: true },
    { name: "layanan", label: "Layanan", type: "select", options: Object.keys(layananMap), required: true },
    { name: "tanggal", label: "Tanggal", type: "date" },
    { name: "waktu", label: "Jam", type: "text" },
    { name: "keterangan", label: "Keterangan", type: "textarea" },
    { name: "status", label: "Status", type: "select", options: ["Menunggu", "Diproses", "Selesai"], required: true },
  ],
  columns: [
    {
      key: "kode",
      label: "Kode",
      render: (row) => (
        <span style={{ fontWeight: 700, color: "#2563eb", letterSpacing: "1px" }}>{String(row.kode ?? "")}</span>
      ),
    },
    { key: "nama", label: "Nama" },
    {
      key: "kategori",
      label: "Kategori",
      render: (row) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--primary-color)", fontWeight: 600 }}>
          <Clock size={14} /> {label(kategoriMap, row.kategori)}
        </span>
      ),
    },
    { key: "layanan", label: "Layanan", render: (row) => label(layananMap, row.layanan) },
    { key: "tanggal", label: "Tanggal" },
    { key: "waktu", label: "Jam" },
    { key: "status", label: "Status" },
  ],
};

export default function BookingPage() {
  return <EntityPage config={config} />;
}