# R10 Code correction review — same-role continuation

Reviewer `/root/r10_code`, 2026-11-06. First result `/workspace/scratch/f4dcb060a703/r10-code-review.md` is preserved. This is affected correction review, with author correction messages now disclosed; it is not a newly fresh execution. No current peer verdicts were consumed. No implementation, tests, external writes or delegation; this assigned report is the only output written.

## V2 inspected identity and outcome

Prepared dirty packet `review/issue-169/r10/candidate-manifest-v2.json`, SHA256 `c17052c42f2cce8cbb0384e3fac0af6b7eec8321e3e6a48d656e599a8e0163c2`, base `b75a0a31e36be02bea15bb7a0b269d032fa3cdcb`, source commit `907602667ca447f23359bfa87acc0c191f5e3b8a`. Every listed path/hash/deletion matched at inspection. Kit `dist/publications/sdlc-out-of-balance/1bed13d6cbb8e890c753eeab392408a583b66959602e16a584021d1937da973e`.

`node tools/publishing/cli.cjs validate sdlc-out-of-balance` and `node tools/publishing/cli.cjs verify <kit>` both **passed**. New semantic edition/material binding `00ca50cd044b3120c3eb26d72c701372fe9eb69ea5a7ab1d24532ca1bc325bfa` is coherent; previous transient semantic-drift failure is resolved for V2. PDF SHA256 remains `36269db33a71781084053ae40cc41e411a0106bea5e593ef0b08414014c4ca40`. Manuscript and visual-source bytes retain first-review scope.

**C1 remains unresolved in V2, with a narrower verified mechanism:** publication.json:112 now says the original accepted PNG is retained in the historical R9 PDF. Direct extraction from `site/assets/publications/sdlc-out-of-balance/materials/reading-r9.pdf` shows its hero is also JPEG SHA256 `fe76db95cbedba54934895fa21139654399b41b7c820c1974ad3fef410223e5f` (1672×545). Thus moving the PNG claim from current PDF to R9 PDF does not make it true. AC08 provenance and AC09 artifact parity remain affected. Remove the unsupported historical-PDF PNG claim, update semantic/material bindings and regenerate dependent outputs.

Reviewer precision correction: the first report called declared `hero-web.png` the original accepted PNG. The actual original `hero.png` is SHA256 `a43b9c72ed8f3560ae7c6e967730548be2f977fb0d1973b083dead16c633adf5`. `hero-web.png` SHA256 `3fb21ca8f7aae0ebe85f9da0cc5aaf5e124deb916d9fc625d3a46e4dfd33293f` is a lossless decoded copy of the JPEG; independently compared RGB pixels are exactly equal. Kit LinkedIn HTML uses `images/01-hero.png`, with those decoded-PNG bytes. Calling platform media a JPEG derivative is accurate about lineage, though naming the PNG rendition explicitly avoids encoding ambiguity. This correction does not change the proven absence of original-PNG hero bytes from either inspected PDF.

## Historical packaging delta

Archive manifest `review/issue-169/r10/history-archive-manifest.json`, SHA256 `d5b380ce7247d1b8245ead7f4a3619b6df6f25d33d60d8e9a95d67604bafaaec` lists twelve historical Markdown reports under review/issue-2, issue-5, issue-122 and issue-167.

Independently read every gzip, decompressed it in memory and compared its bytes directly with `git show b75a0a31e36be02bea15bb7a0b269d032fa3cdcb:<original-path>`: **12/12 exact equality**. All twelve original-byte counts/digests and archive-byte counts/digests match. Originals total 2,114,389 bytes; gzip files total 702,520 bytes; net savings after honest locator pages total 1,401,835 bytes. No original evidence text was modified inside archives.

Every original path remains a human-readable locator with title, local archive link, decoded/archive SHA256, explicit `gzip -dc` command and notice that relative original links resolve from its original directory. These locators are honest indexes, not replacement findings. Searchability and browser readability of the archived full text now require decoding; that practical cost is explicit. No known in-repository fragment links to removed headings were found in the bounded reference scan.

Source-consumer scan across tools/tests/site/.github/guides/agents found no executable parser, test oracle or source-byte pin consuming these historical Markdown bodies. References include four `.github/ri-ci-map.json` locator entries, four publication-blueprint narrative links, public-secret-checksum locator records and scanner disposition prose. The original paths remain valid. This is broader than the supplied four-reference summary, but the extra references are documentary/allowlist provenance, not parsed source contracts. No active runtime, budget, test or parsed JSON owner is replaced by gzip.

**No blocking finding in the lossless archive treatment itself.** Its final repository path inventory, RI map/source identity, scanner and CI evidence still need current checks; they are not established merely by archive equality.

## Bounds and remaining gates

Independently counted current on-disk RI inputs using the existing scanner's ignored-directory/derived-output rules: approximately **249,874,662 bytes / 2,256 files**, giving **125,338 bytes** below the unchanged 250,000,000-byte cap at that observation. This is a bounded size observation, not full RI verification, and later reports/manifests/metadata consume that headroom. No cap increase was made. Final RI build/verify must include all final artifacts.

No duplicate source campaign or Basic suite was run in this continuation; the orchestrator owns those current executions. First-review partial test accounting remains incomplete and is not promoted to a pass. Full Basic/RI/CI, independent-role completion, author/device/hosted/release gates remain separate.

The author messaged during inspection that another credit correction and V3 packet would follow. This V2 first correction judgment is preserved above; a new coherent identity is required for final affected acceptance.
