/**
 * FTSE naming generations without overlap: the verified one-day gap link (index-levels.ts ftseGapCheck / joinFtseHistory),
 * and the broadened index-family matching. Synthetic index rows only.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ftseDaily,
  ftseEarlierGenerations,
  ftseFamily,
  ftseGapCheck,
  ftseReturnEstimate,
  joinFtseHistory,
  type FtseDay,
} from "../../../src/lib/pipeline/index-levels.ts";
import { bondDays } from "../../../src/lib/pipeline/market-calendar.ts";

/** a synthetic index whose daily return is the yield/duration estimate plus a small deterministic noise (±0.4 bp) */
function synth(
  from: string,
  to: string,
  opts: { gapNoise?: number; gapDay?: string; noise?: number } = {},
): Record<string, FtseDay> {
  const days = bondDays(from, to);
  const out: Record<string, FtseDay> = {};
  let level = 1000;
  days.forEach((d, i) => {
    const ytm = 4 + 0.3 * Math.sin(i / 20);
    const dur = 7 - 0.001 * i;
    if (i > 0) {
      const prev = out[days[i - 1]];
      const est = ftseReturnEstimate(
        prev,
        { ytm },
        Math.round((Date.parse(d) - Date.parse(days[i - 1])) / 86_400_000),
      )!;
      const noise = (opts.noise ?? 0.00004) * Math.sin(i * 1.7) + (d === opts.gapDay ? (opts.gapNoise ?? 0) : 0);
      level *= 1 + est + noise;
    }
    out[d] = { level, ytm, dur };
  });
  return out;
}
const split = (all: Record<string, FtseDay>, first: string, oldLast: string, rebase = 1) => {
  const cur = Object.fromEntries(
    Object.entries(all)
      .filter(([d]) => d >= first)
      .map(([d, x]) => [d, { ...x, level: x.level * rebase }]),
  );
  const old = Object.fromEntries(Object.entries(all).filter(([d]) => d <= oldLast));
  const lv = (x: Record<string, FtseDay>) => Object.fromEntries(Object.entries(x).map(([d, v]) => [d, v.level]));
  return { cur, old, curL: lv(cur), oldL: lv(old) };
};
const ALL = synth("2024-01-02", "2025-06-30");

test("gap link accepted: the earlier name ends on the bond-market day before the current one, same base, implied return = estimate", () => {
  const { cur, old, curL, oldL } = split(ALL, "2024-12-05", "2024-12-04");
  const g = ftseGapCheck(curL, cur, oldL, old);
  assert.ok(g.ok, g.ok ? "" : g.why);
  if (!g.ok) return;
  assert.equal(g.check.last, "2024-12-04");
  assert.equal(g.check.first, "2024-12-05");
  assert.ok(Math.abs(g.check.residual) <= g.check.threshold);
  assert.equal(g.check.threshold, 2e-4, "3 × p95 of ±0.4 bp residuals is below the 2 bp floor");
  assert.ok(g.check.samples > 300);
  const j = joinFtseHistory(
    curL,
    [{ name: "old_name", levels: oldL, why: "configured earlier name", daily: old, gapOk: true }],
    undefined,
    cur,
  );
  assert.deepEqual(
    j.used.map((u) => [u.name, u.kind, u.link]),
    [["old_name", "gap", "2024-12-05"]],
  );
  assert.equal(Object.keys(j.levels)[0], "2024-01-02");
  assert.equal(
    j.levels["2024-06-28"],
    ALL["2024-06-28"].level,
    "equal bases: the earlier levels are used as published",
  );
  // a loose name match (not the same index for sure) is never gap-linked
  const loose = joinFtseHistory(
    curL,
    [{ name: "old_name", levels: oldL, why: "name contains", daily: old, gapOk: false }],
    undefined,
    cur,
  );
  assert.deepEqual(loose.used, []);
  assert.match(loose.skipped[0], /gap links only for the same index/);
});

