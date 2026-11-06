# R8 Code / changed-artifact — first independent result

**Verdict: native artifact passes this bounded structural review; one nonblocking manifest correction required before final handoff.** This is not whole-issue acceptance or release approval.

Execution: `/root/r8_code`, first phase; none-fork launch reported by orchestrator, not independently observable here. No author conversation, peer verdict, preflight or MEMORY was read. Provider context/model internals remain unknown. Prepared dirty subset, not a clean Git checkout; declared base `1044c6ee6effc3580ec735ead4f4f7f9ea26a069`.

## Finding

**Low — inaccurate export provenance.** `drafts/devcon-romania-2026/r8/edition.json`, `pdf_export.method`, says the PDF came from “the exact final R7 PPTX”, while its adjacent verification identifies R8 and the actual PDF contains the new S07/S08 text. This contradicts the edition contract's exact-native-source requirement and confuses AC17/18 evidence binding. Correct the method to R8 and refresh its dependent manifest/packet hash. The delivered binary content need not change for this correction.

## Four focused cases actually inspected

1. **Identity and package scope:** recalculated every supplied file's SHA-256; all match the packet. ZIP CRC passed. Comparing all 58 unpacked R7/R8 parts found exactly four changed payloads: slides7/8 and notesSlide7/8. All 54 other parts and all 23 relationship parts are byte-identical. Four retained source XML files equal their actual final package payloads. This supports preserved slide order, dependencies, theme and seven unchanged slides without relying on the author's conclusion.
2. **Native structure and alignment:** S07 has 64 native shapes, S08 has 40; both contain editable native text and zero picture objects. Actual paragraph alignments are `ctr`, `l` and `r`, with no invalid `c`. Read the retained TextAlignmentTypeValues failure and source-bound finalization receipt; the latter reports successful nine-slide import against the actual final PPTX hash. I did not rerun that importer or open PowerPoint. The unchanged integration helper enforces compatible dependencies and complete note-text prefixes.
3. **Content/notes contract:** independently extracted S07/S08 native text. S07 retains 196/3/1, veto, progressive exposure and restriction/fallback/stop, adding availability/workload/queue/response monitoring. S08 exposes all control components, constraints, feedback, conditional operator dependence, business-case adequacy and discovery/redesign/no-go. Helper `note_text` confirms all nine original notes remain exact prefixes; only 7/8 append text. Every nonempty extracted S07/S08 note line occurs in the Markdown transcription. Addenda qualify human capability and useful-but-insufficient demos consistently with AC17/18.
4. **Actual PDF preservation:** both PDFs have nine pages. Independent PyMuPDF raster comparison at default scale gives identical pixels for pages1–6 and9. New PDF pages7/8 contain the intended content. Page9 retains the same three URI targets and rectangles; `proof.json` reports `links_retained:false` because PDF object xrefs changed, not because links disappeared. This is a reporting artifact, not an observed delivery regression.

## Identities and limits

Packet SHA-256: `8211010cbaac9790cc7b1e66f2d69995decb4f11fd189e391e4ea0bdf0913a5a`.

Common prompt: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role prompt: `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`.

R8 PPTX: `ee370d10570f43b4ff09d262927428af6a5ee4cd5c7823268fcd2422813cc3fe`; PDF: `d8511c35d69e1b79886670901db794ecc66679f4cb0da46d3350fea7f33c4f7f`; edition manifest: `4980f6201f319ec709197eb83abf5b56bb4872ba78d43d9e61784757398e492b`.

No implementation, broad suite, external write or delegation. PowerPoint interaction, projection, timed rehearsal, live GitHub/base equality and provider isolation were not observed. Human/device/rights and remaining independent-role gates are outside this verdict.

Execution disclosure: importing the existing helper for its `note_text` function may have refreshed `tools/presentations/__pycache__/integrate_native_slide.cpython-312.pyc`; no source was edited. This incidental cache write exceeds the intended report-only write boundary and is disclosed to the orchestrator.
