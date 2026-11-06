# R6 first independent Exploratory / Interaction QA result

## Result and boundary

**Verdict: one bounded visual correction requested before an unqualified full-deck visual pass.** The requested slide 4 integration passes the inspected visual and source-preservation checks. The full nine-slide sequence, spoken-note continuity, closing hyperlinks and QR payload pass the checks below. Slide 5 has a localized heading/description spacing defect, detailed as E01. No slide 4 change is requested.

This is the first independent judgment of `/root/r6_exploratory_review`, a distinct nonauthor Exploratory / Interaction QA execution. It precedes peer reconciliation. I authored no implementation or accepted tests, made no external writes, and did not delegate. The only written artifact is this report.

Launch facts supplied in the task: actual `fork_turns="none"`, model and effort omitted. I did not independently observe the spawn tool response; the orchestrator must retain that execution receipt. Provider model/context internals and provider memory injection behavior remain unknown. I did not read parent conversation, current peer results, MEMORY, or unrelated scratch notes. The neutral v2 source supplement and later source-formatting notice are disclosed below.

The candidate is a **prepared artifact subset, not a clean Git checkout**. Repository owner: `oborskyivitalii/oborskyivitalii`, issue 109, Draft PR 110. Packet base: `8cf15883125892710633b17133d9ee0fc4b23b92`; previous PR head: `327ec57d9c4b7539d83631204b91bdc36545c862`. This review does not establish repository delivery, event selection, merge, public release, author acceptance, or physical presentation readiness.

## Charter and bounds

Independently derived charter: walk the deck as an audience member from the two-problem opening through the HOW/WHAT transition to the final call to action; check that every slide has a legible hierarchy and that the new slide 4 comparison leads into its local and lifecycle graphs without clipping, confusion, or loss of accepted material. Then walk the presenter handoff: nine corresponding native notes, exact R13 spoken continuity, clearly separated supporting material, and usable closing destinations.

Bound: **8 minutes, 12 cases**. Initial recorded source-integrity check: 2026-11-02 10:10:09 UTC. Final artifact/source recheck: 10:14:42 UTC. Review and report completed within the bound. The twelve cases below include all nine pages and three presenter/closing checks. Hash preflight and geometry diagnosis support those cases rather than add a wider campaign.

Actual surfaces: nine supplied 1921 × 1080 PNGs, native PPTX Open XML, final nine-page PDF, approved slide 4 native donor and PNG, retained full R13 PPTX, canonical R13 stage script, and R6 Markdown notes. I visually inspected every supplied page and the approved reference. I independently rendered every final PDF page in memory with PyMuPDF at 2×; **all nine images matched the supplied PNGs pixel for pixel**. I also inspected a fresh enlarged PDF crop of slide 5.

Unavailable, **not observed**: native PowerPoint application on a physical presentation device, projector viewing distance, live QR scan with a physical phone, human timing/rehearsal and author approval. No wider device matrix is proposed. A browser/UI workflow is not applicable to this local artifact-reading task. Link destinations were inspected in the files; remote availability was not probed.

## Source and prompt identity

All SHA-256 values below identify inspected bytes, not proof of comprehension.

| Input | SHA-256 |
| --- | --- |
| Initial `artifact-candidate-manifest.json` | `c71edff082b7d03bf6df0164991931341ec9e4f17d6c2c5c8831003a074254b9` |
| Neutral supplement `artifact-candidate-manifest-v2.json` | `9c5cd97fc8959e3c9110178c5813ecefa36ccff645119ef2789ea1fbda9f2687` |
| Common reviewer contract `agents/reviewers/README.md` | `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` |
| Role prompt `agents/reviewers/exploratory-interaction-qa.md` | `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a` |
| `CONTRIBUTING.md` | `804fb3da9a0bc7369bbd902313224221becc6c6b775536ca943f8664bf741442` |
| Original `request.md` | `bcfb31ce2b64043f2af5b45f4dbc810fa0b1004cbd7820e053da515e29f76e21` |
| Original `issue-109.md` | `298caeaea01efa7b07d97fc7a05c61ec78dc3925e4dbbfef8b8aac2da3307b9e` |
| Candidate PPTX | `fa461eadcf41cd314b6861be6968824545719254e5430f6de705a2071f8cbd94` |
| Candidate PDF | `2a8d7a63764b014dfc0fdbdf65562296d744f6c527ef1319a2f034465db9fa05` |
| R6 `speaker-notes.md` | `3772174bc7e27eb32339a43541cc17191c898bac710ec994ae9c8c30f1d86976` |
| Approved slide 4 native donor | `1741f44748706fae660f442636470c48223f721af567c83315c89e56a52d1c4c` |
| Approved slide 4 preview | `c3ba556b7e28cf38e6d87375af070885aceeb9cb79fc260a9834a573230c3259` |
| Retained R13 full native deck | `6e62b5b83c55fa09e63cf25806bdcf4472ffe313e89b85d1f26d1484c777ebbf` |
| Canonical R13 concise stage script | `8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84` |
| Prepared diff | `b03b99daf5b8019e050f374a31ed7869d65d4a3962c62a59d9582936175ab3df` |

