# Issue 179 — stable staging verified, 9 November 2026

Owning issue [#179](https://github.com/oborskyivitalii/oborskyivitalii/issues/179); execution [PR180](https://github.com/oborskyivitalii/oborskyivitalii/pull/180).
This is an immutable delivery receipt, not the deployment candidate.

## Result and authorization

The owner authorized stable staging, then stop/report, and repeated that instruction in the current session. The existing owner /stage attempt completed SUCCESS; no additional campaign was dispatched.

- Source: `5c61d3a5c0c8fb7a17f20b83b9bf5215fa8c83f9`.
- Source tree: `f0d9949a9e1fa00b359a8a4328b9b527a7a78df7`.
- Protected main/controller and production: `fe7baab277a8b90de330a1cec738b7085faf7223`.
- [Controller run42631791036, attempt1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/42631791036): SUCCESS, 14:08:45–14:32:29 UTC (23m44s).
- Stable: https://staging.oborskyi-author-ci-staging.pages.dev
- [Stable article](https://staging.oborskyi-author-ci-staging.pages.dev/articles/the-sdlc-is-out-of-balance).
- Immutable tested candidate: https://e7d7e9ce.oborskyi-author-ci-staging.pages.dev
- Public digest: `d97f46e81fed399fc36ac70560c81c0401acd6c0e6ac482b8b866e4e08a2b766`.
- Package digest: `d10dd742f2ca3daed193bb5985c62a26874312a2af9771904bda2dc6acd96072`.
- Rights digest: `f209de999963e17d965918e8e1ab5c1ad96a875eacd155fad3243894f3cb2d9e`.

The operational15-minute end-to-end target was exceeded. The bounded browser job ran10m34s including setup; functional collection386654ms and performance74173ms remained within their original limits. No test/profile/scanner/timeout or site budget was changed.

## Actual checks

| Gate | Job | Result |
| --- | --- | --- |
| Source admission |129209884299| PASS |
| Immutable build/prepublication |129210046692| PASS:26/26, source1254/1254 across75modules,143Python tests |
| Candidate publication |129214753129| PASS |
| Authenticated reusable build |129215118017| PASS |
| Hosted bytes/MIME/routes/404 |129215575330| PASS |
| Static/raw prepublication authentication |129215575373| PASS |
| Browser/performance staging |129215575585| PASS |
| Exact-source staging gate |129221582531| PASS |
| Same-package stable promotion/verification |129221772851| PASS |
| Exact-head merge admission |129222569373| PASS |
| Change-admission receipt |129222894057| PASS |

The downloaded raw gate says `kind: staging-gate`, `pass:true`, `fullGate:false`, `productionEligible:false`. This is the authorized bounded staging profile. Full optional production diagnostics, physical-device testing and actual LinkedIn behavior are not inferred.

Functional evidence covers Chromium/Firefox1440/390, four normal journeys/20route observations, two no-canvas journeys/10observations, two navigation cases, ten capability-failure cases, seven analytics fixtures, actual native-article observations and two Color widths. Performance covers two CPU4x route samples/eight measurement windows, four cold/warm flights and two mobile Lighthouse trials. These QA observations are not readership or production analytics receipt.

Root independently downloaded prepublication/package/host/browser/gate/promotion ZIPs and verified provider SHA256 digests. All67 prepublication raw-file hashes and all52 packaged public-file hashes match. The gate, host, browser and promotion receipts bind the same source/tree/public digest and run/attempt.

## Immutable raw receipts

| Native artifact | ID | ZIP SHA256 |
| --- | --- | --- |
| Prepublication |13681078256|`24bfd6b977825fba48f4b97ea7b621d849f37b97be75a1dc5562ab0d1a4f729a`|
| Tested package |13682366817|`90e2d5e006ed182ff3da533167fe6fce6be9de098038f20f38ed67eb104b28ec`|
| Public artifact |13682625862|`42abd1b39942c9934b8bb4a4845d78a79e128159c9dd6a7a72960186bdf33dfd`|
| Hosted report |13680919354|`a0057cdb1dee2df60c15a43d5cfaa67a02f48c2dd523655b817261b89a660abc`|
| Browser/performance reports/screenshots |13682219344|`f3904dcda7b064774fb6da01568db25de27be3d981f4d4c8e8ad72670e64cabf`|
| Staging gate |13681974641|`9f4c7d4fce6f4deb07f2ea987fcdc7a3781080c54967c4430807d987ddb972c4`|
| Stable promotion/recovery |13682324590|`afbeb3356f6e7c30044da8208f2e01d9ab73e85bc27d20cfdb357cee1fe33174`|

Raw artifacts are available through the linked successful native run, subject to their original retention. Public artifact ZIP was not downloaded again in this session; its native upload identity is recorded, separately from downloaded/package validation.

## Independent review reuse and source identity

No implementation, oracle or candidate change occurred in this delivery session. The four completed nonauthor correction reviews apply to the unchanged tree above and are reused under CONTRIBUTING's read-only/status exemption. Root checked the source/tree binding, gzip digest and all four verbatim-review SHA256 values.

[Immutable existing review packet](https://github.com/oborskyivitalii/oborskyivitalii/blob/2fd18cbeb74bc001e62879705e381b9fbe638265/review/issue-179/2026-11-09-stable-staging-correction.json.gz), gzip SHA256`dbaa698a6e0436d8f31b1bff4c87a7d60d0cb1e37b553abd76db7e257fc97b58`.

| Role | Existing completed execution | Launch |
| --- | --- | --- |
| Requirements |/root/issue179_stablefix_requirements|fork_turns:none; model/effort omitted |
| Code |/root/issue179_stablefix_code|fork_turns:none; model/effort omitted |
| White-box |/root/issue179_stablefix_whitebox|fork_turns:none; model/effort omitted |
| Exploratory |/root/issue179_stablefix_exploratory|fork_turns:none; model/effort omitted |

Their first outcomes, scope and limits remain verbatim in the packet; provider model/context/memory internals remain unknown. Root's current receipt audit and browser check are self-verification, not newly claimed independent executions. Earlier failures remain preserved in existing packets and run history.

## Actual browser observation

Shared Chrome opened the immutable candidate and, after promotion, the stable article. The stable URL serves the expected title/content and visible `STAGING · 5c61d3a5`; DOM confirms `noindex,nofollow` and no Cloudflare analytics SDK. The image from the immutable candidate opened as JPEG1200×630; full composition and padding were visually observed. Image SHA256 is`7144d8165842a07ac8194e88a7301b777f11dac41ca1dcf8d88f6ba4cbecb27f`.

Ordinary stable staging deliberately omits production/PR-only social tags. This observation is not evidence of LinkedIn's real scrape or cache behavior. Production HTML and actual LinkedIn Post Inspector remain separate post-publication gates.

## Original acceptance and next step

| AC | Evidence now | Remaining |
| --- | --- | --- |
| AC01 | Current-source cover/static selection tests and reviews passed | Final production rendition observation |
| AC02 | JPEG1200×630/hash/MIME/closure and visual inspection passed | Production absolute-origin/image verification |
| AC03 | Route/fallback/refusal tests and reviews passed | Final production route parity |
| AC04 | Existing history verification, rights/package and stable passed | Production/archive/live gates |
| AC05 | Exact-source checks/four-role review/preview/stable passed | Separate owner production decision and delivery |
| AC06 | Actual LinkedIn display remains unverified | Verify production HTML/image, then Post Inspector refresh/result |

Whole original issue criteria remain open while their release/platform obligations are pending. PR180 remains open/unmerged. No production publication occurred. Stop here for the owner's stable review and separate production decision. If approved, refresh read-only protected admission, merge only this identical tested tree, freeze/publish through the existing production route, verify live metadata/image, then inspect the actual LinkedIn result. Do not rerun this successful staging campaign absent a moved source or new failure.
