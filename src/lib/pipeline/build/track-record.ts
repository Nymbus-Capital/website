// track-record.ts — the headline (track-record) class gathered month by month from every source
import type { FundSpec } from "../../../config/funds.ts";
import type { Issue } from "../../data/types.ts";
import { ym } from "../../data/dates.ts";
import { classLabel, FUND_SOURCES, trackFundserv } from "../fund-sources.ts";
import { CHAIN, TOL } from "../config.ts";
import { toMonthEnd, type Series } from "../metrics.ts";
import type { DpShort, RawPayloads } from "../raw.ts";
import { Ctx } from "./context.ts";
import { monthRanges, pct4 } from "./helpers.ts";
import { factsheetMonthValue } from "./factsheets.ts";
import { effectiveNavStart } from "./register.ts";
import { chainNote, classChain, finishSeries, type FundSeries, type MnrResult, type Origin } from "./series.ts";

/** Whether the daily NAV chain of a fund was verified on its track-record class (shared with its other classes). */
export interface ChainVerification {
  /** the stored CIBC daily returns reproduce the independent monthly history: CIBC months may be compounded */
  cibc: boolean;
  /** the cut-over month's NAV bridge is consistent: the bridge may be used for the other classes */
  bridge: boolean;
}

/** the track-record class's series, before the other classes are built from it */
interface Candidate {
  fs: FundSeries | null;
  /** monthly returns of the class from the data sources only (no factsheet month): the fee-band gate's input */
  sourceMonths: Series;
  issues: Issue[];
  verify: ChainVerification;
  /** the analytics history of the class (independent of the dataplatform) */
  analyticsMonths: Series;
  /** reasons for an alert raised while gathering the months */
  alerts: string[];
}

const readyRows = (res: MnrResult): { month: string; r: number; source?: string | null }[] =>
  res?.ok && res.data
    ? res.data.rows
        .filter((r) => r.status === "ready" && typeof r.net_return === "number" && Number.isFinite(r.net_return))
        .map((r) => ({ month: toMonthEnd(String(r.month)), r: r.net_return as number, source: r.source }))
    : [];

/** the dataplatform's aggregate row of a class code built from more than one Apex class during `month` (latest NAV window), or null */
function multiClassAggregate(
  raw: RawPayloads,
  short: DpShort,
  code: string,
  month: string,
): { count: number; date: string } | null {
  const res = raw.nav[short];
  if (!res?.ok || !res.data) return null;
  const hit = (res.data.aggregates ?? []).find(
    (r) =>
      r.class_code === code &&
      ym(r.date) === ym(month) &&
      typeof r.return_source_count === "number" &&
      r.return_source_count > 1,
  );
  return hit ? { count: hit.return_source_count as number, date: hit.date } : null;
}

/** class identity of a monthly-net-returns answer (class_code always; class_display / fundserv when a later dataplatform adds them): why it is not `code`, or null */
function payloadIdentityProblem(spec: FundSpec, res: MnrResult, code: string): string | null {
  const d = res?.ok ? res.data : null;
  if (!d) return null;
  if (d.class_code !== code) return `class_code ${d.class_code ?? "missing"} instead of ${code}`;
  const want = {
    display: classLabel(spec.key, code),
    fundserv: (FUND_SOURCES[spec.key].classFundserv as Record<string, string | undefined>)[code] ?? null,
  };
  if (d.class_display != null && d.class_display !== want.display)
    return `class_display ${d.class_display} instead of ${want.display}`;
  if (d.fundserv != null && d.fundserv !== want.fundserv) return `fundserv ${d.fundserv} instead of ${want.fundserv}`;
  return null;
}

