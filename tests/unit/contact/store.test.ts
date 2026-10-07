import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readdirSync, readFileSync, writeFileSync, mkdirSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "nymbus-inq-"));
process.env.SITE_DATA_DIR = dir;
delete process.env.PIPELINE_ALERT_WEBHOOK;

const store = await import("../../../src/lib/contact/store.ts");
const { csvCell, inquiriesCsv, CSV_COLUMNS } = await import("../../../src/lib/contact/csv.ts");
const { inquiryAlert, notifyInquiry } = await import("../../../src/lib/contact/notify.ts");
const { alertPayload } = await import("../../../src/lib/pipeline/alerts.ts");

after(() => rmSync(dir, { recursive: true, force: true }));

/** save and return the stored record (asserting it is not a duplicate) */
async function save(v: Parameters<typeof store.saveInquiry>[0], now?: Date, max?: number) {
  const r = await store.saveInquiry(v, now, max);
  assert.equal(r.duplicate, false);
  return r.record;
}

const V = {
  profile: "Individual investor" as const,
  interests: ["General inquiry"],
  name: "Test Person",
  email: "test@example.com",
  message: "Hello <b>there</b>",
  lang: "en" as const,
};

test("store: save, list newest first, get, ids are validated", async () => {
  const a = await save(V, new Date("2026-10-01T10:00:00Z"));
  const b = await save({ ...V, name: "Second Person" }, new Date("2026-10-02T10:00:00Z"));
  assert.ok(store.isInquiryId(a.id));
  assert.equal(a.handled, null);
  assert.deepEqual(a.consent, { at: "2026-10-01T10:00:00.000Z", version: store.CONSENT_VERSION });
  const list = await store.listInquiries();
  assert.deepEqual(
    list.map((r) => r.id),
    [b.id, a.id],
  );
  assert.equal((await store.getInquiry(a.id))?.message, "Hello <b>there</b>", "stored as plain text, verbatim");
  for (const bad of ["../content/site-content", "x", "20260101T000000-zzzzzzzz", ""])
    assert.equal(await store.getInquiry(bad), null);
  // one JSON file per inquiry, nothing else (no temp files left)
  assert.deepEqual(readdirSync(path.join(dir, "inquiries")).sort(), [`${a.id}.json`, `${b.id}.json`].sort());
  // no IP address or other request data in the record
  assert.deepEqual(Object.keys(JSON.parse(readFileSync(path.join(dir, "inquiries", `${a.id}.json`), "utf8"))).sort(), [
    "consent",
    "email",
    "handled",
    "id",
    "interests",
    "lang",
    "message",
    "name",
    "profile",
    "receivedAt",
  ]);
  await store.deleteInquiry(a.id);
  await store.deleteInquiry(b.id);
});

test("store: mark handled / open again, delete; a deleted inquiry is never brought back", async () => {
  const r = await save(V);
  const h = await store.setInquiryHandled(r.id, true, "alice@nymbus.ca", new Date("2026-10-03T00:00:00Z"));
  assert.deepEqual(h?.handled, { at: "2026-10-03T00:00:00.000Z", by: "alice@nymbus.ca" });
  assert.equal((await store.setInquiryHandled(r.id, false, "alice@nymbus.ca"))?.handled, null);
  const [d] = await Promise.all([store.deleteInquiry(r.id), store.setInquiryHandled(r.id, true, "bob@nymbus.ca")]);
  assert.equal(d?.id, r.id);
  assert.equal(await store.getInquiry(r.id), null);
  assert.equal(await store.setInquiryHandled(r.id, true, "bob@nymbus.ca"), null);
  assert.equal(await store.deleteInquiry(r.id), null);
});

