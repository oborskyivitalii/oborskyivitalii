# Native R9 exploratory correction — actual pinned CI evidence

Refs #169 / PR170. Reviewer execution: `/root/native_r9_exploratory`, continuation of its own first finding. The reviewer authored the bounded QA observation script and did not author the application correction. This result independently inspects the new raw report, authenticated artifact members, trace and screenshots. No current peer results were read, and no application/QA implementation or additional run was performed during this inspection. Provider model/context internals are unknown.

**Bounded exploratory verdict: pass for the executed native reader/footer charter on `e92de9bb5e3e4bcd80c4207457732808d2d67015`.** The earlier F1 wrong-footer-URL defect is corrected on the tested native path. All 28 planned cases and four contexts completed, including 16 normal-motion route legs, the four actual footer-next departures and their returns/repeats. No new blocking product finding was observed within this charter. This is an explicit diagnostic with `fullGate:false` and runtime admission not evaluated; it is not policy, hosted, staging or production acceptance.

## F1 correction and actual animation evidence

The failed run [42087148352](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/42087148352) and the first diagnosis remain preserved in [the first pinned report](2026-11-05-native-r9-exploratory-pinned-first.md). The corrected run is [42090631531 attempt 1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/42090631531).

The actual footer anchor now has canonical native href `http://127.0.0.1:42435/talks.html`. Its expected destination is independently derived from the actual current page/primary itinerary and checked against the prepared public route alias. All four clicks reach Talks rather than adding a `view` query to Writing. Each records exactly one native `route-block-depart` start and end on the same `A.scroll-continue` element, `data-route-layer=self`, real two-keyframe CSS animation, positive event elapsed duration and no cancellation.

| Width | Cycle | Observed footer node ID | CSS duration | Native end elapsedTime | Observed destination |
| --- | --- | --- | --- | --- | --- |
| 1440 | 1 | 44 | 700 ms | 0.7 s | `/talks.html` |
| 1440 | 2 | 153 | 700 ms | 0.7 s | `/talks.html` |
| 390 | 1 | 38 | 700 ms | 0.7 s | `/talks.html` |
| 390 | 2 | 114 | 700 ms | 0.7 s | `/talks.html` |

Node IDs are local to their fresh context. All 16 normal legs have one actual camera plan/completion with arrived disposition and both departure/arrival block phases completed by `animationend`. No timeout/fallback was accepted. I independently checked those raw arrays and paired native events, rather than relying only on the report's `pass` field.

The mobile trace independently confirms two real footer locator clicks, `call@831` and `call@929`, resolving `<a class="scroll-continue" href="http://127.0.0.1:42435/talks.html">`. Their ensuing Talks settlement checks, `call@835` and `call@931`, have after snapshots at `http://127.0.0.1:42435/talks.html`. Cycle-2 desktop and mobile screenshots visibly show Talks with the active navigation link. This completes the previously unobserved footer-return and second-cycle scope without altering the original timeout or total budget.

## Reader, history and no-JS observations

