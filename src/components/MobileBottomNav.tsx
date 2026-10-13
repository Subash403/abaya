'use client';

import React from 'react';
import Link from 'next/link';
import { useModals } from '@/context/ModalContext';
import { useCart } from '@/context/CartContext';
import { Home, Sparkles, Ruler, MessageSquare, Compass, ShoppingBag } from 'lucide-react';

export default function MobileBottomNav() {
  const { openSizeGuide, openInquiry } = useModals();
  const { itemCount: totalItems, openCart } = useCart();

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  const conciergeWhatsApp = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
    'Salam / Hello Wala Abaya concierge.'
  )}`;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E8E8EC] px-2 py-2 shadow-2xl flex items-center justify-around">
      <Link
        href="/"
        className="flex flex-col items-center justify-center p-1.5 text-[#71717A] hover:text-[#7C5C8A] transition-colors"
      >
        <Home className="w-4 h-4 mb-0.5" />
        <span className="text-[9px] uppercase tracking-wider font-medium">Home</span>
      </Link>

      <Link
        href="/#collection"
        className="flex flex-col items-center justify-center p-1.5 text-[#71717A] hover:text-[#7C5C8A] transition-colors"
      >
        <Sparkles className="w-4 h-4 mb-0.5 text-[#7C5C8A]" />
        <span className="text-[9px] uppercase tracking-wider font-medium">Collection</span>
      </Link>

      {/* Atelier Bag Trigger */}
      <button
        type="button"
        onClick={openCart}
        className="relative flex flex-col items-center justify-center p-1.5 text-[#7C5C8A] hover:text-[#6A4A78] transition-colors"
        aria-label={`Open shopping bag with ${totalItems} items`}
      >
        <div className="relative">
          <ShoppingBag className="w-4 h-4 mb-0.5 text-[#7C5C8A]" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#7C5C8A] text-white text-[8px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center border border-white">
              {totalItems}
            </span>
          )}
        </div>
        <span className="text-[9px] uppercase tracking-wider font-semibold text-[#7C5C8A]">Bag</span>
      </button>

      <button
        type="button"
        onClick={openSizeGuide}
        className="flex flex-col items-center justify-center p-1.5 text-[#71717A] hover:text-[#7C5C8A] transition-colors"
      >
        <Ruler className="w-4 h-4 mb-0.5" />
        <span className="text-[9px] uppercase tracking-wider font-medium">Size Guide</span>
      </button>

      <button
        type="button"
        onClick={() => openInquiry(null)}
        className="flex flex-col items-center justify-center p-1.5 text-[#71717A] hover:text-[#7C5C8A] transition-colors"
      >
        <Compass className="w-4 h-4 mb-0.5 text-[#7C5C8A]" />
        <span className="text-[9px] uppercase tracking-wider font-medium">Bespoke</span>
      </button>

      <a
        href={conciergeWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center p-1.5 text-[#18181B] hover:text-[#7C5C8A] transition-colors"
      >
        <MessageSquare className="w-4 h-4 mb-0.5 text-[#7C5C8A]" />
        <span className="text-[9px] uppercase tracking-wider font-medium">WhatsApp</span>
      </a>
    </nav>
  );
}
