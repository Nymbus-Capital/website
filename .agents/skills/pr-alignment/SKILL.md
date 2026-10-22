---
name: pr-alignment
description: "Align website changes with its own architecture, contracts and checks. Use before implementation, when completing a fix or story, during code review, and before preparing or updating a PR in Nymbus-Capital/website."
---

# PR alignment - website

Public Next.js fund website and authenticated administration. This skill is scoped to `Nymbus-Capital/website`.
Use its own sources below; Dataplatform's architecture and BMAD installation are
not dependencies of this repository. This is agent guidance, not a GitHub merge gate.

## Before implementation

Read applicable `AGENTS.md`, existing `CLAUDE.md` and nested area instructions.
Use the user's request or an actual linked specification as acceptance criteria;
do not invent a story or expand the change into unrelated debt cleanup.
Start with the relevant sources, then inspect the owning code and callers:

- [CLAUDE.md](../../../CLAUDE.md)
- [README.md](../../../README.md)
- [docs/architecture.md](../../../docs/architecture.md)

Follow accepted repository decisions and their documented precedence. A current
source/configuration disagreement is a finding: cite both, distinguish intended
architecture from implemented behavior, and resolve material ambiguity before
changing the affected boundary. Do not silently promote a historical summary,
example command or inferred feature into an authoritative contract.

## Repository boundaries

Preserve the source-controlled design system, public/admin boundary, tenant policy, bilingual copy and validated fund-data publication rules. Keep sample data distinct from real values. Never commit real fund/unitholder data, credentials or private infrastructure details.

For any changed financial or data path, preserve identifier grain, currencies,
cash versus quantities, units, signed effects, source lineage and explicit
trade/settlement/posting/as-of boundaries. Missing or stale is not zero.
Use the repository's existing numeric and dependency contracts. Test rounding,
null/NaN, empty inputs, duplicate/replayed inputs and relevant temporal boundaries.
Documentation-only work checks claims and links without running a financial job.

Do not add, enable or exercise Bloomberg acquisition from applications, workers,
jobs, notebooks or tests. Use supported Dataplatform APIs for already-ingested
data; missing data remains unavailable/stale. Existing vendor code is not
authorization to run acquisition. Verify exact API operations/parameters against
the owning current contract rather than assuming a successful response proves filtering.

## Establish one complete review scope

Record the request, acceptance criteria, changed files and exact revision.
For a PR, fetch its actual target and head and review merge-base-to-head changes;
do not assume `main` or confuse a clean working tree with an empty PR.
For local work include relevant staged, unstaged and untracked files and, before
a PR, committed branch changes against the intended target. Preserve unrelated
work without staging, editing or discarding it. Confirm branch ownership before
writing; never modify another contributor's branch under this workflow.

## Complete both review passes before corrections

1. **Acceptance and correctness:** trace changed behavior through callers and
   failure paths; test acceptance criteria, invalid inputs and meaningful edge
   cases. Distinguish pre-existing defects from regressions introduced here.
2. **Architecture and contracts:** check the repository boundaries above, APIs,
   persistence/transaction ownership, dependency configuration, authorization,
   source/data contracts and applicable UI/output guarantees. Verify concrete
   violations; do not turn optional stylistic preferences into blocking defects.

Both passes inspect the same scope without editing reviewed files. These passes
are self-contained; do not claim `bmad-code-review` or `compliance-check` ran when
they are not installed. If an installed repo review workflow is required by current
instructions, run it as well and preserve its missing/failed layers explicitly.
Do not invoke hooks that write findings, update story state or apply fixes during
the read-only analysis. Consolidate duplicates while retaining each pass's evidence.

For actionable findings give file/line, violated requirement, concrete consequence
and correction. Preserve rationale comments and deliberate design decisions.

## Verify with this repository's checks

Follow ci.yml and package.json: npm test, npm run typecheck, npm run build and npm run e2e; lint is an additional diagnostic even though CI currently permits its failure. Use isolated sample fixtures and verify desktop/mobile. Update docs/HANDOFF.md.

The inspected manifests and workflows are the starting points, not frozen rules:

- [package.json](../../../package.json)
- [Dockerfile](../../../Dockerfile)
- [.github/workflows/ci.yml](../../../.github/workflows/ci.yml)
- [.github/workflows/northflank-provision.yml](../../../.github/workflows/northflank-provision.yml)

- From `.`: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run e2e`. Confirm side effects and test configuration before running.

Always check `git diff --check`. Re-read touched manifests/workflows at the current
revision for tool versions, working directories, fixtures and required gates.
Add focused automated tests for functional changes; retain repo-specific suites
required by CI. Check links and skill frontmatter for instruction/document changes.
Inspect test setup before executing it: names like `test`, `dry-run` or `--test`
do not establish isolation from databases, vendor services, messages or orders.
Use isolated fixtures and intercept external IO at the called boundary.

Report each required check as passed, failed or unavailable with command, revision
and reason. Reuse valid evidence for unchanged inputs/environment; static inspection
cannot substitute for an unrun automated, browser or integration check.
If no maintained test suite exists, say so and add appropriate tests for new
behavior; do not invent a passed suite or treat no collected tests as coverage.

## Explain corrections, respect authorization, and reverify

Finish available analysis before presenting a concrete correction plan: problem,
evidence, affected files, intended behavior, verification and material tradeoffs.
Honor the user's existing authorization. Apply corrections already within the
explicitly authorized task; obtain approval for changes outside that scope or when
the user requested review only. Do not repeatedly request approval already given.
If approval is needed, link this section and explain the specific scope decision.
Silence is not approval; clarification alone does not authorize an extra change.
When no corrections are proposed, finish without an unnecessary approval request.

Apply only authorized corrections, then update both passes and rerun affected
checks. A changed head invalidates the old verdict for affected content. If a fix
fails twice, reassess its cause before retrying. Deferred blocking findings and
missing required evidence remain unresolved even if a user accepts the risk.

Report scope/revision, both review results, applied/deferred corrections and
automated evidence separately. A ready verdict needs no unresolved blockers and
current evidence for the relevant required checks. Keep implementation, tests,
review, merge, deployment, financial publication and verified live behavior as
separate statuses. Readiness does not guarantee future agent accuracy.

Use owned branches and small, single-concern draft PRs for AI-generated proposals;
disclose AI authorship and add `Agent: codex` (or the acting agent's identity) to
commit trailers. Preserve existing human review and branch-protection requirements.
This skill grants no permission to force-push, merge, deploy, migrate shared data,
publish financial output, place orders, send messages or activate monitoring.

Adapted from the [Dataplatform team's PR alignment skill](https://github.com/Nymbus-Capital/nymbus-dataplatform/blob/87ae88fb25a8a6ab0c006c1439da318605338286/.agents/skills/pr-alignment/SKILL.md); this repository's maintained contracts own the local review.
