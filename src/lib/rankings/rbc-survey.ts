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
import { readJson, withLock, writeJson } from "../data/store.ts";
import { sendAlertNow } from "../pipeline/alerts.ts";

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

/** Latest edition known when this release was built (read by Nymbus, 2026-10-03): the floor of every check. */
export const SEEDED_RBC_LATEST: NonNullable<RbcCheckState["latest"]> = {
  year: 2026, quarter: 2, asOf: "2026-06-30", label: "Q2 2026", detectedAt: "2026-10-03T00:00:00.000Z",
  url: "https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q2_2026.pdf",
};

/** The stored latest edition when valid (linked, publishable) and not older than the seed, else the seed. */
export function effectiveLatest(state: Pick<RbcCheckState, "latest"> | null | undefined, now: Date): NonNullable<RbcCheckState["latest"]> {
  const l = state?.latest;
  return l && l.url && isPublishable(l, now) && quarterKey(l) >= quarterKey(SEEDED_RBC_LATEST) ? l : SEEDED_RBC_LATEST;
}

export const readRbcState = (): Promise<RbcCheckState | null> => readJson<RbcCheckState | null>(STATE, null).catch(() => null);

const MAX_PAGE = 3 * 1024 * 1024;
/** Hosts the check may read (redirects are followed by hand and only to these). */
export const RBC_HOSTS = ["www.rbcis.com", "rbcis.com", "www.rbcits.com", "rbcits.com"];
/** A survey is published about five weeks after its quarter end: a quarter ending later than this many days ago is not. */
export const PUBLICATION_LAG_DAYS = 21;

const allowedHost = (url: string): boolean => {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && RBC_HOSTS.includes(u.hostname.toLowerCase());
  } catch {
    return false;
  }
};

/** Latest quarter end (YYYY-MM-DD) that can already have a published survey on `now`. */
export function publishableCutoff(now: Date): string {
  return new Date(now.getTime() - PUBLICATION_LAG_DAYS * 86_400_000).toISOString().slice(0, 10);
}
export const isPublishable = (s: SurveyQuarter, now: Date): boolean => quarterEnd(s) <= publishableCutoff(now);

/** fetch with redirects followed by hand (max 3), each hop on an RBC host only. */
async function fetchRbc(fetchImpl: typeof fetch, url: string, init: RequestInit): Promise<Response> {
  let cur = url;
  for (let hop = 0; hop < 4; hop++) {
    if (!allowedHost(cur)) throw new Error(`refused host: ${cur}`);
    const res = await fetchImpl(cur, { ...init, redirect: "manual" });
    const loc = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (!loc) return res;
    await res.body?.cancel().catch(() => undefined);
    cur = new URL(loc, cur).toString();
  }
  throw new Error("too many redirects");
}

/** Read at most MAX_PAGE bytes of the body, then cancel the rest. */
async function readCapped(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const room = MAX_PAGE - total;
    chunks.push(value.byteLength > room ? value.subarray(0, room) : value);
    total += Math.min(value.byteLength, room);
    if (total >= MAX_PAGE) {
      await reader.cancel().catch(() => undefined);
      break;
    }
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.byteLength; }
  return new TextDecoder().decode(out);
}

async function fetchText(fetchImpl: typeof fetch, url: string): Promise<{ status: number; text: string }> {
  const res = await fetchRbc(fetchImpl, url, { headers: { "User-Agent": "NymbusWebsite/1.0 (rankings freshness check)", Accept: "text/html,application/xhtml+xml" }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) {
    await res.body?.cancel().catch(() => undefined);
    return { status: res.status, text: "" };
  }
  return { status: res.status, text: await readCapped(res) };
}

async function pdfExists(fetchImpl: typeof fetch, url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetchRbc(fetchImpl, url, { method: "HEAD", signal: AbortSignal.timeout(15_000) });
    await res.body?.cancel().catch(() => undefined);
    const type = res.headers.get("content-type") ?? "";
    return { ok: res.ok && /pdf|octet-stream/i.test(type), status: res.status };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message ?? String(e) };
  }
}

/**
 * Detect the latest published survey: listing pages first, then HEAD probes of the PDF address of the next quarters
 * after the newest edition known (listing, previous state or stored rankings). An edition counts only with a link (article
 * or PDF on an RBC host) and only when its quarter ended at least PUBLICATION_LAG_DAYS ago. `ok` is false only when no
 * source answered.
 */
