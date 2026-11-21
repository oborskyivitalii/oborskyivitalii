# Independent Code correction review — F01

Verdict: **PASS for the bounded native-reading-link correction; no blocking code findings.** F01 is resolved in the inspected generated candidate and covered by executable integration tests. Hosted correction verification and issue-wide acceptance remain separate, pending observations.

## Identity and boundaries

- Reviewer task: `/root/issue213_native_link_code`, fresh nonauthor Code correction execution, 21 November 2026. No implementation, recursive delegation or external writes performed. No current peer-result contents, archived judgment contents, agent lists or parent scratch notes read. A directory listing exposed filenames only, not verdicts.
- Actual local checkout verified clean at `a10ae283ac87e7cab48457f0597cbdcf5e2fd46a`, tree `30a95aacce77c4f3bef6676ff551968ad852256a`. Compared against `c0ef2a9c8e3a500cad48254c1cac625178c5ffcf`; local origin task ref still at that base. No fresh GitHub network state was independently observed in this bounded review.
- Packet SHA-256: `2eedbf948b45c89dc90a6d619a651f808f1a085d88f7ff8326dc896b4037af4d`. Actual diff SHA-256: `14dc3e9e45248dc38ad90f32b442cd6f68cb8e2c6f4a77cc06cce8c1bcf9da83`. Independently hashed every packet-referenced file: zero mismatches. Hashing archived review subjects did not entail reading their contents.
- Common prompt SHA-256: `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`; Code prompt: `26b3fba125bf65126455bcd1aa7d2500d4f1766f2865bae5041378893a970697`.
- Read root AGENTS (the only applicable AGENTS), README, repository map, bounded MEMORY handoff, relevant CONTRIBUTING iteration protocol, reviewer contracts, CODE-STYLE, acceptance contract, site publication/native-reader contract, supplied original request/issue and factual F01 observation. Original owner remains #213, especially AC03 provenance, AC04 internal-link integrity/style and AC05 verified delivery.
- Runner launch/context internals and provider isolation are not independently attestable from this execution; orchestrator must bind its actual launch receipt. This result does not independently certify provider context internals.

## Substantive source review

Inspected the complete actual changed code/test diff in `tools/publishing/profile.cjs`, `tools/site/articles.cjs`, `tools/site/build.cjs`, all four fixture consumers, and the maintained test-profile selection delta; read their affected existing integration paths. Reviewed generated changes to the three affected live article aliases and their identity/snapshot relationships. Remaining generated inventory/RI metadata received identity and preservation checks rather than line-by-line semantic review. Historical judgment artifacts are excluded from the substantive review scope.

1. `tools/publishing/profile.cjs:80`: extracted `productionOrigin` retains the previous strict policy object/schema, exact HTTPS origin, credentials/port/IP and non-public/preview-host refusal logic. Distribution still independently validates bounded slug and observed canonical, and constructs the same original distribution article URL. No new origin registry or source-writing path is introduced.
2. `tools/site/articles.cjs:118`: the canonical production URL for each admitted `local-article` is registered alongside its existing edition aliases. Both paths share the same ambiguity-refusal map; collisions become `null` and remain refused on subsequent additions. External-only catalog entries cannot gain native targets. Canonical aliases derive from the existing selected native route, rather than manuscript guesswork or domain substring matching.
3. Existing `input` and reader hooks continue to preserve self-links, title/source credits, resource references, source sections and unmatched URLs. New canonical aliases flow through the same established `data-reading-article` mechanism and relative-URL generation; query and fragment variants do not match exact registered canonical keys. No AST, manuscript, distribution renderer or PDF edit is present in the correction.
4. `tools/site/build.cjs:440`: policy is required only when selected articles coexist with admitted native articles. Policy becomes an explicit per-article dependency before input hashing, participates in warm cache identity, and is reread by the existing end-of-generation `verifyArticleInputs`. Missing/invalid policy fails before new output commits; a policy change cannot silently reuse a previous reader identity. Unrelated routes without selected native relationships do not acquire this policy requirement.
5. Dependency direction remains build orchestration → publishing profile validation. No runtime → build import or generated-output source authority was introduced. The profile already has a function-scoped compiler back-reference; this correction adds no eager invocation of it. `productionOrigin` itself reads/validates policy and does not compile or trigger that callback. Existing module initialization and deferred call boundary remain intact.
6. Tests use real copied policy in the four fixtures that intentionally delete publication owners. The maintained suite tests generated alias and immutable snapshot URLs, warm versus cold policy changes, refusal of preview origin, retained prior output on failure, exact external/query/fragment preservation, native-target removal, and canonical/platform ambiguity. These assertions exercise behavior and original invariant rather than implementation spelling. Registry dependencies include the shared profile owner and the relevant source/policy inputs.

