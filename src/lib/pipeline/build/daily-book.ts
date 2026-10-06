// daily-book.ts — the daily portfolio computed from Apex holdings, and distributions
import { FUNDS, type FundSpec } from "../../../config/funds.ts";
import type { FundData } from "../../data/types.ts";
import { FUND_SOURCES } from "../fund-sources.ts";
import { PIPELINE_FUNDS } from "../config.ts";
import { isObj, parseBuckets, type Obj } from "../parse.ts";
import type { DpShort, FundPortfolio, RawPayloads, SourceResult } from "../raw.ts";
import { computeFundPortfolio } from "../fund-portfolio.ts";
import { crossCheckPortfolio, monthEndBook, selectPortfolio } from "../portfolio.ts";
import { selectDistributions, type LiveClass } from "../distributions.ts";
import { carriedNoteFor, type Ctx, type PartState } from "./context.ts";
import { factsheetBlock } from "./factsheets.ts";
import { registerFund } from "./register.ts";
import type { FsParts } from "./factsheet-parts.ts";

/**
 * Net assets of a fund on a book date: the sum of its classes' Apex closing capital (nav-timeseries
 * `net_asset_value_cad`, one row per mapped class). null when a class row of that day has no value, or when an
 * active class of the fund register (`required`) has no row that day (a partial sum is never a denominator).
 */
function netAssetsOn(raw: RawPayloads, short: DpShort, date: string, required?: string[] | null): number | null {
  const res = raw.nav[short];
  if (!res?.ok || !res.data) return null;
  const rows = res.data.rows.filter((r) => r.source === "apex" && r.date === date && r.fundserv);
  if (!rows.length) return null;
  const byClass = new Map<string, number | null>();
  for (const r of rows) {
    const v = typeof r.net_asset_value_cad === "number" && Number.isFinite(r.net_asset_value_cad) ? r.net_asset_value_cad : null;
    if (byClass.has(r.fundserv!)) return null; // duplicate class rows: unknown
    byClass.set(r.fundserv!, v);
  }
  if ([...byClass.values()].some((v) => v === null)) return null;
  if (required && required.some((k) => !byClass.has(k))) return null;
  return [...byClass.values()].reduce<number>((a, v) => a + (v as number), 0);
}

/**
 * The fund's book computed by the website (fund-portfolio.ts) from its Apex holdings of `date`, the instrument master and
 * the classes' net assets, as a SourceResult like the PR #621 endpoint answer it replaces. Older snapshots without
 * holdings: their stored fund-portfolio answer.
 */
