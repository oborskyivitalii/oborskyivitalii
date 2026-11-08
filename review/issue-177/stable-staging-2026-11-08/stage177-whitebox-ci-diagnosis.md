# White-box QA — correction-phase CI diagnosis

2026-11-08. Role `/root/stage177_whitebox`. This is correction-phase reconciliation after the preserved first independent result `stage177-whitebox.md`, not a new fresh-context review. New input: parent-supplied failed source-admission run42514298606/job128833845609 and verified raw acceptance report. No peer verdicts consumed, accepted source/tests edited, external writes, or delegation. Actual accepted spawn/isolation receipt remains orchestrator-owned; provider internals unknown.

**Finding WB-CI01 — High, source-admission blocker (AC01/AC07): issue177 is absent from dependency-install selectors.** Both ANALYTICS and BASIC fail on the clean candidate58d89a5b71b41ea995e4b327d07b4052d309ccfa/tree4f52b4a6162fb548d0d4d7446e7d6063d486fb77. The workflow must prepare the complete selected-check dependency closure before retry. Fixing only the first missing parser would expose further deterministic dependency gaps. The first verdict was conditional on successful admission; that condition is now demonstrably unmet. This does not establish an analytics runtime defect or completed stable staging.

## Exact evidence and observed versus inferred failure

Raw report `/workspace/scratch/e4946ebfb0ba/ready-acceptance-failure/issue-acceptance.json`, independently hashed SHA256 `250a909895f7a163eb8528d911932e32a19bde16b94e661b900b0b20fd450869`. Parent supplied artifact13630896846, ZIP SHA256 `c84ef7029e52079495502c8ccaa33400da96a121759f883f900dfb19f05101e9`; I read/hash-checked the extracted report, not the ZIP. Report: evidence_validtrue; source_dirtyfalse; ANALYTICSfailed, BASICfailed, RIpassed, RI-CIpassed, STYLEpassed. All broader external gates pending.

Fresh `github_fetch_workflow_job_steps` for job128833845609 confirms dependency steps5,6,7,8 all skipped; check step9 failed; report upload step10 succeeded. Thus missing dependencies are an actual workflow selection failure, not an inferred account/network outage.

Observed first cause in both checks: `tools/publishing/article.cjs:347`, “Publisher dependencies are missing; run npm ci --ignore-scripts in its toolchain”. ANALYTICS report shows four failed wrapper modules (analytics/site-articles/preview-smoke/quality) and two successful wrapper modules (staging-regression/staging-gate). Its retained detail truncates deeper case output: do not derive complete native case accounting or claim observed YAML/Pillow failures from this truncated aggregate. YAML/media absence below follows independently from source and skipped steps, with bounded tests confirming their required behavior.

## Complete tooling allocation for ANALYTICS and BASIC

| Tool/dependency | Actual consumer and necessity | Existing setup owner |
| --- | --- | --- |
| Node24.19.0 and npm | Workflow pins Node; all six ANALYTICS Node modules and BASIC build/export/focused tests use it. Publisher declares Node>=24. | Existing setup-node, already successful |
| Git plus complete checkout/history | Acceptance exact source/tree/cleanliness; accepted article source provenance; analytics fixtures clone shared Git objects. Not supplied by an npm install. | Existing checkout fetch-depth0, already successful |
| Python3 stdlib including venv | Acceptance unittest runner and guards; media helper; analytics.test.cjs:590 creates an empty `--without-pip` venv as a negative. | Runner Python plus existing Python parity venv step |
| Publisher AST packages: unified11.0.5, remark-parse11.0.0, remark-gfm4.0.1, remark-stringify11.0.0, and locked transitive closure | article.cjs:341–356 explicitly checks all four; ast.mjs imports them. Site-articles hook compiles fixtures; preview-smoke:569 artifact.build compiles current catalog; analytics builds real hosted/offline fixtures; BASIC starts `build.cjs --check` and exports Color, also compiling accepted catalog. | `npm ci --prefix tools/publishing/toolchain --ignore-scripts` |
| Quality Node lock, specifically yaml2.9.1 | quality.test.cjs:1213–1217 parses workflows/action through common.toolRequire('yaml'). Lock contains yaml2.9.1 via eslint-plugin-sonarjs. No guaranteed system/global package can satisfy this owner-scoped require. | Existing quality `npm ci --prefix tools/quality/toolchain --ignore-scripts` |
| Canonical Pillow13.0.0 and bundled WebP1.6.0 in the selected Python | Current article profile reader.images=webp-lossless; articles.select→article-media.render→encode→web-media.py checks exact Pillow pin and WebP version. analytics.test.cjs:545–613 directly executes real copied media producer, verifies missing-PIL and missing-pin failures, and selects SITE_MEDIA_PYTHON or quality venv/bin/python. BASIC current catalog compilation also renders these media. Parser-only installation is insufficient. | Existing combined publisher-acceptance step installs canonical `web-media.py --requirement` into quality venv, whose path is the consumer fallback |

