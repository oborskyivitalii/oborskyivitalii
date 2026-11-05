# White-box first correction review — retention runtime dependencies and parser option

Refs #169 / PR170. 5 November2026. Reviewer `/root/native_r9_whitebox`, same-role continuation. Independent currentfix/source/test/rawlog review; nopeerreports, implementationedits, fullcampaignrerun or externalcalls. Thisfirstjudgment ispreservedbefore anynextcorrection. Runtime-onlyfix hasusefulpassedchecks but **doesnotyetresolve theoriginalcompleteclosurepositive**.

## Source and raw chronology

Workingdelta onHEAD`1c060edd33259800420ec314c6245c72be32eda8`,tree`640907753a9a7179612a29f85ca01abda71cf2d2`. InspectedinitialpreparedbyteSHA256: retention`c3b131190d9ec82fc2a8d3589fb50c49c78a7f22a74aede6932825f7ec93404f`;htmlparser`386b6503b6166646e49895e6cd8af8d84b3596accc979731590dd1dc382d3c3b`;Color`18b2fdf64af3c9a7a30747290980f655e0b436805fe1aee0e981474fdcefeea5`;retentiontests`5d15fd01e0b1827346fe545853cd333d93d9ccc9644d9d12bfc01dc0e8ef1189`;registry`cef0b6466c206e8f10e139947a3be66e56533db13b6d7fbdb52c7dc2ce1127a6`. Originalcontentreleasepositive remainsunedited.

Suppliedrawlogs independentlyread:

- `../tmp/r9-retention-reproduce.log`: singleoriginalpositivefail,0/1pass;exactsame97e…→runtime727/theme.jsedgeasactualCI.
- `../tmp/r9-retention-tests.log`:18tests/16pass/2fail. Runtimecaptureimplementationinitiallymissedscript-srcbecauseexistingdefaultdocumentElementsomitsallscriptnodes. Newreal-scriptregressionandoriginalpositivebothfailed; failuresretained.
- `../tmp/r9-retention-tests-corrected.log`:18tests/17pass/1fail,13654.202883ms. Opt-inparserfixedthefirstmissingruntimeedge; originalcompletecontentpositive nowfailsat**anotherdependency**: oldWriting snapshot`21c99c036f98faf2f33c91ab13d57d2d62a56d6feb32a33a4c3f32834a937c20/writing.html`→currentbasearticle snapshot`0b76ae595b83a7fa810b4f5e2910eedc9e6bcf26d606377a385b31ac19da547e/second-profile.html`,stackColor.build/snapshot.verify. Theseareauthor-runrawresults,notreviewerexecution; nofullmodulesduplicatedhere.

## High finding WB-RET02 — runtime-only closure is insufficient

Newcaptureonlyaddsdependenciesin thefinitecurrent5runtimepaths. A retainedoldWritingdocument canlinktoanunchangedarticle'scurrentactivebasesnapshot. Colorreplaces/removesthatsnapshot, whileoldWritingremains; theactiveHTMLdependencyisnotinruntimeallowlist andisnotcaptured. Snapshotverifiercorrectlyfails. Thisis the samegraph-closure defect at asecondnodekind, not a reason towaivethevalidator orreinterpretoriginalpositiveasobsolete.

The firstruntime-specificdiagnosis/proposal addressedthefirstobservededge; retainedrawcorrectedfailure nowproves a broaderdependencyrequirement. Needednexttreatment mustpreserve **exactdependenciesofalreadyretainedimmutableHTML**, including a referencedactivearticle/page snapshotwhenrequired, whilecontinuingtoexclude **unreferenced** active/replacedpages. Usefiniteverifiedinputinventory,collisionchecks andbound; processnewlyselectedHTMLdependencies untilclosure,withvisitedset/cyclehandling. Preserveexplicitfrozendeclarationsandstagingpurge/rights. No blanketpreserveActive,oldWritingpruning orpostverificationweakening.

Thisbroadertreatment changeswhichneededactiveHTMLcanbecaptured andthereforeneedsapplicableRequirements/Code review andmeaningfultests. Existingactivepageexclusionpositive shouldremainforunrelated/unreferencedpages; addpositivewhereanexactretaineddocumentrequiresanactivearticle snapshotplusitsruntime. Originalfullcontentpositiveandstagingassertions mustpassunchangedbeforeacceptance.

## Parser and local dependency review

`documentElements(html,{includeScriptSources:true})` exposesonlyouteropeningattributesofrealScript tokens. Defaultfalse remainsunchanged; rawbodies,commentsandtemplatecontents remaininert. Onlyretentionusesnewmodeincurrentproductioncode. Currentopt-in doesnotturnscriptbodyexamplemarkupintodocumenthooks. Openingattributesuseexistingstrictquoted/duplicate-attributegrammar.

Independentactualchecks:

