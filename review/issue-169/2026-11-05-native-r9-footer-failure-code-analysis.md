# R9 actual footer diagnostic failure — Code analysis

Refs #169 / PR170. Independent nonauthor Code reviewer `/root/native_r9_code`, 5 November 2026. Read-only diagnosis of actual run `42087148352`; no peer report read, source fix, new browser run, external write or delegation. **The observed failure is a product URL/routing defect in the hosted Color footer, not evidence of a missing CSS-animation frame or a wrong settlement oracle. Runtime-family admission remains blocked.**

## Exact observed evidence

Clean local HEAD and report source `3c532d2f23e9568e5d88b9b50139d45a4867829e`, tree `35b45f7b442a771fe646844cfec8c9c07dc0d786`. Artifact archive `tmp/r9-diagnostic-results/run42087148352.zip` independently hashes to `1b34f3a662b49ed7fea22e2bd2f2a68a066bfafdcddcc297490e16686d586e1c`. Extracted `report.json` is byte-identical to its `r9-reader-runtime-probe.json` entry; SHA256 `d2ad9ba5fbf84c1198209525a2a433039a1318cac1e21e31c194ca4bf3525c5c`. GitHub digest matching is supplied acquisition provenance; local archive bytes/entry identity were independently checked here.

Raw plain Color artifact digest `e5178af69a5357026f54eecab1ce954fd6b1c751048b085a4ea689235d8c44fb`; Color fingerprint `985ca46ab97b36c59ae9b1491daee3788debda6eaf125ff11c645702b880aa4f`; base engine `c09e0fe18a1f9ce5f5ab59ab6ac1ea80a0736e213a4e41d769f1f2c0a89a1f97`. Script hash `3c676a232d326af94ad33461fe5b4f138395df972d0132acf99438ca95c2df2a`; `fullGate:false`, overall failed.

Report accounting: **28 planned cases = 16 pass, 2 fail, 10 not-observed**. Both normal-motion widths failed cycle 1 `footer-next` in the existing 10000ms `settled()` wait; later Back/cycle 2 rows remain unobserved. Both no-JS contexts passed their three bounded reader/native-link/console cases. Normal reader/viewer and initial Writing→article→Back observations passed; neither supplies completion of the later footer path. Both normal contexts have zero recorded page errors, console errors and request failures.

## Concrete source defect and mechanism

**Medium functional blocker, AC05/10/11 and the required repeated normal-motion journey.** `site/effects/flight.cjs:164` assigns the real clickable footer anchor `hint.href = '?view=' + route` in every rendition. In this run its actual href is `http://127.0.0.1:36395/writing.html?view=talks`; DOM primary route order independently identifies Talks as Writing's next route.

`site/engine/navigation.js:275–306` interprets the `view` query only for `embedded` offline documents. The ordinary hosted branch identifies the pathname, so this URL selects **writing**, not Talks. The click handler's `next === page` branch at1227–1242 then prevents native navigation, pushes the changed query, dispatches the same-page popstate and restores scroll0. It does not invoke cross-document `navigate`, departure or the camera journey.

The actual trace agrees exactly:

| Width | Successful actual footer click | Observed post-click state |
| --- | --- | --- |
|1440×900|`trace.trace` call `call@350`, start18143.242ms/end18257.097ms; normal visible/enabled/stable click, no click error|URL becomes `writing.html?view=talks`; final snapshot still `BODY[data-page=writing]`, scene `data-route=writing`, `data-travel=settled`|
|390×844|call `call@711`, start41007.878ms/end41070.926ms; normal click completed, no click error|Same URL/body/scene mismatch through the final snapshot at51236.09ms|

The inspected390 failure PNG visibly shows the top of Writing, consistent with the same-page scroll reset. The trace's final document state contradicts the intended Talks destination; increasing the wait cannot correct the URL owner.

Each raw context retains exactly four block records: departure/arrival for navigation1 (Writing→article), then departure/arrival for navigation2 (Back). All four completed by `animationend`. There is **no navigation3 plan or footer-click block phase**. Thus this actual failure occurs before a new route animation, not because an animation consumed the10000ms wait.

Independent bounded source-function probe extracted the actual unmodified `routeFor` function and evaluated it with hosted/embedded contexts: hosted `writing.html?view=talks → writing`, hosted `talks.html → talks`, embedded `writing.html?view=talks → talks`. The initial probe omitted the VM's `URL` global and failed with a probe-only ReferenceError; after supplying that standard dependency, these results were obtained without browser execution or source change.

This footer assignment is byte-identical in protected base `8cf15883125892710633b17133d9ee0fc4b23b92`; `flight.cjs` has no PR delta. The relevant hosted routing distinction also predates the new scroll-entry self-box change. This is a pre-existing hosted/offline URL mismatch uncovered by the new actual journey, not a demonstrated regression introduced by that self-box fix.

## What the native events actually establish

The raw context events do contain genuine `A.scroll-continue[data-route-layer=self]` start/end pairs during the earlier card departure and Back arrival, with positive 700ms CSS duration and `elapsedTime:0.7`:

- 1440: node 26 departure start 1195.2/end 1886.0ms; node 44 arrival start 15094.2/end 15785.6ms.
- 390: node 23 departure start 934.4/end 1633.4ms; node 36 arrival start 9100.4/end 9799.7ms.

Those events support the bounded fact that the actual self box animates on those observed initial legs. They must not be attached to the later failed footer click: no new departure events followed that activation. Repeated footer navigation, its Back restoration, second cycles and their complete CSS-event oracles remain unobserved.

## Recommended next bounded treatment

Keep this failed run/archive and unchanged deadline/oracles. Correct the footer URL at its canonical effect/navigation ownership boundary so hosted anchor hrefs resolve to the actual next route while embedded offline URLs retain their supported query semantics. Preserve native link behavior, base paths/query/fragment handling, modifier/open-in-new-tab behavior and the existing gesture `SiteNavigation.go` path; do not make all hosted routes globally reinterpret arbitrary `view` queries merely to accommodate this one wrong href.

Add/review a focused hosted+embedded URL/click regression through existing navigation/effect tests, including a previously restored Writing footer and actual Talks selection. Then regenerate exact runtime/artifact identities and perform affected independent review before a newly source-bound bounded diagnostic. Do not rerun this unchanged failed campaign, raise the settlement timeout, replace the click with direct navigation, or bypass the unknown-family/rights guard. This analysis proposes no accepted implementation and performs none.

Scope limits: raw report, source, internal trace JSON and one retained failure screenshot inspected; no live host/browser, physical device, performance, release/rights or new full-matrix result. Normal trace ZIP SHA256:1440 `932bc7e521d400f3815a19f9495005e3ca10fce57e117a10feeadbf163a6bdaa`;390 `5ed60c24e5b7fc93c5e725e4fccff8046981bcdd6d44b896ad4e40d9d2b9e734`. Source SHA256: flight `acbff67f63dc19a33f9aa92bcd486f2abcfbeec280e2955688fd53f4b5d3adae`; navigation `d5aad6583d06b68a08664cc54421446d1492ab46f35d249bb9536a7f2658f64d`; scroll-entry `268ed2aed873105d229f54b146f34b5f1fd3c40cad8d83759cc0aa1635619b4d`.
