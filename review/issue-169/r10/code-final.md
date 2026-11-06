# R10 Code review — final affected verification, V4

Reviewer `/root/r10_code`, 2026-11-06. Same-role correction continuation; first and V2 findings remain preserved in `r10-code-review.md` and `r10-code-correction.md` outside the repository. Author correction messages were consumed after the first judgment. No current peer verdicts were read. No implementation/test/external writes or delegation; only this assigned report was written.

**Verdict: C1 resolved on the frozen V4 product/history candidate. No remaining blocking finding in this role's inspected scope.** This does not establish repository-wide readiness or release acceptance; deterministic RI/catalog follow-up and the other applicable checks/gates remain separate.

## Final identity

- Base `b75a0a31e36be02bea15bb7a0b269d032fa3cdcb`; source-only commit `907602667ca447f23359bfa87acc0c191f5e3b8a`.
- `review/issue-169/r10/candidate-manifest-v4.json`: independently computed SHA256 `8f782910013c7b85d77fbc93482d617155aee4c61413fe8f2caea031eaf680d5`; **56 entries, zero actual path/hash/deletion mismatches**.
- Final kit `dist/publications/sdlc-out-of-balance/9dc5a3731cf3f6afba981737df90e35a9b15def44d2e31c53f0dd6156af6b7c4`.
- R10 semantic digest `889016f856311fb220f7433869c320a13e9f08c1a92366b8a03162a10d9a934b`, consistent between edition and material source; manuscript remains SHA256 `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f`; PDF remains SHA256 `36269db33a71781084053ae40cc41e411a0106bea5e593ef0b08414014c4ca40`.

## Actual bounded checks

`node tools/publishing/cli.cjs validate sdlc-out-of-balance`: **passed**, committed source provenance, seven sections/five figures and coherent semantic/material admission. `node tools/publishing/cli.cjs verify <final-kit>`: **passed**, current distribution-kit integrity.

The authoritative credit at `site/publications/sdlc-out-of-balance/publication.json:112` now accurately distinguishes web/current-PDF JPEG, platform `hero-web.png` as a lossless decoded copy, and original accepted PNG retained in source provenance. The identical corrected credit is present in generated native HTML, LinkedIn HTML, Medium HTML and kit instructions; none contains the false historical-R9-PDF PNG claim. Existing direct image extraction/pixel comparisons from this role support the corrected distinction.

The owning amendment `review/issue-169/2026-11-06-r10-amendment.md` exists and explicitly acknowledges direct extraction of JPEG from historical R9, so earlier inaccurate prose is not silently reused as pixel-provenance evidence. The R10 material review accurately describes current JPEG and unchanged diagrams. Source semantic/material bindings have been regenerated; the earlier transient semantic-drift error is resolved.

All twelve archive bytes still match their previously independently verified archive hashes. Every original-path locator still exists and links its corresponding gzip; its current-amendment destination now exists. Reuse of the prior **12/12 decompressed equality to actual b75 Git objects** is justified by unchanged archive bytes. No further historical-body consumer or runtime/oracle change was introduced by this correction. The documented RI/hash-cap observation and limited remaining headroom remain practical constraints for final metadata/evidence refresh.

## Evidence reuse and limits

The unchanged manuscript/PDF/visual bytes preserve this role's initial observations: required contextual operating-model passage and whole-system aim occur before ownership/pilots on native/platform/PDF surfaces; PDF has five pages, five images, 17 linked URL destinations and no extracted text block outside page bounds; original R9 edition/PDF remain byte-identical. Those observations were actually performed by this role and are not inherited R9 test passes.

No test suite was rerun in this final identity check. The first combined suite's interruption remains incomplete, not a pass. The orchestrator reports final 83 source cases and Basic 17+10 logs, but this bounded final task did not independently inspect those logs or convert them into this role's own execution results. Full RI/catalog verification on the final metadata state, whole-AC accounting, remaining independent/human/device/hosted/release gates and final published URLs require their respective actual evidence.
