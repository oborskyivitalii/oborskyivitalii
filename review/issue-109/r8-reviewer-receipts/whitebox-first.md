# R8 — independent White-box QA, first result

**Verdict: bounded artifact checks PASS; one low-severity provenance correction.** No blocking package/content defect found in the three allocated checks. This is not presenting-device, author, release or general-runtime approval.

## Identity and inputs

Reviewer `/root/r8_whitebox`, nonauthor first execution. Requested launch: explicit `fork_turns="none"`; model/effort omitted. Accepted launch evidence belongs to the orchestrator; provider model/context/memory internals remain unknown. No peer reports, preflight, MEMORY or private history read; no delegation or implementation changes.

Prepared dirty subset, repository `oborskyivitalii/oborskyivitalii`, issue109/PR110; base `1044c6ee6effc3580ec735ead4f4f7f9ea26a069`. Packet SHA256 `8211010cbaac9790cc7b1e66f2d69995decb4f11fd189e391e4ea0bdf0913a5a`; every listed byte hash independently matched. Common prompt `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`. Sources include request.md, current AC17/18 and artifact/preservation gates, actual R7/R8 PPTX/PDF, notes and manifest. R8 PPTX SHA `ee370d10570f43b4ff09d262927428af6a5ee4cd5c7823268fcd2422813cc3fe`; PDF `d8511c35d69e1b79886670901db794ecc66679f4cb0da46d3350fea7f33c4f7f`.

## Risk → check → actual outcome

| Requirement / structural risk | Independent oracle and executed check | Result |
|---|---|---|
| Preserve scope/order/notes; accidental ZIP dependency changes | Python zipfile + ElementTree compare R7/R8 payloads, relationships, presentation order and note text prefixes | Identical part sets; ZIP integrity clean; exactly slide7/8 and notesSlide7/8 changed, 54 others unchanged; all23 relationship parts identical; order1,2,4,3,5,6,7,8,9; all9 text prefixes preserved. |
| Exact native/PDF correspondence; unrelated visual regressions | PyMuPDF page extraction against native text using actual presentation relationships; raster comparison with retained R7 | Nine pages; every native text run found on corresponding PDF page after Unicode/alphanumeric normalization; seven unchanged pages pixel-identical at1921×1080. |
| AC17/18 missing visible concepts or invalid enum | Inspect native text, PDF text and paragraph alignment values | S07 people availability/workload/queue/response; S08 sensors/controller/actuators/system, constraints, human dependency conditionality and demo/business evidence present; native shapes64/40, pictures0/0; alignments legal ctr/l/r. |

Raw results are in this execution's tool outputs. Final assertions exited0. One preliminary correspondence probe assumed physical part numbering; follow-up corrected it to presentation relationships. A separate probe initially mishandled absolute relationship targets (exit1), corrected before final assertions; neither indicates a candidate defect. No broad suite or new engine ran.

**Low finding:** `r8/edition.json:pdf_export.method` incorrectly says exact final **R7** PPTX. Correct to R8; this contradicts the R8 export provenance requirement despite actual correspondence passing.

Limits: normalized text presence is not layout proof; PowerPoint UI, physical projection, live links and timed rehearsal unobserved. Supplied import diagnostic/finalization claims were not counted as independently executed importer approval. Dynamic application states are absent from this static-artifact delta. Owner: orchestrator ARTIFACT-REVIEW/GENERATION-PROOF; device gates remain human.
