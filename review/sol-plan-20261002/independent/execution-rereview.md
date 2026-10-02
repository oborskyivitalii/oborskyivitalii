# Independent execution correction re-review

Reviewer: `/root/independent_execution_review` — 2026-10-02. I did not author or edit the plan or its corrections. This report supplements the unchanged original `execution-review.md`; it does not replace that report or retrospectively alter its Changes requested verdict.

**Verdict: Confirmed with bounded caveats for candidate-plan execution readiness.** E1, E2 and E3 are resolved in the corrected plan. I found no new execution-contract defect in the correction set. This confirms that the plan now specifies the necessary work and acceptance evidence; it does not claim that the future implementation, tests, browser review, merge or release are complete.

## Exact target and verification

Original reviewed PR #10 head: `0c329dc1da5b8d89ce918383a4a6c5299526ab31`.

Correction inventory: `review/sol-plan-20261002/independent/CORRECTION-MANIFEST.json`.

**Verified manifest SHA-256: `e5aa11ad5c36abe7997b12edc3e2afd8b968baffba69de0d51f1b367a48bb475`.** Every one of its 11 file byte counts and SHA-256 values matches the local corrected file. The target is this exact correction inventory, not a subsequently generated summary or a future remote commit.

I compared the 29 preserved baseline files with the corrected checkout. Ten existing files changed; the new collection manifest accounts for the eleventh corrected file. The other 19 baseline files remain byte-identical, including the scene JSON, three SVGs, qualitative query CSV, input provenance, raw provider/autocomplete replies and source records. All ten nonbinary public source entries, including all five HTML pages, the CSS and three JavaScript files, still match the SHA-256 values in the previously reviewed `review/site-v1-review.json`. Binary/existing generated-output placeholders were excluded from artifact acceptance as in the original review.

## Finding disposition

| Original finding | Status | Corrected locations |
| --- | --- | --- |
| E1 — hidden topic destinations and incomplete URL restoration contract | Resolved in plan | `SOL-HANDOFF.md:151–167`; `review/sol-plan-20261002/VISUAL-SPEC.md:64–66` |
| E2 — archive counting/preservation unit and self-referential identity checks | Resolved in plan | `SOL-HANDOFF.md:31–37,60,98–104`; `CONTENT-AND-CONVERSION-BRIEF.md:115,190`; `SEO-BUYER-INTENT.md:80,228`; current amendments in `SITE-OPERATIONS.md` and `SITE-SEO.md` |
| E3 — obsolete pointer-motion explanation on Credits | Resolved in plan | `SOL-HANDOFF.md:133–135,168–170,186–192`; `CONTENT-AND-CONVERSION-BRIEF.md:195`; `VISUAL-SPEC.md:115` |

### E1

The correction identifies the actual problem: `#topic-delivery`, `#topic-systems`, `#topic-leadership` and `#topic-strategy` currently live on the links that would be hidden. It requires visible semantic destinations or an equivalent accessible resolver before duplicate navigation is hidden, with useful native destinations in the full no-JS catalog.

The contract now resolves the material state ambiguity: apply valid query filters, then let a recognized topic/year fragment override its own dimension; keep the remaining dimensions. An empty intersection retains a visible topic/year heading and an explanatory empty state. Initial load, `hashchange` and `popstate` synchronize form, results, URL and scene focus. Filter changes and Reset clear or reconcile conflicting fragments. The acceptance examples include Research's existing `writing.html#topic-leadership` link, every topic, year destinations, conflicts, filtered destinations and history with JS, plus native no-JS behavior. Tests must establish a usable visible destination, not merely ID existence. This resolves the finding without requiring duplicate navigation or a new routing system.

### E2

S0 now captures an expected inventory before edits and keeps it independent of the edited HTML/schema. S1 compares all 27 primary title/URL/date/date-kind/language identities with it, preserves the edited-date distinction, and separately asserts the Thinking Systems LinkedIn URL and 2026-08-27 date. The Generative AI primary date remains 2026-08-30.

