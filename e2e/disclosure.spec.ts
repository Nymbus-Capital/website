import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * Collapsible disclosures (src/components/site/Disclosure.tsx, Gabriel 2026-10-05): the walls of disclosure text are
 * collapsed to their first lines with a fade and a static arrow; the full text stays in the server HTML and the DOM,
 * opens on click / keyboard / "#disclosure", and prints in full. Saves screenshots for design review
 * (e2e/screenshots/disc-*-<project>.png).
 */
const FUND = "/strategies/monthly-income";
const FIRM_END = "only where they may lawfully be sold";

const box = (page: Page, id = "fund-disclosure") => page.getByTestId(id);
const clip = (b: Locator) => b.locator(".disc-clip");
const heights = (b: Locator) => clip(b).evaluate((c) => ({ shown: c.getBoundingClientRect().height, full: c.firstElementChild!.getBoundingClientRect().height }));

async function snap(page: Page, b: Locator, name: string, project: string) {
  mkdirSync("e2e/screenshots", { recursive: true });
  await b.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `e2e/screenshots/disc-${name}-${project}.png` });
}

test.beforeEach(async ({ page, baseURL }) => {
  await page.context().addCookies([{ name: "nymbus-locale", value: "en", url: baseURL! }]);
});

test("fund page: the bottom disclosures are collapsed with a fade and an arrow, the full text is in the HTML and the DOM", async ({ page, request }, info) => {
  // server HTML: collapsed by default and the whole text present (indexable, no layout shift on hydration)
  const html = await (await request.get(FUND)).text();
  expect(html).toContain('data-testid="fund-disclosure"');
  expect(html).toMatch(/data-disc="collapsed"[^>]*data-testid="fund-disclosure"|data-testid="fund-disclosure"[^>]*data-disc="collapsed"/);
  expect(html).toContain(FIRM_END);

  await page.goto(FUND);
  const b = box(page);
  await expect(b).toHaveAttribute("data-disc", "collapsed");
  const h = await heights(b);
  expect(h.shown).toBeLessThan(h.full - 40);
  expect(h.shown).toBeGreaterThan(80); // a few lines, the opening visible
  // fade (mask) on the clip; the clipped text is not hidden from assistive technology
  const mask = await clip(b).evaluate((c) => getComputedStyle(c).maskImage || getComputedStyle(c).getPropertyValue("-webkit-mask-image"));
  expect(mask).toContain("gradient");
  await expect(clip(b)).not.toHaveAttribute("aria-hidden", /.*/);
  await expect(page.getByTestId("firm-disclaimer")).toContainText(FIRM_END);
  await expect(page.getByTestId("ftse-notice")).toBeAttached();
  // the opening sentence is inside the visible part
  const firstTop = await b.locator(".disc-inner > p").first().evaluate((p) => p.getBoundingClientRect().top - p.closest(".disc-clip")!.getBoundingClientRect().top);
  expect(firstTop).toBeLessThan(10);
  // the arrow: a native button, centred on the bottom edge, static
  const t = page.getByTestId("fund-disclosure-toggle");
  await expect(t).toBeVisible();
  await expect(t).toHaveAttribute("aria-expanded", "false");
  await expect(t).toHaveAccessibleName("Show full text");
  const ctl = await t.getAttribute("aria-controls");
  expect(ctl && (await page.locator(`[id="${ctl}"]`).count())).toBe(1);
  const pos = await t.evaluate((el) => { const r = el.getBoundingClientRect(), p = el.parentElement!.getBoundingClientRect(); return { dx: Math.abs(r.left + r.width / 2 - (p.left + p.width / 2)), dy: r.top + r.height / 2 - p.bottom, anim: getComputedStyle(el).animationName }; });
  expect(pos.dx).toBeLessThan(2);
  expect(Math.abs(pos.dy)).toBeLessThan(4);
  expect(pos.anim).toBe("none");
  await snap(page, b, "fund-collapsed", info.project.name);

  // click: opens to full height, arrow flips, label changes; click again closes
  await t.click();
  await expect(b).toHaveAttribute("data-disc", "expanded");
  await expect(t).toHaveAttribute("aria-expanded", "true");
  await expect(t).toHaveAccessibleName("Show less");
  await expect.poll(async () => { const x = await heights(b); return Math.abs(x.shown - x.full); }).toBeLessThan(2);
  await snap(page, b, "fund-expanded", info.project.name);
  await t.click();
  await expect(b).toHaveAttribute("data-disc", "collapsed");
  await expect.poll(async () => { const x = await heights(b); return x.full - x.shown; }).toBeGreaterThan(40);

  // the collapsed box itself is clickable
  await clip(b).click({ position: { x: 40, y: 30 } });
  await expect(b).toHaveAttribute("data-disc", "expanded");
});

