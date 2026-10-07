# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contact.spec.ts >> POST /api/contact guards >> invalid fields are listed; bots get a fake success and nothing is stored
- Location: e2e/contact.spec.ts:192:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 429
```

# Test source

```ts
  102 |   await form.scrollIntoViewIfNeeded();
  103 |   await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-form-step3-fr-${info.project.name}.png` });
  104 |   // the send button's label fits inside the button and the button inside the form (phones: its own row)
  105 |   const send = form.locator('button[type="submit"]');
  106 |   expect(await send.evaluate((b) => b.scrollWidth <= b.clientWidth + 1)).toBe(true);
  107 |   const [fb, sb] = [await form.boundingBox(), await send.boundingBox()];
  108 |   expect(sb!.x).toBeGreaterThanOrEqual(fb!.x - 1);
  109 |   expect(sb!.x + sb!.width).toBeLessThanOrEqual(fb!.x + fb!.width + 1);
  110 |   // the server is the authority: a field it refuses (here forced through the API shape) comes back to its step
  111 |   await page.route("**/api/contact", (route) => route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "invalid_input", fields: ["interests"] }) }));
  112 |   await form.getByText(/J’accepte que Nymbus Capital/).click();
  113 |   await form.getByRole("button", { name: /envoyer mon message/i }).click();
  114 |   await expect(form.getByText("Veuillez choisir au moins un intérêt.")).toBeVisible();
  115 |   await page.unroute("**/api/contact");
  116 |   // a failure keeps the form and offers the e-mail instead
  117 |   await page.route("**/api/contact", (route) => route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: "rate_limited" }) }));
  118 |   await form.getByRole("button", { name: /^continuer/i }).click();
  119 |   await form.getByRole("button", { name: /envoyer mon message/i }).click();
  120 |   const fail = page.getByTestId("contact-fail");
  121 |   await expect(fail).toContainText("Trop de tentatives");
  122 |   await expect(fail.getByRole("link")).toHaveAttribute("href", /^mailto:info@nymbus\.ca\?subject=Demande%20du%20site%20Web/);
  123 |   await expect(page.getByLabel("Nom complet")).toHaveValue(`E2E Visiteur ${info.project.name}`);
  124 |   await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-fail-fr-${info.project.name}.png` });
  125 |   // once the server answers again, the same form is sent (French success state)
  126 |   await page.unroute("**/api/contact");
  127 |   await page.waitForTimeout(3200); // the timing token: no post within 3 s of the page render
  128 |   const posted = page.waitForResponse((r) => r.url().endsWith("/api/contact") && r.request().method() === "POST");
  129 |   await form.getByRole("button", { name: /envoyer mon message/i }).click();
  130 |   expect((await posted).status()).toBe(200);
  131 |   const sent = page.getByTestId("contact-sent");
  132 |   await expect(sent).toContainText("Message envoyé");
  133 |   await expect(sent.getByText("Message envoyé", { exact: true })).toBeFocused();
  134 |   await page.locator(".ct-card").screenshot({ path: `${SHOTS}/contact-sent-fr-${info.project.name}.png` });
  135 | });
  136 | 
  137 | test("contact: works without JavaScript (native post, redirect back with the result)", async ({ browser }, info) => {
  138 |   const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", extraHTTPHeaders: { "x-forwarded-for": ip() }, ...(info.project.name === "mobile" ? { viewport: { width: 412, height: 915 } } : {}) });
  139 |   const page = await ctx.newPage();
  140 |   await page.goto("/contact");
  141 |   const form = page.getByTestId("contact-form");
  142 |   await expect(form).not.toHaveAttribute("data-live", "");
  143 |   // every step is shown; the browser validates the required fields itself
  144 |   await form.getByText("Financial advisor", { exact: true }).click();
  145 |   await form.getByText("General inquiry", { exact: true }).click();
  146 |   await page.getByLabel("Full name").fill(`E2E NoScript ${info.project.name}`);
  147 |   await page.getByLabel("Email address").fill("noscript@example.com");
  148 |   await form.getByText(/I agree that Nymbus Capital uses these details/).click();
  149 |   await page.waitForTimeout(3200);
  150 |   await form.getByRole("button", { name: /send my message/i }).click();
  151 |   await expect(page).toHaveURL(/\/contact\?sent=1/);
  152 |   await expect(page.getByTestId("contact-sent")).toBeVisible();
  153 |   // a field the server refuses comes back as its code only (never the value), with its message and the summary
  154 |   await page.goto("/contact");
  155 |   await form.getByText("Other", { exact: true }).click();
  156 |   await form.getByText("General inquiry", { exact: true }).click();
  157 |   await page.getByLabel("Full name").fill(`E2E NoScript bad phone ${info.project.name}`);
  158 |   await page.getByLabel("Email address").fill("noscript@example.com");
  159 |   await page.getByLabel(/^Phone/).fill("call me maybe");
  160 |   await form.getByText(/I agree that Nymbus Capital uses these details/).click();
  161 |   await page.waitForTimeout(3200);
  162 |   await form.getByRole("button", { name: /send my message/i }).click();
  163 |   await expect(page).toHaveURL(/\/contact\?error=invalid_input&fields=phone#contact-form$/);
  164 |   expect(page.url()).not.toMatch(/call|maybe|noscript/i);
  165 |   await expect(page.getByTestId("contact-errors")).toHaveText("Please check: Phone");
  166 |   await expect(page.getByText("Please check the phone number.")).toBeVisible();
  167 |   await expect(page.getByLabel(/^Phone/)).toHaveAttribute("aria-describedby", "ct-e-phone");
  168 |   // an error comes back the same way
  169 |   await page.goto("/contact?error=rate_limited");
  170 |   await expect(page.getByTestId("contact-fail")).toContainText("Too many attempts");
  171 |   await page.goto("/contact?error=<script>");
  172 |   await expect(page.getByTestId("contact-fail")).toContainText("Not sent");
  173 |   await ctx.close();
  174 | });
  175 | 
  176 | test.describe("POST /api/contact guards", () => {
  177 |   const valid = (t: string, name: string) => ({ profile: "Other", interests: ["General inquiry"], name, email: "api@example.com", phone: "", company: "", message: "From the API test", consent: true, website: "", t, lang: "en" });
  178 | 
  179 |   test("same origin, content type, size, method", async ({ request }) => {
  180 |     const xff = { "x-forwarded-for": ip() };
  181 |     const t = await token(request);
  182 |     const data = JSON.stringify(valid(t, "Guard Test"));
  183 |     expect((await request.post("/api/contact", { headers: { ...xff, "content-type": "application/json" }, data })).status(), "no Origin").toBe(403);
  184 |     expect((await request.post("/api/contact", { headers: { ...xff, origin: "https://evil.example", "content-type": "application/json" }, data })).status()).toBe(403);
  185 |     expect((await request.post("/api/contact", { headers: { ...xff, origin: BASE, "sec-fetch-site": "cross-site", "content-type": "application/json" }, data })).status()).toBe(403);
  186 |     expect((await request.post("/api/contact", { headers: { ...xff, origin: BASE, "content-type": "text/plain" }, data })).status()).toBe(415);
  187 |     const big = JSON.stringify({ ...valid(t, "Big"), message: "x".repeat(20_000) });
  188 |     expect((await request.post("/api/contact", { headers: { "x-forwarded-for": ip(), origin: BASE, "content-type": "application/json" }, data: big })).status()).toBe(413);
  189 |     expect((await request.get("/api/contact")).status()).toBe(405);
  190 |   });
  191 | 
  192 |   test("invalid fields are listed; bots get a fake success and nothing is stored", async ({ request }, info) => {
  193 |     const h = { "x-forwarded-for": ip(), origin: BASE, "content-type": "application/json" };
  194 |     const t = await token(request);
  195 |     await new Promise((r) => setTimeout(r, 3200));
  196 |     const bad = await request.post("/api/contact", { headers: h, data: JSON.stringify({ ...valid(t, "<b>x</b>"), email: "nope", consent: false, interests: ["Bitcoin"] }) });
  197 |     expect(bad.status()).toBe(400);
  198 |     expect((await bad.json()).fields).toEqual(["interests", "name", "email", "consent"]);
  199 |     // honeypot filled, or posted too fast with a fresh token, or without a token: 200 { ok: true }, not stored
  200 |     // (admin.spec.ts checks that "E2E Bot" never reaches the inquiries)
  201 |     const hp = await request.post("/api/contact", { headers: h, data: JSON.stringify({ ...valid(t, `E2E Bot honeypot ${info.project.name}`), website: "http://spam.example" }) });
> 202 |     expect(hp.status()).toBe(200);
      |                         ^ Error: expect(received).toBe(expected) // Object.is equality
  203 |     expect(await hp.json()).toEqual({ ok: true });
  204 |     const fresh = await token(request);
  205 |     const fast = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": ip() }, data: JSON.stringify(valid(fresh, `E2E Bot fast ${info.project.name}`)) });
  206 |     expect(fast.status()).toBe(200);
  207 |     const none = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": ip() }, data: JSON.stringify(valid("", `E2E Bot token ${info.project.name}`)) });
  208 |     expect(none.status()).toBe(200);
  209 |   });
  210 | 
  211 |   test("per-client rate limit (5 attempts / 15 min), keyed on the rightmost forwarded address", async ({ request }) => {
  212 |     const addr = ip();
  213 |     const h = { origin: BASE, "content-type": "application/json" };
  214 |     // no timing token: answered like a success and dropped (bot path), but every attempt counts against the client
  215 |     const body = JSON.stringify({ name: "x" });
  216 |     for (let i = 0; i < 5; i++) {
  217 |       // a forged left part does not change the client: always the same bucket
  218 |       const r = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": `198.51.100.${i}, ${addr}` }, data: body });
  219 |       expect(r.status(), `attempt ${i + 1}`).toBe(200);
  220 |     }
  221 |     const limited = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": `198.51.100.99, ${addr}` }, data: body });
  222 |     expect(limited.status()).toBe(429);
  223 |     expect(limited.headers()["retry-after"]).toBe("900");
  224 |     expect((await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": ip() }, data: body })).status()).toBe(200);
  225 |   });
  226 | });
  227 | 
```