# Writing causal localization — 6 October 2026

The maintainer requests finding and fixing the remaining cold Writing cost,
including removing filters/content controls in an isolated test. The unchanged
reference is `6d538e171ecbbaa3c3948aa0d8d118fad4aaaf5d`; its original Color
producer packages the reference. Only Draft #23 is used.

The existing Writing CI workflow collects two serial rounds, the second in
reverse order, on one runner. Every condition has an independent direct Writing
boot/first scroll and a fresh Research → Writing → Research → Writing itinerary.
Mobile 390 × 844, DPR 3, CPU ×4, dark theme, pinned Chromium, cache disabled,
gzip loopback and identical fine-stage instrumentation are held constant.

| Condition | Isolated question |
| --- | --- |
| current-color | Unchanged normal runtime |
| thematic-off / shared-off | Family projection/paint cost, construction retained |
| model-profile | Per-symbol construction and aggregate face preparation |
| model-no-thematic / model-no-shared | Construction plus paint cost of each family |
| layout-control | Native geometry constrained from a separate settled calibration |
| controls-off | Filters/content controls replaced with matching empty footprints |
| row-grid-off | Only outer publication grid replaced by measured child positioning |
| title-flex-off | Only title flex replaced by measured text/arrow positioning |

The four layout conditions use the same row/control constraints and canonical
title wrappers. Their post-window audits require unchanged publication content,
links, visibility, row/child/arrow/waypoint geometry and native scroll range
within 1 CSS pixel. A failed audit invalidates attribution but retains raw data.
No calibration geometry reads occur inside a timed intervention. Accumulated
per-symbol constructor spans nest inside model-build and must not be summed with
it. These private screens are diagnosis, never release/performance acceptance.

Models are procedural JavaScript geometry, without fetched 3D meshes/textures.
Writing has fewer vertices/faces/lines than Research in both detail modes.
The collected screen and paired confirmation below identify the native mount
and layout combined with Canvas work, plus cold face-preparation allocations.

## Collected causal screen

Run [37456563653](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37456563653)
collected all 20 trials on AMD EPYC 7763, Chromium 153, CPU ×4. The ZIP digest is
`ad1212e978e8a3402463a2f1b2a79cbc257dafbd41bfbbae17ef335cc991b2ee`;
artifact `11410370067`. Complete raw data, including every failed budget window,
is retained in `localization.json.gz`; `localization-summary.json` preserves
identities and numeric distributions. Collection success is not acceptance.

| Condition | Cold callback p50 / p95, ms | Native layout max, ms | Failed windows |
| --- | --- | --- | --- |
| normal Color | 25.85 / 89.85 | 47.95 | 2/2 |
| thematic projection off | 19.00 / 37.95 | 51.20 | 0/2 |
| shared projection off | 25.10 / 86.30 | 46.30 | 2/2 |
| constrained layout control | 28.60 / 96.80 | 48.85 | 2/2 |
| filters/content controls off | 25.45 / 87.40 | 42.35 | 2/2 |
| row grid off | 25.50 / 93.95 | 46.40 | 2/2 |
| title flex off | 28.05 / 99.70 | 49.95 | 2/2 |

All 24 controlled-layout audits passed: content, links, visibility, actual native
range and geometry remain within 1px. Removing controls saves some native work
but does not remove the spike; row grid/title flex are not supported causes.
Their frozen diagnostic positioning is not copied into authored source.

The worst normal callback is directly localized: Canvas projection/effects/paint
takes about 20ms, then its painted-progress callback performs history/DOM/archive
mount and a 46.5ms native range/layout flush, for 87.8ms total. The second normal
trial reaches 91.9ms with 49.4ms native range work. Family projection removal still
leaves an 82–92ms maximum; its improved p95 partly comes from more paint samples,
so motif deletion is not a sufficient source fix.

The construction profile identifies 16.6/17.2ms aggregate face preparation inside
40.9/42.2ms model-build (which includes profiler overhead). Per-symbol constructor
cost is spread across motifs: open-book 4.6/6.0ms, scroll 2.7/2.5ms; no enormous
single file or unique oversized model is present. Palette preparation adds about
14ms. Direct boot also contains a premature native layout before deferred archive
and navigation setup; the scene subsequently measures the changed document.

## Supported source correction and completed confirmation

The candidate preserves every motif, all detail/vertices and the existing HTML,
CSS, filters, bounded caches and one scene RAF. It removes the premature boot
measurement; replaces four temporary per-face vectors with exactly equivalent
scalar arithmetic (Newell planes retained); and lets animated Color midpoint
mount/layout run in one cancelable browser task after the painted old plane is
hidden. Immediate completion flushes pending work; interruption cancels it under
the route serial lease. Native scroll range is freshly measured as before.

