import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";

/**
 * Fund detail pages (/strategies/<fund key>) rendered against the illustrative sample data
 * (SHOW_SAMPLE_DATA=1 in the e2e server env, empty data volume). Also saves full-page screenshots
 * (e2e/screenshots/fund-<slug>-<project>.png, and one per tab for two funds) for design review.
 */
// daily: the sample has a daily portfolio book (bond funds); the multi-strategy book is below the coverage thresholds
// series: radio buttons of the class selector (registry classes + classes with a NAV); dist: series with distributions;
// returns: the default class (F) has its own return series (compounded by the website from the dataplatform daily NAV chain)
const FUNDS = [
  {
    slug: "monthly-income",
    en: "Nymbus Monthly Income Fund",
    fr: "Fonds Nymbus Revenu Mensuel",
    gross: false,
    series: 6,
    dist: 6,
    daily: true,
    green: false,
    returns: true,
  },
  {
    slug: "sustainable-enhanced-bonds",
    en: "Nymbus Sustainable Enhanced Bonds Fund",
    fr: "Fonds Nymbus Obligations Durables Bonifiées",
    gross: false,
    series: 6,
    dist: 6,
    daily: true,
    green: true,
    returns: true,
  },
  {
    slug: "multi-strategy",
    en: "Nymbus Multi-Strategy Fund",
    fr: "Fonds Nymbus Multistratégies",
    gross: false,
    series: 5,
    dist: 5,
    daily: false,
    green: false,
    returns: true,
  },
  // managed accounts, not a fund: gross figures, no NAV / FundServ series, no distributions
  {
    slug: "global-minimum-volatility",
    en: "Nymbus Global Minimum Volatility",
    fr: "Nymbus Global Minimum Volatility",
    gross: true,
    series: 0,
    dist: 0,
    daily: false,
    green: false,
    returns: true,
  },
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

    // return badges with the class / basis label: the page opens on a class with its own figures (never "coming soon")
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
    // the as-of line: dates only, never the data source (owner 2026-10-07)
    await expect(page.getByTestId("provenance")).toContainText(
      f.daily ? "Portfolio data as of September 28, 2026" : "Portfolio data as of August 31, 2026",
    );
    await expect(page.getByTestId("provenance")).not.toContainText(/factsheet|data platform|holdings/i);
    await expect(page.locator("#disclosure")).toBeVisible();
    // Gabriel 2026-10-04: the disclosures are the last block of the page — after the call to action and the other
    // strategies, immediately above the site footer
    const bottom = await page.evaluate(() => {
      const d = document.getElementById("disclosure")!;
      const after = (el: Element | null) =>
        !!el && !!(d.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
      const main = document.querySelector("main")!;
      const visibleAfter = [...main.querySelectorAll("*")].filter(
        (el) => after(el) && !d.contains(el) && el.getBoundingClientRect().height > 0,
      );
      const before = (sel: string) => {
        const el = document.querySelector(sel);
        return !!el && !!(el.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_FOLLOWING);
      };
      return {
        afterCta: before(".cta-band"),
        afterOthers: before('[data-testid="other-funds"]'),
        visibleAfter: visibleAfter.map((el) => el.tagName + (el.id ? `#${el.id}` : "")),
        footerNext: main.nextElementSibling?.tagName ?? null,
      };
    });
    expect(bottom).toEqual({ afterCta: true, afterOthers: true, visibleAfter: [], footerNext: "FOOTER" });

    await settle(page);
    await shot(page, f.slug, info.project.name);
    // the bottom of the page (other strategies, disclosures, footer) for design review
    // the end of the disclosures and the top of the footer
    await page.evaluate(() => {
      const f = document.querySelector("footer")!;
      window.scrollTo(0, f.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.6);
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `e2e/screenshots/fund-${f.slug}-bottom-${info.project.name}.png` });

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
      await expect(page.getByTestId("portfolio-asof")).toHaveText("As of September 28, 2026");
      await expect(source).not.toContainText(/daily|factsheet/i);
      await expect(page.getByTestId("metric-duration")).toBeVisible();
      // the synthetic books hold futures: duration and yield are labelled as those of the bond holdings only
      await expect(page.getByTestId("metric-scope-duration")).toContainText("bond holdings only, excluding futures");
      await expect(page.getByTestId("metric-scope-rating")).toHaveCount(0);
      // a coverage footnote only where a characteristic is below full coverage (Monthly Income: one stale price)
      if (f.slug === "monthly-income")
        await expect(page.getByTestId("coverage-note")).toContainText("share of the bond holdings, by market value");
      else await expect(page.getByTestId("coverage-note")).toHaveCount(0);
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
      await expect(page.getByTestId("factsheet-month")).toHaveText("As of August 31, 2026");
      await expect(source).not.toContainText(/factsheet/i);
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

for (const [slug, tabs] of [
  ["monthly-income", TABS],
  ["global-minimum-volatility", GMV_TABS],
  ["sustainable-enhanced-bonds", ["portfolio", "distributions"]],
  ["multi-strategy", ["portfolio"]],
] as const) {
  test(`every tab at rest (screenshots): ${slug}`, async ({ page }, info) => {
    await page.goto(`/strategies/${slug}`);
    for (const id of tabs) {
      await openTab(page, id);
      await settle(page);
      await shot(page, `${slug}-tab-${id}`, info.project.name);
    }
  });
}

test("distributions: per-series cards, history chart, calendar years and the full history behind a toggle", async ({
  page,
}) => {
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
  await expect(fp.getByTestId("dist-t12m-label")).toHaveAttribute(
    "title",
    "Total per unit of the distributions paid in the 12 months to September 29, 2026",
  );
  await expect(page.getByTestId("dist-class-LDM011").getByTestId("dist-last-amount")).toHaveText(/^US\$0\.\d{4,6}$/);
  // cards of one row: the amounts start at the same height even when a series header wraps
  const tops = await page
    .getByTestId("distributions-summary")
    .locator(".ds-amt")
    .evaluateAll((els) =>
      els.map((e) => [
        Math.round(e.getBoundingClientRect().top),
        Math.round((e.closest(".ds-card") as HTMLElement).getBoundingClientRect().top),
      ]),
    );
  const byRow = new Map<number, number[]>();
  for (const [amt, card] of tops) byRow.set(card, [...(byRow.get(card) ?? []), amt]);
  for (const amts of byRow.values()) expect(Math.max(...amts) - Math.min(...amts)).toBeLessThanOrEqual(1);
  // nothing clipped inside a card (amounts with 6 decimals and a currency prefix fit on phones)
  const overflow = await page
    .getByTestId("distributions-summary")
    .locator(".ds-card")
    .evaluateAll((els) =>
      els
        .filter(
          (e) =>
            e.scrollWidth > e.clientWidth + 1 ||
            [...e.querySelectorAll("*")].some(
              (c) => c.getBoundingClientRect().right > e.getBoundingClientRect().right + 1,
            ),
        )
        .map((e) => e.getAttribute("data-testid")),
    );
  expect(overflow).toEqual([]);
  const wrapped = await page
    .getByTestId("distributions-summary")
    .locator(".ds-amt")
    .evaluateAll((els) =>
      els
        .filter((e) => e.getBoundingClientRect().height > 1.6 * parseFloat(getComputedStyle(e).lineHeight))
        .map((e) => e.textContent),
    );
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
  // Monthly Income F has its own return series: the performance panel is server-rendered with it
  await expect(page.getByTestId("perf-context")).toBeAttached();
  await expect(page.getByTestId("perf-soon")).toHaveCount(0);
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
  // class F (LDM081) has its own returns, computed from its daily NAV chain
  await expect(page.getByTestId("basis")).toContainText(/Série F(?![A-Za-z])/);
  // a class launched less than 12 months ago: its NAV, and the chosen class's returns under that class's own label
  await page.getByTestId("series-LDM021").click();
  await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM021");
  await expect(page.getByTestId("basis")).toContainText(/Série F(?![A-Za-z])/);
  await expect(page.locator("body")).not.toContainText(
    /bientôt|à venir|non disponible|pas disponible|seront présentés lorsque/,
  );
  await page.getByTestId("series-LDM001").click();
  await expect(page.getByTestId("basis")).toContainText("après déduction des frais");
  await expect(page.getByTestId("class-type")).toHaveText("Série à notice d’offre");
  // decimal comma and a no-break space before % / $
  await expect(page.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+,\d{2}\s%$/);
  await expect(page.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^\d+,\d{4}\s\$$/);
  await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="portfolio"]').click();
  await expect(page.getByTestId("portfolio-asof")).toHaveText("Au 28 septembre 2026");
  await expect(page.getByTestId("portfolio-source")).not.toContainText(/quotidienn|fiche/i);
  await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]').click();
  await expect(page.getByTestId("dist-class-LDM001").getByTestId("dist-last-amount")).toHaveText(/^0,\d{6}\s\$$/);
  await expect(page.getByTestId("provenance")).toContainText("Données de portefeuille au 28 septembre 2026");
});

