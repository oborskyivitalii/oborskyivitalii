# Reader CPU correction — 21 October 2026

Owner: [issue5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5),
[Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Diagnostic baseline: `3e12e47953bc8c81316544b1da206a956a337307` / tree728b7aee.
Final integration parent: R21 `e8c388773ec81d8f3a727b6177cb4ceacff82d5b`;
its manuscript, publishing changes, historical tuples and independent receipts survive.
The author explicitly authorized correcting the remaining CPU failure.

## Intent and observations

The complete assembled R20 matrix failed reader mobile TBT204/200ms while
LCP2253.114/2500ms passed. Its reports, all failed/partial attempts and raw data
remain at evidence commit8c5d6f17; native transport receipt is5d637240.
These results cannot admit a changed runtime.

An additional cold CDP profile with CPU×4 and opt-in engine stages attributed
startup work to model construction/first projection/paint and measured early
heading geometry before the router assembled its content frame. CPU sampling
also identified repeated Canvas state dispatch. Instrumented timings are
attribution diagnostics, not acceptance metrics.

Nine sequential fresh-process Lighthouse controls compared unchanged R20,
initial heading update deferred to a microtask, and precomputed language labels.
All samples survive. Their TBT spread was large; neither control is claimed to
prove a complete page-level speedup. Neither diagnostic patch is shipped.

The isolated native Canvas benchmark uses five fixed projected Writing frames,
50 paints per block, one declared warmup block per implementation and eight
alternating ordered pairs. Specializing native field writes was faster in8/8
pairs. This measures ordinary Canvas command submission, excludes formula bitmap
construction and does not prove overall LCP/TBT or device/field improvement.

## Implemented scope and invariants

- `renderer.cjs`: four native-field helpers replace dynamic `ctx[property]`
  dispatch. Values, command order, state invalidation and exception order remain.
  Palette, geometry, depth order, opacity and every quality/cadence limit remain.
- `navigation.js`: initial `SiteReader.mount` follows content/frame construction,
  before the first history snapshot. It remains synchronous; SPA mount and reader
  fragment/state/print logic are unchanged. All five router admission returns
  initialize the native reader independently. The inert cache now captures native
  initial article markup before optional reader enhancements.
- Exact plain/staging/production Color tuples and mandatory publication-rights
  admission include this runtime. Prior tuples and their rejection cases survive.
- A full-script VM regression observes reader geometry only within the completed
  frame, receives original history state and confirms mount before initial save.
  Seven additional native admission cases preserve initialization without SPA.
  Current tuple reconstruction and mixed-byte/rights negatives cover all editions.

CS01/04: native runtime and delivery owners only. CS02/03: authored content,
semantics and CSS unchanged. CS05/06: bounded helpers and synchronous initialization,
no additional clock/session/cache. CS07: explicit native benchmark and preserved
budgets/samples. CS08–10: meaningful existing renderer/route tests plus the new
boot ordering regression, exact tuple/rights checks, style/lint/RI and independent
review. Preparation failures (missing benchmark palette token, missing tuple/
rights registration, shallow Git ancestry and default formatter configuration)
remain recorded separately; they are not runtime acceptance or discarded trials.

## Verification and remaining gates

Targeted renderer/navigation/Color checks:71/71 PASS after the preparation
corrections and R21 integration. Independent review caught and resolved a native
reader boot regression; its original finding is retained below. Native Canvas parity:60/60 nonempty frames have byte-identical RGBA output across
five routes, two viewports, two themes and three times. Formula bitmap remains
1380×240, one build,12paints/288submissions and zero failures. This is rendering
regression evidence, not performance acceptance. Browser native/TOC/history/viewer/print, current-source Basic,
owning acceptance, RI and one clean full strict performance matrix follow the
final reviewed candidate. The independent review receipt is appended below.
AC08/AC11/AC12 whole-feature, editorial, rights, device, independent release and
publication gates remain open. No merge, permanent staging or production follows
from a local benchmark or source test.

Refs #5

## Verbatim independent review receipt

# Issue 5 / PR 79 — independent CPU correction review

Reviewer: `/root/reader_cpu_review`, a separate non-implementing reviewer subagent.
Owning issue: <https://github.com/oborskyivitalii/oborskyivitalii/issues/5>.
Owning Draft PR: <https://github.com/oborskyivitalii/oborskyivitalii/pull/79>.
Date: 21 October 2026. Baseline: `3e12e47953bc8c81316544b1da206a956a337307`.
Candidate: dirty prepared branch `work/issue-5-cpu-20261021`; initial reviewed
source identity is recorded in `pr79-cpu-independent-initial-identity.json`.
This review does not authorize merge, release or publication.

## Intent, materials and limits

The authorized correction addresses R20 reader mobile median TBT 204ms against
the unchanged 200ms budget. It must preserve all R20 content, figure quality,
geometry, clock/cadence, native/reader/navigation/TOC/viewer/history/print behavior,
original budgets and every retained failed or partial measurement. During review,
the owner concurrently advanced PR79 to R21 `e8c388773ec81d8f3a727b6177cb4ceacff82d5b`.
Final integration preserves that commit's manuscript/editorial/publishing owners
unchanged; R20 source and failed measurements remain historical evidence. AC08, AC11 and
AC12 remain whole-feature gates, not narrow source-test claims.

Read independently: AGENTS, CONTRIBUTING and its per-iteration review protocol,
guides/CODE-STYLE, `.github/acceptance/issue-5.json`, affected runtime and test
owners, Color identity/rights admission, generated artifact diffs, and the CPU
review route. Inspected the exact baseline/candidate diff, reader lifecycle,
cache extraction/prepare/native mount, boot initialization, history, fragments,
print event handlers and Canvas state/custom/formula invalidation.

Executed independently: renderer/navigation/Color Node suites, 64/64 pass,
0 failures/skips; log `pr79-cpu-review-source-tests.log`. Also reproduced RF01
with full baseline and candidate navigation scripts in a VM. Compared complete
`paintShapes` command/setter/custom/formula traces against baseline for mixed
ordinary shapes plus a throw-on-first-setter case for each of the four native
fields: all five cases match exactly, including exceptions. This is a mocked
Canvas semantic check, not pixel evidence; receipt
`pr79-cpu-review-renderer-parity.json`. No browser,
performance matrix, heavy scanner or implementation work was performed by this
reviewer. The parent owns native-browser/pixel verification, final source checks
and one clean strict matrix. Diagnostic profile/microbench results are bounded
attribution and ordinary Canvas command-submission evidence, not whole-site or
field speedup proof.

## Findings and disposition

| ID | Severity | Source evidence and consequence | AC / style | Disposition |
| --- | --- | --- | --- | --- |
| RF01 | Medium, initially blocking | Initial candidate `site/engine/navigation.js` removed the unconditional initial reader mount at line 6 and placed it after all router admission returns near line 1320. A valid native article with Fetch absent mounted the reader once on baseline, restoring saved `[true]`; that candidate mounted it zero times. The optional reader viewer, TOC, state and print lifecycle depended on navigation capability/registry admission. Missing Fetch, DOMParser or pushState and earlier rejected descriptors/resource identities bypassed the moved mount. | AC08, AC11; CS06, CS08 | Resolved and re-reviewed at final prepared tree: shared synchronous mount helper runs on all five explicit top-level admission-return paths; admitted navigation mounts after frame assembly and before first save. Eight real-script boot cases and all 71 focused source tests pass; regenerated exact identities match. |
| RF02 | Low | Initial test diffs included unrelated object-literal wrapping from a formatter invocation. The current diff has only the new navigation boot test and focused Color identity changes; unrelated wrapping was removed. | AC11; CS05 | Resolved by parent, independently confirmed. |

## Runtime and integration assessment

The four specific native Canvas-field helpers preserve call argument evaluation,
getter/strict equality semantics, the native setter before cached-state update,
draw order and final alpha restoration. A throwing native setter still prevents
the following cache update; successful custom/formula boundaries still invalidate
all four fields. No geometry, palette math, grouping threshold, quality tier,
frame cadence, RAF ownership, public API or formula cache policy changes were
found. Separate helpers are a focused, measured dispatch choice under CS04/07,
not a new policy owner. Existing focused renderer tests exercise external state
reset, handled custom paint, formula boundaries, opacity/arrow grouping and
formula failure.

For the router-admitted path, the initial reader runs synchronously after the
persistent content/frame is assembled and before first history save. Restored
detail state and fragment reveal still precede that snapshot. Initial inert cache
extraction now precedes optional reader enhancement: it captures native markup,
then `prepare` clones it into the inert document and every native mount runs
reader enhancement after insertion. Reader enhancement does not create article
prose or canonical figure resources; it attaches listeners/attributes, resets
disclosures and activates dialogs. Thus there is no identified cache/content
loss on source inspection. Browser evidence must still cover returning to that
initial route and restoring TOC/disclosures/focus/fragments/viewers/print.

The first reviewed Color family admits separate exact plain/staging/production
tuples, preserves all historical tuples, unchanged styles/theme/archive bytes,
stationary reader, whole blocks/paper/deferred media, and adds all three tuples
to mandatory publication-rights admission. Current tuple reconstruction and
mixed-byte/missing-rights negatives passed. No acceptance schema, threshold,
Intl or cadence changes were found. RF01 correction will invalidate navigation
and composition hashes, so final tuples require another exact-source check.

The observed `prepared2` failure is its clean-worktree precondition on a dirty
candidate, not evidence of a corrupt produced artifact. It cannot count as a
successful prepared-artifact check. The previous failed perf samples and noisy
nine-control diagnostics remain separate and must not be erased or used as
new-runtime acceptance.

## Acceptance status

| AC | Reviewed/check scope | Current result | Remaining |
| --- | --- | --- | --- |
| AC08 | Reader boot/state/cache and renderer invariants; focused source suites | RF01 resolved at final prepared source; 71 source tests pass | Parent browser parity/native lifecycle, strict budget matrix and whole reader gates |
| AC11 | Independent architecture/style/test/identity review, CS01–10 | RF01/RF02 resolved; final integration/generated/tuple/catalog/RI-input checks pass within independent scope | Parent current-source Basic, mapped full checks and original gates |
| AC12 | Same issue/PR, exact-source tuple/rights scope, retained measurement limits | No policy/budget changes found; new-runtime performance not accepted | Source freeze, source-qualified full strict matrix, exact evidence and original delivery/owner gates |

## RF01 correction re-review

Independently re-read every top-level admission return and full-script boot test.
The hoisted `mountInitialReader` helper refers only to already available window
and history and is safe before subsequent lexical declarations initialize.
Each explicit native return invokes it once; the admitted route invokes it once
after frame assembly and before first save. Missing main/footer gracefully uses
the same reader initialization. No new scheduler or duplicate mount was added.
The eight cases cover admitted router, no Fetch, no DOMParser, no pushState,
too many article descriptors, invalid descriptor, conflicting embedded resources
and missing footer. They observe actual source initialization, DOM parent/frame,
saved reader state and absence of spurious history mutation on native fallback.

Independent corrected navigation suite: 42/42 pass, zero failures/skips,
`pr79-cpu-review-navigation-corrected.log`. The original missing-Fetch reproduction
now returns exactly one reader mount with the saved `[true]`, matching baseline.
Corrected navigation SHA256:
`3a22652df63eac052030f3cc9119bc5b4b4acaab417775d22cf6458fa3176374`.
Corrected navigation tests SHA256:
`96aeeef1d8545fe4d19c46fcba484beb50ef5792e8b49f5b439382225e75e9e6`.
Renderer remains:
`3cac8c0fab64aeed928d442e5843213214beae052f5343ff197f03e3ab209589`.

## Final R21 integration and exact identity receipt

Separate non-implementing reviewer `/root/reader_cpu_review` independently
re-reviewed substantive prepared tree `903603a3b22559f7340eac0f7fc25ab54badd1bb`
over integration parent `e8c388773ec81d8f3a727b6177cb4ceacff82d5b`.
Final prepared tree `c6e9e42f41da40d6bd3ee9dad6cb27c29914fdb1` differs only
in configured RI/CI JSON whitespace and the two corresponding generated RI hash
fields. The reviewer verified RI/CI parsed JSON equality and that exact two-file
delta; substantive source identity and all earlier findings/checks are unchanged.
RF01 and RF02 are resolved; there are no unresolved blocking source findings in
this reviewed iteration. The review-only receipt and deterministic RI refresh
may follow without changing the reviewed substantive source. Material further
source, integration or claim changes require affected re-review.

The final parent-relative diff preserves R21 publication, content, templates and
publishing owners exactly. Historical R21 Color family/tuples and mandatory
rights entries survive integration. Current CPU tuple reconstruction and
canonical/immutable/edition/rights negatives independently pass for all three
editions. The reviewer reran all three focused suites on this exact prepared
source: **71/71 pass, zero failures or skips**, log
`pr79-cpu-review-r21-source-tests.log`.

Independent generated closure checks found zero mismatches in all 42 output-lock
file hashes, five revision-route hashes and five alias/runtime byte pairs. All
five route aliases plus five snapshots equal their R21 parents exactly after
substitution of only current engine and route identity strings. Catalog changes
are exactly 17 additions and 16 retired generated paths, with no changes to
existing semantic owner records and no missing current catalog paths. All 94
recorded RI/CI input hashes match current bytes; recorded RI/CI source digest is
`a5cbf57a468b41c6b81b2b350dc6b8fda5d19fefda99fcff9914d9bd06a3a2ba`.
Parent-reported style/RI builder/verify results were inspected as supporting
evidence; this reviewer did not repeat those scanners.

Exact substantive SHA256 identities:

| Owner | SHA256 |
| --- | --- |
| `site/engine/navigation.js` | `3a22652df63eac052030f3cc9119bc5b4b4acaab417775d22cf6458fa3176374` |
| `site/engine/renderer.cjs` | `3cac8c0fab64aeed928d442e5843213214beae052f5343ff197f03e3ab209589` |
| `tests/navigation.test.cjs` | `96aeeef1d8545fe4d19c46fcba484beb50ef5792e8b49f5b439382225e75e9e6` |
| `tests/color-motion-contract.test.cjs` | `bad867fb2dc71836e1b6e3b80d36ae76a9cef967f6f624ac3fd0270cafb1c11b` |
| `tools/quality/color-motion-contract.cjs` | `71ab94aad9c41c627a85d51a426c3f5a5e0dcf193944d37148e4b12e5816cba8` |
| `tools/staging/package.cjs` | `a7656387af1ebc3d5986526083dab92bf24985b038a04c8220259cf4336e3acd` |

The complete substantive/final-metadata byte-count/hash manifest is
`pr79-cpu-independent-r21-identity.json`. Current base engine is
`f25ab5a57a12f3c428957ca79e7e82e99bd480799646a218b9fda34934ffcc10`.
Exact CPU fingerprints are:

| Edition | Fingerprint |
| --- | --- |
| plain | `65251b15f2901166c8ad14076130e5e4a699dce776b896576999db17aa674f93` |
| staging | `970dbe51c3f4b3e04f36d1be6c492888cf915141f8e4ac0f05f73fbc9beaabfc` |
| production | `16c8fa33fa98fdd1a07df1d664fc674ecac1d2dc049c480378e9d92b94986ceb` |

The retained identity directories hold derivation manifests rather than a full
source-qualified artifact; they select the expected tuples and require rights.
The independently rerun current reconstruction test, not those placeholder-source
manifests alone, establishes current tuple derivation. No budget, schema, policy,
quality or cadence changes are present.

Parent-run native Canvas byte parity provides additional supporting evidence:
`pr79-cpu-native-parity.json` names the exact reviewed renderer and R21 baseline.
The reviewer checked all 60 distinct rows: five routes, widths 412/1440, day/night,
times 0/400/1200; every row has nonempty paint and zero differing pixel bytes.
Baseline/candidate formula diagnostics agree: one 1380×240 cache, 12 paints,
288 submissions and zero failures. The retained runner SHA256 matches the raw
receipt `2d0bef1ab1662229c5969f9aa29824be395d6571fc676264a9560dd29897a65c`.
This reviewer did not independently execute browsers. Pixel parity does not
establish native reader lifecycle, performance, physical-device or hosted proof.
No new-runtime performance acceptance, merge or publication approval is provided
by this source review. AC08/AC11/AC12 whole-feature and original gates remain
open pending their actual evidence.
