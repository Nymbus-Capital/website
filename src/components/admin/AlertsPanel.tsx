"use client";
/**
 * Dashboard panel of the alert channel (PIPELINE_ALERT_WEBHOOK): configured or not, format, last delivery result, open
 * alerts (posted and not resolved), and a "send a test alert" button. Shown first when alerts are off or failing.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AlertChannelStatus } from "@/lib/pipeline/alerts";
import { api, useToast } from "./client";
import { Pill } from "./Head";
import { when } from "./format";

export interface FreshnessView {
  verdict: "ok" | "stale";
  reasons: string[];
  retryAt: string | null;
}

export function AlertsPanel({
  status,
  freshness,
}: {
  status: AlertChannelStatus | null;
  freshness?: FreshnessView | null;
}) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const test = async () => {
    setBusy(true);
    try {
      const r = await api<{ result: "sent" | "failed" | "off" }>("/api/admin/alerts/test", {
        method: "POST",
        json: {},
      });
      toast(
        r.result === "sent" ? "ok" : "err",
        r.result === "sent"
          ? "Test alert delivered: check the channel."
          : r.result === "off"
            ? "No webhook configured."
            : "Delivery failed (see the last delivery below).",
      );
      router.refresh();
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (!status)
    return (
      <section className="adm-panel">
        <div className="adm-alert err">The alert channel status is unavailable.</div>
      </section>
    );
  const d = status.lastDelivery;
  const failing = !!d && !d.ok;
  return (
    <section className="adm-panel" aria-labelledby="alerts-title" data-testid="alerts-panel">
      <h2 id="alerts-title" className="adm-h2">
        alerts{" "}
        <Pill tone={!status.configured ? "err" : failing ? "warn" : "ok"}>
          {!status.configured ? "off" : failing ? "last delivery failed" : "on"}
        </Pill>
        <span className="sp adm-small">
          {status.configured
            ? `${status.format === "teams" ? "Microsoft Teams" : "generic JSON"} (${status.formatSource === "env" ? "PIPELINE_ALERT_FORMAT" : "detected"}) · ${status.host ?? "?"}`
            : "PIPELINE_ALERT_WEBHOOK not set"}
        </span>
      </h2>
      {!status.configured ? (
        <div className="adm-alert err" data-testid="alerts-off">
          Alerts are off: blocked, failed or stale data is only visible here. Set <code>PIPELINE_ALERT_WEBHOOK</code> (a
          Teams channel webhook, see docs/deploy.md) in the Northflank secret group and restart the service.
        </div>
      ) : (
        <div className={`adm-alert${failing ? " warn" : d ? " ok" : ""}`} data-testid="alerts-last">
          {d
            ? `Last delivery ${when(d.at)}: ${d.ok ? "delivered" : `FAILED (${d.error ?? `HTTP ${d.status ?? "?"}`}) after ${d.attempts} attempt${d.attempts === 1 ? "" : "s"}`} — “${d.title}”.${!d.ok && status.lastSuccessAt ? ` Last success ${when(status.lastSuccessAt)}.` : ""}`
            : "Nothing sent yet. Use the button to check the channel."}
        </div>
      )}
      {freshness ? (
        <div
          className={`adm-alert${freshness.verdict === "stale" ? " warn" : " ok"}`}
          data-testid="alerts-freshness"
          style={{ marginTop: 8 }}
        >
          public data: {freshness.verdict}
          {freshness.reasons.length ? ` — ${freshness.reasons.join("; ")}` : " (what /api/status reports)"}
          {freshness.retryAt ? ` · a source was unavailable: retry run at ${when(freshness.retryAt)}` : ""}
        </div>
      ) : null}
      {status.open.length ? (
        <ul
          style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "grid", gap: 6 }}
          data-testid="alerts-open"
        >
          {status.open.map((o) => (
            <li key={o.key} className="adm-small">
              open: {o.title} — since {when(o.since)}, last posted {when(o.lastSentAt)}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="adm-actions">
        <button
          type="button"
          className="adm-btn ghost"
          onClick={test}
          disabled={busy || !status.configured}
          data-testid="alerts-test"
        >
          {busy ? "sending…" : "send a test alert"}
        </button>
      </div>
    </section>
  );
}
