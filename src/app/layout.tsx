import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dashato - Global Multi-Vendor Marketplace | Amazon & Best Buy Inspired',
  description: 'Shop flagship laptops, audio equipment, smart devices, and Scandinavian home living from verified sellers worldwide.',
  keywords: ['ecommerce', 'marketplace', 'electronics', 'laptops', 'audio', 'multi-vendor', 'Best Buy', 'Amazon'],
  openGraph: {
    title: 'Dashato Multi-Vendor Ecommerce Platform',
    description: 'Empowering premium electronics & modern living with fast global shipping.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${sora.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
