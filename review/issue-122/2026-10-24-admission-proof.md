# Issue 122 — 24 October 2026 isolated admission proof

Owning issue: [122](https://github.com/oborskyivitalii/oborskyivitalii/issues/122).
This is the implementer's prepared diagnostic record, not independent acceptance.
The temporary workflow and this record belong only to the unmerged F proof branch.
Protected main remains `a7d3d9456b85e444456c9d167e9ab813fe62787f`.

## Intent and acceptance

The owner authorized the existing runbook's private App/environment and isolated
native proof. Preserve whole AC01–AC08 as open, especially AC05/06 trust and
freshness limits. Main retains its original three strict Actions15368 checks and
no bypass. Production is outside this experiment.

App5453173 and installation174757834 now have only Checks/Statuses write and
Metadata read for repository1400059184. Environment25205111419 permits exactly
branch main, no tags or administrator bypass; both numeric IDs are saved.
The owner created one private key and saved it directly as the environment-only
secret. No credential value was accessed by the implementer. The enable flag was
set last after saved metadata and restrictions were read back.

Native control40081786727/1 authenticated and emitted check120836774463 from the
actual App5453173 on old source24090669, correctly rejecting closed PR133.
That expected failure proves authentication/issuer identity, not admission success.

## Independent role executions and requirements quality

All four distinct roles accepted the bounded settings/proof preflight and
independently accepted the observed pre-key configuration subset. Requirements
also accepted this concrete F-only harness design before implementation.
The raw records and screenshots were independently inspected; key metadata,
enable ordering and native outcomes still require final reconciliation.

| Role         | Separate execution                | Current scope / result                                                    |
| ------------ | --------------------------------- | ------------------------------------------------------------------------- |
| Requirements | `/root/t04_setup_requirements`    | Design and actual helper ACCEPT; native-result review pending.            |
| Code         | `/root/t05_code_preflight`        | Actual helper and metadata ACCEPT; native-result review pending.          |
| White-box    | `/root/t05_whitebox_preflight`    | Actual helper/guard exercise ACCEPT; native-result review pending.        |
| Exploratory  | `/root/t05_exploratory_preflight` | Actual helper/operator observations ACCEPT; native-result review pending. |

## QA design and source boundaries

H is empty verification commit `66e07ec6e114d68aa7a125e0057f2a6d619c49da`.
Its complete tree equals main's reviewed `f7ef995b262d314e5d84148cd0cf5b362eead2cd`.
PR134 targets `probe/issue-122-change-admission`, initially at main. Its main-target
counterpart is deliberately absent during missing/wrong-issuer observations.

Rule25777001 is active only on that exact isolated target: required context
`Change admission` from App5453173, strict comparison, no bypass, deletion and
non-fast-forward protection. Original main and production rules are untouched.
The first actual merge attempt returned native405 because that required result
was missing; no `Change admission` check existed on H at that observation.

F alone adds the temporary diagnostic workflow. A workflow on H would change its
closed execution inventory and correctly prevent later genuine acceptance.
F is never merged. Its guarded job revalidates fixed PR134/H/base immediately
before its sole check write. Only this job receives Checks write. It uses the
ordinary Actions identity15368 and explicitly labels its success as a negative
control. The immutable F source/run and returned check identity are retained.

The second job has empty permissions, no checkout, secret reference or credential
read. It requests the existing protected environment from F. Native denial before
runner/step execution is the oracle; an executed exit1 is a protection failure.

| Risk / AC                 | Scenario                                                                       | Independent oracle                                                                | Current result                                                     |
| ------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| AC05 missing result       | Merge PR134 without genuine check                                              | Native expected-context rejection; target unchanged                               | Native405 observed; exact rule/check snapshot retained externally. |
| AC05 wrong issuer         | Same-name green from Actions15368 on H                                         | Expected App5453173 still blocks the isolated merge                               | Designed; pending execution.                                       |
| AC05 credential isolation | F requests main-only environment without a secret reference                    | Native policy denial before any runner step                                       | Designed; pending execution.                                       |
| AC05/08 genuine result    | Main-target counterpart shares H and completes original full route/new receipt | Exact App5453173 success permits isolated merge only                              | Pending.                                                           |
| AC06 preservation         | Close main counterpart unmerged and remove only temporary refs/rule            | Main and original protection unchanged; source/package/recovery identity retained | Pending cleanup.                                                   |

## Style and verification

AC04 style subcondition: CS01 places the one-use diagnostic under workflows;
CS04 gives it one bounded concern; CS05 readable YAML/JS and pinned existing
actions; CS07 bounded jobs/no new matrix; CS08 actual positive/negative native
oracles; CS09 bounded repository guard; CS10 explicit source/result limits.
No scanner, permanent test, budget, package pin, exception ledger or trusted
controller change is proposed. H remains byte-identical to main. F is a diagnostic
execution-control delta, not a production or merge candidate.

F classifies its two temporary paths in the existing path catalog, adds its
workflow to the existing admission-layer coupling inventory and regenerates
derived RI/hash records. These F-only bookkeeping changes never enter H or main.
The initial uncatalogued build/map failures remain preliminary preparation
failures; the corrected current F must pass freshness/coupling before execution.

Local preparation passed YAML/embedded-JS parsing, the pinned formatter, Basic
(24 focused cases), bounded style guard (110 scanned files), RI freshness and
17-check/15-layer coupling, plus 29 RI and 20 coupling regression tests. A bounded
VM exercise of the actual extracted script passed one permitted state and six
invalid states rejected before write; removing the fresh-head assertion made the
corresponding invalid state write, detecting that controlled fault. This is local
guard evidence, not native protection evidence. The initial formatter warning on
the map's serialization was corrected without a policy change.

All four completed source reviews below permit publishing/executing F.
Runtime results belong to exact native receipts, not this pre-execution design.
Main movement, synchronous revocation, per-PR protection binding and trusted
control repair remain unproved.

### Completed independent source receipts

All four separately executed roles inspected the actual six-file staged candidate
tree `b499c6d53346686c6eab1e0f57bda47323577676`, parent main a7. Their exact bounded
acceptance statements are retained here; no role authored the helper or its tests.
Each independently checked current source/metadata and left native results open.
This factual receipt append and deterministic RI refresh change no executable bytes.

- Requirements, `/root/t04_setup_requirements`: “ACCEPT actual temporary helper source:
  staged tree `b499c6d53346686c6eab1e0f57bda47323577676`, parent
  `a7d3d9456b85e444456c9d167e9ab813fe62787f`. No blocking Requirements finding.”
- Code, `/root/t05_code_preflight`: “Code review ACCEPT for F publication/execution
  only, frozen tree `b499c6d53346686c6eab1e0f57bda47323577676`. No blocking finding.”
- White-box, `/root/t05_whitebox_preflight`: “ACCEPT F publication at staged tree
  `b499c6d53346686c6eab1e0f57bda47323577676`, parent `a7d3d945…`. No blocking
  white-box finding.”
- Exploratory, `/root/t05_exploratory_preflight`: “ACCEPT publication/execution of F,
  limited to staged tree `b499c6d53346686c6eab1e0f57bda47323577676`. No exploratory
  blocker.”

All independently exercised the embedded script's positive/invalid-state behavior.
White-box additionally observed four malformed/read failures rejected before write
and three returned-identity/write failures preventing false evidence records.
The native checklist remains unchanged: real Actions15368 identity on H; attributable
protected merge denial; environment policy denial before steps; genuine full-route
and new receipt/App545 success; isolated merge and exact cleanup. All whole ACs stay open.

## Decisions and next actions

Run the guarded F negative controls, authenticate their original evidence and
native enforcement, then open the main-target H counterpart. Complete its real
source/preview/owner-stage/admission/new receipt route and targeted owner refresh.
After independent reconciliation, merge only PR134 into the isolated target;
close the main counterpart unmerged and remove the temporary F/H/probe refs/rule.
Retain all failed/pending observations and tested staging/package/recovery identity.
