import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  ALERT_DELIVERY, alertChannelStatus, alertDecision, alertFormat, alertPayload, announceNew, deliverWebhook, messageText, raiseAlert,
  readAlertState, resolveAlert, sendAlertNow, type AlertMessage,
} from "../../../src/lib/pipeline/alerts.ts";

let dir = "";
const savedDelays = ALERT_DELIVERY.delays;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "alerts-"));
  process.env.SITE_DATA_DIR = dir;
  ALERT_DELIVERY.delays = [0, 0, 0];
});
afterEach(async () => {
  ALERT_DELIVERY.delays = savedDelays;
  await rm(dir, { recursive: true, force: true });
});

const URL_ = "https://hooks.example.test/services/SECRET-PATH";
const env = (extra: Record<string, string> = {}): Record<string, string> => ({ PIPELINE_ALERT_WEBHOOK: URL_, ...extra });
const MSG: AlertMessage = { title: "T", lines: ["a", "b"], severity: "error", adminPath: "/admin/runs/x" };

function hook(statuses: (number | Error)[] = [200]) {
  const bodies: unknown[] = [];
  let i = 0;
  const fetchImpl = (async (_u: string | URL | Request, init?: RequestInit) => {
    bodies.push(JSON.parse(String(init?.body)));
    const s = statuses[Math.min(i++, statuses.length - 1)];
    if (s instanceof Error) throw s;
    return new Response("x", { status: s });
  }) as typeof fetch;
  return { fetchImpl, bodies, calls: () => i };
}

test("format: Teams detected from the webhook host (incoming webhook, Workflows), PIPELINE_ALERT_FORMAT wins, else generic JSON", () => {
  assert.deepEqual(alertFormat("https://nymbus.webhook.office.com/webhookb2/abc", {}), { format: "teams", source: "auto" });
  assert.equal(alertFormat("https://prod-12.canadacentral.logic.azure.com:443/workflows/abc/triggers/manual/paths/invoke?sig=x", {}).format, "teams");
  assert.equal(alertFormat("https://default123.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/x", {}).format, "teams");
  assert.equal(alertFormat("https://hooks.slack.com/services/x", {}).format, "json");
  assert.equal(alertFormat("https://evil-webhook.office.com.example.test/x", {}).format, "json", "suffix match on the host only");
  assert.deepEqual(alertFormat("https://hooks.slack.com/x", { PIPELINE_ALERT_FORMAT: "Teams" }), { format: "teams", source: "env" });
  assert.deepEqual(alertFormat("https://nymbus.webhook.office.com/x", { PIPELINE_ALERT_FORMAT: "json" }), { format: "json", source: "env" });
  assert.equal(alertFormat(null, { PIPELINE_ALERT_FORMAT: "bogus" }).format, "json");
});

test("payloads: Teams Adaptive Card with an Open-the-admin button (absolute with PUBLIC_URL); generic JSON keeps `text`", () => {
  const t = alertPayload(MSG, "teams", { PUBLIC_URL: "https://www.example.test/" }) as { type: string; attachments: { contentType: string; content: { type: string; body: { text: string; color?: string }[]; actions?: { url: string }[] } }[] };
  assert.equal(t.type, "message");
  assert.equal(t.attachments[0].contentType, "application/vnd.microsoft.card.adaptive");
  assert.equal(t.attachments[0].content.type, "AdaptiveCard");
  assert.deepEqual(t.attachments[0].content.body.map((b) => b.text), ["T", "a", "b"]);
  assert.equal(t.attachments[0].content.body[0].color, "Attention");
  assert.equal(t.attachments[0].content.actions![0].url, "https://www.example.test/admin/runs/x");
  const noBase = alertPayload(MSG, "teams", {}) as { attachments: { content: { body: { text: string }[]; actions?: unknown } }[] };
  assert.equal(noBase.attachments[0].content.actions, undefined, "no relative URL in an OpenUrl action");
  assert.equal(noBase.attachments[0].content.body.at(-1)!.text, "Admin: /admin/runs/x");
  const j = alertPayload(MSG, "json", {}) as { text: string; title: string; severity: string; lines: string[]; adminUrl: string };
  assert.equal(j.text, "T\na\nb\nAdmin: /admin/runs/x");
  assert.deepEqual([j.title, j.severity, j.lines, j.adminUrl], ["T", "error", ["a", "b"], "/admin/runs/x"]);
  // long messages are capped
  const long = messageText({ title: "x", lines: Array.from({ length: 40 }, (_, i) => `${i} ${"y".repeat(600)}`), severity: "info" }, {});
  assert.ok(long.split("\n").length <= 28 && long.includes("… 15 more"));
  assert.ok(long.split("\n").every((l) => l.length <= 400));
});

