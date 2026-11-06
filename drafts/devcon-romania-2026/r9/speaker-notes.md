# DevCon Romania 2026 — R9 speaker notes

Complete transcription of the nine attached native notes in R9, in delivery order. R13 spoken wording is preserved; delivery labels and reference-only navigation follow the new order. Architecture and project commitment are now slide 07; runtime validation is slide 08. R8 addenda remain identified as inherited material.

Current planning envelope: no more than 23 minutes for the talk plus 7 minutes for Q&A within the 30-minute slot. Timing has not been measured in an English rehearsal. Older timing estimates inside inherited reference notes are historical editorial estimates, not the R9 timing result.

Source R6/R13 positions in delivery order: 1, 2, 4, 3, 5, 6, 8, 7, 9.

## Slide 01 — Two problems

### Stage script

R13 STAGE SCRIPT | SLIDE 01 | 
Two problems

Good afternoon. I am Vitalii. My career spans embedded systems integration, testing and project management. Today I lead PMO and delivery. I built their foundations in my company from scratch.

I also stay hands-on with AI. I believe its impact could be comparable to writing and printing. Writing moved memory outside our heads. Ideas could outlive their authors and change institutions.

Now we delegate parts of thinking: interpretation, planning and choice. I do not mean consciousness.

Such a shift requires clear problem statements. Market narratives can obscure them: first developers will disappear; then code review is the bottleneck to remove.

I see two problems.

First, AI can unbalance the SDLC. Adoption means rebalancing the system.

Second, delegating decisions inside a product requires a control architecture. Complex, high-impact systems may need R&D and a socio-technical design before we can promise delivery.

In both cases, what must we remain able to understand and control?

### References and qualifications — not stage script

==== REFERENCE NOTES AND SOURCES (NOT STAGE SCRIPT) ====
AI changes two different engineering decisions; neither is resolved by a license purchase or a clever model demo.
For how we build, coding assistants can speed individual tasks, but licenses and brief training cannot guarantee ROI across review, integration, operation and team ownership.
For what we build, putting probabilistic model judgment into runtime can make difficult cognitive tasks newly feasible, yet novel consequential uses may require applied research into evidence, authority and recovery.
We need to measure useful user outcomes and full cost, and to budget competent responders where model decisions have consequences.
Throughout the talk I will ask one question: what if not?

Sources and visual provenance:
R38 manuscript: https://github.com/oborskyivitalii/oborskyivitalii/blob/b128ad27b23bc9d14a62b495c5c18b7ae537ab65/site/publications/pmday-ai-both-sides/manuscript.en.md
PMDay v35 source: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md
PMDay exact artwork (OpenAI imagegen, 2026-09-21): https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/artwork/ai-two-roles.png
Original image SHA-256: fee952d5eb696de3cdcd4609b42587545a56330577acdca8359b76a4d4b22de7
Source image is an illustrative two-scene artwork, not measured data or a control architecture.

## Slide 02 — The whole delivery system

### Stage script

R13 STAGE SCRIPT | SLIDE 02 | 
The whole delivery system

Let's use the theory of constraints.

Imagine each delivery step handles eight comparable tasks a month. Now coding produces one hundred. Review still handles eight. If we admit everything, ninety-two tasks wait.

To use the extra capacity, we must examine downstream steps, including operations, and upstream intent and design. This can involve the whole business, including marketing and sales. We can also limit incoming work. We do not have to use every unit of generation capacity.

Suppose we rebalance everything. Beyond operations is the user.

Someone opens our app twice a month. They can absorb eight changes. One hundred visible changes may overwhelm them, even if each is useful. Faster delivery could reduce retention and revenue.

We can release changes gradually. But the point remains: the system includes the user's ability to absorb them.

These steps also exchange knowledge, feedback and artifacts. Overload affects those connections too.

If that imbalance remains, overloaded downstream teams can miss errors and pass them on. Both the SDLC and its product can deteriorate: team burnout, less reliable delivery, poorer product quality and stability.

So, a supposedly safe AI rollout for a mid-sized or larger engineering organization: buy licenses, add a little training. What could possibly go wrong? The system-level problem was never recognized, named or assigned an owner.

### References and qualifications — not stage script

