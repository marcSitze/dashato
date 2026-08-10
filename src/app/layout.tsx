import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
