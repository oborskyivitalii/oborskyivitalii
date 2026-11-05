# Reader foundation across open PRs — Code completeness audit

Refs #169 / PR170. Independent nonauthor Code reviewer `/root/native_r9_code`, 5 November 2026. Read-only Git/GitHub/source audit before production; only this report is written. No source/test changes, content copying, browser run, build or external mutation. Current candidate `d3a49960714e5f158afba23d02dd0f8e871cb28e`, tree `64b5bf1c039b82abe3de0ae726c726e41aeaf0a9`; main `8cf15883125892710633b17133d9ee0fc4b23b92`. Checkout was clean at audit start. Remote PR metadata matched the local heads below.

**No necessary reusable reader renderer, template, style or engine component was found stranded in PR79 or another open PR. Main already contains the reader foundation; PR170 builds on it with its own article and bounded integration corrections. Do not import the separate essay or roll back to an older branch tree.** This is structural source completeness, not acceptance of pending runtime, CI, hosted or production gates.

## Current inventory and effective contributions

Authenticated GitHub open-PR search returned exactly six open Draft PRs. Each effective file count below comes from `git diff --name-only $(git merge-base origin/main HEAD_OF_PR) HEAD_OF_PR`, not a direct main-versus-old-tree comparison or a historical PR-body count.

