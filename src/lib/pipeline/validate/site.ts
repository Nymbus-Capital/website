// site.ts — validate every fund, merge blocked / held funds with the previous publication, and class-change approval
import type { FundData, FundKey, Issue, SiteData } from "../../data/types.ts";
import { computeAsOf, type FundContext } from "../build/index.ts";
import { classLabel } from "../fund-sources.ts";
import { fundWithClassLabel, perfClassCode } from "../perf-class.ts";
import { addMonths, lastClosedMonth } from "../metrics.ts";
import { ym } from "../../data/dates.ts";
import { nonFinitePaths } from "./helpers.ts";
import { checkClassesAndVariants, checkPerformance } from "./performance.ts";
import { checkAum, checkNav } from "./nav.ts";
import { checkPortfolio } from "./portfolio.ts";
import { checkDistributions } from "./distributions.ts";

export interface FundValidation {
  fund: FundKey;
  blocking: Issue[];
  warnings: Issue[];
  /**
   * reasons a human must look at although the fund is published (performance carried over / withheld /
   * stale, carried NAV / AUM / factsheet, revised months, error-level issues): run status "blocked" + alert
   */
  alerts: string[];
  /** persistent, expected limitations reported without blocking (FundContext.advisories) */
  advisories?: { code: string; message: string }[];
}

interface ValidationOutcome {
  /**
   * data after repairs and merge (blocked funds replaced by their previous publication). A fund whose performance
   * class changes keeps its NEW data here: this is what publishing (approving) the run publishes
   */
  data: SiteData;
  /**
   * what may be published without a human (auto mode): `data` with every fund whose performance class changes
   * replaced by its previous publication (== data when there is none)
   */
  autoData: SiteData;
  /** funds whose performance class changes (headline or any class entry): the run needs an admin approval to publish them */
  classChanges: FundKey[];
  /**
   * funds with new performance months that no source independent of the dataplatform confirms (FundContext.unconfirmed):
   * auto mode publishes them with their previous performance (autoData) and the run waits for an admin review
   */
  needsReview: FundKey[];
  results: FundValidation[];
  funds: Partial<Record<FundKey, "updated" | "kept-previous" | "unavailable">>;
}

/**
 * Validate every fund of `data`, repair what can be repaired, and merge: a fund with a blocking issue
 * keeps its previously published FundData (or is withheld when there is none). Pure: returns a new object.
 */
