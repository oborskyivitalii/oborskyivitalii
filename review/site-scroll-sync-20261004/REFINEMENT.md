# Corrected flight, stronger backgrounds and ribbon smoothing — 5 October 2026

The maintainer corrects the departure direction and requests slightly less
transparent text backgrounds and economical smoothing of the faceted ribbons.
This supersedes the departure directions in the historical [FLIGHT.md](FLIGHT.md)
and supplements the source-bound [optimization record](OPTIMIZATION.md).
Owners remain #14 visual comparison, #12 lifecycle/navigation and #13 budgets.
The work remains the offline Color Prototype; push, merge and publication stay
paused. Production engine/public bytes and the maintained Final are unchanged.

## Result

| Navigation order | Current page | Destination page |
| --- | --- | --- |
| Home → Research → Writing → Talks → Credits | Enlarges toward the viewer and disappears past the camera | Arrives from distant fog |
| Reverse order | Shrinks into distance and disappears | Enters from the near side and settles into place |

Departure targets are now +1,050px forward and −3,600px backward. Arrivals stay
−4,200px forward and +1,020px backward. Positive depth remains below the 1,200px
perspective plane. Retargeting inherits displayed depth and opacity; the real
content tree, native scroll range, history and the existing displayed clock stay
authoritative. No new frame loop, text clone or motion timer is introduced.

| Background opacity | Open areas | Reading blocks | Rows |
| --- | --- | --- | --- |
| Soft | 72% → 78% | 76% → 82% | 78% → 84% |
| Glass | 64% → 70% | 68% → 74% | 70% → 76% |

Only the local background gains six percentage points. Glyphs remain opaque;
Glass blur radii/admission, reduced-transparency coverage and preferences stay
unchanged.

Ribbon side edges use Canvas quadratic curves through their analytically
projected midpoint. Eligibility requires an unclipped quad with a projected side
longer than 20px and midpoint deviation above 0.5px desktop /0.8px compact.
Small/distant and near-clipped facets retain straight edges. Mesh spacing,
bitmap/DPR, world-anchored RGB, cap overlap, three ribbons, seeded signals and
the exact 24-second phase remain. Curved bounds participate in visibility tests.
There is no whole-frame filter or supersampling. In the fixed regression pose,
21/233 desktop and 11/53 mobile facets need curves; this is a sample, not a
constant maximum for every pose.

## Source-bound comparison

Color Prototype: 605,016 bytes, SHA256 prefix `5c9fa8d2…`. Full identities and
source snapshots are in the measurement archive. Its straight-edge comparison
has the same corrected flight, opacity, mesh and painter, with only curve
admission disabled. The unchanged Final is 576,115 bytes (`b11be804…`).

Three repetitions per variant/profile were run sequentially in order
straight → curved → curved → straight → straight → curved: 12 trials, 24
idle/scroll windows and 48 native route transitions. Both use Night Research,
Soft and content flight On. Profiles are 1440×900 CPU ×1 and 390×844 DPR3 CPU ×4;
mobile Canvas stays DPR1. Each warms 1.4s, measures idle/scroll for 2.5s each and
traverses Writing → Research → Home → Research. No other browser suite ran
during the comparison.

| Profile / ribbon edges | Idle callback p95 | Scroll callback p95 | Flight callback p95 | Median Paint CPU per second |
| --- | ---: | ---: | ---: | ---: |
| Desktop / straight | 9.7ms | 11.7ms | 27.0ms | 5.3ms/s |
| Desktop / curved | 11.6ms | 11.6ms | 29.1ms | 5.2ms/s |
| CPU ×4 / straight | 17.0ms | 20.1ms | 72.1ms | 20.2ms/s |
| CPU ×4 / curved | 17.2ms | 16.0ms | 66.2ms | 19.7ms/s |

