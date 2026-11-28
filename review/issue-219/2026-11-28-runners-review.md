# Issue 219 — 2026-11-28 review / analysis / handoff

Owning issue and dated anchor: [issue219](https://github.com/oborskyivitalii/oborskyivitalii/issues/219), 2026-11-28 AC07 scope amendment (AGENTS.md-native runners).
Owning PR and exact artifact/section permalink: Draft [PR #220](https://github.com/oborskyivitalii/oborskyivitalii/pull/220), branch `work/issue-219-dev-environment`.
Reviewer/model role; independent review or self-analysis: Code Reviewer role, one fresh agent per iteration; other roles pending.
Iteration/checkpoint and separate reviewer subagent identity (not its implementer): iterations 2–6, each a new general-purpose subagent without the author conversation or peer verdicts.
Inspected commit/tree or explicitly dirty prepared state: 8b4499a2…4c40f3ca (iteration 2); f887491e, 302256ef, b6435e47, 0d73e8bf (iterations 3–6); clean trees.
Base/candidate diff identity and final re-reviewed identity: base `8886647e` (merge-base with `origin/main`); final independently re-reviewed head 0d73e8bf; 620667be adds only the F1-r brace denies, verified by the author against live OpenCode (see limits).
Materials read, checks actually executed and access limits: reviewer contract and code-review prompt, full diffs, generated agents; `node --test tests/dev-environment.test.cjs`, `tests.test_issue219_acceptance`, `opencode agent list` and `opencode debug agent code-review --tool bash` probes (pinned 1.19.6) in scratch repos; no model-driven session, no provider credentials.
Actual fork/memory mode and requested/accepted launch evidence reference: new agent with a self-contained brief each time; the runner has no `fork_turns` parameter, so isolation is asserted by the orchestrator, not proven.
Common and role prompt identities; explicit source packet identity: `agents/reviewers/README.md` sha256 725c8432…a0a8, `agents/reviewers/code-review.md` sha256 26b3fba1…0697; packet = issue intent, AC policy and the diff ranges above.
First independent result; later reconciliation/correction exposure: iteration 2 changes requested (S1–S5, N1–N8); iterations 3–6 correction reviews below.
Shared-source/provider isolation limits; final inspected-source hash check: same model provider as the author; documented limit.

Apply [the mandatory per-iteration review protocol](../../CONTRIBUTING.md#independent-review-after-every-iteration).

## Intent and acceptance

AC07 (dated scope amendment): OpenCode and Codex CLI run from `AGENTS.md` and the
repository reviewer prompts, with no tracked vendor instruction file; reviewer
subagents are generated outside the checkout; Codex review supplies extra findings and
never replaces a required role.

## Findings

### Independent role executions and requirements quality

| Role | Separate agent/execution | Inspected source and scope | Completed result / own finding link | Limit or affected recheck |
| --- | --- | --- | --- | --- |
| Requirements & Acceptance Reviewer | not launched | | pending | required before Ready |
| Code Reviewer | fresh subagents, iterations 2–6 | diffs listed above | changes requested → F1-r open at 0d73e8bf | 620667be confirmation pending next review |
| White-box QA | not launched | | pending | required before Ready |
| Exploratory / Interaction QA | not launched | | pending | maintainer device trial (DEVICE gate) |

### Findings and dispositions

| ID | Severity | Evidence/path | Finding and implication | Affected AC | Disposition |
| --- | --- | --- | --- | --- | --- |
| S1 | should-fix | `tools/dev/runners.cjs` | Generated agents had no permission rules; "read-only" was unenforced | AC07 | fixed f887491e; refined as F1 |
| S2 | should-fix | runners | Provenance lacked full hashes; retired agents stayed; agents could go stale | AC07 | fixed f887491e |
| S3 | should-fix | `.github/workflows/dev-environment.yml` | Agent generation untested in the image | AC03, AC07 | fixed f887491e; pinned by N-a |
| S4 | should-fix | `tools/dev/cli.cjs` | Review base default unclear | AC07 | fixed: `origin/main`, guide says fetch first |
| S5 | should-fix | `AGENTS.md` | Bot findings could read as a required role | AC07 | fixed: iteration inputs only |
| N1–N8 | nit | Containerfile, runners, cli, tests, guide | tar excludes, outside-checkout realpath, leading-dash base, braces, vendor regex, password history | AC01, AC07 | fixed f887491e (verified in iteration 3) |
| F1 | should-fix | runners, guides | Bash allowlist bypassable (`--output`, `node --test --import`, `difftool -x`, quoting, `$`, extra node files); guides overstated it | AC07 | fixed 302256ef–0d73e8bf: exact git subcommands, exact per-file `node --test` allows, write/exec flag and shell-operator denies, guides say best-effort, not a sandbox |
| A1 | should-fix | runners, test mirror | `"*\\*"` deny became `*/*` (OpenCode reads `\` as `/`), denying every path | AC07 | fixed 0d73e8bf; mirror normalises `\`; backslash-escaped option names documented as a known gap |
| F1-r | medium | runners | Brace expansion (`--out{put,}`) evaded text denies | AC07 | fixed 620667be: `*{*,*}*`, `*{*..*}*` denied; live OpenCode probe denied the reported forms and still allowed `HEAD@{0}` |
| N-a | nit | `tests/test_issue219_acceptance.py`, test | Workflow agents step not asserted; no symlink case | AC03 | fixed |
| N-b | nit | runners | Deletion before conflict check; non-file and dangling-symlink entries | AC07 | fixed: lstat conflict pass first |
| N-c | nit | guide evidence | Guide record was empty | — | fixed: [workflow-guide-evidence.json](workflow-guide-evidence.json) |
| N-d | nit | `guides/REPOSITORY-WORKFLOW.md` | Unhedged Codex/AGENTS.md claim | AC07 | fixed |
| N-e | low | runners | `*--output*` also denies harmless `--output-…` options | AC07 | accepted, documented |
| N-f | low | runners | New test files need `agents` re-run | AC07 | accepted, documented |

Workflow-guide gate (iteration 6 reviewer, head 0d73e8bf; covered bytes unchanged at
620667be, scope `fe71009f…b9dd`): `## Agents and orchestration` updated and accurate;
`## Harness and ownership` and `## Delivery routes and controls` reviewed, accurate.

Limits: permissions are text rules evaluated by OpenCode, not a sandbox; repository
tests run code by design; no model-driven OpenCode or Codex session; no GitHub Codex
review observed yet; fork-isolation equivalence unverified (ISOLATION gate).
