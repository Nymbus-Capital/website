"use client";
/**
 * ConceptPanel.tsx — one animated panel of /critical-concepts (overlay, futures, coverage): the scan-panel chrome,
 * a lazily created canvas engine, keyboard-accessible controls (play / pause, one button per step, arrow keys), the
 * figures strip and a visible caption. Same contract as the home panels: nothing loads until the panel is near the
 * viewport, the loop pauses off screen / in a hidden tab, one still frame per step under reduced motion (live) or
 * Data Saver, 15 fps on coarse pointers; test hooks data-frames / data-running / data-step on the canvas host.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { Pause, Play } from "lucide-react";
import { reducedMotion } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { CC } from "./concepts-copy";
import type { Runner } from "./runner";
import "@/components/site/fx/fx.css";
import "./concepts.css";

export type ConceptId = "overlay" | "futures" | "coverage";

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

type Lang = "en" | "fr";
const pickAll = <T extends Record<string, { en: string; fr: string }>>(o: T, k: Lang) =>
  Object.fromEntries(Object.entries(o).map(([key, v]) => [key, v[k]])) as { [K in keyof T]: string };

/** Creates the engine of a concept (each engine is its own lazily loaded chunk). */
async function createEngine(id: ConceptId, canvas: HTMLCanvasElement, o: { still: boolean; maxFps?: number; lang: () => Lang; onReady: () => void; onStep: (s: number) => void }): Promise<Runner> {
  const base = { still: o.still, maxFps: o.maxFps, onReady: o.onReady, onStep: o.onStep };
  const mark = () => CC.watermark[o.lang()];
  if (id === "overlay") {
    const m = await import("./overlay-stack-engine");
    return m.createOverlayStack(canvas, { ...base, labels: () => ({ ...pickAll(CC.overlay.canvas, o.lang()), watermark: mark() }) });
  }
  if (id === "futures") {
    const m = await import("./futures-engine");
    return m.createFutures(canvas, { ...base, labels: () => ({ ...pickAll(CC.futures.canvas, o.lang()), watermark: mark() }) });
  }
  const m = await import("./coverage-engine");
  return m.createCoverage(canvas, { ...base, labels: () => ({ ...pickAll(CC.coverage.canvas, o.lang()), watermark: mark() }) });
}

export function ConceptPanel({ id }: { id: ConceptId }) {
  const { locale, pick } = useTranslation();
  const copy = CC[id];
  const canvas = useRef<HTMLCanvasElement>(null);
  const steps = useRef<HTMLOListElement>(null);
  const lang = useRef<Lang>(locale);
  const runner = useRef<Runner | null>(null);
  const playingRef = useRef(true);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [still, setStill] = useState(false);
  const reduced = useReducedMotion();
  lang.current = locale;

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    let engine: Runner | null = null;
    let dead = false;
    const isStill = reduced || saveData();
    setStill(isStill);
    const boot = () => {
      createEngine(id, c, {
        still: isStill,
        ...(coarsePointer() ? { maxFps: 15 } : {}),
        lang: () => lang.current,
        onReady: () => setReady(true),
        onStep: (s) => setStep(s),
      }).then((r) => {
        if (dead) { r.destroy(); return; }
        engine = r;
        runner.current = r;
        if (!playingRef.current) r.setPlaying(false);
      }).catch(() => {});
    };
    if (typeof IntersectionObserver === "undefined") { boot(); return () => { dead = true; engine?.destroy(); runner.current = null; }; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); boot(); } }, { rootMargin: "300px" });
    io.observe(c);
    return () => { dead = true; io.disconnect(); engine?.destroy(); runner.current = null; };
  }, [reduced, id]);
  useEffect(() => { runner.current?.redraw(); }, [locale]);

  const toggle = useCallback(() => {
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
    runner.current?.setPlaying(next);
  }, []);
  const go = useCallback((s: number) => {
    const k = Math.max(0, Math.min(copy.steps.length - 1, s));
    setStep(k);
    runner.current?.goto(k);
  }, [copy.steps.length]);
  const onKey = (e: KeyboardEvent<HTMLOListElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const n = copy.steps.length;
    const k = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : (step + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    go(k);
    steps.current?.querySelectorAll<HTMLButtonElement>("button")[k]?.focus();
  };

  const statCls = id === "futures" ? "cc-stats-3 cc-stats-text" : "";
  return (
    <figure className="sc-fig cc-fig" data-testid={`concept-${id}`}>
      <div className={`sc-panel cc-panel ${ready ? "on" : ""}`} data-testid={`${id}-panel`}>
        <div className="sc-bar" aria-hidden="true">
          <span className="sc-dots"><i /><i /><i /></span>
          <span className="sc-title">{pick(copy.panel)}</span>
          <span className="sc-chip">{pick(copy.chip)}</span>
        </div>
        {/* only the drawing is an image: controls and figures stay readable */}
        <div className="sc-body" data-testid={`${id}-host`} role="img" aria-label={pick(copy.alt)}>
          <canvas ref={canvas} className={`cc-canvas cc-canvas-${id}`} aria-hidden="true" data-testid={`${id}-canvas`} />
        </div>
        <div className="cc-ctrl" role="group" aria-label={`${pick(CC.controls.group)} · ${pick(copy.panel)}`}>
          {still ? null : (
            <button type="button" className="cc-play" onClick={toggle} aria-label={pick(playing ? CC.controls.pause : CC.controls.play)} data-testid={`${id}-play`}>
              {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            </button>
          )}
          <ol className="cc-steps" ref={steps} onKeyDown={onKey}>
            {copy.steps.map((s, i) => (
              <li key={i}>
                <button type="button" onClick={() => go(i)} aria-current={i === step ? "step" : undefined} data-testid={`${id}-step-${i}`}>
                  <span className="n" aria-hidden="true">{i + 1}</span>
                  <span className="sr-only">{pick(CC.controls.step)} {i + 1}, </span>
                  <span className="t">{pick(s)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <dl className={`sc-stats cc-stats ${statCls}`}>
          {copy.stats.map((s, i) => (
            <div className="sc-stat" key={i}><dt>{pick(s.label)}</dt><dd className="tabnum">{pick(s.value)}</dd></div>
          ))}
        </dl>
      </div>
      <figcaption className="fine sc-cap" data-testid={`${id}-caption`}>{pick(copy.caption)}</figcaption>
    </figure>
  );
}
