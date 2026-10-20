# Issue 5 — reusable reader interactions

Owner: [issue5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5), dated
reader-interactions-20261020 scope. Execution: [Draft PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Prepared increment starts at3cdbea2eeab6e05844b4c7f26a57c109f52b7dfc;
base main82b57b8948c6c30143213b846ee2848d06f8d200.
Primary implementation/self-review, with independent bounded source review by
`reader_iteration_review`. Exact final source, CI and preview receipts belong to
the live PR and dated issue update. This is not whole-PR human or release acceptance.

## Intent and scope

The user authorized implementing the next reader UX iteration through PR preview,
explicitly requiring a reusable article template understood by the engine.
Preserve the real R18 manuscript, semantic edition, original media and PDF.
The shared reader gains hierarchical Contents, image zoom, reference previews,
clearer minor headings and a quiet settled background. Owner #2 retains editorial
and rights acceptance; no merge, stable staging or production action is included.

## Findings and decisions

| ID  | Evidence / implication                                                       | Treatment                                                                                                                                    | Acceptance |
| --- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| F01 | Full-size images previously navigated away from the reading passage          | Shared native dialog with fitted/actual-size view, Escape, focus restoration and ordinary image URL fallback                                 | AC08/11    |
| F02 | Citations interrupted reading with a long bibliography jump                  | Shared compact source dialog retains full source prose and links; native full-source action and returns remain                               | AC08/11    |
| F03 | Four chapter links could not reach H3 topics from deep reading               | Native H2/H3 Contents, progressive sticky control, current-topic label, close on selection                                                   | AC08/11    |
| F04 | H4 resembled bold body text; metadata competed with byline                   | Shared H4 spacing/type and subdued date/read-time metadata                                                                                   | AC08/11    |
| F05 | Continuous background motion distracted during long-form reading             | Preserve last scene paint on settled articles, dim outside the opaque paper, retain requested orbit and principal-page motion                | AC08/11    |
| F06 | Prior hosted smoke missed in-flight response checks before navigation        | Register verification at request start and drain late checks before actual document/history navigation; preserve all HTTP/body/byte failures | AC11/12    |
| F07 | Independent review found open Contents could jump out of view if made static | Default normal flow without JS; mounted enhancement marker keeps both open/closed Contents sticky                                            | AC08/11    |

## Implementation owners

- `tools/site/reader.cjs` renders the admitted AST into reusable reader components.
  Deduplicating a phrase link requires an immediately adjacent citation whose note
  explicitly contains that exact URL. Source prose, bibliography URLs, standalone
  resource collections, known assets and nonmatching links stay intact.
- `tools/site/articles.cjs` and the article/contents/tools templates own composition
  and dependency closure. Reading time counts essay prose, excluding declared
  appendices; a date is shown only from existing canonical metadata.
- `site/engine/reader.cjs` owns optional dialogs, current topic, print and route
  disposal. It uses native dialog focus containment, restores the trigger without
  scrolling, preserves modified/native clicks, and strips duplicate cloned IDs.
- `reader.css` owns reusable geometry/type. `reading-surfaces.css` owns opaque
  surfaces. `lifecycle.cjs` stops only the settled article's ambient frame loop;
  motion preferences, camera paths and explicit route/block transitions retain
  their existing owners.
- The standalone producer and router hydrate image viewer links from the same
  verified resource inventory. Native image and fallback link contain identical
  embedded bytes; full standalone byte budgets remain unchanged. This serialization
  proof does not claim browser acceptance of no-JS data-URL navigation.
- The isolated nonpublishable reader-reference fixture now includes H3 and a real
  numbered note. Its source/edition/material bindings are regenerated; no real
  article or media source is altered to exercise the collector.

CS01–CS04: canonical owners and semantic selectors, no article-ID styling or new
renderer. CS05: pinned canonical formatter. CS06–CS09: existing route lifecycle,
native HTML fallback, no new fetch/framework/RAF/cache, verified bounded resource
inventory. CS10: behavior tests and the existing bounded hosted journeys cover
image/note/Contents interactions, cleanup, native fallback and late byte checks.
Existing budgets, motion cases and historical runtime families remain admitted.

## Verification and remaining gates

Prepared reader tests22/22, standalone tests17/17, scene tests68/68 and Basic
16 plus Color10 passed. Scene tests used a freshly assembled canonical runtime.
Independent source review rechecked F07 and the reader tests; no scoped source
blocker remained. Metadata was made secondary following its design suggestion.
The final generated identity, source policy, hosted browser rows and fresh visual
inspection are recorded in PR79 after the implementation commit. Intermediate
prepared results are not exact clean-source receipts.

Integration also corrected inherited lint findings: adjacent identical article-list
CSS selectors are merged without changing computed styles, and notice verification
removes the same five envelope fields without unused destructured variables. The
real-media test now pins the current canonical R18 source and edition instead of
R13. Independent bounded review verified these preserve runtime/digest semantics.

The real article continues to use its admitted JPEG/WebP/PDF resources and R18
editorial selection. Standalone JPEG rejection remains explicit. Physical-device,
screen-reader, complete contrast, human editorial/rights and live release gates
remain separate; original issue checkboxes are not closed by this iteration.

Required lint also extracted bounded process/attribution validation, article reuse,
camera journey construction, content directions and collector assertions into
named helpers. The existing conditions/order/budgets are preserved; no rule or
complexity allowance was weakened. Focused profile/build37, navigation/reader55
and scene10 tests passed after these extractions.

## Hosted follow-up

The first exact source b21a4d7 passed its owning11/11 automated policy, with
evidence_valid:true and no errors. CI39400815917 built and published the preview;
1440/390 normal principal-page smoke passed, but the workflow failed on no-Canvas
pending index requests and opening Contents changing document height/scroll.
The enhanced Contents list is now an opaque absolute dropdown below the sticky
control, preserving both document geometry and native no-JS flow. The collector's
strict reading-position assertion remains unchanged. This failed run is historical
diagnosis, not final hosted acceptance; the final source/run belongs to PR79.

The next source292ff618 also passed its owning11/11 automated policy. Hosted
CI39402572217 passed all four principal normal/no-Canvas rows, confirming the
outgoing-response sequencing fix, but still rejected the Contents position check.
The enhanced sticky control now excludes itself and its descendants from native
scroll anchoring; the underlying article remains eligible. The strict collector
also includes measured before/after geometry in any subsequent failure.

Native inspection of b839e3bd localized the remaining trigger: the sticky summary
started at82px while the document's scroll-padding began at97px. Focusing that
partly excluded control moved scrollY by15px in the native CI collector;
excluding scroll anchoring alone did not help. Cloud locator clicks also center
the sticky target, so their larger scroll deltas were not product evidence. The shared sticky top now uses the same header
clearance as the document, keeping the entire control inside the focus viewport.
This is consistent with the [CSSWG sticky-focus discussion](https://github.com/w3c/csswg-drafts/issues/7930);
actual final browser evidence remains required rather than inferred from that source.

Sourcef319f563 passed its clean11/11 policy and exact-source lint. CI39404713837
progressed beyond Contents, then failed no-JS fragment stabilization. Inspection
confirmed the server already emits open appendices; the collector's page-side
timer polling was incompatible with disabled JavaScript. Sampling now runs in the
host with the same50ms interval,2s deadline,3 stable observations and strict target
visibility. Negative cases retain wrong-fragment and moving-target rejection.
Current390px captures also exposed a stale topic label after jumping past headings;
the shared reader now derives it from heading positions on scroll and layout events.

## Complete reader motion follow-up

Owner: issue5 dated reader-complete-motion-20261020 amendment; same Draft PR79.
Prepared against917c21d82b78d97c63308e7d65b2586239cb1293/tree2078e2bc75ebafc9c60d5c7ff8c76440488e6db2.
Primary implementation and self-review by Codex. Previous independent review
applies to the earlier increment; it does not review this correction.

The author observes stationary Contents/divider paint and fragmented transitions.
Child-only animation cannot carry a component's own opaque paper, rounded border
or native list/details marker. Reader route units now animate the complete native
box once, using the existing wave's timing, geometry and completion/cancellation
owner. The ordinary principal-page child/ink layers retain their behavior. Ancestor
separators still use measured ownership and move with the selected reader leaf.
No per-article ID or manuscript-specific rule is introduced. All article arrivals
are from below and departures upward, including article-history travel; camera
orbit/history direction remains separate.

The user also explicitly supersedes quiet settled articles. Reader-only ambient
RAF suppression and the0.45 scene-opacity override are removed. Articles now use
the common On/Off/reduced, hidden/print, device-cost and scene lifecycle. The
opaque reading surface retains its canonical paint owner.

CS01–CS10: canonical scroll-entry/navigation/lifecycle and CSS owners; existing
1000ms phase,24-row bound, fallback/cleanup and budgets preserved. Native text,
links, no-JS and print remain available. The collector observes the actual box's
CSS frames and rejects child-only/doubled reader animation for the new exact
issue5ReaderMotion family. Historical family tuples and validation remain intact.
New plain/staging/production identities are derived from actual canonical output
and all three admitted against their actual bytes; production is only a temporary
local rendition, with no release action. Mandatory rights admission and producer
fixtures include this new family.

Prepared checks: scroll-entry44/44; scene lifecycle68/68; navigation/collector/
Color/staging84/84. These are dirty prepared results; final exact-source policy,
hosted real/synthetic browser observations and fresh visual checks belong to PR79
and the issue after the implementation commit. No whole-PR independent, physical
device, editorial/rights or public-release acceptance is inferred.

## Shared paper motion correction

The user inspected c39813b9/tree9e9ab8ca after CI39415469393 passed and identified
the remaining common paper snapping into/out of view. That run proves component
motion and common ambience, not complete reader-paint acceptance. This correction
continues the same scope and Draft PR79; primary implementation/self-review only.

The native multi-page paper is temporarily replaced by its viewport-visible paint
in the existing reader pseudo-element. Geometry/radius are measured once per phase;
the native document is never translated or resized. This bounded opaque layer uses
the common easing/duration: arrival with the first row, departure with the last.
Native paper is transparent only while the measured layer owns it, and its CSS
animation completion participates in the same pending map. Hold exposes the orbit;
arrival restores identical native paint at rest. Cancellation, Off/reduced/print
and disposal release the marker/properties through the same owner. No new timer,
RAF, content clone, opacity fade or article-specific rule is introduced.

Paint remains in reading-surfaces.css, geometry/phase CSS in scroll-entry.css and
measurement/completion in scroll-entry.cjs. Isolation keeps the bounded paper
behind content without changing native layout. CS01–CS10 and existing budgets,
1000ms/24-row limits and fallback remain. New issue5ReaderPaper tuples retain all
historical families; the collector requires actual paper CSS frames, bounded
viewport geometry, correct direction/row timing, transparent replaced native
paint and completion by animationend. Negative cases reject omitted/static/long
paper, incorrect direction, opaque native paint and watchdog completion.

Prepared checks: scroll-entry46/46 (including deep-scroll and empty-viewport paper,
content-before-paper completion, native restoration and print cancellation),
collector/Color/staging51/51. All three actual generated editions are admitted
against their pinned bytes; production is a temporary local rendition only.
Final clean-source policy/CI/visual evidence belongs to the live PR/issue.

The paper collector uses the subtree inventory and filters the exact host/::before
effect, retaining actual pseudo-element CSS frames rather than child ink. This
uses the documented [Element animation inventory](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations).
A diagnostic regression excludes descendant pseudo-elements and binds completion
to the same phase/navigation identity.

## Permanent staging admission

The author accepts the visual iteration and authorizes permanent staging through
the existing controller and required tests. Ready source1eb9ecde/tree493346f2
exposed stale generated review-only offline HTML in navigation run39425928566:
the checksum scanner correctly rejected old embedded runtime/route identities.
This is a generated-output freshness defect, not a scanner exception. Regenerate
the fifteen canonical review exports and their offline/source manifests through
their existing generators; preserve hosted runtime, R18 manuscript/media/PDF,
test selectors and budgets. CS01/04/05/08/10 retain canonical ownership and exact
source evidence. The existing controlled scanner regression passes after the
regeneration. Final Ready and complete applicable staging receipts belong to the
live PR/issue; no stable result is inferred from this prepared correction.

Ready Basic39425928640 also retained seven failures before its180s timeout:
stale exact reader CSS, event negatives reversing the current108 successor before
canonical event validation, outdated CSS composition, stale review exports and
an archive fixture missing the new shared tag-validator dependency. Pin complete
CSS to the author's accepted1eb9ecde rendition, preserving byte-exact legal and
unrelated-style negatives; exercise current events before historical reversal,
retaining all missing/source/date/language/resource negatives. Update the shared
paint/composition assertions and isolated archive dependency closure. Prepared
executive/archive30/30, SEO and navigation94/94 pass.

The original180s/16MiB source-process bounds remain. Use available CPUs capped at
four isolated file workers and start the measured long article-media module with
the existing long files. A real five-file barrier regression proves four overlap,
the fifth stays queued and all five complete; cancellation/failure/zero-skip
accounting remains. Prepared selector/scheduler31/31 passes. These are required
admission fixes in the same owner, not removed checks or relaxed browser budgets.

Source7430f661 passed all95 navigation profile/gate/scanner cases, then found the
ARTICLE-MATERIALS guide missing from the active-Markdown inventory. Basic lint
also rejected the expanded material test's cognitive complexity. Include the
existing guide in the authoritative inventory and extract the material decision
into a named helper; preserve its assertions and the25-complexity limit. Prepared
root-layout, paint negatives and focused ESLint pass before the next source.

Source dc2b5479 passed lint/navigation/owning policy but its shared source worker
timed out before buffered Space output completed (CI39428464799). An isolated
native run passes all68 scene tests in119296.6ms. Space now runs alone before the
remaining exact selected inventory; each process retains180s/16MiB and the job
retains10minutes. Maximum four concurrent file workers, no overlap between batches,
unchanged tests, strict per-batch leaf accounting and combined exact counts.
Original streams and actual command/status/byte bounds remain separately described;
failed/unavailable/empty groups cannot borrow success from another group, and
later independent evidence survives a first failure. Content-only reuse remains
the existing single-process format. This is workload isolation, not new release
acceptance. Current-source Ready/staging measurements remain required.

CI39430462999 completed both native batches within their original limits:
Space68/68 in122994.8ms; remaining943 in165290.4ms, with three failures and no
skips/cancellations. The remaining fixtures omitted reader.css from exact style
composition, lacked native history in the VM document, and fed current
publication-index.json to the pre-index historical publisher. Include the real
reader stylesheet/history and construct the historical fixture from its actual
cc115c42 docs tree; retain byte-for-byte old/new package comparisons and current
fixture coverage separately. Prepared engine/staging43/43 pass. No runtime,
selector, budget or original historical package is changed by these fixes.

Ready3407b557 passes1011/1011 and its clean11/11 policy. Owner command6292307683
started trusted-main staging39432995449/1 on controller82b57b89. Prepublication
stopped before upload: its old210s wrapper terminated the now-two-process source
run, Semgrep interpreted literal RegExp.exec as a shell call, and generated
publication checks lacked the publisher dependencies in this pre-publisher main
controller. All other guards, including advisories/Bandit, passed in that attempt.

Derive the wrapper deadline from the actual selected one/two batch inventory and
retain each native180s/16MiB, scanner180s and job10-minute bound. Use the equivalent
String.match reader expression; scanner policy is unchanged. Browser JS and CSS
bytes remain identical, but source-derived engine identity changes, so add the
exact issue5ReaderStaging plain/staging/production family while retaining history.
All three actual temporary renditions match their pins; no production action.

Bridge only the exact old82b57b89 main workflow, main ref, authorized event type,
repository/workspace and color-artifact command when no explicit preview mode or
validation context is supplied. Its CLI installs the existing exact locked
publisher with ignore-scripts and selects the existing explicit article preview.
Ordinary APIs/builds, nested validation, explicit modes and production workflows
retain their behavior. The existing controller still owns source admission,
protected environments, all guards, promotion and recovery. No direct upload or
new publishing authority is added. Retire this finite compatibility bridge after
the updated workflow is on main; newer controllers cannot select it. Prepared
103 owning compatibility/reader/Color/profile checks pass, including adversarial
context, wrong-source and failed-install cases.

Pinned detect-secrets1.5.0 was also run locally on the same1230 tracked text inputs
and default no-verify selector. After the existing generated/publication proof,
725 exact non-RI observations lacked historical triage:704 SHA256 literals,
18 recorded Git identity occurrences and3 synthetic credential-URL rejection
fixtures. Each literal was matched to its observed hashed value and inspected
field role. Current runtime bytes/three editions were reproduced; three distinct
historical local commit objects are unavailable and remain explicitly unverified.
Retained CI/edition metadata is classified as public identity data, not accepted
historical execution or editorial correctness. The fixture URLs are rejected
before networking. Append only exact path/type/hash entries to the existing
publication ledger, retaining every predecessor row, all scanner rules and the
2MB limit. The existing historical-evidence convention stores the step1 raw JSON losslessly as json.gz: decompressing reproduces every original byte; all314 findings in it were inspected before archival. The prior Git blob and this review preserve recovery. Only411 still-applicable text findings are appended; no existing row is removed. Implementation self-review; whole
independent review remains pending. The raw scan, excluding only the now-archived historical path, is rechecked with the same producer proof and closed-ledger admission before CI. RI/coupling
checksums retain their existing separately verified dynamic owner.

Archived step1 validation: uncompressed SHA256 `f223ed67c24dde020e24a306fe2227f2b9cbfc41d9a2fa02e7393edb2a54c048`; original source is the unchanged path in3407b557, lossless gzip uses mtime0. This is storage of already inspected dated diagnostics, not a scanner exclusion or acceptance claim.

Prepared final checks: Basic16+Color10, quality/scanner34, maintained Python115, focused compatibility/reader103 and engine/controller72 pass; ESLint passes. A fresh pinned scan of1229 tracked text inputs is admitted by the unchanged generated, exact-ledger and verified RI/CI owners with zero unknown findings. Native Ready and complete stable staging must still run on the clean committed source.

Ready478aae2a/CI39439632073 completed1012 cases:1011 passed, one stale publication-record timeout assertion failed; no skips/cancellations/timeouts. Space68 and remaining944 both finished within180s. The old210s assertion did not reflect the two-process full selection. Update that expected outer390s deadline in the existing failure-stream regression; retain native180s, inner timeout rejection, later independent security success and original TAP/stderr preservation. Artifact12274635322 / ZIP SHA25632f64f0e5d4c4fb855b67415a0c11a4c7ee713e05e7d8739687b79e8e0df0d33 retains the failure. This is a test correction, not an accepted staging run.

Trusted staging39441774601/1 admitted clean a55b4fbf and produced the exact R18 staging edition, then reached the unchanged10-minute build ceiling before upload. Artifact12273529085 retains native streams (ZIP SHA2567e3f65478418635c393718045b6a86819632f598d9b6e6225d3cc59111ae8b27). Source tests completed1012/1012, Python115 and lint/security/advisories passed; selftest finished, package proof was interrupted. A canceled whole run is not staging acceptance.

Run independent preflight guards through two native command slots instead of serially replaying the full source/scanner chain. Keep synchronous API parity, every original guard/command, native180s/16MiB combined-output limits, selected source390s wrapper, source-file worker cap4, and the controller10-minute budget. Failed dependencies block only their consumers. Package proof waits for all previous guards to settle, and final artifact/source verification waits for all commands. Retain each actual exit/signal/error, bounded raw streams and canonical check order; cancellation aborts active commands, blocks queued work and writes a failed report. No prior report or whole pass is borrowed. Real subprocess barrier, output overflow/timeout, failure/dependency and cancellation regressions exercise the scheduler. Source/hosted gates still require a new clean-head run.

Prepared scheduler verification passes30/30 preflight/native-command cases,95/95 profile/scanner/controller cases and115/115 maintained Python cases; ESLint passes. Tests cover successful complete canonical accounting, changed final source rejection, actual two-process overlap, a package barrier, independent failures, dependency blocking, combined stdout+stderr overflow at the original bound, native timeout and queued/active cancellation. Retained failure reports remain qualified to their actual old runs; current-source CI and stable promotion are still required.

CI39447032022/1 completed within its overall budget but source and security timed out when competing for CPU. Both native180s source batches retained their original partial streams; failed security remained failed. Artifact12276433783 / ZIP SHA25699e32237d2b9af61a62c99dafb2887856b43ccfc965789d0a45e998bbb14fa9d retains the unsuccessful attempt. Isolate both heavy guard classes; lighter independent commands still share two slots, with original package/final barriers and all limits unchanged.

Measured source of avoidable repeated cold-build work: Pillow12.3.0/libwebp1.6.0 lossless method6 at quality100 re-encodes the same seven R18 slides on each source reconstruction. A pinned local comparison of methods4/5/6, with full RGBA/ICC/dimension decode checks, gives method4=1.993s versus method6=21.084s. All seven output SHA256 values and combined502526bytes are identical. Preserve lossless/exact/quality100 and every input/output/pixel guard; change only compression effort to4. Original PNGs, JPEG, PDF, manuscript and semantic edition remain exact. Build-source identity changes despite identical browser JS/CSS and these media bytes; register the exact issue5ReaderFastMedia plain/staging/production family, retain every historical family and regenerate canonical dependent outputs. No runtime animation or reader rendering decision changes.

Prepared full real-article staging build completes in5390ms and retains all seven prior exact slide hashes. All browser JS/CSS bytes and R18 text, semantic edition, original images and PDF are unchanged; generated source identities correctly migrate. Actual plain/staging/production runtime pins are verified without publishing. Local owning media/reader/Color/controller/preflight selection119/119 passed before the added exclusive-phase regression; final current-source checks follow.

| R18 slide | SHA256, identical for methods4/5/6 |
| --- | --- |
| pmday-slide-03.png | `c41162699b810de00dce4449eec0cfd5daa123b5fb9f6c2fb7bdbe8d68c97c02` |
| pmday-slide-05.png | `03024193dfba78bf0323507ce7a353e5bf44eaf1fc7e96dfe2a16d5bcd6ea117` |
| pmday-slide-07.png | `e8558025cd1eb16aa949a6bf2c896dd877cbe29575c88d2ea7a03c685faee450` |
| pmday-slide-09.png | `6abd9c023252cbab9c4322fd9435b6bef97c0c2b61045ee0d3d2370e5fcb2493` |
| pmday-slide-10.png | `8ec20313f6ce00b3fff2a518b3c997ccfc0ccff49660e6a9509f28209a25af8f` |
| pmday-slide-12.png | `0efe553dbc427f8d6211208cd9f5192d1ca30085c9cd66d43622dbf253e89c7e` |
| pmday-slide-14.png | `6188e736c3b872bdc1cf2cf2070b413431abc21b07e65fc85df49916b44cbac3` |

Final prepared owning selection153/153 passes, including media determinism/independent pixel decode, exact runtime families/rights, reader evidence, controller, scanner and preflight/exclusive cases. Four new exact registry fingerprints are individually reproduced and triaged under the original ledger bound. Maintained Python, canonical formatting/RI and clean-source CI are rechecked below; whole review/release approval is not inferred.

Final prepared checks:153/153 owning JS cases,115/115 maintained Python cases, Basic16+Color10, canonical formatting, ESLint and RI/coupling verify pass. The full existing pinned scanner toolchain is prepared locally for a clean-source preflight timing check in parallel with required hosted CI. Its result remains a local measurement, not controller promotion evidence.

### Protected-controller format dependency

Clean source e24168ea5b9fb854d190560cbe8d9a22cbb66dec / tree
b41fceda1afaab3404ab0cb223d231da8b5ca6d0 passes Ready source1018/1018,
navigation and the11/11 owning policy. Actual owner staging39453642484/1
passes all26 preflight guards, including staging source981/981, Python115,
lint/security/advisories, exact rights and package verification. Build finishes
within the unchanged10-minute job limit. Preflight artifact12280540721 has ZIP
SHA256211a4f7b0b299a9a49dd780e8fabb47f42afb224d6af3bc600c281d55b11f181;
its report SHA256 is c849c1eeead00646da2393aaba7bd4d42be5ba7ebedccf0674f73d2715824c15.

The following trusted-main publish job rejects the first article-media path
because protected controller82b57b89 predates article inventory support. No
candidate upload or stable promotion occurs. The exact retained package
12280465855 / ZIP SHA256e1a5578bc9c38480b2c901798a0c80d97a2375a48f5293240e59882999fd147d
passes the current verifier and reproduces the same rejection with an isolated
unchanged82b57b89 checkout. This is a format dependency, not authority to switch
credentialed jobs to unchecked candidate code or bypass inventory validation.
Integrating the article-aware controller into protected main needs its own
reviewed bootstrap decision; PR79 must remain open until actual staging passes.

Owner label regression39455417483/1 is also failed evidence. Its preview build
sets SITE_ARTICLE_PREVIEW=true, unlike the old-main source command. Three
temporary baseline repositories had no matching empty preview selection, and
the principal-page rights CLI fixture inherited the real article selection and
requested Pillow from its intentionally incomplete checkout. All four original
assertions remain: give baseline generations explicit empty real/template
selections before building and give only that principal-page child CLI an
explicit false mode. Production selection and hosted article-rights fixtures
are unchanged. Recheck both modules with the real outer true mode, then fresh
clean-source and hosted evidence. Earlier successful e241 checks do not admit
the corrected source. Stable staging, full regression and merge remain pending.

Prepared fixture verification passes31/31 with outer preview=true and31/31 with
preview=false. Maintained Python115, Basic16+Color10, focused ESLint, canonical
formatting, style and RI/coupling checks pass; no runtime/edition bytes change.
