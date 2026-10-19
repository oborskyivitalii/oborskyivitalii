# Issue106 — first draft campaign contract

Owner: [issue106](https://github.com/oborskyivitalii/oborskyivitalii/issues/106).
Execution: [Draft PR107](https://github.com/oborskyivitalii/oborskyivitalii/pull/107).
Role: Codex implementation and self-review; independent review remains pending.
Inspected base/head: main0098f804cb3b0d120173d4c8689043db42231c47 /
PR107 planning2e908bb0a8c4a9b4005aceecbc8f597285589ff1.
Publisher interface inspected read-only at PR79a7c1f2f42973999c59c6385a275a2db7f29b5f8a.
Implementation source and final check reports: exact clean commit/run links in PR107.

## Intent and bounded scope

The maintainer requested implementation of PR107's mechanism. Continue taskT02
from the approved plan: a reusable brief, strict draft schema and source-bound
validator. Preserve the separate #106 owner and its nonblocking relation to
article publication. No manuscript, media, runtime, public output, standing
workflow or budget changes are part of this increment.

Tests and the criterion-specific mapping were added before the implementation;
the initial run failed on the missing campaign module, as expected. Subsequent
behavior checks cover real refusal paths rather than source-text assertions.

## Findings and decisions

| ID | Evidence | Implication and disposition | AC |
| --- | --- | --- | --- |
| F01 | Main has no `tools/publishing/` or `guides/ARTICLE-WORKFLOW.md`; both remain in PR79 | Use an explicit lazy facade consumer, fail closed when absent; do not copy unmerged publisher code. Actual integration remains pending. | AC02, AC03 |
| F02 | PR79 `loadArticle` returns validated semantic edition, sections, references and assets | Reuse those pins; no alternative article/claim/media registry. | AC03, AC05 |
| F03 | Campaign derivative review depends on copy, brief, source, CTA and predecessor arguments | Hash these inputs deterministically; reject stale approval and downstream dependency changes. Approval-recorded is an attestation, not independent acceptance. | AC03, AC08 |
| F04 | Original plan includes release/admission/rendering/metrics work beyond this first step | Keep draft-only output and explicit open gates; reject invented publication fields and release switches. | AC04–AC09 |

The standing SITE-CONTENT-REVIEW route links the brief now. Add the single
ARTICLE-WORKFLOW hook after that existing producer guide reaches main. This is
a documented partial integration, not claimed whole AC02 completion.

## Implementation and verification routes

| Owner | Behavior/check | Status |
| --- | --- | --- |
| `guides/ARTICLE-DISTRIBUTION*.md` | Brief, exact schema/example and operator boundaries; standing editorial link | Implemented, self-reviewed |
| `tools/distribution/schema.cjs` | Strict required/unknown-field/type/zero-budget/pending-D0 contract,32 pieces and finite arrays/windows | Implemented |
| `tools/distribution/campaign.cjs` | Read-only regular UTF-8 input,100KB/file and1MB total; publisher pins, local source/media, graph and approval validation | Implemented |
| `tools/distribution/cli.cjs` | Explicit draft validation with JSON stdout; no output installation or release-ready mode | Implemented |
| `tests/campaign.test.cjs` | Two unrelated articles, missing/unknown fields, paid/pretend-published states, stale source/media/copy/brief/dependency, links/traversal/UTF-8/per-file/aggregate bounds, cycles and CLI adapter |11 maintained behavior groups; final evidence in PR |
| `tests/test_issue106_acceptance.py` | Existing source runner reuses the permanent Node tests; no independent campaign suite copy | Owning policy only |
| Test registry / RI-CI | Permanent Node suite: PR-targeted on campaign/publisher inputs, staging and production. Python wrapper: owning policy only. No browser matrix or budget expansion | Checked through existing registry/coupling routes |

Default CLI still requires the publisher baseline. Synthetic facade tests prove
the consumer shape and read-only behavior only; they do not establish actual
PMDay source, author approval, channel eligibility or publication readiness.

## Style self-review

| Rule | Application and verification | Remaining limit |
| --- | --- | --- |
| CS01/02/04 | Campaign data stays with article; tools consume publisher facade; no runtime/build registry duplication | Actual publisher integration after PR79 |
| CS03/06 | No CSS, template, runtime, animation or lifecycle delta | No visual/performance claim |
| CS05 | Focused canonical Prettier/Ruff formatting of changed maintained code/config; no broad reformat | Independent readability review pending |
| CS07 |32 pieces,100KB/file,1MB total; no dependencies, network, social API or deployment calls | Kit-renderer resource bounds not yet implemented |
| CS08/09 | Basic, style subset, meaningful source negatives, registry/coupling/RI checks | Automatic guard proves its documented subset |
| CS10 | AC policy maps partial behavior honestly; exact source reports/links in issue and PR | Independent/editorial/merge gates pending |

No new style exception or frozen-debt allowance. Existing source/CI budgets and
manual article/channel/rights acceptance are unchanged.

## Acceptance evidence and next action

| AC | First-increment result | Remaining work |
| --- | --- | --- |
| AC01 | Approved plan/ownership retained | Existing completed plan remains separate from functionality |
| AC02 | Brief/schema/standing editorial entry implemented | Actual publisher integration and ARTICLE-WORKFLOW hook; author review |
| AC03 | Edition/media/section/reference/approval invalidation tested | Actual article integration and editorial verification |
| AC04 | Not implemented | Six feed pieces, three carousel candidates, reading/PDF/supporter treatment |
| AC05 | Source/reference/media identity checked | Numerical/quote accuracy, rights and mobile review |
| AC06 | No release mode; admission pending/skipped/declined only | Actual canonical/channel admission and rejection paths |
| AC07 | Bounded reusable read-only validator only | Manually selectable kit build, images/PDFs/previews/manifests |
| AC08 | Authored versus approval-recorded drafts distinct | Actual publication observations, correction history/operator workflow |
| AC09 | Template describes observation limits | D+7/D+21 aggregate review templates/behavior |
| AC10 | Current code/style/RI policy routes supplied | Whole implementation and independent/author/merge gates |

AC02–AC10 remain open. Next integrate against the accepted publisher, then
prepare the launch argument and first carousel for author/design review. Do not
rewrite the article or publish social material in this technical increment.

## Issue synopsis

First reusable draft-campaign contract implemented in PR107 with strict source
and approval invalidation and a standing preparation link. Real publisher
integration and the campaign kit remain pending; #106 stays open and PR107 Draft.
