# Issue 177 — 2026-11-08 article analytics checkpoint

Owner: https://github.com/oborskyivitalii/oborskyivitalii/issues/177.
Base: `fdfc8cb67a6f78996932d9688c563c53c21387f2`.
Current checkpoint: article analytics only, then stop/report. Theme was withdrawn;
SEO, hosted promotion, merge and production are outside this checkpoint.
This initial section is implementer analysis, not independent acceptance.

## Intent, source and test-impact allocation

Direct production article entry must load the existing optional SDK once per
document, using only the validated public article catalog. Retain exact origin,
declared aliases, blocked-vendor behavior and QA isolation. No manual pageviews,
history wrapper, new vendor or route wildcard is authorized.

HTTP reads on 2026-11-08 at 17:54 UTC found the live article HTML SHA256
`db7679a6b111e014ef4d248df5a1a5f2033ded2eac2ccb0d79a67a6f89b20915`.
Its loader is `runtime/7ebed494340d081e3c5be942074182f97c9b93f3a887af88d36023e26db146ff/analytics.js`;
actual bytes match the base checkout and omit the article URL. HTTP receipt and
response bytes were retained under `/tmp/issue177-live`; a compact public receipt
will be versioned. These HTTP reads execute no scripts or collector requests.
Main/production refs match the base; that is separate from a deployment receipt.

| Case | Contract / oracle | Evidence boundary |
| --- | --- | --- |
| Canonical/declared alias direct entry and reload | One adapter SDK element/request per document | Actual compiled loader and browser fixture; no provider count inferred |
| Internal article mount and Back/Forward | Persistent document keeps one SDK; router/history remain usable | Browser DOM/history and SDK count; actual SDK-generated pageviews pending |
| Query/filter changes | Existing archive history remains unchanged; vendor owns SPA semantics | Stub load counters do not establish pageview semantics |
| Fragment changes | Existing anchor behavior; no new manual pageview | Provider behavior remains unobserved |
| Staging/offline/wrong origin/unknown route/snapshot | No SDK admitted at document entry | Source/VM and browser guards |
| Isolated QA versus ordinary fixture | Existing exact collector predicate blocks only isolated context | Local sink contrast; not a real collector receipt |

Sources: `tools/site/build.cjs`, `articles.cjs`, `analytics.cjs`,
`site/integrations/cloudflare.cjs` and the validated local article catalog.
Selected article status and public catalog membership are distinct: accepted
preview-only articles must not gain tracking admission.

| Risk / AC | Existing or updated check | Disposition before implementation |
| --- | --- | --- |
| Public admission/aliases/origin, AC01–03 | `tests/analytics.test.cjs`, `tests/site-articles.test.cjs` | Retain analytics guards; add producer-integrated article admission cases |
| Addition/removal or slug changes, AC01/02/07 | Existing site-articles cold/incremental fixtures | Add changing allowlist/document identity coverage; never reuse an old loader silently |
| Draft/technical/preview-only admission, AC03 | Site-articles synthetic publication fixtures | Add refusal cases against public catalog membership |
| SDK failure and isolation, AC03 | Existing analytics and preview-smoke suites; `analytics-browser.isolationJourney` | Retain original predicates/budgets and ordinary-context contrast |
| Shared output and style, AC07 | Basic, code-style guard, RI and owning acceptance | Regenerate from sources; no edits to generated HTML |
| Hosted matrices | Existing seven/thirteen fixture rows and validators | Unchanged selection/counts; no new hosted schema or campaign in this checkpoint |

Applicable CS01–CS10: edit producer/selector/test owners, preserve dependency
direction, finite state and single concern ownership, readable focused changes,
existing CSS/runtime bytes and bounded checks. Guard checks only its documented
subset; architecture and evidence semantics require independent review.

## Independent review

Requirements preflight `/root/issue177_requirements` was launched with explicit
`fork_turns="none"`; the tool returned that task handle. Common prompt SHA256
`2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`, role prompt
`010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6`, source packet
`c79d40ff74ff18367ef01a7a28b8750306445505ae3bbb760e85bdc33d10a02b`.
It independently allowed bounded admission work subject to R1 case-specific
pageview evidence limits, R2 public membership and generation identity, and R3
owning policy before handoff. R4 retains bounded QA-isolation claims. The case
table and test allocation above treat R1/R2 before dependent implementation;
R3 will be mapped before handoff. Full first result is retained for verbatim
versioning. Shared files/tools are not a security isolation boundary; provider
context internals are unknown. Final requirements and the other three distinct
role executions remain pending.

## Retained diagnostics

Unchanged baseline analytics suite: 13/14 passed; the media interpreter fixture
failed ENOENT because the optional checkout-local Python venv did not exist.
The first attempted explicit path `/usr/local/bin/python3` also did not exist;
that incorrect operator path is not a source defect. Preserve both raw logs.
The actual runtime interpreter reports the canonical Pillow 13.0.0 and WebP
1.6.0; subsequent checks will select its discovered absolute path through the
existing `SITE_MEDIA_PYTHON` option. No tests, pins or budgets change for this.

## Acceptance and next gate

AC01–AC09 are all open. Source implementation, final independent roles and
candidate checks are pending. Live collection, SEO, hosted review/release and
owner Medium canonical remain separate. Stop/report after this analytics
checkpoint; do not launch staging, merge or deploy.

## First candidate diagnostic and correction