/* ------------------------------------------------------------------ classes, variants, awards, calendar labels */

test("class selector: returns follow the class; F is the default; a young class shows its NAV and F's returns, labelled F", async ({
  page,
}) => {
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
  // a class launched less than 12 months ago (regulatory minimum): never offered for returns, never a notice; its
  // NAV is shown and the returns are the chosen class's (F), under F's own label
  await card.getByTestId("series-LDM205").click();
  await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM205");
  await expect(page.getByTestId("basis")).toContainText(/Series F(?![A-Za-z])/);
  await expect(page.getByTestId("basis")).not.toContainText(/Series A(?![A-Za-z])/);
  await expect(strip.getByTestId("badge-SI").locator(".fr-v")).toHaveText(f);
  await expect(page.locator("body")).not.toContainText(
    /coming soon|will be shown once|not available|could not be verified/i,
  );
  await openTab(page, "performance");
  await expect(page.getByTestId("perf-context")).toContainText(/Series F(?![A-Za-z])/);
  await expect(page.getByTestId("growth")).toBeVisible();
  await expect(page.getByTestId("calendar")).toBeVisible();
  await expect(page.getByTestId("risk")).toBeVisible();
});

test("every series of a fund: own figures when it has them, a withheld period / year is omitted, no notice (EN + FR)", async ({
  page,
}) => {
  // Multi-Strategy class A: three valuation days never served by the source (October 2025, synthetic): that month cannot
  // be computed, so 1 year and since inception are not shown at all (no row, no dash), the rest is
  await page.goto("/strategies/multi-strategy");
  const card = page.getByTestId("nav-card");
  const strip = page.getByTestId("return-strip");
  const rows = page.getByTestId("overview-returns").locator("tbody tr");
  await card.getByTestId("series-LDM300").click();
  await expect(page.getByTestId("basis")).toContainText(/Series A(?![A-Za-z])/);
  await expect(rows.filter({ hasText: "3 months" }).locator("td").nth(1)).toHaveText(/^[−-]?\d+\.\d{2}%$/);
  await expect(rows.filter({ hasText: "1 year" })).toHaveCount(0);
  await expect(rows.filter({ hasText: "Since inception" })).toHaveCount(0);
  await expect(page.getByTestId("overview-returns")).not.toContainText("—");
  await expect(page.getByTestId("overview-withheld-note")).toHaveCount(0);
  await expect(strip.getByTestId("badge-SI")).toHaveCount(0);
  await expect(strip).not.toContainText("—");
  await expect(strip.getByTestId("strip-withheld-note")).toHaveCount(0);
  await openTab(page, "performance");
  await expect(page.getByTestId("perf-withheld-note")).toHaveCount(0);
  await page.getByTestId("growth").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("growth-from")).toHaveText("Starts on October 31, 2025.");
  await page.getByTestId("calendar").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("calendar-table")).not.toContainText("—");
  // the heat map: the year with the missing month (2025) is not shown; no empty month inside the record
  await page.getByTestId("heatmap").scrollIntoViewIfNeeded();
  const myears = page.getByTestId("heatmap").locator("tbody th.y");
  await expect(myears.first()).toBeVisible();
  const mshown = await myears.allInnerTexts();
  expect(mshown).not.toContain("2025");
  expect(mshown).toContain("2026");
  await expect(page.getByTestId("heat-withheld")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/could not be verified|figure not shown/i);

  await page.goto("/strategies/monthly-income");
  await openTab(page, "overview");
  // class J: since its inception (Oct 5, 2021); its synthetic source anomalies (a bad print reversed inside March 2022, a
  // drift in September 2023) are internal data-quality alerts now: every figure it has the history for is shown
  await card.getByTestId("series-LDM061").click();
  await expect(page.getByTestId("basis")).toContainText(/Series J(?![A-Za-z])/);
  await expect(card.getByTestId("nav-inception")).toHaveText("Oct 5, 2021");
  for (const p of ["1 year", "3 years", "Since inception"])
    await expect(rows.filter({ hasText: p }).locator("td").nth(1)).toHaveText(/^[−-]?\d+\.\d{2}%$/);
  await expect(page.getByTestId("overview-returns")).not.toContainText("—");
  await openTab(page, "performance");
  await expect(page.getByTestId("perf-inception")).toContainText("Series inception: October 5, 2021");
  await page.getByTestId("heatmap").scrollIntoViewIfNeeded();
  const years = page.getByTestId("heatmap").locator("tbody th.y");
  await expect(years.first()).toBeVisible();
  const shown = await years.allInnerTexts();
  for (const y of ["2022", "2023", "2024"]) expect(shown).toContain(y);
  // class F: a series with 12 months and no withheld month: every figure it has the history for
  await openTab(page, "overview");
  await card.getByTestId("series-LDM081").click();
  await expect(rows.filter({ hasText: "Since inception" }).locator("td").nth(1)).toHaveText(/^[−-]?\d+\.\d{2}%$/);
  // its first month is partial (from Mar 1, 2024): marked in the heat map; risk statistics from its first complete month
  await openTab(page, "performance");
  await page.getByTestId("heatmap").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("heat-partial")).toHaveCount(1);
  await page.getByTestId("risk").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("risk-window")).toHaveText("From Apr 2024");
  await openTab(page, "overview");
  // the track-record series (FP): its since-inception figure names the track-record start, never a series inception
  await card.getByTestId("series-LDM001").click();
  await expect(card.getByTestId("nav-inception")).toHaveCount(0);
  await expect(rows.filter({ hasText: "Since track-record start" }).locator("td").first()).toContainText(
    "Since track-record start (Jan 2019)",
  );
  // class A (launched less than 12 months ago) and the US-dollar class (no distribution-aware returns): their NAV, the
  // chosen class's returns under its own label (F), and never a sentence about why
  for (const code of ["LDM021", "LDM011"]) {
    await card.getByTestId(`series-${code}`).click();
    await expect(card.getByTestId("nav-fundserv")).toHaveText(code);
    await expect(page.getByTestId("basis")).toContainText(/Series F(?![A-Za-z])/);
    await expect(strip.getByTestId("badge-SI")).toBeVisible();
    await expect(page.getByTestId("overview-returns")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      /coming soon|will be shown once|not available|figures are not shown/i,
    );
  }
  // the series table gives every series' inception
  await expect(page.getByTestId("class-inception-LDM031")).toHaveText("Mar 6, 2023");
  // French
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  await page.reload();
  await page.getByTestId("nav-card").getByTestId("series-LDM021").click();
  await expect(page.getByTestId("basis")).toContainText(/Série F(?![A-Za-z])/);
  await expect(page.locator("body")).not.toContainText(
    /bientôt|à venir|non disponible|pas disponible|seront présentés lorsque|n’a pas pu être vérifié/,
  );
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

