# Issue179 — independent Requirements & Acceptance first preflight

Date: 2026-11-09. Role: distinct nonauthor Requirements & Acceptance reviewer, task handle `/root/issue179_requirements`. Phase: first preimplementation judgment. No candidate implementation existed during inspection.

## Verdict

**PASS for bounded implementation through a Draft PR preview, with the interpretations and required evidence below.** No material owner decision is missing for that phase. This is not final candidate acceptance, production admission, issue completion or a LinkedIn result. Preserve this first result unchanged; completed candidate needs a fresh source-bound requirements review and the other three independent roles.

Authorization is the supplied original issue plus the later maintainer decision: implement issue179, stop at PR preview. The later decision supersedes intake-only wording; it does not authorize stable staging, merge, production or a LinkedIn post. Keep AC06 open. Missing production/live/platform observations are deferred gates, not acceptance failures in the implementation phase and not evidence that the ultimate outcome has occurred.

## Identity and isolation

Inspected Git HEAD `fe7baab277a8b90de330a1cec738b7085faf7223`, branch `work/issue179-article-social-previews`; `git status --short` and `git diff --stat` were empty. Base equals HEAD. All packet manifest entries matched their actual bytes. Packet SHA256 `684dacd04b9f06db11da1ed97edbd1ffd7c7d1ffac44cd402247d70bbc922535`; intent SHA256 `2c3ff32a94df5c099de19ad31245415b252c5eb4496557cd28e663063d1f57ae`.

I received the scoped task and supplied primary-source paths, not author scratch notes, current peer verdicts or private chat. I did not inspect unrelated MEMORY or peer outputs, delegate, modify sources/tests, or write externally. Conversation launch parameters and provider context/model internals are not independently observable from inside this agent; orchestrator must attach the actual explicit none-fork launch receipt. Shared platform/project instructions, tools and filesystem remain shared; this is an operational read boundary, not OS isolation. The packet is a small identity manifest; full issue/AC/authorization text is in the separately hashed supplied intent file. Its identity was verified and actual text read.

README and scoped owner portions were read; REPOSITORY-MAP was used for navigation, not treated as implementation evidence. Source/test inspection was bounded to the owners listed below. Long broad initial output was truncated; relevant source sections were separately inspected. No test execution or live GitHub refresh was performed by this reviewer: Git local identity and supplied dated API issue snapshot are the observed sources.

## Findings and scope interpretations

1. **Medium — AC02 must distinguish new cover renditions from the explicitly retained fallback.** Scope item5 keeps the existing principal/no-cover site image; current portrait is960×887 (`production-social.json`), below LinkedIn's current1200×627 sharing minimum. Applying that new minimum indiscriminately would conflict with the accepted fallback and historical preservation obligations. Treatment: document the new bounds as obligations for newly generated article cover renditions. Keep the explicit existing fallback exception and old immutable editions unchanged; do not assert that the portrait meets new image guidance. This follows original scope and needs no new artwork/global portrait replacement.

2. **Medium — actual SDLC hero cannot be reused unchanged for AC02.** `publication.json` declares hero1672×545, and the viewed JPEG is a wide lifecycle chain with meaningful material from Intent through Feedback at opposite edges. Height545 fails the627 minimum. Existing lossless/equivalent pipeline expressly preserves original dimensions and pixels (`site/README.md`, `article-media.cjs`, `web-media.py`). Treatment: derive a separate social rendition through a bounded extension of that pipeline, with deliberate padding/crop and unchanged source/manuscript/reader assets. A1200×630 padded composition can preserve the full chain; any selected treatment must be visually reviewed at the final output. Merely changing metadata dimensions is invalid. Use an exact conservative byte bound of5,000,000; retain any stricter existing asset/transfer/closure budgets instead of relaxing them.