1. `node --test --test-name-pattern='retained documents keep only|active documents require|retention rejects altered' tests/edition-retention.test.cjs` — exit0;3tests/pass3/fail0/cancelled0/skipped0/todo0;525.535267ms. Actualnewruntimeonlypositive/missingfile,declaredactive/unrelatedexclusion andimmutablecollision/refusalcasespass.
2. Pureparsercontrolledchecks: defaultomitsallscripts;opt-inreturnsrealoutertheme.js src only;fakebuttoninbodyandcomment/template/JSONsrcmentions donotsupplyhooks/dependencies. Fiveinvalidinputsrefuse:duplicatedsrc,unquotedsrc,unclosedtemplate,closingtemplateunderflow,unfinishedscripttag. Exit0. Thesecases exercisedactualparserfunction,noHTML/sourcefileswritten.
3. Actualcapturefunction executedin-memorywithmockedentryinventory(noartifactwrites): localrelativequery/hashreferencekeeps exactthemebytes;externalHTTPS,externalprotocolrelative,dataURLandoutside-localpathkeepnoactivefile. MissingneededruntimeandmalformedURLrefuse. Exact1000retainedentriesaccept;1001refuseexistingbound. Exit0. Thisobservespathselection/inventorybyteidentity andbounds; itdoesnotfixactiveHTMLclosure.

Allinventoryentriescomefromexisting `artifact.entries`, whichreadsactualbytesandrejectssymlinks/nonfiles. SourceartifactverificationbeforeColorandpostclosureverifierremainunchanged. Frozenhashchecking/immutablecollision/activepageexclusioncodeisretained. Stageisolationcannotbeacceptedfrompassedhelpercases: originalstagingintegrationpositivehasnotreacheditslaterassertionsbecauseColorclosurestillfails.

## Allocation gap WB-RET03

Actualsource.selectresults foronechangedinput:

| Changedpath | content-release.test selected | edition-retention.test selected |
| --- | --- | --- |
| tools/site/html.cjs | false | true |
| tools/site/edition-retention.cjs | true | true |
| tools/staging/color.cjs | true | true |

Theparser isnowdirectlyontheoriginalcontentreleasefailurepath. Addhtml.cjstoexistingcontentreleaseinputs sofutureparser-onlyeditsalsorunthecompleteclosurepositive; currentmulti-fileeditselectsitincidentally. RegistryJSONUnicodeescapechangehasnochangedparsedmeaning. No newtestlaneorbudgetincreaseisneeded.

## Next bounded checks and conclusion

Afterclosurecorrection, verifyonesame-enginecasecontaining oldWriting→unchangedactivearticle→runtime and changedoldarticle→runtime,plusnegative missing/altereddependency,nonimmutable/mutable/externaltarget,cycles/visiteddedup,boundexhaustion,unrelatedactivepageexclusion andfrozenhashcollision. Reusetheexistingfullcontentpositive unchangedtocovernewaliases,oldHTML/runtime stagingpurge andcurrent-sourceproof. NewrecursiveHTMLparserpath mustretainrawtext/comment/templateexclusion andpostartifactverification. Anynewhelperdependency needsactualregistryselectiontest.

**Initialverdict: requestcorrection; runtime-onlypreparedfixnotacceptedforadvancement.** Threefocusedtests andparser/safeURL/boundchecks pass, but rawcorrected18-casecampaign stillhasonecompleteclosurefailure. Preserveallthreefirstfailurelogs andactualCI241/240/1. No unchangedrerunornewfullacceptancepass isclaimedhere.


## Transitive correction readback — final bounded outcome

Theprecedingruntime-onlyverdict remainsfirsthistory. Newactualsourcewasthenindependentlyread andtested; itis**transitive**, nottheoldruntime-onlyattempt. Newcaptureseedselection,frozenhashchecks andactiveexclusion remain; anindexworklist visitsselectedimmutableHTML, resolvesactualsrc/hreftargets andaddsneeded **anyimmutable** inputentry(includingsnapshots),withselectedsetdedup/cycles. NewlyaddedHTMLisprocessedtransitively. Initialseedlength<=1000 ischeckedbeforewalking,eachappendrequireslength<1000;missingimmutabledependencyrefuses. UnreferencedactiveHTML remainsunselected.

Finalsourceidentities,stablebefore/afterreviewerexecution:

| Path | Bytes | SHA256 |
| --- | ---: | --- |
| tools/site/edition-retention.cjs | 3679 | eed451ba94aaaa55954e33fdd337e1d7ecf78eb7d0e42f1a26d7e2d5f8baaa4f |
| tools/site/html.cjs | 6446 | 386b6503b6166646e49895e6cd8af8d84b3596accc979731590dd1dc382d3c3b |
| tools/staging/color.cjs | 6569 | 482287dbdeff98b91f36f69c735addd833e795b2d3db1112a894005eea9c47ba |
| tests/edition-retention.test.cjs | 7858 | d8f446a23ab023eafbf3da6ba6aa112102f207de58e4dab9f223812762e2a01b |
| tools/quality/test-profiles.json | 132133 | 89c7d52f74f702d0a291bbd020a42c05d4a05ce22df2337626850b8e57911357 |
| tests/content-release.test.cjs | 22268 | 36376d7a2640a9522b2f1a1f7b09d8cf23157678ccaa0c6ebca33653dbd6a623 |

