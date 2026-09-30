import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * Fund detail pages (/strategies/<fund key>) rendered against the illustrative sample data
 * (SHOW_SAMPLE_DATA=1 in the e2e server env, empty data volume). Also saves full-page screenshots
 * (e2e/screenshots/fund-<slug>-<project>.png, and one per tab for two funds) for design review.
 */
const FUNDS = [
  { slug: "monthly-income", en: "Nymbus Monthly Income Fund", fr: "Fonds Nymbus Revenu Mensuel", gross: false, series: 4 },
  { slug: "sustainable-enhanced-bonds", en: "Nymbus Sustainable Enhanced Bonds Fund", fr: "Fonds Nymbus Obligations Durables Bonifiées", gross: false, series: 3 },
  { slug: "multi-strategy", en: "Nymbus Multi-Strategy Fund", fr: "Fonds Nymbus Multistratégies", gross: false, series: 3 },
  // managed accounts, not a fund: gross figures, no NAV / FundServ series
  { slug: "global-minimum-volatility", en: "Nymbus Global Minimum Volatility", fr: "Nymbus Global Minimum Volatility", gross: true, series: 0 },
];
const TABS = ["overview", "performance", "portfolio", "distributions", "documents"] as const;

/** Scroll the whole page so lazily mounted charts and reveals run, then let the animations settle at the top. */
async function settle(page: Page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(70);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2600);
}

async function shot(page: Page, name: string, project: string) {
  mkdirSync("e2e/screenshots", { recursive: true });
  await page.screenshot({ path: `e2e/screenshots/fund-${name}-${project}.png`, fullPage: true });
}

async function openTab(page: Page, id: string) {
  await page.getByTestId("fund-tabs").locator(`[role="tab"][data-tab="${id}"]`).click();
  await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
}

