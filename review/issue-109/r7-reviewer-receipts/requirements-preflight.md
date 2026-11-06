# R7 requirements and acceptance preflight

## Independent result

**Verdict: PASS for the bounded R7 reorder implementation, with mandatory acceptance-map corrections before candidate acceptance.** The user has clearly authorized exchanging the current R6 positions 3 and 4. No additional owner decision is needed to perform that exchange. This is a preflight result, not acceptance of a completed R7 package, author approval, event selection, rehearsal, merge or publication.

**Editorial assessment: the swap is worthwhile.** The proposed sequence reads more coherently as system imbalance → review/understanding and ownership → qualified empirical signals → contextual responses. This judgment comes from direct inspection of the native slide text and attached speech for source slides 2–5, the corresponding PDF text, and the separate R13 script. It does not adopt the author’s preference as an acceptance oracle.

Reviewer: distinct nonauthor Requirements & Acceptance execution `/root/r7_requirements`; first preflight judgment, before peer reconciliation. Launch parameters reported in the task: explicit `fork_turns="none"`; no model or effort overrides. The launch acceptance/tool receipt is held by the orchestrator and was not independently visible here. Provider model/context internals and platform memory injection behavior remain unknown. No private conversation, MEMORY, current peer output or historical review verdict was opened. Repository README rationale was treated as a claim about the source package, not an independent verdict.

## Actual narrative inspection

The R6 source slide 2 explains the 8→100 generation thought experiment, fixed downstream capacity, admission control and the user’s capacity to absorb change. Its R13 speech explicitly introduces exchanged knowledge/artifacts and ends with a system problem that was never recognized or assigned an owner. Moving the ownership slide immediately after it develops those exact subjects: review both checks quality and helps a team understand its system; responsibility persists when the ability to maintain or recover weakens. The visible lower lifecycle illustration then returns the local code/review example to the complete SDLC. This is a coherent continuation of slide 2.

The ownership slide carries its own limited experiment and explicitly states both in the slide and speech that it concerns short individual tasks, not whole-team ownership. Consequently, putting it before the larger evidence page does not leave its empirical example without qualification. Its illustrative gap and technical-default risk must remain conditional.

The evidence slide then separates activity, flow, stability and maintainability. Its spoken opening warns that reports concern different populations and outcomes, and its ending asks the audience to assess the whole delivery system. Placed directly before source slide 5, that conclusion sets up the response: compare useful outcomes and full cost with a baseline, limit incoming work, test agents/docs/disposable implementations, preserve recovery and allow different operating models.

The tradeoff is that the ownership explanation and technical-default risk now precede the broad research survey. A listener might overread the next page as proof of every preceding systemic risk. The existing warnings about proxies, different populations, non-causality, illustrative curves and short tasks are therefore essential. This is an editorial risk to check in the final delivery, not a reason to reject the swap. The old order introduced broad evidence sooner but interrupted the connection between delivery imbalance and its ownership mechanism.

No spoken transition requires a rewrite. All four spoken sections start and finish intelligibly in the proposed order. Source slides 2 and 4 both mention license/training-only adoption, now closer together; this is mild existing repetition with a consistent purpose, not a new contradiction. Keeping approved R13 wording is proportionate.

### Non-spoken transition notes to disclose

1. Source R6 slide 4 native notes, first paragraph after `REFERENCE NOTES AND SOURCES`: “Our research examples measured activity, merges, releases and structure, not how well a team understands its system.” In R7 position 3 the larger research survey has not yet appeared. This sentence becomes anticipatory, although it remains factually about the presentation’s examples and is explicitly outside the stage script.
2. The same source note later says the wider system “brings us to the next question of what can replace manual inspection.” The evidence page will intervene before the response hypotheses on slide 5. This is a weaker immediate transition in the reference notes, also outside the spoken script.

**Treatment:** disclose these two unspoken continuity effects, preserve the R13 spoken text, and retain source note wording unless a separate explicit transition correction is authorized. Neither is a blocking spoken conflict or permission to rewrite the talk. Reorder notes with their semantic slide and update delivery position labels only.

## Required invariants and acceptance mapping

| Intent / stable AC | Required observable check or gate | Preflight observation / next evidence |
| --- | --- | --- |
| User reorder; AC01–AC04 | Exact source-position mapping `1,2,4,3,5,6,7,8,9`, nine native slides and nine matching notes; PDF exported from that exact PPTX | Source package has nine declared slides; R7 not yet produced. Check actual relationship order, PDF page order, visible numbers and notes association on final candidate. |
| AC02, AC13, AC14 | Preserve slide content, layout, drawings, media, source caveats and relationships, allowing only ordering and delivery-number/label changes | Native source slides 2–5 and PDF text inspected. Compare exact source components or normalized semantic payloads and rendered pages on final candidate. Do not require entire PPTX byte identity when order changes. |
| AC01, AC04 and slide ACs | R13 spoken sections retain exact wording while their delivery order follows the new deck | Standalone R13 and native spoken sections 2–5 agree by inspection. Preserve the standalone historical script bytes; document the source-section → current-position mapping in R7 notes/manifest. |
| AC13: evidence | Keep AC13 meaning, now **R7 position 4 = R6 position 3** | AC13 currently names S03. Correct its current-position description without renumbering AC13 or changing its scientific boundaries. |
| AC14: review/ownership | Keep AC14 meaning, now **R7 position 3 = R6 position 4** | AC14 currently names S04. Correct its current-position description while retaining all approved slide content and its caveats. |
| Existing slide gate IDs | Preserve gate lineage and make source and current position explicit | Recommended stable mapping: `SLIDE-03-ACCEPTANCE` continues evidence content, now R7 S04; `SLIDE-04-ACCEPTANCE` continues approved ownership content, now R7 S03. State that numeric IDs retain historical source identity. Do not silently reinterpret an old approval as approval of whichever content now occupies its number. |
| AC04, AC05, AC09 | R7 native/PDF/notes/manifest/index, exact hashes, predecessor source, existing issue109/Draft PR110, reproducible generation | Current AC04/05, all automated-scope boilerplate and several gate descriptions still target R6. Refresh current-target references to R7 while preserving R6 historical provenance and obligations. |
| AC03, AC05 | Four distinct completed reviews on exact final candidate; bounded mapped checks; current path catalog/RI | This preflight cannot substitute for completed final Requirements, Code, White-box and Exploratory results. |
| AC06, AC08 | Exact package author approval, timed rehearsal/device acceptance, explicit event selection | Remain pending; no implied conference-final status. R3 event binding remains unchanged. |
| AC07, AC10 | Final QR evidence and any unchanged/reused workflow evidence remain bound to the actual source | Unaffected semantics do not automatically establish final-PDF QR decode or missing reuse evidence. Reuse only demonstrated unchanged evidence. |

