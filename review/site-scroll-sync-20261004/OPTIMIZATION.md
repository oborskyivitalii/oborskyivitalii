# Canvas optimization and ribbon fill repair — 5 October 2026

This record binds the earlier optimization snapshots. The latest corrected
content directions, stronger reading backgrounds and bounded ribbon smoothing
are recorded separately in [REFINEMENT.md](REFINEMENT.md); its fresh results
do not replace the source identities of the historical measurements below.

The maintainer authorizes shared-engine refactoring, repair of the screenshot's
white ribbon strips, and content flight On/Off × Glass/Soft tests. This supersedes
[FLIGHT.md](FLIGHT.md)'s pre-optimization measurements. Ribbon palettes and content
flight remain an offline comparison. Publication/push/merge stay paused, and every
#13 budget and required release check remains. Nothing was published.

## Changes

- `site/engine/renderer.cjs` separates ordered Canvas commands from lifecycle and
  projection. Only adjacent compatible lines are batched, with opacity difference
  below 1/256; depth order, explicit outlines and paper joins remain. Faint internal
  facet strokes are omitted on desktop as on mobile. Projection face/line passes
  are now separate helpers, without new cognitive-complexity debt.
- Runtime projection skips facets below 0.35px² desktop /0.5px² mobile, almost
  invisible alpha and lines shorter than 0.5px. Static model/SVG stays complete.
  Flights use compact facets, restoring settled detail. Each of at most three
  active/pending rooms caches at most two models. Theme changes update every
  color table. There is still one RAF, unchanged motifs/paths and a 24s loop.
- Ribbons use shared-edge world-anchored RGB and one opaque polygon fill per
  segment. Former affine bitmap triangles could extrapolate outside their
  no-repeat atlas along folded/cap edges. Removing that path removes unpainted
  strips and atlas snapshots. Near clipping interpolates RGB; cap overlap hides
  joins without widening side edges. Bright full-width seeded packets remain.
- Soft is the default; explicit saved Glass choices are honored. Glass still
  admits at most six visible surfaces. A persisted Content flight checkbox
  independently removes depth transforms while preserving fade, camera, router,
  mount timing, accessible content and end-scroll continuation.

Final Color Prototype: 603,739 bytes; SHA256 prefix `af77ab68…`.
The complete final identity is retained in the delivered measurement archive.
Maintained public artifact digest:
`117e8b8bbdcb97cac31216c52b3e5f2e8de1a22d92dec243171bca1290644c0b`.
Final also follows the updated shared engine; its previous hash is historical.

The factorial/visual record measures the 603,420-byte `2a68de54…` snapshot.
The delivery differs by ternary-expression formatting required by Semgrep's
parser, regenerated version metadata, and a finite endpoint guard for a
zero-length projected RGB gradient. The formatting-only intermediate snapshot
has an identical Espree AST excluding source positions. The final guard has
fresh focused tests, pixel/input/lifecycle fixtures and a 300-second soak. The
full factorial matrix belongs to the named measured snapshot, not to a silently
substituted final hash.

## Repeated measurements

`check-engine-performance.cjs HTML OUTPUT_JSON 3` runs 24 sequential balanced
trials: three repetitions × two profiles × four effect combinations. Each uses
Night Research, 1.4s warm-up, 2.5s idle/scroll, then Writing→Research→Home→Research.
There are 96 positive flights, 48 static windows, no script/HTTP errors and no
device-still substitutions. Chromium 153.0.8010.12 headless uses software rendering;
desktop is 1440×900 CPU ×1, mobile 390×844 DPR3 CPU ×4 (Canvas itself DPR1).

These pooled painted-callback percentiles include Canvas commands and synchronous
mounting. **They are not display FPS**, GPU timings or battery measurements.

| Profile | Material | Flight | Idle p95 | Scroll p95 | Route callback p95 |
| --- | --- | --- | ---: | ---: | ---: |
| Desktop | Soft | Off | 9.5ms | 11.4ms | 26.5ms |
| Desktop | Soft | On | 10.0ms | 13.1ms | 26.4ms |
| Desktop | Glass | Off | 12.6ms | 17.2ms | 18.9ms |
| Desktop | Glass | On | 10.3ms | 15.5ms | 25.2ms |
| CPU ×4 mobile | Soft | Off | 16.9ms | 19.0ms | 54.6ms |
| CPU ×4 mobile | Soft | On | 16.1ms | 20.0ms | 72.9ms |
| CPU ×4 mobile | Glass | Off | 16.4ms | 21.5ms | 55.3ms |
| CPU ×4 mobile | Glass | On | 14.5ms | 21.3ms | 64.4ms |

