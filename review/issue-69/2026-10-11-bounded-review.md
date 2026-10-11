# Issue 69 — 2026-10-11 bounded transition review

Owning issue: https://github.com/oborskyivitalii/oborskyivitalii/issues/69
Owning PR: https://github.com/oborskyivitalii/oborskyivitalii/pull/71

Reviewer: Codex delegated motion-review agent. Independent AI review of the
approved preview snapshot `938e2b1599851bf55295733319bbeac8e3c4ed8f`; the
subsequent narrow retarget fix below was authored by this reviewer and its
verification is self-validation. The primary execution agent peer-reviewed the
room-pair correction and requested the bounded prewarm adjustment below; this
AI peer review remains distinct from manual/device gates.

The original snapshot was read through immutable Git objects and extracted to
a separate temporary directory while the main execution agent rebased the
worktree. The correction was prepared on rebased head
`c9698cfd0455c7fa7ca23c0d1c22948ec4f4ec10` with explicitly dirty source.
Materials inspected: AGENTS, CONTRIBUTING, acceptance/check/style contracts,
the scroll-entry factory/CSS, navigation, scene lifecycle, Color preference
owner, focus CSS and the existing motion/source-test contracts.

## Intent and acceptance

The maintainer approved the common bounded preview: departure and arrival each
use a 1000 ms envelope, overlapping 700 ms rows with a 300 ms stagger span;
one row uses the full envelope. Camera centering/transit/restoration use
400/1000/350 ms, giving a normal planned total of 3750 ms. The same content
control owns reading and route-block behavior. The later cleanup removes the
unrelated late-flight room flash and the noninteractive main focus frame;
Credits participates in the same link-driven choreography as every route.
This review does not replace original issue criteria or physical-device gates.

## Findings

| ID | Evidence/path | Finding and implication | Affected AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | Original `site/engine/lifecycle.cjs:274–282`, `navigate` source ownership | The room clamp used the previous intended destination as its source. Home → Credits at displayed camera Z −50.317824 paints Home/Research; retargeting to Talks keeps that camera but abruptly substitutes Talks/Credits. Camera continuity alone did not preserve geometry continuity. | AC04, AC09, AC10 | Corrected in dirty prepared source; current affected tests pass, original snapshot fails the new retarget test. |
| F02 | Original `tests/scroll-entry.test.cjs`, `tests/flight.test.cjs`, `tests/space.test.cjs`, `tools/quality/transition-pacing.*` | Existing assertions still required serial rows, responsive/departure-specific timing, direct presentation cancellation and 900/1500–2200/800 ms camera legs. They needed the approved timing/ownership amendment before they could validate this candidate. | AC06–AC10 | Space assertions corrected here; other owners delegated to the main execution agent. Final whole-profile evidence remains its responsibility. |
| F03 | Peer review of `navigate` room prewarming | Preparing the logical previous destination after a retarget could evict an actually displayed source room and rebuild it on the next paint. | AC06, AC09 | Prewarm unique displayed departure rooms plus destination, at most three; the final test asserts no model construction on the first replacement paint. |

No additional defect was found in the inspected common CSS timing owner, the
single persistent Color preference write path, general Credits link routing or
the scoped main-outline rule. Header/control focus rings remain authored. These
are bounded source-review observations, not Safari/device appearance approval.

## Decisions

The retarget correction retains the actual displayed departure pair while the
replacement camera centers, then bounds subsequent pairs between those rooms
and its destination. A settled departure retains its single source room. The
prewarm set follows the displayed departure rooms plus destination. The
existing room culling, at-most-two active rooms, three cached rooms and six
detail variants remain unchanged. Normal late transit still excludes unrelated
rooms beyond the destination, while long journeys preserve intermediate rooms.

The existing 400/1000/350 ms camera legs and all block timing/control owners were
left unchanged. No additional RAF, hosted matrix, budget or debt exception was
introduced. The primary agent's AI peer review addressed the room helper and
source set; final current-source profile and hosted checks remain with the PR
execution route.

## Sol tasks

