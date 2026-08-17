"use client";

import { ShieldCheck, Truck, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function AnnouncementBar() {
  const { t } = useTranslation();

  return (
    <div className="dark:bg-secondary bg-primary text-secondary-foreground text-xs py-2 px-4 border-b border-secondary/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 dark:text-primary text-white font-medium">
            <Truck className="w-3.5 h-3.5" />
            <span>{t.announcement}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 dark:text-primary text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.verifiedGuarantee}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 dark:text-primary text-white">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" /> {t.useCode}{" "}
            <strong className="text-white font-bold tracking-wide bg-primary px-1.5 py-0.5 rounded border border-primary">
              DASHATO10
            </strong>{" "}
            {t.forDiscount}
          </span>
          <span className="hidden sm:inline">|</span>
          <a
            href="/vendor/apply"
            className="hover:text-primary transition-colors hidden sm:inline"
          >
            {t.sellOnDashato}
          </a>
        </div>
      </div>
    </div>
  );
}
