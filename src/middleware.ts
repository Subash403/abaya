import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  let isAuthenticated = false;

  // 1. Check custom admin session cookie first (for instant fallback / demo resilience)
  const adminCookie = request.cookies.get('wala_admin_session')?.value;
  if (adminCookie === 'authenticated') {
    isAuthenticated = true;
  }

  // 2. Also check Supabase SSR session if live Supabase is configured
  if (!isAuthenticated && supabaseUrl && !supabaseUrl.includes('your-project-id')) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        isAuthenticated = true;
      }
    } catch {
      // In unconfigured/offline mode, leave isAuthenticated as evaluated
    }
  }

  const isLoginPage = pathname === '/admin/login';

  // If user is trying to access login page while already authenticated -> redirect to /admin/settings
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/settings', request.url));
  }

  // If user is trying to access protected /admin/* routes without auth -> redirect to /admin/login
  if (!isLoginPage && !isAuthenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
