# White-box diagnosis — clean CI shard5 content-retention failure

Refs #169 / PR170. 5 November2026. Reviewer `/root/native_r9_whitebox`, same-role continuation. Independent source/rawfailure inspection and twocontrolled retention-function checks; no peerdiagnosis/report read, implementation edited, dependency installed, externalcall or unchangedcampaign/test rerun. Only thisreviewreport waswritten.

## Exact failedsource and evidence

CleanHEAD`1c060edd33259800420ec314c6245c72be32eda8`,tree`640907753a9a7179612a29f85ca01abda71cf2d2`. Actualrun42095940383/job127485870538,source-shard5; suppliedartifact13447776746. `/workspace/scratch/83aaf5811f83/tmp/r9-source-ci-failure/shard5.zip` SHA256 independentlyrecomputed`cd66835730a3588f7f8e5eb5a4d1e3cff4e737e3578bcb157b4b7b4d431f92e9`,15539bytes,rawJSON/TAP/stderr.

Reportsource andsourceAfterbothclean1c060/sametree. Processstatus1,signalnull,errornull; timeout300000ms/output16777216bytesunchanged. NativeTAP has241tests/240pass/1fail/cancelled0/skipped0/todo0. Failure isleaf117 `content artifact preserves immutable media, isolates staging HTML and proves exact current source`,3085.027008ms. Wrappercontent-release completedfailed at24314ms; lastmodulecomplete71502ms. Thisis anassertionfailure, nottimeout,installfailure,incompletecampaignor runtimefamilyrejection.

Exactassertion: `snapshot dependency missing article-snapshots/97e842031916dc9f707a78c9055ce00e21b003552e908291ef76a9da88c46e39/first-profile.html → runtime/72702f750f37e9cc6678b2d1181da57aa8c121293ebf70c9deae4e7aec568237/theme.js`. Stack: `snapshot.verify`250 → `Color.build`158 → testcompose421 → testcase439. Color post-decorationverifier correctlyrefuses a danglingimmutabledependency.

InspectedsourceSHA256: edition-retention`9e1ce89d5883a639fb79147f8a86f7a5030c8916baa338b1256bf984b7ee1b4d`;Colorowner`a48869d6f68c51fd92994ad12fe7161b13435f6fe05721f3a119f4e6149a7c69`;contentrelease tests`36376d7a2640a9522b2f1a1f7b09d8cf23157678ccaa0c6ebca33653dbd6a623`;artifactowner`3dab8113e50df470c14a7f0e59d9a6ecae8b13ef799a8383b43538be37f9fc29`. Alsoinspected content-releaseassembler,snapshotclosurevalidator,existingedition-retentiontests andcanonicalcontentreleasecontract.

## Supported mechanism

1. Testsetup builds syntheticfirst/secondarticleprofiles using thecurrentrealplatform, thenColor+stagingbaseline. Itsfixture ownsarticles; no acceptedpublicationclaimis implied by syntheticprofiles.
2. Failingpositive changescontent andrenames first-profile slug, thencomposesrawcontentgeneration beforeColor+edition. `content.release` copiesverifiedrawbaseline andpreservesimmutablepriorgeneration; `retainFinalSnapshots` additionallycopiesverifieddecoratedbaselineclosure. Thecurrentclient/runtimeidentity stays727 forboth oldandnewcontent—precisely thecompatiblecontent case.
3. `edition-retention.capture` constructsactivepathset containingcurrentrevision's5`runtime/727/*`files,currentroute snapshots andcurrentarticle snapshots. Itretains immutableentries onlyifnonactive orindividuallydeclared, unlessbroadpreserveActivewereexplicitlyrequested.
4. Supersededfirst-profile snapshot97e… isnow **nonactive**, soColorcapturesit. Itsstillneeded727runtimepaths are **active**, notinthefixedfrozenretainedmanifest, sotheyareexcludedfromcapturedclosure.
5. `Color.decoratePublic` removesallruntime/snapshot/article-snapshotdirectories, writesthenewColoractiveclosure andrestoresretainedentries. OldbaseHTMLreturnsbutits727runtime doesnot. Post-transform`Color.build` calls`snapshot.verify`,whichchecks allHTMLlocaldependencies, andcorrectlyfails.

Thecurrentcodecomment alreadyrecognizes olderimmutableHTML can depend onactivebaseruntime, butrequires individualfrozendeclarationsforthatcase. Thefixedretainedmanifest cancoverfrozenhistoricalsitefiles; itcannotenumeratefuturetrustedsnapshots ofsynthetic orrealcontentupdates dynamically. Stableclientidentity makes thisgap reachable: oldandnewarticlecontent shareruntime727. Ifengineidentitiesdiffer, theolderruntimeisnonactive andnormalcapturewouldkeepit; varyingcontent alone no longerhides thegap behindfreshenginehashes.

Thisis not fixedbychangingnewColorfamilyconstants ordiscarding thepositiveassertion. Thefailingtest usesdraftsyntheticarticles, so itdoesnotitselfestablishbrokenlivepublishedURLs; however thesameproducer/retentioninvariant applies tocompatiblecontentwithsupersededimmutableHTML. Missingdependency mustremainfailclosed.

## Independent actual controlled checks

Invoked theactual`capture()` source in-memory withstubbedfilesystem/entryinventory only; noartifact/sourcefileswerewritten andnofullbuildran. Revisionusesstable727,onecurrentrenamedarticlesnapshot,oneoldnonactivefirst-profile snapshot andfiveactive727runtimefiles.

