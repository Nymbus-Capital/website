import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "nymbus-revoked-"));
process.env.SITE_DATA_DIR = dir;
after(() => rmSync(dir, { recursive: true, force: true }));

const { isJti, isRevoked, pruneRevoked, revokeSession } = await import("../../../src/lib/auth/revocation.ts");

test("jti format", () => {
  assert.equal(isJti("AbC_-0123456789abcdefXYZ"), true);
  for (const bad of ["", "short", "../../etc/passwd", "a/b".repeat(10), "x".repeat(65), 42])
    assert.equal(isJti(bad), false, String(bad));
});

test("revoke → isRevoked; invalid ids count as revoked (fail closed)", async () => {
  const jti = "revoked-session-000000000001";
  assert.equal(await isRevoked(jti), false);
  await revokeSession(jti, Math.floor(Date.now() / 1000) + 3600);
  assert.equal(await isRevoked(jti), true);
  assert.equal(await isRevoked("../x"), true);
  await revokeSession("../../escape", 0); // ignored, nothing written outside
  assert.deepEqual(readdirSync(path.join(dir, "revoked")), [jti]);
});

test("expired entries are pruned, live ones kept", async () => {
  const now = Math.floor(Date.now() / 1000);
  await revokeSession("old-session-00000000000001", now - 3600);
  await revokeSession("new-session-00000000000001", now + 3600);
  // (revokeSession prunes opportunistically, so the old entry may already be gone)
  await pruneRevoked(now);
  assert.equal(await isRevoked("new-session-00000000000001"), true);
  assert.equal(await isRevoked("old-session-00000000000001"), false);
});

test("revocation write failures propagate (logout must not report success)", async () => {
  const { chmodSync } = await import("node:fs");
  if (process.getuid?.() === 0) return; // root ignores permissions: cannot simulate here
  const rdir = path.join(dir, "revoked");
  chmodSync(rdir, 0o500);
  try {
    await assert.rejects(revokeSession("cannot-write-000000000001", Math.floor(Date.now() / 1000) + 60));
  } finally {
    chmodSync(rdir, 0o700);
  }
});
