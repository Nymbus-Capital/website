// volume-secret.test.ts — AUTH_SECRET generated once on the data volume when the environment lacks it
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { volumeAuthSecret, withAuthSecret } from "../../../src/lib/auth/volume-secret.ts";
import { loadAuthConfig } from "../../../src/lib/auth/config.ts";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "auth-secret-"));

test("generates a strong secret once, stores it 0600, and reuses it", () => {
  const dir = tmp();
  const a = volumeAuthSecret({ SITE_DATA_DIR: dir });
  const file = path.join(dir, "secrets", "auth-secret");
  assert.ok(a.length >= 48);
  assert.equal(fs.readFileSync(file, "utf8"), a);
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  assert.equal(volumeAuthSecret({ SITE_DATA_DIR: dir }), a);
});

test("an existing file (e.g. after a restart) is read, not replaced", () => {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, "secrets"));
  const existing = "k".repeat(10) + "0123456789abcdefghijklmnopqrstuvwxyz";
  fs.writeFileSync(path.join(dir, "secrets", "auth-secret"), existing + "\n");
  assert.equal(volumeAuthSecret({ SITE_DATA_DIR: dir }), existing);
});

test("an AUTH_SECRET from the environment always wins", () => {
  const env = { SITE_DATA_DIR: tmp(), AUTH_SECRET: "from-env-" + "x".repeat(40) };
  assert.equal(withAuthSecret(env), env);
  assert.equal(fs.existsSync(path.join(env.SITE_DATA_DIR, "secrets")), false);
});

test("the generated secret satisfies the auth config checks", () => {
  const dir = tmp();
  const env = withAuthSecret({
    SITE_DATA_DIR: dir,
    PUBLIC_URL: "https://p01--website--x.code.run",
    AZURE_TENANT_ID: "3f1c2b7a-1d2e-4f50-8a9b-0c1d2e3f4a5b",
    AZURE_CLIENT_ID: "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d",
    AZURE_CLIENT_SECRET: "client-secret-value",
  });
  const r = loadAuthConfig(env);
  assert.equal(r.ok, true, r.ok ? "" : r.error);
});
