# White-box QA — first independent judgment

2026-11-06. Distinct nonauthor reviewer /root/distribution_whitebox. **Verdict: one medium finding requiring a bounded correction; one low observation.** Actual R10 links and pending state are correct.

## Source and isolation

Prepared dirty candidate, not a clean checkout. Base and observed HEAD: 7c292bd50a4f9a0024c397a290c1de965ceada4f. Packet review/issue-169/distribution/candidate-v2.json SHA256 296f566b486e97c6e11395d72ae379624e667287cda49c0fee40328b528572f2; independently checked all 40/40 declared byte identities/deletions. Other dirty generated previews/catalog/allocation files exist outside this packet and are outside this acceptance.

Intent SHA256 0f8b0146e26d51748ac171408be03a13e86628c01185a10005844acd659256b8; owner snapshot SHA256 b8844112ad357ef14e5720259755bb81ba0362e73d6b2f5fa0073fe0b5d8044e. Common prompt SHA256 2bcb3978b499d35bb0850aead987e5b7e07fc75cf9095552c0fcab07ff24faeb; role prompt SHA256 832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f.

Read AGENTS, CONTRIBUTING, reviewer contract/prompt, README, source map, actual source/test/registry diffs, canonical workflow/materials owners and supplied raw test logs. No MEMORY, author history or peer output read. The gzip archives were decompressed for byte comparison only, not historical-content reading. Launch requested none-fork; parent must retain actual launch receipt/accepted parameters. Provider internals remain unavailable, so no provider isolation attestation is claimed.

No source/tests/external writes or delegation; only this assigned output is written. All adversarial inputs were in memory. A later parent message mentioned upcoming lint/launch-TXT corrections after my first checks; this report remains bound to v2 and does not adopt that message as a verdict.

## Findings

### WB01 — medium: one materials link satisfies both required launch destinations

Location: tools/publishing/profile.cjs:515–522. AC04/09 preparation and AC05/11 enforcement subconditions.

The article URL is a prefix of the materials URL. The check launchText.includes(articleUrl) therefore succeeds for a launch containing only:

    PDF: https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html#article-materials

The actual loadProfile accepts this input despite no separate ordinary article URL/token. A no-links control rejects. The independent oracle is the accepted requirement for both original-article and materials destinations; one substring must not satisfy two obligations.

Use boundary-aware/extracted exact destinations or each independent token, with permanent materials-only rejection plus valid token/exact-URL controls in tests/publishing-profile.test.cjs. The current real launch has both tokens, and all eight current platform outputs contain both URLs; this finding concerns the reusable guard.

### WB02 — low: internal production origin passes the public-origin predicate

Location: tools/publishing/profile.cjs:90–103. In-memory policy https://publisher.internal is accepted. The existing materials URL validator excludes .internal/.local/.test and single-label hosts; the new public-production-origin predicate does not. Current authored policy is the correct https://vitaliioborskyi.ai, so no current R10 destination is unsafe. This is trusted authored configuration, not an untrusted-input exploit.

Align syntactic exclusions with the established public-URL owner, or explicitly narrow the stated contract and record policy trust. Add a small negative if retaining the public-host promise. No DNS/reachability claim is made.

## Independent risk/oracle and CI allocation

| Risk / AC | Scenario and independent oracle | Actual result / suite |
| --- | --- | --- |
| Planned vs factual state, AC04/09 | Preparation must not assert publication | Actual article canonical/published/modified null, zero events, distribution planned; eight current platform outputs include both URLs. Existing publishing.test.cjs. |
| Launch completeness, AC04/09/05/11 | Independently require both destinations | WB01 reproduced; token control accepted, no-links rejected. Proposed negative belongs in publishing-profile.test.cjs. |
| Character bound, AC04/09 | Count Unicode code points of selected text plus emitted footer | Actual Medium length 19540: exact limit accepted; 19539 rejected. Source confirms adaptation selection. Existing profile suite. |
| Origin/escaping, AC04/05 | Public HTTPS origin and escaped single-line bounded labels | WB02 reproduced; inspected protocol/auth/port/IP/path/slug and label/HTML/Markdown escape branches. Existing profile suite. |
| Site-before-platform, AC04/09 | Prior site inspection for the matching base edition and actual channel host | Actual private guard: zero platforms accepts; missing site, stale base, late site inspection and host-suffix spoof reject; matching prior base accepts. Existing publishing.test.cjs and publishing-history.test.cjs. |
| Reciprocal pair, AC10/04 | Initial site accepts zero platforms; later pair binds both selected editions/URLs/ordered observations | Actual current materials load succeeds with PDF and zero platforms. Inspected source and tests for half-pair, missing site/events, stale URL/edition/observation and adaptation. Synthetic pair integration not independently executed. Existing article-materials.test.cjs. |
| Manuscript/print preservation, AC07/08/09 | Distribution stays outside manuscript/PDF/semantic content | Profile-only article-owner diff; platform footer appended after platform layout; inspected retained tests for article byte identity, semantic identity and no print backlink. No PDF visual acceptance claimed. |
| Archive fidelity, AC05/11 | Decompressed evidence equals baseline bytes | Both gzip archives match baseline blobs and original SHA256/lengths, 83635 and 85576 bytes. |
| CI selection, AC05/11 | Enduring cases have existing owner/selection route | Registry retains pr-targeted/staging/production and specific workflow/material-guide edges. Selector correction log 47/47. |

