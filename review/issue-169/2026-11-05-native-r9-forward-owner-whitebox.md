# R9 Forward archive owner correction — independent White-box QA

Date: 2026-11-05 UTC. Owner: issue169 / PR170. Same-role bounded continuation of `2026-11-05-native-r9-heading-forward-whitebox.md`; the first failed browser evidence and that diagnosis remain intact. No peer review or verdict was read. No application/test/QA implementation was edited, no browser was launched, and no external action was taken.

## Reviewed identity and scope

Base HEAD: `299c39a66de16cd28c8b64c8054c4bb213adf996`, tree `dccbec1018e4ae25ae5a4015590139ebaca19029`. The reviewed source is an honestly dirty working delta on this base, not a committed/clean candidate. Scope is the two application owners, their two tests, and test allocation. Other review-document changes are outside this semantic review.

| File | SHA-256 |
| --- | --- |
| `site/engine/navigation.js` | `bab45afc73a36333f4b4ee3e81a7fc4fa19762f50d92dd5b82dad345fb82011b` |
| `site/engine/archive.js` | `0c1300428b3088c1fb4f6ba86461f228efabd3175100c7c1219df13631a1ccd3` |
| `tests/navigation.test.cjs` | `5f486c8bab390ee2f327a03f670a340bd70cd9a085d28854c695fffc2b4dd76a` |
| `tests/archive.test.cjs` | `42968c51f8fdbd1e728a90444b00a6f0b0654428bd0db48f30c84053ac98df7d` |
| `tools/quality/test-profiles.json` | `55b420167dc3b669f28c94e4a683d305c05fc994e6124dc1ed1eb9003ad546d5` |
| Unchanged `review/issue-169/r9/reader-runtime-probe.cjs` | `09e995a1726da63b7eeea7778f12a1af93a68f79798c35f6b1b36c98975984d9` |

The actual clean299 diagnostic remains failed: run42100535479, report SHA-256 `bca30e292cf41361c6ad4a2027847d12e0caf3ea183e1e15477a08daf0a63740`, 18 pass / 2 fail / 20 not observed. Both first added Forward departures watchdog after the outgoing selected topic becomes hidden and heading/count text layers are replaced. This receipt does not relabel any of those rows.

## Source assessment

`addressPage()` reads the live browser URL and delegates to the existing `routeFor()`. Only when that returns no route does exact initial origin/path equality permit the validated `initialPage` fallback. This preserves filter query/hash ownership for a directly opened immutable principal snapshot without admitting its path as a router destination. The initial route must already pass the existing route/article validation before the public navigation API is installed; fallback is not derived from a newly mounted body page. A different snapshot, unknown path, or foreign origin cannot borrow the initial Writing owner. Known article aliases/snapshots resolve before fallback and remain article owners.

Archive URL-driven refresh now returns before `restoreURL`, `refresh`, or fragment landing when the available address owner is not Writing, including `null`. The normal implementation always returns a route string or `null`. Absence of the method retains the progressive standalone fallback. Genuine Writing query/hash history still updates controls, rows, heading, count, and landing. Initial/new Writing mount still applies URL filtering before navigation's layout/scroll measurement. Archive destroy/remount and router admission/cancellation paths are unchanged.

This targets the browser's destination URL, which is already updated before history callbacks run. It does not depend on body page, busy state, callback registration order, cached versus delayed reading, or an arbitrary timer. It protects the outgoing archive whether its callback runs before phase measurement or after the departure ink has been prepared. No animation timer, completion classifier, frames requirement, or diagnostic budget changed.

## Actual checks

Independent execution, exit0: six focused existing tests across the two modules using the name pattern `foreign document history|footer links share|queries precede|filter/Reset clear|reader documents fly|motion disabled during departure`.

- The new foreign-history test keeps selected topic visible, visible row identities unchanged, and the exact current heading/count ink child and parent relationships intact for an article destination. Unknown hash history also preserves the outgoing archive. A subsequent valid Writing query refresh still changes filters and detaches the prior text layers.
- Existing fragment precedence, filter/reset Back/Forward, native/embedded footer destinations, disabled-motion immediate mounting, and bidirectional reader/history cases pass. The ordinary archive history cases exercise the API-absent fallback.

Independent controlled composition, exit0: loaded the actual archive fixture, actual `routeFor`/`addressPage`, and actual scroll-entry factory in memory. Connected the archive's selected topic, heading, and count owners to the phase harness; supplied genuine completion events only for still-visible modeled units. Compared the committed old archive source to the current source without modifying files.

| Source / callback placement | Outgoing visibility/text/live ink preserved | Modeled departure completion |
| --- | --- | --- |
| Old / before departure preparation | No | `animationend` (but content already changed) |
| Old / during prepared departure | No | `watchdog` |
| Current / before departure preparation | Yes | `animationend` |
| Current / during prepared departure | Yes | `animationend` |

All four branches asserted their expected behavior and cancellation left zero scheduled tasks. This is a source/phase counterexample, not a real CSS frames observation. It shows why merely asserting completion without checking outgoing content preservation would miss the before-preparation defect.

The same actual owner/archive composition separately rejected mutation for known article, unknown hash path, and foreign-origin addresses, then accepted a valid same-Writing filter refresh. A separate 30-assertion actual-function boundary check covered canonical root, project directory, exact initial principal snapshot with query/hash, different snapshot refusal, embedded declared article/file routes, unmapped embedded native file refusal, initial article owner, and foreign origin. It also asserted that `routeFor` function source and all tested outcomes are unchanged from HEAD.

The first supplemental boundary command incorrectly expected `file:///review/writing.html` to resolve Writing even though that fixture declares only the native Talks file. It failed `null !== 'writing'`; the corrected harness uses the declared `?view=writing` entry and explicitly expects the unmapped file to remain `null`. The corrected 30 assertions pass with no application change. This was a scratch expectation error, not a product fix or a waived negative.

Actual source selector calls with only `site/engine/navigation.js` changed and only `site/engine/archive.js` changed selected both `tests/navigation.test.cjs` and `tests/archive.test.cjs` (17 and 12 selected modules respectively). The explicit cross-owner inputs are present. No full selected suite was rerun by this reviewer.

Author-provided raw logs were inspected, separately from independent execution: `../tmp/r9-forward-owner-before.log` SHA-256 `5cb7c01fc750a1d907f50ad4a0cb23b7fa359f7a363826943f46d60199a5beff` records the old-source failure `outgoing topic visibility cannot change from an article URL`, actual true / expected false. `../tmp/r9-forward-owner-tests.log` SHA-256 `bce42ce1612fab0162b66c1ca1957168ada500f2ce41fd919a3ce623e96b2a36` records current full nav/archive 52 pass, 0 fail. Those runs are not claimed as independently executed here.

## Bounded conclusion and limits

PASS for this source/test/allocation correction: no remaining blocking defect found within the reviewed boundaries. It directly prevents the observed history-driven mid-departure mutation while preserving same-Writing filtering and existing native/project/embedded routing policy.

This is permission to prepare the next coherent diagnostic candidate, not browser acceptance or runtime-family admission. New generated runtime bytes, exact candidate/source/archive binding, and the unchanged actual 40-case / 4-context / 24-leg diagnostic still need their own evidence. Require current visible H2 text on the live owned layer, native same-node CSS start/end, real frames, positive elapsed duration, no cancellation, and no watchdog departure. Retain all original footer/no-JS cases and the 240-second budget. The failed299 evidence, hosted gate failure, and all not-observed rows remain preserved; full release/hosted/runtime advancement stays blocked pending fresh results. No unchanged-source rerun was performed.
