# Independent White-box QA — first judgment

Reviewer: `/root/native_whitebox_final`, distinct nonauthor execution, 2026-10-31. Owner issue169 / PR170. Read/check only; no source/test implementation, external writes, delegation or peer verdicts. Output is this assigned artifact. Explicit none-fork launch is supplied by the orchestrator; provider model/context internals and memory injection are unknown. No claim of a security sandbox. MEMORY and peer/parent reports were excluded to honor the explicit review isolation boundary.

**Verdict: BLOCKED for acceptance/readiness.** The optional-download change has passed my bounded actual-output and negative/boundary checks, with no production defect found in that inspected path. The retained four-module campaign still fails four cases, and my separately executed current tag suite fails one additional integration case. Their fixture failures must be corrected and re-reviewed without weakening production guards. Hosted/browser, full maintained source selection, PDF visual and release observations are not established by this review.

## Source identity and inspected scope

Prepared dirty subset, not a clean checkout: base `8ed52aa1fe39be8483a2b5b4079df4142fbc5b5d`, source parent `73ed1dcdab9e0e0471ab150c70ba728e844a7e55`. Packet v4 declares digest `86c21c63c403a67832da1e39512e70d76c825043b5f31076da249f61cb0467d2`. All packet-listed non-history/non-memory file bytes matched at my inspection before the orchestrator's announced subsequent fixture edits. Issue snapshot SHA256 `1c4323f4b3b3f90a3fb9a63a47d2dd568a6d671b405b7f554233357c8488a479`; explicit author scope `11f8a52f865d2feb06a7081fc0f8490dae9a58a0a41cde595f2d0f6decf0f104`.

Read common/role prompts, AGENTS/CONTRIBUTING, site contract, code style, acceptance allocation, materials contract, relevant test/profile owners and actual sources. Prompt SHA256: common `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`.

Inspected source pins (SHA256):

| Source | Hash |
| --- | --- |
| tools/site/articles.cjs | 78eba91a08bd9a83d4c4c644216968ce99a80382631302792a7971f24ee57954 |
| tools/site/snapshot.cjs | eae15e6734b64ebc015d56e34ebc0a3118ae21f3e1fb340df89075cb1df206f4 |
| tools/site/article-materials.cjs | e599db3bb3a82a8d38741a301ee7513f4f0d4d433cb102df3abbe1a99a9f9cdd |
| tools/quality/artifact.cjs | c8584b089b6ad78686920461f2159347473550ef8140e7c7d465de63edd16d13 |
| tests/article-budgets.test.cjs, v4 | 380dd2b4fc62b0933e357359e46b3b5a8a1777ac5381dfaf470458982549f3a5 |
| tests/article-media.test.cjs, v4 | 3c3d575e911062e44afe12f1294bcb4ec5d5a6fa7f4d7b09410a4ad6afa371b3 |
| tests/site-articles.test.cjs | e658e65b7617c1342d3b86c38b82445ed145a8bed7b0407e2ad441151803a683 |
| tests/article-tags.test.cjs | e6b9b9c58dc7a2153f680c95c7cb4619628e2543553c72d81e944126ea72ff4d |
| publication.json | b84614b8a7af29982c1ae45114675001617324fe16a12b386e86307ebe53f70f |
| native manuscript | db47dcbed76c5052355d24cd78e3d9ea2a9727c23be030796463f975e0b8667b |
| docs/site-revision.json | bd850be38d018797431e9d33e093b85f734cba58e80203ae92964d5cca42b2df |

The original accepted PDF is 1,981,992 bytes and has SHA256 `70052f9b0129c9e7bd3e70720a540869795d09eacf1ca780c55df64f4576b49c`. Profile/provenance explicitly distinguish compressed web hero from retained original PNG/PDF. Native publication has six figure declarations. This is structural/identity inspection, not a new editorial or image-quality approval.

## Risk → structural fault → case → oracle → route

