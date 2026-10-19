# Public article materials

Owner: [issue106](https://github.com/oborskyivitalii/oborskyivitalii/issues/106).
The author approved this reader integration on19October2026. The reusable
campaign stays in PR107; the existing reader in PR79 owns its minimal integration
hook. Neither campaign completion nor optional materials gate article publication.

## One public allowlist

`site/publications/<article-id>/materials.json` explicitly selects public items.
There is no directory auto-discovery. Campaign briefs, draft posts, storyboards,
plans and review/observation notes are repository-only inputs. They are never
copied to the public tree. No allowlist means no materials block.

The source is the publisher's validated content edition and semantic digest:

```json
{
  "schema": 1,
  "articleId": "example-article",
  "source": {"editionId": "edition-one", "semanticSha256": "<publisher semantic SHA256>"},
  "items": [{
    "id": "reading-pdf",
    "kind": "pdf",
    "label": "Full reading PDF",
    "description": "Portable reading edition.",
    "credit": "<actual per-item credit and license boundary>",
    "visibility": "public",
    "target": {
      "kind": "file", "path": "materials/reading.pdf",
      "sha256": "<actual file SHA256>", "mime": "application/pdf"
    },
    "approval": null
  }]
}
```

Place that file at
`site/assets/publications/<article-id>/materials/reading.pdf`. Register its exact
bytes and rights basis in the existing central rights inventory before release;
this feature cannot supply missing clearance. Per-item credit is also visible in
the article. File targets accept bounded PDF and PNG only. Kinds are `pdf`,
`presentation`, `carousel`, `image`, `linkedin`, `medium`, `video`.

Reuse an existing declared article image with
`{"kind":"asset","id":"diagram","sha256":"<original publisher image SHA256>"}`.
This follows its current immutable hosted rendition without copying the media or
creating another editing owner. Existing print/platform source images are intact.

An external target has `kind: "external"`, `url`, exact UTC `observedAt` and a
pinned `evidence: {path, sha256}` under `materials/observations/<item-id>.md`.
Only observed LinkedIn, Medium or supported video-host links match their declared
channel. HTTPS, channel-host and public-host checks reject staging/preview URLs,
credentials, IP literals and reserved/private test domains. These checks do not
make an observation or approve platform admission for the author.

## Review binding and rendering

`visibility: "private"` and `approval: null` exclude the item from the block and
public resource inventory. An explicitly public item with a review record binds
its source edition, label/description/credit, file/URL and observation pins:

```json
{
  "bindingSha256": "<reviewBinding(declaration, item)>",
  "reviewedAt": "2026-10-19T10:00:00Z",
  "evidence": {"path": "materials/reviews/reading-pdf.md", "sha256": "<actual review SHA256>"}
}
```

This replaces `approval: null` only after actual review. Hashes establish byte
consistency, not independent acceptance or rights. Stale edition, file, credit,
label or evidence refuses compilation. Maximum16 items,2MB/file,16MB of newly
selected material; existing complete article/resource/HTML budgets still apply.

One [native template](../site/templates/components/article-materials.html) renders
“Materials and other formats” after source/rights details. The reader carries its
allowlist, evidence and selected files as source dependencies; the public output
contains only HTML and selected immutable `article-media/<sha256>/<filename>`
resources. The existing rights/release controls continue to verify those files.
No JavaScript is required to see or follow the links. Adding a material is a
content change after this platform capability is admitted.

## Links back to the article

Campaign validation returns each piece's `articleUrl`, derived from the
publisher's actually observed public canonical and optional validated section.
It stays null before publication; preview URLs are refused. Authors/kit adapters
use that URL in the post, carousel or next PDF export. This does not silently
rewrite previously published PDFs or invent social publication URLs. Existing
full-reading and PDF adapters keep ownership of those renditions.

Shared module: [article-materials.cjs](../tools/site/article-materials.cjs).
Permanent source negatives: [article-materials.test.cjs](../tests/article-materials.test.cjs).
The reader's existing article suite verifies actual compilation, immutable asset
closure and unchanged public bytes after working-campaign edits. Synthetic review
fixtures establish behavior only; author/mobile/rights/production gates remain
separate and the real PMDay campaign is not published by this feature.
