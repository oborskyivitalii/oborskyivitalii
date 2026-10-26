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
Registry data now exists; authenticated consumer restore/first-launch on fresh
native runners, current-source delivery and site acceptance remain pending.

All four role-specific agents independently accepted the actual three-pin
ingestion at registrySHA2565391eb775de1bda70f7a1daa9783d26025708b2bf4c56bd05e0d6c8f4c924c43.
They compared original pin ZIP/JSON, live native metadata, source/producers,
lock/registry/revision/system identities and all three digest pairs. White-box
also exercised actual-pin duplicate/bare-digest refusals; Exploratory exercised
the real pinned CLI's missing-token failure with zero launches/no destination.
Each leaves fresh native consumption and site acceptance pending. Eleven
focused cases and current RI/coupling verification pass after actual pins.

Actual seed timings from native job/step timestamps, in seconds:

| OS | Queue to job start | Setup to acquisition | Acquisition | Probe/package/selfcheck | Total job |
| --- | --- | --- | --- | --- | --- |
| macOS | 3 | 92 | 11 | 39 | 152 |
| Windows | 2 | 91 | 175 | 131 | 406 |
| Ubuntu | 3 | 37 | 77 | 148 | 276 |

These are one-time supplier preparation measurements. They do not measure site
test execution or establish a healthy-CDN speed comparison or overall AC08 pass.

## Remaining #122 plan

1. Finish/review this repair; seed exact native archives and rebind consumers.
2. Obtain current-source checks and the existing protected delivery route.
3. Verify ordinary content/history/recovery against a compatible accepted
   ordinary staging generation. The old146generation includes an R37preview
   reference from the old controller and correctly cannot feed ordinary[]reuse.
4. Reconcile documentation/ACs/actual queue/setup/execution and close only after
   all original obligations pass. R38 publication is no prerequisite.
