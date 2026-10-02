# Sol execution plan — reviewed 2026-10-02

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
| #8 deployment | Configure the authorized Pages source main:/docs through an available approved capability or record the exact owner action. Verify live URL, served files, deployed commit, links and robots/indexability; then record release evidence in #1/#8. Search Console verification/measurement follows available owner access. Search-engine indexing timing is not a reason to claim failed deployment or to hold back unrelated work. |
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
