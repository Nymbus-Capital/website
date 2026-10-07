import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "nymbus-content-"));
process.env.SITE_DATA_DIR = dir;

const { saveContent, updateContent, currentVersion, ContentConflictError, EMPTY_CONTENT } =
  await import("../../../src/lib/data/content.ts");

after(() => rmSync(dir, { recursive: true, force: true }));

test("first save needs version 0 and produces version 1", async () => {
  assert.equal(await currentVersion(), 0);
  const saved = await saveContent(
    { ...EMPTY_CONTENT, version: 0, pipeline: { publishMode: "review" } },
    "alice@nymbus.ca",
  );
  assert.equal(saved.version, 1);
  assert.equal(saved.updatedBy, "alice@nymbus.ca");
  assert.equal(saved.pipeline.publishMode, "review");
  assert.equal(await currentVersion(), 1);
});

test("a stale version is rejected with a 409 conflict and nothing is written", async () => {
  await assert.rejects(
    saveContent({ ...EMPTY_CONTENT, version: 0 }, "bob@nymbus.ca"),
    (e: unknown) => e instanceof ContentConflictError && e.status === 409 && e.expected === 0 && e.actual === 1,
  );
  assert.equal(await currentVersion(), 1);
});

test("updates apply to the latest stored document and keep history", async () => {
  const s2 = await updateContent(
    1,
    (c) => ({ ...c, funds: { ...c.funds, "multi-strategy": { mer: "1.2%" } } }),
    "alice@nymbus.ca",
  );
  assert.equal(s2.version, 2);
  assert.equal(s2.pipeline.publishMode, "review", "other fields preserved");
  assert.equal(s2.funds["multi-strategy"]?.mer, "1.2%");
  assert.ok(readdirSync(path.join(dir, "content", "history")).length >= 1);
});

test("two concurrent saves on the same version: exactly one wins", async () => {
  const v = await currentVersion();
  const results = await Promise.allSettled([
    updateContent(v, (c) => ({ ...c, firm: { ...c.firm, aumLabel: { en: "A", fr: "A" } } }), "a@nymbus.ca"),
    updateContent(v, (c) => ({ ...c, firm: { ...c.firm, aumLabel: { en: "B", fr: "B" } } }), "b@nymbus.ca"),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  const rejected = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
  assert.ok(rejected.reason instanceof ContentConflictError);
  assert.equal(await currentVersion(), v + 1);
});

test("defaults are the single source: first fund save on an empty store keeps publish mode review", async () => {
  const { mkdtempSync } = await import("node:fs");
  const prev = process.env.SITE_DATA_DIR;
  process.env.SITE_DATA_DIR = mkdtempSync(path.join(tmpdir(), "nymbus-content-empty-"));
  try {
    const { DEFAULT_CONTENT } = await import("../../../src/lib/data/defaults.ts");
    assert.equal(DEFAULT_CONTENT.pipeline.publishMode, "review");
    assert.deepEqual(DEFAULT_CONTENT.firm.aumLabel, { en: "$1.9B", fr: "1,9 G$" });
    assert.equal(EMPTY_CONTENT, DEFAULT_CONTENT);
    const saved = await updateContent(
      0,
      (c) => ({ ...c, funds: { ...c.funds, "monthly-income": { tagline: { en: "x", fr: "y" } } } }),
      "a@nymbus.ca",
    );
    assert.equal(saved.pipeline.publishMode, "review");
    assert.deepEqual(saved.firm.aumLabel, { en: "$1.9B", fr: "1,9 G$" });
    // defaults object never mutated by a save
    assert.deepEqual(DEFAULT_CONTENT.funds, {});
  } finally {
    process.env.SITE_DATA_DIR = prev;
  }
});
