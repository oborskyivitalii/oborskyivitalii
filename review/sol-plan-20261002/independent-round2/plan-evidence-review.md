# Second independent review — execution, evidence and decision relevance

Reviewer: `/root/round2_plan_evidence_review`, 2026-10-02. I did not author the plan, its corrections or the preceding reviews. No repository source, GitHub record, service account or deployed site was changed.

## Target and verdict

Reviewed `oborskyivitalii/oborskyivitalii`, Draft PR #10, head `25d49c9c4e308bec6e499a30530889602507fb67`, tree `4acb79769efe333e76e7b9f0582fa6c7a9463270`, branch `work/site-v1-20261001`, based on PR #9 at `0adc52500f6986a145f1873aaefb80d563da8e7e`. Fresh GitHub metadata confirmed both PRs remain open Drafts and those head/base identities. Fresh issue #1/#8/#11 bodies preserve candidate, release and later-publication boundaries.

**The plan is substantively ready to begin the scoped candidate work after the execution instruction. I found no P0/P1 evidence or execution blocker. One small shared-renderer contract omission should be settled during S2, before S3 is treated as complete.** It needs a local implementation decision, not another positioning exercise, service, framework or release gate. Nothing in this verdict accepts future implementation, browser quality, research validity, rights, merge or deployment.

I reached and sent this provisional judgment before reading `FINAL-REVIEW.md`, `INDEPENDENT-REVIEW.md` and the six previous lane reports. Their verdicts were not the premise of this assessment. Live issue/PR history necessarily exposed summary statements about prior review; I checked the underlying plan/code/data independently.

## Finding

### R2-E1 — P2: define the semantic scene path outside Home, including zero/one-stop cases

**Evidence:** `SOL-HANDOFF.md:118–125,140–150`; `VISUAL-SPEC.md:73–85`; `scene-blueprint.json:455–556`; `docs/space.js:33–48`; `docs/research.html:34,53–61`; `docs/writing.html:449–454`; `docs/talks.html:34`; `docs/credits.html:26–34`.

The planned replacement uses semantic stop IDs and named camera position/target paths. The blueprint supplies seven Home section mappings, and the prose supplies Writing topic focus. The same `space.js` is loaded by all five pages, however. Actual secondary-page stops are:

| Page | Existing stops beyond the Home contract |
| --- | --- |
| Research | Unnamed introduction; `research`; `lenses`; `topics`; `acknowledgements` |
| Writing | Unnamed introduction; `year-2026`; `year-2025`; filtering can remove both year sections |
| Talks | One unnamed introduction |
| Credits | No stops |

There is no explicit map/default for these cases in the plan or blueprint. The current renderer handles fewer than two stops by falling back to total document progress (`space.js:43–44`). Simply replacing ordinal progress with semantic pose lookup cannot preserve that behavior automatically: some IDs have no pose, and zero/one-stop pages have no interpolation interval. Reusing Home poses by ordinal position would also undo the semantic contract.

**Consequence:** the implementer must invent secondary-page behavior while replacing the shared renderer, and S2/S3 lack a definite acceptance target for it. This is a contract omission, not a demonstrated crash in the existing implementation.

**Minimal treatment:** add a small page/stop-to-path mapping or explicit safe default during S2. State the behavior for Research, Talks, Credits and a Writing result with zero/one visible stops; reuse the existing scene and a finite overview/default path where appropriate. Name what happens when a stop is unknown. Keep Writing topic focus and Off/reduced freezing authoritative. Include these cases in the existing bounded scene checks and inspect them with the already-required five-page browser review. Do not add a renderer abstraction or new camera choreography merely to fill the table. This does not block S0/S1.

## CPC: meaning, origin, use and leakage

**CPC is “cost per click,” an advertising metric. It is not a currency, a consulting price, a site charge or money spent by this project.** `cpc_currency` is the unit field that would identify the currency of a CPC estimate. Here that unit remains unknown.

