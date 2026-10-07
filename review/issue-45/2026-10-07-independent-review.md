# Issue 45 independent scoped review — 2026-10-07

Reviewer: independent agent `/root/independent_review`, separate from the implementation author. Scope: canonical source diff against `76f2a786a016c8f40230e3d23b14f7ee36c16a57`, renderer/static geometry, reading backdrops, focused checks, new diagnostic/workflow and acceptance mapping. Generated renditions were not treated as editing sources. No code was changed or committed by this reviewer.

## Disposition

No blocking source/runtime/security regression found in the final reviewed implementation. The repair is coherent with the complaint: smaller world thickness materially reduces displaced contours; native sampling is requested inside saved Canvas state; every layer follows the same world-haze opacity; static generation uses the same updated model. Reading-title shadow spread and local mask outsets add paint without adding inline padding or changing native line breaking. The widened year wrapper is fitted but does not change the flex children's intrinsic geometry at ordinary widths; the browser comparison remains responsible for proving this across its viewport/zoom matrix.

This is source review, not visual acceptance. There were no actual browser captures available for this review. Do not mark the visual or browser/device gates passed from this disposition or from the source checks below.

## Findings resolved during review

1. The initial diagnostic served only candidate HTML/runtime and replaced CSS; its Writing before/after images both showed the candidate formula. The final helper separately serves exact baseline and candidate Color artifacts and captures their actual formula runtimes. Same-DOM CSS heading images now have a separate `heading-…` name. This resolves the false baseline-formula comparison.
2. The initial margin assertion skipped fonts below 27px, including the marked `.talk-title` at 25px. The final helper uses 25px and the owning G02 policy reflects that threshold, so those titles receive assertions.

Both fixes were re-read in the final helper/workflow bytes. Workflow checkouts and artifact production use the pinned baseline and raw candidate source, keep credentials disabled, use read-only contents permission, and retain the report/captures separately from PR smoke. Candidate and baseline Color producers are each resolved from their own checkout. The acceptance mapping delegates visual/device/merge decisions to explicit pending gates and reuses maintained suites through bounded selections.

## Remaining concerns and practical limits

- The new geometric test proves the stated representative entry and 0.08-journey poses, at time zero. It uses the nominal 14px stroke, although the canonical asset also contains 10px strokes. It does not prove connected silhouettes throughout the visible journey. A bounded source-only diagnostic found an on-screen point at all-topic progress 0.30, ambient time 12000ms, 1440×900, with alpha approximately 0.54: front/rear separation 23.64px versus a locally projected 14px stroke of 25.06px, about 0.94 stroke (about 1.32 for a 10px stroke). This is not a demonstrated visual regression, and is substantially improved by the reduced extrusion; it is a reason to inspect a later approach frame before claiming uniformly connected contours.
- The final formula captures currently cover the frozen entry pose. They establish a genuine baseline/candidate comparison but do not resolve the later-approach concern above, live pulse appearance, or failure/static appearance on native devices. Those remain with the stated visual/browser gates.
- Three source-over layers at the same alpha increase overlap density compared with the old rear-alpha multipliers. That can produce a more definite stroke, but matching palette values alone does not prove matching perceived weight. Actual Day/Night captures must decide whether it looks clear and coherent.
- `imageSmoothingQuality='high'` is a native browser request. Fixed bitmap bytes and 24 draw submissions prove resource/submission bounds, not equal rendering time. No frame-time parity or full performance result was measured by this reviewer.
- CSS outer box-shadow is excluded from the box interior, so I found no inherent background-plus-shadow double-opacity defect inside an individual title fragment. Overlap between adjacent cloned fragments and the perceived shape of the broader backdrop remain appropriate visual checks.

## Checks performed

| Exact command/check | Result | Scope |
| --- | --- | --- |
| `node --test tests/renderer.test.cjs` | 10 passed; 0 failed/skipped | Maintained renderer geometry/cache/state/failure checks |
| `node --test --test-name-pattern='Writing formula' tests/site-engine.test.cjs` | 1 passed; 0 failed/skipped | Formula live/static geometry and corrected fallback opacity |
| `node --check tools/quality/reading-clarity.cjs` | passed | Final helper syntax |
| `python3 tools/issue_acceptance.py validate --policy .github/acceptance/issue-45.json` | passed | Final policy shape, IDs and mapped selection; not an acceptance run |
| Bounded projection sampling, including local on-screen stroke scale | completed | Source-only observation supporting the remaining later-approach concern; not browser evidence |

