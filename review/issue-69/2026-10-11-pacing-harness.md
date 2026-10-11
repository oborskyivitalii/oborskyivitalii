# Issue 69 — 11 October 2026 pacing harness compatibility

Owning issue: [#69, pacing validation follow-up](https://github.com/oborskyivitalii/oborskyivitalii/issues/69#pacing-validation-compatibility-follow-up).
Execution: [Draft PR #71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
Role: primary-agent analysis and self-review; a separate reviewer inspects the
bounded diagnostic and smoke changes. Prepared state is an explicitly dirty
descendant of published `7cc437f`; final refs and check state belong to the live
issue and PR. This follow-up changes test/measurement owners; authored runtime
and generated public bytes retain the published V6 motion.

## Intent and findings

The readable pacing amendment preserves AC01–AC10, their whole-criterion gates
and all transferred #70 gates. Hosted failures exposed incomplete harness
integration; they are retained in the [raw evidence](2026-10-11-pacing-harness-evidence.json.gz).

| Finding | Exact evidence | Treatment |
| --- | --- | --- |
| Basic diagnostic fixtures lack modern navigation identity | [Basic run 38131109991](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38131109991) | Preserve the existing validated frozen Writing baseline through a private identity-bound historical guard; current candidates require complete modern plans. |
| Raw paired readiness includes deliberately longer presentation | Existing frozen baseline contract and current verified pacing plans | Compare verified candidate equivalent readiness with historical raw readiness; retain raw values and the existing added-cost limits. Missing or invalid candidate plans never earn an allowance. |
| Color smoke retains a fixed 10 s wait | [Normal preview run 38131109744](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38131109744) | Use the existing source-owned finite pacing deadline; generic smoke and HTTP passed in that run. The reported timeout alone does not establish a runtime hang. |
| Resumed live-camera observation retains a fixed 3 s wait | [Selected run 38131138339](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38131138339) | Only an observed in-progress flight receives the canonical maximum camera duration plus the original observation window; already-settled cameras keep 3 s. Actual completed travel and two live phase changes remain required. |

## Bounded owner tasks

The issue records this maintenance scope before publication. Writing diagnostic
fixtures remain targeted rather than becoming a routine browser matrix. Its
private historical path is available only after the existing authoritative
frozen-baseline identity check; exported candidate validation remains strict.
Synthetic baseline controls retain literal historical telemetry. Current
controls include owned identities, actual row slots and complete camera legs.
Collector output retains actual viewport width for repeat validation, and
diagnostic and Color waits use the canonical finite deadline. Direct input
dependencies are registered. No runtime timing, resource budget, cost limit,
workflow profile or delivery gate changes.

Live camera stability now excludes both a current and a preceding in-progress
travel sample. Constant camera coordinates during framing/restoration therefore
cannot finish the observation; two real ambient phase changes follow actual
arrival. Adaptive holds and bounded failure/error retention keep their existing
rules. Only an initially observed flight adds the canonical 3900 ms maximum
camera program to the original 3000 ms observation window.

The selected parent run failed its functional camera wait and Color smoke; it
did not hit the overall workflow timeout. Four isolated CPU×4 flights separately
pass: Research equivalent cold/warm readiness is 2573.2/2415.8 ms and Writing
2922.2/2732.5 ms, with raw values 9517.2/9359.8 and 9266.2/9076.5 ms. Both
Lighthouse trials pass separately. These partial results do not make its aggregate
gate successful or provide follow-up-head admission.

CS01 and CS03–CS10 apply to the touched quality owners. Focused meaningful tests,
pinned format/lint, Basic, the bounded style guard, current RI and coupling
verification supply automated evidence. Independent review checks exact legacy
guards, identity isolation, current negative cases and timeout ownership.
Focused author checks pass 8 Writing cases and 57 combined Color/engine/navigation/
staging/source quality cases. A separate reviewer independently executes all 12 Writing/Color
owner cases: 12 pass, zero failures or skips. It verifies the historical guard
against the pre-pacing source, private identity isolation, strict candidate
plans, viewport propagation, unchanged budgets and a genuine added-delay
negative. Basic, pinned format/lint and the bounded style guard pass locally.
It also independently executes 32 additional engine/navigation/functional
fixtures, all passing with zero skips or failures, and verifies the conditional
deadline plus the strictly stronger completed-travel predicate.
Hosted results and final clean-source acceptance are recorded separately in the
live issue/PR. Failed parent runs are never relabeled as follow-up success.

## Acceptance disposition

This repairs automated integration evidence for AC07/AC08 and the existing
AC06/AC09/AC10 measurement route. It supplies no new visual or physical-device
admission and changes no acceptance checkboxes. The immutable V6 preview remains
available while follow-up CI runs. Draft, implemented, staged, approved, merged
and production delivery remain separate states.
