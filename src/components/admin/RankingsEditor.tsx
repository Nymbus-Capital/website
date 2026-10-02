"use client";
/** Admin form of the third-party rankings (Fund Library category rank / quartile, Morningstar stars): manual data entry. */
import { RANKING_PERIODS, type FundLibraryRanking, type FundRankings, type RankingPeriod, type RankingRow } from "@/lib/data/types";
import { L10nInput } from "./client";

const EMPTY_RANKING: FundLibraryRanking = { classLabel: "", category: { en: "", fr: "" }, asOf: "", rows: [] };

export function RankingsEditor({ value, onChange }: { value: FundRankings; onChange: (v: FundRankings) => void }) {
  const lib = value.fundLibrary ?? [];
  const setLib = (next: FundLibraryRanking[]) => onChange({ ...value, fundLibrary: next });
  const setEntry = (i: number, patch: Partial<FundLibraryRanking>) => setLib(lib.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const setRow = (i: number, k: number, patch: Partial<RankingRow>) => setEntry(i, { rows: lib[i].rows.map((r, j) => (j === k ? { ...r, ...patch } : r)) });
  const ms = value.morningstar;
  const num = (s: string): number => (s === "" ? 0 : Math.max(0, Math.trunc(Number(s)) || 0));

  return (
    <fieldset className="adm-fieldset" data-testid="rankings-editor">
      <legend>awards and rankings</legend>
      <div className="adm-alert warn">
        Updated manually. These figures are third-party data copied from the source page (Fund Library, Morningstar): they are never refreshed by the
        pipeline. Update them, and their “as at” date, each time the source changes; remove an entry that is out of date. Only add a rating you have
        confirmed on the source page. Official brand logos are not used (add them only with the owner’s permission).
      </div>

      {lib.map((e, i) => (
        <div key={i} className="adm-field" role="group" aria-label={`Fund Library ranking ${i + 1}`}>
          <div className="row">
            <label className="adm-field"><span>class (as the source names it)</span><input className="adm-input" value={e.classLabel} maxLength={40} placeholder="Class F" onChange={(ev) => setEntry(i, { classLabel: ev.target.value })} /></label>
            <label className="adm-field"><span>FundServ</span><input className="adm-input" value={e.fundserv ?? ""} maxLength={12} placeholder="LDM201" onChange={(ev) => setEntry(i, { fundserv: ev.target.value })} /></label>
            <label className="adm-field"><span>as at (YYYY-MM-DD)</span><input className="adm-input" value={e.asOf} maxLength={10} placeholder="2026-08-31" onChange={(ev) => setEntry(i, { asOf: ev.target.value })} /></label>
            <label className="adm-field">
              <span>FundGrade</span>
              <select value={e.fundGrade ?? ""} onChange={(ev) => setEntry(i, { fundGrade: ev.target.value || undefined })}>
                <option value="">none</option>
                {["A", "B", "C", "D", "E"].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
          </div>
          <L10nInput label="category" value={e.category} onChange={(v) => setEntry(i, { category: v })} max={120} />
          <label className="adm-field"><span>source page (https)</span><input className="adm-input" value={e.url ?? ""} maxLength={300} onChange={(ev) => setEntry(i, { url: ev.target.value || undefined })} /></label>
          <table className="adm-table" aria-label="rank by period">
            <thead><tr><th>period</th><th>rank</th><th>of</th><th>quartile</th><th /></tr></thead>
            <tbody>
              {e.rows.map((r, k) => (
                <tr key={k}>
                  <td>
                    <select aria-label="period" value={r.period} onChange={(ev) => setRow(i, k, { period: ev.target.value as RankingPeriod })}>
                      {RANKING_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td><input className="adm-input" aria-label="rank" inputMode="numeric" value={r.rank || ""} onChange={(ev) => setRow(i, k, { rank: num(ev.target.value) })} /></td>
                  <td><input className="adm-input" aria-label="number of funds" inputMode="numeric" value={r.of || ""} onChange={(ev) => setRow(i, k, { of: num(ev.target.value) })} /></td>
                  <td>
                    <select aria-label="quartile" value={r.quartile ?? ""} onChange={(ev) => setRow(i, k, { quartile: ev.target.value === "" ? null : (Number(ev.target.value) as RankingRow["quartile"]) })}>
                      <option value="">none</option>
                      {[1, 2, 3, 4].map((q) => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </td>
                  <td><button type="button" className="adm-btn ghost" onClick={() => setEntry(i, { rows: e.rows.filter((_, j) => j !== k) })}>remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="adm-actions">
            <button type="button" className="adm-btn ghost" onClick={() => setEntry(i, { rows: [...e.rows, { period: RANKING_PERIODS.find((p) => !e.rows.some((r) => r.period === p)) ?? "1Y", rank: 0, of: 0, quartile: null }] })}>add period</button>
            <button type="button" className="adm-btn ghost" onClick={() => setLib(lib.filter((_, j) => j !== i))}>remove this ranking</button>
          </div>
        </div>
      ))}
      <div className="adm-actions">
        <button type="button" className="adm-btn ghost" onClick={() => setLib([...lib, structuredClone(EMPTY_RANKING)])}>add a Fund Library ranking</button>
      </div>

      <div className="adm-field" role="group" aria-label="Morningstar rating">
        <span>Morningstar overall rating <em>leave on “none” unless confirmed on the Morningstar page</em></span>
        <div className="row">
          <label className="adm-field">
            <span>stars</span>
            <select value={ms?.stars ?? ""} onChange={(ev) => {
              if (ev.target.value === "") { const rest = { ...value }; delete rest.morningstar; onChange(rest); return; }
              onChange({ ...value, morningstar: { asOf: "", ...ms, stars: Number(ev.target.value) as 1 | 2 | 3 | 4 | 5 } });
            }}>
              <option value="">none</option>
              {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          {ms ? (
            <>
              <label className="adm-field"><span>as at (YYYY-MM-DD)</span><input className="adm-input" value={ms.asOf} maxLength={10} onChange={(ev) => onChange({ ...value, morningstar: { ...ms, asOf: ev.target.value } })} /></label>
              <label className="adm-field"><span>class</span><input className="adm-input" value={ms.classLabel ?? ""} maxLength={40} onChange={(ev) => onChange({ ...value, morningstar: { ...ms, classLabel: ev.target.value || undefined } })} /></label>
              <label className="adm-field"><span>Morningstar category</span><input className="adm-input" value={ms.category ?? ""} maxLength={120} onChange={(ev) => onChange({ ...value, morningstar: { ...ms, category: ev.target.value || undefined } })} /></label>
              <label className="adm-field"><span>source page (https)</span><input className="adm-input" value={ms.url ?? ""} maxLength={300} onChange={(ev) => onChange({ ...value, morningstar: { ...ms, url: ev.target.value || undefined } })} /></label>
            </>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}
