/**
 * Monthly net returns of EVERY share class of a fund, each from its own daily `/api/performance/nav-timeseries` rows,
 * from its inception (Gabriel 2026-10-04: "make sure that all classes' returns are populated with data coming from
 * dataplatform … You can find the inception date of each class also by looking at the first date when there are prices
 * for that class"). Pure, dependency-free (Node type stripping).
 *
 *  - Inception: the first NAV-per-unit date of the class's CURRENT run. A gap of more than `relaunchGapDays` calendar days
 *    without a NAV per unit ends a run when a relaunch is corroborated (NAV jump or reset, or a very long gap): earlier rows
 *    are a previous life of the code; an uncorroborated gap is a coverage gap (its months withheld). The fund's `floor`
 *    (first day of its own book) cuts a run reaching back before it. The first row after a gap may carry a return relative
 *    to the old life: the inception day's own return is never used — the first (partial) month runs from the inception NAV.
 *  - Months: CIBC months compound the stored daily net returns (`legacy_stored`), Apex months the distribution-aware
 *    returns (`apex_distribution_aware`, continuous `return_start_date` chain), the cut-over month uses the NAV bridge
 *    (daily-chain.ts) — every valuation day of the month (after the inception day) present once, CAD, else the month is
 *    unavailable. A non-CAD class has no distribution-aware returns: no month at all.
 *  - Known source defects withhold months (never repaired, never filled from another class):
 *    a. bad valuation print: two consecutive daily returns of opposite sign, both ≥ `spikeMin`, combined ≤ `spikeRevert` ×
 *       the smaller → both months, every class of the fund;
 *    b. cross-class consistency of a complete month (published values): each class's expected return is a_c + b_c × m
 *       (m = the fund's median of complete months; a_c, b_c by Theil–Sen over the months where ≥ 3 classes are complete,
 *       leaving the month under test out); a residual beyond `residualMax` is a breach. A breach of a fitted class in a month
 *       holding a distribution / price-adjustment day in any class (stored return ≠ NAV ratio − 1 by more than
 *       `adjustmentMin`) → the month for EVERY class (the majority may be the wrong side); else a single breaching class
 *       whose ≥ 2 other complete classes are consistent → that class only; else every class. A class too young for a fit is
 *       withheld alone. A partial inception month (outside the median and the fit) is compared with the other classes over
 *       its own days (band max(`crossAbs`, `crossRel` × |median|)): withheld alone, or every class in an adjustment month;
 *    The newest month waits for one valuation day after its last day (a reversed month-end print), and the cut-over month's
 *    NAV bridge must equal the class's compounded daily returns;
 *    c. missing / duplicate days, invalid returns, another return method (above).
 */
import { apexMonth, BRIDGE_TOLERANCE, bridgeMonth, cibcMonth, CUTOVER, type ChainMonth, type ChainSource, type DailyRow } from "./daily-chain.ts";
import { tradingDays } from "./market-calendar.ts";
import { addMonths, toMonthEnd } from "./metrics.ts";

export interface ClassCheckConfig {
  relaunchGapDays: number;
  spikeMin: number;
  spikeRevert: number;
  crossAbs: number;
  crossRel: number;
  residualMax: number;
  adjustmentMin: number;
  fitMinMonths: number;
  fitSlopeMin: number;
  fitSlopeMax: number;
  fitInterceptMax: number;
  relaunchNavJump: number;
  relaunchLongGapDays: number;
  relaunchResetMinGapDays: number;
}

export interface ClassInput {
  fundserv: string;
  display: string;
  /** currency of the class (fund register), null when unknown (the rows decide) */
  currency: string | null;
  /** the class's daily rows; null with `error` when the history could not be read */
  rows: DailyRow[] | null;
  error?: string | null;
}

export interface ClassMonthResult {
  month: string;
  /** null: withheld (`reason`) */
  r: number | null;
  /** the inception month: runs from the inception NAV per unit, not from the previous month-end */
  partial: boolean;
  source: ChainSource;
  reason: string | null;
}

