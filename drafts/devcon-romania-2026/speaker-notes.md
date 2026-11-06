# DevCon Romania 2026 speaker notes R1

**AI Changes the Delivery System and the Product Itself**

Vitalii Oborskyi · 4 November 2026 · DevOps Stage

Delivery budget: 23 minutes speaking, 5 minutes Q&A, 2 minutes reserve. Timing is a rehearsal target.

Stage directions in square brackets are not spoken. Source links are for preparation.

## 01. AI Changes the Delivery System and the Product Itself

**00:00–01:30 · PMDay source slide 1**

We have a familiar way of talking about a new technology: what can it do for us?

With AI, I think we need a second question: what kinds of judgment are we now willing to delegate?

We delegate memory to written records, and calculation to machines. With language models, we can also delegate parts of interpretation: turning an intention into a design, choosing an implementation, assessing an answer.

By “thinking,” I mean this cognitive work: interpretation and judgment. I am not making a claim about consciousness.

That shift has two consequences for software engineering. AI changes how we build software. It also changes what we build, when model judgment becomes part of the product itself.

Today I want to connect those two changes through one question: when we move cognitive work into a machine, what else must move so that the whole system remains understandable, accountable and operable?

[Pause. Move to the delivery flow.]

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md
- Cover illustration: OpenAI imagegen, 21 September 2026, retained from PMDay v35.
- Artwork provenance: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/artwork/PROVENANCE.md

## 02. We Accelerated a Step. Not the System.

**01:30–03:30 · PMDay source slide 3**

Look at a familiar delivery flow: intent, design, code, review, test, integration, deployment and operation.

Now imagine a team that can produce eight comparable changes a week, review eight and integrate eight. Suppose AI raises its coding capacity to one hundred, while review and integration remain at eight.

This is an illustration, not a productivity forecast. We are assuming comparable changes, fixed downstream capacity and a team that keeps pushing work into the system.

Under those assumptions, another ninety-two changes accumulate each week. We have increased production at one step. We have also increased the queue.

The visible result may look impressive: more code, more commits, more activity. The system-level result depends on what happens to those changes next.

AI can help with review, testing and operations too. But adopting it at one stage does not automatically create the right capacity at every other stage.

So the question is not only how much faster an individual task became. Where did the constraint move? What happened to waiting, rework and the ability to understand what we are shipping?

That is the distinction I want to keep in mind when we look at the evidence.

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md

## 03. The Evidence Is Already Messy

**03:30–08:00 · PMDay source slide 4**

[Keep this slide visible throughout the evidence section. Point to each study as you discuss its outcome.]

There is a lot on this slide. I have kept it together because these studies measure different outcomes. Treating every number as the same thing called “productivity” would hide the most interesting part.

