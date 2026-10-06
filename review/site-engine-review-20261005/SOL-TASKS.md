# Sol tasks from the engine review

5 October 2026 · status: proposed, not implemented.
Read [the evidence review](REPORT.md) first. Start from inspected source
`6a759a0fd71706848b5b0f41e4e60e5b03c941c1`, re-read live local changes and preserve
unrelated work. The cumulative source patch from the prior handoff remains the
runtime baseline. This review adds documentation/evidence only.

Owners: #12 engine performance/stability; #13 checks; #14 visual/interaction;
#15 source/engine boundaries; #8 hosted activation. Reuse these owners rather than
opening competing work. Posting/push/merge and all publication remain paused.

## Invariants for every implementation

- Static complete HTML, native links/history and one persistent header/Canvas.
- One scene RAF/clock; 24-second absolute motion; exact Off/reduced/hidden/print
  behavior; bounded failure fallback. No background preparation while hidden or
  while a stop/print policy forbids work.
- Home, Research, Writing, Talks are the scroll/flight itinerary. Credits stays
  a footer utility route. Native reverse landing, touch-tail and history semantics
  survive. Do not restore Glass or remove the new motif types to make checks pass.
- Keep the current maximum of three rooms / six models; measure retained bytes
  if changing cache contents. No eager all-route/full-detail initialization.
- Preserve the existing 33 ms mobile ×4 idle/scroll p95 and 20% idle busy budget,
  public byte limits and missing-evidence failures.
- Default local profile remains the small 10-test profile. Use relevant targeted
  reproducers during diagnosis. Full matrix/soak belongs to staging and production
  after deployment; do not revive duplicate full local/PR runs.
- Do not regenerate upload bytes after validation. Keep basic, full hosted and
  independent/device evidence distinguishable and tied to their actual variant.

## Order

1. S1 and S2 repair activation blockers.
2. S5 defines/reports phase criteria before performance changes.
3. S3 removes model/color preparation peaks; S4 coalesces layout.
4. S6 establishes the extension/variant contract before Color adoption.

No dependency requires a live deployment to reproduce the first two defects.
Each task should be a bounded commit with exact input/output hashes and evidence.

## S1 — P1 — Separate immutable gate artifact names

Owner #13. Evidence: F1 and `evidence/artifact-namespace.json`.

**Problem.** The basic caller and nested full staging workflow upload
`site-gate-${{ github.run_id }}` in the same run. The second immutable upload fails.

**Change.** Give basic and full profiles disjoint names, include a stable stage /
attempt discriminator where necessary, and continue passing returned artifact IDs.
Review the nested staging and production example call paths and report download
patterns. Do not solve this by overwriting/deleting the already-bound basic gate.

**Acceptance.**

- A composition fixture resolves names/IDs through basic→staging→full and proves
  uniqueness and correct consumption. Include repeated attempts and future
  staging/production calls in one run.
- A controlled duplicate-name fixture fails the contract check.
- Full staging failure still blocks promotion; public digest, source SHA/tree and
  original artifact/run-ID checks remain intact.
- Add a cheap static workflow contract check to the existing basic command if it
  materially prevents this regression; no additional local browser matrix.

Files: `.github/workflows/site-checks.yml`, `site-release-checks.yml`,
`site-staging.yml`, `tools/quality/deploy-pages.example.yml`; existing quality tests.

## S2 — P1 — Admit canonical clean URLs in hosted fallback checks

Owner #13 with #8's host contract. Evidence: F2 and
`evidence/redirect-reproduction.json` (two control passes, two clean-URL failures).

**Change.** Replace literal `.html` waits with route-aware canonical URL validation
in both native fallback paths. Preserve the explicitly selected origin and project
prefix; allow only the known route's documented aliases. Then verify a fresh
destination document, correct route/content and exactly one failed snapshot read.

**Acceptance.**

- Revision and digest failures pass against both `.html` and extensionless local
  host fixtures. Include a GitHub Pages project prefix and query/hash retention.
- Wrong origin, wrong route, prefix escape and reload loops still fail.
- Exercise `navigation.cjs`'s fetch-fallback path too, not only `boundedFallback()`.
- Keep local fixtures labelled as fixtures; the next authorized staging full run
  must still exercise the real provider. No deployment is required for this fix.

Files: `tools/quality/engine-browser.cjs:60–71`,
`tools/quality/navigation.cjs:113–120`, existing staging/quality fixture helpers.

## S3 — P1 — Remove cold scene preparation from critical transition work

Owner #12/#15. Evidence: F3, untraced controls and the CPU ×4 stage diagnostic.
Observed `roomFor()` up to 116.7 ms; repeated return routes rebuild worlds.

**Change sequence.**

1. Add a temporary per-navigation count/cost probe for world construction,
   detail variants and face-color preparation; retain it only as opt-in diagnosis.
2. Reuse recently needed worlds within the existing three-room/six-model cap.
   Account for source, target and actual intermediate visible rooms; avoid building
   an adjacent room before determining whether it can contribute visible geometry.
3. Avoid full-detail preparation immediately before compact flight. Defer expensive
   refinement to an appropriate existing schedule, with cancellation/visibility
   rules. Cache repeated immutable glyph/topology parsing and repeated palette
   work only where measured. Do not front-load all five worlds.

**Acceptance.**

- A→B→A reuses the warmed model when the bounded working set permits it; no
  duplicate construction of the same route/detail within one transition.
- Before/after source-bound repetitions report cold and warm route work separately,
  with p95/max painted callbacks, model/color cost, paint gaps and JS long tasks.
  Use at least three sequential paired repetitions for the optimization decision;
  retain every trial. Adopt a change only with repeatable transition improvement.