==== REFERENCE NOTES AND SOURCES (NOT STAGE SCRIPT) ====
The R8 example uses eight comparable changes per month. If AI increases generation to one hundred per month while review and integration remain at eight, admitting all changes adds ninety-two unfinished items per month. But if we cap intake, the queue does not have to grow; throughput still remains eight in this simplified example. If downstream automation increases verification and integration capacity, the system can genuinely deliver more. The test is whether those changes preserve defect detection, shared understanding and the ability to recover—not how much code the generator produces.

Sources:
https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md
https://github.com/oborskyivitalii/oborskyivitalii/blob/b128ad27b23bc9d14a62b495c5c18b7ae537ab65/site/publications/pmday-ai-both-sides/manuscript.en.md

Scope: hypothetical, fixed downstream capacity and all changes admitted. Not observed industry data.

## Slide 03 — Review and ownership

### Stage script

R13 STAGE SCRIPT | SLIDE 03 | 
Review and ownership

Review has two functions: a quality gate and a way for the team to understand the system.

Remove either without a replacement, and local speed can create future costs.

Understanding supports ownership: the ability and authority to change, diagnose and recover the system. Responsibility remains even when that ability weakens.

One experiment involved 69 participants, including fourteen professional developers. With AI, they completed more work but answered fewer questions correctly about their code. It measured short individual tasks, not whole-team ownership.

AI can also help people learn. We must check what our process actually does.

Imagine buying licenses and courses for a thousand engineers. That does not establish whether delivery can absorb more work.

Queues can grow. Review pressure can rise. Weaker gates can let more defects and debt reach production.

That creates a risk of technical default: responsibility for a system we can no longer maintain or recover at an acceptable cost. It is a risk to investigate, not a proven outcome for every organization.

### References and qualifications — not stage script

==== REFERENCE NOTES AND SOURCES (NOT STAGE SCRIPT) ====
Our research examples measured activity, merges, releases and structure, not how well a team understands its system.
The original PMDay thought experiment asks: can we generate faster—yes; can review keep pace—not at this assumed rate; and will we still understand the system in five years—we do not know.
The widening space on the diagram is a possible comprehension gap, not an observed law, and AI-supported verification may raise comprehension capacity too.
The practical risk is competent ownership: code, tests and explanations may share a wrong premise, and someone other than the generator must still be able to explain decisions, diagnose an incident and recover the service?
We are examining only code generation and review, while AI may affect intent, design, testing, integration, deployment and operation at different, unmeasured rates; that wider system brings us to the next question of what can replace manual inspection.

Martin-Lopez et al., IEEE TSE 2026: 69 participants (14 professionals, 47 students, 8 researchers), crossover tasks. Greater median task completeness; lower individual ability to answer questions about implemented code. Short controlled tasks do not establish team ownership or production recovery. https://doi.org/10.1109/TSE.2026.3679627

==== ADDED SYSTEMIC EXTENSION ====
We have zoomed in on code generation and review. Now zoom out: requirements, designs, tests and diagnoses also need to be understood, challenged and owned. The same mismatch can affect every node, so comprehension becomes a system constraint. This figure illustrates the broader asymmetry; it does not measure the gap at each stage.

The lower figure retains the broader effective human / organisational capacity label. Comprehension is one of those functions. Its curves do not measure comprehension, rank SDLC stages or estimate throughput.

Source: Vitalii Oborskyi, The SDLC Is Out of Balance: Beyond the AI Code Review Bottleneck, R4, 1 November 2026. https://github.com/oborskyivitalii/oborskyivitalii/blob/d2271a8beed6be4be2e2e2daee2a9434b3987238/site/publications/sdlc-out-of-balance/manuscript.en.md
Original author diagram, CC BY 4.0: https://github.com/oborskyivitalii/oborskyivitalii/blob/d2271a8beed6be4be2e2e2daee2a9434b3987238/site/assets/publications/sdlc-out-of-balance/asymmetry.png
Original figure caption: The shaded gap is an explanatory device, not a throughput estimate. A faster task can still produce a slower system.

==== ADDED NARROW AND SYSTEMIC REVIEW VIEWS ====
The author’s supplied infographic, Beyond “code faster”: why SDLC needs a systemic look in the age of AI, section 2, contrasts a narrow view of code review as a quality gate that slows delivery with a systemic view. Review also transfers knowledge about the system, builds shared understanding, strengthens ownership and accountability, improves operability (including recovery under pressure), and shapes architecture and long-term maintainability. The slide condenses these five functions into short labels while retaining all five. The arrow expands the scope; it does not mean verification is discarded or replaced by understanding.