Start with the [NBER working paper](https://www.nber.org/papers/w35275), revised in September. It covers more than five hundred thousand GitHub developers. Its rounded cumulative summary across three generations of coding tools shows twenty-five-point-five times the changed lines of code and three-point-four times the commits. The available release estimates give a cumulative figure of one-point-three times; the asynchronous-agent release effect was not separately estimated.

Changed lines means additions plus deletions. These are cumulative study estimates, not a promise that any developer will now write twenty-five times more useful code. These figures cannot give us a precise code-to-value conversion rate.

The same paper looks at new applications in four marketplaces. Two examples are shown here. Among the young cohorts it examines, the share of new iOS apps with fewer than ten ratings rises from about seventy-eight to eighty-seven percent. For Chrome extensions, the share with fewer than ten downloads rises from nineteen to thirty-three percent.

Those are adoption proxies during the first three months. They raise questions about what happens after production; they do not tell us the lifetime value of those applications.

Now [DORA](https://dora.dev/research/2025/dora-report/). In its 2025 survey, more than eighty percent of respondents report improved productivity, and fifty-nine percent report better code quality. These are shares of people reporting an improvement, not the size of the improvement. Higher AI adoption is associated with both greater delivery throughput and greater delivery instability: failed production changes and unplanned fixes. This is a survey association, not proof that AI caused either outcome.

[GitClear](https://www.gitclear.com/the_ai_code_quality_maintainability_gap) shows another kind of signal: moved code and copy-paste as shares of changed lines. The two report editions use different samples. These are separate snapshots, not a comparable trend or a causal estimate. They motivate a question about maintainability that we would need to examine in our own codebase.

The [METR survey](https://metr.org/blog/2026-05-11-ai-usage-survey/) of three hundred and forty-nine technical workers reports self-assessed work value with AI at around one-point-four to two times their estimated work value without AI, using medians from three questions. That is positive evidence about perceived value, rather than an objectively measured delivery multiplier.

And [Agarwal’s repository study](https://arxiv.org/html/2601.13597v2) reports increases in cognitive complexity after agent adoption, against matched controls: about thirty-five percent for agent-first repositories, and forty-three percent for repositories with prior AI-IDE use. That is a code metric. It does not directly measure how much longer a reviewer needs.

There are gains here, and there are signs of pressure elsewhere. These findings do not establish one universal effect of AI on every team.

My reading is that we should examine how the capacities of the whole delivery system fit together. The studies do not directly measure the comprehension gap I am about to describe. They give us reasons to investigate it.

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md
- Evidence and limitations: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/EVIDENCE.md
- https://www.nber.org/papers/w35275
- https://dora.dev/research/2025/dora-report/
- https://gitclear-public.s3.us-west-2.amazonaws.com/GitClear-AI-Copilot-Code-Quality-2025.pdf
- https://www.gitclear.com/blog/annual_ai_code_quality_research_2026_diff_digest_git_ai_diff_viewer
- https://metr.org/blog/2026-05-11-ai-usage-survey/
- https://arxiv.org/html/2601.13597v2

## 04. The New Scarcity Is Human Comprehension

**08:00–09:30 · PMDay source slide 5**

Imagine that changes arrive faster than people can develop a useful understanding of them.

The gap is not simply unread code. It can include design assumptions nobody has examined, dependencies nobody can explain, and operational behaviour nobody knows how to diagnose.

The relationship shown here is an illustrative hypothesis, not a curve measured by the studies on the previous slide.

AI may also help us understand a system. The question is whether that understanding is sufficient, available to the right people, and usable when it matters.

You do not need every engineer to memorise every line. You do need enough understanding distributed across the team to challenge a change, recognise a failure and restore the service.

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md

## 05. The Team Is the Last Line of Defense

**09:30–10:30 · PMDay source slide 6**

Imagine an incident. The model proposes a recovery action, but cannot explain the failure in a way the team can validate. Or the tool is unavailable. Or its proposed fix creates another problem.

At that point, someone still has to make a decision and recover the system.

So “a human is responsible” is incomplete. Does that person have the evidence, expertise, authority and time to act?

This is why comprehension belongs in a conversation about delivery capacity. It affects how much change the team can responsibly absorb, and whether ownership remains real after the code has been produced.

[Pause on the recovery question before moving to the central thesis.]

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md

## 06. We Are Searching for a New SDLC Equilibrium

**10:30–12:30 · PMDay source slide 7**

Here is my diagnosis: the SDLC is out of balance wherever the capacity we have added no longer fits the capacity we have to validate, integrate, understand and operate its output.

That will look different across teams. The constraint may be review, integration, product decisions or recovery expertise. We should not assume that it is always the same stage.

The industry is searching for a new equilibrium. Proposed approaches make different bets about where understanding should live, what can be delegated, and how errors will be detected and corrected.

Some are already useful in particular settings. What we do not have is a demonstrated final recipe that settles those questions for every team and product.

I would treat a proposed operating model as a hypothesis: under these conditions, this change should improve the whole system, through this mechanism.

Then we can ask whether it actually does. Faster generation may be valuable. So may clearer specifications or better automated review. Their value depends on what happens to flow, quality, comprehension and recovery together.

That is the first shift: model judgment enters the work of building software.

The second shift makes the same question even more direct. What happens when model judgment becomes part of the software we ship?

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md

## 07. When Software Starts Thinking

**12:30–13:15 · PMDay source slide 8**

Consider an IT assistant that helps someone recover access to a service.

In a conventional flow, we define the decision rules and implement them. With a model, some interpretation of the request and selection of the response happens at runtime.

I use “Thinking System” for a system in which consequential runtime behaviour depends partly on this model judgment.

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md

## 08. Requirements Become Boundaries

**13:15–14:00 · PMDay source slide 9**

Now “help the user recover access” is not a sufficient description of acceptable behaviour. The assistant may answer using approved guidance, ask for clarification, or escalate. It must not disclose information that the user is not authorised to see.

We still need deterministic requirements, permissions and ordinary software tests. We also need to describe the space of acceptable behaviour and the consequences of leaving it.

The product now relies on judgments we cannot fully assess by reading a fixed list of implementation branches. That changes what evidence we need before trusting it with a responsibility.

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md

## 09. One Green Test Proves Almost Nothing

**14:00–16:00 · PMDay source slide 10**

Suppose we evaluate that assistant on two hundred cases. This is an illustrative example, not a real benchmark or a recommended sample size.

One hundred and ninety-six responses are acceptable. Three contain incorrect recovery steps. One discloses private information.

A summary can say “ninety-eight percent acceptable.” Yet that number alone cannot decide whether the assistant is ready. If our release conditions prohibit that disclosure, the observed breach blocks release even though the aggregate score looks good.

Different evidence also answers different questions. A curated set of difficult cases can test known failure modes. A representative sample can help estimate how frequently outcomes occur in the population it represents. Repeating a few convenient examples does not achieve both.

The engineering question becomes: acceptable for which responsibility, in which situations, with what uncertainty, and with which controls available?

This does not make release a purely statistical decision. The release decision has to connect the evidence, the agreed limits and the authority to accept the remaining risk.

And the conditions can change. A new model, new knowledge or broader permissions can change the behaviour we are relying on. We need to know which previous conclusions still apply.

We have now moved from implementing a feature to establishing the conditions under which a delegated judgment is usable.

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md

## 10. Production Needs a Control Loop

**16:00–18:00 · PMDay source slide 12**

Suppose our answer is to put a human in the loop. What does that mean in the actual system?

For the access assistant, a reviewer must see enough evidence, understand the request, have authority to reject it, and act before an unauthorised disclosure occurs. After disclosure, a rollback cannot make the information unknown again.

If requests arrive faster than people can review them, the diagram still contains a human. The effective control may already be gone.

An automated semantic check can be wrong or unavailable. A separate permission check, and any required approval, determine what the system may disclose or do. They do not by themselves establish that every permitted response is correct.

The control loop must also work: observe outcomes, compare them with agreed limits, intervene through an authorised control path, and verify the effect. Telemetry alone does not tell us whether a response was correct.

So control depends on technical mechanisms and on people’s expertise, decision rights, availability and response time. It also depends on whether those parts remain available within the service’s cost and latency limits.

These are dependencies in the system we are designing. If a required response capability does not exist, we have to change the design, narrow the delegated responsibility, or reject that particular AI path.

“More autonomy” is therefore not a complete engineering objective. The useful question is how much delegation the complete system can support under the conditions in which it will operate.

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md

## 11. The Roles Move With the System

**18:00–20:30 · PMDay source slide 13**

Now connect the two shifts.

In development, we delegate judgments that shape the software. In the product, we delegate judgments that shape its behaviour. In both cases, we are redistributing cognitive work.

Software engineering was already sociotechnical. People, organisations and technical systems have always depended on one another. AI changes the distribution of work within that relationship.

When I say “sociotechnical stack,” I mean the models and tools, the engineering workflow, the human expertise, the decision rights and the operational capacity that together make the system work.

Think about a developer who uses AI to introduce a technology the team has never operated. The implementation may work in a demonstration. But the ability to review it and recover it is still missing. That is a delivery dependency, even though the code already exists.

Or take our assistant. The model may be capable enough, while access to domain experts is too limited to evaluate its decisions. The constraint has moved to a part of the organisation that a model benchmark cannot see.

This is why the operating model matters. Someone must define acceptable outcomes. Someone must produce and interpret evidence. Someone must have authority to make the decision. Someone must be able to intervene.

Those responsibilities may sit in existing roles. The point is to make their dependencies and capacity visible, rather than assume that a new tool automatically supplies them.

The balance we are searching for includes the people who build, judge, own and recover the system. A technical architecture that depends on capabilities the organisation cannot provide is still an incomplete design.

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md

## 12. Engineering Rigor Moves — It Doesn’t Disappear

**20:30–23:00 · PMDay source slide 14**

How do we work while that balance is still emerging?

I use the laboratory as a metaphor: make the hypothesis explicit, run a bounded experiment, examine the evidence, and make a decision.

Engineering already does this. AI makes it especially useful to be explicit about assumptions concerning delegated judgment and the human capacity around it.

When someone proposes a new approach, I would ask four questions.

Which imbalance does it address?

By what mechanism should it improve the system?

What results would demonstrate improvement at the level of the whole system?

And what evidence would make us revise the hypothesis, or move the delegation boundary back?

[Give the audience time to read the four questions.]

An experiment should end in a decision: adopt, adapt, narrow the scope, investigate a remaining question, or stop. Laboratory mode is not an excuse to avoid committing. It is a way to make commitments supported by evidence.

And production gives us further evidence. If a material assumption changes, we reopen the relevant question. We do not have to pretend that every earlier decision has become invalid.

My conclusion is that AI has changed what we can delegate faster than we have settled how all the surrounding capabilities should fit together.

That is the search for a new balance in the SDLC, and in the products it creates.

The question I would leave with you is this: as your team delegates more cognitive work, is its capacity to understand, decide and recover keeping pace?

More capability still requires engineering responsibility.

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md

## 13. Continue the Conversation

**23:00–28:00 · PMDay source slide 15**

Thank you. I would be interested to hear where you see the balance shifting in your own systems.

[Leave this resource slide visible during questions. Allow five minutes for discussion. Two further minutes remain as reserve.]

### Preparation sources

- Source presentation: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md
- https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis
- https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture
