# Issue 39 — 15 October 2026 mandatory publication licensing

Owning issue: [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39#mandatory-publication-licensing-20261015),
with rights policy in [#7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7).
Execution: [PR40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40).
Reviewer role: implementation self-analysis; independent review is recorded separately.
Inspected baseline: `fb653f68fe1cfa12f5726ea7e12bc316b474e5c2`, tree
`bca82e1fe663cfb78ed0e9789b3a31fa3e2c6c86`; this additive source is not deployed.

## Intent and acceptance

The maintainer requested a preview first, repository licenses, and mandatory
licensing checks in staging and production so every publication carries its
appropriate record. Reuse the existing rights inventory, publication and archive
owners. Preserve AC01–AC05, all human/live gates and the approved scoped Apache-2.0
and CC BY 4.0 selection. Coverage is never exact-edition human acceptance.

## Findings and decisions

| ID  | Evidence and consequence                                                                                      | AC   | Disposition                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 | Production already freezes `rights.json`; staging did not retain it.                                          | AC03 | Both edition CLIs now freeze the report before the existing whole-directory upload.                                                                                     |
| F02 | Staging deliberately omits prior HTML/runtime; requiring all production retained files rejects a valid stage. | AC03 | Exact four retained media versus fourteen production retained files; no broad omission.                                                                                 |
| F03 | Main controllers and historical recovery cannot import current legal sources to approve another edition.      | AC03 | Shared source-independent `rights-record.cjs`; compiler/checkout verification remains separate.                                                                         |
| F04 | Per-publication deployment identity does not assign licenses to external articles.                            | AC03 | Explicit linked-only record per 46 editions/29 works, no shipped bodies or site-assigned grant.                                                                         |
| F05 | New code in a PR workflow does not execute in the protected-main ordinary staging controller.                 | AC03 | Existing candidate CLI entrypoints produce/require the report; the separate narrow controller compatibility increment must retain it through the first Pages publisher. |

The frozen report binds clean source commit/tree/candidate, selected edition,
complete public manifest, owner and notice hashes, scope/bases/upstream boundaries,
and the rendered full legal blocks in both current Credits copies. Its sibling
location leaves public HTML/JS/CSS, Color identities and artifact digest unchanged.
`approvalPass: false` remains deliberate. Historical production composition uses
its externally trusted archived report digest; today's policy cannot relicense it.

The existing catalog contains linked metadata only. Unknown public article/PDF
paths and unsupported catalog bodies fail. A future hosted article feature must
extend this same rights owner with exact source/author/license/attribution and
exceptions; this increment supplies no article engine or semantic classifier.

## Execution and checks

| Task | Owners                                                                    | State                                                                             |
| ---- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| T01  | `rights.cjs`, shared `rights-record.cjs`, both edition CLIs               | Implemented; focused tests check source/edition/bytes and rendered copies.        |
| T02  | Staging package, Pages package/controller, existing reusable checks       | Implemented; exact report and digest carried through package/extraction/recovery. |
| T03  | Existing production archive/controller/actions and Pages workflow         | Implemented; new admission strict, trusted historical report preserved.           |
| T04  | Existing rights/delivery/archive fixtures, profile inputs, catalog and RI | Updated; final integration must regenerate RI and run clean source checks.        |

Focused run: 97/97 across rights, analytics, Pages delivery/migration, release
archive/controller and staging tests (`/tmp/license-publication-cli-order-reviewed-all.tap`). The
independent reviewer found that comment/inert wrappers could hide otherwise exact
full license texts. Subsequent nested and slash-attribute repros invalidated
the initial regex fix. The shared verifier and compiler now use a bounded,
quote-aware tag/context stack with raw-text, nested inert/hidden and foreign
contexts. Ambiguous attribute syntax, malformed/unclosed markup and token/depth/
byte overflow fail. Coherent actual revision, artifact and report rehash negatives
cover nested, quoted, raw-text, inert and slash-attribute wrappers; disclosed
ordinary legal blocks still pass. These checks establish this generated markup contract, not
computed CSS visibility or human readability.

The comprehensive guard review also found that the actual analytics browser
fixture copied `site/` and `tools/site/` but omitted the root legal owners. Its
existing fixture producer is now extracted and called by both `run()` and a real
source test. It copies exactly the actual legal module's declared root owners;
a genuinely earlier producer without that module retains its four original
input roots. Missing/symlink declared owners fail. Hosted and all five offline
outputs build through the real producer, without mocked copies or a browser:
12/12 analytics tests pass (`/tmp/license-publication-actual-analytics-fixture-fixed.tap`).
The search of actual tool source-copy/build sites found this one affected caller;
other matches copy already tested artifacts. Narrow compatibility patches remain
separate from this Root licensing implementation.

This is local source
evidence on a prepared tree; it supplies no native staging or production pass.
CS01/CS04/CS05/CS08/CS10 apply: one existing rights concern, finite frozen data,
readable source and adverse cases. Final formatter/lint/Basic/RI checks and the
independent review must be bound to the frozen integration tree.

## Remaining acceptance

The maintainer paused publication and PR40 integration for a comprehensive review
and repair of staging/production guard tests in the preparatory PR80. This local
checkpoint is review input; no further publication follows from these passes.
The follow-on guard repair now exercises both actual edition CLIs and the actual
package gate/package CLI in a small clean temporary Git checkout. It asserts the
sidecar exists immediately on return, before the upload boundary, binds real
source commit/tree and rejects missing/stale sidecars and substituted source/tree.
Both staged and production packages retain the exact emitted report. The test
uses real local producers and child processes; no browser/provider is involved.

Production preparation now freezes the archive locally, composes and verifies
the complete Pages package, then writes draft archive assets through a separate
entrypoint. A child-process guard verifies five local package/rights fault cases
reach zero provider calls. Archived bytes, production root/receipt, licensing and
the preserved staging subtree are revalidated before that first write. Fresh live
authentication and deployment leases remain unchanged. This Root-only repair
does not import absent production features into the preparatory controller PR.
Independent frozen/source admission of these follow-on guards remains separate
from the earlier bounded markup review.
After that review, the controller compatibility port must make the first actual licensed staging
publication retain its record on both hosts. Then run source/native staging,
verify actual permanent URLs and give the maintainer the changed-content review.
Production/domain/DNS and exact-edition rights/editorial/device acceptance remain
pending. No issue closes through these source tests or report generation.


## Verified guard integration into the licensed feature

The later maintainer instruction resumes PR40 after the preparatory guard review.
This integration starts from feature `7416e1e` and imports verified guard `4f6e324`.
All authored/public/site bytes, four root legal owners, existing portrait/advisor
consent and source policy remain feature-exact. Full production Color tuples,
archive/migration/recovery code and the complete issue39 acceptance map remain;
the guard-only main-preservation phase map does not replace the feature contract.

The staging package combines the closed host-policy option with explicit
publication/checkout flags. Its actual CLI retains exact clean-checkout rights
verification; default legacy host output and frozen consumer verification remain.
Pages supports genuine historical reportless packages while requiring modern
licensed-family reports, receipt parity and both extraction sidecars. Accepted
historical production reports bind their trusted archived digest rather than
being recompiled from current legal sources. Both root and staging actual404
observations now retain the shared MIME guard.

The existing workflows retain exact request authentication, one source/preflight
execution before deployable upload and always-retained failure observations.
Production candidate preparation retains explicit Color generation and rights
outputs. No workflow or source flag activates production. The existing package CLI
explicitly selects the prepared finite snapshot proxy policy alongside strict
publication/checkout checks; default legacy APIs and historical verification stay
exact. Selected snapshot HTTP checks require direct200, zero redirects, exact body,
MIME and immutable cache. Draft preview enumerates only verified source snapshots;
staging reuses its original HTTP inventory requests. Measured flight drivers, cold
contexts/cache setup, windows and all original performance budgets remain unchanged.
Actual provider200 behavior and performance still require native preview evidence.
The full Color fixture now supplies the browser provenance demanded by the
reviewed validator, while keeping all feature production families and every
missing/substituted canonical and immutable runtime-file rejection.

Current publication fixtures compile actual authored legal owners; they no longer
inject future legal CSS or duplicate full notices into an already licensed site.
Historical parity loads exact pinned prelicense public and producer blobs. The
synthetic duplicate CLI positive is consolidated into the existing permanent
release-rights actual clean-Git CLI test, which still checks both editions,
report-before-upload, missing/stale reports and substituted source/tree. Frozen API
and default/proxy/Pages receipt/recovery negatives remain independently exercised.
The old live-social fixture now emits canonical MIME for all shipped media and
404s, preserving its deliberately wrong JPEG negative under the shared guard.

CS01/CS04/CS05/CS08/CS09/CS10 apply to existing hosting/check/fixture owners.
Focused local checks and independent review bind this prepared integration only;
a fresh clean complete preflight, actual Draft preview/HTTP identity and later
permanent staging remain separate. Original performance budgets and failed native
runs are unchanged. Production/domain/DNS and exact-edition human acceptance stay
pending; no issue closes through this merge.


### Local integration verification and independent review

The explicit preservation comparison against `7416e1e` reports no changed path,
mode or byte under `site/`, `docs/`, the four root legal owners or the source-audit
and editorial-review guides. This preserves the existing license selection and
portrait/advisor consent boundaries; the transport package has its own identity.

The first broad focused integration run passed 241 cases across sixteen relevant
modules. After the explicit proxy port and integration corrections, the five
publication/transport/controller modules passed 93 cases without skip, TODO or
cancellation. The complete issue39 Python snapshot passed ten methods, RI
regressions passed 28 and RI/CI regressions passed twenty. Basic passed fourteen
cases plus ten Color cases; the bounded style guard passed 92 files. Maintained
formatting passed all 357 selected files; changed-source pinned ESLint/Ruff and
architecture checks passed. The two-file pinned secret diagnostic found one exact
known public Git-baseline tuple, independently reviewed at its new fixture path;
no unreviewed finding or broad allowance was admitted.

Separate independent fixture and package/workflow reviewers inspected the merged
semantics and adverse cases. Review identified and closed two actual integration
regressions: the production candidate handoff now retains its Color and rights
fields, with the actual summary script exercised; Pages again binds each modern
report to its intended staging/production context, with a coherently rehashed
wrong-root-edition rejection. Independent closure also verified the fixed CLI
proxy selection, unchanged legacy API/archive behavior and finite zero-redirect,
exact-body HTTP checks. These are independent source reviews, not human legal,
physical-device, native provider or full release acceptance.

A clean merge freeze is required next. The exact existing Draft workflow build,
rendition, edition, package-gate and package commands then run locally against
that frozen checkout; their observations stay outside the candidate so its
identity remains unchanged. The fetched eventual GitHub API commit requires its
own complete prepublication and owning checks before the PR branch moves. Actual
Cloudflare200/zero-redirect/exact-body observations belong to the native preview,
and no local fixture establishes them.


### Protected-main integration and tree-preserving rebase

The maintainer approved the controller-first sequence and instructed execution on
15 October. The [owning-issue decision](https://github.com/oborskyivitalii/oborskyivitalii/issues/39#issuecomment-6192358568)
records the narrow infrastructure integration separately from ordinary staging,
native performance and production admission. PR80 merged through the normal
protected endpoint as `9b82f38`, with its reviewed tree unchanged. Both configured
required checks passed; no protection or bypass setting changed. Independent
source review found no blocker and passed 99 critical targeted cases.

PR40 checkpoint `1fe0ea5` rebases the final integrated feature delta onto that main
and exactly preserves the `c7f4a1b` tree, including prior merge resolutions, full
acceptance policy and all authored/public/legal/workflow/fixture bytes. Its actual
fetched commit passed a fresh complete 26-family prepublication and all 14 owning
checks. Prior source evidence remains pinned to its original source. This later
handoff amendment changes only this review, MEMORY and regenerated RI views.

An independent read-only replay uses the actual rebased staging artifact with the
new-main consumer tree. PR40's CLI produces five finite proxy rules; main's package
and review-flow verifiers, closed runtime/browser identity, Pages composer and
both rights-preserving extraction routes accept it. No deterministic controller
compatibility blocker remains. Actual Ready CI, ordinary two-host staging and
unchanged-budget hosted/native performance must still run. The earlier failed
latency, TBT and HTTP observations remain failed; production/domain/DNS activation
stays paused for the concrete permanent-staging review.
