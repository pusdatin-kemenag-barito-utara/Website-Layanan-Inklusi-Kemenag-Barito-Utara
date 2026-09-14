import { CheckCircle } from "lucide-react";

export default function SuccessState({ nama, kode }) {
  return (
    <div style={{ textAlign: "center", padding: "1rem 0" }}>
      <CheckCircle size={72} color="var(--primary-color)" style={{ margin: "0 auto 1.5rem" }} />
      <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Formulir Terkirim!</h3>
      <p style={{ color: "var(--text-light)", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
        Terima kasih, <strong>{nama}</strong>. Data Anda telah kami terima.
      </p>
      <p style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
        Nomor penyimpanan: <strong style={{ color: "var(--primary-color)" }}>{String(kode).padStart(4, "0")}</strong>
      </p>
    </div>
  );
}
