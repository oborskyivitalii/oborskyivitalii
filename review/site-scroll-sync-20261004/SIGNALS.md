# Continuous ribbon material and intermittent signals — 5 October 2026

Historical exact-file evidence. The subsequent five-part refinement is recorded
in [VIVID.md](VIVID.md): narrower opaque ribbons, bright distinct palettes with
yellow and more frequent signals covering their full width.

Owners: #14 optional visual comparison, #12 scroll/lifecycle, #13 regressions.
This completes the maintainer's interrupted 4 October request: remove rectangular
gradient joins and send irregular isolated lights along the ribbons, mostly
forward and occasionally backward, with gaps rather than continuous flicker.
The half-width ribbons and Soft/Glass preference remain. This is the same offline
comparison; production adoption, deployment and merge remain separate decisions.

## Material, motion and bounded cost

All adjoining facets sample one continuous material per ribbon. Its longitudinal
coordinates are anchored to world depth, including interpolated near-plane
intersections. Satin highlights, depth opacity and light packets share those
coordinates. A facet no longer starts its own gradient or flat lighting value.
The triangle painter shares its actual antialias coverage without join outlines.

Seeded cell schedules choose separate start times, durations, lengths and energy.
Forward travel has probability 0.76; returning travel has probability 0.24.
An event lasts 3.8–6.6 seconds per cell per 24-second cycle, with smooth emergence
and disappearance and a long quiet remainder. There is no per-frame random noise,
accumulated drift, extra animation callback or timer. Existing Off/reduced,
hidden/print and route lifecycle retain ownership of the displayed phase.

Materials use three 48×384 atlases and cached small signal sprites. Camera-space
projection reuses the previous section edge and scalar vector operations;
opacity samples request only section centers. Fixed world-space mesh sampling
avoids camera-dependent swimming. Mobile uses a 6-unit step, 64-unit far fade
and bounded nearby evaluation window; desktop retains a 1.25-unit step and
105-unit far fade. This reduces mobile surface work without changing the native
scroll path or increasing the existing performance budgets.

The interrupted scratch source had missed the saved HTML's final contrast fix.
The dark Writing introduction now uses the existing ink color, preserving opaque
glyphs and the lighter Glass tint. The tracked exporter exactly reproduces the
final saved file; no prose, edition, SEO, analytics or production bytes changed.

## Exact output and reproducibility

`Vitalii-Oborskyi-Color-Prototype.html`: 593,463 bytes, SHA-256
`f028f7dfaaf5c7f257caa8d2e3e93e6dcb21daae2e2634b17823fe80e4b89c3d`.
Generate with `node review/site-scroll-sync-20261004/export.cjs OUTPUT_DIRECTORY`.
The unchanged Final baseline retains its previous exact bytes.

Pure ribbon tests run in the wildcard PR/release build and now explicitly in
`Site runtime regressions`. They check the frozen half-width reference, finite
orthogonal geometry, phase/velocity closure, shared UV edges/clipping and sparse
bidirectional schedules. The actual bitmap check is reproducible with
`node review/site-scroll-sync-20261004/check-ribbon-material.cjs OUTPUT_DIRECTORY`;
`SITE_BROWSER_EXECUTABLE` optionally selects an installed Chromium executable.

## Exact-file validation

Actual headless Chromium 153.0.8010.12; 1440×900 desktop and 390×844 mobile.

- 106 Node and 18 Python tests pass; the explicit ribbon step passes all seven
  tests. Focused ESLint, generation/fallback freshness, SEO preservation and
  maintained preview freshness pass.
- Actual Canvas bitmap: 21 seam samples have maximum channel jump 2/255 and
  seam ridge 1/255. Both scheduled directions move the actual light peak in the
  expected direction; 100 repeated cycles have zero changed pixels.
- Glass and Soft each pass 80 rendered contrast views and 7,178 text samples.
  Minimum normal-text contrast is 5.271 for Glass and 5.413 for Soft; large text
  is at least 3.897. Zero sampled failures; this is not exhaustive certification.
- Forty route/theme/viewport/material captures pass exact Off and reduced-motion
  pixel freeze, positive ribbon faces and zero script errors/HTTP requests.
- Ten final-file route/viewport cases pass the existing added/resized block,
  enlarged footer, same-height reorder, restoration, viewport and final-gesture
  fixtures. Writing's single-record filter, short content, exact camera endpoints,
  navigation/history/reload, script-error and zero-HTTP checks pass.
- Eighty route/viewport/material/scroll-position cases retain at most six actual
  Glass filters, zero Soft filters, one selector and no horizontal overflow.
  Preferences survive navigation/reload; actual reduced-transparency changes,
  blocked storage and missing blur/IntersectionObserver fallbacks pass.
- Implementer inspected both 20-view contact sheets, covering all 40 final-file
  views. The tracked-text secret scan covers 464 files with no newly untriaged
  candidates; existing dispositions and scanner policy remain unchanged.

## Sequential bounded performance trial

Each profile warmed for 1.6 seconds, then measured 3.5-second idle and native-scroll
windows. Mobile uses deviceScaleFactor 3 and synthetic CDP CPU ×4. The comparison
baseline is the previous half-width/Glass file, not a different release candidate.

| Final Glass profile | Idle callback p95 | Scroll callback p95 | Idle callback busy share |
| --- | ---: | ---: | ---: |
| Research desktop | 16.3ms | 20.4ms | 10.52% |
| Writing desktop | 11.9ms | 18.6ms | 11.26% |
| Research mobile CPU ×4 | 24.7ms | 32.7ms | 14.74% |
| Writing mobile CPU ×4 | 23.4ms | 29.8ms | 14.65% |

All eight final windows have positive paints, no device hold or script errors,
and satisfy the unchanged 33ms callback / 20% idle-busy limits. The previous
baseline's mobile Research scroll measured 34.9ms and is not counted as a pass.
CPU/runner variation prevents a general speed-improvement claim. SwiftShader lab
measurements do not establish physical phone/GPU/battery performance, display
FPS or the full 15-profile/300-second release gate.

These are implementer checks. Independent visual review, physical devices,
rights and hosted-origin acceptance remain open. The earlier automatic approval
review rejected GitHub push as prohibited publication; this resumption does not
work around that rejection. Source and workflow changes remain local, with a
reviewable patch. No new remote PR/CI, merge or hosting operation is claimed.
