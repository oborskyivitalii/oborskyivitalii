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

## I3 second-wave implementation candidate

Reviewer for I3, its correction and I4: `/root/review_lcp_implementation`,
separate non-author reviewer; read-only inspection, no benchmark execution.

User authorization: after the proposed CPU/DPR, reload/cache and conditional
state/single-factor sequence, “Роби”. AC09/AC10 were appended to the existing
live issue before implementation; AC08's CS01/04/05/07/08/09/10 still applies.
Base: `aa056db116d842c0b196176d04021a6eb14b7b55`.

Workspace maintenance removed the previous scratch checkout/toolchain. Source
was restored from PR117, prior private evidence from its persisted ZIP, verified
SHA256 `ec6ba181037659a9316915b140792f22cad909beae9cfa62a000468448659444`,
and the immutable release package was independently downloaded and verified
against its original SHA256.44 files pass admission. No historical observation
was repeated or relabeled. Existing baseline source tests19/19 pass after restore.

The collector now records runtime state at first scene readiness, each LCP
observer callback and final snapshot: actual DPR/viewport, Canvas CSS/bitmap
size, theme/reduced-motion and existing scene quality/detail attributes. No
engine hook, per-frame loop or production script change is introduced. Snapshot
reads have diagnostic overhead; observed state is timestamped callback state,
not a claim of exact state at the earlier paint. The production runtime clamps
Canvas ratio to1.5 initially and can adapt it further; requested DPR2 is not a
promise of twice the bitmap dimensions.

`--suite cpu`: CPU1/DPR1, CPU4/DPR1, CPU4/DPR2; three trials each in balanced
order,1440×900/light,30s windows. This covers the historical approximately28s
horizon without changing the collector's existing30s maximum. CDP CPU command is acknowledged before
navigation; actual DPR and Canvas/scene readiness are admitted, not inferred.
All9 traces are retained. CPU throttling is simulation, not native hardware.

`--suite cache`: three fresh contexts, each cold → native reload → close/reopen,
10s per document, CPU1/DPR1. `lcp-cache.cjs` owns the exact-byte HTTP fixture,
explicit600s freshness/strong ETags, CSP self/connect-none restrictions, bounded
CDP network observations and portrait/CSS/engine cache evidence. No Playwright
routing disables cache here. It checks fresh timeOrigin, native navigation type,
Timing body/transfer sizes, matching CDP GET/response observations and either
CDP cache flags or actual server304 records. Service-worker, contradictory or
missing corroboration remains incomplete. Validation recomputes analysis and
cache proof from current raw fields and rejects stale derived results.
A fast load or zero transfer alone cannot pass. The production-only SDK origin
guard skips itself on this loopback fixture; no real-SDK/CDN claim follows.
Cache header behavior is a counterfactual, not a copy of production headers.

Ownership: existing observer/analyzer, bounded runner and test registry are
extended; the cache concern has one helper. Dependency direction stays tooling
→ frozen artifact; site/docs/workflows/budgets are unchanged. All outcomes and
remaining scenarios are retained. Shared cache contexts are disposed after the
third document; any earlier failure aborts the whole series and owned browser.
No benchmark/scanner concurrency. Conditional appearance/single-factor probes
will be selected only if this wave supports a concrete hypothesis.

Source verification and independent I3 review precede actual measurements.
Native T01 and real-SDK/T03 remain pending, with earlier failure receipts kept
separate. This addition does not claim new performance or historical RCA.

Prepared I3 checks: source26/26 and issue wrappers3/3 pass; Basic, bounded style
guard94files, RI regressions28/28, coupling regressions20/20, map15checks and
fresh derived views pass. Chromium153.0.8010.0 / Playwright1.63.0 blank-page
capability preflight acknowledged CPU4, returned actual DPR2 and Canvas2D. This
is capability evidence only. The same custom-browser/native limits apply as I1.
Initial independent I3 review required the corrections below; no new Home
measurements have started. Correction re-review is required before execution.

### I3 independent review receipt

