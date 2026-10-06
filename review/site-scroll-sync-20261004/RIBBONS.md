# Broad ribbons — maintainer refinement, 4 October 2026

Historical inspected wide-ribbon version. The maintainer's subsequent request
halves its width and changes the reading materials; [GLASS.md](GLASS.md) owns
the current comparison's exact bytes and validation. Measurements below apply
only to the wider version.

Owner: #14, with #12/#13 preserving lifecycle and regression contracts.
This follows the maintainer's rejection of the thin-line comparison: use wider
surfaces with axial twisting, living movement, breathing and textured gradients.
It updates the separately labelled autonomous comparison, not production adoption.
The original thread module/report measurements remain historical evidence.

## Implementation

`RIBBONS-PROTOTYPE.cjs` produces three actual world-space strips, not thicker
screen-space strokes. Transverse frames stay orthogonal to the local tangent;
spatial torsion and a slow axial rotation expose alternating broad faces and edges.
The nominal width is 2.2 world units, with bounded position/width breathing on the
same 24-second phase as the fractal. Position, orientation, width and velocity
close without cumulative integration. A satin-like rose/violet/blue transverse
gradient follows the twisted surface, with a subtle longitudinal shimmer.

Faces join the scene's existing depth ordering, clipping and distance haze.
Only a fixed, bounded world-sample window around the moving camera is evaluated.
Mobile uses fewer facets. There is no additional dependency, Canvas, animation
loop, timer, blur or glow. Existing Off/reduced/hidden/print behavior remains the
owner of the displayed freeze. The current comparison exporter uses this module;
the unchanged baseline keeps its previous exact bytes.

The broader bands exposed unprotected small headings/counts in Talks/Writing.
The comparison adds the existing feathered reading-surface treatment locally to
`.writing-topic` and `.year-heading`, keeping their text colors and broad ribbons.
This introduces no prose, tracking, SEO, analytics activation or hosting changes.

## Current local evidence

Autonomous `Vitalii-Oborskyi-Color-Prototype.html`: 580,956 bytes, SHA-256
`420e52e01e36afe16b4f81037450d5aa4046a1b4762143ebbd7095f526dc5b0e`.
Baseline `Vitalii-Oborskyi-Final.html` remains SHA-256
`2d9d3312739e5414db892991fab1749bb88394c782bb8e6993dc37f568c52578`.
Actual headless Chromium: `153.0.8010.12`, file URLs with network disabled.

- 102 Node tests and 18 Python tests pass. Three new maintained Node regressions
  require broad finite orthogonal geometry across the complete five-room range,
  position/velocity/twist/pulse closure and drift resistance, and exact labelled
  export with changed engine identity. Existing wildcard Node CI admits them.
- 20 route/theme/viewport cases pass: all five routes, Day/Night, desktop
  1440×900 and mobile 390×844. Rendered Off/reduced pixels freeze exactly;
  ribbons have positive visible faces, with no script errors or HTTP requests.
- Ten complete all-route content-growth browser cases pass across both widths:
  added/resized/reordered blocks, enlarged footer, changed viewport, restoration,
  exact top/bottom/final gestures, short content, Writing's single-record filter,
  animated navigation, history and reload. All ten reordered semantic waypoints
  match the measured native pixel offset exactly (world-distance zero).
- Sampled rendered contrast passes 80 views / 7,246 admitted text-background
  points: both widths/themes, opening and 42% scroll, Appearance closed/open.
  Minima: 5.224 normal text, 3.897 large text; zero sampled failures after the
  metadata reading-surface fix. This is not complete WCAG certification or
  exhaustive sampling of every phase and scroll position.
- Five current-source desktop Night recordings show actual moving pixels with
  fixed idle cameras. Implementer inspected all 20 route/theme/size captures,
  actual Research desktop views, mobile metadata repairs and motion frames.
- Bounded Research performance trial, idle and native scroll windows of four
  seconds each, with mobile CDP 4× CPU throttling. Prototype callback p95:
  desktop 27.4ms idle / 14.5ms scroll; mobile 30.0ms idle / 28.2ms scroll.
  Idle callback busy share: 18.65% / 18.78%. Positive paints in every window,
  no script errors and no device hold. These fit the existing 33ms/20% budgets
  in this trial. Wider surfaces cost more than the unchanged baseline; do not
  claim a speed improvement or a complete 15-profile/300-second release gate.

Reproduce the comparison from the maintained autonomous base:

```bash
node review/site-scroll-sync-20261004/export.cjs /absolute/output/directory
node --test tests/ribbons.test.cjs
```

All changes remain local; no GitHub push, new server CI, publication, deployment
or merge was performed for this refinement. Production adoption, fresh complete
performance/contrast gates, independent design review, native Safari and actual
device acceptance remain distinct from this testable offline prototype.
