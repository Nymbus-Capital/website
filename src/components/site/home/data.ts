/**
 * Server → client props for the home page, the strategies index and the solutions page: plain JSON built from
 * the read model (getAllFundViews + getContent). Every figure comes from the published data; null means "not
 * published", and the UI then omits it (cards) or leaves the cell blank (tables), never with a message. The returns
 * are one class's own series (the chosen class: lib/returns-class.ts), labelled with it, and the NAV is the same
 * class's when it has one. Internal fields (source names, fund AUM, snapshot pins) never reach these props.
 */
import type { FundView } from "@/lib/data/site";
import type { FundKey, NavClass, SiteContent } from "@/lib/data/types";
import { lastYears, latest, type YearBar } from "./figures.ts";
import { siAnnualized, trackMonths } from "../../fund/lib/performance.ts";
import { stripHidden } from "../../fund/lib/visibility.ts";
import { initialSelection, pickData } from "../../fund/lib/select.ts";
import { shownVariant } from "../../../config/funds.ts";
import type { L } from "@/lib/i18n/config";

type RiskRating = "low" | "low-medium" | "medium" | "medium-high" | "high";

export interface FundCard {
  key: FundKey;
  name: L;
  short: L;
  assetClass: L;
  tagline: L;
  description: L;
  vehicle: "fund" | "strategy";
  color: { solid: string; from: string; to: string };
  risk: RiskRating;
  /** FundServ code of the class shown (returns, else headline; null for strategies without a fund vehicle) */
  code: string | null;
  benchmark: L | null;
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
  nav: {
    code: string;
    display: string;
    currency: string;
    nav: number;
    changePct: number | null;
    date: string | null;
  } | null;
  /** class of the published returns ("F", "H", "FP"), derived from the class of their data; null when none */
  perfClass: string | null;
  /** the strategy variant of the returns shown (Global Minimum Volatility: "6% downside volatility"); null without variants */
  perfVariant: L | null;
}

export interface HomeData {
  funds: FundCard[];
  aumLabel: L | null;
  /** the figures are the illustrative sample (never in production unless SHOW_SAMPLE_DATA=1) */
  sample: boolean;
  /** month-end of the latest published performance across the funds */
  perfAsOf: string | null;
  /** people listed in src/data/team.ts (structural fact), null when not provided */
  teamSize: number | null;
  /** people with a doctorate listed in src/data/team.ts (structural fact), null when none */
  phdCount: number | null;
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

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
  const { spec, content } = v;
  // the class / variant shown, exactly as the fund page opens: the chosen class's own series (complete first), or
  // the default variant's own figures (GMV 3 / 6 / 9 %), always shown with its name
  // every block the admin hid is removed FIRST, exactly like the fund page (strategies/[slug]/page.tsx), so the card and
  // the page choose the same class; hidden figures never reach the props
  const data = stripHidden(v.data, content);
  const sel = initialSelection(data, spec, content);
  const picked = pickData(data, spec, content, sel);
  const perfData = stripHidden(picked.data, content);
  const variantId = spec.variants?.length ? sel.variant : null;
  const perf = perfData?.performance ?? null;
  const si = perf?.trailing.fund.SI;
  const ytd = perf?.trailing.fund.YTD;
  const y1 = perf?.trailing.fund["1Y"];
  // the NAV of the class whose returns are shown, when it has one (never another class's NAV next to them)
  const cls = pickClass(data?.nav?.classes, [picked.returnsClass, content.headlineClass, spec.headlineClass]);
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
    code: picked.returnsClass ?? content.headlineClass ?? spec.headlineClass,
    benchmark: spec.benchmark,
    si: isNum(si) ? si : null,
    siAnnualized: perf ? siAnnualized(perf.firstMonth, perf.asOf) : true,
    ytd: isNum(ytd) ? ytd : null,
    // a 1-year figure needs 12 months of track record
    y1: isNum(y1) && perf && trackMonths(perf.firstMonth, perf.asOf) >= 12 ? y1 : null,
    calendar: perf ? lastYears(perf.calendar, 6, perf.asOf) : [],
    basis: perf?.basis ?? spec.sources.basis,
    asOf: perf?.asOf ?? null,
    firstMonth: perf?.firstMonth ?? null,
    minInvestment: content.minInvestment?.trim() || null,
    nav:
      cls && isNum(cls.nav)
        ? {
            code: cls.fundserv,
            display: cls.display,
            currency: cls.currency,
            nav: cls.nav,
            changePct: isNum(cls.changePct) ? cls.changePct : null,
            date: cls.date,
          }
        : null,
    perfClass: perf?.returnClass ?? null,
    // the published returns of a strategy with variants are its default variant's (the figures above): always named
    perfVariant: perf && variantId ? (shownVariant(spec, variantId)?.name ?? null) : null,
  };
}

export function toHomeData(
  views: FundView[],
  content: SiteContent,
  extras: { teamSize?: number | null; phdCount?: number | null } = {},
): HomeData {
  const funds = views.map(toFundCard);
  const label = content.firm.aumLabel;
  return {
    funds,
    aumLabel: label && (label.en?.trim() || label.fr?.trim()) ? label : null,
    sample: views.some((v) => v.sample && v.data),
    perfAsOf: latest(funds.map((f) => f.asOf)),
    teamSize: typeof extras.teamSize === "number" && extras.teamSize > 0 ? extras.teamSize : null,
    phdCount: typeof extras.phdCount === "number" && extras.phdCount > 0 ? extras.phdCount : null,
  };
}
