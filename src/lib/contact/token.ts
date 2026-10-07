/**
 * Form timing token of the contact form: the page embeds `v1.<issued ms, base 36>.<HMAC>`, the server refuses a
 * submission made less than MIN_FILL_MS after the page was rendered (scripts post at once; a person needs three steps)
 * or with a forged token, and asks for a reload when the page is older than MAX_AGE_MS.
 *
 * The key is derived from AUTH_SECRET (or the volume secret that replaces it), else a per-process random key (tokens
 * then expire on restart, the visitor reloads). Dependency-free, Node only.
 *
 * Not a CAPTCHA: it only stops naive scripts that post without loading the page or post at once. A script that fetches
 * /contact, waits 3 s and posts gets through; the rate limits, the site-wide cap and the duplicate check bound what it
 * can store.
 */
import crypto from "node:crypto";
import { withAuthSecret } from "../auth/volume-secret.ts";

export const MIN_FILL_MS = 3_000;
export const MAX_AGE_MS = 24 * 3_600_000;

let processKey: Buffer | null = null;

/** HMAC key of the form tokens (never the secret itself). */
export function formKey(env: Record<string, string | undefined> = process.env): Buffer {
  const secret = (withAuthSecret(env).AUTH_SECRET ?? "").trim();
  if (secret.length >= 32) return crypto.createHash("sha256").update(`nymbus-contact-form|${secret}`).digest();
  processKey ??= crypto.randomBytes(32);
  return processKey;
}

const sign = (issued: string, key: Buffer): string => crypto.createHmac("sha256", key).update(`contact.v1.${issued}`).digest("base64url").slice(0, 32);

export function issueFormToken(now = Date.now(), key: Buffer = formKey()): string {
  const issued = Math.floor(now).toString(36);
  return `v1.${issued}.${sign(issued, key)}`;
}

export type TokenCheck = "ok" | "too-fast" | "expired" | "invalid";

export function checkFormToken(token: unknown, now = Date.now(), key: Buffer = formKey()): TokenCheck {
  if (typeof token !== "string" || token.length > 80) return "invalid";
  const m = /^v1\.([0-9a-z]{1,12})\.([A-Za-z0-9_-]{32})$/.exec(token);
  if (!m) return "invalid";
  const expected = Buffer.from(sign(m[1], key));
  const given = Buffer.from(m[2]);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return "invalid";
  const issued = parseInt(m[1], 36);
  if (!Number.isFinite(issued) || issued > now + 60_000) return "invalid";
  if (now - issued < MIN_FILL_MS) return "too-fast";
  if (now - issued > MAX_AGE_MS) return "expired";
  return "ok";
}

/**
 * Automated-submission screen of POST /api/contact: a filled honeypot field, a forged token or a post faster than
 * MIN_FILL_MS is "bot" (answered like a success, nothing stored); a page older than MAX_AGE_MS is "expired" (reload).
 */
export function screenSubmission(s: { honeypot: string; token: string }, now = Date.now(), key: Buffer = formKey()): "ok" | "bot" | "expired" {
  if (s.honeypot.trim()) return "bot";
  const t = checkFormToken(s.token, now, key);
  return t === "ok" ? "ok" : t === "expired" ? "expired" : "bot";
}
