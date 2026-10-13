# Issue 5 — 2026-10-13 independent content-release source review

Owner: [issue #5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5).
Execution: [PR #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Reviewer: `independent_content_review`, a separate agent inspecting the implementation;
this is independent source/architecture review, not human editorial or device acceptance.

Inspected state: explicitly dirty prepared worktree on
`e830752f58535c9e2226550a9661ee51c745bdb3`, whose committed tree is
`b3e197dfa681702d9f14a74ac93da6e433de20e4`. Neither that baseline's green CI nor this
review establishes clean final-head admission. The inspected current platform engine is
`0bd39d2137c0b6ea2c9066c849573f22741a100098814f923f8022b07d46475a`.

## Intent and acceptance

The 13 October owner instruction makes PMDay a technical test artifact and defers the
real article until its author-approved chapters are supplied. The owner authorized the
simple Writing count and independent static content release. Review focuses on AC13–AC15
and the existing AC03/AC07/AC08/AC11/AC12 isolation, identities, reader and delivery boundaries.
Static complete HTML, one coherent package, unchanged budgets and separate release decisions
remain. Original issue #2 editorial/publication criteria are not accepted by this review.

Read root instructions, site/check/style/release/acceptance owners, the dated content-release
plan, all changed catalog/build/navigation/artifact/source-profile/workflow contracts,
related maintained tests and the bounded Color allowlist changes. Generated output and
authoring fixtures were inspected as outputs; no production or browser surface was changed.

## Findings

| ID | Evidence/path | Finding and implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | `validate-catalog.cjs:176–217`, `content.cjs:76–109`, `render-records.cjs:128–197` | One validated ordered entry collection now produces rows, year controls, ItemList and count. Alternate links stay inside their primary row; candidate listing is separate. The previous manually enumerated year templates are removed. | AC13 | Resolved; source design acceptable. |
| F02 | `build.cjs:364–413,599–675` | Article versions use own inputs and explicit translation groups. Routes depend on actually linked article snapshots. A dedicated page-template baseline fingerprint admits platform changes without invalidating unrelated document identities in ordinary incremental generation. | AC14 | Resolved; add/edit/remove and unrelated-byte tests are meaningful. |
| F03 | `navigation.js:255–342`, `snapshot.cjs:121–181` | Hosted root pages no longer embed a global article registry; articles embed only their initial descriptor. First navigation admits a bounded compatible manifest and pins it once. Missing, foreign, stale, duplicate, unsafe or cancelled manifests retain native fallback. | AC08, AC14 | Resolved; manifest and actual navigation fallback negatives added. |
| F04 | `artifact.cjs:203–280`, `candidate-source.cjs:44–125` | Raw-only reuse initially lost prior deployed Color/staging snapshots. Final composition now carries the verified decorated immutable closure, rejects collisions and preserves old resources after slug rename. Exact source reconstruction recomposes the same SHA-bound baseline and delivery layers instead of weakening equality to tolerate arbitrary extra history. | AC14 | Resolved; retained-byte and substituted baseline/declaration/source negatives added. |
| F05 | `content-release.cjs`, `public-artifact.cjs` | A deferred artifact import initially introduced an authored dependency cycle. A shared leaf byte-inventory owner now removes it; orchestration remains explicit and output/cache/lock use the existing transaction owner. | AC11, AC14 | Resolved; no computed-import evasion or guard exception introduced. |
| F06 | `content-baseline.cjs:86–159,163–308` | Successful Draft packaging alone initially qualified as a baseline. Selection now requires actual successful raw-head Basic, RI and owning-admission jobs, exact source/tree and archive/generation bindings. Compatibility or absent evidence chooses an explicit full build; corrupted declared bytes fail. | AC15 | Resolved; skipped/failed/cancelled admission and wrong-tree/archive negatives added. |
| F07 | `local.cjs:167–220,245–286`, `source-tests.cjs:624–672`, `site-checks.yml:67–85` | Optimizing only the artifact command left ordinary Basic/package checks rebuilding the entire platform. Canonical unconditional CI commands now dispatch to a formally validated content route, run its complete mandatory suites once and verify exact intrajob execution. Content package proof omits the full builder only after verified content reconstruction. | AC15 | Resolved; dispatcher mode, incomplete identity and partial/skipped execution negatives added. |
| F08 | `test-profiles.json:69–105`, `source-tests.cjs:296–410`, `content-baseline.cjs:174–179,214–223`, `content-baseline.test.cjs:515–621` | Broad page-JSON selection initially conflicted with the release's Writing/Home restriction. Policy now matches that boundary. Canonical generated docs and publication path inventories have bounded owner/role/shape rules; RI bookkeeping may change only its identity hashes while preserving every policy field and input path. A real added external record/new year, canonical build and actual RI refresh now exercise this ordinary positive flow. Shared catalog-label changes still choose full generation. | AC15 | Resolved in source; classifier admission depends on the separate unconditional RI gate validating stamp freshness. |
| F09 | `check_site_seo.cjs:206–331`, `writing-catalog-amendment.json`, `content-rendering.test.cjs:354–431`, `executive.test.cjs:144–218` | Normalizing entire generated regions against mutable producers could silently normalize new renderer/template semantics. Normalization binds the exact 15 producer inputs and proves current catalog data before restoring the frozen authored frame. Its four finite JSON-LD encodings preserve the exact wrapper; arbitrary whitespace, duplicate/injected metadata and replay of a historical ItemList after the catalog changes remain rejected. | AC13, AC11 | Resolved; producer/output drift and actual builder-wrapper negatives are meaningful. |
| F10 | `content.test.cjs:34–75,629–689`, `tests/fixtures/catalog.cjs` | Existing assertions rejected valid undated local entries, multi-author bylines and escaped query URLs. Generic edition/schema assertions now support those forms; historical external-edition fixtures are explicitly pinned rather than assuming all future live records remain external. | AC13 | Resolved; combined ordinary collection fixture covers the promised future forms. |
| F11 | `color-motion-contract.cjs`, `color-motion-contract.test.cjs` | The first new Color proof became stale after producer helper refactoring. The new family was refreshed from complete current-source bytes; the original 18 tuples remain unchanged. Canonical and immutable script hashes still select exact identities and reject mixed older archive/navigation bytes. | AC11, AC15 | Resolved; independently reverified refreshed complete artifact bytes. |
| F12 | `check_site_seo.cjs:597–612` | The generated renderer compatibility marker initially caused historical head comparison drift. The restoration removes exactly one head-local `site-article-renderer=1` spelling and separator; a duplicate or another value remains visible to the frozen comparison. It introduces no broad metadata wildcard. | AC11, AC13 | Resolved in source and owning agent's focused executive execution. |
| F13 | `content-fixture.cjs:103–227`, `content-fixture.test.cjs:75–146`, `local-browser.cjs:141–199`, `serve.cjs` | A temporary source copy cannot verify already accepted Git-pinned articles without its objects. The explicit synthetic browser diagnostic now uses an isolated shared Git clone and preserves live accepted sources, while rebuilding only its synthetic draft and Writing. Its report identifies dirty synthetic bytes and denies full-gate, production and deployment status. The diagnostic tests exercise a real committed manuscript/blob; the print observation compares actual rows and the current count label. | AC14, AC15 | Resolved in source; a managed run remains diagnostic evidence only. |
| F14 | `site-articles.test.cjs:28–49`, `article-offline.test.cjs:149–176`, `site-engine.test.cjs:14–31`, `build-cohesion.test.cjs`, `analytics.test.cjs`, `content-release.test.cjs:94–126`, `content-baseline.test.cjs`, `article-candidate-source.test.cjs:15–77`, `tests/fixtures/catalog.cjs` | Isolated permanent suites inherited the live catalog before deleting its publication owners or losing their Git provenance. The first accepted local article would therefore fail unrelated content tests. Synthetic route/article fixtures now declare the frozen external catalog; generic real-catalog assertions remain live. Candidate-source preserves local Git objects and overlays the entire frozen PMDay technical fixture only inside its temporary owner, keeping later author acceptance independent. | AC13, AC15 | Resolved in source; controlled future-local execution is separately recorded below. |
| F15 | `analytics-browser.cjs:10–15,174–178,240–265`, `analytics.test.cjs:341–413` | The executed future-local probe exposed the actual analytics browser diagnostic compiling its live catalog in a temporary root without Git provenance. A shared local clone preserves real commit/blob objects before the existing live owner copy and build. Its count uses the canonical validated collection and queries only archive rows; no legacy external seed or publisher bypass masks the live diagnostic. | AC13, AC15 | Resolved in source; the cold-preparation test stops at an explicit browser boundary and cannot claim browser acceptance. |
| F16 | `offline.cjs:104–115`, `analytics-browser.cjs:249–277`, `analytics.test.cjs:360–398`, `site-release-checks.yml:312–360,403–420,529–546` | A canonical native article activates the offline producer's publishing adapter, which was absent from its cold copy. The collector copies that canonical owner and installed locked parser closure. Linux/native/staging callers fetch source history and install the parser from its lock; tests require exact owner/lock bytes and an isolated Git root. | AC15 | Resolved in source and the owning agent's observed-publication cold probe, with the canonical hyperlink retained. |
| F17 | `site-release-checks.yml:558`, `quality.test.cjs:264–272`, `staging-regression.test.cjs:20–28` | New synthetic diagnostic uploads initially collided across release profiles, and the live Color staging fixture still expected an older reviewed runtime. Upload names now include the profile; stripping it triggers the unchanged namespace guard. The fixture selects the exact current content family while preserving descriptor/native/variant/hash negatives and every historical admission tuple. | AC11, AC15 | Resolved; owning agent reports 32/32 focused checks and 70/70 unique namespaces. |
| F18 | `issue-acceptance.yml:36–54`, `test_issue5_acceptance.py:72–80`, `check_site_seo.cjs:12,70–74`, `format-parity.cjs:151–168`, `ri-ci-map.json:252–269,432–465,655–656` | Actual clean-head owning CI exposed a missing installer dependency: WritingCatalog's canonical SEO parity spawns the quality venv Python, but issue5 installed only the publisher AST toolchain. A separate Python installer now covers issue5/41/58 using the existing exact Ruff/PyYAML pins; issue41/58 alone retain quality npm, and publisher npm stays issue5-only. Strict helper failure, clean/source binding, checks, limits and pending human gates remain unchanged. | AC11, AC13, AC15 | Resolved in source; owning agent reports the exact failed check 1/1 passed. RI input identity and exact new-head owning CI must be refreshed. |

No unresolved source-design blocker remains in the final inspected diff after these
follow-up fixes. Complete current-head check execution remains pending. This review does
not mark release, editorial or physical-device criteria complete.

## Source and byte evidence

Prepared-source review digest: `72b43424da046bfc3f8078498e68c8bd1d8155c42c13484dfc2985c7d2741428`.
It is SHA256 of compact JSON of sorted `{path, sha256}` records for the 69 changed/deleted
authored paths under `site/`, `tools/`, `tests/`, `guides/`, `.github/workflows/` and
`.github/acceptance/`, plus `review/issue-5/writing-catalog-amendment.json`; deleted paths
have `null` hashes. The comparison anchor remains
`e830752f58535c9e2226550a9661ee51c745bdb3`, including the already committed implementation
and its later installer correction. `site/output-lock.json`, generated public/offline outputs, the RI views
and this review file are excluded. Subsequent source edits invalidate this review identity.
The initial 68-path digest `f7e073750e657cf85e0c453cc1ef434b764814320fcc5bd17adf1de9f0deece8`
was the reviewed implementation subsequently committed as `a775acde6e328eafd752ff5713d3f1b59001fb4d`;
the new workflow dependency correction supersedes that review scope without changing the platform engine.

The reviewer actually executed read-only `artifact.verify`, Color `motion.select` and a
current-source platform-fingerprint comparison on both complete refreshed artifacts:

| Artifact | Runtime fingerprint | Complete public digest |
| --- | --- | --- |
| Current plain Color | `89c395df74b1e626735d0757f9572836fd2d3365b2deefe31b7ca46982cd219e` | `4e022851f7f2511ec29621dbe5bafb9ddf75b671c6a8f486d0caac8373c33130` |
| Current staging Color | `dfa648a40b6218f1a6b881db08c518af0b7f50a22dd06994eb988a9c947146b7` | `a2e20307c438532b0926c4fecceac1c7345886f8055f581700d0fdb9e0aa53c6` |

Both bind the current engine above. Their canonical and immutable navigation SHA256 is
`b798fd75ba58f2b4e4cfec97b0c65275f3ffd006b23c04f4d53d9273c19b9c2a`.
The earlier `9377a50d…` producer proof is superseded, not current admission.
Owning agents supplied focused local execution reports of 78/78 article/Color checks,
35/35 catalog/SEO checks, 18/18 executive checks, 33/33 final baseline/profile/fixture checks,
12/12 content/candidate checks, 32/32 namespace/staging checks and 11/11 analytics checks,
with no skips in those reported runs. The combined 33-case run includes the three synthetic
fixture cases. The reviewer read the meaningful cases but did not rerun these suites.

The builder agent separately exercised all 71 source cases with a genuine committed
accepted local article and a 30-record catalog; 71/71 passed after the provenance fix.
Its final canonical publication probe derives `metadata.published=2026-10-12T00:00:00Z`
from a validated synthetic event, selects the observed HTTPS canonical in
`offline.context().canonicals`, and retains that hyperlink in ordinary Writing output.
The cold-preparation case passed 1/1 in 2.035 seconds against collector SHA256
`ca791cc13e881a3a0b056aebb1632b7954eaf637b87372ea40fabca0608ccfbc`, independently
matched to the final collector source bytes by this reviewer. All fixture events, archived
pages and source commits stayed in the temporary model; no external publication or browser
acceptance occurred.

The root's larger prepared-source attempts failed under the unchanged 180-second bound
and exposed the namespace/stale Color/analytics failures above. Focused corrections do not
turn those failed attempts into accepted complete execution. All reports remain prepared-source observations,
not accepted clean-head CI. Final Basic, source, RI/style/owning and hosted checks remain
the root execution owner's responsibility.

## Actual CI follow-up on a775

The implementation was committed as `a775acde6e328eafd752ff5713d3f1b59001fb4d`, tree
`817033e5ed0ae65c8c66cc1efcab783e2c1fc796`. The execution owner reports actual Basic source
CI passed 727/727 cases in 162883 milliseconds, with the three explicitly excluded baseline
files unchanged, and navigation/RI passed. This is actual CI evidence for a775 rather than
the earlier failed local attempts; it does not qualify the later installer head automatically.

The reviewer independently opened a normalized local copy of the owner's downloaded report from
[owning CI run 38399835242, attempt 1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38399835242).
That normalized copy's JSON SHA256 is
`8b3eb9bb1697fa9bc85babeb3ab969662cfca7be572c7e88a6a2f7d825d96dff`.
The owner then preserved the exact original ZIP member in
[2026-10-13-owning-first-failure.json.gz](2026-10-13-owning-first-failure.json.gz).
The reviewer independently verified its decompressed bytes equal the original raw member,
whose JSON SHA256 is
`a750f69fd1a487cfe70dbaea134898563f5125590cb4ef13ba84f1740767b982`.
Both copies parse to the same complete report; the normalized copy is not the raw-byte artifact identity.
It binds the clean a775 commit/tree above, `evidence_valid=true`, `automation_pass=false`
and `ready_for_issue_closure=false`. Nine check rows passed; only `WRITING-CATALOG` failed,
with the canonical `tools/quality/toolchain/venv/bin/python` spawn returning `ENOENT`.
The reviewer traced that failure to F18's installer omission, not a weakened semantic check.
The immutable failed run remains recorded; it is not retroactively marked successful.

The selected-policy Python installer correction is source-reviewed. Its exact Ruff 0.16.10
and PyYAML 6.0.3 pins match the existing quality requirement owner, use `--no-deps`, and
create the exact interpreter path required by the HTML parity helper. No browser/scanner
or extra quality npm closure is introduced for issue5. The helper's strict missing-interpreter
failure remains intact. The owner reports the previously failed WritingCatalog unittest
passed 1/1 in 2.821 seconds, plus pinned formatting/YAML/guard checks. The changed workflow
is already in the RI live-overlay layer and reviewed-input identity; its fresh digest and
normal unconditional coupling verification are required before the next clean commit.

The owner also reports build/publish/smoke passed in
[preview run 38399835864](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38399835864).
The Ready event did not select the separate staging-evidence diagnostic. This reviewer has
not opened a managed content-fixture report from that run, so it supplies no extra device,
editorial or synthetic-journey acceptance here. Exact new-head source/owning CI and the
requested staging diagnostic remain pending. In particular, a775's failed owning admission
prevents it from qualifying as a reusable baseline despite its green Basic source run.

## Decisions and remaining execution

The accepted implementation preserves static no-JS HTML and a complete deployment.
Raw generation reuse does not imply every final hosted alias remains byte-identical:
the existing staging/production edition binds a source head and may rewrite document
versions and staging banners without recompiling the platform. This limit is documented.

Automatic reuse is conditional on a compatible admitted ancestor artifact. Missing/expired
artifacts, changed preview selection, platform/shared-label changes and nonancestor
squash/rebase histories explicitly choose the ordinary build. Stable staging and production
retain their existing full applicable profiles and budgets. This runtime-changing PR itself
must follow the platform route; an old green run cannot admit it.

The bounded content optimization covers catalog links and accepted Markdown/metadata.
An observed-publication commit that adds HTML evidence under an article's
`site-artifacts/*.html` explicitly selects the ordinary full route. That operator limit is
documented in `guides/SITE-CONTENT-RELEASE.md`; the classifier was not broadened to treat
arbitrary archived HTML as trusted authored content.

| Task | Owner paths / expected behavior | Check | Status |
| --- | --- | --- | --- |
| T01 | Root source, regenerated outputs, RI/catalog/map and current acceptance policy | Final clean-head Basic/source/RI/style/owning checks | Pending final exact-source execution evidence |
| T02 | Actual PR candidate Writing and reader | Hosted navigation/count plus no-JS Writing at both widths; each rebuilt article's existing capability journeys | Pending hosted evidence |
| T03 | Owning issue/PR review anchor and source mapping | Link this independent review, clear stale ticks and keep original human gates separate | Pending root reconciliation |

`local-browser.cjs:535` conditionally runs the extra content journey only for a manifest
declaring `contentRelease`. The initial platform-changing preview therefore needs a focused
actual-candidate no-JS Writing observation or an explicitly generated content-release
artifact before reporting that extra path as exercised. The added managed local diagnostic
can exercise that path with a genuine synthetic content release. Its dirty fixture digest
is distinct from the actual PR public artifact and cannot qualify the current source,
hosted CDN, physical devices or editorial publication. No such acceptance was inferred
from source tests or byte verification.

## Acceptance evidence

| AC | Evidence reviewed | Source-review result | Remaining boundary |
| --- | --- | --- | --- |
| AC13 | Shared entry renderer, actual-row count, schema/order/year/alternate/local cases, producer-bound SEO amendment | Acceptable source architecture; initial blockers resolved | Final exact-source checks and hosted Writing |
| AC14 | Per-document identities, trusted baseline generation, preserved decorated closure, exact recomposition and rename/tamper cases | Acceptable source architecture; initial blockers resolved | Final exact-source delivery/reader checks |
| AC15 | Real prior admission, classifier/dispatcher/execution checks, complete permanent suites and unchanged release budgets | Acceptable source architecture; initial blockers resolved | Final current-source CI/profile/RI proof |

## Issue synopsis

Independent agent source review found the Writing/count and verified content-release
architecture coherent after correcting baseline admission, actual Basic/package rebuilding,
decorated retention, source-proof equality, producer-bound SEO and future local-record
assertions. Current Color bytes are independently verified. Final clean-head and hosted
evidence remains pending; PMDay stays a technical fixture and real editorial publication
criteria remain open.
