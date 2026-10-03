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
import { fixtureEnv, json, loadFixture, mockFetch } from "../../../tests/fixtures/pipeline/mock-fetch.ts";
import { parseDistributions } from "./sources/contracts.ts";
import type { DpShort } from "./raw.ts";

export const SAMPLE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/sample-site-data.json");

export async function buildSample(): Promise<SiteData> {
  const now = new Date(FIXTURE_NOW);
  // the dataplatform main-branch endpoints only: every class series compounded by the website from nav-timeseries
  const raw = await fetchAll({ fetchImpl: mockFetch().fetch, now, env: fixtureEnv() });
  // distributions: the dataplatform main branch has no endpoint (production shows the policy text only, the tab is
  // hidden); the sample supplies the synthetic PR #621 contract payload so the Distributions tab stays exercised
  raw.distributions = Object.fromEntries(("SEST SEB Multistrat".split(" ") as DpShort[]).map((s) => [s, { ok: true, data: parseDistributions(loadFixture(`dataplatform/distributions_${s}.json`)) }]));
  const { data } = buildSiteData(raw, null, now, { mode: "sample" });
  // the sample mirrors what each fund really has: no placeholders for blocks a fund lacks
  data.provenance = Object.fromEntries(Object.entries(data.provenance).map(([k, v]) => [k, `SYNTHETIC sample: ${v}`]));
  data.issues = [{ key: "site", level: "info", message: "Illustrative synthetic data (mode \"sample\"): not real fund figures." }, ...data.issues];
  return data;
}

/** e2e fixture: the SEB fund with class F's daily chain unavailable (class H only), pinned by an e2e admin test */
export const CLASS_H_SAMPLE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../e2e/fixtures/seb-class-h-site-data.json");

/**
 * SYNTHETIC SEB data built from the fixtures with the class F (LDM201) daily NAV history failing (HTTP 500): the track
 * record is class H labelled H and class F has no series ("coming soon"), as a "live" run snapshot (the only kind an
 * admin can pin), SEB only.
 */
export async function buildClassHSample(): Promise<SiteData> {
  const now = new Date(FIXTURE_NOW);
  const noClassF = (u: URL): Response | undefined =>
    u.pathname === "/api/performance/nav-timeseries" && u.searchParams.get("fundserv") === "LDM201" ? json({ detail: "synthetic failure" }, 500) : undefined;
  const raw = await fetchAll({ fetchImpl: mockFetch(noClassF).fetch, now, env: fixtureEnv() });
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

