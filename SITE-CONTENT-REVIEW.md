# Site v1 content and release review

Checked 2026-10-01 for [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1).
This is a reviewable candidate, not a deployment or maintainer approval.

## Intent alignment

The first version has an author entry point, two clearly separated research
directions and their repository links, topic navigation, nine selected works and
a full index of 23 works, a separately dated Thinking Systems platform edition,
three public talk/workshop records, seven bounded acknowledgements and
reuse/correction information. It does not depend on full Quartz/PDF migration.
The new PMDay article and slide/PDF edition remain #2, outside the public directory.

The maintainer confirmed English UI on 2026-10-01. The permanent Pages path is
still undecided. Public-release URL and editorial/rights decisions remain in
#1/#8/#7. The current candidate additionally includes the supplied portrait,
bounded career context, EN/UA edition groups and search/topic metadata.

## Source and rights inventory

The requested follow-up expands the catalog and acknowledgements. Its complete
claim-to-source and 23-work inventory is [SITE-SOURCE-AUDIT](SITE-SOURCE-AUDIT.md),
including platform-specific dates, weaker/private evidence and discovery-link
corrections. The original six-entry baseline below remains historical review
evidence, not the complete current catalog.

Only titles, dates, format/language metadata and links are indexed from external
publications. The portrait is the maintainer's supplied photo, not an imported
platform asset. No external article body, figure, logo, slide, PDF, web font or
private correspondence is imported.