No full suite, hosted profile, browser installation, screenshot inspection or human approval was represented as completed.

## Inspected source identity

Head at review: `76f2a786a016c8f40230e3d23b14f7ee36c16a57`; HEAD tree: `56609f964670cd2d83608a79e89075683bdb43dc`; `sourceDirty: true`. This review observes the current dirty candidate bytes, not a clean commit check. The sorted filename-to-SHA256 JSON object for the files below had aggregate SHA256 `0d47f7d7bac330d3eba3d8e05d3eeecbdfcc4de005c0a0a25cdfd3cd9a18ef28`.

| Inspected file | SHA256 |
| --- | --- |
| `AGENTS.md` | `a46a8c699e5c58247e2aa1e6be01d49ce7508e815e16a5f27f51453cda38378e` |
| `README.md` | `fe21ad71d3534a4dcf8c81aaef82e86d8c001d7567076c7827ab0ab82f1a2965` |
| `site/README.md` | `0a85e80dee869ef1a1c53d6972e8b28a19d3bcf5e15259ebfb8006475aa82074` |
| `site/engine/renderer.cjs` | `bb1ee44943311f405b7811b1387aea682a7472684edc556271f7326c44a5aad9` |
| `site/engine/styles.css` | `56deeced79fcbf4e2e9dd51d0e8af20d594244805144fc9a74887c8380e38a6b` |
| `site/scenes/world.cjs` | `ae246a77ccfa780ca2d60f4ea6a7e54d78d4d332b347973444aa8c550f2c895a` |
| `tools/build_scene_fallbacks.cjs` | `882b262b89a8bcd92f1d143e097f64f8b16bed2463ca37975fe4da2be8646885` |
| `tests/renderer.test.cjs` | `c0a6073a101ed92be9e3956c98fa5341dab15433ed0973024db309a8a1a26efd` |
| `tests/site-engine.test.cjs` | `f59168e6d2d6fb0cdfa48483b8be1af8706906c9e007d1c1469e0a8b5e3b4198` |
| `tools/quality/reading-clarity.cjs` | `8a5f32e7877565d85768c62423acaa9c65b23c99eabca0bbb2f59a6189b8e4c5` |
| `.github/workflows/site-writing-probe.yml` | `de61626634ae1f6a26afaf6f83833abcd9322aa7ebdeffb0ec1bee85f6961c56` |
| `.github/acceptance/issue-45.json` | `16f949bd6d128651a55da1412c990923af6bb841474d88f7dc02561d902ed547` |
| `tests/test_issue45_acceptance.py` | `b4133f8f3b003b045f97408547250fcae85c680c782291ec0bd37c18d2264399` |
| `guides/SITE-CHECK-PROFILES.md` | `1c4cf619101404a341b8076f4f25bcad0fa60b10a56acbab87d3862b41af41a6` |
| `review/site-scroll-sync-20261004/READING-SURFACES.cjs` | `432f58279e3b1c70f995d9f9014c2a552ff1e6852815e13fdc827039dde87e08` |
| `review/issue-45/2026-10-07-handoff.md` | `b4cc88c8e1ee9d6865ec72480712c46095f908b9b119d4003618158ad2551d44` |

Relevant unchanged projection/math, lifecycle, artifact/Color producer and source contract code was also read for context. Changed canonical behavior and final new helper/policy/workflow are the byte-pinned review target above.

## Authorized continuity amendment — prepared source review

AC05–06 were independently reviewed against published Draft PR46 head `660c5f12a2708aa8bbadaceb94bc8dc2237b1550`, tree `ded1ec355e415fd2b8c728926565623f51455f24`, with `sourceDirty: true`. These are prepared amendment bytes, not a clean commit check. No blocking source/runtime/security defect was found. Actual Chromium flight clips, formula images, heading geometry and maintainer visual acceptance have not run for these bytes.

