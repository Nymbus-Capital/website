/**
 * Freshness check of the RBC Investor Services pooled fund survey (quarterly, public at rbcis.com, formerly rbcits.com).
 *
 * Weekly (src/lib/rankings/schedule.ts): read the public insights listing, detect the latest survey quarter it links to,
 * and probe the predictable PDF address of the following quarters. When a quarter newer than the stored RBC rankings is
 * published, the admin dashboard shows an issue ("new RBC pooled fund survey Qx published — update rankings") and the
 * alert webhook is called once. A failed check only logs and shows an issue: it never hides or changes a ranking (hiding
 * is the staleness rule of policy.ts, based on the as-of date alone).
 *
 * The parser is pure and unit tested with small hand-written fixtures (tests/fixtures/rankings/).
 */
import type { FundKey, SiteContent } from "../data/types.ts";
import { readJson, writeJson } from "../data/store.ts";

export const RBC_LISTING_URLS = ["https://www.rbcis.com/en/our-insights.page", "https://www.rbcits.com/en/insights/"];
export const RBC_PDF_BASE = "https://www.rbcis.com/assets/rbcits/docs/";

export interface SurveyQuarter { year: number; quarter: 1 | 2 | 3 | 4 }
export interface SurveyRef extends SurveyQuarter { url?: string }

const q = (n: number): 1 | 2 | 3 | 4 | null => (n >= 1 && n <= 4 ? (n as 1 | 2 | 3 | 4) : null);
const fullYear = (y: string): number => (y.length === 2 ? 2000 + Number(y) : Number(y));
const plausibleYear = (y: number) => y >= 2015 && y <= 2100;

export const quarterKey = (s: SurveyQuarter): number => s.year * 4 + (s.quarter - 1);
export const fromKey = (k: number): SurveyQuarter => ({ year: Math.floor(k / 4), quarter: ((k % 4) + 1) as 1 | 2 | 3 | 4 });
export const quarterLabel = (s: SurveyQuarter): string => `Q${s.quarter} ${s.year}`;

