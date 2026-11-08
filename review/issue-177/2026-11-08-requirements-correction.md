# Issue 177 — Requirements & Acceptance correction re-review

2026-11-08; role `/root/issue177_requirements`; continuation, not a fresh independent first judgment. Prior preflight and final reports are preserved. This phase received targeted correction descriptions and a factual browser-blocker report; I inspected changed sources directly and did not read current peer artifacts. The source report's later reconciliation paragraph describes the browser blocker; this exposure is subsequent to my first judgment, not initial-isolation evidence.

**Verdict: F1 resolved in the corrected source/design allocation; no remaining Requirements defect found in the bounded analytics correction. Browser readiness, full AC acceptance and workflow advancement remain blocked/pending.** A source review does not supply the unavailable browser/provider result. Preserve all original AC01–AC09 and stop/report boundaries.

## Inspected identity

Corrected prepared manifest `/tmp/issue177-corrected-manifest.json` SHA-256 independently verified as `64a009193b21487cb31cb4cfcf961dce8efbfe7754f458b9c4c47d6c96c13e41`; every referenced file digest matched at inspection. This remains prepared staged/dirty material based on `fdfc8cb67a6f78996932d9688c563c53c21387f2`, not a clean final commit or deployed source. Owner/common/role identities and meaning are unchanged from the prior reports. Provider context internals remain unknown.

Changed owner identities inspected:

| Owner | SHA-256 |
| --- | --- |
| `tools/site/build.cjs` | `ee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee` |
| `tests/site-articles.test.cjs` | `7b885d9f24a25fe350272caff32fd4942421fa4f7a3fa69db4c84f9b172608d4` |
| `tests/test_issue177_acceptance.py` | `b35d84d08a03f7de8e74cc1ef508daaf2f9dd05cc4705a7d62430134a1dd5282` |
| `guides/SITE-ANALYTICS.md` | `933f477f33bdeccb54f351a4303b9c0feaf967867b91fc9965dc4d570972ebb2` |

## Correction assessment

- **F1 / R2, AC01/AC02/AC07:** `analyticsURLs(config, c)` is now one finite projection used by both existing analytics component fingerprints and actual compilation. A public route-set change therefore invalidates the ordinary platform baseline before content-only code attempts to read the newly named loader. The extra per-document measurement argument/hash is removed; existing component propagation supplies principal/article version identity. The guide and review reconciliation explicitly classify public admission/removal/slug changes as full-generation work, while unchanged admitted paths retain the ordinary content lane. This is a coherent disposition within the existing publication architecture.
- **Meaningful negative coverage:** the integrated public-admission/removal test invokes `build({contentOnly:true})` at both transitions and expects the existing verified-platform-baseline refusal, then checks full-generation cold/incremental parity, actual loader admission/refusal and unchanged engine bytes. This exercises the failure boundary identified in F1 rather than merely checking documentation. The lower-level builder error is the correct oracle for that invocation. I inspected these tests; I did not execute them in this phase.
- **Wrapper correction, AC07:** the native runner's `executePlan()` returns the supplied plan at `source-tests.cjs:641`; it does not normalize that explicit list to sorted order. Comparing `report.modules` to the submitted module list is correct. Exact membership, nonzero total, passed=total and zero failed/cancelled/skipped/todo accounting remain enforced. The correction does not weaken the behavioral suites or redefine their pass condition.
- **R1 and R3 unchanged:** the case-specific SDK/pageview evidence limits and issue policy remain intact. `.github/acceptance/issue-177.json` stays SHA-256 `d46a129e3eccca6125758a72a588e8064334e200a309415be5adac7c9f6caf18`; it preserves distinct browser/live/release/report/Medium gates. Reused evidence is limited to unchanged public/catalog validation, origin/SDK/QA boundaries and the prior policy/intent mapping.

## AC mapping and remaining gates

| AC / intent | Correction outcome | Remaining evidence |
| --- | --- | --- |
| AC01 audited ownership/test impact | F1 content/full-generation allocation resolved | Final exact-source check receipts and honest Draft handoff |
| AC02 public article admission/identity | Source and test oracles match original bounded requirement | Actual generated-article browser navigation/SDK checks; SDK-generated pageview semantics and provider receipt |
| AC03 bounded isolation | Adapter/helper unchanged; publication boundary remains finite | Applicable actual browser/isolation observation; no universal QA claim |
| AC07 checks/review/style/release | Wrapper oracle corrected; source classification uses existing owner | Corrected-candidate native/Basic/style/RI/policy results, affected Code/QA re-review; browser and later owner-controlled release gates |
| AC04–06, AC08–09 | Original obligations preserved | SEO/discovery/search/reporting and post-production owner Medium action remain pending/outside this checkpoint |

No implementation, test or external-service writes were made by this reviewer; only this assigned artifact was written. No new test campaign or browser attempt was performed in this phase. The supplied/report-recorded Chromium socket denial and automatic escalation rejection must remain BLOCKED / NOT OBSERVED; this review neither independently repeats nor converts them into a pass or N/A. Final corrected-source execution identity and all required role receipts remain the orchestrator's gate. Once those observations are reported, stop for the maintainer at the authorized analytics checkpoint; no staging promotion, merge, deployment or whole-issue closure follows from this verdict.
