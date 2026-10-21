# The Sum of Our Technology

*AI Changes Both Sides of Software Engineering*

Vitalii Oborskyi · Editorial draft R19 · 21 October 2026

![A solitary person stands before a narrow opening of light between monumental dark walls.](asset:cover)

An agent opens a pull request. The tests are green. The explanation is fluent. Another arrives before anyone has understood the first.

The dashboard calls this progress. The person handling the next incident has a different question.

**What if not?**

What if faster generation leaves us unable to recover what we built? What if the person entrusted with the final decision cannot meaningfully make it?

My talk at UA Online PMDay 2026 Autumn connects two shifts: AI changes **how we build software**, and model judgment changes **what software does at runtime**. We can delegate more work. We still have to own the consequences.

**Identifying a bottleneck does not prove that its function can be removed.** Delegating review or a product decision must preserve the outcomes responsible operation requires.

[Slides (PDF)](https://github.com/oborskyivitalii/oborskyivitalii/blob/4d5bcdb7c0b30bd7ba5926007fc24e3752242905/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf) [1] · [Recording (Ukrainian)](https://youtu.be/xSgWjuGqC9I) [2]

## When ideas outlive their authors

Writing let ideas survive their authors. Printing let them cross borders and centuries. [Research on printing and the Reformation](https://digitalcommons.chapman.edu/economics_articles/99/) [3] connects that circulation with consequences beyond book production. Technology changes collective capability, not just task speed.

The title echoes Lem's *Summa Technologiae* [31]: the subject is not one machine, but what living with our technology requires.

Large language models extend delegation to interpretation, comparison, design, implementation and explanation. *Delegating thinking* describes that practical change, not a claim about consciousness.

Who builds the software and what it does are separate questions. An agent can build a conventional application; a human team can build a product that delegates decisions to a model.

Stanisław Lem captured the reciprocal obligation:

> “The more technology takes care of us, the more carefully we must take care of it.”

*— Stanisław Lem; translated from Polish for this article. Publisher-supplied excerpt and attribution: [4].*

A demonstration shows that a capability can work. Engineering asks what its use requires of the larger system, including when it fails.

## I. How We Build

### We accelerated a step. What did the system gain?

The early story was spectacular. [Cognition introduced Devin](https://cognition.com/blog/introducing-devin) [5] in 2024 as the “first AI software engineer”. In March 2025, [Dario Amodei forecast AI writing 90% of code within three to six months](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic) [6], potentially essentially all within a year. Those horizons have passed; this is a forecast, not a verified share. Both accounts retained human responsibilities. Generated code does not measure the whole engineering activity.

The first readily accelerated activity in many deployments was **code generation**. Delivery requires a chain:

**Intent → requirements → design → code → review → test → integration → deployment → operation.**

The September revision of [*Writing Code vs. Shipping Code*](https://www.nber.org/papers/w35275) [7], covering more than 500,000 GitHub developers, summarises cumulative estimates as **25.5× changed lines, 3.4× commits and 1.3× releases**. These observational, outcome-specific estimates are not a conversion funnel. Changed lines include additions and deletions; asynchronous-agent releases were not separately estimated.

A roughly 30% release gain matters. But these are different measures, not a price list: changed lines are neither retained code size nor human reading time. **Would you buy faster delivery if the additional review, maintenance and recovery work cost more than the gain?** The study raises that question; it does not answer it for your team.

The bill can arrive later. Unnecessary dependencies, duplication and deferred cleanup can make diagnosis and recovery harder—a plausible risk, not a cost measured by those multipliers. [DORA](https://dora.dev/insights/balancing-ai-tensions/) [8] associates adoption with higher throughput—and greater instability. Assess the gain over the system's life.

Those findings identify no single bottleneck. Suppose a team generates, reviews and integrates eight comparable changes a week. Raise generation capacity to one hundred; keep the others fixed.

Admit every change: delivery stays at eight; unfinished work grows by ninety-two a week. **We become dramatically better at producing unfinished work.** Control intake: the queue need not grow, but delivery remains capped at eight. Faster generation can save effort without proportional throughput gains.

![Synthetic capacities: generation rises from eight to one hundred changes per week while review and integration remain at eight; the queue grows by ninety-two if every change is admitted.](asset:pmday-slide-03)

This is a Theory of Constraints illustration, not a reproduction of the studies' outcomes. If review **and integration** had spare capacity, delivery could rise until the next constraint. A code generator does not itself rebalance the chain.

[The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) [9] is my synthesis of costs shifted into review, QA, architecture, maintenance and production. The danger is booking local gains before accounting for displaced work and risk.

The narrative now follows the next bottleneck. [Anthropic's Code Review announcement](https://claude.com/resources/articles/code-review) [10] addresses review pressure. [Microsoft's Jay Parikh](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) [11] makes it an instruction:

> **“Don’t let code review become a bottleneck”**

His wider call is **“Throw out the old playbook.”** First-pass review moves to agents; people retain architectural oversight. Elsewhere: **“Execution runs on autopilot.”** This redesign must preserve defect detection and understanding while people inspect less implementation detail.

**What if not?**

Suppose defect detection improves, but incident investigation becomes harder. The approval button survives; the knowledge that gave approval meaning does not. **The queue has cleared. The ownership gap has not.**

Changing the method may preserve those functions—or improve them. [Anthropic reports](https://claude.dev/blog/solving-code-review-at-anthropic/) [12] that merged Claude Code PRs more than doubled while the reverted share fell over 40% between June and September 2026. The team describes layered checks, risk-based approvals and staged release alongside these encouraging internal results.

They establish neither causality nor portability. A lower reverted share need not mean fewer absolute reversions; neither measure captures shared understanding or every latent defect. The team describes explainers and open working channels, but no formal shared-understanding process or automatic tightening of approvals when incidents or reversions rise.

A new equilibrium is possible. Which checks, ownership, knowledge-sharing and recovery practices made it possible—and can we sustain them?

### The scarce resource is understanding

Understanding is not one quantity. Maintainers need context to change code and dependencies; teams need shared context to decide; operators need situational awareness to intervene; users need familiarity to benefit from change. These capabilities are connected, not interchangeable.

The burden may be more than volume. In a longitudinal matched-control study, [Agarwal, He and Vasilescu](https://arxiv.org/html/2601.13597v2) [13] estimate increases in SonarQube's Cognitive Complexity of **34.85% for agent-first repositories and 42.87% for those with prior AI-IDE exposure**. Their model controls for lines of code; this is neither per-line complexity nor measured human comprehension. [GitClear](https://www.gitclear.com/the_ai_code_quality_maintainability_gap) [14] reports an **81% increase in its normalised duplicated-block measure from the 2023 baseline**—an observational vendor signal, not proof of AI causation.

Complexity bears on the work of understanding. [An empirical validation of Cognitive Complexity](https://arxiv.org/html/2007.12520v1) [32] found associations with comprehension time and perceived difficulty. Interacting conditions and dependencies can make a small change disproportionately harder to reason about; that is an engineering explanation of a risk, not a measured scaling law.

There is no universal curve from a static score to human effort. A [smaller study](https://link.springer.com/article/10.1007/s10664-023-10396-7) [33]—three master's students, 32 methods, two applications—found limited prediction accuracy from code measures. That is a bounded counterpoint, not a general disproof. Complexity is a warning, not a direct measure of ownership effort.

Tools, abstractions and learning can raise comprehension capacity. The operating limit is reached when the team can no longer explain critical behaviour or diagnose and contain failures in time.

Review can find defects and spread knowledge of what changed and why. [Bacchelli and Bird](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/) [15] identify knowledge transfer and team awareness among its outcomes. Automating one does not reproduce the others; ceremonial human approval delivers neither.

Bainbridge's [*Ironies of Automation*](https://doi.org/10.1016/0005-1098(83)90046-8) [16] describes the older trap: automation leaves people the difficult exceptions while reducing the practice needed to handle them.

**Responsibility does not disappear when understanding disappears. We are left responsible for something we are less capable of controlling.**

#### The explanation will give us the understanding

Ask an LLM to explain the code. Now we trust an implementation and a story that can inherit its mistake. Specifications, code and tests can share a wrong assumption. Agreement is not independent verification; a faithful description does not establish that behaviour meets the business need.

Consider a team building an account-recovery assistant. Can a maintainer trace a proposed change from identity policy through permissions and fallback, then diagnose a failed recovery using the actual tools? Connect explanations to exact revisions, observed traces and independent requirements. Record where missing context blocks the exercise. Understanding is a demonstrated capability, not a quantity of Markdown.

#### We can always regenerate the code

Parikh's other blunt heading is **“Code is disposable”**. For a [well-bounded feature](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) [11], replacement may be cheaper than repair and the specification more durable.

Now customers cannot recover their accounts. The agent proposes two fixes; neither restores service. A rewrite looks tempting, but existing data and integrations cannot be discarded. Who stops the retries, contains damage and establishes that recovery worked?

**Code may be disposable. Your customers' data, obligations and consequences are not.**

Ownership is the ability to investigate, challenge and change the system when abstractions fail—not memorising every line. Rehearse recovery when the preferred agent cannot help: limit retries, preserve diagnostics and name an authorised owner. Measure containment, restoration and data integrity, not merely a successful restart.

#### A new equilibrium has to be demonstrated

The baseline deserves the same scrutiny. Human approval alone does not establish understanding. Compare with the workflow you actually operate, including its failures—not an idealised old equilibrium. Improvement over that baseline and compliance with necessary limits are separate requirements.

Try smaller changes, work-in-progress limits, specifications, AI-assisted review and clearer ownership. Compare review age, rework, stability, demonstrated understanding, recovery and full operating cost. These are candidate interventions, not universal remedies. A faster queue with slower recovery means the cost has changed address.

### More software is not more value

Suppose the redesigned workflow ships faster and downstream work keeps up. Features can still multiply while the customer's problem remains. Faster implementation does not establish that the assumption behind it was right.

Cheap experiments should help us reject weak ideas, not skip that decision. [Kohavi and colleagues](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/) [17] report that only about one-third of well-designed Microsoft experiments improved their intended metric—a finding from their setting, not a universal success rate. Deciding not to ship can be a successful outcome.

[NBER](https://www.nber.org/papers/w35275) [7] reports low-usage shares rising from **78% to 87%** for new iOS apps with fewer than ten ratings, and **19% to 33%** for Chrome extensions with fewer than ten downloads. These observational, first-three-month usage proxies measure neither welfare nor AI's causal effect.

[METR's 349-person survey](https://metr.org/blog/2026-05-11-ai-usage-survey/) [18] reports median self-assessed speed gains of **3×** and **1.4–2× work-value gains**, depending on wording. Perceived gains matter; they are not direct measurements of either outcome.

The distinction is consequential. In [METR's early-2025 randomised trial](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) [34], 16 experienced developers completing 246 tasks on familiar repositories took **19% longer** with AI, yet afterwards believed it had made them **20% faster**. That does not describe every developer—or today's tools. A [February 2026 follow-up](https://metr.org/blog/2026-02-24-uplift-update/) [35] suggested speedups, but selection effects and time-accounting problems made their magnitude unreliable. Measure the proposed workflow; neither enthusiasm nor an older negative result settles its value.

#### The user's capacity is part of the product

Grant the stronger case: every feature is useful and delivery keeps up. This thought experiment still leaves the customer's capacity to absorb change.

A customer uses the reporting tool monthly; its workflow changes weekly. Each improvement makes sense. Each visit still requires relearning the job. Delivery has accelerated. Attention and learning time have not.

Useful capability is not yet realised value. It must be discovered, understood and incorporated into work. **The comprehension problem has crossed the product boundary—from builders to users.**

AI did not create this burden, but can increase the arrival rate of changes people must learn. [Feature-fatigue research](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431) [19] examines a related problem: capabilities attractive before use can undermine usability afterwards. It establishes no universal learning rate; daily experts and occasional users face different adjustment costs.

Not every improvement requires learning: better defaults and repaired defects can remove work. Measure task completion, adoption, time to benefit and support burden. Sequence changes people must learn; invest in accessibility, reliability and fewer steps.

**Competitive advantage is not how much change we deliver. It is how much better customers can work because of it.**

### Rebalancing around human capability

The chain reaches into maintenance, incident response and the customer's working day. Sustainable gains require access to consequential decisions and dependencies, diagnostic practice and time to use both. Otherwise, we build a system we can change faster than we can responsibly operate.

## II. What We Build

### When the product itself makes judgments

Model judgment now operates **inside the product**. An unsafe answer can become an operational event without a pull request.

Return to the account-recovery assistant, now interpreting requests, retrieving guidance and proposing actions in operation. Without permission to change access directly, its guidance can still influence someone who has it. Read-only does not mean consequence-free.

In my [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) [20] framework, this is a [*Thinking System*](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md) [21]: at least one consequential runtime responsibility depends partly on probabilistic model judgment. The name describes implementation, not consciousness or safety.

Consider six assumptions a design may rely on. Each must become a condition we can test and sustain, not a promise we stop examining after release.

### We will tell the model what it must not do

Supply approved guidance and prohibit invented steps, restricted disclosure and bypassed authorisation. Those instructions should bound the assistant's judgment.

Conflicting documents can lead it to the wrong guidance. An attacker can make the conflict deliberate: plant instructions in retrieved material, posing as recovery policy and urging it to skip identity checks. The assistant treats source content as authority. This hypothetical attack follows the indirect prompt-injection mechanism demonstrated by [Greshake and colleagues](https://arxiv.org/abs/2302.12173v2) [22].

A prompt prohibition is not an enforced boundary. Specify when to answer, clarify or escalate. Restrict retrieval, enforce permissions outside model judgment and test hostile inputs. Retrieved text cannot grant itself policy status or expand permissions. [OWASP's guidance](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) [23] likewise emphasises trust boundaries and least privilege; no single layer guarantees immunity.

![Acceptable answers, clarification and escalation occupy a bounded response space; unauthorised disclosure is outside it.](asset:pmday-slide-09)

### The evaluation will tell us whether it works

Test the requirements. The presentation uses **200 synthetic responses**:

| Observed outcome | Responses | Consequence to assess |
| --- | ---: | --- |
| Acceptable | 196 | Meets the tested requirements |
| Incorrect recovery instructions | 3 | May cause rework, lockout or an unsafe action; severity is not established by this label |
| Restricted information disclosed | 1 | Violates the example's explicit prohibition |

Ninety-eight percent acceptable. The tempting conclusion: ready to take responsibility.

**What if not?**

The percentage is correct; the release decision is wrong. Under a rule prohibiting that disclosure, the candidate fails. The other responses cannot cancel the consequence.

The **disclosure class** is **1/200: 0.5% observed, with an approximate 95% Wilson interval of 0.09%–2.78%**. [24] It is not necessarily the only critical failure: an incorrect recovery instruction can also enable harm. All four unacceptable responses give 2%, with an interval of about 0.8%–5.0%; pooling them does not make their consequences equivalent.

Those intervals assume independent, representative sampling, reliable classification and stable conditions. They quantify uncertainty, not permission. A curated *Golden Set* tests known requirements and difficult cases; it need not represent production.

Even 3,000 failure-free trials give only a one-sided 95% upper bound near 0.1% under those assumptions. [24] Rates from ordinary traffic do not establish resistance to an attacker choosing and adapting inputs. Test those threats separately.

Evaluation supplies evidence. Severity, coverage, uncertainty and enforceable limits determine what it justifies delegating.

### Another model will check the first one

A second model may catch errors the generator misses—or accept the same misleading document and unsupported premise. Another invocation supplies a verdict, not independent evidence.

[Knight and Leveson](https://doi.org/10.1109/TSE.1986.6312924) [25] found more coincident failures in independently implemented programs than independence predicted. This historical warning is not a measurement of modern LLM error correlation.

Test the checker against verified failures, valid outputs and shared-error cases. Measure missed errors and unnecessary blocks. Enforce permissions separately. Timeout or uncertainty must trigger a defined wait, denial or fallback—not become authorisation.

### We will monitor it and roll back

The alert may arrive after disclosure or after an employee follows unsafe instructions. Reverting the model erases neither. **Recovery worked; the assumption that it could contain this harm did not.**

Enforce critical limits before action. Observe outputs, denials, fallbacks, reviewer queues and control health. An authorised owner needs a tested way to narrow or stop operation and verify the intervention. [NIST's AI RMF](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) [28] treats monitoring, response and recovery as operational responsibilities.

If intervention cannot beat the consequence, restrict authority, redesign or reject the path. Monitoring cannot prevent harm it only reports afterwards.

### A qualified person will intervene in time

“Human in the loop” promises evidence, qualified judgment and intervention before harm.

**What if not?**

The escalation queue is unattended at night. At peak load, reviewers cannot keep up. A tired reviewer approves a polished summary without seeing the evidence. The path exists. The capacity to operate it does not.

[Parasuraman and Manzey](https://doi.org/10.1177/0018720810376055) [26] connect automation complacency to attention and competing tasks, and document bias in novices and experts. Experience and instructions are insufficient guarantees. Bainbridge's trap returns: difficult exceptions reach someone with diminished practice. [16]

**If safe operation depends on human judgment, human capability is an architectural dependency.**

Account for staffed availability, competence, queue capacity, cognitive load, evidence and the power to refuse. Measure queue wait plus decision time under normal and peak demand against the intervention window. People are not interchangeable APIs; agency and time to rebuild context belong in the design.

An escalation policy cannot staff a queue. Human response capacity is an operating cost and release condition—not a free resource supplied by the organisation chart.

Human-factors research grounds the problem. [Uncertainty Architecture's control-loop anatomy](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/control-loop-anatomy.md) [27] supplies my architectural framing of human response time, capacity and decision quality. We are engineering a **socio-technical stack**, not software plus an oversight footnote.

Make it concrete: the application denies the assistant any account-access change unless a qualified person has approved that specific action. The model cannot grant or bypass that authorisation. An unavailable reviewer must never turn waiting into approval.

That still leaves the danger of someone following unsafe advice. When no qualified reviewer is available, the application suppresses model-generated recovery advice and displays a fixed, preapproved message directing the requester to the verified recovery channel. The model cannot select another procedure, add steps or expose account-specific information. Case-specific recovery waits for the staffed process.

A bounded release can provide verified routing while withholding account-specific recovery. Test the fixed output path, isolation from account data and the receiving process's capacity. Broader advice or action needs separate evidence and approval.

### The conditions will remain valid after release

“It passed before release.” Then the model or provider routing changes, retrieval acquires conflicting material, or demand overwhelms reviewers. No application commit is required for yesterday's evidence to stop describing today's system.

Record the model, data, permissions, workload and human coverage the evidence supports, with reassessment triggers. Turn incidents into regression cases; retest controls and capacity; revisit authority when its justification changes.

**Release authorises operation under particular conditions. It cannot make those conditions permanent.** Sustain both the grounds for delegated authority and the human capability to judge when they no longer hold. The context, time and power to restrict, repair or stop the system are part of what we build.

![Model proposals pass fallible semantic checks and enforced permissions; denials, fallback, observation and authorised intervention form a control loop.](asset:pmday-slide-12)

## III. What If Not?

The person handling the next incident needs more than a green dashboard: what changed, which evidence still applies, and how to stop the damage.

In delivery, we delegate work that changes the system; in the product, judgments within its operation. Either can leave people unable to explain a failure or create irreversible harm. The distinction locates delegated authority, not exclusive consequences.

**A working recovery mechanism is not the same as a recoverable consequence.** Reverting software cannot retrieve disclosed information or erase an action someone took on its advice.

Small releases and rapid learning remain valuable. [Canary releases](https://sre.google/workbook/canarying-releases/) [29] make exposure, evaluation and the decision to expand explicit. The same discipline asks whether we can detect trouble and intervene before the unacceptable consequence.

Agile's [principles](https://agilemanifesto.org/principles.html) [30] connect agility with technical excellence, good design and a sustainable pace. A release cadence cannot explain interacting dependencies, accumulating maintenance costs or whether intervention will work after the original team moves on. **“We will iterate” is not an answer to a consequence we cannot reverse.**

When adoption outpaces verification, containment and recovery, the cost of learning leaves the experiment. The people and organisations exposed to it pay.

Vendors owe adopters usable evidence, clear limits and visibility into consequential changes. Their specialists do not staff your incident response. Different commitments, resources and exposure can make their tolerable experiment unacceptable for your customers. **Their confidence is not your risk acceptance.**

Lem's warning applies across that chain:

> “One cannot simultaneously make discoveries and avoid taking responsibility for their consequences.”

*— Stanisław Lem, quoted and translated by Bogna Konior; source and edition details: [31].*

**The more power we delegate, the more rigour we owe the systems that will bear its consequences.** That obligation includes funding the human capability on which control depends.

I want this to work. Less drudgery, better verification and previously unaffordable software are worth pursuing. For the account-recovery team, make the next decision explicit. These are **illustrative pilot limits**, not measured results or universal safety thresholds.

| Decision | Evidence and limit | Action if the limit fails |
| --- | --- | --- |
| Increase AI-assisted implementation | Improve median change-to-release time against a four-week baseline; no increase in p90 review age or escaped defects per comparable change; maintainer passes recovery rehearsal. | Cap intake and investigate. Generated lines do not justify expansion. |
| Permit account-specific advice/action | No prohibited disclosure, identity-check bypass or unapproved access change in required ordinary/adversarial tests. Classify incorrect advice by consequence. | Reject the broader path. Test success alone does not authorise it. |
| Rely on a reviewer | Approval must precede case-specific advice/action. Exercise a ten-minute timeout at peak load; this is a service deadline, never permission for unsafe output. | Fixed, preapproved routing only; no account-specific information. |
| Recover control | Rehearse stopping, diagnostics and data-integrity checks. Any observed prohibited disclosure or access change stops the broader path immediately. | Contain the incident; rollback cannot undo disclosure. |
| Expand the pilot | After four weeks, review useful recovery completions, support load, full cost, defects and control tests. Reassess after model, retrieval, permission or staffing changes. | Extend observation, narrow or redesign. An uneventful month cannot establish rare-event safety. |

Faster implementation does not authorise broader runtime judgment. The two decisions require different evidence. Rehearse both an agent unable to repair its error and an absent human controller; where intervention would arrive too late, constrain the system before exposure.

Evidence should change the adoption decision—including mine. A warning that refuses to change with evidence is not engineering either. Expand what works. Restrict or redesign what does not.

**You do not owe a vendor your organisation as an experiment. You owe your customers a system you can operate.**

“What if not?” becomes an acceptance criterion, a funded dependency and tested recovery—not an excuse for paralysis. Delivery obligations continue while we learn.

Writing let ideas outlive their authors. AI expands the work we can delegate. The sum of our technology includes the systems, institutions and human capabilities needed to live with the result.

**Build for the future you believe in. Keep the ability to act if that belief is wrong.**

### Further reading

[The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) [9] and [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) [20] develop the two research strands. They are my synthesis and developing architectural doctrine, not independent experimental confirmation of this essay.

## Sources & references

Numbers beside named links connect claims to these sources. Source notes distinguish empirical findings, vendor-reported results, hypothetical examples and the author’s architectural argument.

1. Vitalii Oborskyi. *AI Changes the Delivery System and the Product Itself*. UA Online PMDay 2026 Autumn presentation. See the Slides (PDF) link at the beginning of this article.

    Figures reproduce full slides 3, 9 and 12 from the v35 presentation copy; the complete deck remains linked above. The event name follows the [organiser’s announcement](https://ua.linkedin.com/posts/pmday_we-are-glad-to-introduce-new-speaker-of-activity-7493632835547889664-67od). Original slide credits and notices remain applicable. Scenarios and proposed countermeasures are not empirical results.

2. [Vitalii Oborskyi. UA Online PMDay 2026 Autumn talk recording (Ukrainian).](https://youtu.be/xSgWjuGqC9I)

3. [Jared Rubin. “Printing and Protestants: An Empirical Test of the Role of Printing in the Reformation.” Review of Economics and Statistics 96(2), 270–286 (2014).](https://digitalcommons.chapman.edu/economics_articles/99/)

4. [Stanisław Lem. Fantastyka i futurologia. Quotation selected in Wiktor Jaźniewicz’s compilation, W strachu przed antymaterią. 1381 cytatów (Wydawnictwo Literackie, 2024).](https://instytutsprawobywatelskich.pl/stanislaw-lem-wiktor-jazniewicz-w-strachu-przed-antymateria-1381-cytatow/)

    The Polish passage is reproduced under “TECHNOLOGIE JAKO TAKIE” in a publisher-supplied excerpt published by Instytut Spraw Obywatelskich on 22 July 2025, and attributed there to Fantastyka i futurologia—not Summa Technologiae. The English wording in the prologue is a translation prepared for this article from that Polish excerpt, not a quotation from a published English edition. No original-volume page number is supplied by the excerpt.

5. [Cognition. “Introducing Devin, the first AI software engineer” (12 March 2024).](https://cognition.com/blog/introducing-devin)

    The announcement also describes collaboration and human review; it is not a literal promise to replace all programmers immediately.

6. [Council on Foreign Relations. CEO Speaker Series: Dario Amodei (10 March 2025).](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic)

    The 10 March 2025 forecast implied June–September 2025 for 90% and around March 2026 for essentially all code. These horizons have passed. This essay records the forecast, not a verified industry-wide share or a verdict on fulfilment. The same discussion retains human specification, design, integration and security responsibilities.

7. [Mert Demirer, Leon Musolff and Liyuan Yang. “Writing Code vs. Shipping Code: Productivity Effects Across Generations of AI Coding Tools.” NBER Working Paper 35275 (2026; September revision).](https://www.nber.org/papers/w35275) · [Author-hosted full text](https://www.mertdemirer.com/Papers/Demirer_Writing_vs_shipping_code.pdf)

    Table 6, printed p. 33: weeks 21–30, pre-period-normalised, winsorised event-study estimates. Cumulative multipliers: lines 1 + (234.3 + 957.5 + 1254.9)/100 = 25.467; commits 3.441; releases 1.288 (no separate async estimate). Outcome samples differ. Figure 1 rounds these to 25.5, 3.4 and 1.3. Marketplace figures: §7.2.3, January 2025–April 2026 cohorts. Observational working paper, not peer-reviewed.

8. [Jessica Baolin and Nathen Harvey / DORA. “Balancing AI Tensions: Moving from AI Adoption to Effective SDLC Use” (10 March 2026; analyses the 2025 report).](https://dora.dev/insights/balancing-ai-tensions/)

    Survey associations, not randomised causal estimates.

9. [Vitalii Oborskyi. The Subprime Code Crisis — independent research synthesis.](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis)

    Author-led synthesis, not independent experimental validation.

10. [Anthropic. “Bringing Code Review to Claude Code” (9 March 2026).](https://claude.com/resources/articles/code-review)

11. [Jay Parikh / Microsoft. “Introducing Command Line, and the new rules for builders” (2 June 2026).](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/)

    The opening supplies the old-playbook instruction; sections 8 and 10 supply the review and disposability headings, and section 3 the autopilot phrase. These passages are quoted separately, not combined into a statement that review itself is just an obsolete habit. First-pass review moves to agents, human architectural oversight remains, and the disposability argument is limited to well-bounded features. These are not a blanket claim that all code review is unnecessary.

12. [Addy Osmani, Morgan Westlee Lunt and Qing Wang / Anthropic. “How the Claude Code team does code review” (15 October 2026).](https://claude.dev/blog/solving-code-review-at-anthropic/)

    Internal June–September 2026 comparison, not an external causal or portability study. Reverted share and absolute reverted volume are different measures.

13. [Shyam Agarwal, Hao He and Bogdan Vasilescu. “AI IDEs or Autonomous Agents? Measuring the Impact of Coding Agents on Software Development.” arXiv:2601.13597v2 (27 January 2026).](https://arxiv.org/html/2601.13597v2)

    Table 2; §3.2 includes lines of code as a covariate. §4 notes limitations including isolated pre-treatment differences. Not a per-line or human-comprehension metric.

14. [GitClear. The AI Code Quality & Maintainability Gap (2026).](https://www.gitclear.com/the_ai_code_quality_maintainability_gap)

    Normalised duplicated-block measure versus the 2023 baseline, not a raw block count; observational vendor report. This is distinct from GitClear's short-window rewrite measure of code churn.

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

22. [Kai Greshake, Sahar Abdelnabi, Shailesh Mishra, Christoph Endres, Thorsten Holz and Mario Fritz. “Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection.” arXiv:2302.12173v2 (5 May 2023).](https://arxiv.org/abs/2302.12173v2)

    Demonstrates attacks through retrieved, attacker-influenced content in tested LLM-integrated applications. The account-recovery example in this essay is hypothetical, not a reported incident; the paper does not establish an attack success rate for current models.

23. [OWASP Gen AI Security Project. “LLM01:2025 Prompt Injection.”](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)

    Security guidance on direct/indirect injection, least privilege, trust boundaries and adversarial testing. Mitigation guidance is not a guarantee of immunity or evidence that this example's controls have been deployed.

24. [NIST/SEMATECH. e-Handbook of Statistical Methods, §7.2.4.1, Confidence intervals for a proportion.](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm)

    Author calculations for the synthetic example: 1/200 gives a 95% Wilson interval of 0.0883%–2.7774%; 4/200 gives about 0.8%–5.0%. For zero failures, the exact one-sided 95% binomial upper bound is 1 − 0.05^(1/n); at n = 3,000 it is 0.0998%, close to the “rule of three”. Independence, representative sampling, reliable classification and stable conditions are assumptions—not release guarantees.

25. [John C. Knight and Nancy G. Leveson. “An Experimental Evaluation of the Assumption of Independence in Multiversion Programming.” IEEE Transactions on Software Engineering SE-12(1), 96–109 (1986).](https://doi.org/10.1109/TSE.1986.6312924)

    Historical programming experiment, not a quantitative estimate of modern LLM error correlation.

26. [Raja Parasuraman and Dietrich H. Manzey. “Complacency and Bias in Human Use of Automation: An Attentional Integration.” Human Factors 52(3), 381–410 (2010).](https://doi.org/10.1177/0018720810376055) · [Abstract](https://pubmed.ncbi.nlm.nih.gov/21077562/)

    Research review of attention and automation-related decision errors in novice and expert users.

27. [Uncertainty Architecture. “Control-Loop Capability Anatomy.”](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/control-loop-anatomy.md)

    Selected draft-normative architectural framing, not field evidence that a particular human-control arrangement works.

28. [NIST. Artificial Intelligence Risk Management Framework (AI RMF 1.0), Core (2023).](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)

    Operational risk-management framework, not certification of the example system.

29. [Alec Warner and Štěpán Davidovič, with Alex Hidalgo, Betsy Beyer, Kyle Smith and Matt Duftler. “Canarying Releases.” The Site Reliability Workbook, chapter 16 (2018).](https://sre.google/workbook/canarying-releases/)

    Defines canarying as partial, time-limited deployment plus evaluation to guide rollout. Its discussion of exposure, detection and isolation supports bounded learning, not a guarantee that all consequences can be reversed.

30. [Manifesto for Agile Software Development. “Principles behind the Agile Manifesto” (2001).](https://agilemanifesto.org/principles.html)

    Connects agility with technical excellence, good design and sustainable development. Not a licence to omit consequences analysis or release without appropriate controls.

31. [Stanisław Lem. Summa Technologiae (1964).](https://english.lem.pl/works/essays/summa-technologiae) · [Quotation source: Bogna Konior, “Existential Technologies,” Antikythera.](https://existentialtech.antikythera.org/)

    The responsibility quotation in part III uses Konior’s own English translation. Her note 18 cites the Polish edition (Kraków: Wydawnictwo Literackie, 2020), p. 471. It was checked in her essay, not independently against that book page. The sentence on delegated power is Oborskyi’s argument, not a quotation from Lem.

32. [Marvin Muñoz Barón, Marvin Wyrich and Stefan Wagner. “An Empirical Validation of Cognitive Complexity as a Measure of Source Code Understandability.” ESEM (2020).](https://arxiv.org/html/2007.12520v1) · [DOI](https://doi.org/10.1145/3382494.3410636)

    Meta-analysis of ten studies, 427 code snippets and approximately 24,000 evaluations. Finds associations with comprehension time and subjective ratings; correctness and physiological results are mixed. The metric weights nested control flow. It does not establish a universal nonlinear relationship between a percentage change in the score and human cognitive load.

33. [Luigi Lavazza, Sandro Morasca and Marco Gatto. “An empirical study on software understandability and its dependence on code characteristics.” Empirical Software Engineering 28, 155 (2023).](https://link.springer.com/article/10.1007/s10664-023-10396-7)

    Study of three master's students performing maintenance tasks on 32 methods from two applications. Structural metrics correlate with task time, but prediction accuracy is limited; Cognitive Complexity does not improve it in this setting. Small sample. The discussion of disproportionate effort from interacting conditions and dependencies is an engineering explanation of a risk, not a measured scaling law from this study.

34. [Joel Becker, Nate Rush, Beth Barnes and David Rein / METR. “Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity” (10 July 2025).](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)

    Randomised AI-allowed/disallowed tasks for 16 experienced developers on familiar repositories; 246 tasks, chiefly using Cursor with Claude 3.5/3.7 Sonnet. The 19% longer completion time is an early-2025 result, not an estimate for all developers or current tools. The 20% perceived speedup was elicited after participation.

35. [Joel Becker, Nate Rush, Tom Cunningham, David Rein and Khalid Mahamud / METR. “We are Changing our Developer Productivity Experiment Design” (24 February 2026).](https://metr.org/blog/2026-02-24-uplift-update/)

    Later point estimates suggested shorter task times, but confidence intervals included no improvement. Participant/task selection, changed compensation and concurrent-agent time accounting limit interpretation. METR considers these data only weak evidence of the size of the change.

## How to cite this draft

Oborskyi, V. (2026). *The Sum of Our Technology: AI Changes Both Sides of Software Engineering*. Editorial draft R19, 21 October 2026.

Unpublished author-review edition. Cite the revision; no DOI or final publication URL has been assigned.

```bibtex
@misc{oborskyi2026sumR19,
  author = {Oborskyi, Vitalii},
  year = {2026},
  title = {The Sum of Our Technology:
           AI Changes Both Sides of Software Engineering},
  note = {Editorial draft R19, 21 October 2026; unpublished}
}
```

Text © 2026 Vitalii Oborskyi. Presentation and third-party credits remain applicable. Cover 02: AI-generated editorial illustration selected by the author.
