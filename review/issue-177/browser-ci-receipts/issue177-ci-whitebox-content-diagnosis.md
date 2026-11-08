# Issue177 CI42511286540 — White-box source failure diagnosis

2026-11-08. Read-only diagnosis, no source/test edits, external writes, delegation or peer-output reads. Observed current HEAD `06ffa6fcfc1cfa5fa1030e5d077d5d314e324d07`. Retained runner JSON source/sourceAfter both bind this clean commit and tree `8193b1fab23a9af8f4bc6e651a1c1cf45048fa99`.

Retained source accounting independently checked: final TAP and JSON agree **1245 tests,1240 pass,5 fail,0 cancelled/skipped/todo**. Process exit1, signal null, no execution error; original600000ms deadline and16777216-byte buffer unchanged. TAP duration293852.993256ms. Exactly5 `not ok` records:

| TAP ID | Location | Cause |
| --- | --- | --- |
|24|tests/executive.test.cjs:19|Writing carrier expected old build.cjs hash3d9b80f989008ae487cccf4b38aea630bd4ddf62782a971e7e62142c9fbbc869; currentee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee|
|25|tests/executive.test.cjs:44|Research carrier same producer-pin mismatch|
|38|tests/executive.test.cjs:547|SEO aggregate reaches same Research producer-pin mismatch|
|495|tests/content-rendering.test.cjs:174|Fresh SEO CLI reaches same Research producer-pin mismatch|
|608|tests/content.test.cjs:491 (assertion524)|Principal-only analytics expected loader7ebed494; generated documents correctly reference article-aware loader1c34e640|

These are five failing tests with two underlying affected contracts. The content correction alone cannot clear all five. Four carrier failures require their own exact-source provenance treatment and preserved historical/negative checks; this role has not accepted a carrier correction.

Recommendation for content: update only this test's analytics input to explicit principal route URLs plus `edition.url` of `kind === 'local-article'` records obtained through validated `tools/site/content.cjs.catalog(projectRoot)`. This derives the required public route inventory from the independent declared catalog contract, while retaining the existing compiler-byte/digest and exact script metadata oracle. Do not call the build's private analyticsURLs projection, copy its new hash, derive the expected loader name from emitted documents/revision, loosen to any runtime hash, or drop exact script count/attribute/empty-inline assertions. Preserve the existing SDK route/refusal suites; this metadata test itself never establishes browser pageviews.

Executed bounded diagnostic Node probe (exit0) on those proposed inputs: exactly five principal URLs and one declared public article URL compile to `runtime/1c34e64047482a214a50a115582adb08988fe8721f5ee651bd8a231a300e2cf7/analytics.js`. Generated loader bytes equal compiler bytes and its filename digest; all five principal HTML files reference it. Independently parsed adapter options contain exactly root plus the five principal paths plus `/articles/the-sdlc-is-out-of-balance.html` (7 total), no snapshot paths. This links the stale test input to the precise observed expected/actual failure without changing candidate files or rerunning the failed campaign.

Smallest verification after author correction: run the targeted metadata test, then its affected content module and applicable maintained analytics contracts. Keep the original full source failure receipt. Resume the required exact-source gate only after the carrier contract's other four failures are resolved and independently reviewed. No browser acceptance or CI success is inferred from the diagnostic probe.

Inspected SHA256:

- tests/content.test.cjs:98571934c63fdbcc3ca75f05bae6fc256f414a38d4bba3cc00606cb9265eba63
- tools/site/build.cjs:ee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee
- tools/site/analytics.cjs:9170499ce19a8dd4856af6415b77dcee493c89e028711a1cd6e7d6987ca2f1a7
- retained prepublication-source-tests-runner.json:3e84f028c07c633bdb801e2f75ddbacdbb93829a4315a931313defbd005a34f3
- retained prepublication-source-tests-runner.tap:8238b5285ce81d6d8fa1edcbb2f59b0809308d051b155a45b19292518f768a4a
