# Independent Exploratory / Interaction QA — issue169 / PR170

Status: completed first independent review of packet v6 / tree `5b4c1bdd150602b55c6436895b1dc981ae4d8821`. Desktop native article/PDF/content journeys pass within the bounded charter, with one low-severity external-return usability finding. Mobile/no-JS, current hosted acceptance and release readiness remain unobserved by this reviewer; this is not full production approval.

## Execution and source

Role: distinct nonauthor Exploratory / Interaction QA, task `/root/native_exploratory_final`. Parent supplied explicit none-fork execution; provider context/model internals are unknown. No peer verdicts, parent notes or private history consulted. MEMORY content was intentionally not read under the common review boundary. Applicable AGENTS/CONTRIBUTING and repository/native reader/material/tag owners were consulted. No implementation, test authorship, deployment, external posting or delegation.

Inspected clean local HEAD `2d51128e6879be9170962a5d9c04b532f1f45d2a`, tree `5b4c1bdd150602b55c6436895b1dc981ae4d8821`; remote candidate supplied as `bd70996a386665e14f87440653e3a107fed15e43`, same tree. Base `8ed52aa1fe39be8483a2b5b4079df4142fbc5b5d`. Local Git status was clean. Packet `native-packet-v6.json` declares 80 path entries and packet identity `258d6d8444aed19341966e17b7651711b922f87e0deac5a9d1a167b0b1135ce6`; inspected present entries matched SHA256, excluding intentionally unread MEMORY. Packet digest is the supplied packet identity, not claimed to be a self-hash of its final JSON including that field.

Common prompt SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role prompt `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`; both computed from actual native files. Primary `issue169.json` SHA256 `1c4323f4b3b3f90a3fb9a63a47d2dd568a6d671b405b7f554233357c8488a479`; `author-scope.md` SHA256 `11f8a52f865d2feb06a7081fc0f8490dae9a58a0a41cde595f2d0f6decf0f104`, independently read.

Accepted source: `review/issue-169/r3/manuscript.en.md`, SHA256 `ec4c21d3864c9e3890fa0cacb7fea9dcadae42828a554f977b7eafcb7ab95baa`. Native source SHA256 `db47dcbed76c5052355d24cd78e3d9ea2a9727c23be030796463f975e0b8667b`. Actual diff consists of subtitle emphasis, captions moved to declared media metadata, and author-review footer normalized to R3 edition. Native publication/profile/provenance/materials, current generated article/index, shared tag assignment and contracts read. Candidate assertions were treated as subjects for inspection.

## Independently chosen charter and oracles

Before reconciliation: bounded reading/wayfinding charter, initially 15 minutes including preview wait. Parent extended to 15 minutes after an exact preview URL, total cap 30 minutes from launch because the build remained in progress. Exercise entry, six images and captions, Contents chapter selection and close, reference apparatus, sole PDF download, related reading and Back recovery. Look for clipping, unreadable figures, lost location, blocked controls or broken destinations. Mobile/no-JS and physical device claims require actual observations; no surrogate is invented.

Oracles: author accepted R3 six visuals, unchanged five-page PDF and central thesis; `site/README.md` shared reader/Contents/dialog/no-JS contract; `guides/ARTICLE-MATERIALS.md` one public reviewed native PDF material with no automatic loading; `guides/ARTICLE-WORKFLOW.md` tags; `guides/SITE-CHECK-PROFILES.md` current source-bound browser/check allocation. Independent Jaccard ranking from the current index predicts publication-01 and publication-03 at .75, then publication-02 at .4, excluding self publication-30. Exact visual judgement is bounded to rendered captures, not physical-device usability.

## Executed preparation

| Case | Expected | Actual observation | Result/evidence |
| --- | --- | --- | --- |
| P1 accepted/native assets | Retain accepted original hero and five diagrams | Direct byte SHA256 comparison against `/workspace/scratch/dbe331636386/r3/images` matched all six PNGs | Pass; read-only hash comparison |
| P2 web hero | Compression preserves composition/readability; truthful derivative notice | Viewed original `hero.png` and actual `hero-web.jpg` side by side through view_image. Stage labels, tilt, people and layout preserved; JPEG softness is visible at full size but labels remain legible. Provenance explicitly calls it lossy relative to original | Pass within visual scope; native image files |
| P3 PDF identity | Original unchanged | Native asset and generated immutable PDF are each 1,981,992 bytes and SHA256 `70052f9b0129c9e7bd3e70720a540869795d09eacf1ca780c55df64f4576b49c` | Pass; actual bytes |
| P4 PDF pages | Five readable pages, no clipping; all six visuals/captions, source limits and author present | Viewed all five accepted rendered page PNGs individually. Page1 title/thesis/hero/asymmetry; page2 workstream/system; page3 review/ownership; page4 overload/rebalancing; page5 systemic loop/references/evidence note/author. All content visible, no overlap/clipping found. Historical author-review footer retained in unchanged accepted PDF | Pass for visual inspection; `/workspace/scratch/dbe331636386/r3/review/page-1.png` through `page-5.png` |
| P5 native links/metadata | Single declared PDF and tag owner | Materials has one public reviewed PDF. Article tags use current vocabulary under local article id and no competing catalog assignment. Generated index contains publication-30 and reader mapping | Pass for source structure only; actual interaction still required |

