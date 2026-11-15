# Issue 183 — Control Theory migration checkpoint

[Issue #183](https://github.com/oborskyivitalii/oborskyivitalii/issues/183) · [Draft PR #205](https://github.com/oborskyivitalii/oborskyivitalii/pull/205). Checkpoint 2 of 5 adds the December 2025 Towards AI edition. The author confirmed the original cover is his and authorized a new normal-distribution figure. The decision applies to this figure. Preview is the current review boundary.

## Source and rights

The [provenance record](../../site/publications/ai-governance-is-control-theory/PROVENANCE.md) pins the selected source, both historical platform dates, the cover authorization, and the chart calculation. The manuscript is pinned to `59e22aa1225130888c734696cfb38dfa215ce706`. The publisher validates 15 sections and two figures. The native edition has no recorded site republication date.

## Acceptance and check allocation

| Criteria | Checkpoint scope and evidence |
| --- | --- |
| AC01–AC02 | Publisher validation and independent text/figure review for the exact rendition. The other planned source editions still require their own passes. |
| AC03 | Actual date and site event remain pending. Historical platform metadata is checked in `tests/local-catalog-relationships.test.cjs`, including the distinct 2025 archive year after a simulated future site event. |
| AC04 | Writing preserves publication-09 and 30 records. Research now points to the native reader. Basic archive and `tests/content.test.cjs` verify the row and changed Research destination. The SDLC reading paths remain a batch obligation. |
| AC05 | The catalogue validator admits the precise Towards AI host under the existing historical-platform contract. CS01, CS02, CS04–CS06 and CS10 apply to catalog source, validation, rendering, oracle and review evidence. Basic, the bounded style guard, focused catalog/publisher/rights tests and the draft preview package checks cover the source and artifact. Actual desktop/mobile and no-JS observations are separate evidence. |
| AC06–AC08 | Draft preview is a checkpoint. Stable staging, production, observed republication dates and batch closeout remain open. |

The post-integration precheck found three stale test expectations. Basic was 17/18 because the archive fallback oracle counted only explicit edition dates (19) while the archive correctly included the undated native reader in 2025 (20). The Research snapshot expected the old external destination. The new post-publication fixture reused the live catalog's exact Towards AI URL and triggered the duplicate-URL guard. The oracles now include the 2025 archive classification and the exact native Research destination, and the fixture uses a unique URL on the same approved host. The production duplicate guard remains unchanged.

The first full test campaign found the original draft cover encoding exceeded the 800,000-byte article transfer budget once the Color variant was applied. The revised 1200 × 670 cover uses the same artwork without cropping, preserves matching decoded pixels between the source PNG and web JPEG, and gives 701,206 gzip bytes for the complete Color reader. No size budget or acceptance guard changed.

## Independent review and delivery

Candidate comparison base is main `b7b95a1cfb75a5dc9cd55ca85f3ea375ab2c500a`; the prior Draft PR head is `62f6c0e80c57bad4a4e879391fd088a29582992b`. Exact hosted observations are tracked on the PR.

### First independent passes and corrections

All roles were separately launched with explicit `fork_turns="none"`. Common prompt blob `68796daaf4313f64da381b1628866267fd9e263b`. The execution interface confirmed separate handles. Provider context internals were unobserved.

- Requirements preflight `/root/requirements` reviewed the issue, previous PR head and prepared source manifest `9a6e43aa7d5cb45d596d476ef728112f2633b4b9c3e67813cfbd5d620b2dbd83`. It found the duplicate fixture URL, missing policy and stale authorization prose. Existing implementation bytes predated the pass. Role blob `3e6330fc4a1a01d33e2dcae6e0f35d3f3471c1e4`.
- Code `/root/governance_code` reviewed local `71ed4b300b423280fa0bc037ee3ce1c2907e1dc3`. It reported excess test reformatting and nested host admission. The cases use the pinned formatter and custom publication hosts require an exact hostname. Role blob `2363340a1eaae62fdbd3ab070fda5c6436ec8124`.
- Requirements `/root/governance_requirements_final` reviewed local `888275ddc759f8308557027bf8efec636bc77f3c` and found the historical source footer used “Framework:” while the initial migration included expanded alternate-edition wording. The selected source wording is restored and re-pinned. The archive fallback test now distinguishes historical-source and ordinary site-first year precedence.
- White-box `/root/governance_whitebox` independently verified current and simulated republication year preservation and reported the nested hostname and legacy fixture tag failures. Legacy synthetic inputs now isolate source catalog, tags and discovery destinations together.
- Exploratory `/root/governance_exploratory` reviewed immutable tree `00b1fa3293c96dd621823cb521aa2a81a78e4ef6` and verified ordinary HTML, both media assets, the 30-row catalog and Writing/Research reader links. Chromium was blocked by the local environment before loading a page. The SDLC cross-article reading paths remain an open integrated batch requirement. Role prompt SHA-256 `280feac9d22508fbcef6e7181feaf3625d45b1718fd833576a0e8fb9520c295a`.

### Correction passes

- Fresh Requirements, Code and White-box correction executions inspected local `588ac49669ff66e692cf43dbb8aae9a56462a55f`. Requirements confirmed the primary source and archive corrections. Code identified the remaining historical contact label and formatting-only changes. White-box identified an unmatched fixture import, the changed Research destination in historical parity, and fixture classification.
- Fresh Code and White-box executions inspected local `0e212a75daf34ded109d366a15fb1ff28d3301e8`. Both confirmed the restored label, exact edition pin and narrow Research reconciliation. The admitted-ancestor case still fell back before its intended shared-render check. The root cause was the four new asset inventory rows naming a per-edition provenance file as editing owner. The compatible-content classifier requires the canonical article workflow owner even for existing publication paths. The inventory now follows that existing rule, and the focused case reaches the intended shared-render guard with its original check.

## November 2026 author updates

The [author-approved follow-up](https://github.com/oborskyivitalii/oborskyivitalii/issues/183#15-november-2026--author-approved-terminology-update) preserves the December 2025 text while adding the updated terminology at the point where a reader needs it. The new site edition pins the committed manuscript at `e72fed250eac3a67aae9ffa621494d144d7cc8f0`. The December 2025 edition JSON and its pinned source remain available at their original Git identities. The change updates the reader and its generated article/index bindings. Original external metadata, release event status, catalog row, cover and chart carry forward.

Independent requirements preflight `/root/update_requirements` used `fork_turns="none"` on the old preview source `ba56d59e92fea336686ea917aaf21e2ec861348d`. It confirmed the need for a new immutable edition and the historical-text recovery, asset/dates, year and no-event checks. Common prompt blob `68796daaf4313f64da381b1628866267fd9e263b`, role prompt blob `3e6330fc4a1a01d33e2dcae6e0f35d3f3471c1e4`.

- AC01–AC03: subtract the five labeled notes, reverse the editorial introduction replacement, then compare the complete manuscript with the original PR preview source. Verify both frozen edition records, publisher history, local media/rights and original platform links and dates.
- AC04–AC05: preserve the 2025 Writing record with ordinary HTML, original media and navigable annotations. Verify the regenerated outputs, the inherited authored site profiles, exact hosted preview packaging/HTTP identity and human reading observations.
- AC06–AC08: this iteration returns to Draft PR Preview and retains the pending release and batch gates.
