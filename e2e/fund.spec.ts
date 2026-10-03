import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";

/**
 * Fund detail pages (/strategies/<fund key>) rendered against the illustrative sample data
 * (SHOW_SAMPLE_DATA=1 in the e2e server env, empty data volume). Also saves full-page screenshots
 * (e2e/screenshots/fund-<slug>-<project>.png, and one per tab for two funds) for design review.
 */
// daily: the sample has a daily portfolio book (bond funds); the multi-strategy book is below the coverage thresholds
// series: radio buttons of the class selector (registry classes + classes with a NAV); dist: series with distributions;
// returns: the default class (F) has its own return series (Monthly Income F has none yet: "coming soon", FP has)
const FUNDS = [
  { slug: "monthly-income", en: "Nymbus Monthly Income Fund", fr: "Fonds Nymbus Revenu Mensuel", gross: false, series: 4, dist: 4, daily: true, green: false, returns: false },
  { slug: "sustainable-enhanced-bonds", en: "Nymbus Sustainable Enhanced Bonds Fund", fr: "Fonds Nymbus Obligations Durables Bonifiées", gross: false, series: 4, dist: 3, daily: true, green: true, returns: true },
  { slug: "multi-strategy", en: "Nymbus Multi-Strategy Fund", fr: "Fonds Nymbus Multistratégies", gross: false, series: 3, dist: 3, daily: false, green: false, returns: true },
  // managed accounts, not a fund: gross figures, no NAV / FundServ series, no distributions
  { slug: "global-minimum-volatility", en: "Nymbus Global Minimum Volatility", fr: "Nymbus Global Minimum Volatility", gross: true, series: 0, dist: 0, daily: false, green: false, returns: true },
];
const TABS = ["overview", "performance", "portfolio", "distributions", "awards", "documents"] as const;
const GMV_TABS = ["overview", "performance", "portfolio", "documents"] as const;

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

    // return badges with the class / basis label; a default class without its own series says "coming soon"
    const strip = page.getByTestId("return-strip");
    if (!f.returns) {
      await expect(strip.getByTestId("figures-soon")).toContainText("Performance figures for series F coming soon");
      await expect(strip.getByTestId("badge-SI")).toHaveCount(0);
      await page.getByTestId("nav-card").getByTestId("series-LDM001").click();
    }
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

    if (f.dist) {
      await openTab(page, "distributions");
      await expect(page.getByTestId("distributions")).toBeVisible();
      await expect(page.getByTestId("distributions-summary").locator(".ds-card")).toHaveCount(f.dist);
      await expect(page.getByTestId("distributions-summary").locator(".ds-card.hl")).toHaveCount(1);
      await expect(page.getByTestId("distributions-note")).toContainText("tax slips");
      await expect(page.getByTestId("distributions-history")).toBeVisible();
    } else {
      // managed accounts: no distributions tab
      await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]')).toHaveCount(0);
    }

    expect(errors).toEqual([]);
  });
}

