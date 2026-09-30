"use client";
/**
 * Sticky fund tabs (WAI-ARIA tabs, arrow keys, Home/End) synced with the URL hash (#performance), with the
 * v3 gradient underline sliding between tabs. Local variant of the kit <Tabs>: every panel is rendered and the
 * inactive ones are hidden by CSS only once JS runs (`.js [data-off]`; not the `hidden` attribute, which the CSS
 * reset forces with !important), so without JavaScript all the information stays on the page, one panel after the
 * other; links such as <a href="#documents"> select a tab and scroll to it.
 */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { reducedMotion } from "@/components/v3/motion";

export interface FundTab { id: string; label: string; content: ReactNode }

export function FundTabs({ tabs, label }: { tabs: FundTab[]; label: string }) {
  const ids = tabs.map((t) => t.id);
  const [active, setActive] = useState(ids[0]);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  /** Bring the top of the tab set under the site navigation (only when it is above the fold). */
  const scrollToTabs = useCallback((force = false) => {
    const root = rootRef.current;
    if (!root) return;
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
    const top = root.getBoundingClientRect().top;
    if (force || top < navH - 1) window.scrollTo({ top: window.scrollY + top - navH, behavior: reducedMotion() ? "auto" : "smooth" });
  }, []);

  useEffect(() => {
    const fromHash = (e?: HashChangeEvent) => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (!ids.includes(h)) return;
      setActive(h);
      // a link to a tab (#documents) lands on the tab bar, with the panel right under it
      requestAnimationFrame(() => scrollToTabs(true));
      void e;
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|"), scrollToTabs]);

  // sliding underline under the selected tab
  useLayoutEffect(() => {
    const list = listRef.current, bar = barRef.current;
    if (!list || !bar) return;
    const place = () => {
      const btn = list.querySelector<HTMLButtonElement>(`[data-tab="${active}"]`);
      if (!btn) return;
      bar.style.width = `${btn.offsetWidth - 28}px`;
      bar.style.transform = `translateX(${btn.offsetLeft + 14}px)`;
      bar.dataset.ready = "";
      // keep the selected tab visible in the scrollable bar (mobile)
      const l = list.scrollLeft, r = l + list.clientWidth;
      if (btn.offsetLeft < l || btn.offsetLeft + btn.offsetWidth > r) list.scrollTo({ left: btn.offsetLeft - 16, behavior: "smooth" });
    };
    place();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null;
    ro?.observe(list);
    document.fonts?.ready.then(place).catch(() => {});
    return () => ro?.disconnect();
  }, [active]);

  const select = (id: string, focus = false) => {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
    scrollToTabs();
    if (focus) listRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${id}"]`)?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const i = ids.indexOf(active);
    const to = e.key === "ArrowRight" ? ids[(i + 1) % ids.length] : e.key === "ArrowLeft" ? ids[(i - 1 + ids.length) % ids.length]
      : e.key === "Home" ? ids[0] : e.key === "End" ? ids[ids.length - 1] : null;
    if (to) { e.preventDefault(); select(to, true); }
  };

  return (
    <div ref={rootRef} className="ft" data-testid="fund-tabs">
      <div className="ft-bar">
        <div className="container">
          <div ref={listRef} className="ft-list" role="tablist" aria-label={label} onKeyDown={onKey}>
            {tabs.map((t) => (
              <button key={t.id} id={`${uid}-tab-${t.id}`} type="button" role="tab" className="ft-tab" aria-selected={t.id === active}
                aria-controls={`${uid}-panel-${t.id}`} tabIndex={t.id === active ? 0 : -1} onClick={() => select(t.id)} data-tab={t.id}>
                {t.label}
              </button>
            ))}
            <span ref={barRef} className="ft-ink" aria-hidden="true" />
          </div>
        </div>
      </div>
      {tabs.map((t) => (
        <div key={t.id} id={`${uid}-panel-${t.id}`} role="tabpanel" aria-labelledby={`${uid}-tab-${t.id}`} className="ft-panel" data-panel={t.id}
          data-off={t.id !== active ? "" : undefined} tabIndex={-1}>
          <h2 className="ft-panel-title">{t.label}</h2>
          {t.content}
        </div>
      ))}
    </div>
  );
}
