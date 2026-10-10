# Agent guide

Enduring rules and task routing. Issues own intent; PRs own execution;
[CONTRIBUTING.md](CONTRIBUTING.md) owns the protocol. Keep task history in its owner.

## Start from an issue

1. Verify the live repository, target tip, task ref and working tree. Read
   [README.md](README.md), this file and every applicable nested `AGENTS.md`.
2. Read [MEMORY.md](MEMORY.md) as a dated handoff, never live evidence, and
   CONTRIBUTING. Revalidate relevant refs, issue/PR state, checks and deployments.
3. Find or create the owning issue before implementation; read intent, accepted
   scope, decisions, dependencies and stable AC IDs with observable pass conditions.
   Reuse an existing owner. A user-provided issue stays bound across phases and
   model handoffs; another owner requires the user's explicit request.
4. Locate source, instructions and checks through [REPOSITORY-MAP.md](REPOSITORY-MAP.md)
   or verified [RI](.github/REPOSITORY-INTELLIGENCE.md); read known owners directly.
   Search sources for stale, missing, ambiguous or untranslated lookups. A miss
   does not establish absence; inspect relevant inventories before creating an owner.
5. Add the applicable routes below to the common reading above. For mixed work,
   use their union; uncertain classification requires owner/source inspection.

| Type | Additional reading |
| --- | --- |
| T0 Content only | [site source contract](site/README.md), [acceptance](.github/ACCEPTANCE.md), [check profiles](guides/SITE-CHECK-PROFILES.md); relevant [editorial](guides/SITE-CONTENT-REVIEW.md), [provenance](guides/SITE-SOURCE-AUDIT.md) and [SEO](guides/SITE-SEO.md) owners |
| T1 Code/template/style/config | Site source contract, acceptance, check profiles, [CODE-STYLE.md](guides/CODE-STYLE.md) and the affected component contract |
| T2 Research input | CONTRIBUTING research-intake section, [repository ownership](guides/REPOSITORIES.md), original input and affected source/research registries |
| T3 Release/domain/DNS | Acceptance and applicable [release gates](guides/SITE-RELEASE-GATES.md), [staging](guides/SITE-STAGING.md), check profiles, edition and domain owners |
| T4 Repository management/harness | Acceptance, [RI contract](.github/REPOSITORY-INTELLIGENCE.md), affected protocol; CODE-STYLE before code/config changes |

## Implement, verify and link

6. For PR work inspect the complete diff, base/head, commits, feedback, unresolved
   review, checks and Draft state. Continue work already authorized by the user.
7. Edit authored owners; regenerate `docs/`, output locks and dependent previews.
   Generated output is never an editing source. Preserve provenance and edition rights.
   Follow repository ownership: site copies, recognition, RI and green CI cannot
   establish scientific acceptance, authorship, validation or institutional endorsement.
8. Before code/template/style/config edits follow CODE-STYLE; map applicable rule
   IDs to the issue's style AC and PR evidence, run the bounded guard and relevant
   checks, and review unautomated rules. Legacy debt cannot authorize new debt.
9. Preserve issue intent; append dated scope decisions. Link PRs and every
   implementation commit using `Refs #N`; refresh exact links after rebase/squash.
   Keep substantive PRs Draft during iteration and preserve required independent,
   editorial, rights and device review. Label self-review and independent review honestly.
10. Keep analysis/review/model tasks in the owning PR's versioned
    `review/issue-N/YYYY-MM-DD-kind.md`, using [REVIEW-TEMPLATE](review/REVIEW-TEMPLATE.md).
    Give the issue a dated anchor, short outcome and exact file/section link;
    continue model changes on that same route. History never authorizes new work.
11. Run `node tools/quality/local.cjs` and applicable mapped checks. After indexed
    path/source or memory changes run RI `build` and `verify`; RI/flow changes also
    require `test_repository_intelligence.py`. Update and verify the [RI/CI map](.github/ri-ci-map.json)
    when RI changes. Runtime/content edits use applicable hosted profiles and registry;
    dated diagnostics remain targeted, not routine suites.
12. At session end follow acceptance policy: map every AC, run current-source checks,
    report AC → check → result → exact source/run, and update actual issue checkboxes.
    Tick only whole criteria with all checks/gates verified; clear invalidated ticks.
    Missing, partial, skipped, failed, unmapped, stale, wrong-source or pending stays open.
13. Before closure compare outcome with original acceptance; record exact refs,
    checks, deviations and remaining work in issue and PR. Reconcile test/profile
    dispositions, duplicates, obsolete/diagnostic cases, owners and RI/CI routes.
    Keep umbrella issues open while dependencies remain. Draft, implemented, merged,
    reviewed, staged and published are separate observations.
14. Use the existing CI/controller for authorized previews/staging. Preserve
    source/tree/artifact binding, profile cases and original budgets. Merge,
    production activation, domain/DNS and public release need the applicable
    maintainer decision; passing checks do not supply it. Report active-source conflicts.

## Checkpoint between sessions

15. Update MEMORY at meaningful handoff/interruption: verified date/ref, evidence
    pointers, relevant decisions, active issue/PR, remaining acceptance and next action.
    Replace stale entries; retain its five sections and 120-line cap. Keep this guide
    within 100 lines; route to owners rather than repeat history. Rebuild RI after
    either file changes. Never store secrets or private correspondence in memory.
