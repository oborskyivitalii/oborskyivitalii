# Contributing

This repository owns personal publications and distribution. Start with [AGENTS](AGENTS.md);
read [repository ownership](guides/REPOSITORIES.md) before coordinated edits.

## Issue intake and durable intent

Use an owning issue for every substantive research, publication, repository or tooling
task, including mechanical fixes. Find/create it before implementation; reuse existing
ownership. Triage incomplete contributor issues with a comment, not a duplicate or
replacement of their original message. Issues own intent; PRs/commits own execution.

A maintainer-provided issue and its active PR stay bound across planning, implementation,
fixes and model handoffs. Technical phases, larger diffs or another model do not create
another owner. Append overlapping instructions as dated scope decisions; create another
issue only on the maintainer's explicit request. For authorized consolidation, transfer
original ACs, accepted evidence and open gates before closing the former owner as
superseded. Link merged PRs as delivery history; continue execution in one active PR.

When asked to create an issue, recover the request and clarify outcome, reason, boundaries
and acceptance. Ask about unclear material choices before asserting agreement or starting
dependent implementation. Preserve the original request and label provisional assumptions
and open questions. Continue independent inspection/reversible preparation; do not ask
again about routine work or decisions already authorized.

Before creating an implementation PR or implementing, record:

- **Original intent:** problem/question, reason, initial request and public source or decision.
- **Owner and type:** research/publication/repository task, owning paths, ref and relevant IDs.
- **Scope:** outcome, exclusions, dependencies and unresolved choices.
- **Acceptance:** stable `AC01`, `AC02`, … IDs, observable pass conditions and required decisions.
- **Plan:** next step, linked PRs and full issue URLs for cross-repository work.

