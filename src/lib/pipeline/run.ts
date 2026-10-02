/**
 * Pipeline orchestration: fetch -> build -> validate -> snapshot -> publish (auto) or wait for review.
 *
 * Status of a run (RunReport.status)
 *  - "published"      every fund updated cleanly (no alert); published (auto mode, or approved later)
 *  - "pending-review" review mode, nothing needing attention: waits for publishRun()
 *  - "blocked"        something needs a human: a fund failed a blocking gate, or its performance was
 *                     carried over / withheld / is stale, a NAV / AUM / factsheet part was carried over or
 *                     is stale, a published month was revised, or any error-level issue. In auto mode the
 *                     merged data is still published (`publishedAt` set: blocked funds keep their previous
 *                     values, other funds stay fresh); in review mode it waits for approval. Alert sent.
 *  - "failed"         no fund could be updated (every source down, or a crash): nothing published. Alert sent.
 *  - "dry-run"        computed and stored for inspection, never published.
 * `publishedRunId` (pipelineStatus / published/meta.json, also `runId` inside published/site-data.json)
 * is the source of truth for what is live.
 */
import crypto from "node:crypto";
import type { FundKey, Issue, SiteContent, SiteData } from "../data/types.ts";
import { audit, listDir, lockHeartbeat, readJson, removePath, withLock, writeJson } from "../data/store.ts";
import { buildSiteData } from "./build.ts";
import { DEFAULT_SCHEDULE, SNAPSHOT_RETENTION, TIMEZONE } from "./config.ts";
import type { RawPayloads, SourceResult } from "./raw.ts";
import { formatSchedule, nextRun, parseSchedule } from "./schedule.ts";
import { fetchAll } from "./sources/index.ts";
import { errMsg } from "./sources/http.ts";
import { validateSite } from "./validate.ts";

export interface RunReport {
  id: string;
  trigger: "schedule" | "manual" | "cli";
  by: string;
  startedAt: string;
  finishedAt: string;
  status: "published" | "pending-review" | "blocked" | "failed" | "dry-run";
  asOf: SiteData["asOf"];
  issues: Issue[];
  sources: { name: string; ok: boolean; detail?: string }[];
  funds: Partial<Record<FundKey, "updated" | "kept-previous" | "unavailable">>;
  publishedAt?: string;
  publishedBy?: string;
}

export interface PublishedMeta { runId: string; publishedAt: string; publishedBy: string }

const ID_RE = /^[0-9A-Za-z-]+$/;
const LOCK = "pipeline";

export const EMPTY_ASOF: SiteData["asOf"] = { performance: null, nav: null, aum: null, factsheet: null };

export function runId(now: Date): string {
  const ts = now.toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
  return `${ts}-${crypto.randomBytes(4).toString("hex")}`;
}

const emptySite = (now: Date): SiteData => ({ schemaVersion: 1, generatedAt: now.toISOString(), mode: "live", asOf: { ...EMPTY_ASOF }, funds: {}, provenance: {}, issues: [] });

async function readContent(): Promise<Partial<SiteContent> | null> {
  return readJson<Partial<SiteContent> | null>(["content", "site-content.json"], null).catch(() => null);
}

async function publishMode(): Promise<"auto" | "review"> {
  // until an admin chooses "auto", runs wait for approval (safer for the first live runs)
  return (await readContent())?.pipeline?.publishMode === "auto" ? "auto" : "review";
}

export const requireFactsheetForNewMonth = (env: Record<string, string | undefined> = process.env): boolean => (env.PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH ?? "1").trim() !== "0";

