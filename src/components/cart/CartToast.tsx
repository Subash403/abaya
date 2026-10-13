'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight, X } from 'lucide-react';

export default function CartToast() {
  const { toastMessage, clearToast, openCart } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] bg-[#FFFFFF] border border-[#7C5C8A]/30 rounded-lg shadow-2xl p-3.5 animate-in slide-in-from-bottom-5 duration-300 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {toastMessage.image ? (
          <div className="relative w-10 h-12 rounded bg-[#F7F7F9] overflow-hidden border border-[#E8E8EC] shrink-0">
            <Image
              src={toastMessage.image}
              alt="Item added"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#7C5C8A]/10 text-[#7C5C8A] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#18181B] truncate">
            {toastMessage.text}
          </p>
          <span className="text-[10px] text-[#7C5C8A] font-medium flex items-center gap-1">
            Added to your Atelier Bag
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            clearToast();
            openCart();
          }}
          className="px-2.5 py-1.5 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-[11px] font-semibold rounded flex items-center gap-1 shadow-sm transition-colors"
        >
          <span>Open Bag</span>
          <ArrowRight className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={clearToast}
          className="p-1 text-[#71717A] hover:text-[#18181B]"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
