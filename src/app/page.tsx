import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CollectionGrid from '@/components/CollectionGrid';
import BespokeSection from '@/components/BespokeSection';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { getStoreSettings } from '@/lib/store-settings';

export default async function HomePage() {
  const settings = await getStoreSettings();

  return (
    <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
      <Navbar initialLogoUrl={settings.logo_url} />
      <main className="flex-1">
        <HeroSection initialLogoUrl={settings.logo_url} />
        <CollectionGrid />
        <BespokeSection />
      </main>
      <Footer settings={settings} />
      <MobileBottomNav />
    </div>
  );
}
