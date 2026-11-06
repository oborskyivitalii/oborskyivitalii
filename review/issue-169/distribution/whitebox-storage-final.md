# White-box QA — storage-only final binding

2026-11-06. Reviewer /root/distribution_whitebox. **Verdict: no blocking findings for the bounded v5 storage delta; retain v4 White-box acceptance.**

## Exact candidate and reused judgment

Prepared dirty candidate, base 7c292bd50a4f9a0024c397a290c1de965ceada4f. Packet review/issue-169/distribution/candidate-v5.json SHA256 **8e557f88ebc451ebd7a03ed2fb7410dc335467a6a67576678ead6ceed28df30f**; independently checked **46/46** declared hashes/deletions. All **41/41 v4 pins are unchanged**. Base and explicit catalog-owner correction are unchanged.

Reuse /workspace/scratch/f4dcb060a703/distribution-whitebox-final-v4.md, SHA256 ec588a3a8de5bfbb524abc8fea746fdf07c076afe88129db56eafef538a370b7: WB01/WB02 resolved, 17 independently executed adversarial/control cases matched, current kit eight formats and pending-state checks passed. Original/first/v3/v4 reports remain preserved. Source/module/compiler, tests/oracles, profile, kit, PDF/semantic/assets and event guards were not changed by v5. No campaign repeated. The supplied 54-test suite observation remains parent-owned, not a newly executed or independently inspected campaign here.

This is a correction continuation with previously disclosed parent delta exposure, not a fresh first judgment. No peer output or historical report contents read. Gzip decompression used bytes only for hashes/equality. No source/tests/external writes or delegation; only this assigned output written.

## Independent storage oracle and checks

Each archive must decode exactly to its corresponding Git blob at the bound baseline, with matching manifest hashes/lengths. Each regular-file locator must link to its adjacent archive, state the original/archived SHA256, retain an explicit decode command and explain relative-link context. Storage treatment must leave active code/oracles and the reviewed v4 bytes unchanged.

| Historical path | Exact baseline equality | Original/archive digest and length | Locator and file boundary |
| --- | --- | --- | --- |
| review/issue-120/2026-10-22-review.md | Pass | Pass; 77550 decoded / 25056 archive bytes | Adjacent .gz link, hashes, decode command and original relative-link directory retained; independent regular files |
| review/issue-122/2026-10-24-r3-runtime-compatibility.md | Pass | Pass; 80293 decoded / 30649 archive bytes | Adjacent .gz link, hashes, decode command and original relative-link directory retained; independent regular files |

Net savings including both locator replacements: **100594 bytes**, independently recomputed, matching receipt-storage-archive.json.

A bounded literal-path search across tools/tests/site/.github/guides/root routing/map found inventory/map/RI references, plus prose reason strings in tools/quality/secrets-publication.json. Inspected matching context: these identify historical evidence; no parsed content consumer or executable dependency on the two Markdown bodies was found in that scope. This is bounded search evidence, not an absolute whole-repository absence claim. Existing RI/map path references continue resolving to locators. Original detailed anchors/content require decoding the archive; the locator is not a substitute for reading the historical report.

## Raw execution

Write-free Node heredoc, exit 0: hashed all46 pins; compared v4 pins; gunzipped both additions in memory; compared each byte-for-byte to git show baseline:path; checked digests, lengths, savings and independent regular-file status; printed locator contents only. A scoped rg search and bounded matching-context reads followed; no historical decoded prose printed.

~~~text
packet 8e557f88ebc451ebd7a03ed2fb7410dc335467a6a67576678ead6ceed28df30f 46 46
unchanged-v4-pins 41 41
same-base/catalog true true
archive review/issue-120/2026-10-22-review.md {"exactBaseline":true,"originalHash":true,"archiveHash":true,"originalBytes":true,"archiveBytes":true,"savings":true}
locator review/issue-120/2026-10-22-review.md "# Issue 120 — 2026-10-22 independent quality-agent integration\n\nThe complete original historical report is preserved byte-for-byte in [2026-10-22-review.md.gz](2026-10-22-review.md.gz). This locator preserves the unchanged 250 MB repository hash bound while adding distribution review receipts. No finding, rule, evidence or acceptance condition is changed.\n\nOriginal decoded SHA256: `70ee3b02b77fa6dc918dbc2c1b9ffca455154313144fea48976b474e56f859fe`. Archive SHA256: `c23beee2a93c696de78b4b006451908ddfb04e1b03ee02543e96834407be39da`. Decode with `gzip -dc review/issue-120/2026-10-22-review.md.gz`. Resolve original relative links against this directory. Current work: [issue169 distribution](../issue-169/2026-11-06-distribution-workflow.md).\n" local-link true
regular-files true
archive review/issue-122/2026-10-24-r3-runtime-compatibility.md {"exactBaseline":true,"originalHash":true,"archiveHash":true,"originalBytes":true,"archiveBytes":true,"savings":true}
locator review/issue-122/2026-10-24-r3-runtime-compatibility.md "# Issue122 — 24 October 2026 exact-runtime compatibility\n\nThe complete original historical report is preserved byte-for-byte in [2026-10-24-r3-runtime-compatibility.md.gz](2026-10-24-r3-runtime-compatibility.md.gz). This locator preserves the unchanged 250 MB repository hash bound while adding distribution review receipts. No finding, rule, evidence or acceptance condition is changed.\n\nOriginal decoded SHA256: `ee80dea26b126188458cc6e4ddfc11fc6cd79731fe0adf738ca6492d4450bb2e`. Archive SHA256: `38150cb23720ea955ec26c29cc1eb88e002eb049d4f0840276a4c3d9f12e1220`. Decode with `gzip -dc review/issue-122/2026-10-24-r3-runtime-compatibility.md.gz`. Resolve original relative links against this directory. Current work: [issue169 distribution](../issue-169/2026-11-06-distribution-workflow.md).\n" local-link true
regular-files true
net-bytes-saved 100594
REPOSITORY-MAP.md:1012:| [review/issue-120/2026-10-22-review.md](review/issue-120/2026-10-22-review.md) | Dated issue120 requirements preflight, independent code/QA role evidence, test-design mapping and delivery status. | history | [CONTRIBUTING.md](CONTRIBUTING.md) |
REPOSITORY-MAP.md:1038:| [review/issue-122/2026-10-24-r3-runtime-compatibility.md](review/issue-122/2026-10-24-r3-runtime-compatibility.md) | R3 exact-runtime bootstrap dependency, prospective byte/source freeze, independent reviews and compatibility delivery evidence. | history | [CONTRIBUTING.md](CONTRIBUTING.md) |
.github/ri-ci-map.json:149:        "review/issue-120/2026-10-22-review.md",
.github/repository-intelligence/agent-context.json:1106:        "path": "review/issue-120/2026-10-22-review.md",
.github/repository-intelligence/agent-context.json:1211:        "path": "review/issue-122/2026-10-24-r3-runtime-compatibility.md",
.github/repository-intelligence/agent-context.json:14197:      "path": "review/issue-120/2026-10-22-review.md",
.github/repository-intelligence/agent-context.json:14428:      "path": "review/issue-122/2026-10-24-r3-runtime-compatibility.md",
.github/repository-paths.json:1762:    "review/issue-120/2026-10-22-review.md": {
.github/repository-paths.json:1894:    "review/issue-122/2026-10-24-r3-runtime-compatibility.md": {
tools/quality/secrets-publication.json:11780:      "reason": "Issue122 R3 compatibility: individually reproduced public runtime/edition/file SHA256 from official prospective plain/staging/production generation; canonical and immutable aliases and production edition verification pass. Exact path/type/SHA1 only; no credential, scanner exemption, future platform acceptance or publication permission. Source freeze and independent review: review/issue-122/2026-10-24-r3-runtime-compatibility.md."
tools/quality/secrets-publication.json:11787:      "reason": "Issue122 R3 compatibility: individually reproduced public runtime/edition/file SHA256 from official prospective plain/staging/production generation; canonical and immutable aliases and production edition verification pass. Exact path/type/SHA1 only; no credential, scanner exemption, future platform acceptance or publication permission. Source freeze and independent review: review/issue-122/2026-10-24-r3-runtime-compatibility.md."
tools/quality/secrets-publication.json:11794:      "reason": "Issue122 R3 compatibility: individually reproduced public runtime/edition/file SHA256 from official prospective plain/staging/production generation; canonical and immutable aliases and production edition verification pass. Exact path/type/SHA1 only; no credential, scanner exemption, future platform acceptance or publication permission. Source freeze and independent review: review/issue-122/2026-10-24-r3-runtime-compatibility.md."
tools/quality/secrets-publication.json:11801:      "reason": "Issue122 R3 compatibility: individually reproduced public runtime/edition/file SHA256 from official prospective plain/staging/production generation; canonical and immutable aliases and production edition verification pass. Exact path/type/SHA1 only; no credential, scanner exemption, future platform acceptance or publication permission. Source freeze and independent review: review/issue-122/2026-10-24-r3-runtime-compatibility.md."
tools/quality/secrets-publication.json:11808:      "reason": "Issue122 R3 compatibility: individually reproduced public runtime/edition/file SHA256 from official prospective plain/staging/production generation; canonical and immutable aliases and production edition verification pass. Exact path/type/SHA1 only; no credential, scanner exemption, future platform acceptance or publication permission. Source freeze and independent review: review/issue-122/2026-10-24-r3-runtime-compatibility.md."
tools/quality/secrets-publication.json:11815:      "reason": "Issue122 R3 compatibility: individually reproduced public runtime/edition/file SHA256 from official prospective plain/staging/production generation; canonical and immutable aliases and production edition verification pass. Exact path/type/SHA1 only; no credential, scanner exemption, future platform acceptance or publication permission. Source freeze and independent review: review/issue-122/2026-10-24-r3-runtime-compatibility.md."

~~~

## Allocation and remaining limits

Storage cases are deterministic archive/manifest/navigation checks, not new distribution scenarios. Reuse existing archive/history and repository RI/navigation ownership; parent retains final catalog/RI and actual fixed repository-bound validation. This review proves the reported net storage reduction, not the final total repository size after all receipts.

No deployment, production/platform/editor/HTTP/mobile/browser, final Actions or author/rights/release decision was observed. Those original gates remain. Rebind the completed bounded White-box result to v5 with the exact unchanged-v4 evidence above; no new release/publication approval is supplied.

