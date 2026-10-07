import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { BASE } from "./helpers";

/**
 * Contact form backend (POST /api/contact): the three steps with JavaScript, the native post without JavaScript, and
 * the API guards. Inquiries land in the e2e server's test-only data volume (SITE_DATA_DIR=./var-e2e); the admin tests
 * (admin.spec.ts, run after this file) read them. Every test uses its own client address (X-Forwarded-For) so the
 * per-client rate limit of one test never affects another.
 */

const SHOTS = "e2e/screenshots";
mkdirSync(SHOTS, { recursive: true });

/** a fresh documentation-range (2001:db8::/32) client address: tests run in parallel workers and must never share one */
/** a fresh client per call: the server buckets IPv6 by /64, so each call gets its own /64 */
const ip = () => `2001:db8:${randomBytes(2).toString("hex")}:${randomBytes(2).toString("hex")}::1`;

/** the form timing token rendered in the page (the server refuses posts made within 3 s of rendering) */
async function token(request: import("@playwright/test").APIRequestContext): Promise<string> {
  const html = await (await request.get("/contact")).text();
  const m = /name="t" value="(v1\.[^"]+)"/.exec(html);
  expect(m, "form token in the page").not.toBeNull();
  return m![1];
}

async function fillSteps(page: Page, name: string, fr = false) {
  const form = page.getByTestId("contact-form");
  const next = form.getByRole("button", { name: fr ? /^continuer/i : /^continue/i });
  await form.getByText(fr ? "Particulier" : "Individual investor", { exact: true }).click();
  await next.click();
  await form.getByText(fr ? "Demande générale" : "General inquiry", { exact: true }).click();
  await next.click();
  await page.getByLabel(fr ? "Nom complet" : "Full name").fill(name);
  await page.getByLabel(fr ? "Adresse courriel" : "Email address").fill("visitor@example.com");
  await page.getByLabel(fr ? /^Organisation/ : /^Organization/).fill("Example Pension Plan");
  await page.getByLabel(/^Message/).fill("Hello,\nI would like to learn more about your funds.");
}

