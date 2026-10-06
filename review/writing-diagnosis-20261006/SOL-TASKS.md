# Sol: isolate cold Writing costs, one factor at a time

6 October 2026. Owners: #12 performance, #14 visual behavior, #13 evidence.
Continue the sole Draft PR **#23**, `work/sol-primitive-cost-20261005`.
#18/#22 are closed as superseded; #26 CI infrastructure is on protected main.
Do not create a new PR, restart the full staging matrix, or promote staging.
Preview publication uses existing CI and the official Wrangler Action only.

## What is established

1. The visible full→compact→full change comes from S3's forced compact source/
   destination working set and `refineAt = clock() + 250` after arrival. It is
   present in repository commit `2d0914da20c826dc4e38a789ee3ed4d2c2077813`, absent
   in `0dbf5336104fafd68db1c9124d5a39a5c5f56fde`, and documented in
   [S3 execution](../site-engine-optimization-20261005/EXECUTION.md). This is a
   source-proven cause of late model refinement, not a measured cause of Color's
   mobile slowdown. Mobile already uses compact geometry in both states.
2. Original #23 base `174bef1f14390363953cc94ebc0ced136d39da82` and pre-fix current
   base `ba2ac7f257f2937ab8805ad106cb4ce1a801382e` have the same geometry and
   projection behavior: GitHub compare shows only whitespace in `world.cjs` and
   an equivalent `advanceAnimation` extraction in `lifecycle.cjs`. Their measured
   performance is broadly similar. Color adds ribbons plus content presentation/
   measurement/controls; it does not replace the Writing mesh.
3. [The six-round comparison](../site-consolidation-20261006/REPORT.md) separates
   two problems: shared cold initialization and additional repeated Color cost.
   Median first-scroll p95 is 19.7ms base / 28.3ms Color; cold-flight p50 is
   18.4 / 25.1ms and observed paints/s 15.4 / 12.5. Direct-boot largest callbacks
   are about 153–197ms in both. Four of six Color cold windows fail the unchanged
   gate. Do not interpret 80.8 / 33.5ms p95 as a 2.4× longer transition: Color's
   smaller paint sample selects its maximum; end-to-end duration is similar.
4. Earlier instrumented [V1](../site-sol-continuation-20261005/V1.md) identifies
   **37.7ms native range/layout**, 6.0ms history read, 2.4ms DOM, 4.1ms archive,
   6.5ms projection, 1.2ms effects, 1.4ms sort, 7.8ms Canvas submission inside
   one heavy callback. The 38.7ms mount-layout span includes the range read;
   never add nested spans. This is older, perturbed evidence to recheck, not a
   current clean timing or proof that layout is the only cause.

## Visual correction in this increment

`site/engine/lifecycle.cjs` now chooses geometry using viewport/adaptive detail
for both flight and arrival. Source and destination models/palette are prepared
before the first travelling paint. No flight-only downgrade or delayed arrival
refinement remains. Intermediate rooms still load lazily before projection.
Keep the three-route/six-model cache, mobile compact mode, slow-device adaptation,
two visible rooms, one Canvas/RAF and existing Off/reduced/hidden behavior.

The new base engine fingerprint is
`9a82a529271c1d91c57de7be9c923a6bca5f3609acde7b4ed00ab55cc0944b92`.
This can increase desktop flight/model-preparation work. It is a visual fix,
**not a performance improvement claim**. Include preparation in input-to-ready.
The screen-size/secondary-line culling thresholds in `projection.cjs` are a
different mechanism and are unchanged. If a particular small motif still fades
in late with stable `data-geometry`, capture that object/camera scale before
changing those thresholds; do not undo all culling to conceal a model switch.

## Geometry inventory

Run `node review/writing-diagnosis-20261006/inventory.cjs` from the repo root.
Counts are authored world geometry, not visible commands, raster cost or FPS.
Each route has 252 objects: 196 thematic and the same 56 shared instances, with
three recursive depths. These are finite prebuilt motifs, not unbounded fractals.

