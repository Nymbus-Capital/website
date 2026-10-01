/**
 * Generates the SYNTHETIC pipeline fixtures (deterministic PRNG). No real fund data.
 *
 *   node --experimental-strip-types tests/fixtures/pipeline/generate.ts
 *
 * Output (this folder):
 *   dataplatform/mnr_<SHORT>.json      /api/performance/monthly-net-returns responses (2019 → 2026-08)
 *   dataplatform/nav_<SHORT>.json      /api/performance/nav-timeseries responses (last 3 weeks, apex + cibc duplicates)
 *   dataplatform/apex_funds.json       /api/apex/funds (live funds, one dormant class)
 *   dataplatform/unitholders_funds.json
 *   dataplatform/aum.json              /api/unitholders/aum (with extra investor-level-looking fields to prove they are stripped)
 *   dataplatform/ftse_<name>.json      /api/ftse/index-summary rows (last 3 business days of each month, aggregate + rating rows)
 *   dataplatform/portfolio_<SHORT>.json, portfolio_<SHORT>_2026-08-31.json   /api/apex/fund-portfolio (latest book, month-end book)
 *   dataplatform/distributions_<SHORT>.json   /api/performance/distributions (every class, a dormant one included)
 *   factsheets/bonds_data_2026-08.json, factsheets/factsheet_data_2026-08.json   archives in the real shape
 *
 * The factsheet figures are computed from the same synthetic series (rounded like the producer), so the
 * pipeline cross-checks pass on the fixtures.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addMonths, annualize, calendarYears, compound, downsideDeviation, maxDrawdown, monthEnd, pstdev, sum, trailing, window, type Method, type Series } from "../../../src/lib/pipeline/metrics.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURE_NOW = "2026-09-29T14:00:00.000Z";
const LAST_MONTH = "2026-08-31";

/* ------------------------------------------------------------------ PRNG */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rnd: () => number): () => number {
  return () => {
    const u = Math.max(rnd(), 1e-12);
    const v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}
const r8 = (x: number): number => Math.round(x * 1e8) / 1e8;
const r6 = (x: number): number => Math.round(x * 1e6) / 1e6;

function months(first: string, last: string): string[] {
  const out: string[] = [];
  for (let m = first; m <= last; m = addMonths(m, 1)) out.push(m);
  return out;
}

/* ------------------------------------------------------------------ series */
const g = gauss(mulberry32(20260829));
const idxShort: Series = {};
const idxUniv: Series = {};
for (const m of months("2019-01-31", LAST_MONTH)) {
  const common = g();
  idxShort[m] = r8(0.0019 + 0.0055 * common);
  idxUniv[m] = r8(0.0021 + 0.0145 * (0.8 * common + 0.6 * g()));
}
/** FTSE series (dataplatform): equal to the published index from the FTSE cutover (2026-05), a different definition before */
const FTSE_FROM = "2026-05-31";
const ftseShortCorp: Series = {};
const ftseUniv: Series = {};
for (const m of months("2019-01-31", LAST_MONTH)) {
  const d = g();
  ftseShortCorp[m] = m >= FTSE_FROM ? idxShort[m] : r8(idxShort[m] + 0.0004 * d);
  ftseUniv[m] = m >= FTSE_FROM ? idxUniv[m] : r8(idxUniv[m] + 0.0006 * d);
}
const sest: Series = {};
for (const m of months("2019-01-31", LAST_MONTH)) sest[m] = r8(0.0008 + 0.8 * idxShort[m] + 0.0035 * g());
const seb: Series = {};
for (const m of months("2019-02-28", LAST_MONTH)) seb[m] = r8(0.0006 + 0.9 * idxUniv[m] + 0.0045 * g());
const multi: Series = {};
const multiAll = multi;
for (const m of months("2019-01-31", LAST_MONTH)) multi[m] = r8(0.0055 + 0.019 * g());
const gmv: Series = {};
const gmvAll = gmv;
for (const m of months("2015-01-31", LAST_MONTH)) gmv[m] = r8(0.0042 + 0.016 * g());

/* ------------------------------------------------------------------ formatting like convert_to_percent_str */
const pyRound1 = (x: number): string => (Math.round(x * 10) / 10).toFixed(1);
const pctStr = (x: number | null, plus = false): string => (x === null ? "nan" : `${plus && x > 0 ? "+" : ""}${pyRound1(x * 100)}%`);
const numStr = (x: number | null): string => (x === null ? "nan" : pyRound1(x * 100));

let END = LAST_MONTH;
const upTo = (s: Series, end: string): Series => Object.fromEntries(Object.keys(s).filter((k) => k <= end).sort().map((k) => [k, s[k]]));

function trailingStrings(s: Series, method: Method, withPct: boolean, plus = false): Record<string, string> {
  const t = trailing(s, END, { method });
  const out: Record<string, string> = {};
  const fmt = (v: number | null): string => (withPct ? pctStr(v, plus) : numStr(v));
  out["1M"] = fmt(t["1M"]);
  out["3M"] = fmt(t["3M"]);
  out[END.slice(0, 4)] = fmt(t.YTD);
  for (const p of ["1Y", "2Y", "3Y", "5Y"] as const) if (t[p] !== null) out[p] = fmt(t[p]);
  out["SI"] = fmt(t.SI);
  return out;
}
function vaStrings(f: Series, i: Series): Record<string, string> {
  const tf = trailing(f, END);
  const first = Object.keys(f).sort()[0];
  const ti = trailing(i, END, { siStart: first });
  const out: Record<string, string> = {};
  const labels: [string, keyof typeof tf][] = [["1M", "1M"], ["3M", "3M"], [END.slice(0, 4), "YTD"], ["1Y", "1Y"], ["2Y", "2Y"], ["3Y", "3Y"], ["5Y", "5Y"], ["SI", "SI"]];
  for (const [lab, k] of labels) {
    const a = tf[k];
    const b = ti[k];
    if (a === null || b === null) continue;
    // one value with a unicode minus, as seen in some archives
    out[lab] = pctStr(a - b, true).replace(/^-/, lab === "3M" ? "−" : "-");
  }
  return out;
}
function indexTrailingStrings(f: Series, i: Series): Record<string, string> {
  const first = Object.keys(f).sort()[0];
  const ti = trailing(i, END, { siStart: first });
  const tf = trailing(f, END);
  const out: Record<string, string> = {};
  const labels: [string, keyof typeof ti][] = [["1M", "1M"], ["3M", "3M"], [END.slice(0, 4), "YTD"], ["1Y", "1Y"], ["2Y", "2Y"], ["3Y", "3Y"], ["5Y", "5Y"], ["SI", "SI"]];
  for (const [lab, k] of labels) if (tf[k] !== null) out[lab] = pctStr(ti[k]);
  return out;
}
function calendarStrings(f: Series, i: Series | null, fundName: string, indexName: string | null): Record<string, Record<string, string>> {
  const first = Object.keys(f).sort()[0];
  const cf = calendarYears(f, END, { first });
  const ci = i ? new Map(calendarYears(i, END, { first }).map((y) => [y.year, y.value])) : null;
  const out: Record<string, Record<string, string>> = { [fundName]: {} };
  if (indexName) {
    out[indexName] = {};
    out["Value Added"] = {};
  }
  for (const y of cf) {
    out[fundName][String(y.year)] = pctStr(y.value);
    if (ci && indexName) {
      const iv = ci.get(y.year) ?? null;
      out[indexName][String(y.year)] = pctStr(iv);
      out["Value Added"][String(y.year)] = y.value !== null && iv !== null ? pctStr(y.value - iv, true) : "nan";
    }
  }
  return out;
}
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pctN = (x: number, n: number): string => `${(Math.round(x * 100 * 10 ** n) / 10 ** n).toFixed(n)}%`;
function monthlyTable(s0: Series, method: Method, dec = 1): Record<string, Record<string, string>> {
  const s = upTo(s0, END);
  const out: Record<string, Record<string, string>> = {};
  const years = [...new Set(Object.keys(s).map((k) => k.slice(0, 4)))].sort().reverse();
  for (const y of years) {
    const row: Record<string, string> = {};
    const rs: number[] = [];
    for (let m = 1; m <= 12; m++) {
      const k = monthEnd(Number(y), m);
      if (k in s) {
        row[`${String(m).padStart(2, "0")}-${MON[m - 1]}`] = dec === 1 ? pctStr(s[k]) : pctN(s[k], dec);
        rs.push(s[k]);
      } else {
        row[`${String(m).padStart(2, "0")}-${MON[m - 1]}`] = "nan";
      }
    }
    row["YTD"] = pctStr(method === "arithmetic" ? sum(rs) : compound(rs));
    out[y] = row;
  }
  return out;
}
function statistics(s: Series, method: Method, months?: number): Record<string, string> {
  const rs = months ? window(s, END, months)! : window(s, END)!;
  const ann = method === "arithmetic" ? (sum(rs) / rs.length) * 12 : annualize(rs);
  const vol = pstdev(rs) * Math.sqrt(12);
  const dd = downsideDeviation(rs)!;
  return {
    "Annualized Returns": `${pyRound1(ann * 100)}%`,
    "Annualized St. Dev.": `${pyRound1(vol * 100)}%`,
    "Annualized Downside Dev.": `${pyRound1(dd * 100)}%`,
    "Sharpe Ratio": pyRound1(ann / vol),
    "Sortino Ratio": pyRound1(ann / dd),
    "% Positive Months": `${Math.round((rs.filter((r) => r > 0).length / rs.length) * 100)}%`,
    "Average of Positive Months": "1.2%",
    "Average of Negative Months": "-1.0%",
    "Max Drawdown": `${Math.round(maxDrawdown(rs, method) * 100)}%`,
    "Profit Factor": "1.9",
    "Calmar Ratio": "0.6",
  };
}

/* ------------------------------------------------------------------ dataplatform payloads */
/** Apex cutover: the distribution-aware daily chain exists from this month on */
export const APEX_READY_FROM = "2026-08-31";
function mnr(short: string, s: Series, first: string): unknown {
  const rows = months(first, LAST_MONTH).map((m) => (m >= APEX_READY_FROM
    ? { month: m, net_return: s[m], status: "ready", method: "compounded_apex_net_daily", source_dates: [], source_row_ids: [], issue: null }
    : { month: m, net_return: null, status: "unavailable", method: m >= "2026-06-30" ? "compounded_apex_net_daily" : null, source_dates: [], source_row_ids: [], issue: m >= "2026-06-30" ? "Incomplete Apex valuation-day coverage; no partial-month compounding" : "A complete distribution-aware Apex net-return chain is unavailable" }));
  return { short_name: short, class_code: short === "SEB" ? "STRATEGY_H" : "STRATEGY", currency: "CAD", return_basis: "net_of_fees", methodology_version: "apex-daily-net-v1", as_of: FIXTURE_NOW.slice(0, 10), row_count: rows.length, rows };
}

function businessDays(from: string, to: string): string[] {
  const out: string[] = [];
  for (let t = Date.parse(from); t <= Date.parse(to); t += 86_400_000) {
    const d = new Date(t);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const CLASSES: Record<string, { fundserv: string; display: string; currency: string; nav: number; status?: string }[]> = {
  SEST: [
    { fundserv: "LDM001", display: "FP", currency: "CAD", nav: 10.2413 },
    { fundserv: "LDM021", display: "A", currency: "CAD", nav: 9.8712 },
    { fundserv: "LDM081", display: "F", currency: "CAD", nav: 10.0536 },
    { fundserv: "LDM011", display: "F USD", currency: "USD", nav: 10.4127 },
    { fundserv: "LDM031", display: "O", currency: "CAD", nav: 10.9, status: "dormant" },
  ],
  SEB: [
    { fundserv: "LDM201", display: "F", currency: "CAD", nav: 9.6124 },
    { fundserv: "LDM205", display: "A", currency: "CAD", nav: 9.3318 },
    { fundserv: "LDM206", display: "FP", currency: "CAD", nav: 9.7045 },
  ],
  Multistrat: [
    { fundserv: "LDM300", display: "A", currency: "CAD", nav: 12.3187 },
    { fundserv: "LDM301", display: "F", currency: "CAD", nav: 12.9542 },
    { fundserv: "LDM305", display: "FP", currency: "CAD", nav: 13.1076 },
  ],
};

/**
 * NAV rows over the last 3 weeks. Apex rows carry the distribution-aware daily return
 * (`apex_distribution_aware`, return_start_date = previous valuation day) for CAD classes; the USD class
 * gets `nav_price_ratio` (as the dataplatform does). LDM021 pays a 0.0400 distribution on the last day
 * (NAV drops, total return positive). SEB LDM205 misses 2026-09-25 (its last return starts from a day not shown).
 */
function navPayload(short: string): unknown {
  const days = businessDays("2026-09-08", "2026-09-28");
  const rnd = gauss(mulberry32(short.length * 7919 + 13));
  const rows: Record<string, unknown>[] = [];
  for (const k of CLASSES[short]) {
    let v = k.nav;
    let prevDay: string | null = "2026-09-07";
    for (const d of days) {
      const r = (short === "Multistrat" ? 0.004 : 0.0012) * rnd();
      const before = v;
      v = Math.round(v * (1 + r) * 1e4) / 1e4;
      let ret = r8(v / before - 1);
      if (k.fundserv === "LDM021" && d === "2026-09-28") {
        ret = r8(v / before - 1); // total return of the day
        v = Math.round((v - 0.04) * 1e4) / 1e4; // ex-distribution NAV
      }
      const start = prevDay;
      prevDay = d;
      if (k.fundserv === "LDM205" && d === "2026-09-25") continue;
      const usd = k.currency === "USD";
      const base = { date: d, fundserv: k.fundserv, class_display: k.display, class_code: k.display, currency: k.currency, short_name: short, nav_type: "FINAL_NAV", fund_mapped: true, account: "SYNTHETIC", fund_name: `SYNTHETIC ${short}`, class_name_raw: k.display };
      rows.push({ ...base, source: "apex", nav_per_share_local: v, nav_per_share_cad: usd ? Math.round(v * 1.37 * 1e4) / 1e4 : v, net_daily_return: ret, net_return_method: usd ? "nav_price_ratio" : "apex_distribution_aware", return_start_date: start, return_source_count: 1 });
      // a lagging second source on some days: must lose against apex
      if (d >= "2026-09-24") rows.push({ ...base, source: "cibc", nav_per_share_local: Math.round(v * 1.003 * 1e4) / 1e4, nav_per_share_cad: null, net_daily_return: null, net_return_method: "nav_price_ratio", return_start_date: null });
    }
  }
  return { short_name: short, start_date: "2026-09-08", end_date: "2026-09-29", nav_type: "FINAL_NAV", include_unmapped: true, sources: ["apex", "cibc"], row_count: rows.length, rows, warnings: [] };
}

const APEX_ACCOUNTS: Record<string, string> = { SEST: "SYN-APX-01", SEB: "SYN-APX-02", Multistrat: "SYN-APX-03" };
const apexFunds = [
  { key: "monthly_income", name: "NYMBUS MONTHLY INCOME FUND", status: "active", apex_account: APEX_ACCOUNTS.SEST, cibc_account: null, cibc_short: "SEST", inception: "2019-01-01", classes: CLASSES.SEST.map((c) => ({ fundserv: c.fundserv, display: c.display, currency: c.currency, status: c.status ?? "active", apex_token: c.display, nav_token: null, tb_fund_id: null })) },
  { key: "sustainable_enhanced_bonds", name: "NYMBUS SUSTAINABLE ENHANCED BONDS FUND", status: "active", apex_account: APEX_ACCOUNTS.SEB, cibc_account: null, cibc_short: "SEB", inception: "2019-02-01", classes: CLASSES.SEB.map((c) => ({ fundserv: c.fundserv, display: c.display, currency: c.currency, status: "active", apex_token: c.display, nav_token: null, tb_fund_id: null })) },
  { key: "multistrategy", name: "NYMBUS MULTI-STRATEGY FUND", status: "active", apex_account: APEX_ACCOUNTS.Multistrat, cibc_account: null, cibc_short: "MULTI", inception: "2019-01-01", classes: CLASSES.Multistrat.map((c) => ({ fundserv: c.fundserv, display: c.display, currency: c.currency, status: "active", apex_token: c.display, nav_token: null, tb_fund_id: null })) },
];
const unitholderFunds = [
  { short_name: "SEST", name: "Nymbus Monthly Income Fund", apex_account: APEX_ACCOUNTS.SEST, cibc_account: null },
  { short_name: "SEB", name: "Nymbus Sustainable Enhanced Bonds Fund", apex_account: APEX_ACCOUNTS.SEB, cibc_account: null },
  { short_name: "Multistrat", name: "Nymbus Multi-Strategy Fund", apex_account: APEX_ACCOUNTS.Multistrat, cibc_account: null },
  { short_name: "OTHER", name: "Synthetic unmapped fund", apex_account: null, cibc_account: "SYN-CIBC-9" },
];
const aumRow = (short: string, source: string, v: number, n: number): Record<string, unknown> => ({
  source, short_name: short, holding_value_cad: v, holding_value_local: v, units_held: Math.round(v / 10), n_holders: n, n_holdings: n + 3,
  // fields that would be investor-level with another grouping: must never reach a snapshot
  investor_no: "SYN-INV-0001", shareholder_id: "SYN-SH-01", agent_name: "Synthetic Advisor", dealer_name: "Synthetic Dealer", cibc_account: "SYN-ACCT-1",
});
const aum = {
  snapshot_date: "2026-09-28", group_by: ["short_name"], sources: ["APEX", "CIBC"], row_count: 6,
  warnings: ["Results span both feeds (synthetic)"],
  rows: [aumRow("SEST", "APEX", 212_345_678.9, 812), aumRow("SEST", "CIBC", 1_234_567.1, 9), aumRow("SEB", "APEX", 148_765_432.1, 402), aumRow("Multistrat", "APEX", 61_234_567.5, 233), aumRow("OTHER", "CIBC", 5_000_000, 12)],
};

/**
 * FTSE index-summary rows: aggregate row + sub-index rows (rating "All" but term "Short", rating "AAA")
 * on the last 3 weekdays of each month. `split`: rows before that date are published under `oldName`
 * (a rename with the same index_id: the history must be joined).
 */
function ftseRows(short: string, indexName: string, s: Series, split?: { date: string; oldName: string }): { current: unknown[]; old: unknown[] } {
  const current: unknown[] = [];
  const old: unknown[] = [];
  let level = 1000;
  const push = (d: string, v: number): void => {
    const name = split && d < split.date ? split.oldName : short;
    const into = name === short ? current : old;
    const base = { date: d, short_name: name, index_name: indexName, index_content: "synthetic", term: null, industry_sector: null, industry_group: null, price_index: Math.round(v * 0.62 * 1000) / 1000, average_yield: 3.9, modified_duration: short === "univ" ? 7.1 : 2.7 };
    into.push({ ...base, rating: null, total_return: Math.round(v * 1e6) / 1e6 });
    into.push({ ...base, rating: "All", term: "Short", total_return: Math.round(v * 1.01 * 1e6) / 1e6 });
    into.push({ ...base, rating: "AAA", total_return: Math.round(v * 0.97 * 1e6) / 1e6 });
  };
  for (const d of businessDays("2018-12-01", "2018-12-31").slice(-3)) push(d, level);
  for (const m of months("2019-01-31", LAST_MONTH)) {
    const before = level;
    level *= 1 + s[m];
    const days = businessDays(`${m.slice(0, 7)}-01`, m);
    // the month of a rename is published every weekday (flat until the last 3 days), so the seam is continuous
    if (split && split.date.slice(0, 7) === m.slice(0, 7)) for (const d of days.slice(0, -3)) push(d, before);
    for (const d of days.slice(-3)) push(d, level);
  }
  // a few September days (open month: never a monthly return)
  for (const d of businessDays("2026-09-01", "2026-09-28").slice(-3)) push(d, level * 1.002);
  return { current, old };
}

/* ------------------------------------------------------------------ analytics repo fund_returns.json */
export const ANALYTICS_LAST = "2026-07-31";
function analyticsPayload(): unknown {
  const dates = ["2014-12-31", ...months("2015-01-31", ANALYTICS_LAST)];
  const col = (s: Series): (number | null)[] => dates.map((d) => (d in s ? Math.round(s[d] * 1e6) / 1e6 : null));
  const spy: Series = {};
  const rs = gauss(mulberry32(7));
  for (const d of dates.slice(1)) spy[d] = r8(0.009 + 0.04 * rs());
  return {
    funds: [
      { name: "Nymbus Monthly Income", category: "nymbus", start_date: "2019-01-31", end_date: ANALYTICS_LAST },
      { name: "Nymbus Sustainable Enhanced Bonds", category: "nymbus", start_date: "2019-02-28", end_date: ANALYTICS_LAST },
      { name: "Nymbus Multistrategy (Inc. discretionary strats history)", category: "nymbus", start_date: "2019-01-31", end_date: ANALYTICS_LAST },
      { name: "Synthetic Peer ETF", category: "peer", start_date: "2015-01-31", end_date: ANALYTICS_LAST },
    ],
    dates,
    returns: {
      "Nymbus Monthly Income": col(sest),
      "Nymbus Sustainable Enhanced Bonds": col(seb),
      "Nymbus Multistrategy (Inc. discretionary strats history)": col(multi),
      "Synthetic Peer ETF": col(spy),
    },
  };
}

/* ------------------------------------------------------------------ fund portfolio (contract A) */

const r4 = (x: number): number => Math.round(x * 1e4) / 1e4;

/** label -> weight rows that add up to exactly 1 (4 decimals), in the given order, with synthetic counts */
function rows(parts: [string, number][], order: "desc" | "given" = "desc"): { label: string; weight: number; count: number }[] {
  // the cash row keeps its weight (the same in every breakdown); the securities share the rest
  const cash = parts.find(([label]) => label === "Cash")?.[1] ?? 0;
  const total = parts.reduce((a, [label, w]) => a + (label === "Cash" ? 0 : w), 0);
  const out = parts.map(([label, w], i) => ({ label, weight: label === "Cash" ? cash : r4((w / total) * (1 - cash)), count: label === "Cash" ? 0 : 2 + ((i * 7) % 13) }));
  const drift = r4(1 - out.reduce((a, r) => a + r.weight, 0));
  out[out[0].label === "Cash" ? 1 : 0].weight = r4(out[out[0].label === "Cash" ? 1 : 0].weight + drift);
  return order === "desc" ? out.sort((a, b) => b.weight - a.weight) : out;
}

interface BookSpec { asOf: string; duration: number; ytm: number; coupon: number; maturity: number; rating: string; priced: number; resolved: number; covYtm: number; covMaturity: number; shift: number }

/**
 * Synthetic fund-portfolio books. SEST / SEB: covered (primary source), month-end values consistent with the factsheet
 * of the month (cross-check passes); SEB's average maturity has a coverage of 85 % (not shown). Multistrat: bond
 * book coverage below the thresholds (the page keeps the factsheet figures).
 */
function portfolioPayload(short: "SEST" | "SEB" | "Multistrat", b: BookSpec): unknown {
  const seb = short === "SEB";
  const k = 1 + b.shift;
  const sector = seb
    ? rows([["Financials", 0.379 * k], ["Government", 0.29], ["Energy", 0.118], ["Utilities", 0.092], ["Communications", 0.05], ["Real estate", 0.03], ["Cash", 0.041]])
    : short === "SEST"
      ? rows([["Financials", 0.383 * k], ["Government", 0.176], ["Energy", 0.118], ["Utilities", 0.093], ["Communications", 0.087], ["Industrials", 0.061], ["Cash", 0.042]])
      : rows([["Equities", 0.55], ["Government", 0.2], ["Financials", 0.15], ["Cash", 0.1]]);
  const rating = rows(seb
    ? [["AAA", 0.214 * k], ["AA", 0.331], ["A", 0.286], ["BBB", 0.121], ["BB", 0.007], ["Not rated", 0.0], ["Cash", 0.041]]
    : [["AAA", 0.081 * k], ["AA", 0.146], ["A", 0.428], ["BBB", 0.262], ["BB", 0.031], ["Not rated", 0.01], ["Cash", 0.042]], "given").filter((r) => r.weight > 0);
  const term = rows(seb
    ? [["0-1", 0.03], ["1-3", 0.211 * k], ["3-5", 0.18], ["5-7", 0.14], ["7-10", 0.126], ["10+", 0.272], ["Cash", 0.041]]
    : [["0-1", 0.184 * k], ["1-3", 0.579], ["3-5", 0.152], ["5-7", 0.043], ["7-10", 0.0], ["Cash", 0.042]], "given").filter((r) => r.weight > 0);
  const country = rows([["Canada", 0.914 * k], ["United States", 0.037], ["Other", 0.007], ["Cash", seb ? 0.041 : short === "SEST" ? 0.042 : 0.1]]);
  const assetType = rows(seb
    ? [["Federal bonds", 0.228 * k], ["Provincial bonds", 0.297], ["Corporate bonds", 0.413], ["Municipal bonds", 0.021], ["Cash", 0.041]]
    : [["Corporate bonds", 0.782 * k], ["Provincial bonds", 0.091], ["Federal bonds", 0.064], ["Municipal bonds", 0.021], ["Cash", 0.042]]);
  const issuers = seb
    ? ["Synthetic Province East", "Synthetic Canada Housing", "Synthetic Green Utility", "Synthetic Bank North", "Synthetic Province West", "Synthetic Transit Authority", "Synthetic Hydro", "Synthetic Bank South", "Synthetic Telecom", "Synthetic Pipeline"]
    : ["Synthetic Bank North", "Synthetic Bank South", "Synthetic Pipeline", "Synthetic Telecom", "Synthetic Province East", "Synthetic Power Co", "Synthetic Insurance", "Synthetic Rail", "Synthetic Grocer", "Synthetic Hydro"];
  const sectors = seb ? ["Government", "Government", "Utilities", "Financials", "Government", "Government", "Utilities", "Financials", "Communications", "Energy"] : ["Financials", "Financials", "Energy", "Communications", "Government", "Utilities", "Financials", "Industrials", "Consumer staples", "Utilities"];
  const ratings = ["AA", "AAA", "A+", "A", "AA-", "AA", "A", "A-", "BBB+", "BBB"];
  const top = issuers.map((issuer, j) => {
    const coupon = r4(0.021 + ((j * 37) % 29) / 1000);
    const maturity = `${seb ? 2030 + ((j * 3) % 18) : 2027 + (j % 5)}-${String(1 + ((j * 5) % 12)).padStart(2, "0")}-01`;
    return {
      name: `${issuer} ${(coupon * 100).toFixed(2)}% ${maturity}`, issuer, isin: `XS${String(100000000 + j * 7919 + (seb ? 5 : 0)).padStart(10, "0")}`,
      weight: r4((seb ? 0.046 : 0.041) - j * 0.0027 + (j === 0 ? b.shift / 10 : 0)), coupon, maturity, rating: ratings[j], sector: sectors[j], green_bond: seb ? j === 2 || j === 5 || j === 6 : false,
    };
  });
  return {
    fund: short, fund_name: `SYNTHETIC ${short}`, as_of: b.asOf, nav_type: "FINAL_NAV", currency: "CAD",
    method: {
      weights: "market_value_cad / net_assets_cad (signed)", denominator: "net_assets_cad",
      duration: "modified duration, market-value weighted over bond positions with a value, renormalised over covered weight",
      yield: "yield to maturity, same weighting", coupon: "coupon rate, same weighting",
      rating: "composite rating, notch-scored AAA=1…D=22", term_buckets: ["0-1", "1-3", "3-5", "5-7", "7-10", "10+"], prices_as_of: "market_data price_as_of(as_of) per instrument",
    },
    net_assets_cad: null,
    totals: { holdings_count: seb ? 112 : 86, bonds_count: seb ? 110 : 84, cash_weight: seb ? 0.041 : 0.042, derivatives_count: 2, other_weight: 0 },
    characteristics: {
      modified_duration: { value: b.duration, unit: "years", coverage: b.priced },
      yield_to_maturity: { value: b.ytm, unit: "fraction", coverage: b.covYtm },
      coupon: { value: b.coupon, unit: "fraction", coverage: 1 },
      average_maturity: { value: b.maturity, unit: "years", coverage: b.covMaturity },
      average_rating: { value: b.rating, unit: "notch", coverage: 1 },
    },
    breakdowns: { sector, rating, term, country, asset_type: assetType },
    top_holdings: top,
    green_bonds_weight: seb ? r4(0.071 + b.shift / 5) : 0,
    coverage: { resolved_weight: b.resolved, priced_weight: b.priced },
    warnings: short === "Multistrat" ? ["SYNTHETIC: 14 positions not resolved to the instrument master"] : [],
  };
}

const BOOKS: Record<"SEST" | "SEB" | "Multistrat", { latest: BookSpec; monthEnd: BookSpec }> = {
  SEST: {
    latest: { asOf: "2026-09-28", duration: 2.38, ytm: 0.0414, coupon: 0.0398, maturity: 2.71, rating: "A-", priced: 0.97, resolved: 0.99, covYtm: 0.97, covMaturity: 1, shift: 0.01 },
    monthEnd: { asOf: "2026-08-31", duration: 2.43, ytm: 0.0418, coupon: 0.0401, maturity: 2.78, rating: "A-", priced: 0.98, resolved: 0.99, covYtm: 0.98, covMaturity: 1, shift: 0 },
  },
  SEB: {
    latest: { asOf: "2026-09-28", duration: 7.28, ytm: 0.0429, coupon: 0.0362, maturity: 9.84, rating: "AA-", priced: 0.96, resolved: 0.98, covYtm: 0.96, covMaturity: 0.85, shift: 0.012 },
    monthEnd: { asOf: "2026-08-31", duration: 7.31, ytm: 0.0433, coupon: 0.0364, maturity: 9.9, rating: "AA-", priced: 0.97, resolved: 0.98, covYtm: 0.97, covMaturity: 0.85, shift: 0 },
  },
  Multistrat: {
    latest: { asOf: "2026-09-28", duration: 4.1, ytm: 0.0371, coupon: 0.0322, maturity: 5.2, rating: "AA", priced: 0.62, resolved: 0.81, covYtm: 0.62, covMaturity: 0.62, shift: 0 },
    monthEnd: { asOf: "2026-08-31", duration: 4.2, ytm: 0.0375, coupon: 0.0322, maturity: 5.3, rating: "AA", priced: 0.6, resolved: 0.8, covYtm: 0.6, covMaturity: 0.6, shift: 0 },
  },
};

/* ------------------------------------------------------------------ class distributions (contract B) */

/** last weekday of a month (YYYY-MM-DD) */
function lastWeekday(monthEndDate: string): string {
  let t = Date.parse(monthEndDate);
  while ([0, 6].includes(new Date(t).getUTCDay())) t -= 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/**
 * Per-class distributions: SEST monthly (every class; LDM021 also pays 0.0400 on 2026-09-28 as in the NAV fixture;
 * the dormant LDM031 has rows until 2021, never shown), SEB quarterly, Multistrat annual (December). Summaries are
 * computed from the rows like the endpoint does (trailing 12 months up to end_date).
 */
function distributionsPayload(short: "SEST" | "SEB" | "Multistrat"): unknown {
  const endDate = FIXTURE_NOW.slice(0, 10);
  const base: Record<string, number> = { LDM001: 0.0415, LDM021: 0.035, LDM081: 0.04, LDM011: 0.041, LDM031: 0.038, LDM201: 0.072, LDM205: 0.063, LDM206: 0.074, LDM300: 0.21, LDM301: 0.25, LDM305: 0.26 };
  const freq = short === "SEST" ? 1 : short === "SEB" ? 3 : 12;
  const rowsOut: { date: string; fundserv: string; class_display: string; currency: string; amount_per_unit: number; source: string }[] = [];
  for (const k of CLASSES[short]) {
    const first = short === "SEB" ? "2019-03-31" : "2019-01-31";
    for (const m of months(first, LAST_MONTH)) {
      if ((+m.slice(5, 7)) % freq !== 0) continue;
      if (k.fundserv === "LDM031" && m > "2021-06-30") continue;
      if (short === "Multistrat" && m.startsWith("2022")) continue; // a year without distribution
      const i = +m.slice(0, 4) - 2019;
      const amount = r6(base[k.fundserv] * (1 + 0.012 * i) + (short === "Multistrat" ? 0 : 0.0004 * Math.sin(+m.slice(5, 7))));
      const date = lastWeekday(m);
      rowsOut.push({ date, fundserv: k.fundserv, class_display: k.display, currency: k.currency, amount_per_unit: amount, source: date > "2026-07-05" ? "apex" : "cibc" });
    }
  }
  if (short === "SEST") rowsOut.push({ date: "2026-09-28", fundserv: "LDM021", class_display: "A", currency: "CAD", amount_per_unit: 0.04, source: "apex" });
  rowsOut.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.fundserv.localeCompare(b.fundserv)));
  const yearAgo = `${+endDate.slice(0, 4) - 1}${endDate.slice(4)}`;
  const classes = CLASSES[short].map((k) => {
    const own = rowsOut.filter((r) => r.fundserv === k.fundserv);
    const last = own[own.length - 1] ?? null;
    const years = [...new Set(own.map((r) => +r.date.slice(0, 4)))].sort().map((year) => {
      const ys = own.filter((r) => r.date.startsWith(`${year}-`));
      return { year, per_unit: r6(ys.reduce((a, r) => a + r.amount_per_unit, 0)), count: ys.length };
    });
    return {
      fundserv: k.fundserv, class_display: k.display, currency: k.currency, frequency_observed: short === "SEST" ? "monthly" : short === "SEB" ? "quarterly" : "annual",
      last_date: last?.date ?? null, last_amount_per_unit: last?.amount_per_unit ?? null,
      trailing_12m_per_unit: r6(own.filter((r) => r.date > yearAgo && r.date <= endDate).reduce((a, r) => a + r.amount_per_unit, 0)),
      calendar_years: years,
    };
  });
  return {
    short_name: short, start_date: "2019-01-01", end_date: endDate,
    method: "SYNTHETIC per unit: Apex era valuation.distribution / shares_outstanding; CIBC era funds_nav_ts.distribution",
    rows: rowsOut, classes, row_count: rowsOut.length, warnings: [],
  };
}

/* ------------------------------------------------------------------ factsheets */
const SEST_NAME = "Nymbus Monthly Income Fund";
const SEST_IDX = "FTSE Canada Short Term Corporate Bond Index";
const SEB_NAME = "Nymbus Sustainable Enhanced Bonds Fund";
const SEB_IDX = "FTSE Canada Universe Bond Index";

function bondBlock(kind: "SEST" | "SEB"): unknown {
  const f = upTo(kind === "SEST" ? sest : seb, END);
  const i = upTo(kind === "SEST" ? idxShort : idxUniv, END);
  const name = kind === "SEST" ? SEST_NAME : SEB_NAME;
  const idx = kind === "SEST" ? SEST_IDX : SEB_IDX;
  const first = Object.keys(f).sort()[0];
  const iAligned: Series = {};
  for (const k of Object.keys(i)) if (k >= first) iAligned[k] = i[k];
  void iAligned;
  const trailingNet = { [name]: trailingStrings(f, "compounded", true), [idx]: indexTrailingStrings(f, i), "Value Added": vaStrings(f, i) };
  const short = kind === "SEST";
  return {
    Characteristics: {
      "Credit Quality": { Fund: short ? "A" : "A+", Index: short ? "A" : "AA", "+/-": "nan" },
      Duration: { Fund: short ? "2.41" : "7.35", Index: short ? "2.68" : "7.12", "+/-": short ? "-0.27" : "+0.23" },
      "Number of Securities": { Fund: short ? "86" : "112", Index: short ? "742" : "1784", "+/-": short ? "-656" : "-1672" },
      "Portfolio Yield": { Fund: short ? "4.21%" : "4.37%", Index: short ? "3.48%" : "3.91%", "+/-": short ? "+0.73%" : "+0.46%" },
      "Probability of Defaults (5Y)": { Fund: "0.62%", Index: "0.48%", "+/-": "+0.14%" },
      "% of Portfolio Rated Investment Grade": { Fund: short ? "93%" : "97%", Index: "100%", "+/-": short ? "-7%" : "-3%" },
      "Current Yield": { Fund: short ? "4.02%" : "3.88%", Index: short ? "3.31%" : "3.52%", "+/-": "+0.71%" },
    },
    "ESG Metrics": {
      "Board Diversity": { Fund: "34.1%", Index: "31.8%", "+/-": "+2.3%" },
      "Board Independence": { Fund: "81.2%", Index: "79.4%", "+/-": "+1.8%" },
      "Carbon Intensity": { Fund: "63.4", Index: "118.7", "+/-": "−55.3" },
      "S&P Global ESG Rank": { Fund: "72.5", Index: "64.1", "+/-": "+8.4" },
      "Water Intensity": { Fund: "412.8", Index: "655.1", "+/-": "-242.3" },
    },
    "Calendar Performance Gross": calendarStrings(f, i, name, idx),
    "Calendar Performance Net": calendarStrings(f, i, name, idx),
    "Trailing Returns Gross": trailingNet,
    "Trailing Returns Net": trailingNet,
    "Portfolio Snapshot": {
      Curve: short
        ? { Nymbus: { "Money Market (0-1 yr)": "18.4%", "Ultra Short-Term (1-3 yrs)": "57.9%", "Short-Term (>3 yrs)": "23.7%" }, Index: { "Money Market (0-1 yr)": "0.0%", "Ultra Short-Term (1-3 yrs)": "61.3%", "Short-Term (>3 yrs)": "38.7%" }, "Nymbus vs Index": {} }
        : { Nymbus: { "Short-Term (1-3 yrs)": "24.1%", "Mid-Term (3-10 yrs)": "44.6%", "Long-Term (>10 yrs)": "31.3%" }, Index: { "Short-Term (1-3 yrs)": "26.9%", "Mid-Term (3-10 yrs)": "40.2%", "Long-Term (>10 yrs)": "32.9%" }, "Nymbus vs Index": {} },
      Sectors: { Nymbus: { Corporate: short ? "78.2%" : "41.3%", Provincial: short ? "9.1%" : "29.7%", Federal: short ? "6.4%" : "22.8%", Municipal: "2.1%", Cash: short ? "4.2%" : "4.1%" }, Index: { Corporate: short ? "100.0%" : "27.9%", Provincial: short ? "0.0%" : "34.8%", Federal: short ? "0.0%" : "35.6%", Municipal: short ? "0.0%" : "1.7%" }, "Nymbus vs Index": {} },
      Country: { Nymbus: { Canada: "91.4%", "United States": "6.2%", Other: "2.4%" }, Index: { Canada: "100.0%" }, "Nymbus vs Index": {} },
      Industry: { Nymbus: { Financial: "38.2%", Energy: "12.1%", Utilities: "9.4%", Communications: "8.8%", Other: "31.5%" }, Index: { Financial: "41.0%", Energy: "10.2%", Utilities: "8.1%", Communications: "7.5%", Other: "33.2%" }, "Nymbus vs Index": {} },
      "Credit Ratings": { Nymbus: { AAA: short ? "8.1%" : "21.4%", AA: short ? "14.6%" : "33.2%", A: short ? "42.8%" : "28.6%", BBB: short ? "27.5%" : "13.8%", "BB & below": short ? "7.0%" : "3.0%", NR: "nan" }, Index: { AAA: short ? "3.2%" : "36.1%", AA: short ? "16.8%" : "31.4%", A: short ? "41.9%" : "20.3%", BBB: short ? "38.1%" : "12.2%", "BB & below": "0.0%" }, "Nymbus vs Index": {} },
      "Top 10 Holdings": {
        Nymbus: Object.fromEntries(Array.from({ length: 10 }, (_, j) => [String(j + 1), { Name: `Synthetic Issuer ${String.fromCharCode(65 + j)} ${short ? "3.1" : "4.2"}% 20${28 + (j % 7)}`, "Market Value %": `${(4.9 - j * 0.31).toFixed(1)}%` }])),
        Index: {},
      },
    },
    [`Monthly Returns: Nymbus ${kind === "SEB" ? "QCFI-SEB" : kind} Net`]: monthlyTable(f, "compounded", 2),
    [`Monthly Returns: ${idx}`]: monthlyTable(i, "compounded", 2),
  };
}

function multiBlock(): unknown {
  const multi = upTo(multiAll, END);
  const trailingNet = trailingStrings(multi, "compounded", false);
  return {
    "Calendar Performance Gross": Object.fromEntries(calendarYears(multi, END).map((y) => [String(y.year), numStr(y.value! + 0.012)])),
    "Trailing Returns Gross": trailingStrings(Object.fromEntries(Object.entries(multi).map(([k, v]) => [k, v + 0.001])), "compounded", false),
    "Monthly Returns Gross": monthlyTable(Object.fromEntries(Object.entries(multi).map(([k, v]) => [k, v + 0.001])), "compounded"),
    "Calendar Performance Net": Object.fromEntries(calendarYears(multi, END).map((y) => [String(y.year), numStr(y.value)])),
    "Trailing Returns Net": trailingNet,
    "Monthly Returns Net": monthlyTable(multi, "compounded"),
    "Portfolio Snapshot": {
      "Statistics Gross": statistics(multi, "compounded"),
      "Statistics Gross 3Y": statistics(multi, "compounded", 36),
      "Statistics Net": statistics(multi, "compounded"),
      "Statistics Net 3Y": statistics(multi, "compounded", 36),
      "Top 10 Holdings": Object.fromEntries(Array.from({ length: 10 }, (_, j) => [String(j + 1), { Name: j === 0 ? "Cash" : `Synthetic Equity ${String.fromCharCode(65 + j)} Inc`, "Market Value %": Math.round((9.8 - j * 0.7) * 10) / 10 }])),
      "Top 10 Futures": {},
      "Equity Sectors Allocation": { "Information Technology": "18.2%", Financials: "15.6%", "Health Care": "11.4%", Industrials: "10.9%", "Consumer Staples": "8.1%", Other: "12.3%" },
      "Equity Country Allocation": { "United States": "48.7%", Canada: "21.9%", Japan: "6.2%", "United Kingdom": "4.8%", Other: "5.1%" },
      "Systematic Strategies Allocation": {
        "2026-06-01": { EQUITIES: "41.25%", BONDS: "28.50%", CURRENCIES: "18.75%", COMMODITIES: "11.50%" },
        "2026-07-06": { EQUITIES: "39.75%", BONDS: "30.25%", CURRENCIES: "17.50%", COMMODITIES: "12.50%" },
        "2026-08-03": { EQUITIES: "40.50%", BONDS: "29.25%", CURRENCIES: "19.00%", COMMODITIES: "11.25%" },
      },
    },
    Characteristics: { "Dividend Yield": "2.14%", "Price/Earnings Ratio": "17.83", "Number of Equity Holdings": "54", "Number of Holdings": "71", "Largest Equity Sector Exposure": "18%" },
  };
}

function gmvBlock(): unknown {
  const gmv = upTo(gmvAll, END);
  const t = trailingStrings(gmv, "arithmetic", false);
  return {
    "Calendar Performance Gross": Object.fromEntries(calendarYears(gmv, END, { method: "arithmetic" }).map((y) => [String(y.year), numStr(y.value)])),
    "Trailing Returns Gross": t,
    "Value of $10M Investment Gross": {},
    "Monthly Returns Gross": monthlyTable(gmv, "arithmetic"),
    "Portfolio Snapshot": {
      "Statistics Gross": statistics(gmv, "arithmetic"),
      "Statistics Gross 3Y": statistics(gmv, "arithmetic", 36),
      "Top 10 Futures": Object.fromEntries(Array.from({ length: 8 }, (_, j) => [String(j + 1), { Name: `Synthetic Future ${j + 1}`, "Instrument Exposure %": `${(12.5 - j * 1.2).toFixed(1)}%` }])),
      "Systematic Strategies Allocation": {
        "2026-06-01": { EQUITIES: "35.00%", BONDS: "32.00%", CURRENCIES: "21.00%", COMMODITIES: "12.00%" },
        "2026-07-06": { EQUITIES: "33.00%", BONDS: "34.00%", CURRENCIES: "20.00%", COMMODITIES: "13.00%" },
        "2026-08-03": { EQUITIES: "34.00%", BONDS: "33.00%", CURRENCIES: "22.00%", COMMODITIES: "11.00%" },
      },
    },
  };
}

/* ------------------------------------------------------------------ write */
export const FTSE_SHORT_NAMES = [
  { short_name: "short_corp", index_id: 1101, index_name: "FTSE Canada Short Term Corporate Bond Index" },
  { short_name: "univ", index_id: 2001, index_name: "FTSE Canada Universe Bond Index" },
  { short_name: "ftse_tmx_canada_univ", index_id: 2001, index_name: "FTSE TMX Canada Universe Bond Index" },
  { short_name: "univ_corp", index_id: 2002, index_name: "FTSE Canada Universe Corporate Bond Index" },
];

export function generate(dir = HERE): void {
  const dp = path.join(dir, "dataplatform");
  const fs = path.join(dir, "factsheets");
  mkdirSync(dp, { recursive: true });
  mkdirSync(fs, { recursive: true });
  for (const f of ["ftse_short_overall.json"]) rmSync(path.join(dp, f), { force: true });
  const w = (p: string, v: unknown): void => writeFileSync(p, JSON.stringify(v, null, 1) + "\n");
  w(path.join(dp, "mnr_SEST.json"), mnr("SEST", sest, "2019-01-31"));
  w(path.join(dp, "mnr_SEB.json"), mnr("SEB", seb, "2019-02-28"));
  w(path.join(dp, "mnr_Multistrat.json"), mnr("Multistrat", multi, "2019-01-31"));
  for (const s of ["SEST", "SEB", "Multistrat"]) w(path.join(dp, `nav_${s}.json`), navPayload(s));
  w(path.join(dp, "apex_funds.json"), apexFunds);
  w(path.join(dp, "unitholders_funds.json"), unitholderFunds);
  w(path.join(dp, "aum.json"), aum);
  w(path.join(dp, "ftse_short_names.json"), FTSE_SHORT_NAMES);
  w(path.join(dp, "ftse_short_corp.json"), ftseRows("short_corp", "FTSE Canada Short Term Corporate Bond Index (synthetic)", ftseShortCorp).current);
  const univ = ftseRows("univ", "FTSE Canada Universe Bond Index (synthetic)", ftseUniv, { date: "2024-12-05", oldName: "ftse_tmx_canada_univ" });
  w(path.join(dp, "ftse_univ.json"), univ.current);
  w(path.join(dp, "ftse_ftse_tmx_canada_univ.json"), univ.old);
  w(path.join(dir, "analytics_fund_returns.json"), analyticsPayload());
  for (const short of ["SEST", "SEB", "Multistrat"] as const) {
    w(path.join(dp, `portfolio_${short}.json`), portfolioPayload(short, BOOKS[short].latest));
    w(path.join(dp, `portfolio_${short}_${BOOKS[short].monthEnd.asOf}.json`), portfolioPayload(short, BOOKS[short].monthEnd));
    w(path.join(dp, `distributions_${short}.json`), distributionsPayload(short));
  }
  for (const end of ["2026-07-31", LAST_MONTH]) {
    END = end;
    const ymd = end.slice(0, 7);
    w(path.join(fs, `bonds_data_${ymd}.json`), { SEST: bondBlock("SEST"), "QCFI-SEB": bondBlock("SEB") });
    w(path.join(fs, `factsheet_data_${ymd}.json`), { Multistrategy: multiBlock(), GMV_6pct: gmvBlock() });
  }
  END = LAST_MONTH;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  generate();
  console.log(`synthetic fixtures written to ${HERE}`);
}
