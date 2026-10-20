# Issue 112 — 21 October 2026 diagnostic implementation

Owner: https://github.com/oborskyivitalii/oborskyivitalii/issues/112.
Execution: one Draft PR on `work/issue-112-lcp-diagnostics-20261021`.
Role: Sol implementation/self-analysis; separate iteration review pending.
Base: `ca70a66f340a8e804e4263c02aa9abe79a062765`.
Production: `prod-2026-10-19.2`, source
`82b57b8948c6c30143213b846ee2848d06f8d200`, tree
`493117e64bf4e16333d99c8ac1504dba3ab39283`.

## Intent and authorization

After the reviewed Home-LCP diagnostic design and #113/#112 clarification,
the owner instructed “Сол приступай”. The 21 October issue amendment authorizes
diagnostic tooling and bounded execution here, preserving the original stop
before production remediation/release. Historical AC01–AC05 evidence stays
dated; AC06–AC08 explicitly describe this continuation. No new owning issue.

The privately delivered design has ten scenarios. This first wave implements
calibration, isolated native document comparisons and real-SDK replay support.
Native Windows/macOS T01 needs an actual native observation; Linux headless is
not its substitute. T04–T09 remain targeted next probes, selected by evidence.

## Owners, protocol and code style

- `tools/quality/lcp-diagnostic.cjs`: frozen artifact/SDK request admission,
  pre-script browser observer and honest per-document timing interpretation.
- `tools/quality/lcp-browser.cjs`: explicit bounded sequential CLI; production
  HTTPS origin is preserved while artifact requests are fulfilled locally.
  RUM POST is intercepted before navigation; unknown requests fail closed.
- `tests/lcp-diagnostic.test.cjs`: meaningful timing, missing-data, text candidate,
  telemetry, artifact mutation and calibration-completeness negatives.
- `tests/test_issue112_acceptance.py`: invokes those source checks, verifies
  unchanged production owners/budgets and diagnostic scheduling. It cannot prove
  real browser/SDK behavior or historical root cause.
- Existing profile/catalog/RI/CI owners register navigation and targeted source
  execution only. No new routine hosted matrix, workflow, publisher or budget.

CS01/CS04: reuse `artifact.cjs`, `common.cjs`, `serve.cjs` MIME owner and existing
profile registry; no runtime/build dependency reversal. CS05: pinned formatting.
CS07: single browser, sequential trials, bounded observations/trace storage,
explicit cleanup and no background benchmark/scanner concurrency. CS08: real
behavioral negative controls, no snapshot-string proxy for browser acceptance.
CS09: unchanged bounded style guard. CS10: issue/policy, exact-source checks,
independent iteration review and explicit pending native/SDK/live/merge gates.

## Frozen inputs and privacy

Archive package SHA256:
`302690ddd3da93d21b5738c327be52047dfe97e5577053938da432d1df490911`.
All 44 public file names, lengths and SHA256s were verified before diagnostics.
The CLI repeats admission after measurement. No rebuild from moving main.

Raw traces, collector snapshots, SDK payloads and private field analytics remain
outside the checkout. This public report contains sanitized technical outcomes
only. There is no production-origin browser upload or telemetry forwarding.
SDK bytes require explicit retrieval metadata/hash binding. A missing SDK must
not be replaced by a stub and labeled real-provider evidence.

The routed origin replay is cold/cache-disabled; it is not production transport
or a warm-cache measurement. The existing loopback server responds no-store.
Warm cache is pending until independently observed using a cache-preserving
mechanism. Source/CI checks never satisfy a browser performance criterion.

## Current execution

I1 calibration completed: **12/12** predefined trials, zero browser errors or
unexpected requests. Baseline LCP44/44/72ms; injected resource response delay
2032/2040/2032ms with resource-load component2007–2010.6ms; injected main-thread
stall2036/2032/2036ms with observed2000ms long tasks and render delay2021.5–2024.9ms.
All three deliberately omitted-timing snapshots are incomplete with no invented
breakdown. These synthetic cases validate the collector; they are not production
performance measurements or reproduction of the historical Poor tail.