The adaptive ribbon repair keeps a fixed 1.25/3 world grid and groups whole cells with integer strides. Shared stations retain their geometry and material; nearby cells keep their fine silhouette. The corrected near-plane test retains visible clipped ends whose centroid lies behind the old cutoff. Removing route-specific Canvas opacity prevents a Writing/Credits mount from changing the strength of the shared ribbon world.

Mounted-layout retargeting now continues from the current camera with the remaining deadline and monotonic painted progress. Its stable eased suffix has a denominator in `[1,3]`, avoiding the near-arrival inverse-easing problem and preserving the original time course for an unchanged destination. The first-flight guard survives synchronous retargets; only travel advancement waits for its first paint, while ambient phase continues. Cancellation restores the displayed camera, phase, detail and progress, including when the solver advanced during a skipped paint. A separate read-only subreview of the same authored lifecycle bytes checked immediate/late retargets, skipped-paint Off, hidden/print/reduced pauses and zero-delta resumes in memory; it found no blocker.

A bounded independent source geometry diagnostic sampled frozen overview/researchOverview/control/closing poses at phases 0/7317/12000 across forced tier boundaries `.499→.501` and `1.499→1.501`. Among 2,219 coarse facets, the largest sampled visible analytic edge error was approximately 0.653 CSS px and the largest fine/coarse silhouette change approximately 0.646 CSS px. This supports the small geometric effect of coarsening. It is not a raster comparison, a visual approval or a broad performance result. Cache, clock and bounded model/submission contracts remain the relevant preparation checks.

The final browser helper uses four fresh live Color contexts, separate from the frozen heading/formula context. It observes actual collected commands, analytic station identity at the observed camera/phase, seams, cloned journey segments, source-pose/elapsed-zero first paints, actual mounts/arrivals, quick retarget and in-flight height reflow. It bounds camera motion using both adjacent segments and retains bounded raw traces plus WebM clips. Its syntax and source design were reviewed; runtime execution is pending.

Two companion repairs were inspected: the root corrected the Writing CI mutation fixture to isolate its owning `paradigm` job rather than accidentally mutate the newly added job's first matching text; the source author moved the fixed-ribbon diagnostic's exact-once needle from the retired fractional-step expression to `meshStride`, and updated its drift/duplicate rejection fixtures. Neither repair weakens the target guard or exact-once failure behavior.

| Additional check actually run by this reviewer | Result |
| --- | --- |
| `node --test --test-name-pattern='fixed world cells\|projected adjacent\|bounded curved edges' tests/ribbons.test.cjs` | 3 passed; no failures/skips |
| `node --test --test-name-pattern='midflight destination layout\|Off freezes\|reduced overrides' tests/space.test.cjs` | 4 passed; no failures/skips |
| `node --test --test-name-pattern='source binding, opt-in\|unsupported renditions' tests/writing-paradigm-ci.test.cjs tests/browser-gate-variants.test.cjs` | 2 passed; no failures/skips |
| `node --check tools/quality/reading-clarity.cjs` | passed on final helper bytes |
| `python3 tools/issue_acceptance.py validate --policy .github/acceptance/issue-45.json` | passed for AC01–06; this was validation, not an acceptance run |

The maintained runtime fixture loaded regenerated `docs/space.js` with SHA256 `0da255129eaae88c2c42f08ae6b5772f932579393b37fd57fb5abde6c5551e1c`. This reviewer did not regenerate outputs or commit. The sorted filename-to-SHA256 JSON object for the authored review targets below has aggregate SHA256 `93201ede9329a970b4549072ee101cd9eb2f49b1341f93f2deaeafb8ba4c0e39`.

