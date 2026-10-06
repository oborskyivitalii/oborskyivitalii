# Engine optimization execution

5 October 2026. The maintainer's “сОля, підходи і зроби” authorizes implementation
of [S1–S6](../site-engine-review-20261005/SOL-TASKS.md). The dated review remains
the baseline; it is not rewritten as implementation acceptance.

The six changes are implemented. **Performance acceptance remains open:** one of
the twelve final measured transition windows fails the new 80 ms p95 ceiling.
Full staging/production, native-device and independent acceptance remain pending.
No push, merge, external posting, provisioning or publication was performed.

## Edition and ownership

- Runtime baseline: `6a759a0fd71706848b5b0f41e4e60e5b03c941c1`.
- Review/implementation starting commit: `1138e6b07b24c78394a459ef16902b90a29699af`.
- Branch: `work/site-navigation-primitives-checks-20261005`.
- Baseline Color: 642,054 bytes; SHA-256
  `13e71efc98dab41084939ffdea72116c7a4c617ba6e9206767c377f546a8ebc2`.
- Current Color: 649,823 bytes; SHA-256
  `3e25d66b76bdbbfc6aac1940708d5e91987c9e8689acba7d8b268b6343e43adf`.
- Color contract 1 fingerprint:
  `cd1fffb468b3c9018f121da4bd86a5cbc9d7eb81efd5b1f2c896238b17becfdc`.
- Base contract 1 fingerprint:
  `48153b94fbae4f314eaa11b156df8a20227dec429abfee9e45c14fda4a1f1b2a`.
- Generated base public digest:
  `918093cad1c12e4a88bcf031272f5e1193825093723859d228fa7eca2a27a6b5`.

Owners remain #12 runtime, #13 checks/evidence, #14 interaction/design, #15 engine
boundaries and #8 actual hosting. The delivery manifest records final commit/tree
and patch hashes; this document does not make a self-referential commit claim.
S1 and S2 have separate commits. S3–S6 share the controller, producer identities
and generated outputs, so their integration is atomic to preserve a coherent
source/output/effects contract.

## Task results

| Task | Implemented change | Verified result / acceptance limit |
| --- | --- | --- |
| S1 | Disjoint immutable basic/full public/gate names; profile/run/attempt in reports and matching downloads; returned IDs retained | Static composition expands 58 unique names including staging/production/release and retries. A controlled collision is rejected. No overwrite or live workflow run. |
| S2 | Known route aliases preserve origin, project prefix, query and fragment; fresh-document and one-fault checks in revision/digest/fetch paths | All 12 controlled HTTP cases pass: `.html`/clean URLs × root/project × three faults. Wrong aliases are rejected by unit fixtures. Real provider/TLS remains untested. |
| S3 | Lazy models; three-room LRU retained after arrival; eviction before adding a fourth room; compact source/target preparation; delayed desktop refinement on the existing living RAF; finite shared symbol templates and palette fills; conservative behind-camera room exclusion | Warm A→B→A builds no extra models; no duplicate route/detail build within a transition. Three paired trials improve overall flight cost. One cold Writing p95 is 102 ms, so S3 performance acceptance is incomplete. |
| S4 | Dirty layout reasons coalesce on the existing scheduler; destination-only measurements; one synchronous mount flush; stable observer bindings; archive filtering and node preparation precede landing; computed-auto scroll restore retained | Exactly two layout passes in each of 12 final flights, versus the review's diagnostic six–eight. All five routes pass the growth/height/footer/reorder/filter/viewport/short-range fixtures. Reverse and history landings remain native. |
| S5 | Probe v2 separates cold/warm preparation, callback cost, readiness, long tasks and paint gaps; variant-bound reports; finite object/face/line validation and complexity bounds | Missing/invalid evidence and the internally consistent 900 ms synthetic flight are rejected. Actual failed windows remain failed. Full hosted evidence is still absent. |
| S6 | Authored effects API v1 for scene collection/painting, travel presentation and scoped measurements; base/Color selection and fingerprints; one final stable depth sort | Formatting/contract/identity fixtures pass; one scene RAF remains. Actual ribbon interiors have zero holes/white seams. Color remains an offline comparison and cannot inherit a base-only full pass. |

Home → Research → Writing → Talks remains the header itinerary. Credits is a
footer utility with instant navigation and no edge continuation. Glass remains
absent from current code, settings and profiles. The shared grammar remains 56
instances, including brain, three chart types and attention/softmax/entropy.
No motif or positive-paint requirement was removed for timing gains.

## New evidence conditions