3. **Low — “cover/hero” terminology is resolvable from source.** `profile.cjs:370–400,537–550` requires each furniture role to have one declared asset id or an authored omission reason; missing/unknown ids and checksum mismatches fail. `reader.cjs:272–292` uses `article.furniture.cover.id` to place the cover. Both roles currently select `hero` for SDLC, but future roles may differ. Treatment: social selection follows the validated **cover role** used by the title image, not first figure, id spelling `hero`, arbitrary inline media or a hero-only guess. An explicit cover omission is the supported no-cover case and uses documented fallback even when unrelated figures exist. Declared-invalid selection fails closed. Existing source contract supports the issue's proposed fallback; no contract conflict found.

4. **Medium — PR preview is a limited observation surface.** `tools/staging/edition.cjs` produces noindex staging HTML; only `tools/release/edition.cjs` currently inserts production OG/Twitter image fields. Ordinary preview success alone cannot observe the changed production-specific tags or canonical production image reachability. Treatment: preserve preview indexing/analytics policy and test a locally derived exact-source production edition using real producer output; inspect raw HTML plus decode image bytes and source binding. PR preview can demonstrate appearance/served preview resources and image composition, with an explicit distinction from production social HTML and the actual LinkedIn result. Do not inject production indexing merely to make the preview test convenient.

5. **Medium — existing historical test alone will not prove old release compatibility after the producer changes.** `release-archive.test.cjs:159` creates its “historical” sample via the current `edition.build`; after edits that sample will be newly formatted. It does use an isolated verifier with absent/changed portrait/source policy, which remains valuable. Treatment: retain a genuinely prechange frozen production package or exact fixture bytes/source identities generated from this clean base before implementation. Verify it with the changed intrinsic archive/live path, unchanged old HTML/image/notice bytes and frozen evidence. Add coverage for new per-article frozen evidence independently. Do not make a blanket missing-field/old-version bypass, and do not apply today's cover/bounds rules retroactively to the old portrait.

6. **Low — acceptance mapping is not yet present.** `.github/acceptance/issue-179.json` does not exist in this base. Treatment: create the normal stable-ID mapping, and include applicable CODE-STYLE rule IDs/guard plus unautomated review as an AC05 subcondition. This is protocol execution, not a change to owner intent. Keep the compound criteria unticked until every applicable subcondition/phase gate is observed.

No new public artwork, redesign, analytics, post/account changes, DNS, Medium canonical changes or scientific-content changes are required. SDLC's declared artwork credit is original non-brand editorial artwork underCC BY4.0; preserve its source, credit, transformation provenance and corresponding inventories. This is bounded source interpretation, not a replacement for final rights review.

## Acceptance and test allocation

| Intent / AC | Required independent oracle and bounded allocation | Preflight observation / later gate |
| --- | --- | --- |
| AC01: article title image, reusable future behavior | Real SDLC output plus two distinct accepted fixture inputs, cover role differing from hero/inline figure; compare initial raw OG URL to the validated authored cover/source and decoded rendition provenance. Existing site-articles/article-media/article-delivery owners; actual production-edition tests under release-controller. | Source selection traced; behavior not implemented/executed. Default catalog selection and no-JS document remain authoritative. |
| AC02: usable bytes and metadata | Decode actual JPEG, verify actual dimensions, byte limit, MIME/hash/absolute HTTPS canonical origin, alt and Twitter consistency; validate escaped punctuation/Unicode in meaningful article alt; visually compare composed rendition to source. Negative dimension/hash/MIME/oversize/truncation inputs. Media tests own conversion; release-controller owns production tags/live fetcher. | Existing hero fails new minimum height. Final visual review and exact production HTTP image remain separate gates. |
| AC03: route/fallback/isolation | Canonical alias and immutable article document agree; supported extensionless entry resolves to the same intended article without changing URL policy. No-cover explicit omission uses fallback; cover-invalid id/hash/missing bytes rejects; unrelated figure never chosen. Draft/unlisted/technical selection remains unchanged. Existing article-delivery/site-articles and served hosted route checks; target extensionless case explicitly because generic hosted inventory loops files. | Current model has explicit omitReason and candidate admission guards. Generic hosted verifier follows redirects but does not independently enumerate extensionless article entry. Later hosted preview can check alias convergence; production route identity still deferred. |
| AC04: frozen delivery and history | Verify per-document descriptor against complete public closure, source hash, image dimensions, MIME and authoritative tag inventory. Reject duplicate/stale/wrong-article tags, foreign/path traversal/query image URLs, absent assets and alias/snapshot disagreement. Verify each selected social image in mocked live HTTP. Retain old package bytes, historical archive checks and historical restore. Extend source-bound rights inventory tests only where actual new provenance/resource shape changes. | Global descriptor and article equality assumptions directly confirmed in edition/archive/live owners; no code acceptance yet. Archive compatibility must use frozen evidence, never today's publication source. |
| AC05: reviewed exact candidate | Before broad execution, record delta/dependency/test dispositions and actual registry selection. Add/update affected existing suites; retain old negative/refusal/history cases, budgets, source/CI route and full accounting. Run cheap affected tests then Basic, RI build/verify where required, mapped profiles and four independent candidate reviews. | Existing tests inspected, no suites run. PR preview gate is authorized; stable staging/merge/production are not. |
| AC06: real LinkedIn preview | After separately authorized production, verify exact raw served article HTML/image, refresh exact URL in Post Inspector and retain platform observation/screenshot plus deployment identity. | NOT OBSERVED / deferred; stays open. Generated metadata, local production derivation and a PR screenshot cannot satisfy it. |

