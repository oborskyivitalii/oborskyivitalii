# Browser supply repair — 26 October 2026

Owner: https://github.com/oborskyivitalii/oborskyivitalii/issues/122

## Intent and current boundaries

The maintainer authorized implementation and rebinding every related browser
consumer after the observed Chromium archive repeatedly failed. Keep the new
essay unpublished and PR79 unchanged. PR146 remains delivered history at
main56404df, testedf2f2ac2/tree42e1c6c6. Do not move its branch or relabel its
original platform artifacts.

One bounded response capture of the exact locked Playwright1.63.0/Chromium1243
download returned HTTP200, Content-Type text/html,195bytes, a SiteUnavailable
page; SHA2565b131ca14aa96311d3432b0062c7443d3b0e6346ec279bd376a75f0a76bcd5d7.
This establishes the present environment's supplier failure, not the cause of
every older CI failure. Raising test timeouts cannot repair that response.

The preceding actual accepted-artifact local content probe passes3checkpoints:
Talks→Home→Talks, all29platformfiles exact, restored oldTalks with newerHome
preserved. All three preparatory failures remain distinct. ReportSHA256
3afc86912a0e3922803c51c1eb40fd4a91aefa6e83a0a7938cd436c052b15d16.
That local proof is not native content admission; AC03/06/08 remain open.

## Bounded repair and acceptance

- Add one owner-controlled read-only native preparer and one shared consumer.
- Freeze exact Playwright/package/revision/OS/architecture, source/producer,
  native upload and inner archive identities in explicit pins.
- Rebind all existing browser downloads without changing engine sets,
  dependencies, native platforms, tests, budgets or first-launch ordering.
- Keep launch validation in the separate preparer; cold jobs never prelaunch.
- Reject HTML/wrong/expired/corrupt/unsafe supply before tests, retain diagnostics
  and preserve failure propagation; no consumer CDN/cache/system-browser fallback.
- Use existing GitHub artifacts with an explicit90day refresh route; no new
  Release writer, service, site publisher, credential or production action.

Style subcondition: CS01/04/05/07/08/09/10 apply to the browser supply owner,
workflow/composite action and regression wiring. Run the bounded guard,
format/lint, owning/RI/coupling and meaningful source tests. Review provenance,
safe extraction, cold-ordering and all native consumer routes independently.

## Historical stage1 checkpoint before consumer binding

Producer/consumer code and9focused stdlib tests pass locally. The tests cover
real extraction/executable bytes, wrong hashes/keys/revisions, unsafe paths,
symlink escape,195byteHTML behavior and foreign/failed/expired native origin.
No native browser archive is pinned yet; the empty registry deliberately cannot
supply consumer success. Existing consumers remain on the original route until
the reviewed native seed has succeeded and exact records are available.

Four distinct roles accepted the bounded seed-preparation source: Requirements
browser_archive_requirements, Code browser_archive_code, White-box
browser_archive_whitebox and Exploratory browser_archive_exploratory. Their
correction readbacks cover early TAR bounds,404/410refresh versus authentication,
bounded ancestry metadata and complete restore/environment/cleanup behavior.
Launch sanity explicitly binds the declared full executable (including the full
Chromium used by Lighthouse); consumer first-launch ordering is untouched.
Pending seed/native browser consumption is not a pass or a delivery claim.

## First native preparation failure and correction

PR147 seed source3b683aeb216ea303c9fa23f28905bb0b2e0534ad/tree899ab647
was rejected before any job in run40298043160/1. GitHub's exact annotation is
`Unrecognized named-value: 'runner'` at job.env lines31/34/35. There were no
browser acquisition or test results. The job-level context table in
https://docs.github.com/en/actions/reference/workflows-and-actions/contexts
excludes runner from job.env; step execution has RUNNER_TEMP available.

The bounded correction removes only those three job.env path expressions and
initializes the same paths through quoted RUNNER_TEMP assignments to GITHUB_ENV
after setup-python. Matrix, permissions, acquisition, launch checks, artifact
names and budgets remain. Nine focused archive cases still pass. The original
rejected run is retained; a corrected-source seed is not an unchanged retry.