export async function detectLatestSurvey(opts: { fetchImpl: typeof fetch; known?: SurveyQuarter | null; listingUrls?: string[]; now?: Date }): Promise<{ ok: boolean; latest: SurveyRef | null; sources: SourceCheck[] }> {
  const now = opts.now ?? new Date();
  const sources: SourceCheck[] = [];
  let latest = null as SurveyRef | null;
  const better = (r: SurveyRef | null | undefined) => {
    if (r && (!latest || quarterKey(r) > quarterKey(latest))) latest = r;
  };
  const counts = (r: SurveyRef) => !!r.url && allowedHost(r.url) && isPublishable(r, now);
  for (const url of opts.listingUrls ?? RBC_LISTING_URLS) {
    try {
      const { status, text } = await fetchText(opts.fetchImpl, url);
      const refs = (text ? parseSurveyRefs(text, url) : []).filter(counts);
      sources.push({ url, ok: status >= 200 && status < 300, status, found: refs[0] ? quarterLabel(refs[0]) : undefined });
      better(refs[0]);
    } catch (e: unknown) {
      sources.push({ url, ok: false, error: (e as Error)?.message ?? String(e) });
    }
  }
  // nothing known at all: start probing three quarters back
  let from: SurveyQuarter | null = latest ?? (opts.known && isPublishable(opts.known, now) ? opts.known : null);
  if (!from) {
    const cur = quarterOf(now.toISOString().slice(0, 10))!;
    from = fromKey(quarterKey(cur) - 3);
  }
  let probe = nextQuarter(from);
  for (let i = 0; i < 3 && isPublishable(probe, now); i++) {
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
  return { ok: sources.some((x) => x.ok), latest, sources };
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
  if (!state) out.push({ level: "info", key: "rankings.rbc.never", message: `The RBC pooled fund survey check has not run yet (it runs weekly; use “check now”). Latest edition known: ${SEEDED_RBC_LATEST.label}.` });
  if (state && !state.ok) {
    out.push({ level: "warn", key: "rankings.rbc.check-failed", message: `RBC pooled fund survey check failed on ${state.checkedAt.slice(0, 10)} (${state.error ?? "no source reachable"}). Rankings are unchanged; the check retries next week.` });
  }
  const age = !state ? 0 : state.lastSuccessAt ? (now.getTime() - Date.parse(state.lastSuccessAt)) / 86_400_000 : Infinity;
  if (age > 21) out.push({ level: "warn", key: "rankings.rbc.no-success", message: "No successful RBC pooled fund survey check in the last 3 weeks: check the published survey by hand (rbcis.com/en/insights)." });
  const latest = effectiveLatest(state, now);
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

/**
 * Run the check under a lock (one at a time; `{ locked: true }` when another check is running), store the state (the
 * last detected edition survives a failed check, unless it is not publishable yet: self-heal) and call the webhook once
 * per new edition.
 */
export async function runRbcSurveyCheck(opts: { fetchImpl?: typeof fetch; now?: Date; content?: Pick<SiteContent, "funds">; log?: (m: string) => void } = {}): Promise<RbcCheckState | { locked: true }> {
  return withLock("rankings-check", () => checkOnce(opts), 10 * 60_000);
}

async function checkOnce(opts: { fetchImpl?: typeof fetch; now?: Date; content?: Pick<SiteContent, "funds">; log?: (m: string) => void }): Promise<RbcCheckState> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const now = opts.now ?? new Date();
  const log = opts.log ?? ((m: string) => console.log(`[rankings] ${m}`));
  const stored = await readRbcState();
  // self-heal: a stored edition without a link or whose quarter is not over (+ lag) is dropped
  const prevLatest = effectiveLatest(stored, now);
  const prev = stored ? { ...stored, latest: prevLatest } : null;
  const storedDates = opts.content ? Object.values(storedRbcAsOf(opts.content)).sort() : [];
  const knownFromContent = storedDates.length ? quarterOf(storedDates[storedDates.length - 1]) : null;
  const known = [prev?.latest ?? null, knownFromContent].filter((x): x is SurveyQuarter => !!x).sort((x, y) => quarterKey(y) - quarterKey(x))[0] ?? null;
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
      // a failed delivery is tried again at the next check
      if (await alertWebhook(fetchImpl, `Nymbus website: new RBC pooled fund survey ${state.latest.label} published — update the rankings in /admin.`, pending.map((i) => `• ${i.message}`))) state.alertedFor = state.latest.label;
    }
  }
  try {
    await writeJson(STATE, state);
  } catch (e: unknown) {
    log(`could not store the check state: ${(e as Error)?.message ?? e}`);
  }
  return state;
}

/** true only when delivered: without a webhook (or on a failure) the edition is posted once one is configured / works */
async function alertWebhook(fetchImpl: typeof fetch, title: string, lines: string[]): Promise<boolean> {
  const r = await sendAlertNow({ title, lines, severity: "warn", adminPath: "/admin" }, { fetchImpl });
  return r === "sent";
}
