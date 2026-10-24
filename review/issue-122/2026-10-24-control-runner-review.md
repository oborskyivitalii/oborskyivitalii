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
