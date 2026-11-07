# Short SDLC article — three illustration briefs R1

Owner: [issue169](https://github.com/oborskyivitalii/oborskyivitalii/issues/169).
Companions: [blueprint](2026-10-31-article-plan.md) and
[evidence map](2026-10-31-evidence-map.md).
Status: **concept and label specifications only; final artwork not generated**.

Use one visual grammar and progressively reveal the system. Do not attempt an
unreadable exhaustive map of every SDLC activity. These are original explanatory
models, not diagrams claiming measured causal effects or a universal process.

## F1 — A workstream is not the whole system

**Placement:** after section2, before the review example. About one-third to
one-half page; reuse its simplified composition for a possible article cover.
**Question answered:** what does the familiar lifecycle arrow leave out?

### Required composition

Upper band: the complete workstream, in a readable folded path rather than twelve
tiny boxes in one row:

Intent → requirements → design → code → review → testing → integration →
deployment → operations → user outcomes → business results → feedback to intent.

The last arrow visibly returns to Intent. An accompanying label states
"Activities overlap and repeat" so the graphic is not read as waterfall.

Lower band: four cross-cutting supports, with a few selected links into the flow:

- **Shared understanding and learning** — review, design and operations.
- **Capacity and dependencies** — people, platforms and integration.
- **Decision rights and accountability** — intent, admission/release and operations.
- **Business outcomes and economics** — user outcomes, costs and feedback to intent.

Use solid arrows for flow and visually distinct connectors for supports. The lower
band is explicitly a selection, not the complete sociotechnical map. Do not draw
AI as a single magic box before coding; the text explains delegation across nodes.

**Caption:** "The delivery stream is one view of the system. Learning, capacity,
dependencies and decision rights make the stream workable. Selected relationships
are shown; the map is explanatory, not exhaustive."

**Alt text:** "A workstream from intent through requirements, design, code, review,
testing, integration, deployment and operations to user and business outcomes,
with feedback returning to intent. Four supporting bands show learning, capacity,
decision rights and economics spanning multiple activities."

**Evidence treatment:** author's systems model, aligned with R1; no empirical
counts, measured speeds or claim that this is a required team sequence.

## F2 — Code review has more than one job

**Placement:** within section3. Approximately one-third page.
**Question answered:** what capability may disappear if we automate only the
most visible function of a practice?

### Required composition

One node **Code review** branches into:

1. **Check the change** → defects / consistency / evidence.
2. **Share understanding** → change context / design rationale / team awareness.

The second branch connects, with a different line style, to:

**Operational ownership** → **Explain and diagnose** → **Recover under pressure**.

Evidence-backed review functions use solid connectors marked E1/E2 in the
working master. The extension to ownership and recovery uses a dashed connector
with the reader-facing legend **Systems implication; not a measured causal estimate**.

Add one small callout: **A faster approval is not proof that every function was
preserved.** Do not imply that automated review destroys learning, that manual
review guarantees it, or that every engineer must know every line.

A compact alternative-mechanism note may name targeted explainers, pairing,
recovery exercises or shared design work, explicitly as candidates to assess—not
validated substitutes. Do not let this become a list that overcrowds the image.

**Caption:** "Review can detect defects and build shared understanding. Changing
the practice requires checking how its necessary functions are now supplied;
the ownership and recovery chain is the author's systems interpretation."

**Alt text:** "Code review branches into checking a change and sharing context,
design rationale and team awareness. A separately styled link connects shared
understanding to operational ownership, diagnosis and recovery. A note warns that
faster approval alone does not demonstrate preservation of these functions."

**Evidence:** E1 Microsoft Research and E2 Claude Code engineering account.
Place descriptive source links in the surrounding paragraph/caption, not tiny
unreadable URLs embedded in pixels. The diagram is original, not copied artwork.

## F3 — When acceleration consumes its own delivery capacity

**Placement:** section4, immediately after the generated-versus-admitted distinction.
Approximately one-third page.
**Question answered:** how can a local gain feed a broader deterioration?

### Required composition

A conditional feedback loop:

**Faster generated changes**
→ **More admitted work** [only if intake increases]
→ **Demand exceeds verification and ownership capacity**
→ **Waiting, rework and support load**
→ **Less capacity for learning and improvement**
→ back to **Demand exceeds verification and ownership capacity**.

A side group names potential consequences, not measured outcomes:
**People: overload** / **Product: fragility and debt** /
**Economics: higher ownership cost**.

A visibly separate interrupting path names **Bounded experimentation and capacity
rebalancing**, with possible levers **better automation / smaller changes / less
unnecessary work / explicit learning mechanisms**. Label it **Hypotheses to test**.
Show that generated work can be discarded or deferred before admission; not every
experiment becomes a maintenance obligation.

Avoid an "AI always causes collapse" reading: include a small countercase label:
**If capability and useful outcomes keep pace, the reinforcing loop need not arise.**
No speedometer, exponential curve, arbitrary percentage, queue-size estimate or
before/after causal chart without measured inputs.

**Caption:** "A conditional failure mechanism, not an inevitable outcome: admitted
work can consume the capacity needed to verify, understand and maintain it.
Interventions must be tested against system outcomes, not only local speed."

**Alt text:** "A conditional loop links increased admitted work to capacity
pressure, waiting and rework, then reduced learning capacity that can reinforce
pressure. Potential people, product and cost consequences are separate. An
experimental rebalancing path and a discard/defer exit show that deterioration
is not inevitable."

**Evidence treatment:** author's conceptual synthesis from R1 with narrower
observations E2/E4; diagram arrows are proposed relationships, not an empirical
causal identification claim.

## Production and review requirements

- Maximum three body figures; no separate decorative cover consuming another
  page. F1 may supply a simpler social/cover crop without becoming a fourth
  argument figure.
- Reuse the site's approved typography/color vocabulary at production time.
  Prefer a light background, restrained palette and distinct line patterns;
  distinctions must survive grayscale and not depend only on color.
- Author editable masters; declare the existing publisher's supported local PNG
  outputs. Keep source SVG/Mermaid/design masters internal as appropriate; do
  not inject unsupported raw diagrams into the canonical manuscript.
- Do not claim final image generation, mobile readability, rights acceptance,
  native publisher compatibility or PDF pagination from these text briefs.
- Inspect actual images at a 390px-wide reading viewport and in the native print
  rendition. Labels must remain legible without zoom. If they do not, simplify
  the figure; do not shrink the labels. Text remains available through captions
  and descriptive alt text.
- Each final image needs author/rights/credit, stable asset ID and source identity.
  Do not reuse the earlier chat-generated infographic without checking its text,
  arrows, evidence claims and page fit; it is not accepted figure source here.
- Fact/claim review verifies that F1 is a selected system map, F2 distinguishes
  research-backed functions from inferred consequences, and F3 shows conditions,
  countercases and no invented measurements.
- Before publication, inspect website, LinkedIn article and Medium renders so
  captions, evidence links and figures survive platform adaptation.

## Bounded review charter for the later figure pass

At a glance, a reader must be able to answer: (1) why a workstream is not the
whole system; (2) what defect automation does not by itself establish; and
(3) under what condition local acceleration creates broader obligations.

Ask a separate reviewer to inspect those three messages from the actual images
without the implementer's explanation. Record misunderstanding, unreadable
labels, unsupported causal interpretation and lost source distinctions. Preserve
original failures and test corrected images; do not declare the art accepted
merely because files exist or a renderer exits successfully.
