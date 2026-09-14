import EntityPage from "../components/EntityPage";
import type { EntityConfig } from "../components/EntityPage";
import type { ContentRow } from "../api/client";

const kategoriMap: Record<string, string> = {
  diskriminasi: "Diskriminasi",
  fasilitas: "Fasilitas Tidak Ramah",
  pungli: "Pungutan Liar",
  pelayanan: "Pelayanan Tidak Memuaskan",
  lainnya: "Lainnya",
};

const label = (v: unknown) => kategoriMap[String(v ?? "")] ?? String(v ?? "-");

const config: EntityConfig = {
  title: "Pengaduan Masuk",
  addLabel: "Catat Pengaduan",
  table: "pengaduan",
  fields: [
    { name: "nama", label: "Nama", type: "text" },
    { name: "kategori", label: "Kategori", type: "select", options: Object.keys(kategoriMap), required: true },
    { name: "detail", label: "Detail Aduan", type: "textarea", required: true },
    { name: "status", label: "Status", type: "select", options: ["Baru", "Diproses", "Selesai"], required: true },
  ],
  columns: [
    { key: "nama", label: "Nama", render: (row) => String(row.nama ?? "Anonim") },
    { key: "kategori", label: "Kategori", render: (row) => label(row.kategori) },
    { key: "detail", label: "Detail" },
    { key: "status", label: "Status" },
  ],
};

export default function PengaduanPage() {
  return <EntityPage config={config} />;
}