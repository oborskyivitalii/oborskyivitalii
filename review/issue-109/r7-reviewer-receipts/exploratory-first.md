# R7 exploratory / interaction QA — first independent result

**Reviewer:** `/root/r7_exploratory`, distinct nonauthor. **Date:** 2026-11-02. **Phase:** first judgment before reconciliation. **Verdict:** pass for the bounded reorder, visible-flow and notes review, with two nonblocking editorial/delivery observations. This does not close author acceptance or physical/timed delivery gates.

## Isolation and authority

The assignment reports an explicit `fork_turns="none"` launch. I did not independently observe the caller's accepted launch parameters; the orchestrator must retain that execution receipt. Provider model/context internals and potential platform memory injection are unknown. No author conversation, private history, MEMORY, parent scratch notes, current peer results or preflight verdicts were consulted. Candidate claims were treated as review subjects. Hashing packet-listed files establishes identity, not their assertions' truth.

The primary request is to swap R6 displayed slides3/4 and assess whether it improves the talk, preserving content/layout and speech while synchronizing numbers/notes. The candidate is a prepared subset in an intentionally dirty checkout, not a clean commit. The reported base is `75ca39219685dc279ec8301ed7602d4769201b3f`; remote PR/commit/publication state is not established by this review. Original request and AC01–AC19 were read.

## Verified input identities

| Input | SHA-256 |
| --- | --- |
| final-candidate-packet.json | `5d5d4d4e48626c67b8c6efff066309c61b590bf20c8c9d019db3eaae936abc92` |
| Common prompt agents/reviewers/README.md | `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` |
| Role prompt exploratory-interaction-qa.md | `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a` |
| Primary request | `61ec228672cdc8717c2769f7338f49b0c05c9b890a2b8a37f096cfecea26e0e3` |
| Issue109 AC source | `5127a6003b4d425005c7470283758e8c412ce394ad8860c1f1e92f8245298eaa` |
| R7 PPTX | `ec8478a8c55d7db17a922e761a137759cb4c2de86b135f9153b709f76c7a9b29` |
| R7 PDF | `7056f7423652563aaeafe722a22ab6b139e77c4e630710dd90eaf02aa59d8517` |
| R7 notes | `0d98a801a8f1af30ecf1716c37bff8a819cc19cb31eea4fd876f409560373945` |
| R6 PPTX comparator | `b3269196b0eac9dde5fd58706e16a6e84cff4bc2b3e3b368a634087b1cc5eef9` |
| R6 PDF comparator | `8d070574648dbc640b30e4fb4e996ee9992664c332b762297b13bf5b8532fa20` |
| Standalone R13 script | `8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84` |

All 33 packet-listed files matched supplied digests; the later identity recheck also matched. Full source inventory is the hashed packet at `review/issue-109/r7-reviewer-receipts/final-candidate-packet.json`.

## Charter, environment and executed cases

Independent charter: inspect nine-page reading/navigation, zoom into slides2–5, trace numbering and notes, assess the changed spoken transitions. Target budget approximately three minutes; bounded to nine overview pages, four detailed pages and small source checks, without a separately captured wall-clock measurement. Surface: presentation/PDF reading, not a browser implementation. Linux Python ZIP/XML, PyMuPDF and Pillow; supplied R7 PDF raster images. Runtime/presentation/PDF skill guidance consulted. Environment-status tool was searched but not exposed; no network work occurred.

| Case | Expected | Observed / disposition |
| --- | --- | --- |
| Nine-page overview | Complete deck, no missing/broken page | Viewed contact sheet of `build/renders-r7/slide-01.png` through `slide-09.png`. All nine present with consistent title/margin treatment. Pass at observed surface. |
| Journey 2→3→4→5 | Coherent revised argument | Viewed all four full size and read exact R13 speech. Coherent with tradeoff below. Pass. |
| Visible numbers | 01–09 in current order | Ownership shows03; evidence shows04; all nine sequential. Pass. |
| Native source order / notes | 1,2,4,3,5,6,7,8,9 with matching attached notes | Parsed presentation relationships and slide note relationships. Ownership slide4.xml is delivered third and evidence slide3.xml fourth. Their notes remain attached, headed03 and04. Pass. |
| Preservation | Only order, number and note heading differ | ZIP name sets equal. Exactly five parts differ: presentation.xml, slide3.xml, slide4.xml, notesSlide3.xml, notesSlide4.xml. Native note text deltas are exactly heading-number swaps. This supports preservation; not a general renderer guarantee. |
| PDF order/content | Nine pages matching R6 source order | Both PDFs have nine pages. All nine extracted page texts match prescribed R6 source positions after removing delivery numerals. Pass. |
| Spoken wording | R13 preserved in reordered notes | All nine Markdown Stage script bodies match original R13 exactly after explicitly excluding native nonspoken label/title and final Markdown separator. Pass. |

