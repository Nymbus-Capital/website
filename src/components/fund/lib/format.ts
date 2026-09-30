/**
 * Formatting helpers for the fund pages. Pure and dependency-free (unit-tested under plain Node).
 *
 * `fmt` mirrors `fmt()` of src/components/v3/motion.tsx exactly (tabular, U+2212 minus, FR "5,2 %"),
 * so figures that count up (CountUp) and static figures render identically. motion.tsx is a client module
 * with React imports, which is why the chart maths cannot import it.
 */
export type Lang = "en" | "fr";

export const MINUS = "−";

export interface FmtOpts { decimals?: number; pct?: boolean; sign?: boolean; prefix?: string; suffix?: string; lang?: Lang }

export function fmt(v: number, o: FmtOpts = {}): string {
  const d = o.decimals ?? 1;
  const x = o.pct ? v * 100 : v;
  const s = Math.abs(x).toLocaleString(o.lang === "fr" ? "fr-CA" : "en-CA", { minimumFractionDigits: d, maximumFractionDigits: d });
  // a value that rounds to zero is shown unsigned ("0.0%", never "−0.0%")
  const zero = Number(Math.abs(x).toFixed(d)) === 0;
  const sign = zero ? "" : x < 0 ? MINUS : o.sign && x > 0 ? "+" : "";
  const pct = o.pct ? (o.lang === "fr" ? " %" : "%") : "";
  return `${sign}${o.prefix ?? ""}${s}${pct}${o.suffix ?? ""}`;
}

/** Decimal fraction as a percentage: 0.0523 → "5.2%" / "5,2 %". */
export const pct = (v: number, lang: Lang, decimals = 1, sign = false) => fmt(v, { pct: true, decimals, sign, lang });

/** Plain number (ratios, duration): 1.234 → "1.23" / "1,23". */
export const num = (v: number, lang: Lang, decimals = 2) => fmt(v, { decimals, lang });

/** Chart tick for a percentage axis: no trailing zeros ("2%", "2.5%"). */
export function pctTick(v: number, lang: Lang, step: number): string {
  const d = Math.max(0, Math.min(2, -Math.floor(Math.log10(Math.abs(step * 100) || 1) + 1e-9)));
  return fmt(v, { pct: true, decimals: step * 100 >= 1 && Number.isInteger(+(step * 100).toFixed(6)) ? 0 : d, lang });
}

/** Money with currency: EN "$10.52", "US$10.52"; FR "10,52 $", "10,52 $ US". */
/** Decimals of a NAV per unit everywhere on the site (fund page NAV card and series table, cards, tables). */
export const NAV_DECIMALS = 4;

export function money(v: number, currency: string, lang: Lang, decimals = 2): string {
  const n = Math.abs(v).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const sign = v < 0 && Number(Math.abs(v).toFixed(decimals)) !== 0 ? MINUS : "";
  const cur = (currency || "CAD").toUpperCase();
  if (lang === "fr") return `${sign}${n} $${cur === "CAD" ? "" : ` ${cur === "USD" ? "US" : cur}`}`;
  return `${sign}${cur === "CAD" ? "" : cur === "USD" ? "US" : `${cur} `}$${n}`;
}

/** Prefix / suffix around a formatted amount so that `fmt(v, { decimals, prefix, suffix })` equals `money(v, …)` for v ≥ 0. */
export function moneyParts(currency: string, lang: Lang): { prefix: string; suffix: string } {
  const cur = (currency || "CAD").toUpperCase();
  if (lang === "fr") return { prefix: "", suffix: ` $${cur === "CAD" ? "" : ` ${cur === "USD" ? "US" : cur}`}` };
  return { prefix: `${cur === "CAD" ? "" : cur === "USD" ? "US" : `${cur} `}$`, suffix: "" };
}

/** Compact dollars for axes: 12 500 → "$12.5k" / "12,5 k$"; 1 250 000 → "$1.25M" / "1,25 M$". */
export function compactMoney(v: number, lang: Lang): string {
  const a = Math.abs(v);
  const [k, unitEn, unitFr] = a >= 1e9 ? [1e9, "B", "G$"] : a >= 1e6 ? [1e6, "M", "M$"] : a >= 1e3 ? [1e3, "k", "k$"] : [1, "", "$"];
  const x = v / k;
  const d = Number.isInteger(+x.toFixed(2)) ? 0 : Number.isInteger(+(x * 10).toFixed(2)) ? 1 : 2;
  const s = fmt(x, { decimals: d, lang });
  return lang === "fr" ? `${s} ${unitFr}` : `${s.startsWith(MINUS) ? MINUS : ""}$${s.replace(MINUS, "")}${unitEn}`;
}

