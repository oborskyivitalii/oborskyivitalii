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
