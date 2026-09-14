import type React from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "url" | "image";
  options?: string[];
  required?: boolean;
};

function inputType(f: FieldConfig): string {
  if (f.type === "date") return "date";
  if (f.type === "url") return "url";
  return "text";
}

export default function EntityFormModal({
  title,
  fields,
  form,
  isEdit,
  saving,
  error,
  onClose,
  onChange,
  onSubmit,
}: {
  title: string;
  fields: FieldConfig[];
  form: Record<string, string>;
  isEdit: boolean;
  saving: boolean;
  error: string;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
            {isEdit ? `Edit ${title}` : `Tambah ${title}`}
          </h2>
          <button onClick={onClose} aria-label="Tutup" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "0.75rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {fields.map((f) => (
            <div key={f.name}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  name={f.name}
                  value={form[f.name] ?? ""}
                  onChange={onChange}
                  required={f.required}
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "2px solid #d1d5db",
                    fontSize: "1rem",
                    fontFamily: "inherit",
                  }}
                />
              ) : f.type === "select" ? (
                <select
                  name={f.name}
                  value={form[f.name] ?? ""}
                  onChange={onChange}
                  required={f.required}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "2px solid #d1d5db",
                    fontSize: "1rem",
                    backgroundColor: "white",
                  }}
                >
                  {f.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={inputType(f)}
                  name={f.name}
                  value={form[f.name] ?? ""}
                  onChange={onChange}
                  required={f.required}
                  placeholder={f.type === "url" ? "https://..." : ""}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "2px solid #d1d5db",
                    fontSize: "1rem",
                  }}
                />
              )}
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.7rem 1.2rem",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.7rem 1.2rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "var(--primary-color)",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="spin" size={16} /> Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
