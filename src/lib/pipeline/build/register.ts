// register.ts — the fund register (/api/apex/funds) entry of a fund and its NAV data start
import type { FundSpec } from "../../../config/funds.ts";
import { FUND_SOURCES } from "../fund-sources.ts";
import { PIPELINE_FUNDS } from "../config.ts";
import type { FundRef, RawPayloads, RegisteredFund } from "../raw.ts";

/** The fund's live entry in the fund register (by Apex account, else by configured key). */
export function registerFund(raw: RawPayloads, spec: FundSpec): RegisteredFund | null {
  if (!raw.apexFunds.ok || !raw.apexFunds.data) return null;
  const short = FUND_SOURCES[spec.key].dataplatform;
  const refs: FundRef[] = raw.unitholderFunds.ok && raw.unitholderFunds.data ? raw.unitholderFunds.data : [];
  const acct = refs.find((r) => r.short_name === short)?.apex_account;
  const live = raw.apexFunds.data.filter((f) => f.status !== "wound_down");
  return (acct ? live.find((f) => f.apex_account === acct) : undefined) ?? live.find((f) => f.key === PIPELINE_FUNDS[spec.key].apexKey) ?? null;
}

/**
 * Data start of the fund's own NAV history: the configured `navStart` (the register's fund_data_start, which
 * /api/apex/funds does not serve), never before the register's `inception` (the day a reused CIBC code became this
 * fund) when the register gives one. A disagreement between the two is reported (`note`).
 */
export function effectiveNavStart(raw: RawPayloads, spec: FundSpec): { start: string | null; note: string | null } {
  const cfg = FUND_SOURCES[spec.key].navStart;
  if (!cfg) return { start: null, note: null };
  const inc = registerFund(raw, spec)?.inception;
  const inception = typeof inc === "string" && /^\d{4}-\d{2}-\d{2}/.test(inc) ? inc.slice(0, 10) : null;
  if (!inception || inception === cfg) return { start: cfg, note: null };
  return { start: inception > cfg ? inception : cfg, note: `register inception ${inception} differs from the configured data start ${cfg}: the later one is used` };
}
