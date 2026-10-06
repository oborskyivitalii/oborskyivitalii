# Color staging correction — 6 October 2026

## Current CI-only flow amendment

The maintainer stopped manual deployment and replaces the one-request bootstrap
with two paths: automatic latest-head PR preview with minimal hosted smoke, then
explicit PR-number staging dispatch with complete hosted automation. The change
stays in existing #26. This supersedes every `target.json`/manual-upload operation
below; earlier execution records remain historical evidence.

The prepared workflow uses official Wrangler Action exclusively, one existing
Direct Upload project, `pr-N` and `staging` branch aliases, immutable candidates,
one updated PR comment and exact public/package artifact identity. Staging is
serialized; preview cancels stale PR runs. Protected-main controller and live PR
leases are verified before deploy/promotion. A lightweight report cannot replace
the full gate. Stable recovery locates the previous successful CI run/package
automatically and deploys it through the same official action if verification
fails. It never uploads through the plugin or an operator script.

The active provider audit finds `oborskyi-site-staging` automatically publishing
all Git branches with empty build/output settings, explaining its missing site
index. Disable those automatic production/preview builds. Reuse
`oborskyi-author-ci-staging` without a Git connection or production-branch change;
its bare root has no production deployment, while explicit branch aliases are
the review/staging addresses. [Current runbook](../../SITE-STAGING.md) has exact
Cloudflare/GitHub dashboard steps, variables, secret names and operation.

Initial full run `37423460431` completed **failure**, including Linux/Windows
timeouts. HTTP, captures and Lighthouse pass; its initial source/static/native
navigation/DOM fixture failures remain recorded. Corrected preflight/build
`37425628954` at `8f89078c` passes source, generation/SEO/RI, lint,
security/advisories and Color packaging. That build was **not deployed**; actual
live Color remains `0c423b48` / `eac4654e`. No new full-hosted pass or stable
promotion is claimed. Scanner dispositions still need independent acceptance.

New flow local tests pass source/head/main protection, failed/incomplete full-gate
rejection, tampered hosted runtime/header rejection, recovery attempt binding and
comment update/stale-source handling; YAML and embedded JS/shell parse. Deployment
credentials, owner environment/variables/main protection and new default-branch
controller integration remain pending. Preview/full staging and actual rollback
must be verified in CI after activation. The runtime stack's recorded performance
failure, production and physical-device/independent acceptance stay open.

Owner intent: #8 provides the current whole-site preview; #13 owns complete
hosted checks. The maintainer reports missing ribbons, scroll continuation and
spatial text flight, and explicitly requests updating staging and full testing.

## Corrected rendition

The 5 October preview `505498da` contains **base**, not Color. Its served bytes
match its recorded source `51611505`; the earlier smoke passed for that base
edition and did not assert the requested Color features. This is a rendition
selection defect, not an accepted current-design preview.

The new review is based on Draft #23 source
`174bef1f14390363953cc94ebc0ced136d39da82`, preserving the P1/V1 work and the
recorded 89.2 ms cold Writing failure against 80 ms. No runtime child PR is merged
to main or #18 merely to host its review edition.

`tools/staging/color.cjs` extracts the existing authored effects through their
contract and packages them in the native versioned runtime. All five routes and
snapshots explicitly identify Color. The new rendition has its own fingerprint,
base-artifact derivation and exact file inventory. Production generation stays
base; no performance limit, host policy or promotion gate is relaxed.

## Execution state

The first CI pass builds and uploads a Color artifact after the normal local
checks and an explicit deterministic packaging test. Its truthful local preflight
record does not authorize stable promotion. The checked artifact is now deployed;
full hosted results are pending.

After upload, `target.json` records the exact immutable origin, source SHA,
artifact/run IDs and upload/public digests. The request-scoped PR workflow reuses
that artifact in the existing complete staging profile: exact served hashes,
Linux Chromium/Firefox/WebKit, native Windows/macOS, source/security/advisories,
accessible/failure states, Lighthouse, sustained CPU/five-minute soak and captures.
An additional three-engine Color check uses real wheel input and samples spatial
text/camera travel, forward/reverse edges and Home/Credits boundaries. All failures
and missing jobs are retained; physical-device/review acceptance is separate.

No stable alias promotion, production release, DNS change or paid purchase is
part of this correction. #8/#13 and Draft #18/#22/#23 remain open/pending.

## Source checks observed during preparation

The local full Node set ran 131 tests: 127 pass and four fail. They concern frozen
SEO/source normalization, a ribbon-format assertion, scroll-restoration layout
fixture, and historical geometry metadata. The default ten-test check and the
Color packaging check pass; Python's 21 tests pass. These failures are retained,
not presented as current full acceptance. The hosted workflow records the source
stage outcome and still collects the other suites; the aggregate explicitly
rejects a failed or skipped source stage. Lint, security and advisories also run
as separate stages so one finding does not hide the other requested checks.

## Published Color and requested full run