OrderedcompactJSON `{path,bytes,sha256}` manifestdigest`30c319a41387df2f042469a844efa6e930597964220ab751cd78e319134e69b4`. HEADstill1c060;thisis dirtypreparedsource identity,notacleantestedcommit. Theoriginalcontentreleasepositivebytesremainunchanged.

### Actual execution

Independently ran:

`node --test --test-name-pattern='content artifact preserves immutable|retained documents keep transitive|active documents require|retention rejects altered' tests/content-release.test.cjs tests/edition-retention.test.cjs`

Exit0;4tests/pass4/fail0/cancelled0/skipped0/todo0;9483.26713ms. Originalfullcontentartifactpositive passesunchanged,includingnewalias/oldalias treatment,priorimmutablemediaretention,finalstagingoldHTML/noncurrent-runtimeisolation,current-sourceproofandtampersource refusal. Threefocusedretentiontests coverfrozenactive-declaration/unrelatedexclusion,collision,actualtransitiveHTML→HTML→theme sourcecapture/backcycleandmissingHTML/runtime failures.

Separatein-memoryactualcapturefunction faultchecks(writefree,exactcurrentcode) returned:

```json
{"case":"transitive-cycle-dedup","nodes":3,"exactBytes":true,"unrelatedActiveExcluded":true}
{"missingSnapshotAndRuntimeRefused":true,"bound1000Pass1001Refuse":true,"externalMutableOutsideDoNotExpand":true}
{"threeChangedOwnerPathsSelectBothAffectedSuites":true}
```

Controlledgraph: oldimmutableWriting→activeIndexsnapshot→activeTheme,withbackcycleandduplicatethemeedge; exactoutput3nodes,unreferencedactiveWritingexcluded,themebytesexactinventoryBuffer. Eachmissingedge(HTMLorTheme)refuses. Initial998/999extramedia boundaryfixtures produceexact1000acceptedversus1001requiredrefused. Externalorigin,mutablecanonicalaliasandoutsidepathdonotexpandcapture. Thesearestructuralvalidatorchecks,notproductionartifact/browserobservations.

Theparserbytesareunchangedfromthepreviousreview,soitsdefault/opt-in and5malformedrefusalresultsare reusedonlyforthoseidenticalbytes. Currentnewunit alsodirectlyassertsdefaultparserstillomitsScript,whilethetransitiveactualScript src isretained. Existingrawbody/comment/template/JSONinert andURLbounds remain asreviewed.

Readactualauthorraw`../tmp/r9-retention-closure-tests.log`,SHA256`dd2e694bbb9fae358614fdffcf613092e7d2417ad257d26cee9d8f8e1e625695`:fulltwo-modulerun18/18pass,0fail/cancelled/skipped/todo,19889.382975ms. Thisis distinctfromanddoesnoterasetheold17/18log. Thereviewer independentlyexecutedonlythe4targetedcasesabove,notall18again.

### Findings resolved and limits

WB-RET02 resolvedforthesereviewedbytes: neededactiveimmutableHTMLanditsruntimearetransitivelypreserved,withboundedcycles/byteidentity; unreferencedactivepagesareexcluded. WB-RET03 resolved: actualsource.select witheachofhtml.cjs,edition-retention.cjsandColor.cjs individuallynowselectsbothexistingaffectedtestmodules. Originalunmodifiedcontentintegrationpositive independentlypassesso theclosure/stagingassertionsareobserved,notassumedfromaunitpass.

No genericpreserveActivecall,frozendeclarationoverride,immutablecollisionwaiver,pathallowlistbroadeningoutside`snapshot.immutable`,postclosurevalidatorremoval,budgetincreaseorCIselectionexceptionwasfound. Coloractualfunctionaltransformisunchanged;itscommentnowdescribesimmutabledependencies. DefaultHTMLhookparsermodeisunchanged. Contentgeneration/rights/hosted/releaseeligibilityremaintheirnormalowners.

**FinalboundedWhite-boxverdict: passfortransitiveretention/parser/selectorcorrection ontheexactpreparedbytesabove.** Anewcoherentcleancommit/currentCIandapplicableotherrolesstillmustverifythecandidate; nofreshfullsourceCIorhostedpassisclaimed. TheindependenthostedH2animationfailure isoutside thisclosurefix andremainsseparate/open; thisresultdoesnotwaiveorconflatethatfinding. PreservealloriginalCI/runtimeselection/17-of18failuresandtheirsubsequentcorrectionreceipts.