| Amendment review target | SHA256 |
| --- | --- |
| `site/engine/lifecycle.cjs` | `4baec9b5ac1ff441224eec5a0676034c4b52d54f11b583a00efed26ecbd3e8ab` |
| `site/engine/styles.css` | `b487c97f8197e9b95f2f8e8d37332989e7799d25097789fd5cd75e258e1e1ec4` |
| `review/site-scroll-sync-20261004/RIBBONS-PROTOTYPE.cjs` | `f38ec48e8b24ae60a64aed1524d416e3c942ccf5ecae328106846c3888b151fd` |
| `tests/ribbons.test.cjs` | `4b6086ba526f23fd0a120c653a63a8aae979228f8d73cfbf2bbd1b1f69534668` |
| `tests/space.test.cjs` | `80b9d137d762e847557e5e3d41bb40d6cd19ccc118b5b4650d3344341cadd25e` |
| `tools/quality/reading-clarity.cjs` | `f93d34c5106c3517c7a3e8d8d47b305b162c91a9f6166d65fe05aecb5179e479` |
| `.github/workflows/site-writing-probe.yml` | `93db36afb905a677384124fc390da9e4f4dbd34a26924b816fe0d3f0c22df7b1` |
| `.github/acceptance/issue-45.json` | `88b18196f9ab97f86f4e577def231ec190c97d7a40e48de87ad50f2955debdb4` |
| `tests/test_issue45_acceptance.py` | `61f06767777b8042ec8a546627bfd0ad5a7048f272f54c47581eec88a56e092a` |
| `tools/quality/writing-variants.cjs` | `32cde310fd82662e7915598008743dadf330e5591d8fd5999a11dbe8bfe1d654` |
| `tests/browser-gate-variants.test.cjs` | `42582238eed11aebd056044d5159e85c106109e9bd72b467bf23bd274a650f8a` |
| `tests/writing-paradigm-ci.test.cjs` | `b329442edcdc758f24af3869a19e9663afff79a744d3c57c5273e3586719f904` |

## Basic CI diagnostic repair — review after published continuity source

Root observed [required Basic failures in run 37645505620](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37645505620) on published `3b838bceccf823e63927c0c2504c44b68aafdfa6` in three legacy Writing diagnostic cases: their family-ablation needle still expected a world return without `formulas`, and their prewarm browser mock could not construct the formula cache. The independent follow-up inspected only `tools/quality/writing-variants.cjs` and `tests/writing-variants.test.cjs`; no blocking defect was found in this repair.

The exact-once needle and patched return now retain `formulas`. Existing family fixtures additionally compare the original anchors and actual projected formula commands, proving that omitting a selected motif family does not remove or move the landmark. Missing and duplicated formula-aware anchors still fail closed. The prewarm mock supports the already-existing offscreen Canvas path and observes one successful cache plus reuse; this is a fixture assertion, not a native browser or physical memory measurement.

This reviewer ran the three family/prewarm/failure cases and the private-package identity case separately: four passed, with no failures/skips. The resulting private diagnostic packages still verify their immutable snapshots, parent identity, deterministic output and unchanged control artifact. No runtime/public bytes were changed by these two repair files. The review observed HEAD `3b838bceccf823e63927c0c2504c44b68aafdfa6`, tree `c88e105558d7ddaae7558f5a76c4be460619f114`, with `sourceDirty: true` for the prepared repair.

| Follow-up review target | SHA256 |
| --- | --- |
| `tools/quality/writing-variants.cjs` | `fd76120619a1f10e3a09e5f2eeb3fdd6a66a978c68ff86103424081ad4e24815` |
| `tests/writing-variants.test.cjs` | `ce09ea3ce48bd936d8e9b10f15c04098b45ed81afdf0b32e497f9faf0b6e0015` |

The downloaded JSON from [opt-in run 37645777979](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37645777979) was independently inspected. It records `pass: true`, the exact `3b838bc`/`c88e105` candidate Color identity, all 60 heading cases, 28 retained captures and all four live navigation contexts passing. This supersedes the earlier prepared-source statement that browser execution was pending for that published head. This reviewer has not inspected the images/clips or supplied visual acceptance. Final-head CI/source reconciliation remains necessary after the diagnostic-only repair, and remains distinct from those earlier exact-head observations.

## Actual capture finding — adjacent title ink was overpainted

Subsequent independent inspection of the actual run-37645777979 PNGs confirms the root's blocking visual finding on `3b838bc`: the next cloned title fragment's spread shadow paints through the bottom of the preceding line's glyphs. It is visible in the paired Talks 1440 Day images, the Writing formula 1440 Day candidate image and the 390 Night title. The automated geometry pass remains a geometry observation; it does not establish unobstructed ink or AC02 visual success.

