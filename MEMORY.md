# Session memory

Dated continuity, not live authority. Last verified: **2026-10-11**.

## Snapshot

- Protected main inspected at `12bf2a6d66be766a1e3f2c28b2e70c0bbba0f1e2`,
  tree `ec19106b0764890f5cedc2d96febc468454a6213`; PR73 is merged. Revalidate live tip.
- [#72](https://github.com/oborskyivitalii/oborskyivitalii/issues/72) owns the existing
  staging/Pages/archive controller and its confirmed project-base repair.
  Isolated preparation: `work/issue-72-pages-basepath-20261011`, based on main;
  [repair evidence and decision route](review/issue-72/2026-10-11-pages-basepath.md).
  Source changes are dirty preparation; no repair commit, PR, integration or
  hosted acceptance is claimed by this checkpoint.
- [#69](https://github.com/oborskyivitalii/oborskyivitalii/issues/69) and
  [PR71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71) retain runtime
  ownership. Bounded staging tested head `f111368f1f77b6f5027f71e6287d256d914aa2fc`,
  tree `b0244d68a2645be1eb9c81abc5e3700a4c1168d2` in
  [run 38157594946/1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38157594946).
- That run passed bounded build/static/host/functional/performance/gate and
  Cloudflare promotion. Pages job `114526430944` failed during normalization:
  configured base `https://oborskyivitalii.github.io/oborskyivitalii`, actual
  pathname `/oborskyivitalii`, expected `/`. No Pages upload/deployment occurred.
  Merge admission failed; mirror recovery `114526493004` succeeded and verified
  the previous Cloudflare package. The overall attempt remains failed.
- Pages configuration now responds successfully in the official action; this
  does not prove all environment/ruleset settings or a live Pages publication.
  Production remains disabled; no production/domain activation is recorded.

## Decisions

- Maintainer accepted #72's plan and implementation on 11 October. The runtime
  rebase/merge/staging request remains with #69; production/domain/DNS activation
  is excluded. Green source fixtures cannot supply any retained release decision.
- Drafts use build/package/HTTP prototypes. Ready PRs require actual raw-head
  source/RI/issue admission before owner `/stage`; profile cases and original
  performance budgets remain unchanged.
- Pages staging preserves the configured deployment base, receipt/recovery and
  `/staging/` subtree. Original public manifest bytes stay unchanged; only host
  transport state and generated fallback links gain the base prefix. Legacy
  receipts without a prefix mean origin root only. Production remains restricted
  to the existing canonical origin root and all full release gates.
- `/stage` loads its trusted controller from protected main. A candidate-only
  Pages correction cannot repair the observed old-main failure. Prepare a
  concrete reviewed #72 repair PR, then obtain the explicit scoped maintainer
  integration decision. No bootstrap exception or failed-admission waiver exists
  in this checkpoint. After integration PR71 must rebase and stage afresh.
- Permanent Cloudflare alias remains
  `https://staging.oborskyi-author-ci-staging.pages.dev`; no project or DNS change.
  Required `Staging admission` setting evidence remains pending; retain existing
  `checks` and `Local navigation and RI freshness` strict contexts.
- Immutable production tags, durable Releases, protected production identity,
  external full/device/rights/review gates and dedicated App authentication retain
  their existing #72/#8/#1/#7 owners. No production activation is authorized here.

## Open work

| Owner | Next acceptance route |
| --- | --- |
| #72 | Review the concrete Pages repair, source-clean CI and scoped main-integration decision; then observe actual project-base publication/recovery and required settings. Complete issue criteria remain open. |
| #69 / PR71 | Rebase onto the integrated repair, regenerate companions, fresh source/RI/issue checks, dual-host staging, unchanged-tree merge admission and post-merge identity. Original device/find/bfcache/full-cost gates stay separate. |
| #49 / Draft PR53 | Fragment-flight work; revalidate current head and visual acceptance. |
| #39 / Draft PR40 | Canonical Pages/domain preparation; preserve release decisions. |
| #45 / #36 / #41 | Original editorial/visual/review/device gates in live owners. |
| #1 / #13 / #8 | First release, devices, recovery, indexing and analytics. |
| #7 / #5 / #6 / #2 / #11 | Rights, editions, adapters and post-launch guides. |

## Next session

1. Revalidate main, #72 repair execution, PR71 exact head/checks and failed stage
   recovery. Read the linked confirmed-failure artifact before changing controllers.
2. Finish source-bound repair checks and independent review; make the complete
   repair reviewable before requesting its scoped main-integration decision.
3. After that reviewed integration, rebase PR71 and create a fresh `/stage`
   attempt. Earlier runtime-only passes cannot admit the changed candidate.
4. Require both publishers/recovery, exact-tree merge admission and post-merge
   identity. Update actual issue criteria only for wholly verified conditions;
   retain production and external release gates.

## Maintenance

Keep five sections within 120 lines; rebuild RI after changes. Detailed logs,
measurements and history belong in their owning issue/PR/review. Never store
private correspondence, credentials or inferred approvals.
