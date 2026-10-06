# One current site candidate — 6 October 2026

The maintainer stopped broad staging iteration and requested an issue audit,
one current Color/performance PR, and a focused cold-Writing comparison.

## Candidate and prior evidence

Existing #23 is the sole active runtime PR, targeting main. GitHub compare proves
the full #18 head (2201411f) and #22 head (8f62e948) are ancestors of #23 head
1f307962, with zero commits behind. #18/#22 are closed as superseded; their
branches/history are preserved. CI-only #26 is already merged into main.

The actual latest hosted Color artifact in run 37439947574 belongs to #23
1f307962 at https://91f6ca37.oborskyi-author-ci-staging.pages.dev. The controller's
main SHA identifies the trusted workflow, not an older tested public rendition.
HTTP/source/smoke/captures/contrast/performance/macOS checks pass; static and
Linux/Windows functional checks fail, so promotion is skipped. No new full run
or stable staging promotion is part of the current narrow diagnosis.

## Issue audit

| Issue | Completed | Remaining / disposition |
| --- | --- | --- |
| #1 launch | Five-route English site, complete labelled archive, themes, source-linked content and working preview | Final visual/editorial/rights acceptance and actual production launch; keep open |
| #2 PMDay | Publication ownership and sequence recorded | Accepted article, selected deck/PDF edition, visual/rights review and publication; keep open |
| #5 publisher migration | Adapter ownership and dependencies identified | Pinned migration and a real HTML/PDF article pipeline; keep open |
| #6 agent routing | Repository map, intake rules and local RI navigation exist (#3/#4 complete) | Cross-repository adapter/edition/manifest harness and worked route; keep open |
| #7 rights | Portrait/source/attribution records and bounded public references | Site license choice and actual release rights/editorial acceptance; keep open |
| #8 hosting | Cloudflare preview, CI-only publication, main ruleset and explicit staging controller work | Successful full stable promotion, recovery and production URL/indexability/analytics activation; keep open |
| #11 buyer guides | Search-intent research and editorial handoff | Original guides and post-launch evidence; deferred until launch, keep open |
| #12 audit/runtime | v8 audit, source remediations, camera/endpoint fixes and raw evidence | Current Writing cold performance plus retained functional defects; keep open with a bounded current task |
| #13 gates | Locked scanners, source-bound artifacts, full aggregation and fail-closed promotion exist | Resolve actual failures, successful current full run and independent/device release evidence; keep open |
| #14 visual | Fog/atmosphere, contrast, shared motifs, Color/flight and captures implemented | Maintainer acceptance of the current visual edition and retained runtime checks; keep open |
| #15 source/engine split | Assessment, plan, canonical site sources, incremental generation, immutable snapshots and one-block experiments; #16 merged | Closed as completed; hosting/recovery remains #8, runtime #12, release evidence #13, visual #14 |

Already closed #3 (issue workflow), #4 (RI navigation) and #19 (reverse-end source
repair) retain their completion records. An issue's implemented subtask does not
make an unfinished publication or release complete.

## Focused performance protocol

`Writing cold comparison` packages three explicit inputs through CI:

1. Original #23 base at 174bef1f, before the later Color-hosted integration.
2. Current #23 base, with the latest shared runtime repairs.
3. Current #23 Color derived from exactly the second artifact.

Six balanced serial rounds use Chromium, dark 390×844/DPR3 and synthetic CPU×4.
Each direct Writing boot and Research→Writing itinerary starts a new browser
process/context with cache disabled. Measure direct startup, the first two scroll
gestures, cold Research→Writing, the return to Research and warm Writing entry.
Retain every raw RAF callback, paint gap, preparation event, long task and failure.
Use the existing 80ms transition p95 and other unchanged limits. No pooled value
can erase a failed window. No tracing/fine-stage observer perturbs the primary run.