test("delivery: retries 5xx / 429 / network errors with backoff, never a 4xx; the URL never appears in an error", async () => {
  const waits: number[] = [];
  const sleep = async (ms: number): Promise<void> => { waits.push(ms); };
  let h = hook([500, 503, 200]);
  let r = await deliverWebhook(URL_, { a: 1 }, { fetchImpl: h.fetchImpl, sleep, delays: [10, 20, 30] });
  assert.deepEqual(r, { ok: true, attempts: 3, status: 200 });
  assert.deepEqual(waits, [10, 20]);
  h = hook([400]);
  r = await deliverWebhook(URL_, {}, { fetchImpl: h.fetchImpl, sleep, delays: [10, 20, 30] });
  assert.deepEqual(r, { ok: false, attempts: 1, status: 400, error: "HTTP 400" });
  h = hook([new TypeError(`connect ECONNREFUSED ${URL_}`)]);
  r = await deliverWebhook(URL_, {}, { fetchImpl: h.fetchImpl, sleep, delays: [1, 1, 1] });
  assert.equal(r.ok, false);
  assert.equal(r.attempts, 4);
  assert.ok(!r.error!.includes("SECRET-PATH") && r.error!.includes("<webhook>"), r.error);
  // 429 with Retry-After (seconds, up to 60) is honoured
  waits.length = 0;
  let n = 0;
  const f429 = (async () => (n++ === 0 ? new Response("", { status: 429, headers: { "Retry-After": "7" } }) : new Response("", { status: 202 }))) as typeof fetch;
  r = await deliverWebhook(URL_, {}, { fetchImpl: f429, sleep, delays: [10] });
  assert.deepEqual([r.ok, r.status, waits[0]], [true, 202, 7000]);
});

test("dedup: posted when new or changed, a reminder once a day while it lasts, resolved once; nothing recorded when not delivered", async () => {
  const t0 = new Date("2026-10-05T12:00:00Z");
  const h = hook();
  const kinds: string[] = [];
  const raise = (fp: string, now: Date, e: Record<string, string> = env(), fetchImpl = h.fetchImpl) =>
    raiseAlert({ key: "k", fingerprint: fp, remindAfterMs: 24 * 3_600_000, message: (kind) => (kinds.push(kind), { ...MSG, title: `T ${kind}` }) }, { fetchImpl, now, env: e });
  // not configured: nothing sent, nothing recorded
  assert.equal(await raise("A", t0, {}), "off");
  assert.deepEqual((await readAlertState()).open, {});
  assert.equal(await raise("A", t0), "sent");
  assert.equal(await raise("A", new Date(t0.getTime() + 3_600_000)), "none", "same condition: not again");
  assert.equal(await raise("A", new Date(t0.getTime() + 23 * 3_600_000)), "none");
  assert.equal(await raise("A", new Date(t0.getTime() + 24 * 3_600_000)), "sent", "daily reminder");
  assert.equal(await raise("A", new Date(t0.getTime() + 25 * 3_600_000)), "none");
  assert.equal(await raise("B", new Date(t0.getTime() + 26 * 3_600_000)), "sent", "changed");
  assert.deepEqual(kinds, ["new", "reminder", "changed"]);
  const st = await readAlertState();
  assert.equal(st.open.k.fingerprint, "B");
  assert.equal(st.open.k.since, t0.toISOString(), "a change keeps the start of the episode");
  assert.equal(st.lastDelivery!.ok, true);
  // a failed delivery is not recorded as sent: the next evaluation tries again
  const bad = hook([500]);
  assert.equal(await raise("C", new Date(t0.getTime() + 27 * 3_600_000), env(), bad.fetchImpl), "failed");
  assert.equal(bad.calls(), 4, "4 attempts");
  const failed = await readAlertState();
  assert.equal(failed.open.k.fingerprint, "B");
  assert.deepEqual([failed.lastDelivery!.ok, failed.lastDelivery!.status, failed.lastDelivery!.attempts], [false, 500, 4]);
  assert.equal(await raise("C", new Date(t0.getTime() + 28 * 3_600_000)), "sent");
  // resolved: posted once, then forgotten
  assert.equal(await resolveAlert({ key: "k", message: (o) => ({ title: `resolved since ${o.since}`, lines: [], severity: "ok" }) }, { fetchImpl: h.fetchImpl, env: env() }), "sent");
  assert.equal(await resolveAlert({ key: "k", message: () => ({ title: "x", lines: [], severity: "ok" }) }, { fetchImpl: h.fetchImpl, env: env() }), "none");
  assert.deepEqual((await readAlertState()).open, {});
  const titles = h.bodies.map((b) => (b as { title: string }).title);
  assert.deepEqual(titles, ["T new", "T reminder", "T changed", "T changed", `resolved since ${t0.toISOString()}`]);
  // the state file never holds the URL
  assert.ok(!(await readFile(path.join(dir, "alerts", "state.json"), "utf8")).includes("SECRET"));
});