These functions support operational ownership. Review alone does not guarantee them, and manual review need not remain unchanged if replacement mechanisms provide the necessary functions. The links to recovery, ownership and maintainability are systems implications, not measured causal effects of the code-review study. The original study identifies defect detection, knowledge transfer, team awareness and alternative solutions. Bacchelli & Bird (ICSE 2013): https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/

## Slide 04 — The evidence

### Stage script

R13 STAGE SCRIPT | SLIDE 04 | 
The evidence

These reports examine different populations and outcomes. They do not form one pipeline, and not all are independent of vendors.

NBER studied over half a million developers. Estimated commits reached about three point four times baseline; releases, one point three. Samples and tool coverage differ. Marketplace supply grew without a matching increase in overall usage. More code alone does not establish more user value.

Chen and Stratton studied 718 firms. Pull requests per active worker-month rose about 23 percent after agent adoption. Submission-to-merge time rose about 49 percent. That includes waiting.

Agarwal and colleagues studied 1,197 repositories, including controls. Code complexity increased. Warnings increased significantly in the agent-first group, but not the IDE-first group.

DORA links AI adoption with higher throughput and greater instability. It is a survey, not proof of causality.

GitClear analyzed 623 million changes. It reports fewer refactoring-related line moves and more duplicated blocks. These are quality signals, not proof that AI caused defects.

My conclusion: assess the whole delivery system, beyond coding activity.

### References and qualifications — not stage script

==== REFERENCE NOTES AND SOURCES (NOT STAGE SCRIPT) ====
NBER WP 35275, September 2026: 25.5× changed LOC (additions + deletions), 3.4× commits, 1.3× GitHub repository releases; >500K developers. Observational matched event study; different outcome samples/denominators; cumulative effects are not one conversion funnel; repository release is not user value. https://www.nber.org/papers/w35275
NBER marketplaces: four catalogs, only three early-use proxies. iOS new-app entry increased strongly; three-month iOS rating totals roughly flat; share of new iOS apps <10 ratings ~78%→87%; Android download/install proxies rose modestly; Chrome proxy fell on a trend predating agents. Proxies are not common consumer-value measures and are not linked causally to the matched GitHub adopters.
Chen & Stratton, August 2026: 718 firms; created PRs +22.8%; PR submission-to-merge elapsed duration +3.45 days over 7.03 baseline ≈+49.1%; tracked issue-completion estimate small and uncertain. Observational adoption, pretrends; elapsed calendar days include waiting/coordination, not active reviewer hours; more scrutiny is an alternative. https://fion.ac/jellyfish.pdf
DORA 2025: survey 4,867 respondents; >80% reported increased personal productivity, 59% positive code-quality impact. Higher AI adoption associated with higher software-delivery throughput and higher instability. Instability means change fail rate + deployment rework rate; association, not causal estimate, and ≈+0.10 SD is not +10% failures. https://dora.dev/research/2025/dora-report/
Agarwal et al., arXiv 2601.13597v2: 518 treated repositories plus 679 matched controls, combined across two OSS cohorts; cognitive complexity +34.85% agent-first / +42.87% prior-AI-IDE; static warnings +17.73% (AF, significant) / +19.00% (IF, not statistically significant); AF commits also +36.25%. Observational proxies, not defects, review labor or monetary maintenance debt. https://arxiv.org/abs/2601.13597v2
GitClear 2026, a code-analytics vendor: 623 million analyzed code changes (2023–2026). Reported moved-line share ~13% in 2023 to 3.8% YTD 2026, ~70% lower; duplicate blocks per million changed lines 40.3 in 2023 to 73.0 YTD 2026, +81%. Observational vendor-reported indicators; not direct defect counts or proof of AI causation. https://www.gitclear.com/the_ai_code_quality_maintainability_gap
Canonical visual/source basis: UA PMDay v35 slide 4 at commit 22639d311d5fb46a23f3d5cdd819800dbe1169d9; R38 manuscript pin b128ad27b23bc9d14a62b495c5c18b7ae537ab65. METR remains intentionally omitted from the visible short-deck evidence slide.

## Slide 05 — Finding a new balance

### Stage script

R13 STAGE SCRIPT | SLIDE 05 | 
Finding a new balance

