/**
 * Mapping to the page shapes, precedence of the editable texts (admin wins), the revalidation secret check, and
 * the CSP img-src extension for the media origin.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { colorOf, initialsOf, overlayTexts, toNewsEntry, toTeamMember } from "../../../src/lib/cms/map.ts";
import { parseCmsDocument } from "../../../src/lib/cms/validate.ts";
import { bearerToken, failureLimiter, secretsEqual } from "../../../src/lib/cms/auth.ts";
import { buildCsp, makeNonce } from "../../../src/lib/auth/csp.ts";
import { DEFAULT_CONTENT } from "../../../src/lib/data/defaults.ts";
import { team as staticTeam } from "../../../src/data/team.ts";
import { NEWS } from "../../../src/components/site/home/news.ts";
import type { SiteContent } from "../../../src/lib/data/types.ts";

const fixture = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../../../e2e/fixtures/wp-site-content.json"), "utf8"),
);
const { doc } = parseCmsDocument(fixture, { mediaOrigin: "http://localhost:3199", allowLoopbackHttp: true });

test("a CMS member maps to the TeamMember shape the pages use", () => {
  const m = toTeamMember(doc.team[0]);
  assert.equal(m.name, "Sample Person One");
  assert.equal(m.title, "Sample Chief Test Officer");
  assert.equal(m.titleFr, "Chef de la vérification (exemple)");
  assert.equal(m.department, "Leadership");
  assert.deepEqual(m.additionalDepartments, ["Board"]);
  assert.deepEqual(m.designations, ["CFA", "PhD"]);
  assert.deepEqual(m.previousRoles, ["Sample Role A"]);
  assert.deepEqual(m.previousRolesFr, ["Rôle exemple A"]);
  assert.equal(m.yearJoined, 2014);
  assert.equal(m.initials, "SP");
  assert.match(m.color, /^#[0-9a-f]{6}$/);
  assert.equal(m.linkedin, "https://www.linkedin.com/in/sample-person-one");
  const p = toTeamMember(doc.team[1]);
  assert.equal(p.photo, "http://localhost:3199/wp-content/uploads/person.png");
  assert.equal(p.additionalDepartments, undefined);
  assert.equal(p.designations, undefined);
});

test("a member with only a French role / bio still shows text (pick falls back to English)", () => {
  const m = toTeamMember({ ...doc.team[0], role: { en: "", fr: "Directrice" }, bio: { en: "", fr: "Bio" } });
  assert.equal(m.title, "Directrice");
  assert.equal(m.bio, "Bio");
});

test("the mapped shape is a superset of the static one (same required fields)", () => {
  const required = Object.keys(staticTeam[0]).filter((k) =>
    ["name", "title", "department", "bio", "initials", "color"].includes(k),
  );
  const m = toTeamMember(doc.team[0]);
  for (const k of required) assert.ok(k in m, k);
});

test("initials and colour are deterministic", () => {
  assert.equal(initialsOf("Jean-Luc Landry"), "JL");
  assert.equal(initialsOf("Madonna"), "MA");
  assert.equal(initialsOf("  "), "?");
  assert.equal(colorOf("Jean-Luc Landry"), colorOf("Jean-Luc Landry"));
});

test("news entries keep image and link; the static news have the same fields the pages need", () => {
  const e = toNewsEntry(doc.news[0]);
  assert.equal(e.image, "http://localhost:3199/wp-content/uploads/test.png");
  assert.equal(e.category, "partnership");
  for (const k of ["id", "date", "category", "title", "summary", "body"]) assert.ok(k in NEWS[0], k);
  assert.ok(NEWS.length >= 3, "the home teaser shows three items");
});

const stored = (firm: Partial<SiteContent["firm"]>): SiteContent => ({
  ...DEFAULT_CONTENT,
  firm: { ...DEFAULT_CONTENT.firm, ...firm },
});

test("precedence: admin value > CMS text > built-in default (AUM label)", () => {
  const texts = { aumLabel: { en: "$2.0B+", fr: "2,0 G$+" } };
  // nothing saved by the admin: the CMS wins over the default
  assert.deepEqual(overlayTexts(DEFAULT_CONTENT, null, texts).firm.aumLabel, texts.aumLabel);
  // the admin saved a label: it wins
  const adminSaved = stored({ aumLabel: { en: "$3B+", fr: "3 G$+" } });
  assert.deepEqual(overlayTexts(adminSaved, adminSaved, texts).firm.aumLabel, { en: "$3B+", fr: "3 G$+" });
  // no CMS text: the default stays
  assert.deepEqual(overlayTexts(DEFAULT_CONTENT, null, {}).firm.aumLabel, DEFAULT_CONTENT.firm.aumLabel);
  // an empty admin label counts as not set
  const empty = stored({ aumLabel: { en: " ", fr: "" } });
  assert.deepEqual(overlayTexts(empty, empty, texts).firm.aumLabel, texts.aumLabel);
});

test("precedence: announcement banner — admin banner wins, else CMS banner, else none", () => {
  const banner = { en: "Maintenance tonight", fr: "Entretien ce soir" };
  assert.deepEqual(overlayTexts(DEFAULT_CONTENT, null, { banner }).firm.announcement, banner);
  const adminOn = stored({ announcement: { en: "Admin banner", fr: "Bannière admin" } });
  assert.deepEqual(overlayTexts(adminOn, adminOn, { banner }).firm.announcement, {
    en: "Admin banner",
    fr: "Bannière admin",
  });
  assert.equal(overlayTexts(DEFAULT_CONTENT, null, {}).firm.announcement, null);
  // only one language given: both languages show it
  assert.deepEqual(overlayTexts(DEFAULT_CONTENT, null, { banner: { en: "Only EN", fr: "" } }).firm.announcement, {
    en: "Only EN",
    fr: "Only EN",
  });
});

test("overlayTexts never mutates its inputs", () => {
  const before = JSON.stringify(DEFAULT_CONTENT);
  overlayTexts(DEFAULT_CONTENT, null, { aumLabel: { en: "x", fr: "y" }, banner: { en: "b", fr: "c" } });
  assert.equal(JSON.stringify(DEFAULT_CONTENT), before);
});

test("revalidate secret: bearer parsing and constant-time comparison", () => {
  assert.equal(bearerToken("Bearer abc123"), "abc123");
  for (const bad of [null, undefined, "", "abc", "Basic abc", "Bearer ", "Bearer a b", "bearer abc"])
    assert.equal(bearerToken(bad), null, String(bad));
  assert.equal(secretsEqual("s3cret", "s3cret"), true);
  assert.equal(secretsEqual("s3cret", "s3creT"), false);
  assert.equal(secretsEqual("s3cret", "s3cret-longer"), false);
  assert.equal(secretsEqual("", ""), false, "an empty secret never matches");
  assert.equal(secretsEqual(null, "x"), false);
  assert.equal(secretsEqual("x", null), false);
});

test("failure limiter blocks after max failures inside the window and recovers", () => {
  const l = failureLimiter(3, 1000);
  assert.equal(l.blocked(0), false);
  l.fail(0);
  l.fail(10);
  l.fail(20);
  assert.equal(l.blocked(30), true);
  assert.equal(l.blocked(1500), false);
});

test("CSP: the media origin joins img-src; nothing else can be injected through it", () => {
  const n = makeNonce();
  const img = (o: (string | null)[]) =>
    buildCsp(n, { imgOrigins: o })
      .split("; ")
      .find((d) => d.startsWith("img-src"))!;
  assert.equal(img([]), "img-src 'self' data: blob: https://www.nymbus.ca");
  assert.equal(img([null]), "img-src 'self' data: blob: https://www.nymbus.ca");
  assert.equal(
    img(["https://cms.example.org"]),
    "img-src 'self' data: blob: https://www.nymbus.ca https://cms.example.org",
  );
  assert.equal(
    img(["https://cms.example.org", "https://cms.example.org"]),
    "img-src 'self' data: blob: https://www.nymbus.ca https://cms.example.org",
    "no duplicates",
  );
  assert.equal(
    img(["http://localhost:3199"]),
    "img-src 'self' data: blob: https://www.nymbus.ca http://localhost:3199",
  );
  for (const bad of [
    "*",
    "https://*.example.org",
    "http://cms.example.org",
    "https://a.example.org; script-src *",
    "https://a.example.org https://b.example.org",
    "data:",
    "https://",
    "'unsafe-inline'",
    "https://cms.example.org/path",
  ]) {
    assert.equal(img([bad]), "img-src 'self' data: blob: https://www.nymbus.ca", bad);
  }
  // the rest of the policy is untouched
  const csp = buildCsp(n, { imgOrigins: ["https://cms.example.org"] });
  assert.match(csp, /connect-src 'self'(;|$)/);
  assert.match(csp, /script-src 'self' 'nonce-[^']+' 'strict-dynamic'(;|$)/);
});

test("revalidate: a correct secret is never limited; only failures count, per source (first X-Forwarded-For hop)", async () => {
  const { keyedFailureLimiter, revalidateDecision, sourceKey } = await import("../../../src/lib/cms/auth.ts");
  const l = keyedFailureLimiter(3, 1000);
  const t = 5000;
  for (let i = 0; i < 3; i++) assert.equal(revalidateDecision("bad", "s3cret", "1.2.3.4", l, t), "unauthorized");
  assert.equal(revalidateDecision("bad", "s3cret", "1.2.3.4", l, t), "limited");
  assert.equal(revalidateDecision("s3cret", "s3cret", "1.2.3.4", l, t), "ok", "the secret is checked first");
  assert.equal(revalidateDecision("bad", "s3cret", "5.6.7.8", l, t), "unauthorized", "another source is not affected");
  assert.equal(
    revalidateDecision("bad", "s3cret", "1.2.3.4", l, t + 1001),
    "unauthorized",
    "recovers after the window",
  );
  assert.equal(sourceKey("203.0.113.9, 10.0.0.1"), "203.0.113.9");
  assert.equal(sourceKey("[::1]"), "unknown");
  assert.equal(sourceKey(null), "unknown");
  assert.equal(sourceKey("x".repeat(200)), "unknown");
  // bounded memory: past maxKeys the new sources share one bucket
  const small = keyedFailureLimiter(2, 1000, 2);
  small.fail("a", t);
  small.fail("b", t);
  small.fail("c", t);
  small.fail("d", t);
  assert.equal(small.blocked("e", t), true, "overflow bucket");
  assert.equal(small.blocked("a", t), false);
});
