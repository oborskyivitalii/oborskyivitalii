# Session memory

Dated continuity hints, not instructions or a live-status database. Revalidate
facts that affect the next action. Last verified: **2026-10-07**.

## Snapshot

- Cleanup [#31](https://github.com/oborskyivitalii/oborskyivitalii/issues/31) is
  implemented in Draft [PR #32](https://github.com/oborskyivitalii/oborskyivitalii/pull/32).
  Earlier head `b20fc30` passed basic run `37582992916` and RI run
  `37582992470`; these are baseline evidence, not checks for later extensions.
  The AC08–AC11 extension and ordered tasks are in the linked PR’s
  [analysis](review/issue-31/2026-10-07-analysis.md#sol-tasks) and
  [independent review](review/issue-31/2026-10-07-review.md). The policy maps
  AC01–AC11 to 53 checks; owner acceptance and protected merge remain open.
  Recheck its latest head/CI/review; the cleanup is not merged into main.
- Pre-cleanup protected `main`: [`07f936a`](https://github.com/oborskyivitalii/oborskyivitalii/commit/07f936a8733f56d73f34b89e2ad96d1b2ef605c7),
  the normal merge of [PR #28](https://github.com/oborskyivitalii/oborskyivitalii/pull/28).
  This is a baseline, not a claim about future main tips.
- #28 source `985c89d71f8c3967ace8603c2fb499a1a50469e7`; merged tree matches
  `7265c65a18d11e0b3e3fd08088a38d08d6db1850`. Exact-head full staging
  [run 37549451723](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37549451723)
  and post-merge navigation [run 37574592010](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37574592010)
  succeeded. Gate/promotion/recovery details are in the PR completion record.
- Stable stage: https://staging.oborskyi-author-ci-staging.pages.dev ; accepted
  immutable candidate: https://0c1799e4.oborskyi-author-ci-staging.pages.dev .
  Recheck the stable deployment/source before using it as current evidence.
- [Issue #14](https://github.com/oborskyivitalii/oborskyivitalii/issues/14) was closed
  completed after explicit maintainer acceptance on 2026-10-07.
- The obsolete post-merge preview run `37574528402` failed its closed-PR guard;
  it did not upload a package. Keep that failure distinct from full staging.

## Decisions

- Work begins from an owning issue. Issue = intent/scope/acceptance; linked
  PR and commits = technical execution. Return an acceptance summary and exact
  implementation links to the issue before closure. [Cleanup #31](https://github.com/oborskyivitalii/oborskyivitalii/issues/31)
  records the maintainer's 2026-10-07 request, stable AC01–AC11 and scope.
- Session completion maps AC IDs to deterministic policy/check evidence and
  remaining gates. Review/model handoff uses one issue anchor and versioned PR
  artifact; RI changes require reviewed CI coupling. See CONTRIBUTING and
  [.github/ACCEPTANCE.md](.github/ACCEPTANCE.md).
- `AGENTS.md` stays a compact rule/router; this file holds a bounded handoff.
  Detailed historical state is preserved in issues/PRs and `review/`.
- Production host preference is GitHub Pages. Analytics remains disabled until
  a real production origin/token and activation decision; see
  [SITE-ANALYTICS.md](SITE-ANALYTICS.md) and [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8).
  No production activation or DNS/domain changes were performed in this work.
- Full staging still retains Linux Chromium/Firefox, full native macOS WebKit,
  Windows smoke, twelve Color checks, source/artifact leases and original budgets.
  [SITE-CHECK-PROFILES.md](SITE-CHECK-PROFILES.md) owns the details.
- Existing RI baseline #4 and intake #3 are completed. This refresh belongs to
  #31; a full UA semantic graph, external memory service and cross-repo harness
  are outside this cleanup. UA pin is recorded in the RI config/notice.

## Open work

Verify live state before starting; these are outstanding acceptance items at the
snapshot, not authorization to implement or deploy them all.

| Issue | Remaining intent |
| --- | --- |
| [#31](https://github.com/oborskyivitalii/oborskyivitalii/issues/31) | Review and merge the RI/map/agent-memory cleanup plus acceptance policy, review/handoff, RI/CI coupling and bootstrap; recheck exact-head criteria/gates. |
| [#1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1) | Overall launch: production, rights and physical-device acceptance. |
| [#13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13) | Real iPhone/iPad Safari and modest Android Chrome on the exact digest; independent production release, production-origin checks and actual rollback exercise. |
| [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8) | Production URL/canonicals, activation, live links/robots/indexability and real analytics; staging setup is complete. |
| [#7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7) | Site/publication license decision and editorial rights. |
| [#6](https://github.com/oborskyivitalii/oborskyivitalii/issues/6) | Worked cross-repository adapter/edition/manifest scenario and negative cases. |
| [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5) | Real article HTML/PDF adapter migration and exact edition manifest. |
| [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2) | PMDay explanatory article, matching deck/PDF and editorial/rights acceptance. |
| [#11](https://github.com/oborskyivitalii/oborskyivitalii/issues/11) | Post-launch buyer-intent guides; separate from first-launch blockers. |

## Next session

1. Read root/scoped AGENTS; fetch current main and the owning issue/PR, including
   commits, complete diff, feedback and checks.
2. For #31, read its AC policy, linked analysis/review and RI/CI map; run the
   mapped checks on the exact head and reconcile each AC and remaining gate.
   The project prompt is [PROJECT-BOOTSTRAP.md](PROJECT-BOOTSTRAP.md).
3. Preserve the completed #28/#14 outcome. Select the next launch/publication
   increment from its existing issue and the maintainer's current direction.

## Maintenance

Replace stale snapshot/next-step entries after meaningful progress; keep the
verified date, exact ref and evidence links. Maximum 120 lines. This is one current
handoff, not an append-only changelog. Put technical logs in the PR and durable
intent/decisions/outcomes in the issue. Rebuild/verify RI after changes. No secrets,
private messages or unverifiable future claims. See CONTRIBUTING for the workflow.