/** sources summary for the report */
function sourcesSummary(raw: RawPayloads): RunReport["sources"] {
  const out: RunReport["sources"] = [];
  const add = (name: string, r: SourceResult<unknown> | undefined): void => {
    if (!r) return;
    out.push({ name, ok: r.ok, ...(r.ok ? (r.detail ? { detail: r.detail } : {}) : { detail: r.error }) });
  };
  for (const [s, r] of Object.entries(raw.monthlyReturns)) add(`dataplatform monthly-net-returns ${s}`, r);
  for (const [s, byClass] of Object.entries(raw.monthlyReturnsByClass ?? {})) for (const [code, r] of Object.entries(byClass)) add(`dataplatform monthly-net-returns ${s} class ${code}`, r);
  for (const [s, r] of Object.entries(raw.nav)) add(`dataplatform nav-timeseries ${s}`, r);
  add("dataplatform apex/funds", raw.apexFunds);
  add("dataplatform unitholders/funds", raw.unitholderFunds);
  add("dataplatform unitholders/aum", raw.aum);
  for (const [s, r] of Object.entries(raw.ftse)) add(`dataplatform ftse index-summary ${s}`, r);
  for (const [s, r] of Object.entries(raw.portfolio ?? {})) add(`dataplatform fund-portfolio ${s}`, r);
  for (const [s, r] of Object.entries(raw.portfolioMonthEnd ?? {})) add(`dataplatform fund-portfolio ${s} (month-end)`, r);
  for (const [s, r] of Object.entries(raw.distributions ?? {})) add(`dataplatform distributions ${s}`, r);
  add("factsheet archives", raw.factsheets);
  add("analytics fund_returns.json", raw.analytics);
  return out;
}

/** raw payloads as stored in snapshots/<id>/raw (AUM already reduced to fund totals by the fetcher) */
function rawFiles(raw: RawPayloads): Record<string, unknown> {
  const files: Record<string, unknown> = {
    "meta.json": { fetchedAt: raw.fetchedAt, targetMonth: raw.targetMonth, ftseIndex: raw.ftseIndex },
    "apex-funds.json": raw.apexFunds,
    "unitholders-funds.json": raw.unitholderFunds,
    // fund-level totals only: { snapshot_date, warningCount, totals: { short_name: cad } }
    "aum.json": raw.aum.ok && raw.aum.data ? { ok: true, data: { snapshot_date: raw.aum.data.snapshot_date, warningCount: raw.aum.data.warningCount, totals: { ...raw.aum.data.totals } } } : { ok: false, error: raw.aum.error },
  };
  for (const [s, r] of Object.entries(raw.monthlyReturns)) files[`monthly-net-returns_${s}.json`] = r;
  for (const [s, byClass] of Object.entries(raw.monthlyReturnsByClass ?? {})) for (const [code, r] of Object.entries(byClass)) files[`monthly-net-returns_${s}_${code}.json`] = r;
  for (const [s, r] of Object.entries(raw.nav)) files[`nav_${s}.json`] = r;
  for (const [s, r] of Object.entries(raw.ftse)) files[`ftse_${s}.json`] = r;
  for (const [s, r] of Object.entries(raw.portfolio ?? {})) files[`fund-portfolio_${s}.json`] = r;
  for (const [s, r] of Object.entries(raw.portfolioMonthEnd ?? {})) files[`fund-portfolio-month-end_${s}.json`] = r;
  for (const [s, r] of Object.entries(raw.distributions ?? {})) files[`distributions_${s}.json`] = r;
  if (raw.factsheets.ok && raw.factsheets.data) {
    for (const [fn, d] of Object.entries(raw.factsheets.data.files)) files[`factsheets_${fn}`] = d;
    files["factsheets.json"] = { ok: true, where: raw.factsheets.data.where, tried: raw.factsheets.data.tried, found: Object.keys(raw.factsheets.data.files) };
  } else files["factsheets.json"] = { ok: false, error: raw.factsheets.error };
  files["analytics.json"] = raw.analytics;
  return files;
}

async function writeSnapshot(id: string, report: RunReport, data: SiteData | null, raw: RawPayloads | null): Promise<void> {
  if (raw) for (const [name, v] of Object.entries(rawFiles(raw))) await writeJson(["snapshots", id, "raw", name.replace(/[^0-9A-Za-z._-]/g, "_")], v);
  if (data) await writeJson(["snapshots", id, "site-data.json"], data);
  await writeJson(["snapshots", id, "report.json"], report);
}

/** What is live: published/meta.json, or (older layouts / a crash between the two writes) the ids inside published/site-data.json. */
async function publishedMeta(): Promise<PublishedMeta | null> {
  const [meta, site] = await Promise.all([
    readJson<PublishedMeta | null>(["published", "meta.json"], null).catch(() => null),
    readJson<SiteData | null>(["published", "site-data.json"], null).catch(() => null),
  ]);
  if (site?.runId && site.publishedAt && (!meta || meta.runId !== site.runId)) return { runId: site.runId, publishedAt: site.publishedAt, publishedBy: site.publishedBy ?? "" };
  return meta;
}

