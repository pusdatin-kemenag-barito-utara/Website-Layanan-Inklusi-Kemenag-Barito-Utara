import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import NewsPage from "./pages/News";
import PengumumanPage from "./pages/Pengumuman";
import AgendaPage from "./pages/Agenda";
import GaleriPage from "./pages/Galeri";
import DokumenPage from "./pages/Dokumen";
import BookingPage from "./pages/Booking";
import PengaduanPage from "./pages/Pengaduan";
import FormulirPage from "./pages/Formulir";
import BerkasPage from "./pages/Berkas";
import Layout from "./components/Layout";
import { api } from "./api/client";

function RequireAuth({ children }: { children: ReactElement }) {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    let active = true;
    api
      .get<unknown>("/api/auth/me")
      .then(() => active && setStatus("ok"))
      .catch(() => active && setStatus("denied"));
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background-color)" }}>
        <p>Memuat sesi...</p>
      </div>
    );
  }
  if (status === "denied") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="berita" element={<NewsPage />} />
        <Route path="pengumuman" element={<PengumumanPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="galeri" element={<GaleriPage />} />
        <Route path="dokumen" element={<DokumenPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="pengaduan-masuk" element={<PengaduanPage />} />
        <Route path="formulir" element={<FormulirPage />} />
        <Route path="berkas" element={<BerkasPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}