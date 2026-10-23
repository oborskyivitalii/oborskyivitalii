# Issue126 — DevCon announcement review — 23 October 2026

Owner: https://github.com/oborskyivitalii/oborskyivitalii/issues/126
Base: 1e87b124c8a7ca4fde4e8ede75dcdd1515b491ea. Candidate: prepared diff; final identity pending.

## Original intent and scope

Publish a DevCon Romania announcement in Talks through existing PR, staging and production controllers. Return LinkedIn text in chat with direct URLs and hashtags. Keep Draft PR79 article/reader separate. No message or social publication is authorized.

Official public agenda inspected on 23 October: https://www.dev-con.ro/agenda/12-devops-con names Vitalii Oborskyi, AI Changes the Delivery System and the Product Itself, 4 November 2026, 12:30–13:00, DevOps Con. Bucharest is UTC+02 on this date. Specific venue is omitted because old private history differs from current public information.

## Independent requirements and quality

| Role | Separate agent | Actual scope/result | Remaining |
| --- | --- | --- | --- |
| Requirements | /root/requirements | Read instructions, issue and actual Talks sources, official agenda, GitHub comparison and PR79; preimplementation direction adequate with factual, source and final-isolation conditions | Final candidate review |
| Code | /root/code_review | Inspected actual source/template/generated/reconciliation diff. Style guard, whitespace and build freshness passed. Found stale description assertion, invalid historical-restoration deletion oracle and missing permanent amendment input | Correction recheck |
| White-box | /root/whitebox | Actual selected5 tests:3 passed/2 failed on the same two oracle defects. Build freshness and IANA Bucharest UTC offset passed. No runtime or unrelated public-route change | Correction recheck |
| Exploratory | /root/exploratory | Read sources/official agenda; six actual-browser cases designed. Local Playwright has no browser; normal Chromium install failed on empty/truncated archives | Hosted preview browser observation; not passed |

### Findings and dispositions

- F01: historical Talks test retained old metadata. Reconciled to the explicit new description; exact predecessor amendment remains separately checked.
- F02: deleting an additive card recreates a legitimate prior edition. Historical SEO restoration correctly accepts that edition. Current inventory/card checks own missing-announcement detection; mutation cases retain altered date/time/URL and invented-resource rejection. No historical acceptance bypass added.
- F03: add the amendment to permanent content/executive input selection, not only owning issue adapter. Corrected.
- F04: default formatter altered unrelated HTML whitespace. Restored exact previous card bytes and used canonical strict-whitespace formatter configuration. Do not commit local dependency symlinks.

### QA risk and checks

| Risk / AC | Oracle and case | Existing selection | Actual result |
| --- | --- | --- | --- |
| Wrong public facts / AC01 | Exact title/date/offset/local-time/track/URL and no invented recording/slides | content test via issue126 policy | Correction run pending |
| Unrelated event/content damage / AC01–02 | Six cards; all previous cards exact/ordered; reversible hashed delta; existing SEO adversarial cases | content/executive permanent source suites and owning policy | Correction run pending |
| Stale output / AC02 | Cold generation and Basic artifact identity/size checks | Basic | Initial local pass; final source run pending |
| Narrow/no-JS interaction / AC02 | 1440/390 both themes plus390/320 no-JS, native anchor/link and overflow | Independent exploratory charter; existing hosted profiles | Not observed locally; browser installation failed |
| Accidental article release / AC04 | Compare final source/runtime/public inventory against production and verify PR79 still unmerged | Final release inspection | Initial comparison has harness-only changes; final pending |

## Implementation and style

Canonical text/URL/metadata and semantic template owners only. Reuse publication/meta/title/link classes and Upcoming anchor; chronological DevCon before January PMDay. CS01–CS05 and CS07–CS10 apply: content/template separation, unchanged CSS/runtime, preserved original cards, bounded explicit generated changes and meaningful behavioral checks. No new resource budget or animation clock. CS06 runtime lifecycle is unchanged. Bounded style guard is subset evidence; independent code review supplies nonautomated architecture review.

## Delivery and decisions

User authorized this announcement's PR-to-production process on23October. Initial main-production comparison has no site/docs changes; PR79 is Draft and excluded. Final activation must recheck intervening source changes and exact archive/inventory. No production, staging, merge, rights, physical-device or independent final pass is claimed by this prepared review.
