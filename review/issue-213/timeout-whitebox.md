# White-box QA — timeout correction, issue 213

Verdict: no blocking finding in the narrow timeout correction. Current full owning acceptance campaign remains pending; this judgment is not campaign acceptance or release approval.

Source: clean HEAD `24392133e5e00e6745c49ed150ad729879de6ddb`, tree `6902b57e8fad31d59c4c8ed6a69b0d2c4729b75d`; base `5057b02392e7d308b326ae3923345b2e983e41e7`. Packet SHA-256 `00422665646c91fc53c68d21ec91a895bc4497a96e5ccd1923635534fad3cfe1` verified. Common prompt SHA `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`; White-box prompt SHA `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`. Candidate test SHA `cdd307234fff613ac8296d7c354983bff8ebcee30868c4fc855d63298bb4805a`; source runner SHA `9c5ba854149a56fdb9156805a76792190c609a54b2fab9df0f58f27917493f5e`.

Inspected root instructions, README/map/memory, common/role prompts, supplied request/issue, actual two-file implementation diff and runner timeout owner. Existing peer report contents were not read. Provider context internals unknown.

| Risk / structural fault | Scenario / independent oracle | Outcome |
| --- | --- | --- |
| Outer timeout expires before maintained worker budget | Actual Node query must equal worker 600000 + grace 30000; mocked successful wrapper must pass 630 seconds | Passed |
| Query hangs or returns invalid data | Ten-second guard; noninteger/zero/negative must stop before launching campaign | Passed |
| Errors become success | Query/campaign timeout or nonzero exit must fail | Passed |
| Timeout correction weakens accounting | failed/cancelled/skipped/todo/nonpassed/empty/mismatched totals must fail | Passed |
| Dependency/profile drift | Runner dependency in inputs; task remains issue-policy only | Passed |

Executed: real `node -p "require('./tools/quality/source-tests.cjs').wrapperTimeout()"` exited 0 with `630000`; a Python `-B` stdin harness imported the unchanged candidate test and used unittest.mock only for subprocess boundaries. All 16 probe outcomes below passed; no repository source/test was edited. The success oracle independently checked query timeout 10, campaign timeout 630.0 and seven retained module entries. Negative probes asserted specific failure classes and pre-campaign nonexecution where applicable.

- success: numeric query uses 10s guard; 630000ms -> 630.0s; seven modules retained
- query invalid '0': rejected before campaign
- query invalid '-1': rejected before campaign
- query invalid 'not-number': rejected before campaign
- query timeout: propagates failure and never runs campaign
- campaign timeout: propagates failure
- accounting negative status: rejected
- accounting negative total: rejected
- accounting negative passed: rejected
- accounting negative failed: rejected
- accounting negative cancelled: rejected
- accounting negative skipped: rejected
- accounting negative todo: rejected
- nonzero exit: rejected
- registry: dependency explicit and owning-policy-only profile preserved
- delta: no JS, site or docs source changes

Preserved evidence: actual delta has no `.cjs`, `site/` or `docs/` changes. Read old raw integration tail: 190 tests, 190 passed, zero failures/cancellations/skips/todos, duration 311299.748285ms. This is prior integration evidence for unchanged JS, not a current full acceptance pass. Old acceptance JSON declares automation_pass false and is not promoted.

Limits: the expensive suite was deliberately not rerun; no measured coverage percentage, hosted preview, HTML/PDF rendering, release behavior or search outcome is claimed. Current acceptance-2439 campaign remains pending. Equal outer wrapper/inner Python budgets follow the maintained wrapper contract; extreme report/launch scheduling overhead at the full deadline has not been exercised by these bounded probes. All whole issue ACs remain open.
