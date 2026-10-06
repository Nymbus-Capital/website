/**
 * Data status for operations (admin dashboard, stale-data alert) and its public projection (GET /api/status: only what
 * the site already shows — publication time and as-of dates — plus the verdict; no run status, no schedule, no issue
 * text, no hostname). Dependency-free (relative imports): unit tested with plain Node.
 */
import type { FundData, SiteContent, SiteData } from "../data/types.ts";
import { readJson } from "../data/store.ts";
import { FUNDS } from "../../config/funds.ts";
import { raiseAlert, REMIND_AFTER_MS, resolveAlert, type AlertOpts } from "./alerts.ts";
import { DEFAULT_SCHEDULE, TIMEZONE } from "./config.ts";
import { freshness, type Freshness } from "./freshness.ts";
import { listRuns, pipelineRunning, type PublishedMeta, type RunReport } from "./run.ts";
import { formatSchedule, nextRun, parseSchedule, schedulerState } from "./schedule.ts";

export const FRESHNESS_ALERT_KEY = "data.freshness";

/** GET /api/status body */
export interface PublicStatus {
  ok: boolean;
  verdict: Freshness["verdict"];
  checkedAt: string;
  lastPublishAt: string | null;
  /** what is stale, as stable codes ("<fund>:performance", "<fund>:nav") */
  stale: string[];
  /** as-of dates of the blocks the site shows (a block the admin hides is left out) */
  funds: Record<string, { performanceAsOf?: string | null; navAsOf?: string | null; verdict: "ok" | "stale" }>;
}

/** operations view (admin, alerts): never served publicly */
export interface SiteStatus {
  ok: boolean;
  verdict: Freshness["verdict"];
  checkedAt: string;
  /** what is stale, as stable codes ("<fund>:performance", "<fund>:nav") */
  stale: string[];
  reasons: string[];
  lastRun: { startedAt: string; finishedAt: string; status: RunReport["status"]; trigger: RunReport["trigger"] } | null;
  running: boolean;
  lastPublishAt: string | null;
  scheduler: { active: boolean; schedule: string[]; timezone: string; nextRunAt: string | null; retryAt: string | null };
  /** per fund: freshness, and which blocks the site shows (a hidden block or a fund without NAV is not checked) */
  funds: Record<string, Freshness["funds"][string] & { shows: { performance: boolean; nav: boolean } }>;
  thresholds: Freshness["thresholds"];
}

export function publicStatus(s: SiteStatus): PublicStatus {
  const funds: PublicStatus["funds"] = {};
  for (const [k, f] of Object.entries(s.funds)) {
    funds[k] = {
      ...(f.shows.performance ? { performanceAsOf: f.performanceAsOf } : {}),
      ...(f.shows.nav ? { navAsOf: f.navAsOf } : {}),
      verdict: f.verdict,
    };
  }
  return { ok: s.ok, verdict: s.verdict, checkedAt: s.checkedAt, lastPublishAt: s.lastPublishAt, stale: s.stale, funds };
}

/** NAV date of the fund's OLDEST class with a NAV (a class stuck behind the others makes the fund stale), else nav.asOf */
export function oldestNavDate(nav: FundData["nav"] | undefined): string | null {
  const dates = (nav?.classes ?? []).filter((c) => c.nav !== null && typeof c.date === "string" && c.date).map((c) => c.date as string).sort();
  return dates[0] ?? nav?.asOf ?? null;
}

async function lastPublishAt(): Promise<{ at: string | null; site: SiteData | null }> {
  const [meta, site] = await Promise.all([
    readJson<PublishedMeta | null>(["published", "meta.json"], null).catch(() => null),
    readJson<SiteData | null>(["published", "site-data.json"], null).catch(() => null),
  ]);
  const at = [meta?.publishedAt, site?.publishedAt].filter((x): x is string => typeof x === "string" && Number.isFinite(Date.parse(x))).sort().pop() ?? null;
  return { at, site: site && site.mode === "live" ? site : null };
}

