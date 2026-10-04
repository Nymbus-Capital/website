import { expect, test, type Page } from "@playwright/test";

/**
 * /core-concepts (was /critical-concepts, which redirects): three animated panels (overlay, futures, ultra-micro analysis — test id "coverage") that render in English and French, are
 * linked from the nav and the footer, draw and advance only while on screen, stop on a single still frame under
 * reduced motion (also after a live change), can be paused and stepped with the keyboard, carry their illustration
 * label, figures and captions, and fit a 360 px phone without horizontal scroll.
 */
const IDS = ["overlay", "futures", "coverage"] as const;
const EXPOSURE = "The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.";
const frames = (page: Page, id: string) => page.getByTestId(`${id}-host`).evaluate((el) => Number(el.getAttribute("data-frames") ?? "0"));

async function canvasInk(page: Page, id: string) {
  return page.getByTestId(`${id}-canvas`).evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let ink = 0;
    for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 8) ink++;
    return ink;
  });
}

test("core concepts (EN): three panels drawn, advancing, labelled, with captions and figures", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/core-concepts");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/three ideas behind our funds/i);
  await expect(page.getByRole("heading", { level: 2, name: /what is a protective overlay\?/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /how futures work/i })).toBeAttached();
  await expect(page.getByRole("heading", { level: 2, name: /why machines see more/i })).toBeAttached();
  for (const id of IDS) {
    const panel = page.getByTestId(`${id}-panel`);
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toHaveClass(/\bon\b/);
    await expect.poll(() => frames(page, id)).toBeGreaterThan(4);
    const f1 = await frames(page, id);
    await expect.poll(() => frames(page, id)).toBeGreaterThan(f1 + 3);
    await expect(page.getByTestId(`${id}-host`)).toHaveAttribute("data-running", "true");
    await expect(page.getByTestId(`${id}-host`)).toHaveAttribute("role", "img");
    await expect(page.getByTestId(`${id}-host`)).toHaveAttribute("aria-label", /^Animated illustration/);
    expect(await canvasInk(page, id)).toBeGreaterThan(300);
    await expect(page.getByTestId(`${id}-caption`)).toBeVisible();
    // controls and figures are outside the image, readable
    expect(await panel.locator("dl").evaluate((el) => el.closest("[role=img]") === null)).toBe(true);
    await expect(panel.locator(".cc-steps button")).toHaveCount(4);
  }
  await expect(page.getByTestId("overlay-caption")).toContainText(EXPOSURE);
  await expect(page.getByTestId("overlay-caption")).toContainText(/generated values, not actual positions or results/);
  await expect(page.getByTestId("overlay-caption")).toContainText("Illustration of the overlay strategy’s sensitivity to volatility (vega); it may not behave this way.");
  await expect(page.getByTestId("futures-caption")).toContainText(/losses can exceed the margin deposited/);
  await expect(page.getByTestId("coverage-caption")).toContainText(/^Illustrative estimates/);
  await expect(page.getByTestId("coverage-panel").locator("dl dd")).toHaveText(["≈30", "≈180", "≈2,000", "≥ $200 MM"]);
  await expect(page.getByTestId("coverage-panel")).toContainText("Illustrative estimates");
  await expect(page.getByTestId("coverage-note")).toContainText(/over the counter/);
  // concept 3 is a comparison: conventional team VS our systems
  await expect(page.getByTestId("coverage-panel").locator(".cc-steps .t")).toHaveText(["The universe", "Conventional team", "Our systems", "Side by side"]);
  for (const sec of await page.locator("section.cc-sec").all()) await expect(sec).not.toContainText(/\buncorrelated\b/i);
  expect(errors).toEqual([]);
});

test("core concepts (FR): French headings, steps and captions", async ({ page, baseURL }) => {
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  await page.goto("/core-concepts");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/trois idées derrière nos fonds/i);
  await expect(page.getByRole("heading", { level: 2, name: /qu’est-ce qu’une superposition protectrice\?/i })).toBeAttached();
  await expect(page.getByTestId("overlay-caption")).toContainText(/exposition additionnelle au moyen de contrats à terme/);
  await expect(page.getByTestId("futures-caption")).toContainText(/les pertes peuvent dépasser le dépôt/);
  await expect(page.getByTestId("futures-panel").locator(".cc-steps .t")).toHaveText(["Acheteur et vendeur", "Règlement quotidien", "Dépôt de garantie", "Un seul jour à risque"]);
  await page.getByTestId("coverage-panel").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("coverage-panel")).toContainText("Estimations illustratives");
});

