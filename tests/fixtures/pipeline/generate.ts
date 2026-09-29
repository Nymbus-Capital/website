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
 *   factsheets/bonds_data_2026-08.json, factsheets/factsheet_data_2026-08.json   archives in the real shape
 *
 * The factsheet figures are computed from the same synthetic series (rounded like the producer), so the
 * pipeline cross-checks pass on the fixtures.
 */
import { mkdirSync, writeFileSync } from "node:fs";
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
const sest: Series = {};
for (const m of months("2019-01-31", LAST_MONTH)) sest[m] = r8(0.0008 + 0.8 * idxShort[m] + 0.0035 * g());
const seb: Series = {};
for (const m of months("2019-02-28", LAST_MONTH)) seb[m] = r8(0.0006 + 0.9 * idxUniv[m] + 0.0045 * g());
const multi: Series = {};
for (const m of months("2019-01-31", LAST_MONTH)) multi[m] = r8(0.0055 + 0.019 * g());
const gmv: Series = {};
for (const m of months("2015-01-31", LAST_MONTH)) gmv[m] = r8(0.0042 + 0.016 * g());

/* ------------------------------------------------------------------ formatting like convert_to_percent_str */
const pyRound1 = (x: number): string => (Math.round(x * 10) / 10).toFixed(1);
const pctStr = (x: number | null, plus = false): string => (x === null ? "nan" : `${plus && x > 0 ? "+" : ""}${pyRound1(x * 100)}%`);
const numStr = (x: number | null): string => (x === null ? "nan" : pyRound1(x * 100));

