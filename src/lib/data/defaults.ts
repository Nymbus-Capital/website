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
    aumLabel: { en: "$1.9B", fr: "1,9 G$" },
    announcement: null,
  },
  funds: {},
  pipeline: { publishMode: "review" },
};

/** Previous default of the firm AUM label: a stored copy of it was never edited by hand, so it follows the new default. */
const LEGACY_AUM = [{ en: "$1.8B+", fr: "1,8 G$+" }];

/** Stored content (or nothing yet) merged over the defaults. Always a fresh object. */
export function mergeContent(c: SiteContent | null | undefined): SiteContent {
  if (!c) return structuredClone(DEFAULT_CONTENT);
  return {
    ...structuredClone(DEFAULT_CONTENT),
    ...c,
    firm: { ...DEFAULT_CONTENT.firm, ...c.firm, aumLabel: freshAum(c.firm?.aumLabel) },
    funds: { ...(c.funds ?? {}) },
    pipeline: { ...DEFAULT_CONTENT.pipeline, ...c.pipeline },
  };
}

function freshAum(stored: SiteContent["firm"]["aumLabel"]): SiteContent["firm"]["aumLabel"] {
  if (!stored) return DEFAULT_CONTENT.firm.aumLabel;
  return LEGACY_AUM.some((l) => l.en === stored.en && l.fr === stored.fr) ? DEFAULT_CONTENT.firm.aumLabel : stored;
}
