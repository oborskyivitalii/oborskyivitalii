> **Editorial revision 0.5 — 15 October 2026. Assembly input, not a published edition.**
> The author requested that the sharper chat proposal be entered into PR #79, with more actual presentation screenshots and explicit instructions for Astra or Sol. This revision replaces the previous draft 0.4 as the next editorial input. The currently rendered `r2` manuscript and its existing PDF/kit are not this revision.
>
> Editorial owner: [issue #2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2). Execution: [PR #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79), publisher owner [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5). Inspected PR head: `0a0acbf56941e3c04a24ff1362c9b47b071b5b58`; main: `9b82f382d080f879528fac8bba94b3656ce14521`. Revalidate before assembly.
>
> Reader prose is bounded by the `ARTICLE START` / `ARTICLE END` comments. The five `ASSEMBLY FIG` comments and the assembly appendix are instructions, not article prose. Copy only reader prose into the canonical manuscript and replace the five markers with declared figures. [Versioned review and handoff](../review/issue-2/pmday-candidate-20261015/README.md#editorial-revision-05--screenshot-assembly-handoff).

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

The fifth slide in the presentation shows generation rising while a team's capacity to comprehend its output remains nearly flat. The gap grows.

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

## 4. More software is not more value

Suppose we solve the capacity problem. Ideas can reach users far faster.

Which ideas?

Cheap implementation makes experimentation more attractive. It also makes it easier to skip the conversation in which someone asks whether a feature should exist at all.

The answer is not to preserve slow delivery as a quality filter. Good ideas die in queues too. The answer is to preserve useful challenge and make learning cheaper. [Microsoft's research on online experimentation](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/) shows how measured customer behaviour can overturn confident predictions about which features will help.

**A decision not to ship can be a successful outcome of faster engineering.**

The [NBER study](https://www.nber.org/papers/w35275) reports rising low-usage shares among new cohorts, measured over their first three months: iOS apps with fewer than ten ratings increased from about **78% to 87%**; Chrome extensions with fewer than ten downloads from **19% to 33%** (January 2025–April 2026). These are usage proxies, not customer welfare or proof that AI alone caused the trends. More supply does not automatically find more demand.

Even perceived speed and value differ. [METR's May 2026 survey](https://metr.org/blog/2026-05-11-ai-usage-survey/) of 349 technical workers reported median speed gains of 3×, versus 1.4–2× work-value gains across different question formulations. These were self-reports from a convenience sample, not measured delivery effects.

Customers also have work to do. They must discover a feature, understand it and sometimes reorganise a process around it. **Our ability to ship twenty-five times as many changes would not give them twenty-five times as much attention.**

[Feature-fatigue research](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431) found that people can favour capability before use but give usability more weight afterwards. An attractive feature list and a satisfying product are not the same thing.

Extra capacity can instead fund faster repairs, better accessibility, simpler workflows and fewer steps. These are not lesser ambitions than a larger roadmap.

The question is what became better for the person using the product—not how much larger the release note became.

## 5. When the product itself makes judgments

So far, the problem has been how we produce and own software. The second shift puts judgment inside the running product.

Consider an assistant helping an employee recover account access. It interprets the request, retrieves guidance and recommends a next step. Even without direct access-changing permissions, its answer can influence what the employee does.

In [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md), I call this a *Thinking System*: a system whose consequential runtime responsibility depends partly on probabilistic model judgment. This describes an engineering property, not consciousness or adequate control.

Two differently worded answers may both be correct. An invented recovery step and an unauthorised disclosure are not merely more variations.

Requirements must distinguish acceptable behaviour from uncertainty that calls for clarification, and from outcomes that must be prevented. The assistant may explain approved recovery steps, ask for missing information or escalate conflicting guidance. It must not disclose restricted material or bypass authorisation.

Identity, permissions and transaction rules remain exact obligations. A model's involvement does not turn them into suggestions.

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

<!-- ASSEMBLY FIG-03: insert the complete screenshot of v35 slide 10 here, after the sampling caveat and before the Ready / Done / Release table. See the assembly instructions below. -->

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

<!-- ASSEMBLY FIG-04: insert the complete screenshot of v35 slide 12 here, replacing the existing runtime-control redraw. See the assembly instructions below. -->

A dashboard without the ability to stop harm is an observation mechanism, not a complete control system. “Human in the loop” is not enough when the person lacks information, authority or time.

**And rollback cannot undisclose a credential.**

The full cost includes tokens, evaluations, retries and human response capacity. If effective control cannot operate before the consequence, narrow the responsibility. That is an engineering decision, not a failure of ambition.

## 6. Engineering rigor moves. It does not disappear.

The two shifts meet in the delivery operating model.

We may generate software faster while building products that require more domain evaluation, clearer authority and stronger operational response. Planning only around coding capacity misses both changes.

Consider a simple dependency: an agent introduces a critical component in a language nobody on the team knows. Implementation looks complete. Review and recovery capability are not. The delivery plan needs to surface and resolve that gap before the component becomes indispensable.

Product and domain owners define useful outcomes and acceptable boundaries. Engineering and QA establish how those commitments are implemented and tested. Service owners need the ability to act in production. Delivery leadership connects these decisions, dependencies and capacities; it cannot replace them with a faster status report.

<!-- ASSEMBLY FIG-05: insert the complete screenshot of v35 slide 13 here, after the expertise-gap example and role paragraph. See the assembly instructions below. -->

Start with one bounded workflow. Establish the baseline, useful outcome, delegated authority and prohibited results. Measure elapsed time, human effort, rework, stability and full operating cost—not generated volume alone.

Then rehearse failure. Demonstrate how the team detects a problem, contains it and verifies recovery when the preferred automated path does not work. Reassess after material changes to the model, data or authority.

I am optimistic about what this makes possible: useful software we could not previously afford, less drudgery, better testing and faster repair. I do not want to protect unnecessary work from automation. I want us to know which necessary capabilities our new workflow actually preserves.

Writing allowed ideas to outlive their authors. We are now expanding how much work with those ideas we can delegate.

**Build for the future you believe in. Keep the ability to act if that belief is wrong.**

<!-- ARTICLE END -->

## Assembly instructions for Astra / Sol — not article text

### Scope and source of truth

Use the reader prose above, not the older draft 0.4 or the currently rendered r2 text. Keep the six chapters, the hook, the restored quantitative evidence, the review/ownership argument, the documentation trust problem, the failure scenario and the sharp conclusion. Do not make another global softening rewrite while assembling the page. This is the author's requested next draft, not permission to publish or merge.

The assembly target is `site/publications/pmday-ai-both-sides/manuscript.en.md`; the blueprint, media declarations, edition and exports must follow it. This draft is an excluded editorial input, not a second published source. Leave the frozen `pmday-two-shifts` technical fixture and earlier editions/artifact bytes intact.

### Exact presentation edition

Export screenshots from the existing PDF, not from a recreated slide, a different PowerPoint export or an AI-generated imitation:

- PDF owner: `site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf`.
- The real article already holds the identical copy at `site/assets/publications/pmday-ai-both-sides/presentation-v35.pdf`.
- PDF SHA-256: `b3fa9fb0220a6620db0b28ac3d560b987791be0dfb6cdd02c53c04975d881782`; 663,363 bytes; 15 pages; v35 **review** edition.
- Binding: `site/publications/pmday-two-shifts/deck-review.json`. Upstream source: `UncertaintyArchitectureGroup/uncertainty-architecture` at `22639d311d5fb46a23f3d5cdd819800dbe1169d9`, `assets/presentations/pmday-2026/README.md` and `EVIDENCE.md`.
- Page numbers below are **one-based slide/PDF numbers**, including the title page. For PyMuPDF or another zero-based API use 2, 4, 9, 11 and 12 respectively.
- Existing slide/notes/third-party provenance and publication gates still apply. Do not call this the verified exact event-presented edition: that equivalence remains unestablished.

These five PDF pages were locally rendered and visually inspected for this editorial placement decision. That is not inspection of a newly assembled article, a new rights approval or managed-CI evidence. The PNG names below are planned assembly outputs; they have not been added to the repository by this draft edit.

### Five required screenshots and exact placements

The default body visual set is **five full-slide screenshots: 3, 5, 10, 12, 13**, plus the existing cover where the current profile calls for it. Do not also retain the three old body diagrams or add a second presentation poster. More screenshots here replace/extend the explanatory visual set; they are not an excuse to expand the prose or dump the whole deck into the article.

#### FIG-01 — SDLC bottleneck / slide 3

**Exact slide title:** We Accelerated a Step. Not the System.

**Placement:** the marker in chapter 2, immediately after the eight-to-one-hundred synthetic example and the sentence about producing unfinished work. This is the specific SDLC bottleneck screenshot requested by the author. It replaces the old `delivery-queue` figure rather than sitting beside it.

**What must be visible:** the complete Intent → Design → Code → Review → Test → Integrate → Deploy → Operate chain; BEFORE 8 / 8 / 8; AFTER AI 100 / 8 / 8; backlog +92 unfinished/week; Theory of Constraints takeaway; fixed-capacity/comparable-work and push-system caveats.

**Planned asset:** `pmday-slide-03`; PNG `site/assets/publications/pmday-ai-both-sides/pmday-slide-03.png`.

**Alt:** “PMDay slide 3: code capacity rises from 8 to 100 changes per week while review and integration remain at 8; the illustrative push-system backlog grows by 92 per week.”

**Reader caption:** “Accelerating code generation does not automatically accelerate delivery. This synthetic team still delivers eight comparable changes per week; admitting all generated work adds ninety-two unfinished changes. PMDay v35, slide 3.”

**Guard:** these are synthetic capacities, not measured AI productivity. Preserve units and the no-WIP-limit/no-discarded-work assumption; do not relabel the backlog as released features or defects.

#### FIG-02 — generation versus comprehension / slide 5

**Exact slide title:** The New Scarcity Is Human Comprehension

**Placement:** the marker near the opening of chapter 3, after the paragraph explicitly explaining that this is an overload scenario rather than a measured law. Remove the previous `two-shifts` matrix from the body; chapter 1 already distinguishes HOW and WHAT in prose.

**What must be visible:** the rising generation curve, almost-flat comprehension line, potential gap, Adoption / time axis, the three questions on the right and the complete illustrative-overload disclaimer at the bottom.

**Planned asset:** `pmday-slide-05`; PNG `site/assets/publications/pmday-ai-both-sides/pmday-slide-05.png`.

**Alt:** “PMDay slide 5: an illustrative rising generation curve separates from a nearly flat team comprehension line, highlighting a potential comprehension gap rather than measured human limits.”

**Reader caption:** “A possible overload pattern, not a biological limit or measured forecast. Better tools and learning can increase comprehension capacity; the delivery model must demonstrate that they do. PMDay v35, slide 5.”

**Guard:** never attribute these curves to NBER, GitClear or another study. The horizontal line is a scenario assumption, not a claim that people cannot improve. Keep the five-year question a question, not a prediction.

#### FIG-03 — average success, severity and uncertainty / slide 10

**Exact slide title:** One Green Test Proves Almost Nothing

**Placement:** the marker in chapter 5, after the Wilson-interval and Golden-Set paragraphs, before “This calls for three distinct decisions.” Keep the small outcome table and its surrounding explanation as accessible reader text; do not force readers to extract the values from an image.

**What must be visible:** the schematic contract-boundary picture, the illustrative n = 200 chart, 196 / 3 / 1 outcomes, 4 / 200 = 2%, 95% Wilson interval, critical-breach release block and Golden Set / representative sample distinction.

**Planned asset:** `pmday-slide-10`; PNG `site/assets/publications/pmday-ai-both-sides/pmday-slide-10.png`.

**Alt:** “PMDay slide 10: 196 acceptable responses, three incorrect instructions and one privacy leak in a synthetic sample of 200; the prohibited leak blocks release despite 98% acceptable responses.”

**Reader caption:** “The average cannot cancel the consequence. This synthetic evaluation separates failure frequency, sampling uncertainty and a prohibited disclosure that blocks release under the agreed rule. PMDay v35, slide 10.”

**Guard:** both the upper distribution and the lower sample are illustrative, not observed product results. The Wilson interval depends on independent representative observations and a stable target distribution; a curated Golden Set does not establish a production failure rate. Do not imply that every possible defect mandates the same release decision.

#### FIG-04 — operational control loop / slide 12

**Exact slide title:** Production Needs a Control Loop

**Placement:** the marker under “Control must reach the consequence,” after the paragraph about authorised intervention and NIST, before the dashboard/HITL criticism. Replace the old `runtime-control` figure; do not redraw the slide into another generic loop.

**What must be visible:** proposal, fallible semantic check, permission/approval check before delivery, denial/safe-fallback path, observation of all paths and control health, comparison with limits, authorised correction, stop/narrow/disable actions, human authority and the latency/people/full-cost/external-change footer.

**Planned asset:** `pmday-slide-12`; PNG `site/assets/publications/pmday-ai-both-sides/pmday-slide-12.png`.

**Alt:** “PMDay slide 12: a model proposal passes semantic and permission checks before delivery, with denial or fallback on failure; observation, authorised correction and human intervention form the operating control loop.”

**Reader caption:** “Control must act before irreversible consequences and remain operable after deployment. Permission enforcement, denial, fallback and effective intervention are distinct from telemetry. PMDay v35, slide 12.”

**Guard:** semantic checks remain fallible; permissions must be enforced before disclosure/action. Do not crop away fallback, human capacity or the warning that feedback cannot undo an irreversible effect. The prose supplies the requirement to verify that intervention worked; the diagram is not evidence that any actual implementation is safe.

#### FIG-05 — delivery roles and expertise dependency / slide 13

**Exact slide title:** The Roles Move With the System

**Placement:** the marker in chapter 6, after the unfamiliar-language dependency example and the paragraph allocating responsibilities, before the bounded-workflow recommendation.

**What must be visible:** both HOW and WHAT columns, the New balance / New work rows, delivery operating-model responsibility, and the complete lower chain: unfamiliar language → critical component → review/recovery gap.

**Planned asset:** `pmday-slide-13`; PNG `site/assets/publications/pmday-ai-both-sides/pmday-slide-13.png`.

**Alt:** “PMDay slide 13: HOW and WHAT shifts create different delivery responsibilities; code introduced in an unfamiliar language can become a critical dependency without adequate review or recovery capability.”

**Reader caption:** “The work moves beyond implementation: capacity, expertise, evaluation and response must have owners. An unfamiliar-language component illustrates a new review and recovery dependency. PMDay v35, slide 13.”

**Guard:** preserve both dimensions. The expertise chain is an example, not a measured incident, and project management coordinates decisions rather than acquiring the domain, risk or service owner's authority.

### Visual economy and accessibility

Use the five placements above; do not silently reduce the set back to three generic diagrams. Slide 4 is intentionally not another body screenshot: it is dense and would repeat the concise research evidence. Slides 8–9 are explained in chapter 5; slide 11 is represented by the accessible Ready / Done / Release table. Slide 6 would repeat the incident narrative, and slide 14 would repeat the closing action. Add no extra screenshots without a concrete readability reason and an explicit editorial decision.

Render full pages directly from the pinned PDF, initially at about 1920px width, preserving the entire frame, title, slide number, captions and caveats. Never use ImageGen for these screenshots; never redraw or retouch their quantitative content. Record renderer/version/settings and each resulting PNG's dimensions, bytes and SHA-256. Retain the current cover masters and their separate provenance.

Check desktop and narrow-screen readability. Keep the essential information in the article prose/tables; small image text is not a substitute. Use existing native full-size-image behaviour where available and keep the single opening Slides PDF / Recording paragraph. Do not restore the embedded PDF viewer, add a second poster or multiply the declared PDF-source links merely to provide enlargement. Captions identify page numbers for the existing full-deck link. Preserve aspect ratio, resource budgets and no-JS reading; if a figure is too small in the article PDF, give it a readable full-width placement rather than clipping disclaimers.

### Source and evidence safeguards

The restored NBER numbers and marketplace pairs inherit the pinned presentation evidence register's September-edition audit. The preceding editorial review could inspect the current abstract but fresh full-PDF access returned 403; this edit makes no new full-paper verification claim. Reconcile the exact September source before publication acceptance, or explicitly retain the inherited-audit limitation. Do not silently replace the numbers with an older paper version.

Keep changed LOC, commits and releases as different observational outcomes, not a conversion funnel. Keep marketplace cohort/three-month/proxy limits, DORA's association-not-causation caveat, METR's self-report/convenience-sample limits, Scion's vendor-reported infrastructure scope and the synthetic evaluation's assumptions. No new upstream research finding is introduced by screenshot reuse.

Named source hyperlinks stay beside their claims. Do not restore the technical source-1…25 bibliography or introduce filler merely to keep now-unused reference declarations. Reconcile the new edition's reference list with its actual prose, preserving older edition/source records. Retain accurate UA/Subprime further-reading links and the current rights notice in the assembled rendition without turning the article into an evidence register.

### Ordered assembly and verification handoff

1. Revalidate PR #79, its current head and the owning #2/#5 decisions. Read this whole draft, the existing blueprint and article workflow. Rebuild/verify RI and run the required current-source checks; this connector-only draft edit does not claim those checks or fresh RI output. No new path or runtime change is included here.
2. Verify the pinned PDF digest, extract the five full-page PNGs, and visually compare each with its numbered PDF page. Declare the new media, captions, alt text, ordering and per-item provenance in the real article's existing owners; register new paths through the current repository catalog/RI route.
3. Move only the bounded reader prose into the canonical manuscript, replace all five `ASSEMBLY FIG` comments with declared `asset:` figures, and remove this metadata/appendix and every editorial comment. Update the blueprint. Do not copy this complete file blindly into the publisher: its instructions are not reader content and its raw comments are not supported article markup.
4. Replace the three old displayed body diagrams in the new rendition, but preserve their historical files/editions and the frozen fixture. Create a new semantic content edition instead of relabelling r2. Reconcile publication/profile references, source rights and image upload order for the actual new edition.
5. Run `node tools/quality/local.cjs`, mapped article/source/edition/media checks and RI build/verify on the full checkout; run applicable RI/CI and guard checks without relaxing limits. Generate article HTML/PDF and the platform kit through the existing publisher. Verify asset order, exact source/manifest identities, all five screenshots, links, no unresolved markers, and absence of editorial-only material in every rendition.
6. Inspect the assembled article on desktop/mobile and every PDF page, including image captions/footers. Obtain required independent/editorial/rights/device review; record actual check source/run IDs in the existing review and PR. #2 AC01–AC06 remain open until their whole conditions pass; recording AC07/AC08 and the #5 technical fixture retain their separate scope. No merge, stable-stage promotion, production or external posting follows from this draft handoff.
