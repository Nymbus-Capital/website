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
  // anchor = 2026-09-25 (latest single-row day); 2026-09-26 has one row with that signature: kept
  assert.deepEqual(ftseLevels(rows), { "2026-09-25": 100, "2026-09-26": 101 });
  const s = ftseGroupingSummary(rows);
  assert.match(s, /^3 rows; 2026-09-26: 2 rows, 2 with total_return;/);
  assert.match(s, /rating=\["AA","AAA"\]/);
  assert.match(s, /industry_group=\[null\]/);
  assert.equal(ftseGroupingSummary([]), "0 rows");
});

test("one row per day is the index itself (dataplatform shape: short_corp = Short / Corporate)", () => {
  const rows = [
    { date: "2026-08-31", total_return: 812.4, rating: "All", term: "Short", industry_sector: "Corporate", industry_group: "All" },
    { date: "2026-09-28", total_return: 815.1, rating: "All", term: "Short", industry_sector: "Corporate", industry_group: "All" },
  ];
  assert.deepEqual(ftseLevels(rows), { "2026-08-31": 812.4, "2026-09-28": 815.1 });
});

const idx = { rating: "All", term: "Short", industry_sector: "Corporate", industry_group: "All", index_content: "Universe", index_name: "FTSE Short Corporate" };
const other = { ...idx, term: "Short Term", index_name: "FTSE Short Term Corporate" };

test("a day from another index (same slug) never enters the series", () => {
  const rows = [
    { date: "2026-09-24", total_return: 100, ...idx },
    { date: "2026-09-25", total_return: 555, ...other }, // single row, foreign signature: dropped
    { date: "2026-09-26", total_return: 101, ...idx },
    { date: "2026-09-26", total_return: 556, ...other }, // two rows: the matching one is kept
    { date: "2026-09-27", total_return: 999, rating: "All", term: "All", industry_sector: "All", industry_group: "All" }, // aggregate of something else: dropped
    { date: "2026-09-28", total_return: 102, ...idx },
  ];
  assert.deepEqual(ftseLevels(rows), { "2026-09-24": 100, "2026-09-26": 101, "2026-09-28": 102 });
});

test("no single-row day to anchor the signature: nothing is used", () => {
  const rows = [
    { date: "2026-09-28", total_return: 100, ...idx },
    { date: "2026-09-28", total_return: 200, ...other },
  ];
  assert.deepEqual(ftseLevels(rows), {});
});
