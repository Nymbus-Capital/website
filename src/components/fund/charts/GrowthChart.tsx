"use client";
/**
 * Growth of 10 000 $: the fund line in its gradient with a glow and a gradient area, the index muted and
 * dotted, a pulsing end dot, end labels, a hover / keyboard crosshair with tooltip and a range selector.
 * The line draws itself when it scrolls into view and again when the range changes.
 */
import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { GrowthPoint } from "@/lib/data/types";
import { availableRanges, growthRange, type GrowthMethod, type Range } from "../lib/growth.ts";
import { monotonePath, nearestIndex, nice, yearTicks, monthTicks } from "../lib/scale.ts";
import { compactMoney, fmt, money, monthLabel } from "../lib/format.ts";
import { Tip, type TipState } from "./Tip";
import { useEntrance, useNear, useSvgId, useWidth } from "./hooks";
import type { Locale } from "@/lib/i18n/config";

interface GrowthChartProps {
  points: GrowthPoint[];
  lang: Locale;
  names: { fund: string; index: string };
  rangeLabels: Record<Range, string>;
  rangeGroupLabel: string;
  label: string;
  keysHint: string;
  rebasedNote: string;
  /** how the series aggregates (arithmetic: rebased additively, see growthRange) */
  method?: GrowthMethod;
  height?: number;
}

