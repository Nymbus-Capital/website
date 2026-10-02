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
import { classServedRoute, fixtureEnv, mockFetch } from "../../../tests/fixtures/pipeline/mock-fetch.ts";

export const SAMPLE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/sample-site-data.json");

export async function buildSample(): Promise<SiteData> {
  const now = new Date(FIXTURE_NOW);
  const raw = await fetchAll({ fetchImpl: mockFetch(classServedRoute()).fetch, now, env: fixtureEnv() });
  const { data } = buildSiteData(raw, null, now, { mode: "sample" });
  // the sample mirrors what each fund really has: no placeholders for blocks a fund lacks
  data.provenance = Object.fromEntries(Object.entries(data.provenance).map(([k, v]) => [k, `SYNTHETIC sample: ${v}`]));
  data.issues = [{ key: "site", level: "info", message: "Illustrative synthetic data (mode \"sample\"): not real fund figures." }, ...data.issues];
  return data;
}

export async function writeSample(file = SAMPLE_PATH): Promise<SiteData> {
  const data = await buildSample();
  await writeFile(file, JSON.stringify(data, null, 1) + "\n");
  return data;
}

