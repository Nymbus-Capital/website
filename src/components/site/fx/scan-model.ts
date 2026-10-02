/**
 * scan-model.ts — pure model of the home "analysis scan" illustration: a deterministic, endless stream of
 * generic rows (identifier, sector, term, spread, four factor scores, signal) that a scan line resolves.
 * Everything is generated: no issuer names, no real positions, no performance. Dependency-free (unit tested).
 */

export type Lang = "en" | "fr";
const l = (en: string, fr: string) => ({ en, fr });

/** Generic sector labels (no issuer names). */
export const SECTORS = [
  l("Banks", "Banques"), l("Utilities", "Services publics"), l("Energy", "Énergie"), l("Telecom", "Télécoms"),
  l("Provincials", "Provinciales"), l("Infrastructure", "Infrastructures"), l("Insurance", "Assurance"), l("Real estate", "Immobilier"),
  l("Industrials", "Industrielles"), l("Municipals", "Municipales"), l("Consumer", "Consommation"), l("Materials", "Matériaux"),
];

/** Factor columns of the table. */
export const FACTORS = [l("Value", "Valeur"), l("Momentum", "Momentum"), l("Quality", "Qualité"), l("Carry", "Portage")];

export interface Column { key: string; label: { en: string; fr: string }; w: number; align: "l" | "r" | "c"; kind: "id" | "sector" | "num" | "z" | "signal" }

/** All columns, widest layout; `w` is a relative width. Narrow screens use COMPACT_KEYS. */
export const COLUMNS: Column[] = [
  { key: "id", label: l("Security", "Titre"), w: 1.15, align: "l", kind: "id" },
  { key: "sector", label: l("Sector", "Secteur"), w: 1.35, align: "l", kind: "sector" },
  { key: "term", label: l("Term (y)", "Terme (a)"), w: 0.9, align: "r", kind: "num" },
  { key: "spread", label: l("Spread (bp)", "Écart (pb)"), w: 1.05, align: "r", kind: "num" },
  { key: "f0", label: FACTORS[0], w: 0.85, align: "r", kind: "z" },
  { key: "f1", label: FACTORS[1], w: 1, align: "r", kind: "z" },
  { key: "f2", label: FACTORS[2], w: 0.9, align: "r", kind: "z" },
  { key: "f3", label: FACTORS[3], w: 0.85, align: "r", kind: "z" },
  { key: "signal", label: l("Signal", "Signal"), w: 1.5, align: "c", kind: "signal" },
];
export const COMPACT_KEYS = ["id", "sector", "f0", "f1", "signal"];
/** Very narrow widths (under 420 px) drop the sector too: its labels do not fit next to the scores. */
export const XS_KEYS = ["id", "f0", "f1", "signal"];
/** Medium widths drop the term and spread. */
export const MEDIUM_KEYS = ["id", "sector", "f0", "f1", "f2", "f3", "signal"];

export function columnsFor(width: number): Column[] {
  const keys = width < 420 ? XS_KEYS : width < 560 ? COMPACT_KEYS : width < 900 ? MEDIUM_KEYS : null;
  return keys ? COLUMNS.filter((c) => keys.includes(c.key)) : COLUMNS;
}

/** x offsets (px) of each column for a total width, with `pad` on both sides. */
export function layout(cols: Column[], width: number, pad = 16): { x: number; w: number }[] {
  const total = cols.reduce((a, c) => a + c.w, 0);
  const inner = Math.max(1, width - 2 * pad);
  let x = pad;
  return cols.map((c) => {
    const w = (c.w / total) * inner;
    const out = { x, w };
    x += w;
    return out;
  });
}

/** `text` cut to the longest prefix (plus an ellipsis) that fits `maxW` according to `measure`; "" when nothing fits. */
export function fitText(text: string, maxW: number, measure: (s: string) => number): string {
  if (maxW <= 0 || !text) return "";
  if (measure(text) <= maxW) return text;
  const ell = "…";
  let lo = 0, hi = text.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (measure(text.slice(0, mid).trimEnd() + ell) <= maxW) lo = mid; else hi = mid - 1;
  }
  const cut = text.slice(0, lo).trimEnd();
  return cut && measure(cut + ell) <= maxW ? cut + ell : measure(ell) <= maxW ? ell : "";
}

