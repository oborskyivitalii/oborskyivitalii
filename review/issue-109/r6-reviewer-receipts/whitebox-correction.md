# R6 White-box QA — targeted correction continuation

## Result and continuity

**The final R6 native package is reproducible byte for byte through the documented two helper calls. No blocking defect was found in this correction scope.** The final PPTX has exactly three changed package payloads versus the retained R13 source and 55 unchanged payloads. The sole slide-5 XML change is shape 30's vertical coordinate, from `4069079` to `4196079` EMU. All original wording, all nine native note payloads relative to the first reviewed integration, and every relationship remain unchanged.

This is a **correction continuation**, task handle `/root/r6_whitebox_review`, not a new first-isolation execution. It reuses this role's own first result and neutral correction instructions. No peer verdicts or private author history were read. Provider model/context/memory internals remain unknown. Common prompt `agents/reviewers/README.md` SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` and role prompt `agents/reviewers/white-box-qa.md` SHA256 `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f` remain the review contract.

The first result was not edited: `r6-whitebox-first.md` still has SHA256 `b47343803b6a73e08335917b62a29457818afafe344ed03e0e64f99ff84db44f`. Its initial **12-case accounting remains 11 passing assertions and one fixture-targeting failure**, followed by a retained, successful targeted diagnostic of the linked theme. Do not convert that initial run into “12/12 passed.” No negative cases were rerun and no new fault fixtures were created for this continuation.

## Exact corrected source

Repository `oborskyivitalii/oborskyivitalii`, owner issue109 / existing Draft PR110. This remains a **prepared subset, not a clean Git checkout**. Packet scope includes corrected artifacts and metadata, with later generated RI/verbatim receipts/remote linkage outside this observed subset.

| Input/result | Observed SHA256 |
| --- | --- |
| `r6-final-candidate-manifest.json` | `c2db4a3e6089e62f321b98880579d19f93c4c0538462103187e4da063b4f05f6` |
| Formatted `integrate_native_slide.py` | `5756a926f4caa409fc7c3d36b78e3f2d8600efce1fb353d6238cc43d4b24f317` |
| Retained original R13 native source | `6e62b5b83c55fa09e63cf25806bdcf4472ffe313e89b85d1f26d1484c777ebbf` |
| Approved S04 donor | `1741f44748706fae660f442636470c48223f721af567c83315c89e56a52d1c4c` |
| Final R6 PPTX and independently reproduced PPTX | `b3269196b0eac9dde5fd58706e16a6e84cff4bc2b3e3b368a634087b1cc5eef9` |
| Final R6 PDF | `8d070574648dbc640b30e4fb4e996ee9992664c332b762297b13bf5b8532fa20` |
| R6 Markdown notes, unchanged | `3772174bc7e27eb32339a43541cc17191c898bac710ec994ae9c8c30f1d86976` |
| R6 `edition.json` | `94a65484815a4217fdbedda53c0368c08c78d976f804f2ede20ed26660493db3` |

All **53** files in the final packet matched their recorded sizes and hashes. The final source README was read directly. Its interrupted-output limitation remains explicit.

The helper's original bytes were reconstructed from the retained initial diff, producing the exact original SHA256 `3cae90c8b59665883c887f6df45459972b047e07387ea88baa2c6573e6fefe02`. Python AST comparison with location attributes excluded was **identical** to the formatted helper. The stated Ruff 0.16.10 formatting provenance was supplied by the correction packet; this reviewer independently checked resulting bytes and AST identity, not a new formatter invocation. This supports reuse of unchanged negative-path evidence; no behavior fix is claimed.

## Bounded delta risks and executed checks

| Delta risk / invariant | Check and independent oracle | Observed result |
| --- | --- | --- |
| Formatting changes behavior | Reconstruct original helper from first diff, verify original hash, compare parsed ASTs | Identical ASTs; previous negative evidence reusable |
| Two-stage recipe fails or differs from final | Execute README recipe with fresh scratch outputs; compare exact final bytes | Both helper calls exit 0; exact candidate equality |
| Spacing donor changes unrelated content | Compare every donor/source ZIP payload and recursively compare slide-5 XML elements, attributes and text | Donor changes only slide5 XML; one `@y` difference |
| Integration disturbs prior notes/text/relationships | Compare final against original source and retained first-review integration | Three changed parts / 55 unchanged; nine native notes and all visible text sequences unchanged from first review |
| Final PDF/manifest mismatch | Validate final packet, parse PDF using PyMuPDF, execute existing edition validator | All packet entries match; nine nonempty PDF pages; edition validator exit 0, no errors |

Commands were executed through this retained bounded harness:

```bash
python3 /workspace/scratch/d8b65f68acc8/r6-whitebox-scratch/correction.py
```

It exited **0**. Working directory for the following equivalent helper commands was `/workspace/scratch/d8b65f68acc8/devcon-repo`:

