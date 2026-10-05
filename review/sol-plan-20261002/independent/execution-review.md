# Independent execution and visual-contract review

Reviewer: `/root/independent_execution_review` — 2026-10-02. I did not author the plan. Reviewed target: `oborskyivitalii/oborskyivitalii` Draft PR #10, head `0c329dc1da5b8d89ce918383a4a6c5299526ab31`, tree `e7f60827544b6e97bf61a86b43757821ee306d4e`, based on `work/issue-backlog-20261001` at `0adc52500f6986a145f1873aaefb80d563da8e7e`. Live PR metadata agrees with those refs; both #9 and #10 remain open Drafts. No website, plan or GitHub content was changed in this review.

**Verdict: Changes requested.** The sequence is feasible and substantially complete. Three narrow corrections should be made before treating the handoff as independently confirmed: preserve fragment destinations when simplifying archive navigation; accurately freeze and test the archive's primary and secondary edition identities; and reconcile the public Credits explanation with the new motion behavior. These corrections require neither a new architecture nor new permission gates.

## Findings requiring correction

### E1 — P2: hiding duplicate archive navigation can hide the existing fragment destinations

**Locations:** `review/sol-plan-20261002/VISUAL-SPEC.md:64, 111`; `SOL-HANDOFF.md:139–144`; `docs/writing.html:449`; `docs/research.html:59`; `tests/content.test.cjs:47–49, 87–106`.

The visual specification permits hiding the topic/year link navigation after the filter form initializes, while also requiring the existing `#topic-*` fragments to retain their behavior. In the actual baseline, `#topic-delivery`, `#topic-systems`, `#topic-leadership` and `#topic-strategy` are IDs on the topic navigation links themselves. They are not IDs on visible article groups. Research already links to `writing.html#topic-leadership`; the source/SEO records and potentially shared links use the other stable fragments. Hiding that navigation makes those targets non-rendered. The current test only verifies ID existence, so it would pass even when an incoming fragment cannot land at visible content. Query filters can also hide a destination that an incoming fragment names.

**Consequence:** a prescribed simplification can break an explicitly preserved navigation contract, despite green structural tests.

**Minimal correction:** add an explicit S3 task to retain the stable IDs on visible destinations or provide an equivalent accessible fragment-resolution mechanism before hiding the duplicate navigation. Define useful handling when a named topic/year destination is excluded by current filters, including initial load and browser history/hash restoration. Preserve no-JS anchors; do not restore duplicate navigation merely to retain IDs. Check an incoming `writing.html#topic-leadership` from Research and the four stable topic fragments with JavaScript enabled and disabled, plus a filtered destination. Assert visibility/usable destination, not only ID existence.

### E2 — P2: the archive invariant conflates primary rows with all platform renditions, and current tests do not freeze source identities

**Locations:** `SOL-HANDOFF.md:29–30, 52–53, 91–93`; `review/sol-plan-20261002/CONTENT-AND-CONVERSION-BRIEF.md:109, 115, 190`; `docs/writing.html:449, 452`; `SITE-SOURCE-AUDIT.md:7, 19–20, 77–78`; `tests/content.test.cjs:42–69`; `tests/preview.test.cjs:26–40`.

The actual archive has **27 primary publication rows/URLs: 20 EN and 7 UA**, plus the separately dated Thinking Systems LinkedIn rendition nested inside the Generative AI row. There are therefore 28 linked platform rendition URLs in that inventory, while the `ItemList` intentionally has 27 primary entries. “All 27 platform editions” is not the complete preservation unit. The plan mentions the separate dates but does not distinguish the counting units consistently.

The existing tests compare each primary row with schema generated from the same changed HTML and check counts. They do not compare the archive with an immutable expected baseline. An erroneous edit to both HTML and schema can pass. The secondary Thinking Systems URL/date is outside that comparison. I removed the secondary-link paragraph in memory and confirmed that the current primary identity projection was unchanged; source-to-export parity would also accept an export from that damaged source.

**Consequence:** the planned “preserve the full archive invariant” is less specific than the data requires, and a non-primary edition can be lost without the current preservation checks detecting it. Tests described as identity checks currently establish internal agreement, not historical preservation.

**Minimal correction:** state “27 primary archive entries (20 EN/7 UA), plus the separate Thinking Systems LinkedIn rendition” wherever the launch preservation invariant is defined. During S0 capture a fixed baseline of the 27 primary title/URL/date/date-kind/language identities and the secondary LinkedIn URL/date. During S1 assert the implementation against that baseline, retaining the edited-date distinction. Keep the five featured work identity assertions separate. Do not add a 28th featured slot or require a 28th top-level schema item merely to repair the wording; existing visible row structure may remain. If schema intentionally continues to describe the primary list, say so.

### E3 — P2: the plan misses the public Credits copy that describes pointer motion

**Locations:** `docs/credits.html:45–46`; `SOL-HANDOFF.md:79–80, 125–144, 159–165`.

Credits currently tells visitors that the background responds to “scrolling and pointer movement.” S1 names only shared header/footer work on the other pages, S3 names the renderer/archive files, and S4 specifically calls out removing the bundle's old mouse instruction. The Credits explanation is not listed. Its derivative credit must remain, but its interaction description must change with the renderer.

