'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useModals } from '@/context/ModalContext';
import { ArrowDown, Sparkles, Ruler, ShieldCheck, CreditCard, Truck } from 'lucide-react';

interface HeroSectionProps {
  initialLogoUrl?: string;
}

export default function HeroSection({ initialLogoUrl }: HeroSectionProps) {
  const { openSizeGuide } = useModals();
  const [logoUrl, setLogoUrl] = useState<string>(initialLogoUrl || '/logo.png');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.logo_url) {
            setLogoUrl(data.settings.logo_url);
          }
        }
      } catch {
        // Fallback established
      }
    }
    loadSettings();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#FFFFFF] border-b border-[#E8E8EC]">
      {/* Background Subtle Lavender/Grey Atmosphere */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#7C5C8A]/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#F7F7F9] blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Main Editorial Content (Left Column) */}
          <div className="lg:col-span-7 space-y-6 text-left flex flex-col justify-between">
            {/* Atelier Brand Emblem (Scaled Up) */}
            <div className="relative w-44 md:w-56 lg:w-64 mb-5 transition-transform duration-300 hover:scale-[1.02]">
              <Image
                src={logoUrl || '/logo.png'}
                alt="WALA ABAYA"
                width={280}
                height={90}
                className="w-full h-auto object-contain object-left drop-shadow-[0_4px_16px_rgba(124,92,138,0.18)]"
                priority
                unoptimized
              />
            </div>

            {/* Atelier Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E8E8EC] shadow-sm w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#7C5C8A]" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-[#18181B] font-semibold">
                ✨ CRAFTED IN CHENNAI • SHIPPING ACROSS ALL INDIA
              </span>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#18181B] leading-[1.08] tracking-tight">
                WALA ABAYA <br />
                <span className="italic font-normal text-[#7C5C8A]">
                  Timeless Modesty, Seamlessly Delivered Across India.
                </span>
              </h1>
              <p className="font-serif text-lg sm:text-xl text-[#7C5C8A] italic tracking-wide">
                Bespoke abayas tailored to order in Chennai from pure Japanese Nida, Medina silk, and Parisian crêpe.
              </p>
            </div>

            {/* Description Paragraph */}
            <p className="text-sm sm:text-base text-[#52525B] max-w-xl font-light leading-relaxed">
              Explore our curated collection of luxury abayas crafted from fine Japanese Nida, Medina silk, and Parisian crêpe. Select your height (52–60), customize measurements, and enjoy instant, secure prepaid checkout with express doorstep delivery to every pincode across India.
            </p>

            {/* Hero Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/#collection"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs uppercase tracking-[0.22em] font-semibold rounded-sm shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <span>SHOP COLLECTION</span>
                <ArrowDown className="w-3.5 h-3.5 text-current" />
              </Link>

              <button
                type="button"
                onClick={openSizeGuide}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FFFFFF] hover:bg-[#F7F7F9] text-[#18181B] text-xs uppercase tracking-[0.22em] font-semibold rounded-sm border border-[#E8E8EC] transition-all hover:border-[#7C5C8A]"
              >
                <Ruler className="w-3.5 h-3.5 text-[#7C5C8A]" />
                <span>SIZE & FIT GUIDE</span>
              </button>
            </div>

            {/* Feature Callout Bar / Guarantee Badge */}
            <div className="p-3.5 bg-[#F7F7F9] border border-[#E8E8EC] rounded-lg max-w-xl space-y-1">
              <div className="flex items-center gap-2 text-[#7C5C8A]">
                <ShieldCheck className="w-4 h-4 text-[#7C5C8A]" />
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#18181B]">
                  SECURE ONLINE CHECKOUT • ALL-INDIA DELIVERY
                </span>
              </div>
              <p className="text-xs text-[#71717A] leading-relaxed pl-6">
                Instant UPI & Card payment via Razorpay • Custom sleeve & length alterations available on all orders.
              </p>
            </div>

            {/* Trust Bar (Below Hero) */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#E8E8EC] max-w-xl">
              <div>
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#18181B]">
                  100% Handcrafted
                </span>
                <span className="text-[10px] text-[#71717A] block leading-tight">
                  Tailored in Chennai with precision finish
                </span>
              </div>

              <div>
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#18181B]">
                  52 — 60
                </span>
                <span className="text-[10px] text-[#71717A] block leading-tight">
                  Standard & custom bespoke lengths
                </span>
              </div>

              <div>
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#18181B]">
                  All-India Shipping
                </span>
                <span className="text-[10px] text-[#71717A] block leading-tight">
                  Express door delivery across all states
                </span>
              </div>

              <div>
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#7C5C8A]">
                  Prepaid Only
                </span>
                <span className="text-[10px] text-[#71717A] block leading-tight">
                  Secure UPI, Cards & NetBanking
                </span>
              </div>
            </div>
          </div>

          {/* Right Editorial Visual & Quote Showcase (Right Column) */}
          <div className="lg:col-span-5 relative flex flex-col justify-between space-y-6">
            {/* 1. Arched Editorial Drape Showcase */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative rounded-t-[140px] rounded-b-2xl overflow-hidden border border-[#7C5C8A]/30 bg-[#F7F7F9] shadow-2xl group">
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src="/hero-editorial.jpg"
                    alt="Wala Abaya Haute Couture Drape"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    className="object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105"
                    priority
                    unoptimized
                  />

                  {/* Gradient shadow at bottom of image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-4 inset-x-0 flex justify-center z-10">
                    <span className="px-3.5 py-1 bg-white/95 backdrop-blur-md text-[#18181B] text-[9px] uppercase tracking-[0.24em] font-semibold rounded-full border border-[#E8E8EC] shadow-sm flex items-center gap-1.5">
                      <Sparkles className="w-2.5 h-2.5 text-[#7C5C8A]" />
                      Atelier Haute Drape • Chennai
                    </span>
                  </div>

                  {/* Bottom Highlights Pills */}
                  <div className="absolute bottom-4 inset-x-4 z-10 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 bg-[#18181B]/85 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-medium rounded-full border border-white/10">
                        Pure Japanese Nida & French Crepe
                      </span>
                      <span className="px-2.5 py-1 bg-[#7C5C8A]/90 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-semibold rounded-full border border-white/10">
                        Lengths 52–60 Bespoke
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative floating badge */}
              <div className="absolute -bottom-3 -right-2 bg-white/95 backdrop-blur-md border border-[#7C5C8A]/30 px-3.5 py-1.5 rounded-full shadow-lg hidden sm:flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#7C5C8A] font-bold">
                <Truck className="w-3 h-3 text-[#7C5C8A]" />
                <span>Express Pan-India Delivery</span>
              </div>
            </div>

            {/* 2. Dark Monogram Quote Card ("THE ATELIER EXPERIENCE") */}
            <div className="relative mx-auto w-full max-w-md pt-1">
              {/* Dusty purple frame accent */}
              <div className="absolute -inset-1 border border-[#7C5C8A]/35 rounded-sm translate-x-2 translate-y-2 -z-10" />

              <div className="bg-[#18181B] text-[#FFFFFF] p-6 sm:p-7 rounded-sm shadow-xl relative overflow-hidden border border-[#7C5C8A]/40">
                {/* Monogram watermark */}
                <div className="absolute -right-4 -bottom-4 opacity-10 text-white font-serif text-8xl select-none pointer-events-none">
                  WA
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between border-b border-[#7C5C8A]/30 pb-3">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[#7C5C8A] font-semibold">
                      THE ATELIER EXPERIENCE
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#E8E8EC] font-mono">
                      PAN-INDIA • 2025
                    </span>
                  </div>

                  <blockquote className="font-serif text-lg sm:text-xl font-light text-[#FFFFFF] leading-snug">
                    &ldquo;Designed for effortless grace. Handcrafted in Chennai, tailored to your silhouette, and delivered nationwide.&rdquo;
                  </blockquote>

                  <div className="pt-3 border-t border-[#7C5C8A]/25 flex items-center justify-between">
                    <div>
                      <p className="font-serif text-sm text-[#7C5C8A] font-medium">Wala Abaya Atelier</p>
                      <p className="text-[9px] tracking-widest text-[#E8E8EC]/80 uppercase">
                        Bespoke Modest Couture • Shipping All-India
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full border border-[#7C5C8A] flex items-center justify-center text-[#7C5C8A]">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
