import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * Fund detail pages (/strategies/<fund key>) rendered against the illustrative sample data
 * (SHOW_SAMPLE_DATA=1 in the e2e server env, empty data volume).
 */
const FUNDS = [
  { slug: "monthly-income", en: "Nymbus Monthly Income Fund", fr: "Fonds Nymbus Revenu Mensuel", gross: false, classes: true },
  { slug: "sustainable-enhanced-bonds", en: "Nymbus Sustainable Enhanced Bonds Fund", fr: "Fonds Nymbus Obligations Durables Bonifiées", gross: false, classes: true },
  { slug: "multi-strategy", en: "Nymbus Multi-Strategy Fund", fr: "Fonds Nymbus Multistratégies", gross: false, classes: true },
  // managed accounts, not a fund: gross figures, no FundServ classes
  { slug: "global-minimum-volatility", en: "Nymbus Global Minimum Volatility", fr: "Nymbus Global Minimum Volatilité", gross: true, classes: false },
];

/** Scroll the whole page so lazily mounted charts and reveals run. */
async function scrollThrough(page: Page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
}

for (const f of FUNDS) {
  test(`fund page renders: ${f.slug}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(`/strategies/${f.slug}`);
    expect(res?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1, name: f.en.toLowerCase() })).toBeVisible();
    // hero: since-inception figure and its label
    await expect(page.locator(".fx-bigfig")).toBeVisible();
    await expect(page.locator(".fx-bigfig")).toHaveText(/^−?\d+\.\d%$/, { timeout: 5_000 });
    await expect(page.getByTestId("hero-figure-label")).toContainText(f.gross ? "gross" : "net");
    await expect(page.getByTestId("basis")).toContainText(f.gross ? "gross of fees" : "net of fees");
    // sample data is flagged
    await expect(page.locator(".fx-ribbon")).toBeVisible();

    // trailing returns: chart mounts when scrolled near, one focusable group per period
    const chart = page.getByTestId("trailing-chart");
    await chart.scrollIntoViewIfNeeded();
    await expect(chart.locator("svg .cat").first()).toBeVisible();
    expect(await chart.locator("svg .cat").count()).toBeGreaterThan(0);
    await expect(page.getByTestId("trailing-table")).toBeAttached();

    // classes table (funds only)
    if (f.classes) {
      await page.getByTestId("classes-table").scrollIntoViewIfNeeded();
      await expect(page.getByTestId("classes-table")).toBeVisible();
      await expect(page.getByTestId("classes-table").locator("tbody tr.hl")).toHaveCount(1);
    } else {
      await expect(page.getByTestId("classes-table")).toHaveCount(0);
    }

    await expect(page.getByTestId("provenance")).toContainText("Updated daily");
    await scrollThrough(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    mkdirSync("e2e/screenshots", { recursive: true });
    await page.screenshot({ path: `e2e/screenshots/fund-${f.slug}-${info.project.name}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test("fund switcher links every fund", async ({ page }) => {
  await page.goto("/strategies/monthly-income");
  const dock = page.getByTestId("fund-dock");
  for (const f of FUNDS) await expect(dock.locator(`a[href="/strategies/${f.slug}"]`)).toHaveCount(1);
  await expect(dock.locator('a[aria-current="page"]')).toHaveAttribute("href", "/strategies/monthly-income");
});

test("legacy slug redirects to monthly income", async ({ page }) => {
  const res = await page.goto("/strategies/sustainable-enhanced-short-term-bonds");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  await expect(page.locator(".fx-bigfig")).toBeVisible();
});

test("unknown slug is a 404", async ({ page }) => {
  const res = await page.goto("/strategies/no-such-fund");
  expect(res?.status()).toBe(404);
});

test("FR toggle switches the labels", async ({ page }) => {
  await page.goto("/strategies/monthly-income");
  await expect(page.getByRole("heading", { name: "trailing returns" })).toBeAttached();
  const toggle = page.getByRole("button", { name: /toggle language|fr/i }).first();
  if (await toggle.isVisible().catch(() => false)) await toggle.click();
  else {
    // the site shell owns the toggle; fall back to the persisted choice it reads on load
    await page.evaluate(() => localStorage.setItem("nymbus-locale", "fr"));
    await page.reload();
  }
  await expect(page.getByRole("heading", { level: 1, name: "fonds nymbus revenu mensuel" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "rendements cumulatifs" })).toBeAttached();
  await expect(page.getByTestId("basis")).toHaveText("net de frais");
  // French number formatting: decimal comma and a (narrow) no-break space before %
  await expect(page.locator(".fx-bigfig")).toHaveText(/^−?\d+,\d\s%$/, { timeout: 5_000 });
});
