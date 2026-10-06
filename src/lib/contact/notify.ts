/**
 * Operations alert for a new inquiry, through the existing alerts webhook (PIPELINE_ALERT_WEBHOOK, Teams or JSON).
 * Only the sender's name and investor type go to the channel: never the e-mail address, phone, organisation or message,
 * which stay on the data volume and are read in the admin. Nothing is sent when no webhook is configured.
 */
import { sendAlertNow, type AlertMessage, type AlertOpts } from "../pipeline/alerts.ts";
import type { InquiryRecord } from "./store.ts";

export function inquiryAlert(r: Pick<InquiryRecord, "name" | "profile">): AlertMessage {
  return {
    title: `New website message from ${r.name} (${r.profile})`,
    lines: ["Open the admin (messages) to read and answer it."],
    severity: "info",
    adminPath: "/admin/inquiries",
  };
}

export function notifyInquiry(r: InquiryRecord, opts: AlertOpts = {}): Promise<"sent" | "failed" | "off"> {
  return sendAlertNow(inquiryAlert(r), opts);
}