| Route | Full vertices / faces / lines | Compact vertices / faces / lines |
| --- | ---: | ---: |
| Index | 14070 / 7344 / 4735 | 10650 / 5488 / 3167 |
| Research | 14644 / 7842 / 6145 | 10488 / 5590 / 3777 |
| Writing | 11422 / 4798 / 5057 | 9398 / 3890 / 3549 |
| Talks | 13288 / 6460 / 5039 | 11196 / 5474 / 3535 |
| Credits | 11424 / 5998 / 4311 | 9648 / 4928 / 3311 |

Writing's unique vocabulary is open/closed books, scrolls, A, quills, pages,
quotes and parentheses. Scrolls have the largest thematic geometry group:
28 instances, 2296 vertices / 1400 faces / 1288 lines full, versus
1120 / 700 / 616 compact. Open books and loose pages are the next useful
line-heavy candidates. Brain, attention and other shared symbols occur on every
route. Lower total counts do not exonerate geometry: camera framing, clipping,
overlap, visible line count and Canvas fill/stroke behavior can differ.

## Ordered experiments

Resolve PR #23's head once and package the exact base/Color inputs through CI.
Record source/tree, artifact and variant fingerprints, environment and patch
hash for each diagnostic rendition. Never compare an old hosted alias with a
new local export. Keep diagnostic variants private artifacts; no user-facing
flags, production switches or second PR. A variant with removed features is
causal evidence only, not an acceptable release candidate.

| Order / hypothesis | Single controlled intervention | Evidence that supports it; what would weaken it |
| --- | --- | --- |
| V0: earlier full detail has acceptable desktop cost | Before=`ba2ac7f`, after=this visual-fix head, both Color; 1440×900 at DPR1.5, CPU×1. Add one 390×844 DPR3 CPU×4 control with unchanged compact geometry. | Compare preparation, first painted response, input-to-ready, max/gaps/paint count and adaptive tier. Record full detail from first flight paint through arrival+400ms. If desktop work regresses, optimize preparation/visible work while retaining early readiness; never restore the known visible downgrade silently. |
| H1: Color ribbons add repeated drawing cost | On the same current engine and DOM, disable only ribbon collect/paint; keep travel, styles and controls identical. Then disable only spatial text transform using the existing `vo.content-flight=off`; finally both. This is a 2×2 ribbons × spatial-transform comparison. | A fall in project/effects/paint cost or busy share with unchanged native layout implicates ribbons; a fall in style/layout/compositor work implicates transform. `content-flight=off` still runs the presentation/measure hooks and opacity work: it is not a complete base-equivalent control. If both off still differs, test the remaining presentation/measure wrapper separately with camera trajectory and mount phase fixed. |
| H2: first Writing DOM layout, rather than drawing, is the large cold spike | Keep full Writing content and the fixed camera timeline but suppress Canvas draw only in a diagnostic run. Separately keep the Writing scene and replace the archive DOM with a same-height inert block measured from the matched control. | If the native range/layout spike survives no-draw but drops with the DOM block, investigate text/style/layout. The block intentionally removes semantics and is not a proposed shipped fix. Verify height and mount phase; reject a changed scroll range/camera as a confound. |
| H3: cold model/palette preparation is a separate startup bottleneck | Keep DOM/effects unchanged; prepare the destination world and palette before the measured flight in one diagnostic only. Record this preparation as a separate span **and** total preparation+flight. | Lower first-flight spike but similar inclusive total identifies movable work, not a free speedup. Compare model-build vs model-color and warm return. If the spike stays at DOM mount, caching alone cannot solve it. |
| H4: Writing geometry or its placement is unusually expensive | Fixed prerecorded Writing camera/phase, same DOM and Color effects. First omit thematic draw while retaining shared geometry, then shared draw while retaining thematic geometry. Do not alter world construction in this rendering-only screen. | Reduced projection/paint cost isolates a family. Only for the implicated thematic family, screen scrolls, open books and pages separately; then remaining motifs if necessary. Count actually submitted faces/lines, clipping and Canvas calls. For allocation cost, use a separate world-construction ablation. Do not swap whole routes, which would change camera/layout as well. |
| H5: archive initialization/filter context causes extra work | Keep the complete archive markup/visibility/height but bypass initial `Archive.mount/refresh` only in a diagnostic rendition. Snapshot URL/filter state and supply the same initial scene focus; then test one normal topic change/reset separately. | Improvement in archive/layout spans suggests repeated writes or invalidation; no change points to native first layout instead. Separately compare simple rows against unchanged text/row count if DOM layout remains the suspect. Never ship a bypass that breaks filtering, URL/hash, empty results, history or print. |

Do V0 first. For H1 screen the four states once each with a dedicated fine-stage
diagnostic; for H2/H3 use one paired trace each. Choose H4 or H5 based on the
attributed span, rather than running every possible combination. A one-pair
screen only prioritizes work; it cannot establish a performance improvement.
If two factors interact, retain the 2×2 evidence before choosing a fix.

## Protocol and stop conditions

- Primary comparison: dark, 390×844, DPR3, CPU×4, same pinned Chromium/runner;
  loopback gzip, cache disabled, one serial browser process at a time. Reuse
  `tools/quality/writing-probe.cjs`'s proven setup; extend a diagnostic driver
  rather than weakening its existing identity checks or hard-coded baseline.
- Every cold boot starts a new browser process/context. Direct Writing boot,
  then first 100px/200px scrolls. Separate fresh process for Research at the top
  → Writing cold → Research → Writing warm. Do not prewarm cold controls.
  Use Research 42% only as a separately labelled reproduction of the older
  layout trace; never mix its values into the top-start baseline.
- `SiteEngineProbe`/`SiteEngineStages` and one short browser trace attribute
  model-build, model-color, mount-history/DOM/archive/scroll/layout,
  layout-range/stops/writing, draw-project/effects/sort/paint. Inspect trace
  style/layout and raster/compositor work: JS Canvas timing is submission time,
  not complete GPU/display cost. Draw spans can contain lazy model preparation;
  nested durations must not be counted twice.
- For the best supported change only, run six clean paired serial repetitions
  with balanced AB/BA ordering and fresh cold processes; disable fine-stage
  tracing. Retain every trial and failed raw window, not pooled p95. Record p50,
  p95, maximum, sample count, actual paints/s, callback busy share, preparation,
  first response, readiness, largest gap and long tasks. Compare sample counts
  beside p95, especially the 18–19 vs 22–24 paint boundary.
- Keep transition p95≤80ms, max≤200ms, preparation≤160ms, max gap≤300ms,
  ready≤3200ms and ≥8 paints; steady p95≤33ms and mobile idle share≤20% remain.
  Report these per window with existing validators. A completed diagnostic job
  does not turn budget failures into a pass. No full/native/soak matrix here.
- Stop screening once a repeated span-level effect identifies a plausible
  mechanism. Make one source change, preserve visuals/content/scroll semantics,
  run focused regressions and confirm against the exact unchanged control.
  If noise is as large as the effect, report it as unresolved rather than
  iterating cosmetic geometry reductions without evidence.

## Current verification and handoff

The new lifecycle regression fails on the old source (it builds compact Research
and Writing before flight), then passes after the correction. Space/flight tests:
45/45. Preview helper tests: 8/8, including rejection of the old compact flight,
acceptance of adaptive/mobile detail and cache bounds. Generated source,
interactive/static exports and bundle have been regenerated. The existing fast
CI preview now observes actual Writing paint states at 1440/390 through the old
post-arrival boundary; it adds 400ms per normal scenario, no extra test matrix.

V0 timing and H1–H5 ablations are **not run by this planning increment**. Previous
Color performance failures stay open. Do not close #12/#14 on these unit checks.
Update this record with actual CI preview results and exact source identities.
