# R14 first independent Exploratory / Interaction QA result

## Verdict

**PASS for the bounded static reading and delivery-flow review. No blocking or nonblocking defect found in the inspected candidate.** This is candidate review for standalone R14 aligned to unchanged deck R9, not conference-final acceptance, measured rehearsal, presenting-device approval or public-release authorization.

Role/task handle: Exploratory / Interaction QA, `/root/r14_exploratory`, first judgment, 2026-11-02. The execution inspected sources directly and did not consult peer outputs, author conversation, parent scratch notes or unrelated memory. The parent must retain its actual launch-tool evidence; this reviewer cannot attest to unexposed fork/model/provider internals. Shared filesystem boundaries were operational, not OS isolation. Provider context and memory internals are unknown.

## Independent charter and bounds

Within the supplied four-minute bound, walk the actual static reading surface as a presenter: follow all nine sections in delivery order, assess transitions and economical spoken phrasing, compare S07/S08 with the native R9 delivery slides, and inspect all eleven candidate PDF pages for complete text, legibility, clipping and clear separation of unspoken material. Emphasize the architecture-to-commitment journey, the evaluation-to-operation journey, and the risk that shortening would remove important safety or human-capacity distinctions.

Executed locally with Markdown/XML reading, PyMuPDF extraction and in-memory rasterization, Pillow pixel comparison, and visual inspection of the supplied PNGs. No browser is applicable to this standalone static artifact. No implementation, tests, external writes or delegation were performed. Only this assigned receipt was written.

## Source identity

Repository: `oborskyivitalii/oborskyivitalii`; owner issue 109 / Draft PR 110; supplied base `6bd9e990251a6211f56ce6ba424960fe24879a71`. This review does not independently assert a clean checkout or live remote state.

All following observed SHA-256 values matched the supplied packet manifest:

| Source | SHA-256 |
| --- | --- |
| `review/issue-109/r14-input/candidate-manifest.json` | `56f4b69d2566cb2a7fc12925a4247a0d2e3b755f4feb13b1ce62759164ce2abb` |
| `review/issue-109/r14-input/request.md` | `942ea424d158d741b2814bfd71e6956ab4e676c69d63ece1d32a81e0db00c479` |
| `agents/reviewers/README.md` | `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` |
| `agents/reviewers/exploratory-interaction-qa.md` | `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a` |
| R13 stage-script Markdown | `8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84` |
| R14 stage-script Markdown | `ea00d981ee541d9316b371da51d26184e1635baa006915c1b1598b2b53b95403` |
| R14 stage-script PDF | `f5170f11d8276c279f95be73c52e0ab8b530fbc14f7ba9e9f0fa3a862091230c` |
| R9 native PPTX | `32e95f4382ba3913640a9229de4853f5cdbcafa55375c194e733a0826767f1a1` |
| R9 PDF | `52b97b711e8d1934833db0ce6aa0f21aa7b5a8406522393a8ee39ea7815b9277` |

The named scripts are under `drafts/devcon-romania-2026/`; the deck is under its `r9/` directory. R14 MD/PDF hashes were checked again at the end of inspection and remained the same. Applicable authority inspected included AGENTS, CONTRIBUTING's independent-review requirements, the acceptance owner entries for AC01/17/18 and the QA disposition section of `guides/SITE-CHECK-PROFILES.md`. The packet's original Ukrainian request and explicit speech-only scope were read directly.

## Executed journeys and observed results

| Journey / expected outcome | Observed result and evidence | Disposition |
| --- | --- | --- |
| Follow the R9 delivery order without broken references or unexplained topic jumps | The sequence is two problems; whole delivery; review/ownership; evidence; balance; decisions inside the product; architecture; operation; closing. Ownership provides a concrete concern before the broader evidence; evidence ends by returning to the whole delivery system. S06 introduces operating demands, S07 explains their architecture and commitment consequences, and S08 demonstrates continuing validation. No spoken backward reference depended on the old order. | Executed/pass |
| Preserve existing speech wherever no changed emphasis is needed | A direct body comparison after removing Markdown section separators returned `True` for R14→R13 pairs 1→1, 2→2, 3→4, 4→3, 5→5, 6→6, 9→9. | Executed/pass |
| Match actual native delivery slide 7, not its source filename number | `ppt/presentation.xml` relationship order resolves delivery S07 to `ppt/slides/slide8.xml`, titled “The Product Includes Its Control System.” Its architecture/project-commitment content agrees with the R14 S07 body. | Executed/pass; AC18 and speech amendment |
| Explain architecture and evidence before committing to delivery without reading every diagram label | S07 covers observation, comparison with goals/limits, decision, intervention and verification; external permissions and text disclosures; conditional human sensing/decision and their dependencies; full cost, simpler viable alternative, R&D/narrowing/no-go; and evidence before full-development funding. “A successful demo alone” preserves the demo's limited evidential value. Its final paragraph has a clear commitment destination. | Executed/pass; AC18 |
| Match native delivery slide 8 and move operation-specific human monitoring into it | Delivery S08 resolves to `ppt/slides/slide7.xml`, titled “Validation Continues During Operation.” R14 S08 moves from the 196/3/1 evaluation example to changed conditions, conditional exposure, outcome/control/response monitoring, and reduced authority, staffed fallback or pause. The human-monitoring list is no longer embedded in the planning slide. | Executed/pass; AC17 |
| Preserve important distinctions under concise phrasing | The 98% average cannot authorize the prohibited disclosure; shadow/canary evidence is conditional on acceptable exposure; preventive controls remain necessary; rollback cannot reverse disclosure. Human coverage, queues, workload, response time, information and authority remain explicit. The fallback is both tested and staffed. No sentence implies that online status guarantees effective control. | Executed/pass; AC17/18 and request constraints 3/5 |
| Keep spoken delivery economical and usable | Identical regex `\b\w+(?:[-'’]\w+)*\b` applied only to nine bodies yielded R13=1552 and R14=1530, a reduction of 22. S07/S08 use short paragraphs with clear actions; the few lists carry distinct control concerns. Delivery notes explicitly advise natural grouping of short sentences and selective explanation of the broader diagram. No additional rewrite is necessary for this static review. | Executed/pass; speech word budget |
| Reach the end of the script before nonspoken material | Slides 01–09 occupy pages 1–9. Page 9 ends with “Thank you.” Page 10 begins “Delivery notes - not spoken” and pages 10–11 have “NOT SPOKEN” footers. Sources and revision notes stay in the appendix. | Executed/pass |

