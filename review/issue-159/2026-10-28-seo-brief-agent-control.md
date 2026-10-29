# Issue 159 — agent authority and control answer brief, 28 October 2026

Owner: https://github.com/oborskyivitalii/oborskyivitalii/issues/159, B5 / AC05; future guide execution and publication: https://github.com/oborskyivitalii/oborskyivitalii/issues/11. Author: Terra, self-analysis; not an independent review or public copy. Prepared on base `af8a7b38d08f49c06e9257234a5ec458363a6275`, tree `5c9891eb4be54ce80c6315fec094d812506ba932`, while other authorized B5 edits are in progress. Exact candidate/PR and four independent reviewer results pending. No browser, CI, production, or new provider campaign performed. Research basis: corrected B4 `2026-10-28-seo-query-research.md`; demand and keyword difficulty unknown.

## Reader, decision and direct answer

Architects and AI/product leaders need to decide **which actions a model-mediated system may perform, what evidence justifies that authority, and how it stops when conditions fail**. Begin with a consequential action and its scope; assign an accountable owner, enforce permissions independently of the model, establish evidence appropriate to the risk, and test observation, intervention and fallback under actual operating conditions. When evidence or timely intervention is insufficient, narrow authority, abstain, escalate or use a simpler process. A passing evaluation score or a human approval box alone is not a safety guarantee.

Suggested title/H1: **How to Bound AI Agent Authority in Production**. Suggested description: **A decision record for agent permissions, evidence, human intervention and safe release under uncertainty.** Provisional compatible native path `articles/ai-agent-authority-and-control.html` is a provisional naming hypothesis compatible with the catalog edition URL contract, not an added route, canonical, date or publication commitment. An extensionless host entry may be considered later only if manifest-declared and tested. #11 must validate naming and collision against the accepted catalog and publisher.

## Source and overlap decision

Actual #2/#5/#79 records identify native R38 in PR79 head `5ee28e5f9833df8eb6da8bc5aaab8b5655bc92f2`, `site/publications/pmday-ai-both-sides/manuscript.en.md`, Git blob `917e9e9c0812b19475f6353f2dd4e4697a6ed274`; earlier immutable R38 at commit `b128ad27b23bc9d14a62b495c5c18b7ae537ab65` has recorded SHA-256 `132e78c8424691d2c1fac34c0e98e611009db499099a82341e4a30e082e0b375`. R42 prepared authoring SOURCE `The_Sum_of_Our_Technology_R42_2026-10-28_SOURCE.md`, [receipt](https://github.com/oborskyivitalii/oborskyivitalii/blob/5ee28e5f9833df8eb6da8bc5aaab8b5655bc92f2/review/issue-2/2026-10-27-r41-economic-criterion-and-editorial-polish.md#28-october-2026--r42-literary-revision-and-matching-review-files), [source](https://chatgpt.com/library?file_id=libfile_83ceea889c308191aca11757cb381425&account_id=personal), recorded SHA-256 `6bd5735c6bb2fe094a8aabc82a4793eb21e62326cc127602264980abe59ea0e7`, was read in full via Library; digest is the receipt's, not a locally recomputed byte check. R42 is prepared, not selected or published. The accepted edition must be chosen and rechecked before adaptation.

R38 and R42 Part II already treat boundaries before delegation, release evidence, shared model errors, containment, human capacity and reassessment. R42 Part III Decision B gives a hypothetical account-recovery pilot, including conditional authority, approval, stopping and comparison with a simpler alternative. This brief would **adapt** the ideas into an action-by-action decision record and a different illustrative scenario; it does not claim a novel doctrine. Link to the accepted PMDay edition after #2/#5 editorial, rights and publication gates. If that edition already meets the practical need, #11 can link or defer rather than publish a redundant guide. Do not reuse its figures or tables without specific rights review.

## Proposed structure and decision record