Fresh primary documentation checks support the interpretation: [RankSpot's checker](https://www.rankspot.ai/free-tools/keyword-search-volume) describes CPC as average advertiser cost per click and returns it alongside volume and advertising competition; [Google Ads' definition](https://support.google.com/google-ads/answer/116495?hl=en) explains CPC in terms of ad clicks. The retrieved provider methodology does not identify the currency. I opened documentation only and submitted no keyword check.

The exact local chain is:

1. `review/seo-20261002/raw/rankspot-batch1.json:20–26`, for example, stores `ai governance consulting`, volume `140`, `cpc: 33.9`, competition `MEDIUM`, index `57`. The other four raw batches use the same fields. None of the 25 result objects contains a currency field.
2. `review/seo-20261002/keyword-metrics.json:3–17` retains that number as `cpc_provider_estimate: 33.9`, with `cpc_currency: null` and distinctly named `paid_ads_competition` fields. It also keeps organic difficulty null.
3. `keyword-evidence.json` embeds 63 metric objects: 13 in historical `seeds`, 25 in `free_keyword_metrics`, 25 under the 20 `selected_keywords`. Alongside 25 master rows, this is **88 normalized copies**. I traversed every copy and checked CPC/volume/competition against its raw keyword/country row. All agree with the stated no-data rule; every currency is null. Eight raw `noData` results normalize to null, rather than zero-demand claims.
4. The field's recorded history says the previous normalization called it `cpc_usd_provider_estimate`. That label asserted a currency the retained evidence did not support; the current target has corrected it. The old identifier now occurs as an explanation of the correction, not as a live metric key.

The reason money-like numbers entered the accompanying material is therefore straightforward: the free volume checker returned advertising metrics in the same response, and normalization retained them. Retaining those fields was unnecessary for the site's current organic-discovery and wording decisions. It does not imply an advertising campaign or paid-campaign strategy.

**Decision use:** I inspected all 20 current selected-keyword recommendations and owners. None bases a priority, page, offer or budget on CPC/ad competition. Current recommendations use topical fit, intent distinctions and qualified search estimates. The plan expressly rejects treating CPC/ad competition as organic difficulty or using unknown-currency numbers for budgets (`SEO-EVIDENCE.md:101–115`). Costs in the proposed buyer problems mean a prospective client's AI-tool/delivery/agent operating costs; they are separate from CPC and do not introduce service prices.

**Source/output path:** no CPC, currency, RankSpot or keyword-metrics reference was found in the actual five `docs/*.html` pages, `docs/*.js`, CSS or their resource references. `tools/build_site_previews.cjs:79–104` reads CSS, the cutout, three public scripts and five HTML files; it does not consume the SEO data. `tools/build_site_bundle.py:15–19` packages `docs/` and specifically named review HTML, not `review/seo-20261002` or plan Markdown. The historical proposal checker only checks its named historical manifest files. The SEO material appears in internal plan/review/navigation records, not in the inspected public-source dependency path. The runtime contains no pricing, checkout, ad campaign or payment integration.

This is a source/producer conclusion. I did not inspect an actual deployed site or claim complete acceptance of the generated HTML/ZIP placeholders. The retained collection records say no purchase or account creation occurred; I did not audit external billing accounts.

## Substantive readiness assessment

| Stage | Assessment |
| --- | --- |
| S0 | Freezing 27 primary identities plus the independently dated LinkedIn rendition before editing is the right preservation boundary. It avoids mistaking HTML/schema agreement for preservation. Live-ref recovery is necessary for the stacked PR and preserves newer work. |
| S1 | The audience, two buyer problems, three scoped offers, five fixed English works and eight bounded discussion entries have concrete copy/source owners. Content precedes visual calibration. Working LinkedIn contact makes the candidate useful while booking is unavailable. No service-price or appointment invention is required. |
| S2 | A small Canvas 2D graph with fixed geometry is proportionate to the explicitly requested scene. The plan honestly leaves throat geometry, two missing topic paths, noncoplanar-face handling and viewport calibration to implementation. The same-world fallback and static-first checkpoint make feasibility assessable before animation; R2-E1 completes the shared-page contract. |
| S3 | Pointer removal, native scroll, semantic local progress, bounded settling, frozen Off/reduced poses, hidden/print cancellation, topic-only focus and URL/hash/history precedence form a coherent contract. Visible empty states and no-JS anchors prevent the navigation cleanup from becoming a purely cosmetic filter change. The old tests must be updated as already specified; their success does not implement the new behavior. |
| S4 | A named new edition, both producers/manifests, exact source review metadata and actual browser observations cover the important delivery risks. Screenshots versus motion logs and unit tests versus rendering are correctly distinguished. No new test stack is justified. |

The SEO evidence is relevant as a limited vocabulary check, not validation of business demand. I independently recomputed 25 country/phrase rows for 20 phrases, 17 positive estimates/eight no-data results, and autocomplete's 56 requests/28 inputs/492 occurrences/256 unique strings. The 48-row CSV remains a distinct historical hypothesis inventory. Every current selected phrase has a clear page/issue/status, and broad framework/evaluation/observability terms do not create additional launch pages. The proposed delivery/production guides remain #11 after first launch and the PMDay #2 overlap check. This is a restrained use of weak discovery evidence.

The execution/release split is correct: S0–S4 can produce a complete candidate with relative links and the agreed booking state; permanent URLs, accepted rights/editorial treatment, #9→#10 integration, updated-base checks and deployed-edition verification remain distinct. The release table does not make paid tooling, calendar configuration, CRM, new services pages or sibling research work prerequisites.

## Optional observations, not blockers

1. **Reduce advertising-data prominence in future decision-facing material.** Preserve raw replies. A compact decision view only needs phrase/country, estimate-or-unknown, source/time limits, intent, owner and treatment. CPC/ad competition may remain in raw evidence or the master normalization without being copied into every selected/historical record. Removing these unused copies would not change any current recommendation. Do not delete raw evidence or create a data-platform migration for this cleanup.
2. **Scope the noindex statement precisely.** `SOL-HANDOFF.md:192` says all review output stays noindex; `SITE-OPERATIONS.md:65` has similar wording. The 15 preview HTML transforms do inject noindex (`build_site_previews.cjs:49,74`), but the bundle's `site/` entries are exact `docs/` bytes (`build_site_bundle.py:15–19`), whose five HTML pages intentionally lack noindex. Distinguish those source-site files from the noindex review renditions in the next output record, or explicitly choose a documented bundle-only transform. Do not accidentally add noindex to production to make the wording true. No deployed indexability defect follows from this local source observation.

## Comparison with earlier reviews

After forming the judgment above, I read the author review, independent summary and all six lane reports. The already-corrected archive units, hidden fragment targets, Credits copy, unsupported USD label, competing phrase owners and collection-population labels are genuinely addressed in the present contract/data; I did not report them again as open work-plan defects. R2-E1 concerns a different surface: semantic camera dispatch across shared secondary pages. The CPC explanation here independently traces the current raw-to-normalized-to-producer path rather than accepting the earlier correction verdict as proof.

## Independent checks, coverage and limits

- Read root `AGENTS.md`/`CONTRIBUTING.md`, the entire handoff, content/buyer/SEO/visual briefs, query map, provenance, scene data and SVG structure; inspected source/rights/operations/SEO/roadmap/backlog ownership and the actual five public pages, CSS, three scripts, both current export producers, historical proposal checker, Node tests and review manifests. Raw/normalized evidence was parsed and traversed directly, including every current recommendation and all CPC objects.
- Recomputed 79 actual local Git blob hashes against the coordinator's parent-fetched remote tree inventory; all matched, and these files also matched the frozen round-two baseline. This is independent local identity verification against that supplied tree inventory, not a second fetch of all 79 remote blobs. Live PR metadata was independently retrieved.
- Recomputed all seven `COLLECTION-MANIFEST.json` preserved-source hashes without discrepancies. Directly checked the 27-row/20-EN/7-UA archive, 27-item schema agreement and separate Thinking Systems LinkedIn URL/date.
- Ran the existing archive tests directly: **3/3 passed**; existing space tests directly: **4/4 passed**. These are baseline behavioral checks, not acceptance of the proposed changed contract. No new test framework or source tests were written.
- Fresh web checks were confined to RankSpot methodology and Google's CPC definition because they answer the current currency/meaning uncertainty. No free quota, signup, campaign or paid service was used.
- The private Executive Brief, original package ZIP and complete upstream research were not re-audited in this lane. Their admissions/ownership/exclusions were inspected. I do not independently reconfirm all article originals or public-discussion sources from the prior content reviewer; that prior work remains separately attributed. No source-science validation or legal clearance is claimed.
- The 36 declared zero-byte historical HTML/ZIP/binary paths are existence-only snapshot placeholders, not repository defects. I did not run full export/asset acceptance, inspect them as actual outputs, or claim browser rendering, frame-rate measurement, accessibility conformance, live CI or deployed-state verification.

Bounded re-review can be limited to the secondary-page scene contract and any consequential change; the optional observations need not delay the authorized candidate work.
