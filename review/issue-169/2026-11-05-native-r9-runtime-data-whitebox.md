# White-box continuation — prepared two-row runtime admission

Refs #169 / PR170. 5 November2026. Reviewer `/root/native_r9_whitebox`, same-role continuation. Independently reviewed currentpreparedfamily/client/fixture/testdelta against actualretainedrawCIevidence. No peerresults consumed, implementation edited, dependency installed, browser rerun, privateproduction build or externalwrite performed. Only thisreviewreport waswritten.

## Identity

HEAD`e92de9bb5e3e4bcd80c4207457732808d2d67015`,tree`626278d38d4d0592663646ae0eeb0b7b68e3eed3`. Preparedsourceisdirty:fourtrackedpolicy/testfiles changed plusuntrackedgoldenfixture/reviewreceipts. HEAD/tree alone donotidentifytherevieweddelta. InspectedSHA256:

| Path | SHA256 |
| --- | --- |
| tools/quality/color-motion-contract.cjs | 3bf3e271b6704d9a6bcfca034066e4bb20f5416d1f6eeec946c45d7e5b093851 |
| tools/site/runtime-compatibility.cjs | 3efd9ba45d1dfcf5701be79b898feb0eed45ed9b7d95dd0ffce05cde854c2c39 |
| tests/color-motion-contract.test.cjs | 3d7e2d7385ca27ac7caa93566fab50714b252d38e489b7c85633737aa63baad2 |
| tests/fixtures/r9-footer-runtime.json | 7290ff55ad70fc88b4d44d6f92af9c3c2ba5f948b78072a226b9f480a55b5db3 |
| tools/quality/test-profiles.json | b1843136683e805079f50cc92610ce4cd4fb342c94463e3787fadfb2e55d8ece |

## Actualdata lineage and admission semantics

New `issue169FooterRoutes` inherits existing nativeTagsbehavior/rights, overridesexactbase727/space9c12/navd2ca/plain9cec/staging1fce and setsproductionexplicitlynull. No genericselector,bytecheck,editionguard orrights logic changed. Independentin-memorycomparison ofall54priorfamilyobjects againstHEAD confirmeddata-identicalhistoricalentries. NewfamilyrequiresPublicationRights true,behaviorfixed-blocks,articleReadingstationary; otherinheritedflagsretained.

Goldenfixture is an honestly labeled `observed-runtime-projection`, not a completeartifact orreleasepass. Forbothrows independentlycompared everyprojectedsource/tree/dirty/artifact/variantfield, everycomponentsubfield, edition andall10canonical/immutablefilerows(includingraw/gzipsizes) toactualfullmanifestrecords previouslyverifiedagainstrawjoblogs:

- PlainfullmanifestSHA`bb0848e08696747d8d3989180f788955033b68ab1e21eb37978a87472547bfe6`, sourcee92de9/tree626278,actualrun42090631531; diagnosticZIP/reportSHA infixturematch verifiedactualrecords.
- StagingfullmanifestSHA`137bde4e295042004113a45763d9ab73a78f123e3b98902f6a4179a73b1f4215`, sameactualsource/tree,preview42090186353/build127466187590. Fixturecorrectlylabels laterunknown-runtimefailure,notstagingacceptance.

Bothprojectionsmatchexactly. Thesevalues are externalto `reviewedRuntime()`, so thepositivecase can detectwrongadmissionconstants ratherthan rebuildingexpectedmanifestfrompolicy. Candidatefixturebody isnot a newsourceauthority; its provenance remains the retainedCI/logchain.

Runtimecompanion adds727onlyto existing `reviewedDocumentClients`; unchangedfingerprint/runtimebyteverification andlegacyversionalias semantics remain. Existingsemanticdocumenthooknegatives nowexecute fornewclient727. Thetwo currentfamilyreferences migrated inproducer-refactoring/reading-batchtests leavehistoricalnegativebranches intact. Fixturepath wasaddedto theexistingcontracttestregistryinput; actualfixture-onlyselection includes thecontractsuite.

## Actual focused checks

