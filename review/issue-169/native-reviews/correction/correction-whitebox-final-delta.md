# White-box QA — final retention/media delta

**No new blocker found in this affected-source delta.** Earlier findings and later resolutions remain preserved in their separate reports. This addendum reviews the five changed source/test owners and two retained-data owners against V3, using actual bytes and primary raw evidence. No peer verdict, accepted source/test edit, external write, delegation or duplicate test campaign.

## Protected invariants and source review

1. **Missing declaration cannot silently become default retention.** `edition-retention.declaration` requires schema1 and a present non-null object/non-array files map. Production evaluates this helper while constructing the `edition.build` argument, before calling the mutating edition builder. Valid map entries then undergo `capture`'s finite inventory, immutable path, SHA format, present-file and exact-byte validation before runtime/snapshot deletion. Schema/missing/null/array faults therefore fail before edition mutation. Generic capture defaults remain unchanged for legitimate existing callers. The helper test covers missing schema, wrong schema, missing files, null, array and valid empty map; it is a unit test of the adapter, while ordering-before-mutation is additionally established by the actual production call structure.

2. **Staging rights inventory matches the existing finite media emitter.** The changed scope condition recognizes only `media/` and `article-media/` namespaces, plus source-validated generated files. The edition emitter already preserves immutable media directories while rebuilding/removing historical HTML/runtime trees. This changes inventory classification to match shipped bytes; it does not add an upload surface or a general immutable-file bypass. Current `generatedFiles` retains precedence in `publicBasis`, so active shared Writing/Research resources and article assets keep current-source validation and retained=false. Dormant declared article-media stays byte-bound to retained source/rights. Dormant HTML/runtime remains excluded from staging. Production retains complete declared closure. Existing policy/notice/approval gates and pending-clearance rejections remain intact.

3. **Oracles independently account current and dormant resources.** Updated raw fixture rights expectations exclude only active source-validated room assets from retained classification. Actual stage/production expectations derive active alias/snapshot/body/room resources from verified emitted descriptors, assert their presence/current classification, and separately compare exact retained path inventory including dormant media. They do not remove resources to satisfy counts or use a synthetic historical catalog as actual delivery evidence. Hosted-review pending-clearance and real CLI packaging cases remain included in primary verification.

4. **Current raw snapshot closure remains exact.** Independent byte audit checked46 retained paths: source files, manifest keys and retained-rights keys match exactly; all source and rights SHA values match. The three frozen raw snapshots8bd...,0978...,02a5... each reference15 immutable src/href dependencies, all declared. Current native descriptor's02a5... snapshot has SHA256 `f1d53fa07e9c2d947922eb82b5cc12b7b7bbefd62cf728e80b9cfcbde8a5ffa9`, matching actual docs bytes. Accepted manuscript SHA `db47dcbed76c5052355d24cd78e3d9ea2a9727c23be030796463f975e0b8667b` and semantic SHA `642e5cdcdf5a8d06b513e35f5816c22302117702318c15ff5fcdb12e8ea2b31b` remain unchanged. These frozen raw renditions are not described as previous publications.

## Evidence and allocation

Primary parent-executed raw evidence independently read:

- `retention-adapter-guard.log`:1 test/1 pass, zero fail/cancelled/skipped/todo;88.192 ms.
- `media-retention-four.log`:4 tests/4 pass, zero fail/cancelled/skipped/todo;39,813.291 ms. Includes actual current/retained rights, hosted-review pending clearance, staging/production publication records and actual edition/package CLI sidecar freezing.

Independently executed only a read-only source-byte/inventory/reference audit, retained in `correction-whitebox-final-delta.raw.log`; its seven exact changed-source identities and evidence hashes bind this addendum. V3 packet is historical for these changed owners, not silently treated as final. All named tests retain existing permanent suite/profile routes. No branch-coverage measurement claimed, and raw test accounting does not by itself provide a complete source/argv/exit receipt.

Meaningful refusals remain: missing source map, malformed/escaping/missing/corrupt declared files, immutable collision, omitted retained closure, source/public SHA mismatch, unsupported rights input, active resource lacking current source proof, wrong edition/source and pending production clearance. No generic Color runtime admission or retained article-path bypass was introduced.

## Limits

Affected AC05/08/09/11 structure is satisfied within the inspected source/evidence scope. Final exact-source packet, current CI/RI/size/integration accounting and actual hosted/production observations remain pending. Earlier broad source checks and numerical initial-docs size results cannot be promoted to this changed full candidate without those final checks. Separate proposed scanner checksum review data was outside this delta and was not inspected or accepted.

Audit SHA256: `971e9f5fd8c87bbc3c159df71e227b3e5a6795dac6e50aa040ac06057f15fb66`.
