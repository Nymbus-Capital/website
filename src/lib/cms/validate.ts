/**
 * Strict validation + sanitisation of the WordPress document. `parseCmsDocument` NEVER returns raw input: it builds a
 * new object from whitelisted fields, every string through sanitize.ts (plain text), every URL checked, every list
 * bounded. An item that is invalid is dropped (and reported) without taking the rest down; a document that is not
 * a schemaVersion 1 object is rejected as a whole (the caller keeps the last good one).
 * Dependency-free (unit tested under plain Node).
 */
import { safeHttpUrl, safeImageUrl, safeLinkedIn, plainLines, plainParagraphs, plainText } from "./sanitize.ts";
import {
  DEPARTMENTS, NEWS_CATEGORIES,
  type Bi, type CmsDepartment, type CmsDocument, type CmsNews, type CmsNewsCategory, type CmsTeamMember, type CmsTexts,
} from "./types.ts";

export const LIMITS = {
  news: 200, team: 100,
  title: 200, summary: 600, body: 20_000, name: 120, role: 160, bio: 5_000, listLines: 20, listLine: 200, text: 400, address: 300,
} as const;

export class CmsInvalidError extends Error {
  constructor(message: string) { super(message); this.name = "CmsInvalidError"; }
}

export interface ParseOptions {
  /** exact origin images may come from (https, or http on loopback in dev); null: no image is accepted */
  mediaOrigin: string | null;
  allowLoopbackHttp?: boolean;
}
export interface ParseResult { doc: CmsDocument; dropped: string[] }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const SLUG = /^[a-z0-9][a-z0-9-]{0,99}$/;

function bi(v: unknown, max: number, multiline = false): Bi {
  const o = isObj(v) ? v : {};
  const f = multiline ? plainParagraphs : plainText;
  return { en: f(o.en, max), fr: f(o.fr, max) };
}

function isoDate(v: unknown): string | null {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? null : v;
}

function parseNews(v: unknown, opts: ParseOptions): CmsNews | string {
  if (!isObj(v)) return "not an object";
  const id = typeof v.id === "string" ? v.id : "";
  if (!SLUG.test(id)) return "bad id";
  const date = isoDate(v.date);
  if (!date) return `${id}: bad date`;
  const title = bi(v.title, LIMITS.title);
  if (!title.en && !title.fr) return `${id}: no title`;
  const cat = typeof v.category === "string" ? v.category : "";
  const category: CmsNewsCategory = (NEWS_CATEGORIES as readonly string[]).includes(cat) ? (cat as CmsNewsCategory) : "community";
  return {
    id, date, category, title,
    summary: bi(v.summary, LIMITS.summary),
    body: bi(v.body, LIMITS.body, true),
    image: safeImageUrl(v.image, opts.mediaOrigin, opts),
    link: safeHttpUrl(v.link, opts),
  };
}

const isDept = (x: unknown): x is CmsDepartment => typeof x === "string" && (DEPARTMENTS as readonly string[]).includes(x);

function parseMember(v: unknown, opts: ParseOptions): CmsTeamMember | string {
  if (!isObj(v)) return "not an object";
  const id = typeof v.id === "string" ? v.id : "";
  if (!SLUG.test(id)) return "bad id";
  const name = plainText(v.name, LIMITS.name);
  if (!name) return `${id}: no name`;
  if (!isDept(v.department)) return `${id}: bad department`;
  const additional = (Array.isArray(v.additionalDepartments) ? v.additionalDepartments : []).filter(isDept).filter((d) => d !== v.department);
  const pr = isObj(v.previousRoles) ? v.previousRoles : {};
  const year = typeof v.yearJoined === "number" && Number.isInteger(v.yearJoined) && v.yearJoined >= 1900 && v.yearJoined <= 2100 ? v.yearJoined : null;
  const order = typeof v.order === "number" && Number.isFinite(v.order) ? Math.max(-100000, Math.min(100000, Math.trunc(v.order))) : 0;
  return {
    id, name,
    role: bi(v.role, LIMITS.role),
    bio: bi(v.bio, LIMITS.bio, true),
    department: v.department,
    additionalDepartments: [...new Set(additional)],
    designations: plainLines(v.designations, LIMITS.listLines, LIMITS.listLine),
    education: plainLines(v.education, LIMITS.listLines, LIMITS.listLine),
    previousRoles: { en: plainLines(pr.en, LIMITS.listLines, LIMITS.listLine), fr: plainLines(pr.fr, LIMITS.listLines, LIMITS.listLine) },
    yearJoined: year,
    photo: safeImageUrl(v.photo, opts.mediaOrigin, opts),
    linkedin: safeLinkedIn(v.linkedin),
    order,
  };
}

