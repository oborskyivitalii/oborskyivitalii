# Sol execution plan — reviewed 2026-10-02

## Implemented executive increment — 2026-10-03

The maintainer's “Зроби” is being implemented, not just planned. Visual source
`9c12900` in Draft PR #10 has exact 70% fog, stronger cheap atmosphere on the
existing 24-second phase, semantic Day/Night text/CTA controls, problem-led H1,
visible author identity, Help before Research and the restrained existing vo.
identity. [Execution](review/sol-visual-v11-20261003/EXECUTION.md) and
[SEO mapping](review/sol-visual-v11-20261003/SEO-PRESERVATION.md) own current status.
Cloudflare staging code and controlled tests are implemented; [secure setup](SITE-STAGING.md)
is still required before a real URL can be claimed. Fresh CI exercises the hosted
smoke code against a loopback Pages model, explicitly not a real deployment.
Existing public bytes are no longer
the `0333c4d` baseline. Historical evidence below is not new-source acceptance.

## Browser staging amendment — 2026-10-03

The maintainer now requests hosted staging as part of the current site work.
Read [SITE-STAGING](SITE-STAGING.md): #8 owns hosting, #14 owns the visual
iteration, and Draft PR #10 implements both. Set up a dedicated test host and
return one working whole-site URL plus a version URL. Cloudflare Pages Direct
Upload through the existing CI is the recommended default. Establish the baseline
preview early, then update it as the design progresses. This authorizes staging
setup/updates and supersedes earlier blanket no-deployment wording for staging
only. Production/merge/domain/payment decisions remain separate. Preserve #13's
production gate; staging uses successful PR checks and hosted smoke checks so
missing final device/visual acceptance does not block the review environment.
This amendment is a plan, not a claim that hosting has already been provisioned.

## Current follow-up: executive presentation and readable themes — 2026-10-03

