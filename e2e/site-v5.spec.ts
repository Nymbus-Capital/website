import { expect, test } from "@playwright/test";

/**
 * Site v5 (2026-10-04, Gabriel's requests): "protective overlay" naming with its qualifier, About page order
 * (people before values) and team changes, /solutions without the third-party rankings section, fund awards
 * (Morningstar, Fundata, RBC; Morningstar note as an info disclosure; tab only with a Fundata FundGrade A or B) and
 * the Global Minimum Volatility variants in the order 3 %, 6 %, 9 % with 6 % selected.
 */

const SHOTS = "e2e/screenshots";

test("about: the people come before the values; the protective-overlay name keeps its qualifier", async ({ page }, info) => {
  await page.goto("/team");
  const people = page.locator("#ab-people-t");
  const values = page.locator("#ab-val-t");
  await expect(people).toBeAttached();
  await expect(values).toBeAttached();
  const yPeople = await people.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const yValues = await values.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  expect(yPeople).toBeLessThan(yValues);
  await expect(page.getByTestId("about-overlay-note")).toContainText("designed to offset part of losses; they may not do so");
  const list = page.getByTestId("people");
  await list.scrollIntoViewIfNeeded();
  await expect(list).not.toContainText("Xavier Girard");
  await expect(list).not.toContainText("Jean-Philippe Lejeune");
  for (const img of ["/team/xavier-girard.webp", "/team/jean-philippe-lejeune.webp"]) {
    expect((await page.request.get(img)).status()).toBe(404);
  }
  await page.screenshot({ path: `${SHOTS}/v5-about-${info.project.name}.png`, fullPage: true });
});

test("approach: protective overlays named with the qualifier and the futures-exposure disclosure (FR too)", async ({ page, baseURL }) => {
  await page.goto("/approach");
  await expect(page.getByRole("heading", { level: 2, name: /why add a protective overlay/i })).toBeAttached();
  await expect(page.locator("body")).toContainText("Our protective overlay is designed to have low correlation with bonds in down months and to offset part of bond losses when volatility rises; it may not do so and can lose money.");
  await expect(page.locator("body")).toContainText("The overlay adds futures exposure on top of the underlying portfolio");
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  await page.goto("/approach");
  await expect(page.locator("body")).toContainText("Pourquoi ajouter une superposition protectrice");
});

test("solutions: no third-party rankings section", async ({ page }) => {
  await page.goto("/solutions");
  await expect(page.getByRole("heading", { name: /third-party rankings/i })).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/percentile|FundGrade|Morningstar Rating/);
  await expect(page.locator("body")).toContainText("Protective overlay");
});

