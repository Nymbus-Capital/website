/** Locale helpers of the CMS pages (pure, server-safe). */
export type Loc = "en" | "fr";

export const pickL = (x: { en: string; fr: string } | null | undefined, locale: Loc): string =>
  x ? x[locale] || x.en || x.fr : "";

/** "October 1, 2026" / "1 octobre 2026" for a YYYY-MM-DD date (UTC, so the day never shifts). */
export function dateLong(iso: string, locale: Loc): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}
