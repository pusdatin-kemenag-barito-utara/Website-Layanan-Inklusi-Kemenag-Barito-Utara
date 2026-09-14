import { useState } from "react";
import { Map as MapIcon, Navigation } from "lucide-react";

const areas = [
  { id: "masuk", name: "Pintu Masuk Utama", info: "Dilengkapi ramp kursi roda dengan kemiringan 6 derajat." },
  { id: "ptsp", name: "Ruang Pelayanan PTSP", info: "Loket khusus difabel berada di Loket 1 (paling ujung kanan)." },
  { id: "toilet", name: "Toilet Difabel", info: "Berada di lorong sebelah kiri ruang tunggu utama." },
  { id: "laktasi", name: "Ruang Laktasi", info: "Di sebelah kanan ruang tunggu, dekat area bermain anak." },
];

function pinStyle(isActive) {
  return {
    backgroundColor: isActive ? "var(--secondary-color)" : "var(--primary-color)",
    color: isActive ? "#000" : "#fff",
    padding: "8px 16px",
    borderRadius: "30px",
    border: "2px solid #fff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    transition: "all 0.2s",
    zIndex: isActive ? 20 : 10,
    transform: isActive ? "scale(1.1)" : "scale(1)",
  };
}

export default function PetaKantor() {
  const [activeArea, setActiveArea] = useState(null);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
      <div
        className="glass-panel"
        style={{ flex: "1 1 500px", borderRadius: "16px", padding: "1rem", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", position: "relative", height: "500px", backgroundColor: "#e5e7eb", border: "2px solid var(--primary-color)" }}
      >
        <div style={{ position: "absolute", inset: "1rem", backgroundColor: "#f9fafb", borderRadius: "8px", border: "2px dashed #9ca3af", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#6b7280", fontSize: "1.2rem" }}>[ Area Denah 2D Kemenag Barito Utara ]</span>
        </div>

        <button onClick={() => setActiveArea(areas[0])} style={{ position: "absolute", bottom: "20%", left: "50%", transform: "translateX(-50%)", ...pinStyle(activeArea?.id === "masuk") }}>
          Pintu Masuk
        </button>
        <button onClick={() => setActiveArea(areas[1])} style={{ position: "absolute", top: "40%", left: "40%", ...pinStyle(activeArea?.id === "ptsp") }}>
          PTSP
        </button>
        <button onClick={() => setActiveArea(areas[2])} style={{ position: "absolute", top: "30%", left: "15%", ...pinStyle(activeArea?.id === "toilet") }}>
          Toilet
        </button>
        <button onClick={() => setActiveArea(areas[3])} style={{ position: "absolute", top: "30%", right: "15%", ...pinStyle(activeArea?.id === "laktasi") }}>
          Ruang Laktasi
        </button>
      </div>

      <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column" }}>
        <div className="glass-panel" style={{ borderRadius: "16px", padding: "2rem", flex: 1, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
          {activeArea ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--secondary-color)", marginBottom: "1rem" }}>
                <Navigation size={24} />
                <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-color)", margin: 0 }}>{activeArea.name}</h3>
              </div>
              <div style={{ padding: "1rem", backgroundColor: "rgba(11, 96, 86, 0.1)", borderRadius: "8px", borderLeft: "4px solid var(--primary-color)" }}>
                <p style={{ color: "var(--text-color)", fontSize: "1.1rem", margin: 0, lineHeight: 1.6 }}>{activeArea.info}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-light)", textAlign: "center" }}>
              <MapIcon size={64} style={{ opacity: 0.2, marginBottom: "1rem" }} />
              <p style={{ fontSize: "1.1rem" }}>Klik salah satu pin pada denah untuk melihat informasi aksesibilitas area tersebut.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}