```bash
python3 tools/presentations/integrate_native_slide.py \
  --source drafts/devcon-romania-2026/r6/sources/scratch-r13-native-full-deck.pptx \
  --donor drafts/devcon-romania-2026/r6/sources/approved-slide-04-native.pptx \
  --slide 4 --donor-slide 1 \
  --output /workspace/scratch/d8b65f68acc8/r6-whitebox-scratch/correction-slide04.pptx

python3 tools/presentations/integrate_native_slide.py \
  --source /workspace/scratch/d8b65f68acc8/r6-whitebox-scratch/correction-slide04.pptx \
  --donor drafts/devcon-romania-2026/r6/sources/slide-05-spacing-donor-full-package.pptx \
  --slide 5 --donor-slide 5 \
  --output /workspace/scratch/d8b65f68acc8/r6-whitebox-scratch/correction-final.pptx

python3 tools/presentations/validate_edition.py \
  drafts/devcon-romania-2026/r6 --json
```

All three CLI exits were **0**. Exact absolute argument arrays, executable path, stdout and stderr are retained in `r6-whitebox-scratch/correction-results.json`.

### Package and text observations

The three changed payloads versus original R13 are:

- `ppt/slides/slide4.xml`
- `ppt/notesSlides/notesSlide4.xml`
- `ppt/slides/slide5.xml`

Package inventory remains **58** parts, with **55** unchanged. The spacing donor independently differs from R13 only in `ppt/slides/slide5.xml`. The recursive XML comparison found precisely:

```text
/cSld[0]/spTree[1]/sp[30]/spPr[1]/xfrm[0]/off[0]/@y:
4069079 -> 4196079
```

Shape ID30 is `Scope Disposable implementation`. Its retained x is `4599432`, width `3054096`, height `338328` EMU. No other element, attribute, text or tail difference was found in that slide. The 127000-EMU move equals 10 points. All nine slide text sequences equal the first-reviewed integration, and all nine native note XML payloads are byte-identical to that integration. The Markdown notes hash is unchanged. The first review's R13 preservation and ordered note-transcription evidence therefore remains applicable.

The final PPTX is **1,422,904 bytes**, PDF **1,114,519 bytes**, notes **35,106 bytes**. The existing validator reports R6, nine slides, nine attached notes and nine PDF pages, with `ok=true` and no errors. Independent PyMuPDF parsing also found nine nonempty pages. No independent re-export/pixel comparison is claimed.

## Retained evidence and remaining limits

Only this correction result and files under `/workspace/scratch/d8b65f68acc8/r6-whitebox-scratch/` were written. Raw evidence:

- `correction.py`: exact temporary bounded harness; not accepted implementation or a registered test suite.
- `correction-results.json`: exact identities, both integrations, native diffs, continuity comparisons and validator output.
- `correction-slide04.pptx`, `correction-final.pptx`: fresh reproduction outputs.

Earlier `results.json`, `case12-diagnostic.json` and first review remain intact. Their tested negative branches are reused because the helper AST is unchanged and the source/donor used for S04 retain their exact identities. This does not add measured branch coverage or prove every possible S05 donor rejection path.

**AC10 remains partial:** the independent non-DevCon reuse example was not executed in this review or this correction. The reproduced DevCon package does not substitute for that separate requirement. No new test suite or broad campaign was run.

The direct-write interrupted-output limitation remains documented and unchanged: a failure during creation can leave a partial new output; the helper refuses to overwrite it and does not provide atomic promotion/cleanup. This correction did not test or fix that path.

Physical PowerPoint/device/projector behavior, QR scanning on the presenting device, timed rehearsal, full-deck author acceptance, hosted CI, event selection, public release and merge remain **not observed or outside scope**. The structural PDF check does not establish visual/device acceptance. Full-source research claims are not revalidated by this mechanical correction.

The finalization owner should preserve exact reviewed artifact/helper/notes hashes when assembling the final PR evidence. A relevant later byte or meaning change requires affected re-review; this result does not grant blanket approval of future generated or remote state.

## Post-check neutral metadata supplement

The orchestrator supplied `r6-metadata-pointer-correction.json` after the checks above. Its SHA256 is `c57f7d90806fdb4be158f667fd0c27632fcd4e93c6e1cdf408acd455d40f21c7`. The two changed metadata files are the S05 spacing recipe and provenance JSON; their `scope_authorization` pointer now uses durable `review/issue-109/r6-reviewer-receipts/requirements-layout-addendum.md` instead of the scratch path. This reviewer did not read the target reviewer receipt or consume a peer verdict.

Both current after-hashes match the delta. Replacing only the new pointer string with the old one recovers each exact before-hash, establishing the bounded pointer-only change. All final-packet hashes, with these two explicit delta overrides, match. The earlier 53-file observation remains its time-bound result; the final reviewed source is the original final packet **plus this metadata supplement**. Native artifacts, helper, notes, donors and reproduction commands are unchanged, so no artifact check or negative campaign was repeated. Raw verification is in `r6-whitebox-scratch/metadata-supplement-results.json`.
