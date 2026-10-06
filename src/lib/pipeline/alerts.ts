/**
 * Operations alerts (PIPELINE_ALERT_WEBHOOK): payload format (Microsoft Teams or generic JSON), delivery with retries and
 * backoff, and the dedup state kept on the data volume (`alerts/state.json`), so that a condition is posted when it
 * appears or changes, reminded once a day while it lasts (when the caller asks for reminders), and posted as resolved
 * when it clears. Every alert of the process (pipeline runs, data freshness, rankings) goes through here.
 *
 * Dependency-free (Node only, relative imports): unit tested with plain Node. State updates are serialised in-process
 * (one instance; the CLI in the container is a separate process and may, rarely, race a scheduled alert).
 * The webhook URL is itself the secret: it is never logged, stored or returned (only its host, to the admin).
 */
import { readJson, writeJson } from "../data/store.ts";

export type AlertFormat = "teams" | "json";
export type AlertSeverity = "error" | "warn" | "info" | "ok";

export interface AlertMessage {
  title: string;
  lines: string[];
  severity: AlertSeverity;
  /** admin path to open (e.g. "/admin/runs/<id>"); made absolute with PUBLIC_URL when that is set */
  adminPath?: string;
}

export interface DeliveryResult {
  ok: boolean;
  attempts: number;
  status?: number;
  error?: string;
}

export interface OpenAlert {
  /** what identifies the condition: a change posts again */
  fingerprint: string;
  title: string;
  /** first posted */
  since: string;
  lastSentAt: string;
  reminders?: number;
}

export interface AlertState {
  version: 1;
  /** last attempt to deliver anything (no URL, no payload) */
  lastDelivery?: { at: string; ok: boolean; attempts: number; status?: number; error?: string; title: string };
  lastSuccessAt?: string;
  open: Record<string, OpenAlert>;
}

export const ALERT_STATE_PATH = ["alerts", "state.json"];
export const REMIND_AFTER_MS = 24 * 3_600_000;
/** waits between attempts (4 attempts in all); tests may shorten them */
export const ALERT_DELIVERY: { delays: number[] } = { delays: [2_000, 8_000, 30_000] };
const MAX_LINES = 25;
const MAX_LINE = 400;

type Env = Record<string, string | undefined>;

export const webhookUrl = (env: Env = process.env): string | null => {
  const u = (env.PIPELINE_ALERT_WEBHOOK ?? "").trim();
  return /^https?:\/\/\S+$/i.test(u) ? u : null;
};

const TEAMS_HOSTS = [/(^|\.)webhook\.office\.com$/i, /(^|\.)logic\.azure\.com$/i, /(^|\.)powerplatform\.com$/i, /(^|\.)powerautomate\.com$/i];

/**
 * PIPELINE_ALERT_FORMAT = teams | json | auto (default). Auto: Microsoft Teams for a Teams incoming webhook
 * (*.webhook.office.com) or a Teams Workflows / Power Automate webhook (*.logic.azure.com, *.powerplatform.com), else
 * generic JSON (`{ text, title, severity, lines, adminUrl }`, which Slack-style webhooks also accept through `text`).
 */
export function alertFormat(url: string | null, env: Env = process.env): { format: AlertFormat; source: "env" | "auto" } {
  const f = (env.PIPELINE_ALERT_FORMAT ?? "").trim().toLowerCase();
  if (f === "teams" || f === "json") return { format: f, source: "env" };
  let host = "";
  try {
    host = url ? new URL(url).hostname : "";
  } catch {
    host = "";
  }
  return { format: TEAMS_HOSTS.some((r) => r.test(host)) ? "teams" : "json", source: "auto" };
}

/** Absolute admin URL when PUBLIC_URL is an http(s) origin, else the path alone. */
export function adminUrl(path: string | undefined, env: Env = process.env): string | null {
  if (!path || !path.startsWith("/")) return null;
  const base = (env.PUBLIC_URL ?? "").trim().replace(/\/+$/, "");
  return /^https?:\/\/[^\s/]+$/i.test(base) ? `${base}${path}` : path;
}

const clip = (s: string): string => (s.length > MAX_LINE ? `${s.slice(0, MAX_LINE - 1)}…` : s);

