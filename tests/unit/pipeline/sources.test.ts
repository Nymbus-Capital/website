import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fetchRetry } from "../../../src/lib/pipeline/sources/http.ts";
import { dpClient, fetchAum, fetchMonthlyNetReturns, reduceAum } from "../../../src/lib/pipeline/sources/dataplatform.ts";
import { candidateFiles, fetchFactsheets } from "../../../src/lib/pipeline/sources/factsheets.ts";
import { clearGraphTokenCache } from "../../../src/lib/pipeline/sources/graph.ts";
import { json, loadFixture, mockFetch } from "../../fixtures/pipeline/mock-fetch.ts";

test("fetchRetry: retries 5xx and network errors twice, then gives up; 4xx not retried", async () => {
  let n = 0;
  const flaky = (async () => {
    n++;
    if (n === 1) throw new TypeError("fetch failed");
    if (n === 2) return new Response("x", { status: 502 });
    return new Response("ok", { status: 200 });
  }) as typeof fetch;
  const r = await fetchRetry(flaky, "http://x.test/a", {}, { backoffMs: 0 });
  assert.equal(r.status, 200);
  assert.equal(n, 3);

  let m = 0;
  const down = (async () => { m++; return new Response("x", { status: 503 }); }) as typeof fetch;
  await assert.rejects(fetchRetry(down, "http://u:secret@x.test/b?q=1", {}, { backoffMs: 0 }), (e: Error) => !e.message.includes("secret") && /HTTP 503/.test(e.message));
  assert.equal(m, 3, "1 attempt + 2 retries");

  let k = 0;
  const notFound = (async () => { k++; return new Response("x", { status: 404 }); }) as typeof fetch;
  assert.equal((await fetchRetry(notFound, "http://x.test/c", {}, { backoffMs: 0 })).status, 404);
  assert.equal(k, 1);
});

test("fetchRetry: timeout through AbortSignal", async () => {
  // a real pending socket keeps the event loop alive; emulate it with a ref'd timer
  const hang = ((_u: string, init?: RequestInit) => new Promise<Response>((_res, rej) => {
    const keep = setTimeout(() => undefined, 10_000);
    init?.signal?.addEventListener("abort", () => { clearTimeout(keep); rej(init.signal!.reason); });
  })) as typeof fetch;
  await assert.rejects(fetchRetry(hang, "http://x.test/slow", {}, { timeoutMs: 20, retries: 1, backoffMs: 0 }), /timeout/);
});

test("dataplatform: no DATAPLATFORM_URL -> no client; 422 is a clean failure", async () => {
  assert.equal(dpClient(fetch, {}), null);
  const m = mockFetch((u) => (u.pathname.endsWith("monthly-net-returns") ? json({ detail: "No closed months in range" }, 422) : undefined));
  const c = dpClient(m.fetch, { DATAPLATFORM_URL: "http://dataplatform.test/", PIPELINE_RETRY_BASE_MS: "0" })!;
  const r = await fetchMonthlyNetReturns(c, "SEST", "2026-08-31");
  assert.equal(r.ok, false);
  assert.match(r.error!, /422.*No closed months/);
  assert.equal(m.calls.length, 1, "422 not retried");
  assert.ok(m.calls[0].url.startsWith("http://dataplatform.test/api/performance/monthly-net-returns?short_name=SEST&start_date=2019-01-01&end_date=2026-08-31"));
});

test("AUM is reduced to fund totals: no investor-level field survives", async () => {
  const m = mockFetch();
  const c = dpClient(m.fetch, { DATAPLATFORM_URL: "http://dataplatform.test", PIPELINE_RETRY_BASE_MS: "0" })!;
  const r = await fetchAum(c);
  assert.ok(r.ok);
  assert.deepEqual(Object.keys(r.data!).sort(), ["snapshot_date", "totals", "warningCount"]);
  assert.deepEqual(r.data!.totals, { SEST: 212_345_678.9 + 1_234_567.1, SEB: 148_765_432.1, Multistrat: 61_234_567.5, OTHER: 5_000_000 });
  const s = JSON.stringify(r);
  for (const bad of ["investor_no", "shareholder_id", "agent_name", "dealer_name", "SYN-INV", "Synthetic Advisor"]) assert.ok(!s.includes(bad), bad);
  assert.ok(m.calls[0].url.includes("group_by=short_name"));
  // incomplete measure poisons the total
  assert.ok(Number.isNaN(reduceAum({ rows: [{ short_name: "SEB", holding_value_cad: 1 }, { short_name: "SEB", holding_value_cad: null }] })!.totals.SEB));
  assert.equal(reduceAum({ nope: 1 }), null);
  void loadFixture;
});

