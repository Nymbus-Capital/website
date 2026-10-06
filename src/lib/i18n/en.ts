/**
 * Site chrome strings (nav, footer, shared UI). Page copy lives next to the pages as bilingual
 * `{ en, fr }` objects (the `*.copy.ts` files next to each page), which keeps both languages side by side.
 * fr.ts must define every key of this file (enforced by its type).
 */
export const en = {
  // navigation
  "nav.home": "Home",
  "nav.strategies": "Strategies",
  "nav.approach": "Approach",
  "nav.concepts": "Core concepts",
  "nav.sustainability": "Sustainability",
  "nav.team": "Team",
  "nav.contact": "Contact",
  "nav.solutions": "Solutions",
  "nav.about": "About",
  "nav.allStrategies": "All strategies",
  "nav.cta": "Get in touch",
  "nav.menu": "Menu",
  "nav.open": "Open menu",
  "nav.close": "Close menu",
  "nav.skip": "Skip to content",
  "nav.primary": "Primary",
  "nav.homeLink": "Nymbus Capital, home",
  "nav.lang": "Language",
  "nav.langSwitch": "Afficher le site en français",

  // footer
  "footer.tagline": "Scientific investing",
  "footer.description": "Montreal portfolio manager building systematic fixed income and alternative strategies.",
  "footer.about": "About & team",
  "footer.strategies": "Strategies",
  "footer.firm": "Company",
  "footer.contact": "Contact",
  "footer.legal": "Resources",
  "footer.privacy": "Privacy policy",
  "footer.legalPage": "Complaints & code of ethics",
  "footer.address": "1002 Sherbrooke Street West, Suite 1900\nMontreal, Quebec H3A 3L6",
  "footer.phone": "514-985-1138",
  "footer.tollFree": "1-833-227-2656 (toll-free)",
  "footer.email": "info@nymbus.ca",
  "footer.linkedin": "LinkedIn",
  "footer.pri": "PRI signatory",
  "footer.rights": "Nymbus Capital Inc. All rights reserved.",
  "footer.top": "Back to top",

  // shared UI
  "ui.soon": "Figures coming soon",
  "ui.soonLong": "Performance figures are published here once validated.",
  "ui.sample": "Sample data",
  "ui.sampleLong": "Illustrative figures only, not actual performance.",
  "ui.asOf": "as of {date}",
  "ui.navAsOf": "NAV as of {date}",
  "ui.learnMore": "Learn more",
  "ui.close": "Close",
  "ui.explore": "Explore",
} as const;

export type DictKey = keyof typeof en;
