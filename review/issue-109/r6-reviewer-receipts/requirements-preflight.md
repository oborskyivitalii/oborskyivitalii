# Requirements & Acceptance preflight — issue 109 / PR110

Date: 2026-11-02. Role/execution: distinct nonauthor Requirements & Acceptance Reviewer, `/root/devcon_requirements_preflight`, first judgment. This result precedes dependent implementation and any peer reconciliation.

## Verdict

**The bounded integration has sufficient author direction to proceed. The next retained repository package is R6, with author-review-draft status.** The latest instruction authorizes integrating the exact approved S04 into the supplied nine-slide deck, reviewing the complete deck, exporting matching editable PPTX/PDF and updating existing Draft PR110. It does not establish whole-deck author acceptance, timed rehearsal, presenting-device acceptance, event selection, merge or publication.

The principal requirements defect is the stale acceptance policy: it still describes R3 and AC01–AC08, whereas the owning issue retains AC01–AC19 and the current request supplies newer exact sources. Reconcile the policy and record the dated scope treatment before claiming acceptance; this does not require another user decision or prevent mechanical preparation from the explicitly selected inputs. No requirement found justifies rewriting the R13 speech or redesigning another slide.

## Identity, independence and scope

- Requested launch isolation: `fork_turns="none"`, as specified in the assignment. The orchestrator must attach its actual tool launch/acceptance receipt; that receipt is not independently visible inside this execution. Provider context/model internals remain unknown. This is a conversation-reading boundary, not OS isolation or a provider attestation.
- I read no parent scratch notes, private conversation history or current peer-review outputs. Candidate statements in the supplied packet were treated as review subjects, then checked against source bytes and canonical contracts.
- Manifest: `preflight-manifest.json`, SHA-256 `7e3212227e18eb052355f2a831f7c75519ca1d55b52704c110af7d2e22ab22c1`. All 14 listed file byte hashes matched on inspection.
- Source PR checkout: `327ec57d9c4b7539d83631204b91bdc36545c862`; observed clean at inspection. Applicable main policy checkout: `8cf15883125892710633b17133d9ee0fc4b23b92`. Both HEAD values were independently read locally; remote freshness was not independently fetched by this reviewer.
- Common reviewer prompt SHA-256: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; Requirements prompt: `010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6`.
- Inspected: current request; current/original issue intent, active AC01–AC19 and relevant dated/historical amendments; current-main AGENTS/CONTRIBUTING and acceptance contract; presentation versioning contract; draft index/R5 manifest; actual full-deck and approved-preview OOXML; accepted PNG; standalone R13 script; current issue policy; validator source; bounded canonical path/export-mechanism inventory. No nested AGENTS was present at the inspected applicable draft/tools/guides parent paths.
- No implementation, external writes, delegation or test campaign was performed. Read-only observations include manifest hashing, native slide/notes extraction, source identity, normalized stage-wording comparison and visual inspection of the supplied PNG. These are not final-candidate export or content acceptance.

Supplemental inspected identities: `.github/acceptance/issue-109.json` at PR source SHA-256 `e3b97b08625c5af394e0b3083535589a329fbbb7f30f85c32cffa9ae4550d76b`; current-main `.github/ACCEPTANCE.md` `6469a66a36171404ce8448d75c3c5d96dc43563c76af41d4d2367598836fcaa8`. The canonical draft plan was searched for generation/re-export instructions (SHA-256 `792954ee56dee7fca53f5c61767ee21b6b60f7a91635494fd179970aef1feac7`), not accepted as a current visual oracle.

## Requirements defects and treatments

### RA-P01 — High: policy omits current acceptance and targets a superseded edition

**Evidence:** PR source `.github/acceptance/issue-109.json` contains only AC01–AC08. Its intent, automated scopes and human gates refer repeatedly to R3, 3–5-sentence cue cards and older preserved evidence-screen arrangements. Owning issue text at lines 164–191 defines AC01–AC19; its current brief explicitly requires reconciliation. Current request chooses the private full-deck source and R13 speech.

**Mechanism/impact:** Running the existing policy unchanged could produce correct structural results for an obsolete promise while leaving current slide acceptance, generation/reuse and exact-source evidence unmapped. A pass would not establish AC01–AC19. Affects AC01–AC05, AC09–AC19, with human gates still independently applicable.

