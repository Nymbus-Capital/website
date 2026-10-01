/**
 * Regenerates `src/lib/data/sample-site-data.json` (mode "sample") by running fetch + build against the
 * SYNTHETIC fixtures of tests/fixtures/pipeline (no network, no real data). Used by `npm run pipeline -- sample`.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SiteData } from "../data/types.ts";
import { buildSiteData } from "./build.ts";
import { fetchAll } from "./sources/index.ts";
import { FIXTURE_NOW } from "../../../tests/fixtures/pipeline/generate.ts";
import { fixtureEnv, fullHistoryRoute, mockFetch } from "../../../tests/fixtures/pipeline/mock-fetch.ts";

export const SAMPLE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/sample-site-data.json");

export async function buildSample(): Promise<SiteData> {
  const now = new Date(FIXTURE_NOW);
  // the dataplatform as it serves class_code + history=full (SEB shown with its class F series, Gabriel 2026-10-01)
  const raw = await fetchAll({ fetchImpl: mockFetch(fullHistoryRoute).fetch, now, env: fixtureEnv() });
  const { data } = buildSiteData(raw, null, now, { mode: "sample" });
  // the sample mirrors what each fund really has: no placeholders for blocks a fund lacks
  data.provenance = Object.fromEntries(Object.entries(data.provenance).map(([k, v]) => [k, `SYNTHETIC sample: ${v}`]));
  data.issues = [{ key: "site", level: "info", message: "Illustrative synthetic data (mode \"sample\"): not real fund figures." }, ...data.issues];
  return data;
}

/** e2e fixture: the SEB fund as the dataplatform serves it before PR #626 (class H), pinned by an e2e admin test */
export const CLASS_H_SAMPLE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../e2e/fixtures/seb-class-h-site-data.json");

/**
 * SYNTHETIC SEB data built from the fixtures WITHOUT the full-history route (class H labelled H), as a "live" run
 * snapshot (the only kind an admin can pin), SEB only.
 */
export async function buildClassHSample(): Promise<SiteData> {
  const now = new Date(FIXTURE_NOW);
  const raw = await fetchAll({ fetchImpl: mockFetch().fetch, now, env: fixtureEnv() });
  const { data } = buildSiteData(raw, null, now, { mode: "live" });
  const key = "sustainable-enhanced-bonds" as const;
  return {
    ...data,
    funds: { [key]: data.funds[key] },
    provenance: Object.fromEntries(Object.entries(data.provenance).filter(([k]) => k.startsWith(`funds.${key}`)).map(([k, v]) => [k, `SYNTHETIC e2e fixture: ${v}`])),
    issues: [{ key: "site", level: "info", message: "Synthetic e2e fixture (SEB class H): not real fund figures." }],
  };
}

export async function writeSample(file = SAMPLE_PATH): Promise<SiteData> {
  const data = await buildSample();
  await writeFile(file, JSON.stringify(data, null, 1) + "\n");
  await writeFile(CLASS_H_SAMPLE_PATH, JSON.stringify(await buildClassHSample(), null, 1) + "\n");
  return data;
}

