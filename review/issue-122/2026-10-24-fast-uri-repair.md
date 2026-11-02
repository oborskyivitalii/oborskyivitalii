# Issue 122 — 24 October 2026 App proof and fast-uri repair preparation

Owner: https://github.com/oborskyivitalii/oborskyivitalii/issues/122.
Implementer record; independent results are attributed below, not self-acceptance.
Base main a7d3d9456b85e444456c9d167e9ab813fe62787f / complete tree
f7ef995b262d314e5d84148cd0cf5b362eead2cd. Main delivery is not authorized by
the App experiment: its accepted runbook explicitly excludes a main merge.

## Intent and acceptance

The owner completed direct private-key entry and asked to continue the approved
private App/environment and isolated native proof. App configuration and negative
proof succeeded. The unchanged-source positive route encountered an actual new
advisory. Prepare a concrete compatible repair for a specific owner decision;
do not weaken admission, repeat a failed stage blindly or claim positive proof.

Requirements separately accepted this repair preparation before implementation:
only fast-uri3.1.8 to3.1.9's locked version/resolved/integrity fields, necessary
history/RI bookkeeping, fresh installed dependencies, unchanged advisory admission,
affected schema/lint/format/build/source checks and four actual independent roles.
A Draft PR is permitted; Ready/full delivery/owner staging/main merge remains
a separate new decision. Direct tools, consumers, scanners, ledgers, workflow
inventory, profiles, cases and budgets retain their existing meanings.

| Bounded subcondition              | Observable acceptance / oracle                                                                                  | Whole issue contribution                |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| R01 minimal compatible repair     | Only one lock entry changes; all three existing Ajv consumers permit ^3.0.1, direct pins unchanged              | AC04 preservation only                  |
| R02 actual installation/admission | Fresh npm ci and complete graph; full unchanged npm/pip advisory admission; old failing raw input still rejects | AC04 preparation only                   |
| R03 affected behavior and reviews | Actual Ajv ref/type behavior, maintained checks and four distinct source reviews                                | AC04/07 preparation only                |
| R04 honest handoff                | Exact Draft source, original failures, cleanup and explicit native/delivery/positive-proof gaps                 | AC05/06/08 partial; no whole completion |

CS01/04/05/07/08/09/10 apply: maintain the package lock owner, one small concern,
canonical formatting, original bounds, meaningful existing oracles, bounded style
guard and exact source/evidence limits. No new permanent version-mirroring test,
scanner, waiver, exception or trusted controller is introduced.

## Actual App configuration and native proof

Private App5453173, installation174757834, selected repository1400059184 only:
Checks/Statuses write and Metadata read. Environment25205111419 allows exactly
branch main, no tags or administrator bypass. Matching numeric IDs and the named
environment-only secret were read back without reading credential material.
The owner generated/entered the key directly. Enable was saved last.

Actual main authentication:40081786727/1 emitted genuine check120836774463 from
App5453173, correctly rejecting closed PR133. Original ZIP12555706520 SHA256
a4137d29217f339db3566862730939493b708f87dbe0dc8ee1867fe2eca26514
contains the expected closed-PR diagnostic, not a successful admission.

H66e07ec6e114d68aa7a125e0057f2a6d619c49da was one empty commit, parenta7,
complete treef7ef unchanged. PR134 targeted the isolated probe at a7; PR136
targeted main at a7 with the identical H. Temporary rule25777001 required
Change admission from App5453173, strict, no bypass.

The separate F71c89213c06cdf5c94f6480ad57c773534801108 /
tree43b1c88b0388d9b0183868d4ee2c2856d8085204 never entered H or main.
Its versioned preflight/source reviews remain at
https://github.com/oborskyivitalii/oborskyivitalii/blob/71c89213c06cdf5c94f6480ad57c773534801108/review/issue-122/2026-10-24-admission-proof.md.

