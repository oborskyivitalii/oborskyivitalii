# SEO/content reconciliation — implementation, 2026-10-03

Starting head: `93002d2`. Public source is identical to frozen `0333c4d` at that
point. The retained `seo-baseline.json` and original query/evidence records remain
unchanged. `node tools/check_site_seo.cjs` verifies the full HTML source after
reversing only the declared transformations below and excluding decorative SVG.
Existing publication/schema/link tests independently verify the exact editions.

| Previous surface | New surface | Meaning and preservation |
| --- | --- | --- |
| Name H1; business-problem hero lead | Business-problem H1; name and bounded role in hero lead | Same business question becomes the main heading. Name remains visible in the header/hero, title, metadata and Person data. |
| Research followed by Help | Help followed by Research | All three offers and both complete research explanations remain, with original anchors. Section numbering, local navigation and camera path agree with the new DOM order. |
| `vo.` header identity | `vo` with a bronze dot | Same accessible name, home destination and visible full name. |
| All metadata, article/source inventories and other paragraphs | Unchanged | Unique titles/descriptions/OG/Twitter, JSON-LD, author/research terms, all links/dates/languages, five EN featured works, 27 primary archive entries plus the separate LinkedIn rendition and eight discussion entries are preserved exactly. |

There is no new claim, keyword stuffing, source body import, new guide, fabricated
client outcome or translation. The portrait's bytes, dimensions and alt remain.
Staging configuration belongs outside `docs/`; it cannot modify this content,
insert a staging canonical or make production noindex. The actual production
origin/Search Console/indexing decisions remain under #8.

Static checks do not prove current browser contrast, ranking or conversion.
Current-source browser/pixel/performance results are recorded separately.