- The S5 phase limits are satisfied once adopted; existing steady-state budgets
  remain unchanged. No gain may come from suppressing positive paints or dropping
  the decorative vocabulary.
- Verify exact freeze/retarget/context-failure behavior, rapid latest-target-wins,
  both themes and bounded heap/DOM/listeners across route cycles on the candidate.
- Record retained model bytes and cold-start/transfer effects; do not trade an
  unexplained memory/initial-load regression for a warm-path win.

Files: `site/engine/lifecycle.cjs:66–81,113–131,284–303`,
`site/scenes/world.cjs:277–337`, `site/engine/projection.cjs` as justified by profiling.

## S4 — P2 — Coalesce layout invalidation and mount measurements

Owner #12/#15, with #14's landing contract. Evidence: F4; six to eight `measure()`
calls per transition, 57.4 ms aggregate on the sampled Writing arrival.

**Change.** Centralize dirty reasons from route mount, archive/filter, Mutation /
ResizeObserver, font loading and viewport changes. Flush once for each coherent
layout state using the existing scheduler. Keep a synchronous flush only where
the actual landing position must be known before restoring scroll. Separate
viewport, waypoints and archive-bound computations when dependencies permit.

**Acceptance.**

- A stable route mount has one necessary synchronous geometry flush and at most one
  coalesced post-layout flush, or a recorded concrete reason for an additional pass.
- On the same diagnostic sequence, measurement count and cost decrease; no new
  independent RAF, periodic timer or settled-Off measurement loop is introduced.
- All existing growth/height/footer/reorder/font/filter/viewport endpoint fixtures
  pass, plus reverse-at-bottom, saved history, Off and reduced immediate landings.
- Keep the proven computed-auto scroll restoration semantics. Test its removal
  only as an isolated experiment, never on timing alone.

Files: `site/engine/lifecycle.cjs:37–56,251–303`, `navigation.js:144–185`,
`archive.js` event emission and the optional flight measure wrapper.

## S5 — P2 — Close transition and geometry evidence gaps

Owner #13 with #12. Evidence: F5, `geometry.json`, `flight-budget-gap.json`.

**Change.**

- Keep idle, scrolling, cold transition and warm transition measurements separate.
  Capture world/color preparation outside RAF as well as painted callback work,
  input→ready latency, long tasks and gaps between painted callback starts.
- Propose explicit transition and cadence limits with their rationale. Distinguish
  intentional 1–1.7 s travel duration from time blocked on the main thread. Existing
  33 ms/20% steady-state budgets are unchanged; any new limit is a documented new
  acceptance condition, not a retrospective pass/fail claim for this review.
- Report vertices, faces, lines, projected shapes and model bytes by route/detail.
  Extend the existing cheap finite check to all object points/line endpoints.
  Bound actual complexity, not just the unchanged 56 shared instances.
- Keep raw failures/outliers and source/variant/probe identities. Filter long-task
  samples to their actual windows; do not present diagnostic trace timings as
  uninstrumented release evidence.

**Acceptance.**

- The synthetic internally consistent 900 ms flight fixture is rejected by an
  explicitly adopted transition ceiling. Missing measurements/variant identity,
  invalid probes and insufficient samples still fail closed.
- A controlled geometry/line nonfinite value and a documented complexity excess
  are caught without adding a heavy local suite.
- The full staged/production reports show the metrics for the exact hosted edition.
  Offline Color evidence is separately bound until S6's selected variant exists.
- Document the adaptive compact cadence (about 7.6 paints/s in this review) and
  evaluate visual continuity; do not label callback rate as physical display FPS.

Files: `tools/quality/local.cjs`, `motion.cjs`, `validate.cjs`, `budgets.json`
and explicit performance/hosted profiles. Keep the default 10-test scope.

## S6 — P2 — Give optional effects an explicit engine and evidence contract

Owner #15/#14, evidence owner #13. Evidence: F6. This is preparation for later
prototype adoption; it does not itself accept a production palette or enable hosting.

**Change.** Replace exact serialized-source replacements with narrow authored
extension points for shape collection/painting and travel presentation. Represent
the selected visual/navigation variant in producer input, fingerprints and test
manifests. Retain a separately selectable base version until adoption is decided.
Make final depth ordering the responsibility of one composition stage; remove
redundant full sorts only after proving stable equal-depth ordering.

**Acceptance.**

- Reformatting lifecycle/router implementation does not break Color generation;
  invalid/incompatible extension contracts fail at the explicit boundary.
- The Color variant preserves actual ribbon pixels/joins/signals, direction,
  arrival timing, edge input/credits exclusions and all freeze/fallback semantics.
- Its engine/variant fingerprint changes when effect code or relevant config
  changes. All embedded route revisions remain coherent.
- The accepted deployable variant, if later selected, is exactly the variant that
  receives full behavioral/performance checks. A green base-only matrix cannot
  be reported as full Color acceptance.
- A renderer sorting/allocation change is accepted only with visual and measured
  evidence. A new framework, WebGL or worker architecture needs its own measured
  bottleneck justification; none is required by this task.

Files: optional `RIBBONS-PROTOTYPE.cjs`, `FLIGHT-PROTOTYPE.cjs`, `export.cjs`,
`site/engine/lifecycle.cjs`, `renderer.cjs`, `navigation.js`, producer fingerprints
and variant-aware quality tooling.

## Handoff evidence

The accompanying archive retains `performance.json` (four traced trials),
`performance-control.json` (two untraced ×4 controls), one stage/CPU/trace
diagnostic, seven lifecycle cases including 40 route cycles, geometry counts,
the redirect fixture and two static/synthetic gate reproductions. These are
bounded local results. Full hosted/native/device acceptance is still pending.
