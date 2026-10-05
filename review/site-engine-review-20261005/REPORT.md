# Engine architecture, performance and stability review

5 October 2026. Author: Codex. Requested output: review and executable Sol tasks;
runtime remediation is not performed by this review. Owners: #12 runtime,
#13 evidence/pipeline, #14 interaction/design, #15 engine boundaries; #8 hosting.

## Verdict

Keep the static HTML + Canvas architecture. Its single scheduler, bounded scene
topology/cache, shared source factories, native navigation fallback and immutable
snapshot checks are sound foundations. The next work should target synchronous
route-transition work and the prepared hosted-check integration.

Two confirmed CI integration defects block activation of the prepared staging
flow. Current-source browser measurements also reproduce expensive transitions.
The bounded lifecycle checks found no DOM/listener growth or freeze regression.
This is a scoped engineering review, not a complete release or independent-device
acceptance. Full hosted suites remain unexecuted and all publication remains paused.

## Exact reviewed edition

- Source commit: `6a759a0fd71706848b5b0f41e4e60e5b03c941c1`.
- Color HTML: `Vitalii-Oborskyi-Color-Prototype.html`, 642,054 bytes,
  SHA-256 `13e71efc98dab41084939ffdea72116c7a4c617ba6e9206767c377f546a8ebc2`.
- Public artifact digest:
  `be3e440cbf16ab4d1d9a05770fef991581826e6a7f2b4312447e777e45590676`.
- Browser: Chromium 153.0.8010.12, headless, software-rendered environment.
- Geometry-count comparison only: previous source `a4e8685`. It is not a
  before/after performance comparison.
- Repository issue intent #12/#13/#15 was read. The newer maintainer decision
  keeps 10 basic local tests and full automation on staging/after production deploy.

Review scope: engine lifecycle/math/world/projection/renderer/router, archive
layout events, optional ribbons/content flight/edge continuation, producer and
snapshot boundaries, local/hosted quality tools and nested workflows. Attached
research manuscripts are unaffected. No external messages, push, merge or deploy.

## Architecture assessment

| Area | Assessment | Implication |
| --- | --- | --- |
| Static content and templates | `site/` is authoritative; `docs/` is generated; complete HTML survives unavailable JS/Canvas | Preserve progressive enhancement and producer closure |
| Engine separation | Math, world, projection, Canvas submission and lifecycle are separate factories | Refine these boundaries without introducing a framework or a new renderer |
| Clock and motion | One RAF scheduler; absolute periodic transforms; displayed phase/camera freeze | Keep this ownership during optimization |
| Router | Five finite documents; digest/engine checks; abort/serial protection; native fallback | Keep coherent snapshots and bounded navigation recovery |
| Resources | At most three scene rooms / six detail models; finite route DOM cache | Bounded memory is good, but settled eviction defeats useful warm reuse |
| Prototype | Ribbons and content flight patch serialized source strings in dated review modules | Maintainable only as a temporary comparison; needs explicit extension/variant contract |
| Evidence | Exact hashes and raw samples are retained | Full hosted checks currently exercise the base `docs/` edition, not the Color variant |

## Confirmed findings

### F1 — P1: nested workflows reuse one immutable artifact name

`.github/workflows/site-checks.yml:50–56` uploads the basic gate as
`site-gate-${{ github.run_id }}`. Its staging call invokes the full workflow in
the same run; `.github/workflows/site-release-checks.yml:467–473` uses the same
name for the full gate. Both omit overwrite. The pinned upload action rejects a
second upload with that name. This would fail the full-gate upload and prevent
promotion even if all tests pass. The false publication guards currently prevent
this path from running.

Confirmed by static call-chain/name resolution and the pinned action's documented
unique-name contract. No live GitHub run was triggered.

