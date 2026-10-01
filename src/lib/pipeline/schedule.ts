/**
 * In-process scheduler: runs the pipeline at fixed local times (America/Toronto), DST-aware through
 * Intl. Started by src/instrumentation.ts (Node runtime only). The pipeline itself is imported lazily
 * so this module stays cheap to import (and testable).
 */
import { DEFAULT_SCHEDULE, TIMEZONE } from "./config.ts";

export interface LocalTime { h: number; m: number }

/** "06:45,12:45" -> sorted unique times; invalid entries throw. "off" / "" -> []. */
export function parseSchedule(spec: string | undefined): LocalTime[] {
  const s = (spec ?? DEFAULT_SCHEDULE).trim();
  if (!s || s.toLowerCase() === "off") return [];
  const out = new Map<number, LocalTime>();
  for (const part of s.split(",").map((x) => x.trim()).filter(Boolean)) {
    const m = part.match(/^(\d{1,2}):(\d{2})$/);
    if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) throw new Error(`invalid PIPELINE_SCHEDULE entry "${part}" (expected HH:MM)`);
    out.set(Number(m[1]) * 60 + Number(m[2]), { h: Number(m[1]), m: Number(m[2]) });
  }
  return [...out.entries()].sort((a, b) => a[0] - b[0]).map(([, t]) => t);
}

export const formatSchedule = (ts: LocalTime[]): string[] => ts.map((t) => `${String(t.h).padStart(2, "0")}:${String(t.m).padStart(2, "0")}`);

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function parts(date: Date, tz: string): { y: number; mo: number; d: number; h: number; mi: number; s: number } {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
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
  const hits = [...offs].map((o) => wall - o).filter((t) => tzOffsetMs(t, tz) === wall - t).sort((a, b) => a - b);
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

/* ------------------------------------------------------------------ runtime */

interface SchedulerState { started: boolean; timer: ReturnType<typeof setTimeout> | null; next: Date | null; times: LocalTime[] }

const G = globalThis as typeof globalThis & { __nymbusPipelineScheduler?: SchedulerState };

export function schedulerState(): SchedulerState | undefined {
  return G.__nymbusPipelineScheduler;
}

/**
 * Start the scheduler once per process (guarded by a globalThis flag, so dev hot reloads do not stack
 * timers). Cross-process double runs are prevented by the pipeline lock.
 */
export function startScheduler(opts: { schedule?: string; log?: (msg: string) => void } = {}): SchedulerState | null {
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
  const state: SchedulerState = { started: true, timer: null, next: null, times };
  G.__nymbusPipelineScheduler = state;
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
    try {
      const { runPipeline } = await import("./run.ts");
      const r = await runPipeline({ trigger: "schedule", by: "scheduler" });
      if ("locked" in r) log("scheduled run skipped: another run in progress");
      else {
        log(`scheduled run ${r.id}: ${r.status}`);
        for (const s of r.sources.filter((x) => !x.ok)) log(`  source ${s.name} failed: ${String(s.detail ?? "").slice(0, 300)}`);
        for (const i of r.issues.filter((x) => x.level === "error").slice(0, 10)) log(`  ${i.key}: ${i.message.slice(0, 300)}`);
      }
    } catch (e: unknown) {
      log(`scheduled run crashed: ${(e as Error)?.message ?? e}`);
    } finally {
      arm();
    }
  };
  arm();
  log(`scheduler started (${formatSchedule(times).join(", ")} ${TIMEZONE}); next run ${state.next?.toISOString() ?? "none"}`);
  return state;
}

export function stopScheduler(): void {
  const s = G.__nymbusPipelineScheduler;
  if (s?.timer) clearTimeout(s.timer);
  G.__nymbusPipelineScheduler = undefined;
}
