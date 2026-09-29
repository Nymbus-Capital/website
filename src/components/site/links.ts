import { FUNDS } from "@/config/funds";
import type { DictKey } from "@/lib/i18n";

export const NAV_LINKS: { href: string; key: DictKey }[] = [
  { href: "/strategies", key: "nav.strategies" },
  { href: "/approach", key: "nav.approach" },
  { href: "/sustainability", key: "nav.sustainability" },
  { href: "/team", key: "nav.team" },
  { href: "/contact", key: "nav.contact" },
];

export const FUND_LINKS = FUNDS.map((f) => ({ href: `/strategies/${f.key}`, name: f.short, color: f.color }));

export const CONTACT = {
  email: "info@nymbus.ca",
  phone: "+15149851138",
  linkedin: "https://www.linkedin.com/company/nymbus-capital/",
};