test("gap link rejected: re-based levels, a two-day gap, a gap-day return off the estimate", () => {
  const rebased = split(ALL, "2024-12-05", "2024-12-04", 0.87);
  const r = ftseGapCheck(rebased.curL, rebased.cur, rebased.oldL, rebased.old);
  assert.ok(!r.ok && /differ by -13\.\d+% \(re-based\)/.test(r.why), r.ok ? "accepted" : r.why);
  const two = split(ALL, "2024-12-05", "2024-12-03");
  const t = ftseGapCheck(two.curL, two.cur, two.oldL, two.old);
  assert.ok(
    !t.ok && /2 daily returns missing between 2024-12-03 and 2024-12-05 \(2024-12-04 without a level\)/.test(t.why),
    t.ok ? "accepted" : t.why,
  );
  // the gap day moved 0.5 % beyond the analytics: another index (or a re-basing), not linked
  const jump = synth("2024-01-02", "2025-06-30", { gapDay: "2024-12-05", gapNoise: 0.005 });
  const j = split(jump, "2024-12-05", "2024-12-04");
  const k = ftseGapCheck(j.curL, j.cur, j.oldL, j.old);
  assert.ok(!k.ok && /residual 50\.\d+ bp beyond 2\.00 bp/.test(k.why), k.ok ? "accepted" : k.why);
  // no yield / duration on the gap days: not verifiable
  const noY = split(ALL, "2024-12-05", "2024-12-04");
  noY.old["2024-12-04"] = { ...noY.old["2024-12-04"], ytm: null };
  const n = ftseGapCheck(noY.curL, noY.cur, noY.oldL, noY.old);
  assert.ok(!n.ok && /no average yield \/ modified duration/.test(n.why));
  // an overlap link always wins over a gap link
  const over = split(ALL, "2024-12-05", "2024-12-20");
  const both = joinFtseHistory(
    over.curL,
    [
      {
        name: "gap_name",
        levels: split(ALL, "2024-12-05", "2024-12-04").oldL,
        why: "family",
        daily: split(ALL, "2024-12-05", "2024-12-04").old,
        gapOk: true,
      },
      { name: "overlap_name", levels: over.oldL, why: "family", daily: over.old, gapOk: true },
    ],
    undefined,
    over.cur,
  );
  assert.equal(both.used[0].name, "overlap_name");
  assert.equal(both.used[0].kind, "overlap");
});

test("ftseDaily keeps the index row's average yield and modified duration (numbers or numeric strings)", () => {
  const d = ftseDaily([
    {
      date: "2024-12-04",
      total_return: 100,
      rating: null,
      term: null,
      industry_sector: null,
      industry_group: null,
      average_yield: 3.9,
      modified_duration: "7.1",
    },
    {
      date: "2024-12-05",
      total_return: 101,
      rating: null,
      term: null,
      industry_sector: null,
      industry_group: null,
      average_yield: null,
    },
  ]);
  assert.deepEqual(d, {
    "2024-12-04": { level: 100, ytm: 3.9, dur: 7.1 },
    "2024-12-05": { level: 101, ytm: null, dur: null },
  });
});

test("ftseFamily: word order, 'short term' / 'short', 'corporate' / 'corp', prefixes and 'overall' do not change the family", () => {
  assert.equal(ftseFamily("FTSE Canada Short Term Corporate Bond Index"), "short corp");
  assert.equal(ftseFamily("FTSE Canada Corporate Short Term Bond Index"), "short corp");
  assert.equal(ftseFamily("FTSE TMX Canada Short-Term Corporate Overall Bond Index"), "short corp");
  assert.equal(ftseFamily("FTSE Canada Short Corporate Bond Index"), "short corp");
  assert.equal(ftseFamily("FTSE Canada Short Term Overall Bond Index"), "short");
  assert.equal(ftseFamily("FTSE Canada Universe Corporate Bond Index"), "univ corp");
  assert.equal(ftseFamily("FTSE Canada Universe Bond Index"), "univ");
  assert.equal(ftseFamily("FTSE Canada Mid Term Corporate Bond Index"), "mid corp");
});

test("gap tolerance is capped at 5 bp; a copied level (zero implied return) is never a link", () => {
  // noisy analytics (±6 bp daily residuals): 3 × p95 would be about 18 bp, the tolerance stays at 5 bp
  const noisy = synth("2024-01-02", "2025-06-30", {
    noise: 0.0006,
    gapDay: "2024-12-05",
    gapNoise: -0.0006 * Math.sin(bondDays("2024-01-02", "2024-12-05").length * 1.7 - 1.7),
  });
  const n = split(noisy, "2024-12-05", "2024-12-04");
  const g = ftseGapCheck(n.curL, n.cur, n.oldL, n.old);
  assert.ok(g.ok, g.ok ? "" : g.why);
  if (g.ok) assert.equal(g.check.threshold, 5e-4);
  // a 7 bp gap residual: within 3 × p95 of these noisy series, beyond the 5 bp cap → rejected
  const off = synth("2024-01-02", "2025-06-30", {
    noise: 0.0006,
    gapDay: "2024-12-05",
    gapNoise: 0.0007 - 0.0006 * Math.sin(bondDays("2024-01-02", "2024-12-05").length * 1.7 - 1.7),
  });
  const o = split(off, "2024-12-05", "2024-12-04");
  const r = ftseGapCheck(o.curL, o.cur, o.oldL, o.old);
  assert.ok(!r.ok && /residual 7\.\d+ bp beyond 5\.00 bp/.test(r.why), r.ok ? "accepted" : r.why);
  // the current series starts with the earlier name's last level copied: zero implied return, rejected
  const { cur, old, curL, oldL } = split(ALL, "2024-12-05", "2024-12-04");
  const k = oldL["2024-12-04"] / curL["2024-12-05"];
  const copied = Object.fromEntries(Object.entries(curL).map(([d, v]) => [d, v * k]));
  const z = ftseGapCheck(copied, cur, oldL, old);
  assert.ok(!z.ok && /implied gap return is zero .*a copied level/.test(z.why), z.ok ? "accepted" : z.why);
});

