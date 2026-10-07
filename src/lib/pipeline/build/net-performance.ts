// net-performance.ts — net funds: track record → as-of gate → trailing, index, calendar, growth and risk
import type { FundSpec } from "../../../config/funds.ts";
import type {
  CalendarRow,
  FundData,
  GrowthPoint,
  MonthlyPoint,
  Performance,
  PeriodMap,
  Trailing,
} from "../../data/types.ts";
import { monthsBetween, ym } from "../../data/dates.ts";
import { classLabel, factsheetClassAt, FUND_SOURCES } from "../fund-sources.ts";
import { FTSE_COMPARABLE_FROM, TOL } from "../config.ts";
import {
  addMonths,
  calendarYears,
  clean,
  growth as growthOf,
  riskStats,
  sortedKeys,
  trailing as trailingOf,
  type Series,
} from "../metrics.ts";
import { isObj, parseStatistics, parseTrailingTable, type Obj, type TrailingTable } from "../parse.ts";
import type { RawPayloads } from "../raw.ts";
import { pct } from "../format.ts";
import type { BuildOptions, Ctx } from "./context.ts";
import { cut, fromTrailingMap, monthRanges, PERIOD_LIST, riskFrom, toPoints } from "./helpers.ts";
import { factsheetBlock, factsheetFilesFor } from "./factsheets.ts";
import { fundSeries } from "./track-record.ts";
import { buildIndex, indexNote, periodStart, type IndexBuild } from "./benchmark.ts";
import { crossCheck, crossCheckable, isShortRecord, type PerfBuild } from "./performance.ts";

/** Net fund performance: the newest month passing every gate, with its trailing, index, calendar, growth and risk. */
export function buildNetPerformance(
  raw: RawPayloads,
  spec: FundSpec,
  prev: FundData | undefined,
  c: Ctx,
  base: string,
  opts: BuildOptions,
  defects?: Map<string, string>,
): PerfBuild | null {
  const { fs: fsr, cand } = fundSeries(raw, spec, c, base, defects);
  if (!fsr) return null;
  const { firstMonth } = fsr;
  const key = `${base}.performance`;
  const n = monthsBetween(firstMonth, fsr.last);
  if (n < 12) {
    c.info(key, `track record of ${n} month(s) (< 12): performance is not shown (regulatory rule)`);
    c.prov[key] = `not shown: track record < 12 months`;
    return {
      performance: null,
      risk: null,
      risk3Y: null,
      trailingSource: null,
      fsTrailing: null,
      fsFile: null,
      withheld: "compliance",
    };
  }
  const prevAsOf = prev?.performance?.asOf ?? null;
  // a track record ending more than two closed months ago (interrupted, or a source stopped) is never published as new
  if (fsr.last < addMonths(raw.targetMonth, -2)) {
    c.error(
      key,
      `track record ends ${ym(fsr.last)}, more than two closed months before ${ym(raw.targetMonth)}: performance not updated`,
    );
    if (prev?.performance) return null; // caller carries the previous publication
    return {
      performance: null,
      risk: null,
      risk3Y: null,
      trailingSource: null,
      fsTrailing: null,
      fsFile: null,
      withheld: "error",
    };
  }
  const alerts = [...fsr.alerts, ...cand.alerts];
  // the factsheet publishes one class: its fund figures are compared only with a series of the same class
  // (by archive month: SEB archives up to 2026-07 publish class F, later ones class H)
  const classOfArchive = (month: string): string | null => factsheetClassAt(spec.key, month);
  const archMismatch = (month: string): boolean => classOfArchive(month) !== fsr.classCode;

  // as-of month: an existing factsheet must agree; a new month needs none by default (docs/architecture.md § Performance class)
  let asOf: string | null = null;
  let fsBlock: { name: string; month: string; block: Obj } | null = null;
  let fsTrailing: TrailingTable | null = null;
  const lowest = prevAsOf && prevAsOf <= fsr.last ? prevAsOf : addMonths(fsr.last, -2);
  // factsheet monthly-table mismatches: blocking for months after the previous as-of, alert for older ones
  const boundary = prevAsOf ?? addMonths(lowest, -1);
  const oldMismatches = fsr.mismatches.filter((m) => m <= boundary);
  if (oldMismatches.length) {
    alerts.push(`factsheet monthly table disagrees with already published month(s) ${monthRanges(oldMismatches)}`);
    c.error(
      key,
      `factsheet monthly table disagrees beyond print precision with month(s) ${monthRanges(oldMismatches)} (already published or older): to review`,
    );
  }
  for (let m = fsr.last; m >= lowest && m >= firstMonth; m = addMonths(m, -1)) {
    const fund = fromTrailingMap(trailingOf(cut(fsr.series, m), m));
    const blk = factsheetBlock(raw, spec, ym(m));
    const parsed = blk ? parseTrailingTable(blk.block["Trailing Returns Net"], m.slice(0, 4)) : null;
    const tt = crossCheckable(parsed) ? parsed : null;
    if (blk && !tt)
      c.warn(
        `${base}.trailing`,
        `factsheet ${blk.name}: fund trailing row missing or incomplete (1M/3M/YTD/1Y): not usable as a cross-check`,
      );
    const checks = tt && !archMismatch(blk!.month) ? crossCheck(fund, tt) : [];
    const blocking = checks.filter((x) => x.level === "block");
    const isNew = !prevAsOf || m > prevAsOf;
    const newMismatch = fsr.mismatches.filter((x) => x > boundary && x <= m);
    if (newMismatch.length) {
      c.error(
        key,
        `${ym(m)} not published: factsheet monthly table disagrees beyond print precision for ${monthRanges(newMismatch)}`,
      );
      continue;
    }
    const detail = blocking
      .map((x) => `${x.period} computed ${pct(x.computed)} vs published ${pct(x.published)}`)
      .join("; ");
    if (!isNew && blocking.length) {
      // an already published month that the factsheet now contradicts: withhold rather than keep unchecked data
      c.error(
        key,
        `${ym(m)} (already published): factsheet ${blk!.name} disagrees beyond tolerance (${detail}); performance withheld`,
      );
      return {
        performance: null,
        risk: null,
        risk3Y: null,
        trailingSource: null,
        fsTrailing: tt,
        fsFile: blk!.name,
        withheld: "error",
      };
    }
    if (isNew && blocking.length) {
      c.error(key, `${ym(m)} not published: factsheet ${blk!.name} disagrees beyond tolerance (${detail})`);
      continue;
    }
    if (isNew && opts.requireFactsheetForNewMonth && !tt) {
      c.info(key, `${ym(m)} not published yet: waiting for the factsheet of ${ym(m)} to cross-check it`);
      continue;
    }
    asOf = m;
    fsBlock = blk;
    fsTrailing = tt;
    break;
  }
  if (!asOf) {
    if (prev?.performance) return null; // caller carries the previous publication (issue already raised)
    c.error(key, `no month of the track record passed its gates; performance withheld`);
    return {
      performance: null,
      risk: null,
      risk3Y: null,
      trailingSource: null,
      fsTrailing: null,
      fsFile: null,
      withheld: "error",
    };
  }
  const series = cut(fsr.series, asOf);
  const fund = fromTrailingMap(trailingOf(series, asOf));
  const shown = classLabel(spec.key, fsr.classCode);
  const fsClass = fsBlock ? classOfArchive(fsBlock.month) : null;
  const fsMismatch = !!fsBlock && archMismatch(fsBlock.month);
  if (fsMismatch) {
    // the factsheet of the month is still required for a new month (timing gate above); only the comparison is skipped
    c.info(
      `${base}.trailing`,
      `factsheet ${fsBlock!.name} publishes class ${classLabel(spec.key, fsClass) ?? fsClass ?? "?"} (${fsClass ?? "unknown"}), the site shows class ${shown} (${fsr.classCode}): its fund trailing, value-added and statistics cross-checks are skipped (class mismatch); all other gates apply`,
    );
    fsTrailing = null;
  }
  if (FUND_SOURCES[spec.key].factsheet && !fsTrailing && !fsMismatch)
    c.warn(`${base}.trailing`, `no factsheet trailing returns for ${ym(asOf)}: not cross-checked`);
  // new months confirmed by no source independent of the dataplatform: auto mode waits for an admin (validate.ts)
  const confirmedSet = new Set(fsr.confirmed);
  const independent = (m: string): boolean => {
    const o = fsr.origin[m];
    if (o === "analytics" || o === "factsheet" || confirmedSet.has(m)) return true;
    const a = cand.analyticsMonths[m];
    if (a !== undefined && Math.abs(a - fsr.series[m]) <= TOL.analyticsVsDataplatform) return true;
    return !!fsTrailing && m === asOf;
  };
  const unconfirmed = sortedKeys(cut(fsr.series, asOf)).filter((m) => (!prevAsOf || m > prevAsOf) && !independent(m));
  if (unconfirmed.length)
    c.warn(
      `${key}.review`,
      `new month(s) ${monthRanges(unconfirmed)} confirmed by no source independent of the dataplatform (no analytics month, no same-class factsheet): in auto mode they wait for an admin to publish this run`,
    );
  if (fsTrailing)
    for (const x of crossCheck(fund, fsTrailing))
      if (x.level === "warn")
        c.warn(
          `${base}.trailing.${x.period}`,
          `${x.period}: computed ${pct(x.computed)} vs factsheet ${fsBlock!.name} ${pct(x.published)} (beyond rounding, within tolerance; computed kept)`,
        );

  const trailing: Trailing = { fund };
  let indexMonthly: MonthlyPoint[] | undefined;
  let idx: Series = {};
  let indexName: string | undefined;
  const provParts: string[] = [];
  let ib: IndexBuild | null = null;
  if (FUND_SOURCES[spec.key].ftseIndex) {
    // newest factsheet up to the as-of month (cross-checks only)
    const blk =
      fsBlock ??
      (factsheetFilesFor(raw, FUND_SOURCES[spec.key].factsheet!.file)
        .map((f) => ({ ...f, block: f.data[FUND_SOURCES[spec.key].factsheet!.key] }))
        .find((f) => f.month <= ym(asOf!) && isObj(f.block)) as
        { name: string; month: string; block: Obj } | undefined) ??
      null;
    ib = buildIndex(raw, spec, blk, firstMonth, asOf, c, base);
    idx = ib.monthly;
    indexName = ib.name ?? undefined;
    const computedIdx = fromTrailingMap(trailingOf(idx, asOf, { siStart: firstMonth }));
    const index: PeriodMap = {};
    const va: PeriodMap = {};
    for (const p of PERIOD_LIST) {
      const k = p as keyof PeriodMap;
      if (fund[k] == null) {
        index[k] = null;
        va[k] = null;
        continue;
      }
      const iv = computedIdx[k] ?? null;
      index[k] = iv;
      va[k] = iv != null ? clean((fund[k] as number) - iv) : null;
      const pub = ib.pub?.trailing?.[k];
      if (pub != null && iv != null) {
        const tol = (0.5 * 10 ** -(ib.pub?.decimals?.index[k] ?? 1)) / 100 + 1e-9;
        if (Math.abs(iv - pub) > tol)
          indexNote(
            c,
            `${base}.trailing.index.${p}`,
            periodStart(p, asOf, firstMonth),
            `index ${p}: FTSE ${pct(iv)} vs factsheet ${ib.pub!.file} ${pct(pub)} (FTSE shown)`,
          );
      }
      const pv = ib.pub?.va?.[k];
      if (pv != null && va[k] != null && !archMismatch(ib.pub!.month)) {
        const tol = (0.5 * 10 ** -(ib.pub?.decimals?.va[k] ?? 1)) / 100 + 1e-9;
        if (Math.abs((va[k] as number) - pv) > tol)
          indexNote(
            c,
            `${base}.trailing.va.${p}`,
            periodStart(p, asOf, firstMonth),
            `value added ${p}: fund − FTSE ${pct(va[k] as number)} vs factsheet ${pct(pv)}`,
          );
      }
    }
    trailing.index = index;
    trailing.va = va;
    indexMonthly = toPoints(idx);
    const missingIdx = PERIOD_LIST.filter(
      (p) => fund[p as keyof PeriodMap] != null && index[p as keyof PeriodMap] == null,
    );
    if (missingIdx.length)
      c.warn(
        `${base}.trailing.index`,
        `index ${missingIdx.join(", ")} not shown: FTSE ${ib.source} does not cover the whole period`,
      );
    provParts.push(
      `index "${indexName ?? "?"}": computed from ${ib.prov || "no FTSE data"}; value added = fund − FTSE index${ib.pub ? `; factsheet ${ib.pub.file} index figures used as a cross-check only (its index was the XSB/XBB ETF before ${ym(FTSE_COMPARABLE_FROM)})` : ""}`,
    );
  }

  // calendar (index years computed from FTSE; the published index row is a cross-check)
  const idxCal = FUND_SOURCES[spec.key].ftseIndex
    ? new Map(calendarYears(idx, asOf, { first: firstMonth }).map((y) => [y.year, y]))
    : null;
  const calendar: CalendarRow[] = calendarYears(series, asOf, { first: firstMonth }).map((y) => {
    const row: CalendarRow = { year: y.year, fund: y.value };
    if (y.partial) row.partial = true;
    if (idxCal) {
      const iy = idxCal.get(y.year);
      const iv = iy && iy.months === y.months ? iy.value : null;
      row.index = iv;
      row.va = iv != null && y.value != null ? clean(y.value - iv) : null;
      const pub = ib?.pub?.calendar[String(y.year)]?.index;
      const pubComplete = ib?.pub && (y.year < Number(ib.pub.month.slice(0, 4)) || ib.pub.month === ym(asOf));
      if (pubComplete && pub != null && iv != null && Math.abs(iv - pub) > 0.0005 + 1e-9)
        indexNote(
          c,
          `${base}.calendar.${y.year}.index`,
          y.year === Number(firstMonth.slice(0, 4)) ? firstMonth : `${y.year}-01-31`,
          `index ${y.year}: FTSE ${pct(iv)} vs factsheet ${pct(pub)} (FTSE shown)`,
        );
    }
    return row;
  });

  // growth of 10 000
  const g = growthOf(series, asOf, { first: firstMonth });
  let idxAcc: number | null = 1;
  const growth: GrowthPoint[] = g.map((pt, i) => {
    if (!FUND_SOURCES[spec.key].ftseIndex) return { date: pt.date, fund: pt.value };
    if (i > 0) idxAcc = idxAcc != null && pt.date in idx ? idxAcc * (1 + idx[pt.date]) : null;
    return { date: pt.date, fund: pt.value, index: idxAcc != null ? 10_000 * idxAcc : null };
  });

  const rounded = fsr.factsheetMonths.filter((m) => m <= asOf);
  const risk = rounded.length ? null : riskFrom(riskStats(series, asOf, "SI"));
  const risk3Y = rounded.some((m) => m > addMonths(asOf, -36)) ? null : riskFrom(riskStats(series, asOf, "3Y"));
  if (rounded.length)
    c.warn(
      `${base}.risk`,
      `risk statistics not shown${risk3Y ? " for the SI window" : ""}: ${rounded.length} month(s) come from rounded factsheet figures (${monthRanges(rounded)})`,
    );
  const stats =
    fsBlock && isObj(fsBlock.block["Portfolio Snapshot"])
      ? parseStatistics((fsBlock.block["Portfolio Snapshot"] as Obj)["Statistics Net"])
      : null;
  if (stats && risk && !fsMismatch) {
    const checks: [string, number | null, number | null, number][] = [
      ["annReturn", risk.annReturn, stats.annReturn, 0.0006],
      ["annVol", risk.annVol, stats.annVol, 0.0006],
      ["downsideDev", risk.downsideDev, stats.downsideDev, 0.0006],
      ["sharpe", risk.sharpe, stats.sharpe, 0.051],
      ["sortino", risk.sortino, stats.sortino, 0.051],
      ["positiveMonths", risk.positiveMonths, stats.positiveMonths, 0.0051],
    ];
    for (const [k, a, b, tol] of checks)
      if (a != null && b != null && Math.abs(a - b) > tol)
        c.warn(
          `${base}.risk.${k}`,
          `${k}: computed ${a.toFixed(4)} vs factsheet ${fsBlock!.name} ${b.toFixed(4)} (computed kept)`,
        );
  }

  c.prov[key] =
    `monthly net returns ${ym(firstMonth)} to ${ym(asOf)}: ${fsr.sources.join("; ")}; every month class_code ${fsr.classCode}, shown as class ${shown}; trailing/calendar/growth computed (compounded, annualized beyond 1 year)${fsTrailing ? `, cross-checked with factsheet ${fsBlock!.name}` : fsMismatch && fsBlock ? `, not cross-checked with factsheet ${fsBlock.name} (it publishes class ${classLabel(spec.key, fsClass) ?? fsClass ?? "?"})` : ""}${provParts.length ? `; ${provParts.join("; ")}` : ""}`;
  c.prov[`${base}.risk`] =
    `computed from the monthly net returns (SI and 3Y windows; population st.dev. ×√12; downside dev. = st.dev. of negative months ×√12; Sharpe and Sortino without risk-free rate, as in the factsheets; max drawdown from the running peak including the initial investment, whereas the factsheet uses month-end peaks only)`;
  // the label is derived from the class of the data used (fundSeries guarantees one labelled class for every month);
  // returnClass = the site code ("FP" / "F" / "H"), the label keeps the "Series <code>" form the UI localises
  const performance: Performance = {
    asOf,
    basis: "net",
    method: "compounded",
    firstMonth,
    monthly: toPoints(series),
    ...(indexMonthly ? { indexMonthly } : {}),
    trailing,
    calendar,
    growth,
    classCode: fsr.classCode,
    returnClass: shown!,
    returnClassLabel: `Series ${shown}`,
  };
  // less than 12 monthly returns: the page says "since class inception" (same flag as the per-class series)
  if (isShortRecord(firstMonth, asOf)) performance.shortRecord = true;
  if (indexName) performance.indexName = indexName;
  return {
    performance,
    risk,
    risk3Y,
    trailingSource: "computed",
    fsTrailing,
    fsFile: fsBlock?.name ?? null,
    held: asOf < fsr.last ? fsr.last : undefined,
    alerts,
    unconfirmed,
    ref: {
      series,
      origin: fsr.origin,
      idx: FUND_SOURCES[spec.key].ftseIndex ? idx : null,
      idxLevels: FUND_SOURCES[spec.key].ftseIndex ? (ib?.levels ?? null) : null,
      firstMonth,
      indexName,
      sourceMonths: cand.sourceMonths,
      verify: cand.verify,
    },
  };
}
