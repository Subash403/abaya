'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useModals } from '@/context/ModalContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/database';
import {
  Sparkles,
  Eye,
  Compass,
  ShieldCheck,
  Loader2,
  ShoppingBag,
  Plus,
  Minus,
  Zap,
} from 'lucide-react';

interface CollectionGridProps {
  initialProducts?: Product[];
}

const CATEGORIES = ['All', 'Everyday', 'Evening', 'Silk', 'Ramadan'];
const DEFAULT_SIZES = ['52', '54', '56', '58', '60', 'Custom'];

export default function CollectionGrid({ initialProducts = [] }: CollectionGridProps) {
  const { openInquiry, openSizeGuide } = useModals();
  const { addToCart, openCheckout } = useCart();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Per-product size and quantity selection
  const [selectedSizes, setSelectedSizes] = useState<{ [productId: string]: string }>({});
  const [selectedQuantities, setSelectedQuantities] = useState<{ [productId: string]: number }>({});

  const getSize = (productId: string, availableSizes?: string[]) => {
    return selectedSizes[productId] || (availableSizes && availableSizes[0]) || '56';
  };

  const getQuantity = (productId: string) => {
    return selectedQuantities[productId] || 1;
  };

  const setSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const changeQuantity = (productId: string, delta: number) => {
    setSelectedQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAddToCart = (product: Product) => {
    const size = getSize(product.id, product.sizes);
    const quantity = getQuantity(product.id);
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0] || '/logo.png',
      size,
      quantity,
    });
  };

  const handleBuyNow = (product: Product) => {
    const size = getSize(product.id, product.sizes);
    const quantity = getQuantity(product.id);
    openCheckout({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0] || '/logo.png',
      size,
      quantity,
    });
  };

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const query = activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : '';
        const res = await fetch(`/api/admin/products${query}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.warn('Failed to load collection products:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory]);

  return (
    <section id="collection" className="relative py-20 lg:py-28 bg-gradient-to-b from-[#FAFAF8] via-[#FFFFFF] to-[#F8F6F9] overflow-hidden">
      {/* 1. Ambient Floating Lavender & Warm Stone Glows */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl animate-pulse-slow pointer-events-none z-0" />
      <div className="absolute top-20 right-1/4 translate-x-1/2 w-[28rem] h-[28rem] bg-stone-200/40 rounded-full blur-3xl animate-float-slow pointer-events-none z-0" />

      {/* 2. Islamic Arch / Geometric Motif Watermark */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <svg
          viewBox="0 0 400 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[340px] sm:w-[440px] md:w-[520px] h-auto stroke-[#7C5C8A] opacity-[0.04]"
        >
          {/* Moorish Horseshoe / Pointed Arch Crest */}
          <path
            d="M60 460 V 220 C 60 130 120 40 200 15 C 280 40 340 130 340 220 V 460"
            strokeWidth="2.5"
          />
          {/* Inner Multi-foiled Crest Arch */}
          <path
            d="M85 460 V 230 C 85 170 115 130 150 105 C 180 85 200 45 200 45 C 200 45 220 85 250 105 C 285 130 315 170 315 230 V 460"
            strokeWidth="1.5"
          />
          {/* Central Arabesque Rosette / Eight-Pointed Star Motif */}
          <circle cx="200" cy="180" r="48" strokeWidth="1.2" strokeDasharray="3 3" />
          <polygon
            points="200,135 215,165 245,165 222,185 231,215 200,198 169,215 178,185 155,165 185,165"
            strokeWidth="1.2"
          />
          <circle cx="200" cy="180" r="8" strokeWidth="1.2" />
          {/* Fine Geometric Radial Lines */}
          <line x1="200" y1="15" x2="200" y2="120" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="100" y1="230" x2="300" y2="230" strokeWidth="0.8" strokeDasharray="2 4" />
          <line x1="120" y1="310" x2="280" y2="310" strokeWidth="0.8" strokeDasharray="2 4" />
          <path
            d="M110 460 L 110 250 Q 155 190 200 150 Q 245 190 290 250 L 290 460"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Smooth Entrance Motion */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3.5 transition-all duration-700 ease-out opacity-100 translate-y-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-stone-200/80 shadow-xs backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-[#7C5C8A]" />
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#18181B] font-semibold">
              ✧ THE CURATED COLLECTION
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#18181B] tracking-tight">
            Handcrafted Modest Pieces
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] font-light max-w-lg mx-auto leading-relaxed">
            Pure fabrics, fluid drape, and timeless silhouette. Each design is individually tailored in Chennai upon order confirmation.
          </p>

          {/* Interactive Filter Category Tabs */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2.5">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-4 py-2 text-xs uppercase tracking-widest font-medium rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#7C5C8A] text-white font-semibold shadow-md shadow-purple-900/10 scale-105'
                      : 'border border-stone-200/80 bg-white text-stone-600 hover:border-purple-300 hover:text-purple-900 hover:scale-[1.02]'
                  }`}
                >
                  <span className="relative z-10">{cat}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#7C5C8A] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C5C8A]" />
            <p className="text-xs tracking-widest uppercase text-[#71717A]">
              Refining Atelier Catalog...
            </p>
          </div>
        )}

        {/* Empty State (When no products exist) */}
        {!isLoading && products.length === 0 && (
          <div className="max-w-xl mx-auto py-16 px-6 text-center bg-[#FFFFFF] border border-[#E8E8EC] rounded-sm shadow-sm space-y-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#7C5C8A]/10 border border-[#7C5C8A]/30 flex items-center justify-center text-[#7C5C8A]">
              <Compass className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#7C5C8A] font-semibold">
                Private Atelier Archive
              </span>
              <h3 className="font-serif text-2xl font-light text-[#18181B]">
                No pieces currently in collection.
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed max-w-md mx-auto">
                Check back soon or inquire directly. Our master tailors in Chennai craft bespoke one-of-a-kind commissions upon personal request.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openInquiry(null)}
                className="w-full sm:w-auto px-6 py-3 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-sm"
              >
                Request Custom Bespoke Commission
              </button>
              <button
                type="button"
                onClick={openSizeGuide}
                className="w-full sm:w-auto px-5 py-3 border border-[#E8E8EC] hover:bg-[#F7F7F9] text-[#18181B] text-xs uppercase tracking-widest font-semibold rounded-sm transition-all"
              >
                Explore Sizing Guide
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const primaryImage = product.images?.[0] || '/logo.png';
              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col bg-[#FFFFFF] border border-[#E8E8EC] rounded-sm overflow-hidden hover:border-[#7C5C8A]/60 hover:shadow-xl hover:shadow-purple-950/5 hover:-translate-y-1 transition-all duration-500"
                >
                  {/* Image Card Container */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
                    {/* Placeholder Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200/50 to-stone-100 animate-pulse pointer-events-none" />

                    <Image
                      src={primaryImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      unoptimized
                    />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      {product.is_in_stock ? (
                        <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-semibold bg-[#7C5C8A] text-white backdrop-blur-sm rounded-sm shadow-sm">
                          {product.category}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-semibold bg-[#27272A]/90 text-white backdrop-blur-sm rounded-sm">
                          Waitlist Only
                        </span>
                      )}
                    </div>

                    {/* Fabric Pill */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono bg-white/95 text-[#18181B] backdrop-blur-sm rounded border border-[#E8E8EC]">
                        {product.fabric}
                      </span>
                    </div>

                    {/* Hover Overlay with "Quick View / Add to Bag" sliding up smoothly */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 flex items-center justify-center gap-2">
                      <Link
                        href={`/product/${product.slug}`}
                        className="flex-1 py-2 px-3 bg-white/95 hover:bg-white text-[#18181B] text-[11px] uppercase tracking-wider font-semibold rounded-sm shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#7C5C8A]" />
                        <span>Quick View</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 py-2 px-3 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-[11px] uppercase tracking-wider font-semibold rounded-sm shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/product/${product.slug}`}>
                          <h3 className="font-serif text-lg font-semibold text-[#18181B] hover:text-[#7C5C8A] transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-[#18181B] font-mono whitespace-nowrap block">
                            ₹{product.price}
                          </span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="text-[11px] text-[#888] line-through font-mono">
                                ₹{product.compare_at_price}
                              </span>
                              <span className="text-[9px] font-semibold text-[#7C5C8A] bg-[#7C5C8A]/10 px-1 rounded border border-[#7C5C8A]/25">
                                {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#71717A] line-clamp-2 font-light">
                        {product.description || `Handcrafted ${product.fabric} abaya tailored with graceful modest lines in Chennai.`}
                      </p>
                    </div>

                    {/* Interactive Size Selector Pills */}
                    <div className="pt-2 border-t border-[#E8E8EC] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="uppercase tracking-wider text-[#71717A] font-semibold">
                          Select Size: <strong className="text-[#18181B]">{getSize(product.id, product.sizes)}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={openSizeGuide}
                          className="text-[#7C5C8A] hover:underline"
                        >
                          Size Guide
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {DEFAULT_SIZES.map((s) => {
                          const isSelected = getSize(product.id, product.sizes) === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSize(product.id, s)}
                              className={`px-2 py-1 text-[10px] font-mono font-semibold rounded transition-all border ${
                                isSelected
                                  ? 'bg-[#7C5C8A] text-white border-[#7C5C8A] shadow-xs'
                                  : 'bg-[#F7F7F9] text-[#52525B] border-[#E8E8EC] hover:border-[#7C5C8A]/50'
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantity & Bespoke Guarantee */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-[#E8E8EC] rounded bg-white">
                        <button
                          type="button"
                          onClick={() => changeQuantity(product.id, -1)}
                          className="p-1 hover:bg-[#F7F7F9] text-[#71717A] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold font-mono text-[#18181B]">
                          {getQuantity(product.id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(product.id, 1)}
                          className="p-1 hover:bg-[#F7F7F9] text-[#71717A] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-[10px] text-[#7C5C8A] font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Chennai Atelier Craft
                      </span>
                    </div>

                    {/* Primary & Secondary Action Buttons */}
                    <div className="pt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2.5 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-[11px] uppercase tracking-wider font-bold rounded-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBuyNow(product)}
                        className="w-full py-2.5 bg-[#18181B] hover:bg-black text-white text-[11px] uppercase tracking-wider font-bold rounded-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