All four role-specific agents actually re-read the correction and accepted it
for native preparation: Requirements, Code, White-box and Exploratory under
their separate browser_archive identities above. WorkflowSHA256d83863c469fd0acf
2272f9859fff5ad34a4f7256df26340ce66f95069cd5543c. Code/Exploratory executed
quoted path initialization with spaces and Windows-style paths; White-box also
checked macOS-style paths and independently passed9/9 focused cases. Native
preparation remains unobserved at this correction checkpoint.

## Native interpreter diagnosis and complete consumer binding

Corrected source61a6555a18de49dbbb00bacd8f6103b4512ae5e4/tree088660ef
started actual run40298917026/1. Linux job121491695289 completed acquisition,
real three-engine launches, self-extraction and upload successfully. Windows
121491695238 and macOS121491694884 failed in setup-python before acquisition:
Python3.12.14 was unavailable for Windows2025/x64 and macOS15.7.9/arm64.
The complete run remains failed; its partial Linux artifact cannot be pinned.

Official actions/python-versions release3.12.14-31661455385 contains only
Linux/RHEL binaries. Release3.13.17-39711892467 provides ordinary Windowsx64
and macOSarm64 builds. The bounded correction retains Linux3.12.14 and uses
3.13.17 only for the new native stdlib archive helper. Linux Python/library
steps, browser package versions and all existing native site sets remain.

All26 download-step declarations in12 existing workflows now use the shared
consumer; the guide records their complete inventory. Existing install-deps,
Xvfb, sampling tools, test commands, selection, runner labels and job budgets
remain. Seven contents-only workflows gain actions:read, with no write grants.
The five nested Writing checkouts explicitly resolve their candidate action/cwd;
native-profile retains its explicit storage path. The paradigm setup outcome
now binds the complete archive action before paired measurements. Equivalent
historical byte oracles undo only the reviewed npm and supply migrations.

Matrix setup receipts gain a UUID suffix to avoid same-job artifact409 conflicts.
The shared action still never launches browsers. A separate owner-only verify
operation exercises authenticated restore and the first launch on the same
three native platform sets after actual pins are available; it is supply proof,
not replacement site acceptance. Eleven focused archive/wiring cases, including
negative missing/wrong/skipped/unauthenticated supply, pass locally; Writing4/4
and Ubuntu dependency/order7/7 pass. Final four-role/native checks remain pending.

All four distinct roles completed the full delta review against61a6555a and
accepted it for corrected native seeding. Requirements independently passed
11/11 and checked intent/matrix/permission traceability. Code passed11archive,
4Writing and1targeted Linux/native contract. White-box independently compared
base-derived YAML for all26declarations/12workflows: unchanged guards, matrices,
budgets, prior actions and every non-acquisition command/dependency order;
23focused cases passed, plus owner-operation decision tables and distinct UUIDs.
Exploratory passed11cases and exercised the real nested candidate CLI with a
spaced destination: missing pins fail visibly with zero launches/no destination.
All four leave real native pins/restoration/site acceptance pending.

Frozen producer workflowSHA256c972fe35615e52b6289ba3e0d223cd9795a98c28f7f96123a9e0348a32d15e7d,
CJS9a5f9b7ad09cc4de7ee33f1d280eccec3f9c57a273eb3aaa5beac0970d0320bb,
Pythonffc2831c89aa3e6defd264c0c9fa869f47b5239dabc2f2a6a73e72d43e99f32b;
actionc8654276397cdb7d6396a33e8dd2fade5c3d838690c39b38346d1e76dd68703e.
Implementer verification passes67Node/11archive/7Ubuntu/29RI/20coupling cases,
Basic5routes/26theme-flightcases/12scripts, touched ESLint,532-file maintained
format and143-file bounded style guard. These are source checks, not native
browser, scanner, site-profile, protected merge or publication acceptance.

## Successful native preparation and actual pins

Run40301062890/1 completed successfully at exact source967c06bad074120c769e45a6b5b3261e805335bc,
tree056ef93f8e4d73bdd3781547d024dc440025cd48. Native owner and triggering
actor are oborskyivitalii; workflow/path/source/attempt match. All three jobs
acquired their existing engine sets, performed real launches and independently
re-extracted/verified complete archive inventories before upload.

