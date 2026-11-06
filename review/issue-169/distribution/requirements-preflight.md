# Issue169 distribution — Requirements & Acceptance preflight

Date: 2026-11-06. Role: distinct nonauthor Requirements & Acceptance. Phase: pre-implementation. Owner: issue169 / PR170.

## Verdict

**Proceed with bounded preparation and contract alignment.** The supplied 6 November instruction is clear, feasible and sufficient authorization for preparing the distribution change. No new author choice is necessary. Preserve the original AC01–AC11, make the dated distribution subconditions explicit, and retain every external publication/release gate. This result is not implementation, execution, live-site, platform or release acceptance. A completed-candidate review is still required.

The essential distinction is assessable: a stable planned article destination may appear as an ordinary backlink before deployment; publication state, observed canonical and publication dates require the existing exact served-edition proof. Both author-manual platform publications follow website verification, in either order. The later reciprocal-link update waits for both actual observed URLs and changes the existing materials block together. That later dependency does not block website release.

## Inputs and independence

- Inspected Git head `7c292bd50a4f9a0024c397a290c1de965ceada4f`, tree `805ceaf86910e262dc3013489031ab5c5718e47d`; working tree observed clean before and after source inspection. Protected main `8cf15883125892710633b17133d9ee0fc4b23b92` was supplied, not independently fetched by this review.
- Intent SHA256 `0f8b0146e26d51748ac171408be03a13e86628c01185a10005844acd659256b8`; explicitly dated issue snapshot SHA256 `b8844112ad357ef14e5720259755bb81ba0362e73d6b2f5fa0073fe0b5d8044e`. Both actual local bytes matched the packet.
- Common contract SHA256 `2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb`; role prompt SHA256 `010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6`. Both matched actual source bytes.
- No author discussion, current peer results, MEMORY or private history was inspected. No unexpected author/peer-history exposure was observed. The received context contained the source packet and project/platform instructions. Requested/accepted launch parameters and provider context internals are not independently observable here; the orchestrator must preserve its actual launch receipt. This report does not attest provider internals.
- Inspected the named publisher/event/profile/materials owners, related tests and existing registry routes, native acceptance allocation, current article declarations and relevant guide/acceptance sources. No nested AGENTS.md exists in the repository inventory. Tests were read proportionally, not all cases exhaustively reviewed; no test or application was executed. No implementation, test, external-service or deployment writes were performed.
- The source manifest below records full-file bytes for files whose relevant portions were inspected; hashing is identity evidence, not a claim of full-file comprehension. Its digest is a reviewer-side source binding, not a replacement for the orchestrator's original launch/packet receipt.

## Findings and required treatments

