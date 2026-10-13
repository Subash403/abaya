'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin/settings';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. First attempt via Supabase Client (if live supabase configured)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your-project-id')) {
        try {
          const supabase = createClient();
          await supabase.auth.signInWithPassword({
            email,
            password,
          });
        } catch {
          // Fall through to server auth endpoint
        }
      }

      // 2. Call server auth endpoint to ensure cookies and fallback authentication work
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid admin credentials.');
      }

      // Successful authentication -> redirect
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {errorMessage && (
        <div className="p-3 bg-red-50/80 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5 text-xs">
          <label className="block font-semibold text-[#18181B]">
            Admin Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-[#F7F7F9] border border-[#E8E8EC] rounded-md text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A] transition-colors"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-xs">
          <label className="block font-semibold text-[#18181B]">
            Password / Access Passcode
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-[#F7F7F9] border border-[#E8E8EC] rounded-md text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#18181B]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#E8E8EC] text-[#7C5C8A] focus:ring-[#7C5C8A] accent-[#7C5C8A]"
            />
            <span className="text-[#52525B]">Remember me on this atelier workstation</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs font-semibold rounded-md shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
        >
          <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Dashboard'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F9] text-[#18181B] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden font-sans">
      {/* Background Subtle Lavender Ambient Atmosphere */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#7C5C8A]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#7C5C8A]/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Atelier Logo & Welcome Slogan */}
        <div className="text-center space-y-3">
          <div className="relative h-16 w-56 mx-auto">
            <Image
              src="/logo.png"
              alt="WALA ABAYA"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E8EC] shadow-xs">
              <Sparkles className="w-3 h-3 text-[#7C5C8A]" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#71717A] font-semibold">
                Admin Atelier Portal
              </span>
            </div>
            <p className="text-xs text-[#71717A] tracking-tight">
              (Bismillahir Rahmanir Rahim) • Assalamu Alaikum
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#FFFFFF] border border-[#E8E8EC] border-t-4 border-t-[#7C5C8A] rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#18181B]">
              Sign in to Dashboard
            </h2>
            <p className="text-xs text-[#71717A] mt-1">
              Authorized access for Wala Abaya atelier administrators and management.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-8 flex justify-center items-center">
                <div className="w-6 h-6 border-2 border-[#7C5C8A] border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <LoginFormContent />
          </Suspense>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-[#71717A] hover:text-[#7C5C8A] transition-colors"
          >
            ← Return to Wala Abaya Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
