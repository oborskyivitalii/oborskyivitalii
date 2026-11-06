# R6 Code / Artifact review — first independent result

## Verdict and scope

**No blocking defect found in the supplied R6 native integration.** The supplied editable PPTX, native notes, Markdown notes and nine-page PDF support the bounded preservation/integration claims checked below. One **low-severity, nonblocking helper robustness finding** remains: failed writes can leave a partial new output that prevents a retry. This is not a blanket approval of issue #109, Draft PR110, final package metadata, release, author acceptance, rehearsal, or a physical presenting device.

This is the first judgment of the distinct nonauthor **Code / Artifact** reviewer, task handle `/root/r6_artifact_review`. It precedes reconciliation. I did not read current peer outputs, parent scratch notes, private conversation history or MEMORY; I did not recursively delegate or change implementation/tests. Only this assigned review file was written persistently. Temporary rebuilt/failure-check output was confined to reviewer-owned `/tmp/r6-artifact-*` directories and removed when those checks finished.

The reviewed scope is a **prepared artifact subset, not a clean Git checkout**: the full R6 PPTX/PDF/native notes, approved one-slide donor, retained R13 native input, integration helper, source provenance and supplied render/check material. Edition/index metadata and final PR integration are explicitly excluded. Current intent is the supplied 2 November request: integrate the approved slide 4, preserve the R13 spoken script and every unrelated slide/link/source, generate matching editable/native and PDF delivery, and retain repository history. Current explicit intent supersedes historical literal R4/R5 wording in issue #109. AC04/09 and the integration portion of AC01/02/03/14 are relevant here; whole-criterion closure still needs their other gates.

## Launch and evidence identities

The launch packet reports requested `fork_turns="none"`, with model and reasoning effort omitted/inherited defaults. The orchestrator owns the actual accepted launch response and must retain it separately. This reviewer cannot observe provider model identity, memory injection or provider-internal context isolation and does not attest to them. No unexpected author/peer exposure was observed in the materials read. This is operational source restriction, not an OS security boundary or provider attestation. Unsupported or unverified runner isolation cannot be replaced by this technical result.

| Identity | SHA-256 / ref |
| --- | --- |
| Initial packet, `artifact-candidate-manifest.json` | `c71edff082b7d03bf6df0164991931341ec9e4f17d6c2c5c8831003a074254b9` |
| Neutral source supplement, `artifact-candidate-manifest-v2.json` | `9c5cd97fc8959e3c9110178c5813ecefa36ccff645119ef2789ea1fbda9f2687` |
| Common prompt, `agents/reviewers/README.md` | `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` |
| Role prompt, `agents/reviewers/code-review.md` | `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697` |
| Applicable `CONTRIBUTING.md` | `804fb3da9a0bc7369bbd902313224221becc6c6b775536ca943f8664bf741442` |
| `AGENTS.md` | `ad4f179ec04c7af12867229d70598a660c5ae41f3cb456cafd02aca3d12a9988` |
| `guides/CODE-STYLE.md` | `cdef877504055734d653af12237fc708f3e3636dd15dfc0703f71e0f6c87ee40` |
| `guides/SITE-CHECK-PROFILES.md` | `4d04212f1f3f7810ed9cc43695a57fb18c1bb3e3ed15249d2839e7dd80566258` |
| Original request, `request.md` | `bcfb31ce2b64043f2af5b45f4dbc810fa0b1004cbd7820e053da515e29f76e21` |
| Supplied issue, `issue-109.md` | `298caeaea01efa7b07d97fc7a05c61ec78dc3925e4dbbfef8b8aac2da3307b9e` |
| Prepared diff, `artifact-candidate.diff` | `b03b99daf5b8019e050f374a31ed7869d65d4a3962c62a59d9582936175ab3df` |
| Reported old PR head | `327ec57d9c4b7539d83631204b91bdc36545c862` |
| Reported applicable main base | `8cf15883125892710633b17133d9ee0fc4b23b92` |

All 39 v1 paths matched their supplied byte count/hash. The v2 supplement added CODE-STYLE, SITE-CHECK-PROFILES and the standalone R13 script; all v2 source hashes also matched when read. Its newly supplied material was neutral source/policy, not a peer verdict. Original candidate/helper bytes were unchanged. The task and those manifests, rather than an assumed repository status, define this result's source binding.

