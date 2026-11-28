# Issue 219 — 2026-11-28 review / analysis / handoff

Owning issue and dated anchor: [issue219](https://github.com/oborskyivitalii/oborskyivitalii/issues/219), 2026-11-28 AC07 scope amendment (AGENTS.md-native runners).
Owning PR and exact artifact/section permalink: Draft [PR #220](https://github.com/oborskyivitalii/oborskyivitalii/pull/220), branch `work/issue-219-dev-environment`.
Reviewer/model role; independent review or self-analysis: Code Reviewer role, one fresh agent per iteration; other roles pending.
Iteration/checkpoint and separate reviewer subagent identity (not its implementer): four-role pass on 595cadd7 and correction pass on b6ad858f (see below); iterations 2–6, each a new general-purpose subagent without the author conversation or peer verdicts.
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
| Requirements & Acceptance Reviewer | fresh subagent: final pass on 595cadd7, correction pass on b6ad858f | full diff 8886647e..595cadd7; delta 595cadd7..b6ad858f | changes requested (R01–R10) → records-only findings N1–N3 | isolation unverified (R01) |
| Code Reviewer | fresh subagents, iterations 2–6, re-review 0d73e8bf..595cadd7, correction b6ad858f | diffs listed above | F1-r resolved; b9e490a9 passes; guide record rebind required | isolation unverified |
| White-box QA | fresh subagent, 595cadd7 | full diff; 47 bounded mutation probes | pass with findings W1–W9 | isolation unverified |
| Exploratory / Interaction QA | fresh subagent, 595cadd7 | operator charter in the container (about 30 cases) | pass with findings X1–X6 | DEVICE (iPad host) not observed |

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

## Four-role pass on 595cadd7 and correction on b6ad858f

Each role ran as a new general-purpose subagent with a self-contained brief (issue body
copy, policy, diff range, role prompt). The runner has no `fork_turns` parameter, and
some runs reported seeing relayed project context, so isolation is unverified and the
REVIEW gate stays open (R01). The maintainer chose on 2026-11-28 to merge with REVIEW,
DEVICE and ISOLATION recorded open.

| ID | Role | Severity | Finding | Disposition |
| --- | --- | --- | --- | --- |
| R01 | Requirements | high | Reviewer isolation unverified for the runner used | open; REVIEW gate open |
| R02 | Requirements | high | No preflight; AC07 oracle written with its implementation | accepted, process note in the issue |
| R03 | Requirements | high/medium | Cascaded Codex review had no pass condition | DEVICE gate now requires one recorded Codex review of the PR head |
| R04 | Requirements | medium | AC02 "no new dependencies" vs runner lock; scope list incomplete | dated scope decision in the issue |
| R05 | Requirements | medium | AC06 layout verify not mapped | WORKFLOW check and CI-RUN gate added to AC06 |
| R06 | Requirements | medium | AC04 gate omitted the Requirements role | REVIEW now names all four roles |
| R07 | Requirements | low/medium | Codex `## Code Review Rules` claim unverified | guide cites the Codex GitHub review docs (read 2026-11-28); trial confirms |
| R08 | Requirements | low | ENTRY covers AC05 partly | REVIEW gate added to AC05 |
| R09 | Requirements | low | "optional" runners always install | wording corrected |
| R10 | Requirements | low | test-profile inputs incomplete | inputs widened; tests/ listing and tracked-file list accepted |
| W1–W3 | White-box | medium | doctor/run/steps, serve.cjs, runnerCommand failure paths untested | tests added (b9e490a9) |
| W4 | White-box | low/medium | selection inputs narrower than test reads | inputs widened |
| W5–W6 | White-box | low | missing operator denies; hash checked by format only | deny cases, exact allow set, real hash compare |
| W7 | White-box | low | Containerfile/workflow checks are substring checks | accepted; CI-RUN is the oracle |
| W8 | White-box | low | outside-checkout test uses the real checkout as target | accepted; `.opencode/` ignored, tree checked clean after runs |
| W9 | White-box | low | Python pin checked against Basic lane only; IPv6 URL | accepted |
| X1 | Exploratory | low | missing-setup errors raw | `requireToolchains` hint |
| X2 | Exploratory | low | shallow clone cryptic | guide gives `git fetch --unshallow` |
| X3 | Exploratory | low | `review` started on a missing base | `verifyBase` before Codex starts |
| X4 | Exploratory | low | echo polluted runner stdout | echo moved to stderr |
| X5 | Exploratory | low | cosmetic messages | doctor hint added; rest accepted |
| X6 | Exploratory | risk | Codex sandbox without bubblewrap unverified | DEVICE trial |
| N1–N3 | Requirements (correction) | medium/low | four-role pass not recorded; tested head not pushed; DEVICE wording differs in issue | this section; pushed head; issue gate lines updated |
| C1–C6 | Code (correction) | gate/low/nit | guide record stale; AC06 scope text; base hint; test cleanup; `.yaml`; build toolchain guard | record rebound; text, hint and cleanup fixed; rest accepted |
| A1 | CI / Code (delta 98b23478..35a3fe79) | blocking | AC06 node-basic failed in the acceptance job: issue219 policy had no Basic toolchain install | e168df06 adds issue219 to the four install conditions used by issue211/213; reviewer approved; guide record updated |

### Test-impact review (8886647e..head)

Affected behaviour: container image, `tools/dev` command entry and runners, `serve.cjs`
options, `.devcontainer/` control routing, format roots, test-profile inputs, acceptance
policy. Dispositions: `tests/dev-environment.test.cjs` new permanent source guard
(pr-targeted, staging, production); `tests/test_issue219_acceptance.py` task snapshot;
`tests/delivery-observation.test.cjs` gains the D09 `.devcontainer/` case;
`tests/test_ri_ci.py` gains the layer; existing serve consumers keep their tests (defaults
unchanged); no test weakened or removed. Hosted/staging profiles are unaffected (no
site runtime or `docs/` change). Executed in the container as `dev`: `cli.cjs check`,
dev-environment 17/17, issue219 acceptance 4/4, enduring Python suite with the venv
159/159, issue219 policy automated-pass AC01–AC07.

Limits: permissions are text rules evaluated by OpenCode, not a sandbox; repository
tests run code by design; no model-driven OpenCode or Codex session; no GitHub Codex
review observed yet; fork-isolation equivalence unverified (ISOLATION gate).
