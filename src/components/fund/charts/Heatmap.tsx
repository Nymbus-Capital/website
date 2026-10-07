"use client";
/**
 * Monthly returns heatmap: years × months of small rounded cells, no boxes. Colour intensity follows the
 * size of the return (blue → cyan positive, red negative) against a robust scale (95th percentile), the
 * calendar-year return closes each row. It is a real <table>, so it reads well without the colours;
 * every cell is focusable and shows its value on hover / focus. Cells pop in row by row.
 */
import { useMemo, useRef, useState, type CSSProperties } from "react";
import type { CalendarRow, MonthlyPoint } from "@/lib/data/types";
import { heatCell, heatmapGrid, heatScale } from "../lib/heatmap.ts";
import { fmt, MONTH_INITIALS, monthName } from "../lib/format.ts";
import { Tip, type TipState } from "./Tip";
import { useEntrance, useNear } from "./hooks";
import type { Locale } from "@/lib/i18n/config";

interface HeatmapProps {
  monthly: MonthlyPoint[];
  calendar?: CalendarRow[] | null;
  /** month-end of the published performance: only its year is flagged YTD */
  asOf?: string | null;
  lang: Locale;
  labels: {
    year: string;
    total: string;
    ytd: string;
    launch: string;
    neg: string;
    pos: string;
    fund: string;
  };
  caption: string;
  /** month-ends whose return was withheld (a check failed): their year is not shown */
  withheld?: Set<string>;
  /** a partial first month (YYYY-MM) of a series: its cell is marked, with `label` as its title */
  partial?: { month: string; label: string } | null;
}

export function Heatmap({
  monthly,
  calendar,
  asOf = null,
  lang,
  labels,
  caption,
  withheld,
  partial = null,
}: HeatmapProps) {
  const rows = useMemo(() => heatmapGrid(monthly, calendar, asOf, withheld), [monthly, calendar, asOf, withheld]);
  const scale = useMemo(() => heatScale(rows.flatMap((r) => r.cells.filter((c): c is number => c != null))), [rows]);
  const [ref, near, seen] = useNear<HTMLDivElement>("200px 0px");
  const tableRef = useRef<HTMLTableElement>(null);
  const [tip, setTip] = useState<TipState | null>(null);
  const [w, setW] = useState(0);
  useEntrance(tableRef, seen && near);

  const show = (el: HTMLElement, year: number, m: number, r: number) => {
    const host = ref.current;
    if (!host) return;
    const hr = host.getBoundingClientRect(),
      cr = el.getBoundingClientRect();
    setW(hr.width);
    setTip({
      x: cr.left - hr.left + cr.width / 2,
      y: cr.top - hr.top,
      title: `${monthName(m + 1, lang)} ${year}`,
      rows: [
        {
          cls: r >= 0 ? "fund" : "va",
          label: labels.fund,
          value: fmt(r, { pct: true, decimals: 2, sign: true, lang }),
        },
      ],
    });
  };

  // rows are ~ (cell height + spacing): reserve the height before the table mounts
  const estH = 34 + rows.length * 42;
  return (
    <div ref={ref} className="fx-chart" onPointerLeave={() => setTip(null)}>
      {near ? (
        <div className="fx-scroll">
          <table ref={tableRef} className="fx-hm" style={{ minWidth: 320 }}>
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr>
                <th className="y" scope="col">
                  <span className="sr-only">{labels.year}</span>
                </th>
                {MONTH_INITIALS[lang].map((m, i) => (
                  <th key={i} scope="col" abbr={monthName(i + 1, lang)}>
                    {m}
                  </th>
                ))}
                <th className="tot" scope="col" style={{ textAlign: "right" }}>
                  {labels.total}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.year}>
                  <th className="y" scope="row">
                    {row.year}
                  </th>
                  {row.cells.map((r, m) => {
                    const c = heatCell(r, scale);
                    // only months outside the record (before its start, after its last month) have no figure
                    if (r == null)
                      return (
                        <td key={m}>
                          <div className="c none" aria-hidden="true" />
                        </td>
                      );
                    const txt = fmt(r, { pct: true, decimals: 1, lang });
                    const isPartial = !!partial && partial.month === `${row.year}-${String(m + 1).padStart(2, "0")}`;
                    return (
                      <td key={m} data-testid={isPartial ? "heat-partial" : undefined}>
                        <div
                          className={`c ${c.tone}${c.strong ? " strong" : ""}${isPartial ? " hm-partial" : ""}`}
                          style={{ "--a": c.alpha } as CSSProperties}
                          tabIndex={0}
                          data-cell={ri + m}
                          title={isPartial ? partial!.label : undefined}
                          aria-label={`${monthName(m + 1, lang)} ${row.year}: ${fmt(r, { pct: true, decimals: 2, lang })}${isPartial ? ` (${partial!.label})` : ""}`}
                          onPointerEnter={(e) => show(e.currentTarget, row.year, m, r)}
                          onFocus={(e) => show(e.currentTarget, row.year, m, r)}
                          onBlur={() => setTip(null)}
                        >
                          <span className="v" aria-hidden="true">
                            {txt.replace(/ ?%/, "")}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="tot">
                    {row.total != null ? (
                      <span className={row.total >= 0 ? undefined : "neg"}>
                        {fmt(row.total, { pct: true, decimals: 1, lang })}
                      </span>
                    ) : null}
                    {row.kind ? <small>{row.kind === "ytd" ? labels.ytd : labels.launch}</small> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="fx-ph" style={{ height: estH }} aria-hidden="true" />
      )}
      <div className="fx-hm-legend" aria-hidden="true">
        <span>{labels.neg}</span>
        <span className="bar" />
        <span>{labels.pos}</span>
      </div>
      <Tip tip={tip} hostWidth={w} />
    </div>
  );
}