| Native set | Runtime artifact | Original pin artifact | ZIP bytes |
| --- | --- | --- | --- |
| Ubuntu24.04/x64 C/F/W | 12641235014 | 12640164040 | 510869378 |
| Windows2025/x64 C/F | 12640746477 | 12640886167 | 456994450 |
| macOS15/arm64 W | 12640337995 | 12639854246 | 76727165 |

All artifacts expire2027-01-24T09:38:05Z. The registry retains their actual
native IDs, names, run/attempt/source, package integrities, system/revision/key,
native ZIP, inner archive and manifest hashes. Original pin ZIPs were downloaded,
native-SHA256/CRC checked and their JSON preserved unchanged. Authoring the
registry adds only `sha256:` before the raw upload action's64hex digest after
exact comparison with the native API's canonical digest. Requirements and Code
independently checked/accepted this representation normalization, with no source,
archive, manifest, key or producer transformation and no weakened check.

The actual macOS runtime ZIP was additionally downloaded: native SHA25648b63a30
c4071269dbd64ee00346e893f32bb6504ca60da6e2665a5f7b4bd048, inner42761b763250f6b9
ba6c5b4c9fbc11a0b52757957082ad2aff69c1773cd47afa and manifestd203fd8bc7894973
cfd23a14d926267196508be91a98dc571f3463f13b70d073 all match. Its6967file
manifest names the exact frozen producer hashes and successful WebKit26.6 probe.
At this pinning checkpoint, fresh authenticated consumption was still pending;
the completed native result follows below. Site delivery remains separate.

All four role-specific agents independently accepted the actual three-pin
ingestion at registrySHA2565391eb775de1bda70f7a1daa9783d26025708b2bf4c56bd05e0d6c8f4c924c43.
They compared original pin ZIP/JSON, live native metadata, source/producers,
lock/registry/revision/system identities and all three digest pairs. White-box
also exercised actual-pin duplicate/bare-digest refusals; Exploratory exercised
the real pinned CLI's missing-token failure with zero launches/no destination.
At pin review each left fresh native consumption and site acceptance pending. Eleven
focused cases and current RI/coupling verification pass after actual pins.

Actual seed timings from native job/step timestamps, in seconds:

| OS | Queue to job start | Setup to acquisition | Acquisition | Probe/package/selfcheck | Total job |
| --- | --- | --- | --- | --- | --- |
| macOS | 3 | 92 | 11 | 39 | 152 |
| Windows | 2 | 91 | 175 | 131 | 406 |
| Ubuntu | 3 | 37 | 77 | 148 | 276 |

These are one-time supplier preparation measurements. They do not measure site
test execution or establish a healthy-CDN speed comparison or overall AC08 pass.

## Completed native consumer proof

Run40303175625/1 SUCCESS at exact pin source4f1b9f00465e340ff507e77fdc81aa5b3cc23f08,
tree865252c778c0ec0f44b17e5eebd8be0ead40ef78. All three fresh native verify
jobs succeeded; prepare was correctly skipped. The shared action authenticated
the successful supplier run/source/attempt, downloaded the original native ZIP,
verified native/inner/manifest/inventory identities and then exported its path.
Each setup receipt reports consumerLaunches0. Only the following explicit probe
step performed the first launch, successfully covering all six native selections:
Linux C/F/W, Windows C/F and macOS W, at153.0.8010.12/155.0/26.6 respectively.

| Native set | Setup receipt artifact | Subsequent first-launch artifact |
| --- | --- | --- |
| Ubuntu C/F/W | 12641392174 | 12641801394 |
| Windows C/F | 12640444341 | 12640997974 |
| macOS W | 12641661822 | 12640944444 |

All six original report ZIPs were downloaded; each native SHA256, size, CRC and
preserved raw JSON matches the API. Setups match the exact three pinned supplier
IDs/keys/upload digests; probes match full package/registry/revision/executable
identities. Independent Requirements, Code, White-box and Exploratory actual
readbacks rechecked the six originals and source/run/step order. They accept
the bounded archive repair, with site/profile/protected delivery still pending.
Producer, reader, workflow, action and all26consumer bindings remain unchanged.

Preserve first verify40302880035/1 as a distinct failed wrong-source event: its
head/actual checkout was967c06ba, whose registry was still empty, and setup
correctly refused missing pins. It supplies no evidence at4f1b9f00. Before the
successful current-source event the live PR head was explicitly re-read as
full4f1b9f00. Different pin inputs/source make that verification informative;
the failed event was neither erased nor retried as unchanged current source.

