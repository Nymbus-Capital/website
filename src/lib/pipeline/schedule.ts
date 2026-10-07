/**
 * In-process scheduler: runs the pipeline at fixed local times (America/Toronto), DST-aware through
 * Intl, catches up a slot missed across a restart, retries once a run a source made fail, and runs the freshness monitor. Started by src/instrumentation.ts (Node runtime only). The pipeline itself is imported lazily
 * so this module stays cheap to import (and testable).
 */
import { DEFAULT_SCHEDULE, TIMEZONE } from "./config.ts";
import type { RunReport } from "./run.ts";

export interface LocalTime {
  h: number;
  m: number;
}

/** "06:45,12:45" -> sorted unique times; invalid entries throw. "off" / "" -> []. */
export function parseSchedule(spec: string | undefined): LocalTime[] {
  const s = (spec ?? DEFAULT_SCHEDULE).trim();
  if (!s || s.toLowerCase() === "off") return [];
  const out = new Map<number, LocalTime>();
  for (const part of s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)) {
    const m = part.match(/^(\d{1,2}):(\d{2})$/);
    if (!m || Number(m[1]) > 23 || Number(m[2]) > 59)
      throw new Error(`invalid PIPELINE_SCHEDULE entry "${part}" (expected HH:MM)`);
    out.set(Number(m[1]) * 60 + Number(m[2]), { h: Number(m[1]), m: Number(m[2]) });
  }
  return [...out.entries()].sort((a, b) => a[0] - b[0]).map(([, t]) => t);
}

export const formatSchedule = (ts: LocalTime[]): string[] =>
  ts.map((t) => `${String(t.h).padStart(2, "0")}:${String(t.m).padStart(2, "0")}`);

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function parts(date: Date, tz: string): { y: number; mo: number; d: number; h: number; mi: number; s: number } {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    fmtCache.set(tz, f);
  }
  const o: Record<string, number> = {};
  for (const p of f.formatToParts(date)) if (p.type !== "literal") o[p.type] = Number(p.value);
  return { y: o.year, mo: o.month, d: o.day, h: o.hour === 24 ? 0 : o.hour, mi: o.minute, s: o.second };
}

/** offset (ms) of `tz` at instant `t`: local wall clock - UTC */
export function tzOffsetMs(t: number, tz: string): number {
  const p = parts(new Date(t), tz);
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(t / 1000) * 1000;
}

/**
 * UTC instant of local wall-clock time y-mo-d h:mi in `tz`. A time skipped by a spring-forward change
 * resolves to the instant just after the gap (same as adding the missing hour); an ambiguous
 * fall-back time resolves to its first occurrence.
 */
export function zonedToUtc(y: number, mo: number, d: number, h: number, mi: number, tz: string): Date {
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  // candidates with the offsets in force around that day; keep those that map back to the wall time
  const offs = new Set([tzOffsetMs(wall - 36e5 * 12, tz), tzOffsetMs(wall, tz), tzOffsetMs(wall + 36e5 * 12, tz)]);
  const hits = [...offs]
    .map((o) => wall - o)
    .filter((t) => tzOffsetMs(t, tz) === wall - t)
    .sort((a, b) => a - b);
  if (hits.length) return new Date(hits[0]);
  // in a gap: use the offset before the change
  return new Date(wall - Math.min(...offs));
}

/** Next scheduled instant strictly after `now`, or null when the schedule is empty. */
export function nextRun(now: Date, times: LocalTime[], tz: string = TIMEZONE): Date | null {
  if (!times.length) return null;
  const local = parts(now, tz);
  for (let i = 0; i < 3; i++) {
    const day = new Date(Date.UTC(local.y, local.mo - 1, local.d + i));
    for (const t of times) {
      const at = zonedToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), t.h, t.m, tz);
      if (at.getTime() > now.getTime()) return at;
    }
  }
  return null;
}

/** Latest scheduled instant at or before `now`, or null when the schedule is empty. */
export function previousRun(now: Date, times: LocalTime[], tz: string = TIMEZONE): Date | null {
  if (!times.length) return null;
  const local = parts(now, tz);
  for (let i = 0; i < 3; i++) {
    const day = new Date(Date.UTC(local.y, local.mo - 1, local.d - i));
    for (const t of [...times].reverse()) {
      const at = zonedToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), t.h, t.m, tz);
      if (at.getTime() <= now.getTime()) return at;
    }
  }
  return null;
}

/** a catch-up run never follows a run (any trigger) that started less than this ago */
export const CATCH_UP_MIN_GAP_MS = 60 * 60_000;
/** nor runs when the next slot is this close: the slot does it */
export const CATCH_UP_SLOT_MARGIN_MS = 45 * 60_000;
export const RETRY_DELAY_MS = 30 * 60_000;

/**
 * On start: run once when a scheduled slot passed since the last run started (a redeploy or a restart across a slot
 * skips it), no run is in progress, the last run started at least an hour ago and the next slot is not about to run.
 * A volume with no run at all also gets one.
 */
