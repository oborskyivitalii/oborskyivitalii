# Static site source and engine contract

The [current check profiles](../guides/SITE-CHECK-PROFILES.md) supersede older full-local
and always-full PR requirements below. Native-scroll mapping and all release
budgets remain. Primary flights follow the four header links; Credits is a footer
utility route with instant navigation.

The original engine work is recorded in completed
[#15](https://github.com/oborskyivitalii/oborskyivitalii/issues/15) and
[PR #16](https://github.com/oborskyivitalii/oborskyivitalii/pull/16).
Read [MEMORY](../MEMORY.md) and the live owning issue for the current source,
staging and release state; dated implementation plans are historical evidence.
The website still ships complete ordinary HTML. Canvas and the persistent router
enhance that HTML; a content editor does not need a server, CMS or browser build.

Native-scroll camera endpoints follow 0/the actual current page bottom on every
route, including added unmarked blocks and the footer. Semantic markers define
interior stops; repeated closing poses are coalesced. Main/body content reflow,
font loading, viewport resize and route mounts recalculate the mapping. Writing
retains its topic path, early-scroll response and valid anchored filter reflow.
Every content edit still runs the normal all-route browser synchronization fixtures
and strict aggregate under #13; generation freshness alone is insufficient.

## Authoritative sources and dependencies

| Source | Responsibility | Dependent output |
| --- | --- | --- |
| `templates/head.html`, `header.html`, `footer.html`, `shell.html` | Shared structure and controls | All five HTML pages |
| `content/pages/<id>/metadata.json` | Title, description, structured metadata, ordered block names | That route |
| `content/pages/<id>/main.html`, named blocks | Page layout and curated prose | That route |
| `content/catalog.json` | 27 exact primary editions, one linked rendition, five featured selections | Writing; selected featured records also Home |
| `routes.json` | Contract 1: ordered five route IDs, native URLs, scenes and stop IDs | Runtime, pages and fallback |
| `engine/math.cjs`, `projection.cjs`, `lifecycle.cjs` | Math, projection and single Canvas/RAF lifecycle | Assembled `space.js` |
| `engine/renderer.cjs` | Ordered Canvas commands, adjacent-line batching and visible outlines | Assembled `space.js` |
| `engine/theme.js`, `archive.js`, `navigation.js`, `styles.css` | Theme, filtering, routing and presentation | Shared browser files and pages |
| `scenes/world.cjs`, `paths.json` | Authored motifs, rest geometry and finite camera paths | Runtime and projected SVG fallbacks |
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

Native links, anchors, language badges, full text and JSON-LD remain available
without JavaScript. Contract 1 retains `SiteScene.navigate/refresh/detachTravel/canTravel`,
`SiteArchive.mount/destroy` and `SiteNavigation`. The router owns mount/unmount and
history; the scene owns route progress and its actual arrival paint. Ambient phase,
scroll/topic pose and route flight remain separate. Off/reduced, visibility, print,
failure, reflow and device-cost adaptation preserve the existing bounded behavior.
Runtime projection omits subpixel facets; static SVG/model output keeps the complete
geometry. Flights use compact facet models, then restore settled detail. Each of
at most three active/pending rooms caches at most two detail variants; theme changes
repaint their color tables. No independent render loop or runtime dependency is added.

The Writing room has one original outlined paradigm landmark, sourced only from
`assets/writing-paradigm.svg`. `tools/site/scene-assets.cjs` validates and compiles
it during generation. Renderer uses one fixed1380×240 raster cache and one native
sorted draw command, with no extra clock/load/decode. Asset and producer identity
invalidate the immutable runtime. Static/mobile and standalone renditions derive
from that source; diagnostics and issue #36's scoped evidence verify its bounds.

## Editing and deterministic generation

Edit an individual block, for example `content/pages/index/about.html`, then run:

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
engine/scenes/assets/analytics, its actual block bytes and selected catalog records. A Home
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
`review/site-scroll-sync-20261004/export.cjs`. Each file has a variant/digest manifest.
The effects loader attaches a scene `collect` / `paint` pair and a travel
presentation through `window.SiteEffects`, contract 1. These narrow hooks cannot
own another scene clock. One composition stage performs stable final depth sorting.
Native measurement runs through a scoped presentation hook when required.

`tools/site/variants.cjs` binds authored effect code, styles, input controls and
base engine to a fingerprint; it updates every embedded route identity. Runtime
function text/formatting is not an extension boundary. An incompatible or duplicate
effect fails generation. Hosted evidence is bound to the producer's base variant;
selecting Color for production remains a separate decision requiring its complete
same-byte hosted behavioral/performance matrix. A base pass cannot admit Color.
