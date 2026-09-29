// diagnostics.test.ts — startup admin diagnostics name settings and reasons but never print values
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { authDiagnostics, dataDirStatus } from "../../../src/lib/auth/diagnostics.ts";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "diag-"));
const secretValue = "super-secret-client-value-xyz";
const full = (dir: string) => ({
  SITE_DATA_DIR: dir,
  PUBLIC_URL: "https://p01--website--x.code.run",
  AZURE_TENANT_ID: "3f1c2b7a-1d2e-4f50-8a9b-0c1d2e3f4a5b",
  AZURE_CLIENT_ID: "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d",
  AZURE_CLIENT_SECRET: secretValue,
  ADMIN_ALLOWED_DOMAINS: "nymbus.ca",
});

test("configured: says so, marks the generated AUTH_SECRET, prints no value", () => {
  const dir = tmp();
  const lines = authDiagnostics(full(dir)).join("\n");
  assert.match(lines, /sign-in configured/);
  assert.match(lines, /AZURE_CLIENT_SECRET=set/);
  assert.match(lines, /AUTH_SECRET=missing/);
  assert.match(lines, /\(AUTH_SECRET generated on the data volume\)/);
  assert.match(lines, /: writable/);
  assert.ok(!lines.includes(secretValue));
  assert.ok(!lines.includes(fs.readFileSync(path.join(dir, "secrets", "auth-secret"), "utf8")));
});

test("missing client secret: names the missing setting", () => {
  const env = { ...full(tmp()), AZURE_CLIENT_SECRET: "  " };
  const lines = authDiagnostics(env).join("\n");
  assert.match(lines, /AZURE_CLIENT_SECRET=missing/);
  assert.match(lines, /NOT configured: AZURE_CLIENT_SECRET is missing/);
});

test("unwritable data directory reports the error code", { skip: process.getuid?.() === 0 }, () => {
  const dir = tmp();
  fs.chmodSync(dir, 0o500);
  try {
    assert.equal(dataDirStatus({ SITE_DATA_DIR: dir }), "EACCES");
  } finally {
    fs.chmodSync(dir, 0o700);
  }
});

test("an AUTH_SECRET from the environment, or a weak one, is never printed", () => {
  const strong = "env-provided-auth-secret-" + "abcdefghij".repeat(4);
  const ok = authDiagnostics({ ...full(tmp()), AUTH_SECRET: strong }).join("\n");
  assert.match(ok, /AUTH_SECRET=set/);
  assert.ok(!ok.includes(strong));
  const weak = "short-weak-secret";
  const bad = authDiagnostics({ ...full(tmp()), AUTH_SECRET: weak }).join("\n");
  assert.match(bad, /NOT configured: AUTH_SECRET is missing or shorter/);
  assert.ok(!bad.includes(weak));
});

import { pipelineDiagnostics, dataplatformProbe } from "../../../src/lib/auth/diagnostics.ts";

test("pipeline settings: names only, flags a wrong-case key", () => {
  const line = pipelineDiagnostics({ dataplatform_url: "http://dp:8000", GITHUB_TOKEN: "ghp_secretvalue" });
  assert.match(line, /DATAPLATFORM_URL=missing/);
  assert.match(line, /GITHUB_TOKEN=set/);
  assert.match(line, /wrong letter case for: DATAPLATFORM_URL/);
  assert.ok(!line.includes("ghp_") && !line.includes("dp:8000"));
});

test("dataplatform probe reports status or error kind, never the URL", async () => {
  const ok = await dataplatformProbe({ DATAPLATFORM_URL: "http://dp:8000/" }, (async (u: string) => {
    assert.equal(u, "http://dp:8000/api/apex/funds");
    return new Response("[]", { status: 200 });
  }) as unknown as typeof fetch);
  assert.equal(ok, "[pipeline] dataplatform: HTTP 200 (reachable)");
  const down = await dataplatformProbe({ DATAPLATFORM_URL: "http://dp:8000" }, (async () => {
    throw Object.assign(new TypeError("fetch failed"), { cause: { code: "ENOTFOUND" } });
  }) as unknown as typeof fetch);
  assert.equal(down, "[pipeline] dataplatform: unreachable (ENOTFOUND)");
  assert.match(await dataplatformProbe({}), /not probed/);
});