export function catchUpDue(o: {
  now: Date;
  times: LocalTime[];
  lastStartedAt: string | null;
  running: boolean;
  tz?: string;
}): boolean {
  if (o.running || !o.times.length) return false;
  const next = nextRun(o.now, o.times, o.tz);
  if (next && next.getTime() - o.now.getTime() < CATCH_UP_SLOT_MARGIN_MS) return false;
  if (!o.lastStartedAt) return true;
  const last = Date.parse(o.lastStartedAt);
  if (!Number.isFinite(last)) return true;
  if (o.now.getTime() - last < CATCH_UP_MIN_GAP_MS) return false;
  const prev = previousRun(o.now, o.times, o.tz);
  // a slot run starts within seconds of its slot: a little tolerance for clock skew between start and the report
  return !!prev && prev.getTime() > last + 60_000;
}

/** source failures worth one retry: the source was unavailable (5xx, 429, 408, timeout, network), not refused */
export const TRANSIENT_SOURCE_ERROR =
  /\bHTTP (?:5\d\d|429|408)\b|\btimeout\b|\btimed out\b|network error|fetch failed|ECONNRE(?:SET|FUSED)|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|socket hang up/i;

/**
 * One retry about 30 minutes later for a run that failed or was blocked while a source was unavailable — never for the
 * approval gates (class changes, unconfirmed new months: an admin decides those) nor for a crash.
 */
export function retryWanted(
  r: Pick<RunReport, "status" | "sources" | "classChanges" | "reviewNeeded" | "issues">,
): boolean {
  if (r.status !== "failed" && r.status !== "blocked") return false;
  if (r.classChanges?.length || r.reviewNeeded?.length) return false;
  if (r.issues.some((i) => i.key === "run" && /pipeline crashed|could not store the run/.test(i.message))) return false;
  return r.sources.some((s) => !s.ok && TRANSIENT_SOURCE_ERROR.test(String(s.detail ?? "")));
}

/** start of the newest run that is not a dry run (newest first), null when none: a dry run publishes nothing */
export const newestRunStart = (runs: Pick<RunReport, "status" | "startedAt">[]): string | null =>
  runs.find((r) => r.status !== "dry-run")?.startedAt ?? null;

/* ------------------------------------------------------------------ runtime */

type RunResult = RunReport | { locked: true };

interface SchedulerState {
  started: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  next: Date | null;
  times: LocalTime[];
  /** catch-up check after boot, then the retry of a run whose source was unavailable */
  catchUpTimer?: ReturnType<typeof setTimeout> | null;
  retryTimer?: ReturnType<typeof setTimeout> | null;
  retryAt?: Date | null;
  monitorTimer?: ReturnType<typeof setInterval> | null;
}

const G = globalThis as typeof globalThis & { __nymbusPipelineScheduler?: SchedulerState };

export function schedulerState(): SchedulerState | undefined {
  return G.__nymbusPipelineScheduler;
}

export interface SchedulerDeps {
  runPipeline: (o: { trigger: "schedule"; by: string }) => Promise<RunResult>;
  /** start of the newest run that is not a dry run (any trigger), null when none */
  lastStartedAt: () => Promise<string | null>;
  running: () => Promise<boolean>;
  /** freshness check + alert (monitor.ts); called after every run and every `monitorEveryMs` */
  monitor?: () => Promise<void>;
}

const defaultDeps = (): SchedulerDeps => ({
  runPipeline: async (o) => (await import("./run.ts")).runPipeline(o),
  // dry runs do not count: they publish nothing
  lastStartedAt: async () => newestRunStart(await (await import("./run.ts")).listRuns(20)),
  running: async () => (await import("./run.ts")).pipelineRunning(),
  monitor: async () => {
    await (await import("./monitor.ts")).runMonitor();
  },
});

/**
 * Start the scheduler once per process (guarded by a globalThis flag, so dev hot reloads do not stack
 * timers). Cross-process double runs are prevented by the pipeline lock. Besides the slots: one catch-up run after boot
 * when a slot was missed (`catchUpDue`), one retry ~30 min after a run a source made fail (`retryWanted`), and the data
 * freshness monitor every 30 min.
 */
