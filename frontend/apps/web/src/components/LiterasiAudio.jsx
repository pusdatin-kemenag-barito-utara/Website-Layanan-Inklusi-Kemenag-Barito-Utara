import { useState } from "react";
import { Play, Pause } from "lucide-react";

const audioList = [
  { id: 1, title: "Panduan Praktis Sholat Fardhu", durasi: "15:30", speaker: "Ustadz H. Ahmad" },
  { id: 2, title: "Doa-Doa Pilihan Harian", durasi: "08:45", speaker: "Kemenag Barito Utara" },
  { id: 3, title: "Tata Cara Manasik Haji Lengkap (Audio)", durasi: "45:00", speaker: "KH. Abdullah" },
];

export default function LiterasiAudio() {
  const [playing, setPlaying] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {audioList.map((item) => (
        <div key={item.id} class="glass-panel" style={{ borderRadius: "16px", padding: "2rem", display: "flex", alignItems: "center", gap: "2rem", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
          <button
            onClick={() => setPlaying(playing === item.id ? null : item.id)}
            aria-label={playing === item.id ? "Jeda Audio" : "Putar Audio"}
            style={{ width: "80px", height: "80px", borderRadius: "50%", flexShrink: 0, backgroundColor: playing === item.id ? "var(--secondary-color)" : "var(--primary-color)", color: playing === item.id ? "#000" : "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}
          >
            {playing === item.id ? <Pause size={40} /> : <Play size={40} style={{ marginLeft: "8px" }} />}
          </button>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>{item.title}</h3>
            <p style={{ color: "var(--text-light)", fontSize: "1.1rem", marginBottom: "1rem" }}>Oleh: {item.speaker} &bull; Durasi: {item.durasi}</p>
            <div style={{ width: "100%", height: "12px", backgroundColor: "#e5e7eb", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ width: playing === item.id ? "45%" : "0%", height: "100%", backgroundColor: "var(--primary-color)", transition: "width 1s linear" }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}