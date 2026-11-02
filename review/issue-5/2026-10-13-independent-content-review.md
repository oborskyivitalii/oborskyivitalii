# Issue 5 — 2026-10-13 independent content-release source review

Owner: [issue #5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5).
Execution: [PR #79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
Reviewer: `independent_content_review`, a separate agent inspecting the implementation;
this is independent source/architecture review, not human editorial or device acceptance.

Initial inspected state: explicitly dirty prepared worktree on
`e830752f58535c9e2226550a9661ee51c745bdb3`, whose committed tree is
`b3e197dfa681702d9f14a74ac93da6e433de20e4`. Neither that baseline's green CI nor this
review establishes clean final-head admission. The inspected current platform engine is
`0bd39d2137c0b6ea2c9066c849573f22741a100098814f923f8022b07d46475a`.

## Intent and acceptance

The 13 October owner instruction makes PMDay a technical test artifact and defers the
real article until its author-approved chapters are supplied. The owner authorized the
simple Writing count and independent static content release. Review focuses on AC13–AC15
and the existing AC03/AC07/AC08/AC11/AC12 isolation, identities, reader and delivery boundaries.
Static complete HTML, one coherent package, unchanged budgets and separate release decisions
remain. Original issue #2 editorial/publication criteria are not accepted by this review.

Read root instructions, site/check/style/release/acceptance owners, the dated content-release
plan, all changed catalog/build/navigation/artifact/source-profile/workflow contracts,
related maintained tests and the bounded Color allowlist changes. Generated output and
authoring fixtures were inspected as outputs; no production or browser surface was changed.

## Findings

| ID | Evidence/path | Finding and implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | `validate-catalog.cjs:176–217`, `content.cjs:76–109`, `render-records.cjs:128–197` | One validated ordered entry collection now produces rows, year controls, ItemList and count. Alternate links stay inside their primary row; candidate listing is separate. The previous manually enumerated year templates are removed. | AC13 | Resolved; source design acceptable. |
| F02 | `build.cjs:364–413,599–675` | Article versions use own inputs and explicit translation groups. Routes depend on actually linked article snapshots. A dedicated page-template baseline fingerprint admits platform changes without invalidating unrelated document identities in ordinary incremental generation. | AC14 | Resolved; add/edit/remove and unrelated-byte tests are meaningful. |
| F03 | `navigation.js:255–342`, `snapshot.cjs:121–181` | Hosted root pages no longer embed a global article registry; articles embed only their initial descriptor. First navigation admits a bounded compatible manifest and pins it once. Missing, foreign, stale, duplicate, unsafe or cancelled manifests retain native fallback. | AC08, AC14 | Resolved; manifest and actual navigation fallback negatives added. |
| F04 | `artifact.cjs:203–280`, `candidate-source.cjs:44–125` | Raw-only reuse initially lost prior deployed Color/staging snapshots. Final composition now carries the verified decorated immutable closure, rejects collisions and preserves old resources after slug rename. Exact source reconstruction recomposes the same SHA-bound baseline and delivery layers instead of weakening equality to tolerate arbitrary extra history. | AC14 | Resolved; retained-byte and substituted baseline/declaration/source negatives added. |
| F05 | `content-release.cjs`, `public-artifact.cjs` | A deferred artifact import initially introduced an authored dependency cycle. A shared leaf byte-inventory owner now removes it; orchestration remains explicit and output/cache/lock use the existing transaction owner. | AC11, AC14 | Resolved; no computed-import evasion or guard exception introduced. |
| F06 | `content-baseline.cjs:86–159,163–308` | Successful Draft packaging alone initially qualified as a baseline. Selection now requires actual successful raw-head Basic, RI and owning-admission jobs, exact source/tree and archive/generation bindings. Compatibility or absent evidence chooses an explicit full build; corrupted declared bytes fail. | AC15 | Resolved; skipped/failed/cancelled admission and wrong-tree/archive negatives added. |
| F07 | `local.cjs:167–220,245–286`, `source-tests.cjs:624–672`, `site-checks.yml:67–85` | Optimizing only the artifact command left ordinary Basic/package checks rebuilding the entire platform. Canonical unconditional CI commands now dispatch to a formally validated content route, run its complete mandatory suites once and verify exact intrajob execution. Content package proof omits the full builder only after verified content reconstruction. | AC15 | Resolved; dispatcher mode, incomplete identity and partial/skipped execution negatives added. |
| F08 | `test-profiles.json:69–105`, `source-tests.cjs:296–410`, `content-baseline.cjs:174–179,214–223`, `content-baseline.test.cjs:515–621` | Broad page-JSON selection initially conflicted with the release's Writing/Home restriction. Policy now matches that boundary. Canonical generated docs and publication path inventories have bounded owner/role/shape rules; RI bookkeeping may change only its identity hashes while preserving every policy field and input path. A real added external record/new year, canonical build and actual RI refresh now exercise this ordinary positive flow. Shared catalog-label changes still choose full generation. | AC15 | Resolved in source; classifier admission depends on the separate unconditional RI gate validating stamp freshness. |
| F09 | `check_site_seo.cjs:206–331`, `writing-catalog-amendment.json`, `content-rendering.test.cjs:354–431`, `executive.test.cjs:144–218` | Normalizing entire generated regions against mutable producers could silently normalize new renderer/template semantics. Normalization binds the exact 15 producer inputs and proves current catalog data before restoring the frozen authored frame. Its four finite JSON-LD encodings preserve the exact wrapper; arbitrary whitespace, duplicate/injected metadata and replay of a historical ItemList after the catalog changes remain rejected. | AC13, AC11 | Resolved; producer/output drift and actual builder-wrapper negatives are meaningful. |
| F10 | `content.test.cjs:34–75,629–689`, `tests/fixtures/catalog.cjs` | Existing assertions rejected valid undated local entries, multi-author bylines and escaped query URLs. Generic edition/schema assertions now support those forms; historical external-edition fixtures are explicitly pinned rather than assuming all future live records remain external. | AC13 | Resolved; combined ordinary collection fixture covers the promised future forms. |
| F11 | `color-motion-contract.cjs`, `color-motion-contract.test.cjs` | The first new Color proof became stale after producer helper refactoring. The new family was refreshed from complete current-source bytes; the original 18 tuples remain unchanged. Canonical and immutable script hashes still select exact identities and reject mixed older archive/navigation bytes. | AC11, AC15 | Resolved; independently reverified refreshed complete artifact bytes. |
| F12 | `check_site_seo.cjs:597–612` | The generated renderer compatibility marker initially caused historical head comparison drift. The restoration removes exactly one head-local `site-article-renderer=1` spelling and separator; a duplicate or another value remains visible to the frozen comparison. It introduces no broad metadata wildcard. | AC11, AC13 | Resolved in source and owning agent's focused executive execution. |
| F13 | `content-fixture.cjs:103–227`, `content-fixture.test.cjs:75–146`, `local-browser.cjs:141–199`, `serve.cjs` | A temporary source copy cannot verify already accepted Git-pinned articles without its objects. The explicit synthetic browser diagnostic now uses an isolated shared Git clone and preserves live accepted sources, while rebuilding only its synthetic draft and Writing. Its report identifies dirty synthetic bytes and denies full-gate, production and deployment status. The diagnostic tests exercise a real committed manuscript/blob; the print observation compares actual rows and the current count label. | AC14, AC15 | Resolved in source; a managed run remains diagnostic evidence only. |
| F14 | `site-articles.test.cjs:28–49`, `article-offline.test.cjs:149–176`, `site-engine.test.cjs:14–31`, `build-cohesion.test.cjs`, `analytics.test.cjs`, `content-release.test.cjs:94–126`, `content-baseline.test.cjs`, `article-candidate-source.test.cjs:15–77`, `tests/fixtures/catalog.cjs` | Isolated permanent suites inherited the live catalog before deleting its publication owners or losing their Git provenance. The first accepted local article would therefore fail unrelated content tests. Synthetic route/article fixtures now declare the frozen external catalog; generic real-catalog assertions remain live. Candidate-source preserves local Git objects and overlays the entire frozen PMDay technical fixture only inside its temporary owner, keeping later author acceptance independent. | AC13, AC15 | Resolved in source; controlled future-local execution is separately recorded below. |
| F15 | `analytics-browser.cjs:10–15,174–178,240–265`, `analytics.test.cjs:341–413` | The executed future-local probe exposed the actual analytics browser diagnostic compiling its live catalog in a temporary root without Git provenance. A shared local clone preserves real commit/blob objects before the existing live owner copy and build. Its count uses the canonical validated collection and queries only archive rows; no legacy external seed or publisher bypass masks the live diagnostic. | AC13, AC15 | Resolved in source; the cold-preparation test stops at an explicit browser boundary and cannot claim browser acceptance. |
| F16 | `offline.cjs:104–115`, `analytics-browser.cjs:249–277`, `analytics.test.cjs:360–398`, `site-release-checks.yml:312–360,403–420,529–546` | A canonical native article activates the offline producer's publishing adapter, which was absent from its cold copy. The collector copies that canonical owner and installed locked parser closure. Linux/native/staging callers fetch source history and install the parser from its lock; tests require exact owner/lock bytes and an isolated Git root. | AC15 | Resolved in source and the owning agent's observed-publication cold probe, with the canonical hyperlink retained. |
| F17 | `site-release-checks.yml:558`, `quality.test.cjs:264–272`, `staging-regression.test.cjs:20–28` | New synthetic diagnostic uploads initially collided across release profiles, and the live Color staging fixture still expected an older reviewed runtime. Upload names now include the profile; stripping it triggers the unchanged namespace guard. The fixture selects the exact current content family while preserving descriptor/native/variant/hash negatives and every historical admission tuple. | AC11, AC15 | Resolved; owning agent reports 32/32 focused checks and 70/70 unique namespaces. |
| F18 | `issue-acceptance.yml:36–54`, `test_issue5_acceptance.py:72–80`, `check_site_seo.cjs:12,70–74`, `format-parity.cjs:151–168`, `ri-ci-map.json:252–269,432–465,655–656` | Actual clean-head owning CI exposed a missing installer dependency: WritingCatalog's canonical SEO parity spawns the quality venv Python, but issue5 installed only the publisher AST toolchain. A separate Python installer covers issue5/41/58 using the existing exact Ruff/PyYAML pins; issue41/58 alone retain quality npm, and publisher npm stays issue5-only. Strict helper failure, clean/source binding, checks, limits and pending human gates remain unchanged. | AC11, AC13, AC15 | Resolved in source and actual 50dda owning CI: all ten check rows passed, with twelve human gates still pending. |
| F19 | `check_site_seo.cjs:246–265`, `security-rules.yml`, versioned first Semgrep failure | The first labeled-stage static scan matched its broad shell-exec sink against a pure RegExp loop. A one-line `html.matchAll(tags)` iteration replaces `tags.exec(html)` while preserving the global regex's starting index, nesting depth, first balanced close, replacement span and assertions. The regex's mutated lastIndex is not observed later. | AC11, AC13, AC15 | Resolved in source; this reviewer executed seventeen exact before/after output/failure comparisons. Owner reports 53/53 focused checks; targeted Semgrep scanned the changed file with zero findings/errors. No rule, exemption, coverage threshold or budget changed. |
| F20 | `generated-checksums.cjs:104–150,623–769`, `scanners.cjs:603–637`, `site-release-checks.yml:280–285` | Manual ledger entries for regenerated checksums would force ordinary content changes back onto the platform route. Automatic authority now requires complete canonical generation/preview/offline freshness, explicit computed fields, every occurrence in an approved span, exact path/type/hash/line and unchanged source/file bytes. Only the private factory can mint authority. The heavy static caller installs the existing locked publisher parser; Basic/Preview do not invoke this cold proof. | AC11, AC15 | Resolved in source; genuine current proof admits all 186 new generated candidates. Wrong owner, rule, line, stale/forged proof, arbitrary filename, extra JSON and same-value prose/payload negatives reject automatic authority. |
| F21 | `generated-checksums.cjs:152–166,209–460`, `quality-sources.test.cjs:1284–1517` | Selected-only publisher proof initially stranded retained frozen v1 fields after v2. Current strict publisher validation proves local source/semantic/adaptation/asset/translation/launch fields and exact committed Git pins. Retained records require exact ancestral bytes and a complete selecting context validated by current code. Inert blob extraction preserves regular Git modes, existing asset bounds and additive shared-commit dependency caches. The original 50-article, 200-record and 100 edition/event-changing-commit limits remain; metadata-only changes do not consume the last limit. | AC14, AC15 | Resolved in source and executed synthetic probes: accepted versions/adaptations survive 101 metadata changes; two owners sharing a freeze commit work; historical 120000 PNG blobs reject. Preparatory/orphan/incomplete historical contexts receive no automatic authority. |
| F22 | `generated-checksums.cjs:168–197,281–319,388–393`, `quality-sources.test.cjs:1455–1488` | Inherited Git routing could redirect temporary config/ref operations into the original repository. A further independently demonstrated `GIT_CONFIG` variant survived the first fix. Final code rejects routing/configuration variables before publisher collection and sanitizes private subprocess environments, including case-insensitive configuration prefixes. Hooks/templates are disabled and historical checkout is absent. | AC11, AC15 | Resolved at final helper `56e34f3b…`; owned-fixture negatives preserve outside configuration and original HEAD/config bytes. No unsafe environment probe was run against the repository. |
| F23 | `navigation.yml:25–30,41–42`, `article.cjs:330–342`, actual ebd Navigation failure | Navigation also runs the new publisher checksum regression but omitted its parser installer. It now runs the existing locked `npm ci --prefix tools/publishing/toolchain --ignore-scripts` after pinned Node, before unchanged profile/gate tests. Read-only permissions, full history, Draft condition, clean-source checks and five-minute budget remain. | AC11, AC15 | Source fix acceptable; owner reports local 70/70. Actual ebd failed 69/70 for missing parser; fresh corrected-head CI remains pending. |

No unresolved source-design blocker remains in the final inspected diff after these
follow-up fixes. Complete current-head check execution remains pending. This review does
not mark release, editorial or physical-device criteria complete.

## Source and byte evidence

Prepared-source review digest: `4c0418ad7c4d0994ebda18fc89e9a720465be7e8d3fd2a250bb64c5bd0d96b86`.
It is SHA256 of compact JSON of sorted `{path, sha256}` records for the 74 changed/deleted
authored paths under `site/`, `tools/`, `tests/`, `guides/`, `.github/workflows/` and
`.github/acceptance/`, plus `review/issue-5/writing-catalog-amendment.json`; deleted paths
have `null` hashes. The comparison anchor remains
`e830752f58535c9e2226550a9661ee51c745bdb3`, including the already committed implementation
and its later installer correction. `site/output-lock.json`, generated public/offline outputs, the RI views
and this review file are excluded. Subsequent source edits invalidate this review identity.
The initial 68-path digest `f7e073750e657cf85e0c453cc1ef434b764814320fcc5bd17adf1de9f0deece8`
was the reviewed implementation subsequently committed as `a775acde6e328eafd752ff5713d3f1b59001fb4d`;
the new workflow dependency correction supersedes that review scope without changing the platform engine.
The installer scope digest `72b43424da046bfc3f8078498e68c8bd1d8155c42c13484dfc2985c7d2741428`
was subsequently committed as `50dda95157d1994b0d935135bf8ff905910fcd05`.
The earlier 69-path iterator scope was
`fb7c8bf05c9c44772fea5366d366d1dc2d26d624a46f7279cbbf8a76bfa7db54`; its checker SHA256 remains
`5cce1e0c85a7d6034f700711a687dcda6bfc5c1688104b9fab12fab0e3be6a7b`.
The preceding 73-path scope, `2f56bafa00895750f34e81cc7d39d1e26a17ffe339563c6f22d5beb0b1d92612`,
was committed as `ebd668955293918f69b040b7a70df04c29630bd9`. It includes F20–F22's maintained proof, scanner/test/profile,
locked static installer, guide and exact literal-ledger changes. Final helper SHA256 is
`56e34f3bf3cbc8db1ac6d3a04d955ec835db6c3cb48844b315bd9fad781182e6`, scanner SHA256
`fddd39af2a298641c6077f9742c9db897cfff8f399e503ff9fff6eff03639470`, and maintained test SHA256
`2e3fc6122f4713e15ade24502cfc7e92131bdd5f3decf415048a2e6dfbe99700`.
The current 74-path scope adds only F23's Navigation installer, SHA256
`9949c0a29dd2a8885374b4ae523edef0caab355263ce66fd53efcd4fcf8b11ef`.
This prepared worktree is on ebd; no complete corrected-head CI is claimed.

The reviewer actually executed read-only `artifact.verify`, Color `motion.select` and a
current-source platform-fingerprint comparison on both complete refreshed artifacts:

| Artifact | Runtime fingerprint | Complete public digest |
| --- | --- | --- |
| Current plain Color | `89c395df74b1e626735d0757f9572836fd2d3365b2deefe31b7ca46982cd219e` | `4e022851f7f2511ec29621dbe5bafb9ddf75b671c6a8f486d0caac8373c33130` |
| Current staging Color | `dfa648a40b6218f1a6b881db08c518af0b7f50a22dd06994eb988a9c947146b7` | `a2e20307c438532b0926c4fecceac1c7345886f8055f581700d0fdb9e0aa53c6` |

Both bind the current engine above. Their canonical and immutable navigation SHA256 is
`b798fd75ba58f2b4e4cfec97b0c65275f3ffd006b23c04f4d53d9273c19b9c2a`.
The earlier `9377a50d…` producer proof is superseded, not current admission.
Owning agents supplied focused local execution reports of 78/78 article/Color checks,
35/35 catalog/SEO checks, 18/18 executive checks, 33/33 final baseline/profile/fixture checks,
12/12 content/candidate checks, 32/32 namespace/staging checks and 11/11 analytics checks,
with no skips in those reported runs. The combined 33-case run includes the three synthetic
fixture cases. The reviewer read the meaningful cases but did not rerun these suites.

The builder agent separately exercised all 71 source cases with a genuine committed
accepted local article and a 30-record catalog; 71/71 passed after the provenance fix.
Its final canonical publication probe derives `metadata.published=2026-10-12T00:00:00Z`
from a validated synthetic event, selects the observed HTTPS canonical in
`offline.context().canonicals`, and retains that hyperlink in ordinary Writing output.
The cold-preparation case passed 1/1 in 2.035 seconds against collector SHA256
`ca791cc13e881a3a0b056aebb1632b7954eaf637b87372ea40fabca0608ccfbc`, independently
matched to the final collector source bytes by this reviewer. All fixture events, archived
pages and source commits stayed in the temporary model; no external publication or browser
acceptance occurred.

The root's larger prepared-source attempts failed under the unchanged 180-second bound
and exposed the namespace/stale Color/analytics failures above. Focused corrections do not
turn those failed attempts into accepted complete execution. All reports remain prepared-source observations,
not accepted clean-head CI. Final Basic, source, RI/style/owning and hosted checks remain
the root execution owner's responsibility.

## Actual CI follow-up on a775

The implementation was committed as `a775acde6e328eafd752ff5713d3f1b59001fb4d`, tree
`817033e5ed0ae65c8c66cc1efcab783e2c1fc796`. The execution owner reports actual Basic source
CI passed 727/727 cases in 162883 milliseconds, with the three explicitly excluded baseline
files unchanged, and navigation/RI passed. This is actual CI evidence for a775 rather than
the earlier failed local attempts; it does not qualify the later installer head automatically.

The reviewer independently opened a normalized local copy of the owner's downloaded report from
[owning CI run 38399835242, attempt 1](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38399835242).
That normalized copy's JSON SHA256 is
`8b3eb9bb1697fa9bc85babeb3ab969662cfca7be572c7e88a6a2f7d825d96dff`.
The owner then preserved the exact original ZIP member in
[2026-10-13-owning-first-failure.json.gz](2026-10-13-owning-first-failure.json.gz).
The reviewer independently verified its decompressed bytes equal the original raw member,
whose JSON SHA256 is
`a750f69fd1a487cfe70dbaea134898563f5125590cb4ef13ba84f1740767b982`.
Both copies parse to the same complete report; the normalized copy is not the raw-byte artifact identity.
It binds the clean a775 commit/tree above, `evidence_valid=true`, `automation_pass=false`
and `ready_for_issue_closure=false`. Nine check rows passed; only `WRITING-CATALOG` failed,
with the canonical `tools/quality/toolchain/venv/bin/python` spawn returning `ENOENT`.
The reviewer traced that failure to F18's installer omission, not a weakened semantic check.
The immutable failed run remains recorded; it is not retroactively marked successful.

The selected-policy Python installer correction is source-reviewed. Its exact Ruff 0.16.10
and PyYAML 6.0.3 pins match the existing quality requirement owner, use `--no-deps`, and
create the exact interpreter path required by the HTML parity helper. No browser/scanner
or extra quality npm closure is introduced for issue5. The helper's strict missing-interpreter
failure remains intact. The owner reports the previously failed WritingCatalog unittest
passed 1/1 in 2.821 seconds, plus pinned formatting/YAML/guard checks. The changed workflow
is already in the RI live-overlay layer and reviewed-input identity; its fresh digest and
normal unconditional coupling verification are required before the next clean commit.

The owner also reports build/publish/smoke passed in
[preview run 38399835864](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38399835864).
The Ready event did not select the separate staging-evidence diagnostic. This reviewer has
not opened a managed content-fixture report from that run, so it supplies no extra device,
editorial or synthetic-journey acceptance here. Exact new-head source/owning CI and the
requested staging diagnostic remain pending. In particular, a775's failed owning admission
prevents it from qualifying as a reusable baseline despite its green Basic source run.

## Actual managed follow-up on 50dda

The owner reports Basic source CI passed 727/727 on clean
`50dda95157d1994b0d935135bf8ff905910fcd05`, tree
`0ac31dacd4c4cf4e9ee94d7b725f7ad07c1a52d4`. The reviewer opened the original owning report
from [run 38402723810](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38402723810),
JSON SHA256 `169375ed4d2c9dcb63187ac91614e44b30acae4ca192115d59de85fbec620321`.
It binds that clean source, has all ten check rows passed and `automation_pass=true`, while
all twelve manual gates remain pending and `ready_for_issue_closure=false`.

The reviewer independently compared the original Ready fixture ZIP member with
[2026-10-13-content-browser-first.json.gz](2026-10-13-content-browser-first.json.gz).
Both contain exact raw JSON SHA256
`acf3b56a4727123ca70580d34cc9b1642b7dfac8f15240b1ac0a7e31db5e249c` from
[Ready preview run 38402724256](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38402724256).
The uploaded ZIP SHA256 is `b468188e516c0e7b58cdca95e47d28ec278e51390a6c70569a26ed70b5249809`.
The earlier local parsed view, SHA256 `d13f19c1cd6960c717b6ed892d05854df4cf0acc1b195f92c410b4189b85f588`,
is semantically equal and is not the raw artifact identity.

This actual managed Chromium 153.0.8010.12 report records seven successful synthetic cases:
Writing without JavaScript at 1440 and 390 widths showed 29 rows and `29 articles`; the
synthetic article passed desktop/mobile normal, Off, no-Canvas and no-JS observations.
Its genuine content release rebuilt Writing and one synthetic article, reused four routes
and the `0bd39d21…` platform, and retained the prior immutable files. Parent source is clean
50dda, but the fixture itself declares `syntheticFixture=true`, `fixtureSourceDirty=true`,
`fullGate=false`, `productionEligible=false` and `deploymentAuthorized=false`.
These are real automated observations of an isolated fixture, not a publication, production
qualification, physical-device observation or human editorial review.

The first [labeled-stage run 38403412354](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38403412354)
correctly failed its aggregate because the static Semgrep scan reported one finding.
The reviewer verified the original archive's `semgrep.json` equals the versioned
[2026-10-13-semgrep-first-failure.json.gz](2026-10-13-semgrep-first-failure.json.gz): raw JSON
SHA256 `51975e27993c092ca95848e10d6de102fabea286816252035489184787dea215`, ZIP SHA256
`fab36138e2e2e1eb451df8a7c568f9b7baf160bc69448120d4e8ad7ff636704e`.
It scanned 242 files, had zero scanner errors and exactly one `node-shell-injection` result
at the pure RegExp `tags.exec(html)` on line 257. Its normalized local view's different
SHA256 `f1526ed16311505d68cb4526b11e67c6e3d8ab8757cd1f189de2f16a495db34f`
does not replace that raw identity.

The owner reports that run's source passed 690/690 Node and 109/109 Python cases, and its
host and bounded browser/performance jobs passed. The reviewer also verified the original
`stage-functional.json` member, SHA256
`b6744b4ee266ce06775645d4965c56e3496912b2f5ff8abe1cc65ff9f36182e9`, in ZIP
`ba585a58a93e501f66b9b7ff2d49f078e1fe2156dacc0e836afa6c7fb3e17069`.
It binds 50dda, records thirty passing route observations across Chromium/Firefox, two
navigation cases, ten failure cases, seven stubbed analytics cases and five article
observations, with staging scope and no full/production qualification. A second exact raw
stage fixture member, SHA256 `1a8f3593a774209f18b449ef48e6207b10e9f2e3f23b33bd04ca35fbbe140702`,
in ZIP `55783ec34ce16bc2a389dcd66ae9adcfad57174bf2fdf0139c16294cdf22ad45` independently
records the same seven successful synthetic cases. Passing components do not turn the
failed first-stage aggregate into a pass.

For F19 this reviewer executed seventeen before/after comparisons on Node 24.19.0,
using the exact 50dda function and the corrected function. Nested/sibling/empty regions,
nonmatching prefix tags, select/ol/p regions and missing, duplicate, malformed or incomplete
owners produced identical output, callback counts and exact assertion failures. The
temporary global regex lastIndex is not consumed after iteration, so matchAll's cloned
iterator has no observable difference. The owner reports 53/53 Writing/executive checks;
the reviewer opened the targeted scan showing zero findings, zero errors and the changed
source file actually scanned. The security rules are byte-unchanged against 50dda.
Fresh complete static/source/owning and staged aggregate evidence must bind the corrected
head; the earlier successful component reports are not silently relabeled.

## Checksum and ordinary-edit follow-up

A later local full-security attempt passed Semgrep/Bandit and exposed 219 untriaged
Hex High Entropy candidates. This is separate from the failed actual first-stage scan,
which stopped at F19. The reviewer independently joined the hashed-only inventory to
186 recomputed generated candidates and 33 authored/evidence/pin constants. Ten redacted
snapshot paths in the initial provenance view were resolved only through the exact current
revision, then matched by file, finding hash and line. No unknown remainder was approved.

The final `secrets-publication.json` appends only those 33 literal objects: 31 SHA256
constants and two existing Git comparison pins. All 1,554 previous objects are exactly
preserved; the ledger now contains 1,587. Its SHA256 is
`9739824fe976c72be8b7515df1d73671da02bdadbd07fadf2e1ba118fe029eba`.
The reviewer recomputed the amendment's before/after text hashes and all fifteen producer
hashes, verified the e830 comparison commit, and compared the current Color engine,
variant declarations and ten runtime-file hashes against the complete reviewed artifacts.
The 186 generated findings were not added to any literal ledger. Other literal ledgers,
scanner rules, coverage requirements, budgets and content classification were unchanged.

Automatic proof covers finite named canonical docs/lock/v11 preview fields and locally
recomputed publisher fields. It binds every occurrence, so copying a known value into
unapproved prose, an extra field, external URL or authored asset basename revokes its
automatic authority. Exact rule/line/path, private factory branding, current source plus
HEAD/tree identity and unchanged file bytes are checked. Pure collectors cannot mint an
admission proof. Historical literal dispositions retain their existing path/type/value
semantics; rejection by the new automatic proof does not silently revoke those old reviews.

Current publisher validation proves source/semantic/adaptation derivation fields, declared
local asset hashes, local translation pins, launch bytes and committed source commit/blob
identities. A retained frozen edition needs exact historical record bytes, actual selecting
metadata and a complete context accepted by the current publisher. Historical files are
inert inputs; current code and the locked parser execute. Missing nonselecting metadata is
skipped, while malformed selected context fails. Preparatory/orphan/incomplete historical
records, external references/rights hashes and publication evidence constants remain
outside automatic authority and require their own review. This is the explicitly chosen
compatibility boundary, not a promise to repair arbitrary old publication history.

The independent review team executed the final maintained accepted-v1/adaptation-to-v2
case with 101 metadata-only commits and routing/configuration negatives. It verified
unchanged original fixture HEAD/config and outside configuration. The owning agent reports
27/27 quality-source checks, zero lint errors/warnings and a targeted Semgrep scan with zero
findings/errors and three files scanned. Separate executed probes showed two owners sharing
one historical freeze context both retain their four source/semantic/Git field locations,
while a historical 120000 asset with valid PNG blob bytes is rejected before regularization.
The original publisher's finite history limits remain; no new 100-metadata-edit limit exists.

This reviewer additionally executed a complete isolated producer/private-proof diagnostic
on final helper `56e34f3b…`. It retained accepted v1/v2 records and adaptations, applied 101
metadata-only commits, changed the manuscript and launch, then made a further real adaptation
edit with its own committed source and edition. A native catalog entry produced thirty
static Writing rows and `30 articles`. Genuine content release rebuilt Writing plus that
article, reused Home/Research/Talks/Credits and runtime `0bd39d21…`, and retained 38 baseline
files. After canonical preview/offline generation, actual Detect-secrets returned 27
publisher findings across seven JSON owners; the full branded proof admitted all 27 without
consulting a literal ledger. The copied ledger and repository ledger remained byte-identical.
The proof covered 42 owners/338 computed IDs. Local diagnostic report SHA256 is
`0bc696107757cad18573578fd15b4cd34839b3be5fc6ea3dd69b020098ce1a84`, and original scan SHA256 is
`d08faf1fb57791427ad5da818f553ea58853b01e3d04b39832d725f7e2d5e71e`.
This isolated dirty fixture explicitly denies full-gate, production and deployment eligibility;
it does not qualify the current PR head, hosted CDN, physical devices or editorial publication.

The complete cold checksum proof runs only in the existing heavy security route. Ordinary
Basic/Preview content checks do not gain a hidden full build. New helper/policy/ledger edits
continue to select the platform route. Final corrected-head source/owning/static and staged
aggregate CI remains pending; passing prepared tests and this diagnostic do not replace it.

## Decisions and remaining execution

On clean `ebd668955293918f69b040b7a70df04c29630bd9`, tree
`9ee56a2c2e1613eeef2d746f232f8ee4cfd6be92`, actual
[Navigation run 38422593047](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38422593047)
failed 69/70 solely at the publisher regression with the explicit missing-dependencies error.
The reviewer opened the connector-decoded log, SHA256
`0561726d892075593b4409cefb9fbb61db372044e142e1a6120830512b675578`; this is not a raw ZIP claim.
The owner reports Basic passed 732/732 in 108950 ms; the reviewer verified its clean, passing
release-manifest bytes against the original ZIP member (JSON SHA256
`289bbe913dab03f83133cc8f184fa4738b1d70a43dc3f4150a0ed36e3db8c203`).
The exact owning ZIP member, JSON SHA256
`cb96f1817822e7ab826421811a3b57940d6d1aac48c1057a268ecc0d6f15d1d3`,
has ten passed checks, fifteen automated-pass criteria and twelve pending gates, with closure false.
Those ebd successes do not erase its Navigation failure or admit the new installer head.

The accepted implementation preserves static no-JS HTML and a complete deployment.
Raw generation reuse does not imply every final hosted alias remains byte-identical:
the existing staging/production edition binds a source head and may rewrite document
versions and staging banners without recompiling the platform. This limit is documented.

Automatic reuse is conditional on a compatible admitted ancestor artifact. Missing/expired
artifacts, changed preview selection, platform/shared-label changes and nonancestor
squash/rebase histories explicitly choose the ordinary build. Stable staging and production
retain their existing full applicable profiles and budgets. This runtime-changing PR itself
must follow the platform route; an old green run cannot admit it.

The bounded content optimization covers catalog links and accepted Markdown/metadata.
An observed-publication commit that adds HTML evidence under an article's
`site-artifacts/*.html` explicitly selects the ordinary full route. That operator limit is
documented in `guides/SITE-CONTENT-RELEASE.md`; the classifier was not broadened to treat
arbitrary archived HTML as trusted authored content.

| Task | Owner paths / expected behavior | Check | Status |
| --- | --- | --- | --- |
| T01 | Root source, regenerated outputs, RI/catalog/map and current acceptance policy | Final clean-head Basic/source/RI/style/owning checks | 50dda CI recorded; corrected-head complete evidence pending |
| T02 | Actual PR candidate Writing and reader | Hosted navigation/count plus no-JS Writing at both widths; each rebuilt article's existing capability journeys | 50dda hosted and seven-case synthetic evidence recorded; corrected-head aggregate pending |
| T03 | Owning issue/PR review anchor and source mapping | Link this independent review, clear stale ticks and keep original human gates separate | Pending root reconciliation |

`local-browser.cjs:535` conditionally runs the extra content journey only for a manifest
declaring `contentRelease`. The initial platform-changing preview therefore needs a focused
actual-candidate no-JS Writing observation or an explicitly generated content-release
artifact before reporting that extra path as exercised. The added managed local diagnostic
can exercise that path with a genuine synthetic content release. Its dirty fixture digest
is distinct from the actual PR public artifact and cannot qualify the current source,
hosted CDN, physical devices or editorial publication. No such acceptance was inferred
from source tests or byte verification.

## Acceptance evidence

| AC | Evidence reviewed | Source-review result | Remaining boundary |
| --- | --- | --- | --- |
| AC13 | Shared entry renderer, actual-row count, schema/order/year/alternate/local cases, producer-bound SEO amendment | Acceptable source architecture; initial blockers resolved | Final exact-source checks and hosted Writing |
| AC14 | Per-document identities, trusted baseline generation, preserved decorated closure, exact recomposition and rename/tamper cases | Acceptable source architecture; initial blockers resolved | Final exact-source delivery/reader checks |
| AC15 | Real prior admission, classifier/dispatcher/execution checks, complete permanent suites and unchanged release budgets | Acceptable source architecture; initial blockers resolved | Final current-source CI/profile/RI proof |

## Issue synopsis

Independent agent source review found the Writing/count and verified content-release
architecture coherent after correcting baseline admission, actual Basic/package rebuilding,
decorated retention, source-proof equality, producer-bound SEO and future local-record
assertions. Current Color bytes are independently verified. Final clean-head and hosted
evidence remains pending; PMDay stays a technical fixture and real editorial publication
criteria remain open.