test("factsheets: local folder, target month then up to 2 previous months", async () => {
  assert.deepEqual(candidateFiles("2026-08-31"), [
    "bonds_data_2026-08.json", "factsheet_data_2026-08.json", "bonds_data_2026-07.json", "factsheet_data_2026-07.json", "bonds_data_2026-06.json", "factsheet_data_2026-06.json",
  ]);
  const dir = await mkdtemp(path.join(os.tmpdir(), "fs-"));
  await writeFile(path.join(dir, "bonds_data_2026-06.json"), '{"SEST": {"x": NaN}}');
  const r = await fetchFactsheets("2026-08-31", fetch, { FACTSHEET_DATA_DIR: dir });
  assert.ok(r.ok);
  assert.deepEqual(Object.keys(r.data!.files), ["bonds_data_2026-06.json"]);
  assert.deepEqual(r.data!.files["bonds_data_2026-06.json"], { SEST: { x: null } });
  const none = await fetchFactsheets("2026-09-30", fetch, { FACTSHEET_DATA_DIR: dir });
  assert.equal(none.ok, false);
  const unconf = await fetchFactsheets("2026-08-31", fetch, {});
  assert.match(unconf.error!, /neither FACTSHEET_DATA_DIR nor GRAPH/);
});

test("factsheets through Graph: client credentials, encoded path, 429 Retry-After, redirect without bearer, 404 = missing", async () => {
  clearGraphTokenCache();
  const seen: { url: string; auth: string | null; method: string }[] = [];
  let throttled = false;
  const f = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const auth = new Headers(init?.headers).get("authorization");
    seen.push({ url, auth, method: init?.method ?? "GET" });
    if (url.startsWith("https://login.microsoftonline.com/")) {
      const body = String(init?.body);
      assert.match(body, /grant_type=client_credentials/);
      assert.match(body, /scope=https%3A%2F%2Fgraph.microsoft.com%2F.default/);
      return json({ access_token: "AT", expires_in: 3600 });
    }
    if (url.includes("bonds_data_2026-08.json:/content")) {
      if (!throttled) {
        throttled = true;
        return new Response("", { status: 429, headers: { "retry-after": "0" } });
      }
      return new Response(null, { status: 302, headers: { location: "https://download.test/blob?sig=1" } });
    }
    if (url.startsWith("https://download.test/")) return new Response('{"SEST": {"a": 1}}', { status: 200 });
    return new Response("", { status: 404 });
  }) as typeof fetch;
  const env = { GRAPH_TENANT_ID: "t", GRAPH_CLIENT_ID: "c", GRAPH_CLIENT_SECRET: "s3cr3t", GRAPH_DRIVE_ID: "d!1", PIPELINE_RETRY_BASE_MS: "0" };
  const r = await fetchFactsheets("2026-08-31", f, env);
  assert.ok(r.ok, r.error);
  assert.equal(r.data!.where, "SharePoint");
  assert.deepEqual(Object.keys(r.data!.files), ["bonds_data_2026-08.json"]);
  const content = seen.filter((s) => s.url.includes(":/content"));
  assert.equal(content[0].url, "https://graph.microsoft.com/v1.0/drives/d!1/root:/Business%20Development/Fiches%20d'infos/_data/bonds_data_2026-08.json:/content");
  assert.ok(content.every((s) => s.auth === "Bearer AT"));
  assert.equal(seen.filter((s) => s.url.startsWith("https://login")).length, 1, "token cached");
  assert.equal(seen.find((s) => s.url.startsWith("https://download.test"))!.auth, null, "no bearer on the pre-authenticated URL");
  assert.ok(!JSON.stringify(r).includes("s3cr3t"));

  clearGraphTokenCache();
  const denied = (async (input: string | URL | Request) => (String(input).startsWith("https://login") ? new Response("{}", { status: 401 }) : new Response("", { status: 404 }))) as typeof fetch;
  const d = await fetchFactsheets("2026-08-31", denied, env);
  assert.equal(d.ok, false);
  assert.match(d.error!, /Graph token: HTTP 401/);
  assert.ok(!d.error!.includes("s3cr3t"));
});
