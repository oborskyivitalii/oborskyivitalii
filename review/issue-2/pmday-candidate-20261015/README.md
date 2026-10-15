# PMDay article candidate — 15 October 2026

Execution: PR #79; article owner #2; publisher owner #5.

- `article.pdf`: 13-page full English article with five declared images.
- `publication-kit.zip`: verified HTML/Markdown/TXT/copy-ready LinkedIn and Medium
  renditions, launch draft, SEO metadata, ordered images, article PDF, separate
  presentation PDF and source/render manifests.
- `social-covers.zip`: original landscape and square upload masters, provenance
  and a verified byte/hash manifest. These larger upload images are separate
  from the efficient site/platform-rendition images in the publication kit.
- `viewer-observations.json`: local Chromium 153.0.8010.0 review observations.

## Artifact identity and independent review

The corrected publication-kit artifact is
`3c31e78189977072258f6b56ffa6d6e19e66109a02bc353fa5b6891d19b2a029`.
Its ZIP contains all 33 files from the exact generated artifact directory:
32 declared outputs plus the root manifest. The publishing `verifyKit` check,
every output checksum/byte count, current source/producer checksums and ZIP
integrity were independently verified. The separate article PDF is byte-identical
to the PDF in the kit.

- Article PDF SHA-256:
  `2efc7d8cb6e2a559724db5d3022c3b48d9d67fddcb215e01c57be20a024aeb8a`
  (409,747 bytes, 13 pages).
- Publication ZIP SHA-256:
  `fa2f802b2f4fee5aaf86c92b462844efadeb75d046227a651d11af75743fb850`
  (1,914,745 bytes).
- Social-cover ZIP SHA-256:
  `02da46d31072fc9c5b1fea393b8a4f5d3d7f6fa8756e5008f51ee9b78ababe59`
  (4,104,141 bytes; four files).

The actual article PDF was rendered by the explicit `@sparticuz/chromium` 153.0.0
review producer using the locked publishing Playwright. It is `reviewOnly:true`,
not the managed-CI browser proof retained separately for the technical fixture.
The source manifests honestly retain `working-tree-review` with no Git commit/blob
binding; this package is not current-head managed-CI proof.

An independent reviewer visually inspected all 13 pages, both cover masters and
all three diagrams. No clipping, overlap, missing glyphs or broken images was
observed. Duplicate generated TOC markers were then removed from hosted and print
CSS. Corrected page 1 was visually re-inspected; pages 2 through 13 were
pixel-identical to the already inspected PDF when both PDFs were rendered with
the same MuPDF settings. The first page retains generous white space before the
full cover on page 2.

A later profile-formatting correction changed the kit's source checksum without
changing its prose or artwork. The complete kit and standalone PDF were
regenerated; all 13 resulting pages are text-identical and pixel-identical to
the corrected, visually inspected PDF under the same MuPDF settings. PDF metadata
and its byte checksum changed. The social-cover ZIP remains byte-identical to
its earlier review bundle and records its original kit artifact ID in its own
manifest; its cover masters and provenance have not changed.

Artwork originals and editable SVGs are in
`site/assets/publications/pmday-ai-both-sides/`; the landscape and square masters
in its `source/` directory are reusable upload covers. Their provenance remains
with the article. Existing v35 deck credits/rights and event-edition limits apply.

Local viewer checks cover zero initial PDF requests, keyboard activation,
verified Blob opening, close/navigation object-URL cleanup, 390px overflow,
no-JS native links and rejection of mutated PDF bytes. Native PDF plugin painting
is not proven by this headless review browser; actual Safari/iPad review remains.

The complete article/deck exceeds the existing 800KB-gzip single-file offline
budget; the exporter explicitly rejects it. Use the hosted reader or this
multi-file/PDF kit. No budget was raised and no material is silently dropped.

These are review candidates, not publication events or an accepted canonical.
Final author/rights/publication/upstream decisions remain with issues #2/#5/#7.
