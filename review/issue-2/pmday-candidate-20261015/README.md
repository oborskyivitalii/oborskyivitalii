# PMDay article candidate — 15 October 2026

Execution: PR #79; article owner #2; publisher owner #5.

> **Current pending editorial successor:** [draft revision 0.8](../../../drafts/pmday-article-draft.en.md), **The Sum of Our Technology — AI Changes Both Sides of Software Engineering**, with its *What if not?* narrative and the added **socio-technical Human Authority architecture** argument. The **seven-slide** assembly remains exact. Historical 0.5/0.6/0.7 sections below are not current instructions. PDF/kit identities on this page still describe rendered **r2**, not this draft.

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

## Editorial revision 0.5 — screenshot assembly handoff

**15 October 2026; author-requested next draft, not a regenerated artifact.**
Owning issue: [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2).
Execution remains [PR #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79),
primary publisher owner #5. Reviewer: drafting assistant, self-review only;
no new independent, human or publication acceptance is claimed.
Inspected head: `0a0acbf56941e3c04a24ff1362c9b47b071b5b58`,
tree `1e33741c9052901c3f185648cb1658c26e6aeb7b`; main `9b82f382`.

### Intent and decisions

The author explicitly requested entering the sharper chat proposal into the
existing PR draft and using more actual presentation screenshots, specifically
the SDLC bottleneck slide, with instructions for Astra/Sol. The updated
[draft revision 0.5](../../../drafts/pmday-article-draft.en.md) is the next assembly
input. It supersedes the older draft 0.4 for that purpose. The canonical manuscript,
PDF, kit, cover files and the frozen technical fixture remain unchanged in this
edit; the artifact identities and earlier reviews above still describe r2 only.
The current preview therefore does not yet display revision 0.5.

### Findings and dispositions

| ID | Finding / AC | Disposition |
| --- | --- | --- |
| F01 | Earlier shortening weakened the evidence and authorial argument; #2 AC01/AC02 | Restored the agreed chat prose, quantitative evidence and qualifications in the excluded draft; approximately 2,544 reader words, six chapters. |
| F02 | Generic diagrams underused the selected deck; #2 AC01/AC03 | Five numbered placements select full v35 slides 3, 5, 10, 12 and 13, with source pin, page indices, asset names, alt text, captions and no-crop/interpretation guards in the draft. |
| F03 | Draft and existing rendered r2 could be confused; #2 AC04/AC05 | Explicit reader/assembly boundaries and an ordered same-PR handoff; no publication or regenerated-image claim. |
| F04 | New draft/review bytes invalidate RI freshness; repository protocol | Full-source runner and RI regeneration remain pending. Do not carry forward earlier green checks as checks of this edit. |

### Materials and actual checks

Read the current draft, candidate/artifact route, owning issue, repository
instructions/map and exact deck-review identity. Locally extracted the PDF from
historical managed public-review artifact `11978557714` (run `38746661454`), then
matched its 663,363 bytes and SHA-256
`b3fa9fb0220a6620db0b28ac3d560b987791be0dfb6cdd02c53c04975d881782`
to the current pinned deck-review record. Rendered and visually inspected all
five selected pages with PyMuPDF; the source PDF is unchanged. This establishes
screenshot selection and page identity, not new article-layout acceptance.

Local draft-only checks passed: six numbered reader chapters; five ordered
placement markers matching five assembly specifications; one opening PDF link;
no sandbox/local attachment URLs in the draft; preserved NBER figure tuple;
reader/assembly separation. The prior sharper proposal remains the prose base;
only figure instructions, emphasis and the unambiguous NBER link label changed.
The NBER exact-figure audit is inherited from the pinned presentation evidence,
not a new successful full-PDF retrieval.

No full repository checkout is available in this connector session; source
archive access failed. `node tools/quality/local.cjs`, mapped repository tests,
RI build/verify and new hosted/article/PDF checks were not run. Generated RI
views were not manually edited. Fresh RI and full-source checks are required
before readiness; no current-head all-green result is asserted.

### Astra / Sol tasks and acceptance

| Task | Owner / check | Status |
| --- | --- | --- |
| T01 | Full checkout, live refs, RI build/verify and applicable source checks | Pending; first assembly action |
| T02 | Draft appendix → five exact PDF-page PNGs, media/provenance/catalog declarations | Pending; no new PNGs committed by this edit |
| T03 | Reader-only prose → canonical manuscript and blueprint; new semantic edition, historical r2 preserved | Pending |
| T04 | Publisher HTML/PDF/platform kit, five-image order, links, source/manifest and desktop/mobile/PDF visual comparison | Pending |
| T05 | Independent/editorial/rights/device review and actual #2 AC01–AC06 decisions | Open; author requested draft integration, not publication |

The complete per-figure and ordered implementation instructions live in the draft
itself, not just this chat. Existing MEMORY already routes the next session to
this candidate README; continue from this addendum and the draft rather than
reassembling the obsolete prose. Recording AC07/AC08 and #5 technical evidence
retain their original separate scope. No merge, stable staging, production or
external posting is performed or authorised by this handoff.


### Editorial revision 0.6 supersedes 0.5 — direct UA presentation review, 15 October 2026

The previous 'Editorial revision 0.5' section above remains **historical evidence only**, not instructions to assemble five screenshots. The currently selected input is [draft 0.6](../../../drafts/pmday-article-draft.en.md). The new [dated review and self-check handoff](../2026-10-15-editorial-draft.md#editorial-revision-06--visual-deck-audit-and-assembly-decision-15-october-2026) records the direct 15-slide visual comparison, source/metric guardrails and remaining checks.

**Current default:** seven screenshots, **3 / 5 / 7 / 9 / 10 / 12 / 14**. This adds the testable SDLC-equilibrium step and requirements boundary, substitutes post-release learning slide 14 for slide 13, and keeps the dense evidence slide 4 in prose/citations only. Page-to-asset correspondence, alt/captions, source hash, export commands, preservation rules and six ordered assembly tasks are in draft 0.6 itself. Planned PNG names in the draft are *not* a statement that images have been committed.

Canonical manuscript and all earlier r2 PDFs/kits remain unchanged by this editorial change. No current-source full checks, new figure rights decision or site/production publication has been completed. For the next Sol/Astra pass: read the latest draft, regenerate the seven exact PDF pages, migrate reader-only prose, produce new edition, and verify rights/CI/hosted/mobile/PDF before requesting author acceptance.


### Editorial revision 0.7 — current reading and Sol/Astra handoff, 16 October 2026

**Author decision:** edit English copy as a historical and engineering argument that repeatedly asks *what if not?*, rather than a blanket attack on current vendor methodology. Rename title as an allusion to Lem, keep old article title as subtitle; include [*Summa Technologiae* (1964)](https://english.lem.pl/works/essays/summa-technologiae) in named literature. The active [reader draft and detailed seven-slide specifications](../../../drafts/pmday-article-draft.en.md) supersede earlier 0.5/0.6 editorial inputs; the [dated versioned review](../2026-10-15-editorial-draft.md#editorial-revision-07--what-if-not-16-october-2026) records source claims and guardrails.

**Figure order unchanged** from v0.6: exact v35 pages `3, 5, 7, 9, 10, 12, 14`; all image generation/output remains a **pending** assembly step, not an already committed seven-PNG set. The revised article is excluded from the default site catalog. Neither historical `r2` HTML/PDF/kit identities nor preview were regenerated during this editorial-only pass.

**Priorities for next assembler:** (1) verify current PR79/main and ownership; (2) use ONLY ARTICLE START–END v0.7 reader text; (3) preserve the title/subtitle as the new edition's metadata, social/PDF headings and display, without prematurely changing the route/slug; (4) export seven exact full-page slide images with source/provenance/rights; (5) generate/render/check article + platform exports on current source, including narrow and PDF readability; (6) log independent/editorial/rights acceptance and pending release decisions in #2/#5. No merge, stable promotion, upstream changes, or external publication implicit.


### Editorial revision 0.8 — socio-technical Thinking Systems, 16 October 2026

**Current reading input:** [draft 0.8](../../../drafts/pmday-article-draft.en.md) and [versioned issue-2 editorial self-review](../2026-10-15-editorial-draft.md#editorial-revision-08--human-authority-as-an-architectural-dependency-16-october-2026). The author adds an explicit statement that consequential Thinking Systems require a **socio-technical operating stack**. In new chapter-5 subsection *The human is an architectural dependency*, "human in the loop" must be substantiated by staff availability, timely real decision rights, training, cognitive load, sufficient evidence, safe fallback, rehearsal and full cost; the hypothetical failed security escalation supplies a concrete \`What if not?\` example. Chapter 6 explicitly extends adopter economics to human capacity.

This changes **reader text and review/assembly guards only**. The existing seven source slides **3/5/7/9/10/12/14** remain; slide 12 and slide 14 captions/guards are grounded in the unchanged PDF and do not prove the socio-technical stack exists. Original r2 canonical manuscript, review PDF, media, cover and platform kit are unmodified. The new v0.8 still needs assembly, true visual acceptance, RI/source tests, rights clearance and author publication decision.
