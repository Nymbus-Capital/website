/**
 * CSV export of the website inquiries (admin "messages"): one row per inquiry, RFC 4180 quoting, UTF-8 with a BOM so
 * Excel opens accents correctly. Cells that a spreadsheet would read as a formula (= + - @, tab, CR) are prefixed with
 * an apostrophe (CSV injection). Pure, unit tested.
 */
import type { InquiryRecord } from "./store.ts";

export const CSV_COLUMNS = [
  "id",
  "received_at",
  "status",
  "handled_at",
  "handled_by",
  "name",
  "email",
  "phone",
  "organisation",
  "investor_type",
  "interests",
  "language",
  "message",
  "consent_at",
  "consent_version",
] as const;

/** One CSV cell: neutralised when it starts like a formula, quoted when it holds a quote, comma or line break. */
export function csvCell(v: string | null | undefined): string {
  let s = v ?? "";
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function inquiriesCsv(rows: readonly InquiryRecord[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.receivedAt,
        r.handled ? "handled" : "open",
        r.handled?.at,
        r.handled?.by,
        r.name,
        r.email,
        r.phone,
        r.company,
        r.profile,
        r.interests.join("; "),
        r.lang,
        r.message,
        r.consent.at,
        r.consent.version,
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return `﻿${lines.join("\r\n")}\r\n`;
}
