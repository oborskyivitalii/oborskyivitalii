# Issue 69 — 2026-10-11 independent checksum-disposition review

Owner: [#69](https://github.com/oborskyivitalii/oborskyivitalii/issues/69).
Execution: [Draft PR #71](https://github.com/oborskyivitalii/oborskyivitalii/pull/71).
Reviewer: independently delegated AI source-review agent, separate from the
triage/ledger author. This is an exact false-positive disposition review, not
an independent security audit or deployment approval.

Inspected input is the dirty prepared sequenced-transition continuation identified
in [the implementation review](2026-10-11-sequenced-review.md). The raw full scan
was retained at `issue69-static-reports/detect-secrets.json` in the task workspace.
The original scanner run stopped at stale RI verification; that failed admission
is preserved and does not become a pass through ledger correction.

## Intent and acceptance

AC07/AC08 require canonical source ownership, unchanged scanner boundaries and
honest current-source evidence. Admit only exact path/rule/hashed-value candidates
whose actual public checksum meaning is independently recomputed. Preserve every
prior disposition and the frozen baseline. Do not append dynamic RI/CI values,
relax scanner rules, expand path exemptions or infer acceptance from entropy.

## Findings

| ID | Evidence and actual review | AC | Disposition |
| --- | --- | --- | --- |
| S01 | Independently executed the canonical proof helper in read-only mode: cold source/output check, snapshot closure, exact previews, offline bundle check and pinned parity inputs. All 187 non-RI generated candidates recovered one unique public hex value on their actual scanner line; its SHA1 matched the scanner token and the value belonged to the independently regenerated public set. | AC07 | Exact public-checksum false positives; all 187 final appended identities verified. |
| S02 | Independently walked both final Base/Color public trees, recomputed every file SHA256, raw/gzip size and ordered manifest digest, and matched the complete saved manifests and browser-summary identities. Recomputed the commit and tree SHA1 from actual Git object headers and raw bytes, verified the commit's tree and current HEAD, then matched all four distinct summary candidates to their exact scanner lines/tokens. | AC07, AC08 | Four exact public artifact/Git false positives verified. These remain dirty prepared local evidence, not clean CI or hosted evidence. |
| S03 | Final ledger contains exactly the 191 proved new path/rule/hashed-value identities, no duplicates or extra appended identities. The prior 3,986 records remain data-identical in their original order. The frozen baseline remains byte-identical to both committed HEAD and the pre-append backup. All earlier metadata/history is preserved before the appended scope sentence. | AC07, AC08 | Final bounded append verified: 4,177 records, 1,959,306 bytes within the unchanged 2,000,000-byte limit. |
| S04 | Independently compared every proof-archive identity, path, scanner line, rule and recovered value to the recomputation, including its source bindings, prior-ledger identity, baseline and raw-report binding. Scanner implementation, security rules, proof helper and budgets are byte-identical to committed HEAD. | AC07, AC08 | Exact archive mapping and unchanged scanner ownership verified. |
| S05 | Dynamic RI/CI candidate identities are excluded from this ledger route and remain admitted only by the existing scanner's exact current-source proof after RI/CI verification. Full security failed at stale RI in the first run. | AC07, AC08 | Preserve failure; root owns fresh complete current-source security admission. |

## Decisions

The authorized runtime continuation necessarily changes public generated hashes;
this bounded exact disposition follows the existing owner/ledger route. No scanner
implementation, rule, dependency, budget, frozen baseline or runtime source was
edited by this reviewer. The earlier 195-value disposition history remains
unchanged; this review does not silently relabel its prior self-review as
independent review of those historical values.

## Execution and acceptance evidence

| Task / check | Result | Source / remaining gate |
| --- | --- | --- |
| Independently recompute current generated candidates | 187/187 pass: 32 docs, 135 generated preview/bundle metadata, 20 output-lock identities; one exact rule type | Raw full-scan findings and current canonical producers/public bytes |
| Independently recompute final evidence candidates | 4/4 pass: two actual public-tree manifest digests and two raw Git-object identities | Final Base/Color v3 public directories, saved manifests, browser summary and Git objects |
| Verify final ledger append | 191/191 exact new identities; prior 3,986-record ordered prefix and metadata/history preserved | Current ledger and pre-append backup, independently matched to committed HEAD |
| Verify frozen baseline and unchanged scanner owner | Final byte comparisons pass | Baseline, scanners, security rules, proof helper and budgets versus committed HEAD |
| Verify final proof archive | 191/191 exact identity/value/line mappings and all archived source/input bindings pass | [Bounded triage proof](2026-10-11-v3-security-proof.json.gz) |
| Fresh full security / RI admission | Pending | Root must preserve the first failure and rerun on reconciled exact source |

The generated-value proof does not cover unknown credential-like values. All
three non-generated verification boundaries remain: independent exact evidence
identity proof, unchanged historical records/baseline, and fresh complete scanner
admission. Source and runtime review, user visual approval, physical-device,
actual bfcache, matching cost, merge and production gates remain separate.

## Issue synopsis

Independent read-only recomputation proved all 191 new non-RI scanner candidates
as exact public checksums/Git identities. Final bounded ledger append, historical
prefix, frozen baseline, unchanged scanner/rules/budgets and proof-archive mapping
all pass. Retain the stale-RI failed run and obtain fresh complete security
admission after current-source reconciliation.
