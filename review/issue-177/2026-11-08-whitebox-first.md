# White-box QA — first independent judgment, issue177

Verdict: **No blocking source or test defect found in the inspected analytics checkpoint.** The bounded source checks pass. This verdict does not satisfy the pending actual browser, vendor pageview, collector receipt or release gates.

## Identity and boundaries

- Role: distinct nonauthor White-box QA, task `/root/issue177_whitebox`; no implementation, external writes or delegation.
- Repository HEAD/base: `fdfc8cb67a6f78996932d9688c563c53c21387f2`. Prepared staged/dirty candidate, not a clean commit checkout. No live GitHub/ref or production revalidation was performed by this reviewer.
- Packet manifest `/tmp/issue177-candidate-manifest.json`: SHA256 `193107691ad6dd16759636ad9bb56d1af1ac52e9fa70e168da53a6c45bdfa9b6`. All 62 entries matched actual bytes before and after checks.
- Diff `/tmp/issue177-candidate.diff`: SHA256 `f07173dc698f524b856e3fac597e527d734898dec1ea2e905b0428ff31f5c01e` verified. Relevant actual HEAD diff independently inspected for build, article tests, analytics contract and acceptance/registry mapping.
- Common prompt `agents/reviewers/README.md`: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- Role prompt `agents/reviewers/white-box-qa.md`: `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`.
- Accepted intent: `/tmp/issue177-owner.md`, SHA256 `e0b6a6dffbe432e14cf5313f1c0f7ad39e04f398fa9d2a552339f6dcf7769f6c`: section B article analytics, preserve isolation, stop/report. Theme withdrawn. SEO, promotion, merge and deployment outside checkpoint.
- Read root AGENTS/CONTRIBUTING, reviewer contracts, README, relevant repository-map navigation, MEMORY as dated handoff only, site/README analytics/build contract, SITE-ANALYTICS, relevant SITE-CHECK-PROFILES and ACCEPTANCE. No nested AGENTS exists. Did not inspect current peer output files or the issue177 source/requirements review artifacts. An initial unbounded diff request yielded heavily truncated output; the visible review was narrowed to source/test owners and did not expose peer verdict text. MEMORY contains author progress claims; these were not used as test evidence.
- Requested launch isolation is the orchestrator's receipt responsibility. Provider model/context internals are unavailable to this reviewer; no independent provider attestation is claimed.

## Independent expected behavior and structural allocation

The accepted contract admits exactly catalog-published accepted native articles, including declared extensionless equivalents, on the configured HTTPS origin/project. Accepted metadata without publication membership cannot admit a route. Synthetic collectors stay isolated. Public membership changes must change every document that embeds the shared loader; cached incremental output must equal cold output.

| Risk / AC | Structural fault and scenario | Independent oracle | Check / disposition |
| --- | --- | --- | --- |
| AC01/02 public admission | Wrong producer input: catalog-published accepted canonical and alias with query/fragment | Only validated public catalog membership admits new article SDK | Existing new `site-articles` compiled-producer case; executed; retain permanent suite |
| AC03 candidate/technical leakage | Candidate draft, accepted-but-unlisted, technical reader, unknown article, immutable snapshot or trailing slash admitted | No SDK on routes lacking public membership; catalog technical source rejected upstream | Executed compiled-producer negative partitions plus inspected `articles.select` technical/status guards and `validateLocalCatalog`; retain guards |
| AC02/07 stale cache | Add/remove public article while five principal pages reuse earlier loader; candidate article documents remain stale | All loader-bearing document versions change with loader identity; cold/incremental files equal | Executed new public-admission/removal suite, including candidate document invalidation; `measurement.head` participates in principal/article signatures |
| AC03 origin/project | Alternate origin, protocol, port or project path admitted | Exact canonical HTTPS origin and project path required | Executed unit boundaries, own generated-loader table and in-memory guard faults; existing suite remains owner |
| AC02 SDK duplication | Loader evaluated twice creates two vendor elements | One SDK element per document; `spa:true`; no manual pageview path | Executed VM cases; inspected SDK id guard; pageview receipt remains deferred LIVE/BROWSER |
| AC03 optional vendor failure | SDK blocked or append throws disrupts rendering or retries | Fail-open, bounded work; no timer/history/storage requirement | Executed existing analytics blocked/throw case; no new runtime implementation |
| AC03 QA isolation | Abort setup/abort failure leaks collector or poisons ordinary context | Exact collector predicate, installation before page creation, close failed isolated context; fresh ordinary transport remains possible | Executed preview-smoke unit tests, including failure and ordinary contrasts; retained current isolation owner |
| AC03 offline | Standalone export or inert payload retains tracking | Fifteen exports strip loader/verification; ordinary file URL origin guard suppresses SDK | Executed analytics export/closure cases; browser network receipt not observed |
| AC01/07 content consumers | New loader signature invalidates assumptions in content-only/reconstruction/tag consumers | Baseline platform trust remains exact; current content reconstruction and tag-only changes preserve expected bytes | Executed `article-tags` and `content-baseline` adjacent consumers, inspected build baseline checks; specific public-member addition/removal through `contentOnly:true` is not directly executed |
| AC07 registry/accounting | New test wrapper silently omits failures/skips or is unrouted | Native module selection and complete no-failure/no-skip totals; permanent suites retain routes | Inspected issue177 policy/wrapper and registry; native suites executed directly, wrapper itself not executed here |

