"use client";
/**
 * Grouped bars (fund · index · value added) — trailing returns and calendar years.
 * v2 keynote bars: square at the axis, rounded far end, fund in its gradient with a glow, index muted,
 * value-added as a thin dark bar; values above the bars; hovering / focusing a category dims the others
 * and shows a tooltip. Each category is keyboard focusable (Tab / arrow keys). Mounts lazily near the viewport.
 */
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { barPath, bands, nice } from "../lib/scale.ts";
import { fmt, type Lang } from "../lib/format.ts";
import { Tip, type TipState } from "./Tip";
import { useEntrance, useNear, useSvgId, useWidth } from "./hooks";

export interface BarCategory {
  key: string;
  label: string;
  /** long label for tooltips / screen readers */
  long: string;
  /** small flag under the label (e.g. "ytd") */
  flag?: string;
  fund: number | null;
  index?: number | null;
  va?: number | null;
}

export interface GroupedBarsProps {
  cats: BarCategory[];
  names: { fund: string; index: string; va: string };
  lang: Lang;
  /** accessible name of the chart */
  label: string;
  height?: number;
  /** show value labels above the bars when there is room */
  values?: boolean;
  /**
   * label every bar (above it, below a negative one) at any width: the chart takes the width the labels need and
   * scrolls sideways inside its card when the card is narrower (never overlapping labels)
   */
  labelAll?: boolean;
}

/** width one bar needs for its "−12.3%" label (11.5 px figures) */
const LABEL_SLOT = 46;

