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
