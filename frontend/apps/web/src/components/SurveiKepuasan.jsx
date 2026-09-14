import { useState } from "react";
import { Smile, Frown, Meh, Send } from "lucide-react";

export default function SurveiKepuasan() {
  const [rating, setRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "id-ID";
      window.speechSynthesis.speak(u);
    }
  };

  const handleRating = (val, message) => {
    setRating(val);
    speakText(message);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating) {
      setSubmitted(true);
      speakText("Terima kasih atas penilaian Anda. Survei berhasil dikirim.");
    }
  };

  if (submitted) {
    return (
      <div class="glass-panel" style={{ borderRadius: "16px", padding: "4rem 2rem", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <Smile size={80} color="var(--primary-color)" style={{ margin: "0 auto 1.5rem" }} />
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>Terima Kasih!</h2>
        <p style={{ fontSize: "1.2rem", color: "var(--text-light)" }}>Penilaian Anda sangat berarti bagi komitmen kami dalam melayani masyarakat.</p>
      </div>
    );
  }

  const options = [
    { key: "puas", label: "Sangat Puas", color: "puas" ? "#10b981" : "", bg: "#ecfdf5", icon: <Smile size={64} /> },
    { key: "cukup", label: "Biasa Saja", color: "#f59e0b", bg: "#fffbeb", icon: <Meh size={64} /> },
    { key: "kecewa", label: "Kurang Puas", color: "#ef4444", bg: "#fef2f2", icon: <Frown size={64} /> },
  ];

  return (
    <form onSubmit={handleSubmit} class="glass-panel" style={{ borderRadius: "16px", padding: "3rem", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      <h3 style={{ fontSize: "1.5rem", textAlign: "center", marginBottom: "2.5rem", fontWeight: 600 }}>Bagaimana pendapat Anda tentang pelayanan kami hari ini?</h3>

      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "3rem" }}>
        {options.map((opt) => {
          const active = rating === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleRating(opt.key, `Anda memilih: ${opt.label}`)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "2rem 1rem", borderRadius: "16px", border: active ? `4px solid ${opt.color}` : "2px solid transparent", backgroundColor: active ? opt.bg : "rgba(0,0,0,0.03)", cursor: "pointer", transition: "all 0.2s", width: "130px" }}>
              <span style={{ color: active ? opt.color : "#9ca3af" }}>{opt.icon}</span>
              <span style={{ fontWeight: 700, fontSize: "1.1rem", color: active ? opt.color : "#6b7280" }}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "0.75rem" }}>Saran & Masukan (Opsional)</label>
        <textarea rows={4} placeholder="Tuliskan saran Anda di sini..." style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "2px solid #d1d5db", fontSize: "1rem", resize: "vertical", outline: "none" }} />
      </div>

      <button type="submit" disabled={!rating} style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "none", backgroundColor: rating ? "var(--primary-color)" : "#d1d5db", color: "white", fontWeight: 700, fontSize: "1.2rem", cursor: rating ? "pointer" : "not-allowed", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
        <Send size={20} /> Kirim Penilaian
      </button>
    </form>
  );
}