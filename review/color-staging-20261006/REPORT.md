# Color staging correction — 6 October 2026

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
