// facts.ts — fund facts: risk level, headline / sorted NAV classes, NAV direction, managers and initials
import type { NavClass } from "../../../lib/data/types.ts";
import { isNum } from "./is-num.ts";

export const RISK_LEVELS = ["low", "low-medium", "medium", "medium-high", "high"] as const;
type RiskLevel = (typeof RISK_LEVELS)[number];
export const riskIndex = (r: string | null | undefined) => Math.max(0, RISK_LEVELS.indexOf((r ?? "low") as RiskLevel));

/** The class whose NAV headlines: the admin's choice, else the registry default, else the first class with a NAV. */
export function headlineClass(
  classes: NavClass[] | undefined | null,
  preferred: (string | null | undefined)[],
): NavClass | null {
  if (!classes?.length) return null;
  for (const code of preferred) {
    if (!code) continue;
    const hit = classes.find((c) => c.fundserv.toUpperCase() === code.toUpperCase());
    if (hit) return hit;
  }
  return classes.find((c) => isNum(c.nav)) ?? classes[0];
}

/** Direction of a daily NAV change (null / rounded-to-zero changes are flat). */
export function navDirection(changePct: number | null | undefined, decimals = 2): "up" | "down" | "flat" {
  if (!isNum(changePct)) return "flat";
  const r = +(changePct * 100).toFixed(decimals);
  return r > 0 ? "up" : r < 0 ? "down" : "flat";
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .trim();

/**
 * Portfolio managers named in the admin content, matched with the team registry (accents, case and
 * punctuation ignored). Unknown names are kept (shown without photo); blanks and duplicates are dropped.
 */
export function resolveManagers<T extends { name: string }>(
  names: string[] | undefined | null,
  team: readonly T[],
): { name: string; member: T | null }[] {
  const seen = new Set<string>();
  const out: { name: string; member: T | null }[] = [];
  for (const raw of names ?? []) {
    const name = (raw ?? "").trim();
    const key = norm(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const member = team.find((m) => norm(m.name) === key) ?? null;
    out.push({ name: member?.name ?? name, member });
  }
  return out;
}

/** Initials for an avatar without a photo ("Mathieu Poulin-Brière" → "MP"). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Series (NAV classes) sorted for the facts table: the headline class first, then by FundServ code. */
export function sortedClasses(classes: NavClass[] | undefined | null, headline: string | null | undefined): NavClass[] {
  const h = (headline ?? "").toUpperCase();
  return [...(classes ?? [])].sort((a, b) =>
    a.fundserv.toUpperCase() === h ? -1 : b.fundserv.toUpperCase() === h ? 1 : a.fundserv.localeCompare(b.fundserv),
  );
}
