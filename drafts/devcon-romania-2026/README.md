# DevCon Romania 2026 presentation editions

**AI Changes the Delivery System and the Product Itself**  
Vitalii Oborskyi · DevOps Stage · 4 November 2026

**Current author-review edition: R5 — 9 slides, attached English stage notes, and matching PDF.**  
Target: **19:55 talk + 7:00 Q&A + 3:05 reserve**. This is an editorial allocation; timed rehearsal and presenting-device acceptance remain pending.

One owner and one execution thread: [issue 109](https://github.com/oborskyivitalii/oborskyivitalii/issues/109) · [Draft PR110](https://github.com/oborskyivitalii/oborskyivitalii/pull/110).

## Review R5

**Repository delivery status:** the R5 notes, manifest, versioning contract and validator are prepared for this Draft PR. The exact PPTX/PDF are temporarily staged for review and must still be committed to the planned R5 paths before repository acceptance.

- [Planned editable PowerPoint path](r5/devcon-romania-2026-r5.pptx)
- [Matching PDF](r5/devcon-romania-2026-r5.pdf)
- [Full English script, split by slide](r5/speaker-notes.md)
- [Edition identity, source pins, timing and artifact hashes](r5/edition.json)
- [Presentation versioning contract](../../guides/PRESENTATION-VERSIONING.md)

R5 consolidates the uncommitted conversation-local working labels `R4 v2` through `R4 v6`. Those labels were scratch lineage, not repository editions. The previous committed repository edition is R3; R1–R3 remain immutable.

## R5 argument

R5 uses the engineering cycle **problem → hypothesis → build → verify → reframe** to state two owned system problems:

1. **How We Build:** rebalance the SDLC as a complete delivery system; licenses, code volume or review speed alone do not establish system-level ROI.
2. **What We Build:** determine whether consequential runtime model judgment can be kept useful, bounded, observable, correctable and economically viable in a specific business context.

The presentation is designed for DevOps/SRE/platform practitioners, developers, QA, architects and technical leadership. It retains one account-recovery scenario, qualified evidence, explicit operational responsibilities and one final homepage QR.

## Editions

| Edition | Repository status | Purpose |
|---|---|---|
| **R5** | Current author-review draft | Problem-framing narrative; full 9-slide R4 working lineage consolidated into one repository edition |
| **R4** | No repository package | Reserved working lineage only; intentionally skipped as a committed edition to end nested `R4 vN` naming |
| **R3** | Preserved in PR110 head `793cfae` | Nine-slide compression with short cue cards |
| **R2** | Preserved | Eleven-screen correction of R1 visual drift |
| **R1** | Preserved | First thirteen-screen adaptation |

Detailed R1–R3 rationale remains available in the [R3 README at its exact commit](https://github.com/oborskyivitalii/oborskyivitalii/blob/793cfaef95fdf96c17b2f33cafe7d0ba1f0ad6a4/drafts/devcon-romania-2026/README.md).

## Versioning rules

Presentation revisions follow [the repository presentation versioning contract](../../guides/PRESENTATION-VERSIONING.md):

- one monotonic `R<number>` per retained review package;
- the same revision in PPTX, PDF, notes and manifest names;
- status (`draft`, `approved`, `conference-final`, `published`) is separate from the revision;
- earlier editions are immutable;
- temporary renders do not receive durable repository revision numbers;
- event selection is separate from the newest author-review edition.

Validate the mechanical package with:

```bash
python tools/presentations/validate_edition.py drafts/devcon-romania-2026/r5
```

This does not replace content, source, QR, timing, independent-review or projector gates.

## Event binding

The event record still selects the exact R3 PDF. R5 becomes event-selected only after author approval and a deliberate update of the event PDF path/hash and event-plan source pin. Preparing R5 in this Draft PR does not publish it, merge it or authorize conference release.

## Source and provenance

R5 retains native PMDay v35 components from Uncertainty Architecture commit `22639d311d5fb46a23f3d5cdd819800dbe1169d9` and the R38 conceptual source pinned at personal-site PR79 head `b128ad27b23bc9d14a62b495c5c18b7ae537ab65`. Exact identities and limits are recorded in `r5/edition.json` and the attached notes.
