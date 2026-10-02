/**
 * Sanitisation primitives for everything that comes from WordPress. The CMS is a trusted-but-not-verified source:
 * editors are internal, but the transport, the plugin and the WP site itself are outside this repository's control, so
 * every string is reduced to PLAIN TEXT here (no HTML ever reaches a page; React escapes on render) and every URL is
 * restricted (https only, no credentials, images only from the configured media origin, under /wp-content/uploads/).
 * Dependency-free (unit tested under plain Node).
 */

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  ndash: "–", mdash: "—", hellip: "…", laquo: "«", raquo: "»",
};

/** Decodes the common HTML entities ONCE (never repeatedly: `&amp;lt;` stays the text `&lt;`). */
export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});/gi, (m, e: string) => {
    if (e[0] === "#") {
      const cp = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      if (!Number.isFinite(cp) || (cp < 0x20 && cp !== 10) || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) return "";
      return String.fromCodePoint(cp);
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

/** Removes anything tag-shaped, repeatedly (so `<<b>script>` cannot rebuild a tag), plus comments and script / style bodies. */
export function stripTags(s: string): string {
  let out = s.replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  for (let i = 0; i < 10; i++) {
    const next = out.replace(/<\/?[a-zA-Z!?][^>]*>/g, "");
    if (next === out) break;
    out = next;
  }
  return out;
}

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g;

/** One line of plain text: entities decoded, tags stripped, control / bidi characters removed, whitespace collapsed, capped. */
export function plainText(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  const s = stripTags(decodeEntities(v)).replace(CONTROL, "").replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max).trimEnd() : s;
}

/** Plain text keeping paragraph breaks (a blank line separates paragraphs), capped. */
export function plainParagraphs(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  const s = stripTags(decodeEntities(v)).replace(/\r\n?/g, "\n").replace(CONTROL, "");
  const paras = s
    .split(/\n{2,}/)
    .map((p) => p.replace(/[ \t\f\v]*\n[ \t\f\v]*/g, " ").replace(/[ \t\f\v]+/g, " ").trim())
    .filter(Boolean);
  const joined = paras.join("\n\n");
  return joined.length > max ? joined.slice(0, max).trimEnd() : joined;
}

/** Plain-text lines (one entry per non-empty line), at most `maxLines` of at most `maxLen` characters. */
export function plainLines(v: unknown, maxLines: number, maxLen: number): string[] {
  const src = Array.isArray(v) ? v : typeof v === "string" ? v.split(/\r?\n/) : [];
  const out: string[] = [];
  for (const x of src) {
    const t = plainText(x, maxLen);
    if (t) out.push(t);
    if (out.length >= maxLines) break;
  }
  return out;
}

export const isLoopbackHost = (h: string): boolean => h === "localhost" || h === "127.0.0.1" || h === "[::1]";

/** https URL without credentials (`http` only for a loopback host when `allowLoopbackHttp`), normalised; null otherwise. */
export function safeHttpUrl(v: unknown, opts: { allowLoopbackHttp?: boolean } = {}): string | null {
  if (typeof v !== "string" || v.length > 2048) return null;
  const t = v.trim();
  // eslint-disable-next-line no-control-regex
  if (!t || /[\u0000- \u007f]/.test(t)) return null;
  let u: URL;
  try { u = new URL(t); } catch { return null; }
  if (u.username || u.password || !u.hostname) return null;
  if (u.protocol === "https:") return u.href;
  if (u.protocol === "http:" && opts.allowLoopbackHttp && isLoopbackHost(u.hostname)) return u.href;
  return null;
}

export const UPLOADS_PATH = "/wp-content/uploads/";

/** An image URL, accepted only on exactly the configured media origin (same scheme, host and port), under /wp-content/uploads/. */
export function safeImageUrl(v: unknown, mediaOrigin: string | null, opts: { allowLoopbackHttp?: boolean } = {}): string | null {
  if (!mediaOrigin) return null;
  const href = safeHttpUrl(v, opts);
  if (!href) return null;
  const u = new URL(href);
  if (u.origin !== mediaOrigin || u.hash) return null;
  // the media library only: no other page / script / endpoint of the WordPress site, no encoded traversal
  if (!u.pathname.startsWith(UPLOADS_PATH) || /%2e|%2f|%5c|\\/i.test(u.pathname)) return null;
  return href;
}

/** LinkedIn profile / page link (https, linkedin.com or a subdomain only). */
export function safeLinkedIn(v: unknown): string | null {
  const href = safeHttpUrl(v);
  if (!href) return null;
  const h = new URL(href).hostname.toLowerCase();
  return h === "linkedin.com" || h.endsWith(".linkedin.com") ? href : null;
}