export function computedBook(raw: RawPayloads, short: DpShort, which: "latest" | "monthEnd"): SourceResult<FundPortfolio> | undefined {
  const h = raw.holdings?.[short];
  if (!h) return which === "latest" ? raw.portfolio?.[short] : raw.portfolioMonthEnd?.[short];
  const res = which === "latest" ? h.latest : h.monthEnd;
  if (!res) return undefined;
  if (!res.ok || !res.data) return { ok: false, data: null, error: res.error ?? "holdings unavailable" };
  const inst = raw.instruments;
  if (!inst?.ok || !inst.data) return { ok: false, data: null, error: `instrument master unavailable (${inst?.error ?? "not fetched"})` };
  try {
    const spec = FUNDS.find((f) => FUND_SOURCES[f.key].dataplatform === short);
    const reg = spec ? registerFund(raw, spec) : null;
    const required = reg ? reg.classes.filter((k) => k.status === "active").map((k) => k.fundserv) : null;
    const na = netAssetsOn(raw, short, res.data.date, required);
    const fb = raw.ftseBonds?.[res.data.date];
    const book = computeFundPortfolio(res.data, inst.data.refs, { short, netAssets: na, ftse: fb?.ok && fb.data ? fb.data : null });
    if (fb && !fb.ok) book.warnings.push(`FTSE constituents unavailable as a pricing fallback (${fb.error ?? "error"})`);
    if (na === null && required && netAssetsOn(raw, short, res.data.date) !== null) book.warnings.push(`net assets of ${res.data.date} unavailable: an active register class (${required.join(", ")}) has no Apex closing capital that day`);
    if (!inst.data.universeComplete) book.warnings.push("bond universe read incompletely: coupon / maturity of some bonds unknown");
    return { ok: true, data: book };
  } catch (e: unknown) {
    return { ok: false, data: null, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Daily portfolio (primary when usable, see portfolio.ts), and the month-end cross-check with the factsheet of the
 * same month. The book is computed by the website from main-branch endpoints (computedBook). A failure keeps the
 * previously published daily book (validation drops it once it is too old).
 */
export function buildPortfolio(raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, fp: { parts: FsParts; state: PartState }, c: Ctx, base: string, now: Date): FundData["portfolio"] {
  const short = FUND_SOURCES[spec.key].dataplatform as DpShort;
  const res = computedBook(raw, short, "latest");
  const sel = selectPortfolio(res, { base, short, now, greenBonds: !!PIPELINE_FUNDS[spec.key].greenBonds });
  c.issues.push(...sel.issues);
  if (sel.absent) c.absent.portfolio.push(short);
  let portfolio = sel.portfolio;
  if (portfolio) c.prov[`${base}.portfolio`] = sel.provenance!;
  else if (res && !res.ok && !res.absent && prev?.portfolio?.source === "daily") {
    portfolio = prev.portfolio;
    c.info(`${base}.portfolio`, `previous daily book (${prev.portfolio.asOf}) kept`);
    c.prov[`${base}.portfolio`] = carriedNoteFor(c, base, "portfolio");
  }
  const month = fp.state === "fresh" ? fp.parts.factsheetMonth : null;
  const book = month ? monthEndBook([computedBook(raw, short, "monthEnd")?.data, res?.data], month) : null;
  if (book && month) {
    // sectors of the factsheet: issuer types ("Sectors") and industries ("Industry"); matched by label
    const snap = factsheetBlock(raw, spec, month)?.block["Portfolio Snapshot"];
    const sectors = [...(fp.parts.breakdowns.sectors ?? []), ...(isObj(snap) ? parseBuckets((snap as Obj)["Industry"]) : [])];
    c.issues.push(...crossCheckPortfolio(book, { month, characteristics: fp.parts.characteristics, sectors }, `${base}.portfolio.crossCheck`));
  }
  return portfolio ?? null;
}

/** Live series: the fund register's active classes, else the NAV classes being published. */
function liveClasses(raw: RawPayloads, spec: FundSpec, nav: FundData["nav"]): LiveClass[] | null {
  const reg = registerFund(raw, spec);
  if (reg) return reg.classes.filter((k) => k.status === "active").map((k) => ({ fundserv: k.fundserv, display: k.display, currency: k.currency }));
  return nav?.classes.length ? nav.classes.map((k) => ({ fundserv: k.fundserv, display: k.display, currency: k.currency })) : null;
}

/** Distributions of the live classes; a failed source keeps the previous publication. */
export function buildDistributions(raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, nav: FundData["nav"], c: Ctx, base: string, now: Date): FundData["distributions"] {
  const short = FUND_SOURCES[spec.key].dataplatform as DpShort;
  const res = raw.distributions?.[short];
  const sel = selectDistributions(res, { base, short, live: liveClasses(raw, spec, nav), today: now.toISOString().slice(0, 10) });
  c.issues.push(...sel.issues);
  if (sel.absent) c.absent.distributions.push(short);
  if (sel.distributions) {
    c.prov[`${base}.distributions`] = sel.provenance!;
    return sel.distributions;
  }
  if (res && !res.ok && !res.absent && prev?.distributions) {
    c.info(`${base}.distributions`, `previous distributions (as of ${prev.distributions.asOf}) kept`);
    c.prov[`${base}.distributions`] = carriedNoteFor(c, base, "distributions");
    return prev.distributions;
  }
  return null;
}
