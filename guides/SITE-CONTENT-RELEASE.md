# Independent static content releases

Owner: [issue #5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5),
implemented in [PR #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
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

Standalone HTML/ZIP exports intentionally embed all routes. Generate those review
or downloadable renditions separately when needed; they are not an unavoidable
part of a verified online content release.

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
retain their existing admission profiles and budgets. A content-build report is not
staging acceptance, a publication event or permission to activate production.
