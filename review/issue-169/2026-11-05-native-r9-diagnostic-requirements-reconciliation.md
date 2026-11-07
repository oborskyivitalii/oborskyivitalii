# R9 diagnostic — requirements reconciliation before dispatch

Refs #169 / PR170. Independent Requirements & Acceptance continuation, 5 November 2026. **No blocking requirements finding remains in the inspected diagnostic wiring. Proceed to the planned coherent commit and one bounded diagnostic execution.** This is implementation-to-requirement reconciliation; it supplies no actual browser, runtime-family, hosted, staging or release acceptance, and requires no additional author decision.

Inspected checkout HEAD `fb5b68e35d5f4787e2f92625ec9d34440736bc29`, tree `730109cb6914433dfb94fd0ce4e95451dc714125`, plus the uncommitted workflow/script/doc/test changes pinned below. These files are not yet a coherent committed candidate. The future run must test its new commit, not relabel observations as an execution of fb5. The original preflight remains in `2026-11-05-native-r9-diagnostic-requirements-preflight.md`. No current peer result was read; author-supplied check summaries are not counted as my execution.

| Preflight requirement / AC | Actual implemented treatment | Result before execution |
| --- | --- | --- |
| Exact coherent source; AC05/11 | Workflow requires40hex input, `GITHUB_SHA == input == checkout HEAD` and clean worktree. Script checks clean manifest/source HEAD/tree/candidate and verifies public bytes before/after. Script/workflow/input identities, browser receipt and lock digests are retained. | Implemented; actual run/source binding remains to observe. |
| Real normal-motion footer; AC05/08/10 | Native capture listens for start/end/cancel. Footer oracle requires one actual anchor `.scroll-continue`, `routeLayer:self`, positive CSS keyframe duration, same-node/name end with positive elapsed time and no cancel. Both departure/arrival block phases must complete by `animationend`; reduced/off motion fails. No synthetic completion or family mutation exists in this script. | Matches preflight; actual animation evidence remains to observe. |
| Finite reader/navigation matrix; AC07/08/09/10 |28 planned cases across4 normal/no-JS width contexts;16 normal route legs, two full loops per width, real history Back and scroll/focus/URL restoration. Five image order/alt/caption/decoded geometry/served hashes, exact title, PDF digest/content type, local links, related reading and no-JS native links are checked. | Implemented. Geometry/screenshots are bounded inspection evidence, not full human readability or physical-device acceptance. PDF byte identity reuses prior known5page PDF; no new visual PDF claim. |
| Pinned limited execution; AC05/11 | Ubuntu24.04, Node24.19.0, Python3.12.14, locked quality/publisher dependencies, existing exact media requirement, existing authenticated Chromium archive; script rejects executable override and checks actual browser revision. Read-only permissions and10-minute job cap preserved; script has240-second watchdog and finite per-action waits. | Implemented; actual setup/environment/receipt success remains to observe. |
| Honest failures and retained evidence; AC05/11 | Every case begins `not-observed`; running/fail/unobserved rows prevent aggregate pass. Per-case/context failures retain screenshots, JSON and trace evidence; deadline saves a failing report. Console/page errors and noncollector request failures fail. Evidence errors fail. Workflow always uploads run/attempt-specific reports and errors on missing files. | Implemented. Setup failure before report creation remains a failed job/missing evidence, never diagnostic success. |
| Diagnostic nonadmission / full platform route; AC04/05/11 | Raw base/Color construction uses existing structural artifact code; no runtime-family selector/guard change. Every report has `fullGate:false`, unknown runtime expressly unadmitted, loopback-only target and no hosted/performance/release claim. External sources are not fetched; existing analytics collector isolation is explicit. | Implemented. A green diagnostic cannot substitute for any admission check or required review. |
| Existing manual route replacement | Browser supply guide explicitly records intentional WindowsFirefox→UbuntuChromium diagnostic replacement and preserves historical meaning/required native-platform matrices; maintained consumer map and negative cases follow current declared selection. | Scope/documentation aligned. |

Actual independent bounded checks: `node --check review/issue-169/r9/reader-runtime-probe.cjs` exited0; `python3 -m unittest discover -s tests -p 'test_browser_archives.py'` passed **12/12**. Direct `git diff --name-only fb5... -- site tools/quality/color-motion-contract.cjs tools/staging/color.cjs tools/site/runtime-compatibility.cjs` returned no paths: product/runtime/family/rights/content owners remain unchanged in this wiring iteration. These checks are static/supplier wiring evidence and do not constitute browser execution.

