# Independent Code / changed-artifact review — issue169 / PR170

## First independent result (v4)

Verdict: **blocked by four failing maintained targeted cases; no additional production implementation defect found in the bounded inspected scope.** This is not website release approval.

Role execution: `/root/native_code_final`, distinct nonauthor reviewer. The parent supplied a prepared dirty integration subset; HEAD/source parent is `73ed1dcdab9e0e0471ab150c70ba728e844a7e55`, base `8ed52aa1fe39be8483a2b5b4079df4142fbc5b5d`. It is not a clean candidate commit. Parent launch/model/provider context internals are not observable from inside this execution. No peer review content or parent scratch notes/MEMORY were read; candidate PROVENANCE/allocation text was treated as a review subject. I authored no implementation/tests, delegated nothing and made no external writes.

Input packet `native-packet-v4.json`: declared digest `86c21c63c403a67832da1e39512e70d76c825043b5f31076da249f61cb0467d2`, independently reproduced as SHA256 of Python `json.dumps(packet_without_packetSha256, sort_keys=True)`. Whole serialized file digest is separately `6375aaa9ac90b20db55cb4ad81771e808e03a9b03dab224e4aeb66d09d0a4a46`. Common prompt SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; Code prompt `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`. Both and issue/author-scope authority hashes matched packet pins. A bounded hash comparison found no mismatches in packet file entries (excluding uninspected MEMORY); later notification of substantive fixture correction invalidates those affected v4 test pins and requires delta review below.

### Blocking finding C1 — maintained article-budget fixture is not isolated from new accepted articles

Severity: acceptance blocker, AC05/AC08/AC11, CS08. `tests/article-budgets.test.cjs:12–30` copies the complete current `docs/`, adds `articles/bounded-reader.html` and replaces the descriptor with only that synthetic article, but leaves the newly published SDLC article alias in the copied inventory. `tools/quality/artifact.cjs:150–156` correctly rejects an inventory with an extra article alias. Actual `native-targeted-tests-corrected.log` cases 1 and 4 fail: the first unexpectedly gets “Missing, extra or duplicate article size evidence”; the wrong-source negative is masked by the same earlier inventory failure. Treatment: make the synthetic inventory coherent, preserving production validator strictness, and rerun the affected cases. Changing the expected failure wording would hide the broken oracle.

### Blocking finding C2 — media fixture and rights source choose different article inventories

Severity: acceptance blocker, AC05/AC08/AC11, CS08. `tests/article-media.test.cjs:40–45` replaces its temporary catalog with a legacy catalog while the rights checks at approximately lines158/348 use `sourceRoot: repo`. `tools/release/rights.cjs:211–228` reconstructs the current repository selection including accepted `sdlc-out-of-balance:en`; that cannot match the legacy fixture descriptors. Actual corrected log cases18/21 fail “hosted source selection differs”, with the additional SDLC article explicitly shown. Treatment: preserve one coherent source/catalog/provenance inventory in fixture build and rights reconstruction, then rerun. Do not weaken the production reconstruction assertion or remove the acceptance fixture's rights verification.

Actual raw accounting for the four-module corrected campaign: **39 cases, 35 passed, 4 failed, 0 skipped**. The initial six-failure campaign and current four-failure campaign are not passes. A separate reviewer-launched same four-module reproduction was started; source changed during that run after parent notice, so it is not used as a formal exact-current-source receipt.

## Inspected sources and positive observations

Read common/Code reviewer contracts, AGENTS, CONTRIBUTING protocol, CODE-STYLE, applicable site article/media/download/related-reading contract, ARTICLE-WORKFLOW, ARTICLE-MATERIALS, acceptance/check-profile and editorial/source provenance routes. Inspected actual base-to-working diff for `tools/site/articles.cjs`, all three changed test files, site source-contract paragraph, catalog, tag assignments, central rights; actual publication/profile/edition/materials/review/provenance/launch records and native manuscript; generated article descriptor/HTML/media closure and PDF structure. This is bounded component review, not line-by-line review of every regenerated principal/offline HTML byte or unrelated repository history.

