# Independent content and intent review — Sol plan

Date: 2026-10-02. Reviewed original PR #10 head: `0c329dc1da5b8d89ce918383a4a6c5299526ab31` (`work/site-v1-20261001`, Draft; base `work/issue-backlog-20261001`).

**Verdict: Changes requested, limited to the planning contract and content synchronization below.** The proposed audience, author/research narrative, selected writing, bounded offers, contact route and public-discussion treatment preserve the maintainer's recorded intent. I found no basis for reopening those decisions or commissioning another positioning pass. The archive preservation contract needs an exact counting unit before implementation. Two smaller execution-documentation corrections should accompany it.

I did not author this plan. I read `FINAL-REVIEW.md` as a planning artifact, not as evidence that the work had already passed independent review. This review makes no edits to the plan, website or GitHub and does not approve release, rights, a future implementation, measured conversion gains or research validity.

## Findings

### C1 — P2: The archive acceptance contract conflates primary records with every linked platform rendition

**Locations:** `SOL-HANDOFF.md:29–30,53,91–93`; `review/sol-plan-20261002/CONTENT-AND-CONVERSION-BRIEF.md:115,190`; `review/sol-plan-20261002/SEO-BUYER-INTENT.md:80,228`. Baseline evidence: `docs/writing.html:29,91–104,449,452`; `SITE-SOURCE-AUDIT.md:6–7,19–20,77–78`.

The active handoff repeatedly specifies “27 archive editions” or “all 27 platform editions (20 EN, 7 UA).” Those figures describe the primary archive records, not the complete set of separately dated rendition URLs already preserved on the page. Independently parsing the real HTML and its JSON-LD gives:

| Inventory unit | Observed baseline |
|---|---:|
| Primary publication records / unique primary URLs | 27 |
| Primary records by language | 20 English, 7 Ukrainian |
| Separately linked secondary rendition | 1 English LinkedIn edition of Thinking Systems |
| All distinct linked publication-rendition URLs | 28 |
| JSON-LD ItemList elements / `numberOfItems` | 27 / 27 |
| JSON-LD coverage | Exactly the 27 primary URLs; the secondary URL is outside this list |

The Thinking Systems primary record points to the Generative AI edition dated **2026-08-30**. The same record also carries the separate LinkedIn rendition dated **2026-08-27**. The LinkedIn original was freshly retrieved and independently confirms its date and platform-rendition status. The source audit already distinguishes these identities correctly.

**Why it affects the outcome:** A future parity check that compares only 27 cards or schema items can pass after losing the secondary URL/date. Conversely, interpreting the wording as a requirement for 28 primary cards or schema elements would change the current information structure unnecessarily. The content brief's “optional secondary link” is understandable in its Home-selection context, but should not be mistaken for permission to drop an existing archive rendition.

**Minimal correction:** Define the preservation invariant as **27 primary archive records (20 EN, 7 UA), plus the separately dated English Thinking Systems LinkedIn rendition**. Preserve the 27 primary identities and the secondary URL/date explicitly. Keep the baseline primary ItemList count at 27 unless an intentional later structural change alters its actual membership. If reporting every linked rendition, the total is 28, including 21 English renditions; neither number is a unique-work count. Make Home placement of the secondary link optional while making its archive preservation mandatory. Require implementation to reconcile public counting language and verify primary records, secondary rendition and schema scope separately. No publication needs to be removed or added to the five-work selection.

### C2 — P2: Public Credits instructions must be included in the no-pointer content update

**Locations:** `docs/credits.html:46`; `SOL-HANDOFF.md:120–147,159–165`; content brief acceptance at `:195`.

The public Display preferences paragraph currently says the background responds to scrolling **and pointer movement**. The plan correctly removes pointer/cursor influence, and S4 explicitly removes the old mouse instruction from the generated bundle, but the public Credits instruction is not named in the affected copy or acceptance checks.