test("fund page: keyboard (Enter / Space) opens and closes the disclosures", async ({ page }) => {
  await page.goto(FUND);
  const b = box(page);
  const t = page.getByTestId("fund-disclosure-toggle");
  await t.focus();
  await page.keyboard.press("Enter");
  await expect(b).toHaveAttribute("data-disc", "expanded");
  await page.keyboard.press("Space");
  await expect(b).toHaveAttribute("data-disc", "collapsed");
  await expect(t).toBeFocused();
});

test("#disclosure opens the box: on load, on hashchange and from a same-page link", async ({ page }) => {
  await page.goto(`${FUND}#disclosure`);
  await expect(box(page)).toHaveAttribute("data-disc", "expanded");
  await expect(page.locator("#disclosure")).toBeInViewport();

  await page.goto(FUND);
  await expect(box(page)).toHaveAttribute("data-disc", "collapsed");
  await page.evaluate(() => { location.hash = "disclosure"; });
  await expect(box(page)).toHaveAttribute("data-disc", "expanded");

  // a link to the hash already in the URL (no hashchange) still opens it after the reader closed it
  await page.getByTestId("fund-disclosure-toggle").click();
  await expect(box(page)).toHaveAttribute("data-disc", "collapsed");
  await page.evaluate(() => { const a = document.createElement("a"); a.href = "#disclosure"; a.id = "e2e-link"; a.textContent = "go"; document.body.prepend(a); });
  await page.locator("#e2e-link").click();
  await expect(box(page)).toHaveAttribute("data-disc", "expanded");

  // the footer's own anchor
  await page.goto("/#disclaimers");
  await expect(box(page, "footer-disclosure")).toHaveAttribute("data-disc", "expanded");
});

test("find-in-page / focus: scrolling the clipped text into view opens the box", async ({ page }) => {
  await page.goto(FUND);
  await expect(box(page)).toHaveAttribute("data-disc", "collapsed");
  // what the browser does for a find-in-page match in the clipped part
  await page.getByTestId("ftse-notice").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(box(page)).toHaveAttribute("data-disc", "expanded");
  await expect(page.getByTestId("ftse-notice")).toBeInViewport();
});

test("print shows every disclosure in full, with no fade and no arrow", async ({ page }) => {
  await page.goto(FUND);
  await expect(box(page)).toHaveAttribute("data-disc", "collapsed");
  await page.emulateMedia({ media: "print" });
  for (const id of ["fund-disclosure", "footer-disclosure"]) {
    const b = box(page, id);
    const h = await heights(b);
    expect(Math.abs(h.shown - h.full)).toBeLessThan(2);
    expect(await clip(b).evaluate((c) => getComputedStyle(c).maskImage || "none")).toBe("none");
    await expect(page.getByTestId(`${id}-toggle`)).toBeHidden();
  }
  await page.emulateMedia({ media: "screen" });
});

test("short notes are not wrapped: no box, no fade, no arrow", async ({ page }) => {
  await page.goto("/");
  const note = page.locator(".hm-note").first();
  await expect(note).toBeAttached();
  expect(await note.evaluate((n) => !!n.closest('.disc:not([data-disc="plain"])'))).toBe(false);
  // the footer wall is collapsed on every page
  await expect(box(page, "footer-disclosure")).toHaveAttribute("data-disc", /^(collapsed|fits)$/);
});

test("another page (strategies) and French labels", async ({ page, baseURL }, info) => {
  await page.goto("/strategies");
  const f = box(page, "footer-disclosure");
  await expect(f).toHaveAttribute("data-disc", "collapsed");
  await snap(page, f, "footer-collapsed", info.project.name);

  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  await page.goto(FUND);
  const t = page.getByTestId("fund-disclosure-toggle");
  await expect(t).toHaveAccessibleName("Afficher le texte complet");
  await t.click();
  await expect(t).toHaveAccessibleName("Réduire");
  await expect(page.getByTestId("footer-disclosure-toggle")).toHaveAccessibleName("Afficher le texte complet");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("every disclosure is open and no arrow is shown", async ({ page }) => {
    await page.goto(FUND);
    for (const id of ["fund-disclosure", "footer-disclosure"]) {
      // no page script runs here: geometry through the protocol only
      const shown = (await clip(box(page, id)).boundingBox())!.height;
      const full = (await box(page, id).locator(".disc-inner").boundingBox())!.height;
      expect(Math.abs(shown - full)).toBeLessThan(2);
      await expect(page.getByTestId(`${id}-toggle`)).toBeHidden();
    }
  });
});
