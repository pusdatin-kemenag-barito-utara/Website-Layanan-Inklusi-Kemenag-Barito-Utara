import { useEffect, useState } from "react";
import { api } from "../api/client";

type Stats = {
  berita: number;
  pengumuman: number;
  agenda: number;
  dokumen: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [berita, pengumuman, agenda, dokumen] = await Promise.all([
          api.get("/api/admin/berita").then((r) => (r as unknown[]).length),
          api.get("/api/admin/pengumuman").then((r) => (r as unknown[]).length),
          api.get("/api/admin/agenda").then((r) => (r as unknown[]).length),
          api.get("/api/admin/dokumen").then((r) => (r as unknown[]).length),
        ]);
        setStats({ berita, pengumuman, agenda, dokumen });
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  return (
    <div>
      <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", color: "var(--text-color)" }}>Dashboard</h1>
      </div>

      {error && <p style={{ color: "#b91c1c" }}>Gagal memuat statistik: {error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
        {stats ? (
          [
            { label: "Total Berita", value: stats.berita },
            { label: "Pengumuman", value: stats.pengumuman },
            { label: "Agenda", value: stats.agenda },
            { label: "Dokumen", value: stats.dokumen },
          ].map((s) => (
            <div key={s.label} style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h3 style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>{s.label}</h3>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "#111827" }}>{s.value}</p>
            </div>
          ))
        ) : (
          <p>Memuat...</p>
        )}
      </div>
    </div>
  );
}