**Why it affects the outcome:** The implementation could satisfy the specified motion tests and produce a correct new preview while continuing to tell actual visitors that moving a pointer controls the scene. This is an existing public statement made obsolete by the authorized behavior change, not a hypothetical new requirement.

**Minimal correction:** Include `docs/credits.html` Display preferences in the S3/S4 content reconciliation and acceptance checklist. Describe only the implemented triggers and actual Off/reduced/no-JS behavior. The immediate task is a plan amendment; change the public page when implementing the behavior.

### C3 — P3: One active brief still points execution ownership to an intentionally omitted file

**Location:** `review/sol-plan-20261002/CONTENT-AND-CONVERSION-BRIEF.md:198`.

The final paragraph directs Sol to `SEO-TASK-UPDATES.md` for task ownership. That file belongs to the older source package and was deliberately not admitted as a new execution owner. Root `SOL-HANDOFF.md`, the dated amendments and live issues supply the current ownership and sequence.

**Why it affects the outcome:** A reader following the active brief reaches a nonexistent local instruction and may recover an obsolete package copy. This is a navigation/synchronization defect, not a missing-work blocker: the correct ownership information is already available.

**Minimal correction:** Replace this reference with the root handoff and, where useful, actual owning issues #1/#2/#7/#8/#11. Do not restore the obsolete file merely to satisfy the link.

## Substantive assessment

**Purpose and audience.** The combined purpose is coherent: introduce the author; connect the two research directions and original publications; help a relevant enterprise or IT-services reader recognize a problem and start a conversation. The two buyer situations are concrete enough to organize the page without asserting that all AI adoption fails. The seven-section sequence, bounded copy budget, reading path and repeated contact route make the commercial purpose usable without turning the research into an unexplained consulting slogan. These choices match the latest live Issue #1 clarifications, including English UI, the portrait/facet direction, five fixed English works and eight discussion entries.

**Research meaning.** The how-we-build / what-we-build distinction is useful and is not treated as an absolute division of the two research programs. Subprime remains an authorial systems thesis about generation, understanding, verification and ownership. The plan explicitly requires diagnosis rather than assuming that review capacity is every team's constraint. Current Subprime README separates empirical observations, systems inference and proposed method; the brief preserves that distinction well enough for an author homepage.

For UA, the proposed summary centers consequential runtime responsibility depending partly on probabilistic model judgment, with people, evidence, authority, correction and reassessment in the engineering perimeter. This agrees with the current glossary and current Thinking Systems article. It does not equate “thinking” with consciousness, certify readiness, identify all agents with the category, or imply that closing a loop guarantees acceptable control. The plan's socio-technical emphasis is consistent with the article's distinction between the controlled software system and its wider control perimeter; implementation should retain that distinction rather than describing people as components of a controlled software process.

The historical attachments contain stronger simplifications about determinism, control loops and delivery bottlenecks. Their existence is not evidence that the homepage should reproduce them. The plan correctly gives current research owners precedence and excludes unsupported numeric contrasts, universally broken SDLC claims and a guaranteed cure. I found no content-level reason to replace the chosen narrative with older source wording.

**Executive Brief intake and offers.** I read the supplied original 14-page Executive Brief, including its offer and audience pages, and inspected rendered pages rather than relying solely on the planning summary. Delivery diagnosis, architecture/runtime-governance review and SDLC/QA/operating-model workshops are supported by its qualitative scope: delivery-system design, AI governance, review/ownership, technical controls, organizational roles and learning. The plan narrows these into useful first-conversation formats without inventing a productized engagement, assured output, duration or fee. It also correctly avoids importing unverified current-role, scale and impact claims. Operational IP is a justified secondary Moat-related topic; treating it as a legal service would exceed the source and maintainer decision. No private PDF or numerical claims need to be published to make the proposed site useful.

**Selected writing.** All five exact platform titles, URLs and dates were checked against public originals. The order is a fixed editorial path, not an automatic latest-items feed. Externalization is a real bridge to the delivery/verification thesis, Beyond Embeddings is a bounded technical pattern, and Moat supplies the strategic differentiation question. The plan does not incorrectly label every selected work as exclusively UA. There is no source-based reason to reopen the selection. The only required archive correction is C1.

