# Issue177 failed prepublication — Requirements & Acceptance fix-plan review

2026-11-08. Reviewer `/root/issue177_ci_requirements`; continuation, not fresh first judgment. No peer output/private history inspected; no implementation or external state changed. Own read-only diagnosis of retained raw reports and canonical source follows.

## Verdict

**PROCEED with a bounded source-owned correction plan.** The observed failures identify stale producer-successor evidence and a stale independent analytics test oracle; the proposed repair remains necessary analytics test-impact maintenance under AC01/AC07. It does not require or authorize new SEO functionality. Passing the eventual correction must still be observed; all whole issue177 AC01–AC09 remain open.

## Observed failure and identity

Clean source/head `06ffa6fcfc1cfa5fa1030e5d077d5d314e324d07`, tree `8193b1fab23a9af8f4bc6e651a1c1cf45048fa99`, independently read from retained source-runner JSON; same identity before/after. Raw TAP supplies five completed failures, accounting 1245 total /1240 pass /5 fail /0 cancelled/skipped/todo. This is not a timeout or incomplete test campaign.

Read retained files under `/tmp/issue177-ci-failure-42511286540/reports`: source-runner JSON/TAP, SEO stderr, format stdout. Parent supplied archive digest `c947064943218de8c0ec37577c2c4840b500e5088a2bc30e433f896df4ba6fc9`; extraction content was inspected, archive hashing itself not independently repeated in this execution. No browser pass/fail is established by these prepublication source failures.

- Four failures: executive carrier tests at lines19,44,547, plus fresh SEO CLI content-rendering line174. All report current build producer SHA-256 `ee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee` against accepted predecessor `3d9b80f989008ae487cccf4b38aea630bd4ddf62782a971e7e62142c9fbbc869`. Independently hashed current build.cjs to the former. Separate SEO CLI fails at the same Research producer check.
- Fifth failure: `tests/content.test.cjs:491` independently compiles analytics with principal routes only; line524 compares the resulting old loader7ebed494 against actual current loader1c34e640. Actual compiler change intentionally adds validated public local-article routes and binds them into fingerprints. Read actual build.cjs diff against accepted production baseline; it is that analytics change, not a fallback geometry rewrite.
- Format report has exactly one changed file, `.github/ri-ci-map.json`, using pinned Prettier3.6.2 / Ruff0.16.10.

## Approved treatment boundaries

1. **Retain historical carrier records and exact accepted geometry.** Existing `review/issue-169/writing-carrier.json` records historical before/after producer hashes and accepted Writing SVG/resource. Research reuses the same `carrierProducer` route in `tools/check_site_seo.cjs:238–377`, while maintaining its own exact predecessor SVG reconstruction and resource bindings. Extend this source-owned proof through an explicit, narrowly typed issue177 producer-successor amendment for only `tools/site/build.cjs`: verify old accepted hash and immutable predecessor bytes, exact current hash, and bounded owner/schema/path inventory. Do not silently overwrite the historical accepted record or bless arbitrary current bytes. A helper/finite successor handling may serve both Writing and Research. No new SEO metadata, editorial copy, canonical/discovery logic or exemption is needed.

2. **Keep all carrier evidence refusals.** Preserve historical predecessor checks, exact producer inventory, current-byte checks, accepted SVG digest and exact reconstruction/resource/dependency checks. Update affected fixture copying for any newly required successor source. Add meaningful successor refusals where needed: missing/unknown path, wrong historical or current digest, changed current producer, malformed/missing amendment. Existing altered geometry/source tests remain. A hash refresh alone is not geometry proof; the existing reconstruction checks must still execute and pass.

3. **Repair the independent content-test oracle.** In `tests/content.test.cjs`, independently derive expected routes from canonical principal config plus validated catalog `local-article` primary edition URLs, then compile expected analytics bytes as before. Preserve exact digest/content/script comparison. Do not hard-code the observed new loader digest, copy its bytes as expected output, reuse the production route helper as the only oracle, or remove the equality assertion. The test's remaining metadata/schema checks and script count remain unchanged. This is analytic route expectation maintenance, not AC04 SEO implementation.

4. **Format only the reported RI map with pinned formatter**, then regenerate/verify its current identities as required. Register any new source amendment in existing path/RI owners and affected test-input inventories; do not create another pipeline or widen exclusions.

## Verification and stopping conditions

Run the smallest affected checks first: carrier/executive and content-rendering source suites, corrected content metadata test, ordinary SEO CLI and pinned formatting check, plus new successor refusals. Expected information gain is explicit: the same producer history and geometry proofs now accept only the exact reviewed analytics successor; the content test derives the intended full route list and exact loader without hard-coding output. Any new mismatch stops advancement for diagnosis; retain all previous failed artifacts.

Complete applicable Basic/style/RI/RI-CI and source selections on the corrected candidate, with affected independent correction reviews, before another existing CI campaign. Unchanged browser matrix, suppression/isolation cases, scanner proofs and budgets remain required. Later exact preview/browser evidence still must be collected and inspected; then stop/report under the existing checkpoint. No stable promotion, merge, production, new SEO/discovery or Medium action follows from this plan review.

## Later plan reconciliation — existing mutable successor owner

After the initial judgment, the orchestrator supplied a Code reviewer recommendation summary. This is disclosed reconciliation exposure, not a fresh independent first judgment; no peer output file was read. On reconsidering the actual existing `carrierProducer` contract, a new successor layer is **not required** by acceptance. `review/issue-169/writing-carrier.json` is already the canonical current successor pin owner, and Git retains its immutable prior state. The preservation requirement concerns truthful historical evidence and strong current-byte/geometry proof, not a mandatory additional file or verifier mechanism for every build change.

**Accepted narrower alternative:** before changing only `producerChanges["tools/site/build.cjs"].afterSHA256` in that existing owner, independently establish Writing and Research geometry/resource/carrier parity on the exact candidate; record old/new producer hashes and immutable old carrier reference at `06ffa6fcfc1cfa5fa1030e5d077d5d314e324d07` in the dated issue177 correction evidence. Retain all historical `beforeSHA256`, predecessor source, accepted SVG/resource values, other producer pins and every existing assertion/refusal. This explicit current-pin refresh is not a silent historical rewrite and meets the same requirement with a smaller implementation. No new successor refusal machinery is needed if no new machinery is introduced. The independent content-test oracle and formatting treatments above remain unchanged.

This clarification supersedes the initial plan's preference for an additional issue177 successor amendment, while preserving that original first judgment verbatim. It does not claim parity has already executed or accept the eventual changed bytes without exact-source review and checks.
