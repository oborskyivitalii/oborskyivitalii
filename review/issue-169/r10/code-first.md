# R10 Code / changed-artifact review — first independent result

Reviewer: `/root/r10_code`, distinct nonauthor Code / Artifact Reviewer. Date: 2026-11-06. No implementation or test edits, external writes or delegation. Only this assigned review artifact is written.

## Verdict

**Correction required before readiness for the original prepared candidate.** The requested operating-model amendment is present, ordered correctly and preserved in the native reader, both platform HTML adaptations and the five-page PDF. One public provenance statement is false for the new PDF. In addition, the shared candidate changed during inspection; this result binds the original manifest, not the in-progress replacement.

## Identity and independence

- Repository: `/workspace/scratch/f4dcb060a703/repo`; base `b75a0a31e36be02bea15bb7a0b269d032fa3cdcb`; source-only commit/observed HEAD `907602667ca447f23359bfa87acc0c191f5e3b8a`.
- Prepared dirty candidate manifest: `review/issue-169/r10/candidate-manifest.json`, SHA256 `6f1754aa68472e2ad5b6e04195ac47af0c5b469a7bdd4afd0856ffcb8dba8fa1`. Independently verified every listed present/deleted path against its bytes: zero mismatches at first inspection.
- Inputs: supplied original intent `/workspace/scratch/f4dcb060a703/r10-intent.md` and owner snapshot `/workspace/scratch/f4dcb060a703/issue169-snapshot.md`; actual diff from base; authored publication/profile/material/edition/rights owners; generated native output; supplied kit `dist/publications/sdlc-out-of-balance/e7f9e3adda5ff24e5f05ba2581923a808bb2c94c210f0eb05166c6d6fca464de`.
- Instructions read: root AGENTS, CONTRIBUTING, reviewer common contract and Code prompt, README, repository map, applicable site source contract and article workflow. No nested AGENTS were found under affected site/review/docs directories. MEMORY, private chat and current peer output files were not read. No unexpected author conversation/current peer verdict exposure was observed. Native allocation and material-review claims were treated as candidate assertions, not independent proof.
- Common prompt SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; Code prompt SHA256 `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`. Actual caller-side launch/isolation parameters and provider internals are not independently observable from this execution and must be retained by the orchestrator.

## Finding C1 — moderate, public PDF provenance is inaccurate

**Location:** `site/publications/sdlc-out-of-balance/publication.json:112`, hero asset credit in the original manifest version; propagated into native/platform figure credits and kit `INSTRUCTIONS.md:22`.

**Evidence:** The credit says “original accepted PNG is retained in source provenance and the PDF.” The R10 PDF actually embeds the JPEG derivative: independently extracted image on page 1 is JPEG, 1672×545, SHA256 `fe76db95cbedba54934895fa21139654399b41b7c820c1974ad3fef410223e5f`, matching `hero-web.jpg`. The original declared hero PNG is SHA256 `3fb21ca8f7aae0ebe85f9da0cc5aaf5e124deb916d9fc625d3a46e4dfd33293f`. R10 PROVENANCE and material review already describe JPEG correctly, creating a contradiction with the public credit.

**Mechanism and effect:** An unchanged credit becomes false when the newly generated PDF switches hero encoding. Readers receive a stronger preservation statement than the artifact supports. Affects AC08 source/rights accuracy and AC09 native/PDF/platform parity; the article-workflow semantic digest explicitly includes figure credits.

**Treatment:** Correct the authoritative hero credit to describe current renditions and historical PNG retention accurately. Recompute semantic edition/material bindings and regenerate dependent native/platform outputs; verify exact revised candidate before readiness. No image redesign or runtime/test change is necessary.

## Independent observations and checks

