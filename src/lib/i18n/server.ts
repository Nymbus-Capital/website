/**
 * Server-side locale: the `nymbus-locale` cookie, else the browser's Accept-Language, else English.
 *   const locale = await getLocale();   // in any server component, layout, generateMetadata or route handler
 * Reading it makes the route dynamic (cookies/headers), which every public page already is (live data).
 */
import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, fromAcceptLanguage, isLocale, type Locale } from "./config";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const v = jar.get(LOCALE_COOKIE)?.value;
  if (isLocale(v)) return v;
  const h = await headers();
  return fromAcceptLanguage(h.get("accept-language")) ?? DEFAULT_LOCALE;
}

export { dict } from "./dict";
