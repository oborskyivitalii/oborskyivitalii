# Issue169 — native footer routing correction

Refs #169 / PR170. Orchestrator record; actual independent reports remain separate.
First pinned diagnostic [42087148352](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/42087148352)
observed exact source `3c532d2f23e9568e5d88b9b50139d45a4867829e`,
tree `35b45f7b442a771fe646844cfec8c9c07dc0d786`.

## Failure, evidence and correction

The authenticated diagnostic ZIP SHA256
`1b34f3a662b49ed7fea22e2bd2f2a68a066bfafdcddcc297490e16686d586e1c`
matches GitHub artifact13442838176. Actual28 cases:16 passed,2 failed,10 not observed.
Both no-JS contexts passed; both normal contexts failed the first footer-next leg.
Earlier reader entry, Back, viewer, exact five-figure/PDF checks and console cases
passed. This is partial historical evidence, not whole native/browser acceptance.

The footer actually emitted `writing.html?view=talks`. Nonembedded `routeFor` resolves
the pathname as Writing and ignores that offline-only query, so the same-page branch
changed the query and scrolled to the top. Both traces show a successful click, Writing
remaining active and no third camera/route-block phase. The earlier self-box CSS
departure/Back arrival did start and end at700ms; the footer-next phase never began.
Independent Code/White-box/Exploratory diagnoses agree from their own raw evidence.
The URL producer defect predates this PR; it is not established as a regression from
the earlier `scroll-entry` self-box change. No animation assertion or timeout is waived.

`navigation.js` now owns `routeHref`: finite declared routes use the existing
directory/embedded-file/`address` rules. Public `SiteNavigation.href` and programmatic
`go` share that owner; the footer effect consumes it instead of inventing a query URL.
Native/project routes use their actual page aliases; the standalone embedded edition
retains its same-document view query. The dependent effect requires that API.

The maintained navigation test exercises actual router/address/href and footer-producer
functions across native root, nested project/snapshot and embedded file contexts,
including invalid routes and the observed old native query failure. Its new flight
source dependency is explicitly registered so a flight-only edit selects this
regression. Initial test fixture used a snapshot query for a canonical-page negative;
the fixture was corrected, and the original failure is retained separately.

## Actual checks and independent limits

Navigation+flight suites:53/53 passed, zero failed/skipped. Native generation, previews
and offline bundle passed; Code independently checked generation freshness. Existing
Basic/style/format/RI and applicable source checks remain required on the prepared
correction. Manuscript, five artwork sources, original R9 PDF, editorial meaning,
publication profile/material/rights and runtime-family registry are unchanged.

Four role continuations preserve their first actual-result judgments. Requirements
approved the bounded treatment and inspected the actual source. Code and White-box
inspected the app/test delta and independently verified selector allocation and focused
regressions. Exploratory authored only the QA oracle correction: semantic next route
from actual primary order/prepared native alias/site-base replaces the `view`-query
assumption. Final probe SHA256 is
`80b1d00181ae4cc3fd7ce66346be39170247ca38ffa87a455206668a52e1cb7d`.
The28 cases/four contexts/240s limit, actual CSS start+end, Back/focus/scroll and failure
evidence rules remain. The observation code is independently reviewed; no new browser
success is claimed until execution of a new coherent commit.

See `r9/footer-fix-input-manifest.json` for exact prepared input hashes and the dated
footer correction Code/White-box, actual-result Requirements and pinned Exploratory
reports. CS01/04 retain one URL owner; CS05 uses canonical formatting; finite route
validation and bounded existing diagnostic obligations remain. The next bounded action
is the same diagnostic on the committed correction. A failure is diagnosed before
replay. Runtime-family admission, full hosted/source gates, staging, protected merge,
production rights/archive and served article/PDF verification remain open.

RI initially refused duplicate diagnostic PNGs because its existing total content-hash bound was reached. Those exact originals remain in authenticated artifact13442838176 and the compact author evidence archive; the repository retains compressed raw report, source/ZIP/member hashes and independent inspections. Duplicate PNG copies are omitted from Git without increasing any RI bound or removing product/publication inputs.
