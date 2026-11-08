# Issue177 CI candidate — independent White-box QA first judgment

Date: 2026-11-08. Role: distinct nonauthor White-box QA. Verdict: **no blocking finding in the inspected test update; actual browser evidence remains pending**. This does not complete any whole issue177 AC, authorize release, or establish provider pageviews/collector receipt.

## Identity and limits

Repository `/workspace/scratch/538c6c66c100/repo`; observed HEAD/base `8371746dce7eeda64c8662a21bc82c25bf772d2d`. Candidate is staged/dirty, not a clean checkout. Packet `/tmp/issue177-ci-candidate.json` SHA256 `5f9e1d4d47fc10ad44d980ecf9e21afb93d8f568e7acca60bdc0344cecfc00da`; independently recomputed every manifest entry and found zero mismatches. Intent SHA256 `b5bb8a23ffa8f57c5700e8550548db1cff84441a5a20880851cc9c9ad02ba15a`.

Common prompt SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role prompt `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`. Inspected AGENTS, CONTRIBUTING, README, common/role prompts, MEMORY as dated handoff, repository map, acceptance issue177, relevant style/site/check-profile contracts, actual analytics producer and full/staging consumers, fixtures, changed refusal tests, registry selection and workflow. No applicable nested AGENTS found in tools/tests/agents/.github. Did not read current peer reports or author review notes; no implementation, external writes, delegation or browser retry. Requested/accepted launch parameters and provider model/context internals are not visible from this role; orchestrator must retain their actual receipt separately.

Inspected source SHA256:

- `tools/quality/analytics-browser.cjs`: `51a9ba1cc17ce468acad62c2cfbe216b01cb47ca0049887d3748b005c88c133b`
- `tests/quality.test.cjs`: `d8993c68f25f38ac63526b77360204261f16a1499fa204c6d6ceb84dd022f224`
- `tests/staging-regression.test.cjs`: `51535cf872bd9ceb6f057ee9013efb42ce4b08e4be2f65315e659258fe448ca1`
- Remaining scoped bytes are bound by the verified packet manifest. Live GitHub refs/state were not independently fetched in this bounded role.

## Risk and oracle matrix

| AC/risk | Structural fault and scenario | Independent oracle | Existing check / disposition |
| --- | --- | --- | --- |
| AC01/02 finite admission | Missing article, wrong route/title, arbitrary alias serving | Public catalog has exactly `sdlc-out-of-balance:en`, route `articles/the-sdlc-is-out-of-balance.html`, declared title; alias strips exactly `.html` | Producer source inspected; finite alias mapping uses that catalog; existing analytics/source suites retained |
| AC02 document lifecycle | Extra SDK on reload or history, absent direct-entry SDK | Canonical document count1; its reload cumulative2; fresh extensionless document count1; Writing/internal/Back/Forward remain1; every document has one element and one executed stub load | Seven observed phases in enabled Writing row; existing full/staging browser selectors both include Writing |
| AC02 evidence completeness | Missing, forged, fractional, duplicate or extra observations | Exact seven phase records per declared public article, exact keys/title/counts and shape | Full and staging consumers both invoke strict shared `validateEntryForms`; executed affected suites and independent bounded fault probe below |
| AC03 isolation/regression | Test journey accidentally sends traffic or weakens refusal cases | Only stubbed SDK, project fixture resources, no unexpected HTTP; actual local-sink isolation remains separate | Routing/error/request invariants retained; blocked/delayed/staging/offline cases and existing isolation contrast unchanged |
| AC07 selection/budgets | New rows, skipped article evidence, relaxed deadlines or source omissions | Existing matrix/cases/budgets preserved; affected report suites included in issue177 source adapter | Registry/profile/workflow inspected; no browser-row or budget changes; actual duration inside hosted budgets not measured here |
| AC08 truthfulness | SDK counters represented as telemetry receipt | Stub requests/DOM loads prove only adapter admission/lifecycle | Explicit model remains vendor-stubbed; live telemetry still unobserved |

Counter resets occur only after the previous enabled document reaches loaded status. After the article journey the producer explicitly loads a fresh Writing document and resets its count, preserving the pre-existing persistent-shell and final reload assertions. The article loop uses all catalog local articles and enforces a nonempty finite maximum50 through the expected-evidence guard. Current catalog has one article; maximum-catalog browser duration is not measured. The alias fallback maps only declared extensionless article names, while unknown names retain ordinary404 handling. No new wildcard adapter admission was introduced.

## Executed checks

1. Command: `SITE_MEDIA_PYTHON="$(command -v python3)" node --test tests/quality.test.cjs tests/staging-regression.test.cjs tests/staging-gate.test.cjs`.
   Observed exit0; **54 tests, 54 pass, 0 fail/cancelled/skipped/todo**, reported duration4594.562019ms. Raw tool output included every completed test and final Node accounting. Relevant completed cases include complete-source-bound PR refusals, selected-browser analytics refusals, staging selector ownership, and production/staging gate separation. This is native validator/fixture execution, not browser execution.
2. Independent inline Node probe constructed expected evidence from actual public catalog records and a separately spelled seven-phase/count oracle, rather than calling `expectedArticleEntries()` to generate the accepted fixture. Positive row accepted. Nine individual mutations each raised the validator assertion: missing article evidence; missing observation; extra observation; fractional SDK count0.5; internal extra SDK count2; wrong article key; wrong title; duplicate article; unexpected observation property. Result: **1 positive accepted, 9 negatives rejected**, exit0. This directly exercises the shared assertion consumed by both full and staging report paths; existing suites exercise those integration paths.
3. Independently recomputed packet digest and all referenced file hashes: **zero mismatches**. Observed public catalog matches the article key/route/title above.

No failed test campaign occurred. One exploratory read used a nonexistent guessed `site/content/articles.json`; it returned an absent-path diagnostic, after which the canonical catalog API supplied the authoritative records. No candidate edit or test retry followed that read.

## Planned versus observed

Executed: bounded native report suites, strict negative probes, source/selection/budget inspection and byte verification. No measured branch-coverage percentage claimed.

Pending: actual compiled article browser canonical, reload, extensionless, internal and Back/Forward execution on CI; actual denied-origin/offline/QA isolation browser behavior; exact PR preview verification; hosted duration and cleanup observations. Local Chromium was not retried per assigned capability bounds. Actual CI must retain source-bound complete accounting; a planned or skipped run is not success. AC01/02/03/07 have useful bounded source/native evidence; their review/browser/live obligations remain open. AC04/05/06/08/09 and release/provider/owner decisions remain outside this checkpoint and uncompleted.
