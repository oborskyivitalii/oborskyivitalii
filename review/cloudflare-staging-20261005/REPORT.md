# Cloudflare staging execution — 5 October 2026

Owner intent: #8 asks for a hosted whole-site review environment; #13 retains
the full automated and production acceptance gates. The maintainer's current
request authorizes staging configuration and uploads. Production GitHub Pages
remains disabled.

## Result

The review edition is deployed at
[the immutable preview](https://505498da.oborskyi-author-ci-staging.pages.dev).
Cloudflare reports a successful **preview** deployment, ID
`505498da-a176-4f26-a4c4-6c891ee7dead`, in the existing dedicated Direct Upload
project `oborskyi-author-ci-staging`. Its production branch remains
`production-disabled`; there is no Git source, Functions or injected analytics.
No owner setup is needed to view this edition.

This is an authorized manual bootstrap from verified basic CI artifacts. It
does not claim that the protected-main Actions path or complete hosted profile
ran. The stable `staging` alias has not been promoted, no production release was
performed, and #18 remains Draft while its recorded idle/cold Writing failures
are unresolved. The optional Color comparison remains an offline review edition.

## Exact source and package

- Source: `51611505d941ae2996a87782840da418722451f6`, after PR #24; its changes
  from `5020f05` are documentation/derived RI only. Public bytes are identical.
- Successful basic run: [37380498377](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/37380498377),
  attempt 1; public artifact `11372983963`, gate artifact `11372849111`.
- Both downloaded ZIP SHA-256 values were checked against live GitHub artifact
  metadata before extraction. The package builder verified the successful gate,
  source/tree, complete public inventory, file hashes and local links.
- Public digest: `324c09ff0526fa2664e34c9f590d550ca7f6613ed53a9862d85e679b12e8df60`.
- Staging package digest: `deb2dd16c6efea1eee83df5d01ba954376b16ab9a8e9d8fab6f3e332e0b3d261`.
- 31 recorded files, approximately 1.15 MB. Host additions are only `_headers`,
  `404.html` and `_staging/revision.json`; no repository/research/review files
  were uploaded. [Package record](evidence/staging-package.json).

The provider connection created a short-lived Pages upload token. Asset upload
used it through hidden process stdin; no token was printed, committed or saved.
The deployment manifest and host configuration were registered through the
connected API. A permanent Actions token was not created or exported.

## Concurrent state reconciled

The first preview used `oborskyi-site-staging`. During the work, that project
acquired external Git integration with `main` production and automatic builds;
PR #24 independently prepared `oborskyi-author-ci-staging` as the dedicated CI
project. The current execution reread both projects, preserved the first one's
external work, and reused the already-created compatible CI project. The final
deployment uses its newly verified successful source artifacts. Historical H2
preparation is retained; current runbook evidence supersedes its absent-preview
statements. No project was deleted or converted.

## Validation and limits

The actual HTTP smoke passes 28 file/hash/MIME checks plus root/query redirects,
noindex/nofollow, cache policies and the exact 404 document. The evidence directory
retains the actual provider, HTTP and bounded browser results. All 20 browser
views pass: five routes in both themes at 1440 and 390 px,
including persistent header/Canvas, history, Writing filters, footer Credits,
ambient animation, Motion Off and absence of analytics resources. The provider
user-agent is not a verified underlying browser build or a physical-device
claim. The complete three-engine/native/security/performance/capture suite and
recovery demonstration remain pending; smoke cannot replace them.

Local ten-test basic checks and 14 focused staging/trust/reporting tests pass.
An independent code review found and resolved two reporting gaps: failure of
candidate recording now finalizes the failed attempt, and a failure before
promotion no longer falsely blames a completed full profile.

A live Cloudflare 404 uses `Cache-Control: no-store`. The hosted checker now
accepts this stronger storage prohibition for mutable responses, while rejecting
missing/weak policy, qualified no-cache and immutable mutable responses. The
immutable tier still rejects no-store. Exact returned 404 bytes and noindex
remain required. This corrects the provider compatibility check; no performance
budget is relaxed.

## Changes and remaining owner action

The two staging pause guards are removed under current authorization. Repository
opt-in, exact protected-main source/artifact trust, environment protection and
the successful full gate before stable promotion remain. A smoke-verified
immutable URL is retained even if later checks fail; failures never become stable
acceptance. No production workflow or public site byte changed in this PR.

[SITE-STAGING](../../SITE-STAGING.md) gives exact owner dashboard links, secure
environment-secret installation, account/project variables, main protection and
enable-last order. GitHub's installed connector has no administration/secrets/
environment write or dispatch tools. H1 and this continuation are on #18's
candidate branch, not main; integrate infrastructure separately after review or
finish #18's performance work. Do not merge failing #18 to expose staging.

#8/#13 remain open for repeatable automation, stable/full acceptance, recovery
and the separate production requirements. Viewing the current preview requires
none of that setup.
