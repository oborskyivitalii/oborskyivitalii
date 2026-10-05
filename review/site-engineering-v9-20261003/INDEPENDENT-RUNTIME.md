# Independent runtime review — v9 recovered sources

Reviewed 2026-10-03 by `/root/runtime_review`, a separate reviewer agent from the
implementer `/root`. Owners: runtime remediation #12, implementation Draft PR #10.
This report reviews the recovered runtime increment; it does not review or accept
the new #13 release tooling, a production deployment, or visual release acceptance.

Candidate source commit: `461ac38eff9180a35bcecf2aeecff966505a954d`. Baseline: `efe217066807673d2a4328241e2e74b61b46cf7c`.
The public files, scene tests, generator and governing materials below were checked
byte-for-byte against this candidate commit. Other preview/tooling work was dirty
in the shared checkout and is outside this report. The earlier disconnected-session
review was repeated against these recovered bytes rather than treated as current proof.

## Result and scope

No remaining blocker was identified in the reviewed runtime logic and deterministic
regression scope. All 16 focused scene tests passed, the five generated static
fallbacks were fresh, and the six new behavior/adaptation cases failed as expected
against the unchanged v8 renderer. Browser rendering, actual measured performance,
CLS and device/platform release evidence remain separate requirements.

The implementation uses a 24-second ambient period on all five routes. It changes
phase speed without doubling the repaint cap or scroll interpolation duration.
Absolute transforms remain periodic, finite and based on immutable geometry.

## Actual checks

Local environment: `Linux-6.18.44-x86_64-with-glibc2.39`, Node `v24.19.0`, Python `3.12.14`.

| Check | Observed result | Scope |
| --- | --- | --- |
| `node --test tests/space.test.cjs` | 16 passed, 0 failed | Pure model and synthetic DOM/Canvas lifecycle fixtures; 15.69 seconds in this run |
| `node tools/build_scene_fallbacks.cjs --check` | Five route-specific fallbacks fresh; exit 0 | Current generated HTML matches the deterministic producer |
| Six new tests applied to baseline `docs/space.js` in a separate temporary fixture | 0 passed, 6 failed; expected process exit 1 | Reproduces the original reversal/CSS bugs and distinguishes the new 24-second/adaptation behavior |
| Baseline/candidate desktop projection comparison | 125 pairs; 0 shape-record differences and 0 painter-order differences | Five routes, 25 journey/phase samples each, 1440×900, tier 0 |
| Public HTML/fallback size count | Every route below 100,000 raw bytes and 250 fallback SVG elements | Deterministic parsing/byte measurements, not a loading-speed score |
| Exact source binding | Every listed file equals its bytes at `461ac38e` | Does not claim the entire shared working tree was clean |

The baseline failure cases were: rapid reversal (obsolete camera target survives),
delayed CSS (palette parsing throws), 24-second period (baseline is 48,000 ms),
observed-cost downshift (not present), quality recovery (not present), and severe
hold/retry (not present). The adaptation failures show that this behavior is new;
they are not independent evidence that v8 already contained an adaptation defect.
The three adaptation regressions were originally proposed by this reviewer and
then integrated by the implementer; their rerun checks their actual committed form.

## Findings revisited

The prior independent review found that the initial candidate resized Canvas after
a successful paint, clearing the active bitmap; layout reset the quality-dependent
DPR cap; upward quality recovery retained the lower resolution; and a device hold
had misleading Off text and no explicit retry. The recovered source corrects them:
bitmap resizing occurs inside the protected draw, measure/recovery honor the chosen
tier, Off precedes the still label, and an explicit On action permits a bounded
retry at the safe tier. Synthetic clock and Canvas-dimension-clear fixtures enter
those branches and pass. Saved On is not erased by an automatic device hold.

