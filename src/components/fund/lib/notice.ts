/**
 * Period labels of a fund page (pure): the long label of a trailing period, the month after a month-end.
 */
import { T } from "../fund.copy.ts";
import { dateLabel, monthLabel } from "./format.ts";
import { tr, type Locale } from "../../../lib/i18n/config.ts";

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
