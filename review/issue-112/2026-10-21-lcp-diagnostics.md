# Issue 112 — 21 October 2026 diagnostic implementation

Owner: https://github.com/oborskyivitalii/oborskyivitalii/issues/112.
Execution: Draft [PR117](https://github.com/oborskyivitalii/oborskyivitalii/pull/117)
on `work/issue-112-lcp-diagnostics-20261021`.
Role: Sol implementation/self-analysis; separate I1 and I2 independent reviews completed (receipts below).
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

I1 independent review and correction re-review completed before route probes.
The twelve cold entries below completed on a clean source. No historical root
cause is established; current final acceptance and I2 interpretation review
remain separate gates.

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
The final correction re-review cleared the runner before route measurements
(see its verbatim receipt below).

The first correction re-review verified the exact prepared diff
`55cddac00e81f0ed414581ca193287b122abda2fa8e8bb77f27e5c10ef505d08`,
resolved F01/F03/F04/F05/F06, and independently admitted44 archive files and12
retained calibration rows. F02 remained blocking because uncertain context
disposal could overlap the next trial. The current correction stops the whole
series on any failed row, saves all unexecuted scenarios, and immediately enters
owned-browser teardown. Its negative covers both a late-created context and a
context that cannot close; neither permits a second observation. Re-review of
this last correction completed successfully (verbatim receipt below).

## I2 route observations and interpretation

The 12 predefined cold initial documents ran sequentially, balanced order,
1440×900/DPR1/light/visible, no CPU/network throttling, 10s per document.
Chromium153.0.8010.0 and Playwright1.63.0; SDK intentionally blocked. Every row
is instrumentation-valid, with no browser/collector errors, unknown requests,
beacons or cleanup failures. All remaining-scenario lists are empty. The exact
44-file production archive passed admission again after execution. All three
Home traces are retained privately with verified hashes.

| Initial document | Trial1 / Trial2 / Trial3 LCP (ms) | Final LCP element |
| --- | --- | --- |
| `/` | 344 / 256 / 260 | `img.portrait-media` |
| `/index.html` | 256 / 256 / 244 | `img.portrait-media` |
| `/research.html` | 248 / 288 / 240 | `span.reading-title-ink` |
| `/writing.html` | 248 / 292 / 324 | `span.reading-title-ink` |

Home root image response duration was18.6–54.1ms and its render-delay component
219.6–267.4ms. Long tasks of117–142ms occurred before Home LCP. These are measured
local critical-path observations, not a decomposition of every render-delay
millisecond into CPU work. They do not identify the cause of historical Poor
sessions. No>4000ms LCP occurred, and three trials per route cannot establish a
population regression or a meaningful root-versus-index difference.

Clean local producer commit: `67addc0732da818cc050b7e0b8b724c7ac77a012`.
Tree: `08595249021dfef485d9074d2ac9137b10832ee5`.
Collector SHA256: `f344e9010c6c0df73eed3cbf29f6bf719d60250691d04ff2f86882445d99ea7b`.
Runner SHA256: `0baa2a39c79121e9a56dcd68e4036855871ab8feaa99f8a5b594c1ff1c2be8e9`.
Raw route report SHA256:
`383660873ec182a1e94a0d0bd68d8bbd2dadfe03b64a2d03fab45fa55f9119f7`.

Local Git had no push credentials. The authorized GitHub connection published
exactly the same tree as commit
[`935327d775569894ef480a103834061373500196`](https://github.com/oborskyivitalii/oborskyivitalii/commit/935327d775569894ef480a103834061373500196).
Both tree identities were verified. The original measurement report stays
unchanged; this is equivalent source bytes, not a claim of identical commit IDs.
Later report/memory edits do not relabel the measured source.

| Scenario | Observation | Disposition |
| --- | --- | --- |
| T00 calibration | 12/12 discriminate healthy/resource/stall/missing timing | Synthetic instrumentation evidence only; original dirty producer and corrected5s header recorded |
| T01 native Windows/macOS | No available native host | Pending, Linux is not a substitute |
| T02 cold initial documents | 3×4 entries, LCP240–344ms, no Poor reproduction | Cold subset complete; reload/reopen/warm/soft navigation pending |
| T03 real SDK and SPA beacons | SDK retrieval HTTP403/error1010 and browser ERR_EMPTY_RESPONSE | Blocked/inconclusive; no stub-based vendor pass |
| T04–T09 | No new execution | Unexecuted; select only to resolve a concrete hypothesis |

Recommendation: retain this opt-in harness and capture one actual slow desktop
Chrome Home session with a same-navigation trace, all LCP candidates,
Navigation/Resource Timing, lifecycle/visibility and the real SDK beacon. Until
that evidence exists, no site/runtime, fractal, analytics or transport fix is
supported. Repeat lab audits alone would not resolve this remaining boundary.

## Acceptance evidence

| AC | Check / source | Current result | Remaining gate |
| --- | --- | --- | --- |
| AC01–AC05 | Dated20October issue receipts, unchanged-production guard | Historical evidence preserved; this continuation has separate immutable inputs | Do not relabel historical observations as new runs |
| AC06 | DIAGNOSTIC19cases; T00 original report and revalidation | Calibrated resource/stall/missing timing; I1 findings resolved | Actual real-SDK identity/beacon remains unavailable; whole criterion open |
| AC07 | T00 and T02 clean producer67addc0/tree0859524 | Calibration12/12 and cold12/12, all outcomes retained | Native T01, real-SDK/T03 and broader T02 incomplete; whole criterion open |
| AC08 | CS01/04/05/07/08/09/10; existing Basic/style/format/RI/CI and registry | I1 independent review complete, scoped source checks pass | Final exact-head policy, I2 review/live verification and maintainer merge; whole criterion open |

PR117 remains Draft. Hosted navigation, Basic and owning-issue workflows defer
execution for Drafts; a skipped/deferred job is not a passing check. Local exact
clean-head policy and final workflow disposition will be linked in the PR/issue
without making this Ready, merged, accepted stable staging or production
publication. The repository controller automatically published an isolated
Draft prototype for935327d at
[314a108d](https://314a108d.oborskyi-author-ci-staging.pages.dev),
[run39514170246](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/39514170246).
Its source/browser and stable-staging admission are deferred; a prototype is not
performance evidence. Final-head preview status is tracked separately in the PR.
Existing hosted profiles/budgets and production/site/docs source bytes remain
unchanged.

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

## I2 final independent receipt

Reviewer: `/root/review_lcp_implementation`. Verbatim final response:

**I2 has no blocking findings.**

Reviewed diff SHA256 `0abddb45223e684040f0ee26532821f875e10ee67bcc491270172846162391c7` against published base `935327d775569894ef480a103834061373500196`. All manifest hashes match; diagnostic code remains unchanged from cleared I1.

I independently verified:

- All twelve analyses, reported values/elements and root component ranges.
- Twenty-four error-free snapshots, balanced trial order and nonoverlapping document windows.
- Served artifact hashes, 44-file admission, raw report identity and three trace hashes.
- Tree equivalence between local `67addc0…` and published `935327d…`.
- Fresh RI, passing 15-check coupling verification, unchanged production paths, and live Draft/unmerged PR117 status.

The conclusions, privacy treatment, recommendation and handoff accurately preserve the evidence limits. The cold subset did not reproduce Poor LCP. Native T01, real-SDK/T03, broader T02, final exact-head acceptance and merge remain pending; AC06–AC08 should remain unchecked.

Hosted source checks were skipped, and the prototype’s deferred browser/stable-staging gates are described correctly.

No files were modified or browser measurements run during this review.
