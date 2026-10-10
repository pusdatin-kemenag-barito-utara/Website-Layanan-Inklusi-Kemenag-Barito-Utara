import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import { Eye, EyeOff, AlertCircle, Loader2, LogIn, ArrowLeft, ShieldCheck } from "lucide-react";
import { login } from "../api/client";

// Sitekey resolved strictly from environment
const TURNSTILE_SITE_KEY =
  (typeof window !== "undefined" && (window as unknown as { __TURNSTILE_SITE_KEY__?: string }).__TURNSTILE_SITE_KEY__) ||
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ||
  import.meta.env.VITE_TURNSTILE_SITE_KEY ||
  "";

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
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Silakan selesaikan verifikasi keamanan (Cloudflare Turnstile)");
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
      setError(e.message || "Email atau kata sandi tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      {/* Ambient background decoration */}
      <div style={{ position: "absolute", top: "10%", left: "15%", width: "18rem", height: "18rem", borderRadius: "9999px", background: "rgba(11, 96, 86, 0.08)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "15%", width: "18rem", height: "18rem", borderRadius: "9999px", background: "rgba(247, 168, 27, 0.08)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "440px", backgroundColor: "#ffffff", borderRadius: "16px", padding: "2.5rem 2rem", boxShadow: "0 10px 30px -5px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)", position: "relative", zIndex: 10 }}>
        {/* Header with Kemenag Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ width: "56px", height: "56px", margin: "0 auto 1rem", borderRadius: "50%", backgroundColor: "#e6f6ee", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #bbf0dc" }}>
            <img src="/favicon.svg" alt="Logo Kemenag" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#f1f5f9", padding: "3px 10px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, color: "#0b6056", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            <ShieldCheck size={14} /> Panel Administrasi
          </div>
          <h1 style={{ fontSize: "1.45rem", color: "#0f172a", fontWeight: 800, margin: "0 0 0.35rem" }}>Layanan Inklusi</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>Kementerian Agama Kabupaten Barito Utara</p>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1.25rem", fontSize: "0.875rem", lineHeight: "1.4" }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div>
            <label htmlFor="email" style={{ fontWeight: 600, display: "block", marginBottom: "0.4rem", fontSize: "0.875rem", color: "#1e293b" }}>Email Petugas</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              defaultValue="baritoutara@kemenag.go.id"
              placeholder="nama@kemenag.go.id"
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", backgroundColor: "#f8fafc", transition: "border-color 0.2s" }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ fontWeight: 600, display: "block", marginBottom: "0.4rem", fontSize: "0.875rem", color: "#1e293b" }}>Kata Sandi</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                style={{ width: "100%", padding: "0.75rem 1rem", paddingRight: "3rem", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", backgroundColor: "#f8fafc", transition: "border-color 0.2s" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Tampilkan atau sembunyikan kata sandi"
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {TURNSTILE_SITE_KEY && (
            <div style={{ width: "100%", display: "flex", justifyContent: "center", minHeight: "65px", padding: "0.25rem 0" }}>
              <div style={{ width: "100%" }}>
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  style={{ width: "100%" }}
                  options={{
                    theme: "light",
                    size: "flexible",
                    language: "id",
                  }}
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setError("");
                  }}
                  onError={(errorCode) => {
                    console.warn("[Cloudflare Turnstile] Challenge status/error:", errorCode);
                  }}
                  onExpire={() => setTurnstileToken("")}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.85rem", backgroundColor: loading ? "#084338" : "#0b6056", color: "#ffffff", fontWeight: 700, fontSize: "0.95rem", borderRadius: "10px", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(11, 96, 86, 0.2)", transition: "background-color 0.2s, transform 0.1s" }}
          >
            {loading ? <><Loader2 className="spin" size={18} /> Memverifikasi...</> : <><LogIn size={18} /> Masuk ke Panel</>}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid #f1f5f9" }}>
          <a href="/" style={{ color: "#0b6056", fontWeight: 600, fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
            <ArrowLeft size={15} /> Kembali ke Beranda Publik
          </a>
        </div>
      </div>
    </div>
  );
}