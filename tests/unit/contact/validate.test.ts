import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanLine, cleanText, EMAIL_RE, EXTRA_INTERESTS, fromForm, fromJson, inquiryFieldErrors, LIMITS, PROFILE_VALUES, validateSubmission, type RawSubmission } from "../../../src/lib/contact/validate.ts";
import { CT } from "../../../src/components/site/pages/contact.copy.ts";
import { PUBLIC_FUNDS } from "../../../src/config/funds-public.ts";

const ALLOWED = [...PUBLIC_FUNDS.map((f) => f.short.en), ...EXTRA_INTERESTS];
const OK = { profile: "Individual investor", interests: [ALLOWED[0]], name: "Test Person", email: "test@example.com", phone: "", company: "", message: "Hello", consent: true };
const raw = (o: Partial<typeof OK> = {}, extra: Partial<RawSubmission> = {}): RawSubmission => ({ input: { ...OK, ...o }, honeypot: "", token: "", lang: "en", ...extra });

test("contact: the page's investor types and interests are the ones the server accepts", () => {
  assert.deepEqual(CT.form.profiles.map((p) => p.v), [...PROFILE_VALUES]);
  assert.deepEqual([CT.form.custom.en, CT.form.general.en], [...EXTRA_INTERESTS]);
});

test("contact: a complete inquiry is accepted and cleaned", () => {
  const r = validateSubmission(raw({ name: "  Jean-Luc  O’Neil ", message: "Line 1\r\n\r\n\r\n\r\nLine 2‮  ", company: " A/B Capital " }, { lang: "fr" }), ALLOWED);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.value.name, "Jean-Luc O’Neil");
  assert.equal(r.value.message, "Line 1\n\nLine 2");
  assert.equal(r.value.company, "A/B Capital");
  assert.equal(r.value.phone, undefined);
  assert.equal(r.value.lang, "fr");
  assert.deepEqual(r.value.interests, [ALLOWED[0]]);
});

test("contact: each field is checked", () => {
  const bad = (o: Partial<typeof OK>) => inquiryFieldErrors({ ...OK, ...o }, ALLOWED);
  assert.deepEqual(bad({}), []);
  assert.deepEqual(bad({ profile: "Hacker" }), ["profile"]);
  assert.deepEqual(bad({ interests: [] }), ["interests"]);
  assert.deepEqual(bad({ interests: ["Something else"] }), ["interests"]);
  assert.deepEqual(bad({ interests: Array(LIMITS.interests + 1).fill(ALLOWED[0]) }), ["interests"]);
  assert.deepEqual(bad({ name: "A" }), ["name"]);
  assert.deepEqual(bad({ name: "<script>alert(1)</script>" }), ["name"]);
  assert.deepEqual(bad({ name: "http://evil.example" }), ["name"]);
  assert.deepEqual(bad({ name: "x".repeat(LIMITS.name + 1) }), ["name"]);
  assert.deepEqual(bad({ email: "nope" }), ["email"]);
  assert.deepEqual(bad({ email: "a@b.c?subject=x" }), ["email"]);
  assert.deepEqual(bad({ email: `${"a".repeat(195)}@b.com` }), ["email"]);
  assert.deepEqual(bad({ phone: "call me" }), ["phone"]);
  assert.deepEqual(bad({ phone: "+1 (514) 985-1138" }), []);
  assert.deepEqual(bad({ company: "<b>x</b>" }), ["company"]);
  assert.deepEqual(bad({ company: "c".repeat(LIMITS.company + 1) }), ["company"]);
  assert.deepEqual(bad({ message: "m".repeat(LIMITS.message + 1) }), ["message"]);
  assert.deepEqual(bad({ message: "m".repeat(LIMITS.message) }), []);
  assert.deepEqual(bad({ consent: false }), ["consent"]);
  // without a list (the browser) any short interest passes; the server always passes the list
  assert.deepEqual(inquiryFieldErrors({ ...OK, interests: ["Anything"] }), []);
});

test("contact: email pattern (safe in a mailto: link)", () => {
  for (const good of ["a.b@nymbus.ca", "first+tag@sub.example.co", "o'neil@example.com"]) assert.ok(EMAIL_RE.test(good), good);
  for (const bad of ["", "a@b", "a b@c.de", "@c.de", "a@b.c", "a@b.com?cc=x", "a&b@c.de", "a%b@c.de", "a@-b.com", "a@b-.com", "\"a\"@b.com"]) assert.ok(!EMAIL_RE.test(bad), bad);
});

test("contact: text cleaning removes control, invisible and bidi-override characters", () => {
  assert.equal(cleanLine("a\u0000b​c‮d﻿\n e"), "abcd e");
  assert.equal(cleanLine(42), "");
  assert.equal(cleanText("a\tb\r\nc  \n\n\n\nd"), "a b\nc\n\nd");
  assert.equal(cleanLine("é"), "é"); // NFC
});

test("contact: JSON and form bodies", () => {
  const j = fromJson({ ...OK, website: "", t: "tok", lang: "fr", extra: "ignored" });
  assert.ok(j);
  assert.equal(j!.token, "tok");
  assert.equal(j!.lang, "fr");
  assert.equal(j!.input.consent, true);
  assert.equal(fromJson({ ...OK, consent: "true" })!.input.consent, false, "JSON consent must be the boolean true");
  assert.equal(fromJson({ ...OK, interests: [1, 2] }), null);
  assert.equal(fromJson([]), null);
  assert.equal(fromJson(null), null);
  assert.equal(fromJson({ ...OK, lang: "de" })!.lang, "en");
  const f = fromForm(new URLSearchParams("profile=Other&interests=A&interests=B&name=N%20N&email=a%40b.co&consent=on&website=&t=x&lang=fr"));
  assert.deepEqual(f.input.interests, ["A", "B"]);
  assert.equal(f.input.consent, true);
  assert.equal(f.lang, "fr");
  assert.equal(fromForm(new URLSearchParams("consent=off")).input.consent, false);
  assert.equal(fromForm(new URLSearchParams("")).input.consent, false);
});

test("contact: duplicate interests are stored once", () => {
  const r = validateSubmission(raw({ interests: [ALLOWED[0], ALLOWED[0]] }), ALLOWED);
  assert.ok(r.ok && r.value.interests.length === 1);
});
