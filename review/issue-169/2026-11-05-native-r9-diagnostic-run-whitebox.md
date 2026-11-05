# White-box diagnosis — actual R9 diagnostic42087148352

Refs #169 / PR170. 5 November2026. Reviewer `/root/native_r9_whitebox`, same-role continuation. Independently inspected retained actual report/Playwright traces, one failure screenshot and current exact source; no peer review output, implementation, external call, new browser run or unchanged rerun. This is failure diagnosis, not runtime-family or release admission.

## Exact evidence and source

Local currentHEAD`3c532d2f23e9568e5d88b9b50139d45a4867829e`, tree`35b45f7b442a771fe646844cfec8c9c07dc0d786`; initial worktree clean. Report names the same source/candidate/tree, cleanstart and coherent workflowSHA/GITHUBSHA/input/HEAD. Run`42087148352`,attempt1,Ubuntu24/Linuxx64,Nodev24.19.0. ScriptSHA256`3c676a232d326af94ad33461fe5b4f138395df972d0132acf99438ca95c2df2a`; workflowSHA256`1e2aaeef31c626e70e10cacca304e10171cc6e4bde5a71a4cdbd9f115bfaa19d`.

Supplied archive `/workspace/scratch/83aaf5811f83/tmp/r9-diagnostic-results/run42087148352.zip` independently recomputedSHA256`1b34f3a662b49ed7fea22e2bd2f2a68a066bfafdcddcc297490e16686d586e1c`. Extracted `report.json` SHA256`d2ad9ba5fbf84c1198209525a2a433039a1318cac1e21e31c194ca4bf3525c5c` is byte-identical to archive member`r9-reader-runtime-probe.json`. Both normal traces were opened directly from nestedZIP bytes; no trace browser or new browser session was used.

Reported exact publicartifactdigest`e5178af69a5357026f54eecab1ce954fd6b1c751048b085a4ea689235d8c44fb`; Colorfingerprint`985ca46ab97b36c59ae9b1491daee3788debda6eaf125ff11c645702b880aa4f`,baseengine`c09e0fe18a1f9ce5f5ab59ab6ac1ea80a0736e213a4e41d769f1f2c0a89a1f97`. Reportpassfalse/fullGatefalse,elapsed58530ms. Final fatalassertion is `Every planned context completed`; both earlier footer failures remain individually retained.

Source inspected: `site/effects/flight.cjs` SHA256`acbff67f63dc19a33f9aa92bcd486f2abcfbeec280e2955688fd53f4b5d3adae`; `site/engine/navigation.js` SHA256`d5aad6583d06b68a08664cc54421446d1492ab46f35d249bb9536a7f2658f64d`; exact diagnostic script and history observation helper. No claim that these bytes were newly introduced byR9: this is an actual product behavior exposed by its integration journey.

## High finding WB-RUN01 — footer emits a destination in the wrong URL namespace

The native footerNext click succeeds, but cannot start the intended Writing→Talks route. `site/effects/flight.cjs:149–166`, `updateHint()`, unconditionally sets `hint.href='?view='+route`. On a native Writingdocument this resolves to`writing.html?view=talks`.

`site/engine/navigation.js:274–306`, `routeFor()`, interprets query`view` only for an embedded/offlinepayload. For an ordinary native document it resolves article/pathname;`writing.html?view=talks` therefore resolves toWriting. The generic click handler at1205–1243 enters its `next===page` branch: updates thequery/history, dispatches selfpopstate and restores scroll0 rather than invoking the newroute flight. This explains the actual querychange, unchangedWritingbody/scene and complete absence of navigationId3/routeblock/native animation events. It is a producer/consumer routeURL mismatch, not evidence of a slow or missing footer CSS animation.

Actual retained evidence:

| Width | Actual footer target/click | Actual failure and retained route |
| --- | --- | --- |
| 1440×900 | href`http://127.0.0.1:36395/writing.html?view=talks`;trace`call@350` successfully clicks visible/enabled/stable actualanchor at18143.242–18257.097ms | `call@352`settledwait times out after10000ms at28293.417ms;lastsnapshotURLcontainsquery but bodydata-pageWriting,scene routeWriting/travelsettled |
| 390×844 | samehref;trace`call@711` successfully clicks actualanchor at41007.878–41070.926ms | `call@713`settledwait times out after10000ms at51080.313ms;lastsnapshot has the sameWritingquery/body/settledscene |

The mobilefailurePNG was visually inspected: it shows Writingselected and the Writingoverview after selfnavigation, consistent with source scroll0. There are no pageerrors, consoleerrors or requestfailures in either normalcontext; no missing-network/overlaidclick evidence was found. Both traces log a completed actual click, so “the click did not fire” is contradicted. All captured flight telemetry belongs to navigation1(Writing→R9) and2(R9→Writing); no thirdflight exists after footerNext.