/* ---------------------------------------------------------------- earlier generation under the SAME short_name */

/** index-summary rows of one short_name: the old generation (old name, no index_content) then the new one */
function rowsOf(
  all: Record<string, FtseDay>,
  cut: string,
  opts: { id?: number; oldId?: number; oldName?: string } = {},
): Record<string, unknown>[] {
  return Object.entries(all).map(([date, x]) => {
    const isNew = date >= cut;
    return {
      date,
      index_id: isNew ? (opts.id ?? 26029) : (opts.oldId ?? opts.id ?? 26029),
      index_name: isNew
        ? "FTSE Canada Short Term Corporate Bond Index"
        : (opts.oldName ?? "Short Corporate Bond Index"),
      total_return: x.level,
      average_yield: x.ytm,
      modified_duration: x.dur,
      rating: "All",
      term: "Short",
      industry_sector: "Corporate",
      industry_group: "All",
      index_content: isNew ? "Universe" : null,
    };
  });
}

test("same short_name renamed (2024-12): ftseDaily keeps the latest signature only; ftseEarlierGenerations returns the older one", () => {
  const rows = rowsOf(ALL, "2024-12-05") as never[];
  const cur = ftseDaily(rows);
  assert.equal(Object.keys(cur).sort()[0], "2024-12-05", "the current series starts at the renaming");
  const gens = ftseEarlierGenerations(rows, "2024-12-05");
  assert.equal(gens.length, 1);
  assert.equal(gens[0].indexName, "Short Corporate Bond Index");
  const days = Object.keys(gens[0].daily).sort();
  assert.equal(days[0], "2024-01-02");
  assert.equal(days[days.length - 1], "2024-12-04");
  // joined through the verified gap link, like a separately named generation
  const lv = (x: Record<string, FtseDay>) => Object.fromEntries(Object.entries(x).map(([d, v]) => [d, v.level]));
  const j = joinFtseHistory(
    lv(cur),
    [
      {
        name: "short_corp (earlier name)",
        levels: lv(gens[0].daily),
        daily: gens[0].daily,
        why: "same short_name",
        gapOk: true,
      },
    ],
    undefined,
    cur,
  );
  assert.deepEqual(
    j.used.map((u) => [u.kind, u.link]),
    [["gap", "2024-12-05"]],
  );
  assert.equal(Object.keys(j.levels).sort()[0], "2024-01-02");
});

test("same short_name: a re-based earlier generation is returned but the gap link refuses it (levels never compared blindly)", () => {
  const rebased = Object.fromEntries(
    Object.entries(ALL).map(([d, x]) => [d, d < "2024-12-05" ? { ...x, level: x.level * 0.5 } : x]),
  );
  const rows = rowsOf(rebased, "2024-12-05") as never[];
  const cur = ftseDaily(rows);
  const gens = ftseEarlierGenerations(rows, "2024-12-05");
  assert.equal(gens.length, 1);
  const lv = (x: Record<string, FtseDay>) => Object.fromEntries(Object.entries(x).map(([d, v]) => [d, v.level]));
  const j = joinFtseHistory(
    lv(cur),
    [{ name: "old", levels: lv(gens[0].daily), daily: gens[0].daily, why: "same short_name", gapOk: true }],
    undefined,
    cur,
  );
  assert.equal(j.used.length, 0);
  assert.match(j.skipped.join(" "), /re-based/);
});

test("same short_name: rows of another index_id are never taken as an earlier generation", () => {
  const rows = rowsOf(ALL, "2024-12-05", { id: 26029, oldId: 99999 }) as never[];
  assert.deepEqual(ftseEarlierGenerations(rows, "2024-12-05"), []);
});

test("same short_name: nothing earlier → no generation; a single generation is unchanged", () => {
  const rows = rowsOf(ALL, "2000-01-01") as never[];
  assert.deepEqual(ftseEarlierGenerations(rows, Object.keys(ftseDaily(rows)).sort()[0]), []);
});
