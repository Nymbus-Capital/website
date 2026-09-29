/**
 * Validation gates (pure). Principle: show nothing rather than a wrong number.
 *
 * Per fund:
 *  blocking (the whole fund keeps its previously published FundData, or is withheld if none):
 *   - performance as-of earlier than the one previously published
 *   - a monthly return (fund or index) beyond ±25 %
 *   - trailing returns in the data differ from a recomputation from the monthly series
 *   - computed trailing differs from the published factsheet of the same month by more than 0.5 %
 *   - growth series inconsistent with the monthly returns
 *   - any non-finite number anywhere in the fund data
 *  repairs (the value is dropped / kept from the previous publication, the rest is published):
 *   - NAV class moving more than 10 % in one valuation day: class dropped (previous value kept if any) — error issue
 *   - AUM negative or not a number: dropped (previous kept if any) — error issue
 *  warnings:
 *   - NAV older than 7 days, AUM older than 7 days, performance older than 2 closed months
 */
import type { FundData, FundKey, Issue, NavClass, PeriodMap, SiteData } from "../data/types.ts";
import { PERIODS } from "../data/types.ts";
import type { FundContext } from "./build.ts";
import { computeAsOf } from "./build.ts";
import { factsheetTolerance, PIPELINE_FUNDS, TOL } from "./config.ts";
import { addMonths, compound, lastClosedMonth, sum, trailing, type Method, type Series } from "./metrics.ts";

export interface FundValidation {
  fund: FundKey;
  blocking: Issue[];
  warnings: Issue[];
  /**
   * reasons a human must look at although the fund is published (performance carried over / withheld /
   * stale, carried NAV / AUM / factsheet, revised months, error-level issues): run status "blocked" + alert
   */
  alerts: string[];
}

const days = (a: string, b: Date): number => (b.getTime() - Date.parse(`${a.slice(0, 10)}T00:00:00Z`)) / 86_400_000;
const pct = (x: number): string => `${(x * 100).toFixed(2)}%`;

/** paths of non-finite numbers inside a value */
export function nonFinitePaths(v: unknown, path: string, out: string[] = []): string[] {
  if (typeof v === "number") {
    if (!Number.isFinite(v)) out.push(path);
  } else if (Array.isArray(v)) {
    v.forEach((x, i) => nonFinitePaths(x, `${path}[${i}]`, out));
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) nonFinitePaths(x, `${path}.${k}`, out);
  }
  return out;
}

