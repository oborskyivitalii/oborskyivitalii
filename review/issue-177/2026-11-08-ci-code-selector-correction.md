# Issue177 — focused selector correction review

2026-11-08; Code reviewer `/root/issue177_ci_code`, nonauthor continuation. Earlier diagnosis `/tmp/issue177-ci-code-selector-diagnosis.md` preserved: initial review missed the canonical-versus-immutable-link integration. This is affected re-review, not a new clean-context first judgment.

## Verdict

The blocking selector defect is resolved at source level. No new blocker found in the focused delta. Actual enabled Writing browser execution remains required before browser acceptance; author-reported native68/68/lint and cancelled CI are not independently observed results of this reviewer.

Inspected base/HEAD `042a2eacd39b8ce6a6d780e2276182e60c3b2d3d`, actual dirty diff of `tools/quality/analytics-browser.cjs`, inspected producer SHA256 `9616632ec74ceabe805cf0d9214cd33bc9774c2db6e6fff1721c1a7652ea8907`. Common/role prompts and unchanged source contracts remain as identified in first Code report.

## Why the correction addresses the defect

The enabled Writing scenario now reads article descriptors from the **same generated fixture directory** `docs/site-revision.json` used to serve the test documents, then passes them into the journey. This avoids using the ordinary repository snapshot digest when the enabled synthetic analytics fixture has generated different immutable bytes.

After article-first entry returns to Writing, the helper asserts the registry descriptor alias equals the validated public catalog route and the snapshot URL has the finite `article-snapshots/<64hex>/<slug>.html` form. It selects `a.publication-title` by either that exact alias or exact descriptor snapshot URL, then requires exactly one match before actual DOM activation. The previously missed immutable snapshot href now matches, while unrelated article links, ambiguous duplicates, missing links and unregistered snapshot targets do not silently pass. No `.first()` fallback remains.

The runtime source still preserves snapshot DOM hrefs during resource rebasing and canonicalizes the eventual destination via `address`. The updated selector therefore follows the current runtime contract without changing product routing. Existing actual article key, heading, settled-content, SDK request/element observations and Back/Forward phases remain unchanged and strictly compared with the expected evidence. Vendor counters are not reset around the internal/history phases. Canonical/extensionless direct-entry and reload checks remain intact.

## Independent bounded checks

- `node --check tools/quality/analytics-browser.cjs`: exit0.
- Parsed canonical `docs/writing.html` and current immutable Writing snapshot with Python HTMLParser; resolved their publication-title links using each actual source URL and reproduced mounted Writing's relative pathname rebasing. Exactly **one** link matches the new alias-or-exact-snapshot selector in each case. This is a static resource-resolution check, not browser execution.
- Inspected actual source diff: only descriptor passing, exact descriptor admission and selector replacement changed. No reporting oracle, count, timeout, scenario allocation, scanner or budget weakening in this delta.

AC02/AC07: identified test integration blocker resolved; actual browser/CI and other original gates remain pending. No real pageview or provider receipt claim. No source modification, external write, delegation or workflow rerun performed by reviewer.
