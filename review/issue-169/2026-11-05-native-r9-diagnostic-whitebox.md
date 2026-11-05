# White-box QA — R9 bounded browser diagnostic

Refs #169 / PR170. 5 November2026. Reviewer `/root/native_r9_whitebox`, correction continuation of the same role context; not a fresh-context launch. This is pre-trigger source/oracle review, not browser execution, runtime admission or full acceptance. No peer verdicts were read. The explicitly assigned Requirements preflight is the requirements/oracle input, not execution proof.

Source: `/workspace/scratch/83aaf5811f83/release-repo`, HEAD`fb5b68e35d5f4787e2f92625ec9d34440736bc29`, tree`730109cb6914433dfb94fd0ce4e95451dc714125`, local origin/main`8cf15883125892710633b17133d9ee0fc4b23b92`. Diagnostic workflow/docs/test/script are a dirty working delta. Script did not exist at initial inventory, appeared during review and continued changing. No clean coherent diagnostic head is yet accepted here. Source/hash changes after this judgment require affected readback. Runtime selector and footer source have no diff fromfb5.

## First judgment preserved before correction

Reviewed initial script882lines, SHA256`c57b00fc1dff3ddc7d997726a7430a6a78c53297eeddf139d3af519310b73392` (29648bytes at sampled identity); workflow SHA256`a2e10352eb664eb59173b96cf873c2b62d4dfe45258ee03987c90a5fa0c2766b` (2691bytes). Latest readback before writing already differs: script`4c251a1769549f9b8768565f457f06f5fdaf0ab537a95d192885a0988663cb66`(29786bytes); workflow`1e2aaeef31c626e70e10cacca304e10171cc6e4bde5a71a4cdbd9f115bfaa19d`(2752bytes). Findings below describe initially inspected branches; later correction disposition must remain separate.

**Pre-trigger request corrections to oracle/partial-evidence gaps.** Actual start/end/self-box checking is substantive, while these incomplete assertions do not yet satisfy the assigned preflight contract:

1. **Medium, WB-DIAG01 — exact figure/text oracle is incomplete.** Initial `reader()` around356–422 requires5figures, nonempty alt/caption, positive decoded dimensions, viewport fit and asset membership in the descriptor. It does not compare ordered asset identities, exact accepted caption/alt or exact visible title to the accepted publication metadata. Wrong order or substituted nonempty alt/caption can satisfy its local assertions. Treatment: use the accepted immutable publication record as oracle for ordered figures/alt/captions/title and compare actual DOM; retain served hash and decoded geometry assertions. AC07/08. This is a test-oracle gap, not an observed product defect.
2. **Medium, WB-DIAG02 — Back restoration is not checked.** Initial repeated cycles use actual `page.goBack()` and require route telemetry, animationend and body readiness, but never capture/assert the pre-entry Writing scroll position after each Back. Footer destination is observed then transition target is hardcodedTalks without asserting that observed source/DOM href maps to that destination. Treatment: record pre-action scroll/source route identity and assert Writing restoration within a justified geometry tolerance; derive/validate expected footer destination against the manifest/DOM and bound that finite route. AC05/10.
3. **Medium, WB-DIAG03 — partial cases can disappear.** `runCase()` appends only attempted rows; normal cycles `break` on failure, setup/context exceptions occur before those calls, and watchdog exits after saving without materializing all unexecuted cases. The final success conditions do refuse missing transition rows, so missing cases do not become a green complete run. However failed reports lack the required explicit failed/blocked/not-observed state for every planned case/context. Outer context exception records an error without attempting a screenshot. Treatment: predeclare the complete4context/16route-leg plus reader/viewer/console case inventory; finalize running rows on error/deadline and remaining rows as not-observed/blocked with reason; retain bounded failure screenshot where a page exists. AC05/11.
4. **Medium, WB-DIAG04 — network failures are only retained.** `requestFailures` is collected but not evaluated by any case/final invariant; only pageerror/console errors are rejected. Treat owned-origin failures as blocking or explicitly justify a narrow expected collector-isolation exception; record external resource attempts separately. Do not ignore arbitrary request failures. AC05/08/11.
5. **Low, WB-DIAG05 — upload evidence initially ambiguous across attempts.** Initial upload name used runid only and lacked`if-no-files-found:error`. Latest workflow readback now includes runid+attempt and explicit missing-file error, so those two source-level issues are **resolved on readback**. Setup/build failure may still precede diagnostic script report creation: the browser action retains its own setup receipt, workflow logs remain evidence, and absent reader report must stay explicitly missing/failed. No claim that upload alone proves successful diagnostic execution. AC05/11.

