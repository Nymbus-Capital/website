/**
 * POST /api/contact — the /contact form. Two encodings:
 *  - application/json (the page with JavaScript): JSON answers `{ ok: true }` or `{ error, fields? }`;
 *  - application/x-www-form-urlencoded (no JavaScript, native form post): 303 to /contact?sent=1 or /contact?error=<code>.
 *
 * Guards, in order: same origin (Origin, else Referer = PUBLIC_URL; Sec-Fetch-Site same-origin), per-client attempt limit
 * (5 / 15 min, rightmost X-Forwarded-For), content type, 16 KB body cap, honeypot field and form timing token (bots get a
 * fake success and nothing is stored), field validation (src/lib/contact/validate.ts), a site-wide limit on stored
 * inquiries (40 / hour) and a hard cap on the volume. The inquiry is then stored (an identical one received in the last
 * 24 hours is not stored again nor alerted: double clicks, reloads) (src/lib/contact/store.ts) and, when a
 * webhook is configured, an alert naming only the sender and investor type is posted after the response.
 * Logs never carry the submitted fields.
 */
import { after, type NextRequest } from "next/server";
import { PUBLIC_FUNDS } from "@/config/funds-public";
import { checkSameOrigin, clientKey, contactLimiter } from "@/lib/contact/guards";
import { checkFormToken } from "@/lib/contact/token";
import { EXTRA_INTERESTS, fromForm, fromJson, validateSubmission, type InquiryField, type RawSubmission } from "@/lib/contact/validate";
import { InquiryStoreFullError, saveInquiry } from "@/lib/contact/store";
import { notifyInquiry } from "@/lib/contact/notify";
import { readBodyCapped } from "../admin/_lib/http";

export const dynamic = "force-dynamic";

const MAX_BODY = 16 * 1024;
const H = { "Cache-Control": "no-store" };
const limiter = contactLimiter();
const ALLOWED_INTERESTS: readonly string[] = [...PUBLIC_FUNDS.map((f) => f.short.en), ...EXTRA_INTERESTS];

type Code = "forbidden" | "unavailable" | "rate_limited" | "unsupported" | "too_large" | "invalid_input" | "expired" | "busy" | "error";
const STATUS: Record<Code, number> = { forbidden: 403, unavailable: 503, rate_limited: 429, unsupported: 415, too_large: 413, invalid_input: 400, expired: 400, busy: 429, error: 500 };

function publicOrigin(): string | null {
  try {
    return new URL(process.env.PUBLIC_URL ?? "").origin;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ct = (req.headers.get("content-type") || "").split(";", 1)[0].trim().toLowerCase();
  const native = ct === "application/x-www-form-urlencoded";
  const origin = publicOrigin();

  const done = (): Response =>
    native && origin ? Response.redirect(`${origin}/contact?sent=1#contact-form`, 303) : Response.json({ ok: true }, { headers: H });
  const fail = (code: Code, fields?: InquiryField[]): Response => {
    if (native && origin && code !== "forbidden") return Response.redirect(`${origin}/contact?error=${code}#contact-form`, 303);
    const headers: Record<string, string> = { ...H, ...(code === "rate_limited" || code === "busy" ? { "Retry-After": "900" } : {}) };
    return Response.json(fields ? { error: code, fields } : { error: code }, { status: STATUS[code], headers });
  };

  const same = checkSameOrigin(req.headers, process.env.PUBLIC_URL);
  if (same === "unconfigured") {
    console.error("[contact] PUBLIC_URL is not configured: the contact form is disabled");
    return fail("unavailable");
  }
  if (same !== "ok") return fail("forbidden");
  if (!limiter.take(clientKey(req.headers.get("x-forwarded-for")))) return fail("rate_limited");
  if (!native && ct !== "application/json") return fail("unsupported");

  const buf = await readBodyCapped(req, MAX_BODY);
  if (!buf) return fail("too_large");
  let raw: RawSubmission | null;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(buf);
    raw = native ? fromForm(new URLSearchParams(text)) : fromJson(JSON.parse(text));
  } catch {
    raw = null;
  }
  if (!raw) return fail("invalid_input");

  // automated submissions: answered like a success so the script learns nothing; nothing stored or sent
  if (raw.honeypot.trim()) {
    console.log("[contact] submission filtered (honeypot)");
    return done();
  }
  const timing = checkFormToken(raw.token);
  if (timing === "invalid" || timing === "too-fast") {
    console.log(`[contact] submission filtered (token ${timing})`);
    return done();
  }
  if (timing === "expired") return fail("expired");

  const v = validateSubmission(raw, ALLOWED_INTERESTS);
  if (!v.ok) return fail("invalid_input", v.fields);
  if (!limiter.takeGlobal()) {
    console.error("[contact] site-wide inquiry limit reached");
    return fail("busy");
  }
  try {
    const { record: rec, duplicate } = await saveInquiry(v.value);
    if (duplicate) {
      console.log("[contact] duplicate submission not stored again");
      return done();
    }
    after(() => notifyInquiry(rec).then(
      (r) => { if (r === "failed") console.error("[contact] inquiry alert not delivered"); },
      () => console.error("[contact] inquiry alert crashed"),
    ));
  } catch (e) {
    if (e instanceof InquiryStoreFullError) {
      console.error("[contact] inquiry store is full: new inquiries are refused");
      return fail("unavailable");
    }
    console.error(`[contact] could not store an inquiry: ${(e as NodeJS.ErrnoException)?.code ?? "error"}`);
    return fail("error");
  }
  return done();
}

export function GET() {
  return Response.json({ error: "method_not_allowed" }, { status: 405, headers: { ...H, Allow: "POST" } });
}
