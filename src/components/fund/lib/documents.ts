// documents.ts — fund documents grouped by type, and the regulatory documents list
import type { DocType, DocumentMeta } from "../../../lib/data/types.ts";

const DOC_ORDER: DocType[] = [
  "factsheet",
  "fund-facts",
  "commentary",
  "presentation",
  "prospectus",
  "annual-report",
  "interim-report",
  "mrfp",
  "proxy-voting",
  "tax-factors",
  "esg",
  "other",
];

/** Group documents by type (fixed order), newest first within a group; the display language first. Documents that
 * carry `published: false` are dropped (the public DTO has no flag: it only ever contains published ones). */
type GroupableDoc = Pick<DocumentMeta, "id" | "type" | "lang" | "date"> & { published?: boolean };
export function groupDocuments<D extends GroupableDoc>(docs: D[], lang: "en" | "fr"): { type: DocType; docs: D[] }[] {
  const pub = docs.filter((d) => d.published !== false);
  const rank = (d: D) => (d.lang === lang || d.lang === "both" ? 0 : 1);
  return DOC_ORDER.map((type) => ({
    type,
    docs: pub.filter((d) => d.type === type).sort((a, b) => b.date.localeCompare(a.date) || rank(a) - rank(b)),
  })).filter((g) => g.docs.length > 0);
}

/** Regulatory documents of a Canadian mutual fund (NI 81-101 / 81-106), listed as available on request when none is uploaded. */
export const REGULATORY_DOCS: DocType[] = ["fund-facts", "prospectus", "annual-report", "interim-report", "mrfp"];
