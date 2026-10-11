# Session memory

Dated continuity, not live authority. Last verified: **2026-10-11**.

## Snapshot

- Main inspected at `93a818dbc3239b97b47b7d56edb83f5a7ebf65fc`; revalidate live tip.
- [#72](https://github.com/oborskyivitalii/oborskyivitalii/issues/72) owns the accepted
  prototype/staging/Pages/production-archive plan. Implementation is authorized on
  `work/issue-72-prototype-staging-release-20261011`; [Draft PR #73](https://github.com/oborskyivitalii/oborskyivitalii/pull/73).
  [Analysis and handoff](review/issue-72/2026-10-11-analysis.md).
- PR67 is merged; Cloudflare stable alias maps to its accepted source
  `4a7b44ff0877961d5a2d0dc8233b8ae643ca340c`, deployment `5ee165bf`, on 9 October.
  This API identity is not a new direct HTTP health observation.
- PR73 prototype `f86f79a0...` passed Actions run `38138327025`: link in 75 seconds,
  full prototype workflow 101 seconds; source/RI/acceptance/browser admission deferred.
  Clean local mapped acceptance and 375 additional source cases passed for that commit.
  Revalidate its latest head/preview after metadata follow-ups.
- All 33 refs were inspected: no production branch/tag/Release or accepted Pages
  production publisher on main. Pages administration remains unobserved.

## Decisions

- Maintainer accepted #72's full plan/archive clarification and instructed
  implementation on 11 October. First production/domain activation retains its
  existing release decision; green fixtures cannot supply that decision.
- Drafts publish build/package/HTTP prototypes. Ready PRs run real source/RI/issue
  admission before owner `/stage` and unchanged bounded staging regression.
  Deferred names cannot impersonate currently required main contexts.
- Permanent Cloudflare alias needs no project or DNS change:
  `https://staging.oborskyi-author-ci-staging.pages.dev`.
- Pages uses `/staging/`, a pre-test badge/noindex/analytics-free edition, preserved
  production-root hashes and serialized exact recovery. Pages/variable setup and
  required `Staging admission` need live evidence after controller bootstrap;
  the current strict ruleset still requires `checks` and RI.
- Production policy: immutable `prod-YYYY-MM-DD.N` tags and durable GitHub Releases
  retaining exact packages/manifests/full evidence, protected current production
  ref, deployment identity and active/archive PR labels after live checks. Archive
  publisher/ref/label/rollback source integration now exists, with separately
  hashed prospective production previews and durable full/raw/live evidence.
  Production stays absent/disabled; actual activation is expressly excluded.
  Pages, variables, environment/ruleset and Release immutability administration
  remain unobserved because the connector has no administrative operations.
- Original #41 content/sitecase evidence stays in its review records. #65 harness
  cleanup is merged/closed; task snapshots stay owning-policy-only.

## Open work

| Owner | Next acceptance route |
| --- | --- |
| #72 | Complete source checks/PR preview; reviewed bootstrap, Pages/settings/merge admission and live staging/recovery. Production uploader/ref/label/rollback source is implemented; no activation is authorized. All AC01–AC10 remain open pending complete conditions. |
| #49 / Draft PR #53 | Fragment-flight work; revalidate head and visual acceptance. |
| #39 / Draft PR #40 | Pages/domain preparation; preserve release decisions. |
| #45 / #36 / #41 | Original editorial/visual/review/device gates in live owners. |
| #1 / #13 / #8 | First release, devices, recovery, indexing and analytics. |
| #7 / #5 / #6 / #2 / #11 | Rights, editions, adapters and post-launch guides. |

## Next session

1. Fetch main, #72 and execution PR; inspect exact source/CI/deployments.
2. Continue #72's versioned handoff and remaining implementation on the same PR.
3. Reconcile actual AC boxes with current-source/live results; no fixture proves
   host activation, durable Releases or independent review.
4. Keep launch/domain owners; merge/release only by maintainer decision.

## Maintenance

Keep five sections within 120 lines; rebuild RI after changes. Detailed logs,
measurements and history belong in their owning issue/PR/review. Never store
private correspondence, credentials or inferred approvals.
