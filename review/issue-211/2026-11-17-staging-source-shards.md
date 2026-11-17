# Issue #211 — Platform staging source runtime

[Run 43936992824](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/43936992824)
exhausted the 600-second source-runner allocation. The remaining
host-independent guard results passed. The two reference staging passes took
512–522 seconds on a different runner. For the 28 directly matched modules,
the slower runner took about 24% longer in aggregate. Source selection on the
date-correction revision matched the 76 modules exercised by its eight Basic
source jobs. The runner difference is an observation from these runs.

| Criterion | Evidence |
| --- | --- |
| AC01 | The existing staging profile and splitter plan all eight jobs. Local source and workflow tests exercise complete allocation. Hosted jobs supply runtimes and original TAP. |
| AC02 | The preflight recomputes the plan and checks source, module identity, native TAP and current-attempt receipts before deployable upload. Negative cases cover absent and inconsistent receipts and a failed or cancelled matrix. |
| AC03 | Authenticated content uses the existing profile. Ordinary previews use the same renderer and preview checks. Production uses its current source runner. |
| AC04 | An isolated staging-regression run exercises the candidate workflow. Protected admission separately uses the controller on main. After adoption, the date-correction PR still needs its exact protected staging evidence. |

## Code style

| Rules | Expected behavior and check |
| --- | --- |
| CS01, CS04 | Workflow controls the transfer and publication order. Source selection, partition and receipt validation reuse their current owners. Code review traces both sides of the artifact handoff. |
| CS05 | Workflow steps and their embedded checks expose one action at a time. Code review and the formatter cover their respective surfaces. |
| CS07 | Eight bounded jobs preserve the complete selection and 600-second process limit. Compare the slowest native shard with the recorded serial failure. |
| CS08, CS09 | Review the ordinary preview command and source, flow and aggregate failure cases. Run the existing style and RI checks and observe the exact hosted routes. |
| CS10 | The owning issue and acceptance policy identify the expected behaviors, verification routes, review and adoption gates. |
| CS02, CS03, CS06 | Applicable site content, CSS and runtime state are outside this change. |