**Consequence:** the new code can meet the no-pointer requirement while the public instructions still promise the discarded behavior. The current tests do not check that explanation.

**Minimal correction:** explicitly include the Credits display-preferences paragraph in S3/S4 reconciliation. Describe native scroll and meaningful topic changes, Off/reduced behavior, and the static fallback accurately. Include it in the final obsolete-pointer-text review alongside bundle/preview instructions. No new behavior or content section is required.

## Feasibility, geometry and conceptual assessment

The proposed Canvas 2D renderer is a reasonable fit: eleven named nodes, ten directed edges, three decorative faces and a small finite set of camera paths do not justify a new rendering engine. The handoff explicitly acknowledges that `verification` and `controller` are node names without ready-made focus paths, and that the verification throat is still to be authored. Those are honest implementation tasks, not falsely completed deliverables.

I rendered `art-direction.svg` and both facet SVGs with Inkscape and visually inspected the art board. The portrait backdrops have six irregular, offset facets and the requested cyan/amber Day/Night relationship; they do not recreate the old ellipse. The art board omits the portrait and correctly labels itself as a planning drawing. It cannot prove that the eventual face/hair stay clear, that the bust reaches the baseline, or that the real hero works on mobile; S2/S4 correctly retain those checks.

The scene studies show a recognizable same-world loop and a separate four-node delivery path. The return edge is visually distinct. This supports the author's two directions as a decorative cue; it is not sufficient to teach the research to an unaided reader, and the plan appropriately keeps the explanation in ordinary HTML. The chart does not depict people mentioned in public discussion as controller components and introduces no causal edge between UA and Subprime. A throat located at verification must continue to mean an illustrative possible constraint, not a diagnosis of every buyer; the content/SEO briefs explicitly require investigation of alternatives.

I compared the graph with the complete supplied control-theory article, including its actuator/sensor/reference/controller discussion and operating-model section. The loop preserves the useful distinction among actuation, model-mediated output, evaluation, a reference input and corrective feedback. The historical article contains stronger universal claims and numbers that are not needed to implement this decoration. The handoff explicitly prohibits importing them or treating a closed loop as a stability guarantee. Its warning against equating one decorative controller node with the entire canonical operating model is appropriate. No upstream conceptual change is needed for this candidate.

Projection checks used the blueprint's 45-degree vertical field of view and a conventional fixed-world-up look-at basis. All named camera poses have finite, non-degenerate bases; node depths stay well beyond the 0.5 near plane. The control/context/closing poses crop some nodes at 390×844, and the feedback pose crops the delivery path at 1440×900. This confirms the stated need for a separately calibrated mobile path and deliberate cropping; it is not evidence of an accepted actual-page composition.

A bounded geometry caution for implementation: the four vertices called `control-plane` and `delivery-plane` are not exactly coplanar. Their fourth-vertex distances from the plane through the first three are approximately 1.543 and 0.168 world units respectively; `near-facet` is coplanar. Projecting an explicitly decorative polygon is possible, but any face-plane clipping/culling implementation should planarize or triangulate these inputs rather than silently assume perfect planar quads. The plan already permits calibrated replacement geometry and conservative geometry that avoids near-plane crossing. This is an implementation note, not a new readiness gate.

## Interaction, acceptance and export assessment

The motion contract is unusually useful: pointer/hover influence is prohibited; scroll stays native; camera position and target interpolate with fixed world-up; Off/reduced freezes the current pose; reduced motion overrides saved On; initial disabled load uses overview; theme changes only recolor; hidden/print cancel pending frames; settling is bounded; idle has no RAF loop. Topic changes have a named event and allowlist, year/language do not create a new topic flight, scroll interrupts a transition, and no timer pulls the view away while reading. Those requirements target actual regressions in the current source.

S2/S4 correctly separate mathematical/source checks, real browser rendering, interaction observations and release acceptance. The required desktop/mobile Day/Night, 360px and 200% zoom coverage is relevant to the proposed header and long publication titles. A recording is useful when supported; the allowed observed interaction log is a reasonable alternative. There is no need to introduce a new browser-test framework or demand a fabricated FPS claim.

Both current export producers are version-hardcoded, and the plan explicitly requires a new named edition, both producer updates, manifest/test/link reconciliation and preservation of v3 history. This is the correct direction. Implementation must preserve self-contained resource handling if facets/scene data become separate resources, adjust the exact public-resource allowlist if that is necessary, and test any new query-containing local links through the rewriter. The present rewriter splits only on `#`, so a new `writing.html?topic=systems` source link would need coherent parser/test support. These follow directly from S4's existing coherent-export requirement; they do not require a new service.

The source manifest `review/site-v1-review.json` is separate from the two generated export manifests. Include it in the already-required manifest reconciliation rather than treating successful generator runs as an update of every review record. Keep review-only noindex transformations isolated from production `docs/`.

## Authorization, dependencies and document precedence

