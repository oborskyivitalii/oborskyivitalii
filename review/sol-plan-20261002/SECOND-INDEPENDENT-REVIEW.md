# Second independent substantive review

2026-10-02. Owner: [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1),
[Draft PR #10](https://github.com/oborskyivitalii/oborskyivitalii/pull/10).

**Verdict: ready for scoped S0–S4 candidate implementation after the maintainer's
execution instruction.** The reader/research lane found no new substantive
correction. The execution/evidence lane's one P2 shared-scene contract gap is
resolved and independently re-reviewed. Both reviewers confirmed the four-file
correction identity and found no material regression. No plan blocker remains;
actual implementation, browser quality and release acceptance remain pending.

## Independent target and findings

Two new agent reviewers received the target without the authoring or first-review
conversation. They formed their own provisional judgments before reading the
previous reports, then checked those reports last for already-resolved issues.
They are independent agent reviewers, not external human or release approvers.

Reviewed head: `25d49c9c4e308bec6e499a30530889602507fb67`; tree:
`4acb79769efe333e76e7b9f0582fa6c7a9463270`. Base PR #9:
`0adc52500f6986a145f1873aaefb80d563da8e7e`. The previous
[independent review](INDEPENDENT-REVIEW.md) remains a separate historical record.

| Reviewer | Original report | Result |
| --- | --- | --- |
| `/root/round2_reader_research_review` | [Reader/research/offer review](independent-round2/reader-research-review.md) | No new P1/P2/P3 correction. Two distinct buyer problems, bounded engagements, research explanation and CTA form a coherent reader path. Density, conditional diagnosis and precise attribution remain implementation watchpoints already covered by the plan. |
| `/root/round2_plan_evidence_review` | [Execution/evidence review](independent-round2/plan-evidence-review.md) | One P2: shared `space.js` serves five pages, while the plan previously defined only Home poses and Writing focus. Research, short informational pages and zero/one-stop/empty archives needed explicit behavior. No evidence/SEO blocker. |

**R2-E1 treatment:** reuse existing finite poses for Research's named stops;
keep Talks/Credits at a stable overview; bind the Writing topic path to visible
result bounds. Unknown stops are ignored, unknown pages use overview, and absent/
degenerate intervals preserve a finite static pose. Off/reduced overrides every
fallback. S2/S3/S4 name these cases and five-page checks. This is a plan correction,
not a claim that the renderer has been implemented or inspected in a browser.

The exact four-file correction inventory is
[CORRECTION-MANIFEST.json](independent-round2/CORRECTION-MANIFEST.json), SHA-256
`d15f83bfb197c65fe7ff36bffe2f7f4bf10673c4a6057b03e4c819b7e86d8c19`.
Original reports are retained unchanged. Separate correction verdicts:
[execution/evidence re-review](independent-round2/plan-evidence-rereview.md) and
[reader/research regression check](independent-round2/reader-research-rereview.md). This summary and generated RI are publication records outside that
inventory. The PR and issues record the actual published head/tree/checks.

## What CPC means here

CPC means advertiser **cost per click**; it is a metric, not a currency. The free
RankSpot volume response included `cpc` and advertising competition alongside
search estimates. For example, the retained first response has `cpc: 33.9` for
`ai governance consulting`, without identifying a currency. An earlier normalized
field incorrectly added USD to its name; the first review corrected that to
`cpc_provider_estimate` and `cpc_currency: null`.

This ancillary advertising information is unused by the site's current page
priorities, offer, public copy or organic-search decisions. It is neither the
price of the author's services nor this project's spending. Keeping its raw
source record does not create an advertising campaign. The user-facing plan now
states the boundary directly, without deleting evidence or changing priorities.

Independent source tracing found no CPC/RankSpot/keyword-data dependency in the
five public HTML pages, three scripts or CSS. Both export producers read public
source and specifically named preview files; they do not consume SEO research
JSON. All 88 normalized metric-object copies match the retained raw values and
no-data rule. This establishes the inspected source/producer boundary, not the
state of an uninspected deployed site or an external billing account.

Primary definitions: [Google Ads CPC](https://support.google.com/google-ads/answer/116495?hl=en),
[RankSpot method](https://www.rankspot.ai/free-tools/keyword-search-volume).
The provider's retained result and inspected method do not establish USD or GBP.
CPC/ad competition is not organic keyword difficulty or qualified-buyer demand.

## Substantive assessment and limits

The offer is understandable before learning UA terminology. Delivery diagnosis,
runtime/architecture review and facilitated SDLC/operating-model design answer
different decisions, without invented duration, fees, guaranteed outcomes or cases.
The source-informed research framing remains open and conditional; the decorative
scene cannot certify a control model or diagnose every buyer's constraint.

The reader lane inspected the original Executive Brief, supplied historical
source passages, current upstream meaning owners, five selected article originals
and the two newer Dobkin/Armesto public posts. Other public attributions were
checked against their retained source audit, not all freshly retrieved again in
this round. The evidence lane recomputed the provider/autocomplete populations,
all metric copies and current page owners. Each report defines its own coverage.

No source/data/runtime change follows from the CPC explanation. An optional
reduction of duplicate advertising fields is deferred: it would not change a
single recommendation and is unnecessary for implementation. No collection quota,
paid tool, campaign or signup was used in this round.

The other optional wording point is clarified: generated preview renditions are
noindex; the offline bundle's `site/` folder retains exact `docs/` bytes, while its
separate `review/` renditions are noindex. Production must not acquire noindex to
make a blanket description of review output true.

Baseline archive 3/3 and scene 4/4 tests passed in the execution lane. Seventy-nine
real local blobs were verified against the target tree; 36 historical generated/
binary paths were declared existence-only placeholders and excluded from output
acceptance. Neither test success nor the planning SVGs prove actual browser quality.

The next work remains [SOL-HANDOFF S0–S4](../../SOL-HANDOFF.md) after the maintainer's
execution instruction. Keep Draft and issues open. Actual content/scene/export/
browser acceptance, #7 rights/editorial decisions, #8 URL/indexing, authorized
#9→#10 integration, merge and deployed-edition verification remain separate.
PMDay #2 and distinct guide/measurement work #11 follow first launch.
