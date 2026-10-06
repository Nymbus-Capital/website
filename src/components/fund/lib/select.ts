/**
 * Which class / variant the page shows (pure, unit tested). Returns, growth, calendar years and risk statistics follow
 * the selected class (default F); the GMV variants (3 / 6 / 9 %) switch every figure. Nothing is borrowed from another
 * class: a class without its own series shows "coming soon" (`returnsSoon`), never the default class's numbers.
 */
import type { ClassInfo, ClassType, FundContent, FundData, NavClass, Performance, VariantData } from "../../../lib/data/types.ts";

type Data = Omit<FundData, "sourceName">;
export interface SpecLike {
  headlineClass: string | null;
  classes?: { fundserv: string; display: string; type?: "prospectus" | "om" }[];
  /** display order; `default` marks the variant selected when the data names none */
  variants?: { id: string; label: { en: string; fr: string }; default?: true }[];
}

interface ClassOption {
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
export function classType(code: string, spec: Pick<SpecLike, "classes">, content: Pick<FundContent, "classTypes"> | null | undefined): ClassType {
  const o = content?.classTypes?.[code];
  if (o === "prospectus" || o === "om") return o;
  return spec.classes?.find((c) => up(c.fundserv) === up(code))?.type ?? "none";
}

/**
 * The classes the visitor can pick: classes with a NAV, those with their own returns, and the registry's classes,
 * the default (headline) class first, then by FundServ code.
 */
export function classOptions(data: Data | null, spec: SpecLike, content: Pick<FundContent, "classTypes" | "headlineClass" | "hide"> | null | undefined): ClassOption[] {
  const map = new Map<string, ClassOption>();
  const add = (fundserv: string, display: string, currency: string | null, nav: NavClass | null): void => {
    const k = up(fundserv);
    const cur = map.get(k);
    if (cur) { if (nav && !cur.nav) cur.nav = nav; if (!cur.currency && currency) cur.currency = currency; return; }
    map.set(k, { fundserv, display, currency, nav, type: classType(fundserv, spec, content) });
  };
  for (const c of spec.classes ?? []) add(c.fundserv, c.display, null, null);
  for (const c of content?.hide?.nav ? [] : data?.nav?.classes ?? []) if (c.nav != null) add(c.fundserv, c.display, c.currency, c);
  for (const c of Object.values(data?.performanceByClass ?? {})) add(c.fundserv, c.display, null, null);
  for (const c of Object.values(data?.classInfo ?? {})) add(c.fundserv, c.display, c.currency, null);
  const head = up(defaultClassCode(data, spec, content));
  return [...map.values()].sort((a, b) => (up(a.fundserv) === head ? -1 : up(b.fundserv) === head ? 1 : a.fundserv.localeCompare(b.fundserv)));
}

/** FundServ code the page opens on: the admin's headline class, else the data's default class, else the registry's. */
export function defaultClassCode(data: Data | null, spec: Pick<SpecLike, "headlineClass">, content: Pick<FundContent, "headlineClass"> | null | undefined): string | null {
  return content?.headlineClass || spec.headlineClass || data?.defaultClass || null;
}

export interface Selection {
  /** FundServ code of the selected class (null: the fund has no classes to choose from) */
  classCode: string | null;
  /** id of the selected variant (null: no variants) */
  variant: string | null;
}

/**
 * Why the selected class shows no figure, when the pipeline says so: "young" (less than `minMonths` months since its
 * inception: regulatory minimum) or "currency" (a non-CAD series without distribution-aware returns).
 */
export type ClassNotice =
  | { kind: "young"; display: string; inception: string; minMonths: number }
  | { kind: "currency"; display: string; currency: string };

interface Picked {
  data: Data | null;
  /** the series shown is the selected class's own */
  returnsClass: string | null;
  /** the selected class has no series of its own: the page says "coming soon", never another class's figures */
  returnsSoon: boolean;
  /** class history shorter than 12 months: only the periods that exist, "since class inception" */
  shortRecord: boolean;
  /** why the selected class shows no figure (replaces "coming soon"), when known */
  notice?: ClassNotice | null;
}

/** Info of one class (inception, status) published by the pipeline, by FundServ code. */
export function classInfoOf(data: Data | null, code: string | null | undefined): ClassInfo | null {
  if (!data?.classInfo || !code) return null;
  return Object.values(data.classInfo).find((c) => up(c.fundserv) === up(code)) ?? null;
}

/** The notice of a class without figures (young / non-CAD), or null. */
function classNotice(data: Data | null, code: string | null | undefined): ClassNotice | null {
  const i = classInfoOf(data, code);
  if (!i) return null;
  if (i.status === "young" && i.inception) return { kind: "young", display: i.display, inception: i.inception, minMonths: i.minMonths ?? 12 };
  if (i.status === "currency" && i.currency) return { kind: "currency", display: i.display, currency: i.currency };
  return null;
}

/** Returns of the selected class: its own series only. */
function classReturns(data: Data, code: string, options: ClassOption[]): { performance: Performance; risk: Data["risk"]; risk3Y: Data["risk3Y"] } | null {
  const own = Object.values(data.performanceByClass ?? {}).find((c) => up(c.fundserv) === up(code));
  if (own) return { performance: own.performance, risk: own.risk, risk3Y: own.risk3Y };
  // datasets published before class series: the single series is the class it says it is (never another one)
  if (data.performanceByClass) return null;
  const opt = options.find((o) => up(o.fundserv) === up(code));
  const perf = data.performance;
  if (perf && opt && up(perf.returnClass) === up(opt.display)) return { performance: perf, risk: data.risk, risk3Y: data.risk3Y };
  return null;
}

/** Apply the selected variant, then the selected class, to the published data. Never mutates its input. */
export function pickData(data: Data | null, spec: SpecLike, content: FundContent | null | undefined, sel: Selection): Picked {
  if (!data) return { data: null, returnsClass: null, returnsSoon: false, shortRecord: false };
  let out: Data = { ...data };
  const v: VariantData | undefined = sel.variant && spec.variants?.length ? data.variants?.[sel.variant] : undefined;
  if (spec.variants?.length && sel.variant && !v) {
    // a variant that is not published: nothing of another variant is shown in its place
    out = { ...out, performance: null, risk: null, risk3Y: null, characteristics: [], breakdowns: {}, topHoldings: [], esg: [], portfolio: null };
    return { data: out, returnsClass: null, returnsSoon: true, shortRecord: false };
  }
  if (v) {
    out = {
      ...out, performance: v.performance, risk: v.risk, risk3Y: v.risk3Y, characteristics: v.characteristics, breakdowns: v.breakdowns,
      topHoldings: v.topHoldings, esg: v.esg, factsheetMonth: v.factsheetMonth,
      // the daily book is the default variant's: it never stands in for another variant's portfolio
      ...(sel.variant !== (data.defaultVariant ?? "6") ? { portfolio: null } : {}),
    };
  }
  if (spec.classes?.length && sel.classCode && !v) {
    const options = classOptions(data, spec, content);
    const r = classReturns(data, sel.classCode, options);
    if (!r) {
      out = { ...out, performance: null, risk: null, risk3Y: null };
      return { data: out, returnsClass: null, returnsSoon: true, shortRecord: false, notice: classNotice(data, sel.classCode) };
    }
    out = { ...out, performance: r.performance, risk: r.risk, risk3Y: r.risk3Y };
    return { data: out, returnsClass: sel.classCode, returnsSoon: false, shortRecord: !!r.performance.shortRecord };
  }
  return { data: out, returnsClass: null, returnsSoon: !out.performance, shortRecord: !!out.performance?.shortRecord };
}

/** What the page components need to show and change the selection (built by FundPage). */
export interface ClassCtx {
  options: ClassOption[];
  selected: string | null;
  select: (fundserv: string) => void;
  variant: string | null;
  selectVariant: (id: string) => void;
  /** the selected class / variant has no series of its own: "coming soon" */
  returnsSoon: boolean;
  /** the selected class has less than 12 months of history: "since series inception" */
  shortRecord: boolean;
  /** why the selected class shows no figure (young series, non-CAD series), when known */
  notice?: ClassNotice | null;
  /** inception date (first price of its current run) of the selected class, when published */
  inception?: string | null;
}

/**
 * The class the page opens on: the admin's / registry's headline class when it has its own returns; otherwise the data's
 * default class when it has returns (the pipeline's choice, register order), else the first class offered that has; when
 * no class has returns, the headline class. A page never opens on an empty performance block while another series has data.
 */
export function openingClass(data: Data | null, spec: SpecLike, content: FundContent | null | undefined, opts: ClassOption[]): string | null {
  const preferred = content?.headlineClass || spec.headlineClass || data?.defaultClass || null;
  const byClass = data?.performanceByClass;
  if (!byClass) return preferred ?? opts[0]?.fundserv ?? null;
  const has = (code: string | null | undefined): boolean => !!code && Object.values(byClass).some((c) => up(c.fundserv) === up(code));
  if (has(preferred)) return preferred;
  if (has(data?.defaultClass)) return data!.defaultClass!;
  return opts.find((o) => has(o.fundserv))?.fundserv ?? preferred ?? opts[0]?.fundserv ?? null;
}

/** Initial selection: the opening class (openingClass) and the default variant. */
export function initialSelection(data: Data | null, spec: SpecLike, content: FundContent | null | undefined): Selection {
  const opts = classOptions(data, spec, content);
  const code = spec.classes?.length ? openingClass(data, spec, content, opts) : null;
  const variant = spec.variants?.length
    ? (data?.defaultVariant && spec.variants.some((x) => x.id === data.defaultVariant) ? data.defaultVariant : (spec.variants.find((x) => x.default) ?? spec.variants[0]).id)
    : null;
  return { classCode: code && opts.some((o) => up(o.fundserv) === up(code)) ? opts.find((o) => up(o.fundserv) === up(code))!.fundserv : opts[0]?.fundserv ?? null, variant };
}
