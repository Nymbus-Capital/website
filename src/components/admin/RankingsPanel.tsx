"use client";
/** Dashboard panel of the third-party rankings: freshness issues, the RBC pooled fund survey check and a "check now" button. */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, useToast } from "./client";

interface RankingsPanelProps {
  issues: { level: "warn" | "info"; key: string; message: string }[];
  months: number;
  rbc: { checkedAt: string; ok: boolean; latest?: { label: string; asOf: string; url?: string } } | null;
  /** latest survey edition known (checked, else the one shipped with the release) */
  latest?: { label: string; asOf: string; url?: string };
}

export function RankingsPanel({ issues, months, rbc, latest }: RankingsPanelProps) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const check = async () => {
    setBusy(true);
    try {
      const r = await api<{ state: { ok: boolean; latest?: { label: string } } }>("/api/admin/rankings/check", {
        method: "POST",
        json: {},
      });
      toast(
        r.state.ok ? "ok" : "err",
        r.state.ok
          ? `Checked: latest RBC survey ${r.state.latest?.label ?? "not found"}.`
          : "Check failed: no source reachable (rankings unchanged).",
      );
      router.refresh();
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="adm-panel" aria-labelledby="rankings-title" data-testid="rankings-panel">
      <h2 id="rankings-title" className="adm-h2">
        third-party rankings{" "}
        <span className="sp adm-small">
          hidden after {months} months · RBC survey checked {rbc ? rbc.checkedAt.slice(0, 10) : "never"}
          {(rbc?.latest ?? latest) ? ` · latest ${(rbc?.latest ?? latest)!.label}` : ""}
        </span>
      </h2>
      {issues.length ? (
        <ul data-testid="rankings-issues" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
          {issues.map((i) => (
            <li key={i.key} className={`adm-alert${i.level === "warn" ? " warn" : ""}`} data-key={i.key}>
              {i.message}
            </li>
          ))}
        </ul>
      ) : (
        <div className="adm-empty">Every ranking entered is confirmed and current.</div>
      )}
      <div className="adm-actions">
        <button type="button" className="adm-btn ghost" onClick={check} disabled={busy} data-testid="rankings-check">
          {busy ? "checking…" : "check the RBC survey now"}
        </button>
      </div>
    </section>
  );
}
