# Issue177 — prepublication correction Code review

2026-11-08; nonauthor reviewer `/root/issue177_ci_code`, affected continuation after retained CI42511286540 diagnosis. Inspected dirty actual candidate atop `06ffa6fcfc1cfa5fa1030e5d077d5d314e324d07`; no implementation, external writes or delegation. Earlier failure/selector diagnosis remains preserved.

## Verdict

No blocking code finding in the bounded correction. The observed stale carrier identity and metadata-test route oracle are corrected without verifier/assertion weakening or new SEO behavior. Full affected-suite accounting and actual browser CI remain required; this is not a whole-AC or release approval.

## Inspected identities

- `review/issue-169/writing-carrier.json`: SHA256 `6947f1e78eb6e5797cd2b2d5d176786c2d6f9b7acb2c628a856def7ce2602a5a`.
- `tests/content.test.cjs`: SHA256 `0f9fbed2efdabbd3546865f4444c29245245c8ca6ce38e06c9ed772bb935c2cf`.
- `.github/ri-ci-map.json`: SHA256 `399d6840ea74349f497af57469e80cd3fbfc51736a00ed10cc0ab0cc914ebac5`.
- Owning report inspected SHA256 `29e4cb288bec9eb711c5efd8151c5eb0029f7dc40c91dcec0bc58ed52df04c05`.

## Findings/disposition and checks

1. Actual carrier diff changes only build.cjs afterSHA256 to current producer `ee69b9950ed0982a69344c5b92f6988b293362112817d8a2fc504ebfe101adee`. All historic before pins/predecessor, accepted geometry/resource identity, other producer pins and schema remain untouched. Owning report pins the old active record to full immutable06ffa6fc, preserves failed CI/artifact identity and1245/1240/5 accounting, and labels skipped browser/publication honestly.
2. Independently invoked unchanged canonical `verifyWritingCarrier()` and `verifyResearchCarrier()` on this correction. Both completed successfully, including producer chain, accepted SVG geometry, exact passive resource bytes and alias/snapshot reconstruction. Writing digest remains `943eaad6a4a49f83671d25ae9f9d766e80196f8b25b5aa68173715be5e955874`; Research remains `afd670d4651035dce324acb94b6efb83b7b7e0372d978a4f5a961f0eb86d7341`.
3. Metadata test independently supplies principal routes and validated catalog local-article URLs to existing `analytics.compile`. `build.catalog` is the re-export of canonical content.catalog, which calls validateCatalog. It does not call the private producer helper or accept emitted loader hash as oracle. Existing loader byte/path digest, exact script attributes/count/empty body, schema and semantic metadata assertions remain unchanged. Both undeclared-page admission and weakened metadata checks are avoided.
4. Parsed current `.github/ri-ci-map.json` equals HEAD parsed data exactly: format-only. Complete candidate diff has no `tools/check_site_seo.cjs`, scanner, budget or RI producer changes. Generated RI identity refresh is appropriate to changed authored owner/test/report bytes.
5. Independently ran `python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify`: exit0, context fresh.
6. Inspected `/tmp/issue177-ci-carrier-seo.json`: pass=true,5 route rows, original accepted Research carrier identity. This is retained author execution evidence; reviewer independently executed carrier proofs, not whole SEO CLI. Three affected suites were still running according to supplied task; no final suite result is claimed by this report.

CS01/CS02/CS04: existing canonical owners and data authority retained. CS05/CS08: focused formatted correction and meaningful original assertions retained. CS10/AC01/AC07: report records exact failure, treatment, unchanged constraints and explicit pending gates. AC04 original SEO implementation remains outside the checkpoint; these repairs restore existing acceptance behavior and do not add metadata/features. AC02 browser evidence remains pending. No live collector/provider observation or release authorization supplied.

## Follow-up exact-source execution distinction

Inspected retained `/tmp/issue177-prepublication-correction-native.json`: dirty three-suite run reports63 tests/62 pass/1 fail/0 cancelled/skipped/todo. This failure remains a failure; it cannot be reported as a passing affected suite campaign.

Read `tests/content-rendering.test.cjs:174-220`: fresh SEO CLI test creates `git clone --shared` from the repository, then overlays only checker, Home frame and trusted-reader producer pin. It intentionally obtains `writing-carrier.json` from committed HEAD, so the dirty working correction is absent from that fixture. The pending local carrier commit is therefore a source-identity prerequisite for this check, not evidence that the test or geometry needs another alteration. No blanket fixture overlay or assertion change is warranted by this fact. After committing the reviewed correction, run the same three suites on the clean exact source and retain complete results before CI. Reported full formatter pass remains author evidence; parsed RI-map equivalence was independently verified above.