| Key candidate source | SHA-256 |
| --- | --- |
| `drafts/devcon-romania-2026/r6/devcon-romania-2026-r6.pptx` | `fa461eadcf41cd314b6861be6968824545719254e5430f6de705a2071f8cbd94` |
| `drafts/devcon-romania-2026/r6/devcon-romania-2026-r6.pdf` | `2a8d7a63764b014dfc0fdbdf65562296d744f6c527ef1319a2f034465db9fa05` |
| `drafts/devcon-romania-2026/r6/speaker-notes.md` | `3772174bc7e27eb32339a43541cc17191c898bac710ec994ae9c8c30f1d86976` |
| Retained full R13 PPTX | `6e62b5b83c55fa09e63cf25806bdcf4472ffe313e89b85d1f26d1484c777ebbf` |
| Approved native donor PPTX | `1741f44748706fae660f442636470c48223f721af567c83315c89e56a52d1c4c` |
| Approved donor preview PNG | `c3ba556b7e28cf38e6d87375af070885aceeb9cb79fc260a9834a573230c3259` |
| `tools/presentations/integrate_native_slide.py` | `3cae90c8b59665883c887f6df45459972b047e07387ea88baa2c6573e6fefe02` |
| Standalone R13 concise script | `8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84` |
| Supplied whole-deck contact sheet | `5cf1e34ddb6ac2c10cb715a0870b876947ebfdf0593c73deffb5d42e7f4b3a48` |
| Supplied full-size slide 4 render | `9d43d329bb5155378567d675be511914c228915c8b39e51a73ee91ecac82f7bb` |

## Actual review and checks

The review remained bounded to the assigned sources and these 12 check groups. Invalid slide range checking used two boundary inputs, 0 and 10. No broad website or hosted test campaign was run.

1. **Source binding and relevant policy.** Independently calculated manifest/source digests. Read the common/role prompts, request, current issue execution brief and stable/slide-level ACs, applicable independent-review sections of CONTRIBUTING, AGENTS, CODE-STYLE and relevant check-profile routing. Historical issue output was large and partially truncated; I did not treat every historical passage as fully inspected. No historical result was reused as current acceptance.
2. **Native package preservation.** Compared all ZIP members as bytes. Source and final each contain 58 members, with none added or removed. Exactly `ppt/slides/slide4.xml` and `ppt/notesSlides/notesSlide4.xml` differ. All 56 other payloads are byte-identical. Both replacements are byte-identical to the donor's `slide1.xml` and `notesSlide1.xml`. Thus all other slide contents, masters, themes, media, core metadata and relationship payloads are preserved for these exact inputs.
3. **Native slide structure/editability.** Inspected XML structure and visible slide inventory. The final presentation contains nine visible slide-list entries. Slide 4 contains 74 native `p:sp` shapes and zero `p:pic` objects: its text/diagrams are not a flattened screenshot. Other slides have native shape content and preserve the original artwork/QR pictures. This is package-level editability evidence; no PowerPoint UI editing was performed.
4. **OOXML relationships.** Resolved every final package internal relationship target and checked relationship-ID uniqueness. No missing target or duplicate relationship ID was found. All relationship files are byte-preserved. The three existing external URLs are the two research GitHub repositories and `https://vitaliioborskyi.ai/`. The helper's compatibility gates restrict donor slide/notes dependencies and reject direct embedded relationship references; layout/theme/master compatibility is checked before output creation.
5. **Native notes preservation.** Extracted all nine native notes. Every original R13 note text is a prefix of the corresponding final note text; eight note XML payloads are completely unchanged. Slide 4 uses the donor notes exactly, with additions after the retained source content.
6. **Standalone R13 script and Markdown transcription.** Compared the standalone script's spoken paragraphs with the corresponding native notes, normalizing whitespace. All nine sections matched: 8, 9, 7, 8, 8, 8, 6, 9 and 9 paragraphs respectively, with zero missing paragraphs. Every nonempty final native-note paragraph also occurs in `speaker-notes.md`. This checks preservation/transcription; it does not validate spoken timing or authorize old cue-card criteria to be silently relabeled.
7. **Reproducibility.** Imported the actual helper in an isolated Python process with bytecode writing disabled and ran it on the retained inputs into a fresh temporary output. The output was byte-for-byte identical to the supplied R6 PPTX, including SHA-256 `fa461ead...f6de705a2071f8cbd94`.
8. **Existing-output refusal.** Reran the helper against that existing output. It raised `Refusing to overwrite` and the existing output bytes remained unchanged.
9. **Slide-range failure boundaries.** Requested source slide positions 0 and 10 against the nine-slide deck. Both were rejected as outside the slide list, before any output file was created.
10. **Interrupted-write behavior.** Injected an `OSError` on the fifth `ZipFile.writestr` call within the isolated reviewer process. The error propagated, but a 2,213-byte output remained containing only four ZIP members; a normal retry refused to overwrite it. This is the concrete basis of finding C1 below. No supplied input or candidate was modified.
11. **Actual PDF structure and content.** Opened the supplied PDF with PyMuPDF. It contains nine pages. Page 9 retains the same three external URLs. Extracted page 4 text includes the original title, local generation/understanding labels, three What-if questions, potential-gap qualifier, ownership consequence/definition, five systemic review functions, lifecycle labels and experimental/source qualifications. Text extraction is not a rendering proof.
12. **Rendered composition.** Visually inspected the supplied nine-slide contact sheet and the full-size final slide 4 PNG. The integrated slide shows the narrow/systemic comparison across the first row, local plot plus questions in the second region, and lifecycle-wide asymmetry below, using the source dark/cyan/yellow style. No new overlap or clipping was apparent at those inspected resolutions. The contact sheet supports gross full-deck continuity; it is not a full-size per-slide text-fit or projector review.

