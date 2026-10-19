# Issue 5 — 2026-10-19 editorial reader refinement

Owner [issue5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issue5-editorial-reader-20261019),
same Draft [PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Prepared from884c60c24556cf4170916d02ef6ccad0cf7c165f; exact final source/run is linked in PR79.
Main82b57b8 and all existing editorial commits are preserved.

## Intent and acceptance

User accepted the second UX review and requested implementation through preview.
Independent agent ux_reader_review acted as UX/source reviewer, not a human designer.
The initial review used live dark desktop1363×936 and existing390×844 CI screenshots;
mobile quote behavior was inferred from source, not claimed as physical device evidence.
Medium's official editor distinguishes header/subheader and ordinary/pull quotations;
Ghost's official cards distinguish dividers and callouts. These support role clarity,
not a claim that the proposed pixel sizes are platform measurements.

References: https://help.medium.com/hc/en-us/articles/215194537-Using-the-story-editor
and https://ghost.org/help/cards/ .

## Findings and decisions

| ID | Evidence / implication | Treatment | AC |
| --- | --- | --- | --- |
| E01 | H3 close to body/strong; repeated prompts compete with headings | Shared body19/18px, H2 31/26px, H3 23/21px; quieter explicit prompt role | AC08/11 |
| E02 | Existing H2 separators useful but heading spacing weak | Retain thin rule, group with heading, preserve after an endnote | AC08/11 |
| E03 | Attribution detached and same size as quoted text | Generic quote figure with attached15px caption and all original citation links | AC08/11 |
| E04 | Dense nested TOC; long mobile opening | Native per-chapter Subsections disclosure; compact mobile intro/tags | AC08/11 |
| E05 | Further reading appears to continue the conclusion | Explicit trailing H3 endnote, outside its argument chapter | AC08/11 |
| E06 | Independent source review found endnote role could extract apparatus or reorder early-chapter text | Reject appendix/nontrailing roles; render immediately after its own chapter; regression cases added | AC08/11 |

No manuscript prose, canonical semantic edition, original media, PDF, platform
renderer, scene/orbit or navigation lifecycle is changed. Whole-body bold emphasis
is preserved; rewording/removing emphasis remains an editorial decision.

## Execution tasks

| Task | Owners / result | Check | Status |
| --- | --- | --- | --- |
| T01 | reader.css shared responsive typography and chapter/quote/prompt/endnote styles | Desktop/mobile hosted evidence | Source verified; hosted pending |
| T02 | tools/site/reader.cjs and profile reader.elements generic canonical AST blockDigest roles | Synthetic unrelated text, parity/citation/grouping, stale/wrong/duplicate role negatives | 19/19 reader/profile passed |
| T03 | Native nested Contents details use existing disclosure snapshot/history/print cleanup | Existing lifecycle tests plus hosted anchor/history | Source passed; hosted pending |
| T04 | Exact current Color identity binds new producer/CSS; four JS files unchanged | Current plain/staging byte closure; historical rejection contracts retained | Passed locally; hosted pending |
| T05 | Generated docs/previews, catalog, RI/CI and same Draft PR preview | Basic, style, RI, owning policy, hosted smoke | Passed locally; hosted pending |

The endnote role selects a unique final H3 group in a main H2 chapter; quotation
attribution binds the immediately following paragraph. Digests use canonical AST
serialization; identical prompt nodes share one explicit profile declaration.
No phrase recognition, publication-ID layout selector, extra runtime dependency,
request, observer or clock is introduced. Native links/details and all anchors remain.

## Acceptance evidence and limits

CS01/02/04: source roles live in profile, presentation in the shared adapter/template;
canonical block digest owner is shared with profile validation. CS03/05: CSS-only
responsive appearance, existing paint/palette owners, maintained formatter.
CS06/07: no navigation/clock changes; original byte budgets retained.
CS08/09: meaningful role/order/negative tests, bounded style guard and hosted profile.
CS10: original AC08/11/12 and issue scope anchor retained; no whole gate redefined.

Prepared-source checks: reader/profile19/19, focused reader/profile/Color/browser-evidence/
staging-regression66/66, Basic16 plus Color10, RI28 and RI/CI20, formatter and
bounded style guard passed. Four JS runtime files are byte-identical to the prior
reader family; only CSS and renderer producer identity change. Canonical document
and preview exports were regenerated. Clean-source owning policy and hosted results
will be linked from PR79 after commit; no hosted pass is claimed at this checkpoint.
The first broad local policy on clean b1820e5 (same tree as hosted b16081c)
passed8/11 checks and failed CONTENT-CI, CONTENT-LANES and DELIVERY. It exposed
catalogued generated snapshots using the builder rather than source-contract owner,
a missing new-family publication-rights admission and a stale production test ID.
Corrected the owner records, extended mandatory rights admission to all three new
runtime editions and updated only the current production expectation. Historical
runtime tuples and all negative checks remain. This failed run remains failed.
A failed interim current-tuple test retained old reader-family expectations; update
only current fixtures/registered identity, retaining historical tuples and all budgets.
Physical Safari/iPad, whole-PR review, editorial/rights/PDF, accepted-platform staging
and real content/production publication remain separate open gates. PR stays Draft.

## Issue synopsis

Shared editorial reader refinement prepared in PR79; original manuscript/PDF preserved.
Independent review's endnote-order/apparatus gap corrected with negative regressions.
Exact final source, check results and preview are linked from the owning issue/PR.

## Integration correction checkpoint

The four affected integration modules passed90/90 after correction; current
formatter, bounded style, RI and RI/CI checks pass. Independent final source review
confirmed no remaining bounded reader blocker, both endnote sibling selectors and
unchanged four-script closure for plain/staging/production tuples.
First hosted sourceb16081ce21335c6462eeaafc488c714c4f7c4d8d / tree
5b214095228959f87b05e6f5cd7e149a7b6190cd built and deployed successfully in
CI39302216434. [First preview](https://c93bd71b.oborskyi-author-ci-staging.pages.dev/articles/ai-changes-both-sides-of-software-engineering)
was directly inspected in dark desktop1363px: body19/H2 31/H3 23/quote21/caption15px,
no horizontal page overflow; quote attribution and restrained chapter boundary seen.
Public ZIP12212139422 downloaded and SHA256 verified
`db20ab86dff940ea51fdbbec5411b1b0d4a264f7e7c793f665282f048eea5965`;
it binds source/tree/public digest3cfea516a49b00916167ec833c2d93c4735320d54238098e0d67781d7806455d.
The correction changes catalog/test/rights-admission bookkeeping only; all article,
CSS, generated documents and runtime bytes match that hosted source. Corrected-head
policy and hosted smoke are still pending at this checkpoint; final source-qualified
results and the latest preview belong to the PR/issue evidence anchor.
