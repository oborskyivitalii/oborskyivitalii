# Issue39 — bounded Writing TBT correction, 16 October 2026

Owner: [#39 Writing continuation](https://github.com/oborskyivitalii/oborskyivitalii/issues/39#writing-tbt-bounded-20261016).
Execution: [PR40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40).
Role: implementer self-analysis; independent human release review remains pending.
Baseline: clean d4868471802953d513c6bf0e87539f31b7497640 / tree86c9ee5865d186b4a6c007d16ceb6909f5d57745.

## Intent and acceptance

The maintainer authorized steps1/2: controlled repeated Writing mobile/simulated
Lighthouse observations, cause attribution and a measured correction if needed,
then stop/report with numbered next steps. Original200ms budget remains.
Ready admission, whole26-family preflight, /stage, merge and production are later.
AC03/AC04 remain whole release criteria with native/human gates open.

CS01/CS04/CS05/CS06/CS07/CS08/CS09/CS10 apply: edit only authored math/projection,
regenerate outputs, preserve runtime ownership, numeric/paint semantics, clocks,
quality/cache/cadence bounds and proportional source/browser verification.

## Findings

| ID | Evidence | Finding and implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | Standard Chromium153 / Lighthouse13.5.0, Ubuntu24.04 local AMD runner | Writing is Chromium on Linux. WebKit/macOS is a separate native profile. | AC03 | No platform substitution. |
| F02 | Identical baseline artifact68e7ee53; all collected LHR, traces and network logs retained | Five first successful observations151/110/134.5/889.5/1252ms; two other attempts failed WebSocket setup before measurement. Reusing a debugging port caused local connection instability; subsequent fresh unique ports did not change the mobile/simulated settings. | AC03 | Preserve failed launches and all metrics. |
| F03 | Process observations during source tests/Semgrep | Concurrent work amplified CPU variance; later intermediate series380/179/141.5 and119.5/178.5/2522ms are retained, including their overlaps. Matching-process absence cannot prove absence of hypervisor contention. | AC03 | Do not infer a code improvement from those comparisons. |
| F04 | After parallel preflight:300.5/228.5/277.5ms, no matching source/scanner process observed; separate379ms sampled profile | Over-budget behavior also reproduces without the observed competing suite. Current CPU stacks include Canvas line/shape submission, projection and navigation initialization. | AC03 | Parallel load is not the sole cause. |
| F05 | First fixed A/B, B/A, A/B experiment | Baseline237.5/132/322.5; candidate102/210.5/182.5ms. Allocation changes are promising but210.5 still exceeds200. | AC03 | Superseded, not relabelled as a pass. |
| F06 | Second fixed A/B, B/A, A/B experiment on identical runner/browser/profile | Baseline102/178/269; candidate106.5/101/187ms. Candidate median106.5 versus178ms (40.2% lower); first pair is4.5ms slower, other two are faster. All three candidate values satisfy200ms. No matching competing source/scanner process was observed in these six trials. | AC03 | Selected finite correction; local diagnostic evidence only. |

Explicit CPU-sampled637.9999999999998/2238/379ms observations remain separate from
unprofiled metric comparisons. Every series, setup failure and artifact identity
is recorded in the retained evidence packet. The original native235.5ms and old
local289ms failures remain failed. No new native staging result is supplied here.
Small local sample counts and shared-host variability limit extrapolation.

## Decisions

Keep the complete same scene, formula, geometry, visible content, runtime drawing
order, half-pixel line threshold, eight-pixel viewport guard and near-plane clip.
No lower quality/cadence, extra clock/cache, delayed decorative startup, changed
performance case or larger budget is used.

- `site/engine/math.cjs`: intersect viewport outside-plane bits in one pass,
  retaining the exact empty/boundary/crossing primitive decision.
- `site/engine/projection.cjs`: gather face depth/points in one pass; avoid an
  unnecessary endpoint pair for already projected lines; compare squared CSS
  length against0.25 instead of calculating a square root for the0.5px cutoff.
- Independent baseline comparison checks complete projected command JSON for all
  five routes, both viewport classes and eight phases. Existing renderer cases
  retain clipping, silhouettes, formula layers/cache, fallback and native state.
- Bind exactly these two authored sources and generated `docs/space.js` in the
  original preservation assertion. Every other protected owner keeps its baseline.
- Add a finite `issue39-writing-tbt` runtime family and plain/staging/production
  tuples, retaining every older tuple and all byte/edition rejection cases.
  Four other runtime aliases stay byte-identical; only `space.js` changes.
  All three new editions still require frozen publication rights.

Protected main does not yet contain the new runtime tuples. Candidate registry
success is not trusted-controller admission. Prepare a narrow same-owner registry
prerequisite before a later ordinary staging run; do not broaden the selector.

## Sol tasks

| Task | Paths / behavior | Finding / AC | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Repeated exact artifact measurements and sampled attribution | F01–F04 / AC03 | Retain all series, settings, identities, traces and failures | Complete; local only |
| T02 | Finite projection allocation correction | F05/F06 / AC03 | Pinned command parity, independent viewport cases, renderer/source/owning checks | Implemented; exact final results in live PR/issue |
| T03 | Stop and report | AC04 | Keep PR Draft and later admission stages separate | Required at this handoff |

## Acceptance evidence

| AC | Check | Observation | Remaining gate |
| --- | --- | --- | --- |
| AC03 | Local paired unchanged200ms diagnostic | Candidate106.5/101/187ms; baseline102/178/269ms | Fresh native exact-head staging/performance and full production remain pending |
| AC03 | Current camera/renderer suites |30/30 preparation cases pass, no skips | Final clean owning/source checks recorded in live PR |
| AC03 | Publication/release-controller suites |39/39 preparation cases pass, no skips | Trusted-main new tuple registration and actual hosted admission |
| AC04 | Guard, generated/RI and source checks | Final exact-head evidence belongs to the issue/PR checkpoint | Independent/human/merge gates remain open |
| AC01/02/05 | Existing whole criteria | No new live provider/domain evidence | Existing gates unchanged |

No new full suite, native platform, device, independent review, permanent staging,
PR40 merge, production or domain/DNS operation is claimed by this report.

The first prepared acceptance policy exceeded its unchanged4000-character scope
bound; it was shortened without relaxing the policy. Clean4dc6b3a then passed17/18
owning checks; the sole failure was a staging-regression fixture still asserting
its old compact tuple. Its exact current expected identity was updated; all22
telemetry/budget/failure cases remain. Both failed preparations are retained.

## Issue synopsis

Writing200ms overrun reproduced on unchanged Chromium/Linux bytes. The bounded
allocation-only correction preserves full command geometry and yields local
106.5/101/187ms in the fixed comparison. Preserve all failures and runner limits;
stop before Ready/whole preflight/staging. The trusted controller needs the exact
new runtime family before future ordinary admission.