The three affected permanent publisher/profile/material suites are registered in tools/quality/test-profiles.json for pr-targeted, staging and production. PR source checks use site-checks.yml job checks; selection/registry obligations use navigation.yml job navigation; owner acceptance uses issue-acceptance.yml job acceptance. Staging/production retain existing source routes, not a new workflow. Proposed negatives should join the existing profile suite. Native editor/posting/HTTP/rights/author decisions remain external gates.

## Actual checks and raw results

Two write-free Node heredocs, each exit 0. One verified packet/archive/current source and kit and invoked actual loadProfile with a Node-VM source-reader override for changed launch/profile-checksum/policy bytes in memory. All other source reads remained real. It also exercised the exact character boundary. The other evaluated actual event source and exposed private requireSiteFirst in memory with virtual profile/edition reads. That establishes guard behavior, not complete publication/artifact validation. No disk test fixtures or full suite runs.

First diagnostic stdout:

~~~text
packet 40 40
archive review/issue-167/2026-10-31-reviewer-isolation.md true true 83635
archive review/issue-167/2026-10-31-offline-prototype.md true true 85576
actual_state {"canonical":null,"published":null,"modified":null,"events":0,"distribution":{"articleUrl":"https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html","materialsUrl":"https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html#article-materials","originalLabel":"Original article and updates","materialsLabel":"Illustrated PDF and other formats","state":"planned"}}
actual_materials 1 false true
launch-token-control ACCEPT https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html
launch-no-destinations REJECT Site-first launch must include article and materials destinations
launch-materials-only ACCEPT https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html
internal-origin ACCEPT https://publisher.internal/articles/the-sdlc-is-out-of-balance.html
character-limit 19540 ACCEPT
character-limit 19539 REJECT Profile medium text exceeds its authored character limit
actual_kit_formats_with_both_links 8 of 8

~~~

Second diagnostic guard stdout:

~~~text
zero-platform ACCEPT
platform-without-site REJECT Site-first distribution requires prior verified website publication and the actual platform host
prior-correct-base ACCEPT
stale-base REJECT Site-first distribution requires prior verified website publication and the actual platform host
late-inspection REJECT Site-first distribution requires prior verified website publication and the actual platform host
suffix-host REJECT Site-first distribution requires prior verified website publication and the actual platform host
~~~

WB01 reproduction: load actual article; evaluate actual profile module with readSource overrides supplying only a launch "PDF: <distribution.materialsUrl>\\n" and a profile with its correct SHA256; leave metadata/policy unchanged; call loadProfile. Result ACCEPT. The no-links launch with its correct SHA rejects. This method evaluates the real validator rather than a reimplementation.

Inspected supplied logs without duplicating campaigns:

- /workspace/scratch/f4dcb060a703/distribution-tests-first.log: 54 tests, 54 pass, 0 fail.
- /workspace/scratch/f4dcb060a703/distribution-affected.log: 122 tests, 120 pass, 2 fail; both expose generic AGENTS source-edge impact on repository-only selection. Preserve this failure.
- /workspace/scratch/f4dcb060a703/distribution-selector-final.log: 47 tests, 47 pass, 0 fail. Actual registry diff retains specific guide edges without generic AGENTS. This is bounded correction evidence, not a final rerun of all 122.

These supplied logs are observed retained evidence, not reviewer executions or current-source CI proof. No measured branch/line coverage is claimed.

## Limits and disposition

No live production, native platform editor/post, reciprocal HTTP observation, browser/mobile interaction, final Basic/RI, hosted deployment or final exact-head Actions result was observed. Parent owns final candidate/catalog/RI/Basic reconciliation and source-hash comparison after edits. Whole original ACs retain all conditions.

Preserve this first judgment. Correct WB01 and independently re-review the affected delta; WB02 can receive an evidenced bounded disposition. No deployment/publication approval is supplied.