JS alone does not make Glass consistently slower. Traced Paint CPU per measured
second, however, rises from median 23.4ms/s Soft to 40.0ms/s Glass with flight On
(71%), and from 11.8ms/s to 23.6ms/s with flight Off (101%). This is extra Paint
work, not a 71% increase in total site CPU. It justifies Soft by default.
[WebKit](https://webkit.org/blog/3632/introducing-backdrop-filters/) describes the
extra rendering passes required by backdrop filters. CPU ×4 Soft flight raises
route callback p95 by 34% and nearly doubles Paint work; desktop callback differences
are small/noisy. A cheap plane setter alone misses mounting/rendering costs.

Six baseline trials use pre-refactor `637b826…` with the same Glass/flight-On
protocol. CPU ×4 scroll p95 falls from 27.1ms to 21.3ms same-effects optimized
(21%); the new Soft default is 20.0ms (26% lower). Same-effects route p95 falls
from 73.8ms to 64.4ms (13%). Soft/flight-On still has 72.9ms p95 and occasional
mount spikes; no claim of smooth 60FPS on every weaker machine is made. Final
idle busy share is around 10%. Motion Off/reduced remains an exact still option.

Local CPU ×4 Research DOM ready spans 564–772ms; observed LCP 560–760ms. File-URL
samples are not hosted/network Core Web Vitals. Standalone embeds five routes and
images; hosted output uses cached resources. Other cost factors include transfer,
viewport/DPR², geometry and stroke counts, page mount/layout, filter area/radius,
browser/GPU and power mode. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
describes batching, state changes and bitmap-resolution tradeoffs.

## Regression record

- Full run:116 Node +18 Python pass. Final projection split also passes 60 focused
  engine/export/lifecycle tests. New renderer tests check ordering, opacity/arrow
  batching boundaries and exact insignificant geometry; CI includes them. After the final gradient guard, all 17 focused renderer,
  ribbon and flight tests pass.
- Final lifecycle: both midflight Off phases, retarget, print, controlled hidden
  and persisted flight Off pass. After warming the finite router cache, 40 cycles
  retain exactly5 documents/4,357 nodes/67 listeners and rooms/models≤3/6. Hidden
  is a controlled document.hidden fixture, not native OS visibility acceptance.
- Final plane/input fixture:20 directional flights,16 held-clock captures, actual
  history offsets and11 trusted mouse/key/CDP-touch cases pass.
- Final RGB pixel fixture:13,597 facet-interior samples have zero alpha holes or
  unintended white pixels. Bright packets/far fog remain intentional.
- Soft/Glass each pass80 contrast views/7,180 sampled positions. Soft minimum
  5.580 normal/3.897 large; Glass5.281/3.666; zero failures.
- Ten all-route/viewport cases pass growth/height/footer/reorder/filter, exact
  camera endpoints and history. Eighty surface/scroll cases and3 storage/capability
  fallbacks pass. Forty Off/reduced bitmap captures pass. These records bind the
  AST-equivalent `2a68de54…` snapshot. Generation/fallback/SEO/preview/bundle
  freshness pass. Scanner/RI and patch records are finalized in the continuation below.

`check-engine-sustain.cjs` passed all 15 route/profile cases with unchanged
33ms CPU ×4 idle/scroll, 20% idle busy, positive-paint and exact Off/reduced
assertions. The formatting-only intermediate snapshot's worst CPU ×4 idle p95
is 25.5ms (Research), and its worst scroll p95 is 20.7ms (Writing).

The exact 603,739-byte delivery passed a separate 300-second Research soak on
CPU ×4. Across ten 30-second windows, worst callback p95 was 20.4ms and maximum
idle busy share was 11.35%. Collected DOM nodes remained 2,059→2,059 and event
listeners 67→67; after-GC used heap rose 97,384 bytes. Off produced zero paints.
No script errors were recorded. This bounded test does not prove that every
possible long-term leak or physical-device issue is absent.

## Continuation after the connection interruption

The interrupted working changes were recovered unchanged into local branch
`work/site-engine-finish-20261005`, preserving `work/site-scroll-sync-20261004`
and its frozen #17 base. Source export exactly reproduces both current standalone
HTMLs. The final 603,739-byte Color Prototype includes all five routes, vivid
opaque RGB ribbons, directional content flight, end-scroll continuation and
Soft/Glass controls. Completed checks and the cumulative patch are packaged for
review; no push, remote CI, merge or deployment is claimed.

Physical Safari/iPad, Firefox/WebKit matrix, independent design/rights, hosted
Lighthouse/network and real-host checks remain separate required release evidence.
These local results neither close #12/#13/#14 nor authorize publication.
