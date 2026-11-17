# Issue #183 — Stable Staging source-test shards

The seven article pages are already live. PR #210 records their publication dates. The separate controller prerequisite addresses the source-suite deadline that blocked [run 43936992824](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/43936992824) before candidate upload. The initial protected base is `d37d099b519536e042cdbb261dbbbc5e2cbce7c5`. This prerequisite does not establish acceptance of the date annotations.

## Scope and test impact

- AC05 style and exact source checks. CS01/CS04 keep workflow routing in the existing staging controller and all partitioning and raw result accounting in the shared source shard runner. CS05 applies to the controller and prepublication CLI adapter. CS07 retains the 600-second limit per shard and uses independent CI runners. CS08 maps the focused source, prepublication and workflow checks plus the bounded style guard and independent review.
- AC06 source-bound release evidence. Explicit full Stable Staging requires all eight staging-profile results from the workflow attempt for the exact candidate before upload. Other prepublication and hosted checks still establish their existing evidence. Compatible content continues to use its authenticated content selection. The approved article batch and other acceptance criteria retain their scope.
- Requirements preflight `/root/requirements` used a fresh no-history execution to inspect protected base `d37d099`, PR #210 head `f176457`, the failed run and live #183. Common prompt blob `68796daaf4313f64da381b1628866267fd9e263b`, role prompt blob `3e6330fc4a1a01d33e2dcae6e0f35d3f3471c1e4`. Negative cases include missing, mixed, stale, extra, failed, skipped or cancelled shard results. Preserve independent preflight failures and the original failed run.

Local verification, independent candidate review and hosted acceptance are pending.
