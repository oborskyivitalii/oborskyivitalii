# Search discoverability and topic map

Owning intent: [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1).
Decision recorded 2026-10-01: the maintainer wants an English site, visibly
separated English/Ukrainian editions, a portrait, and search coverage of the
research vocabulary. This is an editorial keyword map, not measured search
volume, proof of expertise, a ranking forecast or a new research glossary.

## Keyword clusters and content owners

Use the main phrase naturally in the relevant heading and introductory prose.
Related phrases belong only where the page actually answers the question. Do
not repeat the entire list on every page or add hidden keyword text.

| Cluster | Primary phrases | Supporting reader vocabulary | Existing content / owner |
| --- | --- | --- | --- |
| Author identity | Vitalii Oborskyi; Vitalii Oborskyi AI governance | AI architecture researcher; delivery leadership; PMO; software delivery | [Homepage/about](docs/index.html#about), portrait, real LinkedIn/GitHub/Medium profile links. These describe work areas, not certifications or a current employer. |
| Governance and control | AI governance; AI control theory; AI Control Plane | enterprise AI governance; runtime control; AI evaluation; decision authority; governance gates | [Homepage topics](docs/index.html#topics), the control-theory article in [English systems writing](docs/writing.html#english-systems), [UA control capabilities](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/main/02-ai-control-plane/README.md). Enterprise governance is an audience/topic, not a promise of regulatory compliance. |
| Architecture | AI architecture; LLM application architecture; Thinking Systems architecture | agentic system architecture; probabilistic software; non-deterministic systems; model-mediated behavior | [UA research route](docs/index.html#research), architecting/modern-approach/agentic-loop articles in [English systems writing](docs/writing.html#english-systems). “Agentic” is not a synonym for all Thinking Systems. |
| Research vocabulary | Uncertainty Architecture; Thinking Systems; Model Judgment; Consequential Runtime Responsibility | Judgment Node; Uncertainty Boundary; AI Control Plane | [Visible topic explanations](docs/index.html#topics) link the [living UA glossary](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture/blob/main/00-doctrine/glossary.md). UA owns the engineering meanings. No claim of originating the phrase Thinking Systems or of an accepted industry standard. |
| Operating models | AI operating models; socio-technical systems; socio-technical stack | human–AI teams; decision rights; evaluation ownership; organizational design; PMO and delivery governance | [Homepage/about](docs/index.html#about) and [leadership/operating-model articles](docs/writing.html#english-leadership). Roles and technical controls must be considered together; no claimed institutional adoption. |
| Delivery and verification | The Subprime Code Crisis; AI-assisted software delivery; software verification | AI-assisted SDLC; verification capacity; system understanding; code ownership; technical debt; AI coding assistants | [Subprime research route](docs/index.html#research), [English verification article](docs/writing.html#english-delivery), [Ukrainian DOU editions](docs/writing.html#ukrainian-articles). This is evidence-governed research synthesis, not a universal claim that AI improves or worsens productivity. |
| Evaluation and release | semantic drift; neuro-symbolic verification; AI evaluation | evaluation gates; release evidence; fallback; escalation; rollback; operating envelope | Beyond Embeddings and control-theory articles in [English systems writing](docs/writing.html#english-systems); current details remain in [UA](https://github.com/UncertaintyArchitectureGroup/uncertainty-architecture). Not every supporting term yet has a dedicated site article. |
| Product and strategy | AI product architecture; AI-native workflows | on-device LLM vs cloud API; product owners; AI strategy; AI workflow defensibility | [English systems](docs/writing.html#english-systems) and [AI/product strategy](docs/writing.html#english-strategy). Keep these as supporting topics rather than diluting the site's central governance/architecture/delivery focus. |

The target audience is architects, engineering leaders, product owners, delivery
managers and PMO practitioners. Future full articles should answer concrete
questions within these clusters; a keyword mention in an index is not a substitute
for a useful explanation. The PMDay article remains [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2), with its own blueprint and acceptance.

## Implemented in this candidate

- Distinct descriptive titles, descriptions, one H1 per page, meaningful topic
  headings, readable explanatory text and crawlable publication/research links.
- Author identity via `ProfilePage`/`Person`, and a `CollectionPage` with an
  `ItemList` of the 23 linked article editions. Dates/languages refer to those
  original editions; Atlassian's edited date is `dateModified`, not invented
  publication metadata. Structured data does not establish validation, authorship
  of a term, a rich result or a guaranteed ranking.
- English interface with 20 English and 3 Ukrainian article editions. Visible
  labels are EN / UA; machine language codes remain `en` / `uk`. Ukrainian text
  has `lang="uk"`. PMDay is Ukrainian; the spoken languages of Corning and
  Betelgeuse remain unconfirmed, not inferred from post/title language.
- A 100,768-byte supplied portrait, descriptive alt text, explicit dimensions
  and no external image/font service. Responsive CSS, local theme controls and
  print styling; browser visual/performance measurements still need review.
- Open Graph and Twitter title/description metadata without unchosen absolute
  site URLs. Review-only fixed-theme previews are marked `noindex,nofollow`;
  only `docs/` is the proposed Pages source. Drafts/process files stay outside it.

No `meta keywords`, fabricated translations, keyword stuffing, fake credentials,
review/rating schema, invented adoption metrics or third-party validation badges
are added. Google's [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
explains why useful content and discoverability matter and why meta keywords
are not used for ranking. [Profile page documentation](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
describes the structured-data use; eligibility is not a display guarantee.

## Release-dependent follow-up

1. Record the actual stable URL in [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8).
   Then add correct absolute canonical URLs, `og:url`, an approved absolute social
   image URL and an appropriate sitemap. Update the candidate-stage tests at the
   same time; they currently reject provisional absolute site identity.
2. After the maintainer's editorial/rights decision, merge, configure Pages and
   inspect the deployed edition. Confirm public crawlability and actual mobile,
   keyboard, image and print behavior. Do not report draft metadata as indexed.
3. Connect Google Search Console only with authorized site-owner verification;
   inspect real query/indexing data before reprioritizing terms. Rankings and
   search traffic are neither measured nor promised by this change.
4. Use `hreflang` only for genuine equivalent translated pages with their own
   URLs. The EN/UA catalog is not a translation pair. See Google's
   [localized-page guidance](https://developers.google.com/search/docs/specialty/international/localized-versions).
5. Keep Medium as a distribution/archive channel. Existing Medium/DOU editions
   keep their original URLs; no full-body duplicate is imported here. For future
   site-first articles, consider Medium's [import tool](https://help.medium.com/hc/en-us/articles/214550207-Importing-a-post-to-Medium)
   and [canonical link setting](https://help.medium.com/hc/en-us/articles/360033930293-Set-a-canonical-link)
   after the site edition is actually live. Do not silently rewrite the canonical
   history of existing publications or link the live profile to an undeployed URL.

Complete Medium profile replacement: [review-only draft](drafts/medium-profile-revision-20261001.html).
The draft is not a live Medium edit, deletion, publication decision or approval.
