import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WALA ABAYA | Bespoke Modest Couture • Crafted in Chennai',
  description:
    'Chennai-based modest couture & bespoke abaya atelier. Bespoke hand-tailored abayas, pure silk crepe, French lace, and tailored modesty crafted in Chennai with delivery across Chennai & nationwide shipping.',
  keywords: [
    'Wala Abaya',
    'luxury abaya Chennai',
    'bespoke abaya Chennai',
    'modest fashion India',
    'handcrafted abaya',
    'silk abaya Tamil Nadu',
    'made to order abaya',
  ],
  openGraph: {
    title: 'WALA ABAYA | Bespoke Modest Couture • Crafted in Chennai',
    description:
      'Chennai-based modest couture & bespoke abaya atelier. Tailored with graceful dignity, delivering across Chennai & nationwide.',
    type: 'website',
  },
};

import ClientProviders from '@/components/ClientProviders';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${plusJakarta.variable} scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-[#F7F7F9] text-[#18181B] antialiased selection:bg-[#7C5C8A]/20 selection:text-[#18181B]">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
