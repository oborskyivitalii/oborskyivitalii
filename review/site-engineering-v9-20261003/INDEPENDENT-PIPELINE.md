# Independent pipeline review — #13

Reviewer: independent agent `runtime_review`, separate from the implementation agent. Date: 2026-10-03. Scope: release tooling, quality regressions, site workflows, capture producer and prepared deployment dependency. Core runtime is reviewed separately in `INDEPENDENT-RUNTIME.md`.

## Outcome

The current source corrects the concrete blockers raised in this review. Public files are packaged once, probes consume copied bytes, and the aggregate rejects incomplete, failed or mismatched evidence. This is source/tooling review, not release acceptance: real browser/OS runs, performance calibration, fresh visual inspection, physical phones and host checks remain pending.

## Checks actually observed

- Independently reran all four quality tests successfully, including complete passing PR and full-release fixtures and controlled failures. Separate probes reject boolean capture hashes, omitted functional assertion details, repeated soak windows, nonfinite elapsed time and an altered Lighthouse viewport.
- Constructed a complete passing **controlled full CLI fixture** under temporary storage, using copied public files and expressly fake browser/device/job/capture records. Changing uploaded capture bytes then fails; changing the source commit fails checked-out-source validation. A separate missing-lint-report case exits 1 and retains a source-bound `release-manifest.json` with `pass:false`, error, jobs and `deploymentAuthorized:false`. These fixtures are not actual browser/device evidence.
- Actual copied public bytes pass artifact verification. Wrong trusted build digest, changed public bytes, HTML exceeding 100 KB while preserving its fallback, and a public symlink fail.
- Independent default-toolchain lint passed with 32 files, including five Python files, and the one exact contrast-tool complexity exception. The independently observed Semgrep run covered 34 files with zero findings/parser errors; Bandit covered five project Python files / 566 LOC with zero findings/errors after excluding installed dependencies. That overall security run correctly failed at stale RI verification during edits. Final regenerated-RI security and remote CI remain implementer/CI follow-up; no final green security run is claimed here.
- Independently ran the current scanner self-test successfully: an isolated Git fixture root permits the real docs-scoped rule to detect the controlled HTML sink, and detect-secrets detects its deliberately nonfunctional credential-shaped value. The fixture is removed afterward.
- Matched the initial 1,228 unique baseline IDs across 38 paths to known JSON checksum/hash fields or the public Writing article URL. The final baseline has 1,231 entries: ten new IDs replace seven old IDs. All ten additions independently match current file SHA256 values: eight v9 review metadata fields and the configuration/lock advisory guards. This is exact current-tree classification, not Git-history scanning or a blanket entropy exclusion.
- The npm lock has 296 non-root records, matching direct package bindings and integrity metadata; Python has 88 fixed-version entries. All braces dependency paths are under Stylelint. Independently compared the documented Lighthouse profile settings against both actual pinned configuration constants; they match. No browser/performance run was launched by this reviewer.

## Source contract and corrections

The build records source commit/tree, candidate and every public file's SHA256/raw/gzip sizes; rejects symlinks; and enforces HTML, SVG, asset and total-route transfer budgets. Whole-tree dirtiness covers tooling changes, with narrowly ignored install/output paths. The CLI checks its own Git HEAD/tree and trusted build public digest, then requires successful jobs, unique reports/platforms/profiles and matching source/artifact identities. The full CLI also verifies the actual uploaded PNG/WebM bytes against the capture record.

PR checks require Linux Chromium/Firefox/WebKit: 390 scenarios across five routes, both themes, two normal viewports and eleven 320px failure/capability modes. Full checks add Windows Chromium/Firefox (40 cases), macOS WebKit (20), 30 sequential Lighthouse runs, 15 motion profiles, a five-minute soak, 20 captures and five videos. Native/device names do not substitute for actual evidence.

Confirmed source corrections include ordered probe/capability/theme initialization; the real empty Writing combination (year 2025); actual executable metadata; mandatory per-mode assertion details; forward camera movement when scrolling is possible; applied computed CSS zoom of 2 with a boolean result and separate limitation text; fresh capture views without a public-hash-only cache; and correct SVG MIME. Browser execution must still confirm these paths.

Callback summaries are recalculated from raw samples, with finite timing, actual windows and in-window callback starts. Soak windows must be disjoint and total at least five minutes. Off/reduced require zero observed callbacks/paints after settling. Security excludes the exact installed venv while requiring tracked tooling Python coverage, strips source snippets, retains hashed-only secret results before RI verification, and accepts dynamic RI hashes only after verifying the generated context.

