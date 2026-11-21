# Independent White-box QA — F01 correction

Verdict: **PASS for the bounded source correction; hosted correction remains unverified.** No new source defect found. F01's protected invariant is that accepted native contextual reading links use the selected candidate's origin, while manuscript/distribution/credit URLs preserve their source meaning. Generated source now satisfies the three reported relationships. This does not close issue213 AC04/AC05 or waive external gates.

## Identity and inputs

Fresh nonauthor role `/root/issue213_native_link_whitebox`, correction execution on 21 November 2026. Repository inspected clean at `a10ae283ac87e7cab48457f0597cbdcf5e2fd46a`, tree `30a95aacce77c4f3bef6676ff551968ad852256a`; correction base `c0ef2a9c8e3a500cad48254c1cac625178c5ffcf`. Actual launch/provider isolation assurance is the orchestrator's receipt obligation; provider internals are unknown to this reviewer. No peer result was read, no delegation, implementation or external write occurred.

Read root AGENTS, README, REPOSITORY-MAP, dated MEMORY, applicable source/profile contracts, common reviewer contract and White-box role, supplied original request/issue and the factual F01 observation. MEMORY was treated as handoff, not present acceptance. No nested AGENTS is listed in the map or applicable discovered instruction inventory.

Packet `/tmp/issue213-review/native-link-a10-packet.json` SHA256 `2eedbf948b45c89dc90a6d619a651f808f1a085d88f7ff8326dc896b4037af4d`. Independently recomputed hashes match packet for all three changed source owners, the changed site-articles test, common prompt and role prompt. Common SHA256 `725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8`; role SHA256 `832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f`. Read actual Git diff and supplied diff. Sources: `tools/publishing/profile.cjs`, `tools/site/articles.cjs`, `tools/site/build.cjs`, affected tests and generated HTML/revision. No original peer verdict was consumed.

## Risk → structure → executed oracle

| Risk / AC | Structural fault and scenario | Independent expected oracle | Actual execution |
| --- | --- | --- | --- |
| F01 / AC04 | canonical URL bypasses native alias map | Exact production-origin canonical of admitted local record becomes relative reading URL in alias and snapshot | Both forms pass; real three hrefs separately inspected |
| Provenance / AC03 | rewriting leaks into title sources or reference credits | Credit and title source hrefs stay original | Passed exact URL assertions, including canonical native-source credit |
| Admission / AC02/04 | unknown target, lookalike host, query or fragment incorrectly admitted | Four partitions remain absolute original links | Passed all four partitions in actual generated snapshot |
| Ambiguity / AC04 | map overwrites collision with either target | Collision value is null, independent valid target retained | Passed direct collision and exact-match test |
| Catalog removal / AC04 | warm output reuses removed native admission | New version; publisher and canonical reading links revert to source URLs | Passed actual rebuilt snapshot assertions |
| Policy state / AC04 | origin data absent from cache identity | Warm rebuild changes version; cold/warm versions and bytes agree | Passed actual origin-change transition and byte equality |
| Refusal / AC04 | unsafe origin silently falls back | Invalid policy throws and previous valid output remains | Passed preview.pages.dev refusal and preserved previous bytes |
| Unrelated build / AC04 | policy becomes unconditional requirement | Build without selected native admission succeeds with policy absent | Passed no-policy preview before target acceptance |
| Publisher / AC03/04 | extracted loader weakens existing safety | Unsafe policy origins, labels, missing/forged launch destinations, canonical mismatch refuse | Passed existing site-first profile case, including nine invalid origins |
| Runtime boundary / AC04/05 | correction adds public/runtime family or alters frozen publication inputs | Five routes and runtime identities preserved; frozen source/PDF unchanged | Independent Git/hash/revision comparisons pass |