| Task | Paths and expected change | Finding / AC | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | `site/engine/lifecycle.cjs`: preserve the displayed source pair during retargets, prepare its models and keep normal endpoint exclusion | F01, F03 / AC04, AC06, AC09, AC10 | Serialized lifecycle, every direct pair and five interruption scenarios at both widths | Implemented; checks below pass |
| T02 | `tests/space.test.cjs`: fixed 1750 ms camera plan, actual first depth movement and room-paint assertions | F01–F03 / AC09–AC10 | Full maintained space suite before prewarm amendment, focused final retarget/prewarm cases, original-snapshot rejection | Complete within stated source limits |
| T03 | Remaining pacing/control tests and final generation/source/hosted profiles | F02 / AC06–AC10 | Current owning registry and acceptance runner | Main execution agent owns evidence |

## Acceptance evidence

The current tested owner SHA-256 digests are:

| Source | SHA-256 |
| --- | --- |
| Final `site/engine/lifecycle.cjs` | `6aa8dea1f420f2c9e340a9df347b619ca8eaa3120addc8afb6acd12e92d19ad5` |
| Final `tests/space.test.cjs` | `6537b59010e8deef4617bd0b8f008862201f1297ff26b65197ffc6c04dafe5c7` |
| Final temporary canonical serialized runtime | `ca7eae89be13744fb28f7e2c0de9fd193cc3d937e3f61a17f7f5fc944fbbb517` |
| Pre-prewarm lifecycle | `bd7dcabba72a1f63c80de203738f49dae1d38f4bbcfcfc96f25a76dab67ad49c` |
| Pre-prewarm space tests | `5e6272bf225ce63c2bcbdfa5f3310a66b0fbde9d234b26791d947edb73d48d30` |
| Pre-prewarm serialized runtime | `11280cfc63c411906a4b1dec4ae41d980797b978774ba217f9740d76ed6c7ab0` |

The runtime was produced by `tools/site/build.cjs.runtime` and its current
`configuration(root).definitions`, with `SITE_SPACE_SOURCE` pointing the existing
space harness at those bytes. This did not modify generated output during the
parallel source work.

| AC | Check | Result | Exact source / limit | Remaining gate |
| --- | --- | --- | --- | --- |
| AC04, AC09, AC10 | Full maintained space suite, including all 20 distinct route pairs at both widths and five interrupted/reverse/same-cell starts at both widths | 52 passed, 0 failed/skipped/cancelled, 101.686 s | Pre-prewarm owner/runtime digests above; executable DOM/Canvas harness | Final profile run, actual browser/device lifecycle |
| AC06, AC09, AC10 | Final retarget source-pair/prewarm test plus existing settled-detail and adaptive preparation tests | 3 passed, 0 failed/skipped/cancelled, 10.602 s | Final owner/runtime digests above | Final whole-profile source admission and browser/device cost |
| AC09, AC10 | Current retarget case against original preview runtime | Expected rejection: camera source rooms Home/Research replaced by Talks/Credits | Exact original `938e2b1` generated runtime; 1 test fails, no skip, 0.841 s | Negative demonstrates the case is sensitive to the defect |
| AC07 | Pinned formatter check, JS syntax and focused diff whitespace | Pass | Current lifecycle and space-test owners | Full applicable style/source/RI checks remain separate |

The first full space run passed 48 of 52 cases; its four failures were the two
old exact-stage boundary waits and two VM-array comparison mistakes in the new
tests. Those were corrected, and all four affected tests then passed. The complete
52-case rerun passed on that source. After the peer-requested prewarm correction,
the final three applicable retarget/model-preparation cases passed. This review does not claim
Basic, whole-profile source admission, hosted cost, Safari, physical iPad,
bfcache or release evidence from these unit observations.

## Issue synopsis

Independent source review found and reproduced one interrupted-flight room
replacement regression. The narrow correction preserves the displayed room
pair and passes all direct route/late-paint and interruption cases at desktop
and narrow widths. The new test rejects the original defective snapshot.
The source-pair correction received AI peer review; final prewarm behavior is
tested separately. Final profile/device gates remain distinct.
