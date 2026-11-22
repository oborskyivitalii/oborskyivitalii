# Issue213 — independent White-box QA, first c360 pass

Reviewer: `/root/issue213_whitebox_initial`; distinct nonauthor task; explicit fork none requested by parent. This execution read no current peer report, author conversation, or unrelated private notes. Initial task included a proposed fixture-isolation remedy, treated here only as a hypothesis tested against actual fixture/production structure. Provider model/context internals remain unknown. No source/test modifications, external writes or delegation. Only this report is written.

## Inspected identity and outcome

Native candidate `c360fd6d083b314cdf67e9f2843ff4b6f4057b56`, tree `38e4292b9070738be9c9870a44e593f9037ac9ba`, original base `3877546d29a04f235f9ec0f3175f4e0d90bfd60d`. Initial and final Git working tree clean. All 103 supplied manifest entries independently checked against bytes (including absent deletions); manifest digest matches parent-supplied `e1559992daec4bd84fa1c34d6956e26f0e8fb8780c0db17719841acad6e0403e`. Local refs inspected; no live GitHub, PR, hosted preview or release state independently asserted.

**Verdict: hold test/advancement acceptance pending fixture correction and fresh affected review.** No production closure regression was found in the bounded checks: actual 164-file public artifact verifies, and every one of the original base's 120 immutable public files remains present and byte-identical. The inherited synthetic fixture graph is inconsistent with its own isolated publication inventory. Current committed-source SEO CLI now succeeds; this does not erase the retained earlier failure. No whole issue AC is passed by this report.

Read: root README/AGENTS/REPOSITORY-MAP/MEMORY and applicable CONTRIBUTING, site source/style/check-profile owners; common/White-box prompts; supplied intent and issue AC01–06; actual c360/base diff; changed SEO guard/template/amendment, test/acceptance/profile mapping; fixture catalog and article preparation/retention tests; snapshot/artifact/build/retain sources; current publication/material/recovery declarations. Root AGENTS is the only applicable AGENTS found. Historical preflight review files were not used as verdict or oracle.

## Risk → case → oracle → actual matrix

| Risk / AC | Structural scenario | Independent invariant / oracle | Actual execution and result |
| --- | --- | --- | --- |
| Research allowlist swallows unrelated changes / AC04 | Exact approved Research link, forged baseline/digest/scope, altered destination, unrelated outside text | Only the exact immutable before/after fragment on Research can reverse; all unrelated output remains comparable | Existing `discovery link reversal...` PASS; additional actual normalized Research copy/destination in-memory faults remain unreconciled, PASS |
| Fresh CLI lacks new guard dependency / AC04–05 | Clone current committed HEAD; changed Home source/current HTML; then stale Home HTML | Current source must accept; stale approved Home output must reject, with no missing amendment file | Existing `fresh SEO CLI...` PASS at c360, including status0 valid and status1 stale assertions; earlier raw 162-case ENOENT preserved |
| Synthetic inventory retains real native links / AC04–05 | Isolate legacy external catalog and delete all actual publications | Fixture graph must match its declared catalog; every local href/src remains in complete manifest | Original eight snapshot failures inspected; fresh selected retention cases both FAIL at retained Control Theory → missing Thinking Systems alias |
| Production/public artifact closure / AC04–05 | Verify real c360 docs, not synthetic subset | Actual manifest bytes and all local link/resource closure must match; real native graph remains intact | `artifact.verify('docs', artifact.manifest('docs'))` PASS, 164 files |
| Closure assertion loses force / AC04–05 | In-memory remove selected native alias; separately remove old R12 PDF manifest entry | Missing current alias and retained resource each reject; no accepted-source modifications | Missing current alias rejected by `missing article alias`; missing retained R12 rejected by `snapshot dependency missing`, PASS |
| Material source/review binding and invalid input / AC03–04 | Change source/file/label/evidence; campaign files, traversal, symlink, MIME/size; malformed PNG | Old approval cannot follow changed binding; unsafe/unproved material cannot enter public graph | Three selected existing article-materials cases PASS |
| Actual PDF user activation / AC03–04 | Actual selected R13 download, then append iframe to same target in memory | One immutable, digest-verified PDF, referenced once by ordinary anchor; no embedded duplicate | Actual `reading-r13.pdf` link validated; added iframe rejected by `one native link`, PASS |
| Old open pages/recovery resources / AC05 | Compare every immutable file at original main with current docs bytes | Retention must preserve actual previous bytes and names, rather than merely satisfy current generated graph | 120/120 immutable files present and byte-identical to `git show 3877546:docs/...`, PASS |
| Exact redundant historical PDF removal / AC05 | Read ZIP member directly and compare to removed baseline PDF bytes | All three deleted PDFs recover exactly; ZIP SHA256, member SHA256 and byte length match manifest | 3/3 byte-identical recoveries, PASS; no extraction to tracked files |
| Browser/history/mobile/no-JS / AC04–05 | Actual hosted reader/navigation/PDF journey | Source verification cannot establish browser interaction or served identity | Not observed/blocked in packet; no hosted/mobile/no-JS pass claimed |

