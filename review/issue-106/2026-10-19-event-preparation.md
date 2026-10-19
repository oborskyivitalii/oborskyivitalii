# Issue106 — 19 October event preparation implementation

Owning issue: [106](https://github.com/oborskyivitalii/oborskyivitalii/issues/106),
approved event extension of19October. Execution stays in Draft PR107. Concrete
PMDay Winter content belongs to issue108. This is implementing-agent self-review,
not independent or author/rights acceptance.

Inspected baseline: main0098f804 / PR1077ad7d4b. The concurrent F01–F03 corrections
are kept separate and must be integrated from their committed source before
final exact-head validation. No shared dirty checkout was edited.

## Intent and implementation

- AC12: event facts and public-safe source observations; pending title/slot/
  language/deck; verified typed destinations; no article/publisher dependency.
- AC13: absolute dates or event calendar-day offsets with IANA promotion zones;
  seasonal UTC conversion, DST ambiguity/gap rejection and feasible transitive
  dependency resolution.
- AC14: shared escaped1080×1350 announcement/slide/reminder HTML+CSS; PNG/PDF
  extraction through existing Playwright toolchain; full-page source PDF snapshot
  extraction with Poppler and explicit credit. Browser bounds and mobile/rights
  review establish different things.
- AC15: explicit EN/UA language and one authored copy owner per piece.
- AC16: transactional offline kit, text/image/PDF/HTML, review index/checklist,
  source/producer/file manifests and private RFC5545 reminder export. Stable UID,
  explicit revision SEQUENCE and Unicode byte folding; no invitation/account
  write, site deployment, social posting or claimed observed publication.
- AC17: standing guide, manual exact-SHA workflow, permanent source negatives,
  owning policy and registry/RI/CI routing. Original article AC02–AC11 remain open.

The actual first consumer is `drafts/events/pmday-winter-2027/`: one authored
English announcement, a neutral card candidate, five explicitly planned pieces,
the agreed dates/languages and registration evidence. No older PMDay talk or
article is substituted for an unconfirmed January session.

## Verification and findings

Preparation checks before source integration:

- Article11/11 plus event10/10 meaningful source groups passed.
- Basic passed14 source +10 Color/flight cases; existing public source/output
  remained unchanged by event tooling.
- Profile selection24/24 passed; bounded style and maintained ESLint passed.
- The first PNG and its one-page PDF were visually inspected. Independent
  `icalendar7.3.0` parsed six reminders, each09:00 Europe/Warsaw; October uses
  UTC+02 and December–February UTC+01. This is file parsing, not a Google Calendar
  import or an account-state observation.
- Local locked-browser download failed with invalid ZIP responses. A separately
  identified diagnostic Chromium138.0.7204.0 rendered announcement, synthetic
  source-slide and Ukrainian reminder candidates; bounded text checks passed and
  an overlong headline failed. This does not claim the locked CI browser passed.

| Finding | Treatment | Remaining review |
| --- | --- | --- |
| Inline font ink can extend beyond a line box without clipping | Check actual configured height caps, width and card bounds; retain visual review | Author/mobile |
| Original deck typography can be too small when embedded | Preserve full page, retain separate credit; require actual phone-width review and an authored derivative if needed | Actual deck unavailable |
| ICS import behavior varies by calendar app | Stable IDs/sequences and explicit import/update instructions; no universal deduplication claim | Actual selected calendar import |
| Event observations and approval hashes are attestations | Source-safe notes and hash consistency; factual/rights decisions stay human | Author/editorial/rights |

## Applicable code style

CS01/02/04: canonical event data and copy stay outside public output, one shared
card template/CSS, shared strict field validators and existing hashing/HTML
escaping. Article semantics stay in their existing adapter. CS03: static
appearance is canonical CSS, embedded byte-for-byte only for offline output.
CS05: maintained pinned formatting and lint. CS06: no site runtime/lifecycle
change. CS07: bounded inputs/output, one sequential offline browser, no network
requests, temporary source-deck snapshot and cleanup. CS08/09: meaningful failure
coverage, Basic and bounded style guard. CS10: AC12–AC17 mapped under the same
issue106 policy; no legacy exception or test-budget increase.

## Acceptance and next step

| AC | Automated evidence | Remaining whole-criterion gate |
| --- | --- | --- |
| AC12–AC13 | Reuse/source/CTA/schedule/DST/dependency tests | Author and independent review |
| AC14 | Deck pins/template escaping; actual diagnostic render/overflow negative | Actual presentation, mobile/editorial/rights and independent review |
| AC15 | Mixed-language source ownership | Author review of actual later copy |
| AC16 | Transactional copy-only kit, manifest, calendar identity/folding; actual PNG/PDF/ICS observation | Locked CI workflow run and author/independent acceptance |
| AC17 | Mapped Basic/style/RI/CI/current-source suite | Exact integrated head evidence, independent review and merge |

Do not tick whole ACs based on partial tests. Final commit/evidence and linked kit
are recorded in the PR/issue checkpoint. The manual workflow is available after
GitHub admits its definition on the default branch. No merge/deploy/publication
or calendar-account modification is performed by this increment.

## Integrated source checkpoint

Code source d1b777743db582a1675e7f46f856d2be8efc4e61, tree
9aa184c0c64946efe24b6c5f35a0ddc942a553d5, clean before/after. This
includes the separately committed c787798 corrections without replacing them.
The event extension changes no site/docs/tools-site bytes against that corrected
parent. No independent re-review of those corrections is claimed here.

Owning policy5/5 passed, evidence_valid:true, errors empty. Permanent combined
source groups30/30 passed; RI28/28 and RI/CI20/20 passed. Maintained formatting,
ESLint and both card/review stylesheet correctness checks passed. The first
Stylelint diagnostic used its runner module as configuration and failed; rerunning
with the actual maintained stylelint.config.cjs passed.

Exact clean-source kit: review/issue-108/2026-10-19-announcement/. Manifest binds
that code commit/tree, authored copy and every produced byte. PNG1080×1350 and
one-page PDF were inspected; six ICS records parsed at09:00 Warsaw with current
immutable source links. The standalone diagnostic uses Chromium138.0.7204.0;
locked-browser CI/author/mobile/rights gates remain pending. Whole AC12–AC17 stay
open until their independent and human/merge gates are actually satisfied.

## 19 October — canonical site style follow-up (#108)

The maintainer asked whether the site style was reused. The initial promotional
stylesheet used an approximate independent palette. The producer now embeds the
exact light `:root` block from `site/engine/styles.css`; card and review CSS use
its `--paper`, `--ink`, `--accent`, `--line`, `--tint`, `--scene-sheet` and
`--sans` variables. No second authored palette or font owner remains. The source
stylesheet joins the kit's hashed/rechecked producer inputs. Cards remain offline
artifacts; no website runtime, theme switch, network access or scene is imported.

The added maintained failure case changes the canonical paper token and observes
a changed card, then removes a required token and requires failure. The existing
copy-only kit case verifies the theme source is in its manifest. The complete
article/material/event source suites pass **31/31**, with no skipped cases.
Formatting and focused ESLint/stylelint pass. A newly rendered announcement PNG
and PDF were inspected with Chromium138.0.7204.0 as a local diagnostic; the locked
CI browser, independent visual/editorial/rights gates remain separate.

The original retained kit is historical and keeps its exact source/bytes. A new
site-style kit is produced from the clean updated producer commit. Website
announcement and Autumn naming ship separately in #108/PR111. The exact Autumn
prepublication naming requirement is recorded in PR79; no old deck is used for
the future Winter session and no article is published by this change.
