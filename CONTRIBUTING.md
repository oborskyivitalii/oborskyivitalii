# Contributing

This repository owns personal publications and distribution. Read [AGENTS](AGENTS.md) and [repository ownership](guides/REPOSITORIES.md) before coordinated edits.

## Issue intake and durable intent

Use an issue as the durable record for each substantive research, publication,
repository-management or tooling task, including mechanical fixes. Find or create
the owning issue before implementation; reuse one when it already owns the input.
Incoming contributor issues may be incomplete:
triage them with a comment rather than requiring a duplicate or rewriting the
contributor's original message.

The issue records the intent; PRs and their commits record its execution. When
asked to create an issue, recover the request and clarify the intended outcome,
reason, boundaries and acceptance with the maintainer. If a material choice is
unclear, ask focused questions before presenting an agreed intent or starting
dependent implementation. An intake issue may preserve the original request with
clearly marked open questions; assumptions are provisional, not decisions.
Continue independent inspection or reversible preparation where useful. Do not
ask again about decisions or routine work already authorized.

Compare each implementation scope with the owning issue before editing, during
PR review and before closure. Explain which acceptance checks the PR/commits
satisfy and which remain open. If execution diverges, correct it or record the
maintainer's dated intent change; do not rewrite the issue to excuse the result.

Before implementation, record:

- **Original intent:** the question/problem, why it matters, initial request and
  public source or maintainer decision.
- **Owner and type:** research input, publication or repository task; exact owning
  paths, current ref, source/research IDs where applicable.
- **Scope:** expected outcome, exclusions, dependencies, unresolved choices.
- **Acceptance:** stable criterion IDs (`AC01`, `AC02`, ...), observable pass
  conditions and required editorial, independent or human decisions. Define
  these before making the PR or doing implementation; they drive its scope.
- **Plan:** next step and linked PRs; use full issue URLs for other repositories.

Preserve the original intent. Append scope changes with date, reason and decision
reference; never silently rewrite the goal to fit the result. An issue is a task
record, not a replacement for a canonical source registry, research register,
provenance note or framework decision.

### Research-input report before integration

For a new report, expert discussion, hypothesis, test data, changed source or
material critique, first inspect the original input and all plausibly affected
existing research and source uses. Produce a bounded report in an issue comment
or linked review artifact **before substantive claim, protocol or framework
edits**. Safe source acquisition, inventory and provisional review work may
proceed to prepare that report.

The report must contain:

1. exact input/version, access limitations and public/private provenance;
2. source methods/findings/limitations, separated from repository interpretation;
3. existing source/research IDs, conflicting or corroborating evidence and the
   complete searched use/impact scope (including a reasoned no-change result);
4. affected claims, numbers, diagrams, maps, protocols, publications or framework
   owners, with paths and proposed treatment;
5. recommendation: include, exclude, narrow, defer, or request more evidence;
6. proposed acceptance checks, open decisions and maintainer-review request.

Wait for the required maintainer decision on substantive integration. An existing
explicit authorization covering that exact treatment may be referenced instead
of asking again. Silence or elapsed time is not approval. Preserve private
correspondence boundaries; link public evidence or a bounded authorized summary.

### Implementation, review and closure

1. Link the owning issue in the PR body using `Refs #N` or a full issue URL.
   Add `Refs #N` to every implementation commit (including the final squash
   message); for a different repository use its full issue URL. Keep technical
   implementation details in the PR/commits. Add the PR URL and exact commit
   links to the issue as soon as they exist, and refresh them after a rebase or
   squash. An issue must be navigable to both its PR and implementation commits.
   Prefer a non-closing reference while review, deployment, publication or sibling
   work remains. Do not use `Closes`/`Fixes` merely because some code is merged.
2. Implement the accepted scope under the repository's existing review,
   synchronization, validation and source/research procedures.
3. Independently check the result where required, return corrections to the
   applicable flow, and record unresolved disagreement or missing review.
4. Add a completion summary to **both PR and issue**: original intent versus
   actual outcome, exact merged ref/edition, acceptance evidence, review and
   decision references, deviations, remaining work and cross-repository results.
   Use `not merged` or `not deployed` when that is the actual state; do not
   promote local preparation or passing CI into acceptance. Record the merged
   commit separately from the tested source head when they differ.
5. Close as completed only when the accepted outcome is merged and checked and
   all applicable decisions/acceptance checks are satisfied. Rejection,
   duplication, supersession or deferral needs an explicit disposition and links
   to surviving work; it must not be reported as implementation completion.

Draft, merged, reviewed, published and deployed are separate observations.
An umbrella issue remains open until its required dependencies are complete.
Issue closure and green CI do not change scientific or source-verification state.

## Acceptance criteria and session evidence

Use one complete `Refs #N` line in this repository’s PR body to identify the
local owning issue for the acceptance workflow. Record other local or
cross-repository issues as dependencies; incidental links do not select policy.

The issue owns the acceptance criteria. Give each a stable heading such as
`### AC01 — Exact snapshot identity` and a checkbox/pass condition. Keep IDs
stable across sessions; append dated scope decisions instead of renumbering or
weakening a criterion to match a convenient result.