Raw calibration report binds collector SHA256
`8f1ab007bfee20b142a5470b5079b043a14de612729eeaa563c5e21a86bc45fc` and
original runner SHA256
`706c1abbf4b8af4568a554d5e5bb43d711003e787547f3aa6a799af3588da831`.
It honestly records a dirty prepared checkout, not a clean-commit acceptance run.
Later runner hardening retains failure rows on trace/cleanup failure, bounds
trace completion, records final input integrity and explicitly documents that
headless tab switching may not actually hide the first page. The calibration
observer and control fixtures are unchanged; analysis/validation were hardened
and the retained observations revalidated. Its raw observations
retain their original producer identities and are not relabeled as a new run.

Pinned Playwright1.63.0 is installed outside the repository. Normal browser-CDN
downloads failed with non-ZIP responses. A separately packaged
`@sparticuz/chromium@153.0.0` supplies actual Chromium153.0.8010.0, with only normal
`--no-sandbox`/`--disable-dev-shm-usage` extra flags; no package security-disabling
flags are used. Actual executable and launch args are recorded. This is Linux
headless/custom-browser diagnosis, not the pinned browser build or native T01.
The initial direct SDK retrieval returned HTTP403/error1010; real-SDK execution
is pending and no stub is substituted. Headless tab switching actually left
visibilityState=visible, so a visibility-triggered vendor flush is not assumed.

I1 independent review and current-source verification are pending; route probes
follow its correction review. No historical root cause is established.

## I1 independent review and correction candidate

Reviewer `/root/review_lcp_implementation` independently inspected the complete
prepared diff `bbf3053ed43da35160d659c99c8432df2dd4c62dccc44760e89ebc2003c9f133`,
original issue/ACs, source, all11 initial tests and the12 raw calibration rows/six
traces. Its findings required correction:

| Finding | Severity / AC | Corrected behavior and verification |
| --- | --- | --- |
| F01 SDK body overwritten by numeric metadata bytes | High; AC06/07/08 | Separate Buffer body from numeric length; actual normal/delayed route-handler tests hash and fulfill the exact captured bytes. |
| F02 unbounded trace CDP/cleanup | Medium; AC07/08 | Whole end/completion/read/close deadline, bounded observation/context teardown and owned browser-process fallback kill; any failed trial is retained, all remaining scenarios are marked unexecuted and the series stops before owned-browser disposal. Stalled end/event/read/close, failed-row/cleanup and late-context/no-next-trial negatives. |
| F03 zero/partial timings admitted as complete | Medium; AC06 | Require usable positive Navigation/Resource request timing, preserve available fields and unknown components, reject inconsistent order; zero/omission negatives. |
| F04 long task alone could fake calibration | Medium; AC06/08 | Require the injected resource/render component and LCP shift against healthy controls; an unrelated/impossible task with a fast LCP is rejected. |
| F05 outer/embedded archive source drift | Medium; AC06/07 | Reconcile source/candidate/tree/clean/artifact identities; adversarial metadata mutations reject before launch. |
| F06 calibration window metadata mismatch | Medium; AC07 | Actual per-row/scenario windows recorded. Original calibration header incorrectly says10000ms; actual source and snapshots establish5000ms. Original report is retained unchanged; separate revalidation/correction receipt preserves its hash. |

Correction source tests **19/19**, plus3/3 targeted Python wrappers pass. Stronger
calibration admission was run against the retained original rows and passes12/12;
this is revalidation of old observations, not a fresh browser measurement. Its
original report SHA256 is
`813badccd33db058a63e4a955486ee9266afabdc9d787ceb266c22925d5d10eb`.
The current validator digest is retained in the private revalidation receipt.

