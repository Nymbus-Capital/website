/**
 * Website inquiries (contact form) on the data volume, one JSON file per inquiry:
 *
 *   inquiries/<id>.json      InquiryRecord (id = store.newId(): `20261006T143000-1a2b3c4d`, sortable by time)
 *
 * Written atomically (temp file + rename). Mark handled / delete / retention purge run under one lock so a delete is never
 * undone by a concurrent "mark handled". Retention: RETENTION_DAYS after receipt the file is deleted (purge on a daily
 * timer, see retention.ts, and whenever the admin lists them). No IP address, user agent or tracking data is kept.
 * Dependency-free (Node built-ins + relative `.ts` imports), unit tested under plain Node.
 */
import { listDir, newId, readJson, removePath, withLock, writeJson } from "../data/store.ts";
import type { CleanInquiry } from "./validate.ts";

export const INQUIRY_DIR = "inquiries";
export const RETENTION_DAYS = 365;
/** hard cap of stored inquiries (a flood cannot fill the volume); new ones are refused past it */
export const MAX_STORED = 5000;
/** version of the consent sentence shown next to the checkbox (contact.copy.ts `consent`) */
export const CONSENT_VERSION = "2026-10-06";

export interface InquiryRecord extends CleanInquiry {
  id: string;
  receivedAt: string;
  consent: { at: string; version: string };
  handled: { at: string; by: string } | null;
}

const ID_RE = /^\d{8}T\d{6}-[0-9a-f]{8}$/;
export const isInquiryId = (v: unknown): v is string => typeof v === "string" && ID_RE.test(v);

export class InquiryStoreFullError extends Error {
  constructor() {
    super("inquiry store is full");
  }
}

const file = (id: string): string[] => [INQUIRY_DIR, `${id}.json`];

async function ids(): Promise<string[]> {
  return (await listDir([INQUIRY_DIR])).filter((n) => n.endsWith(".json")).map((n) => n.slice(0, -5)).filter(isInquiryId);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Run `fn` under the inquiries lock, waiting up to ~3 s for it. */
async function locked<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 60; i++) {
    const r = await withLock("inquiries", async () => ({ value: await fn() }), 60_000);
    if ("value" in r) return r.value;
    await sleep(50);
  }
  throw new Error("inquiries are busy");
}

function isRecord(r: unknown): r is InquiryRecord {
  const x = r as InquiryRecord | null;
  return !!x && typeof x === "object" && isInquiryId(x.id) && typeof x.receivedAt === "string" && typeof x.name === "string" && typeof x.email === "string";
}

/** a resubmission of the same inquiry within this window is not stored again (double click, reload, retry) */
export const DUPLICATE_WINDOW_MS = 24 * 3_600_000;

/** The fields that make two inquiries "the same" (the sender's e-mail case-insensitively). */
function sameInquiry(a: CleanInquiry, b: CleanInquiry): boolean {
  const key = (q: CleanInquiry) =>
    JSON.stringify([q.email.toLowerCase(), q.name, q.profile, [...q.interests].sort(), q.phone ?? "", q.company ?? "", q.message ?? ""]);
  return key(a) === key(b);
}

/**
 * Store an inquiry (under the lock: the cap and the duplicate check see every concurrent save). An identical inquiry
 * received within DUPLICATE_WINDOW_MS is returned instead, with `duplicate: true`, and nothing is written.
 */
export function saveInquiry(v: CleanInquiry, now = new Date(), max = MAX_STORED): Promise<{ record: InquiryRecord; duplicate: boolean }> {
  return locked(async () => {
    const existing = await listInquiries();
    const t = now.getTime();
    const dup = existing.find((r) => Math.abs(t - Date.parse(r.receivedAt)) < DUPLICATE_WINDOW_MS && sameInquiry(r, v));
    if (dup) return { record: dup, duplicate: true };
    if ((await ids()).length >= max) throw new InquiryStoreFullError();
    const at = now.toISOString();
    const record: InquiryRecord = { id: newId(), receivedAt: at, ...v, consent: { at, version: CONSENT_VERSION }, handled: null };
    await writeJson(file(record.id), record);
    return { record, duplicate: false };
  });
}

/** Number of inquiries not yet marked handled (admin dashboard). */
export async function openInquiryCount(): Promise<number> {
  return (await listInquiries()).filter((r) => !r.handled).length;
}

export async function getInquiry(id: string): Promise<InquiryRecord | null> {
  if (!isInquiryId(id)) return null;
  const r = await readJson<unknown>(file(id), null).catch(() => null);
  return isRecord(r) && r.id === id ? r : null;
}

/** Every stored inquiry, newest first (unreadable files skipped). */
export async function listInquiries(): Promise<InquiryRecord[]> {
  const all = await Promise.all((await ids()).map((id) => getInquiry(id)));
  return all.filter((r): r is InquiryRecord => !!r).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt) || b.id.localeCompare(a.id));
}

export function setInquiryHandled(id: string, handled: boolean, by: string, now = new Date()): Promise<InquiryRecord | null> {
  return locked(async () => {
    const r = await getInquiry(id);
    if (!r) return null;
    const next: InquiryRecord = { ...r, handled: handled ? { at: now.toISOString(), by } : null };
    await writeJson(file(id), next);
    return next;
  });
}

export function deleteInquiry(id: string): Promise<InquiryRecord | null> {
  return locked(async () => {
    const r = await getInquiry(id);
    if (!r) return null;
    await removePath(file(id));
    return r;
  });
}

/** Time of receipt: the record's, else the one encoded in its id (a damaged file is still purged on time). */
function receivedMs(id: string, rec: InquiryRecord | null): number {
  const t = rec ? Date.parse(rec.receivedAt) : NaN;
  if (Number.isFinite(t)) return t;
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/.exec(id)!;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
}

/** Delete inquiries received more than RETENTION_DAYS ago; returns how many were deleted. */
export function purgeExpiredInquiries(now = new Date(), days = RETENTION_DAYS): Promise<number> {
  return locked(async () => {
    const limit = now.getTime() - days * 86_400_000;
    let n = 0;
    for (const id of await ids()) {
      if (receivedMs(id, await getInquiry(id)) < limit) {
        await removePath(file(id));
        n++;
      }
    }
    return n;
  });
}
