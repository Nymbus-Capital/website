/**
 * Which class / variant the page shows (pure, unit tested). Returns, growth, calendar years and risk statistics are
 * always one class's own series, labelled with that class: the selected class when it can show returns, else the
 * chosen class (returns-class.ts: the preferred class when complete, else the most complete one). A class that cannot
 * show returns (young, non-CAD, no series) still shows its NAV; the page never says figures are missing.
 */
import type {
  ClassInfo,
  ClassType,
  FundContent,
  FundData,
  NavClass,
  Performance,
  VariantData,
} from "../../../lib/data/types.ts";
import { chosenReturnsClass, hasMinHistory, ownSeries, showsReturns } from "./returns-class.ts";

type Data = Omit<FundData, "sourceName">;
export interface SpecLike {
  headlineClass: string | null;
  /** the headline class's returns are shown whenever it has a headline figure, even with a shorter history */
  preferHeadlineReturns?: boolean;
  classes?: { fundserv: string; display: string; type?: "prospectus" | "om" }[];
  /** display order; `default` marks the variant selected when the data names none */
  variants?: { id: string; label: { en: string; fr: string }; default?: true }[];
}

export interface ClassOption {
  fundserv: string;
  display: string;
  currency: string | null;
  /** the class's NAV row, when it has one */
  nav: NavClass | null;
  /** prospectus / offering memorandum class; "none" when the type is not known (nothing is said) */
  type: ClassType;
}

const up = (s: string | null | undefined): string => (s ?? "").toUpperCase();

/** Type of a class: the admin's choice, else the registry's, else unknown ("none"). */
export function classType(
  code: string,
  spec: Pick<SpecLike, "classes">,
  content: Pick<FundContent, "classTypes"> | null | undefined,
): ClassType {
  const o = content?.classTypes?.[code];
  if (o === "prospectus" || o === "om") return o;
  return spec.classes?.find((c) => up(c.fundserv) === up(code))?.type ?? "none";
}

/**
 * The classes the visitor can pick: classes with a NAV, those with their own returns, and the registry's classes,
 * the default (headline) class first, then by FundServ code.
 */
export function classOptions(
  data: Data | null,
  spec: SpecLike,
  content: Pick<FundContent, "classTypes" | "headlineClass" | "hide"> | null | undefined,
): ClassOption[] {
  const map = new Map<string, ClassOption>();
  const add = (fundserv: string, display: string, currency: string | null, nav: NavClass | null): void => {
    const k = up(fundserv);
    const cur = map.get(k);
    if (cur) {
      if (nav && !cur.nav) cur.nav = nav;
      if (!cur.currency && currency) cur.currency = currency;
      return;
    }
    map.set(k, { fundserv, display, currency, nav, type: classType(fundserv, spec, content) });
  };
  for (const c of spec.classes ?? []) add(c.fundserv, c.display, null, null);
  for (const c of content?.hide?.nav ? [] : (data?.nav?.classes ?? []))
    if (c.nav != null) add(c.fundserv, c.display, c.currency, c);
  for (const c of Object.values(data?.performanceByClass ?? {})) add(c.fundserv, c.display, null, null);
  for (const c of Object.values(data?.classInfo ?? {})) add(c.fundserv, c.display, c.currency, null);
  const head = up(defaultClassCode(data, spec, content));
  return [...map.values()].sort((a, b) =>
    up(a.fundserv) === head ? -1 : up(b.fundserv) === head ? 1 : a.fundserv.localeCompare(b.fundserv),
  );
}

/** FundServ code the page opens on: the admin's headline class, else the data's default class, else the registry's. */
export function defaultClassCode(
  data: Data | null,
  spec: Pick<SpecLike, "headlineClass">,
  content: Pick<FundContent, "headlineClass"> | null | undefined,
): string | null {
  return content?.headlineClass || spec.headlineClass || data?.defaultClass || null;
}

export interface Selection {
  /** FundServ code of the selected class (null: the fund has no classes to choose from) */
  classCode: string | null;
  /** id of the selected variant (null: no variants) */
  variant: string | null;
}

interface Picked {
  data: Data | null;
  /** FundServ code of the class whose own series is shown (null: no class series, or none shown) */
  returnsClass: string | null;
  /** class history shorter than 12 months: only the periods that exist, "since class inception" */
  shortRecord: boolean;
}

/** Info of one class (inception, status) published by the pipeline, by FundServ code. */
export function classInfoOf(data: Data | null, code: string | null | undefined): ClassInfo | null {
  if (!data?.classInfo || !code) return null;
  return Object.values(data.classInfo).find((c) => up(c.fundserv) === up(code)) ?? null;
}

/**
 * The classes the visitor can pick (NAV card): every class with a NAV (its returns may come from the chosen class)
 * and every class that shows returns of its own. A class with neither is not offered.
 */
export function selectableClasses(
  data: Data | null,
  spec: SpecLike,
  content: Pick<FundContent, "classTypes" | "headlineClass" | "hide"> | null | undefined,
): ClassOption[] {
  return classOptions(data, spec, content).filter((o) => o.nav || showsReturns(data, o.fundserv));
}

/**
 * Variants offered: the published ones (data.variants); data without a variant map (older datasets) carries only the
 * default variant's figures, so only the default is offered.
 */
export function offeredVariants<V extends { id: string; default?: true }>(
  variants: V[] | undefined,
  data: Pick<Data, "variants" | "defaultVariant"> | null | undefined,
): V[] {
  if (!variants?.length) return [];
  const pub = data?.variants;
  if (pub) return variants.filter((v) => !!pub[v.id]?.performance);
  const def = data?.defaultVariant ?? variants.find((v) => v.default)?.id ?? variants[0].id;
  return variants.filter((v) => v.id === def);
}

