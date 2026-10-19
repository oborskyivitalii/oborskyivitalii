# Issue106 — selected public materials and reciprocal article links

Owner: [issue106](https://github.com/oborskyivitalii/oborskyivitalii/issues/106).
Author decision:19October2026, explicitly implement repository-only working
campaign assets, selected public reader materials and reciprocal article links.
Role: Codex implementation/self-review; independent/editorial/rights review pending.
Inspected sources: PR107e569d5333335f16b8625960aeff063582da14514 and
PR797b3daba67da4e2bf6e35c640aa96f8b963785f5c; main0098f804.
Exact final code/check/preview refs are linked in those owning PRs and issue106.

## Intent and integration decision

AC11 appends the approved feature without replacing original AC01–AC10. Add one
strict public allowlist, one native reader block and actual/pending backlinks.
Campaign working inputs remain absent from public HTML/resources. Article first
publication remains independent of campaign completion.

PR107 owns the campaign consumer and reusable public-material contract. Because
the publisher remains unmerged, its existing PR79 receives only the shared module,
template, source tests and narrow reader/browser hook. Publisher/manuscript/media
code is not copied into PR107. The shared files have identical bytes and one
guide owner, not independently edited implementations. Future merges reconcile
those shared additions without transferring or closing publisher acceptance.

## Implementation

- `materials.json` binds the validated article edition/semantic digest and exact
  selected file, existing asset or observed external publication. Private/pending
  entries produce no block rows or public resources. No directory discovery.
- Approved public entries require source/file/review/observation pins; labels,
  descriptions and credits are escaped and visible. Stale inputs refuse a build.
- New files use existing `site/assets/publications/<id>/materials/` ownership,
  immutable article-media URLs and central rights/resource checks. No separate
  rights grant or registry is introduced. Original figures can be referenced
  directly without copying bytes; prepared print/platform inputs are unchanged.
- Reader selection includes allowlist/evidence/resource input paths in the
  article dependency identity. Only selected bytes enter the public inventory.
  Existing HTML, complete-transfer and50-resource/16MB bounds remain effective.
- Campaign validation returns `articleUrl` from the publisher canonical or null
  before observed publication. This does not alter old PDFs or post to a service;
  authored/kit adapters use that URL in the next reviewed export.

## Checks and evidence scope

Tests preceded implementation. Permanent material tests cover two articles,
absent/private/pending selection, stale edition/file/label/evidence, escaped HTML,
actual observed channel-host URLs, preview/traversal/symlink/type/byte failures,
canonical pending/section links and reuse of existing immutable image renditions.

PR79's existing article suite additionally compiles a selected file into a real
reader alias and snapshot, verifies its complete resource closure and proves that
working campaign edits leave all public generation bytes unchanged. The synthetic
reader reference selects its existing technical diagram so the shared block is
reviewable in the existing template preview without modifying PMDay or its media.
Its review record is explicitly synthetic, not real author/rights acceptance.

The existing browser journey checks the reference material in each current
desktop/mobile/Off/no-Canvas/no-JS observation, fetches its native link and verifies
the served SHA256 against the immutable URL. The report validator rejects missing,
404 and wrong-digest observations. No new browser matrix or budget is added.
Managed local Chromium installation was refused by the network allowlist (HTTP403);
hosted browser evidence must come from the ordinary preview CI, never that failed
installation or source-only fixtures. Actual run status is recorded in the PR.

CS01/02/04: single metadata/template/module owners, bounded validated data and
existing publisher/resource contracts. CS03/06: no authored CSS/runtime/clock
change; ordinary native links. CS05: pinned focused formatting. CS07: finite
items/file/resources and no network calls in build/validator. CS08/09: meaningful
failure cases, Basic/style/RI/profile checks. CS10: exact source evidence and
separate independent/visual/rights/merge gates. No new debt or budget exception.

## Acceptance and remaining work

AC11 implementation includes whitelist, common block, immutable assets and
source/pin/privacy checks; actual source/hosted results are linked in PRs. It stays
open pending applicable author/independent/rights/release acceptance. Original
unfinished campaign-kit, carousel, channel-admission, observation/correction and
aggregate reporting criteria remain open. No actual PMDay campaign or public
article release is performed by this increment.

Next: review the synthetic common block, integrate accepted publisher/campaign
baselines and prepare the first authored launch/carousel kit against the actual
approved article. Keep original content/PDF/media and publication ownership intact.

## Integration corrections before admission

The first full publisher policy on c5b07968 failed on three integration surfaces:
new public-file source metadata used a competing owner, offline image/download
links were not in the selected resource transform, and the new producer identity
was absent from the exact Color byte contract. PR107 preview39239299831 failed
that same Color package check. Those failures remain failed evidence.

Keep publication catalog ownership with ARTICLE-WORKFLOW, reuse the declared
resource closure for native/offline material links and add only the bounded
material-anchor hydration selector. The existing scene/clock does not change.
New exact Color lineages and byte-tamper negatives are self-reviewed here and in
the adjacent runtime-proof JSON; historical identities and rejection checks stay
intact. This updates CS06's earlier no-runtime-delta observation for the reader:
its narrow resource hydration selector changes, with no new loop/listener.
