"use client";
/**
 * Admin form of the third-party rankings: Fundata category rank / quartile, Morningstar stars, and percentile
 * rankings from the RBC Investor Services pooled fund survey, eVestment, LSEG Lipper and GMR. Manual data entry: an entry
 * is public only once confirmed with its source URL and as-of date, and while younger than the staleness limit.
 */
import {
  RANKING_PERIODS,
  THIRD_PARTY_PROVIDERS,
  type FundLibraryRanking,
  type FundRankings,
  type PercentileRow,
  type RankingPeriod,
  type RankingRow,
  type ThirdPartyProvider,
  type ThirdPartyRanking,
} from "@/lib/data/types";
import {
  DEFAULT_MAX_AGE_MONTHS,
  lastShowDay,
  PROVIDER_META,
  thirdPartyStatus,
  type EntryStatus,
} from "@/lib/rankings/policy";
import { L10nInput } from "./client";

const STATUS_TEXT: Record<EntryStatus, [string, string]> = {
  shown: ["ok", "shown on the site"],
  draft: ["info", "draft — hidden"],
  incomplete: ["warn", "incomplete — hidden"],
  stale: ["warn", "out of date — hidden"],
  "other-class": ["warn", "not a class of this fund — hidden"],
};

const newEntry = (provider: ThirdPartyProvider): ThirdPartyRanking => ({
  provider,
  classLabel: "",
  category: { en: "", fr: "" },
  asOf: "",
  rows: [],
  confirmed: false,
});

const EMPTY_RANKING: FundLibraryRanking = { classLabel: "", category: { en: "", fr: "" }, asOf: "", rows: [] };