| Native scenario       | Actual independent oracle/result                                                                                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing check         | Complete18-check snapshot, no matching result; normal PR134 merge405 explicitly requires Change admission. Target remaineda7.                                                                                                    |
| Wrong App             | Check120843020537 SUCCESS from Actions15368 on H; normal merge405 explicitly says it was not set by the expected GitHub App. Complete19-check snapshot retained, target unchanged.                                               |
| Environment isolation | 40083965378/1 job120843032047 denied refs/pull/135/merge by environment policy, steps empty/runner0. Sentinel never executed; no secret reference or read.                                                                       |
| Evidence identity     | Original foreign artifact12555929650 ZIP SHA2560bf09acf01fa1a123b444a2f013638d74d06cfdca7919c3802e7fba4013dff75 authenticates exactF/H/base/Apps/check/run/attempt. Overall workflow failure is the expected environment denial. |
| Positive full route   | BLOCKED, actual owner40084246516/1 failed advisories; no new independent receipt/genuine success/isolated merge. Genuine App545 check120845849856 correctly remains FAILURE, external40084913513/1/136.                          |

All four actual distinct roles independently ACCEPTED F source and the bounded
native negatives: /root/t04_setup_requirements, /root/t05_code_preflight,
/root/t05_whitebox_preflight, /root/t05_exploratory_preflight. Each inspected
actual source, original records/artifact and fresh native metadata. White-box
also observed native zero steps/runner0; exploratory reconciled seven operator
cases. Their findings do not accept the blocked positive route.

PR134,135,136 were closed UNMERGED. Temporary rule25777001 and exact temporary
F/H/probe refs were removed; API reads return404 for each ref. Original main and
production protections, App/environment and enabled configuration remain.
No rollback is claimed. No promotion occurred in the failed positive run; the
last recorded accepted staging remains tested24090669/stage40038634536/1.

## Actual advisory failure and proposed repair

Native owner40084246516/1 bound controllera7, H66e07 and treef7ef. Its
original prepublication artifact12556776632 ZIP SHA256
f612c4237a99693e1b374f40af1de1cd03530f01671312e04a5efbc2a14241b3
was physically authenticated. Exactly25/26 guards PASS; only advisories FAIL.
Source696/696 in122585ms under180000ms, Python128 and all other guards passed.
This failed run is retained as failed and never relabeled.

Raw npm report SHA256de1f6c19bd99f6930f72880e2eaf371dad8ba82568725d1f59d72c95f57cb4ab
identifies four fast-uri findings: GHSA-w74x-v6f9-j3xg,
GHSA-xhq7-xmqj-769h, GHSA-wjr9-j795-jxcr and GHSA-333x-w4r6-6crp.
Affected installed leaf3.1.8; patched3.1.9. Official advisory:
https://github.com/advisories/GHSA-w74x-v6f9-j3xg.
Three Ajv8.20.0 consumers under ajv-formats, lighthouse and table already require
^3.0.1, so the patch stays within the declared range. npm update changed only
that leaf's version, resolved URL and integrity; package.json and every other
lock entry remain unchanged. No advisory exception is added or renewed.

## QA design and actual checks

| Risk                                   | Meaningful oracle / actual evidence                                                                                                                                                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Broader dependency churn               | Structured lock diff and complete installed npm graph; direct pins and every other entry must equal a7.                                                                                                                                                  |
| Schema/ref regression                  | Invoke each of three actual Ajv installations: relative external ref resolves valid string; wrong type and missing required property reject. Local9 observations passed.                                                                                 |
| Silent scanner waiver                  | Feed the original failing npm report to the unchanged admission function: still rejects untriaged advisory. New raw npm audit reports zero findings over298 dependencies.                                                                                |
| Broken or incomplete tool installation | Fresh npm ci298; exact locked Python graph required. Local bootstrap pip25 metadata residue was caught as duplicate and quarantined outside the venv after lockedpip26 installation; validator/executables unchanged. Corrected graph PASS91/147/exact4. |
| Code/format/RI/source regression       | Basic, maintained formatter/full lint, source staging profile within existing180000ms worker limit, RI29/coupling20/freshness17/15 and bounded style guard. Exact passing checks and full-source timeout retained below.                                 |
| False delivery claim                   | Draft preparation only; no owner stage/merge/production/positive-App success may be inferred from local checks.                                                                                                                                          |

