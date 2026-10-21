# The Sum of Our Technology

*AI Changes Both Sides of Software Engineering*

Vitalii Oborskyi · Editorial draft R21 · 21 October 2026

![A solitary person stands before a narrow opening of light between monumental dark walls.](asset:cover)

An agent opens a pull request. The tests are green. The explanation is fluent. Another arrives before anyone has understood the first.

The dashboard calls this progress. The person handling the next incident has a different question.

**What if not?**

What if faster generation leaves us unable to recover what we built? What if the person entrusted with the final decision cannot meaningfully make it?

My talk at UA Online PMDay 2026 Autumn connects two shifts: AI changes **how we build software**, and model judgment changes **what software does at runtime**. We can delegate more work. We still have to own the consequences.

**Identifying a bottleneck does not prove that its function can be removed.** Delegating review or a product decision must preserve the outcomes responsible operation requires.

[Slides (PDF)](https://github.com/oborskyivitalii/oborskyivitalii/blob/4d5bcdb7c0b30bd7ba5926007fc24e3752242905/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf) [1] · [Recording (Ukrainian)](https://youtu.be/xSgWjuGqC9I) [2]

## When ideas outlive their authors

Writing let ideas survive their authors; printing carried them across borders and centuries. [Research on printing and the Reformation](https://digitalcommons.chapman.edu/economics_articles/99/) [3] connects that circulation with consequences beyond book production. Technology changes collective capability, not just task speed.

The title echoes Lem's *Summa Technologiae* [31]: the subject is not one machine, but what living with our technology requires.

Large language models extend delegation to interpretation, comparison, design, implementation and explanation. *Delegating thinking* describes that practical change, not a claim about consciousness.

Who builds the software and what it does are separate questions. An agent can build a conventional application; a human team can build a product that delegates decisions to a model.

Stanisław Lem captured the reciprocal obligation:

> “The more technology takes care of us, the more carefully we must take care of it.”

*— Stanisław Lem; translated from Polish for this article. Publisher-supplied excerpt and attribution: [4].*

A demonstration shows that a capability can work. Engineering asks what its use requires of the larger system, including when it fails.

## I. How We Build

### We accelerated a step. What did the system gain?

The early story was spectacular. [Cognition introduced Devin](https://cognition.com/blog/introducing-devin) [5] in 2024 as the “first AI software engineer”. In March 2025, [Dario Amodei forecast AI writing 90% of code within three to six months](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic) [6], potentially essentially all within a year. Those dates have passed; the forecast remains unverified as an industry-wide share. [The Claude Code team reports about 90% of its own code is Claude-written](https://claude.dev/blog/solving-code-review-at-anthropic/) [12]. This is one team's self-report from the same vendor, not independent corroboration of the forecast. Generated code does not measure the whole engineering activity.

The first readily accelerated activity in many deployments was **code generation**. Delivery requires a chain:

**Intent → requirements → design → code → review → test → integration → deployment → operation.**

The September revision of [*Writing Code vs. Shipping Code*](https://www.nber.org/papers/w35275) [7], covering more than 500,000 GitHub developers, summarises cumulative estimates as **25.5× changed lines, 3.4× commits and 1.3× releases**. These observational, outcome-specific estimates are not a conversion funnel. Changed lines include additions and deletions; asynchronous-agent releases were not separately estimated.

The study's estimated release gain of roughly 30% matters. Changed lines measure neither retained code nor human reading time. **Would you buy faster delivery if the additional review, maintenance and recovery work cost more than the gain?** The multipliers cannot answer that for your team.

The bill can arrive later. Dependencies, duplication and deferred cleanup can make recovery harder—a plausible risk, not a cost measured here. [DORA](https://dora.dev/insights/balancing-ai-tensions/) [8] associates adoption with higher throughput—and greater instability. Assess gains over the system's life.

The NBER authors explain the attenuation through a weak-link model: upstream output and downstream human effort are strong complements. This supports examining the whole chain, not identifying review as every team's constraint. Agents reaching later stages may narrow the gap. Additional activity can also be reworked or filtered out as experiments, rather than accumulate in a queue; a discarded attempt need not be wasted learning. [7]

Suppose a team generates, reviews and integrates eight comparable changes a week. Raise generation capacity to one hundred; keep the others fixed.

Admit every change: delivery stays at eight; unfinished work grows by ninety-two a week. **We become dramatically better at producing unfinished work.** Control intake: the queue need not grow, but delivery stays capped. Faster generation can save effort without proportional throughput gains.

![Synthetic capacities: generation rises from eight to one hundred changes per week while review and integration remain at eight; the queue grows by ninety-two if every change is admitted.](asset:pmday-slide-03)

This is a Theory of Constraints illustration, not a reproduction of the studies' outcomes. If review **and integration** had spare capacity, delivery could rise until the next constraint. A code generator does not itself rebalance the chain.

[The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) [9] is my synthesis of costs shifted into review, QA, architecture, maintenance and production. The danger is booking local gains before accounting for displaced work and risk.

Corporate evidence makes review worth examining: [Chen and Stratton](https://fion.ac/jellyfish.pdf) [36], using data from 718 firms, estimate a 49% agent-associated increase in elapsed time from PR submission to merge. This is observational evidence, not active reviewer hours or proof of every team's constraint.

The narrative follows the next bottleneck. [Anthropic's Code Review announcement](https://claude.com/resources/articles/code-review) [10] addresses review pressure while explicitly leaving PR approval to people. [Microsoft's Jay Parikh](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) [11] makes it an instruction:

> **“Don’t let code review become a bottleneck”**

His wider call is **“Throw out the old playbook.”** First-pass review moves to agents; people retain architectural oversight. He presents provisional rules and warns that shorter shipping cycles leave less time to uncover bugs. The redesign must preserve defect detection and understanding while people inspect less implementation detail.

**What if not?**

Suppose defect detection improves, but incident investigation becomes harder. The approval button survives; the knowledge that gave approval meaning does not. **The queue has cleared. The ownership gap has not.**

Changing the method may preserve those functions—or improve them. [Anthropic reports](https://claude.dev/blog/solving-code-review-at-anthropic/) [12] that merged Claude Code PRs more than doubled while the reverted share fell over 40% between June and September 2026. Approvals bind to a specific commit; an agent cannot fill a required human approval slot. The person landing a small or medium change usually fixes it if it breaks.

These internal results establish neither causality nor portability; a lower reverted share need not mean fewer reversions. Explainers and open channels support knowledge sharing. The team candidly identifies missing formal processes for shared understanding and automatic tightening of approvals—a useful disclosure of limits, not a measurement of every latent defect.

A new equilibrium is possible. Which checks, ownership, knowledge-sharing and recovery practices made it possible—and can we sustain them?

### The scarce resource is understanding

Understanding is not one quantity. Maintainers need context to change code and dependencies; teams need shared context to decide; operators need situational awareness to intervene; users need familiarity to benefit from change. These capabilities are connected, not interchangeable.

The burden may be more than volume. In a longitudinal matched-control study, [Agarwal, He and Vasilescu](https://arxiv.org/html/2601.13597v2) [13] estimate increases in SonarQube's Cognitive Complexity of **34.85% for agent-first repositories and 42.87% for those with prior AI-IDE exposure**. Their model controls for lines of code; this is neither per-line complexity nor measured human comprehension. [GitClear](https://www.gitclear.com/the_ai_code_quality_maintainability_gap) [14] reports an **81% increase in its normalised duplicated-block measure from the 2023 baseline**—an observational vendor signal, not proof of AI causation.

Complexity bears on understanding. [An empirical validation of Cognitive Complexity](https://arxiv.org/html/2007.12520v1) [32] found associations with comprehension time and perceived difficulty. Interacting conditions and dependencies can make a small change disproportionately hard to reason about; this explains a risk, not a measured scaling law.

There is no universal curve from a score to human effort. A [smaller study](https://link.springer.com/article/10.1007/s10664-023-10396-7) [33]—three master's students, 32 methods, two applications—found limited prediction accuracy from code measures. This bounded counterpoint reinforces the distinction: complexity warns of difficulty; it does not directly measure ownership effort.

Tools, abstractions and learning can raise comprehension capacity. The operating limit is reached when the team can no longer explain critical behaviour or diagnose and contain failures in time.

Review can find defects and spread knowledge of what changed and why. [Bacchelli and Bird](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/) [15] identify knowledge transfer and team awareness among its outcomes. Automating one does not reproduce the others; ceremonial human approval delivers neither.

Bainbridge's [*Ironies of Automation*](https://doi.org/10.1016/0005-1098(83)90046-8) [16] describes the older trap: automation leaves people the difficult exceptions while reducing the practice needed to handle them.

**Responsibility does not disappear when understanding disappears. We are left responsible for something we are less capable of controlling.**

#### Generated explanations and rewrites do not establish ownership

Ask an LLM to explain the code. Its story can inherit the implementation's mistake. Specifications, code and tests can share a wrong assumption. Agreement is not independent verification; accurate description does not establish that behaviour meets the business need.

Follow a team building an account-recovery assistant through delivery here and operation in Part II. Can a maintainer trace a change from identity policy through permissions and fallback, then diagnose a failed recovery? Ground explanations in exact revisions, observed traces and independent requirements. Understanding is a demonstrated capability, not a quantity of Markdown.

Parikh's **“Code is disposable”** encourages rewriting; for [well-bounded features](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) [11], he suggests the specification might become the durable artefact.

Now customers cannot recover their accounts. Two agent-proposed fixes fail. A rewrite looks tempting, but data and integrations cannot be discarded. Who stops retries, contains damage and verifies recovery?

**Code may be disposable. Your customers' data, obligations and consequences are not.**

Ownership means being able to investigate, challenge and change the system when abstractions fail—not memorising every line. Rehearse recovery without the preferred agent: limit retries, preserve diagnostics and name an authorised owner. Measure containment, restoration and data integrity.

#### A new equilibrium has to be demonstrated

Human approval alone does not establish understanding. Compare with the workflow you actually operate, including its failures. Improvement over that baseline and compliance with necessary limits are separate requirements.

Try smaller changes, work-in-progress limits, specifications, AI-assisted review and clearer ownership. Compare review age, rework, stability, understanding, recovery and full operating cost. These are candidate interventions. A faster queue with slower recovery means the cost has changed address.

### More software is not more value

Suppose delivery now keeps up. Features can still multiply while the customer's problem remains. Faster implementation does not establish that its underlying assumption was right.

Cheap experiments should help us reject weak ideas, not skip that decision. [Kohavi and colleagues](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/) [17] report that only about one-third of well-designed Microsoft experiments improved their intended metric—a finding from their setting, not a universal success rate. Deciding not to ship can be a successful outcome.

[NBER](https://www.nber.org/papers/w35275) [7] finds more new apps without commensurate growth in their use. The first-three-month cohort proxies differ by platform: iOS ratings stay roughly flat, Android downloads rise modestly and Chrome downloads fall. The authors offer two compatible explanations: constraints on quality, polish and market fit, or on consumer discovery and attention. The data do not distinguish them, measure welfare directly or establish AI causation.

[METR's 349-person survey](https://metr.org/blog/2026-05-11-ai-usage-survey/) [18] reports median self-assessed speed gains of **3×** and **1.4–2× work-value gains**, depending on wording. Perceived gains matter; they are not direct measurements of either outcome.

In [METR's early-2025 randomised trial](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) [34], 16 experienced developers completing 246 tasks on familiar repositories took **19% longer** with AI, yet afterwards believed it had made them **20% faster**. That is not a verdict on today's tools. The [February 2026 update](https://metr.org/blog/2026-02-24-uplift-update/) [35] says selection likely **underestimates speedup**: developers increasingly declined participation or withheld tasks they expected AI to accelerate. METR believes acceleration likely increased, but selection and time-accounting problems leave its magnitude poorly established. Measure the proposed workflow; neither enthusiasm nor an older negative result settles its value.

#### The user's capacity is part of the product

Grant that every feature is useful. Can the customer absorb the change?

A customer uses the reporting tool monthly; its workflow changes weekly. Each improvement makes sense. Each visit still requires relearning the job. Delivery has accelerated. Attention and learning time have not.

Capability becomes value when people discover, understand and use it. **The comprehension problem has crossed the product boundary—from builders to users.**

AI can accelerate changes people must learn. [Feature-fatigue research](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431) [19] examines a related problem: capabilities attractive before use can undermine usability afterwards. It establishes no universal learning rate; daily experts and occasional users face different costs.

Better defaults and repaired defects can remove work. Measure task completion, adoption, time to benefit and support burden. Sequence changes people must learn; invest in accessibility, reliability and fewer steps.

**Competitive advantage is not how much change we deliver. It is how much better customers can work because of it.**

Sustainable gains require access to consequential decisions and dependencies, diagnostic practice and time to use both. Otherwise, we build a system we can change faster than we can responsibly operate.

## II. What We Build

### When the product itself makes judgments

Model judgment now operates **inside the product**. An unsafe answer can become an operational event without a pull request.

Return to the account-recovery assistant, now interpreting requests, retrieving guidance and proposing actions in operation. Without permission to change access directly, its guidance can still influence someone who has it. Read-only does not mean consequence-free.

In my [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) [20] framework, this is a [*Thinking System*](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md) [21]: at least one consequential runtime responsibility depends partly on probabilistic model judgment. The name describes implementation, not consciousness or safety.

Consider six assumptions a design may rely on. Each needs testing and continued justification after release.

### We will tell the model what it must not do

Supply approved guidance; prohibit invented steps, restricted disclosure and bypassed authorisation. The instructions should bound the assistant's judgment.

An attacker plants instructions in retrieved material, posing as recovery policy and urging the assistant to skip identity checks. It treats source content as authority. This hypothetical attack follows the indirect prompt-injection mechanism demonstrated by [Greshake and colleagues](https://arxiv.org/abs/2302.12173v2) [22].

A prompt prohibition is not an enforced boundary. Specify when to answer, clarify or escalate. Restrict retrieval, enforce permissions outside model judgment and test hostile inputs. Retrieved text cannot grant itself policy status or expand permissions. [OWASP's guidance](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) [23] likewise emphasises trust boundaries and least privilege; no single layer guarantees immunity.

The slide contrasts a specified transition—press A, open B—with a space of admissible responses: answer, clarify or escalate. Conventional software also has semantic requirements; model judgment makes testing the boundary across unforeseen inputs especially important.

![A specified transition is contrasted with a bounded response space: answer, clarify or escalate; unauthorised disclosure lies outside it.](asset:pmday-slide-09)

### The evaluation will tell us whether it works

Test the requirements. The illustrative evaluation uses **200 synthetic responses**:

| Observed outcome | Responses | Consequence to assess |
| --- | ---: | --- |
| Acceptable | 196 | Meets the tested requirements under the evaluated conditions |
| Incorrect recovery instructions | 3 | May cause rework, lockout or an unsafe action; severity is not established by this label |
| Restricted information disclosed | 1 | Violates the example's explicit prohibition |

Ninety-eight percent acceptable. The tempting conclusion: ready to take responsibility.

**What if not?**

The percentage is correct; the release decision is wrong. Under a rule prohibiting that disclosure, the candidate fails. The other responses cannot cancel the consequence.

Incorrect instructions can also cause critical harm. Pooling all four unacceptable responses as 2% does not make their consequences equivalent. Statistical uncertainty does not turn a prohibited event into an acceptable one. [24]

Even 3,000 failure-free trials give only a one-sided 95% upper bound near 0.1%, assuming independent, representative sampling, reliable classification and stable conditions. [24] A curated *Golden Set* tests requirements and difficult cases; it need not represent production. Ordinary-traffic evidence does not establish resistance to an attacker choosing and adapting inputs. Test those threats separately.

Evaluation supplies evidence. Severity, coverage, uncertainty and enforceable limits determine what it justifies delegating.

### Another model will check the first one

A second model may catch an error—or accept the same misleading document. Another invocation supplies a verdict, not independent evidence.

[Knight and Leveson](https://doi.org/10.1109/TSE.1986.6312924) [25] found more coincident failures in independently implemented programs than independence predicted. This historical warning is not a measurement of modern LLM error correlation.

Test verified failures, valid outputs and shared-error cases. Measure missed errors and unnecessary blocks; enforce permissions separately. Timeout or uncertainty must trigger a defined wait, denial or fallback—not become authorisation.

### We will monitor it and roll back

The alert may arrive after disclosure or after an employee follows unsafe instructions. Reverting the model erases neither. **Recovery worked; the assumption that it could contain this harm did not.**

Enforce critical limits before action. Observe outputs, denials, fallbacks, reviewer queues and control health. An authorised owner must be able to narrow or stop operation and verify the result. [NIST's AI RMF](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) [28] treats these as operational responsibilities.

If intervention cannot beat the consequence, restrict authority, redesign or reject the path. Monitoring cannot prevent harm it only reports afterwards.

### A qualified person will intervene in time

“Human in the loop” promises evidence, qualified judgment and intervention before harm.

**What if not?**

The queue is unattended at night. At peak load, reviewers cannot keep up. A tired reviewer approves a polished summary without seeing the evidence. The path exists. The capacity does not.

[Parasuraman and Manzey](https://doi.org/10.1177/0018720810376055) [26] connect automation complacency to attention and competing tasks, and document bias in novices and experts. Experience and instructions are insufficient guarantees. Bainbridge's trap returns: difficult exceptions reach someone with diminished practice. [16]

**If safe operation depends on human judgment, human capability is an architectural dependency.**

Account for staffing, competence, queue capacity, cognitive load, evidence and the power to refuse. Measure queue wait plus decision time against the intervention window, including peak demand. People need agency and time to rebuild context.

An escalation policy cannot staff a queue. Human response capacity is an operating cost and release condition—not a free resource supplied by the organisation chart.

[Uncertainty Architecture's control-loop anatomy](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/control-loop-anatomy.md) [27] supplies my architectural framing of these human-factors concerns. We are engineering a **socio-technical stack**, not software plus an oversight footnote.

The application denies any account-access change until a qualified person approves that specific action. The model cannot bypass authorisation. An unavailable reviewer must never turn waiting into approval.

Unsafe advice remains a danger. Without a qualified reviewer, the application suppresses model-generated recovery advice and displays a fixed, preapproved message directing the requester to the verified recovery channel. The model cannot change the procedure, add steps or expose account-specific information. Case-specific recovery waits for the staffed process.

A bounded release can provide routing while withholding account-specific recovery. Test the fixed output, isolation from account data and the receiving process's capacity. Broader advice or action needs separate evidence and approval.

### The conditions will remain valid after release

“It passed before release.” Then the model or provider routing changes, retrieval acquires conflicting material, or demand overwhelms reviewers. No application commit is required for yesterday's evidence to stop describing today's system.

Record supported model, data, permissions, workload and staffing conditions, with reassessment triggers. Turn incidents into regression cases; retest controls and capacity; revisit authority when its justification changes.

**Release authorises operation under particular conditions. It cannot make those conditions permanent.** Sustain the evidence for delegation and people's ability to judge when it no longer holds. The context, time and power to intervene are part of what we build.

![Model proposals pass fallible semantic checks and enforced permissions; denials, fallback, observation and authorised intervention form a control loop.](asset:pmday-slide-12)

## III. What If Not?

The person handling the next incident needs more than a green dashboard: what changed, which evidence still applies, and how to stop the damage. Either kind of delegation can create irreversible harm.

**A working recovery mechanism is not the same as a recoverable consequence.**

[Canary releases](https://sre.google/workbook/canarying-releases/) [29] make exposure, evaluation and expansion explicit. Agile's [principles](https://agilemanifesto.org/principles.html) [30] connect delivery with technical excellence and a sustainable pace. Both support learning; neither makes every consequence reversible. **“We will iterate” is not an answer to a consequence we cannot reverse.**

Vendors owe adopters usable evidence, clear limits and visibility into consequential changes. Different resources, commitments and exposure can make their tolerable experiment unacceptable for your customers. **Their confidence is not your risk acceptance.**

Lem's warning applies across that chain:

> “One cannot simultaneously make discoveries and avoid taking responsibility for their consequences.”

*— Stanisław Lem, quoted and translated by Bogna Konior; source and edition details: [31].*

**The more power we delegate, the more rigour we owe the systems that will bear its consequences.**

I want this to work. For the recovery team, these **illustrative pilot limits** turn that obligation into decisions. Set the criteria before collecting results; the examples are neither measured findings nor universal thresholds.

| Decision | Evidence and limit | Action if the limit fails |
| --- | --- | --- |
| Increase AI-assisted implementation | Predeclare a meaningful improvement in median change-to-release time, tolerable deterioration in p90 review age and escaped defects per comparable change, and sufficient comparable observations. Use four weeks as an initial baseline, not a sample-size guarantee. Maintainer passes recovery rehearsal. | Exceeded limits: cap intake and investigate. Insufficient or uncertain evidence: continue the bounded pilot without expansion. Generated lines do not justify expansion. |
| Permit account-specific advice/action | Verify enforced access boundaries and approval before advice/action. Define populations, failure classes and justified risk limits before testing. Report trial/failure counts; require one-sided 95% upper bounds to meet those limits where sampling assumptions hold. Check adversarial coverage separately. | Any prohibited disclosure, bypass or unapproved change rejects the candidate. Missing or insufficient evidence keeps routing only; 0/3,000 is not a release rule. |
| Rely on a reviewer | Approval must precede case-specific advice/action. Exercise a ten-minute timeout at peak load; this is a service deadline, never permission for unsafe output. | Fixed, preapproved routing only; no account-specific information. |
| Recover control | Rehearse stopping, diagnostics and data-integrity checks. Any observed prohibited disclosure or access change stops the broader path immediately. | Contain the incident; rollback cannot undo disclosure. |
| Expand the pilot | After four weeks, review useful recovery completions, support load, full cost, defects and control tests. Reassess after model, retrieval, permission or staffing changes. | Extend observation, narrow or redesign. An uneventful month cannot establish rare-event safety. |

Faster implementation does not authorise broader runtime judgment. Fund and rehearse the controls on which each permission depends.

Evidence should change the adoption decision—including mine. Expand what works. Restrict or redesign what does not.

**You do not owe a vendor your organisation as an experiment. You owe your customers a system you can operate.**

“What if not?” becomes an acceptance criterion, a funded dependency and tested recovery. The sum of our technology includes the systems, institutions and human capabilities needed to live with what we delegate.

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

    The 10 March 2025 forecast implied June–September 2025 for 90% and around March 2026 for essentially all code. Those dates have passed. This essay records the forecast, not a verified industry-wide share or a verdict on fulfilment. The team report in [12] comes from the same vendor and is not independent corroboration. The same discussion retains human specification, design, integration and security responsibilities.

7. [Mert Demirer, Leon Musolff and Liyuan Yang. “Writing Code vs. Shipping Code: Productivity Effects Across Generations of AI Coding Tools.” NBER Working Paper 35275 (2026; September revision).](https://www.nber.org/papers/w35275) · [Author-hosted full text](https://www.mertdemirer.com/Papers/Demirer_Writing_vs_shipping_code.pdf)

    Table 6, printed p. 33: weeks 21–30, pre-period-normalised, winsorised event-study estimates. Cumulative multipliers: lines 1 + (234.3 + 957.5 + 1254.9)/100 = 25.467; commits 3.441; releases 1.288 (no separate async estimate). Outcome samples differ. Figure 1 rounds these to 25.5, 3.4 and 1.3. Section 6.3 calibrates the weak-link model to the autocomplete pattern, giving substitution elasticity about 0.23; this is a model-dependent estimate, not a measured universal review constraint. Agents can intervene at later layers, so the gap may narrow.

    Section 6.2 describes experimentation filtered downstream; discarded work need not be valueless. Marketplace §§7.2.3–4, pp. 45–47 use first-three-month cohort proxies, not all installed software or welfare: iOS ratings are roughly stable, Android downloads rise modestly and Chrome downloads fall. The authors cannot distinguish supply-side quality/polish/market-fit constraints from consumer discovery/attention constraints. Neither is established as the sole mechanism.

    Observational working paper, not peer-reviewed. Section 4.1 combines public GitHub activity with confidential Microsoft GitHub Copilot usage/subscription data to date autocomplete and GitHub Sync adoption and validate asynchronous-agent signals. Demirer and Musolff disclose former Microsoft postdoctoral positions and current paid research consulting for Microsoft on the NBER page.

8. [Jessica Baolin and Nathen Harvey / DORA. “Balancing AI Tensions: Moving from AI Adoption to Effective SDLC Use” (10 March 2026; analyses the 2025 report).](https://dora.dev/insights/balancing-ai-tensions/)

    Survey associations, not randomised causal estimates.

9. [Vitalii Oborskyi. The Subprime Code Crisis — independent research synthesis.](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis)

    Author-led synthesis, not independent experimental validation.

10. [Anthropic. “Bringing Code Review to Claude Code” (9 March 2026).](https://claude.com/resources/articles/code-review)

    First-party product announcement and internal usage claims, not independent effectiveness evidence. It explicitly leaves PR approval to humans. Its March product description is distinct from the October team's risk-tiered workflow in [12].

11. [Jay Parikh / Microsoft. “Introducing Command Line, and the new rules for builders” (2 June 2026).](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/)

    First-party engineering guidance, explicitly provisional. The opening supplies the old-playbook instruction; sections 8–10 cover first-pass agent review with human architectural oversight, shorter bug-detection buffers and rewriting bounded features whose specifications may endure. The opening also discusses post-deployment learning, which is related to but not identical with consequential runtime judgment.

12. [Addy Osmani, Morgan Westlee Lunt and Qing Wang / Anthropic. “How the Claude Code team does code review” (15 October 2026).](https://claude.dev/blog/solving-code-review-at-anthropic/)

    First-party team account: about 90% Claude-authored code and the June–September comparison are self-reported, not an industry share or an external causal/portability study. Reverted share and absolute volume differ. Described practices include layered checks, risk-tiered approvals, staged release, approval bound to a commit and no substitution of an agent for a required human reviewer. Fixing one's own small/medium change is usually a team norm. The authors explicitly acknowledge gaps in formal shared-understanding processes and automatic tightening of approvals.

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

    Later point estimates suggested shorter task times, but confidence intervals included no improvement. METR says refusal to work without AI and selective task submission likely bias the speedup estimate downwards, and believes acceleration likely increased by early 2026. Changed compensation and concurrent-agent time accounting add uncertainty. These data remain weak evidence of the increase's magnitude; the direction of likely selection bias is not a proven current effect size.

36. [Fiona Chen and James Stratton. “Artificial Intelligence in the Firm: Bottlenecks in Software Production” (August 2026).](https://fion.ac/jellyfish.pdf)

    Working paper using proprietary Jellyfish data from 718 consenting client firms, January 2021–March 2026. Staggered difference-in-differences design, not randomised assignment. The agent estimate in §4.1 is 3.45 additional days (standard error 1.60) from PR submission to merge against a 7.03-day baseline, approximately 49%. This elapsed interval includes waiting and other work; it does not measure active reviewer effort. Jellyfish supplied aggregated/anonymised metadata, not code content, and reviewed confidentiality rather than scientific content. Sample and adoption-selection limits constrain generalisation.

## How to cite this draft

Oborskyi, V. (2026). *The Sum of Our Technology: AI Changes Both Sides of Software Engineering*. Editorial draft R21, 21 October 2026.

Unpublished author-review edition. Cite the revision; no DOI or final publication URL has been assigned.

```bibtex
@misc{oborskyi2026sumR21,
  author = {Oborskyi, Vitalii},
  year = {2026},
  title = {The Sum of Our Technology:
           AI Changes Both Sides of Software Engineering},
  note = {Editorial draft R21, 21 October 2026; unpublished}
}
```

Text © 2026 Vitalii Oborskyi. Presentation and third-party credits remain applicable. Cover 02: AI-generated editorial illustration selected by the author.
