/**
 * Locale settings shared by the server helper (server.ts) and the client provider (context.tsx).
 * The chosen language is kept in a cookie so server components can render the right language on the
 * first byte (no flash of English for French visitors).
 */
export type Locale = "en" | "fr";
export const LOCALES: readonly Locale[] = ["en", "fr"] as const;
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "nymbus-locale";

export const isLocale = (v: unknown): v is Locale => v === "en" || v === "fr";

/** First supported language of an Accept-Language header ("fr-CA,fr;q=0.9,en;q=0.8" → "fr"). */
export function fromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const langs = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.slice(2)) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of langs) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return null;
}

/** Bilingual string: the one EN / FR text type of the site and of the data contract. */
export type L = { en: string; fr: string };
export const l = (en: string, fr: string): L => ({ en, fr });
/** Pick a language from a bilingual string. */
export const tr = (x: L | null | undefined, locale: Locale): string => (x ? x[locale] || x.en : "");