test("alertDecision", () => {
  const now = new Date("2026-10-05T00:00:00Z");
  const e = { fingerprint: "a", title: "t", since: "2026-10-01T00:00:00Z", lastSentAt: "2026-10-04T00:00:01Z" };
  assert.equal(alertDecision(undefined, "a", now), "new");
  assert.equal(alertDecision(e, "b", now), "changed");
  assert.equal(alertDecision(e, "a", now), "none", "no reminder unless asked");
  assert.equal(alertDecision(e, "a", now, 86_400_000), "none");
  assert.equal(alertDecision({ ...e, lastSentAt: "2026-10-04T00:00:00Z" }, "a", now, 86_400_000), "reminder");
});

test("announceNew: each item once while it lasts; an item that disappears and comes back is posted again", async () => {
  const h = hook();
  const go = (ids: string[]) => announceNew({ key: "n", items: ids.map((id) => ({ id, line: `line ${id}` })), message: (fresh) => ({ title: "N", lines: fresh.map((f) => f.line), severity: "warn" }) }, { fetchImpl: h.fetchImpl, env: env() });
  assert.equal(await go(["a", "b"]), "sent");
  assert.equal(await go(["b", "a"]), "none");
  assert.equal(await go(["a", "b", "c"]), "sent");
  assert.equal(await go(["c"]), "none");
  assert.equal(await go(["a", "c"]), "sent");
  assert.deepEqual(h.bodies.map((b) => (b as { lines: string[] }).lines), [["line a", "line b"], ["line c"], ["line a"]]);
});

test("channel status for the admin: configured, format, host only (never the path), last delivery", async () => {
  const off = alertChannelStatus(await readAlertState(), {});
  assert.deepEqual([off.configured, off.host, off.lastDelivery], [false, null, null]);
  const h = hook([200]);
  assert.equal(await sendAlertNow(MSG, { fetchImpl: h.fetchImpl, env: env() }), "sent");
  const on = alertChannelStatus(await readAlertState(), env());
  assert.equal(on.configured, true);
  assert.equal(on.format, "json");
  assert.equal(on.host, "hooks.example.test");
  assert.equal(on.lastDelivery!.ok, true);
  assert.ok(!JSON.stringify(on).includes("SECRET-PATH"));
  assert.equal(await sendAlertNow(MSG, { env: {} }), "off");
});

test("concurrent alerts of the process are serialised: no lost update of the state", async () => {
  const h = hook();
  await Promise.all(["a", "b", "c", "d"].map((k) => raiseAlert({ key: k, fingerprint: "x", message: () => MSG }, { fetchImpl: h.fetchImpl, env: env() })));
  assert.deepEqual(Object.keys((await readAlertState()).open).sort(), ["a", "b", "c", "d"]);
});
