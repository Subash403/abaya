import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductDetailView from '@/components/ProductDetailView';
import MobileBottomNav from '@/components/MobileBottomNav';
import { getAdminClient } from '@/lib/supabase/admin';
import { getStoreSettings } from '@/lib/store-settings';
import { Product } from '@/types/database';
import { Compass } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const settings = await getStoreSettings();

  let product: Product | null = null;

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      product = data as Product;
    }
  } catch (err) {
    console.warn('Could not fetch product from Supabase:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFFF] pb-16 lg:pb-0">
      <Navbar initialLogoUrl={settings.logo_url} />
      <main className="flex-1">
        {product ? (
          <ProductDetailView product={product} />
        ) : (
          <div className="max-w-2xl mx-auto py-28 px-4 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#7C5C8A]/10 border border-[#7C5C8A]/30 flex items-center justify-center text-[#7C5C8A]">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#7C5C8A] font-semibold">
                Atelier Archives
              </span>
              <h1 className="font-serif text-3xl font-light text-[#18181B]">
                Piece Currently Unavailable
              </h1>
              <p className="text-xs text-[#71717A] max-w-md mx-auto leading-relaxed">
                The requested piece may have completed its private couture run or is awaiting atelier cataloging. You may commission a bespoke piece tailored to your personal specifications in Chennai.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/#collection"
                className="w-full sm:w-auto px-6 py-3 bg-[#7C5C8A] hover:bg-[#6A4A78] text-white text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-sm"
              >
                Explore Collection
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 border border-[#E8E8EC] hover:bg-[#F7F7F9] text-[#18181B] text-xs uppercase tracking-widest font-semibold rounded-sm transition-all"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer settings={settings} />
      <MobileBottomNav />
    </div>
  );
}