This completes the new browser supply and all existing consumer bindings.
It does not claim all site profiles ran, protected staging/merge completed,
content acceptance occurred or a new article was published.

## First current-head navigation failure and bounded correction

Ready-head575bdbc9/treef90aecc4 navigation40304322219/1 failed in the existing
RootLayoutTests.test_current_active_relative_links_resolve:15cases,14pass/1error,
`Omitted active Markdown: ['guides/BROWSER-ARCHIVES.md']`. Style, guard negatives,
RI/coupling, Ubuntu wiring and107selected profile/staging Node cases already
passed before that failure. The guide was catalogued in RI but omitted from
the separate active-link inventory, so this is a real integration omission.

The bounded correction registers that exact guide in repository-layout.json's
active_markdown list and links it from guides/README. No validator/test rule,
browser binding, producer, pin, workflow, test membership or budget changes.
PR147 returned to Draft during correction. Preserve the failed native result;
fresh navigation will test the registered route rather than bypass its guard.

The same575Basic40304322190/1 failed at complete lint before source execution.
Original artifact12641882535 (nativeSHA25616a49ab52e6d4d79d69b4a03b22a0433
d4e7e2e7cbb51d9b69a5d924597f7256) was downloaded and verified. Its actual
ruff.json has exactly twoI001 findings: unsorted stdlib imports in the archive
helper and its tests. ESLint/stylelint passed; no source-test total is claimed.
The exact maintained Ruff invocation is isolated/no-cache/no-noqa with
E4,E7,E9,F,I selection. Format success and touched ESLint had not proved it.

Sort only those import blocks, without changing bodies, validators, tests or
lint selection. Because the helper's exact bytes belong to the producer trust
identity, this correction requires a new native seed and new pins; old967/4f1
native results stay historical and cannot admit this changed producer. Re-run
the actual complete maintained lint before freezing/seeding again. No integrity
waiver, import-normalizing source hash or old manifest rewrite is permitted.

The corrected working tree passes the actual maintained lint339files across
ESLint10.12.0/stylelint17.16.0/Ruff0.16.10; raw Ruff findings are empty. That
local artifact retains old575Git identity and dirty candidate bytes, so it is
provisional execution evidence, not a frozen-source result. A clean committed
lint check is required before publishing the new preparer. Four roles inspect
the import-only correction against the failed source; identical import sets and
complete non-import AST preserve behavior. Existing guards/negative tests stay.
At that correction checkpoint the registry was explicitly empty pending a new
seed. The completed clean lint and corrected producer's actual pins follow.

## Corrected producer: clean lint and new native pins

Complete maintained lint passes339files on clean local55998186dc600e817fc7e76658f08e301fbad2c8,
treea6680321dc603048e837a32e24b8577dd0a17af9, with all three engines passing
and empty Ruff findings. Published d66f43b20b365e8471bb12213240aa7fac4abf10
has this identical tree; the local receipt retains its real source identity.

Fresh native seed40306092975/1 SUCCESS at exactd66f43b2 on all three platforms.
The corrected Python producerSHA256 is923246e127acc3d16283859279000b56371150314c205d8f345166cdf9ac29e1;
workflow/CJS/action stay at their preceding frozen identities. All acquisition,
launch, self-extraction and record steps passed. New native artifact identities:

| Native set | Runtime artifact | Original pin artifact |
| --- | --- | --- |
| Ubuntu C/F/W | 12643236386 | 12643211306 |
| Windows C/F | 12643006802 | 12643146580 |
| macOS W | 12642004235 | 12642557379 |

All expire2027-01-24T10:16:18Z. Four independent roles accepted the new actual
pin records at registrySHA25685cb6c629dd5a23bd9c57788d636f4064edb70b77bb8c68d87be70e8a1b73c4f,
comparing original pin ZIP/JSON, live API/source/owner/run/attempt/digests,
lock/revision/system/key identities and unchanged engine sets. Only the already
documented digest-prefix representation normalization occurs. Original new macOS
ZIP/inner TAR/manifest/producer hashes and actual26.6launch probe independently
match. Old967/4f1 artifacts/proof remain historical. Fresh consumption of these
corrected-producer pins and current-source protected delivery are next.