## All-page visual inspection

Both contact sheets and each individual `page-01.png` through `page-11.png` under `/workspace/scratch/05b05f9b1c10/build/r14-pdf-render/` were viewed. All individual renders are 745×1053 pixels. Independent in-memory rendering of the hash-pinned candidate PDF with `fitz.Matrix(1.25, 1.25)` matched every supplied page pixel-for-pixel; no reliance on an unbound contact sheet was necessary.

| Page | Observed reading/layout result |
| --- | --- |
| 1 | Title, introduction and both problems complete; body contrast and paragraph spacing readable. |
| 2 | Densest spoken page remains within margins; final ownership sentence is complete and separated from footer. |
| 3 | Review/ownership section complete, including experiment caveat and technical-default qualification. |
| 4 | Evidence section complete; numerical claims and caveats remain readable with no clipped lines. |
| 5 | Balance section complete; recovery and differing operating-model conclusion visible. |
| 6 | Product-decision section complete; repeated testing, feasibility and operating-scope distinction visible. |
| 7 | Architecture title wraps cleanly to two lines; all six paragraphs, including final funding sentence, fit comfortably. |
| 8 | Runtime title and all paragraphs complete; response-capacity and final staffed-fallback lines are unobstructed. |
| 9 | Complete closing through “Thank you”; clear endpoint before appendix. |
| 10 | Ukrainian delivery notes, timing table and updated cues readable; no table collisions or clipped bottom paragraph. |
| 11 | Six source entries, caveats, revision explanation and historical-notes notice readable; visually distinct unspoken appendix. |

Spoken body size is 13.5 pt; appendix body is 10 pt and timing-table text includes 8.5 pt. These were readable in the inspected static render. Footer/header sizes are smaller as expected. No overlap, missing glyph, black-square substitution or clipping was observed.

Render verification diagnostic retained: an initial comparison inferred separate X/Y scales from already-rounded image dimensions and therefore produced mean absolute RGB differences of roughly 3.4–6.9/255. This was not treated as a content defect or pass. Using the uniform 1.25 scale that reproduces the exact 745×1053 raster yielded pixel equality for all eleven pages. No candidate or supplied render was changed.

Raw check outputs identifying key observations: execution chunks `7c441d` (native delivery relationship paths, text, 1552/1530 counts and initial raster diagnostic), `a15bda` (eleven `EXACT_RENDER ... True` results and final PDF hash), and `e35f1d` (seven `UNCHANGED_BODY ... True` results, AC01/17/18 intent and final MD hash). The visual tool calls displayed all eleven individual pages in two batches.

## Findings, limits and disposition

No severity-bearing finding. Risks actually examined were reordered transitions, architecture/runtime emphasis drift, diagram over-explanation, shortened control caveats, infeasible human fallback, page overflow, wrong page order, appendix accidentally becoming spoken text, and stale rendered evidence.

This review observes reading quality and intended spoken flow; it cannot establish audience comprehension, physical readability on the presenting device, actual speaking pace, or the presenter's comfort with the wording. Those are **not observed**, and the existing author/rehearsal/device gates remain pending. A browser, focus traversal, network-error recovery and live application runtime are **not applicable** to the delivered standalone static reading surface. Link destination availability was not checked; no new research/source verification was requested. R9 S07/S08 were inspected through native relationship order and text, not claimed as a new all-deck visual/device campaign.

Per `SITE-CHECK-PROFILES`, retain these source-bound static observations as manual review evidence under issue 109's R14 speech owner; no automated suite/profile/workflow or duplicate campaign is proposed. The remaining scenario is a full spoken run with real slide changes on the actual presenting device, owned by the author under the existing rehearsal/device gate. That scenario is proposed/pending, not executed here. This first result should be preserved before reconciliation; a relevant candidate change requires affected re-review.