| Charter scope | New actual result |
| --- | --- |
| Case/context accounting | 28 passed, zero failed, zero unobserved; four fresh normal/no-JS contexts at 1440×900 and 390×844. Elapsed 91,018 ms within the unchanged 240,000 ms bound. |
| Reading and five figures | All four reader observations match the exact accepted H1/native title and five ordered figure IDs, alt text, captions and intrinsic dimensions. I independently compared the observed figure/title fields with the pinned accepted publication metadata SHA256 `ff892d06cb309353d92360be0a47f3454869288f2fc57f29f6443cfadeadd26c`. All images decode and match declared served bytes; figures fit their viewport and no horizontal overflow is reported. |
| Visual inspection | Opened new normal desktop/mobile intro, ending and viewer captures; desktop four explanatory figures; mobile delivery-capacity/asymmetry figures; cycle-2 desktop/mobile Talks destinations and mobile Writing return; no-JS desktop/mobile introductions, mobile ending and native credits destination. Title, captions and controls remain visible without clipping. The normal reader/viewer is dark in this run, while no-JS follows the light system preference. Desktop figure labels and relationships remain clear; mobile compositions/captions are preserved, with small internal labels requiring enlargement. |
| Image viewer | At both normal widths, Enter opens the real modal with focus inside and the exact hero/caption/alt. Escape and button Close restore trigger focus, remove the image clone and close the modal. Screenshots show the expected accessible controls. Actual-size zoom and separate interaction with every diagram viewer were not executed. |
| PDF | All four contexts receive HTTP 200, 549,590 bytes and accepted PDF SHA256 `75e052d6a5c386ae79cb1a51d59cdf42e53d3a7279bf0db31c227ee145bb18b4`. These are the unchanged accepted five-page R9 bytes. This diagnostic serves/verifies the file; it does not newly render all PDF pages or exercise a PDF viewer. |
| Native/reference targets | Both normal inventories contain 19 unique local and 19 external URLs; no-JS contains 15 local and 17 external URLs. Local HTTP status, MIME, manifest hash and HTML fragment checks pass. External source/related URLs are retained and syntactically inspected but not fetched. |
| Related reading | Both normal widths mount exactly the current component's three labelled, nonself recommendations: DOU topics 60177 and 57846 and the Medium Verification Crisis article. These destination pages were not opened remotely. No-JS retains 19 native reference links and five full-size image links; the optional mounted recommendations remain absent. |
| Normal history and repetition | Each width completes two Writing → R9 article → browser Back → footer Talks → browser Back cycles. All eight Back transitions restore the exact activation scroll and focus. Desktop scroll is 7246 px and mobile scroll is 12601 px, each with zero difference; article and footer activators receive their respective expected focus. |
| No-JS native interaction | At both widths, actual Back to Writing, reader-end More writing and footer Reuse & credits clicks load exact Writing/Writing/credits documents with HTTP 200; browser Back after each returns exact R9 alias bytes and article identity with HTTP 200. |
| Errors and retained evidence | All four contexts report zero page errors, console errors or failed requests; no screenshot/trace capture error. All screenshots/traces remain attached to the authenticated results archive. |

The accepted R9 manuscript, semantic identity, five image files and PDF hashes remain unchanged. Their earlier editorial/asset meaning can be reused only at those exact identities. Navigation/runtime source and rebuilt HTML identities changed, so the correction uses this actual new run rather than inheriting the earlier failed runtime result. Normal dark-theme observation here also remains distinct from the earlier run's light-theme observation; this does not establish a full theme matrix.

## Source and artifact identity

