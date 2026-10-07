import assert from "node:assert/strict";
import test from "node:test";
import { generateKeyPairSync, verify } from "node:crypto";
import { githubToken } from "../../../src/lib/pipeline/sources/github-auth.ts";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const env = {
  GITHUB_AUTH_MODE: "app",
  GITHUB_APP_ID: "123",
  GITHUB_APP_INSTALLATION_ID: "456",
  GITHUB_APP_PRIVATE_KEY: privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
  GITHUB_TOKEN: "rollback-pat",
};
const repo = "Nymbus-Capital/analytics";
const valid = (): object => ({
  token: "installation-token-of-variable-length",
  expires_at: new Date(Date.now() + 3_600_000).toISOString(),
  permissions: { contents: "read" },
  repositories: [{ full_name: repo }],
});
const response =
  (data: unknown, status = 201): typeof fetch =>
  async () =>
    new Response(JSON.stringify(data), { status });

test("signed App JWT requests only analytics contents read", async () => {
  const mock: typeof fetch = async (url, init) => {
    assert.equal(url, "https://api.github.com/app/installations/456/access_tokens");
    assert.equal(init?.method, "POST");
    assert.equal(init?.redirect, "error");
    assert.deepEqual(JSON.parse(init?.body as string), {
      repositories: ["analytics"],
      permissions: { contents: "read" },
    });
    const jwt = new Headers(init?.headers).get("Authorization")!.slice(7);
    const parts = jwt.split(".");
    assert.equal(
      verify("RSA-SHA256", Buffer.from(parts.slice(0, 2).join(".")), publicKey, Buffer.from(parts[2], "base64url")),
      true,
    );
    const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    assert.equal(claims.iss, "123");
    assert.equal(claims.exp - claims.iat, 600);
    assert.ok(claims.iat <= Date.now() / 1000 - 59);
    return new Response(JSON.stringify(valid()), { status: 201 });
  };
  assert.equal(await githubToken(env, repo, mock), "installation-token-of-variable-length");
});

test("every refresh mints a fresh token; PAT rollback performs no network call", async () => {
  let calls = 0;
  const mock: typeof fetch = async () => {
    calls++;
    return new Response(JSON.stringify({ ...valid(), token: `token-${calls}` }), { status: 201 });
  };
  assert.equal(await githubToken(env, repo, mock), "token-1");
  assert.equal(await githubToken(env, repo, mock), "token-2");
  assert.equal(await githubToken({ ...env, GITHUB_AUTH_MODE: "pat" }, repo, mock), "rollback-pat");
  assert.equal(calls, 2);
  assert.equal(await githubToken({}, repo, mock), null);
});

test("invalid App config fails before issuing a request and never falls back to PAT", async () => {
  const noNetwork: typeof fetch = async () => {
    assert.fail("Must not send incomplete credentials");
  };
  for (const patch of [
    { GITHUB_AUTH_MODE: "other" },
    { GITHUB_APP_ID: "0" },
    { GITHUB_APP_INSTALLATION_ID: "1/escape" },
    { GITHUB_APP_PRIVATE_KEY: "" },
    { GITHUB_APP_PRIVATE_KEY: "sensitive-invalid-key" },
  ]) {
    await assert.rejects(
      githubToken({ ...env, ...patch }, repo, noNetwork),
      (e) => !String(e).includes("sensitive-invalid-key"),
    );
  }
  await assert.rejects(githubToken(env, "../analytics", noNetwork), /repository/);
});

test("expiry, malformed payload, scope, and issuer errors fail closed without revealing response secrets", async () => {
  for (const body of [
    null,
    {},
    { ...valid(), token: "" },
    { ...valid(), expires_at: "bad" },
    { ...valid(), expires_at: new Date(Date.now() + 299_000).toISOString() },
    { ...valid(), permissions: { contents: "write" } },
    { ...valid(), repositories: [{ full_name: "other/repo" }] },
  ]) {
    await assert.rejects(
      githubToken(env, repo, response(body)),
      (e) => !String(e).includes("installation-token-of-variable-length"),
    );
  }
  await assert.rejects(githubToken(env, repo, response({ message: "response-secret" }, 403)), /HTTP 403/);
  await assert.rejects(
    githubToken(env, repo, async () => {
      throw new Error("network-secret");
    }),
    (e) => !String(e).includes("network-secret"),
  );
  await assert.rejects(
    githubToken(env, repo, async () => new Response("broken-json", { status: 201 })),
    /invalid JSON/,
  );
});
