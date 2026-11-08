# Issue177 — source diagnosis of internal-entry selector

2026-11-08, Code reviewer `/root/issue177_ci_code`; targeted continuation after parent raised concrete source question. Inspected HEAD `042a2eacd39b8ce6a6d780e2276182e60c3b2d3d`. No implementation, browser execution, workflow rerun, external write or peer-result reading.

## Finding — blocking test integration defect

`tools/quality/analytics-browser.cjs:285-288` selects `a[href="articles/the-sdlc-is-out-of-balance.html"]` after entering the article directly and clicking `.reader-back`. Source inspection confirms that this can miss the actual Writing link; the runtime does not normalize its DOM href to the canonical route.

Failure mechanism:

1. Each direct/alias `page.goto` creates the article document. `site/engine/navigation.js:46-50,72-74,171` establishes the current article route and seeds its cache only with that document.
2. Clicking `.reader-back` targets Writing. `navigation.js:613-650` pins the registry and, because Writing is not cached in this article-first document, fetches the immutable Writing snapshot from `pinned.routes.writing.url`.
3. Current generated `docs/snapshots/f5dfa9db166b4dc82ff203692150adb478d6688a6d590d56c21e09ffb0081e11/writing.html` has the article card href `../../article-snapshots/eb562d4358d09877a0c0e0e0382bf3d865814e8e914a6279a21f20454c190a29/the-sdlc-is-out-of-balance.html`, with no canonical article href. `articles.immutableLinks` owns this intentional snapshot binding.
4. `navigation.js:106-114` (`resolveResources`) resolves the href to the absolute snapshot URL. `navigation.js:115-132` (`rebaseResources`), called at mount around line1013, computes a relative path from that same target pathname. On the mounted Writing route it therefore becomes `article-snapshots/eb562.../the-sdlc-is-out-of-balance.html`. Neither function replaces that pathname with `articles/...`.
5. `routeFor` intentionally recognizes both canonical and snapshot article paths. `address` at `navigation.js:314-323` canonicalizes the eventual navigation destination after link activation; it does not rewrite mounted DOM href attributes. It cannot rescue the helper's earlier exact-attribute lookup.

Expected consequence, inferred from source: Writing observation passes; exact canonical href lookup times out before `internal`, then scenario records failure. Actual CI failure/output has not been observed by this reviewer. Generated fixture recompiles the same canonical producer, so this is directly relevant to the enabled Writing scenario on the in-flight source.

Affected AC02 and AC07 bounded browser checkpoint: intended internal/history evidence cannot complete. This is a test-selector integration defect, not evidence of a broken product route or analytics collection. Proposed treatment: use the actual supported article link identity independent of canonical-versus-immutable href representation, retain native click/navigation and article identity/title/SDK/history assertions, and independently review the correction. Do not weaken the canonical/alias direct-entry checks or product snapshot contract.

The initial Code review missed this producer/runtime/selector integration. Its no-blocker conclusion is superseded for this affected scope; unchanged scanner/budget and other source reviews remain reusable. Retain current CI observations and diagnose before authorizing a new campaign. No rerun or implementation performed here.
