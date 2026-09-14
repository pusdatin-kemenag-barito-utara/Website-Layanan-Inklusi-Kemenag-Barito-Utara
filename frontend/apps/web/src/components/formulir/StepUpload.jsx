import { useState } from "react";
import { UploadCloud } from "lucide-react";

export default function StepUpload({ file, setFile }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.2rem", color: "var(--text-color)" }}>
        Langkah 3: Unggah Dokumen Pendukung (Opsional)
      </h3>
      <p style={{ color: "var(--text-light)", marginBottom: "1rem" }}>
        Silakan unggah foto KTP atau dokumen pendukung medis jika diperlukan. Anda bisa melewati langkah ini.
      </p>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById("formulir-file")?.click()}
        style={{
          border: `2px dashed ${dragActive ? "var(--primary-color)" : "#d1d5db"}`,
          backgroundColor: dragActive ? "rgba(11,96,86,0.05)" : "transparent",
          borderRadius: "12px",
          padding: "3rem 2rem",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <UploadCloud
          size={48}
          color={dragActive ? "var(--primary-color)" : "#9ca3af"}
          style={{ margin: "0 auto 1rem" }}
        />
        <p style={{ fontWeight: 600, color: "var(--text-color)", marginBottom: "0.5rem" }}>
          {file ? file.name : "Tarik dan lepas file di sini, atau klik untuk memilih file"}
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
          Format yang didukung: JPG, PNG, PDF (Maks. 5MB)
        </p>
        <input
          id="formulir-file"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}
