'use client';

import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Headphones, CreditCard } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useTranslation } from '@/lib/i18n/context';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-secondary text-secondary-foreground text-sm border-t border-secondary/50 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-secondary-foreground/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-secondary-foreground text-sm">{t.trustShipping}</h5>
              <p className="text-xs text-secondary-foreground/60">{t.trustShippingSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-secondary-foreground text-sm">{t.trustGuarantee}</h5>
              <p className="text-xs text-secondary-foreground/60">{t.trustGuaranteeSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-secondary-foreground text-sm">{t.trustReturns}</h5>
              <p className="text-xs text-secondary-foreground/60">{t.trustReturnsSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-secondary-foreground text-sm">{t.trustSupport}</h5>
              <p className="text-xs text-secondary-foreground/60">{t.trustSupportSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
          {/* Brand Info & Preferences */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/Dashato_logo_light_mode.png"
                alt="Dashato"
                className="h-10 w-auto dark:hidden object-contain"
              />
              <img
                src="/Dashato_logo_dark_mode.png"
                alt="Dashato"
                className="h-10 w-auto hidden dark:block object-contain"
              />
            </div>
            <p className="text-xs text-secondary-foreground/75 leading-relaxed max-w-sm">
              {t.brandStory}
            </p>
            
            {/* Quick Preference Controls */}
            <div className="flex items-center gap-3 pt-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Shop Departments */}
          <div className="space-y-3">
            <h6 className="font-bold text-secondary-foreground text-xs uppercase tracking-wider">{t.departments}</h6>
            <ul className="space-y-2 text-xs text-secondary-foreground/80">
              <li><Link href="/products" className="hover:text-primary transition-colors">{t.allProducts}</Link></li>
              <li><Link href="/products?sort=best_selling" className="hover:text-primary transition-colors">{t.bestSellers}</Link></li>
              <li><Link href="/products?sort=newest" className="hover:text-primary transition-colors">{t.newArrivals}</Link></li>
              <li><Link href="/deals" className="hover:text-primary transition-colors">{t.flashDeals}</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h6 className="font-bold text-secondary-foreground text-xs uppercase tracking-wider">{t.customerCare}</h6>
            <ul className="space-y-2 text-xs text-secondary-foreground/80">
              <li><Link href="/account" className="hover:text-primary transition-colors">{t.myAccount}</Link></li>
              <li><Link href="/account/orders" className="hover:text-primary transition-colors">{t.trackOrderStatus}</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-primary transition-colors">{t.wishlist}</Link></li>
              <li><Link href="/checkout" className="hover:text-primary transition-colors">{t.proceedToCheckout}</Link></li>
            </ul>
          </div>

          {/* Marketplace Vendors & Admin */}
          <div className="space-y-3">
            <h6 className="font-bold text-secondary-foreground text-xs uppercase tracking-wider">{t.portals}</h6>
            <ul className="space-y-2 text-xs text-secondary-foreground/80">
              <li><Link href="/vendor/apply" className="text-primary font-semibold hover:underline">{t.applyVendor}</Link></li>
              <li><Link href="/vendor" className="hover:text-primary transition-colors">{t.vendorCenter}</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">{t.adminDashboard}</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">{t.signIn}</Link></li>
            </ul>
          </div>
        </div>

        {/* Sub-footer Copyright & Payment badges */}
        <div className="border-t border-secondary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary-foreground/60">
          <p>© {new Date().getFullYear()} Dashato Inc. {t.rights}</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><CreditCard className="w-4 h-4 text-secondary-foreground/70" /> Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>WhatsApp Direct</span>
            <span>Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
