/**
 * Server → client props for the home page and the strategies index: plain JSON built from the read model
 * (getAllFundViews + getContent). Every figure comes from the published data; null means "not published",
 * and the UI then shows a "figures coming soon" state instead of a number.
 */
import type { FundView } from "@/lib/data/site";
import type { FundKey, L10n, NavClass, SiteContent } from "@/lib/data/types";

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
  basis: "net" | "gross";
  /** month-end of the last validated month */
  asOf: string | null;
  firstMonth: string | null;
  nav: { code: string; display: string; currency: string; nav: number; changePct: number | null; date: string | null } | null;
}

export interface HomeData {
  funds: FundCard[];
  aumLabel: L10n | null;
  /** the figures are the illustrative sample (never in production unless SHOW_SAMPLE_DATA=1) */
  sample: boolean;
  navAsOf: string | null;
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
    basis: perf?.basis ?? spec.sources.basis,
    asOf: perf?.asOf ?? null,
    firstMonth: perf?.firstMonth ?? null,
    nav: cls && isNum(cls.nav)
      ? { code: cls.fundserv, display: cls.display, currency: cls.currency, nav: cls.nav, changePct: isNum(cls.changePct) ? cls.changePct : null, date: cls.date }
      : null,
  };
}

export function toHomeData(views: FundView[], content: SiteContent): HomeData {
  const funds = views.map(toFundCard);
  const navDates = funds.map((f) => f.nav?.date).filter((d): d is string => !!d).sort();
  return {
    funds,
    aumLabel: content.firm.aumLabel ?? null,
    sample: views.some((v) => v.sample && v.data),
    navAsOf: navDates.length ? navDates[navDates.length - 1] : null,
  };
}