Primary reference: [pinned upload-artifact README](https://github.com/actions/upload-artifact/blob/b7c566a772e6b6bfb58ed0dc250532a479d7789f/README.md),
sections “Breaking Changes” and “(Not) Uploading to the same artifact”.

### F2 — P1: native fallback tests reject legitimate clean URLs

`tools/quality/engine-browser.cjs:60–71` and
`tools/quality/navigation.cjs:113–120` require the post-navigation URL to end in
`research.html`. The staging design already supports `.html` → extensionless
redirects. A controlled HTTP fixture reproduced both revision- and digest-fallback
failures: the actual new Research document was readable at `/research`, with zero
script errors, while `boundedFallback()` timed out waiting for `/research.html`.
The same two helper cases passed with redirects disabled.

This is a test/host contract defect, not a demonstrated broken user fallback.
Fix both helpers, retaining origin, project-path and route identity checks.

### F3 — P1: cold model/color preparation blocks transitions

`site/engine/lifecycle.cjs:66–81,113–131,284–303` builds and colors a room
synchronously in `navigate()` and again as a needed room/detail enters painting.
Settled `visibleRooms()` immediately evicts every other room. A→B→A can therefore
rebuild a recently used world even though the declared cache cap allows three.
Desktop navigation also requests a full model before marking a compact flight.

The CPU ×4 stage diagnostic measured `roomFor()` maxima of 84.2–116.7 ms on
later transitions, including `worldFor()` maxima of 44.5–74.3 ms. The final
Research transition built two worlds. These are inclusive instrumented wall
times: world generation, color preparation and waiting/GC must not be summed or
mistaken for independent CPU measurements. They establish a synchronous hotspot;
they do not establish which cache policy is optimal.

Untraced control measurements independently reproduced long painted callbacks
on every tested flight. See the measurement table below. Optimize bounded reuse,
the timing of preparation, and repeated immutable geometry/color work first.

### F4 — P2: route mounting repeats synchronous layout measurement

`site/engine/lifecycle.cjs:37–56,251–283,291,303`,
`site/engine/navigation.js:144–185`, archive layout events and the optional
flight measurement wrapper all participate in measuring one transition. The
wrapper temporarily removes/restores the content transform around geometry reads.
During one controlled route sequence, `measure()` ran six to eight times per
transition. Research→Writing spent 57.4 ms total in eight calls; its largest call
was 34.5 ms and inclusive mount time was 59.8 ms.

Use a shared layout invalidation/flush contract. Preserve the synchronous work
needed for exact reverse-at-bottom and Off landings. Removing the computed-auto
scroll restoration blindly would reintroduce the previously verified smooth-scroll
bug. This diagnostic's `restoreScroll()` calls were 6.2–9.1 ms; it did not
reproduce the historical 100–200 ms native ScrollLayer wait.

### F5 — P2: performance acceptance omits transition latency and complexity

`tools/quality/validate.cjs:49–72` enforces the 33 ms/20% budgets for mobile ×4
steady idle/scroll, but validates flight sample integrity without a latency
ceiling. An internally consistent synthetic 900 ms flight callback still passes
`motion()`. That is a controlled validator fixture, not a measured site callback.
The checker records paint gaps/cadence but does not bound them.

The default finite-geometry check examines faces. New shared primitives add many
line vertices. On compact Research, object count stays 252 and shared objects
stay 56, while vertices rise 7,934→9,815 (+23.7%) and lines 1,982→3,405 (+71.8%);
shared vertices alone rise 416→2,297. All current object points checked finite.
Constant object count therefore does not establish constant rendering cost.
These structural counts do not prove the new motifs caused the measured stalls.

Add phase-specific acceptance and cheap complexity/finite-point reporting without
expanding the default local browser suite. Keep heavy measurements on hosted full
profiles and explicit diagnosis runs. New transition/cadence limits require an
explicit documented proposal; do not silently apply or relax a different budget.

### F6 — P2: prototype extension and tested-edition boundaries remain fragile

`review/site-scroll-sync-20261004/RIBBONS-PROTOTYPE.cjs:156–167` and
`FLIGHT-PROTOTYPE.cjs:129–188` replace exact source strings/function ranges inside
the serialized engine/router. Marker assertions catch drift, but ordinary source
refactoring can break the exporter or alter extension ordering. The ribbon path
also sorts an already sorted visible-room list again; two-room flights can sort
each room, the combined rooms, then the final ribbons/rooms composition.

`export.cjs:18–20` applies these extensions only to the Color file.
Hosted `quality-artifact/public` remains the base `docs/` version, and full browser
offline fixtures use the ordinary v11 exports. Local syntax checks of Color do
not establish full behavioral/performance acceptance for its content plane,
edge-scroll controller and ribbon renderer.

This separation is intentional under the current prototype decision. Before
adoption, define one explicit variant/extension contract and bind required evidence
to the selected variant. Preserve the current visual treatment and publication
pause. A renderer/framework migration is not justified by the current evidence.

## Current measurements and stability

Two untraced control repetitions, 390×844, DPR3, CPU ×4, dark Research, content
flight On. Each has 2.5 s idle and scroll windows followed by the same four route
transitions. The probe wraps RAF/Canvas; no DevTools trace or sampling profiler
runs in these controls. The decorative Canvas uses DPR1 on compact viewports.

| Observation | Measured range or result |
| --- | --- |
| Idle painted-callback p95 | 15.2–18.8 ms |
| Scroll painted-callback p95 | 20.4–21.9 ms |
| Idle callback busy share | 9.9–11.0% |
| Flight painted-callback p95, eight windows | 52.9–136.6 ms |
| Largest observed gap between painted callback starts | 227.4 ms, Research→Writing |
| Idle paint rate | About 7.6 paints/s; cadence adaptation is active |
| Midflight Off, print, controlled hidden, retarget, saved content-flight Off | Seven lifecycle cases passed, including the route-cycle case |
| Warmed 40-route cycle, after GC | Documents 5→5; nodes 4,361→4,361; listeners 65→65 |

Steady-state control values are below the existing mobile budgets in these short
windows. Flight has no current latency ceiling. About 7.6 paints/s is a paint
cadence observation, not physical display FPS or a visual acceptance decision.
These numbers do not constitute the full five-route performance matrix.

Four additional traced trials (two desktop ×1, two compact ×4) are retained.
One first-run idle outlier in each profile reached 92.4/50.2 ms p95; the later
traced repetitions and untraced controls were lower. Do not discard these trials
or claim a proven cause. The single stage/sampling profile is diagnostic only;
its timings are inclusive and affected by instrumentation. No same-environment
old/new speed comparison, hardware GPU/power measurement, native Safari/Android,
hosted Lighthouse or 300-second soak was run in this review.

## Evidence and next action

`Sol-Engine-Optimization-20261005.zip` contains the review, [Sol tasks](SOL-TASKS.md),
raw JSON, diagnostic trace/CPU profile, exact candidate, and reproduction scripts.
The inspected source stays unchanged. Sol should first fix F1/F2, then instrument
F5's explicit phase criteria, optimize F3/F4, and complete F6 before prototype
adoption. No issue closure, release acceptance or publication is implied.
