/**
 * Validation of the WordPress document: whitelisting, dropping bad items, rejecting a wrong schema, bounds, ordering.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CmsInvalidError, LIMITS, parseCmsDocument } from "../../../src/lib/cms/validate.ts";

const fixture = JSON.parse(readFileSync(resolve(import.meta.dirname, "../../../e2e/fixtures/wp-site-content.json"), "utf8"));
const OPTS = { mediaOrigin: "http://localhost:3199", allowLoopbackHttp: true };
const clone = <T>(x: T): T => structuredClone(x);

test("the fixture parses: markup stripped, images on the media origin kept, newest news first, team by order", () => {
  const { doc, dropped } = parseCmsDocument(fixture, OPTS);
  assert.deepEqual(dropped, []);
  assert.equal(doc.schemaVersion, 1);
  assert.deepEqual(doc.news.map((n) => n.id), ["cms-test-launch", "cms-test-second", "cms-test-third", "cms-test-fourth"]);
  assert.equal(doc.news[0].summary.en, "Summary with markup that must be stripped.");
  assert.equal(doc.news[0].body.en, "First paragraph of the test article.\n\nSecond paragraph, with a script that must vanish.");
  assert.equal(doc.news[0].image, "http://localhost:3199/wp-content/uploads/test.png");
  assert.equal(doc.news[0].link, "https://example.org/press");
  assert.deepEqual(doc.team.map((m) => m.id), ["sample-person-one", "sample-person-two", "sample-person-three"]);
  assert.equal(doc.team[0].linkedin, "https://www.linkedin.com/in/sample-person-one");
  assert.deepEqual(doc.team[0].additionalDepartments, ["Board"]);
  assert.equal(doc.texts.aumLabel?.en, "$9.9B+ (CMS test)");
  assert.equal(doc.texts.contactEmail, "info@example.org");
  assert.equal(doc.texts.banner?.fr, "Bannière de test CMS : entretien prévu ce soir.");
});

test("hostile content is neutralised field by field", () => {
  const raw = clone(fixture);
  raw.news[0].title.en = "<img src=x onerror=alert(1)>Title";
  raw.news[0].image = "https://evil.example/pixel.png";
  raw.news[0].link = "javascript:alert(1)";
  raw.team[0].name = "<script>alert(1)</script>Eve";
  raw.team[0].photo = "data:image/png;base64,AAAA";
  raw.team[0].linkedin = "https://evil.example/in/x";
  raw.texts.contactEmail = "a@b.c<script>";
  raw.texts.banner = { en: "<a href='javascript:1'>go</a>", fr: "" };
  const { doc } = parseCmsDocument(raw, OPTS);
  assert.equal(doc.news.find((n) => n.id === "cms-test-launch")!.title.en, "Title");
  assert.equal(doc.news.find((n) => n.id === "cms-test-launch")!.image, null);
  assert.equal(doc.news.find((n) => n.id === "cms-test-launch")!.link, null);
  const eve = doc.team.find((m) => m.id === "sample-person-one")!;
  assert.equal(eve.name, "Eve");
  assert.equal(eve.photo, null);
  assert.equal(eve.linkedin, null);
  assert.equal(doc.texts.contactEmail, undefined);
  assert.equal(doc.texts.banner?.en, "go");
});

test("unknown fields never pass through (whitelist)", () => {
  const raw = clone(fixture);
  raw.news[0].html = "<script>x</script>";
  raw.team[0].password = "secret";
  raw.extra = { a: 1 };
  raw.texts.evil = "x";
  const { doc } = parseCmsDocument(raw, OPTS);
  assert.equal("html" in doc.news[0], false);
  assert.equal("password" in doc.team[0], false);
  assert.equal("extra" in doc, false);
  assert.equal("evil" in doc.texts, false);
});

test("invalid items are dropped and reported, the rest survives", () => {
  const raw = clone(fixture);
  raw.news[1].id = "Bad Slug!";
  raw.news[2].date = "2026-13-45";
  raw.news[3].title = { en: "", fr: "" };
  raw.news.push("not an object", clone(raw.news[0]));
  raw.team[1].department = "Marketing";
  raw.team[2].name = "   ";
  const { doc, dropped } = parseCmsDocument(raw, OPTS);
  assert.deepEqual(doc.news.map((n) => n.id), ["cms-test-launch"]);
  assert.deepEqual(doc.team.map((m) => m.id), ["sample-person-one"]);
  assert.equal(dropped.length, 7);
  assert.ok(dropped.some((d) => d.includes("duplicate")));
});

test("an unsupported or malformed document is rejected as a whole", () => {
  for (const bad of [null, [], "x", 5, {}, { schemaVersion: 2, news: [], team: [] }, { schemaVersion: 1, news: {}, team: [] }, { schemaVersion: 1, news: [] }]) {
    assert.throws(() => parseCmsDocument(bad, OPTS), CmsInvalidError);
  }
});

test("images are refused when there is no media origin", () => {
  const { doc } = parseCmsDocument(fixture, { mediaOrigin: null });
  assert.equal(doc.news[0].image, null);
  assert.equal(doc.team[1].photo, null);
});

test("bounds: item counts and text lengths are capped", () => {
  const raw = clone(fixture);
  raw.news = Array.from({ length: LIMITS.news + 5 }, (_, i) => ({ ...clone(fixture.news[0]), id: `n-${i}` }));
  raw.news[0].body.en = "x".repeat(LIMITS.body + 500);
  const { doc, dropped } = parseCmsDocument(raw, OPTS);
  assert.equal(doc.news.length, LIMITS.news);
  assert.ok(doc.news.every((n) => n.body.en.length <= LIMITS.body));
  assert.ok(dropped.some((d) => d.includes("over the limit")));
});

test("category falls back to community; order, year and departments are normalised", () => {
  const raw = clone(fixture);
  raw.news[0].category = "weird";
  raw.team[0].yearJoined = 1850;
  raw.team[0].order = "5";
  raw.team[0].additionalDepartments = ["Leadership", "Board", "Board", "Nope"];
  const { doc } = parseCmsDocument(raw, OPTS);
  assert.equal(doc.news.find((n) => n.id === "cms-test-launch")!.category, "community");
  const m = doc.team.find((x) => x.id === "sample-person-one")!;
  assert.equal(m.yearJoined, null);
  assert.equal(m.order, 0);
  assert.deepEqual(m.additionalDepartments, ["Board"], "own department and unknown values removed, no duplicates");
});

test("the team is ordered by `order`, then name", () => {
  const raw = clone(fixture);
  raw.team[0].order = 5; raw.team[1].order = 5; raw.team[2].order = 1;
  const { doc } = parseCmsDocument(raw, OPTS);
  assert.deepEqual(doc.team.map((m) => m.id), ["sample-person-three", "sample-person-one", "sample-person-two"]);
});