export interface ClassResult {
  fundserv: string;
  display: string;
  currency: string | null;
  inception: string | null;
  /** "ok": months computed (some may be withheld); "currency": non-CAD, no month; "unavailable": no history / inception */
  status: "ok" | "currency" | "unavailable";
  why: string | null;
  /** last day of an earlier run of the code (the class was relaunched, corroborated), for the admin */
  previousRunEnd: string | null;
  /** coverage gaps (> relaunchGapDays without a NAV, no relaunch corroborated) inside the current run */
  gaps?: { from: string; to: string }[];
  months: ClassMonthResult[];
}

export interface FundClassesResult {
  classes: ClassResult[];
  /** months withheld for every class of the fund (bad valuation prints, cross-class inconsistency), with the reason */
  fundMonths: { month: string; reason: string }[];
  /** class-months that could not be cross-checked (no other class over the same days) */
  unchecked: { fundserv: string; month: string }[];
  /** class-months withheld for that class alone by a check (cross-class outlier, newest month waiting), with the reason */
  classChecks: Record<string, { month: string; reason: string }[]>;
}

const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const validReturn = (v: unknown): v is number => finite(v) && v > -1;
const dayDiff = (a: string, b: string): number => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;
const prod = (rs: number[]): number => rs.reduce((a, r) => a * (1 + r), 1);
const pct = (x: number): string => `${(x * 100).toFixed(2)}%`;
const ym = (d: string): string => d.slice(0, 7);

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

/** rows with a string date, the date cut to YYYY-MM-DD, sorted by date (stable) */
export function normalizeRows(rows: DailyRow[]): DailyRow[] {
  return rows
    .filter((r) => r && typeof r.date === "string")
    .map((r) => ({ ...r, date: r.date.slice(0, 10) }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/**
 * Inception of a class: the first NAV-per-unit date of its current run (rows up to `end`). A gap of more than `gapDays`
 * ends a run only when a relaunch is corroborated: the NAV per unit jumps across the gap by more than `navJump`, restarts at
 * a launch price (10.00) after a gap of more than `resetMinGapDays`, or the gap is longer than `longGapDays` (the class was
 * closed). An uncorroborated gap is a
 * coverage gap inside the run (`gaps`: its months lack valuation days and are withheld). `floor` cuts a run reaching back
 * before it. `requestedFrom`: the first day asked from the source — a run starting within `gapDays` of it (and not cut by
 * the floor) may have begun earlier: inception unknown.
 */
export function currentRun(rows: DailyRow[], opts: { gapDays: number; end?: string; floor?: string | null; requestedFrom?: string | null; navJump?: number; longGapDays?: number; resetMinGapDays?: number }): { inception: string | null; previousRunEnd: string | null; why: string | null; gaps: { from: string; to: string }[] } {
  const nav = new Map<string, number>();
  for (const r of normalizeRows(rows)) if (finite(r.nav_per_share_cad) && (r.nav_per_share_cad as number) > 0 && (!opts.end || r.date <= opts.end) && !nav.has(r.date)) nav.set(r.date, r.nav_per_share_cad as number);
  const dates = [...nav.keys()];
  const gaps: { from: string; to: string }[] = [];
  if (!dates.length) return { inception: null, previousRunEnd: null, why: "no NAV per unit", gaps };
  const jump = opts.navJump ?? 0.05;
  const long = opts.longGapDays ?? 180;
  const relaunch = (before: string, after: string): boolean => {
    const x = nav.get(before)!, y = nav.get(after)!;
    // a unit value near 10.00 alone proves nothing (a bond class can trade there): a reset needs a real closure too
    return dayDiff(before, after) > long || Math.abs(y / x - 1) > jump || (Math.abs(y - 10) <= 0.01 && dayDiff(before, after) > (opts.resetMinGapDays ?? 30));
  };
  let i = dates.length - 1;
  while (i > 0) {
    if (dayDiff(dates[i - 1], dates[i]) > opts.gapDays) {
      if (relaunch(dates[i - 1], dates[i])) break;
      gaps.unshift({ from: dates[i - 1], to: dates[i] });
    }
    i--;
  }
  const previousRunEnd = i > 0 ? dates[i - 1] : null;
  const start = dates[i];
  const inRun = (g: { from: string }): boolean => g.from >= start;
  if (opts.floor && start < opts.floor) {
    const next = dates.find((d) => d >= opts.floor!);
    if (!next) return { inception: null, previousRunEnd, why: `no NAV per unit on or after the fund's first day ${opts.floor}`, gaps: [] };
    return { inception: next, previousRunEnd, why: null, gaps: gaps.filter((g) => g.from >= next) };
  }
  if (i === 0 && opts.requestedFrom && dayDiff(opts.requestedFrom, start) <= opts.gapDays) {
    return { inception: null, previousRunEnd, why: `the history read starts at ${opts.requestedFrom} and the class is priced from its first day: inception before it unknown`, gaps: gaps.filter(inRun) };
  }
  return { inception: start, previousRunEnd, why: null, gaps: gaps.filter(inRun) };
}

/** A partial month (the inception month): the days after the inception day, compounded from the inception NAV per unit. */
function partialMonth(own: DailyRow[], month: string, days: string[], inception: string, kind: "cibc" | "apex"): ChainMonth {
  const out: ChainMonth = { month, status: "unavailable", r: null, source: kind, issue: null };
  const rs = own.filter((r) => ym(r.date) === ym(month) && r.date > inception);
  const got = rs.map((r) => r.date);
  if (new Set(got).size !== got.length) return { ...out, status: "conflict", issue: "Duplicate daily observations" };
  const have = new Set(got);
  const missing = days.filter((d) => !have.has(d));
  if (missing.length) return { ...out, issue: `Incomplete valuation-day coverage after the inception day (missing ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? ", …" : ""})` };
  if (kind === "cibc") {
    const bad = rs.find((r) => r.source !== "cibc" || r.currency !== "CAD" || r.net_return_method !== "legacy_stored" || !validReturn(r.net_daily_return));
    if (bad) return { ...out, issue: `${bad.date}: not a stored CIBC net return in CAD (${bad.source ?? "?"}, ${bad.currency ?? "?"}, ${bad.net_return_method ?? "?"})` };
  } else {
    if (got.length !== days.length || got.some((d, i) => d !== days[i])) return { ...out, issue: "Valuation days outside the trading calendar after the inception day" };
    if (rs.some((r) => r.source !== "apex" || r.currency !== "CAD" || r.nav_type !== "FINAL_NAV" || r.net_return_method !== "apex_distribution_aware" || r.return_source_count !== 1 || !validReturn(r.net_daily_return))) {
      return { ...out, issue: "A complete distribution-aware Apex net-return chain is unavailable" };
    }
    const starts = [inception, ...days.slice(0, -1)];
    if (rs.some((r, i) => r.return_start_date !== starts[i])) return { ...out, issue: "Apex return periods do not form a continuous chain from the inception day" };
  }
  const value = prod(rs.map((r) => r.net_daily_return as number)) - 1;
  return validReturn(value) ? { ...out, status: "ready", r: value } : { ...out, issue: "Invalid compounded monthly return" };
}

/** Every month of one class from its inception month to `endMonth` (unchecked: the fund-level checks come after). */
export function monthsFromInception(rows: DailyRow[], inception: string, endMonth: string, cutover = CUTOVER): (ChainMonth & { partial: boolean; days: string[] })[] {
  const own = normalizeRows(rows).filter((r) => r.date >= inception && r.date <= endMonth);
  const bridge = toMonthEnd(cutover);
  const out: (ChainMonth & { partial: boolean; days: string[] })[] = [];
  for (let m = toMonthEnd(inception); m <= endMonth; m = addMonths(m, 1)) {
    const all = tradingDays(`${ym(m)}-01`, m);
    const days = all.filter((d) => d > inception);
    if (!days.length) continue; // launched on the month's last valuation day: the next month is its first, from that NAV
    const partial = days.length !== all.length;
    let cm: ChainMonth;
    if (m < bridge) cm = partial ? partialMonth(own, m, days, inception, "cibc") : cibcMonth(own, m, inception);
    else if (m === bridge) {
      if (inception > cutover) cm = partialMonth(own, m, days, inception, "apex");
      else if (partial) cm = { month: m, status: "unavailable", r: null, source: "bridge", issue: "launched in the cut-over month before the switch to Apex: no consistent chain" };
      else {
        cm = bridgeMonth(own, m, cutover);
        if (cm.status === "ready" && cm.r !== null) {
          // the NAV-ratio bridge is a price return: it must equal the class's own compounded daily returns (no distribution
          // or adjustment inside the month), else the month is not a total return
          const byDay = new Map<string, number>();
          for (const r of own) if (ym(r.date) === ym(m) && validReturn(r.net_daily_return) && (r.net_return_method === "legacy_stored" || r.net_return_method === "apex_distribution_aware")) byDay.set(r.date, r.net_daily_return as number);
          const miss = all.filter((d) => !byDay.has(d));
          const comp = miss.length ? null : prod(all.map((d) => byDay.get(d)!)) - 1;
          if (comp === null) cm = { ...cm, status: "unavailable", r: null, issue: `cut-over month: daily returns missing to confirm the NAV bridge (${miss.slice(0, 3).join(", ")})` };
          else if (Math.abs((1 + cm.r) / (1 + comp) - 1) > BRIDGE_TOLERANCE) cm = { ...cm, status: "unavailable", r: null, issue: `cut-over month: NAV bridge ${pct(cm.r)} vs compounded daily returns ${pct(comp)} (beyond the bridge tolerance: a distribution or adjustment inside the month)` };
        }
      }
    } else cm = partial ? partialMonth(own, m, days, inception, "apex") : apexMonth(own, m);
    out.push({ ...cm, partial, days });
  }
  return out;
}

/** valid daily total returns of a class after its inception day (stored CIBC or distribution-aware Apex), by date */
export function dailyReturns(rows: DailyRow[], inception: string, end?: string): Map<string, number> {
  const out = new Map<string, number>();
  const dup = new Set<string>();
  for (const r of normalizeRows(rows)) {
    if (r.date <= inception || (end && r.date > end)) continue;
    if (r.currency !== "CAD" || !validReturn(r.net_daily_return)) continue;
    if (!(r.net_return_method === "legacy_stored" || r.net_return_method === "apex_distribution_aware")) continue;
    if (out.has(r.date)) dup.add(r.date);
    out.set(r.date, r.net_daily_return);
  }
  for (const d of dup) out.delete(d); // two values for one day: neither is used for a comparison
  return out;
}

/** (a) bad valuation prints: month → reason, from every class's own consecutive daily returns */
export function spikeMonths(daily: Record<string, Map<string, number>>, cfg: Pick<ClassCheckConfig, "spikeMin" | "spikeRevert">): Map<string, string> {
  const out = new Map<string, string>();
  for (const [fsv, m] of Object.entries(daily)) {
    const ds = [...m.keys()].sort();
    for (let i = 1; i < ds.length; i++) {
      const a = m.get(ds[i - 1])!;
      const b = m.get(ds[i])!;
      if (Math.sign(a) === Math.sign(b) || Math.abs(a) < cfg.spikeMin || Math.abs(b) < cfg.spikeMin) continue;
      const both = (1 + a) * (1 + b) - 1;
      if (Math.abs(both) > cfg.spikeRevert * Math.min(Math.abs(a), Math.abs(b))) continue;
      const why = `bad valuation print: ${fsv} ${ds[i - 1]} ${pct(a)} then ${ds[i]} ${pct(b)} (reversed, combined ${pct(both)})`;
      for (const d of [ds[i - 1], ds[i]]) if (!out.has(toMonthEnd(d))) out.set(toMonthEnd(d), why);
    }
  }
  return out;
}

/**
 * Distribution / price-adjustment days of a class: valuation days whose stored (or distribution-aware) daily return differs
 * from its NAV-per-unit ratio − 1 by more than `min` (the previous row at most 5 calendar days earlier). Days after `inception`.
 */
export function adjustmentDays(rows: DailyRow[], inception: string, min: number, end?: string): Map<string, string> {
  const out = new Map<string, string>();
  const rs = normalizeRows(rows).filter((r) => r.date >= inception && (!end || r.date <= end) && finite(r.nav_per_share_cad) && (r.nav_per_share_cad as number) > 0);
  for (let i = 1; i < rs.length; i++) {
    const p = rs[i - 1], r = rs[i];
    if (p.date === r.date || dayDiff(p.date, r.date) > 5 || !validReturn(r.net_daily_return)) continue;
    const ratio = (r.nav_per_share_cad as number) / (p.nav_per_share_cad as number) - 1;
    if (Math.abs((r.net_daily_return as number) - ratio) > min) out.set(r.date, `return ${pct(r.net_daily_return as number)} vs NAV ratio ${pct(ratio)}`);
  }
  return out;
}

export interface ClassFit { a: number; b: number; n: number; fallback: boolean }

type FitCfg = Pick<ClassCheckConfig, "fitMinMonths" | "fitSlopeMin" | "fitSlopeMax" | "fitInterceptMax">;

/**
 * a, b of r ≈ a + b·m by Theil–Sen (median of the pairwise slopes, intercept = median of r − b·m): robust to the outlier
 * months it is meant to find. b clipped to [fitSlopeMin, fitSlopeMax], a to ±fitInterceptMax; fewer than fitMinMonths
 * points → a = 0, b = 1 (`fallback`).
 */
export function fitClass(pts: { m: number; r: number }[], cfg: FitCfg): ClassFit {
  if (pts.length < cfg.fitMinMonths) return { a: 0, b: 1, n: pts.length, fallback: true };
  const slopes: number[] = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const dm = pts[j].m - pts[i].m;
    if (Math.abs(dm) > 1e-9) slopes.push((pts[j].r - pts[i].r) / dm);
  }
  const clip = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));
  const b = clip(slopes.length ? median(slopes) : 1, cfg.fitSlopeMin, cfg.fitSlopeMax);
  const a = clip(median(pts.map((p) => p.r - b * p.m)), -cfg.fitInterceptMax, cfg.fitInterceptMax);
  return { a, b, n: pts.length, fallback: false };
}

