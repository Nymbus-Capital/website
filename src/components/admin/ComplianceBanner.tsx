"use client";
/**
 * "Compliance review required" banner: lists every disclaimer text (src/content/disclaimers.ts + admin overrides)
 * with where it appears and what to verify, until an admin records the review (confirm dialog, audited).
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api, useConfirm, useToast } from "./client";

export interface BannerText {
  id: string;
  label: string;
  en: string;
  fr: string;
  where: { label: string; href: string }[];
  review: string[];
}

export function ComplianceBanner({
  status,
  hash,
  version,
  texts,
  approvedAt,
  approvedBy,
}: {
  status: "never" | "changed" | "approved";
  hash: string;
  version: number;
  texts: BannerText[];
  approvedAt?: string;
  approvedBy?: string;
}) {
  const [open, setOpen] = useState(status !== "approved");
  const [busy, setBusy] = useState(false);
  const { confirm, dialog } = useConfirm();
  const toast = useToast();
  const router = useRouter();

  if (status === "approved") {
    return (
      <section className="adm-panel" data-testid="compliance-ok">
        <h2 className="adm-h2" style={{ margin: 0 }}>
          <span className="adm-pill ok">disclaimers reviewed</span>
          <span className="adm-small">
            by {approvedBy} · {approvedAt?.slice(0, 16).replace("T", " ")} UTC
          </span>
        </h2>
      </section>
    );
  }

  const mark = async () => {
    const yes = await confirm({
      title: "mark disclaimers as reviewed?",
      body: `Confirm that compliance reviewed and approved the ${texts.length} texts listed (EN and FR), as they appear on the public site now. Any later change brings this banner back.`,
      action: "mark as reviewed",
    });
    if (!yes) return;
    setBusy(true);
    try {
      await api("/api/admin/compliance", { json: { version, textsHash: hash, confirm: true } });
      toast("ok", "Recorded: disclaimers reviewed by compliance.");
      router.refresh();
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="adm-panel adm-compliance"
      role="alert"
      aria-labelledby="compliance-title"
      data-testid="compliance-banner"
    >
      <h2 id="compliance-title" className="adm-h2">
        <span className="adm-pill warn">compliance review required</span>
        {status === "changed"
          ? "disclaimer texts changed since the last review"
          : "disclaimer texts have not been reviewed by compliance"}
        <span className="sp adm-actions">
          <button type="button" className="adm-btn ghost xs" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? "hide texts" : `show ${texts.length} texts`}
          </button>
          <button type="button" className="adm-btn" onClick={mark} disabled={busy} data-testid="mark-reviewed">
            <ShieldCheck /> mark disclaimers as reviewed by compliance
          </button>
        </span>
      </h2>
      <p className="adm-small" style={{ margin: "0 0 12px" }}>
        The public site shows draft boilerplate (src/content/disclaimers.ts) and any overrides from site settings / fund
        performance notes. Checklist: docs/compliance-review.md.
        {status === "changed" && approvedBy ? ` Last reviewed by ${approvedBy} on ${approvedAt?.slice(0, 10)}.` : ""}
      </p>
      {open ? (
        <ol className="adm-comp-list">
          {texts.map((t) => (
            <li key={t.id} data-testid={`compliance-text-${t.id}`}>
              <div className="adm-comp-head">
                <strong>{t.label}</strong>
                <span className="adm-small">
                  {t.where.map((w, i) => (
                    <span key={i}>
                      {i ? " · " : ""}
                      <a className="adm-link" href={w.href} target="_blank" rel="noopener">
                        {w.label} ↗
                      </a>
                    </span>
                  ))}
                </span>
              </div>
              <div className="adm-l10n">
                <p lang="en">{t.en}</p>
                <p lang="fr">{t.fr}</p>
              </div>
              {t.review.length ? (
                <ul className="adm-comp-review">
                  {t.review.map((r, i) => (
                    <li key={i}>verify: {r}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
      {dialog}
    </section>
  );
}