test("Global Minimum Volatility: 3 / 6 / 9 % variants, default 6, no class selector, no NAV, no distributions", async ({
  page,
}) => {
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
    await expect
      .poll(
        async () => {
          const v = await read();
          const ok = v === last && !/^[+-]?0[.,]00/.test(v);
          last = v;
          return ok;
        },
        { intervals: [300] },
      )
      .toBe(true);
    return last;
  };
  const six = await si();
  await sel.getByTestId("variant-3").click();
  const three = await si();
  await sel.getByTestId("variant-9").click();
  const nine = await si();
  expect(new Set([six, three, nine]).size, "each variant has its own returns").toBe(3);
  // every figure names its downside volatility variant: hero, return strip, overview, performance, chart legend, disclosure
  await expect(page.getByTestId("basis").getByTestId("variant-name")).toHaveText("9% downside volatility");
  await expect(page.getByTestId("hero-variant")).toHaveText("9% downside volatility");
  await expect(page.getByTestId("overview-variant")).toHaveText("9% downside volatility");
  await expect(page.getByTestId("disclosure-variant")).toHaveText("9% downside volatility");
  await openTab(page, "performance");
  await expect(page.getByTestId("perf-context").getByTestId("perf-variant")).toHaveText("9% downside volatility");
  await page.getByTestId("growth").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(
    "(9% downside volatility, gross of fees)",
  );
  await sel.getByTestId("variant-6").click();
  expect(await si()).toBe(six);
  await expect(page.getByTestId("hero-variant")).toHaveText("6% downside volatility");
  await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(
    "(6% downside volatility, gross of fees)",
  );
});

