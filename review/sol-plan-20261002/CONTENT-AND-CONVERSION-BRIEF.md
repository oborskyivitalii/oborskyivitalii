# Author, research and client conversations — content brief for Sol

Updated 2026-10-02, edition 3, Europe/Warsaw. **Planning amendment; website implementation remains pending.** This brief supersedes the earlier four-featured-article selection and homepage order in the first handoff. The visual requirements — facets, Day/Night, scroll/click camera, no pointer-driven motion — remain in force.

## Final planning review — 2026-10-02

The current request authorizes committing the reviewed plan and inputs to PR #10. Earlier “no repository documentation” and “not committed” statements describe the preceding planning pass. Root [SOL-HANDOFF](../../SOL-HANDOFF.md) now owns execution and authorization boundaries. The content selection below remains the accepted baseline; public implementation starts with the maintainer's next execution instruction. Query evidence is updated by [SEO-EVIDENCE](SEO-EVIDENCE.md); the earlier all-hypothesis description is historical. Dobkin and Armesto public originals were retrieved again for this final review; the other six entries retain the recorded source-audit provenance.

## 1. Durable intent

The site has three purposes:

1. Explain who Vitalii Oborskyi is, what he works on, and how his professional experience informs the research.
2. Connect Uncertainty Architecture, The Subprime Code Crisis, publications and talks under one author identity for navigation, discoverability and indexing. The research repositories retain ownership of their definitions and evidence.
3. Help potential clients recognize a relevant problem, understand Vitalii's approach, inspect his writing and public discussion, and initiate a conversation.

The visitor journey is **recognize the problem → understand the two research directions → assess relevance and credibility → start a conversation**. The background supports that journey. An animation, publication count or long list of names is not the business outcome.

The maintainer authorized updating this plan, researching buyer search intent and updating the corresponding GitHub tasks now. No website code, repository documentation, merge, deployment, calendar configuration or live Medium change is authorized by this planning amendment. The booking URL will be provided later.

### Buyer discovery amendment

Read `SEO-BUYER-INTENT.md` for the query/page map and the Executive Brief intake. Prioritize two situations: AI adoption is not producing the expected delivery improvement while costs or review load grows; and agentic systems are difficult to control and own in production. These are target situations, not universal claims about every AI deployment. Proposed query phrases are hypotheses, not measured demand.

For launch, use plain buyer language on Home and page-specific metadata. Preserve the fundamental-shift narrative and research depth. Proposed problem guides are post-launch publications; the PMDay article remains the next intended publication under #2. Operational IP/workflow protection is a secondary topic connected to Moat, not a fourth primary CTA or an invented legal offering.

## 2. The narrative to convey

AI is a fundamental shift: an attempt to delegate parts of reasoning and judgment to machines. Changes of this scale create engineering, organizational and operating-model problems. Vitalii studies a bounded part of that shift through experience in quality engineering, project management, PMO and delivery leadership.

Two questions organize the work:

| Direction | Problem and research thesis | Consequence for a visitor |
|---|---|---|
| **The Subprime Code Crisis — how we build** | AI can accelerate generation far beyond the rate at which people understand, verify and take lasting ownership of the output. Vitalii's thesis is that an SDLC optimized around that acceleration becomes structurally unbalanced. The system must be reconsidered around human understanding and verification capacity, not only generation speed. The research does not claim a generally validated universal remedy already exists. | More output can coexist with review queues, fragile ownership, rework and maintenance risk. A delivery leader needs to examine the whole flow and the team's capacity to understand what it owns. |
| **Uncertainty Architecture — what we build and how we operate it** | Thinking Systems delegate consequential runtime responsibilities partly to probabilistic model judgment. Vitalii sees this as the fullest expression of today's AI potential that he wants to investigate. Engineering includes the socio-technical system: people, evidence, authority, boundaries, correction and reassessment. These systems also require development lifecycles and operating models suited to the uncertainty. Much of this engineering remains open work. | A convincing demo leaves questions about acceptable behavior, evaluation, release decisions, runtime ownership, escalation, human capacity and correction. These belong in the system design and delivery model. |

Write this as a clear, first-person research position. Preserve the maintainer's strong argument without presenting every SDLC as empirically proven broken, machine judgment as human consciousness, a universal remedy as established, or research categories as certification. Existing canonical UA meanings remain upstream; the site does not redefine them.

