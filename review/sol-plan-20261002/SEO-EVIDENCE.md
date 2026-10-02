# Free SEO evidence and implementation treatment

Collected 2026-10-02. This dated amendment updates the earlier qualitative plan.
It records input for #1/#8/#11; it is not a public traffic or client-demand claim.

## What was obtained

- RankSpot's public free checker returned **25 country/keyword results for 20
  unique English phrases**: 20 US checks and five UK checks. Seventeen results
  contain positive volume estimates; eight explicitly returned no data.
- The [provider](https://www.rankspot.ai/free-tools/keyword-search-volume) says
  its source is Google Ads and the metric averages the last 12 months. These are
  provider-reported estimates, not a direct Google export. Exact window dates,
  upstream refresh date and language targeting were not returned.
- Fifty-six Google autocomplete requests (28 seed inputs with `gl=us`/`gb`,
  `hl=en`, `client=firefox`) returned 492 suggestion occurrences, 256 unique
  suggestions. Country hints are not verified geolocated populations. Suggestion
  order/occurrence is not volume, buyer identity or a popularity ranking.
- No purchase, signup or ads campaign was required. The five free checker calls
  exhausted that day's returned allowance; do not rerun it to reproduce a plan.
  The raw responses are sufficient for this handoff. No Trends time series,
  organic keyword difficulty, Search Console data or localized ranking audit was
  obtained. Paid connector access problems do not invalidate these free results.

CPC means estimated advertiser **cost per click**. It arrived as an ancillary
field alongside search volume; it is not a currency, a site price or project
spending. The current page priorities and public copy do not use CPC or ad
competition. Preserve the evidence for audit, but keep these unused advertising
fields out of the organic-search decision summary and website content. No paid
campaign or advertising budget is part of this plan.

Normalized data: [keyword-metrics.json](../seo-20261002/keyword-metrics.json).
Raw evidence: [five provider responses and autocomplete](../seo-20261002/raw/).
Full original-query audit and analyst selection:
[keyword-evidence.json](../seo-20261002/keyword-evidence.json).
Methods/source availability: [free-sources.json](../seo-20261002/free-sources.json).
Collection populations and exact input lists:
[COLLECTION-MANIFEST.json](../seo-20261002/COLLECTION-MANIFEST.json). It separates
18 historical seeds, 20 provider phrases (25 country/phrase requests), 28
autocomplete inputs (56 requests) and the 15 positive US results retained in
`keyword-seeds.txt`. That historical TXT filename denotes a result shortlist,
not the complete request set; the five unknown US phrases remain in the manifest.
The [48-query CSV](SEO-QUERY-MAP.csv) remains the earlier qualitative inventory,
not 48 measured queries. Join only exact phrase and country; never copy a parent
term's estimate to a longer query.

## Decision table

Numbers below are estimated monthly searches for the selected country under the
provider's stated average window. A dash means that country was not checked;
`no data` means unknown, not zero. Priority is editorial judgment based on fit.
The sample does not choose a US/UK business territory for the author.

| Exact phrase | US estimate | UK estimate | Treatment and owner |
| --- | ---: | ---: | --- |
| ai operating model | 110 | 50 | Home/help vocabulary: roles, decisions and delivery model. |
| ai governance consulting | 140 | 40 | Home/help supporting wording, qualified as delivery/runtime work; not a compliance-only service. |
| ai governance consulting services | 10 | — | Same intent family, no separate page. |
| ai agent governance | 260 | no data | Production guide primary family; concise relevant Home problem wording. |
| agentic ai governance | 210 | — | Same production page; do not add the two variants as unique audience. |
| ai agents in production | 20 | — | High topical fit despite lower estimate; retain concrete problem framing. |
| ai agent guardrails | 70 | — | Production guide section with authority, evidence and ownership context. |
| ai agent reliability | 10 | — | Production guide support; no reliability guarantee. |
| ai productivity paradox | 140 | no data | Delivery guide vocabulary; explain the author's bounded diagnosis. |
| ai developer productivity | 50 | no data | Delivery guide; distinguish activity from end-to-end outcomes. |
| ai adoption challenges | 90 | — | Delivery guide support, qualified to software organizations. |
| ai governance framework | 4,400 | — | Existing Research page, only if useful; broad mixed intent, no new launch framework page or proof UA is a validated compliance framework. |
| llm evaluation | 1,000 | — | Existing Research page's technical context; Writing may link relevant existing editions. Not a replacement for the buyer offer. |
| llm observability | 590 | — | Existing Research page's technical context; Writing may link relevant existing editions. No invented monitoring product/service. |
| ai cost management | 70 | — | Production cost-boundary context; broader FinOps intent needs qualification. |
| ai roi measurement | no data | — | Useful delivery-guide question with autocomplete evidence; no volume assertion. |
| ai developer productivity metrics | no data | — | Same; do not borrow the parent phrase's 50 estimate. |
| ai governance consultant | no data | — | Historical third-party snapshot said 170 US; record disagreement, not a fall to zero. |
| ai coding tool roi | no data | — | Editorial wording; no returned autocomplete or positive volume evidence here. |
| ai roi for engineering | no data | — | Editorial wording; publisher usage does not establish exact-query demand. |

Autocomplete also supports vocabulary such as operating-model design/framework,
agent governance/observability, ROI measurement framework and enterprise adoption
challenges. It reveals intent noise: AI governance jobs/courses/certification;
unrelated meanings of AI ROI; and security-clearance/education uses of standalone
continuous evaluation. Use explicit LLM context for the latter.

The 2026-10-02 independent-review correction aligns `selected_keywords` in the
evidence JSON with these primary owners. Both named guides are proposed #11 work
after launch and the PMDay #2 overlap check; a concise Home mention does not make
Home their primary guide owner or create a page. Home owns the consulting/operating
model family, including the unmeasured consultant variant. The historical `seeds`
array retains its earlier analysis and owner labels; it is not the current map.

## Implementation decisions

1. Keep the two buyer problems and three agreed offers. Use natural language from
   the relevant families in visible copy; do not force every phrase into titles.
   Retain author identity, research names, control theory and Theory of Constraints.
2. Use Home for author/offer/contact, Research for meaning and sources, Writing
   for the original edition index, Talks for actual events. The two distinct
   guides remain #11 work after launch and the PMDay overlap check in #2.
3. Do not create a new `ai governance framework` landing page just because it has
   the largest estimate. The metrics refine vocabulary; they do not demonstrate
   buyer fit, an organic ranking opportunity, or a new mandate for services.
4. Keep raw evidence outside `docs/`. Update `SITE-SEO.md` with the actual page
   mapping during S1/S4; public prose must not expose the internal keyword plan.
5. #8 owns the actual URL, canonicals, sitemap, indexing eligibility and authorized
   Search Console setup. #11 compares later branded versus problem queries and
   qualified conversations. Contact clicks, bookings, leads and revenue are
   different outcomes; none has been measured by this sample.

## Non-negotiable interpretation limits

- Normalize an explicit `noData` response to null even if its raw volume is zero.
- CPC and advertising competition are not organic SEO difficulty. The retained
  provider replies/method source do not establish a currency. Normalized data now
  uses `cpc_provider_estimate` and `cpc_currency: null` in every embedded copy,
  replacing the unsupported USD label. Raw values are unchanged; infer neither
  USD nor GBP and do not use these unqualified numbers for budgeting/comparison.
- Twelve history numbers without month labels do not support a dated trend/YoY
  claim. Retain provider trend fields as raw data, not a prioritization signal.
- Volumes are not exact counts, unique people, visits, leads or C-level searches.
- Different-provider snapshots have different methods/windows. Do not average
  3,600 versus 4,400 for the framework phrase or smooth away source disagreement.
- English queries and a requested country do not prove the provider's language
  targeting or the site's target market. No location pages follow from this test.

The [Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features)
was checked during final review: ordinary crawlable, useful content and accurate
markup remain the relevant baseline; no extra AI-specific file/schema is needed.
This does not promise indexing, ranking or citation.
