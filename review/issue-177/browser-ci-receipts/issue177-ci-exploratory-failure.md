# Issue177 Exploratory / Interaction QA — failed CI checkpoint

2026-11-08. Reviewer `/root/issue177_ci_exploratory`, reporting-only continuation. Read assigned raw report directory `/tmp/issue177-ci-failure-42511286540/reports`; no peer reports, source changes, external actions, delegation or further UI. Earlier actual preview042 observations remain partial older-source evidence in `/tmp/issue177-ci-exploratory-actual.md`.

## Exact failed source and report

`prepublication.json` independently reports run42511286540 attempt1, source/candidate `06ffa6fcfc1cfa5fa1030e5d077d5d314e324d07`, tree `8193b1fab23a9af8f4bc6e651a1c1cf45048fa99`, clean source. SHA256 of this raw report: `3983f3e1bf52fb1d8aa0790f4e17f3fe987ee295b32fd5db4e4918b6d40f4e10`.

Raw source-runner JSON, TAP, stderr, format stdout and SEO stderr hashes were independently checked against this report's `files` map: all five matched. Report values: `pass=false`, `fullGate=false`, `productionEligible=false`, `deploymentAuthorized=false`. Edition is staging, indexable=false, analytics=false.

## Observed accounting and failure partitions

The source runner and terminal TAP agree: **1245 total,1240 passed,5 failed,0 cancelled,0 skipped,0 todo**, duration293852.993256ms. The prepublication source-tests command exited1 after294000ms within its630000ms bound. This is a completed failed source campaign, not partial browser evidence.

| Failure | Exact raw location | Observed mechanism |
| --- | --- | --- |
| Writing carrier proof | `prepublication-source-tests-runner.tap:141`; test `tests/executive.test.cjs:19` | Producer build hash actual `ee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee` differs from expected `3d9b80f989008ae487cccf4b38aea630bd4ddf62782a971e7e62142c9fbbc869` |
| Research carrier reconstruction | same TAP:184; `tests/executive.test.cjs:44` | Same build-owner hash mismatch |
| Executive frozen SEO/editions invariant | same TAP:285; `tests/executive.test.cjs:547` | Same Research carrier build-owner hash mismatch |
| Fresh SEO CLI authored-text test | same TAP:3151; `tests/content-rendering.test.cjs:174` | Same Research carrier build-owner hash mismatch before intended body-text oracle |
| Metadata/schema script comparison | same TAP:3888; `tests/content.test.cjs:491` | Expected loader `runtime/7ebed494340d081e3c5be942074182f97c9b93f3a887af88d36023e26db146ff/analytics.js`, actual `runtime/1c34e64047482a214a50a115582adb08988fe8721f5ee651bd8a231a300e2cf7/analytics.js` |

Of26 recorded prepublication checks,23 passed and3 failed: source-tests, format and SEO. Format stdout identifies only `.github/ri-ci-map.json` as changed. SEO stderr independently records the same Research carrier `tools/site/build.cjs` producer mismatch; it is not evidence of a new approved SEO-content change. These are observed refusal mechanisms. This review does not accept a new correction merely because it could satisfy the assertions.

## Browser checkpoint disposition

**Current-source BROWSER remains applicable and PENDING.** No `staging-functional`, `staging-regression`, `analytics-fixture`, `hosted` or `preview-smoke` report files were present in the supplied raw directory. The prepublication gate failed. Orchestration reports publication/browser were not reached; this bounded review did not independently fetch workflow job statuses and therefore does not infer them from absent files alone.

The1240 source passes cannot stand in for any of the seven actual compiled native-article browser phases. Older source042 UI observations do not satisfy source06ffa6fc or the forthcoming corrected candidate. In particular, staging's absent SDK DOM elements are not enabled-fixture one-SDK/document proof, pageviews or collector receipt. The older CUA Forward final busy=true and earlier interaction timeouts remain retained; this failed prepublication run neither resolves nor invalidates those observations.

## Next bounded gate

No unchanged failed-campaign retry is justified by this report. A correction must first bind the observed carrier mismatch and loader-oracle mismatch to accepted independent contracts, preserve geometry/content negatives and exact document loader identity, pass bounded affected verification and obtain current-source review. Carrier refresh after publisher pin/hash updates and an independently derived validated-article pathname oracle are proposed treatments for the relevant source owners; their implementation acceptance is outside this reporting-only task.

Once the corrected candidate passes prepublication and produces actual current-source browser reports, inspect all seven article phases, original strict readiness/title/key/request/element assertions, the preserved blocked/delayed/staging/offline/isolation cases, full terminal accounting, immutable preview identity and observed no stable promotion. Until then, report the checkpoint as **failed prepublication; no new current-source browser acceptance**. Whole issue ACs and provider receipt remain open.