test("contact: three steps validated, consent required, sent to the site (EN)", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip() });
  await page.goto("/contact");
  const form = page.getByTestId("contact-form");
  await form.scrollIntoViewIfNeeded();
  await expect(form).toHaveAttribute("data-live", "");
  // step 1: a profile is required
  await form.getByRole("button", { name: /^continue/i }).click();
  await expect(form.getByText("Please choose a profile.")).toBeVisible();
  await form.getByText("Individual investor", { exact: true }).click();
  await form.getByRole("button", { name: /^continue/i }).click();
  // step 2: at least one interest
  await expect(form.getByRole("group", { name: /what are you interested in/i })).toBeVisible();
  await form.getByRole("button", { name: /^continue/i }).click();
  await expect(form.getByText("Please choose at least one interest.")).toBeVisible();
  await form.getByText("Monthly Income", { exact: true }).click();
  await form.getByRole("button", { name: /^continue/i }).click();
  // step 3: name, a valid email and the consent
  const send = form.getByRole("button", { name: /send my message/i });
  await send.click();
  await expect(form.getByText("Please enter a valid email address.")).toBeVisible();
  await expect(form.getByText("Please give your consent.")).toBeVisible();
  await expect(form.getByTestId("contact-errors")).toHaveText("Please check: Full name, Email address, Consent");
  await expect(form.getByTestId("contact-errors")).toHaveAttribute("role", "alert");
  await expect(page.getByLabel("Full name")).toBeFocused(); // focus goes to the first field to fix
  await expect(form.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
  await page.getByLabel("Full name").fill(`E2E Visitor ${info.project.name}`);
  await page.getByLabel("Email address").fill("visitor@example.com");
  await page.getByLabel(/^Message/).fill("Hello, I would like to learn more about your funds.");
  await form.getByText(/I agree that Nymbus Capital uses these details only to answer my request/).click();
  await expect(page.getByTestId("contact-consent")).toBeChecked();
  await form.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/contact-step3-${info.project.name}.png`, fullPage: false });
  await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-form-step3-${info.project.name}.png` });
  await page.waitForTimeout(3200); // the timing token: no post within 3 s of the page render
  const posted = page.waitForResponse((r) => r.url().endsWith("/api/contact") && r.request().method() === "POST");
  await send.click();
  expect((await posted).status()).toBe(200);
  const sent = page.getByTestId("contact-sent");
  await expect(sent).toBeVisible();
  await expect(sent).toContainText("Message sent");
  await expect(page.locator(".ct-wrap [role=status]")).toHaveText("Message sent");
  await page.locator(".ct-card").screenshot({ path: `${SHOTS}/contact-sent-${info.project.name}.png` });
  // another message starts over at step 1
  await sent.getByRole("link", { name: /send another message/i }).click();
  await expect(page.getByTestId("contact-form")).toBeVisible();
  await expect(page.getByRole("group", { name: /who are you/i })).toBeVisible();
  // office details and the mailto / phone alternatives remain
  await expect(page.locator('a[href^="tel:+15149851138"]').first()).toBeVisible();
  await expect(page.locator('a[href^="mailto:info@nymbus.ca"]').first()).toBeAttached();
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("contact: French form, server-side field errors shown at their step", async ({ page, baseURL }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip() });
  await page.goto("/contact");
  await fillSteps(page, `E2E Visiteur ${info.project.name}`, true);
  const form = page.getByTestId("contact-form");
  await expect(form.getByText(/J’accepte que Nymbus Capital utilise ces renseignements uniquement/)).toBeVisible();
  await form.scrollIntoViewIfNeeded();
  await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-form-step3-fr-${info.project.name}.png` });
  // the send button's label fits inside the button and the button inside the form (phones: its own row)
  const send = form.locator('button[type="submit"]');
  expect(await send.evaluate((b) => b.scrollWidth <= b.clientWidth + 1)).toBe(true);
  const [fb, sb] = [await form.boundingBox(), await send.boundingBox()];
  expect(sb!.x).toBeGreaterThanOrEqual(fb!.x - 1);
  expect(sb!.x + sb!.width).toBeLessThanOrEqual(fb!.x + fb!.width + 1);
  // the server is the authority: a field it refuses (here forced through the API shape) comes back to its step
  await page.route("**/api/contact", (route) => route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "invalid_input", fields: ["interests"] }) }));
  await form.getByText(/J’accepte que Nymbus Capital/).click();
  await form.getByRole("button", { name: /envoyer mon message/i }).click();
  await expect(form.getByText("Veuillez choisir au moins un intérêt.")).toBeVisible();
  await page.unroute("**/api/contact");
  // a failure keeps the form and offers the e-mail instead
  await page.route("**/api/contact", (route) => route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: "rate_limited" }) }));
  await form.getByRole("button", { name: /^continuer/i }).click();
  await form.getByRole("button", { name: /envoyer mon message/i }).click();
  const fail = page.getByTestId("contact-fail");
  await expect(fail).toContainText("Trop de tentatives");
  await expect(fail.getByRole("link")).toHaveAttribute("href", /^mailto:info@nymbus\.ca\?subject=Demande%20du%20site%20Web/);
  await expect(page.getByLabel("Nom complet")).toHaveValue(`E2E Visiteur ${info.project.name}`);
  await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-fail-fr-${info.project.name}.png` });
  // once the server answers again, the same form is sent (French success state)
  await page.unroute("**/api/contact");
  await page.waitForTimeout(3200); // the timing token: no post within 3 s of the page render
  const posted = page.waitForResponse((r) => r.url().endsWith("/api/contact") && r.request().method() === "POST");
  await form.getByRole("button", { name: /envoyer mon message/i }).click();
  expect((await posted).status()).toBe(200);
  const sent = page.getByTestId("contact-sent");
  await expect(sent).toContainText("Message envoyé");
  await expect(sent.getByText("Message envoyé", { exact: true })).toBeFocused();
  await page.locator(".ct-card").screenshot({ path: `${SHOTS}/contact-sent-fr-${info.project.name}.png` });
});

test("contact: works without JavaScript (native post, redirect back with the result)", async ({ browser }, info) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", extraHTTPHeaders: { "x-forwarded-for": ip() }, ...(info.project.name === "mobile" ? { viewport: { width: 412, height: 915 } } : {}) });
  const page = await ctx.newPage();
  await page.goto("/contact");
  const form = page.getByTestId("contact-form");
  await expect(form).not.toHaveAttribute("data-live", "");
  // every step is shown; the browser validates the required fields itself
  await form.getByText("Financial advisor", { exact: true }).click();
  await form.getByText("General inquiry", { exact: true }).click();
  await page.getByLabel("Full name").fill(`E2E NoScript ${info.project.name}`);
  await page.getByLabel("Email address").fill("noscript@example.com");
  await form.getByText(/I agree that Nymbus Capital uses these details/).click();
  await page.waitForTimeout(3200);
  await form.getByRole("button", { name: /send my message/i }).click();
  await expect(page).toHaveURL(/\/contact\?sent=1/);
  await expect(page.getByTestId("contact-sent")).toBeVisible();
  // a field the server refuses comes back as its code only (never the value), with its message and the summary
  await page.goto("/contact");
  await form.getByText("Other", { exact: true }).click();
  await form.getByText("General inquiry", { exact: true }).click();
  await page.getByLabel("Full name").fill(`E2E NoScript bad phone ${info.project.name}`);
  await page.getByLabel("Email address").fill("noscript@example.com");
  await page.getByLabel(/^Phone/).fill("call me maybe");
  await form.getByText(/I agree that Nymbus Capital uses these details/).click();
  await page.waitForTimeout(3200);
  await form.getByRole("button", { name: /send my message/i }).click();
  await expect(page).toHaveURL(/\/contact\?error=invalid_input&fields=phone#contact-form$/);
  expect(page.url()).not.toMatch(/call|maybe|noscript/i);
  await expect(page.getByTestId("contact-errors")).toHaveText("Please check: Phone");
  await expect(page.getByText("Please check the phone number.")).toBeVisible();
  await expect(page.getByLabel(/^Phone/)).toHaveAttribute("aria-describedby", "ct-e-phone");
  // an error comes back the same way
  await page.goto("/contact?error=rate_limited");
  await expect(page.getByTestId("contact-fail")).toContainText("Too many attempts");
  await page.goto("/contact?error=<script>");
  await expect(page.getByTestId("contact-fail")).toContainText("Not sent");
  await ctx.close();
});

