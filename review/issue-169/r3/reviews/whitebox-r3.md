# Issue 169 — R3 independent White-box QA, first judgment

2026-10-31. Reviewer task `/root/whitebox_r3`. Distinct nonauthor review; no delegation, candidate mutation, repository suite execution, build execution or external writes. Only this assigned report was written. Scope: prepared author-review subset in `/workspace/scratch/dbe331636386/r3`, not a clean Git checkout or native acceptance candidate.

## Verdict

**Suitable to show the author as a five-page illustrated review draft, with findings below. Platform-ready delivery and source-bound asset closure remain incomplete. This is not publication, native integration, scientific validation, issue-wide acceptance or a readiness approval.** No blocker was found in the current PDF's page count, retained prose, URL annotations, diagram placement or correspondence to the current PNG assets.

The useful supplied fragments are integrated where their arguments occur: lifecycle asymmetry, workstream/system relationships, review functions, overload consequences, and an accountable learning loop. The whole infographic was not merely appended. The supplied unsupported exponential-TCO forecast was not adopted; the asymmetry graph is prominently identified as conceptual and unmeasured. The workstream/system distinction and conditional risk framing survive.

## Independence and identities

The launch packet reports explicit accepted `fork_turns="none"`; the reviewer received no author conversation or peer verdicts and did not read global memory or current peer reports. Actual runner launch receipt belongs to the orchestrator; provider model/context internals were not observable to this reviewer. This is operational independence, not an isolated filesystem/security attestation.

Owner: issue 169 / PR170. Original issue intent from `issue169-intent.json`; current scope from `r3/author-scope.md`. Native R2 local changes were excluded from acceptance. R2 source was used only as the original article comparison. Original issue's historical PR refs are not represented as a verified live R3 Git head.

Supplied packet identity: `eb20f9cf216740d55f69f5f81c4c092ddb34664018d38cb69e351ac05b8f070b`. Independently observed manifest-file SHA256: `abbabf5c0ab41126d5920ec45fa035d445a2444e2a821e6077dc61032c8ce73e`. All 26 listed path/byte/hash entries matched. The packet field's digest construction was not supplied, so that field is a supplied identity, distinct from this independently observed manifest hash.

| Inspected dependency | SHA256 |
| --- | --- |
| `repo/AGENTS.md` | `ad4f179ec04c7af12867229d70598a660c5ae41f3cb456cafd02aca3d12a9988` |
| `repo/CONTRIBUTING.md` | `804fb3da9a0bc7369bbd902313224221becc6c6b775536ca943f8664bf741442` |
| `repo/agents/reviewers/README.md` | `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` |
| `repo/agents/reviewers/white-box-qa.md` | `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f` |
| `r3/manuscript.en.md` | `ec4c21d3864c9e3890fa0cacb7fea9dcadae42828a554f977b7eafcb7ab95baa` |
| `r3/The_SDLC_Is_Out_of_Balance_R3.pdf` | `1ab2cc7cd029647b723239218ebbfe307e7225fdf76b6a8249f034998d5ebcf0` |
| `r3/build_review.py` | `cc74725a7673b31702d47cbfe82afde475d24c85a60bfa84c200cc57fa471615` |
| `r3/illustrations.py` | `1885dbb33700746aff14b5bc75331905e9016941228434bebc92fe59f59dc499` |
| supplied infographic PNG | `c01ee5f9247fc2f0728fed6cf20844e0864e6ad5c11f792873187d517b065b77` |

Additional inspected owners: `guides/SITE-CHECK-PROFILES.md`, especially lines 331–359, and managed cloud runtime instructions. No environment-status tool was exposed by the discovery check; no network/credential work was attempted.

## Findings

### W1 — Medium: platform copies omit manual image responsibilities

Location: `r3/build_review.py:180–190`; all four files under `r3/platforms/`.

The producer comment promises “explicit manual-image responsibilities,” but only emits complete article text and local relative images. Neither generated HTML nor Markdown explains the manual upload/placement, captions, alt text, cover selection or final platform-editor verification responsibilities. Three HTML scans found no `manual`, `upload` or `paste` terms; direct inspection confirms there is no separate platform-delivery instruction in the supplied subset. Local image URLs resolving in a review folder do not establish that a platform paste will import the six assets or their accessibility text.

Protected invariant: AC04/AC08/AC09 require matching destination editions with actual figures; current task explicitly asks for platform-ready copies with manual image responsibilities. Proposed treatment: have the producer/author add a concise delivery checklist naming hero/body assets, insertion order, caption/alt handling, cover crop, and required editor preview. Retain current parity checks and perform real editor verification before platform-ready acceptance. No posting is authorized or needed for this correction.

### W2 — Medium: manifest does not bind the review HTML's font dependencies

Location: `r3/candidate-manifest.json`; `r3/build_review.py:111–116`; `r3/article.review.html` font-face rules.

The HTML references four fonts: `fonts/lato-latin-400-normal.woff2`, `fonts/lato-latin-700-normal.woff2`, `fonts/lato-latin-400-italic.woff2`, and `fonts/Liberation-Serif-Bold.ttf`. All are locally present; none is in the 26-entry manifest. The Lato license and other font provenance files are also outside that identity. Consequently the pinned HTML/producer hashes do not bind the font bytes that determine layout. A consumer receiving only the manifested subset can silently fall back and produce different line/page layout.

Protected invariant: AC05/AC08/AC09 source/asset closure and reproducible source-bound review. Proposed treatment: the producer should extend a versioned, sorted dependency manifest to the actual required fonts and licensing records and bind necessary R2 producer inputs or explicitly identify them as external dependencies. Then recheck affected render identity. The existing PDF itself remains byte-pinned and opens correctly.

### W3 — Low: review montages are stale visual evidence

Location: `r3/review/pages-montage.jpg` and `r3/review/figures-montage.jpg`.

The page montage shows the old page-2 sentence “This is the delivery stream”; the current manuscript/PDF says “The sequence from intent through delivery and operations to business outcomes is the visible workstream.” The figure montage shows “What the operating system still needs,” while the current figure says “What the delivery system still needs.” Its overload footer also differs. These montage files are not in the manifest. Individual `page-1.png` through `page-5.png` were independently compared pixel-for-pixel against the current PDF renders and all matched. Thus the stale montages are not a current PDF content defect, but could mislead author review if shown as exact-source evidence.

Proposed treatment: regenerate or clearly retire the stale montages before using them for review. AC05/AC08 evidence hygiene; manual owner is the artifact producer.

## Structural analysis and bounded oracle matrix

The producer flows R2 Markdown through exact string replacements and a figure registry into R3 Markdown, partitioned review HTML/PDF, platform Markdown and platform HTML. Diagram source creates five explanatory PNG/SVG pairs. Relevant fault paths are missing replacement anchors, asset/key mismatch, stale derived output, page overflow, URL loss, font fallback, and platform paste omitting local images. There is no application state machine, authentication, cancellation, request concurrency or interactive cleanup surface in this subset; those are genuinely absent here. Native site interactions and external editors are excluded/unobserved, not inapplicable to eventual delivery.

| Risk / AC | Structural fault and scenario | Independent oracle | Actual result / allocation |
| --- | --- | --- | --- |
| AC05 identity | Supplied file differs from receipt | Recompute byte counts and SHA256 for all 26 entries | 26/26 matched; local CLI evidence; dependency omission W2 remains |
| AC07/09 prose parity | Replacement or export drops article text | Compare R2/R3 diff; normalize Markdown asset URLs; extract PDF prose/reference items independently | Three Markdown copies exact after URL substitution; 52 prose/heading/caption blocks plus 6 reference items retained after extraction normalization |
| AC03/08 figure parity | Wrong/stale image or missing alt/caption | Six source assets; actual PDF image pixels; HTML image/local-file/alt/caption inventory | Six PDF image placements match current RGB PNG pixels; each of 3 HTML copies has 6 resolving images, 6 nonempty alts and 6 captions |
| AC08/09 layout | Extra pages, overflow or stale page screenshots | PDF page tree, text/image rectangles, direct current render comparison | 5 pages; 5/5 text-bound scans without out-of-page blocks; 5/5 stored individual renders exact; stale montages W3 |
| AC02 claim boundary | Conceptual graph appears measured; unsupported forecast copied | Supplied infographic vs diagram source, figure text, captions, article evidence note | No measured axes/values asserted; qualitative curves/disclaimers retained; no affirmative exponential-TCO claim; broader scientific verification not performed |
| AC02/09 URL preservation | Export loses source/author URL | Independently collect Markdown HTTP links vs PDF annotations and HTML anchors | 10 unique URLs; 15 PDF annotations; no missing URL in PDF or 3 HTML copies; remote access/redirects not reverified |
| AC04/09 platform delivery | Article copies render locally but omit upload responsibilities | Complete local text/asset parity plus explicit manual delivery instructions | Text/asset parity passes; instructions absent W1; actual destination editors unobserved |

All cases above are retained local/manual draft-artifact evidence under the existing `SITE-CHECK-PROFILES.md#qa-findings-to-github-actions` allocation route. No new suite/registry/workflow is proposed solely to name this review. Producer owns correction and focused recheck; author/editor owns visual acceptance; native integration owner retains repository acceptance/RI/CI and site/device checks. No full repository campaign was run or represented as required for this bounded draft check. No coverage percentage is claimed.

## Raw execution receipts and accounting

All commands ran under `/workspace/scratch/dbe331636386` using read-only Python/CLI inspection of the supplied sources. Full command inputs and stdout/stderr are preserved in this review execution's tool transcript; the key raw observations are reproduced here. No producer was executed because it writes candidate artifacts. No fault injection was performed; risks in unexecuted fallback paths remain analysis, not tested coverage.

Initial diagnostic attempt, tool chunk `8c121e`, `python -` with `from bs4 import BeautifulSoup`: exit **1**, setup failure before checks, exact stderr:

```text
Traceback (most recent call last):
  File "<stdin>", line 3, in <module>
ModuleNotFoundError: No module named 'bs4'
```

Diagnosis: missing optional parser module, not a candidate failure. Smallest useful corrective diagnostic used standard-library `HTMLParser`, without installing anything or rerunning an unchanged failing command. Chunk `7feabd`, exit **0**, complete output excerpts:

```text
MANIFEST 26 mismatches []
MD_PARITY article.review.md True
MD_PARITY platforms/linkedin-article.en.md True
MD_PARITY platforms/medium-article.en.md True
PDF_PAGES 5 LINK_ANNOTATIONS 15 UNIQUE_SOURCE_URLS 10 MISSING_LINKS []
HTML article.review.html images 6 missing [] alts True captions 6 missing_urls [] manual_terms []
HTML platforms/linkedin-copy-ready.html images 6 missing [] alts True captions 6 missing_urls [] manual_terms []
HTML platforms/medium-copy-ready.html images 6 missing [] alts True captions 6 missing_urls [] manual_terms []
PDF_TEXT_BOUNDS 1 outside []
PDF_TEXT_BOUNDS 2 outside []
PDF_TEXT_BOUNDS 3 outside []
PDF_TEXT_BOUNDS 4 outside []
PDF_TEXT_BOUNDS 5 outside []
```

Chunk `9ff6f8`, exit **0**, examined 53 Markdown blocks. Three naive whitespace-normalized substring comparisons initially did not match: line wrapping after an em dash, line wrapping inside `on-call`, and PDF extraction placing list numbers separately from reference bodies. Chunk `9744ed`, exit **0**, printed exact PDF excerpts establishing those extraction mechanisms. Removing only whitespace/soft-hyphen artifacts resolved the first two; the six reference bodies were then checked separately, without requiring extraction's reading order of the numbered markers. No missing article text was demonstrated.

Initial image digest matching found the hero only because source diagrams have alpha while the PDF images use RGB. The bounded diagnostic converted the candidate PNGs to RGB in memory, then compared MD5 pixel digests with `get_image_info(hashes=True)`; no files were changed. Final chunk `b83376`, exit **0**, raw results:

```text
REFERENCE_ITEMS 6 present [True, True, True, True, True, True]
PAGE_RENDER_IDENTITY 1 True
RGB_IMAGE_MATCH 1 ['hero.png']
RGB_IMAGE_MATCH 1 ['asymmetry.png']
PAGE_RENDER_IDENTITY 2 True
RGB_IMAGE_MATCH 2 ['workstream-system.png']
PAGE_RENDER_IDENTITY 3 True
RGB_IMAGE_MATCH 3 ['review-functions.png']
PAGE_RENDER_IDENTITY 4 True
RGB_IMAGE_MATCH 4 ['imbalance-loop.png']
PAGE_RENDER_IDENTITY 5 True
RGB_IMAGE_MATCH 5 ['systemic-response.png']
```

Render identity used `page.get_pixmap(matrix=fitz.Matrix(1.3,1.3))` vs RGB pixels of each supplied page PNG. Source diagram PNG dimensions: asymmetry 2160×630; workstream 2160×900; review/overload 2160×882; response 2160×594. Six SVG/PNG metadata locations were inspected; five SVG roots were present. Source registry, R2/R3 diff, actual supplied infographic, both montages, current full review-functions PNG and current page-5 PNG were visually inspected. This is bounded layout/content evidence; it is not actual mobile reading, physical print testing or a browser/platform interaction result.

## Open gates

Author visual/editorial acceptance, infographic/diagram derivation and licensing approval, final platform-editor image/alt/caption verification, native article/PDF/materials/tag integration, desktop/mobile/no-JS related-reading checks, exact native acceptance/RI/CI, remaining independent role results, live publication URL verification and any later authorized publication decision remain open. No AC checkbox is certified complete by this role report. The current instruction is to show R3 before publication; this review grants no public release action.

## Later source-packet addendum — delivery subset

After the independent first report above was written, the orchestrator supplied factual notice of `r3/delivery-manifest.json` and `r3/delivery/`, packet `5a3fa3e26a2bc6f9c8beafbff616182bbc7cd5b3b7c74efb720db1cf2e36d2d0`. No peer verdict or author conversation was supplied. This is a scoped continuation, not a newly fresh first review; first findings above remain intact.

Read-only check `a01fec`, exit 0, verified all **14/14** addendum file byte/hash entries. Base manuscript/PDF and both producer hashes remained unchanged. All three delivery HTML files contain six embedded PNG data URIs whose decoded SHA256 values match the current source PNGs in exact reading order. The standalone reading HTML embeds all four referenced fonts; platform HTMLs have no local font URL dependency. Thus the offered standalone HTML/PDF route has image/font byte closure under the addendum, addressing W2 for that delivery route. The base producer/dependency-manifest limitation remains as a reproducibility limit, not a reason to withhold the byte-pinned PDF/standalone HTML from author review.

`delivery/COPY-INSTRUCTIONS.md` explicitly covers full-article copy, manual image upload, reading/section placement, captions, reference/footer retention, preview crop responsibilities, pending URLs, and unobserved native editors. **W1 is substantially addressed for the offered HTML route.** Explicit transfer of each image's supplied alt text into native editors is still absent and should be added as an accessibility responsibility before destination-editor acceptance. No actual editor behavior was tested or claimed.

### W4 — Medium: relocated platform Markdown paths escape the delivery folder

Locations: `delivery/linkedin-article-R3.md:7` and `delivery/medium-article-R3.md:7`, and each file's other five figure references. Both keep the original `../images/*.png` paths even though the Markdown files are now at the root of `delivery/`, beside `delivery/images/`. They resolve to `r3/images/` in the workspace, masking the defect. Moving only the advertised delivery folder breaks all twelve platform-Markdown image references. The standalone HTMLs and general review Markdown do not have this defect.

Protected invariant: AC04/AC08/AC09 local asset closure for a reusable matching copy. Producer should adjust the relocated Markdown paths to `images/*.png` and regenerate its manifest; use a separate reviewer for that correction. Useful focused future check: require every local Markdown asset to resolve inside the delivered folder, rather than merely exist somewhere in the current workspace. This check was actually executed read-only, with raw output:

```text
DELIVERY_MANIFEST 14 mismatches []
DELIVERY_HTML The_SDLC_Is_Out_of_Balance_R3.html 6 image_bytes_match True
DELIVERY_HTML linkedin-copy-ready-R3.html 6 image_bytes_match True
DELIVERY_HTML medium-copy-ready-R3.html 6 image_bytes_match True
DELIVERY_MD The_SDLC_Is_Out_of_Balance_R3.md contained_in_delivery True
DELIVERY_MD linkedin-article-R3.md contained_in_delivery False
DELIVERY_MD medium-article-R3.md contained_in_delivery False
```

One preceding inventory/read command (`8ceb5a`) exited 1 only because the reviewer initially requested `COPYING-INSTRUCTIONS.md`; the inventory exposed the actual `COPY-INSTRUCTIONS.md` filename, then the corrected bounded read succeeded. This was a reviewer path mistake and no candidate instruction file was missing.

Updated disposition: the current PDF and standalone HTMLs can be shown as author-review artifacts with explicit publication limits. Do not claim complete portable platform-Markdown delivery until W4 is corrected. Keep W3's stale montages out of exact-source visual acceptance. All broader native/editor/author/publication gates listed above remain open.

## Correction phase — final corrected prepared packet

2026-10-31. Scoped continuation requested after the first independent result; no peer verdicts were supplied/read. The original judgment and addendum above are preserved. Correction input: `candidate-manifest-corrected.json`, packet **`74e4d506e370f712e17ececb5593a093acb99abdcc3c1800a0cbe80809d47630`**. Unlike the earlier packet, the digest method is explicitly documented and was independently recomputed successfully. Manifest-file SHA256: `c91dd8a2bab2d270161e29ce23d5fd3bceb07de64bc500919b575f88c1685f1f`.

**Correction verdict: W1, W2, W3 and W4 are resolved for this bounded prepared author-review/delivery subset. No remaining blocking white-box finding was observed for showing the corrected PDF and portable reading/platform copies to the author. This does not supply native/editor/device/scientific/publication acceptance.**

### Correction source and reused evidence

The manuscript remains byte-identical: `ec4c21d3864c9e3890fa0cacb7fea9dcadae42828a554f977b7eafcb7ab95baa`. Original thesis, evidence/claim-boundary analysis and R2/R3 editorial comparison were reused only for that unchanged source. All affected render, asset, path, instruction, font/dependency and receipt observations were checked again. The PDF is now **1,981,992 bytes**, SHA256 **`70052f9b0129c9e7bd3e70720a540869795d09eacf1ca780c55df64f4576b49c`**.

Changed producers inspected:

- `build_review.py`: `9c6fa7206b0cde1d5dceaa6931c163e1f6d4f39bee7a4e759b5cb4931af8fe3d`.
- `illustrations.py`: `ed60142ae857b88033b5e8d0ccc3761d93bab86d6f32ef76027154e7e91f61c4`.
- `package_review.py`: `c2d2b381afa6a0217f50100815018940a789a436b2aad9ca8665871d0a9dea08`.

The normal review render now reads `manuscript.en.md`; only explicit `--bootstrap` reconstructs the initial import. README labels this a one-off renderer and routes future publication through the existing native publisher. Necessary R2 source/hero/cover inputs now reside under `inputs/r2/` and are pinned. Four HTML font dependencies, font packages and both OFL notices are pinned. External installed package versions and Matplotlib's DejaVu Sans bundle remain explicitly declared dependencies; no PDF byte-reproducibility claim is made. No producer was executed by this reviewer because it writes candidate outputs.

### Finding disposition

| Finding | Corrected evidence | Disposition |
| --- | --- | --- |
| W1 upload/alt responsibilities | COPY-INSTRUCTIONS explicitly directs manual PNG upload, caption preservation, matching native alt-field transfer and final editor preview; ALT-TEXT-AND-CAPTIONS contains all six registry alt/caption pairs and credits | Resolved for documented manual delivery; actual native-editor execution remains unobserved |
| W2 dependency binding | Sorted corrected manifest contains all four referenced fonts, both OFL notices and required bundled R2 inputs; standalone HTML has no non-data CSS URL dependencies | Resolved for included artifact closure; installed package/font runtime dependency limits remain explicit |
| W3 stale montages | In-memory independent reconstructions of page and figure montages, using current page/figure bytes, encode to identical JPEG pixels | Resolved; current montages are now pinned |
| W4 portable Markdown paths | All three delivery article Markdown files use six existing image paths contained inside `delivery/` | Resolved; no parent-folder dependency remains in article image URLs |

