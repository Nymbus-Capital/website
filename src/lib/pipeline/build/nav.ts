// nav.ts — NAV per unit with its daily change, and fund AUM
import type { FundSpec } from "../../../config/funds.ts";
import type { FundData, NavClass } from "../../data/types.ts";
import { FUND_SOURCES } from "../fund-sources.ts";
import { clean } from "../metrics.ts";
import type { DpShort, NavPoint, RawPayloads } from "../raw.ts";
import { carriedNoteFor, type Ctx, type PartState } from "./context.ts";
import { registerFund } from "./register.ts";

/**
 * Daily change of one class: the administrator's distribution-aware net daily return of the latest
 * valuation, only when it starts exactly at the previous valuation day shown. The $ change is shown only
 * when it is consistent with that return (no distribution in between).
 */
export function navChange(
  last: NavPoint,
  before: NavPoint | null,
): { changePct: number | null; change: number | null; reason: string | null } {
  if (!before) return { changePct: null, change: null, reason: "no previous valuation" };
  const r = last.net_daily_return;
  if (last.net_return_method !== "apex_distribution_aware")
    return {
      changePct: null,
      change: null,
      reason: `return method ${last.net_return_method ?? "unknown"} (not distribution-aware)`,
    };
  if (typeof r !== "number" || !Number.isFinite(r)) return { changePct: null, change: null, reason: "no daily return" };
  if (last.return_start_date !== before.date)
    return {
      changePct: null,
      change: null,
      reason: `daily return starts ${last.return_start_date ?? "?"}, previous valuation shown is ${before.date}`,
    };
  const nav = last.nav_per_share_local as number;
  const prevNav = before.nav_per_share_local as number;
  const priceRet = nav / prevNav - 1;
  return { changePct: r, change: Math.abs(priceRet - r) <= 1e-4 ? clean(nav - prevNav) : null, reason: null };
}

/** NAV per unit of each live class with its daily change; a failed source keeps the previous NAV. */
export function buildNav(
  raw: RawPayloads,
  spec: FundSpec,
  prev: FundData | undefined,
  c: Ctx,
  base: string,
): { nav: FundData["nav"]; state: PartState } {
  const short = FUND_SOURCES[spec.key].dataplatform as DpShort;
  const res = raw.nav[short];
  const carry = (why: string): { nav: FundData["nav"]; state: PartState } => {
    c.warn(`${base}.nav`, `${why}; ${prev?.nav ? "previous NAV kept" : "no NAV shown"}`);
    if (prev?.nav) c.prov[`${base}.nav`] = carriedNoteFor(c, base, "nav");
    return { nav: prev?.nav ?? null, state: prev?.nav ? "carried" : "none" };
  };
  if (!res?.ok || !res.data) return carry(`NAV unavailable (${res?.error ?? "not fetched"})`);
  const reg = registerFund(raw, spec);
  let allowed: { fundserv: string; display: string | null; currency: string | null }[];
  if (reg) {
    allowed = reg.classes
      .filter((k) => k.status === "active")
      .map((k) => ({ fundserv: k.fundserv, display: k.display, currency: k.currency }));
  } else if (prev?.nav?.classes.length) {
    c.warn(
      `${base}.nav`,
      `fund register unavailable (${raw.apexFunds.error ?? "fund not found"}): previously published classes used`,
    );
    allowed = prev.nav.classes.map((k) => ({ fundserv: k.fundserv, display: k.display, currency: k.currency }));
  } else {
    return carry(
      `fund register unavailable (${raw.apexFunds.error ?? "fund not found in /api/apex/funds"}), live classes unknown`,
    );
  }
  const byClass = new Map<string, Map<string, NavPoint>>();
  for (const r of res.data.rows) {
    if (!r.fundserv) continue;
    const v = r.nav_per_share_local;
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) continue;
    const m = byClass.get(r.fundserv) ?? new Map<string, NavPoint>();
    const cur = m.get(r.date);
    if (!cur || (cur.source !== "apex" && r.source === "apex")) m.set(r.date, r);
    byClass.set(r.fundserv, m);
  }
  const classes: NavClass[] = [];
  const noChange: string[] = [];
  for (const a of allowed) {
    const m = byClass.get(a.fundserv);
    const dates = m ? [...m.keys()].sort() : [];
    if (!dates.length) {
      c.info(
        `${base}.nav.${a.fundserv}`,
        `no NAV for class ${a.display ?? a.fundserv} (${a.fundserv}) in the last weeks`,
      );
      continue;
    }
    const last = m!.get(dates[dates.length - 1])!;
    const before = dates.length > 1 ? m!.get(dates[dates.length - 2])! : null;
    const ch = navChange(last, before);
    if (ch.reason && before) noChange.push(`${a.display ?? a.fundserv}: ${ch.reason}`);
    classes.push({
      fundserv: a.fundserv,
      display: a.display ?? last.class_display ?? a.fundserv,
      currency: a.currency ?? last.currency ?? "CAD",
      nav: last.nav_per_share_local as number,
      date: last.date,
      prevNav: before ? (before.nav_per_share_local as number) : null,
      prevDate: before?.date ?? null,
      change: ch.change,
      changePct: ch.changePct,
    });
  }
  if (!classes.length) return carry("no NAV row for any live class");
  if (noChange.length) c.info(`${base}.nav`, `daily change not shown for ${noChange.join("; ")}`);
  const asOf =
    classes
      .map((k) => k.date as string)
      .sort()
      .pop() ?? null;
  c.prov[`${base}.nav`] =
    `dataplatform /api/performance/nav-timeseries ${short} (FINAL_NAV, NAV per unit in class currency, apex preferred; daily change = Apex distribution-aware net daily return from the previous valuation day, per class date); classes from /api/apex/funds (active)`;
  return { nav: { asOf, classes }, state: "fresh" };
}

/** Fund AUM (unitholder holdings total); a failed source keeps the previous AUM. */
export function buildAum(
  raw: RawPayloads,
  spec: FundSpec,
  prev: FundData | undefined,
  c: Ctx,
  base: string,
): { aum: FundData["aum"]; state: PartState } {
  const short = FUND_SOURCES[spec.key].dataplatform as DpShort;
  if (!raw.aum.ok || !raw.aum.data) {
    c.warn(
      `${base}.aum`,
      `AUM unavailable (${raw.aum.error ?? "not fetched"}); ${prev?.aum ? "previous AUM kept" : "no AUM shown"}`,
    );
    if (prev?.aum) c.prov[`${base}.aum`] = carriedNoteFor(c, base, "aum");
    return { aum: prev?.aum ?? null, state: prev?.aum ? "carried" : "none" };
  }
  const v = raw.aum.data.totals[short];
  if (v === undefined) {
    c.info(`${base}.aum`, `no AUM row for ${short}`);
    return { aum: null, state: "none" };
  }
  const asOf = raw.aum.data.snapshot_date ?? raw.fetchedAt.slice(0, 10);
  c.prov[`${base}.aum`] =
    `dataplatform /api/unitholders/aum group_by=short_name (sum of holding_value_cad, snapshot ${asOf}); fund total only`;
  return { aum: { cad: v, asOf }, state: "fresh" };
}
