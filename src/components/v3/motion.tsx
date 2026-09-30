"use client";
/**
 * v3 motion primitives — the web port of nymbus-decks src/v3/anim.ts:
 *  - titles rise word by word out of a blur
 *  - everything else floats up with blur, cards pop in with a spring, key figures zoom out of a blur
 *  - figures count up; screens scale down and blur as the next one slides over them (keynote page swap)
 * All of it is skipped under prefers-reduced-motion, and content stays visible without JS (html.js gate).
 */
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

export const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
export const SPRING = "cubic-bezier(0.34, 1.4, 0.64, 1)";

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ one shared scroll loop
 * Every scroll-linked effect (screen swap, iris, light-trail scrub, useScrub) subscribes here: one passive
 * scroll/resize listener and at most one rAF per frame for the whole page, instead of one per component.
 */
type FrameFn = (vh: number) => void;
const subscribers = new Set<FrameFn>();
let loopRaf = 0;
let loopBound = false;
function runFrame() {
  loopRaf = 0;
  const vh = window.innerHeight;
  subscribers.forEach((fn) => fn(vh));
}
function schedule() { if (!loopRaf) loopRaf = requestAnimationFrame(runFrame); }
/** Subscribe to the shared scroll/resize loop; the callback runs once right away. Returns the unsubscribe. */
export function onScrollFrame(fn: FrameFn): () => void {
  subscribers.add(fn);
  if (!loopBound && typeof window !== "undefined") {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    loopBound = true;
  }
  fn(window.innerHeight);
  return () => {
    subscribers.delete(fn);
    if (!subscribers.size && loopBound) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      loopBound = false;
      if (loopRaf) { cancelAnimationFrame(loopRaf); loopRaf = 0; }
    }
  };
}

/**
 * Fire once when the element enters the viewport: `threshold` of it is visible, or it fills a quarter of
 * the viewport (so elements taller than the screen still trigger).
 */
export function useInView<T extends Element>(opts: { margin?: string; threshold?: number } = {}) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const t = opts.threshold ?? 0.12;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting && (e.intersectionRatio >= t || e.intersectionRect.height >= window.innerHeight * 0.25));
        if (hit) { setSeen(true); io.disconnect(); }
      },
      { rootMargin: opts.margin ?? "0px 0px -12% 0px", threshold: Array.from(new Set([0, Math.min(1, Math.max(0, t)), 0.25, 0.5])).sort((a, b) => a - b) },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, opts.margin, opts.threshold]);
  return [ref, seen] as const;
}