CPU ×4 curved idle/scroll per-window p95 remains ≤19.7ms and idle callback busy
share ≤11.03%. Desktop idle rises 1.9ms in the pooled comparison; CPU ×4 rises
0.2ms. Scroll/flight ranges overlap between variants, so lower values do not
establish a speed improvement. This bounded result supports economical smoothing,
not zero cost on every device. Mount-related flight spikes remain; curved mobile
per-flight p95 reaches 95.8ms. Callback and Paint timings are not display FPS,
hardware GPU, battery or total browser CPU measurements.

## Fresh regression evidence

- 117 Node and 18 Python tests pass. The new curve regression independently
  samples analytic geometry at quarter points, away from the midpoint used to
  construct controls; projected error falls below one quarter of straight-edge
  error in the fixture. Shared material endpoints and mesh count stay exact.
- The actual exported painter covers 19,502 straight/curved interior pixel
  samples with zero alpha holes and zero unintended white pixels. Ten all-page
  Day/Night captures and the four directional-phase contact sheet were inspected.
- Twenty actual DOM-plane flights and sixteen paused phases pass in both themes
  at desktop/mobile widths. Both departure and arrival size are asserted, as are
  native range, clean arrival state, header/Canvas identity and exact history.
  Eleven wheel/key/CDP-touch and reduced/Off input cases pass without HTTP/script
  errors.
- Seven lifecycle cases pass: both midflight Off phases, exact retargeted
  depth/opacity, print, controlled hidden, persisted flight Off and forty route
  cycles. After cache warm-up, DOM remains 4,357→4,357 and listeners 67→67.
  Controlled hidden is not native OS visibility acceptance.
- Soft and Glass each pass 80 views and 7,180 sampled glyph/background positions
  with zero failures. Normal-text minima are 5.630 Soft /5.514 Glass; large-text
  minimum is 3.897. This is a sampled check, not complete WCAG certification.
- Generation, fallbacks, page gallery, offline bundle and diff freshness pass.
  Current RI, local lint/security and cumulative patch identities accompany the
  continuation archive; existing scanner dispositions are preserved.

All fifteen route/profile cases pass fresh static idle/scroll and exact
Off/reduced assertions. The slowest profile's unchanged limits are callback
p95 ≤33ms and idle callback busy share ≤20%.

| Current Day / Soft / CPU ×4 | Idle p95 | Scroll p95 | Idle callback busy share |
| --- | ---: | ---: | ---: |
| Home | 22.6ms | 18.4ms | 13.82% |
| Research | 22.5ms | 16.3ms | 13.12% |
| Writing | 17.6ms | 21.1ms | 10.58% |
| Talks | 19.5ms | 16.3ms | 11.12% |
| Credits | 16.2ms | 15.5ms | 10.28% |

## Reproduction and limits

`node review/site-scroll-sync-20261004/export.cjs OUTPUT_DIRECTORY` reproduces
both standalone files. All browser scripts accept an explicit HTML path; set
`SITE_AUDIT_TOOLS` to the locked installed toolchain and `SITE_AUDIT_CHROME` to
its Chromium. `check-engine-performance.cjs HTML JSON 1 soft-flight` selects the
bounded two-profile comparison. Export the control through
`RIBBONS-PROTOTYPE.decorate(html,{smoothEdges:false})`, then apply the same flight
decorator. `check-engine-sustain.cjs HTML DIRECTORY matrix` selects the fresh
15-case static/Off/reduced matrix; the default full and `soak` modes retain their
existing 300-second assertions without relaxed budgets.

Chromium 153.0.8010.12 uses software rendering in this headless lab. Synthetic
CPU ×4 is not a physical-device result. The earlier 300-second soak remains
bound to `af77ab68…`; it was not rerun for this small visual correction.
Physical Safari/iPad, other browser engines, independent review and hosted
release evidence remain separate. No remote CI, push, merge or host operation
is claimed. [Canvas quadraticCurveTo](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/quadraticCurveTo)
defines the native path primitive used here.
