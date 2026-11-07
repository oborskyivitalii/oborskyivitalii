# White-box QA — archive correction addendum

The first independent judgment in `correction-whitebox.md` remains unchanged. This later review follows the parent's targeted correction notice and primary source/log references; no peer verdict was read.

**F1 is resolved in the inspected archive correction.** The verifier now obtains articles from the verified frozen public snapshot, compares them exactly with retained `record.components.articles`, rejects candidate/unsafe aliases, and derives exact sorted article URLs alongside the five principal routes. Both the native alias and immutable document must carry production robots, the correct article canonical URL and the frozen social metadata. This preserves the empty-article historical path and independence from today's authored article registry. `snapshot.verify` continues to enforce resource/content closure and unique article aliases. Exact sitemap array comparison retains omission, extra, foreign, duplicate and ordering rejection.

The historical test uses the actual accepted article through the current delivery fixture. Its new negative cases recompute the artifact manifest so rejection is caused by the frozen semantic invariant rather than an incidental stale digest: missing/extra/foreign sitemap entry, forged empty component article inventory and foreign alias canonical. Original absent/future portrait/social registry checks and image-dimension/origin negatives remain. No test was authored or rerun by this reviewer.

Primary raw evidence independently read: `archive-correction.log`. The parent-executed whole archive module reports **8 tests, 8 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo**, 20,517.927 ms. The raw file does not itself include the process exit field; orchestrator should retain its execution receipt. This supports the correction's affected module; it is not my own independent execution or a complete release campaign.

My earlier supplemental campaign now has an explicit wrapper outcome: **TIMEOUT at 175.012 seconds**, after 37 emitted passes and 1 emitted failure. SIGTERM did not produce a settled complete Node result before that deadline; no final test-runner summary exists. Pages-delivery emitted all 20 named cases; Pages-migration emitted all 10; release-archive emitted 7 passes/1 failure; release-controller completion remains unobserved. These are partial per-case observations, not accepted suite accounting. The failed/timeout campaign is preserved and was not rerun. Its before/after docs path-byte digest matches `141b26ac3d6be1b9310affe6f5e80fe8b5869e07a41a1575f92e8226532aba12`.

No additional carrier, provenance, size or validator issue identified in the inspected correction. Final whole-source acceptance still requires a refreshed immutable source packet, affected integration/source checks, required role reconciliation and actual hosted/production observations. The original actual-docs size diagnostic remains reusable only for unchanged docs/build/fallback inputs.

## Source identities

- `tools/release/edition-archive.cjs`: `281f56ce375c3a31d5faabe14b1105a76f5bb2ea0f1b648b5e903670dd33343a`.
- `tests/release-archive.test.cjs`: `60f24c9d62a699c8acf082759ab2854c957ea0747dfe14cb661d9fbb867f5bde`.
- `archive-correction.log`: `cc4f23a67a787d5cd5c1964f4c49ed816b80660306d16f0b6a44afaf62e1730b`.
- Preserved first report SHA256: `284a62f11cfc09835f3ee1c4cab52ec2abb9358842d290fed7fd8f86afe2338e`.
- Preserved failed/timeout raw log SHA256: `cbb047342d7611d59f55d6447633829f3f5f38b4a1082a46c8241ec1e9752a57`.