Independent/device evidence is now **external to the candidate tree**, fixing the circular requirement that a committed record contain its own candidate commit/tree SHA. Full callers supply immutable `evidence_artifact_id` and `evidence_run_id`; the gate downloads from the same repository with `actions:read`, retains those IDs and applies strict source/artifact/device/reviewer checks. Missing evidence still fails. Inspected the pinned download action source: explicit token/repository/run lookup and a single-ID download use the expected root path. The inactive Pages example forwards these inputs and deploys the tested artifact ID without rebuilding; it does not activate hosting.

## Advisory decision and limits

The literal Stylelint code API and fixed codeFilename avoid attacker-supplied file globs; its static config has no glob overrides. Inspection of installed Stylelint confirms the code-input branch avoids file globbing and uses only a constant default ignore glob. GHSA-vfj7-8cjw-p6xm reports nested-brace recursion denial of service and no patched version as checked on 2026-10-03. The temporary exception retains the finding, expires 2026-11-03 and binds helper, config, whole lock and installed lock. This is scoped input reachability, not a zero-vulnerability claim; no independent fresh npm/pip feed pass is claimed.

Primary sources: [GitHub advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [Playwright init-script order](https://playwright.dev/docs/api/class-browsercontext#browser-context-add-init-script), [pinned download action source](https://github.com/actions/download-artifact/blob/37930b1c2abaa49bbe596cd826c3c89aef350131/src/download-artifact.ts).

Real native browsers, physical iOS Safari/modest Android Chrome, baseline/candidate performance calibration, soak/capture outputs and visual acceptance remain required. Synthetic visibility/print/context loss and CSS zoom keep those limitations. Host/TLS/ZAP and deployment activation remain #8. Home HTML changed after the core-runtime report to protect the portrait SVG at 320px without CSS; its current hash is below, while its new visual/browser acceptance is pending.

## Reviewed material identity

Snapshot base Git HEAD: `e5454660cdb422d56918c5268a05911e3f735e2f`; base tree: `a8b78b22c6944dd063efa03c244f74cb53bc0128`. The working tree contains the reviewed implementation/documentation changes, so it is dirty. These SHA256 values identify reviewed bytes; final committed-candidate CI and subsequent evidence must be recorded separately. The review's own file and generated RI are excluded to avoid circular/stale hash records.

| Material | SHA256 |
| --- | --- |
| `.github/workflows/site-candidate-evidence.yml` | `4f29bb722c296a012d79850b504f2a47369f450a0449f65804a277369ca5406e` |
| `.github/workflows/site-checks.yml` | `ebeef4adfb93fca15f282f49f010886033d768dde7a04b655fc557fc3974421d` |
| `.github/workflows/site-release-checks.yml` | `240fa8331d2114f90f4ba96a91ea78a12732cc16437f26c7f5c225ac0f458e72` |
| `.github/workflows/site-runtime-checks.yml` | `bbf485e8f1c4aa70725c9670fc192a700030479cc282b1fd2098d70fcbc3849b` |
| `AGENTS.md` | `cfd61d61db9b4c6080a237e526fa14b7a71384768930946ac2267329832a8596` |
| `SITE-RELEASE-GATES.md` | `f9fa1f92be4d61440abe44d2a5353edea349ff4a65698477189c37a1b5fb940b` |
| `docs/.nojekyll` | `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b` |
| `docs/archive.js` | `5b11a8e0fd8f2ecbed57809ea956ee3470148aac604e64decc188ba8f755209c` |
| `docs/assets/favicon.svg` | `c28b28c5d6b61a89612c8aa1b3c787ff855e25e3e9dd69e9fbd0569e0da89a6e` |
| `docs/assets/vitalii-oborskyi-cutout.webp` | `4fa21ced928b1e79db5e0f8105fecb2a1052a9e27c40e3eba97fd7cbb72181ae` |
| `docs/assets/vitalii-oborskyi.jpg` | `5321e48f08b075cb1cbd522d0f36bc01276aece65d1a04cf09102aa5dd2b59bc` |
| `docs/credits.html` | `8eea1be637105d748097082de95c5f3ff8f2613244d21bd9b32bc19ccb59a4ef` |
| `docs/index.html` | `56f377bf21c08ca6d33b9c3c59377088bed2055bc85d7cd19b611f2e4e3da821` |
| `docs/research.html` | `5c4742788e46848beda3a2d8b768fb582a39b00bc217d174deb856cc8c835303` |
| `docs/space.js` | `8c6c95a1a94a9d993388fb451a29b223953d1da33b7562dc27977f32beeb1f42` |
| `docs/styles.css` | `19601a62e3d2aa3e275618af69394a3e4aaddc12c428529540efb4cf6e69bebf` |
| `docs/talks.html` | `6827088f21c88a4963bd2af8ce984491e295e66434980032a2cde3d773ef557c` |
| `docs/theme.js` | `a1987c61608672a1643289efaf3238ab315ad47b54b704fa04884d20ec479cd8` |
| `docs/writing.html` | `c21f050be92fc1f5d26eaf3f61d3a43179f2f23f0ed7b890965fa945ef3ee3d3` |
| `review/site-engineering-v9-20261003/DEPLOYMENT.md` | `636aeb79071d58d5b0ee3df148ca26624fff422de088fc1c4501fe1f8fe75f1a` |
| `tests/quality.test.cjs` | `8d2ed0ab85b2146c8e4f2564c3b3549969c64df37ac7168fd65ead783502f6b1` |
| `tools/capture_site_review.cjs` | `6d4c8552f67b87924b29e4dfe2e7d91974fb87d8a98db7d3a2a4466ae6125cc9` |
| `tools/quality/README.md` | `63e4f4fca8045d0c344e6fd7474033b4092200ab6f93493f16f4e3a34716a1fb` |
| `tools/quality/advisory-exceptions.json` | `3e8e02cd4871d81f04562c7709fd7f875f7ac7f45dfc9df0b9317d4eba218e1f` |
| `tools/quality/artifact.cjs` | `09d984fc08866d452206bc419529eccb9fa14b169a76b389575ce7f43ddcc265` |
| `tools/quality/budgets.json` | `c7f35f0390d472d5a943ff134d193969cab37b6f582f3766efe71012e9e0904b` |
| `tools/quality/common.cjs` | `7b0374883514dda1384f66645b3a5a19a7d63dcd704a9aa8fda2b081b4254799` |
| `tools/quality/deploy-pages.example.yml` | `0765b00108a729455751759b998282d4d09b013cbf99104f7acd8dd18d44d939` |
| `tools/quality/eslint.config.cjs` | `5b2b82d8943aa01ee6608aaa4936a98f2f615565533c7b9bf002163abb336bb6` |
| `tools/quality/exceptions.json` | `4c4ad9578157a01f59eda2f51ce232dbbbe9dfc4811646ab8bb7dd903eea57cb` |
| `tools/quality/functional.cjs` | `3db380e687aa154d77165f6a0feb62082faa5de60a29163e926b01461cf64522` |
| `tools/quality/lighthouse.cjs` | `5cce47babb0d8428350b994d2946b5b22d24e07bb67d2c848e2386dec99dcdd9` |
| `tools/quality/motion.cjs` | `16c79776533727aa635754bd3eb9e79a19a809e42ebc07877738acbbcb99d4a6` |
| `tools/quality/scanners.cjs` | `61fba3e843ae310426f85023c9a8ee72ba650233f1df3a8524e90903c9b75060` |
| `tools/quality/secrets-baseline.json` | `4bcd19c997caf37b9e1007717e471908589eb10292562f5bb64a7d8665eb0084` |
| `tools/quality/security-rules.yml` | `2fcea6e6de768e226d25778ed5bd3d4eb984016699af929ed06068d833c8fac3` |
| `tools/quality/selftest.cjs` | `fcbeb77c5404ab195430eeb05e955e33ebb8433fe44a9f47c28a3ee6a1ba06b8` |
| `tools/quality/serve.cjs` | `ae1fde8fdfa36b56d417c1c35a2bee79ad4ee4d7b4faf327b919e3bc1cccd693` |
| `tools/quality/stylelint.cjs` | `6bbef04bce4367aa2072be9216a8ca53ccf8429926b4a9588fa1917210a6b1d5` |
| `tools/quality/stylelint.config.cjs` | `813c64be2b3e0224234cd89eeb836cd8195b73af4b55623d13abc4931dd0be94` |
| `tools/quality/toolchain/package-lock.json` | `54466f796f3295144bdb2df71087988e13aa3886bf9cfede6f37a4f918b61052` |
| `tools/quality/toolchain/package.json` | `2d19024075cdf77d7cbc017d109922c85c26952461440d87db07ef88f4420c3b` |
| `tools/quality/toolchain/requirements.txt` | `6ffc757fae57f9ba6c53bd0eff83d9ebb495791a6c0ca8b221bbcc28f8d001b8` |
| `tools/quality/triage-secrets.py` | `5a3ef05811b6643f51a25616ed368be01f5bcc56814691c88fc939db802ddfa0` |
| `tools/quality/validate.cjs` | `cc61c9ba74792d484b4d6d70385eccd192f9f06c1f6585750b0b685a71b3c9a4` |
