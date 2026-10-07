/**
 * Contact form rules, shared by the browser (step validation) and POST /api/contact (the authority).
 * Pure, dependency-free and erasable TypeScript (unit tested under plain Node; no zod, so `npm test` needs no install).
 *
 * Texts are stored and shown as plain text: control and bidirectional-override characters are removed, nothing is
 * interpreted as HTML (the admin renders them through React, which escapes them; the Teams alert escapes Markdown).
 */

/** "I am": financial advisor, institution (family offices included), individual investor, other. Stored in English. */
export const PROFILE_VALUES = ["Financial advisor", "Institution", "Individual investor", "Other"] as const;
export type Profile = (typeof PROFILE_VALUES)[number];

/** interests that are not a fund (the fund names come from the public fund list) */
export const EXTRA_INTERESTS = ["Custom mandate", "General inquiry"] as const;

export const LIMITS = {
  name: 120,
  email: 200,
  phone: 25,
  company: 160,
  message: 3000,
  interests: 12,
  interest: 60,
} as const;

/** Conservative address pattern: ASCII local part without `?`, `&`, `%` or quotes (safe in a mailto: link), dotted domain. */
export const EMAIL_RE =
  /^[A-Za-z0-9._+'-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
const PHONE_RE = /^[+()\d\s.-]{7,25}$/;
/** letters (any script), marks, digits, spaces and the punctuation of names; no `<>`, `@`, `:` or `/` */
const NAME_RE = /^[\p{L}\p{M}\p{N} '’.,()&-]+$/u;
/** organisation names may also hold `/`, `+` and `#` ("A/B Capital"), never `<` or `>` */
const COMPANY_RE = /^[^<>]*$/;

export const INQUIRY_FIELDS = [
  "profile",
  "interests",
  "name",
  "email",
  "phone",
  "company",
  "message",
  "consent",
] as const;
export type InquiryField = (typeof INQUIRY_FIELDS)[number];

export interface InquiryInput {
  profile: string;
  interests: string[];
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  consent?: boolean;
}

export interface CleanInquiry {
  profile: Profile;
  interests: string[];
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  lang: "en" | "fr";
}

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f​-‏‪-‮⁠-⁩﻿]/g;

/** One-line text: NFC, control / invisible / bidi-override characters removed, whitespace collapsed, trimmed. */
export function cleanLine(v: unknown): string {
  return typeof v === "string" ? v.normalize("NFC").replace(CONTROL, "").replace(/\s+/g, " ").trim() : "";
}

/** Multi-line text: as cleanLine but line breaks kept (CRLF → LF, at most one blank line in a row). */
export function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  return v
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL, "")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Field errors of an inquiry (already cleaned or as typed: each field is cleaned before it is checked). */
export function inquiryFieldErrors(q: InquiryInput, allowedInterests?: readonly string[]): InquiryField[] {
  const bad: InquiryField[] = [];
  if (!(PROFILE_VALUES as readonly string[]).includes(cleanLine(q.profile))) bad.push("profile");
  const interests = Array.isArray(q.interests) ? q.interests.map(cleanLine) : [];
  if (
    !interests.length ||
    interests.length > LIMITS.interests ||
    interests.some(
      (i) => !i || i.length > LIMITS.interest || (allowedInterests ? !allowedInterests.includes(i) : false),
    )
  )
    bad.push("interests");
  const name = cleanLine(q.name);
  if (name.length < 2 || name.length > LIMITS.name || !NAME_RE.test(name)) bad.push("name");
  const email = cleanLine(q.email);
  if (email.length > LIMITS.email || !EMAIL_RE.test(email)) bad.push("email");
  const phone = cleanLine(q.phone);
  if (phone && !PHONE_RE.test(phone)) bad.push("phone");
  const company = cleanLine(q.company);
  if (company.length > LIMITS.company || !COMPANY_RE.test(company)) bad.push("company");
  if (cleanText(q.message).length > LIMITS.message) bad.push("message");
  if (q.consent !== true) bad.push("consent");
  return bad;
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const isTrue = (v: unknown): boolean => v === true || v === "on" || v === "1" || v === "true";

/** The submitted fields, from a JSON body or a urlencoded form (repeated `interests` keys). Unknown keys are ignored. */
export interface RawSubmission {
  input: InquiryInput;
  honeypot: string;
  token: string;
  lang: "en" | "fr";
}

export function fromJson(body: unknown): RawSubmission | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const o = body as Record<string, unknown>;
  const interests = Array.isArray(o.interests) ? o.interests.filter((x): x is string => typeof x === "string") : [];
  if (Array.isArray(o.interests) && interests.length !== o.interests.length) return null;
  return {
    input: {
      profile: str(o.profile),
      interests,
      name: str(o.name),
      email: str(o.email),
      phone: str(o.phone),
      company: str(o.company),
      message: str(o.message),
      consent: o.consent === true,
    },
    honeypot: str(o.website),
    token: str(o.t),
    lang: o.lang === "fr" ? "fr" : "en",
  };
}

export function fromForm(f: URLSearchParams): RawSubmission {
  const g = (k: string) => f.get(k) ?? "";
  return {
    input: {
      profile: g("profile"),
      interests: f.getAll("interests"),
      name: g("name"),
      email: g("email"),
      phone: g("phone"),
      company: g("company"),
      message: g("message"),
      consent: isTrue(f.get("consent")),
    },
    honeypot: g("website"),
    token: g("t"),
    lang: g("lang") === "fr" ? "fr" : "en",
  };
}

/** Validated, cleaned inquiry, or the list of fields to fix. */
export function validateSubmission(
  raw: RawSubmission,
  allowedInterests: readonly string[],
): { ok: true; value: CleanInquiry } | { ok: false; fields: InquiryField[] } {
  const fields = inquiryFieldErrors(raw.input, allowedInterests);
  if (fields.length) return { ok: false, fields };
  const q = raw.input;
  const opt = (s: string) => (s ? s : undefined);
  return {
    ok: true,
    value: {
      profile: cleanLine(q.profile) as Profile,
      interests: [...new Set(q.interests.map(cleanLine))],
      name: cleanLine(q.name),
      email: cleanLine(q.email),
      phone: opt(cleanLine(q.phone)),
      company: opt(cleanLine(q.company)),
      message: opt(cleanText(q.message)),
      lang: raw.lang,
    },
  };
}
