# Issue 5 — reusable reader interactions

Owner: [issue5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5), dated
reader-interactions-20261020 scope. Execution: [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Prepared increment starts at3cdbea2eeab6e05844b4c7f26a57c109f52b7dfc;
base main82b57b8948c6c30143213b846ee2848d06f8d200.
Primary implementation/self-review, with independent bounded source review by
`reader_iteration_review`. Exact final source, CI and preview receipts belong to
the live PR and dated issue update. This is not whole-PR human or release acceptance.

## Intent and scope

The user authorized implementing the next reader UX iteration through PR preview,
explicitly requiring a reusable article template understood by the engine.
Preserve the real R18 manuscript, semantic edition, original media and PDF.
The shared reader gains hierarchical Contents, image zoom, reference previews,
clearer minor headings and a quiet settled background. Owner #2 retains editorial
and rights acceptance; no merge, stable staging or production action is included.

## Findings and decisions

| ID | Evidence / implication | Treatment | Acceptance |
| --- | --- | --- | --- |
| F01 | Full-size images previously navigated away from the reading passage | Shared native dialog with fitted/actual-size view, Escape, focus restoration and ordinary image URL fallback | AC08/11 |
| F02 | Citations interrupted reading with a long bibliography jump | Shared compact source dialog retains full source prose and links; native full-source action and returns remain | AC08/11 |
| F03 | Four chapter links could not reach H3 topics from deep reading | Native H2/H3 Contents, progressive sticky control, current-topic label, close on selection | AC08/11 |
| F04 | H4 resembled bold body text; metadata competed with byline | Shared H4 spacing/type and subdued date/read-time metadata | AC08/11 |
| F05 | Continuous background motion distracted during long-form reading | Preserve last scene paint on settled articles, dim outside the opaque paper, retain requested orbit and principal-page motion | AC08/11 |
| F06 | Prior hosted smoke missed in-flight response checks before navigation | Register verification at request start and drain late checks before actual document/history navigation; preserve all HTTP/body/byte failures | AC11/12 |
| F07 | Independent review found open Contents could jump out of view if made static | Default normal flow without JS; mounted enhancement marker keeps both open/closed Contents sticky | AC08/11 |

## Implementation owners

- `tools/site/reader.cjs` renders the admitted AST into reusable reader components.
  Deduplicating a phrase link requires an immediately adjacent citation whose note
  explicitly contains that exact URL. Source prose, bibliography URLs, standalone
  resource collections, known assets and nonmatching links stay intact.
- `tools/site/articles.cjs` and the article/contents/tools templates own composition
  and dependency closure. Reading time counts essay prose, excluding declared
  appendices; a date is shown only from existing canonical metadata.
- `site/engine/reader.cjs` owns optional dialogs, current topic, print and route
  disposal. It uses native dialog focus containment, restores the trigger without
  scrolling, preserves modified/native clicks, and strips duplicate cloned IDs.
- `reader.css` owns reusable geometry/type. `reading-surfaces.css` owns opaque
  surfaces. `lifecycle.cjs` stops only the settled article's ambient frame loop;
  motion preferences, camera paths and explicit route/block transitions retain
  their existing owners.
- The standalone producer and router hydrate image viewer links from the same
  verified resource inventory. Native image and fallback link contain identical
  embedded bytes; full standalone byte budgets remain unchanged. This serialization
  proof does not claim browser acceptance of no-JS data-URL navigation.
- The isolated nonpublishable reader-reference fixture now includes H3 and a real
  numbered note. Its source/edition/material bindings are regenerated; no real
  article or media source is altered to exercise the collector.

CS01–CS04: canonical owners and semantic selectors, no article-ID styling or new
renderer. CS05: pinned canonical formatter. CS06–CS09: existing route lifecycle,
native HTML fallback, no new fetch/framework/RAF/cache, verified bounded resource
inventory. CS10: behavior tests and the existing bounded hosted journeys cover
image/note/Contents interactions, cleanup, native fallback and late byte checks.
Existing budgets, motion cases and historical runtime families remain admitted.

## Verification and remaining gates

Prepared reader tests22/22, standalone tests17/17, scene tests68/68 and Basic
16 plus Color10 passed. Scene tests used a freshly assembled canonical runtime.
Independent source review rechecked F07 and the reader tests; no scoped source
blocker remained. Metadata was made secondary following its design suggestion.
The final generated identity, source policy, hosted browser rows and fresh visual
inspection are recorded in PR79 after the implementation commit. Intermediate
prepared results are not exact clean-source receipts.

Integration also corrected inherited lint findings: adjacent identical article-list
CSS selectors are merged without changing computed styles, and notice verification
removes the same five envelope fields without unused destructured variables. The
real-media test now pins the current canonical R18 source and edition instead of
R13. Independent bounded review verified these preserve runtime/digest semantics.

The real article continues to use its admitted JPEG/WebP/PDF resources and R18
editorial selection. Standalone JPEG rejection remains explicit. Physical-device,
screen-reader, complete contrast, human editorial/rights and live release gates
remain separate; original issue checkboxes are not closed by this iteration.

Required lint also extracted bounded process/attribution validation, article reuse,
camera journey construction, content directions and collector assertions into
named helpers. The existing conditions/order/budgets are preserved; no rule or
complexity allowance was weakened. Focused profile/build37, navigation/reader55
and scene10 tests passed after these extractions.

## Hosted follow-up

The first exact source b21a4d7 passed its owning11/11 automated policy, with
evidence_valid:true and no errors. CI39400815917 built and published the preview;
1440/390 normal principal-page smoke passed, but the workflow failed on no-Canvas
pending index requests and opening Contents changing document height/scroll.
The enhanced Contents list is now an opaque absolute dropdown below the sticky
control, preserving both document geometry and native no-JS flow. The collector's
strict reading-position assertion remains unchanged. This failed run is historical
diagnosis, not final hosted acceptance; the final source/run belongs to PR79.