| ID | Severity | Source / evidence | Requirement implication and treatment |
| --- | --- | --- | --- |
| RA-PF01 | Medium; resolve in this iteration | Supplied dated intent permits a planned URL now. `.github/acceptance/issue-169.json:122`, issue snapshot AC09 and `review/issue-169/native-check-allocation.md` still describe final verified URLs before launch/copy delivery. The supplied issue snapshot does not contain this new distribution amendment. | Append the authorized dated amendment to the same owner and align COPY/native allocation before relying on new checks. Preserve AC IDs and final live-verification obligation; distinguish “prepared with planned backlink” from “final URLs verified.” Do not rewrite historical facts or ask again for an already supplied choice. |
| RA-PF02 | Medium; invariant must remain explicit | `tools/publishing/article.cjs:498–518` admits canonical only with a matching site event; `events.cjs` and `site-event.cjs` bind actual inspection, production policy, source/tree, edition, inventory and document bytes. `guides/ARTICLE-WORKFLOW.md` publication sequence and `guides/ARTICLE-MATERIALS.md` backlinks describe observed canonical, while the new intent adds a planned destination. | Describe/validate the planned destination separately. It must not populate observed canonical/date/event state, replace served-byte evidence, or cause release admission. Keep observed-only campaign backlink semantics unless a separate explicit planned-link use is introduced. Changing existing null-before-publication behavior globally would weaken an unrelated guarantee. |
| RA-PF03 | Medium; future external gate | Intent requires author-manual platform posting after accepted website proof and both reciprocal URLs together. Existing public-material external targets require actual URL, UTC observation, pinned observation evidence, matching channel and source-bound review. | Record website proof → author native-editor/posting → verify both actual platform destinations → one article-specific material update. Require an observation of accessible correct article content and the website backlink; a URL-shaped string or successful host check is not publication/equivalence proof. No platform order preference. Keep website release independent of this later pair. Do not impose a new global “every material update must have both platforms” rule on unrelated articles. |
| RA-PF04 | Low; acceptance completeness | `tools/publishing/kit.cjs:225–270` currently emits platform formats from manuscript; launch source retains `{{SITE_ARTICLE_URL}}` / `{{SITE_PDF_URL}}`. Profile authored character bounds currently count selected compiled article text (`profile.cjs:79–100`). | Verify the actual exported HTML, MD, TXT and copy-ready content for both platforms, plus launch MD/TXT, contains the intended ordinary link and no unresolved URL placeholders. Any added distribution furniture must be counted by the relevant authored platform bound. Keep manuscript/print outputs, source evidence and accepted PDF unchanged; do not infer parity from merely finding the URL in a profile. |

No unresolved requirement ambiguity blocks implementation after the documented RA-PF01 alignment. RA-PF02–04 are invariants/check-design obligations for the candidate, not findings of a changed implementation: none exists yet. Release, platform observation and whole-issue completion remain pending.

## Intent → acceptance → independent oracle and route

| Obligation / AC | Check or owner gate | Observed preflight result / eventual evidence |
| --- | --- | --- |
| Stable planned website backlink; AC04/09 | Independently expected `https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html`, derived from production policy + the existing catalog alias; compare actual generated platform/launch bytes to that literal expectation. Verify ordinary visible link in copy-ready documents. | Source identity established: `site/publications/policy.json` production origin and `site/content/catalog.json` publication-30 alias agree. Not a live availability observation. Generation/interaction pending. |
| Planned URL never establishes publication; AC04/05/09/11 | Existing canonical/date/event negative tests and candidate state assertions: before site proof canonical/published/modified remain null and no site event is created; forged/wrong edition/tree/document/preview proof remains rejected. | Current source already has the exact-source event gates and corresponding publisher/history negatives. No execution claimed. Retain these guards while adding planned-link behavior. |
| Consistent complete distribution copies; AC04/09 | Existing `tests/publishing.test.cjs` / `publishing-profile.test.cjs`: independent URL expectation across eight platform files and launch outputs; meaningful character/unsafe-origin/alias/missing-selection negatives as applicable. Source/reference/figure equivalence remains separately inspected. | Existing permanent content/source routes cover `tools/publishing/**` and article/profile inputs. Extend these existing owners proportionally; no separate pipeline/test family is necessary. Actual candidate checks pending. |
| Preserve accepted R10 content/PDF/figures; AC07/08/09 | Compare actual before/after bytes and substantive edition identity; ensure link-only distribution/material changes do not create a new manuscript semantic revision or regenerate the accepted PDF. | Baseline manuscript SHA256 `70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f`; accepted reading-r10.pdf `36269db33a71781084053ae40cc41e411a0106bea5e593ef0b08414014c4ca40`. Current five declared asset hashes are listed below. No bytes changed by this reviewer. |
| Stable PDF navigation; AC09 | If launch uses the optional stable materials route, require exact article URL + `#article-materials`, and check actual generated article has the existing block and selected PDF target. Keep final live article/PDF verification as delivery evidence. | Current materials declaration selects the R10 PDF; existing template/module uses the `article-materials` anchor. No new direct PDF route is required. Live destination check pending. |
| Website first; author-manual platform actions; AC04/09/11 | Existing release-controller/live-site evidence plus dated operator/editor observation. CI can validate source contracts and gate artifacts; it cannot establish unobserved human posting/native equivalence. | No site proof, posting or platform URL was supplied as observed evidence. Keep these gates open and state manual actions clearly. |
| Both observed reciprocal links in one later content update; AC10 plus AC04/09 | Existing materials source validation and `tests/article-materials.test.cjs`, actual channel/observation/review pins; inspect one source update containing both new targets. Reader desktop/mobile/no-JS checks verify visible links and PDF retention through existing profile. | Current materials allowlist contains only the reviewed R10 PDF. Pair addition is intentionally absent until actual platform evidence exists; no guessed targets are admissible. |
| Agent/CI integration and architecture; AC05/11 style subcondition | Update canonical article/material guides and native check allocation; select existing registered publisher/profile/material/history suites through current source runner. Basic, style guard, formatting/lint/RI and exact-source CI remain existing routes; four completed distinct reviews required on changed candidate. | Existing registry routes are present for PR-targeted/staging/production. No new release controller, deployment workflow, browser matrix, timeout/budget relaxation or runtime ownership is warranted by this change. |
| Unchanged original article requirements; AC01/02/03/06/07/08 | Preserve original source/rights/editorial/history decisions and their separate check/owner gates. | This narrow preflight neither repeats those substantive acceptances nor marks whole criteria complete. |