/** The text lines of a message (title first, then the lines, then the admin link). */
export function messageText(msg: AlertMessage, env: Env = process.env): string {
  const link = adminUrl(msg.adminPath, env);
  const lines = msg.lines.slice(0, MAX_LINES).map(clip);
  if (msg.lines.length > MAX_LINES) lines.push(`… ${msg.lines.length - MAX_LINES} more`);
  return [msg.title, ...lines, ...(link ? [`Admin: ${link}`] : [])].join("\n");
}

const TEAMS_COLOR: Record<AlertSeverity, string> = { error: "Attention", warn: "Warning", info: "Accent", ok: "Good" };

/**
 * Request body for the format. Teams: an Adaptive Card message, accepted by both Teams incoming webhooks and the
 * Teams Workflows "post to a channel when a webhook request is received" template.
 */
export function alertPayload(msg: AlertMessage, format: AlertFormat, env: Env = process.env): unknown {
  const link = adminUrl(msg.adminPath, env);
  const lines = msg.lines.slice(0, MAX_LINES).map(clip);
  if (msg.lines.length > MAX_LINES) lines.push(`… ${msg.lines.length - MAX_LINES} more`);
  if (format === "json") {
    return { text: messageText(msg, env), title: msg.title, severity: msg.severity, lines, ...(link ? { adminUrl: link } : {}) };
  }
  const absolute = !!link && /^https?:\/\//i.test(link);
  return {
    type: "message",
    attachments: [{
      contentType: "application/vnd.microsoft.card.adaptive",
      contentUrl: null,
      content: {
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        type: "AdaptiveCard",
        version: "1.4",
        msteams: { width: "Full" },
        body: [
          { type: "TextBlock", text: msg.title, weight: "Bolder", size: "Medium", wrap: true, color: TEAMS_COLOR[msg.severity] },
          ...lines.map((l) => ({ type: "TextBlock", text: l, wrap: true, spacing: "Small" })),
          ...(link && !absolute ? [{ type: "TextBlock", text: `Admin: ${link}`, wrap: true, isSubtle: true }] : []),
        ],
        ...(absolute ? { actions: [{ type: "Action.OpenUrl", title: "Open the admin", url: link }] } : {}),
      },
    }],
  };
}

const sleepReal = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const retryable = (status: number): boolean => status === 408 || status === 429 || status >= 500;

/** POST with retries (network errors, timeouts, 408, 429, 5xx) and backoff; a 429 Retry-After up to 60 s is honoured. */
export async function deliverWebhook(
  url: string,
  payload: unknown,
  opts: { fetchImpl?: typeof fetch; sleep?: (ms: number) => Promise<void>; delays?: number[]; timeoutMs?: number } = {},
): Promise<DeliveryResult> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const sleep = opts.sleep ?? sleepReal;
  const delays = opts.delays ?? ALERT_DELIVERY.delays;
  const scrub = (s: string): string => s.split(url).join("<webhook>");
  let last: DeliveryResult = { ok: false, attempts: 0 };
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    let wait = delays[attempt] ?? 0;
    try {
      const res = await fetchImpl(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), redirect: "manual", signal: AbortSignal.timeout(opts.timeoutMs ?? 15_000) });
      await res.body?.cancel().catch(() => undefined);
      if (res.status >= 200 && res.status < 300) return { ok: true, attempts: attempt + 1, status: res.status };
      last = { ok: false, attempts: attempt + 1, status: res.status, error: `HTTP ${res.status}` };
      if (!retryable(res.status)) return last;
      const ra = Number(res.headers.get("retry-after"));
      if (res.status === 429 && Number.isFinite(ra) && ra > 0 && ra <= 60) wait = Math.max(wait, ra * 1000);
    } catch (e: unknown) {
      const name = (e as Error)?.name;
      last = { ok: false, attempts: attempt + 1, error: scrub(name === "TimeoutError" || name === "AbortError" ? "timeout" : `network error: ${(e as Error)?.message ?? e}`).slice(0, 300) };
    }
    if (attempt < delays.length) await sleep(wait);
  }
  return last;
}

/* ------------------------------------------------------------------ state + dedup */

const G = globalThis as typeof globalThis & { __nymbusAlertQueue?: Promise<unknown> };

