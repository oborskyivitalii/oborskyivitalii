# Issue 69 — 11 October 2026 fractal/focus/Credits preview cleanup

Owner: [#69](https://github.com/oborskyivitalii/oborskyivitalii/issues/69).
Execution: existing Draft [PR71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
Role: implementation and self-review; no independent review claimed.
Parent: local `b1ec7f4`; remote PR71 remains `6e7cd70`. Exact prepared source
hashes, standalone/public identities and limited observations are in
[raw evidence](2026-10-11-preview-cleanup-observations.json).

## Intent and cause

The maintainer approved the common timing direction and requested four fixes:
remove the momentary next-page fractal at the end of Home→Research; remove the
bright bottom line on other pages; remove the Credits frame; verify Credits uses
the same block/camera transition. Preview-first testing remains in effect.

Research's opening camera is one world unit deeper than Home's. The prior
unbounded cell selection therefore changed from Home/Research to Research/Writing
for two observed late transit frames, immediately before restoration selected
Research alone. Their measured camera depths were−104.061 and−104.893.
`visibleRooms` now clamps the two-room working set to the current journey's source
and destination interval. Intermediate rooms remain visible on longer flights;
the source/target frames cannot admit a room outside that interval. Existing
camera timing, geometric culling, three-room/two-detail cache and adaptive limits
remain. The optional paint probe reports participating projected room names only
when diagnostics are enabled.

Native programmatic focus on the route's negative-tabindex main landmark can
paint the browser's outline around the whole content. Mouse-driven Chromium
showed no outline; keyboard-driven navigation reproduced `outline-style:auto`
on the main. This accounts for a wide bottom line on full-width routes and a
complete rectangle on the inset Credits main; the platform chooses its color.
The canonical style suppresses only this landmark's focus outline. Link/button/
select focus rules remain. The actual footer separators already share Home's
`1px solid var(--line)` and are retained unchanged.

Credits already uses the common router/controller/scene sequence via ordinary
utility links. No special transition, duration or new preference is introduced.
The deliberate scroll-edge itinerary retains its four header pages; Credits is
verified through its native footer link and Home return.

## Limited exact-export observations

Chromium153, standalone Color export,1440×900, ordinary CPU. This is a brief
preview observation, not a full browser/performance matrix or physical Safari
verification. All three journeys finish with native content usable and no page
errors. Departure/arrival each plan1000 ms; rows use700 ms shared motion; phase
completion uses animation events. The camera retains1750 ms.

| Journey | Raw readiness | Projected rooms seen during flight |
| --- | --- | --- |
| Home → Research | 3843.7 ms | Home, Research |
| Research → Credits | 3814.8 ms | Research, Writing, Talks, Credits |
| Credits → Home | 3804.3 ms | Credits, Talks, Writing, Research, Home |

Late Home→Research transit samples at1333.3,1366.6 and1399.9 ms all project
Research only; no Writing geometry is admitted. Credits has9 arrival rows and8
departure rows at the observed native positions, using the common overlap rule.
Footer separators on Research, Credits and Home compute to the same neutral
`1px solid rgb(204,208,201)` in the observed light theme.

Keyboard navigation after the fix retains main as the focus destination with
`outline-style:none`. The next focused header link remains `:focus-visible`
with its3 px solid theme-accent outline. Both fixes are global across routes.

Syntax, pinned formatting of touched sources, deterministic generation, checked
Color packaging, bounded CS09 source guard and RI build/verify pass. CS01–CS07
self-review: canonical owners, native semantics/layout, one clock, existing
timings/preferences/caches/budgets retained; no framework or new render loop.
CS08–CS10: these are partial preview checks. Full source/lint/security, lifecycle,
CPU/performance, hosted, Safari/iPad and independent acceptance remain deferred
until the visual iteration is accepted. No budgets, scanner rules or tests are
relaxed to claim a pass.

## Delivery and acceptance

The corrected standalone preview is the reviewable delivery. Prior auto-review
rejected public pushes pending explicit publication consent; no public-push
retry or connector workaround is used. Remote PR71/online preview remain on the
older serial implementation. No staging/full test/merge/release action ran.

AC01 retains original planning evidence. AC02–AC10 and all transferred#70 criteria
remain open for their whole original review, physical-device, lifecycle/cost and
delivery gates. This correction supplies partial evidence for geometry/behavior,
fallback focus, shared style and Credits routing; it does not close those gates.
