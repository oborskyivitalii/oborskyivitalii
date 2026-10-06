# Bright opaque ribbons and full-width signals — 5 October 2026

The later [directional content-flight trial](FLIGHT.md) is the current delivered
comparison. This record identifies the preceding exact HTML and its measurements;
the ribbon palettes, geometry and materials below remain in the later trial.

Owners: #14 optional visual comparison, #12 scroll/lifecycle, #13 regressions.
This implements the maintainer's five-part refinement of the offline prototype.
The previous comparison and its measurements remain in [SIGNALS.md](SIGNALS.md).
Production engine/public sources, content, SEO, tracking and hosting are unchanged.

## Delivered behavior

Ribbon width and its modulation are exactly half of the previous version:
nominal 0.55 world units, down from 1.1 (one quarter of the original wide version).
Position, spatial torsion, periodic axial rotation and proportional breathing
retain their existing bounded 24-second cycle.

Each ribbon has a distinct saturated longitudinal palette, anchored to world
depth rather than restarting at each face. Smooth interpolation carries the
gradient through the distant endpoint hues; the narrow satin highlight remains.

| Ribbon | Color sequence | Endpoint colors |
| --- | --- | --- |
| 1 | Electric blue → hot pink → yellow | `#1247ff` → `#ffe600` |
| 2 | Yellow → scarlet → electric violet | `#ffe600` → `#8500ff` |
| 3 | Red → fuchsia → blue | `#ff2535` → `#0063ff` |

All material texels are opaque. Depth haze mixes RGB toward the Day/Night paper
color instead of reducing alpha. The painter uses source-over in the existing
depth order, concealing geometry behind a ribbon while retaining nearer objects.
A complete face under its mapped triangles closes internal diagonal cracks;
subpixel overlap at longitudinal caps closes adjoining faces without widening
their side edges or drawing a facet grid.

Three staggered seeded events per cell per cycle replace one. Starts are
4.5–11.5 seconds apart, durations are 3.4–5.4 seconds, and travel still favors
forward motion with occasional returns. Higher-energy white light and its tail
cover the entire transverse sprite, including both ribbon edges. Emergence and
departure remain smooth. There is no per-frame random noise, extra animation
callback, timer or accumulated drift; displayed-phase Off/reduced/hidden/print
freeze remains owned by the existing engine.

Soft/Glass tint, feathering, blur, six-panel admission and preference/fallback
behavior remain. Day's secondary text changes from `#435962` to `#344a53` to keep
its contrast over the saturated material. Night's prior Writing fix remains.

## Reproduction and verified file

Generate with `node review/site-scroll-sync-20261004/export.cjs OUTPUT_DIRECTORY`.
`Vitalii-Oborskyi-Color-Prototype.html`: 594,222 bytes, SHA-256
`6adb79124d8e2d7143152bfba62db840e57d41835a5116bf60f7012802cce00e`.
The unchanged Final baseline retains SHA-256
`2d9d3312739e5414db892991fab1749bb88394c782bb8e6993dc37f568c52578`.

The seven maintained ribbon regressions run explicitly in runtime CI and in the
wildcard build suite. Actual bitmap validation is reproducible with
`node review/site-scroll-sync-20261004/check-ribbon-material.cjs OUTPUT_DIRECTORY`;
`SITE_BROWSER_EXECUTABLE` selects an installed Chromium executable if needed.

## Validation

Actual headless Chromium 153.0.8010.12, 1440×900 and 390×844; the final HTML is
tested through offline file URLs. Earlier failed contrast observations belong
to the intermediate `64015223…` export, preceding the secondary-text correction.

- 106 Node and 18 Python tests pass. Frozen widths, finite orthogonal geometry,
  continuous texture mapping, seeded frequency/directions and exact phase closure
  pass. Focused ESLint, generation/fallback freshness, SEO preservation and
  maintained preview freshness pass.
- Material alpha is 255 in every texel across all three ribbons and both themes.
  Across 630 interior/join samples, changing the background between saturated
  green and magenta changes zero ribbon pixels. The 21 seam samples have maximum
  channel jump 3/255 and ridge 1.5/255.
- Actual signal peaks move in both scheduled directions within 4 pixels of their
  expected heads. Seven transverse samples, from 2.5% to 97.5% width, show visible
  signal energy with the weakest at least 65% of the strongest. Repeating the
  complete cycle 100 times changes zero bitmap pixels.
- Glass and Soft each pass 80 contrast views and 7,178 text samples with zero
  sampled failures. Glass minima: 5.378 normal text, 3.719 large text; Soft:
  5.893 normal text, 3.897 large text.
- Forty captures cover every route/theme/viewport/material combination, positive
  ribbon faces, exact Off/reduced-motion bitmap freeze, and zero script errors
  or HTTP requests. The implementer inspected both complete contact sheets.
- Eighty route/viewport/material/scroll cases preserve at most six actual Glass
  filters, zero Soft filters, one selector and no horizontal overflow. Saved
  preferences, actual reduced-transparency changes and three capability/storage
  fallback cases pass.

- Ten route/viewport cases pass the maintained added/resized block, enlarged
  footer, same-height reorder, restoration, viewport and final-scroll fixtures.
  Writing filtering and short content, exact camera endpoints, navigation,
  history/reload and zero script errors/HTTP requests pass.
- The tracked-text secret scan covers 465 files with zero new untriaged
  candidates; existing dispositions and scanner policy remain unchanged.

## Sequential bounded performance trial

Four final-file profiles warm for 1.6 seconds, then measure separate 3.5-second
idle and native-scroll windows. Mobile uses deviceScaleFactor 3 and synthetic
CDP CPU ×4. No other browser suite runs during the performance trial.

| Final Glass profile | Idle callback p95 | Scroll callback p95 | Idle callback busy share |
| --- | ---: | ---: | ---: |
| Research desktop | 11.1ms | 19.2ms | 8.96% |
| Writing desktop | 16.3ms | 17.4ms | 14.17% |
| Research mobile CPU ×4 | 23.6ms | 29.4ms | 13.38% |
| Writing mobile CPU ×4 | 19.9ms | 26.3ms | 12.89% |

All eight windows paint positively, retain normal quality and have zero script
errors. They satisfy the unchanged 33ms callback and 20% idle-busy budgets.
The separate previous/current material comparison is preliminary evidence for
the earlier export; no general speed-improvement claim follows from runner
variation. These short headless measurements do not establish physical-phone
performance or the full 15-profile/300-second release gate.

Source changes remain local on `work/site-scroll-sync-20261004`; a complete patch
stacks on frozen #17 `f99b8c2f5480b19dc1b4a105594efbbd94d7092a`. The recorded
publication/push pause remains in force: no remote PR/CI, merge or host operation
is claimed. Independent visual, physical-device, rights and hosted-origin
acceptance remain separate.