No source/PDF defect found in these bounded observations. Figure1 expressly disclaims measured values, figure4 is conditional, and evidence note preserves synthesis limits. PDF link annotation activation was not executed by merely viewing page PNGs.

## Browser observations — executed on exact preview

Parent supplied current preview binding after successful run41239759741 and owner comment6542838653, raw source `bd70996a386665e14f87440653e3a107fed15e43`. Independent cloud Chrome Tab8 (never parent Tab7), 1363×936 viewport. Opened `https://34fa8cfa.oborskyi-author-ci-staging.pages.dev/writing.html`, host canonicalized to `/writing`. Actual badge `STAGING · bd70996a`. Native catalog/document navigation also produced the corresponding `.html` SPA addresses; full native fetch canonicalized article URL to `https://34fa8cfa.oborskyi-author-ci-staging.pages.dev/articles/the-sdlc-is-out-of-balance`.

Actual served rights disclosure confirmed content edition `sdlc-out-of-balance-en-r3-20261031`, source SHA256 `db47dcbed76c5052355d24cd78e3d9ea2a9727c23be030796463f975e0b8667b`, semantic SHA256 `642e5cdcdf5a8d06b513e35f5816c22302117702318c15ff5fcdb12e8ea2b31b`. Served hero JPEG and five WebP paths/hashes match current native metadata. This is independent page observation supplementing the parent's host/run binding, not a claim that a staging badge alone proves all bytes.

| Case | Expected | Observed | Disposition |
| --- | --- | --- | --- |
| U1 native entry/recovery | Writing lists the article; native article/More Writing paths work | Writing shows30articles, native article in undated group. Actual catalog→article and article→Writing complete. Initial offscreen AX/semantic actions and 3s selector deadlines preceded settled transition; later native link activation and settled state showed correct destinations | Pass functional destination; exact transition timing not measured, tool deadlines retained as limits |
| U2 ordinary reading | Core R3 readable with six images and captions | Hero and all five diagrams/captions present. Normal desktop reading surface has no horizontal overflow. Read actual images in native viewers; text/labels/relationships legible, no clipping found. Figure1 explicitly illustrative; Figure4 conditional. DOM read after visiting deferred images shows6/6 complete with expected natural dimensions (hero1672×545, diagrams2160×630/900/882/1007/594) | Pass bounded visual/media journey |
| U3 Contents | Open chapter list, select chapter, close without obscuring destination | Six named chapters shown. Selecting first updates fragment to `#the-problem-is-imbalance-not-a-queue`, collapses Contents, settles with heading readable below persistent controls. Current-topic label follows reading | Pass |
| U4 image dialog recovery | Read enlarged diagram, Escape restores location/focus | Opened all five explanatory diagram viewers; each has caption, alt-derived image description, Close, Actual size, original link. Escape closes and focus returns to activating image link. After return to the document, deferred diagrams decode when visited | Pass; actual-size toggle and backdrop dismissal not executed |
| U5 apparatus | Full reference boundaries and author available | Expanded References; six numbered source/related-work entries and evidence note visible. Expanded About the author; biography, website, LinkedIn and normalized R3 rights footer present. Opened Edition rights/resources and read exact source/semantic/compression notice. Source uses ordinary inline named external links rather than numeric `[n]` citation triggers, so a citation-preview dialog is not instantiated by this source | Pass apparatus; no claim of scientific re-verification or every external reference destination |
| U6 related reading | Expected nonself ranked works with valid destinations | Exactly predicted publication01/03/02 titles/languages/URLs. Activated first DOU destination60177, matching actual H1, and second DOU57846 in the bounded history diagnostic, matching page title. No self recommendation | Pass ranking and two actual destinations; third Medium URL inspected but not activated |
| U7 PDF material | Exactly one ordinary PDF anchor, no embedded/automatic reader | DOM contains exactly one `Download the illustrated PDF` anchor to immutable SHA70052f…/reading.pdf and zero iframe/embed/object. Clicking opens actual native PDF viewer with R3 title and page1/5, matching accepted page1. Back restores lower Materials position (`scrollY8603`) and expanded References | Pass activation/five-page viewer; complete served PDF-byte HTTP hashing remains release gate |
| U8 external return | Preserve useful reading location when returning from related reading | First DOU Back returned article with References open but `scrollY0`. To distinguish transient paint from stable history behavior, one bounded diagnostic left a settled lower position (`scrollY8035`) via visible second DOU link; Back canonicalized article to extensionless path and later remained `readyState=complete`, `scrollY0`, readable article top | Executed low usability failure; F1 below |