Initialization validates the complete CSS palette before committing its fill cache,
gates scheduling until initialization, and reveals a static fallback on a drawing
fault or synthetic context-loss event. The obsolete scroll transition is cleared
when the latest target equals the current pose. Off/reduced motion, theme/layout,
visibility and print fixtures retain the displayed camera/phase without catch-up.
The missing native `Object.hasOwn` dependency is replaced with an own-property helper.

The lightweight fallback keeps route-specific geometry, bounded element counts and
CSS theme colors. CSS is before the deferred scene/archive scripts while the early
theme script remains before CSS. Writing's navigation label now has a navigation
role, and the local favicon exists. Duplicate CSS consolidation and Appearance-space
reservation were inspected in the source diff; measured CLS improvement is not claimed.
The complete Appearance markup contains a no-JS explanation on all five routes, so
an earlier suspicion of an empty no-JS menu was withdrawn after reading that markup.

## Projection equivalence method

Baseline `docs/space.js` SHA256: `42107634d48ffeb861a60440efc05c83cc677f3d3c91e76fb75af41eb03f497d`.
Candidate `docs/space.js` SHA256: `8c6c95a1a94a9d993388fb451a29b223953d1da33b7562dc27977f32beeb1f42`.
The baseline bytes were also verified against `efe217066807673d2a4328241e2e74b61b46cf7c`.

For each route and integer `i=0..24`, use the candidate route's authored journey
camera at `i/24`, baseline time `1900*i` ms and candidate time `950*i` ms.
Compare the complete ordered `projectedWorld` arrays, and independently compare
sorted serialized shape records. Both comparisons matched in every sample.
This covers modeled points, clipping, depth, material/alpha records and the sampled
painter ordering; it does not compare actual Canvas rasterization or prove all poses.

| Route | Samples | Shape/order differences | Maximum projected shapes in both versions |
| --- | ---: | ---: | ---: |
| index | 25 | 0/0 | 7774 |
| research | 25 | 0/0 | 9115 |
| writing | 25 | 0/0 | 6359 |
| talks | 25 | 0/0 | 7729 |
| credits | 25 | 0/0 | 5608 |

Mobile composition now uses seven motifs per spatial root, matching desktop,
instead of v8’s five motifs per spatial root. Viewport/detail tiers retain matching
macro positions and stable IDs, with compact facets and leaf/detail culling. The fixture verifies those identities; this review
has not visually accepted the changed compact rendition or its performance.

## Deterministic size measurements

Gzip figures use Python `gzip.compress(..., mtime=0)` for the HTML alone; they are
not complete route transfers and are not a hosted CDN measurement. SVG counts
include the outer fallback SVG element. Home also contains seven portrait SVG
nodes outside the scene, giving 64 total SVG elements versus 57 for the fallback.

| Route | v8 raw HTML bytes | v9 raw HTML bytes | v9 HTML gzip bytes | Fallback SVG elements, v8 → v9 |
| --- | ---: | ---: | ---: | ---: |
| index | 1784793 | 58573 | 17901 | 7775 → 57 |
| research | 2017090 | 53899 | 14357 | 9116 → 75 |
| writing | 1356244 | 83918 | 20882 | 6360 → 68 |
| talks | 1667631 | 53196 | 15087 | 7730 → 65 |
| credits | 1292304 | 34091 | 9620 | 5609 → 51 |

## Reviewed file fingerprints

These SHA256 values bind this report to the actual recovered materials. Reuse this
review only when the applicable runtime/layout/public assets match; a future head
with different relevant bytes requires a review of the change.

