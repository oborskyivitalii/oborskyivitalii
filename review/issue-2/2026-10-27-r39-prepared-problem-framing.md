# Issue #2 / publisher #5 — prepared R39 problem-framing candidate

Date: 27 October 2026. Editorial owner: [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2). Execution owner: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5), existing [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).

**Status: a complete editorial candidate and illustrated review PDF were prepared and supplied to the author; the canonical publication selection is NOT advanced.** This file records provisional preparation, not independently accepted repository implementation. No previous edition or publication source is overwritten by this commit.

## Intent, inspected source and boundaries

The author approved four replacements after the analysis of the Romania presentation framing: an explicit engineering loop in the introduction; the organisation-level adoption problem and owner in Part I; mechanisms versus whole-system control in Part II; feasibility, expertise, budgets and project-admission consequences in Part III. No extra chapter, table, case study or marketing-motive allegation was authorised. The presentation itself was not edited.

The exact starting source is PR79 commit `02a4f6aeb04feb663baf7d170e3a9861ae718b6a`, `site/publications/pmday-ai-both-sides/manuscript.en.md`, SHA-256 `85ad467b0da1774a0c1c29a8adec55c2abecaffde8c778d22f9e2913d8f5296e`. Its locally reconstructed bytes were verified against both that SHA-256 and Git blob `917e9e9c0812b19475f6353f2dd4e4697a6ed274` before editing. Source length is 52,993 characters. Main was separately observed at `83591bdfa99cba7649968cf94a6335e98af2847e`; its #122 handoff is not an article acceptance receipt.

The prepared R39 source is `The_Sum_of_Our_Technology_R39_2026-10-27.md`, SHA-256 `3dfdd59246a5ab40abbf190dd07d387c45d93bbff5f074cb81fcea92fb47318e`: **52,845 characters, 148 fewer than R38**. This is a source-text measurement, not an executed native platform-character-limit check. The four substitutions below plus the explicitly listed metadata changes reconstruct the candidate. All other manuscript bytes are retained.

## Exact four replacement regions

### 1. Introduction

Replace the region starting `Engineering starts with the problem` and ending immediately before the existing `[Slides (PDF)` paragraph with the following, preserving a blank line after each paragraph:

```markdown
**Engineering is a loop: define the problem, form a hypothesis, implement it, verify the result and validate whether it solves the problem.** If not, revisit implementation, hypothesis—even the problem statement. **“What if not?”** tests assumptions; it does not predict every failure. Solving the wrong problem faster is no gain.

My PMDay talk connects two questions: how to turn local AI acceleration into reliable end-to-end delivery, and how to keep consequential model judgment within justified business and risk limits. **Both shape architecture, staffing and funding before implementation.**

My January 2026 writing outlined a **possible SDLC imbalance** [\[37\]](https://dou.ua/forums/topic/57244/): output can outrun verification, rushed approval erode understanding, and costs move downstream. *The Subprime Code Crisis* [\[9\]](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) develops these interactions across integration, maintenance and recovery. *Uncertainty Architecture* [\[20\]](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) separately examines control over runtime model judgment. This essay connects both to project decisions.
```

### 2. Part I opening

Replace the region starting `**Rebalancing the SDLC becomes` and ending immediately before `### We accelerated a step.`:

```markdown
**The adoption problem is not buying licences. It is turning local acceleration into reliable end-to-end value.** When generation outruns verification, integration or human understanding, test whether the SDLC needs rebalancing. Review is one node, not the delivery system; clearing its queue while losing knowledge transfer is no improvement.

**Name an owner with authority across the delivery system.** Teams remain accountable for machine-made decisions. They need not read every line if demonstrably adequate mechanisms preserve verification, shared understanding and recovery. Diagnose the actual constraint; adjust intake, dependencies and capacity; test whole-system outcomes. Rebalancing is a hypothesis to test, not proof of ROI.
```

### 3. Part II opening

Replace the region starting `**How We Build concerns` and ending immediately before `Six assumptions need continued testing.`:

```markdown
**The second problem is bounded operation around probabilistic, partly opaque judgment—not merely connecting a model to software.** Agentic applications are one case; even read-only advice can influence someone with authority. The account-recovery assistant now retrieves guidance and proposes actions.

**Harnesses, feedback loops, evaluators and agents checking agents are mechanisms, not proof of system-level control.** I use control theory to organise the questions: what outcomes and limits, which signals and disturbances, whose corrective actions, and can intervention precede irreversible consequences? It complements security, statistics, human factors and domain policy; it guarantees neither reliability nor ROI.

The engineered object is a contextual **socio-technical arrangement**: model, policy, permissions, checks, observation, fallback and people able to intervene. Name an accountable system owner; assign policy, engineering and operational responsibilities, with authority to narrow or stop operation. Open-ended inputs permit semantic errors; model, retrieval or provider changes can invalidate evidence without an application release.

In my *Uncertainty Architecture* [\[20\]](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture), a *Thinking System* [\[21\]](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md) has consequential runtime responsibilities partly dependent on such judgment. This is a scope definition, not consciousness or a proven universal architecture.
```

