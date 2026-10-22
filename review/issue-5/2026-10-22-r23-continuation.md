# Issue 5 — 2026-10-22 R23 continuation

Owning execution issue: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5).
Editorial/publication owner: [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2).
Execution remains [Draft PR #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
This record continues the [partial R23 intake](https://github.com/oborskyivitalii/oborskyivitalii/pull/79#issuecomment-6323276486)
and [editorial receipt](https://github.com/oborskyivitalii/oborskyivitalii/issues/2#issuecomment-6323282438).

Implementer roles: `/root` coordinated recovery/integration and
`/root/r23_source_sync` adapted the supplied source and wrote this report.
Separate non-implementing reviewer: `/root/pr79_recovery_review`.
The reviewer inspected the recovered PDF, source adaptation, publisher identities
and focused test receipt. It also independently approved the current-main
integration within the source/retention scope below. The separate final pass reviewed the documentation, catalog, raw evidence
packet and all ten desktop/mobile reader screenshots, with no blocking source
findings after the destination-count wording correction below.

Prepared source is dirty on local integration commit
`64cc91539196d4431cad833b9fe5252c97c29416`, tree
`af3c4f246a23bd923b72cae27ee1891b39816091`. This is the integration baseline,
not the final R23 commit/tree. The final clean commit/tree, complete issue-policy
result and hosted PR preview are pending at this pre-commit checkpoint; consult
the subsequent PR79 execution receipt for their actual outcomes. They are not inferred from the prepared-state
checks below.

## Intent and acceptance

The author requested that PR79 contain the already prepared R23 PDF and Markdown,
and subsequently asked to continue the interrupted PR. The last remote head,
`36b9dec722cdcc080e02110d1cda1147fe0643cc`, preserved only the exact Markdown
snapshot; active article metadata and canonical source still selected R21.
This increment finishes that intake and coherent source synchronization without
another editorial rewrite or a replacement PDF.

Relevant bounded acceptance is #5 AC02/AC03/AC07/AC11/AC12 and #2 AC01–AC03.
The original whole-article, evidence, rights, device, release and merge conditions
remain. No whole acceptance criterion is completed by an import or checksum alone.
The R23 edition remains unpublished author review. No PR79 merge into main,
production activation, permanent-staging promotion or platform posting is performed
by this preparation record.

## Exact inputs and selected edition

| Item | Exact identity |
| --- | --- |
| Supplied R23 Markdown snapshot | `review/issue-2/pmday-candidate-20261015/The_Sum_of_Our_Technology_R23_Manuscript.md`; 43,918 bytes; SHA256 `cb94c4638ad905544c34986e4c3f4cbd81886b2e39a9d31ec67d87811f4f0200` |
| Recovered original R23 PDF | `review/issue-2/pmday-candidate-20261015/The_Sum_of_Our_Technology_R23_Cover02_Compact_Preview.pdf`; 1,021,286 bytes; 14 pages; SHA256 `dc617861409a8d22947ed0cd98ccfc20f97424a271a147b665e4c943bc8f8d0c` |
| Canonical manuscript | `site/publications/pmday-ai-both-sides/manuscript.en.md`; SHA256 `c72b646667bcd9f4cce4892522b9643485e6f0bac3a4624d7c93f545551ceeb8` |
| Selected content edition | `pmday-ai-both-sides-en-review-20261021-r23-cover02` |
| Semantic SHA256 | `afe70ea6ff2cea032fdf65386dc1fd65df31aeabca74b1f59c15078a01f71ce0` |

The recovered PDF matches the digest and size recorded in the interrupted intake.
It is imported byte-for-byte, not regenerated and not represented as a managed
publisher export. The supplied Markdown snapshot also remains byte-identical.
Earlier editions, PDFs and evidence remain historical and are not overwritten.

The canonical article has four figure placements: selected Cover02 and the three
slides actually present in R23 (03, 09, 12). It retains 12 explicit bold
“What if not?” prompts, two tables and 36 numbered source notes. There are 42
unique source URLs and 43 link occurrences in the canonical compiled model.
The PDF has 58 named destinations, including 36 numbered reference destinations,
and 43 unique HTTPS targets; its additional
organizer link is a known difference in the supplied artifact. Import does not
silently alter either original to erase that difference.

## Source normalization and ownership

The canonical source preserves R23 prose, headings and order, counterargument,
byline/date, quotations, source qualifications and both tables. Its bounded
presentation conversions are:

1. The supplied H2 subtitle becomes the reader's leading italic subtitle with
   the same words. The existing selected Cover02 remains part of the reader.
2. Three raw HTML figures become declared `asset:` image references. Their exact
   R23 alt text, captions and credits move to the existing `publication.json`
   owner; source image bytes and dimensions are unchanged.
3. The raw HTML pilot table becomes a GFM table with identical cell text and
   five data rows in three columns. The existing outcome table retains three
   data rows. No general raw-HTML support is added.
4. Reference notes receive consistent continuation indentation so all 36 notes
   remain in one numbered bibliography; excess blank lines are normalized.
5. Bibliography entry 1 keeps its complete wording but omits its second link
   to the same deck URL. The opening named Slides link remains. This follows
   the existing exactly-one-presentation-link contract rather than changing it.

The source registry preserves 41 existing IDs and adds `source-44` for the
Jellyfish paper already included in R23. The former `source-40` organizer URL is
absent from supplied R23 Markdown and is removed from its active registry; the
original PDF retains its organizer link. No source claim is newly researched or
authored in this normalization.

`publication.json` selects the new semantic edition. `profile.json` selects R23
and refreshes the two changed quotation-attribution block hashes through the
existing AST compiler. Prompt, process and supporting-reading bindings still
resolve. The historical R13 editorial draft changes only its current-source
pointer to R23. Status stays `review`, rights stay `review-pending`, canonical URL
stays null, and source commit/blob pins stay null under `working-tree-review`.
These values do not claim frozen accepted publication provenance.

## Current-main integration

The local integration baseline has two parents:

- PR79 head `36b9dec722cdcc080e02110d1cda1147fe0643cc`.
- Current accepted main `44aef6e4d0f0cbc063a5269fa01a039c4979422e`.

It preserves main's PR119 first-name interaction copy, published retained
inventory, Pillow 13 update and source-suite scheduling, alongside PR79's article
reader and existing CPU work. This incorporates main into the feature branch;
it does not merge PR79 into main or publish its article.

The conflict reconciliation preserves the exact ledger union: 13,386 unique
rows from both parents. All 140 new-main rows are retained in
`tools/quality/secrets-reviewed-checksums.json`. Nine same-disposition reason
variants remain in `review/issue-5/2026-10-20-controller-ledger-merge.json.gz`.
No row is dropped and no wildcard allowance is introduced. Prepared verification
recorded `exactUnionEqual: true`.

| Reconciled ledger | Bytes | SHA256 |
| --- | ---: | --- |
| `tools/quality/secrets-baseline.json` | 1,996,285 | `8bff933ce846d5b1a0fa9a357f629c07d49af8626270ea40cfd658b760e293b0` |
| `tools/quality/secrets-reviewed.json` | 1,999,068 | `f376f5be9aaf5bb743d19fa42cf25968db42fc9b8c009007cda953aef9c46e2f` |
| `tools/quality/secrets-reviewed-checksums.json` | 396,362 | `2404f32f63b76f305356c3d1dd318541c772f436e28193c4d62ecd174ceef55c` |
| `tools/quality/secrets-publication.json` | 1,940,840 | `bf7fb6427be62e34acc077391f603c15469a5e0a539a7d8907f52b296361aac5` |

`git diff --check` against current main passes. Against the old PR head it reports
a trailing blank line in two imported retained `styles.css` copies. Those copies
are byte-identical to main, each 39,711 bytes with SHA256
`ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c`.
Their immutable bytes are preserved rather than reformatted. This is a retained
artifact disposition, not a blanket whitespace exception for authored code.

## Findings and independent review

| ID | Severity | Evidence/path | Finding and implication | Affected AC | Disposition |
| --- | --- | --- | --- | --- | --- |
| R23-01 | Delivery blocker in the interrupted state | PR79 comment 6323276486; exact input table above | R23 snapshot existed but its exact PDF and canonical selection were missing. | #5 AC02/AC07/AC12; #2 AC01/AC03 | Original PDF recovered and imported; canonical source and edition synchronized. Final combined admission remains pending. |
| R23-02 | Compatibility blocker before adaptation | Supplied HTML figures/table and duplicate deck link | Directly copying the supplied snapshot violates the existing bounded parser/profile contract. | #5 AC02/AC03/AC07 | Presentation-only normalization above; parser/profile checks pass without widening the contract. |
| R23-03 | Known supplied-artifact difference | PDF 43 unique HTTPS targets; Markdown 42 | The exact PDF includes an organizer link absent from supplied Markdown. | #2 AC02/AC03 | Preserve both original artifacts and disclose the difference; no false byte/content-equivalence claim. |
| R23-05 | Low: review wording | Independent PDF name-tree recount | An initial draft described 36 named destinations as the total; the PDF has 58 total, including 36 numbered references. | #5 AC11 | Corrected the report wording; original artifact unchanged. |
| R23-06 | Active-edition test binding | First clean policy on `2b35dd8`; `tests/article-media.test.cjs` | READER has 263/264 tests pass; its real-article case still expects the R21 source SHA and edition, while the declared active source is R23. | #5 AC02/AC03/AC11 | Exactly three identity literals updated; all assertions/negatives unchanged; focused case 1/1 PASS and independent review approved. Full corrected-source policy outcome remains in the subsequent PR receipt. |
| R23-04 | Open performance evidence | Historical R20 report and existing CPU review | R20 reader mobile median TBT was 204 ms against 200 ms; later CPU changes lack a new completed full matrix. | #5 AC08/AC11/AC12 | Historical failure remains failed. This editorial intake supplies no new performance acceptance. |

`/root/pr79_recovery_review` independently inspected all 14 PDF page renders.
It reported no blocking crop, overlap, glyph, table, figure or footer problems;
page 7 contains the three-row outcomes table and page 11 the five-row, three-column
pilot table. This accepts the bounded supplied-artifact inspection, not factual,
rights, physical-device or publication acceptance.

The same non-implementing reviewer inspected the complete snapshot/canonical
diff, independently compared 227 non-empty normalized text lines with an
HTMLParser-based check, and reported a match after the explicit conversions.
It verified loaded publisher canonical/semantic identities, inspected the 26/26
focused test receipt and found no blocking synchronization issue. Source files
under that review retained their hashes through the main integration.
The integration review independently confirmed the exact 13,386-row ledger
union, all 25 retained files and rights rows, the main hotfix/Pillow inputs and
unchanged canonical PR79 runtime. It found no blocking source issue. Some
regenerated offline HTML refreshes an older embedded runtime copy; this is not
a new authored runtime change. The separate final pass inspected documentation,
catalog/RI owners, all ten reader screenshots and the terminal browser receipt.
It verified the packet against original receipts and source/served files, and
independently exercised horizontal access to both mobile tables. No blocking
source finding remains; the final identity/readback check follows regeneration.

## Decisions and style scope

The author's existing R23 update and continuation requests authorize this
reversible preparation. Publication, rights and deployment acceptance remain with
their existing owners. PR79 remains Draft; no approval is inferred from its
technical checks. No new LinkedIn/Medium copy or alternative PDF is requested.

CS01/CS02/CS04: existing canonical manuscript, metadata, profile and edition
owners are reused; renderer and historical sources do not become editable copies.
CS05: touched JSON uses the pinned formatter; supplied originals remain exact.
CS03/CS06: this content increment adds no CSS or runtime/lifecycle behavior.
CS07: existing budgets are unchanged; historical performance is not relabeled.
CS08/CS09: focused publisher, Basic, RI/CI and local browser checks are recorded
below; the clean final-source owning policy is reported in the post-commit PR receipt. CS10: #5 remains the execution
owner and #2 retains editorial/publication decisions.

## Sol tasks

| Task | Paths and expected change | Finding / AC | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Recover and retain exact supplied R23 PDF and Markdown snapshot | R23-01; #5 AC02/AC07 | Expected size/SHA256; independent all-page PDF review | Prepared and verified |
| T02 | Canonical R23, metadata, profile, new semantic edition and historical draft pointer | R23-02; #5 AC02/AC03/AC07 | Publisher validation; 26 existing publisher/profile tests; independent normalized prose comparison | Prepared and verified |
| T03 | Incorporate accepted main and reconcile retained ledger inventory | #5 AC11/AC12 | Exact parent/ledger union; retained-byte comparison; independent integration review | PASS within integration source scope |
| T04 | Register paths, regenerate dependent outputs/RI and run applicable current-source checks | #5 AC11/AC12 | Basic, RI/CI and bounded reader checks; clean owning policy after source freeze | Prepared checks PASS; final policy outcome in post-commit PR receipt |
| T05 | Complete normal PR preview and record exact-source delivery | #5 AC08/AC12 | Existing controller and exact final source/artifact identity | Post-commit PR receipt; not asserted by local diagnostics |

## Acceptance evidence

| AC | Check/test | Result | Exact source/run/artifact | Remaining gate |
| --- | --- | --- | --- | --- |
| #5 AC02/AC07; #2 AC01/AC03 | Original PDF and snapshot byte identity | PASS within imported-artifact scope | Exact SHA256 and sizes above | Whole editorial/source/rights/edition decisions |
| #5 AC02/AC03/AC07 | `node tools/publishing/cli.cjs validate pmday-ai-both-sides` | PASS; selected R23, 20 sections excluding title, 4 figures | Canonical `c72b6466…`, semantic `afe70ea6…`; dirty prepared source | Final integrated source-bound checks |
| #5 AC02/AC03/AC07/AC11 | `node --test tests/publishing.test.cjs tests/publishing-profile.test.cjs` | 26/26 PASS; zero failed/skipped/cancelled; 15.87 s | Prepared R23; retained focused test receipt | Combined checks, independent whole-feature acceptance |
| #2 AC03; #5 AC02/AC11 | Separate reviewer all 14 PDF pages | PASS within visual import scope | `/root/pr79_recovery_review`; exact PDF `dc617861…` | Rights, factual/source and publication acceptance |
| #2 AC01–AC03; #5 AC02/AC07/AC11 | Separate reviewer full diff and 227 normalized lines | PASS within synchronization scope | `/root/pr79_recovery_review`; exact canonical/semantic identities above | Final integrated review |
| #5 AC11/AC12 | Independent current-main integration ledger/retention review | PASS within source/retention scope | `/root/pr79_recovery_review`; integration `64cc9153…`, parent refs and ledger identities above | Final candidate checks and hosted evidence |
| #5 AC11/AC12 | Canonical site/preview/bundle generation and Basic | PASS; Basic 16 theme/archive and 10 Color/flight tests, five routes, artifact/syntax/size checks | Prepared combined R23; local build and Basic receipts | Clean final-source policy and hosted preview |
| #5 AC11/AC12 | RI freshness, RI/CI map and regression suites | PASS; 1,660 files, 182 directories; 15 checks/13 layers; 28 RI and 20 RI/CI tests | Prepared combined R23; source digest `e477a8c93400f352d7e6638a78b4ea2e32268aef37fe47422dd87baad5450e12` | Refresh after the final report update |
| #5 AC11/AC12 | Main integration SEO/first-name contracts | 2/2 PASS | `tests/executive.test.cjs`; frozen SEO and exactly three approved prose fragments | Other final-source policy checks |
| #5 AC08/AC11/AC12 | Existing local preview smoke and article journey | PASS; four site rows and five reader modes/widths; publication-tag journey | Prepared R23 artifact `483bfa80f7bf05444472709104f0194c39961e732f8fc90899b68a737b55e25d`; Chromium 153.0.8010.0; evidence packet below | Managed final-source hosted checks; performance/device acceptance |
| #5 AC01–AC23 | Clean final-source owning policy and hosted PR preview | Pending at this pre-commit checkpoint | Consult the subsequent PR79 execution receipt for exact source and run outcomes | All original human, staging and publication gates remain separate |

### Preserved prepared-source evidence

[Compressed evidence packet](2026-10-22-r23-prepared-evidence.json.gz) retains the
actual browser receipt and artifact manifest, source-file identities, Basic,
pinned-toolchain, focused publisher/SEO/RI test logs and integration proofs, plus
the separate two-table interaction probe. The earlier 45/46 integration-focused
run, missing-venv SEO failure logs and the first clean 11/12 policy attempt are
also preserved without relabeling, alongside the targeted R23 test correction.
It is 87,627 bytes, SHA256
`a6611e6e1ce2a86965f1b9403fb08b74b3ffb46d187b6fe6f87938cafa5d9a97`.
Its explicit scope is the prepared R23 source, not a clean final-head run.

The existing smoke runner completed with `pass: true`, `fullGate: false` and
`deploymentAuthorized: false`. It exercised the five site routes at 1440/390 px
with normal/no-canvas rendering, the R23 reader at both widths, and 390 px Off,
no-canvas and no-JS fallbacks, plus the publication-tag journey. The ten captured
reader screenshots cover opening, quotation, process, table and ending at both
widths. The independent reviewer then used a native horizontal wheel at 390 px
on both table regions: the outcomes table moved from 0 to 48 px and the pilot
table from 0 to 80 px, exposing each rightmost column without page overflow.
Both regions retain their accessible labels and keyboard focus. This bounded
probe and its original receipt digest are also in the evidence packet.

Managed Playwright Chromium installation failed on empty/invalid downloads in
this environment. Local diagnostics used the explicit pinned review browser
`@sparticuz/chromium@153.0.0` (Chromium 153.0.8010.0). This is not relabeled as the
managed hosted browser gate or a full performance matrix.

The initial sandboxed compiler attempt failed with subprocess `EPERM`; its
unchanged local invocation passed with the required subprocess permission.
An initial formatter invocation used a nonexistent `.cjs` configuration; the
corrected command used the existing pinned `tools/quality/prettier.config.json`.
These preparation errors are not source failures and are not counted as passes.
The pinned Python toolchain verifies 89 packages and 143 dependency edges with
only the already reviewed Semgrep/MCP constraint exception. A stale bootstrap
pip metadata directory was moved outside the venv; no lock or verifier changed.
The two earlier integration SEO checks failed because that separate worktree
lacked the pinned venv; their combined-source rerun passes 2/2. The earlier
integration-focused run remains 45/46, not a passing suite; the final owning
policy supplies the full current-source result.

Historical R20 TBT 204/200 ms remains FAIL. Its LCP 2253.114/2500 ms PASS and older
staging/source results do not admit this changed R23 candidate. The post-CPU full
performance matrix has not run in this increment. Last recorded permanent article
staging remains R18/source `283b32f65f0589e85c0aa914d0990704dcf8ac38`;
this document does not claim a current R23 stable deployment.

### First clean policy attempt and bounded test correction

On clean commit `2b35dd862113a47358028fedd15396c97c51b98a`, tree
`bb751c06b1c5be6482b88c68c8a27a5f7eca7be9`, the complete owning policy returned
11/12 named checks PASS with valid source evidence. READER was the sole failed
check: 263/264 internal tests passed, with zero skipped/cancelled/todo. The existing
real-article media case still asserted the R21 source hash and content-edition ID.
The observed source hash was the already reviewed R23 `c72b6466…` value.

This failed run is preserved in the evidence packet, original receipt SHA256
`245aa39b6303696f56474f5994ab702d9dcde1ec18ebacd76dd59c7688a1f812`.
The correction is confined to exactly three literals: the case label and explicit
source/edition identities. The selected existing case passes 1/1 with zero failures,
skips or cancellations (4.557 s). `/root/pr79_recovery_review` independently verified
the entire diff and receipt: every other byte is unchanged, including media counts,
full download closure, rights state, 800,000-byte reading ceiling, native-link
assertions and every corruption/budget negative. It does not change article prose, assets, runtime or performance limits.
Corrected test SHA256 is
`afd9cb69439949ba887d1d81de9e8ca714126ebdbc3b980d1b86e48839fced87`;
targeted TAP SHA256 is
`257dc45f1e44b8e5e44a30b57394f3919f5381b84448be618c0d58e5e666f8e9`.
Both are preserved in the evidence packet. The final corrected source-policy
result remains for the subsequent PR receipt.

## Issue synopsis

R23's exact original PDF has been recovered; the supplied Markdown remains exact,
and canonical article/profile/edition now select R23 with the documented bounded
normalization. Focused publisher 26/26, independent all 14-page PDF inspection and
227-line normalized source comparison pass. Current-main integration preserves
accepted hotfixes and exact ledger/retained-byte history, independently reviewed.
Basic, 48 RI/CI regression tests, two affected SEO checks and the full local smoke
runner pass within their prepared-source scope. The final clean-source policy
and hosted preview are pending at this pre-commit checkpoint; consult the
subsequent PR79 execution receipt for exact identities and actual outcomes.
Keep PR79 Draft and issues 5/2 open; no new whole AC ticks or publication decision
are supplied by this record.
