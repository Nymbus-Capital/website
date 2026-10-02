"use client";
/**
 * fx.tsx — site-wide motion pieces, all decorative (aria-hidden), CPU-light and off under reduced motion:
 *   <DataField/>    canvas lattice of dots with travelling waves behind a hero (lazy: the engine is only loaded and
 *                   started once it is near the viewport; paused off-screen and in hidden tabs)
 *   <Divider/>      hairline between sections that draws itself from the centre, then a light runs along it
 *   <Parallax/>     decorative glow that drifts against the scroll
 *   <FxEffects/>    mounted once: magnetic buttons, card spotlight following the pointer, scroll progress line
 *   <AnalysisScan/> the home "analysis scan" panel (large table of rows scanned by a light, with counters)
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Cpu, FlaskConical, Landmark } from "lucide-react";
import { onScrollFrame, reducedMotion, Reveal, useInView } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { SCAN_COPY as C } from "./scan-copy";
import { FACTORS } from "./scan-model";
import "./fx.css";

/* ------------------------------------------------------------------ data field backdrop */

export function DataField({ className, strength = 1 }: { className?: string; strength?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    let engine: { destroy(): void } | null = null;
    let dead = false;
    const boot = () => {
      import("./datafield-engine").then((m) => {
        if (dead) return;
        engine = m.createDataField(c, { still: reducedMotion(), strength });
        setOn(true);
      }).catch(() => {});
    };
    // lazy: nothing is loaded or drawn until the hero is (nearly) on screen
    if (typeof IntersectionObserver === "undefined") { boot(); return () => { dead = true; engine?.destroy(); }; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); boot(); } }, { rootMargin: "200px" });
    io.observe(c);
    return () => { dead = true; io.disconnect(); engine?.destroy(); };
  }, [strength]);
  return (
    <div className={`dfield ${on ? "on" : ""} ${className ?? ""}`} aria-hidden="true" data-testid="data-field">
      <canvas ref={ref} />
    </div>
  );
}

/* ------------------------------------------------------------------ section divider */

export function Divider({ className }: { className?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>({ threshold: 0.5, margin: "0px 0px -5% 0px" });
  return <span ref={ref} className={`sec-divider ${className ?? ""}`} data-shown={seen ? "" : undefined} aria-hidden="true"><i /></span>;
}

/* ------------------------------------------------------------------ parallax glow */

/** Decorative blurred light that drifts with the scroll (`speed` 0.1 = 10 % of the scroll distance, opposite way). */
export function Parallax({ className, speed = 0.12, style }: { className?: string; speed?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    let near = true;
    const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((es) => { near = es.some((e) => e.isIntersecting); }, { rootMargin: "300px" }) : null;
    io?.observe(el);
    const off = onScrollFrame((vh) => {
      if (!near) return;
      const r = el.getBoundingClientRect();
      const d = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0)`;
    });
    return () => { off(); io?.disconnect(); };
  }, [speed]);
  return <span ref={ref} className={`parallax ${className ?? ""}`} style={style} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ global pointer effects */

/**
 * Mounted once in the site shell. Delegated listeners (no per-element handlers): buttons lean a few pixels
 * towards a mouse pointer; cards get a soft light under it (--mx / --my); a hairline shows the scroll progress.
 * Inert for touch and for prefers-reduced-motion (the progress line then only reflects the scroll position).
 */
export function FxEffects() {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    return onScrollFrame(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)).toFixed(4) : 0})`;
    });
  }, []);
  useEffect(() => {
    if (reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    let lastBtn: HTMLElement | null = null;
    let ev: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const e = ev;
      if (!e) return;
      const t = e.target instanceof Element ? e.target : null;
      const btn = t?.closest<HTMLElement>(".btn:not([disabled])") ?? null;
      if (lastBtn && lastBtn !== btn) { lastBtn.style.removeProperty("--tx"); lastBtn.style.removeProperty("--ty"); }
      lastBtn = btn;
      if (btn) {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        btn.style.setProperty("--tx", `${(Math.max(-1, Math.min(1, dx)) * 6).toFixed(1)}px`);
        btn.style.setProperty("--ty", `${(Math.max(-1, Math.min(1, dy)) * 4).toFixed(1)}px`);
      }
      const card = t?.closest<HTMLElement>(".card, .sc-pillar");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--sx", `${(e.clientX - r.left).toFixed(0)}px`);
        card.style.setProperty("--sy", `${(e.clientY - r.top).toFixed(0)}px`);
      }
    };
    const onMove = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; ev = e; if (!raf) raf = requestAnimationFrame(apply); };
    const onLeave = () => { if (lastBtn) { lastBtn.style.removeProperty("--tx"); lastBtn.style.removeProperty("--ty"); lastBtn = null; } };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => { document.removeEventListener("pointermove", onMove); document.documentElement.removeEventListener("pointerleave", onLeave); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return <span ref={bar} className="scroll-progress" aria-hidden="true" data-testid="scroll-progress" />;
}

