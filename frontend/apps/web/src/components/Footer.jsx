import { Globe, Camera, MapPin, Phone, Mail } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-col brand-col">
          <div className="brand-header">
            <div className="logo-wrapper">
              <img src="/assets/branding/kemenag.svg" alt="Logo Kemenag" width={45} height={45} />
            </div>
            <div>
              <h3>LAYANAN INKLUSI</h3>
              <span>KEMENTERIAN AGAMA KABUPATEN BARITO UTARA</span>
            </div>
          </div>
          <p className="footer-description">
            Pusat layanan inklusi untuk 5 layanan prioritas Kemenag Barito Utara, meliputi pelayanan bagi penyandang disabilitas, lanjut usia, ibu hamil & menyusui, serta kemudahan layanan antar-jemput dan jemput bola.
          </p>
          <div className="social-icons">
            <a href="#" className="social-icon"><Globe size={20} /></a>
            <a href="#" className="social-icon"><Camera size={20} /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>TAUTAN INTI</h4>
          <ul>
            <li><a href="/">Beranda</a></li>
            <li><a href="/profile/latar-belakang">Profile</a></li>
            <li><a href="/informasi/pengumuman">Informasi</a></li>
            <li><a href="/standar-layanan">Standar Pelayanan</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>LAYANAN</h4>
          <ul>
            <li><a href="/formulir">Formulir Identifikasi Rentan</a></li>
            <li><a href="/berita">Berita</a></li>
            <li><a href="/galeri">Video</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>HUBUNGI KAMI</h4>
          <ul className="contact-info">
            <li>
              <span className="icon"><MapPin size={18} /></span>
              <span>Jl. Ahmad Yani No.176 Muara Teweh 73811</span>
            </li>
            <li>
              <span className="icon"><Phone size={18} /></span>
              <span>+62 851-1749-1212</span>
            </li>
            <li>
              <span className="icon"><Mail size={18} /></span>
              <span>ptspkemenagbaritoutara@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Kantor Kementerian Agama Kabupaten Barito Utara. | <a href="https://baritoutara.kemenag.go.id" target="_blank" rel="noopener noreferrer" className="footer-link">baritoutara.kemenag.go.id</a></p>
      </div>
    </footer>
  );
}
