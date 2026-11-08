# Issue 177 — Requirements & Acceptance final candidate review

2026-11-08; role `/root/issue177_requirements`. This is a continuation after my independent preflight, not a newly isolated first judgment. The first artifact `/tmp/issue177-requirements-preflight.md` is unchanged. Author-supplied treatment descriptions were treated as assertions and inspected against actual owners; no current peer verdicts were read.

## Verdict

**The bounded article-admission implementation matches the authorized source correction; final advancement is conditional on the remaining test-impact disposition and exact-source evidence.** No whole AC, production collection, release or issue-completion acceptance is granted. The stop/report checkpoint, withdrawn theme scope, pending SEO/discovery, separate release authority and owner-only Medium obligation remain intact.

R1 is treated correctly for this checkpoint: the explicit case table preserves one SDK per document and navigation availability while leaving real SDK-generated query/fragment/history pageviews and aggregate receipt pending. It does not silently redefine AC02 as an SDK-count requirement.

R2's public-selection and document-invalidation portions are implemented and covered by meaningful integrated tests. One content-lane allocation concern remains below. R3 is treated by an issue-specific policy and real native-suite wrapper with explicit pending external gates. R4's bounded isolation semantics are retained.

## Identity and checks

- Base/HEAD: `fdfc8cb67a6f78996932d9688c563c53c21387f2`; branch `work/issue177-article-analytics-20261108`. Candidate is staged/dirty preparation, not a clean candidate commit.
- Candidate manifest SHA-256 independently verified: `193107691ad6dd16759636ad9bb56d1af1ac52e9fa70e168da53a6c45bdfa9b6`. All manifest file digests matched when inspected.
- Prepared diff SHA-256 independently verified: `f07173dc698f524b856e3fac597e527d734898dec1ea2e905b0428ff31f5c01e`. Inspected the actual authored delta and relevant generated identities; the full generated diff is large and was not visually audited as a release artifact.
- Owner SHA remains `e0b6a6dffbe432e14cf5313f1c0f7ad39e04f398fa9d2a552339f6dcf7769f6c`; common/role prompts unchanged from preflight. Provider context internals remain unknown; launch receipts remain the orchestrator's obligation.
- Read actual build/analytics/article/catalog validation, new integrated tests, policy/wrapper/registry, analytics contract, case/test-impact table, source report, HTTP receipt and bounded retained source-check summaries. I ran no browser, suite, provider query or external write during this continuation.
- `/tmp/issue177-targeted-regenerated.tap` reports 58/58, zero skips/failures; Basic JSON reports `pass: true`; style and RI logs report success. Those logs were inspected as retained observations; their exact final-candidate run binding and final owning-policy result are not established by this role. `/tmp/issue177-acceptance-prepared.log` was empty at inspection and supplies no completed acceptance result.

## Finding F1 — Medium: future public admission changes need an explicit content/full-lane disposition

**Location/evidence:** `tools/site/build.cjs:342–353` fingerprints analytics settings/integration source, not the catalog-derived allowlist. At `:830–835` the loader is now derived from public catalog URLs. Principal/article identities correctly include `sha(measurement.head)` (`:438`, `:726`), and the new test at `tests/site-articles.test.cjs:302` covers add/remove under ordinary full generation. However, `verifyContentBaseline()` at `build.cjs:668` compares component fingerprints, and `:923–924` copies measurement assets from the trusted old output in content-only mode. `tools/site/content-release.cjs:145–167` uses that mode and refuses rebuilt Research/Credits/platform bytes. The test-impact table at `review/issue-177/2026-11-08-article-analytics.md:38–45` does not classify this content-lane effect.

**Mechanism/impact:** a later accepted public article addition/removal changes the loader name and all principal document identities even with unchanged analytics source components. A content-only attempt can pass the initial component comparison and fail on the absent loader or platform-page guard. Existing failure behavior is conservative, so this is not evidence of telemetry leakage or corrupt publication. It is an unresolved publication-flow/test-selection consequence relevant to original AC01/AC07 and R2's future-route boundary. The new full-generation tests do not establish content-lane compatibility.

**Treatment:** explicitly classify admission-set changes as requiring full generation, with a meaningful existing/proposed selection or clean refusal check and the content-owner disposition; alternatively implement and independently review compatible content-lane support if authorized. Preserve existing fail-closed platform guards. Ordinary text/tag edits with unchanged public routes should retain their existing compatible path. Resolve this disposition before readiness/advancement; the current stop/report handoff can describe it honestly as open. No extra owner approval is implied for recording this routine allocation.

## Intent → evidence / remaining gate

| Requirement | Inspected candidate evidence | Acceptance disposition |
| --- | --- | --- |
| AC01 source ownership and test impact | Public catalog remains sole authority; issue report lists impacted suites; raw HTTP-before receipt separates served state | Source audit linkage is adequate; F1 allocation and final exact-source evidence remain. |
| AC02 finite accepted article admission | `validateLocalCatalog()` runs before compilation and verifies accepted selected committed source plus matching edition URL; no route wildcard | Implemented source behavior; final native/browser evidence still required. Real SDK/provider measurement remains pending. |
| AC02 future route identity | `measurement.head` hash enters principal/article versions; add/remove test proves full cold/incremental equality and unchanged engine bytes | Full-build requirement treated; F1 covers unresolved content-lane consequence. |
| AC03 accepted/candidate boundary | Test exercises published accepted article and alias positives, wrong origin/project, draft, technical, unknown, trailing slash and snapshot negatives; accepted unlisted preview loses admission | Meaningful producer-integrated oracle. Existing adapter and QA helper bytes unchanged. Final browser/isolation observations are a separate gate. |
| AC03 fail-open/isolation | Existing analytics/preview-smoke suites retained, exact collector predicate and ordinary-context contrast unchanged | No scope weakening found. Local sink and VM tests cannot prove all QA contexts or live provider receipt. |
| AC07 mapping/style | Policy maps all AC01–AC09; wrapper executes three native suites and checks complete no-skip accounting; task-only registry ownership present | R3 treated; final policy execution and four completed role results remain required. Guard success covers its bounded subset only. |
| AC04–06 SEO/discovery/search | Original obligations retained as explicit pending gates; no authored SEO/content changes in inspected implementation delta | Outside this checkpoint; no pass. |
| AC07 preview/staging/production | Policy preserves distinct review/release gates and the stop boundary | No staging promotion, merge or deployment authorized here. |
| AC08 report / AC09 Medium owner action | Policy preserves provider/report limits and post-production owner-only result | Pending; no inference from baseline HTTP reads or source tests. |

## Limits and next gate

The actual live-before JSON records the article response and original loader hash; it is dated HTTP evidence, not a deployed correction or collector receipt. Current source report still labels final roles/checks pending, appropriately avoiding premature acceptance; reconcile that status with completed exact-source receipts before the final Draft PR/issue handoff.

No other requirement defect found within the bounded source scope. I reused unchanged preflight evidence for origin guards, SDK delegation, finite article metadata validation, QA helper semantics and publication/release boundaries; I rechecked changed producer identities, integrated tests, policy/wrapper and claim limits directly. F1 needs an evidenced allocation/disposition; final candidate tests and the other independent roles remain separate gates. Then stop/report within the authorized analytics checkpoint. Material requirement/oracle or implementation corrections need affected re-review; this report does not authorize the next publication phase.
