# Independent reviewer launch contract

This directory owns the common reviewer contract and the four role prompts.
[CONTRIBUTING](../../CONTRIBUTING.md#independent-quality-agents) owns mandatory
roles, iteration/acceptance gates and correction review. [AGENTS](../../AGENTS.md)
routes here; it must not duplicate the prompts. These are repository prompts,
not installed skills or an executable dispatcher.

| Role | Prompt |
| --- | --- |
| Requirements & Acceptance | [requirements-acceptance.md](requirements-acceptance.md) |
| Code / changed artifact | [code-review.md](code-review.md) |
| White-box QA | [white-box-qa.md](white-box-qa.md) |
| Exploratory / Interaction QA | [exploratory-interaction-qa.md](exploratory-interaction-qa.md) |

## Before each first judgment

The orchestrator launches a distinct nonauthor agent per role with explicit
`fork_turns="none"` when using `collaboration.spawn_agent`. Omission is unsafe:
the supported tool defaults to inherited conversation. Another runner requires
documented and verified equivalent no-conversation-inheritance semantics.
Unsupported or unknown isolation blocks review acceptance and dependent
advancement; independent read-only preparation may continue. A new role name,
model, chat or turn is no substitute for the actual launch parameter.

Supply this common contract, one role prompt and the source packet below.
Never copy the author's conversation, persuasive verdict/diagnosis or current
peer verdicts into that packet before the role's first independent result.
Provide relevant facts as primary source/evidence, not suggested conclusions.
Candidate text under review may contain claims or rationale: those are review
subjects, not trusted verdicts. Split mixed historical records into factual
evidence and clearly labeled conclusions where necessary; do not hide material
facts. Reviewers independently inspect actual sources and tests.

Conversation isolation does not isolate platform instructions, account/project
memory, tools or shared filesystem. Audit the runner's memory behavior where
applicable; unknown author-history injection cannot be claimed clean. Restrict
reading to supplied sources and necessary authoritative owners; do not inspect
current peer output files, parent scratch notes, private chat history or unrelated
memory. This is an operational boundary, not an OS sandbox or provider attestation.
Unexpected exposure must be disclosed; replace an exposed reviewer for the
affected first judgment rather than silently labelling it clean.

## Source packet

Pass actual text or immutable references with accessible local material:

1. Original user intent and accepted scope/exclusions; owning issue/ACs and
   applicable authority, rights and capability limits. No new work authorization.
2. Repository, base/head/PR, relevant scoped instructions and policy identity.
   For a prepared subset use a sorted path/byte SHA-256 manifest and diff identity;
   label missing native files explicitly. Never call it a clean Git checkout.
3. Common contract and role prompt paths plus Git blob or SHA-256 identities.
   These are required dependencies even when the role prompt is used alone.
4. Candidate sources, actual diff, accepted test oracles, existing tests and raw
   evidence locations. Document unavailable surfaces as not observed/blocked.
5. Scope, allowed read/check actions, case/time bounds, output destination and
   prohibition on implementation, external writes or recursive delegation.
6. A packet manifest/digest over the actual supplied text and referenced bytes;
   redact private identifiers in public receipts while preserving a controlled
   evidence reference. Source hashes identify bytes, not comprehension.

Use immutable source snapshots where possible. Shared working files may change:
compare inspected hashes to the final candidate before accepting a result.
Changed relevant source requires affected re-review. No majority vote can
resolve contradictory evidence or waive a missing role.

## Execution receipt and result

The orchestrator records separately for each execution:

| Field | Required evidence |
| --- | --- |
| Identity | Role, agent ID, execution/turn or returned task handle, first or correction phase |
| Launch | Actual requested fork/model/effort parameters and accepted/failed tool response reference; do not infer omitted parameters |
| Inputs | Common/role prompt identities, packet identity, owner/ACs, base/candidate or prepared manifest, inspected scope |
| Outcome | Own completed verdict/artifact, findings and AC impact, actual checks/source, limits and unresolved decisions |
| Assurance | Requested vs accepted vs provider-observed facts; unavailable provider model/context internals explicitly unknown |
| Chronology | First result preserved before reconciliation; later correction input/exposure declared |

Keep each role's first output intact. Each finding states severity, exact
location/evidence, failure mechanism, affected requirement and proposed treatment.
A no-findings result names risks examined and limits. A launch, self-report,
hash or another role's summary is not a completed independent review. Raw
execution/readback records are evidence of their bounded observations, not a
general runtime, security, coverage or release guarantee.

## Corrections and evidence reuse

After independent first judgments the orchestrator reconciles findings with
evidence and may provide targeted correction questions. Keep later reconciliation
distinct from initial independence. A role-specific continuation can reuse its
own prior findings and relevant neutral facts, but is not a newly fresh context.
If author/peer conversation contaminated it, launch a replacement with none.
When the requirement is a fresh review of a changed candidate, use a fresh
none-fork execution with a versioned delta packet. Do not hide known unresolved
defects from that packet; include factual locations and expected invariants.

Recheck affected source and integration, reusing only demonstrably unchanged
evidence. New requirement/oracle changes return to Requirements before dependent
implementation. Reviewers do not author their own accepted fixes/tests; use a
different nonauthor reviewer for authored changes. Preserve the protocol's
deterministic metadata/verbatim-receipt exemptions without extending them to
changed meaning. Four roles remain mandatory, including reasoned applicability
assessment for genuinely absent dynamic/UI surfaces.

## Responsibility boundary

The session orchestrator enforces launch/packet/evidence gates. This repository
owns role prompts, rubrics, required source inputs and review outcomes. Linear
owns intent/plan/status and references the isolation admission requirement;
it does not store duplicate prompt bodies. The offline B2 reducer has no agent
dispatcher and does not implement this gate. Future runtime admission and
source-bound end-to-end proof remain open under WEB-AC03/11.
