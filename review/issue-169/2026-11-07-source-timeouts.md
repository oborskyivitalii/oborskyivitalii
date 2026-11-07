# Issue169 — approved source execution allowances

Owner: [issue169](https://github.com/oborskyivitalii/oborskyivitalii/issues/169).
Execution: controller prerequisite PR174, publication owner PR170.
Prepared base550c7f242b88870796f3920332e620ff4e4ca795 on protected main312fbe4347eda332aa8ade885b07c98beadd6da5.
This is a self-analysis and change record; independent results are recorded separately below.

## Intent and accepted scope

On7November the author asked whether the source timeout should simply be increased,
then instructed proceeding with the proposed5to10-minute source allowance and
10to20-minute enclosing build allowance. This supersedes the earlier preservation
of these execution time limits only. All test cases, complete zero-skip accounting,
4-worker ceiling,16MiB raw-output bound,30-second reporting grace, scanner limits,
site/browser/performance budgets, rights and source/protection gates remain.
The endpoint remains verified full R10 stable staging, inspect reader/PDF, STOP/show;
PR170 merge and production remain outside this continuation.

## Retained diagnosis and bounded treatment

Publication diagnostic42321844610/1 on1e770f3f reached300000ms with34/75modules
complete and partial TAP, then the enclosing10-minute build was cancelled during
security. Raw failure artifact13553633597 remains retained. Prior ec35807 source
completed1222/1222 in233225.836ms before the separate Pillow browser-fixture failure.
Neither observation proves a specific host cause or a guaranteed new runtime.

The canonical source runner now allows600000ms; its existing derived wrapper
allows630000ms. Three actual enclosing source jobs now allow20minutes: PR Basic,
staging controller build and reusable release build. Other jobs are untouched.
Existing timeout/report tests are updated to the approved allowance; their failure,
raw-stream, source-mutation, unavailable/skip and complete-accounting oracles remain.
No new tests that merely mirror constants, no selected-case retirement and no retry loop.
Current guide prose distinguishes this narrow owner amendment from product budgets.

Requirements preflight completed before implementation. It identified the additional
PR Basic caller and stale unchanged-timeout wording; both are included. The complete
live issue body is retained in the review packet for final requirements comparison.
No whole issue AC is newly complete. AC05/11 cover this bounded CI/review work;
AC09/10 still require actual R10 reader/PDF/content evidence after integration.

Style mapping: CS01/04 canonical source limit and derived wrapper, CS05 focused
formatting, CS07 explicit finite execution allowance separate from product speed,
CS08 existing meaningful process/refusal tests, CS09 bounded guard, CS10 issue/AC
and exact-source reporting. CS02/03/06 have no changed product/content/style/runtime.

## Independent review and acceptance

Four distinct actual role results, their launch parameters, packet identities and
source-bound raw check receipts will be retained in source-timeout-reviews-and-checks.tar.xz.
Requirements preflight task: /root/timeout_requirements, explicitly fork_turns none.
Provider internal context/model/memory isolation is unobserved; filesystem is shared.
Final candidate review and actual native/full staging remain pending until observed.
Original first verdicts must remain separate from later correction reconciliation.

| Obligation | Verification | Current state |
| --- | --- | --- |
| AC05 approved allowance and caller closure | Source/report regression, parsed workflow callers, Basic/RI/style/native source | Pending current candidate |
| AC11 actual independent review | Four distinct completed source-bound roles and preserved first findings | Preflight complete; final pending |
| AC09/10 R10 reader/PDF/related content | Normal full owner staging after trusted integration and actual served bytes | Pending |
| Protection and source identity | Existing issuer, current full reviewed_sha, expected-head merge | Pending exact new-head owner decision |

No maintainer trust decision for a newly produced commit is fabricated from the
instruction to implement. Preserve the existing exact-head control-attestation gate.
No PR170 merge, production publication or issue closure is claimed.

## Completed prepared-source review/check checkpoint

All four distinct roles completed without blocking findings. Requirements resolved
its own preflight caller/prose/input findings in a separate final continuation;
the other three first judgments are retained verbatim. Actual first launches all
specified fork_turns none; model/effort parameters were omitted. Requirements
followup omitted fork/model/effort overrides and reused only its own first result.
The observed returned canonical handles were /root/timeout_requirements,
/root/timeout_code, /root/timeout_whitebox and /root/timeout_exploratory.
Packet digest8a39b499f332d3989e9ab2634543fa76cdf72032ba4ac81c6bb8655c636b3f4e
binds reviewed executable/workflow/test/guide bytes; archive receipts preserve
prompt/path identities and own completed results. Catalog serialization was later
restored to its original order/escaping, verified to parse to identical values.
Final MEMORY, literal receipts and deterministic RI/coupling are separate metadata.

Actual pinned Node24.19.0 targeted source/report cases73/73 passed in15180.525ms,
zero fail/cancel/skip/TODO. Basic passed26/26 baseline cases; focused zero-warning
ESLint, pinned complete formatting, architecture and bounded style passed.
Code independently executed4/4 meaningful cases; White-box6/6 plus5/5 boundary
cases; Exploratory4/4 plus actual valid-plan/invalid-profile/dirty-source CLI
observations. Requirements inspected the complete original issue snapshot and
canonical exported limits. These are bounded prepared-source checks, not native
full-source or hosted observations. Actual roles' narrower limits remain in their
literal outputs; no reviewer tested its own authored implementation.

Original300s failure observations are not relabelled. Existing tests exercise
ETIMEDOUT/overflow/cancellation/report retention without waiting600seconds.
No new routine test or selector entry was added: the three affected modules keep
their existing PR/staging/production assignments, with no duplicate or retired case.
Fresh clean committed/native source, RI and full controller staging still required.