for (const f of FUNDS) {
  test(`fund page renders: ${f.slug}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(`/strategies/${f.slug}`);
    expect(res?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1, name: f.en })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("sample-chip")).toBeVisible();

    // header card: NAV with a series selector (funds) or the strategy card (managed accounts)
    if (f.series) {
      const card = page.getByTestId("nav-card");
      await expect(card).toBeVisible();
      await expect(card.locator('[role="radio"]')).toHaveCount(f.series);
      await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^(US)?\$\d+\.\d{4}$/);
    } else {
      await expect(page.getByTestId("nav-card")).toHaveCount(0);
      await expect(page.getByTestId("strategy-card").locator(".odo .sr-only")).toHaveText(/^−?\d+\.\d%$/);
    }

    // return badges with the class / basis label
    const strip = page.getByTestId("return-strip");
    await expect(strip.getByTestId("badge-SI")).toBeVisible();
    await expect(strip.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+\.\d{2}%$/);
    await expect(page.getByTestId("basis")).toContainText(f.gross ? /gross of fees/i : /net of fees/i);

    // overview: facts, fees, returns table, team; series table for funds only
    await expect(page.getByTestId("fund-facts")).toBeVisible();
    await expect(page.getByTestId("fees")).toBeVisible();
    await expect(page.getByTestId("overview-returns").locator("tbody tr").first()).toBeVisible();
    if (f.series) await expect(page.getByTestId("classes-table").locator("tbody tr.hl")).toHaveCount(1);
    else await expect(page.getByTestId("classes-table")).toHaveCount(0);

    await expect(page.getByTestId("other-funds").locator("a")).toHaveCount(3);
    await expect(page.getByTestId("provenance")).toContainText("Updated daily");
    await expect(page.locator("#disclosure")).toBeVisible();

    await settle(page);
    await shot(page, f.slug, info.project.name);

    // performance tab: charts mount once shown
    await openTab(page, "performance");
    await expect(page).toHaveURL(/#performance$/);
    const chart = page.getByTestId("trailing-chart");
    await chart.scrollIntoViewIfNeeded();
    await expect(chart.locator("svg .cat").first()).toBeVisible();
    await expect(page.getByTestId("trailing-table")).toBeAttached();
    await expect(page.getByTestId("risk")).toBeVisible();

    // portfolio tab: from the factsheet
    await openTab(page, "portfolio");
    await expect(page.getByTestId("factsheet-month")).toContainText("August 2026");
    await expect(page.getByTestId("holdings-table").locator("tbody tr").first()).toBeVisible();

    // documents: nothing uploaded in e2e → regulatory list on request (funds) or the mandate-holder note
    await openTab(page, "documents");
    if (f.series) await expect(page.getByTestId("documents-on-request").locator(".dc-req-item")).toHaveCount(5);
    else await expect(page.getByTestId("documents-mandate")).toContainText("mandate holders");

    await openTab(page, "distributions");
    await expect(page.getByTestId("distributions")).toBeVisible();

    expect(errors).toEqual([]);
  });
}

for (const slug of ["monthly-income", "global-minimum-volatility"]) {
  test(`every tab at rest (screenshots): ${slug}`, async ({ page }, info) => {
    await page.goto(`/strategies/${slug}`);
    for (const id of TABS) {
      await openTab(page, id);
      await settle(page);
      await shot(page, `${slug}-tab-${id}`, info.project.name);
    }
  });
}

test("series selector switches the NAV card", async ({ page }) => {
  await page.goto("/strategies/monthly-income");
  const card = page.getByTestId("nav-card");
  await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM001");
  await card.getByTestId("series-LDM081").click();
  await expect(card.getByTestId("series-LDM081")).toHaveAttribute("aria-checked", "true");
  await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM081");
  await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.0397");
  await card.getByTestId("series-LDM011").click();
  await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^US\$\d+\.\d{4}$/);
});

test("tabs follow the URL hash and the keyboard", async ({ page }) => {
  await page.goto("/strategies/sustainable-enhanced-bonds#portfolio");
  const tabs = page.getByTestId("fund-tabs");
  await expect(tabs.locator('[role="tab"][data-tab="portfolio"]')).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("esg")).toBeVisible();
  await tabs.locator('[role="tab"][data-tab="portfolio"]').focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toHaveAttribute("aria-selected", "true");
  await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toBeFocused();
  // the header link selects the documents tab
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('.fh-actions a[href="#documents"]').click();
  await expect(tabs.locator('[role="tab"][data-tab="documents"]')).toHaveAttribute("aria-selected", "true");
});

test("without JavaScript every panel is on the page", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/strategies/monthly-income");
  await expect(page.getByRole("heading", { level: 1, name: "Nymbus Monthly Income Fund" })).toBeVisible();
  for (const id of TABS) await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
  await expect(page.getByTestId("trailing-table")).toBeAttached();
  await expect(page.getByTestId("holdings-table")).toBeVisible();
  await ctx.close();
});

test("legacy slug redirects to monthly income", async ({ page }) => {
  const res = await page.goto("/strategies/sustainable-enhanced-short-term-bonds");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  await expect(page.getByTestId("nav-card")).toBeVisible();
});

test("registry alias redirects to the canonical slug", async ({ page }) => {
  await page.goto("/strategies/gmv");
  await expect(page).toHaveURL(/\/strategies\/global-minimum-volatility$/);
});

test("unknown slug is a 404", async ({ page }) => {
  const res = await page.goto("/strategies/no-such-fund");
  expect(res?.status()).toBe(404);
});

test("French: labels, names and number formatting", async ({ page }) => {
  await page.goto("/strategies/monthly-income");
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Fonds Nymbus Revenu Mensuel" })).toBeVisible();
  await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="overview"]')).toHaveText("Aperçu");
  await expect(page.getByTestId("basis")).toContainText("après déduction des frais");
  // decimal comma and a no-break space before % / $
  await expect(page.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+,\d{2}\s%$/);
  await expect(page.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^\d+,\d{4}\s\$$/);
});