> **I3 requires corrections before measurements.**
>
> Reviewed diff SHA256 `2e45d2c6261a9631fb8df43bc4487be2607179f65a16faa03dfe381ee513b79c` against base `aa056db116d842c0b196176d04021a6eb14b7b55`. All manifest hashes match.
>
> - **F07 — Medium; AC10/AC08; `lcp-cache.cjs:143–171`.** Validation trusts stored analysis and cache-confirmation booleans. Independent probes changed navigation timing to zero or removed warm-cache network/ledger evidence; validation still passed. Recompute from current raw fields and add stale-result negatives.
> - **F08 — Medium; AC10/AC08; `lcp-cache.cjs:116–123`.** The 304 branch confirms cache use with no CDP evidence. Require matching CDP request/response corroboration and reject service-worker or contradictory evidence. Missing corroboration must remain incomplete.
>
> The CPU implementation has no separate blocking finding. Extending its nine observation windows to **30 seconds** reasonably covers the historical approximately 28-second horizon; update the protocol before execution. Cache windows can remain ten seconds.
>
> The readiness assumption holds for the admitted frozen runtime: its engine explicitly waits for DOMContentLoaded, and the collector registers first.
>
> I independently verified **26/26 Node tests**, **3/3 Python checks**, fresh RI, **15 coupling checks**, unchanged production paths, and **44-file archive admission** with the original package hash. Session ownership, sequential disposal, cache routing absence, fixture limits, and opt-in registry mapping were examined.
>
> No files were modified or browser benchmarks run. Correction re-review remains required.

F07/F08 corrections: the validator now recomputes Navigation/Resource analysis
and cache proof from raw row fields; stale status/proof is rejected. Cache proof
requires matching GET responses with no service worker, rejects contradictory
responses and distinguishes full-response, browser-cache and server-confirmed
304. Negatives cover stale valid analysis, stale cache booleans, missing body/CDP,
service worker, bad method/status and conflicting server responses. The actual
HTTP fixture's exact-body/ETag/304 test remains separate from admission mocks.

### I3 correction re-review receipt

> **F07 and F08 are resolved. I3 is cleared for the bounded 9 CPU trials and 9 cache document observations.**
>
> Reviewed diff SHA256 `d6204ffb866764865b3418dfac26911bb4667d408331f4a079d995469f094844` against base `aa056db116d842c0b196176d04021a6eb14b7b55`. All manifest hashes match.
>
> The validator now recomputes admission from raw evidence, rejects stale validity/cache proof, and requires matching CDP GET/response corroboration. Missing, service-worker and contradictory evidence remain incomplete.
>
> I independently verified **27/27 Node tests**, **3/3 Python checks**, fresh RI, **15 coupling checks**, and unchanged production paths. Unaffected prior review remains applicable.
>
> The live protocol specifies **30-second CPU windows** and **10-second cache windows**. Use explicit `--window-ms 30000` for CPU execution.
>
> Actual evidence review and AC09/AC10 acceptance remain pending, alongside native/SDK and merge gates. No files were modified or browser measurements run during this re-review.

## I4 CPU/DPR and cache observations

Both suites executed sequentially from clean published diagnostic source
`815d62d5b1350c7f8a1be357d46bc744b272a060`, tree
`c685ff4552554d70dfe4c065098b0824890be225`. This is the I3 correction-reviewed
code plus its verbatim receipt and deterministic RI refresh. Production input
remains source82b57b8, package SHA256302690dd…490911, public digestcd0fd21f…32c1b;
all44 files were admitted before and after both suites. No source changed during
either measurement. Linux headless Chromium153.0.8010.0 / Playwright1.63.0,
1440×900, no network throttling; no benchmark/scanner ran concurrently.
The custom Chromium build differs from pinned CFT153.0.8010.12. This is neither
native Windows/macOS evidence nor a pinned hosted browser-gate pass.

Private raw report identities:

| Suite | Navigation starts, UTC21October | Window/document | Rows | Report SHA256 |
| --- | --- | --- | --- | --- |
| CPU/DPR | 04:55:22.805–04:59:35.896 | 30000ms | 9/9 | `c29a2e07ec5b5e19935b310317df88a1bc4bf26ecc4e8e3e76a8129d70f8c185` |
| Cache | 05:00:20.126–05:01:43.205 | 10000ms | 9/9 | `32f46649dc128cbdb293f7c72ccd87b3a435f6f11d51bb99a491f7ad5b5ff21e` |

Both validations pass with zero failed/unexecuted rows, collector/page errors,
unexpected requests, trace/cleanup errors or emitted telemetry. All18 compressed
traces have verified size/SHA bindings. All final LCP elements are
`img.portrait-media`; no final LCP exceeds4000ms in either observation horizon.
This is bounded non-reproduction, not a historical RCA.

