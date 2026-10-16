# The Sum of Our Technology

*AI Changes Both Sides of Software Engineering*

![Conceptual architecture connects software construction with a branching decision structure.](asset:cover)

An agent opens a pull request. The tests are green. Its explanation is fluent. Another pull request arrives before anyone has understood the first.

This looks like the future of software development.

**What if not?**

What if we are getting dramatically better at generating work that our organizations cannot verify, integrate, understand or recover? What if the next apparent breakthrough merely moves the failure somewhere less visible?

My PMDay talk connected two changes often discussed separately. AI changes **how** we build software. And model judgment changes **what** some software does when it runs. The first puts pressure on the delivery system; the second changes the object we have to engineer and control.

The question is not whether to embrace AI. It is **what we must still be capable of doing when the promising path does not work**.

[Slides — PDF, v35 review edition](https://github.com/oborskyivitalii/oborskyivitalii/blob/4d5bcdb7c0b30bd7ba5926007fc24e3752242905/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf) · [Recording — Ukrainian](https://youtu.be/xSgWjuGqC9I)

## 1. When ideas outlive their authors

Writing allowed an idea to survive the person who expressed it. Printing changed how far and cheaply that idea could travel. A thought could escape a conversation, cross a border and enter discoveries made centuries later.

The change was not simply more text. Knowledge no longer depended as much on the presence and memory of its author. Research into [printing and the Reformation](https://digitalcommons.chapman.edu/economics_articles/99/) illustrates how consequences of a new means of producing and circulating ideas can extend beyond the activity it initially makes cheaper.

Large language models move another boundary. We can ask them to interpret a request, propose a design, compare alternatives, write code and explain a result. I call this *delegating thinking* in a practical sense, not as a claim that models are conscious or earlier computers performed no cognitive work.

The title is a deliberate, modest echo of Stanisław Lem's [*Summa Technologiae* (1964)](https://english.lem.pl/works/essays/summa-technologiae). I am not claiming Lem anticipated this particular SDLC argument. The allusion is to a harder habit of thought: consider a technology together with the wider possibilities, constraints and consequences it creates.

Software is where that habit is particularly urgent. We need to distinguish an AI agent **building** a conventional product from a product **using** model judgment at runtime. The same organization may do both; the engineering problems are different. A faster implementation does not settle what the product should be allowed to decide.

## 2. We accelerated a step. Not the system.

Think back to how this wave was presented.

In 2024, [Cognition introduced Devin as the "first AI software engineer"](https://cognition.com/blog/introducing-devin). The launch also described it as a teammate whose work people could review. In March 2025, Anthropic CEO Dario Amodei [predicted AI would write 90% of code within three to six months, perhaps essentially all code within a year](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic). In the same discussion, he expressly retained human responsibilities for specification, design, integration and security.

The literal statements matter. Neither example establishes that its speaker promised every developer would lose their job tomorrow. Yet the industry's broader story was easily heard that way: autonomous engineer, nearly all the code, imminent transformation. **An output forecast began to stand in for a system-level promise.**

For many coding-assistant deployments, the first readily accelerated activity was **code generation**. Later agents reached into other tasks too. But neither the ability to produce a change nor an impressive autonomous demonstration proves that the entire software delivery lifecycle has been redesigned to absorb it.

A product reaches a customer through a chain: **intent → requirements → design → code → review → test → integration → deployment → operation**. Each stage has work to perform, limits, dependencies and people who carry the consequences.

If one stage gets dramatically faster while downstream capacities and responsibilities remain unchanged, pressure moves downstream. That is not a surprising defect discovered after rollout. Under those conditions it is the predictable effect of changing one part of a constrained system.

Imagine a team that generates, reviews and integrates eight comparable changes per week. Raise only code-generation capacity to one hundred. If every generated change enters the queue, review and integration still complete eight, while unfinished work grows by ninety-two a week.

This is a deliberately simplified push-system example, **not an AI productivity measurement**. WIP limits, selection and improvements elsewhere would change the result. But the uncomfortable possibility is plain: **we may become far better at producing unfinished work without becoming much better at shipping valuable software.**

![PMDay slide 3: code-generation capacity increases to 100 changes a week, but review and integration remain at eight; 92 uncompleted changes accumulate in the illustrative push system.](asset:pmday-slide-03)

Observed data distinguish these outcomes. Demirer, Musolff and Yang's September 2026 [*Writing Code vs. Shipping Code*](https://www.nber.org/papers/w35275), covering more than 500,000 GitHub developers, reports cumulative estimates of **25.5× changed lines, 3.4× commits and 1.3× releases**. Changed lines include additions and deletions; the study's observational estimates span different outcomes and tooling cohorts, and do not measure asynchronous-agent releases separately. They are not one funnel or a universal productivity multiplier.

[DORA's 2025 analysis](https://dora.dev/insights/balancing-ai-tensions/) similarly associates greater AI adoption with higher delivery throughput **and greater instability**. It does not establish causation. The question is not whether activity increased. It is whether the system improved on the measures that matter.

I examine that gap between local code-generation gains and the costs shifted into review, QA, architecture, maintenance and production in [The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis). It is my independent research synthesis of evidence and delivery-system failure modes—not a separate experiment proving that every team will face the same outcome.

Now the story moves to the next constraint: code review.

[Anthropic introduced multi-agent Code Review](https://claude.com/resources/articles/code-review) in March 2026 in response to the review bottleneck created by more generated code. Microsoft's Jay Parikh argued in June that teams should [stop treating traditional review as a fixed constraint](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/): shift first-pass checks to agents, keep humans involved in architectural decisions and rethink the workflows around them.

These are real engineering responses to a real problem. They **might work**.

**What if not?**

What if automated review catches more local defects but leaves fewer people who understand why the system behaves as it does? What if review becomes faster while repair, incident investigation or architectural correction becomes slower? What if a team keeps the approval button but loses the knowledge that made approval meaningful?

A bottleneck tells us where capacity is constrained. **It does not tell us that the constrained activity has become unnecessary.** Before removing or automating it, we must understand every outcome it was producing.

To be fair, the vendors have not simply discarded this responsibility. Anthropic's [15 October 2026 account of its Claude Code review process](https://claude.dev/blog/solving-code-review-at-anthropic/) says review remains. It describes layered checks, human approvals scaled by risk, gradual release and incident/revert monitoring; the team reports more than doubling merged PRs while reducing the revert share by over 40% from June to September. Those are **reported internal results**, not a controlled comparison or proof of portability.

The same account acknowledges that it has **no formal process yet for rebuilding shared codebase understanding** and **no automatic approval-tightening circuit breakers** triggered by rising incidents or reverts. These are not reasons to dismiss its experiment. They are precisely the unresolved conditions another organization must not silently assume away. What worked for a vendor's own team is not automatically an operating model for yours.

That is the retrospective tension: the journey began with spectacular claims about the speed of making code, then required an increasingly substantial redesign of the system around the code. We should have expected the second part from the start.

## 3. The scarce resource is understanding

More generated code may be harder to own, not simply more abundant. A longitudinal matched-control study by [Agarwal, He and Vasilescu](https://arxiv.org/html/2601.13597v2) estimates **34.85% greater SonarQube code complexity** after agent adoption for agent-first repositories and **42.87%** for repositories with prior AI-IDE exposure. These are static-analysis complexity estimates, **not measurements of human comprehension**; the study has identification and design limits. Separately, [GitClear's 2026 report](https://www.gitclear.com/the_ai_code_quality_maintainability_gap) reports duplicated code blocks **81% higher than its 2023 baseline**. That is an observational, vendor-produced cross-period signal, not proof that AI alone caused the change.

The studies differ. Both give us reasons to measure maintainability instead of assuming it.

My presentation draws a rising curve for generation beside an almost flat line for team comprehension. The widening gap is an **illustrative overload hypothesis**, not a measured law of human cognition or a forecast. Better tools and learning may move the comprehension line too. Have we shown they do?

![PMDay slide 5: illustrative generation output grows faster than team comprehension, showing a possible—not measured—comprehension gap.](asset:pmday-slide-05)

Code review has always produced at least two things. It may find defects, but it can also transfer knowledge about what changed and why. [Bacchelli and Bird's Microsoft study](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/) identified knowledge transfer and team awareness among review's actual purposes.

An agent can potentially automate the first benefit. It does not automatically reproduce the second. Conversely, ceremonial human review delivers neither. The issue is not who reads the lines. It is whether the team can still **explain, challenge, maintain and recover** what the system contains.

### What if documentation is the answer?

Perhaps the new durable artifact is a specification. Perhaps an AI-generated explanation gives engineers the knowledge they need, even if they rarely inspect implementation details. That could be a major improvement.

**What if not?**

An explanation can reproduce the assumptions that made the code wrong. It may describe intended behaviour instead of observed behaviour. A specification can omit the critical exception; generated implementation and generated tests can then agree with each other while all three are wrong about the business.

That is a failure mode, not an argument against specifications or documentation. Connect them to exact code revisions, independent requirements, executable examples and observed traces. Test whether an engineer can predict a critical behaviour or diagnose a novel incident **using the proposed new artifacts**. A plausible explanation is not yet evidence of understanding.

### The incident the workflow must survive

Consider a hypothetical outage. Customers cannot complete transactions. An agent proposes a fix. Then another. Neither works. A rewrite looks tempting, but the data migration and external integrations have consequences the agent's local tests do not capture.

Who can stop the retries? Who can contain harm, reconstruct the original design assumptions and determine that recovery worked?

The claim that code is disposable has useful, limited scope. [Microsoft explicitly attaches it to well-bounded features](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/). Your customers' data, obligations and dependencies do not become disposable because implementation got cheaper.

The needed capability is not to memorise every line of code. It is to remain able to investigate, challenge and change the system when the new abstraction or its AI assistant fails. That capability can itself use AI—provided the recovery path is tested when the preferred agent cannot solve the problem.

**A workflow that works only while the agent keeps succeeding is not a complete operating plan.**

### Searching for a new SDLC equilibrium

This is not a plea to restore the old process. We should change it. We should not mistake **a candidate countermeasure** for an established replacement of every function we lose.

Measure review age, batch size, work in progress, rework, stability, expertise coverage and recovery without AI. Try smaller batches, WIP limits, AI-assisted review, specifications, explicit ownership and better executable evidence. Check which interventions actually improve end-to-end outcomes and which merely move work or risk elsewhere.

If review gets faster but the team cannot recover production, the system has not reached a healthy equilibrium. If safety improves but no customer outcome does, reassess the economics. If both improve, expand carefully.

![PMDay slide 7: teams measure flow, maintainability, production and recovery while experimenting with candidate controls to find a sustainable AI-assisted SDLC equilibrium.](asset:pmday-slide-07)

## 4. More software is not more value

Suppose we really do solve the delivery bottleneck. We can release ideas far faster.

**What if the ideas are not worth shipping?**

Cheap implementation should make experimentation cheaper. It can also make it easier to skip the disagreement in which somebody asks whether a feature should exist at all.

The answer is not to preserve slowness as a product-quality filter. [Microsoft's work on online experimentation](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/) illustrates why measured customer behaviour can contradict confident product expectations. Saying *no* to a feature can be a successful outcome of faster engineering.

The [NBER study](https://www.nber.org/papers/w35275) also reports rising low-usage shares among young software cohorts, measured over their first three months: iOS apps with fewer than ten ratings went from roughly **78% to 87%**, and Chrome extensions with fewer than ten downloads from **19% to 33%** (January 2025–April 2026). These are usage proxies, not customer welfare, and not proof that AI caused the change.

In [METR's May 2026 survey](https://metr.org/blog/2026-05-11-ai-usage-survey/) of 349 technical workers, median self-reported speed gains were 3× while estimates of work-value gains were 1.4–2× across different formulations. They are convenience-sample self-reports, not measured delivery results.

Customers still have to discover features, understand them and adjust their work. Even **if** we could ship twenty-five times as many changes, they would not suddenly have twenty-five times more attention. [Feature-fatigue research](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431) found a tension between attractive feature lists before use and usability afterwards.

More capacity can buy faster repairs, simpler workflows and fewer steps. It need not buy a larger roadmap. **The test is what became better for the user—not how much larger the release notes became.**

## 5. When the product itself makes judgments

Now for the second shift. So far we have asked whether AI can change the system **building** software without weakening what the team must own. What happens when the running product itself makes consequential judgments?

To use such systems for consequential work, we need to say something larger: **we are no longer designing only software. We are designing an entire socio-technical operating stack**—models, data, rules, evidence, tools, decision authority, operating procedures and people who must intervene when judgment is uncertain or wrong. Software matters. It is not the whole controlled system.

Consider an assistant helping an employee recover account access. It interprets the request, retrieves guidance and recommends the next step. Even if it cannot directly change permissions, its answer may influence someone who can.

In my open research project [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture), I use *Thinking System* for software in which at least one consequential runtime responsibility depends partly on probabilistic model judgment. The [controlled-object explanation](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md) gives the precise definition. This is an engineering classification, not a claim about consciousness, risk level or proven safe control.

Two differently worded answers can both be acceptable. Incorrect recovery instructions and unauthorized disclosure are not just alternative phrasings.

Requirements must specify **the space of acceptable responses and actions**, when to clarify or escalate, and the outcomes that remain prohibited. Input intent, context, data and permissions create combinations that cannot be covered by one happy-path prompt. That does not make identity, access and transaction rules approximate.

![PMDay slide 9: traditional exact-path requirements contrast with a space of acceptable responses—answer, clarify or escalate—bounded by context, permissions and forbidden disclosure.](asset:pmday-slide-09)

And there is a twist: the product may behave differently without a new code commit. Its model, retrieval documents, routing or provider might have changed. A passing test is evidence for the conditions tested, not a lifetime guarantee.

### What if 98% is good enough?

Consider the presentation's **synthetic** evaluation of 200 responses:

| Outcome | Count |
| --- | ---: |
| Acceptable | 196 |
| Incorrect recovery instructions | 3 |
| Restricted information disclosed | 1 |

Ninety-eight percent sounds reassuring.

**What if you are the person whose restricted information was disclosed?**

Under a release rule prohibiting that result, this candidate fails. The other 196 responses cannot cancel the consequence.

Four failures in 200 independent, representative observations would imply an approximate [95% Wilson interval](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm) of **0.8%–5.0%** for the failure rate, assuming a stable target distribution. This is a hypothetical calculation, not a production estimate or universal sample-size recommendation. A curated *Golden Set* probes known obligations; a representative sample estimates frequencies. Neither makes the other unnecessary. Even the evaluator can be wrong.

![PMDay slide 10: in 200 synthetic responses, 196 are acceptable, three instructions are incorrect and one disclosure violates a release prohibition despite a 98% acceptable average.](asset:pmday-slide-10)

We need to separate **ready to begin**, **done** and **authorized to release**. Readiness establishes the initial scope, obligations, budgets, evaluation plan and the feasibility of any required human decision capacity. Done establishes evidence against those obligations, tested fallback and documented limitations. Release requires an accountable decision about remaining operational risk and the capacity to intervene **in the time available**. One green demonstration cannot make all three decisions.

### What if control fails at the moment it matters?

Control cannot consist only of watching dashboards after a harmful answer has reached a user. The access assistant needs bounded retrieval, fallible semantic checks, **enforced permission and approval gates before consequential delivery**, a denial/fallback path and observation of what happened.

A second model reviewing the first may help; it can also make the same mistake. It must not substitute for exact authorization. After deployment, an authorized person must be able to narrow, suspend or disable the risky path and verify that intervention worked. [NIST's AI Risk Management Framework](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) addresses monitoring, disengagement and recovery as operational concerns.

![PMDay slide 12: a model proposal is checked before consequential action; failed checks take a denial or fallback route, while monitoring and authorised intervention support ongoing control.](asset:pmday-slide-12)

### The human is an architectural dependency

“Human in the loop” looks reassuring in a diagram or consulting brochure. In production, it is an architectural claim: **someone with real authority, adequate evidence and enough time will be available when the system needs a consequential decision.**

**What if not?**

Suppose our access-recovery assistant routes a suspicious request to a security reviewer. The approval screen exists. The workflow has an escalation arrow. But at night the queue is unattended; during peak demand it grows faster than reviewers can clear it; or the reviewer sees a fluent summary without the evidence needed to recognize a privacy breach. We have drawn a control path that the organization cannot reliably operate.

That human path has architecture-level dependencies: staffed coverage and continuity, arrival rates and review capacity, decision latency relative to possible harm, training and competence, cognitive load and attention switching, evidence quality and independence, permission to refuse or escalate, and a tested fallback when the reviewer is absent or overloaded. **These are design inputs, operating costs and failure modes, not work to leave for governance after deployment.**

[Uncertainty Architecture's control-loop anatomy](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/control-loop-anatomy.md) explicitly treats Human Authority response time, capacity and decision quality as observable control concerns. People are not interchangeable APIs; treating them that way would itself be a failure of design. Meaningful oversight requires professional agency, adequate information, independence and the power to say *no*. Yet **if the system's safety depends on that judgment, its limits belong in the architecture.**

Test the whole path. What if there is no reviewer on shift, a sudden surge, misleading evidence, decision fatigue or an intervention that arrives too late? Does a consequential action wait behind an enforced permission gate, fail safely or proceed anyway? Can anyone demonstrate that intervention works **before** an irreversible effect?

**A rollback cannot undisclose a credential.** An oversight policy cannot make a human available after the fact.

If the required human capacity does not exist, cannot act soon enough or makes the use case economically infeasible, **narrow, redesign or reject that AI path**. Another impressive proof of concept will not repair a missing socio-technical architecture.

## 6. What If Not?

The direction is promising. I want it to work.

AI vendors have made a consequential bet: software generation, review, testing and increasingly the surrounding SDLC can be restructured around agents. Their own engineering accounts suggest that this is not fantasy. They are learning, investing in checks, changing the work and accepting the cost of those experiments.

But **you are not the vendor**.

Your team has different customers. Your organization has existing systems, contracts, security boundaries and people who must answer the phone when production breaks. Your available expertise, volume of change, rollback options, regulatory constraints and appetite for loss may be nothing like those of an AI lab.

If a Thinking System depends on human oversight, **your staffing, training, decision rights and cognitive capacity are part of its operating architecture and cost model**. You cannot buy those guarantees with an API subscription or add them afterwards as a compliance footnote.

An operating model that works at a vendor's scale is not a portable proof that the same bet is right for you.

And even capable vendors can be wrong—about timing, costs, generalizability or which problems the next model generation will solve. I hope the current bet pays off. I do not think every organization is obliged to go all-in before it knows what it is risking.

What troubles me most is not the ambition. It is how readily an organization-wide change to software engineering can be treated as **a proof of concept running inside the delivery system itself**: roll out the tools, discover which stage breaks next, automate that stage, and see what happens. We would never accept that as a complete systems-engineering argument for a consequential product. We should be more demanding when the product of the experiment is our ability to engineer and recover *all* the other products.

**What if not?** What if the promised speedup does not survive your review load, architecture, incident profile or cost structure? What if an agent eventually writes everything but nobody can establish what should have been built? What if the new process performs beautifully on good days and leaves your organization unable to respond on the bad one?

There is an alternative to betting the company on a forecast. Choose a bounded workflow. Agree on the outcome, the baseline, the authority delegated and the failures you cannot accept. Track elapsed delivery time, useful customer effects, rework, instability, **human decision latency and sustained workload**, expertise coverage, recovery and full operating cost. Test the candidate changes. Rehearse the moment the agent cannot fix its own error—or its designated human controller is unavailable or overloaded. Keep the ability to stop, contain and recover.

Treat the result as evidence, including when it says *no*. Expand what works, redesign what is unproven and decline what your organization cannot safely operate.

This discipline applies to both shifts: how we build, and what the running product is allowed to do. **Release does not close the laboratory.** Production outcomes and incidents must update our assumptions, evaluations and boundaries while delivery obligations continue.

![PMDay slide 14: normal delivery obligations continue alongside a bounded experiment and reassessment loop fed by production outcomes, incidents and authorised release decisions.](asset:pmday-slide-14)

Lem's title is a reminder of ambition on the scale of a whole technological world. Our practical responsibility is smaller—and harder to delegate. Writing let ideas outlive their authors. AI may let much more of the work with those ideas proceed without us.

**Build for the future you believe in. Keep the ability to act if that belief is wrong.**

### Further reading

The title alludes to Stanisław Lem, [*Summa Technologiae* (1964)](https://english.lem.pl/works/essays/summa-technologiae); for the historical industry trajectory, read [Cognition's 2024 Devin announcement](https://cognition.com/blog/introducing-devin), [Amodei's March 2025 remarks at the Council on Foreign Relations](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic), [Microsoft's 2026 SDLC argument](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) and [Anthropic's October 2026 account of code review](https://claude.dev/blog/solving-code-review-at-anthropic/). These links document claims and proposed practices; they do not jointly establish their universal effectiveness.

The research strands behind the two shifts are [The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) and [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture). Quantitative studies and operational standards are linked beside the claims they qualify.