AI adoption changes the system that earns your revenue. Licenses and courses are only inputs.

Across experiments, watch code quality, queues and recovery. Limit incoming work. Compare useful outcomes and full cost with a baseline.

Review agents may help. But generator and reviewer can share blind spots. And who learns how the system changed?

Generated documentation may help too. But a clear explanation can describe a poor decision. Who checks it against code, tests and actual behavior?

Even accurate documentation does not guarantee that the team can use it during an incident.

Disposable code also has limits: data, integrations and obligations can outlive an implementation.

Experiment, but preserve a recovery path when agents fail or become unavailable. Responsibility remains with us.

We may find different operating models rather than one universal AI-native SDLC. Domain, legacy, team, risk and cost will shape AI's role at each step.

### References and qualifications — not stage script

==== REFERENCE NOTES AND SOURCES (NOT STAGE SCRIPT) ====
The comprehension gap may not have one universal AI-native SDLC solution because systems, teams, risks and legacy constraints differ.
Buying AI coding licenses and offering short training may accelerate a local task, but they do not by themselves rebalance review, testing, integration, operations or team understanding, and they do not demonstrate system-level ROI.
These six candidate practices are hypotheses to compare against the present workflow using useful throughput, full cost, stability, ownership and recovery, rather than prescribing another universal toolchain.
Specification-first development, independent agentic review, bounded disposable code and generated documentation may help in different contexts, but their maintenance burdens and shared-error modes must be tested rather than assumed away.
The non-negotiable question is whether an accountable team can still explain, diagnose and restore production when the preferred AI cannot.

Expanded executive implications / source limitations:
Distinguish individual task productivity from useful end-to-end output, economic value and total cost of ownership. License price and onboarding effort are only a small part of implementation, review, security, test maintenance, documentation, rework, operating staffing and incident recovery. Use a comparison group or real baseline for admitted work, quality and delivered user outcomes. Short, low-risk AI-assisted tasks can show early returns; the claim is not that all adoption needs formal scientific R&D. For a meaningful change in an operating model, use time-boxed pilots with real business outcomes, stop criteria and cost accounting. There is no known universal minimum agent adoption share and no proof a single optimal AI-native SDLC will emerge. The World Bank greenfield +35–40% example concerns low-complexity AI-assisted work, NOT isolated SDD effectiveness. The other candidate levers are context-dependent, unproven as whole-SDLC fixes.

Sources:
https://www.nber.org/papers/w35275
https://dora.dev/insights/balancing-ai-tensions/
https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis
https://github.com/oborskyivitalii/oborskyivitalii/blob/b128ad27b23bc9d14a62b495c5c18b7ae537ab65/site/publications/pmday-ai-both-sides/manuscript.en.md

## Slide 06 — Decisions inside the product

### Stage script

R13 STAGE SCRIPT | SLIDE 06 | 
Decisions inside the product

Now the product itself. An LLM can choose a path to the user's goal at runtime.

For a deterministic component, the same inputs, state and version give the same result. With a model, we often consider a range of possible outputs. Each run reveals one outcome.

Traditional software also has uncertainty. Here, we delegate more decisions inside the application.

Requirements must describe acceptable outcomes and boundaries. For an account-recovery assistant: useful advice, recoverable mistakes, prohibited disclosures and actions requiring authorization.

A bug can be a plausible answer outside those boundaries. Testing needs repeated samples and interpretation of failures. One success proves little about reliability. One serious failure can block release.

Readiness may mean being ready for a feasibility study, not a full feature. Completing an increment and approving its operating scope are separate decisions.

For DevOps and SRE, availability is not enough. We must observe whether the system produces acceptable outcomes. Provider updates and changing context can alter behavior without a code change.

I call these thinking systems because we delegate cognitive work to them. They create new opportunities and new operating demands.

### References and qualifications — not stage script

