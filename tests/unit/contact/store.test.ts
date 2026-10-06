import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "nymbus-inq-"));
process.env.SITE_DATA_DIR = dir;
delete process.env.PIPELINE_ALERT_WEBHOOK;

const store = await import("../../../src/lib/contact/store.ts");
const { inquiryAlert, notifyInquiry } = await import("../../../src/lib/contact/notify.ts");
const { alertPayload } = await import("../../../src/lib/pipeline/alerts.ts");

after(() => rmSync(dir, { recursive: true, force: true }));

const V = { profile: "Family office" as const, interests: ["General inquiry"], name: "Test Person", email: "test@example.com", message: "Hello <b>there</b>", lang: "en" as const };

test("store: save, list newest first, get, ids are validated", async () => {
  const a = await store.saveInquiry(V, new Date("2026-10-01T10:00:00Z"));
  const b = await store.saveInquiry({ ...V, name: "Second Person" }, new Date("2026-10-02T10:00:00Z"));
  assert.ok(store.isInquiryId(a.id));
  assert.equal(a.handled, null);
  assert.deepEqual(a.consent, { at: "2026-10-01T10:00:00.000Z", version: store.CONSENT_VERSION });
  const list = await store.listInquiries();
  assert.deepEqual(list.map((r) => r.id), [b.id, a.id]);
  assert.equal((await store.getInquiry(a.id))?.message, "Hello <b>there</b>", "stored as plain text, verbatim");
  for (const bad of ["../content/site-content", "x", "20260101T000000-zzzzzzzz", ""]) assert.equal(await store.getInquiry(bad), null);
  // one JSON file per inquiry, nothing else (no temp files left)
  assert.deepEqual(readdirSync(path.join(dir, "inquiries")).sort(), [`${a.id}.json`, `${b.id}.json`].sort());
  // no IP address or other request data in the record
  assert.deepEqual(Object.keys(JSON.parse(readFileSync(path.join(dir, "inquiries", `${a.id}.json`), "utf8"))).sort(),
    ["consent", "email", "handled", "id", "interests", "lang", "message", "name", "profile", "receivedAt"]);
  await store.deleteInquiry(a.id);
  await store.deleteInquiry(b.id);
});

test("store: mark handled / open again, delete; a deleted inquiry is never brought back", async () => {
  const r = await store.saveInquiry(V);
  const h = await store.setInquiryHandled(r.id, true, "alice@nymbus.ca", new Date("2026-10-03T00:00:00Z"));
  assert.deepEqual(h?.handled, { at: "2026-10-03T00:00:00.000Z", by: "alice@nymbus.ca" });
  assert.equal((await store.setInquiryHandled(r.id, false, "alice@nymbus.ca"))?.handled, null);
  const [d] = await Promise.all([store.deleteInquiry(r.id), store.setInquiryHandled(r.id, true, "bob@nymbus.ca")]);
  assert.equal(d?.id, r.id);
  assert.equal(await store.getInquiry(r.id), null);
  assert.equal(await store.setInquiryHandled(r.id, true, "bob@nymbus.ca"), null);
  assert.equal(await store.deleteInquiry(r.id), null);
});

test("retention: inquiries older than 12 months are purged, damaged files too (by the date in their id)", async () => {
  const now = new Date("2027-10-06T12:00:00Z");
  const old = await store.saveInquiry(V, new Date("2026-10-05T12:00:00Z"));
  const recent = await store.saveInquiry(V, new Date("2026-10-07T12:00:00Z"));
  mkdirSync(path.join(dir, "inquiries"), { recursive: true });
  writeFileSync(path.join(dir, "inquiries", "20250101T000000-0123abcd.json"), "{ damaged");
  writeFileSync(path.join(dir, "inquiries", "notes.txt"), "not an inquiry");
  assert.equal(await store.purgeExpiredInquiries(now), 2);
  assert.equal(await store.getInquiry(old.id), null);
  assert.ok(await store.getInquiry(recent.id));
  assert.equal(store.RETENTION_DAYS, 365);
  assert.equal(await store.purgeExpiredInquiries(now), 0);
  await store.deleteInquiry(recent.id);
});

test("alert: only the name and investor type, a link to the admin; off without a webhook", async () => {
  const r = await store.saveInquiry({ ...V, phone: "514 555 0100", company: "Secret Co" });
  const msg = inquiryAlert(r);
  assert.equal(msg.title, "New website inquiry from Test Person (Family office)");
  assert.equal(msg.adminPath, "/admin/inquiries");
  const body = JSON.stringify([alertPayload(msg, "teams", { PUBLIC_URL: "https://www.nymbus.ca" }), alertPayload(msg, "json", {})]);
  for (const secret of ["test@example.com", "Hello", "514 555 0100", "Secret Co", "General inquiry"]) assert.ok(!body.includes(secret), secret);
  assert.equal(await notifyInquiry(r, { env: {} }), "off");
  let posted: unknown = null;
  const fetchImpl = (async (_u: string, init: { body: string }) => { posted = JSON.parse(init.body); return new Response(null, { status: 200 }); }) as unknown as typeof fetch;
  assert.equal(await notifyInquiry(r, { env: { PIPELINE_ALERT_WEBHOOK: "https://example.webhook.office.com/x" }, fetchImpl, delays: [] }), "sent");
  assert.ok(JSON.stringify(posted).includes("Test Person"));
  assert.ok(!JSON.stringify(posted).includes("test@example.com"));
  await store.deleteInquiry(r.id);
});

test("store: refuses new inquiries past the hard cap", async () => {
  const a = await store.saveInquiry(V, new Date(), 2);
  const b = await store.saveInquiry(V, new Date(), 2);
  await assert.rejects(store.saveInquiry(V, new Date(), 2), store.InquiryStoreFullError);
  assert.equal((await store.listInquiries()).length, 2);
  assert.ok(store.MAX_STORED >= 1000);
  await store.deleteInquiry(a.id);
  await store.deleteInquiry(b.id);
});
