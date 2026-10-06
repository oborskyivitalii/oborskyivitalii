# Directional content flight and end-scroll continuation — 5 October 2026

This is the historical pre-optimization flight record (export `637b826…`).
The maintainer's corrected departure directions, stronger reading backgrounds
and economical ribbon curves supersede its behavior in [REFINEMENT.md](REFINEMENT.md).
The current engine, repaired opaque RGB ribbons, Soft default, content-flight
control and fresh measurements are recorded in [OPTIMIZATION.md](OPTIMIZATION.md).
The earlier performance and file hashes below describe their named trial only.

Owners: #14 optional visual comparison, #12 navigation/lifecycle, #13 regressions.
The maintainer accepted the vivid ribbon treatment and asks to try flying content
instead of its previous mostly opacity-based transition, plus advancement when
scrolling again at the bottom. The [preceding ribbon record](VIVID.md) remains the
exact baseline. This trial changes only the offline comparison decorator; authored
production engine, public output, content editions, SEO and tracking stay intact.

## Delivered behavior

The actual content plane moves in perspective on the renderer's displayed camera
progress. Forward departure recedes; the next page grows toward the reader from
distance and fog. Backward departure expands toward the viewer; the previous page
enters from the near side and settles into its reading position. The header and
Canvas retain their identity. There are no duplicate text trees, full-page blur,
independent animation callbacks or animation timers.

The plane uses 1,200px perspective. Forward departure reaches −3,600px and forward
arrival starts at −4,200px; reverse departure reaches +1,050px and arrival starts
at +1,020px. Those finite near-side positions remain below the perspective plane.
The content changes invisibly at the halfway point and finishes with no opacity,
transform, inert state or transformed origin left behind. Retargeting inherits
the actual displayed depth and opacity.

An overflow-clip frame contains projected geometry without creating additional
native scroll range or an inner scroll container. Camera waypoints measure the
untransformed content in a protected temporary-layout read. A new mount event
adds the footer hint before restoring saved native positions; it fixes a measured
17px short restoration on Research. Unsupported overflow-clip uses immediate
navigation rather than unbounded projected overflow.

Further downward input at the real end advances through Home → Research → Writing
→ Talks → Credits. Credits does not wrap, and upward scrolling stays within the
current page. The footer shows the next destination and a small intent underline;
its link also supports clicking. Appearance's “Scroll to next page” checkbox
defaults On and remembers the local choice.

Continuation requires 160px of wheel input after a fresh gesture and at least
180ms at the edge; touch requires 84px in a gesture that began at the bottom.
PageDown/Space or four ArrowDown presses also work. New routes have a 700ms guard.
Ordinary scrolling, horizontal gestures,
modifiers, editable controls, settings and nested scrolling keep their native
behavior. Only accepted end-scroll wheel/key input and downward touch continuation
at the edge consume default scrolling. This prevents the measured final 5px of
an instant touch gesture from moving the destination's opening position.

Motion Off/reduced motion navigate immediately. The existing scene lifecycle owns
displayed pose/phase freeze, print, visibility, fallback and recovery. Explicit
navigation can show the destination's static scene; its ambient phase stays frozen.
Busy content and open Appearance block continuation. The helper installs once and
adds no new frame loop or motion-preference override.

## Reproduction

`node review/site-scroll-sync-20261004/export.cjs OUTPUT_DIRECTORY` reproduces the
unchanged Final baseline and the Color Prototype with both ribbons and content
flight. The optional source is `FLIGHT-PROTOTYPE.cjs`.

`SITE_BROWSER_EXECUTABLE=CHROMIUM_PATH node review/site-scroll-sync-20261004/check-content-flight.cjs HTML OUTPUT_DIRECTORY`
checks actual DOM projection, history, paused phase captures and trusted mouse,
keyboard and CDP touch input against an explicitly supplied offline file.
Append `inputs` to repeat only the deliberate-input and native-scroll cases.

## Exact-file validation

The pre-optimization Color Prototype has 603,667 bytes and SHA-256
`637b8260326c321aedc81bca2e105b5cdb929d1760bc607de33519fd7196aebb`.
The corresponding pre-optimization Final remains byte-identical at 574,843 bytes and SHA-256
`2d9d3312739e5414db892991fab1749bb88394c782bb8e6993dc37f568c52578`.
Earlier exports and their measurements are baseline only, including the runs
before the mount-order and gesture-consumption fixes.

- 113 Node and 18 Python tests pass. Seven new focused tests cover directional
  depth, retargeting, real native bounds, inertial wheel tails, deliberate touch/key
  continuation and exact offline export/engine identity. All six executable inline
  scripts compile. The standalone runtime workflow explicitly includes the flight
  tests. Focused ESLint and production generation, fallback, SEO, preview and bundle
  freshness pass; no production gate or budget changes.
  Capability eligibility is explicitly boolean: an absent CSS support API cannot
  accidentally select the scene API's default animated mode. Supported, unsupported
  and absent capability cases are covered against the exported predicate.