Applicable style review: CS01 ownership/dependency direction, CS02 structured routes and preserved semantics, CS04 single policy owner, CS05 focused readable CJS changes, CS07 explicit bounded cache invalidation, CS08 proportional behavioral checks, CS09 guard limits and CS10 source-bound review. No new static CSS, runtime state/lifecycle or animation change implicates new CS03/CS06 behavior. No expanded debt allowance found.

## Independent checks and evidence

Executed directly on this candidate:

- `node --test --test-name-pattern='author reading links follow|native reading canonical|site-first profile counts' tests/site-articles.test.cjs tests/publishing-profile.test.cjs`: **3 tests passed, 0 failed**, exit 0. Includes public-origin negative cases and canonical reader warm/cold integration.
- `python3 tools/check_code_style.py`: **pass**, 184 scanned files, 0 legacy occurrences; interpreted only as the documented bounded automatic subset.
- SHA-256 compared every declared packet input: **0 mismatches**.
- Compared all manifest-listed retained files against generated docs: **83/83 exact**.
- Compared prior production immutable paths from supplied base public manifest: **120/120 exact**.
- Independently compared `styles.css`, `theme.js`, `space.js`, `archive.js`, `navigation.js` against supplied base manifest: **all five unchanged**. Inspected derivation record for the unchanged base/plain/staging/production Color identities; this is identity reuse evidence, not a new device/performance observation.
- `git diff --name-only c0ef2a9 a10ae283 -- site/publications site/assets/publications site/retained`: empty; authored native sources, public-material assets, PDF and retained source owners unchanged by this correction.
- Actual generated alias diff changes the three contextual hrefs from production absolute URLs to `../articles/...`; immutable snapshots use the corresponding depth-relative URLs. Canonical metadata retains production meaning.

Read raw supplied focused TAP (not a peer judgment): **141/141 pass, no failed/cancelled/skipped tests**; supplied corrected probe TAP is **3/3 pass**. Their counts supplement, and do not replace, the independently executed three behavioral checks. The earlier failed 2/3 probe is preserved; this result does not claim the failed attempt passed. No duplicate full CI or owning acceptance campaign was started.

## Findings and limits

**No new blocking or nonblocking code defect found in the inspected correction.** Examined failure mechanisms include ambiguous alias resolution, lookalike origins, policy drift/stale cache, fail-open preview policy, mutation during generation, source/title/self-link rewriting, deferred module initialization and historical immutable replacement.

F01 can be marked code-corrected at the stated source identity. Final hosted candidate click/Back behavior has not been independently observed in this review. Mobile and no-JavaScript browser controls, and ordinary hosted PDF access returning HTTP 403, remain explicit unresolved evidence limits from the factual packet; this code review does not turn them into passes. The owning acceptance run was stated to be running and was not independently read as a completed result. This pass supplies neither whole-AC completion, editorial/rights approval, production activation, merge permission nor SEO outcome evidence. Exact Google visibility, indexing and delayed measurement remain outside this code correction.