1. **Define the decision and consequence.** State the desired user outcome, affected party, reversible and irreversible consequences and simplest credible alternative. Separate a recommendation from an executed action.
2. **Inventory authority.** Record permitted inputs, tools, resources, permitted and prohibited actions; enforce access outside the model. Name the policy owner and operational decision owner.
3. **Build an evidence case.** Use independently derived policy cases, representative ordinary and adversarial cases, evidence provenance, limits and failure classes. Report denominators and uncertainty; correlated model checks are not automatically independent. A score cannot cancel a prohibited outcome.
4. **Test the operating path.** Exercise detection, escalation, staffing, stop, fallback and recovery including peak load, unavailable reviewer, changed model or retrieved material. Define response-time requirements before testing; rollback cannot undo every disclosure or consequence.
5. **Decide release and reassess.** Record authorized scope, conditions, residual uncertainty, owner, monitoring and review triggers. If evidence or capacity is missing, deny execution and choose a safe fallback or further feasibility work. Compare usefulness and full costs with the real process and the simplest safe alternative; safe operation alone does not prove value.

**Illustrative, hypothetical worked example — internal purchase request triage; no customer or observed results.** An assistant may classify a request and draft a recommendation. It cannot approve payment, change vendor details or place an order. Source documents may contain malicious or outdated instructions; they do not confer authority. If policy evidence is missing or conflicting, the system abstains and sends the case to an authorized buyer. If the buyer is unavailable, it holds the request and displays a fixed status; timeout is not approval.

| Action | Scope | Evidence required before release | Accountable owner | Stop / correction | Residual uncertainty |
| --- | --- | --- | --- | --- | --- |
| Classify and draft recommendation | Internal requests, approved data sources; no purchasing tool | Independently authored policy and injection cases; traceable source and uncertainty handling | Procurement process owner | Stop drafts on unsupported or conflicting evidence; route to buyer | Coverage of unseen policy variants and malicious material is incomplete |
| Buyer approves request | Named, authenticated buyer; case-specific evidence visible | Tested identity, approval binding, reviewer capacity and escalation at peak load | Procurement owner | No reviewer or timeout → hold and escalate; never auto-approve | Human error and wait times remain; monitor and rehearse |
| Place order | Separate authorized system after valid approval; no vendor changes | Enforced permission and audit trail, end-to-end negative tests, bounded reconciliation | Purchasing system owner | Deny unapproved action; stop access and reconcile any attempted order | An external order may not be reversible; incident response cannot erase every consequence |

This is a design proposal, not an evaluated system. The team must determine its own policy, evidence thresholds and safe fallback; do not imply that a specific control meets legal or operational requirements without review.

## Link, source and rights plan

- **Current inbound proposal:** `research.html#systems` is the primary current entry and links to UA; `index.html#systems` currently links to that section. Add a guide edge only after publication is accepted. No present native route is assumed.
- **Outbound author work:** catalog `publication-05`, English, 2026-08-30, *Uncertainty Architecture: Thinking Systems, When the Controlled Object Changes*: https://generativeai.pub/uncertainty-architecture-thinking-systems-when-the-controlled-object-changes-21275fe2f3db; its 2026-08-27 LinkedIn edition is https://www.linkedin.com/pulse/thinking-systems-when-controlled-object-changes-vitalii-oborskyi-6k4we, not verified body-equivalent. Current draft doctrine: https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/22639d311d5fb46a23f3d5cdd819800dbe1169d9/00-doctrine/control-loop-anatomy.md; research owner controls status, version and rights. It is an early-stage conceptual framework, not proof of deployed safety.
- **Primary context:** NIST AI RMF Core https://airc.nist.gov/airmf-resources/airmf/5-sec-core/ supplies broader govern/map/measure/manage vocabulary, not a certification; Google SRE canary chapter https://sre.google/workbook/canarying-releases/ supplies a generic bounded rollout method, not model-specific safety proof. Cite next to relevant bounded claims; recheck versions before release.
- **Rights/editorial:** external author edition, PMDay prose and media retain distinct rights; obtain edition-specific clearance before adapting. No external text is copied into this brief. Review example policy with a domain expert and an actual first reader, and distinguish conceptual controls from verified deployment.

## Review and acceptance

| Independent role | Result |
| --- | --- |
| Requirements & Acceptance | B5 preflight accepted per orchestrator; candidate review pending |
| Code/source review | Pending |
| White-box QA | Pending |
| Exploratory / interaction QA | Pending |

AC05: proposed implementation-ready brief only; no publication, rights acceptance or criterion completion. Editorial, first-reader, independent review and #11 publication after accepted PMDay through #2/#5 remain pending. No issue checkbox changed.