Before dependent implementation, obtain the separate requirements/acceptance
review defined in [independent quality agents](#independent-quality-agents).
Resolve material ambiguity against the original request; continue independent
inspection/preparation while a dependent decision remains open.

Compare execution with intent before editing, during review and before closure. Correct
divergence or append the maintainer's dated change with reason/decision reference; never
rewrite intent to excuse results. Issues do not replace canonical registries or decisions.

### Research-input report before integration

For new reports, expert discussion, hypotheses, test data, changed sources or material
critique, inspect the original input and all plausibly affected research/source uses.
Before substantive claim, protocol or framework edits, record a bounded issue report or
linked review artifact. Safe acquisition, inventory and provisional review may proceed.

The report contains:

1. Exact input/version, access limits and public/private provenance.
2. Methods/findings/limits, separate from repository interpretation.
3. Existing source/research IDs, corroboration/conflicts and complete searched use/impact
   scope, including a reasoned no-change result.
4. Affected claims/numbers/diagrams/maps/protocols/publications/framework owners, paths and treatment.
5. Recommendation: include, exclude, narrow, defer or request evidence.
6. Proposed ACs, open decisions and maintainer-review request.

Wait for required substantive-integration decisions; cite existing explicit authorization
for that exact treatment instead of asking again. Silence/time is not approval. Preserve
private correspondence boundaries; link public evidence or a bounded authorized summary.

### Implementation, review and closure

Before code/template/style/config changes follow [CODE-STYLE.md](guides/CODE-STYLE.md).
Include a style AC/subcondition and matching PR mapping: applicable rule IDs, owner paths,
bounded guard, relevant checks, review of unautomated rules and exact owned exceptions.
Guard success does not establish full architecture, formatting or performance compliance.

1. Give the PR one complete local `Refs #N` or full local issue URL line for policy selection;
   list other issues as dependencies. Every implementation commit, including final squash,
   cites `Refs #N`; cross-repository references use full URLs. Link the PR and exact commits
   from the issue as soon as available; refresh after rebase/squash. Prefer non-closing
   references while review/deployment/publication/sibling work remains; merging code alone
   does not justify `Closes`/`Fixes`.
2. Follow accepted scope and existing review, synchronization, validation and source/research
   procedures. Keep substantive PRs Draft during iteration; apply the mandatory
   [four independent quality-agent roles](#independent-quality-agents) and
   [independent subagent review after every iteration](#independent-review-after-every-iteration).
3. Run the mapped checks and reconcile human/live gates through
   [ACCEPTANCE.md](.github/ACCEPTANCE.md), including session-end issue checkbox updates.
4. Before readiness fetch current issue/PR/commits/reviews/CI and match evidence to the exact
   source. Report `AC | check | result | source/run | remaining decision`; link PR/CI logs.
   Tick only whole criteria with all checks/gates verified; clear invalidated ticks.
5. Summarize original intent versus outcome in both issue and PR: exact merged ref/edition,
   acceptance/review/decision evidence, deviations, remaining and cross-repository work.
   Separate merged commit from tested head; state `not merged`/`not deployed` when true.
6. Close completed only after accepted work is merged, checked and all applicable gates pass.
   Rejection/duplication/supersession/deferral needs explicit disposition and surviving links,
   never an implementation-complete claim. Keep umbrella issues open for required dependencies.

Draft, implemented, merged, reviewed, staged, published and deployed remain separate.
Green CI/issue closure cannot change scientific/source-verification state. Merge,
production activation, domain/DNS and public release retain their maintainer decisions.

### Diagnose failures before changing or rerunning

Apply this flow after any failed test, check or campaign, including infrastructure
and timeout failures. Retry controls and runbooks describe mechanics; they do not
authorize another attempt or a speculative fix.

1. Stop advancement and preserve the first failure: exact source/tree and dirty
   state, command/selector, environment, run/attempt, raw logs/artifacts, exit/signal,
   elapsed time, limits and complete or partial test accounting. Retain later
   failures separately; an eventual pass never erases them.
2. Inspect what failed and where: assertion/behavior, collection/setup, tool or
   environment, deadline/resources, or evidence/reporting. Check actual inputs,
   affected owners and comparison evidence before assigning a cause. Partial
   output, emitted passes and missing final accounting cannot establish success.
3. In the existing owning issue/review, distinguish observed facts, supported
   explanations, open hypotheses and unknowns. State the question to resolve;
   identify what observation would support or contradict each candidate cause.
4. Choose the smallest bounded diagnostic action that answers that question.
   Reuse retained evidence first; record scope, instrumentation/comparison,
   expected evidence and a stopping condition before new execution. A targeted
   diagnostic run needs a stated information gain and supplies no full acceptance.
5. Do not rerun an unchanged failed campaign, retry until green or patch by guess.
   If the cause is unresolved, continue diagnosis. Propose a fix only with evidence
   linking it to the failure, expected behavior/resource effect and preservation
   checks. Implement within authorized scope and obtain the applicable review.
6. Verify the resulting correction in the affected scope, then run required
   acceptance on the exact candidate. Record what changed and why verification
   is informative. Preserve scenarios, refusals, limits and gates; documentation
   or receipt-only changes cannot reset a failed source's eligibility.

## Acceptance criteria and session evidence

[ACCEPTANCE.md](.github/ACCEPTANCE.md) owns schema, runner, exact-source evidence and checkbox
rules. Give issue criteria stable headings such as `### AC01 — Exact snapshot identity` and
observable checkbox conditions before implementation. Preserve IDs/intent; append dated
scope decisions; never renumber or weaken criteria to fit convenient results. Map every AC
in `.github/acceptance/issue-N.json` to named reproducible checks, workflows and explicit
human gates; this does not replace intent. Define checks early; finish/refresh before handoff.
Tests exercise promised outcomes and meaningful failures; existence/keywords prove structure
only. Missing/partial/skipped/failed/unmapped/stale/wrong-source/pending is never a pass.
Update actual issue checkboxes alongside evidence; tables alone are insufficient.

## Review, analysis and model handoff

### Independent quality agents

For every coherent changed candidate/iteration, actually launch **four distinct
nonauthor subagents** and obtain completed independent results before advancing
or claiming readiness. Applies to T0–T4, material corrections and integration;
use waves when capacity is limited. One agent cannot fill multiple roles or
accept implementation/tests it authored. Findings/proposed treatments alone do
not make the reviewer the implementer.

[agents/reviewers/README.md](agents/reviewers/README.md) owns the common launch,
source-packet, isolation and execution-evidence contract. Every fresh reviewer
uses explicit `fork_turns="none"` or a verified equivalent; unsupported/unknown
isolation blocks dependent acceptance. No author conversation or current peer
verdicts before the first independent judgment. Shared instructions, permitted
sources, tools and filesystem are not an isolated security sandbox. Preserve
requested/accepted/provider-observed evidence separately.

| Independent role | Canonical detailed prompt |
| --- | --- |
| Requirements & Acceptance | [requirements-acceptance.md](agents/reviewers/requirements-acceptance.md) |
| Code / changed artifact | [code-review.md](agents/reviewers/code-review.md) |
| White-box QA | [white-box-qa.md](agents/reviewers/white-box-qa.md) |
| Exploratory / Interaction QA | [exploratory-interaction-qa.md](agents/reviewers/exploratory-interaction-qa.md) |

Each role receives original intent/ACs, applicable instructions, actual sources,
diff and test/evidence access plus exact prompt/packet/candidate identities.
It inspects independently; author summaries or peer conclusions cannot be its
sole basis. Reconcile contradictions with evidence, never majority vote.
Different agents/models alone do not guarantee uncorrelated errors.

All four roles launch even for small changes. The launched role may return
reasoned not applicable for a genuinely absent surface after inspection; this
avoids unnecessary dynamic tests, not the execution. Unavailable access/tools/
devices is not observed/blocked. Missing/pending/failed required roles and
unresolved blockers prevent advancement; read-only preparation may continue.
Preserve existing human/editorial/rights/device and optional diagnostic decisions.

#### Requirements and acceptance quality

Run Requirements before dependent implementation, after material intent/AC/oracle
changes, and on the completed candidate. The [role prompt](agents/reviewers/requirements-acceptance.md)
owns requirement quality, completeness and bidirectional acceptance traceability.
It cannot invent intent, weaken criteria or replace an owner decision.

#### White-box test design

The [White-box prompt](agents/reviewers/white-box-qa.md) owns structural risk/test
design, independent oracles, bounded actual checks and uncovered scope. Structural
inspection is not execution or measured coverage; no blanket percentage/tool mandate.

#### Exploratory and interaction testing

The [Exploratory prompt](agents/reviewers/exploratory-interaction-qa.md) owns
independent charter, actual operator/UI surface, bounded actions/observations and
regression proposals. Code reading cannot replace applicable interaction.

#### Findings, CI handoff and completion

Both QA roles allocate cases through the existing issue review artifact and
[test allocation owner](guides/SITE-CHECK-PROFILES.md#qa-findings-to-github-actions):
risk/AC → scenario and independent oracle → existing/proposed check → suite/
profile/workflow/job → actual source/result or manual/deferred disposition.
Requirements checks intent linkage; Code reviews implemented tests; QA checks
failure detection. QA-authored tests need a different nonauthor reviewer.
A new test needs an actual owner/selection route. Session agents produce review
results; Actions runs selected tests. No CI LLM service is implied.

Record separate role/execution, actual isolation launch parameters/acceptance,
common/role prompt and packet identities, inspected source/diff, independent
conclusion, findings/AC impact, checks, limits and dispositions in the existing
versioned review artifact. A launch or summary is not a completed result.
On correction perform actual affected re-review with source-bound delta inputs;
reuse only unchanged evidence. Preserve first conclusions and disclose later
reconciliation exposure. Follow the common contract for contaminated replacement
or a newly fresh review. Explain the failure mechanism and protected invariant.

Existing exemptions for unchanged read-only status, verbatim receipts and
deterministic metadata/RI refreshes remain; they cannot cover changed requirements,
implementation, test oracles or substantive claims. Missing independent execution
is an explicit gate, never fabricated approval.

### Independent review after every iteration

After **every completed work iteration**, obtain substantive independent review by a
**separate reviewer subagent** before advancing to the next implementation iteration,
declaring the iteration complete, marking ready or merging/promoting its result. This
applies to all T0–T4 work, including follow-up corrections and rebases/integration that
change the candidate. An iteration is a coherent proposed result/checkpoint, not each
command or keystroke. Read-only inspection/status with no changed candidate needs no
new review; retain the applicable prior review and identify its exact scope.

The reviewer must not have authored or implemented the changes under review. Give it
the original issue/ACs, applicable instructions, base/candidate identities and actual
diff/source/check evidence. It must inspect those materials independently, challenge
correctness, completeness, regressions and relevant architecture/evidence gaps, and
assess the result against intent. An implementer summary, green tests, a different
role/model name or a ceremonial approval does not establish independent review.

Record the iteration, subagent identity/role, inspected commit/tree or prepared-diff
identity, materials/checks and limits in the existing versioned review artifact. Each
finding needs severity, source evidence/location, implication, affected AC and an
action/disposition. A no-findings result still names the risks examined and limits.
The implementer resolves findings with evidenced fixes or reasoned dispositions;
unresolved blocking findings prevent advancement. The reviewer rechecks corrections
and materially disputed findings on the updated candidate, including affected
integration. Reuse unaffected reviewed scope rather than repeat the whole audit.

Record the re-review outcome and final reviewed identity before advancing. Verbatim
review receipts and deterministic RI/metadata refreshes do not recursively require
review of their own receipt: verify their provenance/byte identity and unchanged
meaning. Any substantive correction or changed meaning requires renewed independent
review. If a reviewer subagent is unavailable, record the missing gate and limits;
read-only triage/preparation may continue, but self-review cannot satisfy it or justify
readiness/completion. This rule adds no per-iteration maintainer approval; existing
human, editorial, rights, device, merge and release decisions remain separate.

Keep model work in the owning issue/PR; names are roles, not tasks/proof of independence.
Use `review/issue-N/YYYY-MM-DD-kind.md` (`analysis`, `review`, `handoff`) with
[REVIEW-TEMPLATE](review/REVIEW-TEMPLATE.md): exact inspected ref/materials, reviewer identity/role,
evidenced findings/AC impact, decisions, ordered
execution tasks and checks. Label draft/self/independent review and missing evidence honestly.
Give the issue one dated anchor, synopsis and exact Files Changed/commit-pinned file/section
link; link back from artifact/PR. Continue that route; cross-link distinct dated review passes.
Do not create competing AGENTS/chat-memory/issue handoffs. Execution reads issue/PR/artifact,
updates dispositions/evidence and returns outcomes to the anchor; recommendations never
silently change maintainer intent.

## Repository navigation and session memory

AGENTS is an enduring router (maximum 100 lines); MEMORY is a dated handoff (maximum 120),
never authoritative. At meaningful handoff/interruption/completion replace stale entries
with date/ref/evidence pointers, relevant decisions, active issue/PR, remaining acceptance
and next action. Retain `Snapshot`, `Decisions`, `Open work`, `Next session`, `Maintenance`.
Revalidate live state next session. Logs/experiments/checkpoints belong in their issue/PR or
review artifact; never put secrets/private correspondence/speculative completion in memory.

Every file/directory needs purpose, role and owner in [the path catalog](.github/repository-paths.json);
add/remove entries with path changes. Missing/unclassified/stale entries fail. Follow the
[RI contract](.github/REPOSITORY-INTELLIGENCE.md): rebuild/verify map and RI after indexed
source/memory changes; RI changes require current [RI/CI coverage](.github/ri-ci-map.json) and
coupling checks. Fresh context with stale coverage is insufficient. Searchable history is
evidence, not policy; canonical sources, live issues and Git/GitHub prevail.

## Publication and licensing checks

Preserve published editions, identities, URLs and third-party credits; visually inspect
HTML/PDF/deck exports against accepted editions. Keep drafts separate; link upstream owners.
Conceptual corrections need their own reviewed issue/PR. [Rights #7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7)
owns the selected [licensing map](LICENSING.md) and per-edition rights acceptance.
Original engineering, including site CSS/templates/rendering, is Apache-2.0;
original editorial text and non-brand diagrams are CC BY 4.0. Preserve portrait,
identity, third-party, historical-edition and upstream exceptions and notices.
Before contributing, identify the contribution's scope and its applicable
license; preserve provenance and do not submit material you cannot authorize.
Code contributions follow [LICENSE-CODE.md](LICENSE-CODE.md), original editorial
contributions follow [LICENSE-CONTENT.md](LICENSE-CONTENT.md), and separately
licensed imports retain their own terms. Disclose a different proposed license
before integration so the maintainer can review compatibility and attribution.
Local navigation/freshness checks do not grant publishing/deployment approval.
