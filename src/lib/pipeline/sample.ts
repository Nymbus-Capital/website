/**
 * Regenerates `src/lib/data/sample-site-data.json` (mode "sample") by running fetch + build against the
 * SYNTHETIC fixtures of tests/fixtures/pipeline (no network, no real data). Used by `npm run pipeline -- sample`.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Bucket, Characteristic, FundData, SiteData } from "../data/types.ts";
import { buildSiteData } from "./build.ts";
import { fetchAll } from "./sources/index.ts";
import { FIXTURE_NOW } from "../../../tests/fixtures/pipeline/generate.ts";
import { fixtureEnv, mockFetch } from "../../../tests/fixtures/pipeline/mock-fetch.ts";

export const SAMPLE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/sample-site-data.json");

export async function buildSample(): Promise<SiteData> {
  const now = new Date(FIXTURE_NOW);
  const raw = await fetchAll({ fetchImpl: mockFetch().fetch, now, env: fixtureEnv() });
  const { data } = buildSiteData(raw, null, now, { mode: "sample" });
  fillForUi(data);
  data.provenance = Object.fromEntries(Object.entries(data.provenance).map(([k, v]) => [k, `SYNTHETIC sample: ${v}`]));
  data.issues = [{ key: "site", level: "info", message: "Illustrative synthetic data (mode \"sample\"): not real fund figures." }, ...data.issues];
  return data;
}

export async function writeSample(file = SAMPLE_PATH): Promise<SiteData> {
  const data = await buildSample();
  await writeFile(file, JSON.stringify(data, null, 1) + "\n");
  return data;
}

/**
 * The sample must exercise every block of the UI, including blocks a fund does not have in reality
 * (GMV has no NAV/AUM, Multi-Strategy no ESG metrics or credit breakdown). Those are filled with
 * obviously synthetic placeholders and flagged in the provenance. NEVER used for live data.
 */
function fillForUi(data: SiteData): void {
  const bucket = (labels: string[], ws: number[], withIndex: boolean): Bucket[] =>
    labels.map((label, i) => (withIndex ? { label, fund: ws[i], index: Math.round((ws[i] * 0.9 + 0.02) * 1000) / 1000 } : { label, fund: ws[i] }));
  for (const f of Object.values(data.funds) as FundData[]) {
    const base = `funds.${f.key}`;
    const filled: string[] = [];
    if (!f.nav) {
      f.nav = { asOf: data.asOf.nav, classes: [{ fundserv: "SAMPLE01", display: "F", currency: "CAD", nav: 10.1234, date: data.asOf.nav, prevNav: 10.1111, prevDate: "2026-09-25", change: 0.0123, changePct: 0.0012165 }] };
      filled.push("nav");
    }
    if (!f.aum) {
      f.aum = { cad: 25_000_000, asOf: data.asOf.aum ?? "2026-09-28" };
      filled.push("aum");
    }
    if (!f.characteristics.length) {
      f.characteristics = [
        { id: "numberOfContracts", label: { en: "Number of futures contracts", fr: "Nombre de contrats à terme" }, fund: 24, unit: "int" },
        { id: "targetDownsideVol", label: { en: "Target downside volatility", fr: "Volatilité baissière cible" }, fund: 0.06, unit: "pct" },
      ] as Characteristic[];
      filled.push("characteristics");
    }
    if (!f.esg.length) {
      f.esg = [
        { id: "spGlobalEsgRank", label: { en: "S&P Global ESG rank", fr: "Rang ESG S&P Global" }, fund: 68.2, index: 61.5, unit: "num" },
        { id: "carbonIntensity", label: { en: "Carbon intensity", fr: "Intensité carbone" }, fund: 88.1, index: 131.4, unit: "num" },
      ];
      filled.push("esg");
    }
    const b = f.breakdowns;
    const withIndex = f.key === "monthly-income" || f.key === "sustainable-enhanced-bonds";
    if (!b.credit) { b.credit = bucket(["AAA", "AA", "A", "BBB"], [0.2, 0.3, 0.3, 0.2], withIndex); filled.push("breakdowns.credit"); }
    if (!b.sectors) { b.sectors = bucket(["Sector A", "Sector B", "Sector C"], [0.5, 0.3, 0.2], withIndex); filled.push("breakdowns.sectors"); }
    if (!b.curve) { b.curve = bucket(["0-3 yrs", "3-10 yrs", ">10 yrs"], [0.4, 0.4, 0.2], withIndex); filled.push("breakdowns.curve"); }
    if (!b.country) { b.country = bucket(["Canada", "United States", "Other"], [0.6, 0.3, 0.1], withIndex); filled.push("breakdowns.country"); }
    if (!b.assetClass) { b.assetClass = bucket(["Fixed income", "Protection overlay", "Cash"], [0.9, 0.06, 0.04], false); filled.push("breakdowns.assetClass"); }
    if (!f.topHoldings.length) { f.topHoldings = [{ name: "Synthetic Holding A", weight: 0.05 }, { name: "Synthetic Holding B", weight: 0.04 }]; filled.push("topHoldings"); }
    if (!f.factsheetMonth) { f.factsheetMonth = data.asOf.factsheet; filled.push("factsheetMonth"); }
    if (filled.length) data.provenance[`${base}.sampleFill`] = `placeholders for UI testing only (this block does not exist for this fund in the real sources): ${filled.join(", ")}`;
  }
}
