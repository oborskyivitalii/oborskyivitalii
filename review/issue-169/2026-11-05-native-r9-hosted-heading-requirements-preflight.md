# Hosted article heading animation — requirements preflight

Refs #169 / PR170. Independent Requirements & Acceptance inspection, 5 November 2026. **The hosted article journey remains failed and requires a bounded runtime correction plus actual affected revalidation. No new author decision or gate is needed for this required defect fix; no animation, timing, rights or release guard may be waived.**

## Actual evidence and source scope

Read actual `/workspace/scratch/83aaf5811f83/tmp/r9-preview-smoke-failure/preview-smoke.json`, SHA256 `7ccab21f0a345883ecd7642f52c479b167635cc9ac4d2be38f65205488dd6ccd`, plus archive/scroll-entry/article-browser source. Owner supplied run42095940300/job127487701705/artifact13446304353; this role directly verifies report contents, not the full original artifact archive. Report source `1c060edd33259800420ec314c6245c72be32eda8`, tree `640907753a9a7179612a29f85ca01abda71cf2d2`, hosted origin `https://86364091.oborskyi-author-ci-staging.pages.dev`, artifact `48db534cad4386f16e7469eb1e4e0b9fc42061065ae8e2aa6b423d44dbe6697b`, staging Color `1fce9ff8d1acbf867828680a0a68fa386ed8571a4828442ab9167227bffb42e0`/base727. Current checkout is the same1c060; separate retention-source changes are in progress. No peer verdict was read.

The report is `pass:false`, `fullGate:false`, `deploymentAuthorized:false`. Four principal normal/no-Canvas width rows passed. The article list is empty because the article journey aborted; the error is `actual common CSS animation exists` for H2 `.archive-heading`, child layer, departing row4, frameCount0. Article checkpoint is not evidence of completed article acceptance. Passing principal rows cannot replace the failed article journey.

## Requirement defect and bounded correction

**High — refreshed archive text can lose its current movable ink layer; AC05/08/10/11.** `site/engine/archive.js:refresh` unconditionally writes `heading.textContent`, replacing any prior child span. `scroll-entry.cjs:refreshInventory/recordFor` reuses the existing `knownRecords` record with `record.ink`; route and reading preparation wrap only when that pointer is falsy. A previously wrapped heading can therefore have a nonnull pointer to a detached ink node while its live heading contains bare text. The current CSS child-layer animation then has no real child to animate. This source mechanism is consistent with the actual frameCount0 failure, not yet an independently reproduced browser root cause by this role.

The necessary invariant is generic and bounded: whenever a cached unit is reused after its owner's text/children were refreshed, its ink reference must denote the current appropriate live layer owned by that unit. Otherwise the next supported reading/route preparation must construct one correct layer from the **current** text. Preserve record identity/done/read status where valid, exact updated heading/count meaning, native semantics, focus/history behavior and one-layer/no-duplicate-motion ownership. Do not blindly rewrap every record, create nested stale layers, retain obsolete text, reanimate already settled visible content, special-case a test heading to skip checks, or switch to Off/self mode merely to avoid missing child frames.

Keep the fix in the existing archive/scroll-entry ownership boundary. A focused regression should reproduce refreshed bare text after a prior wrapped lifecycle and assert a current owned layer with unchanged text, no detached/nested duplicate and correct cleanup. Cover repeated refresh, filter reset/restoration, cancelled/completed route reuse and stable ordinary records where relevant. The existing real-frame assertion is an independent acceptance oracle and must remain≥2 actual CSS keyframes for participating units, with actual animation lifecycle completion under original limits.

## Diagnostic revalidation charter

Prior run42090631531's28/28 cases are valid historical evidence for its exact e92 runtime and tested footer/reader paths. Those cases omitted the full filter/Forward sequence in the maintained article journey; they did not establish that broader hosted obligation. This hosted failure does not erase their actual observations, and they cannot waive it.

Before rerun, version the existing diagnostic charter to exercise the actual affected state transition at1440 and390: select a real article-compatible archive filter (including current query/state), enter R9, browser Back restoring filters/query/focus/scroll, Forward restoring the article, and repeated navigation after the heading refresh. Capture the participating archive heading's current children/ink ownership and actual departure/arrival CSS keyframes/start/end; preserve the original footer/reader/no-JS cases. Enumerate every added case honestly rather than still reporting “28 cases” after expansion. Reuse existing actual article-journey helpers/oracles where appropriate, without substituting source inspection for interaction.

Keep240-second script and10-minute job caps, pinned browser/dependencies, fail-closed missing rows, traces/screenshots/error accounting and exact coherent source binding. No broad performance/device sweep or duplicate full figure visual review is implied. The final maintained **hosted** affected-article journey must also pass on its current source/artifact; a local diagnostic remains `fullGate:false` and does not become hosted/staging admission.

A runtime change invalidates exact registered bytes/fingerprints for changed variants. Derive new current source/plain/stage/production identities through the existing guarded process and independently review affected data; never carry old runtime rows forward by swapping hashes blindly or weaken their guards. Preserve original failure42095940300 and actual old observations.

## Acceptance boundaries

The separate content-retention closure failure/correction has its own source tests and obligations; its reported18/18 result does not resolve this hosted runtime failure. Accepted R9 manuscript/five visuals/five-page PDF, rights, external-copy/manual-posting scope and original production authorization remain unchanged. No additional author approval is required to correct these implementation defects.

Complete actual affected independent review and current-source tests/diagnostic/hosted article observations, then retain the original full CI/RI/issue, stable staging, protected identical-tree merge, frozen production rights/archive and actual served article/PDF/SEO gates. Draft remains appropriate during unresolved correction. No whole AC, hosted acceptance, platform publication or production health is claimed here.

Inspected source SHA256: archive `01d8803a9cc02edde612fa247a046cc9c295bc088ed8ba64e407ba00e34c35ed`; scroll-entry `268ed2aed873105d229f54b146f34b5f1fd3c40cad8d83759cc0aa1635619b4d`; article-browser `b52c67fca8ce592531d1574b5886b95d2dd95f614b460bcecf460c229f36b05c`.
