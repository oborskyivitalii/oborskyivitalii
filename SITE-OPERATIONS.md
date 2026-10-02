# First site: preview, launch and the next publication

Owning intent: [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1).
URL/language decision: [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8).
Next publication: [PMDay #2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2).

## Implementation boundary

The first version is static HTML/CSS with a small visitor-theme script in `docs/`.
It needs no build, package dependency or runtime service. Node's built-in test
runner checks the theme in CI; it is not a website build or deployment dependency.
GitHub Pages publishes only that directory;
root process files, drafts and review artifacts are not website content.
Keep the profile README and use relative internal URLs. English is the maintainer's
confirmed interface language. The permanent Pages URL remains undecided; no
repository rename or public release is inferred.

The homepage owns a short author description, two research routes, selected
publication links and bounded acknowledgements. `docs/writing.html` indexes
23 works (20 English, 3 Ukrainian), including earlier delivery/PMO and AI strategy writing. It links external article editions
without importing their body text, figures or platform assets. The site-wide license
decision remains [rights #7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7);
the credits page describes that current state without licensing sibling research.

## Preview

For a file viewer that cannot run JavaScript or keep the public directory together,
use the review-only fixed-theme copies. They embed the exact public CSS and expose
Day/Night as ordinary links. Homepage, the complete 23-work archive and credits
each have a Day and Night copy; local navigation stays inside those six files.
The current v2 homepage copies also embed the exact supplied portrait. All review
copies are marked noindex and are outside the proposed public source directory.
These copies are not the Auto-mode demonstration, browser QA or deployment.
The original `review/site-v1-preview.html` and the earlier fixed-theme copies
remain historical; they do not represent the current portrait/language/SEO revision.

```bash
node tools/build_site_previews.cjs
node tools/build_site_previews.cjs --check
node --test tests/preview.test.cjs tests/content.test.cjs
```

Open `review/site-v1-20261001-v2-day.html` or
`review/site-v1-20261001-v2-night.html`; the full catalog is
`review/site-v1-20261001-v2-writing-day.html` (or its `night` counterpart).
`review/site-v1-static-previews-v2.json` records the exact source/output hashes.
Keep all six HTML files together for page/theme navigation after downloading.

From the repository root:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:8765/`. Inspect desktop and mobile widths, keyboard
navigation, all section links, external publication links, `writing.html` and
`credits.html`. Check Day/Night and Auto on each page, long article titles and
print output. Auto uses the device's local clock: light from 07:00 to 19:00,
dark otherwise; a saved manual choice takes priority. Storage failures keep the
in-tab choice usable, and no-JavaScript visitors get their OS light/dark preference.
Browser inspection belongs in review; Python is only a local file server.

Theme behavior checks (Node 18+ built-in modules, no install):

```bash
node --test tests/theme.test.cjs
```

## Launch

The [2026-10-02 visual proposal](SITE-VISUAL-REVIEW.md) is a separate review artifact
with native Day/Night controls and an embedded cutout. It is not the current
public edition or Auto-mode test. If the maintainer selects that direction,
apply it consistently to the public pages, optimize the derived image and refresh
the public review/handoff before completing the launch checks below.

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
