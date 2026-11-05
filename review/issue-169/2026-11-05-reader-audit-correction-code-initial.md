# Reader audit corrections — initial Code findings

Refs #169 / PR170. Independent nonauthor Code continuation `/root/native_r9_code`, 5 November 2026. Complete prepared eight-file semantic diff inspected against `d3a49960714e5f158afba23d02dd0f8e871cb28e`. Input manifest SHA256 `d0b40356b7856f4297fad8e4e596c1ecf1d21139d6f9f0c63ba30f964aa108e2`; prepared dirty source is not clean Git evidence. No current peer verdict read before these judgments, implementation edit, browser run or external mutation. Only this report is written.

**Blocked by two independently reproduced runtime mechanisms.** The source/fixture allocation and native-phase validator improvements are useful but do not supply acceptance of the current cache/navigation implementation. Initial results are preserved before further correction.

## C1 — arrival timer destroys cached target focus

Medium, blocking current history correction. `save()` rejects inert/departing content, but not an active request or arriving phase. `flight.finish()` clears inert before `navigate` awaits `scrollEntry.arrive`; an already queued350ms scroll persistence callback can therefore run inside the destination arrival. It serializes transient body/null focus, then deletes `readingEntries[historyIndex]`. Later `restoreReadingFocus(true)` consults that now-deleted recent state and focuses main instead of the captured control.

Independent read-only counterexample executes the actual navigation/scroll/popstate source through the maintained route harness, with only the observer's arrival method gated to expose the real asynchronous interval. Writing initially records scroll2163/article-link focus; after Back, live reading moves to574/archive-topic focus and Forward captures that recent state. On subsequent Back, the destination arrives at574 while inert is false. Running the existing350ms callback changes persisted target focus from the old article link to null; releasing the arrival resolves with final focus `main`, expected `archive-topic`. Native scroll574 survives. No browser or application source was modified.

The new authored test invokes the timer only after `await travel`, when arrival/focus restoration has completed, so it does not exercise this interval. Correction must prevent persistence from consuming transient arrival state or retain the target restoration snapshot through completion, while preserving genuine later user reading and the same350ms policy. Add a controlled actual-arrival interval regression, with post-arrival persistence still meaningful. No timeout/budget change is justified.

## C2 — initial immutable principal history does not remount its document

Medium, concrete unmet foundation path. `addressPage()` correctly recognizes the exact initial principal snapshot, but `save`, capture admission, ordinary popstate and `navigate` still classify it only with `routeFor`, which intentionally returns null for that path. The initial save therefore may never establish its indexed browser state. After entering an article, native Back takes the popstate same-document/unknown branch instead of mounting Writing; it restores scroll on the still-mounted article.

Independent actual-source boundary/lifecycle composition used initial `https://fixture.test/project/snapshots/abc/writing.html`, its existing same-origin initial-page fallback and a declared article. Before departure: addressPage=`writing`, routeFor=null, initial state remains without index after actual save. After actual-source navigate to article then native capture+ordinary popstate Back: URL returns to that initial snapshot, but `document.body.dataset.article` remains `reader-profile:en`; no native assign fallback occurs. Thus address ownership/filter tests alone do not prove a correct initial-document→article→Back history journey.

Use one coherent narrow initial-document identity through the required routing/history boundaries or an evidenced native restoration path. The existing exact original origin/path exception need not authorize arbitrary snapshot URLs or alter unknown/off-origin policy. Regression must use the actual classifier and popstate/navigate path, prove mounted document plus URL/index/scroll/focus, and retain unknown/other snapshot refusals. The earlier cross-PR audit's finding that the foundation source is integrated remains true; this is a concrete behavior gap in that present source, not a request to copy PR79.

## C3 — isolated reader history fixture selects the new capture listener

