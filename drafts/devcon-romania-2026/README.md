# DevCon Romania 2026 presentation editions

**AI Changes the Delivery System and the Product Itself**  
Vitalii Oborskyi · DevOps Stage · 4 November 2026

**Current author-review draft: R3 — 9 slides in total, including the closing QR.** The pacing target is **20 minutes presenting + 7 minutes Q&A + 3 minutes reserve**. This is an editorial budget requiring a timed rehearsal, not a measured duration.

One thread of intent and execution: [issue 109](https://github.com/oborskyivitalii/oborskyivitalii/issues/109) and [draft PR110](https://github.com/oborskyivitalii/oborskyivitalii/pull/110).

## Review R3

- [Editable PowerPoint with attached English cue cards](r3/devcon-romania-2026-r3.pptx)
- [Matching PDF for visual review](r3/devcon-romania-2026-r3.pdf)
- [Three to five English sentences per slide and pacing boundaries](r3/speaker-notes.md)
- [Original visual plan with dated R2 and R3 amendments](plan.md)
- [Edition identity, retained-slide mapping and artifact hashes](r3/edition.json)
- [R3 compression and timing review](../../review/issue-109/2026-10-19-r3-review.md)
- [Event record selecting the current draft PDF](../events/devcon-romania-2026/event.json)

## Why R3 is a shorter talk

The author's timing challenge is valid: reducing slide count without removing explanatory work does not make a 45-minute talk fit a 23-minute allocation. R1 had 13 screens; R2 corrected the argument in 11 screens but retained separate evaluation and technical control lessons. Neither allocation was established by rehearsal.

R3 removes those two lessons from the presenting sequence. The HOW/WHAT table now synthesizes the sociotechnical consequence of delegation, including evidence, authority and capability. The retained runtime scenario is the single concrete product example. The reports slide stays complete, while its oral explanation focuses on the contrast between measured outcomes rather than reading every cell.

The conclusion shows the four existing questions at larger type. R2's laboratory workflow and feedback diagram is removed from that screen so the closing argument does not introduce another process lesson.

The short English notes are **cue cards**, with three to five sentences per slide. They capture the point, example and transition. Reading those paragraphs verbatim would be much shorter than 20 minutes; the budget includes deliberate explanation of the retained visuals, examples, transitions and pauses. Rehearsal must test that budget and decide what needs further cutting.

| R3 | R2 source | Visible title | Target interval |
| ---: | ---: | --- | --- |
| 1 | 1 | AI Changes the Delivery System and the Product Itself | 00:00–01:00 |
| 2 | 2 | We Accelerated a Step. Not the System. | 01:00–03:30 |
| 3 | 3 | The Evidence Is Already Messy | 03:30–07:30 |
| 4 | 4 | The New Scarcity Is Human Comprehension | 07:30–09:30 |
| 5 | 5 | We Are Searching for a New SDLC Equilibrium | 09:30–11:30 |
| 6 | 6 | When Software Starts Thinking | 11:30–14:30 |
| 7 | 9, recast | Delegation Changes the Sociotechnical System | 14:30–17:30 |
| 8 | 10 | Engineering Rigor Moves — It Doesn’t Disappear | 17:30–19:30 |
| 9 | 11 | Continue the Conversation | 19:30–20:00 |
| | | Questions; final QR remains visible | 20:00–27:00 |
| | | Reserve | 27:00–30:00 |

The four-minute report allocation and twenty-minute total are limits to test, not evidence of the author's delivery speed. Author rehearsal and presenting-device acceptance remain open under AC06.

## Preserved R2

- [Editable PowerPoint with English speaker notes](r2/devcon-romania-2026-r2.pptx)
- [Matching PDF for visual review](r2/devcon-romania-2026-r2.pdf)
- [English notes, timings and optional Q&A reference](r2/speaker-notes.md)
- [Agreed visual plan, with dated R2 amendments](plan.md)
- [Edition identity, source mapping and artifact hashes](r2/edition.json)
- [R2 plan-to-render review and verification](../../review/issue-109/2026-10-19-r2-review.md)
- The event selected this PDF during R2 preparation; the current selection is recorded separately above.

## Audience and argument

The primary audience is experienced DevOps, SRE and platform engineers, tech leads, architects and engineering leaders responsible for delivery and production. This is the intended audience for the adaptation, not a claim about measured attendee demographics.

The author requested a shorter English version of the 40–50-minute PMDay talk. Uneven changes in generation, review, integration and human understanding can unbalance the SDLC. The industry is searching for a new equilibrium. Proposed operating models are hypotheses about a particular context; their fit and sufficiency need evidence.

The two sides share a cause: redistribution of cognitive work. AI changes HOW teams build software and WHAT products do when consequential runtime responsibility depends on model judgment. The sociotechnical argument connects models and workflow with human knowledge, ownership, decision rights, learning, operational capacity and feedback.

The full original reports slide remains intact. The talk offers questions for assessing proposed approaches. It does not become a catalogue of tools or universal countermeasures. Existing mature practices retain their value; combining them into an adequate operating model still depends on conditions and evidence.

## Editions and history

| Edition | Status and purpose | Files |
|---|---|---|
| R3 | Current 9-slide draft with short cue cards and reduced explanatory scope | [PPTX](r3/devcon-romania-2026-r3.pptx), [PDF](r3/devcon-romania-2026-r3.pdf), [notes](r3/speaker-notes.md), [edition](r3/edition.json) |
| R2 | Preserved 11-screen correction of R1's visual drift; 23+5+2 was an unverified pacing plan | [PPTX](r2/devcon-romania-2026-r2.pptx), [PDF](r2/devcon-romania-2026-r2.pdf), [notes](r2/speaker-notes.md), [edition](r2/edition.json) |
| R1 | Preserved 13-screen first draft; comparison/history after the author identified visual drift | [PPTX](DevCon-Romania-2026-R1.pptx), [PDF](DevCon-Romania-2026-R1.pdf), [notes](speaker-notes.md), [edition](edition.json) |

R1's four edition files are unchanged from commit `f1531f321a9ea0b983ccee427cf485a161ab3b21`. Its original README and review remain available in that commit; the [R1 review](../../review/issue-109/2026-10-19-review.md) is retained as historical evidence. The earlier review did not adequately compare the visible slides with the agreed outline. Its positive notes/deck assessment must not be read as acceptance of plan alignment.

R2's four edition files remain those from `a2aac3e395c190dc31a3974d83d5da065d12c304`. Its artifact and visual-review evidence apply to that edition; they do not accept R3 or prove a speaking duration.

An edition is a coherent review milestone: PPTX, PDF, notes and a source/artifact manifest. Preserve an edition once it has been shown to the author. Use Git history for routine edits within the next draft. Temporary renders and authoring scratch files do not need to enter the repository.

The plan remains a review input. An edition must either implement it visibly or record a dated editorial amendment. Moving the intended argument only into speaker notes is insufficient.

## Historical R2 corrections after the author's review

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

## Historical R2 sequence and timing

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

The [DevCon event record](../events/devcon-romania-2026/event.json) owns event facts and chooses one exact PDF through `deck.path`, `deck.sha256` and `deck.credit`. R3 is selected for preparation. The file remains at its edition path; it is not copied into the event directory.

The [English event brief](../events/devcon-romania-2026/brief.en.md) records context and presentation ownership. [Organizer evidence](../events/devcon-romania-2026/sources/organizer.md) distinguishes official public facts from author-confirmed session details. The [event plan](../events/devcon-romania-2026/plan.json) pins the event record and brief, with `pieces: []`; no distribution content, schedule or messages are created.

These data follow the event contract in issue 106 / PR107, checked using its pinned producer commit `5ce3a256be5ce882bc871f9bdf976b06727d3e69`. That shared implementation is still separate work. No copy of its adapter or validator is introduced here. Event/campaign revision numbers describe event planning; R1/R2/R3 describe presentation milestones.

When a later deck edition is chosen, update the event's exact PDF path/hash and refresh the event-plan source pin together. Keep earlier editions available for comparison. Selecting a draft for event preparation does not publish it on the website, approve a release, merge a PR or authorize sending messages. The article-specific public-material selection workflow is not an event publication registry.

## Editing, reuse and provenance

The PPTX is the editable native presentation. `r3/speaker-notes.md` owns the short English cue cards, synchronized with the attached PPTX notes. The PDF is exported from the same finalized PPTX. `r3/edition.json` records the plan, source, mapping, predecessors and artifact identities. R3 drops the evaluation chart and detailed control slide from the presenting sequence; the original R2 components and narration remain available in R2.

R3 retains R2's paired artwork, delivery flow, complete evidence composition, comprehension curve, behavioral-space diagram, HOW/WHAT table, four-question conclusion and resource-slide style. The R2 review records its wider native-component preservation, including the chart/workbook and laboratory diagram now omitted from the R3 sequence. Layouts are deliberately adapted where needed to implement the agreed argument. The homepage QR is a functional encoded asset.

The source is [PMDay v35 in UA PR113](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/pull/113), pinned to commit `22639d311d5fb46a23f3d5cdd819800dbe1169d9`:

- [Native source presentation](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/ai-changes-both-sides.pptx), SHA256 `d40acf0d3e716eb1324acb3ff1b21a6b43d0225687b84984a818a9518f098ecc`.
- [Source content](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md) and [evidence register](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/EVIDENCE.md).
- [Original artwork provenance](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/artwork/PROVENANCE.md).

The full evidence slide changes only its visible page number, 04 → 03. All source evidence qualifications remain. The upstream PMDay file and research claims are untouched. No new presentation engine or public website route is introduced.

The author-owned adaptation follows [content terms](../../LICENSE-CONTENT.md) and the repository's [licensing scope](../../LICENSING.md). Upstream material, third-party sources, personal identity and the generated cover retain their respective provenance and terms.

## Remaining author decisions

Review R3's content, emphasis and short cue cards, then rehearse the exact English edition with the visible diagrams and record elapsed times. Confirm the deck on the presenting device/projection setup. These pending observations determine the final conference edition through issue 109 / PR110.
