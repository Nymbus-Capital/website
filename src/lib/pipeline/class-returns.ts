/**
 * Monthly net returns of EVERY share class of a fund, each from its own daily `/api/performance/nav-timeseries` rows,
 * from its inception (Gabriel 2026-10-04: "make sure that all classes' returns are populated with data coming from
 * dataplatform … You can find the inception date of each class also by looking at the first date when there are prices
 * for that class"). Pure, dependency-free (Node type stripping).
 *
 *  - Inception: the first NAV-per-unit date of the class's CURRENT continuous run. A gap of more than
 *    `relaunchGapDays` calendar days without a NAV per unit ends a run: earlier rows are a previous life of the code (a
 *    closed and relaunched class, a reused fund code). The fund's `floor` (first day of its own book) cuts a run reaching
 *    back before it. The first row after a gap may carry a return relative to the old life: the inception day's own
 *    return is never used — the first (partial) month runs from the inception NAV per unit.
 *  - Months: CIBC months compound the stored daily net returns (`legacy_stored`), Apex months the distribution-aware
 *    returns (`apex_distribution_aware`, continuous `return_start_date` chain), the cut-over month uses the NAV bridge
 *    (daily-chain.ts) — every valuation day of the month (after the inception day) present once, CAD, else the month is
 *    unavailable. A non-CAD class has no distribution-aware returns: no month at all.
 *  - Known source defects withhold months (never repaired, never filled from another class):
 *    a. bad valuation print: two consecutive daily returns of opposite sign, both ≥ `spikeMin`, combined ≤ `spikeRevert` ×
 *       the smaller → both months, every class of the fund;
 *    b. daily dispersion: on one valuation day the classes' returns spread by more than max(`dailyAbs`, `dailyRel` ×
 *       |median|) (an inconsistent distribution adjustment; the majority may be the wrong side) → that month, every class;
 *    c. cross-class consistency of a month (over the same days): a class farther than max(`crossAbs`, `crossRel` ×
 *       |median|) from the median of the classes compared is withheld; when the deviating classes are not a strict
 *       minority (e.g. two classes that disagree) every class compared is withheld;
 *    d. missing / duplicate days, invalid returns, another return method (above).
 */
import { apexMonth, bridgeMonth, cibcMonth, CUTOVER, type ChainMonth, type ChainSource, type DailyRow } from "./daily-chain.ts";
import { tradingDays } from "./market-calendar.ts";
import { addMonths, toMonthEnd } from "./metrics.ts";

export interface ClassCheckConfig {
  relaunchGapDays: number;
  spikeMin: number;
  spikeRevert: number;
  crossAbs: number;
  crossRel: number;
  dailyAbs: number;
  dailyRel: number;
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
  /** last day of an earlier run of the code (the class was relaunched), for the admin */
  previousRunEnd: string | null;
  months: ClassMonthResult[];
}

