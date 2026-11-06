# Requirements & Acceptance — affected correction final review

6 November 2026; issue109 / same Draft PR110; reviewer `/root/requirements_final`.

## Result and chronology

**Affected correction accepted: the disclosed AC13 PR/Jira unit-qualification omission is resolved in the inspected corrected candidate. No new blocking requirement/acceptance defect found in this bounded delta.** Whole-issue acceptance, clean-commit checks, actual commit/PR delivery and outstanding human gates remain pending.

This is targeted continuation/reconciliation after the preserved first report `requirements-final.md` (SHA-256 `073904e6bd41d3ed557e8763da8b9a560e8a2374dd9976cf315099b500f9df82`) and preflight addendum `requirements-correction-preflight.md` (SHA-256 `57887532063a9579f46241dcedb03842d8cc6581ee7cf7635c19d04dfb382523`). They are unchanged. The parent supplied factual correction scope and source references. Current peer result files, unrelated MEMORY and parent scratch notes were not read. This is not a newly fresh first judgment or a substitute for the other three role results.

Correction packet SHA-256: `ebed2dffbfe151107e6054e48c10d26d291e10ba39e39e16203c3f17a3d59837`. All 25 listed file hashes matched both initial and final recomputation during this execution. Real HEAD/base remains `3ee7398c48bfedca4a004e50ef72d88df954c8b4`; this is a prepared working-tree delta, not a clean candidate commit.

## Findings / dispositions

| Severity / state | Location and AC | Independent evidence and implication |
| --- | --- | --- |
| Material omission resolved | AC13; native physical `slide3.xml` = delivery S04, Chen–Stratton panel | Visible caption now says PR/Jira are per worker-month vs baseline; panel retains AGENTS, 1-Nov-2026, 655 firms, +35.7% opened PRs, +13.7% resolved Jira issues with borderline asterisk and +56.1% submission-to-approval time. Native notes, nonspoken Markdown sources and speech PDF specify baseline means and distinguish elapsed days from reviewer labor hours. Primary paper PDF pp30/34 independently supplies the normalized PR/Jira outcomes. S04 rendered at 110 dpi shows the caption within the panel without clipping. |
| Provenance correction accepted | AC02/04/09; `source_pins.article_r10` and retained article | Independently fetched immutable GitHub URL at commit `fc205b17774ba703c63fdd7d142ddac178afffdd`; returned source is 17,516 bytes, byte-identical to retained article, SHA-256 `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f`, Git blob `972486f459ebbcfd6cc333977d603670a6ea82dc`. Prior extra terminal LF is removed without changing article wording. |
| Storage disposition accepted | AC02/04/09; `external_baseline` and R10 README | Only the new redundant R12 copies are absent from `r10/sources`; article remains. Manifest carries each exact R12 name, durable ID/URL, byte size and original hash, with no dangling checkout path. README accurately describes externally retained baseline rather than a local copy. All three durable IDs resolved through authenticated reads with matching names/sizes; local baseline bytes match initial packet hashes. This supports source access/provenance, not general source-rights clearance. |
| Revision treatment accepted | AC04; `original_import_candidate`, `correction`, unchanged versioning owner | Corrected first canonical repository edition remains R10 under prior preflight treatment. All four original imported artifact hashes match the initial packet; original source IDs resolve with version `0`, exact names and sizes. Distinguish those original bytes from corrected package hashes. No older repository edition is replaced or relabeled. |
| Pending gates preserved | AC03–06/08/10 and other slide/source gates | Policy hash is unchanged from first packet; IDs, checks and gate assignments have not weakened. Current checks/handoff/commit linkage are pending observations here, as are final author, rehearsal/device, full rights and independent reuse. No additional import approval is needed. |

The paper's introduction uses submission-to-approval wording while the later results passage uses submission-to-merge; source-verification receipt explicitly discloses that ambiguity. Candidate follows the introduction endpoint and retains elapsed-time/borderline qualifications. This correction does not turn the study into a precise active-reviewer-effort, customer-value or causal-ROI measure.

## Bidirectional acceptance and preserved invariants

