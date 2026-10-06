import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * Visual safety net for refactors: deterministic screenshots of every public page, compared run to run with
 * `node scripts/visual-diff.mjs <before-dir> <after-dir>` (see docs/HANDOFF.md § Visual diff).
 *
 * Determinism: English, reduced motion (canvases draw their still frame, entrances are skipped), finite
 * animations finished and infinite ones cancelled by Playwright, caret hidden, web fonts loaded, the sample data
 * of the e2e server, and every off-site request aborted (hotlinked portraits would otherwise depend on the network).
 * Files: e2e/screenshots/visual/<page>[-top|-bottom]-<project>.png.
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

const DIR = "e2e/screenshots/visual";
mkdirSync(DIR, { recursive: true });

test.use({ reducedMotion: "reduce" });

async function prepare(page: Page, baseURL: string, path: string) {
  const origin = new URL(baseURL).origin;
  await page.route((url) => url.origin !== origin, (route) => route.abort());
  await page.context().addCookies([{ name: "nymbus-locale", value: "en", url: baseURL }]);
  await page.goto(path, { waitUntil: "networkidle" });
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

const file = (name: string, project: string) => `${DIR}/${name}-${project}.png`;
const opts = { animations: "disabled", caret: "hide" } as const;

for (const p of PAGES) {
  test(`visual baseline: ${p.name}`, async ({ page, baseURL }, info) => {
    await prepare(page, baseURL!, p.path);
    await expect(page.locator("h1").first()).toBeVisible();
    const project = info.project.name;
    await page.screenshot({ ...opts, path: file(p.name, project), fullPage: true });
    if (!p.fund) return;
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({ ...opts, path: file(`${p.name}-top`, project) });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    await page.screenshot({ ...opts, path: file(`${p.name}-bottom`, project) });
  });
}