No old PR alias used. Parent's blocked local Chromium launch was not repeated or bypassed. No physical device, mobile viewport or JavaScript-disabled browser was available through this actual tab; those are not observed, not N/A.

### F1 — low severity: external related-reading Back loses lower reading location

Location/evidence: actual desktop Tab8 lower Related reading→DOU60177→Back and independent bounded second case DOU57846→Back. Second case starts at `scrollY8035`, returns ready/complete to `scrollY0`; capture `exploratory-external-back-top.jpg`. Reader remains usable and references/disclosures can be reopened; no content loss or broken destination.

Mechanism assessment: `site/engine/navigation.js` is unchanged versus base. Its finite router promises/tests cover native scene/article history; external links leave by normal document navigation. It sets history scroll restoration to manual (line1200), saves on pagehide (line1275), and initial boot calls `save()` rather than visibly restoring prior full-document location (end of file). This supports a shared full-document-history limitation; it does not establish a content-specific regression or prove the exact browser/BFCache cause. The PDF Back case separately passed, so it must not be generalized as all Back failing.

AC impact/treatment: AC10 valid nonself related destinations passed in observed desktop scope. Existing maintained `article-browser.cjs` history assertions inspected are finite Writing/article/native-entry cases, not a specified external-return guarantee. Retain F1 with the existing navigation owner as a low usability follow-up; seek the owner's disposition if broad external history restoration is part of acceptance. Do not change the article or invent a new blocker silently. A useful proposed regression is ordinary external related link→browser Back from a stable lower article position, checking document source, disclosure and scroll after complete load. It is proposed, not executed in CI and not authored here.

### Raw captures and tool limits

Captures saved beside this report:

- `exploratory-native-entry.jpg`: completed native catalog/article entry, visible hero/title/caption and source badge.
- `exploratory-references.jpg`: readable references, related works/languages and source limits.
- `exploratory-pdf-viewer.jpg`: actual served native PDF viewer page1/5.
- `exploratory-back-location.jpg`: successful PDF Back to lower Materials location.
- `exploratory-external-back-top.jpg`: settled external Back at article top.
- `exploratory-article-full.jpg`: retained full-page diagnostic captures only. Full-page capture includes offscreen lazy/scroll-entry/composited regions that can appear blank; these are not proof of broken visible reading or a substitute for the executed viewport/viewer observations. All six images decoded after actual visitation, independently checked in DOM.

Original viewport/image/dialog/Contents captures and AX outcomes are also retained in this execution's browser tool trace. Some browser selector/evaluate calls hit short provider deadlines or restricted read-only globals; those are not counted as product failures. Browser error log sampled extension metadata errors, not a demonstrated article exception. This reviewer did not infer a platform performance pass from eventual functional arrival.

## Remaining gates and regression disposition

Desktop reading/Contents/images/references/PDF/related-reading/navigation observations are complete above. Mobile and no-JS are not observed here, not N/A. Reuse maintained `tools/quality/article-browser.cjs` and `article-tags-browser.cjs` through current hosted affected-reader jobs for two-width normal/Off/no-Canvas/no-JS cases; source negative/evidence routes already live under `tests/article-browser-evidence.test.cjs`, `tests/article-tags.test.cjs`, `tests/article-delivery.test.cjs` in `pr-targeted`, `staging`, `production` profiles. No duplicate suite or authored test is proposed absent a reproduced defect. Source/PDF visual evidence is manual reviewer evidence mapped to AC07/08/09; actual related/navigation observations map to AC10 and shared reader contract. Owner staging, full mapped checks, identical-tree merge, production rights/archive and served article/PDF verification remain separate orchestrator/release gates. Author handles later LinkedIn/Medium editor checks and posting; not performed or required as a precondition for website release under current authorization.

## First-result verdict and next gates

The inspected desktop native article, six visuals/captions, Contents, reference/author apparatus, actual PDF material and two related destinations work. F1 is retained as a low existing/shared external-return usability issue with bounded mechanism evidence and explicit owner disposition needed if external return is an acceptance promise. This role supplies completed bounded interaction review, not mobile/no-JS or production acceptance. Existing hosted two-width normal/no-JS observations and current-source checks still need actual successful results.

After the initial UI observations, the parent supplied a neutral new fact: production Writing HTML is293bytes above its unchanged100k cap and a possible immutable Writing fallback externalization is pending. This reviewer did not run or independently verify that campaign and does not accept the proposed correction. Preserve this first-source review; any changed native Writing/source/asset integration needs affected source-bound recheck under a delta packet. No readiness claim is made for the current candidate.

End-of-review source recheck: Git HEAD/tree remain the v6 identities above, but the shared working tree now contains the orchestrator's pending correction edits, including generated documents and build/fallback owners. Initial source and actual immutable preview observations remain v6; no result here accepts those uncommitted changes. This reviewer wrote only this assigned report and its own neutral browser capture files outside the repository.

The second full-page hydrated capture was emitted in the browser trace, but its shared-file synchronization was not observed; it is not linked as an available local artifact.
