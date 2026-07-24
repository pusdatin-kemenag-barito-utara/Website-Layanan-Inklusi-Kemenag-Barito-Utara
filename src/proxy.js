import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow health endpoint
  if (pathname === '/api/health') {
    return NextResponse.next();
  }

  // Bypass maintenance check if user is already visiting /maintenance
  if (pathname === '/maintenance') {
    return NextResponse.next();
  }

  // === MAINTENANCE CHECK ===
  try {
    const pusdatinUrl = process.env.NEXT_PUBLIC_PUSDATIN_URL || "https://pusdatin.kemenag-baritoutara.go.id";
    const appId = "inklusi_kemenag";

    const maintenanceRes = await fetch(
      `${pusdatinUrl}/api/public/apps/${appId}/status`,
      {
        next: { revalidate: 30 },
      }
    );

    if (maintenanceRes.ok) {
      const data = await maintenanceRes.json();
      if (data.status === "maintenance") {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
    }
  } catch (error) {
    console.error("[PROXY] Failed to fetch maintenance status:", error);
  }

  // === SESSION HANDLING ===
  let supabaseResponse = NextResponse.next({ request });

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
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = pathname.startsWith('/admin/dashboard');

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isProtectedRoute && user) {
    try {
      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          db: { schema: "kemenag_pusdatin" },
          cookies: {
            getAll() { return []; },
            setAll() { },
          }
        }
      );
      
      const { data: userRecord } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (userRecord?.role !== 'super_admin') {
        const { data: perm } = await supabaseAdmin
          .from('app_permissions')
          .select('role')
          .eq('user_id', user.id)
          .eq('app_id', 'inklusi_kemenag')
          .single();
          
        if (!perm) {
          const url = new URL('/admin/login', request.url);
          url.searchParams.set('error', 'unauthorized');
          return NextResponse.redirect(url);
        }
      }
    } catch (e) {
      console.error("[PROXY] RBAC error:", e);
    }
  }

  if (pathname === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
