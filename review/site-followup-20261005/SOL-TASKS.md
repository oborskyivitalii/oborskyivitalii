# Sol continuation — 5 October 2026

Start from the current head of **Draft [PR #18](https://github.com/oborskyivitalii/oborskyivitalii/pull/18)**,
branch `work/site-followup-20261005`, and create focused fix branches from it.
Main contains the accepted older PR stack; this optimization/primitive continuation
is not merged. Read [REPORT](REPORT.md), root AGENTS,
[check profiles](../../SITE-CHECK-PROFILES.md), and the live owning issues.
Do not repeat completed S1–S6. The maintainer authorizes code integration and
issue maintenance; actual publication remains paused. New independent review
is not supplied by this implementer review.

## R1 — deterministic reverse endpoint (first)

Focused issue [#19](https://github.com/oborskyivitalii/oborskyivitalii/issues/19),
under owners #12/#14. Requirement: a deliberate upward edge continuation opens the
previous **primary header route at its real bottom**, every time. Forward
continuation opens the next route at the top. Credits stays outside the sequence.

Current `SiteNavigation.go(...,{atEnd:true})` passes `position:"end"`, but
`mount()` consumes it only once. Ordinary reverse cases reach the correct bottom.
`check-reverse.cjs` demonstrates late layout growth leaves a gap of 863/916px on
desktop/mobile, Motion On/Off. This injection does not explain every reported
top landing; instrument restoration reasons/route tokens before assuming it does.

Implement a navigation-scoped endpoint intent, separate from a saved history
position. Apply after archive filters/footer mount, reconcile at arrival after
clearing presentation transforms, and use the existing layout invalidation path
for bounded initial font/size changes. Recompute the real range; do not reuse a
previous route's `scrollHeight` or add artificial spacer height. Cancel on route
interruption, new deliberate user input or the end of the bounded settling window.
Do not permanently pin readers to the footer, add another scene RAF, or use a
blind fixed timeout as correctness. Programmatic scroll events must not cancel
their own endpoint intent. Off/reduced must still land correctly without starting
an animation clock.

Acceptance: reverse across all three adjacent route pairs, cold/warm, wheel/key/
touch, rapid interruption, 390/1440, motion/content-flight On/Off and reduced;
short/zero-range and filtered Writing; delayed fonts/footer/height change before
arrival and during bounded initial settling. Final gap ≤2 CSS px. Check native
Back/Forward at a saved middle position, hash navigation and user takeover.
Initially diagnose narrowly, then put the necessary regression into the existing
hosted navigation suite; keep the basic default at ten focused tests.

## P1 — cold Writing frame cost

Owner #12; evidence #13. Baseline: local runtime `9bc672b`, Color SHA-256
`3e25d66b76bdbbfc6aac1940708d5e91987c9e8689acba7d8b268b6343e43adf`.
Three selected paired reports are retained with the earlier execution handoff.
Pooled flight p95 improved 78.1→54.4ms, but cold Writing still has a 102ms window;
the maximum frame contains 48.5ms synchronous layout. Model+palette build 41.6ms
happened ~650ms earlier. Warm builds are eliminated. Idle p95 worsened 19.2→22.7ms.

1. Add bounded **diagnostic-only** spans around model construction vs color fill,
   archive setup, DOM/metadata/fallback replacement, computed-auto scroll restore,
   `measurePlane`/native reads, projection, global sort and Canvas submission.
   Keep inclusive frame/input-to-ready/paint-gap measurements separate. A trace
   or profiler run cannot be used as the clean budget control.
2. Check `lifecycle.cjs`'s `draw → reportTravel → mount → refresh(sync)` coupling.
   Reuse a single native layout snapshot where safe; batch DOM writes before
   reads, avoid repeatedly toggling the transform to measure the same plane,
   and avoid a second archive layout. Keep the computed-auto scroll flush: the
   earlier unflushed version incorrectly inherited smooth behavior with Motion Off.
3. The quality controller currently measures the whole draw-plus-route callback.
   Diagnose whether route mount cost incorrectly reduces Canvas detail/cadence.
   If splitting that feedback, keep the outer whole-frame budget intact; do not
   improve reported p95 merely by moving mount work outside the instrumented RAF.
4. Only optimize projection/sort/allocation if spans establish that hot path.
   Do not restore the rejected weak-buffer/Object.assign experiment: it worsened
   idle/scroll and still left cold spikes. Preserve one stable global depth sort,
   bounded three-room/six-model cache, palette cap and honest memory accounting.

Validate with balanced sequential before/after trials, same selected variant,
dark Research, 390×844 DPR3 CPU×4 and the same four-route journey, without another
browser/CPU job. Keep raw per-window data and all outliers. Every cold/warm window
must satisfy existing 80ms p95 / 200ms max / 160ms preparation / 300ms gap /
3200ms ready / ≥8 positive paints; idle/scroll 33ms and idle share 20% remain.
No physical FPS/power claim. Check the current stronger meshes, not old assets.

## V1 — preserve the new primitive edition

Owner #14. Implemented in `site/scenes/world.cjs`: closed hemispheres/folds/stem,
depth axes and marked line/bar/scatter plots, actual fraction/superscript/subscript
LLM formula geometry, readable bounded rotations. All pages use the same finite
56 shared instances. Tiny recursive copies omit secondary guides/rails to retain
both the existing per-kind limits and the older total-shape ceiling; major meshes
stay expressive. No bitmap/texture dependency or new animation loop.

Regenerate through the producer, not edits to `docs/`. For an enlarged source
atlas run `node review/site-followup-20261005/export-primitives.cjs OUTDIR`.
Check the actual page views in both themes. Decorative plots imply no research
measurements. Color remains an offline comparison until explicitly selected and
tested as the deployable variant. The new assets cannot inherit old performance
acceptance; record the new file hash and effects fingerprint.

The fresh paired run now establishes a second performance task: new-mesh idle
p95 is 33.5 / 36.1 / 26.9ms against 21.3 / 22.1 / 17.4ms for the optimized old
meshes. Pooled idle rises 20.9→28.0ms; two windows fail 33ms. Cold Writing is
73.8 / 88.4 / 154.1ms; two windows fail 80ms. Warm flights all pass. The new
edition must remain Draft until corrected. Inspect per-symbol projected shape
count/coverage and draw cost: making formula faces readable also exposes more
strokes to the camera. Object/vertex ceilings alone do not bound visible overdraw
or Canvas command cost. Preserve large recognisable models; simplify tiny
recursive copies only when a screen-space measurement justifies it. Current
maximum faces+lines is 13,987 against the existing strict 14,000 ceiling, so
adding detail globally is inappropriate.

## H1 — staging after integration

Owner #8; checks #13. Follow [the updated runbook](../../SITE-STAGING.md).
Before any activation, replace the obsolete open-PR-10 trust binding coherently
across caller allowlist, `fresh`/`trustedHead`, recovery artifact branch identity,
deployment records and status-comment target. Start with manual protected-main
dispatch, exact approved main tip and immutable basic artifact/run IDs. Do not
weaken same-repository/source/freshness checks or accept arbitrary PR inputs.

Use focused negative fixtures for stale SHA, fork/wrong branch, artifact/run/digest
mismatch, closed legacy PR, wrong recovery branch and rejected host configuration.
Keep both publication guards false until the maintainer authorizes hosting.
Then configure the protected environment, upload the candidate, run full hosted
automation, promote the identical bytes and prove recovery. Full production
automation must run after actual deployment. Physical/rights release decisions
remain separate; never turn missing evidence into a success.

## Handoff and closure

Use existing owners and one focused PR per independently reviewable fix. Append
intent/outcome/evidence rather than overwriting historical issue decisions.
Close only completed accepted scope. #1/#2/#5/#6/#7/#8/#11 still own launch,
publication, migration, harness, rights, hosting and learning work. #12/#13/#14/#15
remain open for their specific runtime, release, design and hosted acceptance.
Report what is merged, what is actually checked, and what remains unpublished.