The production change derives optional downloads only from already admitted reviewed public local PDF resources (or the existing explicit presentation download), emits one descriptor only, keeps resources in immutable closure, and relies on the existing snapshot validator. That validator independently requires exactly one ordinary native anchor, matching PDF signature/hash and <=2MB bytes; embedding or repeated reference fails. Multiple material PDFs retain their ordinary transfer cost. No runtime import reversal, second content registry, budget increase or new release engine was introduced. The negative integration tests exercise extra/embedded use and multiple-PDF full accounting; their selected-public-material case passed in the corrected raw log. Test count alone does not establish coverage.

Direct reviewer checks: `node tools/publishing/cli.cjs validate sdlc-out-of-balance` passed committed source admission, 8 sections/6 figures. Source is SHA256 `db47dcbed76c5052355d24cd78e3d9ea2a9727c23be030796463f975e0b8667b`; accepted R3 source is `ec4c21d3864c9e3890fa0cacb7fea9dcadae42828a554f977b7eafcb7ab95baa`. The direct manuscript diff consists of subtitle emphasis, caption relocation into declared assets and author-review footer normalization. The declared captions retain the original text, including conceptual-curve/conditional-risk limits. The JPEG web rendition is explicitly disclosed, original hero and unchanged five diagrams/PDF retained; no false accepted-original pixel-equivalence claim was found.

Direct `articles.select` chooses only `sdlc-out-of-balance:en`, the expected edition and one optional PDF. `snapshot.verify(docs, manifest(docs))` passed. Direct `artifact.checkSize(docs)` passed: alias33886 raw/10026 gzip bytes, full required reading transfer698121 gzip bytes, optional PDF1927673 gzip bytes, all resources still inventoried. `pdfinfo` independently found 5 A4 pages,1981992 bytes, no JavaScript; PDF bytes match pinned accepted SHA256 `70052f9b0129c9e7bd3e70720a540869795d09eacf1ca780c55df64f4576b49c`. This does not substitute for five-page visual/link review.

Read actual Basic raw result: pass with16/16 theme/archive focused cases and10/10 Color-flight cases; it does not execute the four changed article modules and cannot resolve C1/C2. Read actual RI logs: freshness success; RI/CI coupling17 checks/pass with `live_github_state_verified:false`. Formatting log records formatted touched files; it is not a comprehensive style/lint report. Own ad-hoc rights compile with an incomplete synthetic manifest failed for missing mandatory sourceCommit/sourceTree; this was a reviewer harness-input error and is not treated as product or rights acceptance evidence.

Rights/material bindings, shared tag vocabulary/selected article assignment and preserved source/reference boundaries were examined. No external platform post, live URL, source CI, authenticated staging, protected merge, production archive/rights or served production observation was performed. Those remain separate required gates. Browser/device and PDF visual behavior are not observed by this Code execution. The issue's later author authorization governs website publication; LinkedIn/Medium editor checks/posting remain manual and do not block website release. The complete matching final URL copy kit is still an outstanding delivery obligation, not a source-code defect in this bounded preparation.

## Correction status

The parent subsequently reported fixture-coherency corrections and a forthcoming v5 packet. Initial findings above are preserved before consuming those corrections. Final delta/source and actual rerun are pending inspection.

### First correction observation (before v5)