for (const [slug, tabs] of [["monthly-income", TABS], ["global-minimum-volatility", GMV_TABS], ["sustainable-enhanced-bonds", ["portfolio", "distributions"]], ["multi-strategy", ["portfolio"]]] as const) {
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
  await expect(page.locator('[data-testid^="dist-class-"].hl')).toHaveCount(1);
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
  // the default class is F (LDM081)
  await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM081");
  await expect(card.getByTestId("series-LDM081")).toHaveAttribute("aria-checked", "true");
  await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.0397");
  await card.getByTestId("series-LDM001").click();
  await expect(card.getByTestId("series-LDM001")).toHaveAttribute("aria-checked", "true");
  await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM001");
  await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.1905");
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
  // Monthly Income F has no return series yet: its panels say "coming soon"
  await expect(page.getByTestId("perf-soon")).toBeAttached();
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
  await expect(page.getByTestId("figures-soon")).toContainText("Les rendements de la série F seront bientôt publiés");
  await page.getByTestId("series-LDM001").click();
  await expect(page.getByTestId("basis")).toContainText("après déduction des frais");
  await expect(page.getByTestId("class-type")).toHaveText("Série à notice d’offre");
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

/* ------------------------------------------------------------------ classes, variants, awards, calendar labels */

test("class selector: returns follow the class; F is the default; a class without its own series says coming soon", async ({ page }) => {
  await page.goto("/strategies/sustainable-enhanced-bonds");
  const card = page.getByTestId("nav-card");
  const strip = page.getByTestId("return-strip");
  await expect(card.getByTestId("series-LDM201")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("basis")).toContainText("Series F");
  const f = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  await card.getByTestId("series-LDM202").click();
  await expect(page.getByTestId("basis")).toContainText("Series H");
  const h = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  expect(h, "class H shows its own returns").not.toBe(f);
  // a class that has no series of its own: no figure at all, never F's
  await card.getByTestId("series-LDM205").click();
  await expect(strip.getByTestId("figures-soon")).toContainText("series A coming soon");
  await expect(strip.getByTestId("badge-SI")).toHaveCount(0);
  await openTab(page, "performance");
  await expect(page.getByTestId("perf-soon")).toContainText("series A coming soon");
  await expect(page.getByTestId("growth")).toHaveCount(0);
  await expect(page.getByTestId("calendar")).toHaveCount(0);
  await expect(page.getByTestId("risk")).toHaveCount(0);
  // back to F: everything returns
  await card.getByTestId("series-LDM201").click();
  await expect(page.getByTestId("calendar")).toBeVisible();
  await expect(page.getByTestId("risk")).toBeVisible();
});

test("class types: only classes whose type is known are labelled, with a disclosure sentence", async ({ page }) => {
  await page.goto("/strategies/monthly-income");
  const card = page.getByTestId("nav-card");
  await expect(card.getByTestId("class-type")).toHaveText("Prospectus class");
  await expect(card.getByTestId("class-type-note")).toContainText("simplified prospectus");
  await card.getByTestId("series-LDM001").click();
  await expect(card.getByTestId("class-type")).toHaveText("Offering memorandum class");
  await expect(card.getByTestId("class-type-note")).toContainText("offering memorandum");
  await expect(page.getByTestId("returns-class-type")).toHaveText("Offering memorandum class");
  // unknown type: nothing is said
  await card.getByTestId("series-LDM021").click();
  await expect(card.getByTestId("class-type")).toHaveCount(0);
  await expect(card.getByTestId("class-type-note")).toHaveCount(0);
  // the class table: the badge on the two classes whose type is known, none elsewhere
  await expect(page.getByTestId("class-type-LDM081")).toHaveText("Prospectus class");
  await expect(page.getByTestId("class-type-LDM001")).toHaveText("Offering memorandum class");
  await expect(page.getByTestId("class-type-LDM021")).toHaveCount(0);
  // SEB: no class has a known type yet: no label, no column
  await page.goto("/strategies/sustainable-enhanced-bonds");
  await expect(page.getByTestId("class-type")).toHaveCount(0);
  await expect(page.getByTestId("classes-table").locator("thead")).not.toContainText("Offered under");
});

test("Global Minimum Volatility: 3 / 6 / 9 % variants, default 6, no class selector, no NAV, no distributions", async ({ page }) => {
  await page.goto("/strategies/global-minimum-volatility");
  const sel = page.getByTestId("variant-selector");
  await expect(sel.getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
  await expect(sel.locator('[role="radio"]')).toHaveCount(3);
  await expect(page.getByTestId("nav-card")).toHaveCount(0);
  await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]')).toHaveCount(0);
  const read = async () => page.getByTestId("return-strip").getByTestId("badge-SI").locator(".fr-v").innerText();
  // the value counts up: wait until it is non-zero and stable
  const si = async () => {
    let last = "";
    await expect.poll(async () => { const v = await read(); const ok = v === last && !/^[+-]?0[.,]00/.test(v); last = v; return ok; }, { intervals: [300] }).toBe(true);
    return last;
  };
  const six = await si();
  await sel.getByTestId("variant-3").click();
  const three = await si();
  await sel.getByTestId("variant-9").click();
  const nine = await si();
  expect(new Set([six, three, nine]).size, "each variant has its own returns").toBe(3);
  await expect(page.getByTestId("basis")).toContainText("Target downside volatility 9%");
  await openTab(page, "performance");
  await expect(page.getByTestId("perf-context")).toContainText("9%");
  await sel.getByTestId("variant-6").click();
  expect(await si()).toBe(six);
});

test("awards and rankings: Fund Library rank and quartile with source and as-at date; Morningstar 5 stars on the bond funds only", async ({ page }) => {
  await page.goto("/strategies/sustainable-enhanced-bonds#awards");
  const tab = page.locator('[role="tabpanel"][data-panel="awards"]');
  await expect(tab).toBeVisible();
  await expect(tab.getByTestId("ranking-LDM201")).toContainText("Canadian Fixed Income");
  await expect(tab.getByTestId("ranking-LDM201")).toContainText("August 31, 2026");
  await expect(tab.getByTestId("rank-1Y")).toContainText("1 of 465");
  await expect(tab.getByTestId("rank-1M")).toContainText("4 of 486");
  await expect(tab.getByTestId("fundgrade")).toContainText("A");
  await expect(tab.getByTestId("ranking-LDM201").getByRole("link", { name: /Fund Library/ })).toHaveAttribute("href", /^https:\/\/www\.fundlibrary\.com\//);
  await expect(tab.getByTestId("morningstar")).toBeVisible();
  await expect(tab.getByTestId("morningstar")).toContainText("Series F");
  await expect(tab.getByTestId("awards-note")).toContainText("not guarantees");
  // no third-party logo images: wordmarks are text
  await expect(tab.locator("img")).toHaveCount(0);
  // the CIFSC category line of the facts comes from the ranking category
  await openTab(page, "overview");
  await expect(page.getByTestId("fund-facts")).toContainText("Canadian Fixed Income");
  // multi-strategy: a quartile 4 is shown as it is
  await page.goto("/strategies/multi-strategy#awards");
  await expect(page.getByTestId("rank-1M")).toContainText("127 of 144");
  await expect(page.getByTestId("rank-1M").locator(".aw-q")).toHaveText("Q4");
  await expect(page.getByTestId("morningstar")).toHaveCount(0);
  // GMV: no ranking, no tab
  await page.goto("/strategies/global-minimum-volatility");
  await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(0);
});

test("Morningstar on the overview of both bond funds: text rating (no official files in the repo), class, as-of date, source, attribution", async ({ page }) => {
  for (const slug of ["monthly-income", "sustainable-enhanced-bonds"]) {
    await page.goto(`/strategies/${slug}`);
    const block = page.locator('[role="tabpanel"][data-panel="overview"]').getByTestId("overview-morningstar");
    await expect(block, slug).toBeVisible();
    await expect(block.getByTestId("morningstar-text")).toHaveText("Morningstar Rating™: 5 stars");
    await expect(block.getByTestId("morningstar-class")).toContainText("Series F");
    await expect(block.getByTestId("morningstar-class")).toContainText("October 1, 2026");
    await expect(block.getByTestId("morningstar-source")).toHaveAttribute("href", /^https:\/\/global\.morningstar\.com\//);
    await expect(block.getByTestId("morningstar-attribution")).toContainText("© 2026 Morningstar");
    await expect(block.getByTestId("morningstar-attribution")).toContainText("Past performance does not predict future results");
    // official images absent: no image and no imitation graphic (no SVG stars)
    await expect(block.locator("img")).toHaveCount(0);
    await expect(block.locator(".ms-head svg, .aw-stars, [data-testid='morningstar-stars']")).toHaveCount(0);
    await expect(block.getByTestId("overview-morningstar-rating")).toHaveAttribute("data-official", "no");
    // the seeded RBC survey entry is a draft: never on the page
    await expect(page.getByTestId("tp-rbc-pfs")).toHaveCount(0);
  }
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  await page.reload();
  await expect(page.getByTestId("overview-morningstar").getByTestId("morningstar-text")).toHaveText(/^Cote Morningstar™\s:\s5 étoiles$/);
  await expect(page.getByTestId("overview-morningstar").getByTestId("morningstar-class")).toContainText("Série F");
  // not on the other funds
  for (const slug of ["multi-strategy", "global-minimum-volatility"]) {
    await page.goto(`/strategies/${slug}`);
    await expect(page.getByTestId("overview-morningstar"), slug).toHaveCount(0);
  }
});

test("solutions: the advisors section lists the confirmed, fresh rankings with source link and date (no draft)", async ({ page }) => {
  await page.goto("/solutions#advisor");
  const list = page.getByTestId("advisor-rankings");
  await expect(list).toBeVisible();
  await expect(list.getByTestId("advisor-rankings-sustainable-enhanced-bonds").getByTestId("advisor-item-morningstar")).toContainText("Morningstar Rating™: 5 stars");
  await expect(list.getByTestId("advisor-rankings-sustainable-enhanced-bonds").getByTestId("advisor-item-fundlibrary")).toContainText("August 31, 2026");
  for (const a of await list.locator("li a").all()) await expect(a).toHaveAttribute("href", /^https:\/\//);
  await expect(list.getByTestId("advisor-item-rbc-pfs")).toHaveCount(0);
  await expect(list.getByTestId("advisor-ms-attribution")).toContainText("Morningstar");
  await expect(list.locator("img")).toHaveCount(0);
});

test("calendar-year chart: a value label on every bar, none overlapping, no horizontal page scroll", async ({ page }) => {
  await page.goto("/strategies/global-minimum-volatility#performance");
  const chart = page.getByTestId("calendar");
  await chart.scrollIntoViewIfNeeded();
  const cats = chart.locator("svg .cat");
  await expect(cats.first()).toBeVisible();
  const n = await cats.count();
  expect(n).toBeGreaterThan(8);
  const labels = chart.locator("svg text.vl");
  await expect(labels).toHaveCount(n);
  // each label sits above its bar (below a negative one) and the labels do not overlap each other
  const boxes = await labels.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, text: e.textContent }; }));
  for (const b of boxes) expect(b.text).toMatch(/^[+−-]?\d+\.\d%$/);
  const sorted = [...boxes].sort((a, b) => a.l - b.l);
  for (let i = 1; i < sorted.length; i++) expect(sorted[i].l, `labels ${sorted[i - 1].text} / ${sorted[i].text}`).toBeGreaterThanOrEqual(sorted[i - 1].r - 0.5);
  // the bars of the chart stay inside the card (it scrolls sideways when narrow), the page never does
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  // accessible: every category keeps its text alternative with the value
  await expect(cats.first()).toHaveAttribute("aria-label", /\d/);
  // roving tabindex: a single category in the tab order
  await expect(chart.locator('svg .cat[tabindex="0"]')).toHaveCount(1);
});

