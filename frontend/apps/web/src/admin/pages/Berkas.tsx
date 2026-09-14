import EntityPage from "../components/EntityPage";
import type { EntityConfig } from "../components/EntityPage";
import { SendHorizonal } from "lucide-react";

const config: EntityConfig = {
  title: "Tracking Berkas",
  addLabel: "Tambah Berkas",
  table: "berkas_tracking",
  fields: [
    { name: "resi", label: "Nomor Resi", type: "text", required: true },
    { name: "layanan", label: "Layanan", type: "text", required: true },
    { name: "pemohon", label: "Nama Pemohon", type: "text", required: true },
    { name: "status", label: "Status", type: "select", options: ["Diterima", "Diproses", "Verifikasi", "Selesai"], required: true },
  ],
  columns: [
    {
      key: "resi",
      label: "Resi",
      render: (row) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#2563eb", fontWeight: 600 }}>
          <SendHorizonal size={15} /> {String(row.resi ?? "")}
        </span>
      ),
    },
    { key: "layanan", label: "Layanan" },
    { key: "pemohon", label: "Pemohon" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "20px",
            backgroundColor: String(row.status ?? "") === "Selesai" ? "#ecfdf5" : "#fffbeb",
            color: String(row.status ?? "") === "Selesai" ? "#065f46" : "#92400e",
            fontWeight: 600,
            fontSize: "0.8rem",
          }}
        >
          {String(row.status ?? "")}
        </span>
      ),
    },
  ],
};

export default function BerkasPage() {
  return <EntityPage config={config} />;
}