Parent reported coherency changes after my initial result. Direct diff confirms C1 now removes copied `articles/` before installing its sole synthetic descriptor, preserving strict production inventory checking. The actual `native-targeted-tests-coherent.log` is **39 cases:37passed,2failed,0skipped**: C1's two cases pass. Media fixture now initializes an actual shared no-checkout Git clone and retains the current catalog; source reconstruction mismatches disappear, but cases18/21 now fail the unchanged Writing size budget. Adding their preview draft to current accepted catalog exceeds Writing's available HTML capacity (current canonical Writing is99582raw bytes against100000). Thus C2 is not yet resolved as a passing coherent fixture; repair its isolated selection/source reconstruction without relaxing budget or rights checks. The two failing results remain blockers, not a pass. My separately launched reproduction completed with the original35pass/4fail symptoms; because source changed while it ran it is retained only as corroborating diagnostics, not final-source certification.

## Final bounded disposition

At this result, **blocked**: C1's failure mechanism is corrected with actual passing cases; C2's source-selection mechanism is corrected, but the same media cases now expose an additional unresolved preview-fixture Writing-budget failure (C3). Latest observed campaign is37/39, not green. No extra production implementation defect was found in inspected scope. A future correction requires its own affected diff/hash and actual successful rerun; it cannot be inferred from this result.

Final directly inspected byte identities (a later change invalidates affected coverage):

| Path | SHA256 |
| --- | --- |
| `tools/site/articles.cjs` | `78eba91a08bd9a83d4c4c644216968ce99a80382631302792a7971f24ee57954` |
| `tests/site-articles.test.cjs` | `e658e65b7617c1342d3b86c38b82445ed145a8bed7b0407e2ad441151803a683` |
| `tests/article-budgets.test.cjs` | `bc83a534367189eccfbc6e532e1b958aff92311f7614b711f92663c826fc327c` |
| `tests/article-media.test.cjs` | `b0faec6a06f9da681f17017d0cb7bc59e52b989e91cf5def5266a678f3408622` |
| `site/publications/sdlc-out-of-balance/publication.json` | `b84614b8a7af29982c1ae45114675001617324fe16a12b386e86307ebe53f70f` |
| `site/publications/sdlc-out-of-balance/profile.json` | `6072df9eaab7ecb7b2bae90e0b961680bb8818178520454e611614b05dc4e716` |
| `site/publications/sdlc-out-of-balance/materials.json` | `dffb2c0e9c0932ce92cb2ce58be624deb429496fe9c3b4e6148f543aaa99f6df` |
| `site/content/catalog.json` | `b496827e92bf5a8c012f5511484d49c862dc0ae681f761ad110e2dfd8d8f401d` |
| `site/content/article-tags.json` | `b936d993450c318cd93288b4f52e305567e218423e6821083223c97827f0d144` |
| `site/rights.json` | `a08bf509eb11096a5b95f89f5499cd7266930858522d327c5fbaffd7208f981f` |
| `docs/articles/the-sdlc-is-out-of-balance.html` | `3360bbbf4d98bdd49a6f1a9e82a994f1af45a9dafc959e8fd54b3eaa312e57c6` |

The v4 packet does not pin subsequent fixture corrections; this receipt records their actual bytes separately. No claim is made that the remaining repository test/CI/release/browser/device gates completed. The four distinct reviewer results and source-bound launch admission are orchestrator responsibilities; this is only the Code role result.

## Targeted correction review — v5

This is continuation/correction review, not a fresh first judgment; the parent supplied factual correction scope and raw-log locations, no peer conclusions. Packet v5 declared/canonical SHA256 `3e7702bef5f87666871d27322cd279439e1b0cddd4cfaa920191dc8d00f5f2e1` independently reproduced with the same canonicalization as v4. All74 packet file pins matched current bytes (MEMORY deliberately uninspected), with common/role and authority unchanged. Production adapter and publication/media/document owners remain v4-identical. Relevant final fixture SHA256: budget `bc83a534367189eccfbc6e532e1b958aff92311f7614b711f92663c826fc327c`; media `b0faec6a06f9da681f17017d0cb7bc59e52b989e91cf5def5266a678f3408622`; tags `d1c6dadf51b9c5f3637e7c98f30bdfd165ab4b7b905a440e13abff91edb2590a`; catalog helper `dd59ed1c44c4d92838a6ae718af249820ae9c4c034163df8f61bbafc457037c0`.

