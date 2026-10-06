/**
 * Operations alert for a new inquiry, through the existing alerts webhook (PIPELINE_ALERT_WEBHOOK, Teams or JSON).
 * Only the sender's first name and profile go to the channel, with a link to the admin: never the full name, e-mail
 * address, phone, organisation, interests or message, which stay on the data volume and are read in the admin.
 * Nothing is sent when no webhook is configured (the admin dashboard shows the open count).
 */
import { sendAlertNow, type AlertMessage, type AlertOpts } from "../pipeline/alerts.ts";
import type { InquiryRecord } from "./store.ts";

/** First word of the name (at most 40 characters). */
export const firstName = (name: string): string => (name.trim().split(/\s+/, 1)[0] ?? "").slice(0, 40);

export function inquiryAlert(r: Pick<InquiryRecord, "name" | "profile">): AlertMessage {
  return {
    title: `New website inquiry: ${firstName(r.name)} (${r.profile})`,
    lines: ["Open the admin (messages) to read and answer it."],
    severity: "info",
    adminPath: "/admin/inquiries",
  };
}

export function notifyInquiry(r: InquiryRecord, opts: AlertOpts = {}): Promise<"sent" | "failed" | "off"> {
  return sendAlertNow(inquiryAlert(r), opts);
}
