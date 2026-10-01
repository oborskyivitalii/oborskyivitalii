# Site v1 content and release review

Checked 2026-10-01 for [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1).
This is a reviewable candidate, not a deployment or maintainer approval.

## Intent alignment

The first version has an author entry point, two clearly separated research
directions and their repository links, topic navigation, six published-article
links, one public PMDay speaker announcement, bounded acknowledgements and
reuse/correction information. It does not depend on full Quartz/PDF migration.
The new PMDay article and slide/PDF edition remain #2, outside the public directory.

English and the existing project Pages path are provisional preview assumptions.
The questions have no recorded answer. Public-release URL/language and
editorial/rights decisions remain in #1/#8/#7.

## Source and rights inventory

Only titles, dates, format/language metadata and links are indexed. No external
article bodies, figures, logos, portraits, slides, PDFs, web fonts or private
correspondence are imported.

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

The homepage bio is deliberately limited to the maintainer's public work areas.
It does not introduce current employer, portfolio size, client names or private
career/communication details. Recent publications lacking a verified original
edition URL in this pass are not fabricated into the selected index.

The credits page reflects the absence of a site-wide license decision. The
Apache-2.0 notice for the separate RI tooling does not license the site or its
linked publications. The inventory informs human rights review, not a legal
determination or automatic publication approval.

## Validation and remaining release work

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
  The public files retain the hashes of the inspected content; no further material
  static/content defect was found. This does not complete browser or release review.
- Record maintainer URL/language/editorial/rights choices, merge, enable Pages,
  inspect the live deployed site and record the deployed commit before closing #1.

See [SITE-OPERATIONS](SITE-OPERATIONS.md) for exact preview/launch/article steps.
