# White-box actual corrected run and runtime-admission oracles

Refs #169 / PR170. 5 November2026. Reviewer `/root/native_r9_whitebox`, same-role continuation. Independently inspected supplied actualdiagnostic/staging records, rawjoblogs, nestedtrace resources, currentexactsource and currentguards. No peerresults read, source/test implementation, browser rerun or externalcalls. Actual productdiagnostic success and runtime-policy admission remain separate conclusions.

## Exact source and retained evidence

HEAD`e92de9bb5e3e4bcd80c4207457732808d2d67015`,tree`626278d38d4d0592663646ae0eeb0b7b68e3eed3`,initiallocalworktreeclean. Correctedrun`42090631531`,attempt1. Workflow/source/input/checkoutSHA allnamee92de9; recordedtree matcheslocaltree; scriptSHA`80b1d00181ae4cc3fd7ce66346be39170247ca38ffa87a455206668a52e1cb7d`; workflowSHA`1e2aaeef31c626e70e10cacca304e10171cc6e4bde5a71a4cdbd9f115bfaa19d`.

Supplieddirectory `/workspace/scratch/83aaf5811f83/tmp/r9-corrected-results`:

| Record | Independently recomputedSHA256 / identity |
| --- | --- |
| run42090631531.zip | 7cc558318464235240b93214dee6c2c25ebdc3e6927727137a1e5b736befed0f;69902695bytes,61members |
| report.json | a33c9fc699d279ac05849c2e46563ada3f61074a6596aee0aa1b8cf9cc0c0481;byteidentical toZIPmember r9-reader-runtime-probe.json |
| input-artifact.json | bb0848e08696747d8d3989180f788955033b68ab1e21eb37978a87472547bfe6;exactlyreport.manifestSha256 |
| Plainartifactdigest | 6d46344673e8160ac66119fbb13f2057b373a13d901327d9f56a95eaf0e03513 |
| staging-artifact.json | 137bde4e295042004113a45763d9ab73a78f123e3b98902f6a4179a73b1f4215 |
| Stagingartifactdigest | 0dacf719efa438312106d47fe1eb277f164da70454b2a7d825cecb03eee0b90a |

Parsedplainrecord is data-identical to the single matching actualColorbuild record in `job.log`; reportidentity source/tree/dirty/candidate/artifact/components/generation/variant allmatchit. Parsedstagingrecord is identical to the single matching rawrecord in `staging-job.log`, frompreview`42090186353`/build`127466187590`. Stagingrecord namese92de9/sametree/dirtyfalse. Thatpreview failed later atunknownfamily: its generatedtuple is evidence, **not** a passing staginggate.

## Actual route and footer result

Report has28/28pass,4/4contextspass,0not-observed,emptypageerror/consoleerror/requestfailure/evidenceerror arrays; elapsed91018ms under unchanged240000msdeadline. `worktree.start` and`.end` areempty; `publicBytesVerified` and`finalPublicBytesVerified` aretrue. This corrects the earlierfailedrun's missingendinvariants. Source remainsfullGatefalse/localdiagnostic, nothosted/releaseacceptance.

Independently reran the existingpure `validateArticleFlight` over each of16retainedleg eventsets, using expectedWriting→article→Back→Talks→Back order/direction rather than trusting rowlabels/pass. Eachleg has exactly2routeblockphase records completedByanimationend. Allfour footerNextpairs independently satisfyactualA.scroll-continue target,selflayer,nopseudoelement,matchingnode/name,laterend,positive700msCSSkeyframes,duration0.7seconds andnocancellation:

| Width / cycle | Actualnativehref | Node | Start / end ms | Nativeelapsed |
| --- | --- | ---: | --- | --- |
| 1440 /1 | /talks.html | 44 | 15417.4 /16130.7 | 0.7s |
| 1440 /2 | /talks.html | 153 | 34099.2 /34792.2 | 0.7s |
| 390 /1 | /talks.html | 38 | 11497.6 /12196.2 | 0.7s |
| 390 /2 | /talks.html | 114 | 28147.3 /28845.5 | 0.7s |

Actualcamera itineraries advance navigationIDs1–8 independently atbothwidths; footerNext is3/7 andfooterBack4/8. Both finalnormalroutes returnWriting. ArticleBack andfooterBack retain exactWritingURL/activationfocus/scroll at7246desktop and12601mobile. Normalreader/viewer/console andnoJSreader/native-links/console also passatbothwidths. These are actualretained browserobservations, not a secondbrowserrun by thisreviewer.

