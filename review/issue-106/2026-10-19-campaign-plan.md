# Issue 106 — article distribution workflow and organic campaign plan

Owner: [#106](https://github.com/oborskyivitalii/oborskyivitalii/issues/106).
Execution branch: `work/issue-106-article-distribution-20261019`; its linked Draft PR is recorded in the issue.
Role: ChatGPT planning/self-review; no independent review or implemented campaign is claimed.
Base: main `0098f804cb3b0d120173d4c8689043db42231c47`.
Inspected concurrent article PR79: `a7c1f2f42973999c59c6385a275a2db7f29b5f8a`.
Incoming author-approved proposal: `PMDay_R12_Organic_Campaign_Plan.md`, 19 October 2026, SHA-256 `dac1ae6c825084561f355cb44f84dd90678caa1b81ab72a388c538180240bcb7`.

Status: planning foundation. This record translates the approved proposal and the subsequent explicit ownership split into one execution plan. It does not mean the tooling, copy, carousels or campaign are complete. Actual source-check evidence is linked from the owning PR; future content, channel and publication gates remain pending.

## 1. Intent and ownership decision

Distribution planning becomes part of article preparation, with a reusable brief, authored derivative content, isolated kit production, manual publication and an honest results loop. The first campaign is for *The Sum of Our Technology*, with the approved R12 and Cover02 as the inspected editorial inputs. Bind to the actually approved release edition before distribution; R12 is not an immutable assumption about future approval.

The maintainer explicitly requested a separate issue and PR on 19 October:

- **PR79 / #2 / #5:** finish and publish the article and necessary website/reader/publisher work. Original publication, rights, source and technical acceptance stays there.
- **#106 / this separate Draft PR:** own the reusable distribution workflow and the organic campaign preparation, consuming the publisher and admitted article rather than duplicating them.
- **Dependency direction:** published article/source/URL → campaign release binding. Campaign tooling, Reddit, later carousels or measurement upgrades must never block the site article's first publication.

This supersedes the incoming proposal's suggestion that all distribution work remain under #2/#5. It does not transfer or close any existing criterion. The new branch starts from main, not from unmerged PR79; rebase onto the accepted publisher when needed. Do not copy its manuscript, media, site code or deployment changes into this branch. This planning increment changes no article, public site, social account or production setting.

Related owners: #41 for public source/discussion history; #8/#102 for measurement; #104 for conversion work. Personal outreach recipients and messages are a separate future private workstream.

## 2. Goal, budget and channel roles

Primary goal: relevant engineering, delivery and architecture discussion and engaged readers. Secondary observations: native reads, saves, shares, site referrals and relevant profile discovery. No reach, leads, recruitment or algorithmic preference is promised.

Position: **What must remain true when we delegate implementation and runtime judgment?** Preserve the essay's positive evidence, real baseline and openness to results. Do not reduce the campaign to a vendor takedown.

Budget: no paid promotion, new paid marketing service or paid-model API dependency in CI. Use existing repository infrastructure within available quotas; those quotas are finite, not a promise of unlimited free compute. Human editing happens before deterministic packaging.

| Surface | Role and treatment |
| --- | --- |
| Website | Authoritative full public edition, source/figure references, corrections and ungated PDF download. Actual first publication remains PR79. |
| LinkedIn article | Full native reading and professional discussion; retain argument, evidence, figures and link to the original. Use existing rendition/adaptation contracts. |
| Medium | Full equivalent cross-post, actual site canonical, source credits and required AI-assistance/image disclosures; keep this campaign edition outside a paywall. |
| Full PDF | Exact portable reading/review edition for forwarding and offline reading, not the mobile carousel. |
| LinkedIn feed | Six self-contained miniarguments/announcements across about three weeks, including three document carousels. |
| Reddit | Conditional technical critique under actual community rules, not a traffic, consulting or employment funnel. |

No three independently edited full manuscripts. Formatting may change; a substantive shortening is an explicit adaptation with its own review and derivation. No automated posting, commenting, DMs, mass tagging, vote coordination or social credentials in the public repository.

## 3. Link policy

Default private LinkedIn message: one direct website **article** URL or pertinent section anchor, not the homepage or a menu of five equivalent formats. Use the native LinkedIn article for discussion already occurring there, the exact feed-post URL for a voluntary repost, and the PDF for requested review/annotation/offline forwarding. Add a current-web-version link to the PDF when a real public URL exists.

One relevant CTA per piece. Do not assert that external links are suppressed in private messages or that putting links in comments guarantees reach. Specific recipients, their prior conversations, message drafting and sending are outside this increment and must remain private.

## 4. Relative campaign calendar

**D0 is the verified website-publication date**, not the day of a commit, a deployment attempt or this plan. Until publication is observed, D0 and the public canonical are null. This calendar is not a created schedule or authorisation to post. Timing can change with real feedback and the author's capacity to reply.

| Window | Material | Purpose |
| --- | --- | --- |
| Pre-D0 | Full reading renditions, full PDF treatment, launch copy, first carousel and remaining source-bound storyboards | Prepare enough to begin; do not delay the site article for all later assets or tooling. |
| D0 | Website → LinkedIn article → one launch feed touch | Explain the two shifts and give one clear reading route. Count the native article's launch share here, not as permission for a duplicate announcement. |
| D+1–2 | Medium full article | Additional reading venue; inspect actual canonical, images, disclosures and links. No near-identical second LinkedIn announcement. |
| D+4 | Carousel 1: faster generation is not a balanced delivery system | Controlled intake, necessary-stage capacity and evidence versus illustration. |
| D+8 | Carousel 2: an escalation path is not human capacity | Coverage, load, evidence, authority and the decision to withhold consequential permission. |
| D+11–12 | Evidence/discussion post: what would justify more delegation? | Positive findings, actual baseline and operating examples; no blanket rejection. |
| D+16 | Carousel 3: useful capability is not yet realised value | Customer learning, adoption and improved outcomes rather than release count. |
| D+20–21 | Practical closing post | Bounded-pilot questions; incorporate only genuinely observed feedback. |
| D+7–14, conditional | One Reddit discussion | Technical critique after admission; a skipped/declined channel is acceptable. |

Six LinkedIn feed pieces total: launch + three carousels + one evidence post + one practical closing post. The last piece has a prepared outline but cannot claim discussions or findings that never happened.

## 5. Carousel, cover and PDF requirements

Three carousels, approximately six to eight frames each, use the Cover02 visual family. Proposed uniform canvas: 1080 × 1350, an editorial design choice rather than a claimed platform requirement. Each piece has a distinct argument: assurance/problem → **What if not?** → concrete scenario/figure → engineering decision → useful question and concise source/current-article pointer. Include accessible text and readable source attribution.

Carousels are not arbitrary cuts from the manuscript. The original seven presentation images remain unchanged in the article/PDF. Make separately labelled, approved simplified diagrams where necessary for phone reading; do not shrink dense slides into illegibility. Do not convert NBER line estimates into value multipliers, omit that 8/100 is synthetic, or quote Parikh as abolishing all review. Keep Lem's quotations, translation provenance and the author's own sentences distinct.

The existing 15-page R12 PDF is a reading artifact. Before wider distribution, preserve its exact edition/date and link to the current website version; never remove draft status without actual acceptance. No email gate. Its mixed orientation makes it a different layout from the uniformly sized carousel PDFs. A one-page pilot aid may be derived later but is optional and nonblocking.

Image adaptations already exist in PR79's Cover02 manifest. Reference and reuse them after integration, rather than recommitting an independent image collection here. Full platform articles consume existing publisher profiles; no new prose hidden inside renderer code.

## 6. Platform admission and low-effort distribution

Platform-policy notes in the incoming proposal were researched on 19 October 2026; they are **dated inputs, not permanent permission or fresh verification by this PR**. Recheck current official documentation, account capabilities and community rules before author approval.

### Medium and LinkedIn

For Medium, import or configure the actual final HTTPS website URL as canonical, then inspect the published setting/content. A visible source-credit link alone is not a canonical setting; canonical is not a search-ranking guarantee. Preserve evidence and figures and provide accurate AI-assistance/image disclosures where required. Do not promise Boost or eligibility.

For LinkedIn, review native formatting, sources, images, disclosures and the single chosen CTA. The incoming document-post guidance says an uploaded PDF cannot be replaced in place and pages should have uniform size; verify the current correction route before publication. Do not equate native publication with a notification or reach guarantee.

### Reddit

Recover the author's previous public conversation via the existing source audit under #41 rather than guessing the subreddit from memory. The incoming proposal examined r/softwarearchitecture as a candidate and recorded restrictions on AI-generated content, promotion and personal-site/job solicitation. It did not establish admission of this essay.

State: pending rule/moderator review. Clarify the human-led/AI-assisted process honestly where needed. If accepted, the author supplies a genuinely authored, self-contained technical discussion under the community's rules. No disguised generated advertising, retries after rejection, bulk cross-posting or coordinated votes. Allowed, declined and skipped are explicit outcomes; renderer success cannot override them.

Suggested technical question: how do you verify that a human approval gate works under real workload? Use the bounded account-recovery scenario, not a hiring/booking CTA. This remains an outline, not a ready Reddit post.

### Other inexpensive actions

One relevant item in LinkedIn Featured; a short PMDay organiser handoff for their recording/digest; an approved description/cover/link for voluntary supporters; appropriate existing internal links after publication. Never write a fake endorsement for someone else to copy. At most one or two additional relevant free communities/outlets after admission checks. No new newsletter, paid tools, video production or many additional channels as launch prerequisites.

## 7. Proposed reusable workflow

### Authoring and lifecycle

Brief at article planning → source-bound derivative arguments → author-reviewed copy → deterministic render/check → review kit → verified site publication → author-controlled native publication → observed URL/edition/time → aggregate results/corrections.

The standing guide will be linked from ARTICLE-WORKFLOW after its producer baseline lands. The concrete schema and paths below remain a design proposal to validate during implementation, not an active engine created by this planning PR:

```text
site/publications/<article-id>/campaign/
  brief.en.md
  plan.json
  posts/<piece-id>.en.md
  carousels/<piece-id>.json
  reddit/admission-and-outline.en.md

guides/ARTICLE-DISTRIBUTION.md
dist/campaigns/<article-id>/<artifact-id>/
```

Authored copy/data belongs with the article; generated kits are immutable outputs, not hand-edited docs. The reusable producer extends existing publisher adapters rather than creating a second content registry. Dated campaign review and non-sensitive aggregate evidence stay under issue106. Existing article publication events remain the authority for the published edition; campaign observations reference them, never invent a replacement publication event.

Plan data: article ID, edition and semantic digest; campaign revision; language/audience/goals; paid-promotion budget zero; D0 or null; channel admission; piece ID/type and source sections/claims/figures; authored files/digests; CTA/destination; relative day/dependencies; approval state; actually observed URL/time; report window and correction treatment.

### Production and safety boundaries

Implement light validation on relevant changes and a separate explicitly invoked kit build for a selected article/ref. The campaign build is read-only to the repository, bounded and uses pinned dependencies. It does not call a paid model, invent prose, deploy the site or store social credentials. It produces copy-ready files, channel images, carousel PDFs, inspection previews and a manifest.

Draft preview may explicitly say canonical pending. **Release-ready** output rejects unknown/unverified destinations, staging URLs, stale approvals and inadmissible channels. Any source/figure/claim change requires affected derivative revalidation; a successful renderer does not supply editorial approval. Actual publishing is manual. Record real URL/time/edition only after observation. Preserve corrections/history and pause affected pending pieces when a material claim changes.

A second synthetic article must prove reuse. Campaign-only edits cannot change the selected manuscript or public build. Tests must show the refusal paths, not merely match generated filenames or prose.

## 8. Measurement and privacy

Use available native metrics and existing site aggregates, initially in a small manual log. D+7 and D+21 review relevant replies/examples, substantive shares, reads, saves/sends where available, site entries/referrers and ensuing author opportunities. Compare equal elapsed windows. Impressions are not readers; readers are not conversations; a sent PDF is not a measured read.

The inspected analytics contract lacked custom-event/UTM analysis and had separate article-route admission. Revalidate #8/#102 before promising collection; conversion instrumentation remains #104. UTM labels do not create a collector or attribution model. Do not identify anonymous savers/readers. Public records contain aggregate observations only—no contact names tied to private conversations, message text or secrets.

Low response calls for reviewing usefulness, audience, hook and format, not automatic volume increases. Reduce cadence when meaningful replies exceed author capacity. Correct material factual errors and re-review affected unpublished pieces. Do not fabricate evidence for the closing post.

## 9. Findings, tasks and acceptance map

| Finding | Evidence/implication | Disposition |
| --- | --- | --- |
| F01 | User explicitly splits campaign ownership from article/site PR79 | Create separate #106 Draft PR; no publication dependency on this issue. |
| F02 | Existing publisher already owns full manuscript, media, profiles and publication events | Reuse the accepted contracts after integration; do not duplicate unmerged code. |
| F03 | Native platform/admission and analytics capabilities are external and changeable | Retain dated sources and revalidate before publishing; no speculative metrics. |
| F04 | Source shortening can lose numerical or quotation boundaries | Bind derivatives to exact source and combine negative tests with human review. |

| Task | Owning path/change | AC | Verification / status |
| --- | --- | --- | --- |
| T01 | This plan, issue, linked Draft PR, path catalog and initial policy | AC01, AC10 | Planning foundation only; source evidence linked in PR. |
| T02 | Campaign guide, brief/schema and article-flow hook | AC02, AC03 | Pending; schema/unknown-field, path, stale-source/approval and second-article tests before implementation. |
| T03 | Six authored feed pieces and three carousels using declared media | AC04, AC05 | Pending; numerical/quote/caption checks plus mobile/author review. |
| T04 | Channel admission, canonical/release-ready validation | AC06 | Pending; unknown/denied Reddit, missing Medium disclosures/canonical, invalid/staging destinations reject. |
| T05 | Isolated campaign kit command/workflow and manifests | AC07 | Pending; uniform pages, overflow/missing-resource checks, deterministic inputs, bounded no-deploy/no-posting behavior. |
| T06 | Manual operator guide, observed publication/correction records | AC08 | Pending; generated-versus-published distinction and correction/invalidation negatives. |
| T07 | Aggregate D+7/D+21 report templates and privacy boundaries | AC09 | Pending; unavailable metrics stay unknown, no private data or invented feedback. |
| T08 | Exact-source validation and independent/editorial completion | AC10 | Pending whole acceptance; no source check substitutes for release or human gates. |

### Planning-check scope and style mapping

Initial issue106 policy deliberately reuses existing Basic, style, RI/catalog and RI/CI checks for **planning-source hygiene only**. AC02–AC09 also carry an explicit implementation gate: those features are not yet built or tested. Before writing campaign code, add meaningful named assertions for each behavior above and revise its automated scope. Never mark an unimplemented criterion complete because a generic source check is green.

Applicable CS01/02/04: one plan owner, no active campaign code under review, no copies of manuscript/renderer; CS05: scoped UTF-8/LF/JSON formatting; CS07/08: bounded source checks, unchanged budgets, no browser/deployment campaign for a plan; CS09/10: guard plus explicitly labelled self-review. CS03/06 have no CSS/runtime delta. Independent content/rights/admission review remains external.

This session may tick only AC01 after verifying its exact issue/PR/file links and self-reviewed scope. AC02–AC10 remain open for implementation and applicable human gates. The complete issue remains open. A new Draft PR is an execution container, not a promise that all planned functionality already exists.

## 10. Ordered next actions

1. Finish this issue/linked planning PR and preserve its exact source-check evidence. Do not merge or deploy.
2. Implement the smallest campaign brief/schema/validator and standing-flow hook after reconciling the accepted publisher interface. This can follow article publication.
3. Review the launch text and first carousel, then use that agreed design for the remaining pieces. Keep final reflections editable for real feedback.
4. When the article actually goes live and the author authorises native distribution, bind D0/canonical, publish manually, inspect and record.
5. Review at D+7/D+21, adapting within the approved goals. Reminders are a separate explicit request.

## Source and revalidation register

Incoming proposal's official references, retained for rechecking rather than asserted freshly verified by this planning PR:

- [Inspected publisher contract](https://github.com/oborskyivitalii/oborskyivitalii/blob/a02fd9b4db576e1edae95c18ad0030d67d185ac6/guides/ARTICLE-WORKFLOW.md) and [analytics contract](https://github.com/oborskyivitalii/oborskyivitalii/blob/a02fd9b4db576e1edae95c18ad0030d67d185ac6/guides/SITE-ANALYTICS.md).
- [LinkedIn documents](https://www.linkedin.com/help/linkedin/answer/a518909), [articles](https://www.linkedin.com/help/linkedin/answer/a522427), [Featured](https://www.linkedin.com/help/linkedin/answer/a553419), [post analytics](https://www.linkedin.com/help/learning/answer/a516971).
- [Medium canonical](https://help.medium.com/hc/en-us/articles/360033930293-Set-a-canonical-link), [import](https://help.medium.com/hc/en-us/articles/214550207-Importing-a-post-to-Medium), [AI policy](https://help.medium.com/hc/en-us/articles/22576852947223-Artificial-Intelligence-AI-content-policy), [disclosure guidance](https://medium.com/blog/medium-is-for-human-storytelling-not-ai-generated-writing-b5f7ffdc96cf).
- [r/softwarearchitecture](https://www.reddit.com/r/softwarearchitecture/): candidate only; recover previous thread via #41 and verify actual admission.

## Issue synopsis

Separate planning route established for #106. Article/site first publication remains PR79 / #2 / #5 and is not blocked by campaign implementation. Approved organic scope, relative schedule, safe source/quote handling, manual channel admission/publication, zero-paid constraint and future checks are recorded here. Next work is the bounded campaign brief/schema/validator, not another article rewrite or production release.
