# Offline orchestration fixture component

Owner: WEB-18 / GitHub issue167, VIT-22 coordination. This source implements only
P01–P05 of the bounded offline B2 component; P06 retains separate review gates.
It does not implement the complete design record family or a running agent.

`tools/orchestration/reducer.cjs` exports `reduce(jsonText)`. Importing it loads
only Node crypto and the adjacent consumed `contract.json`. There is no CLI,
filesystem, network, subprocess, timer, LLM, connector, publisher or status adapter.
The caller supplies JSON text and receives data. It cannot establish human
authority, provider identity, real receipts, cessation, or persistence.

## Consumed input contract

`contract.json` is the editing owner of required fields, enums and bounds. The
reducer consumes every declared input type. All object fields are required;
unknown fields and wrong types fail closed. The following is the entire subset:

| Field | Meaning / accepted shape |
| --- | --- |
| version | Literal `fixture-v1` |
| operation | owner, intent instance, stable step, action, target: fixture IDs; candidate and semanticInputs: lowercase SHA-256 strings |
| run | Fixture run identity |
| decision | operationKey digest; accepted/start/authority/revoked booleans asserted by the fixture |
| model | policy required/preferred/default-allowed; pair sol-medium/sol-low/astra-medium/terra-medium/unverified; supported boolean |
| planRevision, routingRevision | Integers1–1000000, excluded from operation identity |
| prior | null, or exact prior returned state with operationKey/run/runtime/dispatched/stopUnknown/receiptUnknown/receipt/lastSequence/seen |
| events | Ordered array of event objects: id, operationKey, run, sequence, kind, receipt |
| private | Bounded opaque string, deliberately unused and never returned |

Fixture IDs match `^fixture:[a-z][a-z0-9-]{0,47}$`; they are synthetic labels,
never URLs, credentials or arbitrary public messages. Digests match64 lowercase
hex characters. Model labels above are deliberately fixture aliases, not provider
attestations or dispatch model IDs. The `supported` assertion covers the exact
pair represented by `pair`. Required/preferred unverified or unsupported pairs
hold. No fallback selection occurs. Default-allowed still requires supported=true.

JSON text is limited to32768 UTF-8 bytes; maximum nesting depth8, traversal2048
values, string/key length1024 UTF-16 code units and each array128 items. Root depth is0;
object/array children add1. Sequences are integers1–1000000; retained lastSequence
may be0. A retained seen list is limited to128 distinct fixture IDs. History
exhaustion returns a fixed error and no proposals; callers must not truncate
history to manufacture a fresh operation. On any ok:false result, retain the
last validated prior state; an error is not permission to reset prior to null
or repeat earlier proposals. JSON.parse defines JSON decoding
(including last-value handling of duplicate object names); no executable object,
getter, cyclic-object or hostile JavaScript-object API is admitted.

Invalid input returns `{ok:false,error:"invalid-fixture-input",effects:[]}` with
no echoed input. Invalid modeled state/history has separate fixed error codes.
The API does not mutate caller input: its only input is an immutable string.
Retained state is caller-supplied synthetic data, not an authenticated journal.

## Identity and observation rules

The operation key is SHA-256 of compact UTF-8 JSON with sorted keys over exactly
the seven operation fields. It has no self-reference, plan/routing/model revision,
decision ID or transport event ID. Changing an assignment or revision cannot
create another proposal for the same retained operation. Keep and supply the
returned prior state; restarting with prior=null discards the modeled history
and provides no cross-call deduplication guarantee.

This bounded component supports one operation identity per retained state.
Every operation-key change holds, even with a matching new decision, prior
completion/cessation and a reconciled receipt. Multi-candidate continuation and
its required completed-key lineage are deliberately not implemented. A same-key
different run also holds. Changed source or target cannot borrow a previous
operation's authority. Independent calls with no
shared prior state have no mutual exclusion, CAS or distributed exactly-once.

Events require matching run and operation key. Mismatched, duplicate-ID or stale
sequence events are ignored without advancing the retained sequence. Processed
events retain their ID and sequence even when their precondition refuses an
advance. Reuse of an event ID never authorizes a new effect.

