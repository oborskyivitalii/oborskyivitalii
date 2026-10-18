# Issue 39 — production preparation implementation

Owner: [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39),
[PR40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40).
Date: 15 October 2026. The maintainer authorized execution after correcting the
dependency scope to production-relevant issues only. This follows the
[current-main plan](2026-10-15-production-plan.md) and
[selected issue audit](2026-10-15-release-issue-audit.md).

Baseline main: `cc115c4241197d59205934bdc18f209109d5ee87`, tree
`0820a951b17f375bca61aea4e70785dbb9376468`. The earlier report/rebase checkpoint
`6df5d4dc11ba946d9be616f21fac30712799de1b` preserved all delivery bytes. This
implementation intentionally changes delivery tools/workflows and regenerated
identities while preserving authored page content, assets and approved runtime
behavior. The dated live #39 scope amendment precedes those changes; AC01–AC05
and external acceptance gates remain stable.

## Approved licensing amendment and staging order

The maintainer subsequently selected the full implementation scope in the
[licensing proposal](2026-10-15-licensing-proposal.md): original engineering,
including CSS/templates/rendering, is Apache-2.0; original editorial material
and non-brand diagrams are CC BY 4.0. The live decision is recorded in
[#7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7#licensing-selection-20261015)
and [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39#licensing-selection-20261015).
[LICENSING.md](../../LICENSING.md) owns the effective scope and exceptions.

The exact named content amendment replaces restricted-reuse Credits copy,
explains independent UA/Subprime terms and identity/portrait/third-party
exceptions, corrects the preferences sentence and discloses production-only
aggregate analytics. Four complete authored license/scope/notice texts are
embedded in expandable Credits sections, including the offline rendition.
Only `.legal-notices pre` gains wrapping CSS. Unrelated source copy, SEO metadata,
JavaScript and retained immutable bytes remain protected. The rights compiler
verifies the full copies against their source owners; policy selection does not
sign the separate future exact-candidate rights/editorial acceptance.

Required order is now changed-content **permanent staging → maintainer review →
later production**. A narrow controller registry dependency can preserve main's
current public bytes and use ordinary admission because no new public paths or
snapshot schema are introduced. No earlier bootstrap waiver is reused.

## Implemented

| Work | Result | Evidence boundary |
| --- | --- | --- |
| Color production | Candidate explicitly selects Color; full validation consumes that same edition. Exact plain/staging/production tuples preserve approved JS/CSS hashes, fixed reading/flight checks and budgets. Historical tuples remain available for retained packages. | Source checks do not replace the complete hosted candidate matrix. |
| SEO preservation | Existing canonicals, JSON-LD, robots, sitemap, native links and query policy remain. All five production routes receive absolute Open Graph/Twitter image metadata from the existing supplied portrait, including dimensions/type/alt; artifact/live MIME checks bind the actual image. | Actual .ai status, indexing eligibility and crawler observations follow deployment. |
| Retained editions | Color and production preserve declared prior immutable snapshots/runtime/media byte for byte. Collisions or missing dependencies fail. Staging still removes historical unlabelled HTML/runtime and applies its strict noindex/badge/no-analytics policy to every served HTML file. | Fourteen explicit prior public files are retained in production; retention grants no new reuse rights. |
| Pages migration | Owner/main `prepare → execute → recover` workflow authenticates the accepted old publisher/run/upload digest and freezes its exact package/settings before binding. Execute verifies source/controller/production leases and canonical settings, preserves staging bytes, and updates receipt/404 for root. Ordinary publishers accept its exact authenticated receipt. | Domain/DNS settings are external operations. Recovery requires restoring captured settings, then exact failed execution/preparation attempts. Failed execution stays red. |
| Rights inventory | Maintained `site/rights.json` covers original material, assets/provenance, linked metadata, supplied consents, retained files and component notices. Candidate compiles a source/artifact-bound report; admission requires an explicit owner policy decision and separate matching human rights evidence. Archive retains raw report SHA and inventory digest; rollback validates the frozen report without reading today's source. | The scoped license selection is now recorded. Inventory coverage and synthetic test confirmations are not exact-edition legal/editorial approval. Existing supplied portrait and Kopko/Basir consent are preserved. |
| Analytics preparation | Registered the actual canonical hostname in the owner's Cloudflare account, manual mode with automatic injection off. Source contains the returned public beacon token, exact canonical URL and enabled first-release configuration. Existing origin/path guard excludes preview/github.io/offline/snapshots; staging/review exports strip tracking. | No production deployment, collected visitor data or actual hosted SDK performance is claimed. Search Console remains access/origin dependent. |

The earlier pre-licensing Color family used base engine
`77a4d80ad8427e79d10a7c3cb6a5dd20a858296b74fef3e735e5f20578a428ad`.
Its Color fingerprints are plain
`38fd594346f5250133ff433c27bc25eb2e1bfc7865f53dd3a3be783690d14fcc`, staging
`20001067aff1664b0dafe384dc1de7e3a1ce4d4a5647cc84d9f3eed639f63af8`, production
`b4202b7c567affcaaad94eec403329d45ea18fbfd886ac0a3556926ca045f196`.
Regenerated runtime/snapshot paths reflect producer/config identity changes;
the five canonical JS/CSS runtime bytes matched the baseline. The selected legal
content and wrapping rule require a new exact family; current identities belong
in the registry and matching source/deployment evidence.

## Provider observations

Cloudflare Web Analytics preparation used account
`3b938b72a4ad0ac10b9102e0534e75c0`. Fresh list first showed no site for the host;
one bounded registration created site tag `0ce18ea35aa44d5fb10398d6692a8785`
at `2026-10-15T06:32:08.5489Z`. Readback confirmed host `vitaliioborskyi.ai`,
manual beacon mode and automatic injection off. The public token is a rendered
beacon identifier, not an account credential. No DNS/proxy, Pages domain,
production deployment or automatic script injection was changed.

Authenticated GitHub inspection found active strict `protect-main` ruleset
`24568553` with required `checks` and `Local navigation and RI` contexts from
integration15368; the additional `Staging admission` context is still missing.
No `protect-production`, production branch or production Releases were returned.
Release immutability is unverified. Branch-protection inspection lacks connector
Administration access; environment/Pages administration endpoints are unsupported.
These observations cannot be upgraded to configured controls by source tests.

## Verification and review

The owning policy replaces the obsolete all-delivery byte freeze with authored
content/runtime preservation plus executable production, retention, analytics,
rights/archive and Pages migration behavioral checks. Historical DNS/provider
fixtures remain historical; live admission remains separate. New owners, tests,
workflow and generated paths are explicitly registered in the catalog/profile/CI
coupling map. Final clean-head validation and remote run identities are recorded
in the live owning issue and PR, avoiding a self-referential commit identity here.

Focused source checks cover wrong/mixed Color identities, missing social images,
immutable file collision/loss, pending owner policy, missing/stale human rights
digest, altered/missing archived report, exact old-source restoration after source
deletion, wrong origin/prefix/publisher/ZIP/attempt, successor/production lease,
failed migration recovery and bounded ZIP extraction. Analytics fixtures cover
enabled/disabled origin guards, one SDK instance, blocked loading and export
isolation without sending visitor data.

Independent migration review inspected real workflow/artifact layout and reran
23 Pages tests: no blocking findings. Separate release admission review found a
historical rollback dependency on today's portrait/social sources. The new
intrinsic frozen-edition verifier fixes it; candidate source verification stays
strict. The reviewer reran controller/archive28/28, final historical/passive4/4
and analytics/Color19/19 with no remaining blockers. Subagent review is code review, not
the maintainer's legal, physical-device or visual approval.

Code-style review covers CS01/CS04/CS05/CS08/CS09/CS10 for the touched source,
tests, workflows and policy. The bounded style guard is supplementary; authored
owners, proportional checks, readable control flow and honest evidence were
reviewed explicitly.

The separate licensing reviewer inspected the authored map/notices, exact full
copies in current alias/immutable Credits across all three diagnostic editions,
five interactive offline payloads and the59-entry ZIP/hash manifest. All four
copies/anchors were complete; retained14 bytes and staging noindex/badge/analytics
isolation passed. Existing size budgets passed. The only CSS addition is the
scoped wrapping rule (CS03). No remaining source/package blocker was found;
diagnostic packages were explicitly dirty-source evidence, not final admission.
The local exact Chromium download failed before installation, so visual browser
review and native hosted evidence remain separate requirements.

The first complete source profile and native Basic/AC03 checks on licensed tree
`cc583600d0cd313f035fa070f709c00c4c319f8b` failed: temporary analytics/engine
fixtures omitted the new root legal owners, and the canonical SEO checker still
expected the former Credits notice. Fixture copies and a precise hash-bound
licensing reversal in the existing SEO owner correct those dependencies; the
historical SEO baseline, unrelated copy/metadata and stylesheet bytes remain
strict. New failure cases cover altered or relocated full notices and policy,
source, link and CSS drift. The full profile must pass again on the fixed clean
head; the original failed source runs are not relabeled.

A desktop interaction with the actual licensed PR preview rendered Credits,
followed the Code License anchor and opened the complete Apache text. The
computed pre-wrap rule and document width showed no horizontal overflow at that
viewport. This supplementary browser observation is not the native staging
matrix, physical-device review or the maintainer's visual approval.

## Current-main controller compatibility

A separate read-only audit reproduced a pre-integration staging boundary on
clean PR source `9bc0dd64a891ba80927512958e8ab28640d6996f`, tree
`87029cd6e0ce14e52c91e509438003d03eb672d8`, against main `cc115c4`.
An actual scratch-built Color staging package has public digest
`1f69937d11f0a07c0044bc6642c0344d3a9ce1af9c482c4e2759603468a2f37e` and selects
`issue39-staging` under the PR registry. Exact current-main selector bytes reject
that manifest with `unreviewed Color motion runtime`.

The ordinary main controller's promotion gate checks report/identity coverage
without dispatching the Color selector. Its Pages workflow then deploys/checks
HTTP before `local-browser.cjs` calls the main selector. A known-failing `/stage`
would therefore reach actual publication before triggering Pages/Cloudflare
recovery; it was deliberately not dispatched. Traced workflow/package/snapshot/
gate/browser owners are unchanged by this implementation. No package/schema
blocker was found beyond the missing reviewed registry family.

The owner-triggered `staging-regression` preview-evidence route was invoked on
that exact source in run38696533108. It uses candidate validators, skips ordinary
admission/stable promotion/Pages publication and retains bounded premerge evidence.
Its final result is recorded in the live PR/issue. This record does not admit
production or replace ordinary two-host staging.

The bounded run subsequently failed: native static artifact11955111383 reported
207 untriaged secret candidates (hashed-only report); browser collection retained
a30-second API request timeout and Writing smoke TBT380.5ms against the unchanged
200ms budget. The complete gate remains failed. Candidate values need individual
provenance review; no broad scanner exclusion or performance-budget relaxation
was added. The maintainer then paused the release path for the separate
[licensing proposal](2026-10-15-licensing-proposal.md) and changed-content staging
review. These failures remain required follow-up, not successful admission.

Subsequent individual triage proved the207 candidates are public generated/asset
hashes, immutable Git identities or public provider identifiers; each has an
exact path/type/value-hash ledger record. Actual pinned Bandit1.9.4 retained36
identical findings; eight checker records were rebound after four root-name
literals shifted their source. Fresh exact-head native evidence is still needed;
the original failed run and200ms budget are unchanged.

Before ordinary staging, integrate the exact registry compatibility on protected
main through a separately reviewed narrow increment preserving main's public
bytes, then rebase/recheck PR40. An alternative requires a concrete one-time
maintainer controller-bootstrap decision for the reviewed PR40 tree. Previous
bootstrap approvals are exhausted. Passing tests supply neither a standing waiver
nor that new merge decision.

## Remaining production sequence

1. Finish exact-head source/RI/owning checks and scoped preview evidence. Resolve
   the current-main registry compatibility above before ordinary two-host
   staging/admission and protected-main integration. Preserve unrelated PR work.
2. Complete one operator settings pass: add `Staging admission` to existing
   strict main protection; enable immutable Releases; install the dedicated
   Production App and exact `protect-production`; configure protected main-only
   `production`/`github-pages` environments and the three documented App settings.
   Verify Actions Pages. Keep production opt-in false until release admission.
3. Preserve the selected Apache-2.0/CC BY 4.0 scope, exceptions and existing
   supplied consents. Compile the final candidate inventory and
   attach separate maintainer evidence referencing its inventory digest.
4. Freeze merged protected main as the Color production candidate and run the
   complete exact-artifact validation. Complete applicable independent/editorial,
   actual iOS/Android/device and recovery evidence under #1/#7/#13/#72.
5. Run Pages migration `prepare` before domain binding, retaining run/attempt and
   package/settings. At cutover bind .ai, apply finite DNS/TLS configuration,
   execute the exact migration and verify canonical root/staging plus recovery.
6. By the concrete release decision, enable production opt-in and publish the
   same admitted archive. Verify exact live hashes, canonical/indexing/image/404,
   retained files and both staging hosts; then apply/test .com/www one-hop301
   path/query redirects and www.ai canonical behavior.
7. Verify actual analytics SDK requests, SPA/history/reload/filter behavior,
   reported counts/paths and hosted cost. With owner access, verify Search Console,
   submit/inspect sitemap and record indexing/query baseline or exact pending action.
8. Update only #1/#7/#8/#13/#39/#72 with their matching evidence. Close each only
   when its original applicable criteria pass; later #72 lifecycle requirements
   may remain open. Closed SEO14 remains accepted source evidence. Unrelated
   feature/publication issues remain outside this PR.

Runbooks: [production/cutover](../../guides/SITE-PRODUCTION.md),
[release controls](../../guides/SITE-RELEASE-GATES.md),
[rights](../../guides/SITE-RIGHTS.md), [analytics](../../guides/SITE-ANALYTICS.md).
