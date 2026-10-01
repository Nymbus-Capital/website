/**
 * Default admin content and its merge with the stored document: the SINGLE source used by the read model
 * (site.ts getContent) and the writer (content.ts updateContent). Dependency-free (unit tested under plain Node).
 */
import type { SiteContent } from "./types.ts";

export const DEFAULT_CONTENT: SiteContent = {
  version: 0,
  updatedAt: "1970-01-01T00:00:00.000Z",
  updatedBy: "system",
  firm: {
    aumLabel: { en: "$1.8B+", fr: "1,8 G$+" },
    announcement: null,
  },
  funds: {},
  pipeline: { publishMode: "review" },
};

/** Stored content (or nothing yet) merged over the defaults. Always a fresh object. */
export function mergeContent(c: SiteContent | null | undefined): SiteContent {
  if (!c) return structuredClone(DEFAULT_CONTENT);
  return {
    ...structuredClone(DEFAULT_CONTENT),
    ...c,
    firm: { ...DEFAULT_CONTENT.firm, ...c.firm },
    funds: { ...(c.funds ?? {}) },
    pipeline: { ...DEFAULT_CONTENT.pipeline, ...c.pipeline },
  };
}
