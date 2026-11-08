# White-box QA — first independent result

Date: 2026-11-08T19:14:08Z. Role/task: distinct nonauthor White-box QA, `/root/stage177_whitebox`. Scope: analytics-only readiness to proceed through stable staging for issue177/PR178; no whole-issue acceptance.

**Verdict: no blocking source defect found in the inspected analytics change. Conditional staging readiness only.** Actual current staging evidence remains running, and promotion is skipped in run42512852807. Do not label stable staging passed or advance on this review alone. Orchestrator must also verify source-admission/other roles and the actual accepted clean-context launch receipt. Real provider pageview semantics/receipt remain a later separately authorized production gate.

## Identity and assurance

- Repository `/workspace/scratch/538c6c66c100/repo` was clean before and after checks, HEAD `58d89a5b71b41ea995e4b327d07b4052d309ccfa`, tree `4f52b4a6162fb548d0d4d7446e7d6063d486fb77`; compared with base `fdfc8cb67a6f78996932d9688c563c53c21387f2`.
- Packet SHA256 independently checked: `d2447f643ce7fb5d6f62326b2c930e11f78da74e7975bb62948ae27c7f0d5e62`.
- Common `agents/reviewers/README.md`: SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- Role `agents/reviewers/white-box-qa.md`: SHA256 `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`.
- Requested isolation: distinct nonauthor reviewer, no author conversation, peer verdicts, unrelated history, delegation, accepted-source/test edits or external writes. Observed: assigned reviewer task and supplied packet; no peer verdict contents read, no delegation or external writes, accepted source unchanged. The actual spawn request/accepted fork parameter is not exposed in this reviewer context and must be retained by orchestrator. Provider model/context/memory internals are unknown; operational read restrictions are not provider attestation.
- Read AGENTS/CONTRIBUTING/acceptance, README and relevant map entries, analytics/staging/check-profile/code-style/site contracts. Per explicit packet restrictions did not read MEMORY or prior/current reviewer verdict artifacts. Inspected actual authored analytics/build/check/test diff and relevant unchanged owners, generated loader/article/Writing/revision output; generated inventory/history was not exhaustively re-audited. Scanner disposition prose is candidate content, not a reviewer verdict or trusted conclusion.

## Independent oracles and risk allocation

The issue sectionB and current analytics contract require finite validated public routes at exact HTTPS origin/project, declared alias equivalence, one SDK per persistent document, no manual pageview path, fail-open optional loading, staging/offline isolation and honest separation of SDK admission from actual collection. The navigation contract separately admits extensionless reader aliases; existing catalog validation separately binds accepted committed source models to exact article URL/title/language. These contracts, rather than expected-value helpers alone, supplied the oracles.

| Risk / AC | Structural fault and bounded scenario | Independent oracle | Executed check / maintained route |
| --- | --- | --- | --- |
| AC01/02 finite article admission | Draft/unlisted/reference/snapshot enters loader, or canonical/alias omitted | Only accepted selected public catalog article URL, plus declared alias | Two new producer tests in site-articles; existing permanent source/staging/production suites and issue177 policy |
| AC02 document lifetime | Double execution or blocked retry inserts another SDK; reload/history misinterpreted as SDK count | One SDK per document; provider owns SPA pageviews | Existing analytics unit tests plus independent actual-loader VM; actual browser journey deferred to current stage-functional job |
| AC03 guard | Origin/project/HTTP/file/trailing slash/unknown path accidentally admitted, query/hash blocks valid path | Exact production origin/project and finite pathname list | Existing analytics guard test plus independent12-partition generated-loader VM; staging analytics fixtures |
| AC01/07 invalidation | Catalog admission/removal reuses stale shared loader/document or slips into content-only lane | Route list participates in platform identity; full generation required on admission changes | Admission/removal cold/incremental equality test; existing build contract and owning issue policy |
| AC03 QA failure/cleanup | Collector setup/abort failure browses or affects later ordinary context | Install before page, abort exact collector, close on failure, ordinary transport unaffected | Four preview-smoke cases; existing permanent source route and local-sink browser contrast |
| AC07 report integrity | Missing article row/phase, wrong title/key, fractional/extra SDK count accepted | Complete exact observed journey, integer one-SDK state; no fabricated pass | Existing quality and staging-regression negative tests; full and staging aggregate validators |

