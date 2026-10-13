'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useModals } from '@/context/ModalContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/database';
import {
  Sparkles,
  Ruler,
  ChevronLeft,
  Check,
  Scissors,
  Droplet,
  Truck,
  MessageSquare,
  ShoppingBag,
  Zap,
  Plus,
  Minus,
} from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
}

const ALL_SIZES = ['52', '54', '56', '58', '60', 'Custom'];

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { openInquiry, openSizeGuide } = useModals();
  const { addToCart, openCheckout } = useCart();

  const images = product.images && product.images.length > 0 ? product.images : ['/logo.png'];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '56');
  const [quantity, setQuantity] = useState(1);
  const [customAlterationNotes, setCustomAlterationNotes] = useState('');

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: images[selectedImageIndex] || images[0] || '/logo.png',
      size: selectedSize,
      quantity,
      customAlterationNotes: customAlterationNotes.trim() || undefined,
    });
  };

  const handleBuyNow = () => {
    openCheckout({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: images[selectedImageIndex] || images[0] || '/logo.png',
      size: selectedSize,
      quantity,
      customAlterationNotes: customAlterationNotes.trim() || undefined,
    });
  };

  return (
    <div className="py-12 lg:py-16 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/#collection"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#71717A] hover:text-[#18181B] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Collection</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Main Image */}
            <div className="relative aspect-[3/4] w-full rounded-sm overflow-hidden bg-[#FFFFFF] border border-[#E8E8EC] shadow-sm">
              <Image
                src={images[selectedImageIndex]}
                alt={product.name}
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 60vw"
                unoptimized
              />

              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-xs uppercase tracking-widest font-semibold bg-[#7C5C8A] text-white backdrop-blur-md rounded-sm shadow-sm">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip (if multiple images) */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-24 rounded-sm overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-[#7C5C8A] shadow-md'
                        : 'border-[#E8E8EC] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} angle ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Piece Specifications & Ordering */}
          <div className="lg:col-span-5 space-y-6">
            {/* Fabric & Atelier Badge */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] uppercase font-mono tracking-wider bg-[#F7F7F9] text-[#71717A] rounded border border-[#E8E8EC]">
                  {product.fabric}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#7C5C8A] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Crafted in Chennai
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#18181B]">
                {product.name}
              </h1>

              <div className="flex items-baseline flex-wrap gap-3 pt-1">
                <span className="text-2xl font-serif font-bold text-[#18181B] font-mono">
                  ₹{product.price}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <>
                    <span className="text-base text-[#888] line-through font-mono">
                      ₹{product.compare_at_price}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold text-[#7C5C8A] bg-[#7C5C8A]/10 rounded border border-[#7C5C8A]/25">
                      {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% SAVINGS
                    </span>
                  </>
                )}
                <span className="text-xs text-[#888] font-light">
                  (Made-to-Measure in Chennai)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-b border-[#E8E8EC] py-5 space-y-3">
              <p className="text-sm text-[#52525B] leading-relaxed font-light">
                {product.description ||
                  `Meticulously drafted and individually executed by our Chennai atelier. Tailored from premium ${product.fabric} with modest ease, flowing hem fall, and discreet luxury finishing.`}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#18181B] font-medium">
                <Check className="w-4 h-4 text-[#7C5C8A]" />
                <span>Complimentary customized height adjustment on all orders</span>
              </div>
            </div>

            {/* Sizing Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#18181B]">
                  Choose Sizing: <span className="text-[#7C5C8A] font-bold">{selectedSize}</span>
                </label>
                <button
                  type="button"
                  onClick={openSizeGuide}
                  className="inline-flex items-center gap-1 text-xs text-[#7C5C8A] hover:underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Height Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {ALL_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-xs font-serif font-bold tracking-wider rounded-sm transition-all border ${
                      selectedSize === size
                        ? 'bg-[#7C5C8A] text-white border-[#7C5C8A] shadow-sm'
                        : 'bg-white text-[#18181B] border-[#E8E8EC] hover:border-[#7C5C8A]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-[#71717A]">
                Selected size is <strong>{selectedSize}</strong>. Need tailored proportions? You can specify your exact height and shoulder width below or during checkout.
              </p>
            </div>

            {/* Quantity Selector & Tailoring Notes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#18181B]">
                  Quantity
                </label>
                <div className="flex items-center border border-[#E8E8EC] rounded bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="p-1.5 hover:bg-[#F7F7F9] text-[#71717A] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-semibold font-mono text-[#18181B]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="p-1.5 hover:bg-[#F7F7F9] text-[#71717A] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bespoke Tailoring Notes Input */}
              <div>
                <label className="block text-[11px] font-medium text-[#71717A] mb-1">
                  Optional Tailoring Notes (e.g. Height 5&apos;4, Sleeve Length, Custom Modesty):
                </label>
                <input
                  type="text"
                  placeholder="Specify custom height or alterations"
                  value={customAlterationNotes}
                  onChange={(e) => setCustomAlterationNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F7F9] border border-[#E8E8EC] rounded text-xs text-[#18181B] focus:outline-none focus:border-[#7C5C8A]"
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-sm shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span>Add to Bag</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-4 bg-[#18181B] hover:bg-black text-white text-xs uppercase tracking-[0.2em] font-bold rounded-sm shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Buy Now (₹{product.price * quantity})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  openInquiry({
                    ...product,
                    sizes: [selectedSize],
                  })
                }
                className="w-full py-2.5 text-center text-[#71717A] hover:text-[#18181B] text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#7C5C8A]" />
                <span>Or ask our Chennai Tailor a question on WhatsApp</span>
              </button>
            </div>

            {/* Atelier Guarantees & Care Details */}
            <div className="pt-6 space-y-4 border-t border-[#E8E8EC] text-xs text-[#52525B]">
              <div className="flex items-start gap-3">
                <Scissors className="w-4 h-4 text-[#7C5C8A] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#18181B]">Bespoke Craft in Chennai:</strong>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    Individual fabrication in our Chennai workshop takes 3 to 6 working days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Droplet className="w-4 h-4 text-[#7C5C8A] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#18181B]">Artisanal Fabric Care:</strong>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    Gentle hand wash or dry clean. Steam iron on low setting. Hang on broad wooden hangers to protect shoulder drape.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-[#7C5C8A] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#18181B]">Doorstep Delivery:</strong>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    Prompt courier delivery across Chennai. Insured express delivery to all Indian cities and nationwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
