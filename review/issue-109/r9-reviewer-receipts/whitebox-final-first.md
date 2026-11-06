# R9 white-box QA: first final-candidate result

Date: 2 November 2026. Owner: issue 109 / Draft PR 110. Reviewer task: `/root/r9_whitebox_review`. This execution continues the reviewer's own initial baseline. It does not claim a new fresh-context launch.

## Verdict

**Pass within the bounded artifact scope. No blocking R9 artifact finding was identified.** The final package has the intended architecture-before-runtime order, correct delivery numbers and note associations, preserved spoken bodies and scientific qualifications, editable native content, working QR payloads and exported links, and a PDF consistent with the native deck's visible text and order. The retained native source payloads reproduce the delivered PPTX byte for byte.

All nine supplied final renders were visually inspected and independently reproduced from the delivered PDF with identical pixels. The existing edition validator also passes on the exact package. The finalizer's one slide-5 overlap warning was investigated rather than silently treated as a failure or ignored: the frames overlap, while the rendered text glyphs remain separated.

This result does **not** establish author acceptance, an English timed rehearsal, presenting-device/projector behavior, actual editing in PowerPoint, a clean committed R9, repository CI, merge, publication, event selection, or AC10's independent non-DevCon reuse example. Those remain separate gates. No live service was opened to test external destination availability. No independent second LibreOffice export was performed; the export checks here establish delivered PDF content/order/link/raster consistency, not byte-deterministic office export metadata.

## Inputs, isolation and identity

The neutral candidate packet is `review/issue-109/r9-input/candidate-package-manifest.json`, SHA-256 `7ca4fc1c4920fe169e2d8ebd5c0d8bf5b11905166a7d706cf5064b1ce4a6043a`. **All 45 listed files match their declared byte counts and SHA-256 values.** The packet, actual source bytes, baseline, final native parts, final PDF and supplied raw observations were inspected. No author implementation scripts or peer outputs were read.

The original baseline at `whitebox-baseline.md` remains unchanged. Its SHA-256 is `1ad76100d16e1ee58ccc1b17f4db0af9c5be5124275f7e3bd1dcc5ca963658fc`. Its helper analysis was reused after verifying that current common/role instructions and the three helpers differ from the baseline copies only by removal of the extra final LF. No substantive helper or instruction change was inferred from a changed hash alone.

| Input | Final inspected SHA-256 |
| --- | --- |
| R8 native input | `ee370d10570f43b4ff09d262927428af6a5ee4cd5c7823268fcd2422813cc3fe` |
| R9 PPTX | `32e95f4382ba3913640a9229de4853f5cdbcafa55375c194e733a0826767f1a1` |
| R9 PDF | `52b97b711e8d1934833db0ce6aa0f21aa7b5a8406522393a8ee39ea7815b9277` |
| R9 Markdown notes | `eadb088b9121685023c3f96e346ae6d215170b90f89803310b8a2455c9828db2` |
| R9 edition manifest | `fcc3315c11d8ab946b96e878781f5a1fc46f44fe5218b090f35b6cf8fef6d74e` |
| Common reviewer contract | `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` |
| White-box reviewer prompt | `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f` |
| `integrate_native_slide.py` | `5756a926f4caa409fc7c3d36b78e3f2d8600efce1fb353d6238cc43d4b24f317` |
| `reorder_native_slides.py` | `9423597518bee6ea2fcbb8e5c57b7e0d997f4612901c929a8597c7e8e4ae9225` |
| `validate_edition.py` | `4d5a1cf4c6f7ad7fde3e0a9161bdee9cf21533189f611ece1411112df9fdbf2b` |

The authoring folder is still identified as a prepared subset. The newly available full checkout was used only to verify the standalone historical R13 script and read the QA allocation guidance; repository checks were described as underway and are not claimed here. The standalone script is 18,219 bytes and matches its declared SHA-256 `8b00bb3e6f25884fdcb024bb01fae5a80ba9ca0903e6682a7796477a2380bb84`.

The orchestrator retains actual launch-parameter evidence. Provider internals, model/context/memory behavior and the accepted launch invocation are not independently observable from this role. No external writes, delegation, implementation changes, test-suite authoring, or artifact changes occurred. Temporary package reconstruction and independent PDF rendering were performed in memory. Only this assigned final receipt was written.

