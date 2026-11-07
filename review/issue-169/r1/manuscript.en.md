# The SDLC Is Out of Balance

Why faster code and faster reviews do not automatically produce a healthier delivery system

Vitalii Oborskyi · 31 October 2026 · [vitaliioborskyi.ai](https://vitaliioborskyi.ai/)

## The problem is imbalance, not a queue

“Code review is the next bottleneck” is progress in the conversation. It is not the full problem statement.

**My diagnosis: AI adoption has pushed the SDLC out of balance at industry level.** We are accelerating cognitive work without proportionately redesigning the capacity, learning mechanisms and decision rights needed to turn its output into useful, supportable software.

This is the argument I develop in [The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis). It describes an industry-level adoption pattern, not a claim that every organisation is failing or that software delivery was perfectly balanced before AI. The exposure is especially clear when a large organisation buys licences, measures usage and expects the operating model to adapt by itself.

DORA's [2025 report summary](https://dora.dev/research/2025/dora-report/) describes AI as amplifying existing organisational strengths and weaknesses. Better tools matter. So does the system into which we introduce them.

Balance does not mean equal speeds at every stage. It means being able to sustain useful outcomes, quality and ownership at a justified total cost. A faster coding operation does not establish that balance; neither does a faster review queue.

## The workstream is not the system

Consider the familiar sequence:

**Intent → requirements → design → code → review → testing → integration → deployment → operations → user outcomes → business results → feedback to intent.**

These activities overlap and repeat. Even this complete stream is only one view: it does not show how people acquire context, which dependencies constrain a change, who can stop unsuitable work, or where support consumes time that was meant for improvement.

A three-to-five-person team may share much of that context directly. Its size is not a safety guarantee, but its coordination problem differs from a portfolio of specialised teams, legacy products and distributed decision-making. Success in one setting is not an operating model for the other.

AI can change work at requirements, design, implementation, testing and operations—not just coding. The capacity to produce options can grow much faster than the capacity to choose responsibly among them. Delegating another activity changes the relationships around it, including what people still need to know.

![The lifecycle from intent to business outcomes with feedback to intent; learning, capacity, decision rights and economics span multiple activities.](asset:workstream-system)

*Figure 1. The stream is not the whole system. Selected cross-cutting relationships are shown; this is an explanatory map, not a prescribed sequence.*

## Code review does more than review code

Code review makes the distinction concrete. [Bacchelli and Bird's study of Microsoft teams](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/) found knowledge transfer, team awareness and alternative solutions alongside defect detection. Understanding a change was central to the work.

Automating defect detection therefore does not, by itself, establish that every useful function of review has been preserved. That is not an argument for keeping every manual ritual.

**We can replace a practice, but must still provide its necessary functions.**

Imagine a change passing its automated checks and reaching production. During an incident, another engineer must explain the affected behaviour, distinguish causes from symptoms and restore service. The approval is available. Is the understanding?

This is an illustrative question, not a reported incident or proof that automated review causes failures. It exposes a dependency: an organisation's ability to own software includes its ability to diagnose and recover it under pressure, not merely approve its release.

Nobody needs a complete mental model of an entire enterprise codebase. The relevant question is whether the team can obtain and apply the understanding required for its actual responsibilities, within the time available. Documentation, targeted explanations, pairing, exercises and AI assistance may contribute. Their usefulness must be demonstrated, not assumed from their existence.

The [Claude Code team's October account](https://claude.dev/blog/solving-code-review-at-anthropic/) is instructive. It reports increased throughput and a lower reverted share while moving much review to machines. It also distinguishes defect detection from shared understanding and describes targeted explainers and open working channels, while acknowledging no formal process for the latter function. This is an evolving engineering response, not simply the purchase of a reviewer.

![Code review branches into checking the change and sharing understanding; a separately marked systems implication connects understanding to ownership, diagnosis and recovery.](asset:review-functions)

*Figure 2. Review's additional functions are supported by research and practitioner accounts. The connection to ownership and recovery is a systems argument, not a measured causal effect.*

## How local acceleration creates system debt

The underlying mechanism is not mysterious. If an organisation admits work faster than it can verify, integrate, understand and maintain it, the difference becomes waiting, rework or obligations left for later.

“Admits” matters. A discarded experiment need not become a maintenance liability. Additional generated code is not automatically additional debt. Existing spare capacity, better automation or less unnecessary work may absorb the increase.

But when those conditions do not hold, local acceleration can consume the capacity needed to sustain delivery. More checking and repair leave less time for learning, refactoring and improvement. The resulting loss of capability can make subsequent changes harder to assess. A team may clear the review queue by narrowing review while moving its cost into support.

This creates three connected risks: overload and burnout in the delivery organisation; fragility and debt in its products; and increasing ownership cost for the business. They are consequences to investigate, not inevitable outcomes or an established exponential growth law.

**Software can become cheaper to produce while the assets it creates become harder and more expensive to own.**

A local improvement remains valuable when it contributes to a better end-to-end result. The mistake is treating the local metric as sufficient evidence of that result.

![A conditional loop connects admitted work exceeding capacity to waiting and rework, then reduced learning capacity; a countercase and tested rebalancing can interrupt the loop.](asset:imbalance-loop)

*Figure 3. A conditional mechanism, not an inevitable collapse. Increased generation creates this pressure only when admitted obligations exceed effective capability.*

## What the evidence establishes—and what it does not

The evidence does not fit a simple “AI works” or “AI fails” story. The observational working paper [Writing Code vs. Shipping Code](https://www.mertdemirer.com/Papers/Demirer_Writing_vs_shipping_code.pdf) finds coding-activity gains larger than downstream output gains, while releases also increase. That supports examining the whole production chain. It does not establish that the difference is waste or that review alone explains it.

METR's [early-2025 randomised study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) found slower completion in its experienced-developer setting despite perceived acceleration. Its [February 2026 update](https://metr.org/blog/2026-02-24-uplift-update/) says selection effects obscure the newer estimate and likely understate speedups. The earlier result is not a verdict on current tools.

Together with DORA's organisational framing and Anthropic's reported improvements, these sources motivate measurement, not a universal diagnosis for each client. They do not measure the prevalence of the complete failure loop described here. That broader diagnosis is my synthesis; its applicability must be tested locally.

## Rebalancing is an engineering responsibility

A better problem statement changes the next decision. Instead of “How do we accelerate review?”, ask: “What prevents this delivery system from producing more useful, supportable outcomes at sustainable cost?”

Start with a bounded delivery stream. Name its intended outcome, current constraints and the person accountable for changing them. That owner needs authority across the relevant boundaries, resources and access to evidence—not merely another title.

Then make a hypothesis testable. For example: could a different combination of automated checks, smaller changes and explicit knowledge transfer improve useful delivery without weakening recovery capability? This is a candidate intervention, not a recipe.

Agree the baseline, comparable work, observation period, success criteria and stop conditions before the pilot. Assess useful outcomes and elapsed delivery time alongside defects, checking and rework effort, workload, recovery capability and total cost. Neither licence adoption nor merged PRs answer all those questions.

If the same useful service becomes cheaper while quality and ownership remain adequate, count that as a gain. If the evidence contradicts the proposed mechanism, revise the diagnosis. Rebalancing may mean better automation, fewer activities or selective delegation—not more manual gates.

**Who owns the end-to-end result—and has the authority to rebalance it?**

This is one of the two problem spaces in my DevCon Romania talk, *AI Changes the Delivery System and the Product Itself*, on 4 November. The other concerns control around model judgment inside the product. Both begin with defining the problem before choosing the solution.

## References and related work

1. Bacchelli, A., and Bird, C. (2013). [Expectations, Outcomes, and Challenges of Modern Code Review](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/). ICSE. Study of Microsoft teams; not an AI-adoption experiment.
2. Osmani, A., Lunt, M. W., and Wang, Q. (15 October 2026). [How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic/). First-party engineering account, not a controlled causal comparison.
3. DORA (2025). [State of AI-assisted Software Development](https://dora.dev/research/2025/dora-report/). Organisational framing from the official report summary; no numerical estimate used here.
4. Demirer, M., Musolff, L., and Yang, L. (2026). [Writing Code vs. Shipping Code](https://www.mertdemirer.com/Papers/Demirer_Writing_vs_shipping_code.pdf). Author-hosted working paper, dated 27 May in the copy inspected; qualitative findings only, not later-revision percentages.
5. METR (2025; 2026). [Early-2025 productivity experiment](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) and [experiment-design update](https://metr.org/blog/2026-02-24-uplift-update/). Read together; contexts and measurement limits differ.
6. Oborskyi, V. [The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis). Author-led evidence synthesis and delivery-risk research, not an additional independent experiment.
7. Oborskyi, V. [AI, the Externalization of Reasoning, and the Verification Crisis](https://medium.com/agileinsider/ai-the-externalization-of-reasoning-and-the-verification-crisis-4f5046f9f0d0). Related argument about understanding and verification.
8. Oborskyi, V. [Thinking Systems](https://www.linkedin.com/pulse/thinking-systems-when-controlled-object-changes-vitalii-oborskyi-6k4we/) and [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture). Related research on consequential runtime model judgment; a different problem from AI-assisted development.

## About the author

**Vitalii Oborskyi** leads delivery and PMO work and researches how AI changes software engineering and its operating models. He is the author of Uncertainty Architecture and The Subprime Code Crisis. His work connects organisational responsibility, engineering practice and the conditions for useful AI adoption.

[Website and research](https://vitaliioborskyi.ai/) · [LinkedIn](https://www.linkedin.com/in/vitaliioborskyi/)

Text and original diagrams © 2026 Vitalii Oborskyi. Editorial draft R1; publication approval pending. Third-party sources retain their own rights.
