/**
 * Admin issues of the third-party rankings (pure, unit tested): entries hidden because stale, drafts waiting for a
 * confirmation, incomplete confirmed entries, entries about to be hidden (30 days ahead), missing official Morningstar
 * assets, and the RBC survey check.
 */
import type { FundKey, SiteContent } from "../data/types.ts";
import type { BrandAssets } from "../data/brand-assets.ts";
import { fundLibraryStatus, lastShowDay, morningstarStatus, PROVIDER_META, thirdPartyStatus } from "./policy.ts";
import { rbcIssues, type RankingIssue, type RbcCheckState } from "./rbc-survey.ts";

export type { RankingIssue };

export const MORNINGSTAR_ASSETS_MISSING = "official Morningstar assets missing";

/** Morningstar asset slots still missing for the ratings entered (logo + the star image of each rating). */
export function missingMorningstarAssets(content: Pick<SiteContent, "funds">, brand: BrandAssets): string[] {
  const need = new Set<string>();
  for (const fc of Object.values(content.funds ?? {})) {
    const m = fc?.rankings?.morningstar;
    if (!m || fc?.hide?.rankings) continue;
    need.add("morningstar-logo");
    need.add(`morningstar-stars-${m.stars}`);
  }
  return [...need].filter((s) => !brand[s as keyof BrandAssets]).sort();
}

export function rankingIssues(
  content: Pick<SiteContent, "funds">,
  opts: { now: Date; months: number; brand: BrandAssets; rbc: RbcCheckState | null; classes?: Partial<Record<FundKey, { fundserv: string }[]>> },
): RankingIssue[] {
  const out: RankingIssue[] = [];
  const missing = missingMorningstarAssets(content, opts.brand);
  if (missing.length) {
    out.push({
      level: "warn", key: "rankings.morningstar.assets",
      message: `${MORNINGSTAR_ASSETS_MISSING}: ${missing.join(", ")}. The rating is shown as text. Add the official files to public/brand/third-party/ (svg or png) or upload them in Settings → third-party brand assets.`,
    });
  }
  for (const [key, fc] of Object.entries(content.funds ?? {}) as [FundKey, NonNullable<SiteContent["funds"][FundKey]>][]) {
    const r = fc?.rankings;
    if (!r || fc.hide?.rankings) continue;
    const classes = opts.classes?.[key];
    const m = r.morningstar;
    if (m) {
      const st = morningstarStatus(m, opts.now, opts.months);
      if (st === "stale") out.push({ level: "warn", key: `rankings.${key}.morningstar.stale`, message: `${key}: Morningstar rating as of ${m.asOf} is older than ${opts.months} months — hidden. Check the Morningstar page and update the rating and its date.` });
      if (st === "incomplete") out.push({ level: "warn", key: `rankings.${key}.morningstar.incomplete`, message: `${key}: Morningstar rating not shown (needs stars, class, as-of date and an https source link).` });
    }
    (r.fundLibrary ?? []).forEach((e, i) => {
      const st = fundLibraryStatus(e, opts.now, opts.months, classes);
      if (st === "stale") out.push({ level: "warn", key: `rankings.${key}.fundlibrary.${i}.stale`, message: `${key}: Fundata ranking ${e.fundserv ?? e.classLabel} as at ${e.asOf} is older than ${opts.months} months — hidden.` });
      if (st === "incomplete") out.push({ level: "warn", key: `rankings.${key}.fundlibrary.${i}.incomplete`, message: `${key}: Fundata ranking ${e.fundserv ?? e.classLabel} not shown (needs figures, an as-of date and an https source link).` });
    });
    (r.thirdParty ?? []).forEach((e, i) => {
      const name = PROVIDER_META[e.provider]?.name ?? e.provider;
      const st = thirdPartyStatus(e, opts.now, opts.months, classes);
      if (st === "draft") out.push({ level: "info", key: `rankings.${key}.tp.${i}.draft`, message: `${key}: ${name} ranking is a draft (hidden until confirmed with its source URL and as-of date).` });
      if (st === "incomplete") out.push({ level: "warn", key: `rankings.${key}.tp.${i}.incomplete`, message: `${key}: ${name} ranking is confirmed but incomplete — hidden (class, category EN/FR, as-of date, https source and a figure for every period are required).` });
      if (st === "stale") out.push({ level: "warn", key: `rankings.${key}.tp.${i}.stale`, message: `${key}: ${name} ranking (period ended ${e.asOf}) is older than ${opts.months} months — hidden since ${lastShowDay(e.asOf, opts.months)}. Enter the latest edition.` });
      if (st === "other-class") out.push({ level: "warn", key: `rankings.${key}.tp.${i}.class`, message: `${key}: ${name} ranking names FundServ ${e.fundserv}, which is not a class of this fund — hidden.` });
    });
  }
  const expiring = rankingExpiries(content, { now: opts.now, months: opts.months, classes: opts.classes }).filter((x) => x.phase === "expiring");
  for (const x of expiring) {
    out.push({ level: "warn", key: `rankings.${x.fund}.${x.kind}.${x.index}.expiring`, message: `${x.fund}: ${x.label} as of ${x.asOf} will be hidden after ${x.lastShowDay} (${x.daysLeft === 0 ? "today is the last day" : `in ${x.daysLeft} day${x.daysLeft === 1 ? "" : "s"}`}). Enter the newer edition or re-confirm it with its newer as-of date.` });
  }
  return [...out, ...rbcIssues(opts.rbc, content, opts.now)];
}

