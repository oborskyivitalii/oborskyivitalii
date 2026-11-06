# R8 White-box QA — capacity continuation

**Verdict: bounded capacity adjustment accepted.** This continues my own first review; it is not a fresh context.

Inspected the actual two-line diff: aggregate hash cap increases from 250,000,000 to 260,000,000 bytes, and its documentation matches. The measured 252,761,955-byte inventory fits with 7,238,045 bytes remaining. Per-file hashing, decoded-text and file-count limits, exclusions and coverage logic are unchanged. Both source hashes match `capacity-delta.json`.

Existing `test_hash_bounds_fail_without_silently_omitting_binary` exercises the 32 MB per-file bound, not the aggregate boundary. I independently executed a temporary two-file fixture (3+4 bytes), scaling only the aggregate cap: total 7/cap 7 succeeds with both records; total 7/cap 6 fails visibly with the expected hash-bound error. Assertions exited0; temporary fixture cleaned automatically. No source/test changes.

This protects inclusive aggregate admission and fail-visible overflow while accommodating the authorized retained package. The 29-test regression run remains pending with the orchestrator after RI refresh; no broad campaign or artifact re-review was claimed.
