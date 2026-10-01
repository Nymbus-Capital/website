"use client";
/** Chart tooltip (the `.tip` of globals.css): positioned inside the chart host, flips at the edges. */
import { useLayoutEffect, useRef, useState } from "react";

export interface TipRow { cls: "fund" | "index" | "va"; label: string; value: string }
export interface TipState { x: number; y: number; title: string; rows: TipRow[] }

export function Tip({ tip, hostWidth }: { tip: TipState | null; hostWidth: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const last = useRef<TipState | null>(null);
  if (tip) last.current = tip;
  const t = tip ?? last.current;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !tip) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    let left = tip.x + 16, top = tip.y - h - 14;
    if (left + w > hostWidth) left = tip.x - w - 16;
    if (left < 0) left = Math.max(0, Math.min(hostWidth - w, tip.x - w / 2));
    if (top < -8) top = tip.y + 18;
    setPos({ left, top });
  }, [tip, hostWidth]);
  return (
    <div ref={ref} className={`tip${tip ? " on" : ""}`} style={{ left: pos.left, top: pos.top }} aria-hidden="true">
      {t ? (
        <>
          <b>{t.title}</b>
          {t.rows.map((r) => (
            <div className="r" key={r.cls + r.label}>
              <span><i className={r.cls} />{r.label}</span>
              <em>{r.value}</em>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}
