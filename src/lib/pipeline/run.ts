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
 * A change of a fund's performance class (`classChanges`) is never published by the pipeline itself: in auto mode the
 * run goes live with that fund's previous publication, and publishing the run (an admin, publishRun) approves it.
 * `publishedRunId` (pipelineStatus / published/meta.json, also `runId` inside published/site-data.json)
 * is the source of truth for what is live.
 */
import crypto from "node:crypto";
import type { FundKey, Issue, SiteContent, SiteData } from "../data/types.ts";
import { audit, listDir, lockHeartbeat, readJson, removePath, withLock, writeJson } from "../data/store.ts";
import { buildSiteData } from "./build/index.ts";
import { DEFAULT_SCHEDULE, SNAPSHOT_RETENTION, TIMEZONE } from "./config.ts";
import type { RawPayloads, SourceResult } from "./raw.ts";
import { formatSchedule, nextRun, parseSchedule } from "./schedule.ts";
import { fetchAll } from "./sources/index.ts";
import { errMsg } from "./sources/http.ts";
import { alertDecision, fingerprintList, markSent, REMIND_AFTER_MS, withAlerts, type AlertMessage } from "./alerts.ts";
import { validateSite } from "./validate/index.ts";

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
  /**
   * funds whose performance class changes in this run: never published without an admin (in auto mode the run went
   * live with their previous publication); publishing the run approves them
   */
  classChanges?: FundKey[];
  classChangesApprovedAt?: string;
  classChangesApprovedBy?: string;
  /**
   * funds whose new performance month(s) no independent source confirms: in auto mode the run is published with their
   * previous performance and stays "pending-review" until an admin publishes it (the new months included)
   */
  reviewNeeded?: FundKey[];
  /** review mode: the run holds data (as-of dates, funds) the live publication does not (alerting only) */
  newData?: boolean;
  /** non-blocking notices (persistent, expected data limitations), also listed as warn issues */
  advisories?: { fund: FundKey; code: string; message: string }[];
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

/**
 * PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH=1: a new month waits for its factsheet in every mode. Default off: the
 * factsheet job is not a dependency, but a new month that no independent source confirms is never published by the
 * pipeline alone: in auto mode it waits for an admin (RunReport.reviewNeeded); review mode is unchanged.
 */
export const requireFactsheetForNewMonth = (env: Record<string, string | undefined> = process.env): boolean => (env.PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH ?? "0").trim() === "1";

