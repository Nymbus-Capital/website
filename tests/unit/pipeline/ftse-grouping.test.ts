// ftse-grouping.test.ts — diagnostic summary when no aggregate FTSE row is found
import { test } from "node:test";
import assert from "node:assert/strict";
import { ftseGroupingSummary, ftseLevels } from "../../../src/lib/pipeline/metrics.ts";

test("summarises the grouping values of the latest date", () => {
  const rows = [
    { date: "2026-09-25", total_return: 100, rating: "AAA", term: "Short", industry_sector: "Federal", industry_group: null },
    { date: "2026-09-26", total_return: 101, rating: "AAA", term: "Short", industry_sector: "Federal", industry_group: null },
    { date: "2026-09-26", total_return: 102, rating: "AA", term: "Short", industry_sector: "Corporate", industry_group: null },
  ];
  assert.deepEqual(ftseLevels(rows), {});
  const s = ftseGroupingSummary(rows);
  assert.match(s, /^3 rows; 2026-09-26: 2 rows, 2 with total_return;/);
  assert.match(s, /rating=\["AA","AAA"\]/);
  assert.match(s, /industry_group=\[null\]/);
  assert.equal(ftseGroupingSummary([]), "0 rows");
});
