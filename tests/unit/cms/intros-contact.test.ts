/**
 * WordPress page intros and contact details: validation (whitelist, the locked Sustainability lead), the mapping onto
 * the coded copy (exactly the coded copy when WordPress gives nothing: identical rendering), the phone link.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { contactOverrides, introCopy, oneLine, telHref } from "../../../src/lib/cms/map.ts";
import { parseCmsDocument } from "../../../src/lib/cms/validate.ts";
import { INTRO_PAGES } from "../../../src/lib/cms/types.ts";
import { AP } from "../../../src/components/site/pages/approach.copy.ts";
import { AB } from "../../../src/components/site/pages/about.copy.ts";
import { SU } from "../../../src/components/site/pages/sustainability.copy.ts";
import { SOL_COPY } from "../../../src/components/site/pages/solutions.copy.ts";
import { CT } from "../../../src/components/site/pages/contact.copy.ts";

const fixture = JSON.parse(readFileSync(resolve(import.meta.dirname, "../../../e2e/fixtures/wp-site-content.json"), "utf8"));
const OPTS = { mediaOrigin: "http://localhost:3199", allowLoopbackHttp: true };
const parseTexts = (texts: unknown) => parseCmsDocument({ ...structuredClone(fixture), texts }, OPTS).doc.texts;

const CODED = {
  approach: AP.hero,
  team: AB.hero,
  sustainability: SU.hero,
  solutions: { title: SOL_COPY.title, accent: SOL_COPY.accent, lead: SOL_COPY.lead },
};

test("intro pages are the four agreed pages, nothing compliance-reviewed", () => {
  assert.deepEqual([...INTRO_PAGES], ["approach", "solutions", "sustainability", "team"]);
});

test("no intro: exactly the coded copy (same object, identical rendering)", () => {
  for (const c of Object.values(CODED)) {
    assert.equal(introCopy(c, undefined), c);
    assert.equal(introCopy(c, null), c);
    const same = introCopy(c, {});
    assert.deepEqual({ title: same.title, accent: same.accent, lead: same.lead }, { title: c.title, accent: c.accent, lead: c.lead });
  }
});

test("headline replaces title AND accent per language; lead replaces lead per language; empty keeps coded", () => {
  const r = introCopy(AP.hero, { headline: { en: "How we invest", fr: "" }, highlight: { en: "with data", fr: "" }, lead: { en: "", fr: "Une phrase." } });
  assert.deepEqual(r.title, { en: "How we invest", fr: AP.hero.title.fr });
  assert.deepEqual(r.accent, { en: "with data", fr: AP.hero.accent.fr });
  assert.deepEqual(r.lead, { en: AP.hero.lead.en, fr: "Une phrase." });
  const noHl = introCopy(AB.hero, { headline: { en: "Our people", fr: "Nos gens" } });
  assert.deepEqual(noHl.accent, { en: "", fr: "" }, "a headline without highlight shows no coloured ending");
  // inputs untouched
  assert.equal(AP.hero.title.en, "At the intersection of technology,");
});

test("validation: page intros whitelisted, trimmed, capped, markup stripped", () => {
  const t = parseTexts({
    pageIntros: {
      approach: { headline: { en: "<b>Bold</b> claim", fr: "" }, highlight: { en: "x".repeat(500), fr: "" }, lead: { en: "Lead", fr: "Chapeau" }, evil: "x" },
      team: { highlight: { en: "orphan", fr: "" } },
      sustainability: { headline: { en: "Commitments", fr: "" }, lead: { en: "Qualifier removed!", fr: "" } },
      legal: { headline: { en: "Not editable", fr: "" } },
      solutions: "garbage",
    },
  });
  assert.equal(t.pageIntros?.approach?.headline?.en, "Bold claim");
  assert.equal(t.pageIntros?.approach?.highlight?.en.length, 120);
  assert.deepEqual(t.pageIntros?.approach?.lead, { en: "Lead", fr: "Chapeau" });
  assert.equal("evil" in (t.pageIntros?.approach ?? {}), false);
  assert.equal(t.pageIntros?.team, undefined, "a highlight alone means nothing");
  assert.equal(t.pageIntros?.sustainability?.headline?.en, "Commitments");
  assert.equal(t.pageIntros?.sustainability?.lead, undefined, "the Sustainability lead (ESG scope qualifier) stays in code");
  assert.equal("legal" in (t.pageIntros ?? {}), false);
  assert.equal(t.pageIntros?.solutions, undefined);
  assert.equal(parseTexts({}).pageIntros, undefined);
  assert.equal(parseTexts({ pageIntros: { approach: { headline: { en: "[Sample] x", fr: "" } } } }).pageIntros, undefined, "sample content never shown");
});

test("phone link: dialable form", () => {
  assert.equal(telHref("514-985-1138"), "+15149851138");
  assert.equal(telHref("514 985-1138"), "+15149851138");
  assert.equal(telHref("+1 514 555 0100"), "+15145550100");
  assert.equal(telHref("1 (833) 227-2656"), "+18332272656");
  assert.equal(telHref("+44 20 7946 0958"), "+442079460958");
  assert.equal(telHref("123"), null);
});

test("contact overrides: only what WordPress gives; nothing = built-in everywhere", () => {
  assert.deepEqual(contactOverrides({}), {});
  const c = contactOverrides(parseTexts({ contactEmail: "info@example.org", contactPhone: "+1 514 555 0100", contactAddress: { en: "1 Test Street\nMontreal", fr: "" } }));
  assert.equal(c.email, "info@example.org");
  assert.deepEqual(c.phone, { display: "+1 514 555 0100", tel: "+15145550100" });
  assert.deepEqual(c.address, { en: "1 Test Street\nMontreal", fr: "1 Test Street\nMontreal" }, "a missing language uses the other (same office)");
  assert.deepEqual(contactOverrides({ contactPhone: "12" }), {}, "an undialable phone keeps the built-in one");
});

test("one-line address for the map link matches the coded one", () => {
  assert.equal(oneLine(CT.office.address.en), "1002 Sherbrooke Street West, Suite 1900, Montreal, Quebec H3A 3L6");
  assert.equal(oneLine("A\n\n  B  \nC"), "A, B, C");
});

test("contact e-mail: strict pattern (same as the plugin)", () => {
  assert.equal(parseTexts({ contactEmail: "info@nymbus.ca" }).contactEmail, "info@nymbus.ca");
  for (const bad of ['"a b"@example.org', "a@[127.0.0.1]", "a@b", "a%b@example.org", "a@b.c", "a@exa_mple.org"]) {
    assert.equal(parseTexts({ contactEmail: bad }).contactEmail, undefined, bad);
  }
});
