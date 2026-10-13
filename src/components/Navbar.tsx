'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useModals } from '@/context/ModalContext';
import { MessageSquare, Menu, X, Ruler, Sparkles, ShieldAlert, Tag, Check, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Offer } from '@/types/database';

interface NavbarProps {
  initialLogoUrl?: string;
}

export default function Navbar({ initialLogoUrl }: NavbarProps) {
  const { openSizeGuide, openInquiry } = useModals();
  const { itemCount: totalItems, openCart } = useCart();
  const [logoUrl, setLogoUrl] = useState<string>(initialLogoUrl || '/logo.png');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerOffer, setBannerOffer] = useState<Offer | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Fetch dynamic branding logo and active promotional banner
  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, offersRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/offers?banner=true'),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.settings?.logo_url) {
            setLogoUrl(data.settings.logo_url);
          }
        }

        if (offersRes.ok) {
          const data = await offersRes.json();
          if (data.offers && data.offers.length > 0) {
            setBannerOffer(data.offers[0]);
          }
        }
      } catch {
        // Safe fallbacks already established
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  const conciergeWhatsApp = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
    'Salam / Hello, I would like to inquire about Wala Abaya bespoke pieces crafted in Chennai.'
  )}`;

  return (
    <>
      {/* Top Announcement Banner (Dynamic from Offers or Default) */}
      <div className="bg-[#18181B] text-[#FFFFFF] py-2 px-4 text-center text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-medium border-b border-[#7C5C8A]/30 flex flex-wrap items-center justify-center gap-2 transition-all">
        <Sparkles className="w-3 h-3 text-[#7C5C8A] shrink-0" />
        {bannerOffer ? (
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span>{bannerOffer.banner_text || `${bannerOffer.title}: Enjoy ${bannerOffer.discount_percentage}% off with bespoke tailoring`}</span>
            {bannerOffer.code && (
              <button
                type="button"
                onClick={() => handleCopyCode(bannerOffer.code!)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#7C5C8A]/30 hover:bg-[#7C5C8A]/50 border border-[#7C5C8A]/60 rounded text-[9px] font-mono tracking-wider text-white transition-colors"
                title="Click to copy code"
              >
                <Tag className="w-2.5 h-2.5 text-[#7C5C8A]" />
                <span>{bannerOffer.code}</span>
                {codeCopied ? <Check className="w-2.5 h-2.5 text-white" /> : null}
              </button>
            )}
          </div>
        ) : (
          <span>✨ ALL-INDIA EXPRESS SHIPPING • ENJOY 15% OFF YOUR BESPOKE ORDER WITH CODE WALA15 ✨</span>
        )}
        <Sparkles className="w-3 h-3 text-[#7C5C8A] shrink-0" />
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FFFFFF]/95 backdrop-blur-md shadow-sm border-b border-[#E8E8EC]'
            : 'bg-[#FFFFFF] border-b border-[#E8E8EC]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24">
            {/* Left Nav Links (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/#collection"
                className="text-xs uppercase tracking-[0.2em] font-medium text-[#18181B]/80 hover:text-[#7C5C8A] transition-colors"
              >
                Collection
              </Link>
              <Link
                href="/#bespoke"
                className="text-xs uppercase tracking-[0.2em] font-medium text-[#18181B]/80 hover:text-[#7C5C8A] transition-colors"
              >
                Chennai Atelier
              </Link>
              <button
                type="button"
                onClick={openSizeGuide}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-medium text-[#18181B]/80 hover:text-[#7C5C8A] transition-colors"
              >
                <Ruler className="w-3.5 h-3.5 text-[#7C5C8A]" />
                Size Guide
              </button>
            </nav>

            {/* Brand Logo (Center) */}
            <div className="flex-1 lg:flex-none flex items-center justify-start lg:justify-center">
              <Link href="/" className="inline-block relative py-2 focus:outline-none">
                <div className="relative h-14 sm:h-16 w-56 sm:w-68 md:w-80 transition-transform duration-200 hover:scale-[1.02]">
                  <Image
                    src={logoUrl || '/logo.png'}
                    alt="WALA ABAYA"
                    fill
                    className="object-contain object-left lg:object-center"
                    priority
                    unoptimized
                  />
                </div>
              </Link>
            </div>

            {/* Right Nav / Actions (Desktop) */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                href="/#story"
                className="text-xs uppercase tracking-[0.2em] font-medium text-[#18181B]/80 hover:text-[#7C5C8A] transition-colors"
              >
                Maison
              </Link>
              <Link
                href="/admin/settings"
                className="text-xs uppercase tracking-[0.15em] font-medium text-[#71717A] hover:text-[#7C5C8A] transition-colors flex items-center gap-1"
                title="Atelier Admin Portal"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#7C5C8A]" />
                Admin
              </Link>
              
              {/* Luxury Shopping Bag Trigger */}
              <button
                type="button"
                onClick={openCart}
                id="desktop-cart-trigger"
                className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#E8E8EC] hover:border-[#7C5C8A] bg-[#FFFFFF] hover:bg-[#7C5C8A]/5 text-[#18181B] transition-all group"
                aria-label={`Shopping bag with ${totalItems} items`}
              >
                <ShoppingBag className="w-4 h-4 text-[#7C5C8A] group-hover:scale-110 transition-transform" />
                <span className="text-xs uppercase tracking-wider font-semibold text-[#18181B]">
                  Bag
                </span>
                {totalItems > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-[#7C5C8A] text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px]">
                    {totalItems}
                  </span>
                )}
              </button>

              <a
                href={conciergeWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs uppercase tracking-widest font-semibold rounded-sm shadow-sm transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Concierge Chat
              </a>
            </div>

            {/* Mobile Menu & Bag Buttons */}
            <div className="flex lg:hidden items-center gap-2 sm:gap-3">
              {/* Mobile Bag Trigger */}
              <button
                type="button"
                onClick={openCart}
                id="mobile-cart-trigger"
                className="relative p-2 text-[#7C5C8A] bg-[#7C5C8A]/10 rounded-full border border-[#7C5C8A]/30 transition-transform active:scale-95"
                aria-label={`View atelier bag with ${totalItems} items`}
              >
                <ShoppingBag className="w-4 h-4 text-[#7C5C8A]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#7C5C8A] text-white text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </button>

              <a
                href={conciergeWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#7C5C8A] bg-[#7C5C8A]/10 rounded-full border border-[#7C5C8A]/30"
                aria-label="WhatsApp Concierge"
              >
                <MessageSquare className="w-4 h-4 text-[#7C5C8A]" />
              </a>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#18181B]"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#18181B]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8E8EC] bg-[#FFFFFF] px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-4 text-left">
              <Link
                href="/#collection"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm uppercase tracking-[0.2em] font-medium text-[#18181B] py-1 border-b border-[#E8E8EC]"
              >
                Haute Collection
              </Link>
              <Link
                href="/#bespoke"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm uppercase tracking-[0.2em] font-medium text-[#18181B] py-1 border-b border-[#E8E8EC]"
              >
                Chennai Atelier Craft
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSizeGuide();
                }}
                className="flex items-center justify-between text-sm uppercase tracking-[0.2em] font-medium text-[#18181B] py-1 border-b border-[#E8E8EC] text-left"
              >
                <span>Size & Height Guide</span>
                <Ruler className="w-4 h-4 text-[#7C5C8A]" />
              </button>
              <Link
                href="/#story"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm uppercase tracking-[0.2em] font-medium text-[#18181B] py-1 border-b border-[#E8E8EC]"
              >
                Maison Story
              </Link>
              <Link
                href="/admin/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm uppercase tracking-[0.2em] font-medium text-[#71717A] py-1 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-[#7C5C8A]" />
                Admin Atelier Portal
              </Link>
            </nav>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCart();
                }}
                className="w-full py-3 bg-[#18181B] hover:bg-[#27272A] text-white text-xs uppercase tracking-widest font-semibold rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#7C5C8A]" />
                <span>View Atelier Bag {totalItems > 0 ? `(${totalItems})` : ''}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openInquiry(null);
                }}
                className="w-full py-3 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs uppercase tracking-widest font-semibold rounded-sm transition-colors shadow-sm"
              >
                Request Custom Order
              </button>
              <a
                href={conciergeWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#F7F7F9] text-[#18181B] border border-[#E8E8EC] hover:bg-[#E8E8EC] text-xs uppercase tracking-widest font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#7C5C8A]" />
                WhatsApp Concierge
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