/** Large amounts in words-ish form for AUM: 245 300 000 → "$245.3M" / "245,3 M$". */
export function bigMoney(v: number, lang: Lang): string {
  const a = Math.abs(v);
  const [k, en, frU] = a >= 1e9 ? [1e9, "B", "G$"] : a >= 1e6 ? [1e6, "M", "M$"] : [1e3, "k", "k$"];
  const s = fmt(v / k, { decimals: 1, lang });
  return lang === "fr" ? `${s} ${frU}` : `$${s}${en}`;
}

const MONTHS: Record<Lang, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
};
const MONTHS_SHORT: Record<Lang, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  fr: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
};
/** One-letter month headers for the heatmap. */
export const MONTH_INITIALS: Record<Lang, string[]> = {
  en: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  fr: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
};
export const monthName = (m: number, lang: Lang, short = false) => (short ? MONTHS_SHORT : MONTHS)[lang][m - 1] ?? "";

/** Year and month (1-12) of an ISO date or a `YYYY-MM` month key, without time-zone surprises. */
export function ym(iso: string): { y: number; m: number; d: number } | null {
  const r = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(iso || "");
  if (!r) return null;
  return { y: +r[1], m: +r[2], d: r[3] ? +r[3] : 1 };
}

/** "2026-08-31" or "2026-08" → "August 2026" / "août 2026" (French months stay lowercase). */
export function monthLabel(iso: string | null | undefined, lang: Lang, short = false): string {
  const p = iso ? ym(iso) : null;
  return p ? `${monthName(p.m, lang, short)} ${p.y}` : "";
}

/** "2026-09-26" → "Sep 26, 2026" / "26 sept. 2026"; `long`: "September 26, 2026" / "26 septembre 2026". */
export function dateLabel(iso: string | null | undefined, lang: Lang, long = false): string {
  const p = iso ? ym(iso) : null;
  if (!p) return "";
  return lang === "fr" ? `${p.d}${p.d === 1 ? "er" : ""} ${monthName(p.m, lang, !long)} ${p.y}` : `${monthName(p.m, lang, !long)} ${p.d}, ${p.y}`;
}

/** "<text ending in « de »> <word>" with the French elision before a vowel: « de août » → « d’août ». */
export function elide(text: string, next: string, lang: Lang): string {
  if (lang === "fr" && /\bde$/.test(text) && /^[aeiouyàâéèêîïôûh]/i.test(next)) return `${text.slice(0, -2)}d’${next}`;
  return `${text} ${next}`;
}

export function fileSize(bytes: number, lang: Lang): string {
  const [k, en, frU] = bytes >= 1024 * 1024 ? [1024 * 1024, "MB", "Mo"] : [1024, "KB", "Ko"];
  return `${fmt(bytes / k, { decimals: bytes >= 1024 * 1024 ? 1 : 0, lang })} ${lang === "fr" ? frU : en}`;
}

/** Characteristic value according to its unit (contract: pct = decimal, num = 1 decimal, int, text). */
export function charValue(v: number | string | null | undefined, unit: "pct" | "num" | "int" | "text", lang: Lang): string | null {
  if (v == null || v === "") return null;
  if (typeof v === "string") return v;
  if (!Number.isFinite(v)) return null;
  if (unit === "pct") return pct(v, lang, Math.abs(v) >= 0.1 ? 1 : 2);
  if (unit === "num") return num(v, lang, 1);
  if (unit === "int") return fmt(v, { decimals: 0, lang });
  return String(v);
}

/** Numeric parts of a characteristic, for CountUp (null when the value is text). */
export function charCount(v: number | string | null | undefined, unit: "pct" | "num" | "int" | "text"): { value: number; decimals: number; pct: boolean } | null {
  if (typeof v !== "number" || !Number.isFinite(v) || unit === "text") return null;
  return unit === "pct" ? { value: v, decimals: Math.abs(v) >= 0.1 ? 1 : 2, pct: true } : unit === "num" ? { value: v, decimals: 1, pct: false } : { value: v, decimals: 0, pct: false };
}

/** Label separator: French puts a non-breaking space before the colon. */
export const colon = (lang: Lang): string => (lang === "fr" ? "\u00a0: " : ": ");