/** Status of the public data: freshness verdict, last run, last publication, next scheduled run. */
export async function siteStatus(now: Date = new Date(), env: Record<string, string | undefined> = process.env): Promise<SiteStatus> {
  const [{ at, site }, content, runs, running] = await Promise.all([
    lastPublishAt(),
    readJson<Partial<SiteContent> | null>(["content", "site-content.json"], null).catch(() => null),
    listRuns(1).catch(() => [] as RunReport[]),
    pipelineRunning().catch(() => false),
  ]);
  // funds hidden by the admin are not on the site: not reported
  const shown = FUNDS.filter((f) => !content?.funds?.[f.key]?.hidden);
  const showsOf = (f: (typeof FUNDS)[number]) => ({ performance: !content?.funds?.[f.key]?.hide?.performance, nav: f.vehicle === "fund" && !content?.funds?.[f.key]?.hide?.nav });
  const fr = freshness({
    now,
    funds: shown.map((f) => {
      const d = site?.funds?.[f.key];
      const sh = showsOf(f);
      return { key: f.key, hasNav: sh.nav, hasPerformance: sh.performance, performanceAsOf: d?.performance?.asOf ?? null, navAsOf: oldestNavDate(d?.nav) };
    }),
  });
  const funds: SiteStatus["funds"] = {};
  for (const f of shown) funds[f.key] = { ...fr.funds[f.key], shows: showsOf(f) };
  const st = schedulerState();
  let times: ReturnType<typeof parseSchedule> = [];
  try {
    times = st?.times ?? parseSchedule(env.PIPELINE_SCHEDULE ?? DEFAULT_SCHEDULE);
  } catch {
    times = [];
  }
  const last = runs[0];
  return {
    ok: fr.verdict === "ok",
    verdict: fr.verdict,
    checkedAt: now.toISOString(),
    stale: fr.codes,
    reasons: fr.reasons,
    lastRun: last ? { startedAt: last.startedAt, finishedAt: last.finishedAt, status: last.status, trigger: last.trigger } : null,
    running,
    lastPublishAt: at,
    scheduler: {
      active: !!st?.started,
      schedule: formatSchedule(times),
      timezone: TIMEZONE,
      nextRunAt: st ? (st.next?.toISOString() ?? null) : null,
      retryAt: st?.retryAt?.toISOString() ?? null,
    },
    funds,
    thresholds: fr.thresholds,
  };
}

/** expected next run when the scheduler of this process is not running (e.g. the CLI): for messages only */
const plannedNext = (now: Date, env: Record<string, string | undefined>): string | null => {
  try {
    return nextRun(now, parseSchedule(env.PIPELINE_SCHEDULE ?? DEFAULT_SCHEDULE))?.toISOString() ?? null;
  } catch {
    return null;
  }
};

/**
 * Evaluate freshness and alert: posted when the data turns stale or what is stale changes, reminded daily while it
 * stays stale, "fresh again" when it recovers.
 */
export async function runMonitor(opts: AlertOpts & { now?: Date } = {}): Promise<SiteStatus> {
  const now = opts.now ?? new Date();
  const env = opts.env ?? process.env;
  const s = await siteStatus(now, env);
  if (s.verdict === "stale") {
    const fingerprint = JSON.stringify(s.stale);
    await raiseAlert({
      key: FRESHNESS_ALERT_KEY, fingerprint, remindAfterMs: REMIND_AFTER_MS,
      message: (kind, open) => ({
        title: `${kind === "reminder" ? `Reminder (daily, since ${open!.since.slice(0, 16).replace("T", " ")} UTC): ` : ""}Nymbus website: public fund data is STALE`,
        severity: "error",
        adminPath: "/admin/runs",
        lines: [
          ...(kind === "changed" ? ["What is stale changed since the last alert."] : []),
          ...s.reasons,
          `Last run: ${s.lastRun ? `${s.lastRun.status} (${s.lastRun.trigger}, started ${s.lastRun.startedAt.slice(0, 16).replace("T", " ")} UTC)` : "none"}; next scheduled run: ${s.scheduler.nextRunAt ?? plannedNext(now, env) ?? "none (scheduler off)"}.`,
          "What to do: open /admin/runs. A run waiting for approval (pending-review, class change, unconfirmed month) needs \"publish\"; a blocked or failed run lists the source or gate at fault; if no run happened, check the service and \"run now\" from the dashboard.",
        ],
      }),
    }, { ...opts, now });
  } else {
    await resolveAlert({
      key: FRESHNESS_ALERT_KEY,
      message: (open) => ({ title: "Resolved: Nymbus website public fund data is fresh again", severity: "ok", adminPath: "/admin", lines: [`Stale since ${open.since.slice(0, 16).replace("T", " ")} UTC.`, `Last publication: ${s.lastPublishAt ?? "none"}.`] }),
    }, { ...opts, now });
  }
  return s;
}
