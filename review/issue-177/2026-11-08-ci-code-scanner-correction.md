# Issue177 — focused Code correction review

2026-11-08; nonauthor reviewer `/root/issue177_ci_code`. Continuation after first independent judgment; supplied correction facts reviewed against actual sources. No peer verdict read, implementation, external write or delegation. Reuses unchanged first review `/tmp/issue177-ci-code.md`.

## Verdict and identity

No blocking finding in the scanner-ledger/offline-manifest correction. HEAD remains `8371746dce7eeda64c8662a21bc82c25bf772d2d`; dirty/staged working candidate. This accepts only the exact bounded false-positive classifications and generated manifest freshness, not browser/provider/release acceptance.

Inspected SHA256 identities:

- `tools/quality/secrets-publication.json`: `ace921f2d6fadd665df7d7fdc7793928113889f9e9cf35fb235c48901e4b1b7a`
- `review/site-v1-offline-bundle-v11.json`: `333d80a953ca9e32d38ac9905310a6b649fbfc401215922efbebd5cdaef8faba`
- `review/issue-177/2026-11-08-ci-scanner-proof.json.gz`: `9a613ab883f8ac7a559aab1254b7fe8632a9279b8e097436ae8e4a126bb2e047`

Recomputed original packet hashes for browser producer, full/staging fixtures and negative tests, issue177 acceptance selection and test profiles: all six unchanged. Common/role prompt identities from first report retained.

## Independent reproduction

1. Parsed old HEAD and current scanner ledgers: every predecessor finding, reason and order preserved; exactly seven appended rows (original beacon plus six corrections). None names the stale offline-bundle manifest. Each uses an exact path/type/SHA1 identity; no wildcard or scanner exclusion introduced.
2. Recomputed SHA1 for each of the six proof values: all match the corresponding exact ledger identities; each value occurs in its specified source path.
3. Independently regenerated admitted article through `articles.select(root, [], catalog)`: `articles.editionNotice(article).digest` exactly matches `9f0596639af391652308b3bcc909bb053ba70961e3778ff0ec33d5285a944618`. Independently generated `article-materials.load` HTML contains the exact public binding `3b7ce0cdba81ee0d20c43834a9e08f16d4bdffcaef2ee9d2dadbd39cde82c3c8`. Inspected both canonical checksum algorithms: SHA256 of structured public rights/resources/material declarations, not credentials.
4. Decoded retained public HTTP bodies and recomputed SHA256: article (41303 bytes) `db7679a6b111e014ef4d248df5a1a5f2033ded2eac2ccb0d79a67a6f89b20915`; analytics (1447 bytes) `7ebed494340d081e3c5be942074182f97c9b93f3a887af88d36023e26db146ff`; revision (4393 bytes) `1444a18eae2b491f4aab6cac269998122dc42fb540794fbc92c76ecb54184f2a`. These match saved public HTTPS response records. No live retrieval performed; retained-byte identity is the observed proof.
5. `git cat-file -t fdfc8cb67a6f78996932d9688c563c53c21387f2` returns `commit`; the recorded value is a Git object identity.
6. `python3 tools/build_site_bundle.py --check` exits 0: `Offline handoff and entry hashes are fresh.` Inspected manifest diff: regenerated entry inventory/digests reflect current docs/preview composition. `git diff HEAD --name-only -- docs` is empty. Scanner/toolchain/budget code remains unchanged in complete candidate path inventory. No stale-manifest detector allowances added.

One initial reviewer probe passed the catalog in the wrong `select` parameter and threw the explicit candidate-selection refusal. Inspected signature, corrected invocation and obtained successful canonical reproduction; this was a reviewer invocation error, not candidate failure.

## AC impact and limits

AC01/AC03/AC07: correction preserves scanner refusal scope and provides exact public-data provenance plus fresh generated manifest. No blocking issue identified. Pinned full scanner execution was not repeated by this reviewer; author/CI execution needs its own final exact-source receipt. Source/browser design review is reused solely for verified unchanged bytes. Actual browser CI, exact preview and all original live/SEO/discovery/search/release/Medium gates remain pending; no whole issue AC is approved here. Authorized endpoint remains browser CI plus exact preview, then STOP/REPORT.
