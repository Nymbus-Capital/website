/**
 * Props that cross the server → client boundary: plain JSON, no functions.
 */
import type { FundSpec } from "@/config/funds";
import type { DocumentMeta, FundContent, FundData, FundKey } from "@/lib/data/types";
import type { BrandAssets } from "@/lib/data/brand-assets";
import type { L } from "@/lib/i18n/config";

/** Public projection of a published document (see toPublicDocument in lib/data/documents.ts): no uploader / hash. */
export type PublicDocument = Pick<
  DocumentMeta,
  "id" | "scope" | "type" | "lang" | "title" | "date" | "fileName" | "size"
>;
export interface FundDoc {
  meta: PublicDocument;
  url: string;
}

/** Fund registry entry as the client receives it: `sources` reduced to the basis (no internal source names/keys). */
export type PublicFundSpec = Omit<FundSpec, "sources"> & { sources: Pick<FundSpec["sources"], "basis"> };

/** Published fund data as the client receives it: without the internal provenance label. */
export type PublicFundData = Omit<FundData, "sourceName">;

export function toPublicSpec(spec: FundSpec): PublicFundSpec {
  return { ...spec, sources: { basis: spec.sources.basis } };
}

export function toPublicData(data: FundData | null): PublicFundData | null {
  if (!data) return null;
  const { sourceName: _s, ...rest } = data;
  void _s;
  return rest;
}

/** Admin content as the public page receives it: without the internal snapshot pin. */
type PublicFundContent = Omit<FundContent, "pinnedSnapshot">;

export interface FundLink {
  key: FundKey;
  name: L;
  short: L;
  assetClass: L;
  tagline: L;
  color: { solid: string; from: string; to: string };
}

export interface FundPageProps {
  spec: PublicFundSpec;
  content: PublicFundContent;
  data: PublicFundData | null;
  sample: boolean;
  /** published documents of this fund and firm-wide ones */
  docs: FundDoc[];
  /** every visible fund, for the switcher */
  funds: FundLink[];
  /** admin override of the firm disclaimer (settings); null → boilerplate of src/content/disclaimers.ts */
  firmDisclaimer?: L | null;
  /** official third-party brand images available (Morningstar logo / stars, provider logos); absent → text */
  brand?: BrandAssets;
}
