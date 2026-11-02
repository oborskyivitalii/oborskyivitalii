# DevCon Romania 2026 presentation editions

**AI Changes the Delivery System and the Product Itself**  
Vitalii Oborskyi · DevOps Stage · 4 November 2026

**Current author-review edition: R7 — nine editable slides, attached R13 English
stage notes, and matching text/vector PDF.** Slides 3 and 4 exchange positions:
comprehension/ownership now precedes the research evidence. All slide content and
layout are preserved from R6; only order and delivery labels change.

One owner and one execution thread: [issue 109](https://github.com/oborskyivitalii/oborskyivitalii/issues/109)
· [Draft PR110](https://github.com/oborskyivitalii/oborskyivitalii/pull/110).

## Review R7

- [Editable PowerPoint](r7/devcon-romania-2026-r7.pptx)
- [Matching PDF](r7/devcon-romania-2026-r7.pdf)
- [Native notes in delivery order](r7/speaker-notes.md)
- [Edition identity, mapping and exact hashes](r7/edition.json)
- [Reproduction instructions and pinned input](r7/README.md)
- [Source-bound review and remaining acceptance gates](../../review/issue-109/2026-11-02-r7-review.md)

The argument now runs **delivery imbalance → comprehension and ownership →
qualified evidence → contextual responses**. The new slide 3 keeps the approved
narrow/systemic review comparison, local comprehension-gap explanation, ownership
consequences and lower lifecycle illustration in the existing dark theme. The new
slide 4 retains all empirical qualifications. Those studies measure different
populations and outcomes; the lifecycle curves remain explicitly illustrative.

| R7 position | Content | R6 / standalone R13 section |
| --- | --- | --- |
| 3 | The Comprehension Gap Is an Ownership Risk | 4 |
| 4 | What Are We Actually Measuring? | 3 |

All other positions are unchanged. The R6 slide-5 spacing correction remains
intact. Visible numbers and native note headings follow the current delivery
order. **R13 remains the speech revision; R7 is the repository edition.** The
historical [standalone R13 script](devcon-romania-2026-r13-concise-stage-script.md)
is unchanged; use R7's attached notes or Markdown notes for the reordered talk.
Two inherited reference-note transitions are retained outside the spoken section;
no R13 spoken text has been rewritten.

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
| **R7** | Current author-review draft; complete PPTX/PDF/notes package | R6 positions 3 and 4 exchanged; notes and delivery numbers synchronized |
| **R6** | Preserved complete PPTX/PDF/notes package | Approved systemic-first slide 4 integrated into the full R13 working deck |
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
and the [native reorder command](r7/README.md). Export the verified
final PPTX using the existing LibreOffice Impress rendition method:

```bash
soffice --headless --convert-to pdf:impress_pdf_Export \
  --outdir /tmp/devcon-r7-export \
  drafts/devcon-romania-2026/r7/devcon-romania-2026-r7.pptx
python3 tools/presentations/validate_edition.py drafts/devcon-romania-2026/r7
```

Use a new scratch output directory for re-export. PDF metadata can differ between
exports; compare page content, text, links and rendered pages as well as recording
the actual delivered byte identity. The edition validator checks mechanical
identity and counts; it does not replace content, source, QR, rehearsal or device
acceptance.

## Event binding and provenance

The event record continues to select the exact R3 PDF. Preparing R7 in Draft
PR110 does not publish it, merge it or select it for the conference. Full R7 author
approval, an explicit event selection and the remaining human checks are separate.

Historical PMDay/R38 pins are retained in `r7/edition.json`. The complete R6 source
is pinned there; its original native input identities and the approved ownership
reference remain under `r6/sources/`. The full
notes retain the original citations and caveats. The curves are conceptual, with
no empirical scale or invented measured values.