Live #1 records the seven-section Home, five specified English featured works, eight bounded public-discussion entries, offer/contact intent and scroll/topic-only visual direction. Live #7 owns candidate rights/license acceptance; #8 owns final URL and release indexing; #2 remains the next publication; #11 owns later guides and measurement. No guide, scheduler integration, paid research tool, general publishing adapter or sibling-repository change is necessary for this candidate.

The root handoff correctly distinguishes the next implementation instruction from merge/publication authorization. It requires completing reversible S0–S4 work before presenting the concrete release decision, preserves the existing supplied-photo authorization, and does not repeat settled English/selection/design questions. It preserves Draft status and non-closing references, requires issue and PR outcome records, and explicitly sequences #9 before #10 retargeting/rechecking. No extra permission gate is warranted by this review.

Older no-volume statements, four-featured/seven-discussion descriptions and earlier browser-block records are explicitly dated/superseded by the root handoff and amendments. I did not treat these historical paragraphs as active contradictory acceptance. Similarly, `REPOSITORIES.md`'s older PMDay publisher route must be read with the current explicit statement that publisher #5 is not a prerequisite. README and review navigation should be reconciled with the actual new edition during S4; no stale preview is acceptance evidence.

The existing `FINAL-REVIEW.md` is a planning-session review, not independent proof. Live #10 currently has no submitted GitHub reviews; its current planning workflow run `37009545898` reports success. These facts do not confirm future implementation or browser output.

## Checks and limits

- Primary source/plan JSON parsed; the copied CSV, scene JSON and all three SVG SHA-256 values match their records in `INPUT-PROVENANCE.json`.
- Direct baseline execution: archive tests 3/3, space tests 4/4, Python tests 18/18; RI verification reports fresh.
- Theme tests: five pass; the child-process timezone case is blocked by this runtime's `spawnSync` restriction. A minimal child process returns `EPERM`, empty stdout and status 0; direct `TZ=America/New_York` Node execution produces hour 14 for the test instant. This is an environmental execution limitation, not a demonstrated theme defect or a plan finding.
- No full asset/export freshness verdict is claimed from the local snapshot. Historical generated HTML/ZIP and binary paths intentionally contain existence-only placeholders. They were not treated as broken repository assets. Current source/planning inputs are real bytes, and the parent independently verified non-placeholder remote identities.
- No actual-site browser QA, publication-source re-audit, legal clearance, implementation confirmation or release was performed. I visually inspected rendered planning SVGs, not the actual candidate with the future design.

## Reviewed materials

Read in full or inspected directly for the stated scope:

- Rules and task owners: `AGENTS.md`, `CONTRIBUTING.md`, `REPOSITORIES.md`, `README.md`, `BACKLOG.md`, `SITE-ROADMAP.md`, `SITE-OPERATIONS.md`, `.github/REPOSITORY-INTELLIGENCE.md`, `.github/repository-intelligence-config.json`, `.github/workflows/navigation.yml`.
- Entire execution package: `SOL-HANDOFF.md`; every file in `review/sol-plan-20261002/` — `VISUAL-SPEC.md`, `scene-blueprint.json`, `art-direction.svg`, both portrait-facet SVGs, `CONTENT-AND-CONVERSION-BRIEF.md`, `SEO-BUYER-INTENT.md`, `SEO-QUERY-MAP.csv`, `SEO-EVIDENCE.md`, `INPUT-PROVENANCE.json`, `FINAL-REVIEW.md`.
- Current public source: all five `docs/*.html` pages, `docs/styles.css`, `docs/theme.js`, `docs/space.js`, `docs/archive.js`; archive rows/schema/secondary rendition extracted and counted directly.
- Review/source/operations context: `SITE-CONTENT-REVIEW.md`, `SITE-SOURCE-AUDIT.md`, `SITE-SEO.md`, `SITE-VISUAL-REVIEW.md`, `review/site-v1-review.json`; current and historical preview/bundle manifest structures and the historical proposal producer `review/build_visual_proposal.cjs`.
- Producers and tests: `tools/build_site_previews.cjs`, `tools/build_site_bundle.py`, all five Node test files, `tests/test_repository_intelligence.py`, RI producer inventory/freshness behavior.
- SEO support, assessed for executable-input availability and interpretation boundaries: all five raw RankSpot batches and normalized `keyword-metrics.json`; `free-sources.json`; `keyword-evidence.json` structure, method/source/count/selection records; autocomplete raw/normalized structures and counts. This review does not substitute for the separate full SEO source-evidence review.
- Complete supplied primary article: `/workspace/scratch/4e7cba0694b6/project_sources/01-Uncertainty-Architecture-Why-AI-Governance-is-Actually-Control-Theory.md`.
- Live GitHub: full PR #9/#10 metadata and bodies; #10 current workflow-run and submitted-review endpoints; #1 body and discussion; #2/#7/#8/#11 bodies, including their latest plan/sequence amendments; #10 latest review/handoff discussion. Older independent confirmations were inspected as historical records, not adopted as this verdict.

Re-review can be limited to the three corrections and any new changes they cause. The remaining candidate implementation and release checks stay exactly where the accepted plan places them.
