# Nymbus Capital — website

Public site of Nymbus Capital ("scientific investing"), built in the look of the firm's v3 keynote deck,
with fund pages refreshed daily from the Nymbus data platform and a Microsoft-authenticated admin.

- **Design**: one rounded "screen" per section, light or black; lowercase display titles whose words rise
  out of a blur; blue→cyan gradients in the type; glowing marks, bubbles and light trails; count-ups and
  hand-built animated SVG charts. Design system: `src/app/globals.css`, `src/components/motion/motion.tsx`.
- **Data**: an in-process pipeline (`src/lib/pipeline`) pulls monthly net returns, NAVs, AUM and FTSE
  benchmarks from the dataplatform, portfolio data from the monthly factsheet archives on SharePoint and
  the pre-Apex history from the analytics repo; it computes and cross-checks every figure, snapshots each
  run and publishes only what passes its gates.
- **Admin** (`/admin`): Entra ID sign-in restricted to the Nymbus tenant and @nymbus.ca accounts — pipeline
  status, run / approve / roll back, fund texts, fees and visibility, documents (PDF), site settings, audit log.

Working on this repo with Claude? Start with `CLAUDE.md` and `docs/HANDOFF.md` (shared session log).

Read `docs/architecture.md` (data flow, env vars), `docs/admin.md` (Entra setup, security model) and
`docs/deploy.md` (Northflank).

## Develop

```bash
npm install
npm run dev                  # http://localhost:3000 — shows the synthetic sample data
npm test                     # unit tests (plain Node, no browser)
npm run typecheck && npm run build
npm run e2e                  # Playwright against the production build
npm run pipeline -- sample   # regenerate the synthetic sample from tests/fixtures
```

The repository is public: fixtures and the sample dataset are synthetic, and no internal hostnames or
credentials belong in it. CI (`.github/workflows/ci.yml`) runs unit tests, type check, build, e2e
(desktop + mobile) and the Docker build on every push.
