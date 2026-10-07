import { expect, test } from "@playwright/test";
import {
  adminHeaders,
  BASE,
  mintSession,
  OTHER_TENANT,
  SESSION_COOKIE,
  shot,
  signIn,
  TENANT,
  tinyPdf,
} from "./helpers";
import { E2E_ENV } from "../playwright.config";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/** the AUM field of FundData, raw or escaped inside the RSC flight data */
const CAD_KEY = /\\?"cad\\?"\s*:/;

/**
 * Admin gate, API guards and the main admin flows, against the production build with test-only Entra settings.
 * Microsoft is never contacted: the sign-in redirect is asserted, not followed; sessions are minted with AUTH_SECRET.
 */

test.describe("sign-in gate", () => {
  test("unauthenticated /admin redirects to /api/auth/login, which redirects to Entra with PKCE", async ({
    request,
  }) => {
    const r1 = await request.get("/admin/funds/multi-strategy?x=1", { maxRedirects: 0 });
    expect(r1.status()).toBe(302);
    const loc1 = new URL(r1.headers()["location"], BASE);
    expect(loc1.pathname).toBe("/api/auth/login");
    expect(loc1.searchParams.get("returnTo")).toBe("/admin/funds/multi-strategy?x=1");

    const r2 = await request.get(loc1.pathname + loc1.search, { maxRedirects: 0 });
    expect(r2.status()).toBe(302);
    const loc2 = new URL(r2.headers()["location"]);
    expect(loc2.origin).toBe("https://login.microsoftonline.com");
    expect(loc2.pathname).toBe(`/${TENANT}/oauth2/v2.0/authorize`);
    const q = loc2.searchParams;
    expect(q.get("client_id")).toBe(E2E_ENV.AZURE_CLIENT_ID);
    expect(q.get("response_type")).toBe("code");
    expect(q.get("redirect_uri")).toBe(`${BASE}/api/auth/callback`);
    expect(q.get("scope")).toBe("openid profile email");
    expect(q.get("code_challenge_method")).toBe("S256");
    expect(q.get("code_challenge")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(q.get("state")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(q.get("nonce")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(q.get("code_verifier")).toBeNull();
    // transient flow cookie: HttpOnly, SameSite=Lax, short-lived, and does not leak the verifier in clear
    const setCookie = r2.headers()["set-cookie"] ?? "";
    expect(setCookie).toMatch(/nymbus_oidc=/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/Max-Age=600/i);
  });

  test("login ignores open-redirect returnTo values", async ({ request, page }) => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)"]) {
      const r = await request.get(`/api/auth/login?returnTo=${encodeURIComponent(bad)}`, { maxRedirects: 0 });
      expect(r.status()).toBe(302);
      expect(new URL(r.headers()["location"]).hostname).toBe("login.microsoftonline.com");
    }
    // the browser lands on Microsoft (not followed here)
    await page.route("https://login.microsoftonline.com/**", (route) => route.fulfill({ status: 200, body: "entra" }));
    await page.goto("/admin");
    await expect(page).toHaveURL(/login\.microsoftonline\.com/);
  });

  test("callback without the flow cookie / with a forged state is refused", async ({ request }) => {
    const r = await request.get("/api/auth/callback?code=abc&state=xyz", { maxRedirects: 0 });
    expect(r.status()).toBe(400);
    expect(r.headers()["set-cookie"] ?? "").not.toMatch(/nymbus_admin=[^;]/);
  });

  test("pages get a nonce-based CSP without script 'unsafe-inline'", async ({ request, page }) => {
    const r1 = await request.get("/");
    const r2 = await request.get("/");
    const csp1 = r1.headers()["content-security-policy"] ?? "";
    const csp2 = r2.headers()["content-security-policy"] ?? "";
    const script = csp1.split(/;\s*/).find((d) => d.startsWith("script-src")) ?? "";
    expect(script).toMatch(/'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(script).not.toContain("unsafe-inline");
    expect(csp1).not.toBe(csp2); // fresh nonce per request
    const nonce = /'nonce-([^']+)'/.exec(script)![1];
    expect(await r1.text()).toContain(`nonce="${nonce}"`);
    // no CSP violation while the page runs (theme script + Next bootstrap carry the nonce)
    const violations: string[] = [];
    page.on("console", (m) => {
      if (/Content Security Policy/i.test(m.text())) violations.push(m.text());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(violations).toEqual([]);
  });

  test("public fund page does not ship internal source names or admin fields", async ({ request }) => {
    const html = await request.get("/strategies/monthly-income").then((r) => r.text());
    for (const leak of [
      "sourceName",
      "dataplatform",
      "ftseIndex",
      "bonds_data",
      "pinnedSnapshot",
      "uploadedBy",
      "sha256",
    ]) {
      expect(html, leak).not.toContain(leak);
    }
    // fund AUM is hidden by default: it must not even reach the RSC payload (`"cad"` is the AUM field; quotes are
    // escaped inside the inline flight data)
    expect(html).not.toMatch(CAD_KEY);
  });

  test("/api/admin/uploadx is still gated by the proxy", async ({ request }) => {
    const r = await request.get("/api/admin/uploadx");
    expect(r.status()).toBe(401);
  });

  test("/api/health is public and minimal", async ({ request }) => {
    const r = await request.get("/api/health");
    expect(r.status()).toBe(200);
    expect(await r.json()).toEqual({ ok: true });
  });

  test("/api/status is public, cacheable, always 200 with an ok flag, no ops state; strict=1 answers 503 (no-store) when stale", async ({
    request,
  }) => {
    const r = await request.get("/api/status");
    expect(r.status()).toBe(200);
    expect(r.headers()["cache-control"]).toContain("max-age=60");
    const s = await r.json();
    expect(Object.keys(s).sort()).toEqual(["checkedAt", "funds", "lastPublishAt", "ok", "stale", "verdict"]);
    expect(typeof s.ok).toBe("boolean");
    expect(["ok", "stale"]).toContain(s.verdict);
    expect(Object.keys(s.funds)).toContain("monthly-income");
    const body = JSON.stringify(s);
    for (const leak of [
      "blocked",
      "pending",
      "failed",
      "running",
      "retry",
      "schedule",
      "dataplatform",
      "webhook",
      "http://",
      "https://",
      "issues",
    ])
      expect(body, leak).not.toContain(leak);
    const strict = await request.get("/api/status?strict=1");
    expect(strict.status()).toBe(s.ok ? 200 : 503);
    if (!s.ok) expect(strict.headers()["cache-control"]).toBe("no-store");
    expect(typeof (await strict.json()).ok).toBe("boolean");
  });
});

test.describe("API guards", () => {
  const endpoints: [string, string][] = [
    ["GET", "/api/admin/status"],
    ["GET", "/api/admin/runs"],
    ["GET", "/api/admin/content"],
    ["GET", "/api/admin/documents"],
    ["GET", "/api/admin/audit"],
    ["GET", "/api/admin/inquiries"],
    ["GET", "/api/admin/inquiries/export"],
    ["PATCH", "/api/admin/inquiries/20261006T120000-0123abcd"],
    ["DELETE", "/api/admin/inquiries/20261006T120000-0123abcd"],
    ["POST", "/api/admin/pipeline/run"],
    ["PUT", "/api/admin/content/settings"],
    ["POST", "/api/admin/upload/documents"],
  ];

  test("every admin API answers 401 without a session", async ({ request }) => {
    for (const [method, url] of endpoints) {
      const r = await request.fetch(url, { method, headers: { origin: BASE, "x-nymbus-admin": "1" }, maxRedirects: 0 });
      expect(r.status(), `${method} ${url}`).toBe(401);
    }
  });

  test("forged, expired, wrongly signed or outdated-policy sessions answer 401", async ({ request }) => {
    const bad = [
      await mintSession({ email: "alice@nymbus.ca", pv: "0000000000000000" }),
      await mintSession({ email: "alice@nymbus.ca", secret: "another-secret-0123456789abcdef0123456789" }),
      await mintSession({ email: "alice@nymbus.ca", expSeconds: -120 }),
      "eyJhbGciOiJub25lIn0.eyJlbWFpbCI6ImFsaWNlQG55bWJ1cy5jYSJ9.",
    ];
    for (const t of bad) {
      const r = await request.get("/api/admin/status", { headers: { cookie: `${SESSION_COOKIE}=${t}` } });
      expect(r.status()).toBe(401);
    }
  });

  test("a session for another domain or tenant gets 403", async ({ request }) => {
    for (const s of [
      { email: "bob@evil.com" },
      { email: "bob@evilnymbus.ca" },
      { email: "alice@nymbus.ca", tid: OTHER_TENANT },
      { email: "x#EXT#@nymbus.ca" },
    ]) {
      const t = await mintSession(s);
      const r = await request.get("/api/admin/status", { headers: { cookie: `${SESSION_COOKIE}=${t}` } });
      expect(r.status(), JSON.stringify(s)).toBe(403);
      const page = await request.get("/admin", { headers: { cookie: `${SESSION_COOKIE}=${t}` }, maxRedirects: 0 });
      expect(page.status(), JSON.stringify(s)).toBe(403);
      // uploads (not behind the proxy) enforce the same policy
      const up = await request.post("/api/admin/upload/documents", {
        headers: adminHeaders(t, false),
        multipart: { file: { name: "a.pdf", mimeType: "application/pdf", buffer: tinyPdf() } },
      });
      expect(up.status()).toBe(403);
    }
  });

  test("mutations without Origin or without the custom header are rejected (CSRF)", async ({ request }) => {
    const t = await mintSession({ email: "alice@nymbus.ca" });
    const cookie = `${SESSION_COOKIE}=${t}`;
    const body = JSON.stringify({ dryRun: true });
    // no Origin
    let r = await request.post("/api/admin/pipeline/run", {
      headers: { cookie, "x-nymbus-admin": "1", "content-type": "application/json" },
      data: body,
    });
    expect(r.status()).toBe(403);
    // foreign Origin
    r = await request.post("/api/admin/pipeline/run", {
      headers: { cookie, origin: "https://evil.example", "x-nymbus-admin": "1", "content-type": "application/json" },
      data: body,
    });
    expect(r.status()).toBe(403);
    // same Origin but a "simple" cross-site-able request (text/plain, no custom header)
    r = await request.post("/api/admin/pipeline/run", {
      headers: { cookie, origin: BASE, "content-type": "text/plain" },
      data: body,
    });
    expect(r.status()).toBe(403);
    // upload form post from another site
    r = await request.post("/api/admin/upload/documents", {
      headers: { cookie, origin: "https://evil.example" },
      multipart: { file: { name: "a.pdf", mimeType: "application/pdf", buffer: tinyPdf() } },
    });
    expect(r.status()).toBe(403);
    // same Origin, multipart without the custom header
    r = await request.post("/api/admin/upload/documents", {
      headers: { cookie, origin: BASE },
      multipart: { file: { name: "a.pdf", mimeType: "application/pdf", buffer: tinyPdf() } },
    });
    expect(r.status()).toBe(403);
  });

  test("path traversal ids are rejected", async ({ request }) => {
    const t = await mintSession({ email: "alice@nymbus.ca" });
    // (literal ../ and %2e%2e segments are normalised away by the URL parser before reaching the server)
    for (const id of [
      "..%2F..%2Fcontent%2Fsite-content.json",
      "..%2Findex.json",
      "..%5Cindex.json",
      "index.json",
      "20260101T000000-zzzzzzzz",
    ]) {
      const pub = await request.get(`/api/documents/${id}`);
      expect([400, 404]).toContain(pub.status());
      const adm = await request.fetch(`/api/admin/documents/${id}`, {
        method: "PATCH",
        headers: adminHeaders(t),
        data: { published: true },
      });
      expect([400, 404]).toContain(adm.status());
      const run = await request.get(`/api/admin/runs/${id}`, { headers: adminHeaders(t) });
      expect([400, 404]).toContain(run.status());
      const inq = await request.fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: adminHeaders(t),
        data: { handled: true },
      });
      expect([400, 404]).toContain(inq.status());
      const inqDel = await request.delete(`/api/admin/inquiries/${id}`, { headers: adminHeaders(t, false) });
      expect([400, 404]).toContain(inqDel.status());
    }
    const traversal = await request.get("/api/documents/../../package.json");
    expect(traversal.status()).not.toBe(200);
  });
});

