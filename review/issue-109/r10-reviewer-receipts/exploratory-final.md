# Exploratory / Interaction QA — first independent result

6 November 2026. Issue109 / Draft PR110; reviewer execution `/root/exploratory_qa`. **PASS for the bounded rendered reading/navigation and native-to-PDF journeys below; no blocking artifact finding.** This does not complete author, rehearsal, presenting-device, rights, event-selection or independent-reuse gates.

## Inputs and independence

Prepared working-tree candidate based on real Git HEAD `3ee7398c48bfedca4a004e50ef72d88df954c8b4`, not a clean candidate commit. Origin observed as `https://github.com/oborskyivitalii/oborskyivitalii.git`; working tree contained R10 and acceptance/catalog edits. Parent owns final live GitHub/ref/handoff reconciliation. Review source packet `/workspace/scratch/992b55cffd39/packet-final.json`, SHA256 `06f3fa575f5066e2ac454284a48f76f47b8aa39b4c493d17f129efb608487a1e`. All 24 referenced file hashes matched both at intake and after checks. No current peer receipts, parent scratch outputs or unrelated memory were opened. No delegation, accepted-source/test changes, or external writes performed.

Read common and role prompts, original owner109, root AGENTS/README, relevant CONTRIBUTING policy, R10 README/current ACs, edition-versioning and QA allocation policy. No applicable nested AGENTS was found in relevant inventory. The supplied common contract limits unrelated memory reading; no MEMORY contents were used. Requested/accepted isolation launch is the orchestrator's separate receipt; provider model/context internals are unknown to this execution. Tooling/shared filesystem is not an OS isolation guarantee.

SHA256 identities:

| Input | SHA256 |
| --- | --- |
| Common reviewer README | `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb` |
| Exploratory role | `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a` |
| AGENTS | `ad4f179ec04c7af12867229d70598a660c5ae41f3cb456cafd02aca3d12a9988` |
| CONTRIBUTING | `804fb3da9a0bc7369bbd902313224221becc6c6b775536ca943f8664bf741442` |
| Original owner109 | `c97fcc462683d3b4ef777632f0918a713f3a74dbebf86b97f1cb7d596e30571e` |
| Deck PPTX | `6574661343e6a74c222a60504b3b1b105a5dde44c7785dc28b262f59e2a28083` |
| Deck PDF | `266e98b1bb3b3282fad72a1250672dda316e6ef7ce37a40b0f89a747da418071` |
| Speech PDF | `841f142320760ee2b05972568d4a64571bbe1d4c9c6b9503a03cf351fb777261` |
| Speech MD | `4f60d228495d362839dd53c45475e2853c6b75a5d8f5294e8af56046792367b9` |

## Independent charter and executed surface

Charter derived from the original intent/current ACs: follow a reader from opening HOW/WHAT diagnosis through flow/ownership/evidence, six contextual hypotheses and the runtime-control pivot to the single closing; look for lost meaning, unreadable text, inconsistent numbers, missing caveats, navigation confusion, native/export drift and broken QR/link destinations. Bound: one complete 9-page deck pass, all 10 speech pages, targeted native/QR/source preservation checks and one controlled re-export, approximately six minutes. Expected: readable hierarchy and qualifiers, matching native/PDF/speech delivery order, preserved S06–S09, one correct homepage QR and usable source/reference paths.

Actual actions: independently rendered both PDFs with PyMuPDF, deck width 1400 px and speech width 1050 px; opened every output through `view_image`. Viewed files `exploratory-work/deck-01.png` through `deck-09.png` and `speech-01.png` through `speech-10.png`, individually emitted across seven viewing calls. Text extraction was supplemental, not a substitute for viewing. Linux environment; headless `soffice` available through runtime override. Performed own isolated-profile LibreOffice export into `exploratory-work`, without changing the accepted package.

| Case / AC | Expected and observed |
| --- | --- |
| Deck S01 / AC01,11 | Two-sided opening and diagnosis/personal synthesis readable; HOW/WHAT colored hierarchy, image pair, small-team/low-risk qualifications and footer present. No clipped title. |
| S02 / AC12 | Hypothetical/all-admitted model visible; 8→100 with downstream 8 gives +92 waiting/month. Admission, bounded WIP, demand/adoption and movable constraint distinguish the alternatives. Layout readable. |
| S03 / AC14 | Verification versus learning separates visibly; five ownership functions, two illustrative charts, experiment qualification and no measured lifecycle-value claim retained. Long title fits. Dense supporting lines remain legible at reviewed raster scale. |
| S04 / AC13 | Number panels readable; Chen–Stratton 655, +35.7%, +13.7% borderline, +56.1% elapsed-time qualification present. Agarwal 1,197, +34.85/+42.87 and +17.73/+19.00 with latter nonsignificant retained. Survey/proxy/noncausal/different-sample caveats visible; no on-screen METR. No common funnel implied by diagram geometry. |
| S05 / AC15 | Exactly six nonoverlapping cards in three tradeoff columns. Extensive/limited/no-AI choices, empowered owner, pilot and safe recovery drill visible. Narrative adds ordinary resources, safe environment, equivalent scenarios, scope limits and stop conditions. |
| S06 / AC16 | Clear ACT II pivot, explicit-rule/model-judgment formulas, requirement/bug/DoR/DoD rows and bounded/fallback distinctions. No obscured content. |
| S07 / AC18 | Observe/Decide/Intervene/Operate loop and return feedback intelligible; enforced limits, conditional human dependency, full cost and feasibility-before-commitment follow in reading order. |
| S08 / AC17 | Two separate illustrative 200-case samples explicitly labeled, 196/3/1 and safety veto clear; pre-release block, runtime fallback and four observation domains retained. |
| S09 / AC19,07 | One closing, both project identities, role actions, one high-contrast QR and readable homepage URL. Research identities have PDF hyperlink annotations; QR area links to homepage. |
| Speech pp1–9 / AC01,03,11–19 | Every slide has numbered slide heading, distinct nonspoken cues and spoken body; page numbers 1–9 and edition footer consistent. No overlap/truncation/orphan continuation. S05 densest body still stays above footer. |
| Speech p10 / AC02,03,13 | Nonspoken delivery/source reference page fully viewed; all source paragraphs and qualifications fit, including Agarwal and two separate samples. Ten active PDF reference links observed. Timing is explicitly estimated, not measured. |

## Native, preservation, export and QR execution

Own checker followed `ppt/presentation.xml` relationships rather than numeric XML filenames. Actual delivery order is slide1, slide2, slide4, slide3, slide5, slide6, slide8, slide7, slide9; this explains the source-file numbering swaps. Every native visible text run occurs in corresponding PDF text after whitespace normalization. Each of the nine exact normalized spoken bodies occurs in its delivery-order native note and in corresponding speech-PDF page; whitespace count independently gave 1,434 words. S06–S09 spoken bodies are byte-equal to sections from retained external R12 speech. S06–S09 PDF pixels equal retained external R12 at the tested rendering scale.

Executed own `soffice -env:UserInstallation=file:///workspace/scratch/992b55cffd39/exploratory-work/lo-profile --headless --convert-to pdf:impress_pdf_Export --outdir /workspace/scratch/992b55cffd39/exploratory-work <R10.pptx>`. Result: 9 pages, every page pixel equal to accepted PDF at default PyMuPDF raster scale; corresponding URI link lists equal on all nine pages. This independently supports native/export correspondence for the inspected renderer, not PowerPoint/Keynote behavior.

Decoded all native media with zxingcpp: exactly one QR-bearing asset `ppt/media/image2.png`, SHA256 `a41f34f3039f8b4673b0f62ecf08c315ebe0ad0f55bcec5b8b8b3544ead8c38e`, target `https://vitaliioborskyi.ai/`. Independently decoded the final S09 raster to exactly the same URL. Closing PDF annotations target homepage and the intended two canonical GitHub research repositories. Read-only web open of the decoded homepage returned the author page with Research, Writing and Contact destinations (tool source `turn1view0`); this is web retrieval, not a physical scan or interactive-browser/device observation.

Raw local evidence: `exploratory-work/hashes.json`, `check.py`, `check-results.txt`, `native-links-qr.json`, `native-notes.txt`, deck/speech text and the 19 viewed raster files. Initial scratch diagnostics failed because a naive numeric-filename check ignored deck relationship ordering and because raw fitz Rect values were not JSON serializable; a follow-up path resolution prepended `ppt/` to absolute package targets. Diagnosed these as checker defects, followed actual OOXML relationships, corrected only scratch checker and obtained the results above. No candidate defect or accepted-source change was concealed by those checker corrections.

## Findings, disposition and limits

No blocking readability, navigation, number-preservation, six-card, closing-link or native/export drift defect was reproduced. S03/S04 are dense and their smallest caveats need real projection assessment; that is an unobserved AC06 condition, not a measured failure here.

Retain this executed campaign as manual exploratory evidence through `guides/SITE-CHECK-PROFILES.md` QA allocation: AC01/03/07 and AC11–19 → rendered-page walk, notes/export/QR oracles → manual issue109 artifact/EXPLORATORY-QA/QR-REVIEW gates, no new Actions suite. Existing `tools/presentations/validate_edition.py` owns package counts/hashes, not visual judgment. No new automated regression is justified by a reproduced candidate defect. Future changed candidate must repeat affected page/notes/QR comparisons. Real projector/Presenter View, measured rehearsal and exact author acceptance remain deferred to the author under AC06/AUTHOR-ACCEPTANCE; full rights to SOURCE-RIGHTS-REVIEW; independent non-DevCon reuse to AC10/REUSE-PROOF. None was executed or marked N/A. Full primary-study correctness, complete native editability, publication and final GitHub/CI handoff are outside this bounded visual/interaction verdict.
