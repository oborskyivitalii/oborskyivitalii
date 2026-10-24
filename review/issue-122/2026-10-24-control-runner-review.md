# Issue122 — 24 October 2026 contained-runner review

Owner: [issue122 and accepted two-task scope](https://github.com/oborskyivitalii/oborskyivitalii/issues/122#issuecomment-6386125270).
Base: protected main `dbb11f0919c0c436d0de9df75edc569c0fc69b8d`.
Candidate: explicitly dirty preparation until a source-bound commit is published.
The prior PR140 is delivered; this is its separately authorized next batch.

## Intent and acceptance

The maintainer requested the next1–2tasks, full normal delivery, then current
status, next tasks and position/remaining work toward the whole issue. Task1
defines trusted P versus immutable B/H execution containment. Task2 implements
one dependency-free delivery-json module path and actually proves it on a
supported native runner. Whole AC01–AC08 remain open.

TR01 identities; TR02 fixed P-owned selection; TR03 filesystem boundary;
TR04 network/process/privilege/environment/FD boundary; TR05 finite resources
and cleanup; TR06 independent host oracle; TR07 unavailable containment blocks;
TR08 actual native positive/negative proof and existing CI allocation. The
canonical contract and CLI live in [SITE-CONTROL-CHANGES](../../guides/SITE-CONTROL-CHANGES.md#single-module-execution-experiment).

P records actual hashes/dirty state and is never relabeled protected B. Candidate
stdout may imitate finite outputs, so agreement cannot prove benign intent,
full correctness or trusted admission. Kernel/daemon/runtime are explicit trusted
infrastructure; the local Docker socket is never exposed inside the candidate.
No image fetch, install, arbitrary command, App/protection or production action.
CS01/04/05/07/08/09/10 apply; all original full-route obligations remain.

## Independent role executions

| Role | Actual separate agent | Inspected scope and observed result | Remaining gate |
| --- | --- | --- | --- |
| Requirements/Acceptance | `/root/proof_requirements` | Preimplementation independently read live issue/main/contracts. Accepted fixed delivery-json Docker slice subject to TR01–08, real native proof and explicit P/B distinction. Independently observed local namespace EPERM/zero capabilities | Prepared candidate accepted; correction/native reconciliation pending |
| Code Review | `/root/proof_code` | Independently inspected existing helpers and platform. Confirmed external oracle necessity; Docker resource-control design accepted subject to actual inspect/enforcement, bounded shared memory and complete cleanup | First prepared candidate reviewed; C-RUN01 correction recheck pending |
| White-box QA | `/root/proof_whitebox` | Actual independent candidate review completed | Correction/native recheck pending |
| Exploratory/Interaction QA | `/root/proof_exploratory` | Actual independent candidate review completed | Correction/native recheck pending |

### QA allocation and independent oracles

| Risk/AC | Scenario and external expected result | Existing selected route | Actual result |
| --- | --- | --- | --- |
| TR01/02 | Immutable module extraction ignores dirty worktree; invalid ref/mode/size/nonancestor reject before execution | Permanent control-runner source suite → existing Basic/staging/production registry | Initial8test source run passed; final source pending |
| TR03–05 | Weakened actual container configuration rejects; actual canary/network/env/cgroup/scratch/PID/memory/timeout/output observations and verified resource absence | Permanent config negatives plus separate nonrequired native probe | Native not yet observed |
| TR06 | Wrong/extra/forged/missing bytes, failed execution or uncertain cleanup cannot count as probe success | Permanent external-oracle cases plus native false-output cases | Initial source cases passed; native pending |
| TR07 | Unavailable Docker blocks before candidate import; no fallback | Permanent fault injection plus actual local capability observation | Local namespaces fail EPERM; Docker unavailable; no contained pass claimed |
| TR08/AC07/08 | Actual native source/artifact identities, four roles and complete original delivery | Owning PR/source/RI/staging/admission/merge/postmerge | Pending |

### Findings and dispositions

- PRE01: local bwrap/user namespace creation is denied despite installed bwrap0.9.
  Do not downgrade isolation. Docker cgroups selected for aggregate resource
  bounds; local unsupported remains blocked and native proof is required.
- PRE02: H shares inner Node globals/stdout with the driver. Host literal oracle
  and accounting stay outside; passing finite observations grants no authority.
- PRE03: Docker default mounts/shared memory and uncertain daemon cleanup must
  be represented honestly. Explicit1MiB shared memory, bounded scratch, actual
  configuration checks and owned-resource absence are part of acceptance.

## Whole-issue position

| Workstream | Delivered foundation | Remaining whole outcome |
| --- | --- | --- |
| W1 | Routing/trust contracts and inventory ownership | Reconcile final operational lane/control contracts |
| W2 | Conservative observation classifier and negative evidence | Final admission selections demonstrated against actual lane outcomes |
| W3 | Dedicated App configured, isolated App/SHA proof, structural lock prototype | Trusted control evolution; per-PR isolation/freshness; protected migration and proportional checks; real repository-only merge without website work |
| W4 | Separate source/artifact identity contracts | Accepted-site reuse across repo history; existing issue5/PR79 integration and real independent content release |
| W5 | Increment-level independent reviews and exact delivery receipts | Real lane/concurrency/recovery/publication scenarios; queue/setup/execution measurements and final reconciliation |

No fabricated completion percentage: foundations are delivered, operational lane
transition and end-to-end acceptance remain. This batch supplies a bounded
containment prerequisite toward AC04/05 and its own AC07/08 evidence only.

## Delivery and issue synopsis

Implementation, four completed reviews, current-source CI/native proof, unchanged
full owner stage, eligible admission, protected merge and actual postmerge are
separate gates. None is marked completed in this initial preparation. Update
only observed current-source results; preserve failed attempts and remaining
parent gates. Report this batch and the whole-issue map before another task.

## First prepared candidate and correction

All four actual roles inspected prepared tree
`87ed8c1d244bcd1cc79dd9a9b874627832d79c93` against base dbb11f09.
Requirements independently ran8/8source cases and accepted preparation only.
Code found C-RUN01: a lost daemon import/create response plus an empty immediate
inventory could overstate cleanup. White-box independently ran8cases and a
creation/removal failure injection; it found WB-RUN01: Docker injects HOSTNAME,
so the three-variable native oracle would fail. Exploratory executed eight
actual CLI/invalid-input/missing-daemon/sentinel/proof-failure cases, accepted
local fail-closed behavior and retained the native gate. No actual containment
pass was observed locally.

The coherent correction adds explicit constant HOSTNAME and a four-variable
configuration/runtime oracle. Cleanup now records acknowledgement/uncertainty,
requires successful removal of acknowledged immutable resource IDs, and checks
name plus ID absence. A lost import/create response remains unverified even
after empty listings; best-effort removal and exact resource names are retained.
Attachment timeout/output failure on an acknowledged container goes directly
to removal by immutable ID; no inspection delay precedes containment cleanup.
Captured output is clipped to the documented64KiB per stream. Two permanent
lifecycle tests cover uncertain creation, removal failure and surviving IDs.
Git wording now distinguishes inherited/system/global settings from local
repository configuration. Incidental Unicode escaping in metadata was removed.

Docker's documented [Linux environment defaults](https://docs.docker.com/engine/containers/run/#environment-variables)
confirm HOSTNAME injection; [resource constraints](https://docs.docker.com/engine/containers/resource_constraints/)
define same-memory/swap and cgroup requirements. Actual native behavior still
requires the retained executed proof, not documentation alone.

Initial bounded checks passed:8source cases, Basic24, style guard, RI freshness,
RI/CI map17checks/17layers, RI-coupling regressions, RI/navigation regressions,
architecture and complete lint. Corrected current-source checks/reviews follow.

### Completed correction rechecks

All four actual roles independently rechecked corrected prepared tree
`f89adac695e1126ae6cc7c5028d8a388fa32f358` and returned ACCEPT for native
verification, not completion. Requirements and White-box each actually ran10/10
focused source tests. Code independently ran exactly the two new lifecycle cases
(2/2, no skips), closed C-RUN01/02 and reused unaffected original source review.
White-box additionally rejected wrong HOSTNAME, surviving image ID and uncertain
creation despite empty inventory. Exploratory actually exercised acknowledged,
uncertain, failed-removal and residual-ID adapters plus unavailable-Docker CLI;
its unaffected eight-case charter remains applicable. These mocked adapter/local
observations do not establish native Docker enforcement. No remaining prepared
source blocker; native proof and complete normal delivery stay pending.

Corrected local style, RI freshness and coupling verify pass. Owning mapping
passes5/5 mechanical checks with no errors and explicitly dirty-source identity;
all external gates and issue closure readiness remain pending/false. This factual
receipt and deterministic RI refresh do not alter the reviewed implementation.

## Native attempt1 — configuration ordering failure

Published H311fa2c8/treea23b3534 ran native40109509683/1, job120918100922.
Original artifact12565428500 ZIP SHA256
`843bc6a19d9fad70558ca6a16e9d6bc6b847303cc4785972032c663a13f8e39f`
was physically downloaded and authenticated. It remains FAILED: Docker28.0.4,
cgroupv2 and actual local runtime image/container creation succeeded, but the
stopped configuration returned Ulimits in core/nofile order instead of the
fixture's nofile/core order. Exact values matched. Execution never started;
cleanup was actually acknowledged and verified. No candidate/synthetic native
pass is claimed. Node24.19.0, Ubuntu24.04.5 image20261012.334.1 and kernel
6.17.0-1022-azure are recorded in the original reports/logs.

The bounded correction compares the exact limit objects sorted by their names;
all names, values and multiplicities remain mandatory. One regression accepts
both orders while rejecting missing, duplicate, unknown and modified-soft/hard
limits. The raw stopped configuration is now retained before validation, including
failure cases. No resource limit, profile or admission obligation changes.
Four actual delta reviews and a fresh native proof remain required.

All four actual roles independently authenticated that original ZIP and accepted
correction tree `3006afac93844b98de1b0f0eb0a7d6e35da933dd`. Code, White-box
and Exploratory each executed the new strict permutation/negative case; Requirements
ran11/11 focused cases. Each retained pre-execution failure and pending native
proof, and found no limit/acceptance weakening. Exploratory also authenticated
the referenced raw report digest. Initial H311fa2c8 Basic40109509767, navigation
40109509699 and owning40109509688 completed successfully; these remain historical
source observations, not proof for the corrected future head.


## Final delivered batch and resumed-session reconciliation — 24 October 2026

The earlier pending entries above are historical checkpoints. Both authorized
tasks are now complete: the containment contract and the single-module experiment
with actual native positive/adversarial evidence and normal full delivery.
[PR141](https://github.com/oborskyivitalii/oborskyivitalii/pull/141) merged normally
as `e255fa3a7d6f86c5b282779f3add12ba1dc759c5`. Tested H
`c2b11d832d218297a6e817fe138e1e326962c5dd` and actual M share exact complete
tree `9d836339e3bf39ed9c3d1d26c4f977d89046894c`; B remains
`dbb11f0919c0c436d0de9df75edc569c0fc69b8d`.

| Gate | Actual source-bound result |
| --- | --- |
| Current source | Basic40109998668/1 passed719/719 in150666ms under unchanged180000ms; all11 new cases are actual TAPok302–312. Navigation40109998653 and owning40109998561 passed. |
| Native containment | Run40109998585/1 passed11scenarios/12actualcontainerexecutions. All four P implementation hashes and all11 raw case report hashes match. Real B/H modules have identical SHA25634a645a4971e0cda36c80d1384bf88d758abae3eed1cbaa3749c7f6850b337b0; ten additional executions supply adversarial cases. |
| Observable boundaries | Actual filesystem/environment/privilege/network/cgroup/scratch/shared-memory/PID controls, OOM137 with OOMKilledtrue, timeoutETIMEDOUT, floodENOBUFS, crash7, and host rejection of forged/wrong output. Every executed container has acknowledged and verified cleanup. |
| Full owner stage | Run40110481719/1 passed26prepublicationguards,719Node/128Python, security engines/audits, static/host/browser/performance/gate, stable promotion and new independent receipt. Original profiles, pins, cases and budgets unchanged. |
| Hosted observations | 29servedfiles,6journeys/30routeobservations,2navigation/10failure/7analyticscases,2CPU samples/4flights/2mobile Lighthouse trials. Skipped optional matrices remain optional/skipped, not executed passes. |
| Independent receipt | Artifact12565964350, job120925235173 binds PR141/H/B/stage40110481719/1. |
| Eligible admission | Run40112034780/1 passed Staging admission120925583502; refreshed owning40112034645 passed. The original three required contexts governed normal merge. |
| Actual merge and postmerge | Run40112223401/1 identity120926152745 passed; artifact12566813602 records actual M, exact shared tree and unchanged public bytes. Main navigation40112223122 completed SUCCESS on actual M. |

Accepted public digest remains
`487702b94acaf550433bfddb99db66cf94ed1d7925772e0554108cb13ded188f`;
tested package remains
`75ad3c7b196788f0e873a6ea09608b5b21e81332097e6a47741f9e73dab8ac24`.
Accepted staging continues to name tested H, not a relabeled M or rebuild.
No production action, App control-acceptance activation or protection migration
was performed by this batch.

### Actual independent final receipt reconciliation

The resumed session launched four distinct nonauthoring agents against actual
M/H/B source, original ZIPs and raw reports. Prior implementation/correction
reviews remain applicable to their unchanged source. These are independent
receipt executions, not an implementer substituting role names.

| Role / actual separate agent | Independently inspected or executed | Result and limits |
| --- | --- | --- |
| Requirements — `/root/runner_requirements` | TR01–08 contract-to-native/source/stage/identity traceability, source and case hashes,12cleanupreceipts,6originalZIPextractionsets and H/M trees | ACCEPT bounded two-task completion; whole lane/trust ACs open |
| Code — `/root/runner_code` | Actual runner/driver/proof/workflow/test diff;11/11sourcecases; all retained ZIP extractions; producer/case/B/H hashes; live native/postmerge artifact digests | ACCEPT, no bounded source blocker; native execution authenticated rather than rerun locally |
| White-box — `/root/runner_whitebox` |11/11sourcecases, all12stoppedconfigurations with current validator, all native/prepublication hashes, finite positive and forged/wrong oracle outputs, OOM/timeout/flood/crash/cleanup paths | ACCEPT, no blocking bounded coverage gap; no branch-percentage or general admission claim |
| Exploratory — `/root/runner_exploratory` | Actual CLI missing args/mutable ref/nonexistent object/missingDocker: all exit1, no host fallback; native/source/host/browser/gate/promotion/receipt/postmerge artifacts and live API digests | ACCEPT; actual local missingDocker remains blocked/executedfalse, native/hosted observations authenticated from retained reports |

All four retained the same scope limit: finite fixed outputs and named boundaries
under trusted host kernel/daemon/runtime. Real B/H helper bytes are identical.
Hostile synthetic modules do not establish arbitrary changed-helper compatibility,
full toolchain/package authenticity/audit or general control-change admission.
Merge/deploy/App/reuse authority in the experiment remains false.

### Original artifact preservation

The following exact original ZIP bytes are retained together with a JSON manifest
in [the evidence archive](2026-10-24-control-runner-evidence.tar.gz). This is a
factual preservation copy; it neither rebuilds artifacts nor changes their issuer,
run, attempt, tested source or historical conclusion.

| Original ZIP | Run / artifact ID | SHA256 |
| --- | --- | --- |
| failed-1.zip | 40109509683/1 / 12565428500 | `843bc6a19d9fad70558ca6a16e9d6bc6b847303cc4785972032c663a13f8e39f` |
| passed-2.zip | 40109998585/1 / 12566187329 | `519afca54abeb31a5ff954927b4f95893b296ad57ce041a86adc949d37d84e9f` |
| source.zip | 40109998668/1 / 12565509375 | `c325952dcf9a631889f1ee05b1c071725c3d8c372161150864872c269dacdae1` |
| prepublication.zip | 40110481719/1 / 12566179073 | `63169f57c826523cf70cb1af7c7808bb1407cb17b6a5b620a3aad043f4c020ed` |
| package.zip | 40110481719/1 / 12566507825 | `93c3f2128cc23402a5c875b5c21359cb0415715a96f9e709c4460fdb9858d3e2` |
| public.zip | 40110481719/1 / 12566004676 | `810715167780277b35fcab13dc4f22570b087ae6b5941402fc71d6e8ef321728` |
| host.zip | 40110481719/1 / 12566039789 | `42006bdecaab814c5e6e978f70d517adf557d9bc9da2c588f964bf8e021059ae` |
| static.zip | 40110481719/1 / 12566677448 | `77330f1fabf389a7e855b776d752ca4923f5fd4eab41eb1d86fb8870f89df8c9` |
| browser.zip | 40110481719/1 / 12566479181 | `8e762451f933b1859f3b9741d271d101eea69d76cc46d49dfaad5d83054eb04f` |
| gate.zip | 40110481719/1 / 12566603847 | `57d3f7202b1ddc6d48531d48110d993a0ddeb8a2b8728c5888fdb6f9e49a7b4a` |
| promotion.zip | 40110481719/1 / 12566668735 | `b562ce5617fcb7d238ec3fab63502898685dceb2dd1bf895a16be0f8f2b0de18` |
| receipt.zip | 40110481719/1 / 12565964350 | `cb255df50e8bdace6738cc811650834d45a86ffa2177410e5831f3486ae68fe8` |
| eligible.zip | 40112034780/1 / 12567455000 | `fe0c169fd66d10134edbf6e869fb8b715cd5c3b74837ab2d0a4fe1a795c6bdde` |
| postmerge.zip | 40112223401/1 / 12566813602 | `aee8cfcede1c4ad97dfaf505aea8480fac6cd5967609a05d71467dd16789acb1` |

Archive SHA256: `e5d5b7b71f75c675f1b93d29d58e721a9e7737df7671fca66e48134c8899a2a1`.
The first native40109509683/1 remains FAILED before execution because of unordered
Docker Ulimits presentation; the strict corrected comparison and its meaningful
missing/duplicate/extra/value regressions preserve every limit.

### Nonrequired admission failures and whole-issue state

The experimental App correctly blocked PR141's execution-control delta with
`unsupported-execution-control-change` (check120926067227/run40112097437).
Postmerge experimental runs40112223163 and40112281675 remain FAILED: their
issuer logs reject PR117/110/107/79 because their base SHA differs from current
M (`PR base moved`). This is retained as an isolation/freshness integration gap,
not relabeled a passed check or a production failure. App remains nonrequired
on main; original required delivery and postmerge evidence above are separate.

- [x] Task1: explicit P/B/H containment/limits/observable-acceptance contract.
- [x] Task2: narrow immutable-module experiment, actual native positive/adversarial
  evidence, four independent roles and normal full delivery/postmerge.

Every whole T05/AC01–AC08 remains open. W1/W2 foundations and this W3 containment
prerequisite are delivered. W3 still needs trusted control-change integration,
per-PR isolation and synchronous freshness, protected migration/proportional
checks and a real repository-only merge without website work. W4 still needs
accepted-site history/reuse and issue5/PR79 independent content integration and
release. W5 still needs real lane/concurrency/recovery/publication outcomes,
queue/setup/execution measurements and final documentation/AC reconciliation.

Next proposed bounded batch: define the minimal protected control-change
admission slice using this runner, then implement and actually demonstrate one
such slice with negative cases. Existing per-PR failures belong in its trust/
freshness design; neither this receipt nor the completed containment experiment
activates App authority, changes protection or starts a third implementation.

Final receipt-only checks: Basic24/24, bounded style guard, RI29/29 and coupling20/20
passed; refreshed RI/CI17checks/17layers and generated RI freshness passed. The
14 preserved original ZIPs were re-extracted and compared byte-for-byte to their
recorded SHA256/length manifest. No executable, test oracle, workflow, profile,
scanner disposition, budget or accepted public/package bytes change in this
evidence-only preservation commit. Its clean exact-commit owning-policy result
is reported in the linked final issue receipt; no full hosted suite is repeated
for these factual receipts/derived metadata.
