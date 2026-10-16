> **Editorial revision R6 — 16 October 2026. Standalone reader/PDF review, not a published edition.**
> R6 carries forward the sharper R4 prose and the R5 customer-adoption argument. Chapter 5 is rebuilt around six explicit assurances, each challenged by **What if not?**, followed by a concrete failure mode and an architectural consequence. Chapters 1–4, chapter 6, all eight image payloads, the 23-source bibliography and citation wording are preserved from R5, apart from the R6 revision label.
>
> Article owner: [issue #2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2). Execution: [PR #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79), publisher owner [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5). Inspected parent: `ad89ad11f0a065b1bc223e37efeee361527e1635`. This excluded draft is the current editorial input. The integrated site manuscript remains review r3 until a separately checked new edition is assembled; do not confuse that manuscript or the old r2 PDF/kit with this R6 reader.
>
> Reader prose is bounded by ARTICLE START / ARTICLE END. Figure alt text is in the Markdown; captions and implementation guards are in the appendix. The complete named bibliography and How to cite section are intentional reader content, not an automatically generated source-ID footer. [Review and assembly route](../review/issue-2/pmday-candidate-20261015/README.md#editorial-r6--assurance-what-if-not-failure-control).

<!-- ARTICLE START -->

# The Sum of Our Technology

*AI Changes Both Sides of Software Engineering*

![Conceptual architecture connects software construction with a branching decision structure.](asset:cover)

An agent opens a pull request. The tests are green. The explanation is fluent. Another pull request arrives before anyone has understood the first.

The dashboard calls this progress. The person who will handle the next incident has a different question.

**What if not?**

What if faster code generation does not produce faster delivery? What if automated review finds defects but leaves nobody equipped to recover the system? What if the human who supposedly makes the final decision cannot meaningfully make it?

These are not objections to the future. They are questions the future has to answer.

My PMDay talk connects two shifts: AI changes **how we build software**, and model judgment changes **what some software does at runtime**. In both, we can delegate more work. We still have to own the consequences.

[Slides — PDF, v35 review edition](https://github.com/oborskyivitalii/oborskyivitalii/blob/4d5bcdb7c0b30bd7ba5926007fc24e3752242905/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf) · [Recording — Ukrainian](https://youtu.be/xSgWjuGqC9I)

## 1. When ideas outlive their authors

Writing allowed ideas to survive the people who expressed them. Printing changed how far and cheaply those ideas could travel. A thought could leave a conversation, cross a border and enter someone else's discovery centuries later.

The important change was not simply more text. It was what became possible when knowledge no longer depended so heavily on someone's presence and memory. Research into [printing and the Reformation](https://digitalcommons.chapman.edu/economics_articles/99/) shows consequences extending well beyond the production of books.

Large language models move another boundary. We can delegate interpretation, comparison, design proposals, implementation and explanation. *Delegating thinking* describes that practical change; it does not require a claim about consciousness.

The title deliberately echoes Stanisław Lem's [*Summa Technologiae* (1964)](https://english.lem.pl/works/essays/summa-technologiae). The question is not just what a new capability lets us do. It is what happens to the larger system when we begin doing it.

Software gives us an immediate test. An AI agent can build an ordinary application. A conventionally staffed team can build a product that depends on model judgment. These are different shifts, with different failure modes. A convincing demonstration of either is not an answer to what happens when it stops working.

## 2. We accelerated a step. Not the system.

The early story was spectacular. In 2024, [Cognition introduced Devin as the “first AI software engineer”](https://cognition.com/blog/introducing-devin). In March 2025, [Dario Amodei forecast AI writing 90% of code within three to six months](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic), potentially essentially all code within a year. Both accounts retained human work. But a forecast about producing code is not a forecast about replacing software engineering. Treating the two as equivalent was the central mistake.

The first readily accelerated activity in many deployments was **code generation**. Yet software reaches a customer through a chain:

**Intent → requirements → design → code → review → test → integration → deployment → operation.**

A code generator does not, by itself, rebalance that chain. If more work enters review, testing and integration while their capacities stay unchanged, pressure accumulates there. This did not require years of production experience to discover. It follows from the structure of the system.

Take a deliberately simplified example: a team can generate, review and integrate eight comparable changes a week. Increase generation capacity to one hundred. If all generated work enters the queue, delivery remains eight and unfinished work grows by ninety-two a week.

**We have become dramatically better at producing unfinished work.**

![Synthetic capacities: generation rises from eight to one hundred changes per week while review and integration remain at eight; the queue grows by ninety-two if every change is admitted.](asset:pmday-slide-03)

The figures are illustrative; unchanged downstream capacity and unrestricted intake are the assumptions. Limiting work or increasing downstream capability changes the result. **Installing a faster generator does not perform that redesign for us.**

The empirical distinction is substantial. Demirer, Musolff and Yang's [*Writing Code vs. Shipping Code*](https://www.nber.org/papers/w35275), revised in September 2026, studies more than 500,000 GitHub developers. Its cumulative estimates distinguish **25.5× changed lines, 3.4× commits and 1.3× releases**. These are different observational outcomes and tooling cohorts, not a conversion funnel. Changed lines include additions and deletions—not customer value.

[DORA's analysis of its 2025 findings](https://dora.dev/insights/balancing-ai-tensions/) associates greater AI adoption with both higher throughput and greater delivery instability. Faster and healthier are different questions.

I examine this transfer of cost into review, QA, architecture, maintenance and production in [The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis). The danger is not that local gains are imaginary. It is that we book those gains before accounting for the work and risk moved elsewhere.

Now the narrative follows the next bottleneck. [Anthropic's Code Review announcement](https://claude.com/resources/articles/code-review) addresses growing review pressure. [Microsoft's Jay Parikh](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) proposes agentic first-pass review, with humans retaining architectural oversight. The intervention could work: automate routine inspection and use human attention where it matters most.

**What if not?**

What if review gets faster because the work of understanding the change no longer happens? What if defect detection improves while incident investigation becomes harder? What if we keep the approval button and lose the capability that gave approval meaning?

**Identifying a bottleneck does not prove that its function can be removed.**

The retrospective criticism is not that vendors now offer no engineering. [Anthropic's later account](https://claude.dev/blog/solving-code-review-at-anthropic/) describes layered checks, risk-based approvals, staged release and recovery. It also leaves shared codebase understanding as an unresolved process problem. That is a developing operating model—not evidence that every adopting team can safely discard the work its old process performed.

The broader redesign was not an optional extra discovered after the success of code generation. **It was part of the engineering problem from the beginning.**

## 3. The scarce resource is understanding

The burden is not only more code. It is the structure of what the team must own. [Agarwal, He and Vasilescu](https://arxiv.org/html/2601.13597v2) estimate post-adoption increases in static code complexity of **34.85% for agent-first repositories and 42.87% for those with earlier AI-IDE exposure**. These are SonarQube metrics from a matched longitudinal study, not measurements of human comprehension. [GitClear's 2026 observational report](https://www.gitclear.com/the_ai_code_quality_maintainability_gap) separately reports **81% more duplicated code blocks than its 2023 baseline**.

These are signals about the cost of ownership. A code-generation speed metric does not capture that cost.

My presentation shows generation rising faster than team comprehension. It is an illustrative overload scenario, not a measured cognitive ceiling. Tools and learning can increase comprehension capacity. The question is whether our workflow actually does so.

![Illustrative generation and comprehension curves diverge, showing a possible overload scenario rather than a measured human limit.](asset:pmday-slide-05)

Code review has more than one output. It can catch a defect; it can also teach another engineer what changed, why, and where it may fail. [Bacchelli and Bird's research](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/) identifies knowledge transfer and team awareness alongside defect detection.

Automating one outcome does not automatically reproduce the other. Nor does ceremonial human approval accomplish either.

**Responsibility does not disappear when understanding disappears. We are left responsible for something we are less capable of controlling.**

### The explanation will give us the understanding

We cannot keep up with the code, so we ask an LLM to explain it. Perhaps specifications and generated documentation become the durable artifacts, and the implementation becomes a replaceable detail. That would be useful.

**What if not?**

Now we have two things to trust: an implementation and a story about the implementation. The story can inherit the mistake, omit the exception or describe intention instead of behaviour. Even a faithful explanation does not establish that the code does what the business needed.

A specification, implementation and test suite can agree because all three share the same wrong assumption. Agreement between artifacts is not independent verification.

Connect explanations to exact revisions, observed traces and independently established requirements. Then ask an engineer to predict critical behaviour or diagnose an unfamiliar failure using those artifacts.

**The test is whether the team can do it—not whether the repository contains an impressive amount of Markdown.**

### We can always regenerate the code

For a [well-bounded feature](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/), replacement may be cheaper than repair. But production is not a blank directory.

**What if the agent cannot fix it—and replacement is not safe?**

Imagine customers cannot complete transactions. The agent proposes a fix, then another. Neither restores service. A rewrite looks tempting, but the existing data and integrations cannot simply be discarded.

Who stops the retries? Who contains the damage? Who can reconstruct the relevant assumptions and establish that the repair worked?

**Code may be disposable. Your customers' data, obligations and consequences are not.**

Ownership does not require memorising every line. It requires the capability to investigate, challenge and change the system when the abstraction fails. AI can support that capability. The recovery plan still has to work when the preferred agent does not.

### A new equilibrium has to be demonstrated

We should change the SDLC. We should not protect unnecessary work—or remove necessary capabilities because they interfere with a throughput target.

Try smaller changes, work-in-progress limits, better specifications, AI-assisted review and clearer ownership. Measure review age, rework, stability, knowledge coverage, recovery and total human effort. A faster queue accompanied by slower recovery is not a solved problem; the cost has changed address.

These are experiments with explicit outcomes, not a new process to accept on faith.

![Measurement and candidate countermeasures for finding a sustainable AI-assisted SDLC equilibrium.](asset:pmday-slide-07)

## 4. More software is not more value

Suppose the new workflow really does ship much faster.

**What if we are shipping the wrong things?**

Cheap implementation makes experiments more affordable. It also makes it easier to bypass the conversation in which somebody asks whether a feature should exist. [Microsoft's research on online experimentation](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/) shows why confident product expectations need to face actual customer behaviour.

**A decision not to ship can be a successful outcome of faster engineering.**

The [NBER study](https://www.nber.org/papers/w35275) reports rising low-usage shares among new software cohorts: iOS apps with fewer than ten ratings rose from approximately **78% to 87%**; Chrome extensions with fewer than ten downloads from **19% to 33%**. These are first-three-month usage proxies across January 2025–April 2026 cohorts, not a measure of customer welfare or proof of AI causation.

Even perceived speed and value differ. [METR's survey of 349 technical workers](https://metr.org/blog/2026-05-11-ai-usage-survey/) found median self-reported speed gains of **3×**, versus **1.4–2× work-value gains** across question formulations.

Even if we rebalance the entire SDLC, and even if every feature we ship is genuinely useful, we can still run into another constraint: **how quickly users can absorb the change.**

A useful feature still has to be discovered, understood and incorporated into an existing routine. When updates demand more learning and adjustment than people have time for, useful capabilities accumulate faster than their benefits are realised. **The comprehension problem has crossed the product boundary—from the team building the software to the people using it.**

[Feature-fatigue research](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431) examines a related trap: capabilities that look useful individually can together make a product harder to use. Not every improvement adds learning work; a better default or a simpler workflow may remove it. But accelerating delivery does not, by itself, expand the user's attention or time to learn.

That makes the work of adoption part of product design. Use extra capacity for faster repairs, accessibility, better defaults and fewer steps—not just more features to learn. **The objective is not to ship everything we can build. It is to deliver improvements people can actually turn into better outcomes.**

## 5. When the product itself makes judgments

So far, AI has been helping us build the product. The second shift puts its judgment **inside the running product**. A bad answer can now become an operational event without anyone opening a pull request.

Consider an assistant helping employees recover account access. It interprets requests, retrieves guidance and proposes a next step. This can be far more useful than a rigid decision tree. It also means part of the path from request to consequence is determined at runtime.

In [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture), I call this a [*Thinking System*](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md): at least one consequential runtime responsibility depends partly on probabilistic model judgment.

The new capability does not remove engineering obligations. It changes what has to be engineered. Follow the assistant through the assurances we give ourselves. Each sounds reasonable. Each depends on something we must be able to establish—not merely expect.

### We will tell the model what it must not do

Give it approved guidance. Instruct it never to invent a recovery step, expose restricted information or bypass authorisation. The expectation is straightforward: those instructions will keep its useful judgment inside the permitted boundary.

**What if not?**

A request is ambiguous. Two retrieved documents conflict. The assistant selects a plausible instruction from the wrong context, or includes information the requester must not receive. The prohibition was present. The prohibited result still reached the user.

**A prohibition in a prompt is not an enforced boundary.**

Define the permitted response space: answer with approved instructions, clarify missing information, or escalate unresolved cases. Restrict retrieval and enforce permissions before disclosure or action. Identity, access and transaction obligations remain exact; the model must not become its own access-control mechanism.

This preserves the capability we wanted—useful variation—without treating variation as permission. The next question is whether we have evidence that the resulting system stays inside those boundaries.

![Acceptable answers, clarification and escalation occupy a bounded response space; unauthorised disclosure is outside it.](asset:pmday-slide-09)

### The evaluation will tell us whether it works

Test the assistant against the agreed requirements. Evaluation should establish when we can rely on it. The presentation uses this **synthetic** set of 200 responses:

| Outcome | Count |
| --- | --- |
| Acceptable | 196 |
| Incorrect recovery instructions | 3 |
| Restricted information disclosed | 1 |

Ninety-eight percent acceptable. The tempting conclusion is that the assistant is ready to take responsibility.

**What if not?**

The percentage can be correct while the release decision is wrong. Under a rule prohibiting that disclosure, this candidate fails. The person whose information was exposed does not receive a 98% acceptable outcome. **An aggregate score cannot overrule a specific obligation.**

Frequency remains uncertain too. Four failures in 200 independent, representative observations give an approximate [95% Wilson interval](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm) of **0.8%–5.0%**, assuming a stable target distribution. A curated *Golden Set* tests known requirements and difficult cases; it is not automatically a representative production sample.

Evaluate severity, coverage and uncertainty—not just the average. Establish what the evidence permits us to delegate, to whom and under which conditions. Testing is necessary; a reassuring score is not a substitute for that decision.

![Synthetic evaluation: 196 acceptable responses, three incorrect instructions and one restricted disclosure in 200 cases; the prohibited disclosure blocks release.](asset:pmday-slide-10)

### Another model will check the first one

Put an evaluator between the assistant and the user. A second model can inspect each proposal before delivery. The promise is that it will catch the errors the generator misses, making the combined path more dependable.

**What if not?**

Both models receive the same misleading document. Both accept the same unsupported premise. The checker approves the very error it was meant to intercept. A separate invocation has produced another verdict, not independent evidence.

**The checker is another fallible component—not a certificate of correctness.** Test it against verified failures as well as valid outputs. Measure what it misses and what it blocks unnecessarily. Keep exact permission enforcement outside its verdict.

Its own failure also needs a defined outcome. A timeout or an inconclusive result must lead to an explicit wait, denial or safe fallback—not silently turn an unavailable safeguard into authorisation. Where that path requires human judgment, the next dependency is already part of the design.

### The human is an architectural dependency

Then comes the familiar assurance: a qualified human will make the final call. They will receive the evidence, recognise the exception and intervene before the system causes harm. That is the capability we are relying on when we write “human in the loop.”

**What if not?**

Our assistant escalates a suspicious request. The approval screen exists, but nobody covers the queue at night. At peak demand, requests arrive faster than reviewers can understand them. A tired reviewer receives a polished summary without the underlying evidence, clicks Approve and unknowingly defeats the control the architecture claims to provide.

**Naming somebody responsible does not supply the capability on which the system depends.**

If safe operation depends on human judgment, human capability is an architectural dependency. Architects must account for staffed availability, competence, queue capacity, cognitive load, interruptions, decision latency, evidence quality and the power to reject or stop the action. Operations must supply that capacity. Evaluation must establish that the whole path works under realistic pressure—not only with one attentive expert at a demonstration.

People are not interchangeable APIs. Their agency, professional judgment and right to refuse are part of the design. So are training, shift handovers and the effort of rebuilding context. [UA's control-loop anatomy](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/control-loop-anatomy.md) makes human response time, capacity and decision quality explicit control concerns.

**We are engineering a socio-technical stack:** models, data, tools, interfaces, evidence, decision rights, operating procedures and people who can actually intervene. A consulting brochure does not build that stack. Nor should a human become the place where an underspecified architecture deposits its failures.

An absent, overloaded or under-informed reviewer is therefore a condition the system must handle. Hold the consequential action, route it to a viable alternative or decline it. Do not let “awaiting human oversight” become permission to proceed without it.

### We will monitor it and roll back

Keep telemetry. Alert the service owner. Give them the ability to disable the assistant or restore the previous version. The expectation is that failures will be detected and corrected in time to keep their consequences within acceptable limits.

**What if not?**

The alert arrives after a credential has been disclosed. An employee has already acted on an unsafe instruction. The team successfully reverts the model, but neither consequence disappears. The recovery mechanism worked; the assumption that it could contain this harm did not.

**Rollback cannot undisclose a credential.**

Control has to meet the consequence in time. Enforce what must be enforced before action. Observe outputs, denials, fallback use, reviewer queues and the health of the controls themselves. Give an authorised owner a working path to contain, narrow or stop operation, then verify that intervention took effect. This connects to the operational monitoring and response concerns in [NIST's AI Risk Management Framework](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/).

If the required response cannot arrive in time, change the boundary: narrow the task, restrict authority, redesign the workflow or reject that AI path. Monitoring is not an architectural answer to a consequence it can only report after the fact.

![Pre-action checks and permission enforcement lead to delivery or fallback; observation, authorised intervention and human capacity close the operating control loop.](asset:pmday-slide-12)

### It passed before release

We finally have a candidate that meets its requirements under the conditions we tested. Its controls, human capacity and fallback support a bounded release decision. The organisation can now rely on that arrangement—provided the conditions that justified it continue to hold.

**What if not?**

A model version changes. Retrieval acquires a conflicting document. Traffic overwhelms the human queue. A provider changes routing. No application commit is required for the basis of our release decision to stop holding. Yesterday's evidence can remain accurately recorded while no longer describing today's system.

Record the conditions of reliance and the changes that require reassessment. Feed incidents into regression cases, retest controls and human capacity, and revisit delegated authority when its justification changes. A release is not a permanent exemption from this work.

Readiness means the design and required capacity are feasible. Done means the candidate meets its agreed evidence obligations. Release means an accountable owner accepts its operating scope. None means “safe forever.”

**We are not just shipping answers. We are maintaining the conditions under which the system is allowed to produce consequences.**

## 6. What If Not?

The direction is promising. I want it to work. Less drudgery, better verification and useful software we could not previously afford are worth pursuing.

Vendors have made their bet: more of software production and operation will be organised around agents. Their engineering work gives us methods to examine and results to test—not an obligation to copy their risk position.

**You, your team and your organisation are not the vendor.**

You have different customers, contracts, systems and resources. A vendor's tolerance for experimentation does not determine what your customers can tolerate. Its access to specialists does not staff your incident response. An API subscription does not supply the human judgment your architecture requires.

A vendor can be right about the direction and wrong about the timing, economics or conditions needed to make it work elsewhere. Its confidence is not your risk acceptance.

What troubles me is the adoption pattern: accelerate generation, discover the next obstruction, automate or remove it, then see what breaks next. **That is an SDLC-wide proof of concept running on the organisation's delivery capability.** It is not a substitute for examining the system before changing it.

The alternative is neither paralysis nor blind commitment. Start with a bounded workflow. Establish the baseline, the useful outcome, the delegated authority and the failures you will not accept. Measure delivery, customer effects, rework, stability, sustained human workload, recovery and full cost. Rehearse the moment the agent cannot repair its own error—and the moment its designated human is absent or overloaded.

When the evidence supports expansion, expand. When it does not, change the design or decline the use case. **You do not owe a vendor your organisation as an experiment. You owe your customers a system you can operate.**

That is what “What if not?” should become: not a pessimistic refrain, but a failure scenario, an acceptance criterion, a dependency we have budgeted for and a recovery path we have tested.

Release does not close the laboratory. Production outcomes must keep changing our assumptions and controls. Delivery obligations continue while we learn.

![Delivery and a continuing learning loop remain connected through experiments, evidence, production outcomes and reassessment.](asset:pmday-slide-14)

Writing let ideas outlive their authors. AI expands how much work with those ideas we can delegate. The sum of our technology includes the systems, institutions and human capabilities required to live with the result.

**Build for the future you believe in. Keep the ability to act if that belief is wrong.**

## Further reading

The two research directions behind this article are [The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis), my research synthesis on AI-assisted delivery risk, and [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture), my developing doctrine and pattern language for Thinking Systems. The former examines the delivery system; the latter examines the object we are learning to control. The title's literary point of departure is Stanisław Lem's [*Summa Technologiae*](https://english.lem.pl/works/essays/summa-technologiae).

## Sources & references

The original studies, vendor accounts, presentation and author research used in this essay. Source notes distinguish measured results, reported observations, hypothetical examples and the author’s engineering conclusions.

### Talk and presentation

1. [PMDay 2026 — AI Changes the Delivery System and the Product Itself (v35 review slide deck)](https://github.com/oborskyivitalii/oborskyivitalii/blob/4d5bcdb7c0b30bd7ba5926007fc24e3752242905/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf)
2. [PMDay 2026 — talk recording (Ukrainian)](https://youtu.be/xSgWjuGqC9I)

### Foundations and empirical research

3. [Research on printing and the Reformation](https://digitalcommons.chapman.edu/economics_articles/99/)
4. [Stanisław Lem, Summa Technologiae (1964)](https://english.lem.pl/works/essays/summa-technologiae)
5. [Mert Demirer, Leon Musolff & Liyuan Yang. Writing Code vs. Shipping Code: Productivity Effects Across Generations of AI Coding Tools. NBER Working Paper 35275 (2026; revised September).](https://www.nber.org/papers/w35275)

   Matched observational estimates across tool generations. Changed lines count additions and deletions; the 25.5× / 3.4× / 1.3× outcomes are not a single funnel and must not be relabelled as customer-value gains. The presentation’s pinned evidence register is the retained reference for the detailed line-count and marketplace figures; asynchronous-agent releases were not separately estimated.
6. [Jessica Baolin & Nathen Harvey / DORA. Balancing AI Tensions: Moving from AI Adoption to Effective SDLC Use (10 March 2026; discusses the 2025 report).](https://dora.dev/insights/balancing-ai-tensions/)

   The throughput/instability result is an association, not an experimentally established causal effect.
7. [Agarwal, He & Vasilescu. AI IDEs or Autonomous Agents? Measuring the Impact of Coding Agents on Software Development (2026), version 2.](https://arxiv.org/html/2601.13597v2)

   Table 2: +34.85% (agent-first) and +42.87% (prior AI-IDE exposure) for static code complexity. Identification limits and pre-treatment trends matter; these are not measured changes in human comprehension.
8. [GitClear, The AI Code Quality & Maintainability Gap (2026)](https://www.gitclear.com/the_ai_code_quality_maintainability_gap)

   Vendor-produced observational report. The +81% figure compares code-block duplication with the 2023 baseline; it is not a controlled experiment establishing that AI alone caused the change.
9. [Bacchelli & Bird, Expectations, Outcomes, and Challenges of Modern Code Review](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/)
10. [Microsoft Research, Online Experimentation at Microsoft](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/)
11. [Joel Becker / METR. Measuring the Self-Reported Impact of Early-2026 AI on Technical Worker Productivity (11 May 2026).](https://metr.org/blog/2026-05-11-ai-usage-survey/)

    349 technical workers in a convenience sample. Speed and work-value estimates are self-reported and depend on question wording, not observed end-to-end delivery effects.
12. [Feature-fatigue research, Journal of Marketing Research (2005)](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431)
13. [NIST/SEMATECH, Confidence Interval for a Proportion (Wilson interval)](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm)

    The 0.8%–5.0% interval in the article uses four failures out of 200 and the 95% Wilson method. The example is synthetic and assumes independent representative observations from a stable population.

### Vendor proposals and historical claims

14. [Cognition, Introducing Devin (2024)](https://cognition.com/blog/introducing-devin)

    Historical launch claim. The same announcement describes human review and collaboration; it does not literally promise that every programmer will immediately be replaced.
15. [Council on Foreign Relations, Dario Amodei — CEO Speaker Series (2025)](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic)

    Original March 10, 2025 transcript. The code-generation forecast explicitly retains human specification, design, integration and security judgment.
16. [Anthropic, Code Review product/article (2026)](https://claude.com/resources/articles/code-review)
17. [Jay Parikh / Microsoft, New Rules for Builders: Agentic AI Development (2026)](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/)
18. [Anthropic, Solving Code Review at Anthropic (15 October 2026)](https://claude.dev/blog/solving-code-review-at-anthropic/)

    Vendor account retained from the reviewed source material: merged Claude Code PRs reportedly more than doubled while the reverted share fell by over 40% from June to September. It describes layered controls, leaves shared codebase understanding without a formal process, and reports no automatic incident/revert-triggered approval-tightening circuit breakers. These are internal observations, not an external test of portability.

### Standards and operational guidance

19. [NIST. Artificial Intelligence Risk Management Framework (AI RMF 1.0), Core (2023).](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)

### Author research

20. [Vitalii Oborskyi, The Subprime Code Crisis — independent research synthesis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis)
21. [Vitalii Oborskyi, Uncertainty Architecture — open research repository](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture)
22. [Uncertainty Architecture, Uncertainty in the Controlled Object (pinned doctrine)](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md)
23. [Uncertainty Architecture, Control-Loop Capability Anatomy (pinned doctrine)](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/control-loop-anatomy.md)

    Version-pinned draft-normative doctrine, used to state the author’s control-design position. It is not a field trial proving that a particular human-oversight arrangement works.

## How to cite this draft

This revision is an unpublished editorial draft, R6, dated 16 October 2026. No public URL or DOI has been assigned to this text. Cite the revision you actually read.

Suggested citation

Oborskyi, V. (2026, October 16). The Sum of Our Technology: AI Changes Both Sides of Software Engineering [Unpublished editorial draft, R6].

```
@unpublished{oborskyi2026sumtechnologyR6,
  author = {Oborskyi, Vitalii},
  title = {The Sum of Our Technology: AI Changes Both Sides of Software Engineering},
  year = {2026},
  month = oct,
  note = {Unpublished standalone editorial draft R6, 16 October 2026}
}
```

<!-- ARTICLE END -->

## R6 assembly and review handoff — not article prose

### Scope and source identity

The author requested: rewrite the second part around the exact turn **What if not?**, rebuilding its lead-ins and exits; deliver a clean shareable PDF with images and clickable sources; update the existing PR. No site integration, stable staging, production, LinkedIn or Medium build is requested here. R4 and R5 were standalone editorial successors, not previously integrated site editions. This file now preserves their complete reader text plus the R6 change rather than applying a chapter-only patch to obsolete r3 prose.

Reader Markdown SHA-256 (between the boundary comments, trimmed then one LF): `41636550c09ead2baf8740d0d4b6bd0d6eb4fabc44e08cd1a3c192456849aaa0`.

Delivered standalone PDF: `The_Sum_of_Our_Technology_R6.pdf`, 1,643,216 bytes, 15 A4 pages; SHA-256 `a5350c8504b02cf68e08d52f33a55c6f0bf82bed5f4922e4fdd57019b262d1ae`. This is a conversation deliverable, not an in-repository PDF file or managed-CI print artifact. Producer: WeasyPrint 68.0, embedded Lato/Noto Serif fonts. No website navigation, controls, 3D background or platform adapters appear in the PDF.

### What changed in chapter 5

| Assurance | Failure after the exact What if not? pivot | Required exit |
| --- | --- | --- |
| Instructions keep judgment within the permitted boundary | Conflicting context produces a prohibited disclosure despite the instruction | Explicit permitted response space and enforced access boundaries |
| The evaluation establishes reliance | A correct aggregate score supports a wrong release decision; severity/coverage/uncertainty are hidden | Decision-specific evidence, not average-only acceptance |
| A second model catches the generator's errors | Shared source or premise yields shared error; the checker also times out | Test the checker and its fallback; keep exact authorisation independent |
| A qualified human intervenes in time | Unstaffed queue, overload or inadequate evidence defeats nominal approval | Engineer coverage, capacity, cognition, authority and a viable absent-reviewer path |
| Monitoring and rollback contain consequences | Detection is late or the consequence cannot be reversed | Pre-action controls, timely verified intervention, narrower authority or no-go |
| Release conditions continue to hold | Model, retrieval, provider or workload changes invalidate the release basis | Reassess evidence, controls, human capacity and delegated scope |

There are exactly six standalone **What if not?** paragraphs in chapter 5. No generic What if question replaces them. Keep the expectation before each pivot and its specific failure/control after it; this is not a search-and-replace instruction. Preserve the human-as-architectural-dependency and socio-technical-stack argument. The R5 paragraph about even useful features exceeding users' absorption capacity stays declarative, without an added refrain.

### Eight figures, with seven unchanged v35 slides

Keep the existing cover followed by slide IDs **03 / 05 / 07 / 09 / 10 / 12 / 14** in the reader's exact order. All are direct source-image payloads retained from the R5 standalone reader, not new or AI-redrawn diagrams. The repository has corresponding PNGs under `site/assets/publications/pmday-ai-both-sides/`. A future canonical assembly must reconcile its metadata alt/captions with the reader, not silently overwrite either. Local review encodings and committed 1921px PNGs can differ in bytes; do not claim they are identical exports.

Original deck review PDF remains pinned at SHA-256 `b3fa9fb0220a6620db0b28ac3d560b987791be0dfb6cdd02c53c04975d881782`, from UA PR113 commit `22639d311d5fb46a23f3d5cdd819800dbe1169d9`. The review rendition is not newly accepted as the exact event-presented edition or as blanket rights clearance.

| Asset | Reader caption |
| --- | --- |
| cover | We can delegate more work. We still have to own the consequences. |
| pmday-slide-03 | The chain, not the code generator, sets delivery capacity. Synthetic push-system example: downstream capacity stays fixed and every generated change enters the queue. PMDay v35, slide 3. |
| pmday-slide-05 | The comprehension gap is an illustrative overload scenario, not a measured human limit. A sustainable workflow must build understanding as well as output. PMDay v35, slide 5. |
| pmday-slide-07 | A new SDLC equilibrium has to be demonstrated. The left column identifies what to measure; the right proposes countermeasures to test. PMDay v35, slide 7. |
| pmday-slide-09 | Different answers may be correct; unauthorised disclosure is not an acceptable variation. The response space is schematic, not a probability distribution. PMDay v35, slide 9. |
| pmday-slide-10 | The average cannot cancel a forbidden consequence. The 196 / 3 / 1 outcomes are synthetic; sampling uncertainty and release prohibitions answer different questions. PMDay v35, slide 10. |
| pmday-slide-12 | The complete path: constrain, check, authorise, act, observe and correct. Human capacity and time to intervene are part of the operating architecture. PMDay v35, slide 12. |
| pmday-slide-14 | Delivery obligations continue while evidence updates the design. Production outcomes, failures and reassessment close the learning loop. PMDay v35, slide 14. |

Slide credit: Screenshot of PMDay 2026 v35 review presentation, slide N · Vitalii Oborskyi. Retain all on-slide caveats and third-party credits. Cover credit: Editorial cover illustration directed for this article; generated 15 October 2026. No ninth figure, replacement poster, image crop, rewritten chart value or duplicated generic diagram.

### Evidence and acceptance boundaries

No new empirical result is introduced. Existing NBER, DORA, Agarwal, GitClear, METR, feature-fatigue and Wilson qualifications stay in prose and named source notes. The access-recovery failures and 200-case evaluation remain hypothetical/synthetic. UA links state the author's developing framework, not independent experimental validation. A new external-source audit is not claimed by this rhetorical revision.

Standalone checks performed: all 15 PDF pages rendered; all eight images present; 23 distinct external URL targets covered by 68 clickable PDF annotations; 24 PDF bookmarks; no out-of-page text spans; exact six chapter-5 pivots; unchanged pre-chapter-5 reader and chapter-6/bibliography HTML; all R5 image payloads retained. Self-review only, not independent editorial, scientific, rights or device acceptance.

Repository source/RI build and verify, managed site/PDF checks, hosted preview, fresh platform kits and author publication acceptance are not completed by this edit. No generated RI is manually patched and no earlier green job is claimed for R6. Keep issue #2 AC01–AC06 and applicable #5 release/rights gates open. On later site integration, read current refs and ownership, copy only the reader text, synchronise metadata/alt/captions, create a new semantic edition without mutating r3 or historical artifacts, preserve the bibliography/citation block, run mapped checks, and request the remaining human decisions. Do not substitute the old five-slide or generic-diagram plan.
