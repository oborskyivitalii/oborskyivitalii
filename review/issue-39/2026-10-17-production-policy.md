# Staging-led production release policy

Owner: [issue39 scope decision](https://github.com/oborskyivitalii/oborskyivitalii/issues/39#issuecomment-6232906938).
Independent from runtime-fix PR88; based on protected main0c76. This document is implementation self-review,
not independent technical approval or a production deployment claim.

## Accepted behavior

Keep the complete existing staging pipeline and its original cases, budgets,
scanners, source admission, stable promotion and protected merge checks.
Production consumes that authenticated successful staging, rather than requiring
another full production matrix. The optional full native/browser/performance/
capture suite remains a manual action; failures stay visible and cannot become
successful release evidence, but that action has no publisher dependency.
After publication and rollback, run only the bounded HTTP/policy/browser smoke.
Keep owner dispatch, source protection, immutable archive, rights, exact artifact
identity, live bookkeeping and exact predecessor recovery.

## Implementation boundary

- Authenticate the accepted staging merge through the existing admission owner:
  real successful stage attempt, protected source PR and identical complete
  tested/merged source trees. Retain the original stage gate and raw reports.
- Freeze the production edition from that clean accepted main tree. Validate
  the existing staging gate against its original staging artifact; bind both
  identities and verify the production edition/rights and corresponding runtime
  assets. Staging and production manifests remain distinct. No report is
  relabelled and a staging gate continues to say fullGate=false.
- Publish only that frozen production artifact. Archive the staging proof,
  source/tree/edition/artifact binding and original report bytes. Preserve old
  full-gated archives as valid rollback targets without requiring new full tests.
- Move passive ZAP from mandatory postpublish acceptance into the optional
  full diagnostics action. Keep its pinned scanner and original policy.
- Leave site source, generated public files, staging workflows and staging
  validators unchanged. Update production scheduling descriptions and RI routes.

## Verification and review

CS01/CS04/CS05/CS06/CS07 preserve the existing controllers and one explicit
staging-to-production admission owner. CS08/CS09/CS10 require negative wrong-
source/tree/attempt, failed/incomplete staging, altered public/rights/edition,
optional-full failure, smoke failure and recovery tests. Extend existing
release-controller/archive/publication and issue39 suites; preserve original
full validation tests and staging failure surfaces. Verify formatting, bounded
style, current owning acceptance, source suites and RI/coupling on the final head.

Implementation is present in this branch. Initial focused run passed 5/5;
expanded release-controller/archive/publication run passed 52/52 with zero skips.
Three first expanded-run failures were old workflow-summary/preflight/passive
expectations; they are retained in the session log and corrected to exercise
the explicitly authorized new policy. Passive malformed-coverage negatives now
remain in the optional diagnostic verifier and cannot block smoke. No scanner
rule, staging case, metric limit or historical archive check is removed.

The dated policy supersedes the prior full-before-production schedule in the
maintained release/staging/production/profile owners. Exact implementation
review here is self-review; independent technical review remains unperformed.
Actual hosted staging, merge, production publication and provider mutations are
not claimed by source tests. The prepared-source staging allocation passed612/612 across46modules, zero
skips, and Basic passed24/24. Style and RI/coupling verification passed.
Final clean-source owning/Python/format evidence is recorded in the PR and
owning issue with its exact commit identity.


## Controller compatibility prerequisite

PR88 stage39025419509 passed every host-independent source/scanner guard but
stopped before upload to Cloudflare: the protected-main controller did not yet
recognize its exact CSS-clock Color family. This PR retains the three exact
plain/staging/production registry entries and required-rights classification
from623f939 without its runtime, generated public output or fixture edition
switches. Current public/runtime bytes remain identical to main0c76. Closed
byte/edition mutation and missing-rights tests include those three entries.
This small forward-compatibility registration lets the separate runtime PR be
staged after the controller update; unknown runtimes remain rejected. Preserve
the original failed run; it is not a browser/runtime verdict.


## Acceptance mapping and remaining work

| Criterion | This change and check route | Remaining acceptance |
| --- | --- | --- |
| AC01 | Revalidated main0c76 and PR88 head623f939 before editing | Live provider inventory at actual cutover |
| AC02 | Domain/DNS/redirect source owners unchanged | Real DNS/TLS/redirect observations |
| AC03 | Authenticated staging derivation, rights, archive, smoke and recovery in existing release suites | Hosted staging, protected merge and live publication |
| AC04 | CS01/CS04–CS10 self-review; formatter/style, mapped issue policy and RI/coupling | Independent review and exact-head CI/merge |
| AC05 | Existing source-bound smoke and domain fixtures retained | Actual canonical-host and .com acceptance |

Full source/profile tests retain their existing allocation. New admission cases
extend the permanent release-controller suite; passive negatives remain in the
archive suite. The three finite Color preregistrations extend the existing
motion/publication suites. No new runtime, public output, browser matrix or
staging workflow is introduced. The new staging-policy validator is catalogued
and follows the existing release test and RI/CI routes.

Next: open the separate Draft policy PR, record final checks; ordinary Ready
admission/staging and protected merge follow review. Then rebase/restage the
separate runtime PR88 with the controller compatibility prerequisite available.
Production uses a new exact merged-source candidate and fresh recovery capsule,
rights binding, owner dispatch and post-publication smoke. The optional full
action is never a prerequisite. Issue39 remains open throughout this PR.


## Exact scanner ledger prerequisite before protected merge

The first policy staging request is39027632676 at457d97b. A bounded exact-file
scan found five new high-entropy candidates in the preregistered Color family:
its source-engine hash, navigation bytes and three edition fingerprints.
They are SHA256 identities already derived from PR88 source623f939, not access
credentials. All five path/rule/SHA1 finding IDs and their unchanged reviewed
reasons are copied from PR88's existing publication ledger. The canonical source
lines, original scanner SHA1 values and all three retained edition summaries were
matched individually. All944 previous publication rows and all three baseline
ledgers remain byte-for-byte unchanged; no detector or wildcard is relaxed.
The scanner must pass on the new exact committed head before fresh staging.
This is implementer self-review, not independent technical review.
