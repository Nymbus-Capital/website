/**
 * Public projection of the fund registry for client components (navigation, footer, contact form): identity,
 * tagline, colours, asset class, vehicle and benchmark only. Client components import this module, never
 * `@/config/funds` directly (tests/unit/site/client-imports.test.ts); internal source names / keys live in
 * src/lib/pipeline/fund-sources.ts and are never part of either module.
 */
import { FUNDS } from "./funds.ts";
import type { FundKey, L10n } from "../lib/data/types.ts";

export interface PublicFund {
  key: FundKey;
  name: L10n;
  short: L10n;
  tagline: L10n;
  color: { solid: string; from: string; to: string };
  assetClass: L10n;
  vehicle: "fund" | "strategy";
  benchmark: L10n | null;
}

export const PUBLIC_FUNDS: readonly PublicFund[] = FUNDS.map((f) => ({
  key: f.key,
  name: f.name,
  short: f.short,
  tagline: f.defaults.tagline,
  color: f.color,
  assetClass: f.assetClass,
  vehicle: f.vehicle,
  benchmark: f.benchmark,
}));

/** Funds not hidden in the admin (hidden keys come from the server layout). */
export const visibleFunds = <T extends { key: string }>(funds: readonly T[], hidden: readonly string[] | null | undefined): T[] =>
  funds.filter((f) => !(hidden ?? []).includes(f.key));

/** Keys of the funds the admin hid (content.funds[key].hidden), computed on the server for the site chrome and forms. */
export const hiddenFundKeys = (content: { funds?: Partial<Record<string, { hidden?: boolean } | undefined>> } | null | undefined): string[] =>
  Object.entries(content?.funds ?? {}).filter(([, f]) => f?.hidden).map(([k]) => k);