test.describe("POST /api/contact guards", () => {
  const valid = (t: string, name: string) => ({ profile: "Other", interests: ["General inquiry"], name, email: "api@example.com", phone: "", company: "", message: "From the API test", consent: true, website: "", t, lang: "en" });

  test("same origin, content type, size, method", async ({ request }) => {
    const xff = { "x-forwarded-for": ip() };
    const t = await token(request);
    const data = JSON.stringify(valid(t, "Guard Test"));
    expect((await request.post("/api/contact", { headers: { ...xff, "content-type": "application/json" }, data })).status(), "no Origin").toBe(403);
    expect((await request.post("/api/contact", { headers: { ...xff, origin: "https://evil.example", "content-type": "application/json" }, data })).status()).toBe(403);
    expect((await request.post("/api/contact", { headers: { ...xff, origin: BASE, "sec-fetch-site": "cross-site", "content-type": "application/json" }, data })).status()).toBe(403);
    expect((await request.post("/api/contact", { headers: { ...xff, origin: BASE, "content-type": "text/plain" }, data })).status()).toBe(415);
    const big = JSON.stringify({ ...valid(t, "Big"), message: "x".repeat(20_000) });
    expect((await request.post("/api/contact", { headers: { "x-forwarded-for": ip(), origin: BASE, "content-type": "application/json" }, data: big })).status()).toBe(413);
    expect((await request.get("/api/contact")).status()).toBe(405);
  });

  test("invalid fields are listed; bots get a fake success and nothing is stored", async ({ request }, info) => {
    const h = { "x-forwarded-for": ip(), origin: BASE, "content-type": "application/json" };
    const t = await token(request);
    await new Promise((r) => setTimeout(r, 3200));
    const bad = await request.post("/api/contact", { headers: h, data: JSON.stringify({ ...valid(t, "<b>x</b>"), email: "nope", consent: false, interests: ["Bitcoin"] }) });
    expect(bad.status()).toBe(400);
    expect((await bad.json()).fields).toEqual(["interests", "name", "email", "consent"]);
    // honeypot filled, or posted too fast with a fresh token, or without a token: 200 { ok: true }, not stored
    // (admin.spec.ts checks that "E2E Bot" never reaches the inquiries)
    const hp = await request.post("/api/contact", { headers: h, data: JSON.stringify({ ...valid(t, `E2E Bot honeypot ${info.project.name}`), website: "http://spam.example" }) });
    expect(hp.status()).toBe(200);
    expect(await hp.json()).toEqual({ ok: true });
    const fresh = await token(request);
    const fast = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": ip() }, data: JSON.stringify(valid(fresh, `E2E Bot fast ${info.project.name}`)) });
    expect(fast.status()).toBe(200);
    const none = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": ip() }, data: JSON.stringify(valid("", `E2E Bot token ${info.project.name}`)) });
    expect(none.status()).toBe(200);
  });

  test("per-client rate limit (5 attempts / 15 min), keyed on the rightmost forwarded address", async ({ request }) => {
    const addr = ip();
    const h = { origin: BASE, "content-type": "application/json" };
    // no timing token: answered like a success and dropped (bot path), but every attempt counts against the client
    const body = JSON.stringify({ name: "x" });
    for (let i = 0; i < 5; i++) {
      // a forged left part does not change the client: always the same bucket
      const r = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": `198.51.100.${i}, ${addr}` }, data: body });
      expect(r.status(), `attempt ${i + 1}`).toBe(200);
    }
    const limited = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": `198.51.100.99, ${addr}` }, data: body });
    expect(limited.status()).toBe(429);
    expect(limited.headers()["retry-after"]).toBe("900");
    // another address of the same IPv6 /64 is the same client
    const sibling = addr.replace(/::1$/, "::beef");
    expect((await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": sibling }, data: body })).status()).toBe(429);
    expect((await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": ip() }, data: body })).status()).toBe(200);
  });
});
