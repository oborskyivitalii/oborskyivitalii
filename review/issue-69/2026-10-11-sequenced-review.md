# Issue 69 — 2026-10-11 independent sequenced-transition review

Owning issue: [#69](https://github.com/oborskyivitalii/oborskyivitalii/issues/69).
Owning execution: [Draft PR #71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
Reviewer: independently delegated AI review agent, separate from the router,
camera and block implementation agents. This is source/behavior review, not
physical-device observation or maintainer visual approval.

Inspected state: dirty prepared continuation of commit
`15dabb70135468550cac52153887d9a60d6eb0d3`, committed tree
`a57457239be3bd6f77337798e7a261a1669a3b6f`. The committed tree does not identify
the uncommitted implementation; inspected byte hashes below do. Later source
changes require renewed checks. No merge, stable promotion or production action
was performed by this reviewer.

Read README, root AGENTS, CONTRIBUTING, MEMORY, REPOSITORY-MAP, site source
contract, CODE-STYLE, acceptance policy and check profiles. Reviewed authored
navigation, scroll-entry, camera lifecycle/math/projection, flight descriptor,
reading surfaces and affected test/browser-check changes.

## Intent and acceptance

The 11 October amendment keeps the reading camera fixed on all five routes while
the scene continues its passive animation. Route navigation first moves visible
blocks above the viewport (forward) or below it (reverse), then centers the scene,
travels in depth and restores reading framing. Destination blocks subsequently
arrive from below (forward) or above (reverse). Downward reading entry must remain
available after this sequence. Whole-page fades/depth translations are removed.

The existing AC01–AC08 remain. AC09 covers stationary reading and staged camera
travel; AC10 covers directional block departure/assembly. Review findings below
do not redefine the maintainer's intent or replace external gates.

## Findings

| ID | Evidence/path | Finding and implication | Affected AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | `site/engine/styles.css` mobile `.hero-copy { display: contents; }`; scroll-entry inventory | The initial implementation selected the boxless parent, pruned its children, then skipped its missing native rect. Chromium 390×844 showed only the portrait departing; hero text vanished immediately. The revised inventory expands boxless groups into actual children and reselects them across responsive layout changes. Fresh Chromium forward/reverse Home journeys now include eyebrow, H1, lead, description, audience and actions. | AC02, AC03, AC10 | Resolved by source review, targeted test and actual browser participation check. |
| F02 | `site/engine/scroll-entry.cjs` phase measurement; `.portrait-facets` absolute outsets | Semantic-shell distance plus 32px left approximately 8.6px of the desktop portrait facets inside the viewport at final departure. The revised read batch includes direct child envelopes. Fresh desktop reverse-arrival distance is −842px, compared with the prior −801px, covering the observed facet envelope. | AC03, AC10 | Resolved by source review, two-direction extended-media test and current browser distance observation. |
| F03 | Scroll-entry route capability admission; base/Color delivery | The initial base controller admitted route motion without required `overflow: clip` support. The revised `routeAllowed()` independently requires clipping; native reading has its separate admission. A split-capability negative exercises translate/animation available with clipping unavailable. | AC03, AC05, AC10 | Resolved by source review and targeted negative test. |
| F04 | `site/engine/navigation.js` successful navigation finally cleanup; controller `cancel()`; flight preference | Navigation resumed the destination observer and then called cancel→settle in finally, marking every below-fold destination record done. Fresh Chromium journeys initially ended with `observing: false`; the same coupling made the Block transitions preference disable reading entry. Router/preference now use explicit route-only cleanup while native fallback retains settlement. Actual downward entry after Research arrival and on Home/Research with block preference Off remains armed and animates ink/paper without camera or range movement. | AC02, AC04, AC10 | Resolved by source review, route-only cleanup regression and renewed actual-browser reading observations. |
| F05 | Scroll-entry text-leaf ink wrapper; Home eyebrow flex layout | Mobile hero participation initially wrapped the flex eyebrow's children in a block span, changing its accent line from 28×2px to 0×14px. Canonical entry CSS now preserves the ink layer's flex relationship, alignment and inherited gap. Native before/after eyebrow and accent rectangles match exactly after reverse arrival at 390px and 1440px. | AC03, AC10 | Resolved by canonical CSS inspection and renewed exact browser geometry comparison. |
| F06 | `tests/test_issue69_acceptance.py` CAMERA-TRAVEL subprocess bound | The initial 60-second timeout was shorter than the observed 72.61-second equivalent passing lifecycle selection. It was increased to a finite 180-second bound; test cases and pass requirements remain. | AC08, AC09 | Source correction inspected; root owns final exact-source acceptance execution. |

## Decisions

The maintainer's amendment authorizes implementation in #69 / Draft PR71.
Independent AI review can supply source-review evidence but cannot provide user
visual approval, physical iPad acceptance, actual bfcache evidence, final hosted
cost admission, merge permission or production authorization. F01–F05 are
corrected and this bounded independent source/behavior review is complete.

## Sol tasks

| Task | Paths and expected change | Finding / AC | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Inventory actual mobile hero units; preserve one-shot state across responsive regrouping | F01 / AC02, AC03, AC10 | Boxless-group source test and Chromium Home forward/reverse participation | Completed |
| T02 | Measure complete direct-child visual envelope once per route phase | F02 / AC03, AC10 | Extended-media source test and observed portrait distance | Completed |
| T03 | Admit route block movement only with native clipping support | F03 / AC03, AC05, AC10 | Split-capability negative | Completed |
| T04 | Separate route cleanup from reading settlement; keep post-navigation entry armed | F04 / AC02, AC04, AC10 | Route cleanup regression and actual browser downward-entry observation after navigation | Completed |
| T05 | Preserve flex ink layout/decorative line geometry | F05 / AC03, AC10 | Exact native-before/arrived geometry comparison at 390px and 1440px | Completed |

## Acceptance evidence

The initial targeted selection of camera-view, navigation, scroll-entry and space
completed **83 tests, 83 pass, zero fail/skip/cancel/todo** in 72.61 seconds.
This preceded the inventory corrections and is historical evidence, not final
candidate acceptance.

After F01–F03 corrections, this reviewer executed
`node --test tests/scroll-entry.test.cjs tests/navigation.test.cjs tests/flight.test.cjs`:
**44 tests, 44 pass, zero fail/skip/cancel/todo**. The focused controller suite
contains 20 tests, including actual serialized factory behavior and the three
new regression surfaces. Mock router tests do not establish F04's final-cleanup
behavior; real browser observation exposed that gap despite this green result.

Fresh loopback Chromium observations used widths 390×844 and 1440×900, forward
Home→Research and reverse Research→Home. Both completed without JavaScript page
errors. The mobile H1 participates in departure and reverse arrival, with the
reverse distance negative. These were generated base bytes, not a hosted/CDN,
native device, WebKit or performance admission run.

Observed initial F01–F03 correction-stage base bytes (historical intermediate
stage; these are not the later Color artifact):

| Path | SHA256 |
| --- | --- |
| `site/engine/scroll-entry.cjs` | `b18da1e59800f7e19a977cf7e529de57a18bf384241b8961c122ec2bca20ec8e` |
| `site/engine/navigation.js` | `3528cca8984b39811b7b00d44bdc322320bdff0ec601236b86bf6ac6921afd90` |
| `site/engine/lifecycle.cjs` | `f00198a62377cb2759bf675bd3357f5d8e5f75fadccca1cd148796453e5c2e7c` |
| `docs/navigation.js` | `4692a41c68b6164ed623a1fb446c05a17abc742a886de753206ff7417eccc8a5` |
| `docs/space.js` | `eda29452e962f1b92763391cb472c9399a6370a2eb258202f1fc06f69b57e67b` |
| `docs/styles.css` | `198356a7b0c4f2ebd964b6b82c61ae46b49a9659eb7a331e7a87f23887530c37` |

After F04/F05 corrections, the same focused source command completed **45 tests,
45 pass, zero fail/skip/cancel/todo**, including the new route-only cleanup
regression. This reviewer also separately executed the two new actual lifecycle
tests `same-route navigation keeps a settled reading camera without a zero-depth
journey` and `returning to the old mounted route during an interrupted flight
still travels backward`: each ran one test and passed without skips. Inspected
camera correction centers both eye and sightline on the shared longitudinal axis,
retains native depth, then restores the opening reading pose. Same-route cleanup
finishes immediately; returning to an earlier mounted route during an actual
flight still travels in reverse from the displayed pose.

The F04/F05 correction-stage collector served the **Color** artifact from
`/workspace/scratch/1ac2e01fc1c8/qa-candidate-v2/public`, with raw navigation SHA256
`13f5aea82dbbd5d89cf9147c0713feb935636de96777c00d8c3c4269726b877c`,
styles SHA256 `7e0e34d26462bdd33280656fdfdd4693cc0930e35b442e081ae62dd59e015972`
and space SHA256 `41bdb95b4714e81d871d95e647d7378f7416933c995345d6cbace6320792f2e3`.
Color decoration legitimately differs from the generated base `docs/` aliases;
these are raw file hashes, not runtime/variant fingerprints. At both 390×844 and
1440×900, Research after navigation, Home with block preference Off and Research
with block preference Off each produced an actual `entering` observation with
56px or 88px synchronized ink/paper displacement. Reading camera and native
scroll range stayed equal within each observation. Before/after eyebrow rectangles
matched exactly and the accent remained 28×2px. No JavaScript page errors occurred.

Final-source confirmation served the separately frozen **Color v3** artifact
from `/workspace/scratch/1ac2e01fc1c8/qa-color-v3/public` at 390×844. It repeated
Home→Research→Home→Research, actual post-navigation entry, block preference Off
on both Home and Research, stationary camera/range assertions, and exact eyebrow
geometry comparison. All assertions passed and there were no JavaScript page
errors. Color v3 declares only the `travel` effect and artifact digest
`fc2d8afb97bf8713f74cf341c6e6055380ee695ab7614c4fcd539e9058ff684a`.

| Final inspected path | SHA256 |
| --- | --- |
| `site/engine/scroll-entry.cjs` | `7d0e20d60ebf34054a1ecbe6a6b7a91ce09c6760a0c534e4e20418f658b6046d` |
| `site/engine/scroll-entry.css` | `3084fda860a61dc1681aeca747982c02473865e64302cc8877349094ea505801` |
| `site/engine/navigation.js` | `2b490574581373ade122e5150d092b1a933500c0b5885cd43060d2b3703a2c73` |
| `site/effects/flight.cjs` | `e41035f33a8061fa5be9ec95ac63423d6ab75a1d3f2a44ae3e76b2ae297b73ac` |
| `site/engine/lifecycle.cjs` | `684eb4d24605e5e7e54bcaffde0462f920d44f634b54b67525d85e57ae83fb55` |
| `site/engine/projection.cjs` | `2a10014b1befe08bb25985ad30aa4e9f0ab4b59aaa9ed0bc38eadea65e36de4a` |
| Color v3 `navigation.js` | `13f5aea82dbbd5d89cf9147c0713feb935636de96777c00d8c3c4269726b877c` |
| Color v3 `space.js` | `ebea7b9ecba38bd3159ea7382fb54384a527bcab319592e0c4495e62eb58109d` |
| Color v3 `styles.css` | `7e0e34d26462bdd33280656fdfdd4693cc0930e35b442e081ae62dd59e015972` |

| AC | Reviewed evidence | Result | Remaining gate |
| --- | --- | --- | --- |
| AC02, AC04 | Reading controller behavior and actual post-navigation/preference integration | F04 corrected; current-source focused browser observations pass | Broader current-source browser, device and user visual gates |
| AC03 | Boxless/native media geometry, split-capability fallback and exact flex/native geometry | F01–F03 and F05 corrected; focused geometry observations pass | Broader browser and user visual gates |
| AC05 | Cancellation/fallback source tests | Focused evidence passes | Final current-source browser/device/readability admission |
| AC06 | Six-active reading cap, finite phase/hold timers and shared scene clock | Source behavior reviewed; no new clock observed | Matching measured cost and physical-device evidence |
| AC07, AC08 | Canonical source owners, CSS animation ownership and explicit evidence identity | Review supplies bounded CS01–CS08/CS10 architectural evidence | Final style guard, generation, RI, clean-head CI and issue reconciliation |
| AC09 | All-five stationary-camera tests, optical centering, staged lifecycle and painted completion | Historical 83-test selection passed; corrected camera source unchanged | Final current-source CI/browser/cost/user gates |
| AC10 | Directional route phases, mobile participation, media envelope and continued reading entry | F01–F05 corrected; bounded independent review complete | Current broader browser/cost/device/user gates |

## Issue synopsis

Independent AI review found and rechecked five corrected defects: mobile boxless
hero participation, portrait visual-envelope distance, clipping admission,
post-navigation reading cleanup and flex ink geometry. Final Color v3 narrow
browser observations verify actual continued reading entry and unchanged camera,
range and eyebrow geometry. The independent source/behavior review is complete;
keep #69 / Draft PR71 and external acceptance gates open until their separate
current-source evidence and maintainer decisions are satisfied.