test("Global Minimum Volatility performance always names its variant: home, strategies index, compare table, solutions (EN + FR)", async ({
  page,
}) => {
  for (const [lang, name] of [
    ["en", /^6% downside volatility$/],
    ["fr", /^volatilité à la baisse de 6\s%$/],
  ] as const) {
    await page.goto("/");
    if (lang === "fr") {
      await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
      await page.reload();
    }
    const tile = page.getByTestId("strategy-global-minimum-volatility");
    await expect(tile.getByTestId("perf-variant-main")).toHaveText(name);
    await expect(tile.getByTestId("perf-variant")).toHaveText(name);
    // the other strategies have no variant
    await expect(page.getByTestId("strategy-monthly-income").getByTestId("perf-variant")).toHaveCount(0);
    await page.goto("/strategies");
    await expect(page.getByTestId("strategy-global-minimum-volatility").getByTestId("perf-variant")).toHaveText(name);
    await expect(page.getByTestId("compare-table").getByTestId("perf-variant")).toHaveCount(1);
    await expect(page.getByTestId("compare-table").getByTestId("perf-variant")).toHaveText(name);
    await page.goto("/solutions");
    await expect(page.getByTestId("solution-variant-global-minimum-volatility").first()).toHaveText(name);
    await page.goto("/strategies/global-minimum-volatility");
    await expect(page.getByTestId("basis").getByTestId("variant-name")).toHaveText(name);
    await expect(page.getByTestId("disclosure-variant")).toHaveText(name);
  }
});

