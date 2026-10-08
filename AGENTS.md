# Agent guide

This file routes agents and states enduring working rules. Task history belongs
in issues/PRs, current continuity in [MEMORY.md](MEMORY.md), and repository
navigation in [REPOSITORY-MAP.md](REPOSITORY-MAP.md).

## Start from an issue

1. Verify the live repository, target tip, task ref and working tree. Discover and
   read this file and every applicable nested `AGENTS.md`.
2. Find or create the owning issue **before implementation**. Read its original
   intent, accepted scope, decisions, acceptance checks and dependencies. Assign
   stable AC IDs and observable pass conditions before implementation. Reuse
   an existing owner. Follow [CONTRIBUTING.md](CONTRIBUTING.md).
3. Read `MEMORY.md` as a dated handoff; revalidate relevant refs, issue/PR state,
   checks and deployments through Git/GitHub. Memory is never live evidence.
4. Use the repository map or verified [RI](.github/REPOSITORY-INTELLIGENCE.md)
   to find the owning source, instructions and checks. Known owners can be read
   directly. A stale, missing, ambiguous or untranslated lookup needs source
   search; a miss does not establish absence. Read relevant inventories before
   creating a competing owner.
5. For PR work inspect the complete diff, base/head, commits, feedback, unresolved
   review, checks and Draft state. Continue work already authorized by the user.

## Sources and authority

- [site/README.md](site/README.md) owns the engine/source contract. Edit authored
  `site/` content, templates, code and assets; regenerate `docs/`, output locks
  and dependent previews. Generated files are renditions, not editing sources.
- [SITE-CHECK-PROFILES.md](guides/SITE-CHECK-PROFILES.md),
  [SITE-RELEASE-GATES.md](guides/SITE-RELEASE-GATES.md) and
  [SITE-STAGING.md](guides/SITE-STAGING.md) own checks and hosting mechanics: PR
  smoke/targeted ACs, bounded staging regression, full production regression.
  Preserve source/tree/artifact binding and each profile's cases/original budgets.
- [SITE-SOURCE-AUDIT.md](guides/SITE-SOURCE-AUDIT.md),
  [SITE-CONTENT-REVIEW.md](guides/SITE-CONTENT-REVIEW.md) and
  [SITE-SEO.md](guides/SITE-SEO.md) own provenance, editorial checks and discoverability.
  Rights and publication decisions remain with their issues and accepted editions.
- [REPOSITORIES.md](guides/REPOSITORIES.md) routes UA specification/research and Subprime
  evidence/operations to their canonical repositories. Site copies, public
  recognition, RI metadata and green CI do not establish scientific acceptance,
  authorship, validation or institutional endorsement.
- `review/` and `drafts/` preserve dated evidence/proposals. The old agent guide
  is archived in [AGENTS.before.md](review/repository-maintenance-20261007/AGENTS.before.md).
  Historical task instructions do not authorize new work. Report active-source
  conflicts instead of silently picking one.

## Implement, verify and link

- Before every code/template/style/config change, read and follow
  [CODE-STYLE.md](guides/CODE-STYLE.md). Map applicable rule IDs to the issue's
  code-style AC and PR evidence; run the bounded guard and relevant checks.
  Review unautomated rules explicitly; legacy debt cannot authorize new debt.
- Keep issue intent stable; append dated scope decisions. Put technical details,
  changed paths, implementation reasoning and checks in the linked PR/commits.
  Use `Refs #N` in the PR and each implementation commit; link the PR and exact
  commits back from the issue. See CONTRIBUTING for cross-repository references.
- Keep substantive PRs Draft during iteration. Record required independent
  review honestly; self-review is not independent review. Preserve editorial,
  rights and device acceptance when applicable.
- Put analysis/review and tasks for the execution model in one versioned
  `review/issue-N/YYYY-MM-DD-kind.md` file in the owning PR. The issue gets a
  dated anchor, short outcome and exact PR-file/section link; keep model changes
  on that same route. Use [the review template](review/REVIEW-TEMPLATE.md).
- Default site check: `node tools/quality/local.cjs`. After indexed path/source
  changes run RI `build` and `verify`; after RI/flow changes also run
  `python3 -m unittest discover -s tests -p 'test_repository_intelligence.py'`.
  Runtime/content edits additionally follow the applicable hosted profiles.
  Use the profile guide's registry for source suites; dated diagnostics are targeted.
- At session end provide/update deterministic tests and the
  [acceptance policy](.github/ACCEPTANCE.md) for every AC. Run the mapped checks;
  report AC → test/check → result → exact source/run. Unmapped/skipped/failed or
  wrong-source evidence stays open; human decisions remain explicit gates.
  At session end/evaluation update the actual AC checkboxes in the owning issue
  body; an evidence table alone is insufficient. Use `[x]` only for the whole
  criterion verified by all required current-source checks and gates. Partial,
  failed, skipped, unmapped, stale, wrong-source or pending criteria stay `[ ]`;
  clear a tick if evidence is invalidated. Preserve AC IDs/intent and evidence links.
- When changing RI review its linked CI/test coverage, update the
  [RI/CI map](.github/ri-ci-map.json), verify it and rebuild the RI views.
- Before closure compare the result with the original issue acceptance. Record
  exact refs, checks, deviations and remaining work in both issue and PR. Draft,
  implemented, merged, reviewed, staged and published are separate observations.
  Review test/profile dispositions at closure: PR smoke, staging regression,
  production regression, duplicates and obsolete/diagnostic cases. Update their
  registry, owner and RI/CI routes. Keep umbrella issues open while dependencies remain.
- Use the existing CI/controller for authorized previews/staging. Merge,
  production activation, domain/DNS and public release need the applicable
  maintainer decision; passing checks do not supply it.

## Checkpoint between sessions

Update `MEMORY.md` at a meaningful handoff or before interruption: verified
baseline/ref, decisions with evidence, active issue/PR, remaining acceptance and
next action. Replace stale entries; keep it within 120 lines. Put detailed logs,
experiments and prior checkpoints in their issue/PR or dated `review/` artifact.
Keep this guide within 100 lines; add a route to a rule's owner instead of copying
its history. Rebuild RI after either file changes. Never store secrets or private
correspondence in repository memory. Its format/update rules are in CONTRIBUTING.
