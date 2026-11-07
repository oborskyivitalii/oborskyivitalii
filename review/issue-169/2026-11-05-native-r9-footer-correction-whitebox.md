# White-box correction review — native footer route URLs

Refs #169 / PR170. 5 November2026. Reviewer `/root/native_r9_whitebox`, same-role continuation. Independent actualsource/test/QAoracle review; no peer report consumed, source/test authored or external action performed. Original actualfailure remains in `2026-11-05-native-r9-diagnostic-run-whitebox.md`; failedrun42087148352 is not overwritten or converted tosuccess.

## Candidate identity and scope

Current workingdelta onHEAD`3c532d2f23e9568e5d88b9b50139d45a4867829e`,tree`35b45f7b442a771fe646844cfec8c9c07dc0d786`. Dirtygeneratedoutput plus route/effect/test/QA changes; this is not cleanheadadmission. Exact reviewedSHA256:

| Path | SHA256 |
| --- | --- |
| site/engine/navigation.js | 4cfcea740368dfcf9b19f189ccedd93b676df0383f7e29bed1c801b10dc82d24 |
| site/effects/flight.cjs | 3d05d1f26c3f6c791f2ef8777cb523af17ee5b4d7b502020c01d3c61c86bcb47 |
| tests/navigation.test.cjs | d35f065159d3b446b017d737dc41f491af237355b2b39b198c7e0be96479aece |
| review/issue-169/r9/reader-runtime-probe.cjs | 80b1d00181ae4cc3fd7ce66346be39170247ca38ffa87a455206668a52e1cb7d |
| tools/quality/test-profiles.json | 70418aea5188cc34dd589c5804369591421bac80784044b7b28172207fb9f005 |
| tools/quality/color-motion-contract.cjs | 592b143d2b5b1c1c9309ef21e0ec075e3633eef28c9e09d497b0c621f3928cdc |

Generatedoutput/RI is being finalized outside this role. No generatedbytes, current cleanbuild, Colorfamily or completednewdiagnostic are accepted here. Runtime registry unchanged by this revieweddelta.

## Structural treatment and independent oracles

`navigation.js` introduces private `routeHref(next)`: refuses destinations outside existingroutes, constructs canonical site-directory/nativepath or existingembeddedfileURL, then delegates to existing `address()` for the proper native/embedded namespace. Public `SiteNavigation.href` exposes that oneowner. Existing `go()` now delegates to the samehelper; its unchanged primaryroute/request/transition guards still apply. `flight.installEndScroll()` requires this API and obtains the hintURL from it. There is no broadened native`view`query interpretation or secondURLbuilder.

| Risk / AC | Independent expected behavior | Actual source/check |
| --- | --- | --- |
| Actualwrongnativequery / AC05/10 | NativefooterTalks resolves toTalksdocument, neverWritingwithaquery | New helper/effect boundary reproduces oldfailure and selects canonicalTalksURL with newproducer |
| Project/snapshotentry / AC05/10 | Canonical target uses declaredsite-directory, not snapshot subdirectory | New regression executes actual functions for `/project/snapshots/abc/writing.html` with `/project/`base;newtarget `/project/talks.html` |
| Offlinecompatibility / AC05/10 | Embeddedfooter remains in onefile with`view=talks`; router agrees | Actualhelper/address/routeFor and effectboundary fixture preserve old/new embedded destination |
| Invaliddestination / AC05/11 | Undeclaredroute cannot become arbitraryexternalhref | Existing finite routeallowlist; newfixture asserts invalid externalinput returnsnull |
| Sequencing/cancellation / AC05/11 | Direction, staleownership, motion-off and readerBack behavior retain guards | Five existing targeted lifecycle/native-resource cases passed beside newfooterregression |
| Regressionselection / AC05/11 | Flight-only futureedit selects new navigation regression | Initialmissingdependency found and corrected; actualselector confirms flight-only change selects navigationtest |
| QAoracle / AC05/10/11 | Expectedsemanticdestination independent of brokenhref; actualclick/nativeCSSstart+end still required | Correcteddiagnostic derives next from currentpage+primaryroutes and checks preparedroute/nativealias/sitebase;rejectsviewquery/hash or wrongcanonicalURLbeforeclick; same28cases/4contexts/240seconds |

