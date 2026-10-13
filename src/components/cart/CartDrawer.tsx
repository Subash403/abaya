'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Tag,
  Check,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    appliedPromo,
    promoCodeInput,
    setPromoCodeInput,
    isApplyingPromo,
    promoError,
    discountAmount,
    finalTotal,
    isCartOpen,
    closeCart,
    openCheckout,
    updateQuantity,
    removeFromCart,
    applyPromo,
    removePromo,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className="relative w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-[#E8E8EC]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-[#E8E8EC] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#7C5C8A]/10 text-[#7C5C8A] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#18181B] tracking-tight">
                Your Atelier Bag
              </h2>
              <span className="text-[10px] text-[#71717A] tracking-wider uppercase">
                {itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'} Selected
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="p-1.5 text-[#71717A] hover:text-[#18181B] hover:bg-[#F7F7F9] rounded-md transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Items List or Empty State */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F7F7F9] border border-[#E8E8EC] flex items-center justify-center text-[#71717A]/50">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-semibold text-[#18181B]">
                  Your bag is empty
                </h3>
                <p className="text-xs text-[#71717A] max-w-[240px] leading-relaxed">
                  Explore our bespoke Chennai collection to commission your handcrafted modest abaya.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="mt-2 px-6 py-2.5 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs uppercase tracking-widest font-semibold rounded-sm transition-colors shadow-sm"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.customAlterationNotes || ''}`}
                  className="flex gap-3.5 p-3 bg-[#F7F7F9]/80 border border-[#E8E8EC] rounded-lg relative group transition-colors hover:border-[#7C5C8A]/40"
                >
                  {/* Thumbnail */}
                  <div className="relative w-18 h-24 bg-white rounded overflow-hidden border border-[#E8E8EC] shrink-0">
                    <Image
                      src={item.image || '/logo.png'}
                      alt={item.name}
                      fill
                      className="object-cover object-top"
                      unoptimized
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-[#18181B] line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.productId, item.size, item.customAlterationNotes)
                          }
                          className="text-[#71717A] hover:text-red-500 p-0.5 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-[#7C5C8A]/10 text-[#7C5C8A] rounded">
                          Size {item.size}
                        </span>
                        <span className="text-[10px] text-[#71717A]">
                          ₹{item.price} each
                        </span>
                      </div>

                      {item.customAlterationNotes && (
                        <p className="text-[10px] text-[#71717A] italic mt-1 line-clamp-1 bg-white/80 px-1.5 py-0.5 rounded border border-[#E8E8EC]">
                          Note: {item.customAlterationNotes}
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls & Line Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E8EC]/60 mt-2">
                      <div className="flex items-center border border-[#E8E8EC] rounded bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1,
                              item.customAlterationNotes
                            )
                          }
                          className="p-1 hover:bg-[#F7F7F9] text-[#71717A] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold font-mono text-[#18181B]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1,
                              item.customAlterationNotes
                            )
                          }
                          className="p-1 hover:bg-[#F7F7F9] text-[#71717A] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-bold text-[#18181B]">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Footer Summary & Checkout CTA */}
        {items.length > 0 && (
          <div className="border-t border-[#E8E8EC] bg-[#FFFFFF] p-6 space-y-4">
            {/* Promo Code Input */}
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WALA15)"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    disabled={!!appliedPromo}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs uppercase font-mono tracking-wider text-[#18181B] focus:outline-none focus:border-[#7C5C8A] disabled:opacity-60"
                  />
                </div>
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={removePromo}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-medium rounded transition-colors"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => applyPromo(promoCodeInput)}
                    disabled={isApplyingPromo || !promoCodeInput.trim()}
                    className="px-4 py-1.5 bg-[#7C5C8A] hover:bg-[#6A4A78] disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1"
                  >
                    {isApplyingPromo ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <span>Apply</span>
                    )}
                  </button>
                )}
              </div>

              {appliedPromo && (
                <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {appliedPromo.title || appliedPromo.code} applied ({appliedPromo.discount_percentage}% off)
                  </span>
                  <span className="font-semibold">-₹{discountAmount}</span>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-red-500">{promoError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-[#71717A] pt-2 border-t border-[#E8E8EC]">
              <div className="flex items-center justify-between">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):</span>
                <span className="font-mono text-[#18181B]">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Special Discount:</span>
                  <span className="font-mono font-semibold">-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Atelier Shipping:</span>
                <span className="text-emerald-700 font-medium">Complimentary</span>
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-[#18181B] pt-2 border-t border-[#E8E8EC]">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-[#7C5C8A]">₹{finalTotal}</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => openCheckout(null)}
              className="w-full py-3.5 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-[#71717A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7C5C8A]" />
              <span>Handcrafted in Chennai • 100% Secure Prepaid Pan-India Orders</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
