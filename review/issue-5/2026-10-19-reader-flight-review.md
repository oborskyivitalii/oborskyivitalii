# 19 October follow-up — same-scene camera orbit

The maintainer rejects the depth out-and-back introduced below: the return breaks
spatial continuity. This dated decision supersedes only that local camera path.
Owner: [#5 orbit amendment](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issue5-reader-orbit-20261019), same Draft PR79, baseline b0ff55d.

Writing↔native article and article↔article now center the existing Writing model,
complete a horizontal camera orbit around its shared pivot, and restore the exact
reading pose. Back/Forward reverse winding. The same Writing geometry stays fully
visible; Research/Talks models and depth-based room fading never enter local trips.
Principal-section trips retain their corridor path. The existing400/1000/350ms
center/transit/restore clock, one RAF, cancellation and cache limits remain.
No editorial, selected material, original image, PDF or publication data changes.

## Independent orbit findings and disposition

Implementation: root Codex. Independent read-only technical AI reviewer:
`/root/orbit_review`, under the existing AC11/CS10 independent-review requirement.

| ID | Finding and meaningful negative | Correction and disposition |
| --- | --- | --- |
| O01 P1 | Orbit→Research→Talks during the unfinished return discarded orbital provenance. Independent replay reduced the sightline to zero at400ms. | Carry the unfinished orbit state **and original Writing return anchor** through repeated replacements, ending inheritance after centering. New regression repeats four principal targets; exact original independent replay retains radius56 and returns to Writing continuously. Addressed. |
| O02 P2 | Arbitrary finite orbit centers violated the axial endpoint assumption or coincided with the eye. | Validate the supported shared axis, pivot envelope and enclosing56–64 radius. Off-axis/coincident originals plus missing/malformed/unsupported centers and changed zero-radius opening are rejected. Independent exact examples both reject. Addressed. |

Independent re-review found no remaining blocker within these findings. Inspected
prepared Git blobs: lifecycle d7439bb, projection e78b16b, producer d8f5c14,
scene tests82ac629, config tests767cf31. A subsequent cohesive cameraDeparture
snapshot and cameraPath extraction reduce the existing navigation complexity
warning from29 to27; the same independent reviewer accepted ordering/provenance equivalence
at final lifecycle blob7b114369c2d2b77c236b746be921365029ab0d16.
Final regenerated source identity belongs to PR79. Its focused correction regressions2/2
passed. The earlier focused normal/room/cancellation cases5/5 passed. This is
bounded technical review, not whole-PR, article, rights, device or release approval.

## Source, browser and style contract

- Pure projection owns the orbit and continuous return arc; scene data owns pivot
  parameters, producer validation owns their finite supported envelope, lifecycle
  owns clocks, room selection/visibility and cancellation. No new service, model
  registry, timer, runtime dependency or content/style owner: CS01/04/06/07.
- Source tests observe full360° winding in both directions, fixed radius/target,
  continuous endpoints, nonzero sightline, Writing-only paints, exact anchor,
  no neighboring model construction and repeated retargets. Existing principal,
  history, Off/reduced/hidden and resource cases remain: CS08.
- Browser admission requires actual successful camera paints, navigation/document
  identities, center/transit/restore phases, both sides and rear of the circle,
  signed winding, constant radius and fixed target, Writing-only scene and complete
  canonical arrival. Axial excursion, reverse direction, scene swap, drift, wrong
  target, missing phases and mixed identities reject. Principal routes retain real
  signed-depth observation rather than being relabeled as orbits: CS08/10.
- Focused prepared verification: complete scene suite64/64 before the O01
  follow-up; refreshed reader/orbit/retarget suite8/8; config regression1/1;
  browser evidence7/7 and Color/current-historical controller suite24/24.
  Exact clean final whole-source and hosted reports are recorded in PR79.
- Maintained formatting/bounded guard, RI/CI and original byte/frame/cache budgets
  remain required. No existing complexity exception is broadened: CS05/07/09.
- The exact orbit runtime family is registered in the existing Color identity and
  mandatory publication-rights discriminator; previous runtime families remain.
  Current production selection assertions advance to the new identity. Missing or
  substituted rights remain rejecting cases, not a new legacy exemption.
- The independent sampled animated composition radius was approximately52.90
  inside the current camera radius56. This is geometry inspection, not a native
  device or hosted frame-performance claim.

## Placement and remaining acceptance

The bottom Writing link comes from the explicit preview-only `listing()` block
headed “Test article previews”. The synthetic reference remains draft/nonpublishable
and excluded from the catalog and recommendation candidates. Real local published
articles enter the canonical catalog, grouped by year/topic and its explicit
editorial order, with the common count/filter/tags. No automatic production or
promotion is performed by this change.

Full staging, actual article/media/PDF/rights, author/device decisions and independent
production lanes remain their existing separate #5/#2 gates. No whole checkbox is
newly ticked by this bounded increment. Final exact head, raw check and immutable
preview links belong to PR79; the older review below remains historical evidence.

---

# Issue5 — 19 October reader flight correction and independent review

Owner: [issue5 reader-flight amendment](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issue5-reader-flight-20261019), same Draft [PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).

Implementation/self-analysis: root Codex. Independent technical AI reviewer:
`/root/reader_independent_review`, a separate read-only agent explicitly requested
by the user. This is bounded implementation review, not author, rights, physical-device,
whole-PR approval or release acceptance.

Baseline inspected:10c887e721d54d02ee0bb3438300cdcdf836f18f,
tree1711ea7e007850686736b2ecc30bcaedd17af7c6. Follow-up inspects the prepared
runtime/test source whose eight-path SHA256 map has aggregate hash
`4ceb25ec448335bbce373196f527fbbfe87d376afda66c8c0d1573e0b76ecc94`.
The final PR records exact commit/tree/source-policy and hosted artifact evidence.

## Intent and acceptance

User observed that entering the reader and leaving it lacked the existing fractal
flight. AC08/12 retain coherent native documents, the shared five-scene shell and
changed-surface admission; AC11 retains meaningful independent CS01–CS10 review.
No manuscript/publication/material selection is changed in this correction.

Distinct documents in Writing now request an explicit signed half-room corridor
excursion. This is a real out-and-back camera movement ending at Writing's existing
reading anchor, rather than a new article room or a monotone trip between principal
rooms. The existing400ms center,1000ms transit,350ms restore clock, room visibility,
cache bounds and native/block controls own the complete behavior.

## Findings and corrections

| ID | Evidence and implication | AC | Disposition |
| --- | --- | --- | --- |
| F01 P1 | Router compared scene identities and scene lifecycle independently rejected equal-scene travel. Independent baseline replay observed immediate progress1 and unchanged camera. | AC08 | Explicit document intent enables flight; a pure projection helper supplies real signed corridor depth. |
| F02 P2 | Previous article admission checked Canvas identity/history but no successful camera displacement; labels and static transit could pass. | AC08/12 | Raw actual-paint evidence requires matching document/navigation IDs, expected path/direction, complete stages, signed depth and complete final pose. Negative evidence tests retained. |
| F03 P2 | `.article-related` was absent from shared route units, so visible recommendations disappeared without the wave. | AC08 | Shared selector now includes the native section; reference browser journey observes its departure. Optional absence remains valid for other readers. |
| F04 P2 | Scene-index ties made reader/Back navigation always forward. | AC08 | Router owns document direction and a persisted history ordinal, preserving anchors/filter history, focus and scroll. |
| F05 follow-up | Repeated principal destination before mount was misclassified as a local excursion because Scene had already advanced its target page. | AC08 | Router supplies logical same-scene intent separately from document-change retarget permission. Regression repeats both principal directions from displayed transit. |
| F06 follow-up | Literal header hrefs failed article rebasing; Home uses wordmark and Credits is a footer utility. | AC12 | Browser uses existing native semantic controls and actual footer link. |
| F07 follow-up | Generic admission incorrectly required optional recommendations; local-path label and final-Z-only evidence were insufficient. | AC08/12 | Conditional related inventory, expected document-path selection and complete from/to-pose evidence with adversarial negatives. |
| F08 follow-up | Reduced-motion check could accept an uninitialized/failed Scene. | AC08/12 | Browser requires successful scene readiness, active reduced media, stored On and disabled Reduced control, then zero camera/row trips. |

| F09 independent follow-up | Forward local flight built Talks inside its first transit paint, violating preflight preparation. | AC08/11 | Explicit future corridor pair is prepared before camera start; both directions prove no model build after first paint within original cache bounds. |
| F10 root follow-up | Opening a reader after a long principal midpoint must preserve the still-arriving principal corridor. | AC08 | Local excursion is selected only from settled or existing local travel; source regression preserves complete displayed pose/positive room weights through canonical arrival. |

| F11 hosted follow-up | Native host extensionless article entry was not recognized on Back, leaving Writing under the article URL and breaking relative header links. | AC08/12 | Mutable aliases recognize extensionless paths; immutable snapshots retain exact filenames. Browser admission now requires native-entry Back/Forward, retained native URL, restored root header and actual complete camera trips. Focused independent re-review accepted with3/3 routing/admission and7/7 evidence tests. |

## Ownership and style review

| Rules | Changed concern and verification |
| --- | --- |
| CS01/04 | Authored router owns document/history identity; lifecycle owns one camera clock; projection owns pure trajectory math; scroll-entry owns every route unit. No new renderer, scene registry or runtime dependency. |
| CS02/03 | No editorial labels, content layout or CSS declarations added to runtime. Native material/tag/template owners preserved. |
| CS05/09 | Maintained formatter and bounded source guard; generated copies regenerated. The guard does not prove all architectural rules. |
| CS06 | Existing cancellation serial, mount barrier, motion/visibility and native fallback remain. Repeated routes retain displayed camera and positive room weights. |
| CS07 | Same1750ms camera budget; half-room bounded depth; at most3 rooms/6 variants; no added RAF/listener/timer owner. Browser diagnostics are opt-in and bounded. |
| CS08 | Raw signed-depth/full-pose assertions, wrong/static evidence negatives, both widths, history, native controls and retarget geometry. Existing full scene and current/historical runtime closure checks retained. |
| CS10 | Same issue/PR, accepted amendment, mapped READER/DELIVERY checks, registry/catalog/RI updates and exact final evidence in PR. No whole-criterion tick inferred from bounded checks. |

## Checks and remaining acceptance

- Root verification before final checkpoint: focused router/scroll-entry/admission80/80;
  complete scene61/61; current/historical Color and release-controller45/45;
  economical Basic passes with existing size/geometry budgets. Full scene generation
  preceded the diagnostic-only addition of complete from/to poses.
- Independent baseline selected94/94 tests passed while the actual missing flight
  was independently reproduced. Passing old tests did not settle the finding.
- Independent follow-up accepted bounded navigation source review:80/80 router/rows/admission,
  7/7 old/new scene cases,16/16 Color checks; after F09,1/1 preparation and3/3
  refreshed tuple checks. Independent F10 regression1/1 passed and its guard was accepted; final inspected
  lifecycle SHA256 is475aef8d16de5ab1674e8ab96176c541df66058c51d9a17ffdbd1c9855362c8b.
  Exact final source/browser run is recorded in PR79. Failed runs must remain visible; a pending hosted run is not acceptance.
- RI28/28 and RI/CI coupling20/20 passed; lint has zero errors and four
  complexity warnings in touched existing owner functions; no complexity waiver is added.
- Manuscripts, PDFs, media and selected material declarations remain unchanged.
  The initial navigation increment preserved all10c887e material code; the final
  follow-up preserves the separately corrected e276bb2 material owners byte-for-byte.
- Separate materials review at7ad7d4bd997aa503fc38b17df35805b59d4faf39
  (`review/issue-106/2026-10-19-independent-review.md`) originally reported P2 findings:
  revoked/private material retention in a new offline export and private-only
  allowlist changes invalidating public snapshots. They were subsequently corrected in concurrent parent be8421d/e276bb2, with focused independent material re-review; see review/issue-106/2026-10-19-corrections.md. This navigation follow-up preserves those exact owner sources.
- #5 remains open/Draft. Whole AC11, actual article/PDF/rights/device/publication,
  full staging admission, and AC16–AC20 production lanes retain their original gates.
  No main/stable/production promotion is requested or performed by this correction.

## Exact-source follow-up

Initial clean policy at7a5482bd reported8/10 checks passed: READER and
CONTENT-RELEASE both exposed the same stale isolated VM fixture in
`tests/site-articles.test.cjs`. It extracted save() without the router
historyIndex state; the production router already initializes that state.
The corrected fixture supplies an explicit ordinal and asserts its preservation.
No runtime/public bytes change in this follow-up. The failed source report is
retained; final clean-head policy and hosted evidence must be read from PR79.

## Issue synopsis

Reader document navigation now shares the fractal camera/route-block lifecycle,
with real bounded depth, correct Back/Forward and visible related-reading departure.
Independent review reproduced the old failure and required concrete retarget and
admission corrections. Use exact final PR/source/preview evidence; preserve the independently reviewed materials corrections and finish platform admission before a release decision.

Native alias follow-up integrates concurrent parent e276bb2 and preserves its material module/template/build/export owners. Exact final parent/head, regenerated runtime tuples and policy/browser evidence belong to PR79. Whole article/editorial/rights/device/release gates remain distinct.

Final native alias navigation SHA256: 79272658d952d9befc5107ca871bdb35cc0a082f7a9ba6458dfd9db6130784fd. Lifecycle retains the accepted475aef8d source. Final authored eight-path binding above includes the F11 correction.
