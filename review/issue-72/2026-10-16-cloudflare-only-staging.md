# Issue 72 — 16 October 2026 Cloudflare-only staging

Owning issue: [#72 scope amendment](https://github.com/oborskyivitalii/oborskyivitalii/issues/72#accepted-scope-amendment--16-october-2026).
Owning PR: [PR81](https://github.com/oborskyivitalii/oborskyivitalii/pull/81), separate infrastructure change from main.
Reviewer/executor: Codex, self-review; independent review remains distinct.
Inspected source: protected main `9b82f382d080f879528fac8bba94b3656ce14521`,
tree `1c444ea8d3129487250649778105ad8323186ffd`. Local implementation
`0aa99539f75adca960cd81111b8ad9950dd72b59` and published `d48bf1cb` share
exact tree `10528588a31476230612b706fed472d9dada7234`. The API publication
changed commit metadata only. The following documentation checkpoint is separate.

## Intent and acceptance

The maintainer explicitly removed GitHub Pages staging and authorized a separate
infrastructure PR before returning to PR40. Cloudflare retains PR previews and
one permanent staging alias. GitHub Pages is reserved for production. Original
two-host evidence stays historical; AC04 is explicitly amended in the live issue.
AC08/AC09 are reopened for this implementation; production acceptance stays open.

Apply CS01/CS02/CS04/CS05/CS07/CS08/CS09/CS10 to the existing controller,
source-bound reports, workflow consumers, tests and guides. Review architecture,
failure propagation and readability as well as the bounded automatic style guard.

## Findings

| ID | Evidence/path | Finding and implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | site-color-review, staging/admission, site-staging-merge | Trusted main requires two hosts; changing only PR40 cannot activate the new route. | AC02/04 | Change main through this narrow PR. |
| F02 | site-color-review build, site-release-checks build/static | Staging preflight repeats twice and scanners run a third time. | AC08 | Retain one pre-upload producer and verify its same-run reports downstream. |
| F03 | staging-gate | Source scanners are host-independent but currently acquire the later browser target. | AC02/08 | Retain original null-target scanner reports; hosted/browser reports still require the exact URL. |
| F04 | Pages publisher and production consumers | Production composition/recovery still knows the historical staging subtree. | AC05/06 | Disable the staging publisher here; production-only package cleanup stays with PR40. |

## Decisions

The authorized change retires the Pages staging workflow, caller, admission
requirement and cross-host compensation. Keep Cloudflare promotion, exact bytes,
recovery, Ready source/RI/owning checks and all staging browser/performance cases
and thresholds. No production/domain/DNS activation or PR40 source mutation.

Preflight reuse is limited to the same workflow run and attempt. Authenticate the
native artifact ID, name, upload digest and producer run. Verify clean source,
tree, profile, manifest, complete successful guard set and retained report bytes.
Missing, stale, partial, altered and wrong-attempt evidence fails. This does not
introduce a general result cache or reduce production regression.

## Sol tasks

| Task | Owners and expected change | Finding / AC | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Isolated main branch, live issue amendment and this record | F01, AC08/09 | Live refs and scope | Complete |
| T02 | Staging workflow/admission and merge observer | F01, AC02/04 | Behavioral negative controller tests | Implemented; source checks passed |
| T03 | Preflight producer/consumer and staging report aggregate | F02/03, AC02/08 | Same-run reuse and corruption/missing/failed/attempt negatives | Implemented; six focused reuse tests passed |
| T04 | Current acceptance, guides, registry, catalog and RI/CI | AC08/09 | Basic, policy, style/format/lint, RI and coupling | Passed locally on exact implementation tree |
| T05 | Publish separate reviewed PR and inspect native CI | AC09 | Exact head/run evidence | PR81 published; native checks pending |

## Acceptance evidence

| AC | Check | Result | Remaining gate |
| --- | --- | --- | --- |
| AC01 | Existing Draft prototype remains unchanged | Basic and prototype-admission passed | Native prototype evidence if applicable |
| AC02/03/04 | Cloudflare-only admission, source/artifact/attempt, merge and recovery tests | Passed source fixtures, including same-run raw/synthetic PR head identities | Trusted-main integration and actual ordinary stage |
| AC05/06/07/10 | Production consumers and full-gate rejection regressions | Existing archive/controller/full-gate fixtures passed | PR40 full/live/settings/archive acceptance |
| AC08 | Current policy, style, source registry and RI/CI | Nine automated policy checks passed; style89, RI28, coupling20, format/lint and architecture passed | Independent review |
| AC09 | Separate PR81 linked to #72 | Published from main without conflicts | CI and protected merge |

## Issue synopsis

Implement the maintainer-approved one-host staging route and reuse exact same-run
prepublication reports. Production-specific cleanup and the paused PR40 feature
work remain separate. No whole live/release criterion is established by fixtures.

## Executed checks and limits

- Clean local staging source selection: **536/536** passing cases in 44 modules,
  zero failed/cancelled/skipped/todo, under the unchanged 180-second bound. Basic
  separately passes its 24 delegated cases, generation, syntax, sizes and geometry.
- Permanent Python source contracts: **111/111**, zero skips. #72 policy: all
  **9/9** automated checks pass; external/whole-criterion gates remain pending.
- Locked ESLint/Stylelint/Ruff passes for 228 scanned files; pinned Prettier/Ruff
  formatting, source architecture, bounded code-style guard and RI/CI verify pass.
- YAML parsing confirms all job dependencies resolve after deleting the Pages and
  mirror-compensation jobs. Git diff whitespace check passes. No authored runtime,
  public `docs/` bytes or budgets changed.
- Self-review checked failure propagation, immutable source/report identity,
  cross-attempt rejection, unique native artifact names, no scanner target
  relabelling, unchanged hosted cases and historical recovery compatibility.
- Native PR81 prototype run38891521232 is pending at this checkpoint. Ordinary
  one-host staging awaits trusted-main integration and PR40's existing advisory/
  performance corrections; this record does not assert that hosted transition.
- Production full/native/performance and independent/device/rights/settings/live
  gates were not run for this infrastructure change and remain with PR40.