| Event kind | Modeled behavior |
| --- | --- |
| request-start | With exact accepted+start authority, nonrevoked decision, supported pair, idle undispatched state and no unknown flags: one dispatch-proposal and queued state |
| queue-ack | No state advance; cannot imply running or undo completion |
| start-observed | Matching queued dispatched state, current modeled authority and no hold becomes running |
| result-observed | Running without unknown flags becomes completed; never closes issue or accepts owning AC |
| stop-unknown | Dispatched operation remains held until matching stop-observed; late result does not clear it |
| stop-observed | Dispatched operation becomes stopped and clears cessation uncertainty only |
| receipt-missing | Dispatched operation sets receipt uncertainty |
| reconcile-receipt | Dispatched operation plus nonnull matching receipt assertion clears receipt uncertainty; conflicting stored receipt holds; never emits dispatch |

`receipt` is nullable on every event; only reconcile-receipt consumes a nonnull
value. Other events ignore it. Unimplemented commands, event kinds and full
design fields are rejected. There is no pause/resume/approval-signature API,
durable checkpoint/hash-chain, notice adapter, Linear transition or publisher.

Successful output contains ok, disposition, state, effects and public. Disposition
is modeled/hold, or a prior-operation/run mismatch hold. Unknown flags record
operational uncertainty; current authority denial can also hold independently.
`effects` contains only synthetic dispatch-proposal descriptors with a digest/run.
It describes proposals arising while replaying the supplied observations, never
instructions to execute. A final hold does not retroactively erase an earlier
modeled proposal; every real adapter remains absent and would need its own
source/authority/stop/reconciliation checks before any side effect.

`public` has a fixed allowlist: scope=`synthetic-offline-only`, runtime, held,
owningIssueClosed=false, acceptance=`not-established`. Public held reports unknown
stop/receipt flags; disposition separately reports decision/model denial. Private
input is excluded from every return path, error and effect. This is a component
projection test, not proof of native GitHub sync/linkback redaction or a real ACL.

## Checks and remaining gates

The component campaign is `node --test tests/orchestration.test.cjs`, bounded by
the caller to30s. Two JSON fixtures retain accept-only and combined-start inputs.
Behavioral cases cover malformed/unknown/size/depth limits, no opaque echo,
accept/start distinction, authority/model guards, matching actual start, stable
key across revisions, stale/mismatched observations, unknown cessation, lost and
conflicting receipts, and holding a reconciled candidate change. These are automated
local component checks, not live runtime or human observations.

Style mapping: CS01/04 source ownership is reducer/contract/tests/this guide;
CS05 readable CJS/JSON; CS06 explicit data-only state/effects; CS07 finite bounds;
CS08 meaningful behavioral negatives; CS09 bounded guard remains pending on the
partial source; CS10 issue167/P01–P06 and exact source evidence. CS02/03 have no
content/presentation/CSS surface in this component. Source formatting/lint and
unautomated architecture review remain separate obligations.

Executable tools/tests retain the current conservative full route. The API-bound
partial text source is not a complete Git checkout. Native Basic, style, RI
build/verify, RI-CI, source selection, owning acceptance and hosted/staging/admission
obligations remain pending. Do not hand-edit generated RI or infer a cheap
repository exemption. Keep the PR Draft; no CI dispatch/staging/merge/deployment,
publication, new service, native Linear dispatch or paid route is supplied here.
Four actual nonauthor Requirements, Code, Whitebox and Exploratory results on
the exact integrated candidate and affected correction rechecks remain required.
Full B2 exit, B1/M1 and all twelve global WEB-AC criteria remain open.

## Reviewer admission and prompt ownership

The session orchestrator must enforce the repository's
[reviewer launch contract](../agents/reviewers/README.md) before accepting each
required independent review. Linear records intent/routing and references this
admission requirement; detailed role prompts and rubrics live together in that
directory. AGENTS routes, CONTRIBUTING owns mandatory lifecycle gates, and the
issue's existing versioned review records actual launch/input/result receipts.

Required admission inputs are a distinct nonauthor role, explicit none-fork or
verified equivalent, accessible original intent/ACs and pinned source/diff,
common/role prompt and packet identities, allowed check bounds and an actual
accepted launch. Missing/unknown isolation holds dependent review acceptance.
Preserve each first judgment before reconciliation; actual corrections recheck
affected scope. Prompt file existence, hashes and self-reports prove neither
execution nor provider-internal isolation. Shared platform/memory/filesystem
boundaries must be reported honestly.

This is a documentation contract. The current reducer has no reviewer command,
launcher or adapter; it does not enforce this admission gate, validate these
receipts or demonstrate fresh-context runtime behavior. Implementing and testing
that gate belongs to subsequent source-bound B2/B5 work and B6 acceptance under
WEB-AC03/11. Do not add a synthetic flag and call isolation verified. Retained
historical findings and the current audit are in the same issue's
[review](../review/issue-167/2026-10-31-reviewer-isolation.md).
