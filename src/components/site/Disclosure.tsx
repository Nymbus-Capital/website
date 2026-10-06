"use client";
/**
 * Collapsible box for disclosure / legal walls of text (Gabriel 2026-10-05): collapsed to a few lines with the text
 * fading out and a static chevron centred on the bottom edge; the arrow (or a click on the box) opens it to full height.
 *
 * Compliance contract (docs/compliance-review.md § Collapsed disclosures):
 *  - the full text is always in the server-rendered HTML and the DOM — only clipped visually (max-height + overflow),
 *    never display:none / aria-hidden, so it is indexed, read by screen readers and printable;
 *  - print shows every box open (no fade, no arrow); without JavaScript every box is open (the collapsed style needs
 *    the `js` class that the head script sets before first paint, so there is no layout shift either way);
 *  - find-in-page, keyboard focus or Playwright scrolling into the clipped part scroll the clip → the box opens;
 *  - a URL hash naming one of `anchors` (e.g. "#disclosure") or an element inside the box opens it and scrolls to it,
 *    on load, on hashchange and on a same-page link click;
 *  - short blocks (< DISCLOSURE_MIN_CHARS) render as before: no box, no fade, no arrow (`display: contents`).
 */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { DISCLOSURE_MIN_CHARS, discState, enLength, hashId, hashOpens, isCollapsible, textLength, toggleLabel } from "./disclosure-logic";
import type { Locale } from "@/lib/i18n/config";