/**
 * The track-record (headline) class, month by month:
 *  - Apex months: dataplatform monthly-net-returns "ready" months, which the website's own compounding of the class's
 *    daily NAV chain must reproduce (two views of the same rows; a disagreement withholds the month). When the endpoint
 *    is down, the chain alone (same rule) is used.
 *  - The cut-over month (2026-07, which monthly-net-returns leaves unavailable by design): the NAV bridge, cross-checked
 *    with the analytics history when it has the month.
 *  - CIBC months: the class's stored CIBC daily returns compounded, used only when they reproduce the analytics history
 *    on every common month (then every CIBC month of the class comes from the dataplatform); else the analytics history.
 *  - Months before the class's own NAV history (the strategy's track record since 2019, stored by the dataplatform as
 *    monthly figures that no endpoint serves): the analytics history. Gaps: the same-class factsheet monthly table.
 */
function trackRecordCandidate(
  raw: RawPayloads,
  spec: FundSpec,
  base: string,
  defects?: Map<string, string>,
): Candidate {
  const c = new Ctx();
  const key = `${base}.performance`;
  const src = FUND_SOURCES[spec.key];
  const short = src.dataplatform as DpShort;
  const code = src.trackRecordClass ?? "unknown";
  const s: Series = {};
  const origin: Record<string, Origin> = {};
  const klass: Record<string, string> = {};
  const verify: ChainVerification = { cibc: false, bridge: false };
  const withheld = new Set<string>();
  const alerts: string[] = [];
  const startNote = effectiveNavStart(raw, spec).note;
  if (startNote) c.warn(key, startNote);
  const target = raw.targetMonth;
  const an = raw.analytics;
  const name = src.analytics;
  const set = (m: string, r: number, o: Origin): void => {
    s[m] = r;
    origin[m] = o;
    klass[m] = code;
  };
  if (name) {
    if (an.ok && an.data) {
      const arr = an.data.returns[name];
      if (arr) {
        an.data.dates.forEach((d, i) => {
          const v = arr[i];
          if (v === null || !Number.isFinite(v)) return;
          const m = toMonthEnd(d);
          if (m > target) return;
          set(m, v, "analytics");
        });
      } else c.warn(key, `analytics: series "${name}" not found in fund_returns.json`);
    } else c.warn(key, `analytics history unavailable (${an.error ?? "not fetched"})`);
  }
  const analyticsMonths: Series = { ...s };
  const dp = raw.monthlyReturns[short];
  const idp = payloadIdentityProblem(spec, dp, code);
  if (idp) {
    c.error(key, `dataplatform monthly net returns ${short} ${code}: ${idp}: performance withheld`);
    return { fs: null, sourceMonths: {}, issues: c.issues, verify, analyticsMonths, alerts };
  }
  const mnrReady = new Map(
    readyRows(dp)
      .filter((r) => r.month <= target)
      .map((r) => [r.month, r.r]),
  );
  if (dp?.ok && dp.data) {
    for (const [m, r] of mnrReady) {
      if (m in s && Math.abs(s[m] - r) > TOL.analyticsVsDataplatform)
        c.warn(key, `${ym(m)}: analytics ${pct4(s[m])} vs dataplatform ${pct4(r)} (dataplatform used)`);
      set(m, r, "dataplatform");
    }
  } else c.warn(key, `dataplatform monthly net returns unavailable (${dp?.error ?? "not fetched"})`);

  // the track class's own daily NAV chain (nav-timeseries)
  const fsv = trackFundserv(spec.key);
  let chainSource: string | null = null;
  if (fsv && src.navStart) {
    const ch = classChain(raw, spec, fsv);
    const lbl = `class ${classLabel(spec.key, code) ?? "?"} (${fsv})`;
    if (ch.error)
      c.warn(
        key,
        `daily NAV chain of ${lbl} unavailable (${ch.error}): months before the Apex ones from the analytics history`,
      );
    else {
      const ready = ch.months.filter((m) => m.status === "ready" && m.r !== null && m.month <= target);
      const mnrRows = dp?.ok && dp.data ? new Map(dp.data.rows.map((r) => [toMonthEnd(String(r.month)), r])) : null;
      const used: string[] = [];
      // Apex months: the same rule as monthly-net-returns, so both must agree
      for (const m of ready.filter((x) => x.source === "apex")) {
        const v = mnrReady.get(m.month);
        if (v !== undefined) {
          if (Math.abs(v - (m.r as number)) > TOL.chainVsDataplatform) {
            c.error(
              key,
              `${ym(m.month)}: daily NAV chain ${pct4(m.r as number)} vs monthly-net-returns ${pct4(v)}: two dataplatform views of the same days disagree; month withheld`,
            );
            delete s[m.month];
            withheld.add(m.month);
          }
          continue;
        }
        if (!mnrRows) {
          set(m.month, m.r as number, "navchain");
          used.push(m.month);
          continue;
        }
        const row = mnrRows.get(m.month);
        c.warn(
          key,
          `${ym(m.month)}: daily NAV chain complete, monthly-net-returns says ${row ? `${row.status}${row.issue ? ` (${row.issue})` : ""}` : "nothing"}: month not used`,
        );
        // the dataplatform aggregates its STRATEGY / STRATEGY_H row from every Apex class carrying the class's NAV token:
        // with two such classes (return_source_count > 1) monthly-net-returns can never compound the month
        const multi = multiClassAggregate(raw, short, code, m.month);
        if (multi) {
          const why = `${ym(m.month)}: monthly-net-returns ${code} is unavailable because the dataplatform aggregates ${multi.count} Apex classes into its ${code} row (return_source_count ${multi.count} on ${multi.date}); it cannot compound a single-class return until the class mapping is fixed: the track record stops before this month`;
          c.error(key, why);
          alerts.push(why);
        }
      }
      if (!mnrRows && used.length)
        c.warn(
          key,
          `monthly-net-returns unavailable: Apex month(s) ${monthRanges(used)} compounded from the daily NAV chain (same rule)`,
        );
      // CIBC months: all or nothing, verified on every month the analytics history also has
      const cibc = ready.filter((x) => x.source === "cibc");
      const common = cibc.filter((m) => m.month in analyticsMonths);
      const off = common.filter((m) => Math.abs((m.r as number) - analyticsMonths[m.month]) > TOL.chainVsAnalytics);
      if (cibc.length) {
        if (off.length) {
          const worst = off.reduce((a, m) =>
            Math.abs((m.r as number) - analyticsMonths[m.month]) > Math.abs((a.r as number) - analyticsMonths[a.month])
              ? m
              : a,
          );
          c.warn(
            key,
            `stored CIBC daily returns of ${lbl} do not reproduce the analytics history on ${off.length} of ${common.length} month(s) (beyond ${(TOL.chainVsAnalytics * 10_000).toFixed(1)} bp; largest ${ym(worst.month)}: chain ${pct4(worst.r as number)} vs analytics ${pct4(analyticsMonths[worst.month])}): the fund's CIBC months are not taken from the dataplatform (analytics kept; no other class can use them)`,
          );
        } else if (common.length < CHAIN.minVerifiedMonths) {
          c.info(
            key,
            `stored CIBC daily returns of ${lbl}: only ${common.length} month(s) in common with the analytics history (${CHAIN.minVerifiedMonths} needed to verify them): CIBC months not taken from the dataplatform`,
          );
        } else {
          verify.cibc = true;
          const maxDiff = Math.max(...common.map((m) => Math.abs((m.r as number) - analyticsMonths[m.month])));
          for (const m of cibc) {
            set(m.month, m.r as number, "navchain");
            used.push(m.month);
          }
          c.info(
            key,
            `stored CIBC daily returns of ${lbl} reproduce the analytics history on ${common.length} month(s) (largest difference ${(maxDiff * 10_000).toFixed(3)} bp): ${monthRanges(cibc.map((m) => m.month))} taken from the dataplatform daily NAV chain`,
          );
        }
      }
      // the cut-over month
      const br = ch.months.find((x) => x.source === "bridge" && x.month <= target);
      if (br && br.status !== "ready")
        c.info(key, `cut-over month ${ym(br.month)}: NAV bridge of ${lbl} unavailable (${br.issue})`);
      else if (br && br.r !== null) {
        const a = analyticsMonths[br.month];
        // without an analytics month, the bridge needs an independent confirmation: a same-class factsheet monthly table
        // printing the cut-over month within its precision
        const fsv2 = a === undefined && !mnrReady.has(br.month) ? factsheetMonthValue(raw, spec, code, br.month) : null;
        if (a !== undefined && Math.abs(br.r - a) > TOL.chainVsAnalytics) {
          c.warn(
            key,
            `cut-over month ${ym(br.month)}: NAV bridge ${pct4(br.r)} vs analytics ${pct4(a)}: bridge not used (analytics kept)`,
          );
        } else if (a === undefined && !mnrReady.has(br.month) && !fsv2) {
          c.warn(
            key,
            `cut-over month ${ym(br.month)}: NAV bridge ${pct4(br.r)} has no independent confirmation (no analytics month, no same-class factsheet printing ${ym(br.month)}): bridge not used`,
          );
        } else if (fsv2 && Math.abs(br.r - fsv2.value) > fsv2.tol) {
          c.warn(
            key,
            `cut-over month ${ym(br.month)}: NAV bridge ${pct4(br.r)} vs factsheet ${fsv2.name} ${pct4(fsv2.value)} (beyond print precision): month withheld (neither is used)`,
          );
          withheld.add(br.month);
        } else if (mnrReady.has(br.month)) {
          const v = mnrReady.get(br.month)!;
          if (Math.abs(br.r - v) > TOL.chainVsAnalytics)
            c.warn(
              key,
              `cut-over month ${ym(br.month)}: NAV bridge ${pct4(br.r)} vs monthly-net-returns ${pct4(v)} (monthly-net-returns used)`,
            );
        } else {
          verify.bridge = true;
          set(br.month, br.r, "navchain");
          used.push(br.month);
        }
      }
      if (used.length) chainSource = `${fsv} (${chainNote(used, ch.months)})`;
    }
  }
  // defect months of the class checks: replaced by the official analytics figure, else withheld (never from the factsheet);
  // see docs/architecture.md § Returns per class and GMV variants (track record defects)
  if (defects?.size) {
    const kept: string[] = [];
    for (const [m, why] of [...defects].sort(([a], [b]) => (a < b ? -1 : 1))) {
      if (!(m in s)) continue;
      if (origin[m] === "navchain" || origin[m] === "dataplatform") {
        const from =
          origin[m] === "navchain"
            ? "its own daily NAV chain"
            : "monthly-net-returns (the same Apex NAVs as the class chain)";
        if (m in analyticsMonths) {
          set(m, analyticsMonths[m], "analytics");
          kept.push(`${ym(m)} (official figure of the analytics history, instead of ${from})`);
        } else {
          c.warn(
            key,
            `${ym(m)}: withheld from the track record (taken from ${from}, which failed the class checks: ${why})`,
          );
          delete s[m];
          withheld.add(m);
        }
      } else kept.push(`${ym(m)} (${origin[m]}: official figure)`);
    }
    if (kept.length)
      c.warn(
        key,
        `month(s) failing the class checks kept in the track record with an official figure (not an independent check of the class NAV data): ${kept.join(", ")}`,
      );
  }
  const sourceMonths: Series = Object.fromEntries(
    Object.entries(s).filter(([m]) => klass[m] === code && origin[m] !== "factsheet"),
  );
  const fs = finishSeries(raw, spec, c, base, {
    s,
    origin,
    klass,
    classCode: code,
    dp,
    fill: true,
    chainSource,
    analyticsName: name,
    mandatoryTable: true,
    withheld,
  });
  return { fs, sourceMonths, issues: c.issues, verify, analyticsMonths, alerts };
}

/**
 * Official monthly net series of the fund (port of nymbus-decks engine.fund_series): the track-record class, every month
 * of ONE class (a series mixing classes is never built: finishSeries). The fund's other classes are built from their own
 * daily NAV chains next to it (buildClasses).
 */
export function fundSeries(
  raw: RawPayloads,
  spec: FundSpec,
  c: Ctx,
  base: string,
  defects?: Map<string, string>,
): { fs: FundSeries | null; cand: Candidate } {
  const cand = trackRecordCandidate(raw, spec, base, defects);
  c.issues.push(...cand.issues);
  return { fs: cand.fs, cand };
}
