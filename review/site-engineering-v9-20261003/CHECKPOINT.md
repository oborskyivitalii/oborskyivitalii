# v9 engineering checkpoint — 2026-10-03

Owners: #12 runtime fixes; #13 recurring release checks. Draft PR #10.
Immutable GitHub base: efe217066807673d2a4328241e2e74b61b46cf7c.
No merge, deployment or completion of #13 is claimed.

## Implemented runtime increment

- 24-second periodic ambient cycle on every route: twice the v8 phase speed.
- CSS before deferred scene/archive scripts; validated atomic palette/fill cache;
  readiness gating, bounded Canvas failure/context-loss fallback and truthful controls.
- Rapid reversal clears obsolete camera targets while ambient phase continues.
- Compatible own-property helper, indexed shared vertices and conservative object
  frustum culling. All tiers retain macro positions and motif identities.
- Shared bounded paint cadence, measured-cost tiers, hysteresis/DPR caps, bitmap
  preservation, bounded still fallback and explicit user On retry.
- Route-specific small SVG fallbacks, 100KB raw HTML / 250-node size checks.
- Duplicate CSS consolidation, Appearance-space reservation (CLS remeasurement
  pending), Writing navigation semantics and local favicon.

## Evidence before the environment disconnected

Local 13 focused scene tests plus 3 deterministic observed-cost adaptation tests
passed. Independent reviewer /root/runtime_review reproduced the adaptation
defects; the corrected fixtures passed. Observed raw HTML was 33,979–83,806 bytes
and SVG elements 51–75. Small later source/markup corrections are described below;
CI must verify the actual checkpoint bytes.

The reviewer compared 125 desktop projection samples: candidate t/2 and v8 t
gave identical canonical shape records. This checks modeled geometry, not Canvas,
physical devices, painter presentation or perceived smoothness.

The executor then disconnected with 409 environment_offline (“Environment is not
connected”). No new browser/Lighthouse pass or final pipeline completion followed.
The connected GitHub API remained available. Runtime sources were recovered by
reapplying the inspected changes to that exact immutable GitHub baseline and
re-evaluating the pure model: 65 desktop journey/phase samples matched v8. This
recovered version must be tested by CI; pre-disconnect results are not exact-head
CI. Comments differ; fill-cache keys use equivalent string concatenation; Home
adds an inline max-width image fallback for unavailable CSS.

## Mandatory next increment

1. Read live PR/#12/#13 and this checkpoint. Preserve newer work.
2. Inspect actual runtime workflow result and full existing CI. The runtime-only
   workflow is a focused regression check, not the complete #13 release gate.
3. Finish maintained tools/quality and its locked tooling, strict report validation,
   PR/release platform matrix, three-run Lighthouse, sustained-motion/soak probes,
   fail-closed aggregate and same-artifact deployment template. Prove deliberate
   failures block it; leave device/host evidence pending when unavailable.
4. Complete existing export/freshness checks: migrate producers/tests to v9,
   capture all five routes in both themes/mobile, inspect output, generate preview
   and offline manifests, regenerate/verify RI LAST. Existing v8 exports/captures
   remain historical. The current-source export/RI checks may fail until this is
   completed; do not suppress them or declare old captures current.
5. Measure the Writing header fix and rendering improvement on all required
   profiles. Keep raw baseline immutable; do not raise budgets after failures.
6. Independently review final recovered bytes and pipeline; record exact refs and
   actual checks in #12/#13/PR10. Keep Draft and issues open.

Local files prepared before disconnect (may survive reconnection): tools/quality/
artifact.cjs, budgets.json, scanners.cjs, eslint.config.cjs, stylelint.config.cjs,
security-rules.yml, exceptions.json, toolchain/, browser.cjs, lighthouse.cjs,
functional.cjs; v9 preview-generator edits and temporary results under /tmp/site-v9-*.
These were incomplete/unverified and NOT synced by this checkpoint. Inspect rather
than assume they exist or passed. Functional.cjs was the final interrupted write.

Physical iPhone/iPad and modest Android, native OS/browser measurements, final
visual review, hosted-origin security and production activation remain pending.

## Recovered implementation update

The exact remote runtime checkpoint 461ac38eff9180a35bcecf2aeecff966505a954d
passed GitHub run 37112006925 (Site runtime regressions). Independent runtime
review is recorded in INDEPENDENT-RUNTIME.md. The existing export/navigation
workflow on that runtime-only head still failed the stale v8 producer contract;
that failure was retained and addressed by the v9 migration below.