- Source/candidate/workflow/GITHUB_SHA/actual HEAD: `e92de9bb5e3e4bcd80c4207457732808d2d67015`; tree `626278d38d4d0592663646ae0eeb0b7b68e3eed3`; sourceDirty=false. Recorded Git status is clean at both start and end.
- Workflow file SHA256 `1e2aaeef31c626e70e10cacca304e10171cc6e4bde5a71a4cdbd9f115bfaa19d`; workflow ref is `oborskyivitalii/oborskyivitalii/.github/workflows/site-navigation-probe.yml@refs/heads/work/issue-169-sdlc-out-of-balance-plan`.
- Observation script SHA256 `80b1d00181ae4cc3fd7ce66346be39170247ca38ffa87a455206668a52e1cb7d`. The native canonical-href oracle correction is described in the first report's subsequent QA-only section; the application correction was authored separately.
- Actual build record `tmp/r9-corrected-results/input-artifact.json` SHA256 `bb0848e08696747d8d3989180f788955033b68ab1e21eb37978a87472547bfe6`, equal to the diagnostic's manifest SHA. Independently compared its complete component record and source/tree/candidate/dirty/artifact fields with the observed report; they agree. Public bytes were verified against this manifest both before and after execution.
- Public artifact digest `6d46344673e8160ac66119fbb13f2057b373a13d901327d9f56a95eaf0e03513`; actual Color fingerprint `9cecac55d9bfe19edb42bbfb2df7edc59bde76598e49e2dc896fd73f376077d5`; base engine `72702f750f37e9cc6678b2d1181da57aa8c121293ebf70c9deae4e7aec568237`; `navigation.js` SHA256 `d2cacfa7c564f5216bcc5b1beaff6131410ee651fd9b5e68f4ef5a5cbf68def0` (120,399 raw bytes).
- Generation output-lock SHA256 `a32dcf8527bab62a5bb673ddd80a761ba00862004d25176ac442a93fb40c6daa`; generation artifact digest `f56c81f249e925152231876b803c9fec4ed81e064c925035fbe81321f62b2768`. R9 content edition remains `sdlc-out-of-balance-en-r9-20261105`, source SHA256 `ccaddfe2c40c6a8ba5f4bd75abd4a3c762e94fcbb15997e5e5014e1d6f8fa654`, semantic SHA256 `c7a14160aa9369d1f359aeb04523e1167c8a189ec5518d378f8de7d27d44da08`.
- Ubuntu runner image `ubuntu24`, image version `20261101.360.1`, Linux x64, Node v24.19.0; actual locked Chromium `153.0.8010.12` and Playwright `1.63.0`. Browser archive key `8cd267fb143e52ba1e1529654b20072ac7c9aaa042145ef7acfcef9ab770aec8`, supply artifact 12643236386, setup receipt SHA256 `48bcd21f8c5aefb62733b5f96e138864866adc81392179805da21999347577c4`. The receipt records no consumer launch before the diagnostic.
- Actual contexts: DPR 1 and reduced-motion=false throughout. Normal has `data-theme=dark`, computed background `rgb(17,28,34)`; no-JS has no theme attribute and light preference/background `rgb(243,241,234)`.

## Evidence receipt and remaining limits

The supplied GitHub results archive is `tmp/r9-corrected-results/run42090631531.zip`, SHA256 `7cc558318464235240b93214dee6c2c25ebdc3e6927727137a1e5b736befed0f`; raw report SHA256 `a33c9fc699d279ac05849c2e46563ada3f61074a6596aee0aa1b8cf9cc0c0481`. Both were independently recomputed. The archive contains 56 PNG and four trace ZIP members; every extracted PNG was byte-compared with its authenticated ZIP member.

Selected independently computed member hashes:

| Evidence | SHA256 |
| --- | --- |
| `normal-390-trace.zip` | `16192fa2582e8d36810b566ab6cda3e1b8c36a1df25252b0ffc0e1d07e4a8766` |
| `normal-390-cycle-2-footer-next.png` | `2f5c74adccaad1927837c7a99bb369a8cca61945db5844607a881eb09f67181b` |
| `normal-1440-cycle-2-footer-next.png` | `fbaec3703c3feccad03097256c86724929ab997d24aed5b82a13c6c4154cd7c5` |

This is real supported pinned Linux Chromium execution against an exact loopback public artifact. It supplies bounded exploratory evidence for the native R9 reader, current footer correction and repeated history path. It supplies no physical-device/human usability observation, Windows/macOS/other-engine result, comprehensive theme/all-route/offline-export matrix, new PDF page visual review, current third-party reachability, performance acceptance or hosted origin/TLS/headers observation. Platform editor/posting remains author-manual.

The report still declares `runtimeAdmission: not evaluated; unknown family remains unadmitted` and `fullGate:false`. Exact-source Basic/RI/issue CI, runtime-family policy/rights admission, hosted smoke, authenticated staging, protected same-tree merge, production archive/admission and actual served production checks remain separate required owners. This correction result resolves F1 for its executed source and native charter; it does not close whole AC05/08/09/10/11 or authorize release by itself. No new mandatory test matrix or pipeline is proposed.
