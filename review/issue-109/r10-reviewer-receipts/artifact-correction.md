# Code / Artifact affected correction review — issue109 / Draft PR110

**Verdict: F1 resolved on the corrected artifact hashes below. No remaining artifact blocker found in this affected re-review.** The first review remains intact at `/workspace/scratch/992b55cffd39/reviews/artifact-final.md` (SHA-256 `6c3328dff0f4f1c4096d39094c0759a9c4dc0864985fdd47b26a6f14cea6935d`). This is a continuation of that review, not a new first independent context. The correction request and neutral source-verification record were consumed; current peer conclusions were not read.

## Bound identity

- Reviewer: distinct nonauthor Code / Artifact role, task `/root/artifact_review`, affected correction phase. No implementation, delegation, source mutation or external write.
- Packet `/workspace/scratch/992b55cffd39/packet-correction.json`: SHA-256 `ebed2dffbfe151107e6054e48c10d26d291e10ba39e39e16203c3f17a3d59837`. All packet paths and hashes matched in this execution. Base remains `3ee7398c48bfedca4a004e50ef72d88df954c8b4`; this remains a prepared dirty working tree, not a clean candidate commit.
- Common prompt: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role prompt: `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`. Unchanged policy: `e2b516f08f3d8a20d3669b073fa099dd79da0503a9f9de3781614b9da9ee1b17`.

| Corrected artifact | SHA-256 |
| --- | --- |
| R10 PPTX | `31f45b07224a16e8c4be067c3a3b1579dac3311c14ad78af04798c325f81b7ef` |
| Deck PDF | `24797112ddd150a9141f638994df393c6ea738a8e4cbdedb373028c2f5ddef1f` |
| Speech Markdown | `b72402da167075b7567a6d20b546995a03e8459ea31953ce8cda2b8363a45fca` |
| Speech PDF | `45378d1089952387d6dfdf757b041802913cebf32cfab62e58321e5f566d1bc9` |
| Edition manifest | `bd93a7e19e482f8bfa23f9fca88ee96538c33ee764a53dd79623950b34708a77` |
| Retained article | `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f` |
| Source-verification record | `d39baed845f7897193608059632da92dc89f7ef70fd9347250ff2ab32203c4e4` |

## F1 disposition and actual affected checks

The actual editable delivery S04 (`ppt/slides/slide3.xml`) and final PDF page 4 now identify agents in the panel header and explicitly qualify the PR/Jira percentages as per worker-month relative to baseline. The qualifier applies to those two rate measures and does not turn the elapsed review-time percentage into a worker-month quantity. Native note `ppt/notesSlides/notesSlide3.xml`, Markdown source notes and the reading PDF's final reference page explicitly distinguish baseline-normalized worker-month measures from elapsed days and reviewer labour hours. These corrections restore the missing source-unit semantics protected by AC02/AC13.

I inspected the actual native text/notes, extracted final PDF text, and rendered and visually inspected corrected deck page 4 and speech reference page 10 at readable scale. The new visible qualifier fits inside its panel; the additional reference sentence fits above the page footer. No new clipping, overlap or source-value change was observed. Values remain 35.7%, 13.7% with the caution and 56.1%; the elapsed-time caveat remains.

The edition validator passed on the corrected candidate: hashes/byte sizes, nine native slides, nine native notes and nine deck-PDF pages. Independently checked all nine speech bodies against actual attached notes and their corresponding reading-PDF pages after whitespace normalization: all matched. Counts remain 1,434 versus the external baseline's 1,423 words. I rechecked frozen S06–S09 against accessible external R12 bytes: each spoken section is verbatim, each native slide XML is identical and each final PDF raster is pixel-identical at the tested default MuPDF setting. These are current checks, not merely inherited conclusions.

The first review's unchanged broader inspection remains applicable to source caveats, six hypotheses, Agarwal values, argument, native editability and historical-package protections. This correction does not purport to close the independent human/device/source-rights gates as a whole.

## Source and metadata correction

- Independently computed retained article Git blob identity using `git hash-object`: `972486f459ebbcfd6cc333977d603670a6ea82dc`, matching the declared upstream blob. Byte count is now 17,516. I did not re-fetch the remote commit in this execution; this verifies the local byte-to-blob identity against the supplied immutable source ID.
- `source-verification.json` now explicitly records the November paper hash, exact page map and the introduction/results disagreement about approval/merge wording and borderline/marginal significance. It accurately describes the ambiguity observed during my first inspection and states the candidate's introduction-based treatment. This resolves my prior handoff-evidence question within the inspected record without inventing source consistency.
- The removed R12 files were newly introduced copies, not prior tracked editions. The corrected manifest replaces them with exact external filenames, durable source IDs/links, sizes and hashes. Those hashes match the accessible baseline files under `../r12-input`. The README now accurately describes external retention. Original pre-correction imported R10 hashes and version-0 IDs remain separately identified in the manifest; the corrected first repository R10 remains an author-review draft.
- Reviewed the catalog/control metadata semantically against base: catalog additions cover this R10 package and review evidence; two existing purpose descriptions change to current R10 ownership. No existing catalog owner/role was semantically changed or removed by the comparison. The RI/CI-map delta only refreshes policy/catalog source hashes and its aggregate reviewed-source digest; no suite selection or coverage definition changed. Full repository checks and generated-map freshness remain orchestrator obligations.

## Nonblocking maintainability note

The catalog's raw diff is approximately 14,686 lines because its update also reorders existing entries and converts existing Unicode literals to JSON escapes. The semantic comparison found only scoped additions and two purpose changes. Reducing that serialization churn would make review easier and better fit CS05's focused-formatting rule; alternatively, record the applicable dated exception if retaining a whole-file mechanical rewrite. This does not reopen F1 or expose an artifact-content blocker.

## Remaining limits

The first report's platform, physical projection, Presenter View, rights, measured rehearsal, independent reuse, clean-commit delivery and live-GitHub limits remain. This role did not independently re-export the native file, rerun the full repository checks, decode the QR, audit peer outcomes or verify durable external source accessibility through another account. Final source changes after these identities require affected review. Provider model/context internals remain unknown; launch assurance is not inferred from a role label or this report.
