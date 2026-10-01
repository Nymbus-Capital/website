import { test } from "node:test";
import assert from "node:assert/strict";
import { team } from "../../../src/data/team.ts";
import { DEPT_ORDER, countCFA, countPhD, inDept, initialsOf, membersOf } from "../../../src/components/site/pages/lib/people.ts";
import { EMAIL_RE, firstInvalidStep, inquiryEmail, inquiryMailto, mailto, mapsLink, validateInquiry, type Inquiry } from "../../../src/components/site/pages/lib/inquiry.ts";
import { contactParts, telHref } from "../../../src/components/site/pages/lib/contact-links.ts";
import { codeOfEthics, complaintsPolicy } from "../../../src/components/site/legal/complaints.ts";
import { privacyPolicy } from "../../../src/components/site/legal/privacy.ts";
import type { LegalDoc, LegalSection } from "../../../src/components/site/legal/types.ts";

/* ------------------------------------------------------------------ team */

test("people: a person shows in every department they belong to", () => {
  const cefaloni = team.find((m) => m.name === "Gabriel Cefaloni")!;
  for (const d of ["Leadership", "Quantitative Research", "Investment Team", "Board"] as const) assert.ok(inDept(cefaloni, d), d);
  assert.ok(!inDept(cefaloni, "Operations"));
  assert.ok(inDept(cefaloni, "all"));
});

test("people: 'everyone' lists all members once, by primary department in the site order", () => {
  const all = membersOf(team, "all");
  assert.equal(all.length, team.length);
  assert.equal(new Set(all.map((m) => m.name)).size, team.length);
  const ranks = all.map((m) => DEPT_ORDER.indexOf(m.department));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
  assert.equal(all[0].department, "Leadership");
});

test("people: a department filter keeps only its members (additional departments included)", () => {
  const board = membersOf(team, "Board");
  assert.ok(board.length < team.length);
  assert.ok(board.some((m) => m.name === "Marc Rivet"), "additional department");
  assert.ok(board.every((m) => inDept(m, "Board")));
});

test("people: counts are computed from the data, never typed", () => {
  const phd = team.filter((m) => [...(m.designations ?? []), ...(m.education ?? [])].some((d) => /^PhD\b/i.test(d))).length;
  assert.equal(countPhD(team), phd);
  assert.ok(countCFA(team) >= 1);
  assert.equal(countCFA([]), 0);
});

test("people: initials never carry a numeric suffix (the old site showed 'JL2')", () => {
  for (const m of team) assert.match(initialsOf(m), /^[A-Z]{1,3}$/, m.name);
  assert.equal(initialsOf({ ...team[0], initials: "JL2" }), "JL");
});

/* ------------------------------------------------------------------ contact form */

const OK: Inquiry = { profile: "Family office", interests: ["Monthly Income"], name: "Test Person", email: "test@example.com", phone: "", company: "", message: "Hello" };

test("inquiry: each step validates its own fields", () => {
  const empty: Inquiry = { profile: "", interests: [], name: "", email: "" };
  assert.deepEqual(validateInquiry(empty, 1), { profile: true });
  assert.deepEqual(validateInquiry(empty, 2), { interests: true });
  assert.deepEqual(validateInquiry(empty, 3), { name: true, email: true });
  assert.deepEqual(validateInquiry(OK), {});
  assert.deepEqual(validateInquiry({ ...OK, phone: "call me" }, 3), { phone: true });
  assert.deepEqual(validateInquiry({ ...OK, phone: "+1 (514) 985-1138" }, 3), {});
  assert.equal(firstInvalidStep(OK), 0);
  assert.equal(firstInvalidStep({ ...OK, interests: [] }), 2);
  assert.equal(firstInvalidStep({ ...OK, email: "nope" }), 3);
});

test("inquiry: email pattern", () => {
  assert.ok(EMAIL_RE.test("a.b@nymbus.ca"));
  for (const bad of ["", "a@b", "a b@c.de", "@c.de"]) assert.ok(!EMAIL_RE.test(bad), bad);
});

test("inquiry: prepared email in the visitor's language, optional lines omitted", () => {
  const en = inquiryEmail(OK, "en");
  assert.equal(en.subject, "Website inquiry · Family office · Test Person");
  assert.match(en.body, /^Hello\n\n—\nName: Test Person\nEmail: test@example.com\nInvestor profile: Family office\nInterested in: Monthly Income$/);
  assert.ok(!/Phone|Organization/.test(en.body));
  const fr = inquiryEmail({ ...OK, company: "ACME" }, "fr");
  assert.match(fr.subject, /^Demande du site Web/);
  assert.match(fr.body, /Organisation: ACME/);
  const noMsg = inquiryEmail({ ...OK, message: "" }, "en");
  assert.match(noMsg.body, /^—\nName/);
});

