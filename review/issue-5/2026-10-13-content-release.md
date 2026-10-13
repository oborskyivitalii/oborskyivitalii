# Writing catalog and independent content release

Owner: [issue #5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5).
Execution: [PR #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Inspection baseline: `e830752f58535c9e2226550a9661ee51c745bdb3`, tree
`b3e197dfa681702d9f14a74ac93da6e433de20e4`. Implementation evidence below must
name its own final source; this baseline's green checks do not admit new code.

## Decision and scope

On 13 October the author deferred the real PMDay article until its author-approved
chapters are supplied. Existing manuscript, blueprint and exports are technical
fixtures, not editorial acceptance. Issue #2's original publication criteria
remain open; accepted recording AC07/AC08 stay preserved. The author then said
“Роби” to the Writing/count and independent content release proposal.

One repository keeps the platform, catalog and article sources. Static full HTML
and one coherent deployment package remain. A content release reuses a verified
platform rather than recompiling it. This does not add a CMS or authorize merge,
production activation, external posting, or upstream presentation-engine transfer.

## Acceptance and plan

| Criterion | Observable outcome | Verification |
| --- | --- | --- |
| AC13 | One Writing entry collection creates cards, year/topic groups, controls, JSON-LD and simple count; alternate platform links count once; drafts stay separate | Add/remove/alternate/new-year/local/draft tests; archive filtering/history/print behavior; hosted Writing |
| AC14 | An article edit does not invalidate unrelated routes/articles; verified platform bytes are reused into a coherent complete artifact | Incremental/cold parity, changed-byte inventory; malformed/tampered/incompatible baseline and manifest negatives; retained navigation and hosted reader |
| AC15 | Content and platform changes have explicit source-profile selection and build paths; runtime changes keep applicable full regression | Classifier/profile negatives, workflow/source registry coupling, exact-source CI; no budget changes |

1. Render existing catalog records automatically and replace count prose with a
   dedicated count. Preserve every existing edition/date/URL/language and card.
2. Remove whole-article-registry dependencies from each route and article. Pin a
   bounded compatible document manifest on navigation, retain native fallbacks
   and old immutable resources, and keep offline embedded exports separate.
3. Add an explicit verified-baseline content release. Reject changed platform,
   tampered/partial output or inconsistent manifests before replacing output.
4. Integrate formal source/check selection and current complete artifact delivery.
   This implementation itself changes runtime and cannot use content-only proof.
5. Run Basic, mapped source and repository/RI/style checks; independently review
   the complete changed contracts; publish the same PR's explicit test preview.

## Style and source ownership

Applicable CS01–CS10: catalog/prose in `site/content/`, layout in templates,
filter/navigation lifecycle in `site/engine/`, build and content release in
`tools/site/`, CI selection in `tools/quality/` and workflows. Canonical CSS owns
the count's appearance. Review explicit dependencies, cancellation and bounded
manifest loads; preserve budgets. Formatting is limited to touched functions.
Generated docs and RI are regenerated, never edited as sources.

## Current evidence

Implemented automatic Writing cards/groups/controls/count/ItemList, independent
article and related-translation identities, first-navigation compatible manifest,
verified-baseline content generation, old decorated immutable retention and
formal Basic/preview content selection. The current raw platform is
`0bd39d2137c0b6ea2c9066c849573f22741a100098814f923f8022b07d46475a`.

Prepared local observations: Basic passes with 15 theme/archive and 10 Color cases,
five routes, finite geometry, syntax, exact snapshots and original size bounds;
native article/engine/navigation/Color suites pass 78/78; content release/candidate
source pass 12/12 in the final focused run; baseline/profile/fixture
checks pass 33/33; Writing/content checks pass 35/35; executive SEO checks pass 18/18.
These overlap and are not summed into an invented unique total. Scoped ESLint and
the bounded style guard pass. Exact clean-head/source/RI/owning/hosted CI remains
pending and must bind its own head/tree/artifact identity.

The first prepared complete Node source execution failed on the frozen SEO
comparison because the new renderer metadata and generated JSON-LD wrapper were
not admitted. Its original [raw log](2026-10-13-local-source-failure.log.gz) remains
failed. Exact single renderer-marker reversal and four finite canonical schema
encodings correct this; altered, duplicate, malformed or stale catalog metadata
still rejects. The corrected current executive suite passes 18/18. This does not
reinterpret the earlier failed run as a pass.

A [second prepared complete-source attempt](2026-10-13-local-source-second-failure.log.gz)
failed and reached the unchanged 180-second process bound. It exposed a real
profile-independent diagnostic upload name, an old Color fixture identity and an
analytics cold-copy assertion during its dependency correction. Their final
focused checks and clean-head run must supply fresh evidence; this attempt stays
failed and cannot supply test totals or completion.

The diagnostic upload now includes its profile: 70 names remain unique; current
quality/staging fixture checks pass 32/32. Analytics checks pass 11/11. A temporary
30-record catalog with a genuine Git-pinned accepted native article passes all
71 affected source cases. A separate observed-publication/canonical fixture passes
its single cold-preparation case and retains its verified offline canonical link.
These source fixtures reach an explicit browser boundary; they do not claim live
publication, editorial acceptance or an executed browser journey.

[Independent agent source review](2026-10-13-independent-content-review.md)
records exact inspected bytes, early blockers/resolutions, closed Color byte
verification and the remaining actual managed content/no-JS browser observation.
Historical R2 migration diagnostics remain unchanged, outside routine admission;
their original producer snapshots are not replayed against later approved prose.
Two new permanent content baseline/release suites retain meaningful rejection
cases; previous source/hosted/release budgets and 18 historical Color tuples remain.

Raw generation only rebuilds dependent content. The existing delivery edition can
rebind all document aliases/snapshots to a new source and banner while reusing the
platform. One coherent deploy remains. Missing/expired/nonancestor or incompatible
admitted baselines explicitly select an ordinary build. PMDay remains a test
fixture; PDF/kit retain their declared earlier producers.

The first prepared repository run found the new operator guide missing from the
active Markdown inventory (109 cases, one error). Its link route is now declared;
the final current-source repository run must verify that correction.

## First published execution and installer correction

Published implementation `a775acde6e328eafd752ff5713d3f1b59001fb4d`, tree
`817033e5ed0ae65c8c66cc1efcab783e2c1fc796`, is byte-identical to the prepared
local tree; the authenticated GitHub API published it after normal push lacked
credentials. Its [Basic/source CI](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38399836195)
passes 727/727 additional cases in 162883ms, within the original 180-second bound.
[Navigation/RI](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38399835354)
and [actual preview smoke](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38399835864)
pass. The local supplementary source attempt reached the unchanged time bound
and remains failed; it is not substituted for this CI observation.

The [first owning CI](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38399835242)
failed only WRITING-CATALOG: its installer omitted the canonical quality Python
environment now needed by SEO parity. The [exact failed report](2026-10-13-owning-first-failure.json.gz)
retains that failure (raw JSON SHA256
`a750f69fd1a487cfe70dbaea134898563f5125590cb4ef13ba84f1740767b982`).
The narrow workflow correction installs the existing pinned Ruff/PyYAML venv
for issue5, preserves the npm guards, all assertions and budgets, and awaits
new exact-head CI. The local clean-head policy at a775 passes all ten check
groups; original twelve human gates remain pending.

Ready-event preview does not request the optional label diagnostic. After new
source/RI/owning admission, the existing stage-regression label route must run
the actual managed synthetic content journey, with no promotion.

## 50dda admission, managed content and scanner correction

`50dda95157d1994b0d935135bf8ff905910fcd05` / tree
`0ac31dacd4c4cf4e9ee94d7b725f7ad07c1a52d4` has successful
[Basic/source727](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38402725121),
[owning all ten checks](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38402723810),
[navigation](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38402723946)
and [actual preview](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38402724256).
Its [managed content diagnostic](2026-10-13-content-browser-first.json.gz) passes
seven actual Chromium cases: Writing without JavaScript at1440/390 shows29
complete public entries; the changed synthetic article passes normal1440/390,
Off, noCanvas and noJS. Genuine content generation rebuilds Writing and one
synthetic article, reuses the other four routes and frozen platform0bd. The
report explicitly denies full gate, production and deployment authorization.

The [labeled staging run](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38403412354)
passes source690/690 Node +109/109 Python, hosted identity, bounded browser
and performance, and its separate seven-case content fixture. Its aggregate
gate correctly fails: Semgrep catches the balanced SEO parser RegExp.exec
as its broad shell-exec sink. The [exact scanner report](2026-10-13-semgrep-first-failure.json.gz)
retains one finding, zero errors and242 scanned files; raw JSON SHA256
`51975e27993c092ca95848e10d6de102fabea286816252035489184787dea215`.
The one-line matchAll correction preserves the same start index, nested depth
and failure branches, without suppressions or rule changes. Focused53/53,
targeted Semgrep zero findings/errors with nonempty coverage, and independent
17-case old/new equivalence pass. All fifteen producer inputs and raw0bd
platform bytes stay frozen. New exact-source CI and scanner/stage admission
must confirm this correction; the failed50dda stage is not reclassified.

## Generated checksum admission

The first full prepared security run after the iterator correction passes
Semgrep with zero findings/errors across 242 files and unchanged Bandit triage
(36 raw reviewed findings, zero errors). Its downstream secret scan correctly
fails on 219 untriaged Hex High Entropy candidates. Independent producer review
identifies 217 public SHA256 checksums and two occurrences of the frozen e830
Git comparison pin; there are no unknown credentials or other finding types.
This failed preparation is not a CI or staging pass.

Authored evidence/constants/pins retain exact path/type/hashed-value dispositions
in the existing publication ledger, with all prior records preserved. Generated
checksums use a bounded canonical proof: current build and maintained preview
producer freshness, explicit fingerprint/digest fields, exact occurrence/line
and file-byte binding. Unknown, stale, wrong-path/type and copied-to-prose
values fail. Strict publisher validation additionally proves locally recomputable
edition source/semantic/derivation, local asset and profile launch-source fields; external
reference and rights evidence remains individually reviewed. Retained frozen
editions require exact Git bytes and a historically selecting context passing the
complete current publisher validator; preparatory/orphan/incomplete contexts do
not establish authority. The proof has no
ledger writes and does not change the conservative
policy classifier. Ordinary future content updates therefore do not require new
manual dispositions for their regenerated identities. The heavy security route
owns the cold proof; Basic/Preview retain their verified generation reuse.

Prepared Basic passes. Maintained lint passes 265 sources with zero warnings;
current locked dependency admission covers 88 Python dependencies and 71 publisher
dependencies, retaining the existing reviewed npm exception. These prepared
observations and the new proof's independent review/negatives must be followed
by fresh published-source security, CI and labeled-stage admission.

The final maintained checksum suite passes 27/27 in 11.19s, including accepted
v1→v2 with a retained adaptation, updated launch/source pins, 101 metadata-only
commits, a prepared record before its later valid selection, inactive draft
exclusion and stale-source rejection. Scoped ESLint has zero errors/warnings;
targeted Semgrep has zero findings/errors and scans all three changed JS owners.
Its earlier HTML-RegExp partial parser error is corrected without exclusion.
Inherited Git routing and config injection, including `GIT_CONFIG` and its
prefix/case variants, reject before publisher execution and are stripped from
private Git operations. The owned negative verifies outside config bytes and
original HEAD/config remain unchanged. Historical data uses regular Git blobs,
never checkout filters, hooks or historical code.

Independent current-source probes verify two owners sharing one historical
freeze commit and reject a historical symlink-mode asset even when its blob
contains valid PNG bytes. These are field-collection observations, separate from
whole-factory and CI admission. Their inspected helper SHA256 is
`56e34f3bf3cbc8db1ac6d3a04d955ec835db6c3cb48844b315bd9fad781182e6`.

Final prepared working-tree checks pass: full Semgrep scans 243 files with zero
findings/errors; unchanged Bandit triage admits all 36 reviewed raw findings;
the secret scan admits all 5043 candidates, including 262 factory-proved generated
occurrences across 33 files/292 IDs. Maintained lint scans 266 sources with no
warnings, repository regressions pass 109/109, and style guard, formatter,
current RI and coupling verification pass. These are prepared observations at
the reviewed 73-path authored digest
`2f56bafa00895750f34e81cc7d39d1e26a17ffe339563c6f22d5beb0b1d92612`;
the package/report still records dirty parent 50dda and cannot supply clean-head
CI admission. Publishing the exact tree and fresh CI remain the next steps.

AC13–AC15 remain unchecked pending exact-source completion. Original human,
editorial, rights, actual publication, upstream and merge gates stay separate.
