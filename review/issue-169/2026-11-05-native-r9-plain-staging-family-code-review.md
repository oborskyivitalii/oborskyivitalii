# R9 plain/staging family data — Code continuation

Refs #169 / PR170. Independent nonauthor Code continuation `/root/native_r9_code`, 5 November 2026. Prepared dirty delta on `e92de9bb5e3e4bcd80c4207457732808d2d67015`; no implementation, new browser execution, external write or delegation. Reviewed actual five-path diff/new fixture and relevant builder consumers; did not read current peer conclusions.

**No blocking finding in the inspected plain/staging family-data delta. Production is deliberately unadmitted.** This is an affected continuation after the e92 control/runtime reconciliation, not a whole-current-head readiness verdict.

## Exact data and policy checks

- The new `issue169FooterRoutes` inherits reviewed behavior and mandatory rights from native-tags, overrides the actual client/space/navigation/plain/staging bytes, and explicitly sets `production:null`. Prior families and fingerprints remain unchanged. Explicit null avoids accidentally inheriting native-tags' old production fingerprint through the spread.
- Independently compared every supplied fixture projection field recursively against the actual full plain/staging manifests previously verified from their raw CI logs. Both are exact projections, including source/tree, artifact digest, variant/components, edition and all ten canonical/immutable runtime file records with hash/raw/gzip sizes. The fixture is clearly labelled a compatibility projection; it is not a complete public artifact or staging acceptance.
- Exact client727 is added to `reviewedDocumentClients`; the existing runtime-byte/fingerprint checks still precede semantic document validation. The original motion-hook, misleading comment/template/JSON, fallback, footer, changed-byte and interface negatives are retained.
- New tests require rights, reject conflicting base client/edition, individually tamper every canonical and immutable runtime file, and reject mixed old navigation. Direct independent checks confirm the new production runtime ID remains unknown and neither known plain/staging fingerprint can masquerade as a production edition.
- The fixture is a maintained dependency of the contract-test row. Actual fixture-only PR selection includes `tests/color-motion-contract.test.cjs`; no new orphan test route found.

Actual independent test command, selecting the observed-runtime and producer-refactor cases: **2/2 pass, zero failed/cancelled/skipped/todo**. Canonical explicit Prettier and diff whitespace checks pass. Root's earlier focused1/1 result is preserved separately at `tmp/r9-runtime-data-tests.log`; it is not expanded into a whole-module pass here.

The intermediate reading-batch golden already refers to the new family's production ID while that ID is absent. The complete three-edition/current-family fixture migration and suite result therefore remain intentionally pending actual production derivation/registration. Do not report the current whole contract module or full source matrix as passed from these two cases.

## Private production derivation and source honesty

An intermediate clean commit is **not required by the normal local private-derivation API**. `tools/quality/artifact.cjs:498–509` records actual Git HEAD/tree and `sourceDirty`; it only refuses dirty source when executing in CI. `tools/staging/color.cjs` preserves that source metadata. The ordinary `tools/release/edition.cjs.build(directory,'color')` selects the reviewed Color **input**, rejects article previews, then invokes the unchanged shared edition producer. That producer preserves the source fields, validates the real full input inventory and computes/writes the actual production bytes. Do not call a lower builder or patch clean metadata to bypass its precondition.

For this local preparation, first use the canonical regenerated source/public output and normal full-artifact/Color builders; verify that its complete runtime tuple still equals the already observed plain tuple. Retain `sourceDirty:true`, parent e92/tree, exact prepared-diff/source pins, generation and full input/output digests in the private evidence. The small compatibility fixture cannot substitute for that full artifact. CI must keep its clean-source refusal; a CI-only execution would need a real clean commit rather than changing that flag/environment to force admission.

The earlier stale-generation failure after changing the compatibility producer was retained by root in `tmp/r9-family-freshness.log`. Root regenerated through the canonical builder while this review was in progress. My subsequent `node tools/site/build.cjs --check` completed exit0 and matched the regenerated output; no generated file was edited by this reviewer. The five reviewed policy/test pins below remained unchanged across regeneration.