Visible page numbers must become 01–09 in delivery order, including 03 on the former ownership slide and 04 on the former evidence slide. Native note heading numbers and the human-readable R7 notes should use delivery positions while preserving a source-R13-section mapping. Internal OOXML filenames may remain source-based; their filenames are not evidence of display order. The final check must follow presentation relationships.

The earlier approval identified source R6 S04 / the approved ownership donor. After the swap it belongs to R7 S03’s content lineage. It must never be presented as approval of R7 S04’s evidence page or of the complete R7 export. Keep that scope explicit in SOURCE-RIGHTS-REVIEW, AUTHOR-ACCEPTANCE and all slide-gate descriptions.

## Findings and severity

**R7-RA-01 — Medium, acceptance before final candidate:** `.github/acceptance/issue-109.json`, AC04/05/06, repeated `automated_scope`, ARTIFACT-REVIEW, DELIVERY-LINKAGE, GENERATION-PROOF and related gate wording still describe the current package as R6. If retained, evidence could be attached to the wrong edition. Treatment: append the dated R7 reorder scope and update current-target metadata while retaining predecessor facts, stable IDs and human gates.

**R7-RA-02 — Medium, acceptance before final candidate:** the same file’s AC13/AC14 and SLIDE-03/04 gates currently conflate semantic content with source position. Source R6 notes also have old positional labels. If only the slides are swapped, the acceptance record or notes can point to the wrong material. Treatment: explicit original-content/current-position mapping, corresponding note associations and visible number checks; keep prior approval bound to the ownership content.

**R7-RA-03 — Low, disclosed editorial limitation:** source R6 slide4 reference-note transitions listed above anticipate material that becomes later or no longer immediately adjacent. No stage-script conflict was found. Treatment: report this limitation, preserve spoken wording and do not expand the change into a speech rewrite.

No blocking ambiguity remains about the requested order or permissible scope. The medium findings are required metadata/traceability work within the authorized iteration; they are not grounds for asking the user to repeat permission. Any substantive speech change discovered in implementation would require returning to Requirements with the actual conflict.

## Edition identity

Use `drafts/devcon-romania-2026/r7/`, `devcon-romania-2026-r7.pptx`, `devcon-romania-2026-r7.pdf`, `speaker-notes.md`, and `edition.json`. Repository edition **R7** is distinct from speech revision **R13**. R6 is the immediate complete predecessor at `75ca39219685dc279ec8301ed7602d4769201b3f`; keep its bytes and every earlier retained artifact immutable. The inspected edition directories include r2/r3/r5/r6, so the maximum retained revision is 6. Status remains author-review-draft. Record slide order, source pins, hashes/counts, unchanged R13 script identity, timing limits and event selection separately.

## Exact inputs, checks and limits

Packet: `/workspace/scratch/d8b65f68acc8/devcon-r7/preflight-packet.json` SHA-256 `090afb08d2bbd0cfce886ea99e00ae634772b8da71d246fc336dc24563d3e758`. All 13 referenced files were byte-size/SHA-256 verified with zero mismatches. Git HEAD independently read as `75ca39219685dc279ec8301ed7602d4769201b3f`; the packet’s clean-checkout statement was not independently re-audited with `git status`.

Common prompt SHA-256: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
Role prompt SHA-256: `010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6`.
CONTRIBUTING SHA-256: `804fb3da9a0bc7369bbd902313224221becc6c6b775536ca943f8664bf741442`.
Request SHA-256: `61ec228672cdc8717c2769f7338f49b0c05c9b890a2b8a37f096cfecea26e0e3`.
AC owner SHA-256: `b4ece808f9882bf81c9ac86e980427c4a3f502793a8799e3e69a87cc7670ba3b`.
R6 PPTX SHA-256: `b3269196b0eac9dde5fd58706e16a6e84cff4bc2b3e3b368a634087b1cc5eef9`.
R6 PDF SHA-256: `8d070574648dbc640b30e4fb4e996ee9992664c332b762297b13bf5b8532fa20`.
Standalone R13 SHA-256: `8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84`.

Actual checks: native slide XML text and attached notes for source positions 2–5; PDF text extraction pages 2–5; corresponding R13 sections; all AC intents/gate mappings; repository edition/versioning instructions and current index; whole packet hash/size verification. No final R7 candidate, generated export, visual screenshot inspection, presenting application, physical device, timed human rehearsal or live external issue/PR state was observed. No external scientific source re-audit is claimed; this is a bounded source-preserving order review. No implementation, tests, external writes or delegation occurred. Only this assigned review artifact was written.

Next gate: implement the authorized reorder and metadata corrections, then provide the exact final candidate and delta for independent final-candidate Requirements review alongside the other mandatory roles. Preserve this first result unchanged.
