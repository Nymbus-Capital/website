"use client";
/**
 * Public chrome: providers (language, theme) + nav + <main> + footer. Mounted once by app/(site)/layout.tsx;
 * every public page (including the fund pages) renders inside it. The admin lives outside the (site) group.
 */
import { useEffect, type ReactNode } from "react";
import { I18nProvider, type Locale } from "@/lib/i18n";
import { ThemeProvider } from "./theme";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

declare global { interface Window { __nyReady?: boolean } }

export function SiteShell({ children, locale }: { children: ReactNode; locale: Locale }) {
  // hydrated: the reveal gate (html.js) may stay (see theme-script.ts failsafe)
  useEffect(() => { window.__nyReady = true; document.documentElement.classList.add("js"); }, []);
  return (
    <I18nProvider initialLocale={locale}>
      <ThemeProvider>
        <Nav />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
      </ThemeProvider>
    </I18nProvider>
  );
}