## Executed evidence

Bounded native command, repository cwd:

```sh
node --test --test-name-pattern='compiled analytics admits only|public article admission and removal|the vendor loads once|blocked analytics stays bounded|QA collector predicate|QA context installs|fresh ordinary collector|failed collector abort|complete source-bound PR evidence|selected browser regression requires' tests/site-articles.test.cjs tests/analytics.test.cjs tests/preview-smoke.test.cjs tests/quality.test.cjs tests/staging-regression.test.cjs
```

Exit0; actual runner summary: tests10, suites0, pass10, fail0, cancelled0, skipped0, todo0, duration3144.739588ms. This deliberately selected bounded cases, not the full issue policy or CI campaign. All ten selected cases completed. Quality/report tests include useful fault injections: delete article entries/observations, wrong article key/title, extra/fractional SDK counts; assertions reject them. No accepted source was mutated.

A separate read-only inline Node VM experiment exercised the actual generated current production loader twice for each URL, then fired its error callback and executed again on admitted paths. Exact results: exit0; statuspassed; source58d89a5b; loader `runtime/1c34e64047482a214a50a115582adb08988fe8721f5ee651bd8a231a300e2cf7/analytics.js`; routePartitions12; duplicate/blocked retrypassed; generated/compiled byte equalitypassed; public article count1. It independently checked loader SHA256 against its path and both article/Writing loader references. Cases: current article canonical and extensionless with query/hash admit one; canonical trailing slash, extensionless trailing slash, unknown article, traversal-normalized unknown path, wrong project prefix, immutable preview origin, HTTP, alternate port, file URL and immutable article snapshot admit zero. This VM is SDK-admission evidence, not browser execution or network collection.

Source analysis confirms `build.cjs` validates public catalog articles through `articles.select` and `validateLocalCatalog` before compile/output; finite URL derivation is shared by fingerprint and compile. Existing validator bounds catalog inventory and local slug syntax; browser document registry bounds articles to50. Adapter/runtime/navigation content has no authored change in this diff. No new history wrapper/manual pageview sender or unrestricted article wildcard was introduced. Reading source is not measured branch coverage.

GitHub jobs were freshly fetched through `github_fetch_workflow_run_jobs` for run42512852807. Observed build/publish/stage-evidence-build/host/static successful; stage-evidence/staging job128831902573 in_progress at step9, subsequent content/PDF steps pending; promote skipped. Host job128831902577 completed successfully at exact-byte host verification. These job observations do not authenticate every report byte or establish completed staging. Initial connector attempt used an incorrect repository argument and was rejected before execution; corrected read succeeded. No failure/retry campaign occurred.

## Findings, gaps and disposition

No blocking defect found within bounded inspected source/check scope. Protected invariants examined: no wildcard route expansion, accepted/public versus draft separation, alias/origin/project guard, SDK deduplication, fail-open blocked vendor, route-list invalidation and cold/incremental agreement, exact QA collector isolation/cleanup, and fail-closed report admission.

Uncovered here: actual browser article history/reload with real compiled runtime; real collector receipt, per-navigation pageview semantics including query/filter/fragment behavior and real SDK cost; complete fresh Basic/RI/style/native source suite; full scanner disposition reproduction; external delivery/production. Current staging CI owns applicable browser/performance evidence and must finish with source-bound reports before a staging pass. Browser source assertions do not establish those runtime observations. Existing blocked/delayed/staging/offline fixtures and local-sink contrast retain their own bounded coverage; no universal zero-QA-traffic assertion follows. No coverage percentage measured. CS01/02/04/08 were assessed insofar as source ownership, structured route derivation, shared owner, test failure detection affect this role; full CS01–CS10 acceptance remains independent code/style gate.

AC01–AC03 and AC07 receive bounded source/check support only. Whole AC02/03 live obligations, all broader AC04–AC09 and owner-only Medium action remain open. Current owner authorization permits stable staging only; no merge/production/SEO/theme/Medium action was performed or authorized by this review.
