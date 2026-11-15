# Verification Crisis migration review

Checkpoint 3 of [issue #183](https://github.com/oborskyivitalii/oborskyivitalii/issues/183) in [Draft PR #205](https://github.com/oborskyivitalii/oborskyivitalii/pull/205). The checkpoint base is `8da0bf8f9a8863feff64ce8a542b5819f5d90bcc`. The author requested the next article in the agreed sequence.

Independent requirements preflight `/root/verification_requirements` used `fork_turns="none"`. It verified the selected and alternate publication dates, existing Home/Writing ID and tags, separate source and media evidence, and exact Draft Preview scope. Common and role prompt blobs `68796daaf4313f64da381b1628866267fd9e263b` and `3e6330fc4a1a01d33e2dcae6e0f35d3f3471c1e4`.

- AC01–AC03: [source and rights](../../site/publications/ai-verification-crisis/PROVENANCE.md). Verify the exact authored text, two platform dates and three historical links. The lead image's provenance remains open. The draft is coverless.
- AC04: the existing 2026 Writing row keeps its delivery topic and three tags. Verify native links in Writing, featured Home writing and the Home Research introduction. The SDLC article's historical citations remain part of its immutable text. Related reading uses the same publication index.
- AC05: use the publisher, native build, historical parity, Basic, archive/reader/budget checks, Draft Preview and browser readback. The content configuration and Home assertion follow CS01, CS02, CS04–CS06 and CS10. Confirm the coverless social fallback.
- AC06–AC08: this is the third Draft Preview checkpoint. Stable staging, release and batch acceptance remain open.

The initial publisher validation rejected catalog-reference declarations for the verbatim URL labels in the historical footer. Both named platform links remain declared source references. The historical footer's three URLs remain linked in the manuscript and were verified against the selected edition. The validation guard remains in force.

Independent Artifact, White-box and Exploratory QA review of candidate `8e5318b19cfa474de5f9d7c9eb1418fbfae440da` found two blockers. The coverless reader treated a plain paragraph as cover furniture because both asset IDs were undefined. That reversed the first two paragraphs and changed the ordered authored-block digest to `df1650ed74f0400521b9c0a30e8a65958348a15b2f8631d05c173fe1278346d7`. The duplicate platform URL test also failed before reaching its intended validation because its input became the new relative native route. The reader now searches for a cover only when the profile declares one. The regression assertion exercises two coverless opening paragraphs. The duplicate URL test uses the retained Medium edition URL and checks the same rejection. These changes exercise the CS01, CS02, CS05 and CS08 contracts through the existing reader build and catalog checks.

## Original cover restored

The author confirmed generating the original cover with Gemini or ChatGPT and approved retaining it on the site. The original CDN bytes match the recorded digest. The native draft uses a resized, uncropped copy and an article-specific share image. The original two publication dates and the prose digest remain the content oracles. The previous coverless edition is preserved in its original committed source and edition record. The asset rights decision is recorded in the [publication provenance](../../site/publications/ai-verification-crisis/PROVENANCE.md) and [site inventory](../../site/rights.json).

The author also requested a native reader for Agentic Loops. Issue #183 queues the existing Writing record after the five selected previews. The cover iteration is limited to the third article.