/**
 * Performance class label (Gabriel 2026-10-01: the label must match the class of the data). The expected label is
 * read from the class code of the sample's own data (`performance.classCode`), never assumed: the sample is built as
 * if the dataplatform served SEB class F (PR #626); the class H rendering (what production shows before that) is
 * covered by the admin test that pins SEB to a class H run (admin.spec.ts). The NAV card keeps the register's own
 * series (LDM201 = F), independent of the returns' class.
 */
const SAMPLE = JSON.parse(readFileSync("src/lib/data/sample-site-data.json", "utf8")) as { funds: Record<string, { performance: { classCode?: string; returnClass?: string } | null }> };
const CLASS_OF: Record<string, Record<string, string>> = {
  "monthly-income": { STRATEGY: "FP" },
  "sustainable-enhanced-bonds": { STRATEGY: "F", STRATEGY_H: "H" },
  "multi-strategy": { STRATEGY: "F" },
};
const NO_HEADLINE_SERIES = new Set(["monthly-income"]);
const codeOf = (slug: string): string => CLASS_OF[slug][SAMPLE.funds[slug].performance!.classCode!];
/** "Series F" but not "Series FP" (and the other way round) */
const seriesRe = (word: string, code: string): RegExp => new RegExp(`${word} ${code}(?![A-Za-z])`);

