/**
 * The sentence a fund page shows instead of figures for the selected series: a young series (regulatory minimum of
 * months since its inception), a non-CAD series without distribution-aware returns, or "coming soon". Pure.
 */
import { T } from "../fund.copy.ts";
import { dateLabel, monthLabel } from "./format.ts";
import type { ClassNotice } from "./select.ts";
import { tr, type L, type Locale } from "../../../lib/i18n/config.ts";

export function noticeText(notice: ClassNotice, lang: Locale): string {
  if (notice.kind === "young") {
    return tr(T.classes.young, lang)
      .replace("{x}", notice.display)
      .replace("{date}", dateLabel(notice.inception, lang, true))
      .replace("{n}", String(notice.minMonths));
  }
  return tr(T.classes.currency, lang).replace("{x}", notice.display).replace("{cur}", notice.currency);
}

/** What to say when the selected series shows no figure (`fallback` when nothing more specific is known). */
export function noFiguresText(
  ctx:
    | {
        returnsSoon?: boolean;
        notice?: ClassNotice | null;
        options?: { fundserv: string; display: string }[];
        selected?: string | null;
      }
    | undefined,
  lang: Locale,
  fallback: L,
): string {
  if (ctx?.notice) return noticeText(ctx.notice, lang);
  const sel = ctx?.options?.find((o) => o.fundserv === ctx.selected) ?? null;
  return ctx?.returnsSoon && sel ? tr(T.classes.soon, lang).replace("{x}", sel.display) : tr(fallback, lang);
}

/**
 * Long label of a trailing period. A class entry's since-inception row names its inception: "Since inception (Oct 5, 2021)";
 * the track record of a fund with series (`track`) names its start: "Since track-record start (Jan 2019)" — never the
 * series' own inception next to a figure starting earlier.
 */
export function periodLong(
  period: keyof typeof T.perf.periodsLong,
  perf: { inception?: string; firstMonth?: string } | null | undefined,
  lang: Locale,
  track = false,
): string {
  const base = tr(T.perf.periodsLong[period], lang);
  if (period !== "SI" || !perf) return base;
  if (perf.inception) return `${base} (${dateLabel(perf.inception, lang)})`;
  if (track && perf.firstMonth)
    return tr(T.classes.siTrack, lang).replace("{month}", monthLabel(perf.firstMonth, lang, true));
  return base;
}

/** "YYYY-MM-DD" month-end → the next month's end month label source ("YYYY-MM-28"), for "From <month>" labels */
export function nextMonth(iso: string): string {
  const y = +iso.slice(0, 4),
    m = +iso.slice(5, 7);
  return m === 12 ? `${y + 1}-01-28` : `${y}-${String(m + 1).padStart(2, "0")}-28`;
}
