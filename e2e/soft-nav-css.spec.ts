import { expect, test, type Page } from "@playwright/test";

/**
 * The home tiles and the fund pages both style a `.fx-chip` (26px in home.css, 30px in fund.css). Each rule is scoped
 * with :where(), so after a client-side (soft) navigation, when both stylesheets are loaded, each page still shows its
 * own chip height. A window marker proves no full reload happened.
 */
const height = (page: Page, selector: string) => page.locator(selector).first().evaluate((el) => getComputedStyle(el).height);

test("soft navigation home → fund → home keeps each page's .fx-chip height", async ({ page }) => {
  await page.goto("/");
  const tile = page.getByTestId("strategy-monthly-income").first();
  await tile.scrollIntoViewIfNeeded();
  expect(await height(page, '[data-testid="strategy-monthly-income"] .fx-chip')).toBe("26px");
  await page.evaluate(() => { (window as unknown as { __soft: boolean }).__soft = true; });

  await tile.click();
  await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  await expect(page.getByTestId("sample-chip")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __soft?: boolean }).__soft)).toBe(true);
  expect(await height(page, '.fund-page [data-testid="sample-chip"]')).toBe("30px");

  await page.locator("a.nav-logo:visible").first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("strategy-monthly-income").first()).toBeAttached();
  expect(await page.evaluate(() => (window as unknown as { __soft?: boolean }).__soft)).toBe(true);
  expect(await height(page, '[data-testid="strategy-monthly-income"] .fx-chip')).toBe("26px");
});
