import { useState } from "react";
import { Search, CheckCircle, Circle, Loader2, FileText } from "lucide-react";

const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8080";

const inputStyle = {
  padding: "1rem",
  borderRadius: "10px 0 0 10px",
  border: "2px solid #d1d5db",
  borderRight: "none",
  width: "100%",
  fontSize: "1.1rem",
  backgroundColor: "white",
  color: "var(--text-color)",
  outline: "none",
};

export default function TrackingForm() {
  const [resi, setResi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`${API_URL}/api/public/tracking/${encodeURIComponent(resi.trim())}`, { cache: "no-store" });
      if (res.status === 404) throw new Error("Berkas tidak ditemukan. Periksa kembali nomor resi Anda.");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat data");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSteps = (steps) => {
    if (!steps || steps.length === 0) return <p style={{ color: "var(--text-light)" }}>Data langkah belum tersedia.</p>;
    return steps.map((s, i) => (
      <div key={i} style={{ display: "flex", gap: "1rem", padding: "1rem 0", borderBottom: i < steps.length - 1 ? "1px solid #f3f4f6" : "none" }}>
        <span style={{ color: s.done ? "var(--primary-color)" : "#d1d5db", flexShrink: 0 }}>
          {s.done ? <CheckCircle size={26} /> : <Circle size={26} />}
        </span>
        <div>
          <p style={{ fontWeight: 700, color: s.done ? "var(--text-color)" : "#9ca3af" }}>{s.title}</p>
          {s.time && <p style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>{s.time}</p>}
        </div>
      </div>
    ));
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", maxWidth: "560px", margin: "0 auto 2rem" }}>
        <input value={resi} onChange={(e) => setResi(e.target.value)} placeholder="Masukkan nomor resi contoh: TRK-2024-0001" style={inputStyle} />
        <button type="submit" disabled={loading || !resi.trim()} style={{ padding: "0 28px", border: "none", borderRadius: "0 10px 10px 0", backgroundColor: loading || !resi.trim() ? "#d1d5db" : "var(--primary-color)", color: "white", fontWeight: 700, fontSize: "1rem", cursor: loading || !resi.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          {loading ? <Loader2 size={20} className="spin" /> : <Search size={20} />}
        </button>
      </form>

      {error && (
        <div style={{ maxWidth: "560px", margin: "0 auto 1.5rem", padding: "14px 18px", borderRadius: "10px", backgroundColor: "#fef2f2", color: "#b91c1c", textAlign: "center", fontWeight: 600 }}>{error}</div>
      )}

      {data && (
        <div class="glass-panel" style={{ borderRadius: "16px", padding: "2rem", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", maxWidth: "560px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
            <span style={{ padding: "12px", borderRadius: "50%", backgroundColor: "rgba(11,96,86,0.1)", color: "var(--primary-color)" }}>
              <FileText size={28} />
            </span>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>Nomor Resi</p>
              <p style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "1px" }}>{data.resi}</p>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: "20px", backgroundColor: "rgba(11,96,86,0.1)", color: "var(--primary-color)", fontWeight: 700, fontSize: "0.85rem" }}>{data.status}</span>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <p style={{ color: "var(--text-light)" }}>Layanan: <strong style={{ color: "var(--text-color)" }}>{data.layanan}</strong></p>
            <p style={{ color: "var(--text-light)" }}>Pemohon: <strong style={{ color: "var(--text-color)" }}>{data.pemohon}</strong></p>
          </div>

          <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary-color)", marginBottom: "0.5rem" }}>Perkembangan Berkas</h4>
          {renderSteps(data.steps)}
          {data.updated_at && <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#9ca3af" }}>Terakhir diperbarui: {data.updated_at}</p>}
        </div>
      )}
    </div>
  );
}