An independent raw-pixel check of Talks ROI `(140,196,828,310)` reproduced the root's measurement: 23,047 baseline pixels are fully opaque ink RGB `(23,43,54)` and 1,488 of those pixels change in the candidate. The exact paired PNG SHA256 values are `f9879337ca1866567d407d544a39f4d2a15fe6803044630c6ecfcd3536c6f40a` (before) and `430483c96f0386a2c2e0557f5507ed0f872587d33ab28794e34910a49b40fea4` (after). The published candidate therefore has a confirmed paint-order regression despite unchanged glyph rectangles.

The prepared correction wraps the exact three title copies in one inner `.reading-title-ink` span with `position:relative;z-index:1`. This places all title ink above the outer fragments' backgrounds/shadows without adding offsets, padding or font changes. No source-level layering defect was found in that design. The helper additionally compares actual baseline DOM geometry with the candidate DOM under baseline CSS before comparing the candidate CSS, so the new wrapper cannot conceal reflow. SEO reconciliation normalizes only the exact approved inner wrapper/copy before the whole approved content amendment; changed copy or unsupported wrapper identity remains rejected. This reviewer reran the maintained approved-contact/title reconciliation case: one passed, including its new positive/negative inner-wrapper assertions. Final helper syntax also passed.

The layer correction is **not visually accepted yet**. Fresh matching-head captures must show intact adjacent-line glyph bottoms at narrow/desktop widths, both themes and zoom cases; G02 explicitly records that requirement. In the earlier desktop formula pair the visible expression strokes are materially clearer, but a foreground ribbon partly occludes the full expression. At 390 Night the reading panels obscure much of it in both baseline and candidate. Those are limits of the inspected world views, not evidence of complete-expression legibility.

A separate read-only visual subreview inspected 56 extracted frames from all four `3b838bc` ribbon videos, bound to Color artifact `c190b5bca23010a2eed166e6cf26993effb3f4d89913c178e02b9ac6b0b094b9`. Sampled fresh Home→Research starts/arrivals, reverse mounts and quick retargets showed no obvious ribbon restart or color seam. Several reverse views temporarily contain large gray foreground faces occluding strands. Video/trace alignment was calibrated from visible mount changes with approximately 40–80ms uncertainty. This bounded frame review does not supply full motion/device acceptance and does not validate the newer title correction. No image asset or video was changed.

The prepared layer/helper/SEO review observes HEAD `3b838bceccf823e63927c0c2504c44b68aafdfa6` with `sourceDirty: true`. Its eight authored-target hashes below have sorted filename-to-hash JSON aggregate SHA256 `98c4b55e6b9a37ed1ad73c95ea4277cb6fc08a2a85856dd21da1eb190513c3fd`; these supersede the prior bytes only for the listed targets.

| Layer correction review target | SHA256 |
| --- | --- |
| `site/engine/styles.css` | `b29e8b7e650b7373c41385132c84c5ba853741680f7de798e23c99fdcb625f1b` |
| `site/content/pages/research/intro.html` | `31e8aa74bcd518c93ab06e515f09bd56930565db64dee01153011a0249dba41f` |
| `site/content/pages/talks/intro.html` | `7267afa88e0e41c4cefaec7617e18f4994b8a5fb81a7d38d52fa68b47a7443e4` |
| `site/content/pages/writing/section-1.html` | `a53b87887d3ae3605f5fcf649559f36ab82fd7be3c23641b3e6f97b8a8cb4f54` |
| `tools/quality/reading-clarity.cjs` | `86c5e6a95340f00d41d21b18d0e548c57b3b23e69c438ca304f08860d216c6cb` |
| `tools/check_site_seo.cjs` | `dddfda7590c21f8a2be789240bea5d28441372fb9bbf189350b8d8184ec5e40a` |
| `tests/executive.test.cjs` | `bc57bdc9068c4bc10747d55d79296aa6117ae2dc45fbf659b4942c4ea0cf823e` |
| `.github/acceptance/issue-45.json` | `2e6a122f4335fac29397670d4fea41f653010a7db8fcbe59db403a9f959e5ddf` |
