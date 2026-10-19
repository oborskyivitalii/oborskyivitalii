# DevCon Romania R3: concise English speaker notes

**AI Changes the Delivery System and the Product Itself**

Nine slides in total, including the opening and the final website QR.
Each numbered section contains the complete 3–5-sentence speaker core.
These are concise cues for explaining the visuals, not a twenty-minute verbatim
script. The planned allowance is 20 minutes, followed by 7 minutes for questions
and 3 minutes of reserve. Actual duration remains subject to a timed rehearsal.

| Slide | Explanation allowance | Cumulative window |
| --- | --- | --- |
| 1 | 1:00 | 00:00–01:00 |
| 2 | 2:30 | 01:00–03:30 |
| 3 | 4:00 | 03:30–07:30 |
| 4 | 2:00 | 07:30–09:30 |
| 5 | 2:00 | 09:30–11:30 |
| 6 | 3:00 | 11:30–14:30 |
| 7 | 3:00 | 14:30–17:30 |
| 8 | 2:00 | 17:30–19:30 |
| 9 | 0:30 | 19:30–20:00 |
| Questions, with slide 9 visible | 7:00 | 20:00–27:00 |
| Reserve | 3:00 | 27:00–30:00 |

## 01. AI Changes the Delivery System and the Product Itself

AI can now take on parts of interpretation and judgment. We use that capability while building software, and increasingly inside the products themselves. In both cases, the surrounding system has to adapt. My question is what happens when the capacity to generate or decide grows faster than our capacity to understand, verify and recover.

## 02. We Accelerated a Step. Not the System.

Imagine that a team can write, review and integrate eight comparable changes a week. AI raises generation to one hundred, while review and integration stay at eight. In this deliberately simple example, ninety-two changes join the queue each week. We accelerated one stage and exposed the downstream constraints. The effect on delivery depends on the capacity of the whole system.

## 03. The Evidence Is Already Messy

These studies measure different things, so their numbers do not form one productivity score. The NBER estimates show much larger increases in changed code than in releases. DORA reports perceived productivity gains alongside an association between AI adoption and delivery instability. The other reports add signals about perceived work value and changes in code structure. Together, they motivate a question about system balance, without proving one universal effect.

## 04. The New Scarcity Is Human Comprehension

Faster change becomes a problem when understanding cannot keep pace. A team may ship working code and still lack the expertise needed to explain a failure or restore service. The gap on this slide is a hypothesis we should test in our own systems. AI can help build that understanding, but we need evidence that the capability exists when required. Responsibility becomes operational only when people have sufficient context, authority and time to act.

## 05. We Are Searching for a New SDLC Equilibrium

That is why I think we are searching for a new SDLC equilibrium. The bottleneck will differ between teams, and it can move as capabilities change. Each proposed operating model makes assumptions about what can be delegated and how the remaining work gets done. We should treat those assumptions as hypotheses, with evidence that could support or overturn them. A useful approach in one setting does not establish a final recipe for every system.

## 06. When Software Starts Thinking

Now put model judgment inside the product itself. An IT assistant may decide whether to answer an access request, ask for clarification or escalate. I call it a Thinking System when consequential runtime responsibility depends partly on model judgment. We must define its permitted responsibility and evaluate whether its behaviour stays within that boundary. For example, helpful recovery advice cannot compensate for disclosing information the user is not allowed to see.

## 07. Delegation Changes the Sociotechnical System

Both shifts redistribute cognitive work across a sociotechnical system of people, processes and technology. During delivery, someone needs enough understanding to challenge changes and recover the service. During operation, someone needs evidence about behaviour and the authority to change what the product may do. Both depend on expertise and available time, supported by working feedback. Putting a human on a diagram achieves little if that person cannot act when the system needs them.

## 08. Engineering Rigor Moves — It Doesn’t Disappear

As we search for a new balance, I would ask four questions. Which imbalance does this approach address? By what mechanism should it improve the whole system? What evidence would demonstrate that improvement? What would make us revise the hypothesis or change what we delegate?

## 09. Continue the Conversation

Thank you for joining me. The QR code takes you to my website, where you can find my research, articles and talks. I would like to hear where your own team feels the balance shifting.

## Source references

Slides 1–8: [PMDay v35 source content](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/README.md).

Slide 1: [artwork provenance](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/artwork/PROVENANCE.md).

Slide 3: [source evidence and limitations](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/assets/presentations/pmday-2026/EVIDENCE.md), [NBER](https://www.nber.org/papers/w35275), [DORA](https://dora.dev/research/2025/dora-report/), [GitClear 2025](https://gitclear-public.s3.us-west-2.amazonaws.com/GitClear-AI-Copilot-Code-Quality-2025.pdf), [GitClear 2026](https://www.gitclear.com/blog/annual_ai_code_quality_research_2026_diff_digest_git_ai_diff_viewer), [METR](https://metr.org/blog/2026-05-11-ai-usage-survey/), [Agarwal](https://arxiv.org/html/2601.13597v2).

Slide 9: [website](https://vitaliioborskyi.ai/).
