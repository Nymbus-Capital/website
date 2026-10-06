// fund.ts — one fund: performance, classes, revisions, NAV, AUM, factsheet parts, portfolio, distributions
import type { FundSpec } from "../../../config/funds.ts";
import type { FundData, Performance, RiskStats, SiteData } from "../../data/types.ts";
import { ym } from "../../data/dates.ts";
import { FUND_SOURCES, trackFundserv } from "../fund-sources.ts";
import { perfClassCode, withClassLabel } from "../perf-class.ts";
import { PIPELINE_FUNDS } from "../config.ts";
import { lastClosedMonth } from "../metrics.ts";
import type { RawPayloads } from "../raw.ts";
import { pct } from "../format.ts";
import { carriedNoteFor, type BuildOptions, type Ctx, type FundContext } from "./context.ts";
import { factsheetBlock } from "./factsheets.ts";
import { comparablePrevious, revisions, type PerfBuild } from "./performance.ts";
import { buildNetPerformance } from "./net-performance.ts";
import { buildFactsheetPerformance } from "./factsheet-performance.ts";
import { buildAum, buildNav } from "./nav.ts";
import { buildFactsheetParts } from "./factsheet-parts.ts";
import { buildDistributions, buildPortfolio } from "./daily-book.ts";
import { buildClasses, computeClassRun } from "./class-series.ts";
import { buildVariants } from "./variants.ts";

/** Every part of one fund, with the context validate.ts gates it on. */
export function buildFund(raw: RawPayloads, spec: FundSpec, prevData: SiteData | null, c: Ctx, opts: BuildOptions, now: Date): { fund: FundData | null; ctx: FundContext } {
  const base = `funds.${spec.key}`;
  const prev = prevData?.funds[spec.key];
  const ctx: FundContext = {
    key: spec.key, method: PIPELINE_FUNDS[spec.key].method, trailingSource: null, factsheetTrailing: null, factsheetTrailingFile: null,
    parts: { performance: "none", nav: "none", aum: "none", factsheet: "none" }, alerts: [], revisions: [],
  };

  // performance + risk
  let performance: Performance | null = null;
  let risk: RiskStats | null = null;
  let risk3Y: RiskStats | null = null;
  let pb: PerfBuild | null = null;
  const src = FUND_SOURCES[spec.key];
  const short = src.dataplatform;
  // every class's own chain first: its fund-wide defect months also apply to the track record's own-NAV months
  const classRun = short ? computeClassRun(raw, spec) : null;
  if (short) {
    // defects of the track record: months withheld for every class + the track class's own check failures (buildClasses
    // skips the headline class, so they would otherwise be lost)
    const track = trackFundserv(spec.key);
    const defects = classRun ? new Map([...(track ? classRun.res.classChecks[track] ?? [] : []), ...classRun.res.fundMonths].map((x) => [x.month, x.reason])) : undefined;
    pb = buildNetPerformance(raw, spec, prev, c, base, opts, defects);
  } else if (src.factsheet) {
    if (!raw.factsheets.ok) c.error(`${base}.performance`, `factsheet archives unavailable (${raw.factsheets.error ?? "not fetched"})`);
    else pb = buildFactsheetPerformance(raw, spec, prev?.performance, c, base);
    if (raw.factsheets.ok && !pb && !factsheetBlock(raw, spec)) c.error(`${base}.performance`, `"${src.factsheet.key}" not found in the ${src.factsheet.file} archives`);
  }
  if (pb) {
    performance = pb.performance;
    risk = pb.risk;
    risk3Y = pb.risk3Y;
    ctx.trailingSource = pb.trailingSource;
    ctx.parts.performance = pb.performance ? (pb.held || (prev?.performance && pb.performance.asOf === prev.performance.asOf && pb.performance.asOf < lastClosedMonth(now)) ? "held" : "fresh") : "none";
    if (pb.fsTrailing && pb.performance) {
      ctx.factsheetTrailing = pb.fsTrailing.fund;
      ctx.factsheetTrailingFile = pb.fsFile;
      ctx.factsheetTrailingDecimals = pb.fsTrailing.decimals.fund;
    }
    if (pb.withheld === "error") ctx.alerts.push("performance withheld");
    if (pb.alerts?.length) ctx.alerts.push(...pb.alerts);
    if (pb.unconfirmed?.length && pb.performance) ctx.unconfirmed = pb.unconfirmed.filter((m) => m <= pb!.performance!.asOf);
    if (pb.held) c.info(`${base}.performance`, `performance kept at ${ym(pb.performance!.asOf)} until the ${ym(pb.held)} factsheet is available and consistent`);
  } else if (prev?.performance && withClassLabel(spec.key, prev.performance)) {
    // relabelled by its own class (a publication made before classes were tracked carries its track-record class)
    performance = withClassLabel(spec.key, prev.performance);
    risk = prev.risk;
    risk3Y = prev.risk3Y ?? null;
    ctx.parts.performance = "carried";
    ctx.trailingSource = null;
    ctx.alerts.push("performance carried over");
    c.error(`${base}.performance`, `performance kept from the previous publication (as of ${ym(prev.performance.asOf)})`);
    c.prov[`${base}.performance`] = carriedNoteFor(c, base, "performance");
    if (c.prevProv[`${base}.risk`]) c.prov[`${base}.risk`] = carriedNoteFor(c, base, "risk");
  } else {
    if (short || FUND_SOURCES[spec.key].factsheet) ctx.alerts.push("no performance");
  }

  // returns per class (net funds): every class that has a series; the default class (F) is the headline when it has one
  let performanceByClass: FundData["performanceByClass"];
  let defaultClass: string | undefined;
  let classInfo: FundData["classInfo"];
  if (short) {
    const cls = buildClasses(raw, spec, prev, pb, performance, risk, risk3Y, c, base, classRun);
    performanceByClass = cls.byClass;
    defaultClass = cls.defaultClass;
    classInfo = cls.classInfo;
    ctx.alerts.push(...cls.alerts);
    if (cls.advisories.length) ctx.advisories = cls.advisories;
  }

  // revisions of already published months (M5), against the same class of the previous publication; a change of class
  // restates every month: no revision list, the change itself needs an approval (validate.ts)
  const prevClass = perfClassCode(spec.key, prev?.performance);
  if (performance && ctx.parts.performance !== "carried" && !(prev?.performance && performance.classCode && prevClass !== performance.classCode)) {
    ctx.revisions = revisions(comparablePrevious(prev, performance), performance);
    if (ctx.revisions.length) {
      c.warn(`${base}.performance.monthly`, `revised month(s) already published: ${ctx.revisions.slice(0, 6).map((r) => `${ym(r.month)} ${pct(r.before)} → ${r.after === null ? "removed" : pct(r.after)}`).join("; ")}${ctx.revisions.length > 6 ? "; …" : ""}`);
      ctx.alerts.push(`${ctx.revisions.length} published month(s) revised`);
    }
  }
  // the same for every other class entry, against the previous publication's entry of the same FundServ code and class
  // (a class change of an entry is gated in validate.ts)
  if (ctx.parts.performance !== "carried") {
    for (const [fsv, entry] of Object.entries(performanceByClass ?? {})) {
      if (entry.performance === performance) continue;
      const old = prev?.performanceByClass?.[fsv]?.performance;
      if (!old || (old.classCode && entry.performance.classCode && old.classCode !== entry.performance.classCode)) continue;
      const rev = revisions(old, entry.performance);
      if (!rev.length) continue;
      ctx.revisions.push(...rev.map((r) => ({ ...r, fundserv: fsv })));
      c.warn(`${base}.performance.classes.${fsv}.monthly`, `class ${entry.display} (${fsv}): revised month(s) already published: ${rev.slice(0, 6).map((r) => `${ym(r.month)} ${pct(r.before)} → ${r.after === null ? "removed" : pct(r.after)}`).join("; ")}${rev.length > 6 ? "; …" : ""}`);
      ctx.alerts.push(`class ${entry.display} (${fsv}): ${rev.length} published month(s) revised`);
    }
  }

  // NAV & AUM (fund vehicles only)
  let nav: FundData["nav"] = null;
  let aum: FundData["aum"] = null;
  if (short) {
    const n = buildNav(raw, spec, prev, c, base);
    nav = n.nav;
    ctx.parts.nav = n.state;
    const a = buildAum(raw, spec, prev, c, base);
    aum = a.aum;
    ctx.parts.aum = a.state;
  }

  const fp = buildFactsheetParts(raw, spec, prev, performance?.asOf ?? null, c, base);
  ctx.parts.factsheet = fp.state;
  for (const part of ["nav", "aum", "factsheet"] as const) if (ctx.parts[part] === "carried") ctx.alerts.push(`${part} carried over`);

  // daily portfolio and distributions (fund vehicles only): never an alert, the page falls back on its own
  const portfolio = short ? buildPortfolio(raw, spec, prev, fp, c, base, now) : null;
  const distributions = short ? buildDistributions(raw, spec, prev, nav, c, base, now) : null;

  // strategy variants (GMV 3 / 6 / 9 % downside volatility): the default variant is the fund's own data above
  const variants = !short && src.variants ? buildVariants(raw, spec, prev, { performance, risk, risk3Y, fp: fp.parts }, c, base) : undefined;

  const hasAny = performance || nav || aum || portfolio || fp.parts.characteristics.length || fp.parts.topHoldings.length || Object.keys(fp.parts.breakdowns).length;
  if (!hasAny) return { fund: null, ctx };
  const fund: FundData = {
    key: spec.key,
    sourceName: [short ? `dataplatform ${short}` : null, src.analytics ? `analytics "${src.analytics}"` : null, src.factsheet ? `${src.factsheet.file}:${src.factsheet.key}` : null].filter(Boolean).join(" / "),
    performance, risk, risk3Y, nav, aum,
    characteristics: fp.parts.characteristics,
    breakdowns: fp.parts.breakdowns,
    topHoldings: fp.parts.topHoldings,
    esg: fp.parts.esg,
    factsheetMonth: fp.parts.factsheetMonth,
    portfolio,
    distributions,
    ...(performanceByClass && Object.keys(performanceByClass).length ? { performanceByClass, ...(defaultClass ? { defaultClass } : {}) } : {}),
    ...(classInfo && Object.keys(classInfo).length ? { classInfo } : {}),
    ...(variants ? { variants, defaultVariant: src.variants![0].id } : {}),
  };
  return { fund, ctx };
}
