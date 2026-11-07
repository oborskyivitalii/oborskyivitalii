# Code / changed-artifact review — first judgment

Verdict: **No blocking correctness defect found in the inspected distribution implementation.** This is a bounded code/artifact judgment, not readiness, publication, owner approval or a full repository-check pass. Final lint/style, RI/catalog, native-editor/live-site and the other required role gates remain independently applicable.

## Identity and isolation

- Reviewer: `/root/distribution_code`, distinct nonauthor Code / changed-artifact role; no implementation or test authorship, no delegation, no external writes.
- The task supplied a none-fork launch assertion. Provider-internal context isolation and model details are not observable from this execution. No author conversation, MEMORY, or current peer outputs were read. The only author follow-up received before this saved judgment reported pending lint facts and requested preserving the first result; those reported lint results were not treated as independently verified evidence.
- Repository HEAD/base: `7c292bd50a4f9a0024c397a290c1de965ceada4f`; local main: `8cf15883125892710633b17133d9ee0fc4b23b92`. This is a dirty native Git working tree, not a clean checkout.
- Prepared candidate: `review/issue-169/distribution/candidate-v2.json`, SHA-256 `296f566b486e97c6e11395d72ae379624e667287cda49c0fee40328b528572f2`. Independently recomputed all 40 declared file/deletion entries: **zero mismatches**.
- Original-intent input SHA-256: `0f8b0146e26d51748ac171408be03a13e86628c01185a10005844acd659256b8`; dated issue input SHA-256: `b8844112ad357ef14e5720259755bb81ba0362e73d6b2f5fa0073fe0b5d8044e`. Both independently matched supplied identities.
- Common reviewer prompt SHA-256: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role prompt: `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`; current root AGENTS: `f8f13dd686d977fc90d8e9932c388842b3beedb046810a0be3c14302a9496d01`.

## Inspected sources and invariants

Read root AGENTS, README, CONTRIBUTING, reviewer common/role contracts, the relevant repository-map owner entries, CODE-STYLE, the site source contract, ARTICLE-WORKFLOW and ARTICLE-MATERIALS. Only the root AGENTS exists. Inspected the actual diffs and implementation for publishing profile, kit and events; article load/integration order; materials admission; their changed tests and source-selection registry; AGENTS/acceptance/check-profile routing; relevant generated reader changes; archive manifest/locators; and the separate PDF catalog-owner correction. Did not read current review conclusions or decompress historical reports for their prose.

- CS01/02/04: distribution labels remain authored profile data; production URL derives from the existing policy and article slug; engine/runtime has no new import or publication registry. Build adapters render the furniture, and profile loading accounts for its policy dependency. No new module dependency cycle was introduced by the changed imports.
- AC04/09: ordinary planned links are separate from canonical/publication-event authority. Article loading still demands exact observed site-event proof before accepting canonical metadata. Existing artifact/source/served-document validators and append-only history guards are unchanged. New site-first checks add platform host, base-edition and chronological constraints before writing platform events, including direct-history loading.
- AC04/09: HTML, Markdown, TXT and copy-ready exports on both platforms receive the two links. Launch interpolation is confined to generated launch output. TXT character accounting includes exactly the added TXT furniture and still counts Unicode code points. Manuscript, print and semantic content are not rewritten.
- AC10: public reciprocal materials still need their existing source/review/observation pins. An opted-in article may initially have no platform records; a public half-pair fails. Each selected platform item must match an observed event for the current full/adapted edition, exact URL and observation ordering. Private/unapproved items remain excluded from public output.
- AC05/11 and CS08/10: tests assert real generated outputs and meaningful refusal cases, rather than only keywords or existence. The existing registry selects the publisher/profile/materials suites for changed canonical workflow guides; site-checks uses the existing source-test execution path. Removed generic AGENTS selection does not weaken publication tests for actual source/profile changes and preserves the existing repository-only AGENTS contract. No new workflow/controller or widened release budget appears in the diff.

## Actual bounded observations

Executed the existing `verifyKit()` and `loadArticle()` read-only APIs for actual R10 kit `2449614dd7b2040475a967d7469f140b2cb3add114dcf9fe4938611a3baf1723`, and inspected all eight platform files plus both generated launch files:

- Whole-kit inventory/digest verification passed.
- Both exact production article/materials-anchor URLs occur in all eight platform outputs and both launch outputs; launch placeholders are absent.
- State is `planned`; canonical, published and modified are null; event count is zero. The real article model includes `site/publications/policy.json` among its inputs.
- Actual TXT bounds: LinkedIn **19,378 / 20,000** code points; Medium **19,378 / 30,000**.
- Print HTML contains no appended distribution label. The selected full edition remains `sdlc-out-of-balance-en-r10-20261106`, committed manuscript SHA-256 `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f`.
- Native Git diff under the article source/assets shows only `profile.json` changed; manuscript, PDF, semantic edition and selected assets remain unchanged.
- Independently decoded each new gzip archive in memory and compared it to `git show` at the baseline: both are byte-for-byte identical to the original historical Markdown. Checked known references: they route to the preserved Markdown locator; no current anchored reference to a removed heading was found in the bounded source search.
- Read retained raw logs: first publisher/material campaign reports 54/54 pass; affected campaign retains two selector failures; final selector campaign reports 47/47 pass and exercises both guide selection and repository-only behavior. These are retained executions, not tests run by this reviewer, and log accounting alone does not establish final-candidate source binding.

## Findings, questions and limits

No blocking implementation finding from this bounded inspection. Nonblocking hardening observation: `tools/publishing/profile.cjs:99` rejects several unsafe origin classes, but its new public-origin predicate is narrower than `tools/site/article-materials.cjs:54` (for example, single-label and `.internal`/`.test` hosts). The actual fixed production policy is correct, so this does not affect the inspected R10 artifact. Reusing an appropriately owned common public-origin predicate would reduce future validation drift; it is not an authorization to expand this patch.

The PDF catalog owner change at `.github/repository-paths.json` correctly points the generated reading-PDF source to ARTICLE-WORKFLOW's full-reading/PDF ownership, while ARTICLE-MATERIALS owns selection/admission. It does not alter the PDF or a guard. That file is outside the 40-entry prepared manifest, so it must be source-bound by the final metadata packet/check receipt.

Final lint reports mentioned by the author have not been read or independently checked here. Final deterministic RI/catalog/preview refreshes and subsequent source changes require byte verification and, for substantive changes, affected re-review. No full suite was duplicated. No actual browser, platform editor, live HTTP publication, reciprocal platform content/backlink, author visual acceptance or production controller action was observed. This review cannot satisfy those gates or tick whole issue ACs.