export function startScheduler(
  opts: {
    schedule?: string;
    log?: (msg: string) => void;
    deps?: Partial<SchedulerDeps>;
    bootDelayMs?: number;
    secondCheckMs?: number;
    retryDelayMs?: number;
    monitorEveryMs?: number;
  } = {},
): SchedulerState | null {
  const log = opts.log ?? ((m: string) => console.log(`[pipeline] ${m}`));
  if (G.__nymbusPipelineScheduler?.started) return G.__nymbusPipelineScheduler;
  let times: LocalTime[];
  try {
    times = parseSchedule(opts.schedule ?? process.env.PIPELINE_SCHEDULE);
  } catch (e: unknown) {
    log(`scheduler not started: ${(e as Error).message}`);
    return null;
  }
  if (!times.length) {
    log("scheduler off (PIPELINE_SCHEDULE=off)");
    return null;
  }
  const deps: SchedulerDeps = { ...defaultDeps(), ...opts.deps };
  const retryDelay = opts.retryDelayMs ?? RETRY_DELAY_MS;
  const state: SchedulerState = {
    started: true,
    timer: null,
    next: null,
    times,
    catchUpTimer: null,
    retryTimer: null,
    retryAt: null,
    monitorTimer: null,
  };
  G.__nymbusPipelineScheduler = state;
  const live = (): boolean => G.__nymbusPipelineScheduler === state;
  const monitor = async (): Promise<void> => {
    if (!deps.monitor) return;
    try {
      await deps.monitor();
    } catch (e: unknown) {
      log(`freshness monitor failed: ${(e as Error)?.message ?? e}`);
    }
  };
  const execute = async (by: string, label: string, allowRetry: boolean): Promise<void> => {
    try {
      const r = await deps.runPipeline({ trigger: "schedule", by });
      if ("locked" in r) {
        log(`${label} skipped: another run in progress`);
        return;
      }
      log(`${label} ${r.id}: ${r.status}`);
      for (const s of r.sources.filter((x) => !x.ok))
        log(`  source ${s.name} failed: ${String(s.detail ?? "").slice(0, 300)}`);
      for (const i of r.issues.filter((x) => x.level === "error").slice(0, 10))
        log(`  ${i.key}: ${i.message.slice(0, 300)}`);
      if (allowRetry && live() && retryWanted(r)) scheduleRetry();
    } catch (e: unknown) {
      log(`${label} crashed: ${(e as Error)?.message ?? e}`);
    } finally {
      await monitor();
    }
  };
  const scheduleRetry = (): void => {
    const at = new Date(Date.now() + retryDelay);
    // the next slot runs soon after anyway: no separate retry
    if (state.next && state.next.getTime() - at.getTime() < CATCH_UP_SLOT_MARGIN_MS) {
      log("a source was unavailable: the next scheduled run is close, no separate retry");
      return;
    }
    if (state.retryTimer) clearTimeout(state.retryTimer);
    state.retryAt = at;
    log(`a source was unavailable: one retry at ${at.toISOString()}`);
    state.retryTimer = setTimeout(() => {
      state.retryTimer = null;
      state.retryAt = null;
      if (live()) void execute("scheduler (retry: source unavailable)", "retry run", false);
    }, retryDelay);
    state.retryTimer.unref?.();
  };
  const arm = (): void => {
    const next = nextRun(new Date(Date.now() + 1000), times);
    state.next = next;
    if (!next) return;
    const delay = Math.min(Math.max(next.getTime() - Date.now(), 1000), 2 ** 31 - 1);
    state.timer = setTimeout(fire, delay);
    state.timer.unref?.();
  };
  const fire = async (): Promise<void> => {
    // a timer may fire early after a long delay clamp: only run when due
    if (state.next && Date.now() + 5000 < state.next.getTime()) return arm();
    if (state.retryTimer) {
      clearTimeout(state.retryTimer); // the slot supersedes a pending retry
      state.retryTimer = null;
      state.retryAt = null;
    }
    // arm the next slot first: the retry decision compares with it (it must not see this slot as "next")
    if (live()) arm();
    await execute("scheduler", "scheduled run", true);
  };
  arm();
  // catch-up checks: shortly after boot, and again after the lock of a run killed by the restart has gone stale
  const catchUpCheck = async (): Promise<void> => {
    if (!live()) return;
    try {
      const [lastStartedAt, running] = await Promise.all([deps.lastStartedAt(), deps.running()]);
      if (catchUpDue({ now: new Date(), times, lastStartedAt, running })) {
        log(`catch-up: a scheduled slot was missed (last run started ${lastStartedAt ?? "never"})`);
        await execute("scheduler (catch-up)", "catch-up run", true);
      } else await monitor();
    } catch (e: unknown) {
      log(`catch-up check failed: ${(e as Error)?.message ?? e}`);
    }
  };
  state.catchUpTimer = setTimeout(() => {
    state.catchUpTimer = setTimeout(
      () => {
        state.catchUpTimer = null;
        void catchUpCheck();
      },
      Math.max(0, (opts.secondCheckMs ?? 35 * 60_000) - (opts.bootDelayMs ?? 90_000)),
    );
    state.catchUpTimer.unref?.();
    void catchUpCheck();
  }, opts.bootDelayMs ?? 90_000);
  state.catchUpTimer.unref?.();
  state.monitorTimer = setInterval(() => void monitor(), opts.monitorEveryMs ?? 30 * 60_000);
  state.monitorTimer.unref?.();
  log(
    `scheduler started (${formatSchedule(times).join(", ")} ${TIMEZONE}); next run ${state.next?.toISOString() ?? "none"}`,
  );
  return state;
}

export function stopScheduler(): void {
  const s = G.__nymbusPipelineScheduler;
  if (s?.timer) clearTimeout(s.timer);
  if (s?.catchUpTimer) clearTimeout(s.catchUpTimer);
  if (s?.retryTimer) clearTimeout(s.retryTimer);
  if (s?.monitorTimer) clearInterval(s.monitorTimer);
  G.__nymbusPipelineScheduler = undefined;
}
