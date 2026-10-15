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
