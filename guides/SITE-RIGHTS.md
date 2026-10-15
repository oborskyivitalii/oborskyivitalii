# Release rights inventory

[Rights #7](https://github.com/oborskyivitalii/oborskyivitalii/issues/7) owns reuse
policy and rights acceptance. [PR #40](https://github.com/oborskyivitalii/oborskyivitalii/pull/40)
prepares the first production edition under #39. The maintained inventory is
[`site/rights.json`](../site/rights.json); it binds the selected policy to
provenance, source and exact public files.

On 15 October the maintainer approved the recommended
[licensing proposal](../review/issue-39/2026-10-15-licensing-proposal.md):
Apache-2.0 for original engineering, including site CSS, templates and rendering;
CC BY 4.0 for original editorial text, new author-owned hosted article text and
non-brand diagrams. Reuse of the licensed implementation and its appearance is
permitted. [LICENSING](../LICENSING.md) owns the precise scope and exceptions;
[code](../LICENSE-CODE.md) and [content](../LICENSE-CONTENT.md) contain the full
license texts, and [NOTICE](../NOTICE.md) preserves attribution. The earlier
restricted-reuse draft is superseded. The selected policy, public copies and
current Credits must agree before freezing. Policy selection does not approve a
specific candidate, staging content, or production release. Existing portrait use and maintainer-attested
written Kopko/Basir advisory-role consent are preserved and do not require a new
permission request. This inventory does not assert photographer ownership or
grant visitors a photographic reuse license.

The first release ships original generated pages/runtime, the supplied portrait
and AI-assisted cutout, local SVG/icon geometry, factual publication/discussion
metadata, bounded attributed summaries and links. External publication bodies,
recordings, slides, PDFs, fonts and organization logos are outside this edition.
UA documentation remains CC BY 4.0 and its original code Apache-2.0, with
third-party exceptions. Subprime retains CC BY-SA 4.0. Linked platform editions
retain their existing terms; no blanket license is assigned to the 29 linked
works or their 46 editions. New hosted editions need explicit source, author,
license and third-party exceptions; adapted Subprime material keeps applicable
ShareAlike terms. The RI Apache-2.0 license and notice retain their original
component scope and provenance even though original site code now also uses
Apache-2.0. Historical snapshots retain exact earlier notices and bytes.

The builder includes complete, escaped text copies of the four root legal
owners in readable expandable sections on Credits, at `#license-scope`,
`#license-code`, `#license-content` and `#license-notices`. Hosted and offline
editions consume the same authored owners. Exact rights coverage binds those
rendered copies; no extra public file paths or wildcard notice exception are
needed.

## Compile and review the exact candidate

After the candidate's edition transformation, using the final `artifact.json`
and `public/` bytes:

```sh
node tools/release/rights.cjs build CANDIDATE_DIRECTORY
node tools/release/rights.cjs verify CANDIDATE_DIRECTORY CANDIDATE_DIRECTORY/rights.json
node --test tests/release-rights.test.cjs
```

The compiler verifies the existing artifact, hashes the maintained policy,
provenance, notices and source groups, and assigns a basis to every public file.
Authored assets and each retained snapshot/runtime/media file have explicit
hashes and bases. New/uncovered files, missing retained closure, changed pinned
bytes, missing provenance/notices and inconsistent current Credits fail. Prior
Credits snapshots retain their unchanged historical bytes; they are inventoried
as retained editions, not silently rewritten to today's notice.

The resulting `rights.json` binds source commit/tree, candidate commit and public
artifact digest. `inventoryDigest` hashes the report before adding that field.
`inventoryPass: true` proves bounded coverage and byte consistency;
`approvalPass: false` is deliberate. No prose search, license label or passing
test establishes legal approval. The report contains public/bounded provenance
only, never private correspondence.

The staging and production edition CLI entrypoints create and verify the
nonpublic report before the existing workflow uploads the complete artifact
directory. The report stays beside `artifact.json`, outside `public/`, so it
does not change public route/runtime identities or recursively hash itself.
Both validation levels recompute it against the exact clean candidate checkout.
Source tests exercise the actual edition and package CLIs in a clean temporary
Git checkout, including report-before-upload and missing/stale/source/tree failures.
Staging packaging requires that report before creating an uploadable package;
its frozen report and digest travel through the Cloudflare package, Pages
composition and retained recovery. Pages records both root/staging report
digests in its existing delivery receipt. The release controller retains
`rights.json` as a durable
Release asset, with its raw SHA256 and inventory digest in `archive.json`.
The production controller verifies complete local Pages composition, licensing
and the preserved staging subtree before writing draft archive assets.
A separate maintainer rights/editorial acceptance must reference the same
source/artifact and set `rights.inventoryDigest` to that frozen report's digest,
alongside the existing `pass`, `reviewer` and `record` fields. Keep #7 open until its original
scope, owner policy and exact-edition acceptance are reconciled; future unshipped
publication editions retain their own review rather than becoming invented
first-launch deliverables.

Publication requires `policy.status: "confirmed-by-maintainer"` in the
source inventory, with a structured `policy.decision` naming `selection`,
`reviewer`, `record` and `decidedAt`. The selected `"explicit-licenses"` decision
maps every declared licensed scope in `decision.licenses`, preserves explicit
asset/identity/third-party exclusions and requires the matching public notices.
A pending source policy cannot be admitted by setting only the external rights
`pass` field. The actual 15 October selection supplies the policy decision;
compiler success does not supply independent exact-edition rights approval.

The module's `verifyArchived(publicDirectory, artifactRecord, rightsReport,
trustedInventoryDigest)` verifies the unchanged frozen report and its complete
public-file/source identity against an externally trusted immutable archive
digest. It does not read today's sources to reapprove an older edition. The
normal `verify` recomputes candidate provenance from the checked-out sources.
[`rights-record.cjs`](../tools/release/rights-record.cjs) is the shared frozen
record verifier for those existing consumers. It reads no current legal owners:
it binds source/tree/candidate, edition, complete file coverage and report digest,
then decodes the four finite escaped legal blocks from both current Credits
copies and checks their recorded owner hashes. Missing, stale, mixed,
substituted, unknown-license or wrong-edition records fail. Staging omits the
ten earlier HTML/runtime files intentionally excluded by its edition policy;
its four historical media files remain covered and unchanged. Production
retains all fourteen historical files. Genuine archived records keep their own
frozen notices and trusted archive digest, independently of today's policy.

The report explicitly records each of the current 46 external editions across
29 linked works as linked metadata, with no shipped body and no site-assigned
license. External owner terms apply. `hostedEditions: []` describes this source,
not a license for a future article. The closed public inventory rejects
unmodelled article/PDF paths; the current catalog accepts no article bodies.
Before introducing actual hosted editions, extend the existing rights owner
with each edition's source, author, license, attribution and third-party
exceptions. This increment does not implement an article publication engine or
claim that mechanical checks can classify arbitrary editorial prose.

Rollback restores the separate archived report beside the unpacked public
package. Its historical policy and acceptance remain bound to that immutable
edition; today's source policy cannot replace them.
`tools/release/edition-archive.cjs` also verifies the frozen edition's own social
metadata, JPEG dimensions, route indexing and host policy. Publication and live
checks use that intrinsic verifier; only exact-source candidate checks compare
the portrait and social metadata with today's authored inputs and motion registry.

For an intended asset replacement or newly imported prior release, review the
provenance, update the corresponding explicit hashes/bases in `site/rights.json`,
then regenerate the candidate and report. Do not automatically refresh hashes
as a way to pass a failing inventory. Code-style scope: CS01/CS04/CS05/CS08/CS10;
inventory tests are failure checks, not editorial, independent or device review.

## Changed-content staging before production

The maintainer requires the licensing content to reach permanent staging for
review before resuming production. After the selected notices and source checks,
resolve current-main exact Color-registry compatibility and use the ordinary
two-host staging/admission flow. Supply the constant
[Cloudflare staging](https://staging.oborskyi-author-ci-staging.pages.dev) and
[current Pages staging](https://oborskyivitalii.github.io/oborskyivitalii/staging/)
with the served source identity. Keep noindex/badges and disabled analytics.
After the owner's content review, continue the existing full candidate,
rights/device/independent and release gates. Policy selection or staging success
does not authorize production/domain/DNS activation.