### CPU/DPR results and observed adaptation

Cold production-origin replay, HTTP cache disabled by routing, SDK blocked.
Trials were balanced1/2/3 rather than parallel. CPU command acknowledgement and
actual DPR were retained for every row.

| Profile | LCP trials1/2/3 (ms) | First new-document frame duration1/2/3 (ms) | Canvas bitmap at scene ready →30s |
| --- | --- | --- | --- |
| CPU1 / DPR1 | 288 /240 /260 | 112.0 /76.2 /90.8 | 1440×900 →1440×900, all3 |
| CPU4 / DPR1 | 752 /348 /312 | 219.7 /179.3 /205.0 | 1440×900 →1440×900, all3 |
| CPU4 / DPR2 | 888 /804 /320 | 237.4 /205.0 /212.3 | 2160×1350 →1800×1125 /1440×900 /1800×1125 |

CSS Canvas size is1440×900 throughout. At first scene readiness all9 have
detail0/full geometry; the quality attribute is absent then, not an observed
quality0. At30s CPU1 has quality0/full geometry, CPU4/DPR1 quality1/compact,
CPU4/DPR2 quality1/2/1 and compact geometry. Runtime clamping/adaptation actually
occurred; requested DPR2 never means a2880×1800 bitmap here. LCP callback state
is retained separately from first readiness and30s state, with its own timestamp.

The requested browser `colorScheme: light` did not pin the site's theme. Its
frozen theme.js uses the device clock in auto mode. All initial CPU readiness
and LCP observations were dark; the last CPU document was light at30s, and all
cache documents were light. This incidental auto transition is not a controlled
appearance experiment. Clock/timezone were not pinned. I3's shorthand “light”
describes the browser preference only; actual runtime observations govern the
result. No cross-suite difference is attributed solely to CPU/cache or theme.

CPU portrait resource loading was13.6–36.7ms; the calculated post-resource
render component was215.4–830.8ms. The first engine frame was76.2–112.0ms at
CPU1 and179.3–237.4ms at CPU4. Trace inspection confirms startup main-thread
work, but the render component also includes style/layout/paint/presentation
scheduling. It is not100% fractal mathematics or engine CPU. Some portrait LCPs
precede scene readiness, consistent with the prior absence of a mandatory gate.
Three trials per profile do not establish a field distribution or device parity.

### Cache results and corroboration

Each trial owns a fresh context and follows cold →native reload →close/reopen;
timeOrigin is distinct for all9 documents. Native navigation types are
navigate/reload/navigate. The fixture uses exact archived body bytes with
max-age600, strong ETag and outbound-blocking CSP; no Playwright route is
installed. Header behavior is explicitly a loopback counterfactual.

| Mode | LCP trials1/2/3 (ms) | Portrait/CSS/engine proof, every trial |
| --- | --- | --- |
| Cold | 288 /256 /348 | Positive transfer/body sizes, matching CDP GET/200, server200 |
| Reload | 280 /264 /328 | Positive body sizes, transfer0, CDP requestServedFromCache; no critical-resource server request |
| Reopen | 232 /308 /260 | Positive body sizes, transfer0, CDP fromDiskCache; no server request |

All18 warm critical-resource proofs confirm browser-cache use. Reload revalidates
the HTML document with an actual server304; it does not revalidate the three
critical assets. Reopen has no server request at all. Cold trials each have8
server200s. Bodies are55458/39711/127014 bytes for portrait/CSS/engine, matching
the admitted artifact. No service-worker response, rejected request or ledger
truncation occurred. A zero measured reload resource-load interval is supported
by cache evidence; missing timing alone would fail admission.

New-document first-frame analysis requires the matching main-frame
navigationStart, CommitLoad and subsequent space.js EvaluateScript before the
frame() event. This excludes old-page animation during reload; navigationStart
alone would misattribute a7.816ms old-document frame in reload1. The actual new
frame there is27.665ms. Actual new frames span27.7–110.1ms in this suite.
Trace LCP events match navigation identities and differ from DOM LCP by under4ms
of event/presentation reporting precision; exact timestamp equality is not claimed.

