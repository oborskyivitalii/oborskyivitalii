# Issue 69 — 11 October 2026 preview refinement

Owning intent and dated anchor: [#69 preview refinement](https://github.com/oborskyivitalii/oborskyivitalii/issues/69#preview-refinement--11-october-2026).
Execution remains in [Draft PR71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
This document is implementation analysis and self-review. Independent AI review
is recorded separately and cannot establish physical-device or maintainer visual acceptance.

Inspected starting head `a45ef3a370c816cfeeb769d2e2ad0b9482ce06b9`, tree
`95303f1641bdd9df49f1a06e8363e43b2622307d`. The preceding preview was reviewed by
the maintainer; its motion still needed refinement. New prepared measurements
must identify their actual public bytes and dirty state; final clean-head evidence
belongs to the issue and PR.

## Intent and acceptance

The maintainer refined the same AC09–AC10 behavior: smoother fractal centering;
separators participate in block motion; reverse departure and assembly process
visual rows from bottom to top. The lowest row finishes before the row above,
with peers in a row together, like Tetris. Forward motion and ordinary native
reading entry remain within the existing scope. No new merge or release decision
is inferred. Original camera, geometry, lifecycle and cost guards remain.

## Findings

| ID | Evidence and implication | AC | Disposition |
| --- | --- | --- | --- |
| R01 | Maintainer observed abrupt centering at the preceding preview. The 180 ms framing legs added 360 ms outside the old flight envelope. | AC09 | Resolved: 360 ms center/restore legs share the original scene envelope; gradual multi-paint lifecycle checks pass. |
| R02 | Native shell/ancestor borders were held independently of moving ink and disappeared. | AC03, AC10 | Resolved in authored controller/CSS: measured native-edge proxies follow their block, hidden paint is excluded and cleanup restores native paint. |
| R03 | DOM-order stagger started upper reverse rows before lower rows; later arriving rows crossed content already placed above. | AC03, AC10 | Resolved: native shell rectangles form serial rows; reverse departure/arrival is bottom-first and peers move together. |
| R04 | Exact-source staging performance failed on the first cold Home→Research sample: 3,371.6 ms exceeds the unchanged 3,200 ms maximum. | AC06, AC09, AC10 | Resolved locally under unchanged guards: whole block phases 500/600 ms and camera shares the original deadline; final hosted evidence remains pending. |
| R05 | Independent actual narrow Home observation found a 54 px range reduction: appending a separator changed the final paragraph's structural CSS match. | AC03, AC07, AC10 | Resolved in source: last-of-type preserves paragraph layout and final-note color; source-style actual-browser parity passes ten route/width cases; final artifact admission follows. |
| R06 | The first refined browser/helper replay assumed a paper pseudo-element on section navigation, while it has real moving ink and separator layers. Shared synthetic hosted fixtures also lacked the refined row evidence. | AC07, AC10 | Resolved: nullable nonexistent paper is excluded, actual ink/separator layers and refreshed hosted fixtures retain negative controls; 397 registered tests pass. |

The failed [staging run](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38122693332)
used Chromium 153.0.8010.12, 390 px and CPU ×4 at the starting head above.
Functional and Color smoke, source, host and static checks passed. The first cold
latency failed; later flight/Lighthouse checks were not completed. Its retained
[raw report artifact](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38122693332/artifacts/11696546190)
is evidence of that failure and must never be reported as a passing profile.

## Decisions

Applicable CS01–CS10 remain mapped through AC07 and the existing owning policy.
Camera behavior stays in the lifecycle/math owners; declarative motion and native
paint stay in canonical CSS; the entry controller owns finite measured geometry,
row ordering and cleanup. Reuse existing browser samples and source checks rather
than adding a workflow, matrix, perpetual clock or budget exception.

## Execution tasks

| Task | Owner and expected change | Finding / AC | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Camera lifecycle: smoother center/restore inside existing total envelope | R01, R04 / AC09 | Camera lifecycle and actual staged framing | Implemented; local checks pass |
| T02 | Scroll entry: directional visual rows and associated native separators | R02–R04 / AC03, AC10 | Row, paint, cleanup and actual active geometry | Implemented; local checks pass |
| T03 | Existing navigation probe: ordering/paint observations and negative fixtures | R02–R03 / AC10 | Registered source/browser fixtures | Implemented; local checks pass |
| T04 | Canonical generation, independent review and clean-source hosted evidence | AC06–AC10 | Basic, source, style, RI/CI, scanner and staging guards | Local checks complete; final clean-head hosted admission pending |

## Acceptance evidence

Final prepared Base digest `28ffc50006521cff74d38dfca56a4b484370e634ce3aff70f2e59a77830437cf`
and Color digest `5b1de28c54c7493c8bae5e1564166aa324b3585d697de5b1cbdaabce62d2be6f`
bind the regenerated public bytes at the starting head/tree with `sourceDirty=true`.
The full registered staging-source selection passes **397/397** with zero skipped,
failed or canceled tests. Basic (13 theme/archive and 10 Color flight cases),
style guard, RI28 and coupling19 pass. Maximum route HTML remains
99,997/100,000 bytes.

The isolated local canonical four-flight profile at 390 px and CPU ×4 passes
all unchanged guards: Research cold/warm 2,513.2/2,442.4 ms; Writing cold/warm
2,897.4/2,739.0 ms. Browser is Chromium 153.0.8010.0 on loopback, distinct from
the hosted failed browser. This is prepared-public local cost evidence, not
hosted, device or release acceptance. The final local Base/Color functional matrix passes **104/104** with zero page
errors across all five routes, 390/1440 px and Day/Night. Independent final
actual-public checks pass ten separator/native cleanup cases, sixteen trajectory
cases with zero crossings over 180 samples per phase, and four gradual-framing
lifecycle cases. Pinned formatting and 198-file lint pass with zero warnings.
The companion summary/review retains raw observations and earlier failures;
Complete prepared-public security admission passes; clean-head hosted evidence follows separately. Earlier green evidence remains bound
to its own source; the failed staging latency remains recorded above. AC01 retains
its original accepted planning. AC02–AC10 and all nine transferred #70 criteria
remain open while their full visual, device, lifecycle, cost and delivery gates
are unresolved.

The bounded checksum preparation preserves all 4,177 prior ordered records and
all frozen-baseline bytes. It appends 190 exact public-only candidates, supported
by canonical cold generation, verified final Base/Color manifests and recomputed
raw Git identities. JSON whitespace is compacted with one finding per line;
new-only concise reasons keep the original 2 MB bound. The compressed exact proof
retains input bindings, the fresh raw hashed scanner findings, inert producer text
and the preceding 192-untriaged pre-summary-freeze admission failure. Independent verification passes all 190 candidates, complete public manifests and
Color derivation, prior history and unchanged owners/baseline. Final complete scanner admission passes: Semgrep193 files/zero findings or errors,
Bandit36 exact reviewed findings/zero untriaged, and detect-secrets920 tracked text
files/4,502 candidates/zero untriaged with fresh RI/CI verification. Final ledger
is 1,999,068/2,000,000 bytes; creation-stage bytes/status and independent final-state
verification remain in the compressed proof. The final scanner report and raw
hashed findings are retained there separately from earlier admission failures.

## Issue synopsis

Preview feedback refines the same sequenced transition: smooth centering, moving
separators and bottom-first reverse rows. The preceding staging profile caught
an actual input-to-ready regression; fix it under the original guard and return
matching current-source evidence to the existing issue/PR.