Production `motion.select`/verify/package remains closed until the **actual derived** production tuple is separately reviewed and explicitly added. The engine fingerprint depends on edition/base engine/render/declared inputs; document snapshot versions additionally depend on `sourceCommit`. A later clean final commit therefore needs fresh full artifact/snapshot/digest evidence even when its runtime tuple is unchanged. A dirty private derivation is not a clean e92 run, hosted stage, rights/archive approval or deployable release receipt.

## Exact reviewed SHA256

| Path | SHA256 |
| --- | --- |
|tools/quality/color-motion-contract.cjs|`3bf3e271b6704d9a6bcfca034066e4bb20f5416d1f6eeec946c45d7e5b093851`|
|tools/site/runtime-compatibility.cjs|`3efd9ba45d1dfcf5701be79b898feb0eed45ed9b7d95dd0ffce05cde854c2c39`|
|tests/color-motion-contract.test.cjs|`3d7e2d7385ca27ac7caa93566fab50714b252d38e489b7c85633737aa63baad2`|
|tests/fixtures/r9-footer-runtime.json|`7290ff55ad70fc88b4d44d6f92af9c3c2ba5f948b78072a226b9f480a55b5db3`|
|tools/quality/test-profiles.json|`b1843136683e805079f50cc92610ce4cd4fb342c94463e3787fadfb2e55d8ece`|

Recommendation: proceed with that bounded normal private derivation, preserving its honest dirty status and production refusal. Subsequent production row/current-family test edits require affected review; final owner `reviewed_sha` must identify the later complete current head. The earlier e92 full-control accounting does not silently cover these new policy bytes or authorize release.

## Subsequent actual private production data readback

Parent supplied the actual private output before adding a production policy row. Independently verified both complete public directories under `tmp/r9-private-editions/{plain,production}` through `artifact.verify`: both pass. The real plain input selects `issue169-footer-routes-plain`; the output still fails `motion.select` with `unreviewed Color motion runtime`. No browser or build was repeated by this reviewer.

Actual production fingerprint `3364305b3dd69355813459c48ec671ea995f3db88d4d0f5b17c22cda052a4a23`; client727, Color contract1/travel, exact production edition/indexability/origin. Source remains e92/tree626 with **sourceDirty:true**. Full production artifact digest `48a6e40acef6b1213018e08b3d60fe073cddf2a5afb3463360c7c6e05d49b0cc`; derivation parent `0920aff88b8c230ad97998de9acfd5450ee4243da135b8be85c529c46466b9f1` exactly equals the actual private plain artifact digest. Full manifest SHA256: input `e0e805ec9758772477a173ba2c27066888895bed8d07b993cdcfb01b6a05f02c`; output `b65dea3b72518217c51ff5cdfe31b197357b6d6973c3c20451af20fe272f699c`.

Rehashed every actual production runtime file and compared canonical bytes with its immutable copy: all five are identical and equal the observed plain tuple (CSS3fcf, theme6500, space9c12, archivef7da, navigationd2ca; full hashes in the preceding runtime reconciliation). `observed-production.json` SHA256 `002406eb6391d91c29f92140379349ad883bd21088775f0f64fee6ac1417f11b` is an exact field subset of the actual output, clearly labelled dirty private derivation rather than CI/release eligibility.

Inspected the named operator script: it uses normal `artifact.build → Color.build → release.edition.build`, verifies real input tuple equality and preserves dirtiness; no lower-builder or sourceDirty coercion was found. The retained first command failed **after actual output creation** because its expected-error regex `/unknown/` did not match the correct `unreviewed` refusal. The bounded readback checks the existing output without a rebuild; that harness assertion failure remains failed and is not a production-build acceptance claim.

**Code review accepts this exact production tuple as actual derived data for the proposed finite production row.** This does not approve uninspected future policy/test edits, a dirty artifact for release, rights/archive publication or deployment. Parent subsequently reported further current-family golden migrations/coherent-base negatives; those later bytes are not silently covered by the initial five-file pins and need the final affected source readback.
