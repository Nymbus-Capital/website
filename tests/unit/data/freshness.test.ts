/**
 * One freshness rule for the daily portfolio book (data/freshness.ts): the pipeline selection, the validation gate and
 * the render-time gate agree on every boundary.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { bookAgeDays, bookAgeProblem, dropStalePortfolio, isFreshBook, PORTFOLIO_MAX_AGE_DAYS } from "../../../src/lib/data/freshness.ts";
import { PORTFOLIO } from "../../../src/lib/pipeline/config.ts";
import { parseFundPortfolio } from "../../../src/lib/pipeline/sources/contracts.ts";
import { selectPortfolio } from "../../../src/lib/pipeline/portfolio.ts";
import { checkPortfolio } from "../../../src/lib/pipeline/validate/index.ts";
import { hasDailyPortfolio } from "../../../src/components/fund/lib/portfolio.ts";
import sample from "../../../src/lib/data/sample-site-data.json" with { type: "json" };
import type { FundData, SiteData } from "../../../src/lib/data/types.ts";
import { loadFixture } from "../../fixtures/pipeline/mock-fetch.ts";

const site = sample as unknown as SiteData;
const mi = (): FundData => structuredClone(site.funds["monthly-income"]!);

test("freshness: whole calendar days, 7 days still daily, 8 not, one day of future slack; the config uses the same value", () => {
  assert.equal(PORTFOLIO.maxAgeDays, PORTFOLIO_MAX_AGE_DAYS);
  const now = new Date("2026-09-29T00:00:00Z");
  assert.equal(bookAgeDays("2026-09-22", now), 7);
  assert.equal(bookAgeDays("2026-09-21", now), 8);
  assert.ok(isFreshBook("2026-09-22", new Date("2026-09-29T23:59:59Z")));
  assert.match(bookAgeProblem("2026-09-21", now)!, /is 8 days old/);
  assert.ok(isFreshBook("2026-09-30", now), "tomorrow (time zones)");
  assert.match(bookAgeProblem("2026-10-01", now)!, /future/);
  assert.match(bookAgeProblem("2026-9-1", now)!, /invalid/);
  assert.ok(Number.isNaN(bookAgeDays("x", now)));
});

test("freshness: selection, validation gate and render gate agree at the boundary (exactly 8 days at midnight)", () => {
  // before the fix the validation gate accepted up to 8 fractional days while the selection stopped at 7 whole days
  const now = new Date("2026-09-29T00:00:00Z");
  const book = parseFundPortfolio({ ...(loadFixture("dataplatform/portfolio_SEST.json") as object), as_of: "2026-09-21" })!;
  assert.equal(selectPortfolio({ ok: true, data: book }, { base: "b", short: "SEST", now, greenBonds: false }).portfolio, null);
  const f = mi();
  f.portfolio!.asOf = "2026-09-21";
  assert.equal(hasDailyPortfolio(f.portfolio, now), false);
  assert.equal(dropStalePortfolio(f, now)!.portfolio, null);
  const issues = checkPortfolio(f, "b", now);
  assert.equal(f.portfolio, null);
  assert.match(issues[0].message, /is 8 days old/);
});

test("render gate: a stale book is dropped (copy, input untouched); a fresh one keeps the same object", () => {
  const f = Object.freeze(mi());
  const fresh = new Date("2026-09-29T14:00:00Z");
  assert.equal(dropStalePortfolio(f, fresh), f);
  assert.equal(hasDailyPortfolio(f.portfolio, fresh), true);
  const later = new Date("2026-10-07T14:00:00Z");
  const out = dropStalePortfolio(f, later)!;
  assert.equal(out.portfolio, null);
  assert.ok(f.portfolio, "input untouched");
  assert.equal(out.performance, f.performance, "everything else as published");
  assert.equal(hasDailyPortfolio(f.portfolio, later), false);
  assert.equal(hasDailyPortfolio(f.portfolio), true, "without a date: structure only");
  assert.equal(dropStalePortfolio(null, later), null);
  const noBook = { ...mi(), portfolio: null };
  assert.equal(dropStalePortfolio(noBook, later), noBook);
});
