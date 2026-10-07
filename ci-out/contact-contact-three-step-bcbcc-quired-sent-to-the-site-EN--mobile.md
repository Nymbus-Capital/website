# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contact.spec.ts >> contact: three steps validated, consent required, sent to the site (EN)
- Location: e2e/contact.spec.ts:40:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 429
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Nymbus Capital, home" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "nymbus" [ref=e6]
      - navigation "Primary"
      - generic [ref=e15]:
        - button "Afficher le site en français" [ref=e16] [cursor=pointer]:
          - generic [aria-hidden] [ref=e17]: en
          - generic [aria-hidden] [ref=e18]: fr
        - button "Open menu" [ref=e19] [cursor=pointer]
  - main [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e36]:
        - navigation "Breadcrumb" [ref=e37]:
          - list [ref=e38]:
            - listitem [ref=e39]:
              - link "Home" [ref=e40] [cursor=pointer]:
                - /url: /
            - listitem [ref=e43]:
              - generic [ref=e44]: Contact us
        - generic [ref=e46]:
          - paragraph [ref=e48]: Contact us
          - heading "Get in touch" [level=1] [ref=e50]:
            - generic [aria-hidden] [ref=e51]:
              - generic [ref=e52]: Get
              - generic [ref=e53]: in
              - generic [ref=e54]: touch
          - generic [ref=e55]: "Strategies, a custom mandate or the firm: our Montreal team can help."
          - generic [ref=e58]:
            - link "514-985-1138" [ref=e59] [cursor=pointer]:
              - /url: tel:+15149851138
            - link "info@nymbus.ca" [ref=e62] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
      - region [ref=e66]:
        - generic [ref=e68]:
          - generic [ref=e69]:
            - heading "Write to us" [level=2] [ref=e70]
            - paragraph [ref=e71]: Three short steps.
            - generic [ref=e72]:
              - status [ref=e73]
              - generic [ref=e74]:
                - generic [aria-hidden] [ref=e75]:
                  - text: Website
                  - textbox [ref=e76]
                - alert
                - list "Form progress" [ref=e77]:
                  - listitem [ref=e78]
                  - listitem [ref=e82]
                  - listitem [ref=e86]:
                    - generic [aria-hidden] [ref=e87]: "3"
                    - generic [ref=e88]: Contact details
                - group "Your contact details" [ref=e89]:
                  - generic [ref=e91]:
                    - generic [ref=e92]:
                      - generic [ref=e93]: Full name
                      - textbox "Full name" [ref=e94]: E2E Visitor mobile
                    - generic [ref=e95]:
                      - generic [ref=e96]: Email address
                      - textbox "Email address" [ref=e97]: visitor@example.com
                    - generic [ref=e98]:
                      - generic [ref=e99]: Phone (optional)
                      - textbox "Phone (optional)" [ref=e100]
                    - generic [ref=e101]:
                      - generic [ref=e102]: Organization (optional)
                      - textbox "Organization (optional)" [ref=e103]
                    - generic [ref=e104]:
                      - generic [ref=e105]: Message (optional)
                      - textbox "Message (optional)" [ref=e106]:
                        - /placeholder: Tell us about your needs
                        - text: Hello, I would like to learn more about your funds.
                    - generic [ref=e108] [cursor=pointer]:
                      - checkbox "I agree that Nymbus Capital uses these details only to answer my request. Privacy policy" [checked] [ref=e109]
                      - generic [ref=e110]:
                        - generic [ref=e111]: I agree that Nymbus Capital uses these details only to answer my request.
                        - link "Privacy policy" [ref=e112]:
                          - /url: /privacy
                  - alert [ref=e119]:
                    - paragraph [ref=e120]: Too many attempts. Please try again later or email us.
                    - link "Email us instead" [ref=e121] [cursor=pointer]:
                      - /url: mailto:info@nymbus.ca?subject=Website%20inquiry%20%C2%B7%20Individual%20investor%20%C2%B7%20E2E%20Visitor%20mobile&body=Hello%2C%20I%20would%20like%20to%20learn%20more%20about%20your%20funds.%0A%0A%E2%80%94%0AName%3A%20E2E%20Visitor%20mobile%0AEmail%3A%20visitor%40example.com%0AInvestor%20profile%3A%20Individual%20investor%0AInterested%20in%3A%20Monthly%20Income
                  - generic [ref=e125]:
                    - button "Back" [ref=e126] [cursor=pointer]
                    - button "Send my message" [ref=e129] [cursor=pointer]
                - paragraph [ref=e133]: Please do not include account numbers or other sensitive information.
          - complementary "Montreal office" [ref=e134]:
            - generic [ref=e135]:
              - heading "Montreal office" [level=2] [ref=e136]
              - list [ref=e137]:
                - listitem [ref=e138]:
                  - generic [ref=e142]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
                - listitem [ref=e143]:
                  - generic [ref=e146]:
                    - link "514-985-1138" [ref=e147] [cursor=pointer]:
                      - /url: tel:+15149851138
                    - link "1-833-227-2656 (toll-free)" [ref=e148] [cursor=pointer]:
                      - /url: tel:+18332272656
                - listitem [ref=e149]:
                  - link "info@nymbus.ca" [ref=e153] [cursor=pointer]:
                    - /url: mailto:info@nymbus.ca
                - listitem [ref=e154]:
                  - generic [ref=e158]: Monday to Friday, 8:30 a.m. to 5:00 p.m. (Eastern time)
              - generic [ref=e159]:
                - link "Open in Google Maps" [ref=e160] [cursor=pointer]:
                  - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
                - link "LinkedIn" [ref=e164] [cursor=pointer]:
                  - /url: https://www.linkedin.com/company/nymbus-capital/
            - generic [ref=e168]:
              - heading "Response time" [level=2] [ref=e169]
              - paragraph [ref=e170]: Usually within one business day.
      - region [ref=e171]:
        - generic [ref=e172]:
          - generic [ref=e173]:
            - paragraph [ref=e175]: Who to contact
            - heading "The right person for your question" [level=2] [ref=e177]:
              - generic [aria-hidden] [ref=e178]:
                - generic [ref=e179]: The
                - generic [ref=e180]: right
                - generic [ref=e181]: person
                - generic [ref=e182]: for
                - generic [ref=e183]: your
                - generic [ref=e184]: question
          - generic [ref=e185]:
            - generic [ref=e186]:
              - heading "Investors and institutions" [level=3] [ref=e187]
              - paragraph [ref=e188]: Strategies, mandates, due diligence, meetings.
              - link "info@nymbus.ca" [ref=e189] [cursor=pointer]:
                - /url: mailto:info@nymbus.ca?subject=Investor%20inquiry
            - generic [ref=e193]:
              - heading "Financial advisors" [level=3] [ref=e194]
              - paragraph [ref=e195]: Fund codes, documents, client portfolio support.
              - link "info@nymbus.ca" [ref=e196] [cursor=pointer]:
                - /url: mailto:info@nymbus.ca?subject=Advisor%20inquiry
            - generic [ref=e200]:
              - heading "Media and careers" [level=3] [ref=e201]
              - paragraph [ref=e202]: Interviews, events, job applications.
              - link "info@nymbus.ca" [ref=e203] [cursor=pointer]:
                - /url: mailto:info@nymbus.ca?subject=Media%20or%20careers
            - generic [ref=e207]:
              - heading "Complaints and privacy" [level=3] [ref=e208]
              - paragraph [ref=e209]: Complaints and personal information requests.
              - link "compliance@nymbus.ca" [ref=e210] [cursor=pointer]:
                - /url: mailto:compliance@nymbus.ca?subject=Compliance
              - link "Complaints policy" [ref=e214] [cursor=pointer]:
                - /url: /legal#complaints
      - region [ref=e217]:
        - generic [ref=e219]:
          - generic [ref=e220]:
            - generic [ref=e221]:
              - paragraph [ref=e223]: Visit us
              - heading "In the heart of downtown Montreal" [level=2] [ref=e225]:
                - generic [aria-hidden] [ref=e226]:
                  - generic [ref=e227]: In
                  - generic [ref=e228]: the
                  - generic [ref=e229]: heart
                  - generic [ref=e230]: of
                  - generic [ref=e231]: downtown
                  - generic [ref=e232]: Montreal
            - generic [ref=e233]:
              - list [ref=e234]:
                - listitem [ref=e235]:
                  - generic [ref=e239]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
                - listitem [ref=e240]:
                  - generic [ref=e244]: Monday to Friday, 8:30 a.m. to 5:00 p.m. (Eastern time)
              - link "Open in Google Maps" [ref=e246] [cursor=pointer]:
                - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
          - link "Nymbus Capital 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6 Open in Google Maps" [ref=e251] [cursor=pointer]:
            - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
            - generic [ref=e280]:
              - generic [ref=e281]: Nymbus Capital
              - generic [ref=e282]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
              - generic [ref=e283]: Open in Google Maps
  - contentinfo [ref=e287]:
    - generic [ref=e288]:
      - generic [ref=e289]:
        - generic [ref=e290]:
          - link "Nymbus Capital, home" [ref=e291] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e292]
          - paragraph [ref=e301]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e302]:
            - generic [ref=e303]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e304] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e305]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e306] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e307]:
          - heading "Strategies" [level=2] [ref=e308]
          - list [ref=e309]:
            - listitem [ref=e310]:
              - link "Monthly Income" [ref=e311] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e313]:
              - link "Sustainable Enhanced Bonds" [ref=e314] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e316]:
              - link "Multi-Strategy" [ref=e317] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e319]:
              - link "Global Minimum Volatility" [ref=e320] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e322]:
          - heading "Company" [level=2] [ref=e323]
          - list [ref=e324]:
            - listitem [ref=e325]:
              - link "About & team" [ref=e326] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e327]:
              - link "Approach" [ref=e328] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e329]:
              - link "Core concepts" [ref=e330] [cursor=pointer]:
                - /url: /core-concepts
            - listitem [ref=e331]:
              - link "Sustainability" [ref=e332] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e333]:
              - link "Solutions" [ref=e334] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e335]:
          - heading "Resources" [level=2] [ref=e336]
          - list [ref=e337]:
            - listitem [ref=e338]:
              - link "Contact" [ref=e339] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e340]:
              - link "Privacy policy" [ref=e341] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e342]:
              - link "Complaints & code of ethics" [ref=e343] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e344]:
              - link "LinkedIn" [ref=e345] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e350]:
        - generic [ref=e352] [cursor=pointer]:
          - paragraph [ref=e353]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
          - paragraph [ref=e354]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
          - paragraph [ref=e355]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
          - paragraph [ref=e356]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
          - paragraph [ref=e357]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
          - paragraph [ref=e358]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative. Unless another variant is selected on the strategy page, the returns shown are those of the 6% downside volatility variant; the strategy is also offered with 3% and 9% downside volatility targets, whose returns differ.
          - paragraph [ref=e359]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
        - button "Show full text" [ref=e360] [cursor=pointer]
      - generic [ref=e364]:
        - generic [ref=e365]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e366]: PRI signatory
  - alert [ref=e367]
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import { mkdirSync } from "node:fs";
  3   | import { randomBytes } from "node:crypto";
  4   | import { BASE } from "./helpers";
  5   | 
  6   | /**
  7   |  * Contact form backend (POST /api/contact): the three steps with JavaScript, the native post without JavaScript, and
  8   |  * the API guards. Inquiries land in the e2e server's test-only data volume (SITE_DATA_DIR=./var-e2e); the admin tests
  9   |  * (admin.spec.ts, run after this file) read them. Every test uses its own client address (X-Forwarded-For) so the
  10  |  * per-client rate limit of one test never affects another.
  11  |  */
  12  | 
  13  | const SHOTS = "e2e/screenshots";
  14  | mkdirSync(SHOTS, { recursive: true });
  15  | 
  16  | /** a fresh documentation-range (2001:db8::/32) client address: tests run in parallel workers and must never share one */
  17  | const ip = () => `2001:db8::${randomBytes(2).toString("hex")}:${randomBytes(2).toString("hex")}`;
  18  | 
  19  | /** the form timing token rendered in the page (the server refuses posts made within 3 s of rendering) */
  20  | async function token(request: import("@playwright/test").APIRequestContext): Promise<string> {
  21  |   const html = await (await request.get("/contact")).text();
  22  |   const m = /name="t" value="(v1\.[^"]+)"/.exec(html);
  23  |   expect(m, "form token in the page").not.toBeNull();
  24  |   return m![1];
  25  | }
  26  | 
  27  | async function fillSteps(page: Page, name: string, fr = false) {
  28  |   const form = page.getByTestId("contact-form");
  29  |   const next = form.getByRole("button", { name: fr ? /^continuer/i : /^continue/i });
  30  |   await form.getByText(fr ? "Particulier" : "Individual investor", { exact: true }).click();
  31  |   await next.click();
  32  |   await form.getByText(fr ? "Demande générale" : "General inquiry", { exact: true }).click();
  33  |   await next.click();
  34  |   await page.getByLabel(fr ? "Nom complet" : "Full name").fill(name);
  35  |   await page.getByLabel(fr ? "Adresse courriel" : "Email address").fill("visitor@example.com");
  36  |   await page.getByLabel(fr ? /^Organisation/ : /^Organization/).fill("Example Pension Plan");
  37  |   await page.getByLabel(/^Message/).fill("Hello,\nI would like to learn more about your funds.");
  38  | }
  39  | 
  40  | test("contact: three steps validated, consent required, sent to the site (EN)", async ({ page }, info) => {
  41  |   await page.emulateMedia({ reducedMotion: "reduce" });
  42  |   await page.setExtraHTTPHeaders({ "x-forwarded-for": ip() });
  43  |   await page.goto("/contact");
  44  |   const form = page.getByTestId("contact-form");
  45  |   await form.scrollIntoViewIfNeeded();
  46  |   await expect(form).toHaveAttribute("data-live", "");
  47  |   // step 1: a profile is required
  48  |   await form.getByRole("button", { name: /^continue/i }).click();
  49  |   await expect(form.getByText("Please choose a profile.")).toBeVisible();
  50  |   await form.getByText("Individual investor", { exact: true }).click();
  51  |   await form.getByRole("button", { name: /^continue/i }).click();
  52  |   // step 2: at least one interest
  53  |   await expect(form.getByRole("group", { name: /what are you interested in/i })).toBeVisible();
  54  |   await form.getByRole("button", { name: /^continue/i }).click();
  55  |   await expect(form.getByText("Please choose at least one interest.")).toBeVisible();
  56  |   await form.getByText("Monthly Income", { exact: true }).click();
  57  |   await form.getByRole("button", { name: /^continue/i }).click();
  58  |   // step 3: name, a valid email and the consent
  59  |   const send = form.getByRole("button", { name: /send my message/i });
  60  |   await send.click();
  61  |   await expect(form.getByText("Please enter a valid email address.")).toBeVisible();
  62  |   await expect(form.getByText("Please give your consent.")).toBeVisible();
  63  |   await expect(form.getByTestId("contact-errors")).toHaveText("Please check: Full name, Email address, Consent");
  64  |   await expect(form.getByTestId("contact-errors")).toHaveAttribute("role", "alert");
  65  |   await expect(page.getByLabel("Full name")).toBeFocused(); // focus goes to the first field to fix
  66  |   await expect(form.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
  67  |   await page.getByLabel("Full name").fill(`E2E Visitor ${info.project.name}`);
  68  |   await page.getByLabel("Email address").fill("visitor@example.com");
  69  |   await page.getByLabel(/^Message/).fill("Hello, I would like to learn more about your funds.");
  70  |   await form.getByText(/I agree that Nymbus Capital uses these details only to answer my request/).click();
  71  |   await expect(page.getByTestId("contact-consent")).toBeChecked();
  72  |   await form.scrollIntoViewIfNeeded();
  73  |   await page.screenshot({ path: `${SHOTS}/contact-step3-${info.project.name}.png`, fullPage: false });
  74  |   await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-form-step3-${info.project.name}.png` });
  75  |   await page.waitForTimeout(3200); // the timing token: no post within 3 s of the page render
  76  |   const posted = page.waitForResponse((r) => r.url().endsWith("/api/contact") && r.request().method() === "POST");
  77  |   await send.click();
> 78  |   expect((await posted).status()).toBe(200);
      |                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  79  |   const sent = page.getByTestId("contact-sent");
  80  |   await expect(sent).toBeVisible();
  81  |   await expect(sent).toContainText("Message sent");
  82  |   await expect(page.locator(".ct-wrap [role=status]")).toHaveText("Message sent");
  83  |   await page.locator(".ct-card").screenshot({ path: `${SHOTS}/contact-sent-${info.project.name}.png` });
  84  |   // another message starts over at step 1
  85  |   await sent.getByRole("link", { name: /send another message/i }).click();
  86  |   await expect(page.getByTestId("contact-form")).toBeVisible();
  87  |   await expect(page.getByRole("group", { name: /who are you/i })).toBeVisible();
  88  |   // office details and the mailto / phone alternatives remain
  89  |   await expect(page.locator('a[href^="tel:+15149851138"]').first()).toBeVisible();
  90  |   await expect(page.locator('a[href^="mailto:info@nymbus.ca"]').first()).toBeAttached();
  91  |   await expect(page.locator("iframe")).toHaveCount(0);
  92  | });
  93  | 
  94  | test("contact: French form, server-side field errors shown at their step", async ({ page, baseURL }, info) => {
  95  |   await page.emulateMedia({ reducedMotion: "reduce" });
  96  |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  97  |   await page.setExtraHTTPHeaders({ "x-forwarded-for": ip() });
  98  |   await page.goto("/contact");
  99  |   await fillSteps(page, `E2E Visiteur ${info.project.name}`, true);
  100 |   const form = page.getByTestId("contact-form");
  101 |   await expect(form.getByText(/J’accepte que Nymbus Capital utilise ces renseignements uniquement/)).toBeVisible();
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
```