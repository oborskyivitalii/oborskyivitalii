# Issue 69 — 2026-10-11 consolidation and continuation review

Owning issue: [#69](https://github.com/oborskyivitalii/oborskyivitalii/issues/69),
consolidation decision dated 11 October 2026.
Owning PR: [Draft #71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
Reviewer: current Codex continuation agent; **self-review of the existing implementation**.
This does not supply independent implementation, human visual or physical-device approval.

Inspected main: `93a818dbc3239b97b47b7d56edb83f5a7ebf65fc`.
Inspected implementation: `a158c48b329803c36c0e5571980c7cbc77594bdd`,
tree `2194f1658eb9013731fd62f7ffcbca483566df63`, clean checkout.
The empty predecessor branch points to that main with an empty Git diff.
Current open-PR inventory contains only one execution PR for this intent: #71.
Materials: README, root AGENTS (the only applicable AGENTS), CONTRIBUTING,
current map/memory, acceptance/RI/style/source/check-profile/staging contracts,
both live issue bodies, all PR71 commits and authored/source-check diffs,
the original plan/self-review/implementation record and source-bound evidence.
Live reviews and inline comments are empty; all four required implementation-head
CI workflow families pass. The ordinary preview has successful hosted smoke.

## Intent and acceptance

The maintainer explicitly asked to combine #69/#70 and continue after interruption.
Both quote the identical original downward-scroll upward-entry request and inspect
the same main. #69 owns the implemented reviewed plan; #70 has no implementation
PR or unique commit. All original criteria, accepted evidence and open gates were
transferred into live #69 **before** closing #70 with duplicate disposition.
One active PR and existing AC01–AC08/policy remain. The unused predecessor branch
is historical; it is not another active implementation route.

| Former owner ID | Surviving #69 ID | Preserved obligation |
| --- | --- | --- |
| #70 AC01 | AC02, AC05 | Visible movement/tuning; first/landing viewport; visual feedback |
| #70 AC02 | AC02, AC03 | Five-route whole units, native active geometry/paint/focus |
| #70 AC03 | AC04, AC05 | Flight/history/anchor/interruption; actual bfcache |
| #70 AC04 | AC03, AC04 | Hidden/archive rows, counts/URLs, filters/reset/history/reflow |
| #70 AC05 | AC05 | Failure/print/visibility/readability; native find-menu and devices |
| #70 AC06 | AC06 | Bounded resources and unchanged matching cost budgets |
| #70 AC07 | AC07, AC08 | Shared output/source identity and exact-head CI/hosted checks |
| #70 AC08 | AC07 | CS01–CS10 guard plus unautomated independent review |
| #70 AC09 | AC08 | Independent/visual/device evidence and accepted merged result |

Original #70 tuning, opacity, wrappers and narrow concurrency were provisional
proposals. They do not override #69's reviewed 88px/560ms desktop and 56px/440ms
narrow opaque ink/paper movement, six active units and unchanged Writing markup.
Actual visual/tuning acceptance remains open. No criterion or budget is weakened.

## Findings

| ID | Evidence / implication | AC | Disposition |
| --- | --- | --- | --- |
| C01 | The identical intent/main and empty predecessor diff show an intent duplicate, without a second implementation. | AC01/08 | #70 superseded only after transferring all nine criteria; #71 stays sole PR. |
| C02 | Stable semantic shells are observed; their child ink and pseudo paper move together through canonical CSS. Existing active geometry evidence compares native/armed/active/settled states. | AC02/03/07 | Reviewed; no new runtime correction identified. Glyph/focus/physical playback approval stays separate. |
| C03 | Router suspends before travel and resumes only after the surviving serial's actual arrival. Native-ready is not used as arrival; cached payloads clone pristine nodes. Generation guards and destroy own callbacks/timers/listeners. | AC04/05/07 | Existing state/failure negatives and actual journeys inspected; no current source blocker identified. |
| C04 | Entry animation performs no per-frame JS writes or separate RAF. Active work is capped at six units; finite fallback timers clean up motion; bottom headroom prevents transformed overflow. | AC06/07 | Existing bounded measurements remain source-bound; full matching cost/device gate remains open. |
| C05 | Four new actual full-document Back observations pass at 1440/390 in Chromium138 and WPE WebKit26.6. Every return reports pageshow persisted=false and a new document. | AC04/05 | Readable reload/history observation only. This is **zero actual bfcache restorations**, so the real-bfcache gate remains pending. |
| C06 | Fresh-checkout additional source test attempt lacked the pinned toolchain; formatter passed with the explicit cached toolchain, but a later command/source suite without that environment could not load espree/Python. | AC07 | Environment/setup failure retained, not a runtime regression or passing result. The pinned SITE_AUDIT_TOOLS correction passes all 378/378 selected source tests, with zero failures/skips, on the clean inspected implementation head. Architecture also passes with that setting. |
| C07 | Required independent runtime review is absent in GitHub. This continuation edits its own review/handoff. | AC07/08 | Self-review stays labeled; independent review is not claimed. |

Applicable CS01–CS10 were reviewed against source ownership, declarative CSS,
unchanged content/reading paint, closure-safe assembly, focused formatting,
route/generation disposal, bounded resource use, meaningful negatives and
issue/evidence linkage. The bounded guard remains only its documented subset.
No source, profile, budget, scanner exception or runtime change is introduced
by this consolidation/evidence checkpoint. Existing test/profile dispositions
remain: controller negatives are permanent; issue69 acceptance is task-selected;
entryScenario and these dated full-document observations are diagnostic scope.

## Decisions and execution

The user's current instruction authorizes consolidation and continued
implementation/review/check work in the same issue/PR. Ordinary preview and
evidence-only bounded staging validation use the existing CI route. That label
does not promote stable staging. Merge, stable promotion and production retain
their separate existing decisions. Missing physical devices/independent review
do not block completion of available automated work.

| Task | Owner / result | Check | Status |
| --- | --- | --- | --- |
| T01 | Transfer all nine original #70 criteria and gates to live #69; close only the duplicate. | Live issues, empty predecessor diff, open-PR inventory | Complete |
| T02 | Review implementation, actual full-document history and pinned current-source checks. | Existing mapped policy/source/format/architecture plus raw history report | Complete on inspected implementation head; final clean report-only head evidence belongs to issue/PR |
| T03 | Publish this review/handoff and run existing evidence-only bounded staging route. | Final-source CI/preview and staging-regression report | Pending |
| T04 | Keep whole-AC, independent, device and actual-bfcache limits explicit. | Original ACs/policy and live checkbox reconciliation | Preserved |

## Actual browser observation

[Raw report](2026-10-11-document-history.json) records clean inspected source/tree,
actual browser versions, public-byte digest, page identity, native lifecycle events
and diagnostics before/after Back. The collector used pinned Playwright1.63.0,
local Chromium138.0.7204.0 and Linux WPE WebKit26.6, with two viewport widths.
It dispatched **no** simulated lifecycle events and enabled Chromium's cache
eligibility by omitting its default disable-back-forward-cache argument.
Nevertheless persisted=false in all four cases. A successful history reload must
never be relabeled as successful bfcache restoration or physical iPad/Safari proof.
The [collector](2026-10-11-document-history-collector.txt) is inert dated evidence,
retained in this owner, not a new routine
matrix or a release admission checker.

## Acceptance evidence

| AC | Current result | Remaining whole criterion |
| --- | --- | --- |
| AC01 | Original exact-main analysis/self-review complete; consolidation preserves it. | None for original planning criterion |
| AC02 | Implemented movement and prior scoped render/state evidence reviewed. | Maintainer/independent visual/tuning admission |
| AC03 | Prior active geometry/semantics/bytes/bottom evidence reviewed. | Whole glyph/backdrop/focus visual review |
| AC04 | 378/378 current source tests and four actual document-history returns. | Actual bfcache and whole independent lifecycle review |
| AC05 | Existing failure/focus/readability negatives plus readable document-history return. | Native find-menu/device/whole readability admission |
| AC06 | Bounded source/resources and prior scoped cost evidence retained. | Current matching staging/full cold/route/soak/device scope |
| AC07 | Canonical source/generated/style evidence reviewed; final clean checks recorded externally. | Independent implementation/style review |
| AC08 | One surviving owner/PR, original criteria transferred before duplicate closure. | Final CI/evidence reconciliation, independent/device and later accepted merged result |

Only whole criteria can be checked. AC01 remains checked; AC02–AC08 and all nine
transferred #70 criteria remain unchecked. Runtime files/public bytes are unchanged
by this review checkpoint. Original implementation and new report identify their
actual measured source; later report-only commits do not create new browser data.

## Preserved original #70 acceptance text

The following text is copied exactly from the predecessor's original criteria
apart from headings prefixed with its former owner; no original obligation is lost.

### Former #70 AC01 — Visible upward entry
- [ ] Downward reading scroll visibly brings opted-in blocks from below to their existing places with smooth deceleration. Initial visible content is readable immediately; shown blocks stay settled on upward scroll. Exact tuning and one-time behavior are confirmed from the real preview.

### Former #70 AC02 — Granularity and geometry
- [ ] All five routes use coherent reading units, with no parent/child double animation. Complete card paint moves with its content. Native host positions, layout, scroll range, anchors, responsive wrapping, backdrop gutter/radius/alpha and focus outlines remain correct during and after motion; tall rows work.

### Former #70 AC03 — Navigation and history
- [ ] First entry, forward/reverse/rapid interrupted flights, failed navigation, anchors, Back/Forward and restored/BFCache positions settle landing content correctly. Reveal state does not overlap flight ownership, leave detached callbacks or change scroll-end navigation.

### Former #70 AC04 — Archive reflow
- [ ] Hidden Writing rows remain hidden; filter/reset/history and viewport/font reflow reconcile pending/visible blocks without blank results, whole-archive replay or incorrect counts/URLs.

### Former #70 AC05 — Readable fallback and accessibility
- [ ] No-JS, missing observer/CSS/scene enhancement, motion Off, reduced motion, print, hidden/visible page and controlled initialization/cleanup failure retain readable usable content. Keyboard/focus and native find/anchor reading do not depend on completion of an animation.

### Former #70 AC06 — Bounded cost
- [ ] One mounted controller/observer, bounded concurrent animations, no added perpetual JS loop or hot-loop layout reads, no persistent promotion hints and complete disposal are verified. Matched baseline/candidate evidence retains raw timings/layout passes and meets unchanged applicable performance budgets; no speed claim is inferred from source alone.

### Former #70 AC07 — Canonical delivery and checks
- [ ] Authored engine/template/CSS/build owners generate coherent hosted/base/Color/standalone output and immutable identities. Applicable Basic/source/format/architecture/RI/CI and hosted checks pass on the exact PR head; existing profile coverage and acceptance mapping are reconciled.

### Former #70 AC08 — Code style and ownership
- [ ] Applicable CS01–CS08 and CS10 rules are mapped to changed owners/checks; CSS remains declarative, content stays separate and motion preference/lifecycle ownership stays singular. The bounded CS09 guard passes without new exceptions; unautomated architecture/readability obligations have an explicitly identified reviewer.

### Former #70 AC09 — Review and outcome
- [ ] Independent implementation review, actual visual feedback and applicable device observations are recorded with their limits. This issue and its single execution PR state intent versus outcome, exact tested/merged refs, source-bound evidence and remaining staging/release decisions. Closure waits for the accepted merged result; green CI alone is insufficient.

## Issue synopsis

#70 is consolidated into #69 and closed as a duplicate; Draft PR71 remains the
sole execution route. Existing implementation is recovered and reviewed. Actual
full-document history observations pass but do not activate bfcache; required
independent/device/visual/full-cost gates remain pending. Continue final exact-source
CI and evidence-only bounded staging validation in the same PR.

