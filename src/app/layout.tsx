/**
 * Root layout: document, fonts, theme. Kept minimal on purpose: the public chrome (nav, footer, providers)
 * lives in app/(site)/layout.tsx so the admin (/admin) does not get it.
 */
import type { Metadata, Viewport } from "next";
import { themeScript } from "@/components/site/theme-script";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const DESCRIPTION =
  "Nymbus Capital is Canada's pure-play systematic bond manager: scientists and market veterans building fixed income portfolios with machine learning.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_URL || "https://www.nymbus.ca"),
  title: { default: "Nymbus Capital · scientific investing", template: "%s · Nymbus Capital" },
  description: DESCRIPTION,
  applicationName: "Nymbus Capital",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
  openGraph: {
    type: "website",
    siteName: "Nymbus Capital",
    title: "Nymbus Capital · scientific investing",
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Nymbus Capital, scientific investing" }],
    locale: "en_CA",
    alternateLocale: ["fr_CA"],
  },
  twitter: { card: "summary_large_image", title: "Nymbus Capital · scientific investing", description: DESCRIPTION, images: ["/og.png"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eceef2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

/* Poppins, self-hosted (subset: Latin + French punctuation). Plain @font-face keeps the family name
   "Poppins" that globals.css and the fund pages reference. */
const fonts = [400, 500, 600]
  .map((w) => `@font-face{font-family:"Poppins";font-style:normal;font-weight:${w};font-display:swap;src:url(/fonts/poppins-${w}.woff) format("woff")}`)
  .join("");

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preload" href="/fonts/poppins-500.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/poppins-400.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{ __html: fonts }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