/**
 * (b) cross-class consistency of each month (see the module comment), on the PUBLISHED monthly values. Each class-month
 * is tested against a fit made WITHOUT that month (leave-one-out: an error in the fund's strongest month cannot bend its
 * own expectation). `adjustments`: month → a distribution / price-adjustment day of any class of the fund. Returns the
 * months withheld for every class (`fundMonths`), the class-months withheld alone (`fails`), the class-months with nobody
 * to compare (`unchecked`) and each class's full-sample fit (for the provenance).
 */
export function crossClassFailures(
  months: Record<string, { month: string; r: number | null; days: string[]; partial?: boolean }[]>, daily: Record<string, Map<string, number>>,
  cfg: Pick<ClassCheckConfig, "crossAbs" | "crossRel" | "residualMax"> & FitCfg,
  adjustments: Map<string, string> = new Map(),
): { fundMonths: Map<string, string>; fails: Map<string, Map<string, string>>; unchecked: { fundserv: string; month: string }[]; fits: Record<string, ClassFit> } {
  const fundMonths = new Map<string, string>();
  const fails = new Map<string, Map<string, string>>();
  const unchecked: { fundserv: string; month: string }[] = [];
  const fail = (fsv: string, month: string, why: string): void => {
    const f = fails.get(fsv) ?? new Map<string, string>();
    f.set(month, why);
    fails.set(fsv, f);
  };
  const over = (fsv: string, days: string[]): number | null => {
    const m = daily[fsv];
    if (!m || !days.every((d) => m.has(d))) return null;
    return prod(days.map((d) => m.get(d)!)) - 1;
  };
  const byMonth = new Map<string, { fsv: string; r: number; days: string[]; partial: boolean }[]>();
  for (const [fsv, ms] of Object.entries(months)) {
    for (const cm of ms) {
      if (cm.r === null) continue;
      const list = byMonth.get(cm.month) ?? [];
      list.push({ fsv, r: cm.r, days: cm.days, partial: !!cm.partial });
      byMonth.set(cm.month, list);
    }
  }
  // complete months: published values
  const full = new Map<string, { fsv: string; v: number }[]>();
  for (const [month, list] of byMonth) full.set(month, list.filter((x) => !x.partial).map((x) => ({ fsv: x.fsv, v: x.r })));
  const val = (fsv: string, month: string): number | null => full.get(month)?.find((x) => x.fsv === fsv)?.v ?? null;
  // a class can be fitted when it has fitMinMonths complete months next to at least 2 other complete classes; only fitted
  // classes enter another class's reference (a young class never moves it)
  const fsvs = Object.keys(months);
  const fittable = new Set(fsvs.filter((c) => [...full.values()].filter((xs) => xs.length >= 3 && xs.some((x) => x.fsv === c)).length >= cfg.fitMinMonths));
  let fits: Record<string, ClassFit> = Object.fromEntries(fsvs.map((c) => [c, { a: 0, b: 1, n: 0, fallback: !fittable.has(c) }]));
  // leave-CLASS-out reference of class c in a month: median over the OTHER fitted complete classes d of (r_d − a_d) / b_d —
  // each mapped back to the fund's common return through its own fit — so an error in c never moves its own reference
  const refOf = (c: string, month: string, fs: Record<string, ClassFit>): { m: number; n: number } | null => {
    const xs = (full.get(month) ?? []).filter((x) => x.fsv !== c && fittable.has(x.fsv)).map((x) => (x.v - fs[x.fsv].a) / fs[x.fsv].b);
    return xs.length ? { m: median(xs), n: xs.length } : null;
  };
  const pointsOf = (c: string, fs: Record<string, ClassFit>): { month: string; m: number; r: number }[] => {
    const out: { month: string; m: number; r: number }[] = [];
    for (const month of full.keys()) {
      const v = val(c, month);
      const ref = v === null ? null : refOf(c, month, fs);
      if (v !== null && ref && ref.n >= 2) out.push({ month, m: ref.m, r: v });
    }
    return out;
  };
  // the fits and the references depend on each other: a few rounds from a = 0, b = 1
  let points: Record<string, { month: string; m: number; r: number }[]> = {};
  for (let round = 0; round < 4; round++) {
    points = Object.fromEntries(fsvs.map((c) => [c, fittable.has(c) ? pointsOf(c, fits) : []]));
    fits = Object.fromEntries(fsvs.map((c) => [c, fittable.has(c) ? fitClass(points[c], cfg) : { a: 0, b: 1, n: 0, fallback: true }]));
  }
  const looFit = (c: string, month: string): ClassFit => {
    if (!fittable.has(c)) return { a: 0, b: 1, n: 0, fallback: true };
    const ps = points[c];
    return ps.some((p) => p.month === month) ? fitClass(ps.filter((p) => p.month !== month), cfg) : fits[c];
  };
  for (const month of [...byMonth.keys()].sort()) {
    const list = byMonth.get(month)!;
    const xs = full.get(month)!;
    const adj = adjustments.get(month);
    let all: string | null = null;
    const alone: { fsv: string; why: string }[] = [];
    if (xs.length >= 2) {
      const res = xs.map((x) => {
        const f = looFit(x.fsv, month);
        // no fitted class to compare with (e.g. a fund with two classes): the other classes' plain median, no fit — such a
        // class is only ever withheld itself, so a disagreement withholds both sides
        const ref = refOf(x.fsv, month, fits) ?? { m: median(xs.filter((y) => y.fsv !== x.fsv).map((y) => y.v)), n: 0 };
        const fb = f.fallback || ref.n === 0;
        return { ...x, f: fb ? { ...f, fallback: true } : f, m: ref.m, e: x.v - (fb && ref.n === 0 ? ref.m : f.a + f.b * ref.m) };
      });
      const out = res.filter((x) => Math.abs(x.e) > cfg.residualMax + 1e-12);
      const desc = (ys: typeof out): string => `${ys.map((x) => `${x.fsv} ${pct(x.v)} (expected ${pct(x.v - x.e)} from the other classes' reference ${pct(x.m)}${x.f.fallback ? ", no fitted spread" : ""})`).join(", ")}; ${xs.length} classes with a complete month, residual tolerance ${pct(cfg.residualMax)}`;
      // a class without a fit, in a fund whose other classes are fitted, cannot be checked at slope 1 (a fee-free class's
      // legitimate spread could hide an error): its months are withheld until it has a fit of its own
      if (fittable.size >= 2) {
        for (const x of res) {
          if (fittable.has(x.fsv) || out.includes(x)) continue;
          alone.push({ fsv: x.fsv, why: `no fitted spread to the fund's other classes yet (fewer than ${cfg.fitMinMonths} complete months next to two other classes): month not checkable` });
        }
      }
      // a class without a fit is withheld alone, never the fund
      const short = out.filter((x) => x.f.fallback);
      const fitted = out.filter((x) => !x.f.fallback);
      for (const x of short) alone.push({ fsv: x.fsv, why: `deviates from the fund's other classes (no fitted spread): ${desc([x])}` });
      if (fitted.length) {
        const others = res.filter((x) => !out.includes(x));
        if (adj) all = `classes disagree in a month with a distribution / price-adjustment day (${adj}): ${desc(fitted)}; which class is right cannot be told`;
        else if (fitted.length === 1 && others.length >= 2) alone.push({ fsv: fitted[0].fsv, why: `deviates from the fund's other classes, which agree with each other: ${desc(fitted)}` });
        else all = `classes disagree with no consistent majority: ${desc(fitted)}; which class is right cannot be told`;
      }
    } else if (xs.length === 1) unchecked.push({ fundserv: xs[0].fsv, month });
    for (const x of list.filter((y) => y.partial)) {
      const vals = [{ fsv: x.fsv, v: x.r }];
      for (const p of Object.keys(daily)) {
        if (p === x.fsv) continue;
        const v = over(p, x.days);
        if (v !== null) vals.push({ fsv: p, v });
      }
      if (vals.length < 2) { unchecked.push({ fundserv: x.fsv, month }); continue; }
      const md = median(vals.map((y) => y.v));
      const thr = Math.max(cfg.crossAbs, cfg.crossRel * Math.abs(md));
      if (Math.abs(x.r - md) <= thr + 1e-12) continue;
      const why = `first (partial) month deviates from the fund's other classes over the same days: ${pct(x.r)} vs median ${pct(md)} of ${vals.length} classes (tolerance ${pct(thr)})`;
      // in a month with a distribution / adjustment day, which side is right cannot be told: every class
      if (adj && !all) all = `${x.fsv} ${why}, in a month with a distribution / price-adjustment day (${adj}): which class is right cannot be told`;
      else alone.push({ fsv: x.fsv, why });
    }
    if (all) fundMonths.set(month, all);
    else for (const x of alone) fail(x.fsv, month, x.why);
  }
  return { fundMonths, fails, unchecked, fits };
}

/**
 * Every class of one fund: inception, months from inception to `endMonth`, and the fund-level checks. Months withheld by
 * a check keep their place with `r: null` and the reason.
 */
export function computeFundClasses(inputs: ClassInput[], opts: { endMonth: string; cfg: ClassCheckConfig; cutover?: string; floor?: string | null; requestedFrom?: string | null }): FundClassesResult {
  const { cfg, endMonth } = opts;
  const classes: ClassResult[] = [];
  const raw: Record<string, (ChainMonth & { partial: boolean; days: string[] })[]> = {};
  const daily: Record<string, Map<string, number>> = {};
  const adjustments = new Map<string, string>();
  const spikeDaily: Record<string, Map<string, number>> = {};
  const newestUnchecked = new Set<string>();
  for (const k of inputs) {
    const base: ClassResult = { fundserv: k.fundserv, display: k.display, currency: k.currency, inception: null, status: "unavailable", why: null, previousRunEnd: null, months: [] };
    if (!k.rows) { classes.push({ ...base, why: `daily history unavailable (${k.error ?? "not fetched"})` }); continue; }
    const rows = normalizeRows(k.rows);
    const run = currentRun(rows, { gapDays: cfg.relaunchGapDays, floor: opts.floor, requestedFrom: opts.requestedFrom, navJump: cfg.relaunchNavJump, longGapDays: cfg.relaunchLongGapDays, resetMinGapDays: cfg.relaunchResetMinGapDays });
    const currency = k.currency ?? rows.find((r) => r.date >= (run.inception ?? ""))?.currency ?? null;
    const res: ClassResult = { ...base, currency, inception: run.inception, previousRunEnd: run.previousRunEnd, why: run.why, gaps: run.gaps };
    if (!run.inception) { classes.push(res); continue; }
    if (currency && currency !== "CAD") {
      classes.push({ ...res, status: "currency", why: `${currency} series: no distribution-aware total returns in the source` });
      continue;
    }
    raw[k.fundserv] = monthsFromInception(rows, run.inception, endMonth, opts.cutover);
    daily[k.fundserv] = dailyReturns(rows, run.inception, endMonth);
    // the bad-print check reads every row fetched (to today): a print on the newest month's last day reversed on the next
    // valuation day must be seen; the newest month waits for that next day
    spikeDaily[k.fundserv] = dailyReturns(rows, run.inception);
    const lastDay = tradingDays(`${ym(endMonth)}-01`, endMonth).at(-1);
    if (lastDay && !spikeDaily[k.fundserv].size) newestUnchecked.add(k.fundserv);
    else if (lastDay && ![...spikeDaily[k.fundserv].keys()].some((d) => d > lastDay)) newestUnchecked.add(k.fundserv);
    for (const [d, why] of adjustmentDays(rows, run.inception, cfg.adjustmentMin, endMonth)) {
      const m = toMonthEnd(d);
      if (!adjustments.has(m)) adjustments.set(m, `${k.fundserv} ${d} ${why}`);
    }
    classes.push({ ...res, status: "ok" });
  }
  const spikes = new Map([...spikeMonths(spikeDaily, cfg)].filter(([m]) => m <= endMonth));
  // the cross-class comparison runs on months that passed the per-class checks and the bad-print check only
  const candidates: Record<string, { month: string; r: number | null; days: string[]; partial: boolean }[]> = {};
  for (const [fsv, ms] of Object.entries(raw)) candidates[fsv] = ms.map((m) => ({ month: m.month, r: m.status === "ready" && !spikes.has(m.month) ? m.r : null, days: m.days, partial: m.partial }));
  const cross = crossClassFailures(candidates, daily, cfg, adjustments);
  const fundWhy = new Map<string, string>([...cross.fundMonths, ...spikes]);
  const fundMonths = [...fundWhy.keys()].sort().map((month) => ({ month, reason: fundWhy.get(month)! }));
  for (const c of classes) {
    const ms = raw[c.fundserv];
    if (!ms) continue;
    c.months = ms.map((m) => {
      const reason = m.status !== "ready" || m.r === null ? m.issue ?? m.status
        : fundWhy.get(m.month) ?? cross.fails.get(c.fundserv)?.get(m.month)
          ?? (m.month === endMonth && newestUnchecked.has(c.fundserv) ? "newest month held: no valuation day after its last day yet to rule out a reversed month-end print" : null);
      return { month: m.month, r: reason ? null : m.r, partial: m.partial, source: m.source, reason };
    });
  }
  const classChecks: Record<string, { month: string; reason: string }[]> = {};
  for (const fsv of Object.keys(raw)) {
    const list = [...(cross.fails.get(fsv) ?? [])].filter(([m]) => !fundWhy.has(m)).map(([month, reason]) => ({ month, reason }));
    if (newestUnchecked.has(fsv) && !fundWhy.has(endMonth)) list.push({ month: endMonth, reason: "newest month held: no valuation day after its last day yet to rule out a reversed month-end print" });
    if (list.length) classChecks[fsv] = list;
  }
  return { classes, fundMonths, unchecked: cross.unchecked, classChecks };
}

/** Whether `asOf` (a month-end) is at least `months` months after `inception` (same day, clamped to the month's end). */
export function hasMinHistory(inception: string, asOf: string, months: number): boolean {
  const y = +inception.slice(0, 4), m = +inception.slice(5, 7), d = +inception.slice(8, 10);
  const t = (y * 12 + (m - 1)) + months;
  const ty = Math.floor(t / 12), tm = (t % 12) + 1;
  const last = new Date(Date.UTC(ty, tm, 0)).getUTCDate();
  const due = `${ty}-${String(tm).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
  return asOf.slice(0, 10) >= due;
}

/** the first day (YYYY-MM-DD) from which `inception` has `months` months of history */
export function minHistoryDate(inception: string, months: number): string {
  const y = +inception.slice(0, 4), m = +inception.slice(5, 7), d = +inception.slice(8, 10);
  const t = (y * 12 + (m - 1)) + months;
  const ty = Math.floor(t / 12), tm = (t % 12) + 1;
  const last = new Date(Date.UTC(ty, tm, 0)).getUTCDate();
  return `${ty}-${String(tm).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}

