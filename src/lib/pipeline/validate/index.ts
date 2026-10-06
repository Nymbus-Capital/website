/**
 * Validation gates (pure, public entry). Principle: show nothing rather than a wrong number.
 *
 * Per fund:
 *  blocking (the whole fund keeps its previously published FundData, or is withheld if none):
 *   - performance as-of earlier than the one previously published
 *   - a monthly return (fund or index) beyond ±25 %
 *   - trailing returns in the data differ from a recomputation from the monthly series
 *   - computed trailing differs from the published factsheet of the same month by more than 0.5 %
 *   - growth series inconsistent with the monthly returns
 *   - any non-finite number anywhere in the fund data
 *   - a performance class label that is not the label of the class of its data (performance.classCode)
 *  repairs (the value is dropped / kept from the previous publication, the rest is published):
 *   - NAV class moving more than 10 % in one valuation day: class dropped (previous value kept if any) — error issue
 *   - AUM negative or not a number: dropped (previous kept if any) — error issue
 *   - daily portfolio (never blocks the fund; the page then shows the month-end factsheet figures): the whole block is
 *     dropped when its book is invalid, older than 7 whole days or dated in the future (data/freshness.ts, one rule with
 *     the selection and the page), or when nothing plausible is left — also for a fund carried over from the previous
 *     publication (missing or blocked in this run);
 *     a characteristic outside its plausible range (duration 0–30 y, YTM −5 %–25 %, coupon 0–25 %, average maturity
 *     0–100 y, rating a letter notch, coverage 0–1), a breakdown whose weights do not add up to 100 % ± 3 % (cash
 *     included), and a top-10 list with a weight outside (0, 25 %] or a total above 100 % are dropped one by one — warn
 *   - distributions: a series is dropped when an amount is not positive or reaches 5 % of its NAV per unit, its
 *     trailing 12 months reach 25 % of it, its dates are not ascending / in the future, or its last distribution and
 *     calendar-year totals disagree with its own rows; a trailing-12-month figure that differs from the rows of the 12
 *     months ending at the response's end date (trailingTo, the day of the read) is dropped (the series stays), as is one
 *     whose window end is unknown; all distributions are dropped when the source
 *     has not been read successfully for more than 10 days (carried over) — warn
 *  warnings:
 *   - NAV older than 7 days, AUM older than 7 days, performance older than 2 closed months
 *
 * Modules: performance.ts (performance, classes, variants), nav.ts (NAV, AUM), portfolio.ts, distributions.ts, and
 * site.ts (every fund, merge with the previous publication, class-change approval).
 */
export { classEntryChanges, validateFund, validateSite, type FundValidation } from "./site.ts";
export { checkDistributions, distributionProblem, trailingProblem, yearBefore } from "./distributions.ts";
export { nonFinitePaths } from "./helpers.ts";
export { checkPortfolio } from "./portfolio.ts";
