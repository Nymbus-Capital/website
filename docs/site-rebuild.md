# Public site rebuild (2026-09-30): informational corporate site, light, v3 motion

Gabriel's direction (2026-09-30), after seeing the first deploy:
> Use the sections (mostly all the information that needs to be available for each individual fund and strategy)
> that were there before. Make it light theme like the v3 keynote, but a corporate website about Nymbus, not a deck
> trying to make a pitch. It's meant to be informational. Take some of the contents that were there before and
> improve them, and use the animations and wow effects of the v3 keynote.

So: the **information architecture and sections of the previous site** (`origin/main`, the GitHub Pages site), the
**light v3 palette and motion**, and **live data** from the pipeline. No dark screens, no full-screen "slides",
no forced lowercase, no chapter interstitials.

## Foundation (done, shared by every page)

- `src/app/globals.css`: tokens (light only), type scale (sentence case), cards, buttons, chips, tables, tabs,
  bubbles, gradient marks, motion gates. **No `.screen` / `.stage` / dark variants any more.**
- `src/components/site/kit.tsx` + `kit.css`: `Section` (white / tint band, optional glow), `SectionHead`
  (eyebrow + words rising out of a blur + lead), `PageHero` (breadcrumb, H1, lead, actions, animated yield curves
  or light trail, optional `aside`), `FeatureCard`, `CardGrid` (pop-in stagger), `Stat` / `StatRow` (count to the
  real value; `null` renders nothing), `Steps` (glowing bubbles joined by a line that fills on scroll), `CtaBand`,
  `ButtonLink`, `Marquee`, `Tabs` (ARIA tabs synced with the URL hash), `Bars` (horizontal % bars growing in),
  `HeroCurves`, `HeroTrail`, `Eyebrow`, `Crumbs`. Re-exports `Reveal`, `RevealTitle` from `src/components/v3/motion.tsx`
  (also `CountUp`, `Odometer`, `useScrub`, `useTilt`, `LightTrail` there).
- `Nav.tsx` (Strategies ▾ · Approach · About → /team · Solutions · Sustainability · Contact · EN/FR),
  `Footer.tsx` (brand + description + address · Strategies · Company · Resources · disclaimers · © · PRI).
- `src/config/funds.ts`: proper-case short names, asset classes, taglines.
- Old content inventory (verbatim EN/FR copy of the previous site, fund blocks, team, news): produced by an agent
  from `git show origin/main:…`; see `origin/main` directly (`src/lib/i18n/en.ts|fr.ts`, `src/data/*.ts`,
  `src/components/FundDetailLayout.tsx`).

## Rules for every page

1. **Informational tone.** Improve the old copy: clear, factual, bilingual (EN + FR side by side in a `copy.ts`),
   sentence case. No superlatives or performance promises ("superior risk-adjusted returns" → describe the
   method, not the outcome). No "trusted by" logos of institutions that are not clients.
2. **Numbers: prefer nothing over a wrong number.** Every figure comes from the published data (`SiteData`) or the
   admin content (`SiteContent`), or is a structural fact (number of funds in `FUNDS`, people in `src/data/team.ts`).
   Never carry over the old site's placeholder figures (its NAVs, returns, MERs, sub-strategy weights, capture
   ratios, holdings were placeholders). When a figure is missing, render the "figures coming soon" state, never 0.
3. **Motion:** v3 keynote primitives only, triggered on scroll, once, all disabled under
   `prefers-reduced-motion`; content visible without JS (`html.js` gate). No infinite pulses on content (the
   hero curves' travelling light and the live dot are the only loops), no information shown only on hover.
4. **Accessibility:** one H1 per page, headings in order, AA contrast (`--mute` #5f6368 is the lightest body text),
   keyboard reachable, visible focus, `lang` on switched fragments.
5. **Layout:** `Section` bands alternating white / tint, `container` max 1200px, cards 20px radius.
6. **Legacy:** `src/components/site/site.css`, `pages/*`, `home/*`, `hero/*`, `ui.tsx` and the fund
   `Hero/FundDock/*Sections` are the deck-style implementation being replaced; delete what your area no longer uses.

## Page map (previous site's sections, improved)

- **Home**: hero (headline + subtitle + Explore strategies / Investment solutions, animated yield curves) ·
  key figures (firm AUM label from admin, strategies, team size, NAV date) · approach teaser (3 cards: quantitative
  research, systematic construction, dynamic risk management) · our strategies (4 fund cards with live figures) ·
  investment process (4 steps: data & research, signal generation, portfolio construction, risk management) ·
  clients / partners logos · news & milestones · CTA band.
- **Strategies**: hero · filter (all / fixed income / alternatives) · fund cards (live YTD, 1Y, SI, NAV, mini
  calendar-year chart when published) · comparison table.
- **Fund page** (`/strategies/<key>`): header (breadcrumb, chips: asset class, vehicle, risk; name; description;
  NAV card with class selector and date; key facts) · return badges · sticky tabs **Overview** (objective,
  investment focus, fund facts incl. FundServ codes per series, fees & expenses, returns table, investment team),
  **Performance** (growth of $10,000, calendar-year returns vs benchmark, monthly returns heat map, annualized
  returns vs benchmark, risk statistics), **Portfolio** (characteristics, credit quality, sectors, term/geography,
  top 10 holdings, ESG metrics), **Distributions** (policy/frequency from admin content), **Documents** (admin
  uploads; the NI 81-102 list as "available on request" when none) · the fund's own section (Monthly Income
  advantages / ESG integration / sub-strategies / low-volatility approach: text only) · disclosures · CTA.
- **Approach**: philosophy pillars, 4-step methodology, research & technology.
- **Solutions**: institutional investors, family offices, advisors (benefits, vehicles, suitable strategies).
- **Sustainability**: principles, exclusions, ESG integration, green bonds, Fondaction, PRI.
- **About / Team**: firm intro, values, people with department filter and bio dialog.
- **Contact**: office, map link, phone, email, contact form (mailto, no backend).
- **Legal** (complaints policy, code of ethics), **Privacy** (PIPEDA + Quebec Law 25), **404**.
