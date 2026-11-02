# The Sum of Our Technology

*AI Changes Both Sides of Software Engineering*

Vitalii Oborskyi · Editorial draft R26 · 23 October 2026

![A solitary person stands before a narrow opening of light between monumental dark walls.](asset:cover)

An agent opens a pull request. The tests are green. The explanation is fluent. Another arrives before anyone has understood the first.

The dashboard calls this progress. The person handling the next incident has a different question.

**What if not?**

What if faster generation does not improve delivery—or leaves us unable to recover what we built? What if the person entrusted with the final decision cannot meaningfully make it?

My talk at UA Online PMDay 2026 Autumn connects two shifts: AI changes how we build software, and model judgment changes what software does at runtime. In both, delegation can outrun our ability to understand consequential behaviour and act when it fails. That capability belongs in the design, not in an oversight footnote.

Each “What if not?” turns a promise into a practical decision: what to test, what to constrain, and when a simpler approach is the better choice.

Identifying a bottleneck does not prove that its function can be removed. A better method must preserve the outcomes responsible operation requires.

[Slides (PDF) \[1\]](https://github.com/oborskyivitalii/oborskyivitalii/blob/4d5bcdb7c0b30bd7ba5926007fc24e3752242905/site/assets/publications/pmday-two-shifts/pmday-v35-deck-review.pdf) · [Recording (Ukrainian) \[2\]](https://youtu.be/xSgWjuGqC9I)

## When ideas outlive their authors

Writing let ideas survive their authors; printing carried them across borders and centuries. Research on printing and the Reformation [\[3\]](https://digitalcommons.chapman.edu/economics_articles/99/) connects that circulation with consequences beyond book production. Technology changes collective capability, not just task speed.

The title echoes Lem’s *Summa Technologiae* [\[31\]](https://english.lem.pl/works/essays/summa-technologiae): the subject is what living with our technology requires. LLMs extend delegation to interpretation, design, implementation and explanation. “Delegating thinking” describes that practical change, not consciousness.

Who builds software and what it does remain separate questions. An agent can build a conventional application; a human team can build a product that delegates decisions to a model.

> “The more technology takes care of us, the more carefully we must take care of it.”

— Stanisław Lem; translated from Polish for this article. Publisher-supplied excerpt: [\[4\]](https://instytutsprawobywatelskich.pl/stanislaw-lem-wiktor-jazniewicz-w-strachu-przed-antymateria-1381-cytatow/).

A demonstration shows that a capability can work. Engineering asks what its use requires, including when it fails.

## I. How We Build

### We accelerated a step. What did the system gain?

Cognition introduced Devin [\[5\]](https://cognition.com/blog/introducing-devin) in 2024 as the “first AI software engineer”. In March 2025, Dario Amodei forecast AI writing 90% of code within three to six months [\[6\]](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic), potentially essentially all within a year. Those dates have passed; the industry-wide share remains unverified. The Claude Code team reports about 90% for itself [\[12\]](https://claude.dev/blog/solving-code-review-at-anthropic/)—one vendor team, not independent corroboration. Generated code does not measure the whole engineering activity.

Delivery requires a chain:

**Intent → requirements → design → code → review → test → integration → deployment → operation.**

The September revision of *Writing Code vs. Shipping Code* [\[7\]](https://www.nber.org/papers/w35275), covering more than 500,000 GitHub developers, summarises cumulative estimates as **25.5× changed lines, 3.4× commits and 1.3× releases**. These observational, outcome-specific estimates are not a conversion funnel. Changed lines include additions and deletions, not necessarily retained code or human reading time.

The roughly 30% release gain matters. **Would you buy faster delivery if additional review, maintenance and recovery work cost more than the gain?** These multipliers cannot answer that for your team. Dependencies, duplication and deferred cleanup may bring costs later. DORA [\[8\]](https://dora.dev/insights/balancing-ai-tensions/) associates adoption with higher throughput—and greater instability.

The NBER authors’ weak-link model treats upstream output and downstream human effort as strong complements. It does not identify every team’s constraint. Agents reaching later stages may narrow the gap; experiments filtered out downstream need not accumulate as unfinished work. [\[7\]](https://www.nber.org/papers/w35275)

![Fixed-capacity delivery illustration: generation rises from eight to one hundred changes per week while review and integration remain at eight.](asset:pmday-slide-03)

Suppose a team generates, reviews and integrates eight comparable changes a week. Raise generation capacity to one hundred; keep the others fixed. Admit every change: delivery stays at eight; unfinished work grows by ninety-two a week. **We become dramatically better at producing unfinished work.** Control intake and the queue need not grow, but delivery remains capped. Spare downstream capacity would change the result.

*The Subprime Code Crisis* [\[9\]](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) is my synthesis of costs shifted into review, QA, architecture, maintenance and production. The danger is booking local gains before accounting for displaced work and risk.

### Making review a strength

Review deserves examination: Chen and Stratton [\[36\]](https://fion.ac/jellyfish.pdf), using data from 718 firms, estimate a 49% agent-associated increase in PR submission-to-merge time. That elapsed interval is not active reviewer effort; the evidence is observational.

Anthropic’s Code Review announcement [\[10\]](https://claude.com/resources/articles/code-review) addresses review pressure while leaving approval to people. Microsoft’s Jay Parikh [\[11\]](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) urges builders not to let review become a bottleneck. First-pass review moves to agents; people retain architectural oversight. He also warns that shorter shipping cycles leave less time to uncover bugs.

**What if not?**

Suppose defect detection improves, but incident investigation becomes harder. The approval button survives; the knowledge that gave approval meaning does not. **The queue has cleared. The ownership gap has not.**

A different method may preserve those functions—or improve them. Anthropic reports [\[12\]](https://claude.dev/blog/solving-code-review-at-anthropic/) that merged Claude Code PRs more than doubled while the reverted share fell over 40% between June and September 2026. Approvals bind to a specific commit; agents cannot fill required human approval slots. These internal results do not establish causality or portability, and a lower reverted share need not mean fewer reversions. The team also acknowledges gaps in formal shared-understanding processes.

### The scarce resource is understanding

Maintainers need context to change dependencies; teams need shared context to decide; operators need situational awareness to intervene; users need familiarity to benefit. These capabilities are connected, not interchangeable.

In a matched-control study, Agarwal, He and Vasilescu [\[13\]](https://arxiv.org/html/2601.13597v2) estimate increases in SonarQube’s Cognitive Complexity of 34.85% for agent-first repositories and 42.87% for those with prior AI-IDE exposure, controlling for lines of code. GitClear [\[14\]](https://www.gitclear.com/the_ai_code_quality_maintainability_gap) reports an 81% increase in its normalised duplicated-block measure from 2023. These are warning signals, not measurements of human comprehension or proof of AI causation.

Empirical work links Cognitive Complexity with comprehension time and perceived difficulty [\[32\]](https://arxiv.org/html/2007.12520v1), while another, smaller study finds limited predictive accuracy [\[33\]](https://link.springer.com/article/10.1007/s10664-023-10396-7). Interacting conditions can make a small change disproportionately hard to reason about. No score supplies a universal conversion to human effort.

Tools, abstractions and learning can raise comprehension capacity. The operating limit is reached when the team cannot explain critical behaviour or diagnose and contain failures in time.

Review also transfers knowledge and builds team awareness [\[15\]](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/). Automating defect detection does not automatically reproduce those outcomes. Bainbridge’s *Ironies of Automation* [\[16\]](https://doi.org/10.1016/0005-1098(83)90046-8) describes the older trap: automation leaves people difficult exceptions while reducing the practice needed to handle them.

**Responsibility does not disappear when understanding disappears.**

### Generated explanations and rewrites do not establish ownership

Ask an LLM to explain the code. Perhaps specifications and generated documentation become durable artefacts, implementation a replaceable detail.

**What if not?**

Its story can inherit the implementation’s mistake. Consider a team building an account-recovery assistant. In this hypothetical policy, sending a link to an already verified address is allowed; replacing that address with a newly supplied one requires separate identity proof. The agent treats both operations as equivalent. Generated code permits the replacement; tests built from the same interpretation expect success. Agreement is not independent verification.

Can a maintainer trace that change from policy through permissions and fallback, then diagnose a failed recovery? Ground explanations in exact revisions, observed traces and independently checked requirements. In Part II, the same mistake reaches production. **Understanding is a demonstrated capability, not a quantity of Markdown.**

Parikh’s “Code is disposable” [\[11\]](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) encourages rewriting bounded features whose specifications may endure. If implementation fails, the agent can supply a substitute.

**What if not?**

Customers cannot recover their accounts. Two proposed fixes fail. A rewrite looks tempting, but data and integrations cannot be discarded. Who stops retries, contains damage and verifies recovery?

**Code may be disposable. Your customers’ data, obligations and consequences are not.**

Rehearse recovery without the preferred agent: limit retries, preserve diagnostics and name an authorised owner. Measure containment, restoration and data integrity.

### Which understanding can we replace?

The strongest counterargument is not that these risks are imaginary. It is that a better architecture can make some existing forms of human understanding unnecessary.

Suppose a bounded component has an executable contract, independently grounded checks, reproducible traces and a tested fallback. Automated verification might provide stronger assurance than a hurried human reading every diff. Requiring that review anyway could add delay without useful control. Parikh’s durable-specification proposal [\[11\]](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/) and Anthropic’s layered workflow [\[12\]](https://claude.dev/blog/solving-code-review-at-anthropic/) point towards this possibility; they do not establish it for every system.

I would accept that substitution where the evidence supports it. The requirement is not to preserve manual review or intimate knowledge of every implementation. It is to preserve the functions they were meant to serve.

For the recovery assistant, maintainers might no longer need to read every generated branch. They would still need to justify the identity policy, know what the checks establish, recognise failures outside their coverage and operate the fallback. A contract cannot establish that its own assumptions match the customer’s needs.

The boundary is therefore functional, not a quota of human attention. Replace implementation-level inspection where verified mechanisms cover the relevant risks; retain or rebuild the judgment and intervention capability on which the remaining risks depend. If the new arrangement handles those risks better, adopt it.

Compare with the workflow actually operated, including its failures. Test smaller changes, intake limits and AI-assisted review against review age, rework, stability, recovery and full operating cost. Faster approval with slower recovery is not an unqualified improvement.

### More software is not more value

Suppose delivery now keeps up. More ideas reach customers sooner. We expect more value.

**What if not?**

Features multiply; the customer’s problem remains. Faster implementation does not establish that the underlying assumption was right.

Cheap experiments should help reject weak ideas. Kohavi and colleagues [\[17\]](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/) report that only about one-third of well-designed Microsoft experiments improved their intended metric. Deciding not to ship can be a successful outcome.

NBER [\[7\]](https://www.nber.org/papers/w35275) finds more new apps without commensurate growth in use. Its platform-specific proxies cannot distinguish constraints on quality and market fit from constraints on discovery and attention, or establish AI causation. METR’s survey [\[18\]](https://metr.org/blog/2026-05-11-ai-usage-survey/) reports median perceived speed gains of 3× and work-value gains of 1.4–2×; neither is a direct measurement.

METR’s early-2025 randomised trial [\[34\]](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) found experienced developers took 19% longer with AI but believed it made them 20% faster. Its February 2026 update [\[35\]](https://metr.org/blog/2026-02-24-uplift-update/) suggests selection increasingly understates speedup; acceleration may have grown, but its magnitude remains poorly established. Neither enthusiasm nor an older negative result settles the value of today’s workflow.

### The user’s capacity is part of the product

Grant that every feature is useful. The promise is realised customer value.

**What if not?**

A customer uses the reporting tool monthly; its workflow changes weekly. Each improvement makes sense. Each visit still requires relearning the job. Delivery has accelerated. Attention and learning time have not.

The comprehension problem has crossed the product boundary. Feature-fatigue research [\[19\]](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431) examines how capabilities attractive before use can undermine usability afterwards. Better defaults and repaired defects, by contrast, can remove work.

Measure task completion, adoption, time to benefit and support burden. Sequence changes people must learn; invest in accessibility, reliability and fewer steps.

**Competitive advantage is not how much change we deliver. It is how much better customers can work because of it.**

## II. What We Build

### When the product itself makes judgments

Model judgment now operates inside the product. An unsafe answer can become an operational event without a pull request.

The account-recovery assistant now interprets requests, retrieves guidance and proposes actions. Even without permission to change access, its guidance can influence someone who has it. Read-only does not mean consequence-free.

In my *Uncertainty Architecture* [\[20\]](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture), this is a *Thinking System* [\[21\]](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md): at least one consequential runtime responsibility depends partly on probabilistic model judgment. The definition describes implementation, not consciousness or safety.

The same question returns: can the surrounding system understand enough to judge, constrain and, where necessary, intervene? Six assumptions need testing—and continued justification after release.

### Enforce the boundary before delegation

Approved guidance and prompt prohibitions are meant to prevent invented steps, restricted disclosure and bypassed authorisation.

**What if not?**

An attacker plants instructions in retrieved material, posing as recovery policy and urging the assistant to skip identity checks. It treats source content as authority. This hypothetical attack follows Greshake and colleagues’ indirect prompt-injection mechanism [\[22\]](https://arxiv.org/abs/2302.12173v2).

A prompt prohibition is not an enforced boundary.

- Specify when to answer, clarify or escalate.
- Restrict retrieval and enforce permissions outside model judgment. Retrieved text cannot grant itself policy status.
- Test hostile inputs.

OWASP [\[23\]](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) likewise emphasises trust boundaries and least privilege, without promising immunity.

A deterministic production guard can inherit the development error, too: it permits a new recovery address without the separately required identity proof. It is independent of the runtime model but shares the mistake.

Have the policy owner resolve the rule against the authorised policy, then derive a forbidden case independently of the generated specification: a new address without that proof must be rejected. Exercise it through the actual access-change path. Changes to the guard and expected outcomes need separate approval; the development agent cannot revise the implementation, checks and guard and approve itself. This targets the specified error without establishing that the policy or test set is complete.

The diagram distinguishes a specified transition from a space of admissible responses. The team still has to decide which answers, clarifications and escalations are acceptable—and how that boundary will be checked.

![Requirements as boundaries: a specified transition compared with a space of admissible answers, clarifications and escalations.](asset:pmday-slide-09)

### From a passing score to a justified release

An illustrative evaluation uses **200 synthetic responses**:

| Observed outcome | Responses | Consequence to assess |
|---|---:|---|
| Acceptable | 196 | Meets the requirements under the evaluated conditions |
| Incorrect recovery instructions | 3 | May cause rework, lockout or unsafe action; severity remains to be assessed |
| Restricted information disclosed | 1 | Violates the example’s explicit prohibition |

Ninety-eight percent acceptable. The tempting conclusion: ready to take responsibility.

**What if not?**

The percentage is correct; the release decision is wrong. Under the rule prohibiting disclosure, the candidate fails. Other responses cannot cancel that consequence. Nor does pooling all failures as 2% make their severity equivalent. [\[24\]](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm)

Even 3,000 failure-free trials give only a one-sided 95% upper bound near 0.1%, assuming independent, representative sampling, reliable classification and stable conditions. [\[24\]](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm) A curated Golden Set need not represent production. Ordinary traffic also cannot establish resistance to an attacker choosing and adapting inputs. Test those threats separately.

Evaluation supplies evidence. Severity, coverage, uncertainty and enforceable limits determine what it justifies delegating.

### Test shared errors between models

A second model catches errors the generator misses. The combined path should be more dependable.

**What if not?**

Both accept the same misleading document and unsupported premise. Another invocation supplies a verdict, not independent evidence.

Knight and Leveson [\[25\]](https://doi.org/10.1109/TSE.1986.6312924) found correlated failures in independently implemented programs—a historical warning, not a measurement of modern LLMs. Test shared-error cases alongside valid outputs and verified failures. Measure missed errors and unnecessary blocks; enforce permissions separately. Timeout or uncertainty must trigger a defined wait, denial or fallback, not authorisation.

### Contain consequences before action

Telemetry alerts the owner; rollback reverses the change. We expect correction fast enough to contain consequences.

**What if not?**

The alert arrives after disclosure or after an employee follows unsafe instructions. Reverting the model erases neither. **Recovery worked; the assumption that it could contain this harm did not.**

- Enforce critical limits before action.
- Observe outputs, denials, fallbacks, reviewer queues and control health.
- Give an authorised owner the ability to narrow or stop operation and verify the result.

These operational responsibilities are reflected in NIST’s AI RMF [\[28\]](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/). If intervention cannot beat the consequence, restrict authority, redesign or reject the path.

### Design for real review capacity

“Human in the loop” promises qualified judgment and intervention before harm.

**What if not?**

The queue is unattended at night. At peak load, reviewers cannot keep up. A tired reviewer approves a polished summary without seeing the evidence. The path exists. The capacity does not.

Parasuraman and Manzey [\[26\]](https://doi.org/10.1177/0018720810376055) connect automation complacency to attention and competing tasks; experience is no guarantee. Bainbridge’s trap returns: difficult exceptions reach someone with diminished practice. [\[16\]](https://doi.org/10.1016/0005-1098(83)90046-8)

**If safe operation depends on human judgment, human capability is an architectural dependency.**

- Supply competence and access to evidence.
- Staff the review path and give reviewers the power to refuse.
- Measure queue wait plus decision time against the intervention window, including peak demand.

**An escalation policy cannot staff a queue.** Human response capacity is an operating cost and release condition.

Uncertainty Architecture’s control-loop anatomy [\[27\]](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/control-loop-anatomy.md) supplies my framing: a socio-technical stack, not software plus oversight.

The application denies account-access changes until a qualified person approves the specific action. Without a reviewer, it also suppresses model-generated recovery advice, displaying only a fixed, preapproved route to the verified recovery channel. The model cannot add steps or expose account-specific information. Case-specific recovery waits for the staffed process; waiting never becomes approval.

This bounded release provides routing, not account-specific recovery. Test the fixed output, isolation from account data and receiving capacity. A static page or simple rule could deliver the same approved route.

Compare the AI path with the process actually used and the simplest credible safe alternative under the same safety requirements. Use comparable cases, data and staffing, with the same task, identity requirements and definition of successful recovery. Does the model improve completed recoveries, completion time or unnecessary transfers enough to justify its full cost, including maintenance, support and oversight? Clicking a link is not recovery; gains from the shared downstream process do not establish the model’s contribution.

Set the required gain before the comparison. If it adds no useful benefit, choose the simpler path; if evidence is insufficient, retain the bounds. Better routing still does not authorise broader advice or action.

### Reassess authority when conditions change

Evidence, controls, human capacity and fallback support bounded operation. We can rely on that arrangement while its conditions hold.

**What if not?**

The model or provider routing changes, retrieval acquires conflicting material, or demand overwhelms reviewers. No application commit is required for yesterday’s evidence to stop describing today’s system.

Record supported model, data, permissions, workload and staffing conditions, with reassessment triggers. Turn incidents into regression cases; retest controls and capacity; revisit authority when its justification changes.

**Release authorises operation under particular conditions. It cannot make those conditions permanent.**

Read the loop as conditions for action: a proposal must pass the relevant checks and permissions, while observation covers delivery, denial and fallback. Correction needs an authorised owner and enough capacity to act; the fallback and the controls themselves also require testing.

![Production control loop: proposal, semantic checks, permissions, delivery, observation, intervention and safe fallback, with human authority and capacity.](asset:pmday-slide-12)

## III. What If Not?

The person handling the next incident needs more than a green dashboard: what changed, which evidence still applies, and how to stop the damage. Either kind of delegation can create irreversible harm.

**A working recovery mechanism is not the same as a recoverable consequence.**

Canary releases [\[29\]](https://sre.google/workbook/canarying-releases/) make exposure, evaluation and expansion explicit. Agile’s principles [\[30\]](https://agilemanifesto.org/principles.html) connect delivery with technical excellence and sustainable pace. Both support learning; neither makes every consequence reversible. “We will iterate” is not an answer to a consequence we cannot reverse.

Vendors owe adopters usable evidence, clear limits and visibility into consequential changes. Their resources and exposure may make an experiment tolerable that your customers cannot accept. **Their confidence is not your risk acceptance.**

> “One cannot simultaneously make discoveries and avoid taking responsibility for their consequences.”

— Stanisław Lem, quoted and translated by Bogna Konior; source and edition details: [\[31\]](https://existentialtech.antikythera.org/).

I want this to work. The obligation is to demonstrate that delegated capability and the capacity to operate it can grow together. For the recovery team, these **illustrative pilot limits** turn that obligation into decisions. Set criteria before collecting results; these are not measured findings or universal thresholds.

| Decision | Evidence and limit | Action if the limit fails |
| --- | --- | --- |
| Increase AI-assisted implementation | Predeclare meaningful improvement in median change-to-release time, tolerable deterioration in p90 review age and escaped defects per comparable change, and sufficient observations. Four weeks is an initial baseline, not a sample-size guarantee. Maintainer passes a recovery rehearsal. | Cap intake if limits fail. Continue the bounded pilot without expansion if evidence is insufficient. Generated lines do not justify expansion. |
| Permit account-specific advice or action | Verify access boundaries and approval before advice/action. Independently derived policy cases must reject the new-address error through the actual access-change path. Predefine populations, failure classes and justified risk limits. Report trial/failure counts; require one-sided 95% upper bounds to meet limits where sampling assumptions hold. Test adversarial coverage separately. | Prohibited disclosure, bypass or unapproved change rejects the candidate. Insufficient evidence keeps routing only; 0/3,000 is not a release rule. |
| Rely on a reviewer | Approval precedes case-specific advice/action. Exercise a ten-minute timeout at peak load: a service deadline, never permission for unsafe output. | Fixed, preapproved routing only; no account-specific information. |
| Recover control | Rehearse stopping, diagnostics and data-integrity checks. Observed prohibited disclosure or access change stops the broader path immediately. | Contain the incident; rollback cannot undo disclosure. |
| Expand the pilot | After four weeks, compare useful recovery completions, time, support load and full cost with the real process and simplest safe alternative under the same safety requirements. Require the predeclared useful gain and passing control tests. Reassess after model, retrieval, permission or staffing changes. | No useful gain: choose the simpler path. Insufficient evidence: retain bounds and extend observation. An uneventful month cannot establish rare-event safety; routing gains do not authorise broader advice/action. |

Faster implementation does not authorise broader runtime judgment. Fund and rehearse the controls on which each permission depends.

Evidence should change the adoption decision—including mine. Expand what works. Restrict or redesign what does not.

**You do not owe a vendor your organisation as an experiment. You owe your customers a system you can operate.**

“What if not?” becomes an acceptance criterion, a funded dependency and tested recovery. The sum of our technology includes the systems, institutions and human capabilities needed to live with what we delegate.

**Build for the future you believe in. Keep the ability to act if that belief is wrong.**

### Further reading

*The Subprime Code Crisis* [\[9\]](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis) and *Uncertainty Architecture* [\[20\]](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture) develop the two strands: my synthesis and developing architectural doctrine, not independent experimental confirmation of this essay.

## Sources & references

Numbered citations refer to the sources below. Source notes retain the evidence qualifications of the preceding draft. The discussion of substituting verified controls for implementation-level inspection, the hypothetical policy error and the proposed product comparison are architectural arguments, not new empirical findings.

1. Vitalii Oborskyi. AI Changes the Delivery System and the Product Itself. UA Online PMDay 2026 Autumn presentation. See the Slides (PDF) link at the beginning of this article.

    Figures reproduce full slides 3, 9 and 12 from the v35 presentation copy; the complete deck remains linked above. The event name follows the organiser’s announcement. Original slide credits and notices remain applicable. Scenarios and proposed countermeasures are not empirical results.

2. [Vitalii Oborskyi. UA Online PMDay 2026 Autumn talk recording (Ukrainian).](https://youtu.be/xSgWjuGqC9I)

3. [Jared Rubin. “Printing and Protestants: An Empirical Test of the Role of Printing in the Reformation.” Review of Economics and Statistics 96(2), 270–286 (2014).](https://digitalcommons.chapman.edu/economics_articles/99/)

4. [Stanisław Lem. Fantastyka i futurologia. Quotation selected in Wiktor Jaźniewicz’s compilation, W strachu przed antymaterią. 1381 cytatów (Wydawnictwo Literackie, 2024).](https://instytutsprawobywatelskich.pl/stanislaw-lem-wiktor-jazniewicz-w-strachu-przed-antymateria-1381-cytatow/)

    The Polish passage is reproduced under “TECHNOLOGIE JAKO TAKIE” in a publisher-supplied excerpt published by Instytut Spraw Obywatelskich on 22 July 2025, and attributed there to Fantastyka i futurologia—not Summa Technologiae. The English wording in the prologue is a translation prepared for this article from that Polish excerpt, not a quotation from a published English edition. No original-volume page number is supplied by the excerpt.

5. [Cognition. “Introducing Devin, the first AI software engineer” (12 March 2024).](https://cognition.com/blog/introducing-devin)

    The announcement also describes collaboration and human review; it is not a literal promise to replace all programmers immediately.

6. [Council on Foreign Relations. CEO Speaker Series: Dario Amodei (10 March 2025).](https://www.cfr.org/event/ceo-speaker-series-dario-amodei-anthropic)

    The 10 March 2025 forecast implied June–September 2025 for 90% and around March 2026 for essentially all code. Those dates have passed. This essay records the forecast, not a verified industry-wide share or a verdict on fulfilment. The team report in [\[12\]](https://claude.dev/blog/solving-code-review-at-anthropic/) comes from the same vendor and is not independent corroboration. The same discussion retains human specification, design, integration and security responsibilities.

7. [Mert Demirer, Leon Musolff and Liyuan Yang. “Writing Code vs. Shipping Code: Productivity Effects Across Generations of AI Coding Tools.” NBER Working Paper 35275 (2026; September revision).](https://www.nber.org/papers/w35275) · [Author-hosted full text](https://www.mertdemirer.com/Papers/Demirer_Writing_vs_shipping_code.pdf)

    Table 6, printed p. 33: weeks 21–30, pre-period-normalised, winsorised event-study estimates. Cumulative multipliers: lines 1 + (234.3 + 957.5 + 1254.9)/100 = 25.467; commits 3.441; releases 1.288 (no separate async estimate). Outcome samples differ. Figure 1 rounds these to 25.5, 3.4 and 1.3. Section 6.3 calibrates the weak-link model to the autocomplete pattern, giving substitution elasticity about 0.23; this is a model-dependent estimate, not a measured universal review constraint. Agents can intervene at later layers, so the gap may narrow. Section 6.2 describes experimentation filtered downstream; discarded work need not be valueless. Marketplace §§7.2.3–4, pp. 45–47 use first-three-month cohort proxies, not all installed software or welfare: iOS ratings are roughly stable, Android downloads rise modestly and Chrome downloads fall. The authors cannot distinguish supply-side quality/polish/market-fit constraints from consumer discovery/attention constraints. Neither is established as the sole mechanism. Observational working paper, not peer-reviewed. Section 4.1 combines public GitHub activity with confidential Microsoft GitHub Copilot usage/subscription data to date autocomplete and GitHub Sync adoption and validate asynchronous-agent signals. Demirer and Musolff disclose former Microsoft postdoctoral positions and current paid research consulting for Microsoft on the NBER page.

8. [Jessica Baolin and Nathen Harvey / DORA. “Balancing AI Tensions: Moving from AI Adoption to Effective SDLC Use” (10 March 2026; analyses the 2025 report).](https://dora.dev/insights/balancing-ai-tensions/)

    Survey associations, not randomised causal estimates.

9. [Vitalii Oborskyi. The Subprime Code Crisis — independent research synthesis.](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis)

    Author-led synthesis, not independent experimental validation.

10. [Anthropic. “Bringing Code Review to Claude Code” (9 March 2026).](https://claude.com/resources/articles/code-review)

    First-party product announcement and internal usage claims, not independent effectiveness evidence. It explicitly leaves PR approval to humans. Its March product description is distinct from the October team's risk-tiered workflow in [\[12\]](https://claude.dev/blog/solving-code-review-at-anthropic/).

11. [Jay Parikh / Microsoft. “Introducing Command Line, and the new rules for builders” (2 June 2026).](https://commandline.microsoft.com/new-rules-for-builders-agentic-ai-development-jay-parikh-build-2026/)

    First-party engineering guidance, explicitly provisional. The opening supplies the old-playbook instruction; sections 8–10 cover first-pass agent review with human architectural oversight, shorter bug-detection buffers and rewriting bounded features whose specifications may endure. The opening also discusses post-deployment learning, which is related to but not identical with consequential runtime judgment.

12. [Addy Osmani, Morgan Westlee Lunt and Qing Wang / Anthropic. “How the Claude Code team does code review” (15 October 2026).](https://claude.dev/blog/solving-code-review-at-anthropic/)

    First-party team account: about 90% Claude-authored code and the June–September comparison are self-reported, not an industry share or an external causal/portability study. Reverted share and absolute volume differ. Described practices include layered checks, risk-tiered approvals, staged release, approval bound to a commit and no substitution of an agent for a required human reviewer. Fixing one's own small/medium change is usually a team norm. The authors explicitly acknowledge gaps in formal shared-understanding processes and automatic tightening of approvals.

13. [Shyam Agarwal, Hao He and Bogdan Vasilescu. “AI IDEs or Autonomous Agents? Measuring the Impact of Coding Agents on Software Development.” arXiv:2601.13597v2 (27 January 2026).](https://arxiv.org/html/2601.13597v2)

    Table 2; §3.2 includes lines of code as a covariate. §4 notes limitations including isolated pre-treatment differences. Not a per-line or human-comprehension metric. Reported Cognitive Complexity estimates are 34.85% for agent-first repositories and 42.87% for those with prior AI-IDE exposure.

14. [GitClear. The AI Code Quality & Maintainability Gap (2026).](https://www.gitclear.com/the_ai_code_quality_maintainability_gap)

    Normalised duplicated-block measure versus the 2023 baseline, not a raw block count; observational vendor report. This is distinct from GitClear's short-window rewrite measure of code churn.

15. [Alberto Bacchelli and Christian Bird. “Expectations, Outcomes, and Challenges of Modern Code Review.” ICSE (2013), 712– 721.](https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/)

16. [Lisanne Bainbridge. “Ironies of Automation.” Automatica 19(6), 775–779 (1983).](https://doi.org/10.1016/0005-1098(83)90046-8) · [Full text (IFAC)](https://tc.ifac-control.org/4/1/newsletter/ironies-of-automation/@@download/file/Bainbridge1983_Automatica_Ironies%20of%20automation.pdf)

    Foundational human-factors analysis, not an LLM deployment trial.

17. [Ronny Kohavi, Thomas Crook, Roger Longbotham, Brian Frasca, Randy Henne, Juan Lavista Ferres and Tamir Melamed. “Online Experimentation at Microsoft” (2009).](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/) · [Full text](https://ai.stanford.edu/~ronnyk/ExPThinkWeek2009Public.pdf)

    §5–5.1. The one-third result describes the authors’ Microsoft experience, not a universal feature-success rate.

18. [Joel Becker / METR. “Measuring the Self-Reported Impact of Early-2026 AI on Technical Worker Productivity” (11 May 2026).](https://metr.org/blog/2026-05-11-ai-usage-survey/)

    Survey of 349 respondents; convenience-sample self-reports. Median perceived speed gain: 3×; work-value gains: 1.4–2×. The range reflects different question wording, not a confidence interval.

19. [Debora Viana Thompson, Rebecca W. Hamilton and Roland T. Rust. “Feature Fatigue: When Product Capabilities Become Too Much of a Good Thing.” Journal of Marketing Research 42(4), 431–442 (2005).](https://journals.sagepub.com/doi/abs/10.1509/jmkr.2005.42.4.431)

    Does not establish a human learning rate. The monthly-user/weekly-update example in this essay is hypothetical. Daily experts and occasional users may face different learning costs.

20. [Vitalii Oborskyi. Uncertainty Architecture — open doctrine and pattern language.](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture)

    Author-led doctrine and pattern language; not independent empirical validation.

21. [Uncertainty Architecture. “Uncertainty in the Controlled Object.”](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/uncertainty-in-the-controlled-object.md)

    Selected draft-normative definition. Consequential does not by itself mean high risk or production readiness.

22. [Kai Greshake, Sahar Abdelnabi, Shailesh Mishra, Christoph Endres, Thorsten Holz and Mario Fritz. “Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection.” arXiv:2302.12173v2 (5 May 2023).](https://arxiv.org/abs/2302.12173v2)

    Demonstrates attacks through retrieved, attacker-influenced content in tested LLM-integrated applications. The account- recovery example in this essay is hypothetical, not a reported incident; the paper does not establish an attack success rate for current models.

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

    The responsibility quotation in part III uses Konior’s own English translation. Her note 18 cites the Polish edition (Kraków: Wydawnictwo Literackie, 2020), p. 471. It was checked in her essay, not independently against that book page.

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

Oborskyi, V. (2026). *The Sum of Our Technology: AI Changes Both Sides of Software Engineering*. Editorial draft R26, 23 October 2026.

Unpublished author-review edition. Cite the revision; no DOI or final publication URL has been assigned.

```bibtex
@misc{oborskyi2026sumR26,
  author = {Oborskyi, Vitalii},
  year = {2026},
  title = {The Sum of Our Technology: AI Changes Both Sides of Software Engineering},
  note = {Editorial draft R26, 23 October 2026; unpublished}
}
```

Text © 2026 Vitalii Oborskyi. Presentation and third-party credits remain applicable. Cover 02: AI-generated editorial illustration selected by the author.

## Review provenance

**Maximiliano Armesto** suggested clarifying how policy mistakes propagate from development into production controls and comparing AI with simpler alternatives under the same safety requirements. Both recommendations informed **R24**.

**Pasquale Langella** contributed a critical reading and an AI-assisted alternative draft. Selected suggestions on reader orientation, navigation and practical responses were incorporated in **R25**.

Vitalii Oborskyi retains editorial responsibility.

## Revision history

23 October 2026:

- **R26:** Clickable citations; concise provenance and history.
- **R25:** Selected Pasquale editorial suggestions incorporated.
- **R24 addendum:** Pasquale's review and alternative draft recorded.
- **R24:** Maximiliano's policy-error and simpler-alternative feedback incorporated.
- **R23 addendum:** Maximiliano's feedback added to R23 (21 October).
