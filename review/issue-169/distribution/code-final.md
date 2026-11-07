# Code / changed-artifact review — affected v4 delta

Verdict: **No blocking finding in the inspected v4 launch-validation correction. The deferred build-only back-reference is acceptable under CS01 for the inspected invocation/export order.** Earlier first and v3 reports remain preserved; unchanged review evidence is reused, and v4 supersedes the earlier launch-validation implementation assessment. This is a correction continuation receiving the author's factual packet, not a newly fresh first judgment. No peer output, author conversation or MEMORY was read; no implementation, test-source, external write or delegation was performed.

Reviewer: `/root/distribution_code`, distinct nonauthor Code / changed-artifact role. Dirty native Git baseline remains `7c292bd50a4f9a0024c397a290c1de965ceada4f`. Independently matched packet `review/issue-169/distribution/candidate-v4.json` SHA-256 **`2753dd31967d68ca2f383223eb7cb51e08676c30d1b7fc10d30705fc43be7ec2`**, all **41** declared file/deletion entries, with **zero mismatches**. Compared v3/v4 identities: substantive source delta is confined to `tools/publishing/profile.cjs` and `tests/publishing-profile.test.cjs`, plus generated descendants. Prompt/intent/issue identities and isolation limits remain recorded in the preserved first result.

The new `validateLaunchDestinations` resolves the two declared tokens, compiles the result using the existing admitted Markdown compiler, and requires both exact destination URLs among actual AST links. Inspected the compiler and `ast.mjs` link collection: the model records actual resolved `link` nodes and reference links, while a fenced code value is not a link. This closes the substring/boundary limitation for nested redirect URLs, tokens inside redirect parameters and code-fenced tokens. Tests retain materials-only, direct redirect and missing-destination negatives, and add those three meaningful cases while preserving accepted literal Markdown destinations.

CS01 invocation/export review:

- `article.cjs:9` imports the profile facade at module initialization. `profile.cjs` initializes its leaf imports, defines functions and completes `module.exports = { loadProfile }`; it does not call launch validation while initializing.
- `article.cjs` likewise defines functions and completes its export object at line 538. Its only call to `loadProfile` is inside the externally invoked `loadArticle` function at line 530. Consequently, when the article entry path reaches launch validation, both facades have completed initialization and the function-scoped `require('./article.cjs')` returns the complete cached export.
- For a caller entering through the profile facade first, that facade already completed export before `loadProfile` can be called. The deferred require then initializes `article.cjs`; its import of profile receives the complete profile export, and article exports `compile` before the deferred require returns. No top-level call re-enters `loadProfile`.
- `compile` performs its bounded existing subprocess compilation and returns the parsed model; it does not call `loadProfile` or `loadArticle`. The AST subprocess imports the leaf renderer, not either facade. No IIFE/top-level callback, global export capture, monkeypatch or runtime/browser dependency was added. Thus there is a deferred build-only reference group, not a module-initialization cycle or recursive invocation.

Actual bounded execution:

```text
node --test --test-name-pattern='site-first profile counts|planned site links reach' tests/publishing-profile.test.cjs tests/publishing.test.cjs
tests 2; pass 2; fail 0; cancelled 0; skipped 0; todo 0
```

These existing affected cases execute the new negatives and accepted token/literal exports. No full campaign was duplicated. In a separate fresh Node process, required the profile facade before the article facade, checked both `require.cache` entries were fully loaded, and loaded actual R10 through `loadArticle` successfully. Inspected source order above for the cold deferred-require case rather than inferring it solely from the runtime probe.

Independently verified actual kit **`6b1039925ee49a8349d46ddd8539aa1ad0b6314d896f3132e58bcc98c8f6a75a`** with existing `verifyKit()`. Compiled its generated launch Markdown and observed the two exact AST destinations:

- `https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html`
- `https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html#article-materials`

Kit inventory/digest verification passed. Actual article remains `planned`, canonical/published remain null and events remain empty. No event/proof/material admission source changed in v4. The unchanged manuscript, PDF, semantic edition, assets, eight-format rendering, character-bound and paired-material evidence retains its previously stated scope.

Read neutral retained v4 raw logs: source campaign final accounting is 54/54 pass, Basic JSON reports pass with 17/17 focused tests and 10/10 Color tests, and build output shows the expected deterministic descendant replacement. The lint log is empty; the packet supplies its exit-0 report, which remains an orchestrator execution receipt rather than an independent reviewer lint invocation. No source/check gate was inferred from absent log text.

No additional blocker or unresolved Code-role finding. Final RI/catalog/metadata verification, exact-source command/exit binding, all other required role/human gates and actual website/editor/platform/backlink observations remain outside this bounded code correction judgment. Later substantive changes require affected review; deterministic refreshes retain their ordinary provenance/byte-verification requirements.