==== REFERENCE NOTES AND SOURCES (NOT STAGE SCRIPT) ====
With fixed relevant state and rules, we simplify an expected result as y equals f of x; once consequential model judgment is delegated at runtime, y is better illustrated as drawn from possible outcomes conditioned on x and context.
Requirements move from specifying an expected path toward describing a much harder-to-enumerate space of acceptable behavior, forbidden consequences, permission boundaries and exceptions.
A bug can now be a semantically wrong or prohibited result despite healthy code, so we measure outcome frequencies and their actual consequences; even one critical disclosure may block a release regardless of an aggregate success rate.
Definition of Ready, where used, may require bounded discovery rather than pretending the behavioral space is known; we should test offline or in shadow first, and use canary exposure only where consequences are acceptably limited, while Definition of Done remains an Increment quality commitment rather than permanent permission to operate.
DevOps already addressed complex deployments, environments and ownership, but delegated model judgment moves additional uncertainty inside running products, enabling new Thinking Systems while requiring continued monitoring, intervention, restriction and potentially a redesign.

## Slide 07 — The control system

### Stage script

R13 STAGE SCRIPT | SLIDE 07 | 
The control system

Design the control architecture while framing the project. A diagram cannot guarantee reliability. We need evidence that the controls work.

Enforce sensitive data access and account permissions outside the model. Check text output too: a disclosure needs no tool call.

The loop needs evidence, interpretation, decision authority and timely action. Then verify that the intervention worked.

Include models, monitoring, human review and recovery in the cost. If the whole system is not viable, reduce scope or fund more R&D. Complex cases may need a control engineer or mathematician. Sometimes we should not proceed.

Where automation is insufficient, a trained human may be the best available control. Their skills, workload, information and authority become architectural dependencies. This is a socio-technical system.

For DevOps and SRE, monitor that human control at runtime. Beyond availability, track qualified coverage, queues, workload and response time. Check whether people have the information and authority to act, and whether interventions work. Fatigue is harder to measure directly; workload can signal strain.

If capacity falls, reduce autonomy, use a tested fallback or pause.

An operator can be online while their control is already failing.

For teams building their first agentic applications, a successful demo alone does not justify funding full development. We also need to understand the control architecture. This can reveal a different risk landscape, identify missing expertise and improve the budget forecast. The project's direction can change before the development budget is committed.

### References and qualifications — not stage script

==== REFERENCE NOTES AND SOURCES (NOT STAGE SCRIPT) ====
The engineered object is the entire consequential path, not only the model: proposals are untrusted, semantic checks are fallible, and sensitive effects require independently enforced policy and permission boundaries.
For account recovery, the assistant may guide a verified-address recovery but must not redirect credentials to a new unverified destination; rejected or unavailable paths fall back safely.
DevOps and SRE must observe real outcomes and control health, know who can stop or narrow authority, and verify that rerouting, manual fallback or another correction actually worked in time.
For novel consequential systems, do not commit to a typical implementation budget before testing feasibility and funding domain experts, evaluations, technical gates, staffed operations and a contingency for redesign or stopping.
This is the operational evidence needed for the distinct business and architectural conclusions on the final slide.

Expanded talk track / source qualifications:
The route is a simplified teaching architecture, not a validated universal blueprint. Model proposal and retrieved text are untrusted. A second LLM checking an answer is fallible and may share assumptions with the generator; independently grounded business-policy examples and forbidden-case tests are needed to evaluate meaning. The example lets an assistant send a recovery link to a previously verified address and prohibits changing a destination to a new unverified address without independent identity proof. A deterministic tool gate enforces user-data rights and approval on the complete authorized execution path, but the advice/answer path still needs relevant semantic and data-loss controls; read-only does not imply consequence-free. Controls must be measured for false allows, false denials, bypass, failure mode and recovery, not just logged as present. Feedback after an irreversible privacy leak cannot repair that leak; impose preventive permission control. Incident owner and service owner must have rights, knowledge, on-call time and available staffing; Product/BA/domain set the unacceptable results, QA and Dev produce meaningful evidence, Architect/SRE build enforceable boundaries, release/risk owner accepts scope, and delivery leadership funds the dependencies. These are duties, not mandated new job titles. Before project commitment, compare current workflow and simplest safe alternative with the AI path under matched outcomes, risks and full operating cost. For genuinely novel consequential agentic products, first fund a bounded feasibility stage: domain expertise, adverse-case evaluation, enforceable boundary verification, safe behavior monitoring and on-call capacity. A discovery result may be to narrow scope, remove autonomy, choose a deterministic alternative or stop; unknown feasibility should not be sold as a guaranteed fixed-scope delivery estimate. DevOps/SRE need actionable behavior/control signals, an explicit stop authority and tested manual fallback, with an incident owner who can verify the correction actually changed outcomes. Scope can be broad, bounded, changed or no AI. Transition to S08: test the operating hypothesis after launch. This control loop is the engineering test for whether consequential delegation is operationally viable, with human response capacity and full cost, not the final thesis itself. The final slide alone synthesizes HOW WE BUILD and WHAT WE BUILD into two research directions. Target 3:00, rehearse.