1. `node --test --test-name-pattern='reviewed footer runtime|unknown, conflicting, mixed|reviewed fixed-block tuples reject' tests/color-motion-contract.test.cjs` — exit0;3tests/pass3/fail0/cancelled0/skipped0/todo0;1229.351926ms. Newgoldenpositive plus actualpublicationRequiredtrue,changedbase,wrongedition,eachcanonical/immutablebytechangeandoldnavmix refusals pass. Existingunknown/mixed/editionguardcases also pass.
2. `node --test --test-name-pattern='producer refactoring preserves client compatibility' tests/color-motion-contract.test.cjs` — exit0;1test/pass1/fail0/cancelled0/skipped0/todo0;201.250841ms. Includesactualproducerrefactor/clientstability, changedruntimebytes, malformed/missing/fakehookmarkup,missingfallback/footer,changedtemplatefingerprint andinvalidclientidentity refusal. Thisis semanticclienthookcoverage,notjustSHAcomparison.
3. Independentboundedchecks onactualnewgoldenprojections:37expectedrefusalspassed. For eachof2editions, changedbaseinbothdeclaredvariants(refusesexactpolicyidentity,notonlyconflictingaliases);coherentlyunknownfingerprint/engine;5files×(missingcanonical,missingimmutable,mixedbothzero);swappedplain/stagingCSS. PlusunknownnewfamilyproductionID. ActualpublicationRequiredtrue wasassertedforbothrows. All54priorfamilies data-identical; newproductionnull andtrustedbehavior/rightsasserted.
4. Actual`source.select(root,'pr',{changedPaths:['tests/fixtures/r9-footer-runtime.json']})` selects`tests/color-motion-contract.test.cjs`. Thisis selectionevidence,notfullselectedcampaignexecution.

Nofullsuite, wholebuild, measuredcoverage orfreshbrowserresult isclaimed. The explicitlysuppliedauthorfocusedlogwasread as input; aboveresultsare independentexecutions.

## Remaining test integration condition

Theexisting `current platform runtime tuples reproduce the complete plain, staging and production byte closure` case stillasserts`issue169-native-tags-plain/staging/production` andoldbase. Currentplain/stagingnowselectnewfamily, so thosepositiveexpectations mustmigratebeforefullsuite/current-sourcegreenacceptance. Productionassertion mustwaitforactualguardedtuple,thenmigratetoitsverifiednewID; do notskip/removeitsclosureornegativeobligations. Thisremainingcase mismatchdoesnot requireguessingproduction orweakeningguard; itiswhythisintermediate2rowpreparedstate isnotfinalCI/releaseacceptance.

Newgoldenwrongbasecase changesonlytopvariant andcanthereforerefuse atconflictingvariantmetadata first; theadditionalreviewercheck changedbothvariants andconfirmedtheexactbasepolicyrefusal. Retaininga coherentwrongbase mutation intherepositorycasewouldmakethisparticularregression moredirect; existingguardcodeisunchanged andactualguardwasindependentlyexercisedhere.

## Guardedprivateproduction derivation on honestdirtysource

Sourceinspection of `tools/release/edition.cjs:108–130` confirmsnormalColorbuildfirstcalls`motion.select(record)` oninput. Newlyreviewedplain9cec canpass thisunchangedguard; unreviewedinputs stillrefuse. Thenexistingeditionbuilder appliesproductionorigin/indexing/sitemap/retentionbeforehashing. Thereisnoreasontobypassselector,predeclareproductionhash orrewrite-sourceDirty.

`tools/site/edition.cjs` propagates `...source` intoitsderivedrecord; itdoesnotturnsourceDirtytrueintofalse. A localpreparedartifact builtfromdirtysource mustremainlabeleddirtyandrecordactualHEAD/tree; productionderivationfromit is aprivate diagnosticbyteproduceronly. ExistingCIartifactbuilder's dirty-source refusal mustremainenabled whereCIrequirescleanliness. Ifgeneratedoutput/inputclosure isstale, regenerate throughitsnormalowner beforederivation; donotreplacebytes/manifestflagstomaketheguardpass.

Theprivatebuild mayreturnactualproductionbytes/manifest afteradmittedplaininput, but `motion.select(production)`/productionverify shouldstillrefusebecauseproductionentryisnull. Capturethatactualderivedtuple,canonical+immutableclosure,source/dirty/parentartifactbinding andnormalproductioneditionpolicy,then independentlyreviewtheexactthirdrow. Privatebuildsuccessdoesnotauthorize staging,merge,activation orpublication. Thisreviewdidnotexecuteprivatebuild oracceptanunobservedproductiontuple.

**Verdict: inspectedtwo-rowfamily/client/goldenfixture areconsistentwithactualevidence andpreserveobservedcriticalrefusals. No scopedWhite-boxblocker to normalguardedprivateproductionderivation withhonestdirtylabels.** Thisintermediatestate isnotfinalsource/full-suite/releaseadmission: existingcurrentclosuretestmigration,actualproductiontupleinspection,normalcurrent-sourcechecks/RI andaffectedindependentroles remainpending. Productionexplicitlynulluntilthen.
