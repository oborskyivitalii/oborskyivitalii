# Article authoring and review workflow

Issue #5 owns the reusable publisher; each publication keeps its editorial and
rights owner (PMDay: issue #2). This workflow prepares review candidates. It does
not publish the site or post to LinkedIn or Medium.

Prepare an optional source-bound [public-materials allowlist](ARTICLE-MATERIALS.md)
for the common reader. Only explicitly public review-bound files and observed
publication links render under “Materials and other formats”. Working campaign
briefs, posts and review notes stay repository-only. This optional feature and
the separate campaign in issue106 never gate publication of the article itself.

On 13 October the author deferred the real PMDay article until its author-approved
chapters are supplied. The existing PMDay manuscript, blueprint and exports are
technical test artifacts for the publisher. They do not establish editorial
acceptance of issue #2. Its accepted recording increment remains separate.
On 15 October the author supplied the real article's opening arc, confirmed
English and the usual delivery/engineering leadership audience, and requested a
detailed first draft. That [editorial draft](../drafts/pmday-article-draft.en.md)
now owns the proposed prose, chapter structure, figures and evidence for review.
The existing selected publisher fixture remains separate and unchanged.
For this article, the author requests descriptive source hyperlinks in the site
prose, retaining a final source list. Other platform treatments will be decided
when preparing those adaptations.
The [content release guide](SITE-CONTENT-RELEASE.md) explains automatic Writing
registration and verified platform reuse when adding an article or external link.

## Current PMDay candidate — 15 October 2026

The author requested the full six-chapter article, finished visuals, an embedded
presentation and social preview artwork. The real manuscript now lives in
`site/publications/pmday-ai-both-sides/manuscript.en.md`; the earlier file in
`drafts/` is an editorial checkpoint. `pmday-two-shifts` remains the frozen
technical fixture. Both are explicit review-preview selections; neither enters
the default public catalog until its publication gates are satisfied.

The optional `presentation` declaration pins one article-local PDF (maximum2MB),
its poster, title and HTTPS source. The site offers an on-demand, hash-verified
PDF viewer with native open/download links, cancellation and object-URL cleanup.
Print/platform kits retain the poster/source link and a separate `presentation.pdf`.
An optional profile `reader` policy can select `presentation: "links"` instead:
the manuscript then supplies exactly one named link to the declared PDF source
and omits its poster figure. The native site rewrites that link to the pinned
same-origin PDF; print/platform exports retain the compact manuscript links and
the separate PDF. `references: "inline"` omits the generated ID bibliography and
edition identifier when every declared reference already has a named manuscript
link. The reader still shows the publication's rights notice; manifests retain
the complete edition, source and provenance records. Unselected policies retain
the existing viewer and source-list behavior.
The shared website reader owns H2 chapter breaks, H3 typography, native
progressive Contents and quotations. Optional `reader.elements` declares up to50
web-only roles by `sha256` of the admitted top-level AST block using
`blockDigest` from `tools/publishing/semantic.cjs`: `prompt` for a paragraph,
`quotation` for a blockquote and `endnote` for a trailing H3 group. Identical
prompt blocks share one explicit declaration. A quotation can declare an
`attribution` block digest; it must be the immediately following paragraph and
is grouped into the quote's caption without changing its text or citations.
Endnote H3 content becomes a separate supporting-reading block after its chapter.
Unknown, duplicate, stale or mistyped bindings fail; manuscript changes require
reviewing and refreshing affected declarations. The adapter never infers roles
from specific words or from bold formatting. Print/platform renditions retain
the original AST and prose. Omitting these roles keeps ordinary article styles.

No author-supplied HTML or general iframe channel is enabled. Small declared PDF
resources can travel in bounded offline exports; a complete article plus deck
that exceeds the existing800KB gzip limit is rejected with a hosted-edition route.

The optional profile `print` selection binds native layout to admitted AST blocks
using the same `blockDigest`. `titleBlock` names `subtitle` and `byline` paragraph
digests immediately after the leading title; HTML/print moves those exact paragraphs
into one header. `keepTogether` names up to50 individual paragraphs or tables;
`keepWithNext` names up to50 paragraphs followed by another paragraph or table.
Bindings must be unique, current and type-correct. Existing declared `prompt`
roles keep their first answer paragraph when this print selection is present.
Adjacent keep-with-next bindings form one group. No grouping is inferred from
words, emphasis or table length. Native Contents nests H3 under H2 and uses the
declared trailing appendices as a separate supporting group. Different authored
adaptations do not inherit full-source print bindings. Markdown/TXT retain their
complete source order. Copy-ready HTML hides navigation and the generated summary,
so selecting all visible document content includes title, subtitle and byline.

## Contract and verification design

One `site/publications/<id>/manuscript.<language>.md` owns the full article.
`publication.json` declares stable identity, language, author, summary, source,
rights, source references, ordered media and platform selections. Unknown fields,
unsafe URLs, traversal, linked source aliases and undeclared images fail closed.
Blueprints and review documents do not enter reader output.

Content edition records contain source identity and substantive derivation only.
Their canonical semantic SHA256 also pins title, summary, authors, language,
research references, declared translation lineage, ordered figure bytes/alt/caption/credit and rights notice.
Observation state, canonical URL, formatting profile and independently authored
platform revisions are excluded. A meaningful metadata or figure change needs a
new edition. `semanticDigest` and `adaptationDigest` in the publisher calculate
these pins; an adaptation declares its base edition and base semantic digest.
Render manifests contain producer, dependency/browser versions, asset and output
hashes. Publication events append actual observed URL/date and evidence; they do
not rewrite editions or render manifests. A working-tree review has explicit
`working-tree-review` provenance and cannot claim a committed accepted edition.

`loadArticle(root, id, { assetUrl })` is a synchronous CommonJS facade. It returns
validated metadata, HTML, sections, assets, source, edition and a bounded model.
The facade invokes one isolated ESM Markdown AST compiler; the browser receives
only generated semantic HTML. Headings, source links, figures and GFM tables use
that model for site, print and distribution adapters. Raw HTML, embeds, Mermaid
code and undeclared resources are rejected with named diagnostics; diagrams must
be generated explicitly into declared local raster media before article render.
Fenced examples and escaped pipes remain AST content rather than line transforms.
Markdown outputs use the exact-pinned maintained AST stringifier, preserving
literal punctuation, embedded backticks, nested lists and hard breaks. Authored
JSON/Markdown decoding rejects invalid UTF-8 rather than replace source characters.
Header-only tables, task controls and inline figures have named rejection messages.

Kits retain the byte-exact authoring source in `article.md`. The separate
`review.md` is a full-article reading rendition: GFM tables remain tables, local
image paths replace asset tokens, and authored captions/credits follow figures.
Keep its `images/` directory when sharing it. LinkedIn/Medium renditions retain
their existing labelled-row fallback; do not substitute them for the review copy.
Optional asset `reviewNote` text holds administrative context in `INSTRUCTIONS.md`,
outside reader captions and credits. It cannot replace required attribution or a
rights decision. Notes are bounded, input-hashed render metadata; they do not
change the semantic edition, whose public captions/credits remain pinned.

Each article declares `profile.json`: exact platform formats and relationships,
authored launch source/digest, SEO title/summary, cover and hero asset roles or
authored omission reasons, and optional authored review character bounds. These
are render artifact inputs; they cannot hide new argument prose in a renderer.
Kits contain exact launch Markdown, selected furniture and explicit omissions.
The initial raster contract accepts declared PNG sources; SVG/Mermaid masters
remain internal inputs until an explicit renderer produces a declared PNG.

Before implementation, the selected checks are: two distinct Markdown profiles;
GFM escaped-pipe and fenced-table examples; duplicate/Setext/Unicode heading IDs;
inline-code/reference-heading links; raw HTML/unsafe links; path and source-pin
negative cases; draft/frozen-edition distinction; adaptation identity; kit output
corruption and installation rollback. PDF negatives cover undeclared/network
resources, missing dependency/browser, source mutation, output aliases and pair
installation rollback. Real PMDay HTML/PDF/platform comparison and independent
editorial/rights/visual review remain separate from automated functional tests.
Applicable style rules are CS01–CS10: canonical content/CSS/template owners,
explicit dependency direction, readable bounded adapters and exact-source checks.

## Authoring and publication sequence

1. Record audience, purpose, language, argument, sources, figures and unresolved
   editorial decisions in the owning issue and complete blueprint.
2. Read the whole blueprint and manuscript before a substantial iteration. Write
   coherent sections, reread the whole article, reconcile transitions and claims,
   and update the blueprint. Research corrections return to their canonical owner.
3. Declare per-item author/rights/credits and pinned public source references.
   Use `asset:<id>` Markdown image links to declared images, with matching alt text.
4. Freeze substantive source into a content edition. A review can retain null
   commit/blob; accepted content requires exact committed source provenance.
5. Follow [site-first distribution](#site-first-distribution): prepare the stable
   destination and complete platform/launch exports now, preserving pending
   publication state. Authored adaptations retain their own source/edition.
6. Review HTML, PDF and platform candidates against source/rights. Verify the
   [LinkedIn Article cover](#linkedin-article-cover) before handing off its kit.
   Record actual
   editorial/visual acceptance separately; checksums identify bytes only.
   Before release, verify the article's intended Writing year/topic placement and
   filters in ordinary HTML and the browser, even while publication is pending.
7. Publish the website through the existing release/controller and verify the
   exact served edition before recording a canonical URL, actual date or event.
8. The author publishes LinkedIn and Medium manually after website verification,
   in either order. Observe both actual article URLs/content and website backlinks,
   then add both reciprocal materials together in one content-only website update.
   Preserve prior editions/artifacts; substantive changes need new editions.

### LinkedIn Article cover

The distribution renderer needs the pinned Pillow interpreter used by
[publication media](../tools/quality/README.md). Use `SITE_MEDIA_PYTHON` to select
it explicitly, or install the repository toolchain in its standard venv.

| Destination and role   | Repository export and placement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| LinkedIn Article cover | Separate `linkedin/cover.jpg`, 1920 × 1080 JPEG, at most 2,000,000 bytes. Fit approved artwork without cropping on a neutral canvas with at least 5% margins on each edge. Upload it in the native cover slot, then check crop and legibility in the editor and thumbnail before publication. An explicitly coverless edition has no native cover file.                                                                                                                                                                              |
| LinkedIn inline        | PNG, up to 1920 × 1920 and 2,000,000 bytes per image. Fit to those bounds without cropping or enlarging. Upload in figure order at the corresponding story positions.                                                                                                                                                                                                                                                                                                                                                                |
| Medium featured        | Separate `medium/featured.jpg`, fitted JPEG up to 1600 × 1600 and 2,000,000 bytes. If the same artwork occurs in the manuscript, the featured JPEG serves at that figure position. Otherwise it appears as the leading image. Select that image as featured in the editor, check the preview and set the focal point where needed.                                                                                                                                                                                                   |
| Medium inline          | PNG, up to 2000 × 2000 and 2,000,000 bytes per image. Fit without cropping or enlarging. Upload in figure order and retain alt text, caption and credit.                                                                                                                                                                                                                                                                                                                                                                             |
| PDF                    | Preserve the print layout and source artwork. The [print resource contract](../tools/publishing/print-resource.cjs) admits PNG, JPEG, WebP and SVG plus declared styles/fonts, with at most 5,000,000 bytes per image, 16,000,000 aggregate bytes and 64 declared resources. Check effective pixels per inch at the rendered placement. [Adobe's 300 ppi guidance](https://helpx.adobe.com/photoshop/desktop/crop-resize-transform/resize-adjust-resolution/resolution-specs-for-printing-images.html) is a print-quality reference. |
| Author site            | Preserve authored reader geometry. Use [reader media and transfer budgets](../site/README.md#versioned-public-files-and-navigation) (2,000,000 bytes per hosted asset and 800,000 bytes of required-reading transfer). The [social preview](SITE-SEO.md#current-canonical-content-reconciliation) is a separate fitted 1200 × 630 JPEG.                                                                                                                                                                                              |

[LinkedIn's article guide](https://www.linkedin.com/help/linkedin/answer/a521719/)
recommends 1920 × 1080 and crops covers to 16:9. It supports JPEG/JPG, PNG and WebP
covers, plus GIF (fewer than 400 frames) inline. The
[older FAQ](https://www.linkedin.com/help/linkedin/answer/a522463/) gives a 10 MB
article-image limit and conflicting older cover geometry. The export follows the
current article guide and the repository bounds above.

[Medium's editor](https://help.medium.com/hc/en-us/articles/215679797-Using-images)
accepts JPG/JPEG, GIF and PNG up to 25 MB. Width of at least 1192 px enables every
placement option. [Featured selection](https://help.medium.com/hc/en-us/articles/215680047-Setting-a-featured-image-on-your-post)
requires an image already in the story. The featured canvas is fitted to the
artwork, with no imposed aspect ratio. Check placement in the editor when an
image is narrower than 1192 px.

Run `node tools/publishing/cli.cjs verify <artifact-directory>` before handoff.
Keep the original digest-named directory or pass `--expected-id <sha256>` from
the original render when the directory was renamed. Retain that ID separately
from the files being verified.
New kits decode each platform upload and its selected source, and check format,
dimensions, bytes and hashes,
including agreement with the platform HTML and the ordered upload inventories.
Each platform's unique upload files have a combined 20,000,000-byte bound. Use
the platform inventory to recover images dropped by copy/paste, then confirm
captions, credits and alt text in the editor. The generic kit cover, hero and
review images retain the source artwork. Selected platform artwork must be
a complete, single-frame PNG with normal orientation. JPEG preparation uses
sRGB, including ICC conversion and supported PNG gamma. For other declared
primaries, supply an ICC profile or convert the source to sRGB. Convert cICP
color before generating a derivative. The exporter selects a neutral matte
against visible cover colors. If none preserves contrast, supply a cover with
an authored background. For inline fitting, grayscale transparency keys
are converted to explicit alpha before resampling. A 16-bit RGB PNG with a
transparency key needs conversion to explicit alpha before deriving a new
upload. The generated instructions
identify which file each platform profile selected.

Pre-platform kits retain their original
integrity verification contract.

### Site-first distribution

For new site-first publications, declare `profile.distribution` with authored
single-line `originalLabel` and `materialsLabel`. The publisher derives the stable
article destination from `site/publications/policy.json` and `publication.slug`:
`productionOrigin/articles/<slug>.html`. Keep that slug stable once copies are
shared. A later address change requires an explicit redirect/continuity decision.
No parallel URL registry or placeholder public page is needed. Historical profiles
without this opt-in preserve their earlier packaging contract.

The ordinary planned backlink and stable `#article-materials` destination are
added as labelled distribution furniture to all selected HTML, Markdown, TXT
and copy-ready formats. They are outside manuscript/print/semantic content and
count toward the authored platform character limits. Launch source must include
`{{SITE_ARTICLE_URL}}` and `{{SITE_PDF_URL}}` or those exact destinations; generated
launch MD/TXT resolves the tokens. Source hashes retain the authored launch;
manifest distribution data records the planned destination/state. Rendered copy
is preparation, not a statement that the page is already live.

Keep `canonical`, actual publication dates and events pending until existing
exact production-artifact/served-byte validation succeeds. The production edition
already emits the stable HTML canonical; planned copy links never satisfy that
validation or authorize a deployment. Campaign `articleUrl` remains observed-only.
An accepted local article's catalog `presentation.archiveYear` may place it in
the intended Writing year before that observation. It controls archive grouping
and filtering only; it supplies no publication date, time element or event.
Observed edition dates take precedence for site-first articles. A migrated record
with a dated historical platform edition retains its declared archive year after
the site date is observed. Without either, the row remains undated.
After accepted website proof, publish both platforms manually, check actual text,
images, credits and the website backlink, and record their actual URLs/dates using
existing source-bound publication events. Opted-in platform events must name the
real platform host and follow website inspection for the corresponding base
edition. CI cannot operate or prove the author's native-editor actions.

Hold reciprocal items private/unapproved while collecting observations. The
opted-in materials block admits either no platform pair (initial website release)
or both reviewed LinkedIn/Medium links together, each bound to an actual matching
platform-edition event and pinned observation. Add the pair through one existing
content release; no manuscript/PDF change or new content edition follows from
links alone. The later platform dependency never blocks initial website release.

Existing permanent publisher/profile/material/history suites enforce preparation,
pending-state separation, malformed/stale proof refusals and pair admission. They
run through the existing registered PR-targeted/staging/production source routes;
no second workflow/controller, native posting bot or new browser matrix is added.

Events name a content edition and typed immutable artifact reference with manifest
and document hashes. A site event binds the coherent production site artifact and
actual reader alias under `site/publications/policy.json`, not print-review HTML.
Commit/tree, content/semantic edition, complete public inventory and observed
HTTP/URL/digest inspection must match. A platform event binds its distribution
candidate's declared HTML, Markdown, TXT or copy-ready document and actual inspection; native-copy equivalence remains a
separate explicit editorial observation. Canonical and actual dates stay pending
until matching observed events. Appending uses exclusive creation. The history
checker compares committed events and frozen editions against their original Git
records, rejects rewrites/deletions, and fails on shallow or truncated history.
Its bound is 100 commits changing edition/event records, not ordinary site commits.

## Candidate commands

```sh
node tools/publishing/cli.cjs validate pmday-two-shifts
node tools/publishing/cli.cjs render pmday-two-shifts
node tools/publishing/cli.cjs verify dist/publications/pmday-two-shifts/ARTIFACT_ID
node tools/publishing/cli.cjs render pmday-two-shifts --pdf
```

The PDF command is explicit. It consumes prepared print HTML plus its source
sidecar, exact repository root and declared local resources. The adapter blocks
network/file resources, validates Git source pins and finite byte/count bounds,
checks font/image completion, then installs PDF plus manifest with a retained
transaction journal and recoverable rollback. `recoverPrint` resolves a retained
transaction; failure reports recovery paths instead of claiming restoration.
Whole-kit verification rejects linked files, excessive inventories and digest/path
forgery before reusing an existing immutable artifact.

## Toolchain and upgrade boundary

The build-only dependencies are exact-pinned in `tools/publishing/toolchain/`.
Run `npm ci --ignore-scripts` there to reproduce the lock; an HTML build does not
install Chromium. PDF export is an explicit separate command using that installed
Playwright and its declared browser. No ordinary render fetches moving upstream
sources, npm packages or network resources.

`toolchain/licenses.json` inventories all locked dependencies and their declared
licenses. Managed Chromium installation failed in the October 12 execution
environment because its CDN returned invalid empty archives. The inspected PDF
candidate therefore uses an explicit review producer with the exact npm
`@sparticuz/chromium` 153.0.0 archive, actual Chromium 153.0.8010.0 and recorded
archive/package/binary hashes. It is marked `reviewOnly`; the default adapter has
no browser substitution. This historical candidate does not prove the normal
managed-browser path. PDF bytes are not claimed reproducible.

The explicit managed diagnostic runs the ordinary publisher CLI, then verifies
the complete kit and actual PDF/manifest pair against the locked Playwright,
Chromium version/revision, browser executable and source checksums:

```sh
node tools/publishing/toolchain/node_modules/playwright/cli.js install chromium
node tools/quality/article-print.cjs pmday-two-shifts /tmp/article-print-review
```

It requires a clean exact checkout and preserves the fixture's declared
`working-tree-review` provenance. Its separate report binds that checkout's commit
and tree; it does not invent frozen commit/blob pins or editorial acceptance.
The output directory contains the PDF, print manifest, kit manifest and report.
The PR79 preview smoke and its explicitly selected bounded regression reuse their
existing managed browser installation and upload these files as a separate
`site-article-print-*` artifact. Draft prototypes defer this check. It does not
change public output, stage aliases, browser matrices or existing job budgets.
Exact successful run and visual-inspection status belong to
[the managed-print record](../review/issue-5/2026-10-14-managed-print.md).
The 14 October run completed the normal managed export and all-page visual review;
its original PDF, manifests and report are retained in the linked evidence ZIP.

`tools/publishing/origin.json` and `NOTICE.md` name the minimal extracted UA helper
baseline, hashes, licenses and site changes. The Quartz bootstrap and Thinking
Systems Figure 3/8 modules are not publisher dependencies. An upgrade reviews
old/new refs, licenses and behavior, reruns both profiles and the real article,
and records the new toolchain/artifact identities. Code licenses do not resolve
publication-specific rights or select a site-wide license under issue #7.

### Tags and related reading

Assign discovery tags in `site/content/article-tags.json`: `records[recordId]`
for external archive publications, `articles[articleId]` for a local article.
Use the shared vocabulary; do not duplicate a local article's assignment in its
catalogue record or manuscript. Missing, unknown and duplicate tags fail public
index generation. Initial archive assignments are reviewable topic classification,
not a new claim about research validation or edition equivalence.

The single browser component reads `publication-index.json` and updates chips,
Writing's tag filter and related reading. Tag-only base generation reuses every
old HTML/runtime byte and updates the index; new articles still need their own
reader, Writing and sitemap. Without JS/file/network metadata the complete native
reader and Writing remain available. Existing edition binding/admission and the
independent production publisher still follow their own release contract.