| Risk / AC | Structural fault and scenario | Independent oracle / check | Outcome / route |
| --- | --- | --- | --- |
| PDF unexpectedly auto-loads; AC08/09 | Exempt material referenced by iframe, embed or preload | Accepted contract permits only one ordinary user-activated anchor. Actual alias/snapshot admitted; in-memory duplicate iframe and replaced embed/preload rejected by snapshot.downloads | Own bounded cases pass. Existing site-articles/materials; content-source, pr-targeted/staging/production |
| Exemption loses immutable identity; AC05/08/09 | PDF omitted from assets, changed bytes, oversized PDF | Existing full closure and unchanged 2,000,000-byte cap. Real snapshot verified; omitted closure/corruption rejected; exact cap accepted, cap+1 rejected | Own bounded cases pass. snapshot/artifact + article-budgets suite |
| Multiple materials silently escape budget; AC08/09 | Two approved PDF items | Contract gives a single local PDF optional-download status. articles.select only adds downloads when selected count=1; existing integration appends second PDF, expects downloads undefined and reading transfer rejection | Source inspected; retained site-articles case passes. Not newly executed as an isolated case |
| Presentation/material collision; AC08/09 | Download presentation plus PDF materials | Presentation mode selects only the presentation exemption; other material resources remain in assets and count. Same resource repeated in HTML fails single-reference validator. Multiple duplicate exempt declarations fail length/occurrence guards | Source analysis, existing guards; combined actual presentation+material scenario not executed here |
| Required reading exceeds cap; AC08/09 | All six images, fallback, runtime and index plus HTML | Accepted unchanged 800,000-byte reading transfer; lazy figures still count. Current artifact.checkSize, complete snapshot closure | 698,121 reading gzip bytes; optional PDF 1,927,673 separately; five room transfers all <800,000 |
| Private/unapproved/stale material leakage; AC05/09 | private/null approval, stale edition/review/file; invalid MIME/path | Explicit allowlist/review-binding contract; inspect load/target/pinned and existing article-materials negatives | Retained 9/9 material cases pass. No additional source mutation performed |
| Self/unrelated/draft recommendation; AC10 | Current publication selected as its own related work, invalid tags/index, late request | Existing shared vocabulary/Jaccard/no-self/finite contract; current index validated, related output checked, existing tag suite executed | Current static invariant check passes; 8/9 tag cases pass, integration setup fails below |
| Accepted-source admission and native shape; AC04/07/08 | Uncommitted source, wrong edition or wrong figure count | Native publisher validate plus exact manuscript/provenance and metadata | Own validate exits0, committed source parent/blob verified, 8 sections/6 figures |
| Evidence completeness; AC05/11 | Basic mistaken for complete content-source acceptance | Read profile registry and raw accounting, preserve failed runs | Basic is 16 theme/archive +10 flight, not all source suites; release blocked |

All retained/proposed test routes above use the existing `tools/quality/test-profiles.json` content-source selection through `node tools/quality/source-tests.cjs` (pr-targeted/staging/production). Browser reader/tag and actual no-JS/mobile checks remain under existing hosted profiles/workflows and manual independent inspection, not replaced by these unit observations. No new suite is proposed merely to label this reviewer.

## Executed checks and accounting

1. Own `node tools/publishing/cli.cjs validate sdlc-out-of-balance`, exit0: edition `sdlc-out-of-balance-en-r3-20261031`, source committed at parent73ed1dc, blob `87001195d05de733b4332d0222231d935bde1000`, native source SHA above, eight sections, six figures.
2. Own read-only inline Node assertion campaign calling snapshot.verify, snapshot.downloads and artifact.checkSize against current docs plus in-memory faults: **12/12 pass, 0 fail**, exit0. Cases: full snapshot closure; alias anchor; immutable anchor; duplicate iframe rejected; embed replacement rejected; preload replacement rejected; missing closure rejected; corrupted PDF rejected; exact 2MB admitted; 2MB+1 rejected; reading cap; separately reported optional PDF. No repository mutation; injected bytes/HTML existed only in memory. This is a bounded structural negative/boundary check, not measured branch coverage or actual browser network evidence.
3. Own current-index validation/recommendation invariants, exit0. Reader publication30; tags ai-delivery/software-economics/verification/operating-models. Results publication01,03,02 are distinct published records with positive overlap, no self and structurally valid HTTPS destinations. External served reachability not observed.
4. Own `node --test tests/article-tags.test.cjs`, exit1, 9 tests, **8 pass/1 fail**, 0 cancelled/skipped/todo, duration807.587558ms. Full failure retained below. No unchanged retry.

Raw own tag failure:

```text
FAIL tag-only content generation changes the index while old HTML, readers and every runtime byte stay identical
location tests/article-tags.test.cjs:251:1
Error: Git provenance check failed: fatal: not a git repository (or any of the parent directories): .git
  at git (tools/publishing/provenance.cjs:25:11)
  at committedSource (tools/publishing/provenance.cjs:59:15)
  at verifySource (tools/publishing/provenance.cjs:106:21)
  at loadEdition (tools/publishing/article.cjs:324:18)
  at loadArticle (tools/publishing/article.cjs:450:16)
  at tools/site/articles.cjs:51:19
  at Array.map
  at Object.select (tools/site/articles.cjs:48:6)
  at Object.build (tools/site/build.cjs:824:37)
  at TestContext.<anonymous> (tests/article-tags.test.cjs:256:26)
9 tests, 8 pass, 1 fail, 0 cancelled, 0 skipped, 0 todo
```

Retained evidence inspected separately (not rerun by me):

