"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";
import { HIDE_BLOCKS, type ClassType, type FundContent, type FundKey, type FundRankings } from "@/lib/data/types";
import { api, ApiError, L10nInput, useToast } from "./client";
import { RankingsEditor } from "./RankingsEditor";
import type { L } from "@/lib/i18n/config";

const BLOCKS = HIDE_BLOCKS;
const RISKS = ["low", "low-medium", "medium", "medium-high", "high"] as const;
const E: L = { en: "", fr: "" };

type Form = {
  hidden: boolean;
  hide: Partial<Record<(typeof BLOCKS)[number], boolean>>;
  tagline: L;
  description: L;
  objective: L;
  riskRating: string;
  managementFee: string;
  performanceFee: string;
  mer: string;
  minInvestment: string;
  distributions: L;
  headlineClass: string;
  classTypes: Record<string, string>;
  minSubsequent: string;
  rspEligible: string;
  liquidity: L;
  cifscCategory: L;
  rankings: FundRankings;
  performanceNote: L;
  managers: string;
  pinnedSnapshot: string;
};

const toForm = (c: FundContent): Form => ({
  hidden: !!c.hidden,
  hide: { ...(c.hide ?? {}) },
  tagline: c.tagline ?? E,
  description: c.description ?? E,
  objective: c.objective ?? E,
  riskRating: c.riskRating ?? "",
  managementFee: c.managementFee ?? "",
  performanceFee: c.performanceFee ?? "",
  mer: c.mer ?? "",
  minInvestment: c.minInvestment ?? "",
  distributions: c.distributions ?? E,
  headlineClass: c.headlineClass ?? "",
  classTypes: { ...(c.classTypes ?? {}) },
  minSubsequent: c.minSubsequent ?? "",
  rspEligible: c.rspEligible ?? "",
  liquidity: c.liquidity ?? E,
  cifscCategory: c.cifscCategory ?? E,
  rankings: structuredClone(c.rankings ?? {}),
  performanceNote: c.performanceNote ?? E,
  managers: (c.managers ?? []).join("\n"),
  pinnedSnapshot: c.pinnedSnapshot ?? "",
});

function toContent(f: Form): FundContent {
  const out: FundContent = {
    hidden: f.hidden,
    hide: f.hide,
    tagline: f.tagline,
    description: f.description,
    objective: f.objective,
    distributions: f.distributions,
    performanceNote: f.performanceNote,
  };
  if (f.riskRating) out.riskRating = f.riskRating as FundContent["riskRating"];
  out.managementFee = f.managementFee;
  out.performanceFee = f.performanceFee;
  out.mer = f.mer;
  out.minInvestment = f.minInvestment;
  out.headlineClass = f.headlineClass;
  out.classTypes = Object.fromEntries(Object.entries(f.classTypes).filter(([, t]) => t)) as Record<string, ClassType>;
  out.minSubsequent = f.minSubsequent;
  if (f.rspEligible) out.rspEligible = f.rspEligible as FundContent["rspEligible"];
  out.liquidity = f.liquidity;
  out.cifscCategory = f.cifscCategory;
  out.rankings = f.rankings;
  out.managers = f.managers
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  out.pinnedSnapshot = f.pinnedSnapshot || null;
  return out;
}

