# Evidence-only performance record — issue5 / PR79

This standalone tree stores immutable diagnostic evidence for the same
[issue5](https://github.com/oborskyivitalii/oborskyivitalii/issues/5) and
[PR79](https://github.com/oborskyivitalii/oborskyivitalii/pull/79).
It is not an implementation, site or release candidate. Do not merge its standalone tree.

Overall result: FAIL. The original complete five-route performance worker passes;
the actual reader's mobile LCP median is4202.636ms against2500ms, all3 trials over.
There are36 Lighthouse trials,72 short motion windows,24 primary flights,
120 primary retention cycles and a complete300.076-second soak. No performance
trial was repeated or discarded.

Measured site:283b32f65f0589e85c0aa914d0990704dcf8ac38,
tree643304fa64c945c01f3b21e6d1d4f0d85696f8f5,
publicedb8d18387d65ef2c6d67e109f93b95ed6f2fa859dd5afc0c4d87b2e5e14f406.
Supplement collector: local cleanf65f8629f2dac810d2e50739515f9da1c3d5477e,
treeb6f06780c73c9ea68b3982ff88b42e9b06256af3; its Git delta bundle is retained.
The source PR's versioned review explains browser override, loopback measurement,
all findings, open gates and corrected collector-review findings.

In review/issue-5/2026-10-21-performance-evidence, manifest.json maps every raw
member to its ZIP and SHA256/length. Extract all15 raw ZIPs into one directory;
all96 raw files retain their original names, with separate original, reader,
source-check and hosted-identity paths. Every ZIP and member was verified.
summary.json is a derived convenience view; complete raw failures remain retained.
This external evidence tree preserves the active candidate's unchanged250MB RI
hash bound and existing history; it is linked by immutable commit/tree identity.
