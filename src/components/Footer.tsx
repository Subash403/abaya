'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';
import { useModals } from '@/context/ModalContext';
import { STORE_SETTINGS_DEFAULTS, StorefrontSettings } from '@/lib/store-settings-defaults';

interface FooterProps {
  settings?: Partial<StorefrontSettings>;
}

export default function Footer({ settings: initialSettings }: FooterProps) {
  const { openSizeGuide, openInquiry } = useModals();
  const settings = { ...STORE_SETTINGS_DEFAULTS, ...initialSettings };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  const conciergeWhatsApp = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
    'Salam / Hello Wala Abaya atelier concierge.'
  )}`;

  return (
    <footer id="story" className="bg-[#18181B] text-[#FFFFFF] border-t border-[#7C5C8A]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#7C5C8A]/20">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-48 rounded overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="WALA ABAYA"
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </div>
            </div>
            <p className="text-xs text-[#D4D4D8] leading-relaxed max-w-sm">
              WALA ABAYA Atelier - Born in Chennai, delivering modest elegance to doorsteps across all India.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#7C5C8A]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="tracking-wider uppercase text-[10px] font-semibold">
                Pan-India Shipping | Custom Alterations | 100% Secure Prepaid Orders (UPI & Cards)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#7C5C8A]">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#D4D4D8]">
              <li>
                <Link href="/#collection" className="hover:text-[#7C5C8A] transition-colors">
                  Everyday Modest Line
                </Link>
              </li>
              <li>
                <Link href="/#collection" className="hover:text-[#7C5C8A] transition-colors">
                  Evening Couture
                </Link>
              </li>
              <li>
                <Link href="/#collection" className="hover:text-[#7C5C8A] transition-colors">
                  Pure Japanese Nida & Crepe
                </Link>
              </li>
              <li>
                <Link href="/#collection" className="hover:text-[#7C5C8A] transition-colors">
                  Festive & Ramadan Capsule
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openInquiry(null)}
                  className="hover:text-[#7C5C8A] transition-colors text-left"
                >
                  Custom Commission
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#7C5C8A]">
              Concierge Care
            </h4>
            <ul className="space-y-2 text-xs text-[#D4D4D8]">
              <li>
                <button
                  type="button"
                  onClick={openSizeGuide}
                  className="hover:text-[#7C5C8A] transition-colors text-left"
                >
                  Size & Height Guide
                </button>
              </li>
              <li>
                <a
                  href={conciergeWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#7C5C8A] transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#7C5C8A]" />
                  WhatsApp Direct Inquiry
                </a>
              </li>
              <li>
                <Link href="/admin/settings" className="hover:text-[#7C5C8A] transition-colors">
                  Atelier Admin Portal
                </Link>
              </li>
              <li>
                <span className="text-zinc-500">Express Delivery Across Chennai</span>
              </li>
              <li>
                <span className="text-zinc-500">Insured All-India Shipping</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#7C5C8A]">
              {settings.atelier_title}
            </h4>
            <ul className="space-y-2 text-xs text-[#D4D4D8]">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#7C5C8A] shrink-0 mt-0.5" />
                <span>{settings.atelier_address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#7C5C8A] shrink-0" />
                <a
                  href={`tel:${settings.atelier_phone.replace(/[^\d+]/g, '')}`}
                  className="hover:text-[#7C5C8A] transition-colors"
                >
                  {settings.atelier_phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#7C5C8A] shrink-0" />
                <a href={`mailto:${settings.atelier_email}`} className="hover:text-[#7C5C8A] transition-colors">
                  {settings.atelier_email}
                </a>
              </li>
              <li className="pt-1 text-[11px] text-[#7C5C8A] font-mono">
                {settings.atelier_hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#D4D4D8]/60">
          <p>&copy; {new Date().getFullYear()} WALA ABAYA. All rights reserved.</p>
          <p className="tracking-widest uppercase text-[10px] text-[#7C5C8A] font-semibold">
            Bespoke Modest Couture | Crafted in Chennai
          </p>
        </div>
      </div>
    </footer>
  );
}