The QA correction strengthens the oracle instead of bypassing the realanchor. Actual click, nativefooter selfbox start/end with positiveCSSduration, routearrival and Backrestoration remain unchanged. It does not use the new `SiteNavigation.href` output as its ownexpectedURL, which preserves independent faultdetection.

## Actual focused execution and refusal evidence

`node --test --test-name-pattern='footer links share native|verified snapshot resources regain native|reader documents fly|forward and reverse navigation wait|stale departure or arrival|motion disabled during departure' tests/navigation.test.cjs` — exit0;6tests/pass6/fail0/cancelled0/skipped0/todo0;114.415931ms. Newregression imports actualeffectfunction and extracts actualrouter/address/helperfunctions, then checks allfive routes at root/project/embedded contexts and the producedhintboundary. Existinglifecycle cases retain source-level integration protection; this is not realbrowsernavigation.

Inspected explicitly supplied rawfirstfixturefailure `../tmp/r9-footer-route-tests.log`: newregression initially expectedWriting from a snapshot-relative oldquery and gotnull; failedaccounting remained1failure. Changing that negativecase to canonical `writing.html?view=talks` correctly models the actual observedoldrun. This is a fixturecorrection, not productevidence that a failingroutebecameworking. The sourcefix itself must still satisfy the positiveTalksdestination.

Independent in-memoryoldproducer/newproducer comparison used actual oldflight bytes fromHEAD, currentflightfunction and currentrouter/address/helper. The first reviewerdiagnostic made the same over-specific “oldnestedquerymustbeWriting” assumption and stopped at actualnull for the snapshotentry after rootcases. That observation was preserved here; expectedoldbehavior was corrected to the relevantsemanticoracle “mustnotselectTalks,” rather than changing anyproductcode. The bounded corrected comparison exited0 with:

| Context | Oldproducer resolvedroute | Newproducer URL / route |
| --- | --- | --- |
| NativerootWriting | Writing | `https://fixture.invalid/talks.html` / Talks |
| ProjectsnapshotWriting | null | `https://fixture.invalid/project/talks.html` / Talks |
| EmbeddedColorfile | Talks | `file:///review/Color.html?view=talks` / Talks |

These6controlledobservations demonstrate detection of the actual oldnativefault and unchangedembeddedsemantics. They are not a browserfixpass. `node --check review/issue-169/r9/reader-runtime-probe.cjs` also returnedexit0.

**Allocationfindingresolved duringreview.** Newnavigationtest now imports `site/effects/flight.cjs`; its registryrow initially omitted thatdependency. Implementer added the explicitpath to existing`inputs`, preservingPRtargeted/staging/productionroutes. Actual`source.select(root,'pr',{changedPaths:['site/effects/flight.cjs']})` exited0 and returned `navigationRegressionSelected:true`,totalSelectedModules11. This is selectionverification, not execution of those11modules. The registry's separate Unicodeescape-to-character reformat has no changedparsedmeaning.

## Pre-trigger conclusion

**No remaining scopedWhite-box blocker to the corrected boundeddiagnostic on a newcoherentcommittedcandidate.** The sourcefix matches the observed URLproducer/consumerfailure; newtests fail the relevant oldnativebehavior and preserveofflinecompatibility. The newQAoracle rejects the malformedhref before it can waitpointlessly for aTalksroute. Required current-sourcegeneration/RI/style/checks, otherrole receipts and cleanworkflow/script/candidatebinding remain separateprerequisites.

Only an actualnewcandidate run can establish successful footerNext/Back, secondcycles, actualnativeCSSobservations and finalsource/publicimmutability. WB-RUN01 is structurallytreated, not yet closed as a livebrowserdefect. Runtimefamilyreview/admission and fullhosted/staging/productiongates remainblocked. Preserve42087148352 and its16pass/2fail/10not-observed accounting; do not rerun unchangedsource or weakenmotion/deadline/assertions.
