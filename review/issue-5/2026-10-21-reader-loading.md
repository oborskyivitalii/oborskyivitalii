# Issue5 / PR79 — selective reader image loading

Owner: [issue5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5),
[PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
The owner authorized implementation of the diagnosed optimization on21October.
[Implementation scope](https://github.com/oborskyivitalii/oborskyivitalii/issues/5#issuecomment-6308024785)
and [PR scope](https://github.com/oborskyivitalii/oborskyivitalii/pull/79#issuecomment-6308025083)
also own the final exact-source results recorded after this candidate is frozen.

## Intent and inspected baseline

Starting head92b671f9d94b1be2e7ab9735e6fe267deb6c4aff/tree8e5a1e43.
The prior actual staged283b32f reader failed mobile LCP4202.636/2500ms;
the original complete five-route matrix passed. All original raw evidence remains
at immutable9147ecccc96247ee6a1ec40c786cb99db211ad1a; final source checks at84330244.
[Causal report and12 retained trials](https://github.com/oborskyivitalii/oborskyivitalii/blob/aade77a24d60987d272a2d8f46118d14b3b04c9b/review/issue-5/2026-10-21-performance-optimization.md)
showed simulated LCP4202.360→2027.178ms and initial transfer746085→245062bytes
when seven distant slide requests were deferred. The cover still loaded; the LCP
element stayed the same paragraph. Observed loopback LCP198→181ms is a different
quantity. This did not establish a working fix or actual-host/field acceptance.

## Implementation and invariants

`tools/site/reader.cjs` owns the shared policy: keep the first rendered image and
declared cover eager, mark subsequent figures loading=lazy. State is scoped to one
reader rendition and independent of asset inventory order or publication IDs.
Declared dimensions, admitted image/original URLs, source AST, alternative text,
credits, source/semantic editions and print/platform producers are unchanged.
Current article/reference render fields are identical after stripping only the
new loading attributes. Engine, scene, effect and publication sources are unchanged.
Regenerated current runtime/snapshot identities are derived, not editing owners;
previously retained history stays unchanged. Existing complete reading-transfer
budgets still count all images, including deferred slides.

The maintained article browser journey previously waited for every offscreen image
to load without visiting it. It now visits every body image before the same
complete/natural-dimension proof and restores its original scroll in finally.
This functional journey remains separate from cold performance collection. No
missing image, budget, case or fallback is ignored or removed.

Three permanent producer regressions cover reordered assets plus cover furniture,
an article without a cover, and a first image in a final endnote before an appendix.
They also retain source/other-rendition parity and fresh per-rendition state.
No new dependency, browser pin, framework, profile or threshold was introduced.
Responsive renditions and CPU changes remain conditional on actual measured need.

## Preparation evidence and limits

Prepared source checks: corrected four focused suites78/78 PASS, no skips.
The first two new fixture cases initially failed because their declared alt text
did not match their Markdown; those invalid test fixtures were corrected, with
the initial23/25 log retained. The separate endnote regression deliberately
reproduced RF01 below before correction, then passed after the ordering fix.

The prepared real Color article passed cold-load/late-image/deep-fragment/viewer
and focus/return-history/native-no-JS/cold-native-print observations. Initially
only its cover decoded; no-JS and native print decoded all8 images. The26-page
cold print PDF embeds8 unique image objects with the original dimensions:
cover1280×398 and seven slides1921×1080. All26 thumbnail pages were visually
inspected for missing images. This checks loading/print regression, not editorial
acceptance or replacement of the canonical compact article PDF.

The first probe prematurely asserted a same-document smooth anchor position; its
corrected recipe uses the existing stable-anchor waiter and absolute image.src.
Both preparation attempts are retained. The dirty prepared artifact is explicitly
preflight evidence. Its staging-edition CLI correctly rejected publication rights
on a dirty checkout; no admission or upload occurred. The final artifact is built
fresh after exact source freeze using the existing Color and staging-edition
producers and their clean-checkout rights binding.

The complete existing89-pin Python closure passed its canonical verifier. Ordinary
pip resolution first exposed the already-reviewed Semgrep1.179.0/MCP1.30.0 override;
installing the exact frozen closure with no-deps and verifying all143 dependency
edges preserved the existing single override. No lock or exception was changed.
The actual browser override remains Chromium153.0.8010.0, SHA256
53a15d6c3a3d27dfb54c4ba60278b1683136f70cf1e67e989da7dfbd3d451ef0,
distinct from managed153.0.8010.12. Local lab evidence cannot establish managedCI,
physical-device, CDN, field-INP/RUM or production eligibility.

## Independent implementation review

Separate non-implementing reviewer `/root/reader_loading_review` inspected the
actual prepared four-path authored diff and generated outputs against92b671f9.
It found RF01 Medium (AC08/AC11/CS07): render evaluation produced appendices before
the final endnote although DOM emission placed the endnote first, so a valid
endnote's first image could incorrectly become lazy. It independently reproduced
the defect. The correction renders final furtherReading before appendices and
adds a regression with an endnote image followed by an appendix image. RF01 is
closed after re-review and the regression passes.

The reviewer independently compared every reader return field for the actual
PMDay and reference publications against the parent: identical after stripping
only loading=eager/lazy. It verified the five generated runtime files are
byte-identical under new names, principal-page parity after identity normalization,
the prepared functional receipts, and the26-page contact/8 embedded images.
It made no source changes and ran no browser/benchmark. Re-review found no
remaining blocking authored finding; may advance generated/RI/report freeze and
exact-source checks, then the declared complete performance run.

Reviewed authored manifest SHA2569b90c8682aa1ddffe7e029f282369e6444558433ccdcf9fea070f21d89c37fa9:
reader producer6ae95e796e6bd8b9b4bd03a30f92c44cfead057c525d88b2e1a85fe5d6d7072f;
reader testsd329ab8ba44b81c704527b72644cec4573f009e5d3b9dc79fe234d50200da1f7;
article browser74fc77c23f5cdaa0d806bc185ff40c052b8aabdeb36ae9112d86a78336f939cc.
Final metadata and measurement/publication receipts remain separately bound to
the frozen candidate; this implementation review does not pre-claim them.

Final metadata receipt, verbatim from `/root/reader_loading_review`:

> Final review PASS for staged tree febb9adb04bf5e6a8a185b356420fcde2f895e14.
> RF01 remains closed; four authored hashes unchanged. Five runtime files remain
> byte-identical to base; principal/snapshot pages retain normalized parity.
> Catalog changes are exactly +17/−16, with no modified existing/history entries.
> Report and MEMORY accurately leave exact-source performance acceptance pending.
> May freeze candidate, run mapped checks, then the declared complete matrix.
> No browser, benchmark or scanner run by this reviewer.

The manifest uses the ordered paths site/README.md, tests/reader-mode.test.cjs,
tools/quality/article-browser.cjs and tools/site/reader.cjs, with byte counts
39874,40539,76475,13766. SHA256 is over UTF-8 compact sorted-key JSON rows
`{path,bytes,sha256}`, without a terminal newline. This receipt and deterministic
RI refresh preserve the independently reviewed meaning and authored bytes.

## Verification and acceptance map

| AC / style | Check and expected observable result |
| --- | --- |
| AC08, CS02/CS06/CS07 | First/cover eager, later images deferred; complete native/viewer/fragments/history/print, unchanged scene/transition behavior |
| AC11, CS01/CS04/CS05/CS08–CS10 | Shared owners, focused behavior regressions, Basic, exact owning policy, format/lint, style guard, RI and coupling, independent review |
| AC12, CS07 | Same source-bound Color/staging edition, all samples retained, existing Lighthouse/motion/navigation/retention/soak limits, issue/PR result records |
| Existing AC13/AC15 | Whole ticks preserved only after fresh mapped source checks; no implication of accepting original whole-feature gates |
| Historical AC23 | Staged283b32f controller/alias/recovery proof stays historical; this source is not thereby staged or admitted |

After final source freeze, run its mapped source checks and maintained reader
journeys, then one declared complete `performance.cjs` matrix:36 Lighthouse trials,
72 short motion windows,24 flights,120 warm-cache retention cycles and300-second
soak. Keep LCP2500/TBT200/CLS0.1, secondary score90, mobileCPU×4 paint33ms,
zero Off/reduced work and all existing navigation/retention/soak rules.
No benchmark runs concurrently with scanners or other benchmarks. Artifact bytes
are verified before/after; all errors and failing samples remain visible.

Final outcomes and immutable raw receipt links are recorded in both linked scope
anchors after these exact source bytes are frozen, avoiding metadata changes to
the measured candidate. A failure stays open and requires an evidenced correction.
Do not infer a full PASS from the earlier diagnostic or prepared browser checks.
PR79 remains Draft and issue5 open with original whole AC08/AC11/AC12, editorial,
rights, device, export, independent-content-release and publication gates separate.
No merge, re-stage or production activation is part of this checkpoint.

Refs #5
