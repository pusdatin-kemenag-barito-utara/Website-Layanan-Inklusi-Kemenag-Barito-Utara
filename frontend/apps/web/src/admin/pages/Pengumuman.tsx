import EntityPage from "../components/EntityPage";
import type { EntityConfig } from "../components/EntityPage";

const config: EntityConfig = {
  title: "Kelola Pengumuman",
  addLabel: "Tambah Pengumuman",
  table: "pengumuman",
  fields: [
    { name: "judul", label: "Judul", type: "text", required: true },
    { name: "konten", label: "Isi Pengumuman", type: "textarea" },
    { name: "tanggal", label: "Tanggal", type: "date" },
    { name: "status", label: "Status", type: "select", options: ["Aktif", "Draft", "Arsip"], required: true },
  ],
  columns: [
    { key: "judul", label: "Judul" },
    { key: "tanggal", label: "Tanggal" },
    { key: "status", label: "Status" },
  ],
};

export default function PengumumanPage() {
  return <EntityPage config={config} />;
}