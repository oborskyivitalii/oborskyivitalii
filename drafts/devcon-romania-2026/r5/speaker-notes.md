# DevCon Romania 2026 — R5 Problem-Framing Stage Script

**AI Changes the Delivery System and the Product Itself**  
**Vitalii Oborskyi · DevCon Romania · 4 November 2026**

## Slide 01 — AI Changes the Delivery System and the Product Itself

**Planned time:** 1:40 | **Act:** Opening / engineering frame

Good afternoon. I want to start with a very simple view of engineering.

We begin with a problem statement. We form a hypothesis about how to improve the situation. We build something, verify what actually happened, and—when the evidence disagrees—we revisit any earlier step, including the original problem statement.

That last move matters. If we frame the wrong problem, we can build an excellent solution to the wrong thing.

Today I will propose two problem statements.

For **how we build**, the problem is not “how do we buy AI coding licenses?” and it is not only “how do we review more generated code?” The problem is: **how do we rebalance the SDLC as a complete delivery system so local acceleration becomes useful, supportable delivery?**

For **what we build**, the problem is not “how do we connect several agents and add an evaluator?” The problem is: **can we engineer a viable control system around consequential runtime model judgment in this business context?**

Those are different problems, and each needs an accountable owner, evidence and permission to change the system—not merely another tool.

## Slide 02 — We Accelerated a Step. Not the System.

**Planned time:** 1:45 | **Act:** Problem 1 / mechanism

Here is the first problem in its simplest form.

A delivery system turns intent into design, code, review, tests, integration, deployment, operation and user outcomes. Each activity has capacity and dependencies.

Suppose a team could generate, review and integrate eight comparable changes per week. AI raises generation to one hundred while the other two capacities remain eight. If all one hundred changes are admitted, ninety-two unfinished changes accumulate every week. We accelerated production of candidates, not delivery of useful outcomes.

The backlog is not inevitable. A WIP limit can prevent uncontrolled intake. Better automated verification may raise downstream capacity. AI may help review, testing and integration too.

But that is exactly why “code review is now the bottleneck” is too narrow as the organizational problem statement. Review may be one constraint today; tomorrow it may be testing, architecture, integration, incident recovery, user adoption or cost.

The accountable owner therefore needs a mandate across the delivery operating model, not just a mandate to optimize one node. The seven question marks are deliberate: we must test how the whole system changed.

## Slide 03 — What Are We Actually Measuring?

**Planned time:** 2:35 | **Act:** Problem 1 / evidence and outcome hierarchy

The evidence does not give us one universal AI-productivity number. It gives us different measurements at different layers of the system.

The September 2026 NBER study reports very large cumulative increases in changed lines of code, smaller increases in commits and a smaller—but still positive—increase in repository releases: about 25.5 times, 3.4 times and 1.3 times. These are observational estimates across different outcomes and samples, not a funnel tracing one fixed batch of code.

The same paper’s marketplace analysis adds another layer. New iOS application entry rose strongly, while early rating activity was roughly flat and the share of apps with very few ratings increased. Android download proxies moved somewhat positively. Software supply, release activity, adoption and value are different outcomes.

Now look at delivery. Chen and Stratton report about twenty-three percent more submitted pull requests after coding-agent adoption, together with roughly forty-nine percent longer calendar time from pull request submission to merge in their selected firm sample. That is elapsed time, not forty-nine percent more reviewer labor, and stricter or more useful scrutiny remains an alternative explanation.

DORA adds another tension. Most respondents reported personal productivity gains, and many reported better code quality. But higher AI adoption was also associated with both higher delivery throughput and higher delivery instability—failed production changes and unplanned corrective deployments. This is a survey association, not a causal estimate.

Finally, structural signals. Agarwal and colleagues report higher cognitive-complexity and static-warning proxies in matched open-source cohorts. GitClear’s cross-edition snapshots report a lower share of moved code and a higher copy-and-paste share. Those reports use different samples and methods; neither proves that AI caused maintainability loss.

The engineering conclusion is not that every metric got worse. It is that activity, delivery, stability, maintainability and customer value can move differently. The problem statement must therefore ask: **what useful outcome improved, what work moved, what did it cost, and can the team still own and recover the system?**

## Slide 04 — The Comprehension Gap Is an Ownership Risk

