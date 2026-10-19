# DevCon Romania 2026 presentation R1

**AI Changes the Delivery System and the Product Itself**  
Vitalii Oborskyi · DevOps Stage · 4 November 2026

First presentation draft for author review under [issue 109](https://github.com/oborskyivitalii/oborskyivitalii/issues/109).

- [Editable PowerPoint with English speaker notes](DevCon-Romania-2026-R1.pptx)
- [PDF for visual review](DevCon-Romania-2026-R1.pdf)
- [English speaker notes and timing](speaker-notes.md)
- [Source identity, exact text changes and slide mapping](edition.json)
- [Independent review and handoff](../../review/issue-109/2026-10-19-review.md)

## Accepted direction

The author requested a 30-minute English DevCon session including questions, adapted from the 40–50-minute PMDay talk. The framing is the search for a new balance in the SDLC as cognitive work moves between people and models. This affects both the delivery system and consequential runtime judgment in the product.

The talk treats proposed operating models as hypotheses about a particular context. Their fit and sufficiency need evidence. The sociotechnical argument connects technical architecture with human understanding, decision rights, ownership and the capacity to intervene. The complete reports slide stays visible. The session offers a way to assess approaches rather than a tool tutorial.

On 19 October, the author additionally requested the actual shortened presentation, maximum reuse of existing slides and a PR to preserve the thread of decisions. This R1 implements that request. Earlier text-only outlines are preparatory material; the PPTX, notes and mapping in this directory now own this edition.

## Reuse and timing

R1 reuses 13 of the original 15 slides without redrawing or merging layouts. The shorter English narration supplies most of the time reduction. Original slide 2's delegation argument is in the opening notes. Original slide 11's release principles remain in the evaluation/control narration, while its detailed DoR/DoD table is outside this main sequence.

| DevCon | PMDay v35 | Slide | Time |
|---:|---:|---|---|
| 1 | 1 | AI Changes the Delivery System and the Product Itself | 00:00–01:30 |
| 2 | 3 | We Accelerated a Step. Not the System. | 01:30–03:30 |
| 3 | 4 | The Evidence Is Already Messy | 03:30–08:00 |
| 4 | 5 | The New Scarcity Is Human Comprehension | 08:00–09:30 |
| 5 | 6 | The Team Is the Last Line of Defense | 09:30–10:30 |
| 6 | 7 | We Are Searching for a New SDLC Equilibrium | 10:30–12:30 |
| 7 | 8 | When Software Starts Thinking | 12:30–13:15 |
| 8 | 9 | Requirements Become Boundaries | 13:15–14:00 |
| 9 | 10 | One Green Test Proves Almost Nothing | 14:00–16:00 |
| 10 | 12 | Production Needs a Control Loop | 16:00–18:00 |
| 11 | 13 | The Roles Move With the System | 18:00–20:30 |
| 12 | 14 | Engineering Rigor Moves — It Doesn’t Disappear | 20:30–23:00 |
| 13 | 15 | Continue the Conversation | 23:00–28:00, Q&A |
| | | Reserve | 28:00–30:00 |

Timing is a rehearsal target. The short transitions on slides 7–8 use one continuous explanation. Dense slides 3, 9 and 10 remain on screen while the speaker explains selected relationships, without reading every label.

## Visible changes

All slide numbers are consecutive in the DevCon edition. Apart from numbering, eight retained slides have unchanged visible content. Five receive focused text edits in their existing objects:

- Opening: the subtitle identifies DevCon Romania, stage and date.
- Comprehension: the illustrative-curve caption refers to the preceding evidence without an obsolete slide number.
- Equilibrium: the right column is labelled “WORKING HYPOTHESES”; the takeaway asks us to test operating models' fit and sufficiency.
- Roles: the foundation explicitly describes redistribution of cognitive work across the sociotechnical system; the lower heading names capacity, ownership and decision rights.
- Closing: the team-cadence label spans evidence and decisions; the existing lower caption carries the four questions about imbalance, mechanism, system outcome and revising the hypothesis.

The complete original evidence slide has no content or layout change. Only its page number changes from 04 to 03. Native charts, embedded workbook data, tables, original artwork, QR destinations, fonts, dimensions, theme and layouts are retained.

## Editing and provenance

The PPTX is the editable native presentation. `speaker-notes.md` owns the shortened spoken text; any subsequent text revision must be synchronized with the corresponding PPTX notes. `edition.json` records the mapping, exact on-screen text changes and artifact identities. The PDF is a derived visual review output, exported from the same PPTX.

The source is [PMDay v35 in UA PR113](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/pull/113), pinned to commit `22639d311d5fb46a23f3d5cdd819800dbe1169d9`:

- [Native source presentation](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/ai-changes-both-sides.pptx), SHA256 `d40acf0d3e716eb1324acb3ff1b21a6b43d0225687b84984a818a9518f098ecc`.
- [Active source content and historical notes](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md).
- [Evidence register](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/EVIDENCE.md).
- [Artwork and QR provenance](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/artwork/PROVENANCE.md).

This derivative copies native slide parts and edits identified text runs and notes. It does not change the upstream PMDay source, its freeze or its research claims. No new presentation engine or website publication route is introduced. Source diagrams and evidence remain editable rather than being replaced by slide screenshots.

The author-owned editorial adaptation follows the repository's [content terms](../../LICENSE-CONTENT.md) and [licensing scope](../../LICENSING.md). Upstream material, third-party sources, personal identity and the existing generated cover retain their respective provenance and terms. Linking the Subprime and UA projects does not relicense those projects.

## Next review

Review the actual presentation, then rehearse the English notes with the dense evidence and control slides visible. Record content changes, actual timing and presenting-device acceptance in issue 109 and its PR. The edition remains R1 for author review until those decisions are recorded.
