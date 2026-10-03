# Depth, pulse and stable animation — 2026-10-03

Owners: [runtime #12](https://github.com/oborskyivitalii/oborskyivitalii/issues/12),
[visual #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1), existing
[Draft PR #10](https://github.com/oborskyivitalii/oborskyivitalii/pull/10).
The maintainer's new request authorizes distance haze, visible periodic pulse,
rechecking uneven motion and optimization on Home, Research, Writing, Talks and
Credits. Intake was appended to both owning issues before implementation.

## Measured baseline and defects

Baseline source: `4c3589fb23846677058705876a4e8e9a67ceaa46`, full CI run
[37123354767](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37123354767).
Its raw `motion.json` painted callbacks show roughly 20 Hz / 50 ms on desktop
and 15 Hz / 66.7 ms on mobile across all five routes, including unthrottled mobile
paints costing only 3.0–4.2 ms at p95. Cheap frame cost did not establish smooth
motion. The old 24/16 Hz gate reset its deadline to each paint and thus rounded
down again on every 60 Hz RAF. The old camera interpolant depended on callback
frequency and forced an endpoint at 80 ms. Clipping could change a face's depth
centroid discontinuously; mobile line opacity rounded into 16 bins; discrete
detail tiers could pop small objects out.

## Implemented behavior

- Fractional deadlines target 30 Hz for cheap ambient paints at both 60 and
  120 Hz RAF. Late callbacks draw once, without a catch-up burst. Sustained
  measured cost chooses 30/20/15/12/10/7.5 Hz with cooldown and recovery headroom.
  Mobile idle estimation targets 17% callback share, desktop 38%; camera travel
  can temporarily use a higher cadence estimated against 40%/55% respectively.
  These estimates do not replace measured release budgets or guarantee FPS.
- Camera following uses elapsed-time exponential convergence (32 ms constant),
  no forced 80 ms jump, and an exact final endpoint below a 1e-5 pose error.
- Haze decreases contrast into the existing page background using smoothstep
  over camera depths 12–100, bounded between visibility 1 and .06. Surfaces,
  seams and lines share the factor; no per-face filter or blur is used.
- Each assembly's spacing breathes by ±6.5%; immutable local geometry pulses
  uniformly by ±4%, alongside the existing rotation/displacement. The 24-second
  cycle closes in position and velocity; the scale pulse repeats twice per cycle.
- Culling follows the animated center and conservative pulse-scaled radius.
  A composed object/camera matrix transforms each shared vertex once, avoiding
  an intermediate world-vector allocation. Original face centroid depth remains
  continuous across near-plane clipping. Detail thresholds fade over time;
  compatible adjacent mobile lines retain continuous alpha within 1/256.
- Off, reduced motion, hidden, print and device hold retain the displayed
  camera, ambient phase and detail state. Existing finite topology, semantic
  motifs, preference storage, failure fallback and native scrolling remain.

## Verification and delivery status

Focused regressions cover capable cadence at 60/120 Hz, stall bounds, camera
time invariance/reversal, clipping continuity, monotone fog and shared surface
alpha, every object envelope/inverse, matrix agreement, cost hysteresis and
exact displayed detail freeze. Maintained motion reports now record actual
painted callback-start interval distributions and paint rates; the validator
recomputes them from raw samples. Existing p95, idle-share, Lighthouse, matrix
and soak budgets are unchanged.

Local pure tests, generators/scanners, independent source review and fresh CI
browser/performance/capture checks are in progress at this implementation
checkpoint. Local browsers cannot launch because the execution sandbox denies
Unix sockets; this is not a browser or renderer test failure. Actual CI run IDs,
source/artifact identity, independent outcome, captures and remaining limitations
are recorded in #12/#1 and PR #10 after verification. v9 export filenames remain
the maintained handoff interface; historical 4c3589f handoff/evidence are preserved
separately. No merge, deployment or physical-device acceptance is implied.
