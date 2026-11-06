# R8 capacity delta — Code review

**Verdict: acceptable bounded capacity increase; execution results remain pending.** Targeted continuation of `/root/r8_code`, without repeating artifact review.

Inspected the actual Git diff and input hashing path. The sole tracked code change raises `MAX_HASH_TOTAL_BYTES` from 250,000,000 to 260,000,000; the policy owner changes its corresponding 250 MB statement to 260 MB. The reported 252,761,955-byte input set fits with 7,238,045 bytes remaining. Streaming SHA-256, explicit over-limit failure, input enumeration, exclusion logic, 5,000-file ceiling, 32 MB per hashed file, and 2/50 MB parsed-text limits remain unchanged. This admits the measured archive growth while retaining complete coverage and finite enforcement; it does not suppress the failing check.

Verified source SHA-256 values:

- Code: `9be024a28215c5852bb26893fc5696dc6543d7056f37c40500e796519178d821`.
- Policy: `29a6dc08787505c268b5b6e759d5e95949872f740a7ae8dd370d3fb7b7f74e43`.

No tests were changed or run by this reviewer. Successful RI build/verify and affected suites require their own recorded results. Provider internals remain unknown; no source or external writes.
