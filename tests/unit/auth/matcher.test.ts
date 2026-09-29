import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The proxy matcher is a static string in src/proxy.ts (Next requires a constant); test its regex directly.
const src = readFileSync(new URL("../../../src/proxy.ts", import.meta.url), "utf8");
const m = /matcher:\s*\[\s*"([^"]+)"/.exec(src);
assert.ok(m, "matcher not found");
const pattern = m[1].replace(/\\\\/g, "\\");
const re = new RegExp(`^${pattern}$`);

test("proxy matcher covers pages and admin API, skips assets, downloads and uploads", () => {
  for (const p of ["/", "/strategies/multi-strategy", "/admin", "/admin/funds/x", "/api/admin/status", "/api/admin/uploadx", "/api/admin/upload", "/api/auth/login"]) {
    assert.ok(re.test(p), `should match ${p}`);
  }
  for (const p of ["/_next/static/chunks/a.js", "/fonts/poppins-400.woff", "/favicon.svg", "/api/documents/20260101T000000-aaaaaaaa", "/api/admin/upload/documents", "/api/health"]) {
    assert.ok(!re.test(p), `should not match ${p}`);
  }
});