test("nav and footer link to core concepts; jump links reach each concept", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByTestId("menu-toggle").click();
    await expect(page.getByTestId("mobile-menu").getByRole("link", { name: "Core concepts" })).toHaveAttribute("href", "/core-concepts");
    await page.keyboard.press("Escape");
  } else {
    const link = page.getByTestId("site-nav").getByRole("link", { name: "Core concepts" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/core-concepts$/);
    await expect(page.getByTestId("site-nav").getByRole("link", { name: "Core concepts" })).toHaveAttribute("aria-current", "page");
  }
  await expect(page.getByTestId("site-footer").getByRole("link", { name: "Core concepts" })).toHaveAttribute("href", "/core-concepts");
  await page.goto("/core-concepts");
  await page.getByTestId("concepts-jump").getByRole("link", { name: /futures/i }).click();
  await expect(page).toHaveURL(/#futures$/);
  await expect(page.locator("section#futures")).toBeInViewport();
  // concept 3 is "Ultra-micro analysis, at scale"; the old #coverage anchor still lands on it
  await expect(page.getByTestId("concepts-jump").getByRole("link", { name: /ultra-micro analysis, at scale/i })).toHaveAttribute("href", "#ultra-micro-analysis");
  await page.goto("/core-concepts#coverage");
  await expect(page.locator("section#ultra-micro-analysis")).toBeInViewport();
  await expect(page.locator("section#ultra-micro-analysis")).toContainText("Ultra-micro analysis, at scale");
});

test("old URL /critical-concepts redirects permanently to /core-concepts", async ({ page, request }) => {
  const r = await request.get("/critical-concepts", { maxRedirects: 0 });
  expect(r.status()).toBe(308);
  expect(r.headers()["location"]).toMatch(/\/core-concepts$/);
  await page.goto("/critical-concepts");
  await expect(page).toHaveURL(/\/core-concepts$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/three ideas behind our funds/i);
});

test("controls: pause / play, steps by click and arrow keys", async ({ page }) => {
  await page.goto("/core-concepts");
  const host = page.getByTestId("futures-host");
  await page.getByTestId("futures-panel").scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute("data-running", "true");
  const play = page.getByTestId("futures-play");
  await expect(play).toHaveAccessibleName("Pause animation");
  await play.click();
  await expect(play).toHaveAccessibleName("Play animation");
  await expect(host).toHaveAttribute("data-running", "false");
  const f0 = await frames(page, "futures");
  await page.waitForTimeout(600);
  expect(await frames(page, "futures")).toBe(f0);
  // steps: each button shows its still frame while paused
  await page.getByTestId("futures-step-2").click();
  await expect(host).toHaveAttribute("data-step", "2");
  await expect(page.getByTestId("futures-step-2")).toHaveAttribute("aria-current", "step");
  await page.getByTestId("futures-step-2").focus();
  await page.keyboard.press("ArrowRight");
  await expect(host).toHaveAttribute("data-step", "3");
  await expect(page.getByTestId("futures-step-3")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(host).toHaveAttribute("data-step", "0");
  await page.keyboard.press("End");
  await expect(host).toHaveAttribute("data-step", "3");
  await page.keyboard.press("Home");
  await expect(host).toHaveAttribute("data-step", "0");
  await expect(page.getByTestId("futures-step-0")).toHaveAccessibleName(/^Step 1, Long meets short$/);
  // roving tabindex: one tab stop, on the current step
  await expect(page.getByTestId("futures-panel").locator('.cc-steps button[tabindex="0"]')).toHaveCount(1);
  await expect(page.getByTestId("futures-step-0")).toHaveAttribute("tabindex", "0");
  await expect(page.getByTestId("futures-step-2")).toHaveAttribute("tabindex", "-1");
  // keyboard play: Tab back to the play button and press Enter
  await play.focus();
  await page.keyboard.press("Enter");
  await expect(host).toHaveAttribute("data-running", "true");
  await expect.poll(() => frames(page, "futures")).toBeGreaterThan(f0 + 3);
});

test("off screen and hidden tab: the animations pause", async ({ page }) => {
  await page.goto("/core-concepts");
  const host = page.getByTestId("overlay-host");
  await page.getByTestId("overlay-panel").scrollIntoViewIfNeeded();
  await expect(host).toHaveAttribute("data-running", "true");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(host).toHaveAttribute("data-running", "false");
  const f0 = await frames(page, "overlay");
  await page.waitForTimeout(600);
  expect(await frames(page, "overlay")).toBe(f0);
  await page.getByTestId("coverage-panel").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("coverage-host")).toHaveAttribute("data-running", "true");
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByTestId("coverage-host")).toHaveAttribute("data-running", "false");
});

test("reduced motion: one still frame per panel, steps switch still frames, live change restarts", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", baseURL });
  const page = await ctx.newPage();
  await page.goto("/core-concepts");
  for (const id of IDS) {
    const panel = page.getByTestId(`${id}-panel`);
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toHaveClass(/\bon\b/);
    await expect(page.getByTestId(`${id}-host`)).toHaveAttribute("data-running", "false");
    await page.waitForTimeout(400);
    expect(await frames(page, id)).toBe(1);
    expect(await canvasInk(page, id)).toBeGreaterThan(300);
    await expect(page.getByTestId(`${id}-play`)).toHaveCount(0);
    await expect(page.getByTestId(`${id}-host`)).toHaveAttribute("data-step", "3");
  }
  await page.getByTestId("overlay-step-1").click();
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-step", "1");
  expect(await frames(page, "overlay")).toBe(1);
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-running", "false");
  // the visitor turns reduced motion off: the animation starts
  await page.getByTestId("overlay-panel").scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-running", "true");
  await expect.poll(() => frames(page, "overlay")).toBeGreaterThan(3);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByTestId("overlay-host")).toHaveAttribute("data-running", "false");
  await ctx.close();
});

