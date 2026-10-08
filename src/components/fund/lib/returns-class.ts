// returns-class.ts — which class's own series a page shows: the preferred class when complete, else the most complete one
import type { FundContent, FundData, Performance } from "../../../lib/data/types.ts";
import { isNum } from "./is-num.ts";
import { trackMonths } from "./performance.ts";

type Data = Omit<FundData, "sourceName">;
const up = (s: string | null | undefined): string => (s ?? "").toUpperCase();

/** Regulatory minimum: a series shows performance only from 12 months of history. */
export const MIN_MONTHS = 12;

/** Full months of a series' history (a partial first month does not count). */
export function historyMonths(perf: Pick<Performance, "firstMonth" | "asOf" | "partialFirstMonth"> | null | undefined) {
  if (!perf?.firstMonth || !perf.asOf) return 0;
  return Math.max(0, trackMonths(perf.firstMonth, perf.asOf) - (perf.partialFirstMonth ? 1 : 0));
}

/** The series has at least 12 months of history (else it shows no performance figure at all). */
export function hasMinHistory(
  perf: Pick<Performance, "firstMonth" | "asOf" | "partialFirstMonth" | "shortRecord"> | null | undefined,
): boolean {
  return !!perf && !perf.shortRecord && historyMonths(perf) >= MIN_MONTHS;
}

/** Number of published fund figures of a series: trailing periods and calendar years. */
export function figureCount(perf: Pick<Performance, "trailing" | "calendar"> | null | undefined): number {
  if (!perf) return 0;
  const trailing = Object.values(perf.trailing?.fund ?? {}).filter(isNum).length;
  const years = (perf.calendar ?? []).filter((r) => isNum(r.fund)).length;
  return trailing + years;
}

/** Complete: 12 months of history, no withheld month and a since-inception figure (so every period has its figure). */
export function isComplete(perf: Performance | null | undefined): boolean {
  return !!perf && hasMinHistory(perf) && !perf.withheldMonths?.length && isNum(perf.trailing?.fund?.SI);
}

/** The class's own series (never another class's): its performanceByClass entry, or the single series of older data. */
export function ownSeries(data: Data | null | undefined, code: string | null | undefined): Performance | null {
  if (!data || !code) return null;
  const own = Object.values(data.performanceByClass ?? {}).find((c) => up(c.fundserv) === up(code));
  if (own) return own.performance;
  if (data.performanceByClass) return null;
  // datasets published before class series: the single series is the class it says it is
  const display =
    data.classInfo?.[code]?.display ??
    Object.values(data.classInfo ?? {}).find((c) => up(c.fundserv) === up(code))?.display ??
    data.nav?.classes.find((c) => up(c.fundserv) === up(code))?.display ??
    null;
  const perf = data.performance;
  return perf && display && up(perf.returnClass) === up(display) ? perf : null;
}

/** A class never offered for returns: less than 12 months since inception, non-CAD without returns, or no series. */
export function blockedForReturns(data: Data | null | undefined, code: string | null | undefined): boolean {
  if (!data || !code) return true;
  const info = Object.values(data.classInfo ?? {}).find((c) => up(c.fundserv) === up(code));
  return info?.status === "young" || info?.status === "currency" || info?.status === "unavailable";
}

/** The class can show returns: not blocked, its own series with 12 months of history and at least one figure. */
export function showsReturns(data: Data | null | undefined, code: string | null | undefined): boolean {
  if (blockedForReturns(data, code)) return false;
  const p = ownSeries(data, code);
  return hasMinHistory(p) && figureCount(p) > 0;
}

function currencyOf(data: Data, code: string): string | null {
  const info = Object.values(data.classInfo ?? {}).find((c) => up(c.fundserv) === up(code));
  if (info?.currency) return info.currency;
  return data.nav?.classes.find((c) => up(c.fundserv) === up(code))?.currency ?? null;
}

/**
 * Classes in the order they are considered for the returns shown: the preferred class (admin headline → registry
 * headline → data default), the data's default class, the track-record class, then the other CAD classes by FundServ.
 */
export function returnsCandidates(
  data: Data | null | undefined,
  spec: { headlineClass: string | null; classes?: { fundserv: string }[] },
  content: Pick<FundContent, "headlineClass"> | null | undefined,
): string[] {
  if (!data) return [];
  const out: string[] = [];
  const push = (c: string | null | undefined) => {
    if (c && !out.some((x) => up(x) === up(c))) out.push(c);
  };
  push(content?.headlineClass || spec.headlineClass || data.defaultClass || null);
  push(data.defaultClass);
  const track = data.performance;
  const trackEntry = track
    ? Object.values(data.performanceByClass ?? {}).find(
        (c) => !!track.returnClass && up(c.display) === up(track.returnClass),
      )
    : undefined;
  push(trackEntry?.fundserv);
  const rest = new Set<string>();
  for (const c of spec.classes ?? []) rest.add(c.fundserv);
  for (const c of Object.values(data.performanceByClass ?? {})) rest.add(c.fundserv);
  for (const c of Object.values(data.classInfo ?? {})) rest.add(c.fundserv);
  for (const c of data.nav?.classes ?? []) rest.add(c.fundserv);
  [...rest]
    .filter((c) => {
      const cur = currencyOf(data, c);
      return !cur || up(cur) === "CAD";
    })
    .sort((a, b) => a.localeCompare(b))
    .forEach(push);
  return out;
}

/**
 * The class whose own series the page / card shows by default: the first candidate whose series is complete; else
 * the candidate whose series has the most figures (ties: candidate order); null when no class can show returns.
 */
export function chosenReturnsClass(
  data: Data | null | undefined,
  spec: { headlineClass: string | null; classes?: { fundserv: string }[]; preferHeadlineReturns?: boolean },
  content: Pick<FundContent, "headlineClass"> | null | undefined,
): string | null {
  const all = returnsCandidates(data, spec, content);
  const ok = all.filter((c) => showsReturns(data, c));
  // the preferred class (admin headline → registry headline, e.g. SEB Series F) is shown whenever its own series can
  // carry a headline figure (since inception or 1 year), even with a shorter history than another class (owner's
  // decision 2026-10-07); periods it lacks are simply omitted
  const preferred = all[0];
  if (spec.preferHeadlineReturns && preferred && ok.includes(preferred)) {
    const t = ownSeries(data, preferred)?.trailing?.fund;
    if (isNum(t?.SI) || isNum(t?.["1Y"])) return preferred;
  }
  const complete = ok.find((c) => isComplete(ownSeries(data, c)));
  if (complete) return complete;
  let best: string | null = null;
  let most = 0;
  for (const c of ok) {
    const n = figureCount(ownSeries(data, c));
    if (n > most) {
      best = c;
      most = n;
    }
  }
  return best;
}
