'use client';

import { useState, useEffect } from 'react';
import { Clock, Sun, Moon } from 'lucide-react';

export default function JadwalSholat() {
  const [blink, setBlink] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [jadwal, setJadwal] = useState([
    { nama: 'Subuh', id: 'subuh', waktu: '--:--', icon: <Moon size={16} /> },
    { nama: 'Dzuhur', id: 'dzuhur', waktu: '--:--', icon: <Sun size={16} /> },
    { nama: 'Ashar', id: 'ashar', waktu: '--:--', icon: <Sun size={16} /> },
    { nama: 'Maghrib', id: 'maghrib', waktu: '--:--', icon: <Moon size={16} /> },
    { nama: 'Isya', id: 'isya', waktu: '--:--', icon: <Moon size={16} /> }
  ]);

  // Simulasi fitur inklusif (berkedip) untuk tes dan Jam Terkini
  useEffect(() => {
    // 1. Fetch jadwal sholat dari API MyQuran (ID 2203 untuk Kab. Barito Utara)
    const fetchJadwal = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const date = String(today.getDate()).padStart(2, '0');
        
        const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/2203/${year}/${month}/${date}`);
        const json = await res.json();
        
        if (json.status && json.data && json.data.jadwal) {
          const apiJadwal = json.data.jadwal;
          setJadwal(prev => prev.map(item => ({
            ...item,
            waktu: apiJadwal[item.id] || item.waktu
          })));
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'development') {
          console.error("Gagal mengambil jadwal sholat:", error.message || error);
        }
      }
    };
    fetchJadwal();

    // 2. Update waktu sekarang
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    const timeout = setTimeout(updateTime, 0);
    
    const interval = setInterval(() => {
      setBlink(prev => !prev);
      updateTime();
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', marginTop: '2rem' }}>
      <div className="jadwal-header" style={{ backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <h3 className="jadwal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock className="jadwal-icon" size={18} /> Jadwal Sholat Barito Utara
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {currentTime && (
            <span className="jadwal-time" style={{ fontWeight: 'bold', letterSpacing: '1px' }}>
              {currentTime}
            </span>
          )}
          <span className="jadwal-badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>Hari Ini</span>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .jadwal-header {
          padding: 1rem;
        }
        .jadwal-title {
          font-size: 1.1rem;
        }
        .jadwal-time {
          font-size: 0.9rem;
        }
        .jadwal-badge {
          font-size: 0.8rem;
          padding: 4px 8px;
        }
        .jadwal-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
          padding: 1rem;
        }
        .jadwal-item {
          padding: 10px 5px;
        }
        .jadwal-item-title {
          font-size: 0.9rem;
        }
        .jadwal-item-time {
          font-size: 1.25rem;
        }

        @media (max-width: 600px) {
          .jadwal-header {
            padding: 0.75rem;
            justify-content: center;
          }
          .jadwal-title {
            font-size: 0.95rem;
          }
          .jadwal-title svg {
            width: 15px !important;
            height: 15px !important;
          }
          .jadwal-time {
            font-size: 0.85rem;
          }
          .jadwal-badge {
            font-size: 0.7rem;
            padding: 3px 6px;
          }
          .jadwal-grid {
            grid-template-columns: repeat(3, 1fr);
            padding: 0.75rem;
            gap: 0.4rem;
          }
          .jadwal-item {
            padding: 6px 4px !important;
          }
          .jadwal-item-title {
            font-size: 0.75rem !important;
          }
          .jadwal-item-title svg {
            width: 13px !important;
            height: 13px !important;
          }
          .jadwal-item-time {
            font-size: 1.05rem !important;
          }
          /* Make the last two span nicely on bottom row */
          .jadwal-grid > div:nth-child(4) {
            grid-column: 1 / span 1;
          }
          .jadwal-grid > div:nth-child(5) {
            grid-column: 2 / span 2;
          }
        }
      `}} />
      
      <div className="jadwal-grid">
        {jadwal.map((item, idx) => {
          // Tandai waktu sholat yang sedang aktif (contoh sederhana: berdasarkan jam sekarang)
          const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          const isNow = item.waktu !== '--:--' && nowStr >= item.waktu && 
                        (idx === jadwal.length - 1 ? true : nowStr < jadwal[idx + 1].waktu);
          
          return (
            <div className="jadwal-item" key={idx} style={{ 
              flex: '1 1 auto',
              textAlign: 'center', 
              backgroundColor: isNow ? (blink ? '#f59e0b' : 'var(--primary-color)') : 'transparent',
              color: isNow ? 'white' : 'var(--text-color)',
              borderRadius: '8px',
              transition: 'background-color 0.5s ease'
            }}>
              <p className="jadwal-item-title" style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                {item.icon} {item.nama}
              </p>
              <strong className="jadwal-item-time">{item.waktu}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
