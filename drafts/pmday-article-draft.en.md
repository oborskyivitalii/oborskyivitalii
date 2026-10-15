> **Editorial revision 0.6 — 15 October 2026. Assembly input, not a published edition.**
> Following a direct visual review of all 15 pages of the pinned UA PMDay v35 presentation, this revision sharpens the article's evidence about code structure, restores the search for an SDLC equilibrium, makes the requirements boundary and post-release reassessment explicit, and changes the screenshot plan from five to **seven** actual slides (3, 5, 7, 9, 10, 12, 14). This supersedes draft 0.5 as the next editorial input. The rendered `r2` manuscript and its existing PDF/kit are **not** this revision.
>
> Editorial owner: [issue #2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2). Execution: [PR #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79), publisher owner [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5). Inspected PR head: `0a0acbf56941e3c04a24ff1362c9b47b071b5b58`; main: `9b82f382d080f879528fac8bba94b3656ce14521`. Revalidate before assembly.
>
> Reader prose is bounded by the `ARTICLE START` / `ARTICLE END` comments. The seven `ASSEMBLY FIG` comments and the assembly appendix are instructions, not article prose. Copy only reader prose into the canonical manuscript and replace the seven markers with declared full-slide figures. [Versioned review and handoff](../review/issue-2/pmday-candidate-20261015/README.md#editorial-revision-05--screenshot-assembly-handoff).

<!-- ARTICLE START -->

# AI Changes Both Sides of Software Engineering

*We can delegate more work. We still have to own the consequences.*

A pull request looks convincing. The tests are green. The explanation is fluent.

Then someone asks: what happens if this is wrong—and the agent cannot fix it?

That is where a productivity story becomes an engineering question.

My PMDay talk brought together two changes we often discuss separately: AI changes how we build software, and model judgment changes what some of that software does. The first can put pressure on our ability to understand what we are building. The second asks us to control systems whose consequential behaviour is not fully specified by explicit rules.

Both raise the same uncomfortable question: **what must we remain capable of doing after we delegate the work?**

[Slides — PDF, v35 review edition](https://github.com/oborskyivitalii/oborskyivitalii/blob/4d5bcdb7c0b30bd7ba5926007fc24e3752242905/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf) · [Recording — Ukrainian](https://youtu.be/xSgWjuGqC9I)

## 1. When ideas outlive their authors

Writing allowed ideas to survive the people who expressed them. Printing changed how far and cheaply those ideas could travel. A thought could leave an isolated conversation, cross a border and become part of someone else's discovery centuries later.

The important change was not simply that people could produce more text. It was what became possible when knowledge no longer depended so heavily on someone's presence and memory. Research into [printing and the Reformation](https://digitalcommons.chapman.edu/economics_articles/99/) illustrates how far the consequences could reach beyond the production of books.

Large language models extend the boundary of delegation again. We can ask them to interpret a request, compare alternatives, propose a design and explain a result. I use *delegating thinking* in this practical sense—not as a claim about consciousness, or that earlier computers did no cognitive work.

I expect this change to reach far beyond software engineering. But software gives us a place to examine it now, while the consequences are already becoming operational questions.

We need to keep two dimensions separate. An AI coding agent can build an ordinary application. A conventionally staffed team can build a product that depends on model judgment at runtime.

How we produce the software does not settle what authority the software should receive. Nor does a successful product demonstration establish that we can maintain what produced it.

## 2. We accelerated a step. Not the system.

Imagine a team that can produce, review and integrate eight comparable changes a week. Now increase generation capacity to one hundred, leaving review and integration at eight.

If every generated change enters the queue, unfinished work grows by ninety-two a week. Delivery remains eight.

This is a deliberately simplified example, not a productivity estimate. Its lesson is less comfortable than the arithmetic: **we can become dramatically better at producing unfinished work.**

<!-- ASSEMBLY FIG-01: insert the complete screenshot of v35 slide 3 here, not the existing delivery-queue redraw. See the assembly instructions below. -->

Review did not suddenly become unnecessary. We changed how much work arrived there.

The empirical contrast is striking too. Demirer, Musolff and Yang's September 2026 [*Writing Code vs. Shipping Code*](https://www.nber.org/papers/w35275) examines more than 500,000 GitHub developers. Its cumulative estimates, [recorded in the presentation's evidence register](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/EVIDENCE.md), show **25.5× changed lines, 3.4× commits and 1.3× releases**.

Changed lines include additions and deletions. These observational working-paper estimates cover different outcomes and tool generations; asynchronous-agent releases were not separately estimated. They are neither a conversion funnel nor a universal productivity multiplier.

Even with those limits, the distinction matters: code activity and shipped output are not interchangeable measures of success.

[DORA's 2025 findings](https://dora.dev/insights/balancing-ai-tensions/) add another warning: greater AI adoption is associated with higher delivery throughput **and greater delivery instability**. That is an association, not proof of causation. Faster and healthier are separate questions.

The vendor narrative recognises the pressure. [Anthropic describes a review bottleneck](https://claude.com/resources/articles/code-review) following increased code output, while retaining human approval. Microsoft's Jay Parikh writes [“Don't let code review become a bottleneck”](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/), while keeping humans responsible for architectural oversight.

There is a dangerous shortcut available here: treat whatever cannot keep up with generation as an obstacle to remove.

**A bottleneck tells us where capacity is constrained. It does not tell us that the constrained activity has stopped being necessary.**

Anthropic's [October account of Scion](https://www.anthropic.com/engineering/redesigning-source-control) shows what a more substantial response involves. It reports growth from roughly 2,500 daily merges in May to over 30,000 in September, and checkouts around one hundred times faster after a source-control redesign. Engineers retained architectural understanding and reviewed every change for intent, supported by simulations and fuzzing.

That is not “humans disappeared.” It is a redesign of the surrounding system. Checkout speed is not customer value, and Anthropic explicitly describes an unusual workload. Copying the reduced emphasis on reading every line without the accompanying expertise and verification would be a different experiment.

## 3. The scarce resource is understanding

Faster generation changes more than the amount of code a team has to read. It may change the structure of what the team must own. In a longitudinal matched-control study, [Agarwal, He and Vasilescu](https://arxiv.org/html/2601.13597v2) estimated post-agent-adoption increases of **34.85% in SonarQube code complexity** for agent-first repositories and **42.87%** for repositories with earlier AI-IDE exposure. These are statistical estimates of a static-analysis metric—not measurements of human understanding—and the study reports design limitations. Separately, [GitClear's 2026 observational report](https://www.gitclear.com/the_ai_code_quality_maintainability_gap) found duplicated code blocks **81% higher than its 2023 baseline**. It is a vendor-run, cross-period industry signal, not proof that AI alone caused the change.

Those results give us a reason to measure maintainability, not a new law of cognition. The fifth slide in the presentation shows generation rising while a team's capacity to comprehend its output remains nearly flat. The gap grows.

It is an overload scenario, not a measured law of human cognition. Better tools, architecture and learning can move the comprehension line. The point is to ask whether our actual delivery model does so—or merely assumes that somebody will keep up.

<!-- ASSEMBLY FIG-02: insert the complete screenshot of v35 slide 5 here; retain its illustrative-hypothesis disclaimer. See the assembly instructions below. -->

That somebody is often the person reviewing the change, maintaining the integration or answering the incident call.

Code review has more than one output. It can catch a defect. It can also teach another engineer what changed, why it changed and where it might fail. [Bacchelli and Bird's study of Microsoft teams](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/) identified knowledge transfer and team awareness alongside defect detection.

That makes review one way of turning individual output into shared ownership.

Automating defect detection does not automatically reproduce that second outcome. We could improve inspection while leaving the people responsible for the service less prepared to operate it. Equally, a ceremonial human approval can provide neither benefit. What matters is demonstrated capability, not the identity of whoever clicked Approve.

**Responsibility does not disappear when understanding disappears. We are left responsible for something we are less capable of controlling.**

### An explanation is not yet evidence

Generated documentation looks like an obvious answer. We cannot keep up with the code, so we ask an LLM to explain it.

Now we have two things to trust: an implementation and a story about the implementation.

The story may omit an exception, describe intended rather than actual behaviour, or reproduce the assumption that made the code wrong. Even a perfectly faithful explanation only tells us what the code does. It does not establish that this is what the business needed.

Documentation can make understanding cheaper. It cannot make the need for evidence disappear.

We can connect explanations to exact code versions, executable examples, observed traces and tests grounded in independently established requirements. Then ask engineers to use those materials to predict important behaviour and diagnose an unfamiliar failure.

The test is whether they can do it—not whether the repository contains an impressive amount of Markdown.

Specifications, AI review and replaceable components are plausible ways forward. But a specification can omit a critical exception, and code and tests can agree because they inherit the same mistake. The experiment is whether the new workflow preserves the necessary outcomes—not whether it produces a tidy chain of artifacts.

### The incident the workflow must survive

Consider a hypothetical production failure. Customers cannot complete transactions. The agent proposes a fix. Then another. Neither restores the service. A rewrite looks tempting, but nobody is sure what it will do to existing data.

Who can contain the damage? When do we stop retrying? Who can reconstruct the relevant assumptions and establish that the repair worked?

“Code is disposable” is useful only within a boundary. Microsoft's [version of that argument](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) explicitly discusses well-bounded features. Your customers' data, integrations and obligations do not become disposable with the implementation.

Ownership does not mean memorising every line. It means retaining the ability to investigate, challenge and change the system when the abstraction—or the assistant—fails.

AI can be central to that capability. The adoption trial should demonstrate recovery as seriously as generation: an agreed retry limit, preserved evidence, a fallback that works, and someone authorised and equipped to use it.

**A plan that works only while the agent keeps succeeding is not a complete operating plan.**

### Finding a new SDLC equilibrium

The answer is not to defend yesterday's process or demand that reviewers somehow read ten times faster. We need a new sustainable balance between generation, verification, integration and the team's ability to support what ships.

That balance is a hypothesis to test. Start by watching review age, batch size, work in progress, rework, release stability and recovery without AI. Small batches, WIP limits, trusted specifications, AI-assisted review and living ownership maps are candidate countermeasures, **not proven universal fixes**. A smaller queue may solve a flow problem while leaving an expertise problem untouched. Judge experiments by end-to-end delivery, maintainability, team load and full cost—not by how many pull requests the agent produces.

<!-- ASSEMBLY FIG-03: v35 slide 7, New SDLC Equilibrium; place after this paragraph and before section 4. Exact output and guards in appendix. -->

## 4. More software is not more value

Suppose we solve the capacity problem. Ideas can reach users far faster.

Which ideas?

Cheap implementation makes experimentation more attractive. It also makes it easier to skip the conversation in which someone asks whether a feature should exist at all.

The answer is not to preserve slow delivery as a quality filter. Good ideas die in queues too. The answer is to preserve useful challenge and make learning cheaper. [Microsoft's research on online experimentation](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/) shows how measured customer behaviour can overturn confident predictions about which features will help.

**A decision not to ship can be a successful outcome of faster engineering.**

The [NBER study](https://www.nber.org/papers/w35275) reports rising low-usage shares among new cohorts, measured over their first three months: iOS apps with fewer than ten ratings increased from about **78% to 87%**; Chrome extensions with fewer than ten downloads from **19% to 33%** (January 2025–April 2026). These are usage proxies, not customer welfare or proof that AI alone caused the trends. More supply does not automatically find more demand.

Even perceived speed and value differ. [METR's May 2026 survey](https://metr.org/blog/2026-05-11-ai-usage-survey/) of 349 technical workers reported median speed gains of 3×, versus 1.4–2× work-value gains across different question formulations. These were self-reports from a convenience sample, not measured delivery effects.

Customers also have work to do. They must discover a feature, understand it and sometimes reorganise a process around it. **Even if we could ship twenty-five times as many changes, customers would not gain twenty-five times as much attention.**

[Feature-fatigue research](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431) found that people can favour capability before use but give usability more weight afterwards. An attractive feature list and a satisfying product are not the same thing.

Extra capacity can instead fund faster repairs, better accessibility, simpler workflows and fewer steps. These are not lesser ambitions than a larger roadmap.

The question is what became better for the person using the product—not how much larger the release note became.

## 5. When the product itself makes judgments

So far, the problem has been how we produce and own software. The second shift puts judgment inside the running product.

Consider an assistant helping an employee recover account access. It interprets the request, retrieves guidance and recommends a next step. Even without direct access-changing permissions, its answer can influence what the employee does.

In [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md), I call this a *Thinking System*: a system whose consequential runtime responsibility depends partly on probabilistic model judgment. This describes an engineering property, not consciousness or adequate control.

Two differently worded answers may both be correct. An invented recovery step and an unauthorised disclosure are not merely more variations.

Requirements must distinguish acceptable behaviour from uncertainty that calls for clarification, and from outcomes that must be prevented. Given different inputs, context, data and permissions, the assistant may explain approved recovery steps, ask for missing information or escalate conflicting guidance. It must not disclose restricted material or bypass authorisation.

A conventional requirement may specify a path: in a given state, pressing A must open window B. With model judgment, we often have to define a **space of acceptable answers and actions**, its boundary cases and explicit prohibitions. This is not permission to be vague. Inputs multiplied by context, data and permissions create combinations that a handful of happy-path prompts will not cover. Product and domain owners still owe testable semantic criteria, examples and counterexamples. Identity, permissions and transaction rules remain exact obligations.

<!-- ASSEMBLY FIG-04: v35 slide 9, Requirements Become Boundaries; insert here before the evaluation subsection. Exact output and guards in appendix. -->

There is another uncomfortable consequence: behaviour may change without a code commit. The model, retrieval material, provider or routing can change while our source stays the same. A passing evaluation is evidence about the tested conditions, not a permanent warranty.

### The reassuring average

The presentation uses a synthetic evaluation of 200 responses:

| Outcome | Count |
| --- | ---: |
| Acceptable | 196 |
| Incorrect recovery instructions | 3 |
| Restricted information disclosed | 1 |

We could put “98% acceptable” on a slide and colour it green.

**The person whose information was disclosed has a different result.**

Under a release rule prohibiting that disclosure, this candidate fails. The other 196 responses do not cancel it.

There is uncertainty in the rate too. Four failures in 200 independent, representative observations give a [95% Wilson interval](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm) of approximately **0.8%–5.0%**. That calculation assumes a stable target distribution; it is not a production guarantee or a universal sample-size recommendation.

A curated *Golden Set* probes known requirements and difficult cases. A representative sample helps estimate frequencies. Repeating a convenient prompt does not establish coverage, and an evaluator—human or model—can itself misjudge the result.

<!-- ASSEMBLY FIG-05: v35 slide 10, One Green Test Proves Almost Nothing; insert here after the sampling caveat, before the Ready / Done / Release table. Exact output and guards in appendix. -->

This calls for three distinct decisions:

| Decision | What must be established |
| --- | --- |
| **Ready to begin** | Responsibilities, prohibited outcomes, evaluation approach, key dependencies and operating budgets are clear enough to undertake the work. |
| **Done** | The candidate meets agreed quality and evidence commitments; coverage, uncertainty and limitations are documented; controls and fallback have been tested. |
| **Authorised to release** | An accountable owner accepts the defined operating scope and remaining risk, with monitoring and response capability in place. |

A successful demo cannot make all three decisions for us.

### Control must reach the consequence

For the access assistant, control begins before an answer or action reaches the user: restrict retrieval, check consequential claims, enforce permissions and required approval, and deny or use a safe fallback when necessary conditions fail.

A semantic checker can be wrong. Asking another model whether the first one behaved safely is not a substitute for enforcing access boundaries.

After deployment, we need to observe outcomes and control health, compare them against limits, and enable authorised intervention. Someone must be able to narrow the task, disable a tool or suspend a path—and establish that the intervention worked. [NIST's AI Risk Management Framework](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) likewise includes monitoring, recovery and mechanisms to disengage or deactivate systems that depart from intended use.

<!-- ASSEMBLY FIG-06: v35 slide 12, Production Needs a Control Loop; replace the existing runtime-control redraw. Exact output and guards in appendix. -->

A dashboard without the ability to stop harm is an observation mechanism, not a complete control system. “Human in the loop” is not enough when the person lacks information, authority or time.

**And rollback cannot undisclose a credential.**

The full cost includes tokens, evaluations, retries and human response capacity. If control cannot operate before the consequence, depends on people who will not be available or makes the use case economically infeasible, **narrow, redesign or reject that AI path**. Adding another model as a checker is not a substitute for a control that can actually work. Rejecting one unsafe design is an engineering decision, not a failure of ambition.

## 6. Engineering rigor moves. It does not disappear.

The two shifts meet in the delivery operating model.

We may generate software faster while building products that require more domain evaluation, clearer authority and stronger operational response. Planning only around coding capacity misses both changes.

Consider a simple dependency: an agent introduces a critical component in a language nobody on the team knows. Implementation looks complete. Review and recovery capability are not. The delivery plan needs to surface and resolve that gap before the component becomes indispensable.

Product and domain owners define useful outcomes and acceptable boundaries. Engineering and QA establish how those commitments are implemented and tested. Service owners need the ability to act in production. Delivery leadership connects these decisions, dependencies and capacities; it cannot replace them with a faster status report.

These are distinct but connected research directions: [The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) explores AI-assisted delivery risks; [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) examines consequential model judgment and operational control.

Start with one bounded workflow. Establish the baseline, useful outcome, delegated authority and prohibited results. Measure elapsed time, human effort, rework, stability and full operating cost—not generated volume alone.

Then rehearse failure. Demonstrate how the team detects a problem, contains it and verifies recovery when the preferred automated path does not work. Reassess after material changes to the model, data or authority.

**Release does not close the laboratory.** Production outcomes and incidents must feed the next decision: do the original assumptions, tests, monitoring and delegated limits still hold? The team may have to update the evaluation set, tighten authority or change the workflow—while continuing to meet its delivery and service commitments.

<!-- ASSEMBLY FIG-07: v35 slide 14, Engineering Rigor Moves — It Doesn't Disappear; place before the final two-paragraph conclusion. Exact output and guards in appendix. -->

I am optimistic about what this makes possible: useful software we could not previously afford, less drudgery, better testing and faster repair. I do not want to protect unnecessary work from automation. I want us to know which necessary capabilities our new workflow actually preserves.

Writing allowed ideas to outlive their authors. We are now expanding how much work with those ideas we can delegate.

**Build for the future you believe in. Keep the ability to act if that belief is wrong.**

<!-- ARTICLE END -->

## Assembly instructions for Astra / Sol — not article text

### Source of truth and non-negotiable scope

- Treat **reader text between ARTICLE START and ARTICLE END** as editorial revision **0.6**, replacing draft 0.5 and rendered article revision r2 for the *next* candidate. Keep the six-chapter structure, sharp opening and closing, restored numbers with limitations, fallibility/recovery argument, new equilibrium subsection, precise requirements boundary and after-release control. Do not globally compress/soften again.
- \`site/publications/pmday-ai-both-sides/manuscript.en.md\` is the **future canonical reader manuscript**. This excluded \`drafts/\` file is an editorial input, not a published source. Migrate prose and figures there under an explicitly new content edition; follow current \`guides/ARTICLE-WORKFLOW.md\` and the owning #2/#5 acceptance routes.
- Seven \`ASSEMBLY FIG\` markers are machine/editor handoff instructions **not reader prose**. Replace each at its exact position with a registered, accessible figure asset. Include the existing original cover only where the established editorial profile calls for it; no duplicate poster or generic redraws.
- The **seven required slide screenshots** are **3, 5, 7, 9, 10, 12, 14**. Slide 13 is removed from the required body set in favour of 14. Slides 4 (too dense), 6, 8, 11, 13 and 15 are not additional default body screenshots. Do not silently reduce the seven back to five or expand to all 15.
- Keep the opening **single** linked Slides PDF plus the Ukrainian recording. Do not reinstate embedded PDF viewer, source-1/source-2 index, machine edition footer, or visual duplications. Sources belong next to the claims they support.

### Verified exact deck input and extraction

- **Original deck:** \`UncertaintyArchitectureGroup/uncertainty-architecture\` PR #113, commit \`22639d311d5fb46a23f3d5cdd819800dbe1169d9\`, \`assets/presentations/pmday-2026/ai-changes-both-sides.pptx\`.
- **Site-owned 15-page v35 review PDF:** \`site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf\`, identical article copy \`site/assets/publications/pmday-ai-both-sides/presentation-v35.pdf\`. **Exact PDF SHA-256:** \`b3fa9fb0220a6620db0b28ac3d560b987791be0dfb6cdd02c53c04975d881782\` (663,363 bytes).
- **Deck identity/rights:** \`site/publications/pmday-two-shifts/deck-review.json\` and upstream \`assets/presentations/pmday-2026/{README.md,EVIDENCE.md}\`. This is an **exact verified review PDF**, *not* yet accepted as the final event-presented release, and not a declaration that third-party assets are cleared for article publication. Owner decisions under #2/#7/UA133 still apply.
- **Page indices:** 1-based visible pages **3, 5, 7, 9, 10, 12, 14**, zero-based PyMuPDF indices **2, 4, 6, 8, 9, 11, 13**. They were visually reviewed in the PDF rendition. Use *direct full-page rasterisation* of this exact pinned PDF: no PowerPoint re-export, no AI-generated diagram, no colour/number/text alteration. Preserve original frame, slide titles, caveats and slide numbers.
- **Reproducible export:** require source digest first, open with PyMuPDF, then for each target page run \`page.get_pixmap(matrix=fitz.Matrix(2,2), colorspace=fitz.csRGB, alpha=False).save(output_path)\`. This yields approximately **1920 × 1080 RGB PNG** at 144 dpi for the 960 × 540 PDF layout. If PyMuPDF is unavailable, use Poppler with verified full-frame parity; prior Poppler PNG output had been truncated in the review environment. A broken raster must fail rather than be accepted.
- Record each generated file's source PDF SHA-256, page, output path, renderer/version, dimensions, byte length, SHA-256 and rights/credits decision in the existing article asset/provenance manifest. The screenshot filenames below are **planned outputs**, not files silently claimed to be committed in this editorial-only revision. Generate them in the **same** PR during actual assembly; do not depend on this ChatGPT session's sandbox paths.

### Figure contract: exact placements, alt text, captions and guards


#### FIG-01 — slide 3: SDLC bottleneck

**Full slide title:** We Accelerated a Step. Not the System.

**Source-page preview:** [Open the exact pinned PDF at page 3](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=3). **Final image:** `site/assets/publications/pmday-ai-both-sides/pmday-slide-03.png` (new file, not yet committed).

**Placement:** Immediately after the 8 → 100 generation illustration in chapter 2, before the empirical NBER/DORA evidence.

**Keep legible:** Intent → Design → Code → Review → Test → Integrate → Deploy → Operate; BEFORE 8 / 8 / 8 and AFTER AI 100 / 8 / 8; +92 unfinished changes/week; Theory of Constraints conclusion; scenario assumptions.

**Alt:** PMDay slide 3: code-generation capacity increases to 100 changes a week, but review and integration remain at eight; 92 uncompleted changes accumulate in the illustrative push system.

**Caption:** Accelerating code generation is not the same as accelerating delivery. Illustrative fixed-capacity scenario; PMDay v35, slide 3.

**Interpretation guard:** The 8/100/+92 values are synthetic comparable-work rates, assuming all generated changes enter the queue and no work is discarded. Do not present them as observed throughput or as an AI-effect estimate. Replace the old delivery-queue diagram.

#### FIG-02 — slide 5: Generation vs. comprehension

**Full slide title:** The New Scarcity Is Human Comprehension

**Source-page preview:** [Open the exact pinned PDF at page 5](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=5). **Final image:** `site/assets/publications/pmday-ai-both-sides/pmday-slide-05.png` (new file, not yet committed).

**Placement:** After the first paragraphs of chapter 3, directly following the disclaimer that the graph is an illustrative overload scenario.

**Keep legible:** Rising generation and flatter team-comprehension curves, potential gap, Adoption/time axis, three diagnostic questions and the full hypothetical-scenario caveat.

**Alt:** PMDay slide 5: illustrative generation output grows faster than team comprehension, showing a possible—not measured—comprehension gap.

**Caption:** The potential comprehension gap is a scenario, not a measured cognitive ceiling. PMDay v35, slide 5.

**Interpretation guard:** Do not attribute the drawing to Agarwal, GitClear, NBER or any real dataset. The flat curve is an assumption; learning and tools may change it. The five-year question is not a forecast.

#### FIG-03 — slide 7: Search for SDLC equilibrium

**Full slide title:** We Are Searching for a New SDLC Equilibrium

**Source-page preview:** [Open the exact pinned PDF at page 7](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=7). **Final image:** `site/assets/publications/pmday-ai-both-sides/pmday-slide-07.png` (new file, not yet committed).

**Placement:** After the new 'Finding a new SDLC equilibrium' subsection at the end of chapter 3, before chapter 4.

**Keep legible:** Old equilibrium / Today / New equilibrium; Watch / Measure versus Explore / Test; flow/review, maintainability, production and team/ownership metrics; candidate countermeasures disclaimer and the bottom delivery/quality/full-cost/team-health line.

**Alt:** PMDay slide 7: teams measure flow, maintainability, production and recovery while experimenting with candidate controls to find a sustainable AI-assisted SDLC equilibrium.

**Caption:** Search for a sustainable workflow, not a return to the old one: measure outcomes and test countermeasures. Proposed measures are not proven fixes. PMDay v35, slide 7.

**Interpretation guard:** Keep experimental nature, all categories and workload/health caveat. Do not state spec-first, disposable code, AI review or WIP limits are validated solutions in this author's setting.

#### FIG-04 — slide 9: Requirements as boundaries

**Full slide title:** Requirements Become Boundaries

**Source-page preview:** [Open the exact pinned PDF at page 9](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=9). **Final image:** `site/assets/publications/pmday-ai-both-sides/pmday-slide-09.png` (new file, not yet committed).

**Placement:** In chapter 5 after the passage contrasting fixed paths with acceptable response spaces, before 'The reassuring average'.

**Keep legible:** BEFORE Press A → Window B; NOW input intents × context × data × permissions, acceptable Answer/Clarify/Escalate area, contextual boundary cases, prohibited unauthorized disclosure, and 'more combinations' coverage warning.

**Alt:** PMDay slide 9: traditional exact-path requirements contrast with a space of acceptable responses—answer, clarify or escalate—bounded by context, permissions and forbidden disclosure.

**Caption:** Model-dependent behaviour demands precise boundaries, examples, prohibitions and coverage across contexts—not a single canonical wording. PMDay v35, slide 9.

**Interpretation guard:** The drawn geometry is schematic, not a statistical probability/distance model; do not imply all business rules become probabilistic or that ISO references are a certification claim. Include semantic coverage challenge.

#### FIG-05 — slide 10: Failure evidence and prohibited result

**Full slide title:** One Green Test Proves Almost Nothing

**Source-page preview:** [Open the exact pinned PDF at page 10](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=10). **Final image:** `site/assets/publications/pmday-ai-both-sides/pmday-slide-10.png` (new file, not yet committed).

**Placement:** In chapter 5, after the synthetic 200-case table, Wilson interval and Golden Set versus representative sample explanation; before Ready/Done/Release table.

**Keep legible:** All response classes and n=200 results (196 acceptable, 3 incorrect recovery instructions, 1 unauthorized disclosure), 4/200 = 2%, Wilson interval, critical breach blocks release under defined rule, Golden Set versus representative sample.

**Alt:** PMDay slide 10: in 200 synthetic responses, 196 are acceptable, three instructions are incorrect and one disclosure violates a release prohibition despite a 98% acceptable average.

**Caption:** The average cannot cancel a forbidden consequence. Synthetic evaluation, sample uncertainty and a specific release-blocking rule. PMDay v35, slide 10.

**Interpretation guard:** All values synthetic. Wilson calculation assumes independent representative draws; Golden Set is curated and cannot estimate production prevalence. Keep accessible body outcome table, not just the image.

#### FIG-06 — slide 12: Operational control

**Full slide title:** Production Needs a Control Loop

**Source-page preview:** [Open the exact pinned PDF at page 12](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=12). **Final image:** `site/assets/publications/pmday-ai-both-sides/pmday-slide-12.png` (new file, not yet committed).

**Placement:** In chapter 5 under 'Control must reach the consequence', after pre-delivery guard and intervention discussion, before dashboard/HITL criticism.

**Keep legible:** Proposal → fallible semantic check → enforced permissions/approval before delivery; deny/safe-fallback path; observations of allowed and rejected paths; comparison to agreed limits; authorised correction; stop/narrow/disable actions; latency, people, cost and external-change footer.

**Alt:** PMDay slide 12: a model proposal is checked before consequential action; failed checks take a denial or fallback route, while monitoring and authorised intervention support ongoing control.

**Caption:** Effective control spans permission enforcement, safe fallback and verified intervention, not observation alone. PMDay v35, slide 12.

**Interpretation guard:** A semantic checker may be wrong and cannot replace permission enforcement. Feedback cannot reverse an irreversible disclosure. Do not imply the diagram proves any system is safe. Replace the generic runtime-control redraw.

#### FIG-07 — slide 14: Delivery and continuing laboratory

**Full slide title:** Engineering Rigor Moves — It Doesn’t Disappear

**Source-page preview:** [Open the exact pinned PDF at page 14](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=14). **Final image:** `site/assets/publications/pmday-ai-both-sides/pmday-slide-14.png` (new file, not yet committed).

**Placement:** Late chapter 6, after the new 'Release does not close the laboratory' paragraph and before the two-paragraph conclusion.

**Keep legible:** Delivery Plan → Build → Verify → Ship; hypothesis + approved limits → bounded experiment → measure/compare → decide/adapt loop, feedback from production outcomes/incidents, planning/daily/review/release/operations ownership, both HOW/WHAT, full operating cost and the final responsibility statement.

**Alt:** PMDay slide 14: normal delivery obligations continue alongside a bounded experiment and reassessment loop fed by production outcomes, incidents and authorised release decisions.

**Caption:** Keep delivery commitments while the learning loop remains open after release. Production outcomes can change future evidence, control and authority decisions. PMDay v35, slide 14.

**Interpretation guard:** Do not turn an iterative cycle into a waterfall or let PM coordination override product, risk or service authority. Unlike the prior figure plan, slide 13 is not required as an additional screenshot; its expertise-gap example stays in prose.

### Readable editorial reference table (not article prose)

| Ordered figure | Slide source | Reader section | Replaces / adds |
| --- | --- | --- | --- |
| 01 | [v35 slide 3](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=3) | 2 — SDLC bottleneck | Replace old delivery-queue diagram |
| 02 | [v35 slide 5](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=5) | 3 — comprehension gap | Replaces two-shifts matrix as body image |
| 03 | [v35 slide 7](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=7) | 3 — new equilibrium | New visual |
| 04 | [v35 slide 9](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=9) | 5 — requirements boundary | New visual |
| 05 | [v35 slide 10](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=10) | 5 — evaluation and release | New visual (keep accessible text table) |
| 06 | [v35 slide 12](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=12) | 5 — pre-action / runtime control | Replace runtime-control diagram |
| 07 | [v35 slide 14](https://raw.githubusercontent.com/oborskyivitalii/oborskyivitalii/344a66820649d31b84eb958980373607a45be7d5/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf#page=14) | 6 — delivery and learning | Replace slide-13 plan |

### Evidence and claim audit

- **NBER**: retain the original link \`https://www.nber.org/papers/w35275\`, 25.5× changed lines, 3.4× commits, 1.3× releases with study/outcome/sampling qualifiers. Changed lines must never be called shipped features; the customer-attention sentence is explicitly hypothetical.
- **Agarwal et al.**: Table 2 at \`https://arxiv.org/html/2601.13597v2\`: code complexity **+34.85% (agent-first / AF)**, **+42.87% (IDE-first / IF)** after observable agent adoption in a matched-control, staggered-DiD study. These are **Sona​rQube static-analysis complexity estimates**, not measured human comprehension, measured individual developer productivity or a laboratory randomised trial. The paper reports concerning isolated pre-treatment coefficients. Do not silently convert the 34.85/42.87 numbers into a universal effect.
- **GitClear**: 2026 report \`https://www.gitclear.com/the_ai_code_quality_maintainability_gap\`, **+81% code-block duplication relative to the 2023 baseline** on a reported historical corpus. Distinguish GitClear edition/baseline, industry association and possible confounders from Agarwal's matched analysis; this article does not claim either study proves a universal AI-causality law. Slide 4 is research context, *not* a seventh/eighth extra body image.
- **DORA**: adoption association with delivery performance **and** instability; do not convert respondent share to uplift size or association to experimental causation. **Comprehension slide 5** is explicitly hypothetical. **200-case evaluation slide 10** is synthetic, with independently sampled representative-draw assumptions for Wilson interval.
- **Requirements and operational safeguards**: schematic geometry on slide 9 is not a probability distribution. Separate fallible semantic checks from enforced permissions. Never imply rollback can undo disclosure; if feasible control cannot be implemented, the draft explicitly allows narrowing, redesigning or rejecting the AI route.
- **Research ownership**: site article describes two directions and links canonical [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) and [Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis). Do not silently modify UA/Subprime research registries or overstate research maturity.

### Visual and publication guardrails

1. Full-slide captures, not crops of graphs or remade quantitative figures. Preserve original typography and all on-screen caveats even when converting to efficient web encodings. If mobile text is too small, support enlarging through the already-linked deck PDF, without adding new PDF viewer machinery or breaking no-JS reading.
2. Keep seven **body figures** in the agreed order (plus the existing cover where applicable). Maintain body accessibility: factual numbers also appear as searchable prose/table content, meaningful English alt text and captions with edition + slide number. Decorative repetition and a second presentation poster are prohibited.
3. Review desktop (~1440px), mobile (~390px), no-JS HTML, generated article PDF **all pages**, LinkedIn/Medium rendition image order/alt/credits, links and resource budgets. Do not break the site's **single** Slides PDF link policy, canonical Writing counter/catalog or content-release separation.
4. Do not reuse review-only source/PDF/kit SHA records as proof for revision 0.6. Generate a **new** semantically distinct article edition and export manifest; preserve r2 as earlier history, plus frozen \`pmday-two-shifts\` technical fixture.
5. Rights/provenance gate: evidence of the exact PDF and image extraction is not equivalent to permission to publish/relicense all graphics or to transfer upstream material. Preserve explicit #2/#7/UA133 gates and author approval.

### Ordered execution and acceptance for Sol / Astra

| Step | Work and expected check | Required evidence |
| --- | --- | --- |
| T01 | Recover exact current main/PR79 refs; read root/scoped AGENTS, RI map, #2/#5/#7 and edition rules. Re-validate 0.6 editorial input and current source before implementation. | Raw source SHA, owner/ref, file-scope route |
| T02 | Export exactly seven real pages from pinned PDF; declare graphics, captions, accessible order, copyright/provenance. Remove superseded body figures from the future edition, retain covers. | Image hashes/dimensions, source PDF SHA, 7/7 pages visually compared |
| T03 | Integrate **only ARTICLE START–END reader prose**, excluding assembly comments; register seven figures and active presentation/recording links in canonical manuscript/blueprint. Keep manuscript itself readable without images. | Six chapters, 7/7 placements and source link coverage |
| T04 | Regenerate article HTML/PDF, site and LinkedIn/Medium publication candidates from a new content edition, not by patching generated outputs. | Exact-source manifests, edition, exported figures in order |
| T05 | Run \`node tools/quality/local.cjs\`, mapped publisher/article/rights/SEO checks, full-source RI \`build\` + \`verify\`, relevant tests and hosting/profile checks; visually inspect site and PDF for mobile/desktop with the new figures. | Per-check exact-source results, negative cases, PDF/page and browser observations |
| T06 | Independent editorial/quantitative/visual/rights review; record remaining #2:AC01–AC06 and #5 acceptance without inventing final publication or upstream transfer decisions. | Versioned review artifact, PR + issue evidence/checkboxes, author decisions pending |

**Do not merge, stage/promote, publish or post externally as a byproduct of this draft update.** PR79 remains the implementation route, issue #2 the article/editorial owner and issue #5 the publisher owner. Fresh acceptance applies only to the assembled new edition, never to earlier r2 green checks.
