# Contributing

This repository owns personal publications and distribution. Read [AGENTS](AGENTS.md) and [repository ownership](REPOSITORIES.md) before coordinated edits.

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
- **Acceptance:** observable checks and required editorial, independent or human
  decisions.
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