The output destination now checks canonical real paths as well as lexical paths.
T02 here covers native **cold initial documents only**. Native reload/reopen,
warm HTTP cache and same-session navigation comparisons remain unexecuted; do
not declare the entire broader T02 design complete. No fake visibility event is
used to manufacture a vendor flush. SDK acquisition via the actual headless
browser also failed with ERR_EMPTY_RESPONSE; T03 remains blocked, not passed.
Correction re-review is pending before route measurements.

The first correction re-review verified the exact prepared diff
`55cddac00e81f0ed414581ca193287b122abda2fa8e8bb77f27e5c10ef505d08`,
resolved F01/F03/F04/F05/F06, and independently admitted44 archive files and12
retained calibration rows. F02 remained blocking because uncertain context
disposal could overlap the next trial. The current correction stops the whole
series on any failed row, saves all unexecuted scenarios, and immediately enters
owned-browser teardown. Its negative covers both a late-created context and a
context that cannot close; neither permits a second observation. Re-review of
this last correction is pending.

## Acceptance evidence

| AC | Check | Current result | Remaining gate |
| --- | --- | --- | --- |
| AC01 | Historical source/privacy plus unchanged-source guard | Prior evidence preserved; new archive verified | Private historical window receipt remains separate |
| AC02 | Collector behavior/negative controls | Source checks pass | Current browser/SDK observation |
| AC03 | Predefined calibration/route cases | Runner prepared | Actual sequential execution and limits |
| AC04 | Evidence-based recommendation | Pending final report | Independent review and interpretation |
| AC05 | Unchanged runtime/production/budgets, private raw data | Prepared scoped guard | Final exact-source/privacy review |
| AC06 | Diagnostic source and calibrated browser collector | 11/11 source cases; calibration12/12 | Independent current-source review |
| AC07 | Bounded first-wave runs, exact archive and honest unsupported cases | Archive44/44 | Actual browser/SDK/native evidence |
| AC08 | Style, Basic, RI/CI, targeted registry, independent review | Pending final candidate | Current-source checks, review and merge decision |

## Reproduce

Use the frozen release archive's **extracted `public/`** directory and original
archive/package files, outside the source checkout. Install the existing pinned
Playwright/formatting toolchain. Example for one explicit diagnostic suite:

```sh
node tools/quality/lcp-browser.cjs --suite calibration \
  --public /absolute/frozen/public --archive /absolute/archive.json \
  --package /absolute/public.tar.gz --output /absolute/private/calibration
```

`--suite routes` executes three balanced cold opens of `/`, `/index.html`,
`/research.html`, `/writing.html`, default10s per initial document. It explicitly
blocks SDK loading unless captured bytes are supplied. For `--suite sdk`, pass
`--sdk /absolute/beacon.min.js --sdk-metadata /absolute/beacon.meta.json`.
That file needs the official retrieval `url`, `sha256` and `bytes`. Normal,
5s-delayed and blocked SDK journeys retain individual results and intercepted
payloads. Missing execution is inconclusive. `--window-ms` is5000–30000;
`--tools` and `--chrome` select and record actual external toolchain/executable.

Source checks: `node --test tests/lcp-diagnostic.test.cjs` and the selected
`.github/acceptance/issue-112.json` policy. None grants release admission.

## I1 final independent receipt

Reviewer: `/root/review_lcp_implementation`. Verbatim final response:

**F02 is resolved. No blocking findings remain in the reviewed I1 source.** The candidate is cleared for the bounded, sequential T02 cold-entry suite.

Reviewed diff SHA256: `83f3a3ef293d7babca59a5e745066242264a2b853224dfd456a6aa03494cca65`, against base `ca70a66f340a8e804e4263c02aa9abe79a062765`. All final-manifest hashes match.

The orchestration now saves the failed row and remaining scenarios, stops before another observation, and enters owned-browser teardown. The new negative covers late context creation and stalled disposal. I independently ran Node **19/19** and Python **3/3** successfully.

F01–F06 are resolved, reusing the unaffected prior review. Historical calibration remains admissible with its original identities and five-second metadata correction. Broader T02, native T01, real-SDK/T03 and performance acceptance remain pending.

No files were modified and no browser measurements were run during this review.