## Corrected-producer consumption and scanner integration

Fresh consumer40307707776/1 SUCCESS at38e43fb4ea3369f5ed36131b421457fea01f4e3e,
tree5ddaf82a42f7ff44b34a077fc43b4889dd78c7e1. Three fresh native setups
authenticate the corrected producer's actual suppliers with zero setup launches;
six subsequent C/F/W platform probes pass at the same locked versions. All six
original report ZIP/native SHA/size/CRC/raw JSON and restore-before-probe ordering
were physically checked by the implementer and all four independent roles.

| Platform | Setup receipt | Subsequent first-launch receipt |
| --- | --- | --- |
| Linux C/F/W | 12643387947 | 12643183879 |
| Windows C/F | 12642714551 | 12643054042 |
| macOS W | 12643003478 | 12642863731 |

The separate existing local security preflight at38 first passed Semgrep but
blocked11 new LOW Bandit findings and lacked local publisher dependencies for
the secret-proof stage. Original full Bandit/hashed-secret reports are retained
in [the inert proof](2026-10-26-browser-security-proof.json.gz). Reusing actual
raw secret findings after installing identical-lock publisher dependencies
identified13 new public values, all in the browser registry:11 exact public
fingerprints and2 verified Playwright/core NPM SHA512 integrity strings.

Four roles independently classified the actual findings against source/native
evidence before implementation. Bandit's existing37 rows stay data-identical;
11 exact LOW reviews bind source923246e1, line/rule/confidence and the unchanged
2026-11-03 expiry. Its raw48 accounting stays visible. The checksum companion
adds13 exact dispositions; the other three ledgers remain byte-identical.

The separate browser SRI proof binds authored and selected-toolchain lock bytes,
installed lock version/integrity/resolved and package name/version, canonical
SHA512 values, and only the two actual package fields. Base64 admission still
requires an exact review ID and this separate proof; publication rules stay.
Missing, malformed, oversized, symlinked, stale, unknown and misplaced inputs
block. White-box found an unrelated JSON property-name placement bypass in the
first value-only walk; key inspection and its exact negative regression now
reject that case and an embedded-key variant. All four roles rechecked it.
Three new meaningful guard cases and the existing negatives pass; touched
ESLint has zero warnings. Full refreshed security/current-source CI remain next.

These scanner/policy changes do not alter producer, runtime, action, workflow or
pins; native38 proof keeps its original source and remains applicable to those
byte-identical owners. No browser reseed or scanner/threshold waiver follows.

The refreshed local security run passes Semgrep and actual Bandit48/48, while
the secret stage identifies6 new public source/line fingerprints inside those
11 Bandit review rows. Each is recomputed from the unchanged helper/line bytes
and appended as an exact companion disposition; the inert proof retains both
actual hashed-secret reports and the per-field mapping. No further guard change.
The complete local quality-sources run had37pass/1failure: its repository-lint
negative requires a clean Git checkout and therefore could not create its report
from this dirty implementation tree. Preserve that failed precondition result;
verify the unchanged test again on the clean committed candidate.

## Completed clean-source local acceptance

The clean committed implementation passes complete quality-sources38/38,
RootLayout15/15 and archive11/11. Complete maintained lint and security both
pass all three respective engines. All48 Bandit findings remain raw/visible,
exactly48 reviewed and zero untriaged. All19 new public-value dispositions
remain exact; previous rows and the three historical ledgers are unchanged.

The inert proof retains the actual clean local commit/tree, its equal remote
implementation tree, both complete scanner receipts, all eight original raw
receipt byte/hash/content records, and the complete38/38 test log. Original
source stamps and earlier failed dirty/preflight runs are preserved. Four
distinct roles actually rehashed and accepted these completed local results.
This final receipt changes only evidence/memory/deterministic RI; executable
guards, tests, policies, browser producer/consumer and pins stay identical to
the clean tested implementation. Native38 browser proof remains source-bound
and applicable to its byte-identical owners. Current-source native CI and
owner-stage/protected merge remain separate gates.

## Remaining #122 plan

