'use client';

import { ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';

export function AnnouncementBar() {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Truck className="w-3.5 h-3.5" />
            <span>{t.announcement}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.verifiedGuarantee}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> {t.useCode}{' '}
            <strong className="text-white font-bold tracking-wide bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
              DASHATO10
            </strong>{' '}
            {t.forDiscount}
          </span>
          <span className="hidden sm:inline">|</span>
          <a href="/vendor/apply" className="hover:text-amber-400 transition-colors hidden sm:inline">
            {t.sellOnDashato}
          </a>
        </div>
      </div>
    </div>
  );
}