- Actual Chromium 153.0.8010.12 passes 20 measured DOM-plane flights and 16 paused
  phase captures across Day/Night and 1440×900/390×844. Departure projection shrinks
  forward and expands backward, preserves exact native range, and arrives through
  fog. Header/Canvas identity, one main/heading, clean arrival state, focus, exact
  history positions and reload pass, with zero script errors or HTTP requests.
- Eleven actual input cases pass ordinary/nested wheel scrolling, deliberate
  one-step continuation, inertial tail protection, a touch gesture that reaches
  the bottom without advancing, open-settings guard, saved Off choice, keyboard
  navigation, trusted touch with Motion Off and a static destination, reduced-motion
  immediate navigation, and no wrapping from Credits. Touch and keyboard both
  land at the destination's actual opening offset of zero.
- A separate actual retarget probe preserves displayed depth/opacity exactly.
  Mid-flight Motion Off preserves the exact displayed camera/ambient phase and
  finishes accessible content with cleared opacity, transform and inert state.
  Print-media and controlled hidden-event interruptions also preserve exact
  pose/phase and finish accessible content; the print frame becomes overflow-visible.
- Forty settled captures retain positive ribbon faces and exact Off/reduced bitmap
  freeze in every route/theme/viewport/material combination. The implementer
  inspected both complete contact sheets, all 16 paused phases and mobile settings.
- Glass and Soft each pass 80 contrast views and 7,200 text samples with zero
  sampled failures. Glass minima are 5.378 normal and 3.732 large; Soft minima are
  5.873 normal and 3.897 large. The ribbon renderer/material source remains unchanged.
- Eighty route/viewport/material/scroll cases retain at most six Glass filters,
  zero Soft filters and no horizontal overflow. Saved preferences, actual
  reduced-transparency changes and three capability/storage fallback cases pass.
- Ten all-route/viewport cases pass added/resized block, enlarged footer,
  same-height reorder, restoration, viewport and final-scroll fixtures. Writing
  filtering/short content, exact native camera endpoints, history/reload and zero
  script errors/HTTP requests pass.

## Sequential bounded performance trial

Four final-file profiles warm for 1.6 seconds, then measure separate 3.5-second
idle/native-scroll windows. Mobile uses deviceScaleFactor 3 and synthetic CDP
CPU ×4. The preceding vivid file is measured in the same ordered trial. No other
browser suite runs during that trial.

| Final Glass profile | Idle callback p95 | Scroll callback p95 | Idle callback busy share |
| --- | ---: | ---: | ---: |
| Research desktop | 10.3ms | 19.1ms | 10.33% |
| Writing desktop | 11.0ms | 16.2ms | 16.40% |
| Research mobile CPU ×4 | 23.4ms | 31.6ms | 13.50% |
| Writing mobile CPU ×4 | 23.4ms | 31.0ms | 13.28% |

All eight final windows paint positively, retain normal quality and have zero
script errors. They satisfy the unchanged 33ms native-scroll/idle callback and
20% idle-busy limits in this bounded trial. Runner variation does not establish
a general speed improvement.

Sixteen additional whole-route flights paint positively with zero script errors.
Their per-flight painted-callback p95 spans 24.4–62.8ms desktop and
42.2–109.8ms mobile CPU ×4; the mobile renderer adapts to quality tier 2. Transit
stalls remain a recorded limitation. In a controlled four-route instrumented
comparison, the preceding vivid file also spans 51.0–93.3ms mobile p95. The
current content-plane setter has 0.6–0.9ms p95 and Canvas draw has 33.2–85.2ms p95.
These callback timings include JavaScript/Canvas commands and route mounting;
they do not measure display FPS, GPU composition or physical-phone performance.
No flight acceptance, native Safari result, full 15-profile/300-second gate or
independent visual acceptance is inferred from this short trial.

RI freshness and the tracked-text secret scan are finalized with the local patch;
existing scanner dispositions and policy are preserved.

The source changes remain local on `work/site-scroll-sync-20261004`, stacking on
frozen #17 `f99b8c2f5480b19dc1b4a105594efbbd94d7092a`. Every #13 budget and required
production check remains. Short headless trials do not establish the full release
gate, native Safari or physical-phone performance. The recorded publication/push
pause stays in force; no remote PR, server CI, merge or host operation is claimed.

Implementation references: [native overflow and clip](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow),
[scroll-height rounding](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight),
[Safari scroll bounds](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop),
[wheel units](https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode)
and [touch events](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent).