No Chromium/Firefox/WebKit binary or Playwright browser download is required by these selected source checks. ANALYTICS tests build fixture bytes and use controlled browser/page objects; actual browser launch is in CLI/hosted paths not invoked by the policy method. Publisher/quality npm locks include Playwright as part of existing declared toolchains; installing those locks is sufficient without browser installation. No full Python scanner/advisory requirements install, live collector access, Cloudflare credentials, or network report query is required. Ruff/PyYAML/packaging are not direct runtime requirements identified for issue177 ANALYTICS+BASIC; installing them through the reused Python parity step is existing small setup overhead, not a reason to add a new installation path. RI/RI-CI/STYLE already passed on the runner without these skipped dependency steps.

## Minimal repair proposal — existing step conditions only

In `.github/workflows/issue-acceptance.yml`:

1. Add `env.ACCEPTANCE_POLICY == '.github/acceptance/issue-177.json'` to “Install pinned tools for selected acceptance policies” (lines37–46). This prepares locked YAML and its owner toolchain.
2. Add the same condition to “Install locked Python tools for acceptance parity” (lines47–57). This creates the exact quality venv expected by the existing media installation/analytics test fallback.
3. Extend “Install the locked article AST toolchain for publisher acceptance” (lines58–62), currently issue5-only, to issue5 OR issue177. It already installs BOTH the locked publisher npm tree and the canonical Pillow requirement into that venv.

Retain all existing policy selectors and commands. Do not also add177 to the issue159 parser-only step (lines63–65): that would duplicate parser installation and by itself omits required media. Do not edit tests to waive missing dependencies or install only remark packages by hand. No new action, toolchain, global pip install, browser install, or broad workflow run is necessary to address this cause.

The existing media step obtains its pin from the canonical requirement, not a duplicated Pillow literal; `article-media.cjs` selects the venv interpreter automatically when SITE_MEDIA_PYTHON is unset, and the copied-media test uses the same fallback. The publication-media composite action also prepares canonical media for hosted jobs, but adding that action is not the minimal source-policy repair: the current combined acceptance step already provides the required pinned library/codec path. The source policy does not impose a new exact Python patch requirement; hosted action Python3.12.14 remains its separate owner.

## Bounded executed checks and next verification

Inspected actual policy, workflow, all six selected module dependency paths, BASIC build/export/focused-test paths, publisher AST loader and lock, quality lock, article-media/web-media owners and current article profiles. Existing local dependencies observed: YAML2.9.1; the four publisher package versions above; quality venv Pillow13.0.0 and WebP1.6.0; SITE_MEDIA_PYTHON unset. These describe the local environment, not the failed clean CI runner.

Executed on unchanged candidate58d89a5b, repository cwd:

```sh
node --test --test-name-pattern='actual analytics browser fixture builds its real hosted|copied analytics media producer needs|every article-compiling job prepares' tests/analytics.test.cjs tests/quality.test.cjs
```

Exit0; tests3, pass3, fail0, cancelled0, skipped0, todo0, duration7581.866661ms. The real fixture build exercises hosted/offline producer closure; copied-media test positively encodes through selected interpreter and rejects empty-PIL environment/missing canonical pin; workflow test requires locked parser/media before its covered release-job consumers and exercises missing/late/conditional/fail-open setup negatives. Its present workflow scope does not include issue-acceptance and therefore did not catch the missing issue177 selector. This is a useful surviving check, not proof that the proposed condition edits have already run.

For the implementer after the three condition additions: parse workflow YAML and evaluate the selected conditions with issue177, issue5, issue159 and one unrelated stdlib-only policy. Require177 to execute quality npm→Python venv→combined AST/media before checks; require159 to retain its existing parser-only behavior; require unrelated policy to remain skipped. Use a small condition-selection regression in the existing workflow-test owner if adding coverage; another nonauthor must review any newly authored test. Do not weaken policy or budgets. Refresh required RI/catalog identity after source changes.

Then run the unchanged issue177 policy exactly once on the corrected clean committed candidate, retaining all five checks and native accounting. This is the smallest complete reproduction of the failed owning admission, rather than rerunning full staging/source/performance campaigns to discover sequential setup omissions. A local environment with preinstalled dependencies is not proof of clean-runner setup; use the existing acceptance CI job on the corrected candidate for the decisive installation/admission receipt. Keep failed42514298606 evidence, compare exact new source/tree and inspect failures before any further retry. Only after source admission and affected independent review may the orchestrator resume the already authorized staging route; this diagnosis supplies no promotion/merge/production approval.
