# Native R9 Exploratory / Interaction QA — local diagnostic

Owner: issue169 / Draft PR170. Reviewer execution: `/root/native_r9_exploratory`; independent nonauthor first pass, 5 November 2026. Scope bound: six minutes, read-only repository/artifact inspection and one local browser launch. No implementation, external writes, peer review outputs or recursive delegation.

**Verdict: blocked for browser acceptance.** No product defect was established by an executed browser interaction. The browser process failed before creating a page, so desktop/mobile/no-JS reading, related destinations, focus/dialogs, normal-motion footer transitions, Back/repeat behavior, actual animation keyframes and browser console remain **not observed**, not passed. This report cannot close the VISUAL/DELIVERY/INDEPENDENT runtime obligations in AC05/08/09/10/11. Static successes below are narrower evidence.

## Actual findings and evidence

1. **Capability blocker, not an application defect:** Chromium156.0.8078.79 on Debian13.6 with repository-locked Playwright1.63.0 could not launch under the execution sandbox. Exact first launch stderr is retained at `tmp/native-r9-exploratory-console.log`: `FATAL:chrome/browser/process_singleton_posix.cc:297 Check failed: . socket() failed: Operation not permitted (1)`, followed by `Target page, context or browser has been closed`. No page existed and no application console was observed. One request to execute the same read-only diagnostic outside that sandbox was rejected before execution because the policy has `sandbox_approval: false`; there was no second launch. Do not infer an app failure or a browser pass from this.
2. **HTTP access also not observed:** a single `curl --max-time 3 -I http://127.0.0.1:8765/articles/the-sdlc-is-out-of-balance.html` returned `curl: (7) Failed to connect ... after 0 ms`. The parent-supplied origin therefore was not reachable from this tool's execution context. This does not establish whether another context's server is running.
3. **Existing hosted failure independently located, still unresolved here:** raw `tmp/release-latest-preview.log` at 2026-11-05T11:27:40 records `AssertionError [ERR_ASSERTION]: unreviewed Color motion runtime`, originating `color-motion-contract.cjs:924`, then `publicationRequired` and staging package verification. This is an actual older run result; it is not a run of this dirty R9 candidate. Treatment: independently review/admit the actual runtime family through the existing contract and obtain current exact-head CI/hosted results; do not suppress this guard.

## Charter and expected/observed actions

The charter was independently derived from issue169's accepted native article/PDF/related-reading scope and the finite normal-motion route risk. At 1440×900 and 390×900, open the Writing discovery card; inspect title, hero plus four explanatory figures, captions, references and PDF; open/close image detail; return with Back; activate Writing's footer next link; Back and repeat twice with motion enabled while recording real `animationstart` keyframes and application console errors. Open the native article with JavaScript disabled at both widths and inspect ordinary reading/links. The temporary observation script is `tmp/exploratory-native-r9-local.cjs`; it never passed browser launch.

| Action | Expected | Executed observation |
| --- | --- | --- |
| Browser launch | A local diagnostic page can load | Failed before page creation; launch evidence above |
| Desktop/mobile reader, image viewer and captions | Five readable figures/captions, working controls | Not observed; static HTML contains five figures, five captions and five nonempty image alt texts |
| Writing → article → Back → footer next → Back, twice per width | Correct native routes and actual normal-motion animation layers, no runtime errors | Not observed; no animation or application console claims |
| PDF material | Accepted five-page R9 file resolves and can be read | Static local target exists; SHA256 and five-page count match; browser download/viewer and visual page inspection not observed |
| Local native links/images/anchors | Targets exist | Executed static parser/resolution:37 local URLs,0 missing file/fragment targets |
| External references | Correct destinations and navigable source links | Source URLs present in inspected HTML; remote access/click behavior not observed |
| Related reading | Valid nonself recommendations using current index/component | Runtime slot is present; mounting/destinations not observed. Static References and related work remains in HTML |
| No-JS desktop/mobile | Readable article and ordinary figure/PDF/reference links | Static content/links present; actual no-JS rendering/overflow not observed |

The 37-target static check used Python's standard HTML parser, resolved file URLs relative to the article and verified HTML fragment IDs. It proves neither HTTP status, visual legibility, responsive layout nor click behavior. `pdfinfo` reports title `The SDLC Is Out of Balance: Beyond the AI Code Review Bottleneck`, author Vitalii Oborskyi,5pages,A4,549590bytes,no PDF JavaScript; PDF SHA256 `75e052d6a5c386ae79cb1a51d59cdf42e53d3a7279bf0db31c227ee145bb18b4`. All five PDF pages and link annotations were not visually inspected in this pass.

## Source and packet binding