**Treatment:** Retain stable IDs, record the 2 November source/edition amendment, and map all 19 criteria to bounded checks or explicit pending/manual gates. Incorporate current-main reviewer/acceptance policy. Current-main AGENTS explicitly excludes website Basic/package work for a trusted repository-only delivery lane; resolve the historical BASIC mapping against the actual admitted diff/lane rather than silently claiming a skipped run passed. Keep style/RI/coupling checks where applicable. Do not create a broad website/test campaign for this presentation.

### RA-P02 — Medium: historical literal slide/notes rules conflict with the newer approved sources

**Evidence:** Issue AC14 says `YES / NOT AT THIS RATE / ?`; the approved native S04 and matching PNG use `YES / NOT IN THIS SCENARIO`, with the third question left unresolved. Historical AC01 requires 3–5 cue sentences, while the selected full deck carries the complete R13 spoken sections. The current request explicitly preserves R13 wording and approves the supplied S04.

**Mechanism/impact:** Treating older literal wording as the integration oracle would undo the latest author decision; treating source approval as completion of all old gates would overclaim. Affects AC01, AC03, AC06 and AC14.

**Treatment:** Use the approved S04 bytes/render as the visual integration oracle and R13 as the spoken-text oracle. Record that the newer approval supersedes the historical literal labels/cue-only form while preserving their substance: conditional illustrative gap, deliberately unanswered recovery/ownership question and explicit limits. Keep added S04 source/qualification material in the reference section, separately labeled from spoken R13. No new spoken paragraph or speech rewrite is authorized. The supplied preview already follows this separation.

### RA-P03 — Medium: package numbering and historical delivery state must remain distinct

**Evidence:** `PRESENTATION-VERSIONING.md`, Revision identity and Immutability/progression, requires `max(repository editions) + 1` and consolidation of scratch aliases. The tracked inventory contains retained R1, R2, R3 and an R5 text/manifest package; no R6 exists. R13 is a standalone script and uncommitted deck filename. R5 manifest/index expressly state that its exact PPTX/PDF are absent from the repository.

**Mechanism/impact:** Naming the result R14, relabeling it R5, or using the new exports to satisfy the historical R5 hashes would violate identity/history. Affects AC04, AC05, AC08 and AC09.

**Treatment:** Create `r6/` with `devcon-romania-2026-r6.pptx`, matching `.pdf`, `speaker-notes.md` and `edition.json`. Record R5 as preceding retained repository identity with its incomplete binary-delivery status; distinguish R3 as the earlier complete committed package if useful. Pin PR source, private full-deck SHA and approved S04 SHA separately, and record the R13/source aliases. Preserve all earlier bytes and the standalone R13 script. Missing historical R5 binaries are not repaired by different R6 bytes and remain a disclosed historical gap. Current selection stays R3 until a separate exact-package selection is evidenced.

### RA-P04 — Medium: validation is not source-to-export or reuse proof

**Evidence:** The inspected `tools/presentations/` owner contains `validate_edition.py`. Its implemented checks cover artifact paths, sizes/hashes and slide/notes/page counts; it neither generates PPTX/PDF nor compares spoken text, rendering or QR payload. The inspected package index and versioning contract do not supply actual re-export/reuse evidence. Issue AC09–AC10 require an applied minimal native-source workflow and bounded reuse proof.

**Mechanism/impact:** A mechanical validator pass alone cannot show that the PDF derives from the submitted PPTX, that native components remain editable, or that reuse has been demonstrated. Affects AC03, AC04, AC07, AC09 and AC10.

**Treatment:** Reuse the existing canonical generation/export method and any source-bound prior minimal reuse proof where available; record the actual input → native PPTX → exported PDF command/tool identity and exact artifacts for this iteration. Inspect the existing evidence owner before deciding proof is absent repository-wide. If proof is inaccessible or inapplicable, retain AC09/AC10 as partial/pending rather than inventing it or expanding the task into a generic engine. A controlled re-export should check semantic/page/render equivalence; binary equality is not required if exporter metadata is nondeterministic.

## Exact integration scope and observable checks

