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

## Initial image-policy implementation and invariants

`tools/site/reader.cjs` owns the shared policy: keep the first rendered image and
declared cover eager, mark subsequent figures loading=lazy. State is scoped to one
reader rendition and independent of asset inventory order or publication IDs.
Declared dimensions, admitted image/original URLs, source AST, alternative text,
credits, source/semantic editions and print/platform producers are unchanged.
Current article/reference render fields are identical after stripping only the
new loading attributes. At that initial stage engine, scene, effect and publication sources were unchanged;
the superseding runtime correction below changes only the cache/lifecycle owners.
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

## Exact-source integration correction

First clean frozen candidate57d1cb22a2e01a9ae59d5d2337f3b92d94b97919
(tree f7729757534d26d6b670afeb3586c95356efced3) ran the complete owning policy:
6/12 checks passed. Evidence was source-valid and the checkout stayed clean.
The failed report is retained in full. No performance measurement had started.

Two distinct causes were resolved. The partial clone lacked the historical
catalog blob at e830752f58535c9e2226550a9661ee51c745bdb3 used by existing
fixtures with GIT_NO_LAZY_FETCH=1. Fetching its exact Git object restores the
fixture input without changing source or tests. RF02 Medium (AC11/CS04/CS07):
the build producer changed the engine identity while all five runtime bytes
stayed identical, so the existing explicit Color compatibility registry correctly
rejected the new identity. The correction adds one named reader-loading family
and exact plain/staging/production descriptors, preserving every previous entry,
validator and budget. The current-build regression now reproduces all three
editions and checks distinct fingerprints. Existing negative admission tests
also exercise the new family. The mandatory publication-rights discriminator
retains all three new identities, current fixtures/assertions follow the new
family, and historical retained receipts keep their original identity. A dedicated
regression rejects substituted identity or runtime bytes and requires
rights before file access for every edition. These descriptors establish compatibility of the
verified bytes; they do not supply deployment or production authorization.

The first new negative test correctly observed immutable-byte rejection but
expected the canonical-byte error wording; its assertion now distinguishes the
two existing errors. The initial29/30 log is retained.

Independent re-review of this integration correction is recorded below before
freezing its successor. Complete mapped checks then run on that clean successor;
only afterward does the single declared full performance matrix begin.

RF02 final receipt, verbatim from `/root/reader_loading_review`:

> RF02 closed after independent re-review at tree
> 027077f97a31488f1cc02e57473a6f510c37db10. Exact three-edition registry,
> mandatory rights checks, current fixtures and historical boundaries are correct.
> Independent targeted regression: 1/1 PASS. Original implementation/runtime
> bytes remain unchanged; no blocking findings. May freeze successor, run
> complete owning checks, then the single declared full performance matrix.
> No browser, benchmark or scanner run by this reviewer.

Reviewed SHA256: registry
f01f602968567deeba6742eedd2ad95bd620a249057942300174d4260ec4642a;
package aee873cbada59df7e9b5a1c372431ee3b580894c9d6a683aabe0157a45c2d9b7;
contract tests 7dcc4c002f72fd310e43a33d304e663e8b03bbf3a5bc89db3ab9f2191221d7ab.
The corrected contract/browser evidence suites pass30/30 with no skips.

The clean successor61f22900e5cd9502778d878b0326ca06ab5e7c16 passed
12/12 owning checks with23 automated-pass criteria, valid evidence and no errors.
Its subsequent full formatter found only the generated RI/CI map layout pending.
Canonical formatting preserves that map's exact parsed JSON meaning; its source
policy and failed format receipt remain retained. The metadata-only successor
is frozen before final checks and measurement; no performance trial was repeated.

Metadata review receipt, verbatim from `/root/reader_loading_review`:

> Q3 bounded metadata review PASS at staged tree
> 4f2e13d700918e89f2976f3e2f598eff36aa7bbd. The map parsed JSON exactly
> equals Q2; only its canonical formatting, factual7-line report addition and
> corresponding RI map/report digests changed. All other authored/generated/runtime
> bytes remain identical. Independently read Q2 receipt:12/12 checks,23 automated-pass,
> evidence/automationtrue, errors[], closurefalse. Corrected formatter receipt:
> PASS488files, changed[]. No blocking finding; may append this receipt/refresh RI
> and freeze Q3, then final exact-source checks. No browser, benchmark or scanner
> by reviewer.

