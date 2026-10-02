import { expect, test, type Page } from "@playwright/test";

/**
 * Modal dialogs (team bios, news): centred in the viewport (not at the top-left, which Tailwind's margin reset caused),
 * page scroll locked while open, focus kept inside, Escape and backdrop close them, nothing overflows on a phone.
 */
async function settled(page: Page, testId: string) {
  await page.getByTestId(testId).evaluate((d) => Promise.all(d.getAnimations().map((a) => a.finished.catch(() => null))));
}

async function expectCentred(page: Page, testId: string) {
  await settled(page, testId);
  const r = await page.evaluate((id) => {
    const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
    const b = el.getBoundingClientRect();
    // the layout viewport (without the reserved scrollbar gutter) is what a fixed, inset:0 dialog centres in
    const w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
    return { cx: b.left + b.width / 2, cy: b.top + b.height / 2, w, h, left: b.left, right: b.right, top: b.top, bottom: b.bottom };
  }, testId);
  expect(Math.abs(r.cx - r.w / 2), `horizontal centre ${r.cx} vs ${r.w / 2}`).toBeLessThanOrEqual(2);
  expect(Math.abs(r.cy - r.h / 2), `vertical centre ${r.cy} vs ${r.h / 2}`).toBeLessThanOrEqual(2);
  expect(r.left).toBeGreaterThanOrEqual(0);
  expect(r.right).toBeLessThanOrEqual(r.w + 0.5);
  expect(r.top).toBeGreaterThanOrEqual(0);
  expect(r.bottom).toBeLessThanOrEqual(r.h + 0.5);
}

test("team: the bio dialog is centred in the viewport, locks the page scroll and traps focus", async ({ page }) => {
  await page.goto("/team");
  const people = page.getByTestId("people").locator(":scope > li");
  await people.first().scrollIntoViewIfNeeded();
  // scrolled away from the top: the dialog is still centred in the viewport, not on the page
  await page.evaluate(() => window.scrollBy(0, 300));
  const opener = people.nth(2).getByRole("button");
  await opener.click();
  const dialog = page.getByTestId("bio-dialog");
  await expect(dialog).toBeVisible();
  await expectCentred(page, "bio-dialog");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
  // focus stays inside the dialog whatever is tabbed
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    // inside the dialog, or nowhere (body: focus handed to the browser UI); never on the inert page behind it
    expect(await page.evaluate(() => { const a = document.activeElement; return !a || a === document.body || !!a.closest("dialog"); })).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  await expect(opener).toBeFocused();
});

test("team: the bio dialog closes from the backdrop and the close button", async ({ page }) => {
  await page.goto("/team");
  const people = page.getByTestId("people").locator(":scope > li");
  await people.first().scrollIntoViewIfNeeded();
  const dialog = page.getByTestId("bio-dialog");
  await people.first().getByRole("button").click();
  await expect(dialog).toBeVisible();
  await settled(page, "bio-dialog");
  await page.mouse.click(4, 4);
  await expect(dialog).toBeHidden();
  await people.first().getByRole("button").click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /close|fermer/i }).click();
  await expect(dialog).toBeHidden();
});

test("home: the news dialog is centred in the viewport", async ({ page }) => {
  await page.goto("/");
  const card = page.getByTestId("news-mageska");
  await card.scrollIntoViewIfNeeded();
  await card.getByRole("button", { name: /read more/i }).click();
  await expect(page.getByTestId("news-dialog")).toBeVisible();
  await expectCentred(page, "news-dialog");
});
