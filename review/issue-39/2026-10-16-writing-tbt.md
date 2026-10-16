# Issue39 — 16 October Writing TBT diagnosis

Owner: #39, [authorized bounded continuation](https://github.com/oborskyivitalii/oborskyivitalii/issues/39#writing-tbt-bounded-20261016), PR40.
Role: implementer self-analysis; no independent human release review.
Inspected clean source: d486847 / tree86c9ee58, including main321b7066.
This report changes diagnostics and handoff only. Keep PR40 Draft and stop after
steps1/2; Ready, whole preflight, staging, merge and production are deferred.

## Intent and method

Repeat Writing mobile/simulated Lighthouse on the identical source-bound staging
edition, retain every timing/CPU/network observation, and identify a measured
concern before considering a finite correction. Preserve the original200ms TBT
budget, complete scene/formula/atmosphere, quality/cache/clock/lifecycle cases,
rights and publication controls. This local diagnostic is not hosted admission.

Cold-build the clean source with the existing artifact, Color rendition and
staging-edition producers. Verify the exact frozen artifact before each series.
Use pinned Lighthouse and Chromium153 headless shell on this Linux AMD EPYC
runner, fresh browser processes and unique debug ports. All trials use the native
mobile/simulated configuration with CPU slowdown4 and the original three audit
categories. Run sequentially, with no benchmark/scanner/source-test concurrency.
Retain one-second process CPU, load and cgroup observations, full configurations,
network records, traces and every failed/over-budget measurement.

Five unchanged baseline trials precede three balanced, reversed/rotated
four-way attribution repetitions. A separately labelled function-sampled baseline
is excluded from ordinary medians. Finish with three balanced baseline/2D-transform
pairs. Total:23 ordinary observations plus1 profiled observation; no browser,
collection, profile or cleanup error. Do not select a best-run subset.

## Findings and dispositions

| Series / intervention | All unprofiled TBT observations, ms | Median, ms | Disposition |
| --- | --- | ---: | --- |
| Initial unchanged baseline |126;170.5;420;114;167|167|One of five exceeds200; unresolved.|
| Attribution unchanged baseline |136;225.5;310.5|225.5|Two of three exceed200.|
| Omit formula submission only |102.5;143;149.5|143|Causal control; never a publication candidate.|
| Omit atmosphere CSS writes only |102.5;193.5;77|102.5|Causal control; never a publication candidate.|
| Omit Canvas shape submission only |69;90;76|76|Causal control; never a publication candidate.|
| 2D-pair unchanged baseline |129;175;135.5|135.5|Retained separately, not substituted for other trials.|
| Equivalent2D atmosphere transform |527;174.5;209.5|209.5|Rejected: worse than its paired baseline.|

The separate profiled unchanged observation is227.5ms; instrumentation changes
its workload, so it supplies function attribution, not performance acceptance.
Across all11 ordinary unchanged observations,3 exceed200ms; their pooled median
is167ms. Pooling is descriptive only: the ordinary staging profile remains its
original native single-trial route and production retains its original medians.
No threshold, aggregation rule or profile is changed to admit this result.