The plan consistently distinguishes 27 primary records (20 EN/7 UA), a primary ItemList of 27, and 28 linked renditions (21 EN/7 UA) after including the secondary LinkedIn link. Optional secondary placement on Home no longer makes retention in Writing optional. The five featured English identities remain separately asserted. Public count labels are explicitly in scope for reconciliation. These are sufficient instructions to implement a meaningful preservation fixture; no fixture or changed tests are claimed to exist in this planning correction.

### E3

Credits is now an explicit S3 source file and its Display preferences paragraph is an explicit task. The plan requires accurate native-scroll/topic triggers, Off/reduced behavior and static fallback, while retaining portrait/derivative attribution. S4 checks this prose alongside new preview/bundle instructions. The current website still contains its old behavior/copy, as expected for a plan-only change; the future acceptance contract now covers both.

## Regression and completeness assessment

The correction preserves S0–S4 ordering, five selected English works, eight bounded discussion entries, the seven-section Home, normal contact navigation and the supplied-photo authorization. It introduces no additional service, framework, launch page, approval gate or upstream-research prerequisite. The separate merge/release and #9→#10 dependency sequence remains intact; #7/#8 own the existing release decisions and #11 guides remain later work after launch and the PMDay overlap check.

The motion contract remains coherent with the new archive rules: topic changes may change focus, year/language changes do not create a flight, native scroll interrupts transitions, reduced/Off freezes pose, and theme changes only recolor. A fragment-resolved topic is the effective topic state rather than an independent camera animation. Static fallback, print restoration and idle cancellation remain required.

The bounded geometry caution is now explicit at `VISUAL-SPEC.md:100`: planarize or triangulate the noncoplanar decorative faces if the renderer relies on plane assumptions. Scene geometry and art inputs themselves are unchanged, so the original visual/conceptual assessment and mobile calibration limits still apply. The correction does not turn the planning art into browser acceptance.

S4 explicitly includes the separate `review/site-v1-review.json`, both export generators and their manifests, query/fragment link rewriting, preserved v3 history and a new named edition. This incorporates the original export cautions without expanding scope. The SEO annotation changes distinguish future guide owners from existing launch routes and label the retained data populations; they do not create an execution dependency on collecting more data. The separate evidence lane owns full numerical/source accuracy confirmation.

The earlier `FINAL-REVIEW.md` is now clearly labeled a historical author/planning assessment. I also read the coordinator's draft `INDEPENDENT-REVIEW.md`, which correctly marked the correction verdict pending at inspection time and accurately summarized this lane's original scope and limits. That summary is outside the correction manifest and should record the actual lane verdicts when finalized; it is not evidence for this verdict.

## Re-review coverage and limits

I read the corrected full `SOL-HANDOFF.md` and `VISUAL-SPEC.md`, the text corrections in `SITE-OPERATIONS.md`, `SITE-SEO.md`, `CONTENT-AND-CONVERSION-BRIEF.md`, `FINAL-REVIEW.md`, `SEO-BUYER-INTENT.md` and `SEO-EVIDENCE.md`; inspected the complete new `COLLECTION-MANIFEST.json`; and compared the normalized evidence/metrics JSON changes structurally for scope or execution regressions. I checked the preserved baseline, all 11 manifest entries, the unchanged public-source hashes, the original execution report and the draft independent summary. Full original-material coverage, rendering observations, geometry calculations, live GitHub checks and baseline test results remain in the original report.

No website/source/test implementation was made in this re-review. I did not rerun unchanged runtime tests or claim new browser/asset/export acceptance. The original timezone-child-process test limitation remains environmental (`spawnSync` restriction), not an unresolved plan defect. Actual fixture assertions, visible anchors/history behavior, Credits copy, calibrated scene, exported candidate, CI and browser acceptance must be demonstrated during S0–S4. Rights/editorial acceptance, permanent URL, authorized integration and deployment remain the plan's existing release work. There is no additional review blocker from this execution lane.
