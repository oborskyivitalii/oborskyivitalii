# Independent Requirements preflight — issue213 wrapper correction

Verdict: **proceed boundedly with the proposed owning-wrapper correction; no implementation or acceptance pass is granted by this preflight.** The observed failure supports replacing the new wrapper's independent 190-second deadline with the maintained runner's authoritative `wrapperTimeout()/1000` value. At the inspected source this is exactly630 seconds (600-second child execution bound +30-second reporting grace). This aligns a harness deadline; it does not change a product-performance requirement or the source worker's existing limit.

## Independent observations and finding

Inspected clean HEAD `5057b02392e7d308b326ae3923345b2e983e41e7`, tree `368147ef6bcf1fafba82dd4f9039883670d1d3bf`; supplied base `3877546d29a04f235f9ec0f3175f4e0d90bfd60d`. `git status --short` was empty. Read common/Requirements prompts, applicable root instructions, README/map/handoff, CONTRIBUTING correction/review sections, scheduling owner, actual acceptance policy, owning test, runner and retained raw acceptance evidence. No current peer report was inspected. No implementation, external writes, delegation or acceptance campaign executed. Provider isolation internals and launch-receipt admission remain orchestrator responsibilities; this report does not attest them. Live GitHub was outside this bounded source review.

**RA-TIMEOUT-01 — blocking current automated acceptance, correctable locally.** `tests/test_issue213_acceptance.py:31` sets `timeout=190` around seven selected source modules. `tools/quality/source-tests.cjs:9–13,582–590,618–620` establishes600000ms child execution and30000ms report grace; `executeBatch` checks child status and full accounting. `guides/SITE-CHECK-PROFILES.md` explicitly retains the600-second process limit and zero-skip accounting. The raw `acceptance-5057.json` records the same exact clean SHA and test-file hash, with `subprocess.TimeoutExpired` after190 seconds and no completed DISCOVERY accounting. Seven other mapped checks passed; DISCOVERY failed, automation_pass=false. This is direct evidence of an outer deadline preempting the maintained bound. It does **not** establish that those child suites would pass or that their eventual runtime is acceptable.

Bounded numeric probe (10-second subprocess timeout), requiring the actual maintained module and writing only `String(wrapperTimeout())`, returned `'630000'`, converted to630 seconds. The source-derived oracle already exists; introducing a second hardcoded630-second policy or modifying worker limits would exceed this proposal.

## Acceptance linkage

| Requirement | Check / gate | Observed result and remaining obligation |
| --- | --- | --- |
| AC03 useful/provenance-correct content | PUBLISHING + DISCOVERY; EDITORIAL/REVIEW/PUBLICATION | PUBLISHING passed at5057; DISCOVERY interrupted by outer190s. Correct wrapper, then execute owning selection to complete strict accounting. Human gates remain pending. |
| AC04 discovery/integrity | BASIC + SEO + DISCOVERY + STYLE; SURFACES/SEARCH/STYLE-REVIEW/TECHNICAL-SCOPE | Other three mapped checks passed at5057; DISCOVERY unresolved. Hosted/mobile/no-JS, canonical observations and deferred schema scope are unchanged open gates. |
| AC05 exact-source verification/delivery | RI + RI-CI; REVIEW/RELEASE | Both passed at5057; correction requires new-source binding and affected fresh independent review. This preflight does not authorize publication or whole-issue completion. |
| AC01/02/06 baseline/destination/outcome | Existing policy's manual and source gates | No changed requirement or evidence supplied by a timeout correction. Unknown search demand, delayed outcomes and owner decisions remain unchanged. |

## Required final delta checks

1. Inspect the actual final diff: only owning-wrapper deadline derivation and necessary source-binding/generated RI bookkeeping. Obtain the number through a short bounded, checked Node subprocess; reject nonnumeric/nonfinite/nonpositive values and use precise milliseconds-to-seconds conversion. A helper invocation failure must fail the owning test, not silently fall back. Preserve the exact seven-module selection, nonzero total, passed==total, child return-code check, failed/cancelled/skipped/todo==0 and all existing maintained runner guards.
2. Verify `source-tests.cjs` limits/helper, policy, product budgets, rights/provenance and publisher paths are unchanged. Do not expand intrinsic600s, report30s, buffer16MiB or alter scheduling/scenario coverage to obtain a pass. Record exact final source hashes/diff and update required RI/CI bindings.
3. Preserve the5057 failure raw evidence unchanged. Execute the corrected DISCOVERY selector once on the concrete candidate with complete result/accounting; any new failure returns to diagnosis. Then obtain required exact-candidate mapped acceptance. Reuse unaffected earlier evidence only where dependency/oracle identities are proven unchanged and policy permits; source hashes alone are not a new execution.
4. The reported running13-consumer integration campaign was deliberately not duplicated or read for an inferred outcome. Await its actual final exit and complete accounting, retain its original source identity, and assess affected dependency coverage on the corrected final candidate before integration acceptance. A running or partial result is not pass.
5. Obtain fresh applicable final Requirements/Code/QA delta reviews after implementation, retain original findings, and preserve every external/manual gate in issue213. This bounded wrapper repair cannot complete all six ACs or authorize merge/stable/production/external edits.

## Inspected byte identities (SHA-256)

- Common prompt: `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`
- Requirements prompt: `010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6`
- CONTRIBUTING: `ec10d92c6f861e9c6de32b79eaf428fb6d4ce3b5091d000bc680bfc5ca29d30f`
- Scope request: `37a4a05b39d17a3c391f8fabe65ce266d03b77a3237ffe5d15511e79ee9866d9`
- Dated issue snapshot: `1f339ae4a36e7621b73e9ee56e5e18709b6cf062d0267a80c1f094095a8838f8`
- Source packet: `988a921abdcd90765057a29e950e8d450172a2e53da660c920b440cb9335e2c6`
- Acceptance policy: `a598cde4f5956cd283899bbd8d090af9edf6a7bfe5a9a1f3ebba690bded6cdbc`
- Owning test: `2b36ac8317c6788d685e336dd1daf84b1eb814a1356014b7663b1acbb6d0cdb3`
- Maintained runner: `9c5ba854149a56fdb9156805a76792190c609a54b2fab9df0f58f27917493f5e`
- Check-profile owner: `8fd38f4ebef3c3c65f7b21ba5ebd8d0328fb83caef2e5acc6dd6834a0759beb8`
- Raw acceptance JSON: `9c52d2394250628d0210722e5f4ce22ee272f53bb79f41ff1c70cddcd4471707`
- Raw acceptance log: `6cd8354c8c34bcc63aaf5509172d623ab113ee010751682ab45970b4a7587df9`

Limits: preflight of a proposed change; no implemented correction, eventual child success, hosted surface, production, indexing or independent whole-package acceptance observed.
