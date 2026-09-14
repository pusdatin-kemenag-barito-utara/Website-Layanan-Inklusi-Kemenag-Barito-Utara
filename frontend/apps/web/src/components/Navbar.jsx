import React, { useState } from "react";
import { User, Menu, X, ChevronDown } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");

  const toggleDropdown = (menu, e) => {
    e.preventDefault();
    setOpenDropdown(openDropdown === menu ? "" : menu);
  };

  const toggleMenu = () => setIsMobileMenuOpen((v) => !v);

  React.useEffect(() => {
    if (isMobileMenuOpen) document.body.classList.add("mobile-menu-open-lock");
    else document.body.classList.remove("mobile-menu-open-lock");
    return () => document.body.classList.remove("mobile-menu-open-lock");
  }, [isMobileMenuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-container">
          <a href="/" className="navbar-brand">
            <div className="logo-circle">
              <img src="/assets/branding/kemenag.svg" alt="Logo Kemenag" width={36} height={36} className="navbar-logo" />
            </div>
            <div className="navbar-title">
              <strong>LAYANAN INKLUSI</strong>
              <span>KEMENTERIAN AGAMA KABUPATEN BARITO UTARA</span>
            </div>
          </a>
          <div className="navbar-actions desktop-only">
            <a href="/admin/login" className="btn-login-modern">
              <span className="icon"><User size={18} /></span>
              <span>Masuk Admin</span>
            </a>
          </div>
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            <Menu size={28} />
          </button>
        </div>
      </div>

      <div className={`mobile-backdrop ${isMobileMenuOpen ? "open" : ""}`} onClick={isMobileMenuOpen ? toggleMenu : undefined}></div>

      <div className={`navbar-bottom ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="mobile-sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="logo-circle" style={{ width: "40px", height: "40px" }}>
              <img src="/assets/branding/kemenag.svg" alt="Logo Kemenag" width={26} height={26} />
            </div>
            <div className="mobile-sidebar-title">
              <strong>KEMENTERIAN AGAMA</strong>
              <span>BARITO UTARA</span>
            </div>
          </div>
          <button onClick={toggleMenu} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#4b5563" }}>
            <X size={20} />
          </button>
        </div>

        <div className="navbar-container menu-container">
          <ul className="navbar-menu">
            <li className="active"><a href="/" onClick={toggleMenu}>Home</a></li>

            <li className={`dropdown ${openDropdown === "profile" ? "open" : ""}`}>
              <span className="dropdown-toggle" tabIndex="0" onClick={(e) => toggleDropdown("profile", e)}>
                Profile
                <span className={`caret-wrapper ${openDropdown === "profile" ? "rotated" : ""}`}><ChevronDown size={18} /></span>
              </span>
              <ul className="dropdown-menu">
                <li><a href="/profile/latar-belakang" onClick={toggleMenu}>Latar Belakang Inklusi</a></li>
                <li><a href="/profile/tim" onClick={toggleMenu}>Tim Layanan Inklusi</a></li>
                <li><a href="/profile/fasilitas" onClick={toggleMenu}>Fasilitas Ramah Disabilitas</a></li>
                <li><a href="/profile/peta-kantor" onClick={toggleMenu}>Peta Denah Kantor</a></li>
                <li><a href="/virtual-tour" onClick={toggleMenu}>Tur Virtual 360°</a></li>
              </ul>
            </li>

            <li className={`dropdown ${openDropdown === "informasi" ? "open" : ""}`}>
              <span className="dropdown-toggle" tabIndex="0" onClick={(e) => toggleDropdown("informasi", e)}>
                Informasi
                <span className={`caret-wrapper ${openDropdown === "informasi" ? "rotated" : ""}`}><ChevronDown size={18} /></span>
              </span>
              <ul className="dropdown-menu">
                <li><a href="/informasi/pengumuman" onClick={toggleMenu}>Pengumuman</a></li>
                <li><a href="/informasi/regulasi" onClick={toggleMenu}>Regulasi / Dasar Hukum</a></li>
                <li><a href="/informasi/skm" onClick={toggleMenu}>Survei Kepuasan (SKM)</a></li>
                <li><a href="/kamus-isyarat" onClick={toggleMenu}>Kamus Isyarat (BISINDO)</a></li>
                <li><a href="/pengaduan" onClick={toggleMenu}>Layanan Pengaduan</a></li>
              </ul>
            </li>

            <li className={`dropdown ${openDropdown === "layanan" ? "open" : ""}`}>
              <span className="dropdown-toggle" tabIndex="0" onClick={(e) => toggleDropdown("layanan", e)}>
                Layanan Khusus
                <span className={`caret-wrapper ${openDropdown === "layanan" ? "rotated" : ""}`}><ChevronDown size={18} /></span>
              </span>
              <ul className="dropdown-menu">
                <li><a href="/booking" onClick={toggleMenu} style={{ color: "var(--secondary-color)", fontWeight: "800" }}>Antrean Prioritas</a></li>
                <li><a href="/layanan/tracking" onClick={toggleMenu}>Pelacakan Berkas</a></li>
                <li><a href="/layanan/kalkulator-zakat" onClick={toggleMenu}>Kalkulator Zakat</a></li>
                <li><a href="/layanan/literasi-audio" onClick={toggleMenu}>Pojok Literasi Audio</a></li>
                <li><a href="/layanan/panduan-ibadah" onClick={toggleMenu}>Panduan Ibadah (AD)</a></li>
              </ul>
            </li>

            <li><a href="/formulir" onClick={toggleMenu}>Form Identifikasi</a></li>
            <li><a href="/standar-layanan" onClick={toggleMenu}>Standar Pelayanan</a></li>
            <li><a href="/berita" onClick={toggleMenu}>Berita</a></li>
            <li><a href="/galeri" onClick={toggleMenu}>Video</a></li>

            <li className="mobile-only login-list-item" style={{ marginTop: "2rem", padding: "0 1rem", paddingBottom: "1rem" }}>
              <a href="/admin/login" onClick={toggleMenu} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#059669", color: "white", padding: "12px", borderRadius: "30px", fontWeight: "700", textDecoration: "none", boxShadow: "0 4px 6px -1px rgba(5, 150, 105, 0.4)" }}>
                <User size={18} /> Login Admin
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
