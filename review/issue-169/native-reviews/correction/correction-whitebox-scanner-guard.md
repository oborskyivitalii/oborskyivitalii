# White-box QA — exact catalogue scanner guard

**Scoped source verdict: no new blocker.** This reviews the scanner admission guard and meaningful negative preservation; it does not accept current checksum proposal/ledger data or establish a successful scanner run. Earlier candidate reports remain unchanged. No accepted source/test edit, duplicate campaign, external write or delegation.

The new exception is the complete tuple `.github/repository-paths.json:Base64 High Entropy String:41ceb5699f64d5bfeaccc5850d0cf398a19b10c9` in both schema admission and runtime classification. Schema admission adds Base64 only for that exact ID and only in the closed checksum ledger. Existing entry checks then independently enforce the path/rule/hash decomposition, exact field set, safe path, nonempty reason and false-positive disposition. A tuple from another ledger cannot gain this rule through the new branch. All four bounded regular ledger inputs, metadata validation, duplicate rejection and the existing 2 MB bound remain unchanged.

At runtime, `reviewedSecretFinding` still requires `reviewed.has(fullTuple)` before considering any Base64 exception. The exact catalogue tuple therefore supplies no unconditional bypass. Browser-integrity and publication-integrity branches retain their respective current proof sets. Other catalogue Base64 hashes, paths and types do not match this new tuple. The actual scanner still loads its map through the closed ledger validator; tests passing arbitrary maps do not create an extra production input authority. No detector, threshold, scan input or budget change appears in the inspected diff.

Independent source observation confirms the literal's public context: catalogue object key `site/retained/article-snapshots/02a5f0e4d2d1f33915b052aab04d0373ab615372340b2d08b4817e47799a6684` is declared as a directory, currently exists as a local directory, and its literal UTF-8 SHA1 is exactly `41ceb5699f64d5bfeaccc5850d0cf398a19b10c9`. My initial diagnostic examined JSON string values only and found no match; inspecting the actual catalogue structure identified paths as object keys and resolved that diagnostic limitation. Both steps remain in the raw audit. This supports classification as a public immutable-directory literal, rather than credential data.

The new test protects exact reviewed admission and no-ledger denial; wrong path, wrong hash and wrong rule runtime denial; and wrong-path/wrong-hash schema rejection. Existing closed-ledger, malformed metadata, duplicate, unsafe path, oversized/nonregular input, publication proof and browser proof tests remain unchanged. Optional further negatives could explicitly place the otherwise correct tuple in each wrong ledger, but the current checksum-file guard and existing schema tests establish the same structural restriction. This is not a measured branch-coverage claim.

Primary parent-executed `catalogue-tuple-tests.log` independently read: 8 tests/8 pass, zero fail/cancelled/skipped/todo, 443.401 ms. Cases include the new catalogue tuple, closed exact ledgers, browser integrity drift and malformed input, metadata/duplicate/input rejection and generated-field identity behavior. No test module executed by this reviewer. Existing `quality-sources` permanent suite remains selected through pr-targeted/staging/production source profiles. Raw output lacks a full source/argv/exit receipt; orchestrator must bind that separately.

Changed source identities:

- `tools/quality/scanners.cjs`: `c6a6f63965ffe668f40549ae779e40c76fca06e30937ef75b80d0474e5de8188`.
- `tests/quality-sources.test.cjs`: `39c3972ab04f741493ba3a0079b5d5b0b55b11a9c615197e5da506ab316d8d15`.
- `.github/repository-paths.json`: `86d5204def8f2558c8df1b01f2970f56cc9bd464a0d5b7a122982893e8b12a05`.

Fresh exact proposals and ledger entries require their own actual-value/source-context review. No previous scanner count/pass or current scanner acceptance is inferred. Final exact-source CI/hosted/release verification remains pending.

Raw audit: `correction-whitebox-scanner-guard.raw.json`, SHA256 `10d3a3f9035280e8647016a296b25a0c87c72867228e36443ab3dd1e086331bd`.