| PR / current head | Effective merge base with current main | Files | Reusable reader contribution still outside main |
| --- | --- | ---: | --- |
| [170](https://github.com/oborskyivitalii/oborskyivitalii/pull/170), `d3a49960714e5f158afba23d02dd0f8e871cb28e` | `8cf15883125892710633b17133d9ee0fc4b23b92` | 499 | Current R9 integration/corrections, listed below; foundation already inherited |
| [79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79), `5ee28e5f9833df8eb6da8bc5aaab8b5655bc92f2` | `86a270461a686d2e69d6cefc19ea5c041501c554` | 14 | None; only the separate PMDay essay/editorial records |
| [110](https://github.com/oborskyivitalii/oborskyivitalii/pull/110), `3ee7398c48bfedca4a004e50ef72d88df954c8b4` | `8cf15883125892710633b17133d9ee0fc4b23b92` | 203 | None; conference deck/speech scope, no engine/template/site-producer/publisher owner delta |
| [171](https://github.com/oborskyivitalii/oborskyivitalii/pull/171), `39afcc67b0b5612a787c82d0574d0468bfb5962c` | `8cf15883125892710633b17133d9ee0fc4b23b92` | 17 | None; reviewer-admission scope, no reader owners |
| [117](https://github.com/oborskyivitalii/oborskyivitalii/pull/117), `8d215e1d78719fa80abb9c007b57048c6d8daeec` | `ca70a66f340a8e804e4263c02aa9abe79a062765` | 21 | None; optional LCP diagnostics/tests/workflow, no application engine/templates/site-producer delta |
| [107](https://github.com/oborskyivitalii/oborskyivitalii/pull/107), `50efb5c07dc4d8087be6a2731d6f3871f6116be6` | `0098f804cb3b0d120173d4c8689043db42231c47` | 154 | Its two shared material owners are already on main, as checked below; campaign/content remainder is separate |

PR79's API metadata/body still describes a much larger historical feature PR (178 commits/506 files), but its effective unique contribution against current main is ten commits/fourteen paths. Those paths are six dated issue2 review records and eight PMDay publication/edition/blueprint/profile/manuscript/launch records. There is **no** effective `site/engine`, `site/templates`, `tools/site` or `tools/publishing` delta. Direct-tree differences in build/lifecycle/html/offline/scroll sources are older branch versions of work already advanced on main, not missing improvements to transplant.

## Integration ancestry

Git independently verifies the reader introduction `419243173014073dad8f218bfe8c4802b7b08f13` is an ancestor of main, PR170 and PR79. Protected platform integration [PR146 merge `56404df6fb4085378079c61891ad85cdbd22bbe7`](https://github.com/oborskyivitalii/oborskyivitalii/commit/56404df6fb4085378079c61891ad85cdbd22bbe7) is an ancestor of main and PR170. Its native merge message identifies the issue122 trusted-history/platform route. Subsequent platform/content delivery PR153 is also in main's ancestry.

[PR157](https://github.com/oborskyivitalii/oborskyivitalii/pull/157) is merged, with merge `9318a54a684079bb23e5dadcfa4bf705d6783dd0` an ancestor of both main and PR170. PR157 itself changed seven contract/status/RI paths; it did not newly author the reader. It reconciled the delivery already integrated through the platform route. [Issue122](https://github.com/oborskyivitalii/oborskyivitalii/issues/122) is closed/completed and explicitly records platform/reader production without publishing the new essay, with its original source and production evidence. This audit verifies ancestry and current source availability; it does not replay or relabel that historical production proof as a current R9 result.

## Concrete source-owner mapping

All paths below were inspected through fixed Git objects at main/PR170/PR79. “Identical” means full byte equality, not filename presence alone. Canonical authored owners are the sources; generated `docs/` copies are not another prerequisite branch.

| Foundation / dependency | Exact authored owners | Current mapping |
| --- | --- | --- |
| Admitted article AST, shared rendering and semantics | `tools/publishing/article.cjs`, `render.cjs`, `semantic.cjs` | Main = PR170 = PR79 |
| Reusable web presentation and media adapter | `tools/site/reader.cjs`, `article-media.cjs` | Main = PR170 = PR79; no article-specific layout import needed |
| Reader shell, hierarchical Contents and progressive dialogs | `site/templates/pages/article.html`, `site/templates/components/reader-contents.html`, `reader-tools.html` | Main = PR170 = PR79; all templates unchanged in PR170 |
| Long-form typography, components, print/mobile rules and opaque paper | `site/engine/reader.css`, `reading-surfaces.css` | Main = PR170 = PR79 |
| Reader lifecycle, disclosure/history, zoom and source preview | `site/engine/reader.cjs` | Main = PR170 = PR79; router already mounts/destroys it |
| Common route-wave CSS and scene lifecycle | `site/engine/scroll-entry.css`, `lifecycle.cjs` | Main = PR170; scroll CSS also equals PR79; PR79 lifecycle is older |
| Public materials/download rendering | `tools/site/article-materials.cjs`, `site/templates/components/article-materials.html` | Main = PR170 = PR79; PR107 template equals main, its helper is older |
| Article selection/metadata/native generation | `tools/site/articles.cjs`, `build.cjs` | Foundation on main; PR170 modifies existing owners for its source-bound integration, not missing templates |
| Native navigation, filtering/tags and common wave ownership | `site/engine/navigation.js`, `archive.js`, `article-tags.cjs`, `scroll-entry.cjs` | Foundation on main; PR170 contains the reviewed footer/live-ink/address-owner and metadata corrections. PR79 has no effective unique change to these owners |
| Immutable/dependency parsing, retention and standalone assembly | `tools/site/html.cjs`, `edition-retention.cjs`, `offline.cjs` | Existing main owners; PR170 contains its reviewed closure/generation corrections. Older PR79 copies are not prerequisites |

The actual producer chain is connected: `articles.select` loads the existing publishing article model, media adapter and selected public materials; `articles.input` calls `reader.prepare` and reads the common article/Contents/dialog templates. `reader.cjs` uses shared `publishing/render.cjs` and `semantic.cjs`. `build.styles` concatenates canonical styles, reading surfaces, reader CSS and common scroll CSS; `runtimePayloads` composes SiteScrollEntry + SiteReader + navigation and SiteArticleTags + archive into the existing runtime assets. Those dependencies are present in main and the candidate. Publishing/quality package-lock/toolchain paths have no PR170 delta in this audit.

Representative equality pins (SHA256, identical main/170/79): reader adapter `6ae95e796e6bd8b9b4bd03a30f92c44cfead057c525d88b2e1a85fe5d6d7072f`; article shell `6b4d543a6b4f5c1374f047d90850d9c0ecc3abe0e07f4c610e8408297cf7236a`; reader lifecycle `4f7d88b21fc6f4ee973c33531e62026d76197613e1c5fb502649e53727ebc897`; reader CSS `f376f6e3785a345c1faf31cdf50930c84afe1f23c15b8c1438c9d465e4a71b59`.

PR107's effective shared additions need no recovery: material rendering commit `10c887e7` is already an ancestor of main. Its material template is byte-identical to main/170/79 (`080de5fae560b0afee23b54b654fbdf32e7d2c9d9259f9d401c3c47f68f67eec`). Main's helper additionally retains stronger PNG IHDR/dimension/pixel bounds absent from PR107's older copy. Importing that older helper would lose current validation, rather than complete the reader.

## Disposition and limits

No missing necessary reader foundation was identified in the inspected current effective diffs. PR79's separate essay/source/editions and PR107/110 campaign/conference content remain outside R9. Keep the main foundation and current PR170 corrections; no merge/cherry-pick/copy from those Draft PRs is warranted by this audit.

This check covers the concrete reader/producer/runtime dependency owners and all six open PR contributions, not a manual audit of every generated or editorial line. Current R9 runtime admission, clean exact-head CI, hosted browser behavior, owner staging/admission, protected merge and frozen production/rights/served-byte verification remain their existing gates. No green result, publication claim or new gate waiver follows from structural completeness. The report is intentionally text-only and small; no raw API/body or trace blobs are added near the RI size bound.
