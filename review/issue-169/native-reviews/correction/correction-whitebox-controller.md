# White-box QA — controller failures structural diagnosis

This is a later source/primary-evidence review. Earlier first report and archive-correction addendum remain intact. No peer verdict consumed, source/tests changed, delegation, external write or failed-campaign rerun. This bounded review ran no test campaign.

**Status: two unresolved production admission defects, affecting four controller cases.** Parent-executed `correction-controller.log` has complete named accounting and stacks: 30 tests, 26 pass, 4 fail, zero cancelled/skipped/todo, 101,919.553 ms. The three rights failures occur during fixture preparation, so their intended staged-production assertions have not executed. Four failed cases must not be counted as production readiness.

## F2 — high: new exact production Color identity is unregistered

Observed stack: `tests/release-controller.test.cjs:510` → `release/edition.cjs:133` → `color-motion-contract.cjs:901`, “unreviewed Color motion runtime”. The positive test constructs current base → Color → production, then verifies its edition. `tools/site/edition.cjs:51-60` hashes edition descriptor, base engine, CSS, render producer and descriptor inputs. Current production inputs include the complete article-aware sitemap; a changed sitemap can change the production engine even if the scripts/styles and base Color behavior remain byte-identical. `select` searches explicit reviewed fingerprints before checking full variant, scene contract, edition and both root/immutable runtime hashes. Its refusal is correct; the exact current production identity has not yet been admitted.

Narrow treatment: after requirements/rights preflight, independently measure the exact produced fingerprint and all five root plus immutable runtime hashes. Register only the corresponding production identity in the established family when baseEngine, inherited behavior/rights requirements, edition, styles and scripts agree with the reviewed family. Do not admit arbitrary production fingerprints by matching script bytes or relax `select`. Article-dependent future identities remain subject to the same exact gate. No fingerprint/runtime equality measurement was executed in this review; parent owns that diagnostic.

Meaningful preserved/proposed negatives: unknown fingerprint; known fingerprint with conflicting baseEngine/effects/scene contract; staging identity presented as production; changed root runtime hash; changed immutable runtime hash; a different family selected; same scripts but unregistered descriptor fingerprint. Existing `staging-regression` and controller variant negatives should supply these surfaces; add only missing cases to existing registered suites.

## F3 — high: retained raw article snapshot lacks exact rights/source declaration

Observed three complete stacks terminate at `rights.cjs:211` → `compile:402` → `fixtures/delivery:176` → `stagedProductionFixture:1340`. Public path is `article-snapshots/8bd02fc7101d07943e82b30e327fb0b66179c681cb6ee5d12e863bf852584550/the-sdlc-is-out-of-balance.html`. Its actual SHA256 is `f8c0860ac1bac0942ef513b9d0fc0ae770c010410b9943175c3080318ab17913`, independently read and matching the current raw article descriptor.

Mechanism: `staging/color.cjs:95` calls `edition-retention.capture(...,{preserveActive:true})`, retaining active base immutable runtime, principal snapshots and raw article snapshots before emitting Color replacements. Production edition capture then preserves the now-inactive raw snapshot. `rights.hostedInventory` covers only the selected current alias and current immutable article snapshot; `publicBasis` accepts other article snapshots only through the exact `manifest.retained` branch. Both current retained-source manifest and retained-rights map omit this raw snapshot. This is a real Color production closure mismatch, not a reason to replace actual delivery inputs with a synthetic catalog or to allow every article-snapshot path.

Narrow treatment: explicitly declare the verified raw snapshot and its required immutable dependency closure through existing retained source/manifest and exact rights inventory. Keep source/file SHA and basis provenance; do not manufacture acceptance from a retained designation. Original historical HTML must remain unchanged, retain original notices/metadata and stay out of current canonical sitemap. Its references include five `runtime/a404...` scripts/styles, `runtime/7eb.../analytics.js`, immutable favicon media, and eight article-media resources including Writing SVG/PDF. Dependencies currently shipped through active source must remain durable when future source/platform editions change. Do not alter Color's existing preservation policy merely to make this fixture pass.

Meaningful preserved/proposed negatives: retained declaration missing on either side; changed retained source bytes; changed shipped bytes with recomputed artifact manifest; omitted raw snapshot; omitted required runtime/media; unknown extra retained article snapshot; current and retained paths colliding with different bytes; wrong rights basis or pending article/media clearance attempting production. Existing `release-rights` retained tests cover source/public-byte changes and inventory mismatch; extend their selection to the newly declared article path if current predicates exercise only legacy runtime/principal files. Re-run the three previously setup-blocked controller cases after correction, because their target admission negatives are currently unobserved.

## Interpretation and limits

Two protected refusals explain four observed failures. These diagnoses do not supply author/legal acceptance, runtime measurement, clean-source tests, hosted observation or release readiness. Requirements preflight and narrow corrections are pending. Final acceptance must bind an updated packet and preserve all failure evidence. No code or accepted tests authored by this reviewer.

## Source/check identities

- `tools/site/edition.cjs`: `ab78b3745c020ae9d07a5f7deffe06cd170b528a5d541b74df07002049ed54ce`.
- `tools/site/edition-retention.cjs`: `c9cf534693ce8a23bb736572a5d927d2faded58b62ae99aae98f09d53746d479`.
- `tools/staging/color.cjs`: `b5ccb20bbab237b969286a30bed1aa8bc449ecec8c5a4a8c8caa11a155fd7a8b`.
- `tools/quality/color-motion-contract.cjs`: `991c9e510ca756ffca622db2195fff4f2efe5d7e84777fe50b319ac52780d248`.
- `tools/release/rights.cjs`: `183b055ca9dc0eaec9ac849eee5a4fec1b991404356750d2f0c132e117648571`.
- `site/rights.json`: `a08bf509eb11096a5b95f89f5499cd7266930858522d327c5fbaffd7208f981f`.
- `site/retained/manifest.json`: `6191ed2006d08bf076c13863241c0816eb9a7c92b3ffe2a5016d1ecb43824c4b`.
- `tests/release-controller.test.cjs`: `643d3a088173c3b0076a265262a5cad5f6088c49f496330e6d9e1b704f0bd590`.
- `tests/fixtures/delivery.cjs`: `4bf3c43e42c63d5006d209d7c85acaceb86ad62b457e36c29882d71056b66adf`.
- `tests/release-rights.test.cjs`: `fcbf5d852890affd52bb857beeb69460351a5d275c424967108b4d839040b8e0`.
- `correction-controller.log`: `a4a1abb8ae93d8ad667ab27b2db88b624a2637868673a2af7bd1c06958fca360`.