/** run `fn` after every earlier state transaction of this process (in-process mutex) */
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const prev = G.__nymbusAlertQueue ?? Promise.resolve();
  const next = prev.then(fn, fn);
  G.__nymbusAlertQueue = next.catch(() => undefined);
  return next;
}

export async function readAlertState(): Promise<AlertState> {
  const s = await readJson<AlertState | null>(ALERT_STATE_PATH, null).catch(() => null);
  return s && typeof s === "object" && s.version === 1 && s.open && typeof s.open === "object" ? s : { version: 1, open: {} };
}

/** new / changed condition, a reminder due (when `remindAfterMs` is given), or nothing to post */
export function alertDecision(entry: OpenAlert | undefined, fingerprint: string, now: Date, remindAfterMs?: number): "new" | "changed" | "reminder" | "none" {
  if (!entry) return "new";
  if (entry.fingerprint !== fingerprint) return "changed";
  if (remindAfterMs !== undefined && now.getTime() - Date.parse(entry.lastSentAt) >= remindAfterMs) return "reminder";
  return "none";
}

export interface AlertCtx {
  now: Date;
  state: AlertState;
  configured: boolean;
  /** deliver a message (records the delivery result in the state); false when not configured or not delivered */
  send(msg: AlertMessage): Promise<boolean>;
}

export interface AlertOpts { fetchImpl?: typeof fetch; now?: Date; env?: Env; sleep?: (ms: number) => Promise<void>; delays?: number[]; log?: (m: string) => void }

/** One serialised read → decide / send → write of the alert state. */
export function withAlerts<T>(fn: (ctx: AlertCtx) => Promise<T>, opts: AlertOpts = {}): Promise<T> {
  return serial(async () => {
    const env = opts.env ?? process.env;
    const now = opts.now ?? new Date();
    const url = webhookUrl(env);
    const log = opts.log ?? ((m: string) => console.error(`[alerts] ${m}`));
    const state = await readAlertState();
    const before = JSON.stringify(state);
    const ctx: AlertCtx = {
      now, state, configured: !!url,
      async send(msg) {
        if (!url) return false;
        const { format } = alertFormat(url, env);
        const r = await deliverWebhook(url, alertPayload(msg, format, env), { fetchImpl: opts.fetchImpl, sleep: opts.sleep, delays: opts.delays });
        const at = new Date().toISOString();
        state.lastDelivery = { at, ok: r.ok, attempts: r.attempts, ...(r.status !== undefined ? { status: r.status } : {}), ...(r.error ? { error: r.error } : {}), title: msg.title.slice(0, 200) };
        if (r.ok) state.lastSuccessAt = at;
        else log(`alert webhook failed after ${r.attempts} attempt(s): ${r.error ?? "unknown error"} (${msg.title.slice(0, 120)})`);
        return r.ok;
      },
    };
    const out = await fn(ctx);
    if (JSON.stringify(state) !== before) await writeJson(ALERT_STATE_PATH, state).catch((e: unknown) => log(`could not store the alert state: ${(e as Error)?.message ?? e}`));
    return out;
  });
}

/** Record a delivered alert for `key` (open condition). */
export function markSent(state: AlertState, key: string, fingerprint: string, title: string, now: Date, kind: "new" | "changed" | "reminder"): void {
  const prev = state.open[key];
  const at = now.toISOString();
  state.open[key] = kind === "reminder" && prev
    ? { ...prev, lastSentAt: at, reminders: (prev.reminders ?? 0) + 1 }
    : { fingerprint, title: title.slice(0, 200), since: kind === "changed" && prev ? prev.since : at, lastSentAt: at };
}

/**
 * Post a condition when it is new or changed (and, with `remindAfterMs`, again once that long has passed while it
 * lasts). The state is updated only when the message is delivered, so a failed or unconfigured delivery is tried again
 * at the next evaluation.
 */
