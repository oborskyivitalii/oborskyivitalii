# Issue177 carrier scanner fingerprint — White-box final focused review

2026-11-08. Verdict: **the proposed exact one-row public fingerprint disposition is justified**. No source/test edits, external writes, delegation or peer-output reads. Appending the row and preserving predecessors are not claimed executed: at review time current ledger has zero matching rows and SHA256ace921f2d6fadd665df7d7fdc7793928113889f9e9cf35fb235c48901e4b1b7a.

Independently recomputed SHA256 of actual `tools/site/build.cjs` bytes as `ee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee`. It exactly equals the current `review/issue-169/writing-carrier.json` line16 `producerChanges["tools/site/build.cjs"].afterSHA256`. SHA1 of that ASCII public checksum is `ddf7672816a81ef61d7b69a08375380fbd7defe2`. The retained detect-secrets1.5.0 result `/tmp/issue177-ci-prepub-fix-secrets.json` specifically reports that exact path/type/hash/line tuple; its proof log identifies that single new unreviewed finding. I checked the retained detector row and independently reconstructed the identity, without claiming a new full scanner execution or reproducing all baseline reconciliation.

Permissible exact row identity:
`review/issue-169/writing-carrier.json:Hex High Entropy String:ddf7672816a81ef61d7b69a08375380fbd7defe2`.
Disposition: false positive, with reason explaining the independently reproduced public build-producer SHA256. It identifies a source checksum, not a credential. Preserve every prior row/order/reason and scanner logic, thresholds, inputs and budgets. My prior direct carrier positive/obsolete-pin-negative checks remain applicable to these unchanged bytes.

Clean native evidence independently read: `/tmp/issue177-prepublication-correction-clean.json` SHA256`dd88f63a49122e1f9d9b75c0a96ab53f6936a13424828cff2e384c0eb75dea89`, status passed, exit0/no signal/error, **63 total/pass,0 fail/cancelled/skipped/todo**. Exactly three affected modules: content, executive, content-rendering. Source/sourceAfter both clean commit6c149f1d487d305bf1e2e91fa1061ba32b17dffe/treead8b1033b4ac9dbe8f94502fd53eb4a1be580a9a. Current HEAD15a0135f8ea46d00b4839497e4ad7a11ca08d146 has the identical tree, independently verified; commit metadata change does not change tested source bytes. This is inspected runner evidence, not my re-execution. The previous dirty62/63 failure remains retained.

No whole issue criterion, new ledger final-state comparison, final-source full scanner, browser/preview or CI acceptance is supplied by this prospective row review. After append, final byte identity/predecessor comparison and ordinary required checks must be retained by the orchestrator before its already authorized CI checkpoint.

## Actual append verification — completed after the prospective judgment

Parent notified the row was appended. Independently re-read actual dirty ledger and compared to HEAD15a0135. **All3639 predecessor records remain ordered/data-identical; all non-findings metadata is identical; precisely one record is appended.** Its path, detector rule, hashed identity and false-positive disposition exactly match the reproduced tuple above. Read the actual reason: it binds the committed build SHA256 and its SHA1 explicitly, preserves immutable15a0135 source, and grants no wildcard/scanner/budget/release authority.

Final inspected ledger SHA256 **441091c2519efb555069cf74bde167bd6517080ae54d1d8d671201511e430007**. Verdict on actual appended delta: **no blocking finding**. Earlier prospective limitations describe the pre-append state; this completed comparison supplies append/preservation evidence only. Final-source scanner/CI/browser gates remain pending.
