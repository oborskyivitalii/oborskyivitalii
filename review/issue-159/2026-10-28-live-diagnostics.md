# Issue159 — 2026-10-28 bounded live diagnostics

Owner: [issue159](https://github.com/oborskyivitalii/oborskyivitalii/issues/159),
[pre-execution charter](https://github.com/oborskyivitalii/oborskyivitalii/issues/159#issuecomment-6475418083).
This prepared implementation starts at `c68db162ca294ed3bd88e7e2280ecbd8f37e3dd3`.
Exact final source, PR and native receipts belong in the owning conversation after
source freeze. This file is not a live receipt or release approval.

## Intent and acceptance

Finish B3's two outstanding observations before Terra SEO: instrument Forward
without CPU profiling, then measure the real hosted SDK's transfer and sampled CPU
in a separate ordinary context. AC13/16/18 gain deterministic diagnostic guards;
AC11/15 and provider/browser/cost gates retain their actual external obligations.
Production source/runtime/assets, release gates and original budgets are unchanged.
PR117's private LCP acquisition/replay remains a separate owner and cannot supply
these live Forward/transport observations.

The original CUA Forward wait requested 6000 ms but its tool error returned after
3.9791 seconds; later DOM was correct. Cause remains unknown. A later pinned
Playwright pass cannot retroactively explain or relabel that observation.

## Diagnostic contract

The existing manual `site-cause-probe.yml` gains explicit `scope: analytics-live`;
historical is still the default. Only the repository owner can dispatch. Workflow
and checkout must equal the exact collector candidate SHA. The immutable release
is authenticated against the current accepted production deployment: tag, source,
public digest and deployment ID, plus the production branch. The complete lease is
rechecked before collection and after it; same-source tag transitions invalidate it.
`deployments: read` is narrowly required for that identity, with contents/actions
read; there are no write or deployment operations.

Three sequential fresh ordinary Chromium contexts send deliberate real SDK/RUM
traffic. The two Forward contexts run Home → Writing → systems → Reset → Talks →
Back → Forward. First Forward is issued after Back mounts Writing while busy;
second is issued after Back settles. Both starting conditions are validated.
Here, settled means the existing navigation-ready/aria-busy idle oracle, not a
separately observed camera/scene visual state. The runtime 8000 ms abort policy
remains unchanged; postdeadline abort/recovery is unobserved by this diagnostic.
Record browser-clock request/popstate/mount/navigation-ready/settled events and
Node observed wait durations. Attached bound stays 6000 ms total; settled bound
comes from the existing transition-pacing contract (6950 ms). Missing milestones,
wrong starting conditions or overruns fail rather than become a successful contrast.

A separate 6000 ms Home observation records the actual vendor response SHA, decoded
body length, CDP encoded transfer length/cache fields and raw CPU profile at 1000 µs
sampling. It has no engine transition probe. Browser event/network observation and
profiling overhead remain; this is neither exact CPU accounting nor a performance
budget pass. No matching samples means unresolved at this granularity, not zero cost.
Browser response bytes and mounted engine/variant/route identities must match the
frozen public manifest. Node hosted verification before/after is additional evidence.
No request bodies, headers, credentials or collector query strings are recorded.
Primary failures survive capture/drain/close errors; uncertain context disposal stops
further visits. All raw rows/profile and the original failed verdict are retained.

## Independent role executions and findings

Four distinct role agents actually inspected the initial prepared dirty source.
No reviewer performed a live visit or workflow dispatch.

| Role | Independent execution | Initial result and own finding | Correction recheck |
| --- | --- | --- | --- |
| Requirements & Acceptance | `/root/b3_requirements` | Preflight accepted bounded diagnostic scope; preserve historical unknown and sampled CPU limits | ACCEPT final code and clarified idle/recovery boundary; independent17/17 |
| Code review | `/root/b3_artifact_review` | Request changes: selector, actual browser byte binding, active release lease and formatting churn | ACCEPT corrected executable scope; independent17/17 |
| White-box QA | `/root/b3_whitebox` | Request changes: incomplete milestones/conditions, invalid CPU timing and omitted native request failure | ACCEPT corrected executable scope; independent17/17 |
| Exploratory/interaction QA | `/root/b3_operator` | Executed actual frozen DOM/adapter VM and incomplete timeline negatives, reproducing selector and completeness defects | ACCEPT corrected executable scope; independent17/17 |

| Finding / risk | Evidence and oracle | Correction and deterministic regression | Route / limits |
| --- | --- | --- | --- |
| F01 real SDK selector | Frozen Home plus actual adapter selects local loader under original selector | Select `script#site-cloudflare-beacon`; compile actual loader/adapter in VM with both script types | Existing `cause-probe.test.cjs`; no vendor execution in unit test |
| F02 browser edition attribution | Node no-store responses do not prove browser bytes | Reuse `local-browser.verifyResponse`; validate mounted engine/variant/route-version against manifest | Actual-byte and changed-edition negatives; native visit pending |
| F03 active release identity | Historical accepted tag can share current source | Current accepted deployment full lease before/after; same-source tag transition negative | `productionLease`/`bindRelease`/`finish` tests; no API mutation |
| F04 incomplete Forward contrast | Missing pop/settled or reversed busy conditions passed | Require all milestones, finite nonnegative ordered durations (pop ≤ mount ≤ ready ≤ idle) and declared busy state | Extended timing negatives in existing suite |
| F05 impossible CPU attribution | 6000 ms sampled time inside 6 ms observation passed | Finite start/end; unique nodes; accumulated nonnegative sample time bounded by profile duration | CPU profile negatives; real samples pending |
| F06 hidden network failure | Native DNS failure vanished from saved row | Capture SDK/collector/artifact `requestfailed`, strip query; preserve primary fault | Actual phase lifecycle mock, SDK and collector failures |
| F07 source formatting noise | Wrong ad hoc Prettier defaults and JSON key/Unicode rewrite | Restore explicit maintained config and original key order/Unicode | No CS05 exception; focused changed-owner formatting |

The test module remains a dated diagnostic with `diagnostic`/`pr-targeted` lifecycle,
not an added routine browser campaign. Its new helper inputs are registered in
`test-profiles.json`. Explicit owner dispatch runs its source guards before any live
visit. The issue159 policy adds named `LIVE-DIAGNOSTIC` source guard; all original
human/provider/release gates remain. QA findings are covered by the existing suite
rather than a parallel matrix. Four-role execution is separate from Actions tests.

## Acceptance evidence and limitations

Initial implementer source run: 14/14 passed. Independent code/operator executions:
11/14 passed, three setup failures because the new worktree lacked yaml/espree and
`SITE_AUDIT_TOOLS` was omitted. Those logs remain separate; no assertion was waived.
Corrected source run 1: 16/17 passed; the new network fixture mistakenly used the
site origin for Cloudflare's collector. Inspection confirmed the maintained exact
provider predicate; only that fixture changed to `cloudflareinsights.com`.
Corrected source run 2: 17/17 passed, no skipped/cancelled/todo, using the existing
locked toolchain. Lint setup first lacked local @eslint/js; linking the already
installed ignored toolchain resolved that environment issue. Focused exact pinned
ESLint then passed with zero warnings. Original logs remain outside the checkout.

Basic passed (16 theme/archive plus 10 Color focused tests, generated/size/geometry
checks). First policy run passed all checks except RI freshness; RI regression had
three context lookup errors for that same stale generated context after the final
ready-order source change. This is a generation-order failure: rebuild RI after the
complete prepared source, then rerun its affected freshness/regression/policy checks.
RI-CI coupling and its 20 regressions passed separately. Full format check also
identified the refreshed generated RI-CI JSON layout; canonical formatter output
is applied to that regenerated view before final verification. These initial failures remain
retained. All four corrected-source roles now ACCEPT. White-box additionally executed seven
final affected/boundary checks and three CPU failure mocks, preserving original
errors and returned raw profiles. Code/requirements/operator/white-box exact-file
fingerprints are reconciled in the final owning conversation. Current final
clean-source checks must be completed before dispatch. Native timing, SDK CPU/transfer and provider ingestion
are not established by this prepared source evidence. Issue159 remains open; the
prior 9/46 checked obligations and all pending SEO/human/provider gates retain
separate truth. Dynamic final receipts stay comments once the complete source freezes.

## Workflow registration correction

Published prepared source a036fa6e098b49435e0288b889f9418076fe6d4f (tree
7a8302874ee4007af3c8cb9c1f43232b4b48b001) became Draft PR161. GitHub's automatic
push-time validation failed in40735626556/1 before any job/dispatch/live request:
`runner.temp` is unavailable in job-level `env` (lines44/45). The YAML parser and
four source reviewers missed this Actions expression-context boundary. Preserve
that failed registration; no unchanged retry. A runner step now writes the two
runner-owned temporary paths to GITHUB_ENV. The actual workflow source test rejects
runner references in job env and executes the extracted initialization step against
a temporary RUNNER_TEMP/GITHUB_ENV fixture, checking both resulting paths.

Post-freeze broader source selection also revealed worktree-only missing publisher
dependencies; the retained first log is separate from actual product assertions.
Existing locked dependencies are reused locally without package changes. Initial
exact-ref CLI mistakes and the subsequent corrected clean-source run are separate
receipts. No source test, registration or Draft check establishes live SDK evidence.
