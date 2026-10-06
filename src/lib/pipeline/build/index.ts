/**
 * Build (public entry): raw source payloads (+ previously published data) -> SiteData. Pure (no I/O, no clock: `now`
 * is a parameter).
 *
 * Rules (the dataplatform API is the only input; the website computes whatever grouping it needs)
 *  - Net funds (SEST / SEB / Multistrat), headline = the track-record class: Apex months from dataplatform
 *    monthly-net-returns "ready" months, reproduced by the website's own compounding of the class's daily
 *    nav-timeseries chain; the 2026-07 cut-over month from the NAV bridge; CIBC months from the class's stored CIBC
 *    daily returns once they reproduce the analytics history; the strategy months before the class's own NAV history
 *    (not served by any endpoint) from the analytics repo history; gaps from the factsheet monthly table (warn). It
 *    must be continuous from the official track-record start.
 *  - Every other active class of the fund register: its own daily NAV chain from its inception (buildClasses,
 *    class-returns.ts), month by month; a month failing a check is withheld, never filled from another class.
 *  - A month's factsheet, when it exists, cross-checks it (a disagreement holds a new month back and withholds an
 *    already published one). A new month that no independent source confirms (analytics, a same-class factsheet) is
 *    listed in FundContext.unconfirmed: auto mode does not publish it without an admin (validate.ts / run.ts); with
 *    requireFactsheetForNewMonth it waits for its factsheet in every mode.
 *  - Index figures (monthly, growth, calendar, trailing): computed from the dataplatform FTSE
 *    index-summary levels (short_corp / univ). A period FTSE does not cover is null (issue). The
 *    factsheet's published index figures are a cross-check only (info before 2026-05, when its index
 *    was the XSB/XBB ETF; warn after). Value added = displayed fund − FTSE index.
 *  - GMV (no fund vehicle, no dataplatform endpoint): gross figures from the factsheet archive (factsheet_data),
 *    arithmetic (non-compounded) convention; trailing, calendar and statistics as published.
 *  - Compliance: a track record shorter than 12 months is not shown (performance and risk null).
 *  - A part whose source failed keeps its previously published value (issue + provenance + alert).
 *  - NAV daily change: Apex distribution-aware daily return from the previous valuation day only.
 *  - Portfolio: computed by the website from the dataplatform Apex holdings and instrument master (fund-portfolio.ts),
 *    used when its coverage passes the thresholds (portfolio.ts, config PORTFOLIO), else the month-end factsheet
 *    figures (issue); both are cross-checked at month-ends. Distributions: no dataplatform endpoint (none shown unless a
 *    payload is supplied: distributions.ts keeps the display logic).
 *
 * Modules: track-record.ts / series.ts (headline class), class-series.ts (other classes), net-performance.ts and
 * factsheet-performance.ts (figures), benchmark.ts (FTSE), nav.ts (NAV, AUM), factsheet-parts.ts, daily-book.ts
 * (portfolio, distributions), variants.ts (GMV), fund.ts (one fund), site.ts (every fund).
 */
export { buildSiteData, computeAsOf } from "./site.ts";
export type { BuildResult, FundContext } from "./context.ts";
export { classSpreadProblem } from "./class-series.ts";
export { computedBook } from "./daily-book.ts";
export { navChange } from "./nav.ts";
export { crossCheck, isShortRecord, revisions } from "./performance.ts";
export { effectiveNavStart } from "./register.ts";