| File | Bytes | SHA256 |
| --- | ---: | --- |
| `docs/.nojekyll` | 1 | `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b` |
| `docs/archive.js` | 5241 | `5b11a8e0fd8f2ecbed57809ea956ee3470148aac604e64decc188ba8f755209c` |
| `docs/assets/favicon.svg` | 233 | `c28b28c5d6b61a89612c8aa1b3c787ff855e25e3e9dd69e9fbd0569e0da89a6e` |
| `docs/assets/vitalii-oborskyi-cutout.webp` | 55458 | `4fa21ced928b1e79db5e0f8105fecb2a1052a9e27c40e3eba97fd7cbb72181ae` |
| `docs/assets/vitalii-oborskyi.jpg` | 100768 | `5321e48f08b075cb1cbd522d0f36bc01276aece65d1a04cf09102aa5dd2b59bc` |
| `docs/credits.html` | 34091 | `8eea1be637105d748097082de95c5f3ff8f2613244d21bd9b32bc19ccb59a4ef` |
| `docs/index.html` | 58573 | `c7a35b1c9199805a1d5797553a8bba16cc220e25aef4e87e9b8c5ae5744e6be9` |
| `docs/research.html` | 53899 | `c12a6c9d9b2e7f77b518f4fd0c1bf32ef6550ca6b20c7b06cd9012906b74846e` |
| `docs/space.js` | 38842 | `8c6c95a1a94a9d993388fb451a29b223953d1da33b7562dc27977f32beeb1f42` |
| `docs/styles.css` | 19632 | `19601a62e3d2aa3e275618af69394a3e4aaddc12c428529540efb4cf6e69bebf` |
| `docs/talks.html` | 53196 | `0c86b391754e3dd5e0a9b620fdafeb777b17b5cc3fc3a03612c10c697cf6e5e4` |
| `docs/theme.js` | 2800 | `a1987c61608672a1643289efaf3238ab315ad47b54b704fa04884d20ec479cd8` |
| `docs/writing.html` | 83918 | `4b7ff0befc810e4c223a7b0ad4a92994c0d194e3d2631a34bd38d3756ac1ae0c` |
| `tests/space.test.cjs` | 16982 | `f079645fcf8ff4f1fa208657cab0b7d8267b28d367719bbc8eb2a89e1fbf5f97` |
| `tools/build_scene_fallbacks.cjs` | 2190 | `21f9c82879554e507ec4a27ddd15347ddd4a3b1beae85184bcf91d41af99f828` |
| `AGENTS.md` | 9930 | `3910bcc5e715e15273c0c568c29b4782d83fad884d3dc7dd445948901e47abbc` |
| `SITE-RELEASE-GATES.md` | 16098 | `affbb91d60db669ae162fa57ca2179048ad091f43da4a072094083dda0f326a3` |
| `review/site-audit-v8-20261003/SOL-TASKS.md` | 8408 | `cc42bc827f763b88fbdd025c65225c52d349d8a1ae7514695d670cf5d48ba8d4` |
| `review/site-engineering-v9-20261003/CHECKPOINT.md` | 4311 | `1523d3fc82c575d59a616b375040f93eb3b702c28ab9a7989d89caa51b2fc81d` |

## Limits and remaining acceptance

- No fresh browser run, screenshot/motion inspection, Lighthouse run or real-device
  test was performed by this reviewer in this repeat pass. Three-engine behavior,
  CSS timing and synthetic faults still need the maintained browser suite; WebKit
  emulation is not physical Safari certification.
- The synthetic paint-cost fixture validates controller transitions, not actual
  draw p95, battery use or the ≤20% idle callback busy budget. Actual weak-device
  measurements and soak results must satisfy their independent release gates.
- Header-space reservation targets the observed v8 Writing shift. Current mobile
  CLS and direct-filter/deep-link entry behavior must be measured on current bytes.
- Screenshot/contrast, no-JS/Canvas fallback appearance, compact composition and
  physical iPhone/iPad/Android acceptance remain outside this source review.
- New pipeline, source-bound release manifests, native OS matrix, hosted TLS/header
  checks, physical-device evidence, rights/URL decisions and production activation
  are not accepted by this report. A runtime green check does not complete #13.

The only repository file written by this reviewer during this repeat pass is this
report. Runtime sources, tests and the fallback generator were not edited.
