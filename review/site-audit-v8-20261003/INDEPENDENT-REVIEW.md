# Independent v8 code review — 2026-10-03

Reviewer: `/root/independent_site_audit`, a separate read-only agent requested for
the security/quality/performance/stability audit. The reviewer did not implement
or modify v8 in this turn and inspected source before receiving scanner results.
This is an agent review, not a third-party penetration test or physical-device test.

Material: root AGENTS/CONTRIBUTING, public HTML/CSS/JavaScript, producer scripts,
tests and workflow. Local HEAD `0bc14514ad9e5112cb4c10b7b4f57ef1913d1889`,
tree `1bec5de6726283a830c97979350c3b8b25d7c28c`, identical to live PR #10 v8
head `6176cb209a1d46a1ae056c3008c77e20281b6f93`. No production sources changed.

## Findings

1. **P2, confirmed: rapid scroll reversal retains a stale camera target.**
   `docs/space.js:464–469` returns when the newest target equals the current pose,
   but does not clear an already queued animation. Reusing the existing VM fixture,
   `settle(); scroll(1800); scroll(0); settle()` leaves all five routes at scrollY=0
   with the wrong camera. Writing ends at z=-63 rather than +24. Clear only the
   obsolete camera animation in this branch; retain ambient scheduling and phase.
   Add the same-frame reversal case and reversal during an unfinished transition.

2. **P2, confirmed structural cost: fallback dominates HTML and DOM.**
   `tools/build_scene_fallbacks.cjs:8–20` emits 5,608–9,115 paths from full desktop
   geometry before main content. Page HTML is 1.29–2.02 MB raw / 193–308 KB gzip.
   `docs/styles.css:58–60` hides SVG with visibility once Canvas is ready, retaining
   its DOM. Create a deliberately smaller static rendition using the same visual
   vocabulary. Compression alone does not remove parsing/style/memory cost.

3. **P2, fault-injected: drawing failure does not restore fallback.**
   Initial getContext failure is handled; subsequent draw errors are not.
   Injecting a clearRect exception after activation leaves `data-ready=true`,
   SVG hidden and no scheduled frame. There are no contextlost/contextrestored
   handlers. Add bounded failure recovery that exposes the fallback, stops work
   and keeps the motion control truthful. No natural device context loss observed.

4. **P2 performance priority: repeated allocation/projection and uncapped scroll.**
   `docs/space.js:342–377,471–510` allocates maps, closures, vertex arrays and shapes
   for each paint, then sorts. Face-level visibility runs after projection;
   object-level horizontal/vertical culling is absent. Scroll bypasses the ambient
   cap. Profile object culling, reusable buffers/transforms and a shared paint
   budget; preserve the latest camera target and visible thematic composition.
   Narrow viewport detail is not a capability-based quality controller.

5. **P3, simulated capability boundary: missing Object.hasOwn breaks enhancement.**
   `docs/space.js:498,534` uses it without a guard. Removing the API makes the first
   frame throw after exposing “Motion: on”. Content and SVG remain. Use a
   compatible own-property helper or guard initialization. Historical browsers
   were not tested; the minimum supported version needs an explicit policy.

## Security and measurement boundaries

No exploitable injection or exfiltration path found in the reviewed runtime.
Query/hash values are allowlisted, dynamic strings use textContent, and stored
preferences affect appearance. No remote runtime scripts or network APIs were
found. CI pins checkout by SHA, grants contents:read, and does not persist credentials.
Missing deployment CSP/headers would be hardening work, not evidence of an exploit.

The old capture harness times every RAF, including skipped paints, and allocates
per-vertex instrumentation arrays. Its p50/p95 is neither clean drawing duration
nor FPS. The new audit must separate painted callbacks, skipped callbacks, long
tasks and input responsiveness. Node-only projection observations demonstrate
allocation/work but do not measure Canvas, physical devices or a memory leak.

Parent verification: `reproduce-v8.cjs` independently reproduced finding 1 on
all five routes; baseline HTML hashes/sizes and actual browser fault injection
are retained with the main audit. Scanner and browser observations are reported
separately in REPORT.md. Implementation and re-verification remain follow-up work.

## Follow-up review: observed WebKit CSS readiness failure

The same reviewer independently assessed the browser evidence and failure chain.
`css-readiness.json` confirms that delayed CSS makes tested WPE WebKit enter
`readColors()` with zero stylesheets and empty properties. Chromium/Firefox wait
for the delayed stylesheet. This establishes the ordering/readiness defect in
this WebKit build, without asserting branded Safari/physical Apple coverage.

`readColors()` commits empty colors and clears fills before `blendColor()` throws.
Initialization therefore skips `updateControl()`. Already-registered load/resize
callbacks can still schedule painting; their normal same-width path does not
reread colors or finish initialization. This explains ready=true, advancing phase
and a hidden Motion control in the observed normal-resource runs.

The reviewer endorses CSS-before-deferred-script ordering, atomic validated
palette updates, initialization/failure state gating, recovery after styling
becomes available and a usable motion control before autonomous rendering. A
catch around blendColor or arbitrary timeout alone is insufficient. Complete
default colors must not start painting while the layout stylesheet is absent.

The proposed performance plan is appropriate with these constraints: adaptive
tiers must preserve macro positions/IDs, because current compact mode changes
root counts and angles; use sustained measured painted-frame cost with
hysteresis/cooldown; keep Off/reduced authoritative. Preserve the last successful
pose when Canvas remains usable, and show the static fallback on unrecoverable
failure. No-JS preservation means content/navigation/theme usability and thematic
identity, not retaining thousands of fallback path nodes.

## Final report/handoff check

The reviewer checked REPORT, SOL-TASKS, REPRODUCE and the retained JSON. Counts
and numeric tables matched: 60 views, 60 fallback cases, 15 performance scenarios,
all 15 settled Off samples with zero callbacks/paints, and unchanged production
hashes. Four corrections were incorporated: both accessibility tools use axe
4.13.0; the utilization denominator is sampled elapsed wall time; Python/Node
gzip sizes are labelled separately; future refactors must positively validate
the probe that currently recognizes callbacks named `frame`.

The reviewer found no further substantive audit/handoff correction. This bounded
acceptance applies to the report and plan after those corrections, not v8 release
readiness, a production security certification or any future implementation.
