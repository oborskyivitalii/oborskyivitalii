# R6 layout correction — Requirements preflight addendum

Date: 2026-11-02. Reviewer: `/root/devcon_requirements_preflight`, Requirements & Acceptance. This is a correction continuation reusing my preserved first judgment, **not a newly clean first review**. The orchestrator supplied neutral measured layout observations and a proposed treatment; no peer verdict or implementation was inspected.

## Judgment

**Proceed with the bounded S05 spacing correction under the existing task scope. No new author approval is required before this reversible correction.** This is an interpretation of the existing request, not a substitute for user authorization or final artifact acceptance.

The primary request explicitly asks to integrate S04, review the complete presentation again, deliver updated PPTX/PDF and update the existing PR. The supplied constraints preserve other-slide content, names, sources and links and allow a bounded correction of a concrete defect. Moving/resizing existing native text boxes to improve the reviewed layout, while retaining every word and the R13 speech, is consistent with that instruction. The earlier eight-unchanged-slide-byte rule was a useful implementation oracle; it does not prohibit a documented layout correction made during the requested full-deck review.

## Inspected evidence and limits

I re-read `devcon-review-inputs/request.md` and inspected native S05 in the pinned full-deck source, SHA-256 `6e62b5b83c55fa09e63cf25806bdcf4472ffe313e89b85d1f26d1484c777ebbf`.

- Shape 29, `Candidate Disposable implementation`, contains `3 · Disposable implementation`; native geometry is x=4599432, y=3694176, cx=3081527, cy=292608 EMU.
- Shape 30, `Scope Disposable implementation`, contains `Regenerate isolated, bounded features.`; geometry is x=4599432, y=4069079, cx=3054096, cy=338328 EMU.
- The supplied observation reports a two-line heading and 5.356 pt overlap of PDF text extents, with readable words and no demonstrated ink collision. I did not independently reproduce that PDF measurement in this bounded preflight. Describe the issue as tight spacing/hierarchy; do not overstate it as clipped or missing content.

## Amended oracle and required follow-up

1. Limit the amendment to native text-box position/size changes needed around the identified S05 heading and scope text. Preserve all words, ordering, source qualifications, notes, relationships, media and links. No speech, conceptual, styling or other-slide redesign is implied.
2. Keep the approved S04 identical to its accepted integration source. Preserve slides 1–3 and 6–9 and their dependencies. Permit only the documented S05 geometry delta beyond the already expected S04/notes integration parts; verify all other package parts remain unchanged or explicitly account for exporter-only differences.
3. Compare S05 native text and notes before/after, inspect the exact OOXML delta, and inspect the actual updated PPTX/PDF rendering at useful size. Verify readable separation, no clipping or new collision, retained alignment, and the complete nine-slide composition. PDF text extents alone do not prove visual quality.
4. Record this bounded treatment under AC03/AC15 and affected preservation evidence under AC02/AC04. Refresh exported artifact hashes and obtain affected independent correction review on the exact candidate. Reuse demonstrably unchanged evidence; do not rerun unrelated historical gates.

Full-package author acceptance, rehearsal, presenting-device review, event selection, merge and publication remain separate and are not established by this correction.
