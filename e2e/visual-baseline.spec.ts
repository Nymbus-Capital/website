import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * Visual safety net for refactors: deterministic screenshots of every public page, compared run to run with
 * `node scripts/visual-diff.mjs <before-dir> <after-dir>` (see docs/HANDOFF.md § Visual diff).
 *
 * Determinism: reduced motion (canvases draw their still frame, entrances are skipped), finite animations finished
 * and infinite ones cancelled by Playwright, caret hidden, web fonts loaded, the sample data of the e2e server, and
 * every off-site request aborted (hotlinked portraits would otherwise depend on the network).
 *   e2e/screenshots/visual/<page>[-top|-bottom]-<project>.png   English pages (the original baseline set)
 *   e2e/screenshots/visual-fr/<page>-<project>.png              a few French pages
 *   e2e/screenshots/visual-motion/<canvas>-<project>.png        the animated canvases (motion on) at a fixed position
 *                                                               of a paused fake clock
 */
const PAGES = [
  { path: "/", name: "home" },
  { path: "/strategies", name: "strategies" },
  { path: "/core-concepts", name: "core-concepts" },
  { path: "/approach", name: "approach" },
  { path: "/sustainability", name: "sustainability" },
  { path: "/team", name: "team" },
  { path: "/solutions", name: "solutions" },
  { path: "/contact", name: "contact" },
  { path: "/legal", name: "legal" },
  { path: "/privacy", name: "privacy" },
  { path: "/strategies/monthly-income", name: "fund-monthly-income", fund: true },
  { path: "/strategies/sustainable-enhanced-bonds", name: "fund-sustainable-enhanced-bonds", fund: true },
  { path: "/strategies/multi-strategy", name: "fund-multi-strategy", fund: true },
  { path: "/strategies/global-minimum-volatility", name: "fund-global-minimum-volatility", fund: true },
];
const FR_PAGES = [
  { path: "/", name: "home" },
  { path: "/core-concepts", name: "core-concepts" },
  { path: "/strategies/monthly-income", name: "fund-monthly-income" },
];
/** animated canvases: page, host test id (carries data-running) and canvas test id */
const CANVASES = [
  { path: "/", name: "home-scan", host: "scan-host", canvas: "scan-canvas" },
  { path: "/", name: "home-engines", host: "overlay-host", canvas: "overlay-canvas" },
  { path: "/core-concepts", name: "concept-overlay", host: "overlay-host", canvas: "overlay-canvas" },
  { path: "/core-concepts", name: "concept-futures", host: "futures-host", canvas: "futures-canvas" },
  { path: "/core-concepts", name: "concept-coverage", host: "coverage-host", canvas: "coverage-canvas" },
];

for (const dir of ["visual", "visual-fr", "visual-motion"]) mkdirSync(`e2e/screenshots/${dir}`, { recursive: true });
const file = (dir: string, name: string, project: string) => `e2e/screenshots/${dir}/${name}-${project}.png`;
const opts = { animations: "disabled", caret: "hide" } as const;

/** Sampled pixels of a canvas with some ink (alpha above 8): 0 means a blank drawing. */
const ink = (page: Page, testId: string) =>
  page
    .getByTestId(testId)
    .first()
    .evaluate((c: HTMLCanvasElement) => {
      if (!c.width || !c.height) return 0;
      const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 8) n++;
      return n;
    });

async function open(page: Page, baseURL: string, path: string, locale: "en" | "fr") {
  const origin = new URL(baseURL).origin;
  await page.route(
    (url) => url.origin !== origin,
    (route) => route.abort(),
  );
  await page.context().addCookies([{ name: "nymbus-locale", value: locale, url: baseURL }]);
  await page.goto(path, { waitUntil: "networkidle" });
}

async function settle(page: Page) {
  // walk the page once so viewport-triggered content mounts, then come back to the top
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(800);
}

/** Every visible canvas the page drew (still frames under reduced motion) has ink: a blank one fails the run. */
async function expectCanvasesDrawn(page: Page) {
  const ids = await page
    .locator("canvas[data-testid]")
    .evaluateAll((cs) =>
      cs.filter((c) => c.getBoundingClientRect().width > 0).map((c) => c.getAttribute("data-testid")!),
    );
  for (const id of ids) expect(await ink(page, id), `${id} is blank`).toBeGreaterThan(100);
}

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  for (const p of PAGES) {
    test(`visual baseline: ${p.name}`, async ({ page, baseURL }, info) => {
      await open(page, baseURL!, p.path, "en");
      await settle(page);
      await expect(page.locator("h1").first()).toBeVisible();
      await expectCanvasesDrawn(page);
      const project = info.project.name;
      await page.screenshot({ ...opts, path: file("visual", p.name, project), fullPage: true });
      if (!p.fund) return;
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({ ...opts, path: file("visual", `${p.name}-top`, project) });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(300);
      await page.screenshot({ ...opts, path: file("visual", `${p.name}-bottom`, project) });
    });
  }

  for (const p of FR_PAGES) {
    test(`visual baseline (fr): ${p.name}`, async ({ page, baseURL }, info) => {
      await open(page, baseURL!, p.path, "fr");
      await settle(page);
      await expect(page.locator("html")).toHaveAttribute("lang", "fr");
      await expectCanvasesDrawn(page);
      await page.screenshot({ ...opts, path: file("visual-fr", p.name, info.project.name), fullPage: true });
    });
  }
});

test.describe("motion on, fake clock", () => {
  test.use({ reducedMotion: "no-preference" });

  for (const c of CANVASES) {
    test(`visual baseline (motion): ${c.name}`, async ({ page, baseURL }, info) => {
      // the engines read performance.now / requestAnimationFrame: a paused fake clock starts every engine at the same
      // instant, and runFor() advances them by the same number of frames on every run
      await page.clock.install({ time: new Date("2026-10-01T12:00:00Z") });
      await open(page, baseURL!, c.path, "en");
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      await page.clock.pauseAt(new Date("2026-10-01T13:00:00Z"));
      const host = page.getByTestId(c.host).first();
      await host.scrollIntoViewIfNeeded();
      await expect(host).toHaveAttribute("data-running", "true");
      await page.clock.runFor(4000);
      expect(await ink(page, c.canvas), `${c.canvas} is blank`).toBeGreaterThan(100);
      await page
        .getByTestId(c.canvas)
        .first()
        .screenshot({ ...opts, path: file("visual-motion", c.name, info.project.name) });
    });
  }
});
