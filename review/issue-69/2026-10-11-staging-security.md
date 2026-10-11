# Issue 69 — staging continuation and security review, 11 October 2026

Owner: [issue #69](https://github.com/oborskyivitalii/oborskyivitalii/issues/69).
Execution: [Draft PR #71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
Role: implementation **self-review**; independent review remains pending.
Inspected clean source: `dbb5802b515a0896e89edfdac967ce712c430c54`,
tree `80bf72caaeaccac2074ca0f8681cae269dc2051a`.
This follow-up continues the authorized implementation and duplicate consolidation.
It does not supply merge, stable staging or production approval.

## Findings and bounded correction

| ID | Actual evidence | Finding / implication | AC | Disposition |
| --- | --- | --- | --- | --- |
| F01 | [Evidence-only staging run 38096973351](https://github.com/oborskyivitalii/oborskyivitalii/actions/runs/38096973351), static job 114345272116 | Security failed on 195 untriaged candidates. Aggregate admission failed and promotion was skipped. | AC06, AC07, AC08 | Original failure retained; exact correction below. |
| F02 | Hashed-only scanner artifact 11686741071; canonical producer/snapshot/preview/offline checks; actual Git objects and raw archive | All 195 values are proved public checksum/object identities: 187 generated values and eight evidence identities. Zero unknowns. Entropy alone was not used as proof. | AC06, AC07 | Append exact path/type/hashed-value dispositions to the existing reviewed ledger. Independent review remains pending. |
| F03 | Existing ledger 1,983,925 bytes; unchanged RI limit 2,000,000 | Appending readable records would exceed the current bound. | AC07 | Compact JSON whitespace only; preserve all 3,791 prior records as identical parsed data and the frozen baseline as identical bytes. Result: 3,986 records, 1,893,278 bytes. |
| F04 | Verified browser artifact 11686736478 and public artifact 11686880556 | Bounded browser/performance, lint and advisory checks passed on the failed aggregate candidate. They cannot turn the security failure into a pass. | AC04, AC06, AC08 | Retain observations and run a fresh complete bounded profile on the corrected clean head. |

The only scanner input correction is the exact existing-ledger append. Runtime,
public bytes, scanner implementation/rules, workflows, dependencies, budgets,
frozen baseline and mandatory acceptance boundaries remain unchanged.
The ledger's metadata explicitly labels the additions as self-review with
independent review pending. Earlier records retain their original values/reasons;
formatting is not a new disposition.

## Proof and failed-run identities

[Complete proof inventory](2026-10-11-security-proof.json.gz) records every exact
path, line, rule, scanner hash, recovered public hex value and proof owner.
Its compressed SHA256 is
`d6fbca1604b95906c4d45154234f2d8753d4756f103de1b13b2dac455b8abb1f`.
[Inert collector](2026-10-11-security-collector.txt) preserves the one-off
classification/append procedure and original scratch paths; it is historical
evidence, not maintained tooling or an independently reviewed scanner exception.

The existing `triage-engine-checksums.cjs` proof recomputes build/revision,
snapshot, all canonical previews and fresh offline-bundle identities. It does
not modify the historical baseline here. Additional proofs compute the retained
raw archive SHA256, reproduce actual Git commit/tree object IDs from their raw
object bytes, and regenerate both public manifests and authored Color identity.
The regenerated Color manifest equals all **30** downloaded CI public files.
Every candidate is matched back to its original line and scanner SHA1 value.
Unknown path/type/value or an ambiguous match fails the collector.

| Failed-run artifact | ID | ZIP SHA256 |
| --- | --- | --- |
| Static raw reports | 11686741071 | `ed2e10a6af429d2182bbb7cc83dda4f09d7a675560ba97fcc12d336c50f24d51` |
| Public Color bytes | 11686880556 | `e2c5d8eaeb4a1d05ef7ff487a1e294772ea7e735f340d9482cb31d3d182e4e44` |
| Bounded browser/performance reports | 11686736478 | `5e049e2ae8d367e2ee4972a1e72bb21b47a7a2adacee88c578a81f866e1140a1` |
| Failed aggregate manifest | 11687170765 | `ad384bf6fd8be36465e4c9b8aa38724111f6e8fb39301a7275a411d623dcd2c4` |

Color public digest remains
`161c9a829575444f523bcdad5c13dfdfff623bfc5d9295e27c6b5cc06250e269`;
authored Color runtime remains
`fb3dac5b0fcf811de02433da78122e6b4cd974ceb9924c315e7f88c9ba205e89`.

## Tasks and acceptance evidence

| Task | Owner / expected behavior | Check | Status |
| --- | --- | --- | --- |
| T01 | Existing `secrets-reviewed.json`; exact 195-value append, all prior data preserved, original baseline bytes preserved | Recompute every value, compare prior prefix, enforce unchanged byte bound | Prepared and self-verified; independent review pending |
| T02 | Same PR; current raw tracked-text scan and exact clean-head profile | Basic, format/style, RI/coupling, owning acceptance policy, security and fresh bounded hosted profile | Results and final immutable refs recorded in the issue/PR dated handoff |
| T03 | Existing test/profile owners | Keep controller negatives and hosted staging coverage; add no duplicate test suite for a ledger append | Existing route retained |

Applicable CS01/04/05/08/09/10 cover the existing data owner, readable exact
records, unchanged failure rules, source binding and current routes. The existing
controller behavior and CS06/07 runtime implementation are unchanged.

| AC | Observed check | Result / exact binding | Remaining gate |
| --- | --- | --- | --- |
| AC01 | Original plan plus transferred #70 criteria | Delivered; see [continuation](2026-10-11-continuation.md) | No change to original whole-criterion status |
| AC02–03 | Prior implementation source and focused render evidence | Same identified public bytes; no runtime change in this follow-up | Independent source/visual review |
| AC04–05 | Hosted Chromium153/Firefox155 all-route journeys, 1440/390 widths, failure/navigation/analytics; four actual local document Back reloads | Bounded profile passed at `dbb5802`; real bfcache remains unproved (`persisted=false`) | Actual bfcache, native find menu and required physical devices |
| AC06 | Two CPU4× representative route samples, four cold/warm flights, two mobile Lighthouse trials; original paired entry samples | Bounded performance passed at `dbb5802`; no full soak performed | Full matching cost/device admission and corrected-head aggregate |
| AC07 | Basic/source/RI/acceptance CI plus full tracked security scan | First source CI passed; first deeper security/aggregate failed; exact 195-value correction prepared | Fresh exact corrected-head checks, independent disposition review |
| AC08 | Same Draft PR and evidence-only staging route | Consolidation done; failed admission retained; no promotion/merge | Remaining whole-AC evidence and maintainer delivery decision |

All nine transferred #70 criteria and the primary AC02–08 remain unchecked.
Current-source automated passes cannot supply the remaining external gates.

## Issue synopsis

Continue #69/#71 after consolidating duplicate #70. The first deeper profile
passed browser/performance/lint/advisories and failed security on 195 exact public
checksums. Retain that failure, append only source-proved fingerprints, preserve
all earlier dispositions and bounds, then record fresh corrected-head CI and
bounded admission in the same issue/PR. Independent/device/bfcache/full-cost and
merge/release gates remain open.
