# Issue 69 — 11 October 2026 sequenced travel implementation

Owning intent: [#69](https://github.com/oborskyivitalii/oborskyivitalii/issues/69),
11 October stationary-reading and block-transition amendment. Execution remains
in [Draft PR71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
This document is implementation analysis and self-review. The separately
delegated [independent AI review](2026-10-11-sequenced-review.md) records its own
findings and actual browser observations. Neither is physical-device observation
or maintainer visual approval.

Prepared from PR71 head `15dabb70135468550cac52153887d9a60d6eb0d3`, tree
`a57457239be3bd6f77337798e7a261a1669a3b6f`, against inspected main
`93a818dbc3239b97b47b7d56edb83f5a7ebf65fc`. Final clean-head acceptance and live
CI identities are recorded in the issue/PR; dirty prepared observations below
identify public bytes rather than claiming that the old head contains this work.

## Intent and acceptance

Keep the existing upward one-shot reading entry on every page. Scrolling inside
a route no longer changes the camera's reading pose. Ambient fractal motion
continues. For forward route changes, visible outgoing blocks move above the
viewport, the camera centers the fractal, flies forward and restores the usual
upper-right reading composition, then visible destination blocks rise from below.
Reverse navigation moves outgoing blocks down, flies backward and drops the
destination blocks from above. Clicks and the existing deliberate end-scroll
gesture share the same navigation operation. Credits participates in direct
route travel; the existing primary four-page end-scroll itinerary is retained.

The owner appended AC09 (fixed reading camera and ordered centered travel) and
AC10 (opaque directional block transition) to AC01–AC08. Whole-page fade and
depth translation are removed. Original geometry, accessibility, lifecycle,
cost, independent/device/visual and delivery obligations remain.

## Findings

| ID | Evidence / implication | AC | Disposition |
| --- | --- | --- | --- |
| S01 | The previous native-scroll camera journey coupled reading and spatial travel. Fixed opening poses now survive scroll, route growth, filters and restoration. | AC09 | Implemented in lifecycle; camera/lifecycle behavior checks. |
| S02 | Centering only the optical projection left the reading sightline diagonally offset. Center pose now aligns camera position and sightline to the fractal's structural axis while preserving depth. | AC09 | Corrected before final source freeze; centered-axis and projection tests. |
| S03 | Root fade/depth presentation could expose a destination before camera restoration. Individual opaque blocks now hold destination content through native midpoint mount and camera restore. | AC04, AC10 | Router awaits departure, final painted camera completion and arrival; stale serials cannot commit. |
| S04 | Successful route cleanup must preserve ordinary reading eligibility. Full settlement and transient route cancellation are separate operations. | AC02, AC04, AC10 | Independent finding F04 corrected with cancelRoute; full fallback still explicitly settles. |
| S05 | Existing browser fixtures asserted the superseded moving-scroll camera and root depth/fade. | AC07–AC10 | Assertions now require fixed reading poses and ordered opaque block stages; profile cases and budgets remain unchanged. |
| S06 | Same-route cleanup previously created a zero-depth journey. | AC04, AC09 | Settled same-route calls finish immediately; interrupted returns from a different displayed route retain real backward travel. Two actual lifecycle regressions cover both cases. |

The independent review additionally found mobile boxless hero selection,
portrait decoration outsets, missing clipping admission and flex ink geometry.
Its findings retain the failed observations and correction checks. Green mocked
router checks alone did not reveal the real post-navigation reading regression.

## Decisions

The user authorized this continuation within #69; PR71 remains the sole execution
route. No merge, stable staging or production release is inferred. PR53/#49 and
PR68/#41 were inspected as overlapping owners, but their separate changes were
not imported. Historical issue45 source-bound acceptance assertions retain their
old moving-camera intent; the current permanent checks and owning #69 policy
exercise the explicitly amended behavior instead of silently rewriting that
historical policy.

Camera travel adds two finite 180ms framing phases around the existing bounded
transit. The same scene clock owns all camera motion. Block animation is CSS
translate with paper and ink sharing duration/delay; no whole-root opacity or
depth transform, extra RAF loop, internal scroll container or permanent archive
layer is added. Route animation targets visible units, including controls/footer,
while ordinary reading retains the six-active cap and local staggering.

## Sol tasks

| Task / rules | Canonical owners and behavior | Check route | Status |
| --- | --- | --- | --- |
| T01 / CS01,04,06,07 | Lifecycle/math/projection: fixed reading poses; center, transit, restore; painted completion; pause/cancel bounds. | camera-view and space tests; current navigation browser probes | Implemented |
| T02 / CS02,03,04,06 | Scroll-entry controller/CSS: native shells, individual directional departure/arrival, hidden hold, flex ink, route-only cleanup. | serialized controller negatives; active/settled browser geometry | Implemented |
| T03 / CS04,05,06 | Navigation/flight: serial-owned async sequencing, midpoint native mount, preference/lifecycle cancellation, post-arrival reading resume. | real extracted router tests and actual browser navigation | Implemented |
| T04 / CS05,08,09 | Existing quality helpers, fixtures, registry and policy: amended semantics with unchanged matrices and budgets. | pinned format/lint, source selection, architecture/style guard | Final results recorded below and in current-head CI |
| T05 / CS01,10 | Generated hosted/offline outputs, lock, catalog, RI, same issue/PR and dated evidence. | generation, Basic, RI/coupling and exact clean-source policy | Final results recorded in issue/PR |

CS01–CS10 were self-reviewed against these owners. The automatic style guard
proves its bounded CS09 subset; independent architectural review is separately
identified. Tests exercise direction, real asynchronous phase ordering, stale
work, preferences, unsupported clipping, mobile grouping, visual envelopes and
native fallback rather than asserting source substrings alone.

## Acceptance evidence

The final registered staging source selection passes **390/390** cases across
36 maintained modules, with zero failures, cancellations, skips or todo cases.
Basic passes its 13 theme/archive and 10 Color flight cases, all five route
geometry/syntax/artifact checks and original budgets; maximum raw HTML remains
99,997 bytes. The mapped camera/navigation group contains 79 cases, and the entry
controller contains 21. Policy accounting floors retain those accepted cases.
The finite 180-second source-test subprocess bound changes execution tolerance,
not runtime budgets.

Pinned full formatting has no drift. Full lint scans 198 files with zero findings
or warnings; architecture/formatter/scanner coverage passes 33 cases. The bounded
style guard and RI 28-case plus coupling 19-case regressions pass. Final RI freshness
and exact clean-head policy evidence are captured after all review bytes are saved.

Color v3 passes **52** local Chromium cases: 32 forward/reverse route journeys
and 20 native/armed/active/settled entry geometry replays across all five routes,
1440/390 widths and light/dark themes. No JavaScript page error was observed.
The independent reviewer additionally observes actual downward entry after
navigation and with Block transitions disabled, preserving the camera, native
scroll range and eyebrow geometry. Its report identifies that independent role.

The base rendition passes the same **52** cases, giving **104** current local
cases with zero errors. [Summary](2026-10-11-sequenced-browser-summary.json) and
[raw evidence with inert collectors](2026-10-11-sequenced-local-evidence.tar.gz)
retain all frame samples, native geometry, both artifact manifests, source/static
logs and a narrow dark active-entry screenshot. Neither artifact supplies hosted
cost or user/device admission.

The changed generated/evidence bytes produced 191 new exact public checksum/Git
entropy candidates. [Proof inventory](2026-10-11-v3-security-proof.json.gz) and
[independent disposition review](2026-10-11-sequenced-security-review.md) preserve
their individual path/rule/value meaning, all 3,986 previous ledger records and
the frozen baseline. No scanner rule or bound changes. Initial full security
admission stopped at stale RI while evidence was being saved; that failure is
retained. Final complete security/RI and clean-source admission are recorded
externally in the issue/PR after the source freeze.

Color public artifact digest:
`fc2d8afb97bf8713f74cf341c6e6055380ee695ab7614c4fcd539e9058ff684a`.
Base v3 public artifact digest:
`7d39e320158c5abbf99df7e283f0df601fd8cb1d9aa7e4b09f424f450003d26d`.
The prepared artifacts record sourceDirty=true and the preceding committed
head/tree. Raw local evidence identifies public bytes; it is not clean-head CI
or hosted cost admission. Browser version is Chromium153.0.8010.0, distinct from
the pinned CI browser and physical Safari/iPad. Local observations do not replace
matching hosted cost, native find-menu, actual bfcache or user visual gates.

Preliminary observations are superseded: an earlier camera test
captured pre-correction generated bytes, and the first broad source run could
not execute the cached Python toolchain because its interpreter link was absent.
Those failures are retained in scratch logs and are not cited as final passes.

| AC | Deterministic / observed route | Remaining whole-criterion gate |
| --- | --- | --- |
| AC01 | Preserved original planning evidence plus fresh RI/Basic | Original planning acceptance recorded in issue |
| AC02–AC05 | Entry/controller/router tests, post-navigation downward entry, native active/settled geometry | Current broader lifecycle/readability, user visual, Safari/WebKit/device, actual bfcache/find evidence |
| AC06 | Bounded source work, six-active ordinary entry cap, no extra clock | Matching hosted cost, raw performance failures, physical iPad smoothness |
| AC07 | Canonical generation/shared delivery, pinned tools, style guard, RI/coupling; independent AI review | Final current-head checks and gate reconciliation |
| AC08 | One Draft PR71, Refs #69 implementation, dated review/policy evidence | Delivery/merge decisions and still-pending original external gates |
| AC09 | Stationary all-route poses and staged camera tests; centered flight browser samples | Current matching cost, broader lifecycle and user/device visual approval |
| AC10 | Directional opaque block tests; camera-before-arrival browser samples; independent geometry corrections | Current matching cost, broader lifecycle/geometry and user/device visual approval |

## Issue synopsis

All five pages use a fixed reading camera and the same direction-aware sequence:
visible blocks depart, the centered camera travels and restores composition,
then destination blocks assemble. Ordinary reading entry resumes afterward.
Canonical hosted/offline output and existing quality expectations were updated.
Independent AI review identified real mobile/integration defects and verified
their corrections separately; external acceptance gates stay explicit.
