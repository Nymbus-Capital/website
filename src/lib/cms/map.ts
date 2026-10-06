/**
 * Pure mapping from the validated CMS document to the shapes the pages already use (TeamMember of src/data/team.ts,
 * the news item of the home page) and the precedence of the editable texts. Dependency-free (unit tested).
 */
import type { TeamMember } from "../../data/team.ts";
import type { SiteContent } from "../data/types.ts";
import type { Bi, CmsNews, CmsPageIntro, CmsTeamMember, CmsTexts } from "./types.ts";

/** A news item as the pages render it (superset of the home page's NewsItem). */
export interface NewsEntry {
  id: string;
  date: string;
  category: CmsNews["category"];
  title: Bi;
  summary: Bi;
  body: Bi;
  image: string | null;
  link: string | null;
}

export const toNewsEntry = (n: CmsNews): NewsEntry => ({ id: n.id, date: n.date, category: n.category, title: n.title, summary: n.summary, body: n.body, image: n.image, link: n.link });

const PALETTE = ["#0b57d0", "#1a73e8", "#0277bd", "#0b8fd6", "#188038", "#5b6cff", "#c2410c", "#7a3fd1"];

/** "Jean-Luc Landry" → "JL" (first letters of the first two words, upper case). */
export function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const s = (parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2)).toUpperCase();
  return s || "?";
}

/** Stable colour from the name (the CMS does not carry one). */
export function colorOf(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const orUndef = <T>(a: T[]): T[] | undefined => (a.length ? a : undefined);

export function toTeamMember(c: CmsTeamMember): TeamMember {
  return {
    name: c.name,
    title: c.role.en || c.role.fr,
    titleFr: c.role.fr || undefined,
    department: c.department,
    additionalDepartments: orUndef(c.additionalDepartments),
    bio: c.bio.en || c.bio.fr,
    bioFr: c.bio.fr || undefined,
    education: orUndef(c.education),
    designations: orUndef(c.designations),
    previousRoles: orUndef(c.previousRoles.en.length ? c.previousRoles.en : c.previousRoles.fr),
    previousRolesFr: orUndef(c.previousRoles.fr),
    yearJoined: c.yearJoined ?? undefined,
    initials: initialsOf(c.name),
    color: colorOf(c.name),
    photo: c.photo ?? undefined,
    linkedin: c.linkedin ?? undefined,
  };
}

const hasText = (b: { en?: string; fr?: string } | null | undefined): boolean => !!(b && (b.en?.trim() || b.fr?.trim()));
const fill = (b: Bi): Bi => ({ en: b.en || b.fr, fr: b.fr || b.en });

/**
 * Editable texts precedence (one source of truth per text): a value saved in the website admin (`stored`, the raw
 * file, defaults NOT merged in) always wins; otherwise the WordPress text; otherwise the built-in default already in
 * `content`. Applies to the AUM label and the announcement banner only. Never mutates its inputs.
 */
export function overlayTexts(content: SiteContent, stored: SiteContent | null, texts: CmsTexts): SiteContent {
  const firm = { ...content.firm };
  if (!hasText(stored?.firm?.aumLabel) && texts.aumLabel && hasText(texts.aumLabel)) firm.aumLabel = fill(texts.aumLabel);
  if (!hasText(stored?.firm?.announcement) && texts.banner && hasText(texts.banner)) firm.announcement = fill(texts.banner);
  return { ...content, firm };
}

/* ---- contact details (footer, /contact) ------------------------------------------------------------------------ */

/** Contact details from WordPress; a missing part keeps the built-in value where it is rendered. */
export interface CmsContact {
  email?: string;
  /** `display` as typed in WordPress, `tel` the dialable form for the `tel:` link */
  phone?: { display: string; tel: string };
  /** multi-line (one line per row); a missing language uses the other one (same office) */
  address?: Bi;
}

/** "514-985-1138" → "+15149851138" (North American numbers without a country code get +1); null when not dialable. */
export function telHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  if (phone.trim().startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits;
}

export function contactOverrides(texts: CmsTexts): CmsContact {
  const out: CmsContact = {};
  if (texts.contactEmail) out.email = texts.contactEmail;
  const tel = texts.contactPhone ? telHref(texts.contactPhone) : null;
  if (texts.contactPhone && tel) out.phone = { display: texts.contactPhone, tel };
  if (texts.contactAddress && hasText(texts.contactAddress)) out.address = fill(texts.contactAddress);
  return out;
}

/** One-line form of a multi-line address (map links): "Line 1\nLine 2" → "Line 1, Line 2". */
export const oneLine = (address: string): string => address.split(/\s*\n\s*/).filter(Boolean).join(", ");

/* ---- page intros ------------------------------------------------------------------------------------------------ */

/** The coded hero copy of a page (title + coloured accent + lead), as the page components already hold it. */
export interface IntroCopy { title: Bi; accent: Bi; lead: Bi }

/**
 * Hero copy of a page with the WordPress intro applied, PER LANGUAGE: a headline filled for a language replaces the
 * coded title AND accent of that language (accent = the WordPress highlight, or none); a lead filled for a language
 * replaces the coded lead of that language. Anything not filled keeps the coded copy, so with no intro the result is
 * exactly `coded`. Never mutates its inputs.
 */
export function introCopy(coded: IntroCopy, intro?: CmsPageIntro | null): IntroCopy {
  if (!intro) return coded;
  const out: IntroCopy = { title: { ...coded.title }, accent: { ...coded.accent }, lead: { ...coded.lead } };
  for (const l of ["en", "fr"] as const) {
    const h = intro.headline?.[l]?.trim();
    if (h) {
      out.title[l] = h;
      out.accent[l] = intro.highlight?.[l]?.trim() ?? "";
    }
    const lead = intro.lead?.[l]?.trim();
    if (lead) out.lead[l] = lead;
  }
  return out;
}
