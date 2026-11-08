# Issue177 independent Exploratory / Interaction QA — pre-CI

2026-11-08. Role: distinct nonauthor reviewer `/root/issue177_ci_exploratory`. This is my first bounded judgment before peer reconciliation. No peer reports, parent scratch notes, implementation or external writes were used. Candidate is a staged/dirty prepared subset, not a clean checkout; HEAD independently observed as `8371746dce7eeda64c8662a21bc82c25bf772d2d`. Live remote issue/PR/ref observations are outside this bounded review and remain for orchestration.

## Identity and inspection

- Intent: `/tmp/issue177-ci-intent.md`; owner issue177 / PR178 checkpoint, existing CI browser observations plus exact preview, then stop/report. No stable promotion, merge, production, SEO or theme authorization.
- Packet SHA256 independently verified: `5f9e1d4d47fc10ad44d980ecf9e21afb93d8f568e7acca60bdc0344cecfc00da` for `/tmp/issue177-ci-candidate.json`.
- Common contract `agents/reviewers/README.md`: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- Role `agents/reviewers/exploratory-interaction-qa.md`: `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`.
- Changed browser owner `tools/quality/analytics-browser.cjs`: `51a9ba1cc17ce468acad62c2cfbe216b01cb47ca0049887d3748b005c88c133b`.
- Read root AGENTS, CONTRIBUTING, README, REPOSITORY-MAP and dated MEMORY. `git ls-files '*AGENTS.md'` found only root instructions. Read applicable changed owner, full/staging report fixture/validator integration and existing CI evidence route. I did not read candidate author review reports or peer outputs.

## Independent charter before reconciliation

Bound: approximately three minutes pre-CI, two CLI suites plus five focused validator refusal inputs; no local browser retry. Real BROWSER observation is applicable and PENDING because the local socket/approval blockage already establishes that CI is the permitted observation route. CLI success cannot satisfy it.

For the actual compiled public article, explore entry state and document lifecycle rather than only route existence:

1. Canonical direct entry with query/fragment renders the intended article identity/title and one SDK request/element.
2. Reload creates a new document with one further request, still one SDK element; cumulative observed request count is two.
3. Declared extensionless entry with query/fragment renders the same article and starts one SDK in that document.
4. Reader return to Writing, internal return to the article, Back and Forward preserve navigation and current article identity without an additional SDK request. Writing/Back have no article key.
5. Preserve existing blocked/delayed/staging/offline cases and QA collector-sink isolation; real collector/pageview inference is excluded from the vendor-stub observations.
6. Operator route must bind current source/immutable preview evidence and cannot accidentally select stable promotion.

Current finite public catalog independently yields one article: `sdlc-out-of-balance:en`, `articles/the-sdlc-is-out-of-balance.html`, title `The SDLC Is Out of Balance: Beyond the AI Code Review Bottleneck`.

## Executed actions and observations

| Surface | Action / expectation | Observed | Raw evidence |
| --- | --- | --- | --- |
| CLI | `node --test tests/quality.test.cjs tests/staging-regression.test.cjs`; full/staging consumers accept complete fixtures and reject malformed evidence | 46/46 pass, zero failures/skips; exit0; duration4152.692187ms | Tool session77417, chunk7d62a5 |
| CLI validator | Construct enabled Writing row with actual catalog-derived `expectedArticleEntries()` and invoke `validateEntryForms` | Accepted complete seven-phase fixture; this is synthetic report admission only | Tool output from direct Node invocation |
| CLI validator | Delete `articleEntries` | Refused | Direct Node output `REFUSED missing` |
| CLI validator | Inflate reload request count | Refused | `REFUSED reload duplication` |
| CLI validator | Inflate internal-navigation request count | Refused | `REFUSED internal duplication` |
| CLI validator | Replace observed canonical title | Refused | `REFUSED title` |
| CLI validator | Remove Forward/history observation | Refused | `REFUSED history missing` |
| Operator/tabletop | Trace owner `staging-regression` label to evidence-only route and stable job boundary | `review-flow.cjs:previewEvidence` requires owner sender/actor and exact label. Workflow target admits that event; `promote` requires workflow_dispatch or issue_comment plus main, excluding pull_request label event | `.github/workflows/site-color-review.yml` target/promote conditions; `tools/staging/review-flow.cjs:49-64`; `guides/SITE-STAGING.md:368-389` |
| BROWSER | Execute seven phases on compiled fixture and inspect actual CI reports | PENDING / not observed in this phase | No local launch attempted; awaiting CI raw observations |
| Live provider | Actual vendor pageviews / aggregate collector receipt | Not observed; vendor stub does not establish either | Existing fixture model explicitly `enabled source fixture; vendor stubbed` |

The fixture includes direct canonical, reload and declared extensionless routes; alias serving maps only catalog-declared extensionless article routes to compiled `.html`. The changed journey uses programmatic element clicks, so it supplies an automated navigation observation, not pointer/focus or physical-device usability proof.

## Case allocation and next gate

All seven proposed/implemented article phases remain inside the existing enabled Writing analytics scenario. Existing `analyticsCases()` retains six bounded Chromium cases; no extra matrix/pipeline was introduced. Mapping: `tools/quality/analytics-browser.cjs` → `tools/quality/staging-regression.cjs` analytics selection → existing bounded regression of `site-color-review.yml`; full-report validation also consumes `validateEntryForms`. The current active-job budget remains 15minutes. CI actual duration/completion must still be observed.

No blocking defect found in the inspected pre-CI operator/validator surface. This verdict does NOT pass BROWSER or whole issue ACs. Acceptance is pending raw successful current-source CI article observations, complete existing analytics/isolation accounting, immutable preview identity and observed no stable promotion. On continuation, verify all seven phase values, exact source/artifact/run bindings, failures/skips and full terminal accounting. Preserve any first failure; do not infer browser success from fixture acceptance, SDK counts from real telemetry, or promotion authority from green evidence.