test("inquiry: mailto link is percent-encoded and addressed to info@", () => {
  const href = inquiryMailto(OK, "en");
  assert.match(href, /^mailto:info@nymbus\.ca\?subject=Website%20inquiry%20/);
  assert.ok(!href.includes(" "));
  assert.ok(decodeURIComponent(href.split("&body=")[1]).startsWith("Hello"));
  assert.equal(mailto("x@y.ca"), "mailto:x@y.ca");
  assert.equal(mailto("x@y.ca", "A & B"), "mailto:x@y.ca?subject=A%20%26%20B");
  assert.ok(inquiryMailto({ ...OK, message: "x".repeat(10_000) }).length < 5000, "long messages are clipped");
});

test("maps link is a search link, never an embed", () => {
  assert.equal(mapsLink("1002 Sherbrooke St W"), "https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20St%20W");
});

/* ------------------------------------------------------------------ contact lines */

test("contact lines: phone numbers and emails become links", () => {
  assert.equal(telHref("514-985-1138"), "tel:+15149851138");
  assert.equal(telHref("1 833 227-2656"), "tel:+18332272656");
  const parts = contactParts("514‑985‑1138 or 1‑833‑227‑2656 (toll-free)");
  assert.deepEqual(parts.filter((p) => p.href).map((p) => p.href), ["tel:+15149851138", "tel:+18332272656"]);
  assert.equal(parts.map((p) => p.text).join(""), "514‑985‑1138 or 1‑833‑227‑2656 (toll-free)");
  assert.deepEqual(contactParts("Email: compliance@nymbus.ca"), [{ text: "Email: " }, { text: "compliance@nymbus.ca", href: "mailto:compliance@nymbus.ca" }]);
  assert.deepEqual(contactParts("Nymbus Capital Inc."), [{ text: "Nymbus Capital Inc." }]);
});

/* ------------------------------------------------------------------ legal documents */

const flat = (secs: LegalSection[]): LegalSection[] => secs.flatMap((s) => [s, ...flat(s.children ?? [])]);
const text = (d: LegalDoc) => JSON.stringify(d);

test("legal: EN and FR documents have the same structure (same section ids, same block kinds)", () => {
  for (const f of [complaintsPolicy, codeOfEthics, privacyPolicy]) {
    const en = flat(f("en").sections), fr = flat(f("fr").sections);
    assert.deepEqual(en.map((s) => s.id), fr.map((s) => s.id));
    assert.deepEqual(en.map((s) => s.blocks.map((b) => b.kind)), fr.map((s) => s.blocks.map((b) => b.kind)));
  }
});

test("legal: section ids are unique across the pages that show them together", () => {
  for (const docs of [[complaintsPolicy("en"), codeOfEthics("en")], [privacyPolicy("en")]]) {
    const ids = docs.flatMap((d) => [d.id, `${d.id}-t`, ...flat(d.sections).map((s) => s.id)]);
    assert.equal(new Set(ids).size, ids.length);
  }
});

test("legal: one firm phone number everywhere (the old complaints policy had 514-931-1138)", () => {
  for (const f of [complaintsPolicy, codeOfEthics, privacyPolicy]) {
    for (const lang of ["en", "fr"] as const) {
      const t = text(f(lang));
      assert.ok(!/931/.test(t), `${f.name} ${lang}`);
      assert.match(t, /514[\s‑-]985-1138/);
    }
  }
});

test("legal: complaints policy keeps the AMF and OBSI escalation and its deadlines", () => {
  for (const lang of ["en", "fr"] as const) {
    const t = text(complaintsPolicy(lang));
    for (const s of ["AMF", "10 ", "60 ", "30 ", "15 ", "180 ", "350"]) assert.ok(t.includes(s), `${lang}: ${s}`);
    assert.ok(t.includes(lang === "fr" ? "OSBI" : "OBSI"));
  }
});

test("privacy: PIPEDA, the missing section 3.3 and a Law 25 section, both marked for compliance review", () => {
  for (const lang of ["en", "fr"] as const) {
    const d = privacyPolicy(lang);
    const secs = flat(d.sections);
    assert.match(d.intro ?? "", lang === "fr" ? /LPRPDE/ : /PIPEDA/);
    const s33 = secs.find((s) => s.id === "privacy-use-3");
    assert.ok(s33?.review, "3.3 exists and is flagged");
    const q = secs.find((s) => s.id === "privacy-quebec");
    assert.ok(q?.review, "Law 25 section exists and is flagged");
    assert.match(text({ ...d, sections: [q!] }), lang === "fr" ? /Loi 25/ : /Law 25/);
    assert.match(text({ ...d, sections: [q!] }), /Commission d’accès à l’information/);
    // the complaints policy is now linked from section 7
    assert.ok(secs.find((s) => s.id === "privacy-complaints")!.blocks.some((b) => b.kind === "link" && b.href === "/legal#complaints"));
  }
});