Local HEAD is `601d7cbca00bf67a66b91e1580c903a632da422d`, Git tree `3cb70eb3c74116ec2166f64b93bfa3c496796f59`; local main and origin/main are `8cf15883125892710633b17133d9ee0fc4b23b92`. The working tree has prepared uncommitted R9 native/generated changes; it is **not a clean HEAD review**. No live ref refresh or GitHub status verification was performed in this role. The supplied owner packet's older d4c58e5 PR identity is historical relative to the local source-freeze commit.

Inspected Color artifact: `tmp/native-r9-color/artifact.json`, sourceDirty=true, sourceCommit/candidateCommit601d7cb, artifactDigest `e5178af69a5357026f54eecab1ce954fd6b1c751048b085a4ea689235d8c44fb`, generation/base artifact digest `38b107cd3c7b0db19c69f6d672fffbb1bfc9b29d21fa9646db168c33521c4322`, outputLockSHA256 `a1003d9e8fe9dee0c5494aacd8706f1aa8c86fa46a2686fc779fade3c21eecd1`, Color fingerprint `985ca46ab97b36c59ae9b1491daee3788debda6eaf125ff11c645702b880aa4f`. Article edition `sdlc-out-of-balance-en-r9-20261105`; native source SHA256 `ccaddfe2c40c6a8ba5f4bd75abd4a3c762e94fcbb15997e5e5014e1d6f8fa654`, semantic SHA256 `c7a14160aa9369d1f359aeb04523e1167c8a189ec5518d378f8de7d27d44da08`.

The sorted manifest below uses `SHA256  relative-path\n`; SHA256 of its concatenated UTF-8 bytes is `459771bc0a631246fd42d4b38dab63747c1d84ea21b05ff12ba4923f03173788`. It binds the core supplied authority/owner/artifact bytes inspected, not the complete repository diff. README, REPOSITORY-MAP navigation, dated MEMORY, applicable policy and existing article browser helpers were also consulted. MEMORY's R3 state was treated as stale handoff, not current acceptance. No nested AGENTS exists in this checkout outside root.

```text
7036f0f97be12e72bb7e45e6b6dc456ac52c72bbce07374977901c4d90ef354b  editorial-packet/release-intent.md
7274ee92568eca12c8971f9123a5048996ef5838c2b5d96b802103ca88cd46f9  editorial-packet/release-owners.json
62ebd4fcaf5654a3923b7fa8843fc27dd2e0456694a82ea55a1dad1e8bf7aaac  release-repo/.github/acceptance/issue-169.json
ad4f179ec04c7af12867229d70598a660c5ae41f3cb456cafd02aca3d12a9988  release-repo/AGENTS.md
804fb3da9a0bc7369bbd902313224221becc6c6b775536ca943f8664bf741442  release-repo/CONTRIBUTING.md
2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb  release-repo/agents/reviewers/README.md
280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a  release-repo/agents/reviewers/exploratory-interaction-qa.md
20d658138ec1a33112704a723ab6748b3f43e2f46b91ec6766a4149b2aaec5d5  release-repo/guides/SITE-CONTENT-REVIEW.md
51f42bbdf31acc1d5e440d5a3d21e7b81669f065ea09e202df6f881eaac3c38b  release-repo/review/issue-169/native-check-allocation.md
a36aa1770e72677e83d4a4840e36ba6d569f24fbaa13d98d78629c1872160a74  tmp/native-r9-color/artifact.json
13be79d3cd4b4494b3a0191eb3b52406add8f94b76ed6ca2df92b0571857adc3  tmp/native-r9-color/public/articles/the-sdlc-is-out-of-balance.html
788745fbff562b9c86a1667fc3c59154bfee6f3b9aa06e68667d76c1a68b4f2a  tmp/native-r9-color/public/navigation.js
3fcf8b787fb9614c28eee584d7629174c9ee2210e5e4028b64e526f6134fd4f0  tmp/native-r9-color/public/styles.css
```

## Remaining existing route

Rewalk this charter in an environment with the supported pinned browser and actual accessible exact-source artifact. Existing `tools/quality/article-browser.cjs`/`content-browser.cjs` own affected native-reader/normal-motion/Back journeys; `article-tags-browser.cjs` owns mounted related destinations and unavailable-index behavior, with `tests/article-browser-evidence.test.cjs` validating evidence semantics. Keep their registry routes in `tools/quality/test-profiles.json` and PR hosted smoke/staging profiles in `guides/SITE-CHECK-PROFILES.md`; do not invent another mandatory matrix. Exact-head Basic/RI/issue checks, hosted identity, staged regression, rights/admission and actual production verification remain separate gates. This local Debian/system-Chromium diagnostic is not a substitute for pinned Ubuntu/Windows/macOS CI, hosted acceptance, performance proof or physical-device review.

Provider model/context internals are unknown. The parent supplied known raw-failure locations and an expected invariant for the prior footer layer; no peer verdicts or author conversation were read. This is a completed bounded investigation with a blocked observation outcome, not a completed successful runtime review.