function biIfAny(v: unknown, max: number): Bi | undefined {
  const b = bi(v, max);
  return b.en || b.fr ? b : undefined;
}

const EMAIL = /^[^\s@<>"'()[\]\\,;:]+@[^\s@<>"'()[\]\\,;:]+\.[A-Za-z]{2,}$/;
const PHONE = /^[+0-9][0-9 ().\-]{3,30}$/;

function parseTexts(v: unknown): CmsTexts {
  const o = isObj(v) ? v : {};
  const t: CmsTexts = {};
  const headline = biIfAny(o.homeHeadline, LIMITS.text);
  if (headline) t.homeHeadline = headline;
  const sub = biIfAny(o.homeSubheadline, LIMITS.text);
  if (sub) t.homeSubheadline = sub;
  const aum = biIfAny(o.aumLabel, 60);
  if (aum) t.aumLabel = aum;
  const banner = biIfAny(o.banner, LIMITS.text);
  if (banner) t.banner = banner;
  const address = biIfAny(o.contactAddress, LIMITS.address);
  if (address) t.contactAddress = address;
  const email = plainText(o.contactEmail, 120);
  if (EMAIL.test(email)) t.contactEmail = email;
  const phone = plainText(o.contactPhone, 40);
  if (PHONE.test(phone)) t.contactPhone = phone;
  return t;
}

export function parseCmsDocument(raw: unknown, opts: ParseOptions): ParseResult {
  if (!isObj(raw)) throw new CmsInvalidError("document is not an object");
  if (raw.schemaVersion !== 1) throw new CmsInvalidError(`unsupported schemaVersion ${String(raw.schemaVersion).slice(0, 20)}`);
  if (!Array.isArray(raw.news) || !Array.isArray(raw.team)) throw new CmsInvalidError("news and team must be arrays");
  const dropped: string[] = [];

  const news: CmsNews[] = [];
  const seenNews = new Set<string>();
  for (const [i, x] of raw.news.slice(0, LIMITS.news).entries()) {
    const r = parseNews(x, opts);
    if (typeof r === "string") dropped.push(`news[${i}]: ${r}`);
    else if (seenNews.has(r.id)) dropped.push(`news[${i}]: duplicate id ${r.id}`);
    else { seenNews.add(r.id); news.push(r); }
  }
  if (raw.news.length > LIMITS.news) dropped.push(`news: ${raw.news.length - LIMITS.news} items over the limit`);
  // newest first, stable for equal dates
  news.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const team: CmsTeamMember[] = [];
  const seenTeam = new Set<string>();
  for (const [i, x] of raw.team.slice(0, LIMITS.team).entries()) {
    const r = parseMember(x, opts);
    if (typeof r === "string") dropped.push(`team[${i}]: ${r}`);
    else if (seenTeam.has(r.id)) dropped.push(`team[${i}]: duplicate id ${r.id}`);
    else { seenTeam.add(r.id); team.push(r); }
  }
  if (raw.team.length > LIMITS.team) dropped.push(`team: ${raw.team.length - LIMITS.team} members over the limit`);
  team.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  return { doc: { schemaVersion: 1, news, team, texts: parseTexts(raw.texts) }, dropped };
}