**Planned time:** 1:45 | **Act:** Problem 1 / functions that must survive

This graph is an illustrative risk, not a measured prediction.

Generation capacity can rise faster than a team’s current capacity to understand the accepted changes. AI can also improve explanation and verification, so the yellow line is not a permanent biological limit. The question is whether the necessary functions actually improve fast enough in this system.

Review protects at least two different things. One is quality: find incorrect assumptions and unacceptable changes. The other is competent ownership: transfer enough knowledge that another accountable person can explain critical behavior, modify it, diagnose failure and recover the service.

An agent can generate code, tests and documentation from the same interpretation. If that interpretation is wrong, three consistent artifacts can share one common-mode error. Agreement is not automatically independent evidence.

This is why the comprehension gap matters to DevOps and SRE. An ownership label in a service catalog is not the capability to recover production.

So when we redesign the SDLC, the goal is not to preserve every old manual ritual. It is to preserve—or replace with demonstrated alternatives—the functions that make responsibility real.

## Slide 05 — Rebalance the SDLC, Not Just Code Review

**Planned time:** 2:30 | **Act:** Problem 1 / hypotheses, owner and investment decision

This is the actual engineering program for AI-assisted delivery: six candidate interventions, not six proven fixes.

For flow and cost, teams can test smaller batches and WIP limits. They can test specification-driven work where a durable contract reduces ambiguity rather than adding ceremony.

For quality, agentic review and independently grounded test oracles may expand effective capacity. Disposable implementations may work for isolated, bounded features, but persistent state, integrations and critical behavior cannot simply be thrown away.

For knowledge and ownership, living architecture and repository intelligence may improve navigation and explanation. They also create maintenance cost, and AI-generated explanations can reproduce the implementation’s wrong premise.

The central organizational change is the problem statement. The owner is not merely “the person who bought the tool” or “the code-review owner.” An accountable Engineering or Delivery leader needs the mandate to test and rebalance the operating model across review, integration, operation and recovery, with Product, QA and Operations co-owning outcomes and evidence.

Buying licenses and delivering a short course can create local gains. It does not establish system-level ROI. The hypothesis must be tested against comparable useful delivery, reliability, full lifecycle cost, user outcomes and the team’s ability to recover.

There may be no universal AI-native SDLC. Different projects may need different agent participation at different nodes—including none.

My acceptance question remains simple: **when production breaks and the preferred AI cannot fix it, can the team recover?**

## Slide 06 — When Model Judgment Enters Runtime

**Planned time:** 2:40 | **Act:** Problem 2 / the controlled object changes

Now we move from using AI to build software to placing model judgment inside the product.

The formulas are teaching shorthand. In a simplified explicitly encoded path, with relevant input, state and version fixed, we describe behavior as y equals f of x. A model-mediated responsibility is better illustrated as a distribution of possible outcomes conditioned on the request, context, model and configuration.

Traditional software was never perfectly deterministic, and machine learning is not new. The important change is that consequential interpretation, synthesis or path selection may now be generated during operation rather than enumerated in advance.

That changes familiar definitions.

A requirement becomes more than one expected path. It must describe acceptable behavior, prohibitions, permission boundaries and operating assumptions across a space of possible outputs.

A bug is not merely a failed execution path. It can be a semantic or policy violation even when the service returns HTTP 200. Frequency matters, but severity matters independently: one prohibited disclosure can block a release despite a strong average score.

Definition of Ready—if the team uses it—may mean the project is ready for a bounded feasibility study, not that the entire behavior space is already known. Definition of Done still describes Increment quality, but it is not permanent authorization for runtime model authority.

This creates the opportunity for Thinking Systems: context-rich cognitive functions that were previously too costly to encode manually may become viable.

The engineering problem is whether we can keep that model-mediated behavior **useful, bounded, observable, correctable and economically justified in the actual business context.**

## Slide 07 — The Rollout Ends. The Hypothesis Doesn't.

**Planned time:** 2:15 | **Act:** Problem 2 / scoped evidence and continued authority

Consider a hypothetical account-recovery assistant evaluated on two hundred responses: 196 acceptable, three with wrong recovery instructions and one disclosing restricted information.

The aggregate is ninety-eight percent acceptable. But the disclosure violates an explicit prohibition. That unsafe path is blocked before live exposure. A good mean score cannot cancel a forbidden consequence.

