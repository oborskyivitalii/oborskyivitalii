# Article distribution preparation

Owner: [issue106](https://github.com/oborskyivitalii/oborskyivitalii/issues/106).
Public reader materials follow [ARTICLE-MATERIALS](ARTICLE-MATERIALS.md): an
explicit reviewed allowlist, shared block and immutable selected assets. Campaign
working files remain repository-only; validation now returns pending or actual
article backlinks from the publisher canonical.
The [campaign plan](../review/issue-106/2026-10-19-campaign-plan.md) owns the
approved PMDay scope; this guide owns the reusable draft contract. Article/site
publication remains PR79 / #2 / #5 and never waits for campaign completion.

## First increment and publisher dependency

Complete the [distribution brief](ARTICLE-DISTRIBUTION-BRIEF.en.md) during article
planning, before writing derivative posts. Keep it with the selected article as
`site/publications/<id>/campaign/brief.<language>.md`. The standing
[editorial review route](SITE-CONTENT-REVIEW.md) links this step now.

The publisher's `ARTICLE-WORKFLOW.md` and `loadArticle` facade are still in
unmerged PR79 at the inspected checkpoint. Do not copy its manuscript, media or
publisher into a campaign PR. After that baseline lands, add the distribution
step to its existing authoring sequence. Until then the default CLI fails with
an explicit publisher-baseline diagnostic; two synthetic articles exercise the
draft contract without claiming real-article integration.

The adapter consumes the publisher's validated `metadata.id/language/references`,
`edition.id/semanticSha256`, `sections[].id` and `assets[].id/sha256`. It neither
calculates an alternative semantic edition nor creates publication events.
References identify the claims/evidence used in a piece; claim accuracy remains
editorial review. The semantic edition conservatively pins the entire article,
so a changed source edition invalidates all its campaign pieces.

## Authored owners and schema

```text
site/publications/<id>/campaign/
  brief.en.md
  plan.json
  posts/<piece-id>.en.md
  reviews/<piece-id>.md
```

Use `uk` instead of `en` for a Ukrainian campaign. Each piece has one authored
Markdown source, including a carousel's storyboard at this stage. This increment
does not render carousels, PDFs or images. Existing publisher adapters retain full
article/platform rendition ownership. Do not create three full manuscripts.

[schema.cjs](../tools/distribution/schema.cjs) is the executable version1 schema:
all listed keys are required; unknown keys and types fail. This example describes
the format, not an accepted PMDay edition. Replace the illustrative digests with
actual SHA256 bytes and the publisher's semantic digest; never use placeholder
pins as evidence.

```json
{
  "schema": 1,
  "articleId": "example-article",
  "revision": 1,
  "language": "en",
  "brief": {"path": "brief.en.md", "sha256": "<actual brief SHA256>"},
  "source": {"editionId": "edition-one", "semanticSha256": "<publisher semantic SHA256>"},
  "budget": {"paidPromotion": 0, "paidServices": 0, "paidInference": 0},
  "d0": null,
  "channels": {"linkedin": "pending", "medium": "pending", "reddit": "skipped", "pdf": "pending"},
  "pieces": [{
    "id": "launch", "kind": "feed", "channel": "linkedin",
    "content": {"path": "posts/launch.en.md", "sha256": "<actual copy SHA256>"},
    "sections": ["introduction"], "references": [], "media": [],
    "cta": {"label": "Read the article", "section": null},
    "window": {"from": 0, "to": 0, "after": []},
    "approval": null
  }]
}
```

Piece kinds: `feed`, `carousel`, `article`, `pdf`; channels: `linkedin`, `medium`,
`reddit`, `pdf`. Windows are relative days0–365, not created calendar schedules.
`after` names existing pieces; duplicate IDs, cycles and impossible windows fail.
Feasibility propagates the earliest possible day through all prerequisites, so
indirect constraints and multiple predecessors apply regardless of declaration order.
Media entries use `{ "id": "figure-id", "sha256": "<publisher asset SHA256>" }`.
CTA destinations are the article or a validated section, never arbitrary URLs.
Zero pieces is an explicit early planning draft, not a complete campaign.

## Validation and approval records

Once the publisher baseline is available, run from the repository root:

```sh
node tools/distribution/cli.cjs validate ARTICLE_ID
node --test tests/campaign.test.cjs
```

Validation writes JSON to stdout and does not modify the repository or public
output. It reads at most32 pieces, 100KB per input and1MB total, requires regular
article-local files, rejects symlinks/traversal, verifies UTF-8 and exact hashes,
and checks the selected publisher edition, sections, references and media.

Initial copy has `approval: null`. Validation returns each piece's deterministic
`bindingSha256`, binding the source, brief, revision, admission state, authored
copy, source references/media, CTA and relative dependencies. After an actual
review, record its non-sensitive evidence at `reviews/<id>.md` and set:

```json
{
  "bindingSha256": "<binding from current successful validation>",
  "reviewedAt": "2026-10-19T10:00:00Z",
  "evidence": {"path": "reviews/launch.md", "sha256": "<actual evidence SHA256>"}
}
```

That object replaces `approval: null`; it is not a field beside it. The validator
reports `approval-recorded`, not independently approved or published. It proves
byte/source consistency, never the truth of an attested human decision. Keep
review notes public-safe; no private names, messages or outreach lists.

Any changed binding rejects stale approval. Clear the affected record and review
again; do not mechanically repin old approval. Increment the campaign revision
for a coordinated change. A piece's changed dependency must also be reviewed.

## Explicitly pending release capabilities

Every result says `draft-only`, `releaseEligible: false`, `d0: null`. Channels
can be `pending`, `declined` or `skipped`; this schema cannot grant admission.
There is no release-ready mode, actual URL/time record, kit renderer, social
posting, deployment, reminder or paid-model dependency. A `published` state or
invented URL is rejected as an unknown field. Draft validation is not channel,
rights, mobile visual or article-publication acceptance.

Next increments consume the accepted publisher's actual site publication event
for D0/canonical, validate channel decisions/current rules, package authored kits,
preserve observed publication/correction history and add aggregate D+7/D+21
review templates. Keep these criteria open until their behaviors and human
decisions are verified. Never let unfinished campaign work gate the site article.