I read the current request and the owning issue's original intent, current/superseded scope, audience promise and stable ACs, applying the current explicit instruction to preserve the R13 stage wording and approved slide 4. Applicable reviewer instructions came from AGENTS, CONTRIBUTING's independent-review/QA sections and the common/role contracts. I read the relevant QA allocation section of `guides/SITE-CHECK-PROFILES.md` (SHA `4d04212f1f3f7810ed9cc43695a57fb18c1bb3e3ed15249d2839e7dd80566258`) and bounded verification/evidence instructions in `guides/CODE-STYLE.md` (SHA `cdef877504055734d653af12237fc708f3e3636dd15dfc0703f71e0f6c87ee40`). Build receipts were not used as a substitute for observed results.

The v2 supplement added those canonical guides and the R13 script. All 42 v2 entries matched on first verification. On final rehash, only `.github/acceptance/issue-109.json` and `tools/presentations/integrate_native_slide.py` differed. **The PPTX, PDF, all renders, donor/reference, notes and script remained unchanged.** The orchestrator subsequently described the two changes as pinned-tool formatting with unchanged meaning/AST. That description is not independently accepted here; formatting reconciliation belongs to its separate review. This artifact judgment remains bound to the unchanged artifact hashes above.

## Executed cases: expected and observed

| Case / AC | Expected | Observed result and evidence |
| --- | --- | --- |
| C01 / AC01, AC03, AC11 | Readable opening, official title, recognizable HOW/WHAT distinction | **Pass.** Page 1 title, central artwork, cyan HOW and amber WHAT columns and identity/footer are legible and separated. No clipping or overlapping content observed. |
| C02 / AC03, AC12 | Conditional 8-to-100 capacity example can be followed, with admission-control qualification | **Pass.** Page 2 shows the eight SDLC nodes, baseline 8/8/8 and 0 backlog, then 100/8/8 and +92. Thought-experiment and fixed-capacity condition are visible. The concluding admission-control message and user-feedback link are readable. |
| C03 / AC03, AC13 | Evidence families remain distinguishable with their caveats and a clear conclusion | **Pass within screen review.** Page 3 separates activity/marketplace, flow, supporting studies and maintainability; the lower conclusion is visually prominent. Small caveat text is readable at supplied resolution. Density remains a rehearsal/projection consideration, not an observed clipping defect. No on-screen METR. |
| C04 / AC03, AC14 | Approved narrow/systemic first row, original local gap/questions, ownership definition and lifecycle graph survive integration | **Pass.** Page 4 matches the approved reference's composition. All five functions appear in the first row. The local cyan generation curve, amber understanding capacity, potential-gap label and all three questions remain. The third question is visibly unanswered. Consequence/definition, experiment qualifications and the seven-stage lower graph with its illustrative caveat remain legible. `ppt/slides/slide4.xml` is byte-identical to donor `ppt/slides/slide1.xml`. |
| C05 / AC03, AC15 | Six hypotheses and their descriptions can be read with clear heading/body hierarchy | **Fail: E01.** All six are present and the bottom context/ownership conclusion is readable, but the lower middle Disposable implementation heading wraps into the description's vertical space. Confirmed in supplied PNG, fresh PDF crop and PDF text geometry. |
| C06 / AC03, AC16 | The change to runtime model judgment is unmistakable and the table/formulas are legible | **Pass.** ACT II/WHAT WE BUILD, account-recovery subtitle, two formula regions, Requirement/Bug/DoR/DoD comparison and lower implications have clear spatial hierarchy. No lost glyphs or overlapping rows observed. |
| C07 / AC03, AC17 | Illustrative 196/3/1 veto, conditional exposure and continuing controls are readable | **Pass.** The prohibited disclosure and 98% not-equal-approval distinction is clear. Conditional canary progression, same-SHA warning and three observation areas are separately readable. Continue/narrow/fallback/stop choices remain visible. |
| C08 / AC03, AC18 | Bounded action path, rejection/fallback path, operating loop and human capacity can be followed | **Pass.** Both row-level flows and the human-control panel are legible. The fallback band is distinct; the closed-loop verification line and final narrow/redesign/no-go conclusion are visible. These are explanatory diagrams, not evidence that a real runtime enforces controls. |
| C09 / AC03, AC19 | Sole finale retains two research directions, role actions, questions and one visible website QR | **Pass.** Page 9 has distinct HOW/WHAT panels and one large QR with matching URL. Research project names, role actions and QUESTIONS remain legible; no clipping observed. |
| C10 / AC01, AC02, AC03 | Nine matching presenter notes, preserved R13 stage wording and clear reference separation | **Pass.** All nine native stage sections match the canonical R13 script after whitespace normalization. Every native stage prefix also matches the retained R13 PPTX. All nine complete native note texts match their Markdown sections after removing only Markdown structural headings/normalizing whitespace. Nonspoken sources/extensions are labelled. Slides 1–3 and 5–9 XML also match R13 bytes; slide 4 is the intentional donor replacement. No rollback to R5 wording observed. |
| C11 / AC07, AC19 | Exactly one final QR resolves to the exact canonical homepage from native and PDF | **Pass for supplied raster surfaces.** Native `ppt/media/image2.png` is 738 × 738. A bounded direct QR bitstream read identified version 4, format word `0x0d0c`, error-correction H, mask 6, byte mode, 27-byte payload. Both this native image and the actual final PDF page freshly rasterized in memory at 3× decode to `https://vitaliioborskyi.ai/`. Physical scanning remains not observed. |
| C12 / AC02, AC07, AC19 | Closing research and homepage links retain correct targets in native/PDF | **Pass for embedded destinations.** Slide 9 relationships preserve both research URLs. Final PDF page 9 has three URI links: Subprime repository, Uncertainty Architecture repository and canonical homepage over the QR. Visible URL agrees with payload. No other page has a PDF URI annotation. Remote HTTP response behavior was not tested. |

