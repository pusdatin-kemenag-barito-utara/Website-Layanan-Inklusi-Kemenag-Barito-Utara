import { useState } from "react";
import { Calendar, Clock, Users, CheckCircle, Loader2 } from "lucide-react";

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
  { value: "disabilitas_fisik", label: "Disabilitas Fisik (Pengguna Kursi Roda, Kruk, dll)" },
  { value: "disabilitas_sensorik", label: "Disabilitas Sensorik (Tunanetra / Tunarungu)" },
  { value: "lansia", label: "Lansia (Lanjut Usia)" },
  { value: "ibu_hamil", label: "Ibu Hamil / Menyusui" },
  { value: "lainnya", label: "Lainnya" },
];

const layananOptions = [
  { value: "haji", label: "Pendaftaran Haji / Umrah" },
  { value: "nikah", label: "Layanan KUA / Pernikahan" },
  { value: "madrasah", label: "Layanan Pendidikan Madrasah" },
  { value: "agama", label: "Konsultasi Keagamaan" },
  { value: "lainnya", label: "Lainnya" },
];

export default function BookingForm() {
  const [form, setForm] = useState({ nama: "", kategori: "", layanan: "", tanggal: "", waktu: "", keterangan: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kode, setKode] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/public/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim booking");
      }
      setKode(data.kode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (kode) {
    return (
      <div class="glass-panel" style={{ borderRadius: "16px", padding: "3rem", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <CheckCircle size={72} color="var(--primary-color)" style={{ margin: "0 auto 1.5rem" }} />
        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Booking Berhasil!</h3>
        <p style={{ color: "var(--text-light)", marginBottom: "1.5rem" }}>
          Simpan kode antrean Anda dan tunjukkan di loket prioritas saat berkunjung.
        </p>
        <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--primary-color)", letterSpacing: "2px", padding: "1.5rem", border: "2px dashed var(--primary-color)", borderRadius: "12px", display: "inline-block", marginBottom: "1.5rem" }}>
          {kode}
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
          Nama: <strong>{form.nama}</strong> &middot; {" "}
          {kategoriOptions.find((k) => k.value === form.kategori)?.label ?? form.kategori}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} class="glass-panel" style={{ borderRadius: "16px", padding: "2.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px", color: "var(--primary-color)" }}>
        <Calendar size={22} /> Formulir Pemesanan Antrean
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div>
          <label style={labelStyle}>Nama Lengkap *</label>
          <input name="nama" value={form.nama} onChange={handleChange} required placeholder="Nama Anda" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Kategori *</label>
          <select name="kategori" value={form.kategori} onChange={handleChange} required style={inputStyle}>
            <option value="">-- Pilih Kategori --</option>
            {kategoriOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Layanan yang Diakses *</label>
          <select name="layanan" value={form.layanan} onChange={handleChange} required style={inputStyle}>
            <option value="">-- Pilih Layanan --</option>
            {layananOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Tanggal *</label>
          <input name="tanggal" type="date" value={form.tanggal} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Jam *</label>
          <input name="waktu" type="time" value={form.waktu} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>
            <Users size={14} style={{ verticalAlign: "-2px" }} /> Keterangan Tambahan
          </label>
          <input name="keterangan" value={form.keterangan} onChange={handleChange} placeholder="Opsional" style={inputStyle} />
        </div>
      </div>

      {error && (
        <p style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#fef2f2", color: "#b91c1c", marginBottom: "1rem" }}>{error}</p>
      )}

      <button type="submit" disabled={loading} style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "none", backgroundColor: loading ? "#d1d5db" : "var(--primary-color)", color: "white", fontWeight: 700, fontSize: "1.15rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
        {loading ? <Loader2 size={20} className="spin" /> : <Clock size={20} />} {loading ? "Mengirim..." : "Pesan Antrean Prioritas"}
      </button>
    </form>
  );
}