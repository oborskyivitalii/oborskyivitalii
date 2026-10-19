# Event announcement preparation

Owner: [issue106](https://github.com/oborskyivitalii/oborskyivitalii/issues/106).
The event's own issue owns facts, authored copy, visuals and website placement.
The first consumer is [PMDay Winter 2027, issue108](https://github.com/oborskyivitalii/oborskyivitalii/issues/108).
Article campaigns retain the [version1 contract](ARTICLE-DISTRIBUTION.md).

## Source and ownership

Keep working inputs at `drafts/events/EVENT_ID/`:

- `event.json`: strict schema1, stable id/revision, name/date/IANA timezone,
  format/organizer/speaker, optional confirmed session fields, verified typed
  destinations, optional canonical PDF deck and source observation.
- `sources/*.md`: public-safe observation notes with source URLs, observedAt
  timestamps and byte pins. Observations record what was actually checked;
  hashes cannot establish factual accuracy or rights.
- `brief.en.md` (or another explicitly selected local Markdown owner).
- `plan.json`: strict schema2, event source hash, revision/updatedAt, promotion
  timezone, pinned brief and at most32 pieces.
- `posts/PIECE_ID.en.md` / `.uk.md`: one authored copy per declared piece.
- `reviews/PIECE_ID.md`: review evidence only after an actual review.

The real PMDay records are a complete shape example. Null title/time/language/
track/deck fields mean unconfirmed. A null piece content means planned, with a
purpose rather than pretend finished copy. Images never invent session details.
An event needs no article, publisher baseline or site-publication date.
Working inputs and generated kits do not enter the public website automatically.

Each piece has its own `language`, purpose, copy pin, typed destination ID,
schedule, optional visual and approval record. Destinations are registration,
programme, Talks, article, deck or recording. HTTPS and matching observation
notes are checked; live availability and current programme remain author checks.
No preview/staging/credential/IP destinations are accepted.

## Schedule and calendar

An event window is either:

```json
{"anchor":"event","from":-14,"to":-10,"time":"09:00","after":[]}
```

or exact local dates:

```json
{"anchor":"date","from":"2027-01-12","to":"2027-01-12","time":"09:00","after":[]}
```

Offsets are calendar days before/after the event's stated date. The plan's IANA
timezone owns promotion times. Scheduling chooses the earliest feasible instant
through the complete dependency graph. Unknown dependencies, cycles, impossible
transitive windows, invalid dates and ambiguous/nonexistent DST times fail.
Change a DST transition time deliberately instead of silently choosing an offset.

The ICS uses UTC DTSTART/DTEND, stable event/piece UIDs, event+plan revision
SEQUENCE, UTF-8 octet folding, private tentative entries and fifteen-minute
display alarms. It includes actual authored copy or explicit preparation needs,
destination and kit filenames. No attendees/invitations or account writes occur.
Increment event or plan revision and updatedAt when changing a schedule/content.
Update-aware consumers can reconcile UIDs; repeated plain file imports may still
duplicate events in some apps. Inspect the selected import destination and old
entries rather than promise app-independent deduplication.

## Visuals, sources and bounded build

`announcement`, `slide` and `reminder` use one card template and stylesheet in
`tools/distribution/templates/`. The renderer emits1080×1350 PNG, uniform single
page PDF and self-contained HTML. It escapes authored text, forbids network
requests, checks layout bounds and records actual Chromium version. CSS owns
layout; `site/engine/styles.css` remains the single colour and typography owner.
Both cards and review HTML embed its exact light `:root` block and use those
variables. The source stylesheet is hashed in the kit manifest and rechecked
before completion; a theme edit requires a new kit and visual inspection.
The browser is an offline build dependency, never a site runtime.

A slide visual names a page of the event's actual pinned PDF deck. The build
copies those exact bytes into a temporary extraction snapshot, extracts the full
page with Poppler without cropping, preserves the source and adds its declared
credit. It does not edit the presentation, invent a new slide or prove rights.
Inspect the full source slide at phone width; its own typography may need a
separately reviewed derivative even when the surrounding card fits.

Text inputs are at most100KB each; binary decks at most50MiB; aggregate inputs
and kit output at most128MiB; no symlinks/traversal. Output must be a new path
outside the repository. Source+producer hashes are rechecked before the
temporary kit becomes visible. Errors retain no partially accepted kit.

```sh
node tools/distribution/cli.cjs validate-event pmday-winter-2027
node tools/distribution/cli.cjs build-event pmday-winter-2027 /tmp/pmday-kit announcement
node --test tests/event-campaign.test.cjs tests/campaign.test.cjs
```

The build needs the existing locked `tools/quality/toolchain` Playwright and its
Chromium installation; slide extraction additionally needs `pdftoppm` (Poppler).
`SITE_AUDIT_CHROME` can select a separately identified local Chromium for a
bounded diagnostic. That observation is not a pass on the locked CI browser.
There is no new production dependency, paid-model call or external posting API.

The manually selectable [campaign-kit workflow](../.github/workflows/campaign-kit.yml)
checks out an exact source SHA, validates, runs the event source tests and builds
one selected authored piece or all authored pieces. Downloaded artifacts contain
copy, PNG/PDF/HTML, a review index, full campaign ICS, checklist and file/input
manifests. Five planned future pieces do not become five fabricated posts.

## Review and publication states

Bindings conservatively cover the whole event/plan, authored pieces, source
observations, brief, copy and exact deck. Any relevant campaign edit invalidates
old review bindings. Reuse the article approval-record shape:
`bindingSha256`, `reviewedAt` and pinned `evidence` at `reviews/PIECE_ID.md`.
Do not mechanically update an old attestation after a changed source.

Reports distinguish `planned`, `authored` and `approval-recorded`. Every kit is
`draft-only`, `releaseEligible:false`, with no observed publications. Exporting
an ICS is not scheduling LinkedIn or observing a published post. Actual author,
editorial, visual, rights and channel review remain separate. Record actual
publication URL/time/edition only after publishing, through the eventual shared
observation workflow; it remains unfinished under original AC08.

The public Talks entry belongs to the event issue and uses existing site owners.
Article reader materials use their existing explicit allowlist. No campaign
file or source deck is implicitly uploaded by this preparation command.
