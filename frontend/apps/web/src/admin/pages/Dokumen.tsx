import EntityPage from "../components/EntityPage";
import type { EntityConfig } from "../components/EntityPage";
import { FileText } from "lucide-react";

const config: EntityConfig = {
  title: "Kelola Dokumen",
  addLabel: "Tambah Dokumen",
  table: "dokumen",
  fields: [
    { name: "judul", label: "Judul Dokumen", type: "text", required: true },
    { name: "jenis", label: "Jenis", type: "select", options: ["PDF", "WORD", "EXCEL", "SPREADSHEET"], required: true },
    { name: "url_file", label: "URL File", type: "url", required: true },
    { name: "tanggal", label: "Tanggal", type: "date" },
    { name: "status", label: "Status", type: "select", options: ["Aktif", "Draft", "Arsip"], required: true },
  ],
  columns: [
    {
      key: "jenis",
      label: "Jenis",
      render: (row) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#2563eb", fontWeight: 600 }}>
          <FileText size={16} /> {String(row.jenis ?? "")}
        </span>
      ),
    },
    { key: "judul", label: "Judul" },
    { key: "tanggal", label: "Tanggal" },
    { key: "status", label: "Status" },
  ],
};

export default function DokumenPage() {
  return <EntityPage config={config} />;
}