## Findings and correction conditions

### WB213-01 — Medium, blocking affected source-test acceptance: synthetic graph combines incompatible inventories

Evidence: `tests/site-articles.test.cjs:27–53` copies the complete current `site/`, calls `isolateLegacyCatalog`, and removes real publication sources/assets. `tests/fixtures/catalog.cjs:79–96` remaps only `index/research.json` and `research/lenses.json`; it omits the new `research/research.json` source URL. The helper also leaves the complete real production retained directory/manifest intact. `tools/site/build.cjs:239–261` imports every retained member after byte verification. Thus current Research still references the SDLC native alias after that publication was removed; older retained Control Theory HTML still references the Thinking Systems native alias after that publication was removed. `tools/site/snapshot.cjs:249–261` correctly rejects those absent closure targets. These are genuine invalid generated fixture graphs, not evidence that the production closure oracle is obsolete.

Original evidence `/tmp/issue213-review/focused-current.tap`: 162 tests,153 pass,9 fail,0 skip/cancel/todo. Six article cases fail first on Research → SDLC; two retention cases fail first on retained Control Theory → Thinking Systems. The fresh bounded run independently reproduced both retained-snapshot failures at `tests/site-articles.test.cjs:779` and `:901` through `retain.cjs:8` → artifact/snapshot verify. A failure stops before later assertions, so those retention/staging guarantees currently have no executed pass.

The proposed fixture isolation is structurally justified, subject to these concrete conditions:

1. Restrict the change to explicitly synthetic fixtures. Resolve every fixture-owned native publication link in its actual structured source against that fixture's declared publication catalog. At minimum include `site/content/pages/research/research.json`; do not replace arbitrary HTML strings or alter production sources to remove the real SDLC link.
2. A synthetic fixture which deletes the real publication inventory must also start with a coherent fixture-owned retained graph. Clearing the copied production `site/retained` directory at synthetic preparation is reasonable: build explicitly permits absence, and these cases create their own historical snapshots. If any existing retained input is deliberately kept, retain its entire actual dependency closure with exact bytes; deleting selected manifest entries while leaving files or rewriting immutable snapshots is invalid.
3. Make the source inventory and matching generated/cache seed coherent before the one-time fixture build. Avoid per-test cleanup that prunes the fixture's own history after its `retain()` calls. Do not change `snapshot.verify`, alias inventory rules, digest checks, current/retained HTML link closure, article download rules, staging isolation, or assertion accounting.
4. Preserve the existing meaningful retention sequences: accepted rename `:772` creates accepted synthetic publication → build → actual retain → rename → assert all previous immutable bytes remain → stage and assert old HTML/runtime excluded while media survives. Unrelated article test `:894` creates two publications → retains generated graph → changes/removes one → verifies the other's version/bytes/reuse, unrelated room identity and cold/incremental equality. These cases establish fixture-owned historical state independently of production retention seeds; preserve every assertion and `snapshot.verify` call.
5. Preserve selected-public-material case `:418`, default draft/privacy `:611`, native reader closure `:640`, links-only download `:675`, rename/delete cold equality `:748`, and unrelated rebuild `:1161` assertions. After correction execute the affected article fixture file, then current-source selected mandatory suites as allocated by the parent. Keep the first failures intact and obtain a fresh independent correction reviewer. A helper fix has broader consumers; inspect every direct helper caller before accepting it.
6. Keep an actual production graph verification and real previous-source immutable comparison alongside synthetic coverage. This first review supplies bounded actual checks; it does not remove maintained content/release source or hosted gates.

### WB213-02 — Informational: prior CLI ENOENT is source-timing evidence, not a current c360 failure

`tests/content-rendering.test.cjs:174–224` clones current committed HEAD and then overlays a small explicit checker dependency list. The original run occurred before the new amendment was committed; hence its clone had no `review/issue-213/content-amendment.json` while the overlaid checker loaded it at module initialization (`tools/check_site_seo.cjs:206`). At committed c360 the same existing test passes, including its actual stale-body negative assertion. Do not suppress the dependency load or stale-body check. If this fixture is expected to test uncommitted checker work, make its overlaid dependency set complete explicitly; a clean committed-source run already establishes the current result.

## Executed commands and retained observations

Bounded Node selection (exit1; 7 tests,5 pass,2 fail,0 skipped/cancelled/todo):

```sh
node --test --test-name-pattern='fresh SEO CLI|discovery link reversal|source, file, label and evidence changes reject|working campaign files|selected public PNG|accepted article rename|editing or removing one article' tests/content-rendering.test.cjs tests/executive.test.cjs tests/article-materials.test.cjs tests/site-articles.test.cjs
```

Raw selected result:

```text
PASS source, file, label and evidence changes reject old public review
PASS working campaign files, traversal, symlinks, wrong MIME and oversized files reject
PASS selected public PNG material requires a bounded actual IHDR before hosted decode admission
PASS fresh SEO CLI accepts current authored Home text and refuses stale approved body bytes
PASS discovery link reversal preserves its immutable predecessor and rejects unrelated or forged changes
FAIL accepted article rename retains source history while staging isolates HTML and preserves media
FAIL editing or removing one article preserves unrelated article and platform snapshots
Both failures: snapshot dependency missing article-snapshots/59ff20803833d9228a2cd1ef68058787e10f96bb41e3818e61889fcced95a052/ai-governance-is-control-theory.html → articles/thinking-systems.html
Tests7 pass5 fail2 cancelled0 skipped0 todo0; duration6874.161737ms; exit1.
```

Additional commands were read-only stdin Node/Python probes, not installed tests. Node computed SHA256 for all supplied candidate manifest paths, then called `artifact.manifest/verify` and `snapshot.verify` on cloned in-memory records with missing native-alias / retained-PDF entries. The initial combined probe exited1 after those four successful observations because its added Research copy fault used an absent label (`AI code crisis and the SDLC imbalance`); the explicit `assert.notEqual(bad, html)` caught that the injection had not occurred. This was a diagnostic target mistake, not a product failure or passing mutation. Corrected probe selected the exact `record.changes[0].after` fragment, asserted its presence, changed its actual `AI code crisis` label or destination, then proved each drift remains unreconciled; exit0. Both attempts are retained here rather than claiming the initial command passed.

Python read all three `pdf-recovery-manifest.json` originals with `zipfile.ZipFile.read(member)`; compared member bytes directly with `git show 3877546:<originalPath>`; verified archived byte count, member SHA256 and ZIP SHA256; verified deleted original path absent. Exit0:

```text
R26 1409937 cac17363fd3b0d4005f6a849e293397a8271b0dd980261f4db5fc35558fa50fd
R27 1412004 2f5fde5749b6cc294f1026d293df5aa0c9cc645ea7d3cba0ca3c5e9194414ad6
R28 1415489 c715bbe933095708934d45f23e21d1d0830f53dce845bf7b08a80dac1c19b718
```

A final Node read-only probe obtained base `git ls-tree -r --name-only 3877546 docs`, filtered with the actual `snapshot.immutable` predicate, compared every current byte with `git show` baseline bytes, then exercised actual R13 `snapshot.downloads()` and duplicate-iframe fault; exit0:

```text
all prior immutable public files present and byte-identical:120
actual R13 one user-activated PDF:article-media/a967d35ecd0b16674bbafb2dcf4f02e2bbc33aa51b6780fccf6fc5057fed93ec/reading-r13.pdf
negative actual R13 embedded duplicate rejected
```

## Allocation and limits

The seven selected existing cases belong to permanent `content-rendering`, `executive`, `article-materials` and `site-articles` source modules. Their maintained registry is `tools/quality/test-profiles.json`; `guides/SITE-CHECK-PROFILES.md` owns content update/PR-source and later hosted/staging allocation. Issue213 `DISCOVERY` currently selects executive + article-materials through `test_issue213_acceptance.py`; it does not alone replace site-articles fixture/content coverage. The bespoke source-bound negative/current-artifact/recovery probes are targeted manual White-box evidence under this issue, not a new permanent suite or workflow. No entire mandatory campaign was replayed, no coverage percentage measured, no assertion weakened.

This review does not establish author/editorial publication approval, detailed visual PDF parity, browser history or hosted/mobile/no-JS behavior, Google-selected canonical/indexing, query demand, equal finalized measurement windows, production activation or issue closure. Actual hosted/release and author gates remain open. Fixture correction has not been implemented or dynamically proven by this reviewer; only its required ownership/closure conditions are derived.

## Input identities

```json
{
  "agents/reviewers/README.md": "725c8432ec1f2fea9a61cdbaba01d32676778b3e83b7a73fe2faea422b4ea0a8",
  "agents/reviewers/white-box-qa.md": "832762ea95a540fd6fce09d9ca75084ac3573ee100dd67081d99ba7ac528596f",
  "/tmp/issue213-review/c360-manifest.json": "e1559992daec4bd84fa1c34d6956e26f0e8fb8780c0db17719841acad6e0403e",
  "/tmp/issue213-review/c360-review-request.md": "20dca0e6ace5e3fba02b9479ef1aee7e62ad28d688a3c8cb73c176175667b162",
  "/tmp/issue213-review/request.md": "37a4a05b39d17a3c391f8fabe65ce266d03b77a3237ffe5d15511e79ee9866d9",
  "/tmp/issue213-review/issue.md": "1f339ae4a36e7621b73e9ee56e5e18709b6cf062d0267a80c1f094095a8838f8",
  "/tmp/issue213-review/focused-current.tap": "5ebd3bef7b686985ee7f30f76b708ab8e0779cb0c34d3b42a7ab753881791600"
}
```