### Exact unchanged visual baseline

- `hero-web.png`: `3fb21ca8f7aae0ebe85f9da0cc5aaf5e124deb916d9fc625d3a46e4dfd33293f`
- `delivery-capacity-r6.png`: `327adbaf3721383619fd5b67de49a5792cf0470d298c4d43080570f9a79ad5d5`
- `review-learning-r7.png`: `372ca25f635dbcc8440381a4e35027806f6b61168e9a27c1723f688741bf1c43`
- `comprehension-gap-r7.png`: `338acabde7cd23ce93534c23a0bce2e71978a69c246feade8d779850af8c61b1`
- `asymmetry-r9.png`: `65741f7bf96495d834a4163e4122b2c03d0b5e0e966048679bf144d4925a7249`

## Next gate and limits

Implement within current owners after the dated contract alignment, then provide a source-bound candidate/diff and actual bounded check evidence for final Requirements review. Fresh code/white-box/exploratory roles remain separate. Reuse unchanged content/PDF/visual evidence only for verified identical inputs. No pass is claimed for browser interaction (the supplied packet explicitly reports a prior browser-launch block), native platform editors, future platform URLs, release or live article/PDF verification.

The source references and tests provide proportionate independent oracles: expected origin/alias from canonical source owners, preserved baseline bytes from this preflight, state separation from existing event invariants, and actual reader/operator observations where automation cannot establish the claimed result. Keyword-only workflow checks or a green registry entry cannot prove either publication sequence execution or independent review.

## Inspected-source identity manifest

Manifest SHA256: `af34b42a39d5440f76bc7463ce7e57e779c5166dfdc90c3d635c9767428abd06`.