```json
{"case":"actual-capture-function-controlled-input","oldNonactiveSnapshotRetained":true,"activeRuntimeExcluded":true,"replacedActiveSnapshotExcluded":true}
{"case":"existing-exact-declaration-preserves-runtime-only","retainedRuntimeFiles":5,"oldSnapshotPreserved":true,"activeHtmlStillExcluded":true}
```

Thefirst reproduces theclassificationmechanism independentlyofCItestpassflags. Thesecond suppliesexactbytehashdeclarations toexistingcaptureAPI andproves a narrowedruntime-onlyselectioncanpreserveitsolddependency whilekeepingreplacedactiveHTMLexcluded. Thisis evidencefortheexistingdeclarationmechanism, not animplemented fix, dependencyparserproof oractualclosurepass.

## Smallest bounded next diagnostic

Do not rerun12-moduleshard/fullcampaignunchanged. Beforeimplementation, instrumentonlythefailingpositive'sColorboundary in anisolatedfixture: listold/newarticleURL/engine; retainedHTMLpaths andtheir localimmutable runtime references; classifyeachdependencyasactive/nonactive/frozendeclared/missing; recordactualbytes/hash andartifactproof. Stopafteronecomposition/boundaryinspection. Expectedinformationgain: verify whetherallfive727runtimefiles oronlya subset isrequired byold97eHTML, andwhich verifiedcontent-baseline mapowns itsprovenance. Retainfailedinspection and anypartialoutput. ExistingrawCIalreadyestablishesthefirstmissingtheme.js; morecampaignreruns addnothing.

## Minimal fix candidate and independent acceptance oracles

Prefer a dependency-scoped treatment inColor/retentionintegration: fromthe **alreadyverified andalreadyselected retainedimmutableHTML**, identifyneededpaths amongtheexact **currentactive runtimefiles**. Verifythosepaths/bytes againsttheinputartifact/trustedclosure andconstructa boundedexactdeclarationforonlythoseneededruntimefiles beforeclearingdirectories. Unionwithfrozenretaineddeclarationswithoutoverridingconflictinghashes. Existing `retention.capture(...,{declared})` canthenpreservetheexplicitneededbytes whilecontinuingtoexcludeotheractiveHTML/runtime. Keepordinaryartifact/snapshotverificationbeforeandafter transformation. Do notinferapprovalfromarbitraryHTMLpresence; bindtheretainedsource toitsverifiedbaseline/sourceinventory andpreservefullrightschecks.

Thiscandidate preservesoldimmutablecontent closure withsamestableclient, keepsjust-replacedactivebasesnapshotsout, anddoesnotwidenallactivecapture. Exactowner/interface choice requiresimplementationandRequirements/Code review; thisroleauthorednone. Avoidglobal`preserveActive:true`,hardcoded727exceptions,allruntimecopying,arbitrarypath/URLallowance,pruningeveryoldHTMLsnapshot,rewritingimmutablebytes,relabellingmissingdependenciesornarrowing`snapshot.verify` toactivepagesonly.

| Risk / AC | Scenario / independentoracle | Existingallocation |
| --- | --- | --- |
| Positivecompatibleclosure / AC05/11 | Sameenginecontent+slugchange retainsoldHTMLandonlyneededexactruntime;newColoralias/currentreaderworks;alllocaldependenciesexist | Targetedcontent-releasepositive425 plusnewboundededition-retention/Colorregression |
| Activeexclusion / AC05/11 | Unreferencedactive runtime/route/currentarticlesnapshot staysunretained unlessseparatelyexactdeclared | Preserveexistingretentionactiveexclusiontest andColorreplacedarticleassertion |
| Exactsourceintegrity / AC05/11 | Missing/changedneededruntime,conflictinghashdeclarations,immutablecollision refusebeforegreenoutput | Existinghash/collisionnegatives plusneededactive-runtimefaultcase; nofallbacktodifferentengine |
| Finitepathboundary / AC05/11 | Nonimmutablepath/traversal/mutablealias/externalURL/oversizedclosure cannotbecome retentionpermission | Existingimmutable/safeinventorybounds andfocuseddependencyclassificationnegatives |
| Independencefromsameengine / AC05/11 | Differentengineoldclosure stillpreservedexactly;newruntimeunusednotretained | Existingretentionhistoricalpositive pluspairedsamestableclientcase |
| Stagingisolation / AC05/11 | Finalstagingstillremovesallold/unlabelledHTMLandnoncurrentruntime,retainsrequiredmedia;current-sourceproofpasses | Keepfulloriginalfailingpositiveassertions439–466 andcandidate-source tampernegative |
| Production/rights / AC05/11 | Priorapprovedimmutableclosure remainsbyte-identical,requiredrights/noticesunchanged;missingretaineddependencyrefuses | Existingedition-retention/production/artifactrightsowners; scopedaffectedchecksafterfix |

Newtestmusthaveanactualregisteredowner/changed-inputroute. Naturalownersareexisting `edition-retention.test.cjs` and`content-release.test.cjs`; updateeffectedmoduleinputmapping ifnewhelperdependencyisintroduced. Tests shouldfailonthisoriginalsame-enginecase,passonthecorrectedclosure andretainmeaningfulmissing/tampered/broaderactivecapturefailures. Newtest/fixneedsdifferentnonauthorreview. Existingbudgetsandprofileinventorymustremain.

**Verdict: highsource/closuredefect supported; advancementblocked pendingboundedfix andexactcandidateverification.** Snapshotvalidator andCIcorrectlyfailed; preserve241/240/1nativeaccounting andrun42095940383. Theproblem isretainedHTMLdependencyselection underastableclient,notanunreviewedruntimeexception. Noactualfixornewfullacceptance resultisclaimedhere.