### Executed checks and raw accounting

Read-only diagnostic command `de22ff`, exit **0**. Complete relevant accounting:

```text
PACKET 74e4d506e370f712e17ececb5593a093acb99abdcc3c1800a0cbe80809d47630
ROWS 66 SORTED True MISMATCH []
TEXT 52 MISSING [] REFS 6 MISSING []
HERO_CAPTION True
PDF 5 1981992 LINKS 15 MISSING []
PAGE 1 render_match True outside_text []
IMAGES [['hero.png'], ['asymmetry.png']]
PAGE 2 render_match True outside_text []
IMAGES [['workstream-system.png']]
PAGE 3 render_match True outside_text []
IMAGES [['review-functions.png']]
PAGE 4 render_match True outside_text []
IMAGES [['imbalance-loop.png']]
PAGE 5 render_match True outside_text []
IMAGES [['systemic-response.png']]
HTML The_SDLC_Is_Out_of_Balance_R3.html images 6 exact_order_bytes True viewport True non_data_css_urls []
HTML linkedin-copy-ready-R3.html images 6 exact_order_bytes True viewport True non_data_css_urls []
HTML medium-copy-ready-R3.html images 6 exact_order_bytes True viewport True non_data_css_urls []
MD medium-article-R3.md images 6 closure True
MD The_SDLC_Is_Out_of_Balance_R3.md images 6 closure True
MD linkedin-article-R3.md images 6 closure True
FONTS_PINNED all four referenced fonts True
ALT_DOC_PARITY True
PAGE_MONTAGE_CURRENT True
```

The raw `MISSING []` PDF URL result compares all ten unique source/author URLs. Text comparison checked 52 normalized prose/heading/caption blocks plus six separately extracted reference bodies, retaining punctuation apart from Markdown syntax and whitespace/soft-hyphen extraction effects. Current hero-caption visibility was additionally inspected in the actual page-1 PNG, after all five page PNGs were independently verified pixel-identical to current PDF renders. Six PDF RGB image payloads match their current source PNG pixels, including the changed overload figure.

Second read-only diagnostic `046d37`, exit **0**:

```text
FIGURE_MONTAGE_CURRENT True
BUNDLED_R2_INPUTS ['inputs/r2/images/cover-linkedin.jpg', 'inputs/r2/images/cover-og.jpg', 'inputs/r2/images/hero.png', 'inputs/r2/manuscript.en.md']
FINAL_PACKET 74e4d506e370f712e17ececb5593a093acb99abdcc3c1800a0cbe80809d47630
UNCHANGED_SOURCE ec4c21d3864c9e3890fa0cacb7fea9dcadae42828a554f977b7eafcb7ab95baa
```

Both diagnostic commands completed without an exception or incomplete accounting. No source mutation, fault injection, installation, full repository suite, external write or platform-editor action occurred. The correction's overload wrapping and visible hero caption were inspected; viewport presence is structural evidence, not a narrow-device interaction pass.

`package_review.py` now contains real prose/link/page/image/path checks and records its results, but its execution was not independently rerun because it creates artifacts. Its prose check strips punctuation and its Markdown check establishes existence rather than containment. This reviewer used a narrower text normalization and independently verified containment, so present delivery closure does not depend solely on those producer assertions. Future regression hardening could make the producer assert containment itself; this is a proposed check improvement, not a current artifact failure or an executed negative test.

Allocation remains local/manual draft evidence under SITE-CHECK-PROFILES; no duplicate repository campaign is required by this review. Author editorial/visual approval, full native/site/tag/materials integration, repository acceptance/RI/CI, actual destination-editor/device checks, verified hosted URLs and any authorized release remain open. The corrected packet is suitable to present before those steps.
