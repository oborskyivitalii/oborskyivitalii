# Native R9 browser diagnostic — requirements preflight

Refs #169 / PR170. Independent Requirements & Acceptance continuation, 5 November 2026. Source observed: clean local HEAD `fb5b68e35d5f4787e2f92625ec9d34440736bc29`, tree `730109cb6914433dfb94fd0ce4e95451dc714125`; base `8cf15883125892710633b17133d9ee0fc4b23b92`. No peer current output was inspected. The supplied preview42064129837/build127373717426 failure is input evidence, not an independently fetched log observation here.

**Verdict: proceed with bounded diagnostic wiring under the clarified plan below; no unresolved requirements blocker remains in that plan. The diagnostic supplies no runtime-family, hosted, staging or production acceptance.** No additional author decision is needed. This is preimplementation review of a proposed diagnostic, not acceptance of its unwritten code or future results.

## Required treatments

1. **High — avoid a harness/candidate identity contradiction.** Existing `.github/workflows/site-navigation-probe.yml` checks out `inputs.candidate_sha`. A newly added `review/issue-169/r9` diagnostic script will not exist at old commitfb5b68e. Either dispatch the new coherent commit and label that exact commit/tree as tested, retaining evidence that relevant article/runtime bytes equal fb5; or use separately pinned harness and candidate checkouts and record both commits/trees plus script/workflow hashes. Never silently copy mutable harness code into a candidate and call the candidate clean. Validate full40hex input, resolve actual checkout HEAD/tree, reject mismatch/dirty inputs and record original workflow run/attempt, dependency locks, browser archive receipt/version, public inventory/runtime fingerprint and input digest. The existing workflow's dispatch-ref identity and checked-out identity are different fields.
2. **Medium — make the failure oracle stronger than eventual route completion.** Runtime `scroll-entry.cjs:700` makes `.scroll-continue` own its box; CSS selects `data-route-layer=self`, and `animationend` processing clears pending units. A later watchdog can settle a route without the missing footer animation. Observe browser-delivered `animationstart`/`animationend`/`animationcancel` with animation name, actual target/pseudo-element, timestamps, target attributes and route/action correlation. For relevant footer departures require `route-block-depart` on the actual `.scroll-continue[data-route-layer=self]` box and a real matching end; collect corresponding arrival events when that unit participates. Reject a route that only reaches URL/aria-busy settlement by timeout. Do not synthesize events, monkeypatch completion, force reduced/off motion, inject replacement CSS or otherwise repair behavior from the test. Existing telemetry may support the observation but cannot substitute for CSS events.
3. **Medium — retain explicit case and time bounds.** Current manual probe is Windows2025/Firefox with10-minute job timeout, not Ubuntu/Chromium. Make the R9 Ubuntu24.04/Chromium diagnostic selection explicit; preserve the existing manual route or document and review its intentional replacement and affected browser-supply/RI/check mapping. Keep read-only permissions and pinned actions/Node/browser supply. Use locked quality/publisher packages and the existing pinned media requirement/venv owner; there is no separate `tools/site/media-toolchain` package. Keep the10-minute workflow cap, set an explicit script deadline no greater than300000ms, bounded per-action waits, finite media/route inventories and no unbounded retry loop. Retain failed attempts and diagnose before any replay.

## Minimum observation matrix and independent oracles

| AC/risk | Bounded action | Required observable result |
| --- | --- | --- |
| AC07/08/09 native R9 | Chromium JS reading at1440 and390 widths; record height/theme/scale/motion state | Exact R9 identity/title, hero + four figures in order, exact captions/alt; actually loaded images (`complete`, positive natural dimensions), no material clipping/horizontal overflow in inspected reader/media, source references and author apparatus. Capture screenshots at each figure/reader end and raw geometry; do not infer readability from dimensions alone. |
| AC05/08/10 repeated navigation | At each JS width repeat Writing→R9 article→browser Back→Writing footer Next→browser Back twice, with bounded actual actions | Route/body/article identity, visible settled content and restored Writing state/scroll; determine footer Next destination from source/DOM rather than guessing. Record all16 route legs across two widths and correlate normal-motion CSS events, including the repeated footer self-box departure. Screenshot failures and retain console/page errors/network failures. “Back” means actual history traversal, not navigation to a fresh URL. |
| AC08/09/10 fallback | JS-disabled fresh context at both widths, read article/media/PDF and follow native navigation links | Complete five-visual text/caption/material/reference content remains available without JS; links resolve to the same source-bound local public input. Do not require JS animation/history-controller behavior in these rows. Preserve any related-reading observation as its own fact; no generic no-JS pass from a page load alone. |
| AC09 exact PDF | Fetch the declared public PDF link from the tested article | HTTP success/content type and exact accepted PDF SHA256 `75e052d6a5c386ae79cb1a51d59cdf42e53d3a7279bf0db31c227ee145bb18b4`; existing known5page/17destination export evidence is not a new visual PDF observation. Record any actual PDF inspection separately. |
| AC05/11 identity/nonadmission | Build exact raw base/Color diagnostic input with existing structural byte/snapshot checks; serve only its declared loopback directory | Record candidate/tree, producer and public/artifact/runtime hashes; every report `fullGate:false`, diagnostic/local origin, no hosted/staging/pass claim. Preserve unknown runtime refusal in release/package path. No family registry change, waiver, guard/rights mutation or selection fallback is allowed. Successful local observations may inform later independent runtime review; they cannot admit that family. |