## Superseding runtime correction after the measured failure

The first declared complete wrapper ran clean source1940cf4442a82a55c31a04d32d73c4e4c3faa596,
tree6ffc7865f7a38683e488b53d3b07badcc50e636f, Color/staging public
d0b19516ba44b9c0e3597ff1a979e0aaf1265f6ff37b2976ea70c7add1d6ce79.
Its outcome is FAIL and all original reports remain retained. Primary30 Lighthouse
trials/10 median groups passed. Primary motion stopped after7 complete profiles
at the unchanged2s Reduced Motion setup deadline; CPU×4 profiles,24 flights,
120 retention cycles and soak were not collected. Reader6 Lighthouse trials and
3 motion profiles completed: mobile LCP3389.2675/3376.625/3376.6775ms fails2500;
desktop median661.773ms and all reader motion observations pass. This is a real
failed candidate, not a complete matrix PASS or an unchanged-source retry.

RF03 High (AC08/AC11/AC12, CS01/CS07): initial route-cache extraction cloned a live
main into the active ownerDocument. The7 nominally lazy slides were requested by
navigation.js extract() while original img.complete stayed false. Thus the prior
cold decoded-image proof did not establish request suppression. The LHR retains
8 image requests and746104bytes. Nine cover-only controls rejected cover loading
or priority as sufficient: medians baseline3376.625, lazy-cover3226.596 and
low-priority eager-cover3151.938ms, all8 image requests in every trial.

A separate counterbalanced9-trial comparison held eager cover+7lazy unchanged:
baseline3377.345ms; moving loading before src2401.645ms; importing cache snapshots
into one inert HTMLDocument2401.136ms. Each correction requests only the cover.
Inert extraction also removes the detached SVG fallback request:227589 versus
746104bytes; attribute ordering alone gives245070bytes. Every trial retains the
same introductory paragraph LCP/bounds and CLS0. These are controlled diagnostics,
not acceptance of the final combined candidate; the~99ms margin needs its full run.

The source correction keeps both extraction and prepared clones in one inert
cache document until native mount adoption. Explicit sourceURL/getAttribute URL
rebasing stays authoritative. An initial new SPA request regression caught the
remaining active prepared clone; that dirty preflight failure remains retained.
After extending inert ownership through prepare, the prepared390px normal journey
passes: native entry, Back and SPA each observe8 images,6 conservatively distant
lazy images and only1 actual image request. Existing decode/viewer/history/print
checks remain complete. The new source family requires these raw request phases;
older runtime families preserve their existing observation contract. The6000px
margin scopes this functional far-image assertion; it changes no performance limit.
Repeated images already needed nearby remain legitimate requests.

RF04 High (AC08/AC11/AC12, CS07): one of5 fixed Writing390/CPU1 diagnostic samples
reproduced the original2s timeout. Captured and fresh media queries were true,
page visible/focused, control still Motion:on and Canvas active with61 further
paints. No media-query change event or page error occurred. The existing frame
loop trusted its stale enabled flag. A frame-before-layout guard now reconciles
the actual reduced preference through the existing preference handler. Conditional
scheduling retains the one static settlement on true→false, while a late duplicate
already-disabled event schedules no RAF. Saved On, ordinary native events,
Off/hidden/print behavior and camera clocks remain owned by the same lifecycle.
No timer, synthetic preference event or timeout extension was introduced.

The permanent delayed-event regression fails against exact Q3 space.js (phase880
versus80) and passes with the correction. Five fixed real-browser prepared samples
then pass the original2s setup and zero-work observations. Navigation unit coverage
asserts inert independent cache/prepared ownership and explicit URL authority;
existing immutable/subpath/embedded resource, history, eviction and camera cases
remain. New browser evidence negatives reject missing request phases and a detached
far-image request. Prepared focused suites66/66 and request evidence13/13 pass;
the earlier103-case prepared run had102 passes/one incomplete VM fixture after
moving the new document initializer, which is corrected and its failure retained.

