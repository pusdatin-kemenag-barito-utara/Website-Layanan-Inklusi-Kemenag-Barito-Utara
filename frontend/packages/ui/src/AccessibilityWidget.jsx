import React, { useState, useEffect } from "react";
import { useAccessibility } from "./AccessibilityProvider";
import {
  Settings,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Type,
  Volume2,
  VolumeX,
  X,
  Languages,
} from "lucide-react";

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [ttsMode, setTtsMode] = useState(false);
  const [bahasaDaerah, setBahasaDaerah] = useState(false);
  const {
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    isHighContrast,
    toggleHighContrast,
    isDyslexiaFont,
    toggleDyslexiaFont,
    isSpeaking,
    stopSpeaking,
    speakText,
  } = useAccessibility();

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (ttsMode && e.target.innerText) speakText(e.target.innerText);
    };
    if (ttsMode) document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
      stopSpeaking();
    };
  }, [ttsMode, speakText, stopSpeaking]);

  return (
    <div style={{ position: "fixed", bottom: "20px", left: "20px", zIndex: 9999 }}>
      {isOpen && (
        <div style={{
          backgroundColor: "var(--card-bg)",
          color: "var(--text-color)",
          border: "1px solid var(--primary-color)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "10px",
          width: "280px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Alat Aksesibilitas</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-color)" }}>
              <X size={20} />
            </button>
          </div>

          <div>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Ukuran Teks</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={decreaseFontSize} style={btnStyle} title="Perkecil Teks"><ZoomOut size={16} /> A-</button>
              <button onClick={resetFontSize} style={btnStyle} title="Reset">Reset</button>
              <button onClick={increaseFontSize} style={btnStyle} title="Perbesar Teks"><ZoomIn size={16} /> A+</button>
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Tampilan</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={toggleHighContrast}
                style={{ ...btnStyle, backgroundColor: isHighContrast ? "var(--primary-color)" : "", color: isHighContrast ? "#fff" : "var(--text-color)" }}
              >
                {isHighContrast ? <Sun size={16} /> : <Moon size={16} />} Kontras
              </button>
              <button
                onClick={toggleDyslexiaFont}
                style={{ ...btnStyle, backgroundColor: isDyslexiaFont ? "var(--primary-color)" : "", color: isDyslexiaFont ? "#fff" : "var(--text-color)" }}
              >
                <Type size={16} /> Disleksia
              </button>
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Pembaca Suara (Klik Teks)</span>
            <button
              onClick={() => {
                setTtsMode(!ttsMode);
                if (ttsMode) stopSpeaking();
              }}
              style={{ ...btnStyle, width: "100%", backgroundColor: ttsMode ? "var(--primary-color)" : "", color: ttsMode ? "#fff" : "var(--text-color)" }}
            >
              {ttsMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {ttsMode ? "Mode Suara Aktif" : "Aktifkan Mode Suara"}
            </button>
          </div>

          <div>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Bahasa Daerah (Barito Utara)</span>
            <button
              onClick={() => {
                setBahasaDaerah(!bahasaDaerah);
                if (!bahasaDaerah) {
                  alert("Mode Bahasa Daerah (Dayak Bakumpai / Ma'anyan) diaktifkan (Simulasi).");
                }
              }}
              style={{ ...btnStyle, width: "100%", backgroundColor: bahasaDaerah ? "var(--secondary-color)" : "", color: bahasaDaerah ? "#000" : "var(--text-color)" }}
            >
              <Languages size={16} />
              {bahasaDaerah ? "Bahasa Dayak Aktif" : "Terjemahkan ke Dayak"}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "25px",
          backgroundColor: "var(--primary-color)",
          color: "white",
          border: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
        title="Alat Aksesibilitas"
      >
        <Settings size={28} />
      </button>
    </div>
  );
}

const btnStyle = {
  flex: 1,
  padding: "6px 8px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  backgroundColor: "#f3f4f6",
  color: "#374151",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  fontSize: "0.8rem",
  fontWeight: 500,
};
