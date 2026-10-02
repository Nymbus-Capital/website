import { expect, test, type APIRequestContext } from "@playwright/test";

/**
 * Headless-WordPress integration, against a SECOND server of the same build (baseURL = the "cms" project) that reads a
 * mock WordPress (e2e/mock-wp.mjs, fixture e2e/fixtures/wp-site-content.json): team, news, banner and AUM label come
 * from the CMS; hostile content is neutralised; when WordPress fails the last good content stays; the revalidation
 * route is authenticated. The main server (no WP_BASE_URL) is checked for the unchanged static behaviour.
 * Serial: the tests flip the mock's mode and force refreshes (the server's TTL is an hour).
 */
const MOCK = `http://localhost:${process.env.MOCK_WP_PORT || 3199}`;
const MAIN = `http://localhost:${process.env.E2E_PORT || 3100}`;
const SECRET = "e2e-revalidate-secret";

test.describe.configure({ mode: "serial" });

async function setMode(request: APIRequestContext, mode: string) {
  const r = await request.post(`${MOCK}/__mode/${mode}`);
  expect(r.ok()).toBeTruthy();
}

/** Forces the server to refetch (the route coalesces calls closer than 2 s: wait first). */
async function revalidate(request: APIRequestContext, page: { waitForTimeout(ms: number): Promise<void> }) {
  await page.waitForTimeout(2200);
  const r = await request.post("/api/cms/revalidate", { headers: { authorization: `Bearer ${SECRET}` } });
  expect(r.status()).toBe(200);
  return (await r.json()) as { ok: boolean; source: string | null };
}

test.beforeAll(async ({ request }) => { await setMode(request, "ok"); });
test.afterAll(async ({ request }) => { await setMode(request, "ok"); });

test("news page: CMS items, newest first, markup stripped, image loads, French on request", async ({ page, context }) => {
  await page.goto("/news");
  const cards = page.getByTestId("news-list").locator("article");
  await expect(cards).toHaveCount(4);
  await expect(cards.first()).toContainText("CMS test: a partnership announcement");
  await expect(cards.first()).toContainText("Summary with markup that must be stripped.");
  await expect(page.locator("body")).not.toContainText("<b>");
  const img = cards.first().locator("img");
  await expect(img).toHaveAttribute("src", /^http:\/\/localhost:\d+\/wp-content\/uploads\/test\.png$/);
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  // an item without text links to its external page, safely
  const second = page.getByTestId("news-card-cms-test-second").getByRole("link");
  await expect(second).toHaveAttribute("href", "https://example.org/second");
  await expect(second).toHaveAttribute("rel", /noopener/);
  await context.addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  await page.goto("/news");
  await expect(page.getByTestId("news-list").locator("article").first()).toContainText("Test CMS : une annonce de partenariat");
});

test("news article: paragraphs, no script, 404 for an unknown item", async ({ page }) => {
  await page.goto("/news/cms-test-launch");
  const art = page.getByTestId("news-article");
  await expect(art.getByRole("heading", { level: 1 })).toHaveText("CMS test: a partnership announcement");
  await expect(art.locator(".prose p")).toHaveCount(3); // lead + two paragraphs
  await expect(art).toContainText("First paragraph of the test article.");
  await expect(art).not.toContainText("alert(1)");
  const res = await page.goto("/news/does-not-exist");
  expect(res?.status()).toBe(404);
});

test("home: three latest CMS news, link to all news, banner and AUM label from WordPress", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("news-cms-test-launch")).toBeAttached();
  await expect(page.getByTestId("news-cms-test-third")).toBeAttached();
  await expect(page.getByTestId("news-cms-test-fourth")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /all news/i })).toHaveAttribute("href", "/news");
  await expect(page.getByTestId("announcement-banner")).toContainText("CMS test banner: scheduled maintenance tonight.");
  await expect(page.getByText("$9.9B+ (CMS test)").first()).toBeAttached();
});