```json
[
  {
    "path": ".github/ACCEPTANCE.md",
    "sha256": "6469a66a36171404ce8448d75c3c5d96dc43563c76af41d4d2367598836fcaa8"
  },
  {
    "path": ".github/acceptance/issue-169.json",
    "sha256": "2e09c9c49191c1d7ec9118acd453c14ca0a45fc7bab14f278560494ff7107b70"
  },
  {
    "path": "/workspace/scratch/f4dcb060a703/distribution-intent.md",
    "sha256": "0f8b0146e26d51748ac171408be03a13e86628c01185a10005844acd659256b8"
  },
  {
    "path": "/workspace/scratch/f4dcb060a703/distribution-issue.md",
    "sha256": "b8844112ad357ef14e5720259755bb81ba0362e73d6b2f5fa0073fe0b5d8044e"
  },
  {
    "path": "AGENTS.md",
    "sha256": "ad4f179ec04c7af12867229d70598a660c5ae41f3cb456cafd02aca3d12a9988"
  },
  {
    "path": "CONTRIBUTING.md",
    "sha256": "804fb3da9a0bc7369bbd902313224221becc6c6b775536ca943f8664bf741442"
  },
  {
    "path": "README.md",
    "sha256": "6cfbf71fad0822cbd4d756afb76b2fd29cdd7b203541b098bfba040e2c24231e"
  },
  {
    "path": "REPOSITORY-MAP.md",
    "sha256": "233551825a2c51695edeca06b78bfe59dd55df576047b2d905c33e752fa1e9d6"
  },
  {
    "path": "agents/reviewers/README.md",
    "sha256": "2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb"
  },
  {
    "path": "agents/reviewers/requirements-acceptance.md",
    "sha256": "010e22ec72bb081a1041068f3128d4d2496f5dabe560e01ed83f02e3b442b7a6"
  },
  {
    "path": "guides/ARTICLE-MATERIALS.md",
    "sha256": "db49221305ab7c9a6ec7369a81953f6249f2c35dbd9792e3656bc6453e58e294"
  },
  {
    "path": "guides/ARTICLE-WORKFLOW.md",
    "sha256": "83272df023a2ce9ef12a77a8252e684abaf822653102b65c8b9a8e01c26af295"
  },
  {
    "path": "guides/CODE-STYLE.md",
    "sha256": "cdef877504055734d653af12237fc708f3e3636dd15dfc0703f71e0f6c87ee40"
  },
  {
    "path": "review/issue-169/native-check-allocation.md",
    "sha256": "14074845f7c8b8efb6902c203fd04fbbdde9f6d9d23a46d19f803273cef156d4"
  },
  {
    "path": "site/README.md",
    "sha256": "6696e8f54d09d314ad1b0dda5249dffbcd1a1a6e80c62316ec5d2dabe7e50436"
  },
  {
    "path": "site/content/catalog.json",
    "sha256": "ca5ad58534246c0ec225019d4b8a331261a9b5b857561c81aa28496875cb8e2e"
  },
  {
    "path": "site/publications/policy.json",
    "sha256": "d0337abd15e0a034472e5099a4e6362ae4c4d393ac0779a189d3214b01f4d223"
  },
  {
    "path": "site/publications/sdlc-out-of-balance/launch-post.en.md",
    "sha256": "d9ac5bab3e3dd827e5f01d10e66055c55200e5a57f61c7dfa092d8907e201ef4"
  },
  {
    "path": "site/publications/sdlc-out-of-balance/manuscript.en.md",
    "sha256": "70386a2d2f602b5f60c93d35293a375e4e4abbc6f63a0dd888024031078b3d1f"
  },
  {
    "path": "site/publications/sdlc-out-of-balance/materials.json",
    "sha256": "95a3f84961e24762b7646560cc78a921770bb6fd488f8224c5f37a4fd23c344b"
  },
  {
    "path": "site/publications/sdlc-out-of-balance/profile.json",
    "sha256": "6fbbd9cccabfa690e8bfed56952c02bbfbe66dda6f9d63986bcc192c61ab9d3d"
  },
  {
    "path": "site/publications/sdlc-out-of-balance/publication.json",
    "sha256": "850664d62796a9a7023fb5b4115a3a70e590ddb215faa4e06fe552b194f21f4a"
  },
  {
    "path": "tests/article-materials.test.cjs",
    "sha256": "86bf4960e05f0826793388747dcbd56fbe4c943b557b9cd6df388a5913538cbd"
  },
  {
    "path": "tests/publishing-history.test.cjs",
    "sha256": "d0297f2a58d7b68dcc260dd6bba0182c4a6290641e305a8facee445e5c251ae4"
  },
  {
    "path": "tests/publishing-profile.test.cjs",
    "sha256": "ae31306d2cbea3ea91a30caaef01c20333a1d5d1a7ea164020b17e16f1b6850f"
  },
  {
    "path": "tests/publishing.test.cjs",
    "sha256": "c8cf74de2c51dfa423e1d6a07f31dc94e744fccb6096da2d9f9acdcb172fa252"
  },
  {
    "path": "tools/publishing/article.cjs",
    "sha256": "54459f1f49b3405bc5fdf9f5a3e627d026ad3bbe7822026dc1ca4602a69eb7cb"
  },
  {
    "path": "tools/publishing/events.cjs",
    "sha256": "145a9391dae7ae6fc5a88469de2029663ff046eebe1a11458040d867cbdb939c"
  },
  {
    "path": "tools/publishing/kit.cjs",
    "sha256": "370344064b930fb0c6c801005a4152bd9f135f86ecfff1e5406490a7a80f97ec"
  },
  {
    "path": "tools/publishing/profile.cjs",
    "sha256": "bf25017a99e51a263355aeb15634647757ea12ebd76587e467c5979a3df3ee27"
  },
  {
    "path": "tools/publishing/site-event.cjs",
    "sha256": "da9981654fe438be47f1ca2bd29cd911bdb0e68d9a8da4161ce94ee2ae9bc2ff"
  },
  {
    "path": "tools/quality/test-profiles.json",
    "sha256": "7ead8d93deb31e33537764806cb467227f98776e7822950c91ae81d2039d8a62"
  },
  {
    "path": "tools/site/article-materials.cjs",
    "sha256": "e599db3bb3a82a8d38741a301ee7513f4f0d4d433cb102df3abbe1a99a9f9cdd"
  }
]
```

