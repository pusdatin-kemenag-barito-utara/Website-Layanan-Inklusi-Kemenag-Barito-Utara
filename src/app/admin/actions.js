'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { Client } from 'pg';

export async function loginAction(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const turnstileToken = formData.get('turnstileToken');

  if (!turnstileToken) {
    return { error: 'Verifikasi keamanan diperlukan' };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (secretKey) {
    try {
      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(turnstileToken)}`,
      });
      const data = await res.json();
      if (!data.success) {
        return { error: 'Verifikasi keamanan gagal. Silakan coba lagi.' };
      }
    } catch (err) {
      return { error: 'Terjadi kesalahan sistem saat memverifikasi keamanan.' };
    }
  }

  const cookieStore = await cookies();

  // Supabase SSR Authentication
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      db: {
        schema: "kemenag_inklusi",
      },
      cookieOptions: {
        name: "inklusi-auth",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (authError || !authData.user) {
    console.error('Auth Error:', authError);
    return { error: authError ? authError.message : 'Email atau password salah' };
  }

  // RBAC Check via Pusdatin direct DB connection
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  await pgClient.connect();
  
  try {
    const userResult = await pgClient.query(
      `SELECT id, role FROM kemenag_pusdatin.users WHERE email = $1`,
      [authData.user.email]
    );

    if (userResult.rows.length === 0) {
      await supabase.auth.signOut();
      return { error: 'Akun tidak ditemukan di sistem pusat.' };
    }

    const userRecord = userResult.rows[0];

    if (userRecord?.role !== 'super_admin') {
      const permissionResult = await pgClient.query(
        `SELECT * FROM kemenag_pusdatin.app_permissions WHERE user_id = $1 AND app_id = $2`,
        [userRecord.id, 'inklusi_kemenag']
      );

      if (permissionResult.rows.length === 0 || permissionResult.rows[0].role === 'none') {
        await supabase.auth.signOut();
        return { error: 'Akun Anda tidak memiliki akses ke aplikasi Pusat Layanan Inklusi.' };
      }
    }
  } catch (err) {
    console.error('RBAC Error:', err);
    await supabase.auth.signOut();
    return { error: 'Terjadi kesalahan sistem saat mengecek akses.' };
  } finally {
    await pgClient.end();
  }

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      db: {
        schema: "kemenag_inklusi",
      },
      cookieOptions: {
        name: "inklusi-auth",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {}
        },
      },
    }
  );

  await supabase.auth.signOut();
  redirect('/admin/login');
}
