# Issue 5 — 2026-10-12 independent implementation review

Owning issues: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5)
and the distinct PMDay publication owner [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2).
Owning execution: [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Reviewer: separate AI agent, substantive read-only implementation review. I did
not implement these components or read earlier implementation-review findings.
The live issue contains the accepted architecture and its design history; those
requirements were read as intent, not used as implementation evidence.

Inspected source: `work/issue-5-publisher-pmday-20261012`, HEAD
`7c6ca6456ae57ba712feb063b5613d84fe57026a`, **dirty prepared work**, with publisher,
reader and integration changes arriving during this review. Earlier reproduced
failures and later fixes are distinguished below. No clean-head, hosted admission,
release, rights or human editorial acceptance is supplied by this review.
Implementation files were read only. The only repository file written by this
reviewer is this report; diagnostics and isolated fixtures live under `/tmp`.

## Intent and acceptance

The original five criteria of #5 require a migration inventory, a real HTML/PDF
article with provenance, draft isolation and explicit supported features,
bounded dependencies and upgrades, and the cross-repository ownership direction.
The accepted 12 October combined route adds the stable #5:AC01–AC12 conditions
and uses a useful PMDay article as the real integration case. The original
#2:AC01–AC06 retain their editorial, metric/source, actual slide/PDF, publication
and upstream-disposition requirements. Its recording increment does not replace
those gates.

Read owners: root AGENTS, README, CONTRIBUTING, MEMORY as a dated handoff,
CODE-STYLE, ACCEPTANCE, site source contract, repository ownership, editorial,
source-audit and SEO guides, ARTICLE-WORKFLOW and the live issue bodies. Source
inspection covered publisher schema, AST, provenance, events/history, adaptations,
toolchain, platform kit and PDF resource/transaction owners; reader selection,
catalog, build, snapshots, edition derivation, retention/export and navigation.

## Findings

All findings were sent promptly to the execution owner. The original reproductions
used current code at the time, rather than repeating earlier review notes.

| ID / severity | Evidence and implication                                                                                                                                                                                                                                                                                                                                                                          | AC               | Disposition                                                                                                                                                                                                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 / P2      | AST headings `Same`, `Same`, `Same-2` initially produced `same`, `same-2`, `same-2`. Native anchors and TOC targets were ambiguous. `ast.mjs::prepare` now allocates from a global used-ID set; the same adverse case produces `same`, `same-2`, `same-2-2`.                                                                                                                                      | AC03, AC08, AC09 | Fixed and independently retested, including the later F08 target collisions.                                                                                                                                                                                                                                                                                              |
| F02 / P2      | The initial Markdown serializer changed escaped literal emphasis into emphasis and broke inline code containing a backtick. Reparsing the emitted Markdown changed the HTML. The serializer now uses remark-stringify and preserves both adverse cases.                                                                                                                                           | AC03, AC09       | Fixed and independently retested.                                                                                                                                                                                                                                                                                                                                         |
| F03 / P2      | `printArticle` initially accepted `state: committed` with invented commit/blob pins in a non-Git directory and recorded them as committed provenance. The narrow print API needs its own exact source verification before its producer, including standalone CLI use.                                                                                                                             | AC02, AC07       | Fixed. The invented pins now reject before the producer; explicit repository root, Git tree/blob/bytes and matching state are verified.                                                                                                                                                                                                                                   |
| F04 / P2      | The initial print resource owner read complete files without byte/count/aggregate limits; a 2,000,001-byte CSS resource was accepted. This defeated the promised bound before browser rendering.                                                                                                                                                                                                  | AC03, AC04, AC11 | Fixed. The same CSS rejects at the 1 MB bound; finite count/aggregate, output and streaming executable/archive hashing reviewed and print negatives pass.                                                                                                                                                                                                                 |
| F05 / P2      | Site events initially bound a production-served inspection to publisher kit `article.html`, which is print/review HTML. The real reader alias was 75,644 bytes, SHA `d8f692349acc0d351bdb9c1143bfdecf13301f426f83025e57b67cf0daf175fa`; kit HTML was 14,106 bytes, SHA `0eb8774697ffde4c3bed9ed88922cb58d8de03509016833bc631cfe726298f2e`. A truthful served native reader digest could not pass. | AC07, AC10       | Fixed in inspected source/tests: coherent production site artifact, exact committed source/tree, source ancestry, semantic identity, served reader hash and policy-origin/alias binding. Actual public observation remains a human/live gate.                                                                                                                             |
| F06 / P2      | Existing `build_site_previews.cjs::rewriteLinks` rejected a normal accepted local article link with `Unexpected local link: articles/accepted-profile.html`. Default PMDay draft isolation masked this reusable accepted-article failure.                                                                                                                                                         | AC08             | Fixed and independently checked: ordinary exports exclude article bodies and describe unavailable editions honestly; explicit selection embeds one article plus the existing five rooms. Accepted-article tests and real PMDay file-URL navigation/image/no-JS observations pass.                                                                                         |
| F07 / P2      | The initial schema/kit had no declared packaging profile, ignored the authored launch post, and emitted no launch/SEO/cover/hero files. Two articles through one fixed adapter did not prove the original two-profile/furniture criterion.                                                                                                                                                        | AC04, AC09       | Fixed and reviewed on two configured profiles and real kit `18319eeb…`: exact authored launch, SEO, cover/hero choices, format selections, limits and explicit omissions.                                                                                                                                                                                                 |
| F08 / P2      | After the first heading fix, `## Figure example` and declared asset `example` still emitted two `id="figure-example"` nodes. Source headings can also collide with the reader's `main` and `article-sources-heading`. Reserve figure/shell IDs or introduce a deliberate source-heading namespace.                                                                                                | AC03, AC08, AC09 | Fixed and adverse cases retested: `figure-example-2`, `main-2`, `article-sources-heading-2`; figure and shell targets retain their distinct IDs.                                                                                                                                                                                                                          |
| F09 / P2      | An emphasized title source link (`# *[Test](https://example.com/source)*`) vanished from body/site/PDF/platform HTML after title extraction. The title fallback selected only direct link children. A table-header-only source URL also disappeared from TXT.                                                                                                                                     | AC03, AC09       | Fixed and both concrete cases retested: recursive title fallback and TXT header URL preservation.                                                                                                                                                                                                                                                                         |
| F10 / P2      | A valid header-only GFM table became empty platform HTML, empty Markdown and newline-only TXT. Explicit supported transforms cannot silently erase source content. Preserve the header or reject with an actionable diagnostic.                                                                                                                                                                   | AC03, AC09       | Fixed: the same input rejects explicitly as unsupported header-only GFM table.                                                                                                                                                                                                                                                                                            |
| F11 / P2      | At a 390px viewport, the PMDay figure is 318px wide and its 17–24-unit labels in 1280-wide source artwork are roughly 4–6 CSS pixels. The current page had no explicit full-size link. The caption/prose is readable, but the control diagram's details are not readable at ordinary mobile size.                                                                                                 | AC02, AC08       | Fixed with a native full-size diagram link. Fresh 390px browser test opens the declared 1920×1200 image and returns to the reader with one Canvas and no page errors. Print suppresses the utility link; PDF figure remains readable.                                                                                                                                     |
| F12 / P2      | A manuscript containing invalid UTF-8 byte `0xff`, with matching source and semantic byte pins, was accepted and silently emitted `A � B`. Profile decoding is strict, while manuscript/adaptation/JSON decoding used lossy `Buffer.toString('utf8')`. Reject malformed source bytes with context.                                                                                                | AC03, AC07, AC09 | Fixed with contextual fatal UTF-8 decoding. Concrete invalid-byte rejection and maintained loadArticle negative verified.                                                                                                                                                                                                                                                 |
| F13 / P2      | The public kit verifier accepted an actual copied kit whose `article.txt` had an external hardlink (`nlink=2`); its walk used unbounded reads and ignored resource aliases. CLI verification and an existing-artifact fast path did not use the installation safety inventory.                                                                                                                    | AC03, AC04, AC07 | Fixed and independently retested: hardlinks reject, manifest/resources use bounded source reads, and entry/aggregate limits cover verification.                                                                                                                                                                                                                           |
| F14 / P2      | Catalog alternates remained LinkedIn-only with the historical same-topic relationship, so new local articles could not record Medium or declared adaptation/equivalent/translation relationships. Preserve historical external records and add a bounded local relationship schema with edition/artifact evidence.                                                                                | AC07             | Fixed and independently reviewed/tested: local equivalent-rendition, authored-adaptation and genuine translation use explicit pinned source/edition and observed-event evidence; native equivalence requires inspection evidence. Legacy external records keep their existing relationship contract.                                                                      |
| F15 / P1      | With two real PMDay-derived articles, changing only A left B's version/snapshot URL identical while B's snapshot bytes changed (`7e5a6b70…` → `03ac2af4…`). B's head embedded A's changed snapshot without hashing that dependency; publishing could overwrite an immutable path and retention could collide.                                                                                     | AC08, AC10       | Fixed and independently reproduced with two articles plus explicit retention: final B version/path change, new digest changes, and the complete old B snapshot bytes remain preserved. Content versions feed one finite registry digest before final version allocation, without circular snapshot hashes.                                                                |
| F16 / P2      | A real committed, accepted fixture declared `Other Author` in publication metadata while its Writing catalog claimed Vitalii Oborskyi; the build initially accepted both conflicting bylines.                                                                                                                                                                                                     | AC07, AC08       | Fixed. The original actual-Git counterexample now rejects with `Local catalog authors differ from their declared edition source`. Full ordered author names/URLs are compared for each local primary/alternate; genuine multi-author Writing JSON-LD remains intact.                                                                                                      |
| F17 / P2      | Explicit standalone export accepted its own manuscript as `outputFile`, overwrote that source with HTML and returned an export manifest. New output paths had escaped the existing source/output guards.                                                                                                                                                                                          | AC03, AC08, AC10 | Fixed and the original alias retested with unchanged manuscript bytes. Both document and manifest reject source roots, all declared/tracked/public inputs, symlink parents and hardlinks before writing and again before install. The two-file transaction has meaningful installation/rollback failure tests.                                                            |
| F18 / P2      | A real candidate artifact with `components.preview: true` and candidate article descriptors skipped cold-source reconstruction when `articleCandidates` was missing, empty or falsy; the checker returned success.                                                                                                                                                                                | AC11, AC12       | Fixed. Missing/empty candidate declarations and null/string/false/zero malformed declarations reject. Maintained real PMDay cold-source tests independently pass for base and composed Color/staging artifacts, changed source and corrupted served output.                                                                                                               |
| F19 / P2      | The local catalog required an authored adaptation's `edition.name` to equal the full manuscript title even when the declared adaptation had its own first H1, which the kit already rendered correctly.                                                                                                                                                                                           | AC07, AC09       | Fixed and concrete distinct-title fixture independently accepted. The adaptation uses its selected `titleText` or declared full-title fallback; equivalent/translation editions keep their own full-title comparison. Maintained wrong-title and stale pinned adaptation-title negatives pass.                                                                            |
| F20 / P2      | The execution owner later reproduced publicDirectory supplied through a symbolic-link alias, followed by outputFile naming the physical public writing.html. The lexical protected-path guard missed the real input root and could overwrite the reader.                                                                                                                                          | AC03, AC08, AC10 | Independently inspected and retested after the narrow fix: root/ancestor input aliases reject before reading; protected paths retain lexical and canonical owners. The original isolated overwrite case now rejects with exact reader bytes intact and no manifest created; canonical guards also reject both document and manifest targets under an aliased public root. |

The possible same-edition title/caption/figure semantic drift was inspected as a
separate risk. A semantic digest was added during review before the adverse
accepted-edition fixture completed. A later independently built committed,
accepted fixture verified that changing its claim-bearing figure caption rejects
with `Content edition semantic identity drifted; freeze a new edition` while the
original frozen source/edition remains intact.

## Decisions

The user-authorized execution proceeds in this one Draft route. These findings
request bounded corrections within the accepted contracts, not a new task,
publication approval, source-governance change or rights decision. Whole criteria
must remain open while their current-source checks or human/live gates are missing.

## Sol tasks

| Task | Owner and expected behavior                                                                                                      | Finding / AC             | Check                                                                                                         | Status                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| T01  | Publisher AST/source owners preserve unique targets, source links, table text and strict UTF-8.                                  | F01–F02, F08–F10, F12    | Concrete adverse compiler/load cases plus enduring behavior tests                                             | Complete within implementation review                                    |
| T02  | Print owner verifies committed provenance and bounds every resource before rendering.                                            | F03–F04                  | Forged committed pins, oversized CSS/count/aggregate cases and print transaction suite                        | Complete within implementation review                                    |
| T03  | Publication history binds site events to coherent exact production reader bytes/source/origin; semantic metadata stays frozen.   | F05 / AC07, AC10         | Real site-versus-kit distinction and wrong-source/origin/corruption negatives                                 | Complete within implementation review; actual served observation pending |
| T04  | Reader/export owner supports accepted article links offline and exposes readable figure detail.                                  | F06, F11, F17 / AC08     | Accepted article export, file URL, source-alias/rollback and 390px browser cases                              | Complete within implementation review                                    |
| T05  | Profile/kit owner emits declared platform formats, launch, SEO and cover/hero choices with honest omissions.                     | F07 / AC04, AC09         | Two distinct configured profiles and real PMDay kit                                                           | Complete within implementation review                                    |
| T07  | Catalog and reader owners preserve frozen identity, bylines, explicit relationships and immutable registry dependencies.         | F14–F16, F19 / AC07–AC10 | Real Git author mismatch, semantic drift, two-article edit/delete/retention, adaptation/translation negatives | Complete within implementation review                                    |
| T08  | Quality owner requires candidate reconstruction and conditional article browser observations without broadening the room matrix. | F18 / AC11–AC12          | Real base/Color/staging reconstruction and malformed, omitted, wrong-source browser evidence                  | Complete within helper/source review; hosted execution pending           |
| T06  | Root binds final tests/review and mapped evidence to the committed source.                                                       | AC11–AC12                | Clean source, RI/CI, required hosted admission and unresolved-gate record                                     | Pending                                                                  |

## Acceptance evidence

The first concurrent-source suite invocation passed 48 cases and failed eight
only because `article.cjs` required a not-yet-present `history.cjs`. A later
invocation encountered the newly required profile contract before fixture updates
landed. These transient runs are not reported as final passing evidence.

The later independent 13-module run passed **135/135**, with zero failed,
skipped, cancelled or todo cases: publisher, history, profile, safety, print,
site articles/transactions, offline, local catalog, delivery/budgets, browser
evidence and candidate-source tests. A separate latest-navigation run passed
**18/18**, including root/nested resource rebasing, fragments, external URLs and
preserved offline query navigation. The new cold-source/browser helper run
passed **5/5** against real PMDay base and composed Color/staging artifacts.
The original output-alias failure and Other Author accepted-source mismatch were
also independently rerun against isolated real Git fixtures and reject before
source mutation or incorrect catalog publication.

These are successful dirty-source checks, not a frozen exact-commit result.
During the 135-case run, the observed publisher/reader/catalog owners stayed
unchanged, while policy/RI/output-lock/deck-review controls and
`tools/quality/artifact.cjs` / `tests/article-budgets.test.cjs` changed. The root
will bind final committed source, current helper checks and regenerated artifacts
after its explicit freeze; this review does not relabel the concurrent run.

### CI and registration boundary

The added browser validator requires the exact five bounded cases, their
positive checks, selected key/language/version, runtime and host base. Normal
reading entries/departures and their active-block bounds must be actual positive
observations. Fallback cases retain and compare the complete observed native
head. Missing, duplicate, failed and wrong-source rows reject. Local ready-preview
and existing Chromium staging execution call this owner conditionally when the
manifest contains articles; the ordinary room counts, engines and budgets stay
unchanged. This code/helper validation does not supply hosted execution evidence.

`test_issue5_acceptance.py` executes maintained behavior modules, checks their
real pass/fail/skipped/cancelled/todo counts and includes the offline, catalog,
browser and candidate-source contracts. The new tests have permanent targeted,
staging and production source profiles, and their owner inputs are registered.
The inspected repository-path/RI/CI layers include publication controls, source
reviews, profiles/adapters, offline/catalog and conditional browser/candidate
owners. Final generated repository intelligence and whole-policy verification
remain the root's exact-source integration responsibility.

### Source fingerprints

At `2026-10-12T13:51:10Z`, HEAD was still
`7c6ca6456ae57ba712feb063b5613d84fe57026a`; `git diff HEAD --shortstat` reported
147 changed files, 21,698 insertions and 12,825 deletions, including generated
renditions. The following exact owner-byte SHA256s qualify the dispositions;
they do not claim these bytes were already committed. The still-changing quality
helpers need the root's final binding.

| Owner                                | SHA256                                                             |
| ------------------------------------ | ------------------------------------------------------------------ |
| `tools/publishing/article.cjs`       | `b5455fecf2c660dd420f03b29ec1e0e9eef9fc496a06f73b3c808c45c690a9da` |
| `tools/publishing/ast.mjs`           | `2da9e764891e582bcbd25a583553a6e1b311f2bf1fb0ab305dfb009a8f5ab8d0` |
| `tools/publishing/safety.cjs`        | `b2946d6fa8b1b8e2aca4105a6929788c5479c5dbb78d0e49f8efd139051de4cb` |
| `tools/publishing/site-event.cjs`    | `da9981654fe438be47f1ca2bd29cd911bdb0e68d9a8da4161ce94ee2ae9bc2ff` |
| `tools/publishing/print.mjs`         | `d027e724d1d944fb643e5bf64e106cc673f63972f87059afa30fbdafd9d2fddc` |
| `tools/site/articles.cjs`            | `92ae11c81dddeafe0b3d654c6db48887f9fd9122b1c931c23b4ee609fc90ac8e` |
| `tools/site/offline.cjs`             | `1f79c5b37b0324d624c0f07a2c1e96b3997e17e71f0d9ef38183c24eaac5ec2b` |
| `tools/site/validate-catalog.cjs`    | `b98c2943ebfe740f5b6bfc6eaefbecb7d965626cf546b332ff846d145a7d02c8` |
| `site/engine/navigation.js`          | `0b845e193552edc936a8273b567a84d64e6c6691ace7efe702eaef1ed1695161` |
| `tools/quality/candidate-source.cjs` | `69cadb66ae8af94e2c843550045af2c20f9db461e696e8759f9c854d297c6c51` |
| `tools/quality/article-browser.cjs`  | `c8271c7da140eca57ff9a48c32eb94eb612421fb5bd95fae8162c0bb6422f2f8` |

### Real PMDay source and editorial comparison

The complete blueprint, 1,463-word manuscript and 600-word LinkedIn adaptation
were read. The manuscript preserves both changes in the talk and keeps the flow
argument conditional. It explicitly distinguishes the comprehension hypothesis,
curated scenario coverage versus rate estimation, fallible semantic evaluation
versus permissions, and readiness/completion versus authorized release. The
access-recovery example and diagram are labeled illustrative. It states that
no empirical numbers are reproduced, retains the Ukrainian recording label,
and names the v35 deck as a review candidate. The LinkedIn text is explicitly an
authored abridgment, not equivalent full text. No material claim/deck mismatch
was identified in this bounded review.

All eleven SHA-bearing PMDay/UA references in `publication.json` matched the
available original input files. The UA checkout is
`345c8f50745e5fde1303d0d7952634f7899220c9`; the selected PPTX SHA is
`d40acf0d3e716eb1324acb3ff1b21a6b43d0225687b84984a818a9518f098ecc`.
Independent XML extraction verified slide order 1–15 and all 15 note bodies
against the active `pptx-slide` notes plus appended declared source URLs, after
whitespace normalization. The complete deck overview and detailed slides 4/12
were inspected. The eleven input checksum matches and deck comparison do not
re-audit every original empirical study or grant reuse/presenting-device approval.

The two extracted UA helper originals match the declared origin byte lengths
and SHA256s; the local complete Apache-2.0 license copy matches the pinned
upstream license text. This establishes transfer provenance, not a site-wide
license or feature parity with Quartz.

### Real article PDF

Inspected the supplied real kit
`dist/publications/pmday-two-shifts/1944794c9907483595acc043637e02e28ab0794c562ae7cd75889b8eb0378dbf/`.
The article PDF is five pages, 251,596 bytes, SHA256
`ced58a8363e1646e3baf758e8a36c117b4da43020fa329d3ef31caba99e3b4ab`.
All five pages were rasterized and visually inspected, with page 4 separately
inspected at full size. Text, section breaks, margins, page numbers, links and
the figure/caption are readable; no clipping or overlap was observed. This is
distinct from the 15-slide deck PDF. Its manifest honestly records
`working-tree-review`, Chromium `153.0.8010.0`, `reviewOnly: true`, unmanaged
browser and exact fallback executable/package/archive digests. It is not a
locked managed-browser acceptance result or final revised-source artifact.

The revised 27-output kit `18319eeb…` was verified and its complete five-page
PDF visually inspected again. The latest supplied kit is
`438f74bfa25b4521786f982e549eb50e8ceb611e02f137eda12337d58ea0bb57`;
its 27 outputs independently verify, and its article PDF is five pages,
253,706 bytes, SHA256
`e589221f8946ef72a147ac25d04c867d73d2e02e76512490ccd3fab2bd908956`.
All five independently rasterized pages are pixel-identical to the visually
inspected revised PDF. The latest kit source records working-tree-review,
null commit/blob pins and SHA256
`ddbf94e087037feda8996f03b5564eaa7cedd897bdffb03ad54298b799cbae7a`.
It continues to be an explicitly unmanaged Chromium 153 review artifact.

Article, LinkedIn, Medium and both copy-ready HTML documents each have one H1.
The authored LinkedIn adaptation has no inferred article figure; the Medium
full rendition retains its one declared figure, including matching embedded PNG
bytes in copy-ready HTML. Cover/hero PNGs match the authored selected control
figure; launch Markdown matches its source, SEO/furniture are declared and
canonical publication remains explicitly pending. These are packaging evidence,
not platform posts or rights approval.

### Real reader browser

Built a fresh isolated candidate from the then-current dirty source into
`/tmp/issue5-independent-reader`: five main routes, one PMDay article and 43
public files. Chromium 153 with explicit fallback executable tested the nested
article through a `/staging/` project base at 1200×850 and 390×844. Direct load,
Writing→article→Writing, TOC anchor/back, article history Back/Forward and image
decode passed with one document load, persistent header/Canvas identity, one
Canvas, no page errors and no off-base requests. Mobile width equals scroll
width (390px); the image displays at 318px. Motion was reduced for these bounded
navigation/identity observations, so this is not full motion, physical-device,
Safari, hosted or performance admission. F11 records the separate figure-detail
readability failure and its later independently checked native-image-link fix.

The explicit real PMDay standalone export was opened at a file URL at 390px,
with JavaScript enabled and disabled. Its selected article, decoded
1920×1200 image and complete no-JS leadership section are readable. Writing and
the selected article navigate within one loaded document with persistent
header/Canvas identity and one Canvas; no HTTP requests or page errors were
observed. The generated file is 494,730 gzip bytes and embeds one article image.
Ordinary five-room exports do not silently embed accepted article bodies or
unselected draft assets. Unembedded unobserved editions are described as hosted
editions; only actually observed canonicals become external edition links.

## Issue synopsis

**Ready for the owner's source freeze and exact-commit recheck.** All 20 findings
have bounded implemented corrections and no remaining P1/P2 blocker was found
within this substantive review scope. The P1 immutable-registry fix and the
offline, catalog, byline, output-safety and candidate-proof corrections have
independent adverse-case evidence; the complete publisher/reader/CI contract run
passed 135/135 with the concurrent-source qualification above.

Deviations still matter: the kit/browser evidence uses explicitly review-only
Chromium 153, the source is dirty and changing, and no final exact-head binding
or required hosted/managed-browser admission is supplied. Original #2 editorial,
metric/source, actual slide/device, rights, actual publication and upstream
disposition gates remain distinct and pending, as do human approval, merge and
production release. The 15-slide deck and five-page article are separate
artifacts. Whole #5/#2 acceptance criteria remain open wherever those decisions
or final source-bound checks are required.

## Late control and export supplement

The late boundary review independently ran candidate-source, article browser
evidence, quality-sources, executive/SEO, analytics and Color contracts:
**61/61 passed**, with no failures, skips, cancellations or todos. All 13 captured
owner/test/CSS byte fingerprints stayed unchanged between
`2026-10-12T14:19:29Z` and `14:21:15Z`. This run precedes F20 and the resulting
producer/Color refresh; the narrow F20 counterexample was separately retested
after the export guard changed, and the updated offline suite passed **13/13**
with unchanged owner/test bytes. Earlier 135/135 and 18/18 results remain evidence
of their stated source phases, not a relabeled final-source run.

F18's late strengthening verifies the actual public directory first, derives
candidacy from its verified `site-revision.json`, and requires exact matching
record components before considering the declaration. Erasing or falsifying the
record's components cannot disguise an actual candidate as ordinary output.
The maintained real-artifact negatives and positive base/Color/staging cold
reconstructions passed. The browser validator's fallback head comparisons and
runtime/base binding were inspected again; no synthetic helper row is claimed
as hosted browser evidence.

The new Base64 admission is restricted to
`tools/publishing/toolchain/licenses.json` in the existing closed publication
ledger. It requires both the exact path/type/SHA1 disposition and a fresh proof
of the complete inventory against the exact lock bytes, package locations,
versions and canonical 64-byte SHA512 encodings. All **71/71** actual package
integrities independently prove; a ledger alone rejects. Wrong paths/ledgers,
changed lock/version/location/integrity and duplicate package records reject in
maintained tests. The earlier ledgers retain their complete original data:
4,957 baseline, 4,367 reviewed, 614 checksum and the publication ledger's first
50 findings. The initial 356-entry append (285 Hex and 71 Base64) is explicitly
a historical generated-output phase. Its named operator proof was read; all
22 UA migration pins independently match Git commit/blob/length/bytes, current
generation proof verifies 36 paths, and retained original snapshot/runtime and
failed-artifact bytes were verified. Historical regenerated paths and hashes
are not misrepresented as current source. The operator helper does not become
CI admission authority; the root's final corrected-output append/proof and
exact-source scanner run remain part of final integration.

The SEO reconciliation parses only immutable baseline and SHA-verified approved
amendment JSON-LD, then admits exact original/compact byte encodings. Unknown
current JSON is preserved for the outer frozen comparison. Tests reject changed
values/language/schema, duplicate keys, reordering, malformed bytes, missing,
duplicate or relocated owners, undeclared article metadata/indexes and extra
unrelated metadata. This is a bounded serialization correction. The analytics
fixture copies only the standard-library artifact/budget closure and proves the
publisher/toolchain is absent and every ordinary offline payload still has
exactly five rooms, no articles and no article assets. The competing article-pre
radius line was removed; the shared paint guard remains authoritative.

The separately collected Color report was inspected against its retained exact
artifact and revalidated through the current selector/flight checker: 1440px
has 36 actual samples and 390px has 38. The six historical Color tuples remain
unchanged; only the distinct issue5 family was added/refreshed. The reviewed
`322d959…` / `9f1a1d…` / `715a84…` phase honestly records dirty source, local
loopback, fallback Chromium 153, `reviewOnly: true`, unmanaged browser,
`fullGate: false` and `productionEligible: false`. F20 changes the producer
identity, so this proof is historical until its corresponding refreshed runtime
is separately checked. No hosted, device or release gate follows from it.

The further supplied kit
`572ca4abc9e609f4819797407e3e47569c9b2048aa2d6fb888b003eb91ad0ba6`
independently verifies all 27 outputs. Its five-page article PDF is 253,706 bytes,
SHA256 `483affa0bf9d347b6effc0f04bb76b1f3cffa55d08302f8b0ffbdf04cb4d3feb`;
all five rasterized pages are pixel-identical to the previously visually reviewed
438f kit. Its manuscript source remains the same exact SHA256 and intentionally
has null commit/blob pins with `working-tree-review`; editorial/rights state is
not promoted by generation.

The late owner-byte fingerprints below supersede the earlier corresponding
entries for their stated phase. The offline entry is the separately checked F20
fix; Color's further producer refresh must be bound by the final source review.

| Owner                                | SHA256                                                             |
| ------------------------------------ | ------------------------------------------------------------------ |
| `tools/quality/candidate-source.cjs` | `c51a7f6c0fe04a08adc6d3937104e63265e0bb3213630e9ac5891c2554d1820a` |
| `tools/quality/article-browser.cjs`  | `3a9a479fa193203fa1e0aac8858d44161cf2c0c382853e612a60851acb14360a` |
| `tools/quality/scanners.cjs`         | `94c6d6234d209189eaa31d2e61b284b1285852e99dd39006fc5c3103e209011a` |
| `tools/check_site_seo.cjs`           | `ae30076a7ce08022975d3a76f8eb95c4cf2cc3adcac6efce213e30ffe588d3ce` |
| `tools/quality/artifact.cjs`         | `ac950e1a15cb148edd45fe132483f369b29df1d18e93efcb88f8e50d4ca6cf3e` |
| `site/engine/styles.css`             | `2ccd3d14ab7efcd183e938167fdd61654cf9b8680e841f1f877896e2139b3a2b` |
| `tools/site/offline.cjs`             | `e908b640e30d4191bc2f60e4ad678817db3b67e1fc9f158ed717443f1dad152b` |
| `tests/article-offline.test.cjs`     | `c68f183bbaa8e8466c6c7a1af612203f913f2144411ffd34bad1c386b5b41799` |

No new unresolved P1/P2 blocker was found in these changed controls. Source
freeze, exact-commit/artifact binding and the already named human/live gates
remain separate from this bounded implementation review.

### Final F20 refresh checks

The separately refreshed [F20 Color raw observations](2026-10-12-color-runtime-f20-browser.json.gz)
were independently compared with the complete retained artifact, selected by the
current exact tuple guard and passed through the actual flight validator. Both
widths pass: 1440px has 33 samples and 390px has 36. Producer `d8efadd5…`, base
engine `2a34c341…`, plain Color `f25b16d9…` and staging Color `fff8aed9…` identify
this phase. All five runtime file records are byte-identical to the preceding
reviewed phase; all six historical tuples/families were independently compared
with the Git baseline and remain exactly unchanged. The raw record preserves
the same explicit dirty-source, local fallback, review-only and non-production
boundaries. This supplies the F20 producer-refresh observation without relabeling
the earlier reports.

The retained candidate ZIP contains exactly 28 unique safe paths; its manifest
and all 27 outputs match the verified 572c kit byte-for-byte, and the retained
article PDF matches that kit exactly. Its current standalone selects the final
`2a34c341…` engine and the PMDay English key, matches its manifest SHA, and is
1,118,006 bytes / 494,844 gzip bytes within the original budget. The earlier
file-URL observations remain qualified by their earlier source; final source
binding and human/live gates remain pending as already stated.

## Continuation review from PR head 5a84ef6

Independent publisher review (`publisher_review` agent) reproduced two further
P2 gaps in the current implementation, then implemented and verified narrow fixes:

| ID | Finding and concrete check | AC | Disposition |
| --- | --- | --- | --- |
| F21 | A real committed accepted Ukrainian edition could retarget or remove its valid translation source while keeping the frozen semantic digest. | AC07, AC10 | Declared translation lineage now contributes to semantic identity; real Git frozen retarget/removal rejects. Undeclared ordinary article digests retain compatibility. |
| F22 | A supported TXT-only committed distribution kit could render successfully but no publication event could bind its selected output. | AC07, AC09, AC10 | Events accept only declared HTML/MD/TXT/copy-ready outputs of the matching platform and verify exact bytes. Missing, unrelated, cross-platform and corrupt outputs reject; existing kit bounds remain. |

Both focused maintained regressions passed; whole-source CI is separate.
The prior speculative source-attribution concern was inspected as a declared
observed-artifact trust boundary, without a demonstrated new contract failure.
No additional print/history blocker was found in this bounded review.

Independent CI/checksum review (`ci_review` agent) proved all150 new scanner
findings as exact generated public checksums, with39 unique values and no
exceptions. Every64hex value was recovered from the current indicated line by
its hashed-secret SHA1, then independently rederived as runtime/route/content/
producer identity or actual document/payload/output SHA256. All40 public files,
29 preview input/output identities and five inert payload copies were verified.
Only these150 exact path/rule/hashed-value entries were appended; prior records,
scanner rules and current-lock requirements were preserved.

The continuation Color family admits two new exact producer identities. Its
five actual plain/staged runtime files match the earlier issue5 family
byte-for-byte. All four historical families/eight tuples and selector/flight/
resource guards remain unchanged. Independent comparison also rederived the
base runtime identity from current producer fingerprints. Actual browser,
current CI, native device and release decisions remain separate observations.

### F23 — native departure focus

Independent `history_focus` agent reproduced an in-content article link losing
its focus when flight sets inert before the later history save. The new real
function harness fails the old source with null focus rather than the archive
link. The narrow source fix saves before departure/inert, suppresses inert
writes, preserves interrupted matching-entry focus as fallback and gives actual
new control focus priority. Its23 navigation cases pass, including Back/Forward,
initial, delayed saves and rapid retargeting. This addresses AC08/AC11; physical
Safari/iPad, managed hosted admission and release decisions remain separate.

Independent `ci_review` compared the final helper expressions and call order
against the reviewed inline fix: no behavioral change or new mutable state.
`departureFocus` captures before interruption; `saveDeparture` retains initial,
pop and same-address exclusions after the fresh read/serial gate. Pinned lint
has zero new warnings; actual navigation/fixture and article cases pass42/42
and11/11. The final prepared browser observations bind the updated source and
new Color tuple, retaining every prior family/tuple and strict budgets.

Final frozen-source checksum review independently proved156 exact scanner
findings (43 unique public values, no credentials/exceptions). Each indicated
line recovered one64hex value matching its scanner SHA1; runtime/route/content,
producer, actual documents/payloads and previews were rederived. All40 public
files,29 preview fields and five inert payload copies were checked. The new
Color navigation/fingerprints match actual bytes; prior five families/ten tuples
remain identical. Only the final156 exact entries were appended; intermediate
proof did not authorize ledger additions. Findings SHA256:
`0277f3cd0f7863597ef5dae5d3c4047f50b0ae3fde3afdbfc5f938850bcfc777`.
