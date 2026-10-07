import { expect, test, type Page } from "@playwright/test";

/**
 * Home v2 (an inspiring page): no daily NAV, C$1.9 billion, the analysis scan (a canvas that is drawn, runs only
 * while on screen, is a single still frame under reduced motion), the data-field hero backdrop, no horizontal
 * overflow on phones, French labels, and the site-wide motion pieces (dividers, scroll progress) are decorative.
 */
const frames = (page: Page, testId: string) =>
  page.getByTestId(testId).evaluate((el) => Number(el.getAttribute("data-frames") ?? "0"));

async function canvasHasInk(page: Page, testId: string) {
  return page.getByTestId(testId).evaluate((c: HTMLCanvasElement) => {
    const ctx = c.getContext("2d")!;
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let ink = 0;
    for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 8) ink++;
    return ink;
  });
}

test("home: no daily NAV widget, AUM is C$1.9 billion", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("nav-panel")).toHaveCount(0);
  await expect(page.getByTestId("nav-ribbon")).toHaveCount(0);
  const main = page.locator("main");
  await expect(main).not.toContainText(/daily navs?|nav as of|net asset value/i);
  // the strategy cards carry returns, not the daily NAV
  await expect(page.locator('[data-testid^="strategy-"] .fx-kv-nav')).toHaveCount(0);
  const glance = page.locator(".hm-figs");
  await glance.scrollIntoViewIfNeeded();
  await expect(glance).toContainText(/\$1\.9B/);
});

test("home (FR): AUM reads 1,9 G$ and the scan is labelled in French", async ({ page, baseURL }) => {
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  await page.goto("/");
  const glance = page.locator(".hm-figs");
  await glance.scrollIntoViewIfNeeded();
  await expect(glance).toContainText(/1,9\s?G\$/);
  const panel = page.getByTestId("scan-panel");
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toContainText(/Analyse · univers, facteurs, signaux/);
  await expect(panel).toContainText(/Illustration/);
  await expect(page.locator("main")).not.toContainText(/VL quotidienne/i);
});

test("home: the analysis scan is drawn, has no counters strip and stops when it leaves the screen", async ({
  page,
}) => {
  await page.goto("/");
  const panel = page.getByTestId("scan-panel");
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveClass(/\bon\b/);
  await expect.poll(() => frames(page, "scan-host")).toBeGreaterThan(5);
  expect(await canvasHasInk(page, "scan-canvas")).toBeGreaterThan(200);
  // illustration, not data: the figure says so; the simulated counters were removed (Gabriel, 2026-10-04)
  await expect(panel).toContainText(/illustration/i);
  await expect(panel.locator("dl")).toHaveCount(0);
  await expect(page.getByTestId("count-securities")).toHaveCount(0);
  await expect(page.getByTestId("scan-host")).toHaveAttribute("data-running", "true");
  // off screen: the loop is stopped (no CPU while the visitor reads elsewhere)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.getByTestId("scan-host")).toHaveAttribute("data-running", "false");
  const f0 = await frames(page, "scan-host");
  await page.waitForTimeout(700);
  expect(await frames(page, "scan-host")).toBe(f0);
  // back on screen: it runs again
  await panel.scrollIntoViewIfNeeded();
  await expect(page.getByTestId("scan-host")).toHaveAttribute("data-running", "true");
});

test("home: the hero data field starts lazily and pauses off screen", async ({ page }) => {
  await page.goto("/");
  const field = page.locator(".hm-hero [data-testid=data-field]");
  await expect(field).toHaveClass(/\bon\b/);
  await expect.poll(() => field.evaluate((el) => Number(el.getAttribute("data-frames")))).toBeGreaterThan(3);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(field).toHaveAttribute("data-running", "false");
});

test("reduced motion: the scan and the data field are one still frame, nothing is hidden", async ({
  browser,
  baseURL,
}) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", baseURL });
  const page = await ctx.newPage();
  await page.goto("/");
  const panel = page.getByTestId("scan-panel");
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveClass(/\bon\b/);
  await expect(page.getByTestId("scan-host")).toHaveAttribute("data-running", "false");
  expect(await frames(page, "scan-host")).toBe(1);
  expect(await canvasHasInk(page, "scan-canvas")).toBeGreaterThan(200);
  const field = page.locator(".hm-hero [data-testid=data-field]");
  await expect(field).toHaveAttribute("data-running", "false");
  await page.waitForTimeout(500);
  expect(await field.evaluate((el) => Number(el.getAttribute("data-frames")))).toBe(1);
  // dividers are fully drawn and static
  const dividers = await page
    .locator(".sec-divider i")
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).transform));
  for (const t of dividers) expect(t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
  await ctx.close();
});

test("home: no horizontal overflow, the scan fits the viewport", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("scan-panel").scrollIntoViewIfNeeded();
  const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(o.sw).toBeLessThanOrEqual(o.iw + 1);
  const box = await page.getByTestId("scan-panel").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(o.iw + 1);
});

test("site-wide motion is decorative: aria-hidden, no focusable element, no pointer capture", async ({ page }) => {
  await page.goto("/approach");
  for (const sel of [".sec-divider", ".dfield", ".scroll-progress"]) {
    const n = await page.locator(sel).count();
    expect(n, sel).toBeGreaterThan(0);
    const bad = await page
      .locator(sel)
      .evaluateAll(
        (els) =>
          els.filter((e) => e.getAttribute("aria-hidden") !== "true" || getComputedStyle(e).pointerEvents !== "none")
            .length,
      );
    expect(bad, sel).toBe(0);
  }
  // the scroll progress line follows the scroll
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
  await expect
    .poll(() => page.getByTestId("scroll-progress").evaluate((e) => getComputedStyle(e).transform))
    .not.toBe("matrix(1, 0, 0, 1, 0, 0)");
});
