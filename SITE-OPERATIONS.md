# First site: preview, launch and the next publication

Owning intent: [launch #1](https://github.com/oborskyivitalii/oborskyivitalii/issues/1).
URL/language decision: [#8](https://github.com/oborskyivitalii/oborskyivitalii/issues/8).
Next publication: [PMDay #2](https://github.com/oborskyivitalii/oborskyivitalii/issues/2).

## Implementation boundary

The first version is static HTML/CSS in `docs/`. It needs no build, JavaScript,
Node dependency or runtime service. GitHub Pages publishes only that directory;
root process files, drafts and review artifacts are not website content.
Keep the profile README and use relative internal URLs. The preview provisionally
uses English and the current project Pages URL; no permanent choice is inferred.

The homepage owns a short author description, two research routes, selected
publication links and bounded acknowledgements. It links external article editions
without importing their body text, figures or platform assets. The site-wide license
decision remains [rights #7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7);
the credits page describes that current state without licensing sibling research.

## Preview

From the repository root:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:8765/`. Inspect desktop and mobile widths, keyboard
navigation, all section links, external publication links and `credits.html`.
Browser inspection belongs in review; Python is only a local file server.

## Launch

1. Review the concrete homepage and rights/attribution inventory in
   [SITE-CONTENT-REVIEW](SITE-CONTENT-REVIEW.md); record the URL/language and
   editorial/publication decision in #1/#8. Resolve omissions there rather than
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