The first targeted run selected analytics, site-articles and preview-smoke.
The new admission/identity cases and analytics guards passed; preview-smoke's
real-artifact identity check rejected stale generated docs because regeneration
had not yet followed the producer change. This was an ordering error in the
local run, not a reason to weaken the check. Retain `/tmp/issue177-targeted.tap`.
Regenerate docs and dependent review exports, then rerun only the affected
candidate scope. No unchanged failed staging campaign was launched.

An initial formatter invocation omitted the maintained configuration and expanded
unrelated legacy formatting. Those mechanical edits were removed before review;
only focused code/test changes remain, formatted with the canonical config.

## Review reconciliation — content-lane boundary

Requirements found that changing only document-version inputs did not classify a
public route-set transition as a platform analytics change. The corrected source
uses one `analyticsURLs(config, catalog)` owner both for compilation and for the
existing analytics component fingerprint. Thus public admission/removal/slug
changes select full generation through the existing platform boundary; the
unchanged content-only guard refuses them before attempting to read a new loader
from an old baseline. Ordinary article edits with unchanged public paths retain
the existing content lane. There is no new delivery route or higher budget.
The earlier extra per-document measurement argument was removed; the existing
component identity now supplies the dependency to principal and article versions.
Tests cover admission and removal refusal plus full-generation cold/incremental
parity. Code, requirements and white-box roles must recheck this changed candidate.

The first owning-policy execution had 4/5 checks pass. ANALYTICS' native suites
passed, but the new Python wrapper incorrectly expected sorted module names;
the maintained runner returns the explicit selection order. Corrected that
assertion to the submitted module list, retaining exact membership/counts and
zero skipped/cancelled/failed accounting. Preserve the failed policy JSON.
The first content-lane refusal assertion used the higher-level release owner's
error text against the lower-level builder guard. Corrected its oracle to that
existing builder's exact refusal; no production error or guard was changed.

The exploratory reviewer attempted actual Chromium but socket creation was denied
before page creation. Automatic approval review rejected the same bounded browser
command outside sandbox because `sandbox_approval` is disabled. Browser cases are
BLOCKED / NOT OBSERVED, not pass or N/A; no provider traffic was emitted. This
prevents browser readiness and workflow advancement. Retain its first report/raw
failure and do not treat source/VM tests as a substitute.

## Final checkpoint and role receipts

The corrected substantive manifest is
`64a009193b21487cb31cb4cfcf961dce8efbfe7754f458b9c4c47d6c96c13e41`;
all four roles compared the actual referenced bytes. First results and correction
results are separate versioned files in this directory. All first launches used
explicit `fork_turns="none"`, returned accepted `/root/issue177_*` task handles;
correction phases used follow-up turns on those same roles, not new first-isolation
claims. The Requirements preflight preceded dependent implementation. Provider
model/context internals remain unknown. No peer result replaced another verdict.

| Role | Separate execution | Corrected outcome | Limits |
| --- | --- | --- | --- |
| Requirements | `/root/issue177_requirements` | Content-lane F1 resolved; no remaining requirements defect | Full AC/release and provider gates pending |
| Code | `/root/issue177_code` | No blocking source findings; 2 targeted cases pass | Its wrapper attempt lacked interpreter selection and failed ENOENT; not a passing policy run |
| White-box | `/root/issue177_whitebox` | No blocking findings; corrected wrapper and independent fingerprint checks pass | SDK admission is not pageview/collector receipt |
| Exploratory | `/root/issue177_exploratory` | BLOCKED / NOT OBSERVED; corrected driver remains applicable | Chromium socket EPERM and automatic escalation rejection; no retry or browser pass |

Final author native selection: analytics, site-articles, preview-smoke,
content-release, content-baseline and test-profile-selection: **133/133 pass**,
zero failed/cancelled/skipped/todo. Basic passes (18 focused +10 Color cases,
artifact/source/geometry/size checks), bounded code-style guard and changed JS
ESLint pass. RI regression29/29 and coupling23/23 passed; regenerated current
RI and RI/CI freshness verified. These are scoped local results, not the complete
hosted release matrix. The final exact-clean owning-policy receipt belongs in
the issue/PR handoff; it cannot turn unobserved external gates into acceptance.

## AC reconciliation / stop boundary

| AC | Current evidence | Whole criterion |
| --- | --- | --- |
| AC01 | Live loader/source ownership and test-impact allocation, corrected route-set boundary | Open: full issue audit/test phases remain |
| AC02 | Compiled article/alias admission and one SDK guards | Open: actual browser, SDK pageviews and live receipt pending |
| AC03 | Source/VM origin, public membership and isolation/failure contracts | Open: actual browser/live acceptance pending |
| AC04 | No SEO implementation in this checkpoint | Open |
| AC05 | No discovery-link implementation in this checkpoint | Open |
| AC06 | No new search-provider or live sitemap acceptance in this checkpoint | Open |
| AC07 | Scoped native/Basic/style/RI and three corrected source reviews | Open: exploratory blocked; hosted/release gates not run |
| AC08 | Earlier article counts remain incomplete; no uplift/provider claim | Open |
| AC09 | Owner-only final Medium canonical after future production | Open |

Stop/report now. Keep the PR Draft; do not dispatch staging, merge, activate
production, change SEO/Medium or claim the issue is complete. CLI Git push lacked
a writable credential; connected GitHub Git-data APIs are the publication fallback
for this same prepared tree, with remote tree equality checked before handoff.
No credentials are placed in source or logs.