export function FundEditor({
  fundKey,
  version: initialVersion,
  initial,
  defaults,
  classes,
  runs,
  classTypeRows,
  rankingsCtx,
}: {
  fundKey: FundKey;
  version: number;
  initial: FundContent;
  defaults: { tagline: L; description: L; riskRating: string; headlineClass: string | null };
  classes: { fundserv: string; label: string }[];
  runs: { id: string; label: string }[];
  /** share classes of the registry and of the published data, with the type the registry gives them */
  classTypeRows: { fundserv: string; label: string; defaultType: ClassType }[];
  /** staleness limit and missing official Morningstar files, for the rankings editor's warnings */
  rankingsCtx?: { months: number; morningstarMissing: string[] };
}) {
  const [form, setForm] = useState<Form>(() => toForm(initial));
  const [version, setVersion] = useState(initialVersion);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await api<{ content: { version: number } }>(`/api/admin/content/funds/${fundKey}`, {
        method: "PUT",
        json: { version, fund: toContent(form) },
      });
      setVersion(r.content.version);
      setDirty(false);
      toast("ok", `Saved (content v${r.content.version}).`);
      router.refresh();
    } catch (err) {
      const msg = (err as Error).message;
      setError(
        err instanceof ApiError && err.status === 409
          ? `${msg} Your edits are still in the form: copy them, reload, and re-apply.`
          : msg,
      );
    } finally {
      setSaving(false);
    }
  };

  const classOptions =
    classes.some((c) => c.fundserv === form.headlineClass) || !form.headlineClass
      ? classes
      : [{ fundserv: form.headlineClass, label: `${form.headlineClass} (not in the published data)` }, ...classes];

  return (
    <form className="adm-panel adm-form" onSubmit={save} data-testid="fund-editor" aria-label={`edit ${fundKey}`}>
      <h2 className="adm-h2">
        content
        <span className="sp adm-actions">
          <span className="adm-small">
            v{version}
            {dirty ? " · unsaved changes" : ""}
          </span>
          <button type="submit" className="adm-btn" disabled={saving} data-testid="save-fund">
            <Save /> {saving ? "saving…" : "save"}
          </button>
        </span>
      </h2>
      {error ? (
        <div className="adm-alert err" role="alert">
          {error}
        </div>
      ) : null}

      <div className="adm-actions">
        <label className="adm-check">
          <input
            type="checkbox"
            name="hidden"
            checked={form.hidden}
            onChange={(e) => set("hidden", e.target.checked)}
          />{" "}
          hide this fund on the public site
        </label>
      </div>

      <fieldset className="adm-fieldset">
        <legend>hide blocks on the fund page</legend>
        <div className="adm-chips">
          {BLOCKS.map((b) => (
            <label key={b} className="adm-chip">
              <input
                type="checkbox"
                checked={b === "aum" ? form.hide.aum !== false : !!form.hide[b]}
                onChange={(e) => set("hide", { ...form.hide, [b]: e.target.checked })}
              />
              {b}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="adm-fieldset">
        <legend>texts</legend>
        <L10nInput
          label="tagline"
          hint={`default: ${defaults.tagline.en}`}
          value={form.tagline}
          onChange={(v) => set("tagline", v)}
          max={200}
          name="tagline"
        />
        <L10nInput
          label="description"
          hint="empty = registry default"
          value={form.description}
          onChange={(v) => set("description", v)}
          multiline
          max={2000}
        />
        <L10nInput
          label="objective"
          value={form.objective}
          onChange={(v) => set("objective", v)}
          multiline
          max={2000}
        />
        <L10nInput
          label="distributions"
          value={form.distributions}
          onChange={(v) => set("distributions", v)}
          max={300}
        />
        <L10nInput
          label="performance footnote"
          hint="replaces the pre-launch boilerplate, if any (needs compliance review)"
          value={form.performanceNote}
          onChange={(v) => set("performanceNote", v)}
          multiline
          max={1500}
        />
      </fieldset>

      <fieldset className="adm-fieldset">
        <legend>terms</legend>
        <div className="row">
          <label className="adm-field">
            <span>
              risk rating <em>default {defaults.riskRating}</em>
            </span>
            <select value={form.riskRating} onChange={(e) => set("riskRating", e.target.value)}>
              <option value="">default</option>
              {RISKS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span>management fee</span>
            <input
              className="adm-input"
              name="managementFee"
              value={form.managementFee}
              maxLength={60}
              placeholder="0.65%"
              onChange={(e) => set("managementFee", e.target.value)}
            />
          </label>
          <label className="adm-field">
            <span>performance fee</span>
            <input
              className="adm-input"
              value={form.performanceFee}
              maxLength={120}
              placeholder="none"
              onChange={(e) => set("performanceFee", e.target.value)}
            />
          </label>
          <label className="adm-field">
            <span>mer</span>
            <input
              className="adm-input"
              value={form.mer}
              maxLength={60}
              placeholder="0.78%"
              onChange={(e) => set("mer", e.target.value)}
            />
          </label>
          <label className="adm-field">
            <span>minimum investment</span>
            <input
              className="adm-input"
              value={form.minInvestment}
              maxLength={80}
              placeholder="500 $"
              onChange={(e) => set("minInvestment", e.target.value)}
            />
          </label>
          <label className="adm-field">
            <span>
              headline class <em>default {defaults.headlineClass ?? "none"}</em>
            </span>
            <select value={form.headlineClass} onChange={(e) => set("headlineClass", e.target.value)}>
              <option value="">default</option>
              {classOptions.map((c) => (
                <option key={c.fundserv} value={c.fundserv}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="row">
          <label className="adm-field">
            <span>minimum subsequent investment</span>
            <input
              className="adm-input"
              value={form.minSubsequent}
              maxLength={80}
              placeholder="100 $"
              onChange={(e) => set("minSubsequent", e.target.value)}
            />
          </label>
          <label className="adm-field">
            <span>RSP / registered plans eligible</span>
            <select value={form.rspEligible} onChange={(e) => set("rspEligible", e.target.value)}>
              <option value="">not shown</option>
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </label>
        </div>
        <L10nInput
          label="liquidity (redemptions)"
          hint="shown only when filled"
          value={form.liquidity}
          onChange={(v) => set("liquidity", v)}
          max={200}
        />
        <L10nInput
          label="CIFSC category"
          hint="shown only when filled; empty = the Fundata category of the ranking, if any"
          value={form.cifscCategory}
          onChange={(v) => set("cifscCategory", v)}
          max={120}
        />
        <label className="adm-field">
          <span>
            managers <em>one per line</em>
          </span>
          <textarea value={form.managers} rows={3} onChange={(e) => set("managers", e.target.value)} />
        </label>
      </fieldset>

      <fieldset className="adm-fieldset" data-testid="class-types">
        <legend>class types</legend>
        <p className="adm-small">
          A class is labelled “Prospectus class” or “Offering memorandum class” on the public page only when its type is
          known. “not set” shows no label.
        </p>
        <div className="row">
          {classTypeRows.map((c) => (
            <label key={c.fundserv} className="adm-field">
              <span>
                {c.label}{" "}
                <em>
                  registry:{" "}
                  {c.defaultType === "none" ? "not set" : c.defaultType === "om" ? "offering memorandum" : "prospectus"}
                </em>
              </span>
              <select
                value={form.classTypes[c.fundserv] ?? ""}
                onChange={(e) => set("classTypes", { ...form.classTypes, [c.fundserv]: e.target.value })}
              >
                <option value="">registry default</option>
                <option value="prospectus">prospectus class</option>
                <option value="om">offering memorandum class</option>
              </select>
            </label>
          ))}
        </div>
      </fieldset>

      <RankingsEditor
        value={form.rankings}
        onChange={(v) => set("rankings", v)}
        months={rankingsCtx?.months}
        morningstarMissing={rankingsCtx?.morningstarMissing}
      />

      <fieldset className="adm-fieldset">
        <legend>data snapshot</legend>
        <label className="adm-field">
          <span>
            pin this fund to a run <em>freeze the public numbers on an older snapshot</em>
          </span>
          <select
            value={form.pinnedSnapshot}
            onChange={(e) => set("pinnedSnapshot", e.target.value)}
            data-testid="pin-select"
          >
            <option value="">not pinned: follow the latest published data</option>
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        {form.pinnedSnapshot ? (
          <div className="adm-alert warn">
            Pinned: new pipeline runs will not change this fund’s numbers until you unpin it.
          </div>
        ) : null}
      </fieldset>
    </form>
  );
}
