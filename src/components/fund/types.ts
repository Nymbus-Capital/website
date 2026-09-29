/**
 * Props that cross the server → client boundary: plain JSON, no functions.
 */
import type { FundSpec } from "@/config/funds";
import type { DocumentMeta, FundContent, FundData, FundKey, L10n } from "@/lib/data/types";

/** Public projection of a published document (see toPublicDocument in lib/data/documents.ts): no uploader / hash. */
export type PublicDocument = Pick<DocumentMeta, "id" | "scope" | "type" | "lang" | "title" | "date" | "fileName" | "size">;
export interface FundDoc { meta: PublicDocument; url: string }

/** Admin content as the public page receives it: without the internal snapshot pin. */
export type PublicFundContent = Omit<FundContent, "pinnedSnapshot">;

export interface FundLink { key: FundKey; name: L10n; short: L10n; color: { solid: string; from: string; to: string } }

export interface FundPageProps {
  spec: FundSpec;
  content: PublicFundContent;
  data: FundData | null;
  sample: boolean;
  /** published documents of this fund and firm-wide ones */
  docs: FundDoc[];
  /** every visible fund, for the switcher */
  funds: FundLink[];
}