## Eight-case results

| Baseline case / AC | Actual independent result | Disposition and allocation |
| --- | --- | --- |
| WB01 — order and attachment; AC01/17/18 | Presentation relationships resolve to source parts `1,2,4,3,5,6,8,7,9`. Nine unique visible slides; architecture is delivery 07 and runtime delivery 08. Each slide has exactly one note part with the correct reverse slide relationship. Every visible footer is 01–09 at the same native coordinates. | Pass. Retain exact ZIP/XML inspection under issue109's manual presentation-review evidence. |
| WB02 — current note synchronization; AC01/03/17/18 | All 9 native note sections match Markdown paragraph sequences. All 9 spoken bodies match their R8 source subject, excluding the delivery header. Headers follow delivery order. Runtime addendum now uses the subject label `RUNTIME CAPACITY`; architecture transition now points to S08; closing references correctly identify S08 runtime and S07 architecture. | Pass. Baseline stale-reference risks resolved on actual source. |
| WB03 — breadth and source limits; AC13/14/16/17/18 | Both rebuilt slides retain the required technical breadth and limitations in visible content and notes. Evidence-source caveat edits shorten redundant wording without changing the distinctions; five review functions and original ownership content remain. | Pass for retention and presentation consistency. This is not a fresh external-paper audit or a new rights approval. |
| WB04 — preservation and editability; AC02/09/11/19 | Native part inventory remains 58; all 23 relationship parts and both media assets are byte-identical to R8. Exactly 13 native payloads change and exactly those 13 are retained under `sources/`. In-memory reconstruction from R8 produces the exact delivered 1,426,339-byte PPTX. Text/diagram objects remain native. | Pass. No broad helper change or regression suite was needed. |
| WB05 — geometry and readability; AC03 | All nine inspected renders have complete text and no observed clipping or obscured required arrows. Native bounds remain inside the canvas. Architecture loop and runtime stages have clear reading order. Slide-5 frame warning is explained by separated actual glyph bounds. | Pass within 1601×900 rendered review. Physical projection and actual PowerPoint rendering remain pending. |
| WB06 — QR and links; AC07/19 | zxing-cpp 3.1.1 decodes one valid homepage QR from the native asset, supplied closing raster, and independently rendered final PDF page. The visible homepage matches. Native and PDF links retain both project URLs and the homepage. | Pass for file-level checks. Physical scanning and live destination availability not observed. |
| WB07 — export consistency; AC01/03/04/09 | PDF parser observes nine pages. Every nontrivial native visible paragraph is present on the corresponding PDF page after Unicode/whitespace normalization. All nine supplied rasters equal independent final-PDF renders pixel for pixel. Existing edition validator returns `ok: true` with matching three artifact hashes and 9/9/9 counts. | Pass for delivered-file consistency. No independent second office export or native PowerPoint execution claimed. |
| WB08 — exact identity and scope; AC02/04/05/06/08/10 | Candidate pins verified; R8 source SHA remains exact; historical R13 hash remains exact. Current artifact identity is known. Edition states author review with rehearsal/device pending and R3 event selection retained. | Artifact identity passes. Clean committed repository checks, other independent role outcomes and all external gates remain outside this receipt. |

The allocation follows `guides/SITE-CHECK-PROFILES.md`, “QA findings to GitHub Actions”: retain appropriate manual evidence, use the smallest existing checks, and distinguish developer review from Actions execution. The executed existing CLI is `python tools/presentations/validate_edition.py drafts/devcon-romania-2026/r9 --json`. Direct ZIP/XML, rendering, decoding and visual inspections are retained manual diagnostics under issue109. No new suite, profile, workflow, registry entry or CI job is proposed or claimed.

## Native package and note evidence

Direct independent reads found:

- 58 unique ZIP members, no duplicates, successful ZIP integrity check, unchanged member order, zero missing internal relationship targets and zero unresolved relationship references in XML.
- Unchanged dimensions: 12,192,000 × 6,858,000 EMU. Every slide has the default visible state.
- All footers have x/y/width/height `[11239500, 6572250, 342900, 190500]` EMU and the correct delivery number.
- Source parts 1–6 and 9 retain their substantive content, with S04 caveat shortening and S05 reflow/numbering cleanup as detailed below. Text on delivery 1, 2, 3, 6 and 9 is unchanged.
- Native object counts remain consistent with editability: 453 shape objects, seven connectors, and two pictures. Rebuilt diagrams are not whole-slide pictures. The two retained pictures are the opening artwork and final QR.
- Source retention is complete: all 13 `sources/` files exactly match their corresponding changed package payloads; no changed payload is missing and no unrelated extra replacement is required. Retaining original ZipInfo records and archive comment in an in-memory reconstruction yields SHA-256 `32e95f4382ba3913640a9229de4853f5cdbcafa55375c194e733a0826767f1a1` and exact byte equality with the delivered PPTX.

The changed payload set is presentation order, all nine slide XML parts, and native notes 7, 8 and 9. Notes 1–6 are byte-identical. The three changed note parts differ only in delivery headers or reference navigation/labels; their spoken paragraphs are preserved. The architecture source note's former S09 transition now introduces the operating hypothesis at S08. The runtime addendum's obsolete numeric title becomes a stable subject title. The closing qualification's two references exchange their delivery numbers. Native-to-Markdown comparison succeeds 9/9.

The stage body comparison operated on the native subject's paragraph sequence between its R13 header and the explicit reference-notes divider. The comparison preserves internal wording and punctuation, ignoring only leading/trailing paragraph whitespace. References and source addenda were separately inspected rather than silently omitted from the synchronization check.

## Breadth and source-qualification review

Delivery S07 contains a closed Observe/Sensors → Decide/Controller → Intervene/Actuators → Operate/Controlled system loop. The output feedback visibly returns to sensing and requires verification that correction worked. Permissions and action limits are shown before effects. Human sensing and judgment are explicitly conditional; available competence, workload, response time and authority remain architectural dependencies where people fill these functions.

The second portion of S07 covers control adequacy, staffed operation/full cost and comparison with a simpler viable alternative. Discovery, narrower scope, redesign and no-go remain possible outcomes. The closing line explicitly gives a successful demo evidential value for capability while requiring further evidence for the full operating case. The speaker notes retain preventive policy enforcement, the possibility of disclosure without a tool call, imperfect/shared model checks, adverse-condition evidence, domain expertise, recovery and no-AI options.

Delivery S08 retains the illustrative n=200 case with 196 acceptable, three wrong steps and one privacy leak. The forbidden disclosure still blocks approval for that scope despite the 98% aggregate. Progressive exposure is expressly conditioned on risk; independent evaluation and non-action shadow mode precede any bounded canary, and preventive controls remain required. The page distinguishes unchanged application SHA from changing model/provider, knowledge, policy, users and responder capacity. Service, behavior, controls and people/capacity all remain visible. The action choices include narrowing authority, tested and staffed fallback, and stop/reassess; rollback does not undo disclosure.

The whole-deck text diff found three concise S04 caveat edits:

- “Calendar elapsed time, not reviewer hours” becomes “Calendar time, not review hours”; the main metric still says elapsed PR-to-merge, and uncertain completion gains remain.
- The repeated “Survey association” prefix is removed from the instability definition; the immediately preceding line still explicitly says self-reported effects and survey association.
- The redundant “AF = agent first” definition is removed while the cohort label continues to spell out “AGENT-FIRST COHORT”; matched OSS cohorts and proxies-not-defects-or-cost remain visible.

S05 retains all six hypotheses, their questions and the contextual/no-universal-model qualification. Its text reflow and removal of partial 1/2/3 numbering do not remove a hypothesis. Fixed downstream capacity and admission assumptions on S02, the illustrative comprehension graph and experiment qualifications on S03, and the conditional runtime distinction on S06 remain.

## Slide-5 warning disposition

The supplied finalizer reports one `substantial_text_frame_overlap` for slide 5 object IDs 29 and 30. Direct source inspection identifies them as `hypothesis-body-3` (“Durable intent, specs and contracts.”) and `hypothesis-extra-3` (“Compare with a baseline.”). Their frames overlap vertically, but actual PDF glyph bounds are:

| Text | PDF glyph rectangle, points |
| --- | --- |
| Durable intent, specs and contracts. | `(67.493, 335.071, 289.066, 350.572)` |
| Compare with a baseline. | `(67.493, 355.905, 206.735, 369.729)` |

