# DevCon Romania 2026 presentation editions

**AI Changes the Delivery System and the Product Itself**  
Vitalii Oborskyi · DevOps Stage · 4 November 2026

**Current author-review draft: R2 — 11 screens, 23 minutes speaking + 5 minutes Q&A + 2 minutes reserve.** Actual speaking time remains subject to rehearsal.

One thread of intent and execution: [issue 109](https://github.com/oborskyivitalii/oborskyivitalii/issues/109) and [draft PR110](https://github.com/oborskyivitalii/oborskyivitalii/pull/110).

## Review R2

- [Editable PowerPoint with English speaker notes](r2/devcon-romania-2026-r2.pptx)
- [Matching PDF for visual review](r2/devcon-romania-2026-r2.pdf)
- [English notes, timings and optional Q&A reference](r2/speaker-notes.md)
- [Agreed visual plan, with dated R2 amendments](plan.md)
- [Edition identity, source mapping and artifact hashes](r2/edition.json)
- [R2 plan-to-render review and verification](../../review/issue-109/2026-10-19-r2-review.md)
- [Event record selecting this PDF](../events/devcon-romania-2026/event.json)

## Audience and argument

The primary audience is experienced DevOps, SRE and platform engineers, tech leads, architects and engineering leaders responsible for delivery and production. This is the intended audience for the adaptation, not a claim about measured attendee demographics.

The author requested a shorter English version of the 40–50-minute PMDay talk. Uneven changes in generation, review, integration and human understanding can unbalance the SDLC. The industry is searching for a new equilibrium. Proposed operating models are hypotheses about a particular context; their fit and sufficiency need evidence.

The two sides share a cause: redistribution of cognitive work. AI changes HOW teams build software and WHAT products do when consequential runtime responsibility depends on model judgment. The sociotechnical argument connects models and workflow with human knowledge, ownership, decision rights, learning, operational capacity and feedback.

The full original reports slide remains intact. The talk offers questions for assessing proposed approaches. It does not become a catalogue of tools or universal countermeasures. Existing mature practices retain their value; combining them into an adequate operating model still depends on conditions and evidence.

## Editions and history

| Edition | Status and purpose | Files |
|---|---|---|
| R2 | Current corrected 11-screen draft for author review and DevCon preparation | [PPTX](r2/devcon-romania-2026-r2.pptx), [PDF](r2/devcon-romania-2026-r2.pdf), [notes](r2/speaker-notes.md), [edition](r2/edition.json) |
| R1 | Preserved 13-screen first draft; comparison/history after the author identified visual drift | [PPTX](DevCon-Romania-2026-R1.pptx), [PDF](DevCon-Romania-2026-R1.pdf), [notes](speaker-notes.md), [edition](edition.json) |

R1's four edition files are unchanged from commit `f1531f321a9ea0b983ccee427cf485a161ab3b21`. Its original README and review remain available in that commit; the [R1 review](../../review/issue-109/2026-10-19-review.md) is retained as historical evidence. The earlier review did not adequately compare the visible slides with the agreed outline. Its positive notes/deck assessment must not be read as acceptance of plan alignment.

An edition is a coherent review milestone: PPTX, PDF, notes and a source/artifact manifest. Preserve an edition once it has been shown to the author. Use Git history for routine edits within the next draft. Temporary renders and authoring scratch files do not need to enter the repository.

The plan remains a review input. An edition must either implement it visibly or record a dated editorial amendment. Moving the intended argument only into speaker notes is insufficient.

## R2 corrections after the author's review

| Area | R1 discrepancy | Visible R2 correction |
|---|---|---|
| Opening | Old coding-help captions obscured the shared delegation thesis | Judgment during delivery / Judgment at runtime, plus explicit delegation subtitle |
| Comprehension | Two full screens and the old yes/no questions | One curve with explain/maintain/recover and the human-recovery consequence |
| New balance | Tool/countermeasure catalogue remained despite the plan | Capabilities → operating model → working hypotheses; three conditions-and-evidence questions |
| Runtime behavior | Two screens plus a path, mathematical and standards detour | One definition and one IT-assistant behavioral-space example |
| Evaluation | Bug/tolerance taxonomy and Wilson interval dominated | Retained 196/3/1 chart, critical breach/block-release decision and readiness |
| Control | Technical plumbing carried the visual emphasis | Evidence, authority and capacity; shorter action path and an explicit effective feedback loop |
| Roles | PM banner and large unfamiliar-language example | HOW/WHAT capacity table and shared dependencies; expertise example is spoken |
| Conclusion | Large cadence matrix; four questions reduced to a small footer | Compact laboratory loop above four large, readable questions |

The final resource screen has one large QR to **https://vitaliioborskyi.ai/** and a readable address. It remains on screen during Q&A. “Research · Articles · Talks” describes the resource; it does not claim the DevCon deck is already published on the site.

## Sequence and timing

| R2 | Primary PMDay slide; other contribution | Visible title | Target time |
|---:|---|---|---|
| 1 | 1; delegation from 2 | AI Changes the Delivery System and the Product Itself | 00:00–01:30 |
| 2 | 3 | We Accelerated a Step. Not the System. | 01:30–03:30 |
| 3 | 4, complete | The Evidence Is Already Messy | 03:30–08:00 |
| 4 | 5; recovery from 6 | The New Scarcity Is Human Comprehension | 08:00–10:30 |
| 5 | 7 | We Are Searching for a New SDLC Equilibrium | 10:30–12:30 |
| 6 | 9; definition from 8 | When Software Starts Thinking | 12:30–14:00 |
| 7 | 10; readiness from 11 | Evidence Changes the Release Decision | 14:00–16:00 |
| 8 | 12 | Control Is a Sociotechnical Capability | 16:00–18:00 |
| 9 | 13; capacity from 12 | The Roles Move With the System | 18:00–20:30 |
| 10 | 14 | Engineering Rigor Moves — It Doesn’t Disappear | 20:30–23:00 |
| 11 | 15, website destination amendment | Continue the Conversation | 23:00–28:00, Q&A |
| | | Reserve | 28:00–30:00 |

The main narration contains approximately 2,402 spoken words. The report slide retains its full 4½-minute window. Stage directions, preparation links and the optional statistical Q&A reference are outside that count. This is a pacing estimate, not a measured rehearsal result.

## Binding the edition to the event

The [DevCon event record](../events/devcon-romania-2026/event.json) owns event facts and chooses one exact PDF through `deck.path`, `deck.sha256` and `deck.credit`. R2 is selected for preparation. The file remains at its edition path; it is not copied into the event directory.

The [English event brief](../events/devcon-romania-2026/brief.en.md) records context and presentation ownership. [Organizer evidence](../events/devcon-romania-2026/sources/organizer.md) distinguishes official public facts from author-confirmed session details. The [event plan](../events/devcon-romania-2026/plan.json) pins the event record and brief, with `pieces: []`; no distribution content, schedule or messages are created.

These data follow the event contract in issue 106 / PR107, validated using its pinned producer commit `5ce3a256be5ce882bc871f9bdf976b06727d3e69`. That shared implementation is still separate work. No copy of its adapter or validator is introduced here. Event/campaign revision numbers describe event planning; R1/R2 describe presentation milestones.

When a later deck edition is chosen, update the event's exact PDF path/hash and refresh the event-plan source pin together. Keep earlier editions available for comparison. Selecting a draft for event preparation does not publish it on the website, approve a release, merge a PR or authorize sending messages. The article-specific public-material selection workflow is not an event publication registry.

## Editing, reuse and provenance

The PPTX is the editable native presentation. `r2/speaker-notes.md` owns the English narration; changes must be synchronized with the corresponding PPTX notes. The PDF is exported from the same finalized PPTX. `r2/edition.json` pins the plan, source, mapping, predecessor and all three artifact identities.

R2 reuses native components from the existing PMDay deck: paired artwork, delivery flow, complete evidence composition, comprehension curve, behavioral-space diagram, chart/workbook, HOW/WHAT table, control nodes, laboratory nodes and resource-slide style. The source theme, master/layout parts, original media, chart and embedded workbook remain byte-identical. Layouts are deliberately adapted where needed to implement the agreed argument. The new QR is a functional encoded asset.

The source is [PMDay v35 in UA PR113](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/pull/113), pinned to commit `22639d311d5fb46a23f3d5cdd819800dbe1169d9`:

- [Native source presentation](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/ai-changes-both-sides.pptx), SHA256 `d40acf0d3e716eb1324acb3ff1b21a6b43d0225687b84984a818a9518f098ecc`.
- [Source content](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md) and [evidence register](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/EVIDENCE.md).
- [Original artwork provenance](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/artwork/PROVENANCE.md).

The full evidence slide changes only its visible page number, 04 → 03. All source evidence qualifications remain. The upstream PMDay file and research claims are untouched. No new presentation engine or public website route is introduced.

The author-owned adaptation follows [content terms](../../LICENSE-CONTENT.md) and the repository's [licensing scope](../../LICENSING.md). Upstream material, third-party sources, personal identity and the generated cover retain their respective provenance and terms.

## Remaining author decisions

Review R2's content and emphasis, then rehearse the English script and confirm the deck on the actual presenting device/projection setup. Record changes and actual timing in issue 109 / PR110. R2 remains an author-review draft until those decisions are recorded.
