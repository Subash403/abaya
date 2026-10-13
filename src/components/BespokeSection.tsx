'use client';

import React from 'react';
import { useModals } from '@/context/ModalContext';
import { Sparkles, Scissors, Gem, Clock, ArrowRight } from 'lucide-react';

export default function BespokeSection() {
  const { openInquiry, openSizeGuide } = useModals();

  return (
    <section id="bespoke" className="py-24 bg-[#18181B] text-[#FFFFFF] relative overflow-hidden">
      {/* Subtle dusty purple line & background accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7C5C8A] to-transparent opacity-60" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#7C5C8A]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Brand Story & Philosophy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#7C5C8A]/40 text-[#7C5C8A]">
              <Sparkles className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-[0.24em] font-semibold">
                Bespoke Modest Couture • Chennai
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#FFFFFF] leading-tight">
              Bespoke Craftsmanship <br />
              <span className="italic text-[#7C5C8A]">Tailored in Chennai</span>
            </h2>

            <p className="text-sm text-[#D4D4D8] leading-relaxed font-light">
              At Wala Abaya, every garment begins with individual intention. Hand-tailored in our Chennai atelier, each piece is cut to your precise height and proportions from imported Japanese nida, pure crepe, and artisanal hand-embellishments.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-[#7C5C8A]/15 border border-[#7C5C8A]/40 text-[#7C5C8A] shrink-0">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base text-[#FFFFFF] font-medium">
                    Master Patterning & Draping
                  </h4>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Graceful modest fall, structured shoulders, and zero-compromise modest cuts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-[#7C5C8A]/15 border border-[#7C5C8A]/40 text-[#7C5C8A] shrink-0">
                  <Gem className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base text-[#FFFFFF] font-medium">
                    Hand-Selected Silks & Nida
                  </h4>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Sourced exclusively for breathable drape in Chennai&apos;s climate and enduring couture luster.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-[#7C5C8A]/15 border border-[#7C5C8A]/40 text-[#7C5C8A] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base text-[#FFFFFF] font-medium">
                    Doorstep Delivery Across Chennai & Nationwide
                  </h4>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Same-day/express courier dispatch in Chennai, plus insured express shipping across all states.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                onClick={() => openInquiry(null)}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-md"
              >
                <span>Initiate Bespoke Commission</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={openSizeGuide}
                className="inline-flex items-center justify-center px-6 py-3.5 border border-[#7C5C8A]/50 text-[#7C5C8A] hover:bg-white/5 text-xs uppercase tracking-widest font-semibold rounded-sm transition-all"
              >
                View Proportion Guide
              </button>
            </div>
          </div>

          {/* Right Column: Atelier Editorial Manifest Card */}
          <div className="lg:col-span-6">
            <div className="border border-[#7C5C8A]/35 bg-[#121214]/90 backdrop-blur-md p-8 sm:p-12 rounded-sm relative shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#7C5C8A]/30 pb-4">
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#7C5C8A]">
                  Atelier Standards
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-mono">
                  WA-CHENNAI
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-[#FFFFFF] font-light">
                  The Zero-Waste Couture Promise
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  By operating on a strict Request-to-Order atelier model in Chennai, Wala Abaya eliminates mass warehouse overproduction. Each roll of silk, crepe, and nida is tailored strictly to match individual orders, honoring mindful craftsmanship and dignified modesty.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#7C5C8A]/25 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#7C5C8A] block font-semibold">
                    Atelier Location
                  </span>
                  <span className="text-sm font-serif text-[#FFFFFF]">Chennai, Tamil Nadu</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#7C5C8A] block font-semibold">
                    Delivery Scope
                  </span>
                  <span className="text-sm font-serif text-[#FFFFFF]">Chennai & All-India</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