### Exact local results and preserved failure

Checks consumed clean local commit96fa17c7b9a74bb196b5da713ebacc446b591efc /
tree227890f30c28a457fed8b885d778fb4e212f0df9. Basic24 and real artifact build,
complete formatter391, full lint260, RI29/coupling20/freshness17/15 and bounded
style110 PASS. Fresh complete npm graph and Python91/147/exact4 PASS.
The unchanged full advisory admission passes npm0/298 dependencies and Python0/91;
the original failing raw report still rejects without any waiver.

Full source validation FAILED with ETIMEDOUT at the unchanged180000ms worker
limit. Source is clean before/after; TAP contains59 partial named subtests and
no final accounting. There is no current696-pass claim and no established cause
for the timeout. No budget change or blind rerun was performed. R03 full-source
verification, Ready/native CI, owner staging and main delivery remain OPEN.

Original local reports are retained byte-for-byte in
2026-10-24-fast-uri-local-evidence.tar.gz, SHA256
e387b09454e3242a8e9d35860012f70092889177d03311e9cf11c8805a0dcc16.
All19 captured files match the archive manifest's sizes and SHA256 values.
It preserves the failed source JSON/TAP, current raw audits, scanner wrappers,
complete graphs, Basic/artifact, formatting and RI/coupling logs. The bundled
Git objects retain exact local96fa relative to public parenta7. This factual
receipt/archive and deterministic catalog/RI refresh change no functional bytes.

The actual pinned CI Node24.19 remains a native gate; local host is Node24.22.1,
Python3.12.14. Local checks are preparation evidence, not native staging acceptance.
No browser matrix is added for this transitive audit-tool leaf.

## Independent role executions

| Role         | Separate agent                  | Actual candidate result                                                                                         |
| ------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Requirements | /root/t04_setup_requirements    | Preflight and completed96fa/tree227 ACCEPT as reviewable Draft preparation only; full R03 OPEN.                 |
| Code         | /root/t05_code_preflight        | Completed96fa/tree227 ACCEPT for reversible preparation and a Draft PR only; source timeout remains blocker.    |
| White-box    | /root/t05_whitebox_preflight    | Completed96fa/tree227 ACCEPT for reversible preparation and Draft only; full-source/readiness OPEN.             |
| Exploratory  | /root/t05_exploratory_preflight | Completed96fa/tree227 ACCEPT for reversible preparation and Draft publication only; full-source/readiness OPEN. |

All four inspected the actual source/check receipts and independently confirmed
unchanged critical owners, current raw audit admission and native cleanup. Code
and Requirements independently exercised9 Ajv observations each; exploratory15;
white-box15 consumer observations,7 patched-URI cases, all4 original advisories
and4 invalid-feed cases. Each explicitly retained the180000ms timeout and refused
a complete-source, Ready, delivery or genuine-positive claim. No role authored
the repair or its tests. Their bounded acceptance does not close whole ACs.

## Decisions and next action

Prepare and review the exact Draft repair under issue122. Ask only for the new
specific full-delivery/owner-stage/main-merge decision when the concrete result
is reviewable. A future repair uses the original three protected-main requirements;
the separate new App correctly blocks unsupported lock-control changes and is
not a main requirement. Never shrink its execution inventory to make this pass.

After separately approved normal delivery, resume genuine proof against fresh
main/head identities with fresh full-route receipt and isolated enforcement.
Original H positive/receipt/isolated merge remains unproved. Synchronous freshness,
per-PR policy binding, trusted control repair and later lane migration remain open.
All whole AC01–AC08 and T05 checkbox states remain open.