`productionOrigin` retains the original protocol/exact-origin/credentials/port/IP/public-domain rejection predicate. Slug bound and canonical equality remain in distribution selection (`profile.cjs:80–113`); extraction does not introduce a permissive fallback. `articles.cjs:118–152` adds only admitted local canonical aliases and retains collision null semantics. `build.cjs:440–453` conditionally adds the strict policy input to each selected article digest; `verifyArticleInputs:685–694` re-reads shared inputs after generation. This final reread was source-inspected, not independently fault-injected during this bounded execution.

The four fixture changes restore their deliberately reset policy from the real policy owner; they do not alter runtime fallback. Full fixture campaign was allocated elsewhere; this reviewer did not duplicate it.

## Own execution and raw accounting

Executed against this candidate:

```text
node --test --test-name-pattern='author reading links|native reading canonical|site-first profile counts' tests/site-articles.test.cjs tests/publishing-profile.test.cjs
```

Raw returned output:

```text
✔ site-first profile counts link furniture and rejects unsafe origins, labels and missing launch links (1678.900104ms)
✔ author reading links follow a native alias while publisher links retain their meaning (2903.151027ms)
✔ native reading canonical aliases retain ambiguity refusal and exact matching (0.404337ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3717.047094
```

Process exit 0; no signal. This is **three executed selected test cases**, with multiple assertion partitions listed above, not a whole-suite or measured branch-coverage claim. Each result comes from my own execution; supplied prior 141/141 and 2/3→3/3 logs are not substituted for it. Existing site-articles and publishing-profile suites belong to maintained source profiles; issue213 DISCOVERY/PUBLISHING allocation and the separately running owning acceptance remain the parent-controlled integration checks.

Own generated HTML inspections found exactly the relevant contextual links:

| Actual alias | Observed href |
| --- | --- |
| `docs/articles/ai-verification-crisis.html` | `../articles/the-sdlc-is-out-of-balance.html` |
| `docs/articles/ai-cost-cutting-fallacy.html` | `../articles/the-sdlc-is-out-of-balance.html` |
| `docs/articles/the-sdlc-is-out-of-balance.html` | `../articles/ai-cost-cutting-fallacy.html` |

These relative hrefs retain whichever candidate origin serves the alias. The regression also proves the snapshot-relative `../../articles/reader-profile.html` form and the alias-relative form, without leftover `data-reading-article` markup.

Own read-only Python/Git comparisons returned:

```text
old content addressed paths 120 unchanged 120 mismatch []
retained exact 83 / 83 mismatches []
FROZEN source/assets changed []
RUNTIME changed []
revision identities [('contract', True), ('navigation', True), ('variant', True), ('engine', True), ('scenes', True), ('assets', True), ('mediaFiles', True)]
route IDs ['index', 'research', 'writing', 'talks', 'credits']
new public directory families []
```

Old public oracle was the supplied `base-public-manifest.json`: all 120 hash-directory public resources independently SHA256-compared. Every one of 83 hash-directory files under `site/retained` was also byte-compared to public output. Frozen source/assets (including PDFs) have no Git changes against the correction base. Comparison of all correction-base current snapshots initially showed 13 replaced candidate-generated snapshots; those are current generated snapshots, not the historical 120-resource retention oracle. I did not misreport those replacements as historical-byte preservation.

## Findings and limits

No new finding within the bounded correction. F01 is corrected at generated-source level, with meaningful positive and refusal assertions. Final repository status remained clean during checks.

No hosted corrected URL was supplied or observed. Candidate navigation clicks, mobile/no-JavaScript behavior, and the hosted PDF remain unverified here; earlier documented mobile/no-JS capability limits and ordinary hosted-PDF HTTP403 are not passing results. No hosted browser, full owning campaign, complete style guard, concurrent policy mutation injection, exhaustive origin/slug partitions, visual PDF reinspection, or formal coverage measurement was executed by this reviewer. Full owning acceptance was already running and intentionally not duplicated. Existing source/profile tests cover only their stated scope; publication, Google canonical/indexing and measurement acceptance remain separate. Accept this report only while the inspected relevant source identities remain unchanged.
