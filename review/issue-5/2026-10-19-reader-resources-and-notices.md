# Issue 5 — 19 October 2026 reader resources and notices

Owner: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5),
execution: [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Codex implementer self-review; no independent/editorial/legal approval claimed.
Prepared source incorporates main0098f804 and the concurrent editorial R12 head
7ebb17c52ccd0d0550d7662ff25df42441374c89 by normal merges. All protected
editorial/media/review files match that R12 head exactly; this chat edits no prose.
Exact committed source/checkpoint is linked from the issue and PR after checks.

## Intent and acceptance

The maintainer authorized the next bounded reader increment after the separate
PR105 analytics release. Article writing/editing is excluded and continues in
another conversation. Preserve original #5 criteria and #2 editorial/rights gates.
No production activation, main merge, account/DNS/security change or article
publication is authorized or performed here.

## Findings

| ID | Evidence / owner | Finding and implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | Generated R10 reader; `tools/site/fallback.cjs` | Repeating53744B of decorative SVG in every article causes HTML overflow. | AC02/08/12 | Share exact generated geometry through one immutable SVG group. |
| F02 | `tools/quality/artifact.cjs` | Removing inline path data must not hide resource bytes or SVG node cost. | AC03/08/12 | Count external geometry, instantiated group, transfer and resource inventory. Budgets unchanged. |
| F03 | `tools/site/offline.cjs`, standalone producer | External SVG references cannot be relied upon from a file URL. | AC03/08 | Verify and inline passive geometry in standalone output; derive its body-media inventory without changing runtime hydration. |
| F04 | Article reader and release rights owners | Linked-metadata-only policy cannot describe hosted article bodies/media. | AC01/03/10/12 | Exact edition/source/semantic notices, resource credits and source provenance; pending clearance stays explicit and cannot enter production. |
| F05 | Current R12 complete delivery | After fixing raw HTML, its unchanged supplied image/PDF set exceeds the800000B transfer limit. | AC02/08/12/14 | Current hosted preview remains blocked. Do not weaken the guard, omit charged assets or call source generation hosted acceptance. |
| F06 | Current release/controller and protected roots | PR79 predates PR105. | AC08/11/15 | Normal merge preserves shipped alias analytics/staging protection; all protected R12 blobs match7ebb17c5. |

## Decisions

- Canonical scenes/CSS remain the only owners. No geometry simplification, prose
  shortening, new animation loop, wildcard imported SVG or higher byte budget.
- Generated `article-media/<digest>/writing-fallback.svg` contains only the exact
  Writing geometry. Hosted `<use>` inherits theme paint; offline embeds validated
  geometry. An actual browser fallback assertion checks nonempty rendered bounds
  in no-JS/no-Canvas/Off journeys when the candidate reaches hosted admission.
- Exact-edition notices display source/semantic identity, current rights state,
  per-image credits and presentation source. Frozen reports bind their digest,
  source inputs and complete resource/document closure. Existing site license
  exclusions and human approval requirements remain effective.
- New Color tuples retain all five prior runtime bytes and historical contracts;
  only source-derived producer/edition identities change. This is source parity
  and self-review, not a new independent or hosted performance approval.

## Sol tasks

| Task | Owners / expected result | AC / finding | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Fallback/build/offline/artifact: exact shared resource and honest costs | AC03/08; F01–F03 | Geometry identity, missing/corrupt/passive-vocabulary negatives, offline and delivery suites | Implemented; exact final checks linked in issue/PR |
| T02 | Reader and release rights: exact visible edition notices | AC01/03/10; F04 | Pending rights, source/notice substitution, hidden notice, frozen copies and production rejection | Implemented; no rights acceptance invented |
| T03 | Main reconciliation, outputs and source inventories | AC08/11/12/15; F06 | Basic, style, formatting, RI/CI, source selection and protected blob comparison | Exact final checks linked in issue/PR |
| T04 | Current R12 immutable hosted preview | AC02/08/12/14; F05 | Existing complete transfer guard, then real browser journeys | Blocked by unchanged media transfer; not deployed |

## Acceptance evidence

The companion JSON is a prepared diagnostic with exact implementation hashes,
not a publication record. Temporary synthetic source IDs used by the inventory
harness are deliberately not exported as a real clean commit or release identity.
Final source-qualified check results are retained in the issue/PR checkpoint.

- The earlier R10 technical source f59a265 preserved all54 original blobs and
  reduced its alias to64167B/snapshot64275B. The concurrent R12 handoff is now
  consumed unchanged; current source SHA256 is `46ff6a07e8f60119dcf6be352a3d642348c0c2b6f54f348b7b60d599f6f71276`.
- Current R12 alias **61747B**, immutable snapshot **61849B**,
  against unchanged100000B. The like-for-like original R10 comparison above
  does not attribute editorial R12 text changes to this optimization.
- Complete SVG cost **137 nodes** against250; generated resource raw
  **53669B**, gzip **17285B** remains charged.
- Complete R12 route transfer **1702475B gzip** against800000B.
  `Article transfer size pmday-ai-both-sides:en` is a real remaining failure.
- Current exact-edition inventory compiles with inventoryPass:true and
  approvalPass:false; this does not pass the article delivery gate.
- Current-source hosted theme/mobile/no-JS/history/navigation and actual SVG paint
  observations remain pending. No current immutable hosted preview is claimed.
- Existing #5 AC14 stays unchecked. AC11/12 and #2 human/publication gates remain
  open. Existing AC13/15 are not expanded into independent production readiness.

CS01/02/04: canonical content/scene/runtime/build owners remain separate, generated
copies are rebuilt and shared geometry has one owner. CS03: theme paint and CSS
stay canonical; no new authored inline style. CS05: pinned formatter on touched
sources. CS06/07: no lifecycle loop/change or budget increase. CS08/09: meaningful
resource/rights negatives and bounded style guard; no source pass substitutes for
browser execution. CS10: issue5 AC11 owns style evidence; all review is self-review.

## Concurrent R12 handoff

The editorial chat supplied R12 while this technical increment was running.
Normal merge retains its manuscript, metadata, profile, edition, draft, blueprint
and review notes byte for byte. R12 explicitly leaves selected cover02 image
import pending; that remains an editorial/media handoff, not a completed cover
replacement here. Existing supplied images and PDF are unchanged.

## Next bounded increment and plan reassessment

Optimize generated web-media renditions while preserving original source assets,
figure content, credits and edition semantics; verify actual reading quality.
The images and presentation are now the concrete transfer blocker. This remains
part of #5/PR79, not a new umbrella issue or a rewrite of every page. Keep the
800000B complete-package budget unless the maintainer separately selects a
measured resource-policy change. Then produce the current immutable hosted
preview and perform the already-declared bounded browser/platform admission.

After preview/editorial/rights acceptance, obtain the actual first-publication
release decision and use the existing protected controller. Independent content,
media and platform production lanes (#5 AC16–AC20) follow the accepted baseline;
no runtime microservices are selected. #102 article analytics follows the declared
reader routes. #104 conversions, #6 harness and #11 guides retain that dependency.

## Issue synopsis

Reader raw HTML and hosted exact-edition notice plumbing are implemented. The
current R12 matches the editorial handoff unchanged and now passes its raw HTML limit; its complete media
transfer blocks hosted preview. Production stays at prod-2026-10-19.1. Next:
generated media optimization, then current hosted acceptance and first release.
