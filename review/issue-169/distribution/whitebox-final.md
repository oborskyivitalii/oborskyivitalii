# White-box QA — v4 final affected re-review

2026-11-06. Reviewer /root/distribution_whitebox, distinct nonauthor, correction continuation. **Verdict: WB01 and WB02 resolved on v4; no further blocking white-box findings in the inspected distribution scope.**

## Candidate and chronology

Prepared dirty candidate, not a clean checkout. Base 7c292bd50a4f9a0024c397a290c1de965ceada4f. Packet review/issue-169/distribution/candidate-v4.json SHA256 **2753dd31967d68ca2f383223eb7cb51e08676c30d1b7fc10d30705fc43be7ec2**. Independently verified 41/41 declared file hashes/deletions. Current kit: dist/publications/sdlc-out-of-balance/6b1039925ee49a8349d46ddd8539aa1ad0b6314d896f3132e58bcc98c8f6a75a.

First and v3 reports remain preserved:
- /workspace/scratch/f4dcb060a703/distribution-whitebox-first.md — SHA256 5e5e02a9fcad3796f3e7b3ef53a11b7bc3af70ee7f6bf10fe7d80a567b9694fd.
- /workspace/scratch/f4dcb060a703/distribution-whitebox-final.md — SHA256 53ad87387ebe44e7981e715f56b520f3763e840f085a61761b49df59ec06839e.

Intent/issue/common-prompt/role-prompt identities and operational isolation limits are unchanged from the first report. This is an affected correction re-review in the same execution, not a fresh first judgment. Parent supplied delta descriptions and execution claims; no peer reports were read. No accepted source/tests/external writes or delegation; only this assigned report written.

## Resolved findings and independent oracle

**WB01 resolved.** Actual validateLaunchDestinations resolves both tokens, invokes the sole admitted compiler and compares full AST link destinations for equality. It no longer accepts a substring or token occurring in another destination, prose label, code span, code fence or unused reference definition. The independent oracle remains two actual original-article/materials links; it is not inferred from the new implementation.

Executed 13 launch scenarios against the actual profile module with virtual source reads: four valid controls (tokens, Markdown links, bare URLs and used reference links) accept; nine negatives reject (materials-only, simple redirect, nested redirect, token redirect, fenced token, inline-code token, unused reference definition, URL only in label and changed article fragment). All matched expectations. Inspected permanent tests retain valid token/exact-Markdown controls and add the nested/token-redirect/fenced-token negatives. These tests were authored by the implementer, not this reviewer.

**WB02 remains resolved.** Four actual profile scenarios for .internal/.local/.test/single-label origins reject. Policy and production destination remain correct.

## Other protected invariants and evidence reuse

| Risk / AC | Independent expected behavior | Actual v4 check or reused evidence |
| --- | --- | --- |
| Canonical/date separation, AC04/09 | Preparation never establishes publication | Actual article canonical/published null, zero events; site-first state planned |
| Eight platform formats and launch, AC04/09 | Both ordinary article and materials destinations exist; no unresolved tokens/duplicate autolinks | All eight current kit outputs contain both URLs; actual launch TXT clean |
| Initial website, AC04/10 | Zero external platform records do not block publication preparation | Actual initial article/material compilation succeeds, one PDF asset, no events |
| Character limit, AC04/09 | Selected platform text plus footer obey exact authored bound | Unchanged profile limit function; first review's actual 19540/19539 boundary evidence reused |
| Site-before-platform, AC04/09 | Matching base edition and prior site inspection; safe channel host | Event source byte-identical to v3/first packet; six guard scenarios from first review reused |
| Paired reciprocal materials, AC04/10 | Zero or reviewed complete pair, exact edition/URL and ordered observations | Pair source byte-identical to v3; v3 actual zero/full acceptance and half/stale/URL/time rejections reused |
| Launch TXT helper, AC04/09 | Token/bare/Markdown sources retain correct destinations without duplicate autolinks | Kit source byte-identical to v3; three actual helper cases reused |
| Archive/history/scientific preservation, AC05/07/08/09 | No manuscript/PDF/semantic/asset revision from links; archives retain original bytes | Underlying scope unchanged; unchanged archive-manifest identities and exact baseline decompression proof reused |
| Selection, AC05/11 | Permanent cases retain existing workflow/profile owner | Registry, selector tests and suite routes unchanged; no new workflow or budget |

