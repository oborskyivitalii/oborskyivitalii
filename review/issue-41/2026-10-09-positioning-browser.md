# Issue 41 — 2026-10-09 focused positioning browser review

Owning issue: [#41](https://github.com/oborskyivitalii/oborskyivitalii/issues/41).
Owning PR: [#67](https://github.com/oborskyivitalii/oborskyivitalii/pull/67).
Reviewer: independent delegated read-only browser reviewer, `/root/positioning_visual`.
This review changed no public content, runtime, controls or GitHub records.

## Inspected source and scope

Hosted target: <https://ddbbfb0c.oborskyi-author-ci-staging.pages.dev/>.
The PR preview record and completed normal preview pipeline bind this deployment to
`279f9ba51cf597fb1bb067da45416ceab5c5523c`, tree
`4b7320f969d04bedae24b6022967a38a531550e7`, public digest
`a9d1e7969160c06d2ba55aee39097766cf4f3fe2ded73a1ecbb434d20710c22f`.
The root agent inspected those pipeline records; this reviewer directly inspected
the deployed DOM and rendered views. The loaded Color engine was
`a2e20893134e76f273b5eb80699bd22652c5381b3490a7c654d34d9c9458e4d3`.
This is a PR preview, not stable staging, a merged-source check or a release.

Read AGENTS, CONTRIBUTING, source/profile/editorial owners, the current issue-41
policy and dated positioning/source reviews. The accepted 9 October task requires
changed-page desktop/mobile reading and contact/anchor inspection alongside normal
exact-source PR smoke. Factual authenticity remains with the source/editorial
review; rendered text is not proof of the biography or organizer's claims.

## Actual observations

Cloud Chrome reported a **1363 × 936 CSS-pixel** viewport. Its viewport JPEGs are
1348 × 926 pixels; the full Credits capture is 1348 × 1922. Actual Day/Night colors
were checked through the existing theme UI and settled rendered screenshots.
HYPD's **mobile preset** returned viewport JPEGs of **739 × 1600 pixels**; its
backend CSS viewport and device-pixel ratio were not exposed, so these are not
claimed to be exact 390 CSS-pixel captures. The mobile views shown here were Day.

| View | Direct visual/interaction observation | Result |
| --- | --- | --- |
| Home entry, Day and Night desktop | Existing problem-led title, author/audience copy, portrait and compact leadership/portfolio paragraph remain legible, with clear reading surfaces and no observed horizontal overflow. | Passed focused inspection |
| Home Work with me, Night desktop and Day mobile | Concrete delivery diagnosis/output wraps within its card; the other work cards retain the same responsive structure and scoped-output note. | Passed focused inspection |
| Home About, Day mobile | Management narrative and one short Corning line wrap readably; existing “Explore the talk” is visible below the line. | Passed focused inspection |
| Writing, Day/Night desktop and Day mobile | Intro clearly says 29 primary records, 22 English, 7 Ukrainian and 46 linked editions. Desktop live status says 29 of 29; catalog note separately defines 46 platform editions (39 EN / 7 UA). Both count definitions and archive controls remain readable. No desktop horizontal overflow. | Passed focused inspection |
| Talks, Night desktop | Corning context/source link and adjacent event cards remain readable; no “Language unconfirmed” status is rendered. Speaker invitation and its explanation remain within main content before the next-route utility. | Passed focused inspection |
| Talks, Day mobile preset | Heading, topic links and PMDay's explicit “Recording in Ukrainian” label remain readable. The screenshot service captured the intro despite the requested fragment; this is not evidence that it scrolled to Corning. | Passed observed reading; fragment limitation recorded |
| Credits, Day desktop and mobile | Language explanation says unverified talk languages are omitted; headings, paragraphs, existing correction/contact links and footer retain readable wrapping. Full mobile JPEG206 × 1600 is downscaled and is supporting overview, not a text-size measurement. | Passed focused inspection |

The Home link was actually clicked and settled at
`https://ddbbfb0c.oborskyi-author-ci-staging.pages.dev/talks.html#corning`.
Corning's card began at 96.6 CSS pixels, below the 81-pixel header bottom; the source
link remained present. “Invite me to speak” was then actually clicked and reached
`https://ddbbfb0c.oborskyi-author-ci-staging.pages.dev/index.html#contact`.
The existing booking, public email and LinkedIn links were inspected; no booking,
email or external communication was submitted. Footer navigation reached Credits.
Initial short locator timeouts occurred during the existing route flight; subsequent
settled DOM and screenshots showed the intended destinations and content.

Screenshots were retained transiently, not committed. Capture inventory and SHA256
identities are in `/tmp/issue41-browser-captures.json`; key basenames are
`issue41-home-night-desktop.jpg`, `issue41-help-night-desktop.jpg`,
`issue41-corning-night-desktop.jpg`, `issue41-writing-day-desktop.jpg`,
`issue41-writing-night-desktop.jpg`, `issue41-credits-day-desktop.jpg`, and the
matching `help`, `about`, `writing`, `talks`, `credits` mobile-Day captures.

## Acceptance evidence and limits

| AC / gate | Evidence | Disposition |
| --- | --- | --- |
| AC13 focused reader-facing Talks/contact inspection | Known PMDay language, finished event copy, visible invitation and actual invitation→existing contact navigation above. | Focused task observation satisfied; source/content checks remain separate |
| AC15 focused changed-page reading/link inspection | Actual desktop and mobile-preset visual inspection above; no newly observed readability or contact/anchor blocker. | Focused task observation satisfied with stated viewport limits |
| Normal exact-source PR hosted smoke | [Run 37947956364](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37947956364), job 113879540948; root agent verified PASS, source 279f9ba and public digest above. Existing automation covers 1440/390 normal/no-Canvas routes. | Passed pipeline evidence, separate from this manual review |
| Original broader BROWSER gate / AC03 and AC05 | This focused pass did not complete the full promised manual 1440/390 Day/Night matrix, Research advisory anchors, filter/history/print, Off/reduced or all-route bottom-reach observations. | Partial; do not mark the original broader gate fully satisfied |

An ephemeral official Playwright Chromium download returned an invalid/truncated
ZIP; its retry loop was stopped. No repository test infrastructure changed. No
full performance/browser regression, native browser, physical device or production
acceptance was claimed. Exact manual mobile-Night/1440/390 coverage remains absent.

## Decisions and next action

No source or layout correction is requested by this focused review. Root may record
AC13/AC15's task observations and reconcile whole criteria with their other evidence.
Preserve the original issue's broader open gates, exact source binding, independent
source review and maintainer merge/release decisions; this review supplies no merge
or release authorization.

## Issue synopsis

Current immutable PR preview was visually read on desktop and a mobile preset;
Home→Corning and Talks→existing Home contact worked. Writing's primary/edition
definitions are readable and consistent. Focused positioning checks found no blocker.
The original broader browser matrix remains partial and is not claimed complete.
