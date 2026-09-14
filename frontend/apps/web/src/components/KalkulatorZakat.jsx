import { useState } from "react";
import { Calculator, Volume2, Coins } from "lucide-react";

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
}

function speakText(text) {
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "id-ID";
    window.speechSynthesis.speak(u);
  } else {
    alert("Browser Anda tidak mendukung output suara.");
  }
}

export default function KalkulatorZakat() {
  const [harta, setHarta] = useState("");
  const [zakat, setZakat] = useState(null);

  const hitungZakat = (e) => {
    e.preventDefault();
    const nilai = parseFloat(harta.replace(/[^0-9]/g, ""));
    if (isNaN(nilai)) return;
    const nisab = 85000000;
    setZakat(nilai >= nisab ? nilai * 0.025 : 0);
  };

  return (
    <div class="glass-panel" style={{ borderRadius: "16px", padding: "3rem", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", border: "4px solid var(--secondary-color)" }}>
      <form onSubmit={hitungZakat}>
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>
            Total Harta Tabungan Anda (Rupiah)
            <button type="button" onClick={() => speakText("Silakan masukkan total harta tabungan Anda dalam rupiah")} aria-label="Bacakan Instruksi" style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer" }}>
              <Volume2 size={24} />
            </button>
          </label>
          <input
            type="text"
            required
            value={harta}
            onChange={(e) => setHarta(e.target.value)}
            placeholder="Contoh: 100000000"
            style={{ width: "100%", padding: "1.5rem", fontSize: "2rem", fontWeight: 800, borderRadius: "12px", border: "3px solid #000", backgroundColor: "white", color: "#000", textAlign: "right", letterSpacing: "2px" }}
          />
          <p style={{ marginTop: "0.5rem", fontSize: "1rem", color: "var(--text-light)", fontStyle: "italic" }}>*Nisab Asumsi: Rp 85.000.000 (85 gram emas murni)</p>
        </div>

        <button type="submit" onClick={() => speakText("Menghitung zakat")} style={{ width: "100%", padding: "1.5rem", backgroundColor: "var(--primary-color)", color: "white", fontSize: "1.5rem", fontWeight: 800, borderRadius: "12px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          <Coins size={28} /> Hitung Kewajiban Zakat
        </button>
      </form>

      {zakat !== null && (
        <div style={{ marginTop: "3rem", padding: "2rem", backgroundColor: zakat > 0 ? "#ecfdf5" : "#f3f4f6", border: `4px solid ${zakat > 0 ? "#10b981" : "#9ca3af"}`, borderRadius: "12px", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", color: "#1f2937", marginBottom: "1rem" }}>{zakat > 0 ? "Zakat yang wajib dikeluarkan:" : "Status:"}</h2>
          <p style={{ fontSize: "3rem", fontWeight: 900, color: zakat > 0 ? "#047857" : "#4b5563", margin: "1rem 0" }}>{zakat > 0 ? formatRupiah(zakat) : "Belum Wajib Zakat"}</p>
          <button onClick={() => speakText(zakat > 0 ? `Zakat yang wajib dikeluarkan adalah sebesar ${zakat} rupiah.` : "Harta Anda belum mencapai nisab, sehingga belum wajib dizakati.")} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", backgroundColor: "var(--secondary-color)", color: "#000", fontWeight: 700, borderRadius: "30px", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>
            <Volume2 size={20} /> Bacakan Hasil
          </button>
        </div>
      )}

      <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-light)", fontSize: "0.9rem" }}>
        <Calculator size={16} /> Kalkulator Zakat Aksesibel - ramah netra
      </div>
    </div>
  );
}