# Generic article reader and repeatable media preparation

Owner [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5), same
[Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Maintainer scope correction: issue5-template-scope-20261019, 19 October 2026.
Role: source self-review, not independent or editorial acceptance.

## Intent and preserved work

Finish the common template while the actual article remains in another chat.
Original #5 AC01–AC20 and #2 editorial/rights gates remain. This increment does
not accept the PMDay manuscript, its cover, a PDF or any publication event.

The concurrently imported Cover02/R12 work through
`794287b26d020d2f22473e99aed165c2d9126156` is preserved byte-for-byte.
The adjacent preservation manifest records every existing protected input;
new synthetic reference files are separately authored technical test data.
Only the central rights inventory is refreshed to bind imported Cover02 source
hashes under the existing **article-review-input** basis. No clearance is granted.
Released main0098f804 is retained. No main merge or production/stable promotion.

## Findings and implementation

| Finding | Implemented owner / result | Acceptance boundary |
| --- | --- | --- |
| Generic delivery reconstruction followed unfinished editorial changes | The existing frozen technical archive fixture now declares its own isolated candidate selection | Tests prove reusable generation, not actual PMDay readiness; its live budgets and ARTICLE gate remain |
| Template preview needed a stable source | `site/article-template-preview.json` selects synthetic `reader-reference`; artifact records explicit `template` purpose | Source reconstruction rejects missing/substituted purpose; reference stays draft, excluded from production catalog |
| Web media needed repeatable preparation | Optional profile `reader.images: webp-lossless`; existing pinned Pillow12.3.0/WebP1.6.0; bounded PNG-to-WebP producer | Source bytes untouched; dimensions, every RGBA byte including transparent RGB and ICC bytes verified after decode; unsupported frames/color/orientation rejected |
| Hosted and offline resource identity differed after encoding | Derived immutable paths bind original and output SHA256, pixel/profile proofs and credits; offline MIME/hydration supports WebP | Existing rights/source/asset/HTML/complete-transfer bounds retained; corrupt bytes rejected |
| Draft preview previously omitted articles and browser evidence | PR79 Draft selects template and runs existing two-width Chromium smoke plus article journey | Other Drafts retain prototype behavior; full staging/independent review/promotion stay separate |

Unselected unfinished draft metadata no longer blocks an unrelated selected
article or ordinary five-room build. Selected and accepted owners retain their
full publisher validation. Print/platform publisher inputs keep original PNGs;
no media quality, dimension, asset, HTML or complete-transfer budget was relaxed.
An ordinary PDF download uses the existing `reader.presentation: links` option.

The synthetic figure is640×360 RGBA,4843B PNG →820B WebP, with exact RGBA equality.
This is a technical fixture size observation, not a claim about real article media.
The actual PMDay complete-transfer and standalone acceptance remains pending;
its current editorial profile was not opted into encoding on the author's behalf.

## Checks and style evidence

CS01–CS10 → #5 AC11. Source remains in the canonical reader, publisher and current
controller. No competing parser, runtime service, scene owner or animation loop.
Image data is finite, stdin-only and hash-checked; Python subprocess uses no shell.
Code formatting uses maintained Prettier3.6.2/Ruff0.16.10. Rights notices carry exact
resource provenance. Current Color tuples preserve historical families and the
licensed-resource discriminator. Browser behavior uses existing navigation and
article-journey ownership. These are self-review findings only.

Focused reconstruction/media checks passed9/9 before final rights-inventory and
production-rejection assertions were added. Current exact-head results are
recorded in PR79 after final verification, separately from this prepared-source
review. Required commands: owning issue5 policy (all10 mapped checks), Basic,
style guard/format, RI build+verify and RI/CI regressions. New permanent media
cases cover decode equality/ICC, corrupt source/dimensions/pixel bounds/frames/color,
explicit preview purpose, unfinished-source isolation, catalog/production rejection,
rights binding, cold reconstruction and native offline corruption. A separate
media-heavy complete-route negative keeps the original800000B limit effective.

The hosted CI run must be inspected for actual template article selection,
immutable package/HTTP identities, desktop/mobile/no-JS/theme/navigation evidence.
A green prototype or source check alone supplies none of those observations.

## Acceptance and next sequence

| Scope | Evidence route | Remaining gates |
| --- | --- | --- |
| AC03/04/07/08/10/11/12 generic platform | PUBLISHER, READER, DELIVERY, STYLE-GUARD, CURRENT-RI, RI-CI; current CI template smoke | Independent/device/complete staging requirements stay open |
| AC02 actual PMDay publication | Separate actual editorial preview plus ARTICLE gate | Final manuscript/media/rights, real budgets, PDF and publication decision |
| AC13/15 bounded catalog/classifier | Existing WRITING-CATALOG/CONTENT-CI checks | Existing ticks do not certify new production lanes |
| AC14 and AC16–AC20 production lanes | CONTENT-RELEASE reusable contracts plus accepted first baseline | Current-production reuse, independent lane admission, assembly/concurrency/rollback still pending |

1. Review the generic template preview and complete applicable platform admission.
2. When editorial source is ready, apply the same profile/reader contract to that
   exact article, verify real media/transfer/PDF/rights and obtain release acceptance.
3. Establish the accepted first platform/content/media baseline; implement the
   independently admitted content/media lanes and assembly concurrency under
   AC16–AC20. Static monorepo remains the selected architecture.
4. Continue #102 article-route analytics and #104 conversion tracking against the
   stable reader contract. Article writing stays outside this technical task.

Issue5 remains open and PR79 stays Draft. No whole AC is completed solely by a
synthetic reference or this self-review.