Sources:
https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md
https://github.com/oborskyivitalii/oborskyivitalii/blob/b128ad27b23bc9d14a62b495c5c18b7ae537ab65/site/publications/pmday-ai-both-sides/manuscript.en.md
https://www.nist.gov/publications/challenges-monitoring-deployed-ai-systems-center-ai-standards-and-innovation

R8 SPEAKER ADDENDUM
Treat this loop as a hypothesis to test for the particular use case. Sensors must detect relevant outcomes and control failures, and a human may contribute contextual observation or interpretation. The controller compares evidence with goals and limits and may rely on a human decision and authority. When either level relies on people, their availability, competence, workload, response time and authority become architectural dependencies that operations must observe. Constraints bound what actuators can do before consequences. Feedback must show whether the correction worked.
A successful happy-path demo is useful evidence of capability, but it does not establish that the proposed control loop is adequate or economical. Before committing full development, test detection, prevention or limitation of harm, and timely intervention against the business context, acceptable risk and full cost, including models, controls, staffed operations and recovery. If evidence is insufficient, fund bounded discovery. If control or cost is inadequate, narrow scope, redesign or decide no-go. The scope and decision depend on the use case.

## Slide 08 — The hypothesis stays alive

### Stage script

R13 STAGE SCRIPT | SLIDE 08 | 
The hypothesis stays alive

Imagine two hundred test responses: 196 acceptable, three wrong instructions and one privacy leak.

The score is 98 percent. But that disclosure is unacceptable in this project. We must redesign the affected path. The average cannot make that decision for us.

Suppose we fix it and release within an agreed scope. Users, context or the model can still change. Yesterday's evidence may no longer describe today's behavior.

Our claim that the system works remains a hypothesis in production.

Shadow operation and canaries can provide evidence where exposure is acceptable. They cannot replace preventive controls. Rollback cannot undo a disclosure.

We need monitoring and the authority to intervene for as long as people use the system.

### References and qualifications — not stage script

==== REFERENCE NOTES AND SOURCES (NOT STAGE SCRIPT) ====
Our 200-response example is 98% acceptable, but its single prohibited disclosure blocks that release path: a mean score cannot compensate for the severity of the exception.
We evaluate first, then shadow or expose a safe subset through a canary only when the prohibited consequences are prevented; a canary is a time-limited experiment, not a permit to test irreversible harm on users.
After the rollout reaches the wider population, the model, retrieval, provider routing, policies, traffic and human response capacity can change even when the application's source commit does not.
That is why DevOps needs to observe service health, actual useful or harmful behavior, and the functioning of control gates, escalations and fallback—not merely HTTP success and latency.
We continue only while evidence and authority remain justified, and we narrow, revert to safe guidance or stop when they do not; no rollback can undo an already disclosed secret.

Expanded talk track / source qualifications:
The example is invented (196 acceptable responses, three wrong recovery instructions, one prohibited disclosure; n=200); it is not measured production performance, a universal minimum evaluation set or an accepted error budget. One forbidden harm defeats authorization of that candidate for the relevant scope even when the other 199 outcomes look favorable; distinguish statistical frequency, confidence, harm severity, population, adversarial coverage and pre-action enforcement. A suitable account-recovery rule allows a recovery link to the already verified address, not to a new unverified address without independent identity proof. A read-only response still may change a user's consequential behavior. Real traffic may not be permissible to expose to unsafe model proposals: use independent case checking, negative tests, shadow-only evaluation, deterministic permission gates and live limited canary only where potential consequences are acceptable. Ordinary services never had permanent stability certificates; the specific increment here is semantic, business and permission consequences of model judgment and changing human capacity beyond code deployments. An HTTP 200 response is compatible with dangerous instructions. Monitor permitted behavior, refusals, prohibited disclosures, outcome quality and response time with privacy-aware versioned traces, without overclaiming total visibility. NIST AI 800-4 March 2026 documents open methodological challenges, not a universal finished monitoring architecture. Target 3:30; verify during rehearsal.