This scheduling change reduces the work combined into one callback; it does not
claim to eliminate native layout. Opt-in `navigation-task` durations plus all raw
RAF/LongTask observations remain in inclusive windows. Confirmation compares
input readiness, paint gaps, the largest measured native task/RAF/LongTask and
long-task union as well as paint percentiles. A lower RAF percentile alone cannot
establish an improvement. Six balanced mobile and two desktop before/current
pairs include independent direct boots. A separate normal-runtime check compares
four widths, real filters, empty results, Reset and unfrozen content geometry.

Exact face equivalence covers all ten route/detail worlds and 1,440 projections;
`face-equivalence.json` retains identities and local ranking, which is not browser
acceptance. The optional projectedFace loop candidate was rejected after mixed
local rankings and is not applied.

Run [37458348938](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37458348938)
compares source `0187dc91fc19fd198e4a84b3953fd74d7a7ae2ec` against the unchanged
`6d538e171ecbbaa3c3948aa0d8d118fad4aaaf5d` reference. Both inputs use their own
normal Color producer, with fine-stage profiling disabled. Six balanced mobile
CPU ×4 pairs and two desktop CPU ×1 pairs ran on the same AMD EPYC 9V45 runner,
Chromium 153. This runner is faster than the EPYC 7763 localization runner;
only within-run paired results support the comparison below.

| Six mobile pairs: median per-trial metric | Before | Corrected |
| --- | ---: | ---: |
| Cold Canvas callback p50 / p95 | 17.10 / 31.65ms | 17.20 / 28.60ms |
| Cold maximum Canvas callback | 60.65ms | 30.95ms |
| Largest observed RAF / native task / LongTask | 86.0ms | 55.5ms |
| Overlapping LongTask intervals, union | 192ms | 93ms |
| Observed RAF / task / LongTask work, union | 590.45ms | 570.25ms |
| Input to route ready | 1320.55ms | 1324.05ms |
| Boot initialization complete: max(DOMContentLoaded, scene ready) | 344.50ms | 275.10ms |
| Boot first contentful paint | 324ms | 332ms |
| First-scroll callback p95 | 19.05ms | 22.10ms |
| Cold transition budget failures | 0/6 | 0/6 |

All six mobile pairs reduce the maximum Canvas callback; five of six reduce the
largest observed blocking interval, cold p95 and LongTask union. Native layout
still occurs, now in an observed separate task (median maximum 44.70ms), rather
than inside the same Canvas callback. Metrics include full callbacks/tasks that
overlap either boundary; interval unions avoid double-counting overlapping
observations. They are not an exhaustive measure of browser/GPU work.

This supports retaining the correction for the cold mobile blocking peak. It
does not show universally faster rendering, FCP, first scroll or route readiness.
The reference also passes all six mobile gates on this faster host, so this is
not a failed-to-passed acceptance claim. One candidate pair takes 66.4ms longer
to become ready; it and every other observation remain in the raw evidence.
The two desktop pairs have mixed results (maximum callback 35.8→37.5ms,
largest observed block 58.5→62.5ms; p50 12.25→10.95ms). They are a bounded
compatibility check, not broad desktop or release performance acceptance.
Queuing the mount task does not prove an intervening compositor presentation.

Normal-runtime geometry and actual archive filtering pass **32/32 cases**:
widths 390, 640, 641 and 1440, with eight default/filter/empty/reset states each.
The maximum measured geometry delta is **0 CSS px**. Publications, links, glyph
line boxes, arrows, row/control footprints, waypoints and native scroll range
match. No frozen diagnostic layout or filter removal is shipped.

Artifact `11410097468`, ZIP SHA-256
`97d052545e3db85e757987f1b0d52a1dc871ba2ccd8962646ff2b9484643c6ef`, retains the
confirmation. `fix-confirmation.json.gz` and `fix-geometry.json.gz` retain every
raw observation; `fix-confirmation-summary.json` records identities, all paired
deltas, inclusive blocking metrics and limitations. Base engine identity is
`b8800a2174d9da08aa5f124426863751d7048066fee18045f28574b152e64535`;
normal Color identity is
`bdca287a920ec5fed7194f00f219a65f320e27f6bc77e714409b7aa06442ef80`.

The dated PR diagnostic trigger is removed. Normal PR updates run fast checks
and the existing CI-only hosted preview; diagnostic replay is manual-only.
No full staging/native/soak matrix, stable promotion or production deployment
was run. Draft #23 remains the sole runtime PR; broader #12/#13 and owner visual
acceptance in #14 remain open.
