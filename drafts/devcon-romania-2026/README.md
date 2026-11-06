# DevCon Romania 2026 presentation editions

**Current author-review edition: R10**, revised 6 November 2026.

- [Editable PowerPoint](r10/devcon-romania-2026-r10.pptx)
- [Deck PDF](r10/devcon-romania-2026-r10.pdf)
- [Full synchronized speech](r10/speaker-notes.md) and [reading PDF](r10/devcon-romania-2026-r10-speech.pdf)
- [R10 sources, scope and re-export](r10/README.md)
- [Edition hashes](r10/edition.json)
- [Current review](../../review/issue-109/2026-11-06-r10-review.md)

R10 updates S01–S05 from article R10 and preserves delivered 3-Nov external R12
S06–S09. Nine slides; 1,434 spoken words versus 1,423 (+11). Timing is unmeasured.
Same issue109 and Draft PR110; event-selected R3 remains unchanged. Historical
R9/R14 artifacts and the earlier index below are preserved, not current acceptance.

---

## Preserved index as of 2 November 2026


**AI Changes the Delivery System and the Product Itself**  
Vitalii Oborskyi · DevOps Stage · 4 November 2026

**Current author-review edition: R9 — complete editable PPTX and matching PDF.**
Architecture and project commitment now precede runtime validation. Both slides
have a clearer reading order with their technical breadth retained. All nine
slides were inspected and alignment polished.

One owner: [issue109](https://github.com/oborskyivitalii/oborskyivitalii/issues/109)
· existing [Draft PR110](https://github.com/oborskyivitalii/oborskyivitalii/pull/110).

## Current stage script: R14 for deck R9

- [Concise English script R14](devcon-romania-2026-r14-concise-stage-script.md)
- [Reading PDF: one slide per page](devcon-romania-2026-r14-concise-stage-script.pdf)
- [Speech-only alignment review](../../review/issue-109/2026-11-02-r14-speech-review.md)

R14 contains **1,530 spoken words**, compared with **1,552 in R13**. Seven
spoken blocks remain verbatim; current S07/S08 receive targeted emphasis edits.
Architecture and commitment stay in S07; runtime monitoring, human response
capacity and intervention move together to S08. Delivery cues follow R9.

R14 is a separate speech revision. The retained R9 package, its native/Markdown
notes and the historical R13 script remain unchanged. Use R14 for the current
concise delivery; attached R9 notes retain the earlier speech and references.

## Review R9

- [Editable PowerPoint](r9/devcon-romania-2026-r9.pptx)
- [Matching PDF](r9/devcon-romania-2026-r9.pdf)
- [Complete synchronized notes](r9/speaker-notes.md)
- [Edition identity and artifact hashes](r9/edition.json)
- [Native source/provenance and reproduction](r9/README.md)
- [Bounded review](../../review/issue-109/2026-11-02-r9-review.md)

S07 follows the control loop, conditional human architectural dependency and
control/operating/business evidence before commitment. S08 follows admission,
ongoing observation and reassessment of operating authority. The 196/3/1 example,
preventive limits, qualified human capacity, full cost and intervention options
remain visible; neither slide becomes a list of slogans.

The first-half sequence remains **delivery imbalance → comprehension/ownership
(S03) → qualified evidence (S04) → contextual responses**. The R6/R13 source order
is `1,2,4,3,5,6,8,7,9`. R13 spoken wording is retained, with delivery labels and
reference navigation synchronized. The historical [R13 script](devcon-romania-2026-r13-concise-stage-script.md)
keeps its original order. R14 above is the current concise delivery script;
R9 attached/Markdown notes remain the unchanged historical package.

The planning envelope is **at most 23 minutes speaking + 7 minutes Q&A** in the
30-minute slot. This has not been verified by timed English rehearsal. Older
reference-note estimates remain historical; author/device acceptance is separate.

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
| **R9** | Current author-review draft; complete package | Architecture/planning before runtime; clearer S07/S08 and all-nine alignment |
| **R8** | Preserved complete package | Explicit people monitoring and control architecture/business-case decision |
| **R7** | Preserved complete package | R6 positions3/4 exchanged; notes and delivery numbers synchronized |
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
and the [native source/re-export instructions](r9/README.md). Export the verified
final PPTX using the existing LibreOffice Impress rendition method:

```bash
soffice --headless --convert-to pdf:impress_pdf_Export \
  --outdir /tmp/devcon-r9-export \
  drafts/devcon-romania-2026/r9/devcon-romania-2026-r9.pptx
python3 tools/presentations/validate_edition.py drafts/devcon-romania-2026/r9
```

Use a new scratch output directory for re-export. PDF metadata can differ between
exports; compare page content, text, links and rendered pages as well as recording
the actual delivered byte identity. The edition validator checks mechanical
identity and counts; it does not replace content, source, QR, rehearsal or device
acceptance.

## Event binding and provenance

The event record continues to select the exact R3 PDF. Preparing R9 in Draft
PR110 does not publish it, merge it or select it for the conference. Full R9 author
approval, an explicit event selection and the remaining human checks are separate.

Historical PMDay/R38 pins are retained in `r9/edition.json`. The complete R6 source
is pinned there; its original native input identities and the approved ownership
reference remain under `r6/sources/`. The full
notes retain the original citations and caveats. The curves are conceptual, with
no empirical scale or invented measured values.