The production-only SDK is ineligible on HTTP loopback and sdkState isnull for
all9 cache documents. CPU replay also has no vendor execution. Neither arm
establishes Cloudflare beacon, production headers, real CDN or network behavior.
Earlier ordinary SDK retrieval failures remain pending; no substitute was used.

### Disposition and next diagnostic

The CPU/DPR and cache hypotheses did not reproduce Poor LCP in this environment.
Adaptive geometry and verified warm cache showed no observed startup fault.
Conditional persisted-state and single-factor follow-ups are deferred: these
rows identify no concrete slow phenotype to isolate, and the earlier engine-delay
control already exists. An incidental auto-theme transition does not justify a
broad appearance matrix. No runtime fix follows from these observations.

One next diagnostic remains a private actual slow desktop Chrome Home session
with same-navigation trace, LCP candidates, Navigation/Resource Timing,
visibility/pageshow and real SDK beacon fields. Native Windows/macOS and real
SDK remain unavailable; historical cause remains unproved. Raw observations,
server/CDP ledgers and traces stay private. Independent I4 evidence/interpretation
review was required before marking AC09/AC10 complete; its receipt follows.
AC06–AC08, merge and live admission remain separate and open; PR117 remains Draft.

### I4 independent evidence/interpretation review receipt

> **I4 has no blocking findings. AC09 and AC10 are substantively supported and can be marked complete after final-head checks and evidence links are reconciled.**
>
> Reviewed diff SHA256 `0a9b924fccd46c24d848771c9ea4af63aa609e79d97c13938f50e256e95db4a0` against measured source `815d62d5b1350c7f8a1be357d46bc744b272a060`, tree `c685ff4552554d70dfe4c065098b0824890be225`. All staged-file and 22 raw/analysis hashes match.
>
> I independently verified:
>
> - All eighteen analyses, observation windows, fresh document identities, nonoverlapping execution and 36 clean snapshots.
> - Every trace’s size/hash, navigation binding and new-document first-frame selection, including reload1’s **27.665ms** frame.
> - CPU/DPR, bitmap adaptation, theme observations and all reported numeric ranges.
> - All eighteen warm critical-resource proofs through Timing, CDP and server ledgers; HTML-only reload revalidation is correctly distinguished.
> - Archive admission, producer code hashes, clean measured-source policy **7/7**, fresh RI/coupling and live Draft/unmerged PR status.
>
> The conclusions and conditional deferrals are justified. Clock/theme differences prevent a controlled cross-suite causal comparison; the report preserves that limit. Native hardware, real SDK, production transport and historical cause remain unproved. AC06–AC08 and merge remain open.
>
> No files were modified or browser measurements run during this review.

## I5 native slow-session acquisition and handoff

Latest owner “Роби” accepts the next proposed actual slow desktop Chrome Home
capture. Existing issue112 / Draft PR117 remains the owner. AC11 records the
reviewed handoff separately from actual SDK/native/slow evidence in AC06/AC07.
Base `db8eb795c2e75c7a4342f3555e46b3a61a63aebf`.

At08:08:58–08:09:02 Europe/Warsaw, ordinary GETs returned Home/revision200;
Home53659 bytes/SHA25696cbc523…d9a799 matches the frozen public artifact exactly.
SDK returned403 with17-byte `error code: 1010` body. One ordinary browser SDK
request at08:10:39–08:10:40 failed ERR_EMPTY_RESPONSE on Linux headless
Chromium153.0.8010.0. Private receipts retain exact URLs/headers/body hashes,
timestamps and observed request failure. No browser Home visit or telemetry forwarding
occurred. Earlier failed acquisitions remain separate, not relabeled.

This environment has neither native-owner-device control nor Chrome DevTools
MCP. The web-perf MCP workflow was therefore unavailable; the existing bounded
Playwright/CDP path supplied only a normal SDK access probe. No bypass, stub,
synthetic Poor run or another replay matrix was used. A blocked environment
does not prove ordinary visitors cannot execute the SDK.

The new [native runbook](../../guides/HOME-LCP-NATIVE-CAPTURE.md) uses Chrome's
own recording/export controls for one owner-operated session. It starts before
Home navigation and locally blocks RUM delivery while allowing genuine SDK
execution. It retains trace, sanitized HAR, real SDK/payload bodies when present,
late Navigation/Resource Timing and current runtime state. The export snippet
performs no network or storage access and explicitly marks unobserved startup
visibility/pageshow/readiness/LCP/tasks as unknown. Same-navigation/source checks
and missing-body handling are explicit. DevTools overhead, normal-profile state
and lack of ingestion proof remain limits. Navigate to about:blank with blocking
still active before closing/disabling; no provider or production code changes.

