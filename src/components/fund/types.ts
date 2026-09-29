/**
 * Props that cross the server → client boundary: plain JSON, no functions.
 */
import type { FundSpec } from "@/config/funds";
import type { DocumentMeta, FundContent, FundData, FundKey, L10n } from "@/lib/data/types";

export interface FundDoc { meta: DocumentMeta; url: string }

export interface FundLink { key: FundKey; name: L10n; short: L10n; color: { solid: string; from: string; to: string } }

export interface FundPageProps {
  spec: FundSpec;
  content: FundContent;
  data: FundData | null;
  sample: boolean;
  /** published documents of this fund and firm-wide ones */
  docs: FundDoc[];
  /** every visible fund, for the switcher */
  funds: FundLink[];
}
