# Issue106 - first article launch and carousel kit

Owner: [issue106](https://github.com/oborskyivitalii/oborskyivitalii/issues/106).
Execution: existing Draft PR107. Author requested the next stated preparation steps.
Role: implementation and editorial/visual self-review; independent acceptance is separate.

## Bounded implementation and verification map

Article publication stays PR79 / #2 / #5 and does not wait for this kit. The
publisher is not on main. An explicitly selected clean, exact-SHA publisher
checkout may supply its canonical validated model for draft preparation only;
do not copy its manuscript, media or publisher code into PR107. The normal
single-checkout route still requires that baseline. Pin both repositories and
every consumed input; refuse stale source, missing media or changes during build.

Prepare a launch caption/cover and the first seven-frame delivery-constraint
carousel against the actual R12 Cover02 review edition. One campaign caption and
one pinned frame script own their distinct text. Existing source media remain
unchanged. Canonical/D0 remain pending; no publication or channel approval is
inferred. Remaining article campaign pieces follow author review of this design.

| AC | Owner/change | Meaningful verification before acceptance |
| --- | --- | --- |
| AC02/03 | Existing campaign schema/loader; optional pinned frame script and explicit publisher checkout | Existing v1 inputs remain compatible; reject missing/stale frame/media/source/approval, wrong or dirty publisher SHA, mutation and unsafe paths; a second synthetic article proves reuse. |
| AC04/05 | Article-local brief, two captions, launch cover and seven carousel frames | Editorial source map; preserve weekly 8/100/+92 synthetic conditions and controlled-intake countercase. Inspect every rendered frame and phone-size preview; author/rights acceptance pending. |
| AC06 | Existing actual-or-pending canonical helper and checklist | No invented/staging URL, D0, calendar or release-ready state. Pending source means draft kit only. |
| AC07 | Shared card/document renderer, isolated article kit and manual workflow | Equal PDF page sizes/count, PNG geometry, no overflow/network, complete manifests, no source/public mutation or overwrite; exact producer/input recheck. |
| AC09 | Manual aggregate review templates | Unknown/unavailable data and equal-age windows remain explicit; no private contacts or invented outcomes. |
| AC10/11 | Source/RI/style routes and preserved material module | Existing material/privacy/stale negatives retained; Basic, owning policy, pinned formatter, focused lint, RI/coupling and exact Git identities. |
| Event AC14/16/17; #108 AC07 | Existing promotion template and canonical theme | Consume the actual site's root palette/font declarations, not copied color values; retain event behavior and inspect a regenerated announcement. |

CS01/02/04: existing caption/campaign/media owners and one shared renderer;
CS03: canonical theme plus layout CSS, no inline authored styles; CS05: pinned
format/lint; CS06: no browser runtime delta; CS07: existing 32-piece, input,
128MiB kit and source-test budgets unchanged; CS08/09/10: behavioral refusal,
bounded guard and exact-source evidence. Current-source results and actual
rendering producer will replace this preparation status before handoff.

## Status

Implemented the explicit publisher bridge, optional frame scripts, isolated shared
article renderer, actual canonical theme for both cards and review indexes, manual
workflow and aggregate D+7/D+21 template. The actual R12 Cover02 review source is
consumed read-only from clean PR79 b0ff55d; no manuscript/media/publisher files are
copied. The first launch and seven-frame carousel preserve source credit and the
weekly synthetic 8→100 generation / fixed8 delivery / +92 all-admitted backlog;
the controlled-intake8/8/0 countercase is separate. No observed AI effect is claimed.

Independent read-only AI review requested changes for three new P2 defects:

| ID | Finding | Correction and verification |
| --- | --- | --- |
| K01 | Cached CommonJS facade could attest a later SHA while executing old code | Fresh child process loads the selected facade and its complete dependencies for every call; maintained same-path/new-commit dependency probe observes the newly selected throwing producer. |
| K02 | Selected media on non-cover layouts was silently hidden | Schema rejects media on text/numbers/closing and requires it on cover; maintained cases and actual hidden-image renderer refusal. |
| K03 | Undecodable pinned PNG could produce a blank successful kit | Await every image decode; require natural and visible dimensions before PNG/PDF; actual Chromium positive and corrupt-header negatives. |

Reviewer reproduced both image defects through the complete kit in disposable
fixtures and the cache defect through the exported API; current PMDay image
corruption was not alleged. Existing F01–F03 corrections remain intact.
The first concurrent-theme integration test run failed one mutation fixture:
replacing the whole stylesheet caused missing-token refusal before the intended
final digest check. The fixture now changes a valid token in the complete CSS,
retaining the original `Changed promotion input` assertion. This is retained as
a failed intermediate run, not a pass or relaxed acceptance.

Final exact-source checks, independent re-review and clean rendered-kit identities
are recorded by the following evidence checkpoint. A local Chromium138 diagnostic
is separate from locked CI and physical-device acceptance. No merge, site deployment, calendar-account write or
social publication. Original whole criteria and editorial/rights/release gates
remain open.


## Focused independent re-review

A separate read-only AI reviewer re-exercised K01–K03 after the fixes and the
concurrent canonical-theme integration over53b1417. Verdict: **all three P2 findings
addressed; no remaining blocker within those fixes**. Article-kit7/7 and actual
Chromium renderer2/2 pass; real PMDay validation succeeds against clean b0ff55d,
with both destinations still null. The reviewer did not edit files or run full
policy/RI. This is bounded technical review, not author/editorial/rights or
whole-issue acceptance. Final Git/source and visual evidence follow separately.


## Clean producer and retained evidence

Code **213b827015009654ced53c7dd5f3fc5156303975**, tree
**89f9dafcae6929b22a50dbeaaa7c465a1c6652da**, is clean before and after
production. It preserves concurrent theme commit53b1417 and retained kit/catalog
commitscaeb1e3/7d28a20. API-uploaded tree equals the locally checked tree.

- Exact owning policy **5/5 passed**, evidence valid/errors empty:
  [producer-acceptance](2026-10-19-first-article-kit/producer-acceptance.json).
  Original human/implementation/merge gates remain open.
- Actual [renderer diagnostic2/2](2026-10-19-first-article-kit/renderer-diagnostic.txt),
  equal seven-page PDF and image decode/visibility/overflow refusals passed.
- Basic/local checks, RI28/28 and coupling20/20, maintained formatter,
  focused ESLint and card/review stylelint passed. No site runtime, source style,
  generated public docs or shared material-owner bytes changed in this increment.
- [Article kit](2026-10-19-first-article-kit/index.html) contains the launch and
  first carousel, captions, PNG/PDF/HTML, credits/checklist and full manifest.
  Publisher is cleanb0ff55d / treeb28996c. Every retained output hash/length was
  checked; image originals and source edition remain unchanged.
- [Event kit](../issue-108/2026-10-19-announcement-shared-renderer/index.html)
  reuses the same clean producer and actual site theme. Earlier retained kits keep
  historical source/bytes. No event source or authored copy changed.
- All9 final PDF pages were rendered with Poppler and visually inspected at390px
  width. Readable headings/body/numerical units/credits, uncropped Cover02 and no
  overlap were observed. PNGs1080×1350; every PDF page810×1013.03998pt (Chromium
  CSS-page rounding). Actual Chromium138.0.7204.0 is a local diagnostic, not the
  locked CI browser or physical-device/author/rights acceptance.

Reader follow-up was checked separately: clean PR79b0ff55d policy10/10 and
[CI39254627571](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/39254627571)
succeeded:15 HTTP identity rows,4 room browser rows, article/material observations
and2 Color rows. Downloaded smoke artifact12186927714 SHA256
`fb25392b5122c40902d26cff235caa4f1d24e4b0d615b5f1df2b99ad4f21faf5` and exact
source/tree/public digestbb5739ad were verified. Raw downloaded reports and its
source policy are retained with this record. Deferred/full admissions remain
skipped; this predates the new requested reader orbit and proves no orbit change.

Remaining order: author review of this launch/carousel design → remaining four
feed pieces/two carousels → accepted publisher flow, channel admission and actual
canonical/D0 → manually observed publication/correction history → aggregate
D+7/D+21 reviews. The website article can ship independently. Whole AC02–AC17 stay
open; AC01 disposition is preserved. No merge, website release, calendar-account
write or social posting occurred in this campaign execution.
