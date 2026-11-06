# R10 White-box QA — frozen V4 affected recheck

Refs #169 / PR170. Reviewer `/root/r10_whitebox`, same-role correction continuation. **Pass for the bounded final identity/semantic/material/kit/locator scope. WB-C1 from the preserved correction review is resolved on V4.** No blocking finding remains in this affected scope; broader acceptance remains subject to its separately allocated evidence.

## Reviewed identity and context

- Repository `/workspace/scratch/f4dcb060a703/repo`; base `b75a0a31e36be02bea15bb7a0b269d032fa3cdcb`; committed manuscript `907602667ca447f23359bfa87acc0c191f5e3b8a`. This remains a prepared dirty candidate, not a clean-checkout claim.
- Frozen packet `review/issue-169/r10/candidate-manifest-v4.json`, SHA256 `8f782910013c7b85d77fbc93482d617155aee4c61413fe8f2caea031eaf680d5`; **56/56 entries match**, including expected deletions, at both opening and final checks.
- Final kit `dist/publications/sdlc-out-of-balance/9dc5a3731cf3f6afba981737df90e35a9b15def44d2e31c53f0dd6156af6b7c4`; artifact ID matches its directory. **10/10 declared inputs and 28/28 output hashes/byte sizes match actual bytes.**
- Common/role prompt identities, original intent and initial isolation limits remain those recorded in `/workspace/scratch/f4dcb060a703/r10-whitebox-review.md`. Preserve that first result and `/workspace/scratch/f4dcb060a703/r10-whitebox-correction.md`; this is not a new fresh-context review.
- Read the new amendment locator target to check routing. Its summaries of other roles/checks were not used as acceptance oracles. This is declared later correction-context exposure, after the independent first judgment. No peer output files were opened.

## Actual checks and AC allocation

| Risk / AC | Independent check and protected invariant | Observed result |
| --- | --- | --- |
| AC05/11 stale packet / WB-C1 | Python SHA256 and expected-absence comparison against all V4 entries, repeated after checks | 56/56 correct; packet digest unchanged. Earlier v2 drift is preserved, and no equivalent drift observed on V4. |
| AC04/08/09 semantic divergence | Compare actual kit, edition, material source, native HTML marker and site revision | All use semantic `889016f856311fb220f7433869c320a13e9f08c1a92366b8a03162a10d9a934b`. Kit/edition/material/publication edition IDs agree on `sdlc-out-of-balance-en-r10-20261106`. Native HTML contains that semantic marker; site revision contains it once. |
| AC08/09 stale material or approval | Hash actual PDF and review-evidence bytes; independently SHA256 the sorted compact JSON binding prescribed by the existing material contract; compare native download route | Target PDF hash and review-evidence hash match declaration. Independent binding equals `7d9dda792c528cc191eb5061e7beac3192d58a51f72b13bce1d6e9efdf387c46`; existing pure `reviewBinding` helper returns the same. Native route contains `article-media/36269db33a71781084053ae40cc41e411a0106bea5e593ef0b08414014c4ca40/reading-r10.pdf`. |
| AC04/08/09 inconsistent hero provenance text | Read exact declared credit, compare exact text in native HTML and final kit article/LinkedIn/Medium/copy-ready/print HTML | Final credit consistently distinguishes web/current-PDF JPEG, platform decoded PNG and original PNG retained in source provenance. All seven checked HTML surfaces contain the exact current credit. No historical-PDF original-PNG claim occurs in that credit. |
| AC05/11 lost archive navigation | Resolve every local Markdown link in all twelve original-path locators; check owning amendment target exists | Zero missing local links. `review/issue-169/2026-11-06-r10-amendment.md` exists and names issue169/PR170, source identity and current boundaries. |
| AC05/11 unchanged historical bytes | Recheck archive manifest digest and twelve archive-byte digests against previously verified original-Git-byte manifest | Archive manifest unchanged at `d5b380ce7247d1b8245ead7f4a3619b6df6f25d33d60d8e9a95d67604bafaaec`; 12/12 archive hashes unchanged. Reuse earlier decompressed-to-base Git equality and measured 1,401,835-byte net saving. |
| AC01/02/04/07/08/09 reuse scope | Compare actual manuscript/PDF to first packet; verify kit input hashes | Manuscript SHA256 `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f` and PDF SHA256 `36269db33a71781084053ae40cc41e411a0106bea5e593ef0b08414014c4ca40` unchanged. Reuse earlier source passage/order, five-page PDF, source paragraph/link and unchanged visual observations within their original limits. |

Final material review evidence SHA256 is `b92e3916e3ca45da7bea71a040cadad1f8874907a6f677bfd4637accc4e5a37a`; PDF remains 869208 bytes. These hashes bind the bytes; the evidence document's implementer visual-review statement is not independent visual acceptance.

## Execution and limits

All executed checks were read-only bounded Python/JSON/SHA256/path comparisons, actual source reads, and one pure Node `reviewBinding` invocation. Commands completed exit 0 with complete counts above; no new failure or rerun campaign. No implementation, test, external-service or repository-file writes; only this assigned report written. No duplicate source suite or Basic execution.

The maintained `publishing-profile`, `article-materials`, `site-articles`, `article-budgets` and history/source-selection routes remain as allocated in the first review and `tools/quality/test-profiles.json`; no new suite or check route is needed for these deterministic changes. Parent-supplied 83-case source and Basic results were not independently rerun or accepted from summary here.

This final check resolves the stale-v2 review gate on the pinned V4 bytes. RI/catalog freshness, final total repository hash budget, full current CI, browser/native editors/live URL/PDF behavior, staging/merge/production and other roles remain separately allocated and not observed by this check. PDF aesthetics, accessibility and source-image pixel provenance were not newly audited. Whole ACs cannot be ticked from this artifact alone.
