# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> without JavaScript every panel is on the page
- Location: e2e/fund.spec.ts:257:5

# Error details

```
Error: expect(locator).toBeAttached() failed

Locator: getByTestId('perf-soon')
Expected: attached
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeAttached" getByTestId('perf-soon') with timeout 10000ms
  - waiting for getByTestId('perf-soon')

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - navigation "Primary":
    - list:
      - listitem:
        - link "Strategies":
          - /url: /strategies
      - listitem:
        - link "Approach":
          - /url: /approach
      - listitem:
        - link "About":
          - /url: /team
      - listitem:
        - link "Solutions":
          - /url: /solutions
      - listitem:
        - link "Sustainability":
          - /url: /sustainability
      - listitem:
        - link "Contact":
          - /url: /contact
  - button "Afficher le site en français"
- main:
  - navigation "Breadcrumb":
    - list:
      - listitem:
        - link "Home":
          - /url: /
      - listitem:
        - link "Strategies":
          - /url: /strategies
      - listitem: Monthly Income
  - paragraph: Short-term fixed income
  - heading "Nymbus Monthly Income Fund" [level=1]
  - paragraph: Monthly income from short-term corporate bonds
  - paragraph: Short-term Canadian corporate bonds selected by our two-system process, with a futures overlay designed to have low correlation with bonds and to offset part of bond losses; it may not do so and can lose money. Distributions are not guaranteed, may change and may include a return of capital.
  - text: Mutual fund Risk Low to medium Sample data
  - link "Contact us":
    - /url: /contact
  - link "Fund documents":
    - /url: "#documents"
  - text: Net asset value per unit As of Sep 28, 2026
  - radiogroup "Choose a series":
    - radio "Series F" [checked]
    - radio "Series FP"
    - radio "Series F USD"
    - radio "Series A"
  - text: Prospectus class
  - paragraph: This series is offered under the simplified prospectus.
  - text: $10.0397
  - paragraph: −0.0190 (−0.19%) vs previous valuation day
  - term: Series
  - definition: F
  - term: FundServ
  - definition:
    - code: LDM081
  - term: Currency
  - definition: CAD
  - term: Fund launch
  - definition: October 5, 2021
  - term: Benchmark
  - definition: FTSE Canada Short Term Corporate Bond Index
  - region "Returns":
    - heading "Returns" [level=2]
    - paragraph: Series F, net of fees · as of August 31, 2026 Prospectus class
    - list:
      - listitem: 1 month −0.15%
      - listitem: 3 months −0.67%
      - listitem: Year to date −0.26%
      - listitem: 1 year +0.74%
      - listitem: Since inception +0.83%
    - paragraph: "* Periods over one year are annualized."
  - tabpanel "Overview":
    - heading "Overview" [level=2]
    - heading "What the fund does" [level=3]
    - paragraph: Monthly income from short-term Canadian corporate bonds, with low rate sensitivity. Distributions are not guaranteed, may change and may include a return of capital.
    - heading "Investment approach" [level=3]
    - list:
      - listitem: Mainly short-term Canadian corporate bonds
      - listitem: Selected by our two-system quantitative process
      - listitem: Credit risk and relative value, bond by bond
    - paragraph: The futures overlay is designed to have low correlation with bonds and to offset part of bond losses when volatility rises; it may not do so and can lose money. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.
    - heading "Returns" [level=3]
    - link "See all performance":
      - /url: "#performance"
    - paragraph: Series F, net of fees · as of August 31, 2026
    - table "Returns":
      - caption: Returns
      - rowgroup:
        - row "Period Fund Benchmark Value added":
          - columnheader "Period"
          - columnheader "Fund"
          - columnheader "Benchmark"
          - columnheader "Value added"
      - rowgroup:
        - row "1 month −0.15% 0.38% −0.53%":
          - cell "1 month"
          - cell "−0.15%"
          - cell "0.38%"
          - cell "−0.53%"
        - row "3 months −0.67% −0.29% −0.38%":
          - cell "3 months"
          - cell "−0.67%"
          - cell "−0.29%"
          - cell "−0.38%"
        - row "Year to date −0.26% −0.31% +0.05%":
          - cell "Year to date"
          - cell "−0.26%"
          - cell "−0.31%"
          - cell "+0.05%"
        - row "1 year 0.74% 0.24% +0.50%":
          - cell "1 year"
          - cell "0.74%"
          - cell "0.24%"
          - cell "+0.50%"
        - row "2 years * 0.49% — —":
          - cell "2 years *": 2 years*
          - cell "0.49%"
          - cell "—"
          - cell "—"
        - row "Since inception * 0.83% — —":
          - cell "Since inception *": Since inception*
          - cell "0.83%"
          - cell "—"
          - cell "—"
    - paragraph: "* Periods over one year are annualized."
    - complementary:
      - heading "Key facts" [level=3]
      - term: Legal name
      - definition: Nymbus Monthly Income Fund
      - term: Vehicle
      - definition: Mutual fund
      - term: Asset class
      - definition: Short-term fixed income
      - term: Benchmark
      - definition: FTSE Canada Short Term Corporate Bond Index
      - term: Fund launch
      - definition: October 5, 2021
      - term: Track record since
      - definition: March 2024
      - term: Currency
      - definition: CAD, USD
      - term: Series
      - definition: FP, F USD, A, F
      - term: Risk rating
      - definition: Low to medium
      - term: Returns shown
      - definition: Net of fees
      - term: CIFSC category
      - definition: Canadian Core Plus Fixed Income
      - heading "Fees and expenses" [level=3]
      - paragraph: Fees and expenses are set out in the fund facts and the simplified prospectus.
    - heading "Series and FundServ codes" [level=3]
    - table "Series and FundServ codes":
      - caption: Series and FundServ codes
      - rowgroup:
        - row "Series FundServ Offered under Currency NAV per unit Daily change Valuation date":
          - columnheader "Series"
          - columnheader "FundServ"
          - columnheader "Offered under"
          - columnheader "Currency"
          - columnheader "NAV per unit"
          - columnheader "Daily change"
          - columnheader "Valuation date"
      - rowgroup:
        - row "F (Series shown in the header) LDM081 Prospectus class CAD $10.0397 −0.19% Sep 28, 2026":
          - cell "F (Series shown in the header)"
          - cell "LDM081":
            - code: LDM081
          - cell "Prospectus class"
          - cell "CAD"
          - cell "$10.0397"
          - cell "−0.19%"
          - cell "Sep 28, 2026"
        - row "FP LDM001 Offering memorandum class CAD $10.1905 +0.11% Sep 28, 2026":
          - cell "FP"
          - cell "LDM001":
            - code: LDM001
          - cell "Offering memorandum class"
          - cell "CAD"
          - cell "$10.1905"
          - cell "+0.11%"
          - cell "Sep 28, 2026"
        - row "F USD LDM011 USD US$10.3711 — Sep 28, 2026":
          - cell "F USD"
          - cell "LDM011":
            - code: LDM011
          - cell
          - cell "USD"
          - cell "US$10.3711"
          - cell "—"
          - cell "Sep 28, 2026"
        - row "A LDM021 CAD $9.7714 −0.21% Sep 28, 2026":
          - cell "A"
          - cell "LDM021":
            - code: LDM021
          - cell
          - cell "CAD"
          - cell "$9.7714"
          - cell "−0.21%"
          - cell "Sep 28, 2026"
    - heading "Investment team" [level=3]
    - link "Meet the team":
      - /url: /team
    - paragraph: The fund is managed by the Nymbus Capital investment team.
  - tabpanel "Performance":
    - heading "Performance" [level=2]
    - paragraph: "Performance shown: Series F, net of fees · as of August 31, 2026 · Benchmark: FTSE Canada Short Term Corporate Bond Index Prospectus class"
    - heading "Growth of $10,000" [level=3]
    - paragraph: A hypothetical $10,000 investment, distributions reinvested.
    - group "Period":
      - button "1Y"
      - button "Since inception" [pressed]
    - text: Fund (Series F) Benchmark
    - heading "Annualized and trailing returns" [level=3]
    - text: Fund Benchmark Value added
    - paragraph: "* Periods over one year are annualized."
    - group: Show the data table
    - heading "Calendar-year returns" [level=3]
    - text: Fund Benchmark Value added
    - group: Show the data table
    - heading "Monthly returns" [level=3]
    - paragraph: Every month since the start of the track record; the last column is the calendar-year return.
    - heading "Risk statistics" [level=3]
    - text: Since inception
    - paragraph: Annualized, from monthly returns.
    - text: 0.83% Annualized return 1.77% Volatility 0.68% Downside deviation 0.47 Sharpe ratio 1.22 Sortino ratio −1.09% Maximum drawdown 1.56% Best month −0.69% Worst month
    - 'img "Positive months: 53%"':
      - img
    - text: Positive months
    - heading "Performance notes" [level=3]
    - paragraph: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
    - paragraph: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
  - tabpanel "Portfolio":
    - heading "Portfolio" [level=2]
    - paragraph: Daily portfolio data as of September 28, 2026
    - heading "Portfolio characteristics" [level=3]
    - text: 2.35 years Modified duration (96%) 4.16% Yield to maturity (96%) 3.59% Average coupon 2.6 years Average term to maturity A- Average credit rating 28 Securities held
    - paragraph: "Computed only over the bonds for which the input is available (share of the bond holdings, by market value): modified duration 96%, yield to maturity 96%."
    - heading "Asset types" [level=3]
    - list "Asset types":
      - 'listitem "Corporate bonds: Fund 78.5%"': Corporate bonds
      - 'listitem "Government bonds: Fund 17.7%"': Government bonds
      - 'listitem "Cash: Fund 4.2%"': Cash
    - heading "Geography" [level=3]
    - list "Geography":
      - 'listitem "Canada: Fund 86.2%"': Canada
      - 'listitem "United States: Fund 9.9%"': United States
      - 'listitem "Cash: Fund 4.2%"': Cash
    - heading "Sectors" [level=3]
    - list "Sectors":
      - 'listitem "Financial: Fund 38.5%"': Financial
      - 'listitem "Government: Fund 17.7%"': Government
      - 'listitem "Energy: Fund 11.9%"': Energy
      - 'listitem "Utilities: Fund 9.3%"': Utilities
      - 'listitem "Communications: Fund 8.7%"': Communications
      - 'listitem "Industrial: Fund 6.1%"': Industrial
      - 'listitem "Consumer, Non-cyclical: Fund 4.0%"': Consumer, Non-cyclical
      - 'listitem "Cash: Fund 4.2%"': Cash
    - heading "Credit quality" [level=3]
    - list "Credit quality":
      - 'listitem "AA: Fund 3.5%"': AA
      - 'listitem "A: Fund 62.1%"': A
      - 'listitem "BBB: Fund 30.6%"': BBB
      - 'listitem "Cash: Fund 4.2%"': Cash
    - heading "Term to maturity" [level=3]
    - list "Term to maturity":
      - 'listitem "0–1 year: Fund 9.9%"': 0–1 year
      - 'listitem "1–3 years: Fund 54.6%"': 1–3 years
      - 'listitem "3–5 years: Fund 31.7%"': 3–5 years
      - 'listitem "Cash: Fund 4.2%"': Cash
    - paragraph: Weights as a percentage of net assets, cash included. Futures used for the overlay are excluded.
    - heading "Top 10 holdings" [level=3]
    - region "Top 10 holdings":
      - table "Top 10 holdings":
        - caption: Top 10 holdings
        - rowgroup:
          - row "# Holding Coupon Maturity Rating Sector Weight Weight":
            - columnheader "#"
            - columnheader "Holding"
            - columnheader "Coupon"
            - columnheader "Maturity"
            - columnheader "Rating"
            - columnheader "Sector"
            - columnheader "Weight"
            - columnheader "Weight"
        - rowgroup:
          - row "01 Synthetic Consumer 3.67% 2029 2.53% Mar 15, 2029 BBB Consumer, Non-cyclical 4.02%":
            - cell "01"
            - cell "Synthetic Consumer 3.67% 2029"
            - cell "2.53%"
            - cell "Mar 15, 2029"
            - cell "BBB"
            - cell "Consumer, Non-cyclical"
            - cell "4.02%"
          - row "02 Synthetic Energy 2.49% 2029 4.18% Dec 15, 2029 BBB Energy 3.95%":
            - cell "02"
            - cell "Synthetic Energy 2.49% 2029"
            - cell "4.18%"
            - cell "Dec 15, 2029"
            - cell "BBB"
            - cell "Energy"
            - cell "3.95%"
          - row "03 Synthetic Energy 4.34% 2028 2.76% Dec 15, 2028 A- Energy 3.95%":
            - cell "03"
            - cell "Synthetic Energy 4.34% 2028"
            - cell "2.76%"
            - cell "Dec 15, 2028"
            - cell "A-"
            - cell "Energy"
            - cell "3.95%"
          - row "04 Synthetic Energy 4.91% 2029 3.98% Aug 15, 2029 A- Energy 3.95%":
            - cell "04"
            - cell "Synthetic Energy 4.91% 2029"
            - cell "3.98%"
            - cell "Aug 15, 2029"
            - cell "A-"
            - cell "Energy"
            - cell "3.95%"
          - row "05 Synthetic Government 2.23% 2028 4.20% Jun 15, 2028 AA- Government 3.53%":
            - cell "05"
            - cell "Synthetic Government 2.23% 2028"
            - cell "4.20%"
            - cell "Jun 15, 2028"
            - cell "AA-"
            - cell "Government"
            - cell "3.53%"
          - row "06 Synthetic Government 3.60% 2030 2.14% Nov 15, 2030 A- Government 3.53%":
            - cell "06"
            - cell "Synthetic Government 3.60% 2030"
            - cell "2.14%"
            - cell "Nov 15, 2030"
            - cell "A-"
            - cell "Government"
            - cell "3.53%"
          - row "07 Synthetic Government 4.05% 2027 3.23% Jul 15, 2027 A+ Government 3.53%":
            - cell "07"
            - cell "Synthetic Government 4.05% 2027"
            - cell "3.23%"
            - cell "Jul 15, 2027"
            - cell "A+"
            - cell "Government"
            - cell "3.53%"
          - row "08 Synthetic Government 4.54% 2030 4.50% Feb 15, 2030 A- Government 3.53%":
            - cell "08"
            - cell "Synthetic Government 4.54% 2030"
            - cell "4.50%"
            - cell "Feb 15, 2030"
            - cell "A-"
            - cell "Government"
            - cell "3.53%"
          - row "09 Synthetic Government 4.98% 2030 3.89% Feb 15, 2030 A- Government 3.53%":
            - cell "09"
            - cell "Synthetic Government 4.98% 2030"
            - cell "3.89%"
            - cell "Feb 15, 2030"
            - cell "A-"
            - cell "Government"
            - cell "3.53%"
          - row "10 Synthetic Financial 2.09% 2028 2.98% Jun 15, 2028 A Financial 3.50%":
            - cell "10"
            - cell "Synthetic Financial 2.09% 2028"
            - cell "2.98%"
            - cell "Jun 15, 2028"
            - cell "A"
            - cell "Financial"
            - cell "3.50%"
        - rowgroup:
          - row "Top 10 total 37.02%":
            - rowheader "Top 10 total"
            - cell "37.02%"
    - heading "Sustainability metrics" [level=3]
    - paragraph: From the monthly factsheet of August 2026.
    - table "Sustainability metrics":
      - caption: Sustainability metrics
      - rowgroup:
        - row "Metric Fund Index":
          - columnheader "Metric"
          - columnheader "Fund"
          - columnheader "Index"
      - rowgroup:
        - row "S&P Global ESG rank 72.5 64.1":
          - cell "S&P Global ESG rank"
          - cell "72.5"
          - cell "64.1"
        - row "Carbon intensity 63.4 118.7":
          - cell "Carbon intensity"
          - cell "63.4"
          - cell "118.7"
        - row "Water intensity 412.8 655.1":
          - cell "Water intensity"
          - cell "412.8"
          - cell "655.1"
        - row "Board independence 81.2% 79.4%":
          - cell "Board independence"
          - cell "81.2%"
          - cell "79.4%"
        - row "Board diversity 34.1% 31.8%":
          - cell "Board diversity"
          - cell "34.1%"
          - cell "31.8%"
  - tabpanel "Distributions":
    - heading "Distributions" [level=2]
    - paragraph: Data as of September 28, 2026
    - heading "Recent distributions" [level=3]
    - paragraph: Per unit, in the currency of each series.
    - text: Series F
    - code: LDM081
    - text: $0.043756 Last distribution · Aug 31, 2026
    - term: 12 months to Sep 29, 2026
    - definition: $0.518349
    - term: Frequency
    - definition: Monthly
    - text: Series FP
    - code: LDM001
    - text: $0.045382 Last distribution · Aug 31, 2026
    - term: 12 months to Sep 29, 2026
    - definition: $0.537789
    - term: Frequency
    - definition: Monthly
    - text: Series F USD
    - code: LDM011
    - text: US$0.044840 Last distribution · Aug 31, 2026
    - term: 12 months to Sep 29, 2026
    - definition: US$0.531309
    - term: Frequency
    - definition: Monthly
    - text: Series A
    - code: LDM021
    - text: $0.040000 Last distribution · Sep 28, 2026
    - term: 12 months to Sep 29, 2026
    - definition: $0.493549
    - term: Frequency
    - definition: Monthly
    - heading "Distribution history" [level=3]
    - group "Choose a series":
      - button "Series F" [pressed]
      - button "Series FP"
      - button "Series F USD"
      - button "Series A"
    - paragraph: Distributions per unit, Series F (CAD) · last 24
    - table "Calendar-year totals":
      - caption: Calendar-year totals
      - rowgroup:
        - row "Year Total per unit Distributions":
          - columnheader "Year"
          - columnheader "Total per unit"
          - columnheader "Distributions"
      - rowgroup:
        - row "2026year to date $0.347497 8":
          - cell "2026year to date"
          - cell "$0.347497"
          - cell "8"
        - row "2025 $0.514509 12":
          - cell "2025"
          - cell "$0.514509"
          - cell "12"
        - row "2024 $0.508749 12":
          - cell "2024"
          - cell "$0.508749"
          - cell "12"
        - row "2023 $0.502989 12":
          - cell "2023"
          - cell "$0.502989"
          - cell "12"
        - row "2022 $0.497229 12":
          - cell "2022"
          - cell "$0.497229"
          - cell "12"
        - row "2021 $0.491469 12":
          - cell "2021"
          - cell "$0.491469"
          - cell "12"
        - row "2020 $0.485709 12":
          - cell "2020"
          - cell "$0.485709"
          - cell "12"
        - row "2019 $0.479949 12":
          - cell "2019"
          - cell "$0.479949"
          - cell "12"
    - table "All distributions":
      - caption: All distributions
      - rowgroup:
        - row "Date Amount per unit":
          - columnheader "Date"
          - columnheader "Amount per unit"
      - rowgroup:
        - row "Aug 31, 2026 $0.043756":
          - cell "Aug 31, 2026"
          - cell "$0.043756"
        - row "Jul 31, 2026 $0.043623":
          - cell "Jul 31, 2026"
          - cell "$0.043623"
        - row "Jun 30, 2026 $0.043248":
          - cell "Jun 30, 2026"
          - cell "$0.043248"
        - row "May 29, 2026 $0.042976":
          - cell "May 29, 2026"
          - cell "$0.042976"
        - row "Apr 30, 2026 $0.043057":
          - cell "Apr 30, 2026"
          - cell "$0.043057"
        - row "Mar 31, 2026 $0.043416":
          - cell "Mar 31, 2026"
          - cell "$0.043416"
        - row "Feb 27, 2026 $0.043724":
          - cell "Feb 27, 2026"
          - cell "$0.043724"
        - row "Jan 30, 2026 $0.043697":
          - cell "Jan 30, 2026"
          - cell "$0.043697"
        - row "Dec 31, 2025 $0.042665":
          - cell "Dec 31, 2025"
          - cell "$0.042665"
        - row "Nov 28, 2025 $0.042480":
          - cell "Nov 28, 2025"
          - cell "$0.042480"
        - row "Oct 31, 2025 $0.042662":
          - cell "Oct 31, 2025"
          - cell "$0.042662"
        - row "Sep 30, 2025 $0.043045":
          - cell "Sep 30, 2025"
          - cell "$0.043045"
    - button "Show all (92)"
    - heading "Distribution policy" [level=3]
    - paragraph: Distribution details are set out in the fund’s offering documents. Contact us for the latest distribution information.
    - paragraph: Returns shown on this page assume that all distributions are reinvested.
    - paragraph: "Amounts are per unit, in the currency of each series, by valuation date. Past distributions do not guarantee future distributions: amounts and frequency may change. The tax character of distributions (income, capital gains or return of capital) is not shown here; it is reported on the annual tax slips."
    - link "Ask about distributions":
      - /url: mailto:info@nymbus.ca?subject=Nymbus%20Monthly%20Income%20Fund%20%C2%B7%20Distributions
  - tabpanel "Awards and rankings":
    - heading "Awards and rankings" [level=2]
    - paragraph: Independent rankings and ratings of the series listed, as at the date given.
    - heading "Series FP (LDM001)" [level=3]
    - text: Fund Library
    - paragraph:
      - text: "Category:"
      - strong: Canadian Core Plus Fixed Income
      - text: · As at August 31, 2026
    - text: FundGrade B
    - table "Category rank and quartile by period":
      - caption: Category rank and quartile by period
      - rowgroup:
        - row "Period Rank in category Quartile":
          - columnheader "Period"
          - columnheader "Rank in category"
          - columnheader "Quartile"
      - rowgroup:
        - row "1 month 1 of 108 Quartile 1":
          - cell "1 month"
          - cell "1 of 108":
            - strong: "1"
            - text: of 108
          - cell "Quartile 1": Q1
        - row "3 months 4 of 106 Quartile 1":
          - cell "3 months"
          - cell "4 of 106":
            - strong: "4"
            - text: of 106
          - cell "Quartile 1": Q1
        - row "6 months 4 of 106 Quartile 1":
          - cell "6 months"
          - cell "4 of 106":
            - strong: "4"
            - text: of 106
          - cell "Quartile 1": Q1
        - row "Year to date 3 of 105 Quartile 1":
          - cell "Year to date"
          - cell "3 of 105":
            - strong: "3"
            - text: of 105
          - cell "Quartile 1": Q1
        - row "1 year 2 of 102 Quartile 1":
          - cell "1 year"
          - cell "2 of 102":
            - strong: "2"
            - text: of 102
          - cell "Quartile 1": Q1
        - row "2 years 3 of 98 Quartile 1":
          - cell "2 years"
          - cell "3 of 98":
            - strong: "3"
            - text: of 98
          - cell "Quartile 1": Q1
        - row "3 years 1 of 97 Quartile 1":
          - cell "3 years"
          - cell "1 of 97":
            - strong: "1"
            - text: of 97
          - cell "Quartile 1": Q1
        - row "4 years 1 of 95 Quartile 1":
          - cell "4 years"
          - cell "1 of 95":
            - strong: "1"
            - text: of 95
          - cell "Quartile 1": Q1
    - paragraph:
      - text: "Source:"
      - link "Fund Library (opens in a new tab)":
        - /url: https://www.fundlibrary.com/MutualFunds/Detail/4992
    - heading "Morningstar rating" [level=3]
    - text: Morningstar
    - paragraph: As at October 1, 2026
    - paragraph:
      - img "5 out of 5 stars"
      - strong: Series F
    - paragraph:
      - text: "Source:"
      - link "Morningstar (opens in a new tab)":
        - /url: https://global.morningstar.com/en-ca/investments/funds/0P0001NL0N/quote
    - paragraph: Rankings and ratings are provided by third parties, reproduced as at the date shown and not updated daily. Category rankings compare returns with those of the other funds in the same category over each period; the number of funds ranked varies by period. Past performance does not predict future results, and rankings and ratings are not guarantees. See the source for the methodology.
  - tabpanel "Documents":
    - heading "Documents" [level=2]
    - heading "Fund documents" [level=3]
    - paragraph: The regulatory documents of the fund are available on request. Please read them before investing.
    - text: "Fund facts A short summary of the fund: its investments, risk, past performance and costs. Available on request"
    - 'link "Request : Fund facts"':
      - /url: mailto:info@nymbus.ca?subject=Nymbus%20Monthly%20Income%20Fund%20%C2%B7%20Fund%20facts
    - text: Simplified prospectus The offering document that describes the fund, its risks and investors’ rights. Available on request
    - 'link "Request : Simplified prospectus"':
      - /url: mailto:info@nymbus.ca?subject=Nymbus%20Monthly%20Income%20Fund%20%C2%B7%20Simplified%20prospectus
    - text: Annual financial statements Audited financial statements for the fiscal year. Available on request
    - 'link "Request : Annual financial statements"':
      - /url: mailto:info@nymbus.ca?subject=Nymbus%20Monthly%20Income%20Fund%20%C2%B7%20Annual%20financial%20statements
    - text: Interim financial statements Unaudited financial statements for the first six months of the fiscal year. Available on request
    - 'link "Request : Interim financial statements"':
      - /url: mailto:info@nymbus.ca?subject=Nymbus%20Monthly%20Income%20Fund%20%C2%B7%20Interim%20financial%20statements
    - text: Management report of fund performance Management’s discussion of the fund’s results, annual and interim. Available on request
    - 'link "Request : Management report of fund performance"':
      - /url: mailto:info@nymbus.ca?subject=Nymbus%20Monthly%20Income%20Fund%20%C2%B7%20Management%20report%20of%20fund%20performance
  - region "Built for monthly income":
    - paragraph: Monthly Income Fund
    - heading "Built for monthly income" [level=2]
    - text: Four features shape how the fund is managed.
    - heading "Monthly distributions" [level=3]
    - paragraph: Designed to pay every month. Distributions are not guaranteed, may change and may include a return of capital.
    - heading "Short maturities" [level=3]
    - paragraph: "Short maturities keep rate sensitivity low. Current duration: Portfolio tab."
    - heading "Systematic credit selection" [level=3]
    - paragraph: "Same models for every issuer: credit risk against yield."
    - heading "Futures overlay" [level=3]
    - paragraph: An overlay designed to have low correlation with bonds and to offset part of bond losses when volatility rises; it may not do so and can lose money. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.
  - region "Disclosures":
    - paragraph: Important information
    - heading "Disclosures" [level=2]
    - paragraph: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
    - paragraph: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
    - paragraph: "Performance shown: Series F, net of fees · Benchmark: FTSE Canada Short Term Corporate Bond Index"
    - paragraph: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
    - paragraph: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
    - paragraph: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
    - paragraph: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
    - paragraph: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
    - paragraph: Updated daily from Nymbus’ data platform; portfolio data from the daily holdings as of September 28, 2026; sustainability metrics from the monthly factsheet of August 2026. performance as of August 2026 · net asset values as of Sep 28, 2026.
  - heading "Interested in the fund?" [level=2]
  - paragraph: Our team can walk you through the fund, its series and how to invest.
  - link "Contact our team":
    - /url: /contact
  - link "All strategies":
    - /url: /strategies
  - region "Other strategies":
    - paragraph: Explore
    - heading "Other strategies" [level=2]
    - link "Core fixed income Sustainable Enhanced Bonds Canadian core bonds, managed systematically View Nymbus Sustainable Enhanced Bonds Fund":
      - /url: /strategies/sustainable-enhanced-bonds
    - link "Alternative strategies Multi-Strategy Four systematic strategies designed to have low correlation with one another View Nymbus Multi-Strategy Fund":
      - /url: /strategies/multi-strategy
    - link "Futures overlay (managed accounts) Global Minimum Volatility A futures overlay designed to have low correlation with bonds View Nymbus Global Minimum Volatility":
      - /url: /strategies/global-minimum-volatility
- contentinfo:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - paragraph: Montreal portfolio manager building systematic fixed income and alternative strategies.
  - text: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
  - link "514-985-1138":
    - /url: tel:+15149851138
  - text: 1-833-227-2656 (toll-free)
  - link "info@nymbus.ca":
    - /url: mailto:info@nymbus.ca
  - heading "Strategies" [level=2]
  - list:
    - listitem:
      - link "Monthly Income":
        - /url: /strategies/monthly-income
    - listitem:
      - link "Sustainable Enhanced Bonds":
        - /url: /strategies/sustainable-enhanced-bonds
    - listitem:
      - link "Multi-Strategy":
        - /url: /strategies/multi-strategy
    - listitem:
      - link "Global Minimum Volatility":
        - /url: /strategies/global-minimum-volatility
  - heading "Company" [level=2]
  - list:
    - listitem:
      - link "About & team":
        - /url: /team
    - listitem:
      - link "Approach":
        - /url: /approach
    - listitem:
      - link "Sustainability":
        - /url: /sustainability
    - listitem:
      - link "Solutions":
        - /url: /solutions
  - heading "Resources" [level=2]
  - list:
    - listitem:
      - link "Contact":
        - /url: /contact
    - listitem:
      - link "Privacy policy":
        - /url: /privacy
    - listitem:
      - link "Complaints & code of ethics":
        - /url: /legal
    - listitem:
      - link "LinkedIn":
        - /url: https://www.linkedin.com/company/nymbus-capital/
  - paragraph: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
  - paragraph: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
  - paragraph: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
  - paragraph: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
  - paragraph: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
  - paragraph: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative. Unless another variant is selected on the strategy page, the returns shown are those of the 6% downside volatility variant; the strategy is also offered with 3% and 9% downside volatility targets, whose returns differ.
  - paragraph: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
  - text: © 2026 Nymbus Capital Inc. All rights reserved. PRI signatory
```

