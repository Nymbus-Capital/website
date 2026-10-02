# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dialog.spec.ts >> team: the bio dialog is centred in the viewport, locks the page scroll and traps focus
- Location: e2e/dialog.spec.ts:28:5

# Error details

```
Error: horizontal centre 712.5 vs 720

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 2
Received:    7.5
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
      - navigation "Primary" [ref=e15]:
        - list [ref=e16]:
          - listitem [ref=e17]:
            - link "Strategies" [ref=e18] [cursor=pointer]:
              - /url: /strategies
          - listitem [ref=e21]:
            - link "Approach" [ref=e22] [cursor=pointer]:
              - /url: /approach
          - listitem [ref=e23]:
            - link "About" [ref=e24] [cursor=pointer]:
              - /url: /team
          - listitem [ref=e25]:
            - link "Solutions" [ref=e26] [cursor=pointer]:
              - /url: /solutions
          - listitem [ref=e27]:
            - link "Sustainability" [ref=e28] [cursor=pointer]:
              - /url: /sustainability
          - listitem [ref=e29]:
            - link "Contact" [ref=e30] [cursor=pointer]:
              - /url: /contact
      - button "Afficher le site en français" [ref=e32] [cursor=pointer]:
        - generic [aria-hidden] [ref=e33]: en
        - generic [aria-hidden] [ref=e34]: fr
  - main [ref=e35]:
    - generic [ref=e36]:
      - generic [ref=e51]:
        - navigation "Breadcrumb" [ref=e52]:
          - list [ref=e53]:
            - listitem [ref=e54]:
              - link "Home" [ref=e55] [cursor=pointer]:
                - /url: /
            - listitem [ref=e58]:
              - generic [ref=e59]: About Nymbus
        - generic [ref=e60]:
          - generic [ref=e61]:
            - paragraph [ref=e63]: About Nymbus
            - heading "Scientists and market veterans" [level=1] [ref=e65]:
              - generic [aria-hidden] [ref=e66]:
                - generic [ref=e67]: Scientists
                - generic [ref=e68]: and
                - generic [ref=e69]: market
                - generic [ref=e70]: veterans
            - generic [ref=e71]: Independent Montreal portfolio manager, since 2013.
            - generic [ref=e74]:
              - link "Meet the team" [ref=e75] [cursor=pointer]:
                - /url: "#people"
              - link "Contact us" [ref=e78] [cursor=pointer]:
                - /url: /contact
          - generic [ref=e80]:
            - generic [ref=e81]:
              - generic [ref=e82]:
                - generic [ref=e83]: "18"
                - generic [ref=e84]: people
              - generic [ref=e85]:
                - generic [ref=e86]: "2"
                - generic [ref=e87]: PhDs in physics
              - generic [ref=e88]:
                - generic [ref=e89]: "4"
                - generic [ref=e90]: CFA charterholders
              - generic [ref=e91]:
                - generic [ref=e92]: "2013"
                - generic [ref=e93]: founded in Montreal
            - list [aria-hidden] [ref=e94]:
              - listitem [ref=e95]
              - listitem [ref=e97]
              - listitem [ref=e99]
              - listitem [ref=e101]
              - listitem [ref=e103]
              - listitem [ref=e105]
              - listitem [ref=e107]
              - listitem [ref=e109]
      - region [ref=e115]:
        - generic [ref=e117]:
          - generic [ref=e119]:
            - paragraph [ref=e121]: Who we are
            - heading "A research-driven investment firm" [level=2] [ref=e123]:
              - generic [aria-hidden] [ref=e124]:
                - generic [ref=e125]: A
                - generic [ref=e126]: research-driven
                - generic [ref=e127]: investment
                - generic [ref=e128]: firm
            - generic [ref=e129]: Founded in 2013 by Marc Rivet and Gabriel Cefaloni.
            - list [ref=e131]:
              - listitem [ref=e132]: Bond markets produce more data than a team can analyze
              - listitem [ref=e133]: A scientific process puts that data to work
              - listitem [ref=e134]: Physicists and computer scientists, alongside fixed income managers
          - generic [ref=e155]:
            - paragraph [ref=e156]: Montreal office
            - paragraph [ref=e160]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - generic [ref=e161]:
              - generic [ref=e162]:
                - term [ref=e163]: Founded
                - definition [ref=e164]: 2013, Montreal
              - generic [ref=e165]:
                - term [ref=e166]: Signatory
                - definition [ref=e167]: PRI, since 2018
            - link "Directions" [ref=e168] [cursor=pointer]:
              - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
      - region [ref=e172]:
        - generic [ref=e173]:
          - generic [ref=e174]:
            - paragraph [ref=e176]: Our values
            - heading "What guides the way we work" [level=2] [ref=e178]:
              - generic [aria-hidden] [ref=e179]:
                - generic [ref=e180]: What
                - generic [ref=e181]: guides
                - generic [ref=e182]: the
                - generic [ref=e183]: way
                - generic [ref=e184]: we
                - generic [ref=e185]: work
          - generic [ref=e186]:
            - generic [ref=e187]:
              - heading "Innovation" [level=3] [ref=e191]
              - paragraph [ref=e193]: We adopt what research supports.
            - generic [ref=e194]:
              - heading "Agility" [level=3] [ref=e198]
              - paragraph [ref=e200]: Research reaches production quickly.
            - generic [ref=e201]:
              - heading "Accountability" [level=3] [ref=e206]
              - paragraph [ref=e208]: Transparent methods. Fiduciary duty first.
            - generic [ref=e209]:
              - heading "Integrity" [level=3] [ref=e215]
              - paragraph [ref=e217]: Clients’ interests first.
            - generic [ref=e218]:
              - heading "Collaboration" [level=3] [ref=e225]
              - paragraph [ref=e227]: Scientists and practitioners challenge each other.
      - region [ref=e228]:
        - generic [ref=e229]:
          - generic [ref=e230]:
            - paragraph [ref=e232]: Milestones
            - heading "Our story so far" [level=2] [ref=e234]:
              - generic [aria-hidden] [ref=e235]:
                - generic [ref=e236]: Our
                - generic [ref=e237]: story
                - generic [ref=e238]: so
                - generic [ref=e239]: far
          - list [ref=e241]:
            - listitem [ref=e242]:
              - paragraph [ref=e244]: "2013"
              - heading "Nymbus is founded" [level=3] [ref=e245]
            - listitem [ref=e246]:
              - paragraph [ref=e248]: "2018"
              - heading "PRI signatory" [level=3] [ref=e249]
            - listitem [ref=e250]:
              - paragraph [ref=e252]: "2021"
              - heading "Monthly Income fund launched" [level=3] [ref=e253]
            - listitem [ref=e254]:
              - paragraph [ref=e256]: "2023"
              - heading "Partnership with Dans la rue" [level=3] [ref=e257]
              - paragraph [ref=e258]: Support for youth at risk.
            - listitem [ref=e259]:
              - paragraph [ref=e261]: "2024"
              - heading "Tobacco-Free Finance Pledge" [level=3] [ref=e262]
            - listitem [ref=e263]:
              - paragraph [ref=e265]: "2025"
              - heading "Partnership with Mageska Capital" [level=3] [ref=e266]
              - paragraph [ref=e267]: A portable alpha strategy.
      - region [ref=e268]:
        - generic [ref=e269]:
          - generic [ref=e270]:
            - paragraph [ref=e272]: Our team
            - heading "The people behind the science" [level=2] [ref=e274]:
              - generic [aria-hidden] [ref=e275]:
                - generic [ref=e276]: The
                - generic [ref=e277]: people
                - generic [ref=e278]: behind
                - generic [ref=e279]: the
                - generic [ref=e280]: science
            - generic [ref=e281]: Select a person to read their biography.
          - group "Filter by department" [ref=e283]:
            - button "Everyone" [pressed] [ref=e284] [cursor=pointer]:
              - text: Everyone
              - generic [aria-hidden] [ref=e285]: "18"
            - button "Leadership" [ref=e286] [cursor=pointer]:
              - text: Leadership
              - generic [aria-hidden] [ref=e287]: "3"
            - button "Quantitative research" [ref=e288] [cursor=pointer]:
              - text: Quantitative research
              - generic [aria-hidden] [ref=e289]: "4"
            - button "Investment team" [ref=e290] [cursor=pointer]:
              - text: Investment team
              - generic [aria-hidden] [ref=e291]: "9"
            - button "Operations" [ref=e292] [cursor=pointer]:
              - text: Operations
              - generic [aria-hidden] [ref=e293]: "7"
            - button "Board" [ref=e294] [cursor=pointer]:
              - text: Board
              - generic [aria-hidden] [ref=e295]: "5"
          - paragraph [ref=e296]: 18 people shown
          - list [ref=e297]:
            - listitem [ref=e298]:
              - button "Read the biography of Marc Rivet" [ref=e299] [cursor=pointer]:
                - generic [ref=e301]:
                  - generic [ref=e302]: Marc Rivet
                  - generic [ref=e303]: Co-founder & Chief Executive Officer
            - listitem [ref=e308]:
              - button "Read the biography of Gabriel Cefaloni" [ref=e309] [cursor=pointer]:
                - generic [ref=e311]:
                  - generic [ref=e312]: Gabriel Cefaloni
                  - generic [ref=e313]: Co-founder & Chief Investment Officer
                  - generic [ref=e314]: CIM
            - listitem [ref=e320]:
              - button "Read the biography of Mathieu Poulin-Brière" [ref=e321] [cursor=pointer]:
                - generic [ref=e323]:
                  - generic [ref=e324]: Mathieu Poulin-Brière
                  - generic [ref=e325]: Vice-President, Systematic Overlays
                  - generic [ref=e326]: M.Sc. Finance
            - listitem [ref=e332]:
              - button "Read the biography of Jessica Martins" [ref=e333] [cursor=pointer]:
                - generic [ref=e335]:
                  - generic [ref=e336]: Jessica Martins
                  - generic [ref=e337]: Team Lead, Quantitative Research
                  - generic [ref=e338]: PhD, Physics, Astrophysics
            - listitem [ref=e344]:
              - button "Read the biography of Jean-Philippe Lejeune" [ref=e345] [cursor=pointer]:
                - generic [ref=e347]:
                  - generic [ref=e348]: Jean-Philippe Lejeune
                  - generic [ref=e349]: Associate PM & Quantitative Developer
                  - generic [ref=e350]:
                    - generic [ref=e351]: CFA
                    - generic [ref=e352]: M.Sc. Finance
            - listitem [ref=e357]:
              - button "Read the biography of Olivier Cyr-Choinière" [ref=e358] [cursor=pointer]:
                - generic [ref=e360]:
                  - generic [ref=e361]: Olivier Cyr-Choinière
                  - generic [ref=e362]: Quantitative Researcher
                  - generic [ref=e363]:
                    - generic [ref=e364]: PhD, Physics, Superconductivity
                    - generic [ref=e365]: M.Sc. Financial Engineering
            - listitem [ref=e370]:
              - button "Read the biography of Guy Liébart" [ref=e371] [cursor=pointer]:
                - generic [ref=e373]:
                  - generic [ref=e374]: Guy Liébart
                  - generic [ref=e375]: Portfolio Manager
                  - generic [ref=e376]: MBA
            - listitem [ref=e382]:
              - button "Read the biography of François-Olivier Laplante" [ref=e383] [cursor=pointer]:
                - generic [ref=e385]:
                  - generic [ref=e386]: François-Olivier Laplante
                  - generic [ref=e387]: Portfolio Manager, REITs
                  - generic [ref=e388]: CIM
            - listitem [ref=e394]:
              - button "Read the biography of Lyes Hammadi" [ref=e395] [cursor=pointer]:
                - generic [aria-hidden] [ref=e397]: LH
                - generic [ref=e398]:
                  - generic [ref=e399]: Lyes Hammadi
                  - generic [ref=e400]: Lead Software Engineer, Investment Platforms
            - listitem [ref=e405]:
              - button "Read the biography of Jason Laliberte" [ref=e406] [cursor=pointer]:
                - generic [aria-hidden] [ref=e408]: JL
                - generic [ref=e409]:
                  - generic [ref=e410]: Jason Laliberte
                  - generic [ref=e411]: Consultant, Equities Asset Allocation
                  - generic [ref=e412]:
                    - generic [ref=e413]: CFA
                    - generic [ref=e414]: M.Sc. Finance
            - listitem [ref=e419]:
              - button "Read the biography of Diane Dusabimana" [ref=e420] [cursor=pointer]:
                - generic [ref=e422]:
                  - generic [ref=e423]: Diane Dusabimana
                  - generic [ref=e424]: Chief Compliance Officer
                  - generic [ref=e425]:
                    - generic [ref=e426]: MBA
                    - generic [ref=e427]: CPA
                    - generic [ref=e428]: CFA
            - listitem [ref=e433]:
              - button "Read the biography of Jennifer Pinkerton" [ref=e434] [cursor=pointer]:
                - generic [ref=e436]:
                  - generic [ref=e437]: Jennifer Pinkerton
                  - generic [ref=e438]: Portfolio Administrator
                  - generic [ref=e439]: CFA
            - listitem [ref=e445]:
              - button "Read the biography of Fraser Coburn" [ref=e446] [cursor=pointer]:
                - generic [aria-hidden] [ref=e448]: FC
                - generic [ref=e449]:
                  - generic [ref=e450]: Fraser Coburn
                  - generic [ref=e451]: Director, Client Relations
            - listitem [ref=e456]:
              - button "Read the biography of Luca Ieraci" [ref=e457] [cursor=pointer]:
                - generic [aria-hidden] [ref=e459]: LI
                - generic [ref=e460]:
                  - generic [ref=e461]: Luca Ieraci
                  - generic [ref=e462]: Consultant, Software Development
            - listitem [ref=e467]:
              - button "Read the biography of Xavier Girard" [ref=e468] [cursor=pointer]:
                - generic [ref=e470]:
                  - generic [ref=e471]: Xavier Girard
                  - generic [ref=e472]: Senior Associate, Client Relations — Advisor Channel
            - listitem [ref=e477]:
              - button "Read the biography of Danira Csano" [ref=e478] [cursor=pointer]:
                - generic [ref=e480]:
                  - generic [ref=e481]: Danira Csano
                  - generic [ref=e482]: Administrative Coordinator
            - listitem [ref=e487]:
              - button "Read the biography of Jean Turmel" [ref=e488] [cursor=pointer]:
                - generic [ref=e490]:
                  - generic [ref=e491]: Jean Turmel
                  - generic [ref=e492]: Chairman of the Board
                  - generic [ref=e493]: MBA
            - listitem [ref=e499]:
              - button "Read the biography of Jean-Luc Landry" [ref=e500] [cursor=pointer]:
                - generic [ref=e502]:
                  - generic [ref=e503]: Jean-Luc Landry
                  - generic [ref=e504]: Board Member
                  - generic [ref=e505]: M.Sc. Economics
      - generic [ref=e513]:
        - heading "Work with us" [level=2] [ref=e514]:
          - generic [aria-hidden] [ref=e515]:
            - generic [ref=e516]: Work
            - generic [ref=e517]: with
            - generic [ref=e518]: us
        - paragraph [ref=e520]: "Researchers, engineers and investors: write to us."
        - generic [ref=e522]:
          - link "Send us your résumé" [ref=e523] [cursor=pointer]:
            - /url: mailto:info@nymbus.ca?subject=Careers
          - link "Contact us" [ref=e526] [cursor=pointer]:
            - /url: /contact
      - dialog [ref=e527]:
        - generic [ref=e528]:
          - button "Close" [active] [ref=e529] [cursor=pointer]
          - generic [ref=e535]:
            - heading "Mathieu Poulin-Brière" [level=2] [ref=e536]
            - paragraph [ref=e537]: Vice-President, Systematic Overlays
            - paragraph [ref=e538]:
              - generic [ref=e539]: M.Sc. Finance
          - generic [ref=e540]:
            - heading "Biography" [level=3] [ref=e541]
            - paragraph [ref=e542]: Joined in 2021 from Perseus Capital, a quantitative hedge fund, where he was Vice-President. 13 years in systematic trading and portfolio overlays.
            - heading "Previous roles" [level=3] [ref=e543]
            - list [ref=e544]:
              - listitem [ref=e545]: Vice-President, Perseus Capital
              - listitem [ref=e546]: Consultant, Asset Allocation Intervention
            - heading "Education" [level=3] [ref=e547]
            - list [ref=e548]:
              - listitem [ref=e549]: M.Sc. Finance, Markets
              - listitem [ref=e550]: B.Com Finance
  - contentinfo [ref=e551]:
    - generic [ref=e552]:
      - generic [ref=e553]:
        - generic [ref=e554]:
          - link "Nymbus Capital, home" [ref=e555] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e556]
          - paragraph [ref=e565]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e566]:
            - generic [ref=e567]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e568] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e569]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e570] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e571]:
          - heading "Strategies" [level=2] [ref=e572]
          - list [ref=e573]:
            - listitem [ref=e574]:
              - link "Monthly Income" [ref=e575] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e577]:
              - link "Sustainable Enhanced Bonds" [ref=e578] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e580]:
              - link "Multi-Strategy" [ref=e581] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e583]:
              - link "Global Minimum Volatility" [ref=e584] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e586]:
          - heading "Company" [level=2] [ref=e587]
          - list [ref=e588]:
            - listitem [ref=e589]:
              - link "About & team" [ref=e590] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e591]:
              - link "Approach" [ref=e592] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e593]:
              - link "Sustainability" [ref=e594] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e595]:
              - link "Solutions" [ref=e596] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e597]:
          - heading "Resources" [level=2] [ref=e598]
          - list [ref=e599]:
            - listitem [ref=e600]:
              - link "Contact" [ref=e601] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e602]:
              - link "Privacy policy" [ref=e603] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e604]:
              - link "Complaints & code of ethics" [ref=e605] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e606]:
              - link "LinkedIn" [ref=e607] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e611]:
        - paragraph [ref=e612]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e613]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e614]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
        - paragraph [ref=e615]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e616]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
        - paragraph [ref=e617]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
        - paragraph [ref=e618]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e619]:
        - generic [ref=e620]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e621]: PRI signatory
  - alert [ref=e622]
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
> 20 |   expect(Math.abs(r.cx - r.w / 2), `horizontal centre ${r.cx} vs ${r.w / 2}`).toBeLessThanOrEqual(2);
     |                                                                               ^ Error: horizontal centre 712.5 vs 720
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
  43 |     expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
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