import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import { Eye, EyeOff, AlertCircle, Loader2, LogIn, ArrowLeft } from "lucide-react";
import { login } from "../api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    if (!turnstileToken) {
      setError("Silakan lengkapi verifikasi keamanan (Captcha)");
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password, turnstileToken);
      if (result.success) {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message || "Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background-color)", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "var(--card-bg)", borderRadius: "12px", padding: "2.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", color: "var(--primary-color)", fontWeight: 800, marginBottom: "0.5rem" }}>Selamat Datang</h1>
          <p style={{ color: "var(--text-light)" }}>Silakan masuk ke panel admin</p>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label htmlFor="email" style={{ fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              placeholder="Masukkan email Anda"
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "2px solid #d1d5db", fontSize: "1rem" }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "2px solid #d1d5db", fontSize: "1rem", paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Tampilkan/sembunyikan password"
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-light)" }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Turnstile
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ""}
            onSuccess={(token) => setTurnstileToken(token)}
          />

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.85rem", backgroundColor: "var(--primary-color)", color: "white", fontWeight: 700, fontSize: "1.05rem", borderRadius: "8px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {loading ? <><Loader2 className="spin" size={20} /> Memproses...</> : <><LogIn size={20} /> Masuk ke Panel</>}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href="/" style={{ color: "var(--primary-color)", fontWeight: 600, fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={16} /> Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}