The second line starts about **5.33 pt below** the first line's bottom. Direct render inspection shows distinct legible lines, with the lower question also separate. **Disposition: nonblocking frame-overlap warning; no rendered glyph collision observed.** This conclusion is tied to the final PDF/native geometry, not to a global assumption that overlap warnings are harmless. Actual editing or font substitution on another system remains outside the observed scope.

## QR, hyperlink and export evidence

The native QR asset remains SHA-256 `a41f34f3039f8b4673b0f62ecf08c315ebe0ad0f55bcec5b8b8b3544ead8c38e`. zxing-cpp 3.1.1 returned exactly one valid QR code with text `https://vitaliioborskyi.ai/` in each of three independent reads: native asset, provided S09 image, and fresh final-PDF page raster.

The same three targets are present in the native closing-slide relationships and actual closing PDF URI annotations:

1. `https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis`
2. `https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture`
3. `https://vitaliioborskyi.ai/`

PyMuPDF parsed nine PDF pages, each approximately 960.009 × 540 pt. Every native visible paragraph longer than one normalized character appears on its expected PDF page; page content was also inspected visually, so the comparison is not solely keyword matching. Fresh PyMuPDF rendering at a 120/72 scale produced 1601×900 RGB pixels exactly equal to the nine supplied final PNGs. PDF metadata identifies Impress / LibreOfficeDev 26.8.0.0.alpha0 as creator/producer. Metadata alone was not used as proof of correct content.

## Execution accounting, diagnosis and limits

The following read-only executions completed with exit 0 and no signal or timeout. Full commands/results are in their tool execution records; the decisive raw results are retained here.

| Record | Command/check and raw outcome |
| --- | --- |
| `a59fef` | Existing edition validator: `ok: true`, no errors; PPTX 1,426,339 bytes, PDF 898,057 bytes, notes 37,138 bytes; all artifact hashes match; slide/note/page counts 9/9/9 |
| `f13a46` | Independent `python -` SHA/ZIP/XML/PDF inspection: `PIN_COUNT 45 MISMATCHES []`; 58 members, no duplicate/bad ZIP member; `MISSING_REL_TARGETS [] UNRESOLVED_XML_REFS []`; `SOURCE_PAYLOADS 13 EXACT_SET True ALL_MATCH True`; `MEMORY_REPRODUCTION ... True`; all nine `SPOKEN_EQUAL True MARKDOWN_EQUAL True`; all nine `MISSING_NATIVE_PARAGRAPHS []` |
| `1fb297` | Poppler diagnostic at 120 dpi plus actual PDF glyph bounds and standalone R13 hash. Poppler produced nonzero pixel differences from supplied rasters on all nine pages despite equal dimensions. This was retained as a renderer-comparison result, not called a pass |
| `75a0dc` | Targeted diagnosis of that difference using PyMuPDF rendering: all nine `same_pixels True`, mean RGB absolute difference `[0.0, 0.0, 0.0]`. Also verified that all seven reused instruction/helper sources differ from baseline only by terminal LF normalization |
| `80c688` | zxing-cpp 3.1.1: native QR, provided final page and independently rendered final PDF each returned `count 1`, exact homepage, `QR Code`, `True` |

The first Poppler comparison did not establish pixel equality. The next bounded diagnostic asked whether the difference arose from renderer selection rather than mismatched page content. It used PyMuPDF on the same pinned PDF and obtained exact equality for all nine stored rasters. No artifact was changed, and the original nonmatching result remains documented.

Decoder discovery initially found no QR decoder in default or primary Python or the queried Node modules. The orchestrator supplied an installed zxing-cpp location outside the repository; only that package's actual decoder result was used, with no inherited peer result. The reviewer did not install dependencies or change repository code.

Supplied assembly/finalizer observations were read and source-bound, but independent structural, transcription, reproduction, glyph-bound, PDF and QR checks established the results above. The supplied first-party import success is corroborating evidence only; this execution did not itself open/edit the PPTX in PowerPoint or rerun the first-party importer. No numerical branch-coverage claim, exhaustive malformed-input campaign, failure-injection test, or source-rights validation is made.

The final result is specific to the identified candidate files. Later changed relevant bytes require affected re-review. Repository reconciliation and other role decisions belong to the orchestrator; this role's artifact pass cannot stand in for those outcomes or close the separate human/device gates.
