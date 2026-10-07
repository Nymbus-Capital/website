import assert from "node:assert/strict";
import test from "node:test";
import { generateKeyPairSync } from "node:crypto";
import { fetchAnalytics } from "../../../src/lib/pipeline/sources/analytics.ts";

const key = generateKeyPairSync("rsa", { modulusLength: 2048 })
  .privateKey.export({ type: "pkcs8", format: "pem" })
  .toString();

test("analytics source uses the issued App token and retains the requested data branch", async () => {
  const calls: string[] = [];
  const mock: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push(url);
    if (url.endsWith("/access_tokens"))
      return new Response(
        JSON.stringify({
          token: "fresh-app-token",
          expires_at: new Date(Date.now() + 3_600_000).toISOString(),
          permissions: { contents: "read" },
        }),
        { status: 201 },
      );
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer fresh-app-token");
    assert.equal(new URL(url).searchParams.get("ref"), "main");
    return new Response(JSON.stringify({ dates: ["2026-09-30"], returns: {} }), { status: 200 });
  };
  const result = await fetchAnalytics(mock, {
    GITHUB_AUTH_MODE: "app",
    GITHUB_APP_ID: "123",
    GITHUB_APP_INSTALLATION_ID: "456",
    GITHUB_APP_PRIVATE_KEY: key,
    GITHUB_TOKEN: "old-pat",
  });
  assert.equal(result.ok, true);
  assert.equal(calls.length, 2);
});

test("issuer failure prevents content retrieval and cannot use the existing PAT", async () => {
  let calls = 0;
  const mock: typeof fetch = async () => {
    calls++;
    return new Response("denied", { status: 403 });
  };
  const result = await fetchAnalytics(mock, {
    GITHUB_AUTH_MODE: "app",
    GITHUB_APP_ID: "123",
    GITHUB_APP_INSTALLATION_ID: "456",
    GITHUB_APP_PRIVATE_KEY: key,
    GITHUB_TOKEN: "old-pat",
  });
  assert.equal(result.ok, false);
  assert.equal(calls, 1);
  assert.ok(!JSON.stringify(result).includes("old-pat"));
});