The difference between generation speed and human understanding/verification is a central motivation. Avoid an unsupported numeric ratio or a literal chart with a perfectly flat human-capacity line. If a conceptual illustration is used, identify it as conceptual. No new statistics are required for this homepage.

## 3. Homepage sequence and reading hierarchy

1. **Hero:** author identity, one clear statement of the shift, brief experience connection, primary `Discuss your AI challenge` CTA to `#contact`, secondary `Explore the research` to `#research`.
2. **Research / problem space:** the two questions and two research directions. Explain each problem before presenting the repository name. Include the key consequence, current research status and link to the fuller Research page/repository.
3. **How I can help:** three recognizable situations, a concrete way to work together and examples of useful outputs. Link to the same contact section.
4. **Selected writing:** five English-language works, selected below. One short “why read this” line per work. Link to the complete EN/UA archive.
5. **Public discussion & responses:** stronger, source-linked visibility for public recommendations, interpretations, extensions and relevant feedback. Show what each person actually did.
6. **About:** the bounded professional story connecting QA, PMO and delivery to this research. Retain profile links and 20+ years context; do not import unverified current role, client or impact metrics.
7. **Contact / book a conversation:** a clear invitation, scheduler placeholder and a working LinkedIn alternative.

Keep global navigation Home · Research · Writing · Talks. A small local homepage row can use Research · Writing · Work with me; it need not duplicate every section heading. `Work with me` leads to `#help`; the main CTA leads to `#contact`. The footer contact link works from every page. No new Services page is required for the first launch.

Suggested homepage copy budget: about 800–1,100 words including article summaries, mentions and About. Use short visible summaries and full Research/credits pages for evidence detail. Do not hide the central argument behind an accordion, auto-rotating carousel or decorative diagram.

## 4. Working English copy — proposal, not published text

Use these as the content baseline for the next implementation/review. They can be tightened while preserving meaning. Keep the hero compact: the practical offer and audience line lead into the shift/research introduction; the longer experience paragraph may continue immediately below the first screen. Do not duplicate the full offer again as keyword-heavy prose.

### Hero

**Vitalii Oborskyi**

Eyebrow / scope: **AI delivery governance & agentic operating models**

I help software organizations investigate why AI adoption is not improving delivery, rebalance review and ownership, and define controls for agentic systems in production.

Audience line: **For enterprise software teams and IT services companies.**

**AI is a fundamental shift: an attempt to delegate parts of thinking to machines.**

I study what that changes in software delivery and in the systems we design. My work draws on more than 20 years across quality engineering, project management, PMO and delivery leadership. It has developed into two connected research directions: The Subprime Code Crisis and Uncertainty Architecture.

Primary action: **Discuss your AI challenge**  
Secondary action: **Explore the research**

### Research introduction

**Two questions behind the work**

What happens when machines generate faster than people can understand and verify? And what changes when the software itself relies on model judgment? These questions connect the delivery system with the system being delivered.

### Subprime summary

**How do we rebalance AI-assisted delivery?**

I see today's AI-assisted SDLC as structurally unbalanced where code generation accelerates faster than human understanding, verification and ownership. Accelerating that step leaves the rest of the delivery system with new constraints. The Subprime Code Crisis investigates this gap, its consequences for maintainability, and what it would take to rebalance the work. My working position is that existing playbooks do not yet provide a generally validated recipe for resolving it.

### UA summary

**How do we engineer systems that rely on model judgment?**

Uncertainty Architecture studies what I call Thinking Systems: software in which consequential runtime responsibilities depend partly on probabilistic model judgment. This is where I see the fullest expression of today's AI potential — and some of its hardest engineering problems. The engineering object includes people, evidence, authority and correction mechanisms, alongside software. It also needs development lifecycles and operating models suited to that uncertainty. UA explores how to design this socio-technical system, with much still to develop and test.

### Contact

**Working through one of these problems?**

Bring a system, a delivery bottleneck, or a question you cannot yet frame. We can discuss where the uncertainty sits, what your team needs to understand, and what a useful next step could look like.

Placeholder heading: **Book a conversation**  
Visible temporary message: **Direct booking will be available here. In the meantime, message me on LinkedIn to arrange a conversation.**  
Active alternative: **Arrange a conversation on LinkedIn** → https://www.linkedin.com/in/vitaliioborskyi/

