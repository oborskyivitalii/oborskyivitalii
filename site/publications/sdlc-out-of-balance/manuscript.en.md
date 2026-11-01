# The SDLC Is Out of Balance: Beyond the AI Code Review Bottleneck

*Why faster reviews alone do not establish better software delivery.*

Vitalii Oborskyi · 1 November 2026 · [vitaliioborskyi.ai](https://vitaliioborskyi.ai/)

![An accelerated coding stage tilts the delivery chain while people support the downstream work.](asset:hero)

## The AI code review bottleneck is a symptom

“Code review is the next bottleneck” is progress. It is not the full diagnosis.

**My diagnosis: AI adoption has pushed the SDLC out of balance at industry level.** We are accelerating cognitive work faster than organisations are rebuilding the capacity to understand, verify, integrate and own its results.

**This is a systemic counterargument to a review-only diagnosis of AI-assisted software delivery.** Review automation can remove a real constraint. A shorter review queue, by itself, does not establish that the delivery system is producing better outcomes.

Buying licences changes what people can produce. It does not redesign the system that turns that production into business value. When the strategy stops at access, training and usage targets, the organisation leaves the hardest part of the transformation to chance.

The gap is visible in the evidence. [Writing Code vs. Shipping Code](https://www.nber.org/papers/w35275) finds that gains in coding activity exceed downstream output gains, even as releases increase. [DORA’s 2025 report](https://dora.dev/research/2025/dora-report/) identifies the organisational system—not the tools alone—as central to returns from AI.

A review queue is one place where the mismatch surfaces. Requirements, design, testing, integration and operations have their own constraints. The machine–human speed gap changes the relationships between them.

This is not only a coding asymmetry. Faster requirements, design options, tests and diagnoses can all increase the volume and variety of work demanding a human or organisational response. The constraint is the capacity to turn those outputs into decisions and owned outcomes.

**The problem is not that one step is too slow. We changed the pace of work without redesigning the system responsible for the result.**

![A conceptual orange curve for potential AI task pace rises above a teal curve for effective human and organisational capacity across seven lifecycle stages. The shaded gap represents pressure to rebalance; no values are measured.](asset:asymmetry)

## What the code-review bottleneck accounts actually show

[Anthropic’s Code Review announcement](https://claude.com/resources/articles/code-review) describes review pressure as code output grows. [Microsoft’s Stephen Toub](https://devblogs.microsoft.com/dotnet/ten-months-with-cca-in-dotnet-runtime/) describes generating pull requests faster than expert colleagues could review them. [OpenAI’s Codex account](https://developers.openai.com/blog/custom-code-review-rules-for-codex) connects rising PR volume with scarce contextual knowledge; [GitHub’s review guidance](https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/) describes human review capacity lagging agent-generated work. These are first-party accounts and guidance, not a controlled measure of every organisation.

[DORA’s analysis of Google engineers’ experiences](https://dora.dev/insights/balancing-ai-tensions/) reports gains alongside verification overhead and added reviewer burden. It also recommends measuring the whole lifecycle. That supports the systemic argument rather than contradicting it.

The disagreement is with reducing the diagnosis to one queue. These sources do not all do that: [Anthropic’s source-control account](https://www.anthropic.com/research/redesigning-source-control) identifies builds and CI as constraints too, while acknowledging its unusually intensive workload. **Removing a bottleneck and rebalancing a delivery system are different claims.**

## The workstream is not the system

The sequence from intent through delivery and operations to business outcomes is the visible workstream. It is not the whole delivery system.

The arrows do not show how the team learns, where dependencies accumulate, who can reject unsuitable work, or how incidents consume the capacity reserved for improvement. They do not show whether the people accountable for the product can still explain and recover it.

AI enters this network wherever we delegate cognitive work: producing requirements, comparing designs, writing code, generating tests or diagnosing failures. Accelerating one activity changes the demands placed on others. Adding another agent does not remove those relationships.

The organisational scale matters. Three to five people can share context and renegotiate responsibilities directly. An enterprise distributes them across teams, vendors, legacy systems and approval boundaries. A successful small-team workflow is not an enterprise operating model.

**To improve the system, first see the system. A faster arrow on the flowchart is not enough.**

![Seven delivery activities connect to outcomes and a feedback path. Beneath them are six enabling relationships: dependencies, learning, decision rights, capacity, ownership and recovery.](asset:workstream-system)

## AI code review, shared understanding and ownership

Code review makes the missing relationships visible. [Bacchelli and Bird’s research](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/) identifies knowledge transfer, team awareness and alternative solutions alongside defect detection. Review is also one of the places where people learn what changed, why it changed and how it fits.

That knowledge becomes operational capability. When production fails, the business needs someone who can diagnose the failure, understand its consequences and restore service. A green approval cannot do that. Neither can an ownership label assigned to someone who lacks the necessary context.

Automating defect detection is valuable. **Treating it as a replacement for every function of review is the mistake.**

The [Claude Code team’s October account](https://claude.dev/blog/solving-code-review-at-anthropic/) reports higher throughput and a lower reverted share after changing its review process. It also separates defect detection from shared understanding. The team uses targeted AI explainers and open working channels for the latter, while acknowledging that it has no formal process for that function.

That is the right engineering question: when machines do more of the reading, how does the team acquire the understanding it still needs?

The answer need not be “everyone reads every line.” It must be a working mechanism for learning, diagnosis and recovery within the time the business can afford.

**We can replace a practice. We still have to provide its necessary functions.**

![Four review functions reported by Bacchelli and Bird—defect detection, knowledge transfer, team awareness and alternative solutions—sit above the operational capabilities to explain, diagnose, intervene and recover.](asset:review-functions)

## When acceleration eats delivery capacity

The critical boundary is not how much an agent generates. It is how much work the organisation accepts responsibility for.

Once admitted work exceeds the capacity to verify, integrate, understand and maintain it, the excess becomes a queue, a shortcut or a future obligation. The cost has not disappeared. It has changed location.

The feedback loop is destructive. More repair and support interrupt learning and refactoring. Weaker understanding makes the next change harder to assess. More instability creates more repair. The delivery system starts consuming the capacity it needs to improve.

**People absorb overload. Products accumulate fragility and debt. The business pays through higher total cost of ownership.** Burnout and loss of experienced staff threaten the delivery system itself—not just the next release.

A team can make its review dashboard greener by narrowing the review, then pay for the missing work through on-call load and slower recovery. Local improvement and system deterioration can happen together.

**Cheaper code is not cheaper software ownership.** The danger is not merely missing the promised ROI. It is accelerating the accumulation of assets the organisation can no longer change and support economically.

Rebalancing is how we turn the new production capability into a durable advantage instead of a growing obligation.

![Admitted work above effective capacity can increase interruptions and overload for people, fragility and change costs for products, and rework and ownership costs for business. Repair consumes improvement capacity and reinforces the overload.](asset:imbalance-loop)

## Rebalancing the SDLC requires an accountable owner

A better problem statement must change the organisation’s decisions.

Name the outcome the delivery system must produce. Identify the constraints and capabilities on which it depends. Give one accountable owner the authority, budget and cross-functional support to change them. An owner without those means is a name on a slide.

Then formulate hypotheses—not an inevitable “AI-native” recipe. A different combination of automation, smaller changes and deliberate knowledge transfer is a proposal to test. So is removing work that contributes nothing to the outcome.

Define the baseline, comparable work, success criteria and stop conditions before the pilot. Measure useful delivery, quality, checking and rework effort, sustainable workload, recovery capability and total cost. A gain in one metric cannot hide an unacceptable loss in another.

## Test the system, not the sales story

The decision is not “Did we use AI?” or even “Did review get faster?” It is: **“Can we deliver more useful, reliable software at sustainable cost—and still understand, operate and recover it?”**

Keep interventions that improve that result. Change or stop those that merely move the cost. This is engineering: problem, hypothesis, intervention, evidence, reassessment.

![An accountable owner supports a four-step feedback loop: frame the problem, test a hypothesis, evaluate system outcomes, then keep, change or stop. Evidence can send the organisation back to its original diagnosis.](asset:systemic-response)

Without that loop and someone empowered to own it, an organisation can spend years optimising individual steps while its overall performance stands still—or deteriorates.

**Who owns the end-to-end result—and has the authority to rebalance it?**

This is one of the two problem spaces in my DevCon Romania talk, *AI Changes the Delivery System and the Product Itself*, on 4 November. The other concerns control around model judgment inside the product.

## References and related work

1. Demirer, Musolff & Yang (2026). [Writing Code vs. Shipping Code](https://www.nber.org/papers/w35275). NBER Working Paper 35275, revised September. Observational working paper; activity and release gains differ. No effect-size estimates are used here.
2. DORA (2025). [State of AI-assisted Software Development](https://dora.dev/research/2025/dora-report/). Official report summary; organisational context and returns from AI.
3. Baolin & Harvey (10 March 2026). [Balancing AI tensions: Moving from AI adoption to effective SDLC use](https://dora.dev/insights/balancing-ai-tensions/). Qualitative analysis of Google engineers’ survey responses; reported experiences, not a causal industry-wide estimate.
4. Bacchelli & Bird (2013). [Expectations, Outcomes, and Challenges of Modern Code Review](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/). ICSE; Microsoft teams, not an AI-adoption experiment.
5. Anthropic (9 March 2026). [Bringing Code Review to Claude Code](https://claude.com/resources/articles/code-review). Product announcement with internal observations and customer reports; human approval remains explicit.
6. Toub, Microsoft (23 March 2026). [Ten Months with Copilot Coding Agent in dotnet/runtime](https://devblogs.microsoft.com/dotnet/ten-months-with-cca-in-dotnet-runtime/). Firsthand engineering experience; preserves expert judgment, not a controlled comparison.
7. Griffiths, GitHub (7 May 2026). [Agent pull requests are everywhere. Here’s how to review them.](https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/). Vendor guidance; automated first pass with contextual human judgment.
8. Srikanth, OpenAI (20 July 2026). [Custom Code Review rules for Codex](https://developers.openai.com/blog/custom-code-review-rules-for-codex). Product/engineering account of review context and repository rules.
9. Osmani, Lunt & Wang (15 October 2026). [How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic/). First-party engineering account; separates defect detection and shared understanding.
10. Anthropic (13 October 2026; updated 15 October). [Redesigning source control at Anthropic](https://www.anthropic.com/research/redesigning-source-control). Infrastructure case study under an unusually intensive workload; not a prescription for ordinary teams.
11. Oborskyi. [The Subprime Code Crisis](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) and [The Verification Crisis](https://medium.com/agileinsider/ai-the-externalization-of-reasoning-and-the-verification-crisis-4f5046f9f0d0). Research synthesis and related analysis of AI-assisted delivery.
12. Oborskyi. [Thinking Systems](https://www.linkedin.com/pulse/thinking-systems-when-controlled-object-changes-vitalii-oborskyi-6k4we/) and [Uncertainty Architecture](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture). Related research on control around consequential model judgment.

**Evidence note.** The industry-level diagnosis and feedback loop are my systems synthesis. The studies support parts of the argument, not a measured rate of organisational failure. The illustrations explain mechanisms; they are not statistical charts.

## About the author

**Vitalii Oborskyi** leads delivery and PMO work and researches how AI changes software engineering, operating models and responsibility. He is the author of Uncertainty Architecture and The Subprime Code Crisis.

[Website and research](https://vitaliioborskyi.ai/) · [LinkedIn](https://www.linkedin.com/in/vitaliioborskyi/)

© 2026 Vitalii Oborskyi. R4 edition. Original text and diagrams: CC BY 4.0. AI-assisted illustrations; third-party sources retain their rights.
