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
import { useCallback, useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { DISCLOSURE_MIN_CHARS, discState, hashId, hashOpens, isCollapsible, textLength, toggleLabel, type Lang } from "./disclosure-logic";

export function Disclosure({ children, lang, anchors = [], minChars = DISCLOSURE_MIN_CHARS, className, testId }: {
  children: ReactNode;
  /** language of the toggle's label (defaults to the site language) */
  lang?: Lang;
  /** ids of enclosing anchors whose URL hash opens the box (e.g. ["disclosure"]) */
  anchors?: readonly string[];
  minChars?: number;
  /** class of the element holding the children (keeps the block's own text styles / grid) */
  className?: string;
  testId?: string;
}) {
  const { locale } = useTranslation();
  const lg: Lang = lang ?? (locale === "fr" ? "fr" : "en");
  const collapsible = isCollapsible(textLength(children), minChars);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(true); // server default: collapsed with the fade (the common case)
  const boxRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef(false);
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
    // a link to the hash already in the URL fires no hashchange
    const onClick = (e: globalThis.MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (a && a.pathname === window.location.pathname && a.hash && a.hash === window.location.hash) open(a.hash);
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("hashchange", onHash); document.removeEventListener("click", onClick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsible, anchors.join(" "), setOpen]);

  if (!collapsible) {
    return <div className="disc" data-disc="plain" data-testid={testId}>{className ? <div className={className}>{children}</div> : children}</div>;
  }

  // find-in-page / focus / scrollIntoView scroll the clipped part into view: open instead of scrolling inside the box
  const onScroll = () => {
    const clip = clipRef.current;
    if (!clip || clip.scrollTop === 0) return;
    const shift = clip.scrollTop;
    clip.scrollTop = 0;
    if (expandedRef.current) return;
    setOpen(true, false);
    // what was shown at the top of the clip is now `shift` px lower: keep it (the find match) where the reader sees it
    window.scrollBy({ top: shift, behavior: "instant" as ScrollBehavior });
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