Treatment: correct the existing footerlink producer to use the same destination semantics as its actual native/embedded navigation environment. Preserve normal nativepath/query/hash handling and embeddedoffline `?view` semantics; do not broaden native queryrouting merely to mask this producer error without independently examining the existing contract. Add a bounded native+embedded route-target regression under the existing effect/navigation owners, independently review the changed runtime and test, regenerate exactdependent output/fingerprints and run only the changed-source justified diagnostic. Preserve this failedrun. Do not replace the actualanchor click with programmatic`SiteNavigation.go()` in the acceptance journey, disablemotion, raise thewait or rerun these unchangedbytes.

Affected AC05/10/11: native footer controls must reach their realdestination; the required repeated normaljourney has not completed. AC07–09 retain their successful bounded observations but wholecriteria/release are not accepted by this report. Runtimefamily admission and downstreamfullgates remainblocked.

## Footer animation evidence: what actually happened

The actual footerbox already participated in the successful first Writing→R9 departure and R9→Writing arrival:

| Width | Nativefooter departure | Nativefooter arrival onBack |
| --- | --- | --- |
| 1440 | node26,start1195.2ms/end1886.0ms;route-block-depart,layerSelf,elapsed0.7s | node44,start15094.2ms/end15785.6ms;route-block-arrive,layerSelf,elapsed0.7s |
| 390 | node23,start934.4ms/end1633.4ms;route-block-depart,layerSelf,elapsed0.7s | node36,start9100.4ms/end9799.7ms;route-block-arrive,layerSelf,elapsed0.7s |

Allfour normal initial routeblock phases perwidth report completedByanimationend. Thus the retained run contains positive actual native CSSselfbox evidence on those two completedlegs. It does **not** contain the requested footerNextdeparture or secondcycle. No conclusion that the repeatedfooter animation is correct/incorrect may be inferred from an action that never entered thatroute.

The diagnostic oracle correctly fails the missingTalksdestination. Its label/target derivation read thequery and expectedTalks, which exposes the defect but did not itself check how `routeFor` would classify thathref. A useful targeted regression should assert nativeanchor target resolution beforeclick as well as the actual completedroute; retain the current actualjourney and animationstart/end requirements.

## Independent bounded structural reproduction

Read the actual `routeFor` function from the inspected source and evaluated it in an in-memoryVM with a nativeWritingentry, declaredprimaryroutes, noarticles and isolated native/embedded namespacefixtures. No source/output mutation or browser was involved. Actual results:

```json
{"case":"native-query","route":"writing"}
{"case":"native-path","route":"talks"}
{"case":"embedded-query","route":"talks"}
```

Nativequeryinput was`?view=talks`;nativepathinput`talks.html`;embeddedinput was the samequery with a finite embeddedfiles/payload declaration. This directly reproduces the source-consumer mismatch observed in thetrace. It is not end-to-end fixverification or a newly authored accepted repositorytest.

## Complete partial accounting and acceptance limits

The retained28caserows contain16pass,2fail,10not-observed. Both normalcontexts fail; bothnoJScontexts pass. The16plannednormalroutelegs divide into4passed(first Writing→R9 andBack at eachwidth),2failed(first footerNext at eachwidth),10not-observed. At eachwidth, footerBack incycle1 and allfourcycle2legs remainnot-observed. The remaining12passedcases are normalreader/viewer/console andnoJSreader/native-links/console at twowidths.

The completed firstBack restored actualWritingURL,focus andscroll exactly:1440scroll7246;390scroll12601. Four readercases(normal/noJS atbothwidths) each reportfiveacceptedfigures and exactPDFSHA256`75e052d6a5c386ae79cb1a51d59cdf42e53d3a7279bf0db31c227ee145bb18b4`. BothnoJSnative-link journeys passed their finitechecks. These are source-bound retained observations, not a fullnative/device/hosted/PDFvisual acceptance. Only the mobilefailurePNG was newly visually inspected for this diagnosis; report assertions are not a new humanreadability review.

`evidenceErrors` is empty and all28plannedcaseIDs remainpresent. After the failedcontextaggregateassertion, the script never reached finalPublicBytesVerified or endworktreeclean checks; worktree records only cleanstart. Do not infer those endinvariants from earlierpublicverification or a finalfinishedAt timestamp. The report retains failedstates correctly; screenshot/traceupload is diagnostic evidence, not success.

**Verdict: actual source-bound native footer-navigation defect established; release/runtime advancement remainsblocked.** The smallest justified nextiteration is existingfooterURL correction plus native/embedded regression and affectedindependentreview, followed by an exactnewcandidate diagnostic to exercise the untouchednormalmotion start/end oracle. No unchangedrerun is warranted by this evidence.
