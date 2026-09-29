"use client";
/**
 * Theme: "system" (default, follows the OS), "light" or "dark", persisted in localStorage and applied as
 * <html data-theme> by the inline head script before paint (see theme-script.ts), so there is no flash.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { THEME_KEY, type ThemeMode } from "./theme-script";

interface ThemeCtx { mode: ThemeMode; resolved: "light" | "dark"; setMode: (m: ThemeMode) => void }
const Ctx = createContext<ThemeCtx>({ mode: "system", resolved: "light", setMode: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setState] = useState<ThemeMode>("system");
  const [osDark, setOsDark] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(THEME_KEY);
      if (v === "light" || v === "dark") setState(v);
    } catch { /* storage blocked: stay on system */ }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setOsDark(mq.matches);
    const on = (e: MediaQueryListEvent) => setOsDark(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setState(m);
    const root = document.documentElement;
    // no transition storm while every token flips
    root.classList.add("theme-switching");
    if (m === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", m);
    try { if (m === "system") localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, m); } catch { /* ignore */ }
    window.setTimeout(() => root.classList.remove("theme-switching"), 80);
  }, []);

  const value = useMemo<ThemeCtx>(() => ({ mode, setMode, resolved: mode === "system" ? (osDark ? "dark" : "light") : mode }), [mode, setMode, osDark]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

const ORDER: ThemeMode[] = ["system", "light", "dark"];

/** One button cycling system → light → dark; the icon shows the current mode. */
export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  const { t } = useTranslation();
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  const label = t(`nav.theme.${mode}`);
  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
  return (
    <button
      type="button"
      className={`icon-btn ${className ?? ""}`}
      onClick={() => setMode(next)}
      aria-label={t("nav.theme.next", { mode: label.toLowerCase() })}
      title={label}
      data-mode={mode}
    >
      <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}
