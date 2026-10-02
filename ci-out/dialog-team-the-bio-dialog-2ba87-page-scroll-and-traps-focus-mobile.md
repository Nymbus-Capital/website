# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dialog.spec.ts >> team: the bio dialog is centred in the viewport, locks the page scroll and traps focus
- Location: e2e/dialog.spec.ts:28:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e1]:
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
      - generic [ref=e37]:
        - navigation "Breadcrumb" [ref=e38]:
          - list [ref=e39]:
            - listitem [ref=e40]:
              - link "Home" [ref=e41] [cursor=pointer]:
                - /url: /
            - listitem [ref=e44]:
              - generic [ref=e45]: About Nymbus
        - generic [ref=e46]:
          - generic [ref=e47]:
            - paragraph [ref=e49]: About Nymbus
            - heading "Scientists and market veterans" [level=1] [ref=e51]:
              - generic [aria-hidden] [ref=e52]:
                - generic [ref=e53]: Scientists
                - generic [ref=e54]: and
                - generic [ref=e55]: market
                - generic [ref=e56]: veterans
            - generic [ref=e57]: Independent Montreal portfolio manager, since 2013.
            - generic [ref=e60]:
              - link "Meet the team" [ref=e61] [cursor=pointer]:
                - /url: "#people"
              - link "Contact us" [ref=e64] [cursor=pointer]:
                - /url: /contact
          - generic [ref=e66]:
            - generic [ref=e67]:
              - generic [ref=e68]:
                - generic [ref=e69]: "18"
                - generic [ref=e70]: people
              - generic [ref=e71]:
                - generic [ref=e72]: "2"
                - generic [ref=e73]: PhDs in physics
              - generic [ref=e74]:
                - generic [ref=e75]: "4"
                - generic [ref=e76]: CFA charterholders
              - generic [ref=e77]:
                - generic [ref=e78]: "2013"
                - generic [ref=e79]: founded in Montreal
            - list [aria-hidden] [ref=e80]:
              - listitem [ref=e81]
              - listitem [ref=e83]
              - listitem [ref=e85]
              - listitem [ref=e87]
              - listitem [ref=e89]
              - listitem [ref=e91]
              - listitem [ref=e93]
              - listitem [ref=e95]
      - region [ref=e101]:
        - generic [ref=e103]:
          - generic [ref=e105]:
            - paragraph [ref=e107]: Who we are
            - heading "A research-driven investment firm" [level=2] [ref=e109]:
              - generic [aria-hidden] [ref=e110]:
                - generic [ref=e111]: A
                - generic [ref=e112]: research-driven
                - generic [ref=e113]: investment
                - generic [ref=e114]: firm
            - generic [ref=e115]: Founded in 2013 by Marc Rivet and Gabriel Cefaloni.
            - list [ref=e117]:
              - listitem [ref=e118]: Bond markets produce more data than a team can analyze
              - listitem [ref=e119]: A scientific process puts that data to work
              - listitem [ref=e120]: Physicists and computer scientists, alongside fixed income managers
          - generic [ref=e141]:
            - paragraph [ref=e142]: Montreal office
            - paragraph [ref=e146]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - generic [ref=e147]:
              - generic [ref=e148]:
                - term [ref=e149]: Founded
                - definition [ref=e150]: 2013, Montreal
              - generic [ref=e151]:
                - term [ref=e152]: Signatory
                - definition [ref=e153]: PRI, since 2018
            - link "Directions" [ref=e154] [cursor=pointer]:
              - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
      - region [ref=e158]:
        - generic [ref=e159]:
          - generic [ref=e160]:
            - paragraph [ref=e162]: Our values
            - heading "What guides the way we work" [level=2] [ref=e164]:
              - generic [aria-hidden] [ref=e165]:
                - generic [ref=e166]: What
                - generic [ref=e167]: guides
                - generic [ref=e168]: the
                - generic [ref=e169]: way
                - generic [ref=e170]: we
                - generic [ref=e171]: work
          - generic [ref=e172]:
            - generic [ref=e173]:
              - heading "Innovation" [level=3] [ref=e177]
              - paragraph [ref=e179]: We adopt what research supports.
            - generic [ref=e180]:
              - heading "Agility" [level=3] [ref=e184]
              - paragraph [ref=e186]: Research reaches production quickly.
            - generic [ref=e187]:
              - heading "Accountability" [level=3] [ref=e192]
              - paragraph [ref=e194]: Transparent methods. Fiduciary duty first.
            - generic [ref=e195]:
              - heading "Integrity" [level=3] [ref=e201]
              - paragraph [ref=e203]: Clients’ interests first.
            - generic [ref=e204]:
              - heading "Collaboration" [level=3] [ref=e211]
              - paragraph [ref=e213]: Scientists and practitioners challenge each other.
      - region [ref=e214]:
        - generic [ref=e215]:
          - generic [ref=e216]:
            - paragraph [ref=e218]: Milestones
            - heading "Our story so far" [level=2] [ref=e220]:
              - generic [aria-hidden] [ref=e221]:
                - generic [ref=e222]: Our
                - generic [ref=e223]: story
                - generic [ref=e224]: so
                - generic [ref=e225]: far
          - list [ref=e227]:
            - listitem [ref=e228]:
              - paragraph [ref=e230]: "2013"
              - heading "Nymbus is founded" [level=3] [ref=e231]
            - listitem [ref=e232]:
              - paragraph [ref=e234]: "2018"
              - heading "PRI signatory" [level=3] [ref=e235]
            - listitem [ref=e236]:
              - paragraph [ref=e238]: "2021"
              - heading "Monthly Income fund launched" [level=3] [ref=e239]
            - listitem [ref=e240]:
              - paragraph [ref=e242]: "2023"
              - heading "Partnership with Dans la rue" [level=3] [ref=e243]
              - paragraph [ref=e244]: Support for youth at risk.
            - listitem [ref=e245]:
              - paragraph [ref=e247]: "2024"
              - heading "Tobacco-Free Finance Pledge" [level=3] [ref=e248]
            - listitem [ref=e249]:
              - paragraph [ref=e251]: "2025"
              - heading "Partnership with Mageska Capital" [level=3] [ref=e252]
              - paragraph [ref=e253]: A portable alpha strategy.
      - region [ref=e254]:
        - generic [ref=e255]:
          - generic [ref=e256]:
            - paragraph [ref=e258]: Our team
            - heading "The people behind the science" [level=2] [ref=e260]:
              - generic [aria-hidden] [ref=e261]:
                - generic [ref=e262]: The
                - generic [ref=e263]: people
                - generic [ref=e264]: behind
                - generic [ref=e265]: the
                - generic [ref=e266]: science
            - generic [ref=e267]: Select a person to read their biography.
          - group "Filter by department" [ref=e269]:
            - button "Everyone" [pressed] [ref=e270] [cursor=pointer]:
              - text: Everyone
              - generic [aria-hidden] [ref=e271]: "18"
            - button "Leadership" [ref=e272] [cursor=pointer]:
              - text: Leadership
              - generic [aria-hidden] [ref=e273]: "3"
            - button "Quantitative research" [ref=e274] [cursor=pointer]:
              - text: Quantitative research
              - generic [aria-hidden] [ref=e275]: "4"
            - button "Investment team" [ref=e276] [cursor=pointer]:
              - text: Investment team
              - generic [aria-hidden] [ref=e277]: "9"
            - button "Operations" [ref=e278] [cursor=pointer]:
              - text: Operations
              - generic [aria-hidden] [ref=e279]: "7"
            - button "Board" [ref=e280] [cursor=pointer]:
              - text: Board
              - generic [aria-hidden] [ref=e281]: "5"
          - paragraph [ref=e282]: 18 people shown
          - list [ref=e283]:
            - listitem [ref=e284]:
              - button "Read the biography of Marc Rivet" [ref=e285] [cursor=pointer]:
                - generic [ref=e287]:
                  - generic [ref=e288]: Marc Rivet
                  - generic [ref=e289]: Co-founder & Chief Executive Officer
            - listitem [ref=e294]:
              - button "Read the biography of Gabriel Cefaloni" [ref=e295] [cursor=pointer]:
                - generic [ref=e297]:
                  - generic [ref=e298]: Gabriel Cefaloni
                  - generic [ref=e299]: Co-founder & Chief Investment Officer
                  - generic [ref=e300]: CIM
            - listitem [ref=e306]:
              - button "Read the biography of Mathieu Poulin-Brière" [ref=e307] [cursor=pointer]:
                - generic [ref=e309]:
                  - generic [ref=e310]: Mathieu Poulin-Brière
                  - generic [ref=e311]: Vice-President, Systematic Overlays
                  - generic [ref=e312]: M.Sc. Finance
            - listitem [ref=e318]:
              - button "Read the biography of Jessica Martins" [ref=e319] [cursor=pointer]:
                - generic [ref=e321]:
                  - generic [ref=e322]: Jessica Martins
                  - generic [ref=e323]: Team Lead, Quantitative Research
                  - generic [ref=e324]: PhD, Physics, Astrophysics
            - listitem [ref=e330]:
              - button "Read the biography of Jean-Philippe Lejeune" [ref=e331] [cursor=pointer]:
                - generic [ref=e333]:
                  - generic [ref=e334]: Jean-Philippe Lejeune
                  - generic [ref=e335]: Associate PM & Quantitative Developer
                  - generic [ref=e336]:
                    - generic [ref=e337]: CFA
                    - generic [ref=e338]: M.Sc. Finance
            - listitem [ref=e343]:
              - button "Read the biography of Olivier Cyr-Choinière" [ref=e344] [cursor=pointer]:
                - generic [ref=e346]:
                  - generic [ref=e347]: Olivier Cyr-Choinière
                  - generic [ref=e348]: Quantitative Researcher
                  - generic [ref=e349]:
                    - generic [ref=e350]: PhD, Physics, Superconductivity
                    - generic [ref=e351]: M.Sc. Financial Engineering
            - listitem [ref=e356]:
              - button "Read the biography of Guy Liébart" [ref=e357] [cursor=pointer]:
                - generic [ref=e359]:
                  - generic [ref=e360]: Guy Liébart
                  - generic [ref=e361]: Portfolio Manager
                  - generic [ref=e362]: MBA
            - listitem [ref=e368]:
              - button "Read the biography of François-Olivier Laplante" [ref=e369] [cursor=pointer]:
                - generic [ref=e371]:
                  - generic [ref=e372]: François-Olivier Laplante
                  - generic [ref=e373]: Portfolio Manager, REITs
                  - generic [ref=e374]: CIM
            - listitem [ref=e380]:
              - button "Read the biography of Lyes Hammadi" [ref=e381] [cursor=pointer]:
                - generic [aria-hidden] [ref=e383]: LH
                - generic [ref=e384]:
                  - generic [ref=e385]: Lyes Hammadi
                  - generic [ref=e386]: Lead Software Engineer, Investment Platforms
            - listitem [ref=e391]:
              - button "Read the biography of Jason Laliberte" [ref=e392] [cursor=pointer]:
                - generic [aria-hidden] [ref=e394]: JL
                - generic [ref=e395]:
                  - generic [ref=e396]: Jason Laliberte
                  - generic [ref=e397]: Consultant, Equities Asset Allocation
                  - generic [ref=e398]:
                    - generic [ref=e399]: CFA
                    - generic [ref=e400]: M.Sc. Finance
            - listitem [ref=e405]:
              - button "Read the biography of Diane Dusabimana" [ref=e406] [cursor=pointer]:
                - generic [ref=e408]:
                  - generic [ref=e409]: Diane Dusabimana
                  - generic [ref=e410]: Chief Compliance Officer
                  - generic [ref=e411]:
                    - generic [ref=e412]: MBA
                    - generic [ref=e413]: CPA
                    - generic [ref=e414]: CFA
            - listitem [ref=e419]:
              - button "Read the biography of Jennifer Pinkerton" [ref=e420] [cursor=pointer]:
                - generic [ref=e422]:
                  - generic [ref=e423]: Jennifer Pinkerton
                  - generic [ref=e424]: Portfolio Administrator
                  - generic [ref=e425]: CFA
            - listitem [ref=e431]:
              - button "Read the biography of Fraser Coburn" [ref=e432] [cursor=pointer]:
                - generic [aria-hidden] [ref=e434]: FC
                - generic [ref=e435]:
                  - generic [ref=e436]: Fraser Coburn
                  - generic [ref=e437]: Director, Client Relations
            - listitem [ref=e442]:
              - button "Read the biography of Luca Ieraci" [ref=e443] [cursor=pointer]:
                - generic [aria-hidden] [ref=e445]: LI
                - generic [ref=e446]:
                  - generic [ref=e447]: Luca Ieraci
                  - generic [ref=e448]: Consultant, Software Development
            - listitem [ref=e453]:
              - button "Read the biography of Xavier Girard" [ref=e454] [cursor=pointer]:
                - generic [ref=e456]:
                  - generic [ref=e457]: Xavier Girard
                  - generic [ref=e458]: Senior Associate, Client Relations — Advisor Channel
            - listitem [ref=e463]:
              - button "Read the biography of Danira Csano" [ref=e464] [cursor=pointer]:
                - generic [ref=e466]:
                  - generic [ref=e467]: Danira Csano
                  - generic [ref=e468]: Administrative Coordinator
            - listitem [ref=e473]:
              - button "Read the biography of Jean Turmel" [ref=e474] [cursor=pointer]:
                - generic [ref=e476]:
                  - generic [ref=e477]: Jean Turmel
                  - generic [ref=e478]: Chairman of the Board
                  - generic [ref=e479]: MBA
            - listitem [ref=e485]:
              - button "Read the biography of Jean-Luc Landry" [ref=e486] [cursor=pointer]:
                - generic [ref=e488]:
                  - generic [ref=e489]: Jean-Luc Landry
                  - generic [ref=e490]: Board Member
                  - generic [ref=e491]: M.Sc. Economics
      - generic [ref=e499]:
        - heading "Work with us" [level=2] [ref=e500]:
          - generic [aria-hidden] [ref=e501]:
            - generic [ref=e502]: Work
            - generic [ref=e503]: with
            - generic [ref=e504]: us
        - paragraph [ref=e506]: "Researchers, engineers and investors: write to us."
        - generic [ref=e508]:
          - link "Send us your résumé" [ref=e509] [cursor=pointer]:
            - /url: mailto:info@nymbus.ca?subject=Careers
          - link "Contact us" [ref=e512] [cursor=pointer]:
            - /url: /contact
      - dialog [ref=e513]:
        - generic [ref=e514]:
          - button "Close" [ref=e515] [cursor=pointer]
          - generic [ref=e521]:
            - heading "Mathieu Poulin-Brière" [level=2] [ref=e522]
            - paragraph [ref=e523]: Vice-President, Systematic Overlays
            - paragraph [ref=e524]:
              - generic [ref=e525]: M.Sc. Finance
          - generic [ref=e526]:
            - heading "Biography" [level=3] [ref=e527]
            - paragraph [ref=e528]: Joined in 2021 from Perseus Capital, a quantitative hedge fund, where he was Vice-President. 13 years in systematic trading and portfolio overlays.
            - heading "Previous roles" [level=3] [ref=e529]
            - list [ref=e530]:
              - listitem [ref=e531]: Vice-President, Perseus Capital
              - listitem [ref=e532]: Consultant, Asset Allocation Intervention
            - heading "Education" [level=3] [ref=e533]
            - list [ref=e534]:
              - listitem [ref=e535]: M.Sc. Finance, Markets
              - listitem [ref=e536]: B.Com Finance
  - contentinfo [ref=e537]:
    - generic [ref=e538]:
      - generic [ref=e539]:
        - generic [ref=e540]:
          - link "Nymbus Capital, home" [ref=e541] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e542]
          - paragraph [ref=e551]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e552]:
            - generic [ref=e553]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e554] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e555]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e556] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e557]:
          - heading "Strategies" [level=2] [ref=e558]
          - list [ref=e559]:
            - listitem [ref=e560]:
              - link "Monthly Income" [ref=e561] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e563]:
              - link "Sustainable Enhanced Bonds" [ref=e564] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e566]:
              - link "Multi-Strategy" [ref=e567] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e569]:
              - link "Global Minimum Volatility" [ref=e570] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e572]:
          - heading "Company" [level=2] [ref=e573]
          - list [ref=e574]:
            - listitem [ref=e575]:
              - link "About & team" [ref=e576] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e577]:
              - link "Approach" [ref=e578] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e579]:
              - link "Sustainability" [ref=e580] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e581]:
              - link "Solutions" [ref=e582] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e583]:
          - heading "Resources" [level=2] [ref=e584]
          - list [ref=e585]:
            - listitem [ref=e586]:
              - link "Contact" [ref=e587] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e588]:
              - link "Privacy policy" [ref=e589] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e590]:
              - link "Complaints & code of ethics" [ref=e591] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e592]:
              - link "LinkedIn" [ref=e593] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e597]:
        - paragraph [ref=e598]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e599]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e600]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
        - paragraph [ref=e601]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e602]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
        - paragraph [ref=e603]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
        - paragraph [ref=e604]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e605]:
        - generic [ref=e606]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e607]: PRI signatory
  - alert [ref=e608]