test("360 px phone: no horizontal scroll, panels inside the viewport, captions visible", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 760 }, baseURL, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto("/core-concepts");
  for (const id of IDS) {
    const panel = page.getByTestId(`${id}-panel`);
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toHaveClass(/\bon\b/);
    const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    expect(o.sw).toBeLessThanOrEqual(o.iw + 1);
    const box = await panel.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(o.iw + 1);
    await expect(page.getByTestId(`${id}-caption`)).toBeVisible();
    // step buttons stay inside the panel
    for (const b of await panel.locator(".cc-steps button").all()) {
      const bb = await b.boundingBox();
      expect(bb!.x + bb!.width).toBeLessThanOrEqual(box!.x + box!.width + 1);
    }
  }
  await ctx.close();
});

test("desktop nav: seven links fit without overlapping the logo or the tools, in both languages", async ({ browser, baseURL, isMobile }) => {
  test.skip(isMobile, "desktop widths only");
  for (const locale of ["en", "fr"] as const) {
    for (const width of [1241, 1300, 1361, 1440]) {
      const ctx = await browser.newContext({ viewport: { width, height: 800 }, baseURL });
      await ctx.addCookies([{ name: "nymbus-locale", value: locale, url: baseURL! }]);
      const page = await ctx.newPage();
      await page.goto("/core-concepts");
      const m = await page.evaluate(() => {
        const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
        const links = Array.from(document.querySelectorAll(".nav-links > li > a")).map((a) => a.getBoundingClientRect());
        return { logo: r(".nav-logo").right, first: links[0].left, last: links[links.length - 1].right, tools: r(".nav-tools").left, tall: Math.max(...links.map((b) => b.height)), n: links.length, sw: document.documentElement.scrollWidth, iw: window.innerWidth };
      });
      expect(m.n, `${locale} ${width}`).toBe(7);
      expect(m.first, `${locale} ${width}`).toBeGreaterThan(m.logo);
      expect(m.last, `${locale} ${width}`).toBeLessThanOrEqual(m.tools);
      expect(m.tall, `${locale} ${width}: a link wrapped`).toBeLessThanOrEqual(42);
      expect(m.sw).toBeLessThanOrEqual(m.iw + 1);
      await ctx.close();
    }
  }
  // below 1240 px the menu button takes over
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, baseURL });
  const page = await ctx.newPage();
  await page.goto("/core-concepts");
  await expect(page.getByTestId("menu-toggle")).toBeVisible();
  await ctx.close();
});

/** Puts the panel under the sticky nav's height, drops focus and hover, so captures show the canvas alone. */
async function frameForCapture(page: Page, id: string) {
  await page.evaluate((tid) => {
    (document.activeElement as HTMLElement | null)?.blur();
    const el = document.querySelector(`[data-testid="${tid}"]`)!;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 96);
  }, `${id}-panel`);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(200);
}

test("still frame of every step, captured for review (e2e/screenshots/concepts-*)", async ({ browser, baseURL }, info) => {
  const mobile = info.project.name === "mobile";
  const sizes: { tag: string; viewport: { width: number; height: number }; steps: number[] }[] = mobile
    ? [{ tag: "mobile", viewport: { width: 412, height: 915 }, steps: [0, 1, 2, 3] }, { tag: "360", viewport: { width: 360, height: 780 }, steps: [1, 2, 3] }]
    : [{ tag: "desktop", viewport: { width: 1440, height: 900 }, steps: [0, 1, 2, 3] }];
  for (const size of sizes) {
    const ctx = await browser.newContext({ reducedMotion: "reduce", baseURL, viewport: size.viewport });
    const page = await ctx.newPage();
    for (const locale of ["en", "fr"] as const) {
      await ctx.addCookies([{ name: "nymbus-locale", value: locale, url: baseURL! }]);
      await page.goto("/core-concepts");
      for (const id of IDS) {
        const panel = page.getByTestId(`${id}-panel`);
        await panel.scrollIntoViewIfNeeded();
        await expect(panel).toHaveClass(/\bon\b/);
        // FR: the last step only at desktop / mobile; every captured step at 360 px
        const steps = locale === "fr" && size.tag !== "360" ? [3] : size.steps;
        for (const k of steps) {
          await page.getByTestId(`${id}-step-${k}`).click();
          await expect(page.getByTestId(`${id}-host`)).toHaveAttribute("data-step", String(k));
          await frameForCapture(page, id);
          await panel.screenshot({ path: `e2e/screenshots/concepts-${id}-${locale}-step${k + 1}-${size.tag}.png` });
        }
      }
    }
    await ctx.close();
  }
});
