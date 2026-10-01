import { test } from "node:test";
import assert from "node:assert/strict";
import { isPinnable } from "../../../src/components/admin/summary.ts";

test("only published live runs can be pinned", () => {
  const live = { mode: "live" };
  assert.equal(isPinnable({ status: "published" }, live), true);
  assert.equal(isPinnable({ status: "blocked", publishedAt: "2026-09-01T00:00:00Z" }, live), true);
  assert.equal(isPinnable({ status: "blocked" }, live), false);
  assert.equal(isPinnable({ status: "pending-review" }, live), false);
  assert.equal(isPinnable({ status: "pending-review", publishedAt: "x" }, live), false);
  assert.equal(isPinnable({ status: "failed" }, live), false);
  assert.equal(isPinnable({ status: "dry-run" }, live), false);
  assert.equal(isPinnable({ status: "published" }, { mode: "sample" }), false);
  assert.equal(isPinnable({ status: "published" }, null), false);
});
