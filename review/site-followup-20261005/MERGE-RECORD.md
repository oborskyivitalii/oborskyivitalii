# Repository integration — executed 5 October 2026

The maintainer explicitly requested readiness review and merges. All four
pre-existing site PRs are merged into `main` in this order, using **merge commits**:

| PR | Merge commit | Verified resulting tree |
| --- | --- | --- |
| [#9](https://github.com/oborskyivitalii/oborskyivitalii/pull/9) | `faffaa744b98842fee4657c424b3e1536168e502` | `aa586fa407091c93af62213c5881d8286f492fcc` |
| [#10](https://github.com/oborskyivitalii/oborskyivitalii/pull/10) | `f97a4fa2aa75240b71f651924e4fbbf0a7079d89` | `a10cb219565624922b96d728c75395cce2aaa522` |
| [#16](https://github.com/oborskyivitalii/oborskyivitalii/pull/16) | `b399b8f0bd6744dc655cccb5bb975724030f810a` | `33419cf3906426096f9974fe17f1b4681cf644e9` |
| [#17](https://github.com/oborskyivitalii/oborskyivitalii/pull/17) | `2ebdd731d5dcf1e12f43f60dd0b3a6ec49b94684` | `24be24f317d7580a8c8a06fc9047d86d5af31a7d` |

Each dependent PR was retargeted to main. Expected-head SHA guards were used.
#9 exactly matches the accepted policy/RI tree. #10 received the two publication
guards copied verbatim from #16, then the derived RI correction; its runtime and
public bytes remain those of `da06b6d`. Head `1770075` passes fresh source/build,
runtime and navigation checks. Its legacy Linux matrix was still running and
static/Windows jobs queued at merge time; they are not claimed completed. The
identical original public/runtime edition has passing technical evidence.
The current maintainer policy requires basic update checks and full hosted
staging/production automation. No protected required check was bypassed.

#16's base-integration commit `256b8a6` has both the reviewed engine head and #10
merge as parents. The guard/RI overlap resolves to the **unchanged entire checked
engine tree**. #17's final main tree is the original checked `f99b8c2` tree.
Newly triggered legacy jobs on history-only heads do not become new full-source
acceptance merely because the tree is unchanged. Original failed release gates
remain failed for missing independent/device evidence.

Issues [#3](https://github.com/oborskyivitalii/oborskyivitalii/issues/3) and
[#4](https://github.com/oborskyivitalii/oborskyivitalii/issues/4) were closed as
completed after the accepted main-tree check; their acceptance checkboxes and
completion records are updated. All other initial issues remain open with the
specific remaining criteria in [REPORT](REPORT.md). Completion comments are
present in every merged PR.

The newer local optimization plus expressive-primitives edition is a separate
**Draft continuation**, not merged into this baseline. Its idle/cold-transition
failures are retained in [VALIDATION](VALIDATION.md); [Sol tasks](SOL-TASKS.md)
define the next repairs. The updated staging runbook belongs to that continuation.

No site host was provisioned or uploaded, no Pages setting or DNS changed, no
analytics account/token activated and no site deployed. Both publication guards
remain false; the prepared analytics configuration remains disabled.
