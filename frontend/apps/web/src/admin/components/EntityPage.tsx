import { useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";
import { Plus } from "lucide-react";
import { api, type ContentRow } from "../api/client";
import EntityTable, { type ColumnConfig } from "./EntityTable";
import EntityFormModal, { type FieldConfig } from "./EntityFormModal";
import EntityDeleteModal from "./EntityDeleteModal";
import Toast, { type ToastProps } from "./Toast";

export type { FieldConfig };

export type EntityConfig = {
  title: string;
  addLabel: string;
  table: string;
  fields: FieldConfig[];
  columns: ColumnConfig[];
};

export default function EntityPage({ config }: { config: EntityConfig }) {
  const [data, setData] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [error, setError] = useState("");

  const emptyForm = useMemo(() => {
    const f: Record<string, string> = {};
    for (const field of config.fields) f[field.name] = "";
    return f;
  }, [config.fields]);

  const [form, setForm] = useState<Record<string, string>>(emptyForm);

  const fetchData = useCallback(async () => {
    try {
      const rows = await api.get<ContentRow[]>(`/api/admin/${config.table}`);
      setData(rows);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [config.table]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openAdd() {
    setForm(emptyForm);
    setEditId(null);
    setError("");
    setShowModal(true);
  }

  function openEdit(item: ContentRow) {
    const f: Record<string, string> = {};
    for (const field of config.fields) f[field.name] = String(item[field.name] ?? "");
    setForm(f);
    setEditId(item.id);
    setError("");
    setShowModal(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, string> = {};
      for (const f of config.fields) {
        const v = form[f.name];
        if ((f.required || f.name === "status") && !v) {
          setError(`${f.label} wajib diisi`);
          setSaving(false);
          return;
        }
        payload[f.name] = v;
      }
      if (editId) {
        await api.put(`/api/admin/${config.table}/${editId}`, payload);
        showToast("Data berhasil diperbarui!");
      } else {
        await api.post(`/api/admin/${config.table}`, payload);
        showToast("Data berhasil ditambahkan!");
      }
      setShowModal(false);
      void fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string | number) {
    try {
      await api.del(`/api/admin/${config.table}/${id}`);
      showToast("Data berhasil dihapus!");
      setDeleteId(null);
      void fetchData();
    } catch (err) {
      showToast((err as Error).message, "error");
      setDeleteId(null);
    }
  }

  return (
    <div>
      {toast && <Toast toast={toast} />}

      <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.5rem", color: "var(--text-color)" }}>{config.title}</h1>
        <button
          onClick={openAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "0.6rem 1.2rem",
            backgroundColor: "var(--primary-color)",
            color: "white",
            fontWeight: 700,
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={18} /> {config.addLabel}
        </button>
      </div>

      {error && !showModal && <p style={{ color: "#b91c1c", marginBottom: "1rem" }}>Gagal memuat data: {error}</p>}

      <EntityTable
        columns={config.columns}
        data={data}
        loading={loading}
        onEdit={openEdit}
        onDelete={(id) => setDeleteId(id)}
      />

      {showModal && (
        <EntityFormModal
          title={config.title}
          fields={config.fields}
          form={form}
          isEdit={!!editId}
          saving={saving}
          error={error}
          onClose={() => setShowModal(false)}
          onChange={handleChange}
          onSubmit={handleSave}
        />
      )}

      {deleteId && (
        <EntityDeleteModal
          onCancel={() => setDeleteId(null)}
          onConfirm={() => void handleDelete(deleteId)}
        />
      )}
    </div>
  );
}