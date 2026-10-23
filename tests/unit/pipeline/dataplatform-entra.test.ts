import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { dpClient, fetchApexFunds } from "../../../src/lib/pipeline/sources/dataplatform.ts";

const settings = {
  DATAPLATFORM_URL: "https://example.invalid",
  DATAPLATFORM_TENANT_ID: "11111111-1111-4111-8111-111111111111",
  DATAPLATFORM_CLIENT_ID: "22222222-2222-4222-8222-222222222222",
  DATAPLATFORM_CLIENT_SECRET: "test-only-client-secret",
  DATAPLATFORM_API_AUDIENCE: "33333333-3333-4333-8333-333333333333",
  PIPELINE_RETRY_BASE_MS: "0",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

function transport(statuses = [200], tokenStatus = 200) {
  const calls: { url: string; init?: RequestInit }[] = [];
  let tokens = 0;
  const fetchImpl = (async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.startsWith("https://login.microsoftonline.com/")) {
      tokens++;
      return tokenStatus === 200
        ? json({ access_token: `test-token-${tokens}`, expires_in: 3600 })
        : json({ error_description: "sensitive-provider-response" }, tokenStatus);
    }
    assert.equal(init?.redirect, "manual");
    const status = statuses.shift();
    assert.notEqual(status, undefined, "unexpected API attempt");
    return json([], status);
  }) as typeof fetch;
  return {
    fetchImpl,
    calls,
    get tokens() {
      return tokens;
    },
    api: () => calls.filter((call) => !call.url.startsWith("https://login.microsoftonline.com/")),
  };
}

test("Entra uses the app identity and caches a single token across simultaneous reads", async () => {
  const m = transport([200, 200]);
  const c = dpClient(m.fetchImpl, {
    ...settings,
    DATAPLATFORM_TOKEN: "old-token",
    DATAPLATFORM_USERNAME: "old-user",
    DATAPLATFORM_PASSWORD: "old-password",
  })!;
  const results = await Promise.all([fetchApexFunds(c), fetchApexFunds(c)]);
  assert.ok(results.every((result) => result.ok));
  assert.equal(m.tokens, 1);
  const body = new URLSearchParams(String(m.calls[0].init?.body));
  assert.equal(body.get("client_id"), settings.DATAPLATFORM_CLIENT_ID);
  assert.equal(body.get("client_secret"), settings.DATAPLATFORM_CLIENT_SECRET);
  assert.equal(body.get("scope"), `api://${settings.DATAPLATFORM_API_AUDIENCE}/.default`);
  for (const call of m.api()) assert.equal(new Headers(call.init?.headers).get("authorization"), "Bearer test-token-1");
});

test("a delayed old-token 401 reuses the token another read already renewed", async () => {
  let tokens = 0;
  let oldReads = 0;
  let releaseLate401!: () => void;
  const late401 = new Promise<void>((resolve) => {
    releaseLate401 = resolve;
  });
  const headers: string[] = [];
  const fetchImpl = (async (input, init) => {
    if (String(input).startsWith("https://login.microsoftonline.com/")) {
      tokens++;
      return json({ access_token: `test-token-${tokens}`, expires_in: 3600 });
    }
    const authorization = new Headers(init?.headers).get("authorization")!;
    headers.push(authorization);
    if (authorization === "Bearer test-token-1") {
      oldReads++;
      if (oldReads === 2) await late401;
      return json([], 401);
    }
    assert.equal(authorization, "Bearer test-token-2");
    releaseLate401();
    return json([]);
  }) as typeof fetch;
  const c = dpClient(fetchImpl, settings)!;
  const results = await Promise.all([fetchApexFunds(c), fetchApexFunds(c)]);
  assert.ok(results.every((result) => result.ok));
  assert.equal(oldReads, 2);
  assert.equal(tokens, 2);
  assert.deepEqual(headers, [
    "Bearer test-token-1",
    "Bearer test-token-1",
    "Bearer test-token-2",
    "Bearer test-token-2",
  ]);
});

test("Entra renews once after 401 and never falls back after a second 401", async () => {
  for (const statuses of [
    [401, 200],
    [401, 401],
  ]) {
    const succeeds = statuses[1] === 200;
    const m = transport(statuses);
    const result = await fetchApexFunds(dpClient(m.fetchImpl, settings)!);
    assert.equal(result.ok, succeeds);
    assert.equal(m.tokens, 2);
    assert.deepEqual(
      m.api().map((call) => new Headers(call.init?.headers).get("authorization")),
      ["Bearer test-token-1", "Bearer test-token-2"],
    );
  }
});

