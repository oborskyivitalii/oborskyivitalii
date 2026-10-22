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
regressions. Source re-review found no remaining bounded abstraction blocker.

The first hosted candidate, `419243173014073dad8f218bfe8c4802b7b08f13`, was
independently inspected at 1363×936 in dark theme. Both tables and BibTeX have
matching client/scroll dimensions; citation 24 opens Sources below the header and
returns to its exact passage. The opening, contents/current marker, captions and
grouped apparatus are substantially clearer. The opaque paper disappears during
departure; no paper obscures the orbit. Its abrupt boundary during the child wave
is a nonblocking polish observation, not a reason to animate the full long article.

CI39293074015 preserved HTTP identity and four room journeys, plus desktop reader
navigation. Raw smoke ZIP12206617775 SHA256
`2d6cb462c4566a4945dbfe04ad4937f62e5291ee90450d587f7a9ade683141cf`
was downloaded and verified. The mobile screenshot exposed an inherited
`overflow-wrap:anywhere` splitting the numeric-column heading. Shared table
wrapping now retains ordinary word boundaries. The browser diagnostic also tried
to click a link in the new collapsed mobile Contents: it now opens its native
summary first in both normal and fallback journeys. The failed run remains failed.

The initial clean-source policy passed all reader/publisher/basic/RI checks but
exposed the new runtime family missing from the existing licensed-byte registry
and an old expected production-family ID. Both are corrected without weakening
the guards; controller/rights51/51 passed. Final exact-source policy and corrected
hosted results are recorded in PR79 after execution.

The correction source `43b187b6d13237fd31ab0955d8e028710d422799` passed the complete
clean-source policy11/11 (report SHA256
`ff588f981084a729884c737226efb7b78cc3c93ca6800e1636d2203740e5c18f`).
CI39295014795's downloaded raw ZIP12206099563 SHA256
`289bca590d550f61b52780b2669c49477f61bd1748d89c7ddb7711f6acc169fd`
preserves exact HTTP identity, four passing room rows and the corrected390px
table screenshot. The final evidence reducer still required paragraph-entry
animations after the collector had enforced stationary reading, so that run
remains failed. The registered reader family now explicitly declares stationary
article reading: the reducer requires zero entries and zero active entry units,
while keeping nonempty bounded route-departure proof. Historical runtime families
retain their original entry-animation requirement. Positive/negative fixtures
cover both contracts. This follow-up changes quality evidence only; emitted
reader/scene/runtime bytes remain unchanged.

At `fe8a7b86f7e3440d53f59896b011ddbfc16ebe93` the clean-source owning policy
again passed11/11, report SHA256
`7e8b3289588e93206998cfb5b513c9be6c196da35195b3ea30f8a0f0a0137708`.
Final test-only maintenance refreshes the current Color tuple and modern
publication-fixture expectations to the reader family; frozen historical
expectations remain. Color contracts17/17 and both current plain/staging
publication fixtures passed. The supplementary full publication-records module
was stopped while Git was fetching absent blobs for frozen `cc115c4` sources;
that partial run is not a pass. Existing current-source rights/publisher checks
and the independent historical-family evidence-contract cases remain separate.

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
