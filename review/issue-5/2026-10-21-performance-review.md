# Issue 5 — 2026-10-21 performance suite and findings

Owning issue: [issue5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5),
[performance scope](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issuecomment-6303208822).
Owning execution: [PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79),
[scope receipt](https://github.com/oborskyivitalii/oborskyivitalii/pull/79#issuecomment-6303209200).
Role: implementer self-analysis; prepared collector independently reviewed below.
This is the existing issue5 route, continuing AC08, AC11 and AC12. It does not
supply editorial, rights, physical-device, merge or publication decisions.

## Intent and acceptance

The owner requested an assembled site performance suite, execution of the
strictest available performance matrix, all results in this issue/PR and a
findings report. Existing thresholds and case counts remain unchanged.

The source inventory is `tools/quality/README.md`, `budgets.json`,
`test-profiles.json`, `lighthouse.cjs`, `motion.cjs`, `validate.cjs`,
`SITE-CHECK-PROFILES` and `SITE-RELEASE-GATES`. The full performance worker in
`site-release-checks.yml` runs 30 Lighthouse trials then motion independently.
The prior bounded staging run is a historical baseline, not full acceptance.

| Component | Assembled coverage | Decision rule |
| --- | --- | --- |
| Existing Lighthouse | 5 routes × mobile/desktop × 3 trials = 30 | Each route/profile three-run median: LCP ≤2500ms, TBT ≤200ms, CLS ≤0.1; score ≥90 secondary |
| Existing sustained motion | 5 routes × desktop/mobile/mobile CPU×4 × idle/scroll/Off/reduced = 60 windows | Original raw-probe checks; mobile×4 paint p95 ≤33ms, idle busy ≤20%; zero Off/reduced work |
| Existing navigation | 3 profiles × 8 flights = 24 | Original paint/preparation/gap/pacing checks and equivalent-ready ≤3200ms |
| Existing retention | 3 profiles × 40 warm-cache route cycles = 120 | No DOM-node or event-listener growth after comparable warm state / forced GC |
| Existing soak | Heaviest measured mobile×4 route, 300 seconds observed at mobile×1 | Ten distinct 30-second windows; no crash/fallback; Off works; comparable heap retained as diagnostic |
| Reader supplement | Per actual artifact article: 6 Lighthouse trials and 12 motion windows | Same declared profiles, medians, raw-probe and motion limits; cannot substitute for original five-route evidence |

`node tools/quality/performance.cjs` composes the existing two runners and the
reader supplement sequentially into fresh separate report directories. It
continues independent commands after failure and verifies frozen public bytes
before/after; no automatic retries. No workflow is dispatched, staged or published
by that entry point. The supplement uses the artifact's article inventory rather
than publication-specific constants. Its collector Git identity is separate from
the measured artifact identity. Original five-route validation remains the
default; explicit supplemental routes must still have all three trials in both
original profiles. CS01–CS10 apply to the authored check owners and existing AC11;
source-negative tests cover failure propagation, missing/mislabeled trials,
unsafe/missing article inventory, positive paints and invalid zero-work evidence.

## Measured identity and environment

Frozen site source `283b32f65f0589e85c0aa914d0990704dcf8ac38`,
tree `643304fa64c945c01f3b21e6d1d4f0d85696f8f5`, Color fingerprint
`f0b42c82040361ae0c681950d8b336d0eda3b5251a5a4b389a212d3a539d0a6c`.
This is the actual staged R18/Cover02 reader. Original controller
[39490652746/1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/39490652746)
provided public artifact12296496248, ZIP SHA256
`9116977727fc050c3845dcfba0cefc522a4e6c444eb07c8aecd0ea0828e25a62`.
Its native GitHub metadata digest and all unpacked bytes were verified. Public
digest `edb8d18387d65ef2c6d67e109f93b95ed6f2fa859dd5afc0c4d87b2e5e14f406`.

The primary run uses the unchanged full runners from that exact clean checkout
and the maintained gzip loopback fixture. This isolates browser/runtime work;
it does not measure live CDN/network latency. Sequential benchmarks, no concurrent
benchmark/scanner jobs. Locked Node24.19.0, Playwright1.63.0, Lighthouse13.5.0;
Linux, eight available CPU threads / cgroup allocation eight CPUs.
Managed Chromium153.0.8010.12 download returned an unavailable HTML page. The
supported explicit `SITE_AUDIT_CHROME=/tmp/chromium` override is actual
Chromium153.0.8010.0, SHA256
`53a15d6c3a3d27dfb54c4ba60278b1683136f70cf1e67e989da7dfbd3d451ef0`.
This environment differs from managed CI and is disclosed, without changing the
locked package/browser declaration. Raw reports retain actual browser/settings.

Run label `20261021-pr79-strict-01`; actual UTC timestamps remain in its execution
receipt (beginning 2026-10-20T22:30Z, already 2026-10-21 in Europe/Warsaw).
The original two commands began before the supplemental runner existed; their
commands, original runner source and supplement source are recorded separately.
Do not claim the newly composed wrapper was the command used for those samples.

## Findings and outcome

**Assembled suite: FAIL.** The original complete five-route performance worker
passes. Adding the actual article exposes a repeatable mobile LCP budget failure:
4202.636ms versus2500ms, +1702.636ms (+68.1%). All three reader mobile trials
exceed the limit. This remains an open product finding; no runtime change or
pass-seeking measurement retry was made.

| ID | Severity | Evidence | Finding / implication | AC | Disposition |
| --- | --- | --- | --- | --- | --- |
| PF01 | Medium coverage gap | Original five-route inventory | New reader was absent from the otherwise complete matrix | AC08 / AC12 | Closed by artifact-driven supplement; its failure remains open as PF04 |
| PF02 | Measurement limitation | Actual browser version/digest | Local153.0.8010.0 differs from managed153.0.8010.12 | AC11 / AC12 | Explicitly disclosed; no managed-CI/device claim |
| PF03 | Medium tail-latency observation | All retained individual trials | Home mobile TBT511ms; Writing256.5ms; reader264ms. Their three-run medians62.5/105.5/87ms pass | AC08 / AC12 | Keep all trials; investigate cold startup tasks without changing median policy |
| PF04 | High | Reader mobile runs1–3 | LCP4225.080/4202.308/4202.636ms, median4202.636ms; median score86 also misses secondary90 | AC08 / AC12 | OPEN: reader performance budget is not met |
| PF05 | Medium optimization candidate | Reader mobile2 network/image audits; tools/site/reader.cjs figure output | Eight eager images transfer596703 of746085bytes (~80%); inspected below-fold images have no loading/srcset attributes. Estimated image savings120964bytes | AC08 / AC12 | Evaluate selective loading/responsive renditions while preserving originals, native/print/reader behavior. Causality of the complete LCP gap is not proved |
| PF06 | Low headroom observation | Original Research CPU×4 and desktop flights | Research idle paint p9529.9/33ms; slowest equivalent-ready3004.1/3200ms | AC08 / AC12 | PASS with limited headroom; retain thresholds and baseline for any optimization |
| PF07 | Supporting memory observation | Ten soak chunks and forced-GC heap | Research heap grows869984bytes (~0.83MiB,22.4%) during5minutes; no errors/long tasks/fallback. Route-cycle DOM/listener counts stay flat | AC08 / AC12 | Watch longer runs; this does not establish a leak or universal leak freedom |
| PF08 | Remaining coverage | Scope of these lab runners | Field INP/RUM, physical devices and reader-specific navigation/retention are not measured by this supplement | AC08 / AC12 | Remain separately owned; lab result cannot close those gates |

### Lighthouse medians

Every row uses all three raw trials with the original explicit settings. A completed
trial is not an individual-budget pass. The original acceptance rule uses medians.

| Route | Profile | LCP ms | TBT ms | CLS | Performance /100 | Metric gate |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| index | mobile | 1956.082 | 62.5 | 0.000000 | 99 | PASS |
| index | desktop | 462.468 | 0.5 | 0.000000 | 100 | PASS |
| research | mobile | 1625.299 | 59.5 | 0.000000 | 100 | PASS |
| research | desktop | 411.856 | 0.0 | 0.000000 | 100 | PASS |
| writing | mobile | 1662.970 | 105.5 | 0.000000 | 99 | PASS |
| writing | desktop | 421.465 | 30.0 | 0.000696 | 100 | PASS |
| talks | mobile | 1589.795 | 30.0 | 0.000000 | 100 | PASS |
| talks | desktop | 402.604 | 24.0 | 0.000000 | 100 | PASS |
| credits | mobile | 1598.726 | 28.0 | 0.000000 | 100 | PASS |
| credits | desktop | 398.187 | 6.5 | 0.000000 | 100 | PASS |
| reader-1 | mobile | 4202.636 | 87.0 | 0.000000 | 86 | FAIL |
| reader-1 | desktop | 821.663 | 0.0 | 0.000000 | 100 | PASS |

There are36 completed trials:30 original plus6 reader, producing12 route/profile
groups. Eleven meet the individual median metric budgets; reader/mobile fails LCP.
Raw report `reader-performance.json` exits1 and remains `pass:false`; its independent
motion collection continued and completed after the metric failure.

### Reader LCP diagnosis and limits

The representative mobile2 LHR identifies the **introduction paragraph** as its
LCP element (`div.reader-content > div.article-body > div.reader-introduction > p`).
The cover is below the viewport (top1294px), and inspected slide03 is at5906px.
The network report observes eight initial image requests totalling596703bytes;
the whole transfer is746085bytes (729KiB). The current figure renderer emits
intrinsic dimensions but no lazy-loading or responsive-source attributes.

The simulated Slow4G/CPU×4 LCP is4202.308ms in that trial, while the same trace’s
unthrottled loopback observed LCP is193ms. These are different quantities. The
LCP-breakdown audit’s observed render-delay181.9ms must not be presented as the
breakdown of the simulated4.20s. Render-blocking theme.js/styles.css have an
estimated220ms saving; image-delivery estimates120964bytes. These estimates do
not prove which change would remove the complete1.70s budget gap. Prioritize a
controlled comparison of offscreen image scheduling and responsive variants,
then inspect actual cold script/layout work, preserving exact source/bytes.

Home mobile1 long-task diagnostics attribute tasks up to203ms to space.js and
100ms to navigation.js. This is URL-level attribution; function-level cause is
not established by these reports. Original Research/Writing mobile and all reader
trials retain traces/network logs (24 files total, all hashes independently checked).

### Motion, flights, retention and soak

All18 route/profile samples have positive Motion-on probes. All36 Off/reduced
windows report zero ongoing callbacks and paints. Seventy-two short measurement
windows completed, in addition to the original soak and navigation observations.

| Route | CPU×4 idle paint p95 ms | Scroll p95 ms | Idle busy % | Result |
| --- | ---: | ---: | ---: | --- |
| index | 24.8 | 22.1 | 12.88 | PASS |
| research | 29.9 | 26.3 | 12.92 | PASS |
| writing | 22.9 | 24.9 | 13.13 | PASS |
| talks | 23.5 | 18.5 | 12.04 | PASS |
| credits | 17.8 | 13.0 | 9.80 | PASS |
| pmday-ai-both-sides:en | 23.4 | 23.4 | 12.25 | PASS |

| Width / CPU | Flights | Max equivalent-ready ms | Its raw-ready ms | DOM nodes before→after | Listeners before→after | Cycles |
| --- | ---: | ---: | ---: | --- | --- | ---: |
| 1440 / ×1 | 8 | 3004.1 | 3854.1 | 5770→5770 | 98→98 | 40 |
| 390 / ×1 | 8 | 2764.6 | 3814.6 | 5774→5774 | 98→98 | 40 |
| 390 / ×4 | 8 | 2956.2 | 4006.2 | 5774→5774 | 98→98 | 40 |

Raw navigation includes the approved programmed presentation; only the existing
verified pacing credit yields equivalent-ready. The slowest equivalent flight
is desktop Index→Talks3004.1ms (raw3854.1ms); mobile×4’s slowest equivalent flight
is Talks→Index2956.2ms (raw4006.2ms). All24 original paint/preparation/gap/pacing
checks pass. All three40-cycle comparisons retain the same warm state and flat
DOM/listener counts; no article retention claim is made.

Research was selected by the existing heaviest-route rule. Its ten disjoint soak
windows observe300076.4ms total. Worst paint p954.2ms; maximum busy8.88%; zero
long tasks/errors/fallback; final Off callbacks/paints0. Forced-GC used heap is
3889004→4758988bytes. This bounded heap observation is supporting evidence.

## Execution and source checks

Original matrix:2026-10-20T22:30:00.142–22:43:50.365UTC (13m50.223s),
Lighthouse233.950s; motion595.176s; artifact verification before/after PASS.
Reader supplement:22:44:16.298–22:45:51.280UTC (94.982s), exit1. Source-only
checks ran in between; no benchmark/scanner ran alongside the measurements.

Clean local collector source is `f65f8629f2dac810d2e50739515f9da1c3d5477e`, tree
`b6f06780c73c9ea68b3982ff88b42e9b06256af3`. Its complete Git delta bundle against
the existing source283b32f is retained so the exact local collector is reproducible.
The final report/evidence commit has additional historical bytes; that does not
change the collected runtime or collector code identities. A separate default
artifact from cleanf65f862 supplied scanner identity; it was not substituted for
the frozen Color staging artifact used in performance measurements.

Basic16 theme/archive +10 Color tests PASS; focused81/81 PASS; code-style guard,
full lint, RI and RI/CI PASS; RI/CI20 tests and RI28 tests PASS. Additional style
tests encountered RI query errors (five, then four) while provisional report files
were not yet registered. Both incomplete-preparation logs are retained as
`style-tests-prepared-ri-stale*.log`. The final correction registers every evidence
path and rebuilds RI before the exact final-source check. No performance trial was
repeated; its final source result is recorded separately in the issue/PR receipt. CS01/CS04 reuse existing artifact, budget and raw-validation
owners; CS02/CS03 have no content/style edits; CS05–CS10 retain pinned formatting,
negative cases, clean identities, owned registry routes and independent review.

## Durable evidence and reproduction

[Evidence summary](2026-10-21-performance-evidence/summary.json) contains all
computed medians/outliers/counts and original report hashes.
[Archive manifest](2026-10-21-performance-evidence/manifest.json) maps every retained
raw member to an independent ZIP, exact length and SHA256. The raw archives are in
the [immutable same-repository evidence tree](https://github.com/oborskyivitalii/oborskyivitalii/tree/9147ecccc96247ee6a1ec40c786cb99db211ad1a/review/issue-5/2026-10-21-performance-evidence).
[Locator and remote verification](2026-10-21-performance-evidence/locator.json)
bind commit `9147ecccc96247ee6a1ec40c786cb99db211ad1a`, tree `8c4d4dc2463571ff5aa5720a84b7b235f80371c0`,
parent source283b32f, all18 Git blob identities and their verified remote bytes.
Extract all raw ZIPs into one directory; names preserve original/reader/source-check separation. The
input manifest, original/supplement execution recipes and collector Git bundle
are retained with the raw results. There are15 independent raw ZIPs, 96 retained members,
44398581 compressed bytes. Exact ZIP/member hashes are in
the manifest; every archive and member was re-read and verified after writing.
The evidence-only branch is not an implementation/release candidate and must not
be merged. Keeping44.4MB of raw archives outside the active source tree preserves
its unchanged250MB RI hash bound and all previous history. No tracked source is
hidden or excluded. Both manifest and summary are also retained in this PR.

Fresh immutable hosted identity checks also PASS:43 public inventory files plus
root and actual404 (45 observations), exact source283b32f/tree643304fa/publicedb8d,
bytes/MIME/noindex/nosniff, hosted profile staging. This is identity verification,
not a hosted-network performance benchmark. The complete hosted report is retained.

To reproduce on the verified same artifact, install the unchanged locked toolchain,
set SITE_PUBLIC_DIR / SITE_ARTIFACT_MANIFEST / fresh external SITE_REPORT_DIR and
run `node tools/quality/performance.cjs`. The new wrapper was source-tested; the
observations above came from the separately recorded original and supplement
commands. The wrapper itself was not retrospectively claimed as the executed
command. Browser override and actual hardware must remain explicitly recorded.

Current field guidance distinguishes lab from field results:
[Google Web Vitals](https://web.dev/articles/vitals) uses LCP/INP/CLS and field
75th-percentile evaluation. This lab measures TBT and does not establish field
INP. [Lighthouse variability](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md)
and [scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
also support retaining a distribution rather than selecting a favorable trial.
The Chromium DevTools MCP interface was unavailable; the repository’s pinned
standalone Lighthouse/Playwright runners supplied these measurements.

## Independent review and acceptance

Separate reviewer `/root/pr79_perf_review` independently reconciled all36 raw LHRs
against summary settings, metrics, categories, environment and fetchTime; all
use Lighthouse13.5.0 / HeadlessChrome153.0.8010.0, with no runtime errors/warnings.
It checked all24 retained trace/log files and their SHA256/length/gzip validity,
replayed the original validators offline, confirmed the reader LCP failure and
all motion/retention/soak results, and corroborated the limited causal statements.
Final report/archive and publication receipts remain for its last review.

| AC | Evidence | Outcome / remaining gate |
| --- | --- | --- |
| AC08 | Original full worker + actual reader supplement | Main PASS; reader/mobile LCP FAIL. Whole reader acceptance remains open |
| AC11 | Reviewed harness / negative tests / lint / style / RI / exact source bundle | Prepared collector source checks PASS; final report/evidence review remains recorded separately |
| AC12 | Same issue5/PR79, original native artifact, raw measured identities and durable results | Audit delivered after final evidence review; whole delivery/publication decisions remain separately owned |

Existing AC13/AC15 and historical AC23 controller ticks are preserved; no new
whole criterion is ticked. This audit does not invalidate the already-observed
source283b32f stable staging receipt, does not stage the new collector/report head,
and does not supply merge/publication or field/device acceptance. PR79 remains
Draft while the new reader performance finding and original whole-feature gates
are open. The immediate follow-up is a source-bound reader load optimization,
then a newly declared baseline/candidate comparison with every outcome retained.

### Prepared collector independent review receipt

Separate non-implementing reviewer `/root/pr79_perf_review` inspected the actual
tracked diff and new files against source283b32f/tree643304fa. Seven-path substantive
manifest SHA256 `50c7657cc306b467236a15c6af810f240c26f51203cf8aaa93e37e2e3c7bcc4e`.
It found and re-reviewed three corrected Medium issues before any reader sample:
RF01 required comparison with verified public article inventory to prevent an
emptied manifest metadata false PASS; RF02 required incremental/final-failure
execution receipts; RF03 required separate wrapper/collector identity. Actual
reader metadata omission was independently reproduced, then its correction was
verified with the frozen artifact. Final verdict: no remaining blocking source
findings; may advance to supplemental measurement. Raw-result acceptance, broader
source/RI checks and durable evidence remain pending. No browser/benchmark/scanner
was run by the reviewer.

Re-reviewed SHA256: performance.cjs `5b9f198fd9da5eaa2043cf031b3c68a4ea62f368d6c8d0f7fbc88d1e21fa9de1`;
reader-performance.cjs `1a1d9d238270b159681d269b5e71f2f2f669d40c6d89b8d5b0249f7d1ddeae10`;
validate.cjs `1bb6fc30a52cfc37ae05872a1a14e4467e6c68efd1dac0985a115d64da2c45e3`;
performance-suite.test.cjs `227fb6472428f07484c9f1ee092760a74b2645cb2361993b0ad7ed336b9e22d3`.


### Final report and remote evidence independent review receipt

Separate reviewer `/root/pr79_perf_review` found no remaining blocking
report/evidence findings and approved advancement to final source checks and Draft
PR publication. It independently checked the live evidence ref9147ecccc96247ee6a1ec40c786cb99db211ad1a,
native tree8c4d4dc2463571ff5aa5720a84b7b235f80371c0 and parent283b32f; re-read all18
remote Git blobs, opened all15 ZIPs from those Git objects and revalidated every
one of96 members, CRCs, lengths and SHA256 digests. The reviewed substantive report
SHA256 was0da3d827f432beffe40a631a3ba8e551852b23cdc305c4e47f2136583847cb09;
locator420462f156418a3aef73fe4c00d04e641ef2e75b63ba1a1e52240d7116d6f7b0;
manifestef2171514708627733b18eeb83c62058472903122235e0a30a94673294670b28;
summary36961407befb7769ab906dd9c7f6e11b947d931316986d655c9215f591b5c205.
Only this faithful review receipt and deterministic RI refresh follow that report.

The reviewer confirmed combined performance FAIL/PF04 stays open, preparation
source-style failures remain disclosed and final-source checks are not yet
claimed. Exact clean final source/style/owning results and both GitHub conversation
receipts are recorded externally after the final candidate is frozen; they do not
supply physical-device, field, feature merge or production acceptance.