export function raiseAlert(
  a: { key: string; fingerprint: string; message: (kind: "new" | "changed" | "reminder", open: OpenAlert | undefined) => AlertMessage; remindAfterMs?: number },
  opts: AlertOpts = {},
): Promise<"sent" | "none" | "failed" | "off"> {
  return withAlerts(async (ctx) => {
    const kind = alertDecision(ctx.state.open[a.key], a.fingerprint, ctx.now, a.remindAfterMs);
    if (kind === "none") return "none";
    if (!ctx.configured) return "off";
    const msg = a.message(kind, ctx.state.open[a.key]);
    if (!(await ctx.send(msg))) return "failed";
    markSent(ctx.state, a.key, a.fingerprint, msg.title, ctx.now, kind);
    return "sent";
  }, opts);
}

/** The condition is gone: post `message` (when given) if it had been posted, then forget it. */
export function resolveAlert(
  a: { key: string; message?: (open: OpenAlert) => AlertMessage | null },
  opts: AlertOpts = {},
): Promise<"sent" | "none" | "failed" | "off"> {
  return withAlerts(async (ctx) => {
    const open = ctx.state.open[a.key];
    if (!open) return "none";
    const msg = a.message?.(open) ?? null;
    if (msg) {
      if (!ctx.configured) return "off";
      if (!(await ctx.send(msg))) return "failed";
    }
    delete ctx.state.open[a.key];
    return msg ? "sent" : "none";
  }, opts);
}

/**
 * Post the items of a set not posted yet (e.g. notices that should be posted once, when they first appear). Items that
 * disappear are forgotten, so an item that comes back later is posted again.
 */
export function announceNew(
  a: { key: string; items: { id: string; line: string }[]; message: (fresh: { id: string; line: string }[]) => AlertMessage },
  opts: AlertOpts = {},
): Promise<"sent" | "none" | "failed" | "off"> {
  return withAlerts(async (ctx) => {
    const prev = new Set<string>(fingerprintList(ctx.state.open[a.key]?.fingerprint));
    const ids = [...new Set(a.items.map((i) => i.id))].sort();
    const fresh = a.items.filter((i, n) => !prev.has(i.id) && a.items.findIndex((j) => j.id === i.id) === n);
    const keepKnown = (): void => {
      const known = ids.filter((id) => prev.has(id));
      if (!known.length) delete ctx.state.open[a.key];
      else if (known.length !== prev.size) ctx.state.open[a.key] = { ...ctx.state.open[a.key]!, fingerprint: JSON.stringify(known) };
    };
    if (!fresh.length) {
      keepKnown();
      return "none";
    }
    if (!ctx.configured) {
      keepKnown();
      return "off";
    }
    const msg = a.message(fresh);
    if (!(await ctx.send(msg))) {
      keepKnown();
      return "failed";
    }
    markSent(ctx.state, a.key, JSON.stringify(ids), msg.title, ctx.now, "new");
    return "sent";
  }, opts);
}

/** the ids stored by announceNew (a JSON list in the fingerprint) */
export function fingerprintList(fp: string | undefined): string[] {
  if (!fp) return [];
  try {
    const v = JSON.parse(fp) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Send one message with no dedup (test message from the admin). */
export function sendAlertNow(msg: AlertMessage, opts: AlertOpts = {}): Promise<"sent" | "failed" | "off"> {
  return withAlerts(async (ctx) => (!ctx.configured ? "off" : (await ctx.send(msg)) ? "sent" : "failed"), opts);
}

/* ------------------------------------------------------------------ admin view */

export interface AlertChannelStatus {
  configured: boolean;
  format: AlertFormat;
  formatSource: "env" | "auto";
  /** webhook host only (the path is the secret) */
  host: string | null;
  lastDelivery: AlertState["lastDelivery"] | null;
  lastSuccessAt: string | null;
  open: { key: string; title: string; since: string; lastSentAt: string }[];
}

export function alertChannelStatus(state: AlertState, env: Env = process.env): AlertChannelStatus {
  const url = webhookUrl(env);
  const { format, source } = alertFormat(url, env);
  let host: string | null = null;
  try {
    host = url ? new URL(url).hostname : null;
  } catch {
    host = null;
  }
  return {
    configured: !!url, format, formatSource: source, host,
    lastDelivery: state.lastDelivery ?? null,
    lastSuccessAt: state.lastSuccessAt ?? null,
    open: Object.entries(state.open).map(([key, o]) => ({ key, title: o.title, since: o.since, lastSentAt: o.lastSentAt })).sort((a, b) => a.key.localeCompare(b.key)),
  };
}