Environment: LinuxChromium153.0.8010.12,viewports1440×900/390×844,DPR1,no-reduced-motion. Normalcontexts observedthemeDark; noJScontexts observedthemeLight. This is not allthemes/engines/nativeplatforms/physicaldevices/hostedheaders/performancecoverage. Preserve failedrun42087148352 alongside thissuccess.

## Browser, byte closure and client-hook verification

Recomputed serialized browserreceiptSHA`48bcd21f8c5aefb62733b5f96e138864866adc81392179805da21999347577c4` equalsreportreceiptSHA. Its selectedpinnedarchive record exactlymatches repository `browser-archives.json`, includingkey,artifact12643236386,uploaddigest`sha256:bb45664a1746bfba6756402d91bc516feade69da6b366565a1ccd0bd38a4e9ab`,packages/registry/browseridentity. Receiptpass istrue,consumerLaunches0,selectedengineChromium; actuallaunchedversion matches153.0.8010.12. Archivebytes themselves were not redownloaded; this verifies retainedreceipt and configuredorigin binding, not a new supplyfetch.

Acrossallfour nestedtraces, independentlyread14distinctowned200response bodies with retained`content._file`, recomputedSHA256 and matched exactmanifestentries. FiveactualservedHTMLdocuments additionally passed requiredclienthook counts/types/bodyroute/nav/footer/scene/metadata checks: Writingalias, R9alias+snapshot,Creditsalias,Talkssnapshot. Trace-retainedruntimebody coverage isCSS only; JSidentity was instead independently reproduced from actualpinnedsource asbelow, not misreported as tracebytes.

Executed currentbaseclient `runtime-compatibility.verify` against actualoutputlock/docs: runtimebyte/clientfingerprint verification passed forclient`72702f750f37e9cc6678b2d1181da57aa8c121293ebf70c9deae4e7aec568237`. CurrentreviewedDocumentClients doesnotyetlist727, so thatAPI'ssuccess alone doesnot establish its conditionaldocumenthookbranch. Separately invoked theactualprivate`verifyDocument` function in an in-memorymodule over all12currentbasealiases/snapshots(5routes×2 plusR9×2): allpassed. This directly verifieshookshape before adding exactcompanion membership. It doesnot claim those12basebodies equalallColortracebodies; the fiveactualColorbodies wereverifiedseparately.

Read actualColorproducer descriptors, assembleditsfiveemittedruntime strings in-memoryfromactualcurrentdocs, and independently reproducedactualplainfingerprint`9cecac55d9bfe19edb42bbfb2df7edc59bde76598e49e2dc896fd73f376077d5`,base727. Allfivecomputedhashes matchbothcanonical andimmutable paths ofactualCIinput. Stagingdescriptor was obtainedfromactualstagingowner with onlythefilesystemmutatingeditionbuilder stubbed toreturndescriptor; reproducedactualstagingfingerprint andappendedenvironmentCSS hash. Noartifact/source files werewritten by theseboundedchecks.

| Runtimefile | Plainactualcanonical+immutableSHA256 | Stagingactualcanonical+immutableSHA256 |
| --- | --- | --- |
| theme.js | 6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a | same |
| space.js | 9c12d83a6a738d80847819a7fff061910302512905f21426d0dcef876b974fec | same |
| archive.js | f7da9f6646746ec1415a5fbfc9ac7505913b0bc8a7e6551f213997bc6d381146 | same |
| navigation.js | d2cacfa7c564f5216bcc5b1beaff6131410ee651fd9b5e68f4ef5a5cbf68def0 | same |
| styles.css | 3fcf8b787fb9614c28eee584d7629174c9ee2210e5e4028b64e526f6134fd4f0 | 576619b4c7d399e0a268dc80974882e249ec0a26f7da7cbd326966eb2f2c6f7c |

Stagingactualfingerprint`1fce9ff8d1acbf867828680a0a68fa386ed8571a4828442ab9167227bffb42e0`,base727,editionexactly`{id:staging,indexable:false,analytics:false}`. Plainhasnoedition. Currentunchanged `motion.select(actualPlain)` and`motion.select(actualStaging)` each stillrefuse`unreviewed Color motion runtime`; thiscriticalguard wasactuallyexercised, not inferred.

## Minimum admission implementation and independent oracles