Sources:
https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md
https://github.com/oborskyivitalii/oborskyivitalii/blob/b128ad27b23bc9d14a62b495c5c18b7ae537ab65/site/publications/pmday-ai-both-sides/manuscript.en.md
https://sre.google/workbook/canarying-releases/
https://www.nist.gov/publications/challenges-monitoring-deployed-ai-systems-center-ai-standards-and-innovation

R8 DELIVERY ADDENDUM — RUNTIME CAPACITY
People are part of the control system. Monitor whether qualified responders are available, whether workloads and queues exceed their capacity, and whether they can intervene within the required time. Online status alone does not establish that capacity. Human fallback is available only when trained, authorised people can actually respond; otherwise narrow authority, use a tested alternative or stop.

## Slide 09 — Closing

### Stage script

R13 STAGE SCRIPT | SLIDE 09 | 
Closing

You may recognize this: AI spending rises, more code appears, but the business result is unclear. Or the demo works, but nobody knows who will intervene in production, how quickly, and at what cost.

These are the problems I research. Both repositories use systems thinking: examining the whole system and its relationships.

The Subprime Code Crisis looks at SDLC imbalance through the theory of constraints. It is an early research repository, still a little rough. If these or other problems with AI adoption affect your teams, I'd be glad to discuss them with you.

Uncertainty Architecture looks at thinking systems through control theory. This repository explores the control problem we discussed. If you have faced it, I'd be glad to hear about your experience too.

Both projects are public and developing. The QR code leads to my website, articles and contact details.

Come and talk to me afterwards.

Let's build the future. But keep asking: what if not? How will we know, and can we still act?

Thank you.

---

### References and qualifications — not stage script

==== REFERENCE NOTES AND SOURCES (NOT STAGE SCRIPT) ====
These two shifts change both business decisions and the daily responsibilities of the people who deliver and operate software.
For AI-assisted delivery, buying licenses and providing short training is not a system ROI strategy: rebalance the SDLC for the project, choose where agents genuinely help, and prove useful outcomes, full cost and real ownership.
For novel consequential Thinking Systems, model judgment can make new cognitive work feasible, but the business case may require feasibility research, specialist expertise, independent evidence, enforceable controls, staffed operation and a budget for redesign or stopping.
For DevOps and SREs the action is to monitor behavior, intervene and recover; for developers and architects to specify boundaries and prove capabilities; for CTOs and delivery leaders to fund only justified delegation and operating models.
The Subprime Code Crisis and Uncertainty Architecture are my two open research directions, linked from the website shown in the QR; I would welcome your questions.

Expanded English talk / evidence limits:
This closing slide is the **only overall conclusion**; S08 remains the technical case for conditional runtime authority after rollout, and S07 the actual enforcement, staffed controller and intervention architecture. On HOW WE BUILD, no known universal optimum has been established; the author expects a possible family of contextual operating models rather than an obligatory AI adoption percentage. A project may change use of agents in requirements, coding, reviews, tests, architecture or operations based on domain, scale, tech stack, legacy and criticality; outcomes and full cost determine fit. On WHAT WE BUILD, significant delegated cognitive decision-making can make formerly uneconomic, context-rich applications feasible; this is not proof every proposed Thinking System is feasible or safe. For unbounded novel high-consequence domains, understanding and operating a partly opaque probabilistic component *can* look like applied research and development in budget, specialist skill, evidence and iteration, even though mature ML operations and existing expertise remain useful. Do not assert scientific novelty for every AI app, universal inability to control models, or that no analogous system has been built before. The two research repositories have different copyright and licensing regimes; the website links to their current public research and sources. The QR encodes exactly https://vitaliioborskyi.ai/, a readable canonical URL; display it while answering questions. With this clearer, role-segmented ending, allow approximately **1:20–1:35** for S09. Full talk is likely around **20:50–21:05** at the previous 1:15 baseline; keep at least 1:55 headroom with the 7-minute Q&A before the firm 13:00 finish. Actually rehearse on presenter equipment. Actual timing still requires rehearsal.

Sources:
https://vitaliioborskyi.ai/
https://vitaliioborskyi.ai/research.html
https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis
https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture
https://github.com/oborskyivitalii/oborskyivitalii/blob/b128ad27b23bc9d14a62b495c5c18b7ae537ab65/site/publications/pmday-ai-both-sides/manuscript.en.md
