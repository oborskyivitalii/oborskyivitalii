# Short SDLC article — evidence and claim map R1

Owner: [issue169](https://github.com/oborskyivitalii/oborskyivitalii/issues/169).
Companions: [blueprint](2026-10-31-article-plan.md) and
[figures](2026-10-31-illustration-briefs.md).
Inspection date: 2026-10-31. This is a bounded publication-intake map, not a
replacement for the Subprime source registry or an approval of the article.

## Source set

Use four core primary sources and, if useful within the word budget, one paired
METR example. Keep each citation beside the supported claim. Do not turn the
short article into a bibliography tour. No source graphics are being reproduced.

### E1 — Review has functions beyond defect detection

Bacchelli and Bird, **Expectations, Outcomes, and Challenges of Modern Code
Review**, ICSE 2013.

Primary source: https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/

**Access:** the Microsoft Research HTML publication abstract was opened and read;
the full PDF and study instruments were not inspected in this increment.
**Supports:** the study reports knowledge transfer, team awareness and alternative
solutions alongside defect finding; code/change understanding is central.
**Limits:** research in Microsoft teams, not a current industry-wide AI experiment.
It does not prove that every manual review transfers knowledge or that removing
review necessarily causes production incidents.
**Use:** section3/F2; state the review functions, then label the extension to
ownership and incident recovery as the author's systems reasoning.

### E2 — A current practitioner response, including benefits and learning limits

Osmani, Lunt and Wang, **How the Claude Code team does code review**, 15 October 2026.

Primary source: https://claude.dev/blog/solving-code-review-at-anthropic/

**Access:** opened and read the workflow, human-attention, shared-context and
ownership sections. **Supports:** the team separates defect detection from shared
understanding, automates substantial review, retains risk-dependent human checks
and invests in recovery. It reports more than twice as many merged PRs and a
revert-share reduction exceeding40% from June to September. For shared learning,
it describes targeted explainers/visualizations and open channels, while saying
there is no formal process for that function.
**Limits:** a vendor team's self-report, not a controlled causal comparison or
representative industry sample; a changed revert share is not a count of all
incidents. Do not describe the team as having no knowledge mechanism or claim
its process proves degradation. These reported gains are real counterweight to
a blanket anti-automation reading.
**Use:** sections1/3/5. Optional figures belong to this article's author, not copies
of the vendor's diagrams. Prefer qualitative treatment to another block of numbers.

### E3 — Organizational context matters

DORA, **State of AI-assisted Software Development 2025**.

Primary source: https://dora.dev/research/2025/dora-report/

**Access:** official report landing page and its summary were read; report tables
and full quantitative methods were not inspected here.
**Supports:** DORA frames AI as an amplifier of organizational strengths and
weaknesses and emphasizes the underlying organizational system.
**Limits:** the landing-page summary alone supports no specific effect size,
causal estimate, burnout prevalence or universal industry diagnosis. Any numerical
use requires reading the actual report/methods/errata and reconciling the existing
Subprime record first. Do not confuse individual self-reports with delivery
stability or use an older DORA edition as if it were this report.
**Use:** sections1/5; short qualification, not a claim of DORA endorsement of the thesis.

### E4 — Coding activity and downstream output are different outcomes

Demirer, Musolff and Yang, **Writing Code vs. Shipping Code: Productivity Effects
Across Generations of AI Coding Tools**, NBER Working Paper35275; indexed record
identifies May2026 issue and September2026 revision.

Primary record: https://www.nber.org/papers/w35275
Canonical project brief: https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis/blob/main/evidence/primary/2026-writing-code-vs-shipping-code.md

**Access:** the NBER search-indexed abstract was retrieved, but direct opening
returned403; the full paper, tables and revision identity were not independently
read in this session. The live Subprime README was separately read.
**Supports provisionally:** the indexed abstract describes a matched event study
with larger gains in coding activity than downstream outputs, including positive
release effects. This is an appropriate source to investigate attenuation, not
proof that all remaining output is waste.
**Limits:** observational identification, outcome/sample differences and software
usage versus business value must survive into any final claim. The current
Subprime README and the indexed abstract use different reported estimands; do not
mix their percentages, time windows or tool generations. No numerical chart is
authorized from this intake. Resolve the exact primary version before drafting
a quantitative passage; otherwise use E1–E3 and retain this as further reading.
**Use:** sections4/5 only after that check; do not cite the brief as independent
corroboration of the paper it summarizes.

### E5 and E6 — Optional paired example: measure instead of assuming

E5, METR, **Measuring the Impact of Early-2025 AI on Experienced Open-Source
Developer Productivity**, 10 July2025:
https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/

E6, METR, **We are Changing our Developer Productivity Experiment Design**,
24 February2026:
https://metr.org/blog/2026-02-24-uplift-update/

**Access:** both primary HTML accounts were read, including methods/results,
generalization limits and the later selection-bias explanation.
**Supports:** in E5's bounded randomized setting, 16 experienced contributors
completed246 tasks with early-2025 tools; observed time increased19% despite
perceived acceleration. E6 says later selection/task-submission effects make its
new estimate unreliable and likely understate speedup; conversations suggest
improvement, without a reliable magnitude.
**Limits:** E5 is not an October2026 productivity estimate; E6 is not proof of a
particular current gain. Neither establishes aggregate SDLC degradation, burnout
or TCO growth. Their role is evidence about measurement and changing contexts.
**Use:** at most one compact sentence in section5 with both links, or omit both
if length requires it. Do not retain the negative number while dropping the update.

### R1 — Canonical research synthesis, not an additional independent study

The Subprime Code Crisis:
https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis

Read README blob `65a3c4bbc4cd96d95890ad4d68f5a004b67fe92b` through GitHub.
Relevant owner pointers present in that README:
- https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis/blob/main/report/appendices/mechanism-hypotheses.md
- https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis/blob/main/evidence/SOURCES.md
- https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis/blob/main/protocols/02_operational_defense.md

Those linked files are navigation for the drafting pass, not claimed fully read
here. R1 owns the delivery-risk synthesis, mechanisms, competing explanations and
source dispositions. This publication plan does not turn proposed practices into
validated universal fixes or change the upstream claim state.

## Claim-to-evidence contract

| ID | Intended statement | Type and support | Required boundary |
| --- | --- | --- | --- |
| C1 | AI adoption has pushed the SDLC out of balance at industry level | Author's explicit diagnosis/systems synthesis; motivated by E2/E3/E4 and R1 | Preserve as the central problem statement. No population prevalence, universal failure or source endorsement is implied. |
| C2 | License adoption alone does not redesign organizational capacity | Systems argument; E3 supplies relevant context | Treat as the problematic adoption strategy, not a claim about every company's behavior. |
| C3 | A flow chart is not the whole delivery system; small-team context differs from enterprise | Explanatory model; author reasoning | 3–5 is an illustrative team size, not an empirical safety threshold; neither size determines outcome. |
| C4 | Review supports knowledge transfer and team awareness as well as defect detection | Empirical E1; contemporary practice E2 | Ownership/recovery implications extend the argument; no proof that one particular ritual is indispensable. |
| C5 | Faster admitted work can exceed verification/integration/ownership capacity and create feedback | Conditional mechanism in R1; narrower signals in E2/E4 | Separate generated from admitted work. Test adaptation, spare capacity, changed task mix and alternative causes. |
| C6 | Sustained imbalance can harm people, product and ownership economics | Risk scenario, not measured universal effect | No invented burnout rate, inevitable incident or exponential TCO curve; costs and losses need local measurement. |
| C7 | Local improvement must be judged against end-to-end outcomes | Engineering proposal, consistent with E3/R1 | Useful outcomes, quality, sustainable workload, recoverability and total cost; not only code/PR/review counts. |
| C8 | A specific rebalancing intervention works | Hypothesis until tested | Define context, baseline, success/stop conditions and owner; retain evidence that would reject it. |

## Adversarial checks before manuscript acceptance

1. Could the claimed imbalance be explained by changed task difficulty, more
   exploration, release batching or pre-existing problems rather than AI alone?
2. Are positive releases, quality gains and successful automation represented,
   rather than only negative/attenuated findings?
3. Does the text preserve necessary functions without requiring every person to
   read every line or keep the full system in their head?
4. Does the model allow the same useful service at lower total cost to be a gain,
   and allow existing capacity/automation to absorb more work?
5. Does each link support the adjacent claim, rather than a different metric,
   year, population or causal conclusion?
6. Are every quote, percentage and graphic checked against the exact primary
   source before publication, including screenshot inspection for any PDF figure
   or table subsequently analyzed?

Open gaps: E4 full-primary access/version; any numerical DORA passage; direct
population evidence for the industry-level prevalence; measured burnout or
long-horizon TCO effects in the proposed mechanism. Keep them visible. No need
to fill the article with unsupported numbers just to make it look empirical.
