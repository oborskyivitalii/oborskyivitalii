# Connected page space — maintainer amendment, 4 October 2026

Owning intent: #14; implementation stays in Draft PR #10. Runtime continuity
belongs to #12, repeatable checks to #13, hosting to #8. Baseline: `46381bd3`.
User authorization and bounded input report: issue #14 comment 5975175207.

The maintainer requests a persistent navigation header, five content/scene routes
in a common three-dimensional space, shared multiscale angular geometry, forward
and backward inter-page flights and a short text transition. Staging remains
unconfigured; deliver every revised route as an individually usable HTML file.

Implementation contract:

- Preserve the five semantic motif families and exact existing publication text,
  metadata, links, language and dates. Shared geometry supplements those motifs.
- Keep one header, theme controls and Canvas across route changes. Real HTML
  routes, normal links, no-JS access, native scrolling and modified clicks survive.
- Lazily load route content and a bounded number of finite scene models. History,
  direct URLs, archive queries/fragments, focus and announcements remain useful.
- A fixed spatial route order determines forward/backward travel. Rapid clicks
  retarget the displayed camera; stale network responses cannot replace content.
- Keep the immutable 24-second ambient loop and existing fog/palette. Off/reduced
  freezes animation; an explicit route choice may display its new static room.
  Hidden/print pause without catch-up. One 3D RAF scheduler remains responsible.
- Export each interactive HTML with all five route payloads and embedded assets.
  A same-file `view` query supports navigation/history without sibling fetches.
  Ten static alternatives and the all-page gallery remain available.
- Update source regressions, browser navigation/cleanup/failure checks, SEO mapping,
  artifact inventory, size accounting and reproducible export manifests. Keep all
  existing security/performance/platform budgets and independent acceptance gates.

No research integration, merge, production/DNS/payment changes or inferred hosted
acceptance. Prior execution evidence is a baseline only. Current evidence and
remaining limitations will be recorded in EXECUTION.md after validation.
