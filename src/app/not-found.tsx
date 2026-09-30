/**
 * Unmatched URLs: rendered inside the root layout only, so it mounts the public chrome itself.
 * (notFound() thrown inside a public page uses app/(site)/not-found.tsx, already inside the site layout.)
 */
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { NotFoundScreen } from "@/components/site/pages/NotFound";
import { getLocale } from "@/lib/i18n/server";
import "@/components/site/kit.css";

export const metadata: Metadata = { title: "404", robots: { index: false } };

export default async function NotFound() {
  const locale = await getLocale();
  return <SiteShell locale={locale}><NotFoundScreen /></SiteShell>;
}
