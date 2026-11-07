# White-box QA — final data cleanup

**Scoped result: pass; no new blocker identified.** This is a read-only byte/inventory/closure verification of the specified data-only cleanup, not a repeated test campaign or full release acceptance. Prior reports/logs remain intact as observations of their earlier candidates.

The parent explicitly supplied the single diagnostic archive `review/issue-169/native-reviews/correction/intermediate-raw-snapshots.json.gz` as primary evidence for this review. Only that exact file was opened within the otherwise excluded native-reviews area; no peer report was read.

Independently verified:

- Current retained source paths, retained-manifest keys and retained-rights keys match exactly: **44 files**, every source and rights SHA matches.
- The archive contains exactly the two specified superseded raw snapshot paths. Strict base64 decoding reproduces their previously observed exact bytes: 8bd... → `f8c0860ac1bac0942ef513b9d0fc0ae770c010410b9943175c3080318ab17913`; 0978... → `228c6e4d3ae5b58dc28b43931046e7d4c808fe3d1fabe547ef0df263ea6ef978`. Both are absent from current retained source, retained rights and public docs. Archive SHA256 `4ff5eb06273fa050c23a3d6516866df98cc6a21e29c17c5900eeb1bdf6dc2a8a`.
- Current 02a5... snapshot remains retained/public and matches the current descriptor byte-for-byte, SHA256 `f1d53fa07e9c2d947922eb82b5cc12b7b7bbefd62cf728e80b9cfcbde8a5ffa9`. Its 15 immutable src/href dependencies are all still declared; none disappeared with the two intermediate HTML paths.
- Accepted manuscript/semantic identities remain `db47dcbed76c5052355d24cd78e3d9ea2a9727c23be030796463f975e0b8667b` / `642e5cdcdf5a8d06b513e35f5816c22302117702318c15ff5fcdb12e8ea2b31b`.
- Retention API, production adapter and rights guard source hashes equal the prior inspected final-delta bytes. No guard change is inferred from this cleanup. The diagnostic snapshots remain available as evidence without being website publication inventory.

Exact current data identities:

- `site/retained/manifest.json`: `63419a290f8266e5765b8871c45ef072405e7dd1aa22687a09a427027fc4d5c6`.
- `site/rights.json`: `ccd2c8df6a34c076e5bc41ebe2bac169e2feb781dcb860be4f8f96f425fb0604`.

No hosted/deployment state was inspected; the parent's “local/unpushed/unpublished” history is supplied scope context, not an independently observed production-history claim. Current-source test/CI/RI/hosted acceptance remains separate. Scanner proposals are still being recomputed; no previous scanner result or checksum exception is accepted by this verification.

Raw audit: `correction-whitebox-data-cleanup.raw.log`, SHA256 `a39b10f41effbddc41dc0549374a1e0cdeabb8cb4256663d67aed37ce2f14b6e`.