test("fund awards: Morningstar → Fundata → RBC, official logos sized like Morningstar's, no 'Fund Library' label", async ({ page }, info) => {
  await page.goto("/strategies/sustainable-enhanced-bonds#awards");
  const tab = page.locator('[role="tabpanel"][data-panel="awards"]');
  await expect(tab).toBeVisible();
  const order = await tab.locator('[data-testid="awards-morningstar"], [data-testid="ranking-LDM201"], [data-testid="tp-rbc-pfs"]').evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")));
  expect(order).toEqual(["awards-morningstar", "ranking-LDM201", "tp-rbc-pfs"]);
  const fundata = tab.getByTestId("logo-fundata");
  await expect(fundata).toHaveAttribute("src", "/brand/third-party/fundata-logo.png");
  await expect(fundata).toHaveAttribute("alt", "Fundata");
  const rbc = tab.getByTestId("logo-rbc-pfs");
  await expect(rbc).toHaveAttribute("src", "/brand/third-party/rbc-logo.png");
  await expect(rbc).toHaveAttribute("alt", "RBC Investor Services");
  for (const img of [fundata, rbc]) expect(await img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
  const fb = (await fundata.boundingBox())!;
  expect(fb.width).toBeGreaterThanOrEqual(100);
  expect(fb.width).toBeLessThanOrEqual(130);
  const rb = (await rbc.boundingBox())!;
  expect(rb.height).toBeGreaterThanOrEqual(32);
  expect(rb.height).toBeLessThanOrEqual(40);
  await expect(tab).not.toContainText("Fund Library");
  await tab.getByTestId("ranking-LDM201").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/v5-awards-seb-${info.project.name}.png`, fullPage: true });
  // Monthly Income (FundGrade B): tab shown; Multi-Strategy (C) and GMV (none): no tab
  await page.goto("/strategies/monthly-income");
  await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(1);
  for (const slug of ["multi-strategy", "global-minimum-volatility"]) {
    await page.goto(`/strategies/${slug}`);
    await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]'), slug).toHaveCount(0);
    await expect(page.getByTestId("overview-morningstar"), slug).toHaveCount(0);
  }
});

test("Morningstar note: compact info button; hover / focus / tap opens the full text, Escape closes it", async ({ page, isMobile }, info) => {
  await page.goto("/strategies/monthly-income");
  const block = page.locator('[role="tabpanel"][data-panel="overview"]').getByTestId("overview-morningstar");
  await block.scrollIntoViewIfNeeded();
  const btn = block.getByTestId("overview-morningstar-rating-info-button");
  const pop = block.getByTestId("overview-morningstar-rating-info-text");
  await expect(btn).toHaveAccessibleName("Rating methodology and attribution");
  await expect(btn).toHaveAccessibleDescription(/Morningstar Rating™ reflects performance as of October 1, 2026.*© 2026 Morningstar Research Inc\./s);
  const id = await pop.getAttribute("id");
  await expect(btn).toHaveAttribute("aria-describedby", id!);
  await expect(btn).toHaveAttribute("aria-controls", id!);
  await expect(pop).toBeHidden();
  await expect(btn).toHaveAttribute("aria-expanded", "false");
  if (isMobile) {
    await btn.tap();
    await expect(pop).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/v5-morningstar-note-open-${info.project.name}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await btn.tap();
    await expect(pop).toBeHidden();
    await btn.tap();
    await expect(pop).toBeVisible();
    await page.getByRole("heading", { level: 1 }).tap();
    await expect(pop).toBeHidden();
  } else {
    await btn.hover();
    await expect(pop).toBeVisible();
    // hoverable: moving onto the note keeps it open
    await pop.hover();
    await expect(pop).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(pop).toBeHidden();
    await page.mouse.move(0, 0);
    // keyboard: focus opens, Escape closes, Enter pins
    await btn.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(btn).toBeFocused();
    await expect(pop).toBeVisible();
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await page.screenshot({ path: `${SHOTS}/v5-morningstar-note-open-${info.project.name}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(pop).toBeHidden();
    await page.keyboard.press("Enter");
    await expect(pop).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(pop).toBeHidden();
  }
});

test("Global Minimum Volatility: variants shown 3 %, 6 %, 9 %, with 6 % selected on every page", async ({ page, baseURL }, info) => {
  await page.goto("/strategies/global-minimum-volatility");
  const sel = page.getByTestId("variant-selector");
  await expect(sel.locator('[role="radio"]')).toHaveText([/3%/, /6%/, /9%/]);
  await expect(sel.getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("hero-variant")).toHaveText("6% downside volatility");
  await expect(page.getByTestId("disclosure-variant")).toHaveText("6% downside volatility");
  await page.screenshot({ path: `${SHOTS}/v5-gmv-${info.project.name}.png` });
  await page.goto("/strategies");
  await expect(page.locator("body")).toContainText("6% downside volatility");
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  await page.goto("/strategies/global-minimum-volatility");
  await expect(page.getByTestId("variant-selector").locator('[role="radio"]')).toHaveText([/3\s%/, /6\s%/, /9\s%/]);
  await expect(page.getByTestId("variant-selector").getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
});
