# Issue76 — 12 October 2026 Color admission review

Owning issue: https://github.com/oborskyivitalii/oborskyivitalii/issues/76
Runtime PR: https://github.com/oborskyivitalii/oborskyivitalii/pull/77
Role: implementation self-review, with independent AI byte/source review.
Reviewed runtime source: `bcfcfe8f44f098efdbd10aa35617f7d835222504`.
Controller baseline: `7b0d5b68a922eea64d77f50f574f50e1bf184571`.
This companion changes only exact runtime recognition and verification metadata.
Main's authored site and generated public files remain byte-identical.

## Intent and decision

The maintainer approved the corrected preview and requested main plus stable
staging on12October. The preceding preview-only restriction applied to the
first iteration. The same issue remains the owner; no new issue or production
activation follows. AC01–AC04 behavior remains in PR77. This controller bridge
is their prerequisite, not a claim that those runtime criteria are implemented
by its unchanged public edition. Current source/policy and external criteria
remain separate from those code changes.

## Findings

| Finding | Source and implication | Disposition |
| --- | --- | --- |
| F01 | Closed Color runtime registry rejects the new exact runtime before browser execution. | Add reviewed plain/staging tuples; retain all old tuples and strict validation. |
| F02 | Candidate jobs use the PR head, but Pages smoke executes from protected main. | Stage and integrate this controller-only bridge before staging PR77. |
| F03 | New Appearance behavior changes theme bytes as well as scene/navigation bytes. | Theme hash belongs to each explicit family; all previous returned descriptors remain identical. |

The existing owner `/stage` route remains mandatory: successful raw-head Basic,
navigation/RI and owning-policy jobs; bounded staging regression; both enabled
publishers; fresh Staging admission; merge of the unchanged admitted tree.
No unknown-identity fallback, hash wildcard, changed timing or budget is added.

## Exact reviewed identities

Fresh clean-source packages were built from the reviewed runtime and verified
against their full artifact manifests. Each canonical runtime file and its
immutable alias was independently rehashed.

| Field | SHA256 |
| --- | --- |
| Base engine | `8ced6511a9420f145dd3409e168e0f9fa4786db025623165afa5e3cc13a6741d` |
| Plain Color | `57999380a42cf44132b21d6d1a11fdb814abeaaac38ff3e25311ad6cd38052f8` |
| Staging Color | `49ab29ede2d117832a79151f02da524001024fa2109f79a9b55b7921bbb3dbd6` |
| Theme | `6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a` |
| Space | `0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487` |
| Navigation | `e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b` |
| Archive | `1307b2405daa50937e5746f4d8a71230842718377d853b4d0cf4704e7f2de9ad` |
| Plain CSS | `302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e` |
| Staging CSS | `545b7cb79e15706a80087ebc5cf5139b0c4af564d47f141b7a1ede0915c18a97` |

## Verification and remaining work

Focused Color compatibility tests passed8/8, including all six tuples, mixed
canonical/immutable/both-path bytes, wrong editions, rejection before browser
context creation, preserved twelve-cell coverage and both original guard branches.
All four prior tuple outputs are byte-identical to baseline. Pinned formatting
and applicable CS01/CS04/CS05/CS07/CS08/CS10 source obligations are reviewed.
Checks establish strict recognition, not physical-device or performance acceptance.
The owning policy runs the existing current-source checks for this bridge but
cannot mark PR77's whole runtime criteria complete. Those criteria, source/tree,
actual companion PR, staging runs and final merge remain in the live issue.

Independent AI review recomputed both complete30-file artifact inventories and
all20canonical/immutable paths. Plain digest: `3b9d699935e2ef0bea01859902bbcd2ba53fd8498eb0c7429de0de4f26f6ac37`;
staging digest: `cd4598b341100d28955e28b048999f9febff3230976a95fc9e3d6d536d8e195e`.
Reviewed contract SHA256: `4104901dab91a172803133b2e2030c3dd59e136cb8680dd682af16e72521b8da`;
reviewed tests SHA256: `60c0047f3a395809b2ff6986b648eda46a8bed4ce3fb029f392cf8a5dafd1727`.

Pinned detect-secrets1.5.0 scanned971tracked textfiles:4612hashed findings,
3294retained reviewed findings and1312freshRI/coupling proofs. Six new exact
contract checksum findings were recomputed from the reviewed public packages
and appended by path/rule/hashed value. All414prior ledger entries and metadata
remain unchanged; no unsupported finding or wildcard allowance was admitted.
The existing six ledger/checksum negative tests passed. Full CI security remains
a separate required staging result.
