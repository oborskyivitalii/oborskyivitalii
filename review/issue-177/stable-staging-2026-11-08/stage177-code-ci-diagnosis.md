# Code review continuation — actual source-admission failure

Role: `/root/stage177_code`, nonauthor Code reviewer. Date: 2026-11-08. This is a targeted diagnosis after my preserved first result, not a replacement fresh-context judgment. New inputs are the actual failed report/run and the proposed scope of a prerequisite-only workflow fix. No peer verdicts were consumed; no implementation, tests, external writes or delegation performed.

## Result

**Blocking integration defect confirmed:** issue177 selects ANALYTICS and BASIC but `.github/workflows/issue-acceptance.yml:37–65` does not install their required locked dependencies for that policy. The actual source-admission job skipped every dependency-install step and both checks failed at the publisher AST dependency guard. Successful preview/prepublication checks cannot substitute for this missing required source-admission result.

The proposed prerequisite-only correction is appropriate, with **Pillow required, not optional**. Add issue177 to exactly the existing quality Node install, Python-venv install and publisher-plus-media install conditions. Keep the issue159 parser-only condition unchanged; including177 there would duplicate the parser install and still omit media if used alone. No changes to checks, selectors, accounting, permissions, guards, tool versions or budgets are needed for this defect.

## Evidence and source binding

- Candidate HEAD still `58d89a5b71b41ea995e4b327d07b4052d309ccfa`, tree `4f52b4a6162fb548d0d4d7446e7d6063d486fb77`; clean working tree at inspection.
- Failed current-source run42514298606, job128833845609. Fresh GitHub job-step fetch independently confirmed all four dependency setup steps were `skipped`, criterion execution was `failure`, report upload succeeded.
- Fresh job logs independently identify exact candidate checkout and `ACCEPTANCE_POLICY=.github/acceptance/issue-177.json` selected before execution. This is a selected-policy preparation defect, not ambiguous owner selection.
- Read actual report `/workspace/scratch/e4946ebfb0ba/ready-acceptance-failure/issue-acceptance.json`, independently computed SHA256 `250a909895f7a163eb8528d911932e32a19bde16b94e661b900b0b20fd450869`.
- Report has source commit/tree above, `source_dirty:false`, policy SHA256 `d46a129e3eccca6125758a72a588e8064334e200a309415be5adac7c9f6caf18`, `evidence_valid:true`, `automation_pass:false`, no runner errors. ANALYTICS and BASIC failed; RI, RI-CI and STYLE passed. Valid failure evidence is not acceptance.
- Parent supplied artifact13630896846 and ZIP SHA256 `c84ef7029e52079495502c8ccaa33400da96a121759f883f900dfb19f05101e9`. I independently inspected the extracted report and live job identity/steps/logs; I did not independently download/re-hash the ZIP.
- The report's ANALYTICS stack fails in `tools/publishing/article.cjs:347` during `tests/site-articles.test.cjs` setup via `build.build` → selected article load → AST compile. BASIC fails at the same publisher guard during `tools/site/build.cjs --check`.

## Dependency audit

Inspected the policy, all six explicitly selected ANALYTICS modules and BASIC's actual no-argument entry path. Followed candidate static literal-import closure across122 source files and separately inspected dynamic compiler/media subprocess boundaries and test-driven execution. Import reachability is not the same as invoking every exported browser helper. The effective dependency inventory for these selected checks is:

| Consumer / boundary | Required dependency | Actual owner and reason |
| --- | --- | --- |
| Both checks and runner | Node24.19.0, Python3 stdlib, Git with full immutable history, checked-in source/assets/generated baseline | Existing checkout/setup-node and Ubuntu runner. Accepted publication provenance, fixture historical catalog and shared clone depend on real Git objects. Existing `fetch-depth:0` must remain. |
| BASIC: `local.cjs` → `build.cjs --check`; ANALYTICS: native article admission, actual analytics fixture builds and preview-module imports | Locked publisher Node AST packages | `tools/publishing/toolchain/package.json` and lock: unified11.0.5, remark-parse11.0.0, remark-gfm4.0.1, remark-stringify11.0.0, plus their lock transitives. `article.cjs:341–358` verifies exact installed versions; `ast.mjs` dynamically imports them from the publisher toolchain. Install with the existing publisher `npm ci --ignore-scripts`. |
| ANALYTICS: `tests/quality.test.cjs:1212+` workflow/setup-contract test | Quality Node toolchain, specifically YAML parser | `common.cjs.toolRequire('yaml')` resolves from `tools/quality/toolchain`; current quality lock includes yaml2.9.1. It is a transitive lock dependency and is not available from an absent install. Existing quality `npm ci` supplies the reviewed graph without a new package declaration. |
| BASIC: native article generation/export; ANALYTICS: compiled article fixtures and media preparation/negative tests | Pinned Pillow13.0.0 with libwebp1.6.0 in the selected Python interpreter | Current article profile declares `reader.images:webp-lossless`. `article-media.cjs:10–31` launches Python and `web-media.py:17–36` reads the canonical requirement, imports PIL and verifies both Pillow and codec versions. Existing requirement command resolves the one `pillow==13.0.0` line; no new or guessed pin is needed. |
| ANALYTICS: `tests/analytics.test.cjs:548–612` | Real `tools/quality/toolchain/venv/bin/python`, containing pinned Pillow | This test explicitly selects `SITE_MEDIA_PYTHON` or the root venv interpreter, creates an empty negative venv, verifies absent-PIL failure, verifies successful actual encoding with the selected interpreter, removes/restores the copied requirement pin and verifies recovery. Installing publisher Node packages alone necessarily leaves this dependency unresolved. Existing Python install step creates the required interpreter; existing publisher-plus-media step installs Pillow into it. |
| BASIC: theme/archive focused tests, geometry, public syntax, workflow-artifact namespace check, snapshot/budget checks, Color export/flight tests | Node built-ins and checked-in sources, plus shared publisher/media dependencies above | Examined `local.cjs:132–174`, `checkColor`, export paths and focused modules. This no-argument Basic route does not call full prepublication scanners or Python audit suite. |
| ANALYTICS: staging-regression/gate/preview helper tests | Controlled mocks, checked-in source/fixtures, Node built-ins | Browser orchestration tests inject fake launch/measurement callbacks; cold analytics fixture tests explicitly stop before browser execution. Imported browser helpers contain deferred tool loads; no actual browser/PDF launch is required by these source checks. |

