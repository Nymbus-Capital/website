/**
 * Webhook alert of rankings about to be hidden by the staleness limit (30 days ahead) and of rankings just hidden:
 * each entry and as-of date is posted once per phase (the dashboard keeps showing the issue meanwhile).
 */
import type { FundKey, SiteContent } from "../data/types.ts";
import { announceNew, type AlertOpts } from "../pipeline/alerts.ts";
import { policyMonths } from "./policy.ts";
import { rankingExpiries } from "./issues.ts";

export const EXPIRY_ALERT_KEY = "rankings.expiry";

export function alertRankingExpiries(
  content: Pick<SiteContent, "funds" | "rankingPolicy">,
  opts: AlertOpts & { classes?: Partial<Record<FundKey, { fundserv: string }[]>> } = {},
): Promise<"sent" | "none" | "failed" | "off"> {
  const now = opts.now ?? new Date();
  const months = policyMonths(content);
  const items = rankingExpiries(content, { now, months, classes: opts.classes }).map((x) => ({
    id: x.id,
    line: x.phase === "expiring"
      ? `• ${x.fund}: ${x.label} as of ${x.asOf} — hidden after ${x.lastShowDay} (${x.daysLeft} day${x.daysLeft === 1 ? "" : "s"} left)`
      : `• ${x.fund}: ${x.label} as of ${x.asOf} — now HIDDEN (older than ${months} months since ${x.lastShowDay})`,
  }));
  return announceNew({
    key: EXPIRY_ALERT_KEY,
    items,
    message: (fresh) => ({
      title: "Nymbus website: third-party rankings about to be hidden (or just hidden)",
      severity: "warn",
      adminPath: "/admin/funds",
      lines: [
        ...fresh.map((f) => f.line),
        `What to do: in /admin/funds → the fund → rankings, enter the newer edition (or re-confirm the entry with the source's newer as-of date). Entries older than ${months} months are hidden from the public pages (limit in /admin/settings).`,
      ],
    }),
  }, { ...opts, now });
}
