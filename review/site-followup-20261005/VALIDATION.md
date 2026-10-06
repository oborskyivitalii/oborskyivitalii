# Primitive follow-up validation

5 October 2026. Source is the generated Color standalone, **664,320 bytes**,
SHA-256 `8150206fb06d264c36688eda54a46f779447705c274f5f18f0cf3398e16e83ac`.
Effect contract 1 fingerprint:
`fc24728bbde174b9cba0f901d23052f65bc17ed702482ec11cb13514762cad21`.

**Verdict: visual/source implementation complete; performance acceptance fails.
Keep the continuation PR Draft.** No deployed, physical-device, independent,
full security/advisory or complete hosted pass is claimed.

## Targeted checks

- Default basic command passes: ten focused tests, source generation, executable
  standalone syntax, finite shared motif/line geometry, route/footer/size checks,
  and 58 disjoint workflow artifact names. No additional default suite added.
- Existing spatial/renderer regressions: **36/36 pass**, including exact freeze,
  bounds, periodicity, clipping, theme/source invariants and arrival behavior.
- All ten full/compact route models are finite and within existing bounds:
  maximum 252 objects, 14,644 full / 11,196 compact vertices, 7,842 faces,
  6,145 lines, 5,353,265 serialized bytes. Maximum faces+lines **13,987** preserves
  the older strict 14,000 combined ceiling. Serialized size is not live heap.
- Source-generated native fallbacks, all-page standalone previews and offline
  handoff manifest are fresh. One new source-derived SVG atlas covers all seven
  changed motif types; no externally generated bitmap enters the renderer.
- Twenty actual opening captures cover five routes × Day/Night × 1440/390.
  No page errors or horizontal overflow. The implementer inspected the complete
  contact sheet and the enlarged primitive atlas. This is not independent visual
  acceptance or a fresh contrast audit.
- Two-width browser smoke covers primary itinerary, Credits footer/boundaries,
  history, persistent header/Canvas, absence of Glass and Motion Off.
- Reverse-end diagnostic: four ordinary On/Off × width cases land exactly at
  the bottom; four delayed-footer cases retain 863/916px gaps. This intentional
  failure is retained for R1, not reclassified as a navigation pass.

## Paired performance: new assets versus optimized old assets

Three sequential pairs, alternating AB/BA/AB, Chromium 153.0.8010.12 headless
SwiftShader, dark Research, 390×844 DPR3 CPU×4, no trace/profiler and no concurrent
browser/CPU check. Identical idle/scroll windows and Research→Writing→Research→
Home→Research journey. All raw windows, including failures, are retained.

| Metric | Optimized old motifs | New motifs |
| --- | --- | --- |
| Each trial idle p95 | 21.3 / 22.1 / 17.4ms | **33.5 / 36.1 / 26.9ms** |
| Pooled idle p95 | 20.9ms | **28.0ms** |
| Pooled scroll p95 | 23.4ms | 23.7ms |
| Each cold Writing p95 | 80.5 / 119.3 / 122.0ms | **73.8 / 88.4 / 154.1ms** |
| Pooled flight p95 | 65.8ms | 59.4ms |

Two of three new idle windows exceed 33ms, and two of three cold Writing windows
exceed 80ms. All nine new warm transition windows satisfy the transition gate.
The pooled flight improvement cannot hide those failures. The repeated old
control also has wider cold spikes than the earlier selected experiment; do not
compare maxima from different sessions as a deterministic causal effect.
The consistent idle increase motivates a per-symbol visible-complexity diagnosis,
while the existing cold mount/layout coupling remains independently unresolved.

The new standalone grows by 14,497 raw bytes (~2.2%) over the optimized old
file. Positive paints/readiness/preparation are retained; no cadence/geometry
budget is loosened to label this edition accepted.

## Reproduction and retained evidence

The `evidence` directory contains basic/geometry/performance summaries, raw-pair
archive and endpoint diagnostics. The downloadable handoff also contains both
compared HTML files, full raw selected/primitive pair reports, capture views and
source hashes. Run diagnostics separately from clean performance controls:

```sh
node tools/quality/local.cjs
node --test tests/space.test.cjs tests/renderer.test.cjs
node review/site-followup-20261005/export-primitives.cjs OUT
node review/site-followup-20261005/check-reverse.cjs HTML REPORT.json
node review/site-engine-optimization-20261005/paired-performance.cjs BEFORE AFTER OUT 3
```

Browser diagnostics use the installed Chromium/Playwright paths documented in
the earlier optimization record. The diagnostic suites are not added to every
local edit; full release automation remains hosted.
