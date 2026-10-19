# Issue108 — 2026-10-19 site delivery

Owner: <https://github.com/oborskyivitalii/oborskyivitalii/issues/108>.
Role: implementation and self-review; independent acceptance is not claimed.
Prepared source: branch `work/issue-108-pmday-events-20261019` from main
`0098f804cb3b0d120173d4c8689043db42231c47`; final source and actual CI/deployments
are recorded in the linked PR rather than predicted here.

## Intent and decisions

The maintainer supplied the organiser's exact Autumn name and authorised the
standard production route. Add the confirmed Winter event on Talks before past
engagements. Keep the site release independent of unfinished PR107/PR79.
The organiser excerpt supplied on 19 October and the same-date inspection of
<https://pmday.org/online> establish 30 January 2027, online and Vitalii's speaker
listing. No session title, language, track, slot, recording promise or ticket
claim is inferred. Final copy points readers to the official programme.

## Naming inventory and disposition

| Maintained surface                                                              | Disposition                                                                                                                                        |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site/content/pages/talks/talks.json` Autumn label                              | Exact `UA Online PMDay 2026 Autumn`; retain recording language/date and original talk title                                                        |
| `site/content/pages/talks/metadata.json`                                        | Exact Winter and Autumn names in the description used by all three social/search tags                                                              |
| Generated `docs/talks.html`, current source snapshot and offline renditions     | Regenerated from authored owners                                                                                                                   |
| Existing recording, organiser announcement and author reflection URLs           | Original canonical destinations retained verbatim                                                                                                  |
| `site/retained/snapshots/` and dated review inventories                         | Immutable historical evidence, unchanged                                                                                                           |
| PR79 manuscript, launch copy, publication references and current reader edition | Unpublished; corrected naming required before publishing under #2/#5. Frozen PDF/edition history needs a new corrected edition, never an overwrite |
| PR107 event campaign                                                            | Distinct `UA Online PMDay 2027 Winter`; generic promo theme work remains in #106/PR107                                                             |

There is no hosted PMDay article body, deck or PDF in this main source. No
third-party logo, photograph or new binary asset is imported by this change.

## Architecture and code style

CS01–CS02: JSON owns prose/URLs, existing template owns markup; generated output
is rebuilt. The exact hash-bound amendment is reversed before earlier approved
amendments, keeping their immutable evidence intact.
CS03–CS05: reuse `.publication`, `.publication-meta`, `.talk-title`, `.text-link`,
`.topic-nav` and `.writing-topic`; canonical `site/engine/styles.css` and
`reading-surfaces.css` are unchanged. No new inline style, palette, runtime,
route, clock, resource or navigation controller.
CS06–CS07: existing engine/effects, freeze/failure and resource budgets unchanged.
CS08–CS10: add one meaningful maintained event case with negative date, naming,
destination, format, omitted-language and missing-card mutations. Historical
checks reverse this exact successor first; their original assertions survive.
The numeric policy adapter is issue-only. Existing content/SEO profiles remain
permanent; no new browser matrix or duplicate release stage.

## Acceptance and evidence

| AC        | Source check                                                      | Non-automated boundary                                                  |
| --------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| AC01–AC02 | Current event facts/placement/link and historical inventory cases | Editorial and visual review; actual hosted navigation                   |
| AC03      | Basic, style guard, RI and RI/CI                                  | Architectural/readability review above is self-review                   |
| AC04      | Linked issue policy and PR/commit references                      | Actual preview/staging/merge/archive/live observations                  |
| AC05      | Existing real campaign in PR107                                   | Remains open for campaign review and later copy                         |
| AC06      | Exact current naming and metadata, unchanged prior resources      | PR79 prepublication handoff; original source editions remain historical |
| AC07      | Existing site components and unchanged style owners               | Actual delivery; promo theme consumption remains PR107 work             |

Initial generated SEO reconciliation passes against the frozen public baseline.
All later checks are reported with their actual source/run; this file does not
supply human approval or a future green deployment.


## CI correction

Ready run39258003211 selected the correct issue108 policy but its EVENTS check
failed before content assertions: the workflow only installed pinned HTML/SEO
normalizer dependencies for earlier selected issues. Extend that same existing
conditional installation to issue108. No checks, profiles, budgets or approval
requirements are removed. The failed run remains observable; its green Basic,
style and RI subset cannot establish complete acceptance.
