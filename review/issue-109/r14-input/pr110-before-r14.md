## Current review package — R9, 2 November 2026

Refs #109

The author asked to explain architecture and project planning before runtime operation, clarify both slides without losing the breadth of the subject, and polish alignment across the entire deck. R9 implements that request in the complete nine-slide presentation.

### Review the complete package

- [Editable PowerPoint](https://github.com/oborskyivitalii/oborskyivitalii/blob/6bd9e990251a6211f56ce6ba424960fe24879a71/drafts/devcon-romania-2026/r9/devcon-romania-2026-r9.pptx)
- [Matching PDF](https://github.com/oborskyivitalii/oborskyivitalii/blob/6bd9e990251a6211f56ce6ba424960fe24879a71/drafts/devcon-romania-2026/r9/devcon-romania-2026-r9.pdf)
- [Synchronized native/Markdown notes](https://github.com/oborskyivitalii/oborskyivitalii/blob/6bd9e990251a6211f56ce6ba424960fe24879a71/drafts/devcon-romania-2026/r9/speaker-notes.md)
- [Edition identity and source reproduction](https://github.com/oborskyivitalii/oborskyivitalii/blob/6bd9e990251a6211f56ce6ba424960fe24879a71/drafts/devcon-romania-2026/r9/README.md)
- [Current review, original requests and independent receipts](https://github.com/oborskyivitalii/oborskyivitalii/blob/6bd9e990251a6211f56ce6ba424960fe24879a71/review/issue-109/2026-11-02-r9-review.md)

### Resulting behavior

- **S07: architecture and project commitment.** Trace the closed control loop, constraints before effects and conditional human architectural dependencies; then evaluate control, operations and business-case evidence before commitment.
- **S08: validation during operation.** Follow admission → monitoring → reassessment/action. Retain the illustrative 196/3/1 veto, risk-conditioned exposure, changes beyond the app SHA, four monitoring domains, staffed fallback and stopping.
- All nine slides were inspected. Page markers and selected header/text frames are aligned, dense qualifications are more legible, and S05 has consistent six-card spacing without incomplete numbering.
- All nine R13 spoken bodies, evidence qualifications, both media assets and all 23 relationship parts are preserved. Delivery labels and reference navigation follow the new order. Earlier editions and the historical standalone R13 script remain untouched.

### Verification on the delivered source

Delivered commit: [`6bd9e990251a6211f56ce6ba424960fe24879a71`](https://github.com/oborskyivitalii/oborskyivitalii/commit/6bd9e990251a6211f56ce6ba424960fe24879a71)  
Tree: `db8d322ab4835a52701d914b130feea61cd8f0a0`  
Issue109 policy: `905dc7024963db321197fe13add4ec365151302ca833f977840a68a37b86f427`  
Clean-source report SHA256: `a2c7493e202205171595ee9dc59c65a58aebd4fdedbc6d31f065fb6607ff99c9`  
Observed `automation_pass=true`, `evidence_valid=true`, `source_dirty=false`.

| Current check | Actual result |
| --- | --- |
| BASIC | Passed; 16 focused tests and 10 color tests, zero failures/skips; generated source, geometry, syntax, links and budgets checked |
| STYLE | Passed, one retained named repository guard |
| CURRENT-RI | Passed, one retained current-catalog/freshness assertion |
| RI-CI | Passed, one retained current coupling assertion |
| Edition validator | Passed hashes/sizes and 9 slides / 9 notes / 9 PDF pages |
| Native and PDF content | Byte-identical PPTX reproduction; all visible paragraphs present on corresponding PDF pages; all nine renders match an independent renderer |
| QR and links | Native asset and final PDF rasters decode exactly one homepage QR; three closing PDF links survive |

The existing RI regression suite also passed 29 tests at the documented precommit checkpoint. The first clean run's stale coupling failure is retained and diagnosed in the review; the existing refresh corrected derived identity only. A separate Code reviewer inspected that correction: no checks, gates, routes or budgets changed. The final exact-head policy was then rerun successfully.

The shell transport lacked GitHub write credentials, so the same reviewed blobs were delivered through the authenticated GitHub connector with an expected-head lease. The resulting tree exactly matches the locally verified tree; the policy was re-executed against the actual delivered commit above.

Four distinct nonauthor roles completed source-bound review with explicit none-fork initial launches; their original receipts remain intact. Requirements/White-box/Visual final reviews are declared continuations of their own roles. The Code metadata correction resolved the missing handoff record. Provider-internal context is not claimed verified.

### Remaining gates and status

PR remains **Draft**. Exact R9 author review, timed English rehearsal and real presenting-device/projector acceptance remain pending. Plan at most 23 minutes speaking plus 7 minutes Q&A; this is not measured timing. One inherited runtime addendum uses a `sldNum` notes placeholder, so its Presenter View visibility remains a specific device check; the audience-facing human-capacity content is visible on S07/S08.

R3 remains event-selected. Independent non-DevCon reuse and complete rights/author gates remain open. This does not merge, select or publish the presentation.

At the first post-delivery Actions observation, Site basic, Issue acceptance and Local navigation jobs were **skipped** for Draft; routing/preview workflows were still in progress. Those observations are separate from the exact local results above.

### Preserved history

The [full pre-R9 PR body](https://github.com/oborskyivitalii/oborskyivitalii/blob/6bd9e990251a6211f56ce6ba424960fe24879a71/review/issue-109/r9-input/pr110-before-r9.md) and [full pre-R9 issue body](https://github.com/oborskyivitalii/oborskyivitalii/blob/6bd9e990251a6211f56ce6ba424960fe24879a71/review/issue-109/r9-input/issue109-before-r9.md) preserve previous editions, author instructions, decisions and results. Current scope is the R9 amendment; no historical green result is relabeled as current acceptance.