Medium, blocking verification repair. `tests/reader-mode.test.cjs` locates the first `window.addEventListener('popstate'` and evaluates the sliced isolated listener. The first registration is now `rememberReadingDeparture` in capture phase, whose implementation is absent from that isolated fixture context. Parent reports actual reader suite25/26 with this wiring failure; independent source inspection confirms the first-registration slice now includes that undefined capture callback. This finding is not a browser failure. Update the fixture to exercise the intended ordinary restoration listener while retaining separately meaningful real-source capture coverage, add the direct navigation dependency to its selector, and preserve geometry-before-scroll/focus behavior. No global fixture skip is justified.

## Other affected judgments

The cache remains local, bounded to128 and keyed by browser entry index; reuse additionally requires page and exact URL, preventing duplicate-URL entries or new query targets from mixing. Forward pruning and ordinary persisted fallback are appropriately bounded. Capture registration with `true` precedes archive bubble mutation even when archive registration order changes. It never writes outgoing data through incoming history. Those properties do not repair C1/C2.

Archive's ownership regression now invokes actual router functions rather than a parallel URL-policy stub. Actual-source boundary fixtures add declared article alias/extensionless/immutable snapshot and embedded reader variants. Site-article isolated scope supplies the new map. These are improvements, but current history lifecycle harness still substitutes its own route classifier and immediate arrival, which explains the two integration blind spots above.

`article-browser.validateArticleBlocks` now requires animationend for **both** phases whenever the existing reader-paper/current contract applies, before the article-paper-only geometry branch. This closes the prior Writing-side watchdog acceptance without changing legacy families. Existing issue169 native-tags/footer families are included in current evidence loops; explicit watchdog/cancelled/null/missing completion negatives cover every flight/history leg and phase. Independent focused evidence cases passed2/2, preserving historical report acceptance. The direct-dependency selector test passed1/1 for its nine pairs, including narrow ownership, no conservative unknown fallback and no historical task selection. Registry Unicode spelling changes are semantically identical.

One first reviewer harness invocation omitted the standard URL global and failed before a product observation; standard URL/AbortController globals were supplied before the two actual counterexamples above. These are bounded Node component probes, not actual browser observations or a repeated unchanged campaign. No full suite, browser or build was launched by this role.

## Held initial semantic pins

| Path | SHA256 |
| --- | --- |
| `site/engine/navigation.js` | `eec5c473370a0b39b14c02f05009a12388388af8654ddb3e401e3071d4e1c2b6` |
| `tests/archive.test.cjs` | `0da7275238c4e06304b188afab3c7f6b0817f539adff2e3f753b628006331dfb` |
| `tests/article-browser-evidence.test.cjs` | `aede448456cff9fded98093438b70fd3a0d2fe82be2f55bf5ffe38fc21a8370c` |
| `tests/navigation.test.cjs` | `a6eb3df3aef4dae5ea6aa3fe011541505b6ad563e742d97a71a450d6ee8429aa` |
| `tests/site-articles.test.cjs` | `4033d35336e8c0f59dd68380ed3c4baddf1508e9b42932a38dc1336f85346425` |
| `tests/test-profile-selection.test.cjs` | `45cb24b35d045a7b4b4f3de53a2c9005b39a4cbf274c99c83f50f5bef9623ede` |
| `tools/quality/article-browser.cjs` | `ddb8a9d52b8a5007e11bc71f4b07ad13685114060cdb38a9ebad74dddc5d75b3` |
| `tools/quality/test-profiles.json` | `a30e1a1d9682278e6e32eeef121675eb305de61f0f78295ace10f901e9fa9be3` |

Changed-source affected rechecks and coherent clean-source actual browser/CI remain required after corrections. The existing40-case observer SHA09e995 remains unchanged and no new runtime family is admitted by this review.

Chronology: this reviewer first sent the two source mechanisms independently, then completed the bounded counterexamples. During that work parent reported that a parallel review also reproduced C1 and that the reader fixture repair was planned; no peer report was read. While this receipt was being saved, a final read observed newer shared corrections already present (navigation414f57…, navigation test5ad6…, registry56138…, ordinary-listener fixture repaired). The table deliberately preserves the original held manifest/eec5 source reviewed above. These later bytes are not accepted or relabelled by this initial report and require their own affected review.
