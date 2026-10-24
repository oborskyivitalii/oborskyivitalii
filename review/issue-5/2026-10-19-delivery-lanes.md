# Issue 5 — 19 October 2026 delivery lanes

Owning issue: [#5, dated delivery anchor](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issue5-delivery-lanes-20261019).
Execution: same Draft PR79. Self-analysis at `c02b12e878924e722e7e987884ff346f8976284e`;
bounded independent architectural and implementation review completed by the existing reviewer.

## Intent and acceptance

The maintainer asks to finish separate platform, content and media delivery.
AC16–20 remain unchanged. Article, Talks event and tag edits should reuse an
accepted compatible platform and run current-source content/reader admission.
Unknown/mixed/platform changes use the ordinary platform route. Actual PMDay
editorial/media and current Talks records stay with their owners.

## Findings

| ID | Evidence | Implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| L01 | `content-baseline.cjs` authenticates source checks, not platform staging | Preview reuse cannot waive runtime regression | 16/17/19 | Accepted staging baseline required |
| L02 | `content-release.cjs` permits only index/writing rebuilds | Talks remains platform classified | 16/17 | Extend bounded page content impact |
| L03 | Existing article-media addresses and checks are immutable | Reuse existing producer and rights owners | 18 | Add explicit media lane/impact evidence |
| L04 | Serialized publisher admits accepted ancestor source | A delayed candidate can replace later accepted work | 20 | Reject stale candidates before publication |

## Decisions and execution

User instruction “Дороби це” authorizes this implementation in #5/PR79.
One static repository and complete atomic package remain. Content/media lanes
share the existing protected publisher; no partial live uploads or second CMS.
CS01–CS10 apply: source ownership, focused formatting, bounded dependency checks,
existing byte/performance limits, exact evidence and independent review.

| Task | Owner / behavior | AC | Verification | Status |
| --- | --- | --- | --- | --- |
| D01 | Authenticated accepted generation and honest impact | 16/17/18 | Tamper/missing/incompatible negatives | Implemented; final-source verification below |
| D02 | Distinct hosted content admission in shared staging | 17/19 | Exact source/bytes, all affected documents, reader/no-JS | Implemented; final-source verification below |
| D03 | Protected source lease and coherent rollback | 20 | Concurrent/stale candidate and current-source rollback cases | Implemented; final-source verification below |
| D04 | Contracts, acceptance mappings, RI and independent review | 16–20 | Basic, style, registry, owning acceptance, CI | Implemented; final-source verification below |

## Acceptance evidence

Final focused checks passed141/141; the additional current architecture graph
and negative suite passed10/10; final exact-source policy and hosted run links belong to PR79.
The distinct content gate observes every affected document at390/1440 with and
without JavaScript, current Writing tags, all current declared image resources
and the existing five-case reader journey. Full platform/performance observations
are explicitly inherited from authenticated staging, never relabeled as rerun.
Production copies the authenticated raw staged generation, checks the latest main
source and leases the complete current production composition. Missing/expired or
incompatible admission falls back explicitly to the ordinary platform lane.

The synthetic diagnostic changes an article, a catalog record and Talks events,
adds a PNG and independently serves corrupt PNG bytes. It is not publishable and
does not fabricate an accepted baseline. Existing Talks wording, links, order,
dates, language and anchors survived the canonical data migration exactly.
No actual manuscript or publication-media paths changed.

Independent review found a JavaScript replacement-string bug for literal dollar
sequences in event text. The token replacement now returns the rendered string
from a callback; the reviewer replayed the negative cases and accepted the fix.
Other bounded trust/composition and final-delta review found no remaining blocker.
Final source checks also caught a top-level CLI return in the new artifact branch;
using an explicit else preserves behavior and permits AST architecture analysis.
Pure event validation admits deterministic strict assertions. The existing pure
fallback SHA256 calls have a bounded AST allowance for direct literal SHA256;
crypto aliases, random APIs, computed methods and other owners still reject.
The final independent pass found that dynamic import could share the accepted
member shape. Requiring an explicit single-argument literal require call closes
that bypass; dynamic import is covered by a negative case.
An older-baseline edition concern was investigated and withdrawn: the existing
append-only publisher history already rejects committed-edition mutation.

Reviewed exact blobs (later formatting-only changes are identified):
- `tools/site/content.cjs`: `3b12fb5d528e620da9543819adf39b8619744cf3`.
- `tools/site/events.cjs`: `37216beb1035d6c3cd352ed51eef2685dc120f4d`.
- `tools/quality/content-gate.cjs`: `98418ebb430126adb3b584fe03eaf888d3cbefb2`.
- `tools/site/content-release.cjs`: review9601e52, formatting-only final3ef76575.
- `tools/quality/content-browser.cjs`: reviewa57bd23, formatting-only final374450c5.

CS01/02: canonical event data, context-escaped shared templates and pure renderer;
no parallel publication registry. CS03/06/07: no new styling, browser lifecycle or
animation/runtime bytes; existing limits remain. CS04: one accepted-baseline,
content-gate, browser-observer and publisher lease owner each. CS05: focused
formatting. CS08/09: meaningful failure cases, Basic and bounded architecture/style
checks. CS10: source-qualified review, generated inventories and RI/CI mappings;
current exact final results are recorded externally on the owning PR to avoid
self-referential source claims.

The build-producer identity changes; all five delivered Color JS/CSS byte hashes
are identical to the prior independently reviewed orbit runtime. Older runtime
families remain registered. This producer family is not a new performance claim.

 AC17's real
accepted article and protected live publication remain an explicit later gate;
synthetic/local/preview cases cannot check that criterion. No merge or production
activation is claimed by this plan.

## Verification limits and diagnostic disposition

Basic passed16 focused cases plus10 Color cases with a94744/100000-byte largest
HTML. RI28/28 and RI/CI coupling20/20 passed; maintained formatting and focused
ESLint were clean. Final exact-source results are recorded in PR79.
The standalone frozen SEO diagnostic rejects a stylesheet change already present
in the parent; both current CSS files are byte-identical to c02b12e. The new event
source/producer reconstruction and negative cases pass without weakening that
historical CSS comparison. It is not claimed as a passing full SEO diagnostic.
An attempted local full security scan could not run semgrep/bandit/detect-secrets
in the partial venv; that attempt is not passing scanner evidence. The available
pinned detect-secrets tool was run separately: untriaged public checksum
candidates remain, including earlier source evidence. This is not clean scanner
admission; no review ledger or historical source guard was broadly waived.
Managed hosted CI and actual accepted-platform/content publication remain
separate observations, with no merge or production activation in this increment.

## Concurrent main integration

Main advanced to82b57b8 with #108/#111 while final checks were running. Both
parents are preserved by a merge on the task branch; no main merge is performed.
The exact new Winter facts, original four cards, Autumn naming, nav and metadata
are transferred into the same canonical collection. The source snapshot now pins
that main input, and reconstruction reverses event migration before the existing
#108 amendment. Upcoming/ukrainian/other are stable ordered groups; a date may
have an empty prefix. A real event insertion still needs only validated data.
Both parents’ exact reviewed secret-ledger rows survive without overlapping
variants; main’s proof and its original historical evidence remain untouched.
The new issue5DeliveryMain family retains the earlier delivery family and binds
the integrated producer; delivered Color runtime bytes are unchanged.
Focused integrated event/content/release/fixture/profile checks passed62/62.
The interrupted b0c331b policy is superseded, not final admission evidence.

The independent integration pass accepted exact normalized main Talks equality
and the source reversal order, with4/4 focused factual/event cases. Reviewed
blobs: renderer73eb7c0, data8980583, SEOaa62bea, migration99be8ad.
The owning #5 CI policy installs the locked quality Node tools used by its new
workflow/schema tests, alongside the existing locked Python and publisher tools.

The existing Draft PR79 browser exception now includes the parser, isolated
content fixture and its raw artifact upload. The former nonprototype condition
would have skipped the new observer in this Draft preview. The article-PDF and
full platform/admission gates retain their existing conditions.
