// nav.ts — NAV and AUM gates (a failing value is dropped or the previous one kept)
import type { FundData, Issue, NavClass } from "../../data/types.ts";
import { TOL } from "../config.ts";
import { pct } from "../format.ts";
import { days } from "./helpers.ts";

/**
 * NAV gates per class: the day change (administrator return when available) AND the plain price ratio
 * vs the previous valuation AND vs the previously published NAV of the class must stay within ±10 %.
 * A failing class is dropped (previous published value kept if any) with an error issue (run blocked).
 */
export function checkNav(
  f: FundData,
  prev: FundData | undefined,
  base: string,
  repairs: Issue[],
  warnings: Issue[],
  now: Date,
): void {
  if (!f.nav) return;
  const kept: NavClass[] = [];
  const lim = TOL.maxNavDayChange;
  for (const k of f.nav.classes) {
    const old = prev?.nav?.classes.find((c) => c.fundserv === k.fundserv);
    const reasons: string[] = [];
    if (k.nav === null || !Number.isFinite(k.nav) || k.nav <= 0) reasons.push(`invalid NAV ${k.nav}`);
    else {
      if (k.changePct !== null && (!Number.isFinite(k.changePct) || Math.abs(k.changePct) > lim))
        reasons.push(`daily return ${Number.isFinite(k.changePct) ? pct(k.changePct) : "invalid"}`);
      if (
        k.prevNav !== null &&
        (!Number.isFinite(k.prevNav) || k.prevNav <= 0 || Math.abs(k.nav / k.prevNav - 1) > lim)
      )
        reasons.push(
          `NAV ${k.nav} vs ${k.prevNav} on ${k.prevDate ?? "previous valuation"} (${Number.isFinite(k.prevNav) && k.prevNav > 0 ? pct(k.nav / k.prevNav - 1) : "invalid"})`,
        );
      if (old?.nav && old.nav > 0 && old.date !== k.date && Math.abs(k.nav / old.nav - 1) > lim)
        reasons.push(`NAV ${k.nav} vs published ${old.nav} (${old.date}, ${pct(k.nav / old.nav - 1)})`);
    }
    if (reasons.length) {
      repairs.push({
        key: `${base}.nav.${k.fundserv}`,
        level: "error",
        message: `NAV ${k.display} (${k.fundserv}) ${k.date}: ${reasons.join("; ")} exceeds ±${lim * 100}%; ${old ? `previous value (${old.date}) kept` : "class not shown"}`,
      });
      if (old) kept.push(old);
      continue;
    }
    kept.push(k);
    if (k.date && days(k.date, now) > TOL.navStaleDays)
      warnings.push({
        key: `${base}.nav.${k.fundserv}`,
        level: "error",
        message: `stale: NAV ${k.display} (${k.fundserv}) dated ${k.date} is older than ${TOL.navStaleDays} days`,
      });
  }
  f.nav.classes = kept;
  if (!kept.length) f.nav = null;
  else
    f.nav.asOf =
      kept
        .map((k) => k.date ?? "")
        .sort()
        .pop() || null;
}

/** AUM must be a non-negative amount (else previous kept); stale snapshot warning. */
export function checkAum(
  f: FundData,
  prev: FundData | undefined,
  base: string,
  repairs: Issue[],
  warnings: Issue[],
  now: Date,
): void {
  if (!f.aum) return;
  if (typeof f.aum.cad !== "number" || !Number.isFinite(f.aum.cad) || f.aum.cad < 0) {
    repairs.push({
      key: `${base}.aum`,
      level: "error",
      message: `AUM ${f.aum.cad} is not a valid amount; ${prev?.aum ? `previous (${prev.aum.asOf}) kept` : "not shown"}`,
    });
    f.aum = prev?.aum && Number.isFinite(prev.aum.cad) && prev.aum.cad >= 0 ? prev.aum : null;
    return;
  }
  if (days(f.aum.asOf, now) > TOL.navStaleDays)
    warnings.push({
      key: `${base}.aum`,
      level: "error",
      message: `stale: AUM snapshot ${f.aum.asOf} is older than ${TOL.navStaleDays} days`,
    });
}
