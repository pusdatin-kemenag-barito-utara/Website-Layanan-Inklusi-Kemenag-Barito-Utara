import { useState } from "react";
import { Send, UploadCloud, CheckCircle, Loader2 } from "lucide-react";

const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8080";

const inputStyle = {
  padding: "1rem",
  borderRadius: "8px",
  border: "2px solid #d1d5db",
  width: "100%",
  fontSize: "1rem",
  backgroundColor: "white",
  color: "var(--text-color)",
  outline: "none",
};

const labelStyle = {
  fontWeight: 600,
  color: "var(--text-color)",
  fontSize: "1.05rem",
  marginBottom: "0.5rem",
  display: "block",
};

const kategoriOptions = [
  { value: "diskriminasi", label: "Diskriminasi" },
  { value: "fasilitas", label: "Fasilitas Tidak Ramah" },
  { value: "pungli", label: "Pungutan Liar / Penyelundupan" },
  { value: "pelayanan", label: "Pelayanan Tidak Memuaskan" },
  { value: "lainnya", label: "Lainnya" },
];

export default function PengaduanForm() {
  const [form, setForm] = useState({ nama: "", kategori: "", detail: "" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const uploadFile = async () => {
    if (!file) return "";
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_URL}/api/public/upload`, { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal mengunggah lampiran");
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);
    setError("");
    try {
      const lampiran = await uploadFile();
      const payload = { ...form, lampiran };
      const res = await fetch(`${API_URL}/api/public/pengaduan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim aduan");
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div class="glass-panel" style={{ borderRadius: "16px", padding: "3rem", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <CheckCircle size={72} color="var(--primary-color)" style={{ margin: "0 auto 1.5rem" }} />
        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Aduan Terkirim!</h3>
        <p style={{ color: "var(--text-light)", fontSize: "1.1rem" }}>
          Terima kasih atas laporan Anda. Tim kami akan menindaklanjuti dalam 3 hari kerja.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} class="glass-panel" style={{ borderRadius: "16px", padding: "2.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--primary-color)" }}>Sampaikan Pengaduan Anda</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div>
          <label style={labelStyle}>Nama (Opsional, boleh anonim)</label>
          <input name="nama" value={form.nama} onChange={handleChange} placeholder="Kosongkan jika ingin anonim" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Kategori Pengaduan *</label>
          <select name="kategori" value={form.kategori} onChange={handleChange} required style={inputStyle}>
            <option value="">-- Pilih Kategori --</option>
            {kategoriOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Detail Pengaduan *</label>
          <textarea name="detail" value={form.detail} onChange={handleChange} required rows={5} placeholder="Jelaskan kronologi kejadian secara lengkap..." style={{ ...inputStyle, resize: "vertical" }} />
        </div>
        <div>
          <label style={labelStyle}>Lampiran Bukti (Opsional, maks. 5MB)</label>
          <label htmlFor="lampiran" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1rem 1.25rem", border: "2px dashed #d1d5db", borderRadius: "10px", cursor: "pointer", color: "var(--text-light)", fontWeight: 500 }}>
            <UploadCloud size={22} /> {file ? file.name : "Pilih file (JPG, PNG, PDF)"}
            <input id="lampiran" type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
          </label>
        </div>
      </div>

      {error && (
        <p style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#fef2f2", color: "#b91c1c", marginBottom: "1rem" }}>{error}</p>
      )}

      <button type="submit" disabled={loading} style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "none", backgroundColor: loading ? "#d1d5db" : "var(--primary-color)", color: "white", fontWeight: 700, fontSize: "1.15rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
        {loading ? <Loader2 size={20} className="spin" /> : <Send size={20} />} {uploading && !done ? "Mengunggah..." : loading ? "Mengirim..." : "Kirim Pengaduan"}
      </button>
    </form>
  );
}