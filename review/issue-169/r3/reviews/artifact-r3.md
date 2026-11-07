# Independent Code / Changed-Artifact review — issue169 R3

## First independent result

**Verdict: suitable to show the author as an R3 draft. No blocking content defect found within this prepared author-review scope.** The current PDF is five pages; the article preserves the original thesis, six sections, cited positive findings, qualified evidence and accountable end-to-end ownership. Five body diagrams now purposefully accompany the argument. Publication, native admission, author/editorial/rights acceptance and platform-editor readiness remain pending. This result supplies none of those approvals.

Reviewer: `/root/artifact_r3`, distinct nonauthor Code / Changed-Artifact role, first judgment. Parent supplied explicit none-fork launch as accepted; the reviewer can observe this task's provided packet and own execution, not provider-internal model/context isolation. No author conversation, current peer verdicts or global memory was read. No delegation, implementation or external writes occurred. Only this assigned report was written.

## Identities and inspected scope

Prepared subset, explicitly **not a clean Git/native candidate**. Packet identity supplied: `eb20f9cf216740d55f69f5f81c4c092ddb34664018d38cb69e351ac05b8f070b`. Independently checked all 26 listed path/size/SHA-256 entries in `r3/candidate-manifest.json`: no mismatches. The supplied packet digest itself was recorded, not independently reconstructed from an unspecified serialization.

- Manuscript SHA-256: `ec4c21d3864c9e3890fa0cacb7fea9dcadae42828a554f977b7eafcb7ab95baa`.
- PDF SHA-256: `1ab2cc7cd029647b723239218ebbfe307e7225fdf76b6a8249f034998d5ebcf0`.
- Original issue JSON SHA-256: `0ad19db39568074a9a00c5e82a03f4f5be7dddf77a8c302e596c406476d99362`.
- Current author scope SHA-256: `7eed4fb02b4eaf834586b2053eac88b9cef74b9e892e0ddf18798c35f0008eb9`.
- Supplied infographic SHA-256: `c01ee5f9247fc2f0728fed6cf20844e0864e6ad5c11f792873187d517b065b77`.
- Common reviewer prompt `agents/reviewers/README.md`: `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`.
- Role prompt `agents/reviewers/code-review.md`: `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`.
- `AGENTS.md`: `ad4f179ec04c7af12867229d70598a660c5ae41f3cb456cafd02aca3d12a9988`.
- `CONTRIBUTING.md`: `804fb3da9a0bc7369bbd902313224221becc6c6b775536ca943f8664bf741442`.

Read original issue/ACs, current scope, supplied infographic, R2 manuscript and README, complete R2→R3 manuscript diff, R3 manuscript/HTML/Markdown/platform editions, figures metadata, both Python producers and check report. Read repository source/editorial/provenance/style owners. Local R2 repository integration, PR state and unrelated publications were excluded.

## Actual checks and conclusions

1. **Argument/source preservation (AC02/04/07):** the diff retains the industry-level diagnosis as author synthesis; distinguishes visible workstream from sociotechnical relationships; retains review's learning/recovery functions; keeps the positive Claude example and limits. Additions extend cognitive-work asymmetry and make the systemic response visual. Exponential TCO is not imported. Consequences are explicitly a conditional mechanism, not inevitable forecasts.
2. **Source spot checks:** retrieved the official DORA 2025 summary, Microsoft Research Bacchelli/Bird abstract and full first-party Claude engineering account. Each supports the manuscript's bounded qualitative use. Direct NBER retrieval returned HTTP 403; a search returned the publisher's indexed abstract, supporting attenuation of coding gains into shipped output while releases also increase. The paper's full methods were not independently re-audited. No effect-size claims were added.
3. **PDF/render binding (AC08/09):** independently opened the actual PDF with PyMuPDF: five pages, embedded Lato/ReviewSerif fonts, 15 links covering all ten unique manuscript URLs. Re-rendered every page in memory at the producer's 1.3 scale and compared pixel bytes to the supplied five page PNGs: all identical. Visually inspected all five bound pages, rather than relying on montage freshness. Body text, headings, sources and author footer are present; no page clipping or missing section was observed.
4. **Parity (AC04/09):** both platform Markdown copies equal `article.review.md` after relative-path normalization. Both platform HTMLs contain six images and the same URL set as review HTML. All six review HTML image paths exist. Actual platform paste/import behavior was not observed.
5. **Figure logic (AC03/08):** the infographic was decomposed into usable mechanisms, rather than appended whole. The workstream includes feedback plus six enabling relationships. Review study functions and the author's operational extension are explicitly distinguished. The speed graph repeatedly states it is conceptual, without measured ranks or throughput. The response loop permits changing the diagnosis.
6. A first diagnostic import failed because optional `bs4` is absent. It made no changes. The bounded parity check was then implemented as an in-memory standard-library HTMLParser read, with successful final accounting above. Producers were not run to overwrite candidate outputs.