test("retention: deleted no later than 180 days (default) after receipt, damaged files too, orphaned temp files after 1 h", async () => {
  const now = new Date("2027-04-04T12:00:00Z");
  const old = await save(V, new Date("2026-10-05T12:00:00Z")); // 181 days before
  const edge = await save({ ...V, name: "Edge Person" }, new Date("2026-10-07T00:00:00Z")); // 179.5 days: inside the margin
  const recent = await save({ ...V, name: "Recent Person" }, new Date("2026-10-08T12:00:00Z")); // 178 days before
  mkdirSync(path.join(dir, "inquiries"), { recursive: true });
  writeFileSync(path.join(dir, "inquiries", "20250101T000000-0123abcd.json"), "{ damaged");
  writeFileSync(path.join(dir, "inquiries", "notes.txt"), "not an inquiry");
  const staleTmp = path.join(dir, "inquiries", "20261006T100000-0123abcd.json.1.abcdef.tmp");
  const freshTmp = path.join(dir, "inquiries", "20261006T100000-0123abce.json.1.abcdef.tmp");
  writeFileSync(staleTmp, "{ half");
  writeFileSync(freshTmp, "{ half");
  utimesSync(staleTmp, new Date(now.getTime() - 2 * 3_600_000), new Date(now.getTime() - 2 * 3_600_000));
  utimesSync(freshTmp, new Date(now.getTime() - 60_000), new Date(now.getTime() - 60_000));
  assert.equal(store.RETENTION_DAYS, 180);
  assert.equal(await store.configuredRetentionDays(), 180, "no settings stored: the default");
  assert.equal(await store.purgeExpiredInquiries(now), 3);
  assert.equal(await store.getInquiry(old.id), null);
  assert.equal(await store.getInquiry(edge.id), null, "within a day of 180: deleted now, not after the limit");
  assert.ok(await store.getInquiry(recent.id));
  const left = readdirSync(path.join(dir, "inquiries"));
  assert.ok(!left.includes(path.basename(staleTmp)), "orphaned temp file removed");
  assert.ok(left.includes(path.basename(freshTmp)), "a write in progress is left alone");
  rmSync(freshTmp);
  assert.equal(await store.purgeExpiredInquiries(now), 0);
  // a shorter retention set in the admin settings applies on the next purge
  mkdirSync(path.join(dir, "content"), { recursive: true });
  writeFileSync(
    path.join(dir, "content", "site-content.json"),
    JSON.stringify({ version: 1, inquiryPolicy: { retentionDays: 30 } }),
  );
  assert.equal(await store.configuredRetentionDays(), 30);
  assert.equal(await store.purgeExpiredInquiries(now), 1);
  assert.equal(await store.getInquiry(recent.id), null);
  rmSync(path.join(dir, "content"), { recursive: true, force: true });
  rmSync(path.join(dir, "inquiries", "notes.txt"));
});

test("retention: the setting is clamped to 30-180 days (the privacy policy promises at most 180)", () => {
  assert.equal(store.retentionDaysOf(null), 180);
  assert.equal(store.retentionDaysOf({}), 180);
  assert.equal(store.retentionDaysOf({ inquiryPolicy: { retentionDays: 90 } }), 90);
  assert.equal(store.retentionDaysOf({ inquiryPolicy: { retentionDays: 365 } }), 180);
  assert.equal(store.retentionDaysOf({ inquiryPolicy: { retentionDays: 1 } }), 30);
  assert.equal(store.retentionDaysOf({ inquiryPolicy: { retentionDays: "10" } }), 180);
  assert.equal(store.retentionDaysOf({ inquiryPolicy: { retentionDays: Number.NaN } }), 180);
  assert.equal(store.RETENTION_MAX_DAYS, 180);
});

test("alert: only the first name and profile, a link to the admin; off without a webhook", async () => {
  const r = await save({ ...V, name: "Test Person-Surname", phone: "514 555 0100", company: "Secret Co" });
  const msg = inquiryAlert(r);
  assert.equal(msg.title, "New website inquiry: Test (Individual investor)");
  assert.equal(msg.adminPath, "/admin/inquiries");
  const body = JSON.stringify([
    alertPayload(msg, "teams", { PUBLIC_URL: "https://www.nymbus.ca" }),
    alertPayload(msg, "json", {}),
  ]);
  for (const secret of ["test@example.com", "Hello", "there", "514 555 0100", "Secret Co", "General inquiry", "Person"])
    assert.ok(!body.includes(secret), secret);
  assert.equal(await notifyInquiry(r, { env: {} }), "off");
  let posted: unknown = null;
  const fetchImpl = (async (_u: string, init: { body: string }) => {
    posted = JSON.parse(init.body);
    return new Response(null, { status: 200 });
  }) as unknown as typeof fetch;
  assert.equal(
    await notifyInquiry(r, {
      env: { PIPELINE_ALERT_WEBHOOK: "https://example.webhook.office.com/x" },
      fetchImpl,
      delays: [],
    }),
    "sent",
  );
  const sent = JSON.stringify(posted);
  assert.ok(sent.includes("Test") && sent.includes("/admin/inquiries"));
  for (const secret of ["test@example.com", "Hello", "Person", "Secret Co", "514 555 0100"])
    assert.ok(!sent.includes(secret), secret);
  await store.deleteInquiry(r.id);
});

