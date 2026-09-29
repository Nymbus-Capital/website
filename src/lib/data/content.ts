/**
 * Admin-managed content (`content/site-content.json`): read (merged with DEFAULT_CONTENT, see site.ts) and save with
 * optimistic concurrency. Every save keeps a copy of the previous version in `content/history/`.
 *
 * This module is dependency-free at load time (relative `.ts` imports, `site.ts` is loaded lazily) so the
 * concurrency logic is unit tested under plain Node (tests/unit/admin/content.test.ts).
 */
import { readJson, writeJson, withLock } from "./store.ts";
import type { SiteContent } from "./types.ts";

export class ContentConflictError extends Error {
  readonly status = 409;
  readonly expected: number;
  readonly actual: number;
  constructor(expected: number, actual: number) {
    super(`The content was changed by someone else (you edited version ${expected}, the current version is ${actual}). Reload and try again.`);
    this.expected = expected;
    this.actual = actual;
  }
}

export class ContentBusyError extends Error {
  readonly status = 503;
  constructor() {
    super("The content is being saved by someone else; try again in a moment.");
  }
}

const FILE = ["content", "site-content.json"];

/** Content as the site uses it (defaults merged in). */
export async function getContent(): Promise<SiteContent> {
  const site = await import("./site");
  return site.getContent();
}

/** Raw stored version number (0 when nothing has been saved yet). */
export async function currentVersion(): Promise<number> {
  const c = await readJson<SiteContent | null>(FILE, null);
  return c && Number.isInteger(c.version) ? c.version : 0;
}

const historyName = (c: SiteContent) => `${new Date().toISOString().replace(/[:.]/g, "-")}-v${c.version}.json`;

/**
 * Save `next` if `next.version` equals the stored version (the version the editor loaded), else throw
 * ContentConflictError. The stored document gets version + 1, updatedAt, updatedBy.
 */
export function saveContent(next: SiteContent, by: string): Promise<SiteContent> {
  return updateContent(next.version, () => next, by);
}

/**
 * Optimistic-concurrency update: under an exclusive lock, read the stored content (defaults merged in), check its
 * version equals `expectedVersion` (else ContentConflictError), apply `mutate`, keep the previous version in
 * content/history/, and write version + 1. Serialised so two saves on the same version cannot both win, and the
 * mutation always applies to the latest stored document (no lost update between read and write).
 */
export async function updateContent(expectedVersion: number, mutate: (current: SiteContent) => SiteContent, by: string): Promise<SiteContent> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const r = await withLock(
      "content",
      async () => {
        const stored = await readJson<SiteContent | null>(FILE, null);
        const actual = stored && Number.isInteger(stored.version) ? stored.version : 0;
        if (expectedVersion !== actual) throw new ContentConflictError(expectedVersion, actual);
        const base = mergeDefaults(stored);
        const next = mutate(base);
        if (stored) await writeJson(["content", "history", historyName(stored)], stored);
        const saved: SiteContent = { ...next, version: actual + 1, updatedAt: new Date().toISOString(), updatedBy: by };
        await writeJson(FILE, saved);
        return saved;
      },
      60_000,
    );
    if (!("locked" in r)) return r;
    await new Promise((res) => setTimeout(res, 50 + attempt * 25));
  }
  throw new ContentBusyError();
}

/** Same merge as site.ts getContent (kept here so this module has no Next-only import at load time). */
export const EMPTY_CONTENT: SiteContent = {
  version: 0,
  updatedAt: "1970-01-01T00:00:00.000Z",
  updatedBy: "system",
  firm: { aumLabel: { en: "1.8 B$+", fr: "1,8 G$+" }, announcement: null },
  funds: {},
  pipeline: { publishMode: "auto" },
};

function mergeDefaults(c: SiteContent | null): SiteContent {
  if (!c) return structuredClone(EMPTY_CONTENT);
  return {
    ...EMPTY_CONTENT,
    ...c,
    firm: { ...EMPTY_CONTENT.firm, ...c.firm },
    funds: { ...(c.funds ?? {}) },
    pipeline: { ...EMPTY_CONTENT.pipeline, ...c.pipeline },
  };
}
