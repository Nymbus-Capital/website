"use client";
/**
 * Portfolio breakdowns: animated horizontal bars (fund in its gradient, index as a thin muted bar under it)
 * and a glowing donut for allocations that add up to a whole (strategy allocation of the multi-strategy
 * fund). All values come straight from the factsheet data.
 */
import { useRef, useState } from "react";
import type { Bucket } from "@/lib/data/types";
import { fmt } from "../lib/format.ts";
import { barWidthPct } from "../lib/scale.ts";
import { useEntrance, useNear, useSvgId } from "./hooks";
import type { Locale } from "@/lib/i18n/config";

const pctF = (v: number, lang: Locale, d = 1) => fmt(v, { pct: true, decimals: d, lang });

export function HBars({ rows, lang, names, label }: { rows: Bucket[]; lang: Locale; names: { fund: string; index: string }; label: string }) {
  const [ref, , seen] = useNear<HTMLDivElement>();
  useEntrance(ref, seen);
  const max = Math.max(0.0001, ...rows.flatMap((r) => [r.fund ?? 0, r.index ?? 0]).filter(Number.isFinite));
  const hasIndex = rows.some((r) => r.index != null);
  return (
    <div ref={ref} className="fx-hbars" role="list" aria-label={label}>
      {rows.map((r) => (
        <div className="fx-hbar" role="listitem" key={r.label}
          aria-label={`${r.label}: ${names.fund} ${r.fund != null ? pctF(r.fund, lang) : "—"}${hasIndex && r.index != null ? `, ${names.index} ${pctF(r.index, lang)}` : ""}`}>
          <span className="lab" title={r.label}>{r.label}</span>
          <span className="track" aria-hidden="true">
            <Bar cls="b fund" v={r.fund} max={max} />
            {hasIndex ? <Bar cls="b index" v={r.index} max={max} hidden={r.index == null} /> : null}
          </span>
          <span className="val" aria-hidden="true">
            {r.fund != null ? pctF(r.fund, lang) : "—"}
            {hasIndex ? <small>{r.index != null ? pctF(r.index, lang) : "—"}</small> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

/** One bar: width clamped to [0, 100 %]; nothing drawn (not even the minimum sliver) for a zero or negative value. */
function Bar({ cls, v, max, hidden }: { cls: string; v: number | null | undefined; max: number; hidden?: boolean }) {
  const w = barWidthPct(v, max);
  return <span className={cls} style={{ width: `${w}%`, minWidth: w > 0 ? undefined : 0, opacity: hidden ? 0 : undefined }} data-grow="right" data-empty={w > 0 ? undefined : ""} />;
}

/** Colours of the donut slices: the fund gradient first, then neighbouring keynote hues. */
const SLICE = ["var(--fund)", "var(--fund-from)", "#4c8dff", "#00a3e0", "#34a853", "#fbbc04", "#9aa0a6", "#5f6368"];

export function Donut({ rows, lang, label, indexName }: { rows: Bucket[]; lang: Locale; label: string; indexName: string }) {
  const [ref, , seen] = useNear<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  useEntrance(svgRef, seen);
  const id = useSvgId("dn");
  const [on, setOn] = useState<number | null>(null);
  const parts = rows.filter((r) => (r.fund ?? 0) > 0);
  const size = 260, thick = 26, r = size / 2 - thick / 2 - 8, cx = size / 2, C = 2 * Math.PI * r;
  const total = parts.reduce((s, p) => s + (p.fund ?? 0), 0) || 1;
  const gap = parts.length > 1 ? thick + 6 : 0;
  let acc = 0;
  const focus = on ?? 0;
  return (
    <div ref={ref} className={`fx-donut${on != null ? " focus" : ""}`}>
      <div className="fx-ring-wrap" style={{ width: size, height: size }}>
        <svg ref={svgRef} viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`${label}: ${parts.map((p) => `${p.label} ${pctF(p.fund ?? 0, lang)}`).join(", ")}`}>
          <defs>
            <filter id={`${id}g`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <circle r={r} cx={cx} cy={cx} fill="none" stroke="var(--fx-cell)" strokeWidth={thick} />
          <g filter={`url(#${id}g)`}>
            {parts.map((p, i) => {
              const len = ((p.fund ?? 0) / total) * C;
              const dash = Math.max(0.01, len - gap);
              const off = -(acc + gap / 2);
              acc += len;
              return (
                <circle key={p.label} r={r} cx={cx} cy={cx} fill="none" stroke={SLICE[i % SLICE.length]} strokeWidth={on === i ? thick + 6 : thick} strokeLinecap={parts.length > 1 ? "round" : "butt"}
                  strokeDasharray={`${dash} ${C}`} strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cx})`} className={`arc${on === i ? " on" : ""}`}
                  data-sweep={dash} data-circ={C} onPointerEnter={() => setOn(i)} onPointerLeave={() => setOn(null)} />
              );
            })}
          </g>
        </svg>
        <div className="ctr" aria-hidden="true">
          <div className="v g-fund">{parts[focus] ? pctF(parts[focus].fund ?? 0, lang, 0) : ""}</div>
          <div className="l">{parts[focus]?.label}</div>
        </div>
      </div>
      <div className="legend">
        {parts.map((p, i) => (
          <button type="button" key={p.label} className={on === i ? "on" : undefined} onPointerEnter={() => setOn(i)} onPointerLeave={() => setOn(null)} onFocus={() => setOn(i)} onBlur={() => setOn(null)}
            aria-label={`${p.label}: ${pctF(p.fund ?? 0, lang)}${p.index != null ? `, ${indexName} ${pctF(p.index, lang)}` : ""}`}>
            <i style={{ background: SLICE[i % SLICE.length], boxShadow: `0 0 10px ${SLICE[i % SLICE.length]}` }} />
            <span>{p.label}</span>
            <span className="p">{pctF(p.fund ?? 0, lang)}</span>
            <span className="ix">{p.index != null ? pctF(p.index, lang) : ""}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Ring gauge for a share (e.g. % positive months). */
export function Ring({ value, lang, label }: { value: number; lang: Locale; label: string }) {
  const [ref, , seen] = useNear<HTMLDivElement>();
  useEntrance(ref, seen);
  const id = useSvgId("rg");
  const r = 56, C = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
  return (
    <div ref={ref} className="fx-ring" role="img" aria-label={`${label}: ${pctF(v, lang, 0)}`}>
      <svg viewBox="0 0 132 132">
        <defs><linearGradient id={`${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--fund-from)" /><stop offset="1" stopColor="var(--fund-to)" /></linearGradient></defs>
        <circle cx="66" cy="66" r={r} fill="none" stroke="var(--fx-cell)" strokeWidth="10" />
        <circle cx="66" cy="66" r={r} fill="none" stroke={`url(#${id})`} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${v * C} ${C}`}
          data-sweep={v * C} data-circ={C} style={{ filter: "drop-shadow(0 0 8px var(--fund))" }} />
      </svg>
      <div className="v g-fund" aria-hidden="true">{pctF(v, lang, 0)}</div>
    </div>
  );
}
