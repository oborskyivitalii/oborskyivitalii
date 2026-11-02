# Issue 159 — delivery diagnosis answer brief, 28 October 2026

Owner: https://github.com/oborskyivitalii/oborskyivitalii/issues/159, B5 / AC05; future guide execution and publication: https://github.com/oborskyivitalii/oborskyivitalii/issues/11. Author: Terra, self-analysis; not an independent review or public copy. Prepared on base `af8a7b38d08f49c06e9257234a5ec458363a6275`, tree `5c9891eb4be54ce80c6315fec094d812506ba932`, with other authorized B5 edits in progress. Exact candidate/PR and four independent reviewer results pending. No browser, CI, production, or new provider campaign performed for this brief. Research basis: `2026-10-28-seo-query-research.md` corrected B4; demand and keyword difficulty unknown.

## Reader, decision and direct answer

Engineering and delivery leaders whose teams generate more changes but cannot see corresponding improvement in useful releases need to decide **where to investigate, what to change, and whether to expand AI-assisted development**. Map work from intent through operation, measure waiting and rework alongside useful outcomes, full costs and recovery capability, compare plausible explanations, and run a bounded intervention with an owner and a predeclared stop rule. Increased generated output alone does not establish ROI. An observed queue is a clue, not proof that review is the constraint; no AI, narrower use, or a different process may be the right outcome.

Suggested title/H1: **Why AI Coding Gains May Not Improve Software Delivery**. Suggested description: **A practical way to diagnose delivery flow, verification capacity and full costs before expanding AI coding tools.** Provisional compatible native path `articles/ai-coding-delivery-diagnosis.html` is a provisional naming hypothesis compatible with the catalog edition URL contract: no route, canonical, publication date or commitment is created. An extensionless host entry may be considered later only if manifest-declared and tested; #11 must validate naming and collision against the accepted catalog and publisher.

## Source and overlap decision

Actual current #2/#5/#79 records identify native R38 selection in PR79 head `5ee28e5f9833df8eb6da8bc5aaab8b5655bc92f2`, `site/publications/pmday-ai-both-sides/manuscript.en.md`, Git blob `917e9e9c0812b19475f6353f2dd4e4697a6ed274`; the earlier immutable R38 source at commit `b128ad27b23bc9d14a62b495c5c18b7ae537ab65` is recorded SHA-256 `132e78c8424691d2c1fac34c0e98e611009db499099a82341e4a30e082e0b375`. R42 prepared authoring SOURCE `The_Sum_of_Our_Technology_R42_2026-10-28_SOURCE.md`, [receipt](https://github.com/oborskyivitalii/oborskyivitalii/blob/5ee28e5f9833df8eb6da8bc5aaab8b5655bc92f2/review/issue-2/2026-10-27-r41-economic-criterion-and-editorial-polish.md#28-october-2026--r42-literary-revision-and-matching-review-files), [source](https://chatgpt.com/library?file_id=libfile_83ceea889c308191aca11757cb381425&account_id=personal), recorded SHA-256 `6bd5735c6bb2fe094a8aabc82a4793eb21e62326cc127602264980abe59ea0e7`, was read in full via Library. This is the receipt's digest, not a locally recomputed byte check. R42 is prepared, not selected or published; R38 native selection and R42 are distinct. Choose and review the eventual accepted edition before adapting.

R38 and R42 Part I already discuss fixed-capacity queues, review as understanding, explanation verification, recovery and context-dependent operating models. R42 Part III Decision A already compares useful releases, review age, escaped defects, recovery and full transition/ongoing cost against a predeclared economic criterion. This brief would **adapt** those arguments into a compact diagnostic worksheet with competing explanations and explicit owners. It is not new research. Link to the accepted PMDay edition once #2/#5 finish their editorial, rights and publication gates; do not duplicate its tables or illustrations without edition-specific review. If the accepted essay already supplies this practical worksheet adequately, #11 may link to it or defer this guide instead.

## Proposed content structure and artifact