export function GroupedBars({ cats, names, lang, label, height = 380, values = true, labelAll = false }: GroupedBarsProps) {
  const [host, w] = useWidth<HTMLDivElement>();
  const [near, nearRef, seen] = useNearRef();
  const svgRef = useRef<SVGSVGElement>(null);
  const id = useSvgId("gb");
  const [on, setOn] = useState<number | null>(null);
  const [tip, setTip] = useState<TipState | null>(null);

  const hasIndex = cats.some((c) => c.index != null);
  const hasVa = cats.some((c) => c.va != null);
  // value added is not a third bar: it rides above each fund / index pair as a small ± pill
  const series = (["fund", ...(hasIndex ? ["index"] : [])] as ("fund" | "index")[]);

  const narrow = w > 0 && w < 560;
  const H = narrow ? Math.round(height * 0.82) : height;
  // a negative bar's label sits below it: room under the lowest bar, above the axis labels
  const hasNeg = labelAll && cats.some((c) => (typeof c.fund === "number" && c.fund < 0) || (hasIndex && typeof c.index === "number" && c.index < 0));
  const pad = { l: narrow ? 38 : 48, r: 8, t: hasVa ? 58 : 30, b: (cats.some((c) => c.flag) ? 50 : 38) + (hasNeg ? 14 : 0) };
  const cw = labelAll && w > 0 ? Math.max(w, pad.l + pad.r + cats.length * (series.length * LABEL_SLOT + 14)) : w;
  const scrolls = cw > w;
  const geo = useMemo(() => {
    const all = cats.flatMap((c) => [c.fund, hasIndex ? c.index : null]).filter((v): v is number => typeof v === "number");
    const sc = nice(Math.min(0, ...all), Math.max(0, ...all), narrow ? 4 : 5);
    const W = Math.max(0, cw - pad.l - pad.r), IH = H - pad.t - pad.b;
    const y = (v: number) => pad.t + IH - ((v - sc.lo) / (sc.hi - sc.lo || 1)) * IH;
    const weights = series.map(() => 1);
    const totalW = weights.reduce((a, b) => a + b, 0);
    const b = bands(cats.length, pad.l, W, 1, cats.length <= 4 ? 0.5 : narrow ? 0.22 : 0.3);
    return { sc, W, IH, y, b, weights, totalW };
  }, [cats, cw, H, narrow, hasIndex, hasVa, series.length, hasNeg]); // eslint-disable-line react-hooks/exhaustive-deps

  useEntrance(svgRef, seen && w > 0);

  const pctF = (v: number) => fmt(v, { pct: true, decimals: 1, lang });
  const tickF = (v: number) => fmt(v, { pct: true, decimals: geo.sc.step * 100 >= 1 && Number.isInteger(+(geo.sc.step * 100).toFixed(6)) ? 0 : 1, lang });
  const showVals = values && w > 0 && (labelAll || geo.b.inner / series.length >= 26);
  // below 640 px only the fund values are labelled (the index stays in the tooltip and the table), unless every bar is labelled
  const showIndexVals = showVals && (labelAll || w >= 640);

  const focusCat = (i: number | null, el?: Element | null) => {
    setOn(i);
    if (i == null) { setTip(null); return; }
    const c = cats[i];
    const x = geo.b.x(i) + geo.b.band / 2;
    const top = Math.min(...[c.fund, c.index, c.va].filter((v): v is number => typeof v === "number").map((v) => geo.y(Math.max(0, v))));
    setTip({
      x, y: Math.max(8, top),
      title: c.flag ? `${c.long} (${c.flag})` : c.long,
      rows: [
        ...(c.fund != null ? [{ cls: "fund" as const, label: names.fund, value: pctF(c.fund) }] : []),
        ...(hasIndex && c.index != null ? [{ cls: "index" as const, label: names.index, value: pctF(c.index) }] : []),
        ...(hasVa && c.va != null ? [{ cls: "va" as const, label: names.va, value: fmt(c.va, { pct: true, decimals: 1, sign: true, lang }) }] : []),
      ],
    });
    void el;
  };
  const onKey = (e: KeyboardEvent<SVGGElement>, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(cats.length - 1, i + d));
    (svgRef.current?.querySelectorAll<SVGGElement>(".cat")[next])?.focus();
  };

  return (
    <div ref={(el) => { host.current = el; nearRef.current = el; }} className="fx-chart" style={scrolls ? undefined : { height: H }}>
      <div className={`fx-chart-in${scrolls ? " scroll" : ""}`} style={scrolls ? undefined : { height: H }} data-scroll={scrolls ? "" : undefined}>
      {near && w > 0 ? (
        <svg ref={svgRef} width={cw} height={H} viewBox={`0 0 ${cw} ${H}`} role="group" aria-label={label} className={on != null ? "hovering" : undefined}
          onPointerLeave={() => focusCat(null)}>
          <defs>
            <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--fund-from)" /><stop offset="1" stopColor="var(--fund-to)" /></linearGradient>
            <linearGradient id={`${id}fd`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="var(--fund-from)" /><stop offset="1" stopColor="var(--fund-to)" /></linearGradient>
            <linearGradient id={`${id}i`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--fx-index)" /><stop offset="1" stopColor="var(--fx-index2)" /></linearGradient>
            <filter id={`${id}g`} x="-50%" y="-20%" width="200%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="var(--fund)" floodOpacity=".35" /></filter>
          </defs>
          {geo.sc.ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={pad.l + geo.W} y1={geo.y(t)} y2={geo.y(t)} className={t === 0 ? "zero" : "gl"} />
              <text x={pad.l - 10} y={geo.y(t)} className="tk" textAnchor="end" dominantBaseline="central">{tickF(t)}</text>
            </g>
          ))}
          {cats.map((c, i) => {
            const x0 = geo.b.x(i) + (geo.b.band - geo.b.inner) / 2;
            const unit = geo.b.inner / geo.totalW;
            let acc = 0;
            const y0 = geo.y(0);
            const bars = series.map((s, si) => {
              const v = s === "fund" ? c.fund : c.index;
              const slot = unit * geo.weights[si];
              const x = x0 + acc;
              acc += slot;
              if (v == null) return null;
              const bw = Math.max(2, slot - (narrow ? 2 : 4));
              const bx = x + (slot - bw) / 2;
              const yv = geo.y(v);
              const d = barPath(bx, y0, bw, yv, Math.min(7, bw / 3));
              const fill = s === "fund" ? `url(#${id}${v >= 0 ? "f" : "fd"})` : `url(#${id}i)`;
              const txt = pctF(v);
              return (
                <g key={s}>
                  {d ? <path d={d} fill={fill} filter={s === "fund" ? `url(#${id}g)` : undefined} data-grow={v >= 0 ? "up" : "down"} /> : null}
                  {showVals && (s === "fund" || showIndexVals) ? (
                    <text x={bx + bw / 2} y={v >= 0 ? yv - 8 : yv + 15} className={`vl ${s}`} textAnchor="middle" data-lab="" data-testid={labelAll ? `bar-label-${c.key}-${s}` : undefined}>{labelAll ? txt : txt.replace("%", "").replace(" ", "")}</text>
                  ) : null}
                </g>
              );
            });
            const vaPill = hasVa && c.va != null ? (() => {
              const top = Math.min(...[c.fund, c.index].filter((v): v is number => typeof v === "number").map((v) => geo.y(Math.max(0, v))));
              const txt = fmt(c.va!, { pct: true, decimals: 1, sign: true, lang });
              const pw = Math.min(geo.b.inner + 8, txt.length * 6.6 + 16);
              const cx = x0 + geo.b.inner / 2, cy = top - (showVals ? 38 : 16);
              const tone = Math.abs(c.va!) < 0.0005 ? "zero" : c.va! > 0 ? "pos" : "neg";
              return (
                <g className={`vapill ${tone}`} data-lab="">
                  <rect x={cx - pw / 2} y={cy - 10} width={pw} height={20} rx={10} />
                  <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="central">{txt}</text>
                </g>
              );
            })() : null;
            const aria = [
              c.long + (c.flag ? ` (${c.flag})` : ""),
              c.fund != null ? `${names.fund} ${pctF(c.fund)}` : "",
              hasIndex && c.index != null ? `${names.index} ${pctF(c.index)}` : "",
              hasVa && c.va != null ? `${names.va} ${fmt(c.va, { pct: true, decimals: 1, sign: true, lang })}` : "",
            ].filter(Boolean).join(", ");
            return (
              <g key={c.key} className={`cat${on === i ? " on" : ""}`} tabIndex={0} role="img" aria-label={aria}
                onPointerEnter={() => focusCat(i)} onFocus={() => focusCat(i)} onBlur={() => focusCat(null)} onKeyDown={(e) => onKey(e, i)}>
                <rect className="hit" x={geo.b.x(i)} y={pad.t - 20} width={geo.b.band} height={geo.IH + 20} rx={12} />
                {bars}
                {vaPill}
                <text x={geo.b.x(i) + geo.b.band / 2} y={H - pad.b + 22} className="tk x" textAnchor="middle">{c.label}</text>
                {c.flag ? <text x={geo.b.x(i) + geo.b.band / 2} y={H - pad.b + 38} className="tk" textAnchor="middle" style={{ fill: "var(--fund)", fontWeight: 600 }}>{c.flag}</text> : null}
              </g>
            );
          })}
        </svg>
      ) : <div className="fx-ph" style={{ height: H }} aria-hidden="true" />}
      <Tip tip={tip} hostWidth={cw} />
      </div>
    </div>
  );
}

/** useNear with a ref we can merge with the width ref. */
function useNearRef() {
  const [ref, near, seen] = useNear<HTMLDivElement>();
  return [near, ref, seen] as const;
}
