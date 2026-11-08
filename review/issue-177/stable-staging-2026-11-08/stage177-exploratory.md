# Issue177 — Exploratory / Interaction QA — first result

Date: 2026-11-08, observations approximately19:12–19:15 UTC; bounded to10minutes. Role/task handle: `/root/stage177_exploratory`. Distinct nonauthor review; no implementation, test changes, external writes, recursive delegation, peer verdicts or unrelated memory consulted.

## Verdict

No confirmed blocking product defect found in the executed analytics-only staging charter. **Conditional readiness only:** the actual bounded staging browser/performance job remains in progress at19:15:27 UTC. This review does not certify stable promotion or original issue completion. Require successful exact-source staging gate and stable-host verification through the existing controller before calling stable staging complete. Real production SDK/pageview/provider receipt remains a later production gate; it is deliberately absent on this staging edition.

## Identity and isolation

- Supplied packet SHA256 independently matched `d2447f643ce7fb5d6f62326b2c930e11f78da74e7975bb62948ae27c7f0d5e62`.
- Common prompt `agents/reviewers/README.md`: SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- Role prompt `agents/reviewers/exploratory-interaction-qa.md`: SHA256 `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`.
- Repository `/workspace/scratch/538c6c66c100/repo`; clean working tree; HEAD `58d89a5b71b41ea995e4b327d07b4052d309ccfa`, tree `4f52b4a6162fb548d0d4d7446e7d6063d486fb77`; base `fdfc8cb67a6f78996932d9688c563c53c21387f2`.
- Requested isolation: distinct nonauthor role, no author conversation or peer verdict inputs. Observed: this execution received only source packet/role request and a subsequent neutral raw-evidence pointer; no peer verdict was read. Parent must retain the actual accepted spawn receipt/fork parameter; it is not exposed inside this child. Provider model/context/memory internals are unknown and not attested by this result. This is an operational read boundary, not an OS sandbox.
- Source preparation: full delta inventory inspected; relevant authored build, analytics integration/compilation, article-browser fixture and report-validator diffs inspected. README/AGENTS, repository-map owner locations, common/role contract, acceptance, style, staging, analytics and applicable profile/source contracts were read or queried in bounded sections. No nested AGENTS was returned under relevant site/tools/tests/agents/.github paths. MEMORY deliberately excluded by review packet boundary.

## Independent charter and actual surface

Exercise the immutable served candidate, independently of fixture conclusions: canonical article entry and reload; extensionless alias with query/fragment; article→Writing; Writing's actual selected article link; identity across internal navigation/history; staging analytics suppression. Use ordinary cloud Chrome in a new dedicated tab18, leaving GitHub/shared existing tabs untouched. Browser DOM/AX and screenshots are real remote browser observations, not physical-device or human usability proof. No production browsing or vendor injection was performed.

Actual origin: `https://4143b5c4.oborskyi-author-ci-staging.pages.dev`. Visible badge: `STAGING · 58d89a5b` throughout sampled journeys. Browser runtime asset prefix: `runtime/ace81eb56ccb8fca35099e960d684ca90aa855733c7a8e9dfe35eab66da84f78/`.

| Action | Expected | Observed / disposition |
| --- | --- | --- |
| Fresh direct `/articles/the-sdlc-is-out-of-balance.html` | Correct current article; staging suppression | PASS: host redirected browser to extensionless article. H1/title matched full SDLC title; body `data-article=sdlc-out-of-balance:en`, page writing; R11 content and badge visible. |
| Native reload of direct entry | Same article identity | PASS: same extensionless URL/title/H1/article body and runtime script list. |
| Article `← Back to Writing` | Archive mounts without article identity | PASS: `/writing.html`, Writing title, H1 `AI architecture, deliveryand operating models.`, article attribute removed; final content no `aria-busy`. Initial camera/busy state preceded settled archive. |
| Inspect actual archive link | Exact selected article/edition preserved | PASS: one matching title anchor with `href=article-snapshots/f64b3c3ceb2df66074707872a333937a74bd5e153cb824195a90a9be81dec766/the-sdlc-is-out-of-balance.html`; separate correct Medium link remains. |
| Activate archive title | Mount actual article and canonical internal URL | PASS with interaction-tool limits: initial locator attempt did not yield a settled navigation; after fresh screenshot and visible title coordinate click, canonical `.html` URL mounted SDLC article. Later sampled DOM had correct title/H1/article and `aria-busy` absent. |
| Browser Back then Forward | History preserves destination identity | PARTIAL: Back changed URL to Writing but sampled DOM was still busy/article during transition; settled Back identity was not observed before Forward. Forward returned canonical article and later correct H1/article/title, no busy. Do not count settled Back or timing as passed. |
| Fresh alias `.../the-sdlc-is-out-of-balance?entry=exploratory#finding-a-new-balance` | Correct article; suffixes do not enable analytics | PASS for identity/suppression: exact suffixes retained, correct H1/title/article, robots `noindex,nofollow`, zero analytics elements. Fragment viewport landing was not separately assessed. |
| Script inventory on native article, reload, Writing, internal/Forward article and alias | No production loader/SDK | PASS for observed DOM: scripts were only local theme/space/archive/navigation. Zero `script[data-site-analytics]`, `#site-cloudflare-beacon`, or `script[src*=cloudflareinsights]` in final sampled article/alias states. This does not claim a captured zero-request network trace. |

