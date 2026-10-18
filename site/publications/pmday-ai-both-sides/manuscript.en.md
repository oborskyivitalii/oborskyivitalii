# The Sum of Our Technology

*AI Changes Both Sides of Software Engineering*

![Conceptual architecture connects software construction with a branching decision structure.](asset:cover)

An agent opens a pull request. The tests are green. The explanation is fluent. Another pull request arrives before anyone has understood the first.

The dashboard calls this progress. The person who will handle the next incident has a different question.

**What if not?**

What if faster code generation does not produce faster delivery? What if automated review finds defects but leaves nobody equipped to recover the system? What if the human who supposedly makes the final decision cannot meaningfully make it?

These are not objections to the future. They are questions the future has to answer.

My PMDay talk connects two shifts: AI changes **how we build software**, and model judgment changes **what some software does at runtime**. In both, we can delegate more work. We still have to own the consequences.

[Slides (PDF)](https://github.com/oborskyivitalii/oborskyivitalii/blob/4d5bcdb7c0b30bd7ba5926007fc24e3752242905/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf) [1] · [Recording (Ukrainian)](https://youtu.be/xSgWjuGqC9I) [2]

## 1. When ideas outlive their authors

Writing allowed ideas to survive the people who expressed them. Printing changed how far and cheaply those ideas could travel. A thought could leave a conversation, cross a border and enter someone else's discovery centuries later.

The important change was not simply more text. It was what became possible when knowledge no longer depended so heavily on someone's presence and memory. [Research on printing and the Reformation](https://digitalcommons.chapman.edu/economics_articles/99/) [3] connects a new means of circulating ideas with changes beyond book production. Technology changes what people can do together—not only how quickly one task gets done.

Large language models move another boundary. We can delegate interpretation, comparison, design proposals, implementation and explanation. *Delegating thinking* describes that practical change; it does not require a claim about consciousness.

The question is not just what a new capability lets us do. It is what happens to the larger system when we begin doing it.

Software gives us an immediate test. An AI agent can build an ordinary application. A conventionally staffed team can build a product that depends on model judgment. These are different shifts, with different failure modes. A convincing demonstration of either is not an answer to what happens when it stops working.

## 2. We accelerated a step. Not the system.

The early story was spectacular. In 2024, [Cognition introduced Devin as the “first AI software engineer”](https://cognition.com/blog/introducing-devin) [5]. In March 2025, [Dario Amodei forecast AI writing 90% of code within three to six months](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic) [6], potentially essentially all code within a year. Both accounts retained human responsibilities. But producing code is not the same as replacing software engineering. Equating the two is a category error.

The first readily accelerated activity in many deployments was **code generation**. Yet software reaches a customer through a chain:

**Intent → requirements → design → code → review → test → integration → deployment → operation.**

A code generator does not, by itself, rebalance that chain. Push more work into review, testing and integration without changing their capacity, and pressure accumulates there. This did not require years of production experience to discover. It follows from the structure of the system.

Take a simplified example: a team can generate, review and integrate eight comparable changes a week. Increase generation capacity to one hundred. If every generated change enters the queue, delivery remains eight and unfinished work grows by ninety-two a week.

We have become dramatically better at producing unfinished work.

![Synthetic capacities: generation rises from eight to one hundred changes per week while review and integration remain at eight; the queue grows by ninety-two if every change is admitted.](asset:pmday-slide-03)

Now use controlled intake and limit work in progress. The queue need not grow without bound, but unchanged review and integration still cap delivery at eight. Faster generation may save effort or waiting time; it does not produce a proportional throughput gain. Installing the tool does not perform the surrounding redesign for us.

The September revision of [*Writing Code vs. Shipping Code*](https://www.nber.org/papers/w35275) [7] summarises cumulative effects as **25.5× changed lines, 3.4× commits and 1.3× releases**. Its study covers more than 500,000 GitHub developers. These are outcome-specific estimates, not a conversion funnel; changed lines include additions and deletions, and asynchronous-agent releases were not separately estimated.

A roughly 30% release gain is a gain—not a failure. [DORA's 2025 findings](https://dora.dev/insights/balancing-ai-tensions/) [8] likewise associate AI adoption with higher throughput, alongside greater instability. The gains matter. So does the distinction between more activity, faster delivery and a healthier system.

I examine costs shifted into review, QA, architecture, maintenance and production in [The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) [9]. The danger is not that local gains are imaginary. It is that we book them before accounting for the work and risk moved elsewhere.

Now the narrative follows the next bottleneck. [Anthropic's Code Review announcement](https://claude.com/resources/articles/code-review) [10] addresses growing review pressure. [Microsoft's Jay Parikh](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) [11] turns it into an instruction:

> **“Don’t let code review become a bottleneck”**

The framing is broader than review. Earlier, Parikh urges readers to **“Throw out the old playbook.”** He presents established workflows as unable to absorb the new volume of generated changes. That is a call to redesign the process, not merely install another tool. [11]

His proposal is to move first-pass review to agents while people retain architectural oversight. Elsewhere in the same article, the promise becomes **“Execution runs on autopilot.”** The attraction is clear: less routine inspection, faster flow, human attention reserved for the difficult decisions. But architectural oversight is not a resource that appears because we name it. It depends on people continuing to understand the system whose implementation they increasingly do not inspect.

**What if not?**

Review gets faster, but the work of understanding the change no longer happens. Defect detection improves while incident investigation becomes harder. The team keeps the approval button and loses the capability that gave approval meaning. **The queue has cleared. The ownership gap has not.**

**Identifying a bottleneck does not prove that its function can be removed.** An activity has been accelerated. Its responsibilities have not necessarily been discharged.

There is important counterevidence. In its [October account of code review](https://claude.dev/blog/solving-code-review-at-anthropic/) [12], Anthropic reports that merged Claude Code PRs more than doubled while the reverted share fell by over 40% between June and September. It describes layered checks, risk-based approvals and staged release. Those are encouraging internal results from a redesigned workflow, not merely a promise.

They do not establish causality or portability. A lower reverted share is not necessarily fewer absolute reversions, and neither metric measures shared understanding or every latent defect. The same account identifies no formal shared-understanding process yet and no automatic tightening of approvals when incidents or reversions rise. Another organisation must establish those capabilities, not inherit them by analogy.

The sequence matters. First, code generation accelerates. Then the work that cannot keep up becomes the next obstacle to automate. The new engineering may be substantial; the initial system-level promise was still incomplete. **The broader redesign was part of the problem from the beginning—not an optional extra to discover after rollout.**

## 3. The scarce resource is understanding

The burden is not only more code. [Agarwal, He and Vasilescu](https://arxiv.org/html/2601.13597v2) [13] estimate increases in static code complexity of **34.85% for agent-first repositories and 42.87% for those with earlier AI-IDE exposure**. Their repository-level model controls for lines of code, among other covariates. This is not a per-line metric or a measurement of human comprehension. [GitClear](https://www.gitclear.com/the_ai_code_quality_maintainability_gap) [14] separately reports **81% more duplicated code blocks than its 2023 baseline**, an observational industry signal rather than proof of AI causation.

My presentation shows generation rising faster than team comprehension. It is an illustrative overload scenario, not a measured cognitive ceiling. Tools and learning can increase comprehension capacity. The question is whether our workflow actually does so.

![Illustrative generation and comprehension curves diverge, showing a possible overload scenario rather than a measured human limit.](asset:pmday-slide-05)

Code review has more than one output. It can find defects and teach another engineer what changed, why, and where it may fail. [Bacchelli and Bird](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/) [15] identify knowledge transfer and team awareness among review's outcomes. Automating one does not automatically reproduce the others. Ceremonial human approval accomplishes neither.

Bainbridge's [*Ironies of Automation*](https://doi.org/10.1016/0005-1098(83)90046-8) [16] describes the older version of this trap: automation leaves people responsible for difficult exceptions while reducing the practice that equips them to respond.

**Responsibility does not disappear when understanding disappears. We are left responsible for something we are less capable of controlling.**

### The explanation will give us the understanding

We cannot keep up with the code, so we ask an LLM to explain it. Perhaps specifications and generated documentation become the durable artifacts, and implementation becomes a replaceable detail. That would be useful.

**What if not?**

Now we have two things to trust: an implementation and a story about it. The story can inherit the mistake, omit the exception or describe intention instead of behaviour. A specification, implementation and test suite can agree because all three share the same wrong assumption. Agreement is not independent verification.

Connect explanations to exact revisions, observed traces and independently established requirements. Ask an engineer to predict critical behaviour or diagnose an unfamiliar failure using those artifacts. The test is whether the team can do it—not whether the repository contains an impressive amount of Markdown.

### We can always regenerate the code

Parikh gives this idea another blunt heading: **“Code is disposable”**. For a [well-bounded feature](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) [11], he suggests the specification may become the durable artifact. Replacement may indeed be cheaper than repair. The expectation is that, if implementation fails, the agent can produce a working substitute.

That changes the economics of implementation. It does not make the production state disposable.

**What if not?**

Customers cannot complete transactions. The agent proposes a fix, then another. Neither restores service. A rewrite looks tempting, but existing data and integrations cannot simply be discarded.

Who stops the retries? Who contains the damage? Who can reconstruct the relevant assumptions and establish that recovery worked?

**Code may be disposable. Your customers' data, obligations and consequences are not.**

Ownership does not require memorising every line. It requires the ability to investigate, challenge and change the system when the abstraction fails. AI can support that capability. Recovery still has to work when the preferred agent does not.

### A new equilibrium has to be demonstrated

We should change the SDLC. We should not protect unnecessary work—or remove necessary capabilities because they interfere with a throughput target.

Try smaller changes, work-in-progress limits, better specifications, AI-assisted review and clearer ownership. Measure review age, rework, stability, knowledge coverage, recovery and total effort. A faster queue accompanied by slower recovery is not a solved problem; the cost has changed address.

![Measurement and candidate countermeasures for finding a sustainable AI-assisted SDLC equilibrium.](asset:pmday-slide-07)

## 4. More software is not more value

Suppose the redesigned workflow really does ship much faster. Review, testing and integration can keep up. The promise is no longer just more code: more ideas can become working features, reach customers sooner and create more value for them and for the business.

**What if not?**

We release more features, but the customer problem remains. A requested capability gets little use. A polished addition complicates the job it was meant to improve. We have shortened the journey from an assumption to an implementation without establishing that the assumption was right.

Cheap implementation makes experiments more affordable. It also makes it easier to bypass the conversation in which somebody asks whether a feature should exist. [Kohavi and colleagues](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/) [17] report that only about one-third of well-designed Microsoft experiments improved their intended key metric. That is a finding from their setting, not a universal success rate for product ideas. A decision not to ship can be a successful outcome of faster engineering.

The [NBER study](https://www.nber.org/papers/w35275) [7] reports rising low-usage shares in new cohorts: iOS apps with fewer than ten ratings increased from about **78% to 87%**, and Chrome extensions with fewer than ten downloads from **19% to 33%**. These are first-three-month usage proxies, not welfare measures or proof of AI causation.

[METR's survey of 349 technical workers](https://metr.org/blog/2026-05-11-ai-usage-survey/) [18] reports median speed gains of **3×**, against **1.4–2× work-value gains** across question formulations. These are self-reports; importantly, they describe perceived value gains, not merely a disappointing gap. The point is not to deny those gains. It is to establish which customer outcomes actually improve rather than treating additional output as the answer.

### The user's capacity is part of the product

Now grant the stronger case: we have rebalanced the entire SDLC, and every feature is genuinely useful. Suppose we deliver twenty to thirty times as many customer-facing changes—a thought experiment, not the release multiplier measured by NBER. The expectation is that this greater supply of useful capability becomes more realised value for customers and a stronger competitive position for the business.

**What if not?**

The user is still a person. Faster delivery has not given them more attention, learning time or capacity to reorganise their work. A useful feature must be discovered, understood and incorporated into a routine before its potential benefit becomes a result.

Imagine someone using a reporting tool once a month while its workflow changes every week. Each improvement may make sense in isolation; each visit can still require relearning the job. Useful capabilities accumulate faster than the person can absorb them. The value exists as a possibility, but not yet as an improvement in their work.

**The comprehension problem has crossed the product boundary—from the team building the software to the people using it.**

[Feature-fatigue research](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431) [19] examines a related trap: capabilities attractive before use can make a product harder to use afterwards. It does not establish a universal human learning rate. The relevant capacity depends on the user, task and change; no fixed cognitive multiplier is needed to recognise that it is finite.

Nor does every improvement impose learning work. A better default, faster response or repaired defect can help without asking the user to learn anything new. Extra delivery capacity remains valuable. It gives us more choices about what to improve—not a reason to expose users to every change we can produce.

Measure adoption of released changes, time to a useful result and support burden. Sequence changes people must learn; spend capacity on repairs, accessibility, better defaults and fewer steps. **The competitive advantage is not how much change we can deliver. It is how much better customers can work because of it.**

So far, people have had to understand the system we build and absorb the changes we deliver. In the second shift, their ability to judge and intervene becomes part of the running system's control architecture. These are different roles, with a shared constraint: human capability is not unlimited.

## 5. When the product itself makes judgments

The second shift puts model judgment **inside the running product**. A bad answer can now become an operational event without anyone opening a pull request.

Consider an assistant helping employees recover account access. It interprets requests, retrieves guidance and proposes the next step. This can be more useful than a rigid decision tree. It also means part of the path from request to consequence is determined at runtime.

In [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) [20], I call software with at least one consequential runtime responsibility depending partly on probabilistic model judgment a [*Thinking System*](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md) [21]. The classification describes how responsibility is implemented, not consciousness or proof of safety.

Follow the assistant through six assurances. Each sounds reasonable. Each rests on something we must establish—not merely expect.

### We will tell the model what it must not do

Give it approved guidance. Instruct it never to invent a recovery step, disclose restricted information or bypass authorisation. The expectation is that these instructions keep useful judgment inside the permitted boundary.

**What if not?**

Two documents conflict. The assistant chooses a plausible instruction from the wrong context or includes information the requester must not receive. The prohibition was present. The prohibited result still reached the user.

A prohibition in a prompt is not an enforced boundary.

Define acceptable responses: answer with approved guidance, clarify missing information or escalate. Restrict retrieval and enforce permissions before disclosure or action. Identity and access obligations remain exact; the model must not become its own access-control mechanism. Useful variation survives, but variation does not grant authority.

![Acceptable answers, clarification and escalation occupy a bounded response space; unauthorised disclosure is outside it.](asset:pmday-slide-09)

### The evaluation will tell us whether it works

Test against the agreed requirements. Evaluation should establish when we can rely on the assistant. The presentation uses this **synthetic** set:

| Outcome | Responses |
| --- | ---: |
| Acceptable | 196 |
| Incorrect recovery instructions | 3 |
| Restricted information disclosed | 1 |

Ninety-eight percent acceptable. The tempting conclusion is that the assistant is ready to take responsibility.

**What if not?**

The percentage can be correct while the release decision is wrong. Under a rule prohibiting that disclosure, this candidate fails. The other responses do not cancel the person's loss. An aggregate score cannot overrule a specific obligation.

The critical class is one disclosure in 200: **0.5% observed; approximate 95% Wilson interval 0.09%–2.78%**, assuming independent, representative sampling under stable conditions. The interval expresses uncertainty, not permission. A curated *Golden Set* probes known requirements and difficult cases; it need not represent production. [22]

![Synthetic evaluation: 196 acceptable responses, three incorrect recovery instructions and one unauthorised disclosure.](asset:pmday-slide-10)

Even 3,000 failure-free trials would give only a one-sided 95% upper bound near 0.1%—under those same sampling assumptions, not a universal release guarantee. [22]

Evaluation supplies evidence. Severity, coverage, uncertainty and enforceable boundaries determine what that evidence justifies delegating.

### Another model will check the first one

Put an evaluator between the assistant and the user. A second model can inspect each proposal. The promise is that it catches errors the generator misses, making the combined path more dependable.

**What if not?**

Both models receive the same misleading document and accept the same unsupported premise. The checker approves the error it was meant to intercept. A separate invocation has supplied another verdict, not independent evidence.

[Knight and Leveson's multiversion-programming experiment](https://doi.org/10.1109/TSE.1986.6312924) [23] found more coincident failures than independence predicted, despite independent implementations. That is a historical warning against assuming error independence—not a measurement of today's LLM evaluators.

Test the checker against verified failures and valid outputs, including shared-error scenarios. Measure missed errors and unnecessary blocks. Keep exact permission enforcement outside its verdict. A timeout or inconclusive check must lead to a defined wait, denial or safe fallback—not quietly become authorisation.

### The human is an architectural dependency

Then comes the familiar assurance: a qualified person makes the final call. They receive the evidence, recognise the exception and intervene before harm. That is what “human in the loop” promises.

**What if not?**

The assistant escalates a suspicious request. The approval screen exists, but nobody covers the queue at night. At peak demand, requests arrive faster than reviewers can understand them. A tired reviewer sees a polished summary without the evidence, clicks Approve and defeats the control the architecture claims to provide.

[Parasuraman and Manzey's review](https://doi.org/10.1177/0018720810376055) [24] connects automation complacency to competing tasks and attention, and documents automation bias in novice and expert users. Experience and instructions are not sufficient guarantees. Bainbridge's warning returns: the exception reaches a person whose opportunity to maintain the necessary skill may have diminished. [16]

**If safe operation depends on human judgment, human capability is an architectural dependency.**

Architects must account for staffed availability, competence, queue capacity, cognitive load, interruptions, decision latency, evidence and the power to refuse. Operations must supply that capacity; evaluation must test it under realistic pressure. People are not interchangeable APIs. Their agency, training and context-rebuilding time belong in the design.

Human-factors research explains the problem. [UA's control-loop anatomy](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/control-loop-anatomy.md) [25] provides my architectural framing: human response time, capacity and decision quality are control concerns. We are engineering a full **socio-technical stack**, not software plus an oversight footnote.

Make the decision concrete. If qualified approval cannot arrive within the required time, the assistant must not change account access. Remove that permission. It can offer read-only guidance from access-filtered sources and route requests into a verified human process. An unavailable reviewer must never turn waiting into approval. Useful assistance can remain even when autonomous action is rejected.

### We will monitor it and roll back

Keep telemetry, alert the service owner and make the assistant reversible. The expectation is that detection and correction arrive soon enough to keep consequences within acceptable limits.

**What if not?**

The alert arrives after a credential has been disclosed. An employee has already acted on an unsafe instruction. The team reverts the model, but neither consequence disappears. Recovery worked; the assumption that it could contain this harm did not.

Rollback cannot undisclose a credential.

Enforce critical limits before action. Observe outputs, denials, fallback use, reviewer queues and control health. Give an authorised owner a working path to contain, narrow or stop operation—and verify that it took effect. [NIST's AI Risk Management Framework](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) [26] treats monitoring, response and recovery as operational responsibilities.

When intervention cannot beat the consequence, narrow the task, restrict authority, redesign or reject the path. Monitoring is not an answer to harm it can only report afterwards.

### It passed before release

The candidate now meets its requirements under tested conditions. Its controls, human capacity and fallback support a bounded release. We can rely on that arrangement—provided its conditions continue to hold.

**What if not?**

A model changes. Retrieval acquires a conflicting document. Traffic overwhelms the review queue. A provider changes routing. No application commit is required for the basis of the release decision to fail. Yesterday's evidence can remain accurate while no longer describing today's system.

Record the conditions of reliance and reassessment triggers. Turn incidents into regression cases, retest controls and capacity, and revisit authority when its justification changes.

Readiness means the design and capacity are feasible. Done means the candidate meets agreed evidence obligations. Release means an accountable owner accepts its operating scope. None means “safe forever”. We are maintaining the conditions under which the system may produce consequences.

Stanisław Lem captured this reciprocal obligation:

> “The more technology takes care of us, the more carefully we must take care of it.”

*— Stanisław Lem; translated from Polish for this article, from a publisher-supplied anthology excerpt. Source and translation details: [27].*

For a Thinking System, that care means maintaining evidence, enforceable limits and the human capacity to act—not merely keeping the model online.

![Model proposals pass fallible semantic checks and enforced permissions; denials, fallback, observation and authorised intervention form a control loop.](asset:pmday-slide-12)

## 6. What If Not?

The direction is promising. I want it to work. Less drudgery, better verification and useful software we could not previously afford are worth pursuing. Refusing to investigate carries its own cost: wasted effort and opportunities competitors may capture.

Vendors have made their bet. Their engineering gives us methods to examine and results to test—not an obligation to copy their risk position.

You, your team and your organisation are not the vendor.

You have different customers, commitments, systems and resources. A vendor's access to specialists does not staff your incident response. An API subscription does not supply the human judgment your architecture requires. A capable vendor can be wrong about timing, economics or the conditions needed elsewhere. Its confidence is not your risk acceptance.

The problem is not moving to the next bottleneck. That is sensible systems work. It is removing a function before demonstrating how its necessary outcomes will be preserved. The history of generation followed by review redesign shows why the unit of adoption must be the workflow—not the tool's headline capability. [10], [11], [12]

Lem's warning also applies to the people creating and promoting that capability:

> “One cannot simultaneously make discoveries and avoid taking responsibility for their consequences.”

*— Stanisław Lem, quoted and translated by Bogna Konior; source and edition details: [4].*

What remains unclear to me is how much of the adoption story was designed with the full system in view—and how much emerged from competition, fragmented responsibility and locally convincing results.

If foreseeable costs in verification, maintenance, recovery and human capacity were understood but left out of the adoption case, the concern is more than enthusiastic marketing. It is whether customers are being encouraged to take on risks and costs that the promise does not make visible.

If those consequences were not seriously considered, the concern is different, but no more reassuring: a system-wide transformation is being promoted without system-level engineering. **That is not a new definition of engineering. It is a retreat from it.**

These possibilities can coexist without a shared plan. Public messaging does not establish private intent. But customers should not have to solve that mystery before demanding an honest account of what they are being asked to operate.

A foreseeable cost does not disappear because it sits outside the benchmark—or outside the vendor's balance sheet.

**The more power we delegate, the more rigor we owe the systems that will bear its consequences.**

For me, that means explicit assumptions, evidence proportionate to the consequences, viable human capacity and tested containment. As technology acts faster, across more systems, with effects harder to reverse, engineering must become more rigorous and more systemic—not more ceremonial. We cannot predict every effect. We can refuse to treat a local capability demonstration as sufficient justification for a system-wide commitment.

An uncontrolled SDLC-wide proof of concept is not a strategy. Neither is paralysis. Start with a bounded decision:

| Establish | The decision it must support |
| --- | --- |
| Workflow and baseline | Which end-to-end outcome must improve? |
| Delegated authority and prohibited results | What may the system do, and what must it never do? |
| Verification, human capacity and full cost | Can we actually operate the required control? |
| Recovery and stop conditions | How will we contain failure when an assumption breaks? |
| Evidence for the next decision | What would justify expansion, restriction or rejection? |

A narrow scope, reversible actions, independently checkable outputs, early failure detection and real response capacity make delegation easier to justify. None is a safety certificate. Together they make an experiment more controllable.

What would justify more delegation for me? Sustained improvement in useful delivery and full cost, without degraded recovery or knowledge coverage, plus successful trials of the adverse cases the architecture depends on handling. The observation period must fit the risk—not an arbitrary universal deadline.

Rehearse the moment the agent cannot repair its error and the moment its human controller is absent. When evidence supports expansion, expand. When it does not, change the design or decline the use case.

**You do not owe a vendor your organisation as an experiment. You owe your customers a system you can operate.**

That is what “What if not?” becomes: a failure scenario, an acceptance criterion, a dependency we have budgeted for and a recovery path we have tested. Release does not close the laboratory. Delivery obligations continue while we learn.

![Delivery commitments continue alongside an experiment-and-reassessment loop informed by production outcomes and incidents.](asset:pmday-slide-14)

Writing let ideas outlive their authors. AI expands how much work with those ideas we can delegate. The sum of our technology includes the systems, institutions and human capabilities required to live with the result.

**Build for the future you believe in. Keep the ability to act if that belief is wrong.**

### Further reading

[The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) [9] is my research synthesis on AI-assisted delivery risk. [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) [20] is my developing doctrine and pattern language for Thinking Systems. They articulate the two engineering problems explored here; they are not independent experimental confirmation of this essay.

## Sources & references

Numbers beside named links connect claims to these sources. Source notes distinguish empirical findings, vendor-reported results, hypothetical examples and the author’s architectural argument.

1. Vitalii Oborskyi. *AI Changes the Delivery System and the Product Itself*. PMDay 2026 presentation. See the Slides (PDF) link at the beginning of this article.

    Figures reproduce full slides 3, 5, 7, 9, 10, 12 and 14 from the v35 presentation copy. Original slide credits and notices remain applicable. Scenarios and proposed countermeasures are not empirical results.

2. [Vitalii Oborskyi. PMDay 2026 talk recording (Ukrainian).](https://youtu.be/xSgWjuGqC9I)

3. [Jared Rubin. “Printing and Protestants: An Empirical Test of the Role of Printing in the Reformation.” Review of Economics and Statistics 96(2), 270–286 (2014).](https://digitalcommons.chapman.edu/economics_articles/99/)

4. [Stanisław Lem. Summa Technologiae (1964).](https://english.lem.pl/works/essays/summa-technologiae) · [Quotation source: Bogna Konior, “Existential Technologies,” Antikythera.](https://existentialtech.antikythera.org/)

    The responsibility quotation in section 6 is reproduced in Konior’s English translation. Her note 18 cites the Polish edition (Kraków: Wydawnictwo Literackie, 2020), p. 471; note 1 identifies the translations as her own. The quotation was checked in Konior’s essay, not independently against that book page. It must not be attributed to Joanna Zylinska’s published English translation. The sentence on delegated power is Oborskyi’s argument, not a quotation from Lem.

5. [Cognition. “Introducing Devin, the first AI software engineer” (12 March 2024).](https://cognition.com/blog/introducing-devin)

    The announcement also describes collaboration and human review; it is not a literal promise to replace all programmers immediately.

6. [Council on Foreign Relations. CEO Speaker Series: Dario Amodei (10 March 2025).](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic)

    The forecast concerns writing code. The same discussion retains human specification, design, integration and security responsibilities.

7. [Mert Demirer, Leon Musolff and Liyuan Yang. “Writing Code vs. Shipping Code: Productivity Effects Across Generations of AI Coding Tools.” NBER Working Paper 35275 (2026; September revision).](https://www.nber.org/papers/w35275) · [Author-hosted full text](https://www.mertdemirer.com/Papers/Demirer_Writing_vs_shipping_code.pdf)

    Table 6, printed p. 33: weeks 21–30, pre-period-normalised, winsorised event-study estimates. Cumulative multipliers: lines 1 + (234.3 + 957.5 + 1254.9)/100 = 25.467; commits 3.441; releases 1.288 (no separate async estimate). Outcome samples differ. Figure 1 rounds these to 25.5, 3.4 and 1.3. Marketplace figures: §7.2.3, January 2025–April 2026 cohorts. Observational working paper, not peer-reviewed.

8. [Jessica Baolin and Nathen Harvey / DORA. “Balancing AI Tensions: Moving from AI Adoption to Effective SDLC Use” (10 March 2026; analyses the 2025 report).](https://dora.dev/insights/balancing-ai-tensions/)

    Survey associations, not randomised causal estimates.

9. [Vitalii Oborskyi. The Subprime Code Crisis — independent research synthesis.](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis)

    Author-led synthesis, not independent experimental validation.

10. [Anthropic. “Code Review” product and engineering announcement (2026).](https://claude.com/resources/articles/code-review)

11. [Jay Parikh / Microsoft. “Introducing Command Line, and the new rules for builders” (2 June 2026).](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/)

    The opening supplies the old-playbook instruction; sections 8 and 10 supply the review and disposability headings, and section 3 the autopilot phrase. These passages are quoted separately, not combined into a statement that review itself is just an obsolete habit. First-pass review moves to agents, human architectural oversight remains, and the disposability argument is limited to well-bounded features. These are not a blanket claim that all code review is unnecessary.

12. [Anthropic. “Solving Code Review at Anthropic” (15 October 2026).](https://claude.dev/blog/solving-code-review-at-anthropic/)

    Internal June–September 2026 comparison, not an external causal or portability study. Reverted share and absolute reverted volume are different measures.

13. [Shyam Agarwal, Hao He and Bogdan Vasilescu. “AI IDEs or Autonomous Agents? Measuring the Impact of Coding Agents on Software Development.” arXiv:2601.13597v2 (27 January 2026).](https://arxiv.org/html/2601.13597v2)

    Table 2; §3.2 includes lines of code as a covariate. §4 notes limitations including isolated pre-treatment differences. Not a per-line or human-comprehension metric.

14. [GitClear. The AI Code Quality & Maintainability Gap (2026).](https://www.gitclear.com/the_ai_code_quality_maintainability_gap)

    Block duplication versus the 2023 baseline; observational vendor report.

15. [Alberto Bacchelli and Christian Bird. “Expectations, Outcomes, and Challenges of Modern Code Review.” ICSE (2013), 712–721.](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/)

16. [Lisanne Bainbridge. “Ironies of Automation.” Automatica 19(6), 775–779 (1983).](https://doi.org/10.1016/0005-1098(83)90046-8) · [Full text (IFAC)](https://tc.ifac-control.org/4/1/newsletter/ironies-of-automation/@@download/file/Bainbridge1983_Automatica_Ironies%20of%20automation.pdf)

    Foundational human-factors analysis, not an LLM deployment trial.

17. [Ronny Kohavi, Thomas Crook, Roger Longbotham, Brian Frasca, Randy Henne, Juan Lavista Ferres and Tamir Melamed. “Online Experimentation at Microsoft” (2009).](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/) · [Full text](https://ai.stanford.edu/~ronnyk/ExPThinkWeek2009Public.pdf)

    §5–5.1. The one-third result describes the authors’ Microsoft experience, not a universal feature-success rate.

18. [Joel Becker / METR. “Measuring the Self-Reported Impact of Early-2026 AI on Technical Worker Productivity” (11 May 2026).](https://metr.org/blog/2026-05-11-ai-usage-survey/)

    Convenience-sample self-reports. The 1.4–2× range reflects different question wording, not a confidence interval.

19. [Debora Viana Thompson, Rebecca W. Hamilton and Roland T. Rust. “Feature Fatigue: When Product Capabilities Become Too Much of a Good Thing.” Journal of Marketing Research 42(4), 431–442 (2005).](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431)

    Does not establish a human learning rate. The monthly-user/weekly-update example in this essay is hypothetical.

20. [Vitalii Oborskyi. Uncertainty Architecture — open doctrine and pattern language.](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture)

    Author-led doctrine and pattern language; not independent empirical validation.

21. [Uncertainty Architecture. “Uncertainty in the Controlled Object.”](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md)

    Selected draft-normative definition. Consequential does not by itself mean high risk or production readiness.

22. [NIST/SEMATECH. e-Handbook of Statistical Methods, §7.2.4.1, Confidence intervals for a proportion.](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm)

    Author calculations for the synthetic example: 1/200 gives a 95% Wilson interval of 0.0883%–2.7774%; 4/200 gives about 0.8%–5.0%. For zero failures, the exact one-sided 95% binomial upper bound is 1 − 0.05^(1/n); at n = 3,000 it is 0.0998%, close to the “rule of three”. Independence, representative sampling, reliable classification and stable conditions are assumptions—not release guarantees.

23. [John C. Knight and Nancy G. Leveson. “An Experimental Evaluation of the Assumption of Independence in Multiversion Programming.” IEEE Transactions on Software Engineering SE-12(1), 96–109 (1986).](https://doi.org/10.1109/TSE.1986.6312924)

    Historical programming experiment, not a quantitative estimate of modern LLM error correlation.

24. [Raja Parasuraman and Dietrich H. Manzey. “Complacency and Bias in Human Use of Automation: An Attentional Integration.” Human Factors 52(3), 381–410 (2010).](https://doi.org/10.1177/0018720810376055) · [Abstract](https://pubmed.ncbi.nlm.nih.gov/21077562/)

    Research review of attention and automation-related decision errors in novice and expert users.

25. [Uncertainty Architecture. “Control-Loop Capability Anatomy.”](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/control-loop-anatomy.md)

    Selected draft-normative architectural framing, not field evidence that a particular human-control arrangement works.

26. [NIST. Artificial Intelligence Risk Management Framework (AI RMF 1.0), Core (2023).](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)

    Operational risk-management framework, not certification of the example system.

27. [Stanisław Lem. Fantastyka i futurologia. Quotation selected in Wiktor Jaźniewicz’s compilation, W strachu przed antymaterią. 1381 cytatów (Wydawnictwo Literackie, 2024).](https://instytutsprawobywatelskich.pl/stanislaw-lem-wiktor-jazniewicz-w-strachu-przed-antymateria-1381-cytatow/)

    The Polish passage is reproduced under “TECHNOLOGIE JAKO TAKIE” in a publisher-supplied excerpt published by Instytut Spraw Obywatelskich on 22 July 2025, and attributed there to Fantastyka i futurologia—not Summa Technologiae. The English wording in section 5 is a translation prepared for this article from that Polish excerpt, not a quotation from a published English edition. No original-volume page number is supplied by the excerpt.

## How to cite this draft

Oborskyi, V. (2026). *The Sum of Our Technology: AI Changes Both Sides of Software Engineering*. Editorial draft R10, 18 October 2026.

Unpublished author-review edition. Cite the revision; no DOI or final publication URL has been assigned.

```bibtex
@misc{oborskyi2026sumR10,
  author = {Oborskyi, Vitalii},
  year = {2026},
  title = {The Sum of Our Technology:
           AI Changes Both Sides of Software Engineering},
  note = {Editorial draft R10, 18 October 2026; unpublished}
}
```

Text © 2026 Vitalii Oborskyi. Presentation and third-party credits remain applicable. The standalone cover uses the existing R7 detail of the original AI-generated illustration.
