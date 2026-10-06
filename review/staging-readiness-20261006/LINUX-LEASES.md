# Linux engine lease adapter — 2026-10-06

Status: the adapter is prepared for review within #23. Controller activation
and the extra CI-only PR described below remain pending explicit authorization.
There is no hosted acceptance, stable promotion or runtime merge.

The preparation starts from candidate
`5e4a8f61a2f9fa8bf0a9370a2706b67289e239c9`. The existing protected-main
controller is `1490f7d99fa636328cb09bca7eab9e7557d00769`; a controller SHA is
distinct from its deployed PR source SHA.

## Measured budget constraint

The completed [full staging run 37491800878, Linux job 112367844051](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37491800878/job/112367844051)
tested source `4c05087e80110979f174b36b5dab6811d759a468`. Its Linux execution
retained passing Chromium/Firefox and Color coverage, but WebKit did not start
under the disproved 3000ms Xvfb pre-launch cap. The full gate failed and stable
promotion was skipped.

| Observation | Actual duration / coverage |
| --- | --- |
| Complete Linux job | 35m58s |
| Functional step, Chromium + Firefox, with failed WebKit startup | 32m48s; 260 functional, 8 navigation, 26 analytics |
| Color feature step | 2m10s; all 12 rows |
| Remaining allowance under the unchanged 45m Linux job limit | approximately 9m02s |

[GTK confirmation run 37505225237](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37505225237)
retains all 130 functional rows after 19m58s: 120 pass and ten no-JavaScript
native page crashes. Its incomplete functional/navigation/analytics lease runs
24m08s until cancellation at the original 25m diagnostic job bound. Only the
first navigation pass is retained in stdout; final navigation/analytics fields
are absent. Both observed durations exceed the previous 9m02s allowance.
[GTK-FOLLOWUP.json](GTK-FOLLOWUP.json) retains exact timings and every failure.
The complete GTK lease duration remains unknown; native crashes require causal
localization and correction. Private loopback evidence cannot substitute for
the mandatory hosted gate.

These timings support a runner partition. They do not support increasing a
deadline, dropping a scenario, shortening observation windows, retrying a
failed row or claiming an unmeasured renderer improvement.

## Minimal prepared change

The release workflow retains the existing `linux` job contract and uses
`fail-fast: false` with two independent runner leases:

| Lease | Complete functional / navigation / analytics coverage | Installed engines | Color |
| --- | --- | --- | --- |
| `primary` | Chromium + Firefox: 260 / 8 / 26 | Chromium, Firefox, WebKit | Original complete 12-row suite, once |
| `gtk` | WebKit: 130 / 4 / 13 | WebKit | Supplied by `primary` |

Both jobs retain the 45m limit. Linux-only installation copies the already
reviewed primary Ubuntu archive correction, including active local APT mirror
lists, and separates Node tools, OS dependencies and browser downloads into
3m/5m/3m phases. There is no browser warmup. Native, performance and capture
jobs are unchanged, as are the 30000ms shared display/browser startup allowance,
original page/paint/fallback bounds, quality holds and performance budgets.

The evidence adapter validates every declared lease independently with all
existing functional assertions. Its engine union must be exactly Chromium,
Firefox and WebKit, with no overlap or empty lease, and totals must remain
390 functional, 12 navigation and 39 analytics rows. All existing source commit,
tree, candidate, artifact and variant checks remain. Lease targets must agree;
hosted acceptance still requires the exact requested hosted target. Missing,
failed, duplicate, foreign or smoke-only evidence fails closed.

Uploads include `matrix.lease`, profile, run and attempt. The aggregate download
keeps `merge-multiple: false`; each original report retains its actual runner
environment and raw failed rows. No synthetic combined runner is created. The
matrix `linux.result` must succeed in full before the existing aggregate gate
and stable promotion can succeed. Artifact namespace checks reject shared lease
upload names and collisions.

Prepared implementation files:

- `.github/workflows/site-release-checks.yml`
- `tools/quality/validate.cjs`
- `tools/quality/workflow-artifacts.cjs`
- `tests/quality.test.cjs`

## Verification and review

`node --test tests/quality.test.cjs tests/review-flow.test.cjs tests/engine-browser-fixtures.test.cjs`
passes 33/33 tests. Fixtures cover complete split and legacy evidence, every
coverage group, duplicate/empty/foreign engine leases, source/variant/target
mixing, mandatory job failures, native completeness and immutable namespace
collisions. These are controlled fixtures, not a hosted browser pass.

The complete candidate source suite also passes 291/291 Node and 21/21 Python
tests. Its local build and source/snapshot/geometry/size checks pass.
Scoped ESLint reports no errors or warnings, and `git diff --check` passes.
YAML parsing confirms both partitions and unchanged gate dependencies. The APT
block is byte-identical to the reviewed GTK diagnostic block.

Independent read-only reviewer `/root/installer_review` completed review of the
four-file diff against `5e4a8f6` and its affected workflow/validator context,
approving the code with no blocker. The reviewer independently reran all 33
tests and YAML/whitespace checks, confirming unchanged non-Linux jobs and gate
dependencies, exact copied APT setup, strict coverage and identity checks,
primary Color12 and retained raw runner environments. This approval covers the
prepared code; it does not establish hosted acceptance, prove future budget fit
or authorize the controller activation exception.

A concrete backport is also prepared against unchanged protected main
`1490f7d99fa636328cb09bca7eab9e7557d00769`. Only the same four reviewed hunks
and the regenerated RI context change (five files, +162/-14); `docs`, `site`
and `review` remain unchanged, with no runtime source imported from #23.
Main compatibility passes its 26/26 quality/review-flow tests, the local gate,
locked scoped ESLint, YAML/whitespace and RI verification. There were no patch
conflicts. This local preparation creates no branch, PR or controller change.

## Protected-main activation dependency

[AGENTS.md](../../AGENTS.md), under “Full staging and merge authorized —
2026-10-06”, requires: “Keep #23 as the sole PR” and “Never merge before the
open-PR staging lease and stable verification finish.” These remain active.

The existing `/stage` controller requires `refs/heads/main`, protected main and
an unchanged main tip. Its local reusable release workflow comes from that
controller revision, while tests check out the exact candidate. Consequently,
workflow edits in unmerged #23 do not change its premerge hosted runner topology.
Promotion also rechecks the exact open PR head and unchanged controller.

The currently verified main ruleset `24568553` requires a pull request and the
strict `checks` and `Local navigation and RI freshness` checks. It has no bypass
actors; the current user cannot bypass it. A direct CI-only main push is not a
permitted alternative. Merged #26 cannot be reopened to carry a new controller.

This creates an activation cycle if the serial full suite cannot fit: #23 needs
the new main controller before passing staging, while its runtime cannot merge
before staging. The concrete pending exception is one narrowly scoped **CI-only
PR**, based on protected main, containing the reviewed lease controller and
evidence adapter plus their tests. It must use normal branch protection and
carry no renderer or content changes. That additional PR is **not authorized**
by the current sole-#23 instruction.

If the maintainer explicitly grants that narrow exception, the integration
order is: complete independent review and required CI; merge the CI-only
controller through normal protection; synchronize #23 while preserving its
history; retain the completed GTK evidence and remove its dated trigger; start
a fresh owner-authorized `/stage` for the resulting exact open #23 head; complete
the full hosted gate and stable verification; then merge that exact reviewed
head. Do not activate a branch controller, merge the runtime first, alter main
protection or use diagnostic evidence as hosted acceptance.
