# The Sum of Our Technology

*AI Changes Both Sides of Software Engineering*

![A solitary person stands before a narrow opening of light between monumental dark walls.](asset:cover)

An agent opens a pull request. The tests are green. The explanation is fluent. Another arrives before anyone has understood the first.

The dashboard calls this progress. The person handling the next incident has a different question.

**What if not?**

What if the extra output leaves us less able to understand what we have built? And what happens when we entrust the running software with decisions of its own?

My PMDay talk connects two shifts: AI changes how we build software, and model judgment changes what software does at runtime. Both expand what we can delegate. Following its effects—from the developer to the customer to the person called when something goes wrong—reveals the work that still has to be done.

[Slides (PDF)](https://github.com/oborskyivitalii/oborskyivitalii/blob/4d5bcdb7c0b30bd7ba5926007fc24e3752242905/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf) [1] · [Recording (Ukrainian)](https://youtu.be/xSgWjuGqC9I) [2]

## When ideas outlive their authors

Writing let ideas survive their authors. Printing changed how far and cheaply they travelled. A thought could escape a conversation, cross a border and enter a discovery centuries later.

Knowledge depended less on someone's presence and memory. Its wider circulation also changed the world around it: [research on printing and the Reformation](https://digitalcommons.chapman.edu/economics_articles/99/) [3] traces consequences far beyond book production. A technology that changes what people can do together eventually asks something of the institutions and habits around it.

Large language models extend delegation to interpretation, comparison, design, implementation and explanation. We can ask a system to do work that previously required someone to think through each step. That practical change is consequential enough without making claims about consciousness.

The two software shifts are independent. A coding agent can build an application whose behaviour follows conventional rules. A human team can build a product that relies on model judgment while it runs. In each case, the new capability leaves us with a question about what must remain dependable around it.

Stanisław Lem captured that reciprocal obligation:

> “The more technology takes care of us, the more carefully we must take care of it.”

*— Stanisław Lem; translated from Polish for this article. Publisher-supplied excerpt and attribution: [4].*

Software delivery is already testing how carefully we intend to do that.

## I. How We Build

### We accelerated a step. Not the system.

The early story was spectacular. [Cognition introduced Devin](https://cognition.com/blog/introducing-devin) [5] in 2024 as the “first AI software engineer”. In March 2025, [Dario Amodei forecast AI writing 90% of code within three to six months](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic) [6], potentially essentially all within a year. Those horizons have passed; the forecast is historical context, not a verified industry-wide code share. Both accounts retained human responsibilities.

The distinction matters because producing code is one activity in a longer chain:

**Intent → requirements → design → code → review → test → integration → deployment → operation.**

The September revision of [*Writing Code vs. Shipping Code*](https://www.nber.org/papers/w35275) [7] summarises cumulative estimates as **25.5× changed lines, 3.4× commits and 1.3× releases**. These are observational estimates for different outcomes, not stages in a conversion funnel; changed lines include additions and deletions. A roughly 30% release gain matters. The larger change in code activity still needs an account of the work and risk behind it. [DORA](https://dora.dev/insights/balancing-ai-tensions/) [8] likewise associates adoption with higher throughput and greater instability.

A simple hypothetical team makes one possible constraint visible. It generates, reviews and integrates eight comparable changes a week. Generation capacity rises to one hundred; review and integration remain at eight.

Admit everything, and unfinished work grows by ninety-two changes a week. Limit intake, and the queue need not grow, but delivery remains capped at eight. Faster generation may still save effort or waiting time. It has not rebalanced the chain.

![Synthetic capacities: generation rises from eight to one hundred changes per week while review and integration remain at eight; the queue grows by ninety-two if every change is admitted.](asset:pmday-slide-03)

This example does not explain the studies' measured outcomes. It shows why a local gain can become someone else's workload—the problem I examine in [The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) [9].

Naturally, automation follows the work downstream. [Anthropic's Code Review announcement](https://claude.com/resources/articles/code-review) [10] addresses review pressure. [Microsoft's Jay Parikh](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) [11] makes the direction explicit:

> “Don’t let code review become a bottleneck”

His wider instruction is “Throw out the old playbook.” First-pass review moves to agents; people retain architectural oversight. The proposal promises to free attention for difficult decisions. It also asks those people to oversee implementation they increasingly do not inspect.

**What if not?**

Imagine the queue clears and defect detection improves, but the next incident takes longer to diagnose. The approval button survives; the knowledge that gave approval meaning does not.

Identifying a bottleneck does not prove that its function can be removed. Review also helps people learn what changed and why. If we replace it, those outcomes still need a working method.

A better arrangement is possible. [Anthropic reports](https://claude.dev/blog/solving-code-review-at-anthropic/) [12] that merged Claude Code PRs more than doubled while the reverted share fell over 40% between June and September 2026. Its account describes layered checks, risk-based approvals and staged release. These encouraging internal results establish neither causality nor portability; reversions also tell us little about shared understanding.

What deserves attention is the surrounding work. The team redesigned more than the review step. Whether that redesign preserves the knowledge needed to maintain the system is the next question.

### The scarce resource is understanding

Picture the next incident: customers cannot complete transactions. The agent proposes two fixes; neither restores service. A rewrite looks tempting, but existing data and integrations cannot be discarded. Someone has to decide what to stop, what to preserve and how to tell whether recovery worked.

That is where understanding becomes an operational capability.

Review has traditionally helped build it. [Bacchelli and Bird](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/) [15] identify knowledge transfer and team awareness among review's outcomes. Automating defect detection does not automatically reproduce those benefits. Ceremonial human approval delivers them poorly too.

There are reasons to examine the burden closely. [Agarwal, He and Vasilescu](https://arxiv.org/html/2601.13597v2) [13] estimate static-complexity increases of 34.85% for agent-first repositories and 42.87% for those with prior AI-IDE exposure. [GitClear](https://www.gitclear.com/the_ai_code_quality_maintainability_gap) [14] reports 81% more duplicated blocks than its 2023 baseline. These are observational signals about code, not direct measurements of comprehension or proof of inevitable decline.

The presentation's widening gap is therefore a scenario to investigate. Tools and learning can raise our capacity to understand. We need to see whether they do so in the workflow we actually operate.

![Illustrative generation and comprehension curves diverge, showing a possible overload scenario rather than a measured human limit.](asset:pmday-slide-05)

An LLM can explain the code, maintain documentation and help investigate a failure. Specifications may become more durable than implementation. We expect those explanations to preserve the understanding needed to operate the system.

**What if not?**

We now have an implementation and a story about it, and both can inherit the same wrong assumption. Even a faithful explanation of the code cannot establish that it meets the customer's need.

The useful test is concrete: can a responsible maintainer, with the team's actual tools, trace a critical decision and diagnose an agreed failure? Tie explanations to exact revisions, observed behaviour and independent requirements. Discover missing context before an incident forces the question.

Bainbridge's [*Ironies of Automation*](https://doi.org/10.1016/0005-1098(83)90046-8) [16] describes the older trap: automation leaves people the difficult exceptions while reducing the practice needed to handle them. We can remain responsible for a system while becoming less capable of controlling it.

Parikh's heading [“Code is disposable”](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) [11] has a reasonable scope: for a well-bounded feature, replacement may be cheaper than repair. The incident above tests the boundary of that promise.

**Code may be disposable. Your customers' data, obligations and consequences are not.**

Ownership means retaining the ability to investigate and change the system when an abstraction fails. Rehearse recovery when the preferred agent cannot repair its error. Give someone authority to stop retries, preserve diagnostics and contain damage. Check restored service and intact data.

The old workflow deserves the same scrutiny. Compare against the system you actually operate, including its failures. Smaller changes, work-in-progress limits, AI-assisted review and clearer ownership are candidates to test. Follow review age, rework, recovery, maintained knowledge and total effort. A faster queue with slower recovery means the cost has changed address.

![Measurement and candidate countermeasures for finding a sustainable AI-assisted SDLC equilibrium.](asset:pmday-slide-07)

### More software is not more value

Suppose we succeed. The redesigned workflow ships faster, downstream work keeps up, and the team can maintain what it builds.

We have shortened the journey from an idea to working software. The customer's problem may still be waiting at the other end.

Cheap experiments can help us reject weak ideas. [Kohavi and colleagues](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/) [17] report that only about one-third of well-designed Microsoft experiments improved their intended metric. That finding belongs to their setting, but the practical lesson travels: deciding not to ship can be a successful outcome.

More output offers little assurance by itself. [NBER](https://www.nber.org/papers/w35275) [7] reports rising low-usage shares among new iOS apps and Chrome extensions; these proxies establish neither AI causation nor customer welfare. [METR's 349-person survey](https://metr.org/blog/2026-05-11-ai-usage-survey/) [18] reports median self-assessed speed gains of 3× and work-value gains of 1.4–2×, depending on wording. These are perceived gains, with speed and work value measured separately.

Now grant the stronger case: every feature is useful. A balanced delivery system produces twenty to thirty times more customer-facing changes. This is a thought experiment, not NBER's release estimate. We expect customers to get more value, sooner.

**What if not?**

A customer uses the reporting tool monthly; its workflow changes weekly. Each improvement makes sense. Each visit still requires relearning the job.

Useful capability must be discovered, understood and incorporated into work. The comprehension problem has crossed the product boundary, from builders to users.

[Feature-fatigue research](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431) [19] examines a related problem: capabilities attractive before use can undermine usability afterwards. It establishes no universal learning rate. A daily expert and an occasional user may experience the same release very differently.

Some improvements remove work without demanding new learning: better defaults, faster responses, repaired defects. We can spend the extra capacity there too. Measure successful task completion, adoption, time to benefit and support burden. The competitive gain lies in how much better customers can work.

So far, the software has been something people must build, understand and use. The second shift takes delegation further. A product can now interpret a request and decide what to recommend or do. The person encountering its mistake may have no opportunity to inspect or approve that particular decision beforehand.

## II. What We Build

Consider an account-recovery assistant. It interprets requests, retrieves guidance and proposes actions. Its flexibility comes partly from model judgment exercised while the product runs. An unsafe answer can therefore become an operational event without a pull request.

Even if the assistant cannot change access directly, its guidance may influence someone who can. Read-only does not mean consequence-free. In my [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) [20] framework, a [*Thinking System*](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md) [21] has at least one consequential runtime responsibility that depends partly on probabilistic model judgment. The term identifies that dependency; it makes no claim about consciousness or safety.

Start with the obvious protection: give the assistant approved guidance and prohibit disclosure, invented steps and bypassed authorisation.

Then imagine an attacker plants instructions in retrieved material, presenting them as recovery policy and urging it to skip identity checks. The assistant treats source content as authority. This hypothetical case follows the indirect prompt-injection mechanism demonstrated by [Greshake and colleagues](https://arxiv.org/abs/2302.12173v2) [22].

The instruction remains in the prompt. The boundary has failed.

Permissions must be enforced outside model judgment. Retrieved text cannot promote itself into policy or expand access. Decide when the assistant may answer, must clarify or must escalate; restrict retrieval and test hostile inputs. [OWASP's guidance](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) [23] sets out these trust boundaries and least-privilege measures. They reduce exposure without guaranteeing immunity.

![Acceptable answers, clarification and escalation occupy a bounded response space; unauthorised disclosure is outside it.](asset:pmday-slide-09)

### What the score leaves out

We test the assistant. The presentation uses 200 synthetic responses:

| Outcome | Responses |
| --- | ---: |
| Acceptable | 196 |
| Incorrect recovery instructions | 3 |
| Restricted information disclosed | 1 |

Ninety-eight percent acceptable. On the headline score, the assistant looks ready.

**What if not?**

Under a rule prohibiting that disclosure, the candidate fails. The other responses cannot cancel the consequence. The release decision must account for what went wrong, not just how often the answer looked acceptable.

The critical class is 1/200: 0.5% observed. Its approximate 95% Wilson interval is 0.09%–2.78%, under independent, representative sampling and stable conditions. A curated *Golden Set* can test important requirements without representing production. The calculation and assumptions are in source note [24].

![Synthetic evaluation: 196 acceptable responses, three incorrect recovery instructions and one unauthorised disclosure.](asset:pmday-slide-10)

Even 3,000 failure-free trials leave a one-sided 95% upper bound near 0.1% under those assumptions. An attacker choosing and adapting inputs poses a different test again. Evidence helps us decide what to delegate; it does not make every observed success transferable.

A second model may catch failures the first misses. It can also accept the same misleading document. Another verdict is not necessarily independent evidence. [Knight and Leveson's experiment](https://doi.org/10.1109/TSE.1986.6312924) [25] found unexpectedly coincident failures in independently implemented programs—an older warning, not a measurement of current LLMs.

Test the checker against verified failures, valid outputs and shared-error cases. Keep permission enforcement separate. A timeout needs an explicit wait, denial or fallback; it cannot quietly become authorisation.

### The human is an architectural dependency

We still have a human escalation path. A qualified person will inspect the evidence, recognise the exception and intervene.

**What if not?**

At night, the queue is unattended. At peak load, reviewers cannot keep up. A tired reviewer approves a polished summary without seeing the underlying evidence. The path exists; the capacity to operate it does not.

[Parasuraman and Manzey](https://doi.org/10.1177/0018720810376055) [26] describe automation complacency and bias in both novices and experts. Bainbridge's trap returns: the hardest exception reaches someone whose opportunities to practise have diminished. [16]

**If safe operation depends on human judgment, human capability is an architectural dependency.**

An escalation policy cannot staff a queue. Architects must account for availability, competence, cognitive load, evidence and the power to refuse. Operations must supply that capacity. Queue wait plus decision time must fit the available intervention window, including under peak demand.

[UA's control-loop anatomy](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/control-loop-anatomy.md) [27] develops that architectural framing. People need time to recover context and exercise judgment. Their presence in an organisation chart supplies neither.

For our assistant, the consequence is concrete: without qualified approval in time, it cannot change account access. Remove that permission. Retain access-filtered guidance and routing to a verified human process. An unavailable reviewer must never turn waiting into approval.

### Before the consequence

Suppose the assistant discloses information and monitoring raises an alert. We roll back the model. The software returns to its previous state; the disclosed information does not.

The owner needs a tested way to narrow or stop operation and verify that intervention worked. [NIST's AI RMF](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) [28] treats monitoring, response and recovery as operational responsibilities. But if intervention cannot beat the consequence, the permitted action must change. Monitoring cannot prevent harm it only reports afterwards.

Nor does a successful release settle the arrangement. Models change, retrieval acquires conflicting material, provider routing shifts and demand overwhelms reviewers. Yesterday's evidence may stop describing today's system without an application commit.

Record the model, data, permissions, workload and human coverage that supported the decision. Set reassessment triggers; turn incidents into regression cases. The assistant's allowed role remains conditional on controls and people that actually work.

![Model proposals pass fallible semantic checks and enforced permissions; denials, fallback, observation and authorised intervention form a control loop.](asset:pmday-slide-12)

## III. What If Not?

Return to the person facing the incident. Faster generation has helped create the system they must now understand. Model judgment may already have produced a consequence they cannot reverse. Their ability to act depends on decisions made long before the alert.

This is where the two shifts meet. We can delegate more work and more decisions, while leaving the capacity to answer for them uncertain.

The direction is promising. I want it to work. Less drudgery, better verification and previously unaffordable software are worth pursuing. The question is what must be ready around those capabilities before we rely on them.

Iteration helps when exposure is bounded, effects can be evaluated and intervention can arrive in time. [Canary releases](https://sre.google/workbook/canarying-releases/) [29] embody that discipline. Agile's [principles](https://agilemanifesto.org/principles.html) [30] connect adaptability with technical excellence and good design. “We will iterate” carries little reassurance when the consequence escapes the experiment.

**A working recovery mechanism is not the same as a recoverable consequence.**

The question becomes useful when it changes a decision. If the assistant depends on qualified approval, we must examine what happens when nobody can respond in time—and remove its permission to change access if that approval cannot be supplied.

Establish the workflow outcome to improve, the actions the system may take, the results it must never produce and the people and controls needed to operate it. Rehearse containment and recovery. Decide what evidence would justify expansion, restriction or a stop.

Those requirements cost money and attention. Organisations can copy a visible workflow while leaving its supporting expertise and response capacity unfunded. The cost of discovering the omission then falls on the people exposed to it.

Vendors' specialists do not staff your incident response. Their willingness to experiment cannot authorise exposure for your customers. You do not owe a vendor your organisation as an experiment. You owe your customers a system you can operate.

I would welcome convincing results: sustained useful delivery, retained understanding and effective recovery at an acceptable full cost. Compare with the real baseline, including its failures. Let the evidence change the decision—including mine.

![Delivery commitments continue alongside an experiment-and-reassessment loop informed by production outcomes and incidents.](asset:pmday-slide-14)

Lem's warning reaches across the whole chain:

> “One cannot simultaneously make discoveries and avoid taking responsibility for their consequences.”

*— Stanisław Lem, quoted and translated by Bogna Konior; source and edition details: [31].*

Writing let ideas outlive their authors. AI expands the work and judgment we can entrust to technology. The sum of our technology includes the institutions, systems and human capabilities needed to live with what follows.

Build for the future you believe in. Keep the ability to act if that belief is wrong.

### Further reading

[The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) [9] and [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) [20] develop the two research strands. They are my synthesis and developing architectural doctrine, not independent experimental confirmation of this essay.

## Sources & references

Numbers beside named links connect claims to these sources. Source notes distinguish empirical findings, vendor-reported results, hypothetical examples and the author’s architectural argument.

1. Vitalii Oborskyi. *AI Changes the Delivery System and the Product Itself*. PMDay 2026 presentation. See the Slides (PDF) link at the beginning of this article.

    Figures reproduce full slides 3, 5, 7, 9, 10, 12 and 14 from the v35 presentation copy. Original slide credits and notices remain applicable. Scenarios and proposed countermeasures are not empirical results.

2. [Vitalii Oborskyi. PMDay 2026 talk recording (Ukrainian).](https://youtu.be/xSgWjuGqC9I)

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

10. [Anthropic. “Code Review” product and engineering announcement (2026).](https://claude.com/resources/articles/code-review)

11. [Jay Parikh / Microsoft. “Introducing Command Line, and the new rules for builders” (2 June 2026).](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/)

    The opening supplies the old-playbook instruction; sections 8 and 10 supply the review and disposability headings. These passages are quoted separately, not combined into a statement that review itself is just an obsolete habit. First-pass review moves to agents, human architectural oversight remains, and the disposability argument is limited to well-bounded features. These are not a blanket claim that all code review is unnecessary.

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

    The responsibility quotation in part III is reproduced in Konior’s English translation. Her note 18 cites the Polish edition (Kraków: Wydawnictwo Literackie, 2020), p. 471; note 1 identifies the translations as her own. The quotation was checked in Konior’s essay, not independently against that book page. It must not be attributed to Joanna Zylinska’s published English translation. The surrounding argument on delegated work and judgment is Oborskyi’s, not a quotation from Lem.

## How to cite this draft

Oborskyi, V. (2026). *The Sum of Our Technology: AI Changes Both Sides of Software Engineering*. Editorial draft R16, 20 October 2026.

Unpublished author-review edition. Cite the revision; no DOI or final publication URL has been assigned.

```bibtex
@misc{oborskyi2026sumR16,
  author = {Oborskyi, Vitalii},
  year = {2026},
  title = {The Sum of Our Technology:
           AI Changes Both Sides of Software Engineering},
  note = {Editorial draft R16, 20 October 2026; unpublished}
}
```

Text © 2026 Vitalii Oborskyi. Presentation and third-party credits remain applicable. Cover 02: AI-generated editorial illustration selected by the author.
