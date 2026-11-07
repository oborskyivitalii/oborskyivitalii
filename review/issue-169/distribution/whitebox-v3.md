# White-box QA — v3 affected re-review

2026-11-06. Reviewer /root/distribution_whitebox, same nonauthor execution in correction phase. **Verdict: WB02 resolved; WB01 partly corrected but remains medium/open through a reproduced nested-destination bypass.** Current authored R10 outputs satisfy the intended preparation behavior.

## Source and correction scope

Packet review/issue-169/distribution/candidate-v3.json SHA256 **740dba3ea75e4d9469b9dcd533bd3f840c14c344bca6685f07bc8820eaba8f24**, base 7c292bd50a4f9a0024c397a290c1de965ceada4f. Independently checked 41/41 packet files/deletions. Prepared dirty tree, not a clean checkout. Inspected actual corrected profile/kit/materials source and tests; registry/event source and source/PDF/history evidence reused only where packet identities are unchanged.

First report remains intact at /workspace/scratch/f4dcb060a703/distribution-whitebox-first.md, SHA256 5e5e02a9fcad3796f3e7b3ef53a11b7bc3af70ee7f6bf10fe7d80a567b9694fd. Intent, owner and prompt identities remain those recorded there. This is an actual affected re-review, not a newly fresh first judgment. Parent supplied correction scope/evidence claims after the preserved first judgment; no peer output read. No source/test/external writes or recursive delegation. Only assigned final report written.

## WB01 — medium/open: nested redirect destination still passes

Location: tools/publishing/profile.cjs, hasLaunchDestination (introduced around line 124). AC04/09 launch completeness; AC05/11 enforcement subconditions.