Existing test dispositions: update production global-equality assumptions where current format requires per-document expectations; keep principal portrait tests. Retain source-selection, lossless pixel/ICC equivalence, draft refusal, artifact mutation, rights acceptance and retained-edition collision negatives. Extend those only for the actual new social descriptor/asset integration; avoid rerunning every suite without the changed-path/profile allocation. Existing historical source-independence test remains but needs a genuinely old sample beside it. No new pipeline or broad staging run is necessary for this preview-only phase.

## External reference check

Read LinkedIn's official sharing guidance and Post Inspector guidance on2026-11-09. Sharing module guidance states5MB maximum, minimum1200×627 and recommended1.91:1; the issue's1200×630 preference is compatible. Do not accidentally substitute the separate advertising image limits from the same page. Post Inspector is for refreshing cached previews for new posts; existing posts retain their previous preview. References: https://www.linkedin.com/help/linkedin/answer/a521928/make-your-website-shareable-on-linkedin and https://www.linkedin.com/help/linkedin/answer/a6233775 . No LinkedIn account/post/Inspector action was taken.

## Next gate

Record these interpretations and the bounded impact map in the owning issue/PR review; capture the old frozen fixture before editing the producer. Implement within issue179 through Draft PR preview; obtain exact-source checks and fresh completed independent reviews before claiming that candidate reviewed. Report remaining production and AC06 gates plainly and stop after PR preview. No further owner decision is needed to start that bounded implementation.

## Actual inspected byte identities

The list identifies inspected files; source/test sections rather than entire large files were read where stated above. Hashes establish byte identity, not full-file comprehension or execution.