The existing CPU ×4 mobile idle/scroll p95 **33 ms** and idle callback share
**20%** remain unchanged. New conditions are additional transition requirements,
not retrospective pass/fail labels for the old review.

| Transition metric | Ceiling | Reason |
| --- | --- | --- |
| Painted callback p95 | 80 ms | Allows the existing compact multi-room flight cost while rejecting sustained transition stalls; stricter than the observed unoptimized peaks |
| Any painted callback | 200 ms | Bounds an isolated main-thread block independently of percentile/sample count |
| Model/layout/route preparation sample | 160 ms | Covers work outside RAF; prevents hiding a large synchronous preparation task |
| Gap between painted callback starts | 300 ms | Detects missing/undersampled/jittery travel rather than admitting a cheap but stalled trace |
| Input to ready | 3,200 ms | Separates deliberate 1–1.7 s travel from unbounded preparation/arrival delay |
| Positive flight paints | At least 8 | Rejects empty/insufficient probes; raw frames, layouts and readiness must agree |

These are proposed engineering acceptance conditions now enforced by the gate;
they are not a claim about physical display FPS. The transition evidence probe
must be v2, have valid window-contained preparation and long tasks, and identify
the actual variant. Inclusive preparation and callback durations overlap and
must not be added together as separate CPU costs.

Geometry ceilings cover 260 objects, 15,000/11,500 vertices, 8,000/6,000 faces,
6,500/4,000 lines and 10/8 MB serialized models for full/compact detail. Count
limits are close to the measured vocabulary; byte limits also allow JSON number
representation variation. Serialized bytes are a complexity proxy, not heap.
Measured maxima are 252 objects, 14,139/10,523 vertices, 7,553/5,317 faces,
5,933/3,405 lines and 5.16/4.04 MB serialized models. Finite pose/phase samples
include base and Color projected-shape counts, with a sampled maximum of 9,299;
they do not claim a global maximum across every possible frame.

## Final source-bound measurements

Chromium 153.0.8010.12, headless; 390×844, DPR 3, synthetic CPU ×4, dark Research.
Three sequential pairs use orders before/after, after/before, before/after.
No tracing or sampling profiler runs during these controls. Each trial measures
idle, scroll and Research → Writing → Research → Home → Research.

| Metric | Before | After |
| --- | --- | --- |
| Each pair's pooled flight callback p95 | 78.1 / 86.7 / 61.4 ms | 48.1 / 49.2 / 54.6 ms |
| All flight paints pooled p95 | 78.1 ms | 54.4 ms (30% lower) |
| Median transition-window p95 | 79.7 ms | 62.0 ms |
| Highest transition-window p95 / callback | 109.3 ms | **102.0 ms — fails 80 ms p95** |
| Idle pooled p95 | 19.2 ms | 22.7 ms |
| Scroll pooled p95 | 22.5 ms | 21.8 ms |
| Largest flight paint-start gap | 137.7 ms | 138.2 ms |
| Observed transition long tasks | 136 | 115 |

All three candidate idle/scroll windows satisfy 33 ms; candidate idle callback
share is 10.5–12.6%, below 20%. Idle became slightly more expensive, and is
reported rather than hidden by the flight improvement.

Candidate cold Writing window p95s are 102.0, 75.9 and 75.2 ms. Its single model
construction plus initial coloring costs 41.6, 34.1 and 32.0 ms. All nine candidate
warm windows create no models; their p95s span 39.3–73.7 ms. Preparation maxima
are at most 48.5 ms and readiness is 1,281–1,396 ms. Eleven of twelve windows pass
every new transition condition; the first cold Writing window fails p95. The
baseline lacks the new construction probe, so destination/return grouping in
baseline comparisons is protocol-based, not a fabricated measured cache phase.

Adaptive idle rate in these short trials is 7.6 paints/s; scrolling uses 24–26
and flights 10–15 paints/s. These are callback starts, not display FPS.
The exact callback cadence, gaps and all raw samples are retained in the bundle.

Median local startup FCP is 224 ms in both editions; DOM-ready moves from 717 to
655 ms. This is an offline bounded comparison, not Lighthouse or network startup.
Standalone transfer grows by 7,769 raw / 2,821 gzip bytes (about 1.2% / 1.1%).
The unchanged public route size budgets pass, with maximum HTML 82,181 bytes.

