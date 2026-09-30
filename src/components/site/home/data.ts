/**
 * Server → client props for the home page, the strategies index and the solutions page: plain JSON built from
 * the read model (getAllFundViews + getContent). Every figure comes from the published data; null means "not
 * published", and the UI then shows a "figures coming soon" state (cards) or an em dash (tables) instead of a
 * number. Internal fields (source names, fund AUM, snapshot pins) never reach these props.
 */
import type { FundView } from "@/lib/data/site";
import type { FundKey, L10n, NavClass, SiteContent } from "@/lib/data/types";
import { lastYears, latest, type YearBar } from "./figures.ts";

export type RiskRating = "low" | "low-medium" | "medium" | "medium-high" | "high";

export interface FundCard {
  key: FundKey;
  name: L10n;
  short: L10n;
  assetClass: L10n;
  tagline: L10n;
  description: L10n;
  vehicle: "fund" | "strategy";
  color: { solid: string; from: string; to: string };
  risk: RiskRating;
  /** FundServ code of the headline class (null for strategies without a fund vehicle) */
  code: string | null;
  benchmark: L10n | null;
  /** since-inception return (decimal), annualized when the record is at least 12 months */
  si: number | null;
  siAnnualized: boolean;
  /** year-to-date and 1-year returns (decimal), null when not published */
  ytd: number | null;
  y1: number | null;
  /** last calendar years with a published fund return, oldest first (empty when hidden or not published) */
  calendar: YearBar[];
  basis: "net" | "gross";
  /** month-end of the last validated month */
  asOf: string | null;
  firstMonth: string | null;
  /** minimum investment as entered in the admin (free text), null when not provided */
  minInvestment: string | null;
  nav: { code: string; display: string; currency: string; nav: number; changePct: number | null; date: string | null } | null;
}

export interface HomeData {
  funds: FundCard[];
  aumLabel: L10n | null;
  /** the figures are the illustrative sample (never in production unless SHOW_SAMPLE_DATA=1) */
  sample: boolean;
  navAsOf: string | null;
  /** month-end of the latest published performance across the funds */
  perfAsOf: string | null;
  /** people listed in src/data/team.ts (structural fact), null when not provided */
  teamSize: number | null;
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function monthsBetween(a: string, b: string): number {
  return (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7));
}

function pickClass(classes: NavClass[] | undefined, preferred: (string | null | undefined)[]): NavClass | null {
  if (!classes?.length) return null;
  for (const code of preferred) {
    if (!code) continue;
    const hit = classes.find((c) => c.fundserv.toUpperCase() === code.toUpperCase() && isNum(c.nav));
    if (hit) return hit;
  }
  return classes.find((c) => isNum(c.nav)) ?? null;
}

export function toFundCard(v: FundView): FundCard {
  const { spec, content, data } = v;
  const hide = content.hide ?? {};
  const perf = hide.performance ? null : data?.performance ?? null;
  const si = perf?.trailing.fund.SI;
  const ytd = perf?.trailing.fund.YTD;
  const y1 = perf?.trailing.fund["1Y"];
  const cls = hide.nav ? null : pickClass(data?.nav?.classes, [content.headlineClass, spec.headlineClass]);
  return {
    key: spec.key,
    name: spec.name,
    short: spec.short,
    assetClass: spec.assetClass,
    tagline: content.tagline ?? spec.defaults.tagline,
    description: content.description ?? spec.defaults.description,
    vehicle: spec.vehicle,
    color: spec.color,
    risk: content.riskRating ?? spec.defaults.riskRating,
    code: content.headlineClass ?? spec.headlineClass,
    benchmark: spec.benchmark,
    si: isNum(si) ? si : null,
    siAnnualized: perf ? monthsBetween(perf.firstMonth, perf.asOf) >= 12 : true,
    ytd: isNum(ytd) ? ytd : null,
    // a 1-year figure needs 12 months of track record
    y1: isNum(y1) && perf && monthsBetween(perf.firstMonth, perf.asOf) >= 11 ? y1 : null,
    calendar: perf && !hide.calendar ? lastYears(perf.calendar, 6) : [],
    basis: perf?.basis ?? spec.sources.basis,
    asOf: perf?.asOf ?? null,
    firstMonth: perf?.firstMonth ?? null,
    minInvestment: content.minInvestment?.trim() || null,
    nav: cls && isNum(cls.nav)
      ? { code: cls.fundserv, display: cls.display, currency: cls.currency, nav: cls.nav, changePct: isNum(cls.changePct) ? cls.changePct : null, date: cls.date }
      : null,
  };
}

export function toHomeData(views: FundView[], content: SiteContent, extras: { teamSize?: number | null } = {}): HomeData {
  const funds = views.map(toFundCard);
  const label = content.firm.aumLabel;
  return {
    funds,
    aumLabel: label && (label.en?.trim() || label.fr?.trim()) ? label : null,
    sample: views.some((v) => v.sample && v.data),
    navAsOf: latest(funds.map((f) => f.nav?.date)),
    perfAsOf: latest(funds.map((f) => f.asOf)),
    teamSize: typeof extras.teamSize === "number" && extras.teamSize > 0 ? extras.teamSize : null,
  };
}