/* ------------------------------------------------------------------ analysis scan */

export function AnalysisScan() {
  const { locale, pick } = useTranslation();
  const canvas = useRef<HTMLCanvasElement>(null);
  const dp = useRef<HTMLElement>(null);
  const sec = useRef<HTMLElement>(null);
  const sg = useRef<HTMLElement>(null);
  const lang = useRef(locale);
  const scan = useRef<{ redraw(): void } | null>(null);
  const [ready, setReady] = useState(false);
  lang.current = locale;
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    let engine: { destroy(): void; redraw(): void } | null = null;
    let dead = false;
    const boot = () => {
      import("./scan-engine").then((m) => {
        if (dead) return;
        engine = m.createScan(c, {
          still: reducedMotion(),
          lang: () => lang.current,
          counters: { datapoints: dp.current, securities: sec.current, signals: sg.current },
          onReady: () => setReady(true),
        });
        scan.current = engine;
      }).catch(() => {});
    };
    if (typeof IntersectionObserver === "undefined") { boot(); return () => { dead = true; engine?.destroy(); }; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); boot(); } }, { rootMargin: "300px" });
    io.observe(c);
    return () => { dead = true; io.disconnect(); engine?.destroy(); scan.current = null; };
  }, []);
  useEffect(() => { scan.current?.redraw(); }, [locale]);
  const stat = (label: string, node: ReactNode) => (
    <div className="sc-stat"><dt>{label}</dt><dd className="tabnum">{node}</dd></div>
  );
  const icons = [FlaskConical, Cpu, Landmark];
  return (
    <>
      <figure className={`sc-panel ${ready ? "on" : ""}`} data-testid="scan-panel" role="img" aria-label={pick(C.alt)}>
        <div className="sc-bar" aria-hidden="true">
          <span className="sc-dots"><i /><i /><i /></span>
          <span className="sc-title">{pick(C.panel)}</span>
          <span className="sc-chip">{pick(C.illustration)}</span>
        </div>
        <div className="sc-body" data-testid="scan-host">
          <canvas ref={canvas} className="sc-canvas" aria-hidden="true" data-testid="scan-canvas" />
        </div>
        <dl className="sc-stats">
          {stat(pick(C.counters.datapoints), <b ref={dp} data-testid="count-datapoints">0</b>)}
          {stat(pick(C.counters.securities), <b ref={sec} data-testid="count-securities">0</b>)}
          {stat(pick(C.counters.factors), <b data-testid="count-factors">{FACTORS.length}</b>)}
          {stat(pick(C.counters.signals), <b ref={sg} data-testid="count-signals">0</b>)}
        </dl>
      </figure>
      <p className="fine sc-cap">{pick(C.caption)}</p>
      <Reveal className="sc-trio" kind="pop" stagger={120}>
        {C.trio.map((t, i) => {
          const I = icons[i];
          return (
            <div key={i} className="sc-pillar">
              <span className="bubble" aria-hidden="true" style={{ ["--size" as string]: "44px", ["--bc" as string]: ["#1a73e8", "#0b8fd6", "#00a3e0"][i] }}><I /></span>
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