Use only the owned local public input; block or explicitly isolate analytics and do not crawl third-party research/platform links. Report blocked network/resource observations rather than ignoring arbitrary console failures. All cases must appear with passed/failed/blocked/not-observed states, including partial results after an exception. Upload raw JSON/events, source/input identity, screenshots and console/error records with `always()` on failure; artifact upload alone is not successful execution. Pin time/result/record limits so a killed or missing report cannot become a green diagnostic.

## Acceptance boundary and next gate

The proposal creates evidence for AC05/07/08/09/10/11 investigation while preserving existing source, runtime review, hosted, staging and production obligations. A workflow/job green state proves only its explicit diagnostic assertions. Linux Chromium1440/390 is emulated desktop/mobile viewport evidence; it does not establish Firefox, Safari, physical devices, live hosting/TLS/CSP, full performance or complete release health.

After implementation, independently review the actual workflow/script and any test oracles, then run the exact source-bound diagnostic and inspect its raw results. Only observed event/content evidence can support the next runtime-family correction/review. Preserve the current failing preview and original limits. A failure with retained traces is useful diagnosis, not a reason to weaken an assertion. Original author release authorization remains valid; actual release gates remain pending.

## Inspected source hashes

```json
{
  ".github/actions/browser-archive/action.yml": "c8654276397cdb7d6396a33e8dd2fade5c3d838690c39b38346d1e76dd68703e",
  ".github/workflows/site-navigation-probe.yml": "5dd9dcf9b2eb1c707601d99f7ed7eed049741e7bb0d5749fc7a1a07b0d814f7e",
  "site/engine/scroll-entry.cjs": "268ed2aed873105d229f54b146f34b5f1fd3c40cad8d83759cc0aa1635619b4d",
  "site/engine/scroll-entry.css": "5a08c6aa17ef01f398663c428d2c89ea2aefa98956bd4a13806a9702f0dbe915",
  "site/publications/sdlc-out-of-balance/manuscript.en.md": "ccaddfe2c40c6a8ba5f4bd75abd4a3c762e94fcbb15997e5e5014e1d6f8fa654",
  "tools/quality/article-browser.cjs": "b52c67fca8ce592531d1574b5886b95d2dd95f614b460bcecf460c229f36b05c",
  "tools/quality/artifact.cjs": "3dab8113e50df470c14a7f0e59d9a6ecae8b13ef799a8383b43538be37f9fc29",
  "tools/quality/color-motion-contract.cjs": "592b143d2b5b1c1c9309ef21e0ec075e3633eef28c9e09d497b0c621f3928cdc",
  "tools/quality/navigation.cjs": "3d7fda5680822f5d0d890b8e115d09506719229417630d0f990eaedbdc665bab",
  "tools/staging/color.cjs": "a48869d6f68c51fd92994ad12fe7161b13435f6fe05721f3a119f4e6149a7c69"
}
```

## Clarified wiring disposition before implementation

The orchestrator selected a **new coherent diagnostic head**, containing both the diagnostic harness and unchanged product source in one checkout. Dispatch that new immutable commit, require `GITHUB_SHA == inputs.candidate_sha == actual checkout HEAD`, record its actual tree and fail on dirty source. This satisfies treatment1 for the implementation plan; actual code/execution must still demonstrate it. The result must name the new head as tested. An explicit byte comparison may show which runtime/publication inputs are unchanged from fb5, without relabelling a new-head run as an fb5 execution.

The stated workflow plan is one explicit manual diagnostic path, Ubuntu24.04, Node24.19.0, Python3.12.14, exact lock-based quality/publisher `npm ci --ignore-scripts`, the existing exact media Pillow requirement in its venv, pinned Chromium from the existing archive action, unchanged `contents:read`/`actions:read` permissions and10-minute job limit. Always upload the exact report and retained failure evidence. Update the workflow/browser-consumer description to reflect its intentional WindowsFirefox→UbuntuChromium diagnostic replacement; this does not change any required native/browser release matrix. Product source/runtime, family registry and release/rights guards remain unchanged.

The orchestrator also explicitly adopted actual self-box CSS `animationstart` **and** `animationend`, rejecting timeout-only settlement. These clarified decisions satisfy the material preflight concerns. The source-bound implementation review must verify the finite matrix, normal-motion event correlation, deadline, zero missing rows, report/upload failure behavior and nonadmission labels before interpreting an execution. This is requirements concurrence within existing authorization, not release approval or an implementation/test pass.