function checkPerformance(f: FundData, ctx: FundContext | undefined, prev: FundData | undefined, base: string, blocking: Issue[], warnings: Issue[], now: Date): void {
  const p = f.performance;
  if (!p) return;
  const method: Method = ctx?.method ?? PIPELINE_FUNDS[f.key]?.method ?? "compounded";
  if (prev?.performance && p.asOf < prev.performance.asOf) {
    blocking.push({ key: `${base}.performance.asOf`, level: "error", message: `performance as of ${p.asOf} is earlier than the published ${prev.performance.asOf}` });
  }
  for (const [label, pts] of [["fund", p.monthly], ["index", p.indexMonthly ?? []]] as const) {
    for (const m of pts) {
      if (!Number.isFinite(m.r) || Math.abs(m.r) > TOL.maxMonthly) blocking.push({ key: `${base}.performance.${label === "fund" ? "monthly" : "indexMonthly"}.${m.month}`, level: "error", message: `${label} monthly return ${m.month} = ${Number.isFinite(m.r) ? pct(m.r) : m.r} is outside ±${TOL.maxMonthly * 100}%` });
    }
  }
  // the monthly series must end at as-of and be contiguous
  const ms = p.monthly.map((m) => m.month);
  if (ms.length && ms[ms.length - 1] !== p.asOf) blocking.push({ key: `${base}.performance.asOf`, level: "error", message: `last monthly return ${ms[ms.length - 1]} does not match as-of ${p.asOf}` });
  for (let i = 1; i < ms.length; i++) {
    if (addMonths(ms[i - 1], 1) !== ms[i]) {
      blocking.push({ key: `${base}.performance.monthly`, level: "error", message: `monthly series has a gap between ${ms[i - 1]} and ${ms[i]}` });
      break;
    }
  }
  const series: Series = {};
  for (const m of p.monthly) series[m.month] = m.r;
  // recomputed trailing = data (only when the pipeline computed them; published figures are checked below)
  if (ctx?.trailingSource === "computed" || (ctx?.trailingSource == null && p.basis === "net")) {
    const t = trailing(series, p.asOf, { method });
    for (const per of PERIODS) {
      const a = p.trailing.fund[per];
      const b = t[per];
      if (a === undefined) continue;
      if ((a === null) !== (b === null) || (a !== null && b !== null && Math.abs(a - b) > 1e-9)) {
        blocking.push({ key: `${base}.trailing.${per}`, level: "error", message: `trailing ${per} in data (${a === null ? "null" : pct(a)}) differs from recomputation (${b === null ? "null" : pct(b)})` });
      }
    }
  }
  // cross-check with the published factsheet of the same month
  const fs: PeriodMap | null = ctx?.factsheetTrailing ?? null;
  if (fs && ctx?.trailingSource === "computed") {
    for (const per of PERIODS) {
      const a = p.trailing.fund[per];
      const b = fs[per];
      if (a == null || b == null) continue;
      const tol = factsheetTolerance(per, ctx.factsheetTrailingDecimals?.[per] ?? 1);
      if (Math.abs(a - b) > tol.block) blocking.push({ key: `${base}.trailing.${per}`, level: "error", message: `trailing ${per}: computed ${pct(a)} vs factsheet ${ctx.factsheetTrailingFile ?? ""} ${pct(b)} (difference > ${(tol.block * 100).toFixed(3)}%)` });
    }
  }
  // growth consistent with the monthly returns
  if (p.growth.length) {
    const last = p.growth[p.growth.length - 1];
    const expected = 10_000 * (1 + (method === "arithmetic" ? sum(p.monthly.map((m) => m.r)) : compound(p.monthly.map((m) => m.r))));
    if (last.date !== p.asOf || Math.abs(last.fund - expected) > 0.01) blocking.push({ key: `${base}.performance.growth`, level: "error", message: `growth of 10 000 ends at ${last.date} ${last.fund.toFixed(2)}, expected ${p.asOf} ${expected.toFixed(2)}` });
  }
  const closed = lastClosedMonth(now);
  if (p.asOf < addMonths(closed, -1)) warnings.push({ key: `${base}.performance.asOf`, level: "error", message: `stale: performance as of ${p.asOf.slice(0, 7)} while ${closed.slice(0, 7)} is closed` });
}

function checkNav(f: FundData, prev: FundData | undefined, base: string, repairs: Issue[], warnings: Issue[], now: Date): void {
  if (!f.nav) return;
  const kept: NavClass[] = [];
  for (const k of f.nav.classes) {
    const bad = k.nav === null || !Number.isFinite(k.nav) || k.nav <= 0 || (k.changePct !== null && (!Number.isFinite(k.changePct) || Math.abs(k.changePct) > TOL.maxNavDayChange));
    if (bad) {
      const old = prev?.nav?.classes.find((c) => c.fundserv === k.fundserv);
      repairs.push({ key: `${base}.nav.${k.fundserv}`, level: "error", message: `NAV ${k.display} (${k.fundserv}) ${k.date}: ${k.nav} vs ${k.prevNav} (${k.changePct !== null && Number.isFinite(k.changePct) ? pct(k.changePct) : "invalid"}) exceeds ±${TOL.maxNavDayChange * 100}% in one day; ${old ? `previous value (${old.date}) kept` : "class not shown"}` });
      if (old) kept.push(old);
      continue;
    }
    kept.push(k);
    if (k.date && days(k.date, now) > TOL.navStaleDays) warnings.push({ key: `${base}.nav.${k.fundserv}`, level: "error", message: `stale: NAV ${k.display} (${k.fundserv}) dated ${k.date} is older than ${TOL.navStaleDays} days` });
  }
  f.nav.classes = kept;
  if (!kept.length) f.nav = null;
  else f.nav.asOf = kept.map((k) => k.date ?? "").sort().pop() || null;
}

function checkAum(f: FundData, prev: FundData | undefined, base: string, repairs: Issue[], warnings: Issue[], now: Date): void {
  if (!f.aum) return;
  if (typeof f.aum.cad !== "number" || !Number.isFinite(f.aum.cad) || f.aum.cad < 0) {
    repairs.push({ key: `${base}.aum`, level: "error", message: `AUM ${f.aum.cad} is not a valid amount; ${prev?.aum ? `previous (${prev.aum.asOf}) kept` : "not shown"}` });
    f.aum = prev?.aum && Number.isFinite(prev.aum.cad) && prev.aum.cad >= 0 ? prev.aum : null;
    return;
  }
  if (days(f.aum.asOf, now) > TOL.navStaleDays) warnings.push({ key: `${base}.aum`, level: "error", message: `stale: AUM snapshot ${f.aum.asOf} is older than ${TOL.navStaleDays} days` });
}