export function GrowthChart({
  points,
  lang,
  names,
  rangeLabels,
  rangeGroupLabel,
  label,
  keysHint,
  rebasedNote,
  method = "compounded",
  height = 440,
}: GrowthChartProps) {
  const ranges = useMemo(() => availableRanges(points), [points]);
  const [range, setRange] = useState<Range>("SI");
  const [hostRef, w] = useWidth<HTMLDivElement>();
  const [nearRef, near, seen] = useNear<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const id = useSvgId("gr");
  const [hi, setHi] = useState<number | null>(null);

  const s = useMemo(() => growthRange(points, range, method), [points, range, method]);
  const narrow = w > 0 && w < 560;
  const H = narrow ? Math.round(height * 0.78) : height;
  const endLabelW = narrow ? 0 : 86;
  const pad = { l: narrow ? 46 : 58, r: 12 + endLabelW, t: 24, b: 36 };

  const geo = useMemo(() => {
    const vals = [...s.fund, ...s.index.filter((v): v is number => v != null)];
    const sc = nice(Math.min(...vals), Math.max(...vals), narrow ? 4 : 5);
    const W = Math.max(1, w - pad.l - pad.r),
      IH = H - pad.t - pad.b;
    const n = s.dates.length;
    const x = (i: number) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * W);
    const y = (v: number) => pad.t + IH - ((v - sc.lo) / (sc.hi - sc.lo || 1)) * IH;
    const fp: [number, number][] = s.fund.map((v, i) => [x(i), y(v)]);
    const ip: [number, number][] = s.index
      .map((v, i) => (v == null ? null : ([x(i), y(v)] as [number, number])))
      .filter((p): p is [number, number] => !!p);
    const xs = s.dates.map((_, i) => x(i));
    const long = n > 30;
    const ticks = long
      ? yearTicks(s.dates, narrow ? 4 : 7).map((t) => ({ i: t.i, label: t.label }))
      : monthTicks(s.dates, narrow ? 4 : 6).map((i) => ({ i, label: monthLabel(s.dates[i], lang, true) }));
    return { sc, W, IH, x, y, fp, ip, xs, ticks, fd: monotonePath(fp), id: monotonePath(ip) };
  }, [s, w, H, narrow, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEntrance(svgRef, seen && w > 0, range);

  const last = s.fund.length - 1;
  const lastIdx = (() => {
    for (let i = s.index.length - 1; i >= 0; i--) if (s.index[i] != null) return i;
    return -1;
  })();
  const cur = (v: number) => money(v, "CAD", lang, 0);

  const pick = (i: number | null) => setHi(i == null ? null : Math.max(0, Math.min(last, i)));
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    pick(nearestIndex(geo.xs, e.clientX - r.left));
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    const step = e.shiftKey ? 12 : 1;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      pick((hi ?? -1) + step);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      pick((hi ?? last + 1) - step);
    } else if (e.key === "Home") {
      e.preventDefault();
      pick(0);
    } else if (e.key === "End") {
      e.preventDefault();
      pick(last);
    } else if (e.key === "Escape") pick(null);
  };

  const tip: TipState | null =
    hi == null
      ? null
      : {
          x: geo.x(hi),
          y: Math.min(geo.y(s.fund[hi]), s.index[hi] != null ? geo.y(s.index[hi]!) : Infinity),
          title: monthLabel(s.dates[hi], lang),
          rows: [
            { cls: "fund", label: names.fund, value: cur(s.fund[hi]) },
            ...(s.index[hi] != null ? [{ cls: "index" as const, label: names.index, value: cur(s.index[hi]!) }] : []),
          ],
        };
  const changeText = s.change != null ? ` (${fmt(s.change, { pct: true, decimals: 1, sign: true, lang })})` : "";

  return (
    <div>
      {ranges.length > 1 ? (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <div className="fx-seg" role="group" aria-label={rangeGroupLabel}>
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={range === r}
                onClick={() => {
                  setRange(r);
                  setHi(null);
                }}
              >
                {rangeLabels[r]}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="fx-legend">
        <span>
          <i className="fund" />
          {names.fund}
        </span>
        {s.hasIndex ? (
          <span>
            <i className="line index" />
            {names.index}
          </span>
        ) : null}
      </div>
      <div
        ref={(el) => {
          hostRef.current = el;
          nearRef.current = el;
        }}
        className="fx-chart"
        style={{ height: H }}
      >
        {near && w > 0 ? (
          <svg
            ref={svgRef}
            width={w}
            height={H}
            viewBox={`0 0 ${w} ${H}`}
            tabIndex={0}
            role="img"
            aria-label={`${label}. ${names.fund}: ${cur(s.fund[0])} → ${cur(s.fund[last])}${changeText}, ${monthLabel(s.dates[0], lang)} – ${monthLabel(s.dates[last], lang)}. ${keysHint}`}
            onPointerMove={onMove}
            onPointerLeave={() => pick(null)}
            onKeyDown={onKey}
            onBlur={() => pick(null)}
            style={{ touchAction: "pan-y" }}
          >
            <defs>
              <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="var(--fund-from)" />
                <stop offset="1" stopColor="var(--fund-to)" />
              </linearGradient>
              <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--fund-from)" stopOpacity=".38" />
                <stop offset=".55" stopColor="var(--fund-to)" stopOpacity=".08" />
                <stop offset="1" stopColor="var(--fund-to)" stopOpacity="0" />
              </linearGradient>
              <filter id={`${id}g`} x="-5%" y="-30%" width="110%" height="160%">
                <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="var(--fund)" floodOpacity=".45" />
              </filter>
              <clipPath id={`${id}c`}>
                <rect x={pad.l - 6} y={0} width={geo.W + 12 + endLabelW} height={H} />
              </clipPath>
            </defs>
            {geo.sc.ticks.map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={pad.l + geo.W} y1={geo.y(t)} y2={geo.y(t)} className="gl" />
                <text x={pad.l - 10} y={geo.y(t)} className="tk" textAnchor="end" dominantBaseline="central">
                  {compactMoney(t, lang)}
                </text>
              </g>
            ))}
            {geo.ticks.map((t) => (
              <text key={t.i} x={geo.x(t.i)} y={H - 10} className="tk" textAnchor="middle">
                {t.label}
              </text>
            ))}
            <g clipPath={`url(#${id}c)`} key={range}>
              {geo.fp.length > 1 ? (
                <path
                  d={`${geo.fd}L${geo.fp[last][0]},${pad.t + geo.IH}L${geo.fp[0][0]},${pad.t + geo.IH}Z`}
                  fill={`url(#${id}a)`}
                  data-fade=""
                />
              ) : null}
              {geo.ip.length > 1 ? (
                <path
                  d={geo.id}
                  fill="none"
                  stroke="var(--mute)"
                  strokeOpacity=".75"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray="1 5"
                  data-dash="1 5"
                  data-draw=""
                />
              ) : null}
              <path
                d={geo.fd}
                fill="none"
                stroke={`url(#${id}s)`}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${id}g)`}
                data-draw=""
              />
              {lastIdx >= 0 ? (
                <circle
                  cx={geo.x(lastIdx)}
                  cy={geo.y(s.index[lastIdx]!)}
                  r={4}
                  fill="var(--bg)"
                  stroke="var(--mute)"
                  strokeWidth={2}
                  data-pop=""
                />
              ) : null}
              <circle cx={geo.fp[last][0]} cy={geo.fp[last][1]} r={6} fill="var(--fund)" className="pulse" />
              <circle
                cx={geo.fp[last][0]}
                cy={geo.fp[last][1]}
                r={5.5}
                fill="var(--bg)"
                stroke="var(--fund)"
                strokeWidth={3}
                data-pop=""
              />
            </g>
            {!narrow ? <EndLabels geo={geo} last={last} lastIdx={lastIdx} s={s} cur={cur} /> : null}
            {hi != null ? (
              <g pointerEvents="none">
                <line x1={geo.x(hi)} x2={geo.x(hi)} y1={pad.t} y2={pad.t + geo.IH} className="cross" />
                {s.index[hi] != null ? (
                  <circle
                    cx={geo.x(hi)}
                    cy={geo.y(s.index[hi]!)}
                    r={4.5}
                    fill="var(--mute)"
                    stroke="var(--bg)"
                    strokeWidth={2}
                  />
                ) : null}
                <circle
                  cx={geo.x(hi)}
                  cy={geo.y(s.fund[hi])}
                  r={6}
                  fill="var(--fund)"
                  stroke="var(--bg)"
                  strokeWidth={2.5}
                  style={{ filter: "drop-shadow(0 0 8px var(--fund))" }}
                />
              </g>
            ) : null}
          </svg>
        ) : (
          <div className="fx-ph" style={{ height: H }} aria-hidden="true" />
        )}
        <Tip tip={tip} hostWidth={w} />
      </div>
      {range !== "SI" ? <p className="fine fx-foot">{rebasedNote}</p> : null}
    </div>
  );
}

function EndLabels({
  geo,
  last,
  lastIdx,
  s,
  cur,
}: {
  geo: { x: (i: number) => number; y: (v: number) => number };
  last: number;
  lastIdx: number;
  s: { fund: number[]; index: (number | null)[] };
  cur: (v: number) => string;
}) {
  const fy = geo.y(s.fund[last]);
  const iy0 = lastIdx >= 0 ? geo.y(s.index[lastIdx]!) : null;
  // keep the two labels apart
  let iy = iy0;
  if (iy != null && Math.abs(iy - fy) < 30) iy = iy >= fy ? fy + 30 : fy - 30;
  const x = geo.x(last) + 14;
  const ft = cur(s.fund[last]);
  const fw = ft.length * 7.6 + 22;
  return (
    <g data-pop="">
      <rect
        x={x}
        y={fy - 14}
        width={fw}
        height={28}
        rx={14}
        fill="var(--fund-ink)"
        style={{ filter: "drop-shadow(0 6px 14px color-mix(in srgb, var(--fund) 50%, transparent))" }}
      />
      <text
        x={x + fw / 2}
        y={fy + 0.5}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
      >
        {ft}
      </text>
      {iy != null && lastIdx >= 0 ? (
        <text x={x + 4} y={iy} dominantBaseline="central" className="vl index">
          {cur(s.index[lastIdx]!)}
        </text>
      ) : null}
    </g>
  );
}