## Post-first-judgment design clarification

Chronology: the first independent report above was written before receiving the orchestrator's proposed implementation design. The following bounded clarification considers that design; it does not replace or retroactively relabel the first judgment. No peer verdict was provided.

The proposed optional profile distribution declaration, planned URL derived from the existing production origin plus validated article slug, and existing-kit furniture are compatible with the authorized scope. Current metadata slug `the-sdlc-is-out-of-balance` and the catalog alias agree. No separate destination registry is needed. Keep unselected historical profiles byte/behavior compatible. The proposed manifest distinction between planned destinations and observed publication is useful and must remain factual.

The proposed opted-in site-first event and all-or-none selected public reciprocal-link guards are acceptable with these essential boundaries:

1. Apply them only to opted-in distribution profiles and selected reviewed public LinkedIn/Medium materials. A PDF-only initial article, missing platform materials, and private/pending platform records must remain admissible. One platform may be published/observed first; require the pair only when selecting reciprocal materials for the public reader. Reject duplicates or a mismatched channel rather than allowing two same-channel records to satisfy “both.”
2. Site-first evidence must bind the correct base content edition and production observation, with actual chronology consistent with website verification preceding platform publication. Existence of an unrelated site event is insufficient. Preserve adaptation relationships when resolving a platform event's base edition; do not accidentally require an adaptation edition to equal its full-article edition.
3. The selected material URL must agree with the observed platform publication evidence for that channel/edition. Existing local pin and host validation alone does not prove this relationship. Keep actual native-editor equivalence and live accessible article/backlink observations as explicit external gates; synthetic CI tests cannot supply them.
4. Derive the stable route using the existing publisher/site route convention and check against the independent catalog alias oracle; no hard-coded R10 branch or consumer import cycle. Any materials-anchor link must point to the actual admitted materials/PDF block. Include added distribution furniture in authored output character bounds.
5. Preserve canonical/events/date, append-only history, exact served-byte/inventory, manual-posting and release decisions unchanged. The new planned URL may be visible before publication without producing any of these observations.

These clarifications require no additional author decision and do not expand the release scope. The final review must inspect the implemented opt-in and rejection behavior on the actual candidate.
