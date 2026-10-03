/**
 * Team helpers for /team (pure, unit tested): department membership (a person can belong to several
 * departments), the "everyone" order of the previous site (by primary department), and structural counts
 * computed from src/data/team.ts (never typed by hand).
 */
import type { Department, TeamMember } from "../../../../data/team.ts";

export type DeptFilter = Department | "all";

/** Display order of the departments (previous site). */
export const DEPT_ORDER: readonly Department[] = ["Leadership", "Quantitative Research", "Investment Team", "Operations", "Board"];

export const inDept = (m: TeamMember, d: DeptFilter): boolean =>
  d === "all" || m.department === d || (m.additionalDepartments ?? []).includes(d);

/** Members of a department; "all" lists everyone by primary department, stable within a department. */
export function membersOf(members: readonly TeamMember[], d: DeptFilter): TeamMember[] {
  const list = members.filter((m) => inDept(m, d));
  if (d !== "all") return list;
  const rank = (m: TeamMember) => DEPT_ORDER.indexOf(m.department);
  return list.map((m, i) => ({ m, i })).sort((a, b) => rank(a.m) - rank(b.m) || a.i - b.i).map((x) => x.m);
}

/** People holding a designation or degree matching `re` (in designations or education, counted once). */
export function countHolding(members: readonly TeamMember[], re: RegExp): number {
  return members.filter((m) => [...(m.designations ?? []), ...(m.education ?? [])].some((d) => re.test(d))).length;
}

export const countPhD = (members: readonly TeamMember[]) => countHolding(members, /^PhD\b/i);
export const countCFA = (members: readonly TeamMember[]) => countHolding(members, /^CFA$/);

/** Two-letter (or three) initials as stored, never a duplicate-suffixed variant ("JL2" was a bug of the old site). */
export const initialsOf = (m: TeamMember): string => m.initials.replace(/\d+$/, "") || m.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 3);

/* ------------------------------------------------------------------ credentials (About page band, person badges) */

const quals = (m: TeamMember): string[] => [...(m.designations ?? []), ...(m.education ?? [])];

/** People with an engineering or computer-science degree (education lines only, never a job title). */
export const countEngineering = (members: readonly TeamMember[]) =>
  members.filter((m) => (m.education ?? []).some((d) => /engineering|computer science|génie|ingénierie|informatique/i.test(d))).length;

/** People holding a master's or doctoral degree (PhD, M.Sc., MBA). */
export const countGraduate = (members: readonly TeamMember[]) => countHolding(members, /^(PhD|M\.?\s?Sc|MBA)\b/i);

/** People holding the CFA charter or the CIM designation (counted once). */
export const countCharter = (members: readonly TeamMember[]) => countHolding(members, /^(CFA|CIM)$/);

/**
 * Combined years of experience stated in the team data. `plus` is true when the sum is a lower bound: a stated
 * figure is itself a lower bound ("+40 years") or somebody has no stated figure. null when nobody has one.
 */
export function combinedExperience(members: readonly TeamMember[]): { years: number; plus: boolean } | null {
  const known = members.filter((m) => typeof m.yearsExperience === "number" && m.yearsExperience > 0);
  if (!known.length) return null;
  const years = known.reduce((a, m) => a + (m.yearsExperience as number), 0);
  return { years, plus: known.length < members.length || known.some((m) => m.yearsExperiencePlus) };
}

const BADGES: { re: RegExp; en: string; fr: string; key?: boolean }[] = [
  { re: /^PhD\b/i, en: "PhD", fr: "Ph. D.", key: true },
  { re: /^CFA$/, en: "CFA", fr: "CFA", key: true },
  { re: /^CIM$/, en: "CIM", fr: "CIM", key: true },
  { re: /^CPA$/, en: "CPA", fr: "CPA" },
  { re: /^M\.?\s?Sc\b/i, en: "M.Sc.", fr: "M. Sc." },
  { re: /^MBA\b/i, en: "MBA", fr: "MBA" },
];

/** Short credential badges of a person (PhD, CFA, CIM, CPA, M.Sc., MBA), each once, key credentials first. */
export function badgesOf(m: TeamMember, lang: "en" | "fr"): { label: string; key: boolean }[] {
  const q = quals(m);
  return BADGES.filter((b) => q.some((d) => b.re.test(d))).map((b) => ({ label: b[lang], key: !!b.key }));
}
