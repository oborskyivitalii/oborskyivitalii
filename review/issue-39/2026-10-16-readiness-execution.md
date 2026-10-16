# Issue 39 — 16 October 2026 readiness audit and execution

Owning issue and dated anchor: [#39, readiness execution](https://github.com/oborskyivitalii/oborskyivitalii/issues/39#readiness-execution-20261016).
Owning PR: [PR40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40).
Reviewer/executor: Codex, self-review. A new independent release review remains pending.
Inspected source: PR40 `16d4b1cd`, tree `c026f8e3`; protected main `9b82f382`.
The working correction is explicitly dirty until its frozen commit is recorded.

## Intent and acceptance

The owner approved execution of the current-code test audit and six-step completion
plan on 16 October. Preserve #39 AC01–AC05 and the existing #1/#7/#8/#13/#72
release dependencies. No new owner, competing pipeline, weaker budget, automatic
closure or production/domain/DNS activation follows from this preparation.

Main is the merge base of the inspected PR: zero commits behind, fifteen ahead.
Another rebase is unnecessary while those refs remain current. PR80 is already
merged; its guard work is the baseline, not a new prerequisite PR.

Apply CS01/CS02/CS05/CS07/CS08/CS09/CS10 to changed sources, tests and configuration.
The issue's AC03/AC04 subcondition maps bounded style/format/lint, actual behavioral
negatives, source/build/RI/CI identity and separate independent review. Preserve
all unrelated authored, retained and generated-edition contracts.

## Findings

| ID | Evidence and implication | AC | Disposition |
| --- | --- | --- | --- |
| F01 | Raw-head source run38882622023 passed596/596 additional cases; navigation38882622007 and owning38882621999 passed. Preview38882622012 passed HTTP and four Chromium normal/no-Canvas width configurations. These are admission/preview observations, not stable staging or full release. | AC03–AC04 | Verified on inspected source. |
| F02 | Ordinary stage38883384046 passed24/26 prepublication families before upload. Security has112 new exact entropy fingerprints; #39 classifies them as editorial Git blobs and generated public checksums. They still require individual source proof and unchanged scanner enforcement. | AC03 | Open correction. |
| F03 | The same run's advisory gate rejects locked mcp1.29.0. Upstream GHSA-84m7-p3x7-pcfv identifies1.30.0 as the patched1.x release. This is audit tooling, not a website runtime dependency. | AC03 | Update pinned tooling and audit the resolved graph. |
| F04 | Earlier run38749372414 measured Writing mobile TBT235.5ms against200ms. The current source has no successful replacement measurement. Source scheduling now completed in160443ms within180000ms; that does not close page performance. | AC03 | Retain failed raw evidence; diagnose before a concrete runtime change. |
| F05 | Basic measures Writing HTML99933B against100000B: only67B headroom. Credits is83948B. Compact generated JSON-LD through the existing escaped serializer, retaining all structured values, visible copy, SVG and complete legal texts. | AC03 | Open bounded compiler correction. |
| F06 | Live protect-main is strict, has no bypass actors and requires only checks/navigation. Staging admission is absent; protect-production is absent; Releases are empty. App/environment/immutability administration still needs authenticated observation. | AC03–AC04 | Actual settings gate pending. |
| F07 | Current registry validates89 modules:55 permanent,18 diagnostic,16 task snapshots. Permanent Node coverage is45 additional staging modules plus3 Basic delegates, or48 production modules;7 permanent Python modules remain separate. Numbered task snapshots do not enter routine profiles. | AC03–AC04 | Verified selection; retain cases and meaningful failures. |
| F08 | Approved topic-first cards already have corrected byte-pinned owning assertions and browser identity selectors. Local content10/10 and profile-selection24/24 pass. Old PR/MEMORY/profile prose still describes Draft943c720 or Color as staging-only. | AC04 | Correct maintained wording without rewriting historical evidence. |

## Executable requirement and check matrix

| Requirement | Actual source/check route | Before upload | Hosted/native or human boundary |
| --- | --- | --- | --- |
| Source and ownership | Ready Basic, source-tests registered targets, navigation/RI/CI, issue39 policy; actual raw head | Clean source, original named accounting and every mapped check | Current successful raw-head jobs required by staging controller |
| Generated HTML and offline exports | site/build --check; fallback, previews, bundle; exact manifest and size checks | All frozen public bytes and same-source outputs match | Exact served HTTP/MIME/redirect/404 inventory |
| Licenses and provenance | legal compiler, release/rights, shared rights-record, publication-records; exact root/snapshot notices | Exact source/tree/edition/public inventory; approvalPass remains false | Existing consents preserved; exact-edition human rights/editorial acceptance |
| Scanners and dependencies | Actual pinned scanners security/advisories, Semgrep/Bandit/secrets and exact npm/Python graph negatives | All engines/accounting and feeds pass; new checksums are reviewed individually | Independent review remains separate; no scanner skip supplies acceptance |
| Preview | Package/HTTP plus local-browser and conditional Color smoke | Source/rendition/artifact identities | Chromium1440/390, normal/no-Canvas; not a staging gate |
| Staging | Existing local prepublication staging; reusable staging-regression and staging-gate |26 independent families, same frozen artifact, strict original budgets | Chromium/Firefox route/failure/navigation/analytics, two mobile Lighthouse trials, bounded motion/four flights; then both stable hosts/receipts/recovery |
| Production candidate | release-candidate on merged protected main, prepublication production; candidate-evidence consumes its archive | No STAGING edition; exact production Color/SEO/rights/retained bytes | Full Linux/native macOS/Windows/Color,30 Lighthouse trials, soak/captures; independent and physical-device acceptance |
| Activation and recovery | Existing production publisher, Pages migration and immutable archive consumers | Actual App/protection/environment/Release controls; authenticated predecessor | Owner release decision, canonical DNS/TLS/redirect/indexing/analytics/passive scan and recovery |

Keep finite diagnostic selection separate. Current PR's changed shared controls
legitimately select broad source coverage. Do not claim every PR needs the complete
production matrix, or that an old task snapshot proves today's behavior.

## Decisions

The current owner instruction permits fixing security/tooling, reducing Credits
overhead, diagnosing and fixing Writing, reconciling tests and obtaining ordinary
two-host staging. Record the measured runtime owner before editing that concern.
All original scanner behavior, budgets, case counts, exact-artifact leases and
external release gates survive. Complete local preparation before another /stage.
Staging review precedes merge and production/domain/DNS activation.

## Execution tasks

| Task | Owners and expected result | Findings / AC | Verification | Status |
| --- | --- | --- | --- | --- |
| T01 | Current review, issue anchor, profile/runbook/MEMORY wording and RI routes | F07/F08, AC04 | Registry, policy, RI/CI, focused source checks | In progress |
| T02 | Pinned Python requirements and existing exact secret ledger | F02/F03, AC03 | Source-classified findings; actual locked install, scanners/advisories and negative controls | Pending |
| T03 | Existing page renderer/escaped JSON serializer and generated outputs | F05, AC03 | Exact structured-value and script-container negatives; full-copy/source/snapshot/rights and size regressions | In progress |
| T04 | Retained Writing report, focused current artifact and measured runtime owner | F04, AC03 | Same-profile trace and focused regression; original200ms and motion budgets | Pending diagnosis |
| T05 | One frozen commit and unchanged ordinary controller | F01–F05, AC03–AC04 | Clean26/26 prepublication, current Ready checks, bounded two-host staging | Pending |
| T06 | Current settings/evidence and final maintainer review | F06, AC02–AC05 | Exact served stable identity, settings inventory and source-bound human gates | Pending |

## Acceptance evidence

| AC | Actual result on inspected source | Remaining gate |
| --- | --- | --- |
| AC01 | Live main/PR/rulesets/releases revalidated; historical provider inventory remains dated | Re-read provider state before any authorized mutation |
| AC02 | Source domain/migration mappings passed current owning CI | Actual canonical migration, DNS/TLS/redirect evidence |
| AC03 | Ready source and preview pass; ordinary prepublication fails security/advisories; older Writing performance remains failed | Corrected clean preflight/staging, full native/rights/device/independent/settings and release decision |
| AC04 | Current registry/RI/CI, local Basic/content/profile selection and current owning CI pass | Current review/maintainer settings/merge; self-review does not supply independent review |
| AC05 | Preparation fixtures are not live domains | Authorized actual deployment and both-scheme canonical/redirect checks |

Local initial focused content execution failed because its pinned Python helper
environment was absent. After supplying the matching Python3.12.14/PyYAML6.0.3
helper environment, content10/10 passed; this is a setup correction, not an outdated
assertion. Other focused publication/preview cases25/25 passed; profile selection24/24,
Basic24, RI freshness and RI/CI verification passed. No new remote staging or
production run was initiated by the audit.

## Issue synopsis

Current-code audit confirms main ancestry and fresh source/preview admission, but
ordinary staging remains blocked by exact secret triage and a tooling advisory,
with Writing performance and actual release controls still open. Finish bounded
corrections and clean preflight before the next ordinary two-host attempt. No
whole release AC is newly complete and no old failure is relabelled.


## PR81 integration and continued delivery — 16 October

Current owner instruction requests PR40 through permanent staging and protected
main, then production. PR81 is merged at `315da39d0294d970809648cdc0725f7e63187602`.
Its Cloudflare-only controller and single authenticated preflight supersede the
older two-host steps in this dated record. The source correction is prepared in
an isolated worktree; the original unfinished worktree remains untouched.

The finite dependency correction pins patched MCP1.30.0 and pip26.2.1, retaining
unmodified Semgrep CE1.179.0 and all other original audit pins. PyPI metadata for
Semgrep1.179/1.180/latest1.181 still declares MCP==1.29.0; ordinary resolution
therefore cannot install the patched SDK. The complete-lock installation has one
explicit constraint override, verified by the new installed-graph validator and
four positive/adversarial Python cases. The actual isolated graph passes89 package
and141 dependency checks; changes, duplicates, missing dependencies and any other
constraint conflict fail. Every full installer and the existing advisory engine
invoke that validator. Python/npm vulnerability reports remain mandatory; no
advisory exception or vulnerable SDK version is admitted.

The first copied local venv inherited system packages, and strict graph checking
correctly rejected duplicate IDNA. Disabling inherited system packages, installing
all exact pins and removing only two orphaned local old-pip installer markers
produced the verified isolated graph. The scanner version-only command tried an
unneeded upstream version network check and was blocked; actual scan commands
already disable metrics/version checks. These setup observations are not security
or release acceptance.

Writing baseline16d4b1cd / tree c026f8e3 uses artifact
`fdf7e37cb7546ad0a44fad1086514003fade13a37edca084ddd7e00070187350`.
The retained local Lighthouse baseline is289ms TBT. A separate CPU×4 diagnostic
observed one146.5ms room/palette preparation inside a224ms first projection stage,
followed by50.3ms painting, with9,398 vertices and2,901 submitted shapes.
This attributes cost to existing world/projection/renderer owners; it does not
select a quality reduction, changed budget or new runtime implementation.
The first four causal trials could not launch dynamic debugging and retained zero
measurements. A verified explicit local debugging port with the existing pinned
headless153 executable corrects the setup; all four original normal/no-ribbons/
no-canvas-draw/thematic-off controls are now collected sequentially without other
benchmarks/scanners. Raw failures remain failed and diagnostic-only.

Self-review only. Staging, identical-tree merge and full/native/device/rights/
independent/settings/live-origin/recovery acceptance remain pending. Scope anchor:
[#39 continuation](https://github.com/oborskyivitalii/oborskyivitalii/issues/39#pr81-integration-and-ready-delivery-20261016).


### Dependency compatibility and bounded performance disposition

The real unmodified Semgrep1.179.0 scan completed on225 source files with zero
findings/errors using the patched SDK; pip-audit completed89 dependencies with
zero vulnerabilities. The four graph-verifier regressions pass. These are dirty
preparation checks; frozen-head prepublication will bind them to the final source.

Two complete unprofiled private normal/no-formula observations measured159.5ms
and91ms TBT. A separate normal/ImageBitmap-cache pair measured129ms and282.5ms.
The bitmap change is rejected; no authored runtime, motif, glyph, layer, quality,
clock or cache bound is changed. Instrumented CPU-sampling results and the two
failed WebSocket observations remain diagnostic-only. Earlier local289ms and
native235.5ms failures remain failed. Fresh exact-source staging, followed by
full production medians on its separately frozen edition, determines admission;
none of these local trials is relabelled as a hosted pass.

Compact JSON-LD now gives Writing95,111bytes (previous99,933) and Credits83,927
bytes, preserving every structured value and complete visible/legal content.
The source-contract preservation check reverses only the exact approved Color
selection paragraph; every other authored/runtime byte remains checked against
its original immutable baseline. Native current-source performance remains open.


## Exact checksum triage and trusted installer integration

PR82 supplies the required main workflow installer under this same issue. Its
head1261077b / tree6e127392 passes current Ready source536/536, navigation/RI and
owning checks. Preview smoke and protected merge are pending at this observation.
The candidate retains the full PR40 feature policy and adds AUDIT-GRAPH; the
narrow prerequisite policy does not replace feature acceptance. All active
transitive-extra constraints are checked:89 packages/143 dependencies, only the
exact Semgrep1.179.0/MCP1.30.0 declaration override, no CVE waiver.

The regenerated candidate has215 new static entropy fingerprints, rather than
the older112. Individually prove every exact path/rule/hashed literal before
appending to the existing publication ledger. Preserve every original row and
separate ledger, dynamic RI/CI verification and full actual scanner execution.
The clean observation is edf877d / its recorded tree; the compressed
[proof](2026-10-16-public-checksum-proof.json.gz) contains every public value,
source-bound method, scanner report digest and finite operator recipe.

The unchanged checksum helper cold-rebuilds/checks public output, snapshots,
previews and the offline bundle. Recorded editorial fragment SHA256 values are
recomputed from their exact adjacent UTF-8 texts. Historical runtime/withdrawn
snapshot hashes are recomputed from actual Git blobs; two superseded PR68 refs
were absent locally, verified through GitHub commit metadata and fetched by exact
SHA. That recovers the actual historic runtime digest rather than guessing from
later formatted code. All nine selected editorial assertions match immutable
PR68 tree blob IDs, object types and current file bytes. This evidence supplies
secret triage, not new runtime/rights/editorial or independent release acceptance.


## Compact metadata and ledger reconciliation

PR82 is merged at9d8e99f5. Full owning execution6ed433e retained three failures:
FLIGHT-TELEMETRY expected the prior active fingerprint, and actual production/
migration consumers rejected the unknown producer-bound identity. Cold immutable
16d4b1cd and prepared ed3e997a builds prove every runtime file identical in plain,
staging and production, including immutable copies. Independent Python JSON/
SHA256 derivation confirms base73ab5373, plain80cda941, staging2c543a78 and
productionb848de73. PR83 head7f54f7ea / treec333c494 registers only exact future
plain/staging metadata in trusted main; its hosted checks remain pending here.

The full PR40 branch retains all earlier tuples and complete feature checks,
adds the exact production identity and frozen-rights membership, and updates only
two current-source fixture expectations. The adjacent inert compact tuple proof
now covers all three editions; it supplies no independent human review or hosted/
production acceptance. Historical fixtures and all budgets remain unchanged.

Local merge preparation f33cd3d caught reconciliation errors before admission:
main's catalog reintroduced16 obsolete generated paths, and selecting the main
publication ledger omitted404 original PR40-specific rows. Remove only stale
generated catalog entries. Restore every original PR40 row unchanged, append
all newer exact IDs, and retain six identical-disposition main reason variants
verbatim in the adjacent compressed ledger-merge provenance. Add an owning
append-only assertion for all original publication rows and exact unchanged
baseline ledgers. No reviewed reason, disposition or scanner finding is discarded.
The initial RI build failed visibly; regenerate and verify before clean admission.
Append only the independently proved production fingerprint after reconciliation.

Repeat all failed full owning assertions and complete unchanged prepublication
on the final clean source. Earlier Writing TBT and external release gates remain
pending actual fresh native evidence.


## Final local owning result before frozen publication

PR83 merged at321b7066 after successful current source/RI/owning and preview
checks. Clean integrated d3fef9d6 / tree9f436442 passes all17 full owning checks,
including the three previously failed identity/production/migration assertions,
independent three-edition hash derivation and complete original secret-ledger/
advisory-policy preservation. Original Writing/native failures remain pending.
The new immutable original-PR40 baseline literal is separately checked by actual
pinned detection and Git object verification before an exact ledger append.
Freeze the final review/memory bytes, run its exact-source preflight and Ready CI,
then request ordinary one-host staging. No full release criterion is newly closed.
