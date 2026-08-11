'use client';

import * as React from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 px-2.5 rounded-xl text-xs font-bold gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Globe className="w-4 h-4 text-slate-500" />
          <span className="uppercase font-mono">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl min-w-[140px] p-1.5">
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className="flex items-center justify-between text-xs font-semibold rounded-xl cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span>🇺🇸</span> English
          </span>
          {locale === 'en' && <Check className="w-3.5 h-3.5 text-amber-500" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('fr')}
          className="flex items-center justify-between text-xs font-semibold rounded-xl cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span>🇫🇷</span> Français
          </span>
          {locale === 'fr' && <Check className="w-3.5 h-3.5 text-amber-500" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
