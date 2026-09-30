/**
 * In-memory cache of the published data / content (src/lib/data/cache.ts): read once, reused until the file changes;
 * a write through the store invalidates at once; a write by another process is seen at the next re-check.
 */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rename, writeFile, mkdir } from "node:fs/promises";
import { promises as fsp } from "node:fs";
import os from "node:os";
import path from "node:path";
import { cachedFileCount, clearDataCache, readJsonCached } from "../../../src/lib/data/cache.ts";
import { writeJson, removePath } from "../../../src/lib/data/store.ts";

let dir = "";
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "cache-"));
  process.env.SITE_DATA_DIR = dir;
  clearDataCache();
});

/** counts readFile calls made through file handles (the cache reads through fs.open) */
function countOpens(): { n: () => number; restore: () => void } {
  const orig = fsp.open;
  let n = 0;
  (fsp as { open: typeof fsp.open }).open = (async (...a: Parameters<typeof fsp.open>) => { n++; return orig(...a); }) as typeof fsp.open;
  return { n: () => n, restore: () => { (fsp as { open: typeof fsp.open }).open = orig; } };
}

/** another process replacing the file (temp + rename, like the store): the write generation of this process does not move */
async function externalWrite(rel: string[], value: unknown): Promise<void> {
  const target = path.join(dir, ...rel);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(`${target}.ext`, JSON.stringify(value));
  await rename(`${target}.ext`, target);
}

test("cache: a missing file gives the fallback; the file is parsed once and reused", async () => {
  assert.equal(await readJsonCached(["published", "site-data.json"], null), null);
  await writeJson(["published", "site-data.json"], { v: 1 });
  const opens = countOpens();
  try {
    const a = await readJsonCached<{ v: number }>(["published", "site-data.json"], null);
    const b = await readJsonCached<{ v: number }>(["published", "site-data.json"], null);
    const c = await readJsonCached<{ v: number }>(["published", "site-data.json"], null, { recheckMs: 0 });
    assert.deepEqual(a, { v: 1 });
    assert.equal(a, b, "same object: no second parse");
    assert.equal(a, c, "unchanged identity after a re-check: no second parse");
    assert.equal(opens.n(), 1);
  } finally {
    opens.restore();
  }
  assert.equal(cachedFileCount(), 1);
});

test("cache: values are frozen (callers cannot corrupt what the next request sees)", async () => {
  await writeJson(["content", "site-content.json"], { funds: { a: { hide: { nav: true } } } });
  const v = await readJsonCached<{ funds: { a: { hide: { nav: boolean } } } }>(["content", "site-content.json"], null);
  assert.throws(() => { v.funds.a.hide.nav = false; }, TypeError);
});

test("cache: a publish / rollback / content save through the store invalidates immediately (even within the re-check window)", async () => {
  await writeJson(["published", "site-data.json"], { runId: "A" });
  assert.deepEqual(await readJsonCached(["published", "site-data.json"], null, { recheckMs: 60_000 }), { runId: "A" });
  await writeJson(["published", "site-data.json"], { runId: "B" });
  assert.deepEqual(await readJsonCached(["published", "site-data.json"], null, { recheckMs: 60_000 }), { runId: "B" });
  await removePath(["published", "site-data.json"]);
  assert.equal(await readJsonCached(["published", "site-data.json"], "gone", { recheckMs: 60_000 }), "gone");
});

test("cache: a write by another process is seen at the next re-check, not before", async () => {
  await writeJson(["published", "site-data.json"], { runId: "A" });
  await readJsonCached(["published", "site-data.json"], null, { recheckMs: 60_000 });
  await externalWrite(["published", "site-data.json"], { runId: "CLI" });
  assert.deepEqual(await readJsonCached(["published", "site-data.json"], null, { recheckMs: 60_000 }), { runId: "A" }, "within the window: cached");
  assert.deepEqual(await readJsonCached(["published", "site-data.json"], null, { recheckMs: 0 }), { runId: "CLI" }, "re-checked: new file seen");
  // same size, same content length, written in the same millisecond: the inode differs (atomic replace)
  await externalWrite(["published", "site-data.json"], { runId: "CLJ" });
  assert.deepEqual(await readJsonCached(["published", "site-data.json"], null, { recheckMs: 0 }), { runId: "CLJ" });
});

test("cache: concurrent requests share one load and all see the same value", async () => {
  await writeJson(["published", "site-data.json"], { big: Array.from({ length: 5000 }, (_, i) => i) });
  clearDataCache();
  const opens = countOpens();
  try {
    const all = await Promise.all(Array.from({ length: 25 }, () => readJsonCached<{ big: number[] }>(["published", "site-data.json"], null)));
    assert.equal(opens.n(), 1);
    assert.ok(all.every((x) => x === all[0]));
  } finally {
    opens.restore();
  }
});

test("cache: a request after a write never gets the value of a load started before it", async () => {
  await writeJson(["published", "site-data.json"], { runId: "old" });
  clearDataCache();
  const first = readJsonCached(["published", "site-data.json"], null); // load in flight
  await writeJson(["published", "site-data.json"], { runId: "new" });
  const second = await readJsonCached(["published", "site-data.json"], null);
  assert.deepEqual(second, { runId: "new" });
  assert.ok(["old", "new"].includes(((await first) as { runId: string }).runId));
  assert.deepEqual(await readJsonCached(["published", "site-data.json"], null), { runId: "new" }, "the older load did not overwrite the newer entry");
  assert.equal(JSON.parse(await readFile(path.join(dir, "published", "site-data.json"), "utf8")).runId, "new");
});

test("cache: invalid JSON throws and is not cached", async () => {
  await externalWrite(["content", "site-content.json"], {});
  await writeFile(path.join(dir, "content", "site-content.json"), "{oops");
  await assert.rejects(readJsonCached(["content", "site-content.json"], null, { recheckMs: 0 }), SyntaxError);
  await writeJson(["content", "site-content.json"], { ok: true });
  assert.deepEqual(await readJsonCached(["content", "site-content.json"], null), { ok: true });
});
