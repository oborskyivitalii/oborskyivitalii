# Issue 41 — 2026-10-10 scroll camera continuation

Owning issue: [#41](https://github.com/oborskyivitalii/oborskyivitalii/issues/41).
Owning PR and commit-pinned evidence: supplied by the integrating agent after commit.
Reviewer role: delegated implementation and self-review, not independent review.
Inspected baseline: `93a818dbc3239b97b47b7d56edb83f5a7ebf65fc`; prepared working tree is dirty.

Materials read: root README/AGENTS/CONTRIBUTING, repository map and dated memory,
site source contract, code-style guide, check profiles, acceptance contract,
runtime, navigation, archive, maintained browser helpers and their source tests.
No applicable nested AGENTS files exist in these paths.

## Intent and dated scope decision

On 2026-10-10 the maintainer added: remove camera flight through fractals during
scrolling everywhere; retain current page transitions with camera flight, content
fade and motion. This continues #41 without a new issue. It explicitly supersedes
earlier scroll-to-camera mapping and unchanged-runtime requirements for this PR;
historical acceptance evidence remains attached to its earlier edition.

Each route now retains its authored `initialPose` while the visitor reads.
Native scrolling, direct entry at a saved offset, fragments, history bottom
landings, archive filtering and content/footer reflow cannot select another
camera path. Route navigation still owns the same journey, scene clock, painted
progress callback and content handover. Passive scene motion remains enabled.

## Findings and implementation

| ID | Owner | Finding and treatment | AC |
| --- | --- | --- | --- |
| F01 | `site/engine/lifecycle.cjs` | Scroll listener, semantic-stop interpolation, Writing progress/focus state and offset-dependent landing targets were the complete active scroll-camera coupling. Removed them; steady route pose replaces those targets. | SC01 |
| F02 | `site/engine/lifecycle.cjs` | Route journey preparation, direction, deadline, bounded rooms/detail, pause/resume, displayed-progress and failure completion are retained. Native range reconciliation and layout observers remain for real DOM bottom/history restoration. | SC02–SC03 |
| F03 | `tools/quality/scroll-browser.cjs`, `engine-browser.cjs`, `functional.cjs` | Existing all-route/content/footer/reorder/viewport/filter/short-page fixtures previously required camera movement. They now require the exact declared route camera and native bottom reachability, with actual ambient paints still observed. | SC01–SC03 |
| F04 | `tools/quality/validate.cjs`, `staging-regression.cjs` | Existing aggregates rejected a fixed camera as a plateau. They now share the strict fixed-pose probe validator, rejecting changed/wrong/missing poses, missing final gestures and wrong actual bottom. No suite, profile, budget or source identity gate was removed. | SC01–SC03 |
| F05 | `site/README.md` | Replaced the active native-scroll camera contract with the new reading/route-flight boundary. Retained pure path definitions and math helpers remain available for model/history compatibility; active lifecycle no longer consumes them. | SC01 |

Runtime/config owners edited: `site/engine/lifecycle.cjs`; no route, scene,
projection, navigation, CSS, flight effect or geometry definitions changed.
The scope also updates the existing tests in `space.test.cjs`,
`engine-browser-fixtures.test.cjs`, `functional-fixtures.test.cjs`,
`quality.test.cjs`, `staging-regression.test.cjs` and
`tests/fixtures/staging-evidence.cjs`. No new runtime loop or dependency was added.

## Acceptance evidence

Final authored lifecycle SHA256:
`0923b0b7cba590e18fdfcd2c833b2b1a476d174e98177dc9c414b5be6e232058`.
Temporary runtime assembled through canonical `build.runtime/configuration`:
`952621911e037ec691ab440b642d7b5a26b3924a427826454e5f107cdcbecf8e`.
This temporary runtime was used via existing `SITE_SPACE_SOURCE`; repository
generated outputs are reserved for the integrating agent's normal regeneration.

| AC | Check | Result | Scope and remaining gate |
| --- | --- | --- | --- |
| SC01 | `space.test.cjs`: `native scroll keeps each route camera steady while bounded ambient motion continues`; `Writing filters and reflow preserve the steady route view` | Pass in final selected run | All five routes, desktop/mobile geometry, restored entry offset, continuous/reverse/native-bottom gestures and Writing filtering/reflow. Actual browser observations remain separate. |
| SC02 | Existing one-Canvas route-flight test plus `navigation.test.cjs` painted-camera/content-handover test | Pass in final selected run | Forward/reverse retarget, pause/resume, same Canvas, bounded cache and retained Color fade/motion handover. |
| SC03 | Existing Off/reduced/CSS-failure tests; rapid scroll reversal; fragment/history landing; midflight destination reflow | Pass in final selected run | Fixed target remains independent of native offset; exact frame freeze and bounded failure retain their previous assertions. |
| SC01–SC03 | Final targeted runtime/navigation selection | **11/11 pass**, no failures/skips | Final authored temporary runtime; includes one additional matching detail-freeze test. |
| SC01–SC03 | Final `quality`, `staging-regression`, `functional-fixtures` suites | **45/45 pass**, no failures/skips | Negative cases reject moved cameras and incorrect native offsets; source/artifact/performance admission is unchanged. |
| SC01–SC03 | Initial combined source suites: space, scroll-sync, navigation, functional-fixtures, engine-browser-fixtures, navigation-motion-fixtures, quality, staging-regression | **117/117 pass**, no failures/skips | Intermediate prepared source; final selected rerun above covers the subsequent unused-function removal and stricter waypoint validation. |
| Style | Pinned Prettier check on the 12 changed JS owners; `python3 tools/check_code_style.py` | Pass | Bounded guard scanned 81 authored files with no legacy occurrences. Independent review and global checks belong to integration. |

Applicable style review: CS01 ownership and one canonical runtime; CS04 route
pose remains with the existing route/model owners; CS05 focused formatting;
CS06 one journey/clock and existing cancellation; CS07 fewer layout scans,
unchanged bounded scene/caches; CS08 strict maintained negative checks; CS09
bounded guard; CS10 same-issue evidence. No measured performance improvement is
claimed. No full production regression was launched for this continuation.

## Integration and remaining gates

1. Append the maintainer's scope amendment and SC criteria to #41 and update its
   current-source policy; do not reinterpret old unchanged-runtime evidence.
2. Register this evidence path and refresh catalog/registry camera descriptions.
3. Regenerate public/offline outputs through their owners, rebuild/verify RI and
   run Basic plus mapped current-source checks and the existing light PR smoke.
4. Record actual browser/preview evidence for scroll/fade/route behavior and the
   combined Home/Research content change. This self-review does not establish
   device, editorial, independent-review, merge or release approval.

No merge, production launch, commit, push, policy/catalog mutation or output
regeneration was performed by this delegated implementation. The integrating
agent owns those task records and the final issue checkbox reconciliation.

## Issue synopsis

Scroll-driven fractal camera travel is removed on every route. Ordinary reading
keeps a steady route view while the fractal breathes; page navigation keeps the
existing camera flight and synchronized content fade/motion. Existing fixtures
and aggregates now verify this boundary without reducing coverage or budgets.
