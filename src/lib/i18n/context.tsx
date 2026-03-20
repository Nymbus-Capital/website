'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from './en';
import { fr } from './fr';

export type Locale = 'en' | 'fr';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('nymbus-locale') as Locale | null;
    if (saved && (saved === 'en' || saved === 'fr')) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = 'en';
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('nymbus-locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: string): string => {
    const translations = locale === 'fr' ? fr : en;
    return (translations as Record<string, string>)[key] || (en as Record<string, string>)[key] || key;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Provide a default context for SSR
    const t = (key: string): string => {
      return (en as Record<string, string>)[key] || key;
    };
    return { locale: 'en' as Locale, setLocale: () => {}, t };
  }
  return context;
}