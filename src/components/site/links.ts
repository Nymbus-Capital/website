import { PUBLIC_FUNDS } from "@/config/funds-public";
import type { DictKey } from "@/lib/i18n";

/** Primary navigation, in the order of the previous site: Strategies · Approach · About · Solutions · Sustainability · Contact. */
export const NAV_LINKS: { href: string; key: DictKey }[] = [
  { href: "/strategies", key: "nav.strategies" },
  { href: "/approach", key: "nav.approach" },
  { href: "/team", key: "nav.about" },
  { href: "/solutions", key: "nav.solutions" },
  { href: "/sustainability", key: "nav.sustainability" },
  { href: "/contact", key: "nav.contact" },
];

export const FUND_LINKS = PUBLIC_FUNDS.map((f) => ({ key: f.key, href: `/strategies/${f.key}`, name: f.name, short: f.short, tagline: f.tagline, color: f.color }));

export const CONTACT = {
  email: "info@nymbus.ca",
  phone: "+15149851138",
  linkedin: "https://www.linkedin.com/company/nymbus-capital/",
};