The original materials-only and simple redirect-prefix inputs now reject, while valid tokens and exact Markdown destinations accept. However, the boundary regex treats an opening parenthesis inside a different URL as a sufficient left boundary:

    [Article](https://redirect.example.org/?next=(https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html))
    [PDF](https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html#article-materials)

Actual loadProfile **accepts** this source with its correct authored-launch SHA256. Actual compiler produces the first anchor:

    <a href="https://redirect.example.org/?next=(https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html)">Article</a>

Thus there is no ordinary original-article destination; the only direct site link is the materials anchor. This is the same invariant/failure family as WB01, not a new requirement: each required exact destination must be independently present.

Recommended correction: identify complete parsed link destinations and complete bare URL tokens, compare those exact values, and retain explicit template-token support. Avoid treating punctuation inside a larger URL as an independent destination. Add this negative to the existing publishing-profile.test.cjs case and preserve the valid token/exact-Markdown controls. The actual current launch has both tokens and is unaffected.

## WB02 — resolved

Independently invoked actual loadProfile with each virtual policy https://publisher.internal, https://publisher.local, https://publisher.test and https://publisher. All reject with the public-production-origin error. Inspected permanent negatives and exact-origin HTTPS/auth/port/IP/path checks. Current canonical policy remains the real production origin. This is syntactic validation, not DNS/reachability proof.

## Affected regression observations and allocation

| Risk / independent oracle | Actual v3 observation | Existing CI allocation |
| --- | --- | --- |
| Both exact launch destinations independently required | Valid tokens/Markdown accept; materials-only/simple redirect reject; nested redirect accepts incorrectly | publishing-profile.test.cjs, permanent pr-targeted/staging/production; WB01 remains open |
| Public origin excludes local/internal/test/single-label hosts | Four actual profile negatives reject | Same permanent profile suite |
| TXT conversion preserves clean exact destinations without duplicate autolinks | Actual launchCopies invoked for token, bare-literal and Markdown-link sources: all resolve; token/bare forms have each URL once, Markdown forms retain labels and URLs | publishing.test.cjs, permanent pr-targeted/staging/production |
| Current kit/output state reflects preparation only | Eight platform formats contain both URLs; current launch TXT resolves both without duplicates/tokens; canonical/published null, zero events | Publishing suite and current kit readback |
| Refactored pair helper preserves zero-or-complete pair and exact observations | Actual validateReciprocalPair: zero and complete pair accept; half, stale edition, wrong URL, later platform inspection reject | article-materials.test.cjs, permanent pr-targeted/staging/production |
| Initial site remains independent of platform posts | Actual loadArticle and material.load succeed with zero events and one PDF asset | Existing publisher/material suites |
| Existing site-first event/character/history behavior | Unchanged event bytes, selected source/edition/assets and archive manifest reused from first report; no redundant campaigns | Existing publishing/history/profile/selector routes |

The existing Actions ownership remains site-checks.yml job checks for PR source checks, navigation.yml job navigation for registry/selection obligations and issue-acceptance.yml job acceptance for owning ACs. Proposed WB01 negative belongs in the already registered profile suite. No new workflow or browser matrix is warranted.

The Markdown footer regex correction preserves the intended escaped-character set by source inspection. distributionInstructions extracts unchanged instructions. validateReciprocalPair extracts the previous checks, and the bounded actual helper tests above independently checked its main refusal paths.

## Execution receipt and raw evidence

Two write-free Node heredocs, each exit 0; no full source/test campaign duplicated. First reused the real article and evaluated the real profile module in a VM with readSource overrides solely for virtual launch/profile-checksum/policy bytes. Actual compiler output independently confirms the nested redirect's true destination. Second exposed actual launchCopies and validateReciprocalPair privately in memory, with all module source bytes unchanged. This tests helper behavior, not complete deployed artifact/event proof. No measured branch/line coverage claimed.

First stdout:

~~~text
PACKET 41 41 740dba3ea75e4d9469b9dcd533bd3f840c14c344bca6685f07bc8820eaba8f24
valid-tokens ACCEPT
valid-exact-md ACCEPT
materials-only REJECT Site-first launch must include article and materials destinations
redirect-prefix REJECT Site-first launch must include article and materials destinations
redirect-parenthesis ACCEPT
nested-html <p><a href="https://redirect.example.org/?next=(https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html)">Article</a>
<a href="https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html#article-materials">PDF</a></p>

https://publisher.internal REJECT Distribution requires the public production origin and bounded article slug
https://publisher.local REJECT Distribution requires the public production origin and bounded article slug
https://publisher.test REJECT Distribution requires the public production origin and bounded article slug
https://publisher REJECT Distribution requires the public production origin and bounded article slug
kit-formats 8
actual-launch-clean true true true
actual-pending null null 0
materials-initial 1

~~~

Second stdout:

~~~text
launch-tokens {"markdown":"Article https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html\nPDF https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html#article-materials","text":"Article https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html\nPDF https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html#article-materials\n"} true
launch-literal {"markdown":"Article https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html\nPDF https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html#article-materials","text":"Article https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html\nPDF https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html#article-materials\n"} true
launch-markdown {"markdown":"[Original](https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html)\n[PDF](https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html#article-materials)","text":"Original (https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html)\nPDF (https://vitaliioborskyi.ai/articles/the-sdlc-is-out-of-balance.html#article-materials)\n"} true
pair-zero ACCEPT
pair-full-pair ACCEPT
pair-half REJECT Site-first reciprocal materials must add LinkedIn and Medium together
pair-stale REJECT Reciprocal material must match an observed platform publication
pair-wrong-url REJECT Reciprocal material must match an observed platform publication
pair-late-platform-observation REJECT Reciprocal material must match an observed platform publication

~~~

Parent reported corrected source 54/54, selector 47/47, changed-file lint zero warnings, Basic 17+10 and architecture pass. This report does not independently certify those new logs: exact paths were not supplied in the correction packet. Prior retained logs and their original failures remain as recorded in the first report; no later result erases them.

## Limits

No native browser/platform editor/post, production/reciprocal HTTP observation, mobile device, final RI/hosted deployment or exact-head Actions was observed. Original author/rights/release gates remain. Catalog correction metadata is disclosed by the packet; repository-wide RI/catalog validation remains parent's allocation. Final candidate source identity must be rechecked after corrections.

Preserve both reports. Recheck WB01 after a complete-destination correction and its selected regression case; current R10 content/PDF/assets remain unchanged. This review supplies no release/publication approval.