One paired forced-GC resource sample retains 10.90 MB JS heap versus 5.47 MB in
the old settled-eviction policy. This is the explicit memory trade for warm reuse.
The selected three compact models serialize to about 11.68 MB; palette entries
are capped at 16,384. Across 40 stopped route cycles, selected heap grows 75,684
bytes and DOM/listeners stay at 4,384 nodes / 65 listeners. A separate seven-case
lifecycle run also retains identical 4,387 nodes / 65 listeners after its 40 cycles.
This is bounded lab evidence, not a universal leak or desktop/device-memory claim.

An additional weak projection-buffer experiment increased steady paint cost
(23.6–30.0 ms idle and 29.5–32.8 ms scroll p95) without eliminating cold peaks.
It is removed. Its raw reports and recorded source hash remain in the bundle;
the rejected buffer HTML was overwritten during rollback and is not bundled.
Every trial is retained; final results use only the SHA-bound selected file above.

## Targeted validation and fixture corrections

- Basic default: 10 focused tests plus cheap source/syntax/route/motif/geometry/
  workflow/size checks pass. This remains the default local/PR workload.
- Quality, renderer, ribbons, source-generation and lifecycle unit run: 65 of 66
  initially pass. The last Writing-arrival mock did not install the destination
  body before the new mount flush; corrected to mirror the real router and its
  targeted rerun passes. Runtime was not changed to admit an impossible DOM state.
- Source migration fixture now pins the original publication main content and
  thematic topology rather than the whole historical HTML, whose header/footer/
  engine metadata intentionally changed. Composed transforms use numerical
  tolerance while symbols/topology/content remain exact.
- Current two-width smoke passes primary/utility boundaries, footer/history,
  persistent shell, absent Glass and Motion Off.
- Seven actual lifecycle cases pass exact bitmap/camera/phase freezes, mid-flight
  Off, print, controlled hidden state, retarget, saved content-flight Off and 40
  route cycles. Hidden is controlled, not a native OS visibility claim.
- Five-route layout fixture passes every applicable growth, resized block,
  expanded footer, unchanged-height reorder, semantic waypoint, viewport,
  one-record filter and zero-range short-page assertion.
- Ribbon pixel fixture: 19,502 interior samples, zero transparent holes and zero
  white strips; all five routes captured in both themes. Two-width captures also
  retain readable mobile/desktop composition. Independent visual acceptance is
  separate.
- Reverse edge fixture: 15 cases per width, actual previous-route bottom, wheel/
  key/touch tails, nested inputs, history, Off/reduced and persistent shell pass.
  The previous global-listener comparison incorrectly compared Talks (65) with
  Writing (72, including archive handlers). It now checks the same original
  touch target: listeners are empty before and after release at both widths.
- One earlier edge run's reload checkbox assertion was transiently false→true.
  Saved/restore state is now explicitly captured; the complete rerun and 20
  real reloads in the bounded reproducer pass. The failed attempt is retained;
  no unsupported cause is assigned to that transient result.
- Twelve canonical-fallback HTTP fixtures pass. Collision, wrong URL, nonfinite
  geometry, complexity excess, missing variant and 900 ms flight fixtures fail
  closed. No extra default test or full local release suite is introduced.

ESLint was unavailable in this local runtime; no lint/security/advisory/full
hosted pass is claimed. Generated-source freshness, executable script syntax,
diff whitespace and repository-intelligence verification are checked separately.

## Reproduce and continue

Run `node tools/quality/local.cjs` for the basic profile. Export both explicit
selections with `node review/site-scroll-sync-20261004/export.cjs OUT both`.
Each exported file has a separate variant/digest manifest.

The bounded diagnostic entry points in this directory are `check-fallback.cjs`,
`check-geometry.cjs`, `paired-performance.cjs`, `check-cache.cjs`,
`check-layout.cjs` and `check-preference.cjs`. The bundle's README supplies their
arguments and the existing lifecycle/edge/pixel/smoke commands. Chromium requires
the installed quality toolchain or explicit `SITE_AUDIT_TOOLS`/`SITE_AUDIT_CHROME`.

**Remaining S3 acceptance task:** investigate the cold Writing mount/paint overlap
identified by pair 0 (48.5 ms layout, 102 ms painted callback), preserve the exact
native landing and scene vocabulary, then repeat three balanced same-source pairs
and require every transition window to pass 80/200/160/300/3200 limits. Do not
raise the ceiling, discard pair 0 or revive the rejected buffers to mark it green.

After separately authorized staging, run the full automated hosted profile on the
immutable selected deployable edition before promotion, then the same full
production checks after deployment. Missing exact hosted/native/device/independent
evidence continues to block release. Selecting Color for hosting is a separate
decision; the prepared base gate cannot accept it implicitly.
