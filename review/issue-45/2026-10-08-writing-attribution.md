# Issue 45 — 2026-10-08 Writing attribution and bounded repair

Owning issue and authorization: [issue45, dated scope](https://github.com/oborskyivitalii/oborskyivitalii/issues/45#2026-10-08--authorized-bounded-writing-attribution-and-source-owned-repair).
Owning execution: Draft successor on `work/issue45-writing-attribution-20261008`.
Inspected baseline: main `a56b62751f3c0f7e295db07bfc23201dd838510b`.
This prepared diagnostic route changes no runtime, public rendition, effect, geometry,
toolchain, metric budget or four-control helper. Publication/check/run identities
are recorded below as actual observations, not inferred from this handoff.

Reviewer roles: root Codex self-analysis; content_review independent retained-evidence
analysis; independent_review independent scheduler and prepared route review.
An agent's own test edits receive separate root/route review.

## Intent and acceptance

The user explicitly authorized working on existing issue45 and asked which
hypotheses explain the Writing gate failure blocking recording issue61 / PR63.
Preserve original AC01–AC06 and append observable AC03/AC04 subconditions before
implementation. All six whole-AC boxes remain unchecked.

The plan uses one bounded Writing attribution run: four fresh sequential
mobile/simulated Lighthouse observations with CPU samples, normal Color and
maintained no-ribbons/no-canvas-draw/thematic-off controls. Same clean source/tree,
parent artifact, runner and settings; raw failures are retained. Collection success
is not a performance admission and profiler overhead prevents direct comparison
with ordinary staging TBT. Historical Research/WebKit dispatch is not used.

## Findings

The retained evidence identifies sustained per-paint task cost as the present
Writing blocker. It does not establish a runtime regression in the Talks change,
nor does it identify a sufficient source repair. No runtime, measurement profile,
trial count or performance budget was changed for this analysis.

| ID | Evidence | Finding and implication | Disposition |
| --- | --- | --- | --- |
| F01 | Accepted run `37761184300`, browser job `113258759878`; failed run `37783614376`, browser job `113333814678` | Writing TBT changes from 71.5 to 299 ms; Research changes from 53.5 to 112 ms. The original Writing limit remains 200 ms and the failed observation remains a failure. | Open performance blocker |
| F02 | The two public archives and route LHRs, independently compared by the environment/payload reviewer | Color `space.js`, navigation, archive, theme and styles are byte-identical. Research/Writing HTML is equal after only the declared engine and route identity substitutions. Lighthouse 13.5.0 configuration is equal. The two runners have different CPU models and benchmark indexes. This bounds the change to observed execution conditions rather than new Writing runtime bytes. | Preserved evidence; hardware attribution remains observational |
| F03 | Page-main-thread events in the retained traces | Each selected substantial `frame` callback has exactly one substantial native `Commit` in its enclosing `RunTask`. Current Writing paints fewer times than accepted Writing, yet its recurring task is slower. Whole-trace Commit totals alone conceal that difference. | Confirmed trace attribution |
| F04 | Current Writing and Research traces from the same job | Writing's main-thread Commit duration exceeds Research by 114.920 ms, accounting for 70.7% of their 162.550 ms RunTask duration difference. Frame callback duration differs by 21.661 ms; GC is effectively equal. Repeated native submission/commit work is the stronger present target than a purely startup or GC explanation. | Source owner `site/engine/renderer.cjs`; named native cause unresolved |
| F05 | Pinned Lantern Simulator and CPUNode source; retained LHR `long-tasks.details.debugData` | Later render tasks contain no Layout event, so the existing 4× CPU model moves current Writing's roughly 13 ms tasks across the 50 ms threshold. Rounded modeled duration multisets reproduce every `space.js` diagnostic long-task duration in all three inspected traces. | Confirmed diagnostic threshold mechanism; not an exact TBT decomposition |
| F06 | Source command accounting at 412×823, compact detail, initial route poses | Writing submits about 1,943–1,998 strokes per paint versus Research's 1,473–1,492, despite fewer face fills. Both routes have roughly 54–55 ribbon gradients; Writing additionally has 24 guarded formula draws. Ordinary line/path submission remains a discriminating hypothesis. | Attribution experiment required before repair |
| F07 | Standard staging traces and existing issue45 source/profile evidence | Standard traces have no `Profile`, `ProfileChunk` or `CpuProfile` events. They expose the outer `frame`, not its nested JavaScript functions. No named bitmap snapshot, source flush or readback event establishes repeated formula-cache rebuilding. | No formula/backend or other runtime repair selected |

### Exact retained evidence

| Observation | Accepted Writing | Failed Writing | Failed Research |
| --- | --- | --- | --- |
| Workflow run | `37761184300` | `37783614376` | `37783614376` |
| Source commit | `3e8944af985d8d06c24348fc5227f27f97cad97d` | `ef92b0a0cdcbf7bd8761c56549f082259be296a6` | Same failed source |
| Source tree | `ca02b3829ec67d806598705cfcc38cbafaf7966a` | `84244333b69300f940e09f7330d7e3442ba2d395` | Same failed tree |
| Report artifact ID | `11542936870` | `11554420285` | Same failed artifact |
| CPU model, four vCPUs | AMD EPYC 9V74 | AMD EPYC 7763 | AMD EPYC 7763 |
| Lighthouse benchmarkIndex | 2975 | 2447 | 2289 |
| Simulated FCP / LCP, ms | 1531.121 / 2077.621 | 1597.327 / 2170.827 | 1575.962 / 2134.462 |
| Simulated TTI / TBT, ms | 3256.271 / 71.5 | 3608.027 / 299 | 2714.062 / 112 |
| Observed FCP / LCP, ms | 335 / 383 | 199 / 267 | 203 / 264 |
| Observed trace end, ms | 2731 | 2682 | 2635 |
| Uncapped diagnostic long tasks | 8 | 42 | 9 |
| Diagnostic long tasks attributed to `space.js` | 7 | 40 | 7 |
| Diagnostic duration-minus-50 sum, ms | 94 | 446 | 130 |

The image (`20261004.327.1`), kernel (`6.17.0-1022-azure`), Node
(`24.19.0`), runner (`2.337.0`), Chromium (`153.0.8010.12`), Lighthouse
(`13.5.0`) and mobile/network configuration are unchanged. Each LHR uses
`throttlingMethod: simulate`, CPU multiplier 4, 412×823 mobile emulation,
DPR 1.75, RTT 150 ms and throughput 1638.4 Kbps. The lower current benchmark
index is consistent with less CPU headroom; these two observations cannot
separate the CPU model from runner contention or other environmental variation.

Accepted report ZIP SHA256:
`dc657eba8e8bc10b223e7464ee73e679ba66144f07db5134d6f69f7f182d55a3`.
Failed report ZIP SHA256:
`1ac0422736f527cab2981e0dc2049504a695b61827059711c6f35d6622c1fe46`.
Failed public artifact digest:
`3e302cd5d14183d8b51a441e5bc5f32309298b32143dc2f9c4ef26ce39b2fea4`.

| Retained file | SHA256 of retained bytes |
| --- | --- |
| Accepted `lighthouse-writing-mobile-1.json` | `3556567e97aa97bfbf044323250784a2bc5f312f09a5a342e92e54841de5c8f5` |
| Accepted `lighthouse-writing-mobile-1-trace.json.gz` | `40d73ef6899900d481b3b088beb78d0ef70dc5c077b8073298c297c317731a7c` |
| Failed `lighthouse-writing-mobile-1.json` | `cd6dbed93eb998fba40bb0d999b02eaad4d78297d9cefb04b85a4fe05b561dc5` |
| Failed `lighthouse-writing-mobile-1-trace.json.gz` | `7beaf35a556e985b60d5c59511dad404b1d4911a405e31548ecd8ca626086a26` |
| Failed `lighthouse-research-mobile-1.json` | `55c8afa7eac0fb54f748d6b59221865366bb9a8ad4e0292b7b2ef5c9f83c280a` |
| Failed `lighthouse-research-mobile-1-trace.json.gz` | `8393131ad2c681707e4caecd9c1500646aa40834afdb69184c1c53ff895311c1` |

### Startup and recurring task separation

The trace selection uses the page main thread containing the hosted `frame`
function: PID/TID 4609/4609 accepted Writing, 4683/4683 failed Writing and
4516/4516 failed Research. A substantial callback or Commit means duration
greater than 1 ms. Each callback is paired with the smallest enclosing RunTask
and its single substantial Commit; this is a reproducible event selection,
not a claim that every short browser Commit represents another scene paint.
Durations below are raw trace milliseconds. Nested event sums overlap and must
not be added to RunTask totals.

| Raw trace measure | Accepted Writing | Failed Writing | Failed Research |
| --- | ---: | ---: | ---: |
| Selected frame / paired Commit count | 51 / 51 | 41 / 41 | 41 / 41 |
| First enclosing render task | 49.704 | 59.461 | 51.606 |
| First frame callback | 34.500 | 41.267 | 39.042 |
| All main RunTask duration | 735.851 | 809.900 | 647.350 |
| All main Commit duration | 303.301 | 301.884 | 186.964 |
| Selected substantial `frame` callback duration | 251.801 | 298.843 | 277.764 |
| Main Layout + UpdateLayoutTree | 45.310 | 56.020 | 47.436 |
| Main MinorGC + MajorGC | 8.623 | 12.192 | 12.310 |

The selection excludes short callbacks that do not paint. Including those
callbacks, failed Writing and Research `frame` duration totals are 308.908 and
287.247 ms; their 21.661 ms difference is the F04 comparison.

Later means callback start at least 500 ms after the first substantial frame,
well after the observed cadence has settled. Accepted Writing settles near
50 ms between paints after +191 ms; failed Writing settles near 66.7 ms after
+232 ms. The later comparison therefore does not mistake more frequent drawing
for a slower individual task.

| Later selected tasks, raw ms | Accepted Writing | Failed Writing | Failed Research |
| --- | ---: | ---: | ---: |
| Task count | 38 | 29 | 29 |
| Task duration total | 402.354 | 405.911 | 304.631 |
| Median enclosing task | 10.329 | 13.297 | 10.066 |
| Frame callback duration total | 151.520 | 170.469 | 154.761 |
| Median frame callback | 3.733 | 5.149 | 4.916 |
| Paired Commit duration total | 217.107 | 204.768 | 124.717 |
| Median paired Commit | 5.680 | 6.891 | 4.277 |
| Modeled long render tasks, at least 50 ms | 2 | 28 | 2 |

## Evidence distinctions

These standard Lighthouse traces record observed execution without DevTools
CPU throttling; the LHR performance timings use Lantern simulation. The
separate existing raw motion/flight checks do apply their declared CDP CPU
rate and remain separate evidence. A trace millisecond, a simulated metric
millisecond and a profiler sample are not interchangeable.

The exact pinned `@paulirish/trace_engine` 0.0.65 implementation, resolved by
`tools/quality/toolchain/package-lock.json`, applies multiplier 2 to a CPU node
containing a Layout child and multiplier 4 otherwise. CPUNode duration uses a
corrected end timestamp when supplied. Simulator rounds the multiplied duration
to whole milliseconds and caps it at 10,000 ms. Only the first selected render
task contains Layout in each inspected trace. For all selected render tasks,
the modeled durations of at least 50 ms computed from the raw enclosing tasks
exactly reproduce the duration multisets of every `space.js` entry in the LHR's
uncapped diagnostic data. Thus the later Writing median illustrates the present
threshold sensitivity: 13.297×4 rounds to 53 ms, while the accepted median
10.329×4 rounds to 41 ms. This is diagnostic task attribution, not a recomputation
of TBT from medians.

Lighthouse's `long-tasks` audit runs a separate full dependency graph labeled
`long-tasks-diagnostic`, with no TBT measurement-window clipping, and exposes
only the 20 longest tasks in its visible table. Its debug data preserves all
tasks. The current Writing table's duration-minus-50 sum is 401 ms; the uncapped
sum is 446 ms. Neither equals the 299 ms metric. The pinned TBT metric averages
optimistic and pessimistic graph results with equal weights. It clips each CPU
task to its graph's FCP–TTI window before subtracting 50 ms and floors negative
contributions at zero. The optimistic window uses pessimistic FCP and optimistic
TTI; the pessimistic window uses optimistic FCP and pessimistic TTI. Diagnostic
tasks after a window cannot be counted as exact metric contributions. The audit's
`other` group also cannot establish native attribution: its source documents
that simulated child timing breakdowns can be dropped.

Primary implementation references are Lighthouse v13.5.0
[`core/audits/long-tasks.js`](https://github.com/GoogleChrome/lighthouse/blob/v13.5.0/core/audits/long-tasks.js)
and the exact locked trace_engine package. Independently verified SHA256 values
for the locked package's relevant source bytes are:

| Source | SHA256 |
| --- | --- |
| `simulation/Simulator.js` | `4e8efe774b0fc80ef9811b371fc985f5bf79f38bf0f7d6dfa7fe7918a99e207f` |
| `graph/CPUNode.js` | `5a82da7cae2dcb2814b15bc09d61f18815c6528826326350fa83a6b2e5abcbbe` |
| `metrics/Metric.js` | `d2ea753ea90e1d2cf5403bb5d36adfff61f00b3a00ad0dd3fc9fb32a1b9ea323` |
| `metrics/TotalBlockingTime.js` | `186fd97fa6be2f869c01a16056fffc9df68a8e783458d6e01c760a0a93efaafd` |
| `metrics/TBTUtils.js` | `4ddf1ff24533bd84d144c0befe67d23ba0c3c01f9542c6b3de4781aae810c2d8` |

## Hypotheses

These are ranked investigation hypotheses, not selected repairs or revised
acceptance conditions. The next useful measurement is the already maintained
four-control CPU attribution probe on one clean source, with each control
observed once. It preserves failed observations and hardware/source/artifact
binding. Profiling adds overhead, so its TBT values cannot admit production or
replace normal staging acceptance.

| Rank | Hypothesis and source owner | Evidence and limit | Discriminating observation |
| --- | --- | --- | --- |
| 1 | Ordinary thematic face/line submission and native setters dominate deferred Commit. Owner: `site/engine/renderer.cjs`, fed by `site/engine/projection.cjs`. | Same-job Writing has substantially more stroke submissions and longer Commit than Research. The historical issue45 profiled thematic-off control retained formula/ribbons but reduced its heavy Commit median. Current unprofiled traces cannot name the native call responsible. | Existing Color versus thematic-off control: compare recurring CPU sample locations and task/Commit cost per selected paint, with exact retained controls. A large decrease with formula/ribbons retained supports ordinary geometry; a small decrease weakens it. |
| 2 | Cadence reacts to JavaScript submission time but does not include the following deferred native Commit. Owner: `site/engine/lifecycle.cjs`. | `quality(renderCost,time)` receives the measured `draw()` duration, while the browser Commit occurs after the callback. Current failed Writing settles near 15 Hz versus accepted Writing's 20 Hz, yet individual modeled tasks remain long. Reducing paint frequency alone is not evidence that one task becomes short. | Existing no-canvas-draw versus normal control and paired callback/Commit timing: separate projection/sort cost from the deferred rendering remainder. Infer actual paint spacing from those trace events; this four-control helper does not capture dataset cadence/costAverage. No scheduler change is selected before this distinction is measured. |
| 3 | Cold room/model/formula preparation contributes to the first several long tasks, but is insufficient to explain the full blocker. Owners: `site/engine/lifecycle.cjs`, `site/scenes/world.cjs`, `site/engine/renderer.cjs`. | The first task is 59.461 ms raw, but 28 of 29 later Writing render tasks still model to at least 50 ms. GC/layout totals do not account for the sustained route delta. | In the same four-control trace/profile, separate the first 500 ms from recurring paints. A startup-only optimization is insufficient if the recurring distribution stays above threshold. |
| 4 | Writing's formula resampling or ribbons have disproportionate native cost. Owners: `site/engine/renderer.cjs`, `site/effects/ribbons.cjs`. | Writing has 24 formula image draws, but both routes submit roughly 54–55 ribbons; the immutable formula source is painted once. Historical thematic-off retained both and was materially faster. No present named snapshot/flush/readback evidence supports an ImageBitmap substitution as a fix. | Existing no-ribbons control isolates the ribbon treatment; no-canvas-draw bounds all rendering; thematic-off retains formula/ribbons. Select any additional one-factor backend experiment only if these retained profiles leave a specific residual cause. |

### Deterministic source command accounting

This is an in-memory command recorder, not a browser benchmark. It uses the
current main source `a56b62751f3c0f7e295db07bfc23201dd838510b`, the canonical
builder model, Day palette, compact world, tier 0, 412×823, initial Research and
Writing poses, pruning enabled, canonical smooth ribbon projector, and combined
depth order. Formula preparation is separate from the per-paint counts. The
recorder implements native-call-shaped methods and counts property assignments;
its counts describe submission opportunities, not their execution durations.

| Per-paint count at ambient time 0 ms | Research | Writing |
| --- | ---: | ---: |
| Projected faces / lines | 651 / 1835 | 456 / 2327 |
| Ribbon facets / gradients | 55 / 55 | 55 / 55 |
| beginPath / stroke / fill | 1896 / 1473 / 706 | 2100 / 1943 / 511 |
| Native lineWidth / strokeStyle assignments | 746 / 820 | 1376 / 1023 |
| Native globalAlpha / fillStyle assignments | 2034 / 657 | 2274 / 439 |
| Face seam / silhouette strokes | 122 / 161 | 182 / 196 |
| Formula drawImage / clip / transform | 0 / 0 / 0 | 24 / 24 / 24 |

At ambient times 1200 and 2400 ms, Research has 1492 and 1490 strokes; Writing
has 1956 and 1998. This supports the recurring submission hypothesis across
those phases. The source already culls rooms, objects, faces and subpixel lines,
hoists object/camera transforms, batches adjacent compatible lines, caches the
formula and suppresses identical native paint-state writes. Removing visible
lines, seam strokes, clips, layers or ordering would alter the accepted output.
No unproved reduction is selected merely to make a measurement pass.

## Independent retained-trace review

Role: read-only retained-trace/source analyst, separate from the probe/runtime
implementer. The environment/payload reviewer independently checked archive
parity and locked Lantern semantics; the runtime reviewer independently checked
single-loop lifecycle behavior, immutable formula ownership and observed paint
cadence. This analysis additionally reproduced raw event selections, exact
callback/Commit pairing, the recurring time separation and diagnostic duration
multiset equality from the retained gzip traces and LHR files.

Read sources include the root agent guide, issue45's existing handoff and
historical four-control attribution, renderer/projection/lifecycle/ribbon owners,
the existing Lighthouse/cause-probe owners, the pinned Lighthouse audit and
locked Lantern metric/simulator implementation. No new browser observation,
performance retry or runtime edit was performed. The standard traces cannot
provide function CPU attribution, and the accepted report has no retained
Research trace; no accepted Research trace decomposition is claimed.

The supported next step is one source-bound run of the existing four controls,
then selection of a bounded repair from its attribution. Current evidence is
sufficient to preserve the blocker and reject a passing-retry strategy; it is
insufficient to approve a specific runtime repair or check a whole issue AC.


## Decisions and execution tasks

The authorized current step is attribution. A runtime repair requires a supported
bottleneck hypothesis, then canonical source ownership and targeted invariant
checks, generated parity, independent review and the original exact-source stage.
Original TBT200ms/LCP2500ms/CLS0.1 and motion/flight/resource budgets remain intact.
No production activation, full WebKit campaign, arbitrary bitmap/quality/cadence
change or unchanged hardware-lottery retry is included.

| Task | Owning paths / expected result | Finding / AC | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Extend existing read-only Writing label route to one fixed dated successor; preserve four inputs, exact head, raw failure retention and manual separation. | Per-frame attribution / AC03, AC04 | Maintained cause tests plus actual event-boundary negative cases | Prepared |
| T02 | Keep owning policy, code-style subset, catalog and RI/CI routes current. | Source/evidence ownership / AC04 | Basic, targeted source, style, RI build/verify, RI regressions and issue45 policy | Pending exact-source evaluation |
| T03 | Collect exactly one four-input Writing CPU artifact and inspect function/native tasks normalized by actual paints and capture window. | Ranked hypotheses / AC03, AC04 | Exact-source workflow, four rows, original LHR/trace/network identities | Pending |
| T04 | Choose a supported source-owned repair; prove visual/clock/resource invariants and measured same-profile benefit before normal stage. | Proven bottleneck / AC01, AC03, AC05, AC06 | Applicable maintained source/browser checks, independent review, original gate | Pending attribution |

Applicable CS01/CS04–CS10: existing canonical diagnostic owner and helper remain in
place; the touched YAML/test/policy is readable and bounded. Lifecycle/geometry,
toolchain and original gates stay unchanged. The code-style guard proves its
documented subset; semantic ownership, proportionate checks and honest result
interpretation remain explicit review obligations. Test-profile assignment stays
diagnostic / changed-helper PR-targeted and issue-owned policy, rather than entering
routine staging or production. Remove the dated branch route when this attribution
work completes.

## Acceptance evidence

| AC | Current evidence | Result / remaining whole criterion |
| --- | --- | --- |
| AC01 | Existing formula renderer/producer/asset mappings retained | Current checks pending; full formula visual acceptance remains open |
| AC02 | Existing foreground/reading-surface mapping retained | Current checks pending; geometry/surface/visual matrix remains open |
| AC03 | Existing lifecycle/formula mappings and original stage budget | Retained failed stage is failed; attribution or fixtures cannot admit performance |
| AC04 | Exact owner plus attribution/style mappings, RI/CI and normal PR checks | Current source/review/run evidence pending; applicable merge and visual gates remain open |
| AC05 | Existing ribbon continuity/camera mappings retained | Current checks pending; full retained current-source continuity sequence remains open |
| AC06 | Existing camera/lifecycle/cache mappings retained | Current checks pending; full current-source visual requirements remain open |

## Issue synopsis

The failed Writing paints fewer but costlier recurring frames than the previously
accepted source-identical runtime. Layout-aware simulated CPU scaling exposes
threshold crossing, while native Commit dominates the same-run route delta.
The single dated successor collects maintained controls to choose a justified
repair. All original acceptance and failed evidence remain intact.
