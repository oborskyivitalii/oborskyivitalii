# Issue106 — review corrections, 19 October 2026

Owner: [issue106](https://github.com/oborskyivitalii/oborskyivitalii/issues/106#issue106-corrections-20261019).
Execution: existing Draft PR107 and the narrow reader hook in existing Draft PR79.
Author decision: fix all three findings, then report status and next steps.
Original [independent review](https://github.com/oborskyivitalii/oborskyivitalii/blob/7ad7d4bd997aa503fc38b17df35805b59d4faf39/review/issue-106/2026-10-19-independent-review.md) is retained at
PR107 `7ad7d4bd997aa503fc38b17df35805b59d4faf39`; reader baseline is
PR79 `10c887e721d54d02ee0bb3438300cdcdf836f18f`.

## Corrections and acceptance impact

| Finding | Correction and behavioral evidence | AC / disposition |
| --- | --- | --- |
| F01 — stale/revoked offline materials | The exporter loads current materials against the rendered image model, compares the complete current selected block with the hosted document, records all material audit inputs and revalidates before installation. Stale pins, revoked/private/pending approval, removed declaration, newly approved label/review/file changes refuse until a matching rebuild. Valid WebP reuse and a rebuilt revocation pass. | AC11; implemented and focused independently re-reviewed. |
| F02 — private edits invalidate public output | The raw declaration remains in audit/concurrency checks but is excluded from public route identity. The native block binds only selected reviewed public records, including their review decision. Full-build cases preserve every public file for private/pending additions, edits and removal, both alone and alongside public entries. | AC11; implemented and focused independently re-reviewed. |
| F03 — impossible transitive windows | The DAG validator memoizes the earliest feasible day through every predecessor, rejecting when it exceeds the piece's upper bound. Three declaration orders, transitive chains and multiple predecessors exercise both impossible and feasible cases; unknown/cycle checks remain. | Implemented AC03/07 subset; implemented and focused independently re-reviewed. |

The new tests failed on the inspected old behavior before corrections. During
verification, formatted template attributes exposed a valid-export regression.
The shared fragment now uses the existing `html.cjs::stableTagEndings` owner;
full block/binding equality remains enforced. Both valid and refusal cases pass.

Public records still require actual editorial/rights review; checksums do not
grant approval. Already-created historical exports are not rewritten or revoked.
These corrections do not generate posts, carousels or publication events.

## Independent focused re-review

Reviewer: `/root/independent_materials_review`, the separate read-only AI reviewer
from the original pass, without an implementation role. The prepared correction
sources were independently inspected and exercised; no reviewer checkout changes
or broad policy reruns occurred. Verdict: **F01–F03 addressed; no remaining
blocker found within those three findings.** This is not whole-issue, human
editorial, rights, device or release acceptance.

Independent checks: campaign/material20/20, mixed/private-only public cases2/2,
focused offline cases2/2. Additional probes changed review evidence and repinned
its digest, then changed PDF bytes with fresh target/review pins: direct material
validation passed but stale public packaging correctly refused. Those cases are
also retained in the maintained offline regression.

Reviewed implementation SHA256 values, unchanged after that re-review:

| Owner | SHA256 |
| --- | --- |
| Shared material module | `1b403d608ccb9db94ced2a7bbbf2f26dae7333ee22de9bd07e667b8b7e619f6f` |
| Shared material template | `080de5fae560b0afee23b54b654fbdf32e7d2c9d9259f9d401c3c47f68f67eec` |
| Reader build | `37bd678f47755017c84fa79395cbdf1be6e7b3eb1a6912b05621a0c637801afc` |
| Offline producer | `067c787eacbedf0dab047ca703fe0b070f35f76c57bec03648b8bff4fab89754` |
| Campaign validator | `941d96621c975e546843d42793a1360574dcb8643d2c8e44a7af6806ecc91dae` |

## Verification and source binding

Expanded targeted suites: PR10732/32 and PR7959/59 passed, including exact Color
byte/identity/mandatory-rights negatives. The final exact commits, owning policy
results, formatting/RI checks and preview evidence are recorded in their PRs.
Do not transfer clean-source evidence between the two branches.

Combined reader head `be8421d9953eec2348114eef1fa4e1798fc67458` passed9/10
owning checks; WRITING-CATALOG37/38 exposed a false positive: generated
`site-route` digest contained `4400`, triggering the unsupported reader-claim
guard. The assertion now excludes only64-hex `site-engine`/`site-route` metadata,
as it already excludes decorative SVG. All placeholder-link and unsupported
marketing/number checks remain on the rest of the HTML. No public/runtime bytes
change in this test follow-up. The failed exact-source report remains retained;
final owning and hosted results belong to the final PR head.

No authored browser JS or CSS changes in this correction pass. Producer identity
changes require new exact runtime lineages; their four JS files and edition CSS
are asserted equal to the previous material family (PR107) or the concurrent
reader-flight family (PR79). PR79 integrates `0a211b5864547e2de5de15902e3b1dd270b3d4da`
without changing its authored navigation/scene sources; all five independently
reviewed correction owner hashes above are retained. Historical tuples remain
immutable; the new tuples remain in mandatory rights admission. Preparatory
runtime proof JSON records are not independent release approval.

CS01/02/04: one material module/template, selected public identity separated from
raw audit inputs, existing exporter and DAG owners. CS03/06: no new CSS, runtime
loop or listener. CS05: pinned maintained formatting and focused lint. CS07:
existing item/file/article/test budgets unchanged. CS08/09/10: red/green behavioral
reproductions, applicable guards and exact-source evidence with separate gates.
Original manuscripts, PDFs and media are unchanged.

## Status and next execution

The three technical findings are corrected and focused independently re-reviewed.
Original whole AC02–AC11 stay open for remaining implementation and author/
independent/editorial/rights/release decisions. Keep both PRs Draft; no merge,
stable/production activation or social publication is performed.

Next: accept the relevant publisher baseline, then prepare one authored launch
argument and one carousel as the smallest complete campaign kit. Review actual
outputs, credits, mobile reading and reciprocal actual-or-pending article links
before preparing the rest of the six-piece campaign. Article publication through
PR79 does not wait for campaign completion.