The inspected script SHA256 is `14476427fb4939375a84b67bd851520443cd647217b0593f229f0ec9f0900517`. Its read-only event instrumentation and existing article-flight diagnostic hooks observe behavior; the footer native event oracle is separate from telemetry. The script does not make its authored QA cases their own independent review: this role evaluates requirement/oracle linkage; Code and applicable QA ownership/results remain separately required.

Next gate: commit/package the coherent reviewed wiring, verify unchanged relevant source hashes, dispatch that exact new commit, and inspect original run/attempt/raw JSON/events/screenshots/traces. Preserve any failure and diagnose it before rerun. The unknown runtime admission failure remains unresolved until independent actual runtime review and the existing guarded family route are completed. Browser findings may require correction/review; no whole issue AC is closed here.

## Inspected SHA256 manifest

```json
{
  ".github/workflows/site-navigation-probe.yml": "1e2aaeef31c626e70e10cacca304e10171cc6e4bde5a71a4cdbd9f115bfaa19d",
  "guides/BROWSER-ARCHIVES.md": "73635af3faacd7919bc6a2dab7a78e34f68a96c9b180e7a9cfab7f61e2444d20",
  "review/issue-169/r9/reader-runtime-probe.cjs": "14476427fb4939375a84b67bd851520443cd647217b0593f229f0ec9f0900517",
  "site/engine/scroll-entry.cjs": "268ed2aed873105d229f54b146f34b5f1fd3c40cad8d83759cc0aa1635619b4d",
  "site/engine/scroll-entry.css": "5a08c6aa17ef01f398663c428d2c89ea2aefa98956bd4a13806a9702f0dbe915",
  "tests/test_browser_archives.py": "977e30a4f7d268a64d0e28cbdabe3a435af24db2e3458f7d39cd71757b4016f5",
  "tools/quality/analytics-isolation.cjs": "b486ec0938d0e5fb9219a6b9905f92c830a1b0eb8497aab228542fafbfb24b47",
  "tools/quality/article-browser.cjs": "b52c67fca8ce592531d1574b5886b95d2dd95f614b460bcecf460c229f36b05c",
  "tools/quality/artifact.cjs": "3dab8113e50df470c14a7f0e59d9a6ecae8b13ef799a8383b43538be37f9fc29",
  "tools/quality/color-motion-contract.cjs": "592b143d2b5b1c1c9309ef21e0ec075e3633eef28c9e09d497b0c621f3928cdc",
  "tools/staging/color.cjs": "a48869d6f68c51fd92994ad12fe7161b13435f6fe05721f3a119f4e6149a7c69"
}
```

## Affected identity/environment delta — 5 November 2026

Read back current script SHA256 `3c676a232d326af94ad33461fe5b4f138395df972d0132acf99438ca95c2df2a`, superseding the pretrigger `144764...` script above; neither is claimed executed in a browser. **No new requirements blocker.** The strengthened checks are within the accepted diagnostic scope and preserve the same28 cases,4 contexts,240-second script limit,10-minute workflow cap and nonadmission boundary.

Actual normal and no-JS page paths now call `contextMetadata`, retaining actual viewport/height, positive DPR, reduced-motion preference, theme attributes/media preferences and computed colors. This reports observed theme/scale without claiming a second theme or physical mobile device. Both paths assert their intended viewport and normal-motion media preference.

The script now explicitly checks clean actual Git state before and after observation, requires `GITHUB_WORKFLOW_SHA == GITHUB_SHA == SITE_CANDIDATE_SHA == checkout HEAD`, verifies repository/workflow ref path, hashes the workflow file against its exact committed Git blob, and verifies final HEAD/workflow bytes. Source identity is therefore not inferred only from a prebuilt manifest. These fail-closed additions directly address the coherent-harness preflight requirement; runtime/hosted/release permission is unaffected.

Readback confirmed unchanged workflow/doc/consumer-test hashes from the earlier inspected manifest. `node --check` passed for the new script. A fresh product/runtime/family/rights/content path diff against fb5 still returns no changed paths. Earlier12/12 browser-supply tests remain applicable because their test/workflow/doc bytes are unchanged; they were not needlessly rerun. No peer report was inspected. The next gate remains the new coherent commit and actual source-bound diagnostic run with retained original raw observations.