Current preview: [open Color](https://0c423b48.oborskyi-author-ci-staging.pages.dev). Cloudflare deployment `0c423b48` succeeded
on 6 October, with source `eac4654e58757f5bbab343feeef3fc690548df6b`. Color build run `37423103901` and public
artifact `11393657896` passed. ZIP SHA-256 is
`c5e4ad803439bdc94c1fc04cd0462b8f201e15e2e22f5422ce8d4330512af578`;
public digest is `798ad5054e51b3f6bdb238889b843c73087b4c45de2634bd5794a4d03e32e236`.
Initial Home bytes match the verified package and report Color fingerprint
`949b2a2e441bc6b1673be0310ad8a12dc775ff8c73a59706d944373e7be36768`.

The complete hosted profile is queued by the recorded `target.json`. Its source
is frozen to the deployed artifact, not the later report commit. The RI context
was corrected after the first CI caught missing historical binary existence
records; native RI and Color preflight pass at this deployed source. Full source
checks now collect every command while retaining any failure. Results follow
when all hosted jobs finish.

## Initial full run findings and repair

Full hosted run [37423460431](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37423460431)
tests deployed source `eac4654e`. HTTP and captures pass; native/browser/motion
jobs are still running at this repair. Native CI reports 128/132 source tests,
with the same four failures (the earlier local preparation count was 127/131).
SEO separately fails exact comparison; lint flags an unused `points` binding.
Semgrep has zero findings but three partial-parse errors at the valid terse
`i%2?.45:-.65` conditional, so coverage fails and Bandit/secrets were not reached.
Dependency advisories pass. These failed/incomplete outcomes remain evidence.

The correction retains exact semantic/edition comparison, allowing only the
exact base effects identity/contract and generated separator; a new negative test
retains changed variants/contracts/authors. The ribbon fixture executes the real
merged depth-sort snippet. The restoration fixture requires instant native scroll
without any style read/write, including after native failure. The migration
fixture compares all semantic/style fields and rest vertices, and proves the
tighter acceleration sphere contains every vertex and is no broader than the
frozen conservative sphere. It also removes the unused binding. The conditional
is spaced without changing its expression, making all source parseable to the
pinned scanner. No budget, scan coverage or runtime acceptance assertion is
removed. Reconciled local Node tests pass 133/133; exact SEO comparison passes.

A scoped full-source/static preflight now precedes the corrected Color package,
so scanner coverage and exact public-checksum triage can be resolved before
spending another complete hosted run. After publishing its new immutable source,
repeat the full profile and retain the initial run separately.

## Completed initial diagnostics and preflight repairs

The independent staging HTTP policy smoke passes all 28 source files, native
root/query/revision, actual 404 bytes, noindex/nofollow and mutable/immutable
caching. The initial macOS WebKit run passes all 20 normal cases and 13 analytics
fixtures; its four navigation rows reject the old base-only empty-middle fade
assertion. Color deliberately moves outgoing/incoming text through separate depth
planes. The full navigation probe now checks both depth directions, fades and
the zero-opacity spatial handover for Color, retaining the original base check.
Retargeting must retain current opacity/depth; interruption/readability and all
history/endpoint/fallback checks remain mandatory. A mutation test rejects wrong
planes, visible handover and premature fully visible text.

The initial motion run collected all 15 idle/scroll/Off/Reduced profiles, 24
primary flights, 40-route cycles per profile and the five-minute soak. It fails
the DOM-retention assertion: counters grow by one document/401 nodes, while
listeners remain 75. The eight-flight itinerary never opens utility Credits, so
the cycle test first fills the fifth cache entry after its baseline. Warm all
five documents before comparing the same Index state over 40 cycles; keep the
strict no-growth limits and require the recorded complete warmup in validation.
This explains the fixture defect; a new hosted run must prove the correction.

Source/static preflight at `ae8fbca9` passes all 133 Node and 21 Python tests and
generation/SEO/bundle/RI checks. Its report wrapper lacked an artifact identity;
the workflow now builds that exact identity before scanners. Raw Semgrep has zero
findings/errors across 112 files, and Bandit zero findings/errors. Four complexity
warnings are resolved by extracting existing animation and renderer assertion
helpers; no rule threshold or exception is broadened.

The raw secret scan's 390 new entropy candidates are exact public checksums or
provider/Git identities. Append-only classification recomputes 205 generated
checksums, verifies 119 metadata candidates in 37 frozen evidence blobs against
the source tree, and verifies 66 current provider/package candidates against the
confirmed deployment and byte-verified package. New generated identities are
also proved before adding exact path/type/hash dispositions. Unknown fields,
credentials and other candidate types remain unaccepted; independent review of
these dispositions is pending. This is not a successful security-stage claim.

The three functional engines run independently in parallel so the complete
390-case source matrix can finish within a bounded job. Native Windows retains
both engines, and every navigation/analytics fixture is collected. Performance
remains sequential in its separate job; no timing budget changes. The initial
run and its failed/incomplete results remain separate from the corrected run.