test("403 and redirects stop without renewing or following another address", async () => {
  for (const status of [403, 302, 307]) {
    const m = transport([status]);
    assert.equal((await fetchApexFunds(dpClient(m.fetchImpl, settings)!)).ok, false);
    assert.equal(m.tokens, 1);
    assert.equal(m.api().length, 1);
  }
});

test("transient retries retain their original budget across token renewal", async () => {
  const m = transport([503, 401, 503, 200]);
  assert.equal((await fetchApexFunds(dpClient(m.fetchImpl, settings)!)).ok, true);
  assert.equal(m.api().length, 4);
  assert.equal(m.tokens, 2);
  const exhausted = transport([503, 503, 401, 503]);
  assert.equal((await fetchApexFunds(dpClient(exhausted.fetchImpl, settings)!)).ok, false);
  assert.equal(exhausted.api().length, 4);
});

test("an expiring token is renewed before another API read", async () => {
  let now = 0;
  const clock = mock.method(Date, "now", () => now);
  try {
    const m = transport([200, 200]);
    const c = dpClient(m.fetchImpl, settings)!;
    assert.equal((await fetchApexFunds(c)).ok, true);
    now = 3_600_000;
    assert.equal((await fetchApexFunds(c)).ok, true);
    assert.equal(m.tokens, 2);
  } finally {
    clock.mock.restore();
  }
});

test("partial identities and unsafe destinations fail before any request", () => {
  const m = transport([]);
  for (const key of [
    "DATAPLATFORM_TENANT_ID",
    "DATAPLATFORM_CLIENT_ID",
    "DATAPLATFORM_CLIENT_SECRET",
    "DATAPLATFORM_API_AUDIENCE",
  ]) {
    assert.throws(() => dpClient(m.fetchImpl, { ...settings, [key]: "" }));
  }
  for (const base of [
    "",
    "http://example.invalid",
    "https://user:password@example.invalid",
    "https://example.invalid/path",
    "https://example.invalid?x=1",
    "https://example.invalid#x",
  ]) {
    assert.throws(() => dpClient(m.fetchImpl, { ...settings, DATAPLATFORM_URL: base }));
  }
  assert.throws(() => dpClient(m.fetchImpl, { ...settings, DATAPLATFORM_TENANT_ID: "../common" }));
  assert.equal(m.calls.length, 0);
});

test("token errors are sanitized and never issue an anonymous API request", async () => {
  const m = transport([], 403);
  const result = await fetchApexFunds(dpClient(m.fetchImpl, settings)!);
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /Microsoft authentication failed/);
  assert.doesNotMatch(result.error ?? "", /sensitive-provider-response|test-only-client-secret/);
  assert.equal(m.api().length, 0);
});

test("malformed tokens stop before any API read", async () => {
  for (const payload of [
    { access_token: "bad\r\nheader", expires_in: 3600 },
    { access_token: 7, expires_in: 3600 },
    { access_token: "test-token", expires_in: "invalid" },
  ]) {
    let calls = 0;
    const fetchImpl = (async (input) => {
      calls++;
      assert.match(String(input), /^https:\/\/login.microsoftonline.com\//);
      return json(payload);
    }) as typeof fetch;
    assert.equal((await fetchApexFunds(dpClient(fetchImpl, settings)!)).ok, false);
    assert.equal(calls, 1);
  }
});

test("the exact private backend accepts a token and legacy mode stays available before activation", async () => {
  const m = transport([200]);
  assert.equal(
    (
      await fetchApexFunds(
        dpClient(m.fetchImpl, { ...settings, DATAPLATFORM_URL: "http://dataplatform-staging:8000" })!,
      )
    ).ok,
    true,
  );
  assert.equal(m.tokens, 1);
  const legacy = transport([200]);
  assert.equal(
    (
      await fetchApexFunds(
        dpClient(legacy.fetchImpl, {
          DATAPLATFORM_URL: settings.DATAPLATFORM_URL,
          DATAPLATFORM_TOKEN: "old-test-token",
        })!,
      )
    ).ok,
    true,
  );
  assert.equal(legacy.tokens, 0);
  assert.equal(new Headers(legacy.api()[0].init?.headers).get("authorization"), "Bearer old-test-token");
});
