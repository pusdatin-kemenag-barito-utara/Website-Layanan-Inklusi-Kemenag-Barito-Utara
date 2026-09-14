import { useState } from "react";
import { PlayCircle, Eye, Volume2 } from "lucide-react";

export default function PanduanIbadah() {
  const [adEnabled, setAdEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <div class="glass-panel" style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      <div style={{ padding: "1.5rem 2rem", backgroundColor: "var(--card-bg)", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.5rem", color: "var(--text-color)", margin: 0 }}>Tata Cara Manasik Haji (Bagian 1)</h2>
        <button onClick={() => setAdEnabled(!adEnabled)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "30px", cursor: "pointer", fontWeight: 700, backgroundColor: adEnabled ? "var(--secondary-color)" : "#f3f4f6", color: adEnabled ? "#000" : "#4b5563", border: adEnabled ? "2px solid var(--primary-color)" : "1px solid #d1d5db" }}>
          {adEnabled ? <Volume2 size={20} /> : <Eye size={20} />}
          {adEnabled ? "Deskripsi Audio: HIDUP" : "Deskripsi Audio: MATI"}
        </button>
      </div>

      <div style={{ width: "100%", height: "500px", backgroundColor: "#000", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!playing ? (
          <button onClick={() => setPlaying(true)} aria-label="Putar Video" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <PlayCircle size={100} color="white" />
          </button>
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
            <p style={{ fontSize: "1.5rem", opacity: 0.5 }}>[ Video Sedang Berjalan... ]</p>
            {adEnabled && (
              <div style={{ position: "absolute", bottom: "10%", backgroundColor: "rgba(0,0,0,0.8)", padding: "1rem 2rem", borderRadius: "8px", color: "var(--secondary-color)", fontSize: "1.2rem", textAlign: "center", maxWidth: "80%", borderLeft: "4px solid var(--secondary-color)" }}>
                <i>[Suara Narator AD]: &quot;Di layar tampak rombongan jemaah haji sedang berjalan mengelilingi Ka&apos;bah (Tawaf). Sebagian besar mengenakan pakaian ihram putih bersih.&quot;</i>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: "2rem", backgroundColor: "var(--card-bg)" }}>
        <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Tentang Fitur Ini</h3>
        <p style={{ color: "var(--text-light)", lineHeight: 1.6 }}>
          Fitur Deskripsi Audio (AD) dirancang untuk menceritakan elemen visual penting dalam video yang tidak dapat dilihat oleh pengguna tuna netra. Ketika dihidupkan, narator akan membacakan teks deskriptif di jeda dialog video utama, sehingga setiap jemaah memiliki pemahaman yang setara mengenai tata cara ibadah.
        </p>
      </div>
    </div>
  );
}