**The inspected bytes and actualboundedbehavior support a proposedexact plain+staging family and exactclienthookcompanion; implementation/tests/admission are notyetperformed by thisreview.** Keepalloldfamilies unchanged. Newfamily must retain existingrequiresPublicationRights:true, fixed-blocks/stationaryreader and inheritedreaderinteraction/paper/deferredmedia behaviorpolicy; only newexplicitbase/navigation/plain/staging tuples justifiedabove. Productionmustbe explicitlynull initially so itcannotinherit apredecessorproductionfingerprint viaobjectspread.

Add727onlytoexistingreviewedDocumentClients set forconditionalhookverification. Do not map727toanolderruntimeversion or broaden theonelegacyalias behavior; freshproducer/generation/sourceidentity remain separate. Existinghookandruntimehashchecks mustremainunchanged.

| Requiredpositive/negative | Independentoracle and expectedoutcome | Owner/allocation |
| --- | --- | --- |
| Actualplaingolden | FrozenactualCIinputmanifest with exactexternalreceipt/hash above mustselectthenewplainID, base727andfiveexactruntimehashes | Existingcolor-motion-contract source suite /test-profiles mappedPRstagingproduction |
| Actualstaginggolden | Frozenactualpreviewmanifest mustselectnewstagingID andexactstagingedition/CSS; dataorigin retainsfailedpreviewstatus | Sameowner; doesnotmanufacturestaginggatepass |
| Wrongbase/conflictingidentity | ChangebaseEngine in bothdeclaredvariants orengine/contract/effects; actualnewfingerprint doesnotauthorizeoldbase/malformedvariant | Existingselect deepidentityguard mustrefuse |
| Canonical/immutablebytefaults | For eachof5files removeorchange canonicalonly,immutableonlyorboth; substituteoldnav94ca…/eac2…oroldcurrentbyteclosure | Exactbyteguards mustrefuse; rehashfixturemetadatawhereapplicable so semanticbranches execute |
| Mixededition/CSS | Plainwithstagingmetadata,CSSorvariants;stagingwithplainmetadata/CSS;wrongproductionorigin/indexability;undecidedproductiontuple | Exactedition/fingerprint/bytes refuse; productionnull hasno reviewedRuntimeentry |
| Mandatoryrights | publicationRequired onactualnewplain/staging returns true; relabelingbase/knownbytes or droppingrights cannotescape | Existingtrustedfamily/rights chain; no clearancefromcandidateflags |
| Clienthooks | Actualclient727 positiveclosure plusdeleted/duplicated/wrongtyped main/canvas/theme/motion/footer/nav/scene/meta hook rejectsforaliases+snapshots | Existingruntime-compatibility andproducer-refactoringtest; updatecurrentfamilyreference while retaining allnegativebranches |
| Historicalpreservation | Everypreviousfamily/edition identity/rights requirement andexistingnegativefixture remainsdata-identical | Existinghistorical/currentcompatibilitysuite plusboundeddatareview |

Thepositivegoldenfixture mustcomefromactualretainedmanifest bytes/log/hash, not `reviewedRuntime()` fields echoedintoa fabricatedmanifest orexpectedtuple generatedfromthenewpolicy. Newtestshouldfail ifa singleadmissionconstant iswrong. Buildingcurrentexactplain/stagingunderexistingproducerprovides additionalsourceclosureverification; itdoesnotreplace thegoldenactualevidence.

Afterplain/staging admission is independentlyreviewed, theexistingguardedprivateproductioneditionbuilder canconsume admittedplainColorandgenerateactualproductiontuple. Keepitsselectguard unchanged. Captureactualproductionmanifest/runtimecanonical+immutableclosure,productionedition/origin/indexing/rights andderivation; onlythen separatelyreview/addthatproductionrow. Nopredictedproductionconstant,temporaryunknownfamilywaiver orproductionactivation is justified by thisdiagnostic. Publicrelease stillrequires allnormalexistinggates.

## Conclusion

**WB-RUN01 is verified corrected on e92de9 within the actualboundedLinuxChromium diagnostic.** All16legs andfouractualfooterstart/endpairs satisfytheindependentnormalmotionoracles; finalpublic/source checkscomplete. Exactnewplain/stagingtuplebytes are independentlysupported and currentunknownfamilyrefusal remainsintact. Proceedwiththeboundeddata-onlyadmission andtests underaboveoracles, withfreshaffectedreviewbefore claimingpolicyacceptance. Productionrow remainsnull untilactualguardedbuild evidence; fullruntime/releasegates remainpending.
