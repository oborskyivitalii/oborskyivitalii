# R1: manual single-PR admission

## Context and source

Owner: [issue122](https://github.com/oborskyivitalii/oborskyivitalii/issues/122),
R1.1–R1.5 under the 24 October bounded completion plan. The maintainer said
“Роби” for this single step. Base: `e255fa3a7d6f86c5b282779f3add12ba1dc759c5`.
Prepared source is the changed worktree until an exact committed identity is recorded.
The suspended helper-specific SHA-256 experiment is excluded.

Only owner/main manual dispatch selects one PR/current head. Ordinary refusal
keeps the bound App result failed while the evaluation workflow completes;
API/auth/identity/dirty-source/storage/protocol faults remain hard failures.
Existing global serialization, required main checks and full delivery remain.
No R2 stage-selection/control-admission/protection changes or production action.

## Independent reviews

| Role / actual agent | Scope, finding and outcome |
| --- | --- |
| Requirements / `/root/plan_requirements` | Preimplementation source/scope review accepted finite typed refusal, one bound target and strict error separation; candidate completion review and both-read identity correction accepted; no remaining requirements blocker. |
| Code / `/root/plan_architecture` | Complete source/policy/runbook review and targeted19/19 passed; CR-R1-01 second-snapshot identity classification corrected and rechecked. |
| White-box / `/root/plan_whitebox` | Actual initial19/19 targeted execution and source inspection passed. WB-R1-01 found malformed candidate identity treated as moved head; corrected with full-SHA validation and one case in the existing fault group. Correction review passed19/19; both snapshot reads now validate candidate/controller identity before classifying movement. |
| Exploratory / `/root/plan_operator` | Actual workflow-script simulation passed six bounded synthetic operator scenarios; source/hash readback accepted the correction. Hosted App behavior remains pending. |

The implementer does not supply independent acceptance. Four completed candidate
results and affected correction reviews are required before advancing.

## Bounded test and style disposition

Three tests join the existing admission suite: manual one-target/trigger
selection; refusal versus hard fault/storage behavior; selected-head movement.
The existing real-Git collection case also observes a stale base. All inherited
App/authentication/receipt/attempt/control guards stay. No new suite or matrix.

CS01/CS04: existing collector/issuer/workflow owners, explicit returned reports,
no candidate code in the privileged issuer and no duplicated publisher.
CS05: pinned Prettier3.6.2 on touched maintained sources.
CS08: targeted admission, Basic and mapped source/RI/owning checks; unchanged
normal hosted delivery still applies to this enabling PR.
CS09: existing bounded guard plus regressions.
CS10: R1.4 is the explicit AC04 style subcondition. Architecture and behavior
need substantive review; formatting/guard alone are not full style acceptance.
No runtime/CSS/assets or exception-ledger changes are intended.

## Acceptance evidence

| Criterion | Check / source | Result / remaining |
| --- | --- | --- |
| R1.1 | Manual-only workflow and one-target regression | Final targeted pass; actual main observation pending |
| R1.2–R1.3 | Publisher/collector refusal, hard failure and head-binding groups | Corrected targeted19/19 pass |
| R1.4 | Runbook/policy/catalog/RI/style and four roles | Prepared source checks pass; native CI pending |
| R1.5 | Original CI/owner staging/protected merge/postmerge plus one native dispatch | Pending |
| Whole AC01–AC08 | Useful repository/content lanes and actual protected outcomes | Open; not established by R1 |

## Decisions and next action

Deliver one atomic R1 PR through the unchanged route. Preserve original failures
and exact tested/merged/artifact identities. After normal delivery, perform one
manual-main admission on an existing open PR and authenticate its bound check,
report and workflow conclusion. Keep expected refusal distinct from successful
admission. Stop with a concrete blocker after the existing bounded retry policy;
do not expand into R2 or new prerequisite projects.

## Completed prepared-candidate review

All four actual roles completed their scoped candidate/correction reviews with
no remaining R1 blocker. Requirements and Code independently identified the
second-read identity variant of WB-R1-01; one shared validator now checks state,
candidate/controller SHA and exact controller on both reads before freshness.
The existing fault group covers both second-read identities, without a new suite.

- Requirements `/root/plan_requirements`: REQ-R1-01 resolved; scope, policy,
  runbook and original protection align. Acceptance is requirements alignment,
  not delivery.
- Code `/root/plan_architecture`: CR-R1-01 resolved; independent19/19 in1.10s,
  no failures/skips; all prior inspected scope retained.
- White-box `/root/plan_whitebox`: WB-R1-01 closed; final19/19 in1.64s and diff
  whitespace check passed. Behavioral diff SHA256
  `c739c1430e50f95f71769ae05033fa2329337156fa6530138363186d1b54c3d1`.
- Operator `/root/plan_operator`: targeted19/19 on the prior test hash plus
  actual inline-workflow simulation of owner/main onePR, Draft, stale base,
  failed required workflow, moved selected head and API/storage failures.
  The six scenarios passed; PR enumeration was a fail-on-call trap, original
  head/report binding and revocation were observed. Final source hashes were
  read back; added second-read tests do not change the simulated runtime.
  Extracted script SHA256
  `b304eb2a20725546b640fb1017d8eb7a179bf528fdf412d3bdda5f6bc170107a`.
  Raw tool stdout receipt is chunk0c9de7; the temporary harness was not retained.
  This is synthetic local execution, not hosted App authentication.

Prepared-source hashes reviewed:

| Owner | SHA256 |
| --- | --- |
| `.github/workflows/change-admission.yml` | `83ae9c409273daf5e4540855a76df95e3fe5f98e8469baf716ac2b09de3ab5e7` |
| `tools/quality/delivery-admission.cjs` | `530c0eb38163c3763270502870178fda4d9d2bd193acd6ac040641c6ebe06209` |
| `tools/quality/delivery-admission-issuer.cjs` | `5b49a0e3c03500a2e9750512813466948ae2502eb2323f97d31efa377db078d9` |
| `tests/delivery-admission.test.cjs` | `c5ab597f8ce20ab5b1ee264d587d1ff93d37b5ffeb95cac7aeea19177ac3650d` |
| `guides/SITE-STAGING.md` | `920a5a9d7c3b5d9953ea67e41f6c1c2bef2b0fc2d3c7d4062096ef5efa38fe17` |

Root local Basic passed14baseline plus10Color focused cases; code-style guard
and15style regressions,29RI regressions and20coupling regressions passed.
Pinned formatter check passed399 maintained files (Prettier3.6.2/Ruff0.16.10).
Formatter binaries were reused locally at their exact versions; this is not a
new installed-toolchain/advisory-graph acceptance claim. Native CI/staging must
install and check the current locked toolchain under the unchanged full route.

The initial CLI invocation of RI build lacked its required config argument and
failed before building; the corrected explicit-config build/verify passed.
The initial default formatter invocation created avoidable style churn; canonical
repository settings restored the bounded diff and the actual formatter check passed.
No such preparation failure is a hosted delivery pass or a reason for a new matrix.

The owning policy also passed all five mapped deterministic checks on the explicitly
dirty prepared tree: automation_pass=true, no errors, whole closure=false.
This is not clean-head CI; native checks must bind the final commit.
