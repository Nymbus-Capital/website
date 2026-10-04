"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";
import type { L10n, SiteContent } from "@/lib/data/types";
import { api, L10nInput, useToast } from "./client";

const E: L10n = { en: "", fr: "" };

export function SettingsForm({ version: v0, firm, publishMode: pm0, maxAgeMonths: m0 = 6 }: { version: number; firm: SiteContent["firm"]; publishMode: "auto" | "review"; maxAgeMonths?: number }) {
  const [version, setVersion] = useState(v0);
  const [aumLabel, setAum] = useState<L10n>(firm.aumLabel ?? E);
  const [bannerOn, setBannerOn] = useState(!!firm.announcement);
  const [announcement, setAnn] = useState<L10n>(firm.announcement ?? E);
  const [disclaimer, setDisc] = useState<L10n>(firm.disclaimer ?? E);
  const [publishMode, setPm] = useState(pm0);
  const [maxAge, setMaxAge] = useState(String(m0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await api<{ content: { version: number } }>("/api/admin/content/settings", {
        method: "PUT",
        json: { version, firm: { aumLabel, announcement: bannerOn ? announcement : null, disclaimer }, publishMode, rankingPolicy: { maxAgeMonths: Math.min(24, Math.max(1, Math.trunc(Number(maxAge)) || 6)) } },
      });
      setVersion(r.content.version);
      toast("ok", `Saved (content v${r.content.version}).`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="adm-grid c2" onSubmit={save} data-testid="settings-form" style={{ alignItems: "start" }}>
      <section className="adm-panel adm-form">
        <h2 className="adm-h2">firm</h2>
        {error ? <div className="adm-alert err" role="alert">{error}</div> : null}
        <L10nInput label="firm aum label" hint="e.g. $1.9B / 1,9 G$" value={aumLabel} onChange={setAum} max={40} />
        <label className="adm-check">
          <input type="checkbox" checked={bannerOn} onChange={(e) => setBannerOn(e.target.checked)} /> show an announcement banner
        </label>
        {bannerOn ? <L10nInput label="announcement" value={announcement} onChange={setAnn} multiline max={400} /> : null}
        <L10nInput label="firm disclaimer" hint="empty = boilerplate; replaces the firm text in every footer and fund disclosure (needs compliance review)" value={disclaimer} onChange={setDisc} multiline max={4000} />
      </section>
      <section className="adm-panel adm-form">
        <h2 className="adm-h2">publishing</h2>
        <fieldset className="adm-fieldset" style={{ borderTop: 0, paddingTop: 0 }}>
          <legend>when a pipeline run passes validation</legend>
          <label className="adm-check">
            <input type="radio" name="publishMode" value="auto" checked={publishMode === "auto"} onChange={() => setPm("auto")} />
            <span><b>auto</b> — publish it immediately</span>
          </label>
          <label className="adm-check">
            <input type="radio" name="publishMode" value="review" checked={publishMode === "review"} onChange={() => setPm("review")} />
            <span><b>review</b> — wait for approval in the dashboard</span>
          </label>
        </fieldset>
        <p className="adm-small">Runs that fail a blocking check never publish the fund concerned: it keeps its previous data either way.</p>
        <label className="adm-field">
          <span>hide third-party rankings older than (months)</span>
          <input className="adm-input" type="number" min={1} max={24} step={1} value={maxAge} onChange={(e) => setMaxAge(e.target.value)} data-testid="rankings-max-age" />
          <span className="adm-small">Morningstar, Fundata, RBC pooled fund survey, eVestment, LSEG Lipper and GMR entries are hidden once their as-of date is older than this (default 6). Re-confirming means entering the source’s new as-of date.</span>
        </label>
        <div className="adm-actions">
          <span className="adm-small">v{version}</span>
          <span className="sp" />
          <button type="submit" className="adm-btn" disabled={saving} data-testid="save-settings"><Save /> {saving ? "saving…" : "save settings"}</button>
        </div>
      </section>
    </form>
  );
}
