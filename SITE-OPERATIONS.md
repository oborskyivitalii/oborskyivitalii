# First site: candidate, review and release

## Execution and publication pause — 2026-10-04

The maintainer now authorizes the engine/content plan and Writing fix under
[#15](https://github.com/oborskyivitalii/oborskyivitalii/issues/15)/#12 in stacked
Draft [PR #16](https://github.com/oborskyivitalii/oborskyivitalii/pull/16). Read
[the source/engine contract](site/README.md) and
[execution record](review/site-engine-implementation-20261004/EXECUTION.md).
`site/` is authoritative; `docs/` is generated-only. Every #13 mandatory job and
budget remains. The latest instruction pauses **all publication**, including
staging, superseding the earlier activation amendment below. Both deployment
workflow entry points have explicit false guards; configuration alone cannot
enable publication. No host/account provisioning, upload, production release or
merge is part of this work. Prepared packages/fixtures do not establish real host,
physical-device or independent acceptance. Re-enabling hosting needs a later
maintainer instruction and a separately reviewed change to those guards.

## Current implementation and staging setup — 2026-10-03

Executive design source `9c12900` is implemented in Draft PR #10. Read the current
[execution record](review/sol-visual-v11-20261003/EXECUTION.md); older candidate and
planning summaries below are historical. Cloudflare staging code is implemented
in `.github/workflows/site-staging.yml` and `tools/staging/`, called only after the
required PR aggregate by `site-checks.yml`. [SITE-STAGING](SITE-STAGING.md) contains
the exact secure environment setup, ownership, pin provenance and recovery limits.
There is no configured Cloudflare account/token or live URL yet. Do not report
the controlled Pages model as a deployment. Production/merge/domain/payment and
independent/device/rights acceptance remain separate.

Only the frozen 13-file public inventory plus `_headers`, a real `404.html` and
non-sensitive revision metadata are uploaded. Public HTML/CSS/JS/portrait bytes
are unchanged by packaging. The stable alias is updated only after the separate
version passes hosted smoke; promotion is serialized and rechecks the live PR tip.
The previous verified package is retained as an immutable Actions artifact for
90 days; expired/unverifiable recovery blocks new promotion. Failed stable smoke
automatically reuploads/rechecks that exact previous package where one exists.
No project/DNS/production deletion or cleanup is automated. Retain the current and
previous review versions; any older cleanup is a separate bounded owner action.

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

## Current handoff and status — 2026-10-03

[Issue #14](https://github.com/oborskyivitalii/oborskyivitalii/issues/14) prepares
the next visual/contrast/SEO increment in Draft PR #10; read
[v11 Sol tasks](review/sol-visual-v11-20261003/SOL-TASKS.md). No public file changes
in this preparation. The existing runtime and maintained release tooling at
`0333c4d` have [verified candidate evidence](https://github.com/oborskyivitalii/oborskyivitalii/pull/10#issuecomment-5970991843),
including the 24-second cycle. Earlier v8/pipeline-pending descriptions below
are historical. New implementation must refresh source-bound exports/captures
and evidence, retain unchanged #13 budgets and keep genuine device/rights/hosting
requirements open. The full release gate's missing external review/device record
is not satisfied by this planning handoff. No merge or deployment is requested.

## Required future release checks — 2026-10-03

[SITE-RELEASE-GATES](SITE-RELEASE-GATES.md), owned by #13, defines recurring
security, quality, performance and platform checks plus the deployment dependency.
It is a Sol implementation task; the current CI still contains only the existing
tests/export/RI jobs. Resolve #12's measured defects before calling the candidate
ready. Passing those older jobs alone cannot satisfy the new release contract.

## Current v8 candidate — 2026-10-03

The living thematic-fractal iteration is in Draft PR #10. [Execution/evidence](review/sol-visual-v8-20261003/EXECUTION.md)
records source/behavior/export checks, actual browser captures and observed limits. Implementation
is distinct from independent review, editorial/rights acceptance, merge and deployment.
The approved contract remains [SOL-HANDOFF](SOL-HANDOFF.md). Owning issues:
[launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1),
[rights #7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7),
[URL/hosting #8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8).

Five static pages, CSS and three optional native scripts remain the entire runtime.
No site build, installed site package, remote font/service or analytics. Only docs/
is the proposed Pages source; drafts/review/process content stays outside it.
Home follows Hero → Research → Help → five selected EN works → eight bounded
public discussion entries → About → Contact. Research holds details/source links.
Writing preserves 27 primary records (20 EN/7 UA) plus the separately dated
Thinking Systems LinkedIn rendition: 28 linked renditions, not unique works.
Talks retains three existing public records with unchanged language bounds.
Original JPEG/WebP bytes remain unchanged; native facets are behind the cutout.

## Inspect v8

Start with the [all-page gallery](review/site-v1-20261003-v8-index.html): all five
interactive pages, fixed Day/Night, desktop/mobile screenshots and recordings.

- [Interactive Home](review/site-v1-20261003-v8-interactive.html).
- [Day](review/site-v1-20261003-v8-day.html) / [Night](review/site-v1-20261003-v8-night.html).
- [Writing](review/site-v1-20261003-v8-writing-day.html), plus Night/interactive variants.
- Research/Talks/Credits each have the same three variants: 15 page copies plus the all-page gallery.
- Offline package: `python3 tools/build_site_bundle.py` writes
  `../deliverables/site-v1-20261003-v8.zip`; extract it and open index.html.
  The delivered ZIP is separate; Git stores its exact reproducible entry/ZIP hashes.
- [Preview hashes](review/site-v1-static-previews-v8.json), [bundle hashes](review/site-v1-offline-bundle-v8.json)
  and [public-source record](review/site-v1-review.json).

Keep extracted/downloaded pages together for local navigation. Ten fixed-theme
copies show complete static HTML/SVG without executable scripts. Five interactive
copies inline exact scripts and retain Auto/Day/Night, Appearance/Motion and filters.
All review renditions are noindex. The package's separate site/ entries retain
exact docs/ production bytes; they do not acquire review noindex. v1/v2/v3 and
concept/proposal outputs are history, not the current candidate.

## Behavior and acceptance procedure

Appearance is a labelled native disclosure. Auto follows the visitor's local
clock: Day 07:00–18:59, Night otherwise; manual choice persists, storage failure
still works in-tab. Escape closes the disclosure and returns focus to its summary.
Anchor clearance follows the actual header height when JS runs, with CSS fallback.

The common cyan/bronze/paper material language joins page-specific finite recursive
structures: architectural portals, research apertures, book arches, dialogue waves
and citation weaves. Eight modeled motifs per route branch across three symbol
scales. These are decorative environments, not research diagrams or telemetry.
Native scrolling follows named Home/Research stops and traverses successive open
structures. Writing Topic chooses a finite path within visible result bounds;
Year/Language changes only results and preserves local camera progress. Empty
result restoration and the first resumed scroll retain that progress.

The camera settles within 80ms. Independently, the world articulates in a smooth
48-second cycle, evaluated from immutable geometry. Ambient painting is capped
at 24Hz desktop / 16Hz narrow viewports; this is an upper limit, not a measured
FPS promise. No pointer influence. Off/reduced freezes the last displayed camera
AND phase, including theme/resize/layout/print changes. Hidden/print pauses and
resumes without time catch-up. Mobile uses lower geometry detail, with screen-size
LOD. Short routes need no scroll spacers to keep their structure alive. No Canvas
uses a phase-zero SVG; no scripts retains every article and native destinations.

Archive state: valid query first, recognized topic/year fragment overrides its
respective filter dimension. Other filters remain. A filtered-out target reaches
a visible topic/year heading and empty explanation. Controls/Reset reconcile the
fragment, and history/hash restoration synchronizes the form/results/scene.
Printing shows all primary records and the additional rendition, then restores filters.

```sh
node tools/build_scene_fallbacks.cjs
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

For a permitted local browser:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```

Open http://127.0.0.1:8765/. Inspect all five pages at 1440×900/390×844 Day/Night,
360px and 200% desktop zoom. Verify portrait/three scene views, readable long EN/UA
titles, keyboard/focus/touch/native scroll, anchor clearance, reverse scroll,
Off/reduced, theme-only repaint, no-JS/Canvas failure, hidden/print return and idle.
On Writing test all topic/year fragments, Research's leadership link, conflicts
with queries, empty/one result, Reset/hashchange/back/forward and full print restoration.
Capture actual screenshots and a short motion recording or a genuine observed-state
interaction log, stating browser/viewport and any unperformed cases. Do not infer
measured frame rate or full accessibility from source/VM tests.

**Current evidence and measured limits:** see the source-hashed
[v8 capture record](review/site-v1-20261003-v8-captures/captures.json),
[sampled contrast](review/site-v1-20261003-v8-captures/contrast.json) and
[execution record](review/sol-visual-v8-20261003/EXECUTION.md).
Reproduction uses optional Playwright/Chromium/Pillow/pngjs/ffmpeg; none is a
production site dependency. Headless/mobile emulation does not establish
physical-device, native hidden-tab or print-dialog acceptance.

## Release and subsequent work

1. Review the concrete v8 content/assets; record editorial/rights acceptance in #7
   and the permanent URL/hosting choice in #8. English and candidate photo use are settled.
2. Complete correct absolute canonical/social/image URLs and sitemap for that
   actual URL, including the Writing query canonical policy; update candidate tests.
   Keep review noindex outside docs/. No provisional permanent identity is invented.
3. With explicit integration/release authorization, merge #9 first, retarget #10
   to main, inspect the new diff and rerun checks; then merge the accepted candidate.
4. Once hosting/activation is authorized under #8, deploy the exact public artifact
   that passed #13's required release checks. If Pages is selected, use an
   Actions-based deployment depending on the successful release gate; automatic
   branch publication would bypass it. Package only the public docs/ files.
   Verify served digests, deployed commit, live URL, links, HTTPS/headers and
   robots/indexability; complete post-deploy smoke/recovery checks before
   declaring the release healthy or closing #1/#8.
5. Search Console owner verification and real query measurement follow available access.

Keeping the current repository yields project URL
https://oborskyivitalii.github.io/oborskyivitalii/ after Pages is configured.
A root URL requires the separate rename/profile-README decision. No rename,
Pages configuration, merge or deployment is performed by this implementation.
A missing scheduler URL keeps the agreed visible placeholder and active LinkedIn route.

After launch, PMDay #2 owns the blueprint/manuscript and selected, inspected slide/PDF
edition; do not infer UA PR #113 release. Video follows its actual published edition.
Later original delivery/production guides and manual measurement belong to #11.
Quartz/PDF #5, cross-repository harness #6 and Subprime publishing remain independent.
