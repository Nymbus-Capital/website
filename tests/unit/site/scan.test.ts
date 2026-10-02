/**
 * Home analysis scan: the generated rows are deterministic and generic (no issuer names, no performance), the
 * layout fits every width, the counters count only what the animation scans, and the copy exists in EN and FR.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { COLUMNS, COMPACT_KEYS, HIT_RATE, MEDIUM_KEYS, SECTORS, columnsFor, countersAfter, flicker, fmtNum, fmtZ, groupDigits, hash01, layout, rowAt, scanProgress } from "../../../src/components/site/fx/scan-model.ts";
import { SCAN_COPY } from "../../../src/components/site/fx/scan-copy.ts";

test("hash01 is deterministic and in [0, 1)", () => {
  assert.equal(hash01(5, 2, 1), hash01(5, 2, 1));
  assert.notEqual(hash01(5, 2, 1), hash01(5, 2, 2));
  for (let i = 0; i < 2000; i++) { const v = hash01(i, 3, 7); assert.ok(v >= 0 && v < 1); }
});

test("rows are deterministic, generic and self-consistent", () => {
  for (let n = 0; n < 500; n++) {
    const r = rowAt(n);
    assert.deepEqual(r, rowAt(n));
    assert.match(r.id, /^ID-\d{4}$/);
    assert.ok(r.sector >= 0 && r.sector < SECTORS.length);
    assert.ok(r.term >= 0.5 && r.term <= 30);
    assert.ok(r.spread >= 20 && r.spread <= 400);
    assert.ok(r.score >= -1 && r.score <= 1);
    // a flagged row carries a decisive score
    if (r.hit) assert.ok(Math.abs(r.score) >= 0.6, `row ${n}`);
    r.z.forEach((z) => assert.ok(Math.abs(z) <= 3.5));
  }
});

test("about 12 % of the rows are flagged", () => {
  let hits = 0;
  const N = 5000;
  for (let n = 0; n < N; n++) if (rowAt(n).hit) hits++;
  assert.ok(Math.abs(hits / N - HIT_RATE) < 0.02, `${hits / N}`);
});

test("the table names no issuer: sectors are generic labels, EN and FR", () => {
  assert.ok(SECTORS.length >= 8);
  for (const s of SECTORS) { assert.ok(s.en.trim() && s.fr.trim()); assert.ok(s.en.split(/\s+/).length <= 2); }
  for (const c of COLUMNS) assert.ok(c.label.en.trim() && c.label.fr.trim());
});

test("columns: compact and medium widths keep the identifier and the signal; layout fills the width", () => {
  assert.deepEqual(columnsFor(360).map((c) => c.key), COMPACT_KEYS);
  assert.deepEqual(columnsFor(700).map((c) => c.key), MEDIUM_KEYS);
  assert.equal(columnsFor(1200).length, COLUMNS.length);
  for (const w of [320, 390, 700, 1024, 1400]) {
    const cols = columnsFor(w);
    assert.ok(cols[0].key === "id" && cols[cols.length - 1].key === "signal");
    const lay = layout(cols, w, 16);
    assert.equal(lay.length, cols.length);
    assert.ok(Math.abs(lay[0].x - 16) < 1e-9);
    const end = lay[lay.length - 1];
    assert.ok(Math.abs(end.x + end.w - (w - 16)) < 1e-6);
    lay.forEach((l, i) => i && assert.ok(Math.abs(l.x - (lay[i - 1].x + lay[i - 1].w)) < 1e-6));
  }
});

test("number formatting: true minus, French decimal comma, no negative zero", () => {
  assert.equal(fmtNum(-1.25, 1), "−1.3");
  assert.equal(fmtNum(2.5, 2, "fr"), "2,50");
  assert.equal(fmtNum(-0.04, 1), "0.0");
  assert.equal(fmtZ(1.24), "+1.2");
  assert.equal(fmtZ(-0.8), "−0.8");
  assert.equal(fmtZ(0.01), "0.0");
  assert.equal(groupDigits(1234567), "1,234,567");
  assert.equal(groupDigits(1234567, "fr"), "1 234 567");
  assert.equal(groupDigits(-3), "0");
});

test("flicker settles on the true value and only moves unsettled cells", () => {
  assert.equal(flicker(1.5, 3, 2, 10, 1, 2), 1.5);
  assert.notEqual(flicker(1.5, 3, 2, 10, 0, 2), 1.5);
  assert.equal(flicker(1.5, 3, 2, 10, 0, 0), 1.5);
  // later ticks give other values
  assert.notEqual(flicker(1.5, 3, 2, 10, 0.2, 2), flicker(1.5, 3, 2, 11, 0.2, 2));
});

test("counters count only the rows the animation has scanned", () => {
  assert.deepEqual(countersAfter(0, 8), { datapoints: 0, securities: 0, signals: 0 });
  const c = countersAfter(200, 8);
  assert.equal(c.securities, 200);
  assert.equal(c.datapoints, 1600);
  let hits = 0;
  for (let i = 0; i < 200; i++) if (rowAt(i).hit) hits++;
  assert.equal(c.signals, hits);
  assert.deepEqual(countersAfter(-5, 8), { datapoints: 0, securities: 0, signals: 0 });
});

test("scan progress runs 0 → 1, rests, then starts a new cycle; it never leaves [0, 1]", () => {
  assert.deepEqual(scanProgress(0), { k: 0, resting: false, cycle: 0 });
  const mid = scanProgress(2600);
  assert.ok(Math.abs(mid.k - 0.5) < 1e-9);
  const rest = scanProgress(5300);
  assert.equal(rest.k, 1); assert.equal(rest.resting, true);
  assert.equal(scanProgress(5700).cycle, 1);
  let prev = -1;
  for (let t = 0; t < 5200; t += 50) { const { k } = scanProgress(t); assert.ok(k >= 0 && k <= 1 && k >= prev); prev = k; }
});

test("scan copy exists in English and French and labels the animation as an illustration", () => {
  const walk = (x: unknown, path: string) => {
    if (x && typeof x === "object" && "en" in x && "fr" in x) {
      const v = x as { en: string; fr: string };
      assert.ok(v.en.trim() && v.fr.trim(), path);
    } else if (Array.isArray(x)) x.forEach((v, i) => walk(v, `${path}[${i}]`));
    else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) walk(v, `${path}.${k}`);
  };
  walk(SCAN_COPY, "SCAN_COPY");
  assert.match(SCAN_COPY.illustration.en, /illustration/i);
  assert.match(SCAN_COPY.caption.en, /not actual securities, signals or results/);
  assert.match(SCAN_COPY.caption.fr, /pas de titres, de signaux ni de résultats réels/);
});
