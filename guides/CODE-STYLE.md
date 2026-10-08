# Code style and source architecture

Mandatory for agents and contributors changing code, templates, styles, content
schemas or build/check configuration. Read this guide before editing. Apply the
relevant rule IDs to the owning issue's ACs and PR evidence. It complements the
[source contract](../site/README.md), [check profiles](SITE-CHECK-PROFILES.md)
and [acceptance contract](../.github/ACCEPTANCE.md).

Existing debt is not permission to extend it. Improve the touched concern within
the accepted scope; put larger migrations in an owned task. The initial audit
and ordered Sol work are in [issue 54's analysis](../review/issue-54/2026-10-08-analysis.md).
Do not combine a feature, repository-wide formatting and architectural migration
in one PR. Generated copies and intentionally pinned history are not duplicate
editing authorities.

The maintainer explicitly approved the ordered R2–R6 refactoring in one Draft
PR60 under issue58 on 2026-10-08. That scoped workflow retains the immutable R2
checkpoint, phase checks/reviews and one final merge/main gate; see its
[current handoff](../review/issue-58/2026-10-08-handoff.md#current-continuation--same-pr-2026-10-08).

## CS01 — Source ownership and dependency direction

| Concern | Canonical editing owner | Contract |
| --- | --- | --- |
| Publications, routes, metadata, prose | `site/content/` | Data/content, not engine or presentation policy |
| Semantic HTML and repeated views | `site/templates/` | Render validated content; no business or animation logic |
| Runtime, navigation and lifecycle | `site/engine/` | Consume scene/content contracts; never import generated output or build tools |
| Scene models and visual geometry | `site/scenes/` | Explicit parameters and pure computations where possible |
| Optional effect descriptors and helpers | `site/effects/` | Pure effect exports; hosted/offline adapters remain in `tools/site/` |
| Media | `site/assets/` | Referenced through existing asset/edition identity contracts |
| Build/export orchestration | `tools/site/` | Validate, render, hash and emit; do not become a second content registry |
| Hosting and checks | `tools/staging/`, `tools/quality/`, `tests/` | Consume declared sources/artifacts and preserve evidence identity |
| Public renditions | `docs/`, declared offline outputs | Generated; change their authored owners and regenerate |
| Decisions, diagnostics and history | `review/`, `drafts/` | Not a home for new active runtime/build code |

R1 in [issue56](https://github.com/oborskyivitalii/oborskyivitalii/issues/56) moved
the active Color sources from `review/site-scroll-sync-20261004/` into
`site/effects/` and the exporter into `tools/site/`. Update all consumers, catalog,
source hashes and test/scanner inventory together; preserve real historical
evidence. No circular dependencies, process-global monkey patches to capture
exports, or hidden `require` side effects. Prefer explicit inputs and returned
descriptors. Existing browser factory serialization must remain closure-safe
until deliberately replaced with its identity tests.

## CS02 — Content separate from presentation

Keep repeated publication/edition/topic/route records in validated structured
data with stable IDs. Keep prose in content files; use a bounded Markdown/rich
text representation when R3 establishes its parser and migration contract.
Templates own headings, cards, containers and links around that content.
Do not embed new reusable layouts in prose or hardcode publication text, labels,
topic lists and URLs in the engine. Reuse the existing catalog rather than add a
parallel registry. A page-specific template is preferable to a universal page
DSL with executable expressions. Existing HTML content is tracked migration
debt: preserve text, semantics and links until its scoped conversion.

Escape text and attributes for their output contexts; validate URLs and content
schemas before rendering. Do not add `eval`, raw executable templates or an
unrestricted HTML channel. Preserve authored wording, edition dates/IDs,
accessibility, anchor IDs, metadata and no-JS reading through migrations.

## CS03 — CSS owns declarative appearance

Author layout, typography, spacing, colors, responsive behavior and static
transition styling in canonical `.css` files. No new content/template `style`
attributes, `<style>` elements, or static CSS invented in JavaScript strings.
Build/export code may embed bytes read from the canonical CSS for offline HTML;
it must not maintain another copy of those rules. Theme variants and reduced
transparency overrides live alongside their canonical component tokens.

Use shared component classes and explicit variants. Preserve specificity and
paint geometry when replacing old selector lists; similarity alone does not
prove two selectors have the same job. The reading backdrop's sole parameter
owner is `site/engine/reading-surfaces.css`; theme palette ownership is
`site/engine/styles.css`. Change their tokens once, not per page. Keep text/controls
opaque when changing background alpha. Do not apply opacity to their container.

Exceptions by design: finite per-frame transforms, measured coordinates and
state-dependent CSS custom properties belong to the runtime; classes/data
attributes select declarative states. Canvas draw state and geometry cannot
be authored entirely in CSS. Read theme tokens at initialization/theme change,
cache them, and use scene parameters for geometry. SVG intrinsic geometry and
intentional standalone fallback paint are allowed; review palette duplication.
These cases must not become a route for static page styling in JavaScript.

## CS04 — One owner per concern

Put a parameter with its owner: reading paint in its CSS, routes/publications in
content, camera/scene constants in their model, delivery limits in their profile.
Do not replace scattered literals with one giant global configuration object.
Units, bounds and default/fallback behavior must be evident at the boundary.
Extract duplicate logic when the inputs, outputs and invariant are the same;
prefer composition to a helper with unrelated flags. Keep generated offline,
immutable revision and compatibility copies generated from the same owners.

## CS05 — Readable authored code

Use UTF-8, LF and a final newline. Use two-space indentation for new/reformatted
JS/CSS/JSON/YAML, four for Python. Follow the existing module format (`.cjs` for
Node factories/tools); do not mix module-system conversion into another change.
One meaningful statement per line, expanded blocks, descriptive names and small
functions with clear responsibilities. Aim for about 100 columns; long URLs,
fixtures and unavoidable literals are exceptions. A soft length target is not
a reason to split a coherent function into many trivial wrappers.

Do not hand-minify authored code. Format touched functions consistently, but
schedule whole-file mechanical formatting separately from behavior changes.
Keep comments about intent, units and invariants; remove obsolete explanations
when changing behavior. Use `const` unless reassigned, explicit equality and
guarded finite numeric inputs. No blanket lint disables; scoped exceptions need
an owning issue, reason and removal/review condition. R2 will pin a formatter
and widen actual source lint coverage; those checks are not installed by this
guide alone. Build-only minification is a separate measured decision.

## CS06 — State, effects and lifecycle

Keep scene math/projection testable independently of DOM and drawing. Give each
animation session one owner, cancellation identity and disposal path. Use the
existing scene clock/RAF; adding a perpetual loop requires an explicit reason
and budget. Handle rapid navigation, interruption, history and stale async work.
Do not mutate shared globals to discover effect exports. Hosted and offline
assembly should consume the same explicit effect model, not extract independent
implementations from rendered HTML with regular expressions.

## CS07 — Measured speed and bounded resource use

Preserve existing quality/frame/cache limits and Off/reduced-motion/no-Canvas
behavior. Cache immutable geometry, decoded images and reusable calculations
where ownership and invalidation are explicit. Batch DOM reads before writes;
avoid layout measurement, allocation and theme lookup in hot loops. Bound work
by visible content and quality tier; release listeners, textures and caches.

Measure the changed bottleneck on the same source/profile/device and retain
raw evidence. Report bytes, relevant task/frame timings and memory/cache bounds
when affected. Fewer source lines, fewer modules or prettier code do not prove
a faster page. Do not raise budgets or repeat full matrices to chase one number.

## CS08 — Verification proportional to the change

Run Basic (`node tools/quality/local.cjs`) and the applicable source suites/profile
from the maintained registry. Add tests for behavioral contracts and meaningful
failure cases; do not add assertions that only mirror implementation text.
Architecture/guard changes need negative cases proving the guard can reject a
violation. Pure prose/routing work does not justify a new browser matrix.
Refactors need output/semantic parity and relevant navigation/visual evidence;
source hashes may change even when behavior is equal. Keep exact-source identity
honest, including factory serialization and generated snapshots.

## CS09 — What the current automatic guard proves

Run `python3 tools/check_code_style.py`. It uses the standard library and the
local immutable Git baseline; no package install or network request is needed.
Its regression suite is `python3 -m unittest discover -s tests -p 'test_code_style.py'`.
Both run unconditionally in the existing navigation CI workflow.

| Enforced subset | Coverage and limit |
| --- | --- |
| CS01 active source location | Catalogued active JS under `review/`; literal local imports from authored `site/`, `tools/site/`, `tools/staging/` and those active history sources; reject imports of generated `docs/`, prior immutable `site/retained/` output and runtime imports of build tools |
| CS03 inline style debt | Every authored HTML file under `site/content/` and `site/templates/`; HTML parser handles inline attributes and style elements |
| CS03 shared token ownership | Reserved palette/reading token declarations, including `--muted`, across authored `site/**/*.css`; repeated theme/media/variant declarations in the same owner are valid |
| Agent/RI/CI routing | Actual code-path and bilingual RI lookups, mandatory guide links, mapped unconditional workflow invocations and stale-source rejection |

Only exact `site/retained/runtime/<64hex>/styles.css` copies whose bytes match the
retained manifest are excluded from token-owner selection. Missing declarations
or changed bytes fail; mutable catalog roles cannot hide competing authored CSS.
JS/import coverage remains intact and scanned authored code cannot import prior
immutable output. `tools/site/retain.cjs` and the site builder own the complete
retained inventory/byte integrity and snapshot closure; the style guard does not
replace those checks.

The JS import scan is intentionally lexical, not a complete dependency graph.
It cannot prove computed-import behavior, CSS generated by JS, arbitrary SVG
paint, all possible token duplication, semantic content separation, formatting
or performance. These remain review obligations and R1–R6 work. A passing guard
must be reported as this subset, never as full guide compliance.

`.github/code-style.json` holds exact issue-54 debt occurrences, tied to immutable
base `aa1cfa97bf42103c0547c9332b885391f0e6fe6b` by the validator. No wildcard,
unowned, duplicate, new or expanded allowance is accepted. Reduce/remove ledger
entries when fixing debt; stale entries fail. Changing the frozen baseline or
guard scope requires explicit architectural review, its own AC and updated
negative tests, not automatic exception regeneration to make CI green.

## CS10 — Issue, AC and PR evidence

Every code-changing issue needs a code-style AC, or an explicit style subcondition
in an existing AC. Name applicable rule IDs, expected result and check/review
route before implementation. A documentation-only issue records why runtime
rules do not apply; code added for its tooling still follows them.

In the PR record: rule IDs → changed owner → check/result → exact source →
remaining review/debt. Cite exact exception entries and removal tasks where
needed. Review all applicable rules, including those outside the automatic
subset. Record self-review as self-review and independent review only when
performed; keep existing required review, device, release and merge gates.
Update RI/catalog routes when owners or paths change. Do not tick an entire AC
because the bounded style guard alone passed.
