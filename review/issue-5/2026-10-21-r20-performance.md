# R20 exact-source performance completion, 21 October 2026

Owner: [issue 5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5) / [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Measured source `3e12e47953bc8c81316544b1da206a956a337307`, tree `728b7aee4dcdc3627b1327f90d8df64971d2d816`, Color public digest `aa6490f76bcd05a9e55d42db8ddf97d2bf1e9064618be5c89b4c99e698e99009`.
Runtime, article R20, original budgets and collectors were unchanged during this completion.

## Verdict and execution boundary

**Completed stage coverage: FAIL.** This is an explicitly assembled result: the completed original 30-trial Lighthouse stage plus one restart of the incomplete motion stage and the subsequent reader stage. It is **not** a successful single uninterrupted `performance.cjs` invocation. The original wrapper remains incomplete and its false final-verification checkpoint is retained.

The original process disappeared without a terminal execution receipt. Its cause is unknown. Its retained motion data contains 15 short profiles and one flight profile, without soak or reader. Intermediate `motion.pass:true` cannot admit that attempt. Home 390px / CPU×4 already missed the 33ms paint budget (idle45.6ms, scroll38.8ms) and 20% idle-busy budget (21.65%). These observed misses are retained, not excused as environment noise and not erased by the continuation.

The recovery recipe reused only the complete original Lighthouse stage. It ran unchanged `motion.cjs`, then `reader-performance.cjs`, serially on the same frozen artifact/browser. Artifact verification passed before and after; source remained clean. The repeated motion stage is justified by its missing completion, not by an attempt to replace failed samples. No original files were rewritten. All reports, attempts, inputs, recipes and source/check receipts are retained in the raw manifest accompanying this report.

## Completed results

36 Lighthouse trials; 72 short motion windows; 24 primary-route flights; 120 retention cycles; 300.073s soak. Eleven of twelve page/profile groups pass all original median-of-three LCP2500ms, TBT200ms and CLS0.1 budgets. **Reader mobile fails TBT: median204ms >200ms**; individual184.5/225.5/204ms. Every group passes LCP and CLS. All motion checks in the completed continuation pass; the interrupted attempt retains its separate misses. The4ms TBT overrun is a failure, not rounded away.

Reader mobile LCP median **2253.114ms**; individual values 2408.548, 2253.114, 2252.406ms. Its median budget margin is 246.886ms.

| Route / profile | Median LCP, ms | Maximum LCP, ms | Median / max TBT, ms | Median CLS |
| --- | ---: | ---: | ---: | ---: |
| index / mobile | 1956.842 | 1963.973 | 89.000 / 108.500 | 0.000000 |
| index / desktop | 478.665 | 510.726 | 3.500 / 7.000 | 0.000000 |
| research / mobile | 1665.502 | 1771.852 | 170.500 / 194.000 | 0.000000 |
| research / desktop | 411.929 | 418.239 | 2.000 / 3.000 | 0.000000 |
| writing / mobile | 1683.008 | 1684.713 | 178.500 / 235.000 | 0.000000 |
| writing / desktop | 421.487 | 423.393 | 0.000 / 1.000 | 0.000696 |
| talks / mobile | 1611.759 | 1636.903 | 88.500 / 149.500 | 0.000000 |
| talks / desktop | 401.060 | 408.280 | 8.000 / 90.000 | 0.000000 |
| credits / mobile | 1603.678 | 1605.229 | 51.000 / 58.000 | 0.000000 |
| credits / desktop | 398.165 | 401.090 | 0.000 / 22.000 | 0.000000 |
| reader-1 / mobile | 2253.114 | 2408.548 | 204.000 / 225.500 | 0.000000 |
| reader-1 / desktop | 521.218 | 523.610 | 16.500 / 24.500 | 0.000000 |

Individual TBT exceedances (Writing group median passes; reader group median fails): `[{"route": "writing", "profile": "mobile", "run": 1, "tbtMs": 235}, {"route": "reader-1", "profile": "mobile", "run": 2, "tbtMs": 225.5}, {"route": "reader-1", "profile": "mobile", "run": 3, "tbtMs": 204}]`. R19's earlier claim that every individual TBT was below200ms does not apply to R20.

Completed CPU×4 maximum paint p95 **26.800/33ms**. All 36 Off/Reduced windows have 0 callbacks / 0 paints. Equivalent flight readiness max **2994.600/3200ms**; actual readiness max 4121.100ms is a separate quantity. DOM/listener before/after counters are retained in the summary. Forced-GC soak heap change **862012 bytes**, a bounded observation, not proof of leak absence or presence.

## Remaining finding and next diagnostic

Reader mobile CPU blocking is unresolved. Two of three TBT trials exceed200ms. The completed strict result is FAIL; an unchanged-source repeat to obtain a pass is not proposed. Preserve all six reader trace/log pairs and inspect the long main-thread tasks, script evaluation and synchronous reader/router/layout work before a bounded CPU correction. In failing trial2, the Lighthouse long-tasks audit attributes129/120/91ms tasks to `space.js`; trial3 includes a103ms `navigation.js` task and89/83/76ms `space.js` tasks. These are audit-level task attributions, not proof of a specific function-level cause or of a simple sum equal to TBT. Original Home CPU×4 paint misses and Writing235ms TBT are additional observed tails. Their cause is not established, and passing continuation samples do not establish that these tails disappeared.

## Causal attribution and preserved scope

The prior same-content R18 diagnostics remain the causal evidence: deferring seven offscreen images4202.360→2027.178ms; active-clone control3377.345→2401.136ms with an inert cache. Final R19 and R20 contain fewer selected illustrations than R18; their total difference from R18 must not be attributed exclusively to optimization. R20 editorial files and Q4 runtime/producer/collector/budget bytes were preserved by integration3e12e479.

Previously recorded exact-source owning12/12, formatting/lint, RI28/28, RI-CI20/20 and toolchain checks pass. Five maintained reader journeys plus five supplementary browser cases pass; native/Back/SPA at1440/390 observe the complete four-image inventory with one initial image request. Cold native print has22pages and all four original images. These are separate source/browser receipts, not newly executed performance checks or an editorial PDF export.

## Acceptance and limits

| Scope | Outcome | Remaining boundary |
| --- | --- | --- |
| AC08 reader behavior | Exact-source source/browser/native-print receipts pass | Whole feature/editorial/rights/device/publication gates remain open |
| AC11 implementation/style/review | Prior independent source review and mapped source checks retained | This completion changes no implementation source |
| AC12 performance evidence | Complete assembled coverage FAIL: reader mobile TBT204/200ms; original interrupted attempt retained | CPU correction and fresh affected evidence pending; no R20 performance clearance |

Local Linux explicit Chromium153.0.8010.0 override and the repository gzip HTTP fixture were used. These results are not managed CI, CDN, field INP/RUM or physical iPad acceptance. Budgets/aggregation/timeouts remain unchanged. Independent evidence review is linked alongside the report. No new whole-AC tick, merge, permanent-staging promotion or production activation is established. Permanent staging remains historical R18/source283b32f.

Refs #5