test.describe("admin flows", () => {
  test.describe.configure({ mode: "serial" });

  test("dashboard loads for alice@nymbus.ca", async ({ page, context }, info) => {
    await signIn(context);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto("/admin");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "dashboard" })).toBeVisible();
    await expect(page.getByTestId("pipeline-status")).toBeVisible();
    // no PIPELINE_ALERT_WEBHOOK in e2e: the dashboard says at once that alerts are off
    await expect(page.getByTestId("alerts-off")).toBeVisible();
    await expect(page.getByTestId("alerts-test")).toBeDisabled();
    await expect(page.locator(".adm-user")).toContainText("alice@nymbus.ca");
    // website messages: open count, link to the messages page
    await expect(page.getByTestId("dashboard-messages")).toHaveAttribute("href", "/admin/inquiries");
    await expect(page.getByTestId("dashboard-messages")).toContainText(/\d+ open messages?/);
    // the GMV returns row names its downside volatility variant
    await expect(page.getByTestId("admin-variant-global-minimum-volatility")).toHaveText("6% downside volatility");
    await shot(page, "dashboard", info.project.name);
    for (const [path, name] of [
      ["/admin/runs", "runs"],
      ["/admin/settings", "settings"],
      ["/admin/audit", "audit"],
    ] as const) {
      const r = await page.goto(path);
      expect(r?.status(), path).toBe(200);
      await shot(page, name, info.project.name);
    }
    expect(errors).toEqual([]);
  });

  test("save fund content (and a stale version conflicts)", async ({ page, context, request }, info) => {
    // the content version is global: mutate from one project only so parallel projects cannot conflict
    test.skip(info.project.name !== "admin-desktop", "mutations run on the desktop project only");
    const token = await signIn(context);
    await page.goto("/admin/funds/multi-strategy");
    await expect(page.getByTestId("fund-editor")).toBeVisible();
    const mer = `1.${Math.floor(Math.random() * 90 + 10)}%`;
    await page.getByLabel("mer", { exact: true }).fill(mer);
    await page.getByLabel("tagline (EN)", { exact: true }).fill("e2e tagline");
    await page.getByLabel("tagline (FR)", { exact: true }).fill("slogan e2e");
    await page.getByTestId("save-fund").click();
    await expect(page.locator(".adm-toast.ok")).toContainText("Saved");
    await shot(page, "fund", info.project.name);

    const c = await request.get("/api/admin/content", { headers: adminHeaders(token) });
    expect(c.status()).toBe(200);
    const { content } = await c.json();
    expect(content.funds["multi-strategy"].mer).toBe(mer);
    expect(content.funds["multi-strategy"].tagline.en).toBe("e2e tagline");

    const stale = await request.put("/api/admin/content/funds/multi-strategy", {
      headers: adminHeaders(token),
      data: { version: content.version - 1, fund: { mer: "9%" } },
    });
    expect(stale.status()).toBe(409);

    const invalid = await request.put("/api/admin/content/funds/multi-strategy", {
      headers: adminHeaders(token),
      data: { version: content.version, fund: { riskRating: "extreme" } },
    });
    expect(invalid.status()).toBe(400);
    const unknown = await request.put("/api/admin/content/funds/not-a-fund", {
      headers: adminHeaders(token),
      data: { version: content.version, fund: {} },
    });
    expect(unknown.status()).toBe(404);

    const audit = await request.get("/api/admin/audit", { headers: adminHeaders(token) });
    const { entries } = await audit.json();
    expect(
      entries.some(
        (e: { action: string; by: string; target?: string }) =>
          e.action === "content.fund.save" && e.by === "alice@nymbus.ca" && e.target === "multi-strategy",
      ),
    ).toBe(true);
  });

  test("upload a PDF, publish it and download it publicly", async ({ page, context, request }, info) => {
    test.skip(info.project.name !== "admin-desktop", "mutations run on the desktop project only");
    const token = await signIn(context);
    await page.goto("/admin/documents");
    await expect(page.getByTestId("upload-form")).toBeVisible();
    const title = `e2e fund facts ${info.project.name} ${Date.now()}`;
    await page
      .locator('input[type="file"][name="file"]')
      .setInputFiles({ name: "Fund Facts <e2e>.pdf", mimeType: "application/pdf", buffer: tinyPdf() });
    await page.getByLabel("title (EN)", { exact: true }).fill(title);
    await page.getByLabel("title (FR)", { exact: true }).fill(`${title} fr`);
    await page.locator('select[name="scope"]').first().selectOption("monthly-income");
    await page.getByTestId("upload-submit").click();
    await expect(page.locator(".adm-toast.ok")).toContainText("Uploaded");
    const row = page.locator("tr", { hasText: title });
    await expect(row).toBeVisible();
    const id = await row.getAttribute("data-doc-id");
    expect(id).toMatch(/^\d{8}T\d{6}-[0-9a-f]{8}$/);

    // not published yet → 404 publicly
    expect((await request.get(`/api/documents/${id}`)).status()).toBe(404);

    await row.getByTestId("toggle-publish").click();
    await expect(row.getByText("published", { exact: true })).toBeVisible();
    await shot(page, "documents", info.project.name);

    const dl = await request.get(`/api/documents/${id}`);
    expect(dl.status()).toBe(200);
    expect(dl.headers()["content-type"]).toBe("application/pdf");
    expect(dl.headers()["x-content-type-options"]).toContain("nosniff");
    expect(dl.headers()["cache-control"]).toBe("public, no-cache");
    expect(dl.headers()["accept-ranges"]).toBe("bytes");
    const etag = dl.headers()["etag"];
    expect((await request.get(`/api/documents/${id}`, { headers: { "if-none-match": etag } })).status()).toBe(304);
    const part = await request.get(`/api/documents/${id}`, { headers: { range: "bytes=0-4" } });
    expect(part.status()).toBe(206);
    expect(part.headers()["content-range"]).toMatch(/^bytes 0-4\/\d+$/);
    expect((await part.body()).toString("latin1")).toBe("%PDF-");
    expect((await request.get(`/api/documents/${id}`, { headers: { range: "bytes=999999-" } })).status()).toBe(416);
    const head = await request.head(`/api/documents/${id}`);
    expect(head.status()).toBe(200);
    expect(Number(head.headers()["content-length"])).toBe(tinyPdf().length);
    expect(dl.headers()["content-disposition"]).toMatch(
      /^inline; filename="Fund Facts _e2e_\.pdf"; filename\*=UTF-8''Fund%20Facts%20_e2e_\.pdf$/,
    );
    expect((await dl.body()).subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect((await request.get(`/api/documents/${id}/Fund%20Facts%20_e2e_.pdf`)).status()).toBe(200);

    // not a PDF → 415; unpublish → 404; delete
    const notPdf = await request.post("/api/admin/upload/documents", {
      headers: adminHeaders(token, false),
      multipart: {
        file: { name: "x.pdf", mimeType: "application/pdf", buffer: Buffer.from("<html><script>alert(1)</script>") },
        scope: "firm",
        type: "other",
        lang: "en",
        titleEn: "x",
        titleFr: "x",
        date: "2026-01-01",
        published: "true",
      },
    });
    expect(notPdf.status()).toBe(415);
    const unpub = await request.patch(`/api/admin/documents/${id}`, {
      headers: adminHeaders(token),
      data: { published: false },
    });
    expect(unpub.status()).toBe(200);
    expect((await request.get(`/api/documents/${id}`)).status()).toBe(404);
    const del = await request.delete(`/api/admin/documents/${id}`, { headers: adminHeaders(token, false) });
    expect(del.status()).toBe(200);
  });

  test("disclaimers: boilerplate on public pages, compliance banner until reviewed, back after a change", async ({
    page,
    context,
    request,
  }, info) => {
    test.skip(info.project.name !== "desktop", "mutations run on the desktop project only");
    // every public page footer carries the boilerplate; the fund disclosure too (with the FTSE notice)
    for (const path of ["/", "/strategies", "/strategies/monthly-income"]) {
      await page.goto(path);
      const f = page.getByTestId("footer-disclaimers");
      await expect(f).toContainText("not guaranteed");
      await expect(f).toContainText("FTSE");
    }
    await expect(page.locator("#disclosure")).toContainText("October 5, 2021");
    await expect(page.getByTestId("ftse-notice")).toBeAttached();

    const token = await signIn(context);
    await page.goto("/admin");
    const banner = page.getByTestId("compliance-banner");
    await expect(banner).toBeVisible();
    await expect(banner.getByTestId("compliance-text-ftse")).toBeVisible();
    await shot(page, "compliance", info.project.name);
    await page.getByTestId("mark-reviewed").click();
    await page.getByRole("button", { name: "mark as reviewed", exact: true }).click();
    await expect(page.getByTestId("compliance-ok")).toBeVisible();

    const audit = await (await request.get("/api/admin/audit", { headers: adminHeaders(token) })).json();
    expect(audit.entries.some((e: { action: string }) => e.action === "compliance.disclaimers.reviewed")).toBe(true);

    // an admin override (firm disclaimer) is shown publicly and brings the banner back
    const { content } = await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json();
    const firm = { en: "E2E firm disclaimer override.", fr: "Avis de la firme E2E." };
    const put = await request.put("/api/admin/content/settings", {
      headers: adminHeaders(token),
      data: {
        version: content.version,
        firm: { aumLabel: content.firm.aumLabel, announcement: null, disclaimer: firm },
        publishMode: content.pipeline.publishMode,
      },
    });
    expect(put.status()).toBe(200);
    await page.goto("/");
    await expect(page.getByTestId("footer-disclaimers")).toContainText(firm.en);
    await page.goto("/admin");
    await expect(page.getByTestId("compliance-banner")).toContainText("changed since the last review");

    // restore the boilerplate (empty override)
    const after = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
    await request.put("/api/admin/content/settings", {
      headers: adminHeaders(token),
      data: {
        version: after.version,
        firm: { aumLabel: after.firm.aumLabel, announcement: null, disclaimer: { en: "", fr: "" } },
        publishMode: after.pipeline.publishMode,
      },
    });

    // a stale hash is refused
    const stale = await request.post("/api/admin/compliance", {
      headers: adminHeaders(token),
      data: { version: after.version + 1, textsHash: "0000000000000000", confirm: true },
    });
    expect(stale.status()).toBe(409);
  });

  test("unticking 'hide aum' persists and publishes the fund AUM; ticking it again removes it from the page", async ({
    page,
    context,
    request,
  }, info) => {
    test.skip(info.project.name !== "desktop", "mutations run on the desktop project only");
    const token = await signIn(context);
    const fund = "sustainable-enhanced-bonds";
    const before = await request.get(`/strategies/${fund}`).then((r) => r.text());
    expect(before).not.toMatch(CAD_KEY);

    await page.goto(`/admin/funds/${fund}`);
    const aum = page.getByTestId("fund-editor").locator("label.adm-chip", { hasText: /^aum$/ }).locator("input");
    await expect(aum).toBeChecked(); // hidden by default
    await aum.uncheck({ force: true });
    await page.getByTestId("save-fund").click();
    await expect(page.locator(".adm-toast.ok")).toContainText("Saved");

    const { content } = await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json();
    expect(content.funds[fund].hide?.aum).toBe(false);
    const after = await request.get(`/strategies/${fund}`).then((r) => r.text());
    expect(after).toMatch(CAD_KEY);

    // restore (hide again)
    const put = await request.put(`/api/admin/content/funds/${fund}`, {
      headers: adminHeaders(token),
      data: {
        version: content.version,
        fund: { ...content.funds[fund], hide: { ...(content.funds[fund].hide ?? {}), aum: true } },
      },
    });
    expect(put.status()).toBe(200);
    expect(await request.get(`/strategies/${fund}`).then((r) => r.text())).not.toMatch(CAD_KEY);

    // a one-language override is rejected
    const v = (await put.json()).content.version;
    const bad = await request.put(`/api/admin/content/funds/${fund}`, {
      headers: adminHeaders(token),
      data: { version: v, fund: { tagline: { en: "only english", fr: "" } } },
    });
    expect(bad.status()).toBe(400);
  });

  test("SEB pinned to a class H run: opens on class H, F says coming soon; with class H selected every performance label says Series H / Série H", async ({
    page,
    context,
    request,
  }, info) => {
    // mutates the (global) content: desktop admin project only, restored at the end
    test.skip(info.project.name !== "admin-desktop", "mutations run on the desktop project only");
    const token = await signIn(context);
    const fund = "sustainable-enhanced-bonds";
    // a stored "live" run whose SEB data is the class H series (synthetic: what the dataplatform serves before PR #626)
    const id = "20260929T140000-e2eclassh";
    const dirRun = path.join(E2E_ENV.SITE_DATA_DIR, "snapshots", id);
    mkdirSync(dirRun, { recursive: true });
    const data = JSON.parse(readFileSync("e2e/fixtures/seb-class-h-site-data.json", "utf8"));
    expect(data.funds[fund].performance.classCode).toBe("STRATEGY_H");
    writeFileSync(path.join(dirRun, "site-data.json"), JSON.stringify({ ...data, runId: id }));
    writeFileSync(
      path.join(dirRun, "report.json"),
      JSON.stringify({
        id,
        trigger: "manual",
        by: "e2e",
        startedAt: data.generatedAt,
        finishedAt: data.generatedAt,
        status: "published",
        asOf: data.asOf,
        issues: [],
        sources: [],
        funds: { [fund]: "updated" },
        publishedAt: data.generatedAt,
        publishedBy: "e2e",
      }),
    );
    const { content } = await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json();
    const original = content.funds[fund] ?? {};
    const pin = await request.put(`/api/admin/content/funds/${fund}`, {
      headers: adminHeaders(token),
      data: { version: content.version, fund: { ...original, pinnedSnapshot: id } },
    });
    expect(pin.status(), await pin.text()).toBe(200);
    try {
      for (const [lang, word, fundWord, returns] of [
        ["en", "Series", "Fund", "Returns: Series"],
        ["fr", "Série", "Fonds", "Rendements\\s:\\sSérie"],
      ] as const) {
        await page.goto(`/strategies/${fund}`);
        if (lang === "fr") {
          // cookie for the whole site (a cookie set from the fund page's URL would be scoped to /strategies)
          await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: BASE }]);
          await page.reload();
        }
        // class F (LDM201) has no series in this run: the page opens on class H, the first series with returns (never an
        // empty performance block); F itself says "coming soon", never H's numbers under F
        await expect(page.getByTestId("nav-card").getByTestId("series-LDM202")).toHaveAttribute("aria-checked", "true");
        await page.getByTestId("nav-card").getByTestId("series-LDM201").click();
        await expect(page.getByTestId("figures-soon")).toBeVisible();
        await page.getByTestId("nav-card").getByTestId("series-LDM202").click();
        const h = new RegExp(`${word} H(?![A-Za-z])`);
        const f = new RegExp(`(Series|Série) F(?![A-Za-z])`);
        for (const tid of ["basis", "overview-returns", "perf-class"]) {
          await expect(page.getByTestId(tid)).toContainText(h);
          await expect(page.getByTestId(tid)).not.toContainText(f);
        }
        // the NAV card follows the class selected (H, LDM202)
        await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM202");
        await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="performance"]').click();
        await expect(page.getByTestId("perf-context")).toContainText(h);
        await expect(page.getByTestId("perf-context")).not.toContainText(f);
        await page.getByTestId("growth").scrollIntoViewIfNeeded();
        await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(`${fundWord} (${word} H)`);
        // home tile and strategies index
        for (const p of ["/", "/strategies"]) {
          await page.goto(p);
          // the tile shows only the headline class's own returns: F has no series here, so no class H figure appears
          await expect(page.getByTestId(`strategy-${fund}`).getByTestId("perf-class")).toHaveCount(0);
        }
        await expect(
          page
            .getByTestId("compare-table")
            .getByTestId("perf-class")
            .filter({ hasText: new RegExp(`${returns} H$`) }),
        ).toHaveCount(0);
      }
      await shot(page, "seb-class-h-strategies", info.project.name);
    } finally {
      const cur = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
      const { pinnedSnapshot: _pin, ...rest } = cur.funds[fund] ?? {};
      const unpin = await request.put(`/api/admin/content/funds/${fund}`, {
        headers: adminHeaders(token),
        data: { version: cur.version, fund: rest },
      });
      expect(unpin.status()).toBe(200);
    }
    await page.goto(`/strategies/${fund}`);
    await page.context().clearCookies({ name: "nymbus-locale" });
    await page.reload();
    await expect(page.getByTestId("basis")).toContainText(/Series F(?![A-Za-z])/);
  });

  test("rankings: seeded RBC entry shown; new entry draft → stale hidden → fresh shown with source and date; brand image slots", async ({
    page,
    context,
    request,
  }, info) => {
    test.skip(info.project.name !== "admin-desktop", "mutations run on the desktop project only");
    const token = await signIn(context);
    const fund = "sustainable-enhanced-bonds";
    const original = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content
      .funds[fund];

    await page.goto("/admin");
    // official Morningstar files are shipped: no missing-assets warning; the seeded RBC entry is confirmed
    await expect(page.getByTestId("rankings-panel")).toBeVisible();
    await expect(page.getByTestId("rankings-panel")).not.toContainText("official Morningstar assets missing");
    await expect(page.getByTestId("rankings-panel")).toContainText("Q2 2026");

    await page.goto(`/admin/funds/${fund}`);
    const ed = page.getByTestId("tp-editor");
    await expect(ed.getByTestId("tp-status-0")).toHaveText("shown on the site");
    await expect(page.getByTestId("morningstar-assets-missing")).toHaveCount(0);
    // a new eVestment entry: draft, then confirmed but stale (hidden), then fresh (shown)
    await page.getByTestId("tp-add-evestment").click();
    await expect(ed.getByTestId("tp-status-1")).toHaveText("draft — hidden");
    const n = "eVestment 2";
    const label = (s: string) => page.getByLabel(`${n} ${s}`, { exact: true });
    await label("class").fill("Strategy composite");
    await label("peer group (EN)").fill("Canadian Core Plus Fixed Income");
    await label("peer group (FR)").fill("Revenu fixe canadien de base plus");
    await label("as of").fill("2025-12-31");
    await label("source URL").fill("https://www.evestment.example/e2e-ranking");
    await ed.getByTestId("tp-entry-1").getByRole("button", { name: "add period", exact: true }).click();
    await label("percentile 1M").fill("3");
    await label("confirmed").check();
    await expect(ed.getByTestId("tp-status-1")).toHaveText("out of date — hidden");
    await page.getByTestId("save-fund").click();
    await expect(page.locator(".adm-toast.ok")).toContainText("Saved");
    await shot(page, "rankings", info.project.name);

    // stale: neither on the page nor in its payload
    const staleHtml = await request.get(`/strategies/${fund}`).then((r) => r.text());
    expect(staleHtml).not.toContain("e2e-ranking");
    await page.goto(`/strategies/${fund}#awards`);
    await expect(page.getByTestId("awards")).toBeVisible();
    await expect(page.getByTestId("tp-evestment")).toHaveCount(0);
    await expect(page.getByTestId("tp-rbc-pfs")).toBeVisible();

    // fresh (end of the last quarter): shown on the awards tab, with source link and date
    const now = new Date();
    const qEnd = new Date(Date.UTC(now.getUTCFullYear(), Math.floor(now.getUTCMonth() / 3) * 3, 0))
      .toISOString()
      .slice(0, 10);
    await page.goto(`/admin/funds/${fund}`);
    await label("as of").fill(qEnd);
    await expect(page.getByTestId("tp-editor").getByTestId("tp-status-1")).toHaveText("shown on the site");
    await page.getByTestId("save-fund").click();
    await expect(page.locator(".adm-toast.ok")).toContainText("Saved");
    await page.goto(`/strategies/${fund}#awards`);
    const entry = page.getByTestId("tp-evestment");
    await expect(entry).toBeVisible();
    await expect(entry.getByTestId("tp-row-1M")).toContainText("3rd percentile");
    await expect(entry.getByRole("link", { name: /eVestment/ })).toHaveAttribute(
      "href",
      "https://www.evestment.example/e2e-ranking",
    );

    // a confirmed entry without its source URL is refused by the API
    const cur = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
    const noUrl = { ...cur.funds[fund].rankings.thirdParty[1], url: undefined };
    const bad = await request.put(`/api/admin/content/funds/${fund}`, {
      headers: adminHeaders(token),
      data: {
        version: cur.version,
        fund: { ...cur.funds[fund], rankings: { ...cur.funds[fund].rankings, thirdParty: [noUrl] } },
      },
    });
    expect(bad.status()).toBe(400);
    expect(await bad.text()).toContain("source URL");

    // restore the seeded content
    const restore = await request.put(`/api/admin/content/funds/${fund}`, {
      headers: adminHeaders(token),
      data: { version: cur.version, fund: original },
    });
    expect(restore.status(), await restore.text()).toBe(200);

    // brand image slots: plain image accepted and served with its exact type, an active SVG refused, removal
    const svgBad = await request.post("/api/admin/upload/brand", {
      headers: adminHeaders(token, false),
      multipart: {
        slot: "gmr-logo",
        file: { name: "x.svg", mimeType: "image/svg+xml", buffer: Buffer.from('<svg onload="alert(1)"></svg>') },
      },
    });
    expect(svgBad.status()).toBe(415);
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
    const up = await request.post("/api/admin/upload/brand", {
      headers: adminHeaders(token, false),
      multipart: { slot: "gmr-logo", file: { name: "gmr.png", mimeType: "image/png", buffer: png } },
    });
    expect(up.status(), await up.text()).toBe(201);
    const img = await request.get("/api/brand/gmr-logo");
    expect(img.status()).toBe(200);
    expect(img.headers()["content-type"]).toBe("image/png");
    expect(img.headers()["x-content-type-options"]).toBe("nosniff");
    expect(img.headers()["content-security-policy"]).toContain("sandbox");
    expect((await request.get("/api/brand/not-a-slot")).status()).toBe(404);
    expect(
      (
        await request.post("/api/admin/upload/brand", {
          multipart: { slot: "gmr-logo", file: { name: "gmr.png", mimeType: "image/png", buffer: png } },
        })
      ).status(),
    ).toBe(401);
    await page.goto("/admin/settings");
    await expect(page.getByTestId("brand-gmr-logo")).toContainText("uploaded");
    await expect(page.getByTestId("brand-morningstar-logo")).toContainText("shipped");
    await expect(page.getByTestId("brand-morningstar-stars-4")).toContainText("missing");
    const del = await request.delete("/api/admin/brand/gmr-logo", { headers: adminHeaders(token, false) });
    expect(del.status()).toBe(200);
    expect((await request.get("/api/brand/gmr-logo")).status()).toBe(404);
  });

  test("inquiries: contact form messages listed (bots filtered), marked handled, deleted, audited without personal data", async ({
    page,
    context,
    request,
  }, info) => {
    const token = await signIn(context);
    // unauthenticated: the page goes to sign-in, the API answers 401, a mutation without the CSRF header is refused
    expect((await request.get("/admin/inquiries", { maxRedirects: 0 })).status()).toBe(302);
    // one inquiry of this project, posted through the public API once the form's 3 s timing window has passed
    const html = await (await request.get("/contact")).text();
    const t = /name="t" value="(v1\.[^"]+)"/.exec(html)![1];
    await page.waitForTimeout(3200);
    const name = `E2E Admin ${info.project.name}`;
    const post = () =>
      request.post("/api/contact", {
        headers: {
          origin: BASE,
          "content-type": "application/json",
          "x-forwarded-for": info.project.name === "admin-mobile" ? "2001:db8:a:2::1" : "2001:db8:a:1::1",
        },
        data: JSON.stringify({
          profile: "Institution",
          interests: ["General inquiry"],
          name,
          email: "admin-test@example.com",
          phone: "+1 514 555 0100",
          company: "=E2E Pension",
          message: "Line one\n<script>alert(1)</script>",
          consent: true,
          website: "",
          t,
          lang: "fr",
        }),
      });
    expect((await post()).status()).toBe(200);
    // the same message sent again (double click, reload) answers OK but is stored once (checked below: one card)
    expect((await post()).status()).toBe(200);

    const dialogs: string[] = [];
    page.on("dialog", (d) => {
      dialogs.push(d.message());
      void d.dismiss();
    });
    expect((await page.goto("/admin/inquiries"))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "messages" })).toBeVisible();
    await expect(page.locator("#admin-main")).toContainText("deleted automatically 180 days after it was received");
    const list = page.getByTestId("inquiries");
    await list.getByLabel("filter by status").selectOption("all");
    // the public tests' inquiries are there (with and without JavaScript), the bots' never are
    await expect(list).toContainText("E2E Visitor");
    await expect(list).toContainText("E2E NoScript");
    await expect(list).not.toContainText("E2E Bot");
    const card = list.locator("article", { hasText: name });
    await expect(card).toHaveCount(1);
    await expect(card.getByTestId("inquiry-message")).toHaveText(/Line one\s+<script>alert\(1\)<\/script>/); // plain text, never markup
    await expect(card.getByRole("link", { name: "admin-test@example.com" })).toHaveAttribute(
      "href",
      "mailto:admin-test@example.com",
    );
    await expect(card).toContainText("E2E Pension");
    await expect(card).toContainText("français");
    await shot(page, "inquiries", info.project.name);

    // CSV export: admin only, formula-like cells neutralised, audited
    expect((await request.get("/api/admin/inquiries/export")).status()).toBe(401);
    await expect(list.getByTestId("inquiries-export")).toHaveAttribute("href", "/api/admin/inquiries/export");
    const csv = await request.get("/api/admin/inquiries/export", { headers: adminHeaders(token, false) });
    expect(csv.status()).toBe(200);
    expect(csv.headers()["content-type"]).toMatch(/^text\/csv/);
    expect(csv.headers()["content-disposition"]).toMatch(
      /^attachment; filename="nymbus-website-messages-\d{4}-\d{2}-\d{2}\.csv"$/,
    );
    const csvText = await csv.text();
    expect(csvText.split("\r\n")[0]).toContain("id,received_at,status");
    expect(csvText).toContain(name);
    expect(csvText).toContain("'=E2E Pension");
    expect(csvText).not.toContain(",=E2E Pension");

    await card.getByTestId("inquiry-handled").click();
    await expect(card.getByTestId("inquiry-reopen")).toBeVisible();
    await expect(card.locator(".adm-pill", { hasText: /^handled$/ })).toBeVisible();
    const id = await card.getAttribute("data-inquiry-id");
    // the JSON API agrees, and refuses a mutation without the CSRF header
    const listed = (await (
      await request.get("/api/admin/inquiries", { headers: adminHeaders(token, false) })
    ).json()) as { inquiries: { id: string; handled: { by: string } | null }[] };
    expect(listed.inquiries.find((x) => x.id === id)?.handled?.by).toBe("alice@nymbus.ca");
    const csrf = await request.fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { cookie: `${SESSION_COOKIE}=${token}`, origin: BASE, "content-type": "text/plain" },
      data: JSON.stringify({ handled: false }),
    });
    expect(csrf.status()).toBe(403);
    const unknownKey = await request.fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: adminHeaders(token),
      data: { handled: false, extra: 1 },
    });
    expect(unknownKey.status()).toBe(400);

    await card.getByTestId("inquiry-delete").click();
    await page.getByRole("dialog").getByRole("button", { name: "delete" }).click();
    await expect(card).toHaveCount(0);
    expect((await request.delete(`/api/admin/inquiries/${id}`, { headers: adminHeaders(token, false) })).status()).toBe(
      404,
    );
    expect(dialogs).toEqual([]);

    await page.goto("/admin/audit");
    const audit = page.getByTestId("audit-table");
    for (const a of ["inquiries.view", "inquiries.export", "inquiry.handled", "inquiry.delete"])
      await expect(audit).toContainText(a);
    await expect(audit).toContainText(id!);
    for (const pii of ["admin-test@example.com", name, "E2E Pension", "Line one"])
      await expect(audit).not.toContainText(pii);
  });

  test("logout clears and revokes the session", async ({ request }) => {
    const t = await mintSession({ email: "alice@nymbus.ca" });
    expect((await request.get("/api/admin/me", { headers: { cookie: `${SESSION_COOKIE}=${t}` } })).status()).toBe(200);
    const r = await request.post("/api/auth/logout", {
      headers: { cookie: `${SESSION_COOKIE}=${t}`, origin: BASE, accept: "application/json" },
    });
    expect(r.status()).toBe(200);
    expect(r.headers()["set-cookie"]).toMatch(/nymbus_admin=;.*Max-Age=0/i);
    // the same token replayed after logout is rejected server-side
    expect((await request.get("/api/admin/me", { headers: { cookie: `${SESSION_COOKIE}=${t}` } })).status()).toBe(401);
    const x = await request.post("/api/auth/logout", { headers: { origin: "https://evil.example" } });
    expect(x.status()).toBe(403);
  });
});