type Kind = "float" | "pop" | "zoom";
const FRAMES: Record<Kind, Keyframe[]> = {
  float: [{ opacity: 0, transform: "translateY(28px)", filter: "blur(8px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
  pop: [{ opacity: 0, transform: "translateY(60px) scale(.92)" }, { opacity: 1, transform: "none" }],
  zoom: [{ opacity: 0, transform: "scale(.7)", filter: "blur(20px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
};
const DUR: Record<Kind, [number, string]> = { float: [950, EASE], pop: [1000, SPRING], zoom: [1200, EASE] };

/**
 * Reveals its direct children (or itself with `self`) as they scroll into view, staggered.
 *   <Reveal kind="pop" stagger={110}>{cards}</Reveal>
 *
 * Hidden-until-revealed is driven by attributes React owns on the container (`data-reveal` / `data-reveal-kids`
 * + `data-shown`), rendered on the server, so nothing flashes before hydration and a child whose className
 * changes later (active state, language switch) can never be hidden again.
 */
export function Reveal({
  children, as: Tag = "div", kind = "float", delay = 0, stagger = 110, self = false, className, style, id, role, threshold, margin, ...rest
}: {
  children: ReactNode; as?: ElementType; kind?: Kind; delay?: number; stagger?: number; self?: boolean;
  className?: string; style?: CSSProperties; id?: string; role?: string; threshold?: number; margin?: string;
} & Record<`data-${string}` | `aria-${string}`, string | undefined>) {
  const [ref, seen] = useInView<HTMLElement>({ threshold, margin });
  // layout effect: the entrance animation is in place before the frame that shows the element
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !seen) return;
    const targets = self ? [el] : (Array.from(el.children) as HTMLElement[]);
    const [dur, easing] = DUR[kind];
    targets.forEach((t, i) => {
      t.classList.add("in"); // legacy hook (older CSS keyed on .in)
      if (reducedMotion()) return;
      t.animate(FRAMES[kind], { duration: dur, delay: delay + i * stagger, easing, fill: "backwards" });
    });
  }, [seen, kind, delay, stagger, self, ref]);
  const gate = self ? { "data-reveal": "" } : { "data-reveal-kids": "" };
  return <Tag ref={ref} className={className} style={style} id={id} role={role} {...rest} {...gate} data-shown={seen ? "" : undefined}>{children}</Tag>;
}

/**
 * Display title whose words rise out of a blur one after the other (the deck's live word reveal).
 * Words of `accent` carry the brand gradient (`gradient` puts it on every word); `breakBeforeAccent`
 * sets the accent on its own line. The words rise again when the text changes (language switch).
 */
export function RevealTitle({
  text, accent, as: Tag = "h2", className = "h2", delay = 0, step = 70, style, id, gradient = false, breakBeforeAccent = false,
}: {
  text: string; accent?: string; as?: ElementType; className?: string; delay?: number; step?: number; style?: CSSProperties;
  id?: string; gradient?: boolean; breakBeforeAccent?: boolean;
}) {
  const [ref, seen] = useInView<HTMLElement>({ threshold: 0.2 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !seen) return;
    el.querySelectorAll<HTMLElement>(".w").forEach((w, i) => {
      w.style.opacity = "1";
      if (reducedMotion()) return;
      w.style.willChange = "transform, opacity, filter";
      const a = w.animate(
        [{ opacity: 0, transform: "translateY(.45em) scale(.98)", filter: "blur(12px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
        { duration: 1000, delay: delay + i * step, easing: EASE, fill: "backwards" },
      );
      a.onfinish = () => { w.style.willChange = ""; };
    });
  }, [seen, delay, step, ref, text, accent]);
  const words = (s: string, cls?: string, offset = 0) =>
    s.split(/(\s+)/).map((part, i) =>
      /^\s+$/.test(part) ? part : <span key={`${offset}-${i}`} className={cls ? `w ${cls}` : "w"}>{part}</span>,
    );
  const aria = accent ? `${text} ${accent}` : text;
  return (
    <Tag ref={ref} className={`reveal-title ${className}`} style={style} id={id} aria-label={aria} data-shown={seen ? "" : undefined}>
      <span aria-hidden="true">
        {words(text, gradient ? "grad" : undefined)}
        {accent ? <>{breakBeforeAccent ? <br /> : " "}{words(accent, "grad", 1000)}</> : null}
      </span>
    </Tag>
  );
}

/** Formats a number as the deck does (tabular, minus sign as U+2212). */
export function fmt(v: number, o: { decimals?: number; pct?: boolean; sign?: boolean; prefix?: string; suffix?: string; lang?: "en" | "fr" } = {}) {
  const d = o.decimals ?? 1;
  const x = o.pct ? v * 100 : v;
  const s = Math.abs(x).toLocaleString(o.lang === "fr" ? "fr-CA" : "en-CA", { minimumFractionDigits: d, maximumFractionDigits: d });
  const zero = Number(Math.abs(x).toFixed(d)) === 0; // "−0.0%" reads as a loss: no sign once rounded to zero
  const sign = zero ? "" : x < 0 ? "−" : o.sign && x > 0 ? "+" : "";
  const pct = o.pct ? (o.lang === "fr" ? " %" : "%") : "";
  return `${sign}${o.prefix ?? ""}${s}${pct}${o.suffix ?? ""}`;
}

/** Number that counts up from 0 when it scrolls into view (ease-out cubic, like countEl in the deck). */
export function CountUp({
  value, decimals = 1, pct = false, sign = false, prefix, suffix, lang = "en", duration = 1400, delay = 0, className, style,
}: {
  value: number; decimals?: number; pct?: boolean; sign?: boolean; prefix?: string; suffix?: string; lang?: "en" | "fr";
  duration?: number; delay?: number; className?: string; style?: CSSProperties;
}) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const final = fmt(value, { decimals, pct, sign, prefix, suffix, lang });
  useEffect(() => {
    const el = ref.current;
    if (!el || !seen || reducedMotion()) return;
    let raf = 0;
    const t0 = performance.now() + delay;
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0) / duration));
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(value * e, { decimals, pct, sign, prefix, suffix, lang });
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    el.textContent = fmt(0, { decimals, pct, sign: false, prefix, suffix, lang });
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value, decimals, pct, sign, prefix, suffix, lang, duration, delay, ref]);
  return <span ref={ref} className={className} style={style}>{final}</span>;
}