```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | /**
  4  |  * Modal dialogs (team bios, news): centred in the viewport (not at the top-left, which Tailwind's margin reset caused),
  5  |  * page scroll locked while open, focus kept inside, Escape and backdrop close them, nothing overflows on a phone.
  6  |  */
  7  | async function settled(page: Page, testId: string) {
  8  |   await page.getByTestId(testId).evaluate((d) => Promise.all(d.getAnimations().map((a) => a.finished.catch(() => null))));
  9  | }
  10 | 
  11 | async function expectCentred(page: Page, testId: string) {
  12 |   await settled(page, testId);
  13 |   const r = await page.evaluate((id) => {
  14 |     const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
  15 |     const b = el.getBoundingClientRect();
  16 |     const vv = window.visualViewport;
  17 |     const w = vv?.width ?? window.innerWidth, h = vv?.height ?? window.innerHeight;
  18 |     return { cx: b.left + b.width / 2, cy: b.top + b.height / 2, w, h, left: b.left, right: b.right, top: b.top, bottom: b.bottom };
  19 |   }, testId);
  20 |   expect(Math.abs(r.cx - r.w / 2), `horizontal centre ${r.cx} vs ${r.w / 2}`).toBeLessThanOrEqual(2);
  21 |   expect(Math.abs(r.cy - r.h / 2), `vertical centre ${r.cy} vs ${r.h / 2}`).toBeLessThanOrEqual(2);
  22 |   expect(r.left).toBeGreaterThanOrEqual(0);
  23 |   expect(r.right).toBeLessThanOrEqual(r.w + 0.5);
  24 |   expect(r.top).toBeGreaterThanOrEqual(0);
  25 |   expect(r.bottom).toBeLessThanOrEqual(r.h + 0.5);
  26 | }
  27 | 
  28 | test("team: the bio dialog is centred in the viewport, locks the page scroll and traps focus", async ({ page }) => {
  29 |   await page.goto("/team");
  30 |   const people = page.getByTestId("people").locator(":scope > li");
  31 |   await people.first().scrollIntoViewIfNeeded();
  32 |   // scrolled away from the top: the dialog is still centred in the viewport, not on the page
  33 |   await page.evaluate(() => window.scrollBy(0, 300));
  34 |   const opener = people.nth(2).getByRole("button");
  35 |   await opener.click();
  36 |   const dialog = page.getByTestId("bio-dialog");
  37 |   await expect(dialog).toBeVisible();
  38 |   await expectCentred(page, "bio-dialog");
  39 |   expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
  40 |   // focus stays inside the dialog whatever is tabbed
  41 |   for (let i = 0; i < 6; i++) {
  42 |     await page.keyboard.press("Tab");
> 43 |     expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
     |                                                                                    ^ Error: expect(received).toBe(expected) // Object.is equality
  44 |   }
  45 |   await page.keyboard.press("Escape");
  46 |   await expect(dialog).toBeHidden();
  47 |   expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  48 |   await expect(opener).toBeFocused();
  49 | });
  50 | 
  51 | test("team: the bio dialog closes from the backdrop and the close button", async ({ page }) => {
  52 |   await page.goto("/team");
  53 |   const people = page.getByTestId("people").locator(":scope > li");
  54 |   await people.first().scrollIntoViewIfNeeded();
  55 |   const dialog = page.getByTestId("bio-dialog");
  56 |   await people.first().getByRole("button").click();
  57 |   await expect(dialog).toBeVisible();
  58 |   await settled(page, "bio-dialog");
  59 |   await page.mouse.click(4, 4);
  60 |   await expect(dialog).toBeHidden();
  61 |   await people.first().getByRole("button").click();
  62 |   await expect(dialog).toBeVisible();
  63 |   await dialog.getByRole("button", { name: /close|fermer/i }).click();
  64 |   await expect(dialog).toBeHidden();
  65 | });
  66 | 
  67 | test("home: the news dialog is centred in the viewport", async ({ page }) => {
  68 |   await page.goto("/");
  69 |   const card = page.getByTestId("news-mageska");
  70 |   await card.scrollIntoViewIfNeeded();
  71 |   await card.getByRole("button", { name: /read more/i }).click();
  72 |   await expect(page.getByTestId("news-dialog")).toBeVisible();
  73 |   await expectCentred(page, "news-dialog");
  74 | });
  75 | 
```