## Examined risks and current strengths

| Risk / AC | Scenario and independent oracle | Actual reviewed implementation/check |
| --- | --- | --- |
| Identity / AC05/11 | Input40hex, workflowdispatch SHA=input=actual checkoutHEAD; clean source before artifact build; new harness head actually tested | Shell validates allthree plus clean porcelain; artifact builder records actual commit/tree and rejects dirtyCI; script checks manifest source against currentHEAD/tree and declaredR9 edition. No external trigger performed. |
| Footer stale ink / AC05/10 | Actual same `.scroll-continue[data-route-layer=self]` anchor emits native route-block-depart start and end, positive duration/keyframes, no cancel; timeout-only lifecycle rejects | Initial script captures native events before actions, matches nodeId/name/nonpseudo target, checks self layer and duration/end order, requires exactly2block phases completed by animationend;16finite routelegs enforced before success. This is meaningful source-level oracle design, not observed CSS events. |
| Matrix/deadline / AC05/11 | JS and noJS1440/390; two4leg cycles perJSwidth; bounded runtime and no retries | Script240000ms fixedwatchdog; action waits use remaining budget; context/route loops finite. Browser launch inherits30000msbound. No full performance/native/device gate implied. |
| PDF/assets / AC08/09 | Exact accepted PDF and source inventory; five decoded figures, native local targets verified | PDFSHA256fixed`75e052d6a5c386ae79cb1a51d59cdf42e53d3a7279bf0db31c227ee145bb18b4`; artifact verified before/after; local linked bytes checked; no thirdparty research fetch; exact visual text gap above remains. |
| Browser supply / AC05/11 | Wrong/missing engine, skipped/ignored restore, unauthorized source or tampered bytes must refuse | Archive suite12/12 independently passed; existing pinned composite retains failure receipts; UbuntuChromium mapping intentional and read-only tenminute manual job preserved. |
| Nonadmission / AC05/11 | Unknown family remains refused by release path; diagnostic only obtains evidence | ScriptfullGatefalse, no Color family selector or registry change; rawColorbuild uses structural artifact/snapshot checks. RegistrySHAunchanged`592b143d2b5b1c1c9309ef21e0ec075e3633eef28c9e09d497b0c621f3928cdc`. |

## Actual bounded checks

1. `python3 -m unittest discover -s tests -p 'test_browser_archives.py' -v` — exit0,12tests,0failures/errors,0.073s. Actual classes:9archive integrity/origin/restore tests and3complete consumer-wiring tests. Negative cases include wrong/missing engine; missing/skipped restore; actions permission loss; ignored setup failure; consumerCDN install; wrong payload/executable/path; origin actor/workflow/source/expiry/digest; package/manifest substitution; HTML setup failure; symlink escape. No browser downloaded or launched by this suite.
2. `node --check review/issue-169/r9/reader-runtime-probe.cjs` — exit0 on sampled script bytes. Syntax success supplies no behavioral/browser assurance.
3. Inspected actual artifact builder, Color decorator, shared analytics isolation, common browser options/environment and archive action. No modified product source or tests authored; only this assigned report written. No dependency installation, full suite, trigger or external write.

Stable sampled ancillary hashes: Requirements preflight`9da44d5d48df1e804a2b9d1a2ccd99e69b07a8d6e6c3df32a963a80bc98d8b92`; browser archive action`c8654276397cdb7d6396a33e8dd2fade5c3d838690c39b38346d1e76dd68703e`; archive tests`977e30a4f7d268a64d0e28cbdabe3a435af24db2e3458f7d39cd71757b4016f5`; guide`73635af3faacd7919bc6a2dab7a78e34f68a96c9b180e7a9cfab7f61e2444d20`.

Useful correction tests belong in the existing browser/archive workflow mapping suite or bounded diagnostic QA script route, not a new release lane. A deterministic extracted report/oracle check can exercise wrong title/order/caption, missing rows, timeout/deadline and owned-resource failure without a whole browser matrix; a different nonauthor must review newly authored tests. Actual browser evidence must still come from the exact coherent diagnostic commit and retained raw results. RI/CI coupling currently contains the former workflow digest; rebuild/verify actual owners after indexed edits before clean-head admission. No measured code coverage or provider isolation attestation is claimed.


## Corrected script independent readback — pre-trigger conclusion

After preserving the first judgment above, inspected the actual corrected script SHA256`14476427fb4939375a84b67bd851520443cd647217b0593f229f0ec9f0900517` and unchanged corrected workflowSHA256`1e2aaeef31c626e70e10cacca304e10171cc6e4bde5a71a4cdbd9f115bfaa19d`. Exact hashes were rechecked after the focused diagnostic. Archive test bytes remain`977e30a4f7d268a64d0e28cbdabe3a435af24db2e3458f7d39cd71757b4016f5`; their independent12/12 result is reused only for these unchanged bytes. No current peer review result was read; the script author's correction notification identified source to inspect, not a verdict to adopt.

WB-DIAG01 resolved: publicationJSON oracle is fixed toSHA256`ff892d06cb309353d92360be0a47f3454869288f2fc57f29f6443cfadeadd26c`, independently matched to actual source bytes. Current reader checks exact figure IDs/order, alt/caption, accepted dimensions, visibleh1 and documenttitle, plus served inventory hashes and decoded geometry. Five accepted asset records are hero, delivery-capacity-r6, review-learning-r7, comprehension-gap-r7 and asymmetry. This protects the reviewed source comparison; semantic author acceptance remains the preexisting external decision.

WB-DIAG02 resolved: actual click-boundary state is captured by the existing history diagnostic, whose listener stores scroll/focus primitives before navigation cancellation. Both articleBack and footerBack wait for and assert scroll within2CSSpixels, activationfocus and exact pre-entry WritingURL. Footer target is now read from its actualhref, checked against the native exported primaryRoutes successor and exact manifest route membership. `SiteNavigation.primaryRoutes` was independently located in the native exported API.

WB-DIAG03 resolved for diagnostic partial accounting: current script predeclares28caseIDs and4contextrows as not-observed; runCase permits one execution per ID and saves transitions/exceptionstate. Outer failures attempt a bounded screenshot when a page exists. Final success requires every context/case passed. Watchdog keeps passfalse and lists unfinished IDs under `notObserved`; a row interrupted during the process kill can still have state`running`, so raw interruption details must be interpreted with that explicit notObserved/deadline flag and cannot count as a pass. This remaining interrupted-state representation does not permit successful completion or hide missing IDs.

WB-DIAG04 resolved: every requestfailure is retained, and final context assertion rejects every unexplained failure except the exact existing collectorURL predicate. Shared isolation installs that collector abort before navigation and records its own failures; arbitrary failed application requests no longer pass silently. NoJS now performs three actual native link journeys and browserBack, verifying source-bound response bytes/page identity each time. External research links remain unvisited.

WB-DIAG05 remains resolved: attempt-specific upload name and explicit missing-file error present. The script now records relevant lock/output/archive digests, exact archive receipt hash/full receipt, selected pinned archive record and its browser identity; verifies successful nonlaunching receipt, artifact/uploaddigest, Chromiumselection, storagepath, package/registry/browserclosure and actual launchedversion. Read-only tenminute workflow and240second diagnostic bound remain; no runtime-family admission path was introduced.

### Additional actual controlled checks

`node --check review/issue-169/r9/reader-runtime-probe.cjs` returnedexit0 on the correctedhash. A separate in-memoryVM read the exact script prefix before its watchdog/main invocation and exposed only transition/runCase/report functions. It did not write source/tests/reports, start the loopback server or launch a browser. Filesystem report writes were stubbed; shared flight-validator telemetry was stubbed as already-valid so the observation specifically tests the script's native-footer assertions, not flight validation itself. Controlledpage observations yielded:

```json
{"case":"valid","accepted":true}
{"case":"missing-start","accepted":false,"error":"Footer actual-box CSS animationstart must be observed once"}
{"case":"missing-end","accepted":false,"error":"Same footer box must emit animationend"}
{"case":"nonself","accepted":false,"error":"Footer animates its actual anchor box"}
{"case":"cancelled","accepted":false,"error":"Footer animation was not cancelled"}
{"case":"zero-duration","accepted":false,"error":"Actual footer CSS keyframes and positive duration"}
{"plannedCases":28,"contexts":4,"allInitiallyNotObserved":true}
{"case":"partial-failure","state":"fail","remainingNotObserved":27}
```

