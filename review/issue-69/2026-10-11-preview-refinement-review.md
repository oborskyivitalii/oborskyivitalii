# Issue 69 — 2026-10-11 independent preview-refinement review

Owning issue and dated anchor: [#69 preview refinement](https://github.com/oborskyivitalii/oborskyivitalii/issues/69#preview-refinement--11-october-2026).
Owning execution: [Draft PR71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
Reviewer: independently delegated AI source/behavior reviewer, separate from the
camera, block, router and ledger implementation authors. A second independently
delegated read-only reviewer checks the row-trajectory invariant. This does not
provide maintainer visual approval or physical-device evidence.

Inspected state: dirty prepared continuation of the starting head identified in
[the refinement analysis](2026-10-11-preview-refinement.md). Authored camera/block
owners and the corrected generated Base/Color v4 artifacts are frozen. Final actual-public functional and exact checksum checks pass; root-owned
complete admission remains pending. Prior sequenced
and security reviews remain historical observations of their own inspected bytes.

Read the repository/site ownership and acceptance instructions, CODE-STYLE,
review template, previous sequenced review, current refinement analysis, authored
camera/block owners, native border/reading-surface CSS, actual route templates,
and affected test fixtures. This reviewer does not regenerate or edit `docs/`,
runtime owners, scanner rules, the ledger or the frozen baseline.

## Intent and acceptance

The maintainer's preview correction refines AC09–AC10: smoother fractal centering;
native separators participate in block motion; reverse departure DOWN and arrival
ABOVE process visual rows from bottom to top. A lower row completes before the
row above starts; peers in each row animate together. Native reading geometry,
reading entry, all-five fixed camera, lifecycle/resource bounds and original
performance guards remain required. Existing AC01–AC08 are preserved.

## Findings

| ID | Evidence/path | Finding and implication | Affected AC | Disposition |
| --- | --- | --- | --- | --- |
| P01 | `site/engine/lifecycle.cjs`; actual lifecycle factory tests | Center/restore are now 360 ms each inside the original bounded route envelope. The positive transit interval and smooth interpolation preserve camera continuity; existing painted elapsed/pause/completion ownership remains. Independent actual-factory checks passed gradual framing, retarget/Off/hidden, same-route cleanup and interrupted reverse return. | AC06, AC09 | Four source-bound and four corrected final generated Base v4 lifecycle cases pass. Root owns complete integration/cost admission. |
| P02 | Native CSS border owners and block inventory | Previous route motion animated children/paper while native borders lived on fixed shells or ancestors. Coverage retains section/shift/nav/footer lines; article/publication/discussion borders; custom-width/colored card borders; topic-link bottom, empty-state all-side and booking-card left borders. Source fixes isolate a visible orphan separator without pulling off-fold ink into departure, skip hidden/zero-length paint, and remove old overlays before held-arrival remeasurement. | AC03, AC10 | Frozen-source regressions and corrected final actual Color native-paint/geometry/cleanup pass all ten route/viewport cases. P06 failure is retained separately. |
| P03 | Phase geometry/order | Reversing capped DOM delays alone is insufficient: per-unit outside-edge distances can converge and overlap. Approved serial visual rows and shared offscreen displacement avoid that. Native shell rectangles determine rows; extended child/separator envelopes only determine edge-clearance bounds, preventing the first-fold Home cascade from merging into one row. | AC03, AC10 | Independent corrected final actual Color v4 probe passes all 16 cases with zero crossings over 180 samples per phase, correct order/peers/edge clearance and 500/600 ms whole-phase bounds. Full public-manifest identity was independently recomputed. |
| P04 | `tests/space.test.cjs` generated runtime input | An early default run read the preceding `docs/space.js` and failed the new duration assertion. Re-running the four selected cases against a pure current canonical runtime written only to scratch passed. The stale-generated failure is diagnostic and is not a current runtime defect or a passing public-output check. | AC07, AC08 | Source-bound diagnosis resolved; root owns canonical generation and final checks. |
| P05 | Reviewed secret-disposition history and RI byte bound | Existing owner policy preserves every prior disposition. Removing the already-reviewed v3 records has no established retirement route. Whitespace-only compaction preserves parsed data and has established precedent; concise reasons for only new exact records can retain meaning without raising the byte bound. | AC07, AC08 | Verified all 190 exact new records, all 4,177 historical records data-identical, frozen baseline bytes identical and unchanged scanner/rule/budget owners. Creation ledger is 1,999,828 bytes under the original 2,000,000 byte limit. |
| P06 | Actual Color v4 native geometry; `site/engine/styles.css` final-paragraph structural selector | At 390 px Home, active reading separator spans appended to three section headings make each final paragraph stop matching `p:last-child`. Initial range is 9,381 px; departure's reading cleanup restores native paragraph styling and changes it to 9,327 px. Three section heights each shrink 18 px. The actual border/cleanup probe correctly stopped on this geometry regression. | AC03, AC10 | Resolved by canonical final-of-type selectors for the final descriptive paragraph and last authored note. The first-v4 failure is preserved; corrected final actual-public checks pass all ten cases with stable native range, exact separator paint and cancellation restoration. |

## Decisions

The preview correction is authorized within the same issue/PR. Strict serial rows
share a finite whole-phase envelope rather than multiplying the duration by row
count. Centering shares the original camera deadline. The staging failure in the
refinement analysis remains a failure against the unchanged ready limit; local
source checks cannot turn it into a pass.

For secret disposition, preserve every prior record as identical parsed data and
the frozen baseline as identical bytes. Compact JSON whitespace only and append
only independently recomputed exact path/rule/hashed-value candidates. Keep the
earlier self-review status separate from the later independently reviewed v3
append. No dynamic RI/CI candidate, blanket admission, scanner rule or budget
change is authorized by this review.

## Sol tasks

| Task | Paths and expected change | Finding / AC | Check | Status |
| --- | --- | --- | --- | --- |
| T01 | Camera lifecycle: smooth visible framing inside original route deadline | P01 / AC06, AC09 | Four independently executed actual-factory lifecycle cases | Source review complete |
| T02 | Canonical block inventory/CSS: all associated native separators move and restore | P02, P06 / AC03, AC10 | Native border geometry/paint, animation participation and cancellation paths | Corrected final actual Color checks pass ten cases; historical first-v4 failure preserved |
| T03 | Measured serial visual rows: correct directional order, simultaneous peers, no occupied-row crossing | P03 / AC03, AC10 | Source tests and independent actual-geometry trajectory checks | Corrected final actual Color 16-case probe passes with independent full-manifest binding |
| T04 | Current canonical generated runtime/output admission | P04 / AC07, AC08 | Fresh final generated bytes and integration tests | Root owns generation |
| T05 | Exact new public checksum disposition with data-preserving compaction | P05 / AC07, AC08 | Independently recompute candidates; exact append, historical prefix, baseline, rules and bound | Verified 190 exact new records; final review-status byte-bound recheck and root-owned complete scanner admission remain |

## Acceptance evidence

Independent source-bound camera command used the existing `SITE_SPACE_SOURCE`
override with pure `tools/site/build.cjs` runtime output in scratch:
`node --test --test-name-pattern='framing moves smoothly|route flights use one canvas|returning to the old mounted route|same-route' tests/space.test.cjs`.
Result: **4 tests, 4 pass, zero fail/skip/cancel/todo**, including actual staged
framing. This is authored-source evidence, not final generated-public, hosted,
performance or physical-device evidence.

The same four cases separately pass against the corrected final actual generated
Base v4 `space.js`: **4 tests, 4 pass, zero fail/skip/cancel/todo**. The CommonJS model
fixture cannot load Color's browser-only effect prelude without `window`; an
attempt stopped at fixture initialization and supplies no Color runtime result.
Color runtime behavior is tested through actual Chromium instead.

This reviewer executed the frozen-source controller/router/flight selection:
`node --test tests/scroll-entry.test.cjs tests/navigation.test.cjs tests/flight.test.cjs`.
Result: **49 tests, 49 pass, zero fail/skip/cancel/todo**: 25 entry, 14 navigation,
10 flight. New negative checks include visible orphan separators, hidden bordered
sources, every native border side, held remeasurement, native row grouping with
large child paint outsets, and strict finite row timing. These passing source
checks did not establish P06's actual paragraph/native-range invariance.

The separately delegated corrected final actual Color v4 trajectory probe covers
Home/Research, 390/1440 px, forward/reverse, departure/arrival: **16 cases pass**, 180 paused CSS
samples per phase. It verifies initially separated horizontal visual lanes never
cross on screen, row timing/peer equality, complete edge clearance, and whole-phase
500/600 ms bounds. It independently recomputes the full public manifest and binds
the scratch script, actual public assets and source bytes. This is local Chromium
behavior evidence, not hosted, cost, physical-device or user visual acceptance.

The first actual all-route separator/native-cleanup probe stopped on Home
390 px with P06's 54 px range failure. That record remains distinct from the
corrected final result. Canonical `:last-of-type` selectors retain final-paragraph
and last-authored-note styling when temporary separator spans are appended.
The actual-public all-route probe on corrected final Color bytes passes
**10 cases** (390/1440 px × all five routes), checking native reading range before
and after suspension, each animated native border's side/width/style/color/length
and position, whole-block or proxy participation of visible borders, hidden
empty-state exclusion, held-arrival reread, complete temporary-attribute/layer
cleanup, including all four per-edge owner attributes, and exact native
rectangles/border paint after both departure and arrival cancellation. There are
zero JavaScript errors. The probe tests controller phases directly, while root's
separate journey collector owns full router integration.

The final separator, trajectory and camera records are source/public-bound
scratch observations retained in root's registered refinement browser archive.
The prior failing separator observation and earlier trajectory result retain their
original artifact identities; they are not relabelled as final evidence. The
[refinement summary](2026-10-11-preview-refinement-summary.json) owns exact final
Base/Color manifest identities and the archive mapping.

The independent read-only checksum verifier passes **190/190** new exact
path/rule/hashed-value dispositions: 186 current canonical
cold-generation/revision/preview/bundle values and four final-summary
Base/Color artifact/Git values. It independently extracts each actual scanner-line
value and recomputes its hash, regenerates canonical public identities without
mutating tracked output, hashes every Base/Color public file and checks complete
manifest inventories/sizes, recomputes every Color byte from actual Base bytes and
authored effect descriptors, and recomputes raw Git object header/body identities.
The exact appended ID set has no extras or duplicates. All 4,177 historical
ordered records remain identical as parsed data; the frozen baseline remains
identical bytes. Scanner, rule, budget and canonical triage owners match the
starting head. JSON compaction affects whitespace only in historical data; only
the 190 new records receive concise public-checksum reasons. The creation ledger
has 4,367 records and is **1,999,828 bytes**, below the unchanged 2,000,000 byte
limit.

The [compressed exact proof](2026-10-11-refined-security-proof.json.gz) retains
`rawFindings`, `scanSha256`, `priorLedgerSha256`, `frozenBaselineSha256`,
`artifactBindings` (including each manifest byte hash), `gitIdentities`,
`creationLedgerBytes`, `appendedLedgerSha256`, and the 190 exact source-line/producer
records. It also retains the inert producer source and distinct failed initial
scanner log/raw finding map; the reviewer verifies that log and its 192 unknown
non-RI candidate count. The reviewer independently verifies every
named input binding and archive mapping, including the complete raw finding map.
The ledger byte figure is the creation-time pending-review snapshot; a later
new-record review-status wording update is a separate final bounded write.
Inherited record reasons and review status remain unchanged. Dynamic RI/CI
candidates are excluded from this append and require root's exact current-source
verification plus complete security admission. The earlier initial full scan
with untriaged candidates remains retained as a failure; this exact disposition
review is not a claim that the final complete scanner has passed.

| AC | Check/test | Result | Exact source/run/artifact | Remaining gate |
| --- | --- | --- | --- | --- |
| AC03, AC10 | Separator, row and native geometry review | 49 source checks, ten final separator/native cases and 16 final trajectories pass; first-v4 failure preserved | Frozen authored owners; corrected final actual Base/Color v4 bytes | Root-owned complete public integration and user/device gates |
| AC06, AC09 | Gradual framing and lifecycle | Four targeted source-bound cases and four corrected final generated Base cases pass | Pure canonical runtime and corrected final Base v4; framing owner diff | Root-owned complete cost/public evidence |
| AC07, AC08 | Ownership and exact false-positive disposition | 190 exact records, historical prefix, frozen baseline, owners and creation byte bound pass | Current compressed exact proof and prior reviewed history | Final review-status byte bound, refreshed RI/CI and complete security admission |

## Issue synopsis

Independent source review confirms gradual centering inside the existing route
deadline. Corrected final actual Color trajectories and all-route native
separator/cleanup checks pass. The first-v4 54 px mobile Home range regression
was corrected and its failed observation remains separate. All 190 new exact checksum records and the data-preserving ledger compaction
are independently verified. Maintain the failed staging observation and the separate user/device, clean CI, cost, merge and production gates.
