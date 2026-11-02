# R26 native review package — 23 October 2026

Editorial owner: [issue 2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2).
Execution: [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79), issue 5.
See [the integration and independent review](../2026-10-23-r26-integration.md).

## Deliverables

- [The_Sum_of_Our_Technology_R26_2026-10-23.md](The_Sum_of_Our_Technology_R26_2026-10-23.md): exact recovered, approved R26 manuscript; also the canonical source under `site/publications/pmday-ai-both-sides/`.
- [The_Sum_of_Our_Technology_R26_2026-10-23.pdf](The_Sum_of_Our_Technology_R26_2026-10-23.pdf): newly rendered 21-page native review PDF.
- [The_Sum_of_Our_Technology_R26_2026-10-23_Native_Review_Kit.zip](The_Sum_of_Our_Technology_R26_2026-10-23_Native_Review_Kit.zip): all 34 files from native kit `e6d32f0ab08d2d1c84f3f08a808ea1e31e1d2488965c18d9f74cbdd54ae00060`, with unchanged manifests and full output closure.
- [artifact-evidence.json](artifact-evidence.json): exact source, semantic, producer, artifact, archive and member identities plus known limits.

## Use the native kit

Extract the archive before opening `article.html`, `print.html` or ordinary platform HTML so local resources resolve. `linkedin-copy-ready.html` and `medium-copy-ready.html` embed their images. HTML, Markdown, TXT and copy-ready variants are equivalent article renditions, with table rows transformed as declared by the existing publisher. Open `launch-post.md` separately: launch wording remains an authored draft requiring its own final review before posting.

The article contains **four figure positions**, in order: cover, slide 3, slide 9 and slide 12. The package also carries an **auxiliary presentation-cover image** for the deck resource; it is not a fifth article figure. The generated upload inventory lists five packaged assets. Follow the four visible article placements when assembling an article in a platform editor. `presentation.pdf` remains the separate original deck.

All 49 numeric citation markers preserve their intended external destinations. The two `[31]` links deliberately differ: the title explanation points to Lem's book page, and the quotation points to its translation source. The three figure-credit `[1]` markers are outside that 49-link count.

## Production and review limits

The complete unmodified `loadArticle`/AST → `renderKit` → `printArticle` → verification path generated this package. The shared print CSS received bounded generic wrapping corrections. The managed Chromium download failed; the repository's existing explicit review producer ran Chromium 153.0.8010.0 via pinned `@sparticuz/chromium` 153.0.0. Manifests retain `managedBrowser: false` and `reviewOnly: true`.

Two PDF outline labels are duplicated by Chromium: `III. What If Not?` and `Review provenance`. Both destinations and the visible headings/Contents are correct; article text and citation links are intact. A proposed atomic-heading remedy was rejected after it worsened shared pagination. No manual PDF patch was applied.

Article status is `review`, rights are `review-pending`, canonical is null, and accepted source commit/blob pins remain null. This package establishes source preparation and bounded technical review, not native LinkedIn/Medium editor acceptance, physical-device acceptance, publication, stable-stage promotion or merge. The prior R23 originals remain unchanged. The archive contains only the fresh native kit; private correspondence and the earlier private review archive are not part of this delivery.
