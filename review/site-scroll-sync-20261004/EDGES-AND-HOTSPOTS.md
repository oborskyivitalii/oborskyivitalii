# Bidirectional scroll continuation and localized stalls

2026-10-05 · continuing #12/#14, retaining #13 budgets and the publication pause.

The maintainer requests the equivalent of bottom→next when scrolling upward at
the actual page top, and asks whether the stalls also seen under Soft justify
removing Glass. This increment keeps the current Glass option and its six desktop /
three compact surfaces, 7px / 3px blur, reduced-transparency fallback and default
Soft. It changes navigation and diagnoses the independently expensive mount path.

## Resulting behavior

- Fresh wheel, key or touch continuation at the top opens the preceding route
  at its actual bottom. Bottom continuation still opens the next route at zero.
- Home does not wrap upward; Credits does not wrap downward. A page that fits in
  one viewport uses the direction of the deliberate input to select its neighbor.
- Inertia arriving at an edge is insufficient. Boundary residence, fresh wheel
  intent, threshold and cooldown protect against chained route skips in both
  directions. Reversal discards intent accumulated for the other edge.
- PageUp, ArrowUp and Shift+Space join the existing downward keys. Form controls,
  nested scrolling, links, modifier shortcuts, open Appearance, print and hidden
  states retain their existing boundaries.
- The control is now labelled “Scroll between pages”; its existing local key
  and Off preference remain compatible. No new content spacer or top hint is added.
- Motion Off/reduced keeps ambient time frozen; an explicit route choice retains
  the existing still-destination paint, which then stays frozen. Mid-flight Off,
  hidden and print retain the exact displayed bitmap. Touch events retain the
  original target after that route DOM
  is removed. Three temporary listeners on that target consume an accepted gesture
  through end/cancel and detach; no detached target should outlive the gesture.

## Diagnostic evidence and scope

The isolated before file is SHA-256
`34baf409c90f656ce182e4145cb9facd3fcb2015487f66dec5dd13ee28bd193b`,
from checkpoint `a7421b34c6885fad284d84e189376898de577220`.
Four sequential desktop sampling/timeline/stage runs reproduced Research→Writing
mounts of 243.3ms and 234.5ms in Soft, and 234.0ms in one Glass run; another Glass
mount was 19.4ms. The corresponding native `ScrollLayer` span was approximately
198–211ms wall time, with far less thread CPU time in its recorded `tdur`.
This localizes the wait to scroll restoration, without proving its internal
GPU/compositor/IPC cause on physical browsers.

Merely moving scroll restoration before DOM replacement or after archive
initialization did not consistently remove the wait. Direct scrollTop assignment
also retained a slow run and could inherit smooth CSS behavior. The initial
scoped-auto candidate measured 17.1–34.7ms mounts in six diagnostic runs, but its
forward Motion Off touch check later exposed deferred smooth restoration. These
fast timings belong to an incomplete historical candidate, not final acceptance.

The final helper temporarily sets scroll-behavior:auto, flushes that computed
preference before scrollTo({behavior:"auto"}), and restores the prior inline value
and priority in finally, including native exceptions. It is used for route
restores, same-page openings and history positions. This keeps native destination
positions immediate and leaves ordinary smooth anchors available afterward.
Correctly flushed exploratory probes had mounts of 18.2, 20.7, 129.9 and 18.6ms;
the remaining 105ms native restore wait is preserved. An alternate outer-mount
scope retained 200.5/214.7ms restore waits under Glass and was discarded. Neither
experiment proves complete elimination of ScrollLayer waits. The final exact-file
repeats are recorded in the accompanying performance report and evidence archive.
Authored navigation and dependent local outputs are regenerated coherently; no
renderer, geometry or material budget is relaxed.

Diagnostics serialize a separately instrumented HTML and keep its own SHA;
inclusive stage times must not be summed. Raw CPU profiles/timeline events,
discarded experiments, exact candidate checks and balanced uninstrumented
Soft/Glass × content-flight On/Off repeats are kept in the current evidence archive.
The HTML performance report carries the final exact candidate SHA and actual
verification outcomes; earlier material/ribbon reports remain historical.

Current Color HTML SHA-256:
`6d495b32eff37852200d0945f1c4615a2299fa3bca04f17859acfc8d7d51df7f`.
Fresh browser checks and balanced 24-trial measurements are source-bound to this
file. The prior unflushed candidate was SHA-256
`06e9f4851385e14c1d91272255fdad94939a29a47de28830fe3033de244d011a`:
its normalized Paint medians with content flight On were desktop Soft 5.31 /
Glass 7.61ms/s (+43.2%), compact CPU x4 Soft 22.33 / Glass 32.93ms/s (+47.5%).
These historical measurements are preserved without being relabelled as final.

That historical candidate's first Glass weak matrix passed four routes but failed
Credits idle p95 38.5ms (>33ms; maximum 62.6ms). Subsequent Credits diagnostic probes
did not reproduce it; their instrumented timing is not budget evidence. A fresh
complete weak Glass matrix of that same candidate passed all five routes; Soft's
complete matrix also passed. The original Credits outlier remains unexplained.
Current-file results are separate; a later success does not erase an earlier
failure or establish universal smoothness/full release acceptance.

## Verdict and acceptance boundary

Glass causes additional rendering work; a Soft stall does not make blur free.
The before audit measured +35% compact and +44% desktop normalized Paint work
with content flight enabled. These are local Paint-stage costs, not total CPU/GPU,
battery consumption or a corresponding FPS loss. The localized mount wait
is also present without Glass; the immediate restore path is corrected, while
remaining native waits and cold-room/Canvas peaks need their own evidence. Keep bounded Glass available and
Soft as the inexpensive default; target measured hot paths rather than removing
Glass as a universal cure.

Checks include pure symmetric input gates, reverse wheel/key/touch actual-bottom
landings, accepted-touch tails, history, native direction/content-plane behavior,
material persistence, exact freeze, all-route weak-profile budgets and syntax /
trust-boundary scans. Native Safari/iPad, hardware GPU/power, independent review
and the full release gate are separate. No push, merge, deployment, publication
or remote CI is performed.