test("team page: members come from WordPress, not from the built-in list", async ({ page }) => {
  await page.goto("/team");
  const people = page.getByTestId("people").locator(":scope > li");
  await expect(people).toHaveCount(3);
  await expect(people.first()).toContainText("Sample Person One");
  await expect(page.getByTestId("people")).not.toContainText("Jean Turmel");
  await people.first().getByRole("button").click();
  await expect(page.getByTestId("bio-dialog")).toContainText("Fictional biography used by the automated tests.");
});

test("CSP: the media origin is allowed for images, nothing else changed", async ({ request }) => {
  const r = await request.get("/news");
  const csp = r.headers()["content-security-policy"] ?? "";
  expect(csp).toMatch(/img-src 'self' data: blob: https:\/\/www\.nymbus\.ca http:\/\/localhost:\d+;/);
  expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic';/);
  expect(csp).toContain("connect-src 'self';");
});

test("revalidation route: authenticated, POST only", async ({ request }) => {
  expect((await request.post("/api/cms/revalidate")).status()).toBe(401);
  expect((await request.post("/api/cms/revalidate", { headers: { authorization: "Bearer wrong" } })).status()).toBe(401);
  expect((await request.post("/api/cms/revalidate", { headers: { authorization: SECRET } })).status()).toBe(401);
  expect((await request.get("/api/cms/revalidate")).status()).toBe(405);
  const ok = await request.post("/api/cms/revalidate", { headers: { authorization: `Bearer ${SECRET}` } });
  expect(ok.status()).toBe(200);
  expect(ok.headers()["cache-control"]).toBe("no-store");
});

test("an edit in WordPress shows up after revalidation", async ({ page, request }) => {
  await setMode(request, "edited");
  expect((await revalidate(request, page)).source).toBe("live");
  await page.goto("/news");
  await expect(page.getByTestId("news-list").locator("article").first()).toContainText("CMS test: EDITED title");
});

test("hostile content from WordPress is neutralised", async ({ page, request }) => {
  await setMode(request, "hostile");
  await revalidate(request, page);
  const dialogs: string[] = [];
  page.on("dialog", (d) => { dialogs.push(d.message()); void d.dismiss(); });
  const requested: string[] = [];
  page.on("request", (r) => requested.push(r.url()));
  await page.goto("/news");
  const first = page.getByTestId("news-list").locator("article").first();
  await expect(first).toContainText("Hostile title");
  await expect(first).toContainText("Hostile summary");
  const html = await page.content();
  expect(html).not.toMatch(/<script>alert/);
  expect(html).not.toContain("onerror=alert");
  expect(html).not.toMatch(/href="javascript:/i);
  expect(html).not.toContain("evil.example");
  expect(html).not.toContain("insecure.example");
  await page.goto("/news/cms-test-launch");
  await expect(page.getByTestId("news-article")).not.toContainText("<script");
  await page.goto("/team");
  await expect(page.locator("body")).not.toContainText("evil.example");
  await page.goto("/");
  await expect(page.getByTestId("announcement-banner")).toHaveText("Hostile banner");
  expect(dialogs).toEqual([]);
  expect(requested.filter((u) => u.includes("evil.example"))).toEqual([]);
});

test("WordPress down or answering garbage: the last good content stays", async ({ page, request }) => {
  await setMode(request, "ok");
  await revalidate(request, page);
  await setMode(request, "down");
  const down = await revalidate(request, page);
  expect(down.ok).toBe(false);
  await page.goto("/news");
  await expect(page.getByTestId("news-list").locator("article")).toHaveCount(4);
  await setMode(request, "badschema");
  expect((await revalidate(request, page)).ok).toBe(false);
  await page.goto("/team");
  await expect(page.getByTestId("people").locator(":scope > li")).toHaveCount(3);
  await setMode(request, "ok");
});

test("without WP_BASE_URL the site is unchanged: static news and team", async ({ page, request }) => {
  const r = await request.post(`${MAIN}/api/cms/revalidate`, { headers: { authorization: `Bearer ${SECRET}` } });
  expect(r.status()).toBe(404);
  await page.goto(`${MAIN}/news`);
  await expect(page.getByTestId("news-list").locator("article")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "Mageska Capital and Nymbus Capital announce a partnership" })).toBeVisible();
  await page.goto(`${MAIN}/team`);
  await expect(page.getByTestId("people")).toContainText("Jean Turmel");
});
