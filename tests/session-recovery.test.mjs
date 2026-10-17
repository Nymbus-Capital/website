import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { resolve } from "node:path";
const source = readFileSync(resolve(import.meta.dirname, process.env.SESSION_SOURCE || "../public/session.js"), "utf8");
const exported = { exports: {} };
runInNewContext(source, { module: exported, Response, AbortSignal });
const { createTransport } = exported.exports;

test("successful requests preserve response and options", async () => {
  const options = { method: "POST", body: "draft" };
  const response = new Response("saved");
  const transport = createTransport(
    async (url, actual) => {
      assert.equal(url, "/api/save");
      assert.equal(actual, options);
      return response;
    },
    assert.fail,
    assert.fail,
  );
  assert.equal(await transport.request("/api/save", options), response);
});
test("expired writes are not replayed and renewal probes are single-flight", async () => {
  let writes = 0,
    probes = 0,
    expired = 0,
    restored = 0,
    finish;
  const pending = new Promise((resolve) => {
    finish = resolve;
  });
  const transport = createTransport(
    async (url) => {
      if (url === "/oauth2/auth") {
        probes++;
        await pending;
        return new Response(null, { status: 202 });
      }
      writes++;
      return new Response(null, { status: 401 });
    },
    () => expired++,
    () => restored++,
  );
  assert.equal((await transport.request("/api/save", { method: "POST" })).status, 401);
  assert.equal(writes, 1);
  const first = transport.check(),
    second = transport.check();
  finish();
  await Promise.all([first, second]);
  assert.equal(probes, 1);
  assert.equal(expired, 1);
  assert.equal(restored, 1);
  assert.equal(writes, 1);
});
test("missing sessions block new writes; network failures do not imply revocation", async () => {
  let writes = 0,
    expired = 0;
  const transport = createTransport(
    async (url) => {
      if (url === "/oauth2/auth") throw new Error("network");
      writes++;
      return new Response(null, { status: 401 });
    },
    () => expired++,
    assert.fail,
  );
  await transport.request("/api/save");
  assert.equal((await transport.request("/api/save", { method: "POST" })).status, 401);
  assert.equal(writes, 1);
  assert.equal(expired, 1);
  const healthy = createTransport(
    async () => {
      throw new Error("network");
    },
    assert.fail,
    assert.fail,
  );
  assert.equal(await healthy.check(), false);
});
test("a permission denial does not trigger a Microsoft sign-in loop", async () => {
  const transport = createTransport(async () => new Response(null, { status: 403 }), assert.fail, assert.fail);
  assert.equal((await transport.request("/api/admin")).status, 403);
  assert.equal(await transport.check(), false);
});
test("Azure anonymous principals are not mistaken for a renewed session", async () => {
  let expired = 0;
  const transport = createTransport(
    async () => Response.json({ clientPrincipal: null }),
    () => expired++,
    assert.fail,
    "/.auth/me",
    200,
    true,
  );
  assert.equal(await transport.check(), false);
  assert.equal(expired, 1);
  const signedIn = createTransport(
    async () => Response.json({ clientPrincipal: { userDetails: "fixture@example.test" } }),
    assert.fail,
    assert.fail,
    "/.auth/me",
    200,
    true,
  );
  assert.equal(await signedIn.check(), true);
});
test("Azure redirect responses become an explicit sign-in result without replaying writes", async () => {
  let expired = 0,
    calls = 0;
  const transport = createTransport(
    async () => {
      calls++;
      return { type: "opaqueredirect", status: 0 };
    },
    () => expired++,
    assert.fail,
  );
  assert.equal((await transport.request("/api/save", { method: "POST" })).status, 401);
  assert.equal(expired, 1);
  assert.equal(calls, 1);
});