/** data first (self-describing), then meta; both writes are atomic (temp file + rename) */
async function publishData(id: string, data: SiteData, by: string, at: string): Promise<void> {
  await writeJson(["published", "site-data.json"], { ...data, runId: id, publishedAt: at, publishedBy: by } satisfies SiteData);
  await writeJson(["published", "meta.json"], { runId: id, publishedAt: at, publishedBy: by } satisfies PublishedMeta);
}

/** Keep the newest `keep` snapshots; never the published one nor any snapshot a fund is pinned on. */
export async function pruneSnapshots(keep = SNAPSHOT_RETENTION): Promise<string[]> {
  const ids = (await listDir(["snapshots"])).filter((x) => ID_RE.test(x)).sort().reverse();
  const protect = new Set<string>();
  const pub = (await publishedMeta())?.runId;
  if (pub) protect.add(pub);
  const content = await readContent();
  for (const fc of Object.values(content?.funds ?? {})) if (fc?.pinnedSnapshot) protect.add(fc.pinnedSnapshot);
  const removed: string[] = [];
  for (const id of ids.slice(keep)) {
    if (protect.has(id)) continue;
    await removePath(["snapshots", id]);
    removed.push(id);
  }
  return removed;
}

async function alert(report: RunReport, fetchImpl: typeof fetch): Promise<void> {
  const url = process.env.PIPELINE_ALERT_WEBHOOK;
  if (!url || (report.status !== "failed" && report.status !== "blocked")) return;
  const errors = report.issues.filter((i) => i.level === "error").slice(0, 10).map((i) => `• ${i.key}: ${i.message.slice(0, 300)}`);
  const text = [
    `Nymbus website data pipeline: run ${report.id} ${report.status.toUpperCase()} (${report.trigger}${report.publishedAt ? ", other funds published" : ", nothing published"})`,
    ...Object.entries(report.funds).map(([k, v]) => `${k}: ${v}`),
    ...errors,
  ].join("\n");
  try {
    const res = await fetchImpl(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }), signal: AbortSignal.timeout(15_000) });
    await res.body?.cancel().catch(() => undefined);
  } catch (e: unknown) {
    console.error(`[pipeline] alert webhook failed: ${errMsg(e).split(url).join("<webhook>")}`); // the webhook URL is itself the secret
  }
}

export async function runPipeline(opts: { trigger: RunReport["trigger"]; by: string; dryRun?: boolean; fetchImpl?: typeof fetch; now?: Date }): Promise<RunReport | { locked: true }> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  return withLock(LOCK, async () => {
    const now = opts.now ?? new Date();
    const id = runId(now);
    const startedAt = new Date().toISOString();
    const report: RunReport = { id, trigger: opts.trigger, by: opts.by, startedAt, finishedAt: startedAt, status: "failed", asOf: { ...EMPTY_ASOF }, issues: [], sources: [], funds: {} };
    let raw: RawPayloads | null = null;
    let data: SiteData | null = null;
    try {
      const previous = await readJson<SiteData | null>(["published", "site-data.json"], null);
      raw = await fetchAll({ fetchImpl, now });
      report.sources = sourcesSummary(raw);
      const built = buildSiteData(raw, previous, now, { requireFactsheetForNewMonth: requireFactsheetForNewMonth() });
      const v = validateSite(built.data, built.context, previous, now);
      data = { ...v.data, runId: id };
      report.funds = v.funds;
      report.asOf = data.asOf;
      const alerts = v.results.flatMap((r) => r.alerts.map((a) => ({ key: `funds.${r.fund}`, level: "error" as const, message: `needs attention: ${a}` })));
      report.issues = [...data.issues, ...alerts.filter((a, i) => alerts.findIndex((b) => b.key === a.key && b.message === a.message) === i)];
      const updated = Object.values(v.funds).some((s) => s === "updated");
      const blocked = v.results.some((r) => r.blocking.length > 0 || r.alerts.length > 0);
      const mode = await publishMode();
      if (!updated) {
        report.status = opts.dryRun ? "dry-run" : "failed";
        report.issues = [...report.issues, { key: "run", level: "error", message: "no fund could be updated: nothing published" }];
      } else if (opts.dryRun) report.status = "dry-run";
      else if (blocked) report.status = "blocked";
      else report.status = mode === "auto" ? "published" : "pending-review";
      if (!opts.dryRun && updated && mode === "auto") {
        report.publishedAt = new Date().toISOString();
        report.publishedBy = `pipeline (${opts.trigger}, ${opts.by})`;
      }
    } catch (e: unknown) {
      report.status = "failed";
      report.issues = [...report.issues, { key: "run", level: "error", message: `pipeline crashed: ${errMsg(e)}` }];
      data = data ?? emptySite(now);
    }
    report.finishedAt = new Date().toISOString();
    try {
      await writeSnapshot(id, report, data, raw);
      if (report.publishedAt && data) await publishData(id, data, report.publishedBy!, report.publishedAt);
      await audit({ by: opts.by, action: "pipeline.run", target: id, detail: { trigger: opts.trigger, status: report.status, published: !!report.publishedAt, funds: report.funds } });
      await pruneSnapshots();
    } catch (e: unknown) {
      report.status = "failed";
      delete report.publishedAt;
      delete report.publishedBy;
      report.issues = [...report.issues, { key: "run", level: "error", message: `could not store the run: ${errMsg(e)}` }];
      await writeJson(["snapshots", id, "report.json"], report).catch(() => undefined);
    }
    await alert(report, fetchImpl);
    return report;
  });
}