CS01/04/05/08/09/10 apply: guide owns this manual procedure; existing diagnostic
code/test ownership and all budgets/matrices stay unchanged. Catalog/acceptance
mapping and RI expose the runbook. Source checks cannot prove native execution.
Independent I5 review and final-head checks are pending. The one remaining action
requires the owner's Chrome: record and privately return the three same-document
exports. Fast/failed capture is retained honestly; no repeat-until-Poor loop.

Prepared checks pass: Basic; bounded style guard94files/zero legacy occurrences;
RI28/28 and coupling20/20 regressions; map15checks; pinned formatting. Four
private export-fixture cases verify download/cleanup, preserved unknown/zero
fields, wrong-origin rejection and missing Navigation Timing rejection. These
are documentation behavior checks, not browser/native/performance observations.
Existing diagnostic code and test registry are byte-unchanged from db8eb795.

### I5 initial independent review and corrections

Reviewer `/root/review_lcp_implementation` inspected base db8eb795, prepared diff
`42dc77403cba1ac52009fe65b87588f856797c553ab328864440d17dd9a62a26`,
all10 source/10 evidence hashes, live AC11, full diff, actual access receipts and
snippet behavior. No browser/network probes or file edits were performed.

- F09, Medium/AC11: first-match Request conditions could let a prior throttling
  rule override RUM blocking and alter the scenario. Correction records/restores
  prior settings, temporarily disables other rules, puts the two RUM blocks
  first and restores only after about:blank with final attempts settled blocked.
- F10, Medium/AC11: suppressed download lost the Timing result because the IIFE
  returned undefined. Correction returns the original snapshot even if download
  throws, schedules URL cleanup and gives the immediate Console copy($_) fallback.
  Relevant suppressed/thrown download cases must preserve identical raw values.
- Correct the SDK body UI path to request Name →right-click →Copy →Copy response.
  Remove the unsupported retained-disposal-outcome wording; the receipt contains
  request failure/finished timestamp only. No new probe supplies missing proof.

The initial review otherwise confirmed startup-evidence limits, normal export,
zero/unknown preservation, rejection controls and absence of network/storage
access. Production, diagnostic code/tests and budgets remain unchanged. Correction
re-review and final-head/live-link checks are required before completing AC11.

Correction fixtures6/6 pass: normal download, silent suppression, thrown click,
failed object URL, origin rejection and missing Navigation Timing. Console copy
returns byte-identical JSON to the original serialization in all export/recovery
cases, preserving startup unknowns and raw zeros; network/storage access count0.
Snippet SHA256 `8b195b2c256470b23ed1f7528588aac3d5e0c577f86a529e06952d61d5121d7f`
(first JS fenced block plus final newline). This remains a VM/documentation
behavior check; no native or performance observation is claimed.

### I5 correction re-review receipt

> **I5 correction approved; no remaining blocking findings.**
>
> Reviewed base `db8eb795c2e75c7a4342f3555e46b3a61a63aebf`, staged diff SHA256 `2daaaf73f70a9e0ce5cb6dc5c12ce8b76d7047fcf5ed67d1d1167d6a884726ce`. All10 source and13 evidence hashes match the correction manifest. Inspected snippet SHA256 `8b195b2c256470b23ed1f7528588aac3d5e0c577f86a529e06952d61d5121d7f`.
>
> - **F09 resolved:** the guide controls rule precedence, disables other Request conditions, records prior settings and restores them only after navigation to `about:blank` and settled blocked attempts.
> - **F10 resolved:** download failures preserve the original returned snapshot. The immediate Console fallback exports identical JSON without recollection.
> - The SDK Copy response path and unsupported disposal-evidence claim are corrected.
>
> I independently exercised normal download, silent suppression, thrown click, failed object URL, failed Blob creation, wrong-origin rejection and missing Navigation Timing rejection. Recovery preserved the original JSON despite subsequent simulated runtime changes; startup unknowns/raw zeros remained intact, with zero network/storage access. These are VM behavior checks, not native execution.
>
> RI freshness, all15 coupling checks and staged whitespace validation pass. Production, diagnostic code/tests and budgets remain unchanged. Unaffected I5 review scope is retained.
>
> **AC11’s preparation requirements are substantively supported and may be completed after final-head checks and live-link verification.** Actual owner-device capture, genuine SDK payload and slow-session evidence remain pending under AC06/AC07. No files were modified or browser/network probes performed.