[Issue #14](https://github.com/oborskyivitalii/oborskyivitalii/issues/14) owns the
maintainer-approved next iteration. Continue Draft PR #10 from the live head;
[v11 Sol tasks](review/sol-visual-v11-20261003/SOL-TASKS.md) contain the complete
input/scope report, exact 70% reference-slider fog formula, stronger atmospheric
background, optional measured far-field defocus, executive composition/palette
and wordmark, **Day-theme contrast repair first**, and SEO/content preservation.
The retained concept, design settings and five-page SEO baseline are linked there.
This is prepared work, not an implemented visual change; public files are unchanged.

Latest implemented source before this handoff is `0333c4d2b2318850fd56312d83fb63ca468f01a4`.
[Its verified source/evidence completion](https://github.com/oborskyivitalii/oborskyivitalii/pull/10#issuecomment-5970991843)
supersedes older pending-runtime/pipeline summaries below. Preserve the current
24-second bounded cycle, scroll/freeze behavior and all #12/#13 budgets/gates.
Old results do not validate changed public bytes. Keep #7/#8/device/release
decisions explicit and the PR Draft; no merge or deployment is requested.

## Release-pipeline requirement — maintainer request, 2026-10-03

The maintainer now requires the demonstrated audit to become recurring checks for
future production releases. [Issue #13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13)
and [SITE-RELEASE-GATES](SITE-RELEASE-GATES.md) own the implementation contract.
First fix #12's S1–S4 findings, then promote validated reproducers and measurements
into maintained PR/release checks. Continue Draft PR #10 while it is the active
candidate. The new contract supersedes S4's earlier optional-small-CI scope.
This preparation implements neither those fixes nor the new pipeline. Keep #8's
hosting activation separate, while preparing same-artifact deployment gating.

## Latest engineering follow-up — maintainer request, 2026-10-03

The maintainer likes the general v8 result and requested established-tool and
agent audits of security, quality, performance and broad device stability.
[Issue #12](https://github.com/oborskyivitalii/oborskyivitalii/issues/12) owns this
work. The [audit report](review/site-audit-v8-20261003/REPORT.md) and
[bounded Sol implementation tasks](review/site-audit-v8-20261003/SOL-TASKS.md)
record the frozen v8 baseline, actual tools/three-engine evidence, independent
review, findings and proposed acceptance budgets. Production v8 is unchanged;
fixes are follow-up work, not a completed optimization. Read this follow-up before
using earlier implementation-complete statements below. Preserve the visual
contract; keep release decisions separate.


## Current v8 — living thematic environments, 2026-10-03

The maintainer explicitly superseded the v7 still-life and no-idle-motion limits.
Symbols now form finite recursive environments; native scroll flies through
successive open structures. Each route uses eight thematic symbols, three symbol
scales and one cyan/bronze/paper material language. A bounded 48-second ambient
loop articulates immutable geometry even without scroll. The camera remains
scroll/topic-controlled. Off/reduced freezes the displayed camera and ambient
phase; hidden/print pauses without catch-up. Mobile reduces detail and repaint
frequency. No pointer camera, extra scroll spacing or new runtime dependency.

[All five pages](review/site-v1-20261003-v8-index.html) ·
[Execution and checks](review/sol-visual-v8-20261003/EXECUTION.md) ·
[Rules, formulas and original graphics sources](review/sol-visual-v8-20261003/DESIGN.md).
Public content/identity and portrait bytes are preserved except the Credits
paragraph explaining the newly authorized motion. Historical editions below are
evidence of their own revisions. Draft #10 and launch #1 remain open for visual
acceptance and the previously recorded release decisions.

Intent is recorded before implementation in [issue #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1#issuecomment-5964354028).
The 2026-10-03 direct request settles the previously optional ambient decision.
Test that the structure changes at a fixed camera, closes in both position and
velocity, and cannot grow/drift over time. Replace whole-hero-in-frame/orbital
camera expectations with finite, continuous passage through openings. Preserve
native archive reflow/history/print behavior. Deliver every standalone HTML,
not only Home or a contact sheet. Earlier no-idle rules below are historical.


## Historical amendment — v7, 2026-10-02

The maintainer rejected v6 because the scenery lost its connection to each page:
the repeated abstract objects felt interchangeable. Explicit example: Writing
should contain floating 3D books, letters and pages. This supersedes v6's emphasis
on recursive complexity as sufficient visual identity. The instruction authorizes
creative implementation in the existing Draft PR #10; #1 retains the original
[intent amendment](https://github.com/oborskyivitalii/oborskyivitalii/issues/1#issuecomment-5958821286).

Art direction: an author's study in suspension. Cyan metal, bronze accents and
light-catching paper; one faceted material/light/edge/projection language. Three
principal subject families per route, with smaller distant echoes of its own
subjects, not a shared ornamental filler:

| Route | Subject families |
| --- | --- |
| Home | Compass, ascending steps, architectural arch: orientation and building. |
| Research | Gyroscope, branching hypotheses, verification frames: control, alternatives and review. |
| Writing | Open book, loose curved sheets, extruded letterpress A. |
| Talks | Microphone, sound-wave fronts, presentation screen. |
| Credits | Quotation marks, interlocking source links, bookmarked source cards. |

These are decorative metaphors, not canonical research diagrams, live data,
audio or endorsements. Preserve all public copy, identities, portrait and local
preferences. Retain scroll-driven curved travel, Off/reduced freeze, no pointer
or idle animation, finite paths and archive reflow/history/print behavior.
Check actual rendered opening/middle/end views, both themes, mobile and actual
scroll recordings. Inspect recognizable silhouettes and framing, not just mesh
counts. Deliver v7 gallery/ZIP plus all five standalone interactive HTML links.

[Current execution and evidence](review/sol-visual-v7-20261002/EXECUTION.md).
v6 and earlier exports remain historical; their green tests are not acceptance
of a visual direction the maintainer rejected.

## Historical amendment — v6, 2026-10-02

The maintainer rejects v5's slow, linear movement and primitive shapes. Replace
it with a scroll-driven journey between viewpoints around intricate 3D
compositions, including bounded fractal/recursive detail. Angles, height and
distance must visibly change while the reader keeps native wheel/touch/keyboard
scroll. Retain Off/reduced freeze, no idle autoplay and archive reflow behavior.

Add concise verified professional roles/organizations and LinkedIn profile links
to the existing eight public discussion entries in Home and Research. Preserve
exact contribution records and avoid institutional endorsement. An unverified
employer must remain absent. Update #1 and Draft #10 with the source/intent,
implementation and checks. Deliver all five routes, both themes and mobile,
genuine motion recordings and a fresh v6 gallery/offline package. v5 remains
historical evidence; it is not the accepted visual direction.

[Current implementation/evidence](review/sol-visual-v6-20261002/EXECUTION.md).

## Next visual iteration — maintainer request, 2026-10-02

**Execution checkpoint — v5:** the maintainer subsequently instructed Sol to
review and implement these tasks and deliver every page. V1–V5 code, observed
browser cases and complete exports are implemented in the existing Draft PR #10.
Start with the [all-page gallery](review/site-v1-20261002-v5-index.html) and
[current execution/evidence](review/sol-visual-v5-20261002/EXECUTION.md). The
checklist below remains the original acceptance contract; recorded limits and
human/release acceptance are explicit in that checkpoint. Native-scroll/topic
motion is retained; no ambient choice is needed to use the candidate.

**Historical preparation task: prepare the next Sol tasks and durable agent guidance.** This
amendment records that work; V1–V5 below remain implementation tasks, not completed
features. Owner: [#1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1),
[input record](https://github.com/oborskyivitalii/oborskyivitalii/issues/1#issuecomment-5956133140).
Continue [Draft PR #10](https://github.com/oborskyivitalii/oborskyivitalii/pull/10).
Inspected head: `cfa48f1c7b61b4bc373087d4cb3b58f3812d8bbc`; its parent
`cc473070119792ea2eedb4a6998231fdf13e3f69` implements v4, and the latest commit
preserves Writing progress after result reflow. Recover the live tip before work.

The maintainer reports that white text blocks hide the moving background, depth
looks insufficient, and the delivered view exposes only Home. Required outcome:
visible dimensional scenery, readable translucent surfaces, related but
content-specific motifs across all five pages, and an easy way to inspect them.
[Source findings and artistic assessment](SITE-VISUAL-REVIEW.md#visual-follow-up--2026-10-02)
distinguish inspected code from visual hypotheses. No new rendered-site review
was possible in this planning session: local browser executables are absent.

### Precedence and open choice

- This amendment supersedes the earlier static-only Talks/Credits rule and the
  restriction to unchanged geometry on every route. Use one shared design system
  and renderer with bounded page variants, not five unrelated effects.
- Keep the seven-section Home, the approved English copy, five featured works,
  eight precise discussion entries, 27 primary archive identities plus the
  separately dated LinkedIn rendition, portrait bytes, links and research owners.
  This is visual iteration, not another content/SEO rewrite.
- Existing native-scroll/topic-only motion remains the default; no cursor camera,
  idle loop, autorotation or entry flight is inferred. **Open optional choice:**
  should scenery also move gently while the reader is stationary? Recommend
  scroll-only for a reading site. If the maintainer selects ambient movement,
  explicitly amend the idle/frame-budget contract before implementing it.
- All known routes need a meaningful motion path when native scroll exists.
  If a short route fits entirely in a viewport, show its composed static pose;
  do not add spacer height or intercept scrolling. Record this case in the
  preview; persistent motion there depends on the optional ambient decision.
  Other visual tasks can proceed without that decision.
- Day/Night/Auto, Off/reduced freeze, no-JS/Canvas content, print, hidden-tab pause,
  archive reflow correction and existing release decisions stay in force.
  Historical v3/v4 files and old review verdicts stay versioned as evidence.

### V1 — reveal the scene while protecting reading

Files: `docs/styles.css`, existing page wrappers in `docs/*.html` as needed.

- [ ] Replace broad 95–96% opaque section/hero masks with named, theme-specific
  background-alpha tokens. Leave transparent gutters, transitions and useful
  openings inside the content composition, not only tiny outer margins.
- [ ] Put stronger protection locally behind paragraphs, archive rows and form
  controls. Trial 72–86% opacity on broad reading surfaces, with denser local
  patches where needed; these are calibration starting points, not fixed targets.
  Never lower parent/text opacity. Blur is optional and must not erase the scene
  or make scrolling expensive; provide a usable unblurred fallback.
- [ ] Tune scene alpha and surface alpha together. Confirm readable normal text
  at a minimum 4.5:1 target and large text at 3:1 at the brightest/darkest scene
  crossings, including muted metadata, links and focus states. Inspect actual
  composited backgrounds, not only the base palette.

Done: Home and a dense Writing view show clear geometry in both themes without
the reader needing to hunt for it, while text remains comfortably readable.

### V2 — make depth convincing

Files: `docs/space.js`, scene styles and existing static SVG fallbacks.

- [ ] Reuse the actual camera/projection implementation. Establish three visible
  depth bands: a quiet distant structure, the principal middle motif, and one
  larger cropped foreground facet placed in free space.
- [ ] Differentiate scale, edge weight, face shading and distance contrast;
  resolve overlap/depth ordering for the chosen translucent material. Do not
  simply draw every edge over every face or rely on more tiny wireframe cubes.
- [ ] Calibrate camera position AND look-at changes so a normal scroll visibly
  changes perspective and relative positions. Keep landmarks recognizable,
  fixed world-up, stable clipping and restrained travel; no full-scene flat pan
  or scale-only substitute. The portrait remains still.
- [ ] Review start/middle/end frames and a real capture before applying the same
  treatment to all routes. If Canvas projection meets the result, retain it.
  Record a concrete quality/performance failure before adding a new renderer.

Done: the still frames already suggest volume, and the recording shows distinct
near/far movement without disturbing reading. A green geometry test is insufficient.

### V3 — compose every page as part of the same site

Shared invariants: warm-paper/graphite Day/Night palette, cyan/amber accents,
faceted planes, restrained directed lines, common projection/lighting, and the
same motion timing. Variants below are artistic proposals to calibrate, not
scientific models. Keep one small renderer with page configuration.

| Route | Page-specific motif and composition | Motion emphasis |
| --- | --- | --- |
| Home | Broad view joining the separate control and verification motifs; open space around the unchanged portrait and CTA. | Seven existing semantic stops; clear near/mid/far shifts. |
| Research | Two distinct spatial structures: feedback/control and generation/verification passage. | Move between them at relevant existing sections; no invented causal edge or implied guaranteed stability. |
| Writing | Layered planes and ordered paths suggesting a body of work, with quieter space behind the long reading list. | Retain systems/delivery/leadership/strategy focus and bounded result progress; page identity must differ visibly from Home, not only by color. |
| Talks | Broader outward ribbons or signal paths built from the same facets and lines. | A short, bounded path through existing introduction/talk content; no simulated audio, flashing stage effect or automatic video. |
| Credits | A sparse, spacious network of common geometric elements. | The calmest short path across existing content; nodes do not represent people, partnerships, clients or endorsement. |

- [ ] Make the background visible on each route, including its opening and lower
  content areas. Do not hide it entirely under archive rows or Credits' wrapper.
- [ ] Use explicit page/stop names and finite poses. Replace the known-route
  static-only fallback for Talks/Credits; retain safe unknown-page/zero-interval
  behavior. Preserve Writing progress on reflow, empty results and restoration.
- [ ] Align the no-JS/Canvas SVG with each motif and theme. Off/reduced freezes
  the current pose; initial disabled state shows the corresponding composed
  static view. Update old tests expecting one identical overview if necessary.

Done: all five pages are recognizable as one site but distinguishable by motif
and composition; changing page title or accent color alone does not meet this.

### V4 — verify motion and reading on actual pages

Files: `docs/space.js`, relevant existing tests, review evidence.

- [ ] Preserve native wheel/touch/keyboard/anchor behavior; pointer/hover/focus
  alone must not move the camera. No idle RAF work under the retained default.
- [ ] Check Off/reduced while moving, theme/resize/filter changes while frozen,
  hidden/print return, no-JS and missing Canvas. Reduced motion takes precedence.
- [ ] Inspect all five routes at 1440×900 and 390×844 in Day/Night, plus 360px
  width and 200% desktop zoom for overflow/control access. Review scroll and
  at least one Writing topic switch; confirm the latest reflow fix survives.
- [ ] Record frame-cost observations on the tested devices/viewport. Reduce
  density/DPR/blur or use a simpler fallback if required; do not infer smoothness
  or a frame-rate claim from unit tests. No new test framework is needed.

Done: no jumping, clipping flashes, text collisions, scroll blocking or runaway
frames in observed cases. Report unobserved cases instead of claiming acceptance.

### V5 — deliver a reviewable whole site

Files: `tools/build_site_previews.cjs`, `tools/build_site_bundle.py`, next review
edition, `SITE-OPERATIONS.md` and completion evidence.

- [ ] Produce the next versioned exports (v5 if still unused) and one review-only
  index linking **Home, Research, Writing, Talks and Credits**, each in Day,
  Night and interactive form. Navigation must work after extraction as well as
  in any supported preview surface. Do not deliver just Home or GitHub source
  links and call that an interactive site.
- [ ] Add a contact sheet of actual desktop renders (five pages × two themes),
  mobile renders for the same routes/themes, and a short actual motion recording
  per page or one clearly chaptered recording. Include lower-page views where
  useful. Label route/theme/viewport/commit; these must come from real HTML.
- [ ] Keep fixed-theme static previews explicitly labelled as such; they cannot
  demonstrate motion. Supply the working interactive entry plus the offline ZIP.
  Keep gallery, captures and review metadata outside public `docs/`.
- [ ] Run applicable existing content/motion/export checks, regenerate/verify
  RI, and record exact local/CI results and browser coverage in #1/PR #10.
  Preserve old artifacts and archive/portrait identities. Keep Draft until
  remaining acceptance is resolved; this task does not merge or publish.

Done: the maintainer can inspect the entire candidate without guessing filenames,
installing dependencies or mistaking a concept picture for the implementation.
If browser access is unavailable, complete authorized code/export work, document
the current failure and leave the capture/visual checks pending; do not fabricate
screenshots. This limitation does not require redoing the already completed v4.

**Execution order:** V1 and a small V2 proof on Home/Writing → V3 all-page variants
→ V4 actual browser checks → V5 complete handoff. Report each checkpoint once.
The earlier S0–S4 contract below describes the implemented v4 and retained content
requirements; follow the precedence above for this visual iteration.

## Execution checkpoint — v4, 2026-10-02

The maintainer instructed this plan. Candidate code and available checks/exports
are now implemented; [execution/evidence](review/sol-execution-20261002/EXECUTION.md)
records S0–S4 outcomes and preserved identities. Actual browser matrix is blocked
and unperformed; independent/editorial/rights/URL/base-integration/release gates
remain. Current review is [v4](review/site-v1-20261002-v4-interactive.html).
The original checklist below is retained as the approved acceptance contract,
not a claim that implementation is still absent or browser checks have passed.
Resume remaining acceptance from the execution record; do not repeat implemented work.

## Approved execution contract — historical planning text

**Execution scope: candidate implementation after the maintainer's execution instruction.**
The [latest independent review](review/sol-plan-20261002/SECOND-INDEPENDENT-REVIEW.md) records
the readiness verdict and correction checks. This plan and its inputs do not implement
the new homepage, approve PR #10 for merge, or release the site.

Owner: [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1).
Implementation: [Draft PR #10](https://github.com/oborskyivitalii/oborskyivitalii/pull/10),
branch `work/site-v1-20261001`, stacked on
[Draft PR #9](https://github.com/oborskyivitalii/oborskyivitalii/pull/9).
Use non-closing issue references. Continue the existing PR; do not create a second
launch issue or silently replace its history.

## Start here

1. Fetch current main, PR #9 and PR #10 refs, comments/reviews/checks and owning
   issues. Read root/nested `AGENTS.md` and `CONTRIBUTING.md` at the actual target.
   The reviewed website baseline was `d1ec195f34182b54c76fb04b0b95e2a2138926ef`,
   tree `73eb81c61e0a0762b637a07b308d9cd610a1886f`; #9 head was
   `0adc52500f6986a145f1873aaefb80d563da8e7e`. These identify the review, not a ref
   to reset onto. Later planning commits and other work must be retained.
2. Use an isolated checkout/worktree of the live #10 head. Check local changes
   before editing. Do not assume a scratch path from a previous chat still exists.
3. Read the [second independent review](review/sol-plan-20261002/SECOND-INDEPENDENT-REVIEW.md),
   the [first independent review](review/sol-plan-20261002/INDEPENDENT-REVIEW.md),
   the earlier [author review](review/sol-plan-20261002/FINAL-REVIEW.md),
   [content brief](review/sol-plan-20261002/CONTENT-AND-CONVERSION-BRIEF.md),
   [visual specification](review/sol-plan-20261002/VISUAL-SPEC.md),
   [current SEO evidence](review/sol-plan-20261002/SEO-EVIDENCE.md), and
   [buyer/page strategy](review/sol-plan-20261002/SEO-BUYER-INTENT.md).
4. Freeze a baseline of the 27 primary archive records (20 EN, 7 UA):
   title/URL/date/date-kind/language identities, plus the separate Thinking
   Systems LinkedIn rendition URL and date (2026-08-27). Its primary Generative
   AI rendition is dated 2026-08-30. Record schema scope, public assets,
   source/rights records and current checks. Keep this expected inventory
   independent of the edited HTML/schema; comparing those only to each other
   cannot establish preservation.
   Preserve unrelated changes. Reconcile material live differences before editing.

The issue's dated maintainer decisions own scope; this file owns the execution
sequence. Content/visual inputs give detail. Earlier four-featured/seven-mention
descriptions and v3 previews describe the old implemented edition. Earlier
statements that there are no keyword estimates describe the first research pass.
The current [evidence amendment](review/sol-plan-20261002/SEO-EVIDENCE.md) supersedes
that statement without changing the original qualitative inventory.

## Required result

The site presents the author, joins the two research directions and publications,
and helps a relevant enterprise or IT-services reader start a conversation.
The reader should recognize a problem before needing to understand UA terminology.

| Area | Contract for this iteration |
| --- | --- |
| Narrative | AI as delegation of parts of thinking/judgment; connect the author's QA/PMO/delivery experience to the research. Subprime asks how generation, understanding, verification and ownership change delivery. UA asks how to engineer and operate socio-technical Thinking Systems. Preserve first-person theses and open research status. |
| Buyer problems | AI adoption without expected delivery gains; agents whose production behavior, costs or responsibility are difficult to control. Investigate the actual cause; do not assume review capacity is every team's bottleneck. |
| Home sequence | Hero → Research/problem space → Help → Selected writing → Public discussion → About → Contact. Keep existing `#acknowledgements` usable for discussion; introduce `#help` and `#contact`. |
| Offer | Three bounded forms of work: delivery/verification diagnosis; architecture/runtime-governance review; SDLC/QA/operating-model workshop. Example outputs depend on an agreed scope. No invented cases, guarantees or numerical achievements. |
| Selected writing | Exactly five English works, in the brief's order: Thinking Systems; Externalization; Agentic Loops; Beyond Embeddings; Moat. Separate platform renditions do not occupy another featured slot. |
| Archive | Preserve 27 primary records (20 EN, 7 UA), plus the separately dated Thinking Systems LinkedIn rendition. Freeze original title/URL/date/date-kind/language identities. The existing ItemList covers the 27 primary records; the secondary link remains outside it. There are 28 linked platform renditions (21 EN, 7 UA), not 28 primary records or unique works. |
| Public discussion | Eight person/group entries: Dobkin, Armesto, Kopko, Kolb/Taller, Risch, Skelton, Montgomery, Basir. Each describes the exact public action with its source. Dobkin's public recommendation/extension and formulation credit remain distinct. No institutional endorsement or client claim. |
| Contact | `Discuss your AI challenge` → `#contact`; working `https://www.linkedin.com/in/vitaliioborskyi/`. Visible booking-unavailable message until a URL is supplied. No dead scheduler button, invented email, duration, price or slots. |
| Navigation | Home · Research · Writing · Talks; Credits/contact in footer. Optional non-sticky local row: Research · Writing · Work with me (`#help`). Preserve existing useful fragments and query links. |
| Portrait | Reuse the existing cutout and original photo; asymmetric facets, no circular/elliptical halo or orbit. The person remains still. Keep the AI-assisted derivative credit. |
| Scene | One recognizable decorative world with separate UA loop and delivery/verification motif; native scroll and explicit in-page topic changes only. Zero cursor/hover-driven camera. No implied canonical research diagram or measured simulation. |
| Motion | Day/Night/Auto preserved; Off/reduced freeze pose; no idle loop; hidden/print cancellation; same-world static fallback; all content useful without JS/Canvas. |
| SEO | Natural page-specific metadata and visible text. Use measured phrases only as qualified vocabulary evidence; retain research terms and page ownership. No keyword list, new framework, paid tool or ranking promise. |

## Work sequence and checkpoints

Complete these stages in order. A checkpoint is evidence in #1/PR #10, not a
request for repeated approval of routine implementation. If one check is blocked,
finish independent authorized work and report the exact remaining gate.

### S0 — recover and reconcile

- [ ] Complete the start-here reads and capture current refs and baseline.
- [ ] Map each row above to its source and existing file. Use the input report in
  the final review; do not import the Executive Brief PDF or its unverified numbers.
- [ ] Check current browser capability. A historical access block is not evidence
  that this session can or cannot inspect the site. Use a supported authorized
  route; preserve any actual policy block and report it rather than bypassing it.

### S1 — content, navigation and contact

Primary files: `docs/index.html`, `docs/research.html`, shared headers/footers in
all five pages, `docs/writing.html`, `SITE-SOURCE-AUDIT.md`, `SITE-SEO.md`.

- [ ] Implement the complete seven-section Home, two recognizable problems,
  strong but bounded research narrative, three offers and functional contact.
- [ ] Apply the exact five-work selection and eight public-discussion entries.
  Use a compact three-lead/five-short composition; leave details on Research.
- [ ] Keep About concise and below the useful work. Use the brief's approximate
  800–1,100-word budget as an editing aid, not a quota or a reason to remove intent.
- [ ] Update page-specific titles/descriptions/social text to the actual content.
  The existing proposed titles are a baseline; do not turn the largest volume
  phrase into the homepage topic when its intent is a poor fit.
- [ ] Verify links/fragments and compare all 27 primary identities with the fixed
  S0 inventory, including the edited-date distinction. Assert the secondary
  Thinking Systems LinkedIn URL/date separately. Check primary HTML/schema
  agreement and ItemList count 27 without adding a 28th row to repair wording.
  Reconcile public count labels with this scope. Update obsolete four-featured
  tests to assert the five exact English identities; optional Home placement of
  the secondary rendition does not make its archive retention optional.

Done when a first-time reader can identify the author, two problems, relevant
work, a useful article and a working contact route from static HTML.

### S2 — static composition and scene

Primary files: `docs/styles.css`, `docs/index.html`, shared static SVG fallback,
`docs/space.js`; prepared inputs live in `review/sol-plan-20261002/`.

- [ ] Integrate `portrait-facets-day.svg` / `portrait-facets-night.svg` or equivalent
  native geometry behind the unchanged cutout. Remove both circular pseudo-elements.
- [ ] Simplify the mobile header without shrinking usable controls or covering
  anchor targets. Protect text locally and leave readable geometry in free margins.
- [ ] Use `scene-blueprint.json` and `art-direction.svg` as uncalibrated inputs.
  Establish overview/control/feedback views of the same world before animation.
  Build the intended verification throat; a named JSON node is not that geometry.
- [ ] Author explicit `verification` and `controller` topic focus paths around
  those nodes: they are not existing camera-pose IDs. Resolve every topic target.
- [ ] Calibrate all seven Home stops, including Help and Contact, and the shorter
  mobile path. Do not conflate the decorative controller with the entire canonical
  operating model. No invented causal edge joins UA and Subprime.
- [ ] Apply the shared-page scene contract in VISUAL-SPEC: explicit page identity;
  named Research stops reuse finite poses; Talks/Credits use a static overview;
  Writing uses its topic path within visible result bounds. Define unknown-stop,
  unknown-page, zero/one-stop and empty-result fallbacks before animation. Do not
  index Home poses by another page's ordinal position or total document height.

Done when actual Day/Night HTML has a readable faceted portrait and three visibly
distinct useful scene views. If browser inspection is blocked, record S2 visual
acceptance as pending; do not claim the concept drawing proves this result.

### S3 — motion and archive interaction

Primary files: `docs/space.js`, `docs/archive.js`, `docs/writing.html`,
`docs/credits.html`, `tests/space.test.cjs`, `tests/archive.test.cjs`,
`tests/content.test.cjs`.

- [ ] Remove pointer state/listeners/camera influence on every device. Rewrite
  the old pointer-oriented test contract; test that dispatched pointer/hover
  events produce no camera change or new frame.
- [ ] Implement semantic section-local progress, camera position/target
  interpolation, fixed world-up and near-plane segment clipping. Keep native
  scroll; coalesce frames and stop after bounded settling.
- [ ] Off/reduced freezes the current pose, initial Off uses overview. Theme,
  resize, filter layout, hidden return and print return must preserve a disabled
  pose. Reduced motion overrides saved On. Theme changes only recolor.
- [ ] Check the renderer on all five pages, including unknown/unmapped stops,
  zero/one valid stop, an empty archive and coincident result bounds. These cases
  keep a finite static pose without division by zero or a document-height flight.
  Layout/filter changes preserve topic focus and the last pose if no interval
  remains; explicit topic changes retain the bounded focus behavior when motion
  is enabled. Off/reduced still overrides every fallback and topic transition.
- [ ] Integrate an allowlisted `site:scene-focus` event after a topic change,
  including initialized query state and Reset. Systems→control,
  delivery→verification, leadership→controller, strategy/All→overview. Year and
  language changes do not start a new flight. Scroll interrupts the topic
  transition; focus persists without a return timer.
- [ ] Preserve stable `#topic-*` / `#year-*` destinations before hiding duplicate
  navigation: current topic IDs sit on the very links that would be hidden.
  Use visible semantic targets or an equivalent accessible resolver, retaining
  useful native anchors without JS. An ID on a hidden element is not sufficient.
- [ ] Define URL precedence consistently: parse valid query filters, then let a
  recognized topic/year fragment override that one filter dimension. Keep the
  remaining filters and show a visible topic/year heading and empty-state
  explanation if their intersection is empty. Synchronize form, results, URL
  and scene focus on initial load, `hashchange` and browser history restoration
  (`popstate`). Filter changes/Reset must clear or reconcile a conflicting
  fragment so reload/back/forward cannot restore a different visible state.
  Preserve print-all and post-print restoration; no-JS shows the full catalog.
- [ ] Test visible landing from Research's `writing.html#topic-leadership`, all
  four topic fragments and year anchors with JS on/off, conflicting query/hash,
  a filtered-out destination, hash changes and back/forward. Assert a usable
  visible destination, not just ID existence. Remove duplicate navigation only
  after this accessible alternative works.
- [ ] Update Credits' Display preferences to describe the implemented native
  scroll/topic triggers, Off/reduced behavior and static fallback. Preserve
  portrait/derivative attribution; remove the obsolete pointer-motion claim.
  No global click interception, scroll hijacking, new engine or extra service.

Done when targeted behavioral tests cover these actual risks and the browser
shows stable transitions in both directions, while idle and reduced/off stay still.

### S4 — outputs, review and PR checkpoint

- [ ] Inspect actual HTML at 1440×900 and 390×844 in Day/Night, plus 360px and 200%
  desktop zoom. Check keyboard/focus, touch/native scroll, long EN/UA titles,
  anchor clearance, no-JS/Canvas failure, reduced/Off, hidden/print and idle.
  Include the shared scene on Research/Talks/Credits and empty/short Writing
  results; the Home composition alone cannot establish five-page behavior.
- [ ] Record screenshots and a short motion recording when supported. Otherwise
  record a reproducible browser interaction log with observed states and the
  capture limitation; screenshots/unit tests alone do not prove motion quality.
  Record browser, viewport, result and any unperformed checks. Do not claim a
  measured frame rate or full accessibility conformance without measurements.
- [ ] Produce a new named review edition (v4 if still unused). Update BOTH
  preview and bundle generators, their manifests, `review/site-v1-review.json`,
  tests and links. Preserve v3 as
  history; do not silently overwrite it. Remove the old bundle's instruction to
  move a mouse and check Credits/display-preference prose against actual behavior.
  Verify any new local query/fragment links through both export rewriters.
  Preview HTML renditions stay noindex and outside `docs/`. The offline bundle's
  `site/` folder retains exact production-source bytes; its separate `review/`
  renditions are noindex. Record that distinction instead of injecting noindex
  into production to make a blanket review-output statement true.
- [ ] Update `SITE-OPERATIONS.md`, `SITE-CONTENT-REVIEW.md`, `SITE-SOURCE-AUDIT.md`,
  `SITE-VISUAL-REVIEW.md`, `SITE-SEO.md`, `SITE-ROADMAP.md` and the PR description
  to distinguish implemented results from remaining decisions. Refresh RI last.
- [ ] Run applicable existing gates below, inspect CI on the pushed commit and
  report the actual ref/tree/checks. Check the final diff for draft leakage,
  unrelated changes and preserved public-edition identities.
- [ ] Add outcome-versus-intent and pending-review records to BOTH #1 and PR #10.
  Keep Draft and issues open while their acceptance remains. Do not self-label
  this implementation independently Confirmed. Required editorial/rights review
  belongs to the release record; process/adapter changes need independent review
  under AGENTS if the task genuinely expands into that scope.

Current commands (run from the checkout root; revise edition paths coherently):

```sh
node tools/build_site_previews.cjs
python3 tools/build_site_bundle.py
node --test tests/theme.test.cjs tests/space.test.cjs tests/archive.test.cjs tests/content.test.cjs tests/preview.test.cjs
node tools/build_site_previews.cjs --check
python3 tools/build_site_bundle.py --check
python3 -m unittest discover -s tests -p 'test_*.py'
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json build
python3 tools/repository_intelligence.py --config .github/repository-intelligence-config.json verify
git diff --check
```

Do not add a new test stack. Update tests that encode superseded intent; retain
meaningful edition, link, fallback and scheduling coverage. The candidate-stage
test currently rejects canonical/og:url/og:image; change that contract only with
the actual URL decision under #8, then test correct absolute values.

## Release and subsequent work

| Owner | When / remaining action |
| --- | --- |
| #1 / PR #10 | S0–S4 candidate implementation now, once instructed. Complete all reversible work before presenting the concrete result for release review. |
| [#7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7) | Review actual candidate sources, portrait/derivative attribution and rights; record license scope. Supplied photo is authorized for the candidate, so do not repeatedly ask to use it. Do not invent a broad reuse license. |
| [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8) | Choose permanent URL/hosting before publication; English is already settled. After that choice, implement canonicals/social URLs/images/sitemap and query canonical policy before deployment. Review metadata must not leak noindex into production. |
| #9 → #10 | Only after applicable merge/release authorization: merge #9 first, retarget #10 to main, inspect resulting diff and rerun checks. Rebase if needed without discarding newer work; do not treat old-base CI as new-base acceptance. |
| #8 deployment | After hosting activation is authorized, deploy the exact public artifact through #13's required release gate. If Pages is selected, configure Actions-based deployment rather than automatic branch publication. Verify live URL, served digests, deployed commit, links, headers and robots/indexability; then record release evidence in #1/#8/#13. Search Console verification/measurement follows available owner access. Search-engine indexing timing is not a reason to claim failed deployment or to hold back unrelated work. |
| [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2) | Next publication after first launch: PMDay blueprint/manuscript and the selected, inspected slide/PDF edition. Do not assume v33 is still the latest or release UA PR #113 by implication. |
| [#11](https://github.com/oborskyivitalii/oborskyivitalii/issues/11) | Later original delivery and production-governance guides. Check PMDay overlap first. Manual query/page/conversation review about 4–6 weeks after indexing; no automation has been created. |
| #5 / #6 | Publisher migration and broader cross-repository harness are independent follow-ups, not launch or PMDay prerequisites. |

Booking URL, final URL and release rights decisions do not prevent the complete
candidate with the agreed placeholder and relative links. Do not request English,
article-selection or existing visual-scope decisions again. No paid keyword tool,
CRM, calendar setup, AI-specific SEO file, new service page or sibling-repository
edit is required for this iteration.

## Completion report for the next Sol turn

Report the current PR URL and exact commit; S0–S4 results; preserved edition/asset
identities; actual local/CI/browser evidence; source/editorial review state; and
the concrete remaining release decisions. Separate implemented, reviewed, merged
and deployed states. Finish the authorized candidate work before asking for a
decision that only affects release.

## v9 engineering amendment — 2026-10-03

The maintainer authorized the #12 audit remediation and #13 recurring release
checks, and doubled passive motion on every page. The ambient period is now
24 seconds. Runtime checkpoint 461ac38eff9180a35bcecf2aeecff966505a954d passed
the focused runtime CI; its independent review is in the v9 engineering folder.

Maintained tools/quality, exact-source artifact manifests, locked scanners,
strict functional/performance validators, PR/reusable release workflows and an
inactive same-artifact Pages template are implemented in the v9 candidate.
Forty-three Node and eighteen Python tests passed locally. v9 preview and offline
producers replace v8 as the current edition; preserve historical v8 evidence.
The full browser/performance/capture runs remain pending CI. Physical-device
and hosted-origin gates remain explicit; no merge or publication is authorized
by these implementation results. Read the current checkpoint before resuming.

## Depth and motion amendment — 2026-10-03

The maintainer reports uneven animation on some routes and explicitly requests
camera-distance haze, pulsing recursive structures, stability and optimization
on all five pages. This extends the existing #12 runtime and #1 visual scope;
it preserves the 24-second ambient period, page motifs and native-scroll paths.
Read [the new checkpoint](review/sol-visual-v10-20261003/CHECKPOINT.md), including
the exact old CI baseline and limits, before continuing. Do not reuse v9's
performance/capture results as proof of the changed renderer. Local browser
launch is currently blocked by the execution sandbox; new actual browser
measurements and captures run in the maintained GitHub release workflow.
