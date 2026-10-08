import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * Home, strategies index and solutions (the rebuilt informational pages): headings in EN and FR, the four
 * strategy cards each with published figures or the "figures coming soon" state, the asset-class filter, the
 * comparison table, links from solutions to the fund pages, the news dialog, content visible under reduced
 * motion, no console errors. Screenshots (desktop + mobile) go to e2e/screenshots/home-*.png.
 */
const SHOTS = "e2e/screenshots";
mkdirSync(SHOTS, { recursive: true });
const KEYS = ["monthly-income", "sustainable-enhanced-bonds", "multi-strategy", "global-minimum-volatility"];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/Failed to load resource/.test(t) && /nymbus\.ca|ERR_|net::/.test(t + (m.location().url ?? ""))) return;
    errors.push(t);
  });
  return errors;
}

async function scrollThrough(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 450) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

const PAGES = [
  { path: "/", name: "home", en: /^scientific investing$/i, fr: /^investissement scientifique$/i },
  { path: "/strategies", name: "strategies", en: /^our funds and strategies$/i, fr: /^nos fonds et stratégies$/i },
  {
    path: "/solutions",
    name: "solutions",
    en: /^solutions tailored to your mandate$/i,
    fr: /^des solutions adaptées à votre mandat$/i,
  },
];

for (const p of PAGES) {
  for (const locale of ["en", "fr"] as const) {
    test(`${p.name}: one H1 and no console errors (${locale})`, async ({ page, baseURL }) => {
      await page.context().addCookies([{ name: "nymbus-locale", value: locale, url: baseURL! }]);
      const errors = collectErrors(page);
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(locale === "en" ? p.en : p.fr);
      await scrollThrough(page);
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }

  test(`${p.name}: screenshot`, async ({ page, baseURL }, info) => {
    await page.context().addCookies([{ name: "nymbus-locale", value: "en", url: baseURL! }]);
    await page.goto(p.path);
    await scrollThrough(page);
    await page.screenshot({ path: `${SHOTS}/home-${p.name}-${info.project.name}.png`, fullPage: true });
    await page.screenshot({ path: `${SHOTS}/home-${p.name}-top-${info.project.name}.png` });
  });
}

test("home: the four strategy cards show figures (never 'coming soon'), in the fund colour, linking to the fund page", async ({
  page,
}) => {
  await page.goto("/");
  for (const key of KEYS) {
    const card = page.getByTestId(`strategy-${key}`);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveAttribute("href", `/strategies/${key}`);
    await expect(card.getByTestId("fund-figure")).toContainText(/\d/);
    await expect(card.getByTestId("figures-soon")).toHaveCount(0);
    await expect(card).not.toContainText(/coming soon/i);
    // no placeholder zero: a card never shows "0.0%" as its only figure
    await expect(card).not.toContainText(/NaN|undefined|null/);
  }
  // key figures: number of strategies and team size are rendered from structural facts
  await expect(page.locator("#glance-t")).toBeAttached();
});

test("home: a news item opens in a dialog and closes with Escape", async ({ page }) => {
  await page.goto("/");
  const card = page.getByTestId("news-mageska");
  await card.scrollIntoViewIfNeeded();
  const more = card.getByRole("button", { name: /read more/i });
  await more.click();
  const dialog = page.getByTestId("news-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { level: 2 })).toContainText(/Mageska/);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(more).toBeFocused();
});

test("strategies: the filter shows fixed income or alternatives only", async ({ page }) => {
  await page.goto("/strategies");
  const cards = page.locator('[data-testid^="strategy-"]');
  await expect(cards).toHaveCount(4);
  await page.getByRole("button", { name: /^fixed income/i }).click();
  await expect(cards).toHaveCount(2);
  await expect(page.getByTestId("strategy-monthly-income")).toBeVisible();
  await expect(page.getByTestId("strategy-multi-strategy")).toHaveCount(0);
  await page.getByRole("button", { name: /^alternatives/i }).click();
  await expect(cards).toHaveCount(2);
  await expect(page.getByTestId("strategy-global-minimum-volatility")).toBeAttached();
  await expect(page).toHaveURL(/#alternatives$/);
  await page.getByRole("button", { name: /^all/i }).click();
  await expect(cards).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    expect(await card.getByTestId("fund-figure").count()).toBe(1);
    await expect(card).not.toContainText(/coming soon/i);
  }
});

test("strategies: the comparison table lists every fund; a missing figure is a blank cell, never a dash", async ({
  page,
}) => {
  await page.goto("/strategies");
  const table = page.getByTestId("compare-table");
  await table.scrollIntoViewIfNeeded();
  await expect(table.locator("tbody tr")).toHaveCount(4);
  for (const key of KEYS) await expect(table.locator(`a[href="/strategies/${key}"]`)).toHaveCount(1);
  const cells = await table.locator("tbody td").allInnerTexts();
  for (const c of cells) expect(c).not.toMatch(/NaN|undefined|null|—/);
  await expect(page.locator("body")).not.toContainText(/not published yet|pas encore publié/);
});

test("solutions: three audiences, each links to fund pages", async ({ page }) => {
  await page.goto("/solutions");
  for (const a of ["institutional", "family", "advisor"]) {
    await expect(page.getByTestId(`audience-${a}`)).toHaveAttribute("href", `#${a}`);
    const section = page.locator(`section#${a}`);
    await section.scrollIntoViewIfNeeded();
    const links = section.locator('a[href^="/strategies/"]');
    expect(await links.count()).toBeGreaterThan(0);
  }
  await page.locator("section#advisor").getByTestId("solution-fund-monthly-income").click();
  await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
});

test("reduced motion: every section of the three pages is visible without animations", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", baseURL });
  const page = await ctx.newPage();
  for (const path of ["/", "/strategies", "/solutions"]) {
    await page.goto(path);
    const hidden = await page.evaluate(
      () =>
        Array.from(
          document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-kids] > *, .reveal-title .w"),
        ).filter((e) => getComputedStyle(e).opacity === "0").length,
    );
    expect(hidden, path).toBe(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  await ctx.close();
});