The explicit new plain/staging/production family pins the new navigation/space
bytes, retains exact styles/theme/archive bytes and every historical descriptor,
and keeps mandatory publication rights. Failed motion samples now retain partial
measurements and query/control/scene/frame state before teardown; no failed sample
becomes a pass. Independent source re-review, final clean checks and one newly
declared complete matrix on the corrected candidate are required next. Results
and immutable raw links still belong to the two scope anchors, without changing
the candidate merely to append final receipts. No whole-feature, staging or
publication acceptance is inferred from this correction.

RF05 Medium (AC11/AC12, CS07), separate reviewer finding: the initial request
validator admitted an empty or incomplete image list and skipped the new family
when its optional engine argument was omitted. Each required native/Back/SPA
phase now matches the reader inventory URL multiset, preserving repeated URLs;
capability selection falls back to the recorded head engine. Negatives cover
empty phases, omitted repeated occurrences and omitted engine options. Short or
image-free documents need no artificial distant-image minimum. Historical
families retain their prior contract.

## Integration with the concurrent R19 head

A fresh native PR79 read found that the maintainer had advanced its source from
92b671f9 to7f64b948c1d60395d6e5a2356906485b1c437325 during this investigation.
The final candidate preserves all13 R19 changed paths, including manuscript,
blueprint, publication/profile, new edition record, article-media regression,
dated editorial review and historical draft marker. Its8 nonmetadata changed files
are byte-identical to that head; RI/catalog/MEMORY
are combined and regenerated. The final native commit has both Q3 and R19 as
parents; PR update will lease the observed R19 head and remain a fast-forward.

R19 intentionally selects Cover02 plus3 original slides instead of R18's7. That
is the pre-existing author decision, not an optimization or budget exception.
The acceptance matrix measures the final R19 input; earlier paired R18 causal
trials remain source-qualified, and cross-edition totals are not causal evidence.
The supplemental browser/print recipe derives all admitted images from the
current publication declaration, preserving the complete-inventory assertion
rather than retaining the stale R18 count8. Its native-print PDF is raw diagnostic
browser evidence, not a requested/editorially approved R19 export or replacement
for the historical R18 article PDF. No article/editorial gate is inferred.

The pre-freeze lint caught cognitive complexity27/25 in the expanded evidence
test and28/25 in its validator. Request-specific negatives and inventory admission
were moved into coherent helpers without
changing cases or thresholds; failed and corrected scanner outcomes are retained.

## Independent runtime and R19 integration receipt

Separate non-implementing reviewer `/root/reader_loading_review`, 21 October 2026,
reviewed the combined prepared result, source diff, issue/ACs and retained checks.
Its following receipt is copied verbatim; only deterministic RI and this receipt
are added afterward, as permitted by CONTRIBUTING's iteration protocol.

> R19 integration/refactor review PASS at staged treeaf05d941866dcbd4294a761dc032bbc2a949afba; all17 manifest rows match index and unstaged diff is empty. Independently verified all8 nonmetadata R19 files byte-identical to7f64b948…; existing RF03/RF04 runtime bytes and remaining reviewed owners are unchanged. requestEntryJourney, validateReaderRequests, failedArticleCheckpoint and test-helper extraction preserve all phases, RF05 multiset/engine-fallback requirements, failures and historical contracts. Retained evidence13/13 and lintPASS(allengines,warnings[]) support the refactor. R19 smoke/print recipes require all4 source-declared bodyimages (cover1280×398;03/09/12 each1921×1080), preserve5custom checks and distinguish diagnostic print from editorial export. Report/MEMORY correctly qualify R18 diagnostics versus finalR19 input and pending gates. No remaining blocking finding; may append receipt/refresh RI and freeze with stated parentsQ3+7f, then fresh owning/functions/full matrix. Reviewed article-browser SHAef4ecdfc89208d5d8f3fca7b22f54745870b480046b5ca01e07d417d1aa4d839; evidence-test18289884986736cb5ecec2121f67d7d144eaed92486fb1f26d9403549d6e64cf. No browser, benchmark, scanner or test run by reviewer for this integration.

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
