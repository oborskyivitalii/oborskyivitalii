# Issue 5 — 2026-10-19 calm reader

Owner [issue5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issue5-calm-reader-20261019),
same Draft [PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Base1139b38a6707bab9b7718aecd143736c39b8e7ce; prepared source is dirty until committed.
Implementation/self-review by the primary agent; fresh independent UX audit by
reader_product_audit. Independent bounded implementation review by calm_reader_review completed after corrections.

## Intent and acceptance

Maintainer accepted the fresh Product Design audit and requested implementation
through PR preview. Previous functional/editorial component passes did not establish
acceptance of the overall reading composition. The new audit used fresh desktop
1363px dark screenshots of the opening, SDLC, expanded Contents, body and ending.
It did not validate mobile, contrast ratios, screen readers or physical Safari/iPad.
Current implementation preserves manuscript, semantic edition, original media,
PDF and the existing Writing same-scene orbit. Issue2 retains editorial ownership.

## Findings and decisions

| ID | Evidence / implication | Treatment | AC |
| --- | --- | --- | --- |
| C01 | Header combines subtitle, SEO abstract, author, tags and status before the essay | Keep title/subtitle and compact byline/status; summary remains metadata | AC08/11 |
| C02 | Persistent nested rail repeats the essay and shifts its column to the right | One centered column; native closed flat H2 Contents at every width | AC08/11 |
| C03 | Nine-step bold paragraph wraps arbitrarily and competes with statistics/source links | Explicit source-bound process role; ordered steps, one emphasized step, responsive flow | AC08/11 |
| C04 | Tags interrupt entry | Existing index component mounts into closing tag slot | AC08/21/22 |
| C05 | Supporting reading, navigation, related reading and apparatus create several endings | Final endnote and recommendations share a heading; sources/rights remain grouped; navigation last | AC08/11 |
| C06 | Dense emphasis/link presentation | Preserve authored words and semantic emphasis; reduce visual weight and use one restrained underline style | AC08/11 |

The process role uses a declared separator, label and zero-based emphasis index.
It binds one exact canonical paragraph, accepts only text/emphasis children and
2–12 nonempty bounded steps, rejects lost links/code, stale/duplicate bindings,
unknown fields and invalid indices. It never recognizes a publication ID or phrase.
The ordinary print/platform renderer remains unchanged. Mid-article endnotes keep
their chapter position; only the final main-chapter endnote enters the closing area.
Its words, anchor and citations remain; recommendations are optional index data.

## Execution tasks

| Task | Owners / expected result | Check | Status |
| --- | --- | --- | --- |
| T01 | Shared article/Contents templates and reader.css: calm column and header | Hosted1440/390 screenshots | Prepared; hosted pending |
| T02 | Shared reader adapter/profile: reusable process and closing composition | Semantic/source parity, escaping, negative process bindings | Focused32 passed |
| T03 | Reader lifecycle: closed by default, history restoration and native/print preserved | Disclosure/history/cleanup tests and hosted anchors | Local passed; hosted pending |
| T04 | Existing article-tags component: footer slot and one reading heading | Cache/refresh/cleanup tests and hosted screenshot | Local passed; hosted pending |
| T05 | New exact runtime family and unchanged scene; current source checks | Color identity/rights/Basic/RI/policy/CI | Prepared; checks pending |

## Acceptance evidence and limits

CS01/02: authored template/CSS and AST adapter own shared presentation; the profile
owns explicit content selection. CS03/04: palette/reading-paint owners remain;
CSS alone controls responsive process/column layout. CS05: maintained formatter
and bounded touched-owner changes. CS06/07: native disclosures reuse lifecycle,
print/history/disposal; no new clock, observer, request or runtime dependency.
Existing bytes and frame budgets remain. CS08/09: behavioral/negative tests,
style guard, exact-source policy and existing two-width hosted journey.
CS10: dated issue authorization, same Draft PR and unchanged whole acceptance gates.

The old intermediate component verdict remains historical; this increment addresses
the later holistic UX findings. All prior raw failures stay failures. Source/hosted
results below will identify the exact final commit/tree and remaining review limits.

## Issue synopsis

Shared reader simplification prepared in PR79: one column, optional flat Contents,
source-bound process, closing tags and consolidated supporting reading. Whole
editorial/rights/PDF/device/whole-PR/staging/live-publication gates remain open.

## Independent implementation correction checkpoint

Read-only reviewer calm_reader_review found two P2 defects, both corrected before
preview: closing tags/endnote lacked route-wave ownership after moving outside
the body, and an explicit italic opening process could be consumed as inferred
subtitle. Shared closing route units/separators and explicit-role precedence now
preserve those contracts. The suspected obscured endnote anchor was withdrawn:
global scroll-padding already protected it; reader-specific margin is retained.
The reviewer reran32/32 reader/profile/tag tests and independently verified
normalized PMDay manuscript word/order parity, unchanged AST,44 citations and44
returns, eight images, one process, no duplicate IDs or missing fragment targets.
Reviewed prepared diff SHA2562038beac41520c94f39b0a88c757964c94bb3c8fa7bb79d5381e5edf854100d6.
This is bounded source review, not whole-PR, browser/device or publication acceptance.
Related-departure observation follows the actual outer route owner containing
recommendations; its positive departure assertion remains mandatory.

New family issue5CalmReader registers separate plain/staging/production tuples;
mandatory rights admission includes all three. Theme and scene runtime files are
byte-identical to the prior family. Navigation changes only reader disclosure
and closing-wave inventory; archive changes only tag/recommendation placement.
No scene, camera, clock, performance budget or original negative tuple is changed.

## Prepared source checks

Reader/profile/tags32/32 and the combined reader/profile/tags/Color/staging/scroll
suite112/112 pass. Basic16 plus Color10, bounded style guard, RI28 and RI/CI20
pass. Formatter found only the Python-refreshed RI/CI map's layout; canonical
formatter correction follows, with no policy meaning or source budget change.
Initial RI invocation lacked its required config argument; a later prepared RI
test rejected deleted generated paths still in the unstaged Git inventory. These
attempts are not passes. Correct invocation and staging the generated inventory
resolved them; build/verify and28/28 now pass. Hosted/exact clean-head policy is
still pending. No changed manuscript, edition, media or PDF is present in the diff.

## First hosted correction — shell footer ownership

Source69a1a7fddf3c797bda329beecb1dde6544b1be30/tree56309e739d3edc79094698b014f082cd95c6f58c
passed clean owning policy11/11 with evidence_valid:true and no errors.
CI39310741620 built and deployed successfully, but hosted smoke FAILED before
reader capture: the tag journey observed0 versus4 tags. The failed run stays failed.
Live DOM showed the new nested footer being moved outside the article by the
router's existing global footer lookup, also preventing related hydration.
The closing wrapper is corrected to a neutral div, retaining CSS/classes and
route ownership. Native article tests now enforce the single global footer and
main containment of reader discovery slots; browser count is scoped to the article.
Independent source re-review confirmed the dependency and correction. The earlier
bounded source pass missed this whole-document selector dependency; hosted evidence
is required and its failed result was not described as a stale test.

First immutable previewfe5886ba was directly inspected at1363px dark: centered724px
body, closed flat Contents, compact header and separated nine-step process with code
emphasis; no page overflow. These observations do not cover the broken footer or
mobile. Initial public ZIP12215009556 was downloaded and verified SHA256
d911aa7470a15670745560a9f5f8bd3a741b79534b9e02f2f9ace31fbceb57ea.
The correction reuses the exact admitted runtime tuple: all four scripts, CSS and
base engine remain byte-identical to69a1a7f. Only the article document changes.
Corrected exact policy and hosted results are pending.
Independent correction review reran the strengthened native case1/1 and found no
remaining bounded source consequence; correction diff SHA256
6ae683118e3b1969a8aefe3a2c2add922a043f9ddf272ff73045317054c76bfa.
