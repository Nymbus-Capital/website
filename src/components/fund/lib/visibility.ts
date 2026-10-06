// visibility.ts — what the admin hid (stripped before the client) and which blocks render
import type { FundContent, FundData, PortfolioData } from "../../../lib/data/types.ts";
import { isNum } from "./is-num.ts";
import { calendarRows, riskWindows, trailingPeriods } from "./performance.ts";
import { hasDailyPortfolio } from "./portfolio.ts";

export type Block = "hero" | "trailing" | "growth" | "calendar" | "heatmap" | "risk" | "portfolio" | "facts" | "documents" | "distributions" | "disclosure";

/**
 * The fund data with every block the admin hid removed (null / empty), so hidden figures never cross the server →
 * client boundary and every consumer (header, badges, tabs, cards) sees the same thing. `hide.performance` removes
 * everything derived from the returns: trailing, monthly, growth, calendar and the risk statistics. The fund AUM is
 * kept only when the admin explicitly published it (`hide.aum === false`). Pure; never mutates its input.
 */
export function stripHidden<D extends Omit<FundData, "sourceName">>(data: D | null | undefined, content: Pick<FundContent, "hide"> | null | undefined): D | null {
  if (!data) return null;
  const h = content?.hide ?? {};
  const out: D = { ...data };
  if (h.performance) out.performance = null;
  else if (out.performance && (h.growth || h.calendar)) {
    out.performance = { ...out.performance, ...(h.growth ? { growth: [] } : {}), ...(h.calendar ? { calendar: [] } : {}) };
  }
  if (h.performance || h.risk) {
    out.risk = null;
    if ("risk3Y" in out) out.risk3Y = null;
  }
  if (h.nav) out.nav = null;
  if (h.aum !== false) out.aum = null;
  if (h.characteristics) out.characteristics = [];
  if (h.breakdowns) out.breakdowns = {};
  if (h.holdings) out.topHoldings = [];
  if (h.esg) out.esg = [];
  if ("portfolio" in out) out.portfolio = stripPortfolio(out.portfolio, h);
  if (h.distributions && "distributions" in out) out.distributions = null;
  return out;
}

/** The daily portfolio without the parts the admin hid (the same flags as the factsheet figures); null when nothing is left. */
function stripPortfolio(p: PortfolioData | null | undefined, h: NonNullable<FundContent["hide"]>): PortfolioData | null {
  if (!p) return null;
  const out: PortfolioData = {
    ...p,
    characteristics: h.characteristics ? [] : p.characteristics,
    // the number of securities is shown with the characteristics: hidden with them
    totals: h.characteristics && p.totals ? { ...p.totals, holdings: null } : p.totals,
    breakdowns: h.breakdowns ? {} : p.breakdowns,
    greenBondsWeight: h.breakdowns ? null : p.greenBondsWeight,
    topHoldings: h.holdings ? [] : p.topHoldings,
  };
  return hasDailyPortfolio(out) ? out : null;
}

/** Which blocks render: the data must exist and the admin must not have hidden it (hiding performance hides every returns-derived block). */
export function visibleBlocks(data: Omit<FundData, "sourceName"> | null, content: FundContent, docCount: number): Record<Block, boolean> {
  const h = content.hide ?? {};
  const perf = data?.performance ?? null;
  const has = (x: unknown[] | undefined | null) => !!x && x.length > 0;
  const riskOk = riskWindows([data?.risk, data?.risk3Y]).length > 0;
  const portfolio = !!data && (
    hasDailyPortfolio(stripPortfolio(data.portfolio, h)) ||
    (!h.characteristics && data.characteristics.some((c) => c.fund != null)) ||
    (!h.breakdowns && Object.values(data.breakdowns ?? {}).some((b) => has(b))) ||
    (!h.holdings && has(data.topHoldings)) ||
    (!h.esg && data.esg.some((c) => c.fund != null))
  );
  return {
    hero: true,
    trailing: !h.performance && trailingPeriods(perf?.trailing.fund).length > 0,
    growth: !h.performance && !h.growth && (perf?.growth.filter((p) => isNum(p.fund)).length ?? 0) > 1,
    calendar: !h.performance && !h.calendar && calendarRows(perf?.calendar).length > 0,
    heatmap: !h.performance && has(perf?.monthly),
    risk: !h.performance && !h.risk && riskOk,
    portfolio,
    facts: true,
    documents: docCount > 0,
    distributions: !h.distributions && (data?.distributions?.classes.length ?? 0) > 0,
    disclosure: true,
  };
}
