# R27 native review package — 23 October 2026

Editorial owner: [issue 2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2).
Execution: [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79), issue 5.
See the [feedback analysis, correction and independent review](../2026-10-23-r27-feedback-and-reader.md).

## What changed

R27 adds a concise Olivier Leturcq contribution record, revision/citation metadata and a matching separately authored launch acknowledgment. The article's argument and all source qualifications are byte-identical to R26. Two substantive editorial proposals remain in the analysis for the author's choice; the provenance records feedback, not acceptance or incorporation. The prior R26 package and all earlier editions remain unchanged.

## Deliverables

- [The_Sum_of_Our_Technology_R27_2026-10-23.md](The_Sum_of_Our_Technology_R27_2026-10-23.md): byte-exact R27 canonical manuscript.
- [The_Sum_of_Our_Technology_R27_2026-10-23.pdf](The_Sum_of_Our_Technology_R27_2026-10-23.pdf): 21-page native review PDF.
- [The_Sum_of_Our_Technology_R27_2026-10-23_Native_Review_Kit.zip](The_Sum_of_Our_Technology_R27_2026-10-23_Native_Review_Kit.zip): all 34 files from native kit `3deebdbf052a2ad3616ae6ba7ea70d35c4e4c09a2e75713379f0aedfb82e154e` with their original manifests and resources.
- [artifact-evidence.json](artifact-evidence.json): source, semantic, producer, output/archive/member identities and review limits.

## Use the native kit

Extract the archive before opening `article.html`, `print.html` or ordinary platform HTML so local resources resolve. The LinkedIn/Medium copy-ready HTML files embed their images. Each platform has equivalent HTML, Markdown, TXT and copy-ready renditions; the existing platform table-row fallback is retained. `review.md` retains native Markdown tables and local images. Open `launch-post.md` separately: it is an authored draft requiring its own final review before posting.

There are four visible article figures: cover, slide 3, slide 9 and slide 12. A fifth packaged image is the auxiliary presentation-cover resource. `presentation.pdf` is the separate original deck, not the article PDF. All 49 numeric citation targets, including the two distinct contextual [31] links, remain as in R26; the three figure-credit [1] markers are outside that count.

## Verification and limits

The unchanged native `loadArticle`/AST → `renderKit` → `printArticle` → `verifyKit`/`verifyPrintPair` pipeline generated and verified the full kit. Independent Code and White-box reviews verified native/member/source identity. Exploratory QA viewed all 21 actual PDF pages, checked all 49 numeric citation targets in the PDF and six HTML forms, followed all 23 HTML Contents entries and checked all 23 PDF Contents and 24 outline destinations. Both copy-ready forms retained four embedded images, all 49 numeric URLs and the provenance/history in actual local rich-text copy/paste. The original independent receipts are preserved in the linked review artifact. Public-facing site/runtime bytes and the print component are unchanged by this iteration.

The existing explicit review producer uses Chromium 153.0.8010.0 / Playwright 1.63.0. Manifests retain `managedBrowser: false` and `reviewOnly: true`. The historical failed managed-browser download was not repeated for R27; no managed/hosted admission is inferred. Two existing native outline-label cosmetics remain: duplicated `III. What If Not?` at the correct page 13 destination and duplicated `Review provenance` at the correct page 21 destination. Visible headings and Contents labels are correct; no manual PDF postprocessing is used. Local clipboard observations do not establish acceptance in LinkedIn or Medium's own editors.

Status remains `review`, rights `review-pending`, canonical null and accepted source commit/blob null. This package and the separate READER correction do not establish editorial acceptance, real LinkedIn/Medium editor acceptance, physical-device acceptance, publication, stable staging or merge. The archive contains only the fresh native kit; private correspondence is excluded.
