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
`6982563a4cc8427c3691f438c9f882f3a2f6b4c91db1987c516b178407be0eee`.
Its ZIP contains all 33 files from the exact generated artifact directory:
32 declared outputs plus the root manifest. The publishing `verifyKit` check,
every output checksum/byte count, current source/producer checksums and ZIP
integrity were independently verified. The separate article PDF is byte-identical
to the PDF in the kit.

- Article PDF SHA-256:
  `4fc93039fc5a2609fecee658a90e45e4bcba2003a4888ceee8138461ebbef7f2`
  (409,747 bytes, 13 pages).
- Publication ZIP SHA-256:
  `c741fa2e2ae0be0ce186be5e876a076d737594c27471ffadaae3fa05c5c64bd9`
  (1,914,710 bytes).
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
