// http-safeurl.test.ts — URLs in pipeline errors/logs never carry credentials
import { test } from "node:test";
import assert from "node:assert/strict";
import { safeUrl } from "../../../src/lib/pipeline/sources/http.ts";

test("drops host and userinfo, redacts credential-like query values, keeps the rest", () => {
  const s = safeUrl("https://user:pw@tenant.sharepoint.com/sites/x/_layouts/15/download.aspx?UniqueId=abc&tempauth=eyJhbGciOi.secret.sig");
  assert.equal(s, "/sites/x/_layouts/15/download.aspx?UniqueId=abc&tempauth=REDACTED");
  assert.ok(!s.includes("eyJ") && !s.includes("pw") && !s.includes("sharepoint.com"));
  assert.equal(safeUrl("http://dp:8000/api/nav?fund=SEST&start=2026-01-01"), "/api/nav?fund=SEST&start=2026-01-01");
  assert.equal(safeUrl("https://x.blob/c?sv=1&sig=abc&access_token=t"), "/c?sv=1&sig=REDACTED&access_token=REDACTED");
  assert.equal(safeUrl("not a url"), "<invalid url>");
});