/** 32-bit integer hash → [0, 1). Deterministic, stateless: row k and column c always give the same value. */
export function hash01(a: number, b = 0, c = 0): number {
  let h = (Math.imul(a | 0, 0x9e3779b1) ^ Math.imul(b | 0, 0x85ebca6b) ^ Math.imul(c | 0, 0xc2b2ae35)) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d) >>> 0;
  h ^= h >>> 12; h = Math.imul(h, 0x297a2d39) >>> 0;
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** Approximately normal in about [-3, 3] (sum of uniforms), deterministic. */
export function gauss(a: number, b = 0, c = 0): number {
  return (hash01(a, b, c) + hash01(a, b + 101, c) + hash01(a, b + 202, c) + hash01(a, b + 303, c) - 2) * 1.7320508;
}

export interface Row {
  n: number;
  id: string;
  sector: number;
  term: number;
  spread: number;
  z: [number, number, number, number];
  /** composite score in about [-1, 1] */
  score: number;
  /** flagged by the scan */
  hit: boolean;
}

/** Share of rows the scan flags. */
export const HIT_RATE = 0.12;

/** Row `n` of the endless stream (n ≥ 0). */
export function rowAt(n: number): Row {
  const z: [number, number, number, number] = [gauss(n, 1), gauss(n, 2), gauss(n, 3), gauss(n, 4)];
  const score = Math.max(-1, Math.min(1, (z[0] + z[1] + z[2] + z[3]) / 6));
  const hit = hash01(n, 9) < HIT_RATE;
  return {
    n,
    id: `ID-${String(1000 + ((n * 7919) % 9000)).padStart(4, "0")}`,
    sector: Math.floor(hash01(n, 5) * SECTORS.length),
    term: Math.round((0.5 + Math.pow(hash01(n, 6), 1.6) * 29.5) * 10) / 10,
    spread: Math.round(20 + Math.pow(hash01(n, 7), 1.8) * 380),
    z,
    // a flagged row always carries a decisive score, so the highlight and the bar agree
    score: hit ? (hash01(n, 8) < 0.5 ? -1 : 1) * (0.62 + hash01(n, 10) * 0.36) : score * 0.7,
    hit,
  };
}

/** Number as the table shows it: tabular, fixed decimals, true minus sign. */
export function fmtNum(v: number, d: number, lang: Lang = "en"): string {
  const s = Math.abs(v).toFixed(d);
  const t = lang === "fr" ? s.replace(".", ",") : s;
  return `${v < 0 && Number(s) !== 0 ? "−" : ""}${t}`;
}

/** z-score as shown: sign always, one decimal. */
export function fmtZ(v: number, lang: Lang = "en"): string {
  const s = fmtNum(v, 1, lang);
  return v > 0 && Number(Math.abs(v).toFixed(1)) !== 0 ? `+${s}` : s;
}

/**
 * Flicker: while the scan line is on a row its numbers shuffle; `tick` advances every few frames.
 * Returns the displayed value for column `c` of row `n` (the true value when `settle` is 1).
 */
export function flicker(base: number, n: number, c: number, tick: number, settle: number, amp: number): number {
  if (settle >= 1) return base;
  return base + (gauss(n, c + 40, tick) * amp) * (1 - settle);
}

/** Counters of the illustration: what the animation itself has scanned since it started (not market figures). */
export interface Counters { datapoints: number; securities: number; signals: number }

/** Counters after `rows` rows have been resolved by the scan, `cols` data cells each. */
export function countersAfter(rows: number, cols: number): Counters {
  const r = Math.max(0, Math.floor(rows));
  let signals = 0;
  // signals are counted exactly (the hit rows among the first r rows) without keeping state
  for (let i = 0; i < r; i++) if (hash01(i, 9) < HIT_RATE) signals++;
  return { datapoints: r * cols, securities: r, signals };
}

/** Compact thousands separator by language (narrow no-break space in French). */
export function groupDigits(n: number, lang: Lang = "en"): string {
  const s = String(Math.max(0, Math.round(n)));
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, lang === "fr" ? " " : ",");
}

/** Scan position: 0 → 1 over `period` ms, easing in and out, then a short rest; returns progress and phase. */
export function scanProgress(t: number, period = 5200, rest = 500): { k: number; resting: boolean; cycle: number } {
  const cycle = Math.floor(t / (period + rest));
  const u = t - cycle * (period + rest);
  if (u >= period) return { k: 1, resting: true, cycle };
  const x = u / period;
  return { k: x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2, resting: false, cycle };
}
