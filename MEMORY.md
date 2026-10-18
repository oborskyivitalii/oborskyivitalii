# Session memory

Dated continuity, not live authority. Last verified: **2026-10-18**.

## Snapshot

- Live main/production: `3af9100989c7dd6edc18b0b94c2d59f177cfd465`,
  tree `2a4a0d57f75eba7f651906e6ea097e88b6cf8f0b`.
  Immutable prod-2026-10-17.4 and actual publisher39071850828 succeeded.
  Canonical.ai and both.com301 redirects are live; #39 owns exact evidence.
- Sole open Draft PR79 under #5/#2 was inspected at
  `8d7a87091b461a18d618d8299a5614261fe6a451`; tree1d69853a.
  GitHub reports mergeable:false/dirty against its older main base.
  Preserve current main release/legal/security/analytics changes on reconciliation.
- Article is R10, not R8 or an unwritten draft. Draft and canonical manuscript
  match SHA2565f86917f65c51c7cf77164d9dd801c05e92d84353b96496bab458f38fd8f7b49.
  R10 source/PDF evidence lives in review/issue-2/pmday-candidate-20261015/README.md.
  Prior standalone PDFs are review artifacts, not managed current site acceptance.
  R10 PDF delivery was not established by this planning pass.
- PR79 already has generation reuse and content-vs-platform PR classification.
  Its guide retains ordinary staging/production gates; independent lightweight
  production content admission is not delivered.
- Planning owner: review/issue-5/2026-10-18-release-segmentation.md.
  This pass changes planning/catalog/RI/memory only, not article/runtime/workflows.
  No rebase, preview, merge or production action is claimed.

## Decisions

- User prioritizes publishing the new site article quickly while retaining a
  clean engine/assets/templates/content separation and future independent lanes.
- Recommended sequence: minimal contract + reconcile PR79/current R10 in parallel,
  current HTML preview/rights/reader acceptance, first article via existing
  controller, then independent content/media production lane and real reuse proof.
- Recommendation is one static monorepo with versioned platform/content/media
  artifacts and one atomic assembler. Microservices/new hosting/CMS are not a
  selected prerequisite. Source/rights/review decisions remain with their owners.
- First article adds a reader/runtime capability: use applicable source and
  bounded staging checks honestly. Later content-only changes can use targeted
  checks with exact compatible-platform proof; unknown/shared-code changes escalate.
- Keep stable articles/<slug>.html URLs, one canonical manuscript and declared
  media/semantic editions. Existing PR79 source/export history stays preserved.
- Full diagnostics remain optional under the accepted17October release policy.
  Do not revive obsolete ribbon/shard/GTK campaigns for this planning task.
- #7/#13 are closed completed for shipped scope; #45/#49 closed superseded.
  #101 Turnstile is closed not applicable. #39 final independent review stays open.

## Open work

- #2: complete R10 editorial/source/figure/rights and current HTML publication;
  original PDF/deck/upstream criteria remain separately reconciled.
- #5/PR79: reconcile onto actual main, retain minimal reader/publisher integration;
  then AC16–AC20 versioned boundaries, content-only production, media, assembly,
  concurrency/rollback. Existing AC01–AC15 keep their exact historical scope.
- #102: extensionless entry analytics gap; plan declared article-path coverage.
  #103/#8: actual Windsor/Google property access, indexing and query baseline.
  #104: conversion design after article/template contract; not a publication block.
- #97 owner MFA action can run independently. #98 disclosure file and #99/#100
  bot/crawler policies are not prerequisites for the article.
- #6 harness follows settled publisher contracts; #11 guides use the resulting lane.
- #36/#41 retain scoped current visual/editorial evidence obligations. No new
  first-reader/device or independent approval is invented by source inspection.

## Next session

1. Revalidate main and PR79 head; read owning #5/#2 dated plan and R10 evidence.
2. Inventory and reconcile unique publisher changes against released main,
   preserving current production controller, legal records, source/security fixes.
3. Finish R10 review in parallel, reach a current immutable HTML preview, then
   follow actual owner acceptance/release route. Full lane separation is later.
4. Map added AC16–AC20 before their implementation; use targeted meaningful
   content/baseline/compatibility/concurrent-publication negatives.

## Maintenance

Keep these five sections and at most120lines. Rebuild/verify RI after indexed
changes; use live issues/refs for current acceptance. Never store secrets.