This isolates revision changes from Color effects. It is a laboratory comparison,
not a physical-device or full hosted gate. The requested run was bootstrapped on
the PR; subsequent executions require explicit workflow dispatch. Ordinary PR
updates retain the basic checks and short preview smoke only.

Prepared static helper fixes from the first full run are carried in this same
PR: three lint errors, local-check complexity and exact authored-runtime scanner
selection with import-closure fixtures. No public runtime or budget is changed
by these fixes. The unrelated Windows replay and new broad static workflow are
not included in this focused increment.

## Actual comparison and interpretation

[Run 37444601098](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37444601098)
completed all 18 trials at candidate d8cddecf. Chromium 153.0.8010.12 on Ubuntu
24.04 / AMD EPYC 7763, pinned Node 24.19.0. All three artifacts are clean and
source-bound; current Color derives from the exact current base artifact.
The current Color public digest matches the earlier hosted 1f307962 rendition:
this consolidation changes helpers/evidence, not measured runtime bytes.

Values below are medians of six per-trial measurements, in milliseconds unless
specified. Raw failures are retained; the diagnostic job's successful completion
means the experiment completed, not that every performance budget passed.

| Measurement | Original #23 base | Current base | Current Color |
| --- | ---: | ---: | ---: |
| Direct Writing scene ready | 354.2 | 346.0 | 420.9 |
| Direct boot largest painted callback | 165.9 | 163.7 | 177.5 |
| First scroll painted callback p95 | 19.1 | 19.7 | 28.3 |
| Cold Research→Writing callback p50 | 16.6 | 18.4 | 25.1 |
| Cold Research→Writing callback p95 | 37.0 | 33.5 | 80.8 |
| Cold Research→Writing largest callback | 83.2 | 85.3 | 80.8 |
| Cold transition actual Canvas paints | 23 | 23 | 18 |
| Cold transition observed paint rate, Hz | 15.6 | 15.4 | 12.5 |
| Cold transition input-to-ready | 1402.5 | 1397.1 | 1400.0 |
| Warm Writing callback p95 | 22.3 | 27.0 | 29.0 |
| Cold failures under unchanged transition budgets | 0/6 | 0/6 | 4/6 |

Cold p95 values, preserving every trial:

- Original base: 40.4, 33.5, 36.8, 37.2, 30.6, 37.3.
- Current base: 40.2, 34.5, 31.5, 32.1, 32.4, 35.7.
- Current Color: 80.7, 88.8, 71.5, 76.5, 81.0, 80.9.

The two base editions are broadly similar in this bounded experiment; the latest
shared repairs do not show a new cold-entry regression. Color is measurably more
expensive: about 22% later direct scene readiness, 44% greater first-scroll p95,
37% greater typical cold-flight callback cost, and 19% fewer observed paints per
second. All warm Writing transition windows pass existing limits.

The p95 jump is not evidence of a 2.4× longer transition or a larger single stall:
end-to-end flight is about 1.4s for all three, and Color's largest cold callback is
comparable to the base. With 18–19 painted callbacks, the existing percentile
definition selects Color's maximum; with 22–24 it excludes the base's largest
single callback. Retain this sampling explanation alongside the unchanged gate.
Actual paint-rate/callback and first-scroll differences establish additional Color
cost independently of that percentile effect.

Cold Writing also has a shared initialization problem: the largest direct-boot
painted callback is roughly 153–197ms across these trials, including the base.
The next focused optimization should separate that common first-mount/model/layout
work from Color's repeated frame work. This run does not identify an exact
line-level cause or change the runtime to conceal it.

Artifact 11403052120 was downloaded and its GitHub archive SHA256 verified.
[summary.json](summary.json) records identities, all trial summaries and archive/
raw/gzip hashes. [comparison.json.gz](comparison.json.gz) preserves the exact raw
CI JSON, including every frame, preparation event and failed budget, beyond
ephemeral Actions retention. No full/native/soak suite was rerun for this diagnosis.