### 4. Part III opening

Replace the region starting `**The first investment decision` and ending immediately before `| Decision | Evidence and limit |`:

```markdown
**Correct framing changes the project plan before implementation:** risk maps, staffing and full operating budgets, not just tool choice. Uncertain feasibility may require bounded R&D and control, statistical, safety or domain expertise. A control specialist may need to model whether available signals and interventions support the requested authority. Before committing to a full build, require evidence to justify its proposed authority; otherwise narrow delegation, revise scope or decline the project as proposed. Missing evidence does not prove that every solution is impossible.

**Would you still bet all-in on AI if no universal balance emerges?** The CTO decides where delegation earns its full cost—including maintenance, support and oversight—and where simpler methods or no AI are better.

Compare AI with both the current process and the simplest safe alternative under the same task, identity and safety requirements, using comparable cases, data and staffing. Measure completed recoveries, completion time and unnecessary transfers, not clicks. Separate the model's contribution from gains in the shared downstream process; routing gains do not justify broader action.

Predeclare these **illustrative pilot limits** for the recovery team. They are not measured findings or universal thresholds.
```

### Version and provenance metadata only

- Replace the cover byline `Editorial draft R38 · 25 October 2026` with `Editorial draft R39 · 27 October 2026`.
- Replace both citation/BibTeX note occurrences of `Editorial draft R38, 25 October 2026` with `Editorial draft R39, 27 October 2026`; replace BibTeX key `oborskyi2026sumR38` with `oborskyi2026sumR39`.
- In Dimitris's existing provenance, replace `He did not review R38.` with `He did not review this edition.` His R23 attribution and the author's preference for shorter linked posts remain intact.
- Immediately after `## Revision history`, insert the date `27 October 2026:` and the entry `- **R39 (author):** Problem-framing loop, system owners, control mechanisms versus assurance, and feasibility-led project decisions.` Preserve existing dated history.

## Actual preparation checks

Implementer checks, not independent QA: exact baseline byte identity; four declared body replacements and metadata only; source notes byte-identical; 37 numbered references, all 12 standalone prompts, both tables and all four figure declarations preserved. Ordered source-link destinations remain unchanged. All existing reviewer dispositions and the short-linked-post preference are retained. No new empirical finding, universal SDLC diagnosis, mandatory mathematics professor, guaranteed control/ROI result or vendor-motive assertion is added.

The illustrated local review PDF is `The_Sum_of_Our_Technology_R39_2026-10-27_REVIEW.pdf`, **17 A4 pages**, 851,295 bytes, SHA-256 `049a79768c41fbd556cf54ed4e17925dac35e687a601b9607bf0ef3d90acdd8c`. Producer: **WeasyPrint 68.0**, not the native repository publisher. It has 23 bookmarks, 131 link annotations, all 44 exact external manuscript destinations and four actual image placements. Extracted visible paragraphs/headings/table cells agree with the rendered HTML; no text bounds extend beyond a page. Poppler and PyMuPDF renders were inspected. Reviewer provenance is grouped together on page 17. These are local review-artifact observations, not native-editor/device or current-source CI acceptance.

Media came from the verified historical `site-public-review-39457580370-1` artifact, id12280704652, ZIP SHA-256 `fb885527b8688fc47ae143d717e2ed47c87914aa27dc201d89f1392af8d398a4`. The declared cover JPEG and three WebP slide renditions were individually checked against their content-addressed file hashes; slide images were decoded to PNG for the review pack. This preserves the historical visual material and its declared captions/credits, **not byte-for-byte parity with the canonical source PNG files**. No new image or slide content was generated. The artifact's historical source/run is not relabelled as R39.

The first local PDF-link checker misparsed a DOI containing parentheses with a regex, and initially counted shared PDF image resources rather than displayed placements. The PDF contained the full DOI and four images. The checker was corrected to use Markdown tokenization and actual image-placement records; the original failed check is retained in the local evidence. This is a checker correction, not an article/source repair or a claim that native tests passed.

## Required independent roles and remaining route

Requirements/Acceptance, Code/Artifact Review, White-box QA and Exploratory/Interaction QA: **no completed independent role results obtained**. Implementer comparison and visual inspection do not replace them. This prevents promotion of the prepared manuscript into the selected publication edition or claiming implementation/readiness acceptance.

The canonical manuscript, publication/profile/launch selection, historical editions, native site/PDF/platform outputs, rights decisions and #122 work remain unchanged by this preparation. Native publishing, current-source Basic/RI/CI, generated outputs, four independent roles and author/rights/publication decisions remain open. No issue checkbox is raised, no merge or release is performed.

Next bounded integration, after the required independent preflight: apply this exact candidate through the existing article owner, create a new immutable R39 source edition, refresh source/semantic/profile/byline/launch bindings together, regenerate through the existing publisher, rebuild RI, inspect exact outputs and complete current-source acceptance. Keep PR79 Draft and preserve the no-publication boundary. The candidate and PDF supplied in the conversation are usable for author review now; they are not claimed to be an accepted native publication kit.