Retained raw evidence: this execution's `mcp__cua_repl` tab18 AX, DOM outputs and two screenshots (archive title; intermediate camera transition). Scripts were inspected through DOM only. Attempt to read Performance resource entries failed because the supported read-only evaluation scope exposes no `performance`; no network assertion is inferred from that failure. Requested10second locator waits returned tool deadlines around3seconds; two initial waits also used an incorrect Writing heading / inaccessible arrow in name. Those tool/selector failures were corrected using actual observed page state and are not labelled site defects. Transition durations were not measured or accepted against performance budgets.

## Actual CI and source corroboration

Fetched current GitHub run and jobs independently via API, not shared GitHub UI:

- Run `42512852807`, attempt1, `Site preview PR #178`, event pull_request; exact head/base/tree match packet. Referenced reusable workflow merge commit `3560c1239359e5056b38e09affaad6dc99b20714` is recorded separately from raw candidate source.
- Build/publish and stage-evidence build/host/static jobs success. Host job `128831902577` raw log binds `SITE_CANDIDATE_SHA=58d89a5...`, immutable preview above, staging profile, Color, public artifact13630416892 ZIP SHA256 `ad453d2f3fc37a7b000ae4c1b40db504625379b40428cc0098266f35e1880bf6`. It executed `node tools/quality/hosted.cjs` successfully; host report artifact13630132871 ZIP SHA256 `7f6a7ca71de31567f8832fef79c6b0812cfe7ccdfe5b8ac2fa788ad3bf246f0a`.
- At19:15:27 UTC, stage-evidence/staging job128831902573 **in_progress**, not passed. Promote skipped in this evidence run; no stable promotion is inferred.
- Inspected raw prepublication JSON supplied at `/workspace/scratch/e4946ebfb0ba/prepublication/prepublication.json`: exact source/tree, sourceDirty false,26checks, pass true; staging edition `indexable:false, analytics:false`; artifact digest `a6d9a0394f6b1d3dc1871633dc2f84884fd69aa43e8543bab7ab3c40fb91252f`. Parent supplied neutral extraction/digest-verification facts; extraction itself was not repeated here.
- Source `tools/site/build.cjs:272` derives analytics routes from validated `local-article` catalogue plus declared principal routes, adds them to analytics fingerprint and compile call; existing adapter retains exact HTTPS/origin/path admission, one DOM SDK ID and no manual history pageview emission. New fixture covers canonical/reload/alias/Writing/internal/Back/Forward identities and SDK counts. These observations explain expected behavior; they do not substitute for pending executed fixture evidence.

## Findings, requirement impact and limits

No confirmed high/medium defect in the sampled native/internal/alias identities or staging DOM suppression. Risks examined: native direct entry loss, alias loss, stale article mount, Writing edition mislink, duplicate SDK injection, accidental staging analytics and wrong-source CI reuse.

AC01/AC03/AC07 gain bounded source/served-edition/exploratory evidence. AC02 retains real production SDK/receipt gate; AC07 retains pending staging regression, admission and stable verification. All original AC01–AC09 remain broader than this checkpoint and must not be ticked as fully complete from this result.

Existing regression allocation: canonical/alias/reload/Writing/internal/Back/Forward and SDK assertions → `tools/quality/analytics-browser.cjs`, selected Writing-enabled fixture in bounded staging and functional profiles; negative report rows → `tests/quality.test.cjs` and `tests/staging-regression.test.cjs`; article route admission/draft/snapshot exclusions → `tests/site-articles.test.cjs`; actual staging no-SDK/bytes → hosted job and current browser samples. Proposed follow-through is to inspect the pending exact-source staging report, particularly complete Back/Forward fixture observations; proposal is not executed evidence. No duplicate broad campaign was run.

Not observed here: packet/full-suite production cases, blocked/delayed real SDK, unsupported routes, offline browser, no-JS, mobile/physical devices, provider collector requests or received aggregates, hosted SDK cost, all-source integrity proof beyond successful actual host job, settled Back state, transition performance. These remain existing mapped suites or later authorized provider/production gates, not N/A. SEO/discovery/theme/Medium account edits were outside authorized analytics-only staging review and were not performed.