Independent comparison of v3/v4 packet identities confirmed unchanged event, kit, pair code, article-material tests, publishing tests, registry, archive manifest and article profile. Changed profile source and its test were inspected directly. Generated document/lock identities were rechecked through v4 packet.

## Deferred compiler dependency

The function-scoped require of article.cjs occurs only inside exported loadProfile's validation, with no new top-level dependency. Inspected article's compile path and profile export/invocation path. In a **fresh Node process**, required profile first, confirmed article.cjs absent from require.cache, then called profile.loadProfile with an in-memory serialized actual article; it completed planned and the subsequently loaded compiler export was a function. Separately actual article-first load succeeded. This supplies bounded runtime initialization evidence; broader architecture/style judgment remains Code review's role.

## Actual execution

Write-free Node heredocs, exit 0. Actual profile checks used its unmodified module in a VM with overrides only for virtual launch bytes, matching SHA256 and policy; real article/compiler and other reads remained actual. No full campaign duplicated, no disk fixtures, no measured branch/line coverage.

Primary stdout:

~~~text
PACKET 41 41 2753dd31967d68ca2f383223eb7cb51e08676c30d1b7fc10d30705fc43be7ec2
valid-tokens ACCEPT PASS 
valid-exact-md ACCEPT PASS 
valid-bare ACCEPT PASS 
valid-reference ACCEPT PASS 
materials-only REJECT PASS Site-first launch must include article and materials destinations
simple-redirect REJECT PASS Site-first launch must include article and materials destinations
nested-redirect REJECT PASS Site-first launch must include article and materials destinations
token-redirect REJECT PASS Site-first launch must include article and materials destinations
fenced-token REJECT PASS Site-first launch must include article and materials destinations
inline-code-token REJECT PASS Site-first launch must include article and materials destinations
unused-definition REJECT PASS Site-first launch must include article and materials destinations
label-only REJECT PASS Site-first launch must include article and materials destinations
fragment-changed REJECT PASS Site-first launch must include article and materials destinations
https://publisher.internal REJECT PASS Distribution requires the public production origin and bounded article slug
https://publisher.local REJECT PASS Distribution requires the public production origin and bounded article slug
https://publisher.test REJECT PASS Distribution requires the public production origin and bounded article slug
https://publisher REJECT PASS Distribution requires the public production origin and bounded article slug
actual-kit 8 of 8; clean launch true
actual-pending null null 0 initial-materials-assets 1
profile-first exports function function
profile-first article load planned

~~~

Fresh-process/reuse stdout:

~~~text
article-before-profile-call false
first-call planned
compiler-after-first-call function
reuse tools/publishing/events.cjs true
reuse tools/publishing/kit.cjs true
reuse tools/site/article-materials.cjs true
reuse tests/article-materials.test.cjs true
reuse tests/publishing.test.cjs true
reuse tools/quality/test-profiles.json true
reuse review/issue-169/distribution/archive-manifest.json true
reuse site/publications/sdlc-out-of-balance/profile.json true

~~~

Parent reported source 54/54, lint exit 0 without warnings, Basic 17+10 and architecture pass. New raw log paths were not supplied here, so those remain parent-owned execution claims, not independently certified raw results in this report. Earlier failed logs/results remain preserved in prior reports.

## CI allocation and limits

All useful launch/origin regressions belong to existing tests/publishing-profile.test.cjs; platform/TXT behavior to publishing.test.cjs; pair cases to article-materials.test.cjs; event/history refusal cases to existing publishing/history suites. Permanent routes remain pr-targeted/staging/production in tools/quality/test-profiles.json. PR source checks: site-checks.yml job checks; selection/registry: navigation.yml job navigation; owner ACs: issue-acceptance.yml job acceptance. No standalone unselected diagnostic is proposed.

No production/platform/editor/reciprocal HTTP observation, native browser/mobile interaction, final RI/catalog/hosted delivery or exact-head Actions result was observed. Original author/rights/release gates remain. Final integration/source-hash reconciliation belongs to parent. This report completes the bounded White-box correction review and supplies no deployment or publication approval.

