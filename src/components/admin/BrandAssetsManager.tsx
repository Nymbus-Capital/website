"use client";
/**
 * Settings panel: official third-party brand images (Morningstar logo and star-rating images, provider logos). Only the
 * owners' official files belong here (as delivered, or a PNG export): the public pages show text when a slot is empty.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, useConfirm, useToast } from "./client";

export interface BrandRow {
  slot: string;
  label: string;
  source: "uploaded" | "shipped" | "missing";
  url?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export function BrandAssetsManager({ rows }: { rows: BrandRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const router = useRouter();
  const upload = async (slot: string, file: File | undefined) => {
    if (!file) return;
    setBusy(slot);
    try {
      const fd = new FormData();
      fd.set("slot", slot);
      fd.set("file", file);
      await api("/api/admin/upload/brand", { form: fd });
      toast("ok", `Uploaded ${slot}.`);
      router.refresh();
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  const remove = async (slot: string) => {
    if (
      !(await confirm({
        title: `Remove the uploaded ${slot}?`,
        body: "The page falls back to the shipped file, else to text.",
        action: "remove",
        danger: true,
      }))
    )
      return;
    setBusy(slot);
    try {
      await api(`/api/admin/brand/${slot}`, { method: "DELETE" });
      toast("ok", `Removed ${slot}.`);
      router.refresh();
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <section className="adm-panel" aria-labelledby="brand-title" data-testid="brand-assets">
      {dialog}
      <h2 id="brand-title" className="adm-h2">
        third-party brand assets
      </h2>
      <div className="adm-alert warn">
        Official files only (Morningstar, RBC Investor Services, eVestment, LSEG Lipper, GMR, Fundata), used with the
        owner’s permission and as delivered — never a redrawn or look-alike image. PNG, WebP or a plain SVG (no scripts
        or external references), 512 KB max. Files can also be shipped with the build in{" "}
        <code>public/brand/third-party/&lt;slot&gt;.svg</code> (or .png); an upload here wins.
      </div>
      <div className="adm-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <th>slot</th>
              <th>status</th>
              <th>preview</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slot} data-slot={r.slot} data-testid={`brand-${r.slot}`}>
                <td>
                  <b>{r.label}</b>
                  <br />
                  <span className="mono adm-small">{r.slot}</span>
                </td>
                <td>
                  {r.source === "missing" ? (
                    <span className="adm-pill warn">missing — text shown</span>
                  ) : (
                    <span className="adm-pill ok">{r.source}</span>
                  )}
                  {r.uploadedBy ? (
                    <div className="adm-small">
                      {r.uploadedBy} · {r.uploadedAt?.slice(0, 10)}
                    </div>
                  ) : null}
                </td>
                <td>
                  {r.url ? <img src={r.url} alt={r.label} style={{ height: 24, width: "auto", maxWidth: 160 }} /> : "—"}
                </td>
                <td className="num">
                  <label className="adm-btn ghost" aria-disabled={busy === r.slot}>
                    upload
                    <input
                      type="file"
                      accept="image/png,image/webp,image/svg+xml"
                      className="sr-only"
                      aria-label={`upload ${r.slot}`}
                      disabled={busy === r.slot}
                      onChange={(e) => {
                        void upload(r.slot, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {r.source === "uploaded" ? (
                    <button
                      type="button"
                      className="adm-btn ghost"
                      onClick={() => void remove(r.slot)}
                      disabled={busy === r.slot}
                    >
                      remove
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