## Actual execution

All commands ran from repository root with `SITE_MEDIA_PYTHON="$(command -v python3)"`; fixture writes were outside checkout. No accepted source/tests were changed.

1. `node --test tests/analytics.test.cjs tests/site-articles.test.cjs tests/preview-smoke.test.cjs` — exit 0; **58 tests passed**, failures/cancelled/skipped/todo all 0; native duration 16811.672673ms. Raw stdout/stderr `/tmp/issue177-whitebox-tests.log`.
2. `node --test tests/article-tags.test.cjs tests/content-baseline.test.cjs` — exit 0; **24 tests passed**, failures/cancelled/skipped/todo all 0; native duration 11026.165496ms. Raw `/tmp/issue177-whitebox-consumers.log`.
3. Independent in-memory VM check of actual generated loader `docs/runtime/1c34e64047482a214a50a115582adb08988fe8721f5ee651bd8a231a300e2cf7/analytics.js`: **15 admission/refusal cases passed**, each evaluated twice. Cases included actual article canonical/extensionless/query-fragment, trailing slash, unknown/technical, article/principal snapshots, alternate origin, HTTP/file, alternate port, uppercase and encoded-dot variants. Two in-memory fault injections removing origin/path guards were detected by staging/unknown refusal oracles. Exit 0; `/tmp/issue177-whitebox-loader.log`. No filesystem source mutation.
4. Packet digest plus every entry byte digest checked before/after: 62/62 match, no mismatches.

This is bounded decision/partition and state-transition testing; branch/line coverage was not measured. No test failures occurred in these executions; earlier session failures were not independently examined or rerun.

## Findings and acceptance impact

No blocking findings. One nonblocking coverage limit: `tests/site-articles.test.cjs:304` exercises ordinary cold/incremental public membership transitions; adjacent content-only consumer checks pass, but they do not directly demonstrate addition/removal of a public local article through `contentOnly:true`. Keep that distinction in the test-impact allocation; a focused future content-release case would strengthen the consumer boundary. It does not invalidate the demonstrated ordinary-build correction.

AC01: ownership/admission/test-impact evidence supplied within inspected scope; full original audit/remaining SEO scope not accepted here. AC02: source admission, shared-loader invalidation and one-element semantics pass; actual vendor-generated direct/SPA/history/reload pageview semantics and real receipt remain open. AC03: bounded source/VM isolation/failure/offline checks pass; actual browser/live gates remain open. AC07: this role's source QA is complete on the exact packet; other independent roles, Basic/style/RI checks and release gates remain separate. AC04–06, AC08–09 are outside the implemented checkpoint and remain pending; no whole-criterion checkbox completion is implied.

## Limits and stop condition

No browser, HTTP/current production bytes, Cloudflare SDK execution or collector/provider query was performed. VM SDK insertion count is not a pageview and not delivery/receipt. No claims about exactly-once vendor collection, SEO/indexing, measured readership or post-fix uplift. No broad staging/full production campaign, Basic/style/RI rerun, merge or deployment. Stop/report is preserved.
