import { expect, test, type Page } from "@playwright/test";

/**
 * Home "diversifying engines" band (after science at scale): a canvas that is drawn, advances, runs only while on
 * screen, is a single still frame under reduced motion (also when the preference changes live), carries its
 * illustration label and caption, fits a 360 px phone; and science at scale above it is unchanged.
 */
const frames = (page: Page) => page.getByTestId("overlay-host").evaluate((el) => Number(el.getAttribute("data-frames") ?? "0"));
const norm = (s: string | null) => (s ?? "").replace(/\s+/g, " ").trim();

async function canvasInk(page: Page) {
  return page.getByTestId("overlay-canvas").evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let ink = 0;
    for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 8) ink++;
    return ink;
  });
}

test("engines band: drawn, advancing, labelled as an illustration, paused off screen", async ({ page }) => {
  await page.goto("/");
  const panel = page.getByTestId("overlay-panel");
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveClass(/\bon\b/);
  await expect.poll(() => frames(page)).toBeGreaterThan(5);
  const f1 = await frames(page);
  await expect.poll(() => frames(page)).toBeGreaterThan(f1 + 3);
  expect(await canvasInk(page)).toBeGreaterThan(300);
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-running", "true");
  await expect(panel).toContainText(/illustration/i);
  await expect(page.getByTestId("overlay-caption")).toContainText(/generated values, not actual positions or results/);
  await expect(page.getByTestId("overlay-caption")).toContainText("The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.");
  // only the drawing is an image; the counters stay readable
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("role", "img");
  await expect(panel).not.toHaveAttribute("role", "img");
  expect(await panel.locator("dl").evaluate((el) => el.closest("[role=img]") === null)).toBe(true);
  await expect(panel.locator("dl dt").first()).toHaveText("Simulated months");
  await expect(page.getByTestId("overlay-caption")).toContainText(/design objective, not a guarantee/);
  await expect(page.getByTestId("ov-count-engines")).toHaveText("5");
  await expect.poll(async () => Number((await page.getByTestId("ov-count-months").innerText()).replace(/\D/g, ""))).toBeGreaterThan(0);
  // never stated as a fact
  await expect(page.locator("section.ov")).not.toContainText(/\buncorrelated\b/i);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-running", "false");
  const f0 = await frames(page);
  await page.waitForTimeout(700);
  expect(await frames(page)).toBe(f0);
  await panel.scrollIntoViewIfNeeded();
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-running", "true");
});

test("engines band: paused while the tab is hidden", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("overlay-panel").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-running", "true");
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-running", "false");
});

test("engines band (FR): French labels and caption", async ({ page, baseURL }) => {
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  await page.goto("/");
  const panel = page.getByTestId("overlay-panel");
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toContainText(/mois de baisse/i);
  await expect(page.getByTestId("overlay-caption")).toContainText(/un objectif, pas une garantie/);
  await expect(page.getByTestId("overlay-caption")).toContainText(/exposition additionnelle au moyen de contrats à terme/);
  await expect(panel.locator("dl dt")).toHaveText(["Mois simulés", "Mois de baisse simulés", "Moteurs simulés", "Mouvements autonomes simulés"]);
});

test("reduced motion: the engines band is one still frame, and follows a live change of the preference", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", baseURL });
  const page = await ctx.newPage();
  await page.goto("/");
  const panel = page.getByTestId("overlay-panel");
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveClass(/\bon\b/);
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-running", "false");
  await page.waitForTimeout(600);
  expect(await frames(page)).toBe(1);
  expect(await canvasInk(page)).toBeGreaterThan(300);
  expect(Number((await page.getByTestId("ov-count-months").innerText()).replace(/\D/g, ""))).toBeGreaterThan(0);
  // the visitor turns reduced motion off: the animation starts
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-running", "true");
  await expect.poll(() => frames(page)).toBeGreaterThan(3);
  // and back on: a still frame again
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-running", "false");
  await ctx.close();
});

test("engines band: no horizontal scroll at 360 px, panel inside the viewport", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 760 }, baseURL, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto("/");
  const panel = page.getByTestId("overlay-panel");
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveClass(/\bon\b/);
  const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(o.sw).toBeLessThanOrEqual(o.iw + 1);
  const box = await panel.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(o.iw + 1);
  await expect(page.getByTestId("overlay-caption")).toBeVisible();
  await ctx.close();
});

// copy changed at Gabriel's request 2026-10-03 (title and third trio card) and 2026-10-04 (counters removed); animation unchanged
test("science at scale is unchanged (apart from its 2026-10-03 copy and 2026-10-04 counters removal), and the engines band comes right after it", async ({ page }) => {
  await page.goto("/");
  const sc = page.locator("section.sc");
  await sc.scrollIntoViewIfNeeded();
  const texts = (sel: string) => sc.locator(sel).evaluateAll((els) => els.map((e) => (e.textContent ?? "").replace(/\s+/g, " ").trim()));
  expect(await texts(".section-head .eyebrow")).toEqual(["Science at scale"]);
  await expect(sc.locator("#scan-t")).toHaveAttribute("aria-label", "Scientists, engineers and market veterans, hard problems in finance");
  expect(await texts(".section-head .lead")).toEqual(["Data at scale. Models tested before they are trusted."]);
  expect(await texts(".sc-title, .sc-chip")).toEqual(["Analysis · universe, factors, signals", "Illustration"]);
  expect(norm(await sc.locator("figcaption").textContent())).toBe(
    "Generic labels and generated values: not actual securities, signals or results.",
  );
  // 2026-10-04: Gabriel requested the removal of the simulated counters strip
  await expect(sc.locator(".sc-stats")).toHaveCount(0);
  expect(await texts(".sc-trio h3, .sc-trio p")).toEqual([
    "Scientists", "Hypotheses, tested on data.", "Engineers", "Pipelines that run every day.", "Market veterans", "Decades in fixed income and derivatives.",
  ]);
  await expect(sc.getByTestId("scan-canvas")).toHaveCount(1);
  await expect(page.getByTestId("scan-panel")).toHaveAttribute("aria-label", "Animated illustration: a table of securities scanned for factor scores, with flagged signals.");
  // order: science at scale, then the engines band
  const next = await sc.evaluate((el) => el.nextElementSibling?.getAttribute("aria-labelledby"));
  expect(next).toBe("ov-t");
});