export function validateSite(
  input: SiteData,
  context: Partial<Record<FundKey, FundContext>>,
  previous: SiteData | null,
  now: Date,
): ValidationOutcome {
  const data: SiteData = structuredClone(input); // keeps NaN / Infinity, so they can be caught below
  const prevLive = previous && previous.mode === "live" ? previous : null;
  const results: FundValidation[] = [];
  const funds: ValidationOutcome["funds"] = {};
  const extraIssues: Issue[] = [];
  const held: Partial<Record<FundKey, FundData>> = {};
  const review: FundKey[] = [];
  const keys = new Set<FundKey>([...(Object.keys(context) as FundKey[]), ...(Object.keys(data.funds) as FundKey[])]);
  for (const key of keys) {
    const base = `funds.${key}`;
    const f = data.funds[key];
    const prev = prevLive?.funds[key];
    const ctx = context[key];
    const blocking: Issue[] = [];
    const warnings: Issue[] = [];
    // a carried-over fund passes the daily-book gate again: its book may have become too old since it was published;
    // its performance is labelled by its own class (perf-class.ts)
    const carry = (): FundData => {
      const c = structuredClone(fundWithClassLabel(prev!)!);
      const issues = [...checkPortfolio(c, base, now), ...checkDistributions(c, base, now)];
      if (issues.length) {
        warnings.push(...issues);
        extraIssues.push(...issues);
      }
      if (!c.portfolio) delete data.provenance[`${base}.portfolio`];
      if (!c.distributions) delete data.provenance[`${base}.distributions`];
      return c;
    };
    if (!f) {
      funds[key] = prev ? "kept-previous" : "unavailable";
      if (prev) data.funds[key] = carry();
      results.push({
        fund: key,
        blocking,
        warnings,
        alerts: [...(ctx?.alerts ?? []), prev ? "fund carried over" : "fund unavailable"],
      });
      continue;
    }
    const repairs: Issue[] = [];
    checkNav(f, prev, base, repairs, warnings, now);
    checkAum(f, prev, base, repairs, warnings, now);
    warnings.push(...checkPortfolio(f, base, now), ...checkDistributions(f, base, now));
    checkPerformance(f, ctx, prev, base, blocking, warnings, now);
    for (const i of checkClassesAndVariants(f, base)) (i.level === "error" ? blocking : warnings).push(i);
    for (const p of nonFinitePaths(f, base))
      blocking.push({ key: p, level: "error", message: `non-finite number at ${p}` });
    extraIssues.push(...repairs, ...warnings);
    // a change of performance class (e.g. SEB class H -> F) restates every month under another label: it is never
    // published without an admin approving the run, whatever the publish mode (the previous publication stays live)
    const fromClass = prev?.performance ? perfClassCode(key, prev.performance) : null;
    const toClass = f.performance?.classCode ?? null;
    // the same gate on every class entry (the page's default class included) and on the default class itself
    const entryChanges = classEntryChanges(key, prev, f, !!prevLive);
    const headChange = !!(fromClass && toClass && fromClass !== toClass);
    const classChange: Issue | null =
      !blocking.length && (headChange || entryChanges.length)
        ? {
            key: `${base}.performance.class`,
            level: "error",
            message: `performance class change ${[headChange ? `from class ${classLabel(key, fromClass) ?? "?"} (${fromClass}) to class ${classLabel(key, toClass) ?? "?"} (${toClass})` : null, ...entryChanges].filter(Boolean).join("; ")}: every month restated and relabelled; an admin must approve (publish) this run — until then the previous publication stays live, also in auto mode`,
          }
        : null;
    // performance (with trailing, risk and the class / variant returns) is gated alone (docs/architecture.md § Performance class)
    const isPerf = (i: Issue) =>
      [`${base}.performance`, `${base}.trailing`, `${base}.risk`, `${base}.risk3Y`].some(
        (k) => i.key === k || i.key.startsWith(`${k}.`) || i.key.startsWith(`${k}[`),
      ) ||
      new RegExp(
        `^${base.replaceAll(".", "\\.")}\\.(performanceByClass|variants)\\.[^.]+\\.(performance|risk|risk3Y)([.\\[]|$)`,
      ).test(i.key);
    const perfBlocking = blocking.filter(isPerf);
    if (blocking.length && perfBlocking.length === blocking.length) {
      const kept = prev?.performance ? structuredClone(fundWithClassLabel(prev)!) : null;
      f.performance = kept?.performance ?? null;
      f.risk = kept?.risk ?? null;
      if (kept?.risk3Y !== undefined) f.risk3Y = kept.risk3Y;
      else delete f.risk3Y;
      // the hold covers every class and variant: their returns come with the held performance, never new next to old
      if (kept?.performanceByClass) {
        f.performanceByClass = kept.performanceByClass;
        if (kept.defaultClass) f.defaultClass = kept.defaultClass;
        else delete f.defaultClass;
      } else {
        delete f.performanceByClass;
        delete f.defaultClass;
      }
      if (kept?.classInfo) f.classInfo = kept.classInfo;
      else delete f.classInfo;
      if (f.variants) {
        const dv = f.defaultVariant;
        for (const id of Object.keys(f.variants)) {
          const old = kept?.variants?.[id];
          if (id === dv)
            f.variants[id] = { ...f.variants[id], performance: f.performance, risk: f.risk, risk3Y: f.risk3Y ?? null };
          else if (old?.performance) f.variants[id] = old;
          else delete f.variants[id];
        }
      }
      for (const k of [`${base}.performance`, `${base}.risk`]) {
        const was = prevLive?.provenance[k];
        if (kept?.performance && was)
          data.provenance[k] = was.startsWith("carried over")
            ? was
            : `carried over from the publication of ${prevLive!.generatedAt} (${was})`;
        else delete data.provenance[k];
      }
      const closed = lastClosedMonth(now);
      if (kept?.performance && kept.performance.asOf < addMonths(closed, -1)) {
        const stale: Issue = {
          key: `${base}.performance.asOf`,
          level: "error",
          message: `stale: kept performance as of ${ym(kept.performance.asOf)} while ${ym(closed)} is closed`,
        };
        warnings.push(stale);
        extraIssues.push(stale);
      }
      extraIssues.push(...blocking, {
        key: `${base}.performance`,
        level: "error",
        message: `performance held back by ${blocking.length} validation error(s): ${kept?.performance ? "previously published performance kept" : "performance withheld (nothing previously published)"}; NAV, AUM, portfolio and distributions published`,
      });
      const parts = ctx?.parts;
      // the held performance is not an update: the fund counts as updated only when another part is fresh
      funds[key] =
        (parts
          ? Object.entries(parts).every(([n, s]) => n === "performance" || (s !== "fresh" && s !== "held"))
          : false) && prev
          ? "kept-previous"
          : "updated";
    } else if (blocking.length) {
      extraIssues.push(...blocking, {
        key: base,
        level: "error",
        message: `fund blocked by ${blocking.length} validation error(s): ${prev ? "previously published data kept" : "fund withheld (nothing previously published)"}`,
      });
      if (prev) {
        funds[key] = "kept-previous";
        for (const k of Object.keys(data.provenance))
          if (k === base || k.startsWith(`${base}.`)) delete data.provenance[k];
        for (const [k, v] of Object.entries(prevLive!.provenance))
          if (k === base || k.startsWith(`${base}.`))
            data.provenance[k] = v.startsWith("carried over")
              ? v
              : `carried over from the publication of ${prevLive!.generatedAt} (${v})`;
        data.funds[key] = carry();
      } else {
        delete data.funds[key];
        funds[key] = "unavailable";
      }
    } else {
      const parts = ctx?.parts;
      const allCarried = parts ? Object.values(parts).every((s) => s !== "fresh" && s !== "held") : false;
      funds[key] = allCarried && prev ? "kept-previous" : "updated";
      if (classChange) {
        extraIssues.push(classChange);
        // a fund published for the first time next to a live site: its page goes live without any performance until approved
        held[key] = prev
          ? carry()
          : (() => {
              const c = structuredClone(f);
              c.performance = null;
              c.risk = null;
              delete c.risk3Y;
              delete c.performanceByClass;
              delete c.defaultClass;
              delete c.classInfo;
              return c;
            })();
      } else if (ctx?.unconfirmed?.length && f.performance && ctx.parts.performance !== "carried") review.push(key);
    }
    const alerts = [...(ctx?.alerts ?? [])];
    if (blocking.length)
      alerts.push(
        perfBlocking.length === blocking.length ? "performance held back by validation" : "blocked by validation",
      );
    if (classChange) {
      blocking.push(classChange);
      alerts.push(
        headChange
          ? `performance class change to class ${classLabel(key, toClass) ?? "?"} needs approval`
          : `class change of ${entryChanges.length} class entr${entryChanges.length > 1 ? "ies" : "y"} needs approval`,
      );
    }
    for (const i of [...repairs, ...warnings]) if (i.level === "error") alerts.push(i.message);
    for (const i of input.issues)
      if (i.level === "error" && (i.key === base || i.key.startsWith(`${base}.`))) alerts.push(i.message);
    results.push({
      fund: key,
      blocking,
      warnings: [...repairs, ...warnings],
      alerts: [...new Set(alerts)],
      ...(ctx?.advisories?.length
        ? { advisories: ctx.advisories.filter((a, i, all) => all.findIndex((b) => b.code === a.code) === i) }
        : {}),
    });
  }
  data.issues = [...data.issues, ...extraIssues];
  data.asOf = computeAsOf(data.funds);
  const classChanges = Object.keys(held) as FundKey[];
  let autoData = data;
  if (classChanges.length) {
    autoData = structuredClone(data);
    for (const key of classChanges) {
      const base = `funds.${key}`;
      autoData.funds[key] = held[key];
      if (!prevLive?.funds[key]) {
        // a fund new to the site: its own non-performance provenance stays
        for (const k of Object.keys(autoData.provenance))
          if (k === `${base}.performance` || k.startsWith(`${base}.performance.`) || k === `${base}.risk`)
            delete autoData.provenance[k];
        continue;
      }
      for (const k of Object.keys(autoData.provenance))
        if (k === base || k.startsWith(`${base}.`)) delete autoData.provenance[k];
      for (const [k, v] of Object.entries(prevLive!.provenance))
        if (k === base || k.startsWith(`${base}.`))
          autoData.provenance[k] = v.startsWith("carried over")
            ? v
            : `carried over from the publication of ${prevLive!.generatedAt} (${v})`;
    }
    autoData.asOf = computeAsOf(autoData.funds);
  }
  // unconfirmed new months: auto mode publishes the fund with its previous performance (every class with it); the new
  // month goes live when an admin publishes this run
  const needsReview = review.filter((k) => !held[k]);
  if (needsReview.length) {
    if (autoData === data) autoData = structuredClone(data);
    for (const key of needsReview) {
      const base = `funds.${key}`;
      const f = autoData.funds[key]!;
      const prevF = prevLive?.funds[key] ? fundWithClassLabel(prevLive.funds[key]!) : null;
      f.performance = prevF?.performance ?? null;
      f.risk = prevF?.risk ?? null;
      if (prevF?.risk3Y !== undefined) f.risk3Y = prevF.risk3Y;
      else delete f.risk3Y;
      if (prevF?.performanceByClass) {
        f.performanceByClass = prevF.performanceByClass;
        if (prevF.defaultClass) f.defaultClass = prevF.defaultClass;
        else delete f.defaultClass;
      } else {
        delete f.performanceByClass;
        delete f.defaultClass;
      }
      if (prevF?.classInfo) f.classInfo = prevF.classInfo;
      else delete f.classInfo;
      for (const k of Object.keys(autoData.provenance))
        if (k === `${base}.performance` || k.startsWith(`${base}.performance.`) || k === `${base}.risk`)
          delete autoData.provenance[k];
      if (prevF?.performance) {
        for (const [k, v] of Object.entries(prevLive!.provenance)) {
          if (k === `${base}.performance` || k.startsWith(`${base}.performance.`) || k === `${base}.risk`)
            autoData.provenance[k] = v.startsWith("carried over")
              ? v
              : `carried over from the publication of ${prevLive!.generatedAt} (${v})`;
        }
      }
      const months = context[key]?.unconfirmed ?? [];
      data.issues.push({
        key: `${base}.performance.review`,
        level: "warn",
        message: `needs review: new month(s) ${months.map(ym).join(", ")} confirmed by no source independent of the dataplatform; auto mode keeps ${prevF?.performance ? `the previous performance (as of ${ym(prevF.performance.asOf)})` : "no performance"} live until an admin publishes this run`,
      });
    }
    autoData.issues = data.issues;
    autoData.asOf = computeAsOf(autoData.funds);
  }
  return { data, autoData, classChanges, needsReview, results, funds };
}