- `native-targeted-tests.log`:39 total,33 pass/6 fail,0 cancelled/skipped/todo,14170.470026ms; SHA256 `6635e89cf840bb767916565116a0b5d72ee877101cb8d1a3eade7695c7d2aa76`.
- `native-targeted-tests-corrected.log`:39 total,35 pass/4 fail,0 cancelled/skipped/todo,14781.806272ms; SHA256 `64a45fca02409acfb3633945a5789fbba845cead82eded7cc18b7e4af174a51d`. Failing cases1/4 article-budgets and18/21 article-media; site-articles18/18 and materials9/9 pass. The log itself does not preserve its shell invocation/exit status; failed TAP results establish failure, not success.
- `basic-final-prepared.log`:pass=true,16 theme/archive +10 flight; finite geometry/snapshot/size checks, max HTML99582 bytes; deploymentAuthorized=false. SHA256 `f5fec197536209b869145614e85dd7ca50540191999af99e2822d37b031749a4`.
- Formatting log is formatter output, not proof of full lint/style/source acceptance.

## Findings and treatment

**WB01 — High, acceptance-blocking test integration failure.** `tests/article-budgets.test.cjs:12–27` (v4): copies actual docs, adds synthetic bounded-reader and overwrites revision with only that descriptor, while the copied real article alias remains in manifest. `artifact.validateArticleSizes:151–156` correctly rejects missing/extra article evidence; cases1/4 fail before their intended positive/wrong-source paths. AC05 and native size acceptance AC08/09 remain unproved. Treatment: make alias/revision/manifest fixture inventory coherent and rerun affected original cases; retain validator and original failed logs.

**WB02 — High, acceptance-blocking test oracle mismatch.** `tests/article-media.test.cjs:38–43,158,348` (v4): isolated legacy catalog emits only explicitly selected draft, but rights.compile sourceRoot is the actual repo whose catalog selects accepted sdlc article too. Retained cases18/21 fail `hosted source selection differs`, not a codec/equivalence failure. AC05 and native media/right closure acceptance remain blocked. Treatment: coherent source selection/provenance fixture and unchanged production rights controls, followed by affected suite verification. No weakening to ignore the extra real accepted article.

**WB03 — High, newly observed acceptance-blocking tag fixture failure.** `tests/article-tags.test.cjs:18–30,251–256`: copies current catalog/site to a non-Git temp root; actual accepted source now selected by catalog requires committed Git provenance. Publisher rejects before the tag-only parity/forged-index test reaches its assertions. AC05/10 source integration coverage is missing. Treatment: preserve real committed provenance or deliberately isolate coherent catalog/rights source inputs. Re-review fixture correction and rerun this selector. Do not mark the parity/forged-index invariant tested from the current failed setup.

## Uncovered scope and next gates

No blanket branch/line coverage percentage was measured. Actual DOM/network no-automatic-PDF behavior; desktop/mobile/no-JS reading/image decode/captions/tag links; navigation/history/scroll with this accepted article; five-page rendered PDF parity/link QA; full selected publisher/profile/safety/content-source suite; current lint/style/RI/RI-CI/acceptance policy gates; hosted staging/identical-tree merge/frozen production/rights/archive/live article and PDF observations are still absent from this role's execution. PDF byte identity and six source declarations do not establish visual readability. Browser unavailability is not not-applicable.

First resolve the three fixture integration failures with unchanged production oracles and get affected nonauthor correction review. Then run maintained exact-source required selection and actual hosted/manual gates. Final LinkedIn/Medium copies require verified released URLs; author platform editor checks/posting remain later manual work as authorized.

## Chronology / pending correction review

This first judgment is preserved before reconciliation. After source inspection and my own test run, the orchestrator announced targeted budget/media fixture edits and a forthcoming v5 packet/coherent run; those new sources are **not accepted by this first judgment**. At writing, I inspected their diff only to identify changing source boundaries: budget fixture removes copied alias directory; media temp root gains shared no-checkout clone and restores actual catalog. Their current hashes differ from v4. A subsequent section must identify final pins, actual run accounting and any disposition; this first result is not overwritten.

# Targeted correction recheck — v5

This is continuation of my own first judgment, not a newly isolated first review. Input was the orchestrator's factual correction request, v5 source packet and raw isolated campaign. I did not read peer verdicts. First judgment above remains intact.

**Updated verdict: WB01, WB02 and WB03 are resolved for the inspected fixture correction. No remaining blocker found in this bounded White-box scope. Overall readiness/publication remains unestablished until the separate full required source/governance and hosted/manual/release gates complete.**

Packet v5 declares digest `3e7702bef5f87666871d27322cd279439e1b0cddd4cfaa920191dc8d00f5f2e1`, 74 paths, same base/source parent and unchanged common/role/authority pins. I verified all listed non-history/non-memory bytes against current files: no mismatches. Relevant v5 pins:

| Corrected owner | SHA256 |
| --- | --- |
| tests/article-budgets.test.cjs | bc83a534367189eccfbc6e532e1b958aff92311f7614b711f92663c826fc327c |
| tests/article-media.test.cjs | b0faec6a06f9da681f17017d0cb7bc59e52b989e91cf5def5266a678f3408622 |
| tests/article-tags.test.cjs | d1c6dadf51b9c5f3637e7c98f30bdfd165ab4b7b905a440e13abff91edb2590a |
| tests/fixtures/catalog.cjs | dd59ed1c44c4d92838a6ae718af249820ae9c4c034163df8f61bbafc457037c0 |

Production `articles.cjs`, `snapshot.cjs`, `article-materials.cjs`, `artifact.cjs` and all article/media/metadata/output bytes are unchanged from the first inspected pins. `tests/site-articles.test.cjs` is unchanged. The v5 non-history source delta is those four fixture/test files plus deterministic agent-context metadata. I inspected actual deltas and the rights source reconstruction path (`tools/release/rights.cjs` hostedInventory/compile), rather than relying on the correction description.

WB01: budget fixture now removes copied real `articles/` aliases before constructing its sole synthetic alias/revision. Manifest and descriptor inventory agree; all original positive/negative size assertions remain. No budget or evidence validator was loosened.

WB02/WB03: shared `isolatePublicationCatalog` uses the already-existing immutable historical external-catalog fixture and copies its needed current rights provenance/notices and edition producer dependencies into the prepared fixture. Media/tag rights compilation now uses that same fixture root as its source oracle. The emitted selected drafts and source-side selection therefore agree without trying to validate a real committed accepted article in a non-Git synthetic fixture. No Git clone is introduced; no production provenance or rights check is relaxed. The existing forged tag-index assertion still compares altered emitted bytes against the unaltered matching source oracle and passes by rejecting them. The fixture remains synthetic evidence, not an acceptance claim for the real article's release rights.

## Actual corrected execution

I ran one affected campaign, justified by the changed fixtures and previous explicit failures:

```text
node --test tests/article-budgets.test.cjs tests/article-media.test.cjs tests/article-tags.test.cjs
exit 0
21 tests / 21 pass / 0 fail / 0 cancelled / 0 skipped / 0 todo
10720.214597ms
```

Accounting: budgets4/4; media8/8; tags9/9. This includes both formerly failing budget cases, both media rights/source reconstruction cases and my formerly failing tag-only parity/forged-index case. Original wrong-source, missing/duplicate size evidence, corrupt/oversized media, JPEG pixel/profile negatives, unsafe tags/index, aborted requests and draft exclusion assertions are still present and pass. Output was returned directly by the execution tool (session96993, final exit0); no separate raw file was authored by this reviewer.

Also inspected retained `native-targeted-tests-isolated.log`: **48 tests / 48 pass / 0 fail / 0 cancelled / 0 skipped / 0 todo**, duration13969.78581ms, SHA256 `27c957d3a8858625cd49c0da766223d2351c4f55cf0b781e4c8ea6264603e3eb`. Its case accounting is budgets4 + materials9 + media8 + tags9 + site-articles18. This is a bounded five-suite campaign, not the entire maintained content-source inventory. Previous failed runs remain retained above.

## PDF, collision and tags disposition

Reuse is source-bound: unchanged actual docs, snapshot/artifact/material validators and article-selection bytes preserve my original 12/12 guard/boundary observations and 698121-byte reading /1927673-byte optional PDF measurements. Current complete PDF resource is still in the immutable closure with its exact accepted hash and under2MB. No new browser network observation is claimed.

Selection branch analysis remains: zero PDF materials yields no optional material download; exactly one approved local PDF receives one optional download; two material PDFs retain full reading cost (unchanged passing site-articles case in the48-case log). Presentation `download` mode chooses its single presentation file for exemption; added PDF materials remain ordinary assets, so they retain full reading cost. If presentation and material resolve to the same file, their two rendered references cause snapshot's single-occurrence guard to reject rather than silently exempt automatic/duplicate use. Actual runtime combined presentation/material collision was not executed here; this is explicitly source analysis and unchanged guard evidence.

Tags: corrected9/9 suite now reaches tag-only generation parity and forged-index rejection. Actual current article's index/recommendation invariant check from my first review remains valid because the actual production index/catalog/tags bytes are unchanged. Real external destinations, actual mobile/no-JS related-reading UI and stale-navigation/network behavior for this article still require hosted/operator observations.

No additional implementation change or broadened test campaign is requested by this reviewer for these three findings. Required next gates remain the exact-source maintained source/governance/rights selection, independently observed hosted desktop/mobile/no-JS/media/PDF reader behavior, and actual staging/merge/production/archive/live URL verification. Author-handled external platform posting remains outside website release acceptance as authorized.
