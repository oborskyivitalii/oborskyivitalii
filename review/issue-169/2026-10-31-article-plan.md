# The SDLC Is Out of Balance — article blueprint R1

Owner: [issue #169](https://github.com/oborskyivitalii/oborskyivitalii/issues/169).
Date: 2026-10-31. Status: proposed editorial plan; not a finished or published article.
Language: English. Author: Vitalii Oborskyi.

Companions: [evidence map](2026-10-31-evidence-map.md) and
[illustration briefs](2026-10-31-illustration-briefs.md).

## 1. Editorial contract

**Title: The SDLC Is Out of Balance**

**Subtitle: Why faster code and faster reviews do not add up to a healthier delivery system**

Audience: CTOs, VPs of Engineering, engineering/delivery leaders and architects
responsible for AI adoption across established products and multiple teams.
Purpose: expand the author's already published DevCon LinkedIn post into one
short, evidence-linked argument, not another conference announcement or a
compressed version of the separate long essay.

The reader should leave with a sharper problem statement and a way to investigate
it, not a claimed universal operating model or a shopping list of AI tools.

### Required opening problem statement

The first section must state this directly, before the evidence tour:

> My diagnosis: AI adoption has pushed the SDLC out of balance at industry level.
> We are accelerating cognitive work without proportionately redesigning the
> capacity, learning mechanisms, decision rights and accountability needed to
> turn its output into useful, supportable software.

Do not replace this with the weaker claim that code review may become a
bottleneck. Explain that the diagnosis concerns a widespread adoption/operating-
model mismatch, especially license-led enterprise rollouts; it is the author's
systems synthesis, not a measured percentage of affected firms or a claim that
every company is failing. The current upstream report deliberately preserves
this distinction. Resolve any stronger empirical wording against its source
owner before publication; do not silently change the research register.

"Balance" means that admitted work, verification, shared understanding, integration,
operations and improvement can sustain the required outcomes at acceptable cost.
It does not mean equal stage speeds, fully utilized people, no queues, or that
pre-AI organizations were uniformly balanced.

### Length and exclusions

- Target **1,500 body words**; body ceiling **1,650**. Captions and compact source
  list bring total visible content to no more than **1,900 words**.
- **Three explanatory figures. Final rendered article: 3–5 A4-equivalent pages,
  including title, figures, captions and references; five is a hard ceiling.**
- Aim for four to five pages at the existing readable print style. No cover-only
  page, contents page, appendix, oversized title, tiny footnotes or reduced type
  to evade the length constraint. Cut prose/figure detail before shrinking text.
- No history-of-AI chapter, universal SDLC recipe, large empirical literature
  review, agent-framework tutorial, recruitment material or private conversations.
- No full UA/Thinking Systems exposition: this article covers **How We Build**.
  One closing sentence may connect it to the talk's second problem space.
- Do not change PR79 / The Sum of Our Technology, PR110 / the DevCon speech,
  PR168 / orchestration, or accepted research in sibling repositories.

## 2. Section-by-section plan

| Section | Body words | Argument and reader outcome | Evidence / visual |
| --- | ---: | --- | --- |
| 1. The Problem Is Imbalance, Not a Queue | 180 | Open with the exact diagnosis. Moving from license promises to review bottlenecks improves the discussion but still risks a local problem statement. Explain the organizational adaptation gap; no claim that a census proves industry prevalence. | E2, E3; C1/C2 boundaries |
| 2. The Workstream Is Not the System | 200 | Show the full intent-to-outcome-to-feedback chain, then expose the capacity, learning, authority and dependency relationships it omits. Explain why a 3–5-person context-sharing team cannot automatically stand in for an enterprise. | F1; R1; C3 |
| 3. Code Review Does More Than Review Code | 300 | Develop one concrete example rather than expanding every SDLC node: checking changes, transferring knowledge and building team awareness. Connect the latter to ownership and recovery as a systems argument. Automation may replace practices but must preserve needed functions. | E1, E2; F2; C4 |
| 4. How Local Acceleration Creates System Debt | 270 | Explain uneven acceleration and the difference between generated work and admitted obligations. Follow the conditional overload/rework/learning loop into people, product and lifecycle economics. A shorter review queue is insufficient evidence of healthier delivery. | R1, E2, E4 (access caveat); F3; C5/C6 |
| 5. What the Evidence Establishes—and What It Does Not | 220 | A compact synthesis, not a source dump: review has multiple functions; AI outcomes depend on context; coding activity and downstream outcomes can diverge; genuine gains and adaptation exist. State what would weaken the diagnosis locally. | E1–E4; optional paired E5/E6 |
| 6. Rebalancing Is an Engineering Responsibility | 280 | Define a bounded investigation: owner with authority/resources, baseline and desired outcome, hypotheses, test conditions, system-level criteria and reassessment. Show one hypothesis as a question to test, not a proven fix. End with responsibility for the whole result. | Author's proposal; R1 |
| Closing / DevCon connection | 50 | One sentence linking to the upcoming talk's first problem space, then an invitation to test the diagnosis in the reader's setting. No repeated biography or sales pitch. | Event details rechecked before publication |
| **Total** | **1,500** | | |

### Section 2: preserve this complete workstream

Intent → requirements → design → code → review → testing → integration →
deployment → operations → user outcomes → business results → feedback to intent.

State that activities overlap and recur. This is an explanatory flow, not a
prescribed waterfall or an exhaustive map. Overlay learning, organizational
capacity, architectural dependencies, decision rights and economics.

### Section 3: the concrete explanatory scene

Use a clearly labeled illustrative situation, not an invented client case:
agent-assisted changes pass defect checks faster, but the team has not established
how another engineer acquires sufficient context to diagnose and recover a
critical component during an incident. Ask which mechanism now supplies that
capability. Do not assume every generated change loses understanding.

Shared ownership does not require every person to memorize every line or know
the entire system. Assess the collective, accessible capability needed for the
actual operating responsibilities, including AI-assisted explanation, exercises,
review, pairing, documentation, reversibility and escalation where applicable.
Neither manual reading nor a generated explanation is sufficient proof by itself.

Preferred takeaway: **We can replace a practice, but must still provide its
necessary functions.**

### Section 4: mechanism, not an inevitable catastrophe

Distinguish faster output from useful admitted work. More generated changes only
create more downstream obligations when they are accepted and need integration,
verification, ownership or support. Existing spare capacity, better automation,
smaller changes, reduced waste and selective admission may absorb the change.

The asymmetry may arise at requirements, design, implementation, testing or
operations; do not assert that every node is already measured as degraded.
People overload/burnout, product fragility/debt and rising ownership cost are
conditional risks in the proposed mechanism. Do not draw an exponential TCO
curve or describe aggregate negative ROI as an established industry statistic.

### Section 6: one bounded hypothesis and falsifiable outcomes

Illustrative question: could a changed combination of automation, change sizing
and explicit knowledge transfer increase useful delivery without degrading the
team's ability to explain and recover the changed system?

Define the context, comparison period, baseline/task mix and decision owner
before testing. Set actual local thresholds rather than inventing universal
percentages. Inspect useful accepted outcomes and lead time together with
quality, recovery capability, workload and total cost, including checking,
rework, learning and operations. A proxy such as PR count is not the whole result.

If comparable useful delivery and economics improve while quality and operating
capability remain adequate, that is a real gain; it weakens the need for an
additional intervention in that setting. The response may be automation or
removing work, not adding reviewers or another governance title.

Closing question: **Who owns the end-to-end result—and has the authority to
rebalance it?**

## 3. Layout and distribution

**Four-to-five-page layout target:** page 1 = title, diagnosis and workstream/F1;
page 2 = review example/F2; page 3 = imbalance mechanism/F3; page 4 = evidence,
rebalancing and ending; page 5 only if needed for readable references/overflow.
Actual pagination must be measured after rendering; this is a budget, not a
claim that a five-page PDF already exists.

Use one later canonical manuscript at the proposed ID `sdlc-out-of-balance` under
the existing `site/publications/` workflow. This plan does not create that record,
select an edition or add a public catalog entry.

| Destination | Planned treatment | Gate |
| --- | --- | --- |
| Website | Canonical complete article; descriptive inline source links, three local declared images with captions/alt, compact final sources. Use the existing reader/publisher. | Author/evidence/rights review, exact-source HTML and print inspection, existing content-release route |
| LinkedIn article | Same accepted argument and evidence; shorter paragraph breaks and uploaded figures; ordinary article headings rather than mathematical Unicode bold. Link the observed site edition. | Platform preview and author approval; manual publication; no posting in this task |
| Medium | Same accepted article; preserve links, captions and source distinctions. Configure the actual site canonical through the supported editor/import path and inspect the result. | Canonical remains pending until the site is live; manual publication |

Do not let the short feed-post character limit shorten the article. The existing
published post is the seed; no new promotional post is needed in this increment.
Do not invent a LinkedIn permalink, published date, canonical URL or platform
confirmation. Source figures should be original analytical diagrams, not vendor
screenshots or a copied/generated image assumed to be accurate.

## 4. Source and preparation receipt

Author input: the full English LinkedIn post and Ukrainian clarification supplied
in this conversation on 31 October 2026, especially the industry-level diagnosis,
enterprise/small-team distinction and requested 3–5-page scope. Public post URL
was not supplied. The input is a writing brief, not independent empirical evidence.

Inspected site baseline: commit `1f814f594e6a25fe07a5537ffcc814d182b27590`, tree
`6f95c7f8813f86479a5b7be6b20ae017d641b2ea`. Read README, AGENTS,
CONTRIBUTING, MEMORY, REPOSITORY-MAP, site/README, ARTICLE-WORKFLOW,
REPOSITORIES, ACCEPTANCE, SITE-CHECK-PROFILES and REVIEW-TEMPLATE.
`review/AGENTS.md` returned 404; the new issue directory has no prior nested rules.
Live open PR inspection found PR79/110/107/117/168; none owns this separate short
article. Open issue title search for balance returned no existing owner.

Canonical research intake: the current Subprime README (blob
`65a3c4bbc4cd96d95890ad4d68f5a004b67fe92b`) was read; it treats broad imbalance as
a research thesis with conditional mechanisms, positive findings and competing
explanations. This plan links that owner and does not update its scientific state.

Self-analysis/preparation by the writing assistant; **not independent review**.
The local public Git clone failed because `github.com` could not resolve from
the container. No working tree, native publisher, RI build, acceptance-policy
runner or full repository tests ran. The connector remains available for creating
and reading the bounded draft files. Do not weaken repository controls to hide
these limits or treat a Draft CI skip as a pass.

| Independent role | Actual execution | Disposition |
| --- | --- | --- |
| Requirements & Acceptance Reviewer | Not launched; no separate reviewer runner available in this session | Pending before dependent implementation |
| Code / Artifact Reviewer | Not launched | Pending; inspect the actual three-file candidate |
| White-box QA | Not launched | Pending; role assesses applicable structural/claim/link checks |
| Exploratory / Interaction QA | Not launched | Pending; later visual/editor/platform scope must be explicit |

No reviewer names or approvals are simulated. Planning can be retained for review;
readiness, merge and publication cannot be claimed. Acceptance-policy mapping,
RI refresh and any required memory handoff remain open; this bounded intake does
not overwrite the existing unrelated MEMORY checkpoint.

## 5. Next work and acceptance mapping

| Task | Owner/path and outcome | Criterion | Status |
| --- | --- | --- | --- |
| T01 | Author reviews this outline and illustration direction; independent requirements reviewer checks intent/ACs | AC01, AC03, AC05 | Pending |
| T02 | Verify remaining primary-source access, pin versions and resolve any research-owner delta | AC02 | Pending; current access in evidence map |
| T03 | Write one coherent 1,500-word manuscript; preserve the early diagnosis and countercase | AC01, AC02 | Not started |
| T04 | Produce three readable original figures from the briefs; declare caption/alt/rights and local PNGs through the existing publisher | AC03 | Not started |
| T05 | Render and inspect every page, links and mobile figures; keep full article at 3–5 pages | AC01, AC03, AC04 | Not started |
| T06 | Prepare website/LinkedIn/Medium candidates, complete independent checks and obtain publication decisions | AC04, AC05 | Not started |
| T07 | Verify this Draft PR and exact file links remotely, and add the receipt to issue169 | AC06 | Pending at authored checkpoint |

No acceptance box is marked complete by this blueprint. Observable file delivery,
source inspection, independent acceptance, rendered page count and publication
are separate results.