```json
{
  "AGENTS.md": "31ef44be1936809de5690da0b505fba5cf600f62e9a33d34b9d90e806387ae4a",
  "CONTRIBUTING.md": "a175f65e207b653b323f81a7543bea5a80f1f49b8ab6c9666c63656727667f65",
  "README.md": "6cfbf71fad0822cbd4d756afb76b2fd29cdd7b203541b098bfba040e2c24231e",
  "REPOSITORY-MAP.md": "7c3f6072ee3cf0f7695be780b3dcddef484e130be7a58c194b41920f5b50cbd6",
  "agents/reviewers/README.md": "2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb",
  "agents/reviewers/requirements-acceptance.md": "010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6",
  "guides/SITE-CHECK-PROFILES.md": "aea03f28069a9bc114800bd7d7e60af7bfc1411a4abc83e7b5d6b86b6bb57b57",
  "guides/SITE-RIGHTS.md": "e1a0768f58af31d7e28e2cc0290553012ec46cd159b4274affe234451774b4a9",
  "guides/SITE-SEO.md": "8e2b32470a66f98526776f97d185719d7469e04e8e9742fe6529f3dda2176864",
  "site/README.md": "6696e8f54d09d314ad1b0dda5249dffbcd1a1a6e80c62316ec5d2dabe7e50436",
  "site/assets/publications/sdlc-out-of-balance/hero-web.jpg": "fe76db95cbedba54934895fa21139654399b41b7c820c1974ad3fef410223e5f",
  "site/content/production-social.json": "ad0b0b58c019a0a1c898c66e8d6569e4372af6cf5c8ec6b5464c9c639711bbd8",
  "site/publications/sdlc-out-of-balance/profile.json": "5ee8d15fe4e563e44ead35e7216fc80f6470ed2cd516d851e79e4c236fdf4e92",
  "site/publications/sdlc-out-of-balance/publication.json": "9eb4522a0f5d0efe3cdb5a8365dd4188225efa53a65cdca12fa4ccef39bc3bde",
  "tests/article-delivery.test.cjs": "39076a39f80a64611468fbbb1e975de2d2538105ab5f2c73cc0d824d4e144f48",
  "tests/article-media.test.cjs": "a16d2a555b640916a7e5fa33da8b0fbbdbdf43aa473ce972df8d7bcfa9989766",
  "tests/edition-retention.test.cjs": "d8f446a23ab023eafbf3da6ba6aa112102f207de58e4dab9f223812762e2a01b",
  "tests/release-archive.test.cjs": "60f24c9d62a699c8acf082759ab2854c957ea0747dfe14cb661d9fbb867f5bde",
  "tests/release-controller.test.cjs": "ae261cc44e020042ebc51fa0517f7b04dea0a3d19a4f7e95fc970698436f7cbe",
  "tests/release-rights.test.cjs": "1dd519a2cb41c55e720e5c13dcf72c5c8afee96ab486a6bec5e635f145d86517",
  "tests/site-articles.test.cjs": "7b885d9f24a25fe350272caff32fd4942421fa4f7a3fa69db4c84f9b172608d4",
  "tools/pages/http.cjs": "ed66267020fa130fcfe3e129bbae7ff3d94e4f906fe0595948a8d896d222afd8",
  "tools/publishing/profile.cjs": "4a0d27b65bcafbc89e7f894587055fba9bbc529ba19ecaef94e5bc4a9d97a471",
  "tools/publishing/web-media.py": "7c0c162f4f3466c3eedc297504c00bc6bee2ca3fb8d36e2617f8d95ddb60ed44",
  "tools/quality/hosted.cjs": "1b813bf2de5f2ff3d2505cb1760a936c3237108cb2f3a95a4cce0cb4c4ffece0",
  "tools/release/edition-archive.cjs": "281f56ce375c3a31d5faabe14b1105a76f5bb2ea0f1b648b5e903670dd33343a",
  "tools/release/edition.cjs": "ded3d9fcccea3fb007c393a9f5afc6a63fb3eb49122d91999ee6d2cf00839ea3",
  "tools/release/live.cjs": "90085cfa0ae4da0dfc4241b5cb04cc2c97a566e01ce7b197fd1044fd4dde014b",
  "tools/site/article-media.cjs": "23d46312c654be5286110ca965870ea489c95c68b7572d19fa32475a2cd7a798",
  "tools/site/article-selection.cjs": "67433dfb1a4c6f66f0d1b53d7e45f3ffc3949fa06afead0113e2a8472377a6dd",
  "tools/site/articles.cjs": "78eba91a08bd9a83d4c4c644216968ce99a80382631302792a7971f24ee57954",
  "tools/site/reader.cjs": "6ae95e796e6bd8b9b4bd03a30f92c44cfead057c525d88b2e1a85fe5d6d7072f",
  "tools/site/snapshot.cjs": "eae15e6734b64ebc015d56e34ebc0a3118ae21f3e1fb340df89075cb1df206f4",
  "tools/staging/edition.cjs": "7ac281d26481bfc7b8f831b6affdd51d880c1b3307ce9b78df5d2758d42fb942"
}
```