export interface FundClassesResult {
  classes: ClassResult[];
  /** months withheld for every class of the fund (spikes, daily dispersion), with the reason */
  fundMonths: { month: string; reason: string }[];
  /** class-months that could not be cross-checked (no other class over the same days) */
  unchecked: { fundserv: string; month: string }[];
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
 * Inception of a class: the first NAV-per-unit date of its current continuous run (rows up to `end`). `floor` cuts a run
 * reaching back before it. `requestedFrom`: the first day asked from the source — a run starting within `gapDays` of it
 * (and not cut by the floor) may have begun earlier: inception unknown.
 */
export function currentRun(rows: DailyRow[], opts: { gapDays: number; end?: string; floor?: string | null; requestedFrom?: string | null }): { inception: string | null; previousRunEnd: string | null; why: string | null } {
  const dates = [...new Set(normalizeRows(rows).filter((r) => finite(r.nav_per_share_cad) && (r.nav_per_share_cad as number) > 0 && (!opts.end || r.date <= opts.end)).map((r) => r.date))];
  if (!dates.length) return { inception: null, previousRunEnd: null, why: "no NAV per unit" };
  let i = dates.length - 1;
  while (i > 0 && dayDiff(dates[i - 1], dates[i]) <= opts.gapDays) i--;
  const previousRunEnd = i > 0 ? dates[i - 1] : null;
  let start = dates[i];
  if (opts.floor && start < opts.floor) {
    const next = dates.find((d) => d >= opts.floor!);
    if (!next) return { inception: null, previousRunEnd, why: `no NAV per unit on or after the fund's first day ${opts.floor}` };
    return { inception: next, previousRunEnd, why: null };
  }
  if (i === 0 && opts.requestedFrom && dayDiff(opts.requestedFrom, start) <= opts.gapDays) {
    return { inception: null, previousRunEnd, why: `the history read starts at ${opts.requestedFrom} and the class is priced from its first day: inception before it unknown` };
  }
  return { inception: start, previousRunEnd, why: null };
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
      else cm = bridgeMonth(own, m, cutover);
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

/** (b) daily dispersion between the classes of the fund: month → reason */
export function dispersionMonths(daily: Record<string, Map<string, number>>, cfg: Pick<ClassCheckConfig, "dailyAbs" | "dailyRel">): Map<string, string> {
  const out = new Map<string, string>();
  const dates = new Set<string>();
  for (const m of Object.values(daily)) for (const d of m.keys()) dates.add(d);
  for (const d of [...dates].sort()) {
    const vals = Object.entries(daily).filter(([, m]) => m.has(d)).map(([fsv, m]) => ({ fsv, v: m.get(d)! }));
    if (vals.length < 2) continue;
    const med = median(vals.map((x) => x.v));
    const lo = vals.reduce((a, b) => (b.v < a.v ? b : a));
    const hi = vals.reduce((a, b) => (b.v > a.v ? b : a));
    const spread = hi.v - lo.v;
    if (spread <= Math.max(cfg.dailyAbs, cfg.dailyRel * Math.abs(med)) + 1e-12) continue;
    const m = toMonthEnd(d);
    if (!out.has(m)) out.set(m, `classes disagree on ${d}: ${lo.fsv} ${pct(lo.v)} vs ${hi.fsv} ${pct(hi.v)} (spread ${pct(spread)}; inconsistent distribution adjustment?)`);
  }
  return out;
}

/**
 * (c) cross-class consistency of each computed month: fundserv → month → reason. Each class-month is compared with the
 * other classes compounded over the SAME valuation days (a partial inception month against the others' same days).
 */
export function crossClassFailures(
  months: Record<string, { month: string; r: number | null; days: string[] }[]>, daily: Record<string, Map<string, number>>, cfg: Pick<ClassCheckConfig, "crossAbs" | "crossRel">,
): { fails: Map<string, Map<string, string>>; unchecked: { fundserv: string; month: string }[] } {
  const fails = new Map<string, Map<string, string>>();
  const unchecked: { fundserv: string; month: string }[] = [];
  const over = (fsv: string, days: string[]): number | null => {
    const m = daily[fsv];
    if (!m || !days.every((d) => m.has(d))) return null;
    return prod(days.map((d) => m.get(d)!)) - 1;
  };
  for (const [fsv, ms] of Object.entries(months)) {
    for (const cm of ms) {
      if (cm.r === null) continue;
      const own = over(fsv, cm.days) ?? cm.r;
      const vals = [{ fsv, v: own }];
      for (const p of Object.keys(daily)) {
        if (p === fsv) continue;
        const v = over(p, cm.days);
        if (v !== null) vals.push({ fsv: p, v });
      }
      if (vals.length < 2) { unchecked.push({ fundserv: fsv, month: cm.month }); continue; }
      const med = median(vals.map((x) => x.v));
      const thr = Math.max(cfg.crossAbs, cfg.crossRel * Math.abs(med));
      const devs = vals.filter((x) => Math.abs(x.v - med) > thr + 1e-12);
      let why: string | null = null;
      if (devs.some((x) => x.fsv === fsv)) why = `deviates from the fund's other series: ${pct(own)} vs median ${pct(med)} of ${vals.length} series (tolerance ${pct(thr)})`;
      else if (devs.length * 2 >= vals.length) why = `the fund's series disagree with no clear majority (${vals.map((x) => `${x.fsv} ${pct(x.v)}`).join(", ")}; tolerance ${pct(thr)}): which one is right cannot be told`;
      if (why) {
        const f = fails.get(fsv) ?? new Map<string, string>();
        f.set(cm.month, why);
        fails.set(fsv, f);
      }
    }
  }
  return { fails, unchecked };
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
  for (const k of inputs) {
    const base: ClassResult = { fundserv: k.fundserv, display: k.display, currency: k.currency, inception: null, status: "unavailable", why: null, previousRunEnd: null, months: [] };
    if (!k.rows) { classes.push({ ...base, why: `daily history unavailable (${k.error ?? "not fetched"})` }); continue; }
    const rows = normalizeRows(k.rows);
    const run = currentRun(rows, { gapDays: cfg.relaunchGapDays, floor: opts.floor, requestedFrom: opts.requestedFrom });
    const currency = k.currency ?? rows.find((r) => r.date >= (run.inception ?? ""))?.currency ?? null;
    const res: ClassResult = { ...base, currency, inception: run.inception, previousRunEnd: run.previousRunEnd, why: run.why };
    if (!run.inception) { classes.push(res); continue; }
    if (currency && currency !== "CAD") {
      classes.push({ ...res, status: "currency", why: `${currency} series: no distribution-aware total returns in the source` });
      continue;
    }
    raw[k.fundserv] = monthsFromInception(rows, run.inception, endMonth, opts.cutover);
    daily[k.fundserv] = dailyReturns(rows, run.inception, endMonth);
    classes.push({ ...res, status: "ok" });
  }
  const spikes = spikeMonths(daily, cfg);
  const spread = dispersionMonths(daily, cfg);
  const fundMonths = [...new Set([...spikes.keys(), ...spread.keys()])].sort().map((month) => ({ month, reason: spikes.get(month) ?? spread.get(month)! }));
  const fundWhy = new Map(fundMonths.map((x) => [x.month, x.reason]));
  // the cross-class comparison runs on months that passed the per-class and fund-level checks only
  const candidates: Record<string, { month: string; r: number | null; days: string[] }[]> = {};
  for (const [fsv, ms] of Object.entries(raw)) candidates[fsv] = ms.map((m) => ({ month: m.month, r: m.status === "ready" && !fundWhy.has(m.month) ? m.r : null, days: m.days }));
  const cross = crossClassFailures(candidates, daily, cfg);
  for (const c of classes) {
    const ms = raw[c.fundserv];
    if (!ms) continue;
    c.months = ms.map((m) => {
      const reason = m.status !== "ready" || m.r === null ? m.issue ?? m.status
        : fundWhy.get(m.month) ?? cross.fails.get(c.fundserv)?.get(m.month) ?? null;
      return { month: m.month, r: reason ? null : m.r, partial: m.partial, source: m.source, reason };
    });
  }
  return { classes, fundMonths, unchecked: cross.unchecked };
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

