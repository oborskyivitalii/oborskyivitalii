# v8 engineering audit — 3 October 2026

**Recommendation: keep v8's visual direction, and complete a focused reliability
and performance pass before release.** No exploitable security vulnerability was
confirmed in the inspected source. The meaningful findings are a reproducible
WebKit initialization failure, expensive fallback markup, sustained rendering
cost, a rapid-scroll camera defect and incomplete recovery after rendering failure.

The audit is complete; **production source is unchanged and these findings are
not yet fixed**. This report and the execution handoff are recorded under
[issue #12](https://github.com/oborskyivitalii/oborskyivitalii/issues/12), with
[Draft PR #10](https://github.com/oborskyivitalii/oborskyivitalii/pull/10) and
[launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1).

## Inspected version and methods

- Remote v8: `6176cb209a1d46a1ae056c3008c77e20281b6f93`.
- Local audit HEAD: `0bc14514ad9e5112cb4c10b7b4f57ef1913d1889`.
- Identical tree: `1bec5de6726283a830c97979350c3b8b25d7c28c`.
- All 12 files under `docs/` are identified by SHA-256 in [baseline.json](results/baseline.json).
  Its size inventory uses Python zlib gzip at default level 6. The HTTP fixture
  uses Node gzipSync: Research is respectively 315,962 versus 307,637 body bytes;
  Lighthouse records 307,876 transfer bytes including HTTP overhead. Compare
  compression methods consistently rather than treating these as identical sizes.
- Public runtime: five HTML pages, CSS, three optional native scripts and local
  assets. No backend, remote runtime library/font, analytics or runtime package manifest.
- Separate read-only agent review: [identity, material and findings](INDEPENDENT-REVIEW.md).
  The parent reproduced its camera finding and performed the scanners/browser work.
- [Exact tool versions](results/tool-versions.json); isolated optional toolchain
  locks in [toolchain/](toolchain/). This does not add runtime dependencies.

The local HTTP fixture serves exact production bytes with gzip, no cache and
no external requests. It is not the deployed host: TLS, hosting headers, CDN,
real network geography and field Core Web Vitals are not established here.

## Security and static analysis

| Tool | Observed result | Interpretation |
| --- | --- | --- |
| Semgrep CE 1.179.0, `p/security-audit` | 0 findings, 21 files, 106 applicable rules | Two source files had partial-parser warnings. A second scan of token-identical copies with whitespace inserted into compact ternaries parsed 100%, ran 22 applicable rules and found 0 issues. Original warnings are preserved. |
| Bandit 1.9.4 | 0 findings in Python tools | Covers the local producer/RI scripts, not browser code. |
| detect-secrets 1.5.0 | 92 candidates, 0 confirmed credentials | 91 generated source hashes/digests and one public article identifier in a test. Verification requests disabled. Current tracked tree scanned, excluding historical review/draft artifacts; not full Git history. |
| ESLint 10.12.0 + SonarJS 4.2.2 | 58 messages: 23 runtime, 12 tools, 23 tests | Six complexity findings in `space.js`, unused `mobile` argument and `gates`, nested conditionals, plus test/tool issues. These are not 58 functional bugs. |
| Stylelint 17.16.0 | 201 messages | 144 concern compact single-line formatting; 7 duplicate selectors and 28 specificity warnings warrant careful cascade review. No CSS parse errors. |
| Ruff 0.16.10, isolated `E4,E7,E9,F,I,C90` | 4 messages | One import ordering issue and three RI function complexity warnings. No undefined-name/syntax findings in this profile. |
| Existing tests | 33 Node + 18 Python passed | Useful existing behavior coverage; the new rapid-reversal reproducer still fails on every route. Passing existing tests did not cover that case. |

[Machine summary](results/static-summary.json), full results alongside it, and
[scanner reproduction](REPRODUCE.md) retain scope and configuration.
Semgrep's registry pack was fetched on the audit date; its contents were not
pinned as a separately redistributed rules snapshot. A future run can differ.

Manual trust-boundary review found allowlisted query/hash filters, `textContent`
for dynamic display and storage restricted to theme/motion preferences. A browser
probe with markup/script-like filter values selected `all`, inserted no element
and retained all 27 archive records. This is a bounded probe, not comprehensive fuzzing.
No external runtime requests were observed in the normal browser matrix.

SonarJS flagged VM evaluation and a regex in tests. They process checked-in
fixtures, not a visitor-controlled runtime input. Treat them as test/tool hygiene,
not a public-site code-execution or denial-of-service vulnerability.
CI has read-only repository permissions, SHA-pinned checkout and no persisted
credentials. There is no application dependency graph for `npm audit`/OSV to
audit in this v8 runtime; audit-tool dependencies are a separate supply chain.
Deployment headers/CSP belong to the actual hosting verification under #8.

## Initial loading: Lighthouse

Lighthouse 13.5.0, Chrome 154.0.8037.97, Ubuntu 24.04.3. **One retained run per
route/profile**, sequentially. Desktop uses Lighthouse's actual desktop config;
mobile uses its default simulated mobile network/CPU profile. The retained JSON
records validate the actual `formFactor`; an initial incorrectly labelled desktop
attempt was discarded and rerun. Scores are observations, not stable guarantees.

| Page | Desktop performance | Mobile performance | Mobile LCP | Mobile TBT | Mobile CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| Home | 100 | 65 | 2.71 s | 2,116 ms | 0.019 |
| Research | 83 | 62 | 2.98 s | 2,600 ms | 0.000 |
| Writing | 100 | 61 | 2.24 s | 1,238 ms | 0.237 |
| Talks | 87 | 67 | 2.51 s | 2,387 ms | 0.019 |
| Credits | 100 | 81 | 2.22 s | 658 ms | 0.019 |

[Configuration and metrics](results/lighthouse-summary.json); full retained
Lighthouse JSON reports are stored as `.json.gz` in results/.
TBT measures blocking during a lab load; it is not field INP. Writing's large
layout shift needs a trace/retest of the navigation/filter/header enhancement
transition; the precise contributing mutation has not yet been isolated.

Lighthouse accessibility is 100 except Writing at 96. Writing has an `aria-label`
on a generic `div.archive-landings` without an appropriate role. The optional
experimental label/name check also flags the decorative `vo.` wordmark text;
review semantics rather than treating that as a proven speech-control failure.
Best practices is 96 on each route because the local site has no favicon and the
browser requests `/favicon.ico` (404); this is not an application crash.

Separately, axe-core 4.13.0 found no violations in the five sampled dark/mobile
post-interaction states. Its Writing sample has a selected topic and differs from
the default Lighthouse state and configuration; both use axe-core 4.13.0. This does not cancel the Lighthouse
finding or establish all-state accessibility. Existing v8 contrast evidence is
historical; this audit did not repeat its thousands of background samples.

## Sustained motion: separate from Lighthouse

Fifteen scenarios: five routes × desktop 1440px / mobile 390px / mobile with
CDP CPU slowdown ×4. Each samples 4 seconds idle, 4 seconds programmatic native
scroll, and 1 second Motion off after settling. Actual painted callbacks are
separated from skipped RAF callbacks; there is no per-vertex instrumentation.
The values include JS/Canvas command time, not compositor-presented FPS.

| Page, mobile ×4 | Idle paints/s | Idle painted-callback p95 | Scroll paints/s | Scroll painted-callback p95 |
| --- | ---: | ---: | ---: | ---: |
| Home | 7.9 | 110.9 ms | 15.5 | 41.8 ms |
| Research | 9.1 | 82.2 ms | 14.8 | 47.2 ms |
| Writing | 13.2 | 54.2 ms | 15.7 | 33.3 ms |
| Talks | 12.2 | 56.7 ms | 18.0 | 40.6 ms |
| Credits | 11.1 | 51.4 ms | 11.6 | 87.1 ms |

At unthrottled mobile width, idle draws approximately 15 times/s, near its cap.
At unthrottled desktop width, it draws approximately 20 times/s; the source cap
is an upper bound, not an exact frame-rate promise. At ×4, every route misses a
comfortable continuous-motion budget. Animation callbacks occupy approximately
38–42% of sampled wall time while idle; this is a synthetic callback-time share,
not measured battery drain or operating-system CPU utilization.

**Motion off produced zero animation paints and zero animation callbacks in all
15 settled samples.** A 60-second Research soak on the unthrottled 390px profile
completed; forced-GC heap decreased from 6,256,964 to 4,447,528 bytes. There is no
observed monotonic retained-memory growth in that short sample, not proof of
absence of long-session leaks. Battery, thermal throttling and sustained real
mobile GPU behavior remain unmeasured.

[Summary](results/runtime-summary.json), raw callback samples in
`results/runtime-performance.json.gz`, and [measurement script](run-browser-audit.cjs).
CPU slowdown is not a named phone model. The old review-capture callback figures
included skipped paints and much heavier instrumentation and are not comparable.

## Browser and failure boundaries

Playwright 1.63.0 used Chrome 154.0.8037.97, Firefox 155.0 and portable WPE WebKit
26.6 on Linux. WebKit's OS libraries were unpacked into a temporary directory;
its executable was launched with explicit library paths. This is not branded
Safari, macOS, iOS or a physical-device test.

| Coverage | Result |
| --- | --- |
| 5 routes × 2 themes × desktop/mobile × 3 engines: 60 views | No horizontal overflow; one H1 per route. Chrome/Firefox had no normal page errors. WebKit exposed the CSS-readiness failure below. |
| 5 routes × no-JS / no-Canvas / blocked storage / reduced motion × 3 engines at 320px: 60 cases | Content remains available and no horizontal overflow. No-JS/no-Canvas fallbacks work. WebKit's initialization race affects some blocked-storage/reduced cases; it is not a storage API failure. |
| Theme, archive filter and Motion off in normal matrix | Work in successfully initialized views. Some WebKit views have animation with a hidden Motion control: this is a failure, not a pass. |
| Missing Object.hasOwn | Simulated capability removal throws; content/SVG survive but “Motion: on” is misleading. |
| Drawing exception after activation | Injected exception stops rendering while readiness still hides fallback. |
| Context-lost event | Synthetic event is ignored; does not simulate actual GPU/context loss. |
| CSS delayed 1.5 s / blocked | WebKit delay reliably reproduces initialization failure; blocked CSS reproduces it in all engines. Chrome/Firefox waited for delayed CSS. |

[Matrix](results/browser-matrix.json), [first natural WebKit failure](results/browser-matrix-firstattempt.json),
[CSS timing evidence](results/css-readiness.json), [rapid-reversal evidence](results/rapid-reversal.json).
The first matrix attempt aborted at the hidden control; the harness was corrected
to record the failure and complete the rest, without changing production code.

**Practical support boundary:** current tested Chromium/Firefox engines provide
the functional enhanced experience in this lab; weak devices still incur the
measured motion cost. WebKit enhancement is not ready for a broad compatibility
claim. Basic readable content works in the tested no-JS/no-Canvas cases. No minimum
historical browser version, real iPhone/iPad, Android, 4K screen, embedded WebView,
native zoom/print dialog or production-origin guarantee is established by this audit.

## Prioritized findings and bounded fixes

| ID | Priority | Finding and source | Required treatment |
| --- | --- | --- | --- |
| R1 | Before release | CSS-readiness / partial initialization: HTML head order; `space.js:380,428–432,539–560` | Put CSS before deferred enhancement, validate palette atomically, gate scheduling on completed initialization, retry when CSS becomes available and expose a working Motion control before autonomous motion. Remain static if styling is unavailable. |
| P1 | Before release | 5,608–9,115 fallback SVG paths, 1.29–2.02 MB HTML: `build_scene_fallbacks.cjs:8–20` | Produce a deliberately small static scene or external image rendition. Preserve recognizable thematic composition and useful no-JS/no-Canvas display. |
| P2 | Before release | Large per-paint allocations/projection/sort; scroll bypasses cap: `space.js:342–377,471–510` | Profile actual draw work; cull objects earlier, cache/reuse work where equivalent, and use a measured quality/paint budget on slow devices. |
| R2 | Before release | Same-frame scroll reversal retains old target: `space.js:464–469` | Cancel obsolete camera animation when the newest target equals current pose; preserve ambient scheduling. Add focused regression. |
| R3 | Before release | Drawing/context failure has no fallback recovery: `space.js:389–391,471–510` | One bounded failure path stops work, exposes reliable static output and keeps controls truthful; test initial and post-activation failures separately. |
| P3 | Before release | Writing CLS 0.237 | Identify the shifting enhancement transition, reserve final space or apply state before first paint; verify normal and deep-linked filter states. |
| C1 | Compatibility cleanup | Unguarded Object.hasOwn: `space.js:498,534` | Use a compatible own-property check or a deliberate capability gate; record the supported browser policy. |
| Q1 | Focused cleanup | Complexity, dead code, accumulated CSS overrides | Separate geometry/projection/lifecycle responsibilities where useful; remove verified dead code, consolidate cascade carefully. Avoid a wholesale formatting rewrite solely for warning counts. |
| A1 | Small corrections | Writing ARIA semantics; favicon; decorative wordmark naming | Correct semantics and add a local icon; confirm default and filtered archive states with keyboard/accessibility tools. |

R1's observed chain: WebKit reads empty variables at ~164 ms while the delayed
stylesheet has not arrived. `readColors()` clears valid state before `blendColor`
throws. Initialization skips control setup, but already-registered load/resize
callbacks subsequently schedule painting and mark the canvas ready. Loading CSS
later does not complete initialization. Merely swallowing the exception or adding
an arbitrary timeout would leave the lifecycle defect.

These are engineering priorities, **not security severity ratings**. No finding
requires redesigning the site, adding a rendering framework or removing the
requested ambient motion from capable devices.

## Execution split and proposed acceptance

Use Sol for a bounded implementation pass from [SOL-TASKS.md](SOL-TASKS.md), with
this frozen baseline and reproducers. Use a separate reviewer for final source,
measurement and artistic comparison. Current agent review has not accepted future
fixes. Keep PR #10 Draft and issues #1/#12 open until their respective work is done.

Proposed engineering targets, to confirm against repeated measurements after fixes:

- Same lab configuration: median of 3 mobile runs per route, LCP ≤2.5 s,
  TBT ≤200 ms, CLS ≤0.1, performance score ≥90 as a secondary signal.
- Reduce decorative fallback to a small explicit budget: aim ≤250 SVG nodes or
  an external static asset; public HTML target ≤100 KB raw per route. Record any
  justified exception and the actual DOM/transfer benefit.
- At mobile ×4, painted-callback p95 ≤33 ms with bounded long tasks; retain useful
  scroll response. The sum of animation callback durations should be ≤20% of
  sampled elapsed wall time after settling, or step down to a visually reviewed lower tier. These are
  proposed local targets, not physical-device promises or Web standards.
- Preserve macro motif positions/identities across adaptive tiers. The current
  `compact` switch changes root counts/angles and must not be reused as a live
  quality toggle that makes the entire composition jump.
- Off/reduced: no continuing animation work after settling. Failure/hidden/print
  paths must not restart uncontrolled motion or advance suspended time.
- All three engines: no unexpected errors in normal, delayed CSS, blocked CSS,
  storage denial and fallback checks. Real iOS Safari and a modest Android phone
  still require a short physical smoke check before claiming mobile acceptance.
- Re-run source-hashed all-page previews after source changes and compare the
  recognizable thematic structures, both themes, navigation and original content.

## Primary method references

- [SonarJS and its ESLint plugin](https://github.com/SonarSource/SonarJS).
- [Semgrep local scans](https://docs.semgrep.dev/running-rules).
- [Lighthouse scoring and variability](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring).
- [Lighthouse Total Blocking Time](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time).
- [Cumulative Layout Shift](https://web.dev/articles/cls).
- [Playwright browser distribution boundaries](https://playwright.dev/docs/browsers).
- [Object.hasOwn compatibility](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn).

Nothing in this audit merges the PR, deploys the site, selects hosting/licensing,
changes a research claim, or certifies security/accessibility on untested devices.
