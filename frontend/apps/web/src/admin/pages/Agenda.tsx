import EntityPage from "../components/EntityPage";
import type { EntityConfig } from "../components/EntityPage";

const config: EntityConfig = {
  title: "Kelola Agenda",
  addLabel: "Tambah Agenda",
  table: "agenda",
  fields: [
    { name: "acara", label: "Nama Acara", type: "text", required: true },
    { name: "deskripsi", label: "Deskripsi", type: "textarea" },
    { name: "waktu", label: "Waktu (YYYY-MM-DD)", type: "date" },
    { name: "lokasi", label: "Lokasi", type: "text" },
    { name: "status", label: "Status", type: "select", options: ["Mendatang", "Selesai", "Dibatalkan"], required: true },
  ],
  columns: [
    { key: "acara", label: "Acara" },
    { key: "waktu", label: "Waktu" },
    { key: "lokasi", label: "Lokasi" },
    { key: "status", label: "Status" },
  ],
};

export default function AgendaPage() {
  return <EntityPage config={config} />;
}