The executor recovered. Maintained tools/quality and PR/reusable full release
workflows are now implemented, with locks, exact artifact/source identities,
coverage checks, reviewed exceptions, Linux three-engine cases, Windows/macOS
smokes, three-run Lighthouse medians, sustained motion/soak probes and strict
aggregate validation. Controlled full/PR fixtures prove missing/failed jobs,
profiles, samples, reports and device records fail closed. A deployment template
is inactive; hosting activation remains #8.

The current v9 candidate has 43 passing Node tests and 18 passing Python tests.
Generators/tests now target v9, with an all-page gallery, fixed and interactive
HTML copies and an offline exact-public-byte bundle. Home also constrains the
portrait SVG without CSS; all main landmarks are keyboard-focusable for skip
navigation. Old v8 capture results remain historical. Current real browser
captures, CLS/performance remeasurement and final visual acceptance are pending
CI. Local browsers cannot create their required sockets in this executor.

Full release acceptance requires the physical iOS/Android records and independent
source-bound review evidence supplied as a separately uploaded immutable artifact
and upload-run ID; the record is not embedded in the candidate's own commit tree.
Missing records intentionally fail the release
gate. Security/quality commands must run after final RI refresh; source/hash
metadata false positives require exact manual classification, never blanket
scanner ignores. See INDEPENDENT-PIPELINE.md for observed independent checks
and explicit limits. No issue closure, merge, release or host activation follows
from this checkpoint.

## First complete CI observation and measured correction

Source 301a2f6169a4d377448032310f58aea76c93a86d, tree
77b72e5025d4b50e65fe80780ee62ac8708d7869, public artifact digest
813d77efe71cb8167efd4ea266ad3614e2e3ee4d1477369a949244b2a55f271f.
Full run 37117031180 retained all failures; no budgets were changed.
Runtime 37117003609 and navigation 37117003604 passed; full build/static/captures
passed. Captures bind all 53 retained files; every PNG/contact sheet was inspected
for the five routes in Day/Night at 1440x900 and 390x844. Historical captures are
kept outside the candidate tree, so none are represented as new-source evidence.

Mobile Lighthouse medians: Home TBT 2343 ms, Research 2404 ms, Writing 517.5 ms,
Talks 1174 ms, Credits 165 ms; budget remains 200 ms. All desktop TBT medians were
0; LCP and median CLS passed. All 30 raw LHR/configurations were independently
read. Nearly all repeated long tasks were attributed to space.js; exact Canvas
versus JavaScript task cost is unproven without a retained execution trace.
Motion/CPU x4/soak did not run because Lighthouse failure stopped their shared
shell step. They now run as a separate sequential step after Lighthouse, including
when its budgets fail, and their own failure still blocks the gate.

The next candidate fixes Credits' missing main tabindex and mobile Appearance
overflow at 200% CSS zoom. The tests use a measured visible-publication scroll
span for Writing, timer-polled reverse endpoints, and macOS WebKit's native
Option-Tab link navigation (Apple Safari documentation). They retain actual
positive-motion, exact freeze, skip/Enter focus and endpoint assertions, and now
report a failure stack and observed scene/counter/scroll state. Frozen scenes
settle after allowed one-time layout paints before the no-work observation.

Renderer changes preserve desktop rest geometry, painter order, all macro IDs/
centres, eight motifs and three recursive scales. Mobile uses fewer tiny curve/
text segments and correctly oriented front-facing surfaces of closed solids;
paper remains two-sided. Shared vertices are projected once, frustum plane norms
and palette/material lookup are cached, and only consecutive compatible mobile
lines are batched with opacity steps of 1/16. Initial mobile projected shapes
fall from 3414–6252 to roughly 1987–2938; this is pure-model work counting, not
measured display smoothness. The 24-second periodic animation and bounded paint
cadence remain separate. Fresh real browser performance/captures are required.

## Second complete observation and final efficiency correction

Source 8dbbdfab6640a057f126f1371a9582fcdb70c9b8, full run 37119527805:
build, static scanners and captures passed. Runtime 37119517730 and navigation
37119517719 passed. Linux passed 359/390, Windows 24/40, macOS 0/20. Every one
of the 330 Linux fallback/capability cases passed. All macOS failures occurred
at Escape closing Appearance; mouse activation can leave keyboard focus outside
the details element. The document-level guarded Escape handler now closes the
open menu and returns focus to its summary; its regression fails on the old source.
Remaining mobile normal failures were horizontal overflow at 200% CSS zoom.
Long labels/headings can now wrap inside their available width. Failed states
retain overflowing element rectangles and the active element for diagnosis.
One cold Linux WebKit case saw no new paint during a 180 ms observation. Its
functional probe now timer-polls for a real next paint within 1500 ms and records
elapsed time and positive paint delta; phase and fixed-camera assertions remain.
This does not change the performance probes, budgets or Off/reduced checks.

