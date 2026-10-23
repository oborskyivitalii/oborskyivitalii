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

Owner-authorized CI/controller repairs may follow [CI-MAINTENANCE](guides/CI-MAINTENANCE.md)
when the old controller blocks its repair. Baseline source/RI/owning checks and all
four roles remain required. Its exact-owner staging-only PR privilege is an explicit
administrative maintenance decision, not successful staging or production acceptance.

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

For every coherent changed candidate/iteration, the orchestrator must actually
launch **four distinct subagents** with the roles below and obtain their completed
results before advancing or claiming completion/readiness. This includes T0–T4
work and material corrections/integration. One agent cannot fill multiple roles
for the same candidate or substitute for the implementer's independent reviewers.
Run independent work in parallel where useful; queue roles in waves when capacity
is limited. Reuse a role-specific agent through an actual follow-up execution for
corrections; merely retaining an earlier approval is insufficient.

| Independent role | Question and required output |
| --- | --- |
| Requirements & Acceptance Reviewer | Are the requirements themselves adequate, and do the ACs express the intended outcome? Return requirement/AC defects, traceability, proposed treatments and remaining decisions. |
| Code Reviewer | Does the candidate satisfy intent with sound design and maintainable source? Review the actual diff, code and tests under the existing iteration protocol; for non-code work review the changed artifacts. |
| White-box QA | Which structural faults could escape the tests? Inspect affected implementation/design and existing coverage; return a bounded risk-to-test matrix and actual check results or explicit execution gaps. |
| Exploratory / Interaction QA | Does the real user/operator surface deliver the promised behavior? Independently design and execute a bounded charter; return actions, observations, evidence and proposed regression cases. |

Give each role the original request, live owning issue/ACs, instructions,
base/candidate identity and direct access to actual sources, tests and evidence.
Each independently inspects those inputs and forms its own findings before
reconciliation; another agent's conclusion or an implementer summary cannot be
its sole basis. The orchestrator reconciles findings and contradictions with
evidence, not majority vote. Distinct agents do not guarantee uncorrelated errors.

All four roles must launch even when the change is small. The launched role may
return a reasoned **not applicable** for a genuinely absent surface, naming the
inspected scope; this avoids unnecessary tests, not the independent execution.
For example, prose-only work may need no dynamic white-box or interaction tests.
Unavailable access, tooling or devices is **not observed/blocked**, not not
applicable. A pending, failed or unavailable required role and unresolved blocking
findings prevent advancement/readiness; independent read-only preparation may
continue. Preserve existing optional device/full-diagnostic policy: naming a role
does not create another mandatory device/browser matrix.

No role may independently accept requirements, production code or tests it authored
or implemented. Prefer findings, scenarios and proposed treatments for the
implementer. If QA implements tests, a different nonauthoring reviewer must inspect
those test changes; this does not replace QA's analysis of production behavior.
Ordinary findings/proposed treatments do not make a reviewer the implementer.
Replace a reviewer for any scope with an actual authorship conflict.

#### Requirements and acceptance quality

Run this role before dependent implementation, after material intent/requirement/AC
changes, and again on the completed candidate. Inspect both each requirement and
the set: necessity and rationale, clarity, one independently assessable obligation,
feasibility, verifiability and traceability; completeness, consistent terminology,
interfaces/dependencies and relevant failure/nonfunctional conditions. Separate
confirmed constraints from assumptions, open questions and proposed solutions.

For each AC identify preconditions/inputs, observable expected outcome and oracle,
relevant limits/units/tolerances, check method and explicit nonautomated decision.
Use stable AC IDs and independently verifiable subconditions where needed; Gherkin
is optional. Flag vague claims such as “works correctly” or “fast” without an
observable criterion. Check both directions: original intent → requirement/AC →
test or external gate → evidence, and whether evidence actually covers the AC.
Do not invent intent, introduce unapproved scope, or weaken ACs to fit the code.
The maintainer retains material decisions; agent review is not owner approval.

These questions are informed by [NASA's requirements checklist](https://www.nasa.gov/reference/appendix-c-how-to-write-a-good-requirement/).
Use it proportionally; this workflow does not claim certification or formal compliance.

#### White-box test design

Start from accepted intent and current design, then inspect the changed candidate
and existing test inventory. Identify relevant branches/condition outcomes, state
transitions, data flow and invariants; error/fallback paths, boundaries, invalid
inputs, ordering/cancellation, partial execution and cleanup where applicable.
Derive expected results from the accepted contract, not a copy of the implementation.
Separate structural analysis from executed tests and measured coverage; never claim
branch coverage from reading source alone or impose a blanket percentage target.

Propose the smallest useful cases at the appropriate level: unit/component,
integration, browser/CLI or retained manual observation. Reuse existing tests when
they detect the same risk. For critical guards, use a bounded fault injection or
negative case when needed to show that the assertion detects the intended fault;
do not mandate a mutation-testing tool or full matrix. Boundary values, input
partitions and decision tables can complement structural techniques without being
mislabelled as white-box coverage. See [ISTQB CTFL v4.0.1, sections 4.1–4.4](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).

#### Exploratory and interaction testing

Derive a charter from user/operator outcomes and risks independently of the
white-box agent's conclusions. Inspect the actual candidate surface: browser/UI
for interaction changes; CLI/API/RI queries and failures for tooling changes.
Use input partitions, boundary/state scenarios and experience-based exploration
where relevant. Test changed journeys, error/recovery paths, navigation, focus,
accessibility or perceptual behavior according to scope; do not mechanically run
all of them. Code inspection may inform diagnosis but cannot replace interaction.

Record candidate/artifact/origin, environment/capabilities, charter/time or case
bound, actions, expected and observed outcomes and retained evidence. Keep
**designed**, **executed/pass**, **executed/fail** and **not observed** distinct.
Browser automation or an agent's interactive observation is not a physical-device
or human usability observation. A manually triggered Actions job is still an
automated test. Preserve existing owner/editorial/rights/device decisions.

#### Findings, CI handoff and completion

Both QA agents contribute cases to the existing issue review artifact and
[test allocation owner](guides/SITE-CHECK-PROFILES.md#qa-findings-to-github-actions).
Record risk/AC → scenario and independent oracle → existing/proposed test →
suite/profile/workflow/job → actual result/source or manual/deferred disposition.
Requirements review checks the intent/AC linkage; code review inspects implemented
tests; QA checks that the selected cases detect the intended failures. A new test
needs an owner and actual selection route, not just a filename in the repository.
Agent executions occur in the development/review session; GitHub Actions executes
the resulting selected tests. No CI LLM agent/service is implied by these rules.

Record each role's separate identity/execution, inspected source/diff, scope,
findings/AC impact, actual checks, limits and dispositions in the existing versioned
review artifact. Preserve each independent conclusion; distinguish proposed work
from completed evidence. On corrections each role performs a delta assessment,
reuses only demonstrably unaffected evidence and rechecks affected scope; material
AC changes return to requirements review before dependent implementation. Resolve
blocking findings and contradictions before readiness, retaining remaining risks.
Summarize the failure mechanism and tested invariant so a maintainer can understand
what the checks protect; passing automation alone does not establish understanding.

The existing iteration definition and exemptions for unchanged read-only status,
verbatim receipts and deterministic RI/metadata refreshes apply. Those exemptions
cannot cover a changed requirement, implementation, test oracle or substantive claim.
Missing independent execution is an explicit gate, never fabricated approval.

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
