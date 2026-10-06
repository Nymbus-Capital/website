"use client";
/**
 * Distribution history of one series: one bar per distribution (amount per unit, class currency), in the fund
 * gradient, growing from the axis on first view (not under reduced motion). Hovering or focusing a bar shows its date
 * and amount; the same figures are in the table under the chart. Keyboard: one tab stop for the whole chart (roving
 * tabindex, on the latest distribution by default), arrow keys / Home / End move between bars. Mounts lazily near the
 * viewport.
 */
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { barPath, bands, nice, yearTicks } from "../lib/scale.ts";
import { dateLabel, money, monthLabel } from "../lib/format.ts";
import { Tip, type TipState } from "./Tip";
import { useEntrance, useNear, useSvgId, useWidth } from "./hooks";
import type { Locale } from "@/lib/i18n/config";

export function DistBars({ points, currency, lang, label, seriesName, height = 220, decimals: amountDecimals = 4 }: {
  points: { date: string; amount: number }[]; currency: string; lang: Locale; label: string; seriesName: string; height?: number;
  /** decimals of the amounts (the series' own precision, as in the tables) */
  decimals?: number;
}) {
  const [host, w] = useWidth<HTMLDivElement>();
  const [nearRef, near, seen] = useNear<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const id = useSvgId("db");
  const [on, setOn] = useState<number | null>(null);
  // the one bar in the tab order (roving tabindex): the last one focused, else the latest distribution
  const [stop, setStop] = useState<number | null>(null);
  const tabStop = stop != null && stop < points.length ? stop : points.length - 1;
  const [tip, setTip] = useState<TipState | null>(null);
  const narrow = w > 0 && w < 560;
  const pad = { l: narrow ? 44 : 54, r: 8, t: 18, b: 34 };
  const geo = useMemo(() => {
    const sc = nice(0, Math.max(...points.map((p) => p.amount), 0.0001), 4);
    const W = Math.max(0, w - pad.l - pad.r), IH = height - pad.t - pad.b;
    const y = (v: number) => pad.t + IH - (v / (sc.hi || 1)) * IH;
    const b = bands(points.length, pad.l, W, 1, points.length <= 6 ? 0.5 : 0.28);
    return { sc, y, b, W };
  }, [points, w, height, pad.l, pad.r, pad.t, pad.b]);
  useEntrance(svgRef, seen && w > 0, points.map((p) => p.date).join());

  const decimals = Math.max(2, Math.min(4, -Math.floor(Math.log10(geo.sc.step || 0.01) + 1e-9)));
  const amount = (v: number) => money(v, currency, lang, amountDecimals);
  // the axis says "per unit" in the chart label; ticks carry the currency like the table
  const tick = (v: number) => money(v, currency, lang, v === 0 ? 0 : decimals);
  // labels: every bar when few (quarterly / annual), else the first bar of each year
  const labels = points.length <= 8
    ? points.map((p, i) => ({ i, label: points.length <= 4 ? String(p.date.slice(0, 4)) : monthLabel(p.date, lang, true) }))
    : yearTicks(points.map((p) => p.date), narrow ? 3 : 6);

  const focusBar = (i: number | null) => {
    setOn(i);
    if (i == null) { setTip(null); return; }
    const p = points[i];
    setTip({ x: geo.b.x(i) + geo.b.band / 2, y: Math.max(8, geo.y(p.amount)), title: dateLabel(p.date, lang, true), rows: [{ cls: "fund", label: seriesName, value: amount(p.amount) }] });
  };
  const onKey = (e: KeyboardEvent<SVGGElement>, i: number) => {
    const last = points.length - 1;
    const next = e.key === "ArrowRight" || e.key === "ArrowUp" ? Math.min(last, i + 1)
      : e.key === "ArrowLeft" || e.key === "ArrowDown" ? Math.max(0, i - 1)
      : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next == null) return;
    e.preventDefault();
    setStop(next);
    svgRef.current?.querySelectorAll<SVGGElement>(".cat")[next]?.focus();
  };

  return (
    <div ref={(el) => { host.current = el; nearRef.current = el; }} className="fx-chart ds-chart" style={{ height }} data-testid="distribution-chart">
      {near && w > 0 ? (
        <svg ref={svgRef} width={w} height={height} viewBox={`0 0 ${w} ${height}`} role="group" aria-label={label} className={on != null ? "hovering" : undefined} onPointerLeave={() => focusBar(null)}>
          <defs>
            <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--fund-from)" /><stop offset="1" stopColor="var(--fund-to)" /></linearGradient>
            <filter id={`${id}g`} x="-50%" y="-20%" width="200%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="var(--fund)" floodOpacity=".3" /></filter>
          </defs>
          {geo.sc.ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={pad.l + geo.W} y1={geo.y(t)} y2={geo.y(t)} className={t === 0 ? "zero" : "gl"} />
              <text x={pad.l - 8} y={geo.y(t)} className="tk" textAnchor="end" dominantBaseline="central">{tick(t)}</text>
            </g>
          ))}
          {points.map((p, i) => {
            const bw = Math.max(2, Math.min(34, geo.b.inner));
            const bx = geo.b.x(i) + (geo.b.band - bw) / 2;
            const d = barPath(bx, geo.y(0), bw, geo.y(p.amount), Math.min(6, bw / 3));
            return (
              <g key={p.date} className={`cat${on === i ? " on" : ""}`} tabIndex={i === tabStop ? 0 : -1} role="img" aria-label={`${dateLabel(p.date, lang, true)}: ${amount(p.amount)}`}
                onPointerEnter={() => focusBar(i)} onFocus={() => { setStop(i); focusBar(i); }} onBlur={() => focusBar(null)} onKeyDown={(e) => onKey(e, i)}>
                <rect className="hit" x={geo.b.x(i)} y={pad.t - 10} width={geo.b.band} height={height - pad.t - pad.b + 10} rx={8} />
                {d ? <path d={d} fill={`url(#${id}f)`} filter={`url(#${id}g)`} data-grow="up" /> : null}
              </g>
            );
          })}
          {labels.map((l) => (
            <text key={l.i} x={geo.b.x(l.i) + geo.b.band / 2} y={height - pad.b + 22} className="tk x" textAnchor="middle" aria-hidden="true">{l.label}</text>
          ))}
        </svg>
      ) : <div className="fx-ph" style={{ height }} aria-hidden="true" />}
      <Tip tip={tip} hostWidth={w} />
    </div>
  );
}

/** Amount per unit with the currency, as in the tables (the series' decimals, see amountDecimals). */
export const perUnit = (v: number, currency: string, lang: Locale, decimals = 4) => money(v, currency, lang, decimals);