Raw tool evidence is in this task's responses. `aae67a` preserves a reviewer-harness KeyError: a notes relationship target was absolute, so naive joining duplicated `/ppt`. Corrected absolute/relative resolution produced the successful notes/PDF checks in `0a368b`. Initial Markdown comparisons (`32dc5d`) included native label/title metadata; diagnostic diff `459c03` identified it. The subsequent final-section difference (`231e24`, `95414e`) was a trailing Markdown rule. Explicitly excluding those nonspoken boundaries yielded nine matching spoken sections. Those preliminary failed checks were harness comparisons, not silently discarded product failures.

## Nine-page visual record

1. **Opening:** HOW/WHAT halves, official title, artwork and author/event footer remain coherent.
2. **Whole system:** 8/100/+92 story clear; fixed-capacity/admitted-work premise, WIP qualification and user-feedback link visible.
3. **Ownership:** comparison row and five systemic functions, local graph, What if not? questions, ownership consequence/definition, qualified experiment and lower lifecycle graph all visible. No clipping or overlap at full size.
4. **Evidence:** distinct research panels and sample/tool qualifications remain visible. Elapsed-time, survey-association and proxy/causality caveats are present. Dense statistics require selective narration.
5. **Rebalancing:** six cards clearly separated; questions, context-specific model language, no-agent possibility and recovery/responsibility line visible. No card collision.
6. **Runtime:** explicit/model comparison, account-recovery framing and requirements/bug/readiness table coherent at overview; no clipped block observed.
7. **Hypothesis:** 196/3/1 and disclosure veto visually dominant; bounded exposure and service/behavior/control distinctions visible.
8. **Control system:** prevention path and feedback loop remain distinct; human capacity, viability and no-go choice visible.
9. **Close:** distinct HOW/WHAT actions, both project names, one visually intact QR and readable homepage URL. This role did not decode the QR.

## Editorial judgment from actual content

**Keep the swap.** Slide2 makes review's unchanged capacity concrete and ends with overload, quality and an unowned system-level problem. New slide3 immediately explains why review protects understanding, maintenance and recovery. Moving from the Code/Review nodes to the comprehension graph is a useful visual zoom-in. The lifecycle strip then returns the argument to the whole SDLC.

New slide4 asks what measurements establish after listeners understand the mechanism and risk. Its opening explicitly distinguishes study populations/outcomes; its closing “assess the whole delivery system” naturally precedes slide5's experiments, baseline and full-cost comparison. Evidence now serves as the bridge to countermeasures.

The original order gave broad evidence before ownership interpretation and put ownership immediately beside remedies. The swap introduces an additional risk argument before the wider evidence and puts a quantitative survey between ownership and remedies. This is acceptable because ownership has its own qualified experiment and calls technical default a risk to investigate. The evidence must not be delivered as proof of that entire causal chain.

## Findings and treatment

| ID / severity | Source and mechanism | AC impact / treatment |
| --- | --- | --- |
| E1 — low editorial tradeoff | R7 notes slide03 final paragraph → slide04 opening; rendered03–04. “Technical default” closes a strong warning; “These reports examine different populations…” resets to evidence without a spoken bridge. Small tonal discontinuity; no contradiction or stale cross-reference. | AC03 assessment satisfied by reporting. Preserve authorized speech. Author rehearsal should check whether a pause and the evidence title make the transition clear. An optional new spoken bridge is a separate editorial change; none requested here. |
| E2 — medium inherited delivery risk; nonblocking for swap | R7 slides03–04 contain small source qualifications, multiple graphs/cards and dense figures. Legible at supplied full-size raster, but subordinate text shrinks rapidly in overview. Physical-distance readability and listening comprehension unobserved. | AC03/AC06: no projection-readiness inference. Preserve approved layout. Author/presenter owns device/projection checks and selective narration of evidence figures. No layout rewrite requested. |

## Test disposition and limits

Following `guides/SITE-CHECK-PROFILES.md`, retain these cases as issue109 manual artifact-review evidence, not a new browser/hosted suite. No automated regression is proposed for the nonblocking observations. Proposed, not executed: author walkthrough of 2→3→4→5 at natural pace and projection-distance reading of slide03/04 caveats; owner author/presenter; map to AUTHOR-ACCEPTANCE and AC06.

No native PowerPoint UI, animation behavior, physical device/projector, live QR scan, timed author rehearsal or human audience observation was available. Browser interaction is reasoned not applicable because no browser implementation changed. Inaccessible native/physical surfaces remain not observed, not N/A. Supplied renders were inspected; this role did not independently re-export them. Scientific source correctness beyond preservation of visible qualifications, remote linkage and release are outside this bounded review. These limits prevent a whole-conference-readiness claim but do not identify a blocking reorder defect.