/**
 * Odometer: the figure rolls in digit by digit (each digit a vertical strip 0-9, spring easing, 60 ms stagger
 * from the right), tabular digits so nothing shifts. Same props as <CountUp/>. Screen readers get the final
 * formatted value from a visually hidden span (`.odo .sr-only`); the rolling digits are aria-hidden. Static under reduced motion or before it scrolls into view.
 *   <Odometer value={0.0412} pct sign decimals={1} lang={lang} />
 */
export function Odometer({
  value, decimals = 1, pct = false, sign = false, prefix, suffix, lang = "en", duration = 1400, delay = 0, className, style,
}: {
  value: number; decimals?: number; pct?: boolean; sign?: boolean; prefix?: string; suffix?: string; lang?: "en" | "fr";
  duration?: number; delay?: number; className?: string; style?: CSSProperties;
}) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const final = fmt(value, { decimals, pct, sign, prefix, suffix, lang });
  const [roll, setRoll] = useState(false);
  useLayoutEffect(() => { if (seen && !reducedMotion()) setRoll(true); }, [seen]);
  const chars = Array.from(final);
  let digitIndex = 0;
  const nDigits = chars.filter((c) => /\d/.test(c)).length;
  return (
    <span ref={ref} className={`odo ${className ?? ""}`} style={style} data-rolling={roll ? "" : undefined}>
      <span className="sr-only">{final}</span>
      <span className="odo-v" aria-hidden="true">
      {chars.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i} className="odo-c">{c}</span>;
        const d = Number(c);
        const order = nDigits - 1 - digitIndex++; // rightmost digit first
        return (
          <span key={i} className="odo-d">
            <span className="odo-ph">{c}</span>
            <span className="odo-s" style={{ ["--d" as string]: d, ["--t" as string]: `${duration}ms`, ["--w" as string]: `${delay + order * 60}ms` }}>
              {"0123456789".split("").map((x) => <span key={x}>{x}</span>)}
            </span>
          </span>
        );
      })}
      </span>
    </span>
  );
}

/**
 * The deck's chapter light trail: a glowing blue→cyan stroke that draws itself.
 * `scrub`: the drawing follows the scroll position of the parent screen instead of playing once.
 */
export function LightTrail({ d, className, scrub = false, width = 7, viewBox = "0 0 1280 720" }: {
  d?: string; className?: string; scrub?: boolean; width?: number; viewBox?: string;
}) {
  const path = d ?? "M-40 600 C 300 575, 560 575, 700 560 C 860 540, 820 470, 560 462 C 470 460, 420 470, 400 480";
  const ref = useRef<SVGPathElement>(null);
  // stable across server and client render (no hydration mismatch), safe inside url(#…)
  const uid = `t${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    if (reducedMotion()) { el.style.strokeDashoffset = "0"; return; }
    el.style.strokeDashoffset = `${len}`;
    const host = el.closest(".screen, .section, [data-trail-host]") as HTMLElement | null;
    if (scrub && host) {
      // the trail is already a quarter drawn when the screen enters: a chapter screen is never empty
      return onScrollFrame((vh) => {
        const r = host.getBoundingClientRect();
        const k = 0.25 + 0.75 * Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
        el.style.strokeDashoffset = `${len * (1 - k)}`;
      });
    }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) {
        el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 2200, easing: EASE, fill: "forwards" });
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [scrub]);
  return (
    <svg className={className} viewBox={viewBox} preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1 }}>
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a73e8" stopOpacity="0" /><stop offset=".3" stopColor="#1a73e8" />
          <stop offset=".6" stopColor="#4c8dff" /><stop offset=".85" stopColor="#4fd1ff" /><stop offset="1" stopColor="#e8f4ff" stopOpacity=".4" />
        </linearGradient>
        <filter id={`${uid}f`} x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path ref={ref} d={path} fill="none" stroke={`url(#${uid}g)`} strokeWidth={width} strokeLinecap="round" filter={`url(#${uid}f)`} />
    </svg>
  );
}

