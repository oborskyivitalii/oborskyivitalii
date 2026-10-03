# Sol implementation task: executive presentation, atmosphere and readable themes

Prepared 2026-10-03. **Approved direction; implementation pending.**
Owner: [issue #14](https://github.com/oborskyivitalii/oborskyivitalii/issues/14).
Parent: [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1).
Continue [Draft PR #10](https://github.com/oborskyivitalii/oborskyivitalii/pull/10),
`work/site-v1-20261001`, stacked on workflow PR #9. This task does not open a
parallel site PR. [SOL-HANDOFF](../../SOL-HANDOFF.md) remains the execution owner.

## 1. Maintainer input, scope and authority

The maintainer accepted the demonstrated direction and asked for an implementation
task in the repo/issues/PRs and a prompt for Sol. Exact follow-up:

> Атмосферний фон можно якийсь сильніше насправді ніж зараз. Туман десь на 70% по цьому повзунку.

> Ще на денній темі частину тексту тупо не видно бо вона теж біла на білому фоні:) то треба тут обережно. Не забувай також про СЕО наші оптимізаціі щоб ми іх не втратили переписавши текст

Audience: company leadership, VPs and directors at enterprise software teams and
IT services companies. The visitor should recognize a business problem, see a
credible bounded offer, understand the research connection and contact Vitalii.
Keep the living spatial identity; improve visual hierarchy, reading comfort and
professional restraint. This approval covers implementation of the direction;
do not ask again about fog, atmosphere, the target audience or the agreed layout.

This is the bounded input/impact report required by CONTRIBUTING. The original
input is the maintainer's direct 2026-10-03 feedback and the in-session concept,
not new external research. Inspected scope: the five `docs/` routes, shared CSS,
theme/scene code and favicon; existing content/source/SEO owners and buyer-query
plan; export/capture/quality producers; PR #9/#10 and open issue inventory. The
reported Day defect is user evidence: its affected selectors and reproductions
still need to be recorded, not inferred from an old passing screenshot.

Affected owners: site presentation and conversion content here; reliability #12;
release evidence #13; URL/indexing/hosting #8; rights #7. No new UA definitions,
Subprime evidence claims, research figures or protocols are accepted or changed.
The recommendation is to include the visual/contrast changes and narrow text
changes to semantic equivalents. Preserve research/source ownership. New guides,
Search Console validation and keyword research remain #11 after launch/PMDay #2.

### Frozen preparation baseline

- Commit: `0333c4d2b2318850fd56312d83fb63ca468f01a4`.
- Tree: `a607b35db240a0441c37a909838b4c4a3296be25`.
- Public artifact digest: `ee36c6bececcb797aa409418cdb94278b37608d2abf568ecaf0ad69fc8469164`.
- [Verified previous increment](https://github.com/oborskyivitalii/oborskyivitalii/pull/10#issuecomment-5970991843)
  and [full evidence run](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37134086350).

Those checks are a comparison baseline, not acceptance of this new design. This
preparation changes no public site bytes. Read the live branch/diff/comments at
startup, preserve intervening changes, and append a new baseline if needed.

### Retained materials

- [Original editable concept](reference-fragment.html) and
  [standalone reference](reference.html): the actual earlier Home mockup, with
  copied baseline geometry and supplied portrait, retained unchanged. The original
  slider opens at 100; **set it to 70** for the accepted fog reference. Its
  atmosphere remains the demonstrated 0.55 baseline, which must become stronger.
- [Design settings](design-settings.json): exact visibility formula, sample
  values, palette and clearly distinguished approved/tuning values.
- [SEO/content snapshot](seo-baseline.json): titles, metadata, headings, visible
  text, links, anchors, language, JSON-LD and file identities for all five routes.
- [Input manifest](INPUT-MANIFEST.json): exact source/reference hashes.

The concept is a direction reference, not a replacement website. It shows a
frozen Home view, abbreviated copy and illustrative navigation; it does not prove
all-page behavior, motion, performance, accessibility or SEO acceptance. Do not
copy its inlined renderer, abbreviated text or host wrapper into `docs/`.

## 2. Read before editing

Read root/nested AGENTS, CONTRIBUTING, SOL-HANDOFF, SITE-VISUAL-REVIEW,
SITE-SOURCE-AUDIT, SITE-SEO and SITE-RELEASE-GATES. Read these existing inputs:

- [Buyer intent and page mapping](../sol-plan-20261002/SEO-BUYER-INTENT.md),
  [query inventory](../sol-plan-20261002/SEO-QUERY-MAP.csv),
  [measured-evidence limits](../sol-plan-20261002/SEO-EVIDENCE.md),
  [content/offer brief](../sol-plan-20261002/CONTENT-AND-CONVERSION-BRIEF.md).
- [Depth/motion checkpoint](../sol-visual-v10-20261003/CHECKPOINT.md), latest
  #12/#13 comments and [quality-tool instructions](../../tools/quality/README.md).

Later dated amendments supersede older v7/v8 limits and pending-status prose.
The existing ambient cycle is **24 seconds**, not the historical 48 seconds.

## 3. S0 — freeze content and reproduce the Day defect

1. Record the actual starting commit, tree and public hashes. Compare the saved
   SEO snapshot to that source; preserve both if newer content has arrived.
2. Record the exact page, viewport, theme/control state, text selector, computed
   foreground/background and screenshot for each white-on-white or low-contrast
   defect. Check the real pages and exported HTML; distinguish a product defect
   from a preview-wrapper inheritance defect and fix the affected surface.
3. Cover Home, Research, Writing, Talks and Credits; hero, body, headings, offers,
   nav, primary/secondary CTA, theme/motion controls, archive filters, badges,
   metadata, contact, acknowledgements and footer. Include normal, hover, focus,
   visited, selected and disabled states where they exist.

Exit: an inspectable baseline and defect list. A historical green browser run is
not a reason to dismiss the maintainer's report.

## 4. S1 — fix text contrast before visual enhancement

- Use explicit semantic foreground/background pairs for page, reading surface,
  muted text, link, primary button and selected controls. Avoid inherited white
  text over a pale surface; keep primary-button ink separate from page ink.
- Check actual composited pixels over the brightest/darkest scene positions and
  atmospheric gradients. Transparent panels are not equivalent to solid paper.
  Keep sufficient local reading surfaces and clear zones around text/portrait;
  adjust surface alpha or scene placement, never whole text/control opacity.
- Target WCAG AA text contrast: at least 4.5:1 for normal text, 3:1 for large text;
  meaningful control boundaries/focus indicators need appropriate contrast too.
  Automated checks supplement actual scene-state inspection; they do not prove
  contrast on an animated/translucent background by themselves.
- Verify explicit Day/Night and the existing Auto behavior based on visitor-local
  hours, including time-zone/day-night boundaries and manual-choice persistence.
  Differing system preferences must not silently replace that contract with the
  mockup's system-theme shortcut. Check repeated switching, initial CSS/theme
  load, no-JS/Canvas-failure fallback, reduced/off,
  print and the separate exports. Prevent flashes or cached dark-theme text in Day.
- Add targeted regression coverage for the reproduced failure and theme state,
  preserving existing tests. Do not substitute a token-name assertion for the
  actual computed/visible result or require exhaustive new tests of styling.

Exit: readable text/actions across all five routes with before/after evidence.

## 5. S2 — stronger atmospheric space with calibrated fog

### Exact meaning of the accepted 70%

For camera-space depth `z`, let `s(t)` be smoothstep after clamping `t` to [0,1]:

```js
const smooth = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};
const oldVisibility = z => 1 - 0.94 * smooth((z - 12) / 88);
const strongVisibility = z => 1 - 0.975 * smooth((z - 8) / 56);
const acceptedVisibility = z =>
  0.30 * oldVisibility(z) + 0.70 * strongVisibility(z);
```

This exactly corresponds to the reference slider at 70. It is not a uniform
0.7 opacity, a 70% reduction in visibility, or a new physical density parameter.
In the prototype the existing alpha was multiplied by the ratio of blended to
old visibility. In production, replace the shared visibility function coherently
rather than applying old fog twice. Apply it to faces, outlines and seams with
the existing clipping/detail fades intact. Use the saved sample values to verify.

Foreground forms stay clear; mid-distance loses contrast; far structure merges
into the theme's atmosphere. Inspect several depths and real scroll positions,
not just the opening screen. Fog color must match the resolved Day/Night palette;
do not lay a white veil over Night or fog DOM text/portrait/controls.

### Atmosphere

- Add broad, low-frequency gradient fields and a soft horizon/depth transition
  around the existing world, visibly stronger than the demonstrated reference.
  Original `.ad-air` opacity is 0.55. Around 0.80 is a **proposed starting tuning
  value**, not a maintainer-prescribed exact opacity or guarantee of contrast.
- Use theme-aware warm-paper/cool-air color in Day and blue-graphite/teal in Night.
  Start with CSS gradients or a small cached layer, without external textures,
  another detailed landscape, heavy fractal geometry or a new rendering engine.
- Preserve five recognizable page-specific worlds. Reduce visual density in
  reading zones and the prominence of tiny repeated details, especially Writing
  and Credits; retain the existing recursive identity and movement.
- Any slow atmospheric change must use the existing bounded time/phase and share
  Off/reduced, hidden, print and device-hold behavior. No independent forever CSS
  animation/rAF that keeps running after motion is disabled. Static atmosphere
  remains available in reduced/no-JS mode without extra CPU work.

### Optional economical defocus

Implement fog/atmosphere first. If the result still needs defocus, trial at most
one half-resolution-or-lower far-field buffer, composed behind sharp near/middle
geometry on the existing cadence. Feature-detect unsupported paths and retain
fog-only fallback; do not require OffscreenCanvas or GPU support. No per-object
Canvas blur, full-page filter/backdrop blur, per-frame texture allocation, or new
runtime dependency. Record the visual comparison, extra memory/work and measured
cost with/without blur on mobile and CPU-throttled profiles. Keep blur only if
visibly useful and within unchanged budgets; otherwise document its rejection.
Optional blur must not delay completion of the required fog/atmosphere work.

Exit: clear near/middle/far separation, more visible atmospheric depth, unchanged
reading contrast and scene lifecycle, measured blur decision.

## 6. S3 — composition, colors and author identity

- The hero leads with a recognizable business problem and the offer. The concept
  headline “AI tools everywhere. Better delivery? Harder to tell.” is an approved
  direction, not a requirement to remove discoverable topic language. Keep the
  author name in the header/title/Person data and visible about content. One H1
  per page; a problem-led Home H1 may replace the name H1 with semantic mapping.
- Retain the meaning of the existing offer: investigate why AI adoption is not
  improving delivery, **rebalance review and ownership**, and define controls for
  agentic systems in production. Name enterprise software teams and IT services.
  The reference's shorter sentence is incomplete for production SEO/content.
- Bring “Where I can help” and its three bounded offers forward, before the long
  research exposition. Keep the fundamental-shift introduction and the connection
  to QA/PMO/delivery experience, research directions, five featured works, eight
  source-bound discussion entries, about and contact. Reorder/condense; do not
  silently delete those sections. Retain anchors and update camera section order.
- Use one clear primary contact invitation: “Discuss your AI challenge” to the
  existing working contact route/LinkedIn. Keep no invented booking link, email,
  client result, price, guaranteed outcome or free-consultation promise.
- Retain the supplied portrait and its aspect ratio/alt/dimensions. Do not
  generate or alter the face. Keep the 20+ years statement in its existing bounded
  self-description, without inventing current roles or performance metrics.
- Use the reference's restrained paper/ink/subdued teal/bronze palette as starting
  tokens. Test actual pairings; decorative bronze is not automatically safe for
  small body text. Night uses blue-graphite and soft light text. Reduce saturated
  cyan/yellow prominence and heavy game-like glow while keeping depth/materials.
- Refine the simple `vo.` wordmark with full name, restrained bronze dot and
  readable monochrome/small variants. Extend the existing code/SVG identity and
  favicon; check 16/32 px and both themes. Do not build a new icon/logo system or
  combine UA/Subprime identities into a corporate mark. No new font service.
- Check the package as a whole at desktop and 320–390 px: what the work is, whom
  it helps, credible evidence and contact should be easy to find. Avoid walls of
  tiny cards, decorative dashboards, empty promises or reducing legibility for
  “premium” appearance. No claim of measured conversion uplift without data.

Exit: a coherent five-page presentation for the stated executive audience,
recognizable living scenes and clear research/source boundaries.

## 7. S4 — preserve SEO and meaning through the copy/layout changes

Create `SEO-PRESERVATION.md` beside this task during implementation. Map each
changed heading/paragraph/metadata field to its previous purpose and new location;
explain intentional equivalent wording. Compare the saved machine snapshot and
the actual starting head to the finished candidate. Keep exact publication/source
inventories separately from permitted editorial paraphrase.

| Surface | Preserve and verify |
| --- | --- |
| Home | Author identity; AI delivery governance and agentic operating models; adoption without delivery gains; review/verification/ownership; agents in production; enterprise/IT-services audience; three bounded offers and working contact. |
| Research | Uncertainty Architecture and The Subprime Code Crisis, with owning repo links; Thinking Systems, AI architecture/control theory, Theory of Constraints, socio-technical operating models and the existing useful explanations. |
| Writing | 27 primary records: 20 EN/7 UA; separate Thinking Systems LinkedIn rendition dated 2026-08-27, making 28 linked renditions (21 EN/7 UA). Preserve exact original titles, URLs, dates/date kinds, language and 27-entry primary ItemList. Do not call these 28 unique works. |
| Talks/Credits | Real events/materials/languages, attribution, contribution boundaries and evidence links. Preserve eight public-discussion entries and distinguish recognition from endorsement/client relationships. |
| Site-wide | Unique meaningful title/description, exactly one H1 and semantic H2/H3 hierarchy, OG/Twitter aligned to visible content, truthful JSON-LD, Person identity/sameAs/knowsAbout, image alt/dimensions, crawlable HTML navigation and content, fragment IDs, archive query/history and source links. |

Keep all five exact featured English works and the separately dated LinkedIn
rendition. Preserve EN/UA visible labels, `en`/`uk` language codes and `lang="uk"`
on Ukrainian text. Do not move useful copy into Canvas, images or JS-only content.
Do not solve shorter copy by hiding keywords or adding a keyword list/meta tag.

Preserve the existing query-cluster evidence and its limitations. Qualitative
queries are hypotheses, provider estimates are not Search Console/buyer-demand
proof, CPC currency remains unknown. No paid research is needed for this task.

The permanent origin is still #8's decision. Do not invent canonical/social URLs,
hreflang, sitemap origin or a hosting choice. Do not remove a later authorized
origin if one has been added on the live branch: reconcile with #8. Preview copies
stay outside `docs/` with `noindex,nofollow`; public files must not inherit it.
Do not add new service/guide pages or import full external article bodies.

Exit: inspectable semantic mapping, exact publication/source identity preservation
and passing existing content/archive/schema/export tests. An unchanged keyword
count alone is insufficient evidence.

## 8. S5 — verification, deliverables and resumable handoff

Likely implementation paths: `docs/styles.css`, `docs/space.js`, the five public
HTML routes, `docs/assets/favicon.svg`; `docs/theme.js` only for an actual theme
defect; existing fallback/export generators and focused tests as needed. Keep
current optimized shared transforms, clipping, fractional cadence, adaptive tiers
and stable depth sorting. Do not replace them with the simplified reference code.

Preserve native scrolling, topic navigation, finite geometry, reversible camera
endpoints, immutable 24-second periodic motion and no pointer camera. Off/reduced
freezes the **displayed pose, phase and detail** exactly; hidden/print pauses without
catch-up. No extra scroll spacers, permanent-static route or blanket opaque page
mask. Maintain useful SVG/no-JS/Canvas-error fallback and controlled mobile detail.

The maintained [budgets](../../tools/quality/budgets.json) and
[release contract](../../SITE-RELEASE-GATES.md) are authoritative and unchanged:
100,000 raw HTML bytes/route, 250 SVG elements, 2,000,000 raw asset bytes,
800,000 route gzip bytes; Lighthouse median LCP ≤2500 ms, TBT ≤200 ms, CLS ≤0.1;
paint callback p95 ≤33 ms, idle callback busy ≤20%, 300-second soak. Treat these
as ceilings, not work to consume. Do not loosen budgets or remove cases to pass.
Record actual frame cost/paint intervals/CPU work; CSS motion or averaged FPS
alone cannot establish resource economy. Prior measured rates are lab baselines,
not a new universal 30/60 FPS promise.

Use the existing producers/tests/workflows rather than building a parallel audit:

1. Run targeted regressions while changing code. After changes stabilize, refresh
   fallback/previews/bundle and RI in the documented order; run maintained content,
   theme, motion, archive, export, quality and Python checks. Preserve failing
   records and distinguish any infrastructure limitation from product failure.
2. Request one fresh full evidence run for the actual final source: build/static,
   Linux Chromium/Firefox/WebKit, Windows Chromium/Firefox, macOS WebKit,
   performance/soak and captures. Repeat only to resolve a failure or changed
   source, not for optional reassurance. Do not relabel old evidence as new.
3. Inspect all 20 route × Day/Night × desktop/mobile opening views plus readable
   mid-page/contact/footer states and actual scroll/ambient recordings. Include
   320px/reflow, archive filter/history, long titles, focus, no-JS/fallback,
   reduced/off and print. Record exact selectors/states for resolved Day defects.
4. Deliver five separately openable interactive HTML files, ten fixed-theme
   files, one all-page gallery, source-bound captures/recordings and the offline
   ZIP through existing export tooling. Check internal links and fragment IDs.
   Refresh living status/docs/manifests consistently; preserve historical
   editions/results. Provide `EXECUTION.md`, `SEO-PRESERVATION.md`, contrast
   findings and optional-blur decision with exact source/ref/measurements.
5. Obtain and record the applicable independent source/evidence review through
   the existing process. Do not self-label implementation as independent review.
   Physical iOS Safari/Android Chrome, native zoom/real print/hidden-tab checks,
   immutable external review/device records, rights/visual acceptance and #8
   hosting remain explicit release requirements until actually supplied.

Record each completed S0–S5 increment, commit/ref, checks, remaining work and next
action in issue #14 and PR #10 so interruption does not lose progress. Reference
#12/#13 for performance/gates without duplicating their owners. PR #9 remains the
workflow dependency; its previous review does not cover this visual work.

## Completion checklist

- [ ] S0: current-source inventory and Day defect reproductions recorded.
- [ ] S1: all relevant Day/Night/Auto text and controls readable, including exports.
- [ ] S2: exact 70% fog and stronger atmosphere; optional blur decision measured.
- [ ] S3: coherent executive hierarchy, palette, wordmark/favicon and all five worlds.
- [ ] S4: SEO semantic map and exact content/source inventories reconciled.
- [ ] S5: fresh source-bound checks, captures/exports/bundle and review recorded.

Do not mark these implementation checks complete from this planning commit.
Keep non-closing issue references and the PR Draft. No merge, hosting activation
or deployment is requested. Finish the authorized implementation and handoff;
leave only genuine unmet review/device/release decisions explicitly open.
