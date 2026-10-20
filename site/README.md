# Static site source and engine contract

The [current check profiles](../guides/SITE-CHECK-PROFILES.md) supersede older full-local
and always-full PR requirements below. Native-scroll mapping and all release
budgets remain. All five routes use the same inter-page camera/block transition.
The deliberate scroll-edge itinerary still follows the four header links.

The original engine work is recorded in completed
[#15](https://github.com/oborskyivitalii/oborskyivitalii/issues/15) and
[PR #16](https://github.com/oborskyivitalii/oborskyivitalii/pull/16).
Read [MEMORY](../MEMORY.md) and the live owning issue for the current source,
staging and release state; dated implementation plans are historical evidence.
The website still ships complete ordinary HTML. Canvas and the persistent router
enhance that HTML; a content editor does not need a server, CMS or browser build.

Within-page reading keeps each route's opening camera pose stationary, including
scrolling in both directions, Writing filters, anchors, history and reflow. The
fractal keeps its existing passive animation when motion is enabled on principal
pages. Settled articles retain their last scene paint without an ambient animation
loop; requested route transitions and motion preferences remain unchanged. Native range,
semantic markers and actual footer/bottom are still measured for content and edge
navigation; they no longer drive camera travel. All-route browser synchronization
checks verify stationary camera and unchanged native reading geometry; generation
freshness alone is insufficient.

## Authoritative sources and dependencies

| Source | Responsibility | Dependent output |
| --- | --- | --- |
| `templates/head.html`, `shell.html`, `templates/shared/*.html` | Shared structure and controls | All five HTML pages |
| `content/pages/<id>/metadata.json` | Title, description, structured metadata, ordered block names | That route |
| `content/pages/<id>/*.json`, `content/shared/*.json` | Bounded text, attributes, URLs and explicit template/block references | That route or shared header/footer |
| `templates/pages/<id>/*.html`, `templates/components/*.html` | Page-specific semantic layout and reusable publication/discussion markup | Declared route compositions |
| `content/catalog.json` | Primary editions, bounded alternates/discussions, presentation records, topics and labels; five featured selections | Writing; selected featured records also Home and shared labels |
| `publications/<id>/` | Authored article metadata, blueprint, manuscript, profile/adaptation and observed edition records under [ARTICLE-WORKFLOW](../guides/ARTICLE-WORKFLOW.md) | Validated article model; explicit candidate or eligible public document selection |
| `../tools/publishing/` | Build-only Markdown AST, provenance and PDF/platform adapters with a pinned toolchain | Article model and separate review kits; no browser parser or second deploy pipeline |
| `routes.json` | Contract 1: ordered five route IDs, native URLs, scenes and stop IDs | Runtime, pages and fallback |
| `engine/math.cjs`, `projection.cjs`, `lifecycle.cjs` | Math, projection and single Canvas/RAF lifecycle | Assembled `space.js` |
| `engine/renderer.cjs` | Ordered Canvas commands, adjacent-line batching and visible outlines | Assembled `space.js` |
| `engine/theme.js`, `archive.js`, `navigation.js`, `styles.css`, `critical-media.css`, `reading-surfaces.css` | Theme, filtering, routing and canonical presentation, including Home media fallback | Shared browser files and pages |
| `engine/scroll-entry.cjs`, `scroll-entry.css` | Native reading entry and opaque directional route-block departure/hold/arrival; router sequences completion and scene owns motion state | Composed `navigation.js`, shared stylesheet, hosted and standalone outputs |
| `scenes/world.cjs`, `paths.json` | Authored motifs, rest geometry and finite camera paths | Runtime and projected SVG fallbacks |
| `effects/flight.cjs`, `effects/*.css` | Current Color travel descriptor and canonical static reading/control CSS | Shared hosted/offline Color runtime |
| `effects/ribbons.cjs` | Optional historical comparison factory; not serialized into active Color | Explicit legacy diagnostics only; full scanner coverage remains |
| `../tools/site/effects.cjs`, `export.cjs` | Canonical effect source manifest, explicit delivery adapters and standalone export | Supported Color selection, scanner coverage and offline HTML |
| `assets/` | Existing portrait, cutout, favicon and `.nojekyll` source | Exact image/icon bytes |
| `analytics.json`, `integrations/cloudflare.cjs` | Optional production-only measurement under #8; disabled by default | Shared head and one separately hashed loader when enabled |
| `retained/` when explicitly imported | Previous verified immutable public files | Coherent prior snapshot support |
| `output-lock.json` | Generated, reviewed output hashes and dependency identity | Cache verification and freshness check |
| `../docs/` | Generated-only complete public output | Tested public artifact and offline exports |

This catalog migrates the existing public inventory. [SITE-SOURCE-AUDIT](../guides/SITE-SOURCE-AUDIT.md)
continues to own provenance; [SITE-SEO](../guides/SITE-SEO.md) owns discoverability and
[#7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7) owns rights.
It is not a second rights ledger or a new article renderer; #5 retains article adapters.

Curated HTML is validated before output changes. Executable tags/event attributes,
unsafe schemes and resource CSS are rejected; metadata is escaped for its actual
HTML context; JSON-LD cannot close a script. Only finite declared tokens substitute
blocks/publication fields. Templates and content never execute expressions. Authored
CommonJS factories are trusted code and require code review. They assemble into
one classic browser script, with no runtime dependencies or import requirements.

Page JSON has exactly `schema`, `template`, `text`, `attributes` and `urls`.
Talks' repeated event records live in `content/events.json`; the bounded event
renderer and `templates/components/event*.html` own their validated presentation.
Adding/reordering/editing an event is content work. A new presentation/schema is
platform work. Preserve existing group/event anchors and source-supported metadata.
Templates consume context-typed finite slots, blocks and catalog references;
values never execute expressions or supply raw markup. The renderer escapes each
output context and rejects unsafe URLs, duplicate/missing/unused references and
context mismatches. Repeated cards use the existing catalog and shared partials.
Catalog topics/labels derive archive controls and runtime labels; no content
parser or parallel publishing pipeline is delivered to the browser.

`tools/site/html.cjs`, `validate-catalog.cjs`, `render-content.cjs`,
`render-records.cjs` and `render-page.cjs` own pure validation/rendering.
`content.cjs` loads/composes declared inputs; `build.cjs` owns configuration,
hashes, cache decisions and transactional output. `fallback.cjs` owns pure SVG
rendering; the existing fallback CLI delegates to it without a producer cycle.
Pure camera basis/projection is shared by world/formula/Ribbon through the math
owner; clipping thresholds and lifecycle remain with their existing callers.

`engine/critical-media.css` is the sole responsive portrait media rule. The builder
inserts its exact bytes at the declared slot in the ordinary stylesheet and in
Home's generated head, so blocked external CSS still preserves narrow no-JS
reading. Other routes receive no critical block. Missing, duplicate or unsafe
owners fail before output changes; authored templates contain no CSS declaration.

Native links, anchors, language badges, full text and JSON-LD remain available
without JavaScript. The router's negative-tabindex main landmark retains native
arrival focus without a page-sized browser outline; interactive focus rings
remain in the common stylesheet. Contract 1 retains `SiteScene.navigate/refresh/detachTravel/canTravel`,
`SiteArchive.mount/destroy` and `SiteNavigation`. The router owns mount/unmount and
history; the scene owns route progress and its actual arrival paint. Ambient phase,
scroll/topic pose and route flight remain separate. Off/reduced, visibility, print,
failure, reflow and device-cost adaptation preserve the existing bounded behavior.
Runtime projection omits subpixel facets; static SVG/model output keeps the complete
geometry. Flights prepare each room at its settled adaptive detail before the
first painted flight frame. Each of at most three active/pending rooms caches
at most two detail variants; theme changes
repaint their color tables. No independent render loop or runtime dependency is added.
During principal-route flight, the two projected adjacent rooms stay within that journey's
source/destination interval. Distinct reader documents share Writing's canonical anchor:
the router explicitly requests a signed horizontal orbit around the centered Writing
fractal, using the existing camera clock and fixed400/1000/350ms legs. The camera returns
to the same reading anchor; canonical neighboring room weights preserve retarget continuity.
The router owns document/history direction, including Back/Forward; native anchors and
filters do not start camera travel. Published reader aliases accept the host
extensionless URL for native entry and Back; immutable snapshots still require exact filenames. Same-route scene cleanup without document intent stays instant. Complete room ink fades from zero at neighboring
reading-depth anchors to full visibility at its own anchor, in either direction.
Geometry is prepared before the first flight paint; pair and restoration switches
remove only zero-weight rooms, without exposing a room beyond the destination.

Reading entry observes existing stable semantic component shells and moves their
direct ink children and existing paper pseudo-element with the same finite CSS
animation. Publication rows retain their grid/filter/measurement identity; no
serialized wrapper or marker is added. Runtime ink spans serve text-only leaves
and are removed on disposal. Initial/restored visible blocks and bottom-overflow
candidates stay settled; lower below-fold blocks enter during ordinary downward reading and rearm after
a complete exit below the viewport, so a later downward visit reveals them again. Reading distance is 88px on desktop and 56px on narrow layouts; the global
block-motion duration, curve and sibling stagger are shared at every width,
with at most two local sibling delays and six active blocks; excess visible
entries use a finite queue that settles on interruption or missing animation events. No opacity change, permanent layer
promotion, per-frame style write or additional RAF is introduced.

`SiteScrollEntry` owns one persistent observer/session with explicit suspend, mount, resume,
settle and destroy paths. The router suspends before departure and resumes only
after the surviving route's actual arrival. Archive/reflow notifications reconcile
after native landing. `SiteScene.motionState()` and `site:motion-state` expose
effective readiness/motion without adding a preference writer. Off/hold/failure,
focus/find/anchors, large jumps, hidden/print/pagehide and unsupported APIs settle
native content. Focused active-frame geometry diagnostics reuse the existing
scroll-browser helper; physical-device and independent admission remain separate.

Route changes sequence three owners without another animation clock: the entry
controller first sends visible context units fully above the viewport (forward)
or below (reverse), holding native content during the camera journey. The scene
centers optical framing, travels through the existing rooms, restores the usual
reading framing and only then reports arrival. The controller assembles destination
units from below (forward) or above (reverse), then resumes ordinary repeatable
upward reading entry. Intro/hero/portrait, reading units and visible footer leaves
participate; persistent header and appearance controls remain usable. Each block's
sharp ink and existing paper share finite CSS animation; native shells/range stay
fixed. No whole-page opacity fade or depth-plane translation is used. The common
content frame clips transient visual overflow in both base and Color editions.

The issue69 bounded-preview amendment targets 3750 ms of complete motion on
any route: a 1000 ms departure wave, a 1750 ms camera journey (400 ms centering,
1000 ms depth travel, 350 ms restoration) and a 1000 ms assembly wave. Route
length and visible row count do not add serial waiting time. CSS owns the row
phase envelopes; runtime distributes directional starts within them. A single
root configuration in `engine/styles.css` owns the common 700 ms row
movement, 1000 ms phase and symmetric easing for departure and assembly. Single
rows use the whole envelope; multiple rows share the remaining 300 ms as stagger. Forward order is
top-first and reverse order bottom-first; native peers and separators move together.
Each row keeps its own complete paint clearance, and more than 24 visible rows
still falls back to native content. Ordinary reading entry uses the same 700 ms
movement and easing, plus the common 80 ms local sibling stagger. Only its
reading distance changes at the narrow breakpoint.
The maintainer approved the bounded preview continuation on 11 October and
authorized rebase, staging and merge. Current-source checks and the main staging
controller establish their own evidence; prior serial pacing reports apply only
to their own source. Physical-device and production gates remain separate.

The controller owns explicit depart/prepareArrival/arrive/cancel with bounded phase
and hold timers and current-session identity. The router leases the complete
sequence, yields the midpoint native mount and waits for camera restoration and
block assembly before focus/readiness. Cancellation, failure, motion changes,
hidden/print and native focus/find settle all transient content. Color's retained
Block transitions preference is the one control for route and reading-block
movement on all pages. The presentation owns its stored preference; the router
notifies the controller once, cancelling transient route state and releasing
reading layers. Re-enabling can arm untouched below-fold content without
replaying already visible blocks or resuming a suspended route. Its page-edge gesture gate
continues to require deliberate input at the actual boundary.

Current Color delivery uses only the travel effect. Issue61's explicit maintainer
decision removes ribbon construction, collection and painting on every route,
while keeping the thematic scene, Writing formula, shared reading/control CSS
and the existing navigation/clock/freeze behavior. Both hosted and standalone
Color identities declare `effects: ["travel"]`; optional ribbon adapters remain
only for explicit historical comparisons, with their source still scanned.
An optional `SiteEngineProbe` paint event observes successful ordinary native
paints for camera/journey diagnostics. It uses the existing clock and constructs
no frame evidence when the probe is absent; no independent loop is added.
Historical ribbon material/phase evidence remains attached to its prior edition.

Large inline titles retain native wrapping while their cloned backgrounds
extend0.16em around each fragment. An inner positioned ink span paints the
complete title above all background fragments; adjacent line spreads cannot
cover glyph bottoms. The exact text and explicit line breaks remain authored
content, with no added line-box padding.

The Writing room has one original outlined paradigm landmark, sourced only from
`assets/writing-paradigm.svg`. `tools/site/scene-assets.cjs` validates and compiles
it during generation. Renderer uses one fixed1380×240 raster cache and one native
sorted world-plane command with mild tilt, looped pulse and three shallow
extrusion layers. At most24 perspective triangle submissions use the same cache, with native
high-quality image sampling for minified glyphs. Each triangle submits a bounded
source rectangle, retaining exact affine coordinates and
triangle clips. An inverse-affine guard covers two CSS pixels of neighboring
source data; singular/extreme minification uses the complete bitmap. This changes
neither the world geometry nor the24submission/cache bound. Actual browser
visual/performance admission remains separate from source-area reduction.
All three layers use the same
world-haze opacity; extra translucent rear copies are omitted to avoid pale
ghost edges. The landmark uses 0.10 world-unit extrusion, keeping its projected
rear-to-front separation below half the nominal glyph stroke at representative
Writing entry/approach poses. The static SVG rendition follows the same shallow
geometry and layer opacity. Cache
bytes, triangle count and global Canvas pixel-ratio limits remain unchanged;
there is no separate content band or new clock/load/decode. Off/reduced freezes
the formula with its room; unsupported Canvas restores the projected scene SVG.
Asset and producer identity
invalidate the immutable runtime. Static/mobile and standalone renditions derive
from that source; diagnostics and issue #36's scoped evidence verify its bounds.

## Editing and deterministic generation

Edit the text/URLs in an individual block, for example
`content/pages/index/about.json`; its layout belongs to
`templates/pages/index/about.html`. Then run:

```sh
node tools/site/build.cjs
node tools/site/build.cjs --check
node tools/build_site_previews.cjs
python tools/build_site_bundle.py
```

Run from repository root. `--all` cold-generates every route; `--changed BASE`
validates a real commit baseline then uses current source fingerprints, never
Git path/mtime heuristics. `--check` cold-generates in temporary storage and rejects
stale public files, extra files or a stale lock. It does not fix outputs in CI.
All five offline interactive entry files embed all routes, so one content edit
regenerates those review files even when four hosted route bytes stay unchanged.
They remain a separate explicit export. A verified online content release can
reuse the platform without generating those offline files; see
[SITE-CONTENT-RELEASE](../guides/SITE-CONTENT-RELEASE.md) for commands and trust rules.

Each route signature includes producer, contract/configuration, shared templates,
engine/scenes/assets/analytics, its actual block bytes, selected catalog records, discussion references and structured order. A Home
block edit builds Home only; a featured edition builds Home and Writing; a shared
footer builds all five. A scene/code change is conservatively a complete closure:
all scenes share one browser bundle and all fallbacks consume the same model.

`.site-cache/build.json` is optional and untrusted. Reuse requires current source
signatures, the reviewed output lock, cache hashes and actual output bytes to agree.
Missing/invalid cache or lock regenerates. A forged cache plus edited HTML cannot
substitute for source; CI recomputes everything even if the lock is also edited.
The explicit content-release path instead requires a separately trusted complete
baseline lock, unchanged platform inputs and exact current-source content proof.
Ordinary builds retain their cold-source checks. A forged or incomplete baseline
cannot select content reuse, and platform changes require a full build.
Generation writes a complete temporary directory, then replaces `docs/` with rename
and rollback-on-rename-failure. Invalid/missing input leaves the prior public tree intact.
No claim is made that this filesystem operation publishes an atomic CDN update.

## Versioned public files and navigation

`site-revision.json` names exact route snapshot URLs and SHA256 bytes. Pages refer
to `runtime/<digest>/` and `media/<digest>/`; fetchable HTML lives in
`snapshots/<route-digest>/<route>.html`. Root aliases remain identical for existing
tooling and the offline exporter. The revision and root HTML revalidate; immutable
paths use the prepared host policy. No idle revision fetch, remote CMS or automatic
refresh is added. Default output has no telemetry; [SITE-ANALYTICS](../guides/SITE-ANALYTICS.md)
owns the optional exact-origin adapter and tracking-free standalone exports.

On the first user route navigation, the router pins a descriptor compatible with
the initial shell/route. It fetches only the named immutable route and checks its
bytes and version before caching/mounting. Later navigation uses that pinned set.
A changed descriptor, bad MIME, missing route, mismatched engine or corrupted bytes
falls back once to the ordinary destination document. The next fresh document
chooses its own version; there is no reload loop. Standalone files embed the finite
verified producer payload and navigate through `?view=`, with no HTTP fetch.
Hosted routes do not embed the whole article registry. A local article embeds its
own initial descriptor; first navigation selects compatible article descriptors
from the bounded revision manifest. Article renderer compatibility is explicit.

Writing and its native article documents use the same fractal composition.
Document-to-document navigation centers that composition, orbits the camera once
around it, then restores the reading pose. History reverses the orbit direction.
Principal-section trips retain corridor travel. One lifecycle owns timing,
interruption, the original orbit-return anchor and motion/native fallbacks.
The supported axis/pivot and enclosing radius are validated with the scene inputs.


Article documents reference the canonical Writing fallback through one generated,
content-addressed `article-media/<sha256>/writing-fallback.svg` group. The scene
geometry and theme paint remain single-owned. Size reports include this resource
and its instantiated SVG nodes. Standalone exports verify and inline its passive
geometry, then declare only the body media that need runtime hydration; their
original HTML and transfer limits still apply.

Every hosted article carries exact-edition source/semantic identities, media
credits and its declared rights status. Release rights reports bind those notices,
source inputs and every resource to the selected document pair. Review previews
can retain explicit pending clearance; production rejects pending article/media
rights. This inventory does not supply editorial or human rights acceptance.

The shared reader is independent of the current article manuscript.
`tools/site/reader.cjs` is the reusable web presentation adapter over the admitted
AST, with pure HTML rendering shared through `tools/publishing/render.cjs`.
`templates/pages/article.html` and `templates/components/reader-contents.html`
own the common shell and contents; `engine/reader.css` owns long-form layout,
typography and table/code/figure/reference components. `engine/reading-surfaces.css`
owns the reader's one opaque paper surface; the same Writing scene stays visible
around it and retains document-orbit transitions. Ordinary paragraph-entry and
page-edge scene gestures are disabled while reading an article.

The optional `engine/reader.cjs` lifecycle adds hierarchical H2/H3 Contents,
current-topic tracking, image zoom, compact reference previews and print expansion.
The enhanced Contents control stays reachable while reading, opens its list above
the reading surface without changing document height, and closes on selection;
without JavaScript, native Contents scrolls with the page so it cannot cover anchor destinations.
`templates/components/reader-tools.html` owns the progressively enhanced native
dialogs. Image and citation anchors remain usable in ordinary HTML; supported
dialogs preserve reading position, restore focus, and close on Escape or backdrop.
Verified standalone resources hydrate both images and their viewer links.
Its listeners/observer are
disposed by the existing router. All disclosure states are stored in the router's
per-history-entry record and restored before scroll. Native/no-JS HTML contains the
full body and initially open apparatus; no new fetch, clock, runtime framework or
publication registry is introduced.

A leading stand-alone emphasized paragraph after the title is the article subtitle.
Cover furniture can move after the authored introduction without changing prose
or media. An optional profile `reader.sections` object declares `appendices` as a
distinct ordered list of trailing H2 anchors and, optionally, `references` as one
of those anchors. The reference section must contain exactly one positive numbered
source list with at most100 notes. Only matching `[n]` text citations are linked;
unknown numbers and code remain literal, and existing links are never nested.
An inline external link directly followed by a matching citation is rendered as
ordinary text only when that note explicitly contains the same URL; the numbered
citation and full source remain. Other links and resource rows keep their native
destinations. Reading time counts essay prose, excluding declared appendices and
sources; a publication date is shown only when it exists in canonical metadata.
Every generated citation has a return link; source prose and critical figure
limitations remain intact. No publication ID, chapter wording or specific source
number is encoded in the reader's layout.

Exercise it with
`SITE_ARTICLE_PREVIEW=template node tools/quality/artifact.cjs build /tmp/reader-template`.
`site/article-template-preview.json` selects only the synthetic, nonpublishable
`reader-reference`. It remains a draft and cannot enter the publication catalog.
`SITE_ARTICLE_PREVIEW=true` retains the separate editorial selection in
`site/article-preview.json`. Both preview purposes retain source, resource,
rights and size checks; template evidence does not accept a real article.

A publication may opt into `reader.images: "webp-lossless"` in its profile.
The bounded producer uses the canonical pinned Pillow toolchain to create immutable
WebP copies, verifies identical dimensions, RGBA pixels and ICC bytes after decode,
and binds both source and output hashes in its edition notice. Source PNGs and
print/platform exports remain unchanged. Unsupported color/orientation/frame data
requires explicit preparation; there is no automatic resize or lossy fallback.
Standalone HTML embeds verified WebP with native image markup and correct MIME.
An explicit `reader.equivalentImages` map may select an existing JPEG by declared
asset id, source path and SHA256. Its dimensions, decoded RGBA, ICC and orientation
must match the canonical PNG exactly. The original JPEG bytes are served unchanged;
both source identities remain bound to the reader notice and source inputs.
The current standalone codec supports PNG/WebP only and rejects this JPEG mode;
hosted support does not claim standalone article acceptance.
An ordinary PDF download remains available through `reader.presentation: "links"`;
large decks and images still count against the existing complete transfer budget.
The explicit `download` mode instead permits exactly one user-activated PDF anchor,
without embed, preload or automatic loading. The PDF stays in the full immutable,
rights, source and offline inventory under the unchanged 2000000-byte asset cap.
Size evidence reports its download transfer separately. All displayed images,
including every below-fold slide, still count toward the unchanged 800000-byte
required reading transfer. Source reconstruction verifies this classification;
neither mode establishes editorial, rights or release acceptance.

Prior published versions must be imported explicitly from their verified artifact:

```sh
node tools/site/retain.cjs PREVIOUS_PUBLIC PREVIOUS_ARTIFACT_JSON
node tools/site/build.cjs --all
```

The importer verifies all artifact bytes, snapshot closure and immutable name
collisions. The prepared promotion gate refuses a package missing any immutable
input from the previous known-good package. Current unpublished candidate snapshots
are not retained implicitly. There is no automatic pruning, retention duration or
reliance on CDN cache. A first deployment needs a retention/rollback agreement under
#8; a subsequent promotion carries the previous version until a separate reviewed
pruning decision. Inventory is bounded at 1,000 public files and fails closed.

## Verification and publication boundary

`tests/site-engine.test.cjs` checks frozen HTML/world parity, actual output deltas,
clean/incremental equality, rename/delete, forged cache/output, executable boundaries,
retained dependencies and fail-closed evidence proposals. Existing #13 checks remain
required, including security, SEO, accessibility, themes, failure paths, three engines,
native platforms, performance profiles, route/resource soak and five-minute soak.
The first-gesture, pinned snapshot, digest/version fallback and all five standalone
file-URL cases are part of the maintained browser/aggregate requirements.

`tools/site/evidence-policy.cjs` is an advisory #13 proposal only. Unknown or changed
engine/scenes/assets/templates/routes/producer means full scope. It skips no jobs and
reuses no evidence. Generation savings do not establish permission to omit checks.

Packagers consume one tested coherent artifact; they do not patch live files or
regenerate between validation and upload. Current hosting controllers, check profiles
and host acceptance follow [SITE-STAGING](../guides/SITE-STAGING.md),
[SITE-CHECK-PROFILES](../guides/SITE-CHECK-PROFILES.md) and the live owning issue.
Local Pages fixtures are controlled tests, not real Cloudflare/TLS/CDN acceptance.
Independent visual/rights review, physical-device acceptance and production decisions
remain separate requirements; this source contract does not supply their approval.

## Optional effects contract v1

The base edition is the default producer selection. The delivery adapters select
Color explicitly for preview, staging and the separately frozen production
candidate; each requires its own matching verification. Offline exports accept
an explicit `base`, `color` or `both` argument in
`tools/site/export.cjs`. Each file has a variant/digest manifest.
The effects loader attaches a scene `collect` / `paint` pair and a travel
presentation through `window.SiteEffects`, contract 1. These narrow hooks cannot
own another scene clock. A scene painter returns true only after handling its shape;
returning false leaves the Canvas context unchanged. The renderer starts a fresh
paint-state shadow each frame and invalidates it after handled effects/formula
paint, so redundant native setters cannot inherit external or resized state.
One composition stage performs stable final depth sorting.
Native measurement runs through a scoped presentation hook when required.

`tools/site/variants.cjs` binds authored effect code, styles, input controls and
base engine to a fingerprint; it updates every embedded route identity. Runtime
function text/formatting is not an extension boundary. An incompatible or duplicate
effect fails generation. Hosted evidence is bound to the producer's base variant;
selecting Color for production remains a separate decision requiring its complete
same-byte hosted behavioral/performance matrix. A base pass cannot admit Color.

Reading backdrop paint is authored only in `engine/reading-surfaces.css` and concatenated into the existing stylesheet by the producer. All routes, Color and the Appearance popup share theme-paper paint at 87% background alpha (13% transparency), crisp edges and a 12px visible radius at all four outer corners; title spread adjusts its inner radius and preserves ink stacking. Element opacity stays one so text and controls do not fade. The same owner restores fully opaque paper for `prefers-reduced-transparency: reduce`. Component spacing and semantic control/CTA paint remain ordinary layout CSS.

Writing and Talks publication cards use one backdrop on the complete row, with
the same shared 12px gutter and content-driven height. Metadata and copy do not
paint independent panels. Child intrinsic widths remain ordinary text layout;
only the row and the canonical shared inset determine the backdrop's bounds.

## Publication tags and optional related reading

`content/article-tags.json` owns the shared vocabulary and tag assignments.
External catalogue entries use `records[recordId]`; local articles use
`articles[articleId]`, including prepared drafts. A local catalogue record must
not also own a competing assignment. Every published record requires tags.
Draft assignments and unused vocabulary stay out of the public projection.

The builder emits the separately updated, bounded `publication-index.json`.
It contains published catalogue titles/URLs/languages/tags and tag context for
selected reader documents; draft/reference documents never enter its article
recommendations. This file is intentionally independent of document fingerprints.
Tag-only base generation/content composition changes the index and binding locks,
with old room/article HTML and runtime bytes unchanged. Current edition decoration
and protected publication remain their own source-bound stages; independently
admitted production lanes still belong to #5 AC16–AC20.

One shared `engine/article-tags.cjs` factory assembles into the existing archive
runtime. It loads a current schema1 index from the same origin on each mount,
validates finite bytes/data/URLs, creates text-safe tag/related DOM, and disposes
requests/listeners on navigation. Related reading uses Jaccard overlap, deterministic
ID ties, up to three distinct published catalogue works and no unrelated filler.
Alternate platform links stay inside the same logical catalogue record.
The last validated snapshot is kept only in tab memory and hydrates synchronously
before history restores scroll. Each mount still fetches current metadata; identical
responses avoid reflow and changed responses replace enhancements while preserving
the current scroll position. A failed refresh may retain that validated snapshot.

The Writing tag filter composes with topic/year/language, query/history/reset and
print through the existing archive owner. Without JS, on a standalone file or when
the optional index is blocked/invalid/incompatible on a fresh tab, full native
content and Writing links remain available; live enhancements are unavailable.
No backend, third-party request, additional runtime file or animation loop is added.