# Test source

```ts
  164 |     for (const id of tabs) {
  165 |       await openTab(page, id);
  166 |       await settle(page);
  167 |       await shot(page, `${slug}-tab-${id}`, info.project.name);
  168 |     }
  169 |   });
  170 | }
  171 | 
  172 | test("distributions: per-series cards, history chart, calendar years and the full history behind a toggle", async ({ page }) => {
  173 |   await page.goto("/strategies/monthly-income#distributions");
  174 |   // the latest distribution of the series shown (not the end of the requested window)
  175 |   await expect(page.getByTestId("distributions-asof")).toHaveText("Data as of September 28, 2026");
  176 |   const fp = page.getByTestId("dist-class-LDM001");
  177 |   await expect(page.locator('[data-testid^="dist-class-"].hl')).toHaveCount(1);
  178 |   // amounts with the series' own precision (6 decimals in the sample), so rows add up to the calendar totals
  179 |   await expect(fp.getByTestId("dist-last-amount")).toHaveText(/^\$0\.\d{6}$/);
  180 |   await expect(fp.getByTestId("dist-t12m")).toHaveText(/^\$0\.\d{6}$/);
  181 |   // the trailing 12 months end at the day the data were read (the response end date), not at the last distribution
  182 |   await expect(fp.getByTestId("dist-t12m-label")).toHaveText(/^12 months to Sept?\.? 29, 2026$/);
  183 |   await expect(fp.getByTestId("dist-t12m-label")).toHaveAttribute("title", "Total per unit of the distributions paid in the 12 months to September 29, 2026");
  184 |   await expect(page.getByTestId("dist-class-LDM011").getByTestId("dist-last-amount")).toHaveText(/^US\$0\.\d{4,6}$/);
  185 |   // cards of one row: the amounts start at the same height even when a series header wraps
  186 |   const tops = await page.getByTestId("distributions-summary").locator(".ds-amt").evaluateAll((els) => els.map((e) => [Math.round(e.getBoundingClientRect().top), Math.round((e.closest(".ds-card") as HTMLElement).getBoundingClientRect().top)]));
  187 |   const byRow = new Map<number, number[]>();
  188 |   for (const [amt, card] of tops) byRow.set(card, [...(byRow.get(card) ?? []), amt]);
  189 |   for (const amts of byRow.values()) expect(Math.max(...amts) - Math.min(...amts)).toBeLessThanOrEqual(1);
  190 |   // nothing clipped inside a card (amounts with 6 decimals and a currency prefix fit on phones)
  191 |   const overflow = await page.getByTestId("distributions-summary").locator(".ds-card").evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1 || [...e.querySelectorAll("*")].some((c) => c.getBoundingClientRect().right > e.getBoundingClientRect().right + 1)).map((e) => e.getAttribute("data-testid")));
  192 |   expect(overflow).toEqual([]);
  193 |   const wrapped = await page.getByTestId("distributions-summary").locator(".ds-amt").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height > 1.6 * parseFloat(getComputedStyle(e).lineHeight)).map((e) => e.textContent));
  194 |   expect(wrapped, "each amount on one line").toEqual([]);
  195 |   const history = page.getByTestId("distributions-history");
  196 |   await history.scrollIntoViewIfNeeded();
  197 |   const bars = page.getByTestId("distribution-chart").locator("svg .cat");
  198 |   await expect(bars).toHaveCount(24);
  199 |   // one tab stop for the chart (roving tabindex), on the latest distribution; arrows / Home / End move it
  200 |   await expect(page.getByTestId("distribution-chart").locator('svg .cat[tabindex="0"]')).toHaveCount(1);
  201 |   await expect(bars.nth(23)).toHaveAttribute("tabindex", "0");
  202 |   await bars.nth(23).focus();
  203 |   await page.keyboard.press("ArrowLeft");
  204 |   await expect(bars.nth(22)).toBeFocused();
  205 |   await expect(bars.nth(22)).toHaveAttribute("tabindex", "0");
  206 |   await expect(bars.nth(23)).toHaveAttribute("tabindex", "-1");
  207 |   await page.keyboard.press("Home");
  208 |   await expect(bars.nth(0)).toBeFocused();
  209 |   await page.keyboard.press("End");
  210 |   await expect(bars.nth(23)).toBeFocused();
  211 |   await expect(page.getByTestId("dist-ytd")).toHaveCount(1);
  212 |   await expect(page.getByTestId("distributions-calendar").locator("tbody tr").first()).toContainText("2026");
  213 |   const rows = page.getByTestId("distributions-table").locator("tbody tr");
  214 |   await expect(rows).toHaveCount(12);
  215 |   const toggle = page.getByTestId("distributions-show-all");
  216 |   await expect(toggle).toHaveAttribute("aria-expanded", "false");
  217 |   await toggle.click();
  218 |   await expect(toggle).toHaveAttribute("aria-expanded", "true");
  219 |   expect(await rows.count()).toBeGreaterThan(12);
  220 |   // another series: its own history
  221 |   await page.getByTestId("dist-series-LDM021").click();
  222 |   await expect(page.getByTestId("dist-series-LDM021")).toHaveAttribute("aria-pressed", "true");
  223 |   await expect(rows.first()).toContainText("Sep 28, 2026");
  224 |   await expect(page.getByTestId("distributions-note")).not.toContainText(/yield/i);
  225 | });
  226 | 
  227 | test("series selector switches the NAV card", async ({ page }) => {
  228 |   await page.goto("/strategies/monthly-income");
  229 |   const card = page.getByTestId("nav-card");
  230 |   // the default class is F (LDM081)
  231 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM081");
  232 |   await expect(card.getByTestId("series-LDM081")).toHaveAttribute("aria-checked", "true");
  233 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.0397");
  234 |   await card.getByTestId("series-LDM001").click();
  235 |   await expect(card.getByTestId("series-LDM001")).toHaveAttribute("aria-checked", "true");
  236 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM001");
  237 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.1905");
  238 |   await card.getByTestId("series-LDM011").click();
  239 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^US\$\d+\.\d{4}$/);
  240 | });
  241 | 
  242 | test("tabs follow the URL hash and the keyboard", async ({ page }) => {
  243 |   await page.goto("/strategies/sustainable-enhanced-bonds#portfolio");
  244 |   const tabs = page.getByTestId("fund-tabs");
  245 |   await expect(tabs.locator('[role="tab"][data-tab="portfolio"]')).toHaveAttribute("aria-selected", "true");
  246 |   await expect(page.getByTestId("esg")).toBeVisible();
  247 |   await tabs.locator('[role="tab"][data-tab="portfolio"]').focus();
  248 |   await page.keyboard.press("ArrowRight");
  249 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toHaveAttribute("aria-selected", "true");
  250 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toBeFocused();
  251 |   // the header link selects the documents tab
  252 |   await page.evaluate(() => window.scrollTo(0, 0));
  253 |   await page.locator('.fh-actions a[href="#documents"]').click();
  254 |   await expect(tabs.locator('[role="tab"][data-tab="documents"]')).toHaveAttribute("aria-selected", "true");
  255 | });
  256 | 
  257 | test("without JavaScript every panel is on the page", async ({ browser }) => {
  258 |   const ctx = await browser.newContext({ javaScriptEnabled: false });
  259 |   const page = await ctx.newPage();
  260 |   await page.goto("/strategies/monthly-income");
  261 |   await expect(page.getByRole("heading", { level: 1, name: "Nymbus Monthly Income Fund" })).toBeVisible();
  262 |   for (const id of TABS) await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
  263 |   // Monthly Income F has no return series yet: its panels say "coming soon"
> 264 |   await expect(page.getByTestId("perf-soon")).toBeAttached();
      |                                               ^ Error: expect(locator).toBeAttached() failed
  265 |   await expect(page.getByTestId("holdings-table")).toBeVisible();
  266 |   await ctx.close();
  267 | });
  268 | 
  269 | test("legacy slug redirects to monthly income", async ({ page }) => {
  270 |   const res = await page.goto("/strategies/sustainable-enhanced-short-term-bonds");
  271 |   expect(res?.status()).toBe(200);
  272 |   await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  273 |   await expect(page.getByTestId("nav-card")).toBeVisible();
  274 | });
  275 | 
  276 | test("registry alias redirects to the canonical slug", async ({ page }) => {
  277 |   await page.goto("/strategies/gmv");
  278 |   await expect(page).toHaveURL(/\/strategies\/global-minimum-volatility$/);
  279 | });
  280 | 
  281 | test("unknown slug is a 404", async ({ page }) => {
  282 |   const res = await page.goto("/strategies/no-such-fund");
  283 |   expect(res?.status()).toBe(404);
  284 | });
  285 | 
  286 | test("French: labels, names and number formatting", async ({ page }) => {
  287 |   await page.goto("/strategies/monthly-income");
  288 |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  289 |   await page.reload();
  290 |   await expect(page.getByRole("heading", { level: 1, name: "Fonds Nymbus Revenu Mensuel" })).toBeVisible();
  291 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="overview"]')).toHaveText("Aperçu");
  292 |   await expect(page.getByTestId("figures-soon")).toContainText("Les rendements de la série F seront bientôt publiés");
  293 |   await page.getByTestId("series-LDM001").click();
  294 |   await expect(page.getByTestId("basis")).toContainText("après déduction des frais");
  295 |   await expect(page.getByTestId("class-type")).toHaveText("Série à notice d’offre");
  296 |   // decimal comma and a no-break space before % / $
  297 |   await expect(page.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+,\d{2}\s%$/);
  298 |   await expect(page.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^\d+,\d{4}\s\$$/);
  299 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="portfolio"]').click();
  300 |   await expect(page.getByTestId("portfolio-source")).toContainText("Données quotidiennes du portefeuille");
  301 |   await expect(page.getByTestId("portfolio-asof")).toHaveText("au 28 septembre 2026");
  302 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]').click();
  303 |   await expect(page.getByTestId("dist-class-LDM001").getByTestId("dist-last-amount")).toHaveText(/^0,\d{6}\s\$$/);
  304 |   await expect(page.getByTestId("provenance")).toContainText("données de portefeuille selon les positions quotidiennes au 28 septembre 2026");
  305 | });
  306 | 
  307 | /* ------------------------------------------------------------------ classes, variants, awards, calendar labels */
  308 | 
  309 | test("class selector: returns follow the class; F is the default; a class without its own series says coming soon", async ({ page }) => {
  310 |   await page.goto("/strategies/sustainable-enhanced-bonds");
  311 |   const card = page.getByTestId("nav-card");
  312 |   const strip = page.getByTestId("return-strip");
  313 |   await expect(card.getByTestId("series-LDM201")).toHaveAttribute("aria-checked", "true");
  314 |   await expect(page.getByTestId("basis")).toContainText("Series F");
  315 |   const f = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  316 |   await card.getByTestId("series-LDM202").click();
  317 |   await expect(page.getByTestId("basis")).toContainText("Series H");
  318 |   const h = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  319 |   expect(h, "class H shows its own returns").not.toBe(f);
  320 |   // a class that has no series of its own: no figure at all, never F's
  321 |   await card.getByTestId("series-LDM205").click();
  322 |   await expect(strip.getByTestId("figures-soon")).toContainText("series A coming soon");
  323 |   await expect(strip.getByTestId("badge-SI")).toHaveCount(0);
  324 |   await openTab(page, "performance");
  325 |   await expect(page.getByTestId("perf-soon")).toContainText("series A coming soon");
  326 |   await expect(page.getByTestId("growth")).toHaveCount(0);
  327 |   await expect(page.getByTestId("calendar")).toHaveCount(0);
  328 |   await expect(page.getByTestId("risk")).toHaveCount(0);
  329 |   // back to F: everything returns
  330 |   await card.getByTestId("series-LDM201").click();
  331 |   await expect(page.getByTestId("calendar")).toBeVisible();
  332 |   await expect(page.getByTestId("risk")).toBeVisible();
  333 | });
  334 | 
  335 | test("class types: only classes whose type is known are labelled, with a disclosure sentence", async ({ page }) => {
  336 |   await page.goto("/strategies/monthly-income");
  337 |   const card = page.getByTestId("nav-card");
  338 |   await expect(card.getByTestId("class-type")).toHaveText("Prospectus class");
  339 |   await expect(card.getByTestId("class-type-note")).toContainText("simplified prospectus");
  340 |   await card.getByTestId("series-LDM001").click();
  341 |   await expect(card.getByTestId("class-type")).toHaveText("Offering memorandum class");
  342 |   await expect(card.getByTestId("class-type-note")).toContainText("offering memorandum");
  343 |   await expect(page.getByTestId("returns-class-type")).toHaveText("Offering memorandum class");
  344 |   // unknown type: nothing is said
  345 |   await card.getByTestId("series-LDM021").click();
  346 |   await expect(card.getByTestId("class-type")).toHaveCount(0);
  347 |   await expect(card.getByTestId("class-type-note")).toHaveCount(0);
  348 |   // the class table: the badge on the two classes whose type is known, none elsewhere
  349 |   await expect(page.getByTestId("class-type-LDM081")).toHaveText("Prospectus class");
  350 |   await expect(page.getByTestId("class-type-LDM001")).toHaveText("Offering memorandum class");
  351 |   await expect(page.getByTestId("class-type-LDM021")).toHaveCount(0);
  352 |   // SEB: no class has a known type yet: no label, no column
  353 |   await page.goto("/strategies/sustainable-enhanced-bonds");
  354 |   await expect(page.getByTestId("class-type")).toHaveCount(0);
  355 |   await expect(page.getByTestId("classes-table").locator("thead")).not.toContainText("Offered under");
  356 | });
  357 | 
  358 | test("Global Minimum Volatility: 3 / 6 / 9 % variants, default 6, no class selector, no NAV, no distributions", async ({ page }) => {
  359 |   await page.goto("/strategies/global-minimum-volatility");
  360 |   const sel = page.getByTestId("variant-selector");
  361 |   await expect(sel.getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
  362 |   await expect(sel.locator('[role="radio"]')).toHaveCount(3);
  363 |   await expect(page.getByTestId("nav-card")).toHaveCount(0);
  364 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]')).toHaveCount(0);
```