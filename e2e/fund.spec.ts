import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * Fund detail pages (/strategies/<fund key>) rendered against the illustrative sample data
 * (SHOW_SAMPLE_DATA=1 in the e2e server env, empty data volume). Also saves full-page screenshots
 * (e2e/screenshots/fund-<slug>-<project>.png, and one per tab for two funds) for design review.
 */
// daily: the sample has a daily portfolio book (bond funds); the multi-strategy book is below the coverage thresholds
const FUNDS = [
  { slug: "monthly-income", en: "Nymbus Monthly Income Fund", fr: "Fonds Nymbus Revenu Mensuel", gross: false, series: 4, daily: true, green: false },
  { slug: "sustainable-enhanced-bonds", en: "Nymbus Sustainable Enhanced Bonds Fund", fr: "Fonds Nymbus Obligations Durables Bonifiées", gross: false, series: 3, daily: true, green: true },
  { slug: "multi-strategy", en: "Nymbus Multi-Strategy Fund", fr: "Fonds Nymbus Multistratégies", gross: false, series: 3, daily: false, green: false },
  // managed accounts, not a fund: gross figures, no NAV / FundServ series
  { slug: "global-minimum-volatility", en: "Nymbus Global Minimum Volatility", fr: "Nymbus Global Minimum Volatility", gross: true, series: 0, daily: false, green: false },
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
    // the provenance line names the source of the Portfolio tab: the daily holdings with their date, else the factsheet
    if (f.daily) {
      await expect(page.getByTestId("provenance")).toContainText("portfolio data from the daily holdings as of September 28, 2026");
      await expect(page.getByTestId("provenance")).not.toContainText("portfolio data from the monthly factsheet");
    } else {
      await expect(page.getByTestId("provenance")).toContainText("portfolio data from the monthly factsheet of August 2026");
    }
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

    // portfolio tab: the daily book with its date and source label, else the month-end factsheet
    await openTab(page, "portfolio");
    const source = page.getByTestId("portfolio-source");
    if (f.daily) {
      await expect(source).toHaveAttribute("data-source", "daily");
      await expect(source).toContainText("Daily portfolio data");
      await expect(page.getByTestId("portfolio-asof")).toHaveText("as of September 28, 2026");
      await expect(page.getByTestId("metric-duration")).toBeVisible();
      await expect(page.getByTestId("coverage-note")).toContainText("share of the bond holdings, by market value");
      await expect(page.getByTestId("breakdown-rating")).toBeVisible();
      await expect(page.getByTestId("holdings-table").locator("tbody tr")).toHaveCount(10);
      await expect(page.getByTestId("holdings-table").locator("thead")).toContainText("Coupon");
      // no breakdown is left alone in half a row (the SEB book has five: the last one takes the whole row)
      const panel = page.locator('[role="tabpanel"][data-panel="portfolio"]');
      const blocks = panel.locator(".bk-grid").first().locator(":scope > [data-testid^='breakdown-']");
      const n = await blocks.count();
      const grid = await panel.locator(".bk-grid").first().boundingBox();
      const last = await blocks.nth(n - 1).boundingBox();
      if (n % 2 === 1 && info.project.name === "desktop") expect(last!.width).toBeGreaterThan(grid!.width * 0.9);
      // every bar has a valid width within its track (never stretched by an invalid value)
      for (const bar of await panel.locator(".fx-hbar .b.fund").all()) {
        const [b, t] = await Promise.all([bar.boundingBox(), bar.locator("xpath=..").boundingBox()]);
        expect(b!.width).toBeLessThanOrEqual(t!.width + 0.5);
      }
    } else {
      await expect(source).toHaveAttribute("data-source", "factsheet");
      await expect(page.getByTestId("factsheet-month")).toContainText("August 2026");
    }
    await expect(page.getByTestId("holdings-table").locator("tbody tr").first()).toBeVisible();
    await expect(page.getByTestId("green-bonds")).toHaveCount(f.green ? 1 : 0);
    if (f.green) await expect(page.getByTestId("green-marker").first()).toBeVisible();

    // documents: nothing uploaded in e2e → regulatory list on request (funds) or the mandate-holder note
    await openTab(page, "documents");
    if (f.series) await expect(page.getByTestId("documents-on-request").locator(".dc-req-item")).toHaveCount(5);
    else await expect(page.getByTestId("documents-mandate")).toContainText("mandate holders");

    await openTab(page, "distributions");
    await expect(page.getByTestId("distributions")).toBeVisible();
    if (f.series) {
      await expect(page.getByTestId("distributions-summary").locator(".ds-card")).toHaveCount(f.series);
      await expect(page.getByTestId("distributions-summary").locator(".ds-card.hl")).toHaveCount(1);
      await expect(page.getByTestId("distributions-note")).toContainText("tax slips");
      await expect(page.getByTestId("distributions-history")).toBeVisible();
    } else {
      await expect(page.getByTestId("distributions-summary")).toHaveCount(0);
    }

    expect(errors).toEqual([]);
  });
}

