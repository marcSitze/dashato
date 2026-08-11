'use client';

import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Headphones, Sparkles, CreditCard } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useTranslation } from '@/lib/i18n/context';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">{t.trustShipping}</h5>
              <p className="text-xs text-slate-500">On all orders over $150</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">{t.trustGuarantee}</h5>
              <p className="text-xs text-slate-500">PCI-DSS 256-bit encryption</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">30-Day Easy Returns</h5>
              <p className="text-xs text-slate-500">Money back guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">{t.trustSupport}</h5>
              <p className="text-xs text-slate-500">Multi-vendor customer care</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
          {/* Brand Info & Preferences */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 font-black text-xl px-3 py-1 rounded-xl flex items-center gap-1">
                Dashato <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Dashato is the premiere global multi-vendor marketplace uniting premium electronics, high-end workstations, audiophile sound gear, and Scandinavian home living.
            </p>
            
            {/* Quick Preference Controls */}
            <div className="flex items-center gap-3 pt-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Shop Departments */}
          <div className="space-y-3">
            <h6 className="font-bold text-white text-xs uppercase tracking-wider">Departments</h6>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?category=laptops-computers" className="hover:text-amber-400">Laptops & Workstations</Link></li>
              <li><Link href="/products?category=audio-headphones" className="hover:text-amber-400">Audio & Studio Gear</Link></li>
              <li><Link href="/products?category=smart-home-wearables" className="hover:text-amber-400">Smart Home & Wearables</Link></li>
              <li><Link href="/products?category=home-office" className="hover:text-amber-400">Scandinavian Home & Furniture</Link></li>
              <li><Link href="/products" className="hover:text-amber-400">All Marketplace Products</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h6 className="font-bold text-white text-xs uppercase tracking-wider">{t.customerCare}</h6>
            <ul className="space-y-2 text-xs">
              <li><Link href="/account" className="hover:text-amber-400">{t.myAccount}</Link></li>
              <li><Link href="/account/orders" className="hover:text-amber-400">Track Order Status</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-amber-400">{t.wishlist}</Link></li>
              <li><Link href="/checkout" className="hover:text-amber-400">{t.proceedToCheckout}</Link></li>
            </ul>
          </div>

          {/* Marketplace Vendors & Admin */}
          <div className="space-y-3">
            <h6 className="font-bold text-white text-xs uppercase tracking-wider">Marketplace & Portals</h6>
            <ul className="space-y-2 text-xs">
              <li><Link href="/vendor/apply" className="text-amber-400 font-semibold hover:underline">{t.applyVendor}</Link></li>
              <li><Link href="/vendor" className="hover:text-amber-400">{t.vendorCenter}</Link></li>
              <li><Link href="/admin" className="hover:text-amber-400">{t.adminDashboard}</Link></li>
              <li><Link href="/login" className="hover:text-amber-400">{t.signIn}</Link></li>
            </ul>
          </div>
        </div>

        {/* Sub-footer Copyright & Payment badges */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Dashato Inc. {t.rights} Built with Next.js App Router, Prisma, & Tailwind CSS.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><CreditCard className="w-4 h-4 text-slate-400" /> Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>Stripe</span>
            <span>Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
