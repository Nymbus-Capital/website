# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dialog.spec.ts >> team: a press that starts inside the bio and ends on the backdrop does not close it
- Location: e2e/dialog.spec.ts:68:5

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 44
Received:    15.46875
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
            - generic [ref=e71]: Independent Montreal manager of systematic fixed income and futures overlays, since 2013.
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
                - generic [ref=e87]: PhDs
              - generic [ref=e88]:
                - generic [ref=e89]: "6"
                - generic [ref=e90]: CFA or CIM holders
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
        - generic [ref=e116]:
          - generic [ref=e117]:
            - paragraph [ref=e119]: Credentials
            - heading "Scientists, engineers and charterholders" [level=2] [ref=e121]:
              - generic [aria-hidden] [ref=e122]:
                - generic [ref=e123]: Scientists,
                - generic [ref=e124]: engineers
                - generic [ref=e125]: and
                - generic [ref=e126]: charterholders
            - generic [ref=e127]: The scientific method, applied to bonds and listed futures.
          - list [ref=e129]:
            - listitem [ref=e130]:
              - generic [ref=e135]:
                - generic [ref=e136]: "2"
                - generic [ref=e137]: PhDs
            - listitem [ref=e138]:
              - generic [ref=e143]:
                - generic [ref=e144]: "3"
                - generic [ref=e145]: Engineering or computer-science degrees
            - listitem [ref=e146]:
              - generic [ref=e150]:
                - generic [ref=e151]: "9"
                - generic [ref=e152]: Master’s and doctoral degrees
            - listitem [ref=e153]:
              - generic [ref=e158]:
                - generic [ref=e159]: "6"
                - generic [ref=e160]: CFA or CIM holders
            - listitem [ref=e161]:
              - generic [ref=e166]:
                - generic [ref=e167]: 332+
                - generic [ref=e168]: Years of combined experience
          - paragraph [ref=e169]: People counted from the team list below, board included. Experience as stated by each person; “+” marks a lower bound.
      - region [ref=e170]:
        - generic [ref=e172]:
          - generic [ref=e174]:
            - paragraph [ref=e176]: Who we are
            - heading "A research-driven investment firm" [level=2] [ref=e178]:
              - generic [aria-hidden] [ref=e179]:
                - generic [ref=e180]: A
                - generic [ref=e181]: research-driven
                - generic [ref=e182]: investment
                - generic [ref=e183]: firm
            - generic [ref=e184]: Founded in 2013 by Marc Rivet and Gabriel Cefaloni.
            - list [ref=e186]:
              - listitem [ref=e187]: "Two core specialties: systematic fixed income and futures overlays"
              - listitem [ref=e188]: Bonds analyzed one by one; listed futures traded systematically
              - listitem [ref=e189]: Physicists, engineers and charterholders, alongside market veterans
          - generic [ref=e210]:
            - paragraph [ref=e211]: Montreal office
            - paragraph [ref=e215]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - generic [ref=e216]:
              - generic [ref=e217]:
                - term [ref=e218]: Founded
                - definition [ref=e219]: 2013, Montreal
              - generic [ref=e220]:
                - term [ref=e221]: Signatory
                - definition [ref=e222]: PRI, since 2018
            - link "Directions" [ref=e223] [cursor=pointer]:
              - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
      - region [ref=e227]:
        - generic [ref=e228]:
          - generic [ref=e229]:
            - paragraph [ref=e231]: Our values
            - heading "What guides the way we work" [level=2] [ref=e233]:
              - generic [aria-hidden] [ref=e234]:
                - generic [ref=e235]: What
                - generic [ref=e236]: guides
                - generic [ref=e237]: the
                - generic [ref=e238]: way
                - generic [ref=e239]: we
                - generic [ref=e240]: work
          - generic [ref=e241]:
            - generic [ref=e242]:
              - heading "Innovation" [level=3] [ref=e246]
              - paragraph [ref=e248]: We adopt what research supports.
            - generic [ref=e249]:
              - heading "Agility" [level=3] [ref=e253]
              - paragraph [ref=e255]: Research reaches production quickly.
            - generic [ref=e256]:
              - heading "Accountability" [level=3] [ref=e261]
              - paragraph [ref=e263]: Transparent methods. Fiduciary duty first.
            - generic [ref=e264]:
              - heading "Integrity" [level=3] [ref=e270]
              - paragraph [ref=e272]: Clients’ interests first.
            - generic [ref=e273]:
              - heading "Collaboration" [level=3] [ref=e280]
              - paragraph [ref=e282]: Scientists and practitioners challenge each other.
      - region [ref=e283]:
        - generic [ref=e284]:
          - generic [ref=e285]:
            - paragraph [ref=e287]: Milestones
            - heading "Our story so far" [level=2] [ref=e289]:
              - generic [aria-hidden] [ref=e290]:
                - generic [ref=e291]: Our
                - generic [ref=e292]: story
                - generic [ref=e293]: so
                - generic [ref=e294]: far
          - list [ref=e296]:
            - listitem [ref=e297]:
              - paragraph [ref=e299]: "2013"
              - heading "Nymbus is founded" [level=3] [ref=e300]
            - listitem [ref=e301]:
              - paragraph [ref=e303]: "2018"
              - heading "PRI signatory" [level=3] [ref=e304]
            - listitem [ref=e305]:
              - paragraph [ref=e307]: "2021"
              - heading "Monthly Income fund launched" [level=3] [ref=e308]
            - listitem [ref=e309]:
              - paragraph [ref=e311]: "2023"
              - heading "Partnership with Dans la rue" [level=3] [ref=e312]
              - paragraph [ref=e313]: Support for youth at risk.
            - listitem [ref=e314]:
              - paragraph [ref=e316]: "2024"
              - heading "Tobacco-Free Finance Pledge" [level=3] [ref=e317]
            - listitem [ref=e318]:
              - paragraph [ref=e320]: "2025"
              - heading "Partnership with Mageska Capital" [level=3] [ref=e321]
              - paragraph [ref=e322]: A portable alpha strategy.
      - region [ref=e323]:
        - generic [ref=e324]:
          - generic [ref=e325]:
            - paragraph [ref=e327]: Our team
            - heading "The people behind the science" [level=2] [ref=e329]:
              - generic [aria-hidden] [ref=e330]:
                - generic [ref=e331]: The
                - generic [ref=e332]: people
                - generic [ref=e333]: behind
                - generic [ref=e334]: the
                - generic [ref=e335]: science
            - generic [ref=e336]: Select a person to read their biography.
          - group "Filter by department" [ref=e338]:
            - button "Everyone" [pressed] [ref=e339] [cursor=pointer]:
              - text: Everyone
              - generic [aria-hidden] [ref=e340]: "18"
            - button "Leadership" [ref=e341] [cursor=pointer]:
              - text: Leadership
              - generic [aria-hidden] [ref=e342]: "3"
            - button "Quantitative research" [ref=e343] [cursor=pointer]:
              - text: Quantitative research
              - generic [aria-hidden] [ref=e344]: "4"
            - button "Investment team" [ref=e345] [cursor=pointer]:
              - text: Investment team
              - generic [aria-hidden] [ref=e346]: "9"
            - button "Operations" [ref=e347] [cursor=pointer]:
              - text: Operations
              - generic [aria-hidden] [ref=e348]: "7"
            - button "Board" [ref=e349] [cursor=pointer]:
              - text: Board
              - generic [aria-hidden] [ref=e350]: "5"
          - paragraph [ref=e351]: 18 people shown
          - list [ref=e352]:
            - listitem [ref=e353]:
              - button "Read the biography of Marc Rivet" [ref=e354] [cursor=pointer]:
                - generic [ref=e356]:
                  - generic [ref=e357]: Marc Rivet
                  - generic [ref=e358]: Co-founder & Chief Executive Officer
            - listitem [ref=e363]:
              - button "Read the biography of Gabriel Cefaloni" [ref=e364] [cursor=pointer]:
                - generic [ref=e366]:
                  - generic [ref=e367]: Gabriel Cefaloni
                  - generic [ref=e368]: Co-founder & Chief Investment Officer
                  - generic [ref=e369]: CIM
            - listitem [ref=e375]:
              - button "Read the biography of Mathieu Poulin-Brière" [ref=e376] [cursor=pointer]:
                - generic [ref=e378]:
                  - generic [ref=e379]: Mathieu Poulin-Brière
                  - generic [ref=e380]: Partner, Systematic Overlays
                  - generic [ref=e381]: M.Sc.
            - listitem [ref=e387]:
              - button "Read the biography of Jessica Martins" [ref=e388] [cursor=pointer]:
                - generic [ref=e390]:
                  - generic [ref=e391]: Jessica Martins
                  - generic [ref=e392]: Quantitative Researcher & Data Scientist
                  - generic [ref=e393]: PhD
            - listitem [ref=e399]:
              - button "Read the biography of Jean-Philippe Lejeune" [ref=e400] [cursor=pointer]:
                - generic [ref=e402]:
                  - generic [ref=e403]: Jean-Philippe Lejeune
                  - generic [ref=e404]: Quantitative Developer & Trader
                  - generic [ref=e405]:
                    - generic [ref=e406]: CFA
                    - generic [ref=e407]: M.Sc.
            - listitem [ref=e412]:
              - button "Read the biography of Olivier Cyr-Choinière" [ref=e413] [cursor=pointer]:
                - generic [ref=e415]:
                  - generic [ref=e416]: Olivier Cyr-Choinière
                  - generic [ref=e417]: Quantitative Analyst
                  - generic [ref=e418]:
                    - generic [ref=e419]: PhD
                    - generic [ref=e420]: M.Sc.
            - listitem [ref=e425]:
              - button "Read the biography of Guy Liébart" [ref=e426] [cursor=pointer]:
                - generic [ref=e428]:
                  - generic [ref=e429]: Guy Liébart
                  - generic [ref=e430]: Portfolio Manager
                  - generic [ref=e431]: MBA
            - listitem [ref=e437]:
              - button "Read the biography of François-Olivier Laplante" [ref=e438] [cursor=pointer]:
                - generic [ref=e440]:
                  - generic [ref=e441]: François-Olivier Laplante
                  - generic [ref=e442]: Portfolio Manager, REITs
                  - generic [ref=e443]: CIM
            - listitem [ref=e449]:
              - button "Read the biography of Lyes Hammadi" [ref=e450] [cursor=pointer]:
                - generic [ref=e452]:
                  - generic [ref=e453]: Lyes Hammadi
                  - generic [ref=e454]: Lead Software Engineer, Investments
            - listitem [ref=e459]:
              - button "Read the biography of Jason Laliberte" [ref=e460] [cursor=pointer]:
                - generic [aria-hidden] [ref=e462]: JL
                - generic [ref=e463]:
                  - generic [ref=e464]: Jason Laliberte
                  - generic [ref=e465]: Consultant, Equities Asset Allocation
                  - generic [ref=e466]:
                    - generic [ref=e467]: CFA
                    - generic [ref=e468]: M.Sc.
            - listitem [ref=e473]:
              - button "Read the biography of Diane Dusabimana" [ref=e474] [cursor=pointer]:
                - generic [ref=e476]:
                  - generic [ref=e477]: Diane Dusabimana
                  - generic [ref=e478]: Chief Compliance Officer
                  - generic [ref=e479]:
                    - generic [ref=e480]: CFA
                    - generic [ref=e481]: CPA
                    - generic [ref=e482]: MBA
            - listitem [ref=e487]:
              - button "Read the biography of Jennifer Pinkerton" [ref=e488] [cursor=pointer]:
                - generic [ref=e490]:
                  - generic [ref=e491]: Jennifer Pinkerton
                  - generic [ref=e492]: Portfolio Administrator
                  - generic [ref=e493]: CFA
            - listitem [ref=e499]:
              - button "Read the biography of Fraser Coburn" [ref=e500] [cursor=pointer]:
                - generic [ref=e502]:
                  - generic [ref=e503]: Fraser Coburn
                  - generic [ref=e504]: Director, Client Relations
            - listitem [ref=e509]:
              - button "Read the biography of Luca Ieraci" [ref=e510] [cursor=pointer]:
                - generic [aria-hidden] [ref=e512]: LI
                - generic [ref=e513]:
                  - generic [ref=e514]: Luca Ieraci
                  - generic [ref=e515]: Consultant, Software Development
            - listitem [ref=e520]:
              - button "Read the biography of Xavier Girard" [ref=e521] [cursor=pointer]:
                - generic [ref=e523]:
                  - generic [ref=e524]: Xavier Girard
                  - generic [ref=e525]: Senior Associate, Client Relations — Advisor Channel
            - listitem [ref=e530]:
              - button "Read the biography of Danira Csano" [ref=e531] [cursor=pointer]:
                - generic [ref=e533]:
                  - generic [ref=e534]: Danira Csano
                  - generic [ref=e535]: Administrative Coordinator
            - listitem [ref=e540]:
              - button "Read the biography of Jean Turmel" [ref=e541] [cursor=pointer]:
                - generic [ref=e543]:
                  - generic [ref=e544]: Jean Turmel
                  - generic [ref=e545]: Chairman of the Board
                  - generic [ref=e546]: MBA
            - listitem [ref=e552]:
              - button "Read the biography of Jean-Luc Landry" [ref=e553] [cursor=pointer]:
                - generic [ref=e555]:
                  - generic [ref=e556]: Jean-Luc Landry
                  - generic [ref=e557]: Board Member
                  - generic [ref=e558]: M.Sc.
      - generic [ref=e566]:
        - heading "Work with us" [level=2] [ref=e567]:
          - generic [aria-hidden] [ref=e568]:
            - generic [ref=e569]: Work
            - generic [ref=e570]: with
            - generic [ref=e571]: us
        - paragraph [ref=e573]: "Researchers, engineers and investors: write to us."
        - generic [ref=e575]:
          - link "Send us your résumé" [ref=e576] [cursor=pointer]:
            - /url: mailto:info@nymbus.ca?subject=Careers
          - link "Contact us" [ref=e579] [cursor=pointer]:
            - /url: /contact
      - dialog [active] [ref=e580]:
        - generic [ref=e581]:
          - button "Close" [ref=e582] [cursor=pointer]
          - generic [ref=e588]:
            - heading "Marc Rivet" [level=2] [ref=e589]
            - paragraph [ref=e590]: Co-founder & Chief Executive Officer
            - paragraph [ref=e591]: 30 years of experience
            - link "LinkedIn profile" [ref=e592] [cursor=pointer]:
              - /url: https://www.linkedin.com/in/mrivet/
          - generic [ref=e595]:
            - heading "Biography" [level=3] [ref=e596]
            - paragraph [ref=e597]: Co-founded Nymbus Capital in 2013 to run systematic fixed income and derivatives strategies; 30 years of experience. Previously founded Groupe ARB and started as a fixed income trader.
            - heading "Previous roles" [level=3] [ref=e598]
            - list [ref=e599]:
              - listitem [ref=e600]: President, Groupe ARB
              - listitem [ref=e601]: Fixed Income Trader
            - heading "Education" [level=3] [ref=e602]
            - list [ref=e603]:
              - listitem [ref=e604]: B.Com Finance, Concordia University
              - listitem [ref=e605]: Partners, Directors and Officers (CSI)
  - contentinfo [ref=e606]:
    - generic [ref=e607]:
      - generic [ref=e608]:
        - generic [ref=e609]:
          - link "Nymbus Capital, home" [ref=e610] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e611]
          - paragraph [ref=e620]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e621]:
            - generic [ref=e622]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e623] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e624]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e625] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e626]:
          - heading "Strategies" [level=2] [ref=e627]
          - list [ref=e628]:
            - listitem [ref=e629]:
              - link "Monthly Income" [ref=e630] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e632]:
              - link "Sustainable Enhanced Bonds" [ref=e633] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e635]:
              - link "Multi-Strategy" [ref=e636] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e638]:
              - link "Global Minimum Volatility" [ref=e639] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e641]:
          - heading "Company" [level=2] [ref=e642]
          - list [ref=e643]:
            - listitem [ref=e644]:
              - link "About & team" [ref=e645] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e646]:
              - link "Approach" [ref=e647] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e648]:
              - link "Sustainability" [ref=e649] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e650]:
              - link "Solutions" [ref=e651] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e652]:
          - heading "Resources" [level=2] [ref=e653]
          - list [ref=e654]:
            - listitem [ref=e655]:
              - link "Contact" [ref=e656] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e657]:
              - link "Privacy policy" [ref=e658] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e659]:
              - link "Complaints & code of ethics" [ref=e660] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e661]:
              - link "LinkedIn" [ref=e662] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e666]:
        - paragraph [ref=e667]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e668]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e669]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
        - paragraph [ref=e670]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e671]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
        - paragraph [ref=e672]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
        - paragraph [ref=e673]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e674]:
        - generic [ref=e675]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e676]: PRI signatory
  - alert [ref=e677]
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
  16 |     // the layout viewport (without the reserved scrollbar gutter) is what a fixed, inset:0 dialog centres in
  17 |     const w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
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
  43 |     // inside the dialog, or nowhere (body: focus handed to the browser UI); never on the inert page behind it
  44 |     expect(await page.evaluate(() => { const a = document.activeElement; return !a || a === document.body || !!a.closest("dialog"); })).toBe(true);
  45 |   }
  46 |   await page.keyboard.press("Escape");
  47 |   await expect(dialog).toBeHidden();
  48 |   expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  49 |   await expect(opener).toBeFocused();
  50 | });
  51 | 
  52 | test("team: the bio dialog closes from the backdrop and the close button", async ({ page }) => {
  53 |   await page.goto("/team");
  54 |   const people = page.getByTestId("people").locator(":scope > li");
  55 |   await people.first().scrollIntoViewIfNeeded();
  56 |   const dialog = page.getByTestId("bio-dialog");
  57 |   await people.first().getByRole("button").click();
  58 |   await expect(dialog).toBeVisible();
  59 |   await settled(page, "bio-dialog");
  60 |   await page.mouse.click(4, 4);
  61 |   await expect(dialog).toBeHidden();
  62 |   await people.first().getByRole("button").click();
  63 |   await expect(dialog).toBeVisible();
  64 |   await dialog.getByRole("button", { name: /close|fermer/i }).click();
  65 |   await expect(dialog).toBeHidden();
  66 | });
  67 | 
  68 | test("team: a press that starts inside the bio and ends on the backdrop does not close it", async ({ page }) => {
  69 |   await page.goto("/team");
  70 |   const people = page.getByTestId("people").locator(":scope > li");
  71 |   await people.first().scrollIntoViewIfNeeded();
  72 |   const dialog = page.getByTestId("bio-dialog");
  73 |   await people.first().getByRole("button").click();
  74 |   await settled(page, "bio-dialog");
  75 |   const box = (await dialog.boundingBox())!;
  76 |   await page.mouse.move(box.x + box.width / 2, box.y + 40);
  77 |   await page.mouse.down();
  78 |   await page.mouse.move(4, 4);
  79 |   await page.mouse.up();
  80 |   await expect(dialog).toBeVisible();
  81 |   // the close button keeps a 44 px hit area
  82 |   const x = await dialog.getByRole("button", { name: /close|fermer/i }).boundingBox();
> 83 |   expect(x!.width).toBeGreaterThanOrEqual(44);
     |                    ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  84 |   expect(x!.height).toBeGreaterThanOrEqual(44);
  85 | });
  86 | 
  87 | test("home: the news dialog is centred in the viewport", async ({ page }) => {
  88 |   await page.goto("/");
  89 |   const card = page.getByTestId("news-mageska");
  90 |   await card.scrollIntoViewIfNeeded();
  91 |   await card.getByRole("button", { name: /read more/i }).click();
  92 |   await expect(page.getByTestId("news-dialog")).toBeVisible();
  93 |   await expectCentred(page, "news-dialog");
  94 | });
  95 | 
```