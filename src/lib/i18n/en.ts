/**
 * Site chrome strings (nav, footer, shared UI). Page copy lives next to the pages as bilingual
 * `{ en, fr }` objects (src/components/site/copy.ts), which keeps both languages side by side.
 * fr.ts must define every key of this file (enforced by its type).
 */
export const en = {
  // navigation
  "nav.home": "home",
  "nav.strategies": "strategies",
  "nav.approach": "approach",
  "nav.sustainability": "sustainability",
  "nav.team": "team",
  "nav.contact": "contact",
  "nav.solutions": "solutions",
  "nav.menu": "menu",
  "nav.open": "Open menu",
  "nav.close": "Close menu",
  "nav.skip": "Skip to content",
  "nav.primary": "Primary",
  "nav.homeLink": "Nymbus Capital, home",
  "nav.lang": "Language",
  "nav.langSwitch": "Afficher le site en français",
  "nav.theme": "Theme",
  "nav.theme.light": "Light theme",
  "nav.theme.dark": "Dark theme",
  "nav.theme.system": "System theme",
  "nav.theme.next": "Switch theme (current: {mode})",

  // footer
  "footer.tagline": "scientific investing",
  "footer.strategies": "strategies",
  "footer.firm": "firm",
  "footer.contact": "contact",
  "footer.legal": "legal",
  "footer.privacy": "privacy policy",
  "footer.legalPage": "complaints & code of ethics",
  "footer.address": "1002 Sherbrooke Street West, Suite 1900\nMontreal, Quebec H3A 3L6",
  "footer.phone": "514-985-1138",
  "footer.tollFree": "1-833-227-2656 (toll-free)",
  "footer.email": "info@nymbus.ca",
  "footer.linkedin": "LinkedIn",
  "footer.pri": "PRI signatory",
  "footer.rights": "Nymbus Capital Inc. All rights reserved.",
  "footer.disclaimer":
    "This website is for informational purposes only and does not constitute investment advice, an offer to sell, or a solicitation to buy any security. Past performance is not indicative of future results.",
  "footer.top": "Back to top",

  // shared UI
  "ui.soon": "figures coming soon",
  "ui.soonLong": "Performance figures are published here once validated. They will appear shortly.",
  "ui.sample": "sample data",
  "ui.sampleLong": "Illustrative figures only, not actual performance.",
  "ui.asOf": "as of {date}",
  "ui.navAsOf": "nav as of {date}",
  "ui.learnMore": "learn more",
  "ui.close": "Close",
  "ui.explore": "explore",
  "ui.chapter": "next chapter",
} as const;

export type DictKey = keyof typeof en;