for (const slug of Object.keys(CLASS_OF)) {
  test(`performance class label follows the data's class everywhere (EN + FR): ${slug}`, async ({ page }) => {
    const perf = SAMPLE.funds[slug].performance!;
    const code = codeOf(slug);
    expect(code, `class ${perf.classCode} has a label`).toBeTruthy();
    expect(perf.returnClass).toBe(code);
    const others = Object.values(CLASS_OF[slug]).filter((c) => c !== code);
    for (const [lang, word, fund] of [["en", "Series", "Fund"], ["fr", "Série", "Fonds"]] as const) {
      await page.goto(`/strategies/${slug}`);
      if (lang === "fr") {
        await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
        await page.reload();
      }
      // Monthly Income opens on class F (LDM081), which has no series yet: its returns are the FP class (LDM001)
      if (slug === "monthly-income") await page.getByTestId("nav-card").getByTestId("series-LDM001").click();
      const exact = seriesRe(word, code);
      // header return badges, overview returns, disclosures: this class, never another class of the fund
      for (const tid of ["basis", "overview-returns", "perf-class"]) {
        await expect(page.getByTestId(tid)).toContainText(exact);
        for (const o of others) await expect(page.getByTestId(tid)).not.toContainText(seriesRe(word, o));
      }
      // performance tab context line and growth chart legend
      await openTab(page, "performance");
      await expect(page.getByTestId("perf-context")).toContainText(exact);
      for (const o of others) await expect(page.getByTestId("perf-context")).not.toContainText(seriesRe(word, o));
      await page.getByTestId("growth").scrollIntoViewIfNeeded();
      await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(`${fund} (${word} ${code})`);
      if (slug === "sustainable-enhanced-bonds") {
        // the NAV card is the register's class LDM201 (F) whatever the class of the returns
        await openTab(page, "overview");
        await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM201");
      }
    }
  });
}