- `node tools/publishing/cli.cjs validate sdlc-out-of-balance`: **passed** on original manifest source. R10 committed manuscript SHA256 `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f`, commit/blob `9076026…` / `972486f459ebbcfd6cc333977d603670a6ea82dc`; semantic `d7d3f8e1adb48171227a05cd5512037a2fceab599ed782d2fb7d54971eac4ea4`; seven sections, five figures.
- `node tools/publishing/cli.cjs verify dist/publications/sdlc-out-of-balance/e7f9e3adda5ff24e5f05ba2581923a808bb2c94c210f0eb05166c6d6fca464de`: **passed** kit byte verification.
- `node tools/site/build.cjs --check`: **passed**, all five routes checked; output reported built index/research/writing/talks/credits, no removals. Original manifest bytes still matched before the concurrent publication-metadata edit.
- PyMuPDF independent extraction: **five pages**, five embedded images, **17 unique linked URL destinations**, and no extracted text block outside page bounds. All four diagram images extracted byte-identical to their source PNG hashes. Hero is the exact declared JPEG derivative as above. This is structural inspection, not visual/browser/device acceptance.
- Independently compared the full new operating-model paragraph, small-team paragraph, enterprise-cost paragraph, whole-system objective, accountable-owner paragraph and bounded-pilot paragraph as exact normalized strings against native HTML, LinkedIn HTML, Medium HTML and PDF extraction: **all six present, in the required order on all four surfaces**. Extensive delegation, limited assistance and no AI remain legitimate choices; whole-system economic/operational aim precedes ownership and pilots.
- Checked extracted PDF against AST text: 63 top-level paragraph/heading/list blocks inspected; all paragraphs/headings matched. The combined reference-list comparison did not match as one concatenation because printed list numbering interrupts concatenation; all 17 actual URL destinations were separately inspected. No empirical claims/source URLs changed in the source diff.
- Compared R9 edition JSON and original R9 PDF to base via actual `git show`: both retained **byte-identical**. R10 adds a new edition and PDF instead of rewriting them. Generated current R9 aliases/snapshots are replaced by the generator; R9 is explicitly unmerged/unpublished in supplied intent, so these current-output deletions do not by themselves prove a published-history regression.
- Actual diff shows no runtime, template, budget, test or test-oracle changes. Existing finite publication/material/profile/rights owners are used. The supplied scratch ReportLab generator is not active repository build tooling in this inspected candidate. No additional test suite is proposed for the prose amendment.

## Check limitations and incomplete execution

A bounded existing-test command was attempted: `node --test tests/article-materials.test.cjs tests/article-budgets.test.cjs tests/publication-records.test.cjs`. It emitted 13 passing article-budget/material cases, then produced no further output within the review window. I interrupted that same session with Ctrl-C (exit 130). **The combined suite is incomplete, not passed; publication-records final accounting was not observed.** These partial results cannot establish AC05/09 acceptance. No unchanged failed campaign was rerun. Initial Python extraction setup also failed before analysis because BeautifulSoup was unavailable; the bounded diagnostic was replaced by standard-library HTML normalization and PyMuPDF, which completed.

No full Basic/RI/issue-policy/CI/hosted/staging/production campaign, live URL validation, platform editor action or exact-author visual acceptance was performed by this role. Prior R9 results were not counted as R10 results. Remaining whole-AC gates remain pending.

## Shared-source change during review

After the original checks, `publication.json` changed from manifest SHA256 `585060645fdae4101658cfa4f86ce18984873307e71575d5a7b727f5b22322af` to `a8d81de3fc0d42c759e162a91f7c662fb44caf04ee098429fa5368fe5c55ab5a`. The changed credit appears to address C1. A subsequent actual `loadArticle` attempt failed with **“Content edition semantic identity drifted; freeze a new edition”**, because the then-observed edition still pinned the previous semantic digest. This is evidence of an in-progress shared candidate, not acceptance of the replacement or a claim that the final implementation remains broken. The orchestrator was notified. C1 remains the preserved first finding until a coherent replacement manifest and affected regenerated outputs are independently rechecked.
