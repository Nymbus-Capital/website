# CLAUDE.md — Nymbus website

Read **`docs/HANDOFF.md` first**: it is the shared work log between Claude sessions (home and office)
working on this repository — current state, decisions already taken by Gabriel, open items, and the
protocol to follow so the sessions continue each other's work without conflicts.

Then, as needed: `docs/architecture.md` (data flow, env vars), `docs/admin.md` (Entra / security
model), `docs/deploy.md` (Northflank), `docs/compliance-review.md` (disclaimer texts to review).

## Working rules (short version — details in HANDOFF.md)

- Start: `git fetch && git switch <working branch> && git pull --rebase`, read HANDOFF.md.
- Validate everything with adversarial review (independent sub-agents that did not write the code)
  and automated tests; that is a standing preference of the user.
- Every change: unit tests (`npm test`, plain Node) + CI (typecheck, build, Playwright e2e desktop and
  mobile, Docker build). Push small commits; don't leave work only on disk.
- End of a work block: update the **Session log** and **Open items** in HANDOFF.md, commit, push.
- Public repository: never commit real fund data, credentials, internal hostnames or unitholder data.
- Numbers shown to investors (Gabriel, 2026-10-07): never show "not available" / "coming soon" states. A series' month
  computed from its own official NAV chain is published; cross-checks (other classes, factsheet, analytics) raise
  internal data-quality alerts, never a visible gap. Only an uncomputable month (missing / conflicting source data)
  is left out, silently, and the pages show a series with complete figures (label = the series shown). Series with
  less than 12 months show no performance. Auto publishing, gated by the automatic validation.
