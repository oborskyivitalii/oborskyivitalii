# Issue #183 — Technical staging fixture performance

[Issue #211](https://github.com/oborskyivitalii/oborskyivitalii/issues/211) owns
the staging controller in [PR #212](https://github.com/oborskyivitalii/oborskyivitalii/pull/212).
The [protected staging attempt](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/44044807965)
timed out in the existing source runner. Fourteen of 76 modules completed.
The wrapper elapsed times were 432.6 seconds for release rights, 402.3
for Pages delivery, and 355.3 for publication records. The hosted timings
include contention between four workers. They do not isolate fixture costs.

This prerequisite uses the repository technical route for test changes.
AC05 and AC06 remain open for the original publication work. The separate
controller change and its own acceptance remain in #211.

| Style rules | Check and intended behavior |
| --- | --- |
| CS01, CS04 | Test fixtures own reusable setup. Existing production builders and source runners remain authoritative. |
| CS05 | Each test receives its own writable source/public copies and manifest. The standalone CLI exercise still uses the pinned parser at its expected location and owns the actual generation, staging and publication-variant assertions. |
| CS07 | Reuse pristine rights inputs and a commit-specific historical production rendering within the test process. Compile rights for each materialized release fixture. Compare the same suite locally and retain the protected runner deadline and full profile. |
| CS08 | Preserve existing mutations, edition/commit assertions, package/recovery and source-bound refusal tests. Verify the technical classification against protected main and require fresh full source evidence before claiming staging restored. |

An independent requirements preflight confirmed the fixture-only scope
against the retained native failure and checked the exact input and oracle
boundaries. Local performance measurement and exact-source adoption follow.

## Independent correction review

The first review reproduced a test-local cleanup hook deleting the shared
rights seed too early. The corrected fixture registers teardown at file
scope. A further review reproduced stale expected-digest reuse and identified
unrelated destination files in the cached output. The exact correction
includes the native digest input and writes only the produced files on a hit.

The [workflow guide receipt](workflow-guide-evidence.json) records the
independent unchanged disposition for the corrected, exact fixture scope.
The locked detector identifies the receipt's public base object and computed
scope digest. Both values were reproduced from the protected guide checker
and recorded exactly in the existing checksum ledger. Earlier ledger rows
keep their values and order, and the full earlier summary is available in
the protected main version of the ledger.
