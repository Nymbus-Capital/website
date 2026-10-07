"use client";
/**
 * Client side of the i18n: the provider is seeded by the server (getLocale() in the site layout) so the
 * first render is already in the right language. Switching language writes the cookie, updates <html lang>
 * and refreshes the server components (router.refresh) so server-rendered copy follows too.
 *
 *   const { locale, setLocale, t } = useTranslation();
 */
import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type L, type Locale } from "./config";
import { dict, type TFn } from "./dict";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFn;
  /** pick the current language of a bilingual `{ en, fr }` string */
  pick: (x: L | null | undefined) => string;
  /** true while the server components re-render after a language switch */
  pending: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setState] = useState<Locale>(initialLocale);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      setState(next);
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      startTransition(() => router.refresh());
    },
    [router],
  );

  const value = useMemo<I18nContextValue>(() => {
    const t = dict(locale);
    return { locale, setLocale, t, pick: (x) => (x ? x[locale] || x.en : ""), pending };
  }, [locale, setLocale, pending]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

const FALLBACK: I18nContextValue = {
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: dict(DEFAULT_LOCALE),
  pick: (x) => (x ? x.en : ""),
  pending: false,
};

/** Current language, a setter and the translator. Works outside the provider (English, no-op setter). */
export function useTranslation(): I18nContextValue {
  return useContext(I18nContext) ?? FALLBACK;
}