## I6 — Remote SDK alternative for the iPad-only owner

The owner cannot perform desktop capture and instructed “Шукай інший шлях”.
The dated issue112 AC12 scope permits one separate opt-in diagnostic workflow;
every pre-existing workflow, production/runtime/docs owner, matrix and budget
remains byte-frozen. Native desktop, real transport and historical-cause gates
are retained. The native guide is now optional pending work, with no required
owner-device action.

Preparation uses base82c6236458c9316feebe8a54facaabde3c8b0ba5. Cloudflare
search/execute/whoami each returned internal errors during alternative discovery;
no account configuration was changed. The new GitHub route makes one ordinary
canonical SDK GET with verified TLS, no custom headers, redirect following or
retry. It retains blocks/errors;200 plus JavaScript MIME/size/syntax checks admit
input, never vendor CWV execution. Frozen archive metadata and package hashes,
all44 body identities and expected release/source/tree/public digest are checked
before use. Remote SDK acquisition is a separate observation from earlier403
and ERR_EMPTY_RESPONSE receipts; no earlier result is overwritten.

The existing reviewed SDK suite plans9 balanced normal/delayed/blocked trials,
headless Linux,30-second initial windows with SPA/history journeys. Only normal
mode records traces; no HAR, true pagehide or native-device result is promised.
All site/SDK browser requests are fulfilled from admitted exact bytes; RUM is
intercepted locally and unknown requests are denied. No production browser visit
is needed. Captured vendor CORS response policy is preserved for the cross-origin
module without replaying compressed lengths/encodings or inventing allow headers.
Existing route tests cover that behavior. Collection success and the old
`sdkExecution.confirmed` convenience flag cannot establish a parsed same-document
CWV payload. Actual startTime/timeOrigin, route/pageload, timing validity and
trace/source binding require independent evidence review. Missing/blocked/unparsed
payloads remain inconclusive; there is no repeat-until-Poor loop.

The new workflow activates only for the repository owner adding the dated label
to the exact same-repository Draft PR117/branch, attempt1. It checks out and
verifies the raw event head with read-only permission, no persisted credentials,
secrets, deployment or existing-controller changes. The separate workflow/merge
identities are retained. Raw runner stdout/stderr, SDK, traces and payloads stay
outside git and are AES-256-GCM encrypted before upload using a public recipient
and RSA-OAEP-SHA256 key wrapping. The private key was persisted privately before
publication; it never enters GitHub or the runner. Only the exact sealed JSON
artifact is selected. Encryption/upload failures cannot publish plaintext.

Meaningful source negatives cover403/redirect/wrong origin/HTML/empty/invalid or
oversized SDK input, one-attempt network failure, stream overflow, binary/randomized
round-trip evidence, ciphertext/tag/IV/wrapped-key/domain/recipient tampering and
private-path/symlink rejection. Prepared Node34/34 passes; those fixtures never
substitute a fake SDK into any browser measurement. AC12 and actual remote/SDK
execution remain pending until the independently reviewed source is published
and the one authorized capture is observed. CS01/04/05/07/08/09/10 apply; current
Basic/style/format/RI/CI/policy and reviewer receipts are retained privately and
linked in the dated issue/PR outcome.

### I6 initial independent implementation review

Reviewer `/root/review_lcp_implementation`, separate non-author, inspected the
frozen prepared source and retained receipts. Verbatim outcome:

> **Request corrections; remote execution is not yet cleared.**
>
> Reviewed base `82c6236458c9316feebe8a54facaabde3c8b0ba5`, prepared tree `ad0c9e9dca16a84c49870e88f8affb27fcc3f469`, diff SHA256 `150cbb362aa063ee219d4b7519018a0ea38edc5ee8aa9ba591647f8a9de3921a`. All18 source and seven evidence hashes match.
>
> - **F11 — Medium, AC12; `tools/quality/lcp-remote.cjs`, `unseal()`.** Authentication-tag length is unrestricted. On the pinned Node24.19.0, truncating the generated16-byte tag to4,8,12 or15 bytes still permits decryption. Require exactly16-byte tags and12-byte IVs, set `authTagLength:16`, and add truncation negatives. This prevents an envelope from downgrading the intended authentication strength.
> - **F12 — Medium, AC12; `admitSDK()`.** `vm.Script` validates classic-script grammar, while the frozen integration loads the SDK as a module. I reproduced rejection of a valid200 JavaScript module containing `export {};`. Use bounded module-grammar validation without execution. Test valid module acceptance, invalid syntax rejection and absence of Node-side effects.
> - **F13 — Medium, AC12; `.github/workflows/home-lcp-remote.yml`, evidence-retention conditions.** Seal/upload explicitly exclude an observation outcome of `cancelled`, discarding already-written evidence from interrupted attempts. Retain available interrupted output through the encrypted-only path, allocate cleanup time within the job deadline, and document unavoidable runner-loss/force-termination limits.
>
> Otherwise, the narrowed implementation matches current AC12. The fixed workflow gates, explicit head checkout, read-only permissions, existing-workflow freeze, pinned archive admission, redirected raw logs and exact encrypted upload path are appropriate. The CORS change preserves captured policy and exact SDK body bytes; its expanded handler test passes. Generic beacon presence remains explicitly insufficient for CWV admission.
>
> Independent verification passed all34 Node fixtures, RI freshness,15 coupling checks and whitespace validation. The public recipient fingerprint matches configuration and the bound round-trip receipt. I did not read private PEM contents.
>
> No additional blocking finding emerged. Native platforms, production transport, actual SDK/payload evidence and historical cause remain unresolved. Correction re-review is required before the one remote attempt. No source edits or provider/browser probes were performed.

### I6 correction checkpoint

F11 now fixes AES-GCM authentication at16-byte tags and12-byte IVs; altered or
truncated lengths are rejected before authenticated plaintext can be returned.
F12 uses a bounded `node --check --input-type=module` subprocess, never evaluation;
a valid module containing an import, file-writing side effect and `export {}`
is accepted without creating its marker, while invalid module syntax is rejected.
F13 includes cancelled observations with an existing raw directory, a12-minute
observation bound within the18-minute job, explicit unknown-cleanup metadata,
and encrypted-only upload conditional on successful sealing. A partial cancelled
fixture survives authenticated packaging and recovery. Force termination, job
deadline or runner loss can still prevent final retention; absence is not clean
completion. Prepared Node37/37 passes. These corrections await independent
re-review; remote execution remains unperformed.

### I6 correction independent review

Same separate reviewer, verbatim outcome:

> **I6 correction approved; no remaining blocking findings.**
>
> Reviewed base `82c6236458c9316feebe8a54facaabde3c8b0ba5`, prepared tree `f43448bada69016901dd3f6a8ca9aa173aacac17`, diff SHA256 `36a6ea9013fab2b15da540490d1dd1c2bf0ce92dc2bce9c8bcb8050bc74cad7f`. All18 source and eight evidence hashes match.
>
> - **F11 resolved:** encryption/decryption fixes authentication at16-byte tags and12-byte IVs. Truncated, extended and malformed lengths are rejected.
> - **F12 resolved:** bounded module syntax checking accepts imports/exports without evaluating vendor code. The side-effect fixture leaves its marker absent; invalid syntax is rejected.
> - **F13 resolved as documented best-effort retention:** cancelled observations enter sealing, partial rows survive authenticated recovery, cleanup remains explicitly unknown, and upload requires successful encryption. Force termination, job deadline and runner loss remain stated retention limits.
>
> I independently ran all37 Node fixtures successfully, verified RI freshness,15 coupling checks and whitespace validation. The prepared policy receipt correctly reports8/8 automated checks against dirty, diff-bound source and leaves closure false. Unaffected initial I6 review scope is retained.
>
> **The source/privacy scope is cleared for one authorized remote attempt after publication and final-head verification.** AC12 remains pending actual acquisition/replay or blockage evidence, private decryption and independent interpretation. Native platforms, production transport, genuine CWV attribution and historical cause remain separate unresolved gates.
>
> No files were modified, private PEM contents read, or provider/browser probes performed.