test("awards and rankings: Morningstar, then Fundata rank and quartile with source and as-at date, then RBC; bond funds only (FundGrade A or B)", async ({
  page,
}) => {
  await page.goto("/strategies/sustainable-enhanced-bonds#awards");
  const tab = page.locator('[role="tabpanel"][data-panel="awards"]');
  await expect(tab).toBeVisible();
  await expect(tab.getByTestId("ranking-LDM201")).toContainText("Canadian Fixed Income");
  await expect(tab.getByTestId("ranking-LDM201")).toContainText("August 31, 2026");
  await expect(tab.getByTestId("rank-1Y")).toContainText("1 of 465");
  await expect(tab.getByTestId("rank-1M")).toContainText("4 of 486");
  await expect(tab.getByTestId("fundgrade")).toContainText("A");
  await expect(
    tab.getByTestId("ranking-LDM201").getByRole("link", { name: /Fundata \(FundLibrary\.com\)/ }),
  ).toHaveAttribute("href", /^https:\/\/www\.fundlibrary\.com\//);
  await expect(tab).not.toContainText("Fund Library");
  await expect(tab.getByTestId("morningstar")).toBeVisible();
  await expect(tab.getByTestId("morningstar")).toContainText("Series F");
  await expect(tab.getByTestId("awards-note")).toContainText("not guarantees");
  // the only images are the official files shipped in public/brand/third-party (Morningstar, Fundata, RBC; others: text)
  for (const src of await tab.locator("img").evaluateAll((els) => els.map((e) => e.getAttribute("src"))))
    expect(src).toMatch(/^\/brand\/third-party\/(morningstar-|fundata-logo\.png$|rbc-logo\.png$)/);
  // RBC Investor Services Pooled Fund Survey Q2 2026: fund-level, gross of management fees, percentiles per period
  const rbc = tab.getByTestId("tp-rbc-pfs");
  await expect(rbc).toContainText("RBC Investor Services Pooled Fund Survey — Q2 2026");
  await expect(rbc.getByTestId("tp-scope")).toHaveText(
    "Strategy track record since January 2019 (includes periods before the fund’s launch)",
  );
  await expect(rbc.getByTestId("tp-prelaunch")).toContainText("includes periods before the fund’s launch");
  await expect(rbc.getByTestId("tp-prelaunch").getByRole("link", { name: "See the disclosures" })).toHaveAttribute(
    "href",
    "#disclosure",
  );
  await expect(rbc).toContainText("Canadian Fixed Income");
  await expect(rbc).toContainText("June 30, 2026");
  await expect(rbc.getByTestId("tp-basis")).toContainText("gross of management fees, in Canadian dollars");
  for (const p of ["3M", "1Y", "2Y", "3Y", "5Y"])
    await expect(rbc.getByTestId(`tp-row-${p}`)).toContainText("1st percentile");
  await expect(rbc.getByTestId("tp-row-10Y")).toHaveCount(0);
  // "Four year periods ending June 30": rolling 4-year periods
  for (const y of ["2026", "2025", "2024", "2023"])
    await expect(rbc.getByTestId(`tp-rolling-4y-${y}`)).toContainText(`4 years to June 30, ${y}`);
  await expect(rbc).not.toContainText("1 year to June 30");
  await expect(page.getByTestId("tp-note")).toContainText("gross of management fees");
  await expect(rbc.getByRole("link", { name: /RBC Investor Services/ })).toHaveAttribute(
    "href",
    "https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q2_2026.pdf",
  );
  // returns are stored for reference, never sent to the page
  expect(await page.content()).not.toMatch(/\bror\b|sourceRef/);
  // the CIFSC category line of the facts comes from the ranking category
  await openTab(page, "overview");
  await expect(page.getByTestId("fund-facts")).toContainText("Canadian Fixed Income");
  // multi-strategy: Fundata FundGrade C, so no awards tab at all (and nothing in the payload); the CIFSC line stays
  await page.goto("/strategies/multi-strategy#awards");
  await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(0);
  await expect(page.getByTestId("awards")).toHaveCount(0);
  await expect(page.getByTestId("morningstar")).toHaveCount(0);
  expect(await page.content()).not.toContain("790333");
  await expect(page.getByTestId("fund-facts")).toContainText("Alternative Multi-Strategy");
  // GMV: no ranking, no tab
  await page.goto("/strategies/global-minimum-volatility");
  await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(0);
});

test("Morningstar on the overview of both bond funds: official logo and stars images, text alternative, class, as-of, source, attribution", async ({
  page,
}) => {
  for (const slug of ["monthly-income", "sustainable-enhanced-bonds"]) {
    await page.goto(`/strategies/${slug}`);
    const block = page.locator('[role="tabpanel"][data-panel="overview"]').getByTestId("overview-morningstar");
    await expect(block, slug).toBeVisible();
    const logo = block.getByTestId("morningstar-logo");
    const stars = block.getByTestId("morningstar-stars-img");
    await expect(logo).toHaveAttribute("src", "/brand/third-party/morningstar-logo.png");
    await expect(logo).toHaveAttribute("alt", "Morningstar");
    await expect(stars).toHaveAttribute("src", "/brand/third-party/morningstar-stars-5.png");
    await expect(stars).toHaveAttribute("alt", "Morningstar Rating™: 5 stars");
    // loaded, and sized for the layout (logo ~110-140 px wide, stars ~90-110 px)
    for (const img of [logo, stars])
      expect(await img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
    const lb = (await logo.boundingBox())!;
    const sb = (await stars.boundingBox())!;
    expect(lb.width).toBeGreaterThanOrEqual(105);
    expect(lb.width).toBeLessThanOrEqual(140);
    expect(sb.width).toBeGreaterThanOrEqual(85);
    expect(sb.width).toBeLessThanOrEqual(110);
    const panel = (await block.boundingBox())!;
    expect(lb.x + lb.width).toBeLessThanOrEqual(panel.x + panel.width);
    await expect(block.getByTestId("overview-morningstar-rating")).toHaveAttribute("data-official", "yes");
    // the text rating stays in the page for assistive technology
    await expect(block.getByTestId("morningstar-text")).toHaveText("Morningstar Rating™: 5 stars");
    await expect(block.getByTestId("morningstar-class")).toContainText("Series F");
    await expect(block.getByTestId("morningstar-class")).toContainText("October 1, 2026");
    await expect(block.getByTestId("morningstar-source")).toHaveAttribute(
      "href",
      /^https:\/\/global\.morningstar\.com\//,
    );
    // methodology and attribution in full behind the info note (site-v5.spec.ts tests its interaction)
    await expect(block.getByTestId("morningstar-attribution")).toBeHidden();
    await expect(block.getByTestId("morningstar-attribution")).toContainText("© 2026 Morningstar");
    await expect(block.getByTestId("morningstar-attribution")).toContainText(
      "Past performance does not predict future results",
    );
    // no drawn imitation
    await expect(block.locator(".ms-head svg, .aw-stars, [data-testid='morningstar-stars']")).toHaveCount(0);
  }
  const res = await page.request.get("/brand/third-party/morningstar-stars-5.png");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/png");
  expect(res.headers()["content-security-policy"]).toContain("sandbox");
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  await page.reload();
  await expect(page.getByTestId("overview-morningstar").getByTestId("morningstar-stars-img")).toHaveAttribute(
    "alt",
    /^Cote Morningstar™\s:\s5 étoiles$/,
  );
  await expect(page.getByTestId("overview-morningstar").getByTestId("morningstar-class")).toContainText("Série F");
  // not on the other funds
  for (const slug of ["multi-strategy", "global-minimum-volatility"]) {
    await page.goto(`/strategies/${slug}`);
    await expect(page.getByTestId("overview-morningstar"), slug).toHaveCount(0);
  }
});

test("Monthly Income: RBC survey 1-quarter rank is the 4th percentile (never '1st across all periods'); French labels", async ({
  page,
}) => {
  await page.goto("/strategies/monthly-income#awards");
  const rbc = page.getByTestId("tp-rbc-pfs");
  await expect(rbc).toContainText("Canadian Short Term Fixed Income");
  await expect(rbc.getByTestId("tp-row-3M")).toContainText("4th percentile");
  for (const p of ["1Y", "2Y", "3Y", "5Y"])
    await expect(rbc.getByTestId(`tp-row-${p}`)).toContainText("1st percentile");
  await expect(page.locator("body")).not.toContainText(/1st percentile (across|in) all periods/i);
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  await page.reload();
  await expect(rbc).toContainText("Canadian Short Term Fixed Income");
  await expect(rbc.getByTestId("tp-scope")).toContainText("Historique de la stratégie depuis janvier 2019");
  await expect(rbc.getByTestId("tp-prelaunch")).toContainText("5 octobre 2021");
  await expect(rbc.getByTestId("tp-rolling-4y-2023")).toContainText("4 ans au 30 juin 2023");
  await expect(rbc.getByTestId("tp-row-3M")).toContainText(/4e\scentile/);
  await expect(rbc.getByTestId("tp-basis")).toContainText("avant déduction des frais de gestion");
});

test("calendar-year chart: a value label on every bar, none overlapping, no horizontal page scroll", async ({
  page,
}) => {
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
  const boxes = await labels.evaluateAll((els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      return { l: r.left, r: r.right, t: r.top, b: r.bottom, text: e.textContent };
    }),
  );
  for (const b of boxes) expect(b.text).toMatch(/^[+−-]?\d+\.\d%$/);
  const sorted = [...boxes].sort((a, b) => a.l - b.l);
  for (let i = 1; i < sorted.length; i++)
    expect(sorted[i].l, `labels ${sorted[i - 1].text} / ${sorted[i].text}`).toBeGreaterThanOrEqual(
      sorted[i - 1].r - 0.5,
    );
  // the bars of the chart stay inside the card (it scrolls sideways when narrow), the page never does
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  // accessible: every category keeps its text alternative with the value
  await expect(cats.first()).toHaveAttribute("aria-label", /\d/);
  // roving tabindex: a single category in the tab order
  await expect(chart.locator('svg .cat[tabindex="0"]')).toHaveCount(1);
});

/**
 * Performance class label (Gabriel 2026-10-01: the label must match the class of the data). The expected label is
 * read from the sample's own data (`performanceByClass[<FundServ>].performance.returnClass`), never assumed. Pages open
 * on the default class F (its own series, from the dataplatform daily NAV chain); the track-record class (Monthly
 * Income FP, SEB H) is one click away. The NAV card keeps the register's own series, independent of the returns' class.
 */
type PerfLite = { classCode?: string; returnClass?: string } | null;
const SAMPLE = JSON.parse(readFileSync("src/lib/data/sample-site-data.json", "utf8")) as {
  funds: Record<
    string,
    { defaultClass?: string; performance: PerfLite; performanceByClass?: Record<string, { performance: PerfLite }> }
  >;
};
/** classes visited per fund: the default (F) and the track-record class; letters of every class of the fund */
const CLASS_OF: Record<string, { visit: string[]; letters: string[] }> = {
  "monthly-income": { visit: ["LDM081", "LDM001"], letters: ["F", "FP"] },
  "sustainable-enhanced-bonds": { visit: ["LDM201", "LDM202"], letters: ["F", "H"] },
  "multi-strategy": { visit: ["LDM301"], letters: ["F"] },
};
const classLetter = (slug: string, fs: string): string =>
  SAMPLE.funds[slug].performanceByClass![fs].performance!.returnClass!;
/** "Series F" but not "Series FP" (and the other way round) */
const seriesRe = (word: string, code: string): RegExp => new RegExp(`${word} ${code}(?![A-Za-z])`);

for (const slug of Object.keys(CLASS_OF)) {
  test(`performance class label follows the data's class everywhere (EN + FR): ${slug}`, async ({ page }) => {
    expect(SAMPLE.funds[slug].defaultClass).toBe(CLASS_OF[slug].visit[0]);
    for (const [lang, word, fund, net] of [
      ["en", "Series", "Fund", "net of fees"],
      ["fr", "Série", "Fonds", "après déduction des frais"],
    ] as const) {
      await page.goto(`/strategies/${slug}`);
      if (lang === "fr") {
        await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
        await page.reload();
      }
      for (const [i, fs] of CLASS_OF[slug].visit.entries()) {
        const code = classLetter(slug, fs);
        const others = CLASS_OF[slug].letters.filter((c) => c !== code);
        if (i > 0) {
          await openTab(page, "overview");
          await page.getByTestId("nav-card").getByTestId(`series-${fs}`).click();
        }
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
        await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(
          `${fund} (${word} ${code}, ${net})`,
        );
      }
      if (slug === "sustainable-enhanced-bonds") {
        // the NAV card is the register's class of the series selected, whatever the class of the returns
        await openTab(page, "overview");
        await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM202");
      }
    }
  });
}

test("home tiles and the strategies index name the class of the returns (EN + FR)", async ({ page }) => {
  // the French label has a no-break space before « : » (matched as \s)
  for (const [lang, returns] of [
    ["en", "Returns: Series"],
    ["fr", "Rendements\\s:\\sSérie"],
  ] as const) {
    const label = (code: string): RegExp => new RegExp(`^${returns} ${code}$`);
    for (const p of ["/", "/strategies"]) {
      await page.goto(p);
      if (lang === "fr") {
        await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
        await page.reload();
      }
      for (const slug of Object.keys(CLASS_OF)) {
        const cls = page.getByTestId(`strategy-${slug}`).getByTestId("perf-class");
        // the tile shows the chosen class's own returns (F for every fund in the sample: complete series)
        await expect(cls).toHaveText(label(classLetter(slug, SAMPLE.funds[slug].defaultClass!)));
      }
      // a strategy without classes (GMV) shows none
      await expect(page.getByTestId("strategy-global-minimum-volatility").getByTestId("perf-class")).toHaveCount(0);
    }
    // the comparison table: every fund with a class, in registry order
    const cells = page.getByTestId("compare-table").getByTestId("perf-class");
    const shown = Object.keys(CLASS_OF);
    await expect(cells).toHaveCount(shown.length);
    for (const [i, slug] of shown.entries())
      await expect(cells.nth(i)).toHaveText(label(classLetter(slug, SAMPLE.funds[slug].defaultClass!)));
  }
});

test("fee basis stated everywhere a return is shown: net for the funds, gross for Global Minimum Volatility (EN + FR)", async ({
  page,
}) => {
  for (const [slug, en, fr] of [
    ["sustainable-enhanced-bonds", "net of fees", "après déduction des frais"],
    ["global-minimum-volatility", "gross of fees", "avant déduction des frais"],
  ] as const) {
    for (const [lang, text] of [
      ["en", en],
      ["fr", fr],
    ] as const) {
      await page.context().clearCookies();
      await page.goto(`/strategies/${slug}`);
      if (lang === "fr") {
        await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
        await page.reload();
      }
      await openTab(page, "performance");
      await expect(page.getByTestId("perf-context")).toContainText(text);
      await expect(page.getByTestId("trailing-table").locator("thead")).toContainText(text);
      if (await page.getByTestId("calendar-table").count())
        await expect(page.getByTestId("calendar-table").locator("thead")).toContainText(text);
    }
  }
  // the comparison table: every figure carries its basis marker
  await page.context().clearCookies();
  await page.goto("/strategies");
  await expect(page.getByTestId("net-marker").first()).toBeAttached();
  await expect(page.getByTestId("gross-marker").first()).toBeAttached();
  await expect(page.getByTestId("net-marker").first()).toHaveAttribute("title", "net of fees");
});
