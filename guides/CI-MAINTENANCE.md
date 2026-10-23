# Owner-operated CI maintenance

Issue122 [directive6371350643](https://github.com/oborskyivitalii/oborskyivitalii/issues/122#issuecomment-6371350643)
authorizes a durable repair route when the existing CI controller prevents
delivery of its own reviewed repair. This is an explicit administrative decision,
not automatic repository-lane admission or successful website staging.

## Protection and limits

Two active rulesets apply to main. `source-admission` has no bypass actors and
retains the PR, deletion and non-fast-forward restrictions plus strict GitHub
Actions app15368 checks: `checks`, `Local navigation and RI freshness`, and
`Owning issue deterministic acceptance mapping`. The separate staging-only
ruleset24568553 requires `Staging admission`, with owner User248754648 permitted
to bypass that rule for pull requests only. Never grant `always` or `exempt`
mode, an Actions/App bypass, or an owner bypass of the baseline.

GitHub enforces the actor/ref boundary. It does **not** limit this owner privilege
to CI paths, a PR number, SHA or expiry. The narrower eligibility below is a
reviewed owner procedure. An expired decision does not remove the persistent
GitHub privilege. AC05's stronger automatic producer proof remains unresolved;
this route does not activate W3 or permit ordinary website changes to skip staging.

GitHub's [rules API](https://docs.github.com/en/rest/repos/rules#get-a-repository-ruleset)
omits `bypass_actors` without ruleset write access. CI keeps read permissions and
compares every visible rule. Hidden bypass actors require the owner's fresh
administrative readback, bound in the decision below; the report explicitly calls
this `owner-attested`, never API-verified. A visible mismatch still fails. Hidden
privilege drift remains the owner's procedural responsibility; this is not an
automatic protection audit or AC05's stronger proof.

Normal website/content/mixed changes use the existing staging route. Maintenance
is limited to CI/controller/test/setup repairs and their necessary protocol/RI
companions. The collector has an explicit inventory; unknown inputs, site,
content, build, rights, symlink/type/executable changes deny maintenance. It
inspects every parent edge in complete base-to-head history, both rename paths,
and the final tree. A reverted intermediate website change still denies it.

## Prepare one exact repair

1. Keep the substantive repair Draft while implementing. Record the broken
   workflow/run/attempt/job and reason in the existing issue. Preserve failures.
2. Obtain four completed separate requirements/code/white-box/exploratory roles,
   focused repair evidence and the applicable source/style/RI/owning checks.
   Review hashes/pointers are traceability, not automated proof that agents ran.
3. Freeze the reviewed head, mark Ready and wait for actual latest raw-head
   Basic, RI and owning success. Obtain a successful current focused repair job,
   such as native preview smoke for an installer repair. A broader failed hosted
   run may retain a successful focused job; never call the whole run passed.
4. Collect the exact approved delta from a full-history checkout:

   ```sh
   node tools/staging/maintenance-inputs.cjs BASE_SHA HEAD_SHA ISSUE_NUMBER
   ```

   Review its complete history, path inventory, modes, blobs and diff digest.
   An owner decision is invalid after a head/base/history or selected-attempt move.
5. Through the authenticated owner's normal session/connector, create a new PR
   Conversation comment starting with `<!-- controller-maintenance-v1 -->`,
   followed by one fenced `json` object. The object uses schema1 and kind
   `controller-maintenance-decision`; bind repository, issue, PR, base, head,
   tree, diffDigest, exact paths, reason, failedRun/failedAttempt/failedJob,
   four role/path/receiptSha256 records, sourceChecks and focused proof.
   `sourceChecks` uses the existing admission result's workflowRun/attempt/job/source;
   `focused` binds workflow/runId/attempt/jobId/jobName.

   First use actual administration access to read both full live rulesets and
   compare them to the reviewed payloads, including bypass actors. Bind
   `protection.observedAt` (no later than comment creation and at most one hour
   earlier), and `protection["source-admission"]` / `["staging-admission"]` objects
   containing the actual `id` and `payloadDigest`. The digest is
   `inputs.digest(inputs.canonical(inputs.payload(actual)))` after exact full
   `inputs.layered(actual, expected)` comparison. This is an explicit owner
   attestation of an actual admin readback, not a CI-token observation; do not
   manufacture it from committed desired JSON alone.

   Bind `preservedSite.previous` to the actual latest accepted recovery producer
   (runId/attempt/controller/stateId), its uploadDigest, recoveryDigest and original
   recovery state. Preserve its original accepted source/public/package identity.
   Set expiresAt no more than one hour after comment creation. Do not edit the
   comment. A later owner marker revokes/replaces it; a malformed or edited latest
   owner marker fails closed. Candidate labels, bot comments and candidate report
   text cannot substitute for this actual numeric-owner User comment.
6. After the layered rules are active, the owner applies `ci-maintenance` to the
   Ready PR. The read-only candidate `CI maintenance preflight` workflow verifies
   the actual decision, event/checkout source, source/focus evidence and all
   visible rules plus the explicit owner readback before merge. Wait for its
   actual current report; the label alone is
   not authority and this job never issues `Staging admission`.
7. Immediately before merge, fetch the live PR, both rulesets, actual source and
   focus jobs and latest owner decision. Run `maintenance.ownerDecision()` and
   `maintenance.verify()` using those read-only API observations and full Git
   history. Recheck the resulting comment/body digest and source leases. Merge
   only that PR using expected-head SHA and the merge method, preserving its tree.
   The merge API has no atomic expected-base parameter; serialize other main
   merges operationally and keep that residual race explicit.

   The verifier rechecks current PR/base/head/Ready/state, source and focused
   jobs, visible protection, latest decision and main before returning. Its native
   execution is bound to the PR event and actual Git checkout. A manual premerge
   replay must supply the same current preflight event context and check out the
   approved head; it cannot substitute a different checkout or imply an atomic
   transaction across GitHub reads.

No test is relabelled. For the initial setup repair, candidate cold Writing
3566.9/3200ms remains failed. The old-controller owner run39994526873 installed
53.7MB from Azure in13m20s and left55.60s of incomplete browser execution before
cancellation. The official archive completed the same requested53.7MB in5s.
Maintenance accepts infrastructure delivery despite unavailable normal staging;
it does not accept the website's failed performance observation.

## Postmerge and publication

The read-only merge observer selects maintenance only from the actual owner
decision. It never falls back after normal staging verification fails. It verifies
the original base/head parents, identical approved/merged tree, current source
jobs, protection and decision, then authenticates the original recovery JSON and
package metadata and observes the existing stable revision. Its distinct
`controller-maintenance-merge` record has stagingAccepted, productionEligible and
deploymentAuthorized all false. Previous accepted site identity is preserved,
not relabelled at the new repository commit. This is an identity observation,
not a new all-file website validation or publication compatibility proof.

Normal `stagingEvidence`, `verifyMerge` and production consumers retain their
original successful-owner-staging requirements; a maintenance receipt cannot
qualify. The observer has read permissions only and performs no alias/provider
write. Check actual merged-main Navigation/RI and owning acceptance, retain every
failed/incomplete observation, then continue the paused work. Future production
preparation still needs its separately accepted source/provenance route.

## Apply or roll back protection

The reviewed payloads are `.github/rulesets/source-admission.json` and
`staging-admission.json`; `protect-main-before.json` is the complete original
rollback payload. Re-fetch and compare the original live ruleset before use.

1. Create the active non-bypassable baseline while the complete old ruleset is
   still active. Read it back and verify all rules/contexts/app IDs/strictness.
2. Only after that verification, update24568553 to the reviewed staging-only
   payload. Read back both layers and effective rules for main, verifying the
   exact owner User and PR-only mode. Never silently substitute all administrators.
3. If any migration check fails, restore and verify the original complete24568553
   **before** removing the new baseline. This ordering prevents a protection gap.
4. After successful migration retain both layers by design. A source rollback is
   a reviewed revert PR through the normal route or another exact maintenance
   decision. It is not an automatic setting reset or an authorization to reuse
   stale evidence.

GitHub administration write access is necessary. The current connector can read
rulesets but exposes no administration mutation. Prepared JSON/source is not live
configuration; record actual admin execution, readback and delivery separately.
