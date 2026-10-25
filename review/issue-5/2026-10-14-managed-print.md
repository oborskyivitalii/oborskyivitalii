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

## Executed managed export and visual verification

Exact implementation source `d0250b789e2d5e3798ef699ffc5585b7be782e94`, tree
`ead1b1a105a331307fd46ee37d25b0050f15a767`:

| Observation | Actual result / evidence |
| --- | --- |
| Basic/additional source | [38547576463](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38547576463): 749/749, 62 modules, 164323 ms; original 180000 ms limit, zero failed/skipped/cancelled/TODO cases |
| Navigation / RI | [38547576438](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38547576438): success |
| Owning criterion checks | [38547631235](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38547631235): success; original whole human/publication gates stay open |
| Actual preview and managed PDF | [38547576489](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38547576489), attempt1, smoke job115798540996: success |
| Exact retained output | [Unmodified artifact ZIP](2026-10-14-managed-print-evidence.zip), API artifact11885112971, 225024 bytes; original download digest verified before extraction |

The normal command was `node tools/publishing/cli.cjs render pmday-two-shifts
--pdf`. The actual print manifest and report identify managed Chromium
153.0.8010.12, revision1243, Playwright1.63.0, `managedBrowser:true` and
`reviewOnly:false`. The before/after checkout records are identical, clean and
bound to the exact implementation source/tree above. No alternative producer
was injected. Complete-kit and copied PDF/manifest verification passed.

The retained PDF is 252968 bytes and five A4 pages. PDF inspection confirms
tagging, no PDF JavaScript and no encryption. Root rendered and visually inspected
all five pages: headings, TOC, body text, links, page numbering, diagram and caption
are readable without clipping or overlap. Whole-figure pagination deliberately
leaves space at the end of page3 and places the complete diagram on page4.
The primary Poppler wrapper returned a truncated page3 PNG; a fresh PyMuPDF
render decoded all five PDF pages successfully and supplied the inspected page3.
This was an intermediate rasterization problem, not a changed or repaired PDF.

Independent reviewer `pdf_pipeline_evidence` audited the downloaded ZIP and all
four extracted files, verified the actual PDF/manifest pair and both artifact
record identities, and matched all 23 declared producer/input hashes to Git
objects at the exact implementation commit. Report and manifest agree on the
managed browser, lock, clean head/tree and run/attempt. It independently viewed
all five rendered pages and found no clipping or overlap. The ZIP retains four
evidence files, not every one of the kit's 27 outputs or the browser executable;
the complete-kit and binary checks are the recorded actual CI observations,
not an independent rehash of absent files. This distinction limits the external
audit without changing the successful real normal-CLI render observation.

The manuscript remains the explicitly unfrozen technical fixture, with
`working-tree-review` and null source commit/blob pins. These observations complete
the managed-print technical gap. They do not accept the future real PMDay article,
actual platform-editor transfer, publication, merge or permanent staging.
Final evidence-only documentation/archive changes leave the reviewed implementation
and public output unchanged; their exact head and CI results are recorded in the
live owning PR instead of relabeling this implementation run.