/**
 * class changes of the class entries (same FundServ code, another class), classes published for the first time (a series
 * appearing next to a published performance: e.g. a class reaching its 12 months, or every register class at once) and the
 * page's default class. One approval of the run publishes all of them together.
 */
export function classEntryChanges(key: FundKey, prev: FundData | undefined, f: FundData, liveSite = true): string[] {
  if (!prev) {
    // a fund new to a live site: every series is published for the first time (the headline included). The very first
    // publication of the whole site (no live site) has nothing to compare with: run it in review mode (docs/architecture.md)
    if (!liveSite) return [];
    const all = Object.values(f.performanceByClass ?? {}).map((e) => `${e.display} (${e.fundserv})`);
    return all.length
      ? [
          `${all.length} class${all.length > 1 ? "es" : ""} published for the first time (fund new to the site): ${all.join(", ")}`,
        ]
      : [];
  }
  const out: string[] = [];
  const code = (p: { classCode?: string; returnClass?: string } | null | undefined): string | null =>
    p?.classCode ?? p?.returnClass ?? null;
  const added: string[] = [];
  for (const [fsv, entry] of Object.entries(f.performanceByClass ?? {})) {
    const old = prev.performanceByClass?.[fsv];
    const a = code(old?.performance);
    const b = code(entry.performance);
    if (old && a && b && a !== b)
      out.push(`class entry ${fsv} from ${classLabel(key, a) ?? a} (${a}) to ${classLabel(key, b) ?? b} (${b})`);
    // a new series next to a published performance (the headline's own entry of a pre-class publication is not new)
    // (also when the previous publication had no performance at all: a series is never published unseen)
    if (
      !old &&
      !(entry.performance === f.performance || (prev.performance && code(entry.performance) === code(prev.performance)))
    )
      added.push(`${entry.display} (${fsv})`);
  }
  if (added.length)
    out.push(`${added.length} class${added.length > 1 ? "es" : ""} published for the first time: ${added.join(", ")}`);
  if (
    prev.defaultClass &&
    f.defaultClass &&
    prev.defaultClass !== f.defaultClass &&
    prev.performanceByClass?.[prev.defaultClass]
  )
    out.push(`default class from ${prev.defaultClass} to ${f.defaultClass}`);
  return out;
}

/** Gates of one fund, without merging (convenience for the admin / tests). */
export function validateFund(
  f: FundData,
  ctx: FundContext | undefined,
  previous: SiteData | null,
  now: Date,
): FundValidation {
  const site: SiteData = {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    mode: "live",
    asOf: { performance: null, nav: null, aum: null, factsheet: null },
    funds: { [f.key]: f },
    provenance: {},
    issues: [],
  };
  return validateSite(site, ctx ? { [f.key]: ctx } : {}, previous, now).results.find((r) => r.fund === f.key)!;
}