Directly inspected complete fixture deltas: budget owns its sole article alias; new `isolatePublicationCatalog(root, sourceRoot)` supplies the historical synthetic catalog plus current rights provenance/notices and required edition-producer source; media/tag builders and rights reconstruction now use the identical root. Accepted real SDLC source is no longer accidentally selected in synthetic preview fixtures. The tests retain rights inventory/approval assertions, tag corruption negative, preview nonproduction negative, original transfer bounds, image identity, source reconstruction and full selected-PDF tests. No assertion or production validator relaxation was found. C1/C2/C3 failure mechanisms are resolved.

Independently read and parsed actual `native-targeted-tests-isolated.log`: SHA256 `27c957d3a8858625cd49c0da766223d2351c4f55cf0b781e4c8ea6264603e3eb`,48 individual consecutive `ok` records numbered1–48; final48tests/48pass/0fail/0cancelled/0skipped/0todo. All five relevant modules' cases are represented, including prior failing cases and nine tag cases. This is actual raw execution evidence, not a summary-derived pass. RI freshness and bounded style v5 logs report passes; neither proves all governance/release obligations.

### C4 — new fixture dependencies missing from PR test selector

Severity: medium, readiness mapping correction required; AC05/CS08. `tests/article-media.test.cjs:40` and `tests/article-tags.test.cjs:30` newly depend on `tests/fixtures/catalog.cjs`, but their `tools/quality/test-profiles.json` rows (approximately2495/2520) do not list that helper in `inputs`. The selector uses explicit patterns without import closure (`source-tests.cjs:286–301`). Direct reviewer call `select(root, 'pr', {changedPaths:['tests/fixtures/catalog.cjs']})` selected content-baseline/content-fixture/content-rendering/content/local-catalog-relationships only, omitted media/tags, and had no conservative fallback. A future helper-only regression can therefore skip its new consumer tests in ordinary PR CI. Treatment: add that exact helper dependency to both maintained registry rows and verify the resulting planned selection includes both. The actual48/48 execution remains valid for unchanged test/implementation bytes; selector mapping is a separate obligation.

v5 final disposition at this point: initial functional blockers resolved, **C4 still requires correction before readiness**. No additional production defect found; hosted/governance/merge/production gates remain outside this review result.

## Final targeted selector correction

C4 resolved by direct source review and actual independent planned selection. `tools/quality/test-profiles.json` SHA256 `a3492dfa64c2fd3348a5f56532a1cf2677ca119357927bf7271f083e6a526d5f` adds exactly `tests/fixtures/catalog.cjs` to the media and tags rows' input lists. A JSON-level comparison with HEAD found only those two changed `inputs` fields; an escaped-Unicode serialization difference elsewhere is semantically unchanged.

Direct `select(root, 'pr', {changedPaths:['tests/fixtures/catalog.cjs']})` now returns seven modules, including both `tests/article-media.test.cjs` and `tests/article-tags.test.cjs`, with explicit helper-change reasons and an empty conservative fallback list. This exercises current registry validation and the actual selector, not a prose assertion. Production adapter and media/tags/helper test hashes were rechecked and remain identical to v5. The48/48 raw execution can therefore be reused for unchanged behavior; this mapping adjustment changes selection only. The broader registry regression is separately running under the parent and is not claimed passed here.

**Final Code-role verdict: no unresolved findings in the reviewed production integration and corrected test/selector scope.** C1–C4 are resolved. This supersedes the earlier blocked dispositions while preserving them verbatim above. Exact final reviewed identity is v5's74path packet plus the independently hashed selector delta above; a later aggregate packet/RI refresh is not yet inspected and must preserve these relevant bytes. Fresh source CI/governance completion, other independent roles, hosted visual/device checks and staging/merge/production observations remain separate required gates. This Code-role result supplies none of those release approvals.
