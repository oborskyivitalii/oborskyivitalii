# Independent static content releases

Owner: [issue #5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5),
prepared in [PR #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79) and integrated
with trusted routing/history under [issue #122](https://github.com/oborskyivitalii/oborskyivitalii/issues/122).
Platform, catalog and articles remain in one repository. A content release produces
one coherent static package while reusing verified unchanged platform bytes.
It is not a partial live upload or a new CMS.

## Writing records

`site/content/catalog.json` owns the displayed Writing entry collection. Every
selected primary record produces exactly one card. Alternate platform links belong
inside that card; they do not increase the count. English and Ukrainian editions
remain distinct authored records unless an explicit relationship says otherwise.
The same collection drives year/topic groups, controls, ItemList and count. No
separate year-template insertion is needed for a new article or year.

An accepted local article can belong to this collection with a validated local
edition target. An accepted but unpublished local edition does not acquire an
invented date; the undated group remains explicit. Draft candidates are selected
only by the isolated preview contract. Their test-preview section is separate and
does not enter the ordinary public count or ItemList.

## Platform and article identities

The shared runtime, scenes, styles, templates and build contract identify a platform
generation. A changed platform requires a full build. Article identities depend on
their own declared inputs and actual related translation/link dependencies, not
every article in the repository. Writing and a featured Home entry can depend on
linked article snapshots; unrelated routes and articles remain unchanged.

Client compatibility and generation provenance are separate identities. A source
refactor can preserve an exact reviewed client alias only when its assembled
runtime bytes and document contract remain compatible. The complete producer
hash still changes, document/source evidence remains fresh and full platform
validation is required. Content reuse compares all generation components,
including producer and client; a stable client alias alone grants no reuse.
For an unchanged authenticated baseline, its client descriptor is verified
against actual raw runtime bytes and required document hooks before reuse.

Hosted pages pin a bounded compatible `site-revision.json` on first navigation.
An article embeds only its initial descriptor. Later routes use the pinned immutable
snapshots and exact byte checks. Missing or incompatible manifests fall back to an
ordinary native document. Verified previous immutable files stay in the package for
open sessions, including Color/staging resources when those were served before.

Raw generation reuse and final hosted byte changes are different observations.
The existing staging/production edition layer binds each new source head and may
rewrite document aliases/snapshots and staging commit banners. This does not
recompile the reused runtime or scene platform. The release report names its raw
built/reused routes, articles and file changes rather than claiming every final
hosted file is unchanged.

## Commands and trusted baseline

A prior complete CI artifact includes nonpublic `generation/` metadata and raw
generation bytes. Use its observed lock SHA256 and public digest from the verified
artifact, not a newly invented identity for edited baseline files.

```sh
node tools/quality/artifact.cjs build next-artifact \
  --content-baseline previous-artifact \
  --generation-sha256 BASELINE_GENERATION_LOCK_SHA256 \
  --baseline-digest BASELINE_PUBLIC_DIGEST
```

For a raw generation already verified against its trusted lock:

```sh
node tools/site/content-release.cjs \
  --baseline previous-artifact/generation/public \
  --baseline-lock previous-artifact/generation/output-lock.json \
  --baseline-lock-sha256 BASELINE_GENERATION_LOCK_SHA256 \
  --output next-public
```

The artifact command also preserves verified final decorated immutable closure and
the bounded baseline evidence used for exact current-source reconstruction. The raw
command does not apply a staging/production edition. Output must be separate from
the baseline. Missing, partial, linked, modified or incompatible baseline bytes
fail before replacing output; use the explicit normal full-build command when
platform sources changed.

Standalone HTML/ZIP exports intentionally embed all routes. The repository keeps
18 exact maintained v11 export files: 16 HTML views and two manifests. After a
content edit, regenerate them with `node tools/build_site_previews.cjs` and
`python3 tools/build_site_bundle.py`. The ZIP stays outside the repository.
These files are declared content derivatives, not platform or editorial inputs;
arbitrary review files and capture evidence remain outside this admission.
Existing freshness, checksum and scanner guards still verify the complete bytes.

The online artifact continues to reuse authenticated platform bytes. Retained
repository-export generation is separate work and must be included honestly in
its timing observations; it is not a performance rerun. Optional standalone
article downloads remain separate outputs generated when requested.

## Generated checksums and secret findings

The maintained heavy security route uses `tools/quality/generated-checksums.cjs`
to prove named checksums in current canonical `docs/`, `site/output-lock.json`
and the maintained v11 static/offline preview outputs. Admission first requires
complete canonical generation freshness. Only declared engine, content, route and
file SHA fields, generated `site-engine`/`site-route` metadata and recomputed inert
payload route hashes belong to this proof. A finding must match its exact generated
path, `Hex High Entropy String` type and current literal hashed identity.

An ordinary content update therefore needs no new manual entropy-ledger entry for
these producer fields. This is not a file-wide checksum exclusion: unknown fields
or values, extra metadata, stale output and wrong paths or finding types fail.
The existing publisher validator also proves locally recomputable edition source,
semantic and adaptation derivation hashes, local asset hashes and the profile's
launch-source hash.
Ordinary manuscript/adaptation/launch edits therefore do not require ledger edits
for those exact fields. This checksum proof does not grant editorial acceptance.
Retained frozen editions can use their exact Git bytes and a historical selecting
context that passes the complete current publisher validator. Preparatory,
never-selected or incomplete historical contexts do not provide that authority.
External reference/rights hashes, evidence constants and unproved historical
records continue to need their exact reviewed disposition; neither a familiar
value nor an archived filename establishes admission.

This complete producer proof runs in the existing heavy static, staging and
production security route. Basic and preview content checks do not invoke its
cold generation check. Changes to this policy, its helper or the reviewed ledgers
select the platform profile. Proof of a checksum establishes its producer identity,
not editorial acceptance, staging success or publication authorization.

## CI and publication

The normal PR flow selects content reuse only from a compatible earlier immutable
artifact with successful source/RI/owning admission. Archive digest, repository,
workflow, source/tree, complete generation lock and platform identity are checked.
No eligible baseline means an explicit ordinary platform build, with the reason
recorded. A Draft-only packaging success cannot replace source admission.
Recording observed publication evidence as HTML under an article's `site-artifacts/`
directory selects the ordinary full route; that evidence archive is outside the
supported Markdown/catalog content optimization.

Content checks preserve current-source model/catalog/manifest/resource proof and
mandatory hosted reader/navigation smoke. Runtime, template, policy or unknown
changes select the ordinary applicable platform suites. Stable staging and production
retain their original budgets. A content-build report is not staging acceptance,
a publication event or permission to activate production.

## Accepted content and media lanes

`site-color-review.yml` selects `content-baseline.selectAccepted` for preview and
owner staging. The selector authenticates a merged ancestor's exact staging
checkpoint, native immutable upload digests, original gate and complete raw
generation. Basic/source-only preview success cannot inherit platform acceptance.
The complete accepted S-to-candidate history is inspected at every parent edge,
including merge-parent sides and reverted changes. Intervening repository merges
require genuine producer-bound admission and normal identical-tree merge identity.
Candidate policy cannot exempt itself. Missing/expired evidence, a different article
selection, changed platform/policy or incompatible history/generation records an
explicit ordinary platform fallback.

The content lane covers article owners, catalog/tags, Home/Writing/Talks page data
and `site/content/events.json`. Events are ordered validated records in that single
collection; adding an event requires no new template. Existing public group and
Corning anchors, wording and source-supported metadata survive its migration.
Templates, renderer/schema, scenes, engine, toolchains, CI/policy and globally
active assets remain platform work. Local-media-only inputs have the `media`
impact label; changing a selected figure's meaning/credit/alt/source creates a
content edition through the existing semantic contract. An unreferenced uploaded
asset does not become public merely because its path selects media impact.

Both economical lanes use the same complete transactional assembler. The raw
generation lock and final Color rendition must retain every declared platform
byte. Only actual dependent Home/Writing/Talks/article documents rebuild;
immutable prior snapshots/media stay available. Source, rights, semantic edition,
MIME, per-file/route byte and existing dimension limits remain mandatory.
The distinct `compatible-content-v1` / `content-staging-gate` requires current
scanners, exact hosted bytes, all affected documents at desktop/mobile with JS
and no JS, the existing bounded reader journey and decoded current PNG/WebP
resources (including linked public materials). It explicitly records inherited
platform regression and `performanceRerun: false`; it cannot claim omitted suites
ran. The ordinary platform staging gate retains its original contract.

Home body prose uses the same current-source SEO boundary as the content route.
The checker renders the seven fixed Home blocks and section navigation from
validated canonical JSON, verifies their exact template bindings and producer
pins, and requires the complete emitted body to match that rendering. Only then
can it reverse that body to the immutable approved main frame for the existing
historical comparison. Head metadata, shared header/footer and unrelated output
remain exact. Changed producers/templates, reordered owners, output-only drift
and stale approved output fail. Parsed Home/catalog data rejects reserved `{{`
template openings before rendering; composition instructions belong to the pinned
templates. This source proof supplies no editorial approval;
the owning PR still reviews the new claims and applicable provenance/rights.

The production candidate consumes the authenticated staging artifact's raw
generation on the identical source tree, then applies the existing production
edition/rights controller. It does not rebuild the platform. The accepted
predecessor composition is frozen in admission, then rechecked by the serialized
publisher together with exact current main before any publication. A delayed
candidate must be prepared and tested again; it cannot replace newer accepted
article/catalog/platform state. No compatible retained staging generation means
an explicit platform path, rather than reconstructing raw bytes from an older
release archive that never retained them.

For a component rollback, revert the selected article/event/media inputs on
current main and create a new content candidate. This preserves unrelated current
editions, catalog entries and platform bytes. The controller's separately requested
whole-release rollback/emergency compensation restores its complete archived
composition; it is not presented as a selective article rollback. No partial live
file patching or second publisher is introduced.
