# Issue 36 — 7 October 2026 controller compatibility

## Merged controller outcome — 7 October 2026

The maintainer merged adapted #44 at
`709c6d0dadb4371d7dde43fb650f948039d8cf7c`, identical tree to checked d4999fc.
Incompatible-main statements below are historical phases. Protected main now
includes four-media production and finite legacy three-media consumption. The
actual retained recovery bytes verified at checked head have the same consumer
implementation on merged main.

Clean merged-source joint acceptance passes 24/24. PR Basic/navigation/acceptance/
preview evidence stays bound to checked d4999fc and equal merge tree; no new
stable promotion, paired or production acceptance follows from this observation.
The [same handoff](2026-10-07-handoff.md#post-44-acceptance-audit--7-october-2026)
and live #36/#41 anchors retain pending feature gates.

Owning issue: [#36](https://github.com/oborskyivitalii/oborskyivitalii/issues/36).
Joint candidate: [PR #43](https://github.com/oborskyivitalii/oborskyivitalii/pull/43),
source `c927c70fb9c681787dafe3e77791679158cf4c28`, tree
`a5c29c7f732d5e994be8b0d3330b2722c54bf506`.
Controller base: `c4539ad18f4f35169eda792a9a40677a7ea9abac`.
Role: implementation self-analysis, not independent review.
Exact resulting source and CI are linked in this PR and the live issue anchor.

## Intent and acceptance

The maintainer requests one combined staging regression for #36 / PR #38 and
#41 / PR #42. Their original feature criteria and source parents remain intact.
This prerequisite changes only trusted-controller package consumption. It does
not implement the Writing formula, editorial changes or complete their ACs.
The compatibility-phase #36 policy retains all five original AC IDs and intents,
records the partial automated scope and keeps every feature/review/merge gate
pending. The joint feature policy remains in PR #43.

## Findings

| ID | Evidence | Finding / implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| C01 | [Protected-main run 37630638171](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37630638171), publish job 112823949806 | Main's closed snapshot inventory rejects `assets/writing-paradigm.svg` before deployment or any staging browser tests. Candidate preview succeeds because its controller understands the asset. | AC02, AC03 | Permit exactly this named asset and its immutable path, with finite explicit revision declaration. |
| C02 | `tools/staging/package.cjs` package consumer | Manifest consistency alone does not recheck declared immutable media binding at consumption. | AC03 | Re-run the data-only snapshot verifier after exact package/file/gate identity checks. |
| C03 | Three-media main/rollback artifacts | Requiring four media files globally would break the current producer and previous rollback packages. | AC03 | Preserve the existing producer/exported three-file list and absent-declaration legacy contract; consume an exact four-file formula declaration separately. |

## Decisions and implementation

Use the existing CI/controller; no workflow, provider configuration or trust
lease changes. The allowlist admits no arbitrary asset. Current formula packages
must declare exactly the three original media names followed by the formula
name, contain its alias and identical immutable copy. Unknown inputs, missing
declaration/alias/copy, reordered/inflated declarations and changed immutable
bytes fail. Legacy packages remain valid for the producer and rollback.

One owner-requested `staging-regression` event on PR #43 gathers the shared
bounded staging evidence on the immutable candidate without stable promotion.
The failed protected-main preflight did not execute browser regression. Merge
of this compatibility prerequisite requires the separate maintainer decision
specified in AGENTS; this file does not supply that decision. Main and the
joint candidate must be reconciled before an eventual feature merge.

## Tasks and evidence

| Task | Paths / check | Result |
| --- | --- | --- |
| T01 | `tools/site/snapshot.cjs`, finite compatible media consumption | Implemented; scene/content/runtime bytes unchanged. The producer fingerprint changes, so route metadata, snapshots and exports are canonically regenerated. |
| T02 | `tools/staging/package.cjs`, data-only consumer revalidation | Implemented; no candidate code executes in the trusted controller. |
| T03 | `tests/staging.test.cjs`, positive legacy/current and meaningful negative mutations | 12 tests passed; current controller/review fixtures together passed 31, no skips. |
| T04 | Downloaded CI package artifact 11486196932 from failed run | ZIP SHA256 `a0e7e43a468d368d6a7e10bf52e1867ab3037a7171c21ea797b2cfb04a88c78d`; unmodified main reproduces the failure; corrected controller verifies the same bytes. |
| T05 | Source policy, RI/path/CI coupling and Basic | Prepared source passed Basic (13 theme/archive + 10 Color), SEO semantic preservation, three partial policy checks, 28 RI and 18 CI-coupling regressions. Exact published-source CI is linked in PR/issue. |

| AC | Partial check | Remaining gate |
| --- | --- | --- |
| AC01 | No formula creation in this prerequisite | Feature asset and visual acceptance in PR #43. |
| AC02 | Finite formula media package admission | Actual world scene, visual and current browser acceptance. |
| AC03 | Legacy/current package and malformed/tampered media negatives | Formula lifecycle, fallback/offline and browser observations. |
| AC04 | No paired measurement in this prerequisite | Exact-head paired performance remains open. |
| AC05 | Current RI/CI mapping and linked prerequisite | Independent review, current CI, maintainer merge and final feature reconciliation. |

## Issue synopsis

Joint candidate source/preview checks pass. Stable staging is blocked by the
protected-main media consumer, before browser tests. This isolated compatibility
PR fixes that prerequisite with tested finite admission and rollback retention;
all original feature ACs remain open. Review and authorize the prerequisite
merge separately, then use the existing controller for stable promotion.


## Maintainer order amendment — 7 October 2026

The maintainer now requests corrected joint PR #43 merge first, then adaptation
of this PR and one joint staging run. This adaptation starts from repaired
072a7b8 and will bind its parent to the actual #43 merge commit. The four-media
producer, both features and all 23 joint source checks are retained. One added
MEDIA-CONSUMER check maps the actual 12-case staging/package suite to AC02/AC03.
The package consumer rechecks snapshot bindings, and an undeclared formula alias
is explicitly rejected. Current and synthetic legacy-declaration fixtures check
the positive branches; duplicate, inflated, reordered, missing, tampered and
unknown media remain negative cases. Historical three-media prerequisite
wording above describes its original pinned phase and is superseded here.

The shared bounded staging profile will run on this adapted PR using merged
#43 as its protected-main controller. No feature AC is marked complete by
merge, a smoke preview, or successful source fixtures. Paired performance,
editorial/visual/independent/device and issue closure gates remain pending.

Preparation result: all31 actual package/controller cases and Basic23 passed.
The locked lint scanner passes. Canonical regeneration changes public checksum
values; 177 exact path/type/hashed-value findings were individually proved from
actual canonical locks/output and existing Git objects, with no unresolved
values or baseline/type exclusions. This is documented self-review.

The #43 main controller still requires four media inputs in its generic
package gate. Its existing recovery step verifies the previous three-media
package before promotion, so this adapted compatibility patch must also reach
protected main before stable promotion. Staging alone does not authorize
that merge; final current-source CI and the maintainer decision stay explicit.
