"use client";
/**
 * Admin list of the website inquiries ("messages", contact form): newest first, filter open / handled, mark handled,
 * delete, CSV export.
 * Every text is rendered as plain text by React (escaped); the e-mail link is built from an address validated on receipt.
 */
import { useMemo, useState } from "react";
import { Check, Download, Mail, RotateCcw, Trash2 } from "lucide-react";
import type { InquiryRecord } from "@/lib/contact/store";
import { api, useConfirm, useToast } from "./client";
import { Pill } from "./Head";
import { when } from "./format";

type Filter = "open" | "handled" | "all";

export function InquiriesManager({ initial }: { initial: InquiryRecord[] }) {
  const [items, setItems] = useState<InquiryRecord[]>(initial);
  const [filter, setFilter] = useState<Filter>("open");
  const [busy, setBusy] = useState<string | null>(null);
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const open = items.filter((i) => !i.handled).length;
  const shown = useMemo(
    () => items.filter((i) => filter === "all" || (filter === "open") === !i.handled),
    [items, filter],
  );

  const setHandled = async (r: InquiryRecord, handled: boolean) => {
    setBusy(r.id);
    try {
      const res = await api<{ inquiry: InquiryRecord }>(`/api/admin/inquiries/${r.id}`, {
        method: "PATCH",
        json: { handled },
      });
      setItems((all) => all.map((x) => (x.id === r.id ? res.inquiry : x)));
      toast("ok", handled ? "Marked as handled." : "Marked as open.");
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (r: InquiryRecord) => {
    const yes = await confirm({
      title: "delete this message?",
      body: `The message from ${r.name} (${when(r.receivedAt)}) will be deleted. This cannot be undone.`,
      action: "delete",
      danger: true,
    });
    if (!yes) return;
    setBusy(r.id);
    try {
      await api(`/api/admin/inquiries/${r.id}`, { method: "DELETE" });
      setItems((all) => all.filter((x) => x.id !== r.id));
      toast("ok", "Deleted.");
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <section className="adm-panel" aria-labelledby="inq-title" data-testid="inquiries">
        <h2 id="inq-title" className="adm-h2">
          inbox <Pill tone={open ? "info" : "mute"}>{open} open</Pill>
          <span className="sp adm-small">
            {shown.length} of {items.length}
          </span>
        </h2>
        <div className="adm-actions" style={{ marginBottom: 14 }}>
          <select
            style={{ maxWidth: 180 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            aria-label="filter by status"
          >
            <option value="open">open</option>
            <option value="handled">handled</option>
            <option value="all">all</option>
          </select>
          <span className="sp" />
          {items.length ? (
            <a className="adm-btn ghost xs" href="/api/admin/inquiries/export" download data-testid="inquiries-export">
              <Download aria-hidden="true" /> export CSV
            </a>
          ) : null}
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          {shown.map((r) => (
            <article
              key={r.id}
              className="adm-panel"
              data-inquiry-id={r.id}
              aria-labelledby={`inq-${r.id}`}
              style={{ background: "var(--surf)" }}
            >
              <h3 id={`inq-${r.id}`} className="adm-h2" style={{ flexWrap: "wrap" }}>
                <span style={{ textTransform: "none" }}>{r.name}</span>
                {r.handled ? <Pill tone="ok">handled</Pill> : <Pill tone="info">open</Pill>}
                <span className="sp adm-small tabnum">{when(r.receivedAt)}</span>
              </h3>
              <dl className="adm-dl">
                <dt>email</dt>
                <dd>
                  <a className="adm-link" href={`mailto:${r.email}`}>
                    {r.email}
                  </a>
                </dd>
                {r.phone ? (
                  <>
                    <dt>phone</dt>
                    <dd>{r.phone}</dd>
                  </>
                ) : null}
                {r.company ? (
                  <>
                    <dt>organisation</dt>
                    <dd>{r.company}</dd>
                  </>
                ) : null}
                <dt>profile</dt>
                <dd>{r.profile}</dd>
                <dt>interests</dt>
                <dd>{r.interests.join(", ")}</dd>
                <dt>language</dt>
                <dd>{r.lang === "fr" ? "français" : "english"}</dd>
                <dt>consent</dt>
                <dd className="adm-muted">
                  given {when(r.consent.at)} (text of {r.consent.version})
                </dd>
                {r.handled ? (
                  <>
                    <dt>handled</dt>
                    <dd className="adm-muted">
                      {when(r.handled.at)} by {r.handled.by}
                    </dd>
                  </>
                ) : null}
              </dl>
              {r.message ? (
                <p
                  data-testid="inquiry-message"
                  style={{ margin: "14px 0 0", whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.55 }}
                >
                  {r.message}
                </p>
              ) : (
                <p className="adm-muted adm-small" style={{ margin: "14px 0 0" }}>
                  No message.
                </p>
              )}
              <div className="adm-actions" style={{ marginTop: 14 }}>
                <a className="adm-btn ghost xs" href={`mailto:${r.email}`}>
                  <Mail aria-hidden="true" /> reply
                </a>
                <span className="sp" />
                {r.handled ? (
                  <button
                    type="button"
                    className="adm-btn ghost xs"
                    disabled={busy === r.id}
                    onClick={() => setHandled(r, false)}
                    data-testid="inquiry-reopen"
                  >
                    <RotateCcw aria-hidden="true" /> mark open
                  </button>
                ) : (
                  <button
                    type="button"
                    className="adm-btn xs"
                    disabled={busy === r.id}
                    onClick={() => setHandled(r, true)}
                    data-testid="inquiry-handled"
                  >
                    <Check aria-hidden="true" /> mark handled
                  </button>
                )}
                <button
                  type="button"
                  className="adm-btn ghost xs"
                  disabled={busy === r.id}
                  onClick={() => remove(r)}
                  aria-label={`delete the message from ${r.name}`}
                  data-testid="inquiry-delete"
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
        {!shown.length ? (
          <div className="adm-empty">{items.length ? "No message matches the filter." : "No message yet."}</div>
        ) : null}
      </section>
      {dialog}
    </>
  );
}