| Selected edition | Verified date | Verified site role |
|---|---|---|
| [Thinking Systems](https://generativeai.pub/uncertainty-architecture-thinking-systems-when-the-controlled-object-changes-21275fe2f3db) | 2026-08-30 | Current responsibility boundary and architecture/control direction |
| [Externalization of Reasoning](https://medium.com/agileinsider/ai-the-externalization-of-reasoning-and-the-verification-crisis-4f5046f9f0d0) | 2026-06-12 | Generation, reasoning and verification bridge |
| [Fallacy of Agentic Loops](https://www.linkedin.com/pulse/reinventing-control-theory-one-feature-time-fallacy-agentic-oborskyi-vkwve/) | 2026-06-10 | Why a repeated loop needs an actual control design |
| [Beyond Embeddings](https://generativeai.pub/uncertainty-architecture-beyond-embeddings-neuro-symbolic-verification-of-semantic-drift-in-llms-69822872825b) | 2026-06-10 | Bounded semantic-verification example |
| [Moat Problem](https://aiadvances.org/ai-native-workflows-have-a-moat-problem-49992bcc3088) | 2026-07-01 | Durable differentiation and workflow ownership |
| [Thinking Systems secondary rendition](https://www.linkedin.com/pulse/thinking-systems-when-controlled-object-changes-vitalii-oborskyi-6k4we) | 2026-08-27 | Same selected work, independently dated platform identity |

**Public discussion and credibility.** I freshly retrieved all eight entries' actual public sources, including the named comments. Each proposed attribution is supportable at the scope the brief gives it:

| Entry and original | What the original supports | Boundary retained by the plan |
|---|---|---|
| [Arkadiy Dobkin](https://www.linkedin.com/posts/arkadiydobkin_uncertainty-architecture-thinking-systems-activity-7500661925790240768--I1H) | Recommended reading and extended the discussion of consequential judgment, architecture and business constraints | Distinct from first-person formulation credit; no EPAM endorsement or coinage claim |
| [Maximiliano Armesto](https://www.linkedin.com/posts/maximiliano-armesto_uncertainty-architecture-thinking-systems-activity-7498756197647441920-8REu) | Supported the changed-object framing and discussed boundaries, evidence, authority and correction | Public response, not institutional adoption or validation |
| [Markus Kopko](https://www.linkedin.com/posts/markuskleinpmp_uncertainty-architecture-why-ai-governance-activity-7462053122773827584-mKwf) | Connected the control-theory framing with CPMAI practices | No PMI endorsement or certification |
| [Christophe Kolb](https://www.linkedin.com/posts/christophekolb_the-probability-control-theory-of-agentic-activity-7460778173597786114-rWAh) / [Taller](https://www.linkedin.com/posts/taller-technologies_llms-and-control-theory-activity-7482866825244889089-tIsK) | Cited UA in a control-theory interpretation and attributed a related visual | Citation/interpretation, not measured enterprise implementation |
| [Michael Risch](https://www.linkedin.com/posts/michael-risch-ab8b423_uncertainty-architecture-why-ai-governance-activity-7455141331162681344-i-8g) | Public operational interpretation linking controls, roles, evaluation and governance | Proposed interpretation, not a verified client outcome |
| [Matthew Skelton](https://www.linkedin.com/posts/vitaliioborskyi_ua-1-ugcPost-7461016808725164033-pQg_/) | Encouraging comment looking forward to the work | Encouragement, not methodological validation |
| [Rod Montgomery](https://www.linkedin.com/posts/roderickm_one-of-the-highlights-of-our-recent-learn-al-palooza-activity-7480960628980072448-FBm4) | Host's public report of an internal technical community session and its discussion | No consulting-client relationship, exact event day or public recording inferred |
| [Otman Basir's comment](https://www.linkedin.com/posts/michael-risch-ab8b423_uncertainty-architecture-why-ai-governance-activity-7455141331162681344-i-8g) and [paper](https://arxiv.org/abs/2512.16873) | Shared his related Social Responsibility Stack research in that discussion | No claim of derivation from UA, advisory appointment or academic validation |

The three-lead/five-compact presentation is a reasonable editorial choice, not a research ranking. Actual copy must continue to describe the action rather than converting these sources into generic testimonials. Formulation provenance remains an author-attested credit; the public recommendation does not independently prove the private origin story.

**Contact, rights and later work.** A functional LinkedIn route and clearly unavailable booking route satisfy the currently authorized contact goal. A calendar link, fabricated address, analytics funnel or priced package is not needed. The portrait is treated as an authorized supplied candidate with honest derivative credit, not as a new reuse license. Public discussion links do not confer rights to reproduce third-party visuals. The plan keeps release/editorial/rights acceptance in #7/#8, PMDay writing in #2 after launch, and substantive discovery guides in #11 thereafter. These are appropriate boundaries, not missing strategic decisions. Existing #5/#6 items are not improperly made launch blockers.

## Coverage and limits

- Read `AGENTS.md` and `CONTRIBUTING.md` first, then `README.md`, `REPOSITORIES.md` and root `SOL-HANDOFF.md`.
- Read every admitted planning file in `review/sol-plan-20261002/`: the full content brief, buyer-intent brief, SEO evidence, query-map CSV, visual specification, scene blueprint, input provenance, final-review record, art-direction SVG and both facet SVGs. SVG/JSON inspection here concerns editorial meaning and whether decorative controls are represented as scientific evidence; it is not a substitute for rendered browser or visual-art review.
- Compared current public HTML on Home, Research, Writing, Talks and Credits with `SITE-SOURCE-AUDIT.md`, `SITE-CONTENT-REVIEW.md`, `SITE-SEO.md`, `SITE-OPERATIONS.md`, `SITE-ROADMAP.md` and `SITE-VISUAL-REVIEW.md`. Parsed actual Writing HTML and JSON-LD for C1. I did not perform a general JavaScript/CSS implementation review or build/CI acceptance.
- Retrieved live Issues [#1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1), [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2), [#7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7), [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8) and [#11](https://github.com/oborskyivitalii/oborskyivitalii/issues/11), including their clarification/comment history. Applied the latest dated maintainer decisions rather than old superseded descriptions.
- Read relevant original manuscript passages across supplied sources 01–05: control-theory governance; modern LLM application design; architecting uncertainty; neuro-symbolic semantic verification; on-device/cloud tradeoffs. Read the supplied 22-page non-deterministic-systems presentation and the original 14-page Executive Brief. The manuscripts and presentation are historical author sources, not fresh empirical validation; numerical and legal claims were not imported.
- Checked current upstream UA glossary (`00-doctrine/glossary.md`, blob `1ea03b8d6d98acc5996b01138ae317541ba11be1`) and AI Control Plane README (`02-ai-control-plane/README.md`, blob `fb463fca01ecc680fed7a171b8b189f313839a5f`), plus Subprime README (blob `d1e02f343acb7c001cf58f7424c7098f7a8ea8af`). This was a bounded meaning check, not a review of all sibling research repositories.
- Freshly checked the six selected/secondary article originals and all public-discussion originals linked above. This validates identity and the proposed attribution scope, not the articles' complete factual or scientific claims. SEO strategy was checked for meaning and source/claim boundaries; provider volumes, rankings and full search-demand research require the separate evidence review.
- The local snapshot's existence-only historical HTML/ZIP/binary placeholders were explicitly excluded from missing-file, rights and broken-build findings. No report here asserts that the future design has passed browser, accessibility, editorial-rights or release acceptance.

**Re-review requested:** Verify the plan-only correction for C1–C3. Once those are fixed coherently, the content plan is suitable for implementation with the existing source, browser and release checks. Optional copy preferences or a new strategic decision are not conditions of this verdict.
