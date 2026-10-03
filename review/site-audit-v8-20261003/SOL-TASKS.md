# Sol implementation handoff — v8 engineering audit

Owner: [issue #12](https://github.com/oborskyivitalii/oborskyivitalii/issues/12).
Continue Draft PR #10 and preserve its base relationship to #9. Read root AGENTS,
SOL-HANDOFF, [REPORT](REPORT.md), [independent review](INDEPENDENT-REVIEW.md),
and current live issue/PR state first. Audit baseline is remote
`6176cb209a1d46a1ae056c3008c77e20281b6f93`, tree
`1bec5de6726283a830c97979350c3b8b25d7c28c`. Audit files are evidence, not a new
rendering implementation. Preserve newer unrelated work and historical v8 evidence.

**Maintainer amendment, 2026-10-03:** recurring production release checks are now
required under [issue #13](https://github.com/oborskyivitalii/oborskyivitalii/issues/13)
and [SITE-RELEASE-GATES](../../SITE-RELEASE-GATES.md). S1–S4 below remain the concrete
runtime remediation sequence; the release contract expands S4's earlier small-CI
suggestion. Continue PR #10, fix and remeasure first, then implement the reusable
gates. Preserve the original v8 reports and create new candidate results separately.

The maintainer likes the general design. Preserve eight thematic motifs per route,
recognizable recursive environments, native scroll-through camera, periodic
48-second ambient articulation, Day/Night, content/links and useful static display.
The requested optimization does not authorize generic replacement scenery.

## S1 — make initialization and failure handling reliable

1. Correct stylesheet/deferred-script ordering in all five public heads. Retain
   early theme application so the first paint has the appropriate theme.
2. Make palette/fill-cache updates atomic and validate complete colors before
   committing. Gate resize/load/observer scheduling until renderer initialization
   has completed. Do not start autonomous motion without its usable control.
3. For delayed CSS, keep fallback and initialize once styling is available. For
   unavailable CSS/context, remain readable/static. Add one bounded post-activation
   drawing failure/context-loss recovery path; avoid endless retry/error loops.
4. Correct the queued-target rapid-reversal bug. Clear only the obsolete camera
   transition when the latest target equals current pose; keep ambient phase.
5. Remove unguarded Object.hasOwn dependency or gate the enhancement explicitly.

Verification: existing tests plus focused delayed/failed CSS, same-frame reversal,
mid-transition retarget, missing capability and post-activation rendering-fault
cases. Browser checks must cover all three engines and both themes. Confirm the
Motion control remains truthful; Off/reduced cannot be overridden by load,
resize, observer, recovery or quality changes.

## S2 — remove expensive fallback markup and avoid layout jumps

1. Replace the full desktop projection embedded as thousands of SVG paths with
   a small deterministic static rendition. Consider reduced geometry or external
   theme-aware assets; select on measured size/DOM and actual visual results.
   A compression-only change leaves the DOM problem. Retain meaningful route
   identity, no-JS/no-Canvas content, themes, navigation and print behavior.
2. Aim for ≤250 decorative SVG nodes or an external asset, and ≤100 KB raw HTML
   per route. These are proposed project budgets; document measured exceptions.
3. Isolate Writing's 0.237 mobile layout shift using a trace. Inspect initial
   filter/navigation replacement and header controls. Reserve final layout space
   or apply enhancement state before visible layout changes, preserving deep links.
4. Check portrait sizing/delivery and favicon after the two larger causes; do
   not sacrifice the supplied image or crop simply to improve a score.

Verification: baseline-versus-candidate HTML bytes, gzip bytes, DOM nodes, LCP,
TBT and CLS; normal/default and direct filtered Writing entry; full content/link
identity; desktop/mobile Day/Night and static fallback visual comparison.

## S3 — optimize continuous rendering and degrade predictably

1. Profile actual painted callbacks, not all RAF callbacks. Separate scene
   generation, projection/clipping/sort, Canvas submission and layout work.
   The baseline probe recognizes callbacks named `frame`. A refactor must update
   that probe or remove the name dependency; require a positive nonzero paint/
   callback check with Motion on before interpreting zero-cost candidate results.
2. Prioritize coarse object visibility checks and equivalent work reuse before
   projection; reduce avoidable arrays/maps/closures and repeated color work.
   Preserve clipping and correct painter ordering; prove visual equivalence.
3. Use a bounded draw budget, retaining the latest scroll target. Keep capable
   devices visually responsive; lower optional detail/cadence when repeated
   observed draw cost exceeds the chosen budget. No user-agent sniffing required.
4. Use hysteresis and cooldown for quality changes. **Do not directly toggle
   `worldFor(page, compact)`: its root count/angles change composition.** Preserve
   macro object IDs/centres, camera and phase; simplify facets/leaves/resolution.
5. When Canvas remains usable, severe budget degradation should retain the last
   valid displayed pose. Unrecoverable rendering failure should reveal a reliable
   static fallback. These paths must not erase the saved user's Motion preference.

Verification: exact same measurement harness/configuration; all five routes at
desktop, mobile and mobile ×4; sustained idle and scroll, input/long-task traces,
Motion off, resize, theme, filters and a longer soak. Targets: median of three
mobile Lighthouse runs with LCP≤2.5s, TBT≤200ms, CLS≤0.1, performance≥90 as a
secondary signal; mobile ×4 draw p95≤33ms and sum of idle animation callback
durations divided by sampled elapsed wall time≤20%
after settling or a lower reviewed tier. Record failures rather than loosening
thresholds after seeing the candidate. These targets need device validation;
do not label callback cadence as display FPS or battery measurements.

## S4 — targeted maintainability, accessibility and recurring checks

1. Remove verified unused code/arguments and split the renderer's lifecycle,
   projection and motif construction where it helps maintenance. Avoid a new
   framework or thousands of cosmetic changes just to silence all style rules.
2. Consolidate duplicate CSS rules in original cascade order; verify both themes,
   breakpoints and print. Do not automatically reorder specificity warnings.
3. Correct Writing's generic-div ARIA label; inspect decorative wordmark naming
   and provide a local favicon. Test unfiltered and filtered archive states.
4. Implement the required PR and release stages from
   [SITE-RELEASE-GATES](../../SITE-RELEASE-GATES.md): pinned security/quality tools,
   deterministic budgets, all three browser engines, release OS coverage, repeated
   startup and sustained-motion measurements, and same-artifact deployment gating.
   Raw metric gates, coverage and valid evidence matter more than a single score.
5. Record scope-based scanner suppressions with reasons. Scanner alarms on trusted
   VM fixtures or styling conventions are not confirmed runtime vulnerabilities.

## Completion evidence

- Compare exact baseline/candidate refs, hashes and identical content/links.
- Re-run normal/delayed/blocked CSS in Chromium, Firefox and WebKit; no unexpected
  errors or animation without an accessible control.
- Present before/after load and sustained-animation measurements, including
  worst cases and actual throttling/profile settings. Retain raw reports.
- Refresh versioned all-page preview exports and motion evidence after source
  changes; review mobile Day/Night, weak-device tier and static fallback visually.
- Obtain separate review of the fix diff and evidence. Record remaining unknowns.
- A physical iOS Safari/iPad and modest Android smoke test remains required for a
  physical-device claim. Say exactly if it was not performed.
- Update #12 and PR #10 with intent versus outcome; no merge, deployment, URL or
  licensing decision is implied. Keep launch #1's separate release acceptance.
- Implement and report the reusable checks under #13 after the fix regressions
  are valid. Prove that missing reports, invalid probes and controlled failures
  block release; keep physical-device/hosted-origin evidence honest and explicit.