## Nonblocking improvements

### N1 — Figure 4 card text exceeds the intended boxes

**Severity: minor visual defect; AC08.** In `r3/illustrations.py` consequences(), the 3.66-unit cards and 12.4-point descriptions allow the People and Product descriptions to extend outside their right borders. A read-only Agg renderer measurement found maximum overruns of **35.01 px** and **49.01 px**, respectively, at the producer's 180 dpi. The actual PNG and PDF page 4 visibly crowd the inter-card gutters; this is not a PDF page clipping defect.

Treatment: wrap the long descriptions into shorter lines, preserving font size where possible, then regenerate affected figure/PDF and inspect at print and mobile size before final visual acceptance.

### N2 — Small figure labels underuse available print space

**Severity: minor readability improvement; AC08.** Pages 2–3 leave substantial lower-page whitespace while multi-line diagram labels and synthesis notes are much smaller than the prose. The 12-inch masters are reduced to roughly a page text width. On a narrow mobile display those full-width diagrams need zoom to read comfortably. Alt text conveys the mechanisms, but is less detailed than every card.

Treatment: use some available page space to enlarge the relevant diagrams or simplify text; preserve responsive zoom/large-image access in the eventual native edition. Mobile/browser and device acceptance remains unobserved, not passed.

### N3 — Producer source ownership is fragile for subsequent edits

**Severity: minor maintenance issue; CS01/CS04/AC05.** `r3/build_review.py:13,60–82` starts from the sibling R2 manuscript and rewrites `r3/manuscript.en.md` using exact string replacements. Editing the apparent R3 manuscript directly and rerunning this producer would discard those edits. It also embeds publication CSS as a Python string (`:112–163`) rather than using the native publisher's canonical styling owner.

Treatment: label this as a one-off review-kit transformation; before ongoing/native work, take the R3 manuscript as the single source and use the established publisher. Do not promote this helper into a parallel active publication engine. This does not block displaying the current prepared PDF.

### N4 — Prepared manifest does not close over layout dependencies

**Severity: evidence limitation; AC05/09.** The 26-file manifest omits the `fonts/` files referenced by review HTML and the R2 inputs required by the producer. These bytes affect reproducibility even though the delivered PDF itself is hashed and embedded fonts were observed. The separate montage files are also stale: page 2 montage text differs from the current manuscript/bound page PNG. They are outside the manifest and were not used as final visual evidence.

Treatment: include needed font/input identities and licenses in the eventual reproducible artifact packet, and regenerate or clearly exclude stale montages. Do not infer complete build reproducibility from the current manifest.

## Blockers, open decisions and limits

No blocker to **showing this draft to the author** was found. N1–N4 should be resolved or explicitly dispositioned before calling the illustrated package final/copy-ready. Native integration/checks, exact-source editorial/rights acceptance, actual site behavior, platform editors, external publication and post-publication URL verification were not observed. The author must still see this R3 before any publication action. Source-bound author review is the next decision, not an inference from this review.

## Delivery-addendum inspection after the preserved first result

The parent subsequently supplied a factual delivery-only addendum; no peer verdict was provided or consumed. Addendum packet `5a3fa3e26a2bc6f9c8beafbff616182bbc7cd5b3b7c74efb720db1cf2e36d2d0` references the original packet. All 14 listed file sizes/hashes independently match. The underlying manuscript/PDF/figure identities are unchanged, so earlier observations remain applicable.

Read `delivery/COPY-INSTRUCTIONS.md` (SHA-256 `d907d897eeee053d47f9268aabffed95b733c2abb34e0fe9ccc9a18f87ffbd09`). Its instructions correctly keep native-editor/manual-image work and publication pending. Checked standalone reading HTML (`cafd24ad430cb6902d54d4bf943b246b4bde3881b7ffdf4b88fe08795e6ac471`) and both platform HTML copies (`b7637fd03f6ee6a97814c8109f4835d54e4a9e89e2135beab0ec6f2ae7d2c664`): after normalizing image source attributes, each body exactly matches its original reviewed HTML. All six embedded PNG payloads in each HTML decode to their original source bytes. This proves portable image/source parity, not a browser/native editor rendering result. The final author's review links can use these HTML derivatives without separately transporting their PNGs.

**N5 — minor portable Markdown packaging defect; AC04/09:** `delivery/linkedin-article-R3.md` and `delivery/medium-article-R3.md` retain `../images/*.png` from the original `platforms/` directory, though they now sit at delivery root next to `images/`. They resolve only while the parent R3 directory remains available; moving the delivery folder alone breaks those Markdown figures. Treatment: regenerate these two copies with `images/*.png` paths, update addendum hashes, and check all relative image targets against the delivery folder. The standalone HTML alternatives pass embedded-image parity and avoid this defect. No new blocker to showing the draft author-review HTML/PDF is introduced.

## Correction-phase re-review — first result preserved above

**Updated verdict: suitable to show the author; no unresolved blocking artifact finding within this prepared review scope.** This is the original reviewer continuing after factual correction inputs, not a newly fresh execution. No peer verdict was consumed. Original findings and first verdict remain intact. Publication/native/editor/device/author acceptance remains pending.

Final inspected corrected packet: `74e4d506e370f712e17ececb5593a093acb99abdcc3c1800a0cbe80809d47630`. Independently recomputed the declared canonical JSON file-list digest: exact match. All **66** path/size/hash entries match current files. Manuscript remains `ec4c21d3864c9e3890fa0cacb7fea9dcadae42828a554f977b7eafcb7ab95baa`; corrected PDF is `70052f9b0129c9e7bd3e70720a540869795d09eacf1ca780c55df64f4576b49c`, 1,981,992 bytes and five pages. The common/role prompts and original intent remain as recorded above.

Read corrected producers, README, portable copy/alt instructions and manifest. Independently verified all five current page PNGs are pixel-identical to in-memory renders of the actual corrected PDF. Visually reinspected affected pages 1 and 4 and final page 5: visible hero caption, contained Figure 4 text, intact closing source/author apparatus and no page clipping observed. All 62 non-image Markdown text blocks normalize into current PDF text, including the now-visible hero caption. All ten unique manuscript URLs remain PDF links, with 15 annotations. No empirical wording changed, so the prior bounded primary-source review is reused.

For the three corrected standalone HTML files, body markup matches the reviewed originals after normalizing embedded-image URLs and removing the inert font-license template. Every file contains six PNG payloads, and each payload matches the corresponding source bytes. Viewport metadata is present; the new narrow-screen CSS was inspected structurally, not executed in a browser. All Markdown image references now resolve inside delivery. Alt/caption/credit instructions match all metadata values in `figures.json`. Current page and figure montages were independently reconstructed in memory from current source images using the declared composition: their JPEG bytes exactly match the manifest-listed montage files.

### Disposition of prior findings

| Finding | Current disposition | Evidence and remaining limit |
| --- | --- | --- |
| N1 card overflow | Resolved | Figure 4 now wraps descriptions inside taller cards. Read-only Agg measurement gives positive right clearances of 183.12/132.99/155.49 px and bottom clearances of 81.43/117.79/81.43 px for People/Product/Business. Actual page 4 visually confirms containment. |
| N2 small diagram labels | Nonblocking limitation accepted for this author-review edition; device acceptance remains pending | Current A4 labels are legible on inspection, with the explanatory caption and source prose supporting their meaning. Full-resolution PNG/SVG masters and explicit upload/alt instructions provide a usable path for larger views and native layout. This does not establish comfortable small-screen/native rendering; the viewport/narrow-screen rule alone cannot prove that. Further simplification/enlargement remains an editorial option, not a blocker to showing the draft. |
| N3 producer source ownership | Resolved within prepared-kit scope | Normal `build_review.py` reads the R3 manuscript; R2 reconstruction is gated behind explicit `--bootstrap`. README identifies the manuscript owner and one-off renderer and routes native work to the existing publisher. Embedded helper CSS remains appropriate only to this bounded review kit, not approval for a second active publisher. |
| N4 incomplete dependencies/stale montages | Resolved as a bounded byte/evidence packet | Corrected manifest includes font files/OFL notices, required R2 inputs, package producer, current page PNGs and regenerated montages. External package/font dependencies and lack of PDF byte-reproducibility guarantee are explicitly declared. Independent montage reconstruction matches current bytes. |
| N5 portable Markdown paths | Resolved | Both portable platform copies use `images/`; every Markdown image reference resolves within delivery and all three article Markdown files now share SHA-256 `988a44c9ee508cbb881f17b413bedc616db55a859efb649c0b285ab227919204`. |

No implementation or new test files were authored by this reviewer; bounded read-only checks were run in memory. Only this assigned report was appended. No actual browser, native platform editor, repository CI, live publication or deployment acceptance is asserted. Author review of this exact corrected R3 remains the next required decision.