/** warn this many days before a ranking is hidden by the staleness limit */
export const EXPIRY_WARN_DAYS = 30;

export interface RankingExpiry {
  /** stable id (fund, entry, as-of date, phase): the alert posts each id once */
  id: string;
  fund: FundKey;
  kind: "morningstar" | "fundlibrary" | "tp";
  index: number;
  label: string;
  asOf: string;
  /** last day the entry is shown */
  lastShowDay: string;
  /** days from today to the last day shown (negative once hidden) */
  daysLeft: number;
  phase: "expiring" | "hidden";
}

const dayNum = (d: string): number => Math.round(Date.parse(`${d}T00:00:00Z`) / 86_400_000);
const TORONTO_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" });
/** calendar date in Toronto (the firm's day), YYYY-MM-DD */
const torontoDate = (t: Date): string => {
  const o: Record<string, string> = {};
  for (const p of TORONTO_DAY.formatToParts(t)) if (p.type !== "literal") o[p.type] = p.value;
  return `${o.year}-${o.month}-${o.day}`;
};

/**
 * Entries shown today whose last day is within `warnDays` ("expiring"), and complete entries the staleness limit hid
 * within the last `warnDays` days ("hidden"). Drafts, incomplete entries and funds with rankings hidden are ignored.
 */
export function rankingExpiries(
  content: Pick<SiteContent, "funds">,
  opts: { now: Date; months: number; warnDays?: number; classes?: Partial<Record<FundKey, { fundserv: string }[]>> },
): RankingExpiry[] {
  const warn = opts.warnDays ?? EXPIRY_WARN_DAYS;
  const today = dayNum(torontoDate(opts.now));
  const out: RankingExpiry[] = [];
  const consider = (fund: FundKey, kind: RankingExpiry["kind"], index: number, label: string, asOf: string, status: string): void => {
    if (status !== "shown" && status !== "stale") return;
    const last = lastShowDay(asOf, opts.months);
    if (!last) return;
    const left = dayNum(last) - today;
    const phase = status === "shown" ? (left <= warn ? "expiring" : null) : left < 0 && left >= -warn ? "hidden" : null;
    if (!phase) return;
    out.push({ id: `${fund}|${kind}|${label}|${asOf}|${phase}`, fund, kind, index, label, asOf, lastShowDay: last, daysLeft: left, phase });
  };
  for (const [key, fc] of Object.entries(content.funds ?? {}) as [FundKey, NonNullable<SiteContent["funds"][FundKey]>][]) {
    const r = fc?.rankings;
    if (!r || fc.hide?.rankings || fc.hidden) continue;
    const classes = opts.classes?.[key];
    if (r.morningstar) consider(key, "morningstar", 0, `Morningstar rating (${r.morningstar.classLabel || "class ?"})`, r.morningstar.asOf, morningstarStatus(r.morningstar, opts.now, opts.months));
    (r.fundLibrary ?? []).forEach((e, i) => consider(key, "fundlibrary", i, `Fundata ranking ${e.fundserv || e.classLabel || ""}`.trim(), e.asOf, fundLibraryStatus(e, opts.now, opts.months, classes)));
    (r.thirdParty ?? []).forEach((e, i) => consider(key, "tp", i, `${PROVIDER_META[e.provider]?.name ?? e.provider} ranking${e.edition ? ` ${e.edition}` : ""}${e.classLabel ? ` (${e.classLabel})` : ""}`, e.asOf, thirdPartyStatus(e, opts.now, opts.months, classes)));
  }
  return out.sort((a, b) => a.daysLeft - b.daysLeft || a.id.localeCompare(b.id));
}
