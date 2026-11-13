# Issue 183 — Thinking Systems migration checkpoint

[Owning issue and acceptance criteria](https://github.com/oborskyivitalii/oborskyivitalii/issues/183). Phase 1 adds one article and stops for review at Draft PR Preview. Protected base is `fb0c61650ce3bd03acfbd1708830f2606e9faffd`.

## Source and rights

See the [edition source and rights inventory](../../site/publications/thinking-systems/PROVENANCE.md).

## Acceptance and checks

| Criteria | Phase 1 evidence |
| --- | --- |
| AC01–AC02 | Reconciled article, section inventory and asset digests in `site/publications/thinking-systems/`. |
| AC03 | Reader credits and two archive links with their actual source dates. Site publication event is pending. |
| AC04 | Same catalog IDs and tags. Home and Writing select the native reader. Research links into the systems reading path. |
| AC05 | Publisher validation, archive/source regressions, build and size checks, desktop/mobile direct navigation and JavaScript-disabled reading. |
| AC06–AC08 | Draft preview only. Remaining articles, SDLC cross-article reading paths, staging, production and batch closeout remain open. The existing SDLC source citation continues to identify its LinkedIn edition. |

The catalog validator and renderer carry the minimal historical edition contract (CS01, CS02, CS04–CS06). Historical references are dated and neutral. Existing event-bound rendition and translation checks stay in force. The regression covers forged publication events, body-equivalence claims, wrong hosts and years that differ after an observed site event.

## Preview and independent review

- Requirements preflight `/root/requirements` ran with `fork_turns="none"` on protected main. It identified the need to reconcile the exact Generative AI text, preserve the split Figure 8 and separate historical dates from a future site event. Common prompt blob `68796daaf4313f64da381b1628866267fd9e263b`, role prompt blob `3e6330fc4a1a01d33e2dcae6e0f35d3f3471c1e4`.
- Code review `/root/code_183` ran with `fork_turns="none"` on local `deb79f06`, tree `38874bb1468a0553ff0bf65ff5ee4f4387ec48f6` (identical to first remote preview head). The reviewer checked the selected text, figure hashes, licensing, style guard and production metadata. The archive-year test now exercises a matching site event and rendered year/date, workflow guidance states the historical exception, and AC05 carries the style subcondition. SDLC cross-links remain a batch item. Role prompt blob `2363340a1eaae62fdbd3ab070fda5c6436ec8124`, source packet SHA-256 `005bcd05500cbe1b18b3ec970ddff4de18132237764ea19b359fcc7e797352e8`.
- White-box QA `/root/whitebox_183` ran with `fork_turns="none"` on the same tree. It independently exercised site event validation with distinct archive and publication years. An existing public analytics identifier appears under a new generated path. The existing scanner requires exact-path adjudication for staging; preserve the existing scanner and resolve this before a staging request. The next article's custom Medium domain needs its own allowlist and regression.
- The [first hosted preview](https://8c820908.oborskyi-author-ci-staging.pages.dev/articles/thinking-systems.html) returned HTTP 200 with noindex and its own social image. [GitHub run](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/43421055866) identifies remote head `6ba9ab542283096a291ffffccc709ddb0f225be4`. This is preview evidence, not a release event. Production canonical and sitemap behavior was exercised locally against the release renderer.