Do not invent a meeting length, price, free consultation promise, available slots, email address or client outcome. Discuss the engagement scope before promising a deliverable. The contact block is an invitation, not an automatic consulting contract.

## 5. Selected writing — maintainer-confirmed choice

The maintainer explicitly selected **“four newer works + Moat”** in the clarification on 2026-10-02. This means the following five distinct works; another platform rendition of the same article does not occupy another featured slot. All five featured editions are English. Ukrainian editions remain in the complete Writing archive with language labels and filtering.

Recommended homepage order is an editorial reading path. The full archive retains its date/topic organization.

| Order | Exact published work / English edition | Edition date | Why read it / site role |
|---|---|---|---|
| 1 | [Uncertainty Architecture: Thinking Systems, When the Controlled Object Changes](https://generativeai.pub/uncertainty-architecture-thinking-systems-when-the-controlled-object-changes-21275fe2f3db) | 2026-08-30 | What changes when consequential responsibility depends on model judgment. Lead article for the UA direction. Preserve the separately dated LinkedIn edition as an optional secondary link, not another featured card. |
| 2 | [AI, the Externalization of Reasoning, and the Verification Crisis](https://medium.com/agileinsider/ai-the-externalization-of-reasoning-and-the-verification-crisis-4f5046f9f0d0) | 2026-06-12 | Why faster generation raises questions of understanding and verification. This is the bridge to Subprime; do not falsely label every featured work as an exclusively UA publication. |
| 3 | [Reinventing Control Theory One Feature at a Time: The Fallacy of Agentic Loops](https://www.linkedin.com/pulse/reinventing-control-theory-one-feature-time-fallacy-agentic-oborskyi-vkwve/) | 2026-06-10 | A control-theory perspective on agentic loops and engineering control. |
| 4 | [Uncertainty Architecture: Beyond Embeddings — Neuro-Symbolic Verification of Semantic Drift in LLMs](https://generativeai.pub/uncertainty-architecture-beyond-embeddings-neuro-symbolic-verification-of-semantic-drift-in-llms-69822872825b) | 2026-06-10 | A bounded technical example of semantic verification within a wider control architecture. |
| 5 | [AI-Native Workflows Have a Moat Problem](https://aiadvances.org/ai-native-workflows-have-a-moat-problem-49992bcc3088) | 2026-07-01 | The question of durable differentiation in AI-native workflows. Keep its original published title, rather than renaming it “AI-Native Delivery…”. |

These original pages were retrieved in this planning pass; title/date identity also matches the existing source audit. The four newer research works + Moat were confirmed as a fixed launch selection, not a new automatic “latest four” feed. Do not silently replace them whenever another article is published. A later editorial change belongs in the owning issue.

## 6. Public discussion: more visible, more precise

Prominence should follow the substance of the public interaction. Suggested composition: **three lead summaries** (Dobkin, Armesto, Kopko) followed by **five compact source-linked entries** (Kolb/Taller, Risch, Skelton, Montgomery, Basir). This brings eight distinct person/group entries onto Home without eight large testimonial cards. Full evidence remains on Research/credits.

| Person / group | Proposed bounded public summary | Evidence and status |
|---|---|---|
| **Arkadiy Dobkin** | Recommended a full reading of Thinking Systems and extended the argument toward new addressable problems, domain-specific bounding architecture and runtime control. | [Original public post](https://www.linkedin.com/posts/arkadiydobkin_uncertainty-architecture-thinking-systems-activity-7500661925790240768--I1H), directly retrieved 2026-10-02. This is stronger public evidence than the old formulation-credit-only homepage entry. Keep formulation provenance as a separate credit. It does not establish endorsement of every UA claim or an EPAM client relationship. |
| **Maximiliano Armesto** | Publicly supported the changed-engineering-object framing, emphasizing boundaries, evidence, authority, correction loops and the return of human judgment. | [Original public post](https://www.linkedin.com/posts/maximiliano-armesto_uncertainty-architecture-thinking-systems-activity-7498756197647441920-8REu), directly retrieved 2026-10-02. A new entry relative to the seven-entry site baseline; not a claim of paid engagement or enterprise adoption. |
| **Markus Kopko** | Connected UA's control-theory framing with CPMAI practices, roles and governance gates. | [Public mapping](https://www.linkedin.com/posts/markuskleinpmp_uncertainty-architecture-why-ai-governance-activity-7462053122773827584-mKwf). Existing audited primary-source treatment; no PMI endorsement implied. |
| **Christophe Kolb & Taller** | Cited UA in an explanation of agentic-system control and developed a public visual explanation drawing on it. | [Kolb post](https://www.linkedin.com/posts/christophekolb_the-probability-control-theory-of-agentic-activity-7460778173597786114-rWAh), [Taller visual explainer](https://www.linkedin.com/posts/taller-technologies_llms-and-control-theory-activity-7482866825244889089-tIsK). Existing source-audited treatment. |
| **Michael Risch** | Developed an operational interpretation linking UA to roles, evaluation signals and governance practices. | [Original post](https://www.linkedin.com/posts/michael-risch-ab8b423_uncertainty-architecture-why-ai-governance-activity-7455141331162681344-i-8g). Interpretation is distinct from measured implementation results. |
| **Matthew Skelton** | Offered public encouragement for the research's development. | [Original thread with comment](https://www.linkedin.com/posts/vitaliioborskyi_ua-1-ugcPost-7461016808725164033-pQg_/). Preserve this bounded treatment unless a stronger specific statement is retrieved; do not turn it into formal Team Topologies validation. |
| **Rod Montgomery** | Hosted the Corning Learn-AI-Palooza discussion and publicly reflected on the relevance of system-level risks, teams and ownership. | [Original host post](https://www.linkedin.com/posts/roderickm_one-of-the-highlights-of-our-recent-learn-al-palooza-activity-7480960628980072448-FBm4). Existing audited public record; no unsupported “top three”, client success metric or formal Corning adoption. |
| **Otman Basir** | Brought related control-theoretic research into the public discussion of UA. | [Original discussion](https://www.linkedin.com/posts/michael-risch-ab8b423_uncertainty-architecture-why-ai-governance-activity-7455141331162681344-i-8g), [related paper](https://arxiv.org/abs/2512.16873). Related research and discussion; no claim that his paper derives from UA. |

Use a neutral section title such as **Public discussion & responses** or **How others have engaged with the work**. Distinguish recommendation, extension, interpretation, encouragement and formulation credit. Do not make an undifferentiated “Trusted by” logo strip. These public records primarily concern UA; their placement on a shared author site must not imply they validate Subprime too.

New-source intake for later implementation: Dobkin and Armesto originals were inspected; they affect the site acknowledgement copy, Research detail and `SITE-SOURCE-AUDIT.md`. They do not change research definitions or evidence status in UA/Subprime. Other six treatments reuse the existing audit and need the usual pre-publication source check, not a claim that all were freshly reverified today. No private correspondence or additional names are needed.

## 7. What a potential client can recognize

Use a section titled **Where I can help** with three problem-led entries. These are proposed engagement formats, not assertions of previously delivered client outcomes.

| Recognizable situation | Possible work together | Example output after an agreed engagement |
|---|---|---|
| “We bought AI tools, but delivery is not improving and costs or review load are rising.” | Assess adoption outcomes across the delivery flow, verification capacity, rework, knowledge dependencies and costs; investigate the actual constraint. | A problem/risk map and a prioritized set of experiments or changes to test. |
| “Our agent works in a demo, but its production behavior, costs or ownership are hard to control.” | Review delegated judgment, permissions and limits, evaluation evidence, production ownership, escalation and corrective action. | A control/ownership sketch and explicit unresolved release questions. |
| “Our development process and roles have not caught up with AI.” | Facilitate a focused workshop on SDLC, requirements, QA/evaluation, release decisions, human capacity and the operating model. | Draft decision/role boundaries, adoption-learning routines and an improvement backlog appropriate to the team's context. |

Avoid a generic “AI transformation expert” service catalogue. The first conversation determines fit and scope. Research collaboration, invitations to speak and professional opportunities can use the same contact route with one secondary sentence; they should not create four competing primary CTAs.

Optional prompts beside contact: **What are you trying to delegate? Where does the current approach break down? What decision do you need to make?** No compulsory form or upload is required for launch.

## 8. Booking placeholder and later integration

Now, in the future site implementation:

- Render an accessible contact section with visible `Book a conversation` heading and a clearly labelled unavailable booking state. No fake slots, successful booking message, `href="#"` scheduler or button that silently does nothing.
- The primary hero action scrolls to this section and remains useful before scheduling is enabled. Provide the active LinkedIn contact URL above.
- Keep one optional booking URL/config field, initially absent/null. A real URL replaces the placeholder without rewriting surrounding content.

After the maintainer provides the URL:

- If the provider supports embedding, place its booking UI in this section, loaded when requested, with a direct booking link as fallback. This fulfils the intended on-page booking path.
- If that provider cannot embed, explain the limitation and retain the functional external booking link. Do not invent an embed URL from the public booking URL.
- Verify provider confirmation, mobile layout, keyboard access and timezone display. Do not claim booking works before the supplied URL is integrated and checked.
- Meeting duration, availability and appointment policy come from the maintainer/provider. Installing a scheduler, connecting a calendar or publishing availability is a later task, not part of this planning update.

## 9. Brainstorm additions worth retaining

- **Problem-first entry points:** each research summary starts with a recognizable difficulty, then introduces the research name. A reader should not need to understand “UA” before finding their problem.
- **Research-to-practice bridges:** every direction links to one relevant article and a relevant way to work together. Externalization makes the Subprime connection visible even though the selected works are English.
- **Short “Start here” guidance:** Thinking Systems for architecture/runtime responsibility; Externalization for generation/verification; Moat for strategic differentiation. Keep all five visible rather than hiding them behind a carousel.
- **Visible research status:** a short plain statement that the work is under development, with repository routes for methods, evidence and critique. This strengthens the invitation to examine the work without burying the homepage in disclaimers.
- **Discoverability through real content:** connect author identity, research names, AI governance, AI architecture, control theory, Theory of Constraints, socio-technical systems, SDLC and operating models in visible text and page-specific metadata. Internal links should connect the problem, research and publication. Preserve source ownership and wait for the stable URL for canonical/sitemap work; no ranking promise.
- **A measurable reader outcome:** review whether a first-time CTO/engineering leader, delivery/PMO leader and research reader can each explain who Vitalii is, name a relevant problem, find a useful article and locate the conversation route. Use that as a qualitative acceptance exercise, not fabricated conversion statistics.

Keep Search Console/indexability checks with the release owner #8. Defer behavioral analytics integration, CRM, lead scoring, gated PDFs, newsletter, paid checkout, additional service pages and a new publishing engine. They are not required to offer a useful first conversation. The PMDay explanatory article remains a subsequent publication under #2.

## 10. Sol implementation and acceptance additions

Before visual implementation, settle this content structure and map it to the existing source inventory. Update the future `SITE-ROADMAP`, operations/content/source/SEO records with the actual implemented result. Do not leave old “four mixed-language featured editions” requirements active after adopting this amendment.

- [ ] Home names both buyer situations and offers specific work without guaranteed gains, fabricated cases or unverified numerical achievements from the Executive Brief. Titles/descriptions follow the actual visible content and the buyer-intent plan.
- [ ] Hero explains the shift and connects the author's relevant experience to the two research directions.
- [ ] The Subprime summary conveys generation versus human understanding/verification and the rebalancing question. UA explains the socio-technical engineering object, human authority/capacity, lifecycle and operating models.
- [ ] A reader can follow problem → research/writing → possible help → contact without visiting GitHub.
- [ ] Exactly the five agreed English works are featured; all 27 currently indexed editions remain in Writing. Schema/metadata counts match the relevant page rather than a single hardcoded site-wide number.
- [ ] Homepage displays the eight bounded source-linked public-discussion entries; Dobkin's public extension is separate from formulation credit. None implies endorsement of both research projects or an institutional client relationship.
- [ ] There is one clear primary invitation, repeated where useful, and specific proposed areas of help.
- [ ] Booking is honestly a placeholder until the supplied URL is configured; the LinkedIn alternative works now. No false appointment confirmation.
- [ ] The background's section map includes Research, Help, Writing, Discussion, About and Contact; adding content does not restart a camera journey arbitrarily or force an extra showy transition for the CTA.
- [ ] Day/Night, mobile, accessibility, no-JS, native scroll and no cursor-driven motion remain intact. On-page CTA movement follows the same native anchor/scroll contract.
- [ ] Source review, real browser review and launch acceptance remain separately recorded; no ticket closure or merge follows from plan completion.

The main handoff provides the visual/technical implementation details. `SEO-BUYER-INTENT.md` adds discovery strategy, two later editorial briefs and source/measurement boundaries; `SEO-TASK-UPDATES.md` records task ownership. This brief is its content and visitor-outcome layer, with the explicit article selection confirmed by the maintainer.
