import React, { useState, useEffect } from "react";
import { Clock, Sun, Moon } from "lucide-react";

export default function JadwalSholat() {
  const [blink, setBlink] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [jadwal, setJadwal] = useState([
    { nama: "Subuh", id: "subuh", waktu: "--:--", icon: <Moon size={16} /> },
    { nama: "Dzuhur", id: "dzuhur", waktu: "--:--", icon: <Sun size={16} /> },
    { nama: "Ashar", id: "ashar", waktu: "--:--", icon: <Sun size={16} /> },
    { nama: "Maghrib", id: "maghrib", waktu: "--:--", icon: <Moon size={16} /> },
    { nama: "Isya", id: "isya", waktu: "--:--", icon: <Moon size={16} /> },
  ]);

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const date = String(today.getDate()).padStart(2, "0");
        const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/2203/${year}/${month}/${date}`);
        const json = await res.json();
        if (json.status && json.data && json.data.jadwal) {
          const apiJadwal = json.data.jadwal;
          setJadwal((prev) => prev.map((item) => ({ ...item, waktu: apiJadwal[item.id] || item.waktu })));
        }
      } catch (error) {
        if (import.meta.env.PROD) console.error("Gagal mengambil jadwal sholat:", error.message || error);
      }
    };
    fetchJadwal();

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };

    const timeout = setTimeout(updateTime, 0);
    const interval = setInterval(() => {
      setBlink((v) => !v);
      updateTime();
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 6px 25px -4px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", margin: "2rem auto", width: "100%" }}>
      <div className="jadwal-header" style={{ background: "linear-gradient(135deg, #0b6056 0%, #084338 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", padding: "1.1rem 1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Clock size={20} style={{ color: "#ffffff" }} />
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.2px" }}>
            Jadwal Sholat Kabupaten Barito Utara
          </h3>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {currentTime && <span style={{ fontWeight: "700", letterSpacing: "1px", fontSize: "1rem", color: "#ffffff" }}>{currentTime} WITA</span>}
          <span style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#ffffff", borderRadius: "20px", padding: "4px 12px", fontSize: "0.8rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.25)" }}>Hari Ini</span>
        </div>
      </div>

      <div className="jadwal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", padding: "1.25rem 1.75rem" }}>
        {jadwal.map((item, idx) => {
          const isNow = item.waktu !== "--:--" && nowStr >= item.waktu && (idx === jadwal.length - 1 ? true : nowStr < jadwal[idx + 1].waktu);
          return (
            <div key={idx} className="jadwal-item" style={{
              padding: "14px 10px",
              textAlign: "center",
              backgroundColor: isNow ? "rgba(11, 96, 86, 0.08)" : "#f8fafc",
              border: isNow ? "2px solid #0b6056" : "1px solid #e2e8f0",
              color: isNow ? "#0b6056" : "#334155",
              borderRadius: "12px",
              transition: "all 0.3s ease",
            }}>
              <p style={{ margin: "0 0 6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600, color: isNow ? "#0b6056" : "#64748b" }}>
                {item.icon} {item.nama}
              </p>
              <strong style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "0.5px" }}>{item.waktu}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
