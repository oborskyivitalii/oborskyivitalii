# Issue 5 - managed article PDF export

Owner: [issue #5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5).
Execution: [PR #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Role: root implementation/self-review; separate CI/source review recorded below.
Inspected baseline: `8200297c41aa673017fe69cb797e9e5a0cc63311`.

## Intent and acceptance

On 14 October the author requested completion of the remaining normal PDF-export
verification. Permanent staging is not required for this increment. The existing
PMDay article remains a technical fixture; real article #2 authoring, editorial,
rights, platform posting, merge and production decisions are unchanged.

This increment addresses the technical print subset of AC02/AC04/AC11/AC12.
It does not close their whole human/publication criteria. Applicable CS01-CS10:
print production stays in `tools/publishing/`, the explicit browser diagnostic in
`tools/quality/`, cheap rejection cases in the existing print suite and invocation
in the existing managed Chromium jobs. No runtime, template, CSS, public artifact,
browser-substitution policy, browser matrix or budget change is planned.

## Findings and tasks

| ID | Finding / implication | Treatment and verification |
| --- | --- | --- |
| F01 | Successful print unit tests use synthetic PDF producers; default CLI only had a missing-browser negative | Add an explicit real default-CLI export, complete-kit and PDF/manifest verification in the existing managed-browser job |
| F02 | Local managed install again returned zero-byte invalid archives; ordinary export fails with its named missing-browser error | Preserve failure; use the normal CI browser installation, without an alternative producer or raised budget |
| F03 | Candidate source is deliberately `working-tree-review` with null Git freeze pins | Bind clean checkout head/tree separately and verify actual manuscript/resource hashes; do not freeze or accept the fixture |

The managed diagnostic must reject review-only or wrong browser/toolchain/source
identities, preserve all existing failure tests, and upload the PDF, its manifest,
kit manifest and source-qualified report separately from typed site gate reports.
Preview and explicitly selected bounded-regression paths reuse their existing
browser installations; they do not promote permanent staging.

## Acceptance evidence

The implementation is prepared; exact-source CI/visual inspection are pending. The
earlier review-only PDF remains historical evidence of its recorded producer.
Default browser installation failed locally on this baseline; the ordinary CLI
failed with `Locked publishing Chromium is unavailable` and left no partial kit.
No managed-render success is claimed by this plan.

Prepared local Basic passes (15 theme/archive and 10 Color cases), the selected
print/quality-source/profile suites pass 80/80 and maintained Python repository
checks pass 109/109. Scoped ESLint, canonical formatter, bounded style guard and
RI/CI checks pass. Preparation initially rejected an untracked maintained helper
and stale generated RI; indexing the new file and refreshing canonical views
resolved those bookkeeping failures without changing the checks.

Independent read-only reviewer `pr79_readiness` inspected the normal CLI path,
helper, evidence negatives, two workflow invocations, registry and documentation.
It independently reran the print suite (32/32), verified the shared exact browser
pins and found no implementation blocker. It confirmed that no runtime, public
artifact, stable alias, matrix or existing time/resource budget changed. Actual
managed browser generation and all-page visual inspection still need their own
clean-head evidence; this source review does not supply those observations.
