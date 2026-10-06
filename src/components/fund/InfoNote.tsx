"use client";
/**
 * Compact info note ("i" button + toggletip) for long legal text that must stay available next to a figure (Morningstar's
 * methodology and attribution). The full text is always in the DOM: the button names it with its visible label and
 * points at it with aria-describedby / aria-controls.
 *
 *   - mouse: opens on hover, stays open while the pointer is over the button or the note (short close delay);
 *   - keyboard: opens on visible focus; Enter / Space pins it; Escape closes it from anywhere inside;
 *   - touch: tap toggles it; a tap elsewhere closes it.
 *
 * WCAG 1.4.13: dismissible (Escape), hoverable (the note is inside the hover area), persistent (no timeout while hovered).
 */
import { Info } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function InfoNote({ label, children, testId = "info-note" }: { label: string; children: ReactNode; testId?: string }) {
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const open = pinned || hover || focus;

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const closeAll = () => {
    clearTimer();
    setPinned(false);
    setHover(false);
    setFocus(false);
  };

  // a tap / click outside closes a pinned note
  useEffect(() => {
    if (!pinned) return;
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) closeAll();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- closeAll only calls state setters and clears a ref timer
  }, [pinned]);
  // Escape closes it wherever the focus is (a hovered note has no focus inside)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- closeAll only calls state setters and clears a ref timer
  }, [open]);
  useEffect(() => clearTimer, []);

  return (
    <span
      ref={root}
      className="inote"
      data-open={open ? "" : undefined}
      data-testid={testId}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimer();
        setHover(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimer();
        timer.current = setTimeout(() => setHover(false), 200);
      }}
      onFocus={(e) => {
        // keyboard focus only: a mouse click or a tap is handled by onClick
        if ((e.target as HTMLElement).matches?.(":focus-visible")) setFocus(true);
      }}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node)) {
          setFocus(false);
          setPinned(false);
        }
      }}
    >
      <button
        type="button"
        className="inote-btn"
        aria-expanded={open}
        aria-controls={id}
        aria-describedby={id}
        data-testid={`${testId}-button`}
        onClick={() => (pinned ? closeAll() : (clearTimer(), setPinned(true)))}
      >
        <Info aria-hidden="true" />
        <span className="inote-label">{label}</span>
      </button>
      {/* focusable so a keyboard user can scroll it (max-height); no aria-label: its text is the button's description */}
      <span id={id} role="note" tabIndex={0} className="inote-pop" hidden={!open} data-testid={`${testId}-text`}>
        {children}
      </span>
    </span>
  );
}
