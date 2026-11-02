# DevCon Romania 2026 presentation editions

**AI Changes the Delivery System and the Product Itself**  
Vitalii Oborskyi · DevOps Stage · 4 November 2026

**Current author-review edition: R6 — nine editable slides, attached R13 English
stage notes, and matching text/vector PDF.** The approved slide 4 is integrated
into the complete native deck. A measured spacing correction separates the two-line heading and description on
slide 5. The seven other slide payloads and all nine spoken sections retain their
source bytes/text.

One owner and one execution thread: [issue 109](https://github.com/oborskyivitalii/oborskyivitalii/issues/109)
· [Draft PR110](https://github.com/oborskyivitalii/oborskyivitalii/pull/110).

## Review R6

- [Editable PowerPoint](r6/devcon-romania-2026-r6.pptx)
- [Matching PDF](r6/devcon-romania-2026-r6.pdf)
- [Full native notes transcribed by slide](r6/speaker-notes.md)
- [Edition identity, inputs and exact artifact hashes](r6/edition.json)
- [Retained native inputs and reproduction command](r6/sources/README.md)
- [Source-bound review and remaining acceptance gates](../../review/issue-109/2026-11-02-r6-review.md)

Slide 4 begins with the narrow and systemic views of code review, including its
knowledge, shared understanding, ownership, operability and architecture outputs.
It retains the local comprehension-gap explanation and ownership consequences,
then extends the argument across the SDLC with an explicitly illustrative graph.
All additions use the existing dark theme and native editable elements. The full-deck
review also moves one slide-5 body-text box down by 10 points; wording stays intact.

R6 integrates the conversation's full R13 working deck and approved slide donor.
**R13 remains the speech revision; R6 is the repository edition.** The unchanged
[concise stage script R13](devcon-romania-2026-r13-concise-stage-script.md) remains
available separately. The native notes append slide-4 context and source details
outside the spoken section.

The retained editorial allocation is **19:55 talk + 7:00 Q&A + 3:05 reserve**.
It is a planning target, not a measured duration of the R13 script. Timed rehearsal
and presenting-device acceptance remain pending.

## Argument

The engineering cycle **problem → hypothesis → build → verify → reframe** links
two owned system problems:

1. **How We Build:** rebalance the SDLC as a complete delivery system; licenses,
   code volume or review speed alone do not establish system-level ROI.
2. **What We Build:** determine whether consequential runtime model judgment can
   remain useful, bounded, observable, correctable and economically viable in a
   specific business context.

The deck retains the account-recovery scenario, qualified evidence, operational
responsibilities, two closing projects and one final homepage QR.

## Editions

| Edition | Repository status | Purpose |
| --- | --- | --- |
| **R6** | Current author-review draft; complete PPTX/PDF/notes package | Approved systemic-first slide 4 integrated into the full R13 working deck |
| **R5** | Historical notes/manifest; declared PPTX/PDF were not committed | Problem-framing narrative and consolidated R4 working lineage |
| **R4** | No repository package | Historical scratch labels; no retained edition |
| **R3** | Preserved; still selected by the event record | Nine-slide compression with short cue cards |
| **R2** | Preserved | Eleven-screen correction of R1 visual drift |
| **R1** | Preserved | First thirteen-screen adaptation |

Historical editions remain unchanged. In particular, R6 bytes do not replace the
missing R5 files or claim to satisfy their declared hashes. R1–R3 rationale is
retained in the [R3 README at its exact commit](https://github.com/oborskyivitalii/oborskyivitalii/blob/793cfaef95fdf96c17b2f33cafe7d0ba1f0ad6a4/drafts/devcon-romania-2026/README.md).

## Reproduce and validate

Follow the [presentation versioning contract](../../guides/PRESENTATION-VERSIONING.md)
and the [native integration command](r6/sources/README.md). Export the verified
final PPTX using the existing LibreOffice Impress rendition method:

```bash
soffice --headless --convert-to pdf:impress_pdf_Export \
  --outdir /tmp/devcon-r6-export \
  drafts/devcon-romania-2026/r6/devcon-romania-2026-r6.pptx
python3 tools/presentations/validate_edition.py drafts/devcon-romania-2026/r6
```

Use a new scratch output directory for re-export. PDF metadata can differ between
exports; compare page content, text, links and rendered pages as well as recording
the actual delivered byte identity. The edition validator checks mechanical
identity and counts; it does not replace content, source, QR, rehearsal or device
acceptance.

## Event binding and provenance

The event record continues to select the exact R3 PDF. Preparing R6 in Draft
PR110 does not publish it, merge it or select it for the conference. Full R6 author
approval, an explicit event selection and the remaining human checks are separate.

Historical PMDay/R38 pins are retained in `r6/edition.json`. Exact native input
identities and the approved slide-4 reference are under `r6/sources/`; the full
notes retain the original citations and caveats. The curves are conceptual, with
no empirical scale or invented measured values.