Actual mobile Lighthouse three-run median TBT was Home 404 ms, Research 473 ms,
Writing 215 ms, Talks 302 ms, Credits 118 ms. All LCP medians were below 1390 ms;
CLS was zero except Writing 0.0565. Desktop TBT medians were 0–12 ms. The 200 ms
TBT budget remains unchanged, so four mobile routes still failed this candidate.
All 15 actual motion profiles passed. Mobile CPU x4 idle painted callback p95
was 15.6/18.9/14.8/17.2/16.2 ms (route order above); idle callback busy share was
17.59/18.98/15.79/17.57/16.39%. Every Off/reduced sample had zero paints and RAF
callbacks. Research's 300-second soak passed ten contiguous 30-second windows;
forced-GC heap increased 860,992 bytes, which is not a zero-leak guarantee.

The final correction caches immutable Newell planes and transforms the camera
back into each object's rest coordinates once, instead of calculating each
closed face's camera-space normal every frame. Indexed projection avoids temporary
face-coordinate arrays in the unclipped path. A 700-case old/new comparison
covering all routes, both viewport classes, journey positions, phases and quality
tiers found exactly identical projected shapes and coordinates (not a browser
performance measurement). Mobile rendering uses one bitmap pixel per CSS pixel
and omits faint internal facet strokes on rings, grilles, waves and links that
retain explicit outlines. Paper seam strokes, all facets and macro topology remain. Text/controls,
the 24-second cycle, native-scroll travel and paint cadence are unchanged. Fresh
browser measurements and source-bound visual inspection must verify the result.

The 8dbbdfa capture artifact's 53 files and 13 public source hashes were verified;
all-route desktop/mobile contact sheets and selected full-size mobile images were
inspected. The independent reviewer also inspected mobile openings. These remain
historical evidence for 8dbbdfa, not visual acceptance of the next candidate.

## Passing performance and measured final layout correction

Source 96f96c9a07529c93109b68043b3eccbb11e6ae74, full run 37121505094,
passed all 30 Lighthouse samples/median budgets and all direct motion/soak
requirements. Mobile median TBT: Home 77 ms, Research 84 ms, Writing 129.5 ms,
Talks 78 ms, Credits 67 ms. Mobile performance medians were 100/100/98/100/100;
LCP 1168–1398 ms, CLS 0 except Writing 0.0565. Desktop TBT was 0–13 ms.
CPU x4 mobile idle painted callback p95 was 10.1–15.2 ms, busy share
13.00–17.95%; Off/reduced retained zero paints/RAF. Five-minute Home soak
passed; forced-GC heap increased 903,236 bytes. These remain lab observations.
Windows passed 40/40 and macOS WebKit 20/20. Linux passed 388/390: only
Writing in both themes at 390 px and 200% CSS zoom retained horizontal overflow.
The source-equivalent public bytes at 6b5d55c also passed Lighthouse/native jobs.

Local browser execution was recovered with the pinned WebKit 26.6 / Chromium
153.0.8010.12 and required dependencies, using an approved wider sandbox for
their local sockets. Exact WebKit reproduction measured document scrollWidth
414 at innerWidth 390. The Topic label/form had scrollWidth 187 despite a
155 px layout box; the select's own box remained 155 px. Changing grid minimums,
select width, ellipsis or native appearance did not fix the measured overflow.
Layout containment on the mobile native select reduced document scrollWidth to
390 and label/form to 155 without hiding page overflow or replacing native
control appearance. All 20 local WebKit normal scenarios then passed, including
both previously failing Writing cases. Final source-bound CI remains required.

The capture producer no longer intercepts every path vertex into an unread
buffer. It retains actual canvas paint/RAF observation, changed pixels/phase and
fixed idle camera checks. A bounded 1500 ms timer probe requires a real next
paint; startup separately waits up to 3000 ms for actual renderer readiness.
Timeouts remain fatal and record counters, scene state, control, visibility and
elapsed time. Earlier fixed 230 ms observations failed once on a paint and once
on readiness without enough state to establish their cause. No production phase,
cadence, layout assertion or performance budget was relaxed by this harness fix.
