# Static site source and engine contract

Owner [#15](https://github.com/oborskyivitalii/oborskyivitalii/issues/15), execution
in stacked Draft [PR #16](https://github.com/oborskyivitalii/oborskyivitalii/pull/16).
Publication is paused by the maintainer's 2026-10-04 instruction, including staging.
The website still ships complete ordinary HTML. Canvas and the persistent router
enhance that HTML; a content editor does not need a server, CMS or browser build.

## Authoritative sources and dependencies

| Source | Responsibility | Dependent output |
| --- | --- | --- |
| `templates/head.html`, `header.html`, `footer.html`, `shell.html` | Shared structure and controls | All five HTML pages |
| `content/pages/<id>/metadata.json` | Title, description, structured metadata, ordered block names | That route |
| `content/pages/<id>/main.html`, named blocks | Page layout and curated prose | That route |
| `content/catalog.json` | 27 exact primary editions, one linked rendition, five featured selections | Writing; selected featured records also Home |
| `routes.json` | Contract 1: ordered five route IDs, native URLs, scenes and stop IDs | Runtime, pages and fallback |
| `engine/math.cjs`, `projection.cjs`, `lifecycle.cjs` | Math, projection and single Canvas/RAF lifecycle | Assembled `space.js` |
| `engine/theme.js`, `archive.js`, `navigation.js`, `styles.css` | Theme, filtering, routing and presentation | Shared browser files and pages |
| `scenes/world.cjs`, `paths.json` | Authored motifs, rest geometry and finite camera paths | Runtime and projected SVG fallbacks |
| `assets/` | Existing portrait, cutout, favicon and `.nojekyll` source | Exact image/icon bytes |
| `retained/` when explicitly imported | Previous verified immutable public files | Coherent prior snapshot support |
| `output-lock.json` | Generated, reviewed output hashes and dependency identity | Cache verification and freshness check |
| `../docs/` | Generated-only complete public output | Tested public artifact and offline exports |

This catalog migrates the existing public inventory. [SITE-SOURCE-AUDIT](../SITE-SOURCE-AUDIT.md)
continues to own provenance; [SITE-SEO](../SITE-SEO.md) owns discoverability and
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
engine/scenes/assets, its actual block bytes and selected catalog records. A Home
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
paths use the prepared host policy. No idle fetch, remote CMS, automatic refresh or
telemetry is added.

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
regenerate between validation and upload. Both hosting workflow entry points are
explicitly paused. Local Pages fixtures are controlled tests, not real Cloudflare/TLS/
CDN acceptance. Real host, independent visual/rights review and physical-device
acceptance are separately pending and cannot be self-confirmed by this implementation.