1. **Start with the decision.** Set a bounded pilot and its owner; document whether the goal is reduced lead time, better reliability, cost reduction or user value. Define comparable work and what would count as a useful outcome. Distinguish perception and task speed from shipped value.
2. **Draw the flow.** List intake, design, implementation, review, testing, integration, release and operation; mark waiting and handoffs. Inspect both age of unfinished work and completed work, with change size and risk. Do not claim a single constraint without evidence.
3. **Use the worksheet below.** Establish a baseline and date range; select one small intervention with a comparison and an owner. Guard against unrelated changes, seasonality and different work mix. Record missing data and changes to measurement.
4. **Preserve verification and ownership.** Ask who can explain critical decisions, investigate an incident and operate recovery; independently grounded requirements/checks may substitute for some manual inspection only when their coverage is demonstrated. Rehearse recovery.
5. **Decide, do not just report.** Predeclare acceptable ranges for release time, quality, recovery and full costs, including licenses, transition, review and maintenance; assess useful outcomes against baseline. Expand only when the agreed economic and risk conditions are met; cap intake, revise, stop or retain the baseline if they fail. Insufficient evidence means remain bounded, not success or failure by default.

**Illustrative worksheet, invented scenario; no measured customer or actual team:**

| Symptom | Measure | Competing explanations | Bounded experiment | Accountable owner |
| --- | --- | --- | --- | --- |
| More changes waiting for review | Review age distribution, arrivals/completions and change size across comparable work | Reviewer capacity; larger/riskier changes; external dependencies; batch timing | Limit intake for one team and compare queue age and completion with its prior comparable window; retain quality and rework measures | Delivery lead |
| Faster approvals but difficult incident diagnosis | Recovery rehearsal time, ability to explain critical behavior, escaped defects | Lost context; incomplete runbooks; unrelated system complexity | Rehearse a known synthetic failure with current versus improved decision records; assess result without assuming causality | Engineering owner |
| Release speed improves but costs rise | Useful outcomes and full delivery cost, including transition and ongoing support | Changed work mix; license cost; shifted review or maintenance effort | Compare like-for-like pilot and baseline costs; define economic criterion before observing result | Delivery and finance decision owner |

Use fictional labels and no invented measured results. Record observation window, limitations, stopping decision and alternative explanations. Example thresholds are organization decisions, not universal guarantees.

## Link, source and rights plan

- **Current inbound proposal:** `research.html#delivery` is the primary existing destination and already links to the Subprime repository; `index.html#delivery` is a Home research card that links to it. Add an edge to the future guide only after it exists and is accepted. Preserve current routes.
- **Outbound author work:** catalog `publication-02`, English, 2026-06-12, *AI, the Externalization of Reasoning, and the Verification Crisis*: https://medium.com/agileinsider/ai-the-externalization-of-reasoning-and-the-verification-crisis-4f5046f9f0d0; catalog `publication-28`, English, 2026-01-02, *The AI Cost-Cutting Fallacy*: https://www.linkedin.com/pulse/ai-cost-cutting-fallacy-why-doing-more-less-breaking-teams-oborskyi-cxuif/. Bodies were available during B4 retrieval, platform access may change; alternate editions are not assumed equivalent. Link to https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis as the author’s research synthesis, not independent validation.
- **Evidence:** https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ is an early-2025 RCT in a specific experienced open-source setting, not a universal current productivity result; https://doi.org/10.4230/LIPIcs.ESEM.2026.93 describes context-confounded associations, not proof of a universal review bottleneck. Cite primary evidence next to bounded claims and recheck exact versions before release.
- **Rights/editorial:** external article, PMDay text and media retain their own rights; obtain edition-specific clearance for any adaptation or reuse. No external text is copied in this brief. Clarify synthetic status, full-cost assumptions and causality at human first-reader and editorial review. Source checks do not validate useful advice.

## Review and acceptance

| Independent role | Result |
| --- | --- |
| Requirements & Acceptance | B5 preflight accepted per orchestrator; candidate review pending |
| Code/source review | Pending |
| White-box QA | Pending |
| Exploratory / interaction QA | Pending |

AC05: this is a proposed implementation-ready brief, not accepted publication or completed criterion. Author/rights, first-reader, independent review and #11 publication after accepted PMDay under #2/#5 remain pending. No issue checkbox changed.
