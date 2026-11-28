# Issue 219 — 2026-11-28 review / analysis / handoff

Owning issue and dated anchor: [issue219](https://github.com/oborskyivitalii/oborskyivitalii/issues/219), 2026-11-28 plan approval.
Owning PR and exact artifact/section permalink: Draft PR for branch `work/issue-219-dev-environment` (linked from the issue).
Reviewer/model role; independent review or self-analysis: one separate Code Reviewer agent; other roles pending.
Iteration/checkpoint and separate reviewer subagent identity (not its implementer): iteration 1, fresh general-purpose subagent launched without the author conversation.
Inspected commit/tree or explicitly dirty prepared state: `origin/main...bb3dc752` (commits 3fa6c611, bb3dc752).
Base/candidate diff identity and final re-reviewed identity: corrections in 2c38c69c are not yet re-reviewed.
Materials read, checks actually executed and access limits: reviewer read the role contract, CODE-STYLE and the full diff; ran `node --test tests/dev-environment.test.cjs` and two issue219 unittests; verified Node SHA-256 values against nodejs.org; Docker Hub rate-limited digest confirmation; no image build.
Actual fork/memory mode and requested/accepted launch evidence reference: new agent with a self-contained brief; the runner has no `fork_turns` parameter, so equivalent isolation is asserted by the orchestrator, not proven.
Common and role prompt identities; explicit source packet identity: `agents/reviewers/README.md`, `agents/reviewers/code-review.md`; packet = issue intent, AC policy path and the diff range above.
First independent result; later reconciliation/correction exposure: no blockers; five should-fix and five nit findings below.
Shared-source/provider isolation limits; final inspected-source hash check: same model provider as the author; this is a documented limit.

Apply [the mandatory per-iteration review protocol](../../CONTRIBUTING.md#independent-review-after-every-iteration).

## Intent and acceptance

Vendor-agnostic, browser-usable development environment (AC01–AC06 in the issue and
`.github/acceptance/issue-219.json`). No scope amendment.

## Findings

### Independent role executions and requirements quality

| Role | Separate agent/execution | Inspected source and scope | Completed result / own finding link | Limit or affected recheck |
| --- | --- | --- | --- | --- |
| Requirements & Acceptance Reviewer | not launched | | pending | required before Ready |
| Code Reviewer | fresh subagent, iteration 1 | bb3dc752 full diff | completed: findings F01–F10 | correction re-review pending |
| White-box QA | not launched | | pending | required before Ready |
| Exploratory / Interaction QA | not launched | | pending | maintainer device trial (DEVICE gate) |

### Findings and dispositions

| ID | Severity | Evidence/path | Finding and implication | Affected AC | Disposition |
| --- | --- | --- | --- | --- | --- |
| F01 | should-fix | `.github/workflows/dev-environment.yml` | CI ran as root, not the image's `dev` user; guide overstated what a green run proves | AC03 | fixed in 2c38c69c: checkout chowned to uid 1000, run as `dev`, guide narrowed |
| F02 | should-fix | workflow `paths` | Locks, requirements and called checks did not trigger the container run | AC01, AC03 | fixed: paths widened |
| F03 | should-fix | `tests/dev-environment.test.cjs` | Pin test read one workflow and broke on quoted values | AC01 | fixed: capture groups, all workflows for Node, Basic lane for Python |
| F04 | should-fix | `tools/dev/cli.cjs`, guide | Loopback-only serve unreachable on plain Docker | AC05 | fixed: opt-in `--host`, guide documents `--network host` |
| F05 | should-fix | `tools/quality/delivery-routing.cjs` | New `.devcontainer/` control classification untested | AC06 | fixed: D09 case added to `tests/delivery-observation.test.cjs` |
| F06 | nit | `tools/dev/cli.cjs` | `check` ran the freshness build twice | AC02 | fixed: delegated to `local.cjs` |
| F07 | nit | `tools/dev/cli.cjs` | `serve` ignored unknown arguments; listen error unhandled | AC02 | fixed: strict parsing, promise rejects on `error` |
| F08 | nit | `tools/dev/cli.cjs` | CS05 one statement per line / expanded blocks | AC06 | fixed |
| F09 | nit | `.devcontainer/Containerfile` | Node archive docs extracted into /usr/local | AC01 | fixed: excluded |
| F10 | nit | guide | `doctor` checks system `python3` | AC02 | fixed: wording |

Executed after corrections (dev user, container image): doctor, setup, check pass;
`tests/dev-environment.test.cjs` 9/9, `tests/delivery-observation.test.cjs` 52/52,
enduring Python suite 159/159, lint scanner and architecture pass, issue219 policy
automated-pass for AC01–AC06 with REVIEW, CI-RUN, CONTROL and DEVICE gates pending.
