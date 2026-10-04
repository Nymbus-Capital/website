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
