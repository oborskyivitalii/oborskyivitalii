# Issue 5 — 2026-10-19 reusable reader mode

Owner: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5), dated
anchor `issue5-reader-mode-20261019`; same Draft PR79. Prepared from
`05f62da0e65fd201c6a43aecb7532ac4ae2af54c`.

## Intent and acceptance

The user accepted the [UX correction plan](2026-10-19-reader-ux-ui-review.md)
and explicitly required a reusable reader-mode abstraction, common article
template and element styles. R12 is the real validation example, not a layout
owner. AC08/AC11 cover this clarification; AC02/AC12 and all publication gates
retain their original intent. This is a platform/template/style increment.

## Architecture and source ownership

| Owner | Responsibility |
| --- | --- |
| `tools/publishing/render.cjs` | Pure renderer extracted from the admitted AST compiler; default/print/platform output retains its existing behavior. Trusted web components are supplied as functions, never executable content data. |
| `tools/site/reader.cjs` | Web-only AST presentation: leading emphasized subtitle, authored introduction/cover furniture, H2/H3 contents, semantic table/code/figure components, numbered note links and return links, declared trailing apparatus. No publication-ID selectors or prose matching. |
| `site/templates/pages/article.html`, `site/templates/components/reader-contents.html` | Shared semantic article shell, compact header, contents, body, next-reading slot and apparatus. Short articles omit empty navigation. |
| `site/engine/reader.css` | Reader layout, typography, responsive/print rules and component styling. |
| `site/engine/reading-surfaces.css`, `styles.css` | Existing single backdrop and theme-palette owners. Reader uses one opaque paper surface; five-scene pages retain their existing treatment. |
| `site/engine/reader.cjs`, `navigation.js` | Optional disclosures/contents enhancement and bounded observer cleanup. Per-history-entry disclosure state restores before scroll through the existing navigation owner. No new clock, fetch or CMS. |
| Publication profile `reader.sections` | Optional declared trailing H2 appendix anchors and numbered reference-section anchor, validated against the admitted model. Article prose, semantic editions and originals remain unchanged. |

Without JavaScript the full article and apparatus are native HTML, with appendix
details initially open. Print exposes details and wraps code. Online reader
history preserves the Contents, source/rights and image-credit disclosures.
Writing↔article retains the agreed single-fractal orbit. Sustained article reading
does not trigger paragraph-entry animation or page-edge scene navigation.

## Findings and dispositions

F01–F10 and T01–T05 belong to the prior review. The prepared implementation covers
the shared reading surface, proper table/code overflow ownership, compact opening,
type hierarchy, caption/credit separation, subsection contents, citation roundtrips
and grouped apparatus. Functional and visual verification are separate below.

An independent read-only review by `ux_reader_review` accepted the abstraction
direction and identified generic failures: fixed contents-ID collision, encoded
Unicode fragments, presentation resources in appendices, figure sizing outside
the main body, subtitle citation backlinks, lost disclosure geometry on Back,
observer-delta handling and empty contents. Corrections are included with focused
regressions; final source/hosted re-review remains pending at this checkpoint.

## Tasks and acceptance evidence

| Task / AC | Expected behavior and check | Prepared disposition |
| --- | --- | --- |
| T01 / AC08 | One opaque complete article surface; existing scene/orbit/motion fallbacks | Implemented; final visual review pending |
| T02 / AC02/08 | Native tables with headings/numeric alignment, dedicated overflow ownership; source/code text preserved | Focused positive/edge checks; final hosted geometry pending |
| T03 / AC02/08 | Shared compact header, subtitle, stable measure and readable figure/caption hierarchy | Implemented on admitted AST; manuscript/original checks pending final source |
| T04 / AC08 | Useful contents, every citation/note return, disclosure/print/history preservation | Focused runtime and AST regressions; final browser journey pending |
| T05 / AC11/12 | Real and synthetic articles, current owning policy, source-qualified hosted preview, independent correction review | In progress; physical Safari/iPad and publication remain separate gates |

CS01–CS10 apply: canonical owners, admitted-model boundary and output escaping,
CSS-only layout, one existing navigation lifecycle, finite article/observer bounds,
unchanged budgets, focused behavior/negative cases, maintained formatting/style
guard and independent review. No new dependencies, inline layout styles or
allowance expansion. Default publisher/kit regression checks cover the extracted
renderer separately from reader presentation.

## Issue synopsis

Implement a reusable reader mode in the same Draft PR79, with R12 and the synthetic
reference as different consumers. Preserve manuscript/edition/media/PDF bytes;
keep all remaining editorial, rights, device, staging and publication decisions
open. Final exact-source checks, corrected preview and independent results are
recorded in PR79 after execution.
