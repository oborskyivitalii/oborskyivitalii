# Exploratory / Interaction QA — affected correction

6 November 2026, issue109 / Draft PR110, execution `/root/exploratory_qa`. **PASS for the affected viewing/export journey; no blocking artifact finding.** First judgment remains unchanged in `reviews/exploratory-final.md`. This is a continuation with the correction facts supplied by the orchestrator, not a new fresh-context first judgment. No peer receipts or unrelated memory were opened; no accepted-source/test edits, delegation or external writes occurred.

## Source binding and charter

Correction packet `/workspace/scratch/992b55cffd39/packet-correction.json`, SHA256 `ebed2dffbfe151107e6054e48c10d26d291e10ba39e39e16203c3f17a3d59837`. All 25 referenced file hashes matched before execution. Candidate remains a prepared working-tree delta based on `3ee7398c48bfedca4a004e50ef72d88df954c8b4`, not a clean committed candidate. Original owner/ACs, common prompt and role prompt are unchanged from first judgment: common SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role SHA256 `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`. Provider model/context internals remain unknown. Final GitHub/CI/handoff accounting remains the orchestrator's responsibility.

| Corrected artifact | SHA256 |
| --- | --- |
| PPTX | `31f45b07224a16e8c4be067c3a3b1579dac3311c14ad78af04798c325f81b7ef` |
| Deck PDF | `24797112ddd150a9141f638994df393c6ea738a8e4cbdedb373028c2f5ddef1f` |
| Speech PDF | `45378d1089952387d6dfdf757b041802913cebf32cfab62e58321e5f566d1bc9` |
| Speech MD | `b72402da167075b7567a6d20b546995a03e8459ea31953ce8cda2b8363a45fca` |

Charter, before viewing: inspect S04's longer AGENTS header and restored PR/Jira units for fit, legibility, number/qualifier preservation and visual grouping; inspect the new nonspoken paragraph at speech-PDF p10 for fit and clear separation from footer; independently check native/export correspondence and ensure previous page/QR journeys can be reused. Bound: two affected pages viewed, all 19 page rasters compared with my original renders, one independent headless native re-export and targeted native/source checks. Linux/runtime capability unchanged; no new device campaign.

## Actions and expected versus observed results

| Action / AC | Expected | Actual observation |
| --- | --- | --- |
| Render and view corrected S04 / AC03,13 | Longer header/caption remain legible and inside panel, without hiding quantities or other panels. | Rendered independently at 1400 px width to `exploratory-work/correction/deck-04.png` and opened with `view_image`. `CHEN–STRATTON · AGENTS · 1 NOV 2026 · 655 FIRMS` fits one line. Caption `PR/Jira: per worker-month vs baseline. *Borderline; time ≠ reviewer hours.` fits one line within left panel, separated from statistic labels. +35.7%, +13.7% resolved*, +56.1% and all Agarwal values/qualifications remain readable. No overlap, clipping or panel shift observed. Caption is small supporting text; projection-distance readability remains unobserved AC06. |
| Render and view corrected source p10 / AC02,03,13 | Added units explanation fits existing reference page and remains nonspoken. | Independently rendered 1050 px width to `exploratory-work/correction/speech-10.png`, opened with `view_image`. Full new two-line paragraph fits below final source paragraph and above footer separator, with visible whitespace on both sides. It states worker-month/baseline means and elapsed days rather than labour hours. `REFERENCE / NOT SPOKEN`, page10 and edition footer retained; no clipping or overlap. |
| Compare all current rasters with my first-run rasters / AC03,11–19 | Only intended pages change. | Pixel comparison at matching render dimensions: deck pages1,2,3,5,6,7,8,9 exactly equal prior viewed PNGs; only p4 differs. Speech pp1–9 exactly equal prior viewed PNGs; only p10 differs. Thus original full-page viewing evidence is reused only for unchanged page pixels. |
| Own native re-export / AC01,04,09 | Corrected PPTX renders the supplied PDF without drift. | Independent isolated-profile `soffice --headless --convert-to pdf:impress_pdf_Export` into my `exploratory-work/correction/` succeeded. Nine pages; all nine default-scale PyMuPDF page pixel arrays and per-page URI lists equal the corrected accepted PDF. All delivery-order native visible text runs occur in matching PDF pages after whitespace normalization. |
| Notes/speech synchronization / AC01,13 | Clarification nonspoken; spoken bodies unchanged. | New `Chen-Stratton units: PR/Jira changes are per worker-month relative to baseline means.` occurs in Markdown, S04 native notes and speech PDF p10. Each current spoken body occurs unchanged after whitespace normalization in my prior speech-PDF extraction and current corresponding native note. Nine bodies remain 1,434 whitespace words. Speech PDF retains ten reference-link annotations. |
| Frozen S06–S09 / AC16–19 | External baseline remains unchanged. | Each S06–S09 body byte-equal to exact supplied external R12 speech section; corresponding PDF pixel arrays equal R12 baseline. Baseline files now accessed at `../r12-input`, and all three hashes equal the identities from the first packet. Removing redundant checkout copies does not invalidate these comparisons. |
| QR/link evidence reuse / AC07,19 | Closing surface and QR unchanged. | S09 current pixels equal my original viewed S09; native QR `ppt/media/image2.png` SHA256 remains `a41f34f3039f8b4673b0f62ecf08c315ebe0ad0f55bcec5b8b8b3544ead8c38e`; current closing URI list equals my original evidence. Reuse previous native/raster QR decode to exact `https://vitaliioborskyi.ai/` and previous read-only homepage path observation. No new live-site, physical scan or browser/device claim. |

Raw evidence is in my own `exploratory-work/correction/hashes.json`, `pixel-compare.json`, `results.json`, independent re-export and affected-page PNGs. Original evidence and first report preserved. The current correction packet identifies article source SHA256 `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f`; this review checked supplied byte identity, not a new scientific/source-meaning or licensing verdict.

## Disposition and remaining limits

No regression or blocking readability/export defect reproduced. This supports the affected AC03/13 exploratory evidence and preserves unaffected original journey evidence under the demonstrated pixel/hash matches. It does not independently establish primary-study correctness or whole human acceptance.

Per `guides/SITE-CHECK-PROFILES.md`, retain this as issue109 manual artifact/EXPLORATORY-QA correction evidence, with manual QR evidence reused on unchanged source. Existing edition validator remains the counts/hashes owner; no new Actions suite or duplicated device matrix proposed. Re-render/review if these pages change again. AC06 real projector/Presenter View, timed rehearsal and exact author acceptance remain pending with the author; full rights and independent non-DevCon reuse remain with their existing named gates. None was executed or marked N/A here.
