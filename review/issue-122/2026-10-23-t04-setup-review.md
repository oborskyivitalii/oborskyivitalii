# Issue122 — 23 October 2026 T04-P setup prerequisite

Owning issue: [approval6370000839](https://github.com/oborskyivitalii/oborskyivitalii/issues/122#issuecomment-6370000839).
Base protected main e6ee49696c0cdeaf70bbe72c803281682c7de83d; paused PR13131bb06b.
This is the existing issue's one active prerequisite; PR/source identity follows
after actual publication. Initial implementer analysis, not independent acceptance.

## Intent and acceptance

Original T04 delivery stalled while apt downloaded large Ubuntu packages from
azure.archive.ubuntu.com: both preview39983945852 attempts and owner39984723250
exhausted their unchanged job deadlines. First preview ran only25s of browser work;
second preview and owner browser actions never started.
Source tests and authenticated26-guard prepublication evidence remain historical
at31bb; no passing browser result or source reuse is inferred.

P01: extract the existing production Linux primary-archive/download treatment
into one helper; preserve signed-source metadata and package requests. P02: use
it before dependency installation in the same smoke/staging/Linux jobs. P03:
meaningful fixtures/wiring, permanent Python/navigation/RI routes and four roles.
P04: actual current-source installation and browser evidence. P05: protected
prerequisite delivery/postmerge, followed by PR131 integration/current delivery,
or a precise remaining protected-bootstrap decision. All whole AC01–AC08 stay open.

No package pin, case, job/context, source deadline, hosted budget, signature key,
scanner disposition or authority is relaxed. Ubuntu mirrors may serve differently
synchronised signed versions; actual native versions must remain observable.

## Requirements preflight

Actual separate `/root/t04_setup_requirements` inspected approved6370000839,
existing production Linux owner, both affected jobs and current control guides.
ACCEPT before implementation: P01–P05 adequate; no further decision needed to
implement helper. Require all-input validation before writes, fixed production
CLI, exact endpoint boundaries, preservation/idempotence and unsafe-path tests.
Stdlib-only navigation must inspect real invocation/order/guards and demonstrate
missing, late and skipped invocation faults. Candidate staging is not owner
admission. A protected bootstrap outside the current route remains separate.

## Source owners and style

`tools/quality/ubuntu_downloads.py` owns privileged setup, with explicit API input
for temporary fixtures and fixed `/etc/apt` CLI. The three workflows only call
that owner; existing diagnostic copies are untouched. Plans validate every
input/output path before mutation; source read/write failures stop the job.
It is not an adversarial multi-user filesystem transaction or OS package lock.

CS01/04: one quality owner and three callers, no competing registry. CS05: pinned
format/lint and readable Python. CS06/07: explicit finite setup effects, validation
before writes; failed setup prevents later browser admission. CS08/09: independent
oracles, useful fault fixtures and current bounded guard. CS10: source-bound checks
and independent semantic/architecture review. Guard success alone is insufficient.

## Independent completed-candidate roles

| Role | Actual separate agent | Source and own result |
| --- | --- | --- |
| Requirements | `/root/t04_setup_requirements` | Preflight ACCEPT; completed candidate pending. |
| Code | pending | pending |
| White-box QA | pending | pending |
| Exploratory QA | pending | pending |

## QA allocation and evidence

`test_ubuntu_downloads.py` covers direct `.list`, Deb822 and mirror+file inputs,
exact endpoint replacement, unchanged signing/suites/architectures/unrelated
sources, idempotence, missing/escaping/symlink references and safe output. Actual
workflow wiring checks inspect exact invocation, guards, order and original job
limits, with echo/skip/late fault detection. The same stdlib module runs explicitly
in navigation and automatically in staging/production's enduring Python runner.
The existing RI/CI map binds its named selectors and actual navigation command.

Initial implementer7/7 fixture tests PASS. Completed role results, exact clean
source checks and native evidence remain pending; no network success claimed.

## Protected delivery boundary

Owner `/stage` runs the workflow/reusable controller from protected main e6.
Candidate `staging-regression` is the existing premerge evidence route, not stable
promotion or eligible admission. Before any action outside the current protected
merge route, surface its concrete decision. Approval does not authorise ruleset
bypass, new credentials/services, W3 or production. Preserve every failed attempt.

## Initial review findings and correction

Requirements and Code independently reproduced unanchored command/deadline
oracle defects on36f43d2/tree28c1b9: comment/echo text falsely proved helper
invocation, and changed actual job deadlines could match a substring or comment.
Corrected tests require anchored actual run/job keys and add these negative
fixtures alongside original echo/skip/late cases. Actual helper/workflow bytes
were correctly wired and are unchanged by this oracle correction.

Requirements also found the missing Python test registry row: navigation and
enduring discovery existed, but the complete test inventory rejected the new
module. Add its permanent pr-targeted/staging/production allocation and explicit
helper/workflow inputs to the existing registry. No source-selection algorithm
or old case is removed. Fresh registry, mapped checks and actual affected-delta
reviews remain required. Original initial7/7 did not detect these defects.

## Four completed corrected-candidate reviews

Actual corrected38a97fa30313c7afb0d12d7a25fcb9c965ac62d9/treecffa44b25d6b4c7a5b9099dedf897ea27100d563 accepted independently:

| Role / actual separate agent | Own completed result and limits |
| --- | --- |
| Requirements `/root/t04_setup_requirements` | ACCEPT.7/7 fixtures, original2oracle bypasses rejected, complete registry/targeted Python selection and RI/CI16checks/freshness PASS. RQ-P03-REGISTRY/WIRING and P04-HISTORY closed. Native/delivery pending. |
| Code `/root/t04p_code` | ACCEPT.7/7, isolated canonical Ruff, originalcomment/deadline150 faults reject,3independentdirect/mirror/Deb822 preservation observations, RI/coupling/freshnessPASS. CR-SETUP-01 closed. Receipt SHA256a4d7168fc64a49d26862ac44a6d1c9fbcbafff0e7372c6414d60bd917896f072. Native pending. |
| White-box `/root/t04p_whitebox` | ACCEPT.7/7 plus11independentfixtures and3fault comparisons, original-inline/new-helper4byte-parity cases and an isolated disabled-symlink-guard mutant detected. Complete permanent Python selection/couplingPASS. Receipt SHA2567ba80f2fdc5cd55dbccc8bab8b0345056698e3840769590bbac23b94550c826f. No branch-coverage/network claim. |
| Exploratory `/root/t04_delivery_review` | ACCEPT.7/7, actual temporaryAPT/CLIcharter,6invalidrefs/4unsafetypepaths/3CLInegatives, semantic3-jobYAML parity and5actualcontroller-boundary observations PASS. Registry priorrows unchanged. Receipt SHA256994a91b8c8f71366040f120c66b352b5b7f48bbc343676ab7f543338c7c75fa3. No sudo/hostAPT/native success claim. |

Current clean38 owningpolicy5/5 PASS, automation/evidence true, errors empty,
closurefalse. RI29/29 and coupling20/20PASS. Initial maintained format check
failed only test wrapping because direct Ruff used the environment's88columns;
canonical explicit100column formatting corrects it with independently checked
identical Python AST. No assertion/helper/workflow meaning changes. Full lint and
final exact-source/native checks follow; source test budgets remain unchanged.

Code noted optional historical-source diagnostics require compatible workflow/source
revisions: old candidate checkouts lack this new helper. Archive recovery remains
separate and unchanged. This prerequisite establishes current-source setup, not
universal cross-revision diagnostic compatibility or an OS package-byte lock.

Only factual receipts, deterministic formatting/RI/MEMORY refresh follow accepted
implementation; provenance/AST identity and unchanged meaning must be verified.
Any material correction returns to the actual affected role executions.