function trailingStrings(s: Series, method: Method, withPct: boolean, plus = false): Record<string, string> {
  const t = trailing(s, LAST_MONTH, { method });
  const out: Record<string, string> = {};
  const fmt = (v: number | null): string => (withPct ? pctStr(v, plus) : numStr(v));
  out["1M"] = fmt(t["1M"]);
  out["3M"] = fmt(t["3M"]);
  out["2026"] = fmt(t.YTD);
  for (const p of ["1Y", "2Y", "3Y", "5Y"] as const) if (t[p] !== null) out[p] = fmt(t[p]);
  out["SI"] = fmt(t.SI);
  return out;
}
function vaStrings(f: Series, i: Series): Record<string, string> {
  const tf = trailing(f, LAST_MONTH);
  const first = Object.keys(f).sort()[0];
  const ti = trailing(i, LAST_MONTH, { siStart: first });
  const out: Record<string, string> = {};
  const labels: [string, keyof typeof tf][] = [["1M", "1M"], ["3M", "3M"], ["2026", "YTD"], ["1Y", "1Y"], ["2Y", "2Y"], ["3Y", "3Y"], ["5Y", "5Y"], ["SI", "SI"]];
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
  const ti = trailing(i, LAST_MONTH, { siStart: first });
  const tf = trailing(f, LAST_MONTH);
  const out: Record<string, string> = {};
  const labels: [string, keyof typeof ti][] = [["1M", "1M"], ["3M", "3M"], ["2026", "YTD"], ["1Y", "1Y"], ["2Y", "2Y"], ["3Y", "3Y"], ["5Y", "5Y"], ["SI", "SI"]];
  for (const [lab, k] of labels) if (tf[k] !== null) out[lab] = pctStr(ti[k]);
  return out;
}
function calendarStrings(f: Series, i: Series | null, fundName: string, indexName: string | null): Record<string, Record<string, string>> {
  const first = Object.keys(f).sort()[0];
  const cf = calendarYears(f, LAST_MONTH, { first });
  const ci = i ? new Map(calendarYears(i, LAST_MONTH, { first }).map((y) => [y.year, y.value])) : null;
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
function monthlyTable(s: Series, method: Method): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  const years = [...new Set(Object.keys(s).map((k) => k.slice(0, 4)))].sort().reverse();
  for (const y of years) {
    const row: Record<string, string> = {};
    const rs: number[] = [];
    for (let m = 1; m <= 12; m++) {
      const k = monthEnd(Number(y), m);
      if (k in s) {
        row[`${String(m).padStart(2, "0")}-${MON[m - 1]}`] = pctStr(s[k]);
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
  const rs = months ? window(s, LAST_MONTH, months)! : window(s, LAST_MONTH)!;
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
function mnr(short: string, s: Series, first: string): unknown {
  const rows = months(first, LAST_MONTH).map((m) => ({
    month: m, net_return: s[m], status: "ready", method: "compounded_apex_net_daily", source_dates: [], source_row_ids: [], issue: null,
  }));
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

function navPayload(short: string): unknown {
  const days = businessDays("2026-09-08", "2026-09-28");
  const rnd = gauss(mulberry32(short.length * 7919 + 13));
  const rows: Record<string, unknown>[] = [];
  for (const k of CLASSES[short]) {
    let v = k.nav;
    for (const d of days) {
      const r = (short === "Multistrat" ? 0.004 : 0.0012) * rnd();
      v = Math.round(v * (1 + r) * 1e4) / 1e4;
      const base = { date: d, fundserv: k.fundserv, class_display: k.display, class_code: k.display, currency: k.currency, short_name: short, nav_type: "FINAL_NAV", fund_mapped: true, account: "SYNTHETIC", fund_name: `SYNTHETIC ${short}`, class_name_raw: k.display };
      rows.push({ ...base, source: "apex", nav_per_share_local: v, nav_per_share_cad: k.currency === "USD" ? Math.round(v * 1.37 * 1e4) / 1e4 : v, net_daily_return: r6(r) });
      // a lagging second source on some days: must lose against apex
      if (d >= "2026-09-24") rows.push({ ...base, source: "cibc", nav_per_share_local: Math.round(v * 1.003 * 1e4) / 1e4, nav_per_share_cad: null, net_daily_return: null });
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

function ftseRows(short: string, indexName: string, s: Series): unknown[] {
  // monthly -> levels; daily levels on the last 3 business days of each month (flat within those days)
  const rows: unknown[] = [];
  let level = 1000;
  const push = (d: string, v: number): void => {
    const base = { date: d, short_name: short, index_name: indexName, index_content: "synthetic", term: null, industry_sector: null, industry_group: null, price_index: Math.round(v * 0.62 * 1000) / 1000, average_yield: 3.9, modified_duration: short === "univ" ? 7.1 : 2.7 };
    rows.push({ ...base, rating: null, total_return: Math.round(v * 1e6) / 1e6 });
    rows.push({ ...base, rating: "All", term: "Short", total_return: Math.round(v * 1.01 * 1e6) / 1e6 });
    rows.push({ ...base, rating: "AAA", total_return: Math.round(v * 0.97 * 1e6) / 1e6 });
  };
  const decDays = businessDays("2018-12-01", "2018-12-31").slice(-3);
  for (const d of decDays) push(d, level);
  for (const m of months("2019-01-31", LAST_MONTH)) {
    level *= 1 + s[m];
    for (const d of businessDays(`${m.slice(0, 7)}-01`, m).slice(-3)) push(d, level);
  }
  // a few September days (partial month: not a monthly return)
  for (const d of businessDays("2026-09-01", "2026-09-28").slice(-3)) push(d, level * 1.002);
  return rows;
}

/* ------------------------------------------------------------------ factsheets */
const SEST_NAME = "Nymbus Monthly Income Fund";
const SEST_IDX = "FTSE Canada Short Term Corporate Bond Index";
const SEB_NAME = "Nymbus Sustainable Enhanced Bonds Fund";
const SEB_IDX = "FTSE Canada Universe Bond Index";

function bondBlock(kind: "SEST" | "SEB"): unknown {
  const f = kind === "SEST" ? sest : seb;
  const i = kind === "SEST" ? idxShort : idxUniv;
  const name = kind === "SEST" ? SEST_NAME : SEB_NAME;
  const idx = kind === "SEST" ? SEST_IDX : SEB_IDX;
  const first = Object.keys(f).sort()[0];
  const iAligned: Series = {};
  for (const k of Object.keys(i)) if (k >= first) iAligned[k] = i[k];
  const trailingNet = { [name]: trailingStrings(f, "compounded", true), [idx]: indexTrailingStrings(f, i), "Value Added": vaStrings(f, i) };
  const short = kind === "SEST";
  return {
    Characteristics: {
      "Credit Quality": { Fund: short ? "A" : "A+", Index: short ? "A" : "AA", "+/-": "nan" },
      Duration: { Fund: short ? "2.41" : "7.35", Index: short ? "2.68" : "7.12", "+/-": short ? "-0.27" : "+0.23" },
      "Liquidity Score": { Fund: "71.3%", Index: "74.2%", "+/-": "-2.9%" },
      "Net Credit Leverage": { Fund: "", Index: "", "+/-": "" },
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
    [`Monthly Returns: Nymbus ${kind} Net`]: monthlyTable(f, "compounded"),
  };
}

function multiBlock(): unknown {
  const trailingNet = trailingStrings(multi, "compounded", false);
  return {
    "Calendar Performance Gross": Object.fromEntries(calendarYears(multi, LAST_MONTH).map((y) => [String(y.year), numStr(y.value! + 0.012)])),
    "Trailing Returns Gross": trailingStrings(Object.fromEntries(Object.entries(multi).map(([k, v]) => [k, v + 0.001])), "compounded", false),
    "Monthly Returns Gross": monthlyTable(Object.fromEntries(Object.entries(multi).map(([k, v]) => [k, v + 0.001])), "compounded"),
    "Calendar Performance Net": Object.fromEntries(calendarYears(multi, LAST_MONTH).map((y) => [String(y.year), numStr(y.value)])),
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
  const t = trailingStrings(gmv, "arithmetic", false);
  return {
    "Calendar Performance Gross": Object.fromEntries(calendarYears(gmv, LAST_MONTH, { method: "arithmetic" }).map((y) => [String(y.year), numStr(y.value)])),
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
export function generate(dir = HERE): void {
  const dp = path.join(dir, "dataplatform");
  const fs = path.join(dir, "factsheets");
  mkdirSync(dp, { recursive: true });
  mkdirSync(fs, { recursive: true });
  const w = (p: string, v: unknown): void => writeFileSync(p, JSON.stringify(v, null, 1) + "\n");
  w(path.join(dp, "mnr_SEST.json"), mnr("SEST", sest, "2019-01-31"));
  w(path.join(dp, "mnr_SEB.json"), mnr("SEB", seb, "2019-02-28"));
  w(path.join(dp, "mnr_Multistrat.json"), mnr("Multistrat", multi, "2019-01-31"));
  for (const s of ["SEST", "SEB", "Multistrat"]) w(path.join(dp, `nav_${s}.json`), navPayload(s));
  w(path.join(dp, "apex_funds.json"), apexFunds);
  w(path.join(dp, "unitholders_funds.json"), unitholderFunds);
  w(path.join(dp, "aum.json"), aum);
  w(path.join(dp, "ftse_short_overall.json"), ftseRows("short_overall", "FTSE Canada Short Term Overall Bond Index (synthetic)", idxShort));
  w(path.join(dp, "ftse_univ.json"), ftseRows("univ", "FTSE Canada Universe Bond Index (synthetic)", idxUniv));
  w(path.join(fs, "bonds_data_2026-08.json"), { SEST: bondBlock("SEST"), "QCFI-SEB": bondBlock("SEB") });
  w(path.join(fs, "factsheet_data_2026-08.json"), { Multistrategy: multiBlock(), GMV_6pct: gmvBlock() });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  generate();
  console.log(`synthetic fixtures written to ${HERE}`);
}
