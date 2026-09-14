import type React from "react";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import type { ContentRow } from "../api/client";

export type ColumnConfig = {
  key: string;
  label: string;
  render?: (row: ContentRow) => React.ReactNode;
};

export default function EntityTable({
  columns,
  data,
  loading,
  onEdit,
  onDelete,
}: {
  columns: ColumnConfig[];
  data: ContentRow[];
  loading: boolean;
  onEdit: (item: ContentRow) => void;
  onDelete: (id: string | number) => void;
}) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "left",
                  padding: "0.75rem 1rem",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  color: "#6b7280",
                }}
              >
                {col.label}
              </th>
            ))}
            <th
              style={{
                textAlign: "right",
                padding: "0.75rem 1rem",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                color: "#6b7280",
              }}
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                <Loader2 className="spin" size={20} style={{ verticalAlign: "middle" }} /> Memuat...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                Belum ada data.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: "0.75rem 1rem" }}>
                    {col.render ? col.render(item) : String(item[col.key] ?? "")}
                  </td>
                ))}
                <td style={{ padding: "0.75rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                  <button
                    onClick={() => onEdit(item)}
                    aria-label="Edit"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", marginRight: "0.5rem" }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    aria-label="Hapus"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
