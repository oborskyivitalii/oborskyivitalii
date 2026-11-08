# Issue177 focused scanner/bundle correction — White-box QA continuation

2026-11-08. Independent nonauthor verdict: **no blocking finding in this correction**. This is a focused continuation of my first judgment `/tmp/issue177-ci-whitebox.md`; no peer verdict was read. Existing test/validator review is reused only after byte verification. No implementation, external writes or delegation.

Observed HEAD `8371746dce7eeda64c8662a21bc82c25bf772d2d`; staged/dirty candidate. Exact inspected SHA256:

| File | SHA256 |
| --- | --- |
| tools/quality/secrets-publication.json | ace921f2d6fadd665df7d7fdc7793928113889f9e9cf35fb235c48901e4b1b7a |
| review/issue-177/2026-11-08-ci-scanner-proof.json.gz | 9a613ab883f8ac7a559aab1254b7fe8632a9279b8e097436ae8e4a126bb2e047 |
| review/site-v1-offline-bundle-v11.json | 333d80a953ca9e32d38ac9905310a6b649fbfc401215922efbebd5cdaef8faba |

Executed independent exact comparisons against `git show HEAD:tools/quality/secrets-publication.json`: all3632 predecessor records remain ordered/data-identical, all non-findings metadata is identical, and precisely7 records are appended. Each of the six correction proof values occurs in its declared file, its SHA1 reproduces the scanner row identity, and exactly one matching path/rule/value row exists. No wildcard, threshold, scanner-code or budget change appears in this correction.

| Fingerprint source | Independently executed oracle |
| --- | --- |
| Accepted article rights digest | Actual `loadArticle` → `article-media.render` → `articles.editionNotice(...).digest` reproduces `9f0596639af391652308b3bcc909bb053ba70961e3778ff0ec33d5285a944618`; SHA1 `0651141bdfc1b9dc429c2bfbcb3d7386f18bfb3f` |
| Declared article materials binding | Actual `article-materials.load` on the rendered validated article emits `3b7ce0cdba81ee0d20c43834a9e08f16d4bdffcaef2ee9d2dadbd39cde82c3c8`; SHA1 `cf725cb50e9bc14809d39fb799b688d37af96236` |
| Saved article HTTP body | Decoded retained bytes SHA256 `db7679a6b111e014ef4d248df5a1a5f2033ded2eac2ccb0d79a67a6f89b20915` equals dated HTTP receipt and proof value |
| Saved old loader HTTP body | Decoded retained bytes SHA256 `7ebed494340d081e3c5be942074182f97c9b93f3a887af88d36023e26db146ff` equals dated HTTP receipt and proof value |
| Saved revision HTTP body | Decoded retained bytes SHA256 `1444a18eae2b491f4aab6cac269998122dc42fb540794fbc92c76ecb54184f2a` equals dated HTTP receipt and proof value |
| Saved Git observation | `git cat-file -t fdfc8cb67a6f78996932d9688c563c53c21387f2` returns `commit`; SHA1 of the fingerprint string reproduces row `c2bfb6fd0b78c0e7da85088adee1ab757a7d7d51` |

Also independently verified the original seventh beacon row: SHA1 of the accepted public `site/analytics.json` token is `76f4f240e050d0c7abc1427ec7454c130c1da2c0`; identical token occurs in both predecessor and current generated loader. Public values here are fingerprints/browser beacon identity, with no API-account authority.

Executed `python3 tools/build_site_bundle.py --check`: exit0, `Offline handoff and entry hashes are fresh.` The manifest change follows deterministic current docs/review bytes and adds the current loader/article snapshots; the generator itself is unchanged. This proves freshness against current generated inputs, not hosted deployment or visual acceptance.

Execution diagnostics retained: the first Node combined proof command hit its default child-process stdout buffer while reading the >1MiB existing ledger (`spawnSync git ENOBUFS`, signal SIGTERM); the independent bundle check still ran and passed. Diagnosed as reviewer harness buffering, not candidate failure. Replaced that read with Python `subprocess.check_output`; exact predecessor/value checks then completed successfully. A first producer invocation yielded after the tool wait and its handle was inadvertently not retained; no completion was inferred. A bounded producer-only invocation with a longer tool wait completed exit0 in1.514s and printed `both declared public producer fingerprints reproduced`. No failed product campaign was rerun.

Verified unchanged hashes against the original packet for analytics-browser producer, full/staging refusal suites, staging fixture, issue177 acceptance adapter and test-profiles registry. Prior54/54 native tests and the1 positive/9 negative probe remain applicable to those unchanged bytes; they were not rerun.

AC impact: focused evidence supports AC01 test-impact and AC07 source/check integrity. It supplies no completed whole AC, current remote-ref proof, live HTTP re-observation, actual pinned detector/full scan result, browser execution, provider telemetry, staging promotion or release authority. Saved HTTP-body checksum validation proves retained bytes match the dated receipt; it does not independently reauthenticate the historical transport. Existing CI remains responsible for exact-source full scanner/browser evidence and preview verification.