export async function listRuns(limit = 50): Promise<RunReport[]> {
  const ids = (await listDir(["snapshots"])).filter((x) => ID_RE.test(x)).sort().reverse();
  const out: RunReport[] = [];
  for (const id of ids) {
    if (out.length >= limit) break;
    const r = await readJson<RunReport | null>(["snapshots", id, "report.json"], null).catch(() => null);
    if (r) out.push(r);
  }
  return out;
}

export async function getRun(id: string): Promise<{ report: RunReport; data: SiteData } | null> {
  if (!ID_RE.test(id)) return null;
  const report = await readJson<RunReport | null>(["snapshots", id, "report.json"], null).catch(() => null);
  if (!report) return null;
  const data = await readJson<SiteData | null>(["snapshots", id, "site-data.json"], null).catch(() => null);
  if (!data) return null;
  return { report, data };
}

/**
 * Publish a stored run: approve a pending (or blocked) run, or roll back to an older published one.
 * Throws on an invalid id, an unknown run, a run without publishable data (failed / dry-run), or while
 * a pipeline run holds the lock.
 */
export async function publishRun(id: string, by: string): Promise<RunReport> {
  if (!ID_RE.test(id)) throw new Error("invalid run id");
  const res = await withLock(LOCK, async () => {
    const run = await getRun(id);
    if (!run) throw new Error(`run ${id} not found`);
    const { report, data } = run;
    if (report.status === "failed" || report.status === "dry-run") throw new Error(`run ${id} is ${report.status}: it cannot be published`);
    if (data.mode !== "live") throw new Error(`run ${id} does not contain live data`);
    const at = new Date().toISOString();
    const previousRunId = (await publishedMeta())?.runId ?? null;
    await publishData(id, data, by, at);
    const updated: RunReport = { ...report, status: report.status === "pending-review" ? "published" : report.status, publishedAt: at, publishedBy: by };
    await writeJson(["snapshots", id, "report.json"], updated);
    await audit({ by, action: previousRunId && previousRunId > id ? "pipeline.rollback" : "pipeline.publish", target: id, detail: { previousRunId, status: updated.status } });
    return updated;
  });
  if ("locked" in res) throw new Error("a pipeline run is in progress: try again in a minute");
  return res;
}

async function lockActive(staleMs = 30 * 60_000): Promise<boolean> {
  const beat = await lockHeartbeat(LOCK).catch(() => null);
  return beat !== null && Date.now() - beat < staleMs;
}

export async function pipelineStatus(now: Date = new Date()): Promise<{ running: boolean; schedule: string[]; timezone: "America/Toronto"; nextRunAt: string | null; lastRun: RunReport | null; publishedRunId: string | null }> {
  let times: ReturnType<typeof parseSchedule> = [];
  try {
    times = parseSchedule(process.env.PIPELINE_SCHEDULE ?? DEFAULT_SCHEDULE);
  } catch {
    times = [];
  }
  const [running, last, meta] = await Promise.all([lockActive(), listRuns(1), publishedMeta()]);
  return {
    running,
    schedule: formatSchedule(times),
    timezone: TIMEZONE,
    nextRunAt: nextRun(now, times)?.toISOString() ?? null,
    lastRun: last[0] ?? null,
    publishedRunId: meta?.runId ?? null,
  };
}