| Public item | Original record | Checked treatment |
| --- | --- | --- |
| Subprime article, 2026-02-10 | [DOU original](https://dou.ua/forums/topic/57846/); [Subprime provenance](https://github.com/UncertaintyArchitectureGroup/The-Subprime-Code-Crisis/blob/main/evidence/documentary/project-provenance.md) | Exact title/author confirmed on original; year/date also in source record. Title is historical wording, not a new site-level claim of a universal effect. |
| Cost-cutting article, 2026-01-05 | [DOU original](https://dou.ua/forums/topic/57244/); same Subprime provenance | Exact published title, author and source date. |
| UA control theory, 2025-12-13 | [Towards AI original](https://pub.towardsai.net/uncertainty-architecture-why-ai-governance-is-actually-control-theory-511f3e73ed6e) | Original title, author, date checked against uploaded export and UA archive. |
| UA modern approach, 2025-11-22 | [Towards AI original](https://pub.towardsai.net/uncertainty-architecture-a-modern-approach-to-designing-llm-applications-2fe196188fac) | Original title, author, date checked against uploaded export and UA archive. |
| On-device/cloud checklist, 2025-09-06 | [Medium original](https://medium.com/data-science-collective/on-device-llm-or-cloud-api-a-practical-checklist-for-product-owners-and-architects-30386f00f148) | Original title, author, date checked against uploaded export. |
| Architecting uncertainty, 2025-07-29 | [Medium original](https://medium.com/data-science-collective/architecting-uncertainty-a-modern-guide-to-llm-based-software-504695a82567) | Original title, author, date checked against uploaded export and UA archive. |
| PMDay talk | [Organizer's speaker announcement](https://ua.linkedin.com/posts/pmday_we-are-glad-to-introduce-new-speaker-of-activity-7493632835547889664-67od) | Short talk title and event label only; no claim that slides/article/recording are released, no copied speaker bio or statistics. |
| Markus Kopko | [Original public post](https://www.linkedin.com/posts/markuskleinpmp_uncertainty-architecture-why-ai-governance-activity-7462053122773827584-mKwf) | Describes the public CPMAI/control-theory mapping; does not claim PMI endorsement, certification or validation of all UA claims. |
| Arkadiy Dobkin | [Public UA provenance note](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/main/content/research/notes/thinking-systems-formulation-provenance-arkadiy-dobkin.md) | First-person credit for formulation, explicitly grounded in maintainer-attested provenance. Not independent proof of coinage, co-authorship, validation or EPAM endorsement. No private exchange quoted. |

The homepage bio adds qualitative self-reported career context from the public
profile: more than 20 years in IT, quality engineering, project management,
PMO/delivery and resource/risk/organizational work. It does not introduce current
employer, portfolio size, client names, quantified results or private
career/communication details. No unverified edition URL is fabricated.

The credits page reflects the absence of a site-wide license decision. The
Apache-2.0 notice for the separate RI tooling does not license the site or its
linked publications. The inventory informs human rights review, not a legal
determination or automatic publication approval.

## Validation and remaining release work

The optional visitor-theme script selects light from 07:00 to 19:00 in the
device's own time zone and dark otherwise. Day/Night overrides are saved locally;
Auto restores the clock rule. No location service, analytics, remote runtime or
package dependency is introduced. Without JavaScript, CSS uses the device's
light/dark preference. Theme controls are hidden until they become functional.
Print styles use a light palette. Behavioral tests include real differing time
zones, boundaries, storage failure, manual persistence and returning to the tab.

- HTML/local-link/fragment and public-directory checks are recorded in the PR.
- Original-public pages above were retrieved through public web search; source
  metadata was checked without relying on search snippets as article substance.
- Actual browser visual review on desktop/mobile is still pending. The runtime
  has no working local browser binary, and the cloud browser cannot visit local
  HTTP or file URLs. A standalone review preview is supplied outside `docs/`;
  this limitation must not be reported as passed visual QA.
- Independent reviewer `/root/independent_workflow_review` inspected all site
  changes, original sources, attribution scope, public-file hashes, local links
  and preview parity. The reviewer found a Git-checkout/worktree RI portability
  defect; the correction was independently **Confirmed** at site policy tree
  `aa586fa407091c93af62213c5881d8286f492fcc` using actual checkouts/worktrees.
  That confirmation describes the previous first-site candidate.
- The same independent reviewer separately **Confirmed** the requested
  theme/catalog/acknowledgement revision at local commit
  `d73aff423bb7a6521009d3da0117506aaf7f2f20`, tree
  `55d31302523c0a9d87c6a3743ec6e47ff58cbaae`, on 2026-10-01. The reviewer
  independently executed six Node behavioral tests and 18 Python tests;
  inspected the original interaction records, bounded publication metadata,
  HTML/local navigation, preview parity, all six public hashes, CSS fallback/print
  rules and RI freshness in worktree and ordinary checkout. The source correction
  distinguishes cached Traceability metadata from later reader access limits and
  independently indexed Atlassian edited-date metadata from the current reader.
  This is static/content/behavior confirmation; actual browser visual review and
  human editorial/rights/release decisions remain pending. The corresponding
  remote candidate is `9446b6bcc568bef0c4cfa136892624981950f032`; its identical
  tree and successful navigation/theme/RI CI were separately checked by the
  implementer. Subsequent review-record-only commits do not expand this scope.
- The portrait/English/SEO revision changes the public bytes. Both independent
  confirmations above are historical and do not confirm this edition. Fresh
  independent/editorial/rights acceptance is not claimed by implementer tests.
- Record maintainer URL/editorial/rights choices, merge, enable Pages,
  inspect the live deployed site and record the deployed commit before closing #1.

## Preview handoff correction — 2026-10-01

The maintainer could not see the revised site in the supplied preview. The
original review file contains only the homepage; its full catalog is a relative
link and its theme control requires JavaScript. The viewer's actual script/cache
behavior is not established. Six newly named, review-only copies now provide
Day/Night for the homepage, complete writing index and credits, with embedded
public CSS and visible ordinary theme links. Each copy labels its fixed theme;
it is not an Auto demonstration or a deployed edition. Keep all six files
together for local navigation, or use the individual direct artifact links.

`tools/build_site_previews.cjs` deterministically exports these copies;
`review/site-v1-static-previews.json` records exact input/output hashes. Three
additional implementer-authored tests check public main-content/CSS/external-link
parity, all six copies' local navigation/fragments and manifest/fail-visible
behavior. The previous independent confirmation remains limited to its recorded
candidate. This handoff correction does not modify any public file or claim new
independent/browser/release acceptance.

See [SITE-OPERATIONS](SITE-OPERATIONS.md) for exact preview/launch/article steps.

## Current portrait/language/SEO edition — 2026-10-01

Current review files are the six `site-v1-20261001-v2-*.html` copies, exported by
the same bounded helper with `review/site-v1-static-previews-v2.json`. They embed
the exact current CSS and, on the homepage, the unretouched supplied JPEG. Earlier
previews/manifests remain historical. Review copies have no executable theme
script and use fixed Day/Night links; non-executable JSON-LD metadata is retained.
They are marked noindex and stay outside `docs/`.

English is an explicit maintainer decision, not an assumption. EN/UA visible
labels separate 20 English and 3 Ukrainian article editions; machine codes are
`en`/`uk`. PMDay is Ukrainian; Corning and Betelgeuse spoken languages remain
unconfirmed. Original titles, platform dates and URLs are preserved. Article-list
schema uses Atlassian's edited date only as `dateModified`.

[SITE-SEO](SITE-SEO.md) maps the actual vocabulary to visible content/owners and
records the implemented metadata, author identity, topics and deferred
URL-dependent canonical/social-image/sitemap work. It promises no ranking or
indexing outcome. The [complete Medium replacement](drafts/medium-profile-revision-20261001.html)
is a review draft outside the public directory; Medium itself was not edited or
deleted. It removes stronger validation/adoption interpretations and unsupported
metrics rather than just amending the profile's introductory paragraph.

Implementer checks: six theme tests, three handoff tests, four public-content/
metadata/language/asset tests and 18 Python tests. Preview hashes, local resource
targets and draft isolation are checked. These are not desktop/mobile/print
browser inspection or human asset-rights acceptance. The current public manifest
has seven files including the 100,768-byte portrait. Fresh review, stable URL,
rights/editorial decision, integration/merge and actual deployment remain open.
