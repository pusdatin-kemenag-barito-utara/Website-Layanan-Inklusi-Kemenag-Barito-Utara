import { useState } from "react";
import { CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import StepIdentitas from "./formulir/StepIdentitas";
import StepKebutuhan from "./formulir/StepKebutuhan";
import StepUpload from "./formulir/StepUpload";
import SuccessState from "./formulir/SuccessState";
import { btnStyle } from "./formulir/styles";

const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8080";

export default function FormulirPendataan() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nama: "",
    nik: "",
    telepon: "",
    kategori: "",
    layanan: "",
    kebutuhan: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kode, setKode] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nextStep = () => setStep((p) => Math.min(p + 1, 3));
  const prevStep = () => setStep((p) => Math.max(p - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let lampiran = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch(`${API_URL}/api/public/upload`, { method: "POST", body: fd });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.error || "Gagal mengunggah dokumen");
        lampiran = upData.url;
      }
      const res = await fetch(`${API_URL}/api/public/formulir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lampiran }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim formulir");
      setKode(data.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (kode) {
    return <SuccessState nama={form.nama} kode={kode} />;
  }

  return (
    <div class="glass-panel" style={{ borderRadius: "16px", padding: "2.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      {/* Step Indicator */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2.5rem", position: "relative" }}>
        <div style={{ position: "absolute", top: "20px", left: 0, right: 0, height: "4px", backgroundColor: "#e5e7eb", zIndex: 1 }}></div>
        <div style={{
          position: "absolute",
          top: "20px",
          left: 0,
          width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
          height: "4px",
          backgroundColor: "var(--primary-color)",
          zIndex: 1,
          transition: "width 0.3s ease"
        }}></div>
        {["Data Diri", "Kebutuhan Khusus", "Dokumen"].map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: active || done ? "var(--primary-color)" : "#ffffff",
                border: `3px solid ${active || done ? "var(--primary-color)" : "#e5e7eb"}`,
                color: active || done ? "#fff" : "#9ca3af",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700
              }}>
                {done ? <CheckCircle size={20} /> : n}
              </div>
              <span style={{
                marginTop: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: active ? 700 : 500,
                color: active ? "var(--primary-color)" : "var(--text-light)"
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {step === 1 && <StepIdentitas form={form} onChange={handleChange} />}
        {step === 2 && <StepKebutuhan form={form} onChange={handleChange} />}
        {step === 3 && <StepUpload file={file} setFile={setFile} />}

        {error && (
          <p style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#fef2f2", color: "#b91c1c" }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #e5e7eb" }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              style={{ ...btnStyle, backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }}
            >
              <ArrowLeft size={20} /> Kembali
            </button>
          ) : <div></div>}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              style={{ ...btnStyle, backgroundColor: "var(--primary-color)", color: "white" }}
            >
              Selanjutnya <ArrowRight size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{ ...btnStyle, backgroundColor: loading ? "#d1d5db" : "#f7a81b", color: "white" }}
            >
              {loading ? <Loader2 size={20} className="spin" /> : <CheckCircle size={20} />} {loading ? "Mengirim..." : "Kirim Formulir"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}