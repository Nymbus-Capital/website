/**
 * The website's built-in team and news as a `wp nymbus import` document (format "nymbus-site-import", version 1),
 * used once when WordPress goes live (wordpress/scripts/import-from-site.mjs, wordpress/README.md). Pure and
 * dependency-free (unit tested under plain Node): relative imports with explicit `.ts`, erasable TypeScript only.
 */
import type { TeamMember } from "../../data/team.ts";
import type { NewsItem } from "../../components/site/home/news.ts";
import { DEPARTMENTS, type Bi, type CmsDepartment, type CmsNewsCategory } from "./types.ts";

export interface ImportPerson {
  slug: string;
  name: string;
  department: CmsDepartment;
  additionalDepartments: CmsDepartment[];
  order: number;
  role: Bi;
  bio: Bi;
  previousRoles: { en: string[]; fr: string[] };
  designations: string[];
  education: string[];
  yearJoined: number | null;
  linkedin: string | null;
  photo: string | null;
}
export interface ImportNews { slug: string; date: string; category: CmsNewsCategory; title: Bi; summary: Bi; body: Bi; link: null; image: null }
export interface ImportDocument { format: "nymbus-site-import"; version: 1; news: ImportNews[]; team: ImportPerson[] }

/** "Léana D’Imperio" → "leana-d-imperio" (the WordPress slug). */
export function slugOf(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Absolute https photo URL resolved against the website address, or null (no site given, not https). */
export function photoUrl(photo: string | undefined, siteUrl: string | null): string | null {
  if (!photo || !siteUrl) return null;
  try {
    const u = new URL(photo, siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`);
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

const isDept = (d: string): d is CmsDepartment => (DEPARTMENTS as readonly string[]).includes(d);

/**
 * The import document. Team order: 10, 20, 30… in the order of the built-in list, so the website shows people exactly
 * as today; the gaps let editors slip someone in between (e.g. 25).
 */
export function buildImport(team: TeamMember[], news: NewsItem[], siteUrl: string | null = null): ImportDocument {
  const people = team.map((m, i): ImportPerson => {
    if (!isDept(m.department)) throw new Error(`${m.name}: unknown department ${m.department}`);
    return {
      slug: slugOf(m.name),
      name: m.name,
      department: m.department,
      additionalDepartments: (m.additionalDepartments ?? []).filter((d): d is CmsDepartment => isDept(d) && d !== m.department),
      order: (i + 1) * 10,
      role: { en: m.title ?? "", fr: m.titleFr ?? "" },
      bio: { en: m.bio ?? "", fr: m.bioFr ?? "" },
      previousRoles: { en: m.previousRoles ?? [], fr: m.previousRolesFr ?? [] },
      designations: m.designations ?? [],
      education: m.education ?? [],
      yearJoined: typeof m.yearJoined === "number" && Number.isInteger(m.yearJoined) ? m.yearJoined : null,
      linkedin: m.linkedin ?? null,
      photo: photoUrl(m.photo, siteUrl),
    };
  });
  const items = news.map((n): ImportNews => ({ slug: n.id, date: n.date, category: n.category, title: n.title, summary: n.summary, body: n.body, link: null, image: null }));
  return { format: "nymbus-site-import", version: 1, news: items, team: people };
}