export interface ValidationOutcome {
  /** data after repairs and merge (blocked funds replaced by their previous publication) */
  data: SiteData;
  results: FundValidation[];
  funds: Partial<Record<FundKey, "updated" | "kept-previous" | "unavailable">>;
}

/**
 * Validate every fund of `data`, repair what can be repaired, and merge: a fund with a blocking issue
 * keeps its previously published FundData (or is withheld when there is none). Pure: returns a new object.
 */
export function validateSite(input: SiteData, context: Partial<Record<FundKey, FundContext>>, previous: SiteData | null, now: Date): ValidationOutcome {
  const data: SiteData = structuredClone(input); // keeps NaN / Infinity, so they can be caught below
  const prevLive = previous && previous.mode === "live" ? previous : null;
  const results: FundValidation[] = [];
  const funds: ValidationOutcome["funds"] = {};
  const extraIssues: Issue[] = [];
  const keys = new Set<FundKey>([...(Object.keys(context) as FundKey[]), ...(Object.keys(data.funds) as FundKey[])]);
  for (const key of keys) {
    const base = `funds.${key}`;
    const f = data.funds[key];
    const prev = prevLive?.funds[key];
    const ctx = context[key];
    const blocking: Issue[] = [];
    const warnings: Issue[] = [];
    if (!f) {
      funds[key] = prev ? "kept-previous" : "unavailable";
      if (prev) data.funds[key] = prev;
      results.push({ fund: key, blocking, warnings, alerts: [...(ctx?.alerts ?? []), prev ? "fund carried over" : "fund unavailable"] });
      continue;
    }
    const repairs: Issue[] = [];
    checkNav(f, prev, base, repairs, warnings, now);
    checkAum(f, prev, base, repairs, warnings, now);
    checkPerformance(f, ctx, prev, base, blocking, warnings, now);
    for (const p of nonFinitePaths(f, base)) blocking.push({ key: p, level: "error", message: `non-finite number at ${p}` });
    extraIssues.push(...repairs, ...warnings);
    if (blocking.length) {
      extraIssues.push(...blocking, { key: base, level: "error", message: `fund blocked by ${blocking.length} validation error(s): ${prev ? "previously published data kept" : "fund withheld (nothing previously published)"}` });
      if (prev) {
        data.funds[key] = prev;
        funds[key] = "kept-previous";
        for (const k of Object.keys(data.provenance)) if (k === base || k.startsWith(`${base}.`)) delete data.provenance[k];
        for (const [k, v] of Object.entries(prevLive!.provenance)) if (k === base || k.startsWith(`${base}.`)) data.provenance[k] = v.startsWith("carried over") ? v : `carried over from the publication of ${prevLive!.generatedAt} (${v})`;
      } else {
        delete data.funds[key];
        funds[key] = "unavailable";
      }
    } else {
      const parts = ctx?.parts;
      const allCarried = parts ? Object.values(parts).every((s) => s !== "fresh" && s !== "held") : false;
      funds[key] = allCarried && prev ? "kept-previous" : "updated";
    }
    const alerts = [...(ctx?.alerts ?? [])];
    if (blocking.length) alerts.push("blocked by validation");
    for (const i of [...repairs, ...warnings]) if (i.level === "error") alerts.push(i.message);
    for (const i of input.issues) if (i.level === "error" && (i.key === base || i.key.startsWith(`${base}.`))) alerts.push(i.message);
    results.push({ fund: key, blocking, warnings: [...repairs, ...warnings], alerts: [...new Set(alerts)] });
  }
  data.issues = [...data.issues, ...extraIssues];
  data.asOf = computeAsOf(data.funds);
  return { data, results, funds };
}

/** Gates of one fund, without merging (convenience for the admin / tests). */
export function validateFund(f: FundData, ctx: FundContext | undefined, previous: SiteData | null, now: Date): FundValidation {
  const site: SiteData = { schemaVersion: 1, generatedAt: now.toISOString(), mode: "live", asOf: { performance: null, nav: null, aum: null, factsheet: null }, funds: { [f.key]: f }, provenance: {}, issues: [] };
  return validateSite(site, ctx ? { [f.key]: ctx } : {}, previous, now).results.find((r) => r.fund === f.key)!;
}