test("alert: a failed delivery logs and stores the redacted title only (no first name)", async () => {
  const r = await save({ ...V, name: "Zelda Person", message: "Failure case" });
  const logs: string[] = [];
  const failing = (async () => new Response("nope", { status: 500 })) as unknown as typeof fetch;
  const out = await notifyInquiry(r, {
    env: { PIPELINE_ALERT_WEBHOOK: "https://example.webhook.office.com/x" },
    fetchImpl: failing,
    delays: [],
    sleep: async () => {},
    log: (m) => logs.push(m),
  });
  assert.equal(out, "failed");
  assert.ok(logs.length > 0);
  const state = readFileSync(path.join(dir, "alerts", "state.json"), "utf8");
  for (const text of [...logs, state]) assert.ok(!text.includes("Zelda"), text);
  assert.ok(state.includes("New website inquiry"));
  await store.deleteInquiry(r.id);
});

test("store: refuses new inquiries past the hard cap", async () => {
  const a = await save({ ...V, name: "Cap One" }, new Date(), 2);
  const b = await save({ ...V, name: "Cap Two" }, new Date(), 2);
  await assert.rejects(store.saveInquiry({ ...V, name: "Cap Three" }, new Date(), 2), store.InquiryStoreFullError);
  assert.equal((await store.listInquiries()).length, 2);
  assert.ok(store.MAX_STORED >= 1000);
  await store.deleteInquiry(a.id);
  await store.deleteInquiry(b.id);
});

test("store: an identical inquiry within 24 hours is not stored again; a changed one or a later one is", async () => {
  const t0 = new Date("2026-10-06T10:00:00Z");
  const a = await save(V, t0);
  const again = await store.saveInquiry(
    { ...V, email: "TEST@example.com", interests: [...V.interests] },
    new Date(t0.getTime() + 60_000),
  );
  assert.equal(again.duplicate, true);
  assert.equal(again.record.id, a.id);
  // concurrent double submit: one stored
  const both = await Promise.all([
    store.saveInquiry({ ...V, name: "Twin" }, t0),
    store.saveInquiry({ ...V, name: "Twin" }, t0),
  ]);
  assert.deepEqual(both.map((r) => r.duplicate).sort(), [false, true]);
  const changed = await save({ ...V, message: "Hello again" }, new Date(t0.getTime() + 60_000));
  const later = await save(V, new Date(t0.getTime() + store.DUPLICATE_WINDOW_MS + 1000));
  assert.equal((await store.listInquiries()).length, 4);
  assert.equal(await store.openInquiryCount(), 4);
  await store.setInquiryHandled(a.id, true, "alice@nymbus.ca");
  assert.equal(await store.openInquiryCount(), 3);
  for (const r of [a, changed, later, ...both.filter((x) => !x.duplicate).map((x) => x.record)])
    await store.deleteInquiry(r.id);
  assert.equal((await store.listInquiries()).length, 0);
});

test("csv: header, quoting, formula cells neutralised, BOM", () => {
  assert.equal(csvCell("plain"), "plain");
  assert.equal(csvCell('say "hi", ok'), '"say ""hi"", ok"');
  assert.equal(csvCell("a\nb"), '"a\nb"');
  for (const f of ["=SUM(A1)", "+1", "-1", "@x", "\tx"]) assert.ok(csvCell(f).replace(/^"/, "").startsWith("'"), f);
  assert.equal(csvCell(undefined), "");
  const rec = {
    id: "20261006T100000-0123abcd",
    receivedAt: "2026-10-06T10:00:00.000Z",
    ...V,
    company: '=HYPERLINK("x")',
    consent: { at: "2026-10-06T10:00:00.000Z", version: "v" },
    handled: { at: "2026-10-07T00:00:00.000Z", by: "alice@nymbus.ca" },
  };
  const out = inquiriesCsv([rec]);
  assert.ok(out.startsWith("\uFEFF" + CSV_COLUMNS.join(",") + "\r\n"));
  const row = out.split("\r\n")[1];
  assert.ok(
    row.startsWith(
      "20261006T100000-0123abcd,2026-10-06T10:00:00.000Z,handled,2026-10-07T00:00:00.000Z,alice@nymbus.ca,Test Person,test@example.com,,",
    ),
  );
  assert.ok(row.includes(`"'=HYPERLINK(""x"")"`));
  assert.ok(row.includes("Hello <b>there</b>"));
  assert.equal(inquiriesCsv([]), "\uFEFF" + CSV_COLUMNS.join(",") + "\r\n");
});