| Intent / acceptance | Required check or owner gate | Preflight observation and final requirement |
|---|---|---|
| Nine-slide editable package; AC01/AC04 | Native slide relationships, size/order, notes and final PDF page count | Full source has 9 slides and 9 notes, size 12192000 × 6858000 EMU; preview has 1 slide/1 note at the same size. Final R6 must retain nine/nine/nine and native editable content. |
| Exact approved S04; AC14 | Render final S04 against approved PNG/native source; inspect retained title, three questions, local plot, ownership consequence/definition, experiment/source caveats, five systemic functions and lifecycle illustration | Approved PNG inspected. It contains all named functions and qualifications. Final integration/export remains unobserved. Preserve illustrative/noncausal limits and no stage-ranking/throughput implication. |
| R13 wording; AC01/AC02/AC14 | Compare spoken sections in every native note and human-readable package notes to canonical R13, allowing whitespace/packaging only | All nine full-source stage-note sections match R13 under whitespace normalization; preview S04 also matches. Preserve the original standalone script bytes; carry preview's extra source notes as references, not added speech. |
| Other-slide/content/history preservation; AC02/AC04/AC11–13/AC15–19 | Compare slides 1–3 and 5–9, their notes, relationships, media, links and QR with pinned full source; compare earlier tracked edition files with PR head | Native full-deck text inspected. No other-slide change is requested. Prefer exact part/hash preservation where feasible and explain any mechanical package differences. A concrete integration defect permits only a bounded correction with affected review. |
| Complete deck review; AC03 | All nine actual final renders, full-deck contact sheet and enlarged S04; title/pagination/style, clipping/fonts/contrast, reading order, transitions, source caveats and notes consistency | Only supplied S04 PNG visually observed in this preflight. Require actual final-deck review and four completed distinct source-bound roles; one slide approval does not approve the complete package. |
| Final QR; AC07 | Count one visible final QR, decode native asset and final PDF raster to exactly `https://vitaliioborskyi.ai/`, inspect matching URL | Final QR decode not performed here; prior edition decode is insufficient. Physical projection belongs to AC06. |
| Identity; AC04/AC09 | Existing edition validator on `r6/`, independently verified PDF page count; exact paths/sizes/hashes, source pins, predecessor, aliases, notes, counts and statuses in manifest | Existing validator source inspected, not run on a nonexistent R6. Record exact PPTX export provenance and actual renderer. |
| Repository/handoff; AC05 | Current admitted lane, mapped style/RI/coupling and acceptance checks on exact candidate; current PR/head/Draft readback; review receipt/source binding | Current local source identities checked. Reconcile current main as required by normal repository workflow, catalog new paths, regenerate/verify RI where affected, and update existing PR110 with `Refs #109`. No new PR or unrelated release work. |
| Minimal mechanism/reuse; AC09/AC10 | Existing documented native-source/notes/export workflow and bounded re-export/example evidence | Not established by inspected validator or packet. Reuse qualifying evidence; report any remaining gap explicitly. |
| Author/rehearsal/device; AC06 and slide author gates | Exact-package owner decisions, timed rehearsal and actual presenting device | S04 editorial approval is supplied. Full R6 approval, rehearsal and device acceptance remain pending; do not infer them. |
| Selection/publication; AC08 | Deliberate exact-edition event/plan update after selection | R3 remains selected in supplied canonical state. R6 preparation/PR update supplies no selection, merge or public-release authority. |

## Next gate and limits

Record the dated scope/mapping treatment, then integrate the two pinned native inputs and preserve R13. Review and validate the resulting exact candidate, obtain all four distinct required role results, resolve blocking findings and re-review affected corrections. Complete the authorized Draft PR update and artifact delivery while reporting pending human gates honestly; the overall issue cannot be marked complete on this work alone.

No unresolved material author choice blocks this bounded integration. Unknowns are evidentiary: final rendering/export, actual remaining historical/reuse proof, current remote PR/CI state, whole-package approval, rehearsal and hardware. This preflight does not independently verify the empirical papers, upstream scientific claims, source-license compatibility beyond preserving supplied provenance, or all prior historical review outcomes. It is not Code, White-box QA, Exploratory QA or final Requirements acceptance.