## E01 — Crowded heading and description on slide 5

**Severity: medium, localized visual defect.** This prevents an unqualified no-layout-issues result for AC03 and the slide-specific readability portion of AC15. It does not invalidate the approved slide 4 or corrupt the six-hypothesis content.

Location: final PDF page 5 / `renders-final/slide-05.png`, lower middle card, **“3 · Disposable implementation”** and **“Regenerate isolated, bounded features.”** Native objects in `ppt/slides/slide5.xml`: shape id 29, `Candidate Disposable implementation`; shape id 30, `Scope Disposable implementation`.

Observed mechanism: the heading is a 17-point, non-autofit text box whose one-line allocation wraps to two lines. The neighboring body also wraps. The rendered lines have insufficient separation, weakening the distinction between the heading and its explanation. There is no missing word; I do not claim proven ink-on-ink glyph collision. The visible crowding is supported by overlapping PDF text extents:

| Rendered line | PDF bounding box, points |
| --- | --- |
| `3 · Disposable` | `(362.126, 283.635, 482.168, 302.616)` |
| `implementation` | `(362.126, 304.044, 487.815, 323.025)` |
| `Regenerate isolated, bounded` | `(362.126, 317.669, 559.198, 333.865)` |
| `features.` | `(362.126, 335.017, 418.204, 351.213)` |

The heading's lower line and description's upper line extents overlap vertically by **5.356 points**. The enlarged fresh PDF crop shows the same near-touching presentation. This defect is inherited: slide 5 XML equals the retained R13 source, so it was not introduced by replacing slide 4. It is nevertheless within the requested full-deck review and the explicit permission for a bounded integration/readability correction.

Proposed bounded treatment: adjust only the lower middle card's heading/body box height or position to provide visible separation, preserving wording, font hierarchy, all six hypotheses and the R13 spoken notes. Re-export the PDF and visually recheck that card and the slide's surrounding alignment; compare unaffected slide/content identities. No global redesign, extra slide, new device matrix or stage-script rewrite is requested.

## Check limitations and diagnostic record

- The initial QR tool attempt stopped at `ModuleNotFoundError: cv2`; no QR assertion ran in that attempt. The successful fallback was a direct read of the clean version-4 QR bitstream, including format/mask and block deinterleaving. It did not simulate damaged symbols or apply a physical-camera test.
- An initial Poppler-versus-supplied pixel comparison was unequal. This was a renderer mismatch, not accepted as candidate corruption. A controlled PyMuPDF 2× re-render of the exact final PDF then matched **every supplied page pixel for pixel** (RMS 0.0), establishing the inspected PNGs' identity to this rendering of the final PDF.
- Detailed empirical-source fact checking, native application behavior, rights clearance, helper negative cases and complete repository gates are outside this bounded exploratory result. Source qualifications and readable distinctions were inspected, not independently re-researched.
- Speaker notes preserve the accepted long R13 stage script; the older historical 3–5-cue-note wording is not silently used to demand a rollback. Real talk duration remains the author's unobserved AC06 gate.

## Allocation and next gate

Per `SITE-CHECK-PROFILES.md#qa-findings-to-github-actions`, retain C01–C12 as **manual artifact/operator evidence** owned by issue 109 and its existing review record. No browser, production, scheduled diagnostic or new automated suite is justified by this finding. No Actions job is claimed to have executed these visual judgments.

For E01, the correction owner is the artifact implementer. The proposed regression is the same C05 scenario and independent visual oracle: the wrapped title and description have clear separation in the actual exported slide. Reuse unchanged C01–C04/C06–C12 evidence only after checking unchanged artifact/source scope; rerun affected exported/native correspondence and the final page count. A targeted nonauthor correction review is required after any fix. This proposal has not been implemented or counted as executed.

AC06 author/rehearsal/device decisions and AC08 event selection remain open/not observed. This first judgment must be preserved before later reconciliation or correction.
