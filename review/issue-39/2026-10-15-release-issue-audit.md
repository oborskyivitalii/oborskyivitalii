# Issue 39 — 2026-10-15 production issue audit

Owning issue: [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39).
Owning PR: [#40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40).
Dated issue anchor: [production dependency audit](https://github.com/oborskyivitalii/oborskyivitalii/issues/39#production-dependency-audit--15-october-2026).
Role: root synthesis with three independent read-only audits of SEO, rights and
release/lifecycle dependencies. This is a dependency/plan review, not a release.

Inspected source: main `cc115c4241197d59205934bdc18f209109d5ee87`, tree
`0820a951b17f375bca61aea4e70785dbb9376468`; PR40
`7b9f0d2e8bbf784b01d4a07815d0e8f95a353e2e`, tree
`a3ce11179cbed2fbf8b8eff06530082240092d6f`. GitHub open-issue inventory contained
14 issues. Inspection selects only six production-related owners for PR40.
Their original scope, amendments and remaining criteria determine release work.
Closed #14 remains a reference for the already accepted SEO layer.

## Intent and acceptance

The maintainer requested linking only production-publication-related issues
to PR40. The subsequent clarification explicitly rejects linking every open issue.
The earlier broad linkage was an execution mistake: unrelated added blocks are
removed and the operational matrix is narrowed to the six release owners below.
Keep #39 as the single owning policy line, with explicit dependency links to the
other issues. Preserve their own intent/AC IDs and existing execution PRs.
This increment does not choose a license, import unrelated features, merge,
change provider settings, activate analytics or publish production. A dependency
link is not an automatic closing instruction.

The current launch target is the current-main edition plus reviewed delivery
fixes. Separate feature/publication work is outside this PR's completion scope.

## Selected production issue disposition

| Issue | Relationship to PR40 | Remaining outcome / closure rule |
| --- | --- | --- |
| [#1 — launch](https://github.com/oborskyivitalii/oborskyivitalii/issues/1) | Launch umbrella | Current edition's first-reader/editorial/rights/device acceptance, working contact/routes and actual public release. Close after final launch reconciliation, not PR merge. |
| [#7 — licensing/rights](https://github.com/oborskyivitalii/oborskyivitalii/issues/7) | Required rights dependency for shipped edition | Explicit maintainer reuse policy, shipped/retained asset inventory, notices and exact-edition rights/editorial record. Can finish before release once its whole bounded scope is satisfied; production is not the missing license decision. |
| [#8 — hosting/URL/measurement](https://github.com/oborskyivitalii/oborskyivitalii/issues/8) | Shared release execution | Canonical domain/absolute social image, actual analytics activation/verification, hosted indexing/links and Search Console disposition. Close only when its actual measurement/hosting criteria are satisfied. |
| [#13 — release gate](https://github.com/oborskyivitalii/oborskyivitalii/issues/13) | Required release acceptance | Exact frozen full candidate matrix, physical iPhone/iPad Safari/modest Android, independent/rights evidence, origin/security/analytics and actual recovery. A successful first deploy does not prove an exercised rollback or every device criterion. |
| [#39 — domains](https://github.com/oborskyivitalii/oborskyivitalii/issues/39) | PR40 owner | Color production support, authenticated Pages prefix migration, actual settings/domain/DNS/TLS/redirects, release admission and public identity. Ownership Verified is already complete. |
| [#72 — delivery controller](https://github.com/oborskyivitalii/oborskyivitalii/issues/72) | Shared release/lifecycle implementation | Two-host staging is implemented and observed; strict Staging admission administration, production-root preservation/recovery, protected actual production/archive/lifecycle evidence remain. A first release alone cannot prove a successor and rollback cycle. |

Closed [#14](https://github.com/oborskyivitalii/oborskyivitalii/issues/14) is the
remembered redesign/SEO-preservation ticket: owner-accepted and completed on
7 October. Preserve its SEO invariants; do not reopen or count it as unfinished.
Applicable existing runtime, physical-device and full production-cost checks
remain under #13 and the release contract. Separate visual/feature issue closure
and historical probe adaptation are not tasks of PR40.

## SEO preservation and concrete remaining work

`guides/SITE-SEO.md` and `tools/check_site_seo.cjs` already own the topic/evidence
map, immutable baseline `0333c4d`, exact accepted amendments and five-page semantic
reconciliation. Preserve them. Existing crawlable copy, titles/descriptions,
headings, original publication URLs/dates/languages, anchors, attribution,
portrait and JSON-LD are part of the launch artifact. Decorative scene changes
or a domain switch do not justify replacing that content layer.

Production already implements canonical, `og:url`, indexability, robots, sitemap
and real Pages 404 in `tools/release/edition.cjs`; SPA navigation already transfers
canonical/OG/Twitter/JSON-LD metadata. Remaining source work is production Color
admission and the absolute social image required by #8 (`og:image`/`twitter:image`
are currently absent). Add narrow production metadata/asset validation, not a new
router or broad SEO rewrite. Verify five-route Color→production preservation,
filtered Writing canonical, root/deep-link metadata and live robots/sitemap/404.
No ranking improvement is claimed from source tests or metadata.

## Licensing and rights before freezing

#7 is not waiting only for hosting. Credits currently states no general reuse
license; CONTRIBUTING calls site-wide licensing unselected. RI has its own
Apache-2.0 license/notice, which does not license the whole site. A maintainer
policy is needed for authored code/text/design; it may confirm the current
restricted-reuse position or select explicit open licenses. This audit makes no
choice on the maintainer's behalf.

Prepare a compact manifest for the exact shipped edition, including retained
snapshots/runtime/media in `site/retained/manifest.json`, supplied portrait and
its derivative, original SVG/icon, RI notices and linked-publication/discussion
metadata. Record applicable upstream boundaries without automatically applying
UA/Subprime licenses to the personal site. Check asset coverage, notice retention
and consistency with Credits; tests are inventory evidence, not legal approval.

Existing supplied portrait provenance and maintainer-confirmed written Kopko/
Basir advisory consent are recorded: do not request those permissions again.
Current main links external article bodies/videos rather than shipping future
PMDay text/deck/PDF/fonts/logos. Review the actual release; future editions keep
their own rights gates. To close #7, reconcile its original full scope explicitly
rather than treating all future unshipped publications as first-launch blockers.
Bind the accepted rights/editorial record to the same frozen source/artifact
consumed by `tools/release/controller.cjs`.

## Analytics is a launch step; search learning comes later

[The 4 October decision](https://github.com/oborskyivitalii/oborskyivitalii/issues/8#issuecomment-5980972342)
requests analytics before the first release; [the preparation checkpoint](https://github.com/oborskyivitalii/oborskyivitalii/issues/8#issuecomment-5981900893)
keeps collection disabled until actual origin/public beacon configuration.
The prepared adapter is not actual active measurement: `site/analytics.json`
currently has `enabled:false` and null origin/token.

Carry hostname/public beacon configuration, reviewed enablement, regeneration
and exact-artifact checks into the launch plan. Verify staging/offline isolation,
real navigation/query/history behavior, blocked-beacon handling, SDK cost and
actual provider observations after activation. Credentials/configuration missing
from the supported service need a precise owner action, not an invented value.
Search Console property verification/sitemap/URL inspection follows a reachable
origin and authorized account access; record its disposition in #8. Accumulated
queries/rankings and #11 learning come afterward and do not hold up first release.
This corrects the earlier plan's overly broad 'analytics follow-up' wording.

## Ordered consolidated release plan

| Step | Owners and result | Verification / closing boundary |
| --- | --- | --- |
| P01 | #39/#1: pin current-main release scope and keep PR68/79/53 separate unless selected | Explicit content/runtime source and excluded-candidate list; refresh if main changes |
| P02 | #7: shipped/retained rights inventory, reuse policy and notice/credit consistency | Existing consents preserved, asset coverage, exact-edition editorial/rights record; no auto license choice |
| P03 | #8: Color production parity, absolute social image and SEO preservation | Existing SEO checker plus five-route derivative/head/body/catalog/source/anchor preservation and wrong-variant rejection |
| P04 | #8: prepare actual analytics origin/beacon and intended launch enablement | Normal adapter, staging/offline negative cases, production edition hashes and exact provider configuration; no live collection in this audit |
| P05 | #39/#72: authenticated Pages migration/recovery and actual production controls | Old receipt/package/settings retained before binding; strict origins/base paths, main/admission/environments/App/protected ref/immutable Releases inspected |
| P06 | #39/#72: integrate reviewed delivery changes and freeze merged-main candidate | Existing source/owning/RI checks and ordinary two-host admission; unchanged admitted-tree merge; frozen artifact consumed without rebuild |
| P07 | #13/#1: full exact-candidate automated, independent, rights and physical-device acceptance | Existing full cases and budgets; reuse valid unchanged evidence and preserve required lifecycle/device checks; no green-staging substitution |
| P08 | #39/#8/#72: canonical binding/DNS/TLS, migrated staging, same-artifact production publish/archive and .com redirects | Actual all-host HTTPS/path/query/404/canonical/content/assets; production+staging identities; failure restores verified retained state |
| P09 | #1/#7/#8/#13/#39/#72: final criterion-by-criterion reconciliation | Close only completed bounded outcomes. Exercise approved recovery; keep successor/rollback lifecycle, unresolved device/settings and post-launch guides/measurement work open |

PR40 is the release integration route, not a request to merge all feature PRs or
rewrite every issue into a deployment task. It retains exactly one local
`Refs #39` policy-selection line. Other owners are linked dependencies with
namespaced criteria/evidence. No `Closes` directives are added: merge and actual
public acceptance are separate events. First release has no earlier accepted
production archive: rehearse its accepted-staging/settings recovery honestly.
A successor-production/rollback lifecycle can keep #72 open after the first
launch; it is not a circular requirement to perform a second release first.

## Completed criterion found during the audit

#72:AC03 is fully verified and can be checked. Its original condition requires
two accepted revisions at the same stable alias and restoration after a failed
update. The mapped `ADMISSION` unittest passes on inspected PR40. An independent
review downloaded native promotion/recovery ZIPs, matched their SHA-256 values
to GitHub metadata and inspected raw gate, stable HTTP and recovery records.

| Observation | Source / tree / public digest | Actual record |
| --- | --- | --- |
| Accepted revision 1 | be6439b43c983365978587eaf1af465ecda51393 / cfc003882b4c16813efefb162a182e2ce8ce0c55 / 1dbd756b031758a537d4b3d5b2c19b74a4351140163dfa25fc2830a2cf608b64 | [Run38234626344](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38234626344), promotion artifact11741210186 |
| Failed update restores previous accepted edition | New10d3211 fails runtime HTTP404; rollback restores be6439b/public1dbd756b/package55214fc3a611fd3c6cf7671f4da205e196a1d1af920f11c5c26aac492e71027b | [Run38238062981](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38238062981), artifact11742516345, passing rollback-http; no accepted new recovery |
| Accepted revision 2 | 10d3211f6ae91e4c95a310898d8ab7fa858d3e4f / 0820a951b17f375bca61aea4e70785dbb9376468 / e2c40e12b26e5a87f9ef89163b268a922ce6d383b601e7c1aabebdbc344b9ee4 | [Run38239942377](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38239942377), promotion artifact11742839086 |

Both successful stable HTTP records and the rollback HTTP record use the same
permanent Cloudflare alias, verify
ten exact file hashes and root/actual404/noindex behavior. Recovery artifacts
11740329642/11742494417 agree with the accepted source/package. This checks
Cloudflare AC03; it does not establish production-root preservation, combined
Pages recovery or a durable production lifecycle. Other #72 criteria stay as-is.

## Acceptance evidence and limits

This audit changes review/runbook/navigation metadata only. No runtime, authored
site content, public output, deployment workflow, provider, license decision or
issue closure is changed. Applicable CS01/CS05/CS08/CS09/CS10 follow the existing
AC04 style subcondition. No new test suite or browser matrix is justified.

Independent read-only SEO checks on inspected PR40: the focused production
metadata test passed (1 selected case), and render-function comparison preserved
five-route metadata/parsed JSON-LD and the Color body. These do not overcome the
production build guard rejecting Color or establish full/hosted acceptance.
The initial SEO-check invocation could not start its missing local Python helper.
After reusing the existing pinned PyYAML6.0.3 toolchain, the normal
`node tools/check_site_seo.cjs` passed all five exact content/metadata rows against
baseline0333c4d. No source or output changes were needed. Final report/rebase
policy results are recorded at the exact published checkpoint in #39/PR40.

Only #1/#7/#8/#13/#39/#72 retain production relation/remaining-outcome notes.
The mistakenly added blocks in unrelated issues are removed, preserving their
pre-existing descriptions, relationships, states and acceptance. Closed #14 is
restored to its previous description; its SEO invariants remain source evidence.
The independently verified #72:AC03 tick is retained. No issue is closed early.