| AC / requirement | Check or independent oracle | Observed result and evidence limit |
| --- | --- | --- |
| AC13 qualified November evidence | Native/PDF/Markdown/nonspoken native source text against primary paper | Required normalization visible and synchronized; elapsed-time qualification separately present. Values, endpoint labels, borderline caveat and AGENTS treatment retained. Source-unit defect resolved in exact corrected hashes below. |
| AC01/02 and unchanged speech | Exact original imported R10 version-0 Markdown body read; local external R12 script; actual slide→notes relationships | All nine corrected spoken bodies exactly equal original imported spoken bodies. Recount: 1,434 vs external 1,423, +11; per-slide counts remain 132/177/127/117/233/174/183/192/99. All nine body paragraphs occur in their associated native note parts. Source-text reads establish body equality; remote raw artifact bytes were not downloaded or independently hashed in this execution. |
| AC02/16–19 frozen S06–S09 | Corresponding external native XML, exact spoken bodies and PDF rasters | Physical native slides 6/8/7/9 remain byte-identical to external baseline; corresponding speech bodies remain verbatim. Corrected and baseline PDF pages 6–9 rendered with the same Poppler command at 55 dpi produce byte-identical PNGs for all four pages. This bounded render comparison supplies frozen-PDF evidence, not real-device acceptance. |
| AC04/09 complete canonical package | Existing edition validator and manifest identities | `python3 tools/presentations/validate_edition.py drafts/devcon-romania-2026/r10` exits 0: nine native slides, nine notes, nine deck PDF pages and matching manifest bytes/hashes. Reading PDF contains corrected nonspoken units. Validator alone does not prove source meaning or visual/projector quality. |
| AC02/04 source fidelity and storage economy | Exact immutable GitHub content; durable external identities; original packet baseline hashes | Article matches exact remote bytes/blob. R12 source IDs resolve; baseline local bytes remain bound to original hashes; original R10 v0 identities are preserved separately. Budget pass not inferred; canonical RI/check campaign belongs to parent evidence. |
| AC03/05 current evidence and acceptance mapping | Unchanged policy hash; separate completed-role receipts and current checks | This affected Requirements result is complete. No claim that other roles/checks/issue checkboxes or final commit handoff passed. |
| AC06/08/10 retained human/reuse/selection limits | Existing explicit gates | Still pending as before. No measured rehearsal, actual presenting-device acceptance, independent non-DevCon reuse or event/release decision observed. |

Unchanged evidence reuse: original intent, current AC meanings, common/role contracts, substantive S01–S05 article alignment, six hypotheses, Agarwal values and earlier historical-fidelity dispositions remain as first reviewed. The policy and contract hashes are unchanged. Changed native/PDF/notes/article/provenance bytes were reviewed anew as above; prior hashes are never cited as current corrected-artifact acceptance.

## Exact inspected changed identities

| Input | SHA-256 |
| --- | --- |
| `drafts/devcon-romania-2026/r10/README.md` | `c3c21b4b2086a098a1f69299a8c6b8f668eed8330c44b6db78f7885afd1b60c0` |
| `drafts/devcon-romania-2026/r10/edition.json` | `bd93a7e19e482f8bfa23f9fca88ee96538c33ee764a53dd79623950b34708a77` |
| `drafts/devcon-romania-2026/r10/devcon-romania-2026-r10.pptx` | `31f45b07224a16e8c4be067c3a3b1579dac3311c14ad78af04798c325f81b7ef` |
| `drafts/devcon-romania-2026/r10/devcon-romania-2026-r10.pdf` | `24797112ddd150a9141f638994df393c6ea738a8e4cbdedb373028c2f5ddef1f` |
| `drafts/devcon-romania-2026/r10/speaker-notes.md` | `b72402da167075b7567a6d20b546995a03e8459ea31953ce8cda2b8363a45fca` |
| `drafts/devcon-romania-2026/r10/devcon-romania-2026-r10-speech.pdf` | `45378d1089952387d6dfdf757b041802913cebf32cfab62e58321e5f566d1bc9` |
| `drafts/devcon-romania-2026/r10/sources/article-r10.md` | `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f` |
| `.github/acceptance/issue-109.json` | `e2b516f08f3d8a20d3669b073fa099dd79da0503a9f9de3781614b9da9ee1b17` |
| `review/issue-109/r10-reviewer-receipts/source-verification.json` | `d39baed845f7897193608059632da92dc89f7ef70fd9347250ff2ab32203c4e4` |

External baseline remains PPTX `62078b50206fa2d5125e96af5b024c334c8f351c5459cbb1b70c8d9f338f07cd`, PDF `78c9b730780591155b15ce84e5e0487a7ee0a0d7947d895d9a762763b6f1d8be`, speech `26a2c948e86b8c30c01e5d705e68705b34696862eb62c510e77083300599e269`. Primary November paper SHA-256 remains `dcb4393f9c4d2461c5e86f470af808dd1291b66614c55d078610ce663dbb23cb`.

## Limits and next gate

No implementation or test changes, recursive delegation or external writes occurred. One local Git-object lookup could not verify the article commit/blob because those upstream objects are absent from this checkout; the bounded follow-up used the authoritative immutable GitHub file and confirmed exact bytes/blob instead. Provider model/context internals remain unknown. Only S04 was visually inspected by this role during correction; other roles own full presentation/readability/device observations. No parent pipeline outcome is inferred.

Reconcile this affected result with exact-source current checks, the other corrected-role results, actual commit/PR linkage and issue checkbox states. Preserve first findings/results and RI failure history. Remaining human gates stay open; no new approval loop for the authorized import/correction is introduced.