for (const [slug, tabs] of [["monthly-income", TABS], ["global-minimum-volatility", TABS], ["sustainable-enhanced-bonds", ["portfolio", "distributions"]], ["multi-strategy", ["portfolio"]]] as const) {
  test(`every tab at rest (screenshots): ${slug}`, async ({ page }, info) => {
    await page.goto(`/strategies/${slug}`);
    for (const id of tabs) {
      await openTab(page, id);
      await settle(page);
      await shot(page, `${slug}-tab-${id}`, info.project.name);
    }
  });
}

test("distributions: per-series cards, history chart, calendar years and the full history behind a toggle", async ({ page }) => {
  await page.goto("/strategies/monthly-income#distributions");
  // the latest distribution of the series shown (not the end of the requested window)
  await expect(page.getByTestId("distributions-asof")).toHaveText("Data as of September 28, 2026");
  const fp = page.getByTestId("dist-class-LDM001");
  await expect(fp).toHaveClass(/hl/);
  // amounts with the series' own precision (6 decimals in the sample), so rows add up to the calendar totals
  await expect(fp.getByTestId("dist-last-amount")).toHaveText(/^\$0\.\d{6}$/);
  await expect(fp.getByTestId("dist-t12m")).toHaveText(/^\$0\.\d{6}$/);
  // the trailing 12 months end at the day the data were read (the response end date), not at the last distribution
  await expect(fp.getByTestId("dist-t12m-label")).toHaveText(/^12 months to Sept?\.? 29, 2026$/);
  await expect(fp.getByTestId("dist-t12m-label")).toHaveAttribute("title", "Total per unit of the distributions paid in the 12 months to September 29, 2026");
  await expect(page.getByTestId("dist-class-LDM011").getByTestId("dist-last-amount")).toHaveText(/^US\$0\.\d{4,6}$/);
  // cards of one row: the amounts start at the same height even when a series header wraps
  const tops = await page.getByTestId("distributions-summary").locator(".ds-amt").evaluateAll((els) => els.map((e) => [Math.round(e.getBoundingClientRect().top), Math.round((e.closest(".ds-card") as HTMLElement).getBoundingClientRect().top)]));
  const byRow = new Map<number, number[]>();
  for (const [amt, card] of tops) byRow.set(card, [...(byRow.get(card) ?? []), amt]);
  for (const amts of byRow.values()) expect(Math.max(...amts) - Math.min(...amts)).toBeLessThanOrEqual(1);
  // nothing clipped inside a card (amounts with 6 decimals and a currency prefix fit on phones)
  const overflow = await page.getByTestId("distributions-summary").locator(".ds-card").evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1 || [...e.querySelectorAll("*")].some((c) => c.getBoundingClientRect().right > e.getBoundingClientRect().right + 1)).map((e) => e.getAttribute("data-testid")));
  expect(overflow).toEqual([]);
  const wrapped = await page.getByTestId("distributions-summary").locator(".ds-amt").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height > 1.6 * parseFloat(getComputedStyle(e).lineHeight)).map((e) => e.textContent));
  expect(wrapped, "each amount on one line").toEqual([]);
  const history = page.getByTestId("distributions-history");
  await history.scrollIntoViewIfNeeded();
  const bars = page.getByTestId("distribution-chart").locator("svg .cat");
  await expect(bars).toHaveCount(24);
  // one tab stop for the chart (roving tabindex), on the latest distribution; arrows / Home / End move it
  await expect(page.getByTestId("distribution-chart").locator('svg .cat[tabindex="0"]')).toHaveCount(1);
  await expect(bars.nth(23)).toHaveAttribute("tabindex", "0");
  await bars.nth(23).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(bars.nth(22)).toBeFocused();
  await expect(bars.nth(22)).toHaveAttribute("tabindex", "0");
  await expect(bars.nth(23)).toHaveAttribute("tabindex", "-1");
  await page.keyboard.press("Home");
  await expect(bars.nth(0)).toBeFocused();
  await page.keyboard.press("End");
  await expect(bars.nth(23)).toBeFocused();
  await expect(page.getByTestId("dist-ytd")).toHaveCount(1);
  await expect(page.getByTestId("distributions-calendar").locator("tbody tr").first()).toContainText("2026");
  const rows = page.getByTestId("distributions-table").locator("tbody tr");
  await expect(rows).toHaveCount(12);
  const toggle = page.getByTestId("distributions-show-all");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(await rows.count()).toBeGreaterThan(12);
  // another series: its own history
  await page.getByTestId("dist-series-LDM021").click();
  await expect(page.getByTestId("dist-series-LDM021")).toHaveAttribute("aria-pressed", "true");
  await expect(rows.first()).toContainText("Sep 28, 2026");
  await expect(page.getByTestId("distributions-note")).not.toContainText(/yield/i);
});

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
  await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="portfolio"]').click();
  await expect(page.getByTestId("portfolio-source")).toContainText("Données quotidiennes du portefeuille");
  await expect(page.getByTestId("portfolio-asof")).toHaveText("au 28 septembre 2026");
  await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]').click();
  await expect(page.getByTestId("dist-class-LDM001").getByTestId("dist-last-amount")).toHaveText(/^0,\d{6}\s\$$/);
  await expect(page.getByTestId("provenance")).toContainText("données de portefeuille selon les positions quotidiennes au 28 septembre 2026");
});
