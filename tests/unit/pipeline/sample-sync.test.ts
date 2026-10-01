/** The committed synthetic datasets are exactly what `npm run pipeline -- sample` regenerates from the fixtures. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildClassHSample, buildSample, CLASS_H_SAMPLE_PATH, SAMPLE_PATH } from "../../../src/lib/pipeline/sample.ts";

test("sample-site-data.json (SEB class F) and the e2e class H fixture are in sync with the fixtures", async () => {
  const sample = JSON.parse(await readFile(SAMPLE_PATH, "utf8"));
  assert.deepEqual(sample, JSON.parse(JSON.stringify(await buildSample())), "run: npm run pipeline -- sample");
  assert.equal(sample.funds["sustainable-enhanced-bonds"].performance.returnClass, "F");
  const h = JSON.parse(await readFile(CLASS_H_SAMPLE_PATH, "utf8"));
  assert.deepEqual(h, JSON.parse(JSON.stringify(await buildClassHSample())), "run: npm run pipeline -- sample");
  assert.equal(h.mode, "live");
  assert.deepEqual(Object.keys(h.funds), ["sustainable-enhanced-bonds"]);
  assert.equal(h.funds["sustainable-enhanced-bonds"].performance.classCode, "STRATEGY_H");
  assert.equal(h.funds["sustainable-enhanced-bonds"].performance.returnClassLabel, "Series H");
});