The positive fixture supplied one actual-box-shaped start plus matching laterend; missingstart, missingend, wronglayer, cancellation andzeroCSSduration were independently rejected. An injected runCase exception becamefail while all27remaining plannedcases stayed explicitlynot-observed. This is eight bounded validator/accounting observations, not actual browser-delivered events, browser coverage or product acceptance. The VM deliberately avoids duplicating the fullmatrix.

**Final scoped verdict: the corrected workflow/script have no remaining pre-trigger White-box blocker within this bounded diagnostic review.** Proceed only on a new coherent committedhead after current-source RI/CI and required role receipts; require workflowdispatchSHA=input=checkoutHEAD and report that new source/tree as tested. This report does not accept oldfb5as the harness executionhead. Actual browser run, raw nativeevents/screenshots/console and partialcase accounting must be inspected before any runtime-family conclusion. Current unknownfamily refusal, fullnative/hosted/staging/production gates and physicaldevice limits remain unchanged. No browserpass or releaseadmission is claimed here.


## Final source/environment binding delta

Independently inspected finalscriptSHA256`3c676a232d326af94ad33461fe5b4f138395df972d0132acf99438ca95c2df2a`; syntaxcheckexit0. The affected additions record actualcontextinnerwidth/height,DPR,colorpreferences,root/bodythemeattributes in bothnormal andnoJS afterload. Assertions enforce selected1440/390width and900/844height,positiveDPR and no-preference motion. These are actualmetadata observations to collect, not assumptions or browser results from this source review.

The script now refuses dirtyworktree directly before observations and requires exact40hex `GITHUB_WORKFLOW_SHA`, `GITHUB_SHA`, `SITE_CANDIDATE_SHA`, each equal actualcheckoutHEAD. Workflowref must identify this repository and exactharnesspath. It reads the committed workflowGitblob and requires actualfilebytes to match. Endchecks refuse dirtysource, changedHEAD or changedworkflowbytes. Productsource/Colorregistry and casecount/matrix/budget remain unchanged. Newhead still must be committed before the actualdiagnostic; currentdirtyfb5is intentionally refused.

Actual negativeexecution was explicitly authorized by the orchestrator with reportdirectory outside the repository. `SITE_REPORT_DIR=/tmp/issue169-whitebox-r9-dirty-probe node review/issue-169/r9/reader-runtime-probe.cjs` produced the expected prebrowser dirtysourceassertion and a saved partialreport: passfalse,fullGatefalse,28cases allnot-observed,4contexts allnot-observed,notObserved28,finishedAtpresent,no browserVersion. The initial compound shell then read theJSON, so its outerexit0 belonged to readback, not the script. A follow-up targeted childprocess invocation solely captured the unresolved exitstatus: nodechildstatus1,signalnull,exact dirtysource refusal,10second outerlimit; report retained separately under`/tmp/issue169-whitebox-r9-dirty-probe-exit`. No browserlaunched or dependencyinstalled. This expected refusal is preserved evidence, not an assertionfailure retrycampaign.

Additional controlledVM checks executed the actualmain identity prefix with in-memory cleanGit/source responses and suppressed reportwrites. A deliberate sentinel stopped after identityguards before artifactread/build/browser. Valid coherentidentity reached thatsentinel. Four negativepartitions each refused before artifactread:

| Controlled input | Actual refusal |
| --- | --- |
| Missing workflowSHA | Exact workflow/source SHA is required |
| CandidateSHA differs fromHEAD | Workflow, dispatch, checkout and candidate are one coherent source |
| Wrong repository/workflowref | Workflow ref identifies this repository and harness path |
| Committedworkflowbytes differ | Executing workflow file matches exact committed harness |

These four controlledrefusals test identitybranches; mocked cleanGitresponses do not attest real cleanliness. Actualdirtyrefusal above does. No actualclean coherenthead, artifact, browserCSS or environmentmatrix execution is claimed.

**Final pre-trigger conclusion applies toscript`3c676a…` andworkflow`1e2aae…`: no remaining scopedWhite-box blocker to the bounded diagnostic after newcoherenthead/currentRI and requiredrole receipts.** Source/oraclecorrections and meaningfulnegativeguards reviewed here are satisfied. Browserobservations, runtimefamily review and all actualreleasegates remain pending; diagnosticgreen cannot supply them. Preserve precedingfirstjudgment/corrections and all expectedrefusals.