After redesign and independent evaluation, the team may shadow the system and, where the remaining exposure is genuinely acceptable, run a bounded canary. A canary limits the scope of an experiment; it is not permission to discover irreversible harm on users.

Suppose rollout later reaches the wider population and the application Git SHA stays the same. The operational conditions may still change: model or provider routing, retrieved knowledge, policy, user traffic or the capacity of human responders.

So operation requires evidence in three layers. Normal service signals—availability, latency, errors and cost. Behavioral outcomes—did users complete the task, receive unsafe advice or encounter prohibited behavior? And control health—are permission gates, escalation queues and fallback paths working?

Release authorizes operation under particular conditions. It cannot make those conditions permanent.

The owner must be able to continue, narrow authority, use manual fallback or stop and reframe the hypothesis. The rollout ends. The hypothesis does not.

## Slide 08 — Engineer the Whole Control System

**Planned time:** 3:15 | **Act:** Problem 2 / control architecture and viability

This is where I think the current market vocabulary is useful but incomplete.

Agents, harnesses, guardrails, evaluators and agents reviewing other agents are capabilities. They do not by themselves establish that the complete system is controllable, reliable or economically viable.

Control engineering gives us a broader frame.

First, there are **Constraints and their realizations**: the approved boundaries and the mechanisms that enforce or influence them. For account recovery, the model may propose guidance, but a separate permission path must prevent changing access to an unverified destination.

Second, there are **Sensors and evidence**: observations of behavior, outcomes, conditions and control health. A semantic evaluator is useful, but fallible; another model agreeing is not automatically independent truth.

Third, there is the **Controller and decision authority**: someone compares evidence with approved limits and is actually authorized to continue, narrow, stop or change scope.

Fourth, there are **Actuators and corrective actions**: disable a tool, reroute to safe static guidance, narrow the population, switch models or move to staffed support—and then verify the correction changed the real outcome.

This is a socio-technical control system. Human authority requires competence, context, response time and real staffed capacity. Product and risk owners define acceptable outcomes and authority. Architects and control specialists establish feasibility. DevOps and SRE operate the loop and recover the service.

For a well-bounded use case, ordinary engineering may be enough. For a novel, consequential system, feasibility may be applied R&D. You may need domain experts, statisticians, control engineers or applied mathematicians to model observability, latency, uncertainty and cost. Their result may be: the requested authority cannot be controlled under these assumptions.

That is not failure. It is valuable evidence before a fixed delivery promise. Narrow the authority, redesign the scope or choose no AI.

## Slide 09 — AI Changes Both Sides. The Engineering Must Follow.

**Planned time:** 1:30 | **Act:** Sole conclusion / owners and actions

Let me close with the two problem statements.

For **how we build**, the problem is to rebalance the SDLC as a system—not merely to accelerate coding or automate the next bottleneck. The accountable owner is the Engineering or Delivery operating model. Success means useful outcomes at justified full cost, with stability, ownership and recovery. My open research into this problem is **The Subprime Code Crisis**.

For **what we build**, the problem is to engineer a viable socio-technical control system around consequential model judgment. Product and risk owners authorize the scope. Architects and control specialists establish feasible boundaries. Service owners and SREs operate the system and retain the ability to intervene. My open doctrine and research in this direction is **Uncertainty Architecture**.

The action depends on your role. DevOps and SRE: observe behavior, intervene and rehearse recovery. Developers, QA and architects: define boundaries, create independent evidence and prove ownership. CTOs, Product and Delivery leaders: assign the problem owners, fund the experiments and controls, and authorize only justified delegation.

Both projects are open source and linked from the website on the screen.

Engineering starts with the problem. When evidence disagrees, have the courage—and the authority—to reframe it. Thank you. I look forward to your questions.

---

## Editing boundaries for this review candidate

- Exactly nine visible slides.
- Slide 09 remains the sole overall conclusion.
- The engineering cycle is a framing device, not a claim of one mandatory methodology.
- SDLC imbalance is a conditional organizational hypothesis, not a universal diagnosis.
- Control theory is the organizing frame for the runtime problem, complemented by software engineering, security, domain expertise, economics and human factors.
- R&D / specialist staffing is conditional on novelty, consequence and feasibility uncertainty; it is not a universal requirement for every AI integration.
- No merge, publication or production release is implied by this script.
