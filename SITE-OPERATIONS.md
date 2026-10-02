# First site: preview, launch and the next publication

Owning intent: [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1).
URL/language decision: [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8).
Next publication: [PMDay #2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2).

## Implementation boundary

The first version is static HTML/CSS in `docs/` with three small optional browser
scripts: visitor-local themes, decorative spatial perspective and archive filters.
There is no site build, installed package, external font, analytics or runtime
service. Node/Python run bounded developer checks and produce review handoffs;
they are not website runtime dependencies. Pages publishes only `docs/`, keeping
process, drafts and review artifacts out of the public site. English is confirmed;
the permanent Pages URL and site-wide rights decision remain #8/#7.

Navigation is **Home · Research · Writing · Talks**, with Credits in the footer.
Home contains the author/About, two directions, four selected articles and four
source-bounded attributions. Research retains detailed terminology, control
theory/TOC lenses and all seven conversations. Writing indexes **27 platform
editions (20 EN/7 UA)** by year and topic; optional filters intersect topic/year/
language and preserve query state in the URL. All items remain ordinary readable
HTML without scripts. Talks retains three public event records and exact language
bounds. No original article body, figures or recordings are copied into the site.

The supplied original JPEG is retained unchanged. The displayed image is an
AI-assisted transparent derivative, optimized to a 55,458-byte WebP, with alt text
and dimensions. Public credits disclose that treatment. Rights/likeness review is
not replaced by compression, behavioral tests or the illustrative concept board.

## Current preview and checks

The current self-contained files are `review/site-v1-20261002-v3-*.html`.
Open `review/site-v1-20261002-v3-interactive.html` for the actual five-page design
with exact inlined public scripts and remapped navigation. Auto/Day/Night, Motion
and archive filters require a script-capable browser. The file links to fixed
Day/Night alternatives when the viewer blocks scripts. Fixed copies inline exact
CSS/WebP, retain the complete catalog and year/topic navigation, and use a static
vector background. They do not demonstrate movement, filtering or Auto.

- `review/site-v1-20261002-v3-day.html` / `-night.html`: updated homepage.
- `review/site-v1-20261002-v3-writing-day.html`: complete catalog, with Night and
  interactive counterparts.
- Research, Talks and Credits also have each of those three variants.
- `review/site-v1-static-previews-v3.json`: ten source hashes and 15 output hashes.
- `review/site-v1-20261002-v3.zip`: extract all files; open `site/index.html` in a
  browser, or the contained review alternatives. Entry hashes are in
  `review/site-v1-offline-bundle-v3.json`.

Keep the extracted files together for navigation. All review copies are noindex,
outside the public directory. Earlier v1/v2/proposal artifacts are historical.
No generated mockup is an actual browser screenshot; these exports are inspectable
outputs, not browser visual QA or deployment.

```bash
node tools/build_site_previews.cjs
python3 tools/build_site_bundle.py
node --test tests/theme.test.cjs tests/space.test.cjs tests/archive.test.cjs tests/content.test.cjs tests/preview.test.cjs
node tools/build_site_previews.cjs --check
python3 tools/build_site_bundle.py --check
```

For a local web-server review:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:8765/`. Inspect actual desktop/mobile/keyboard/print output,
all page and section links, original edition URLs and long titles. Check Auto:
Day 07:00–18:59, Night 19:00–06:59 in the visitor's local clock; saved manual choice
wins, and storage failure remains usable in-tab. No scripts uses OS color preference.

Scroll/section navigation moves the perspective through linked rings/branches and
a narrow flow throat; mouse adds bounded parallax. Motion can be switched Off;
reduced motion wins over saved On. Touch/mobile pointer motion is ignored, pixel
ratio is capped, frames are coalesced and there is no idle loop. Hidden/printing
states pause drawing. No Canvas leaves a static SVG. This is decorative geometry,
not measured telemetry, a scientific simulation or a canonical research diagram.
Print shows all archive entries, then restores filters after print.

The previous browser access block remains: current desktop/mobile/keyboard/print
rendering and measured performance are **pending**. Do not attempt a workaround
or label source/VM behavioral checks as actual browser QA. RI commands remain in
`.github/REPOSITORY-INTELLIGENCE.md`.

## Launch

The maintainer authorized applying the design and page separation on 2026-10-02.
The [visual record](SITE-VISUAL-REVIEW.md) now describes the applied candidate and
preserves the earlier proposal as history. The release decisions below remain.

1. Review the concrete homepage and rights/attribution inventory in
   [SITE-CONTENT-REVIEW](SITE-CONTENT-REVIEW.md) and
   [source audit](SITE-SOURCE-AUDIT.md) and [SEO map](SITE-SEO.md); record the URL and
   editorial/publication decision in #1/#8. English is already confirmed. Resolve omissions there rather than
   silently inventing a decision.
2. Merge the site PR and any site-local workflow dependency; verify the accepted
   files on `main`. UA/Subprime workflow PRs are not site deployment prerequisites.
3. In GitHub **Settings → Pages**, choose **Deploy from a branch**, **main**,
   **/docs**, then save. This needs repository administration/maintainer access;
   the current GitHub connector supports content and PR writes, not this setting.
4. Verify the successful Pages build, the live homepage and mobile navigation.
   Record the deployed commit and public URL in #1 before closing it.

Expected URL if the current name is kept:
`https://oborskyivitalii.github.io/oborskyivitalii/`.
Do not put provisional canonical URLs in public metadata. If the repo is renamed,
update repo links and record the profile README disposition before release.
Once the stable URL is recorded, complete the absolute canonical/social-image/
sitemap metadata and update the candidate-stage tests as described in SITE-SEO.

GitHub's [Pages source guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
and [site naming rules](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
were checked on 2026-10-01.

## PMDay next

After launch, clarify the article's audience/language and intended explanation in
#2, then write a blueprint and manuscript. Select the exact UA PR #113 slide/PDF
edition, inspect its actual output and rights, and review the article against it.
Only the accepted page and edition assets go into `docs/`. A small static article
page can ship before a general Markdown/PDF adapter. Keep editable manuscripts
outside `docs/`; do not copy the one-talk generator/tests into the site's runtime.
Link the released page from the writing index after publication acceptance.
Video is a later update when its public edition exists.

Quartz/PDF migration #5, full cross-repository harness #6 and Subprime #48 remain
independent follow-ups. The initial launch is not acceptance of those migrations.
