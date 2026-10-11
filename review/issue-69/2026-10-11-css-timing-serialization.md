# Issue69 — 11 October computed CSS timing serialization

Owner: [#69](https://github.com/oborskyivitalii/oborskyivitalii/issues/69),
[PR71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
Role: delegated harness implementation and self-analysis; independent review
and fresh staging admission remain separate. Inspected source: clean head
`35e25f9`, followed by the explicitly dirty validator/test correction below.
Read the agent, style, acceptance, profile and review contracts; inspected the
retained functional report and revalidated its captured block observations.

## Intent and acceptance

The approved motion remains a 1000 ms overlapping departure, 1750 ms camera
flight and 1000 ms arrival. Multi-row movement remains 700 ms with a shared
300 ms start span; page length does not extend that plan. This correction serves
AC06, AC07 and AC10 by rejecting real timing violations while accepting the
browser's representation of the same authored timing. It changes no runtime,
styles, public motion configuration, profile selection or release authority.

## Findings

| ID | Evidence | Finding and implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | [Staging run 38155018308](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38155018308), [functional job 114517106011](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38155018308/job/114517106011), artifact 11708078557 | Chromium at 1440 px serialized a computed row delay as 42.8571 ms while the arithmetic plan was 42.857142857142854 ms. Exact numeric equality rejected an error of approximately 0.000043 ms. | 06,07,10 | Preserve the original failed report; correct only computed CSS comparison precision. |
| F02 | `tools/quality/navigation.cjs`, `tests/navigation-fixtures.test.cjs` | Fractional spacing appears with eight and 24 visible rows. Native CSS serialization may round fractional seconds differently across browser engines. | 06,10 | Allow at most 0.001 ms for computed delay and final envelope arithmetic. Keep movement duration exact, first delay zero, direction/overlap/order and layer alignment strict. |
| F03 | Retained seven departure/arrival captures | Both Chromium captures and all five Firefox at 390 px captures pass the corrected block validator. Chromium's original journey stopped after Writing, so later checks were not collected. | 06,07,10 | Targeted retrospective evidence only; no relabeling of the failed run and no complete-profile pass claim. |

## Decisions and tasks

The parent implementation task authorizes a minimal harness fix following the
actual failed staging attempt. The previous allowance was exactly zero for
computed delay equality; the new allowance is one microsecond solely at the CSS
serialization boundary. The authored 1000/700 ms row plan, 1750 ms camera plan,
frozen214 identity and equivalent-ready accounting remain unchanged. In
particular, the 3200 ms equivalent-ready guard, 20 ms exposure tolerance and all
paint, preparation, resource and measurement-window budgets are unchanged.
Stable and Pages promotion were skipped in the failed attempt. Pages project-path
support remains a conditional investigation, outside this actual correction.

| Task | Owners and expected result | Check | Status |
| --- | --- | --- | --- |
| T01 | `tools/quality/navigation.cjs`: admit serialization precision without an extra timing allowance | Fractional-delay fixture and retained captured observations | Implemented in dirty prepared source |
| T02 | `tests/navigation-fixtures.test.cjs`: exercise six-significant-digit and six-decimal second serialization, eight/24 rows, both directions and viewport widths | Reject 0.002 ms delay changes, 0.001 ms movement-duration changes, serial schedules and final-row timing changes | Passed |
| T03 | Exact corrected-head source/static/hosted admission and existing promotion controller | Fresh GitHub staging run | Pending |

## Acceptance evidence

`node --test tests/navigation-fixtures.test.cjs tests/quality.test.cjs
tests/staging-regression.test.cjs` passes 43/43 cases with no skips or cancellations.
Pinned formatting passes for both changed code owners. The retained raw functional
report is unchanged: original `pass: false`, original candidate `35e25f9`, original
Chromium navigation failure preserved. `checkTiming` passes its seven retained
captured transitions with the corrected prepared validator. Revalidation is stored
outside the checkout and identifies original run/job/artifact separately from the
dirty validator source; the original CI artifact remains the raw evidence owner.

| AC | Check | Result | Remaining gate |
| --- | --- | --- | --- |
| 06 | Original readiness/cost failure regressions plus captured CSS timing revalidation | Targeted43-case suite and seven captured transitions pass | Fresh complete corrected-head bounded staging and original device/full-cost gates |
| 07 | Pinned format, strict positive/negative harness fixtures | Prepared-source pass | Current-source Basic/RI/security/source/hosted CI and independent review |
| 10 | Fractional directional wave, serial/error rejection, actual captured block observations | Prepared-source pass | Fresh complete staging plus original device/geometry gates |

## Local lint follow-up

The first bound lint check of unpublished prepared head `899dc92` rejected the
new test callback's cognitive complexity of 33 against the unchanged 25 limit.
Extract the timing-violation checks into `checkFractionalTimingViolations`; the
callback continues to exercise the same row, direction, serialization and
viewport matrix, and every negative mutation remains active. Focused pinned
ESLint with zero allowed warnings now passes both code owners, and the same
43-case suite passes again. No complexity/debt exemption or scanner policy
changes were added. This prepared correction has not been published or staged.

## Independent AI review

Codex delegated motion-review agent independently inspected the dirty correction
to `tools/quality/navigation.cjs` and `tests/navigation-fixtures.test.cjs` on
base `35e25f9`, together with this report and the retained functional artifact
from run 38155018308, job 114517106011, artifact 11708078557. No concern was found
with the scope or strictness of the correction.

The 0.001 ms boundary applies only to computed CSS delay and final-envelope
serialization comparisons. Movement duration, same-row ink/paper/separator and
peer timing equality, initial zero delay, directional row order, overlap and
the 24-row bound remain strict. Authored inline schedules, raw phase/camera
accounting and readiness, preparation, paint and resource budgets are unchanged;
this does not grant an execution-latency allowance. The new fixtures exercise
fractional eight/24-row schedules in both directions and widths under both
serialization forms, and reject larger delay changes, altered durations and
serial scheduling.

The reviewer independently reran the stated three-file suite: 43 passed, zero
failed/skipped/cancelled, in 1.619 seconds. The corrected `checkTiming` also passed
all seven retained `flightEvidence` captures. The original artifact remains
`pass: false` at `35e25f9`; uncollected Chromium checks remain unverified. This
bounded AI review supports the harness correction, not a completed staging run,
device approval or promotion. The fresh published head and its admission results
will be recorded in the live owning issue/PR.

## Issue synopsis

The first authorized staging attempt retained a real harness failure caused by
computed CSS serialization precision. A one-microsecond comparison boundary now
admits the unchanged fractional wave and rejects larger or semantic timing
changes. The original failed run remains failed; fresh corrected-head staging is
required before two-host admission and exact-tree merge.