export function RankingsEditor({
  value,
  onChange,
  months = DEFAULT_MAX_AGE_MONTHS,
  morningstarMissing = [],
}: {
  value: FundRankings;
  onChange: (v: FundRankings) => void;
  months?: number;
  morningstarMissing?: string[];
}) {
  const lib = value.fundLibrary ?? [];
  const setLib = (next: FundLibraryRanking[]) => onChange({ ...value, fundLibrary: next });
  const setEntry = (i: number, patch: Partial<FundLibraryRanking>) =>
    setLib(lib.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const setRow = (i: number, k: number, patch: Partial<RankingRow>) =>
    setEntry(i, { rows: lib[i].rows.map((r, j) => (j === k ? { ...r, ...patch } : r)) });
  const ms = value.morningstar;
  const num = (s: string): number => (s === "" ? 0 : Math.max(0, Math.trunc(Number(s)) || 0));

  return (
    <fieldset className="adm-fieldset" data-testid="rankings-editor">
      <legend>awards and rankings</legend>
      <div className="adm-alert warn">
        Updated manually. These figures are third-party data copied from the source page (Fundata on FundLibrary.com,
        Morningstar): they are never refreshed by the pipeline. Update them, and their “as at” date, each time the
        source changes; remove an entry that is out of date. Only add a rating you have confirmed on the source page.
        Every entry is hidden once its “as at” date is older than {months} months (site settings). Brand logos and
        rating images are shown only from the owners’ official files (Settings → third-party brand assets); otherwise
        the page shows text.
      </div>

      <ThirdPartyEditor
        list={value.thirdParty ?? []}
        months={months}
        onChange={(thirdParty) => onChange({ ...value, thirdParty })}
      />

      {lib.map((e, i) => (
        <div key={i} className="adm-field" role="group" aria-label={`Fundata ranking ${i + 1}`}>
          <div className="row">
            <label className="adm-field">
              <span>class (as the source names it)</span>
              <input
                className="adm-input"
                value={e.classLabel}
                maxLength={40}
                placeholder="Class F"
                onChange={(ev) => setEntry(i, { classLabel: ev.target.value })}
              />
            </label>
            <label className="adm-field">
              <span>Fundserv</span>
              <input
                className="adm-input"
                value={e.fundserv ?? ""}
                maxLength={12}
                placeholder="LDM201"
                onChange={(ev) => setEntry(i, { fundserv: ev.target.value })}
              />
            </label>
            <label className="adm-field">
              <span>as at (YYYY-MM-DD)</span>
              <input
                className="adm-input"
                value={e.asOf}
                maxLength={10}
                placeholder="2026-08-31"
                onChange={(ev) => setEntry(i, { asOf: ev.target.value })}
              />
            </label>
            <label className="adm-field">
              <span>FundGrade</span>
              <select
                value={e.fundGrade ?? ""}
                onChange={(ev) => setEntry(i, { fundGrade: ev.target.value || undefined })}
              >
                <option value="">none</option>
                {["A", "B", "C", "D", "E"].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <L10nInput label="category" value={e.category} onChange={(v) => setEntry(i, { category: v })} max={120} />
          <label className="adm-field">
            <span>source page (https)</span>
            <input
              className="adm-input"
              value={e.url ?? ""}
              maxLength={300}
              onChange={(ev) => setEntry(i, { url: ev.target.value || undefined })}
            />
          </label>
          <table className="adm-table" aria-label="rank by period">
            <thead>
              <tr>
                <th>period</th>
                <th>rank</th>
                <th>of</th>
                <th>quartile</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {e.rows.map((r, k) => (
                <tr key={k}>
                  <td>
                    <select
                      aria-label="period"
                      value={r.period}
                      onChange={(ev) => setRow(i, k, { period: ev.target.value as RankingPeriod })}
                    >
                      {RANKING_PERIODS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="adm-input"
                      aria-label="rank"
                      inputMode="numeric"
                      value={r.rank || ""}
                      onChange={(ev) => setRow(i, k, { rank: num(ev.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      className="adm-input"
                      aria-label="number of funds"
                      inputMode="numeric"
                      value={r.of || ""}
                      onChange={(ev) => setRow(i, k, { of: num(ev.target.value) })}
                    />
                  </td>
                  <td>
                    <select
                      aria-label="quartile"
                      value={r.quartile ?? ""}
                      onChange={(ev) =>
                        setRow(i, k, {
                          quartile: ev.target.value === "" ? null : (Number(ev.target.value) as RankingRow["quartile"]),
                        })
                      }
                    >
                      <option value="">none</option>
                      {[1, 2, 3, 4].map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="adm-btn ghost"
                      onClick={() => setEntry(i, { rows: e.rows.filter((_, j) => j !== k) })}
                    >
                      remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="adm-actions">
            <button
              type="button"
              className="adm-btn ghost"
              onClick={() =>
                setEntry(i, {
                  rows: [
                    ...e.rows,
                    {
                      period: RANKING_PERIODS.find((p) => !e.rows.some((r) => r.period === p)) ?? "1Y",
                      rank: 0,
                      of: 0,
                      quartile: null,
                    },
                  ],
                })
              }
            >
              add period
            </button>
            <button type="button" className="adm-btn ghost" onClick={() => setLib(lib.filter((_, j) => j !== i))}>
              remove this ranking
            </button>
          </div>
        </div>
      ))}
      <div className="adm-actions">
        <button
          type="button"
          className="adm-btn ghost"
          onClick={() => setLib([...lib, structuredClone(EMPTY_RANKING)])}
        >
          add a Fundata ranking
        </button>
      </div>

      <div className="adm-field" role="group" aria-label="Morningstar rating">
        <span>
          Morningstar overall rating{" "}
          <em>
            leave on “none” unless confirmed on the Morningstar page; shown on the fund overview and the awards tab
          </em>
        </span>
        {ms && morningstarMissing.length ? (
          <div className="adm-alert warn" data-testid="morningstar-assets-missing">
            official Morningstar assets missing ({morningstarMissing.join(", ")}): the rating is shown as text. Add the
            official files to public/brand/third-party/ or upload them in Settings → third-party brand assets.
          </div>
        ) : null}
        <div className="row">
          <label className="adm-field">
            <span>stars</span>
            <select
              value={ms?.stars ?? ""}
              onChange={(ev) => {
                if (ev.target.value === "") {
                  const rest = { ...value };
                  delete rest.morningstar;
                  onChange(rest);
                  return;
                }
                onChange({
                  ...value,
                  morningstar: { asOf: "", classLabel: "", ...ms, stars: Number(ev.target.value) as 1 | 2 | 3 | 4 | 5 },
                });
              }}
            >
              <option value="">none</option>
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {ms ? (
            <>
              <label className="adm-field">
                <span>as at (YYYY-MM-DD)</span>
                <input
                  className="adm-input"
                  value={ms.asOf}
                  maxLength={10}
                  onChange={(ev) => onChange({ ...value, morningstar: { ...ms, asOf: ev.target.value } })}
                />
              </label>
              <label className="adm-field">
                <span>funds in category (“out of N”)</span>
                <input
                  className="adm-input"
                  inputMode="numeric"
                  value={ms.fundsInCategory ?? ""}
                  onChange={(ev) => {
                    const n = Math.trunc(Number(ev.target.value));
                    const next = { ...ms };
                    if (n > 0) next.fundsInCategory = n;
                    else delete next.fundsInCategory;
                    onChange({ ...value, morningstar: next });
                  }}
                />
              </label>
              <label className="adm-field">
                <span>class (required)</span>
                <input
                  className="adm-input"
                  value={ms.classLabel ?? ""}
                  maxLength={40}
                  placeholder="Class F"
                  onChange={(ev) => onChange({ ...value, morningstar: { ...ms, classLabel: ev.target.value } })}
                />
              </label>
              <L10nInput
                label="Morningstar category"
                value={ms.category ?? { en: "", fr: "" }}
                max={120}
                onChange={(v) => onChange({ ...value, morningstar: { ...ms, category: v.en || v.fr ? v : undefined } })}
              />
              <label className="adm-field">
                <span>source page (https)</span>
                <input
                  className="adm-input"
                  value={ms.url ?? ""}
                  maxLength={300}
                  onChange={(ev) => onChange({ ...value, morningstar: { ...ms, url: ev.target.value || undefined } })}
                />
              </label>
            </>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ RBC pooled fund survey, eVestment, LSEG Lipper, GMR */

function ThirdPartyEditor({
  list,
  months,
  onChange,
}: {
  list: ThirdPartyRanking[];
  months: number;
  onChange: (v: ThirdPartyRanking[]) => void;
}) {
  const now = new Date();
  const setEntry = (i: number, patch: Partial<ThirdPartyRanking>) =>
    onChange(list.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const setRow = (i: number, k: number, patch: Partial<PercentileRow>) =>
    setEntry(i, { rows: list[i].rows.map((r, j) => (j === k ? { ...r, ...patch } : r)) });
  const optNum = (s: string): number | null =>
    s.trim() === "" ? null : Math.max(0, Math.trunc(Number(s)) || 0) || null;
  return (
    <div className="adm-field" role="group" aria-label="percentile rankings" data-testid="tp-editor">
      <span>
        percentile rankings — RBC Investor Services pooled fund survey, eVestment, LSEG Lipper, GMR{" "}
        <em>hidden until “confirmed” with the source URL and as-of date</em>
      </span>
      {list.map((e, i) => {
        const meta = PROVIDER_META[e.provider];
        const [tone, text] = STATUS_TEXT[thirdPartyStatus(e, now, months)];
        const name = `${meta.name} ${i + 1}`;
        return (
          <div key={i} className="adm-field" role="group" aria-label={`${name} ranking`} data-testid={`tp-entry-${i}`}>
            <div className="row">
              <span className={`adm-pill ${tone}`} data-testid={`tp-status-${i}`}>
                {text}
              </span>
              {e.confirmed && e.asOf ? (
                <span className="adm-small">hidden after {lastShowDay(e.asOf, months) ?? "—"}</span>
              ) : null}
            </div>
            {e.note ? <div className="adm-alert">{e.note}</div> : null}
            <div className="row">
              <label className="adm-field">
                <span>provider</span>
                <select
                  aria-label={`${name} provider`}
                  value={e.provider}
                  onChange={(ev) => setEntry(i, { provider: ev.target.value as ThirdPartyProvider })}
                >
                  {THIRD_PARTY_PROVIDERS.map((p) => (
                    <option key={p} value={p}>
                      {PROVIDER_META[p].name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="adm-field">
                <span>class (as the source names it)</span>
                <input
                  className="adm-input"
                  aria-label={`${name} class`}
                  value={e.classLabel}
                  maxLength={40}
                  placeholder="Class F / Pooled fund"
                  onChange={(ev) => setEntry(i, { classLabel: ev.target.value })}
                />
              </label>
              <label className="adm-field">
                <span>Fundserv (optional)</span>
                <input
                  className="adm-input"
                  aria-label={`${name} Fundserv`}
                  value={e.fundserv ?? ""}
                  maxLength={12}
                  onChange={(ev) => setEntry(i, { fundserv: ev.target.value || undefined })}
                />
              </label>
              <label className="adm-field">
                <span>period ended (YYYY-MM-DD)</span>
                <input
                  className="adm-input"
                  aria-label={`${name} as of`}
                  value={e.asOf}
                  maxLength={10}
                  placeholder="2026-06-30"
                  onChange={(ev) => setEntry(i, { asOf: ev.target.value })}
                />
              </label>
              <label className="adm-field">
                <span>edition</span>
                <input
                  className="adm-input"
                  aria-label={`${name} edition`}
                  value={e.edition ?? ""}
                  maxLength={40}
                  placeholder="Q2 2026"
                  onChange={(ev) => setEntry(i, { edition: ev.target.value || undefined })}
                />
              </label>
            </div>
            <L10nInput
              label={`${name} peer group`}
              value={e.category}
              onChange={(v) => setEntry(i, { category: v })}
              max={120}
            />
            <label className="adm-field">
              <span>source page or PDF (https)</span>
              <input
                className="adm-input"
                aria-label={`${name} source URL`}
                value={e.url ?? ""}
                maxLength={300}
                onChange={(ev) => setEntry(i, { url: ev.target.value.trim() || undefined })}
              />
            </label>
            <div className="row">
              <label className="adm-check">
                <input
                  type="checkbox"
                  aria-label={`${name} fund as a whole`}
                  checked={e.scope === "fund"}
                  onChange={(ev) => setEntry(i, { scope: ev.target.checked ? "fund" : undefined })}
                />
                <span>the source ranks the fund as a whole, not a series (class may stay empty)</span>
              </label>
              <label className="adm-field">
                <span>strategy track record since (YYYY-MM, when it predates the fund)</span>
                <input
                  className="adm-input"
                  aria-label={`${name} track record since`}
                  value={e.trackSince ?? ""}
                  maxLength={7}
                  placeholder="2019-01"
                  onChange={(ev) => setEntry(i, { trackSince: ev.target.value || undefined })}
                />
              </label>
              <label className="adm-field">
                <span>where in the source (admin only)</span>
                <input
                  className="adm-input"
                  aria-label={`${name} source reference`}
                  value={e.sourceRef ?? ""}
                  maxLength={80}
                  placeholder="page 21 of 57"
                  onChange={(ev) => setEntry(i, { sourceRef: ev.target.value || undefined })}
                />
              </label>
            </div>
            <L10nInput
              label={`${name} basis`}
              hint="as the source states it, e.g. gross of management fees, in Canadian dollars (shown next to the figures)"
              value={e.basis ?? { en: "", fr: "" }}
              onChange={(v) => setEntry(i, { basis: v.en || v.fr ? v : undefined })}
              max={160}
            />
            <table className="adm-table" aria-label={`${name} percentile by period`}>
              <thead>
                <tr>
                  <th>period</th>
                  <th>percentile (1 = best)</th>
                  <th>rank</th>
                  <th>of</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {e.rows.map((r, k) => (
                  <tr key={k}>
                    <td>
                      <select
                        aria-label={`${name} period ${k + 1}`}
                        value={r.period}
                        onChange={(ev) => setRow(i, k, { period: ev.target.value as RankingPeriod })}
                      >
                        {RANKING_PERIODS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="adm-input"
                        aria-label={`${name} percentile ${r.period}`}
                        inputMode="numeric"
                        value={r.percentile ?? ""}
                        onChange={(ev) => setRow(i, k, { percentile: optNum(ev.target.value) })}
                      />
                    </td>
                    <td>
                      <input
                        className="adm-input"
                        aria-label={`${name} rank ${r.period}`}
                        inputMode="numeric"
                        value={r.rank ?? ""}
                        onChange={(ev) => setRow(i, k, { rank: optNum(ev.target.value) })}
                      />
                    </td>
                    <td>
                      <input
                        className="adm-input"
                        aria-label={`${name} of ${r.period}`}
                        inputMode="numeric"
                        value={r.of ?? ""}
                        onChange={(ev) => setRow(i, k, { of: optNum(ev.target.value) })}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="adm-btn ghost"
                        onClick={() => setEntry(i, { rows: e.rows.filter((_, j) => j !== k) })}
                      >
                        remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="adm-table" aria-label={`${name} rolling periods`}>
              <thead>
                <tr>
                  <th>rolling period ending (YYYY-MM-DD)</th>
                  <th>length (years)</th>
                  <th>percentile (1 = best)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(e.rolling ?? []).map((a, k) => (
                  <tr key={k}>
                    <td>
                      <input
                        className="adm-input"
                        aria-label={`${name} period end ${k + 1}`}
                        value={a.end}
                        maxLength={10}
                        onChange={(ev) =>
                          setEntry(i, {
                            rolling: (e.rolling ?? []).map((x, j) => (j === k ? { ...x, end: ev.target.value } : x)),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="adm-input"
                        aria-label={`${name} period years ${k + 1}`}
                        inputMode="numeric"
                        value={a.years || ""}
                        onChange={(ev) =>
                          setEntry(i, {
                            rolling: (e.rolling ?? []).map((x, j) =>
                              j === k ? { ...x, years: optNum(ev.target.value) ?? 0 } : x,
                            ),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="adm-input"
                        aria-label={`${name} period percentile ${k + 1}`}
                        inputMode="numeric"
                        value={a.percentile ?? ""}
                        onChange={(ev) =>
                          setEntry(i, {
                            rolling: (e.rolling ?? []).map((x, j) =>
                              j === k ? { ...x, percentile: optNum(ev.target.value) } : x,
                            ),
                          })
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="adm-btn ghost"
                        onClick={() => setEntry(i, { rolling: (e.rolling ?? []).filter((_, j) => j !== k) })}
                      >
                        remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="adm-actions">
              <button
                type="button"
                className="adm-btn ghost"
                onClick={() =>
                  setEntry(i, { rolling: [...(e.rolling ?? []), { end: "", years: 4, percentile: null }] })
                }
              >
                add a rolling period (e.g. RBC “four year periods ending June 30”)
              </button>
            </div>
            <label className="adm-check">
              <input
                type="checkbox"
                aria-label={`${name} confirmed`}
                checked={!!e.confirmed}
                onChange={(ev) => setEntry(i, { confirmed: ev.target.checked })}
              />
              <span>
                confirmed — I checked every figure, the class, the peer group and the date on the source page (publishes
                it)
              </span>
            </label>
            <div className="adm-actions">
              <button
                type="button"
                className="adm-btn ghost"
                onClick={() =>
                  setEntry(i, {
                    rows: [
                      ...e.rows,
                      {
                        period: RANKING_PERIODS.find((p) => !e.rows.some((r) => r.period === p)) ?? "1Y",
                        percentile: null,
                      },
                    ],
                  })
                }
              >
                add period
              </button>
              <button type="button" className="adm-btn ghost" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                remove this ranking
              </button>
            </div>
          </div>
        );
      })}
      <div className="adm-actions">
        {THIRD_PARTY_PROVIDERS.map((p) => (
          <button
            key={p}
            type="button"
            className="adm-btn ghost"
            data-testid={`tp-add-${p}`}
            onClick={() => onChange([...list, newEntry(p)])}
          >
            add a {PROVIDER_META[p].name} ranking
          </button>
        ))}
      </div>
    </div>
  );
}
