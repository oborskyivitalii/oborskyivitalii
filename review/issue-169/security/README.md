# Security maintenance evidence

Owner169, R10 release. The [dated report](../2026-11-06-security-maintenance.md) owns scope and current status. Compressed files contain original UTF-8 Markdown/JSON and exact byte identities; decode with gzip. They are evidence, not additional admission authorities.

- `failed-security.json.gz` and `failed-bandit.json.gz`: original failed staging reports.
- `reconciled-1016.json.gz`: exact remaining candidates and eight producer-proved exclusions, with original source/artifact identity.
- `requirements-preflight.md.gz`, `bandit-code-preflight.md.gz`, `secrets-code-preflight.md.gz`: separate actual first preimplementation reviews; original limits/findings retained.
- `bandit-revalidation.json.gz`: per-row original/current identity and reviewed boundary, including finite expiry.
- `historical-storage.json.gz`: lossless human-report storage with original Git/source binding; no parsed policy/fixture/source oracle or unclassified candidate is archived away.
- `secrets-proof.json.gz`: complete per-ID source/spans/referent/producer/Git/qualified archival proof; eight exclusions stay distinct.
- `secrets-preflight-appendix.md.gz`: original separate inspector refinement and native replay limits.
- `ledger-append.json.gz`: exact1017 proposed rows, original ledger byte identities and ordered-prefix preservation.
- `native-producers.cjs.gz` / `.json.gz`: read-only current producer replay and original observation; diagnostic evidence, never an admission authority.
- `provenance.json.gz`: raw-artifact and receipt hashes.

No file here establishes a successful stage, protected merge, production delivery or platform publication.

Final storage/source closures and original findings remain in `*-storage-closure.md.gz` and `*-source-closure.md.gz`. `candidate-v4.json.gz` retains the full storage packet. `source-reference-packet-delta.json.gz` gives an exact, round-trip-verified lossless reconstruction of its metadata-only successor using the v4 pins; this is receipt storage, not executable admission logic. Both prior inaccurate wrappers remain available.
