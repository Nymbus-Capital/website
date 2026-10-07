import type { Locale } from "./config";
import { en, type DictKey } from "./en";
import { fr } from "./fr";

export type TFn = (key: DictKey | (string & {}), vars?: Record<string, string | number>) => string;

/** Translator for a locale: `t("ui.asOf", { date })`. Unknown keys fall back to English, then to the key. */
export function dict(locale: Locale): TFn {
  const table: Record<string, string> = locale === "fr" ? fr : en;
  return (key, vars) => {
    let s = table[key] ?? (en as Record<string, string>)[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}

const MONTHS: Record<Locale, string[]> = {
  en: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
  fr: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juill.", "août", "sept.", "oct.", "nov.", "déc."],
};
const MONTHS_LONG: Record<Locale, string[]> = {
  en: [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ],
  fr: [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ],
};

/** ISO date (YYYY-MM-DD) as a day: "sep 26, 2026" / "26 sept. 2026". Parsed by hand: no timezone shift. */
export function formatDay(iso: string | null | undefined, locale: Locale): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return "";
  const y = iso.slice(0, 4),
    m = +iso.slice(5, 7) - 1,
    d = +iso.slice(8, 10);
  return locale === "fr" ? `${d} ${MONTHS[locale][m]} ${y}` : `${MONTHS[locale][m]} ${d}, ${y}`;
}

/** ISO month-end as a month: "august 2026" / "août 2026". */
export function formatMonth(iso: string | null | undefined, locale: Locale): string {
  if (!iso || !/^\d{4}-\d{2}/.test(iso)) return "";
  return `${MONTHS_LONG[locale][+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
}
