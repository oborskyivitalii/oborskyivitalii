# Issue 69 — 2026-10-10 implementation and self-review

Owning [issue69](https://github.com/oborskyivitalii/oborskyivitalii/issues/69),
implementation decision dated 10 October; same [Draft PR71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
Role: Codex implementer and **self-reviewer**, not independent review.
Planning parent `30ec1addcb2cab765c7001fb4ee514b9aa0bdf95`;
main `93a818dbc3239b97b47b7d56edb83f5a7ebf65fc` remained unchanged on revalidation.
Local browser measurements retain dirty prepared-source metadata and identify
runtime/public bytes. Later report/catalog/MEMORY changes do not change those bytes.
Final clean commit/tree, CI and preview bindings live in issue/PR, avoiding recursive
self-identification. Read root/site/style/profile/acceptance/RI owners, complete
authored diff and original analysis/self-review. Actual checks and limits follow.

## Intent and decisions

The maintainer's «Роби» authorizes the reviewed upward reading-entry plan in this
same issue/PR. AC01–AC08 and independent/device/cost/delivery gates remain.
Implementation covers Home, Research, Writing, Talks and Credits, preserving main's
camera behavior, content, editions, links, template markup and original budgets.
Draft PR68 remained at `d8f63d63cb3280242d3e9d075404d8d4caa32842` and Draft PR53 at
`a103572be81c54425fc32253491eb74e520d5c9a` on reinspection, both unmerged. Neither
branch is imported; revalidate common router/lifecycle boundaries when main changes.

Existing component shells remain stable. Direct ink children and paper `::before`
share finite CSS motion; text-only leaves receive removable runtime ink spans.
Publication grids remain intact. Ordinary downward entry uses 88px/560ms desktop
or 56px/440ms narrow, monotone easing, at most two local delays (160ms/120ms) and
six active blocks. First-fold/restored/focused/jumped-to blocks settle immediately.
Measured native bottom headroom replaces tentative clipping: unsafe footer-adjacent
blocks stay settled, preserving paper/glyph/focus overflow and actual document range.

One closure-safe factory composes into the existing navigation asset; canonical
CSS composes into the shared stylesheet. No extra network asset, dependency,
perpetual RAF, per-frame JS transform, permanent layer promotion or preference
writer is added. Departure suspends entry; current-serial actual arrival resumes
after native landing and flight cleanup. Generation guards reject stale callbacks;
destroy releases observers/listeners/timers/owned states/spans. Archive/resize/font
reconciliation defers once after native landing. Motion Off/reduced/hold/failure,
unsupported APIs, exceptions, focus/find/anchors, hidden/print/pagehide and large
jumps keep native content visible.

## Findings and dispositions

| ID | Finding / evidence | AC | Disposition |
| --- | --- | --- | --- |
| I01 | Planning F05 described live cached-main reuse incorrectly: `prepare()` imports a fresh clone from pristine payloads. | AC01/04 | Explicit correction appended to analysis; no observed current-cache leak claimed. Session reset/disposal remains tested. |
| I02 | Measured shells must remain stable; child transforms can still grow overflow. | AC03 | Existing shells plus measured bottom-headroom guard. All 80 rendered cases preserve exact native/armed/three active/settled geometry and actual bottom; no clipping added. |
| I03 | Page-ready precedes arrival; router root focus could settle the whole new page. | AC04/05 | Explicit surviving-arrival resume, pre-departure suspend, root-versus-inner focus treatment. Serialized negatives and actual interrupted/history journeys pass. |
| I04 | Readiness differs from Motion Off/device hold; unsupported-router bootstrap still matters. | AC05 | Effective scene state API/event and fail-visible early entry boot. Mid-entry Off/context failure and missing APIs pass. |
| I05 | Writing has three bytes of raw-HTML headroom. | AC03/07 | No serialized markup change; 99,997/100,000 bytes remains. Shared Color/offline serialization and immutable invalidation pass. |
| I06 | Existing executive CSS test rejected any animation; reading-CSS equality assumed no further component. | AC07 | Adapted only for the canonical finite entry CSS, retaining non-entry atmosphere/blur/paint restrictions and prior negative fixtures. Selected source suite passes. |
| I07 | Sequential WebKit computed-style reads advance animation time: string equality falsely rejected synchronization (up to 0.329px). Zero translate can have one value. | AC03 | Probe verifies ink/paper actor count, exact native start/effect timing, shared animation, bounded vertical movement and native geometry. 0.01px rounding tolerance only for displacement bounds; geometry/performance budgets unchanged. Both 20-case WebKit variants pass; no product timing change. |
| I08 | CSS motion and fewer JS writes do not prove smoothness or whole cost admission. | AC06/08 | Original collector retains paired raw frames/tasks. Scoped samples pass; full cold/route/soak/device and independent gates remain open. |

Self-review found no unresolved implementation blocker within authorized scope.
Selected actual narrow WebKit Day/base and Night/Color Writing captures show sharp
opaque ink and a complete backdrop at an active frame. Wider Home captures show
bounded sibling movement. Still images do not establish physical playback smoothness.

## Execution and style review

| Task / rules | Owners and result | Verification | Status |
| --- | --- | --- | --- |
| T01 / CS01,CS04,CS06 | Entry factory, narrow scene state API, router cancellation/arrival hooks; existing scene clock remains sole RAF owner. | Ten serialized controller cases, navigation/archive/source suites, actual route journeys | Implemented |
| T02 / CS02,CS03,CS04 | Canonical CSS, existing semantic selectors/layers; reading/palette ownership and markup unchanged. | Native/active geometry, text/links/width/range and paper/ink timing; shared delivery test | Implemented |
| T03 / CS01,CS05,CS08,CS09 | Existing producer/scanner inventory/registry/policy extended. Focused formatting; no new workflow/matrix/debt allowance. | Pinned format/lint/AST architecture, bounded guard, selected source suite | Implemented |
| T04 / CS07,CS08 | Six-block cap, local delay, batched native reads, generation cancellation and finite timers; no archive-wide will-change. | Cap/cancel/reflow negatives, active scene-layout stability and original motion collector | Implemented; full cost pending |
| T05 / CS10 | Same issue/Draft PR; original ACs map to executable checks; generated public/offline/lock/catalog/RI refreshed. | Final clean source/RI/CI/preview recorded externally at exact head | Same PR; external gates pending |

CS01–CS10 were self-reviewed for these owners; the automatic guard covers only its
documented subset. Independent review remains open. Tests execute real factory
behavior/failure containment, unsupported-router bundle boot, semantic delivery,
missing-CSS coherent failure and immutable dependency invalidation. Presence tests
do not admit runtime behavior. Permanent controller tests use existing PR/staging/
production source profiles; issue acceptance remains the selected task snapshot.
The focused diagnostic reuses `scroll-browser.cjs` `entryScenario` on demand,
without adding routine hosted cases.

## Local browser and cost evidence

[Summary](2026-10-10-browser-summary.json) and
[inert raw archive](2026-10-10-local-evidence.tar.gz) retain original reports,
raw native rectangles/animation timings/callback frames/tasks, scratch drivers
and two selected actual PNGs. Archive SHA256
`94777a901a4df63310fdc4296bee5150f2f13e216ea7abf0d78b38f34c4aad30`, 402,151 bytes.
Scratch drivers contain environment-specific paths; reusable fixture lives in
the canonical helper above.

Base runtime `5c5911301433312acb157b0506d7b47286b0a20696f517566dd3d642ceb38b31`,
public digest `3408c4d90e51778be5b94169bbb974bc435c28873c6ed6c4e7b8d47514463c38`.
Color runtime `fb3dac5b0fcf811de02433da78122e6b4cd974ceb9924c315e7f88c9ba205e89`,
public digest `161c9a829575444f523bcdad5c13dfdfff623bfc5d9295e27c6b5cc06250e269`.
Digests use the current canonical artifact manifest including hashes/sizes.
All raw browser reports explicitly retain prepared-source metadata.

Pinned Playwright1.63.0 drove local Chromium138.0.7204.0 and Linux WPE WebKit26.6.
The Chromium download failed; the available local binary was used and is reported
honestly. Cached WebKit used locally extracted missing libraries. This is not
macOS Safari or a physical iPad. Ordinary hosted CI retains its pinned browser.

- 80 render cases: both variants × both browsers × five routes × 1440/390 widths ×
  Day/Night. Native/armed/three active/settled geometry, text/links, width/range,
  actual bottom, cap and scene-layout stability pass.
- 62 Chromium lifecycle checks across variants: departure/native midpoint/arrival,
  interruption, cache-cloned return, Back/Forward, anchors, filtering/reset/hidden
  rows, focus/find shortcut, mid-entry Off/failure, reduced, no Canvas/observer/
  router/JS. Separate empty/reset fixture passes. Print/visibility/pagehide/pageshow
  are notification fixtures; real bfcache, native find-menu and devices are unproved.
- Selected source profile 378/378, zero failures/skips. Basic13/13, Color10/10,
  byte/resource bounds, formatter, architecture, lint and style guard pass locally.
  Final report/catalog/RI changes receive final exact-head checks externally.

Paired Writing samples use the existing motion collector and unchanged bounds:
paint-callback p95 ≤33ms; idle callback busy ≤20%. All sampled checks pass.

| Width / CPU | Entry | Idle p95 ms / busy % | Scroll p95 ms / busy % |
| --- | --- | --- | --- |
| 1440 / 1× | Disabled | 8.1 / 19.16 | 8.9 / 15.67 |
| 1440 / 1× | Enabled | 9.7 / 19.81 | 9.2 / 15.85 |
| 390 / 1× | Disabled | 4.6 / 9.35 | 3.7 / 6.62 |
| 390 / 1× | Enabled | 4.0 / 9.25 | 3.5 / 6.13 |
| 390 / 4× | Disabled | 19.5 / 10.96 | 20.3 / 25.54 |
| 390 / 4× | Enabled | 22.6 / 11.74 | 18.7 / 23.35 |

Idle windows are ~1.8s, scroll ~2.2s. The 20% busy bound applies to idle; scroll
percentages are observations. Raw long tasks remain, including CPU-throttled
samples. These bounded lab samples do not replace full cold/route/300s soak or
physical-device cost admission. No budget/profile/scanner/waiver was weakened.

## Acceptance evidence

| AC | Executable / observed evidence | Result on identified local bytes | Remaining whole-criterion gate |
| --- | --- | --- | --- |
| AC01 | Original exact-main analysis + separate plan self-review; Basic/RI/coupling | Complete; checkbox remains checked; F05 correction explicit | No new planning blocker |
| AC02 | ENTRY, 80 render cases, tall/one-shot/jump/stagger tests | Scoped behavior passes | Maintainer/independent visual admission |
| AC03 | ENTRY-DELIVERY, ENTRY, exact active geometry and actual bottom | Geometry/semantics/byte proof passes | Whole glyph/focus/paint visual admission |
| AC04 | ENTRY, navigation/archive suites, 62 actual/fixture journeys | Scoped lifecycle passes | Real bfcache and full lifecycle review |
| AC05 | ENTRY, focus/anchors/Off/failure/reduced/unsupported/no-JS journeys | Scoped negatives pass | Native find-menu/device/readability review |
| AC06 | ENTRY cap/cancel, active layout, paired raw callback samples | Scoped measurements pass unchanged limits | Full matching cold/route/soak/device cost |
| AC07 | ENTRY-DELIVERY, STYLE-GUARD, BASIC, RI/CI, format/lint/source/generation and CS01–CS10 self-review | Implementation/local checks complete; final exact-head runs external | Independent implementation/style review |
| AC08 | Same PR71, Refs commit, real policy mapping and explicit gates | Reviewable delivery; final CI/preview external | Independent/device acceptance and later delivery decision |

Partial results do not check whole ACs. Machine reports keep external gates pending;
they do not close the issue or authorize merge/stable/production. Exact published
head/tree, workflows, downloaded acceptance binding and immutable preview are
appended to the owning issue and final PR description after publication.

## Issue synopsis

Upward reading entry is implemented in the same Draft PR71 from main. Native
shells/content remain stable, ink/paper share finite CSS movement, actual arrival
controls readiness, and fallbacks settle immediately. Local 378 source tests,
80 Chromium/WebKit render cases and 62 lifecycle checks pass. Self-review corrects
cache reasoning and retains measured geometry/cost proof. Independent, device,
real-bfcache and full-cost gates remain open.