/** The variant shown: the requested one when offered, else the data's default, else the registry's, else the first. */
function shownVariantId<V extends { id: string; default?: true }>(
  offered: V[],
  data: Pick<Data, "defaultVariant"> | null | undefined,
  wanted: string | null | undefined,
): string | null {
  if (!offered.length) return null;
  if (wanted && offered.some((x) => x.id === wanted)) return wanted;
  if (data?.defaultVariant && offered.some((x) => x.id === data.defaultVariant)) return data.defaultVariant;
  return (offered.find((x) => x.default) ?? offered[0]).id;
}

/** The series under its entry's class label (the published label of another code is dropped). */
function relabel(perf: Performance, display: string): Performance {
  const { returnClassLabel: _label, ...rest } = perf;
  return { ...rest, returnClass: display };
}

/** No performance figure at all for a series with less than 12 months (regulatory minimum). */
function withMinHistory(out: Data): Data {
  return out.performance && !hasMinHistory(out.performance)
    ? { ...out, performance: null, risk: null, risk3Y: null }
    : out;
}

/** Apply the selected variant, then the selected class, to the published data. Never mutates its input. */
export function pickData(
  data: Data | null,
  spec: SpecLike,
  content: FundContent | null | undefined,
  sel: Selection,
): Picked {
  if (!data) return { data: null, returnsClass: null, shortRecord: false };
  let out: Data = { ...data };
  const offered = offeredVariants(spec.variants, data);
  // a variant that is not published is never offered: the default (published) one is shown instead
  const variantId = spec.variants?.length ? shownVariantId(offered, data, sel.variant) : null;
  const v: VariantData | undefined = variantId ? data.variants?.[variantId] : undefined;
  if (spec.variants?.length && data.variants && !v) {
    // no published variant: nothing of another variant is shown in its place (no figure, no message)
    out = {
      ...out,
      performance: null,
      risk: null,
      risk3Y: null,
      characteristics: [],
      breakdowns: {},
      topHoldings: [],
      esg: [],
      portfolio: null,
    };
    return { data: out, returnsClass: null, shortRecord: false };
  }
  if (v) {
    out = {
      ...out,
      performance: v.performance,
      risk: v.risk,
      risk3Y: v.risk3Y,
      characteristics: v.characteristics,
      breakdowns: v.breakdowns,
      topHoldings: v.topHoldings,
      esg: v.esg,
      factsheetMonth: v.factsheetMonth,
      // the daily book is the default variant's: it never stands in for another variant's portfolio
      ...(variantId !== (data.defaultVariant ?? "6") ? { portfolio: null } : {}),
    };
  }
  if (spec.classes?.length && !v) {
    // the selected class's own series when it has one to show, else the chosen class's (labelled with its class)
    const code =
      sel.classCode && showsReturns(data, sel.classCode) ? sel.classCode : chosenReturnsClass(data, spec, content);
    const perf = code ? ownSeries(data, code) : null;
    if (!code || !perf) {
      out = { ...out, performance: null, risk: null, risk3Y: null };
      return { data: out, returnsClass: null, shortRecord: false };
    }
    const own = Object.values(data.performanceByClass ?? {}).find((c) => up(c.fundserv) === up(code));
    // the label names the class whose own series this is (its entry), whatever the series metadata says
    const labelled = own && up(perf.returnClass) !== up(own.display) ? relabel(perf, own.display) : perf;
    out = {
      ...out,
      performance: labelled,
      risk: own ? own.risk : data.risk,
      risk3Y: own ? own.risk3Y : data.risk3Y,
    };
    return { data: withMinHistory(out), returnsClass: code, shortRecord: false };
  }
  out = withMinHistory(out);
  return { data: out, returnsClass: null, shortRecord: !!out.performance?.shortRecord };
}

/** What the page components need to show and change the selection (built by FundPage). */
export interface ClassCtx {
  options: ClassOption[];
  selected: string | null;
  select: (fundserv: string) => void;
  variant: string | null;
  selectVariant: (id: string) => void;
  /** FundServ code of the class whose returns are shown (may differ from `selected`: then they carry their own label) */
  returnsClass?: string | null;
  /** prospectus / offering memorandum type of the class whose returns are shown */
  returnsType?: ClassType | null;
  /** the selected class has less than 12 months of history: "since series inception" */
  shortRecord: boolean;
  /** inception date (first price of its current run) of the selected class, when published */
  inception?: string | null;
}

/**
 * The class the page opens on: the chosen returns class (returns-class.ts), else the preferred class, else the first
 * class offered. A page never opens on a class without figures while another class has them.
 */
export function openingClass(
  data: Data | null,
  spec: SpecLike,
  content: FundContent | null | undefined,
  opts: ClassOption[],
): string | null {
  const chosen = chosenReturnsClass(data, spec, content);
  if (chosen) return chosen;
  return content?.headlineClass || spec.headlineClass || data?.defaultClass || opts[0]?.fundserv || null;
}

/** Initial selection: the opening class (openingClass) and the default (published) variant. */
export function initialSelection(
  data: Data | null,
  spec: SpecLike,
  content: FundContent | null | undefined,
): Selection {
  const opts = selectableClasses(data, spec, content);
  const code = spec.classes?.length ? openingClass(data, spec, content, opts) : null;
  const variant = spec.variants?.length
    ? (shownVariantId(offeredVariants(spec.variants, data), data, null) ??
      (spec.variants.find((x) => x.default) ?? spec.variants[0]).id)
    : null;
  return {
    classCode:
      code && opts.some((o) => up(o.fundserv) === up(code))
        ? opts.find((o) => up(o.fundserv) === up(code))!.fundserv
        : (opts[0]?.fundserv ?? null),
    variant,
  };
}
