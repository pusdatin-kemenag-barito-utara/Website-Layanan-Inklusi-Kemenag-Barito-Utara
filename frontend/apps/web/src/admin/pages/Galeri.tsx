import EntityPage from "../components/EntityPage";
import type { EntityConfig } from "../components/EntityPage";
import { Image as ImageIcon } from "lucide-react";

const config: EntityConfig = {
  title: "Kelola Galeri",
  addLabel: "Tambah Galeri",
  table: "galeri",
  fields: [
    { name: "judul", label: "Judul", type: "text", required: true },
    { name: "url_file", label: "URL Gambar", type: "url", required: true },
    { name: "tipe_file", label: "Tipe", type: "select", options: ["foto", "video"], required: true },
    { name: "tanggal", label: "Tanggal", type: "date" },
    { name: "status", label: "Status", type: "select", options: ["Aktif", "Draft", "Arsip"], required: true },
  ],
  columns: [
    {
      key: "url_file",
      label: "Gambar",
      render: (row) =>
        row.url_file ? (
          <img src={String(row.url_file)} alt="" style={{ width: "64px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
        ) : (
          <div style={{ width: "64px", height: "40px", background: "#e5e7eb", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImageIcon size={16} color="#9ca3af" />
          </div>
        ),
    },
    { key: "judul", label: "Judul" },
    { key: "tanggal", label: "Tanggal" },
    { key: "status", label: "Status" },
  ],
};

export default function GaleriPage() {
  return <EntityPage config={config} />;
}