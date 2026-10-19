# Shared publication tags and current-index recommendations

Owner #5; same Draft PR79. Maintainer authorization: issue5-tags-runtime-20261019.
Prepared-source self-review; independent/editorial/release acceptance is not implied.
Exact final commit, source policy and hosted observations are recorded in PR79.

## Intent and decision

The maintainer explicitly chose one reusable component and a separately updated
index, rather than rebuilding old article HTML when tag recommendations change.
This supersedes the prior proposed build-time list treatment under prospective
AC21–AC22. Original AC01–AC20 and original publication/source/rights gates remain.
Article writing, actual PMDay media and production activation are separate work.

`site/content/article-tags.json` owns all29 archive assignments, local reader
assignments and the vocabulary. Local logical articles use their article ID;
external records use their catalogue ID. Titles, dates, links and edition
relationships stay in their existing catalogue. No manuscript/media changes.
The publisher exports only published works. Selected preview readers may receive
tag context, but never become recommendations or production catalogue entries.

One bounded schema/selector/DOM factory assembles into existing archive.js.
Its optional same-origin200000B request uses no-store, finite streaming, an8s
abort deadline, mount disposal and safe text/URL DOM construction. It adds native
anchor tag chips and at most3 related works using Jaccard overlap and stable ID
ties; excludes current work, duplicate indexed identities/URLs and unrelated rows.
No service, dependency, browser loop or extra runtime resource is introduced.
Writing filtering stays under the archive's existing URL/history/reset/print owner.
No-JS/file/failed/invalid index keeps native article and Writing access; the optional
live metadata enhancements are unavailable, as explicitly accepted by the maintainer.

## Dependency and release boundary

Tag-only generation/content composition is asserted to change only the public
index: old article and five-room HTML, immutable snapshots and every runtime byte
stay equal. The index and publication locks still bind exact source/output bytes;
forged valid metadata with a rehashed public manifest fails canonical rights checks.
All routes conservatively charge the index against existing transfer budgets.
New articles still generate their own reader, Writing and eventual sitemap.

This proves generation/component independence. Existing edition decoration can
restamp source-bound aliases; it is not presented as a completed independent
production tag publisher. Protected release, compatibility, concurrency/rollback
and current-production content/media lanes remain AC16–AC20 work after baseline.
The first schema/component/style/controller integration selects platform checks.
Later valid tag-store edits enter the maintained content classifier and mandatory
content suite. No path-only exception admits changed runtime/template/policy.

## Tag backfill and semantic limits

The29 original primary publications and their alternate/platform relationships
are preserved. Descriptive initial tags use existing canonical titles, topic data
and authored summaries; they classify subject matter rather than validate claims.
No external article bodies are imported. Primary-author pages were also inspected
for ambiguous subjects: [Future/Mirror/Book](https://www.linkedin.com/pulse/future-mirror-book-vitalii-oborskyi-7bt2f),
[professional-profile audit](https://www.linkedin.com/pulse/ai-prompt-how-audit-myor-any-other-professional-profile-oborskyi-5pd9f),
[organizational terraforming](https://www.linkedin.com/pulse/terraforming-your-organization-data-driven-journey-from-oborsky-j4r0f)
and [Industry4.0](https://www.linkedin.com/pulse/europes-silent-revolution-how-industry-40-powering-vitalii-oborskyi-thadf).
The entire external archive was not independently reread; complete semantic tag
curation remains reviewable maintainer/editorial work under AC21, not a claim
inferred from structural coverage. Draft article tags remain prepared classification.

## Checks and style mapping

CS01–CS10 → AC11: canonical data/producer/runtime/archive owners, one shared schema,
bounded effects and cleanup, no new CSS palette or authored inline style, safe DOM,
existing immutable resource/source/rights contracts, explicit profiles/catalog/RI.
Focused ESLint has zero errors; unchanged emitArticles retains its existing
complexity26 warning. This increment does not broaden lint exceptions.
Maintained Prettier3.6.2/Ruff0.16.10, Basic, style guard, mapped issue policy,
RI freshness/28 regressions and coupling20 regressions are final-source checks.

| AC               | Automated scope                                                                                                                                                                       | Remaining observation/decision                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| AC21             | Full published coverage; missing/unknown/duplicate tags, schema/URL/identity failures; archive filters/query/history/reset/print; private vocabulary projection; offline/cancellation | Initial labels remain editorially reviewable; current hosted browser proof and independent requirements |
| AC22             | Stable relevance/self/tie/no-match bounds; actual tag-only index delta with unchanged HTML/runtime; canonical index tamper and original resource budgets; classifier                  | Actual bounded browser proof; independent production publisher/concurrency remains AC16–AC20            |
| AC08/11/12/14/15 | Existing reader/delivery/source/rights/classification checks retained and extended                                                                                                    | Original full independent/device/staging/publication gates remain                                       |

The new preview smoke additionally observes all29 tagged Writing cards, tag click,
URL reload/reset/history, exact reader tag/related links and blocked/invalid-index
native fallbacks. It reuses the existing Chromium job and records publicationTags
separately from the ordinary four room rows and five article observations.
No source or budget failure is relabelled as pass. Local managed Chromium download
was unavailable; actual managed browser evidence comes from existing CI.

Initial exact-source CI39233209446 exposed a real history regression: asynchronous
tag insertion changed Writing geometry after Back restored scroll. The shared
component now hydrates its last validated tab-memory snapshot synchronously before
the existing router restores position. It still reads current data on every mount;
identical responses avoid reflow and changed responses replace optional DOM while
preserving current scroll. No persistent cache, navigation delay or relaxed history
assertion was added. A dedicated lifecycle test covers synchronous reuse, fresh
requests, changed assignments, unchanged-response stability and disposal.
The first source policy also caught two incomplete positive fixtures: an accepted
synthetic article needed an explicit tag assignment, and the finite public inventory
needed the new JSON entry. Their original provenance/privacy assertions remain.
Initial failures remain recorded; final exact-head rerun evidence belongs in PR79.
CI39234975414 passed the unchanged four room rows and complete ordinary article
journey, then timed out at the new tag journey's first click. A direct hosted UI
click selected the expected7/29 records. The new journey now waits for the existing
scene's ready/settled state as well as tag data, scrolls the actual chip into view
before clicking, and reports URL/control/visible-row/scene/focus and browser errors
on failure. No assertion is removed; final CI must establish the full result.

## Next steps

Inspect the updated generic preview, then receive the final article handoff and
verify its actual media/PDF/rights/budgets before first-platform staging/release.
Keep this PR Draft until required admission/review is complete. After accepted
baseline, finish independently admitted content/media/index publication and
coherent concurrent release composition. Production remains unchanged here.
