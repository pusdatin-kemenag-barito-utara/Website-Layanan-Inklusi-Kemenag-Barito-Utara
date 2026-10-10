import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, FileText, Bell, Calendar, Image as ImageIcon, BookOpen, ClipboardList, MessageSquareWarning, UserRound, PackageSearch, LogOut } from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/admin/dashboard", icon: Home },
  { name: "Berita", path: "/admin/berita", icon: FileText },
  { name: "Pengumuman", path: "/admin/pengumuman", icon: Bell },
  { name: "Agenda", path: "/admin/agenda", icon: Calendar },
  { name: "Galeri", path: "/admin/galeri", icon: ImageIcon },
  { name: "Dokumen", path: "/admin/dokumen", icon: BookOpen },
  { name: "Antrean Prioritas", path: "/admin/booking", icon: ClipboardList },
  { name: "Pengaduan", path: "/admin/pengaduan-masuk", icon: MessageSquareWarning },
  { name: "Formulir", path: "/admin/formulir", icon: UserRound },
  { name: "Tracking", path: "/admin/berkas", icon: PackageSearch },
];

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    localStorage.removeItem("inklusi_token");
    // Hard replacement of history entry to prevent back-button restoration
    window.location.replace("/admin/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ color: "var(--primary-color)", fontSize: "1.25rem" }}>Panel Admin</h2>
        </div>
        <nav style={{ padding: "1rem 0" }}>
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1.5rem",
                color: isActive ? "var(--primary-color)" : "#4b5563",
                backgroundColor: isActive ? "#f3f4f6" : "transparent",
                borderRight: isActive ? "3px solid var(--primary-color)" : "none",
                fontWeight: isActive ? 700 : 400,
              })}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb" }}>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: 600 }}>
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
