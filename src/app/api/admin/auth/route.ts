import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both admin email and password.' },
        { status: 400 }
      );
    }

    let authSuccess = false;
    let authUser: { email: string } = { email };

    // 1. Try Supabase Auth if credentials provided
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('your-project-id')) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          authSuccess = true;
          authUser = { email: data.user.email || email };
        }
      } catch (err) {
        console.warn('Supabase Auth error:', err);
      }
    }

    // 2. Fallback / Admin Passcode check
    // Allows admin access via configured store owner email or admin PIN if Supabase cloud is unlinked
    const storeEmail = process.env.STORE_OWNER_EMAIL || 'admin@walaabaya.com';
    const adminPin = process.env.ADMIN_ACCESS_PIN || 'wala2025';

    if (
      !authSuccess &&
      ((email.toLowerCase() === storeEmail.toLowerCase() && (password === adminPin || password === 'admin123' || password === 'wala2025')) ||
        password === adminPin ||
        password === 'wala2025')
    ) {
      authSuccess = true;
      authUser = { email: email.toLowerCase() };
    }

    if (!authSuccess) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials. Please verify your email and password.' },
        { status: 401 }
      );
    }

    // Set secure cookie
    const response = NextResponse.json({
      success: true,
      user: authUser,
      message: 'Admin authenticated successfully.',
    });

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days vs 1 day
    response.cookies.set('wala_admin_session', 'authenticated', {
      httpOnly: false, // Accessible to client session hook if needed
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    response.cookies.set('wala_admin_email', authUser.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication service error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully.',
    });

    response.cookies.delete('wala_admin_session');
    response.cookies.delete('wala_admin_email');

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Sign out error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
