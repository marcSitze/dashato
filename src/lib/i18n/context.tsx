'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, dictionaries } from './dictionaries';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof dictionaries['fr'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to French as requested
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem('dashato-locale') as Locale;
      if (savedLocale === 'en' || savedLocale === 'fr') {
        setLocaleState(savedLocale);
      }
    } catch {
      // Ignore localStorage restrictions
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('dashato-locale', newLocale);
    } catch {
      // Ignore
    }
  };

  const t = dictionaries[locale] || dictionaries.fr;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
