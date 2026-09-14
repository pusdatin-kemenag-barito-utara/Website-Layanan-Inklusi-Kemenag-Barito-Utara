import EntityPage from "../components/EntityPage";
import type { EntityConfig } from "../components/EntityPage";
import { Image as ImageIcon } from "lucide-react";

const config: EntityConfig = {
  title: "Kelola Berita",
  addLabel: "Tambah Berita",
  table: "berita",
  fields: [
    { name: "judul", label: "Judul Berita", type: "text", required: true },
    { name: "slug", label: "Slug (URL)", type: "text" },
    { name: "konten", label: "Konten / Isi Berita", type: "textarea" },
    { name: "thumbnail", label: "URL Thumbnail / Cover", type: "url" },
    { name: "tanggal", label: "Tanggal", type: "date" },
    { name: "status", label: "Status", type: "select", options: ["Aktif", "Draft", "Arsip"], required: true },
  ],
  columns: [
    {
      key: "thumbnail",
      label: "Thumbnail",
      render: (row) =>
        row.thumbnail ? (
          <img src={String(row.thumbnail)} alt="" style={{ width: "64px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
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

export default function NewsPage() {
  return <EntityPage config={config} />;
}