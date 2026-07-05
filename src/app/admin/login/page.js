'use client'

import { useState } from 'react';
import { loginAction } from '../actions';
import './login.css';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, ArrowLeft, LogIn, Loader2 } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.target);
    if (!turnstileToken) {
      setError('Silakan lengkapi verifikasi keamanan (Captcha)');
      setLoading(false);
      return;
    }
    formData.append('turnstileToken', turnstileToken);
    
    try {
      const result = await loginAction(formData);
      
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success) {
        router.push('/admin/dashboard');
      } else {
        // Fallback if no error and no success explicitly returned
        router.push('/admin/dashboard');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('Terjadi kesalahan yang tidak terduga pada server.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Left Brand Section */}
      <div className="login-brand-section">
        <div className="brand-logo-container">
          <Image src="/assets/branding/kemenag.svg" alt="Logo" width={50} height={50} />
          <h2>KEMENAG BARITO UTARA</h2>
        </div>
        
        <div className="brand-message">
          <h1>Portal Layanan Inklusi</h1>
          <p>
            Platform digital khusus untuk pengelolaan layanan inklusif di lingkungan Kementerian Agama Kabupaten Barito Utara. Wujudkan layanan yang setara dan transparan.
          </p>
        </div>
        
        <div className="brand-footer">
          &copy; {new Date().getFullYear()} Kantor Kemenag Barito Utara
        </div>
      </div>

      {/* Right Form Section */}
      <div className="login-form-section">
        <div className="login-form-container">
          
          <div className="mobile-brand">
            <Image src="/assets/branding/kemenag.svg" alt="Logo" width={60} height={60} />
            <h2>Layanan Inklusi Kemenag</h2>
          </div>

          <div className="form-header">
            <h2>Selamat Datang</h2>
            <p>Silakan masuk ke panel admin Anda</p>
          </div>
          
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required autoComplete="email" placeholder="Masukkan email Anda" />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  required 
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  className="btn-toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group remember-me-group">
              <label className="checkbox-label">
                <input type="checkbox" name="rememberMe" id="rememberMe" />
                <span>Ingat Saya</span>
              </label>
            </div>
            
            <div className="form-group turnstile-container">
              <Turnstile 
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                onSuccess={(token) => setTurnstileToken(token)}
              />
            </div>
            
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Memproses...
                </>
              ) : (
                <>
                  <LogIn size={20} /> Masuk ke Panel
                </>
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <Link href="/">
              <ArrowLeft size={16} /> Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
