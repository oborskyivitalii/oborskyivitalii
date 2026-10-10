# Static site source and engine contract

The [current check profiles](../guides/SITE-CHECK-PROFILES.md) supersede older full-local
and always-full PR requirements below. Native scroll and all release budgets
remain. The issue49 amendment uses one five-route depth itinerary:
Home, Research, Writing, Talks, Credits. Credits participates in the same flight
policy as every header, footer, cross-link, VO and history route change.

The original engine work is recorded in completed
[#15](https://github.com/oborskyivitalii/oborskyivitalii/issues/15) and
[PR #16](https://github.com/oborskyivitalii/oborskyivitalii/pull/16).
Read [MEMORY](../MEMORY.md) and the live owning issue for the current source,
staging and release state; dated implementation plans are historical evidence.
The website still ships complete ordinary HTML. Canvas and the persistent router
enhance that HTML; a content editor does not need a server, CMS or browser build.

Issue49 keeps each settled route camera stationary while ordinary native scroll,
filters, hashes and history positions remain active. The actual painted camera
starts every route flight, including retargets from arbitrary native scroll or
another unfinished journey. Semantic markers and topic paths remain authored
scene data, without driving the settled reading camera. Current check profiles
own source/hosted coverage; generation freshness alone is insufficient.

## Authoritative sources and dependencies

| Source | Responsibility | Dependent output |
| --- | --- | --- |
| `templates/head.html`, `shell.html`, `templates/shared/*.html` | Shared structure and controls | All five HTML pages |
| `content/pages/<id>/metadata.json` | Title, description, structured metadata, ordered block names | That route |
| `content/pages/<id>/*.json`, `content/shared/*.json` | Bounded text, attributes, URLs and explicit template/block references | That route or shared header/footer |
| `templates/pages/<id>/*.html`, `templates/components/*.html` | Page-specific semantic layout and reusable publication/discussion markup | Declared route compositions |
| `content/catalog.json` | Primary editions, bounded alternates/discussions, presentation records, topics and labels; five featured selections | Writing; selected featured records also Home and shared labels |
| `routes.json` | Contract 1: ordered five route IDs, native URLs, scenes and stop IDs | Runtime, pages and fallback |
| `engine/math.cjs`, `projection.cjs`, `lifecycle.cjs` | Math, projection and single Canvas/RAF lifecycle | Assembled `space.js` |
| `engine/renderer.cjs` | Ordered Canvas commands, adjacent-line batching and visible outlines | Assembled `space.js` |
| `engine/theme.js`, `archive.js`, `navigation.js`, `styles.css`, `critical-media.css`, `reading-surfaces.css` | Theme, filtering, routing and canonical presentation, including Home media fallback | Shared browser files and pages |
| `scenes/world.cjs`, `paths.json` | Authored motifs, rest geometry and finite camera paths | Runtime and projected SVG fallbacks |
| `effects/flight.cjs`, `effects/*.css` | Current Color travel descriptor and canonical static reading/control CSS | Shared hosted/offline Color runtime |
| `effects/fragment-plan.cjs`, `fragment-dom.cjs` | Shared shard settings/geometry, visible native paint acquisition and staggered 1.8-second assembly | Issue49 all-route bidirectional Color preview; finite painted-clock tail preserves camera duration and resource caps |
| `effects/embedded-plan.cjs`, `embedded-texture.cjs`, `embedded-scene.cjs` | Scoped persistent closed shards, capability-gated native block texture and shared-scene prewarm/handoff | Issue49 viewport-bounded Home/Research solids in both directions within the same Color travel descriptor and scene clock |
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
without JavaScript. Contract 1 retains `SiteScene.navigate/refresh/detachTravel/canTravel`,
`SiteArchive.mount/destroy` and `SiteNavigation`. The router owns mount/unmount and
history; the scene owns route progress and its actual arrival paint. Frozen
`SiteRoutes.order` and its direction helper are shared with navigation even when
Canvas is unavailable. Ambient phase, native reading scroll and route flight
remain separate. Off/reduced, visibility, print,
failure, reflow and device-cost adaptation preserve the existing bounded behavior.
Runtime projection omits subpixel facets; static SVG/model output keeps the complete
geometry. Flights prepare each room at its settled adaptive detail before the
first painted flight frame. Each of at most three active/pending rooms caches
at most two detail variants; theme changes
repaint their color tables. No independent render loop or runtime dependency is added.

Current Color delivery uses only the travel effect. Issue61's explicit maintainer
decision removes ribbon construction, collection and painting on every route,
while keeping the thematic scene, Writing formula, shared reading/control CSS
and the existing navigation/clock/freeze behavior. Both hosted and standalone
Color identities declare `effects: ["travel"]`; optional ribbon adapters remain
only for explicit historical comparisons, with their source still scanned.
Issue49's Color preview enables fragments by default unless the user has stored
Content flight Off. `fragment-plan.cjs` owns the single settings object, convex
shard generator and both directional geometry functions; `fragment-dom.cjs` owns
bounded visible paint acquisition and cleanup; `flight.cjs` owns phase orchestration.
Acquisition selects the first actual painted block, including its measured
before/after backdrop, decoded images, controls and text. A surface's children
cannot fly independently over its native paper. Detached decorative copies replay
resolved pseudo paint from the canonical reading-surface owner, including inactive
pseudos, grid layout and the full backdrop gutter envelope. Mobile `display: contents`
wrappers descend to their actual painted children. Unsupported or unadmittable
surfaces retain a whole-block local fallback under the existing caps.
Media figures acquire decoded images with supported static primitive SVG
backdrops as one owner. Resolved vector colors/geometry and viewport outsets are
preserved; executable, animated, referenced or unsupported SVG falls back as a
whole figure. Vector attribute bytes share the existing cloned-text allowance.
Forward travel releases outgoing pieces behind the advancing camera and brings
incoming pieces from the destination fractal. Reverse travel sends outgoing paint
into the source fractal and assembles incoming paint from behind the retreating
camera. Native-scroll/reflow invalidation uses ordinary cleanup and fallback.
An optional `SiteEngineProbe` paint event observes successful ordinary native
paints for camera/journey diagnostics. It uses the existing clock and constructs
no frame evidence when the probe is absent; no independent loop is added.
Historical ribbon material/phase evidence remains attached to its prior edition.

Issue49's embedded extension carries actual neighboring-page content in persistent
moving fractal structures. Research belongs to Home's world, Writing to Research's,
and subsequent pages follow the existing route order. The router prewarms the next
pinned page through its verified finite cache. An inert, inaccessible staging copy
measures the target viewport, with Writing's controls normalized by the same scoped
archive preparation as native mount. The inert footer uses the same
route/preference normalizer as native mount.
Staged hash landings apply computed root scroll padding and target scroll margin,
then clamp to the destination scroll range before capturing its visible paint.
`embedded-texture.cjs` validates visible native headings, text, reading paper,
links, lists, controls, decoded local images and
supported static SVG before rasterizing one page-owned viewport texture. Each
admitted owner retains its exact native envelope clip and isolated paint order
inside one SVG image; owner-specific pseudo selectors stay unique. One bounded
alpha readback observes each owner's ink only outside other owners' paint bounds,
so a neighboring owner cannot supply a missing owner's proof. Fully covered or
blank owners fail closed. The temporary peak includes decoded SVG, atlas canvas,
readback and sampled PNG decode/encoding surfaces within the original limits.
Recorded subowner paths, geometry and text remain the native coverage and landing oracle.
Capture follows the visible viewport rather than allocating the full scrollable
document. The shared native measurement owner clips only paint proven hidden
by the opaque full-width header, revalidating physical coverage after decode.
Unknown stacking, effects or shape keep the complete viewport and native ink gates.
SVG decode readiness and onload share one draw/proof under the same absolute
deadline, with ordinary onload retained when decode is unavailable.
The temporary atlas requests CPU readback preference; the scene context remains
separate. Its SVG viewport matches bitmap pixels, while the inner native CSS
plane applies the exact independent sampling scales, including positioned paint
on WebKit. An empty loaded FontFaceSet with validated system families needs no
repeated native font matching; registered faces retain per-text checks.
Temporary captures, retained textures and solid geometry share the
original piece, pixel, owner, descendant and text limits; unsupported capture or
an unadmittable landing uses the existing native `flightPose` fade, with no DOM
fragment acquisition or scatter. Motion Off/reduced and unsupported scene travel
retain ordinary native navigation.

`embedded-plan.cjs` gives those same identified shards closed front, rear and
side faces, target-camera endpoints and immutable membership in existing fractal
branches. Their resting geometry uses the exact shared `loopTransform` and room
offset under the existing ambient clock; real content textures remain visible.
Textured fronts and rears remain opaque before near-plane fading; closed sides
keep canonical depth fog. Broken fragments have a palette substrate beneath
transparent native atlas pixels, so captured paper and ink remain on solid
material. That added substrate disappears at the exact native endpoint.
Tilted texture faces refine actual projected midpoints when their affine error
exceeds one CSS pixel, up to eight triangle submissions per face, using bounded
source rectangles and existing triangle clips. This bounded approximation
reduces affine bending of glyphs; it adds no bitmap, decode or scene clock.
Reverse collection can traverse a second genuine branch in the destination room
before reaching its native plane, so a retreating camera sees partial geometry
while both resting contact and the final endpoint remain exact. This world path
uses the existing cached room descriptors and shared transform.
The reconciled visual rework distributes stable content-field identities across
three successive actual fractal roots with their canonical branch loop. Closed
shards have deeper beveled sides and captured paint on both faces. Forward breakup
begins on the native reading plane, then leaves detached pieces at fixed source-world
positions for the camera to cross; reverse departure retains the canonical host
trajectory. Incoming pieces converge at staggered phases during that flight.
Forward assembly separates lateral alignment from longitudinal approach using
the fixed destination-camera world axes. Pieces align laterally while distant,
retain seeded depth spread, finish their rotation early and approach the native
plane chiefly through depth. The live camera cannot advance their assembly
phase or carry that corridor along its near plane. Resting branch contact,
native endpoints and reverse paths retain their original geometry.
Neighbor preparation also captures the settled current viewport before a click,
within the same abort, matching, retention, pixel and absolute deadline rules.
`embedded-scene.cjs` attaches collection/paint to the current travel effect;
the existing scene composition sorts its faces with the fractal. It owns no
runtime dependency, second renderer or animation clock. Preparation, native
owner hiding, texture lifetime, cancellation and disposal remain bounded and
reserve resources against the shared departure/arrival caps across at most three
retained page fields. Same-route replacement keeps the prior field and charges its
resident resources until a successful atomic swap; failed warming cannot erase
the current native field. Static face topology and UV offsets are reused, while
branch transforms remain scoped to one sampled frame. Native ownership pixel
bounds and font-family eligibility are shared only inside one bounded acquisition;
per-text font checks and owner raster proof remain strict. Forward convergence starts during camera travel. A skipped
Research native page remains a pass-through content structure on Home-to-Writing
travel; the router mounts only Writing. Reverse travel detaches the same Research
objects into their Home host, preserving them there after arrival. Native mount
binds the measured subowners without restarting convergence. Arrival returns
ordinary semantic HTML for reading, selection and interaction. The final
180ms of the shared painted arrival may blend the native page in
as the corresponding Canvas faces fade out, only after the shared camera reaches
its exact target pose. This preserves the ordinary scene atmosphere overlay
without a hard color seam between Canvas texture and foreground HTML; it adds
no independent clock or generic content-plane fade. Source
fixtures do not establish native texture fidelity or perceived depth: the
explicit AC15 embedded visual gate and existing fidelity/performance/device
gates remain pending before visual acceptance or release admission.

After the destination mounts during travel, speculative preparation may capture
its logical successor into an empty third resident slot. Every live field remains
protected, including a skipped-room corridor; a full bank defers successor work
until the existing handoff completes. This resident-only task cannot select the
incoming or outgoing owner, recapture the departure plane or pause the painted
flight. New speculative fields reveal smoothly over 420ms on the shared ambient
clock, including first-load or deferred post-handoff captures. Actual navigation
uses its admitted field at full visibility. Cancellation aborts the separately
signalled warm task; ordinary completed handoff may let it finish within the same
capture deadlines and shared resource caps.

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

Each route signature includes producer, contract/configuration, shared templates,
engine/scenes/assets/analytics, its actual block bytes, selected catalog records, discussion references and structured order. A Home
block edit builds Home only; a featured edition builds Home and Writing; a shared
footer builds all five. A scene/code change is conservatively a complete closure:
all scenes share one browser bundle and all fallbacks consume the same model.

`.site-cache/build.json` is optional and untrusted. Reuse requires current source
signatures, the reviewed output lock, cache hashes and actual output bytes to agree.
Missing/invalid cache or lock regenerates. A forged cache plus edited HTML cannot
substitute for source; CI recomputes everything even if the lock is also edited.
Generation writes a complete temporary directory, then replaces `docs/` with rename
and rollback-on-rename-failure. Invalid/missing input leaves the prior public tree intact.
No claim is made that this filesystem operation publishes an atomic CDN update.

## Versioned public files and navigation

`site-revision.json` names exact route snapshot URLs and SHA256 bytes. Pages refer
to `runtime/<digest>/` and `media/<digest>/`; fetchable HTML lives in
`snapshots/<route-digest>/<route>.html`. Root aliases remain identical for existing
tooling and the offline exporter. The revision and root HTML revalidate; immutable
paths use the prepared host policy. No periodic revision fetch, remote CMS or automatic
refresh is added. Default output has no telemetry; [SITE-ANALYTICS](../guides/SITE-ANALYTICS.md)
owns the optional exact-origin adapter and tracking-free standalone exports.

The router pins a descriptor compatible with the initial shell/route on its first
verified route read. Base delivery first reads it on user navigation. The scoped
Color embedded preview may make that read earlier on Home or Research to prewarm
the other route's visible native owners. This speculative read shares the existing
finite route cache and exact descriptor/byte/version checks; failure cannot block
ordinary navigation. It does not poll for revisions or refresh the pinned edition.
The router fetches only the named immutable route and checks its bytes and version
before caching/mounting. Later navigation uses that pinned set.
A changed descriptor, bad MIME, missing route, mismatched engine or corrupted bytes
falls back once to the ordinary destination document. The next fresh document
chooses its own version; there is no reload loop. Standalone files embed the finite
verified producer payload and navigate through `?view=`, with no HTTP fetch.

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

The base edition remains the deployable producer selection. Offline exports accept
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

Reading backdrop paint is authored only in `engine/reading-surfaces.css` and
concatenated into the existing stylesheet by the producer. Base and desktop Color
use theme-paper paint at 87% background alpha (13% transparency). Compact Color
screens at or below 640px use 72% in Day and 78% in Night, so the neighboring
content structures remain visible through the native paper. Live content, inert
capture stages and native fallback share this metadata-gated material.

All surfaces retain crisp edges and a 12px visible radius at all four outer
corners; title spread adjusts its inner radius and preserves ink stacking.
Element opacity stays one so text and controls do not fade. The same owner
restores fully opaque paper for `prefers-reduced-transparency: reduce`. The compact
Color atmosphere veil uses 25% element opacity in `engine/styles.css`; Canvas,
text and control opacity stay unchanged. Component spacing and semantic
control/CTA paint remain ordinary layout CSS.

Writing and Talks publication cards use one backdrop on the complete row, with
the same shared 12px gutter and content-driven height. Metadata and copy do not
paint independent panels. Child intrinsic widths remain ordinary text layout;
only the row and the canonical shared inset determine the backdrop's bounds.
