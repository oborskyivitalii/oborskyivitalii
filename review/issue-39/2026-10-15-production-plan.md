# Issue 39 — 2026-10-15 current-main production plan

Owning issue: [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39).
Owning PR: [Draft #40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40).
Role: root synthesis/self-analysis, with two separate read-only subagent audits
of current release code and the PR40 delta. This is a planning checkpoint.

Inspected main: `cc115c4241197d59205934bdc18f209109d5ee87`, tree
`0820a951b17f375bca61aea4e70785dbb9376468`. PR40 before this report:
`da7ac22f41cf59f8d049bb54f2c765ce30fc9f00`, Draft/open/conflicted, 84 commits
behind main and four ahead. The maintainer then authorized rebasing and continuation. All four commits were
rebased onto that main; public/runtime/workflow/provider bytes remain unchanged
against this explicit current-main baseline. The old preparation comparison to
`ec9b8361` is superseded for this increment by the dated scope amendment in #39.
Historical 7/10 October audits and their exact-source evidence are retained.

Read README, both refs' AGENTS/MEMORY, CONTRIBUTING, acceptance, targeted
REPOSITORY-MAP entries, current staging/release/profile/style owners, PR40's full
changed-file inventory and authored delta, current release/Pages source and tests.
Only root AGENTS exists. Git/GitHub, Cloudflare API, official GitHub Pages docs
and public HTTP were inspected. Public repository Pages administration returned
404 without authentication; this does not prove that Pages is disabled.

## Intent and acceptance

The 15 October request continues #39/PR40: inspect what exists and plan publication
of current main on the real production domain, retaining Cloudflare PR previews
and permanent staging and providing GitHub Pages staging too. It changes the
eventual goal from preparation alone to an executable launch path. This report/rebase increment
does not execute a merge, production publication, custom-domain binding or DNS write.
AC01–AC05 retain their IDs and original intent. The dated scope amendment was appended to the live issue before rebasing or
changing frozen preparation assertions. This increment reconciles the plan/policy;
Color support, migration and live activation remain subsequent execution tasks.

Publish the current main's content and approved runtime appearance; delivery
fixes and production metadata are expected, unrelated PR53/68/79 features are
not dependencies. Current-main SHA, final delivery-controller SHA and frozen
production artifact must be recorded separately.

## Linked launch issue audit

The maintainer requested a review of production-relevant issues after this rebase.
[The production dependency audit](2026-10-15-release-issue-audit.md) adds the
selected #1/#7/#8/#13/#39/#72 closure matrix, closed #14 SEO invariants, rights/retained inventory,
absolute social image, actual pre-first-release analytics and #72:AC03 evidence.
It supersedes the earlier broad analytics-follow-up wording below.

## Current and intended addresses

| Role | Observed now | Target |
| --- | --- | --- |
| PR preview | Cloudflare immutable candidate and `pr-N` alias | Existing Cloudflare route |
| Permanent staging | `https://staging.oborskyi-author-ci-staging.pages.dev` | Same address |
| Pages staging | `https://oborskyivitalii.github.io/oborskyivitalii/staging/` | `https://vitaliioborskyi.ai/staging/` |
| Production | Pages receipt has `production: null`; real-domain routing absent | `https://vitaliioborskyi.ai/` |
| Alternate domains | No configured .com DNS/redirect | .com and www.com HTTP/HTTPS → .ai, one-hop 301 preserving path/query; www.ai → apex |

The existing combined publisher already separates production root and staging
subtree while preserving production file hashes. GitHub Pages supplies one site
per repository, not independent production/staging sites selected by Environment.
The proposed `/staging/` location reuses that architecture. A separately retained
github.io staging hostname would require another Pages site/repository and is
not necessary for the requested hosting roles.

## Findings

| ID | Evidence | Finding / implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | Rebased PR40 delta; `tests/test_issue39_acceptance.py` | PR40 has planning, DNS payload, operator instructions, dated evidence and nine preparation checks. It has no runtime/deploy implementation. Its frozen `ec9b8361` public/workflow equality assertion will fail after normal rebase. Preserve history and explicitly supersede preparation-only scope before mapping current execution checks. | AC01/04 | rebase/policy/runbook reconciled; final verification below |
| F02 | Current `site-release-candidate.yml`, `site-candidate-evidence.yml`, `site-production.yml`; `tools/release/` | The missing-pipeline/metadata/recovery claims in the 10 October report are now stale. Main already implements production edition, candidate, full evidence, immutable archives, protected publication and rollback. Reuse and complete these mechanisms. | AC03 | implemented in main; live admission pending |
| F03 | Public Pages receipt and both `site-revision.json` files | Pages staging is already live. Both staging addresses serve Color fingerprint `49ab29ede2d117832a79151f02da524001024fa2109f79a9b55b7921bbb3dbd6`, same scene/content/route identities, edition staging/nonindexable/analytics off. Receipt source `10d3211f6ae91e4c95a310898d8ab7fa858d3e4f` has exactly main's Git tree. This is not a full production pass. | AC01/03 | observed |
| F04 | `tools/pages/controller.cjs:152–155`, `tools/pages/http.cjs:57–58`, `tools/release/actions.cjs:53–60` | Live receipt binds `/oborskyivitalii/`; canonical production requires `/` and an accepted mirror on .ai. An ordinary custom-domain switch leaves an incompatible receipt and blocks publication. Add a bounded authenticated host/base-path migration and recovery, preserving strict ordinary checks. | AC03/05 | source blocker |
| F05 | `tools/release/edition.cjs:41,53`, `site-candidate-evidence.yml:42`, current docs and live staging revisions | Production currently requires base; live accepted staging is Color. Publishing base can change the appearance. Confirm and preserve the intended current appearance before freezing; if it is the approved Color site, add production support and full validation for that rendition rather than remove assertions. | AC03/05 | rendition blocker |
| F06 | Live Cloudflare DNS/ruleset/certificate reads | .ai has only its existing ownership TXT, .com DNS is empty, neither zone lists a dynamic redirect ruleset. Both Universal packs are active. GitHub Verified was already maintainer-confirmed on 10 October; preserve it. GitHub's DNS-only .ai certificate remains a separate launch step. | AC02/04/05 | routing pending |
| F07 | Public environments read; release validators and runbook | `github-pages`, `preview`, `staging` exist; no `production` environment was returned. Production App/credentials, immutable releases, exact protection rules and opt-in require authenticated observation/preparation. A workflow file or public 404 is not proof of actual administration. | AC03/04 | provider setup pending |
| F08 | Current release/profile owners, live receipt | Bounded staging and unit tests do not admit the production artifact. Full candidate validation, applicable rights/independent/device evidence, canonical-origin verification and recovery remain. Reconcile existing supplied permissions; do not ask approved people again. Analytics enablement is a pre-first-release #8 decision; actual observations follow activation. Search Console/query learning has its separate origin/access-dependent disposition. See the linked issue audit for the corrected task scope. | AC03/05 | release evidence pending |

## Live evidence and limits

- Public Pages receipt returned 200: basePath `/oborskyivitalii/`, no production,
  staging public digest `e2c40e12b26e5a87f9ef89163b268a922ce6d383b601e7c1aabebdbc344b9ee4`,
  publisher run `38239942377`, attempt 1, controller `fd3dea5b2271123468560e1eb4dc3f0aa056b6b2`.
  Both staging revision files returned 200. This audit inspected identity records,
  not every served asset or authenticated retained artifact in that historical run.
- Main navigation run `38242013477` succeeded. A matching-current-source full
  production pass was not established by this audit.
- Cloudflare zones are active. Existing ownership TXT record
  `466edebf239247c914621e5e5d3e858d` is retained. Direct Upload project
  `oborskyi-author-ci-staging` retains `production-disabled` and no canonical deployment.
  Latest provider deployments include PR68 and PR79; they are not the stable alias.
- Real-domain HTTP probes returned 502 in this environment. Combined with API
  evidence of absent routing, production is not admitted; this probe alone is
  not a diagnosis of origin/TLS behavior. No provider writes occurred.
- Public environment inventory does not expose secrets, repository variables,
  hidden ruleset bypass actors, Pages domain/HTTPS or release-immutability settings.

## Decisions

- Retain #39 and PR40 as owner/execution route; reuse #72's integrated mechanics.
- Proposed final topology is production `.ai/`, Pages mirror `.ai/staging/`,
  existing Cloudflare staging and PR previews. This follows the existing combined
  package; no extra hosting project is required.
- Treat Color/base selection as a concrete launch prerequisite. The recommended
  result preserves the approved current staging appearance. No alternative
  appearance is silently selected by a hardcoded production default.
- Keep production inactive during preparation. Execute the eventual cutover only
  with the concrete candidate, release evidence and applicable maintainer decision.
  This is the goal's release boundary, not a request to repeat ownership approval.
- Report/test/config edits follow CS01/CS05/CS08/CS09/CS10, mapped as the
  AC04 style subcondition before edits. Current main's style guard and mappings
  are retained. No runtime/style change or additional browser matrix is needed.

## Sol tasks

| Task | Owners and expected outcome | Finding / AC | Verification | Status |
| --- | --- | --- | --- | --- |
| T01 | Append scope decision; rebase PR40 onto fresh main; retain historical audits, adapt current issue39 policy to current domain/release outcomes and add style subcondition. Update production guide, catalog/RI/CI routes without changing unrelated site content. | F01 / AC01/04 | Clean exact refs, reviewed full diff, Basic, owning policy, RI/CI/style checks; old historical evidence stays labeled. | implemented; final exact-source evidence below |
| T02 | Audit visual differences and implement production support for the intended current rendition in `tools/release/edition.cjs`, candidate/full wrappers and applicable source/artifact/profile validators. Preserve current content/animation/fallback budgets. | F05 / AC03/05 | Selected variant and runtime hashes agree from main through candidate/archive/live; meaningful wrong-variant rejection; full selected-rendition matrix. | pending |
| T03 | Add explicit source-bound project-prefix → canonical-root migration to existing Pages controller/workflow. Authenticate and retain old accepted receipt/run/package/settings before domain binding (old github.io may then redirect); compose target root + staging, serialize cutover and verify new receipt. Keep receipt workflow allowlists compatible with later ordinary staging. Do not merely relax basePath or accept arbitrary redirects. | F04 / AC03/05 | Unit/negative tests for wrong host/prefix/source/production/expired recovery; domain-switch success and failure with old/new origin checks and compensating restore. | pending |
| T04 | Observe/prepare actual Pages Actions source, protected main/environments, dedicated Production App, `protect-production`, immutable Releases and variables/secrets through authorized admin path. Prepare exact finite DNS and redirect payload. Opt-in remains off until release. | F06/07 / AC02/03/04 | Authenticated settings evidence, no secret disclosure, existing TXT untouched; missing/mismatched controls block publish. | pending |
| T04A | Review PR40's complete delivery diff/visual edition, mark ready, pass raw-head Basic/RI/owning checks, obtain ordinary two-host `/stage` admission at the existing github.io project prefix, and merge the unchanged admitted tree through the existing protected-main route when authorized. Record admitted head, actual merge/tree and controller identity. | F01/04/05 / AC03/04 | Actual source checks, both enabled publishers, fresh Staging admission, applicable independent review and source-tree equality at merge; no canonical-domain activation yet. | pending |
| T05 | Freeze current-main content/runtime plus reviewed delivery changes into one production artifact using existing candidate workflow; isolated candidate URL; full evidence wrapper; reconcile source-bound rights/device/independent evidence. | F02/08 / AC03/05 | Actual full Linux/native/performance/security/accessibility/failure/Color cases as applicable; exact artifact digests; original budgets; external evidence, no rebuild after validation. | pending |
| T06 | With candidate and recovery ready, bind .ai in GitHub before DNS. Apply reviewed DNS, obtain GitHub TLS/HTTPS and execute tested migration to accepted canonical-root Pages staging. Keep CF aliases unchanged and production opt-in off until its release decision. | F04/06 / AC02/04/05 | Live all-host DNS/TLS and migrated receipt/root/subtree/artifact checks; failed transition restores verified old settings/package. | pending |
| T07 | Enable authorized production opt-in and publish the same fully admitted immutable archive through existing production controller; compose production root with retained staging. | F02/08 / AC03/05 | Production routes/assets/canonicals/robots/sitemap/404/headers/passive scan, staging unchanged, immutable Release and correct source/tag/deployment/active labels; failure stays red with recovery. | pending |
| T08 | Apply .com/www.com one-hop 301 redirects, validate both schemes and encoded/repeated/empty query cases, www.ai canonical behavior, final two-host staging, archive and recovery. Refresh issue evidence/checkboxes. | F06/08 / AC02/05 | Actual public redirects/path/query/TLS/no loops; production and staging identities; accepted rollback evidence with separate first-release recovery limits. | pending |

T02–T04 can be prepared in parallel after T01. T04A integrates their reviewed
changes. The existing candidate workflow requires `candidate_sha` to equal its
protected current-main controller SHA, and production authenticates the merged
source PR; T05 therefore consumes that merged main, never the unmerged PR head.
T06 waits for candidate/recovery readiness; T07 follows
canonical-root admission and the release decision. No production rollback target
exists before the first accepted release: first-release failure restores the
accepted staging package, not an invented previous production release.

## Acceptance evidence

| AC | Current result | Evidence / remaining gate |
| --- | --- | --- |
| AC01 | Live inventory refreshed; preparation schema remains historical | Exact refs, public HTTP/API observations above; run reconciled current-main report/rebase policy on final commit; no claim of full release acceptance. |
| AC02 | Planned topology exists, actual routing pending | Existing finite domain fixtures; .ai/.com/www live acceptance remains open. |
| AC03 | Core publisher/metadata/archive implemented on main; not production-admitted | Current source plus focused release cases; migration/rendition/settings/full/external release evidence remains open. |
| AC04 | Ownership complete, report and next tasks prepared | Existing Verified retained; rebase/policy/runbook reconciled; provider settings, release implementation review and merge pending. |
| AC05 | Production absent | Current staging identity is observed; real-domain production/TLS/redirect/recovery acceptance pending. |

Read-only release audit ran on exact main `cc115c4`:
`node --test tests/pages-delivery.test.cjs tests/release-archive.test.cjs tests/release-controller.test.cjs`
— 38 passed, zero failed/skipped. These are meaningful behavioral/negative source
tests, not live settings or full production evidence. Final rebased-branch checks and exact report commit are recorded in the
issue/PR checkpoint; dirty/prepared runs are not clean-source acceptance.
The separate release-audit subagent also reviewed this plan against those owners;
its finding about the required merge-before-candidate milestone was incorporated
as T04A. This is scoped independent plan review, not completed release acceptance.

## Rebase verification and independent review

All four original PR commits were replayed onto exact main `cc115c4`; authored
historical audits and the finite DNS manifest match pre-rebase `da7ac22` byte
for byte. Current public/runtime/build/Pages/release/quality/workflow path sets
and Git blobs equal that main. Current-main preservation is an explicit bounded
plan/rebase check, superseding only the old preparation baseline by the live
15 October scope amendment. It must be remapped before future delivery code work.

Prepared-source verification: all ten mapped policy checks passed, including
Basic, the bounded current style guard, exact public/delivery preservation,
finite domain/negative/redirect fixtures and RI/coupling. RI regressions passed
28/28 and coupling regressions 20/20; six focused issue39 methods passed.
Prepared runs declare `source_dirty: true`; final clean-source checks and exact
commit/tree are linked from the issue/PR checkpoint after commit.

A separate read-only reviewer checked the full T01 delta, historical identities,
current-main parity, current guide/task sequencing, focused tests, RI and style.
Its only finding was ambiguous wording implying receipt migration before domain
binding; corrected to prepare/test and retain the old package before binding,
then execute migration when the canonical origin exists. No other T01 findings.
This scoped review does not complete future code, provider or release acceptance.

CS01/CS05/CS08/CS09/CS10 review: edits stay in their authored guide/test/config
owners; existing runtime and delivery controls are unchanged; no new browser
matrix or formatting migration. The task test remains an owning-policy-only
suite by the existing exact numeric task-file selector. No enduring test,
profile, scanner or budget is removed. External gates stay explicitly pending.

## Official references

- [GitHub Pages site limits and types](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
- [Custom domain, DNS and HTTPS order](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
- [Actions-based Pages deployment](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Issue synopsis

Main already has the production pipeline and live two-host staging. PR40's old
readiness description is superseded by this report. Continue the same PR with
current acceptance, rendition parity and authenticated Pages base-path migration,
then candidate/full evidence, settings, canonical cutover, production and redirects.
Rebase and plan reconciliation complete; not merged or published to production.
Color parity and authenticated Pages migration are the next implementation steps.
