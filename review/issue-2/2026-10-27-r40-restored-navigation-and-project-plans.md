# Issue #2 / publisher #5 — R40: detailed navigation and separate project plans

Date: 27 October 2026. Editorial owner: [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2). Publisher owner: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5). Delivery route: existing [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).

**Prepared complete editorial R40, not native publisher acceptance.** The full illustrated PDF, navigable Markdown, authoring source, offline HTML/images, exact R39-to-R40 patch, replacement record and verification reports are supplied in the conversation's R40 review package. This commit records the editorial result and its limits; it does not advance the repository's selected R38 publication edition, rewrite frozen editions or publish the site.

## Author instruction and inspected baseline

[Author-approved correction and scope](https://github.com/oborskyivitalii/oborskyivitalii/issues/2#issuecomment-6439934860): restore the detailed contents/internal navigation; rewrite Part III around a shared engineering-framing premise followed by two distinct planning problems; restore accountability to customers and the vendor/adopter risk distinction; stop cutting substantive meaning to satisfy the artificial manuscript-length ceiling.

The supplied R39 source is `The_Sum_of_Our_Technology_R39_2026-10-27.md`, SHA-256 `3dfdd59246a5ab40abbf190dd07d387c45d93bbff5f074cb81fcea92fb47318e`, 52,845 characters. Its supplied PDF has 17 pages and a visible reading map of only four entries, despite having a deeper bookmark outline. The prior R39 prepared-source record is `review/issue-2/2026-10-27-r39-prepared-problem-framing.md` at PR79 head `11a029c4eaf650c88f46ab503e352d338eea5a2e`. Main was separately observed at `20c3a6959ee812a632a4a820402873c92a6d3d98`; main/platform work does not establish article acceptance.

The source comparison inspected the R23 historical manuscript, the R29 manuscript, the complete exact R38-to-R39 replacement record supplied with R39, and the complete R39 text/HTML/PDF. The R23/R29 endings explicitly retain the vendor/customer sentence and the risk-acceptance sentence restored below. This is source-based editorial restoration, not a new audit of external empirical research.

## Editorial outcome

### Part III — common premise, two separate project plans

The revised opening states:

> Correct problem framing changes a project before implementation. It determines what must be learned, built, funded and operated; which risks must be addressed; who needs to be involved; and who can decide that the proposed approach should change.

The two problems then have separate subsections, rather than inheriting one account-recovery product plan:

1. **Adopting AI coding tools: fund the delivery system.** Licences and training are inputs, not proof of end-to-end value. A diagnosis of displaced constraints may require SDLC rebalancing. The budget covers diagnosis, measurement, verification/integration capacity, maintenance, recovery and transition. Risk assessment follows work across the lifecycle, including unfinished work and lost understanding. Staffing protects the required QA/architecture/integration/operations capacity, with a named owner able to coordinate functions and limit intake. No universal wholesale redesign, fixed hiring recipe or guaranteed ROI is asserted.
2. **Building systems around model judgment: fund the operating arrangement.** This is the distinct question of useful, bounded runtime delegation in a business context. Budget includes feasibility and continued operation; risk starts from consequences, authority and intervention time; staffing follows policy/security/statistical/safety/human-factors/control needs. A control specialist may need to model the relevant signals, delays and interventions, but no compulsory professor, complete model or guarantee is claimed. Inadequately justified authority leads to narrower authority/scope, more feasibility work or declining the project as proposed—not a declaration that all solutions are impossible.
3. **Separate decisions need separate evidence.** Delivery performance and the justification for runtime authority are evaluated separately. The original five pilot rows are retained verbatim, but split into Decision A (delivery-system pilot, one row) and Decision B (runtime-delegation pilot, four rows). The existing evaluation-response table remains, so R40 has three body tables. Faster implementation still does not authorise broader runtime judgment; neither safe operation nor delivery gains alone proves comparative economic value.
4. **Your customers do not share the vendor's risk position.** Restore customer accountability, the difference between vendor confidence and adopter risk acceptance, explicit bounded experimentation, irreversible consequences and the possibility of changing the adoption decision.

The account-recovery example remains an illustration, not the definition of either engineering problem. Criteria remain illustrative and predeclared, not measured findings or universal sample sizes.

### Restored responsibility conclusions

The following original formulations from R23/R29 are restored:

> Their confidence is not your risk acceptance.

> You do not owe a vendor your organisation as an experiment. You owe your customers a system you can operate.

The surrounding text says the organisation should not become an unwitting test site with customers bearing consequences that were never understood or accepted. It distinguishes this from legitimate, explicitly scoped, funded and owned experiments. The earlier cautions that recovery cannot undo every consequence and that “we will iterate” does not answer irreversible harm are retained. No allegation about hidden vendor intentions or investor motives is added.

### Other restored detail

The four-region R38-to-R39 compression was checked. R40 restores the explicit machine-output/human-capacity asymmetry, review's defect-detection and knowledge-transfer functions, the distinction between responsibility for shipped changes and runtime judgment, fuller January/author-origin context and full reviewer descriptions. Pasquale's alternative draft is again explicitly AI-assisted. Dimitrios remains credited for R23 only, and the author's preference for shorter posts linking to the complete essay remains. Olivier's substantive suggestions remain under consideration. New R40 changes are author-originated, not retroactively attributed to a reviewer.

## Restored navigation and actual artifact checks

The complete PDF has **23 pages**, with a full hierarchical contents page on page 2:

- 29 visible contents entries, covering the opening, prologue, chapters, subsections, both pilot decisions and supporting material.
- 30 hierarchical PDF bookmarks.
- 259 internal link annotations; every page has clickable Contents and Sources footer links.
- 48 in-text numbered citation locations with corresponding return routes from the source list. Reference titles retain external destinations.
- All 44 unique external source destinations are preserved; 71 external link annotations.
- All 287 visible source blocks checked in the rendered PDF; no missing source block or off-page text found.
- All 37 reference notes remain byte-identical to R39; 12 standalone What-if-not prompts, four displayed illustrations and every original pilot-table row are retained.

Locations: Part I page 3; Part II page 8; Part III pages 13–17; adoption planning page 13; runtime-system planning page 14; decision tables pages 15–16; customer accountability pages 16–17; references page 18; reviewer provenance page 22.

A first rendering exposed table-width overflow into the right margin caused by percentage cell widths plus padding. The renderer was corrected to use column groups; final text stays within the intended margin (maximum right text edge 544.256 pt on A4). No prose was cut to fix layout. The final control explanation and its illustration now share page 12. Local PDF rendering, visual inspection and link/target checks are implementer evidence, not independent reviewer approvals.

## Exact identities and length decision

| Artifact | Identity |
| --- | --- |
| R40 authoring source | `The_Sum_of_Our_Technology_R40_2026-10-27_SOURCE.md` |
| Source SHA-256 | `2704eb63dc4c4e65ddc48eff797a2d6ddc58365e577d4ebecb529e963aa062e0` |
| Source size | 64,123 characters / 64,532 UTF-8 bytes |
| Full PDF | `The_Sum_of_Our_Technology_R40_2026-10-27_REVIEW.pdf` |
| PDF SHA-256 | `cc83fc2ccb22a7f3d9429870d1b3424ff07d195e7118157b5e488e144a0d103c` |
| PDF size | 23 A4 pages / 854,960 bytes |
| Navigable Markdown SHA-256 | `02d1bc2fd88ed6d4ded2d5464d06dcdf09d71e8b83e54235466c29f429ace71d` |

**The author withdrew the artificial 53,000-character editorial ceiling; no replacement ceiling is applied to this candidate.** The reading Markdown additionally includes navigation, captions and explicit anchors; it is not the canonical authoring source and its size must not be confused with the source count. External platform limits and source/resource/security/rights/CI limits are separate. Native integration must carry the author's decision into the article's publication settings without silently reinstating the old editorial ceiling or disabling unrelated guards. A shorter distribution edition remains a separate editorial choice, not a reason to mutilate the complete essay.

## Limits and remaining integration

The PDF was generated with WeasyPrint 68.0, using the same verified review images as R39; their historical artifact/media provenance remains in the supplied pack. It is not the native repository publisher's PDF and does not establish exact canonical-PNG equivalence. Rights remain pending. No font files are distributed.

The required independent Requirements/Acceptance, Code/Artifact, White-box and Exploratory repository executions were not completed here; do not substitute these implementer checks for those roles. Native publisher/profile/semantic/launch integration, RI/CI, actual platform-copy observation, rights/editorial sign-off, merge and publication remain open. No source bound, human gate or old edition is relabelled. The repository's canonical R38 selection and the Romania slide deck are unchanged by this review-record commit; no production or platform post occurred.
