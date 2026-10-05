"use client";
/**
 * overlay.tsx — the home "diversifying engines" panel (multi-strategy, futures overlay): a canvas illustration of
 * generated traditional markets (equities, bonds) falling together in down months while our strategies move on their
 * own, with a concept down-month correlation heatmap. No counters (removed at Gabriel's request, 2026-10-04).
 * Same contract as the analysis scan: lazy engine, paused off-screen / hidden tab, one still frame under reduced
 * motion (live), Data Saver → still, coarse pointer → 15 fps, test hooks data-frames / data-running.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { recoverFromChunkError } from "./chunk-recover";
import { Layers, Shuffle, TrendingDown } from "lucide-react";
import { reducedMotion, Reveal } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { OVERLAY_COPY as C } from "./overlay-copy";
import { ENGINES, MARKETS } from "./overlay-model";
import type { OverlayLabels } from "./overlay-engine";
import "./fx.css";
import "./overlay.css";

const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, reducedMotion, () => false);
}
const saveData = (): boolean => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
const coarsePointer = (): boolean => window.matchMedia("(pointer: coarse)").matches;

export function OverlayEngines() {
  const { locale, pick } = useTranslation();
  const canvas = useRef<HTMLCanvasElement>(null);
  const lang = useRef(locale);
  const viz = useRef<{ redraw(): void } | null>(null);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();
  lang.current = locale;
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    let engine: { destroy(): void; redraw(): void } | null = null;
    let dead = false;
    const labels = (): OverlayLabels => {
      const k = lang.current === "fr" ? "fr" : "en";
      const cv = C.canvas;
      return {
        markets: MARKETS.map((m) => m.label[k]), marketsShort: MARKETS.map((m) => m.short[k]),
        combined: cv.combined[k], trad: cv.trad[k], strategies: cv.strategies[k],
        down: cv.down[k], lit: cv.lit[k], heat: cv.heat[k], opposite: cv.opposite[k], low: cv.low[k], together: cv.together[k],
        engines: ENGINES.map((e) => e.label[k]),
      };
    };
    const boot = () => {
      import("./overlay-engine").then((m) => {
        if (dead) return;
        engine = m.createOverlay(c, {
          still: reduced || saveData(),
          ...(coarsePointer() ? { maxFps: 15 } : {}),
          watermark: () => (lang.current === "fr" ? C.watermark.fr : C.watermark.en),
          lang: () => lang.current,
          labels,
          onReady: () => setReady(true),
        });
        viz.current = engine;
      }).catch((e) => recoverFromChunkError(e, "engines band"));
    };
    if (typeof IntersectionObserver === "undefined") { boot(); return () => { dead = true; engine?.destroy(); }; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); boot(); } }, { rootMargin: "300px" });
    io.observe(c);
    return () => { dead = true; io.disconnect(); engine?.destroy(); viz.current = null; };
  }, [reduced]);
  useEffect(() => { viz.current?.redraw(); }, [locale]);
  const icons = [Layers, Shuffle, TrendingDown];
  return (
    <>
      <figure className="sc-fig ov-fig" data-testid="overlay-figure">
        <div className={`sc-panel ov-panel ${ready ? "on" : ""}`} data-testid="overlay-panel">
          <div className="sc-bar" aria-hidden="true">
            <span className="sc-dots"><i /><i /><i /></span>
            <span className="sc-title">{pick(C.panel)}</span>
            <span className="sc-chip">{pick(C.illustration)}</span>
          </div>
          <div className="sc-body" data-testid="overlay-host" role="img" aria-label={pick(C.alt)}>
            <canvas ref={canvas} className="ov-canvas" aria-hidden="true" data-testid="overlay-canvas" />
          </div>
        </div>
        <figcaption className="fine sc-cap" data-testid="overlay-caption">{pick(C.caption)}</figcaption>
      </figure>
      <Reveal className="sc-trio" kind="pop" stagger={120}>
        {C.trio.map((t, i) => {
          const I = icons[i];
          return (
            <div key={i} className="sc-pillar">
              <span className="bubble" aria-hidden="true" style={{ ["--size" as string]: "44px", ["--bc" as string]: ["#00a3e0", "#6d5bd0", "#0f9d8a"][i] }}><I /></span>
              <div>
                <h3 className="h4">{pick(t.title)}</h3>
                <p>{pick(t.text)}</p>
              </div>
            </div>
          );
        })}
      </Reveal>
    </>
  );
}