export function Disclosure({ children, en, lang, anchors = [], minChars = DISCLOSURE_MIN_CHARS, className, testId }: {
  children: ReactNode;
  /**
   * the block's ENGLISH texts: the collapse decision is taken on them so both languages behave the same (French runs
   * ≈ 20 % longer). Without it, the rendered children are measured.
   */
  en?: readonly (string | null | undefined | false)[];
  /** language of the toggle's label (defaults to the site language) */
  lang?: Locale;
  /** ids of enclosing anchors whose URL hash opens the box (e.g. ["disclosure"]) */
  anchors?: readonly string[];
  minChars?: number;
  /** class of the element holding the children (keeps the block's own text styles / grid) */
  className?: string;
  testId?: string;
}) {
  const { locale } = useTranslation();
  const lg: Locale = lang ?? (locale === "fr" ? "fr" : "en");
  const collapsible = isCollapsible(en ? enLength(en) : textLength(children), minChars);
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(true); // server default: collapsed with the fade (the common case)
  const boxRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef(false);
  const pendingShift = useRef(0);
  const uid = useId();
  const bodyId = `disc-${uid.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const state = discState(collapsible, expanded, overflows);

  const reduce = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // open / close; animated from the current height to the target, then the CSS state takes over (max-height: none)
  const setOpen = useCallback((open: boolean, animate = true) => {
    const clip = clipRef.current, inner = innerRef.current;
    if (!clip || !inner || expandedRef.current === open) return;
    expandedRef.current = open;
    const done = () => { clip.style.maxHeight = ""; clip.style.transition = ""; };
    if (!animate || reduce()) {
      done();
      setExpanded(open);
      return;
    }
    const from = clip.getBoundingClientRect().height;
    clip.style.transition = "none";
    clip.style.maxHeight = `${from}px`;
    void clip.offsetHeight; // commit the start height
    clip.style.transition = "";
    setExpanded(open);
    requestAnimationFrame(() => {
      if (open) clip.style.maxHeight = `${inner.getBoundingClientRect().height}px`;
      else clip.style.maxHeight = ""; // the collapsed height of the CSS
      let finished = false;
      const end = () => { if (finished) return; finished = true; clip.removeEventListener("transitionend", end); if (open) done(); };
      clip.addEventListener("transitionend", end);
      setTimeout(end, 600); // no transitionend when nothing moved
    });
    if (!open) {
      // keep the box in view when closing a long text read to its end
      requestAnimationFrame(() => {
        const r = boxRef.current?.getBoundingClientRect();
        if (r && r.top < 0) boxRef.current?.scrollIntoView({ block: "start" });
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (!expanded || !pendingShift.current) return;
    window.scrollBy({ top: pendingShift.current, behavior: "instant" as ScrollBehavior });
    pendingShift.current = 0;
  }, [expanded]);

  // does the text overflow the collapsed height? (wide screens: no fade / arrow when it fits; never changes a height)
  useEffect(() => {
    if (!collapsible) return;
    const clip = clipRef.current, inner = innerRef.current;
    if (!clip || !inner) return;
    const measure = () => {
      if (expandedRef.current) return;
      const max = parseFloat(getComputedStyle(clip).maxHeight);
      if (!Number.isFinite(max)) return; // no collapsed style (no `js` class, print)
      setOverflows(inner.getBoundingClientRect().height > max + 1);
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(inner);
    ro?.observe(clip);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro?.disconnect();
  }, [collapsible]);

  // URL hash: "#disclosure" (an anchor of the box) or an element inside the box opens it and scrolls to the target
  useEffect(() => {
    if (!collapsible) return;
    const open = (hash: string) => {
      const box = boxRef.current;
      const id = hashId(hash);
      if (!box || !id) return;
      const t = document.getElementById(id);
      if (!t || !(hashOpens(hash, anchors) || box.contains(t))) return;
      setOpen(true, false);
      requestAnimationFrame(() => t.scrollIntoView({ block: "start" }));
    };
    open(window.location.hash);
    const onHash = () => open(window.location.hash);
    // any same-page link whose hash targets the box opens it, whatever the URL holds: a link to the hash already in the
    // URL fires no hashchange, and a Next <Link> updates the URL with pushState (no hashchange either)
    const onClick = (e: globalThis.MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (a && a.hash && a.pathname === window.location.pathname) open(a.hash);
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    document.addEventListener("click", onClick);
    // soft navigation to another page whose URL carries the hash (e.g. a <Link href="/#disclaimers"> while the footer
    // stays mounted): this effect re-runs on the pathname change; the router may write the URL a frame later
    const raf = requestAnimationFrame(() => open(window.location.hash));
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
      document.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsible, anchors.join(" "), setOpen, pathname]);

  if (!collapsible) {
    return <div className="disc" data-disc="plain" data-testid={testId}>{className ? <div className={className}>{children}</div> : children}</div>;
  }

  // find-in-page / focus / scrollIntoView scroll the clipped part into view: open instead of scrolling inside the box.
  // Limitation: a find match inside the faded strip (the last ≈ 3 rem, still on screen though faint) needs no scroll, so
  // the browser highlights it there without opening the box (docs/compliance-review.md D2).
  const onScroll = () => {
    const clip = clipRef.current;
    if (!clip || clip.scrollTop === 0) return;
    const shift = clip.scrollTop;
    clip.scrollTop = 0;
    if (expandedRef.current) return;
    // what was shown at the top of the clip is `shift` px lower once open: scroll by that after the render (layout
    // effect below), so the find match stays where the reader sees it
    pendingShift.current = shift;
    setOpen(true, false);
  };
  const onFocus = () => { if (!expandedRef.current) setOpen(true, false); };
  // the collapsed box is clickable as a whole (mouse); links inside keep working, a text selection is left alone
  const onBoxClick = (e: MouseEvent) => {
    if (expandedRef.current || state !== "collapsed") return;
    if ((e.target as Element).closest("a, button, input, select, textarea, summary")) return;
    if (window.getSelection()?.toString()) return;
    setOpen(true);
  };

  const label = toggleLabel(lg, expanded);
  return (
    <div ref={boxRef} className="disc" data-disc={state} data-testid={testId}>
      <div ref={clipRef} id={bodyId} className="disc-clip" onScroll={onScroll} onFocus={onFocus} onClick={onBoxClick}>
        <div ref={innerRef} className={className ? `disc-inner ${className}` : "disc-inner"}>{children}</div>
      </div>
      <button type="button" className="disc-toggle" aria-expanded={expanded} aria-controls={bodyId} title={label}
        hidden={state === "fits"} onClick={() => setOpen(!expandedRef.current)} data-testid={testId ? `${testId}-toggle` : undefined}>
        <ChevronDown aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}
