# Issue 5 — 2026-10-12 Color runtime review

Owning issue: [#5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5),
AC08, AC11 and AC12. Owning PR: [#79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Role: delegated implementation self-review of Color runtime admission;
independent article/export review remains a separate report.
Prepared source: dirty branch over `7c6ca6456ae57ba712feb063b5613d84fe57026a`.
This Git head/tree is the plan commit; the producer/runtime hashes below identify
actual prepared implementation bytes. These observations do not claim a clean
implementation commit, hosted admission or release acceptance.

The final F20 producer-only safety correction and fresh browser proof at the
end of this report supersede earlier `c1e09…` and `322d959…` runtime identities.
Current admitted base runtime is `2a34c341…`; original observations remain
unmodified history.

Materials: AGENTS, CODE-STYLE CS01–CS10, site source contract, acceptance and
check profiles; Color/staging producers, runtime selector, bounded block-flight
validator, browser collector and maintained regression fixtures.

## Intent and acceptance

Admit a separately reviewed article reader runtime through the existing exact
Color tuple guard. Preserve the six earlier legacy/fixed/issue76 tuples and the
five-scene route inventory. The new issue5 plain/staging family verifies both
fingerprints and canonical/immutable runtime file hashes. A marker, a plausible
fingerprint, or controlled fixtures cannot replace observed behavior.

## Findings

| ID | Evidence | Finding and implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| C01 | `tools/site/build.cjs:fingerprints/runtimeVersion` | Producer identity includes all site and publisher tool sources. An export-only or formatter edit changes engine identity even if runtime output bytes remain equal; admission must bind settled producer source. | AC08, AC11 | Final cold build matched settled source and generated docs |
| C02 | First actual Color cases, 1440/390 | Immutable route mounting changed native footer/body links into absolute URLs. Existing Credits and acknowledgement probes require native relative links. Both scenarios timed out at the Credits footer selector. | AC08, AC12 | Corrected by reader owner; original failures retained, fresh scenarios both passed |
| C03 | Selector negatives | Prior issue76 navigation/CSS, mixed immutable/canonical paths and wrong edition cannot impersonate the issue5 runtime. | AC11 | Focused guard coverage passed |

## Decisions and tasks

No legacy family is edited. The new issue5 family has `fixed-blocks` behavior,
the existing `travel` descriptor, one shared Canvas, and unchanged block timing
limits. Existing fixture matrix sizes remain unchanged: two conditional Color
rows, twenty normal route observations and ten no-Canvas route observations;
the twelve-cell full Color guard remains a separate controlled completeness
check. These are preserved admission contracts, not a new claim that all hosted
or device cases were measured in this run.

| Task | Paths and expected change | Check | Status |
| --- | --- | --- | --- |
| T01 | `tools/quality/color-motion-contract.cjs`: new exact issue5 plain/staging tuples | Isolated default/candidate Color+staging builds and actual two-width observations | Passed bounded local review |
| T02 | `tests/color-motion-contract.test.cjs`: extend guards, reject mixed prior bytes/editions | Focused controlled behavior/negative suite | 9 passed |
| T03 | `tests/staging-regression.test.cjs`: current source assertion uses issue5, historical fixtures stay pinned | Regenerated docs plus current-runtime assertion | Passed; all three focused modules 28/28 |
| T04 | Reader owner: relative native links after snapshot mounting | Actual Color two-width scenario and reader source probes | Corrected and observed |

## Earlier prepared identities — before final CSS authority correction

Settled producer SHA-256:
`2d38da0fe230cad10d25f668b45b36dcca343da0cf54a88cce7f25ef4a686ab1`.
Base runtime engine:
`c1e09eb62c976af7d2923bc0ac76699b5d00fb2f7032196e6c0ed5cf6d12bfd2`.
Default build and explicit PMDay candidate build yielded identical five runtime
file hashes, base engine and Color fingerprints. A further cold default build
matched the complete generated `docs/` public file manifest byte-for-byte.
The PMDay preview adds one article document inside Writing, with no sixth scene.

| Runtime | Fingerprint |
| --- | --- |
| issue5 plain Color | `3244c777957e731ff40420110e24ec9180ef57f2648957c65722da3cc6458189` |
| issue5 staging Color | `93c9a20f91b9c623e4727895ccf2f08c580d6a543a30392ae44011e7cd055906` |

| File | Plain Color SHA-256 | Raw bytes / gzip bytes |
| --- | --- | --- |
| styles.css | `71592a7f2c9228d78cd2e403dde2dd6a9c3fd0097e7a89bd4330f0e34fa49c9b` | 41,382 / 9,267 |
| theme.js | `6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a` | 3,355 / 1,254 |
| space.js | `0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487` | 126,437 / 33,561 |
| archive.js | `1307b2405daa50937e5746f4d8a71230842718377d853b4d0cf4704e7f2de9ad` | 6,497 / 2,021 |
| navigation.js | `96a22c3c86cdd43d32bed415a57d0f45148fc29a9952567e5d4e7e40396e92c6` | 92,114 / 22,469 |

Staging appends only its authored environment CSS to the shared stylesheet:
SHA-256 `ba3b199f1443788d200d0867bbf560aeeac2b856458c2b0ac6aeb42fab25bbfc`,
41,751 raw / 9,357 gzip bytes. The other four script hashes stay identical.
The selector checks both root aliases and immutable runtime paths.

## Earlier acceptance evidence — retained history

`node --test tests/color-motion-contract.test.cjs tests/color-build.test.cjs
 tests/staging-regression.test.cjs` passed 28/28 without skips, cancellations or
TODOs after pinned-config formatting of the touched test. Negative cases reject
unknown/conflicting fingerprints, producer/edition disagreement, forged mode
markers, old/mixed runtime bytes, malformed immutable paths, false flight
claims, moving reading cameras and incomplete bounded/full fixture matrices.
Earlier 27/28 preserved the expected stale-doc source assertion; regeneration
resolved it without changing its guard.

The corrected actual browser run used explicit review Chromium `153.0.8010.0`,
executable SHA-256
`53a15d6c3a3d27dfb54c4ba60278b1683136f70cf1e67e989da7dfbd3d451ef0`.
It observed the explicit PMDay candidate after Color and staging derivation,
public artifact digest
`f58623cca1b9dfde2028971e17ec32342c8af8862bad2c4516da74ff0b1882e2`.
This is local loopback review using an explicit fallback binary. It is not the
locked managed-browser run, native-device review, full hosted matrix, performance
acceptance, staging promotion or production gate.

Both 1440px and 390px/light scenarios passed all nine collected contracts:
shortened stationary Home range, forward Home edge, fixed block flight,
forward/reverse edge travel and real native bottom, disabled edge behavior,
Credits/Home itinerary boundaries, absence of retired blur/ribbon effects.
Each retained 36 raw block-flight samples. The shared validator checked actual
departure, center/transit/restore, arrival, opaque block layering and bounded
row pacing; positive completed ordinary Canvas paint and zero page errors were
also required by the collector. No report field was fabricated after collection.

Retained source observations:

- [Initial two-width native-link failure](2026-10-12-color-runtime-first-failure.json),
  SHA-256 `568e5e0fbbf265cc1b84efa140e4dcc9409b8cea2cfc6595837ae21a1d4c9902`.
- [Corrected raw browser observations, gzip](2026-10-12-color-runtime-browser.json.gz),
  gzip SHA-256 `798c9287fe6a2955116601cf800582b1c178c83a34b65766247d101049aa7c2b`;
  decompressed JSON SHA-256
  `451f57b1dbacce51ea94d2512becffcfc9df36183a887f855e0ec703ac86b06e`.
  It retains explicit `sourceDirty`, `reviewOnly`, `managedBrowser: false`,
  `fullGate: false` and `productionEligible: false` boundaries.

| AC | Check | Result | Exact source/run | Remaining gate |
| --- | --- | --- | --- | --- |
| AC08 | Cold default/PMDay candidate builds; Color+staging closure; actual fixed-block scenarios | Identical reviewed runtime tuples; native link defect corrected; both widths passed | Settled producer, runtime hashes and raw observations above | Exact clean-commit reader/controller evidence and required broader review |
| AC11 | Color guard/build/staging suites and focused pinned formatter | 28/28; prior families and original matrix counts preserved | Current prepared source and regenerated docs | Independent implementation review and final source binding |
| AC12 | Actual local Color 1440/390 | Passed bounded observation; no hosted admission claimed | Corrected raw browser report and artifact above | Ordinary exact-head CI/hosted staging/controller evidence and owner decisions |

## Earlier issue synopsis — superseded by final identity below

The separate issue5 Color family preserves earlier exact identities and adds
mixed-byte/edition rejection. Actual two-width review exposed and verified the
correction of a native-link regression. Cold public parity, 28 focused tests and
both corrected Color browser scenarios passed on the settled prepared source;
clean-commit, hosted, device and release gates remain separately observable.


## CSS authority correction and refreshed admission — retained history

The full permanent executive source guard identified a competing authored
`border-radius: 6px` on `.article-body pre`, while the canonical reading owner
provides its shared 12px radius. The reader owner removed the competing line
rather than add an allowance or change the shared token. PMDay has no fenced
code block, but the shared stylesheet changed bytes, so the preceding browser
proof cannot claim this final runtime. It remains retained history above.

A new isolated cold default and explicit PMDay candidate build, Color and staging
derivation, fresh actual two-width browser run, 28 focused tests and pinned
formatter check were therefore performed after this correction. Both widths
passed all nine collected contracts; 1440px retained 36 block-flight samples and
390px retained 38. Revalidation of both decompressed raw rows through
`color-motion-contract.validateFlight` passed. A further cold default build
matched the complete generated `docs/` file manifest byte-for-byte.

Producer remains
`2d38da0fe230cad10d25f668b45b36dcca343da0cf54a88cce7f25ef4a686ab1`.
All four script files remain byte-identical to the preceding review. Both default
and candidate build produced the following current runtime tuple:

| Current identity | SHA-256 |
| --- | --- |
| Base engine | `322d959318086a5b3f18b75963e747cda76fce2b7085ab95f9a99c6902bb3168` |
| issue5 plain Color | `9f1a1d620bf51243c92c8251c7a9b789c8892dc91b6e667443f1e80110af4c93` |
| issue5 staging Color | `715a84b12379f6f4fbbcde36192c7580b8832dceaedcebbeda964918e09c4359` |
| Plain Color styles.css | `02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa` |
| Staging Color styles.css | `b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363` |

Plain CSS is 41,360 raw / 9,263 gzip bytes; staging CSS is 41,729 raw / 9,356 gzip
bytes. The existing guard checks canonical and immutable versions of these
bytes. Legacy/fixed/issue76 families remain unchanged; only the new issue5 tuple
was refreshed. No budget or matrix count changed.

Final observed Color/staging candidate public digest:
`c7e0d03742643749335b85ac99bc0168669805910dd9a9358abf38cb1b4c3356`.
[Final raw browser observations, gzip](2026-10-12-color-runtime-final-browser.json.gz)
retain the explicit fallback Chromium 153.0.8010.0 and binary hash already named
above, dirty plan-head source boundary, local loopback target and
`reviewOnly: true`, `managedBrowser: false`, `fullGate: false`,
`productionEligible: false`.
Gzip SHA-256:
`1116c2a422de7e1ef75e2599fc99e73176a59fadb5764d7c1f24aa806fd8d1f1`.
Decompressed JSON SHA-256:
`644ee7c21aa39807de478d5347a60eb41c47561607274efff6bf037e31ac937d`.

The current local Color admission proof is complete for this exact prepared
runtime. Exact clean-commit CI/hosted staging, independent/device review and
release decisions remain separate gates. The later source-qualified handoff
must verify this producer/runtime identity before citing these observations.


## F20 input safety correction and current exact admission

Independent review found that an explicit standalone export's caller-supplied
`publicDirectory` could itself be a symlink. The offline safety owner now rejects
such input aliases and resolves existing protected owner paths before checking
destination overlap. Its focused counterexample rejects before output mutation.
This changes `tools/site/offline.cjs`, conservatively changing the producer and
engine identities, while all five generated Color and staging runtime file
records are byte-identical to the preceding CSS-corrected review. No runtime
mechanic, effect, CSS token, byte budget, matrix count or historical tuple changed.

Current producer:
`d8efadd5d5bc40d3f4d2861b733151d522653b0236af266297ec2012d82bc682`.
New cold default and explicit PMDay candidate builds have identical current
runtime tuples:

| Current identity | SHA-256 |
| --- | --- |
| Base engine | `2a34c34118bf22ebf9f07eed5ad1141c26bc91c1e1db7e32466aca46ef106ecc` |
| issue5 plain Color | `f25b16d9a69db8d07fcbf6271f32c86f6b23de2307d6db6fb45fc0863902e915` |
| issue5 staging Color | `fff8aed9032b954389b7527f244b88ad9f52ca41c182f21bbc378d43283f1ab7` |

The existing issue5 selector has been refreshed to these fingerprints and the
same reviewed runtime bytes. Source suites passed 28/28 without skips,
formatter checks passed for all three touched owners, and another cold default
build matched the entire generated `docs/` manifest. The five default/candidate
plain runtime records and five staging records also matched the preceding
CSS-corrected records byte-for-byte.

A fresh actual two-width Color/staging candidate run bound this exact artifact:
`3888c64c9ad077112017e671650d1806b97d6d08535ef235c3e82fdcb454100a`.
Both widths passed all nine collected contracts and required ordinary Canvas
paint with zero page errors. Raw fixed-block samples number 33 at 1440px and
36 at 390px. Revalidation of the decompressed rows through the current exact
selector/flight checker passed, and `artifact.verify` independently checked the
actual candidate public tree against its manifest.

[Current F20 raw browser observations, gzip](2026-10-12-color-runtime-f20-browser.json.gz):
14,281 compressed bytes, SHA-256
`be39fc924a8ac777045471868474b768af63c90b156c2f9b3548d40bd364efe9`;
755,756 decompressed bytes, JSON SHA-256
`6f570f0029b4758db869431d55bb1902c64b5a2e8a858cfccb0a0e9e9531673f`.
Retained local artifact directory is
`/tmp/issue5-color-runtime-review-4/candidate`, with exact `artifact.json` and
`public/` tree available for independent revalidation during this handoff.
The raw report preserves the explicit fallback Chromium/binary hash, local
loopback target, dirty plan-head source and review-only/no-managed/full-gate
boundaries already stated above. None of the earlier raw files were rewritten.

This is the current prepared-source Color admission proof for AC08/AC11/AC12.
It supplies no clean-commit, hosted/device, native editor, merge, staging
promotion or production acceptance. The final execution handoff must compare
its committed producer/runtime identity to these exact values before citing
this local browser result.

## Current Color/staging article reader at nested base

The changed reader target was also exercised on the actual current Color/staging
candidate, separately from its five-room Color scenarios. No source file changed
for this observation. The loopback fixture mounted the exact verified public tree
at `/project/staging/` and checked each served resource's SHA-256 against the
candidate manifest before returning it. Twelve distinct requested resources
were observed; this is an observed-resource check, not an entire hosted/CDN audit.

`articleJourney` used the actual `site-revision.json` descriptors and explicit
review Chromium 153.0.8010.0. Its maintained `validateArticleJourney` required the
actual artifact engine
`fff8aed9032b954389b7527f244b88ad9f52ca41c182f21bbc378d43283f1ab7`,
the nested base and complete same native metadata in all five cases. Validation
passed with one explicitly exercised article, `pmday-two-shifts:en`, and five
observations: normal 1440px, normal 390px, Off 390px, no-Canvas 390px and no-JS
390px. The available-document inventory is recorded independently from the
single representative exercised document.

Both normal cases passed complete archive/article/head transitions, archive
filters and Back/Forward query restoration, focus and native scroll restoration,
persistent header/Canvas identity, TOC anchors, deep refresh, reading/departure
blocks, rapid cancellation cleanup and decoded article assets. Actual reading
entry bounds were 6 and 4 respectively; maximum article departure blocks were
6 in both cases, inside the existing 6/24 limits. Off/no-Canvas/no-JS retained
full native reading, anchors and the Writing link, with at most one Canvas.
The candidate retained noindex, no live canonical and no fabricated publication
date. Runtime page errors were required to be empty by the collector.

[Raw Color/staging article reader observations, gzip](2026-10-12-color-article-reader.json.gz)
bind candidate digest
`3888c64c9ad077112017e671650d1806b97d6d08535ef235c3e82fdcb454100a`,
actual descriptors, served byte records and browser/binary identity. Gzip is
2,623 bytes, SHA-256
`16c748c5821b96e49ac7db65e21fcac2789d72e0542d85ddf782fcb0e7519234`.
Decompressed JSON is 15,306 bytes, SHA-256
`e55afbd1dabb5c9065a154646d41fe6e4d7065b138f77111a21719bfca3f82c2`.
Revalidating the decompressed proof with the actual manifest descriptors/engine,
checking every recorded served hash, and verifying the candidate public tree
all passed after collection.

This supplies the bounded changed-target reader observation for AC08/AC12 on the
current prepared artifact. Dirty source, explicit fallback review browser and
local nested mount are stated in the raw proof. They do not establish a locked
managed-browser, clean-commit hosted deployment, native-device, full production
matrix or release decision.
