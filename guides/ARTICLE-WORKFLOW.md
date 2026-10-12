# Article authoring and review workflow

Issue #5 owns the reusable publisher; each publication keeps its editorial and
rights owner (PMDay: issue #2). This workflow prepares review candidates. It does
not publish the site or post to LinkedIn or Medium.

## Contract and verification design

One `site/publications/<id>/manuscript.<language>.md` owns the full article.
`publication.json` declares stable identity, language, author, summary, source,
rights, source references, ordered media and platform selections. Unknown fields,
unsafe URLs, traversal, linked source aliases and undeclared images fail closed.
Blueprints and review documents do not enter reader output.

Content edition records contain source identity and substantive derivation only.
Their canonical semantic SHA256 also pins title, summary, authors, language,
research references, ordered figure bytes/alt/caption/credit and rights notice.
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
5. Generate one complete kit into staging, verify all bytes and install the whole
   directory. An authored LinkedIn adaptation has its own source and edition with
   an explicit relationship to the full article; formatting profiles add no prose.
6. Review HTML, article PDF and platform candidates against the source/deck/rights.
   Record human acceptance separately. A generated checksum proves bytes only.
7. Publish site-first only through the existing release decision/controller. Set
   a usable canonical URL after actual served-page acceptance. Until then kits
   say canonical pending. Medium copy instructions require manual image upload;
   inspect the actual published text, figures and canonical afterward.
8. Append publication/correction events with actual URL/date and observed evidence.
   Preserve every prior edition/artifact. Substantive revisions create new editions.
   Classify feedback as editorial, conceptual, provenance or empirical; route
   material research feedback upstream before changing its publication adaptation.

Events name a content edition and typed immutable artifact reference with manifest
and document hashes. A site event binds the coherent production site artifact and
actual reader alias under `site/publications/policy.json`, not print-review HTML.
Commit/tree, content/semantic edition, complete public inventory and observed
HTTP/URL/digest inspection must match. A platform event binds its distribution
candidate and declared actual inspection; native-copy equivalence remains a
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
no browser substitution. A managed-browser job still needs its own successful
installation and exact-source proof. PDF bytes are not claimed reproducible.

`tools/publishing/origin.json` and `NOTICE.md` name the minimal extracted UA helper
baseline, hashes, licenses and site changes. The Quartz bootstrap and Thinking
Systems Figure 3/8 modules are not publisher dependencies. An upgrade reviews
old/new refs, licenses and behavior, reruns both profiles and the real article,
and records the new toolchain/artifact identities. Code licenses do not resolve
publication-specific rights or select a site-wide license under issue #7.
