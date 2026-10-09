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
   procedures. Keep substantive PRs Draft during iteration; independently check where
   required, return corrections through the owning flow and record disagreement/missing review.
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
owns the unselected site-wide license; component code notices do not license all material.
Local navigation/freshness checks do not grant publishing/deployment approval.