/** sources summary for the report */
function sourcesSummary(raw: RawPayloads): RunReport["sources"] {
  const out: RunReport["sources"] = [];
  const add = (name: string, r: SourceResult<unknown> | undefined): void => {
    if (!r) return;
    out.push({ name, ok: r.ok, ...(r.ok ? (r.detail ? { detail: r.detail } : {}) : { detail: r.error }) });
  };
  for (const [s, r] of Object.entries(raw.monthlyReturns)) add(`dataplatform monthly-net-returns ${s}`, r);
  for (const [s, r] of Object.entries(raw.navHistory ?? {})) add(`dataplatform nav-timeseries ${s} (daily history)`, r);
  for (const [s, r] of Object.entries(raw.nav)) add(`dataplatform nav-timeseries ${s}`, r);
  add("dataplatform apex/funds", raw.apexFunds);
  add("dataplatform unitholders/funds", raw.unitholderFunds);
  add("dataplatform unitholders/aum", raw.aum);
  for (const [s, r] of Object.entries(raw.ftse)) add(`dataplatform ftse index-summary ${s}`, r);
  for (const [s, h] of Object.entries(raw.holdings ?? {})) {
    add(`dataplatform apex/holdings ${s}`, h?.latest);
    if (h?.monthEnd) add(`dataplatform apex/holdings ${s} (month-end)`, h.monthEnd);
  }
  add("dataplatform instruments (batch + bond universe)", raw.instruments);
  for (const [d, r] of Object.entries(raw.ftseBonds ?? {})) add(`dataplatform ftse index-constituents ${d} (pricing fallback)`, r);
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
  for (const [s, r] of Object.entries(raw.navHistory ?? {})) files[`nav-history_${s}.json`] = r;
  for (const [s, r] of Object.entries(raw.nav)) files[`nav_${s}.json`] = r;
  for (const [s, r] of Object.entries(raw.ftse)) files[`ftse_${s}.json`] = r;
  for (const [s, h] of Object.entries(raw.holdings ?? {})) {
    if (h) files[`holdings_${s}.json`] = h.latest;
    if (h?.monthEnd) files[`holdings-month-end_${s}.json`] = h.monthEnd;
  }
  if (raw.instruments) files["instruments.json"] = raw.instruments;
  for (const [d, r] of Object.entries(raw.ftseBonds ?? {})) files[`ftse-constituents_${d}.json`] = r;
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

export const RUN_ALERT_KEY = "pipeline.run";
export const ADVISORY_ALERT_KEY = "pipeline.advisories";

export const REVIEW_ALERT_KEY = "pipeline.review";
/** consecutive clean runs before a run alert is posted as resolved (a flapping source does not post twice a run) */
export const RESOLVE_AFTER_CLEAN_RUNS = 2;

/**
 * A clean run waiting for approval in review mode: nothing is wrong, an admin has to publish it. Not a problem alert:
 * posted as "N runs waiting for approval" at most once a day, and only when the run holds data the site does not show.
 */
export const isReviewWait = (r: Pick<RunReport, "status" | "publishedAt" | "reviewNeeded" | "classChanges">): boolean =>
  r.status === "pending-review" && !r.publishedAt && !r.reviewNeeded?.length && !r.classChanges?.length;

/** a run that needs a human: nothing published, something blocked, or an approval gate (unconfirmed month) */
export const runNeedsAttention = (r: Pick<RunReport, "status" | "publishedAt" | "reviewNeeded" | "classChanges">): boolean =>
  r.status === "failed" || r.status === "blocked" || (r.status === "pending-review" && !isReviewWait(r));

/** digest of what a page shows from a dataset (as-of dates and funds): tells a run with new data from a repeat */
export function dataDigest(d: Pick<SiteData, "asOf" | "funds"> | null | undefined): string | null {
  return d ? crypto.createHash("sha256").update(JSON.stringify({ asOf: d.asOf, funds: d.funds })).digest("hex") : null;
}

/**
 * What identifies a run's alert: status, the set of error issues (digits masked, so a count or a date moving inside the
 * same problem is not a new problem), funds waiting for review and class changes. A new fingerprint posts again.
 */
export function runAlertFingerprint(r: Pick<RunReport, "status" | "issues" | "reviewNeeded" | "classChanges">): string {
  const mask = (s: string): string => s.replace(/\d+(?:[.,]\d+)*/g, "#");
  const errors = [...new Set(r.issues.filter((i) => i.level === "error").map((i) => `${i.key}|${mask(i.message)}`))].sort();
  return JSON.stringify({ s: r.status, e: errors, r: [...(r.reviewNeeded ?? [])].sort(), c: [...(r.classChanges ?? [])].sort() });
}

const advisoryId = (a: { fund: string; code?: string; message: string }): string => `${a.fund}|${a.code ?? a.message}`;

/** what an admin has to do, by status */
function runAction(r: RunReport): string[] {
  const path = `/admin/runs/${r.id}`;
  if (r.status === "failed") return [`What to do: open ${path}, read the failed sources and errors (a source answering 5xx / timing out is retried once automatically about 30 minutes later), fix the cause, then "run now" from the dashboard. The site keeps its last published figures.`];
  if (r.status === "blocked") {
    return [
      `What to do: open ${path} and read the error issues. Blocked funds keep their previous figures${r.publishedAt ? " (the other funds were published)" : ""}.`,
      ...(r.classChanges?.length ? [`Class change(s) for ${r.classChanges.join(", ")}: check them, then press "approve class change & publish" on the run.`] : []),
      "A source problem clears by itself on the next run once the source is back; a revised or contradicted month needs a decision (publish the run, or wait for the fix).",
    ];
  }
  if (r.status === "pending-review") return [`What to do: open ${path}, check the figures and issues, then publish the run (approve).`];
  return [];
}

/**
 * Post the run's alerts (dry runs post nothing):
 * - a run needing attention: when new or changed, one reminder a day while unchanged; "Resolved" after
 *   RESOLVE_AFTER_CLEAN_RUNS consecutive runs needing none (a clean run in between does not post);
 * - non-blocking notices once, when they first appear (same message);
 * - review mode: "N runs waiting for approval" when a run waits with data the site does not show yet, at most once a day.
 */
async function notifyRun(report: RunReport, fetchImpl: typeof fetch, now: Date): Promise<void> {
  if (report.status === "dry-run") return;
  const waiting = isReviewWait(report) && report.newData
    ? await waitingRuns().catch(() => [report.id])
    : [];
  await withAlerts(async (ctx) => {
    const attention = runNeedsAttention(report);
    const fp = runAlertFingerprint(report);
    const open = ctx.state.open[RUN_ALERT_KEY];
    let kind: "new" | "changed" | "reminder" | "none" | "resolved" = "none";
    if (attention) {
      kind = alertDecision(open, fp, ctx.now, REMIND_AFTER_MS);
      if (kind === "none" && open?.clean) ctx.state.open[RUN_ALERT_KEY] = { ...open, clean: 0 };
    } else if (open) {
      const clean = (open.clean ?? 0) + 1;
      if (clean >= RESOLVE_AFTER_CLEAN_RUNS) kind = "resolved";
      else ctx.state.open[RUN_ALERT_KEY] = { ...open, clean };
    }
    const advisories = report.advisories ?? [];
    const ids = [...new Set(advisories.map(advisoryId))].sort();
    const known = new Set(fingerprintList(ctx.state.open[ADVISORY_ALERT_KEY]?.fingerprint));
    const fresh = advisories.filter((a, i) => !known.has(advisoryId(a)) && advisories.findIndex((b) => advisoryId(b) === advisoryId(a)) === i);
    const keepKnown = (): void => {
      const still = ids.filter((id) => known.has(id));
      if (!still.length) delete ctx.state.open[ADVISORY_ALERT_KEY];
      else if (still.length !== known.size) ctx.state.open[ADVISORY_ALERT_KEY] = { ...ctx.state.open[ADVISORY_ALERT_KEY]!, fingerprint: JSON.stringify(still) };
    };
    if (!ctx.configured) return keepKnown();
    // review mode: a run waiting with new data, at most one message a day (an approval clears the open entry, not the clock)
    if (!isReviewWait(report)) delete ctx.state.open[REVIEW_ALERT_KEY];
    else if (waiting.length) {
      const last = ctx.state.sentAt?.[REVIEW_ALERT_KEY];
      if (!last || ctx.now.getTime() - Date.parse(last) >= REMIND_AFTER_MS) {
        const title = `Nymbus website data pipeline: ${waiting.length} run${waiting.length === 1 ? "" : "s"} waiting for approval (review mode)`;
        const ok = await ctx.send({
          title, severity: "info", adminPath: `/admin/runs/${report.id}`,
          lines: [
            `The newest run (${report.id}) holds data the public site does not show yet.`,
            `What to do: open /admin/runs/${report.id}, check the figures and issues, then publish it (approve). Publishing the newest run is enough; older waiting runs need nothing.`,
          ],
        });
        if (ok) markSent(ctx.state, REVIEW_ALERT_KEY, "waiting", title, ctx.now, ctx.state.open[REVIEW_ALERT_KEY] ? "reminder" : "new");
      }
    }
    if (kind === "none" && !fresh.length) return keepKnown();
    const review = report.status === "pending-review" && !!report.reviewNeeded?.length && !!report.publishedAt;
    const errors = report.issues.filter((i) => i.level === "error").slice(0, 10).map((i) => `• ${i.key}: ${i.message.slice(0, 300)}`);
    const head = `Nymbus website data pipeline: run ${report.id} ${report.status.toUpperCase()} (${report.trigger}${report.status === "published" ? ", published" : report.publishedAt ? ", other funds published" : ", nothing published"})`;
    const prefix = kind === "reminder" ? `Reminder (daily, since ${open!.since.slice(0, 16).replace("T", " ")} UTC): ` : kind === "resolved" ? "Resolved: " : "";
    const lines = [
      ...(kind === "resolved" ? [`The earlier alert is resolved: ${RESOLVE_AFTER_CLEAN_RUNS} runs in a row need no attention (${open!.title.slice(0, 160)}).`] : []),
      ...(kind === "changed" ? ["The problem changed since the last alert."] : []),
      ...(review ? [`new month(s) of ${report.reviewNeeded!.join(", ")} confirmed by no independent source: publish the run in the admin to approve them`] : []),
      ...(attention && kind !== "none" ? runAction(report) : []),
      ...fresh.map((a) => `attention (not blocking) ${a.fund}: ${a.message.slice(0, 300)}`),
      ...Object.entries(report.funds).map(([k, v]) => `${k}: ${v}`),
      ...errors,
    ];
    const msg: AlertMessage = { title: prefix + head, lines, severity: report.status === "failed" || report.status === "blocked" ? "error" : report.status === "pending-review" ? "warn" : kind === "resolved" ? "ok" : "info", adminPath: `/admin/runs/${report.id}` };
    if (!(await ctx.send(msg))) return keepKnown();
    if (kind === "resolved") delete ctx.state.open[RUN_ALERT_KEY];
    else if (kind !== "none") markSent(ctx.state, RUN_ALERT_KEY, fp, head, ctx.now, kind);
    if (ids.length) markSent(ctx.state, ADVISORY_ALERT_KEY, JSON.stringify(ids), "non-blocking notices", ctx.now, "new");
    else delete ctx.state.open[ADVISORY_ALERT_KEY];
  }, { fetchImpl, now });
}

/** ids of the runs waiting for approval since the live publication (review mode), newest first */
async function waitingRuns(): Promise<string[]> {
  const pub = (await publishedMeta())?.runId ?? "";
  return (await listRuns(50)).filter((r) => r.id > pub && isReviewWait(r)).map((r) => r.id);
}

/** An admin published (approved) the newest run: its alerts are settled, without a message. */
async function settleRunAlerts(id: string): Promise<void> {
  const newest = (await listRuns(1))[0]?.id;
  if (newest && id < newest) return; // a rollback to an older run settles nothing about the newest one
  await withAlerts(async (ctx) => {
    delete ctx.state.open[RUN_ALERT_KEY];
    delete ctx.state.open[REVIEW_ALERT_KEY];
  });
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
    let autoPublish: SiteData | null = null;
    try {
      const previous = await readJson<SiteData | null>(["published", "site-data.json"], null);
      raw = await fetchAll({ fetchImpl, now });
      report.sources = sourcesSummary(raw);
      const built = buildSiteData(raw, previous, now, { requireFactsheetForNewMonth: requireFactsheetForNewMonth() });
      const v = validateSite(built.data, built.context, previous, now);
      data = { ...v.data, runId: id };
      // auto mode publishes only what needs no human: a performance class change waits for an approval of this run
      // (publishRun publishes the stored data, the change included)
      const autoData: SiteData = { ...v.autoData, runId: id };
      report.funds = v.funds;
      report.asOf = data.asOf;
      if (v.classChanges.length) report.classChanges = v.classChanges;
      if (v.needsReview.length) report.reviewNeeded = v.needsReview;
      const alerts = v.results.flatMap((r) => r.alerts.map((a) => ({ key: `funds.${r.fund}`, level: "error" as const, message: `needs attention: ${a}` })));
      const advisories = v.results.flatMap((r) => (r.advisories ?? []).map((a) => ({ fund: r.fund, code: a.code, message: a.message })));
      if (advisories.length) report.advisories = advisories;
      report.issues = [
        ...data.issues,
        ...alerts.filter((a, i) => alerts.findIndex((b) => b.key === a.key && b.message === a.message) === i),
        ...advisories.map((a) => ({ key: `funds.${a.fund}`, level: "warn" as const, message: `attention (not blocking): ${a.message}` })),
      ];
      const updated = Object.values(v.funds).some((s) => s === "updated");
      const blocked = v.results.some((r) => r.blocking.length > 0 || r.alerts.length > 0);
      const mode = await publishMode();
      if (!updated) {
        report.status = opts.dryRun ? "dry-run" : "failed";
        report.issues = [...report.issues, { key: "run", level: "error", message: "no fund could be updated: nothing published" }];
      } else if (opts.dryRun) report.status = "dry-run";
      else if (blocked) report.status = "blocked";
      // auto mode: what needs a human (unconfirmed new months) is kept out of the auto-published data and the run waits
      else report.status = mode === "auto" && !v.needsReview.length ? "published" : "pending-review";
      autoPublish = autoData;
      if (report.status === "pending-review" && mode !== "auto") report.newData = dataDigest(data) !== dataDigest(previous);
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
      if (report.publishedAt && data) await publishData(id, autoPublish ?? data, report.publishedBy!, report.publishedAt);
      await audit({ by: opts.by, action: "pipeline.run", target: id, detail: { trigger: opts.trigger, status: report.status, published: !!report.publishedAt, funds: report.funds } });
      await pruneSnapshots();
    } catch (e: unknown) {
      report.status = "failed";
      delete report.publishedAt;
      delete report.publishedBy;
      report.issues = [...report.issues, { key: "run", level: "error", message: `could not store the run: ${errMsg(e)}` }];
      await writeJson(["snapshots", id, "report.json"], report).catch(() => undefined);
    }
    // a notice is posted once, when it first appears (keyed on fund + code: a notice whose wording changes is not posted again)
    await notifyRun(report, fetchImpl, opts.now ?? new Date()).catch((e: unknown) => console.error(`[pipeline] alert failed: ${errMsg(e)}`));
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
    const updated: RunReport = {
      ...report, status: report.status === "pending-review" ? "published" : report.status, publishedAt: at, publishedBy: by,
      ...(report.classChanges?.length ? { classChangesApprovedAt: at, classChangesApprovedBy: by } : {}),
    };
    await writeJson(["snapshots", id, "report.json"], updated);
    await audit({ by, action: previousRunId && previousRunId > id ? "pipeline.rollback" : "pipeline.publish", target: id, detail: { previousRunId, status: updated.status } });
    await settleRunAlerts(id).catch((e: unknown) => console.error(`[pipeline] could not settle the alerts: ${errMsg(e)}`));
    return updated;
  });
  if ("locked" in res) throw new Error("a pipeline run is in progress: try again in a minute");
  return res;
}

async function lockActive(staleMs = 30 * 60_000): Promise<boolean> {
  const beat = await lockHeartbeat(LOCK).catch(() => null);
  return beat !== null && Date.now() - beat < staleMs;
}

/** a pipeline run holds the lock (heartbeat younger than 30 min) */
export const pipelineRunning = (): Promise<boolean> => lockActive();

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