/** Last day of the quarter, YYYY-MM-DD. */
export function quarterEnd(s: SurveyQuarter): string {
  const month = s.quarter * 3;
  const day = new Date(Date.UTC(s.year, month, 0)).getUTCDate();
  return `${s.year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Quarter containing an ISO date. */
export function quarterOf(iso: string): SurveyQuarter | null {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(iso);
  if (!m) return null;
  return { year: Number(m[1]), quarter: Math.ceil(Number(m[2]) / 3) as 1 | 2 | 3 | 4 };
}

export function nextQuarter(s: SurveyQuarter): SurveyQuarter {
  return s.quarter === 4 ? { year: s.year + 1, quarter: 1 } : { year: s.year, quarter: (s.quarter + 1) as 1 | 2 | 3 | 4 };
}

/** Address RBC has used for the English survey PDF ("FINAL_EN_Pooled_Fund_Survey_Q2_2026.pdf"; Q3 2024 ended in ".PDF"). */
export const expectedPdfUrl = (s: SurveyQuarter, ext: "pdf" | "PDF" = "pdf"): string => `${RBC_PDF_BASE}FINAL_EN_Pooled_Fund_Survey_Q${s.quarter}_${s.year}.${ext}`;

function absolute(href: string, base: string): string | undefined {
  try {
    const u = new URL(href.replace(/&amp;/g, "&"), base);
    return u.protocol === "https:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Every survey edition a page refers to: article links (`/insights/2026/08/pooled-fund-survey-q2-26`), PDF links
 * (`Pooled_Fund_Survey_Q2_2026.pdf`, spaces encoded or not) and titles ("Pooled Fund Survey – Q2 2026", "Q2 2026 Pooled
 * Fund Survey"). Deduplicated by quarter, the first link found for a quarter kept; newest first.
 */
export function parseSurveyRefs(html: string, baseUrl = RBC_LISTING_URLS[0]): SurveyRef[] {
  const found = new Map<number, SurveyRef>();
  const add = (year: number, quarter: number, url?: string) => {
    const qq = q(quarter);
    if (!qq || !plausibleYear(year)) return;
    const k = quarterKey({ year, quarter: qq });
    const cur = found.get(k);
    if (!cur) found.set(k, { year, quarter: qq, ...(url ? { url } : {}) });
    else if (!cur.url && url) cur.url = url;
  };
  // links: href="…pooled-fund-survey-q2-26…" / "…Pooled_Fund_Survey_Q2_2026.pdf" / "…Pooled%20Fund%20Survey%20Q2%202020.pdf"
  for (const m of html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
    const href = m[1];
    const flat = decodeURIComponentSafe(href).toLowerCase();
    let mm = /pooled[-_ ]fund[-_ ]survey[-_ ](?:final[-_ ])?q([1-4])[-_ ](\d{4}|\d{2})(?!\d)/.exec(flat);
    if (mm) {
      add(fullYear(mm[2]), Number(mm[1]), absolute(href, baseUrl));
      continue;
    }
    mm = /pooled[-_ ]fund[-_ ]survey[^"']*?q([1-4])[-_ ](\d{4})(?!\d)/.exec(flat);
    if (mm) add(Number(mm[2]), Number(mm[1]), absolute(href, baseUrl));
  }
  // titles in the text
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&ndash;|&#8211;|&mdash;|&#8212;/g, "–").replace(/\s+/g, " ");
  for (const m of text.matchAll(/pooled fund survey\s*[–—:-]?\s*q([1-4])\s+(\d{4})/gi)) add(Number(m[2]), Number(m[1]));
  for (const m of text.matchAll(/q([1-4])\s+(\d{4})\s+pooled fund survey/gi)) add(Number(m[2]), Number(m[1]));
  return [...found.values()].sort((a, b) => quarterKey(b) - quarterKey(a));
}

function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/* ------------------------------------------------------------------ check */

export interface SourceCheck { url: string; ok: boolean; status?: number; found?: string; error?: string }

export interface RbcCheckState {
  checkedAt: string;
  /** the check reached at least one source */
  ok: boolean;
  lastSuccessAt?: string;
  /** latest edition detected (kept from the previous check when this one failed) */
  latest?: SurveyRef & { asOf: string; label: string; detectedAt: string };
  sources: SourceCheck[];
  error?: string;
  /** quarter (label) the alert webhook was last called for */
  alertedFor?: string;
}

const STATE = ["rankings", "rbc-survey-check.json"];

export const readRbcState = (): Promise<RbcCheckState | null> => readJson<RbcCheckState | null>(STATE, null).catch(() => null);

const MAX_PAGE = 3 * 1024 * 1024;

async function fetchText(fetchImpl: typeof fetch, url: string): Promise<{ status: number; text: string }> {
  const res = await fetchImpl(url, { headers: { "User-Agent": "NymbusWebsite/1.0 (rankings freshness check)", Accept: "text/html,application/xhtml+xml" }, redirect: "follow", signal: AbortSignal.timeout(20_000) });
  const text = res.ok ? (await res.text()).slice(0, MAX_PAGE) : "";
  if (!res.ok) await res.body?.cancel().catch(() => undefined);
  return { status: res.status, text };
}

async function pdfExists(fetchImpl: typeof fetch, url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetchImpl(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15_000) });
    await res.body?.cancel().catch(() => undefined);
    const type = res.headers.get("content-type") ?? "";
    return { ok: res.ok && /pdf|octet-stream/i.test(type), status: res.status };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message ?? String(e) };
  }
}

/**
 * Detect the latest published survey: listing pages first, then HEAD probes of the PDF address of the next two quarters
 * after the newest edition known (listing, previous state or stored rankings). `ok` is false only when no source answered.
 */
export async function detectLatestSurvey(opts: { fetchImpl: typeof fetch; known?: SurveyQuarter | null; listingUrls?: string[]; now?: Date }): Promise<{ ok: boolean; latest: SurveyRef | null; sources: SourceCheck[] }> {
  const sources: SourceCheck[] = [];
  let latest: SurveyRef | null = null;
  const better = (r: SurveyRef | null | undefined) => {
    if (r && (!latest || quarterKey(r) > quarterKey(latest))) latest = r;
  };
  for (const url of opts.listingUrls ?? RBC_LISTING_URLS) {
    try {
      const { status, text } = await fetchText(opts.fetchImpl, url);
      const refs = text ? parseSurveyRefs(text, url) : [];
      sources.push({ url, ok: status >= 200 && status < 300, status, found: refs[0] ? quarterLabel(refs[0]) : undefined });
      better(refs[0]);
    } catch (e: unknown) {
      sources.push({ url, ok: false, error: (e as Error)?.message ?? String(e) });
    }
  }
  // nothing known at all: start probing three quarters back (a survey is published about five weeks after quarter end)
  let from: SurveyQuarter | null = latest ?? opts.known ?? null;
  if (!from) {
    const cur = quarterOf((opts.now ?? new Date()).toISOString().slice(0, 10))!;
    from = fromKey(quarterKey(cur) - 3);
  }
  let probe = nextQuarter(from);
  for (let i = 0; i < 3; i++) {
    let hit: string | null = null;
    for (const ext of ["pdf", "PDF"] as const) {
      const url = expectedPdfUrl(probe, ext);
      const r = await pdfExists(opts.fetchImpl, url);
      sources.push({ url, ok: r.status !== undefined, status: r.status, error: r.error, found: r.ok ? quarterLabel(probe) : undefined });
      if (r.ok) { hit = url; break; }
    }
    if (!hit) break;
    better({ ...probe, url: hit });
    probe = nextQuarter(probe);
  }
  return { ok: sources.some((s) => s.ok), latest, sources };
}

/** Newest as-of date of the RBC entries stored for each fund (drafts included: a draft means "being updated"). */
export function storedRbcAsOf(content: Pick<SiteContent, "funds">): Partial<Record<FundKey, string>> {
  const out: Partial<Record<FundKey, string>> = {};
  for (const [key, fc] of Object.entries(content.funds ?? {}) as [FundKey, NonNullable<SiteContent["funds"][FundKey]>][]) {
    const dates = (fc.rankings?.thirdParty ?? []).filter((e) => e.provider === "rbc-pfs" && e.confirmed && /^\d{4}-\d{2}-\d{2}$/.test(e.asOf)).map((e) => e.asOf).sort();
    if (dates.length) out[key] = dates[dates.length - 1];
  }
  return out;
}

export interface RankingIssue { level: "warn" | "info"; key: string; message: string }

/** Admin issues of the survey check (pure). */
export function rbcIssues(state: RbcCheckState | null, content: Pick<SiteContent, "funds">, now: Date): RankingIssue[] {
  const out: RankingIssue[] = [];
  if (!state) return [{ level: "info", key: "rankings.rbc.never", message: "The RBC pooled fund survey check has not run yet (it runs weekly; use “check now”)." }];
  if (!state.ok) {
    out.push({ level: "warn", key: "rankings.rbc.check-failed", message: `RBC pooled fund survey check failed on ${state.checkedAt.slice(0, 10)} (${state.error ?? "no source reachable"}). Rankings are unchanged; the check retries next week.` });
  }
  const age = state.lastSuccessAt ? (now.getTime() - Date.parse(state.lastSuccessAt)) / 86_400_000 : Infinity;
  if (age > 21) out.push({ level: "warn", key: "rankings.rbc.no-success", message: "No successful RBC pooled fund survey check in the last 3 weeks: check the published survey by hand (rbcis.com/en/insights)." });
  const latest = state.latest;
  if (!latest) return out;
  const stored = storedRbcAsOf(content);
  const funds = Object.entries(stored) as [FundKey, string][];
  if (!funds.length) {
    out.push({ level: "info", key: "rankings.rbc.none", message: `Latest RBC pooled fund survey: ${latest.label} (period ended ${latest.asOf}). No confirmed RBC ranking is entered for any fund.` });
    return out;
  }
  for (const [key, asOf] of funds) {
    if (asOf < latest.asOf) {
      out.push({ level: "warn", key: `rankings.rbc.new.${key}`, message: `New RBC pooled fund survey ${latest.label} published${latest.url ? ` (${latest.url})` : ""} — update rankings for ${key} (stored: period ended ${asOf}).` });
    }
  }
  return out;
}

/** Run the check, store the state (the last detected edition survives a failed check) and call the webhook once per new edition. */
export async function runRbcSurveyCheck(opts: { fetchImpl?: typeof fetch; now?: Date; content?: Pick<SiteContent, "funds">; log?: (m: string) => void } = {}): Promise<RbcCheckState> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const now = opts.now ?? new Date();
  const log = opts.log ?? ((m: string) => console.log(`[rankings] ${m}`));
  const prev = await readRbcState();
  const storedDates = opts.content ? Object.values(storedRbcAsOf(opts.content)).sort() : [];
  const knownFromContent = storedDates.length ? quarterOf(storedDates[storedDates.length - 1]) : null;
  const known = [prev?.latest ?? null, knownFromContent].filter((x): x is SurveyQuarter => !!x).sort((a, b) => quarterKey(b) - quarterKey(a))[0] ?? null;
  let state: RbcCheckState;
  try {
    const r = await detectLatestSurvey({ fetchImpl, known, now });
    const detected: SurveyRef | null = r.latest;
    const keep = prev?.latest && (!detected || quarterKey(prev.latest) >= quarterKey(detected)) ? prev.latest : null;
    const latest = keep ?? (detected ? { ...detected, asOf: quarterEnd(detected), label: quarterLabel(detected), detectedAt: now.toISOString() } : undefined);
    state = { checkedAt: now.toISOString(), ok: r.ok, lastSuccessAt: r.ok ? now.toISOString() : prev?.lastSuccessAt, latest, sources: r.sources, ...(r.ok ? {} : { error: "no source reachable" }), alertedFor: prev?.alertedFor };
  } catch (e: unknown) {
    state = { ...(prev ?? { sources: [] }), checkedAt: now.toISOString(), ok: false, error: (e as Error)?.message ?? String(e), sources: prev?.sources ?? [] } as RbcCheckState;
  }
  log(`RBC pooled fund survey check: ${state.ok ? "ok" : `failed (${state.error})`}; latest ${state.latest?.label ?? "unknown"}`);
  if (opts.content && state.latest) {
    const pending = rbcIssues(state, opts.content, now).filter((i) => i.key.startsWith("rankings.rbc.new."));
    if (pending.length && state.alertedFor !== state.latest.label) {
      await alertWebhook(fetchImpl, [`Nymbus website: new RBC pooled fund survey ${state.latest.label} published — update the rankings in /admin.`, ...pending.map((i) => `• ${i.message}`)].join("\n"));
      state.alertedFor = state.latest.label;
    }
  }
  try {
    await writeJson(STATE, state);
  } catch (e: unknown) {
    log(`could not store the check state: ${(e as Error)?.message ?? e}`);
  }
  return state;
}

async function alertWebhook(fetchImpl: typeof fetch, text: string): Promise<void> {
  const url = process.env.PIPELINE_ALERT_WEBHOOK;
  if (!url) return;
  try {
    const res = await fetchImpl(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }), signal: AbortSignal.timeout(15_000) });
    await res.body?.cancel().catch(() => undefined);
  } catch (e: unknown) {
    console.error(`[rankings] alert webhook failed: ${String((e as Error)?.message ?? e).split(url).join("<webhook>")}`);
  }
}
