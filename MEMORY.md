# Session memory

Dated continuity hints, not instructions or live-status authority. Last verified: **2026-10-10**. Revalidate refs, issue/PR, checks and hosting before acting.

## Snapshot

- Current domain preparation: [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39),
  [Draft PR #40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40),
  branch `work/github-pages-domains-39`; original preparation baseline `ec9b8361`.
  Live main inspected at `93a818dbc3239b97b47b7d56edb83f5a7ebf65fc`.
  [10 October readiness](review/issue-39/2026-10-10-readiness.md) records NO-GO:
  production build/publisher/recovery/admission and live domains remain pending.
  Ownership TXT exists; maintainer confirmed GitHub Verified on 10 October.
  No routing DNS/redirect. Repository Pages/environment settings remain unobserved
  through this connector. Ownership is complete; keep TXT, do not recreate it.
  PR40 conflicts with current main; reconcile frozen preparation policy before rebase.
  Current stable stage is Color from PR67, tree-identical to main source; its bounded
  gate explicitly has productionEligible=false. Main docs is the base rendition.
  Report-only continuation preserves this PR's original public/runtime/workflows.

- [#31](https://github.com/oborskyivitalii/oborskyivitalii/issues/31) is accepted and closed.
  [PR #32](https://github.com/oborskyivitalii/oborskyivitalii/pull/32) merged at
  [`3ca14c5`](https://github.com/oborskyivitalii/oborskyivitalii/commit/3ca14c54824ac6b9e7225bc88429b4b8fb3bcf10),
  tree `9c06c9ac3f16746196bfc7d7d68056e0cbadb34d`, identical to accepted head
  `5ac6d4adca2fb77dd061b44792ed8655fd9d6f70`. All 53 mapped checks passed on
  clean exact merged source; [push RI CI](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37591618593)
  passed. The issue/PR retain owner decision, review and current-head CI evidence.
- #33/#34 root organization is merged in inspected main `ec9b8361`,
  tree `1374580d719439f13b05ab0f62a86e44bd1d3ae3`; read its live issue for
  closed acceptance. Prior reviewed source was `bf1c795c`; dated review remains
  at [issue-33 review](review/issue-33/2026-10-07-review.md).
- Earlier #28/#14 completion and accepted stage remain recorded in their issues.
  Current hosting mechanics are in [the runbook](guides/SITE-STAGING.md).
  Stable stage: https://staging.oborskyi-author-ci-staging.pages.dev ; recheck its
  live source/deployment before citing it as current release evidence.

## Decisions

- Bootstrap is an entry point only. README owns project purpose; AGENTS owns
  working rules; REPOSITORY-MAP owns area/file navigation. Detailed protocol
  remains in CONTRIBUTING and its linked owners, not copied into the prompt.
- Maintained internal topic guides live in guides/. Superseded root session,
  backlog and review ledgers are dated evidence in review/root-history-20261007/.
  Original bytes/pinned links stay historical; live issues own current acceptance.
- Issue = intent/scope/AC; linked PR and Refs commits = execution. Reviews and
  model handoff use the same issue anchor and versioned review artifact.
- RI changes require reviewed CI coupling and both regenerated views. Policy
  results prove deterministic observations; independent/live/merge gates are
  recorded separately. #31 acceptance stays pinned to its accepted source.
- Owner chose `https://vitaliioborskyi.ai` on GitHub Pages; .com redirects to .ai.
  #39 prepares it; TXT is created and Verified is maintainer-confirmed.
  Repository Pages/environment settings still need observation.
  Routing/deploy remain pending. Analytics stays disabled under #8. Current
  check profiles/budgets retain their owners; domain choice is not a release.

## Open work

These are issue routes, not authorization to start every listed task. Revalidate
live criteria/status before selecting the next increment.

| Issue | Remaining intent |
| --- | --- |
| [#39](https://github.com/oborskyivitalii/oborskyivitalii/issues/39) | Ownership verified; confirm repository Pages settings, reconcile PR40/main, implement publisher/production metadata/provider/recovery and live domain acceptance. |
| [#1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1) | Overall launch and its production/rights/device dependencies. |
| [#13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13) | Physical-device and independent production/recovery acceptance. |
| [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8) | Production URL/indexability and actual analytics activation. |
| [#7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7) | License and editorial/third-party rights. |
| [#6](https://github.com/oborskyivitalii/oborskyivitalii/issues/6) | Worked cross-repository adapter/edition/manifest scenario. |
| [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5) | Real article HTML/PDF adapter and edition migration. |
| [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2) | PMDay article and matching slide/PDF edition. |
| [#11](https://github.com/oborskyivitalii/oborskyivitalii/issues/11) | Post-launch buyer-intent guides. |

## Next session

1. Revalidate #39/main/PR40 and read the 10 October readiness report.
2. Preserve existing .ai TXT and maintainer-confirmed Verified; observe repository settings separately.
3. Reconcile PR40 with current main and its frozen preparation policy before
   implementation; decide production rendition, prepare build/publisher/recovery
   and current-artifact #7/#8/#13 gates before any authorized routing/release.

## Maintenance

Replace stale snapshot/next-step entries at meaningful progress or handoff. Keep
this file within 120 lines and its five sections. Put detailed logs and technical
history in the owning issue/PR/review artifact. Rebuild RI after memory changes.
Never store secrets, private messages or unverifiable completion. See CONTRIBUTING.