1. Clean source/scanners and corrected browser seed/pins/consumption pass.
   Obtain current-source native CI, then existing protected delivery.
   Prior967/4f1 proof remains historical.
2. Obtain the maintainer's exact-head control attestation before owner staging;
   this separate source trust decision cannot be supplied by four agent reviews.
3. Verify ordinary content/history/recovery against a compatible accepted
   ordinary staging generation. The old146generation includes an R37preview
   reference from the old controller and correctly cannot feed ordinary[]reuse.
4. Reconcile documentation/ACs/actual queue/setup/execution and close only after
   all original obligations pass. R38 publication is no prerequisite.


## PR147 delivery completed — 26 October 2026

This receipt supersedes pending browser-delivery statements above. Original
sources, failed observations and native artifacts remain historical.
[PR147](https://github.com/oborskyivitalii/oborskyivitalii/pull/147) merged normally
as `a2dba6b7`; tested head `8d87965d` and merge share tree `4a0fc8a6`.
Merge parents are original protected main56404df6 and tested head8d87965d.

| Original source-bound observation | Completed result |
| --- | --- |
| [Basic40315066141](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/40315066141) | 76 modules,1135/1135 tests, zero fail/skip/cancel/todo; clean identical source before/after. Original source ZIP12646093096 verified against native size/digest/CRC. |
| RI40315066045, owning40315066082, routing40315066054 | Each passes. Preview40315066090 build/publish/two-width smoke pass; its then-missing staging admission remains a historical failure. |
| [Owner stage40316734726/1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/40316734726) | All26 preflight guards,74 modules/1122 tests, static/host/browser/performance gate, stable promotion, merge admission and independent receipt pass. Controller remains main564; checked-out candidate remains8d. |
| Prepublication12647352337 and package12647461898 | Original native size/digest/CRC/extracted bytes match;67 preflight report hashes verify. Source and gate both have `articleCandidates: []`; R38 is absent. |
| Promotion12648625344 and gate12648545281 | Original ZIPs verified; stable HTTP passes against original8d package. Previous recovery remains actual PR146 sourcef2f2ac25; current recovery remains8d. Bounded staging keeps fullGate/productionEligible/deploymentAuthorized false. |
| PR-event refresh40318862598 and owning40318862494 | Both pass after successful-stage body receipt; no repeated website build/browser campaign. |
| [App40319057158/1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/40319057158) | Genuine App5453173/check121559259755 succeeds with no blockers. Maintainer explicitly confirmed exact8d control head; comment6415164201 records the separate human decision. |
| [Postmerge40319369015](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/40319369015) and mainRI40319367866 | Both pass. GitHub reported clean protected admission before expected-head normal merge; tested package is not rebuilt/relabelled as merge producer. |

Four distinct browser_archive role agents independently accepted completed native
Basic/preflight/package evidence: Requirements, Code, White-box and Exploratory.
They checked original ZIPs, raw accounting, clean source/tree bindings, frozen
browser owners and empty article selections. Their bounded readbacks did not
substitute for later staging/App/merge gates; native results above supply those.

Measured native intervals: prepublication guards213s including source tests120.689s;
browser/performance execution403s; promotion63s. These are execution observations,
not future latency guarantees. Queue/setup/end-to-end reconciliation remains R3d.
The [live delivery receipt](https://github.com/oborskyivitalii/oborskyivitalii/issues/122#issuecomment-6415527328)
retains full Git identities/native artifact pointers. PR79 stays Draft/open at02a4f6ae;
R38 remains untouched and unpublished. No production/DNS action.

## Necessary repository handoff after accepted S

Current maintenance replaces stale MEMORY statements describing main564/PR147pending,
appends this delivery record and regenerates RI. Accurate continuity under AGENTS15
is the substantive purpose. The complete delta must remain repository-only:
no policy/control guide, workflow, tool, test, site or article edits.
Current-source classification, repository checks, four completed roles, genuine
App/protected merge and postmerge remain required; this receipt alone is not M.

After actual M, prepare isolated existing-content C using ordinary accepted PR147 S.
Require authenticated complete S→M→C history, exact platform reuse, affected hosted
observations and recovery/source/predecessor leases through the existing owner.
AC03/06/08 remain open. Final contracts/profile/timing reconciliation follows;
R38 publication is no prerequisite and fixture generation is not a real release.