The supplied `integration.stdout.json`, helper checks and finalization/export receipts were treated as candidate claims. The checks above independently corroborate preservation, reproducibility, notes transcription, native structure, PDF page/link content and the inspected visual composition. I did not independently rerun every receipt assertion or infer native PowerPoint execution from a structural validator or LibreOffice export.

## Findings

### C1 — Low / nonblocking: interrupted output write leaves a partial file at the final path

**Location:** `tools/presentations/integrate_native_slide.py`, `integrate()`, lines 172–187; output is created at its final name on line 173 and is not removed if writing or subsequent validation fails.

**Concrete evidence:** With the actual retained inputs and an isolated injected I/O failure on the fifth ZIP-member write, the helper raised `review-injected write failure`. A 2,213-byte ZIP remained at the requested `.pptx` path with only `docProps/core.xml`, `docProps/app.xml`, `ppt/presentation.xml` and `ppt/theme/theme1.xml`. The next ordinary invocation returned `Refusing to overwrite` for that partial file. The successful supplied R6 is unaffected and independently reproduced exactly.

**Failure mechanism and impact:** Preflight compatibility failures occur before output creation, but write/verification failures do not clean up their own newly created file. A failed run can leave an incomplete artifact with the expected extension and forces manual cleanup or a new filename before retry. This reduces operational robustness of the reusable workflow under AC09 and the bounded failure-safety portion of CS08. It does not overwrite either input or an existing output, and no current R6 corruption was observed.

**Proposed treatment:** As a bounded follow-up, build and validate into an exclusively created temporary file beside the destination, publish only after success while preserving the existing no-overwrite guarantee, and remove only the helper-owned temporary file on failure. Alternatively, explicitly document and detect the incomplete-output cleanup requirement. An independent I/O-failure check should verify that failed runs cannot leave an apparently final artifact. This improvement is nonblocking for delivery of the exact successfully verified R6 artifact.

## Limits and acceptance implications

- This result is suitable evidence for the **supplied integration subset**, not final package readiness. Edition/index/acceptance metadata, generated RI state, final committed tree, final PR diff, final source checks, current hosted CI and separate role results require their own exact-source evidence.
- The code is a deliberately narrow compatibility helper, not a general arbitrary-PPTX merger. Its refusal of layouts with multiple same-kind dependencies, slide media/hyperlinks/charts, incompatible masters or missing note parts is intentional and documented. I did not demand broader import support.
- I inspected the complete helper and its supplied code diff. The source/notes/PDF preservation checks provide stronger evidence for this integration than unverified author summaries. I did not run repository-wide STYLE/RI/Basic checks or establish a permanent CI selection route for new helper cases; those remain package/integration obligations.
- The actual source files and PDF were inspected directly, but visual inspection used the supplied rendered PNGs; I did not independently rerender the entire deck or reproduce the PDF export. I did not decode the QR in this role. Byte-preservation of the existing native QR and PDF link extraction do not replace the explicit current QR-decoding or presenting-device gates.
- Empirical source truth, source rights, all exact slide-level author approvals, full-size readability of every unchanged slide, human timing, PowerPoint on a real device, projector behavior and rehearsal remain outside this bounded code/artifact result. No full AC01–AC19 checkbox should be ticked from this review alone.
- If any reviewed candidate/helper/source byte changes, the affected result needs a source-bound re-review. Unchanged evidence may be reused only after matching these recorded identities. The first result must remain intact before any later reconciliation or correction response.
