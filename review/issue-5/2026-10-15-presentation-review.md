# PR79 — 15 October 2026 presentation and export review

Owners: [publisher #5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5)
and [article #2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2).
Execution: [PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Prepared from raw head `e1a29787ad256c90f00e73af0d2b28dcf069527b` plus recovered
uncommitted source/assets. This record describes the prepared working tree;
final clean commit, CI and hosted bindings are reported in the owning PR/issues.

## Intent and review roles

The author's 15 October continuation authorises completion of the real English
article, visuals, reusable covers, slide reader, exports, checks and preview.
The real `pmday-ai-both-sides` article is separate from the unchanged
`pmday-two-shifts` technical fixture. Article/deck/publication decisions retain
separate identities. Production and external posting remain later decisions.

Root performed recovery/integration and self-review. A separately delegated code
reviewer inspected viewer/template, PDF pinning, semantic identity, offline closure
and export handling; another reviewer independently inspected all 13 PDF pages,
both original covers, all three diagrams and kit bytes. The code reviewer also
implemented and self-reviewed the small findings below; that remediation is not
claimed as a second independent review.

## Findings and dispositions

| ID | Evidence / owner | Result and disposition |
| --- | --- | --- |
| F01 | `site/engine/navigation.js` | A stale hashing session could remove a reopened viewer's busy state. Fixed by checking session ownership in final cleanup. The delayed-hash close/reopen regression failed the old code and passes the fix. |
| F02 | `tests/navigation.test.cjs` | Viewer insertion invalidated extracted-function fixtures (15 failures). Corrected the fixture boundaries and supplied the explicit cleanup dependency; navigation now passes 29/29. |
| F03 | `site/engine/article-print.css`, `site/engine/styles.css` | Automatic contents markers duplicated authored chapter numbers. Removed markers in both renditions and regenerated PDF. |
| F04 | `review/issue-2/pmday-candidate-20261015/` | Platform-rendition kit contains efficient images. Added a separate `social-covers.zip` with original landscape/square upload masters, provenance and hashes. |
| F05 | Hosted frame-denial headers | Reader loads only a declared PDF on demand, bounds bytes/deadline, verifies digest and uses a local Blob. Existing headers remain. Close/navigation/pagehide abort work and revoke URLs. |
| F06 | Native PDF painting | Local headless review establishes frame lifecycle, not native PDF plugin rendering. Actual Safari/iPad PDF painting remains a device check. Native open/download links remain available without JavaScript. |
| F08 | First committed CI at `6095c266` | Formatting caught the new profile JSON; preview caught output generated before the final template formatting, and source checks caught the previous explicit Color fixture admission. Correct source formatting and regenerate output before checks; admit the reviewed new runtime separately while preserving historical families. These original runs stay failed. |
| F07 | Full offline export | The real article/deck exceeds the existing 800KB-gzip single-file limit. It is explicitly rejected; use hosted reader or complete multi-file/PDF kit. No budget was raised. |

## Checks actually observed during prepared-source review

- Independent code reviewer: navigation 29/29; publisher/offline 28/28;
  article/browser-evidence/candidate-source 22/22.
- Local review Chromium153.0.8010.0: no initial PDF request, keyboard open,
  verified Blob, close/navigation URL cleanup, 390px no overflow, no-JS links,
  corrupt-PDF rejection and no page errors. This is a local review producer.
- Independent artifact reviewer checked all 32 kit outputs, current declared
  input/producer hashes and equality between manuscript/standalone PDF and kit.
  See candidate README for the refreshed artifact identity after F03.
- Source Basic and bounded style guard passed during recovery. Final source
  checks, RI/CI and hosted evidence must bind the committed final source.
- Earlier broad local attempts were invalid/incomplete: first lacked the
  required Python executable; a later attempt overlapped CSS regeneration and
  saw the stale generated-CSS equality failure. Neither is a green final run.

## CI follow-up before final validation

The first committed `6095c266` checks correctly rejected profile formatting,
output generated before the final template formatting, and an outdated explicit
Color fixture admission. All of those original runs remain failed. The profile
is formatted and public/offline output regenerated, followed by a fresh output
check. The refreshed kit changes input/PDF metadata hashes; every PDF page remains
text- and pixel-identical to the corrected independently reviewed version.

A separately recomputed `issue5Presentation` runtime family records the new plain
and staging bytes. All20historical tuples remain unchanged. Exact byte/edition,
prior-navigation and prior-CSS mixed negatives remain rejecting; Color/staging/
build checks pass31/31, including cold closure reconstruction. Six new static
checksum dispositions are append-only, each proved against the recomputed public
runtime. A scoped lint check also found the top-level reader exceeded the existing
complexity limit by one. A cohesive embedded-resource collection helper and
behavioral IMG/link/duplicate/conflict checks fix this without an exception.
Navigation/offline/Color/build/staging checks then pass75/75; scoped ESLint has
zero errors/warnings. Output was regenerated before pinning final tuples.
No detect-secrets scan or full staging/security pass is claimed by that proof. A full local preflight also exposed an existing content-classifier assumption:
all publication inventory rows were required to be content-eligible, including
unchanged SVG/provenance sources introduced by this article. The bounded fix
preserves those non-content rows exactly before/after, rejects their addition,
change or deletion through the content route, and leaves unsupported changed
source paths on the full platform route. Shape/owner and non-publication policy
guards remain. Root independently reviewed that comparison and boundary;
content-baseline/profile-selection checks pass30/30, including both previously
failing scenarios with all real artwork/provenance present. Reflexivity, new/
changed/deleted unsupported rows and unsupported changed source are exercised.
The `d501d6ce` source CI subsequently passed754/754 (62modules,170920ms under
the original180000ms limit); navigation and all15 automated issue criteria
passed. Its hosted four room cases passed, but article smoke correctly failed
an observer bug: a valid numeric-leading HTML heading ID was used as a raw CSS
selector. The observer now compares decoded literal IDs over a static `[id]`
selection and retains the exact count1 assertion. Missing/duplicate and numeric,
punctuation and Unicode targets have negative/positive regressions. Runtime,
article, PDF and public layout bytes are unchanged by this observer correction.
The full real-article journey passes all5original cases before the next hosted
run: normal1440/390, Off390, no-Canvas390 and no-JS390. Both normal cases include
numeric TOC/deep refresh/history and PDF keyboard/close/navigation cleanup.
The review Chromium153.0.8010.0 observation is retained in the candidate bundle;
it is local diagnostic evidence, not a managed hosted CI pass.
The native15-page PDF viewer was also visibly painted and closed in the actual
hosted Chrome preview; physical Safari/iPad remains a separate device gate.
Final current-source CI/preview results belong in the live owners.

## Style and acceptance mapping

CS01/02/04: article metadata/manuscript remain in `site/publications`, media in
`site/assets`, bounded validation/render in `tools/publishing`/`tools/site`,
layout in canonical CSS and viewer template. No raw HTML/iframe authoring channel.
CS03/05: touched declarations/functions are readable authored source; output is
regenerated. CS06/07: one cancelable session, finite fetch timeout/byte bound,
no new animation loop, object URLs disposed. CS08: meaningful mutation/path,
offline completeness and stale-session negatives; existing profile routes and
budgets remain. CS09/10: style guard, catalogue/RI/CI reconciliation and the
independent source/artifact reviews above; guard alone is not full acceptance.

| Criteria | Automated evidence route | Remaining acceptance |
| --- | --- | --- |
| #5 AC01–AC12 | Selected issue5 policy: BASIC, STYLE-GUARD, CURRENT-RI, RI-CI, PUBLISHER, READER, DELIVERY | Original named human/editorial/rights/device/upstream/merge gates remain open. |
| #5 AC13–AC15 | WRITING-CATALOG, CONTENT-RELEASE, CONTENT-CI plus shared reader/delivery | Revalidate against final head; keep original intent/budgets. |
| #2 AC01–AC03 | Real manuscript/assets, complete PDF/platform kits, independent visual review | Author/editorial approval, rights and exact accepted presentation edition. |
| #2 AC04–AC06 | Draft isolation and edition/source records | Actual publication decision/event and upstream UA PR113 disposition. |
| #2 AC07–AC08 | Previously accepted recording increment | Unchanged accepted scope; not proof of the new article's publication. |

## Issue synopsis

Recovered and completed the real article's technical review package in PR79.
Viewer lifecycle, navigation harness and contents numbering findings are fixed;
original social covers are downloadable separately. Fresh final CI/preview links
belong in both live owners. Review-only PDF/browser and native-device limits are
explicit. No merge, stable-stage promotion or production/external release.

## Reader revision after author feedback — 15 October 2026

Input: the author reviewed immutable preview `ac5b73ac` at raw source
`713e0d50adf66b59e3c81155da17fb215a8ef53f`. The embedded presentation did not
work in their browser; they rejected its duplicated introduction and the
generated `source-1` through `source-25` bibliography. This supersedes the
earlier request to embed slides for this article. The same #2/#5 execution
route and original acceptance gates remain.

Independent reader review inspected the whole manuscript. A separate adapter
review traced the duplication to automatic viewer replacement, an authored
presentation block and an unconditional metadata bibliography. The revised
article uses one ordinary named PDF/recording paragraph, with the PDF URL
rewritten to the verified same-origin immutable PDF in the native reader.
There is no embedded PDF or poster in this edition. The existing shared viewer
capability and its historical/default tests remain available to other articles.

The finite optional `profile.reader` policy selects `presentation: links` and
`references: inline`. Inline references must cover every declared metadata
source with meaningful link text. Metadata IDs, edition identities and pending
rights decisions stay in their canonical manifests; the reader footer keeps a
short attribution. Missing/duplicated presentation links, missing source links
and unsupported policy values are rejected instead of silently losing evidence.

The editorial pass preserves all six chapters, three diagrams and all 25 source
URLs. It removes repeated framing/cautions, explains Golden Set at first use,
shortens the conclusion and replaces the duplicated bibliography with two
further-reading paragraphs. Reader text falls from 3,148 to 2,783 words (11.6%).
No new research claims or source URLs are introduced. The source remains a
review candidate: `pmday-ai-both-sides-en-review-20261015-r2`; the earlier
edition record is preserved.

CS01/02/04: manuscript and explicit reader policy own content choices; adapters
and templates consume validated inputs. CS03/05: no inline styles or runtime
changes; focused source formatting. CS06/07: no new browser state, fetch loop or
resource budget. CS08–CS10: current profile/renderer and no-JS checks, bounded
style guard, independent reading/export review and regenerated RI/CI mapping.
Current-source local/hosted results and the final immutable preview belong in
the live PR79/#2/#5 records. Earlier embedded-viewer evidence above is historical,
not evidence for this different presentation choice.

Revision verification: independent scoped adapter/code review found no blocking
defect; profile/publisher/site/offline checks passed 51/51. A second pass corrected
the Medium upload instructions so the unused slide poster is not assigned a
nonexistent body position; the complete declared resource inventory remains.
The publishing suite passed 14/14 and final touched JS lint reported zero errors
or warnings. Local Basic passed its 25 focused checks and ordinary package,
geometry, syntax and size checks; the bounded style guard passed.

Four direct-reader observations (1440/390 with/without JS) verified one same-origin
PDF link serving the exact original deck SHA256, one recording link, no inline
viewer or technical bibliography, no horizontal overflow or page errors. The
current diagnostic is `reader-links-observations.json` in the article candidate.
All 12 revised article PDF pages and every kit/source/producer checksum were
independently inspected; the candidate README owns exact current identities.

The producer-only change alters the generated runtime descriptor even though
all five JS/CSS files are byte-identical to `713e0d50`. Independent cold generation
confirmed this and added the separate `issue5ReaderLinks` plain/staging pair,
preserving all 22 earlier tuples and 11 families. Focused Color/build/staging
checks passed 32/32 and checksum guards passed 8/8; exactly three public checksum
dispositions were appended. This is not a new security scan or runtime speed
measurement. Fresh hosted/source acceptance remains separately recorded in PR79.