test("home tiles and the strategies index name the class of the returns (EN + FR)", async ({ page }) => {
  // the French label has a no-break space before « : » (matched as \s)
  for (const [lang, returns] of [["en", "Returns: Series"], ["fr", "Rendements\\s:\\sSérie"]] as const) {
    const label = (code: string): RegExp => new RegExp(`^${returns} ${code}$`);
    for (const p of ["/", "/strategies"]) {
      await page.goto(p);
      if (lang === "fr") {
        await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
        await page.reload();
      }
      for (const slug of Object.keys(CLASS_OF)) {
        const cls = page.getByTestId(`strategy-${slug}`).getByTestId("perf-class");
        // the tile shows the headline class's own returns only: none while that class has no series (Monthly Income F)
        if (NO_HEADLINE_SERIES.has(slug)) await expect(cls).toHaveCount(0);
        else await expect(cls).toHaveText(label(codeOf(slug)));
      }
      // a strategy without classes (GMV) shows none
      await expect(page.getByTestId("strategy-global-minimum-volatility").getByTestId("perf-class")).toHaveCount(0);
    }
    // the comparison table: every fund with a class, in registry order
    const cells = page.getByTestId("compare-table").getByTestId("perf-class");
    const shown = Object.keys(CLASS_OF).filter((k) => !NO_HEADLINE_SERIES.has(k));
    await expect(cells).toHaveCount(shown.length);
    for (const [i, slug] of shown.entries()) await expect(cells.nth(i)).toHaveText(label(codeOf(slug)));
  }
});
