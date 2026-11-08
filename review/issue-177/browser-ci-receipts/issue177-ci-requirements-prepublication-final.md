# Issue177 prepublication correction — final Requirements disposition

2026-11-08. Reviewer `/root/issue177_ci_requirements`, continuation of preserved requirements judgments. The dated CI-browser appendix was explicitly included for this correction review; it contains role summaries, so this pass is reconciliation-exposed and is not a fresh independent first judgment. Its claims are checked against source/own probes where stated below. No peer report files/private history read; no implementation/external state/delegation changed.

## Verdict

**PASS for the bounded correction's requirements linkage and preservation; no blocking finding.** It is appropriate to proceed toward the already-authorized evidence-only CI run after final exact-source checks and other required role dispositions. Actual new-source browser/preview evidence remains pending. All whole AC01–AC09 remain open; no new SEO/discovery behavior or release authority follows.

## Inspected candidate and checks

HEAD `15a0135f8ea46d00b4839497e4ad7a11ca08d146`; uncommitted changes at inspection were the exact ledger addition, dated report appendix and generated agent context. Compared actual delta against failed source `06ffa6fcfc1cfa5fa1030e5d077d5d314e324d07`. Prepared inspected hashes:

- `review/issue-169/writing-carrier.json`: `6947f1e78eb6e5797cd2b2d5d176786c2d6f9b7acb2c628a856def7ce2602a5a`
- `tests/content.test.cjs`: `0f9fbed2efdabbd3546865f4444c29245245c8ca6ce38e06c9ed772bb935c2cf`
- `tools/quality/secrets-publication.json`: `441091c2519efb555069cf74bde167bd6517080ae54d1d8d671201511e430007`
- `review/issue-177/2026-11-08-ci-browser.md`: `430badc189e223c254ae714eb0fc20bcd722e400f47ae4002843ae5f8ff8b095`

The final dirty prepared delta is not covered merely by the earlier clean15a0135 result; refresh required exact-source evidence before CI as the appendix correctly states.

## Source findings and own evidence

1. **Carrier correction meets the reconciled plan.** Programmatic comparison with immutable06ffa6fc confirmed exactly one historical record field changed: build.cjs afterSHA256 from `3d9b80…` to `ee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee`. Independently hashing actual build.cjs reproduces the new value. All before/predecessor/accepted SVG/resource/remaining producer pins are identical. Direct execution of unchanged `verifyWritingCarrier()` and `verifyResearchCarrier()` passed and returned the existing Writing digest `943eaad6…` / resource2a45122d… and Research digest `afd670d4…` / resource1259bc8e… respectively. These validators retain exact historical source, current producer and alias/immutable reconstruction proofs. No checker assertion was changed.

2. **Content oracle corrected without an emitted-hash shortcut.** The test independently constructs principal config URLs plus validated catalog `local-article` primary edition URLs and compiles expected loader bytes. It calls the public catalog loader re-export, not private analyticsURLs; all existing exact loader bytes/digest/script count/attributes/schema assertions remain. No generated loader hash was hard-coded. The actual source correction is consistent with accepted article analytics scope and does not implement original SEO AC04.

3. **Formatting is semantic preservation.** Parsed `.github/ri-ci-map.json` before/after compared exactly equal in my own Python check; the large textual delta is formatting only. No check route or obligation changed there.

4. **One exact scanner disposition is justified by public checksum provenance.** Independently recomputed SHA256(build.cjs), then SHA1 of its lowercase hexadecimal field: `ddf7672816a81ef61d7b69a08375380fbd7defe2`, exactly matching the new path/type/SHA1 row for `review/issue-169/writing-carrier.json`. Programmatic comparison confirmed all3639 prior ledger rows unchanged, exactly one appended row, and all non-row metadata unchanged. This is a public producer checksum, not authority to exclude other findings or alter scanner thresholds. Pinned scanner execution was not repeated by this reviewer.

5. **Appendix is appropriately bounded.** It preserves failed run42511286540 as1240/1245 passing source tests, records skipped browser/publish stages, immutable prior carrier evidence and the separately retained dirty git-clone fixture mismatch. It distinguishes clean63/63 and owning5/5 observations from the later ledger-only delta. Those full-suite results are author-recorded appendix observations here, not independently rerun results; my own executions are the source comparisons and carrier checks above. No actual browser pass is asserted.

An initial reviewer-only Node comparison probe hit default execFileSync buffer capacity reading the1MB+ ledger; this was diagnosed as harness output capacity, then read safely with Python. It changed no source and supplies no product-test failure or acceptance result.

## Acceptance / next gate

| AC | Supported result | Still required |
| --- | --- | --- |
| AC01 | Exact retained failures have source-supported repairs; historical carrier evidence and independent test oracle remain strong. | Final source-bound checks and remaining broader issue ownership/test-impact obligations. |
| AC02 / AC03 | Earlier article journey/oracle/isolation scope is unaffected by this correction. | Actual corrected-source enabled browser and isolation observations; later live SDK/provider semantics. |
| AC07 | Existing proof/format/scanner preservation passes this requirements correction review. | Final ledger-delta check identities, other role results, exact immutable preview/CI artifacts and browser receipts; later separately authorized stable/production gates. |
| AC04–AC06 / AC08–AC09 | No new claim or implementation. | Original SEO/discovery/search/baseline/owner Medium obligations remain open. |

Proceed only through existing evidence-only CI/preview observation, preserve any failures and diagnose before another campaign, then stop/report. No stable staging promotion, merge, deployment or Medium action is supplied by this disposition.
