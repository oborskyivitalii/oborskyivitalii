# Reader/history prepared correction — White-box QA v1

2026-11-05 UTC; issue169 / PR170. Independent correction continuation of this role's audit v1; no current peer output read. **BLOCKED: two realistic history sequences still fail.** No application/test edits, browser launch, build or campaign rerun performed. Only this report was written.

## Identity and inspected correction

Base HEAD `d3a49960714e5f158afba23d02dd0f8e871cb28e`, prepared dirty source. Input manifest `review/issue-169/r9/reader-audit-correction-input-manifest.json`, SHA-256 `d0b40356b7856f4297fad8e4e596c1ecf1d21139d6f9f0c63ba30f964aa108e2`; all 15 declared path byte counts/hashes verified, zero mismatches. Reviewed navigation SHA-256 `eec5c473370a0b39b14c02f05009a12388388af8654ddb3e401e3071d4e1c2b6`.

Source review covered capture-phase outgoing snapshots, exact index/page/URL lookup, 128-entry eviction, branch pruning, existing 350ms serializer, scroll/focus/reader restoration, actual route/archive fixture, nine dependency mappings, applicable current block completion refusal, and issue169 evidence-family loop. Current-family positive migration remains pending observed runtime admission, as required by the initial audit.

## Actual bounded checks

Independent exit0: eight selected tests across navigation/archive/article-browser-evidence/test-profile-selection, using name pattern `footer links share|foreign document history|recent reading survives|native history keeps|recent history matches|current route phases refuse|reader-block evidence is required|reader and delivery owner changes`. 8 pass, 0 fail, no skipped/cancelled/todo. Includes duplicate Writing URL entries, new forward branch, exact index/page/URL refusal, request/inert/departing/unknown/missing-index guards, 128-entry bound and eviction fallback, actual shared archive owner, nine direct mappings without unknown fallback, current family evidence and watchdog/cancelled/missing phase negatives. Author's 69-case result is not claimed as independently executed.

The completion guard now applies to both phases for all identities requiring reader paper, including Writing phases; it retains older evidence compatibility. The expanded issue169 loop and direct dependency assertions address the audited holes. No timer budget, animation frames requirement or diagnostic matrix changed.

## F1 — high: ordinary serializer erases target focus before arrival restoration

Controlled probe used the **actual prepared navigation functions and actual routeHarness**, with only the test harness exposing its scroll-entry stub so arrival could be held. No product function was replaced. Sequence:

1. Writing → article → Back; change Writing scroll to574, focus `archive-topic`, schedule the ordinary350ms save; Forward captures this recent departure.
2. Back starts, mounts Writing and holds its arrival before `restoreReadingFocus`.
3. Fire the existing350ms timer while the target is mounted. `content.inert` is already false; `save()` sees matching route and no departing marker, writes body/null focus, and deletes the target's recent entry.
4. Release arrival. Restoration reads the newly overwritten persisted state and focuses `main`.

Actual output (all defect assertions passed, exit0):

```json
{"before":{"inert":false,"focus":null,"storedFocus":"article-sample-en","scroll":574},"during":{"inert":false,"focus":null,"storedFocus":null,"scroll":574},"after":{"focus":"main","storedFocus":"main","scroll":574},"expectedFocus":"archive-topic","nativeFallback":[]}
```

A second independent ordering probe held **reader arrival** after article → Back → Forward. Reader disclosure `[true]` and scroll843 were restored, but350ms firing before focus restoration again yielded `main`, not `reader-citation`:

```json
{"phase":"reader arrival","before":{"reader":[true],"focus":null,"scroll":843},"after":{"reader":[true],"focus":"main","scroll":843},"expectedFocus":"reader-citation"}
```

Thus this is not merely a mock Writing filter detail or a disclosure failure. `save()` deletes recent state during a legitimate async arrival window, before its target focus has been consumed. The existing new tests fire350ms after the awaited travel, which misses this partition.

Required treatment: preserve the target restoration snapshot until the owning arrival/focus/reader restoration completes, and prevent transient arrival state from replacing it. Keep the350ms deadline and final normal serialization. Add held-arrival regressions for both Writing control focus and reader link focus/disclosure/scroll, with the real timer fired before restoration; retain normal active reading persistence and read-time input behavior. A broad `request` guard needs care because the final deliberate save currently runs before request cleanup; this report does not prescribe an unreviewed implementation.

## F2 — high completeness gap: exact initial principal snapshot Back leaves the article mounted

Composed actual prepared history handler with actual `routeFor`/`addressPage`, an exact initial Writing snapshot URL and one declared article. Sequence: open `snapshots/<64hex>/writing.html?topic=delivery`, navigate to declared article alias, then native Back. The URL returns to the initial snapshot but `routeFor` returns null; the pop listener takes its same-document branch and never mounts Writing or assigns a native fallback. `addressPage` correctly says Writing, so ownership-only tests pass while lifecycle is wrong. Initial `save()` also refuses that path.

Actual observed object:

```json
{"url":"https://fixture.test/snapshots/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/writing.html?topic=delivery","addressPage":"writing","routeFor":null,"mountedArticle":"sample:en","scroll":0,"assigned":[],"arrivalPages":["article:sample:en"]}
```

The probe's final host `deepStrictEqual` on a VM-created empty `assigned` array failed because of cross-realm prototypes, after the output and all URL/owner/mounted-article defect assertions. This helper error is not a product failure assertion and does not invalidate the displayed wrong mounted route; use `assigned.length===0` for the negative. No app change followed it. This is a pre-existing route-admission gap exposed by the requested realistic sequence, not claimed newly introduced by the capture cache.

Required treatment: route this exact validated initial-entry history destination coherently through restoration, or perform an explicit safe native fallback. Preserve exact origin/path/query/hash rules and unknown/foreign/different-snapshot refusal; do not add arbitrary principal snapshot admission. Add actual lifecycle assertions that mounted route, URL, filters, scroll and focus agree after snapshot → article → Back and Forward. Existing standalone address-owner assertions do not establish this behavior.

## Verdict and limits

The audited oracle/family/dependency corrections pass their focused checks, and the cache's matching/bound/pruning guards are meaningfully exercised. The new history feature remains blocked by F1 and F2. Preserve this first result before affected correction review. Current unadmitted runtime references, generated artifacts and the unchanged actual40-case observer must remain pending; no browser CSS completion, hosted/staging/production or reader-foundation completeness is claimed here. New application bytes require fresh exact-source review/evidence.

End-of-writing readback: navigation changed concurrently to SHA-256 `414f57a950802b8bd80dd922519d123c5542ebfc2ce46f97239ac1a7e8a9d682` on the same base. The manifest's15/15 readback was earlier, between bounded probes; each probe read the actual file but did not retain an independent immutable copy/hash at its own start. This receipt preserves the initial prepared-source diagnosis and outputs; it does not assign a verdict to the later bytes. A fresh affected manifest/readback is required before accepting the correction.
