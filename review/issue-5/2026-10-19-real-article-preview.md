# Issue 5 — 2026-10-19 real article preview

Owner: #5, dated anchor `issue5-real-article-preview-20261019`; Draft PR79.
Editorial/PDF/rights owner: #2. This is a prepared-state implementation review.

## Intent and acceptance

The user requested the real new article in the existing PR instead of the reader
fixture, then a preview for further editing before publication. This authorizes
native web adaptation of R12/Cover02, not substantive rewriting, PDF regeneration,
LinkedIn/Medium kits, merge or production activation. Original AC02/08/14 and all
editorial, rights, device and release gates remain in force.

## Findings

| ID | Evidence | Finding | Disposition |
| --- | --- | --- | --- |
| F01 | R12/Cover02 manuscript, import manifest and PDF | Current complete edition already exists in source | Preserve exactly |
| F02 | Initial full resource transfer | Counting the linked deck and PNG-derived cover exceeds 800000 bytes | Explicit bounded reader modes below |
| F03 | Independent pixel comparison | Existing 95454-byte JPEG and declared PNG have identical dimensions, RGBA, ICC and orientation | Reuse original JPEG bytes; no new lossy encoding |

## Decisions

The source manuscript, canonical asset declarations, semantic edition, original
images and PDFs stay unchanged. The reader profile selects seven lossless WebP
slides and a pinned equivalent JPEG cover. The adapter verifies every pixel,
dimension, orientation and ICC profile and records both canonical and rendition
identities. Additional rendition inputs are part of source reconstruction.

`presentation: download` is an explicit new mode: exactly one ordinary native PDF
link, no viewer, embed, preload or automatic load. The PDF remains in the complete
immutable, hash, rights, offline and resource inventory under the original
2000000-byte per-file cap. Its transfer is reported separately from required
reading bytes. Existing `links` mode retains conservative complete-transfer
accounting. Every displayed slide, including below-fold slides, still counts
against the original 800000-byte complete reading limit. Limits are unchanged.
The existing standalone HTML codec continues to reject JPEG explicitly. This
increment claims hosted/native online reading only; actual article standalone
export and offline codec support remain pending, with no runtime JS/CSS change.

This is a visible policy amendment for download-only resources; it does not claim
whole AC14 acceptance or user editorial/rights approval.

## Tasks and review

| Task | Paths / behavior | Check | Status |
| --- | --- | --- | --- |
| T01 | Explicit profile; verified JPEG; full media provenance | Adapter identity and mismatch negatives | Passed targeted checks |
| T02 | Download descriptor, HTML guard, sizes and rights closure | Native-link and forged evidence negatives | Passed targeted checks |
| T03 | Real preview selection, unchanged manuscript and edition | Source reconstruction and hosted browser | Pending final exact-source evidence |
| T04 | Independent implementation review | Existing independent reviewer; final small delta rechecked | No scoped blocker |

Applicable style: CS01–CS10; bounded source guard and pinned formatters, existing
module ownership, explicit finite fields, shared snapshot download validation,
original bounds, no new dependencies or runtime animation changes. Self-review
covers naming, failure paths and compatibility; independent review is separate.

## Acceptance evidence

Independent hosted/native review found no remaining scoped blocker. It verified
all8 rendered figures, the one native PDF link and full resource closure; all5
runtime JS/CSS files are byte-identical to the parent. Standalone JPEG rejection
is explicit. Self-checks: initial adapter/budget/workflow23/23, reader/offline/profile
41/41, Color/release/rights68/68; expanded real R12 rights/budget check passes.
Basic16 plus Color10, style guard and focused ESLint pass (the unchanged parent
producer complexity warning remains). Final exact-source policy and hosted-run
evidence will be recorded on PR79. A preview
is not staging admission, publication, editorial approval or rights clearance.

Final prepared hosted artifact: article HTML66458B, required reading transfer730846B,
optional PDF527746B. RI build/verify and28 tests, RI/CI verify and20 tests, maintained
formatting and original Basic checks pass. New Color family `issue5RealArticle`
retains the old runtime families; all5 delivered JS/CSS hashes remain identical.