For implementation, maintain `.github/acceptance/issue-N.json` in the owning PR.
It maps every issue AC to deterministic, reproducible named tests or policy
checks, the relevant workflow and required non-automatable gates. This policy
is the executable mapping of the issue, not a substitute for its intent. See
[the acceptance contract](.github/ACCEPTANCE.md) for schema, runner and report.
Define checks early and finish/refresh them before ending a substantive session.
Tests must exercise the promised outcome and meaningful failure cases; a file
existing or a sentence containing a keyword proves only that structural fact.

At handoff or before interruption:

1. Ensure every AC has an explicit check and pass condition. A missing mapping,
   skipped check, incomplete run or unavailable evidence is not a pass. For a
   criterion requiring a human decision, test its automatable invariants and
   retain the decision as an unresolved gate until evidence actually exists.
2. Run the acceptance policy and applicable repository checks at the exact
   candidate. CI/Actions records checkout SHA/tree, policy/source identity and
   a per-criterion result artifact; local evidence declares dirty/prepared state.
3. In the issue add a compact table: `AC | check/test | result | source/run |
   remaining decision`. Link technical logs/results in the PR/CI artifact.
   Record partial work honestly when interrupted; rerun after relevant changes.
   Also update the actual AC checkboxes in the owning issue body; the table does
   not replace them. Mark `[x]` only when the whole criterion is verified by all
   required current-source checks and non-automated gates. Keep partial, failed,
   skipped, unmapped, stale, wrong-source or pending criteria `[ ]`; clear a tick
   if its evidence is invalidated. Preserve the original intent, AC IDs and
   criterion-to-evidence mapping when updating status.
4. Before declaring the issue ready, fetch its current criteria and linked PR,
   commits, reviews and CI; rerun/verify the mapped checks and map results back
   to the criteria. Reconcile all human/dependency/release gates and the exact
   merged ref when required. The issue remains open if any required result is
   failed, skipped, unmapped, stale or pending. Automation never auto-closes it.

When RI changes, also review the associated CI/test routes and the layer/path
mapping in [.github/REPOSITORY-INTELLIGENCE.md](.github/REPOSITORY-INTELLIGENCE.md).
Refresh the checked RI/CI coverage map and both generated RI views; rerun the
coupling/acceptance checks. A fresh index with stale CI coverage is insufficient.

## Review, analysis and model handoff

Use the existing owning issue and PR when asking another model (for example,
Astra for analysis/review and Sol for execution). Model names are roles in the
conversation, not independent task records or proof of independent review.

Store the technical result in the PR as
`review/issue-N/YYYY-MM-DD-kind.md` (`analysis`, `review` or `handoff`), following
[REVIEW-TEMPLATE](review/REVIEW-TEMPLATE.md). Record the inspected ref/materials,
reviewer identity/role, findings with evidence, AC impact, decisions needed,
ordered execution tasks and how their results will be checked. Label draft
analysis, self-review, independent review and unavailable evidence accurately.

The issue gets one dated anchor, a short synopsis and an exact PR Files Changed
link or commit-pinned file/section permalink. Link that anchor back from the
artifact and PR body. New findings/corrections update the same issue route and
versioned artifact; use a new dated file only for a distinct review pass and
cross-link prior findings. Do not create a competing handoff in AGENTS, chat
memory or another issue. MEMORY holds only a short pointer/next action.

The execution model reads the issue intent/ACs, the linked PR and artifact,
implements those tasks, updates their dispositions and acceptance evidence in
the PR, then summarizes outcomes back at the issue anchor. It must not treat
review recommendations as an unrecorded change of the maintainer's intent.

## Repository navigation and session memory

[AGENTS.md](AGENTS.md) is a compact agent router (maximum 100 lines), not a task
ledger. [MEMORY.md](MEMORY.md) is the current dated handoff (maximum 120 lines).
The owning issue, Git/GitHub and canonical source files remain authoritative.

At a meaningful handoff, interruption or completion, replace stale memory with:
the verified date/ref and evidence links; decisions that affect the next action;
active issue/PR and remaining acceptance; the next concrete step. Keep the five
sections `Snapshot`, `Decisions`, `Open work`, `Next session` and `Maintenance`.
Revalidate relevant live state at the next session. Detailed experiments, run
logs and historical checkpoints belong in the PR/issue or dated `review/` files.
Never store secrets, private correspondence or speculative completion in memory.

Every repository file and directory has an explicit purpose, role and owner in
[the path catalog](.github/repository-paths.json). Add/remove its entry with the
path change; missing, unclassified or stale entries fail. The generated
[repository map](REPOSITORY-MAP.md) and RI context are two views of that catalog
and source state. Rebuild and verify them after indexed source or memory changes.
Historical files are preserved as evidence; their task-specific instructions do
not become current policy merely because a search finds them.

## Publication and licensing checks

Preserve exact published editions, source identities, URLs and third-party credits. HTML/PDF/deck exports must match the accepted edition and be visually inspected. Drafts remain separate. Link upstream research owners; conceptual corrections require their own reviewed issue/PR. No site-wide license has been selected yet: [rights #7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7) records that decision. Component-specific code notices do not license all publication material.

## Local navigation checks

Run the commands in [.github/REPOSITORY-INTELLIGENCE.md](.github/REPOSITORY-INTELLIGENCE.md) after source/producer/config changes. They check local navigation/freshness and are not a publishing or deployment approval.
