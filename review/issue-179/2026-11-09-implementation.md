# Issue179 — article cover link previews

Owner: https://github.com/oborskyivitalii/oborskyivitalii/issues/179

## Scope and current gate

User authorized implementation through PR preview, then STOP. Main and production
were both fe7baab277a8b90de330a1cec738b7085faf7223. No stable promotion, merge,
production deployment, LinkedIn post or Medium edit is authorized by this checkpoint.
Original AC01–AC06 remain in the issue; source evidence alone cannot close them.

## Source design and test impact, before broad advancement

- Declared profile furniture.cover is the selection owner, including omitReason.
  Read original validated PNG bytes; derive a separate1200×630 white-padded JPEG.
  Preserve the full composition, original source, print and reader image bytes.
- Extend existing article-media/web-media preparation. Keep source/pixel/ICC and
  derived content-addressed resource identities in the existing rights notice.
  The generated social asset has a distinct internal id; it cannot replace the
  original reader image. All existing asset/transfer bounds remain.
- Carry socialImage through the existing article revision/closure. Production
  uses its escaped absolute Open Graph/Twitter metadata. Principal pages and
  explicitly coverless articles retain the existing portrait; this960×887 fallback
  is an explicit exception to the new cover-rendition dimensions.
- Current source rights verification reconstructs the cover selection. Frozen
  archive verification consumes only the archived descriptor/bytes, including
  legacy documents without socialImage; no current authoring registry is used
  to reapprove history. Live checks verify every declared social JPEG.
- PR staging retains existing noindex/analytics isolation and does not emit
  production metadata. Review its actual social JPEG; privately compile/test
  the production edition. Actual LinkedIn cache evidence stays deferred to AC06.

| Risk / AC | Existing check owner and added evidence |
| --- | --- |
| Cover selection, distinct articles, source integrity, no-cover fallback / AC01–03 | article-media.test.cjs: two real cover inputs, deterministic bytes, independent JPEG decode/padding, unchanged source assets, omitted/invalid cover |
| Exact resource closure, canonical/alias transforms, staging suppression / AC03–04 | article-delivery.test.cjs: retain full coverage and account for the additional declared JPEG |
| Correct per-article metadata and corruption rejection / AC01–04 | release-controller.test.cjs: actual production compilation, alias/snapshot metadata, default portrait contrast, changed image-byte rejection |
| Old immutable records / AC04 | release-archive.test.cjs plus a complete production package captured from clean base BEFORE producer changes; updated verifier checked those unchanged bytes |
| Applicable source checks / AC05 | issue179 policy runs the four maintained modules with complete accounting; Basic/style/RI/RI-CI stay separate checks; existing independent review roles required |
| Actual platform display / AC06 | Post Inspector after separately authorized production; not supplied by fixtures or preview image |

Permanent source suites remain in their existing profiles. The new Python wrapper
is issue-policy-only, mapped in test-profiles and the acceptance workflow installs
the same pinned quality/publisher/media tools used by existing article policies.
No source/hosted profile case or timing/byte budget was removed or relaxed.

## First failures and treatments

Initial targeted run:25/61 passed,36 failed. One shared fixture used stale docs
without the new descriptor, cascading into release tests; the canonical local
media interpreter was absent; the old JPEG resource count omitted the new image.
Regenerated from authored owners, installed the pinned media tools, and changed
the expected resource inventory while preserving existing source/JPEG checks.

Second targeted run:58/62 passed,4 failed. Three failures came from unnecessarily
binding article-specific metadata into the runtime engine input, creating an
unreviewed Color fingerprint; one fixture used asset.url, missing on the newly
derived asset. Removed that redundant engine input (article source/document
identity already binds the media), supplied the normal resource URL, and retained
the strict existing runtime admission. No registry exception or budget change.

The guarded private production derivation now retains exactly the reviewed
c8c444e30127b60e1dac052ab6a2b53d3ff48f40efc68d526cc7c71f17151ebb family,
with identical styles/theme/space/archive/navigation SHA256s. This is byte parity,
not a new performance or production acceptance claim.

## Review, style and acceptance disposition

Preimplementation Requirements first result is retained verbatim alongside this
record. Four source-bound final roles and final checks are required before preview
handoff; their actual results/identities belong to subsequent receipts.

CS01/02/04: authored cover selection, one metadata block owner, bounded shared
media pipeline and existing publication/rights registry. CS03/06: no runtime CSS,
animation/lifecycle or scene edits. CS05: canonical formatter configuration on
touched functions; unrelated top-level formatting was restored. CS07: retain all
existing resource bounds and document extra JPEG bytes. CS08/09: meaningful
producer/negative checks and bounded style guard; guard alone is not full review.
CS10: issue AC05 style subcondition and this source/test mapping.

This checkpoint cannot claim AC04/05 release gates or AC06 platform display.
Whole criteria remain unchecked until their full original obligations are observed.

## Correction checkpoint after independent first judgments

Preserved all four first reports and exact first-candidate acceptance in
2026-11-09-review.json.gz before reconciliation. Requirements and Code found a
source-contract mismatch for alt501–1000; Code also found unrelated JSON array
formatting; Exploratory found the publisher/Pillow preparation predicate missing
issue179. White-box independently verified the actual prechange full production
package. The local image visual check passed; hosted/browser observations remain
pending. The initial statement that all unrelated formatting had been restored
was too broad; the corrected diff restores the existing registry layout.

Corrections preserve full authored alt text up to the existing1000-character
limit and permit its bounded6000-character escaped form in the archive consumer.
Added actual producer500/501/1000 boundaries and1001 rejection, and the production/
archive integration now includes a1000-character quote-heavy alt. Both focused
cases passed. Added179 to the existing publisher/Pillow CI preparation route.
No original requirement, runtime admission or resource bound was relaxed.

The correction check passed SOCIAL (63 cases), STYLE, RI and RI-CI. BASIC correctly
rejected generated docs after the helper source changed. Regenerated the canonical
outputs and dependent snapshots, then refreshed the catalog. This is a diagnosed
source-to-generated identity change; no guard was bypassed.
