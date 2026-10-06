/**
 * wordpress/scripts/import-from-site.mjs: the built-in team and news exported for `wp nymbus import` — every person and
 * news item, slugs WordPress accepts, the website's order kept, photos only as https URLs of the given site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error plain JavaScript module without type declarations
import { buildImport, photoUrl, slugOf } from "../../../wordpress/scripts/import-from-site.mjs";
import { team } from "../../../src/data/team.ts";
import { NEWS } from "../../../src/components/site/home/news.ts";

test("slugs: accents and punctuation folded, WordPress-safe", () => {
  assert.equal(slugOf("Léana D’Imperio"), "leana-d-imperio");
  assert.equal(slugOf("Jean-Luc Landry"), "jean-luc-landry");
  assert.equal(slugOf("  Mathieu Poulin-Brière "), "mathieu-poulin-briere");
});

test("photo URLs: absolute https on the site, nothing without a site", () => {
  assert.equal(photoUrl("/team/a.webp", "https://site.example"), "https://site.example/team/a.webp");
  assert.equal(photoUrl("/team/a.webp", null), null);
  assert.equal(photoUrl("/team/a.webp", "http://site.example"), null);
  assert.equal(photoUrl("https://cdn.example/a.png", "https://site.example"), "https://cdn.example/a.png");
  assert.equal(photoUrl(undefined, "https://site.example"), null);
});

test("every person and news item, unique slugs, order of the website, the import format", () => {
  const doc = buildImport(team, NEWS, "https://site.example");
  assert.equal(doc.format, "nymbus-site-import");
  assert.equal(doc.version, 1);
  assert.equal(doc.team.length, team.length);
  assert.equal(doc.news.length, NEWS.length);
  const slugs = doc.team.map((m: { slug: string }) => m.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of [...slugs, ...doc.news.map((n: { slug: string }) => n.slug)]) assert.match(s, /^[a-z0-9][a-z0-9-]{0,99}$/);
  assert.deepEqual(doc.team.map((m: { name: string }) => m.name), team.map((m) => m.name));
  assert.deepEqual(doc.team.map((m: { order: number }) => m.order), team.map((_, i) => (i + 1) * 10));
  const first = doc.team[0];
  assert.equal(first.role.en, team[0].title);
  assert.equal(first.bio.fr, team[0].bioFr ?? "");
  assert.ok(doc.team.every((m: { photo: string | null }) => m.photo === null || m.photo.startsWith("https://")));
  assert.deepEqual(doc.news[0].title, NEWS[0].title);
  assert.equal(buildImport(team, NEWS).team.every((m: { photo: string | null }) => m.photo === null || m.photo.startsWith("https://")), true);
});