Existing Python parity step also installs ruff0.16.10, PyYAML6.0.3 and packaging26.3. These are not the initial observed failure and are not substitutes for Pillow. Reusing the existing step is a bounded way to create the interpreter expected by the selected tests and preserve established acceptance parity. There is no reason to install the full security/advisory Python requirements graph for this policy.

No additional browser binary download, OS browser dependency setup, live Cloudflare SDK/collector, network scanner, PDF renderer, paid provider or secret is required by these selected source checks. The ordinary source helpers must continue to use controlled vendor/isolation fixtures. `npm ci` installs package graphs; browser execution remains a different gate.

## Minimal proposed treatment (not implemented)

1. At `.github/workflows/issue-acceptance.yml:38–45`, add exact policy comparison `.github/acceptance/issue-177.json` to the existing OR condition for the quality toolchain install; keep all existing entries.
2. At lines48–54, add that same exact policy comparison to the existing Python-venv condition; keep commands and pins unchanged.
3. At line59, extend the existing issue5 condition to `issue5 OR issue177`, using the established folded YAML condition style as appropriate. Preserve both existing commands: locked publisher npm install and canonical Pillow requirement install into the created venv.
4. Leave the issue159 parser-only step, policy selection, exact-source run command, timeout, zero-skip accounting, report upload and permissions unchanged. Do not mark either failed check passed or rerun the unchanged failed environment.
5. Update required generated RI/CI source identities after the workflow change. Validate the workflow/policy conditions and affected source/RI routes, review the actual focused correction diff independently, then execute exact-current-head source admission with these prerequisites. Success remains a new observation; this diagnosis does not prove a future CI pass.

## Execution-control and staging effect

This is an execution-control change: `tools/quality/delivery-routing.cjs:145+` includes `.github/workflows/`. Even a three-condition prerequisite correction changes what candidate code executes in admission; it must be reviewed and source-bound. Its bounded impact is enabling existing locked installation commands for one already-selected policy. It does not change ownership selection, check selection, pass/fail interpretation, external permissions or publication authority.

The existing route stays applicable. `tools/staging/admission.cjs:4–47` requires latest successful **pull_request** runs/jobs at the exact open PR head for site-checks, navigation and owning issue acceptance, with Draft=false. Current failed run42514298606 refuses staging admission; a successful manual acceptance dispatch alone cannot replace that PR evidence. Existing evidence-only `staging-regression` does not update the stable alias. A new candidate invalidates old source-bound admission, and any requested stage must authenticate the new current head through the existing protected-main controller.

The conservative full website route remains required for this mixed analytics/workflow candidate. `guides/SITE-STAGING.md:175–196`, `delivery-admission.cjs:399–427,501–507` retain explicit full control-diff review and owner `reviewed_sha` equal to the final full head where the change-admission gate applies. A changed workflow is not a technical-repository exemption. This correction supplies neither that owner attestation nor merge/production authorization, and it must not alter controllers to bypass a missing gate.

## Finding disposition and limits

**High / release-blocking, AC01 and AC07:** incomplete setup predicate in issue-acceptance.yml fails required ANALYTICS+BASIC source admission on actual clean CI. Proposed treatment above closes the preparation defect without weakening their oracle. Actual rerun and final independent correction review remain pending.

The original first review remains intact. Its readiness was explicitly conditional on actual required source admission; this observed failure now makes advancement blocked until corrected and verified. I did not implement the proposed correction, simulate a fresh clean CI installation, launch another campaign or claim any unobserved pass. Requested versus accepted isolation and unknown provider internals remain as recorded in the first review.
