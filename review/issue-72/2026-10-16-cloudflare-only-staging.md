# Issue 72 — 16 October 2026 Cloudflare-only staging

Owning issue: [#72 scope amendment](https://github.com/oborskyivitalii/oborskyivitalii/issues/72#accepted-scope-amendment--16-october-2026).
Owning PR: separate infrastructure PR from main; exact link follows publication.
Reviewer/executor: Codex, self-review; independent review remains distinct.
Inspected source: protected main `9b82f382d080f879528fac8bba94b3656ce14521`,
tree `1c444ea8d3129487250649778105ad8323186ffd`. Prepared changes are dirty.

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
| T02 | Staging workflow/admission and merge observer | F01, AC02/04 | Behavioral negative controller tests | In progress |
| T03 | Preflight producer/consumer and staging report aggregate | F02/03, AC02/08 | Same-run reuse and corruption/missing/failed/attempt negatives | In progress |
| T04 | Current acceptance, guides, registry, catalog and RI/CI | AC08/09 | Basic, policy, style/format/lint, RI and coupling | Pending |
| T05 | Publish separate reviewed PR and inspect native CI | AC09 | Exact head/run evidence | Pending |

## Acceptance evidence

| AC | Check | Result | Remaining gate |
| --- | --- | --- | --- |
| AC01 | Existing Draft prototype remains unchanged | Pending regression | Native prototype evidence if applicable |
| AC02/03/04 | Cloudflare-only admission, source/artifact/attempt, merge and recovery tests | Pending | Trusted-main integration and actual ordinary stage |
| AC05/06/07/10 | Production consumers and full-gate rejection regressions | Pending | PR40 full/live/settings/archive acceptance |
| AC08 | Current policy, style, source registry and RI/CI | Pending | Independent review |
| AC09 | Separate PR linked to #72 | Pending | CI and protected merge |

## Issue synopsis

Implement the maintainer-approved one-host staging route and reuse exact same-run
prepublication reports. Production-specific cleanup and the paused PR40 feature
work remain separate. No whole live/release criterion is established by fixtures.