/** Soft light that follows the pointer inside the nearest .screen. */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || reducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    host.addEventListener("pointermove", move);
    return () => host.removeEventListener("pointermove", move);
  }, []);
  return <div ref={ref} className="spot" aria-hidden="true" />;
}

/**
 * Keynote page swap on scroll: while a screen scrolls out under the next one it recedes
 * (scale .94, a light blur on desktop, fade) — the same move as swapPages() in the deck, scrubbed by the scroll.
 * Screens also enter through an "iris": their rounded frame opens from inset(4% 3% round 40px) to full size.
 * The iris uses CSS scroll-driven animations where supported (globals.css, `.screen[data-swap]`) and this
 * loop otherwise. Mount once per page; it drives every `.screen[data-swap]`.
 */
export function ScreenSwap() {
  useEffect(() => {
    if (reducedMotion()) return;
    const screens = Array.from(document.querySelectorAll<HTMLElement>(".screen[data-swap]"));
    if (!screens.length) return;
    // blur repaints a whole screen each frame: only on large, fine-pointer displays, and capped at 4px
    const blur = !window.matchMedia("(pointer: coarse)").matches && window.innerWidth >= 1024;
    const cssIris = typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()");
    const first = screens[0];
    return onScrollFrame((vh) => {
      for (const s of screens) {
        const r = s.getBoundingClientRect();
        // exit: 0 while the bottom edge is below 60 % of the viewport, 1 when it reaches the top
        const k = Math.min(1, Math.max(0, (vh * 0.6 - r.bottom) / (vh * 0.6)));
        if (k <= 0.001) {
          if (s.style.transform) { s.style.transform = ""; s.style.filter = ""; s.style.opacity = ""; s.style.willChange = ""; }
        } else {
          s.style.willChange = "transform, opacity";
          s.style.transform = `scale(${1 - 0.06 * k})`;
          s.style.filter = blur ? `blur(${(4 * k).toFixed(2)}px)` : "";
          s.style.opacity = `${1 - 0.6 * k}`;
        }
        // entrance iris (JS fallback): 0 when the top edge is at the bottom of the viewport, 1 at 55 %
        if (!cssIris && s !== first) {
          const e = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.45)));
          s.style.clipPath = e >= 1 ? "" : `inset(${(4 * (1 - e)).toFixed(2)}% ${(3 * (1 - e)).toFixed(2)}% round ${(28 + 12 * (1 - e)).toFixed(1)}px)`;
        }
      }
    });
  }, []);
  return null;
}

/**
 * Scroll-linked progress of an element: calls `onProgress(k)` with k = 0 when its top enters the bottom of
 * the viewport and 1 when its centre reaches the centre of the viewport (rAF-throttled, passive listener).
 * Under reduced motion it is called once with 1.
 *   const ref = useScrub<HTMLDivElement>((k, el) => el.style.setProperty("--p", String(k)));
 */
export function useScrub<T extends HTMLElement>(onProgress: (k: number, el: T) => void) {
  const ref = useRef<T>(null);
  const cb = useRef(onProgress);
  useEffect(() => { cb.current = onProgress; });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) { cb.current(1, el); return; }
    return onScrollFrame((vh) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return; // far away: skip the work
      cb.current(Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.5 + r.height * 0.5))), el);
    });
  }, []);
  return ref;
}

/**
 * Card that tilts towards the pointer and carries a light under it (`--mx`/`--my` in px, `--rx`/`--ry` in deg).
 * Inert on touch devices and under reduced motion.
 */
export function useTilt<T extends HTMLElement>(max = 6) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
        el.style.setProperty("--rx", `${((0.5 - y) * max).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${((x - 0.5) * max).toFixed(2)}deg`);
      });
    };
    const leave = () => { cancelAnimationFrame(raf); el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); cancelAnimationFrame(raf); };
  }, [max]);
  return ref;
}
