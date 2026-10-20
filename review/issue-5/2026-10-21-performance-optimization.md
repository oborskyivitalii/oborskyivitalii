# Issue5 / PR79 — 2026-10-21 performance diagnosis and optimization proposal

Owner: [issue5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5),
[PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
User asks to find causes, fix and optimize, and asks what approach is proposed.
This checkpoint diagnoses and proposes the implementation order; no runtime fix,
acceptance PASS, Ready transition or deployment is claimed.

## Inputs and method

Current unchanged clean harness/report source:
`92b671f9d94b1be2e7ab9735e6fe267deb6c4aff`, tree
`8e5a1e432e14d5f65e8edb7e64e0d006ae981c92`.
Measured frozen Color site remains283b32f65f0589e85c0aa914d0990704dcf8ac38,
tree643304fa64c945c01f3b21e6d1d4f0d85696f8f5, public digest
edb8d18387d65ef2c6d67e109f93b95ed6f2fa859dd5afc0c4d87b2e5e14f406.
Original raw evidence remains immutable9147ecccc96247ee6a1ec40c786cb99db211ad1a;
final clean source checks/review remain84330244037b81b1719ecc1b3e2bdc078ae33d72.

Twelve predetermined mobile Lighthouse diagnostic trials: three interleaved rounds
of four temporary fixture variants, sequential fresh Chromium processes, unchanged
Lighthouse13.5.0 mobile simulated Slow4G/CPUx4 settings and actual override
Chromium153.0.8010.0. All12 actual settings match, no warnings/runtime errors;
24 original trace/devtools logs and all12 LHRs retained. Each fixture differs only
in article HTML; all other frozen files are unchanged. Baseline is byte-identical.
The precise transformations and declared order are retained in the execution recipe.
No discarded or retried trial. Execution2026-10-20T23:26:50.924–23:28:31.471UTC,
already21October Europe/Warsaw. Original frozen artifact verified again after collection;
source stayed clean before/after. These altered diagnostic fixtures are not verified
release candidates and must not be submitted as acceptance evidence.

## Causal findings

| Variant (three trials each) | Simulated LCP median ms | TBT median ms | CLS median | Meaning |
| --- | ---: | ---: | ---: | --- |
| Exact original baseline | 4202.360 | 120.000 | 0 | Reproduces original reader failure |
| Add only loading=lazy to all8 article images | 2027.178 | 81.684 | 0 | Strong loading-policy signal; not a final production policy |
| Remove only space.js script | 3976.514 | 43.000 | 0 | Removes scene functionality; attribution only, still over2500ms |
| Remove only navigation.js script | 3978.033 | 105.000 | 0 | Removes router/reader enhancements; attribution only, still over2500ms |

All12 identify the same introduction paragraph as LCP, with the same captured
rectangle (top492px,356x122px). Lazy trials are2031.9555/2026.1055/2027.178ms;
baseline4230.288/4202.036/4202.360ms. Median simulated improvement2175.182ms
(51.8%). Total initial transfer drops746085 to245062bytes (-501023/-67.2%);
image requests8 to1, image transfer596703 to95670bytes. All seven far-down-page
slide WebPs are deferred; the near-viewport cover is still requested under native
lazy-loading heuristics. The renderer currently emits eager images without a
loading policy at tools/site/reader.cjs:194.

This establishes that offscreen image scheduling materially changes the failing
Lighthouse simulation while retaining the same captured LCP element bounds.
It is not a claim of2.18seconds saved in observed loopback rendering: unthrottled
observed LCP medians are198ms baseline and181ms lazy. It does not establish real
CDN/field performance. Native lazy thresholds are browser-dependent. Three trials
are the existing decision count, not a confidence interval for general traffic.

Script-removal experiments change transfer, execution and downstream behavior
together; they do not isolate pure CPU cost or prove a function-level cause.
Removing an entire subsystem saves only~226/~224ms simulated LCP here. Existing
raw startup trace shows navigation.js synchronous initial clone/extract, reader
mount and later layout reads (updateCurrent/save), while first space.js frame
costs27.889ms observed and its total scripting attribution is1.26s over the trace.
These are profiling targets, not grounds to remove functionality. No webfonts are
requested in these trials. The high-level display and edition remain the owners.

| Finding | Severity / AC | Disposition |
| --- | --- | --- |
| CD01: eager offscreen slide fetch competes during cold reader load in simulated network profile | High, AC08/AC12 | Prioritize a function-preserving media scheduling change |
| CD02: lazy experiment still has one TBT260.5ms tail; all outcome samples retained | Medium, AC08/AC12 | Median81.684ms passes existing rule; CPU-tail cause remains unresolved |
| CD03: startup scene/router work contributes but removing either does not solve LCP | Medium, AC08/AC11/AC12 | Profile specific expensive tasks and layout boundaries before modifying them |
| CD04: memory growth remains a bounded observation, not a diagnosed leak | Supporting, AC08/AC12 | Compare equal warm states / forced-GC checkpoints before any memory fix |

## Proposed implementation order

1. **Selective reader image scheduling first.** Keep the first potentially critical
   cover/visible image eager; defer later slide figures with native loading=lazy.
   Retain intrinsic dimensions, all source media, native full-size links, exact
   editions and the current scene/transition behavior. Apply through the shared
   reader producer, not generated HTML or publication-specific JavaScript. The
   diagnostic loaded the cover anyway; the final selective policy still needs a
   real candidate measurement. Verify navigation into a deep figure, image dialog,
   no-JS/native reading, history restoration, and full-image print/export.
2. **Responsive media only after the first result.** Evaluate smaller web renditions
   with srcset/sizes for actual display widths/DPR while preserving readable slide
   text and originals for source links, zoom and print. Existing media/publication
   producers and immutable package manifests own this. Add no parallel media path.
   The old Lighthouse image-delivery estimate118KiB is an estimate, not a promised
   saving or sufficient reason to reduce image clarity.
3. **Cold-start JS/layout by measured task.** Inspect initial reader/router cloning,
   repeated layout reads and the first scene/model/paint work. Batch reads/writes,
   defer noncritical enhancements only where the first text and usable controls
   remain available, and chunk proven expensive work if necessary. Current rooms
   already build on demand; do not claim or introduce a fix for eagerly building
   all scenes. Preserve current background motion, visual composition, navigation
   timing, native fallbacks and cancellation. Profile blocking theme/CSS only within
   their existing CSP, no-flash and asset-identity contracts.
4. **Validate and deliver in this same issue/PR.** First run the focused reader/media
   functional checks and source-bound candidate measurements. After final changes,
   execute one declared complete strict matrix with all outcomes retained, artifact
   bytes verified, source/baseline/candidate identities separate and independent
   review. Keep LCP2500/TBT200/CLS0.1, CPUx4paint33ms, zero Off/reduced work and
   existing flight/retention/soak rules. Avoid repeated full matrices during tuning.
   A real failure remains a failure; no automatic sample replacement.

Reader-specific route retention, field INP/RUM, physical devices and production
Home slow-load tails remain distinct evidence scopes. This diagnostic does not
attribute a separate real-host latency finding to these image requests.

## Acceptance and next action

Original performance outcome remains FAIL/PF04 open until a function-preserving
candidate actually meets the unchanged full rules. PR79 remains Draft, issue5 open,
AC08/AC11/AC12 whole criteria unticked; no new criterion or hosted acceptance claim.
The recommended first implementation is step1, followed by a short findings/impact
checkpoint before deciding whether steps2/3 are needed for LCP or CPU-tail goals.

Method references: [LCP optimization](https://web.dev/articles/optimize-lcp),
[native image lazy loading](https://web.dev/articles/browser-level-image-lazy-loading),
[long tasks](https://web.dev/articles/optimize-long-tasks).
No Chrome DevTools MCP server was configured; existing pinned repo tools were used.

## Independent review

Separate non-implementing reviewer `/root/pr79_perf_final_receipts` independently inspected diagnostic recipe SHA256 `57d86d9b2201f30692db8ce04e36be4f171c07f8885b96cf52487e73f19544d6`, clean source `92b671f9d94b1be2e7ab9735e6fe267deb6c4aff` / tree `8e5a1e432e14d5f65e8edb7e64e0d006ae981c92`, and proposed report SHA256 `e1468ae1ac6f54a5a70ded32f549efae4d4fbf439d3e59b8c914bf9cf7abbb55`. It verified all44 frozen manifest file lengths/hashes; baseline equality and only the declared articleHTML mutation in each variant; all12 LHR settings/warnings/runtime outcomes, three-trial medians, unchanged introduction-paragraph LCP element, initial image/transfer counts, observed-versus-simulated distinction and retained260.5ms TBT tail. It decoded all24 original trace/devtools gzip files and revalidated all13ZIP archive hashes plus44member CRCs/lengths/SHA256 (30917756 compressed bytes). Summary SHA256 `f54373d5e551abccb355b08165e84b61435961f5baf80b7aa83973587ce0424b`; manifest `010ef4afd8c951cb25e59b3e5bb703c1afc0d237070412c6f09b38c6f09ef942`. No blocking diagnostic/report/plan finding remains for sameissue5/PR79 publication. Selective offscreen loading is the supported first implementation; script-removal experiments do not isolate CPU functions or authorize functionality removal. This is diagnostic evidence and a proposal, not a verified runtime fix, field/hosted acceptance or readiness; PF04 remains open and original AC08/AC11/AC12 whole gates remain unticked. The reviewer made no source changes and ran no browser/benchmark.

After review only its suggested precision (captured LCP element bounds instead of
a broad visual-layout claim), this faithful receipt and relative evidence links were added.
[Computed diagnostic summary](2026-10-21-performance-causal/summary.json) and
[all13 archives /44members with exact hashes](2026-10-21-performance-causal/manifest.json)
are retained in the same immutable evidence commit as this report.

Refs #5