| Finding | Evidence and implication | Affected acceptance | Disposition |
| --- | --- | --- | --- |
| F01 | Unchanged bytes produce both passing and failing observations on the same runner. Cgroup throttling count/time increases are zero in all three series; monitored load remains modest. Parallel source tests cannot explain every remaining excess. Shared-host scheduling variation is not excluded. |AC03 native performance|Open.|
| F02 | Omission controls consistently reduce the measured workload: Canvas painting and atmospheric updates materially contribute. Formula-only omission also reduces this series' median. These interventions overlap and change visual work; differences are not additive or an exact partition of TBT. |AC03 runtime preservation|Localize owners; never ship omitted features.|
| F03 | In the420ms trial, two renderer tasks last59.425/57.817ms, containing52.329/43.984ms browser Commit but only6.10/13.05ms frame callbacks. Other failing observations combine initial navigation/DOMContentLoaded work with first/subsequent scene frames. Simulated TBT is modelled; raw trace task durations must not be equated with the reported metric. |AC03 performance diagnosis|CPU-only model prewarming is not established as the remedy.|
| F04 | Main-renderer CPU samples resolve drawLineRun, draw, paintShapes, setPaintState, projectedWorld/face preparation and paintFormulaTriangle; navigation save/reading initialization also appears. Profile ownership follows the renderer's Profile ID even when ProfileChunk is emitted by its profiler helper thread. |AC03 measured code ownership|Inspect site/engine/lifecycle.cjs, renderer.cjs and navigation.js, plus atmosphere styles; no claim of one isolated defective instruction.|
| F05 | The finite existing2D-transform intervention retains projected translation but raises its paired median135.5→209.5ms and includes527ms. |AC03 unchanged visual/performance contract|Reject; do not commit a regression.|

The no-formula private copy uses the existing closed derivation machinery and
filters only shapes whose kind is formula. Its inherited generic omission prose
is not the intervention definition; the exact checked replacement and patch
hashes in the evidence identify the actual operation. Authored sources and all
published artifacts remain untouched by every intervention.

## Evidence, scope and next decision

The adjacent [compressed execution record](2026-10-16-writing-tbt.json.gz) binds
all24 rows, original raw file SHA256 values, exact source/tree/artifact,
configurations, process samples, function attribution and per-trial trace
analysis. A retained evidence archive includes every timing/CPU/network report,
reproduction harness and exact baseline public bytes. Its text-only export removes
embedded screenshots, with a counted JSON-path redaction list; the original local
raw files remain unchanged and their digests are retained. Export copies are
explicitly separate from original report bytes and supply no release admission.

The earlier failed native235.5ms and local289ms observations remain failed.
Earlier incomplete/loaded local series remain separate history. A parallel c9d1b36
preflight26/26 belongs to another tree and was not substituted for this PR head;
its temporary branch is preserved. Do not overwrite d486847 with that preparation.

Step1 is complete: a controlled, complete exact-source measurement series and
retained evidence. Step2 localizes the material rendering/commit cost and rejects
one measured finite treatment; a safe lossless runtime correction is **not yet
established**. Stop/report this boundary rather than claim the performance defect
fixed or remove visual work. No runtime/compiler/generated site/budget/workflow/
scanner policy changes are delivered by this diagnostic. CS01/CS04/CS05/CS06/
CS07/CS08/CS09/CS10 are preserved by keeping ownership and proportional checks.

## Acceptance and ordered continuation

| AC | Diagnostic result | Remaining gate |
| --- | --- | --- |
|AC01|Exact current source and runner revalidated.|Historical/provider acceptance remains separate.|
|AC02|No domain/topology operation.|Live DNS/redirect/TLS acceptance stays open.|
|AC03|Complete24-observation diagnostic; current performance is not reliably within200ms;2D treatment rejected.|A measured lossless correction, exact-source/native admission, original full/device/rights/independent/recovery gates.|
|AC04|Versioned findings, raw identities, self-review and explicit stop recorded.|Maintainer's next bounded implementation decision and later review/merge gates.|
|AC05|No public-domain acceptance supplied.|Actual production origin/TLS/redirect acceptance stays open.|

1. Under the next bounded continuation, isolate a lossless treatment of the
   measured rendering/atmosphere/native-commit cost; retain controls and reject
   changes that only remove content, reduce quality or shift the measurement window.
2. Verify that treatment with paired repetitions and preserved scene/flight/cache/
   lifecycle/rights cases. Any changed runtime identity needs its exact reviewed
   controller registration before admission; do not broaden the registry.
3. Only after a separate continuation, run current Ready/source and whole26-family
   preflight, ordinary Cloudflare staging, identical-tree main merge, then the
   separately authorized production route.

Whole release ACs remain unchanged/open; no staging, merge or production claim.
