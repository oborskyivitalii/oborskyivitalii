# Issue106 — independent technical review, 19 October 2026

Owner: [issue106](https://github.com/oborskyivitalii/oborskyivitalii/issues/106#issue106-independent-review-20261019).
Execution: [PR107](https://github.com/oborskyivitalii/oborskyivitalii/pull/107),
with the existing reader hook in [PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Reviewer: `/root/independent_materials_review`, a separate AI reviewer in a fresh
context, read-only and without an implementation role. The implementing agent
reconciled findings and separately reproduced their relevant behavior. This is
independent technical AI review, not human editorial/rights/device/merge acceptance.

Inspected sources:

- PR107 `b0bf22e532341e28b83b7c5f17a9bf7df3a1825c`, tree
  `53b098d835270488cdde1595749d427fd9ddcc74`.
- PR79 `10c887e721d54d02ee0bb3438300cdcdf836f18f`, tree
  `1711ea7e007850686736b2ecc30bcaedd17af7c6`; materials increment compared with
  parent `7b3daba67da4e2bf6e35c640aa96f8b963785f5c`.
- Live issue106, both PR descriptions and workflow runs, standing source/style/
  acceptance contracts, material/campaign code and maintained tests, publisher,
  reader build, resource/rights and offline consumers. PR107 had no submitted
  GitHub reviews or inline review threads at inspection.

## Intent and verdict

The author requested repository-only working campaign sources, explicitly
selected public reader materials and reciprocal links to an actually observed
article. AC11 supplements original AC01–AC10; campaign completion must not block
article publication through PR79. A code inspection and passing fixtures do not
establish content quality or rights clearance.

**Request changes.** Three reproduced P2 correctness defects remain in the
implemented scope. The overall direction is sound, but this increment should not
receive technical acceptance until these paths have regression coverage and fixes.
No runtime, manuscript, PDF, media, test, budget or acceptance change is made by
this review-only checkpoint. Findings below remain open.

## Findings

| ID | Evidence/path at inspected head | Finding and implication | AC impact | Disposition |
| --- | --- | --- | --- | --- |
| F01 / P2 | PR79 `tools/build_site_previews.cjs:250–255,331`: `exportArticle` loads the publisher model and hashes only `model.inputs`; materials are added later by `tools/site/articles.cjs:54–74`. | A standalone export can repackage an old material after its review is changed or visibility is revoked, without revalidating the material selection. Its source manifest omits the declaration/review/material inputs. | AC11 review invalidation, selected-public/offline behavior; CS01/08/10. | Open; highest fix priority. |
| F02 / P2 | Shared `tools/site/article-materials.cjs:269,311–325`, PR79 `tools/site/articles.cjs:74`, `tools/site/build.cjs:367–393`. | Raw `materials.json` is always a public dependency, including private/unreviewed-only records. Editing a private description changes the public article and Writing snapshots despite an unchanged empty block. This violates the promised private-edit isolation. | AC11 private edits/public dependencies; CS01/02/08. | Open. |
| F03 / P2 | PR107 `tools/distribution/campaign.cjs:106–124`, especially118; distribution guide promises rejection of impossible windows. | Dependency validation checks a predecessor's authored lower bound, not the earliest time imposed by its own prerequisites. An impossible three-piece chain passes the current draft validator. | Implemented AC03/AC07 dependency-validation subset; CS04/08. | Open. |

## Reproductions and observed results

All probes used disposable `/tmp` fixtures and exact maintained fixture helpers;
no production source or implementation was edited. They exercise the actual
`build`, `exportArticle` and `loadCampaign` entry points. Existing broad policies
were not rerun merely to repeat their earlier green evidence.

**F01:** Create one reviewed synthetic PDF through the existing site-article
fixture; build its candidate and export it with `exportArticle`. The baseline
contains the material, but `manifest.sourceInputs` contains no materials input.
Change only `materials/reviews/reading-pdf.md`: shared `materials.load` correctly
throws `Stale material file/evidence digest`, while `exportArticle` still succeeds
with byte-identical HTML containing the old PDF. Set the item's visibility to
`private` without rebuilding: the export again succeeds with that same HTML.
Expected: refuse changed/revoked selected inputs and require a matching rebuild;
never silently label an old selection as a newly validated source export.
Both independent reviewer and implementing agent reproduced this sequence.

**F02:** Build a declaration with one `visibility: "private"`, `approval: null`
entry, then change only its description. Both builds have no `article-materials`
block. Nevertheless article versions change from `1132751e…` to `eff39814…`,
article HTML differs, and Writing HTML/snapshot, article alias/snapshot and
`site-revision.json` change. No private prose was found in public output; this is
unnecessary public invalidation, not demonstrated disclosure of private text.
The independent reviewer confirmed the dependency path; the implementing agent
executed the complete two-build reproduction.

**F03:** Validate these acyclic relative windows, in days after D0:

| Piece | Window | After |
| --- | --- | --- |
| A |10–10| none |
| B |0–10| A |
| C |0–0| B |

Actual: `loadCampaign` returns `readiness: "draft-only"` without an error. B cannot
precede day10, so C cannot occur on day0. This is not a request for a scheduler or
auto-publication: rejecting impossible windows is already promised by the draft
validator. Both reviewers independently reproduced acceptance of this input.

## What remains valid and what was not established

- One shared native template and explicit selection are preferable to directory
  discovery. Absent/private/unreviewed entries expose no material rows or files.
- Source/media/copy/review hashes and actual canonical-or-pending link handling
  provide useful consistency checks. They do not supply author or rights approval.
- The reader uses existing immutable resources and central rights/budget controls;
  no second public media store, browser parser or posting service was introduced.
- Existing campaign-path edits preserve public bytes in the maintained integration
  test. F02 is the different, previously untested private-allowlist-edit surface.
- Duplicate references to one selected file were investigated: build/snapshot
  verification pass and offline payload deduplicates them. No duplicate-offline
  failure is claimed. PNG magic checks are not a full decode/dimension audit;
  no additional blocker is asserted from that observation alone.
- The complete campaign kit, carousel renderer, observed publication/correction
  workflow and aggregate reports are explicitly unfinished, not newly discovered
  regressions. Backlink support currently returns a URL for future adapters; it
  has not inserted backlinks into previously exported PDFs or generated a launch kit.

## Ordered execution tasks

| Task | Paths and expected behavior | Finding / AC | Deterministic check | Status |
| --- | --- | --- | --- | --- |
| T01 | Offline exporter and shared selection: bind all selected material inputs to the public descriptor and refuse changed/revoked sources before export. | F01 / AC11 | Valid baseline exports; changed review/file/declaration, revoked visibility and removed material refuse stale packaging. | Proposed; not implemented. |
| T02 | Material/public dependency projection: hash only public selected state for route identity while preserving explicit build/release validation and audit evidence. | F02 / AC11 | Private/unreviewed-only edits preserve every public byte and route version; public selection changes invalidate the appropriate article. | Proposed; not implemented. |
| T03 | Campaign DAG validator: propagate the earliest feasible predecessor day through the dependency graph. | F03 / AC03/07 | Three-level impossible chain rejects regardless of piece ordering; feasible overlapping chains pass; existing unknown/cycle checks remain. | Proposed; not implemented. |
| T04 | Recheck exact corrected sources and return them for focused independent review. | AC10/11 | Maintained behavior negatives, owning policies, unchanged budgets/rights, affected native/offline/hosted cases. | After T01–T03. |
| T05 | Prepare one actual launch argument and carousel against the accepted article; review the smallest complete kit before the remaining campaign. | AC04–AC09 | Authored source/credits, usable rendered exports, mobile review, actual-or-pending canonical; no auto-posting. | Later, separate implementation step. |

T01–T03 remain in existing PR107/PR79 owners. No new issue, merge, release,
external posting or approval is created by this recommendation. Keep original
AC01 checked and whole AC02–AC11 unchecked; this review does not close them.

## Acceptance evidence and limits

| Scope | Actual evidence | Source/run | Remaining gate |
| --- | --- | --- | --- |
| Existing mapped source checks | Earlier exact clean-head policies5/5 and10/10 passed. Those tests miss F01–F03. | Inspected heads above; original PR evidence. | Correct behavior and rerun after fixes. |
| Hosted reference | CI39241358898 attempt2 passed4 room/5 article/2 Color observations; material links200 and SHA-matched. Attempt1 failed an intermittent observer read. | PR79 exact head above. | Not stale offline source or private-edit coverage. |
| Campaign/material adversarial review | F01 andF03 independently executed; F02 code path independently checked and full-build reproduced by implementation agent. | Exact inspected heads; disposable probes, results above. | All3 findings open. |
| Whole campaign and publication | Not complete, not merged, not released. | Live Draft PR107/PR79 and issue106. | Original author/editorial/rights/device/release decisions. |

## Issue synopsis

Independent technical AI review requests changes: stale/revoked materials can be
repackaged by offline export; private allowlist edits invalidate public output;
transitive impossible campaign windows pass. Preserve existing useful shared
contracts and pending campaign/publication gates. Fix the three reproduced paths,
then review the smallest actual launch/carousel kit.
