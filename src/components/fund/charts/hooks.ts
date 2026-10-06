"use client";
/**
 * Chart plumbing: container width (ResizeObserver), lazy mount near the viewport, safe SVG ids and the
 * v2 chart entrance choreography (bars grow from the axis, lines draw, areas fade, end dots pop) ported
 * from nymbus-decks src/v2/viz.ts#animateViz onto the Web Animations API. Everything is skipped under
 * prefers-reduced-motion.
 */
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { EASE, reducedMotion, useNoObserver } from "@/components/motion/motion";

const BACK = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const SWAP = "cubic-bezier(0.65, 0, 0.35, 1)";

/** Width of an element, kept current with a ResizeObserver (0 until measured). */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(Math.round(el.getBoundingClientRect().width));
    if (typeof ResizeObserver === "undefined") return;
    let raf = 0;
    const ro = new ResizeObserver((entries) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const nw = Math.round(entries[0]?.contentRect.width ?? 0);
        setW((old) => (Math.abs(old - nw) >= 1 ? nw : old));
      });
    });
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return [ref, w] as const;
}

/**
 * True once the element comes within `margin` of the viewport: heavy charts mount then (their host keeps
 * a fixed height meanwhile, so nothing shifts). A second flag says when it is actually visible, to start
 * the entrance.
 */
export function useNear<T extends Element>(margin = "400px 0px") {
  const ref = useRef<T>(null);
  const [isNear, setNear] = useState(false);
  const [isSeen, setSeen] = useState(false);
  const noObserver = useNoObserver();
  const near = isNear || noObserver, seen = isSeen || noObserver;
  useEffect(() => {
    const el = ref.current;
    if (!el || noObserver) return;
    const a = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setNear(true); a.disconnect(); } }, { rootMargin: margin });
    const b = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setSeen(true); b.disconnect(); } }, { rootMargin: "0px 0px -15% 0px", threshold: 0.15 });
    a.observe(el); b.observe(el);
    return () => { a.disconnect(); b.disconnect(); };
  }, [margin, noObserver]);
  return [ref, near, seen] as const;
}

/** An id usable inside url(#…) (React ids contain characters CSS does not like). */
export function useSvgId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/** Plays the chart entrance on `root`. Returns a cleanup that cancels running animations. */
function playEntrance(root: Element | null, delay = 0): () => void {
  if (!root || reducedMotion()) return () => {};
  const anims: Animation[] = [];
  const push = (a: Animation | undefined) => { if (a) anims.push(a); };
  root.querySelectorAll<SVGElement | HTMLElement>("[data-grow]").forEach((el, i) => {
    const dir = el.dataset.grow;
    el.style.transformBox = "fill-box";
    if (dir === "right") {
      el.style.transformOrigin = "0% 50%";
      push(el.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1000, delay: delay + 120 + i * 55, easing: EASE, fill: "backwards" }));
    } else {
      el.style.transformOrigin = dir === "down" ? "50% 0%" : "50% 100%";
      push(el.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 950, delay: delay + 120 + i * 40, easing: EASE, fill: "backwards" }));
    }
  });
  root.querySelectorAll<SVGPathElement>("[data-draw]").forEach((p, i) => {
    const len = typeof p.getTotalLength === "function" ? p.getTotalLength() : 0;
    if (!len) return;
    p.style.strokeDasharray = `${len} ${len}`;
    const a = p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1800, delay: delay + 100 + i * 200, easing: SWAP, fill: "backwards" });
    const done = () => { p.style.strokeDasharray = p.dataset.dash ?? ""; };
    a.onfinish = done; a.oncancel = done;
    push(a);
  });
  root.querySelectorAll<SVGElement | HTMLElement>("[data-fade]").forEach((el) => {
    push(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, delay: delay + 700, easing: EASE, fill: "backwards" }));
  });
  root.querySelectorAll<SVGElement | HTMLElement>("[data-pop]").forEach((el, i) => {
    el.style.transformBox = "fill-box";
    el.style.transformOrigin = "50% 50%";
    push(el.animate([{ transform: "scale(0)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 650, delay: delay + 1500 + i * 60, easing: BACK, fill: "backwards" }));
  });
  root.querySelectorAll<SVGElement | HTMLElement>("[data-lab]").forEach((el, i) => {
    push(el.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 600, delay: delay + 650 + i * 30, easing: EASE, fill: "backwards" }));
  });
  root.querySelectorAll<SVGCircleElement>("[data-sweep]").forEach((c, i) => {
    const dash = Number(c.dataset.sweep), C = Number(c.dataset.circ);
    if (!dash || !C) return;
    push(c.animate([{ strokeDasharray: `0.01 ${C}` }, { strokeDasharray: `${dash} ${C}` }], { duration: 1100, delay: delay + 150 + i * 220, easing: EASE, fill: "backwards" }));
  });
  root.querySelectorAll<HTMLElement>("[data-cell]").forEach((c) => {
    const k = Number(c.dataset.cell || 0);
    push(c.animate([{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], { duration: 520, delay: delay + 60 + k * 14, easing: EASE, fill: "backwards" }));
  });
  return () => anims.forEach((a) => a.cancel());
}

/** Runs the entrance once `seen` turns true and the chart has a width; replays when `key` changes. */
export function useEntrance(root: RefObject<Element | null>, ready: boolean, key: unknown = 0, delay = 0) {
  const played = useRef<unknown>(Symbol("none"));
  useEffect(() => {
    if (!ready || played.current === key) return;
    played.current = key;
    // no cleanup: under StrictMode the effect re-runs, and cancelling would skip the entrance
    playEntrance(root.current, delay);
  }, [ready, key, root, delay]);
}
