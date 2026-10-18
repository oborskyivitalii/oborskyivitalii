# Article-first delivery and independent static release lanes

## Routing and inspected material

- Owner: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5);
  editorial deliverable [#2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2);
  execution remains [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
- User direction, 18 October 2026: include the new article, separate engine/assets/
  templates/content pipelines, permit an article release without rebuilding the
  engine or full regression, and prioritize publication without obstructing later
  engineering. Microservices are a question to evaluate, not a chosen migration.
- Inspected production/main: `3af9100989c7dd6edc18b0b94c2d59f177cfd465`,
  tree `2a4a0d57f75eba7f651906e6ea097e88b6cf8f0b`; release
  [prod-2026-10-17.4](https://github.com/oborskyivitalii/oborskyivitalii/releases/tag/prod-2026-10-17.4).
- Inspected PR79: `8d7a87091b461a18d618d8299a5614261fe6a451`,
  tree `1d69853a78fae39798fcb558445a3a6c4a0553ca`; GitHub reports Draft,
  mergeable:false/dirty, 62 commits and283 changed files against its older base.
- R10 is the current complete manuscript, not an unwritten article:
  `site/publications/pmday-ai-both-sides/manuscript.en.md`. Its source
  SHA256 is `5f86917f65c51c7cf77164d9dd801c05e92d84353b96496bab458f38fd8f7b49`.
  Earlier hosted previews and standalone review PDFs are different artifacts;
  this inspection does not establish completed R10 PDF delivery.
- Read root README/AGENTS/CONTRIBUTING/MEMORY, repository map, site source,
  release/check-profile owners, #2/#5/#6 and the13October content-release record;
  inspected current builder, content baseline/classifier and article contracts.
- Role: Codex root, source-based self-analysis. No independent review, new
  hosted acceptance, merge, benchmark or production change is claimed.
  This commit records a plan and continuity; publisher/runtime bytes are unchanged.

The branch advanced from R9 to R10 during this assessment. The current R10
manuscript/edition/blueprint and original image bytes are preserved; this planning
change is based on the newer head and does not overwrite concurrent editorial work.

## Intent and acceptance

Preserve original #5 AC01–AC15 and #2 AC01–AC08. The existing AC13–AC15
ticks describe their previously tested branch scope; they do not certify an
independent current-production content publisher. Add AC16–AC20 below for the new
release-segmentation increment. Their implementation/policy mapping remains open.
No proposal silently exempts an unsafe or incompatible change from checks.

## Findings

| ID | Inspected evidence | Finding and implication | Disposition |
| --- | --- | --- | --- |
| F01 | PR79 R10 manuscript, edition and PR metadata | The first article already exists. Final editing/source/rights/current-reader review is needed; rewriting it from scratch would waste completed work. | Reuse R10; #2. |
| F02 | PR79 versus current main; release/workflow/legal/analytics differences | A direct tip replacement would regress later production changes. Reconcile onto actual main before admission, preserving current controller, legal owners, analytics, security fixes and Cloudflare-only staging. Generated files must be regenerated. | Critical path; #5/PR79. |
| F03 | `tools/site/content-release.cjs`, builder and trusted baseline selection | Verified generation reuse already exists in PR79: unchanged platform bytes are reused, dependent article/catalog/Home documents rebuilt, incompatible or corrupt baselines rejected. This is useful implementation, not a zero-start redesign. | Reuse and revalidate. |
| F04 | `guides/SITE-CONTENT-RELEASE.md` final CI section | Existing optimized generation/PR selection explicitly retains ordinary staging/production admission. A separate lightweight production content lane is still an increment. | AC17/AC19. |
| F05 | Article router/templates/snapshot/archive changes | Current production supports five rooms, not the new article reader. The first integration is a platform change; it needs applicable source and bounded staging/reader validation once. Calling it content-only would conceal changed behavior. | Initial platform checkpoint. |
| F06 | Current source/producer and GitHub Pages workflow contract | Content generation and deployment packaging differ. Reusing accepted platform bytes can avoid recompilation; the current Pages route still publishes a composed complete site artifact. | Atomic assembly, no partial live-file patch. |
| F07 | Shared templates/CSS versus declared article media | A template is executable presentation policy; scene SVG/font/CSS/model inputs can affect every page. Only admitted article-local media is eligible for the content/media lane. | Explicit impact classification. |
| F08 | Parallel lanes plus shared catalog/revision | Independent builds do not make concurrent publication safe. A stale article or platform release could drop the other's content unless publication rechecks the current composition. | AC20. |

## Recommended architecture and boundaries

Use the existing static monorepo with separately versioned build artifacts and
reusable workflow jobs. Do not introduce runtime microservices, a CMS, database,
new hosting origin, API gateway or paid service to solve this build/deployment
problem. Microservices can be reconsidered for an actual dynamic capability or
measured hosting constraint; neither was established in this inspection.

| Lane | Owns | Output | Impact-based verification |
| --- | --- | --- | --- |
| Platform | Browser engine, scenes, navigation, shared styles/templates, article renderer/build schema and trusted policy/toolchain | Immutable platform generation plus compatibility manifest | Affected source/behavior/security checks and bounded staging. Full diagnostics remain optional under the current policy. |
| Content | Manuscripts, declared metadata/editions, catalog and page prose | Changed article HTML and dependent indexes/schema/sitemap/metadata | Content/schema/rights/link/resource checks, unchanged-platform proof and targeted article/catalog/navigation smoke. |
| Media | Admitted article-local raster/PDF resources with provenance | Content-addressed immutable files and MIME/size/dimension/digest records | Resource/rights/markup safety and affected-article layout/byte bounds. Scene/compiler/script/font/global-style media changes escalate to platform. |
| Release assembly | Exact accepted platform + content + media versions | One coherent immutable public artifact and composition record | Compatibility/complete-inventory/current-base/concurrency checks, protected publication and exact live smoke/rollback. |

Keep ordinary semantic/crawlable HTML and no-JS fallback. Keep the existing
`articles/<slug>.html` route contract initially; do not publish a temporary route
or casually change the URL during a later hosting split. The body/figures/references
stay in manuscript/declared assets, not runtime JS or a bespoke hard-coded page.

Use current publisher/manifests/locks rather than a competing registry. Record
the platform/template/content-schema versions, immutable content editions and
media digests. Derive version fields with one owner. A content change can rebuild
Writing, Home when featured, structured metadata and sitemap: those are real
dependencies, not a whole-engine rebuild. Packaging may read/copy all existing
files without recompiling or rerunning every test.

GitHub Pages deploys a prepared artifact; a single-file live patch is not the
proposed solution. Official references inspected18October:
[Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
and [reusable workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows).
The architecture above is an inference/recommendation for this repository.

## Article-first sequence and dependencies

| Phase | Deliverable and owner | Hard dependency | Can proceed independently |
| --- | --- | --- | --- |
| P0 | Freeze R10 delivery scope and minimal article/content/media contract, #2/#5 | Current refs/source inspection | MFA #97 and connector access #103. |
| P1 | Reconcile PR79 onto released main; preserve accepted release/legal/analytics/security owners; admit the minimal reusable article reader/producer | P0; actual source/fixture checks | Final R10 editorial/source/figure/rights review under #2. |
| P2 | Produce current R10 HTML preview; verify stable route, full text/figures/sources, mobile readability, no-JS, Writing entry/count, SEO, resources and article↔room behavior | P1 + reviewed R10 source | Search Console access/configuration #8/#103; final #39 review. |
| P3 | Owner acceptance, one applicable platform staging/admission and first article publication via existing controller; verify live article/index/media/canonical and record publication event | P2 + rights/actual release decision | Other technical backlog does not become a prerequisite. |
| P4 | Finish separately triggered platform/content/media workflows and shared release assembly; prove content-only production without rebuilding the admitted platform | P3 stable contract/baseline | #104 measurement design; no existing URL/manuscript migration. |
| P5 | Use an actual subsequent bounded article revision or next article to prove the small release; then #6 cross-repo harness and #11 guides | P4; real reviewed content | Low-priority #98/#99/#100 as separately selected. |

The author can finish R10 while P1 is implemented. The article should not wait for
complete microservice-style isolation, moving assets to a different CDN, all
publisher export adapters, a new site design, GSC/Windsor access, conversion
instrumentation, old visual diagnostic campaigns, or cross-repository harnesses.

The first real reader changes platform behavior; perform its honest one-time
integration checks. Later content-only publishing uses the smaller approved lane.
If P4 can be safely completed within the same bounded integration, it may be
delivered sooner, but it must not expand the first publication's critical path.

Do not conflate first publication with closing all #2/#5 criteria. The original
deck/PDF/export/upstream disposition gates remain with their owners. Existing R10
review PDF may be retained separately; regenerate a publisher PDF or LinkedIn/
Medium package only when it is required for the selected delivery. No claim that
a local WeasyPrint review is managed publisher-PDF proof.

## Impact on the existing backlog

- #97 MFA: highest-priority owner account action; can run in parallel and requires
  no manuscript or architecture change.
- #102 analytics: prefer its small route guard correction before the new platform
  baseline if ready. Extend its plan to declared article paths and stable article
  URLs; never solve this by allowing arbitrary unverified paths. Data access or a
  clean historical traffic baseline does not block publication.
- #8/#103 Search Console/Windsor: independent; inspect/submit the actual article
  canonical after publication. No need to install GA4 to publish.
- #104 conversions: choose a minimal event mechanism after the content/template
  boundaries settle; avoid modifying navigation concurrently with the first reader
  integration. It is not an article prerequisite.
- #98 security.txt: coordinate with package/allowlist changes if convenient; do
  not hold the article for it.
- #99/#100 bot policy: defer proxy/challenge/HTML-injection changes during the
  first reader release. Public indexing and current serving/integrity contracts
  should remain stable.
- #39 final independent review and #36/#41 current evidence reconciliation:
  separate scoped obligations, not a reason to restart completed production work
  or obsolete native/ribbon/fragment experiments.
- #6 cross-repo harness: use the settled publisher/schema/pin contract from P4.
  It is not needed to render this local article.
- #11 guides: after the first article and small content lane, use the same
  publishing workflow and available observed query evidence.

## Additional acceptance criteria for #5

### AC16 — Versioned component boundaries
- [ ] Canonical platform/template/content/media ownership and compatibility are
  explicit; existing content-only work is reused, shared source stays single-owned,
  stable article URLs and semantic/no-JS output survive the separation.

### AC17 — Content-only production admission
- [ ] A real accepted article edit or new article on an admitted platform runs the
  content lane, proves identical platform bytes, rebuilds only actual dependents
  and publishes through the protected controller with targeted current-source
  content/reader smoke, not a full runtime/performance regression.
- [ ] Changed templates/runtime/CI-policy/toolchain, incompatible or missing
  baseline, mixed or unknown changes reject this fast path and select a clearly
  reported applicable platform route. A path filter alone cannot authorize reuse.

### AC18 — Independent media with honest impact
- [ ] Admitted local article media is immutable/content-addressed, MIME/size/
  dimension/digest/rights checked and reaches its article without an engine
  rebuild; globally active assets or compiler changes select platform checks.
  Semantic figure changes create a new content edition; old published bytes stay.

### AC19 — Reusable pipelines and exact release composition
- [ ] Independently selected platform/content/media jobs consume accepted immutable
  inputs through one reused publication mechanism; composed package, source,
  versions, rights and live observed bytes match. Existing security, trust,
  source/edition/archive and rollback requirements remain effective.

### AC20 — Concurrent releases and rollback
- [ ] Stale baselines, concurrent article/platform updates, lost catalog entries,
  corrupt/missing assets and incompatible versions are rejected or safely
  recomposed against the latest accepted composition before a serialized publish.
  A tested rollback restores a coherent compatible article/index/media state
  without silently downgrading unrelated accepted platform/content changes.

## Sol tasks and acceptance evidence

| Task | Owning paths and intended change | Finding / criterion | Required verification | Status |
| --- | --- | --- | --- | --- |
| T01 | Reconcile existing PR79 to current main; inventory unique publisher changes; preserve main production/legal/security edits | F02, original AC11/12 | Source diff and conflict review; regenerate, never hand-edit docs | Pending |
| T02 | Finish R10 reader/source/figure/rights review in existing article owners | F01, #2 AC01–AC05 | Whole-text and actual rendered preview review; exact edition/source pins | Pending |
| T03 | Minimal article route/reader/templates/package/archive/analytics registration | F05/F07, original AC08, AC16 | Targeted article↔five-room/no-JS/resource/SEO tests plus current applicable staging | Pending |
| T04 | First site article publication and append-only observed event | P3, #2 publication criteria | Exact accepted preview/rights/controller/live URL and inventory | Pending |
| T05 | Reconcile content classifier/reuse with current production controller | F03/F04/F06, AC17/19 | Real content-only artifact reuse plus hostile baseline/mixed-change tests | Pending |
| T06 | Media/versioned composition, source selection and independent jobs | F07, AC16/18/19 | Resource negatives and scope escalation; no duplicate deployment controller | Pending |
| T07 | Safe serialized publication, stale-baseline and rollback cases | F08, AC20 | Real competing-version/retention/rollback evidence, no claimed distributed atomicity from a lock name | Pending |

The original acceptance policy still maps AC01–AC15. Before implementing this
increment, map AC16–AC20 to the existing relevant source/hosted controller tests
and explicit non-automated gates; add meaningful missing failure cases, not
one test per prose line. No whole implementation criterion is ticked by this plan.

| Scope | Actual result | Source / limitation |
| --- | --- | --- |
| Repository/PR/source inspection | Complete | Exact source identities above; independent review not performed |
| Architecture/microservice assessment | Self-analysis/recommendation | No runtime/hosting migration implemented |
| New lanes/current article acceptance | Pending | Old preview/PDF/fixture runs cannot certify R10 or current main integration |
| Planning file/catalog/MEMORY/RI | Verify on the resulting planning commit | Source-only continuity; no production activation |

## Issue synopsis

18October recommendation: first deliver the existing R10 article through the
minimum reconciled PR79 article platform, then finish independent static
platform/content/media release lanes with one safe artifact assembler. Preserve
stable URLs/manuscript ownership and all current main release/legal/security work.
Full microservices and a new hosting stack are not prerequisites. Original #2/#5
criteria and explicit rights/review/publication gates remain honest and separate.
