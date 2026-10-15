# PMDay article candidate — 15 October 2026

Execution: PR #79; article owner #2; publisher owner #5.

- `article.pdf`: 12-page full English article, readability revision `r2`, with
  four displayed figures and one compact presentation/recording link paragraph.
- `publication-kit.zip`: verified HTML/Markdown/TXT/copy-ready LinkedIn and Medium
  renditions, launch draft, SEO metadata, ordered images, article PDF, separate
  presentation PDF and source/render manifests. The Medium upload list contains
  the four displayed images in manuscript order. The unused presentation poster
  remains a declared resource, outside that ordered upload list.
- `social-covers.zip`: original landscape and square upload masters, provenance
  and a verified byte/hash manifest. These larger upload images are separate
  from the efficient site/platform-rendition images in the publication kit.
- `article-journey-observations.json`: historical five-case browser diagnostic
  for the earlier article revision, before the readability changes.
- `viewer-observations.json`: historical Chromium 153.0.8010.0 observations for
  the earlier embedded-viewer version. The current article uses ordinary links.

## Artifact identity and independent review

The current publication-kit artifact is
`879a2bff51d9a6f286541cad35d42fad82d84591e8502338310b726ac0ad1b8a`.
Its content edition is `pmday-ai-both-sides-en-review-20261015-r2`, with manuscript
SHA-256 `01d3360b7a19ef3ce4a3aa2d941e5f7f92512dba7ecbcdb7bdaf1240c82e367a`.
Its ZIP contains all 33 files from the exact generated artifact directory:
32 declared outputs plus the root manifest. The publishing `verifyKit` check,
every output checksum/byte count, current source/producer checksums and ZIP
integrity were independently verified. The separate article PDF is byte-identical
to the PDF in the kit.

- Article PDF SHA-256:
  `1f34fc12423864a188e5cada2201090a7bacd8a7924a2dffbf10a1ccbe99ff71`
  (349,933 bytes, 12 pages).
- Publication ZIP SHA-256:
  `ab74259d3d6a7e757c4fbaad58682cda999ae9ef8b8997a78c3f7d3d1af7d0a0`
  (1,767,916 bytes).
- Social-cover ZIP SHA-256:
  `02da46d31072fc9c5b1fea393b8a4f5d3d7f6fa8756e5008f51ee9b78ababe59`
  (4,104,141 bytes; four files).

The actual article PDF was rendered by the explicit `@sparticuz/chromium` 153.0.0
review producer using the locked publishing Playwright. It is `reviewOnly:true`,
not the managed-CI browser proof retained separately for the technical fixture.
The source manifests honestly retain `working-tree-review` with no Git commit/blob
binding; this package is not current-head managed-CI proof.

After the readability edits and final publisher helper change, an independent
export reviewer regenerated the complete kit, rendered every current PDF page
with Poppler at 110 DPI and visually inspected all 12 pages. No clipping,
overlap, missing glyphs or broken images was observed. The established first
page retains the title and linked contents; the last page contains the short
Further reading section. The article displays neither the former presentation
poster/viewer nor the repeated source-ID bibliography.

The independent package check compared every declared output's byte count and
SHA-256, every current source/producer checksum, the PDF/manifest pair, and all
33 ZIP members against the generated directory. The original presentation PDF
is byte-identical to its declared source. The social-cover ZIP remains
byte-identical to its earlier review bundle and records its original kit artifact
ID in its own manifest; its cover masters and provenance have not changed.

Artwork originals and editable SVGs are in
`site/assets/publications/pmday-ai-both-sides/`; the landscape and square masters
in its `source/` directory are reusable upload covers. Their provenance remains
with the article. Existing v35 deck credits/rights and event-edition limits apply.

The historical viewer diagnostic does not prove the current article's reader
behavior. Current hosted/source checks are recorded in PR #79 and its dated
review. Actual Safari/iPad review remains separate.

Single-file offline export remains subject to the unchanged 800KB-gzip budget.
This deliverable is the complete multi-file/PDF kit.

These are review candidates, not publication events or an accepted canonical.
Final author/rights/publication/upstream decisions remain with issues #2/#5/#7.

Current link-only reader observations are retained in `reader-links-observations.json`.
They cover 1440px and 390px with and without JavaScript, one same-origin PDF link
with exact original bytes, one recording link, no embedded viewer or technical
bibliography, no horizontal overflow and no page errors. This is a local
review-browser diagnostic of the prepared source, not hosted CI acceptance.
